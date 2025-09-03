const CACHE_NAME = 'animal-run-v1';
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

// Service Worker 설치 시 캐시에 파일들 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시가 열렸습니다');
        return cache.addAll(urlsToCache);
      })
  );
});

// 요청 시 캐시에서 파일 반환
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 캐시된 응답 반환
        if (response) {
          return response;
        }
        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(event.request);
      }
    )
  );
});

// 캐시 업데이트
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
