const CACHE_NAME = 'coffeelife-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/menu.css',
    '/css/whatsapp.css',
    '/js/whatsapp.js',
    '/images/logo.jpg',
    '/images/logo.jpg'
    // Add all menu images here for offline caching
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
        )
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(response => response || fetch(e.request)));
});
