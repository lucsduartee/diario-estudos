// Troque a versão a cada deploy para o app instalado buscar os arquivos novos.
const CACHE = "diario-v12";
const ASSETS = ["./", "index.html", "app.css", "plan.js", "app.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png",
  "roadmap/cyber.json", "roadmap/elet.json", "roadmap/fac.json", "roadmap/des.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Cache-first: assets locais e Google Fonts entram no cache na primeira visita.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return res;
  })));
});
