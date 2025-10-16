const CACHE_NAME = 'coffee-life-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/hero.css',
  '/menu.json',
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
  '/images/menu/coffee2.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
