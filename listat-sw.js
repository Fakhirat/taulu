/* Keeps the lists app openable without a connection.
   Scope is only listat* (registered with scope "./listat"), so the board and the kid page are never touched.
   Only the named files are cached, under their plain address; nothing with a query string is stored. */
const CACHE = 'listat-v2';
const SHELL = ['listat.html', 'config.js', 'listat.webmanifest', 'listat-192.png', 'listat-512.png', 'listat-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  // the old version cached every page load and update check; drop it completely
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function shellName(url) {
  if (url.origin !== location.origin || url.search) return '';
  const name = url.pathname.split('/').pop();
  return SHELL.indexOf(name) >= 0 ? name : '';
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const name = shellName(url);
  if (name) {
    // network first, the cached copy when offline
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(name, copy)); }
      return res;
    }).catch(() => caches.match(name).then(r => r || caches.match('listat.html'))));
  } else if (url.hostname === 'fonts.gstatic.com' || url.hostname === 'fonts.googleapis.com') {
    // fonts: cache first
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  }
  // everything else (Apps Script, Föli, other pages, update checks) goes straight to the network
});
