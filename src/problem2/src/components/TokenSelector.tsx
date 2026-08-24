import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Token } from '../lib/types';
import { formatUsd } from '../lib/swap';
import { TokenIcon } from './TokenIcon';

export function TokenSelector({
  label,
  tokens,
  selected,
  excludeSymbol,
  onSelect,
  testId,
}: {
  label: string;
  tokens: Token[];
  selected: Token | null;
  excludeSymbol?: string;
  onSelect: (token: Token) => void;
  testId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    return tokens
      .filter((t) => t.symbol !== excludeSymbol)
      .filter((t) => !q || t.symbol.toUpperCase().includes(q));
  }, [tokens, excludeSymbol, query]);

  function close() {
    setOpen(false);
    setQuery('');
  }

  return (
    <>
      <button
        type="button"
        data-testid={testId}
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-white/10 py-1.5 pr-3 pl-1.5 text-sm font-semibold text-white transition hover:bg-white/15"
      >
        {selected ? (
          <>
            <TokenIcon token={selected} size={24} />
            {selected.symbol}
          </>
        ) : (
          <span className="px-2 text-gray-300">Select</span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="text-gray-300"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            >
              <motion.div
                className="flex max-h-[70vh] w-full max-w-sm flex-col rounded-t-2xl bg-[#181924] p-4 shadow-2xl ring-1 ring-white/10 sm:rounded-2xl"
                initial={{ y: 40, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">{label}</h2>
                  <button
                    type="button"
                    onClick={close}
                    className="text-gray-400 hover:text-white"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search token symbol"
                  className="mb-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-gray-500 focus:ring-fuchsia-400/60"
                />

                <div className="-mx-1 flex-1 overflow-y-auto px-1">
                  {filtered.length === 0 && (
                    <p className="py-6 text-center text-sm text-gray-500">
                      No tokens match "{query}".
                    </p>
                  )}
                  {filtered.map((token) => (
                    <button
                      key={token.symbol}
                      type="button"
                      onClick={() => {
                        onSelect(token);
                        close();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-white/5"
                    >
                      <TokenIcon token={token} size={30} />
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-white">
                          {token.symbol}
                        </span>
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatUsd(token.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
