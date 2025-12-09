import Phaser from "phaser";
import { GridSystem } from "./GridSystem";
import { TurnSystem } from "./TurnSystem";
import type { Actor } from "../models/Actor";

export class CombatSystem {
  private scene: Phaser.Scene;
  private grid: GridSystem;
  private turn: TurnSystem;
  private tileToWorldCenter: (x: number, y: number) => { x: number; y: number };
  private onPlayerDeath: () => void;
  private onAnyHpChanged: () => void;

  constructor(
    scene: Phaser.Scene,
    grid: GridSystem,
    turn: TurnSystem,
    tileToWorldCenter: (x: number, y: number) => { x: number; y: number },
    onPlayerDeath: () => void,
    onAnyHpChanged: () => void
  ) {
    this.scene = scene;
    this.grid = grid;
    this.turn = turn;
    this.tileToWorldCenter = tileToWorldCenter;
    this.onPlayerDeath = onPlayerDeath;
    this.onAnyHpChanged = onAnyHpChanged;
  }

  attack(attacker: Actor, target: Actor) {
    target.hp -= attacker.atk;
    this.showFloatingDamage(target.x, target.y, attacker.atk);

    const originalFill = target.rect.fillColor;
    target.rect.setFillStyle(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (target.rect.active) {
        target.rect.setFillStyle(originalFill);
      }
    });

    this.onAnyHpChanged();

    if (target.hp <= 0) {
      this.kill(target);
    }
  }

  kill(actor: Actor) {
    actor.rect.setFillStyle(0xff0000);

    this.scene.tweens.add({
      targets: actor.rect,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 200,
      ease: "Back.easeIn",
      onComplete: () => {
        actor.rect.destroy();
        this.grid.clearActorAt(actor.x, actor.y);
        this.turn.removeActor(actor.id);

        if (actor.kind === "player") {
          this.onPlayerDeath();
        }
      },
    });
  }

  private showFloatingDamage(tileX: number, tileY: number, damage: number) {
    const worldPos = this.tileToWorldCenter(tileX, tileY);

    const damageText = this.scene.add
      .text(worldPos.x, worldPos.y, `-${damage}`, {
        fontSize: "18px",
        color: "#ff6b6b",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0.5);

    this.scene.tweens.add({
      targets: damageText,
      y: worldPos.y - 30,
      alpha: 0,
      duration: 800,
      ease: "Cubic.easeOut",
      onComplete: () => damageText.destroy(),
    });
  }
}
