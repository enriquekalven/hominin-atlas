/**
 * Overview tab: full skin-and-attire life reconstruction + close-up portrait switcher, Chirp 3 HD read-aloud,
 * localized overview text, key stats, traits, fun facts (kids), lifestyle and (clinician) sources.
 */
import type { Audience, LangCode, Species } from '../../data/types';
import { localizedSpecies, uiText, type LocalizedSpeciesEntry } from '../../i18n';
import type { UICtx } from '../context';
import { currentSpecies, watch } from '../context';
import { append, button, h } from '../dom';
import { DASH, formatKaRange, formatMeasure } from '../format';
import { pick } from '../labels';
import { openLifeDialog, portrait, reconstruction } from '../portrait';
import { readAloudButton } from '../speech';
import { emptyState, sectionTitle, segmented } from '../widgets';
import { renderCitations } from './citations';
import type { TabView } from './index';

function statsTable(sp: Species, audience: Audience, lang: LangCode): HTMLTableElement {
  const t = uiText(lang);
  const row = (label: string, value: string) =>
    h('tr', null, h('th', { scope: 'row' }, label), h('td', { class: 'num' }, value || DASH));
  return h(
    'table',
    { class: 'stats' },
    h('caption', { class: 'sr-only' }, pick(t.quickFacts, audience)),
    h(
      'tbody',
      null,
      row(pick(t.brain, audience), formatMeasure(sp.brainCc, 'cc')),
      row(pick(t.stature, audience), formatMeasure(sp.statureCm, 'cm')),
      row(pick(t.mass, audience), formatMeasure(sp.massKg, 'kg')),
      row(pick(t.range, audience), formatKaRange(sp.rangeKa.start, sp.rangeKa.end)),
      row(pick(t.regions, audience), sp.regions.length ? sp.regions.join(', ') : DASH),
    ),
  );
}

function lifestyle(loc: LocalizedSpeciesEntry, audience: Audience, lang: LangCode, attireNote: string): HTMLElement {
  const t = uiText(lang);
  const item = (label: string, text: string) => [h('dt', null, label), h('dd', null, text || DASH)];
  return h(
    'dl',
    { class: 'facts' },
    item(pick(t.skinAttireLabel, audience), attireNote),
    item(pick(t.locomotion, audience), pick(loc.locomotion, audience)),
    item(pick(t.diet, audience), pick(loc.diet, audience)),
    item(pick(t.technology, audience), pick(loc.technology, audience)),
  );
}

export function createOverviewTab(ctx: UICtx): TabView {
  let heroView: 'attire' | 'bust' = 'attire';
  return {
    key: (s) => `${s.speciesId}|${s.audience}|${s.lang}`,
    render(pane, scope) {
      const sp = currentSpecies(ctx);
      const { audience, lang } = ctx.store.get();
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
      const t = uiText(lang);
      const loc = localizedSpecies(sp, lang);
      const traits = kids ? loc.keyTraits.kids : loc.keyTraits.clinician;
      const attireNote = pick(loc.attire, audience);
      const speak = readAloudButton(
        () =>
          (kids
            ? [loc.common.kids, loc.overview.kids, attireNote, ...loc.funFacts]
            : [sp.binomial, loc.overview.clinician, attireNote]
          ).join('. '),
        {
          prominent: kids,
          clipId: () => `${sp.id}-${audience}`,
          lang: () => ctx.store.get().lang,
          events: ctx.events,
        },
      );

      const stageWrap = h('div', { class: 'hero__stage' });
      const syncHero = () => {
        const imgEl =
          heroView === 'attire'
            ? reconstruction(sp, 'portrait--hero portrait--recon', `Life reconstruction of ${loc.common.kids} with skin and attire`)
            : portrait(sp, 'portrait--hero', `Close-up facial impression of ${loc.common.kids}`);
        const trigger = button(
          imgEl,
          { class: 'hero__zoom', 'aria-label': `Open full-screen skin and attire view for ${loc.common.kids}` },
          () => openLifeDialog(sp, audience),
        );
        stageWrap.replaceChildren(trigger);
      };
      syncHero();

      const switcher = segmented<'attire' | 'bust'>({
        label: 'Reconstruction view',
        className: 'seg--hero',
        options: [
          { value: 'attire', label: pick(t.skinAttireLabel, audience) },
          { value: 'bust', label: pick(t.faceBustLabel, audience) },
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
          toggle3dBtn.textContent = on ? t.hide3DSkinClothes : t.showOn3DSkeleton;
        }),
      );

      append(pane, [
        h(
          'figure',
          { class: 'hero' },
          h('div', { class: 'hero__bar' }, switcher.el, toggle3dBtn),
          stageWrap,
          h('p', { class: 'hero__attire' }, attireNote),
          h('figcaption', { class: 'hero__caption' }, t.portraitDisclaimer),
        ),
        h('div', { class: 'overview__lede' }, h('p', { class: 'lede' }, pick(loc.overview, audience)), speak),
        sectionTitle('h3', pick(t.quickFacts, audience)),
        statsTable(sp, audience, lang),
        traits.length
          ? [sectionTitle('h3', pick(t.specialTraits, audience)), h('ul', { class: 'bullets' }, traits.map((tr) => h('li', null, tr)))]
          : null,
        kids && loc.funFacts.length
          ? h('section', { class: 'funfacts' }, sectionTitle('h3', t.funFacts), h('ul', { class: 'bullets' }, loc.funFacts.map((f) => h('li', null, f))))
          : null,
        sectionTitle('h3', pick(t.dailyLifeAttire, audience)),
        lifestyle(loc, audience, lang, attireNote),
        !kids ? renderCitations(sp.citations) : null,
      ]);
    },
  };
}
