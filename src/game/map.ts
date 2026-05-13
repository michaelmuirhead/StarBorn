import type { Tile, TerrainId } from "./types";
import { MAP_RADIUS } from "./constants";

export const HEX_SIZE = 34;
export const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
export const HEX_HEIGHT = 2 * HEX_SIZE;

export function hexToPixel(q: number, r: number): { x: number; y: number } {
  const x = HEX_SIZE * Math.sqrt(3) * (q + r / 2);
  const y = HEX_SIZE * 1.5 * r;
  return { x, y };
}

export function hexCorners(cx: number, cy: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    points.push(`${cx + HEX_SIZE * Math.cos(angle)},${cy + HEX_SIZE * Math.sin(angle)}`);
  }
  return points.join(" ");
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function generateTiles(seed = 42): Tile[] {
  const tiles: Tile[] = [];
  const rand = rng(seed);
  let i = 0;
  for (let q = -MAP_RADIUS; q <= MAP_RADIUS; q++) {
    const rMin = Math.max(-MAP_RADIUS, -q - MAP_RADIUS);
    const rMax = Math.min(MAP_RADIUS, -q + MAP_RADIUS);
    for (let r = rMin; r <= rMax; r++) {
      let terrain: TerrainId = "plain";
      const roll = rand();
      if (roll < 0.1) terrain = "ice";
      else if (roll < 0.22) terrain = "ore";
      else if (roll < 0.32) terrain = "ridge";
      tiles.push({ index: i++, q, r, terrain });
    }
  }
  return tiles;
}

export const TERRAIN_INFO: Record<TerrainId, { name: string; color: string; hint: string }> = {
  plain: { name: "Regolith Plain", color: "#a3370f", hint: "" },
  ice: { name: "Subsurface Ice", color: "#7fb8d6", hint: "Water Extractor: +3 water" },
  ore: { name: "Ore Deposit", color: "#b07543", hint: "Mine: +2 minerals" },
  ridge: { name: "Sunlit Ridge", color: "#d56a2c", hint: "Solar Array: +2 power" },
};
