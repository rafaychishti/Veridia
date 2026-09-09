/**
 * Deterministic PRNG (mulberry32). Same seed -> same output stream, forever.
 * This is the one rule the whole simulation is built around: nothing in here
 * may call Math.random(). Every draw goes through a Random instance so a
 * seed fully determines a world.
 */
export class Random {
  private state: number;
  readonly seed: number;

  constructor(seed: number) {
    // Force a 32-bit unsigned integer seed.
    this.seed = seed >>> 0;
    this.state = this.seed;
  }

  /** Returns a float in [0, 1). */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns a float in [min, max). */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Returns an integer in [min, max]. */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /** Picks a random element from a non-empty array. */
  pick<T>(items: readonly T[]): T {
    return items[this.int(0, items.length - 1)];
  }

  /** A fresh, independent-looking Random derived from this one. Handy for
   * giving each subsystem (terrain, agents, weather) its own stream so that
   * generating more agents can't shift the terrain, and vice versa. */
  fork(): Random {
    return new Random((this.next() * 0xffffffff) >>> 0);
  }
}

/** Turns any text into a 32-bit seed, so people can type "veridia-7" as well
 * as plain numbers into the seed field. */
export function hashSeed(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
