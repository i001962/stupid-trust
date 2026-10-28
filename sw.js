/* Stupid Trust service worker.
   NOTE: bump CACHE (e.g. stupid-trust-v13 -> stupid-trust-v14) whenever
   index.html changes, or installed apps may keep
   serving the old cached copy. The navigation handler below is
   network-first, so online users still get fresh HTML, but the
   cache name bump is what retires old offline copies on activate. */
const CACHE = 'stupid-trust-v13';
const LOCAL_FILES = [
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon.svg',
  './sw.js'
];

self.addEventListener('install', event => {
  // Precache ONLY local files, so install never fails because the
  // jsDelivr Gun CDN is unreachable. CDN scripts are cached at
  // runtime on first successful fetch (see the fetch handler).
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(LOCAL_FILES))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => (key.indexOf('safecall-') === 0 || key.indexOf('stupid-trust-') === 0) && key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Navigation: network-first so an online user always gets the
  // newest page; fall back to the cached page when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(new Request(req, {cache: 'reload'}))
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(cache => cache.put('./index.html', copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match('./index.html', { ignoreSearch: true }))
    );
    return;
  }

  // jsDelivr Gun / SEA: network-first, falling back to whatever was
  // cached on a previous successful load.
  if (url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(cache => cache.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Other same-origin requests: cache-first, falling back to network.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(cache => cache.put(req, copy)).catch(() => {});
          }
          return res;
        });
      }).catch(() => fetch(req))
    );
    return;
  }

  // Anything else: leave it to the network.
});
