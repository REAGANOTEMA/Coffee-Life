self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('coffee-life-cache').then(cache => {
      return cache.addAll([
        '/menu#',
        '/index.html',
        '/manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
