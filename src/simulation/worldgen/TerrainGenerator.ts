import { createNoise2D } from "simplex-noise";
import { Random } from "../core/Random";
import { Biome } from "./types";
import type { Tile, TerrainGrid } from "./types";

export interface TerrainOptions {
  width: number;
  height: number;
  tileSize: number;
  /** 0..1. Higher = more ocean. */
  seaLevel: number;
  /** 0..1. Higher = more mountains. */
  mountainLevel: number;
}

export const DEFAULT_TERRAIN_OPTIONS: TerrainOptions = {
  width: 90,
  height: 60,
  tileSize: 16,
  seaLevel: 0.36,
  mountainLevel: 0.72,
};

/** Stacks a few octaves of simplex noise into one smoother, more natural
 * looking height/moisture field than a single noise call gives you. */
function fractalNoise(
  noise2D: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves: number,
  baseFrequency: number,
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = baseFrequency;
  let max = 0;
  for (let o = 0; o < octaves; o++) {
    value += noise2D(x * frequency, y * frequency) * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  // simplex output is [-1, 1]; normalize to [0, 1]
  return (value / max) * 0.5 + 0.5;
}

export function generateTerrain(seed: number, options: Partial<TerrainOptions> = {}): TerrainGrid {
  const opts = { ...DEFAULT_TERRAIN_OPTIONS, ...options };
  const rng = new Random(seed);

  // Independent noise streams so height and moisture don't correlate.
  const heightNoise = createNoise2D(() => rng.next());
  const moistureNoise = createNoise2D(() => rng.next());

  const tiles: Tile[] = new Array(opts.width * opts.height);
  const settlementRng = rng.fork();
  const treeRng = rng.fork();

  for (let y = 0; y < opts.height; y++) {
    for (let x = 0; x < opts.width; x++) {
      const h = fractalNoise(heightNoise, x, y, 4, 0.045);
      const m = fractalNoise(moistureNoise, x, y, 3, 0.08);

      let biome: Biome;
      if (h < opts.seaLevel) {
        biome = Biome.Ocean;
      } else if (h < opts.seaLevel + 0.03) {
        biome = Biome.Sand;
      } else if (h > opts.mountainLevel + 0.12) {
        biome = Biome.Snow;
      } else if (h > opts.mountainLevel) {
        biome = Biome.Mountain;
      } else if (m > 0.58) {
        biome = Biome.Forest;
      } else {
        biome = Biome.Grass;
      }

      const isFlatDryGrass =
        biome === Biome.Grass && m < 0.42 && settlementRng.next() < 0.012;

      tiles[y * opts.width + x] = {
        biome,
        height: h,
        moisture: m,
        hasSettlement: isFlatDryGrass,
        treeCount: biome === Biome.Forest ? treeRng.int(1, 3) : 0,
      };
    }
  }

  return {
    seed,
    width: opts.width,
    height: opts.height,
    tileSize: opts.tileSize,
    tiles,
  };
}
