import Phaser from "phaser";
import { GameConstants } from "../constants";

export type ActorKind = "player" | "enemy";

export type Actor = {
  id: string;
  kind: ActorKind;
  x: number;
  y: number;
  rect: Phaser.GameObjects.Rectangle;
  hp: number;
  maxHp: number;
  atk: number;
};

export function createPlayerActor(
  scene: Phaser.Scene,
  x: number,
  y: number,
  worldX: number,
  worldY: number
): Actor {
  const rect = scene.add
    .rectangle(worldX, worldY, GameConstants.TILE_SIZE * 0.72, GameConstants.TILE_SIZE * 0.72, 0x52d6ff)
    .setStrokeStyle(2, 0x0b0f14);

  return {
    id: "player",
    kind: "player",
    x,
    y,
    rect,
    hp: GameConstants.PLAYER_HP,
    maxHp: GameConstants.PLAYER_HP,
    atk: GameConstants.PLAYER_ATK,
  };
}

export function createEnemyActor(
  scene: Phaser.Scene,
  id: string,
  x: number,
  y: number,
  worldX: number,
  worldY: number
): Actor {
  const rect = scene.add
    .rectangle(worldX, worldY, GameConstants.TILE_SIZE * 0.72, GameConstants.TILE_SIZE * 0.72, 0xff5c7a)
    .setStrokeStyle(2, 0x0b0f14);

  return {
    id,
    kind: "enemy",
    x,
    y,
    rect,
    hp: GameConstants.ENEMY_HP,
    maxHp: GameConstants.ENEMY_HP,
    atk: GameConstants.ENEMY_ATK,
  };
}
