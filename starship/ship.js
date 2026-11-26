// ═══════════════════════════════════════════════════════
//  國中星艦 ship.js（英文島載入用，2026/11/26）
//  - 航線表 ROUTES：哪幾座島、哪幾冊、哪些單元、段考名稱、開始／結束日（結束日當天還在，隔天消失）
//  - 航程中：3D 地圖島旁上空停一艘星艦（island3d-hex.js 的 host.ship／host.shipTap），首頁地圖下也有「🛸 國中星艦停靠中」按鈕
//  - 點了 → 光束登船動畫 → 全螢幕開 /JeffreysLab/starship/?host=1（同網域 iframe，透過 window.JHShipHost 溝通）
//  - 積分：寫進島的帳本 st.ledger.bonus（k＝ship:航程id:時間），跟著簽章、雲端備份；各艙最佳存在 st.meta.ship
//  - 要改航線：改下面 ROUTES，再把載入這支的 ?v= 加 1
// ═══════════════════════════════════════════════════════
(() => {
  const ROUTES = [
    { id: '115-1-E2', islands: ['ia-core', 'vocab-thp11'], books: ['1上', '2上'], units: ['U1', 'U2', 'U3', 'U4'],
      examName: '第二次段考', from: '2026-11-26', to: '2026-12-12' },
  ];
  const SHIP_URL = '/JeffreysLab/starship/?host=1&v=3';

  const day = (d) => new Date(d + 'T00:00:00');
  const now = () => new Date();
  const voyage = () => ROUTES.find((r) => r.islands.includes(APP_ID) && now() >= day(r.from) && now() < new Date(day(r.to).getTime() + 864e5)) || null;
  const md = (d) => { const [, m, dd] = d.split('-'); return `${+m}/${+dd}`; };
  const KEY = (id) => 'ship:' + id + ':';
  let open = false;

  // ── 給星艦頁用的介面 ──
  window.JHShipHost = {
    get voyage() { return voyage(); },
    get st() { return st; },
    saveSet: () => (typeof saveSet === 'function' ? saveSet() : db.set('settings', st.set)),
    loadScore: (id) => (st.meta.ship && st.meta.ship[id]) || null,
    saveScore: (id, o) => { st.meta.ship = st.meta.ship || {}; st.meta.ship[id] = o; saveMeta(); },
    ledgerSum: () => { const v = voyage(); if (!v) return 0; return st.ledger.bonus.filter((b) => b.k.startsWith(KEY(v.id))).reduce((n, b) => n + b.p, 0); },
    async credit(delta, kind) {
      const v = voyage(); if (!v || !(delta > 0)) return;
      const before = points().total;
      st.ledger.bonus.push({ t: Date.now(), k: KEY(v.id) + kind + ':' + Date.now(), p: Math.round(delta) });
      await saveLedger();
      afterPoints(before);
      if (window.cloud && window.cloud.push) window.cloud.push(true);
    },
    close,
  };

  // ── 首頁按鈕 ──
  const css = document.createElement('style');
  css.textContent = `
#shipDock{display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(90deg,#141f3d,#1b2a55);color:#EAF2FF;border:1.5px solid #4ECDC4;box-shadow:0 0 18px rgba(78,205,196,.35)}
#shipDock b{color:#CCFF00}
#shipDock .ufo{display:inline-block;animation:shipBob 1.8s ease-in-out infinite}
@keyframes shipBob{50%{transform:translateY(-4px) rotate(-6deg)}}
.ship-ov{position:fixed;inset:0;z-index:500;background:#0a0a14;overflow:hidden}
.ship-ov iframe{position:absolute;inset:0;width:100%;height:100%;border:0;opacity:0;transition:opacity .4s}
.ship-ov.ready iframe{opacity:1}
.ship-ov .sky{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 20%,#1b2a55,#0a0a14 70%)}
.ship-ov .ufo{position:absolute;left:50%;top:14%;font-size:84px;transform:translateX(-50%);animation:shipDown .8s cubic-bezier(.2,1.3,.4,1) both;filter:drop-shadow(0 0 20px #4ECDC4)}
@keyframes shipDown{from{top:-20%}to{top:14%}}
.ship-ov .beam{position:absolute;left:50%;top:calc(14% + 80px);width:44vw;max-width:260px;height:62%;transform:translateX(-50%);clip-path:polygon(38% 0,62% 0,100% 100%,0 100%);background:linear-gradient(#9ffcf5cc,#9ffcf511);opacity:0;animation:beamOn .5s .7s forwards}
@keyframes beamOn{to{opacity:1}}
.ship-ov .me{position:absolute;left:50%;bottom:10%;width:84px;transform:translateX(-50%);animation:lift 1.3s .9s cubic-bezier(.5,0,.6,1) forwards}
.ship-ov .me img,.ship-ov .me svg{width:100%;height:auto}
@keyframes lift{to{bottom:68%;transform:translateX(-50%) scale(.35);opacity:0}}
.ship-ov .cap{position:absolute;left:0;right:0;bottom:4%;text-align:center;color:#4ECDC4;font-weight:800;letter-spacing:.1em}`;
  document.head.appendChild(css);

  function render() {
    const v = voyage();
    let b = document.getElementById('shipDock');
    if (!v) { if (b) b.remove(); return; }
    if (!b) {
      const after = document.getElementById('islandDock') || document.getElementById('islandPort');
      if (!after) return;
      b = document.createElement('button'); b.className = 'island-port'; b.id = 'shipDock';
      after.after(b); b.onclick = board;
    }
    b.innerHTML = `<span class="ufo">🛸</span> ${L('國中星艦停靠中', 'JH Starship is here')}・<b>${L(`到 ${md(v.to)}`, `until ${md(v.to)}`)}</b> ›`;
  }

  // ── 3D 地圖：島旁上空停一艘 ──
  if (typeof island3dHost === 'object') {
    island3dHost.ship = () => (voyage() ? { label: L('國中星艦', 'JH Starship') } : null);
    island3dHost.shipTap = () => board();
    const act = island3dHost.active;
    island3dHost.active = () => !open && act();              // 開著星艦時 3D 不畫，省電
  }

  // ── 登船 ──
  function board() {
    if (open || !voyage()) return;
    open = true;
    if (window.GameSfx && GameSfx.stopMusic) GameSfx.stopMusic();
    const ov = document.createElement('div'); ov.className = 'ship-ov';
    let me = '';
    try { me = typeof avatarSVG === 'function' && st.profile && st.profile.look ? avatarSVG(lookOf(), '') : typeof avaHTML === 'function' ? avaHTML() : ''; } catch (e) {}
    ov.innerHTML = `<div class="sky"></div><div class="beam"></div><div class="ufo">🛸</div><div class="me">${me || '<div style="font-size:64px;text-align:center">🧑‍🚀</div>'}</div>
      <div class="cap">BOARDING…</div><iframe title="國中星艦" allow="autoplay"></iframe>`;
    document.body.appendChild(ov);
    document.documentElement.style.overflow = 'hidden';
    const f = ov.querySelector('iframe');
    setTimeout(() => { f.src = SHIP_URL; }, 600);
    f.onload = () => setTimeout(() => ov.classList.add('ready'), 1500);
    // 登船音效（島上 GameSfx 已載入）
    if (window.GameSfx) { GameSfx.play('go'); setTimeout(() => GameSfx.play('boost'), 900); }
  }
  function close() {
    const ov = document.querySelector('.ship-ov'); if (!ov) return;
    ov.remove(); open = false; document.documentElement.style.overflow = '';
    try { renderHeader(); } catch (e) {}
    render();
  }

  const ready = () => (st.ready ? Promise.resolve() : new Promise((r) => addEventListener('island-ready', r, { once: true })));
  ready().then(render);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') render(); });   // 過了午夜航程結束就收起來
  window.jhShip = { voyage, board, close, render, ROUTES };
})();
