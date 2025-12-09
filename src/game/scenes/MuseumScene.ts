import Phaser from "phaser";
import { SceneKeys } from "../SceneKeys";

type MuseumData = { entry?: string };

export class MuseumScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Museum);
  }

  init(data: MuseumData) {
    this.registry.set("museumEntry", data.entry ?? "unknown");
  }

  create() {
    const entry = this.registry.get("museumEntry") as string;

    this.add.text(20, 20, "MUSEUM (STUB)", {
      fontSize: "28px",
      color: "#ffffff",
    });

    this.add.text(20, 70, `Entry: ${entry}`, {
      fontSize: "18px",
      color: "#dddddd",
    });

    this.add.text(
      20,
      110,
      ["Press:", "  [O] Back to Overworld", "  [R] Go to Run"].join("\n"),
      { fontSize: "18px", color: "#dddddd" }
    );

    this.input.keyboard?.on("keydown-O", () => {
      this.scene.start(SceneKeys.Overworld);
    });

    this.input.keyboard?.on("keydown-R", () => {
      this.scene.start(SceneKeys.Run, { entry: "museum" });
    });
  }
}
