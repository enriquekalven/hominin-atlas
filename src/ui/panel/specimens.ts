/**
 * Specimens tab: one card per fossil (nickname, catalogue no., site, age + method, discovery,
 * completeness, story) and a fossil-site map. Selecting a card sets store.specimenId.
 */
import type { Audience, Specimen } from '../../data/types';
import { getSpecimen } from '../../data';
import type { UICtx } from '../context';
import { currentSpecies } from '../context';
import { button, h } from '../dom';
import { DASH, formatAge, formatPercent } from '../format';
import { SEX_LABEL, pick } from '../labels';
import { emptyState, sectionTitle } from '../widgets';
import { selectSpecimen } from '../actions';
import { siteMap } from './siteMap';
import { renderCitations } from './citations';
import type { TabView } from './index';

function card(ctx: UICtx, sp: Specimen, selected: boolean, audience: Audience): HTMLElement {
  const kids = audience === 'kids';
  const row = (label: string, value: string) => [h('dt', null, label), h('dd', { class: 'num' }, value || DASH)];
  const discovery =
    sp.discovery.year !== null || sp.discovery.by
      ? [sp.discovery.year !== null ? String(sp.discovery.year) : null, sp.discovery.by].filter(Boolean).join(' · ')
      : DASH;
  const title = sp.nickname ?? (kids ? `Fossil from ${sp.site.name}` : sp.catalog);
  const select = button(
    selected ? (kids ? 'Showing in 3D' : 'Displayed') : kids ? 'Show in 3D' : 'Display',
    { class: `btn ${selected ? 'btn--quiet' : ''}`, 'aria-pressed': String(selected), 'data-fk': `spec-${sp.id}` },
    () => selectSpecimen(ctx, sp.id),
  );
  return h(
    'article',
    { class: `card${selected ? ' is-selected' : ''}` },
    h(
      'header',
      { class: 'card__head' },
      h('h3', { class: 'card__title' }, title),
      !kids && sp.nickname ? h('p', { class: 'card__catalog num' }, sp.catalog) : null,
      sp.isFlagship ? h('span', { class: 'tag' }, kids ? 'Main fossil' : 'Flagship') : null,
    ),
    h(
      'dl',
      { class: 'facts facts--compact' },
      row(kids ? 'Found at' : 'Site', `${sp.site.name}, ${sp.site.country}`),
      row(kids ? 'Age' : 'Geological age', formatAge(sp.ageKa, audience)),
      !kids ? row('Dating method', sp.ageKa.method ?? DASH) : null,
      !kids ? row('Sex / age at death', `${SEX_LABEL[sp.sex]}${sp.ageAtDeath ? ` · ${sp.ageAtDeath}` : ''}`) : null,
      row(kids ? 'Discovered' : 'Discovery', discovery),
      row(kids ? 'How much was found' : 'Completeness', formatPercent(sp.completeness.percent)),
      row(kids ? 'Injuries' : 'Lesions', String(sp.lesions.length)),
    ),
    h('p', { class: 'card__story' }, pick(sp.story, audience)),
    sp.taphonomy.note && !kids ? h('p', { class: 'note' }, sp.taphonomy.note) : null,
    !kids ? renderCitations(sp.citations) : null,
    h('div', { class: 'card__actions' }, select),
  );
}

export function createSpecimensTab(ctx: UICtx): TabView {
  return {
    key: (s) => `${s.speciesId}|${s.specimenId}|${s.audience}`,
    render(pane) {
      const s = ctx.store.get();
      const sp = currentSpecies(ctx);
      if (!sp) {
        pane.appendChild(emptyState('No species selected', 'Pick a species to see its fossils.'));
        return;
      }
      if (sp.specimens.length === 0) {
        pane.appendChild(emptyState(s.audience === 'kids' ? 'No fossils yet' : 'No specimens recorded', 'Fossil records for this species are still being added.'));
        return;
      }
      const shown = getSpecimen(sp, s.specimenId);
      pane.append(
        sectionTitle('h3', s.audience === 'kids' ? 'Where the fossils were found' : 'Fossil sites'),
        siteMap(sp.specimens, shown?.id ?? null, s.audience === 'kids' ? 'Map of fossil sites' : 'Specimen localities'),
        sectionTitle('h3', s.audience === 'kids' ? 'Fossils' : 'Specimens', sp.specimens.length),
        h('div', { class: 'cards' }, sp.specimens.map((x) => card(ctx, x, x.id === shown?.id, s.audience))),
      );
    },
  };
}
