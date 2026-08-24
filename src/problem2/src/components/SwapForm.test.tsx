import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SwapForm } from './SwapForm';
import { convertAmount, formatAmount } from '../lib/swap';

const SAMPLE_PRICES = [
  { currency: 'ETH', date: '2023-08-29T00:00:00.000Z', price: 1600 },
  { currency: 'USDC', date: '2023-08-29T00:00:00.000Z', price: 1 },
  { currency: 'ATOM', date: '2023-08-29T00:00:00.000Z', price: 8 },
];

function mockFetchOnce() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => SAMPLE_PRICES,
    }),
  );
}

async function renderLoaded() {
  render(<SwapForm />);
  // Wait past both the fetch resolving *and* the effect that picks the
  // ETH/USDC defaults, not just the first "loading -> loaded" render.
  await waitFor(() =>
    expect(screen.getByTestId('pay-token-button')).toHaveTextContent('ETH'),
  );
}

describe('SwapForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows a loading state, then the form with ETH/USDC as defaults', async () => {
    mockFetchOnce();
    render(<SwapForm />);
    expect(screen.getByText(/Loading live prices/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByTestId('pay-token-button')).toHaveTextContent('ETH'),
    );
    expect(screen.getByTestId('receive-token-button')).toHaveTextContent(
      'USDC',
    );
  });

  it('shows a retryable error state when the price feed fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    render(<SwapForm />);
    await screen.findByText(/Failed to load token prices/i);
    expect(
      screen.getByRole('button', { name: /try again/i }),
    ).toBeInTheDocument();
  });

  it('computes "you receive" live from "you pay", using the real price ratio', async () => {
    mockFetchOnce();
    await renderLoaded();

    const [payInput, receiveInput] = screen.getAllByPlaceholderText('0.0');
    fireEvent.change(payInput, { target: { value: '2' } });

    const expected = formatAmount(convertAmount(2, 1600, 1)); // ETH -> USDC
    expect(receiveInput).toHaveValue(expected);
  });

  it('computes "you pay" back when typing directly into "you receive"', async () => {
    mockFetchOnce();
    await renderLoaded();

    const [payInput, receiveInput] = screen.getAllByPlaceholderText('0.0');
    fireEvent.change(receiveInput, { target: { value: '1600' } });

    const expected = formatAmount(convertAmount(1600, 1, 1600)); // USDC -> ETH
    expect(payInput).toHaveValue(expected);
  });

  it('flip swaps both the selected tokens and the amounts', async () => {
    mockFetchOnce();
    await renderLoaded();

    const [payInput] = screen.getAllByPlaceholderText('0.0');
    fireEvent.change(payInput, { target: { value: '2' } });

    fireEvent.click(screen.getByRole('button', { name: /swap direction/i }));

    expect(screen.getByTestId('pay-token-button')).toHaveTextContent('USDC');
    expect(screen.getByTestId('receive-token-button')).toHaveTextContent(
      'ETH',
    );
    const [payInputAfter, receiveInputAfter] =
      screen.getAllByPlaceholderText('0.0');
    expect(payInputAfter).toHaveValue(
      formatAmount(convertAmount(2, 1600, 1)),
    );
    expect(receiveInputAfter).toHaveValue('2');
  });

  it('disables Confirm Swap until a valid amount is entered', async () => {
    mockFetchOnce();
    await renderLoaded();

    expect(screen.getByTestId('confirm-swap-button')).toBeDisabled();

    const [payInput] = screen.getAllByPlaceholderText('0.0');
    fireEvent.change(payInput, { target: { value: '1' } });
    expect(screen.getByTestId('confirm-swap-button')).toBeEnabled();

    fireEvent.change(payInput, { target: { value: '0' } });
    expect(screen.getByTestId('confirm-swap-button')).toBeDisabled();
  });

  it('runs the confirm flow: pending -> success -> reset', async () => {
    mockFetchOnce();
    await renderLoaded();

    const [payInput] = screen.getAllByPlaceholderText('0.0');
    fireEvent.change(payInput, { target: { value: '1' } });
    fireEvent.click(screen.getByTestId('confirm-swap-button'));

    expect(screen.getByTestId('confirm-swap-button')).toHaveTextContent(
      /confirming swap/i,
    );

    await waitFor(
      () =>
        expect(screen.getByTestId('confirm-swap-button')).toHaveTextContent(
          /swap confirmed/i,
        ),
      { timeout: 2000 },
    );

    await waitFor(
      () => {
        const [pay] = screen.getAllByPlaceholderText('0.0');
        expect(pay).toHaveValue('');
      },
      { timeout: 3000 },
    );
    expect(screen.getByTestId('confirm-swap-button')).toBeDisabled();
  });

  it('excludes the token already selected on the other side from the picker', async () => {
    mockFetchOnce();
    await renderLoaded();

    fireEvent.click(screen.getByTestId('pay-token-button'));
    const search = await screen.findByPlaceholderText('Search token symbol');
    fireEvent.change(search, { target: { value: 'USDC' } });

    expect(
      screen.getByText(/No tokens match "USDC"/i),
    ).toBeInTheDocument();
  });

  it('lets you pick a different token from the picker', async () => {
    mockFetchOnce();
    await renderLoaded();

    fireEvent.click(screen.getByTestId('pay-token-button'));
    const search = await screen.findByPlaceholderText('Search token symbol');
    fireEvent.change(search, { target: { value: 'ATOM' } });
    fireEvent.click(screen.getByRole('button', { name: /^ATOM/ }));

    expect(screen.getByTestId('pay-token-button')).toHaveTextContent('ATOM');
  });
});
