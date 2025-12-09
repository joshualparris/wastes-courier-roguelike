export const GameConstants = {
  // Grid
  GRID_WIDTH: 20,
  GRID_HEIGHT: 12,
  TILE_SIZE: 36,

  // Player stats
  PLAYER_HP: 12,
  PLAYER_ATK: 3,

  // Enemy stats
  ENEMY_HP: 6,
  ENEMY_ATK: 2,
  ENEMY_COUNT: 4,

  // Oxygen system (future use)
  OXYGEN_START: 30,
  OXYGEN_TICK: -1,
  OXYGEN_CANISTER: 10,

  // Seeds
  FIXED_SEED_WIN: 12345,
  FIXED_SEED_LOSS: 67890,
} as const;
