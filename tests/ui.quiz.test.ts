import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../src/data/types';
import { badgeLabel, earnedBadges, nextBest, pickRound, questionsFor, resultMessage, shuffle } from '../src/ui/quizLogic';

const q = (id: string, audience: QuizQuestion['audience'], answers = ['a', 'b', 'c'], correctIndex = 0): QuizQuestion => ({
  id,
  audience,
  prompt: `Question ${id}?`,
  answers,
  correctIndex,
  explanation: 'Because.',
  speciesId: null,
});

/** Deterministic PRNG (mulberry32) for repeatable shuffles. */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const QUIZ = [q('k1', 'kids'), q('c1', 'clinician'), q('b1', 'both'), q('b2', 'both'), q('bad1', 'kids', ['only one']), q('bad2', 'both', ['a', 'b'], 5)];

describe('questionsFor', () => {
  it('includes the audience’s questions plus "both"', () => {
    expect(questionsFor(QUIZ, 'kids').map((x) => x.id)).toEqual(['k1', 'b1', 'b2']);
    expect(questionsFor(QUIZ, 'clinician').map((x) => x.id)).toEqual(['c1', 'b1', 'b2']);
  });

  it('drops malformed questions and handles an empty bank', () => {
    expect(questionsFor(QUIZ, 'kids').some((x) => x.id.startsWith('bad'))).toBe(false);
    expect(questionsFor([], 'kids')).toEqual([]);
  });
});

describe('shuffle / pickRound', () => {
  it('is a non-mutating permutation', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const out = shuffle(input, seeded(42));
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...out].sort()).toEqual(input);
  });

  it('is repeatable with the same seed', () => {
    expect(shuffle([1, 2, 3, 4, 5], seeded(7))).toEqual(shuffle([1, 2, 3, 4, 5], seeded(7)));
  });

  it('limits the round size', () => {
    expect(pickRound(QUIZ, 'kids', 2, seeded(1))).toHaveLength(2);
    expect(pickRound(QUIZ, 'kids', 50, seeded(1))).toHaveLength(3);
    expect(pickRound([], 'clinician')).toEqual([]);
  });
});

describe('badges and best score', () => {
  it('awards the first-round badge once', () => {
    expect(earnedBadges(1, 4, [])).toEqual(['quiz-first']);
    expect(earnedBadges(1, 4, ['quiz-first'])).toEqual([]);
  });

  it('awards 5-correct and perfect badges', () => {
    expect(earnedBadges(5, 8, ['quiz-first'])).toEqual(['quiz-5']);
    expect(earnedBadges(3, 3, [])).toEqual(['quiz-first', 'quiz-perfect']);
    expect(earnedBadges(2, 2, [])).toEqual(['quiz-first']);
    expect(earnedBadges(8, 8, ['quiz-first', 'quiz-5', 'quiz-perfect'])).toEqual([]);
  });

  it('awards nothing for an empty round', () => {
    expect(earnedBadges(0, 0, [])).toEqual([]);
  });

  it('keeps the best score within the persisted bounds', () => {
    expect(nextBest(3, 5)).toBe(5);
    expect(nextBest(6, 2)).toBe(6);
    expect(nextBest(Number.NaN, 4)).toBe(4);
    expect(nextBest(999, 5000)).toBe(1000);
    expect(nextBest(0, 2.7)).toBe(2);
  });

  it('labels badges by audience and passes unknown ids through', () => {
    expect(badgeLabel('quiz-perfect', 'kids')).toBe('Perfect score!');
    expect(badgeLabel('quiz-5', 'clinician')).toBe('5+ correct in one round');
    expect(badgeLabel('mystery', 'kids')).toBe('mystery');
  });

  it('gives an encouraging result message', () => {
    expect(resultMessage(3, 3, 'kids')).toMatch(/every answer right/i);
    expect(resultMessage(1, 4, 'kids')).toMatch(/try again/i);
    expect(resultMessage(0, 0, 'clinician')).toBe('');
  });
});
