/* حي أجيال — Service Worker (يعمل offline + قابل للتثبيت كتطبيق) */
const CACHE = 'ajyal-v1';
const CORE = [
  './', './index.html', './ajyal.png', './icon-192.png', './icon-512.png', './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* الشبكة أولًا مع رجوع للكاش عند عدم وجود إنترنت */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() =>
      caches.match(req).then(m => m || caches.match('./index.html'))
    )
  );
});
