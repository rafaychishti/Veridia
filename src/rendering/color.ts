export function shade(color: number, amount: number): number {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const lr = clamp(r + amount);
  const lg = clamp(g + amount);
  const lb = clamp(b + amount);
  return (lr << 16) | (lg << 8) | lb;
}
