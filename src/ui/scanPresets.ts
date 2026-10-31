/**
 * UI section inside the 3D scan loader dialog: one-click bundled CC0 Smithsonian NMNH
 * osteological surface scans (`/scans/*.glb`) plus curated links to open-access 3D fossil archives.
 */
import { MUSEUM_SCAN_PRESETS, OPEN_ACCESS_REPOSITORIES } from '../app/museumScans';
import type { UICtx } from './context';
import { button, externalLink, h } from './dom';
import { icon } from './icons';
import { taxon } from './widgets';

export function renderScanPresetsSection(ctx: UICtx): HTMLElement {
  const presetButtons = MUSEUM_SCAN_PRESETS.map((p) =>
    button(
      [
        h('span', { class: 'scan-preset__title' }, p.title),
        h('span', { class: 'scan-preset__meta' }, taxon(p.taxon), ` · ${p.element} · ${p.sizeLabel}`),
      ],
      { class: 'scan-preset', 'data-preset': p.id },
      () => {
        ctx.announce(`Loading ${p.title}…`);
        ctx.events.emit('scan:preset', { presetId: p.id });
      },
    ),
  );

  const repoItems = OPEN_ACCESS_REPOSITORIES.map((r) =>
    h(
      'li',
      { class: 'scan-repo' },
      externalLink(r.href, [icon('book'), ' ', r.name], { class: 'scan-repo__link' }),
      h('span', { class: 'scan-repo__inst' }, ` — ${r.institution}`),
      h('p', { class: 'scan-repo__note muted' }, r.note),
    ),
  );

  return h(
    'section',
    { class: 'scan-presets' },
    h('h3', { class: 'section-title' }, 'Bundled CC0 museum surface scans (Smithsonian NMNH)'),
    h('p', { class: 'muted' }, 'Inspect real laser/structured-light osteological meshes alongside our parametric reconstructions:'),
    h('div', { class: 'scan-presets__grid' }, presetButtons),
    h('h3', { class: 'section-title' }, 'Open-access fossil 3D archives'),
    h('ul', { class: 'scan-repos', role: 'list' }, repoItems),
  );
}
