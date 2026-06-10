/* global caches, fetch, self */

const CACHE_NAME = 'portfolio-pwa-v1';

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/pwa-icon.svg',
  '/assets/iphone6_top.svg',
  '/assets/iphone6_bottom.svg',
  '/assets/wallpapper_mobile3.jpg',
  '/assets/icons/mobile/CV.png',
  '/assets/icons/mobile/education.png',
  '/assets/icons/mobile/projects.png',
  '/assets/icons/mobile/experience.png',
  '/assets/icons/mobile/technical-skills.png',
  '/assets/icons/mobile/languages.png',
  '/assets/icons/mobile/extracurricular-experience.png',
  '/assets/icons/mobile/internet-explorer.png',
  '/assets/icons/mobile/Phone.png',
  '/assets/icons/mobile/Messages.png',
  '/assets/icons/mobile/Mail.png',
  '/assets/icons/mobile/Apple-Music.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html')),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      });
    }),
  );
});
