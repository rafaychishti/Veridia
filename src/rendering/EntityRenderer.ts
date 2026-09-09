import { Graphics } from "pixi.js";
import { World } from "../simulation/core/World";

export class EntityRenderer {
  readonly graphics = new Graphics();

  render(world: World, tileSize: number): void {
    this.graphics.clear();

    for (const id of world.query(["position", "velocity", "agent"])) {
      const pos = world.get(id, "position")!;
      const vel = world.get(id, "velocity")!;
      const agent = world.get(id, "agent")!;
      const cx = pos.x * tileSize + tileSize / 2;
      const cy = pos.y * tileSize + tileSize / 2;

      if (agent.kind === "car") {
        const heading = Math.atan2(vel.dy, vel.dx) || 0;
        const len = tileSize * 0.55;
        const wid = tileSize * 0.32;
        const cos = Math.cos(heading);
        const sin = Math.sin(heading);
        const corners: [number, number][] = [
          [len / 2, 0],
          [-len / 2, wid / 2],
          [-len / 2, -wid / 2],
        ];
        const points = corners.flatMap(([lx, ly]) => [
          cx + lx * cos - ly * sin,
          cy + lx * sin + ly * cos,
        ]);
        this.graphics.poly(points).fill(agent.color);
      } else {
        this.graphics.circle(cx, cy, tileSize * 0.16).fill(agent.color);
      }
    }
  }
}
