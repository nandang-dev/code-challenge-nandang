import { describe, expect, it } from 'vitest';
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './index';

const implementations: Array<[string, (n: number) => number]> = [
  ['sum_to_n_a (formula)', sum_to_n_a],
  ['sum_to_n_b (loop)', sum_to_n_b],
  ['sum_to_n_c (recursion)', sum_to_n_c],
];

describe.each(implementations)('%s', (_name, fn) => {
  it('matches the example from the task: sum_to_n(5) === 15', () => {
    expect(fn(5)).toBe(15);
  });

  it('returns 0 for n = 0 (empty sum)', () => {
    expect(fn(0)).toBe(0);
  });

  it('returns n itself for the smallest positive/negative cases', () => {
    expect(fn(1)).toBe(1);
    expect(fn(-1)).toBe(-1);
  });

  it('mirrors the positive sum for negative n', () => {
    expect(fn(-5)).toBe(-15);
  });

  it('handles a larger input correctly', () => {
    expect(fn(100)).toBe(5050);
  });
});

describe('all three implementations agree', () => {
  it.each([5, 0, 1, -1, -5, 100, 1000])('for n = %i', (n) => {
    const results = [sum_to_n_a(n), sum_to_n_b(n), sum_to_n_c(n)];
    expect(new Set(results).size).toBe(1);
  });
});
