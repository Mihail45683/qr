
const CACHE_NAME = 'qr-pdf-v1';
// Укажите пути ко всем файлам, которые нужны для работы страницы в офлайне
const ASSETS = [
  '/qr/qr.html',
  '/qr/manifest.json'
  // Добавьте сюда ваши файлы CSS, JS или сторонние библиотеки (например, для генерации QR или PDF), если они лежат локально
];

// Установка Service Worker и кэширование ресурсов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Активация и очистка старого кэша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Перехват запросов для работы в офлайне
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
