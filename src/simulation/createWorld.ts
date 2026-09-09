import { World } from "./core/World";
import { generateTerrain } from "./worldgen/TerrainGenerator";
import type { TerrainOptions } from "./worldgen/TerrainGenerator";
import { WanderSystem } from "./systems/WanderSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { spawnPopulation } from "./spawn";

export function createWorld(seed: number, terrainOptions: Partial<TerrainOptions> = {}): World {
  const world = new World(seed);
  world.terrain = generateTerrain(seed, terrainOptions);

  world.addSystem(new WanderSystem());
  world.addSystem(new MovementSystem());

  const tileCount = world.terrain.width * world.terrain.height;
  const density = tileCount / (90 * 60); // scale population with map size
  spawnPopulation(world, Math.round(14 * density), Math.round(10 * density));

  return world;
}
