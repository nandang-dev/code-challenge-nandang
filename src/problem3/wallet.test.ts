import { describe, expect, it } from 'vitest';
import { buildWalletRows, getPriority } from './wallet';
import type { WalletBalance } from './wallet';

describe('getPriority', () => {
  it('returns the mapped priority for known blockchains', () => {
    expect(getPriority('Osmosis')).toBe(100);
    expect(getPriority('Ethereum')).toBe(50);
  });

  it('treats different known chains with equal priority as equal', () => {
    expect(getPriority('Zilliqa')).toBe(getPriority('Neo'));
  });

  it('returns the unknown sentinel for an unrecognized chain', () => {
    expect(getPriority('SomeRandomChain')).toBe(-99);
  });
});

describe('buildWalletRows', () => {
  const prices = { ETH: 1600, OSMO: 0.5 };

  it('drops zero and negative balances (fixes the original inverted filter)', () => {
    const balances: WalletBalance[] = [
      { currency: 'ETH', amount: 0, blockchain: 'Ethereum' },
      { currency: 'ETH', amount: -1, blockchain: 'Ethereum' },
      { currency: 'ETH', amount: 2, blockchain: 'Ethereum' },
    ];
    const rows = buildWalletRows(balances, prices);
    expect(rows).toHaveLength(1);
    expect(rows[0].amount).toBe(2);
  });

  it('drops balances on unrecognized blockchains', () => {
    const balances: WalletBalance[] = [
      { currency: 'ETH', amount: 1, blockchain: 'Ethereum' },
      { currency: 'XYZ', amount: 1, blockchain: 'TotallyMadeUpChain' },
    ];
    const rows = buildWalletRows(balances, prices);
    expect(rows.map((r) => r.currency)).toEqual(['ETH']);
  });

  it('sorts by blockchain priority, highest first', () => {
    const balances: WalletBalance[] = [
      { currency: 'ETH', amount: 1, blockchain: 'Ethereum' }, // 50
      { currency: 'OSMO', amount: 1, blockchain: 'Osmosis' }, // 100
    ];
    const rows = buildWalletRows(balances, prices);
    expect(rows.map((r) => r.currency)).toEqual(['OSMO', 'ETH']);
  });

  it('computes usdValue from the price map', () => {
    const balances: WalletBalance[] = [
      { currency: 'ETH', amount: 2, blockchain: 'Ethereum' },
    ];
    const [row] = buildWalletRows(balances, prices);
    expect(row.usdValue).toBe(3200);
  });

  it('falls back to 0 instead of NaN when a price is missing', () => {
    const balances: WalletBalance[] = [
      { currency: 'NOPRICE', amount: 5, blockchain: 'Ethereum' },
    ];
    const [row] = buildWalletRows(balances, prices);
    expect(row.usdValue).toBe(0);
    expect(Number.isNaN(row.usdValue)).toBe(false);
  });

  it('formats the amount with 2 decimal places', () => {
    const balances: WalletBalance[] = [
      { currency: 'ETH', amount: 1.5, blockchain: 'Ethereum' },
    ];
    const [row] = buildWalletRows(balances, prices);
    expect(row.formatted).toBe('1.50');
  });
});
