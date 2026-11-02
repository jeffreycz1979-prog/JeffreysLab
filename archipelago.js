// 英文順起來．探索英文島 - 群島（archipelago.js v2，2026/11/02）
// 每座島（thp5、thc6、vocab-thp11…）都載入這一支
//   首頁一打開＝群島全景：所有島在同一片海上，自己的島有 📍；點自己的島 → 鏡頭放大進島（看單元地圖）
//   島內右上角「🌏 群島」→ 拉遠回到全景；點別的島 → 搭船過去（換網址，每座島進度分開）
// 用到頁面上的共用小工具：$、L、esc、toast、renderIsland、allUnits、unitStations（每座島的 index.html 都有）
//
// ── 誰可以去哪座島 ──
//   ISLAND_ACCESS = 'own'：只能進自己班的島（看得到其他島，但是鎖住）；老師帳號（名冊班級填「老師」）每座都能進
//   ISLAND_ACCESS = 'all'：每座都能進
// ── 新增一座島 ──
//   ISLANDS 加一筆：id＝資料夾名稱、cls＝v2 班級名稱（可以好幾班共用一座島）、pts＝海岸線（跟那座島 index.html 的 ISLAND_THEME.pts 一樣）
//   at＝在全景海上的位置（全景 viewBox 390×460）、deco＝島上的小圖示 [emoji, x, y, 大小]（用島自己的 390×460 座標）
(() => {
  const ISLAND_ACCESS = 'own';
  const K = 0.38, LY = Math.round(250 * K);   // LY＝島名牌在島中心下方多遠   // 全景裡每座島的縮小比例
  const ISLANDS = [
    { id: 'thp5', name: ['綠野春天島', 'Spring Meadow Island'], book: 'Tree House 5', cls: ['THP5'], icon: '🌳',
      sea: '#C9EEEA', sand: '#F4F1EB', grass: '#D5EBB4', at: [100, 104],
      pts: [[44, 432], [4, 372, 6, 262, 30, 196], [50, 132, 16, 70, 84, 34], [150, 2, 270, -4, 330, 34], [386, 72, 380, 160, 370, 228], [360, 300, 386, 382, 326, 430], [262, 470, 104, 474, 44, 432]],
      deco: [['🌳', 110, 96, 70], ['🌲', 170, 70, 60], ['⛰️', 330, 210, 90], ['🌸', 120, 420, 50], ['🦆', 196, 230, 50], ['🌳', 290, 400, 66]] },
    { id: 'thc6', name: ['秋楓城堡島', 'Maple Castle Island'], book: 'Tree House C6', cls: ['G2/THC6'], icon: '🏰',
      sea: '#AFCBEB', sand: '#F6ECD8', grass: '#EED9A2', at: [292, 162],
      pts: [[40, 440], [0, 384, -2, 270, 22, 200], [40, 140, 4, 64, 70, 30], [130, -4, 230, 6, 290, 14], [350, 22, 396, 60, 380, 130], [366, 180, 394, 214, 384, 262], [374, 330, 394, 400, 330, 440], [250, 486, 100, 480, 40, 440]],
      deco: [['🍁', 100, 96, 66], ['🍂', 180, 70, 50], ['🏰', 320, 210, 100], ['🔮', 196, 236, 54], ['🎃', 120, 320, 54], ['🍁', 290, 410, 66]] },
    { id: 'vocab-thp11', name: ['火山椰林島', 'Volcano Palm Island'], book: 'THP11', cls: ['THP11'], icon: '🌋',
      sea: '#7FD6DC', sand: '#FFF0CF', grass: '#B6DE95', at: [156, 326],
      pts: [[50, 440], [10, 400, 0, 300, 14, 230], [26, 160, 0, 90, 60, 40], [120, -10, 270, -6, 330, 40], [390, 86, 392, 180, 376, 250], [364, 300, 330, 330, 350, 380], [372, 430, 300, 470, 200, 462], [120, 458, 80, 460, 50, 440]],
      deco: [['🌴', 110, 96, 70], ['🛖', 180, 70, 50], ['🌋', 326, 220, 100], ['🌴', 140, 330, 60], ['🐚', 200, 440, 40], ['🌴', 290, 410, 70]] },
  ];
  const HERE = (location.pathname.split('/')[2] || '').toLowerCase();
  const me = () => (window.cloud && window.cloud.auth ? window.cloud.auth() : null);
  const isTeacher = () => { const a = me(); return !!(a && a.cls === '老師'); };
  function canGo(is) {
    if (is.id === HERE) return true;
    if (ISLAND_ACCESS === 'all' || isTeacher()) return true;
    const a = me(); return !!(a && is.cls.includes(a.cls));
  }
  const here = () => ISLANDS.find((x) => x.id === HERE);
  let inside = false, busy = false;   // inside＝放大在自己的島裡（看單元地圖）

  // 島的座標（390×460）→ 全景座標
  const P = (is, x, y, k2 = 1) => [is.at[0] + (195 + (x - 195) * k2 - 195) * K, is.at[1] + (230 + (y - 230) * k2 - 230) * K];
  function shore(is, k2) {
    const f = (x, y) => P(is, x, y, k2).map((v) => v.toFixed(1)).join(' '), p = is.pts;
    return 'M' + f(p[0][0], p[0][1]) + p.slice(1).map((q) => ` C${f(q[0], q[1])} ${f(q[2], q[3])} ${f(q[4], q[5])}`).join('') + ' Z';
  }
  function progress() {
    try { const us = allUnits(); const full = us.filter((u) => unitStations(u).full).length; return L(`蓋好 ${full} / ${us.length} 座`, `${full} / ${us.length} built`); } catch (e) { return ''; }
  }
  function isleSVG(is) {
    const own = is.id === HERE, ok = canGo(is), [x, y] = is.at;
    const deco = is.deco.map(([e, dx, dy, s]) => { const [px, py] = P(is, dx, dy); return `<text x="${px.toFixed(1)}" y="${py.toFixed(1)}" text-anchor="middle" font-size="${(s * K).toFixed(1)}">${e}</text>`; }).join('');
    return `<g class="arch-isle ${ok ? '' : 'arch-lk'} ${own ? 'arch-own' : ''}" data-arch="${is.id}" role="button" tabindex="0" aria-label="${esc(is.name[0])}">
      ${own ? `<path class="arch-glow" d="${shore(is, 1.12)}" fill="none" stroke="#CCFF00" stroke-width="5" stroke-linejoin="round"/>` : ''}
      <path d="${shore(is, 1.06)}" fill="none" stroke="#ffffff" stroke-opacity=".6" stroke-width="7" stroke-linejoin="round"/>
      <path d="${shore(is, 1)}" fill="${is.sand}" stroke="#1a3a1a" stroke-width="1.8"/><path d="${shore(is, 0.9)}" fill="${is.grass}"/>
      <g class="arch-deco">${deco}</g>
      ${own ? `<g class="arch-pin"><text x="${x + 50}" y="${y - 64}" text-anchor="middle" font-size="26">📍</text></g>` : ''}
      ${!ok ? `<circle cx="${x}" cy="${y - 4}" r="17" fill="#ffffff" stroke="#1a3a1a" stroke-width="2"/><text x="${x}" y="${y + 3}" text-anchor="middle" font-size="17">🔒</text>` : ''}
      <rect x="${x - 58}" y="${y + LY}" width="116" height="22" rx="11" fill="${own ? '#1a3a1a' : '#ffffff'}" stroke="#1a3a1a" stroke-width="1.8"/>
      <text x="${x}" y="${y + LY + 15.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${own ? '#CCFF00' : '#1a3a1a'}">${esc(L(is.name[0], is.name[1]))}</text>
      ${own ? `<text x="${x}" y="${y + LY + 34}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1a3a1a">${esc(progress())}・${L('點我進島 ▶', 'Tap to enter ▶')}</text>`
        : `<text x="${x}" y="${y + LY + 33}" text-anchor="middle" font-size="10" font-weight="700" fill="#1a3a1a" opacity=".7">${esc(is.cls.join('、'))}</text>`}</g>`;
  }
  function worldSVG() {
    const W = (x, y) => `<path class="arch-wave" d="M${x} ${y} q8 -6 16 0 t16 0" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>`;
    const route = (a, b) => { const [x1, y1] = a.at, [x2, y2] = b.at, mx = (x1 + x2) / 2 + (y2 - y1) * 0.15, my = (y1 + y2) / 2 - (x2 - x1) * 0.15; return `<path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-dasharray="3 8" stroke-linecap="round" opacity=".8"/>`; };
    const [a, b, c] = ISLANDS;
    return `<rect width="390" height="460" fill="#8CCBE3"/>
      <g opacity=".55">${[[30, 40, 70], [300, 50, 50], [350, 330, 60], [210, 440, 80], [20, 230, 40]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#A6DAEC"/>`).join('')}</g>
      ${W(18, 26)}${W(200, 30)}${W(330, 110)}${W(20, 228)}${W(210, 300)}${W(330, 430)}${W(16, 446)}
      ${route(a, b)}${route(a, c)}${route(c, b)}
      <g class="arch-boat"><text x="200" y="110" text-anchor="middle" font-size="20">⛵</text></g>
      <g class="arch-boat2"><text x="220" y="330" text-anchor="middle" font-size="18">🚤</text></g>
      <g opacity=".6"><path d="M290 404 q34 -26 68 0 q-34 14 -68 0 Z" fill="#E9E4D6" stroke="#1a3a1a" stroke-width="1.5" stroke-dasharray="4 4"/>
        <text x="324" y="404" text-anchor="middle" font-size="15" font-weight="800" fill="#1a3a1a">？</text>
        <text x="324" y="426" text-anchor="middle" font-size="10" font-weight="700" fill="#1a3a1a">${L('下一座島', 'Next island')}</text></g>
      <g class="arch-cloud"><text x="250" y="70" font-size="26" opacity=".9">☁️</text></g><g class="arch-cloud" style="animation-delay:-9s"><text x="40" y="196" font-size="22" opacity=".9">☁️</text></g>
      ${ISLANDS.map(isleSVG).join('')}`;
  }
  // 放大到自己的島：全景裡的島（中心 at、縮小 K）放大 1/K 倍並移到中間，剛好疊在單元地圖上
  const zoomT = () => { const h = here(); if (!h) return ''; const s = 1 / K; return `translate(195px,230px) scale(${s}) translate(${-h.at[0]}px,${-h.at[1]}px)`; };
  function ensureView() {
    let v = document.getElementById('archView');
    if (!v) {
      const isl = document.getElementById('island'); if (!isl) return null;
      v = document.createElement('div'); v.id = 'archView'; v.className = 'arch-view';
      isl.parentNode.insertBefore(v, isl);
    }
    let b = document.getElementById('archBack');
    if (!b) {
      const tog = document.getElementById('mapTog'); if (tog) {
        b = document.createElement('button'); b.id = 'archBack'; b.className = 'map-tog'; b.textContent = L('🌏 群島', '🌏 Islands');
        b.setAttribute('aria-label', L('拉遠看群島', 'Zoom out to all islands'));
        tog.parentNode.insertBefore(b, tog);
      }
    }
    return v;
  }
  function render() {
    renderBtn();
    const v = ensureView(); if (!v || !here()) return;
    const isl = $('island'), i3 = $('island3d'), tog = $('mapTog'), back = $('archBack'), decl = document.getElementById('declStrip');
    if (back) back.textContent = L('🌏 群島', '🌏 Islands');
    if (inside) { v.hidden = true; if (back) back.style.display = ''; return; }
    if (!busy) v.innerHTML = `<svg viewBox="0 0 390 460" role="group" aria-label="${L('群島地圖', 'Archipelago map')}"><g class="arch-world">${worldSVG()}</g></svg>`;
    v.hidden = false; isl.hidden = true; i3.hidden = true;
    if (tog) tog.style.display = 'none'; if (back) back.style.display = 'none'; if (decl) decl.hidden = true;
    const sum = $('islandSum'); if (sum) sum.textContent = L(`群島・${ISLANDS.length} 座島`, `${ISLANDS.length} islands`);
  }
  function zoomIn() {
    if (busy || inside) return; busy = true;
    const v = $('archView'), w = v && v.querySelector('.arch-world'); if (!w) { busy = false; return; }
    v.classList.add('zooming'); w.style.transform = zoomT();
    setTimeout(() => {
      inside = true; busy = false; v.classList.remove('zooming');
      renderIsland();
      const isl = use3DSafe() ? $('island3d') : $('island'); isl.classList.add('arch-fadein'); setTimeout(() => isl.classList.remove('arch-fadein'), 500);
    }, 720);
  }
  const use3DSafe = () => { try { return use3D(); } catch (e) { return false; } };
  function zoomOut() {
    if (busy || !inside) return; busy = true; inside = false;
    const v = ensureView();
    v.innerHTML = `<svg viewBox="0 0 390 460"><g class="arch-world" style="transform:${zoomT()}">${worldSVG()}</g></svg>`;
    renderIsland();   // 會把單元地圖藏起來、顯示全景（busy 時不重畫全景）
    v.classList.add('zooming');
    requestAnimationFrame(() => requestAnimationFrame(() => { const w = v.querySelector('.arch-world'); if (w) w.style.transform = ''; }));
    setTimeout(() => { busy = false; v.classList.remove('zooming'); render(); }, 760);
  }
  function tapIsle(id) {
    const is = ISLANDS.find((x) => x.id === id); if (!is) return;
    if (id === HERE) return zoomIn();
    if (!canGo(is)) {
      const g = document.querySelector(`#archView [data-arch="${id}"]`); if (g) { g.classList.remove('arch-no'); void g.getBoundingClientRect(); g.classList.add('arch-no'); }
      return toast(L(`🔒 ${is.name[0]}（${is.cls.join('、')}）還沒開放拜訪`, `🔒 ${is.name[1]} is locked`));
    }
    go(id);
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
    b.innerHTML = `<i>🌏</i><span>${L('群島', 'Islands')}<small>${L('拉遠看看海上所有的島', 'Zoom out to see every island')}</small></span><b>${ISLANDS.length} ${L('座島', 'islands')}</b>`;
  }
  const css = document.createElement('style');
  css.textContent = `.arch-view{position:relative;width:100%;aspect-ratio:390/460;overflow:hidden;background:#8CCBE3}
    .arch-view[hidden]{display:none}.arch-view svg{display:block;width:100%;height:100%}
    .arch-world{transform-origin:0 0;transform-box:view-box}
    .arch-view.zooming .arch-world{transition:transform .7s cubic-bezier(.65,0,.35,1)}
    .arch-view.zooming .arch-isle:not(.arch-own),.arch-view.zooming .arch-boat,.arch-view.zooming .arch-boat2{transition:opacity .5s;opacity:.25}
    .arch-isle{cursor:pointer}.arch-isle.arch-lk>path{filter:grayscale(.7) brightness(.97)}.arch-isle.arch-lk .arch-deco{opacity:.45}
    .arch-glow{animation:archGlow 1.6s ease-in-out infinite alternate}
    @keyframes archGlow{from{stroke-opacity:.25}to{stroke-opacity:.95}}
    .arch-pin{animation:isBob 1.2s ease-in-out infinite alternate}
    .arch-wave{animation:isWave 2.8s ease-in-out infinite alternate}
    .arch-cloud{animation:isDrift 26s ease-in-out infinite alternate}
    .arch-boat{animation:archSail 14s ease-in-out infinite alternate}.arch-boat2{animation:archSail2 18s ease-in-out infinite alternate}
    @keyframes archSail{from{transform:translate(-40px,-6px)}to{transform:translate(40px,8px)}}
    @keyframes archSail2{from{transform:translate(-50px,10px)}to{transform:translate(30px,-12px)}}
    .arch-no{animation:archNo .4s}
    @keyframes archNo{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
    .arch-fadein{animation:archFade .45s ease-out}
    @keyframes archFade{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
    #archBack{margin-left:auto}
    @media (prefers-reduced-motion:reduce){.arch-glow,.arch-pin,.arch-wave,.arch-cloud,.arch-boat,.arch-boat2{animation:none}.arch-view.zooming .arch-world{transition:none}}`;
  document.head.appendChild(css);
  document.addEventListener('click', (e) => {
    if (e.target.closest('#islandDock') || e.target.closest('#archBack')) {
      e.stopPropagation();
      if (inside) zoomOut();
      const card = document.querySelector('.island-card'); if (card) card.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    const t = e.target.closest('[data-arch]'); if (!t) return;
    e.stopPropagation();
    if (t.closest('#archView')) return tapIsle(t.dataset.arch);
    go(t.dataset.arch);
  }, true);
  window.archipelago = { render, zoomIn, zoomOut, go, islands: ISLANDS, isInside: () => inside };
  if (document.readyState !== 'loading') renderBtn(); else document.addEventListener('DOMContentLoaded', renderBtn);
  addEventListener('island-ready', () => render());
})();
