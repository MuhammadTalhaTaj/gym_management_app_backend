// public/sw.js or src/sw.js (make sure Vite copies to public or build tooling)
const CACHE_NAME = 'gym-cache-v1';
const ASSETS_TO_CACHE = [
  '/', '/index.html', '/assets/index.js', '/styles.css'
];

// install
self.addEventListener('install', (evt) => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS_TO_CACHE))
  );
});

// activate
self.addEventListener('activate', (evt) => {
  evt.waitUntil(self.clients.claim());
});

// fetch: serve static assets from cache, and for API, try network then fallback to cache
self.addEventListener('fetch', (evt) => {
  const req = evt.request;
  const url = new URL(req.url);

  // only handle GET API requests you want (customize)
  if (req.method === 'GET' && url.pathname.startsWith('/api/')) {
    evt.respondWith(
      (async () => {
        try {
          const networkResp = await fetch(req);
          // Optionally: update a cache for API responses (but main cache is IndexedDB)
          return networkResp;
        } catch (err) {
          // fallback to the cached response from navigation cache (service worker can't easily read idb without bundling idb)
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(req);
          if (cached) return cached;
          return new Response(JSON.stringify({ offline: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          });
        }
      })()
    );
    return;
  }

  // default: network-first for navigation assets, otherwise cache-first for static
  evt.respondWith(
    caches.match(req).then((r) => r || fetch(req))
  );
});
