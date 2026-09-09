import { Random } from "./Random";
import type { ComponentName, ComponentTables, EntityId } from "./types";
import type { TerrainGrid } from "../worldgen/types";
import type { System } from "../systems/System";

export interface SimClock {
  /** Total simulated seconds elapsed since the world was created. */
  elapsed: number;
  /** Simulated seconds per real second. 0 means paused. */
  speed: number;
  /** How many in-game hours pass per simulated second. Tuned so the day/
   * night cycle is visible within a few seconds even at 1x. */
  hoursPerSecond: number;
}

type Tables = { [K in ComponentName]: Map<EntityId, ComponentTables[K]> };

/**
 * The world is deliberately dumb: it owns entities, components, terrain and
 * the clock, and knows how to run systems over them. It has no idea what a
 * "car" or a "tree" means — that meaning lives entirely in the component
 * data and in the systems that read it.
 */
export class World {
  readonly rng: Random;
  readonly seed: number;
  terrain!: TerrainGrid;
  clock: SimClock = { elapsed: 0, speed: 1, hoursPerSecond: 0.5 };

  private nextEntityId: EntityId = 1;
  private entities = new Set<EntityId>();
  private tables: Tables = {
    position: new Map(),
    velocity: new Map(),
    agent: new Map(),
    wander: new Map(),
  };
  private systems: System[] = [];

  constructor(seed: number) {
    this.seed = seed;
    this.rng = new Random(seed);
  }

  addSystem(system: System): void {
    this.systems.push(system);
  }

  createEntity(): EntityId {
    const id = this.nextEntityId++;
    this.entities.add(id);
    return id;
  }

  destroyEntity(id: EntityId): void {
    this.entities.delete(id);
    for (const table of Object.values(this.tables)) table.delete(id);
  }

  get entityCount(): number {
    return this.entities.size;
  }

  set<K extends ComponentName>(id: EntityId, name: K, data: ComponentTables[K]): void {
    this.tables[name].set(id, data);
  }

  get<K extends ComponentName>(id: EntityId, name: K): ComponentTables[K] | undefined {
    return this.tables[name].get(id);
  }

  has(id: EntityId, name: ComponentName): boolean {
    return this.tables[name].has(id);
  }

  /** Entity ids that have every one of the given components. */
  query(names: ComponentName[]): EntityId[] {
    if (names.length === 0) return [...this.entities];
    const [first, ...rest] = names;
    const result: EntityId[] = [];
    for (const id of this.tables[first].keys()) {
      if (rest.every((name) => this.tables[name].has(id))) result.push(id);
    }
    return result;
  }

  /** The single heartbeat. dt is REAL seconds; it gets scaled by clock.speed
   * before anything in the simulation sees it, so every system only ever
   * reasons in simulated time. */
  tick(dtReal: number): void {
    if (this.clock.speed <= 0) return;
    const dt = dtReal * this.clock.speed;
    this.clock.elapsed += dt;
    for (const system of this.systems) system.update(this, dt);
  }
}
