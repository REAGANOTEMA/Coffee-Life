const CACHE_NAME = 'coffee-life-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/menu.json',
  '/css/hero.css',
  '/images/logo.jpg',           // Your main logo (onaksy, sharp, high-quality)
  '/images/menu/food1.jpg',
  '/images/menu/food2.jpg',
  '/images/menu/food3.jpg',
  '/images/menu/food4.jpg',
  '/images/menu/drink1.jpg',
  '/images/menu/drink2.jpg',
  '/images/menu/drink3.jpg',
  '/images/menu/drink4.jpg',
  '/images/menu/drink5.jpg',
  '/images/menu/dessert1.jpg',
  '/images/menu/dessert2.jpg',
  '/images/menu/dessert3.jpg',
  '/images/menu/special1.jpg',
  '/images/menu/special2.jpg',
  '/images/menu/coffee1.jpg',
  '/images/menu/coffee2.jpg',
  '/js/menu.js',               // Make sure menu.js is included
  '/js/cart.js'                // Make sure cart.js is included
];

// Install event - cache all essential assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing Coffee Life Cafe PWA...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching all essential files...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - remove old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache first, then network fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request).then(fetchResponse => {
        // Cache new GET requests dynamically
        if (event.request.method === 'GET') {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
          });
        }
        return fetchResponse;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === 'image') {
          return caches.match('/images/logo.jpg'); // High-quality fallback logo
        } else if (event.request.destination === 'document') {
          return caches.match('/index.html'); // Fallback to homepage
        }
      });
    })
  );
});

// Optional: Periodic cache update (for long-term freshness)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-cache') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(urlsToCache);
      })
    );
  }
});
