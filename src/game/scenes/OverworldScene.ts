import Phaser from "phaser";
import { SceneKeys } from "../SceneKeys";

type OverworldData = { result?: "victory" | "defeat" };

const MISSIONS = [
  {
    key: "CORRIDOR RUN",
    diff: "Easy",
    flavor: "Main access shaft. Thin patrols — but the walls are close.",
  },
  {
    key: "ENGINE ROOM",
    diff: "Medium",
    flavor: "Burst pipes and jammed doors. Every step costs extra O\u2082.",
  },
  {
    key: "CARGO BAY",
    diff: "Hard",
    flavor: "Wide. Dark. Something has been eating the cargo.",
  },
];

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
    const cx = width / 2;

    this.add
      .text(cx, 28, "A R G O S   D E C K   M A P", {
        fontSize: "26px",
        color: "#52d6ff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 58, "─────────────────────────────────────────────────────", {
        fontSize: "13px",
        color: "#223044",
      })
      .setOrigin(0.5);

    // Last result badge
    if (this.lastResult) {
      const label = this.lastResult === "victory" ? "LAST RUN: DELIVERED ✓" : "LAST RUN: KIA  ✗";
      const color = this.lastResult === "victory" ? "#8df5b5" : "#ff6b6b";
      this.add.text(cx, 80, label, { fontSize: "14px", color }).setOrigin(0.5);
    }

    this.add.text(40, 112, "SELECT MISSION:", { fontSize: "14px", color: "#7d8590" });

    MISSIONS.forEach((m, i) => {
      const y = 142 + i * 80;
      const numColor = "#52d6ff";
      const diffColors: Record<string, string> = { Easy: "#8df5b5", Medium: "#ffd43b", Hard: "#ff6b6b" };

      this.add.text(40, y, `[${i + 1}]`, { fontSize: "20px", color: numColor, fontStyle: "bold" });
      this.add.text(80, y, m.key, { fontSize: "20px", color: "#ffffff", fontStyle: "bold" });
      this.add.text(80 + 220, y, m.diff, { fontSize: "14px", color: diffColors[m.diff] ?? "#aaaaaa" });
      this.add.text(80, y + 26, m.flavor, { fontSize: "13px", color: "#8899aa" });
    });

    this.add
      .text(cx, 400, "─────────────────────────────────────────────────────", {
        fontSize: "13px",
        color: "#223044",
      })
      .setOrigin(0.5);

    this.add.text(40, 420, "[M]  Mission Archive", { fontSize: "14px", color: "#7d8590" });
    this.add.text(40, 444, "[T]  Return to Title", { fontSize: "14px", color: "#7d8590" });

    const launch = (roomIdx: number) => {
      const base = Date.now();
      const seed = base - (base % 3) + roomIdx;
      this.scene.start(SceneKeys.Run, { entry: "overworld", seed });
    };

    this.input.keyboard?.on("keydown-ONE", () => launch(0));
    this.input.keyboard?.on("keydown-TWO", () => launch(1));
    this.input.keyboard?.on("keydown-THREE", () => launch(2));
    this.input.keyboard?.on("keydown-M", () => this.scene.start(SceneKeys.Museum, { entry: "overworld" }));
    this.input.keyboard?.on("keydown-T", () => this.scene.start(SceneKeys.Title));
  }
}
