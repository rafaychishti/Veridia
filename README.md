# Veridia

A small deterministic world that grows itself.

This project started as a quiet little sandbox for terrain, wandering agents,
and the shape of an open world that feels alive without being a game.

![Veridia](docs/screenshot.png)

## What this is

`Veridia` generates a patch of terrain from a seed, drops a couple dozen cars
and pedestrians onto it, and lets them wander while a day/night cycle turns
overhead. There's no goal, no score, no backend. It is a small simulation
project built around the idea of keeping the world rules separate from the
renderer. The whole thing is meant to feel like a quiet environment that can
keep evolving without becoming too complicated.

The interesting part isn't really the visuals. It's the rule the whole thing
is built around: **the simulation has no idea PixiJS exists.** Everything
under `src/simulation` is plain TypeScript with zero rendering imports. It
runs on its own clock, using its own seeded random number generator, and
produces a set of entities and terrain data. `src/rendering` reads that data
and draws it. `src/ui` is React, and React never touches the simulation loop
directly — it just flips flags (`paused`, `speed`) that the loop reads. Swap
the renderer for a terminal-based ASCII view and the simulation underneath
wouldn't need to change a line.

## How it's put together

```
src/
  simulation/
    core/
      Random.ts        seeded PRNG (mulberry32) - nothing else may call Math.random()
      World.ts          entity/component tables, the query() + tick() loop
      types.ts           component shapes: Position, Velocity, Agent, Wander
    worldgen/
      TerrainGenerator.ts   fractal simplex noise -> height/moisture -> biome
      types.ts               Tile, TerrainGrid, biome constants
    systems/
      WanderSystem.ts    pick a walkable target, walk to it, pause, repeat
      MovementSystem.ts  position += velocity * dt
    createWorld.ts        assembles a fresh World: terrain + systems + population
    persistence.ts        World <-> JSON

  rendering/
    TerrainRenderer.ts  draws the whole tile grid + trees/settlements once per generation
    EntityRenderer.ts    redraws agents every frame
    Camera.ts             drag to pan, scroll to zoom
    WorldRenderer.ts      owns the PixiJS Application, ties the above together

  ui/
    StatusPanel.tsx      seed / day / time / population / fps
    ControlBar.tsx       play, pause, speed, seed, regenerate, save, load
    GenerationPanel.tsx  sea level / mountain level sliders
```

The simulation is intentionally simple. An entity is just an integer id;
whatever components are attached to that id are the entity. A `World.query`
call returns every id that matches the requested components, and a system runs
over exactly that set. That keeps the world model clean and leaves room for
new things without building a class tree.

Terrain generation stacks a few octaves of simplex noise for height and a
separate stream for moisture, then buckets the result into ocean / sand /
grass / forest / mountain / snow. Two independent RNG forks handle tree and
settlement placement so that turning up the population doesn't perturb the
terrain, and vice versa.

## Running it

```
npm install
npm run dev
```

`npm run build` produces a static `dist/` you can host anywhere - there's no
server component.

## Controls

- Drag to pan, scroll to zoom.
- Play/pause and 1x / 10x / 100x speed.
- Type a seed (or leave it - a random one gets generated) and hit Regenerate.
- Sea level and mountain level sliders change the next regeneration, not the
  current terrain.
- Save writes the current world to a `.json` file; Load reads one back in.

## Known rough edges

- The noise frequency currently produces a lot of small ponds and islands
  rather than one or two coherent landmasses with a real coastline. It's a
  one-line fix (`baseFrequency` in `TerrainGenerator.ts`) I just haven't
  tuned yet.
- Settlement markers barely read at default zoom - the roof color is too
  close to the wall color against this palette.
- "Same seed, same world" is true for terrain and the starting population,
  but not for a full replay: agent wandering consumes the RNG stream once
  per animation frame, and frame timing isn't fixed, so two runs of the same
  seed will diverge in exactly where the cars are ten minutes in. Actual
  determinism would need a fixed timestep, which the sim doesn't have yet.
- Agents path in straight lines to a random walkable tile, so a car can
  briefly clip the corner of an unwalkable tile if the two points line up
  wrong. There's no pathfinding and no road graph - that's next, not now.
- No license file yet. Add one before treating this as reusable by anyone
  else.

## Where this goes next

Roughly in order: a real road graph with agents that path along it instead
of free-roaming, a weather layer, and a small economy sitting on top of
both. None of that is started - the current scope is deliberately just
terrain, a clock, and something to watch move around on it.
