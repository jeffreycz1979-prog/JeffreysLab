// 英文順起來．探索英文島 - Service Worker（scope：/JeffreysLab/english-island/）
// 頁面與程式改成網路優先；改了檔案仍建議把版本號 +1，舊快取會自動清除
const CACHE_NAME = 'eisland-v23';

const PRECACHE_URLS = [
  '/JeffreysLab/english-island/',
  '/JeffreysLab/english-island/index.html',
  '/JeffreysLab/english-island/manifest.json',
  '/JeffreysLab/english-island/grammar.json',
  '/JeffreysLab/english-island/island3d.js?v=2',
  '/JeffreysLab/english-island/games/jump.js?v=1.5',
  '/JeffreysLab/english-island/games/blaster.js?v=1.5',
  '/JeffreysLab/english-island/games/run.js?v=1.1',
  '/JeffreysLab/english-island/games/shoot.js?v=0.6',
  '/JeffreysLab/english-island/games/dino.js?v=0.6',
  '/JeffreysLab/english-island/cloud.js?v=2',
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
      names.filter((n) => n.startsWith('eisland-') && n !== CACHE_NAME)
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

  // 自己的頁面與程式（HTML、JS、JSON）：網路優先，3 秒沒回應或離線才用快取 → 更新開一次就生效
  const own = url.includes('/JeffreysLab/english-island/') && (req.mode === 'navigate' || /\.(html|js|json)(\?|$)/.test(url) || url.endsWith('/'));
  if (own) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const res = await Promise.race([fetch(req, { cache: 'no-store' }), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000))]);
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      } catch (e) {
        return (await cache.match(req)) || (await cache.match(req, { ignoreSearch: true })) || Response.error();
      }
    })());
    return;
  }

  // 其餘（圖示、Google Fonts）：快取優先，背景更新
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
