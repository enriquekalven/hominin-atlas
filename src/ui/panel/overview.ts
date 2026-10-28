/**
 * Overview tab: full skin-and-attire life reconstruction + close-up portrait switcher, read-aloud,
 * overview text, key stats, traits, fun facts (kids), lifestyle and (clinician) sources.
 */
import type { Audience, Species } from '../../data/types';
import type { UICtx } from '../context';
import { currentSpecies, watch } from '../context';
import { append, button, h } from '../dom';
import { DASH, formatKaRange, formatMeasure } from '../format';
import { PORTRAIT_CAPTION, STAT_LABEL, pick } from '../labels';
import { ATTIRE_SUMMARY, openLifeDialog, portrait, reconstruction } from '../portrait';
import { readAloudButton } from '../speech';
import { emptyState, sectionTitle, segmented } from '../widgets';
import { renderCitations } from './citations';
import type { TabView } from './index';

function statsTable(sp: Species, audience: Audience): HTMLTableElement {
  const row = (label: string, value: string) =>
    h('tr', null, h('th', { scope: 'row' }, label), h('td', { class: 'num' }, value || DASH));
  return h(
    'table',
    { class: 'stats' },
    h('caption', { class: 'sr-only' }, 'Key facts'),
    h(
      'tbody',
      null,
      row(pick(STAT_LABEL.brain, audience), formatMeasure(sp.brainCc, 'cc')),
      row(pick(STAT_LABEL.stature, audience), formatMeasure(sp.statureCm, 'cm')),
      row(pick(STAT_LABEL.mass, audience), formatMeasure(sp.massKg, 'kg')),
      row(pick(STAT_LABEL.range, audience), formatKaRange(sp.rangeKa.start, sp.rangeKa.end)),
      row(pick(STAT_LABEL.regions, audience), sp.regions.length ? sp.regions.join(', ') : DASH),
    ),
  );
}

function lifestyle(sp: Species, audience: Audience, attireNote: string): HTMLElement {
  const item = (label: string, text: string) => [h('dt', null, label), h('dd', null, text || DASH)];
  return h(
    'dl',
    { class: 'facts' },
    item(audience === 'kids' ? 'Skin, hair & clothes' : 'Integument & attire', attireNote),
    item(pick(STAT_LABEL.locomotion, audience), pick(sp.locomotion, audience)),
    item(pick(STAT_LABEL.diet, audience), pick(sp.diet, audience)),
    item(pick(STAT_LABEL.technology, audience), pick(sp.technology, audience)),
  );
}

export function createOverviewTab(ctx: UICtx): TabView {
  let heroView: 'attire' | 'bust' = 'attire';
  return {
    key: (s) => `${s.speciesId}|${s.audience}`,
    render(pane, scope) {
      const sp = currentSpecies(ctx);
      const audience = ctx.store.get().audience;
      if (!sp) {
        pane.appendChild(
          emptyState(
            ctx.species.length === 0 ? 'No species data yet' : 'No species selected',
            ctx.species.length === 0
              ? 'Species records are still being curated. The 3D viewer and timeline will fill in automatically.'
              : 'Choose a species from the list.',
          ),
        );
        return;
      }
      const kids = audience === 'kids';
      const traits = kids ? sp.keyTraits.kids : sp.keyTraits.clinician;
      const attireNote = pick(ATTIRE_SUMMARY[sp.id], audience);
      const speak = readAloudButton(
        () =>
          (kids
            ? [sp.common.kids, sp.overview.kids, attireNote, ...sp.funFacts]
            : [sp.binomial, sp.overview.clinician, attireNote]
          ).join('. '),
        { prominent: kids },
      );

      const stageWrap = h('div', { class: 'hero__stage' });
      const syncHero = () => {
        const imgEl =
          heroView === 'attire'
            ? reconstruction(sp, 'portrait--hero portrait--recon', `Life reconstruction of ${sp.common.kids} with skin and attire`)
            : portrait(sp, 'portrait--hero', `Close-up facial impression of ${sp.common.kids}`);
        const trigger = button(
          imgEl,
          { class: 'hero__zoom', 'aria-label': `Open full-screen skin and attire view for ${sp.common.kids}` },
          () => openLifeDialog(sp, audience),
        );
        stageWrap.replaceChildren(trigger);
      };
      syncHero();

      const switcher = segmented<'attire' | 'bust'>({
        label: 'Reconstruction view',
        className: 'seg--hero',
        options: [
          { value: 'attire', label: kids ? 'Skin & clothes' : 'Skin & attire' },
          { value: 'bust', label: kids ? 'Face close-up' : 'Cranial bust' },
        ],
        value: heroView,
        onChange: (v) => {
          heroView = v;
          syncHero();
        },
      });
      const toggle3dBtn = button(
        null,
        { class: 'btn btn--ghost btn--xs' },
        () => ctx.store.set({ showFlesh: !ctx.store.get().showFlesh }),
      );
      scope.add(
        watch(ctx.store, (s) => s.showFlesh, (on) => {
          toggle3dBtn.textContent = on ? 'Hide 3D skin & clothes' : 'Show on 3D skeleton';
        }),
      );

      append(pane, [
        h(
          'figure',
          { class: 'hero' },
          h('div', { class: 'hero__bar' }, switcher.el, toggle3dBtn),
          stageWrap,
          h('p', { class: 'hero__attire' }, attireNote),
          h('figcaption', { class: 'hero__caption' }, PORTRAIT_CAPTION),
        ),
        h('div', { class: 'overview__lede' }, h('p', { class: 'lede' }, pick(sp.overview, audience)), speak),
        sectionTitle('h3', kids ? 'Quick facts' : 'Key data'),
        statsTable(sp, audience),
        traits.length
          ? [sectionTitle('h3', kids ? 'What made them special' : 'Diagnostic traits'), h('ul', { class: 'bullets' }, traits.map((t) => h('li', null, t)))]
          : null,
        kids && sp.funFacts.length
          ? h(
              'section',
              { class: 'funfacts' },
              sectionTitle('h3', 'Fun facts'),
              h('ul', { class: 'bullets' }, sp.funFacts.map((f) => h('li', null, f))),
            )
          : null,
        sectionTitle('h3', kids ? 'Daily life & attire' : 'Behaviour, ecology & attire'),
        lifestyle(sp, audience, attireNote),
        !kids ? renderCitations(sp.citations) : null,
      ]);
    },
  };
}
