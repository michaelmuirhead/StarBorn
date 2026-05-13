import type { ActiveLaws, LawCategoryDef, LawCategoryId, LawOptionDef } from "./types";

export const LAW_COOLDOWN_SOLS = 10;

export const LAWS: Record<LawCategoryId, LawCategoryDef> = {
  taxation: {
    id: "taxation",
    name: "Taxation",
    description: "How much the colony levies from each colonist per sol.",
    options: [
      {
        id: "taxation_none",
        name: "None",
        description: "Pay nothing to the colony coffers.",
        effects: { creditsPerPop: 0 },
        factionReaction: { labour: 0.4, loyalists: -0.3, engineers: -0.1 },
      },
      {
        id: "taxation_light",
        name: "Light",
        description: "Minimal levy; popular but barely sustaining.",
        effects: { creditsPerPop: 0.4 },
        factionReaction: { labour: -0.1, loyalists: 0.1 },
      },
      {
        id: "taxation_standard",
        name: "Standard",
        description: "Standard colonial tax rate. The default arrangement.",
        effects: { creditsPerPop: 0.8 },
        factionReaction: {},
        isDefault: true,
      },
      {
        id: "taxation_heavy",
        name: "Heavy",
        description: "Aggressive taxation. Strains workers, props up the treasury.",
        effects: { creditsPerPop: 1.6, moraleDelta: -0.5 },
        factionReaction: { labour: -0.4, engineers: -0.2 },
      },
      {
        id: "taxation_punitive",
        name: "Punitive",
        description: "Tax everything that moves. Loyalists love it; everyone else seethes.",
        effects: { creditsPerPop: 3.0, moraleDelta: -1.5 },
        factionReaction: { labour: -0.8, engineers: -0.4, loyalists: 0.2 },
      },
    ],
  },
  conscription: {
    id: "conscription",
    name: "Conscription",
    description: "How aggressively the colony recruits workers into the military.",
    options: [
      {
        id: "conscription_volunteer",
        name: "Volunteer",
        description: "Only those who wish to serve.",
        effects: { conscriptionRate: 0 },
        factionReaction: {},
        isDefault: true,
      },
      {
        id: "conscription_selective",
        name: "Selective Service",
        description: "A small, steady draft from the worker pool.",
        effects: { conscriptionRate: 0.005, moraleDelta: -0.1 },
        factionReaction: { labour: -0.2, engineers: 0.1 },
        requiresResearch: "standing_army",
      },
      {
        id: "conscription_full",
        name: "Conscription",
        description: "All able-bodied workers serve a tour. Soldiers grow quickly.",
        effects: { conscriptionRate: 0.015, moraleDelta: -0.5 },
        factionReaction: { labour: -0.5, loyalists: 0.2 },
        requiresResearch: "standing_army",
      },
      {
        id: "conscription_total",
        name: "Total Mobilisation",
        description: "Wartime footing. Almost everyone serves; the economy strains.",
        effects: { conscriptionRate: 0.04, moraleDelta: -2 },
        factionReaction: { labour: -1.2, loyalists: 0.3, engineers: -0.3 },
        requiresResearch: "standing_army",
        requiresGovernment: ["provisional_council", "martian_republic"],
      },
    ],
  },
  liberties: {
    id: "liberties",
    name: "Civil Liberties",
    description: "The balance between freedom and order.",
    options: [
      {
        id: "liberties_free",
        name: "Free Society",
        description:
          "Press, assembly, due process. Morale and faction goodwill rise; Earth disapproves.",
        effects: { moraleDelta: 1, loyaltyDrift: -0.05 },
        factionReaction: { labour: 0.1, engineers: 0.1, loyalists: 0.1 },
        requiresResearch: "free_press",
      },
      {
        id: "liberties_standard",
        name: "Standard",
        description: "Baseline civil order. Nothing radical either way.",
        effects: {},
        factionReaction: {},
        isDefault: true,
      },
      {
        id: "liberties_restricted",
        name: "Restricted",
        description: "Curfews, surveillance, restricted assembly.",
        effects: { moraleDelta: -0.5 },
        factionReaction: { loyalists: 0.2, labour: -0.4, engineers: -0.2 },
        requiresResearch: "security_apparatus",
      },
      {
        id: "liberties_martial",
        name: "Martial Law",
        description: "The military runs civilian life. Earth is reassured; everyone else suffers.",
        effects: { moraleDelta: -2, loyaltyDrift: 0.1 },
        factionReaction: { labour: -1, engineers: -0.5, loyalists: 0.6 },
        requiresResearch: "security_apparatus",
        requiresGovernment: ["provisional_council", "martian_republic"],
      },
    ],
  },
  earth_relations: {
    id: "earth_relations",
    name: "Earth Relations",
    description: "How the colony orients itself toward its home planet.",
    options: [
      {
        id: "earth_relations_submissive",
        name: "Submissive",
        description: "Defer to Earth in all things. Generous supply convoys, but loss of pride.",
        effects: { loyaltyDrift: 0.15, earthSupplyMult: 2 },
        factionReaction: { loyalists: 0.5, engineers: -0.3, labour: -0.4 },
      },
      {
        id: "earth_relations_compliant",
        name: "Compliant",
        description: "Standard subsidiary relationship. Earth runs the show.",
        effects: {},
        factionReaction: {},
        isDefault: true,
      },
      {
        id: "earth_relations_defiant",
        name: "Defiant",
        description: "Push back diplomatically. Tariffs and supply slowdowns follow.",
        effects: { loyaltyDrift: -0.2, earthSupplyMult: 0.5 },
        factionReaction: { labour: 0.4, engineers: 0.3, loyalists: -0.8 },
        requiresResearch: "independence_movement",
      },
      {
        id: "earth_relations_hostile",
        name: "Hostile",
        description:
          "Open opposition. Earth aid ceases. The future war of independence begins here.",
        effects: { loyaltyDrift: -0.5, earthSupplyMult: 0 },
        factionReaction: { labour: 0.8, engineers: 0.5, loyalists: -2 },
        requiresResearch: "independence_movement",
        requiresGovernment: ["provisional_council", "martian_republic"],
      },
    ],
  },
  immigration: {
    id: "immigration",
    name: "Immigration",
    description: "Who is allowed to join the colony.",
    options: [
      {
        id: "immigration_closed",
        name: "Closed Borders",
        description: "No new arrivals. Slower growth.",
        effects: { populationGrowthMult: 0.5 },
        factionReaction: { loyalists: -0.2 },
      },
      {
        id: "immigration_selective",
        name: "Selective",
        description: "Vetted arrivals from Earth on Earth's schedule.",
        effects: {},
        factionReaction: {},
        isDefault: true,
      },
      {
        id: "immigration_open",
        name: "Open Door",
        description: "Anyone with the means can come. Faster growth and morale.",
        effects: { populationGrowthMult: 1.3, moraleDelta: 0.3 },
        factionReaction: { labour: 0.2 },
        requiresResearch: "spaceflight",
      },
    ],
  },
  research_priority: {
    id: "research_priority",
    name: "Research Priority",
    description: "How the colony allocates between research and production.",
    options: [
      {
        id: "research_priority_maintenance",
        name: "Maintenance Focus",
        description: "Spend on upkeep, not breakthroughs. Cheap to run.",
        effects: { researchMult: 0.75, maintenanceMult: 0.75 },
        factionReaction: { engineers: -0.4 },
      },
      {
        id: "research_priority_standard",
        name: "Standard",
        description: "Balanced allocation.",
        effects: {},
        factionReaction: {},
        isDefault: true,
      },
      {
        id: "research_priority_accelerated",
        name: "Accelerated",
        description: "Lean into R&D. Engineers thrive; production sags a little.",
        effects: { researchMult: 1.25, productionMult: 0.95 },
        factionReaction: { engineers: 0.3 },
      },
      {
        id: "research_priority_allout",
        name: "All-Out R&D",
        description: "Strip every other budget. The future at any price.",
        effects: { researchMult: 1.5, productionMult: 0.9, moraleDelta: -0.5 },
        factionReaction: { engineers: 0.7, labour: -0.2 },
      },
    ],
  },
};

export const LAW_CATEGORY_ORDER: LawCategoryId[] = [
  "taxation",
  "conscription",
  "liberties",
  "earth_relations",
  "immigration",
  "research_priority",
];

export function defaultLaws(): ActiveLaws {
  const options: Record<LawCategoryId, string> = {} as Record<LawCategoryId, string>;
  for (const cat of LAW_CATEGORY_ORDER) {
    const def = LAWS[cat].options.find((o) => o.isDefault) ?? LAWS[cat].options[0];
    options[cat] = def.id;
  }
  return { options, cooldownUntilSol: {} };
}

export function findOption(category: LawCategoryId, id: string): LawOptionDef | undefined {
  return LAWS[category].options.find((o) => o.id === id);
}
