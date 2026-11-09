/* global URL, caches, fetch, self, Response */

const CACHE_NAME = 'portfolio-pwa-v7';

const APP_SHELL_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/agent/',
  '/agent/style.css',
  '/agent/copy.js',
  '/llms.txt',
];

// The retro desktop's shell (about 890 KB of pictures) is only fetched for the desktop: when it is
// the desktop that installs the worker, or once it is visited. A visit to the Vitrine never pays for it.
const DESKTOP_SHELL_URLS = [
  '/desktop/',
  '/desktop/manifest.webmanifest',
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

const isDesktopPath = (pathname) => pathname === '/desktop' || pathname.startsWith('/desktop/');

/** Stores the desktop's shell, skipping what is already there. */
const cacheDesktopShell = async () => {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(
    DESKTOP_SHELL_URLS.map(async (url) => {
      if (!(await cache.match(url))) await cache.add(url);
    }),
  );
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(APP_SHELL_URLS.map((url) => cache.add(url)));
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      if (windows.some((client) => isDesktopPath(new URL(client.url).pathname))) await cacheDesktopShell();
    })(),
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
    // A worker installed from the Vitrine fetches the desktop's shell on the first visit to the desktop.
    if (page === '/desktop/') event.waitUntil(cacheDesktopShell());
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
