// src/hooks/useOfflineApi.ts
import { useEffect, useState, useCallback } from 'react';
import { readFromCache, saveToCache } from '../db';

export default function useOfflineApi<T = any>(key: string, fetcher: () => Promise<T>) {
  // key: unique cache key (e.g. `/api/members`)
  // fetcher: async () => fetch(...) or axios call that returns JSON
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const networkData = await fetcher();
      if (typeof networkData !== 'undefined') {
        await saveToCache(key, networkData);
        setData(networkData);
      }
    } catch (err) {
      // network failed - we'll keep cache
      // keep existing data
      // eslint-disable-next-line no-console
      console.warn('Network fetch failed, using cache', err);
    } finally {
      setLoading(false);
    }
  }, [fetcher, key]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 1) load from cache first (so UI shows instantly)
        const cached = await readFromCache(key);
        if (mounted && typeof cached !== 'undefined' && cached !== null) {
          setData(cached as T);
          setLoading(false);
        }
      } catch (err) {
        // ignore cache read errors
      }

      // 2) try to refresh from network
      try {
        await refresh();
      } catch (e) {
        // ignore - already handled
      }
    })();

    return () => {
      mounted = false;
    };
  }, [key, refresh]);

  useEffect(() => {
    // when back online, refresh
    const onOnline = () => {
      refresh();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [refresh]);

  return { data, loading, refresh };
}
