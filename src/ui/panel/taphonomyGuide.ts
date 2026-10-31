/**
 * 3-state forensic osteology comparator: Antemortem (healed osteogenic reaction) vs. Perimortem
 * (fresh collagen-rich viscoelastic break / V-striae) vs. Postmortem (dry taphonomic mineral break).
 */
import type { SpeciesId } from '../../data/types';
import type { UICtx } from '../context';
import { button, h, setChildren } from '../dom';
import { segmented } from '../widgets';

type ForensicState = 'antemortem' | 'perimortem' | 'postmortem';

interface BenchmarkCase {
  label: string;
  speciesId: SpeciesId;
  specimenId: string;
  lesionId: string;
}

interface StateDoc {
  badge: string;
  kids: string;
  clinician: string;
  cases: readonly BenchmarkCase[];
}

const STATES: Record<ForensicState, StateDoc> = {
  antemortem: {
    badge: 'Living bone response',
    kids: 'Happened during life! Bone cells built smooth, rounded healing callus or closed up empty tooth sockets over weeks to years.',
    clinician:
      'Osteogenic reaction present: woven-to-lamellar callus bridging, rounded/corticated margins, secondary osteoarthritis, or complete alveolar resorption.',
    cases: [
      { label: 'Feldhofer 1 · Healed ulna', speciesId: 'homo-neanderthalensis', specimenId: 'feldhofer-1', lesionId: 'feldhofer-1-left-ulna' },
      { label: 'Dmanisi D3444 · Toothless jaw', speciesId: 'homo-erectus', specimenId: 'dmanisi-d3444', lesionId: 'd3444-edentulism' },
    ],
  },
  perimortem: {
    badge: 'Wet collagen break · zero healing',
    kids: 'Happened right around death while bone was still springy! Leaves angled "greenstick" hinges, predator tooth pits, or stone-tool cut marks with no healing.',
    clinician:
      'Viscoelastic failure in hydrated collagenous bone without osteogenic remodelling: oblique/helical/hinged margins, bevelled edges, V-shaped kerf striae, or carnivore punctures.',
    cases: [
      { label: 'Lucy (AL 288-1) · Hinge humerus', speciesId: 'australopithecus-afarensis', specimenId: 'al-288-1', lesionId: 'al-288-1-right-proximal-humerus' },
      { label: 'ATD6-69 · Stone cut marks', speciesId: 'homo-antecessor', specimenId: 'atd6-69', lesionId: 'atd6-69-cut-marks' },
      { label: 'SH Cranium 17 · Frontal blows', speciesId: 'homo-neanderthalensis', specimenId: 'sh-cranium-17', lesionId: 'sh-cranium-17-left-frontal-fractures' },
    ],
  },
  postmortem: {
    badge: 'Taphonomic burial damage',
    kids: 'Happened thousands of years later underground! Heavy cave rocks or sediment squashed dry, brittle fossil bone at chalky right-angle cracks—not an injury.',
    clinician:
      'Brittle taphonomic failure after collagen diagenesis: transverse/stepped 90° fracture planes, lighter unstained internal cortex, plastic sediment warping, or breccia crushing.',
    cases: [
      { label: 'Toumaï (TM 266) · Warped cranium', speciesId: 'sahelanthropus-tchadensis', specimenId: 'tm-266-01-060-1', lesionId: 'tm-266-01-060-1-cranial-distortion' },
      { label: 'Ardi (ARA-VP-6/500) · Crushed skull', speciesId: 'ardipithecus-ramidus', specimenId: 'ara-vp-6-500', lesionId: 'ara-vp-6-500-crushed-cranium' },
    ],
  },
};

function jumpToBenchmark(ctx: UICtx, c: BenchmarkCase): void {
  ctx.store.set({
    speciesId: c.speciesId,
    specimenId: c.specimenId,
    selectedLesionId: c.lesionId,
    selectedBoneId: null,
    healingT: 1,
    panel: 'injuries',
  });
  queueMicrotask(() => ctx.events.emit('ui:focus-lesion', { lesionId: c.lesionId }));
}

export function renderTaphonomyGuide(ctx: UICtx, kids: boolean): HTMLElement {
  let active: ForensicState = 'antemortem';
  const card = h('div', { class: 'taphonomy-guide__card' });
  const renderCard = () => {
    const doc = STATES[active];
    setChildren(
      card,
      h('p', { class: 'taphonomy-guide__badge' }, doc.badge),
      h('p', { class: 'taphonomy-guide__body' }, kids ? doc.kids : doc.clinician),
      h(
        'div',
        { class: 'chips' },
        doc.cases.map((c) => button(c.label, { class: 'chip' }, () => jumpToBenchmark(ctx, c))),
      ),
    );
  };
  const seg = segmented<ForensicState>({
    label: kids ? 'Bone clue timing' : 'Forensic timing class',
    options: [
      { value: 'antemortem', label: kids ? 'Healed' : 'Antemortem' },
      { value: 'perimortem', label: kids ? 'Around death' : 'Perimortem' },
      { value: 'postmortem', label: kids ? 'Fossil crack' : 'Postmortem' },
    ],
    value: active,
    onChange(next) {
      active = next;
      seg.update(next);
      renderCard();
    },
  });
  renderCard();
  return h(
    'details',
    { class: 'taphonomy-guide', open: !kids },
    h(
      'summary',
      { class: 'taphonomy-guide__summary' },
      kids ? 'Bone clue guide: Injury vs. fossil crack' : 'Forensic differential: Antemortem · Perimortem · Postmortem',
    ),
    h('div', { class: 'taphonomy-guide__inner' }, seg.el, card),
  );
}
