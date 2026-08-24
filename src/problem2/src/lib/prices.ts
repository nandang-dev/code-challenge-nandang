import type { Token } from './types';

export const PRICES_URL = 'https://interview.switcheo.com/prices.json';
export const ICON_BASE_URL =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

interface RawPriceEntry {
  currency: string;
  date: string;
  price: number;
}

export function iconUrlFor(symbol: string): string {
  return `${ICON_BASE_URL}/${symbol}.svg`;
}

export function buildTokenList(entries: RawPriceEntry[]): Token[] {
  const byCurrency = new Map<string, RawPriceEntry>();
  for (const entry of entries) {
    if (Number.isFinite(entry.price) && entry.price > 0) {
      byCurrency.set(entry.currency, entry);
    }
  }

  return [...byCurrency.values()]
    .map((entry) => ({
      symbol: entry.currency,
      price: entry.price,
      iconUrl: iconUrlFor(entry.currency),
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export async function fetchTokens(): Promise<Token[]> {
  const res = await fetch(PRICES_URL);
  if (!res.ok) {
    throw new Error(`Failed to load token prices (HTTP ${res.status})`);
  }
  const data: RawPriceEntry[] = await res.json();
  return buildTokenList(data);
}
