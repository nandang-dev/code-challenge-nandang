export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

export interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

export const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};
export const UNKNOWN_BLOCKCHAIN_PRIORITY = -99;

export function getPriority(blockchain: string): number {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? UNKNOWN_BLOCKCHAIN_PRIORITY;
}


export function buildWalletRows(
  balances: WalletBalance[],
  prices: Record<string, number>,
): FormattedWalletBalance[] {
  return balances
    .filter(
      (balance) =>
        getPriority(balance.blockchain) > UNKNOWN_BLOCKCHAIN_PRIORITY &&
        balance.amount > 0,
    )
    .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain))
    .map((balance) => ({
      ...balance,
      formatted: balance.amount.toFixed(2),
      usdValue: (prices[balance.currency] ?? 0) * balance.amount,
    }));
}
