/**
 * Floating viewport studio card (`lifeReconstructionCard`): displays the photorealistic 3:4
 * life reconstruction (skin, hair/pelage & attire) alongside the 3D clothed skeleton when
 * `showFlesh` ("Skin & attire") is active, including side-by-side comparison support.
 */
import { localizedSpecies, uiText } from '../i18n';
import type { UICtx } from './context';
import { currentSpecies, watch } from './context';
import { button, h } from './dom';
import { pick } from './labels';
import { openLifeDialog, reconstruction } from './portrait';

export function lifeReconstructionCard(ctx: UICtx): HTMLElement {
  const { store } = ctx;
  let collapsed = false;

  const card = h('aside', {
    class: 'life-card',
    'aria-label': 'Photorealistic life reconstruction with skin and attire',
  });

  const render = () => {
    const s = store.get();
    card.hidden = !s.showFlesh || s.lineup;
    if (card.hidden) return;

    const sp = currentSpecies(ctx);
    if (!sp) return;
    const spB = s.compareSpeciesId ? ctx.byId.get(s.compareSpeciesId) : undefined;
    const t = uiText(s.lang);
    const loc = localizedSpecies(sp, s.lang);
    const titleText = pick(t.skinAttireLabel, s.audience);

    const toggleBtn = button(
      collapsed ? t.showPhoto : t.minimize,
      { class: 'btn btn--ghost btn--xs', 'aria-expanded': String(!collapsed) },
      () => {
        collapsed = !collapsed;
        render();
      },
    );
    const expandBtn = button(
      t.fullView,
      { class: 'btn btn--ghost btn--xs' },
      () => openLifeDialog(sp, s.audience),
    );

    const head = h(
      'div',
      { class: 'life-card__head' },
      h('span', { class: 'life-card__title' }, titleText),
      h('div', { class: 'life-card__actions' }, expandBtn, toggleBtn),
    );

    if (collapsed) {
      card.classList.add('is-collapsed');
      card.replaceChildren(head);
      return;
    }
    card.classList.remove('is-collapsed');

    const buildFig = (target: typeof sp) => {
      const tLoc = localizedSpecies(target, s.lang);
      return button(
        [
          reconstruction(
            target,
            'portrait--stage-recon',
            `Life reconstruction of ${tLoc.common.kids} with skin and attire`,
          ),
          h('span', { class: 'life-card__species' }, pick(tLoc.common, s.audience)),
        ],
        {
          class: 'life-card__fig',
          'aria-label': `Enlarge skin and attire reconstruction of ${tLoc.common.kids}`,
        },
        () => openLifeDialog(target, s.audience),
      );
    };

    const grid = h(
      'div',
      { class: spB ? 'life-card__grid is-compare' : 'life-card__grid' },
      buildFig(sp),
      spB ? buildFig(spB) : null,
    );

    const note = h('p', { class: 'life-card__note' }, pick(loc.attire, s.audience));
    const cap = h('p', { class: 'life-card__disclaimer' }, t.portraitDisclaimer);

    card.replaceChildren(head, grid, note, cap);
  };

  watch(
    store,
    (s) => `${s.showFlesh}|${s.speciesId}|${s.compareSpeciesId}|${s.audience}|${s.lineup}|${s.lang}`,
    render,
  );
  return card;
}
