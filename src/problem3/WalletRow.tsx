export interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

export function WalletRow({
  className,
  formattedAmount,
  usdValue,
}: WalletRowProps) {
  return (
    <div className={className} data-testid="wallet-row">
      <span>{formattedAmount}</span>
      <span>${usdValue.toFixed(2)}</span>
    </div>
  );
}
