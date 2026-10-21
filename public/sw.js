// Osama Gym & Nutrition App - Production Offline-First Service Worker
const CACHE_NAME = 'osama-gym-cache-v6';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/app-avatar.jpg',
  '/app-cover.jpg',
];

// Install Event: Precaches core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('[SW] Precache non-blocking warning:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event: Offline-first caching strategy
self.addEventListener('fetch', (event) => {
  // Only process standard GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // Skip dev websocket / HMR connections
  if (url.pathname.includes('webpack-hmr') || url.pathname.startsWith('/api/')) {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-first with offline cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline, serve cached page or fallback to root app shell
          const cachedPage = await caches.match(event.request);
          if (cachedPage) return cachedPage;
          const rootFallback = await caches.match('/');
          if (rootFallback) return rootFallback;
          return new Response(
            '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Osama The Best - Offline</title></head><body style="background:#0b0b0e;color:#ededf0;font-family:sans-serif;padding:24px;text-align:center;"><h2 style="color:#eed891;">App Loading Offline</h2><p style="color:#a1a1aa;font-size:14px;">Please open the app while online once to complete offline caching.</p><button onclick="window.location.reload()" style="background:#d4b26f;color:#000;border:none;padding:10px 20px;border-radius:10px;font-weight:bold;margin-top:12px;">Reload</button></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 2. Next.js static assets (_next/static/ chunks and css): Network-first with cache fallback
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Static assets (images, icons, fonts, manifest): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
