import { describe, expect, it } from 'vitest';
import {
  convertAmount,
  formatAmount,
  parseAmountInput,
  validateSwap,
} from './swap';
import type { Token } from './types';

const ETH: Token = { symbol: 'ETH', price: 1600, iconUrl: '' };
const USDC: Token = { symbol: 'USDC', price: 1, iconUrl: '' };

describe('convertAmount', () => {
  it('converts using the price ratio between two tokens', () => {
    expect(convertAmount(1, ETH.price, USDC.price)).toBe(1600);
    expect(convertAmount(1600, USDC.price, ETH.price)).toBe(1);
  });

  it('returns 0 for non-finite input or a zero destination price', () => {
    expect(convertAmount(NaN, ETH.price, USDC.price)).toBe(0);
    expect(convertAmount(1, ETH.price, 0)).toBe(0);
  });
});

describe('parseAmountInput', () => {
  it('accepts positive numeric strings', () => {
    expect(parseAmountInput('1.5')).toBe(1.5);
    expect(parseAmountInput('0.0001')).toBe(0.0001);
  });

  it('rejects empty, zero, negative, and malformed input', () => {
    expect(parseAmountInput('')).toBeNull();
    expect(parseAmountInput('   ')).toBeNull();
    expect(parseAmountInput('0')).toBeNull();
    expect(parseAmountInput('-5')).toBeNull();
    expect(parseAmountInput('1.2.3')).toBeNull();
    expect(parseAmountInput('abc')).toBeNull();
  });
});

describe('formatAmount', () => {
  it('trims trailing zeros', () => {
    expect(formatAmount(1.5)).toBe('1.5');
    expect(formatAmount(2)).toBe('2');
  });

  it('uses more precision for sub-1 values', () => {
    expect(formatAmount(0.000123456)).toBe('0.000123');
  });

  it('treats 0 and non-finite values as "0"', () => {
    expect(formatAmount(0)).toBe('0');
    expect(formatAmount(NaN)).toBe('0');
  });
});

describe('validateSwap', () => {
  it('requires both tokens to be selected', () => {
    expect(validateSwap(1, null, USDC).valid).toBe(false);
    expect(validateSwap(1, ETH, null).valid).toBe(false);
  });

  it('rejects swapping a token into itself', () => {
    const result = validateSwap(1, ETH, ETH);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/different tokens/i);
  });

  it('requires a parsed amount', () => {
    expect(validateSwap(null, ETH, USDC).valid).toBe(false);
  });

  it('passes for a valid amount and two distinct tokens', () => {
    expect(validateSwap(1, ETH, USDC)).toEqual({ valid: true, error: null });
  });
});
