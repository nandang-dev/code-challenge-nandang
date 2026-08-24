import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildTokenList, fetchTokens, iconUrlFor } from './prices';

describe('iconUrlFor', () => {
  it('builds the raw GitHub URL for a token symbol', () => {
    expect(iconUrlFor('ETH')).toBe(
      'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ETH.svg',
    );
  });
});

describe('buildTokenList', () => {
  it('keeps the last occurrence when a currency appears more than once', () => {
    const tokens = buildTokenList([
      { currency: 'BUSD', date: '2023-01-01T00:00:00.000Z', price: 0.5 },
      { currency: 'BUSD', date: '2023-01-01T00:00:00.000Z', price: 0.99 },
    ]);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].price).toBe(0.99);
  });

  it('drops entries with a zero, negative, or non-finite price', () => {
    const tokens = buildTokenList([
      { currency: 'ZERO', date: '', price: 0 },
      { currency: 'NEG', date: '', price: -1 },
      { currency: 'NAN', date: '', price: NaN },
      { currency: 'OK', date: '', price: 1 },
    ]);
    expect(tokens.map((t) => t.symbol)).toEqual(['OK']);
  });

  it('attaches an icon URL and sorts alphabetically by symbol', () => {
    const tokens = buildTokenList([
      { currency: 'ZIL', date: '', price: 1 },
      { currency: 'ATOM', date: '', price: 1 },
    ]);
    expect(tokens.map((t) => t.symbol)).toEqual(['ATOM', 'ZIL']);
    expect(tokens[0].iconUrl).toBe(iconUrlFor('ATOM'));
  });
});

describe('fetchTokens', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses a successful response into a token list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ currency: 'ETH', date: '', price: 1600 }],
      }),
    );
    const tokens = await fetchTokens();
    expect(tokens).toEqual([
      { symbol: 'ETH', price: 1600, iconUrl: iconUrlFor('ETH') },
    ]);
  });

  it('throws a readable error when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );
    await expect(fetchTokens()).rejects.toThrow(/503/);
  });
});
