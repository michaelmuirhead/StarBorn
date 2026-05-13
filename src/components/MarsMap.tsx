"use client";

import { useGame } from "@/game/store";
import { BUILDINGS } from "@/game/buildings";

interface CityMarker {
  id: string;
  name: string;
  x: number;
  y: number;
  established: boolean;
}

const CITIES: CityMarker[] = [
  { id: "aresward", name: "Aresward", x: 10, y: -20, established: true },
];

export default function MarsMap() {
  const buildings = useGame((s) => s.buildings);
  const sol = useGame((s) => s.sol);
  const selectedTile = useGame((s) => s.selectedTile);
  const selectTile = useGame((s) => s.selectTile);

  const operationalCount = buildings.filter((b) => sol >= b.constructionDoneSol).length;
  const constructingCount = buildings.length - operationalCount;

  return (
    <div className="panel relative flex-1 min-h-[420px] flex flex-col overflow-hidden">
      <div className="px-3 pt-2 flex items-center justify-between text-[11px] uppercase tracking-widest text-space-200">
        <span>Mars</span>
        <span>Olympus Sector</span>
      </div>
      <div className="flex-1 flex items-center justify-center relative px-2">
        <svg viewBox="-120 -120 240 240" className="w-full h-full max-h-[300px]">
          <defs>
            <radialGradient id="marsBody" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#ff9056" />
              <stop offset="55%" stopColor="#a3370f" />
              <stop offset="100%" stopColor="#2e1006" />
            </radialGradient>
            <radialGradient id="marsAtmos" cx="50%" cy="50%" r="60%">
              <stop offset="55%" stopColor="#ff9056" stopOpacity="0" />
              <stop offset="100%" stopColor="#ff9056" stopOpacity="0.18" />
            </radialGradient>
            <radialGradient id="marsTerminator" cx="80%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
            </radialGradient>
            <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff1d6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffb88a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="0" cy="0" r="115" fill="url(#marsAtmos)" />
          <circle cx="0" cy="0" r="100" fill="url(#marsBody)" />
          <ellipse cx="-30" cy="-50" rx="22" ry="9" fill="#7a2a0d" opacity="0.45" />
          <ellipse cx="35" cy="-25" rx="18" ry="7" fill="#7a2a0d" opacity="0.35" />
          <ellipse cx="-15" cy="35" rx="28" ry="11" fill="#7a2a0d" opacity="0.4" />
          <ellipse cx="55" cy="40" rx="14" ry="6" fill="#7a2a0d" opacity="0.35" />
          <ellipse cx="-55" cy="10" rx="9" ry="4" fill="#7a2a0d" opacity="0.35" />
          <circle cx="0" cy="0" r="100" fill="url(#marsTerminator)" />
          {CITIES.map((city) => (
            <g key={city.id} className="cursor-pointer" onClick={() => selectTile(null)}>
              <circle cx={city.x} cy={city.y} r="14" fill="url(#cityGlow)" />
              <circle cx={city.x} cy={city.y} r="3.5" fill="#fff1d6" />
              <circle cx={city.x} cy={city.y} r="3.5" fill="none" stroke="#ffe9c5" strokeOpacity="0.6">
                <animate
                  attributeName="r"
                  values="3.5;9;3.5"
                  dur="2.6s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-opacity"
                  values="0.6;0;0.6"
                  dur="2.6s"
                  repeatCount="indefinite"
                />
              </circle>
              <text
                x={city.x + 9}
                y={city.y + 3}
                fill="#ffd9bd"
                style={{ font: "500 11px ui-sans-serif" }}
              >
                {city.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="px-3 pb-3 pt-1 flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-widest text-mars-200">
            Aresward Colony
          </span>
          <span className="text-[10px] font-mono text-space-200">
            {operationalCount} operational
            {constructingCount > 0 ? ` · ${constructingCount} building` : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {buildings.length === 0 ? (
            <span className="text-[11px] text-space-200">
              No structures yet — pick something to build from the panel on the left.
            </span>
          ) : (
            buildings.map((b) => {
              const def = BUILDINGS[b.building];
              const isSelected = b.tile === selectedTile;
              const underConstruction = sol < b.constructionDoneSol;
              const solsLeft = b.constructionDoneSol - sol;
              return (
                <button
                  key={b.id}
                  onClick={() => selectTile(b.tile)}
                  className={`px-2 py-1 rounded-md border text-[11px] flex items-center gap-1.5 transition ${
                    isSelected
                      ? "border-mars-300 bg-mars-700/40"
                      : "border-space-400/40 bg-space-700/40 hover:bg-space-600/50"
                  } ${underConstruction ? "opacity-60" : ""}`}
                  title={`${def.name} · Lvl ${b.level}${underConstruction ? ` · ${solsLeft} sols left` : ""}`}
                >
                  <span className="text-mars-200">{def.icon}</span>
                  <span>{def.name}</span>
                  {b.level > 1 && (
                    <span className="text-[10px] font-mono text-mars-100">Lvl{b.level}</span>
                  )}
                  {underConstruction && (
                    <span className="text-[10px] text-amber-300">
                      {solsLeft}s
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
