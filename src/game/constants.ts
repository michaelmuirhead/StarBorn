export const SAVE_VERSION = 8;
export const SAVE_KEY = "starborn.save.v1";

export const MAP_RADIUS = 4;
export const SOL_MS = 3000;

export const STARTING_RESOURCES = {
  credits: 1000,
  food: 400,
  water: 400,
  oxygen: 400,
  power: 60,
  minerals: 200,
  alloys: 0,
  rare_earths: 0,
  research: 0,
} as const;

export const BASE_STORAGE_CAPS = {
  credits: Infinity,
  food: 500,
  water: 500,
  oxygen: 500,
  power: 50,
  minerals: 400,
  alloys: 300,
  rare_earths: 200,
  research: Infinity,
} as const;

export const STARTING_STRATA = {
  workers: 11,
  specialists: 1,
  soldiers: 0,
} as const;

export const STARTING_HOUSING = 12;
export const STARTING_MORALE = 70;

export const STARTING_LOYALTY = 80;
export const LOYALTY_DRIFT_PER_SOL = -0.05;
export const SPECIALIST_TARGET_RATIO = 0.35;
export const SPECIALIST_TRAINING_CHANCE_PER_LAB = 0.025;

export const POP_GROWTH_PER_SOL = 0.04;
export const POP_DECAY_PER_SOL = 0.06;

export const PER_COLONIST = {
  food: 0.6,
  water: 0.5,
  oxygen: 0.5,
};

// Martian-flavored game year for seasonal cycles. Storm season clusters dust
// storms toward the end of each year.
export const YEAR_SOLS = 100;
export const STORM_SEASON_START = 65;
export const STORM_SEASON_END = 95;

export const FIRST_OFFER_SOL = 6;
export const OFFER_COOLDOWN_MIN = 10;
export const OFFER_COOLDOWN_MAX = 18;
export const OFFER_DURATION_SOLS = 5;

export const ATMOSPHERE_VICTORY = 100;

export const STARTING_AD_YEAR = 2100;
