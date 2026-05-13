"use client";

import { create } from "zustand";
import { BUILDINGS } from "./buildings";
import { RESEARCH } from "./research";
import { EVENT_DEFS } from "./events";
import { generateTiles } from "./map";
import {
  PER_COLONIST,
  POP_DECAY_PER_SOL,
  POP_GROWTH_PER_SOL,
  SAVE_KEY,
  SAVE_VERSION,
  STARTING_HOUSING,
  STARTING_MORALE,
  STARTING_POPULATION,
  STARTING_RESOURCES,
} from "./constants";
import type {
  ActiveEvent,
  BuildingId,
  GameState,
  LogEntry,
  PlacedBuilding,
  ResearchId,
  Resources,
} from "./types";

interface Actions {
  selectTile: (idx: number | null) => void;
  selectBuild: (id: BuildingId | null) => void;
  placeBuilding: (tile: number, id: BuildingId) => void;
  demolishBuilding: (tile: number) => void;
  setSpeed: (s: 0 | 1 | 2 | 4) => void;
  tick: () => void;
  startResearch: (id: ResearchId) => void;
  reset: () => void;
  saveNow: () => void;
  loadFromJson: (json: string) => boolean;
  exportJson: () => string;
}

export type GameStore = GameState & Actions;

const EMPTY_RESOURCES: Resources = {
  credits: 0,
  food: 0,
  water: 0,
  oxygen: 0,
  power: 0,
  minerals: 0,
  alloys: 0,
  research: 0,
};

function freshState(): GameState {
  const tiles = generateTiles(42);
  return {
    version: SAVE_VERSION,
    sol: 1,
    speed: 1,
    resources: { ...STARTING_RESOURCES },
    population: STARTING_POPULATION,
    morale: STARTING_MORALE,
    housing: STARTING_HOUSING,
    tiles,
    buildings: [],
    research: { completed: [], current: null, progress: 0 },
    events: [],
    log: [
      {
        sol: 1,
        kind: "info",
        message:
          "Colony ship Aresward touches down. 12 colonists step onto Mars. Build solar, water, food, oxygen — quickly.",
      },
    ],
    selectedTile: null,
    buildSelection: null,
  };
}

function canAfford(res: Resources, cost: Partial<Resources>): boolean {
  for (const k in cost) {
    const key = k as keyof Resources;
    if ((res[key] ?? 0) < (cost[key] ?? 0)) return false;
  }
  return true;
}

function subtract(res: Resources, cost: Partial<Resources>): Resources {
  const next = { ...res };
  for (const k in cost) {
    const key = k as keyof Resources;
    next[key] = (next[key] ?? 0) - (cost[key] ?? 0);
  }
  return next;
}

function pushLog(log: LogEntry[], entry: LogEntry, max = 60): LogEntry[] {
  return [entry, ...log].slice(0, max);
}

function modifierFor(
  events: ActiveEvent[],
  key: "solarMultiplier" | "foodMultiplier" | "researchMultiplier"
): number {
  let mult = 1;
  for (const ev of events) {
    const m = ev.modifiers?.[key];
    if (typeof m === "number") mult *= m;
  }
  return mult;
}

function rollNewEvent(sol: number, active: ActiveEvent[]): ActiveEvent | null {
  if (Math.random() > 0.18) return null;
  const eligible = EVENT_DEFS.filter(
    (e) => sol >= e.minSol && !active.some((a) => a.defId === e.id)
  );
  if (eligible.length === 0) return null;
  const totalWeight = eligible.reduce((s, e) => s + e.weight, 0);
  let pick = Math.random() * totalWeight;
  for (const e of eligible) {
    pick -= e.weight;
    if (pick <= 0) {
      const result = e.apply();
      return {
        id: `${e.id}-${sol}-${Math.floor(Math.random() * 9999)}`,
        defId: e.id,
        name: e.name,
        description: e.description,
        startedSol: sol,
        durationSols: e.durationSols,
        modifiers: result.modifiers,
      };
    }
  }
  return null;
}

interface Production {
  prod: Resources;
  upkeep: Resources;
  housing: number;
  workersNeeded: number;
}

function computeProduction(state: GameState): Production {
  const prod: Resources = { ...EMPTY_RESOURCES };
  const upkeep: Resources = { ...EMPTY_RESOURCES };
  let housing = 0;
  let workersNeeded = 0;

  const completed = new Set(state.research.completed);
  const solarMult = modifierFor(state.events, "solarMultiplier");
  const foodMult = modifierFor(state.events, "foodMultiplier");
  const researchEventMult = modifierFor(state.events, "researchMultiplier");

  for (const b of state.buildings) {
    const def = BUILDINGS[b.building];
    const tile = state.tiles[b.tile];
    const bonus = def.terrainBonus?.[tile.terrain] ?? {};

    workersNeeded += def.workers;
    const staffed = def.workers === 0 || b.workers >= def.workers;

    if (def.housing) {
      const houseMult = completed.has("advanced_habitats") ? 1.5 : 1;
      housing += Math.floor(def.housing * houseMult);
    }

    if (!staffed) continue;

    for (const k in def.output) {
      const key = k as keyof Resources;
      let amount = (def.output[key] ?? 0) + (bonus[key] ?? 0);
      if (def.id === "solar" && key === "power") amount *= solarMult;
      if (def.id === "solar" && key === "power" && completed.has("solar_ii")) amount *= 1.5;
      if (def.id === "greenhouse" && key === "food") {
        amount *= foodMult;
        if (completed.has("hydroponics")) amount *= 1.5;
      }
      if ((def.id === "mine" || def.id === "foundry") && completed.has("robotics")) {
        amount *= 1.25;
      }
      if (def.id === "lab" && key === "research") amount *= researchEventMult;
      prod[key] += amount;
    }
    for (const k in def.upkeep) {
      const key = k as keyof Resources;
      upkeep[key] += def.upkeep[key] ?? 0;
    }
  }

  return { prod, upkeep, housing, workersNeeded };
}

function assignWorkers(state: GameState): PlacedBuilding[] {
  let available = state.population;
  return state.buildings.map((b) => {
    const def = BUILDINGS[b.building];
    if (def.workers === 0) return { ...b, workers: 0 };
    const assigned = Math.min(def.workers, available);
    available -= assigned;
    return { ...b, workers: assigned };
  });
}

function runTick(state: GameState): GameState {
  const sol = state.sol + 1;

  let events = state.events.filter((e) => sol - e.startedSol < e.durationSols);
  let log = state.log;
  const newEvent = rollNewEvent(sol, events);
  if (newEvent) {
    events = [...events, newEvent];
    const def = EVENT_DEFS.find((d) => d.id === newEvent.defId);
    const immediate = def?.apply().immediate;
    if (immediate) {
      log = pushLog(log, { sol, kind: immediate.kind, message: immediate.message });
    } else {
      log = pushLog(log, {
        sol,
        kind: "warn",
        message: `Event: ${newEvent.name} (${newEvent.durationSols} sols).`,
      });
    }
  }

  let resources = { ...state.resources };
  let population = state.population;
  let morale = state.morale;

  for (const ev of events) {
    if (ev.startedSol !== sol) continue;
    const def = EVENT_DEFS.find((d) => d.id === ev.defId);
    const imm = def?.apply().immediate;
    if (!imm) continue;
    if (imm.resources) {
      for (const k in imm.resources) {
        const key = k as keyof Resources;
        resources[key] = (resources[key] ?? 0) + (imm.resources[key] ?? 0);
      }
    }
    if (imm.population) population = Math.max(0, population + imm.population);
    if (imm.morale) morale = Math.max(0, Math.min(100, morale + imm.morale));
  }

  const buildings = assignWorkers({ ...state, sol, events });
  const { prod, upkeep, housing } = computeProduction({ ...state, sol, events, buildings });

  let powerProd = prod.power;
  const powerUse = upkeep.power;
  let powerScale = 1;
  if (powerUse > powerProd && powerUse > 0) {
    powerScale = Math.max(0, powerProd / powerUse);
  }

  const completed = new Set(state.research.completed);
  const xeno = completed.has("xeno_biology") ? 0.8 : 1;
  const foodNeed = population * PER_COLONIST.food * xeno;
  const waterNeed = population * PER_COLONIST.water * xeno;
  const oxygenNeed = population * PER_COLONIST.oxygen;

  resources.food += prod.food * powerScale - foodNeed;
  resources.water += prod.water * powerScale - waterNeed - upkeep.water;
  resources.oxygen += prod.oxygen * powerScale - oxygenNeed;
  resources.minerals += prod.minerals * powerScale - upkeep.minerals;
  resources.alloys += prod.alloys * powerScale;
  resources.research += prod.research * powerScale;
  resources.credits += prod.credits;
  resources.power = powerProd - powerUse;

  let shortages: string[] = [];
  for (const k of ["food", "water", "oxygen"] as const) {
    if (resources[k] < 0) {
      shortages.push(k);
      resources[k] = 0;
    }
  }
  if (resources.minerals < 0) resources.minerals = 0;

  if (shortages.length > 0) {
    const loss = Math.max(1, Math.floor(population * POP_DECAY_PER_SOL));
    population = Math.max(0, population - loss);
    morale = Math.max(0, morale - 5);
    log = pushLog(log, {
      sol,
      kind: "bad",
      message: `Shortage of ${shortages.join(", ")}. Lost ${loss} colonist${loss === 1 ? "" : "s"}.`,
    });
  } else if (population < housing && morale > 40) {
    const growth = population * POP_GROWTH_PER_SOL;
    const gained = Math.random() < growth ? 1 : 0;
    if (gained > 0) {
      population += gained;
      log = pushLog(log, {
        sol,
        kind: "good",
        message: `A new colonist joined. Population now ${population}.`,
      });
    }
  }

  if (population > housing) {
    morale = Math.max(0, morale - 2);
  } else if (resources.food > 50 && resources.water > 50) {
    const moraleGain = completed.has("civic_council") ? 2 : 1;
    morale = Math.min(100, morale + moraleGain);
  }

  let research = state.research;
  if (research.current) {
    const def = RESEARCH[research.current];
    let progress = research.progress + resources.research;
    resources.research = 0;
    if (progress >= def.cost) {
      const completedNext = [...research.completed, research.current];
      log = pushLog(log, {
        sol,
        kind: "good",
        message: `Research complete: ${def.name}.`,
      });
      research = { completed: completedNext, current: null, progress: 0 };
    } else {
      research = { ...research, progress };
    }
  }

  if (population === 0 && state.population > 0) {
    log = pushLog(log, {
      sol,
      kind: "bad",
      message: "The last colonist has perished. The colony is silent.",
    });
  }

  return {
    ...state,
    sol,
    resources,
    population,
    morale,
    housing,
    buildings,
    events,
    research,
    log,
  };
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePersist(state: GameState) {
  if (typeof window === "undefined") return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    try {
      const snapshot: GameState = {
        ...state,
        selectedTile: null,
        buildSelection: null,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
    } catch {
      // ignore quota errors
    }
  }, 250);
}

function loadInitial(): GameState {
  if (typeof window === "undefined") return freshState();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== SAVE_VERSION) return freshState();
    return { ...freshState(), ...parsed, selectedTile: null, buildSelection: null };
  } catch {
    return freshState();
  }
}

export const useGame = create<GameStore>((set, get) => ({
  ...freshState(),

  selectTile: (idx) => set({ selectedTile: idx }),
  selectBuild: (id) => set({ buildSelection: id }),

  placeBuilding: (tile, id) => {
    const state = get();
    if (state.buildings.some((b) => b.tile === tile)) return;
    const def = BUILDINGS[id];
    if (def.requiresResearch && !state.research.completed.includes(def.requiresResearch)) return;
    if (!canAfford(state.resources, def.cost)) return;
    const placed: PlacedBuilding = {
      id: `b-${state.sol}-${tile}-${Math.floor(Math.random() * 9999)}`,
      building: id,
      tile,
      workers: 0,
      builtSol: state.sol,
    };
    const next: GameState = {
      ...state,
      resources: subtract(state.resources, def.cost),
      buildings: [...state.buildings, placed],
      log: pushLog(state.log, {
        sol: state.sol,
        kind: "info",
        message: `Constructed ${def.name}.`,
      }),
      buildSelection: null,
      selectedTile: tile,
    };
    set(next);
    schedulePersist(next);
  },

  demolishBuilding: (tile) => {
    const state = get();
    const b = state.buildings.find((x) => x.tile === tile);
    if (!b) return;
    const def = BUILDINGS[b.building];
    const refundRatio = 0.5;
    const refund: Partial<Resources> = {};
    for (const k in def.cost) {
      const key = k as keyof Resources;
      refund[key] = Math.floor((def.cost[key] ?? 0) * refundRatio);
    }
    const resources = { ...state.resources };
    for (const k in refund) {
      const key = k as keyof Resources;
      resources[key] += refund[key] ?? 0;
    }
    const next: GameState = {
      ...state,
      resources,
      buildings: state.buildings.filter((x) => x.tile !== tile),
      log: pushLog(state.log, {
        sol: state.sol,
        kind: "info",
        message: `Demolished ${def.name}.`,
      }),
    };
    set(next);
    schedulePersist(next);
  },

  setSpeed: (speed) => set({ speed }),

  tick: () => {
    const next = runTick(get());
    set(next);
    schedulePersist(next);
  },

  startResearch: (id) => {
    const state = get();
    if (state.research.completed.includes(id)) return;
    const def = RESEARCH[id];
    if (def.requires && !def.requires.every((r) => state.research.completed.includes(r))) return;
    set({ research: { ...state.research, current: id, progress: state.research.progress } });
  },

  reset: () => {
    const next = freshState();
    set(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch {
        // ignore
      }
    }
  },

  saveNow: () => {
    const state = get();
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, selectedTile: null, buildSelection: null }));
    } catch {
      // ignore
    }
  },

  loadFromJson: (json) => {
    try {
      const parsed = JSON.parse(json) as GameState;
      if (parsed.version !== SAVE_VERSION) return false;
      set({ ...freshState(), ...parsed, selectedTile: null, buildSelection: null });
      return true;
    } catch {
      return false;
    }
  },

  exportJson: () => {
    const state = get();
    return JSON.stringify({ ...state, selectedTile: null, buildSelection: null }, null, 2);
  },
}));

export function hydrateFromStorage() {
  if (typeof window === "undefined") return;
  const saved = loadInitial();
  useGame.setState(saved);
}
