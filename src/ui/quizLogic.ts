/**
 * Pure quiz logic: audience filtering, round selection, scoring and badges.
 * Unit-tested in tests/ui.quiz.test.ts.
 */
import type { Audience, DualText, QuizQuestion } from '../data/types';

export const ROUND_SIZE = 8;

/** Well-formed questions for this audience ('both' is always included). */
export function questionsFor(quiz: readonly QuizQuestion[], audience: Audience): QuizQuestion[] {
  return quiz.filter(
    (q) =>
      (q.audience === audience || q.audience === 'both') &&
      q.answers.length >= 2 &&
      Number.isInteger(q.correctIndex) &&
      q.correctIndex >= 0 &&
      q.correctIndex < q.answers.length &&
      q.prompt.trim() !== '',
  );
}

/** Fisher–Yates shuffle (non-mutating). `rand` is injectable for deterministic tests. */
export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickRound(
  quiz: readonly QuizQuestion[],
  audience: Audience,
  size = ROUND_SIZE,
  rand: () => number = Math.random,
): QuizQuestion[] {
  return shuffle(questionsFor(quiz, audience), rand).slice(0, Math.max(0, size));
}

export const BADGES: Record<string, DualText> = {
  'quiz-first': { kids: 'First quiz finished', clinician: 'Completed a quiz round' },
  'quiz-5': { kids: '5 right answers in one go', clinician: '5+ correct in one round' },
  'quiz-perfect': { kids: 'Perfect score!', clinician: 'Perfect round' },
};

export function badgeLabel(id: string, audience: Audience): string {
  const b = BADGES[id];
  return b ? (audience === 'kids' ? b.kids : b.clinician) : id;
}

/** Badge ids newly earned by finishing a round with `score` of `total` (never duplicates). */
export function earnedBadges(score: number, total: number, existing: readonly string[]): string[] {
  if (total <= 0) return [];
  const have = new Set(existing);
  const out: string[] = [];
  const add = (id: string) => {
    if (!have.has(id)) {
      have.add(id);
      out.push(id);
    }
  };
  add('quiz-first');
  if (score >= 5) add('quiz-5');
  if (score === total && total >= 3) add('quiz-perfect');
  return out;
}

/** Best score to persist (store.quizBest is validated to 0..1000). */
export function nextBest(prevBest: number, score: number): number {
  const p = Number.isFinite(prevBest) ? prevBest : 0;
  return Math.min(1000, Math.max(p, Math.max(0, Math.floor(score))));
}

export function resultMessage(score: number, total: number, audience: Audience): string {
  if (total === 0) return '';
  const ratio = score / total;
  if (audience === 'kids') {
    if (ratio === 1) return 'Wow, every answer right! You think like a scientist.';
    if (ratio >= 0.6) return 'Great job! You know a lot about our ancient family.';
    return 'Nice try! Every scientist learns by making mistakes. Try again?';
  }
  if (ratio === 1) return 'Perfect round.';
  if (ratio >= 0.6) return 'Solid round. Review the explanations for the ones you missed.';
  return 'Review the explanations and try another round.';
}
