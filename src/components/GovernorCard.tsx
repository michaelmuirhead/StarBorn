"use client";

import { useGame } from "@/game/store";
import { TRAITS } from "@/game/governor";
import { GOVERNMENTS } from "@/game/factions";

export default function GovernorCard() {
  const governor = useGame((s) => s.governor);
  const government = useGame((s) => s.government);
  const sol = useGame((s) => s.sol);
  const gov = GOVERNMENTS[government];

  return (
    <section className="panel p-3 flex flex-col gap-2">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-space-200">
          {gov.name}
        </div>
        <div className="text-sm text-mars-100">
          {governor.title} {governor.name}
        </div>
        <div className="text-[11px] text-space-200">
          In office since sol {governor.appointedSol} · {sol - governor.appointedSol} sols
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {governor.traits.map((t) => {
          const def = TRAITS[t];
          return (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full border border-mars-300/40 bg-mars-700/30 text-[11px] text-mars-100"
              title={def.description}
            >
              {def.name}
            </span>
          );
        })}
      </div>
      <p className="text-[11px] text-space-200 leading-snug">{gov.description}</p>
    </section>
  );
}
