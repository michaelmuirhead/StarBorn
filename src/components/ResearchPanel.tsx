"use client";

import { useGame } from "@/game/store";
import { RESEARCH, RESEARCH_ORDER } from "@/game/research";

export default function ResearchPanel() {
  const research = useGame((s) => s.research);
  const startResearch = useGame((s) => s.startResearch);

  const current = research.current ? RESEARCH[research.current] : null;
  const pct = current ? Math.min(100, (research.progress / current.cost) * 100) : 0;

  return (
    <section className="panel p-3 flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
      <h2 className="text-sm uppercase tracking-widest text-mars-200 shrink-0">Research</h2>
      {current ? (
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-mars-100">{current.name}</span>
            <span className="font-mono text-space-200">
              {Math.floor(research.progress)} / {current.cost} rp
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded bg-space-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-mars-400 to-mars-200"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-space-200">No active project. Pick one below.</div>
      )}
      <div className="grid grid-cols-1 gap-1.5 scrollarea overflow-y-auto flex-1 min-h-0 pr-1">
        {RESEARCH_ORDER.map((id) => {
          const def = RESEARCH[id];
          const done = research.completed.includes(id);
          const active = research.current === id;
          const blocked =
            !!def.requires && !def.requires.every((r) => research.completed.includes(r));
          return (
            <button
              key={id}
              disabled={done || active || blocked}
              onClick={() => startResearch(id)}
              className={`text-left p-2 rounded-lg border transition ${
                done
                  ? "border-emerald-700/40 bg-emerald-900/20"
                  : active
                    ? "border-mars-300 bg-mars-700/30"
                    : "border-space-400/40 bg-space-700/40 hover:bg-space-600/60"
              } ${blocked || done ? "opacity-70" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{def.name}</span>
                <span className="text-[11px] font-mono text-space-200">{def.cost} rp</span>
              </div>
              <div className="text-[11px] text-space-200 leading-snug">{def.description}</div>
              {def.requires && (
                <div className="text-[11px] text-space-200">
                  needs: {def.requires.map((r) => RESEARCH[r].name).join(", ")}
                </div>
              )}
              {done && <div className="text-[11px] text-emerald-300">Completed</div>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
