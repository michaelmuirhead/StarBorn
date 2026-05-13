"use client";

import { create } from "zustand";
import { BUILDINGS } from "./buildings";
import { RESEARCH } from "./research";
import { EVENT_DEFS } from "./events";
import { generateTiles, tileNeighbors } from "./map";
import { nextOfferAfter, rollOffer } from "./trade";
import {
  ATMOSPHERE_VICTORY,
  BASE_STORAGE_CAPS,
  PER_COLONIST,
  POP_DECAY_PER_SOL,
  POP_GROWTH_PER_SOL,
  SAVE_KEY,
  SAVE_VERSION,
  STARTING_HOUSING,
  STARTING_MORALE,
  STARTING_POPULATION,
  STARTING_RESOURCES,
  STORM_SEASON_END,
  STORM_SEASON_START,
  YEAR_SOLS,
  FIRST_OFFER_SOL,
} from "./constants";
import type {
  ActiveEvent,
  BuildingId,
  GameState,
  LogEntry,
  PlacedBuilding,
  ResearchId,
  Resources,
  Tile,
  TradeOffer,
} from "./types";

interface Actions {
  selectTile: (idx: number | null) => void;
  build: (id: BuildingId) => void;
  upgradeBuilding: (tile: number) => void;
  demolishBuilding: (tile: number) => void;
  setSpeed: (s: 0 | 1 | 2 | 4) => void;
  tick: () => void;
  startResearch: (id: ResearchId) => void;
  reset: () => void;
  saveNow: () => void;
  loadFromJson: (json: string) => boolean;
  exportJson: () => string;
  acceptOffer: () => void;
  declineOffer: () => void;
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
    storageCaps: { ...BASE_STORAGE_CAPS },
    population: STARTING_POPULATION,
    morale: STARTING_MORALE,
    housing: STARTING_HOUSING,
    atmosphere: 0,
    victory: false,
    tiles,
    buildings: [],
    research: { completed: [], current: null, progress: 0 },
    events: [],
    pendingOffer: null,
    nextOfferSol: FIRST_OFFER_SOL,
    log: [
      {
        sol: 1,
        kind: "info",
        message:
          "Colony ship Aresward touches down. 12 colonists step onto Mars. Build solar, water, food, oxygen — quickly.",
      },
    ],
    selectedTile: null,
  };
}

export function autoPickTile(state: GameState, buildingId: BuildingId): number | null {
  const def = BUILDINGS[buildingId];
  const occupied = new Set(state.buildings.map((b) => b.tile));
  const candidates = state.tiles.filter((t) => !occupied.has(t.index));
  if (candidates.length === 0) return null;

  const byTile = new Map(state.buildings.map((b) => [b.tile, b]));

  const scored = candidates.map((t) => {
    let score = 0;
    const terrainBonus = def.terrainBonus?.[t.terrain];
    if (terrainBonus) {
      for (const k in terrainBonus) {
        const key = k as keyof Resources;
        score += (terrainBonus[key] ?? 0) * 10;
      }
    }
    const neighbors = tileNeighbors(state.tiles, t);
    for (const n of neighbors) {
      const nb = byTile.get(n.index);
      if (!nb) continue;
      if (def.adjacency?.sameType && nb.building === buildingId) {
        score += def.adjacency.sameType.perNeighbor * 5;
      }
      if (def.adjacency?.pair && nb.building === def.adjacency.pair.other) {
        score += def.adjacency.pair.perNeighbor * 5;
      }
      if (def.adjacency?.moralePerSameNeighbor && nb.building === buildingId) {
        score += def.adjacency.moralePerSameNeighbor * 2;
      }
    }
    return { tile: t, score };
  });

  scored.sort((a, b) => b.score - a.score || a.tile.index - b.tile.index);
  return scored[0].tile.index;
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

function addPartial(res: Resources, delta: Partial<Resources>): Resources {
  const next = { ...res };
  for (const k in delta) {
    const key = k as keyof Resources;
    next[key] = (next[key] ?? 0) + (delta[key] ?? 0);
  }
  return next;
}

function pushLog(log: LogEntry[], entry: LogEntry, max = 80): LogEntry[] {
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

export function solInYear(sol: number): number {
  return ((sol - 1) % YEAR_SOLS) + 1;
}

export function isStormSeason(sol: number): boolean {
  const s = solInYear(sol);
  return s >= STORM_SEASON_START && s <= STORM_SEASON_END;
}

function isOperational(b: PlacedBuilding, sol: number): boolean {
  return sol >= b.constructionDoneSol;
}

function levelMultipliers(
  b: PlacedBuilding
): { outputMult: number; upkeepMult: number } {
  const def = BUILDINGS[b.building];
  if (b.level <= 1 || !def.upgrades) return { outputMult: 1, upkeepMult: 1 };
  const tier = def.upgrades[b.level - 2];
  if (!tier) return { outputMult: 1, upkeepMult: 1 };
  return { outputMult: tier.outputMult, upkeepMult: tier.upkeepMult };
}

export function upgradeCostFor(b: PlacedBuilding): Partial<Resources> | null {
  const def = BUILDINGS[b.building];
  if (!def.upgrades) return null;
  const nextTier = def.upgrades[b.level - 1];
  return nextTier ? nextTier.cost : null;
}

function rollNewEvent(sol: number, active: ActiveEvent[]): ActiveEvent | null {
  const baseChance = isStormSeason(sol) ? 0.3 : 0.18;
  if (Math.random() > baseChance) return null;
  const stormBoost = isStormSeason(sol) ? 4 : 1;
  const eligible = EVENT_DEFS.filter(
    (e) => sol >= e.minSol && !active.some((a) => a.defId === e.id)
  );
  if (eligible.length === 0) return null;
  const weighted = eligible.map((e) => ({
    def: e,
    weight: e.id === "dust_storm" ? e.weight * stormBoost : e.weight,
  }));
  const totalWeight = weighted.reduce((s, e) => s + e.weight, 0);
  let pick = Math.random() * totalWeight;
  for (const e of weighted) {
    pick -= e.weight;
    if (pick <= 0) {
      const result = e.def.apply();
      return {
        id: `${e.def.id}-${sol}-${Math.floor(Math.random() * 9999)}`,
        defId: e.def.id,
        name: e.def.name,
        description: e.def.description,
        startedSol: sol,
        durationSols: e.def.durationSols,
        modifiers: result.modifiers,
      };
    }
  }
  return null;
}

export interface BuildingLiveStats {
  prod: Partial<Resources>;
  upkeep: Partial<Resources>;
  housing: number;
  atmospherePerSol: number;
  status: "operational" | "construction" | "understaffed";
  sameNeighbors: number;
  pairNeighbors: number;
  level: number;
  workersNeeded: number;
  workersAssigned: number;
}

function neighborsByTileMap(tiles: Tile[]) {
  return new Map(tiles.map((t) => [t.index, tileNeighbors(tiles, t)]));
}

export function buildingLiveStats(
  state: GameState,
  placed: PlacedBuilding,
  precomputed?: {
    neighborsByTile: Map<number, Tile[]>;
    buildingByTile: Map<number, PlacedBuilding>;
  }
): BuildingLiveStats {
  const def = BUILDINGS[placed.building];
  const tile = state.tiles[placed.tile];
  const completed = new Set(state.research.completed);
  const solarMult = modifierFor(state.events, "solarMultiplier");
  const foodMult = modifierFor(state.events, "foodMultiplier");
  const researchEventMult = modifierFor(state.events, "researchMultiplier");

  const neighbors =
    precomputed?.neighborsByTile.get(placed.tile) ?? tileNeighbors(state.tiles, tile);
  const byTile =
    precomputed?.buildingByTile ??
    new Map<number, PlacedBuilding>(state.buildings.map((b) => [b.tile, b]));

  let sameNeighbors = 0;
  let pairNeighbors = 0;
  for (const n of neighbors) {
    const nb = byTile.get(n.index);
    if (!nb || !isOperational(nb, state.sol)) continue;
    if (nb.building === placed.building && nb.id !== placed.id) sameNeighbors++;
    if (def.adjacency?.pair && nb.building === def.adjacency.pair.other) pairNeighbors++;
  }

  const { outputMult, upkeepMult } = levelMultipliers(placed);
  const terrain = def.terrainBonus?.[tile.terrain] ?? {};

  const prod: Partial<Resources> = {};
  const upkeep: Partial<Resources> = {};

  if (isOperational(placed, state.sol)) {
    for (const k in def.output) {
      const key = k as keyof Resources;
      let amount = (def.output[key] ?? 0) + (terrain[key] ?? 0);
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

      if (def.adjacency?.sameType?.resource === key) {
        const a = def.adjacency.sameType;
        const bonus = Math.min(a.max ?? Infinity, sameNeighbors * a.perNeighbor);
        amount += bonus;
      }
      if (def.adjacency?.pair?.resource === key) {
        const a = def.adjacency.pair;
        const bonus = Math.min(a.max ?? Infinity, pairNeighbors * a.perNeighbor);
        amount += bonus;
      }
      amount *= outputMult;
      prod[key] = (prod[key] ?? 0) + amount;
    }

    for (const k in def.upkeep) {
      const key = k as keyof Resources;
      upkeep[key] = (upkeep[key] ?? 0) + (def.upkeep[key] ?? 0) * upkeepMult;
    }
    for (const k in def.maintenance ?? {}) {
      const key = k as keyof Resources;
      upkeep[key] = (upkeep[key] ?? 0) + (def.maintenance![key] ?? 0) * upkeepMult;
    }
  }

  const housing = def.housing
    ? Math.floor((def.housing * (completed.has("advanced_habitats") ? 1.5 : 1)) * outputMult)
    : 0;
  const atmospherePerSol = (def.atmospherePerSol ?? 0) * outputMult;

  let status: BuildingLiveStats["status"] = "operational";
  if (!isOperational(placed, state.sol)) status = "construction";
  else if (def.workers > 0 && placed.workers < def.workers) status = "understaffed";

  return {
    prod,
    upkeep,
    housing,
    atmospherePerSol,
    status,
    sameNeighbors,
    pairNeighbors,
    level: placed.level,
    workersNeeded: def.workers,
    workersAssigned: placed.workers,
  };
}

interface Production {
  prod: Resources;
  upkeep: Resources;
  housing: number;
  workersNeeded: number;
  storageCaps: Resources;
  atmosphereGain: number;
  perBuilding: Map<string, BuildingLiveStats>;
}

function computeProduction(state: GameState): Production {
  const prod: Resources = { ...EMPTY_RESOURCES };
  const upkeep: Resources = { ...EMPTY_RESOURCES };
  const storageCaps: Resources = { ...BASE_STORAGE_CAPS };
  let housing = 0;
  let workersNeeded = 0;
  let atmosphereGain = 0;

  const neighborsByTile = neighborsByTileMap(state.tiles);
  const buildingByTile = new Map<number, PlacedBuilding>(
    state.buildings.map((b) => [b.tile, b])
  );

  const perBuilding = new Map<string, BuildingLiveStats>();
  for (const b of state.buildings) {
    const def = BUILDINGS[b.building];
    workersNeeded += def.workers;

    const stats = buildingLiveStats(state, b, { neighborsByTile, buildingByTile });
    perBuilding.set(b.id, stats);

    if (isOperational(b, state.sol) && def.storage) {
      for (const k in def.storage) {
        const key = k as keyof Resources;
        const cap = def.storage[key] ?? 0;
        if (storageCaps[key] !== Infinity) {
          storageCaps[key] = (storageCaps[key] ?? 0) + cap;
        }
      }
    }
    if (!isOperational(b, state.sol)) continue;
    if (def.workers > 0 && b.workers < def.workers) continue;

    for (const k in stats.prod) {
      const key = k as keyof Resources;
      prod[key] += stats.prod[key] ?? 0;
    }
    for (const k in stats.upkeep) {
      const key = k as keyof Resources;
      upkeep[key] += stats.upkeep[key] ?? 0;
    }
    housing += stats.housing;
    atmosphereGain += stats.atmospherePerSol;
  }

  return { prod, upkeep, housing, workersNeeded, storageCaps, atmosphereGain, perBuilding };
}

function assignWorkers(state: GameState): PlacedBuilding[] {
  let available = state.population;
  return state.buildings.map((b) => {
    const def = BUILDINGS[b.building];
    if (def.workers === 0 || !isOperational(b, state.sol)) return { ...b, workers: 0 };
    const assigned = Math.min(def.workers, available);
    available -= assigned;
    return { ...b, workers: assigned };
  });
}

function clampToCaps(res: Resources, caps: Resources): { res: Resources; overflowed: string[] } {
  const next = { ...res };
  const overflowed: string[] = [];
  (Object.keys(next) as Array<keyof Resources>).forEach((k) => {
    const cap = caps[k];
    if (cap !== Infinity && next[k] > cap) {
      if (next[k] - cap > 0.5) overflowed.push(String(k));
      next[k] = cap;
    }
  });
  return { res: next, overflowed };
}

function applyOperational(state: GameState): GameState {
  // Mark just-completed constructions in the log.
  const justFinished = state.buildings.filter(
    (b) => b.constructionDoneSol === state.sol
  );
  if (justFinished.length === 0) return state;
  let log = state.log;
  for (const b of justFinished) {
    log = pushLog(log, {
      sol: state.sol,
      kind: "good",
      message: `${BUILDINGS[b.building].name} online.`,
    });
  }
  return { ...state, log };
}

function runTick(state: GameState): GameState {
  const sol = state.sol + 1;

  // Expire active events.
  let events = state.events.filter((e) => sol - e.startedSol < e.durationSols);
  let log = state.log;

  // Roll a new event (storm-season-weighted).
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
  let atmosphere = state.atmosphere;

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
  const production = computeProduction({ ...state, sol, events, buildings });
  const { prod, upkeep, housing, storageCaps, atmosphereGain } = production;

  // Power balance — if consumption exceeds production, scale most outputs down.
  const powerProd = prod.power;
  const powerUse = upkeep.power;
  let powerScale = 1;
  if (powerUse > powerProd && powerUse > 0) {
    powerScale = Math.max(0, powerProd / powerUse);
  }

  const completed = new Set(state.research.completed);
  const xeno = completed.has("xeno_biology") ? 0.8 : 1;
  const atmosScale = 1 - atmosphere / ATMOSPHERE_VICTORY;
  const foodNeed = population * PER_COLONIST.food * xeno;
  const waterNeed = population * PER_COLONIST.water * xeno;
  const oxygenNeed = population * PER_COLONIST.oxygen * atmosScale;

  resources.food += prod.food * powerScale - foodNeed;
  resources.water += prod.water * powerScale - waterNeed - upkeep.water;
  resources.oxygen += prod.oxygen * powerScale - oxygenNeed;
  resources.minerals += prod.minerals * powerScale - upkeep.minerals;
  resources.alloys += prod.alloys * powerScale - (upkeep.alloys ?? 0);
  resources.research += prod.research * powerScale;
  resources.credits += prod.credits;
  resources.power = powerProd - powerUse;

  // Adjacency morale (habitat clustering).
  let moraleAdj = 0;
  for (const stats of production.perBuilding.values()) {
    // Morale from habitat clustering: 1 per adjacent habitat, capped per building at 3, total cap 5.
    // Implemented inline below to avoid building->def lookup here.
  }
  for (const b of state.buildings) {
    const def = BUILDINGS[b.building];
    if (!def.adjacency?.moralePerSameNeighbor) continue;
    if (!isOperational(b, sol)) continue;
    const stats = production.perBuilding.get(b.id);
    if (!stats) continue;
    moraleAdj += Math.min(3, stats.sameNeighbors * def.adjacency.moralePerSameNeighbor);
  }
  moraleAdj = Math.min(5, moraleAdj);

  // Clamp resources to storage caps (lose overflow with a quiet log entry).
  const clamped = clampToCaps(resources, storageCaps);
  resources = clamped.res;
  if (clamped.overflowed.length > 0 && sol % 5 === 0) {
    log = pushLog(log, {
      sol,
      kind: "warn",
      message: `Storage full: wasting surplus ${clamped.overflowed.join(", ")}.`,
    });
  }

  // Atmosphere accretion.
  if (atmosphereGain > 0) {
    atmosphere = Math.min(ATMOSPHERE_VICTORY, atmosphere + atmosphereGain * powerScale);
  }

  // Shortages.
  let shortages: string[] = [];
  for (const k of ["food", "water", "oxygen"] as const) {
    if (resources[k] < 0) {
      shortages.push(k);
      resources[k] = 0;
    }
  }
  if (resources.minerals < 0) resources.minerals = 0;
  if (resources.alloys < 0) resources.alloys = 0;

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
  morale = Math.min(100, Math.max(0, morale + moraleAdj));

  // Research progress.
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

  // Trade offers.
  let pendingOffer = state.pendingOffer;
  let nextOfferSol = state.nextOfferSol;
  if (pendingOffer && sol > pendingOffer.expiresSol) {
    log = pushLog(log, {
      sol,
      kind: "info",
      message: `Trade offer expired: ${pendingOffer.flavor}`,
    });
    pendingOffer = null;
    nextOfferSol = nextOfferAfter(sol);
  }
  if (!pendingOffer && sol >= nextOfferSol) {
    pendingOffer = rollOffer(sol);
    log = pushLog(log, {
      sol,
      kind: "info",
      message: `Trade offer: ${pendingOffer.flavor}`,
    });
  }

  // Victory.
  let victory = state.victory;
  if (!victory && atmosphere >= ATMOSPHERE_VICTORY) {
    victory = true;
    log = pushLog(log, {
      sol,
      kind: "good",
      message:
        "Terraforming complete. Mars breathes on its own. The colony has come of age.",
    });
  }

  if (population === 0 && state.population > 0) {
    log = pushLog(log, {
      sol,
      kind: "bad",
      message: "The last colonist has perished. The colony is silent.",
    });
  }

  return applyOperational({
    ...state,
    sol,
    resources,
    storageCaps,
    population,
    morale,
    housing,
    atmosphere,
    victory,
    buildings,
    events,
    pendingOffer,
    nextOfferSol,
    research,
    log,
  });
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePersist(state: GameState) {
  if (typeof window === "undefined") return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    try {
      const snapshot: GameState = { ...state, selectedTile: null };
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
    return { ...freshState(), ...parsed, selectedTile: null };
  } catch {
    return freshState();
  }
}

export const useGame = create<GameStore>((set, get) => ({
  ...freshState(),

  selectTile: (idx) => set({ selectedTile: idx }),

  build: (id) => {
    const state = get();
    const def = BUILDINGS[id];
    if (def.requiresResearch && !state.research.completed.includes(def.requiresResearch)) return;
    if (!canAfford(state.resources, def.cost)) return;
    const tile = autoPickTile(state, id);
    if (tile === null) {
      set({
        log: pushLog(state.log, {
          sol: state.sol,
          kind: "warn",
          message: "No empty tiles left. Demolish something first.",
        }),
      });
      return;
    }
    const placed: PlacedBuilding = {
      id: `b-${state.sol}-${tile}-${Math.floor(Math.random() * 9999)}`,
      building: id,
      tile,
      workers: 0,
      builtSol: state.sol,
      constructionDoneSol: state.sol + def.constructionSols,
      level: 1,
    };
    const next: GameState = {
      ...state,
      resources: subtract(state.resources, def.cost),
      buildings: [...state.buildings, placed],
      log: pushLog(state.log, {
        sol: state.sol,
        kind: "info",
        message: `Construction started: ${def.name} (${def.constructionSols} sols).`,
      }),
      selectedTile: tile,
    };
    set(next);
    schedulePersist(next);
  },

  upgradeBuilding: (tile) => {
    const state = get();
    const b = state.buildings.find((x) => x.tile === tile);
    if (!b) return;
    const cost = upgradeCostFor(b);
    if (!cost) return;
    if (!canAfford(state.resources, cost)) return;
    const def = BUILDINGS[b.building];
    const next: GameState = {
      ...state,
      resources: subtract(state.resources, cost),
      buildings: state.buildings.map((x) =>
        x.id === b.id ? { ...x, level: x.level + 1 } : x
      ),
      log: pushLog(state.log, {
        sol: state.sol,
        kind: "good",
        message: `${def.name} upgraded to Lvl ${b.level + 1}.`,
      }),
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
    // Refund base cost + any upgrade costs paid so far.
    const total: Partial<Resources> = { ...def.cost };
    if (def.upgrades) {
      for (let i = 0; i < b.level - 1; i++) {
        for (const k in def.upgrades[i].cost) {
          const key = k as keyof Resources;
          total[key] = (total[key] ?? 0) + (def.upgrades[i].cost[key] ?? 0);
        }
      }
    }
    const refund: Partial<Resources> = {};
    for (const k in total) {
      const key = k as keyof Resources;
      refund[key] = Math.floor((total[key] ?? 0) * refundRatio);
    }
    const next: GameState = {
      ...state,
      resources: addPartial(state.resources, refund),
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
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ ...state, selectedTile: null })
      );
    } catch {
      // ignore
    }
  },

  loadFromJson: (json) => {
    try {
      const parsed = JSON.parse(json) as GameState;
      if (parsed.version !== SAVE_VERSION) return false;
      set({ ...freshState(), ...parsed, selectedTile: null });
      return true;
    } catch {
      return false;
    }
  },

  exportJson: () => {
    const state = get();
    return JSON.stringify({ ...state, selectedTile: null }, null, 2);
  },

  acceptOffer: () => {
    const state = get();
    if (!state.pendingOffer) return;
    if (!canAfford(state.resources, state.pendingOffer.cost)) {
      set({
        log: pushLog(state.log, {
          sol: state.sol,
          kind: "warn",
          message: "Can't afford that offer.",
        }),
      });
      return;
    }
    const after: GameState = {
      ...state,
      resources: addPartial(
        subtract(state.resources, state.pendingOffer.cost),
        state.pendingOffer.reward
      ),
      pendingOffer: null,
      nextOfferSol: nextOfferAfter(state.sol),
      log: pushLog(state.log, {
        sol: state.sol,
        kind: "good",
        message: `Trade accepted: ${state.pendingOffer.flavor}`,
      }),
    };
    set(after);
    schedulePersist(after);
  },

  declineOffer: () => {
    const state = get();
    if (!state.pendingOffer) return;
    const after: GameState = {
      ...state,
      pendingOffer: null,
      nextOfferSol: nextOfferAfter(state.sol),
      log: pushLog(state.log, {
        sol: state.sol,
        kind: "info",
        message: "Trade offer declined.",
      }),
    };
    set(after);
    schedulePersist(after);
  },
}));

export function hydrateFromStorage() {
  if (typeof window === "undefined") return;
  const saved = loadInitial();
  useGame.setState(saved);
}

// Helpers exposed for the UI.
export function snapshotProduction(state: GameState) {
  return computeProduction(state);
}

export function depletionWarning(
  state: GameState
): Array<{ key: keyof Resources; solsLeft: number }> {
  const { prod, upkeep } = computeProduction(state);
  const completed = new Set(state.research.completed);
  const xeno = completed.has("xeno_biology") ? 0.8 : 1;
  const atmosScale = 1 - state.atmosphere / ATMOSPHERE_VICTORY;
  const needs: Partial<Record<keyof Resources, number>> = {
    food: state.population * PER_COLONIST.food * xeno - prod.food,
    water:
      state.population * PER_COLONIST.water * xeno + (upkeep.water ?? 0) - prod.water,
    oxygen: state.population * PER_COLONIST.oxygen * atmosScale - prod.oxygen,
  };
  const out: Array<{ key: keyof Resources; solsLeft: number }> = [];
  for (const k in needs) {
    const key = k as keyof Resources;
    const drain = needs[key] ?? 0;
    if (drain <= 0) continue;
    const have = state.resources[key];
    const sols = Math.floor(have / drain);
    if (sols <= 10) out.push({ key, solsLeft: sols });
  }
  return out;
}
