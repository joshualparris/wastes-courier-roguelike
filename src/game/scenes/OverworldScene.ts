import Phaser from "phaser";
import { SceneKeys } from "../SceneKeys";

type OverworldData = { result?: "victory" | "defeat" };

export class OverworldScene extends Phaser.Scene {
  private lastResult: "victory" | "defeat" | null = null;

  constructor() {
    super(SceneKeys.Overworld);
  }

  init(data: OverworldData) {
    if (data.result === "victory" || data.result === "defeat") {
      this.lastResult = data.result;
    }
  }

  create() {
    const { width } = this.scale;

    this.add.text(20, 20, "OVERWORLD", { fontSize: "28px", color: "#ffffff" });
    if (this.lastResult) {
      const label = this.lastResult === "victory" ? "SUCCESS" : "FAILURE";
      const color = this.lastResult === "victory" ? "#8df5b5" : "#ff6b6b";
      this.add.text(20, 55, `Previous Run: ${label}`, { fontSize: "18px", color });
    }

    this.add.text(
      20,
      90,
      ["Click anywhere or press:", "  [1] Start Run (Starship stub)", "  [2] Go to Museum (stub)"].join("\n"),
      { fontSize: "18px", color: "#dddddd" }
    );

    this.input.on("pointerdown", () => {
      this.scene.start(SceneKeys.Run, { entry: "overworld" });
    });

    this.input.keyboard?.on("keydown-ONE", () => {
      this.scene.start(SceneKeys.Run, { entry: "overworld" });
    });

    this.input.keyboard?.on("keydown-TWO", () => {
      this.scene.start(SceneKeys.Museum, { entry: "overworld" });
    });

    // tiny visual marker
    this.add.rectangle(width - 40, 40, 20, 20, 0x00ff99);
  }
}
