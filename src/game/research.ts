import type { ResearchDef, ResearchId } from "./types";

export const RESEARCH: Record<ResearchId, ResearchDef> = {
  hydroponics: {
    id: "hydroponics",
    name: "Hydroponics",
    description: "Greenhouses produce +50% food.",
    cost: 20,
    effects: ["+50% food output from greenhouses"],
  },
  solar_ii: {
    id: "solar_ii",
    name: "Solar Mk II",
    description: "Solar arrays produce +50% power.",
    cost: 25,
    effects: ["+50% power output from solar arrays"],
  },
  advanced_habitats: {
    id: "advanced_habitats",
    name: "Advanced Habitats",
    description: "Habitat domes house 50% more colonists.",
    cost: 30,
    effects: ["+50% housing from habitats"],
  },
  alloy_metallurgy: {
    id: "alloy_metallurgy",
    name: "Alloy Metallurgy",
    description: "Unlocks the Alloy Foundry.",
    cost: 40,
    effects: ["Unlock Alloy Foundry building"],
  },
  spaceflight: {
    id: "spaceflight",
    name: "Spaceflight",
    description: "Unlocks the Spaceport. Required for off-world expansion.",
    cost: 80,
    requires: ["alloy_metallurgy"],
    effects: ["Unlock Spaceport building", "Enables future off-world expansion"],
  },
  robotics: {
    id: "robotics",
    name: "Robotics",
    description: "All mines and foundries produce +25%.",
    cost: 50,
    effects: ["+25% minerals and alloys output"],
  },
  xeno_biology: {
    id: "xeno_biology",
    name: "Xeno-Biology",
    description: "Colonists consume 20% less food and water.",
    cost: 60,
    effects: ["-20% food and water consumption per colonist"],
  },
  civic_council: {
    id: "civic_council",
    name: "Civic Council",
    description: "Improves morale recovery. Foundation for future politics.",
    cost: 35,
    effects: ["Morale recovers faster", "Prepares ground for civic systems"],
  },
  atmospherics: {
    id: "atmospherics",
    name: "Atmospherics",
    description:
      "Unlocks the Atmospheric Processor and the long-arc goal of terraforming Mars.",
    cost: 120,
    requires: ["xeno_biology", "alloy_metallurgy"],
    effects: ["Unlock Atmospheric Processor", "Enables terraforming victory"],
  },
};

export const RESEARCH_ORDER: ResearchId[] = [
  "hydroponics",
  "solar_ii",
  "advanced_habitats",
  "civic_council",
  "alloy_metallurgy",
  "robotics",
  "xeno_biology",
  "spaceflight",
  "atmospherics",
];
