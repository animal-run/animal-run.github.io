const CACHE_NAME = 'animal-run-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './images/favicon.png',
  './images/animal1.png',
  './images/animal2.png',
  './images/animal3.png',
  './images/animal4.png',
  './images/animal5.png',
  './images/animal6.png',
  './images/animal7.png',
  './images/animal8.png',
  './images/animal9.png',
  './images/animal10.png',
  './images/background-sand.webp',
  './images/background-savannah.webp',
  './images/background-track.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(name => name !== CACHE_NAME && caches.delete(name))
    ))
  );
  self.clients.claim();
});

// stale-while-revalidate 전략
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
