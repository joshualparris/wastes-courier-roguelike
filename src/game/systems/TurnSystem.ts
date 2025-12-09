import type { Actor } from "../models/Actor";

type Phase = "PLAYER" | "AI_BUSY";

export class TurnSystem {
  private actors: Actor[] = [];
  private turnIndex = 0;
  phase: Phase = "PLAYER";

  reset(actors: Actor[]) {
    this.actors = actors;
    this.turnIndex = 0;
    this.phase = "PLAYER";
  }

  current(): Actor | undefined {
    return this.actors[this.turnIndex];
  }

  getById(id: string): Actor | undefined {
    return this.actors.find((a) => a.id === id);
  }

  next() {
    if (this.actors.length === 0) return;
    this.turnIndex = (this.turnIndex + 1) % this.actors.length;
  }

  removeActor(actorId: string) {
    const idx = this.actors.findIndex((a) => a.id === actorId);
    if (idx === -1) return;
    this.actors.splice(idx, 1);
    if (this.turnIndex >= this.actors.length) {
      this.turnIndex = 0;
    }
  }
}
