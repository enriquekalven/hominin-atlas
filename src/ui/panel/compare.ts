/**
 * Compare tab: pick a second species (store.compareSpeciesId), choose side-by-side / overlay /
 * morph (store.compareMode, store.morphT) and read a null-safe metrics table with differences.
 */
import type { CompareMode } from '../../app/store';
import { PALEOECOLOGY } from '../../data';
import type { Audience, Species, SpeciesId } from '../../data/types';
import type { UICtx } from '../context';
import { currentSpecies } from '../context';
import { button, h, uid, type Scope } from '../dom';
import { DASH, formatKaRange, formatMeasure, metricDiff, speciesName } from '../format';
import { STAT_LABEL, pick } from '../labels';
import { emptyState, sectionTitle, segmented, taxon } from '../widgets';
import type { TabView } from './index';

function metricsTable(a: Species, b: Species | undefined, audience: Audience): HTMLTableElement {
  const head = (sp: Species | undefined) =>
    h('th', { scope: 'col' }, sp ? (audience === 'kids' ? sp.common.kids : taxon(sp.binomial)) : DASH);
  const rows: [string, (sp: Species) => string, ((x: Species, y: Species) => string) | null][] = [
    [pick(STAT_LABEL.brain, audience), (sp) => formatMeasure(sp.brainCc, 'cc'), (x, y) => metricDiff(x.brainCc, y.brainCc, 'cc')],
    [pick(STAT_LABEL.stature, audience), (sp) => formatMeasure(sp.statureCm, 'cm'), (x, y) => metricDiff(x.statureCm, y.statureCm, 'cm')],
    [pick(STAT_LABEL.mass, audience), (sp) => formatMeasure(sp.massKg, 'kg'), (x, y) => metricDiff(x.massKg, y.massKg, 'kg')],
    [pick(STAT_LABEL.range, audience), (sp) => formatKaRange(sp.rangeKa.start, sp.rangeKa.end), null],
    [audience === 'kids' ? 'Diet chemistry' : 'Isotopic diet (δ¹³C)', (sp) => pick(PALEOECOLOGY[sp.id].dietIsotope, audience), null],
    [audience === 'kids' ? 'Tool stage' : 'Lithic mode', (sp) => pick(PALEOECOLOGY[sp.id].lithicMode, audience), null],
  ];
  return h(
    'table',
    { class: 'compare-table' },
    h('caption', { class: 'sr-only' }, 'Side-by-side measurements'),
    h('thead', null, h('tr', null, h('td', null), head(a), head(b), b ? h('th', { scope: 'col' }, 'Difference') : null)),
    h(
      'tbody',
      null,
      rows.map(([label, get, diff]) =>
        h(
          'tr',
          null,
          h('th', { scope: 'row' }, label),
          h('td', { class: 'num' }, get(a)),
          h('td', { class: 'num' }, b ? get(b) : DASH),
          b ? h('td', { class: 'num diff' }, diff ? diff(a, b) : DASH) : null,
        ),
      ),
    ),
  );
}

function morphSlider(ctx: UICtx, scope: Scope, a: Species, b: Species, audience: Audience): HTMLElement {
  const id = uid('morph');
  const input = h('input', { id, type: 'range', min: '0', max: '1', step: '0.01', class: 'range' });
  const sync = (t: number) => {
    input.value = String(t);
    input.setAttribute('aria-valuetext', `${Math.round((1 - t) * 100)}% ${speciesName(a, audience)}, ${Math.round(t * 100)}% ${speciesName(b, audience)}`);
  };
  input.addEventListener('input', () => ctx.store.set({ morphT: Number(input.value) }));
  sync(ctx.store.get().morphT);
  scope.add(ctx.store.select((s) => s.morphT, sync));
  return h(
    'div',
    { class: 'morph' },
    h('label', { for: id, class: 'morph__label' }, audience === 'kids' ? 'Slowly change one into the other' : 'Morph'),
    input,
    h('div', { class: 'morph__ends' }, h('span', null, speciesName(a, audience)), h('span', null, speciesName(b, audience))),
    h('p', { class: 'note' }, 'Interpolated shapes are illustrative, not ancestral reconstructions.'),
  );
}

function watchMode(ctx: UICtx, fn: (m: CompareMode) => void): () => void {
  fn(ctx.store.get().compareMode);
  return ctx.store.select((s) => s.compareMode, fn);
}

export function createCompareTab(ctx: UICtx): TabView {
  return {
    key: (s) => `${s.speciesId}|${s.compareSpeciesId}|${s.audience}`,
    render(pane, scope) {
      const s = ctx.store.get();
      const a = currentSpecies(ctx);
      const kids = s.audience === 'kids';
      if (!a || ctx.species.length < 2) {
        pane.appendChild(emptyState('Nothing to compare yet', 'At least two species are needed. More are being added.'));
        return;
      }
      const b = s.compareSpeciesId && s.compareSpeciesId !== a.id ? ctx.byId.get(s.compareSpeciesId) : undefined;
      const selId = uid('cmp');
      const select = h(
        'select',
        { id: selId, class: 'select' },
        h('option', { value: '' }, kids ? 'Pick a species…' : 'Select a taxon…'),
        ctx.species
          .filter((x) => x.id !== a.id)
          .map((x) => h('option', { value: x.id, selected: x.id === b?.id }, kids ? x.common.kids : `${x.binomial} — ${x.common.clinician}`)),
      );
      select.setAttribute('data-fk', 'compare-select');
      select.addEventListener('change', () => ctx.store.set({ compareSpeciesId: (select.value || null) as SpeciesId | null }));
      const picker = h('div', { class: 'field' }, h('label', { for: selId }, kids ? 'Compare with' : 'Comparison taxon'), select);
      const quick = [a.ancestry.parent, 'homo-sapiens' as SpeciesId]
        .filter((id): id is SpeciesId => !!id && id !== a.id && id !== b?.id && ctx.byId.has(id))
        .filter((id, i, arr) => arr.indexOf(id) === i);
      pane.append(
        sectionTitle('h3', kids ? 'Compare two relatives' : 'Comparative view'),
        picker,
      );
      if (quick.length) {
        pane.appendChild(
          h(
            'div',
            { class: 'chips' },
            quick.map((id) => {
              const x = ctx.byId.get(id)!;
              return button(kids ? x.common.kids : taxon(x.binomial), { class: 'chip', 'data-fk': 'compare-select' }, () =>
                ctx.store.set({ compareSpeciesId: id }),
              );
            }),
          ),
        );
      }
      if (b) {
        const mode = segmented<CompareMode>({
          label: 'Comparison mode',
          options: [
            { value: 'side-by-side', label: 'Side by side' },
            { value: 'overlay', label: 'Overlay' },
            { value: 'morph', label: 'Morph' },
          ],
          value: s.compareMode,
          onChange: (m) => ctx.store.set({ compareMode: m }),
        });
        const morph = morphSlider(ctx, scope, a, b, s.audience);
        pane.append(mode.el, morph);
        scope.add(
          watchMode(ctx, (m) => {
            mode.update(m);
            morph.hidden = m !== 'morph';
          }),
        );
        pane.appendChild(
          button(kids ? 'Stop comparing' : 'Clear comparison', { class: 'btn btn--quiet', 'data-fk': 'compare-select' }, () =>
            ctx.store.set({ compareSpeciesId: null }),
          ),
        );
      }
      pane.appendChild(metricsTable(a, b, s.audience));
      if (!b) pane.appendChild(h('p', { class: 'muted' }, kids ? 'Pick a second species to see them together in 3D.' : 'Choose a taxon to compare in the viewer.'));
    },
  };
}
