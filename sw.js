const CACHE_NAME = 'maisya-donasi-v20260914-transparansi';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategi: Network-First (Selalu prioritaskan versi terbaru dari internet)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || e.request.url.includes('script.google.com') || e.request.url.includes('api.whatsapp.com')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request).then((cached) => {
          if (cached) return cached;
          if (e.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
