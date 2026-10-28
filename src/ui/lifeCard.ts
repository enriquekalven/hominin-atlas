/**
 * Floating viewport studio card (`lifeReconstructionCard`): displays the photorealistic 3:4
 * life reconstruction (skin, hair/pelage & attire) alongside the 3D clothed skeleton when
 * `showFlesh` ("Skin & attire") is active, including side-by-side comparison support.
 */
import type { UICtx } from './context';
import { currentSpecies, watch } from './context';
import { button, h } from './dom';
import { PORTRAIT_CAPTION, pick } from './labels';
import { ATTIRE_SUMMARY, openLifeDialog, reconstruction } from './portrait';

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
    const titleText = s.audience === 'kids' ? 'Skin & clothes' : 'Life reconstruction';

    const toggleBtn = button(
      collapsed ? 'Show photo' : 'Minimize',
      { class: 'btn btn--ghost btn--xs', 'aria-expanded': String(!collapsed) },
      () => {
        collapsed = !collapsed;
        render();
      },
    );
    const expandBtn = button(
      'Full view',
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
      const fig = button(
        [
          reconstruction(
            target,
            'portrait--stage-recon',
            `Life reconstruction of ${target.common.kids} with skin and attire`,
          ),
          h('span', { class: 'life-card__species' }, pick(target.common, s.audience)),
        ],
        {
          class: 'life-card__fig',
          'aria-label': `Enlarge skin and attire reconstruction of ${target.common.kids}`,
        },
        () => openLifeDialog(target, s.audience),
      );
      return fig;
    };

    const grid = h(
      'div',
      { class: spB ? 'life-card__grid is-compare' : 'life-card__grid' },
      buildFig(sp),
      spB ? buildFig(spB) : null,
    );

    const note = h('p', { class: 'life-card__note' }, pick(ATTIRE_SUMMARY[sp.id], s.audience));
    const cap = h('p', { class: 'life-card__disclaimer' }, PORTRAIT_CAPTION);

    card.replaceChildren(head, grid, note, cap);
  };

  watch(
    store,
    (s) => `${s.showFlesh}|${s.speciesId}|${s.compareSpeciesId}|${s.audience}|${s.lineup}`,
    render,
  );
  return card;
}
