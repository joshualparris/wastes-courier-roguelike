export const SceneKeys = {
  Title: "Title",
  Overworld: "Overworld",
  Run: "Run",
  Museum: "Museum",
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
