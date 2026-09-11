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
  hasSettlement: boolean;
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
