import type { System } from "./System";
import { World } from "../core/World";
import { isWalkable, tileAt } from "../worldgen/types";

const ARRIVE_EPSILON = 0.08; // tiles

function pickWalkableTarget(world: World, fromX: number, fromY: number, radius: number) {
  const { terrain, rng } = world;
  for (let attempt = 0; attempt < 20; attempt++) {
    const x = Math.round(fromX + rng.range(-radius, radius));
    const y = Math.round(fromY + rng.range(-radius, radius));
    const tile = tileAt(terrain, x, y);
    if (tile && isWalkable(tile.biome)) return { x, y };
  }
  // Fallback: stay put rather than loop forever on a bad draw.
  return { x: fromX, y: fromY };
}

export class WanderSystem implements System {
  readonly name = "wander";

  update(world: World, dt: number): void {
    for (const id of world.query(["position", "velocity", "wander", "agent"])) {
      const pos = world.get(id, "position")!;
      const vel = world.get(id, "velocity")!;
      const wander = world.get(id, "wander")!;
      const agent = world.get(id, "agent")!;

      if (wander.pauseFor > 0) {
        wander.pauseFor -= dt;
        vel.dx = 0;
        vel.dy = 0;
        continue;
      }

      const dx = wander.targetX - pos.x;
      const dy = wander.targetY - pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist < ARRIVE_EPSILON) {
        const next = pickWalkableTarget(world, pos.x, pos.y, agent.kind === "car" ? 10 : 4);
        wander.targetX = next.x;
        wander.targetY = next.y;
        wander.pauseFor = world.rng.range(0.4, 2.2);
        vel.dx = 0;
        vel.dy = 0;
      } else {
        vel.dx = (dx / dist) * agent.speed;
        vel.dy = (dy / dist) * agent.speed;
      }
    }
  }
}
