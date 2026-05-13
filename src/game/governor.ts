import type { FactionId, Governor, TraitDef, TraitId } from "./types";

const FACTION_IDS: FactionId[] = ["loyalists", "labour", "engineers"];

const FIRST_NAMES = [
  "Aris",
  "Mira",
  "Idris",
  "Sora",
  "Kael",
  "Lin",
  "Tomas",
  "Yara",
  "Rohan",
  "Adira",
  "Petra",
  "Niko",
  "Imogen",
  "Selim",
  "Vera",
  "Hadi",
  "Noemi",
  "Theo",
  "Rumi",
  "Jaya",
  "Casimir",
  "Halle",
  "Eun",
  "Faraz",
];

const LAST_NAMES = [
  "Okafor",
  "Reyes",
  "Patel",
  "Marin",
  "Volkov",
  "Tanaka",
  "Adeyemi",
  "Sandoval",
  "Karev",
  "Nakamura",
  "Mensah",
  "Bashir",
  "Ng",
  "Petrova",
  "Hassan",
  "O'Hara",
  "Coelho",
  "Singh",
  "Lindqvist",
  "Cabrera",
  "Khoury",
  "Vance",
  "Eklund",
  "Diallo",
];

export const TRAITS: Record<TraitId, TraitDef> = {
  engineer: {
    id: "engineer",
    name: "Engineer",
    description: "Construction completes 1 sol faster.",
  },
  charismatic: {
    id: "charismatic",
    name: "Charismatic",
    description: "+1 morale recovery per sol.",
  },
  hawk: {
    id: "hawk",
    name: "Hawk",
    description: "Loyalty to Earth drifts down faster. Future: bonus to military.",
  },
  pragmatic: {
    id: "pragmatic",
    name: "Pragmatic",
    description: "+5% to all resource production.",
  },
  visionary: {
    id: "visionary",
    name: "Visionary",
    description: "+20% research output.",
  },
  frugal: {
    id: "frugal",
    name: "Frugal",
    description: "Building maintenance costs reduced by 25%.",
  },
  ambitious: {
    id: "ambitious",
    name: "Ambitious",
    description: "Loyalty to Earth drifts down faster. Faster political escalation.",
  },
  cautious: {
    id: "cautious",
    name: "Cautious",
    description: "-25% chance of random events firing.",
  },
  bureaucrat: {
    id: "bureaucrat",
    name: "Bureaucrat",
    description: "+1 credit per sol per operational habitat (rent collection).",
  },
};

const TRAIT_IDS = Object.keys(TRAITS) as TraitId[];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateGovernor(sol: number, title = "Colony Director"): Governor {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const t1 = pick(TRAIT_IDS);
  let t2 = pick(TRAIT_IDS);
  while (t2 === t1) t2 = pick(TRAIT_IDS);
  return {
    name: `${first} ${last}`,
    title,
    traits: [t1, t2],
    appointedSol: sol,
  };
}

export interface GovernorEffects {
  productionMult: number;
  researchMult: number;
  moraleBonus: number;
  maintenanceMult: number;
  loyaltyDriftBonus: number;
  eventChanceMult: number;
  constructionSpeedup: number;
  habitatCreditTrickle: number;
}

interface TraitLawMod {
  factions: Partial<Record<FactionId, number>>;
  sign: "pos" | "neg" | "both";
  onlyOptions?: string[];
}

const TRAIT_LAW_MODS: Record<TraitId, TraitLawMod[]> = {
  charismatic: [
    {
      factions: { loyalists: 0.5, labour: 0.5, engineers: 0.5 },
      sign: "both",
    },
  ],
  hawk: [
    { factions: { labour: 1.5 }, sign: "both" },
    { factions: { loyalists: 0.5 }, sign: "both" },
  ],
  ambitious: [
    {
      factions: { labour: 2 },
      sign: "pos",
      onlyOptions: [
        "earth_relations_defiant",
        "earth_relations_hostile",
        "immigration_open",
      ],
    },
    {
      factions: { loyalists: 2 },
      sign: "neg",
      onlyOptions: [
        "earth_relations_defiant",
        "earth_relations_hostile",
        "immigration_open",
      ],
    },
  ],
  bureaucrat: [
    {
      factions: { loyalists: 1.5 },
      sign: "pos",
      onlyOptions: ["liberties_restricted", "earth_relations_submissive", "taxation_heavy"],
    },
  ],
  visionary: [{ factions: { engineers: 1.5 }, sign: "both" }],
  frugal: [
    {
      factions: { labour: 0.75 },
      sign: "neg",
      onlyOptions: ["taxation_heavy", "taxation_punitive"],
    },
  ],
  engineer: [{ factions: { engineers: 1.5 }, sign: "pos" }],
  pragmatic: [{ factions: { labour: 0.7, engineers: 0.7 }, sign: "both" }],
  cautious: [
    { factions: { loyalists: 0.8, labour: 0.8, engineers: 0.8 }, sign: "both" },
  ],
};

export function applyTraitLawMods(
  traits: TraitId[],
  optionId: string,
  reaction: Partial<Record<FactionId, number>>
): Partial<Record<FactionId, number>> {
  const out: Partial<Record<FactionId, number>> = { ...reaction };
  for (const trait of traits) {
    const mods = TRAIT_LAW_MODS[trait];
    if (!mods) continue;
    for (const mod of mods) {
      if (mod.onlyOptions && !mod.onlyOptions.includes(optionId)) continue;
      for (const f of FACTION_IDS) {
        const delta = out[f] ?? 0;
        if (delta === 0) continue;
        if (mod.sign === "pos" && delta < 0) continue;
        if (mod.sign === "neg" && delta > 0) continue;
        const mult = mod.factions[f];
        if (mult !== undefined) out[f] = delta * mult;
      }
    }
  }
  return out;
}

export function governorEffects(traits: TraitId[]): GovernorEffects {
  const e: GovernorEffects = {
    productionMult: 1,
    researchMult: 1,
    moraleBonus: 0,
    maintenanceMult: 1,
    loyaltyDriftBonus: 0,
    eventChanceMult: 1,
    constructionSpeedup: 0,
    habitatCreditTrickle: 0,
  };
  for (const t of traits) {
    switch (t) {
      case "pragmatic":
        e.productionMult *= 1.05;
        break;
      case "visionary":
        e.researchMult *= 1.2;
        break;
      case "charismatic":
        e.moraleBonus += 1;
        break;
      case "frugal":
        e.maintenanceMult *= 0.75;
        break;
      case "hawk":
        e.loyaltyDriftBonus -= 0.05;
        break;
      case "ambitious":
        e.loyaltyDriftBonus -= 0.05;
        break;
      case "cautious":
        e.eventChanceMult *= 0.75;
        break;
      case "engineer":
        e.constructionSpeedup += 1;
        break;
      case "bureaucrat":
        e.habitatCreditTrickle += 1;
        break;
    }
  }
  return e;
}
