import { World } from "./core/World";
import { WanderSystem } from "./systems/WanderSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { generateTerrain } from "./worldgen/TerrainGenerator";
import type { TerrainOptions } from "./worldgen/TerrainGenerator";

export interface WorldSaveFile {
  version: 1;
  savedAt: string;
  seed: number;
  terrainOptions: Partial<TerrainOptions>;
  clock: { elapsed: number; speed: number; hoursPerSecond: number };
  entities: Array<{
    position: { x: number; y: number };
    velocity: { dx: number; dy: number };
    agent: { kind: "car" | "pedestrian"; speed: number; color: number };
    wander: { targetX: number; targetY: number; pauseFor: number };
  }>;
}

export function serializeWorld(world: World, terrainOptions: Partial<TerrainOptions>): WorldSaveFile {
  const entities = world.query(["position", "velocity", "agent", "wander"]).map((id) => ({
    position: { ...world.get(id, "position")! },
    velocity: { ...world.get(id, "velocity")! },
    agent: { ...world.get(id, "agent")! },
    wander: { ...world.get(id, "wander")! },
  }));

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    seed: world.seed,
    terrainOptions,
    clock: { ...world.clock },
    entities,
  };
}

export function deserializeWorld(save: WorldSaveFile): World {
  const world = new World(save.seed);
  world.terrain = generateTerrain(save.seed, save.terrainOptions);
  world.addSystem(new WanderSystem());
  world.addSystem(new MovementSystem());
  world.clock = { ...save.clock };

  for (const entry of save.entities) {
    const id = world.createEntity();
    world.set(id, "position", { ...entry.position });
    world.set(id, "velocity", { ...entry.velocity });
    world.set(id, "agent", { ...entry.agent });
    world.set(id, "wander", { ...entry.wander });
  }

  return world;
}

export function downloadSave(save: WorldSaveFile): void {
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `world-${save.seed}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
