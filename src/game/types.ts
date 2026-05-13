export type ResourceKey =
  | "credits"
  | "food"
  | "water"
  | "oxygen"
  | "power"
  | "minerals"
  | "alloys"
  | "rare_earths"
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
  | "atmospheric_processor"
  | "barracks"
  | "battery"
  | "geothermal_plant"
  | "fusion_reactor"
  | "mega_habitat"
  | "vat_farm"
  | "orbital_dock";

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
  soldierCapacity?: number;
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
  | "atmospherics"
  | "standing_army"
  | "security_apparatus"
  | "free_press"
  | "independence_movement"
  | "battery_storage"
  | "geothermal_power"
  | "fusion_power"
  | "modular_construction"
  | "deep_drilling"
  | "megastructures"
  | "medical_doctrine"
  | "vat_protein"
  | "longevity"
  | "computing"
  | "cybernetics"
  | "quantum_computing"
  | "infantry_doctrine"
  | "combined_arms";

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

export type LawCategoryId =
  | "taxation"
  | "conscription"
  | "liberties"
  | "earth_relations"
  | "immigration"
  | "research_priority"
  | "calendar";

export interface LawEffects {
  creditsPerPop?: number;
  conscriptionRate?: number;
  moraleDelta?: number;
  populationGrowthMult?: number;
  researchMult?: number;
  productionMult?: number;
  maintenanceMult?: number;
  loyaltyDrift?: number;
  earthSupplyMult?: number;
}

export interface LawOptionDef {
  id: string;
  name: string;
  description: string;
  effects: LawEffects;
  factionReaction: Partial<Record<FactionId, number>>;
  requiresResearch?: ResearchId;
  requiresGovernment?: GovernmentType[];
  requiresIndependence?: boolean;
  isDefault?: boolean;
}

export interface LawCategoryDef {
  id: LawCategoryId;
  name: string;
  description: string;
  options: LawOptionDef[];
}

export interface ActiveLaws {
  options: Record<LawCategoryId, string>;
  cooldownUntilSol: Partial<Record<LawCategoryId, number>>;
}

export interface ChoiceEffect {
  resources?: Partial<Resources>;
  morale?: number;
  loyalty?: number;
  factionHappiness?: Partial<Record<FactionId, number>>;
  factionInfluence?: Partial<Record<FactionId, number>>;
  setGovernment?: GovernmentType;
  setIndependence?: boolean;
  logKind?: LogEntry["kind"];
  logMessage?: string;
}

export interface ChoiceEventChoice {
  id: string;
  label: string;
  description: string;
  effect: ChoiceEffect;
}

export interface PendingChoice {
  defId: string;
  offeredSol: number;
}

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
  laws: ActiveLaws;
  pendingChoice: PendingChoice | null;
  firedChoiceEvents: Record<string, number>;
  independence: boolean;
  independenceSol: number | null;
  cityName: string;
  onboarded: boolean;
  log: LogEntry[];
  selectedTile: number | null;
}
