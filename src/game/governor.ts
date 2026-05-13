import type { Governor, TraitDef, TraitId } from "./types";

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
