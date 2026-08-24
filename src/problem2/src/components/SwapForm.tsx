import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useTokens } from '../hooks/useTokens';
import {
  convertAmount,
  formatAmount,
  formatUsd,
  parseAmountInput,
  validateSwap,
} from '../lib/swap';
import type { Token } from '../lib/types';
import { TokenSelector } from './TokenSelector';

const DEFAULT_FROM = 'ETH';
const DEFAULT_TO = 'USDC';

type SwapStatus = 'idle' | 'pending' | 'success';

export function SwapForm() {
  const { tokens, loading, error, refetch } = useTokens();

  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromRaw, setFromRaw] = useState('');
  const [toRaw, setToRaw] = useState('');
  const [status, setStatus] = useState<SwapStatus>('idle');

  // Pick sensible defaults once prices arrive.
  useEffect(() => {
    if (tokens.length === 0 || fromToken || toToken) return;
    const byDefault = (symbol: string) =>
      tokens.find((t) => t.symbol === symbol);
    setFromToken(byDefault(DEFAULT_FROM) ?? tokens[0]);
    setToToken(byDefault(DEFAULT_TO) ?? tokens[1] ?? tokens[0]);
  }, [tokens, fromToken, toToken]);

  const fromAmount = parseAmountInput(fromRaw);
  const validation = validateSwap(fromAmount, fromToken, toToken);

  function handleFromChange(value: string) {
    setFromRaw(value);
    setStatus('idle');
    const parsed = parseAmountInput(value);
    if (parsed && fromToken && toToken) {
      setToRaw(formatAmount(convertAmount(parsed, fromToken.price, toToken.price)));
    } else {
      setToRaw('');
    }
  }

  function handleToChange(value: string) {
    setToRaw(value);
    setStatus('idle');
    const parsed = parseAmountInput(value);
    if (parsed && fromToken && toToken) {
      setFromRaw(formatAmount(convertAmount(parsed, toToken.price, fromToken.price)));
    } else {
      setFromRaw('');
    }
  }

  function handleSelectFrom(token: Token) {
    setFromToken(token);
    if (fromAmount && toToken) {
      setToRaw(formatAmount(convertAmount(fromAmount, token.price, toToken.price)));
    }
  }

  function handleSelectTo(token: Token) {
    setToToken(token);
    if (fromAmount && fromToken) {
      setToRaw(formatAmount(convertAmount(fromAmount, fromToken.price, token.price)));
    }
  }

  function handleFlip() {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromRaw(toRaw);
    setToRaw(fromRaw);
    setStatus('idle');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validation.valid) return;
    setStatus('pending');
    window.setTimeout(() => {
      setStatus('success');
      window.setTimeout(() => {
        setStatus('idle');
        setFromRaw('');
        setToRaw('');
      }, 1800);
    }, 1100);
  }

  const rateLabel = useMemo(() => {
    if (!fromToken || !toToken) return null;
    const rate = convertAmount(1, fromToken.price, toToken.price);
    return `1 ${fromToken.symbol} ≈ ${formatAmount(rate)} ${toToken.symbol}`;
  }, [fromToken, toToken]);

  if (loading) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-3xl bg-white/5 p-10 text-gray-300 ring-1 ring-white/10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-fuchsia-400" />
        <p className="text-sm">Loading live prices…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-3xl bg-white/5 p-10 text-center ring-1 ring-white/10">
        <p className="text-sm text-rose-300">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/15"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-3xl bg-white/5 p-5 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl"
    >
      <h1 className="mb-4 px-1 text-lg font-semibold text-white">Swap</h1>

      <div className="relative flex flex-col gap-1.5">
        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-transparent transition focus-within:ring-fuchsia-400/50">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
            <span>You pay</span>
            {fromToken && <span>{formatUsd(fromToken.price)} / {fromToken.symbol}</span>}
          </div>
          <div className="flex items-center gap-3">
            <input
              inputMode="decimal"
              placeholder="0.0"
              value={fromRaw}
              onChange={(e) => handleFromChange(e.target.value)}
              className="w-0 flex-1 bg-transparent text-2xl font-medium text-white outline-none placeholder:text-gray-600"
            />
            <TokenSelector
              label="You pay"
              tokens={tokens}
              selected={fromToken}
              excludeSymbol={toToken?.symbol}
              onSelect={handleSelectFrom}
              testId="pay-token-button"
            />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
          <button
            type="button"
            onClick={handleFlip}
            aria-label="Swap direction"
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-xl border-4 border-[#0b0c14] bg-white/10 text-white transition hover:rotate-180 hover:bg-white/20"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 6L8 2L12 6M8 2V14M12 10L8 14L4 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-transparent transition focus-within:ring-fuchsia-400/50">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
            <span>You receive</span>
            {toToken && <span>{formatUsd(toToken.price)} / {toToken.symbol}</span>}
          </div>
          <div className="flex items-center gap-3">
            <input
              inputMode="decimal"
              placeholder="0.0"
              value={toRaw}
              onChange={(e) => handleToChange(e.target.value)}
              className="w-0 flex-1 bg-transparent text-2xl font-medium text-white outline-none placeholder:text-gray-600"
            />
            <TokenSelector
              label="You receive"
              tokens={tokens}
              selected={toToken}
              excludeSymbol={fromToken?.symbol}
              onSelect={handleSelectTo}
              testId="receive-token-button"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex min-h-[1.25rem] items-center justify-between px-1 text-xs">
        <span className="text-gray-500">{rateLabel}</span>
        {validation.error && (fromRaw || toRaw) && (
          <span className="text-rose-300">{validation.error}</span>
        )}
      </div>

      <motion.button
        type="submit"
        data-testid="confirm-swap-button"
        disabled={!validation.valid || status === 'pending'}
        whileTap={{ scale: 0.98 }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-500 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-gray-500"
      >
        {status === 'pending' && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {status === 'pending'
          ? 'Confirming swap…'
          : status === 'success'
            ? 'Swap confirmed ✓'
            : 'CONFIRM SWAP'}
      </motion.button>
    </form>
  );
}
