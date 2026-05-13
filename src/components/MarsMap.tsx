"use client";

import { useMemo } from "react";
import { useGame } from "@/game/store";
import { BUILDINGS } from "@/game/buildings";
import {
  HEX_HEIGHT,
  HEX_SIZE,
  HEX_WIDTH,
  TERRAIN_INFO,
  hexCorners,
  hexToPixel,
} from "@/game/map";

export default function MarsMap() {
  const tiles = useGame((s) => s.tiles);
  const buildings = useGame((s) => s.buildings);
  const sol = useGame((s) => s.sol);
  const selectedTile = useGame((s) => s.selectedTile);
  const selectTile = useGame((s) => s.selectTile);

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
          const underConstruction = placed && sol < placed.constructionDoneSol;
          const def = placed ? BUILDINGS[placed.building] : null;
          const progress =
            placed && def
              ? Math.min(
                  1,
                  Math.max(
                    0,
                    (sol - placed.builtSol) / Math.max(1, def.constructionSols)
                  )
                )
              : 0;
          return (
            <g
              key={t.index}
              className="cursor-pointer"
              onClick={() => selectTile(t.index)}
            >
              <polygon
                points={hexCorners(x, y)}
                fill={info.color}
                fillOpacity={occupied ? 0.55 : 0.85}
                stroke={isSelected ? "#ffd9bd" : "#2e1006"}
                strokeWidth={isSelected ? 2.5 : 1}
              />
              {placed && def ? (
                <g>
                  <circle cx={x} cy={y} r={HEX_SIZE * 0.55} fill="#0a0d18" fillOpacity={0.7} />
                  <text
                    x={x}
                    y={y + 6}
                    textAnchor="middle"
                    className="fill-mars-100"
                    fillOpacity={underConstruction ? 0.45 : 1}
                    style={{ font: "600 18px ui-sans-serif" }}
                  >
                    {def.icon}
                  </text>
                  {underConstruction ? (
                    <g>
                      <rect
                        x={x - HEX_SIZE * 0.45}
                        y={y + HEX_SIZE * 0.35}
                        width={HEX_SIZE * 0.9}
                        height={3}
                        rx={1.5}
                        fill="#1e2742"
                      />
                      <rect
                        x={x - HEX_SIZE * 0.45}
                        y={y + HEX_SIZE * 0.35}
                        width={HEX_SIZE * 0.9 * progress}
                        height={3}
                        rx={1.5}
                        fill="#ff9056"
                      />
                    </g>
                  ) : (
                    placed.level > 1 && (
                      <text
                        x={x + HEX_SIZE * 0.25}
                        y={y - HEX_SIZE * 0.3}
                        textAnchor="middle"
                        className="fill-mars-100"
                        style={{ font: "700 10px ui-sans-serif" }}
                      >
                        {placed.level}
                      </text>
                    )
                  )}
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
