import { useEffect, useState } from 'react';
import { fetchTokens } from '../lib/prices';
import type { Token } from '../lib/types';

interface UseTokensResult {
  tokens: Token[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTokens(): UseTokensResult {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchTokens()
      .then((result) => {
        if (!cancelled) setTokens(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Could not load token prices.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { tokens, loading, error, refetch: () => setReloadKey((k) => k + 1) };
}
