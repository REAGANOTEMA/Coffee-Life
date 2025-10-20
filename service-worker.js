const CACHE_NAME = 'coffee-life-cache-v1';
const urlsToCache = [
  '/index.html',
  '/manifest.json',
  '/images/logo.jpg',
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
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request).then(fetchResponse =>
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        })
      )
    ).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
