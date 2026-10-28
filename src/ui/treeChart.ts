/**
 * Family-tree range chart (SVG): one column per species, y = log time (oldest at the top),
 * solid / dashed ancestry connectors and dotted gene-flow arcs. Columns are keyboard-focusable.
 */
import type { Audience, Species, SpeciesId } from '../data/types';
import { s } from './dom';
import { abbreviateBinomial, speciesDates, speciesName, taxonParts } from './format';
import { TICKS, kaToT } from './timeScale';
import type { TreeLayout } from './treeLayout';

const M_LEFT = 64;
const PLOT_H = 430;
const PAD_BOTTOM = 24;
const SIN_40 = Math.sin((40 * Math.PI) / 180);

function label(sp: Species, audience: Audience): SVGTextElement {
  const t = s('text', { class: 'tree__label', transform: 'rotate(-40)' });
  if (audience === 'kids') {
    t.textContent = sp.common.kids;
  } else {
    for (const part of taxonParts(abbreviateBinomial(sp.binomial))) {
      t.appendChild(s('tspan', { class: part.italic ? 'it' : null }, part.text));
    }
  }
  return t;
}

export function treeChart(
  layout: TreeLayout,
  byId: ReadonlyMap<SpeciesId, Species>,
  audience: Audience,
  selected: SpeciesId,
  onPick: (id: SpeciesId) => void,
): SVGSVGElement {
  const colW = audience === 'kids' ? 64 : 56;
  // Header tall enough for the longest rotated (-40°) column label.
  const names = layout.nodes.map((n) => {
    const sp = byId.get(n.id);
    return sp ? (audience === 'kids' ? sp.common.kids : abbreviateBinomial(sp.binomial)) : '';
  });
  const longest = Math.max(0, ...names.map((n) => n.length));
  const HEAD = Math.round(Math.max(110, Math.min(210, 30 + longest * (audience === 'kids' ? 7.8 : 6.8) * SIN_40)));
  const yOf = (ka: number) => HEAD + kaToT(ka) * PLOT_H;
  const width = M_LEFT + layout.columns * colW + 170;
  const height = HEAD + PLOT_H + PAD_BOTTOM;
  const xOf = (col: number) => M_LEFT + col * colW + colW / 2;
  const svg = s('svg', {
    class: 'tree__svg',
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    preserveAspectRatio: 'xMinYMin meet',
    role: 'group',
    'aria-label': audience === 'kids' ? 'Family tree chart' : 'Phylogeny range chart',
  });

  const axis = s('g', { class: 'tree__axis', 'aria-hidden': 'true' });
  for (const tick of TICKS) {
    const y = yOf(tick.ka);
    axis.appendChild(s('line', { x1: M_LEFT - 6, x2: width - 8, y1: y, y2: y }));
    axis.appendChild(s('text', { x: M_LEFT - 10, y: y + 4, 'text-anchor': 'end' }, audience === 'kids' ? tick.label.kids : tick.label.clinician));
  }
  svg.appendChild(axis);

  const colOf = new Map(layout.nodes.map((n) => [n.id, n]));
  const links = s('g', { class: 'tree__links', 'aria-hidden': 'true' });
  for (const n of layout.nodes) {
    const p = n.parent ? colOf.get(n.parent) : undefined;
    if (!p) continue;
    const y = yOf(n.startKa);
    links.appendChild(
      s('path', { d: `M${xOf(p.col)} ${y}H${xOf(n.col)}`, class: `tree__anc${n.uncertain ? ' is-uncertain' : ''}` }),
    );
  }
  const flowWord = audience === 'kids' ? 'interbreeding' : 'introgression';
  // Arcs that start near the same height get increasing bulge so their labels do not collide.
  const drawn: { y: number; x1: number; x2: number }[] = [];
  for (const l of layout.links) {
    const a = colOf.get(l.a);
    const b = colOf.get(l.b);
    if (!a || !b) continue;
    const y = yOf(l.ka);
    const x1 = xOf(Math.min(a.col, b.col));
    const x2 = xOf(Math.max(a.col, b.col));
    const crowd = drawn.filter((d) => Math.abs(d.y - y) < 18 && d.x1 < x2 && x1 < d.x2).length;
    drawn.push({ y, x1, x2 });
    const bulge = Math.min(46, 12 + (x2 - x1) * 0.12) + crowd * 13;
    links.appendChild(s('path', { d: `M${x1} ${y}Q${(x1 + x2) / 2} ${y - bulge * 2} ${x2} ${y}`, class: 'tree__flow' }));
    // One label per cluster of overlapping arcs (the legend explains every dotted arc).
    if (crowd === 0) {
      links.appendChild(s('text', { class: 'tree__flow-label', x: (x1 + x2) / 2, y: y - bulge - 4, 'text-anchor': 'middle' }, flowWord));
    }
  }
  svg.appendChild(links);

  for (const n of layout.nodes) {
    const sp = byId.get(n.id);
    if (!sp) continue;
    const x = xOf(n.col);
    const y0 = yOf(n.startKa);
    const y1 = Math.max(y0 + 4, yOf(n.endKa));
    const on = n.id === selected;
    const g = s('g', {
      class: `tree__node${on ? ' is-selected' : ''}`,
      role: 'button',
      tabindex: '0',
      'aria-label': `${speciesName(sp, audience)}, ${speciesDates(sp)}${on ? ' (selected)' : ''}`,
      'data-id': sp.id,
    });
    g.appendChild(s('rect', { class: 'tree__hit', x: x - colW / 2 + 2, y: HEAD - 6, width: colW - 4, height: PLOT_H + 12, rx: 4 }));
    g.appendChild(s('line', { class: 'tree__guide', x1: x, x2: x, y1: HEAD, y2: y0 }));
    g.appendChild(s('rect', { class: `tree__bar tree__bar--${sp.group}`, x: x - 4, y: y0, width: 8, height: y1 - y0, rx: 2 }));
    g.appendChild(s('circle', { class: 'tree__dot', cx: x, cy: y0, r: 4.5 }));
    const lab = s('g', { transform: `translate(${x + 2} ${HEAD - 12})` });
    lab.appendChild(label(sp, audience));
    g.appendChild(lab);
    g.addEventListener('click', () => onPick(sp.id));
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onPick(sp.id);
      }
    });
    svg.appendChild(g);
  }
  return svg;
}
