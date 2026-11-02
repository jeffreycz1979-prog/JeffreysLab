// 英文順起來．探索英文島 - 群島碼頭（archipelago.js v1，2026/11/02）
// 每座島（thp5、thc6…）都載入這一支：首頁「⛵ 群島碼頭」→ 海上看到所有島，點了可以搭船過去
// 用到頁面上的共用小工具：$、L、esc、toast（每座島的 index.html 都有）
//
// ── 誰可以去哪座島 ──
//   ISLAND_ACCESS = 'own'：只能進自己班的島（看得到其他島，但是鎖住）；老師帳號（名冊班級填「老師」）每座都能進
//   ISLAND_ACCESS = 'all'：每座都能進
//   之後要開放，只改這一行
// ── 新增一座島 ──
//   在 ISLANDS 加一筆：id＝資料夾名稱、cls＝v2 班級完整名稱（可以好幾個班共用一座島）、pts＝海岸線（跟那座島 index.html 的 ISLAND_THEME.pts 一樣）
(() => {
  const ISLAND_ACCESS = 'own';
  const ISLANDS = [
    { id: 'thp5', name: ['綠野春天島', 'Spring Meadow Island'], book: 'Tree House 5', cls: ['THP5'], icon: '🌳',
      sea: '#C9EEEA', sand: '#F4F1EB', grass: '#D5EBB4', at: [100, 150], k: 0.36,
      pts: [[44, 432], [4, 372, 6, 262, 30, 196], [50, 132, 16, 70, 84, 34], [150, 2, 270, -4, 330, 34], [386, 72, 380, 160, 370, 228], [360, 300, 386, 382, 326, 430], [262, 470, 104, 474, 44, 432]] },
    { id: 'thc6', name: ['秋楓城堡島', 'Maple Castle Island'], book: 'Tree House C6', cls: ['G2/THC6'], icon: '🏰',
      sea: '#AFCBEB', sand: '#F6ECD8', grass: '#EED9A2', at: [282, 128], k: 0.36,
      pts: [[40, 440], [0, 384, -2, 270, 22, 200], [40, 140, 4, 64, 70, 30], [130, -4, 230, 6, 290, 14], [350, 22, 396, 60, 380, 130], [366, 180, 394, 214, 384, 262], [374, 330, 394, 400, 330, 440], [250, 486, 100, 480, 40, 440]] },
  ];
  const HERE = (location.pathname.split('/')[2] || '').toLowerCase();
  const me = () => (window.cloud && window.cloud.auth ? window.cloud.auth() : null);
  const isTeacher = () => { const a = me(); return !!(a && a.cls === '老師'); };
  function canGo(is) {
    if (is.id === HERE) return true;
    if (ISLAND_ACCESS === 'all' || isTeacher()) return true;
    const a = me(); return !!(a && is.cls.includes(a.cls));
  }
  // 海岸線 → SVG path（縮小 k 倍，中心放在 at）
  function path(is) {
    const [ox, oy] = is.at, f = (x, y) => `${(ox + (x - 195) * is.k).toFixed(1)} ${(oy + (y - 230) * is.k).toFixed(1)}`;
    const g = (k2) => { const F = (x, y) => f(195 + (x - 195) * k2, 230 + (y - 230) * k2), p = is.pts;
      return 'M' + F(p[0][0], p[0][1]) + p.slice(1).map((q) => ` C${F(q[0], q[1])} ${F(q[2], q[3])} ${F(q[4], q[5])}`).join('') + ' Z'; };
    return { shore: g(1), grass: g(0.9) };
  }
  function mapSVG() {
    const W = (x, y) => `<path class="wave" d="M${x} ${y} q8 -6 16 0 t16 0" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>`;
    const isles = ISLANDS.map((is) => {
      const P = path(is), here = is.id === HERE, ok = canGo(is), [x, y] = is.at;
      return `<g class="arch-isle ${ok ? '' : 'arch-lk'}" data-arch="${is.id}" role="button" tabindex="0" aria-label="${esc(is.name[0])}">
        <path d="${P.shore}" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="10" stroke-linejoin="round"/>
        <path d="${P.shore}" fill="${is.sand}" stroke="#1a3a1a" stroke-width="2"/><path d="${P.grass}" fill="${is.grass}"/>
        <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="44">${is.icon}</text>
        ${here ? `<g class="bobb"><text x="${x + 34}" y="${y - 52}" text-anchor="middle" font-size="26">📍</text></g>` : ''}
        ${!ok ? `<circle cx="${x}" cy="${y - 6}" r="22" fill="#ffffff" stroke="#1a3a1a" stroke-width="2"/><text x="${x}" y="${y + 3}" text-anchor="middle" font-size="22">🔒</text>` : ''}
        <rect x="${x - 62}" y="${y + 92}" width="124" height="24" rx="12" fill="${here ? '#1a3a1a' : '#ffffff'}" stroke="#1a3a1a" stroke-width="2"/>
        <text x="${x}" y="${y + 108.5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${here ? '#CCFF00' : '#1a3a1a'}">${esc(L(is.name[0], is.name[1]))}</text></g>`;
    }).join('');
    return `<svg viewBox="0 0 390 300" class="arch-map" role="group" aria-label="${L('群島地圖', 'Archipelago map')}">
      <rect width="390" height="300" rx="18" fill="#9CD3E8"/>
      ${W(20, 30)}${W(170, 22)}${W(330, 270)}${W(16, 280)}${W(180, 200)}
      <path d="M150 150 Q190 120 232 136" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="3 8" stroke-linecap="round"/>
      <g class="bobb"><text x="192" y="128" text-anchor="middle" font-size="22">⛵</text></g>
      <g opacity=".55"><ellipse cx="320" cy="262" rx="34" ry="12" fill="#E9E4D6" stroke="#1a3a1a" stroke-width="1.5" stroke-dasharray="4 4"/>
        <text x="320" y="267" text-anchor="middle" font-size="13" font-weight="800" fill="#1a3a1a">？</text></g>
      ${isles}</svg>`;
  }
  function open() {
    const a = me();
    const rows = ISLANDS.map((is) => {
      const here = is.id === HERE, ok = canGo(is);
      const st8 = here ? `<b class="arch-tag here">📍 ${L('你在這裡', 'You are here')}</b>` : ok ? `<button class="btn" data-arch="${is.id}">${L('搭船過去 ⛵', 'Sail ⛵')}</button>` : `<b class="arch-tag">🔒 ${L('還沒開放', 'Locked')}</b>`;
      return `<div class="arch-row"><span class="arch-ic" style="background:${is.sea}">${is.icon}</span><div><b>${esc(L(is.name[0], is.name[1]))}</b><small>${esc(is.book)}・${esc(is.cls.join('、'))}</small></div>${st8}</div>`;
    }).join('');
    $('sheet').innerHTML = `<h3 style="margin-top:0">⛵ ${L('群島碼頭', 'Island Harbor')} <small>ARCHIPELAGO</small></h3>
      ${mapSVG()}
      <div class="arch-list">${rows}</div>
      <p class="note">${isTeacher() ? L('👩‍🏫 老師帳號：每座島都可以去巡島。', '👩‍🏫 Teacher: you can visit every island.')
        : L('每一班有自己的島。其他島嶼現在先鎖住，之後老師會開放讓大家互相拜訪！右下角的「？」是之後升級要去的新島。', 'Each class has its own island. Others are locked for now.')}</p>
      ${a ? '' : `<p class="note" style="color:#FF6B57">${L('登入雲端帳號之後，才知道你是哪一班喔。', 'Log in so we know your class.')}</p>`}
      <div class="btnrow"><button class="btn ghost" data-close="1">${L('關閉', 'Close')}</button></div>`;
    $('modal').classList.add('show'); $('sheet').scrollTop = 0;
  }
  function go(id) {
    const is = ISLANDS.find((x) => x.id === id); if (!is) return;
    if (id === HERE) { $('modal').classList.remove('show'); return; }
    if (!canGo(is)) return toast(L(`🔒 ${is.name[0]}還沒開放`, `🔒 ${is.name[1]} is locked`));
    toast(L(`⛵ 出發去${is.name[0]}！每座島的進度分開算`, `⛵ Sailing to ${is.name[1]}!`));
    setTimeout(() => { location.href = '/JeffreysLab/' + is.id + '/'; }, 700);
  }
  function renderBtn() {
    const b = document.getElementById('islandDock'); if (!b) return;
    b.innerHTML = `<i>⛵</i><span>${L('群島碼頭', 'Island Harbor')}<small>${L('看看海上的其他島嶼', 'See the other islands')}</small></span><b>${ISLANDS.length} ${L('座島', 'islands')}</b>`;
  }
  const css = document.createElement('style');
  css.textContent = `.arch-map{width:100%;display:block;border-radius:18px;border:2px solid #1a3a1a;margin:6px 0 10px}
    .arch-isle{cursor:pointer}.arch-isle.arch-lk>path{filter:grayscale(.75) brightness(.95)}.arch-isle.arch-lk>text{opacity:.45}
    .arch-map .wave{animation:isWave 2.8s ease-in-out infinite alternate}.arch-map .bobb{animation:isBob 2.2s ease-in-out infinite alternate}
    .arch-list{display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
    .arch-row{display:flex;align-items:center;gap:10px;background:var(--panel);border:1.5px solid var(--line);border-radius:16px;padding:10px 12px}
    .arch-row>div{flex:1;min-width:0}.arch-row b{display:block}.arch-row small{display:block;color:var(--muted);font-size:12px}
    .arch-ic{flex:none;width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-size:24px;border:1.5px solid #1a3a1a}
    .arch-tag{font-size:13px;white-space:nowrap;color:var(--muted)}.arch-tag.here{color:var(--lime)}
    @media (prefers-reduced-motion:reduce){.arch-map .wave,.arch-map .bobb{animation:none}}`;
  document.head.appendChild(css);
  document.addEventListener('click', (e) => {
    const d = e.target.closest('#islandDock'); if (d) { e.stopPropagation(); return open(); }
    const t = e.target.closest('[data-arch]'); if (t && document.getElementById('modal').contains(t)) { e.stopPropagation(); go(t.dataset.arch); }
  }, true);
  window.archipelago = { open, go, render: renderBtn, islands: ISLANDS };
  if (document.readyState !== 'loading') renderBtn(); else document.addEventListener('DOMContentLoaded', renderBtn);
  addEventListener('island-ready', renderBtn);
})();
