import { Container } from "pixi.js";

export class Camera {
  minZoom = 0.35;
  maxZoom = 4;

  private world: Container;
  private canvas: HTMLCanvasElement;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  constructor(world: Container, canvas: HTMLCanvasElement) {
    this.world = world;
    this.canvas = canvas;
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
    this.canvas.style.cursor = "grab";
  }

  destroy(): void {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("wheel", this.onWheel);
  }

  /** Fits the given world size into the given view size and centers it —
   * used right after (re)generating terrain so the whole map is visible. */
  frame(pixelWidth: number, pixelHeight: number, viewWidth: number, viewHeight: number): void {
    const scale = Math.min(viewWidth / pixelWidth, viewHeight / pixelHeight, 1) * 0.95;
    this.world.scale.set(scale);
    this.world.x = (viewWidth - pixelWidth * scale) / 2;
    this.world.y = (viewHeight - pixelHeight * scale) / 2;
  }

  private onPointerDown = (e: PointerEvent) => {
    this.dragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.canvas.style.cursor = "grabbing";
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    this.world.x += e.clientX - this.lastX;
    this.world.y += e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  };

  private onPointerUp = () => {
    this.dragging = false;
    this.canvas.style.cursor = "grab";
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const oldScale = this.world.scale.x;
    const factor = Math.exp(-e.deltaY * 0.001);
    const newScale = Math.min(this.maxZoom, Math.max(this.minZoom, oldScale * factor));

    // Keep the point under the cursor fixed while the scale changes.
    const worldX = (mouseX - this.world.x) / oldScale;
    const worldY = (mouseY - this.world.y) / oldScale;
    this.world.scale.set(newScale);
    this.world.x = mouseX - worldX * newScale;
    this.world.y = mouseY - worldY * newScale;
  };
}
