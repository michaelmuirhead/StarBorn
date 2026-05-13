"use client";

import { buildingLiveStats, upgradeCostFor, useGame } from "@/game/store";
import { BUILDINGS } from "@/game/buildings";
import { TERRAIN_INFO } from "@/game/map";
import type { Resources } from "@/game/types";

const SHORT: Record<keyof Resources, string> = {
  credits: "₡",
  food: "food",
  water: "water",
  oxygen: "O₂",
  power: "⚡",
  minerals: "ore",
  alloys: "alloys",
  research: "rp",
};

function fmt(obj: Partial<Resources>, sign = "") {
  const entries = Object.entries(obj).filter(([, v]) => v && Math.abs(v) > 0.0001);
  if (entries.length === 0) return "—";
  return entries
    .map(([k, v]) => `${sign}${Math.round((v ?? 0) * 10) / 10} ${SHORT[k as keyof Resources]}`)
    .join(", ");
}

export default function TileInspector() {
  const tiles = useGame((s) => s.tiles);
  const buildings = useGame((s) => s.buildings);
  const selectedTile = useGame((s) => s.selectedTile);
  const sol = useGame((s) => s.sol);
  const resources = useGame((s) => s.resources);
  const state = useGame();

  const upgrade = useGame((s) => s.upgradeBuilding);
  const demolish = useGame((s) => s.demolishBuilding);

  if (selectedTile === null) {
    return (
      <div className="text-[11px] text-space-200">
        Click a tile on the map to inspect it.
      </div>
    );
  }

  const tile = tiles[selectedTile];
  const placed = buildings.find((b) => b.tile === tile.index);

  if (!placed) {
    return (
      <div className="text-xs text-space-200 leading-tight">
        <div>
          <span className="text-mars-100">{TERRAIN_INFO[tile.terrain].name}</span>
        </div>
        {TERRAIN_INFO[tile.terrain].hint && (
          <div className="text-[11px] text-emerald-300 mt-0.5">
            {TERRAIN_INFO[tile.terrain].hint}
          </div>
        )}
        <div className="mt-1 text-[11px] text-space-200">Empty tile. Pick a building below to construct.</div>
      </div>
    );
  }

  const def = BUILDINGS[placed.building];
  const stats = buildingLiveStats(state, placed);
  const upgradeCost = upgradeCostFor(placed);
  const upgradable =
    upgradeCost &&
    Object.entries(upgradeCost).every(
      ([k, v]) => (resources[k as keyof Resources] ?? 0) >= (v ?? 0)
    );

  return (
    <div className="text-xs text-space-200 leading-tight space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-mars-100">
          {def.icon} {def.name}{" "}
          <span className="text-[11px] text-space-200">Lvl {placed.level}</span>
        </span>
        <span className="text-[10px] uppercase tracking-widest">
          {stats.status === "construction"
            ? `${placed.constructionDoneSol - sol} sols`
            : stats.status === "understaffed"
              ? `${stats.workersAssigned}/${stats.workersNeeded} staffed`
              : "online"}
        </span>
      </div>
      <div className="text-[11px] text-space-200">{TERRAIN_INFO[tile.terrain].name}</div>
      {TERRAIN_INFO[tile.terrain].hint && (
        <div className="text-[11px] text-emerald-300">{TERRAIN_INFO[tile.terrain].hint}</div>
      )}
      <div className="grid grid-cols-2 gap-x-2 font-mono text-[11px] pt-1">
        <span className="text-emerald-300">{fmt(stats.prod, "+")}</span>
        <span className="text-rose-300">{fmt(stats.upkeep, "-")}</span>
      </div>
      {stats.housing > 0 && (
        <div className="text-[11px] text-mars-100 font-mono">+{stats.housing} housing</div>
      )}
      {stats.atmospherePerSol > 0 && (
        <div className="text-[11px] text-emerald-300 font-mono">
          +{stats.atmospherePerSol.toFixed(2)} atmosphere / sol
        </div>
      )}
      {(stats.sameNeighbors > 0 || stats.pairNeighbors > 0) && (
        <div className="text-[11px] text-space-200">
          adjacency: {stats.sameNeighbors > 0 && `${stats.sameNeighbors} same`}
          {stats.pairNeighbors > 0 && ` · ${stats.pairNeighbors} paired`}
        </div>
      )}
      <div className="flex items-center gap-2 pt-1">
        {upgradeCost && (
          <button
            className={`btn !py-0.5 !px-2 text-[11px] ${upgradable ? "btn-primary" : ""}`}
            disabled={!upgradable}
            onClick={() => upgrade(placed.tile)}
            title={`Upgrade to Lvl ${placed.level + 1} (${fmt(upgradeCost)})`}
          >
            Upgrade → Lvl {placed.level + 1} ({fmt(upgradeCost)})
          </button>
        )}
        <button className="btn !py-0.5 !px-2 text-[11px]" onClick={() => demolish(placed.tile)}>
          Demolish
        </button>
      </div>
    </div>
  );
}
