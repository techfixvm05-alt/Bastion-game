export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
export const dist = (a, b) => Math.sqrt(dist2(a, b));
export const rand = (min, max) => min + Math.random() * (max - min);
export const choose = list => list[Math.floor(Math.random() * list.length)];
export function nearest(list, point, max = Infinity, score = null) {
  let best = null, value = max * max;
  for (const item of list) {
    const d = dist2(item, point);
    const s = score ? score(item, d) : d;
    if (d <= max * max && s < value) { value = s; best = item; }
  }
  return best;
}
export function pointOnSegmentDistance(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}
export function pointOnRoutes(point, routes, radius) {
  return routes.some(route => route.points.slice(1).some((p, i) => pointOnSegmentDistance(point, route.points[i], p) < radius));
}
