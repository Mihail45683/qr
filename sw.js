const CACHE_NAME = 'qr-pdf-pwa-v1';

// Укажите здесь все локальные файлы и внешние CDN-библиотеки (для QR и PDF), которые использует ваш проект
const ASSETS_TO_CACHE = [
  './',
  './qr.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Установка и кэширование файлов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Очистка старого кэша при обновлении версии
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Работа в офлайне (сначала ищем в кэше, затем в сети)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
