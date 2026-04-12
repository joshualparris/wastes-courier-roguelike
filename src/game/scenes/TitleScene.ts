import Phaser from "phaser";
import { SceneKeys } from "../SceneKeys";

export class TitleScene extends Phaser.Scene {
  private blink?: Phaser.GameObjects.Text;

  constructor() {
    super(SceneKeys.Title);
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Scanline overlay feel
    this.add.rectangle(cx, height / 2, width, height, 0x0b0f14);

    this.add
      .text(cx, 80, "W A S T E S   C O U R I E R", {
        fontSize: "36px",
        color: "#52d6ff",
        fontStyle: "bold",
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 120, "─────────────────────────────────────", {
        fontSize: "14px",
        color: "#223044",
      })
      .setOrigin(0.5);

    const lore = [
      "The starship ARGOS is going dark.",
      "",
      "You are the last courier aboard.",
      "Your cargo: a black box. Destination: Escape Pod C.",
      "",
      "The crew is dead.  The ship is not.",
      "",
      "You have 30 seconds of oxygen.",
      "Every move costs air.",
      "Every enemy costs blood.",
      "",
      "Deliver the package.  Get out.",
    ].join("\n");

    this.add
      .text(cx, 210, lore, {
        fontSize: "15px",
        color: "#c8d6e5",
        align: "center",
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    this.blink = this.add
      .text(cx, 460, "[ PRESS ENTER OR CLICK TO BEGIN ]", {
        fontSize: "16px",
        color: "#52d6ff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, height - 16, "Arrow/WASD to move  ·  SPACE to wait  ·  Reach the EXIT to escape", {
        fontSize: "11px",
        color: "#3d5068",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: this.blink,
      alpha: 0.1,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const start = () => this.scene.start(SceneKeys.Overworld);
    this.input.keyboard?.on("keydown-ENTER", start);
    this.input.keyboard?.on("keydown-SPACE", start);
    this.input.on("pointerdown", start);
  }
}
