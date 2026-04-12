import Phaser from "phaser";
import { SceneKeys } from "../SceneKeys";

type MuseumData = { entry?: string };

const LORE: Array<{ threshold: number; text: string }> = [
  { threshold: 0, text: "The ARGOS manifest lists 47 crew. Zero survivors recorded." },
  { threshold: 1, text: "Mission log recovered: \"Courier reached pod. Package secured.\"" },
  { threshold: 3, text: "Intercepted signal: \"They keep coming back. How are they still breathing?\"" },
  { threshold: 5, text: "Archive fragment: \"The black box contains coordinates. Don't let them have it.\"" },
];

export class MuseumScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Museum);
  }

  init(data: MuseumData) {
    this.registry.set("museumEntry", data.entry ?? "unknown");
  }

  create() {
    const { width } = this.scale;
    const cx = width / 2;

    const runs: number = this.registry.get("stats_runs") ?? 0;
    const victories: number = this.registry.get("stats_victories") ?? 0;
    const defeats: number = this.registry.get("stats_defeats") ?? 0;
    const kills: number = this.registry.get("stats_kills") ?? 0;
    const bestTurns: number = this.registry.get("stats_bestTurns") ?? 0;

    this.add
      .text(cx, 28, "M I S S I O N   A R C H I V E", {
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

    if (runs === 0) {
      this.add
        .text(cx, 200, "No missions on record.\nBegin your first run.", {
          fontSize: "18px",
          color: "#7d8590",
          align: "center",
        })
        .setOrigin(0.5);
    } else {
      const stats: Array<[string, string]> = [
        ["Missions Flown", `${runs}`],
        ["Delivered (Victory)", `${victories}`],
        ["KIA (Defeat)", `${defeats}`],
        ["Enemies Killed", `${kills}`],
        ["Best Run (turns)", `${bestTurns}`],
        ["Survival Rate", `${Math.round((victories / runs) * 100)}%`],
      ];

      stats.forEach(([label, value], i) => {
        const y = 90 + i * 36;
        const valColor = label.includes("Delivered") ? "#8df5b5" : label.includes("KIA") ? "#ff6b6b" : "#ffffff";
        this.add.text(80, y, label, { fontSize: "16px", color: "#8899aa" });
        this.add.text(width - 80, y, value, { fontSize: "16px", color: valColor, fontStyle: "bold" }).setOrigin(1, 0);
      });

      // Lore fragment
      const loreLine = [...LORE].reverse().find((l) => victories >= l.threshold);
      if (loreLine) {
        this.add
          .text(cx, 322, "─────────────────────────────────────────────────────", {
            fontSize: "13px",
            color: "#223044",
          })
          .setOrigin(0.5);

        this.add
          .text(cx, 344, "RECOVERED LOG FRAGMENT:", {
            fontSize: "12px",
            color: "#3d5068",
          })
          .setOrigin(0.5);

        this.add
          .text(cx, 368, `"${loreLine.text}"`, {
            fontSize: "14px",
            color: "#7d8590",
            fontStyle: "italic",
            wordWrap: { width: width - 80 },
            align: "center",
          })
          .setOrigin(0.5);
      }
    }

    this.add
      .text(cx, 460, "─────────────────────────────────────────────────────", {
        fontSize: "13px",
        color: "#223044",
      })
      .setOrigin(0.5);

    this.add.text(40, 480, "[O]  Return to Deck Map", { fontSize: "14px", color: "#7d8590" });
    this.add.text(40, 504, "[T]  Return to Title", { fontSize: "14px", color: "#7d8590" });

    this.input.keyboard?.on("keydown-O", () => this.scene.start(SceneKeys.Overworld));
    this.input.keyboard?.on("keydown-T", () => this.scene.start(SceneKeys.Title));
    this.input.on("pointerdown", () => this.scene.start(SceneKeys.Overworld));
  }
}
