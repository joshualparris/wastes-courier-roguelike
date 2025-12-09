import Phaser from "phaser";
import { OverworldScene } from "./scenes/OverworldScene";
import { RunScene } from "./scenes/RunScene";
import { MuseumScene } from "./scenes/MuseumScene";

export function createGame(parent: string) {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#0b0f14",
    scene: [OverworldScene, RunScene, MuseumScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 540,
    },
    render: {
      pixelArt: true,
      antialias: false,
    },
  };

  return new Phaser.Game(config);
}
