
export function sum_to_n_a(n: number): number {
  const sign = n < 0 ? -1 : 1;
  const abs = Math.abs(n);
  return sign * ((abs * (abs + 1)) / 2);
}


export function sum_to_n_b(n: number): number {
  const sign = n < 0 ? -1 : 1;
  const abs = Math.abs(n);
  let sum = 0;
  for (let i = 1; i <= abs; i++) {
    sum += i;
  }
  return sign * sum;
}


export function sum_to_n_c(n: number): number {
  const sign = n < 0 ? -1 : 1;
  const abs = Math.abs(n);
  const helper = (k: number): number => (k <= 0 ? 0 : k + helper(k - 1));
  return sign * helper(abs);
}
