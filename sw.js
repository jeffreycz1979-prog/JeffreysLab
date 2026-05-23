// Jeffrey's Lab - Service Worker
// 更新快取版本號時，舊快取會自動清除
const CACHE_NAME = 'jeffreyslab-v2';

// 預先快取的檔案清單（根目錄為 /JeffreysLab/）
const PRECACHE_URLS = [
  '/JeffreysLab/tools.html',
  '/JeffreysLab/index.html',

  // 課堂互動
  '/JeffreysLab/tool_package.html',   // 獎勵樂透、分數紀錄器、重組單字、重組句子
  '/JeffreysLab/timer.html',
  '/JeffreysLab/bouncy_classroom.html',

  // 字彙練習
  '/JeffreysLab/flashcard_match.html',

  // 單字防禦戰
  '/JeffreysLab/word-defense.html',
  '/JeffreysLab/word-defense2.html',
  '/JeffreysLab/word-defense3.html',

  // 教學小遊戲
  '/JeffreysLab/spaceshuttle.html',
  '/JeffreysLab/jump.html',
  '/JeffreysLab/dragonslayer.html',
  '/JeffreysLab/bounceball.html',
  '/JeffreysLab/spaceshooter.html',
  '/JeffreysLab/hangman2.html',
  '/JeffreysLab/melting_iceberg.html',

  // AI 出題
  '/JeffreysLab/wordsearch.html',
  '/JeffreysLab/connect.html',
  '/JeffreysLab/grammar.html',
  '/JeffreysLab/quiz.html',
  '/JeffreysLab/crossword.html',

  // 視覺教學
  '/JeffreysLab/vision-detective.html',
];

// ── 安裝：預先快取所有工具 ──────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 預先快取工具檔案...');
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      // 強制跳過等待，立即接管頁面
      return self.skipWaiting();
    })
  );
});

// ── 啟用：清除舊版快取 ────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] 清除舊快取:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── 攔截請求：快取優先，失敗才連網 ──────────────────────
self.addEventListener('fetch', (event) => {
  // 只處理 GET 請求，跳過 API / GAS 請求
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('script.google.com')) return;
  if (event.request.url.includes('googleapis.com')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // 有快取：回傳快取，同時在背景更新
        const fetchUpdate = fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          }
          return response;
        }).catch(() => {});
        return cached;
      }
      // 無快取：直接連網，成功後存入快取
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      });
    })
  );
});
