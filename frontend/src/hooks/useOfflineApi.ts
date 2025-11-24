// src/hooks/useOfflineApi.js
import { useEffect, useState, useCallback } from 'react';
import { readFromCache, saveToCache } from '../db.ts';

export default function useOfflineApi(key, fetcher) {
  // key: unique cache key (e.g. `/api/members`)
  // fetcher: async () => fetch(...) or axios call that returns JSON
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const networkData = await fetcher();
      if (networkData) {
        await saveToCache(key, networkData);
        setData(networkData);
      }
    } catch (err) {
      // network failed - we'll keep cache
      console.warn('Network fetch failed, using cache', err);
    } finally {
      setLoading(false);
    }
  }, [fetcher, key]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // 1) load from cache first (so UI shows instantly)
      const cached = await readFromCache(key);
      if (mounted) {
        if (cached) {
          setData(cached);
          setLoading(false);
        }
      }
      // 2) try to refresh from network
      try {
        await refresh();
      } catch (e) {
        // ignore - already handled
      }
    })();
    return () => { mounted = false; };
  }, [key, refresh]);

  useEffect(() => {
    // when back online, refresh
    const onOnline = () => refresh();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [refresh]);

  return { data, loading, refresh };
}
