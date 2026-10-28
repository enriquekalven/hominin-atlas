/**
 * Equirectangular projection + view-box fitting for the fossil-site map (pure, unit-tested).
 * Map space matches worldPath.ts: x = lon + 180, y = 90 − lat, world = 360 × 180.
 */
export const WORLD_W = 360;
export const WORLD_H = 180;

export interface Point {
  x: number;
  y: number;
}

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function project(lat: number, lon: number): Point {
  const la = Math.max(-90, Math.min(90, Number.isFinite(lat) ? lat : 0));
  const lo = Math.max(-180, Math.min(180, Number.isFinite(lon) ? lon : 0));
  return { x: lo + 180, y: 90 - la };
}

/**
 * Smallest box around the points (plus padding) with the requested aspect ratio (w / h),
 * at least `minW` wide, shifted to stay inside the world. No points → the whole world.
 */
export function fitViewBox(points: readonly Point[], aspect = 2, minW = 90, pad = 12): ViewBox {
  const fitAspect = (w: number, h: number) => (w / h > aspect ? { w, h: w / aspect } : { w: h * aspect, h });
  if (points.length === 0) {
    const { w, h } = fitAspect(WORLD_W, WORLD_H);
    return clampBox({ x: (WORLD_W - w) / 2, y: (WORLD_H - h) / 2, w, h });
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs) - pad;
  const maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad;
  const maxY = Math.max(...ys) + pad;
  const sized = fitAspect(Math.max(maxX - minX, minW), Math.max(maxY - minY, minW / aspect));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return clampBox({ x: cx - sized.w / 2, y: cy - sized.h / 2, w: sized.w, h: sized.h });
}

function clampBox(b: ViewBox): ViewBox {
  let { w, h } = b;
  if (w > WORLD_W) {
    h *= WORLD_W / w;
    w = WORLD_W;
  }
  if (h > WORLD_H) {
    w *= WORLD_H / h;
    h = WORLD_H;
  }
  const x = Math.min(Math.max(b.x, 0), WORLD_W - w);
  const y = Math.min(Math.max(b.y, 0), WORLD_H - h);
  const r = (n: number) => Math.round(n * 100) / 100;
  return { x: r(x), y: r(y), w: r(w), h: r(h) };
}

/** Graticule lines every `step` degrees inside the box (for the map background). */
export function graticule(box: ViewBox, step = 30): { lons: number[]; lats: number[] } {
  const lons: number[] = [];
  const lats: number[] = [];
  for (let lon = -180 + step; lon < 180; lon += step) {
    const x = lon + 180;
    if (x > box.x && x < box.x + box.w) lons.push(lon);
  }
  for (let lat = -90 + step; lat < 90; lat += step) {
    const y = 90 - lat;
    if (y > box.y && y < box.y + box.h) lats.push(lat);
  }
  return { lons, lats };
}
