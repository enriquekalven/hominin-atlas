/**
 * Quiz dialog (store.quizOpen): one question at a time as a native radio group, feedback with
 * explanation, score, best score (store.quizBest) and badges (store.badges).
 */
import type { Audience, QuizQuestion } from '../data/types';
import { QUIZ } from '../data';
import type { UICtx } from './context';
import { button, h, setChildren, uid } from './dom';
import { openDialog, type DialogHandle } from './dialogs';
import { icon } from './icons';
import { badgeLabel, earnedBadges, nextBest, pickRound, resultMessage } from './quizLogic';
import { emptyState } from './widgets';

function badgeList(ids: readonly string[], audience: Audience): HTMLElement | null {
  if (ids.length === 0) return null;
  return h('ul', { class: 'badges-list' }, ids.map((id) => h('li', { class: 'quiz-badge' }, icon('established'), badgeLabel(id, audience))));
}

function runQuiz(ctx: UICtx, body: HTMLElement, handle: DialogHandle): void {
  const audience = ctx.store.get().audience;
  const kids = audience === 'kids';
  const round = pickRound(QUIZ, audience);
  let index = 0;
  let score = 0;

  const finish = () => {
    const s = ctx.store.get();
    const fresh = earnedBadges(score, round.length, s.badges);
    ctx.store.set({ quizBest: nextBest(s.quizBest, score), badges: fresh.length ? [...s.badges, ...fresh] : s.badges });
    const again = button(kids ? 'Play again' : 'New round', { class: 'btn btn--primary' }, () => runQuiz(ctx, body, handle));
    setChildren(
      body,
      h('div', { class: 'quiz-result', role: 'status' },
        h('p', { class: 'quiz-score num' }, `${score} / ${round.length}`),
        h('p', { class: 'lede' }, resultMessage(score, round.length, audience)),
        h('p', { class: 'muted num' }, `${kids ? 'Your best score' : 'Best'}: ${ctx.store.get().quizBest}`),
      ),
      fresh.length ? h('h3', { class: 'section-title' }, kids ? 'New badges!' : 'Badges earned') : null,
      badgeList(fresh, audience),
      h('div', { class: 'actions' }, again, button('Close', { class: 'btn' }, () => handle.close())),
    );
    again.focus();
  };

  const show = (q: QuizQuestion) => {
    const name = uid('quiz-q');
    const legendId = uid('quiz-legend');
    const feedback = h('div', { class: 'quiz-feedback', role: 'status' });
    const options = q.answers.map((a, i) => {
      const id = `${name}-${i}`;
      return h('div', { class: 'quiz-option' },
        h('input', { type: 'radio', name, id, value: String(i) }),
        h('label', { for: id }, a),
      );
    });
    const check = button(kids ? 'Check my answer' : 'Check', { class: 'btn btn--primary', type: 'submit' });
    const form = h('form', { class: 'quiz-form', novalidate: true },
      h('p', { class: 'quiz-progress num' }, `Question ${index + 1} of ${round.length}`, h('span', { class: 'quiz-running num' }, ` · Score ${score}`)),
      h('fieldset', { class: 'quiz-fieldset' },
        h('legend', { id: legendId, class: 'quiz-prompt' }, q.prompt),
        h('div', { class: 'quiz-options' }, options),
      ),
      feedback,
      h('div', { class: 'actions' }, check),
    );
    let answered = false;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (answered) return;
      const chosen = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
      if (!chosen) {
        feedback.replaceChildren(h('p', null, kids ? 'Pick an answer first!' : 'Select an answer.'));
        return;
      }
      answered = true;
      const right = Number(chosen.value) === q.correctIndex;
      if (right) score += 1;
      form.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((r) => {
        r.disabled = true;
        const opt = r.closest('.quiz-option');
        if (Number(r.value) === q.correctIndex) opt?.classList.add('is-correct');
        else if (r === chosen) opt?.classList.add('is-wrong');
      });
      feedback.className = `quiz-feedback ${right ? 'is-right' : 'is-wrong'}`;
      feedback.replaceChildren(
        h('p', { class: 'quiz-verdict' }, icon(right ? 'check' : 'info'), right ? (kids ? 'Yes, that’s right!' : 'Correct.') : kids ? 'Not quite.' : 'Incorrect.'),
        h('p', null, q.explanation),
      );
      const last = index === round.length - 1;
      const next = button(last ? (kids ? 'See my score' : 'Finish') : kids ? 'Next question' : 'Next', { class: 'btn btn--primary' }, () => {
        index += 1;
        if (last) finish();
        else show(round[index]);
      });
      check.replaceWith(next);
      next.focus();
    });
    body.replaceChildren(form);
    form.querySelector<HTMLInputElement>('input[type="radio"]')?.focus();
  };

  if (round.length === 0) {
    body.replaceChildren(
      emptyState(kids ? 'The quiz is coming soon!' : 'No quiz questions yet', kids ? 'Scientists are still writing the questions.' : 'Questions are still being curated.'),
      h('div', { class: 'actions' }, button('Close', { class: 'btn' }, () => handle.close())),
    );
    return;
  }
  show(round[0]);
}

/** Open / close the quiz dialog in response to store.quizOpen. */
export function mountQuiz(ctx: UICtx): void {
  let handle: DialogHandle | null = null;
  ctx.store.select((s) => s.quizOpen, (open) => {
    if (open && !handle) {
      const s = ctx.store.get();
      handle = openDialog({
        title: s.audience === 'kids' ? 'Fossil quiz' : 'Knowledge check',
        className: 'dialog--quiz',
        description: s.badges.length ? `Badges so far: ${s.badges.map((b) => badgeLabel(b, s.audience)).join(', ')}` : undefined,
        build: (body, hd) => runQuiz(ctx, body, hd),
        onClose: () => {
          handle = null;
          ctx.store.set({ quizOpen: false });
        },
      });
    } else if (!open && handle) {
      handle.close();
    }
  });
}
