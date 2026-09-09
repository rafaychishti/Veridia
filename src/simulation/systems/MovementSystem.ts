import type { System } from "./System";
import { World } from "../core/World";

export class MovementSystem implements System {
  readonly name = "movement";

  update(world: World, dt: number): void {
    for (const id of world.query(["position", "velocity"])) {
      const pos = world.get(id, "position")!;
      const vel = world.get(id, "velocity")!;
      pos.x += vel.dx * dt;
      pos.y += vel.dy * dt;
    }
  }
}
