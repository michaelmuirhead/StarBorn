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
  standing_army: {
    id: "standing_army",
    name: "Standing Army",
    description:
      "Doctrine and command structures for a permanent military. Unlocks conscription policies.",
    cost: 50,
    requires: ["civic_council"],
    effects: [
      "Unlock Selective Service and Conscription law options",
      "Total Mobilisation available once government reforms",
    ],
  },
  security_apparatus: {
    id: "security_apparatus",
    name: "Security Apparatus",
    description:
      "Surveillance, security forces, and emergency protocols. Unlocks restrictive civil liberties policies.",
    cost: 40,
    requires: ["civic_council"],
    effects: [
      "Unlock Restricted Liberties",
      "Martial Law available once government reforms",
    ],
  },
  free_press: {
    id: "free_press",
    name: "Free Press",
    description:
      "Independent media, public assembly rights, and judicial independence. Unlocks the Free Society policy.",
    cost: 35,
    requires: ["civic_council"],
    effects: ["Unlock Free Society civil liberties"],
  },
  independence_movement: {
    id: "independence_movement",
    name: "Independence Movement",
    description:
      "Theoretical and organisational groundwork for breaking with Earth. Unlocks confrontational Earth policies.",
    cost: 100,
    requires: ["civic_council"],
    effects: [
      "Unlock Defiant Earth Relations",
      "Hostile Earth Relations available once government reforms",
    ],
  },
};

export const RESEARCH_ORDER: ResearchId[] = [
  "hydroponics",
  "solar_ii",
  "advanced_habitats",
  "civic_council",
  "free_press",
  "security_apparatus",
  "standing_army",
  "alloy_metallurgy",
  "robotics",
  "xeno_biology",
  "spaceflight",
  "independence_movement",
  "atmospherics",
];
