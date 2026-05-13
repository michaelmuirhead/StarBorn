export type ResourceKey =
  | "credits"
  | "food"
  | "water"
  | "oxygen"
  | "power"
  | "minerals"
  | "alloys"
  | "research";

export type Resources = Record<ResourceKey, number>;

export type BuildingId =
  | "habitat"
  | "solar"
  | "water_extractor"
  | "greenhouse"
  | "oxygen_gen"
  | "mine"
  | "lab"
  | "foundry"
  | "spaceport"
  | "storage_tank"
  | "atmospheric_processor";

export type TerrainId = "plain" | "ice" | "ore" | "ridge";

export interface AdjacencyBonus {
  // Bonus per neighboring building of the same type.
  sameType?: { resource: keyof Resources; perNeighbor: number; max?: number };
  // Pairing bonus: matching neighbors of a specific other building.
  pair?: {
    other: BuildingId;
    resource: keyof Resources;
    perNeighbor: number;
    max?: number;
  };
  // Flat morale contribution per neighbor of the same type (per sol, capped).
  moralePerSameNeighbor?: number;
}

export interface BuildingDef {
  id: BuildingId;
  name: string;
  icon: string;
  description: string;
  cost: Partial<Resources>;
  upkeep: Partial<Resources>;
  output: Partial<Resources>;
  housing?: number;
  workers: number;
  requiresResearch?: ResearchId;
  terrainBonus?: Partial<Record<TerrainId, Partial<Resources>>>;
  constructionSols: number;
  // Storage cap contribution while standing.
  storage?: Partial<Resources>;
  // Upgrade tiers (levels 2..N). Each entry is what it costs to reach that level.
  upgrades?: Array<{ cost: Partial<Resources>; outputMult: number; upkeepMult: number }>;
  // Building maintenance: light passive drain that scales with level. Counted in upkeep.
  maintenance?: Partial<Resources>;
  adjacency?: AdjacencyBonus;
  // Special hook for terraforming: atmosphere contribution per sol per level.
  atmospherePerSol?: number;
}

export interface PlacedBuilding {
  id: string;
  building: BuildingId;
  tile: number;
  workers: number;
  builtSol: number;
  constructionDoneSol: number;
  level: number;
}

export type ResearchId =
  | "hydroponics"
  | "solar_ii"
  | "advanced_habitats"
  | "alloy_metallurgy"
  | "spaceflight"
  | "robotics"
  | "xeno_biology"
  | "civic_council"
  | "atmospherics";

export interface ResearchDef {
  id: ResearchId;
  name: string;
  description: string;
  cost: number;
  requires?: ResearchId[];
  effects: string[];
}

export interface EventEffect {
  resources?: Partial<Resources>;
  population?: number;
  morale?: number;
  message: string;
}

export interface ActiveEvent {
  id: string;
  defId: string;
  name: string;
  description: string;
  startedSol: number;
  durationSols: number;
  modifiers?: {
    solarMultiplier?: number;
    foodMultiplier?: number;
    researchMultiplier?: number;
  };
}

export interface TradeOffer {
  id: string;
  flavor: string;
  cost: Partial<Resources>;
  reward: Partial<Resources>;
  offeredSol: number;
  expiresSol: number;
}

export interface LogEntry {
  sol: number;
  kind: "info" | "warn" | "good" | "bad";
  message: string;
}

export interface Tile {
  index: number;
  q: number;
  r: number;
  terrain: TerrainId;
}

export type Speed = 0 | 1 | 2 | 4;

export interface GameState {
  version: number;
  sol: number;
  speed: Speed;
  resources: Resources;
  storageCaps: Resources;
  population: number;
  morale: number;
  housing: number;
  atmosphere: number;
  victory: boolean;
  tiles: Tile[];
  buildings: PlacedBuilding[];
  research: {
    completed: ResearchId[];
    current: ResearchId | null;
    progress: number;
  };
  events: ActiveEvent[];
  pendingOffer: TradeOffer | null;
  nextOfferSol: number;
  log: LogEntry[];
  selectedTile: number | null;
}
