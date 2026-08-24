// Problem 1: Three ways to sum to n
// sum_to_n(n) === 1 + 2 + ... + n for n >= 0
// For n < 0, the sum mirrors the positive case: sum_to_n(-5) === -(1+2+3+4+5) === -15

// a) Closed-form arithmetic series formula. O(1) time, O(1) space.
var sum_to_n_a = function (n) {
  const sign = n < 0 ? -1 : 1;
  const abs = Math.abs(n);
  return sign * ((abs * (abs + 1)) / 2);
};

// b) Iterative loop. O(n) time, O(1) space.
var sum_to_n_b = function (n) {
  const sign = n < 0 ? -1 : 1;
  const abs = Math.abs(n);
  let sum = 0;
  for (let i = 1; i <= abs; i++) {
    sum += i;
  }
  return sign * sum;
};

// c) Recursion. O(n) time, O(n) space (call stack) — will overflow the stack for very large n.
var sum_to_n_c = function (n) {
  const sign = n < 0 ? -1 : 1;
  const abs = Math.abs(n);
  const helper = (k) => (k <= 0 ? 0 : k + helper(k - 1));
  return sign * helper(abs);
};

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
