import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletPage } from './WalletPage';

describe('WalletPage', () => {
  it('renders only positive balances on known chains, sorted by priority', () => {
    render(<WalletPage />);
    const rows = screen.getAllByTestId('wallet-row');

    expect(rows).toHaveLength(4);
    expect(rows.map((r) => r.textContent)).toEqual([
      expect.stringContaining('42.00'), // OSMO
      expect.stringContaining('1.50'), // ETH
      expect.stringContaining('100.00'), // ZIL
      expect.stringContaining('5.00'), // NEO
    ]);
  });

  it('shows $0.00 instead of NaN for a token with no price data', () => {
    render(<WalletPage />);
    const rows = screen.getAllByTestId('wallet-row');
    const neoRow = rows.find((r) => r.textContent?.includes('5.00'));
    expect(neoRow?.textContent).toContain('$0.00');
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('renders children passed to the component', () => {
    render(
      <WalletPage>
        <p>footer note</p>
      </WalletPage>,
    );
    expect(screen.getByText('footer note')).toBeInTheDocument();
  });

  it('gives every row a unique key (no React duplicate-key warning)', () => {
    const warnSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<WalletPage />);
    const duplicateKeyWarning = warnSpy.mock.calls.some((call) =>
      String(call[0]).includes('same key'),
    );
    expect(duplicateKeyWarning).toBe(false);
    warnSpy.mockRestore();
  });
});
