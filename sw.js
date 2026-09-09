/* Service worker: rende l'app utilizzabile offline in campo. */
const VERSION = 'tecnica-v1';
const CORE = [
  './', './index.html', './style.css', './app.js', './data/plan.json', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then(async (cache) => {
      await cache.addAll(CORE);
      // Pre-carica i diagrammi in background (non blocca l'installazione).
      try {
        const plan = await (await fetch('./data/plan.json')).json();
        const imgs = [];
        plan.sessions.forEach(s => s.exercises.forEach(ex => imgs.push('./' + ex.img)));
        await Promise.allSettled(imgs.map(u => cache.add(u)));
      } catch (err) { /* offline al primo avvio: le immagini si caricano dopo */ }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.ok && new URL(e.request.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
