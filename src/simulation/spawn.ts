import { World } from "./core/World";
import { isWalkable, tileAt } from "./worldgen/types";

const CAR_COLORS = [0xf2c14e, 0xe0a458, 0x8fbf6b, 0x6ba3c5];
const PEDESTRIAN_COLOR = 0xe6e6e6;

function findWalkableSpawn(world: World): { x: number; y: number } {
  const { terrain, rng } = world;
  for (let attempt = 0; attempt < 500; attempt++) {
    const x = rng.int(0, terrain.width - 1);
    const y = rng.int(0, terrain.height - 1);
    const tile = tileAt(terrain, x, y);
    if (tile && isWalkable(tile.biome)) return { x, y };
  }
  return { x: Math.floor(terrain.width / 2), y: Math.floor(terrain.height / 2) };
}

export function spawnPopulation(world: World, carCount: number, pedestrianCount: number): void {
  for (let i = 0; i < carCount; i++) {
    const { x, y } = findWalkableSpawn(world);
    const id = world.createEntity();
    world.set(id, "position", { x, y });
    world.set(id, "velocity", { dx: 0, dy: 0 });
    world.set(id, "wander", { targetX: x, targetY: y, pauseFor: world.rng.range(0, 1.5) });
    world.set(id, "agent", { kind: "car", speed: world.rng.range(2.4, 4.2), color: world.rng.pick(CAR_COLORS) });
  }

  for (let i = 0; i < pedestrianCount; i++) {
    const { x, y } = findWalkableSpawn(world);
    const id = world.createEntity();
    world.set(id, "position", { x, y });
    world.set(id, "velocity", { dx: 0, dy: 0 });
    world.set(id, "wander", { targetX: x, targetY: y, pauseFor: world.rng.range(0, 1.5) });
    world.set(id, "agent", { kind: "pedestrian", speed: world.rng.range(0.5, 1.1), color: PEDESTRIAN_COLOR });
  }
}
