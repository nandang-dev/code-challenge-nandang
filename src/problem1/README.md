# Problem 1: Three Ways to Sum to N

## Summary

The task is to implement a function `sum_to_n(n)` that returns the summation
of all integers from `1` to `n`, e.g. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

`n` can be any integer, and the result is guaranteed to stay below
`Number.MAX_SAFE_INTEGER`. The challenge does not define a behavior for
negative `n`, so this solution defines it explicitly: the result mirrors the
positive case, e.g. `sum_to_n(-5) === -15`. This keeps all three
implementations consistent and avoids `NaN`/undefined behavior on negative
input.

Three implementations are provided in [index.js](index.js), each using a
genuinely different technique rather than cosmetic variations of the same
loop.

## Approach

### `sum_to_n_a` — Closed-form formula

Uses the arithmetic series formula `n * (n + 1) / 2`.

- **Time**: O(1)
- **Space**: O(1)
- **Trade-off**: fastest and most memory-efficient, but only works because
  the sum has a known closed form. Not every accumulation problem has one.

### `sum_to_n_b` — Iterative loop

Accumulates the sum with a `for` loop from `1` to `n`.

- **Time**: O(n)
- **Space**: O(1)
- **Trade-off**: the "textbook" approach — simple and safe for any input
  size, but slower than the formula for large `n`.

### `sum_to_n_c` — Recursion

Recursively adds `k + helper(k - 1)` down to the base case.

- **Time**: O(n)
- **Space**: O(n) (call stack)
- **Trade-off**: demonstrates a recursive technique, but will throw
  `RangeError: Maximum call stack size exceeded` for very large `n` (in
  practice, tens of thousands, depending on the JS engine). Not recommended
  in production for unbounded input.

All three implementations handle negative `n` the same way: they operate on
`Math.abs(n)` and re-apply the sign at the end, so `a`, `b`, and `c` always
agree on the same input.

## How to Test

There is no automated test suite in this repository (no Jest/Mocha
configured). Verification is done manually with Node.js.

1. From the repository root, run:

   ```bash
   node -e "
   const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require('./src/problem1/index.js');
   const cases = [5, 0, 1, -1, -5, 100];
   for (const n of cases) {
     console.log(n, sum_to_n_a(n), sum_to_n_b(n), sum_to_n_c(n));
   }
   "
   ```

2. Check that all three columns (`a`, `b`, `c`) match for every input, and
   that they match the expected values below:

   | `n`  | Expected  | Reason for the case                          |
   |------|-----------|-----------------------------------------------|
   | `5`  | `15`      | Example given in the task                     |
   | `0`  | `0`       | Edge case: empty summation                    |
   | `1`  | `1`       | Smallest positive edge case                   |
   | `-1` | `-1`      | Smallest negative edge case                   |
   | `-5` | `-15`     | Confirms negative-input symmetry              |
   | `100`| `5050`    | Larger input, rules out off-by-one errors     |

If any column disagrees with another, or with the expected value, one of the
implementations has a bug.
