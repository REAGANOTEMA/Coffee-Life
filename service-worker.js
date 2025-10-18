const CACHE_NAME = 'coffee-life-cache-v1';
const urlsToCache = [
  '/index.html',
  '/menu#',
  '/manifest.json',
  '/coffee life/images/logo.jpg',
  '/styles/location.css', // your CSS
  '/scripts/location.js', // your JS
  '/scripts/menu.js',     // your menu/cart JS
  // Add any other assets (images, fonts, etc.) you need offline
];

// Install Service Worker & cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching app shell and content');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate worker immediately
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activated');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of pages immediately
});

// Fetch assets from cache first, then network fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        // Optional: cache new requests dynamically
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Optional: fallback page for offline
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
