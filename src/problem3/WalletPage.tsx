import React, { useMemo } from 'react';
import { buildWalletRows } from './wallet';
import { useWalletBalances, usePrices } from './hooks';
import { WalletRow } from './WalletRow';
import { classes } from './styles';

export interface BoxProps {
  className?: string;
  children?: React.ReactNode;
}

interface Props extends BoxProps {}

export const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const rows = useMemo(
    () => buildWalletRows(balances, prices),
    [balances, prices],
  );

  return (
    <div {...rest}>
      {rows.map((balance) => (
        <WalletRow
          key={`${balance.blockchain}-${balance.currency}`}
          className={classes.row}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
      {children}
    </div>
  );
};

export default WalletPage;
