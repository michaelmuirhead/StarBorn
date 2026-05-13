"use client";

import { useState } from "react";
import { useGame } from "@/game/store";
import { BUILDINGS } from "@/game/buildings";
import { findOption } from "@/game/laws";

type MapView = "mars" | "system";

const CITY_POSITIONS = [{ id: "primary", x: 10, y: -20 }];

export default function MarsMap() {
  const [view, setView] = useState<MapView>("mars");
  return (
    <div className="panel relative flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="px-3 pt-2 flex items-center gap-2">
        <ViewTab active={view === "mars"} onClick={() => setView("mars")}>
          Mars
        </ViewTab>
        <ViewTab active={view === "system"} onClick={() => setView("system")}>
          Solar System
        </ViewTab>
        <div className="flex-1" />
        <span className="text-[11px] uppercase tracking-widest text-space-200">
          {view === "mars" ? "Olympus Sector" : "Sol System"}
        </span>
      </div>
      {view === "mars" ? <MarsSurfaceView /> : <SolarSystemView />}
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] uppercase tracking-widest px-2 py-0.5 rounded transition ${
        active
          ? "text-mars-100 bg-mars-700/30"
          : "text-space-200 hover:bg-space-700/50"
      }`}
    >
      {children}
    </button>
  );
}

function MarsSurfaceView() {
  const buildings = useGame((s) => s.buildings);
  const sol = useGame((s) => s.sol);
  const selectedTile = useGame((s) => s.selectedTile);
  const selectTile = useGame((s) => s.selectTile);
  const cityName = useGame((s) => s.cityName);

  const operationalCount = buildings.filter((b) => sol >= b.constructionDoneSol).length;
  const constructingCount = buildings.length - operationalCount;

  return (
    <>
      <div className="flex-1 flex items-center justify-center relative px-2 min-h-0">
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
          {CITY_POSITIONS.map((city) => (
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
                {cityName || "Aresward"}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="px-3 pb-3 pt-1 flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-widest text-mars-200">
            {cityName || "Aresward"} Colony
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
                    <span className="text-[10px] text-amber-300">{solsLeft}s</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

interface PlanetDef {
  id: string;
  name: string;
  orbit: number;
  radius: number;
  angle: number;
  fill: string;
  ring?: boolean;
  label?: boolean;
}

const PLANETS: PlanetDef[] = [
  { id: "mercury", name: "Mercury", orbit: 30, radius: 2.4, angle: 200, fill: "#9b8e85" },
  { id: "venus", name: "Venus", orbit: 48, radius: 3, angle: 110, fill: "#d4b87a" },
  { id: "earth", name: "Earth", orbit: 68, radius: 3.6, angle: 0, fill: "#5fa8d3", label: true },
  { id: "mars", name: "Mars", orbit: 95, radius: 3.2, angle: 55, fill: "#d04a16", label: true },
  { id: "jupiter", name: "Jupiter", orbit: 150, radius: 9, angle: 170, fill: "#c69470" },
  { id: "saturn", name: "Saturn", orbit: 190, radius: 7.5, angle: 240, fill: "#d4b487", ring: true },
  { id: "uranus", name: "Uranus", orbit: 215, radius: 5, angle: 310, fill: "#7fb8d6" },
  { id: "neptune", name: "Neptune", orbit: 235, radius: 5, angle: 30, fill: "#4a6fbf" },
];

function polar(orbit: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: orbit * Math.cos(a), y: orbit * Math.sin(a) };
}

function SolarSystemView() {
  const loyalty = useGame((s) => s.loyalty);
  const earthRelationsId = useGame((s) => s.laws.options.earth_relations);
  const independence = useGame((s) => s.independence);
  const cityName = useGame((s) => s.cityName) || "Aresward";

  const relationOption = findOption("earth_relations", earthRelationsId);
  const relationLabel = relationOption?.name ?? "Compliant";

  const relationTone = (() => {
    if (independence) return { stroke: "#f56a6a", label: "Independent" };
    if (loyalty > 70) return { stroke: "#5fc8a8", label: "Friendly" };
    if (loyalty > 40) return { stroke: "#e6a23c", label: "Tense" };
    return { stroke: "#f56a6a", label: "Strained" };
  })();

  const earth = polar(PLANETS[2].orbit, PLANETS[2].angle);
  const mars = polar(PLANETS[3].orbit, PLANETS[3].angle);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 min-h-0 flex items-center justify-center relative">
        <svg viewBox="-260 -150 520 300" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff6cc" />
              <stop offset="55%" stopColor="#ffb340" />
              <stop offset="100%" stopColor="#a35a0a" />
            </radialGradient>
            <radialGradient id="sunCorona" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffb340" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffb340" stopOpacity="0" />
            </radialGradient>
          </defs>
          {Array.from({ length: 90 }).map((_, i) => {
            const x = ((i * 137) % 520) - 260;
            const y = ((i * 73) % 300) - 150;
            const r = ((i * 11) % 3) * 0.3 + 0.3;
            const o = 0.25 + ((i * 7) % 10) / 30;
            return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={o} />;
          })}
          {PLANETS.map((p) => (
            <circle
              key={p.id + "-orbit"}
              cx="0"
              cy="0"
              r={p.orbit}
              fill="none"
              stroke="#3d4a74"
              strokeOpacity="0.35"
              strokeWidth="0.4"
              strokeDasharray="2 3"
            />
          ))}
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i * 9 + 17) % 360;
            const radius = 118 + ((i * 13) % 12);
            const pt = polar(radius, angle);
            return (
              <circle
                key={`belt-${i}`}
                cx={pt.x}
                cy={pt.y}
                r="0.6"
                fill="#8e6e58"
                opacity="0.55"
              />
            );
          })}
          <circle cx="0" cy="0" r="34" fill="url(#sunCorona)" />
          <circle cx="0" cy="0" r="18" fill="url(#sunGrad)" />
          <line
            x1={earth.x}
            y1={earth.y}
            x2={mars.x}
            y2={mars.y}
            stroke={relationTone.stroke}
            strokeOpacity="0.6"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          {PLANETS.map((p) => {
            const { x, y } = polar(p.orbit, p.angle);
            return (
              <g key={p.id}>
                {p.ring && (
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={p.radius * 2}
                    ry={p.radius * 0.4}
                    fill="none"
                    stroke="#d4b487"
                    strokeWidth="0.6"
                    opacity="0.7"
                    transform={`rotate(-15 ${x} ${y})`}
                  />
                )}
                <circle cx={x} cy={y} r={p.radius} fill={p.fill} />
                {p.id === "mars" && (
                  <>
                    <circle
                      cx={x}
                      cy={y}
                      r={p.radius + 3}
                      fill="none"
                      stroke="#ffd9bd"
                      strokeOpacity="0.5"
                    >
                      <animate
                        attributeName="r"
                        values={`${p.radius + 3};${p.radius + 7};${p.radius + 3}`}
                        dur="2.6s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-opacity"
                        values="0.5;0;0.5"
                        dur="2.6s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text
                      x={x + p.radius + 5}
                      y={y + 3}
                      fill="#ffd9bd"
                      style={{ font: "500 9px ui-sans-serif" }}
                    >
                      Mars · {cityName}
                    </text>
                  </>
                )}
                {p.label && p.id !== "mars" && (
                  <text
                    x={x + p.radius + 4}
                    y={y + 3}
                    fill="#cbd5f5"
                    style={{ font: "500 9px ui-sans-serif" }}
                  >
                    {p.name}
                  </text>
                )}
              </g>
            );
          })}
          <text x="0" y="-26" textAnchor="middle" fill="#ffd99a" style={{ font: "500 9px ui-sans-serif" }}>
            Sol
          </text>
        </svg>
      </div>
      <div className="px-3 pb-3 pt-1 flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-widest text-mars-200">
            Earth ↔ Mars
          </span>
          <span className="text-[10px] font-mono text-space-200">
            Loyalty <span className="text-mars-100">{Math.round(loyalty)}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span
            className="px-2 py-0.5 rounded border"
            style={{
              borderColor: relationTone.stroke,
              color: relationTone.stroke,
            }}
          >
            {relationTone.label}
          </span>
          <span className="text-space-200">Earth policy:</span>
          <span className="text-mars-100">{relationLabel}</span>
          {independence && (
            <span className="ml-auto text-emerald-300">✪ Mars sovereign</span>
          )}
        </div>
        <p className="text-[11px] text-space-200 leading-snug">
          The Sol system. Earth and Mars are the only inhabited worlds for now.
          Future updates will let you launch from your Spaceport to other
          orbital bodies — the Belt, the Jovian moons, beyond.
        </p>
      </div>
    </div>
  );
}
