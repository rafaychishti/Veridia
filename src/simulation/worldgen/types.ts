// A plain const object + derived union type instead of `enum` — this
// project targets erasable-syntax-only TypeScript (type stripping with no
// runtime emission beyond it), which real `enum` declarations don't satisfy.
export const Biome = {
  Ocean: "ocean",
  Sand: "sand",
  Grass: "grass",
  Forest: "forest",
  Mountain: "mountain",
  Snow: "snow",
} as const;
export type Biome = (typeof Biome)[keyof typeof Biome];

export interface Tile {
  biome: Biome;
  height: number; // 0..1, raw noise height used to derive the biome
  moisture: number; // 0..1
  /** A settlement marker is placed on some flat, dry grass tiles so the
   * world reads as lived-in rather than empty wilderness. */
  hasSettlement: boolean;
  /** A handful of trees scattered per-tile for forest tiles, used by the
   * renderer to vary tree density instead of one fixed icon per tile. */
  treeCount: number;
}

export interface TerrainGrid {
  seed: number;
  width: number;
  height: number;
  tileSize: number;
  tiles: Tile[]; // row-major, length width * height
}

export function tileAt(grid: TerrainGrid, x: number, y: number): Tile | undefined {
  if (x < 0 || y < 0 || x >= grid.width || y >= grid.height) return undefined;
  return grid.tiles[y * grid.width + x];
}

export function isWalkable(biome: Biome): boolean {
  return biome === Biome.Grass || biome === Biome.Sand || biome === Biome.Forest;
}
