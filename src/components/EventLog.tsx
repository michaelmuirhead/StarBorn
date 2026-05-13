"use client";

import { useGame } from "@/game/store";

export default function EventLog() {
  const log = useGame((s) => s.log);
  const events = useGame((s) => s.events);
  const sol = useGame((s) => s.sol);

  return (
    <section className="panel p-3 flex flex-col gap-2">
      <h2 className="text-sm uppercase tracking-widest text-mars-200">Sitrep</h2>
      {events.length > 0 && (
        <div className="flex flex-col gap-1">
          {events.map((e) => {
            const remaining = e.durationSols - (sol - e.startedSol);
            return (
              <div
                key={e.id}
                className="text-[11px] rounded bg-amber-900/20 border border-amber-700/40 px-2 py-1"
                title={e.description}
              >
                <span className="text-amber-200">{e.name}</span>{" "}
                <span className="text-space-200">· {remaining} sol{remaining === 1 ? "" : "s"} left</span>
              </div>
            );
          })}
        </div>
      )}
      <div className="scrollarea overflow-y-auto max-h-[32vh] flex flex-col gap-1 text-[12px]">
        {log.map((entry, i) => {
          const color =
            entry.kind === "good"
              ? "text-emerald-300"
              : entry.kind === "bad"
                ? "text-rose-300"
                : entry.kind === "warn"
                  ? "text-amber-300"
                  : "text-space-50";
          return (
            <div key={i} className="flex gap-2">
              <span className="font-mono text-[10px] text-space-200 w-10 shrink-0">
                S{entry.sol}
              </span>
              <span className={color}>{entry.message}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
