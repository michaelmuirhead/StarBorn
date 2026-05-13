export const SAVE_VERSION = 1;
export const SAVE_KEY = "starborn.save.v1";

export const MAP_RADIUS = 4;
export const SOL_MS = 3000;

export const STARTING_RESOURCES = {
  credits: 1000,
  food: 400,
  water: 400,
  oxygen: 400,
  power: 0,
  minerals: 200,
  alloys: 0,
  research: 0,
} as const;

export const STARTING_POPULATION = 12;
export const STARTING_HOUSING = 12;
export const STARTING_MORALE = 70;

export const POP_GROWTH_PER_SOL = 0.04;
export const POP_DECAY_PER_SOL = 0.06;

export const PER_COLONIST = {
  food: 0.6,
  water: 0.5,
  oxygen: 0.5,
};
