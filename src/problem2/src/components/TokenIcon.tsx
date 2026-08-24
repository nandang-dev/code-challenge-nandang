import { useState } from 'react';
import type { Token } from '../lib/types';

const PALETTE = [
  'bg-fuchsia-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-rose-500',
];

function colorFor(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = (hash * 31 + symbol.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function TokenIcon({
  token,
  size = 28,
}: {
  token: Token;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorFor(token.symbol)}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {token.symbol.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={token.iconUrl}
      alt={token.symbol}
      width={size}
      height={size}
      className="shrink-0 rounded-full bg-white/5 object-contain"
      onError={() => setFailed(true)}
    />
  );
}
