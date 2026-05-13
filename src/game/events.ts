import type { ActiveEvent } from "./types";

export interface EventDef {
  id: string;
  name: string;
  description: string;
  weight: number;
  minSol: number;
  durationSols: number;
  apply: () => Pick<ActiveEvent, "modifiers"> & {
    immediate?: {
      resources?: Record<string, number>;
      population?: number;
      morale?: number;
      message: string;
      kind: "good" | "bad" | "info";
    };
  };
}

export const EVENT_DEFS: EventDef[] = [
  {
    id: "dust_storm",
    name: "Dust Storm",
    description: "A planet-wide dust storm cuts solar output.",
    weight: 5,
    minSol: 4,
    durationSols: 6,
    apply: () => ({ modifiers: { solarMultiplier: 0.4 } }),
  },
  {
    id: "solar_flare",
    name: "Solar Flare",
    description: "Energetic particles spur breakthroughs in the labs.",
    weight: 2,
    minSol: 6,
    durationSols: 4,
    apply: () => ({ modifiers: { researchMultiplier: 1.5 } }),
  },
  {
    id: "ore_vein",
    name: "Ore Vein Discovered",
    description: "A surveyor team strikes a rich vein. Bonus minerals.",
    weight: 3,
    minSol: 3,
    durationSols: 1,
    apply: () => ({
      modifiers: undefined,
      immediate: {
        resources: { minerals: 150 },
        message: "Ore vein discovered: +150 minerals.",
        kind: "good",
      },
    }),
  },
  {
    id: "ice_pocket",
    name: "Subsurface Ice Pocket",
    description: "Drillers tap into a frozen reservoir.",
    weight: 3,
    minSol: 3,
    durationSols: 1,
    apply: () => ({
      modifiers: undefined,
      immediate: {
        resources: { water: 200 },
        message: "Ice pocket tapped: +200 water.",
        kind: "good",
      },
    }),
  },
  {
    id: "first_child",
    name: "First Mars-Born Child",
    description:
      "A historic birth electrifies the colony. Morale soars.",
    weight: 1,
    minSol: 10,
    durationSols: 1,
    apply: () => ({
      modifiers: undefined,
      immediate: {
        morale: 20,
        population: 1,
        message: "First child born on Mars! Morale +20, population +1.",
        kind: "good",
      },
    }),
  },
  {
    id: "outbreak",
    name: "Outbreak",
    description: "A pathogen sweeps the habitats. Some colonists are lost.",
    weight: 2,
    minSol: 12,
    durationSols: 1,
    apply: () => ({
      modifiers: undefined,
      immediate: {
        population: -3,
        morale: -10,
        message: "Outbreak: -3 colonists, morale -10.",
        kind: "bad",
      },
    }),
  },
  {
    id: "earth_supply",
    name: "Earth Supply Drop",
    description: "Earth sends a long-promised supply convoy.",
    weight: 2,
    minSol: 8,
    durationSols: 1,
    apply: () => ({
      modifiers: undefined,
      immediate: {
        resources: { credits: 400, food: 150, alloys: 5 },
        message: "Earth supply convoy arrives: +400 credits, +150 food, +5 alloys.",
        kind: "good",
      },
    }),
  },
  {
    id: "unrest",
    name: "Civil Unrest",
    description: "Workers protest harsh conditions.",
    weight: 2,
    minSol: 14,
    durationSols: 3,
    apply: () => ({ modifiers: { foodMultiplier: 0.75, researchMultiplier: 0.5 } }),
  },
];
