/**
 * Injuries tab: lesions of the displayed specimen grouped by kind; selecting one sets
 * store.selectedLesionId and asks the viewer to frame it. Shows the detail view when selected.
 */
import { LESION_KIND_LABEL, type Lesion, type Species, type Specimen } from '../../data/types';
import { boneName } from '../../anatomy/bones';
import { getSpecimen } from '../../data';
import type { UICtx } from '../context';
import { currentSpecies } from '../context';
import { button, h } from '../dom';
import { groupLesions } from '../filters';
import { pick } from '../labels';
import { emptyState, evidenceBadge, sectionTitle } from '../widgets';
import { selectLesion, selectSpecimen } from '../actions';
import { renderLesionDetail } from './lesionDetail';
import type { TabView } from './index';

function specimenLabel(sp: Specimen, kids: boolean): string {
  const name = sp.nickname ?? (kids ? `Fossil from ${sp.site.name}` : sp.catalog);
  return kids ? name : sp.nickname ? `${sp.nickname} (${sp.catalog})` : sp.catalog;
}

/** When a lesion from another specimen of this species is selected, display that specimen. */
function followLesionSpecimen(ctx: UICtx): void {
  ctx.store.select((s) => s.selectedLesionId, (id) => {
    const sp = currentSpecies(ctx);
    if (!id || !sp) return;
    const shown = getSpecimen(sp, ctx.store.get().specimenId);
    if (shown?.lesions.some((l) => l.id === id)) return;
    const owner = sp.specimens.find((x) => x.lesions.some((l) => l.id === id));
    if (owner) ctx.store.set({ specimenId: owner.id });
  });
}

function otherSpecimens(ctx: UICtx, sp: Species, shown: Specimen | undefined, kids: boolean): HTMLElement | null {
  const others = sp.specimens.filter((x) => x !== shown && x.lesions.length > 0);
  if (others.length === 0) return null;
  return h(
    'div',
    { class: 'others' },
    h('p', { class: 'muted' }, kids ? 'Other fossils of this kind with injuries:' : 'Other specimens with recorded pathology:'),
    h(
      'div',
      { class: 'chips' },
      others.map((o) =>
        button([specimenLabel(o, kids), h('span', { class: 'count num' }, String(o.lesions.length))], { class: 'chip' }, () =>
          selectSpecimen(ctx, o.id),
        ),
      ),
    ),
  );
}

export function createInjuriesTab(ctx: UICtx): TabView {
  followLesionSpecimen(ctx);
  return {
    key: (s) => `${s.speciesId}|${s.specimenId}|${s.audience}|${s.selectedLesionId}`,
    render(pane, scope) {
      const s = ctx.store.get();
      const kids = s.audience === 'kids';
      const sp = currentSpecies(ctx);
      if (!sp) {
        pane.appendChild(emptyState('No species selected', 'Pick a species to see injuries and diseases on its bones.'));
        return;
      }
      const spec = getSpecimen(sp, s.specimenId);
      if (!spec) {
        pane.appendChild(emptyState(kids ? 'No fossils yet' : 'No specimens recorded', 'Fossil records for this species are still being added.'));
        return;
      }
      const lesions = groupLesions(spec.lesions).flatMap((g) => g.lesions);
      const selected = lesions.find((l) => l.id === s.selectedLesionId);
      if (selected) {
        const index = lesions.indexOf(selected);
        const detail = renderLesionDetail(selected, ctx, scope, s.audience, {
          index,
          total: lesions.length,
          go: (d) => selectLesion(ctx, lesions[(index + d + lesions.length) % lesions.length].id),
          back: () => {
            selectLesion(ctx, null);
            queueMicrotask(() => pane.querySelector<HTMLElement>(`[data-lesion="${CSS.escape(selected.id)}"]`)?.focus());
          },
        });
        pane.appendChild(detail);
        return;
      }

      pane.appendChild(
        h(
          'p',
          { class: 'context' },
          kids ? 'On ' : 'Specimen: ',
          h('strong', null, specimenLabel(spec, kids)),
          ` — ${spec.site.name}, ${spec.site.country}`,
        ),
      );
      if (lesions.length === 0) {
        pane.appendChild(
          emptyState(
            kids ? 'No injuries found on this fossil' : 'No pathology recorded',
            kids ? 'Its bones show no signs of breaks or illness that scientists have written about.' : 'No lesions are documented for this specimen in the atlas.',
            'check',
          ),
        );
      } else {
        pane.appendChild(
          h('p', { class: 'muted' }, kids ? 'Tap a glowing marker on the skeleton, or pick one here.' : 'Select a finding to frame it in the viewer.'),
        );
        for (const g of groupLesions(spec.lesions)) {
          pane.appendChild(
            h(
              'section',
              { class: 'lesion-group' },
              sectionTitle('h3', pick(LESION_KIND_LABEL[g.kind], s.audience), g.lesions.length),
              h('ul', { class: 'lesion-list', role: 'list' }, g.lesions.map((l) => h('li', null, lesionItem(ctx, l, kids)))),
            ),
          );
        }
      }
      const others = otherSpecimens(ctx, sp, spec, kids);
      if (others) pane.appendChild(others);
    },
  };
}

function lesionItem(ctx: UICtx, l: Lesion, kids: boolean): HTMLButtonElement {
  const bone = boneName(l.bone);
  return button(
    [
      h('span', { class: 'lesion-item__title' }, kids ? l.title.kids : l.title.clinician),
      h('span', { class: 'lesion-item__bone' }, kids ? bone.kids : bone.clinician),
      evidenceBadge(l.evidence, kids ? 'kids' : 'clinician'),
    ],
    { class: 'lesion-item', 'data-lesion': l.id },
    () => {
      selectLesion(ctx, l.id);
      queueMicrotask(() => document.getElementById(`lesion-title-${l.id}`)?.focus());
    },
  );
}
