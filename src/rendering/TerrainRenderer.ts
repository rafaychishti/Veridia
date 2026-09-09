import { Container, Graphics } from "pixi.js";
import { Biome, tileAt } from "../simulation/worldgen/types";
import type { TerrainGrid } from "../simulation/worldgen/types";
import { shade } from "./color";

const BIOME_BASE_COLOR: Record<Biome, number> = {
  [Biome.Ocean]: 0x1c3d4d,
  [Biome.Sand]: 0xd9c08c,
  [Biome.Grass]: 0x5f8a4a,
  [Biome.Forest]: 0x33512d,
  [Biome.Mountain]: 0x746a5f,
  [Biome.Snow]: 0xeef2f0,
};

const TREE_COLOR = 0x25401f;
const TREE_TRUNK_COLOR = 0x4a3626;
const ROOF_COLOR = 0xc4693f;
const WALL_COLOR = 0xdcd3c0;

function drawTrees(g: Graphics, px: number, py: number, tileSize: number, count: number) {
  for (let i = 0; i < count; i++) {
    // Deterministic-looking but cheap jitter derived from position + index —
    // decorations don't need to consume the simulation's RNG stream.
    const jx = ((px * 13 + py * 7 + i * 29) % (tileSize * 10)) / 10;
    const jy = ((px * 5 + py * 17 + i * 11) % (tileSize * 10)) / 10;
    const cx = px + 3 + jx * 0.6;
    const cy = py + 3 + jy * 0.6;
    const r = tileSize * 0.16;
    g.circle(cx, cy - r * 0.6, r).fill(TREE_COLOR);
    g.rect(cx - 1, cy, 2, r * 0.7).fill(TREE_TRUNK_COLOR);
  }
}

function drawSettlement(g: Graphics, px: number, py: number, tileSize: number) {
  const w = tileSize * 0.6;
  const h = tileSize * 0.5;
  const x = px + (tileSize - w) / 2;
  const y = py + (tileSize - h) / 2;
  g.rect(x, y + h * 0.35, w, h * 0.65).fill(WALL_COLOR);
  g.poly([x - 1, y + h * 0.4, x + w / 2, y, x + w + 1, y + h * 0.4]).fill(ROOF_COLOR);
}

/** Builds the whole terrain as two batched Graphics objects (base tiles,
 * then decorations on top) instead of one display object per tile — a
 * 90x60 map is a few thousand rects, which one Graphics eats easily, while
 * a few thousand Sprites would not render nearly as smoothly. */
export function renderTerrain(terrain: TerrainGrid): Container {
  const container = new Container();
  const tiles = new Graphics();
  const decorations = new Graphics();

  for (let y = 0; y < terrain.height; y++) {
    for (let x = 0; x < terrain.width; x++) {
      const tile = tileAt(terrain, x, y)!;
      const base = BIOME_BASE_COLOR[tile.biome];
      const tint = Math.round((tile.height - 0.5) * 70);
      const color = shade(base, tint);
      const px = x * terrain.tileSize;
      const py = y * terrain.tileSize;

      tiles.rect(px, py, terrain.tileSize, terrain.tileSize).fill(color);

      if (tile.treeCount > 0) drawTrees(decorations, px, py, terrain.tileSize, tile.treeCount);
      if (tile.hasSettlement) drawSettlement(decorations, px, py, terrain.tileSize);
    }
  }

  container.addChild(tiles, decorations);
  return container;
}

export function terrainPixelSize(terrain: TerrainGrid): { width: number; height: number } {
  return { width: terrain.width * terrain.tileSize, height: terrain.height * terrain.tileSize };
}
