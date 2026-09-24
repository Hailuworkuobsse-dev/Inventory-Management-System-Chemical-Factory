
// AIMS Service Worker
// Caching strategy:
//   - /api/*, /ws/* and any non-GET request  -> NETWORK ONLY (never cached)
//   - Hashed build assets (immutable)        -> CACHE FIRST
//   - Navigation requests (SPA)              -> NETWORK FIRST, fall back to cached '/'
const STATIC_CACHE = 'aims-static-v1';
const RUNTIME_CACHE = 'aims-runtime-v1';

const PRECACHE_URLS = ['/', '/index.html', '/manifest.json', '/favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isApiRequest = (url) =>
  url.pathname.startsWith('/api') ||
  url.pathname.startsWith('/ws') ||
  url.hostname !== self.location.hostname;

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never touch non-GET requests or API traffic — always hit the network.
  if (request.method !== 'GET' || isApiRequest(url)) {
    return;
  }

  // Hashed/immutable build assets: cache first, then network.
  if (url.origin === self.location.origin && /\/assets\/.+[.-][0-9a-zA-Z_]{8,}\./.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  // Navigations and other same-origin GETs: network first, cache fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.mode === 'navigate') {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put('/', copy));
        }
        return response;
      })
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached || (request.mode === 'navigate' ? caches.match('/') : undefined))
      )
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
