// 英文島 THC6 班級版 - Service Worker（scope：/JeffreysLab/thc6/）
// 頁面與程式改成網路優先；改了檔案仍建議把版本號 +1，舊快取會自動清除
const CACHE_NAME = 'thc6-v12';

const PRECACHE_URLS = [
  '/JeffreysLab/thc6/',
  '/JeffreysLab/thc6/index.html',
  '/JeffreysLab/thc6/manifest.json',
  '/JeffreysLab/thc6/grammar.json',
  '/JeffreysLab/thc6/words.csv',
  '/JeffreysLab/thc6/island3d.js?v=6',
  '/JeffreysLab/thc6/games/jump.js?v=1.5',
  '/JeffreysLab/thc6/games/blaster.js?v=1.5',
  '/JeffreysLab/thc6/games/run.js?v=1.1',
  '/JeffreysLab/thc6/games/shoot.js?v=0.8',
  '/JeffreysLab/thc6/games/dino.js?v=0.6',
  '/JeffreysLab/thc6/games/horde.js?v=0.4',
  '/JeffreysLab/thc6/cloud.js?v=8',
  '/JeffreysLab/thc6/msg.js?v=7',
  '/JeffreysLab/thc6/grant.js?v=1',
  '/JeffreysLab/archipelago.js?v=3',
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
      names.filter((n) => n.startsWith('thc6-') && n !== CACHE_NAME)
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
  const own = url.includes('/JeffreysLab/thc6/') && (req.mode === 'navigate' || /\.(html|js|json|csv)(\?|$)/.test(url) || url.endsWith('/'));
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
