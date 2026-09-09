import { useEffect, useRef, useState } from "react";
import "./App.css";
import { World } from "./simulation/core/World";
import { createWorld } from "./simulation/createWorld";
import { WorldRenderer } from "./rendering/WorldRenderer";
import { downloadSave, deserializeWorld, serializeWorld } from "./simulation/persistence";
import type { WorldSaveFile } from "./simulation/persistence";
import type { TerrainOptions } from "./simulation/worldgen/TerrainGenerator";
import { hashSeed } from "./simulation/core/Random";
import { StatusPanel } from "./ui/StatusPanel";
import { ControlBar } from "./ui/ControlBar";
import { GenerationPanel } from "./ui/GenerationPanel";

function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

export default function App() {
  const hostRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WorldRenderer | null>(null);
  const worldRef = useRef<World | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speedRef = useRef(1);

  const [seedText, setSeedText] = useState(String(randomSeed()));
  const [seaLevel, setSeaLevel] = useState(0.36);
  const [mountainLevel, setMountainLevel] = useState(0.72);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [stats, setStats] = useState({ day: 0, hour: 0, cars: 0, pedestrians: 0, fps: 0, seed: 0 });

  const terrainOptions = (): Partial<TerrainOptions> => ({ seaLevel, mountainLevel });

  const resolveSeed = (): number => {
    const trimmed = seedText.trim();
    if (trimmed === "") return randomSeed();
    const asNumber = Number(trimmed);
    return Number.isFinite(asNumber) && trimmed !== "" ? Math.floor(Math.abs(asNumber)) : hashSeed(trimmed);
  };

  const loadWorld = (world: World) => {
    worldRef.current = world;
    rendererRef.current?.setTerrain(world);
    setSeedText(String(world.seed));
  };

  // Mount the renderer once, tear it down on unmount. Guarded with a
  // "ready" flag rather than just "cancelled" because React (Strict Mode,
  // fast refresh) can unmount before the async Pixi init resolves — we must
  // never call app.destroy() on a still-initializing Application.
  useEffect(() => {
    const renderer = new WorldRenderer();
    rendererRef.current = renderer;
    let disposed = false;
    let ready = false;

    renderer.mount(hostRef.current!).then(() => {
      if (disposed) {
        renderer.destroy();
        return;
      }
      ready = true;
      const world = createWorld(resolveSeed(), terrainOptions());
      loadWorld(world);

      let frameCount = 0;
      let fpsWindowStart = performance.now();
      let last = performance.now();

      renderer.app.ticker.add(() => {
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.25);
        last = now;

        const w = worldRef.current;
        if (w) {
          w.clock.speed = speedRef.current;
          w.tick(dt);
          renderer.render(w);
        }

        frameCount++;
        if (now - fpsWindowStart >= 500) {
          const fps = Math.round((frameCount * 1000) / (now - fpsWindowStart));
          frameCount = 0;
          fpsWindowStart = now;
          const cur = worldRef.current;
          if (cur) {
            const hour = (cur.clock.elapsed * cur.clock.hoursPerSecond) % 24;
            const day = Math.floor((cur.clock.elapsed * cur.clock.hoursPerSecond) / 24);
            setStats({
              day,
              hour,
              cars: cur.query(["agent"]).filter((id) => cur.get(id, "agent")!.kind === "car").length,
              pedestrians: cur.query(["agent"]).filter((id) => cur.get(id, "agent")!.kind === "pedestrian").length,
              fps,
              seed: cur.seed,
            });
          }
        }
      });
    });

    return () => {
      disposed = true;
      if (ready) renderer.destroy();
    };
    // Intentionally run once - regeneration is handled imperatively below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    speedRef.current = paused ? 0 : speed;
  }, [paused, speed]);

  const handleRegenerate = () => {
    const seed = resolveSeed();
    const world = createWorld(seed, terrainOptions());
    loadWorld(world);
  };

  const handleSave = () => {
    const world = worldRef.current;
    if (!world) return;
    downloadSave(serializeWorld(world, terrainOptions()));
  };

  const handleLoadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const save = JSON.parse(reader.result as string) as WorldSaveFile;
        const world = deserializeWorld(save);
        loadWorld(world);
        setSeaLevel(save.terrainOptions.seaLevel ?? seaLevel);
        setMountainLevel(save.terrainOptions.mountainLevel ?? mountainLevel);
      } catch {
        // A bad file just gets ignored - nothing in the running world changes.
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app">
      <div className="canvas-host" ref={hostRef} />

      <StatusPanel
        seed={stats.seed}
        day={stats.day}
        hour={stats.hour}
        cars={stats.cars}
        pedestrians={stats.pedestrians}
        fps={stats.fps}
      />

      <GenerationPanel
        seaLevel={seaLevel}
        mountainLevel={mountainLevel}
        onSeaLevelChange={setSeaLevel}
        onMountainLevelChange={setMountainLevel}
      />

      <ControlBar
        paused={paused}
        speed={speed}
        seedText={seedText}
        onTogglePause={() => setPaused((p) => !p)}
        onSetSpeed={(s) => {
          setSpeed(s);
          setPaused(false);
        }}
        onSeedTextChange={setSeedText}
        onRegenerate={handleRegenerate}
        onSave={handleSave}
        onLoadClick={() => fileInputRef.current?.click()}
      />

      <div className="hint">Drag to pan &middot; scroll to zoom</div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleLoadFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
