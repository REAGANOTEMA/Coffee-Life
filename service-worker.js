const CACHE_NAME = 'coffee-life-cache-v1';
const urlsToCache = [
  '/index.html',
  '/manifest.json',
  '/coffee-life/images/logo.jpg',
  '/css/hero.css',
  '/css/location.css',
  '/css/global.css',
  '/css/home.css',
  '/css/responsive.css',
  '/css/gallery.css',
  '/css/apps.css',
  '/css/qr.css',
  '/css/footer.css',
  '/css/contact.css',
  '/css/payments.css',
  '/css/menu.css',
  '/css/cart.css',
  '/css/whatsapp.css',
  '/js/location.js',
  '/js/menu.js'
  // Add more assets if needed
];

// Install Service Worker & cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching app shell and content');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker and clean old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activated');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch assets from cache first, then network fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Offline fallback: return index.html for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
