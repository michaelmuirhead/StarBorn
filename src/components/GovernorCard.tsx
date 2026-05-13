"use client";

import { useGame } from "@/game/store";
import { TRAITS } from "@/game/governor";
import { GOVERNMENTS } from "@/game/factions";

export default function GovernorCard() {
  const governor = useGame((s) => s.governor);
  const government = useGame((s) => s.government);
  const sol = useGame((s) => s.sol);
  const gov = GOVERNMENTS[government];
  const tenure = sol - governor.appointedSol;

  return (
    <section className="panel px-3 py-2 flex flex-col gap-1 shrink-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-mars-100 truncate">
          {governor.title} {governor.name}
        </span>
        <span
          className="text-[10px] uppercase tracking-widest text-space-200 shrink-0"
          title={gov.description}
        >
          {gov.name}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {governor.traits.map((t) => {
          const def = TRAITS[t];
          return (
            <span
              key={t}
              className="px-1.5 py-0 rounded-full border border-mars-300/40 bg-mars-700/30 text-[10px] text-mars-100"
              title={def.description}
            >
              {def.name}
            </span>
          );
        })}
        <span className="ml-auto text-[10px] text-space-200">
          in office {tenure} sol{tenure === 1 ? "" : "s"}
        </span>
      </div>
    </section>
  );
}
