import { Application, Container, Graphics } from "pixi.js";
import { World } from "../simulation/core/World";
import { renderTerrain, terrainPixelSize } from "./TerrainRenderer";
import { EntityRenderer } from "./EntityRenderer";
import { Camera } from "./Camera";

const NIGHT_COLOR = 0x040914;
const MAX_NIGHT_ALPHA = 0.6;

export class WorldRenderer {
  readonly app = new Application();
  private worldContainer = new Container();
  private terrainContainer: Container | null = null;
  private entityRenderer = new EntityRenderer();
  private overlay = new Graphics();
  camera!: Camera;

  async mount(el: HTMLDivElement): Promise<void> {
    await this.app.init({
      resizeTo: el,
      backgroundColor: 0x0b1210,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
    el.appendChild(this.app.canvas);

    this.app.stage.addChild(this.worldContainer);
    this.worldContainer.addChild(this.entityRenderer.graphics);
    this.app.stage.addChild(this.overlay);

    this.camera = new Camera(this.worldContainer, this.app.canvas);
  }

  setTerrain(world: World): void {
    this.terrainContainer?.destroy({ children: true });
    this.terrainContainer = renderTerrain(world.terrain);
    this.worldContainer.addChildAt(this.terrainContainer, 0);

    const { width, height } = terrainPixelSize(world.terrain);
    this.camera.frame(width, height, this.app.screen.width, this.app.screen.height);
  }

  render(world: World): void {
    this.entityRenderer.render(world, world.terrain.tileSize);
    this.drawDayNight(world);
  }

  private drawDayNight(world: World): void {
    const hour = (world.clock.elapsed * world.clock.hoursPerSecond) % 24;
    // 1 at midnight, 0 at noon, smooth in between.
    const nightFactor = 0.5 * (1 + Math.cos((hour / 24) * Math.PI * 2));
    const { width, height } = this.app.screen;

    this.overlay.clear();
    this.overlay.rect(0, 0, width, height).fill(NIGHT_COLOR);
    this.overlay.alpha = nightFactor * MAX_NIGHT_ALPHA;
  }

  destroy(): void {
    this.camera?.destroy();
    this.app.destroy(true, { children: true });
  }
}
