import { World } from "../core/World";

/** A system operates on whichever entities have the components it cares
 * about. It never holds its own state about a specific entity — all state
 * lives in components, so systems stay swappable and testable in isolation. */
export interface System {
  readonly name: string;
  update(world: World, dt: number): void;
}
