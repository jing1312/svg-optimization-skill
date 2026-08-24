export function unionBox(a, b) {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
}
export function inflateBox(b, n) { return { x: b.x - n, y: b.y - n, w: b.w + 2 * n, h: b.h + 2 * n }; }
export function boxCenter(b) { return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; }
