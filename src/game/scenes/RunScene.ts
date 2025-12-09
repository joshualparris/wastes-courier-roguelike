import Phaser from "phaser";
import { SceneKeys } from "../SceneKeys";
import { GameConstants } from "../constants";
import { SeededRNG } from "../utils/SeededRNG";
import { Rooms } from "../content/rooms";
import type { RoomTileChar } from "../content/rooms";
import { createEnemyActor, createPlayerActor } from "../models/Actor";
import type { Actor } from "../models/Actor";
import { GridSystem } from "../systems/GridSystem";
import type { Tile as GridTile } from "../systems/GridSystem";
import { TurnSystem } from "../systems/TurnSystem";
import { CombatSystem } from "../systems/CombatSystem";

type RunData = { entry?: string; seed?: number };

export class RunScene extends Phaser.Scene {
  private readonly gridW = GameConstants.GRID_WIDTH;
  private readonly gridH = GameConstants.GRID_HEIGHT;
  private readonly tileSize = GameConstants.TILE_SIZE;

  private originX = 0;
  private originY = 0;
  private gridGfx!: Phaser.GameObjects.Graphics;

  private grid = new GridSystem();
  private turn = new TurnSystem();
  private combat!: CombatSystem;
  private phase: "PLAYER" | "AI_BUSY" = "PLAYER";

  private seed!: number;
  private rng!: SeededRNG;

  private hpText!: Phaser.GameObjects.Text;
  private oxygenText!: Phaser.GameObjects.Text;
  private turnCountText!: Phaser.GameObjects.Text;
  private seedText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;

  private oxygen: number = GameConstants.OXYGEN_START;
  private turnCount: number = 0;

  private exitPos!: { x: number; y: number };
  private oxygenPickups = new Set<string>();
  private oxygenPickupSprites = new Map<string, Phaser.GameObjects.GameObject>();
  private exitMarker?: Phaser.GameObjects.Graphics;

  private victoryShown = false;

  constructor() {
    super(SceneKeys.Run);
  }

  init(data: RunData) {
    this.registry.set("runEntry", data.entry ?? "unknown");
    this.seed = data.seed ?? Date.now();
    this.rng = new SeededRNG(this.seed);
    this.oxygen = GameConstants.OXYGEN_START;
    this.turnCount = 0;
    this.victoryShown = false;
  }

  create() {
    const entry = this.registry.get("runEntry") as string;

    this.input.keyboard?.on("keydown-O", () => this.scene.start(SceneKeys.Overworld));
    this.input.keyboard?.on("keydown-M", () => this.scene.start(SceneKeys.Museum, { entry: "run" }));

    // Layout: centre grid with room for HUD/header
    const gridPxW = this.gridW * this.tileSize;
    const gridPxH = this.gridH * this.tileSize;
    this.originX = Math.floor((this.scale.width - gridPxW) / 2);
    this.originY = Math.floor((this.scale.height - gridPxH) / 2) + 30;

    this.combat = new CombatSystem(
      this,
      this.grid,
      this.turn,
      (x, y) => this.tileToWorldCenter(x, y),
      () => this.handlePlayerDeath(),
      () => this.updateHUD()
    );

    this.add.text(20, 18, "RUN: STARSHIP", {
      fontSize: "22px",
      color: "#ffffff",
    });

    this.add.text(20, 44, `Entry: ${entry}`, {
      fontSize: "14px",
      color: "#bbbbbb",
    });

    const hudX = 20;
    let hudY = 70;

    this.turnText = this.add.text(hudX, hudY, "", {
      fontSize: "14px",
      color: "#dddddd",
    });
    hudY += 20;

    this.hpText = this.add.text(hudX, hudY, "", {
      fontSize: "16px",
      color: "#ff6b6b",
    });
    hudY += 22;

    this.oxygenText = this.add.text(hudX, hudY, "", {
      fontSize: "16px",
      color: "#4dabf7",
    });
    hudY += 22;

    this.turnCountText = this.add.text(hudX, hudY, "", {
      fontSize: "16px",
      color: "#aaaaaa",
    });
    hudY += 22;

    this.seedText = this.add.text(hudX, hudY, "", {
      fontSize: "14px",
      color: "#666666",
    });
    hudY += 30;

    this.add.text(
      hudX,
      hudY,
      ["Arrow/WASD: Move", "SPACE: Wait", "R: New run", "F: Test seed", "O: Overworld", "M: Museum"].join("\n"),
      {
        fontSize: "12px",
        color: "#7d8590",
      }
    );

    const { roomId, playerSpawn, enemySpawns } = this.loadRoomFromSeed();
    this.add.text(20, this.scale.height - 20, `Room: ${roomId}`, { fontSize: "12px", color: "#666666" });

    this.gridGfx = this.add.graphics();
    this.drawGrid();
    this.drawMarkers();

    this.spawnActors(playerSpawn, enemySpawns);

    this.input.keyboard?.on("keydown-R", () => {
      this.scene.restart({ seed: Date.now() });
    });

    this.input.keyboard?.on("keydown-F", () => {
      this.scene.restart({ seed: GameConstants.FIXED_SEED_WIN });
    });

    // Input: single-step movement on key press
    this.input.keyboard?.on("keydown", (ev: KeyboardEvent) => {
      if (this.phase !== "PLAYER" || this.victoryShown) return;

      const key = ev.key.toLowerCase();
      const dir = this.keyToDir(key);
      if (!dir) return;

      const player = this.turn.getById("player");
      if (!player) return;

      if (dir.type === "wait") {
        this.endPlayerTurn();
        return;
      }

      const moved = this.tryMove(player, dir.dx, dir.dy);
      if (moved) {
        this.endPlayerTurn();
      }
    });

    this.phase = "PLAYER";
    this.updateHUD();
    this.updateTurnText();
  }

  // ---------- Map ----------
  private key(x: number, y: number) {
    return this.grid.key(x, y);
  }

  private tileToWorldCenter(x: number, y: number) {
    return {
      x: this.originX + x * this.tileSize + this.tileSize / 2,
      y: this.originY + y * this.tileSize + this.tileSize / 2,
    };
  }

  private shuffleInPlace<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.rng.nextInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  private loadRoomFromSeed() {
    const roomIndex = Math.abs(this.seed) % Rooms.length;
    const room = Rooms[roomIndex];

    if (room.layout.length !== GameConstants.GRID_HEIGHT) {
      throw new Error(`Room ${room.id} height mismatch`);
    }

    const tiles: GridTile[] = new Array(GameConstants.GRID_WIDTH * GameConstants.GRID_HEIGHT).fill(0);
    this.oxygenPickups.clear();

    let playerSpawn: { x: number; y: number } | null = null;
    let exitSpawn: { x: number; y: number } | null = null;
    const enemySpawns: Array<{ x: number; y: number }> = [];

    for (let y = 0; y < GameConstants.GRID_HEIGHT; y++) {
      const row = room.layout[y];
      if (row.length !== GameConstants.GRID_WIDTH) {
        throw new Error(`Room ${room.id} row ${y} width mismatch`);
      }

      for (let x = 0; x < GameConstants.GRID_WIDTH; x++) {
        const ch = row[x] as RoomTileChar;

        if (ch === "#") {
          tiles[this.grid.idx(x, y)] = 1;
          continue;
        }

        if (ch === "D") {
          tiles[this.grid.idx(x, y)] = 2;
          continue;
        }

        if (ch === "E") {
          tiles[this.grid.idx(x, y)] = 3;
          exitSpawn = { x, y };
          continue;
        }

        tiles[this.grid.idx(x, y)] = 0;

        if (ch === "P") playerSpawn = { x, y };
        if (ch === "X") enemySpawns.push({ x, y });
        if (ch === "O") this.oxygenPickups.add(this.key(x, y));
      }
    }

    if (!playerSpawn) throw new Error(`Room ${room.id} missing player spawn P`);
    if (!exitSpawn) throw new Error(`Room ${room.id} missing exit E`);

    this.exitPos = exitSpawn;
    this.grid.setTiles(tiles);
    return { roomId: room.id, playerSpawn, enemySpawns };
  }

  private drawGrid() {
    this.gridGfx.clear();

    const floorFill = 0x121a24;
    const wallFill = 0x2a3340;
    const doorFill = 0x9c6b30;
    const exitFill = 0x00c853;
    const stroke = 0x223044;

    for (let y = 0; y < this.gridH; y++) {
      for (let x = 0; x < this.gridW; x++) {
        const wx = this.originX + x * this.tileSize;
        const wy = this.originY + y * this.tileSize;

        const tile = this.grid.getTile(x, y);
        const isWall = this.grid.isWall(x, y);
        const fill =
          tile === 3 ? exitFill : tile === 2 ? doorFill : isWall ? wallFill : floorFill;
        this.gridGfx.fillStyle(fill, 1);
        this.gridGfx.fillRect(wx, wy, this.tileSize, this.tileSize);

        this.gridGfx.lineStyle(1, stroke, 1);
        this.gridGfx.strokeRect(wx, wy, this.tileSize, this.tileSize);
      }
    }
  }

  private drawMarkers() {
    this.oxygenPickupSprites.forEach((m) => m.destroy());
    this.oxygenPickupSprites.clear();
    this.exitMarker?.destroy();

    const exitPos = this.tileToWorldCenter(this.exitPos.x, this.exitPos.y);
    const exitGfx = this.add.graphics();
    exitGfx.fillStyle(0x00c853, 1);
    exitGfx.fillCircle(exitPos.x, exitPos.y, this.tileSize * 0.3);
    exitGfx.lineStyle(2, 0xffffff, 1);
    exitGfx.strokeCircle(exitPos.x, exitPos.y, this.tileSize * 0.3);
    this.exitMarker = exitGfx;

    for (const key of this.oxygenPickups) {
      const [x, y] = key.split(",").map(Number);
      const pos = this.tileToWorldCenter(x, y);
      const circle = this.add.circle(pos.x, pos.y, this.tileSize * 0.25, 0x4dabf7, 0.85);
      circle.setStrokeStyle(1, 0xffffff, 1);
      this.oxygenPickupSprites.set(key, circle);
    }
  }

  // ---------- Actors + Turn Queue ----------
  private spawnActors(playerSpawn: { x: number; y: number }, enemySpawns: { x: number; y: number }[]) {
    const actors: Actor[] = [];
    this.grid.clearOccupancy();

    const playerWorld = this.tileToWorldCenter(playerSpawn.x, playerSpawn.y);
    const player = createPlayerActor(this, playerSpawn.x, playerSpawn.y, playerWorld.x, playerWorld.y);
    actors.push(player);
    this.grid.setActorAt(playerSpawn.x, playerSpawn.y, player.id);

    const shuffled = [...enemySpawns];
    this.shuffleInPlace(shuffled);
    const toSpawn = Math.min(GameConstants.ENEMY_COUNT, shuffled.length);
    for (let i = 0; i < toSpawn; i++) {
      const spawn = shuffled[i];
      const world = this.tileToWorldCenter(spawn.x, spawn.y);
      const enemy = createEnemyActor(this, `enemy-${i}`, spawn.x, spawn.y, world.x, world.y);
      actors.push(enemy);
      this.grid.setActorAt(spawn.x, spawn.y, enemy.id);
    }

    this.turn.reset(actors);
  }

  private actorAt(x: number, y: number): Actor | undefined {
    const id = this.grid.actorIdAt(x, y);
    if (!id) return undefined;
    return this.turn.getById(id);
  }

  private tryMove(actor: Actor, dx: number, dy: number): boolean {
    const nx = actor.x + dx;
    const ny = actor.y + dy;

    if (!this.grid.inside(nx, ny)) return false;

    const targetTile = this.grid.getTile(nx, ny);
    if (targetTile === 2) {
      // Closed door: open it, consume turn
      this.grid.openDoor(nx, ny);
      this.drawGrid();
      return true;
    }

    if (this.grid.isWall(nx, ny)) return false;

    const targetActor = this.actorAt(nx, ny);
    if (targetActor) {
      if (targetActor.kind === actor.kind) return false;
      this.combat.attack(actor, targetActor);
      return true;
    }

    this.grid.moveActor(actor.id, actor.x, actor.y, nx, ny);
    actor.x = nx;
    actor.y = ny;

    const p = this.tileToWorldCenter(actor.x, actor.y);
    actor.rect.setPosition(p.x, p.y);

    if (actor.kind === "player") {
      const tileKey = this.key(actor.x, actor.y);

      if (this.oxygenPickups.has(tileKey)) {
        this.oxygenPickups.delete(tileKey);

        const sprite = this.oxygenPickupSprites.get(tileKey);
        if (sprite) {
          sprite.destroy();
          this.oxygenPickupSprites.delete(tileKey);
        }

        this.oxygen += GameConstants.OXYGEN_CANISTER;
        if (this.oxygen > GameConstants.OXYGEN_START) {
          this.oxygen = GameConstants.OXYGEN_START;
        }
        this.updateHUD();
      }

      if (actor.x === this.exitPos.x && actor.y === this.exitPos.y && !this.victoryShown) {
        this.showVictory();
      }
    }

    return true;
  }

  private handlePlayerDeath() {
    const { width, height } = this.scale;

    const defeatBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    const defeatText = this.add
      .text(width / 2, height / 2 - 40, "DEFEAT", {
        fontSize: "48px",
        color: "#ff6b6b",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const restartText = this.add
      .text(width / 2, height / 2 + 20, "Press R to restart", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Prevent unused variable warnings in case of lint
    defeatBg.setData("tag", "defeat");
    defeatText.setData("tag", "defeat");
    restartText.setData("tag", "defeat");

    this.time.delayedCall(2000, () => {
      this.scene.start(SceneKeys.Overworld, { result: "defeat" });
    });
  }

  private showVictory() {
    this.victoryShown = true;
    this.phase = "AI_BUSY";

    const { width, height } = this.scale;
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    const label = this.add
      .text(width / 2, height / 2 - 20, "ESCAPED (Victory stub)", {
        fontSize: "32px",
        color: "#8df5b5",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(width / 2, height / 2 + 20, "Press R to restart", {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    bg.setDepth(10);
    label.setDepth(11);
    hint.setDepth(11);

    this.time.delayedCall(2000, () => {
      this.scene.start(SceneKeys.Overworld, { result: "victory" });
    });
  }

  private endPlayerTurn() {
    this.applyOxygenTick();

    const playerAlive = !!this.turn.getById("player");
    if (!playerAlive) {
      return;
    }

    this.turnCount++;
    this.updateHUD();

    this.turn.next();
    this.updateTurnText();
    this.beginCurrentTurn();
  }

  private applyOxygenTick() {
    this.oxygen += GameConstants.OXYGEN_TICK;
    if (this.oxygen < 0) this.oxygen = 0;

    const player = this.turn.getById("player");
    if (player && this.oxygen === 0) {
      player.hp -= 1;

      const originalFill = player.rect.fillColor;
      player.rect.setFillStyle(0x4dabf7);
      this.time.delayedCall(120, () => {
        if (player.rect.active) {
          player.rect.setFillStyle(originalFill);
        }
      });

      if (player.hp <= 0) {
        this.combat.kill(player);
        this.updateHUD();
        return;
      }
    }

    this.updateHUD();
  }

  private beginCurrentTurn() {
    const actor = this.turn.current();
    if (!actor) return;

    if (actor.kind === "player") {
      this.phase = "PLAYER";
      this.updateTurnText();
      return;
    }

    this.phase = "AI_BUSY";
    this.updateTurnText();

    const player = this.turn.getById("player");
    if (!player) {
      this.endEnemyTurn();
      return;
    }

    const dx = Math.sign(player.x - actor.x);
    const dy = Math.sign(player.y - actor.y);
    const preferX = Math.abs(dx) >= Math.abs(dy);
    const attempts: Array<[number, number]> = preferX
      ? [
          [dx, 0],
          [0, dy],
        ]
      : [
          [0, dy],
          [dx, 0],
        ];

    for (const [ax, ay] of attempts) {
      if (ax === 0 && ay === 0) continue;
      if (this.tryMove(actor, ax, ay)) break;
    }

    this.time.delayedCall(300, () => {
      this.endEnemyTurn();
    });
  }

  private endEnemyTurn() {
    this.turn.next();
    this.updateTurnText();
    this.beginCurrentTurn();
  }

  private updateTurnText() {
    const actor = this.turn.current();
    if (!actor) {
      this.turnText.setText("");
      return;
    }

    if (actor.kind === "player") {
      this.turnText.setText("Your turn");
    } else {
      this.turnText.setText(`Enemy ${actor.id} turn`);
    }
  }

  private updateHUD() {
    const player = this.turn.getById("player");
    const hpNow = player ? player.hp : 0;
    const hpMax = player ? player.maxHp : GameConstants.PLAYER_HP;

    this.hpText.setText(`HP: ${hpNow}/${hpMax}`);
    this.oxygenText.setText(`O₂: ${this.oxygen}/${GameConstants.OXYGEN_START}`);
    this.turnCountText.setText(`Turn: ${this.turnCount}`);
    this.seedText.setText(`Seed: ${this.seed}`);
  }

  // ---------- Input helpers ----------
  private keyToDir(
    key: string
  ):
    | {
        type: "move";
        dx: number;
        dy: number;
      }
    | { type: "wait" }
    | null {
    if (key === " " || key === "space") return { type: "wait" };

    if (key === "arrowup" || key === "w") return { type: "move", dx: 0, dy: -1 };
    if (key === "arrowdown" || key === "s") return { type: "move", dx: 0, dy: 1 };
    if (key === "arrowleft" || key === "a") return { type: "move", dx: -1, dy: 0 };
    if (key === "arrowright" || key === "d") return { type: "move", dx: 1, dy: 0 };

    return null;
  }
}
