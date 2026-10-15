// THP11 單字挑戰 - Service Worker（scope：/JeffreysLab/vocab-thp11/）
// 改了 index.html 之後把版本號 +1，舊快取會自動清除
const CACHE_NAME = 'thp11-v13';

const PRECACHE_URLS = [
  '/JeffreysLab/vocab-thp11/',
  '/JeffreysLab/vocab-thp11/index.html',
  '/JeffreysLab/vocab-thp11/manifest.json',
  '/JeffreysLab/vocab-thp11/grammar.json',
  '/JeffreysLab/icons/icon-192.png',
  '/JeffreysLab/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n.startsWith('thp11-') && n !== CACHE_NAME)
           .map((n) => caches.delete(n))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = req.url;

  // Gateway（TTS）與 Google Sheet CSV：不經 SW，由頁面自己處理快取
  if (url.includes('script.google.com')) return;
  if (url.includes('docs.google.com') || url.includes('googleusercontent.com')) return;

  // 其餘（頁面、圖示、Google Fonts）：快取優先，背景更新
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
