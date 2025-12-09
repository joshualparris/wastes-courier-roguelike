export const SceneKeys = {
  Overworld: "Overworld",
  Run: "Run",
  Museum: "Museum",
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
