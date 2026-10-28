// ═══════════════════════════════════════════════════════
//  獎勵遊戲 #6：Word Brawl 單字無雙（一個人打一大群的割草遊戲）
//  解鎖：精熟 6 個單元（試玩：網址加 ?try=horde，不用解鎖、不計分）
//  v0.2（依 Jeffrey 試玩回饋重做手感）：
//   - 小怪一刀就倒、幾乎傷不到人（爽快割草）；只有大塊頭（會蓄力衝撞）和墨水大王（踩地、噴墨）要閃。
//   - 字母球放大、看得清楚，要走過去才撿得到（不會自動吸）。照順序撿齊拼好單字 → 升級三選一＋打破大王護盾＋集氣。
//   - 「無雙」改成集氣條：打怪、撿字母、拼字都會集氣，滿了自己選招式放（旋風斬／流星雨），放招時慢動作＋畫面震動。
//   - 掉落道具：👟 加速、❄️ 怪物變慢、🍖 補血、💣 炸彈。
//  用學生自己的捏人角色上場；帶寵物的話寵物會一起幫忙打。拼字、選技能、選招式時時間暫停。角色、怪物都是原創。
//  依賴 index.html 的全域：st, $, esc, L, EN, meaning, speak, answersOf, norm, shuffle, todayKey, clockCheck,
//        saveLedger, saveMeta, afterPoints, points, gameWeekBestAll, gameCard, masteredCount, GAMES, toast, confetti,
//        avatarSVG, lookOf, petOf, AV_TOPC
// ═══════════════════════════════════════════════════════
const WH6 = (() => {
  const ID = 'horde', NEED = 6, VER = '0.4';
  const TIME = 180, CAP = 20, S_PER_PT = 300;   // 每 300 分 1 ⭐ — 分數主要來自拼字，打小怪只有一點點
  const P = { kill: 1, brute: 10, letter: 15, word: 250, boss: 400 };   // v0.4：分數以拼字為主；無雙、炸彈打倒的怪不給分
  const G_GAIN = { kill: 1, brute: 6, letter: 4, word: 35 }, G_MAX = 100;   // 無雙集氣
  const HERO_R = 14, PICK = 24, BUFF = 8, ORB_R = 21, MAX_ORBS = 3;
  const JOY_R = 52;   // 左下角固定搖桿
  const BOSS_AT = [55, 120], BOSS_HP = 900;
  const SKILLS = [
    { id: 'pow', ic: '⚔️', name: ['攻擊力 +30%', 'Damage +30%'] },
    { id: 'area', ic: '🌀', name: ['攻擊範圍 +25%', 'Range +25%'] },
    { id: 'rate', ic: '⚡', name: ['攻擊速度 +20%', 'Attack speed +20%'] },
    { id: 'move', ic: '👟', name: ['移動速度 +15%', 'Move speed +15%'] },
    { id: 'heal', ic: '❤️', name: ['補血 40，血量上限 +20', 'Heal 40, max HP +20'] },
    { id: 'magnet', ic: '🧲', name: ['撿東西範圍變大', 'Bigger pickup range'] },
    { id: 'orbit', ic: '🔥', name: ['火球繞身（再選再多一顆）', 'Orbiting fireball (+1 each time)'] },
    { id: 'pet', ic: '🐾', name: ['寵物攻擊加倍', 'Pet damage ×2'], pet: true },
  ];
  const ITEMS = {
    boots: { ic: '👟', name: ['加速', 'Speed up'] }, ice: { ic: '❄️', name: ['怪物變慢', 'Monsters slow down'] },
    meat: { ic: '🍖', name: ['補血 30', 'Heal 30'] }, bomb: { ic: '💣', name: ['炸彈', 'Bomb'] },
  };
  const MOVES = [
    { id: 'whirl', ic: '🌪️', name: ['旋風斬', 'Whirlwind'], desc: ['繞著自己轉 4 秒，靠近的怪全部打飛', 'Spin for 4s, smashing everything nearby'] },
    { id: 'meteor', ic: '☄️', name: ['流星雨', 'Meteor rain'], desc: ['全畫面落下流星，大王也打得到', 'Meteors rain on the whole screen, boss included'] },
  ];
  let cv, cx, root, S = 1, LW = 360, LH = 640, dpr = 1;
  let game = null, raf = 0, trial = false, joy = null, heroImg = null, petImg = null, look = null, lastW = 0, lastH = 0;
  const keys = {};

  const unlocked = () => masteredCount() >= NEED;
  const spellPool = () => st.words.filter((w) => /^[a-z]{3,9}$/i.test(w.word) && meaning(w));
  const toPts = (sc) => Math.min(CAP, Math.floor(sc / S_PER_PT));
  const card = () => gameCard({ id: ID, need: NEED, icon: '⚔️', name: 'Word Brawl 單字無雙' });
  const bestText = () => { const b = st.meta.games && st.meta.games[ID] && st.meta.games[ID].best; return b ? `Word Brawl ${b}` : ''; };
  const short = (w) => String(meaning(w) || '').split(/[；;,，]/)[0].trim();
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ── 角色圖：用捏人系統的 SVG 畫成圖片（寵物另外一張，會跟在旁邊幫忙打） ──
  function loadSprites() {
    look = typeof lookOf === 'function' ? lookOf() : null;
    heroImg = petImg = null;
    if (!look || typeof avatarSVG !== 'function') return;
    const toImg = (svg, cb) => { const img = new Image(); img.onload = () => cb(img); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); };
    toImg(avatarSVG({ ...look, pet: 'none' }, '', 'body').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="304" '), (i) => (heroImg = i));
    if (look.pet && look.pet !== 'none' && typeof petOf === 'function') {
      const vb = look.pet === 'bird' ? '58 52 40 38' : ['dragon', 'trex', 'unicorn'].includes(look.pet) ? '74 82 56 56' : '76 86 52 52';
      toImg(`<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="${vb}"><g>${petOf(look.pet)}</g></svg>`, (i) => (petImg = i));
    }
  }
  const hasPet = () => !!(look && look.pet && look.pet !== 'none');

  // ── 畫面 ──
  function mount() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'wj wr wh6';
    root.innerHTML = `<canvas></canvas>
      <div class="wb-banner" id="whBanner"></div>
      <div class="wh-word" id="whWord" style="display:none"></div>
      <div class="wj-hud"><button class="wj-x" data-wh="quit">✕</button>
        <span class="wh-hp"><i id="whHp"></i></span><span class="wj-h" id="whLv">Lv1</span>
        <span class="wj-t" id="whT">3:00</span><span class="wj-h" id="whS">0</span><span class="wj-p" id="whP">⭐ 0</span></div>
      <button class="wh-musou" id="whMusou" data-wh="musou"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/><circle id="whRing" cx="50" cy="50" r="44"/></svg><b>無雙</b><small id="whMu">0%</small></button>
      <div class="wj-pane" id="whPane"></div>`;
    document.body.appendChild(root);
    if (!document.getElementById('whCss')) {
      const s = document.createElement('style'); s.id = 'whCss';
      s.textContent = `.wj.wh6{left:0;right:0;width:auto;transform:none;box-shadow:none}
        .wh-hp{width:84px;height:14px;padding:0!important;border-radius:8px!important;overflow:hidden;background:rgba(0,0,0,.5)!important;position:relative}
        .wh-hp i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#ff6b57,#ffb547);border-radius:8px;transition:width .15s}
        .wh-word{position:absolute;left:8px;right:8px;top:calc(env(safe-area-inset-top,0px) + 56px);z-index:3;display:flex;justify-content:center;pointer-events:none}
        .wh-word .in{display:flex;align-items:center;gap:10px;background:rgba(10,14,24,.86);border:2px solid #CCFF00;border-radius:16px;padding:6px 10px 6px 14px;max-width:100%}
        .wh-word .zh{color:#CCFF00;font-weight:800;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px}
        .wh-word .slots{display:flex;gap:4px}
        .wh-word .slots b{width:22px;height:28px;border-radius:6px;background:rgba(255,255,255,.1);border-bottom:3px solid rgba(255,255,255,.4);color:#fff;
          font:800 18px Syne,sans-serif;display:flex;align-items:center;justify-content:center}
        .wh-word .slots b.ok{background:#CCFF00;color:#10140a;border-color:#8fb300}
        .wh-word .slots b.pop{animation:whPop .45s}
        .wj.wh6 .wb-banner{bottom:auto;top:calc(env(safe-area-inset-top,0px) + 116px)}
        @keyframes whPop{0%{transform:scale(1)}40%{transform:scale(1.6) translateY(-6px)}100%{transform:scale(1)}}
        .wh-word .slots b.next{border-color:#ffb547;box-shadow:0 0 8px #ffb547}
        .wh-word .slots b.hint{color:rgba(255,255,255,.4)}
        .wh-word .spk{pointer-events:auto}
        .wh-musou{position:absolute;right:calc(env(safe-area-inset-right,0px) + 16px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px);z-index:4;width:84px;height:84px;
          border:none;border-radius:50%;background:rgba(10,14,24,.75);color:#fff;display:none;flex-direction:column;align-items:center;justify-content:center;padding:0}
        .wh-musou svg{position:absolute;inset:0;transform:rotate(-90deg)}
        .wh-musou circle{fill:none;stroke:rgba(255,255,255,.15);stroke-width:8}
        .wh-musou #whRing{stroke:#ffb547;stroke-dasharray:276.5;stroke-dashoffset:276.5;transition:stroke-dashoffset .2s}
        .wh-musou b{font:900 18px "Noto Sans TC",sans-serif;position:relative}.wh-musou small{font:700 11px Syne,sans-serif;opacity:.8;position:relative}
        .wh-musou.full{background:radial-gradient(#ff8a3c,#b3261e);animation:whPulse .6s infinite alternate}
        .wh-musou.full #whRing{stroke:#fff}
        @keyframes whPulse{from{transform:scale(1);box-shadow:0 0 10px #ffb547}to{transform:scale(1.08);box-shadow:0 0 30px #ffb547}}
        .wh-sk{display:grid;grid-template-columns:1fr;gap:10px;margin:14px 0 6px}
        .wh-sk .btn{display:flex;align-items:center;gap:12px;justify-content:flex-start;font-size:16px;padding:14px 16px;border-color:#4ECDC4;text-align:left}
        .wh-sk .btn span{font-size:26px}.wh-sk .btn small{display:block;font-size:12px;opacity:.75;font-weight:500}
        .wh-sk.mv .btn{border-color:#ffb547}
        @media (orientation:landscape){.wh-sk{grid-template-columns:1fr 1fr 1fr}.wh-sk.mv{grid-template-columns:1fr 1fr}.wh-sk .btn{flex-direction:column;justify-content:center;font-size:14px;text-align:center}
          .wh6 .wj-card{max-width:720px}.wh6 .wj-ic{display:none}.wh6 .wj-rules{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;font-size:12.5px;line-height:1.45}}`;
      document.head.appendChild(s);
    }
    cv = root.querySelector('canvas'); cx = cv.getContext('2d');
    root.addEventListener('click', onClick);
    // 搖桿（v0.4）：固定在左下角；畫面左半邊任何地方按下都算，方向＝從搖桿中心指向手指（拇指放著不用找）
    const setJoy = (e) => { const p = toLogic(e), c = joyC(); let dx = p.x - c.x, dy = p.y - c.y; const d = Math.hypot(dx, dy); if (d > JOY_R) { dx = dx / d * JOY_R; dy = dy / d * JOY_R; } joy.dx = dx; joy.dy = dy; };
    cv.addEventListener('pointerdown', (e) => {
      if (!game || game.over || paused()) return;
      const p = toLogic(e); if (p.x > LW * 0.55) return;   // 右半邊不是搖桿（右下角是無雙按鈕）
      e.preventDefault(); cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
      joy = { id: e.pointerId, dx: 0, dy: 0 }; setJoy(e);
    });
    cv.addEventListener('pointermove', (e) => { if (joy && joy.id === e.pointerId) setJoy(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => cv.addEventListener(ev, (e) => { if (joy && joy.id === e.pointerId) joy = null; }));
    addEventListener('keydown', (e) => { keys[e.key] = true; if (e.key === ' ' && game && game.gauge >= G_MAX && !paused()) { e.preventDefault(); offerMoves(); } });
    addEventListener('keyup', (e) => { keys[e.key] = false; });
    addEventListener('resize', resize);
  }
  const joyC = () => ({ x: 26 + JOY_R, y: LH - 30 - JOY_R });
  const paused = () => !!(game && (game.menu || game.spell || game.moveMenu));
  const toLogic = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * LW, y: (e.clientY - r.top) / r.height * LH }; };
  function resize() {
    if (!root) return;
    const w = root.clientWidth, h = root.clientHeight; dpr = Math.min(2, devicePixelRatio || 1); lastW = w; lastH = h;
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    S = Math.min(w, h) * dpr / 360;   // 短邊＝360 個單位
    LW = w * dpr / S; LH = h * dpr / S;
    if (game) { game.hero.x = Math.min(game.hero.x, LW - 20); game.hero.y = Math.min(game.hero.y, LH - 20); }
  }
  const pane = (html) => { const p = root.querySelector('#whPane'); p.innerHTML = html; p.style.display = html ? '' : 'none'; if (html) joy = null; };
  // 畫面上方（題目框下面）不能走的範圍
  const topY = () => {   // 題目框隱藏時（選單打開）用 HUD 下方＋題目框高度估計，大王血條才不會跑到 HUD 上
    const el = root && root.querySelector('#whWord .in'), hudEl = root && root.querySelector('.wj-hud'), r = cv.getBoundingClientRect(); if (!r.height) return 100;
    const px = el && el.offsetParent ? el.getBoundingClientRect().bottom : hudEl ? hudEl.getBoundingClientRect().bottom + 52 : r.top + 100;
    return (px - r.top) / r.height * LH + 6;
  };

  // ── 開始畫面 ──
  function open(opts) {
    trial = !!(opts && opts.trial);
    if (!trial && !unlocked()) return toast(L(`精熟 ${NEED} 個單元後解鎖`, `Master ${NEED} units to unlock`));
    if (spellPool().length < 4) return toast(L('單字太少，還不能玩', 'Not enough words yet'));
    mount(); root.classList.add('show'); resize(); loadSprites();
    document.body.style.overflow = 'hidden';
    const best = gameWeekBestAll(), pb = (st.meta.games && st.meta.games[ID] && st.meta.games[ID].best) || 0;
    game = null; showWord(); musouBtn(); draw();
    pane(`<div class="wj-card">
      <div class="wj-ic">⚔️</div>
      <h2>Word Brawl 單字無雙</h2>
      <div class="wj-rules">
        <div>🧍 ${L('用你自己捏的角色上場！帶了寵物的話，寵物也會一起幫忙打', 'Fight as your own avatar! Your pet fights too')}</div>
        <div>🕹️ ${L('左下角搖桿移動（左半邊按下都算），角色自動攻擊；小怪一刀就倒，大塊頭會蓄力衝撞，要閃', 'Joystick bottom-left (anywhere on the left half) — attacks are automatic. Small fry fall in one hit; dodge the big ones when they charge')}</div>
        <div>🔤 ${L('上面是一個字的中文：怪物會掉字母球，走過去照順序撿齊就拼好這個字', 'Monsters drop letter balls — walk over them in order to spell the word')}</div>
        <div>⬆️ ${L(`拼好一個字 +${P.word}，升級三選一技能，還能打破墨水大王的護盾`, `Spell it: +${P.word}, pick a skill, and break the Ink King's shield`)}</div>
        <div>💥 ${L('打怪、撿字母、拼字都會集「無雙」氣，滿了按右下角，自己選招式放大絕', 'Fill the MUSOU gauge, then tap the button to choose your super move')}</div>
        <div>🎁 ${L('撿道具：👟 加速、❄️ 怪物變慢、🍖 補血、💣 炸彈', 'Items: 👟 speed, ❄️ slow monsters, 🍖 heal, 💣 bomb')}</div>
        <div>✏️ ${L('血量用完：拼出一個字就能繼續（拼字、選技能時時間暫停）', 'Out of HP: spell a word to keep going (clock pauses)')}</div>
        <div>⭐ ${trial ? L('試玩模式：不計分', 'Trial: not scored') : L(`每 ${S_PER_PT} 分 1 顆星（分數主要靠拼字），最多 ${CAP}；所有遊戲每週只算最高一局`, `1 ⭐ per ${S_PER_PT} points (mostly from spelling), up to ${CAP}; best game of the week counts`)}</div>
      </div>
      <p class="wj-small">${trial ? L('🧪 試玩版', '🧪 Trial') : L(`本週遊戲最佳 ${best} / ${CAP} ⭐・個人最高 ${pb} 分`, `Best this week ${best} / ${CAP} ⭐ · Personal best ${pb}`)}<br><span style="opacity:.5">v${VER}</span></p>
      <div class="btnrow"><button class="btn" data-wh="start">${L('開始 Start ▶', 'Start ▶')}</button><button class="btn ghost" data-wh="close">${L('離開', 'Exit')}</button></div>
    </div>`);
  }
  function close() {
    cancelAnimationFrame(raf); game = null; joy = null;
    if (root) root.classList.remove('show');
    document.body.style.overflow = '';
    if (typeof renderQuiz === 'function' && $('v-quiz') && $('v-quiz').classList.contains('active')) renderQuiz();
  }

  // ── 遊戲 ──
  function start() {
    joy = null;
    game = {
      elapsed: 0, last: performance.now(), clock: 0,
      hero: { x: LW / 2, y: LH * 0.6, hp: 100, max: 100, face: 1, inv: 1, atkT: 0.3, walk: 0 },
      pet: { x: LW / 2 - 30, y: LH * 0.6, t: 1 },
      mod: { pow: 1, area: 1, rate: 1, move: 1, magnet: 1, orbit: 0, pet: 1 }, lv: 1,
      foes: [], orbs: [], items: [], shots: [], hazards: [], fx: [], spawnT: 0.6, bruteT: 18, bossIdx: 0, boss: null, shieldOff: 0,
      buff: { boots: 0, ice: 0 }, gauge: 0, slow: 0, shake: 0, whirl: 0, whirlT: 0, meteors: [],
      w: null, idx: 0, miss: 0, used: new Set(), sinceNeed: 0,
      score: 0, kills: 0, words: 0, bosses: 0, deaths: 0, musous: 0, menu: false, moveMenu: false, spell: null, over: false,
    };
    pane(''); nextWord(); musouBtn(); loop();
  }
  function nextWord() {
    const g = game, pool = spellPool(), fresh = pool.filter((w) => !g.used.has(w.id));
    g.w = shuffle(fresh.length ? fresh : pool)[0]; g.used.add(g.w.id); g.idx = 0; g.miss = 0;
    showWord(); speak(g.w.word);
  }
  function showWord() {
    const el = root && root.querySelector('#whWord'); if (!el) return;
    const g = game;
    if (!g || !g.w || g.over || paused()) { el.style.display = 'none'; return; }
    const a = g.w.word.toLowerCase();
    el.style.display = '';
    el.innerHTML = `<div class="in"><span class="zh">${esc(short(g.w))}</span><span class="slots">${a.split('').map((c, i) =>
      i < g.idx ? `<b class="ok ${i === g.popSlot ? 'pop' : ''}">${esc(c)}</b>` : i === g.idx ? `<b class="next ${g.miss >= 3 ? 'hint' : ''}">${g.miss >= 3 ? esc(c) : ''}</b>` : '<b></b>').join('')}</span>
      <button class="spk small" data-say="${esc(g.w.word)}">🔊</button></div>`;
  }
  function musouBtn() {
    const b = root && root.querySelector('#whMusou'); if (!b) return;
    const g = game, show = g && !g.over && !paused();
    b.style.display = show ? 'flex' : 'none'; if (!g) return;
    const k = Math.min(1, g.gauge / G_MAX);
    root.querySelector('#whRing').style.strokeDashoffset = 276.5 * (1 - k);
    root.querySelector('#whMu').textContent = k >= 1 ? 'GO!' : `${Math.floor(k * 100)}%`;
    b.classList.toggle('full', k >= 1);
  }
  const addGauge = (n) => { const g = game, was = g.gauge >= G_MAX; g.gauge = Math.min(G_MAX, g.gauge + n); if (!was && g.gauge >= G_MAX) banner('💥', L('無雙集滿了！', 'MUSOU ready!'), L('按右下角選招式', 'Tap the button to choose a move'), '#ffb547'); };

  function loop() {
    raf = requestAnimationFrame(loop);
    const g = game; if (!g) return;
    if (root.clientWidth !== lastW || root.clientHeight !== lastH) resize();
    const now = performance.now(), real = (now - g.last) / 1000; g.last = now;
    if (paused()) {   // 選技能、選招式、拼字時暫停
      // 保險：暫停中但選單不見了（兩個選單同時跳出時會發生）→ 解除，避免卡住
      if (!root.querySelector('#whPane').innerHTML) { if (g.spell) renderSpell(); else { g.menu = false; g.moveMenu = false; showWord(); musouBtn(); } }
      hud(); draw(); return;
    }
    if (g.lvAt && now >= g.lvAt) { g.lvAt = 0; levelUp(); hud(); draw(); return; }
    let dt = Math.min(0.033, real);
    if (g.slow > 0) { g.slow -= dt; dt *= 0.22; }   // 放大絕：慢動作
    if (g.shake > 0) g.shake -= Math.min(0.033, real);
    g.clock += dt; g.elapsed += real;
    if (TIME - g.elapsed <= 0) return end();
    step(dt); hud(); draw();
  }
  const nearest = (x, y, maxD) => { let best = null, bd = maxD; for (const f of game.foes) { const d = Math.hypot(f.x - x, f.y - y) - f.r; if (d < bd) { bd = d; best = f; } } return best; };

  function step(dt) {
    const g = game, h = g.hero, m = g.mod, ty = topY();
    g.fx = g.fx.filter((f) => (f.t -= dt) > 0);
    for (const k in g.buff) if (g.buff[k] > 0) g.buff[k] -= dt;
    // 移動
    let mx = 0, my = 0;
    if (joy) { const d = Math.hypot(joy.dx, joy.dy); if (d > 5) { const k = Math.min(1, d / 20) / d; mx = joy.dx * k; my = joy.dy * k; } }   // 輕推就全速
    if (keys.ArrowLeft || keys.a) mx = -1; if (keys.ArrowRight || keys.d) mx = 1; if (keys.ArrowUp || keys.w) my = -1; if (keys.ArrowDown || keys.s) my = 1;
    const ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; }
    const sp = 140 * m.move * (g.buff.boots > 0 ? 1.6 : 1);
    h.x = Math.max(16, Math.min(LW - 16, h.x + mx * sp * dt)); h.y = Math.max(ty + (g.boss ? 44 : 24), Math.min(LH - 16, h.y + my * sp * dt));
    btnCorner(h);
    if (Math.abs(mx) > 0.15) h.face = mx > 0 ? 1 : -1;
    h.walk += Math.hypot(mx, my) * dt * 10;
    if (h.inv > 0) h.inv -= dt;
    if (g.shieldOff > 0) g.shieldOff -= dt;
    // 出怪：小怪一群一群來；大塊頭每隔幾秒一隻
    const el = g.elapsed;
    if ((g.spawnT -= dt) <= 0 && g.foes.length < 110) {
      g.spawnT = Math.max(0.3, 0.75 - el * 0.0025);
      const n = 2 + (el > 60 ? 1 : 0) + (el > 120 ? 1 : 0);
      spawnPack(n, el);
    }
    if ((g.bruteT -= dt) <= 0) { g.bruteT = Math.max(5, 10 - el * 0.03); spawnOne('brute', el); }
    if (g.bossIdx < BOSS_AT.length && el >= BOSS_AT[g.bossIdx] && !g.boss) { g.bossIdx++; spawnBoss(); }
    // 自動攻擊：揮向最近的怪（大範圍扇形）
    if ((h.atkT -= dt) <= 0) {
      const R = 74 * m.area, t = nearest(h.x, h.y, R);
      if (t) {
        h.atkT = 0.32 / m.rate;
        const ang = Math.atan2(t.y - h.y, t.x - h.x); h.face = Math.cos(ang) >= 0 ? 1 : -1;
        g.fx.push({ t: 0.16, slash: 1, x: h.x, y: h.y, a: ang, r: R });
        g.foes.slice().forEach((f) => {
          const d = Math.hypot(f.x - h.x, f.y - h.y) - f.r; if (d > R) return;
          let da = Math.atan2(f.y - h.y, f.x - h.x) - ang; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
          if (Math.abs(da) < 1.3 || d < 14) hurtFoe(f, 14 * m.pow, ang);
        });
      } else h.atkT = 0.08;
    }
    // 火球繞身
    for (let i = 0; i < m.orbit; i++) {
      const a = g.clock * 3 + i * Math.PI * 2 / m.orbit, ox = h.x + Math.cos(a) * 54, oy = h.y + Math.sin(a) * 54;
      g.foes.slice().forEach((f) => { if (Math.hypot(f.x - ox, f.y - oy) < f.r + 10 && !(f.ot > 0)) { f.ot = 0.4; hurtFoe(f, 14 * m.pow, a + 1.57); } });
    }
    // 大絕：旋風斬
    if (g.whirl > 0) {
      g.whirl -= dt; h.inv = Math.max(h.inv, 0.2);
      if ((g.whirlT -= dt) <= 0) {
        g.whirlT = 0.12;
        g.foes.slice().forEach((f) => { const d = Math.hypot(f.x - h.x, f.y - h.y) - f.r; if (d < 125) hurtFoe(f, (f.type === 'boss' ? 22 : 45) * m.pow, Math.atan2(f.y - h.y, f.x - h.x), true); });
      }
    }
    // 大絕：流星雨
    g.meteors = g.meteors.filter((mt) => {
      mt.t -= dt; if (mt.t > 0) return true;
      g.shake = Math.max(g.shake, 0.15); g.fx.push({ t: 0.35, boom: 1, x: mt.x, y: mt.y, r: 62 });
      g.foes.slice().forEach((f) => { if (Math.hypot(f.x - mt.x, f.y - mt.y) - f.r < 62) hurtFoe(f, (f.type === 'boss' ? 70 : 120) * m.pow, Math.atan2(f.y - mt.y, f.x - mt.x), true); });
      return false;
    });
    // 寵物：跟在後面，每 1 秒丟一顆小球
    if (hasPet()) {
      const pt = g.pet, tx = h.x - h.face * 30, tyy = h.y + 6;
      pt.x += (tx - pt.x) * Math.min(1, dt * 5); pt.y += (tyy - pt.y) * Math.min(1, dt * 5);
      if ((pt.t -= dt) <= 0) {
        const t = nearest(pt.x, pt.y, 200);
        if (t) { pt.t = 1; const a = Math.atan2(t.y - pt.y, t.x - pt.x); g.shots.push({ x: pt.x, y: pt.y, vx: Math.cos(a) * 320, vy: Math.sin(a) * 320, t: 0.8, dmg: 14 * m.pet }); }
        else pt.t = 0.2;
      }
    }
    g.shots = g.shots.filter((s) => {
      s.x += s.vx * dt; s.y += s.vy * dt; s.t -= dt;
      const f = g.foes.find((f2) => Math.hypot(f2.x - s.x, f2.y - s.y) < f2.r + 5);
      if (f) { hurtFoe(f, s.dmg, Math.atan2(s.vy, s.vx)); return false; }
      return s.t > 0;
    });
    // 怪物：小怪往角色走（碰到只扣一點點）；大塊頭會停下來蓄力再衝；大王會踩地、噴墨
    const slowK = g.buff.ice > 0 ? 0.35 : 1;
    for (const f of g.foes) {
      if (f.ot > 0) f.ot -= dt; if (f.flash > 0) f.flash -= dt;
      const dx = h.x - f.x, dy = h.y - f.y, d = Math.hypot(dx, dy) || 1;
      if (f.type === 'brute') bruteAI(f, dx, dy, d, dt, slowK);
      else if (f.type === 'boss') bossAI(f, dx, dy, d, dt, slowK);
      else { f.x += (dx / d * f.sp * slowK + f.kx) * dt; f.y += (dy / d * f.sp * slowK + f.ky) * dt; }
      f.kx *= 0.86; f.ky *= 0.86;
      if (d < f.r + HERO_R && h.inv <= 0) {
        const dmg = f.state === 'dash' ? f.dmg * 1.6 : f.dmg;
        if (hurtHero(dmg, f.type === 'slime' || f.type === 'bat' ? 0.5 : 0.8)) return;
      }
    }
    // 大王的攻擊範圍（紅圈：時間到才會打下來）、墨水彈
    g.hazards = g.hazards.filter((hz) => {
      hz.t -= dt;
      if (hz.kind === 'ink') { hz.x += hz.vx * dt; hz.y += hz.vy * dt; if (Math.hypot(hz.x - h.x, hz.y - h.y) < 9 + HERO_R && h.inv <= 0) { if (hurtHero(10, 0.8)) return false; return false; } return hz.t > 0 && hz.x > -30 && hz.x < LW + 30 && hz.y > -30 && hz.y < LH + 30; }
      if (hz.t <= 0) {   // 踩地
        g.shake = 0.3; g.fx.push({ t: 0.35, boom: 1, x: hz.x, y: hz.y, r: hz.r, c: '#b48cff' });
        if (Math.hypot(hz.x - h.x, hz.y - h.y) < hz.r + HERO_R * 0.5 && h.inv <= 0) hurtHero(22, 1);
        return false;
      }
      return true;
    });
    if (g.spell) return;
    // 字母球、道具：走過去才撿得到
    const pr = PICK * m.magnet;
    g.orbs = g.orbs.filter((o) => {
      o.t -= dt; if (o.pop > 0) { o.pop -= dt; o.x += o.vx * dt; o.y += o.vy * dt; o.vx *= 0.9; o.vy *= 0.9; }
      o.x = Math.max(18, Math.min(LW - 18, o.x)); o.y = Math.max(ty + 26, Math.min(LH - 18, o.y)); btnCorner(o);   // 不會掉在走不到、被按鈕蓋住的地方
      if (o.t <= 0) return false;
      if (m.magnet > 1 && Math.hypot(o.x - h.x, o.y - h.y) < pr * 2) { o.x += (h.x - o.x) * Math.min(1, dt * 3); o.y += (h.y - o.y) * Math.min(1, dt * 3); }
      if (o.pop <= 0 && Math.hypot(o.x - h.x, o.y - h.y) < pr) { pick(o.c, o); return false; }
      return true;
    });
    g.items = g.items.filter((it) => {
      it.t -= dt; if (it.t <= 0) return false;
      it.x = Math.max(18, Math.min(LW - 18, it.x)); it.y = Math.max(ty + 26, Math.min(LH - 18, it.y)); btnCorner(it);
      if (Math.hypot(it.x - h.x, it.y - h.y) < pr + 4) { useItem(it); return false; }
      return true;
    });
  }
  // 右下角是無雙按鈕：角色、字母、道具都不能躲在按鈕下面
  function btnCorner(o) {   // 右下角無雙按鈕、左下角搖桿：角色、字母、道具都不能躲在下面
    const c = 108, j = 26 + JOY_R * 2 + 8;
    if (o.x > LW - c && o.y > LH - c) { if (o.x - (LW - c) < o.y - (LH - c)) o.x = LW - c; else o.y = LH - c; }
    if (o.x < j && o.y > LH - j - 4) { if (j - o.x < o.y - (LH - j - 4)) o.x = j; else o.y = LH - j - 4; }
  }
  function hurtHero(dmg, inv) {
    const g = game, h = g.hero;
    h.hp -= dmg; h.inv = inv; g.fx.push({ t: 0.5, txt: `−${Math.round(dmg)}`, x: h.x, y: h.y - 36, c: '#ff6b57' });
    if (dmg >= 10) g.shake = Math.max(g.shake, 0.18);
    if (h.hp <= 0) { h.hp = 0; die(); return true; }
    return false;
  }
  function bruteAI(f, dx, dy, d, dt, slowK) {   // 大塊頭：走近 → 停下來發紅蓄力 0.8 秒 → 朝當時的位置衝過去
    f.st = (f.st === undefined ? 2 : f.st) - dt;
    if (f.state === 'charge') { if (f.st <= 0) { f.state = 'dash'; f.st = 0.55; const a = Math.atan2(f.ty - f.y, f.tx - f.x); f.vx = Math.cos(a) * 300; f.vy = Math.sin(a) * 300; } }
    else if (f.state === 'dash') { f.x += f.vx * dt * slowK; f.y += f.vy * dt * slowK; if (f.st <= 0) { f.state = 'walk'; f.st = rnd(2.2, 3.2); } }
    else {
      f.x += (dx / d * f.sp * slowK + f.kx) * dt; f.y += (dy / d * f.sp * slowK + f.ky) * dt;
      if (f.st <= 0 && d < 220) { f.state = 'charge'; f.st = 0.8; f.tx = game.hero.x; f.ty = game.hero.y; }
    }
  }
  function bossAI(f, dx, dy, d, dt, slowK) {   // 墨水大王：慢慢走；踩地（先出現紅圈）、噴八方墨水彈
    const g = game;
    f.x += (dx / d * f.sp * slowK + f.kx * 0.3) * dt; f.y += (dy / d * f.sp * slowK + f.ky * 0.3) * dt;
    f.st = (f.st === undefined ? 2.5 : f.st) - dt;
    if (f.st <= 0) {
      if ((f.k = (f.k || 0) + 1) % 2) { g.hazards.push({ kind: 'slam', x: g.hero.x, y: g.hero.y, r: 70, t: 1.1, t0: 1.1 }); f.st = 3; }
      else { for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + g.clock; g.hazards.push({ kind: 'ink', x: f.x, y: f.y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, t: 4 }); } f.st = 3.2; }
    }
  }
  function spawnPack(n, el) {   // 小怪從同一邊一群出來
    const side = Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) spawnOne(el > 15 && Math.random() < 0.35 ? 'bat' : 'slime', el, side);
  }
  function spawnOne(type, el, side0) {
    const g = game, side = side0 !== undefined ? side0 : Math.floor(Math.random() * 4), ty = topY();
    const x = side === 0 ? -20 - rnd(0, 30) : side === 1 ? LW + 20 + rnd(0, 30) : rnd(0, LW), y = side === 2 ? ty - 10 : side === 3 ? LH + 20 + rnd(0, 30) : rnd(ty, LH);
    const base = { slime: { r: 12, hp: 10, sp: 46, dmg: 1 }, bat: { r: 10, hp: 7, sp: 78, dmg: 1 }, brute: { r: 20, hp: 90, sp: 34, dmg: 14 } }[type];
    const hpK = type === 'brute' ? 1 + el / 100 : 1 + el / 300;   // 小怪後期也大多一刀倒
    g.foes.push({ type, x, y, r: base.r, hp: base.hp * hpK, max: base.hp * hpK, sp: base.sp * (1 + el / 500), dmg: base.dmg, kx: 0, ky: 0, ph: Math.random() * 6, state: 'walk' });
  }
  function spawnBoss() {
    const g = game, hp = BOSS_HP * (1 + Math.max(0, g.bossIdx - 1) * 0.6);
    g.boss = { type: 'boss', x: LW / 2, y: topY() + 30, r: 34, hp, max: hp, sp: 26, dmg: 16, kx: 0, ky: 0, ph: 0, st: 2.5 };
    g.foes.push(g.boss);
    g.shake = 0.5;
    banner('👹', L('墨水大王來了！', 'The Ink King is here!'), L('有護盾：拼好一個字或放無雙打破它；看到紅圈快閃開', 'Shielded — spell a word or use MUSOU. Dodge the red circles!'), '#b48cff');
  }
  function hurtFoe(f, dmg, ang, musou) {
    const g = game;
    if (f.type === 'boss' && g.shieldOff <= 0) dmg *= musou ? 0.6 : 0.2;   // 護盾
    f.hp -= dmg; f.flash = 0.1;
    const kb = f.type === 'boss' ? 20 : f.type === 'brute' ? 70 : 220; f.kx += Math.cos(ang) * kb; f.ky += Math.sin(ang) * kb;
    if (f.hp <= 0) kill(f, musou);
  }
  function kill(f, musou) {
    const g = game, i = g.foes.indexOf(f); if (i < 0) return;
    g.foes.splice(i, 1);
    if (f.type === 'boss') {
      g.boss = null; g.bosses++; g.score += P.boss; g.shake = 0.6;
      burst(f.x, f.y, '#b48cff', 40);
      g.items.push({ k: 'meat', x: f.x, y: f.y, t: 12 });
      banner('👑', L(`打倒墨水大王！+${P.boss}`, `Ink King defeated! +${P.boss}`), '', '#CCFF00');
      return;
    }
    const big = f.type === 'brute';
    g.kills++; if (!musou) { g.score += big ? P.brute : P.kill; addGauge(big ? G_GAIN.brute : G_GAIN.kill); }
    burst(f.x, f.y, big ? '#ff9a3c' : f.type === 'bat' ? '#b48cff' : '#4ECDC4', big ? 16 : 6);
    if (g.orbs.length < MAX_ORBS && Math.random() < (big ? 1 : 0.2)) drop(f.x, f.y);
    if (Math.random() < (big ? 0.4 : 0.02) && g.items.length < 3) g.items.push({ k: ['boots', 'ice', 'meat', 'bomb'][Math.floor(Math.random() * 4)], x: f.x + rnd(-10, 10), y: f.y, t: 10 });
  }
  // 掉字母：一半是下一個要的字母、一半干擾；場上沒有正確的而且太久沒掉，就保證掉一個
  function drop(x, y) {
    const g = game, a = g.w.word.toLowerCase(), need = a[g.idx]; if (!need) return;
    // 場上最多 3 顆：正確的那顆一定先出現，之後才補 1～2 顆干擾
    const onField = g.orbs.some((o) => o.c === need);
    let c;
    if (!onField) c = need;
    else { const others = a.split('').filter((ch) => ch !== need), al = 'abcdefghijklmnopqrstuvwxyz'.replace(need, ''); c = others.length && Math.random() < 0.5 ? others[Math.floor(Math.random() * others.length)] : al[Math.floor(Math.random() * al.length)]; }
    const ang = Math.random() * 6.28;
    g.orbs.push({ c, x, y, vx: Math.cos(ang) * 120, vy: Math.sin(ang) * 120, pop: 0.35, t: 14 });
    g.fx.push({ t: 0.6, ring: 1, x, y });
  }
  function pick(c, o) {
    const g = game, a = g.w.word.toLowerCase();
    if (c === a[g.idx]) {
      g.idx++; g.miss = 0; g.score += P.letter; addGauge(G_GAIN.letter); g.popSlot = g.idx - 1;
      if (g.idx < a.length) speak(c.toUpperCase());   // 唸字母
      g.fx.push({ t: 0.7, txt: c.toUpperCase(), x: o ? o.x : g.hero.x, y: (o ? o.y : g.hero.y) - 20, c: '#CCFF00', big: 1 });
      if (g.idx >= a.length) { showWord(); return wordDone(); }
    } else {
      g.miss++; g.fx.push({ t: 0.7, txt: `✕ ${c}`, x: o ? o.x : g.hero.x, y: (o ? o.y : g.hero.y) - 20, c: '#ff6b57' });
    }
    showWord();
  }
  function useItem(it) {
    const g = game, h = g.hero, d = ITEMS[it.k];
    if (it.k === 'boots' || it.k === 'ice') g.buff[it.k] = BUFF;
    if (it.k === 'meat') h.hp = Math.min(h.max, h.hp + 30);
    if (it.k === 'bomb') { g.shake = 0.3; g.fx.push({ t: 0.4, boom: 1, x: it.x, y: it.y, r: 130, c: '#ffb547' }); g.foes.slice().forEach((f) => { if (Math.hypot(f.x - it.x, f.y - it.y) - f.r < 130) hurtFoe(f, 120, Math.atan2(f.y - it.y, f.x - it.x), true); }); }
    g.fx.push({ t: 0.9, txt: `${d.ic} ${L(...d.name)}`, x: h.x, y: h.y - 44, c: '#fff' });
  }
  // 拼好一個字：加分＋集氣＋打破大王護盾，然後升級三選一
  function wordDone() {
    const g = game; g.words++; g.score += P.word; addGauge(G_GAIN.word);
    speak(g.w.word);
    if (g.boss) g.shieldOff = 7;
    g.orbs = []; g.hero.inv = 1;
    g.fx.push({ t: 0.5, flash: 1 }, { t: 1.3, bigword: g.w.word });
    banner('🔤', L(`拼出來了！${g.w.word} +${P.word}`, `Spelled! ${g.w.word} +${P.word}`), g.boss ? L('墨水大王的護盾破了！', "Ink King's shield is down!") : short(g.w), '#CCFF00');
    g.lvAt = performance.now() + 600;   // 0.6 秒後升級（如果那時正在選招式或拼字，就等結束後再跳）
  }
  function levelUp() {
    const g = game; g.lv++; g.menu = true; joy = null; showWord(); musouBtn();
    const pool = SKILLS.filter((s2) => !s2.pet || hasPet()), pick3 = shuffle(pool).slice(0, 3);
    pane(`<div class="wj-card"><div class="wj-kicker">⬆️ ${L(`升到 Lv${g.lv}！選一個技能`, `Level ${g.lv}! Pick a skill`)}</div>
      <div class="wh-sk">${pick3.map((s2) => `<button class="btn ghost" data-wh="sk" data-sk="${s2.id}"><span>${s2.ic}</span>${L(...s2.name)}</button>`).join('')}</div>
      <p class="wj-small">${L('選的時候時間暫停', 'The clock is paused')}</p></div>`);
  }
  function takeSkill(id) {
    const g = game; if (!g || !g.menu) return;
    const m = g.mod, h = g.hero;
    if (id === 'pow') m.pow *= 1.3; if (id === 'area') m.area *= 1.25; if (id === 'rate') m.rate *= 1.2; if (id === 'move') m.move *= 1.15;
    if (id === 'heal') { h.max += 20; h.hp = Math.min(h.max, h.hp + 40); }
    if (id === 'magnet') m.magnet *= 1.5; if (id === 'orbit') m.orbit++; if (id === 'pet') m.pet *= 2;
    g.menu = false; g.last = performance.now(); pane(''); nextWord(); musouBtn();
  }
  // 無雙：集氣滿了自己選招式
  function offerMoves() {
    const g = game; if (!g || g.gauge < G_MAX || paused() || g.over) return;
    g.moveMenu = true; joy = null; showWord(); musouBtn();
    pane(`<div class="wj-card"><div class="wj-kicker">💥 ${L('無雙！選一個招式', 'MUSOU! Choose your move')}</div>
      <div class="wh-sk mv">${MOVES.map((mv) => `<button class="btn ghost" data-wh="mv" data-mv="${mv.id}"><span>${mv.ic}</span><div>${L(...mv.name)}<small>${L(...mv.desc)}</small></div></button>`).join('')}</div></div>`);
  }
  function useMove(id) {
    const g = game; if (!g || !g.moveMenu) return;
    g.moveMenu = false; g.gauge = 0; g.musous++; g.last = performance.now(); pane(''); showWord(); musouBtn();
    g.slow = 1.3; g.shake = 1.2; g.hero.inv = 2;
    g.fx.push({ t: 0.25, flash: 1 }, { t: 0.4, cut: 1, mv: id });   // 慢動作時特效時間也變慢（實際約 1～2 秒）
    if (id === 'whirl') { g.whirl = 4; g.whirlT = 0; }
    else { for (let i = 0; i < 22; i++) { const f = g.foes[Math.floor(Math.random() * g.foes.length)]; const tgt = f && Math.random() < 0.7 ? f : { x: rnd(20, LW - 20), y: rnd(topY(), LH - 20) }; g.meteors.push({ x: tgt.x + rnd(-15, 15), y: tgt.y + rnd(-15, 15), t: 0.3 + i * 0.09, t0: 0.3 + i * 0.09 }); } }
  }
  function burst(x, y, c, n) { for (let k = 0; k < n; k++) { const a = Math.random() * 6.28, v = rnd(50, 170); game.fx.push({ t: 0.45, p: 1, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c }); } }

  // ── 血量用完 → 拼字 ──
  function die() {
    const g = game; g.deaths++; joy = null;
    const pool = spellPool(), w = shuffle(pool.filter((x) => x.id !== g.w.id))[0] || pool[0];
    g.spell = { w, ans: answersOf(w)[0], shown: 1, tries: 0 };
    showWord(); musouBtn(); renderSpell(); speak(w.word);
  }
  function renderSpell(bad) {
    const s = game.spell, a = s.ans;
    const hint = a.split('').map((c, i) => (i < s.shown ? c : '_')).join(' ');
    pane(`<div class="wj-card wj-spell ${bad ? 'shake' : ''}">
      <div class="wj-kicker">${L('血量用完了！拼對才能繼續', 'Out of HP! Spell it to keep going')} ✏️</div>
      <div class="wj-mean" ${EN() ? 'style="font-size:17px"' : ''}>${esc(meaning(s.w))}</div>
      <div class="qmid"><span class="pos">${esc(s.w.pos || '')}</span><button class="spk small" data-say="${esc(s.w.word)}">🔊</button></div>
      <div class="hintw">${esc(hint)}</div>
      <input class="spellin" id="whIn" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="type here">
      ${s.tries ? `<div class="wj-small" style="color:var(--coral)">${L(`拼錯 ${s.tries} 次，多給你一個字母`, `${s.tries} wrong — here's another letter`)}</div>` : ''}
      <button class="btn wide" style="margin-top:10px" data-wh="check">${L('確認 Check', 'Check')}</button>
    </div>`);
    const inp = $('whIn'); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    setTimeout(() => inp.focus(), 50);
  }
  function check() {
    const s = game && game.spell; if (!s) return;
    const v = norm($('whIn').value || '');
    if (!v) return $('whIn').focus();
    if (answersOf(s.w).includes(v)) {
      const g = game, h = g.hero; g.spell = null; pane(''); g.last = performance.now();
      h.hp = Math.round(h.max * 0.7); h.inv = 2.5; g.hazards = [];
      g.foes.slice().forEach((f) => { if (f.type !== 'boss' && Math.hypot(f.x - h.x, f.y - h.y) < 120) kill(f); });   // 復活時把身邊的怪打飛
      showWord(); musouBtn(); banner('✓', L('答對！繼續戰鬥', 'Correct! Keep fighting'), '', '#CCFF00');
    } else {
      s.tries++; s.shown = Math.min(s.ans.length, s.shown + 1);
      renderSpell(true); speak(s.w.word);
    }
  }
  let bannerT = 0;
  function banner(ic, big, small, c) {
    const el = $('whBanner'); if (!el) return;
    el.style.setProperty('--c', c); el.style.borderColor = c;
    el.innerHTML = `<span class="ic">${ic}</span><div><b>${esc(big)}</b>${small ? `<small>${esc(small)}</small>` : ''}</div>`;
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    clearTimeout(bannerT); bannerT = setTimeout(() => el.classList.remove('on'), 1600);
  }

  // ── 結束 ──
  function end() {
    cancelAnimationFrame(raf);
    const g = game; if (!g || g.over) return;
    g.over = true; g.spell = null; g.menu = false; g.moveMenu = false; joy = null; showWord(); musouBtn();
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
    hud(); draw();
    pane(`<div class="wj-card">
      <div class="wj-kicker">${L('時間到！', "Time's up!")}</div>
      <div class="wj-big">${sc}</div>
      <div class="wj-small">${trial ? L('🧪 試玩模式，不計分', '🧪 Trial — not scored') : record ? L('🆕 個人最高紀錄！', '🆕 New personal best!') : L(`個人最高 ${best} 分`, `Personal best ${best}`)}<br>
        ${L(`拼出 ${g.words} 個字・打倒 ${g.kills} 隻怪・墨水大王 ${g.bosses}・無雙 ${g.musous} 次・Lv${g.lv}・倒下 ${g.deaths}`, `${g.words} words · ${g.kills} monsters · ${g.bosses} Ink Kings · ${g.musous} MUSOU · Lv${g.lv} · ${g.deaths} KOs`)}</div>
      <div class="wj-pts">⭐ ${pts} / ${CAP}</div>
      ${trial ? '' : gain ? `<div class="gain">+${gain} ⭐</div>`
        : `<div class="gain zero">${prev >= CAP ? L('本週遊戲已經拿滿 20 分，現在純粹好玩 🎮', 'You already got 20 this week — just for fun now 🎮')
          : L(`本週遊戲最佳是 ${prev} 分，超過才會再加分`, `Your best this week is ${prev} — beat it to earn more`)}</div>`}
      <div class="btnrow" style="margin-top:14px"><button class="btn" data-wh="start">${L('再玩一次', 'Play again')}</button><button class="btn ghost" data-wh="close">${L('離開', 'Exit')}</button></div>
    </div>`);
  }

  // ── 繪圖 ──
  function hud() {
    const g = game, left = g ? Math.max(0, TIME - g.elapsed) : TIME, m = Math.floor(left / 60), s = Math.floor(left % 60);
    $('whT').textContent = `${m}:${String(s).padStart(2, '0')}`; $('whT').classList.toggle('low', left < 20);
    $('whS').textContent = g ? g.score : 0; $('whP').textContent = `⭐ ${g ? toPts(g.score) : 0}`;
    $('whLv').textContent = `Lv${g ? g.lv : 1}`;
    $('whHp').style.width = `${g ? Math.max(0, g.hero.hp / g.hero.max * 100) : 100}%`;
    if (g) musouBtn();
  }
  function draw() {
    if (!cx) return;
    const g = game;
    const sh = g && g.shake > 0 ? Math.min(1, g.shake) * 7 : 0;
    cx.setTransform(S, 0, 0, S, rnd(-sh, sh) * S, rnd(-sh, sh) * S);
    // 場地：深綠草地＋格紋
    cx.fillStyle = '#1d3b24'; cx.fillRect(-10, -10, LW + 20, LH + 20);
    cx.fillStyle = 'rgba(255,255,255,.035)';
    for (let x = 0; x < LW; x += 40) for (let y = 0; y < LH; y += 40) if (((x + y) / 40) % 2 === 0) cx.fillRect(x, y, 40, 40);
    cx.fillStyle = 'rgba(204,255,0,.07)'; for (let i = 0; i < 40; i++) cx.fillRect((i * 97) % LW, (i * 151) % LH, 3, 6);
    if (!g) return;
    const h = g.hero;
    // 大王的紅圈（踩地預告）
    g.hazards.forEach((hz) => {
      if (hz.kind === 'slam') {
        const k = 1 - hz.t / hz.t0;
        cx.fillStyle = `rgba(255,60,60,${0.12 + 0.25 * k})`; cx.beginPath(); cx.arc(hz.x, hz.y, hz.r, 0, 7); cx.fill();
        cx.strokeStyle = '#ff4b4b'; cx.lineWidth = 3; cx.beginPath(); cx.arc(hz.x, hz.y, hz.r * k, 0, 7); cx.stroke();
      }
    });
    // 道具
    g.items.forEach((it) => {
      if (it.t < 2.5 && Math.floor(it.t * 6) % 2) return;
      const by = Math.sin(g.clock * 4 + it.x) * 3;
      cx.fillStyle = 'rgba(255,255,255,.18)'; cx.beginPath(); cx.arc(it.x, it.y + by, 16, 0, 7); cx.fill();
      cx.font = '22px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(ITEMS[it.k].ic, it.x, it.y + by + 1); cx.textBaseline = 'alphabetic';
    });
    // 怪物（y 越下面越晚畫）
    g.foes.slice().sort((a, b) => a.y - b.y).forEach((f) => drawFoe(f));
    // 字母球：大顆、看得清楚（快消失時閃爍）
    g.orbs.forEach((o) => {
      if (o.t < 2.5 && Math.floor(o.t * 6) % 2) return;
      const by = o.pop > 0 ? -Math.sin((1 - o.pop / 0.35) * Math.PI) * 18 : Math.sin(g.clock * 4 + o.x) * 2;
      cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(o.x, o.y + ORB_R + 2, ORB_R * 0.8, 5, 0, 0, 7); cx.fill();
      cx.fillStyle = 'rgba(255,214,90,.3)'; cx.beginPath(); cx.arc(o.x, o.y + by, ORB_R + 7 + Math.sin(g.clock * 6) * 2.5, 0, 7); cx.fill();
      cx.fillStyle = '#fffbe8'; cx.strokeStyle = '#ff9f1c'; cx.lineWidth = 4; cx.beginPath(); cx.arc(o.x, o.y + by, ORB_R, 0, 7); cx.fill(); cx.stroke();
      cx.font = '900 28px Syne, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.lineWidth = 3; cx.strokeStyle = '#fff'; cx.strokeText(o.c, o.x, o.y + by + 1); cx.fillStyle = '#2a1800'; cx.fillText(o.c, o.x, o.y + by + 1); cx.textBaseline = 'alphabetic';
    });
    // 寵物的小球、墨水彈
    g.shots.forEach((s2) => { cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.arc(s2.x, s2.y, 4, 0, 7); cx.fill(); });
    g.hazards.forEach((hz) => { if (hz.kind === 'ink') { cx.fillStyle = '#2a1650'; cx.strokeStyle = '#b48cff'; cx.lineWidth = 2; cx.beginPath(); cx.arc(hz.x, hz.y, 8, 0, 7); cx.fill(); cx.stroke(); } });
    // 火球
    for (let i = 0; i < g.mod.orbit; i++) {
      const a = g.clock * 3 + i * Math.PI * 2 / g.mod.orbit, ox = h.x + Math.cos(a) * 54, oy = h.y + Math.sin(a) * 54;
      cx.fillStyle = 'rgba(255,140,40,.35)'; cx.beginPath(); cx.arc(ox, oy, 12, 0, 7); cx.fill();
      cx.fillStyle = '#ffb547'; cx.beginPath(); cx.arc(ox, oy, 7, 0, 7); cx.fill();
    }
    // 旋風斬
    if (g.whirl > 0) {
      cx.save(); cx.translate(h.x, h.y); cx.rotate(g.clock * 14);
      for (let i = 0; i < 3; i++) { cx.rotate(Math.PI * 2 / 3); cx.strokeStyle = `rgba(255,200,80,${0.7 - i * 0.15})`; cx.lineWidth = 10 - i * 2; cx.beginPath(); cx.arc(0, 0, 95 - i * 18, 0, 1.6); cx.stroke(); }
      cx.restore();
    }
    // 寵物＋角色
    if (hasPet()) drawImg(petImg, g.pet.x, g.pet.y, 30, 30, h.face, 0);
    if (!(h.inv > 0 && h.inv < 1.5 && g.whirl <= 0 && Math.floor(h.inv * 12) % 2)) {
      cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(h.x, h.y + 24, 15, 4, 0, 0, 7); cx.fill();
      if (g.buff.boots > 0) { cx.fillStyle = 'rgba(78,205,196,.35)'; cx.beginPath(); cx.ellipse(h.x, h.y + 22, 20, 6, 0, 0, 7); cx.fill(); }
      const bob = Math.abs(Math.sin(h.walk)) * 3;
      if (heroImg) drawImg(heroImg, h.x, h.y - bob, 44, 67, h.face, 1);
      else { cx.fillStyle = '#CCFF00'; cx.beginPath(); cx.arc(h.x, h.y, HERO_R, 0, 7); cx.fill(); }
    }
    // 流星（落下中）
    g.meteors.forEach((mt) => {
      const k = Math.max(0, mt.t / mt.t0);
      cx.strokeStyle = 'rgba(255,120,40,.5)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(mt.x, mt.y, 62 * (1 - k * 0.6), 0, 7); cx.stroke();
      const sx = mt.x + 120 * k, sy = mt.y - 260 * k;
      cx.strokeStyle = 'rgba(255,200,80,.7)'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(sx + 30, sy - 60); cx.lineTo(sx, sy); cx.stroke();
      cx.fillStyle = '#ff8a3c'; cx.beginPath(); cx.arc(sx, sy, 11, 0, 7); cx.fill();
    });
    // 特效
    g.fx.forEach((f) => {
      if (f.slash) {   // 揮砍：顏色跟衣服一樣
        const col = (typeof AV_TOPC !== 'undefined' && look && AV_TOPC[look.topC]) || '#CCFF00';
        cx.save(); cx.globalAlpha = f.t / 0.16; cx.strokeStyle = col; cx.lineWidth = 8; cx.lineCap = 'round';
        cx.beginPath(); cx.arc(f.x, f.y, f.r * 0.8, f.a - 1.2, f.a + 1.2); cx.stroke();
        cx.strokeStyle = '#fff'; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(f.x, f.y, f.r * 0.8, f.a - 1, f.a + 1); cx.stroke(); cx.restore();
      } else if (f.boom) {
        const k = 1 - f.t / 0.35;
        cx.save(); cx.globalAlpha = 1 - k; cx.fillStyle = f.c || '#ffb547'; cx.beginPath(); cx.arc(f.x, f.y, f.r * (0.4 + 0.6 * k), 0, 7); cx.fill(); cx.restore();
      } else if (f.ring) {
        const k = 1 - f.t / 0.6; cx.save(); cx.globalAlpha = 1 - k; cx.strokeStyle = '#ffb547'; cx.lineWidth = 3; cx.beginPath(); cx.arc(f.x, f.y, 10 + 30 * k, 0, 7); cx.stroke(); cx.restore();
      } else if (f.p) {
        f.x += f.vx * 0.016; f.y += f.vy * 0.016; cx.globalAlpha = f.t / 0.45; cx.fillStyle = f.c; cx.fillRect(f.x - 2.5, f.y - 2.5, 5, 5); cx.globalAlpha = 1;
      } else if (f.txt) {
        f.y -= 0.5; cx.globalAlpha = Math.min(1, f.t * 2); cx.fillStyle = f.c; cx.font = `800 ${f.big ? 24 : 15}px Syne, "Noto Sans TC", sans-serif`; cx.textAlign = 'center'; cx.fillText(f.txt, f.x, f.y); cx.globalAlpha = 1;
      }
    });
    // 畫面效果：閃光、放大絕的字卡、buff 提示
    cx.setTransform(S, 0, 0, S, 0, 0);
    g.fx.forEach((f) => {
      if (f.bigword) {   // 拼好的字放大顯示
        const k = 1 - f.t / 1.3, sc = 1 + Math.min(1, k * 4) * 0.4;
        cx.save(); cx.globalAlpha = Math.min(1, f.t * 3); cx.translate(LW / 2, LH * 0.38); cx.scale(sc, sc);
        cx.font = '900 44px Syne, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineWidth = 8; cx.strokeStyle = '#10140a'; cx.strokeText(f.bigword, 0, 0);
        cx.fillStyle = '#CCFF00'; cx.fillText(f.bigword, 0, 0); cx.restore(); cx.textBaseline = 'alphabetic';
      }
      if (f.flash) { cx.fillStyle = `rgba(255,255,255,${Math.min(0.55, f.t * 2.2)})`; cx.fillRect(0, 0, LW, LH); }
      if (f.cut) {   // 大絕字卡（慢動作期間）
        const mv = MOVES.find((x) => x.id === f.mv), a = Math.min(1, f.t * 6);
        cx.save(); cx.globalAlpha = a; cx.fillStyle = 'rgba(0,0,0,.55)'; cx.fillRect(0, LH / 2 - 44, LW, 88);
        cx.fillStyle = '#ffb547'; cx.font = '900 40px "Noto Sans TC", sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.shadowColor = '#ff6b00'; cx.shadowBlur = 20; cx.fillText(`${mv.ic} ${L(...mv.name)}！`, LW / 2 + (1 - a) * 40, LH / 2); cx.restore(); cx.textBaseline = 'alphabetic';
      }
    });
    if (g.slow > 0) { cx.strokeStyle = 'rgba(255,180,71,.6)'; cx.lineWidth = 12; cx.strokeRect(0, 0, LW, LH); }
    const bf = Object.keys(g.buff).filter((k) => g.buff[k] > 0);
    bf.forEach((k, i) => {
      const x = 14 + i * 64, y = joyC().y - JOY_R - 22;   // 搖桿上方
      cx.fillStyle = 'rgba(10,14,24,.75)'; cx.beginPath(); cx.roundRect ? cx.roundRect(x, y - 16, 58, 26, 13) : cx.rect(x, y - 16, 58, 26); cx.fill();
      cx.fillStyle = '#fff'; cx.font = '700 14px Syne, sans-serif'; cx.textAlign = 'left'; cx.fillText(`${ITEMS[k].ic} ${Math.ceil(g.buff[k])}`, x + 8, y + 2);
    });
    if (g.buff.ice > 0) { cx.fillStyle = 'rgba(120,200,255,.08)'; cx.fillRect(0, 0, LW, LH); }
    // 大王血條
    if (g.boss) {
      const b = g.boss, w = Math.min(240, LW - 60), x = (LW - w) / 2, y = topY() + 18;   // 題目框下方
      cx.fillStyle = 'rgba(0,0,0,.55)'; cx.fillRect(x - 2, y - 2, w + 4, 14);
      cx.fillStyle = g.shieldOff > 0 ? '#ff6b57' : '#b48cff'; cx.fillRect(x, y, w * Math.max(0, b.hp / b.max), 10);
      cx.fillStyle = '#fff'; cx.font = '700 11px "Noto Sans TC", sans-serif'; cx.textAlign = 'center';
      cx.fillText(g.shieldOff > 0 ? L('墨水大王・護盾破了！快打！', 'Ink King · shield down!') : L('墨水大王・🛡️ 拼好字打破護盾', 'Ink King · 🛡️ spell to break'), LW / 2, y - 5);
    }
    // 左下角固定搖桿
    if (!g.over && !paused()) {
      const c = joyC(), kx = joy ? joy.dx : 0, ky = joy ? joy.dy : 0;
      cx.fillStyle = 'rgba(10,14,24,.45)'; cx.beginPath(); cx.arc(c.x, c.y, JOY_R + 6, 0, 7); cx.fill();
      cx.strokeStyle = joy ? 'rgba(204,255,0,.7)' : 'rgba(255,255,255,.35)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(c.x, c.y, JOY_R + 6, 0, 7); cx.stroke();
      cx.fillStyle = 'rgba(255,255,255,.25)'; [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([ax, ay]) => { cx.beginPath(); cx.moveTo(c.x + ax * (JOY_R - 4), c.y + ay * (JOY_R - 4)); cx.lineTo(c.x + ax * (JOY_R - 14) - ay * 7, c.y + ay * (JOY_R - 14) + ax * 7); cx.lineTo(c.x + ax * (JOY_R - 14) + ay * 7, c.y + ay * (JOY_R - 14) - ax * 7); cx.fill(); });
      cx.fillStyle = joy ? 'rgba(204,255,0,.85)' : 'rgba(255,255,255,.55)'; cx.beginPath(); cx.arc(c.x + kx, c.y + ky, 22, 0, 7); cx.fill();
    }
    // 第一個字：箭頭指向要撿的字母
    if (g.words === 0 && !paused()) {
      const need = g.w && g.w.word.toLowerCase()[g.idx], o = need && g.orbs.filter((x) => x.c === need && x.pop <= 0).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
      if (o) {
        const a = Math.atan2(o.y - h.y, o.x - h.x), d = Math.hypot(o.x - h.x, o.y - h.y);
        if (d > 70) { const ax = h.x + Math.cos(a) * 46, ay = h.y + Math.sin(a) * 46; cx.save(); cx.translate(ax, ay); cx.rotate(a); cx.fillStyle = '#CCFF00'; cx.beginPath(); cx.moveTo(14, 0); cx.lineTo(-6, -10); cx.lineTo(-2, 0); cx.lineTo(-6, 10); cx.fill(); cx.restore(); }
        const bob = Math.sin(g.clock * 6) * 4;
        cx.strokeStyle = '#CCFF00'; cx.lineWidth = 3; cx.beginPath(); cx.arc(o.x, o.y, ORB_R + 12, 0, 7); cx.stroke();
        cx.fillStyle = '#CCFF00'; cx.font = '800 14px "Noto Sans TC", sans-serif'; cx.textAlign = 'center'; cx.fillText(L('撿這個 ↓', 'Pick this ↓'), o.x, o.y - ORB_R - 18 + bob);
      }
    }
    // 開場三步提示（前 9 秒輪流）
    if (g.elapsed < 9 && !paused()) {
      const steps = [L('① 左下搖桿移動，角色會自動攻擊', '① Move with the joystick — attacks are automatic'), L('② 撿字母球，拼出上面的字', '② Pick up letters to spell the word above'), L('③ 無雙集滿了，按右下角放大絕', '③ When MUSOU is full, tap the bottom-right button')];
      const t = steps[Math.min(2, Math.floor(g.elapsed / 3))];
      cx.font = '800 15px "Noto Sans TC", sans-serif'; cx.textAlign = 'center'; const tw = Math.min(LW - 20, cx.measureText(t).width + 28), y = LH - 40 - JOY_R * 2 - 40;   // 搖桿上方
      cx.fillStyle = 'rgba(10,14,24,.78)'; cx.beginPath(); cx.roundRect ? cx.roundRect(LW / 2 - tw / 2, y - 22, tw, 36, 18) : cx.rect(LW / 2 - tw / 2, y - 22, tw, 36); cx.fill();
      cx.fillStyle = '#fff'; cx.fillText(t, LW / 2, y + 2);
    }
  }
  function drawImg(img, x, y, w, hgt, face, isHero) {
    if (!img) return;
    cx.save(); cx.translate(x, y); cx.scale(face, 1);
    cx.drawImage(img, -w / 2, -hgt / 2 - (isHero ? 6 : 0), w, hgt); cx.restore();
  }
  function drawFoe(f) {   // 原創怪物：墨水史萊姆、蝙蝠、大塊頭、墨水大王
    const t = game.clock, x = f.x, y = f.y, r = f.r;
    cx.fillStyle = 'rgba(0,0,0,.28)'; cx.beginPath(); cx.ellipse(x, y + r * 0.9, r, r * 0.3, 0, 0, 7); cx.fill();
    const fl = f.flash > 0;
    if (f.type === 'brute' && f.state === 'charge') {   // 蓄力：發紅光、抖動
      cx.fillStyle = `rgba(255,60,60,${0.3 + 0.3 * Math.sin(t * 30)})`; cx.beginPath(); cx.arc(x, y, r + 10, 0, 7); cx.fill();
      cx.strokeStyle = 'rgba(255,80,80,.5)'; cx.lineWidth = 3; cx.setLineDash([6, 6]); cx.beginPath(); cx.moveTo(x, y); cx.lineTo(f.tx, f.ty); cx.stroke(); cx.setLineDash([]);
    }
    if (f.type === 'bat') {
      const wv = Math.sin(t * 18 + f.ph) * 5;
      cx.fillStyle = fl ? '#fff' : '#7d5bd6';
      cx.beginPath(); cx.moveTo(x - 4, y); cx.lineTo(x - r - 8, y - 6 + wv); cx.lineTo(x - r, y + 4); cx.fill();
      cx.beginPath(); cx.moveTo(x + 4, y); cx.lineTo(x + r + 8, y - 6 + wv); cx.lineTo(x + r, y + 4); cx.fill();
      cx.beginPath(); cx.arc(x, y, r * 0.75, 0, 7); cx.fill();
    } else {
      const sq = Math.sin(t * 6 + f.ph) * 0.08, jx = f.state === 'charge' ? rnd(-2, 2) : 0;
      cx.fillStyle = fl ? '#fff' : f.type === 'boss' ? '#3b2a6b' : f.type === 'brute' ? '#a5512a' : '#2c8c84';
      cx.beginPath(); cx.ellipse(x + jx, y, r * (1 + sq), r * (1 - sq), 0, 0, 7); cx.fill();
      if (f.type === 'brute') { cx.fillStyle = fl ? '#fff' : '#7a3a1c'; cx.beginPath(); cx.moveTo(x - r * 0.7, y - r * 0.6); cx.lineTo(x - r * 0.45, y - r * 1.2); cx.lineTo(x - r * 0.2, y - r * 0.75); cx.fill(); cx.beginPath(); cx.moveTo(x + r * 0.7, y - r * 0.6); cx.lineTo(x + r * 0.45, y - r * 1.2); cx.lineTo(x + r * 0.2, y - r * 0.75); cx.fill(); }
      if (f.type === 'boss') {   // 皇冠＋護盾
        cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.moveTo(x - 16, y - r + 4); cx.lineTo(x - 16, y - r - 12); cx.lineTo(x - 8, y - r - 4); cx.lineTo(x, y - r - 14); cx.lineTo(x + 8, y - r - 4); cx.lineTo(x + 16, y - r - 12); cx.lineTo(x + 16, y - r + 4); cx.fill();
        if (game.shieldOff <= 0) { cx.strokeStyle = `rgba(180,140,255,${0.5 + 0.3 * Math.sin(t * 5)})`; cx.lineWidth = 5; cx.beginPath(); cx.arc(x, y, r + 9, 0, 7); cx.stroke(); }
      }
    }
    // 眼睛
    const ex = r * 0.35, ey = f.type === 'bat' ? y - 2 : y - r * 0.2;
    cx.fillStyle = f.type === 'brute' && f.state !== 'walk' ? '#ffdd55' : '#fff'; cx.beginPath(); cx.arc(x - ex, ey, r * 0.22, 0, 7); cx.arc(x + ex, ey, r * 0.22, 0, 7); cx.fill();
    cx.fillStyle = '#111'; const lx = Math.sign(game.hero.x - x) * r * 0.07;
    cx.beginPath(); cx.arc(x - ex + lx, ey, r * 0.11, 0, 7); cx.arc(x + ex + lx, ey, r * 0.11, 0, 7); cx.fill();
    if (f.type === 'brute' && f.hp < f.max) {   // 大塊頭血條
      cx.fillStyle = 'rgba(0,0,0,.5)'; cx.fillRect(x - r, y - r - 12, r * 2, 4); cx.fillStyle = '#ff6b57'; cx.fillRect(x - r, y - r - 12, r * 2 * f.hp / f.max, 4);
    }
  }

  function onClick(e) {
    const t = e.target.closest('[data-wh]'); if (!t) return;
    const a = t.dataset.wh;
    if (a === 'start') { if (typeof unlockAudio === 'function') unlockAudio(); start(); }
    if (a === 'close') close();
    if (a === 'check') check();
    if (a === 'sk') takeSkill(t.dataset.sk);
    if (a === 'musou') offerMoves();
    if (a === 'mv') useMove(t.dataset.mv);
    if (a === 'quit') {
      if (game && !game.over && !trial && !confirm(L('離開這一局？這局不會計分。', "Quit this game? It won't be scored."))) return;
      close();
    }
  }
  // 測試用
  const _t = { get game() { return game; }, end, check, toPts, pick, wordDone, spawnBoss, levelUp, takeSkill, offerMoves, useMove, useItem, spawnOne, get trial() { return trial; },
    get LW() { return LW; }, get LH() { return LH; }, get heroImg() { return heroImg; }, get petImg() { return petImg; }, setJoy(dx, dy) { joy = dx === null ? null : { id: -1, x0: 100, y0: 100, dx, dy }; } };
  return { id: ID, need: NEED, card, bestText, open, close, _t };
})();
GAMES.push(WH6);
