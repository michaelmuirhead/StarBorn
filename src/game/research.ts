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
  battery_storage: {
    id: "battery_storage",
    name: "Battery Storage",
    description:
      "Industrial-scale chemical batteries. Unlocks the Battery building; lets the colony bank power for storms.",
    cost: 40,
    requires: ["solar_ii"],
    effects: ["Unlock Battery building (+60 power storage)"],
  },
  geothermal_power: {
    id: "geothermal_power",
    name: "Geothermal Power",
    description:
      "Tap heat from Mars' crust. Unlocks the Geothermal Plant — steady power, immune to dust storms.",
    cost: 70,
    effects: ["Unlock Geothermal Plant building (+6 power, storm-proof)"],
  },
  fusion_power: {
    id: "fusion_power",
    name: "Fusion Power",
    description:
      "Stable deuterium-tritium fusion at colony scale. Unlocks the Fusion Reactor — the colony's late-game power spine.",
    cost: 180,
    requires: ["geothermal_power", "atmospherics"],
    effects: ["Unlock Fusion Reactor building (+30 power, uses Rare Earths)"],
  },
  modular_construction: {
    id: "modular_construction",
    name: "Modular Construction",
    description:
      "Prefabricated, standardised parts. Every building takes 1 fewer sol to construct.",
    cost: 40,
    effects: ["Construction time -1 sol on every building"],
  },
  deep_drilling: {
    id: "deep_drilling",
    name: "Deep Drilling",
    description:
      "Deep-seam techniques and rare-earth extraction. Mines yield more minerals, a small credit trickle from off-world sales, and a flow of Rare Earths.",
    cost: 60,
    requires: ["robotics"],
    effects: [
      "Mines +50% minerals and +1 credit",
      "Mines produce +0.5 Rare Earths per sol",
    ],
  },
  megastructures: {
    id: "megastructures",
    name: "Megastructures",
    description:
      "Continent-scale engineering. Unlocks the Mega-Habitat — vast housing under one dome.",
    cost: 150,
    requires: ["modular_construction", "alloy_metallurgy"],
    effects: ["Unlock Mega-Habitat building (+30 housing)"],
  },
  medical_doctrine: {
    id: "medical_doctrine",
    name: "Medical Doctrine",
    description:
      "Clinics, triage protocols, and public-health standards. Outbreaks hit half as hard; habitats keep their colonists in better spirits.",
    cost: 30,
    effects: [
      "Outbreak event population/morale loss halved",
      "Each operational habitat +0.5 morale per sol",
    ],
  },
  vat_protein: {
    id: "vat_protein",
    name: "Vat Protein",
    description:
      "Cell-cultured meat and printed staples. Unlocks the Vat Farm — food without water-intensive crops.",
    cost: 60,
    requires: ["hydroponics"],
    effects: ["Unlock Vat Farm building (+4 food, no water upkeep)"],
  },
  longevity: {
    id: "longevity",
    name: "Longevity Treatments",
    description:
      "Senescence therapies and crisis medicine. Colonists are born faster and last longer.",
    cost: 100,
    requires: ["medical_doctrine", "xeno_biology"],
    effects: ["Population growth +25%", "Population decay rate -25%"],
  },
  computing: {
    id: "computing",
    name: "Computing",
    description:
      "Reliable distributed compute. Labs run more simulations per sol.",
    cost: 45,
    effects: ["Labs +25% research output"],
  },
  cybernetics: {
    id: "cybernetics",
    name: "Cybernetics",
    description:
      "Augmented workers and synchronized exoskeletons. Every building runs a little better.",
    cost: 110,
    requires: ["computing", "robotics"],
    effects: ["All building outputs +15%"],
  },
  quantum_computing: {
    id: "quantum_computing",
    name: "Quantum Computing",
    description:
      "Coherent qubit arrays. Research throughput jumps.",
    cost: 180,
    requires: ["cybernetics"],
    effects: ["Labs +50% additional research output"],
  },
  infantry_doctrine: {
    id: "infantry_doctrine",
    name: "Infantry Doctrine",
    description:
      "Manuals, drill, and the institution of an officer corps. Barracks house more soldiers per level.",
    cost: 60,
    requires: ["standing_army"],
    effects: ["+1 soldier capacity per Barracks level"],
  },
  combined_arms: {
    id: "combined_arms",
    name: "Combined Arms",
    description:
      "Joint operations doctrine linking ground, air, and orbit. Unlocks the Orbital Dock as a Phase 4 hook.",
    cost: 120,
    requires: ["infantry_doctrine", "spaceflight"],
    effects: ["Unlock Orbital Dock (Phase 4 fleet hook)"],
  },
};

export const RESEARCH_ORDER: ResearchId[] = [
  "hydroponics",
  "solar_ii",
  "advanced_habitats",
  "battery_storage",
  "geothermal_power",
  "modular_construction",
  "medical_doctrine",
  "computing",
  "civic_council",
  "free_press",
  "security_apparatus",
  "standing_army",
  "alloy_metallurgy",
  "robotics",
  "xeno_biology",
  "vat_protein",
  "deep_drilling",
  "longevity",
  "infantry_doctrine",
  "spaceflight",
  "independence_movement",
  "cybernetics",
  "megastructures",
  "combined_arms",
  "quantum_computing",
  "atmospherics",
  "fusion_power",
];
