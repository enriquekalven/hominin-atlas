/**
 * Lesion detail: kids summary with read-aloud, or the clinician block (morphology, differential,
 * modern analogue, functional impact, survival interval, timing, healing, debate, sources).
 */
import { LESION_KIND_LABEL, type Audience, type Lesion } from '../../data/types';
import { boneName } from '../../anatomy/bones';
import type { UICtx } from '../context';
import { button, h, type Scope } from '../dom';
import { icon } from '../icons';
import { DASH } from '../format';
import { HEALING_LABEL, TIMING_LABEL, pick } from '../labels';
import { showsHealingTimeline } from '../filters';
import { readAloudButton } from '../speech';
import { evidenceBadge } from '../widgets';
import { renderCitations } from './citations';
import { healingTimeline } from './healing';

export interface LesionNav {
  index: number;
  total: number;
  go(delta: number): void;
  back(): void;
}

function clinicalFacts(l: Lesion): HTMLElement {
  const row = (label: string, value: string | HTMLElement | null) => [h('dt', null, label), h('dd', null, value ?? DASH)];
  const diff = l.clinical.differential.length
    ? h('ol', { class: 'differential' }, l.clinical.differential.map((d) => h('li', null, d)))
    : null;
  return h(
    'dl',
    { class: 'facts facts--clinical' },
    row('Morphology', l.clinical.morphology || null),
    row('Differential diagnosis', diff),
    row('Modern analogue', l.clinical.modernAnalogue),
    row('Functional impact', l.clinical.functionalImpact),
    row('Survival interval', l.clinical.survivalInterval),
    row('Timing', TIMING_LABEL[l.timing]),
    row('Healing', l.healing ? HEALING_LABEL[l.healing] : null),
  );
}

export function renderLesionDetail(
  l: Lesion,
  ctx: UICtx,
  scope: Scope,
  audience: Audience,
  nav: LesionNav,
): HTMLElement {
  const kids = audience === 'kids';
  const bone = boneName(l.bone);
  const title = pick(l.title, audience);
  const navBar = h(
    'div',
    { class: 'lesion__nav' },
    button([icon('chevronLeft'), h('span', { class: 'btn__label' }, kids ? 'All injuries' : 'All findings')], { class: 'btn btn--quiet' }, () =>
      nav.back(),
    ),
    nav.total > 1
      ? h(
          'div',
          { class: 'lesion__pager' },
          button(icon('chevronLeft'), { class: 'btn btn--icon', 'aria-label': 'Previous finding' }, () => nav.go(-1)),
          h('span', { class: 'num pager__count' }, `${nav.index + 1} of ${nav.total}`),
          button(icon('chevronRight'), { class: 'btn btn--icon', 'aria-label': 'Next finding' }, () => nav.go(1)),
        )
      : null,
  );
  const speak = readAloudButton(() => `${title}. ${l.summary.kids}`, { prominent: kids });
  const body: (HTMLElement | null)[] = kids
    ? [h('p', { class: 'lede' }, l.summary.kids), speak]
    : [
        h('p', { class: 'lede' }, l.summary.clinician),
        clinicalFacts(l),
        l.evidence === 'debated' || l.debateNote
          ? h(
              'aside',
              { class: 'callout callout--debate' },
              h('p', { class: 'callout__title' }, icon('debated'), 'Why this is debated'),
              h('p', null, l.debateNote ?? 'The interpretation of this lesion is contested in the literature.'),
            )
          : null,
        renderCitations(l.citations),
        speak,
      ];
  return h(
    'article',
    { class: 'lesion', 'aria-labelledby': `lesion-title-${l.id}` },
    navBar,
    h('p', { class: 'eyebrow' }, pick(LESION_KIND_LABEL[l.kind], audience), h('span', { class: 'sep', 'aria-hidden': 'true' }, '·'), kids ? bone.kids : bone.clinician),
    h('h3', { id: `lesion-title-${l.id}`, class: 'lesion__title', tabindex: '-1' }, title),
    h('div', { class: 'badges' }, evidenceBadge(l.evidence, audience)),
    body,
    showsHealingTimeline(l) ? healingTimeline(ctx, scope, audience) : null,
  );
}
