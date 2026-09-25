// AIMS Service Worker
// Caching strategy:
//   - /api/*, /ws/* and any non-GET request  -> NETWORK ONLY (never cached)
//   - Dev server paths (/@vite, /src, etc.)   -> IGNORED (bypass SW)
//   - Hashed build assets (immutable)        -> CACHE FIRST
//   - Navigation requests (SPA)              -> NETWORK FIRST, fall back to cached '/'
const STATIC_CACHE = 'aims-static-v1';
const RUNTIME_CACHE = 'aims-runtime-v1';

const PRECACHE_URLS = ['/', '/index.html', '/manifest.json', '/favicon.ico', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch((err) => console.warn('Pre-cache warning:', err)))
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

const isBypassRequest = (url) =>
  url.pathname.startsWith('/api') ||
  url.pathname.startsWith('/ws') ||
  url.pathname.startsWith('/@') ||
  url.pathname.startsWith('/src') ||
  url.pathname.startsWith('/node_modules') ||
  url.searchParams.has('t') ||
  url.hostname !== self.location.hostname;

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never touch non-GET requests, API traffic, or dev-server internal URLs
  if (request.method !== 'GET' || isBypassRequest(url)) {
    return;
  }

  // Hashed/immutable build assets: cache first, then network
  if (url.origin === self.location.origin && /\/assets\/.+[.-][0-9a-zA-Z_]{8,}\./.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      ).catch(() => new Response('Asset not found', { status: 404, statusText: 'Not Found' }))
    );
    return;
  }

  // Navigations and other same-origin GETs: network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.mode === 'navigate') {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put('/', copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          const fallback = await caches.match('/');
          if (fallback) return fallback;
        }
        return new Response('Network unavailable', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
