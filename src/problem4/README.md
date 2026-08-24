# Problem 4: Three Ways to Sum to N (TypeScript)

## Summary

TypeScript version of the same brief as [Problem 1](../problem1/README.md):
implement `sum_to_n(n)` three different ways and comment on each
implementation's complexity/efficiency. The only functional difference
from Problem 1 is the language (typed TypeScript signatures here vs.
plain JavaScript there) and that a code comment on complexity is an
explicit requirement rather than something added for good measure.

As in Problem 1, `n` can be any integer, and the task doesn't define
behavior for negative `n` — this solution mirrors the positive case
(`sum_to_n(-5) === -15`), applied consistently across all three
implementations (see [index.ts](index.ts) for the reasoning).

## Approach

### `sum_to_n_a` — Closed-form formula

`n * (n + 1) / 2`. **O(1) time, O(1) space** — independent of `n`.

### `sum_to_n_b` — Iterative loop

Accumulates with a `for` loop from `1` to `n`. **O(n) time, O(1) space**
— the standard, safe-for-any-size approach, just slower than the formula
for large `n`.

### `sum_to_n_c` — Recursion

`k + helper(k - 1)` down to the base case. **O(n) time, O(n) space**
(call stack) — will throw `RangeError: Maximum call stack size
exceeded` for large enough `n` (engine-dependent, typically tens of
thousands), which the other two never will.

Full comments are inline in [index.ts](index.ts) next to each function.

## How to Test

```bash
cd src/problem4
npm install
npm run typecheck   # tsc --noEmit, strict mode
npm test            # vitest run
```

Unlike Problem 1 (verified with a one-off `node -e` script), this is a
real automated suite — 22 cases in [index.test.ts](index.test.ts):
each implementation checked individually against the task's example,
zero, the smallest positive/negative cases, the negative-mirroring
assumption, and a larger input; plus one parametrized check that all
three implementations agree with each other across the same inputs.
