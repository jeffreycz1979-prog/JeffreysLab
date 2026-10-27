// ═══════════════════════════════════════════════════════
//  獎勵遊戲 #5：Dino Quest（恐龍大冒險，橫向捲動平台跳躍）
//  解鎖：精熟 5 個單元（試玩：網址加 ?try=dino，不用解鎖、不計分）
//  規則：3 分鐘；控制原創小恐龍往右跑、跳、踩敵人、吃金幣，跑到旗子就過關、進下一關（草原 → 洞穴 → 城堡，越後面越難）。
//        用頭頂「？」磚塊會出一題：上方出現英文單字，前面浮出三塊寫中文意思的答案磚，頂到正確的那塊得分、補體力。
//        體力條會一直減少（冒險島式），答對才能補滿；體力用完、掉進坑、被敵人撞到 → 拼出一個字才能繼續（時間不停）。
//        分數換算 0～20，所有遊戲共用每週最高一局。角色、場景都是原創，只借平台遊戲的玩法。
//  依賴 index.html 的全域：st, $, esc, L, EN, meaning, speak, answersOf, norm, shuffle, todayKey, clockCheck,
//        saveLedger, saveMeta, afterPoints, points, gameWeekBestAll, gameCard, masteredCount, GAMES, toast, confetti
// ═══════════════════════════════════════════════════════
const WD = (() => {
  const ID = 'dino', NEED = 5, VER = '0.1';
  const TIME = 180, CAP = 20, S_PER_PT = 200;   // 每 200 分 1 ⭐（4000 分滿 20）— 待實玩後調整
  const T = 24, ROWS = 11, WH = ROWS * T;         // 磚塊大小、地圖列數、世界高度
  const GROUND = 9;                               // 地面從第 9 列開始（第 9、10 列是土）
  const ACC = 900, VMAX = 150, FRIC = 1300, GRAV = 1500, JUMP = 470, HOLD = 0.22;
  const ENERGY = 30, DRAIN = 1, E_RIGHT = 14, E_WRONG = 6;
  const AW = 2;   // 答案磚寬（格）
  const P = { coin: 10, stomp: 50, right: 100, streak: 50, flag: 300 };
  const E = 0, GD = 1, BR = 2, QB = 3, UB = 4, PIPE = 5, ST = 6, AB = 8;   // 地圖格子種類
  const THEMES = [
    { name: L('草原', 'Grassland'), sky: ['#7ec8f7', '#c9ecff'], hill: '#5fbf5f', hill2: '#86d36e', top: '#4caf50', dirt: '#a0622d', dot: '#7c4a21', brick: '#c8642b', cloud: true },
    { name: L('洞穴', 'Cave'), sky: ['#1b1530', '#2e2450'], hill: '#3a2f63', hill2: '#4a3d78', top: '#6b6a8f', dirt: '#4a4566', dot: '#36324d', brick: '#7a6f9e', cloud: false },
    { name: L('城堡', 'Castle'), sky: ['#2a0f12', '#5a1d1d'], hill: '#4a1818', hill2: '#6a2424', top: '#8a8a8a', dirt: '#5e5e66', dot: '#46464d', brick: '#8f8f99', cloud: false, lava: true },
  ];
  let cv, cx, root, k = 2, oy = 0, VW = 300, dpr = 1;
  let game = null, raf = 0, trial = false;
  const keys = { l: false, r: false, j: false };

  const unlocked = () => masteredCount() >= NEED;
  const spellPool = () => st.words.filter((w) => w.type !== '片語' && !/[ ()/]/.test(w.word) && w.word.length >= 3);
  const quizPool = () => st.words.filter((w) => meaning(w));
  const toPts = (sc) => Math.min(CAP, Math.floor(sc / S_PER_PT));
  const card = () => gameCard({ id: ID, need: NEED, icon: '🦖', name: 'Dino Quest' });
  const bestText = () => { const b = st.meta.games && st.meta.games[ID] && st.meta.games[ID].best; return b ? `Dino Quest ${b}` : ''; };
  const short = (w) => String(meaning(w) || '').split(/[；;,，]/)[0].trim();

  // ── 畫面 ──
  function mount() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'wj wr wd';
    root.innerHTML = `<canvas></canvas>
      <div class="wb-banner" id="wdBanner"></div>
      <div class="wr-gate" id="wdQ" style="display:none"></div>
      <div class="wj-hud"><button class="wj-x" data-wd="quit">✕</button>
        <span class="wr-coin" id="wdC">🪙 0</span><span class="wd-en"><i id="wdE"></i></span>
        <span class="wj-t" id="wdT">3:00</span><span class="wj-h" id="wdS">0</span><span class="wj-p" id="wdP">⭐ 0</span></div>
      <div class="wd-pad" id="wdPad">
        <button data-k="l" aria-label="左">◀</button><button data-k="r" aria-label="右">▶</button>
        <button data-k="j" class="jb" aria-label="跳">JUMP</button></div>
      <div class="wj-pane" id="wdPane"></div>`;
    document.body.appendChild(root);
    if (!document.getElementById('wdCss')) {
      const s = document.createElement('style'); s.id = 'wdCss';
      s.textContent = `.wj.wd{left:0;right:0;width:auto;transform:none;box-shadow:none}
        .wd-en{width:74px;height:14px;padding:0!important;border-radius:8px!important;overflow:hidden;background:rgba(0,0,0,.5)!important;position:relative}
        .wd-en i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#ff6b57,#ffd23f 40%,#CCFF00);border-radius:8px;transition:width .2s}
        .wd-pad{position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);display:flex;gap:12px;padding:0 16px;z-index:3;pointer-events:none}
        .wd-pad button{pointer-events:auto;width:76px;height:76px;border-radius:50%;border:3px solid rgba(255,255,255,.55);background:rgba(0,0,0,.28);color:#fff;font-size:28px;
          touch-action:none;-webkit-user-select:none;user-select:none}
        .wd-pad button.on{background:rgba(204,255,0,.35);border-color:#CCFF00}
        .wd-pad .jb{margin-left:auto;width:96px;height:96px;font:800 18px Syne,sans-serif;background:rgba(204,255,0,.22);border-color:#CCFF00}
        .wd .wr-gate{top:calc(env(safe-area-inset-top,0px) + 54px)}
        .wj.wd .wb-banner{bottom:auto;top:calc(env(safe-area-inset-top,0px) + 108px)}`;
      document.head.appendChild(s);
    }
    cv = root.querySelector('canvas'); cx = cv.getContext('2d');
    root.addEventListener('click', onClick);
    const pad = root.querySelector('#wdPad');
    const set = (b, v) => { if (!b) return; keys[b.dataset.k] = v; b.classList.toggle('on', v); if (b.dataset.k === 'j' && v) jumpPress(); };
    pad.addEventListener('pointerdown', (e) => { const b = e.target.closest('[data-k]'); if (b) { e.preventDefault(); b.setPointerCapture && b.setPointerCapture(e.pointerId); set(b, true); } });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => pad.addEventListener(ev, (e) => set(e.target.closest('[data-k]'), false)));
    addEventListener('keydown', onKey); addEventListener('keyup', onKey);
    addEventListener('resize', resize);
  }
  function resize() {
    if (!root) return;
    const w = root.clientWidth, h = root.clientHeight; dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    // 至少看得到 260 寬（三塊答案磚＋空隙 8 格＝192）；地面放在按鈕上方，天空往上延伸
    const W = w * dpr, H = h * dpr;
    k = Math.min(H * 0.9 / WH, W / 260);
    VW = W / k;
    oy = Math.max(0, Math.min(H - WH * k, H - 150 * dpr - GROUND * T * k));
  }
  const pane = (html) => { const p = root.querySelector('#wdPane'); p.innerHTML = html; p.style.display = html ? '' : 'none'; root.querySelector('#wdPad').style.display = html ? 'none' : ''; };
  function onKey(e) {
    if (!root || !root.classList.contains('show') || !game || game.spell || game.over) return;
    const m = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'j', ' ': 'j', z: 'j', Z: 'j' }[e.key]; if (!m) return;
    const down = e.type === 'keydown';
    if (m === 'j' && down && !keys.j) jumpPress();
    keys[m] = down; e.preventDefault();
  }

  // ── 開始畫面 ──
  function open(opts) {
    trial = !!(opts && opts.trial);
    if (!trial && !unlocked()) return toast(L(`精熟 ${NEED} 個單元後解鎖`, `Master ${NEED} units to unlock`));
    if (quizPool().length < 6 || !spellPool().length) return toast(L('單字太少，還不能玩', 'Not enough words yet'));
    mount(); root.classList.add('show'); resize();
    document.body.style.overflow = 'hidden';
    const best = gameWeekBestAll(), pb = (st.meta.games && st.meta.games[ID] && st.meta.games[ID].best) || 0;
    game = null; draw();
    pane(`<div class="wj-card">
      <div class="wj-ic">🦖</div>
      <h2>Dino Quest</h2>
      <p>${L('帶小恐龍跑過草原、洞穴和城堡，一路答對單字！', 'Run, jump and answer words through the grassland, cave and castle!')}</p>
      <div class="wj-rules">
        <div>◀ ▶ ${L('左右移動，JUMP 跳（按久一點跳更高）；鍵盤：方向鍵＋空白鍵', 'Move with ◀ ▶, JUMP to jump (hold for higher); keyboard: arrows + space')}</div>
        <div>❓ ${L('用頭頂「？」磚塊：會出現英文，前面浮出三塊中文答案磚，頂到正確的那塊', 'Bump a ? block: an English word appears, then bump the block with the right meaning')}</div>
        <div>✅ ${L(`答對 +${P.right}、體力補滿一大段；連對 3 題起每題再 +${P.streak}`, `Right +${P.right} and energy; 3+ in a row: +${P.streak} each`)}</div>
        <div>⚡ ${L('體力條會一直減少，只有答對才能補', 'Energy keeps draining — answer right to refill')}</div>
        <div>👟 ${L(`從上面踩敵人 +${P.stomp}・🪙 金幣 +${P.coin}・🚩 碰到旗子過關 +${P.flag}`, `Stomp enemies +${P.stomp} · 🪙 +${P.coin} · 🚩 flag +${P.flag}`)}</div>
        <div>✏️ ${L('掉進坑、被敵人撞到、體力用完：拼對一個字才能繼續（時間不會停）', 'Fall, get hit or run out of energy: spell a word to continue (clock keeps running)')}</div>
        <div>⭐ ${trial ? L('試玩模式：不計分', 'Trial: not scored') : L(`每 ${S_PER_PT} 分 1 顆星，最多 ${CAP}；所有遊戲每週只算最高一局`, `1 ⭐ per ${S_PER_PT} points, up to ${CAP}; best game of the week counts`)}</div>
      </div>
      <p class="wj-small">${trial ? L('🧪 試玩版', '🧪 Trial') : L(`本週遊戲最佳 ${best} / ${CAP} ⭐・個人最高 ${pb} 分`, `Best this week ${best} / ${CAP} ⭐ · Personal best ${pb}`)}<br><span style="opacity:.5">v${VER}</span></p>
      <div class="btnrow"><button class="btn" data-wd="start">${L('開始 Start ▶', 'Start ▶')}</button><button class="btn ghost" data-wd="close">${L('離開', 'Exit')}</button></div>
    </div>`);
  }
  function close() {
    cancelAnimationFrame(raf); game = null; Object.keys(keys).forEach((x) => (keys[x] = false));
    if (root) root.classList.remove('show');
    document.body.style.overflow = '';
    if (typeof renderQuiz === 'function' && $('v-quiz') && $('v-quiz').classList.contains('active')) renderQuiz();
  }

  // ── 關卡產生：每關長度、坑、平台、？磚塊（後面留一段平地放答案磚）、水管、敵人、金幣、旗子 ──
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function buildLevel(n) {
    const R = rng(Date.now() + n * 977), cols = 130 + n * 25, map = [], ents = [];
    for (let c = 0; c < cols; c++) { const col = new Array(ROWS).fill(E); col[GROUND] = GD; col[GROUND + 1] = GD; map.push(col); }
    const free = new Array(cols).fill(true);   // 這一欄還沒放東西
    const reserve = (a, b) => { for (let c = a; c <= b && c < cols; c++) free[c] = false; };
    reserve(0, 8); reserve(cols - 16, cols - 1);
    // ？磚塊：每隔 30～37 欄一個，後面 14 欄留平地給答案磚（中間剩下的地方才放坑、水管、敵人）
    const qs = [];
    for (let c = 12; c < cols - 34; c += 30 + Math.floor(R() * 8)) { qs.push(c); map[c][6] = QB; reserve(c - 1, c + 14); }
    // 坑：在還沒用到的地方挖 2～3 格（後面幾關比較多、比較寬）
    for (let c = 10; c < cols - 18; c++) {
      if (!free[c] || !free[c + 1] || !free[c + 2] || !free[c + 3]) continue;
      if (R() < 0.09 + n * 0.04) {
        const wdt = 2 + (R() < 0.3 + n * 0.15 ? 1 : 0);
        for (let i = 0; i < wdt; i++) { map[c + i][GROUND] = E; map[c + i][GROUND + 1] = E; }
        for (let i = 0; i < wdt; i++) ents.push({ t: 'coin', x: (c + i) * T + 6, y: 5 * T + 6, w: 12, h: 12 });
        reserve(c - 2, c + wdt + 2); c += wdt + 3;
      }
    }
    // 磚塊平台、水管、石階
    for (let c = 10; c < cols - 18; c++) {
      if (!free[c]) continue;
      const r = R();
      if (r < 0.06 && [0, 1, 2, 3].every((i) => free[c + i])) {   // 一排磚塊（中間可能有金幣）
        for (let i = 0; i < 4; i++) { map[c + i][5] = BR; ents.push({ t: 'coin', x: (c + i) * T + 6, y: 4 * T + 6, w: 12, h: 12 }); }
        reserve(c, c + 4); c += 5;
      } else if (r < 0.11 && free[c + 1]) {   // 水管
        const hgt = 2 + (R() < 0.4 ? 1 : 0);
        for (let i = 0; i < hgt; i++) { map[c][GROUND - 1 - i] = PIPE; map[c + 1][GROUND - 1 - i] = PIPE; }
        reserve(c - 1, c + 2); c += 3;
      } else if (r < 0.16 && [0, 1, 2].every((i) => free[c + i])) {   // 石階
        map[c][GROUND - 1] = ST; map[c + 1][GROUND - 1] = ST; map[c + 1][GROUND - 2] = ST; map[c + 2][GROUND - 1] = ST;
        reserve(c, c + 3); c += 4;
      }
    }
    // 敵人：放在平地上（每關越後面越多、越快）
    for (let c = 14; c < cols - 18; c++) {
      if (map[c][GROUND] === GD && map[c][GROUND - 1] === E && R() < 0.035 + n * 0.015 && !qs.some((q) => c > q && c < q + 15))
        ents.push({ t: 'bug', x: c * T + 2, y: GROUND * T - 18, w: 20, h: 18, vx: -(28 + n * 10), alive: true });
    }
    // 結尾：石階＋旗子
    for (let i = 0; i < 4; i++) for (let j = 0; j <= i; j++) map[cols - 15 + i][GROUND - 1 - j] = ST;
    const flagX = (cols - 8) * T + 10;
    return { n, cols, map, ents, flagX, theme: THEMES[Math.min(n, THEMES.length) - 1] || THEMES[THEMES.length - 1] };
  }

  // ── 遊戲 ──
  function start() {
    Object.keys(keys).forEach((x) => (keys[x] = false));
    game = {
      t0: Date.now(), last: performance.now(), clock: 0,
      lv: null, n: 0, hero: null, camX: 0, energy: ENERGY, score: 0, coins: 0, stomps: 0, right: 0, wrong: 0, streak: 0, best: 0, deaths: 0, clears: 0,
      q: null, used: new Set(), fx: [], spell: null, over: false, pause: 0,
    };
    pane(''); nextLevel(); loop();
  }
  function nextLevel() {
    const g = game; g.n++;
    g.lv = buildLevel(g.n); g.q = null; showQ();
    g.hero = { x: 3 * T, y: GROUND * T - 22, w: 16, h: 22, vx: 0, vy: 0, on: false, face: 1, hold: 0, inv: 1.5, safeX: 3 * T, anim: 0 };
    g.camX = 0;
    banner('🚩', `${g.n}-1 ${g.lv.theme.name}`, L('出發！', "Let's go!"), '#CCFF00');
  }
  const tile = (c, r) => { const m = game.lv.map; if (c < 0) return ST; if (c >= m.length || r < 0) return E; if (r >= ROWS) return E; return m[c][r]; };
  const solid = (v) => v !== E;
  function loop() {
    raf = requestAnimationFrame(loop);
    const g = game; if (!g) return;
    const now = performance.now(), dt = Math.min(0.033, (now - g.last) / 1000); g.last = now; g.clock += dt;
    const left = TIME - (Date.now() - g.t0) / 1000;
    if (left <= 0) return end();
    if (!g.spell) step(dt);
    hud(left); draw();
  }
  function jumpPress() {
    const h = game && game.hero; if (!h || game.spell || game.over) return;
    if (h.on) { h.vy = -JUMP; h.on = false; h.hold = HOLD; }
  }
  function step(dt) {
    const g = game, h = g.hero, lv = g.lv;
    g.fx = g.fx.filter((f) => (f.t -= dt) > 0);
    if (g.pause > 0) { g.pause -= dt; if (g.pause <= 0 && g.after) { const f = g.after; g.after = null; f(); } return; }
    // 體力
    g.energy -= DRAIN * dt;
    if (g.energy <= 0) { g.energy = 0; return die('hungry'); }
    // 左右
    const dir = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
    if (dir) { h.vx += dir * ACC * dt; h.face = dir; } else { const f = FRIC * dt; h.vx = Math.abs(h.vx) <= f ? 0 : h.vx - Math.sign(h.vx) * f; }
    h.vx = Math.max(-VMAX, Math.min(VMAX, h.vx));
    // 跳：按著跳躍鍵時重力變小（按久跳高）
    if (h.hold > 0) { h.hold -= dt; if (!keys.j) h.hold = 0; }
    h.vy += GRAV * (h.hold > 0 && h.vy < 0 ? 0.45 : 1) * dt; h.vy = Math.min(h.vy, 700);
    if (h.inv > 0) h.inv -= dt;
    h.anim += Math.abs(h.vx) * dt;
    // 水平移動＋碰撞
    h.x += h.vx * dt;
    if (h.x < g.camX) { h.x = g.camX; h.vx = 0; }   // 不能往回走出畫面
    collideX(h);
    // 垂直移動＋碰撞（頭頂磚塊）
    h.y += h.vy * dt; h.on = false;
    collideY(h);
    if (h.on && h.x > h.safeX && solid(tile(Math.floor((h.x + h.w / 2) / T), GROUND))) h.safeX = h.x;
    // 掉進坑
    if (h.y > WH + 30) return die('pit');
    // 鏡頭：平常英雄在畫面 35% 的位置；有題目時往前看（20%），讓三塊答案磚都看得到；只往前、平滑移動
    const want = Math.min(h.x - VW * (g.q ? 0.2 : 0.35), lv.cols * T - VW);
    if (want > g.camX) g.camX += (want - g.camX) * Math.min(1, dt * 6);
    // 東西
    for (const e of lv.ents) {
      if (e.t === 'bug' && e.alive) {
        if (e.x > g.camX + VW + 40) continue;   // 還沒進畫面的不動
        e.x += e.vx * dt;
        const c = Math.floor((e.vx < 0 ? e.x : e.x + e.w) / T), rFeet = GROUND;
        if (solid(tile(c, GROUND - 1)) || !solid(tile(c, rFeet))) { e.vx = -e.vx; e.x += e.vx * dt * 2; }   // 撞牆或坑邊就回頭
        if (hit(h, e)) {
          if (h.vy > 60 && h.y + h.h - e.y < 12) {   // 從上面踩
            e.alive = false; h.vy = -320; g.score += P.stomp; g.stomps++;
            pop(e.x + e.w / 2, e.y, `+${P.stomp}`, '#ffd23f');
          } else if (h.inv <= 0) return die('bug');
        }
      } else if (e.t === 'coin' && !e.got && hit(h, e)) {
        e.got = true; g.coins++; g.score += P.coin; pop(e.x + 6, e.y, `+${P.coin}`, '#ffd23f');
      }
    }
    // 答案磚已經跑過了 → 這題結束
    if (g.q && h.x > g.q.end) expireQ();
    // 旗子
    if (h.x + h.w > lv.flagX) return clear();
  }
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  function collideX(h) {
    const top = Math.floor(h.y / T), bot = Math.floor((h.y + h.h - 1) / T);
    if (h.vx > 0) { const c = Math.floor((h.x + h.w) / T); for (let r = top; r <= bot; r++) if (solid(tile(c, r))) { h.x = c * T - h.w; h.vx = 0; break; } }
    else if (h.vx < 0) { const c = Math.floor(h.x / T); for (let r = top; r <= bot; r++) if (solid(tile(c, r))) { h.x = (c + 1) * T; h.vx = 0; break; } }
  }
  function collideY(h) {
    const l = Math.floor((h.x + 2) / T), r = Math.floor((h.x + h.w - 3) / T);
    if (h.vy > 0) {
      const row = Math.floor((h.y + h.h) / T);
      for (let c = l; c <= r; c++) if (solid(tile(c, row))) { h.y = row * T - h.h; h.vy = 0; h.on = true; return; }
    } else if (h.vy < 0) {
      const row = Math.floor(h.y / T);
      // 頭頂：選最靠近恐龍中心的那一格
      const cs = []; for (let c = l; c <= r; c++) if (solid(tile(c, row))) cs.push(c);
      if (cs.length) {
        const mid = (h.x + h.w / 2) / T; cs.sort((a, b) => Math.abs(a + 0.5 - mid) - Math.abs(b + 0.5 - mid));
        h.y = (row + 1) * T; h.vy = 60; h.hold = 0;
        bump(cs[0], row);
      }
    }
  }
  function bump(c, r) {
    const g = game, v = tile(c, r);
    g.fx.push({ t: 0.15, bump: [c, r] });
    if (v === QB) { g.lv.map[c][r] = UB; ask(c); }
    else if (v === AB) answer(c, r);
  }

  // ── 出題：頂到「？」→ 前面浮出三塊答案磚（每塊 3 格寬） ──
  function ask(c) {
    const g = game; if (g.q) expireQ(true);
    const pool = quizPool(), fresh = pool.filter((w) => !g.used.has(w.id));
    const w = shuffle(fresh.length ? fresh : pool)[0]; g.used.add(w.id);
    const seen = new Set([short(w)]), others = shuffle(pool.filter((x) => x.id !== w.id)).filter((x) => { const s = short(x); if (!s || seen.has(s)) return false; seen.add(s); return true; }).slice(0, 2);
    const opts = shuffle([w, ...others]);
    const blocks = opts.map((o, i) => ({ c: c + 2 + i * 3, r: 6, o, ok: o === w }));
    blocks.forEach((b) => { for (let i = 0; i < AW; i++) g.lv.map[b.c + i][b.r] = AB; });
    g.q = { w, blocks, end: (c + 2 + 2 * 3 + 4) * T };
    showQ(); speak(w.word);
  }
  function answer(c, r) {
    const g = game, q = g.q; if (!q) return;
    const b = q.blocks.find((x) => c >= x.c && c < x.c + AW && x.r === r); if (!b) return;
    clearBlocks(q);
    const cx0 = (b.c + AW / 2) * T, cy0 = b.r * T;
    if (b.ok) {
      g.right++; g.streak++; g.best = Math.max(g.best, g.streak);
      const pts = P.right + (g.streak >= 3 ? P.streak : 0); g.score += pts;
      g.energy = Math.min(ENERGY, g.energy + E_RIGHT);
      for (let i = 0; i < 6; i++) g.fx.push({ t: 0.9, x: cx0 + (i - 2.5) * 8, y: cy0, vx: (i - 2.5) * 30, vy: -260 - i * 10, coin: true });
      banner('✅', L(`答對！+${pts}`, `Correct! +${pts}`), `${q.w.word} = ${short(q.w)}${g.streak >= 3 ? `　🔥${g.streak}` : ''}`, '#CCFF00');
    } else {
      g.wrong++; g.streak = 0; g.energy = Math.max(1, g.energy - E_WRONG);
      banner('✕', L('不是這個', 'Not this one'), `${q.w.word} = ${short(q.w)}`, '#ff6b57');
      g.fx.push({ t: 1.2, ghost: q.blocks.find((x) => x.ok) });   // 正確答案閃一下
    }
    g.q = null; showQ();
  }
  function clearBlocks(q) { q.blocks.forEach((b) => { for (let i = 0; i < AW; i++) if (game.lv.map[b.c + i][b.r] === AB) game.lv.map[b.c + i][b.r] = E; }); }
  function expireQ(silent) {
    const g = game, q = g.q; if (!q) return;
    clearBlocks(q); g.q = null; g.streak = 0; showQ();
    if (!silent) banner('💨', L('錯過這題了', 'Missed it'), `${q.w.word} = ${short(q.w)}`, '#4ECDC4');
  }
  function showQ() {
    const el = $('wdQ'); if (!el) return;
    const q = game && game.q;
    if (!q || game.spell || game.over) { el.style.display = 'none'; el.innerHTML = ''; return; }
    el.style.display = '';
    el.innerHTML = `<div class="wr-q">❓ <b>${esc(q.w.word)}</b><button class="spk small" data-say="${esc(q.w.word)}">🔊</button></div>`;
  }

  // ── 過關、失誤 ──
  function clear() {
    const g = game; g.clears++;
    const bonus = P.flag + Math.round(g.energy) * 2; g.score += bonus;
    if (g.q) expireQ(true);
    banner('🚩', L(`過關！+${bonus}`, `Stage clear! +${bonus}`), L('下一關更難喔', 'Next stage is harder'), '#CCFF00');
    g.after = nextLevel; g.pause = 1.4; g.hero.vx = 0;
  }
  function die(why) {
    const g = game; g.deaths++; g.streak = 0;
    Object.keys(keys).forEach((x) => (keys[x] = false)); root.querySelectorAll('.wd-pad .on').forEach((b) => b.classList.remove('on'));
    const pool = spellPool(), fresh = pool.filter((w) => !g.used.has(w.id));
    const w = shuffle(fresh.length ? fresh : pool)[0];
    g.spell = { w, ans: answersOf(w)[0], shown: 1, tries: 0, why };
    showQ(); renderSpell(); speak(w.word);
  }
  function renderSpell(bad) {
    const s = game.spell, a = s.ans;
    const hint = a.split('').map((c, i) => (i < s.shown ? c : '_')).join(' ');
    const what = { pit: L('掉進坑裡了！', 'You fell!'), bug: L('被甲蟲撞到了！', 'A beetle got you!'), hungry: L('體力用完了！', 'Out of energy!') }[s.why] || '';
    pane(`<div class="wj-card wj-spell ${bad ? 'shake' : ''}">
      <div class="wj-kicker">${what} ${L('拼對才能繼續', 'Spell it to keep going')} ✏️</div>
      <div class="wj-mean" ${EN() ? 'style="font-size:17px"' : ''}>${esc(meaning(s.w))}</div>
      <div class="qmid"><span class="pos">${esc(s.w.pos || '')}</span><button class="spk small" data-say="${esc(s.w.word)}">🔊</button></div>
      <div class="hintw">${esc(hint)}</div>
      <input class="spellin" id="wdIn" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="type here">
      ${s.tries ? `<div class="wj-small" style="color:var(--coral)">${L(`拼錯 ${s.tries} 次，多給你一個字母`, `${s.tries} wrong — here's another letter`)}</div>` : ''}
      <button class="btn wide" style="margin-top:10px" data-wd="check">${L('確認 Check', 'Check')}</button>
    </div>`);
    const inp = $('wdIn'); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    setTimeout(() => inp.focus(), 50);
  }
  function check() {
    const s = game && game.spell; if (!s) return;
    const v = norm($('wdIn').value || '');
    if (!v) return $('wdIn').focus();
    if (answersOf(s.w).includes(v)) {
      const g = game, h = g.hero; g.spell = null; pane(''); g.last = performance.now();
      if (s.why === 'hungry') g.energy = ENERGY * 0.6;
      else {   // 回到最後站穩的地方
        h.x = Math.max(0, h.safeX - 12); h.y = GROUND * T - h.h - 2 * T; h.vx = 0; h.vy = 0;   // safeX 一定是站過的地板
        g.camX = Math.min(g.camX, Math.max(0, h.x - VW * 0.35));
        g.energy = Math.max(g.energy, ENERGY * 0.4);
      }
      h.inv = 2; showQ();
      banner('✓', L('答對！繼續冒險', 'Correct! Keep going'), '', '#CCFF00');
    } else {
      s.tries++; s.shown = Math.min(s.ans.length, s.shown + 1);
      renderSpell(true); speak(s.w.word);
    }
  }
  function pop(x, y, txt, c) { game.fx.push({ t: 0.8, x, y, txt, c }); }
  let bannerT = 0;
  function banner(ic, big, small, c) {
    const el = $('wdBanner'); if (!el) return;
    el.style.setProperty('--c', c); el.style.borderColor = c;
    el.innerHTML = `<span class="ic">${ic}</span><div><b>${esc(big)}</b>${small ? `<small>${esc(small)}</small>` : ''}</div>`;
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    clearTimeout(bannerT); bannerT = setTimeout(() => el.classList.remove('on'), 1400);
  }

  // ── 結束 ──
  function end() {
    cancelAnimationFrame(raf);
    const g = game; if (!g || g.over) return;
    g.over = true; g.spell = null; showQ();
    const sc = g.score, pts = toPts(sc);
    let gain = 0, prev = 0, record = false, best = sc;
    if (!trial) {
      const kk = todayKey(), before = points().total; prev = gameWeekBestAll();
      clockCheck();
      const day = st.ledger.days[kk] || (st.ledger.days[kk] = { cards: 0 });
      day.gbest = day.gbest || {};
      if (pts > (day.gbest[ID] || 0)) day.gbest[ID] = pts;
      st.meta.games = st.meta.games || {};
      const gm = st.meta.games[ID] || (st.meta.games[ID] = { plays: 0, best: 0 });
      gm.plays++; record = sc > gm.best; if (record) gm.best = sc; best = gm.best;
      saveLedger(); saveMeta();
      gain = Math.max(0, pts - prev);
      afterPoints(before);
      if (gain) setTimeout(() => confetti(gain >= 10 ? 90 : 50), 150);
    }
    hud(0); draw();
    pane(`<div class="wj-card">
      <div class="wj-kicker">${L('時間到！', "Time's up!")}</div>
      <div class="wj-big">${sc}</div>
      <div class="wj-small">${trial ? L('🧪 試玩模式，不計分', '🧪 Trial — not scored') : record ? L('🆕 個人最高紀錄！', '🆕 New personal best!') : L(`個人最高 ${best} 分`, `Personal best ${best}`)}<br>
        ${L(`過了 ${g.clears} 關・答對 ${g.right}・答錯 ${g.wrong}・踩敵人 ${g.stomps}・🪙 ${g.coins}・失誤 ${g.deaths}`, `${g.clears} stages · ${g.right} right · ${g.wrong} wrong · ${g.stomps} stomps · 🪙 ${g.coins} · ${g.deaths} falls`)}</div>
      <div class="wj-pts">⭐ ${pts} / ${CAP}</div>
      ${trial ? '' : gain ? `<div class="gain">+${gain} ⭐</div>`
        : `<div class="gain zero">${prev >= CAP ? L('本週遊戲已經拿滿 20 分，現在純粹好玩 🎮', 'You already got 20 this week — just for fun now 🎮')
          : L(`本週遊戲最佳是 ${prev} 分，超過才會再加分`, `Your best this week is ${prev} — beat it to earn more`)}</div>`}
      <div class="btnrow" style="margin-top:14px"><button class="btn" data-wd="start">${L('再玩一次', 'Play again')}</button><button class="btn ghost" data-wd="close">${L('離開', 'Exit')}</button></div>
    </div>`);
  }

  // ── 繪圖（全部用程式畫的像素風，原創角色） ──
  function hud(left) {
    const g = game, m = Math.floor(left / 60), s = Math.floor(left % 60);
    $('wdT').textContent = `${m}:${String(s).padStart(2, '0')}`; $('wdT').classList.toggle('low', left < 20);
    $('wdS').textContent = g ? g.score : 0; $('wdC').textContent = `🪙 ${g ? g.coins : 0}`;
    $('wdP').textContent = `⭐ ${g ? toPts(g.score) : 0}`;
    $('wdE').style.width = `${g ? Math.max(0, g.energy / ENERGY * 100) : 100}%`;
  }
  function draw() {
    if (!cx) return;
    const W = cv.width, H = cv.height, g = game, th = (g && g.lv && g.lv.theme) || THEMES[0];
    cx.setTransform(1, 0, 0, 1, 0, 0);
    const sky = cx.createLinearGradient(0, 0, 0, oy + WH * k); sky.addColorStop(0, th.sky[0]); sky.addColorStop(1, th.sky[1]);
    cx.fillStyle = sky; cx.fillRect(0, 0, W, H);
    const camX = g ? g.camX : 0;
    // 遠景：山丘（視差）、雲
    cx.setTransform(k, 0, 0, k, 0, oy);
    const hills = (par, col, hgt, step) => {
      cx.fillStyle = col; cx.beginPath(); cx.moveTo(0, GROUND * T);
      for (let x = -((camX * par) % step) - step; x < VW + step; x += step) cx.quadraticCurveTo(x + step / 2, GROUND * T - hgt, x + step, GROUND * T);
      cx.lineTo(VW, GROUND * T); cx.closePath(); cx.fill();
    };
    if (th.cloud) {
      cx.fillStyle = 'rgba(255,255,255,.85)';
      for (let i = 0; i < 6; i++) { const x = ((i * 170 - camX * 0.2) % (VW + 200) + VW + 200) % (VW + 200) - 100, y = 30 + (i % 3) * 22;
        cx.beginPath(); cx.arc(x, y, 14, 0, 7); cx.arc(x + 16, y - 6, 18, 0, 7); cx.arc(x + 34, y, 13, 0, 7); cx.fill(); }
    } else {
      cx.fillStyle = 'rgba(255,255,255,.35)';
      for (let i = 0; i < 30; i++) { const x = ((i * 53 - camX * 0.1) % VW + VW) % VW, y = (i * 37) % (GROUND * T - 60); cx.fillRect(x, y, 1.5, 1.5); }
    }
    hills(0.25, th.hill2, 90, 220); hills(0.45, th.hill, 60, 150);
    if (!g) { cx.fillStyle = th.top; cx.fillRect(0, GROUND * T, VW, 6); cx.fillStyle = th.dirt; cx.fillRect(0, GROUND * T + 6, VW, H / k); return; }
    const lv = g.lv;
    cx.translate(-Math.round(camX), 0);
    const c0 = Math.floor(camX / T) - 1, c1 = Math.ceil((camX + VW) / T) + 1;
    // 地面下方延伸（填滿畫面下緣）
    for (let c = c0; c <= c1; c++) {
      if (tile(c, GROUND) !== GD) { if (th.lava && c >= 0 && c < lv.cols) { cx.fillStyle = `hsl(${12 + Math.sin(g.clock * 3 + c) * 6},90%,50%)`; cx.fillRect(c * T, WH - 10, T, (H - oy) / k); } continue; }
      cx.fillStyle = th.dirt; cx.fillRect(c * T - 0.5, WH - 1, T + 1, (H - oy) / k - WH + 2);
    }
    for (let c = c0; c <= c1; c++) for (let r = 0; r < ROWS; r++) drawTile(c, r, tile(c, r), th);
    // 答案磚上的字
    if (g.q) g.q.blocks.forEach((b) => {
      const x = b.c * T, y = b.r * T, w = AW * T;
      cx.fillStyle = '#10140a'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      let t = short(b.o); if (t.length > 8) t = t.slice(0, 7) + '…';
      let fs = 13; do { cx.font = `800 ${fs}px "Noto Sans TC", sans-serif`; } while (cx.measureText(t).width > w - 6 && --fs > 6);
      cx.fillText(t, x + w / 2, y + T / 2 + 1);
      cx.textBaseline = 'alphabetic';
    });
    // 旗子
    const fx = lv.flagX, fy = GROUND * T;
    cx.fillStyle = '#e8e8e8'; cx.fillRect(fx, fy - 8 * T, 3, 8 * T); cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.arc(fx + 1.5, fy - 8 * T, 4, 0, 7); cx.fill();
    cx.fillStyle = '#CCFF00'; cx.beginPath(); cx.moveTo(fx + 3, fy - 8 * T + 6); cx.lineTo(fx + 30, fy - 7.4 * T + 6); cx.lineTo(fx + 3, fy - 6.8 * T + 6); cx.fill();
    cx.fillStyle = '#1a3a1a'; cx.font = '800 9px Syne, sans-serif'; cx.textAlign = 'center'; cx.fillText('🏝', fx + 13, fy - 7.25 * T + 6);
    // 終點小屋
    const hx = fx + 40; cx.fillStyle = th.brick; cx.fillRect(hx, fy - 3 * T, 4 * T, 3 * T); cx.fillStyle = '#2b1a10'; cx.fillRect(hx + 1.5 * T, fy - 1.6 * T, T, 1.6 * T);
    cx.fillStyle = th.top; cx.beginPath(); cx.moveTo(hx - 6, fy - 3 * T); cx.lineTo(hx + 2 * T, fy - 4.6 * T); cx.lineTo(hx + 4 * T + 6, fy - 3 * T); cx.fill();
    // 金幣、敵人
    lv.ents.forEach((e) => {
      if (e.x < camX - 40 || e.x > camX + VW + 40) return;
      if (e.t === 'coin' && !e.got) {
        const s = Math.abs(Math.sin(g.clock * 4 + e.x * 0.05));
        cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.ellipse(e.x + 6, e.y + 6, 2 + 4 * s, 6, 0, 0, 7); cx.fill();
        cx.fillStyle = '#c99a1a'; cx.fillRect(e.x + 5.5, e.y + 3, 1, 6 * s + 0.5);
      } else if (e.t === 'bug' && e.alive) drawBug(e);
    });
    // 特效
    g.fx.forEach((f) => {
      if (f.coin) { f.x += f.vx * 0.016; f.y += f.vy * 0.016; f.vy += 900 * 0.016; cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.arc(f.x, f.y, 4, 0, 7); cx.fill(); }
      else if (f.txt) { f.y -= 0.6; cx.globalAlpha = Math.min(1, f.t * 2); cx.fillStyle = f.c; cx.font = '800 11px Syne, sans-serif'; cx.textAlign = 'center'; cx.fillText(f.txt, f.x, f.y); cx.globalAlpha = 1; }
      else if (f.ghost) { const b = f.ghost; cx.globalAlpha = (Math.sin(f.t * 20) + 1) / 2; cx.strokeStyle = '#CCFF00'; cx.lineWidth = 3; cx.strokeRect(b.c * T, b.r * T, AW * T, T);
        cx.fillStyle = '#CCFF00'; cx.font = '800 11px "Noto Sans TC", sans-serif'; cx.textAlign = 'center'; cx.fillText(short(b.o), b.c * T + AW / 2 * T, b.r * T - 4); cx.globalAlpha = 1; }
    });
    drawHero(g.hero);
  }
  function drawTile(c, r, v, th) {
    if (v === E) return;
    const x = c * T, y = r * T, bumped = game.fx.find((f) => f.bump && f.bump[0] === c && f.bump[1] === r);
    const by = bumped ? y - 5 : y;
    if (v === GD) {
      cx.fillStyle = th.dirt; cx.fillRect(x - 0.5, y - 0.5, T + 1, T + 1);
      cx.fillStyle = th.dot; for (let i = 0; i < 3; i++) cx.fillRect(x + ((c * 7 + i * 9 + r * 5) % 20) + 2, y + ((c * 3 + i * 11) % 18) + 3, 3, 2);
      if (r === GROUND || tile(c, r - 1) === E) { cx.fillStyle = th.top; cx.fillRect(x - 0.5, y, T + 1, 6); cx.fillStyle = 'rgba(255,255,255,.18)'; cx.fillRect(x, y, T, 2); }
    } else if (v === BR) {
      cx.fillStyle = th.brick; cx.fillRect(x, by, T, T);
      cx.fillStyle = 'rgba(0,0,0,.3)'; cx.fillRect(x, by + 11, T, 2); cx.fillRect(x, by + T - 2, T, 2); cx.fillRect(x + 11, by, 2, 11); cx.fillRect(x + 5, by + 13, 2, 9); cx.fillRect(x + 17, by + 13, 2, 9);
    } else if (v === QB || v === UB) {
      cx.fillStyle = v === QB ? '#ffc93d' : '#9a6a3a'; cx.fillRect(x, by, T, T);
      cx.fillStyle = 'rgba(0,0,0,.25)'; cx.fillRect(x, by + T - 3, T, 3); cx.fillRect(x + T - 3, by, 3, T);
      cx.fillStyle = 'rgba(255,255,255,.4)'; cx.fillRect(x, by, T, 2);
      if (v === QB) { cx.fillStyle = '#7a3f00'; cx.font = '900 17px Syne, sans-serif'; cx.textAlign = 'center'; cx.fillText('?', x + T / 2, by + 18 + Math.sin(game.clock * 5) * 1.2); }
    } else if (v === AB) {
      const q = game.q, b = q && q.blocks.find((bb) => c >= bb.c && c < bb.c + AW); if (!b) return;
      if (c !== b.c) return;   // 一塊答案磚畫一次（AW 格寬）
      const bb2 = game.fx.find((f) => f.bump && f.bump[1] === r && f.bump[0] >= b.c && f.bump[0] < b.c + AW), yy = bb2 ? y - 5 : y;
      cx.fillStyle = '#ffffff'; cx.fillRect(x, yy, AW * T, T); cx.strokeStyle = '#4ECDC4'; cx.lineWidth = 3; cx.strokeRect(x + 1.5, yy + 1.5, AW * T - 3, T - 3);
    } else if (v === PIPE) {
      const left = tile(c - 1, r) !== PIPE, isTop = tile(c, r - 1) !== PIPE;
      cx.fillStyle = '#2fa84f'; cx.fillRect(x, y, T, T);
      cx.fillStyle = 'rgba(255,255,255,.25)'; if (left) cx.fillRect(x + 4, y, 4, T);
      cx.fillStyle = 'rgba(0,0,0,.25)'; if (!left) cx.fillRect(x + T - 5, y, 5, T);
      if (isTop) { cx.fillStyle = '#38c25c'; cx.fillRect(x - (left ? 3 : 0), y, T + 3, 9); cx.fillStyle = 'rgba(0,0,0,.25)'; cx.fillRect(x - (left ? 3 : 0), y + 8, T + 3, 2); }
    } else if (v === ST) {
      cx.fillStyle = th.brick; cx.fillRect(x, y, T, T); cx.fillStyle = 'rgba(255,255,255,.2)'; cx.fillRect(x, y, T, 3); cx.fillRect(x, y, 3, T);
      cx.fillStyle = 'rgba(0,0,0,.3)'; cx.fillRect(x, y + T - 3, T, 3); cx.fillRect(x + T - 3, y, 3, T);
    }
  }
  function drawBug(e) {
    const x = e.x, y = e.y, t = game.clock * 10, legs = Math.sin(t) * 2;
    cx.fillStyle = '#6a2c91'; cx.beginPath(); cx.ellipse(x + e.w / 2, y + 9, 11, 9, 0, Math.PI, 0); cx.fill();
    cx.fillStyle = '#8f45c2'; cx.fillRect(x + 1, y + 8, e.w - 2, 5);
    cx.fillStyle = '#2b1240'; cx.fillRect(x + 3 + legs, y + 13, 3, 5); cx.fillRect(x + e.w - 6 - legs, y + 13, 3, 5);
    cx.fillStyle = '#fff'; const ex = e.vx < 0 ? x + 4 : x + e.w - 9; cx.fillRect(ex, y + 4, 5, 5); cx.fillStyle = '#000'; cx.fillRect(ex + (e.vx < 0 ? 0 : 3), y + 6, 2, 2);
  }
  function drawHero(h) {
    if (h.inv > 0 && Math.floor(h.inv * 10) % 2) return;   // 無敵時閃爍
    cx.save(); cx.translate(Math.round(h.x + h.w / 2), Math.round(h.y)); cx.scale(h.face, 1);
    const run = h.on && Math.abs(h.vx) > 10 ? Math.floor(h.anim / 14) % 2 : -1;
    const body = '#5ccf5c', dark = '#2f8a3e', belly = '#d9f7a8';
    // 尾巴
    cx.fillStyle = body; cx.beginPath(); cx.moveTo(-6, 11); cx.lineTo(-15, 15); cx.lineTo(-6, 16); cx.fill();
    // 身體＋肚子
    cx.fillStyle = body; cx.fillRect(-7, 6, 14, 11); cx.fillStyle = belly; cx.fillRect(-1, 9, 7, 7);
    // 頭
    cx.fillStyle = body; cx.fillRect(-3, -1, 14, 10); cx.fillStyle = dark; cx.fillRect(-3, -1, 14, 2);
    cx.fillStyle = '#fff'; cx.fillRect(4, 1, 4, 4); cx.fillStyle = '#10140a'; cx.fillRect(6, 2, 2, 2);
    cx.fillStyle = '#10140a'; cx.fillRect(9, 6, 2, 1);
    // 背刺（螢光黃，Jeffrey Lab 色）
    cx.fillStyle = '#CCFF00'; [[-6, 5], [-2, 2], [2, -2]].forEach(([a, b]) => { cx.beginPath(); cx.moveTo(a, b + 3); cx.lineTo(a + 2, b); cx.lineTo(a + 4, b + 3); cx.fill(); });
    // 手
    cx.fillStyle = dark; cx.fillRect(5, 11, 4, 2);
    // 腳
    cx.fillStyle = dark;
    if (!h.on) { cx.fillRect(-5, 17, 4, 4); cx.fillRect(2, 16, 4, 4); }
    else if (run === 0) { cx.fillRect(-6, 17, 4, 5); cx.fillRect(3, 17, 4, 3); }
    else if (run === 1) { cx.fillRect(-4, 17, 4, 3); cx.fillRect(1, 17, 4, 5); }
    else { cx.fillRect(-5, 17, 4, 5); cx.fillRect(2, 17, 4, 5); }
    cx.restore();
  }

  function onClick(e) {
    const t = e.target.closest('[data-wd]'); if (!t) return;
    const a = t.dataset.wd;
    if (a === 'start') { if (typeof unlockAudio === 'function') unlockAudio(); start(); }
    if (a === 'close') close();
    if (a === 'check') check();
    if (a === 'quit') {
      if (game && !game.over && !trial && !confirm(L('離開這一局？這局不會計分。', "Quit this game? It won't be scored."))) return;
      close();
    }
  }
  const _t = { get game() { return game; }, keys, jumpPress, check, end, toPts, ask, die, get trial() { return trial; }, get VW() { return VW; }, T, GROUND };
  return { id: ID, need: NEED, card, bestText, open, close, _t };
})();
GAMES.push(WD);
