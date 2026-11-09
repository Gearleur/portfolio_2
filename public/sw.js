/* global URL, caches, fetch, self, Response */

const CACHE_NAME = 'portfolio-pwa-v7';

const APP_SHELL_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/desktop/',
  '/desktop/manifest.webmanifest',
  '/agent/',
  '/agent/style.css',
  '/agent/copy.js',
  '/llms.txt',
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

const OFFLINE_PAGES = new Map([
  ['/', '/'],
  ['/index.html', '/'],
  ['/desktop', '/desktop/'],
  ['/desktop/', '/desktop/'],
  ['/desktop/index.html', '/desktop/'],
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(APP_SHELL_URLS.map((url) => cache.add(url))),
    ),
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

  const url = new URL(request.url);
  // Revalidate mutable CV files instead of retaining an old version indefinitely.
  // Text exports are deliberately not stored in the offline cache.
  if (url.origin === self.location.origin &&
      ['/agent/profile.md', '/agent/profile.json', '/agent/context.txt', '/documents/cv-en.pdf', '/documents/cv-fr.pdf'].includes(url.pathname)) {
    event.respondWith(fetch(request));
    return;
  }
  if (url.origin === self.location.origin &&
      (url.pathname === '/agent' || url.pathname.startsWith('/agent/') || url.pathname === '/llms.txt')) {
    const cacheKey = url.pathname === '/agent' || url.pathname === '/agent/index.html' ? '/agent/' : request;
    event.respondWith(
      fetch(request).then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(cacheKey, response.clone());
        }
        return response;
      }).catch(async () => (await caches.match(cacheKey)) ?? Response.error()),
    );
    return;
  }

  // The Vitrine (/) and the desktop (/desktop/) open offline: each page is kept as it is visited,
  // and is what an offline visit gets.
  const page = url.origin === self.location.origin ? OFFLINE_PAGES.get(url.pathname) : undefined;
  if (request.mode === 'navigate' && page) {
    event.respondWith(
      fetch(request).then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(page, response.clone());
        }
        return response;
      }).catch(async () => (await caches.match(page)) ?? Response.error()),
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => (url.pathname.startsWith('/cv/') ? undefined : await caches.match('/')) ?? Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse.ok && new URL(request.url).origin === self.location.origin) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        }

        return networkResponse;
      });
    }),
  );
});
