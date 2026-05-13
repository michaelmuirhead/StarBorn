"use client";

import { useGame } from "@/game/store";
import { FACTIONS, FACTION_ORDER } from "@/game/factions";

export default function FactionsPanel() {
  const factions = useGame((s) => s.factions);

  const ordered = FACTION_ORDER.map(
    (id) => factions.find((f) => f.id === id)
  ).filter((f): f is NonNullable<typeof f> => !!f);

  return (
    <section className="panel p-3 flex flex-col gap-2">
      <h2 className="text-sm uppercase tracking-widest text-mars-200">Factions</h2>
      <div className="flex flex-col gap-2">
        {ordered.map((f) => {
          const def = FACTIONS[f.id];
          const happinessTone =
            f.happiness < 30
              ? "text-rose-300"
              : f.happiness < 60
                ? "text-amber-300"
                : "text-emerald-300";
          return (
            <div key={f.id} className="text-xs">
              <div className="flex items-center justify-between">
                <span style={{ color: def.color }} className="font-semibold">
                  {def.shortName}
                </span>
                <span className="font-mono text-space-200">
                  {f.influence.toFixed(1)}% inf ·{" "}
                  <span className={happinessTone}>{Math.round(f.happiness)}/100</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded bg-space-700 overflow-hidden">
                <div
                  className="h-full"
                  style={{ width: `${f.influence}%`, background: def.color }}
                />
              </div>
              <div className="text-[11px] text-space-200 leading-snug pt-1">
                {def.description}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
