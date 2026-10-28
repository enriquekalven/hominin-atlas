import { describe, expect, it } from 'vitest';
import { WORLD_H, WORLD_W, fitViewBox, graticule, project } from '../src/ui/mapProjection';
import { WORLD_LAND_ATTRIBUTION, WORLD_LAND_PATH } from '../src/ui/worldPath';
import { parseImageDataUrl, snapshotFileName } from '../src/ui/download';

describe('project (equirectangular)', () => {
  it('maps lat/lon to the 360×180 map space', () => {
    expect(project(0, 0)).toEqual({ x: 180, y: 90 });
    expect(project(90, 180)).toEqual({ x: 360, y: 0 });
    expect(project(-90, -180)).toEqual({ x: 0, y: 180 });
    const shanidar = project(36.8, 44.2); // Shanidar Cave, Iraq (approx.)
    expect(shanidar.x).toBeCloseTo(224.2, 9);
    expect(shanidar.y).toBeCloseTo(53.2, 9);
  });

  it('clamps out-of-range and non-finite input', () => {
    expect(project(120, 400)).toEqual({ x: 360, y: 0 });
    expect(project(Number.NaN, Number.NaN)).toEqual({ x: 180, y: 90 });
  });
});

describe('fitViewBox', () => {
  const inside = (b: ReturnType<typeof fitViewBox>) =>
    b.x >= 0 && b.y >= 0 && b.x + b.w <= WORLD_W + 1e-6 && b.y + b.h <= WORLD_H + 1e-6;

  it('shows the whole world when there are no points', () => {
    const b = fitViewBox([]);
    expect(b).toEqual({ x: 0, y: 0, w: 360, h: 180 });
  });

  it('keeps the aspect ratio, contains all points and stays inside the world', () => {
    const pts = [project(36.8, 44.2), project(-8.5, 120.4), project(-26, 27.7)];
    const b = fitViewBox(pts, 2, 90, 12);
    expect(b.w / b.h).toBeCloseTo(2, 1);
    expect(inside(b)).toBe(true);
    for (const p of pts) {
      expect(p.x).toBeGreaterThanOrEqual(b.x);
      expect(p.x).toBeLessThanOrEqual(b.x + b.w);
      expect(p.y).toBeGreaterThanOrEqual(b.y);
      expect(p.y).toBeLessThanOrEqual(b.y + b.h);
    }
  });

  it('enforces a minimum width around a single site and clamps at the map edge', () => {
    const b = fitViewBox([project(80, 179)], 2, 100, 10);
    expect(b.w).toBeGreaterThanOrEqual(100);
    expect(inside(b)).toBe(true);
  });

  it('lists graticule lines inside the box only', () => {
    const g = graticule({ x: 150, y: 40, w: 120, h: 60 }, 30);
    expect(g.lons).toEqual([0, 30, 60]);
    expect(g.lats).toEqual([0, 30]);
  });
});

describe('bundled land outline', () => {
  it('is a compact, plain SVG path with attribution', () => {
    expect(WORLD_LAND_PATH.startsWith('M')).toBe(true);
    expect(/^[MlLz0-9 .-]+$/.test(WORLD_LAND_PATH)).toBe(true);
    expect(WORLD_LAND_PATH.length).toBeLessThan(25_000);
    expect(WORLD_LAND_ATTRIBUTION).toMatch(/Natural Earth/);
  });
});

describe('snapshot data URLs', () => {
  it('decodes base64 raster data URLs', () => {
    const r = parseImageDataUrl('data:image/png;base64,iVBORw0KGgo=');
    expect(r?.mime).toBe('image/png');
    expect(Array.from(r!.bytes.slice(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it('rejects anything else', () => {
    expect(parseImageDataUrl('data:image/svg+xml;base64,PHN2Zz4=')).toBeNull();
    expect(parseImageDataUrl('javascript:alert(1)')).toBeNull();
    expect(parseImageDataUrl('data:text/html;base64,PGgxPg==')).toBeNull();
    expect(parseImageDataUrl('data:image/png;base64,***')).toBeNull();
    expect(parseImageDataUrl(42 as unknown as string)).toBeNull();
  });

  it('builds safe file names', () => {
    const d = new Date(2026, 9, 26, 15, 7);
    expect(snapshotFileName('homo-erectus', 'image/png', d)).toBe('hominin-atlas-homo-erectus-2026-10-26-1507.png');
    expect(snapshotFileName('../../etc/passwd', 'image/jpeg', d)).toBe('hominin-atlas-etcpasswd-2026-10-26-1507.jpg');
  });
});
