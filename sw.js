const CACHE_NAME = 'qr-pdf-v2';

// Список локальных файлов для полной автономности (App Shell)
const STATIC_ASSETS = [
  '/qr/qr.html',
  '/qr/manifest.json',
  '/qr/jigdoicon.png',
  '/qr/website_9373061.png'
  // Если у вас появятся файлы styles.css или script.js, добавьте их пути сюда
];

// 1. Установка: кэшируем критически важные локальные ресурсы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Кэширование статических ресурсов');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting()) // Принудительная активация новой версии
  );
});

// 2. Активация: удаляем старые версии кэша, если обновился CACHE_NAME
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Удаление старого кэша:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Берем под контроль все открытые вкладки
  );
});

// 3. Обработка запросов (Перехват сетевого трафика)
self.addEventListener('fetch', (event) => {
  // Игнорируем запросы к расширениям браузера или отличные от GET
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Стратегия: Сначала кэш, параллельно обновляем его из сети (Stale-While-Revalidate)
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Проверяем валидность ответа сети перед записью в кэш
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Если сеть недоступна, запрос просто провалится, но вернется ответ из кэша ниже
        console.log('[Service Worker] Сеть недоступна, используется офлайн-кэш');
      });

      // Возвращаем ресурс из кэша мгновенно (если есть), либо ждем ответа сети
      return cachedResponse || fetchPromise;
    })
  );
});
