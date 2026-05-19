/* ============================================
   SHOP STORE - Service Worker
   PWA Offline Support
   AmeenDesigns © 2026
============================================ */

const CACHE_NAME = 'shopstore-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/css/main.css',
  '/assets/js/main.js',
  '/data/apps.json',
  '/manifest.json',
];

/* ─── INSTALL ─── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

/* ─── ACTIVATE ─── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ─── FETCH STRATEGY: Network-first, fall back to cache ─── */
self.addEventListener('fetch', event => {
  // Skip non-GET and cross-origin
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // For navigation requests → serve offline page if network fails
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(OFFLINE_URL)
      )
    );
    return;
  }

  // For static assets → cache first, then network
  if (event.request.url.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff2|json)$/)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return res;
        });
        return cached || networkFetch;
      })
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
