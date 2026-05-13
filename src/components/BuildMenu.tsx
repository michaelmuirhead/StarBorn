"use client";

import { autoPickTile, useGame } from "@/game/store";
import { BUILDINGS, BUILDING_ORDER } from "@/game/buildings";
import TileInspector from "./TileInspector";
import type { Resources, ResourceKey } from "@/game/types";

const RESOURCE_LABEL: Record<ResourceKey, string> = {
  credits: "₡",
  food: "food",
  water: "water",
  oxygen: "O₂",
  power: "⚡",
  minerals: "ore",
  alloys: "alloys",
  research: "rp",
};

function describe(obj: Partial<Resources>, sign = "") {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined && v !== 0);
  if (entries.length === 0) return "—";
  return entries
    .map(([k, v]) => `${sign}${v} ${RESOURCE_LABEL[k as ResourceKey]}`)
    .join(", ");
}

export default function BuildMenu() {
  const resources = useGame((s) => s.resources);
  const completed = useGame((s) => s.research.completed);
  const build = useGame((s) => s.build);
  const state = useGame();

  return (
    <section className="panel p-3 flex flex-col gap-2">
      <h2 className="text-sm uppercase tracking-widest text-mars-200">Tile</h2>
      <TileInspector />
      <h2 className="text-sm uppercase tracking-widest text-mars-200 pt-2">Construction</h2>
      <p className="text-[11px] text-space-200 -mt-1">
        Click any building to build it — the colony picks the best tile.
      </p>
      <div className="grid grid-cols-1 gap-1.5 scrollarea overflow-y-auto max-h-[44vh] pr-1">
        {BUILDING_ORDER.map((id) => {
          const def = BUILDINGS[id];
          const locked = !!def.requiresResearch && !completed.includes(def.requiresResearch);
          const affordable =
            !locked &&
            Object.entries(def.cost).every(
              ([k, v]) => (resources[k as ResourceKey] ?? 0) >= (v ?? 0)
            );
          const pickedTile = !locked ? autoPickTile(state, id) : null;
          const noRoom = !locked && pickedTile === null;
          const disabled = locked || !affordable || noRoom;
          const pickedTerrain =
            pickedTile !== null ? state.tiles[pickedTile].terrain : null;

          return (
            <button
              key={id}
              disabled={disabled}
              onClick={() => build(id)}
              className={`text-left p-2 rounded-lg border transition ${
                disabled
                  ? "border-space-400/20 bg-space-700/30 opacity-60 cursor-not-allowed"
                  : "border-space-400/40 bg-space-700/40 hover:bg-space-600/60 hover:border-mars-300/60"
              }`}
              title={
                locked
                  ? `Requires research: ${def.requiresResearch?.replace(/_/g, " ")}`
                  : noRoom
                    ? "No empty tiles left."
                    : !affordable
                      ? "Not enough resources."
                      : def.description
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-mars-200 w-5 text-center">{def.icon}</span>
                  <span className="text-sm">{def.name}</span>
                </div>
                <span
                  className={`text-[11px] font-mono ${affordable ? "text-emerald-300" : "text-amber-300"}`}
                >
                  {describe(def.cost)}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-space-200 leading-snug">{def.description}</div>
              <div className="mt-1 grid grid-cols-2 gap-x-2 text-[11px] font-mono">
                <span className="text-emerald-300">{describe(def.output, "+")}</span>
                <span className="text-rose-300">{describe(def.upkeep, "-")}</span>
              </div>
              {def.housing && (
                <div className="text-[11px] text-mars-100 font-mono">+{def.housing} housing</div>
              )}
              {def.storage && (
                <div className="text-[11px] text-mars-100 font-mono">
                  storage: {describe(def.storage, "+")}
                </div>
              )}
              {def.workers > 0 && (
                <div className="text-[11px] text-space-200 font-mono">workers: {def.workers}</div>
              )}
              <div className="flex items-center justify-between text-[11px] text-space-200 font-mono">
                <span>construction: {def.constructionSols} sols</span>
                {pickedTerrain && !disabled && (
                  <span className="text-mars-100">→ {pickedTerrain}</span>
                )}
              </div>
              {locked && def.requiresResearch && (
                <div className="text-[11px] text-amber-300 mt-1">
                  Requires research: {def.requiresResearch.replace(/_/g, " ")}
                </div>
              )}
              {noRoom && !locked && (
                <div className="text-[11px] text-amber-300 mt-1">No empty tiles left.</div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
