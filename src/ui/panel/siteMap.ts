/**
 * Fossil-site map: equirectangular SVG with the bundled Natural Earth land outline, a graticule
 * and one marker per specimen site. The view zooms to the sites of the current species.
 */
import type { Specimen } from '../../data/types';
import { h, s } from '../dom';
import { fitViewBox, graticule, project } from '../mapProjection';
import { WORLD_LAND_ATTRIBUTION, WORLD_LAND_PATH } from '../worldPath';

export function siteMap(specimens: readonly Specimen[], selectedId: string | null, title: string): HTMLElement {
  // Merge specimens from the same site into one marker.
  const sites = new Map<string, { name: string; country: string; lat: number; lon: number; ids: string[] }>();
  for (const sp of specimens) {
    const { lat, lon } = sp.site;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const entry = sites.get(key);
    if (entry) entry.ids.push(sp.id);
    else sites.set(key, { name: sp.site.name, country: sp.site.country, lat, lon, ids: [sp.id] });
  }
  const points = [...sites.values()].map((st) => ({ ...st, ...project(st.lat, st.lon) }));
  const box = fitViewBox(points, 2, 100, 14);
  const scale = box.w / 360; // marker sizes stay constant on screen regardless of zoom
  const grid = graticule(box, 15);
  const svg = s('svg', {
    class: 'sitemap__svg',
    viewBox: `${box.x} ${box.y} ${box.w} ${box.h}`,
    role: 'img',
    'aria-label': `${title}: ${points.map((p) => `${p.name} (${p.country})`).join('; ') || 'no sites recorded'}`,
    preserveAspectRatio: 'xMidYMid meet',
  });
  svg.appendChild(s('rect', { class: 'sitemap__sea', x: box.x, y: box.y, width: box.w, height: box.h }));
  const lines = s('g', { class: 'sitemap__grid' });
  for (const lon of grid.lons) lines.appendChild(s('line', { x1: lon + 180, x2: lon + 180, y1: box.y, y2: box.y + box.h }));
  for (const lat of grid.lats) lines.appendChild(s('line', { x1: box.x, x2: box.x + box.w, y1: 90 - lat, y2: 90 - lat }));
  if (grid.lats.includes(0) || (box.y < 90 && box.y + box.h > 90)) {
    lines.appendChild(s('line', { class: 'sitemap__equator', x1: box.x, x2: box.x + box.w, y1: 90, y2: 90 }));
  }
  svg.appendChild(lines);
  svg.appendChild(s('path', { class: 'sitemap__land', d: WORLD_LAND_PATH }));

  const markers = s('g', { class: 'sitemap__markers' });
  const r = 4.2 * scale;
  for (const p of points) {
    const on = selectedId !== null && p.ids.includes(selectedId);
    const g = s('g', { class: `sitemap__marker${on ? ' is-selected' : ''}`, transform: `translate(${p.x} ${p.y})` });
    g.appendChild(s('title', null, `${p.name}, ${p.country}`));
    g.appendChild(s('circle', { r: r * (on ? 1.9 : 1.6), class: 'sitemap__halo' }));
    g.appendChild(s('circle', { r: on ? r * 1.15 : r }));
    if (on || points.length <= 3) {
      const fs = 11 * scale;
      const right = p.x < box.x + box.w * 0.7;
      g.appendChild(
        s('text', { x: (right ? 1 : -1) * r * 2.4, y: fs * 0.35, 'font-size': fs.toFixed(2), 'text-anchor': right ? 'start' : 'end' }, p.name),
      );
    }
    markers.appendChild(g);
  }
  svg.appendChild(markers);

  return h(
    'figure',
    { class: 'sitemap' },
    svg,
    h('figcaption', { class: 'sitemap__caption' }, points.length ? `${title}. ` : 'No site coordinates recorded. ', h('span', { class: 'muted' }, WORLD_LAND_ATTRIBUTION)),
  );
}
