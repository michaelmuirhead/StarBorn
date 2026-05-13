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

export type Stratum = "workers" | "specialists" | "soldiers";

export type Strata = Record<Stratum, number>;

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
  staffStratum?: Stratum;
  requiresResearch?: ResearchId;
  terrainBonus?: Partial<Record<TerrainId, Partial<Resources>>>;
  constructionSols: number;
  storage?: Partial<Resources>;
  upgrades?: Array<{ cost: Partial<Resources>; outputMult: number; upkeepMult: number }>;
  maintenance?: Partial<Resources>;
  adjacency?: AdjacencyBonus;
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

export type TraitId =
  | "engineer"
  | "charismatic"
  | "hawk"
  | "pragmatic"
  | "visionary"
  | "frugal"
  | "ambitious"
  | "cautious"
  | "bureaucrat";

export interface TraitDef {
  id: TraitId;
  name: string;
  description: string;
}

export interface Governor {
  name: string;
  title: string;
  traits: TraitId[];
  appointedSol: number;
}

export type GovernmentType =
  | "corporate_colony"
  | "provisional_council"
  | "martian_republic";

export interface GovernmentDef {
  id: GovernmentType;
  name: string;
  description: string;
}

export type FactionId = "loyalists" | "labour" | "engineers";

export interface FactionDef {
  id: FactionId;
  name: string;
  shortName: string;
  description: string;
  color: string;
}

export interface FactionState {
  id: FactionId;
  influence: number;
  happiness: number;
}

export interface GameState {
  version: number;
  sol: number;
  speed: Speed;
  resources: Resources;
  storageCaps: Resources;
  strata: Strata;
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
  governor: Governor;
  government: GovernmentType;
  loyalty: number;
  factions: FactionState[];
  log: LogEntry[];
  selectedTile: number | null;
}
