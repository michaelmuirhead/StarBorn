"use client";

import { dateLabel, useGame } from "@/game/store";

const SPEEDS: { label: string; value: 0 | 1 | 2 | 4 }[] = [
  { label: "Pause", value: 0 },
  { label: "1x", value: 1 },
  { label: "2x", value: 2 },
  { label: "4x", value: 4 },
];

export default function TopBar() {
  const sol = useGame((s) => s.sol);
  const speed = useGame((s) => s.speed);
  const setSpeed = useGame((s) => s.setSpeed);
  const reset = useGame((s) => s.reset);
  const saveNow = useGame((s) => s.saveNow);
  const state = useGame();
  const date = dateLabel(state);

  return (
    <header className="panel flex flex-wrap items-center gap-3 px-4 py-2.5 mx-3 mt-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mars-300 via-mars-500 to-mars-800 shadow-inner shadow-black/40" />
        <div>
          <div className="font-display tracking-wider text-sm text-mars-100">
            STARBORN
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-space-200">
            Mars Colony · {date} · Sol {sol}
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s.value}
            className={`btn ${speed === s.value ? "btn-primary" : ""}`}
            onClick={() => setSpeed(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button className="btn" onClick={saveNow} title="Force save to browser storage">
          Save
        </button>
        <button
          className="btn"
          onClick={() => {
            if (confirm("Restart the colony? This wipes your save.")) reset();
          }}
        >
          New game
        </button>
      </div>
    </header>
  );
}
