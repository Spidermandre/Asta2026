/* Service worker: rende l'app utilizzabile offline in campo. */
const VERSION = 'tecnica-m1-v2';
const CORE = [
  './', './index.html', './style.css', './app.js', './data/mese1.json', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then(async (cache) => {
      await cache.addAll(CORE);
      // Pre-carica i diagrammi: sono pochi e servono in campo, spesso senza rete.
      try {
        const dati = await (await fetch('./data/mese1.json')).json();
        const img = [];
        dati.sessions.forEach(s => s.exercises.forEach(ex => img.push('./' + ex.img)));
        await Promise.allSettled(img.map(u => cache.add(u)));
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
