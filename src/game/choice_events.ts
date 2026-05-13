import type { ChoiceEventChoice, GameState } from "./types";

export interface ChoiceEventDef {
  id: string;
  name: string;
  description: string;
  trigger: (state: GameState) => boolean;
  choices: ChoiceEventChoice[];
  cooldownSols?: number;
}

function influence(state: GameState, id: "loyalists" | "labour" | "engineers"): number {
  return state.factions.find((f) => f.id === id)?.influence ?? 0;
}

function happiness(state: GameState, id: "loyalists" | "labour" | "engineers"): number {
  return state.factions.find((f) => f.id === id)?.happiness ?? 0;
}

export const CHOICE_EVENT_DEFS: ChoiceEventDef[] = [
  {
    id: "provisional_council",
    name: "Provisional Council Proposed",
    description:
      "A petition signed by Labour and Engineering Guild leaders lands on the Director's desk: dissolve the corporate charter and convene a Provisional Council. Loyalists call it sedition.",
    trigger: (s) =>
      s.government === "corporate_colony" &&
      s.loyalty < 50 &&
      s.research.completed.includes("civic_council") &&
      influence(s, "engineers") + influence(s, "labour") > 55 &&
      s.sol > 30,
    choices: [
      {
        id: "accept",
        label: "Convene the Council",
        description:
          "Mars enters a transitional government. Earth is furious; the colony cheers.",
        effect: {
          setGovernment: "provisional_council",
          morale: 12,
          loyalty: -15,
          factionHappiness: { labour: 20, engineers: 20, loyalists: -25 },
          factionInfluence: { labour: 5, engineers: 5, loyalists: -10 },
          logKind: "good",
          logMessage: "The Provisional Council convenes. Mars is no longer a subsidiary.",
        },
      },
      {
        id: "refuse",
        label: "Refuse",
        description:
          "The Director rebuffs the petition. Loyalists rally; cracks widen quietly.",
        effect: {
          loyalty: 5,
          factionHappiness: { loyalists: 15, labour: -15, engineers: -10 },
          logKind: "info",
          logMessage: "The Director refuses the Council. Loyalists rally.",
        },
      },
      {
        id: "delay",
        label: "Promise to consider",
        description: "Buy time. Nobody trusts the promise, but nobody walks out either.",
        effect: {
          factionHappiness: { labour: -3, engineers: -3, loyalists: 2 },
          logKind: "info",
          logMessage: "The Director promises to consider the matter. Time passes.",
        },
      },
    ],
    cooldownSols: 25,
  },
  {
    id: "declare_republic",
    name: "Declare the Martian Republic",
    description:
      "A draft Declaration circulates among Council members. Sign it and Mars becomes a sovereign state — and almost certainly draws Earth's war fleet.",
    trigger: (s) =>
      s.government === "provisional_council" &&
      s.loyalty < 25 &&
      s.research.completed.includes("independence_movement") &&
      (s.laws.options.earth_relations === "earth_relations_defiant" ||
        s.laws.options.earth_relations === "earth_relations_hostile") &&
      s.sol > 60,
    choices: [
      {
        id: "declare",
        label: "Sign the Declaration",
        description:
          "Mars proclaims itself the Martian Republic. Earth goes silent on every channel.",
        effect: {
          setGovernment: "martian_republic",
          setIndependence: true,
          loyalty: -100,
          morale: 20,
          factionHappiness: { labour: 30, engineers: 30, loyalists: -50 },
          factionInfluence: { labour: 8, engineers: 8, loyalists: -16 },
          logKind: "good",
          logMessage:
            "Mars proclaims the Martian Republic. The Phase 3 war of independence begins (soon™).",
        },
      },
      {
        id: "hold",
        label: "Hold the line",
        description: "Shelve the Declaration. The fire smoulders.",
        effect: {
          loyalty: 10,
          factionHappiness: { loyalists: 12, labour: -10, engineers: -8 },
          logKind: "info",
          logMessage: "The Declaration is shelved. The fire smoulders.",
        },
      },
    ],
    cooldownSols: 30,
  },
  {
    id: "labour_strike",
    name: "Strike at the Foundries",
    description:
      "Foundry workers down tools and march on the colony square. They demand shorter shifts and a pay rise. Production slows by the hour.",
    trigger: (s) => happiness(s, "labour") < 30 && s.sol > 20,
    choices: [
      {
        id: "concede",
        label: "Concede a 4-sol week",
        description: "Workers go back happily. Production takes a permanent hit.",
        effect: {
          resources: { credits: -200 },
          morale: 3,
          factionHappiness: { labour: 25, loyalists: -5 },
          logKind: "good",
          logMessage: "Strike resolved: workers win the 4-sol week. -200 credits, Labour mollified.",
        },
      },
      {
        id: "security",
        label: "Send in security forces",
        description: "The strike ends quickly. The grievance does not.",
        effect: {
          morale: -8,
          factionHappiness: { labour: -20, engineers: -5, loyalists: 8 },
          logKind: "bad",
          logMessage: "Strike crushed. Morale falls. Labour remembers.",
        },
      },
      {
        id: "negotiate",
        label: "Negotiate a bonus",
        description: "A one-time payment buys peace this time.",
        effect: {
          resources: { credits: -120 },
          factionHappiness: { labour: 10 },
          logKind: "info",
          logMessage: "Strike settled with a one-time bonus. -120 credits.",
        },
      },
    ],
    cooldownSols: 25,
  },
  {
    id: "ai_council",
    name: "Engineering Guild: Propose Planetary AI",
    description:
      "The Engineering Guild submits a proposal: an autonomous planetary AI to optimise the colony end-to-end. Loyalists view it as ceding sovereignty to a machine.",
    trigger: (s) =>
      influence(s, "engineers") > 35 &&
      s.research.completed.includes("civic_council") &&
      s.sol > 40,
    choices: [
      {
        id: "approve",
        label: "Approve the AI",
        description: "Research surges. The Director becomes a figurehead in some matters.",
        effect: {
          resources: { research: 150 },
          loyalty: -3,
          factionHappiness: { engineers: 25, loyalists: -10 },
          factionInfluence: { engineers: 4, loyalists: -2 },
          logKind: "good",
          logMessage: "Planetary AI approved. +150 research banked.",
        },
      },
      {
        id: "regulate",
        label: "Regulate, don't deploy",
        description: "A symbolic gesture. Almost nobody is satisfied.",
        effect: {
          factionHappiness: { engineers: 5, loyalists: 3 },
          logKind: "info",
          logMessage: "AI proposal regulated, not deployed.",
        },
      },
      {
        id: "veto",
        label: "Veto",
        description: "The Guild seethes; Loyalists toast the Director.",
        effect: {
          factionHappiness: { engineers: -25, loyalists: 6 },
          logKind: "info",
          logMessage: "Planetary AI vetoed.",
        },
      },
    ],
  },
  {
    id: "earth_tariffs",
    name: "Earth Demands Tariff Renegotiation",
    description:
      "An Earth envoy lands with a new tariff schedule. They want a larger cut of every Mars export. Refuse and supplies will slow; accept and the treasury bleeds.",
    trigger: (s) => s.loyalty < 60 && s.loyalty > 10 && s.sol > 15,
    choices: [
      {
        id: "concede",
        label: "Concede",
        description: "Pay Earth its tribute. Loyalists smile. Everyone else seethes.",
        effect: {
          resources: { credits: -300 },
          loyalty: 8,
          factionHappiness: { loyalists: 6, labour: -4, engineers: -3 },
          logKind: "info",
          logMessage: "Earth tariffs accepted. -300 credits, loyalty +8.",
        },
      },
      {
        id: "negotiate",
        label: "Negotiate",
        description: "A grudging compromise. Nobody walks away thrilled.",
        effect: {
          resources: { credits: -120 },
          loyalty: 2,
          factionHappiness: { loyalists: 1, labour: 1 },
          logKind: "info",
          logMessage: "Earth tariffs negotiated. -120 credits, loyalty +2.",
        },
      },
      {
        id: "refuse",
        label: "Refuse",
        description: "Earth recalls the envoy. Supply convoys will be lean.",
        effect: {
          loyalty: -15,
          factionHappiness: { loyalists: -10, labour: 4, engineers: 3 },
          logKind: "warn",
          logMessage: "Earth tariffs refused. Loyalty drops, Earth chills.",
        },
      },
    ],
    cooldownSols: 30,
  },
];

export function findChoiceEvent(id: string): ChoiceEventDef | undefined {
  return CHOICE_EVENT_DEFS.find((e) => e.id === id);
}
