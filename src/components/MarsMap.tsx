"use client";

import { useMemo } from "react";
import { useGame } from "@/game/store";
import { BUILDINGS } from "@/game/buildings";
import { HEX_HEIGHT, HEX_SIZE, HEX_WIDTH, TERRAIN_INFO, hexCorners, hexToPixel } from "@/game/map";

export default function MarsMap() {
  const tiles = useGame((s) => s.tiles);
  const buildings = useGame((s) => s.buildings);
  const selectedTile = useGame((s) => s.selectedTile);
  const buildSelection = useGame((s) => s.buildSelection);
  const selectTile = useGame((s) => s.selectTile);
  const placeBuilding = useGame((s) => s.placeBuilding);

  const bounds = useMemo(() => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const t of tiles) {
      const { x, y } = hexToPixel(t.q, t.r);
      minX = Math.min(minX, x - HEX_WIDTH / 2);
      maxX = Math.max(maxX, x + HEX_WIDTH / 2);
      minY = Math.min(minY, y - HEX_HEIGHT / 2);
      maxY = Math.max(maxY, y + HEX_HEIGHT / 2);
    }
    const pad = 16;
    return {
      x: minX - pad,
      y: minY - pad,
      w: maxX - minX + pad * 2,
      h: maxY - minY + pad * 2,
    };
  }, [tiles]);

  const buildingsByTile = useMemo(() => {
    const map = new Map<number, (typeof buildings)[number]>();
    for (const b of buildings) map.set(b.tile, b);
    return map;
  }, [buildings]);

  return (
    <div className="panel relative flex-1 min-h-[420px] overflow-hidden">
      <div className="absolute top-2 left-3 text-[11px] uppercase tracking-widest text-space-200 z-10">
        Olympus Sector · Aresward Site
      </div>
      <svg
        viewBox={`${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`}
        className="w-full h-full select-none"
      >
        <defs>
          <radialGradient id="marsGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#2e1006" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#05060c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x={bounds.x} y={bounds.y} width={bounds.w} height={bounds.h} fill="url(#marsGlow)" />
        {tiles.map((t) => {
          const { x, y } = hexToPixel(t.q, t.r);
          const info = TERRAIN_INFO[t.terrain];
          const isSelected = selectedTile === t.index;
          const placed = buildingsByTile.get(t.index);
          const occupied = !!placed;
          const canBuildHere = !!buildSelection && !occupied;
          return (
            <g
              key={t.index}
              className="cursor-pointer"
              onClick={() => {
                if (buildSelection && !occupied) {
                  placeBuilding(t.index, buildSelection);
                } else {
                  selectTile(t.index);
                }
              }}
            >
              <polygon
                points={hexCorners(x, y)}
                fill={info.color}
                fillOpacity={occupied ? 0.55 : 0.85}
                stroke={isSelected ? "#ffd9bd" : "#2e1006"}
                strokeWidth={isSelected ? 2.5 : 1}
              />
              {canBuildHere && (
                <polygon
                  points={hexCorners(x, y)}
                  fill="#ffd9bd"
                  fillOpacity={0.08}
                  stroke="#ffd9bd"
                  strokeOpacity={0.5}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              )}
              {placed ? (
                <g>
                  <circle cx={x} cy={y} r={HEX_SIZE * 0.55} fill="#0a0d18" fillOpacity={0.7} />
                  <text
                    x={x}
                    y={y + 6}
                    textAnchor="middle"
                    className="fill-mars-100"
                    style={{ font: "600 18px ui-sans-serif" }}
                  >
                    {BUILDINGS[placed.building].icon}
                  </text>
                </g>
              ) : (
                t.terrain !== "plain" && (
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fillOpacity={0.55}
                    style={{ font: "500 12px ui-sans-serif", fill: "#0a0d18" }}
                  >
                    {t.terrain === "ice" ? "❄" : t.terrain === "ore" ? "◆" : "△"}
                  </text>
                )
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
