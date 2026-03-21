const CACHE = 'aqli-v3';
const ASSETS = ['/', '/index.html', 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/index.html'])));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // API calls — always network, never cache
  if(e.request.url.includes('anthropic.com')){
    e.respondWith(fetch(e.request).catch(()=>new Response(JSON.stringify({content:[{text:'⚠️ المدرب الذكي يحتاج إنترنت.'}]}),{headers:{'Content-Type':'application/json'}})));
    return;
  }
  // Everything else — cache first
  e.respondWith(caches.match(e.request).then(cached => {
    if(cached) return cached;
    return fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match('/index.html'));
  }));
});
