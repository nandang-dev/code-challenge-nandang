import { useState } from 'react';
import type { WalletBalance } from './wallet';


const SAMPLE_BALANCES: WalletBalance[] = [
  { currency: 'ETH', amount: 1.5, blockchain: 'Ethereum' },
  { currency: 'OSMO', amount: 42, blockchain: 'Osmosis' },
  { currency: 'ARB', amount: 0, blockchain: 'Arbitrum' }, // zero balance -> filtered out
  { currency: 'ZIL', amount: 100, blockchain: 'Zilliqa' },
  { currency: 'DOGE', amount: 10, blockchain: 'UnknownChain' }, // unrecognized -> filtered out
  { currency: 'NEO', amount: 5, blockchain: 'Neo' }, // no price below -> exercises the NaN guard
];

const SAMPLE_PRICES: Record<string, number> = {
  ETH: 1600,
  OSMO: 0.4,
  ZIL: 0.02,
};

export function useWalletBalances(): WalletBalance[] {
  const [balances] = useState(SAMPLE_BALANCES);
  return balances;
}

export function usePrices(): Record<string, number> {
  const [prices] = useState(SAMPLE_PRICES);
  return prices;
}
