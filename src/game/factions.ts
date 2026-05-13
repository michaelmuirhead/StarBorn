import type { FactionDef, FactionId, FactionState, GovernmentDef, GovernmentType } from "./types";

export const FACTIONS: Record<FactionId, FactionDef> = {
  loyalists: {
    id: "loyalists",
    name: "Earth Loyalists",
    shortName: "Loyalists",
    description:
      "Civil servants, merchants, and old-Earth families. Want a cheap, peaceful trade relationship with Earth.",
    color: "#5fa8d3",
  },
  labour: {
    id: "labour",
    name: "Labour Coalition",
    shortName: "Labour",
    description:
      "Miners, farmers, dome crews. Want fair wages, social services, and freedom from corporate overseers.",
    color: "#e6a23c",
  },
  engineers: {
    id: "engineers",
    name: "Engineering Guild",
    shortName: "Engineers",
    description:
      "Scientists and master builders. Want infrastructure, research budgets, and a long view.",
    color: "#67c23a",
  },
};

export const FACTION_ORDER: FactionId[] = ["loyalists", "labour", "engineers"];

export const GOVERNMENTS: Record<GovernmentType, GovernmentDef> = {
  corporate_colony: {
    id: "corporate_colony",
    name: "Corporate Colony",
    description:
      "A subsidiary of Earth's largest off-world consortium. Profit reports flow to Earth; the Director rules in their name.",
  },
  provisional_council: {
    id: "provisional_council",
    name: "Provisional Council",
    description:
      "A transitional government with elected representatives but Earth still holds veto.",
  },
  martian_republic: {
    id: "martian_republic",
    name: "Martian Republic",
    description:
      "An independent planetary state. The Director answers only to the Council.",
  },
};

export function startingFactions(): FactionState[] {
  return [
    { id: "loyalists", influence: 45, happiness: 60 },
    { id: "labour", influence: 30, happiness: 50 },
    { id: "engineers", influence: 25, happiness: 65 },
  ];
}

export function normaliseInfluence(factions: FactionState[]): FactionState[] {
  const total = factions.reduce((s, f) => s + f.influence, 0);
  if (total === 0) return factions;
  return factions.map((f) => ({ ...f, influence: Math.round((f.influence / total) * 1000) / 10 }));
}
