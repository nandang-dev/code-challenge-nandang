import type { Token } from './types';

export function convertAmount(
  amount: number,
  fromPrice: number,
  toPrice: number,
): number {
  if (!Number.isFinite(amount) || toPrice <= 0) return 0;
  return (amount * fromPrice) / toPrice;
}


export function parseAmountInput(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}


export function formatAmount(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0';
  const decimals = value < 1 ? 6 : value < 1000 ? 4 : 2;
  return value
    .toFixed(decimals)
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/\.$/, '');
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

export interface SwapValidation {
  valid: boolean;
  error: string | null;
}

export function validateSwap(
  amount: number | null,
  fromToken: Token | null,
  toToken: Token | null,
): SwapValidation {
  if (!fromToken || !toToken) {
    return { valid: false, error: 'Select both tokens to continue.' };
  }
  if (fromToken.symbol === toToken.symbol) {
    return { valid: false, error: 'Pick two different tokens.' };
  }
  if (amount === null) {
    return { valid: false, error: 'Enter an amount greater than 0.' };
  }
  return { valid: true, error: null };
}
