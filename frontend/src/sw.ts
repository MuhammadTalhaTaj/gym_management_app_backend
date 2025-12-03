/// <reference lib="webworker" />

/**
 * src/sw.ts
 * TypeScript-friendly Service Worker — cast `self` to ServiceWorkerGlobalScope
 * Compile to public/sw.js (or configure your build pipeline to emit it there).
 */

export {}; // make this a module and avoid accidental global merges

// Treat the global `self` as a ServiceWorkerGlobalScope for proper typings.
const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = 'gym-cache-v1';
const ASSETS_TO_CACHE = [
  '/',             // root
  '/index.html',
  '/offline.html', // create this file in public/
  '/styles.css',
  '/assets/index.js'
] as const;

/* -------------------- Install -------------------- */
sw.addEventListener('install', (evt: ExtendableEvent) => {
  // Activate new worker as soon as it's finished installing
  sw.skipWaiting();

  evt.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const requests = ASSETS_TO_CACHE.map(path => new Request(path, { cache: 'reload' }));
    await cache.addAll(requests);
  })());
});

/* -------------------- Activate -------------------- */
sw.addEventListener('activate', (evt: ExtendableEvent) => {
  evt.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );

    // take control of uncontrolled clients
    await sw.clients.claim();
  })());
});

/* -------------------- Fetch -------------------- */
/**
 * Strategy:
 * - GET /api/* => network-first, cache successful responses for fallback
 * - navigation (HTML) => network-first, fallback to cached navigation or /offline.html
 * - other GET => cache-first, network fallback
 */
sw.addEventListener('fetch', (evt: FetchEvent) => {
  const req = evt.request;
  let url: URL;
  try {
    url = new URL(req.url);
  } catch {
    // If URL parsing fails, fallback to network
    return;
  }

  const isSameOrigin = url.origin === sw.location.origin;

  // API network-first
  if (req.method === 'GET' && isSameOrigin && url.pathname.startsWith('/api/')) {
    evt.respondWith((async () => {
      try {
        const networkResp = await fetch(req);
        if (networkResp && networkResp.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(req, networkResp.clone());
        }
        return networkResp;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        return new Response(JSON.stringify({ offline: true }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        });
      }
    })());
    return;
  }

  // Navigation (HTML) - network-first with offline fallback
  if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))) {
    evt.respondWith((async () => {
      try {
        const networkResp = await fetch(req);
        // best-effort cache the navigation response
        caches.open(CACHE_NAME).then(cache => cache.put(req, networkResp.clone()).catch(() => {}));
        return networkResp;
      } catch {
        const cachedNav = await caches.match(req);
        if (cachedNav) return cachedNav;
        const offline = await caches.match('/offline.html');
        if (offline) return offline;
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  // Other GET requests -> cache-first
  if (req.method === 'GET') {
    evt.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const networkResp = await fetch(req);
        if (networkResp && networkResp.ok && isSameOrigin) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, networkResp.clone()).catch(() => {});
        }
        return networkResp;
      } catch {
        // final fallback
        return new Response(null, { status: 503, statusText: 'Offline' });
      }
    })());
  }
});
