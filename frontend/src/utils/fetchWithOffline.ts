// src/utils/fetchWithOffline.ts
/**
 * Simple offline helper:
 * - If online: runs the provided fetcher, saves result to localStorage under cacheKey, returns result.
 * - If offline or fetch fails: returns cached value (if any) or null.
 *
 * Keep it intentionally small so it works with your existing apiRequest/auth flow.
 */
export async function fetchWithOffline<T>(
  fetcher: () => Promise<T>,
  cacheKey: string
): Promise<T | null> {
  if (!cacheKey) throw new Error("cacheKey is required");

  const readCache = (): T | null => {
    try {
      const raw = localStorage.getItem(cacheKey);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  };

  // If offline, return cache immediately
  if (!navigator.onLine) {
    return readCache();
  }

  // Try network, fallback to cache on failure
  try {
    const data = await fetcher();
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
    return data;
  } catch {
    return readCache();
  }
}
