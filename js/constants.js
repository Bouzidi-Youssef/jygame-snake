export const DIRECTIONS = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
};

export const OPPOSITE_DIRECTIONS = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

export const GAME_STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  PAUSED: "paused",
  GAMEOVER: "gameover",
  STAGE_COMPLETE: "stage_complete",
};

export const MODES = {
  CLASSIC: "classic",
  STAGE: "stage",
};

export const DEFAULTS = {
  COLS: 21,
  ROWS: 15,
  TICK_RATE: 80,
  INITIAL_SNAKE_LENGTH: 3,
};

export const DIFFICULTIES = {
  SLUG: { TICK_RATE: 150, LABEL: "Slug" },
  WORM: { TICK_RATE: 110, LABEL: "Worm" },
  PYTHON: { TICK_RATE: 80, LABEL: "Python" },
};

export const CELL = 28;

export const COLOR_GREEN_BG = "#9bba5a";
export const COLOR_GREEN_DARK = "#272f16";
