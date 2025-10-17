const CACHE_NAME = 'coffee-life-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/menu.json',
  '/css/hero.css',
  '/images/logo.jpg',
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
  '/js/menu.js',
  '/js/cart.js'
];

// ===== Install Event =====
self.addEventListener('install', event => {
  console.log('[SW] Installing Coffee Life Cafe PWA...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching essential files...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ===== Activate Event =====
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ===== Fetch Event =====
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then(networkResponse => {
          // Cache dynamic GET requests
          if (event.request.method === 'GET') {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          if (event.request.destination === 'image') {
            return caches.match('/images/logo.jpg');
          } else if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

// ===== Periodic Cache Update =====
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-cache') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
  }
});

// ===== Push Notification & Message Handling (Optional) =====
// self.addEventListener('push', event => {
//   const data = event.data.json();
//   event.waitUntil(
//     self.registration.showNotification(data.title, { body: data.body, icon: '/images/logo.jpg' })
//   );
// });
