// CoffeeLife Cafe Service Worker
const CACHE_NAME = 'coffeelife-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/menu.css',
    '/css/whatsapp.css',
    '/js/whatsapp.js',
    '/images/logo.jpg'
    // Add all menu images and other assets here for offline caching
];

// Install Event - cache essential assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting(); // Activate worker immediately
});

// Activate Event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim(); // Take control of uncontrolled clients immediately
});

// Fetch Event - respond with cache first, then network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse; // Return cached version if available
            }
            return fetch(event.request)
                .then(networkResponse => {
                    // Dynamically cache new resources
                    if (!event.request.url.startsWith('chrome-extension://')) {
                        return caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Optional: return fallback page or image when offline
                    if (event.request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                });
        })
    );
});
