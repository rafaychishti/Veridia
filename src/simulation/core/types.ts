export type EntityId = number;

/** Every component is just a plain data bag keyed by a string name in the
 * World's component tables. No base class, no inheritance chain — entities
 * are only ever "the sum of the components attached to this id." */
export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}

export type AgentKind = "car" | "pedestrian";

export interface Agent {
  kind: AgentKind;
  speed: number; // tiles per simulated second
  color: number;
}

export interface Wander {
  targetX: number;
  targetY: number;
  /** Seconds to wait at the target before picking a new one. */
  pauseFor: number;
}

/** The full set of component tables a World knows how to store. Adding a
 * new component type means adding one line here and one factory table entry
 * — systems then just query() for whichever combination they need. */
export interface ComponentTables {
  position: Position;
  velocity: Velocity;
  agent: Agent;
  wander: Wander;
}

export type ComponentName = keyof ComponentTables;
