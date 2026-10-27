// ═══════════════════════════════════════════════════════
//  獎勵遊戲 #6：Word Brawl 單字無雙（一個人打一大群的割草遊戲）
//  解鎖：精熟 6 個單元（試玩：網址加 ?try=horde，不用解鎖、不計分）
//  規則：3 分鐘；用學生自己的捏人角色上場（帶寵物的話寵物會一起幫忙打）。
//        手指在畫面任何地方按住拖曳＝移動（像搖桿），角色會自動攻擊附近的怪物。
//        上方顯示一個字的中文＋發音；打倒怪物會掉字母，照順序撿齊就拼好這個字 → 「無雙」大招清場＋升級三選一。
//        撿錯字母沒關係，只是不會前進；錯 3 次會提示下一個字母。
//        第 55 秒、120 秒出現墨水大王：有護盾（傷害只剩 1/4），拼好一個字可以打破護盾 6 秒。
//        血量歸零 → 拼出一個字才能繼續；拼字、選技能時時間暫停。角色、怪物都是原創。
//  依賴 index.html 的全域：st, $, esc, L, EN, meaning, speak, answersOf, norm, shuffle, todayKey, clockCheck,
//        saveLedger, saveMeta, afterPoints, points, gameWeekBestAll, gameCard, masteredCount, GAMES, toast, confetti,
//        avatarSVG, lookOf, petOf
// ═══════════════════════════════════════════════════════
const WH6 = (() => {
  const ID = 'horde', NEED = 6, VER = '0.1';
  const TIME = 180, CAP = 20, S_PER_PT = 300;   // 每 300 分 1 ⭐（6000 分滿 20）— 待實玩後調整
  const P = { kill: 10, brute: 30, letter: 20, word: 200, boss: 500 };
  const HP = 100, HERO_R = 14, PICK = 26;
  const BOSS_AT = [55, 120], BOSS_HP = 520;
  const SKILLS = [
    { id: 'pow', ic: '⚔️', name: ['攻擊力 +30%', 'Damage +30%'] },
    { id: 'area', ic: '🌀', name: ['攻擊範圍 +25%', 'Range +25%'] },
    { id: 'rate', ic: '⚡', name: ['攻擊速度 +20%', 'Attack speed +20%'] },
    { id: 'move', ic: '👟', name: ['移動速度 +15%', 'Move speed +15%'] },
    { id: 'heal', ic: '❤️', name: ['補血 40，血量上限 +20', 'Heal 40, max HP +20'] },
    { id: 'magnet', ic: '🧲', name: ['撿字母範圍變大', 'Bigger pickup range'] },
    { id: 'orbit', ic: '🔥', name: ['火球繞身（再選再多一顆）', 'Orbiting fireball (+1 each time)'] },
    { id: 'pet', ic: '🐾', name: ['寵物攻擊加倍', 'Pet damage ×2'], pet: true },
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
        .wh-word .slots b.hint{color:rgba(255,255,255,.35)}
        .wh-word .spk{pointer-events:auto}
        .wh-sk{display:grid;grid-template-columns:1fr;gap:10px;margin:14px 0 6px}
        .wh-sk .btn{display:flex;align-items:center;gap:12px;justify-content:flex-start;font-size:16px;padding:14px 16px;border-color:#4ECDC4}
        .wh-sk .btn span{font-size:26px}
        @media (orientation:landscape){.wh-sk{grid-template-columns:1fr 1fr 1fr}.wh-sk .btn{flex-direction:column;justify-content:center;font-size:14px}
          .wh6 .wj-card{max-width:720px}.wh6 .wj-ic{display:none}.wh6 .wj-rules{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;font-size:12.5px;line-height:1.45}}`;
      document.head.appendChild(s);
    }
    cv = root.querySelector('canvas'); cx = cv.getContext('2d');
    root.addEventListener('click', onClick);
    // 搖桿：手指按下的位置當中心，拖曳的方向＝移動方向
    cv.addEventListener('pointerdown', (e) => {
      if (!game || game.over || game.menu || game.spell) return;
      e.preventDefault(); cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
      const p = toLogic(e); joy = { id: e.pointerId, x0: p.x, y0: p.y, dx: 0, dy: 0 };
    });
    cv.addEventListener('pointermove', (e) => {
      if (!joy || joy.id !== e.pointerId) return;
      const p = toLogic(e); let dx = p.x - joy.x0, dy = p.y - joy.y0; const d = Math.hypot(dx, dy);
      if (d > 50) { joy.x0 = p.x - dx / d * 50; joy.y0 = p.y - dy / d * 50; dx = dx / d * 50; dy = dy / d * 50; }   // 拖太遠時搖桿中心跟著走
      joy.dx = dx; joy.dy = dy;
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => cv.addEventListener(ev, (e) => { if (joy && joy.id === e.pointerId) joy = null; }));
    addEventListener('keydown', (e) => { keys[e.key] = true; }); addEventListener('keyup', (e) => { keys[e.key] = false; });
    addEventListener('resize', resize);
  }
  const toLogic = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * LW, y: (e.clientY - r.top) / r.height * LH }; };
  function resize() {
    if (!root) return;
    const w = root.clientWidth, h = root.clientHeight; dpr = Math.min(2, devicePixelRatio || 1); lastW = w; lastH = h;
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    S = Math.min(w, h) * dpr / 360;   // 短邊＝360 個單位
    LW = w * dpr / S; LH = h * dpr / S;
    if (game) game.hero.x = Math.min(game.hero.x, LW - 20), game.hero.y = Math.min(game.hero.y, LH - 20);
  }
  const pane = (html) => { const p = root.querySelector('#whPane'); p.innerHTML = html; p.style.display = html ? '' : 'none'; if (html) joy = null; };
  // 畫面上方（題目框下面）不能走的範圍
  const topY = () => { const el = root && root.querySelector('#whWord .in'); const r = cv.getBoundingClientRect(); if (!el || !r.height || !el.offsetParent) return 100; return (el.getBoundingClientRect().bottom - r.top) / r.height * LH + 6; };

  // ── 開始畫面 ──
  function open(opts) {
    trial = !!(opts && opts.trial);
    if (!trial && !unlocked()) return toast(L(`精熟 ${NEED} 個單元後解鎖`, `Master ${NEED} units to unlock`));
    if (spellPool().length < 4) return toast(L('單字太少，還不能玩', 'Not enough words yet'));
    mount(); root.classList.add('show'); resize(); loadSprites();
    document.body.style.overflow = 'hidden';
    const best = gameWeekBestAll(), pb = (st.meta.games && st.meta.games[ID] && st.meta.games[ID].best) || 0;
    game = null; showWord(); draw();
    pane(`<div class="wj-card">
      <div class="wj-ic">⚔️</div>
      <h2>Word Brawl 單字無雙</h2>
      <div class="wj-rules">
        <div>🧍 ${L('用你自己捏的角色上場！帶了寵物的話，寵物也會一起幫忙打', 'Fight as your own avatar! Your pet fights too')}</div>
        <div>👆 ${L('手指在畫面上按住拖曳＝移動，角色會自動攻擊附近的怪物', 'Hold and drag anywhere to move; you attack automatically')}</div>
        <div>🔤 ${L('上面是一個字的中文：打倒怪物會掉字母，照順序撿齊就拼好這個字', 'Monsters drop letters — pick them up in order to spell the word')}</div>
        <div>💥 ${L(`拼好一個字 +${P.word}，放出「無雙」大招清場，再從三個技能選一個升級`, `Spell it: +${P.word}, a screen-clearing super, and a level-up`)}</div>
        <div>👹 ${L(`第 ${BOSS_AT[0]} 秒、${BOSS_AT[1]} 秒出現墨水大王，有護盾；拼好一個字可以打破護盾（打倒 +${P.boss}）`, `Ink King appears at ${BOSS_AT[0]}s and ${BOSS_AT[1]}s with a shield — spell a word to break it (+${P.boss})`)}</div>
        <div>✏️ ${L('血量用完：拼出一個字就能繼續（拼字、選技能時時間暫停）', 'Out of HP: spell a word to keep going (clock pauses)')}</div>
        <div>⭐ ${trial ? L('試玩模式：不計分', 'Trial: not scored') : L(`每 ${S_PER_PT} 分 1 顆星，最多 ${CAP}；所有遊戲每週只算最高一局`, `1 ⭐ per ${S_PER_PT} points, up to ${CAP}; best game of the week counts`)}</div>
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
      hero: { x: LW / 2, y: LH * 0.6, hp: HP, max: HP, face: 1, inv: 1, atkT: 0.5, walk: 0 },
      pet: { x: LW / 2 - 30, y: LH * 0.6, t: 1 },
      mod: { pow: 1, area: 1, rate: 1, move: 1, magnet: 1, orbit: 0, pet: 1 }, lv: 1,
      foes: [], orbs: [], shots: [], fx: [], spawnT: 1, bossIdx: 0, boss: null, shieldOff: 0,
      w: null, idx: 0, miss: 0, used: new Set(), sinceNeed: 0,
      score: 0, kills: 0, words: 0, bosses: 0, deaths: 0, menu: false, spell: null, over: false,
    };
    pane(''); nextWord(); loop();
  }
  function nextWord() {
    const g = game, pool = spellPool(), fresh = pool.filter((w) => !g.used.has(w.id));
    g.w = shuffle(fresh.length ? fresh : pool)[0]; g.used.add(g.w.id); g.idx = 0; g.miss = 0;
    showWord(); speak(g.w.word);
  }
  function showWord() {
    const el = root && root.querySelector('#whWord'); if (!el) return;
    const g = game;
    if (!g || !g.w || g.over || g.spell || g.menu) { el.style.display = 'none'; return; }
    const a = g.w.word.toLowerCase();
    el.style.display = '';
    el.innerHTML = `<div class="in"><span class="zh">${esc(short(g.w))}</span><span class="slots">${a.split('').map((c, i) =>
      i < g.idx ? `<b class="ok">${esc(c)}</b>` : i === g.idx && g.miss >= 3 ? `<b class="hint">${esc(c)}</b>` : '<b></b>').join('')}</span>
      <button class="spk small" data-say="${esc(g.w.word)}">🔊</button></div>`;
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    const g = game; if (!g) return;
    if (root.clientWidth !== lastW || root.clientHeight !== lastH) resize();
    const now = performance.now(), real = (now - g.last) / 1000, dt = Math.min(0.033, real); g.last = now;
    if (g.menu || g.spell) { hud(); draw(); return; }   // 選技能、拼字時暫停
    g.clock += dt; g.elapsed += real;
    if (TIME - g.elapsed <= 0) return end();
    step(dt); hud(); draw();
  }
  const nearest = (x, y, maxD) => { let best = null, bd = maxD; for (const f of game.foes) { const d = Math.hypot(f.x - x, f.y - y) - f.r; if (d < bd) { bd = d; best = f; } } return best; };

  function step(dt) {
    const g = game, h = g.hero, m = g.mod, ty = topY();
    g.fx = g.fx.filter((f) => (f.t -= dt) > 0);
    // 移動
    let mx = 0, my = 0;
    if (joy) { mx = joy.dx / 50; my = joy.dy / 50; }
    if (keys.ArrowLeft || keys.a) mx = -1; if (keys.ArrowRight || keys.d) mx = 1; if (keys.ArrowUp || keys.w) my = -1; if (keys.ArrowDown || keys.s) my = 1;
    const ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; }
    const sp = 125 * m.move;
    h.x = Math.max(16, Math.min(LW - 16, h.x + mx * sp * dt)); h.y = Math.max(ty + 20, Math.min(LH - 16, h.y + my * sp * dt));
    if (Math.abs(mx) > 0.15) h.face = mx > 0 ? 1 : -1;
    h.walk += Math.hypot(mx, my) * dt * 10;
    if (h.inv > 0) h.inv -= dt;
    if (g.shieldOff > 0) g.shieldOff -= dt;
    // 出怪：越後面越快、越多
    const el = g.elapsed;
    if ((g.spawnT -= dt) <= 0 && g.foes.length < 70) {
      g.spawnT = Math.max(0.28, 1.0 - el * 0.004);
      const n = el > 90 ? 2 : 1;
      for (let i = 0; i < n; i++) spawn(el);
    }
    if (g.bossIdx < BOSS_AT.length && el >= BOSS_AT[g.bossIdx] && !g.boss) { g.bossIdx++; spawnBoss(); }
    // 自動攻擊：揮向最近的怪
    if ((h.atkT -= dt) <= 0) {
      const R = 62 * m.area, t = nearest(h.x, h.y, R);
      if (t) {
        h.atkT = 0.55 / m.rate;
        const ang = Math.atan2(t.y - h.y, t.x - h.x); h.face = Math.cos(ang) >= 0 ? 1 : -1;
        g.fx.push({ t: 0.16, slash: 1, x: h.x, y: h.y, a: ang, r: R });
        g.foes.slice().forEach((f) => {
          const d = Math.hypot(f.x - h.x, f.y - h.y) - f.r; if (d > R) return;
          let da = Math.atan2(f.y - h.y, f.x - h.x) - ang; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
          if (Math.abs(da) < 1.25 || d < 10) hurtFoe(f, 12 * m.pow, ang);
        });
      } else h.atkT = 0.1;
    }
    // 火球繞身
    for (let i = 0; i < m.orbit; i++) {
      const a = g.clock * 3 + i * Math.PI * 2 / m.orbit, ox = h.x + Math.cos(a) * 52, oy = h.y + Math.sin(a) * 52;
      g.foes.slice().forEach((f) => { if (Math.hypot(f.x - ox, f.y - oy) < f.r + 9 && !(f.ot > 0)) { f.ot = 0.4; hurtFoe(f, 9 * m.pow, a + 1.57); } });
    }
    // 寵物：跟在後面，每 1.1 秒丟一顆小球
    if (hasPet()) {
      const pt = g.pet, tx = h.x - h.face * 30, tyy = h.y + 6;
      pt.x += (tx - pt.x) * Math.min(1, dt * 5); pt.y += (tyy - pt.y) * Math.min(1, dt * 5);
      if ((pt.t -= dt) <= 0) {
        const t = nearest(pt.x, pt.y, 190);
        if (t) { pt.t = 1.1; const a = Math.atan2(t.y - pt.y, t.x - pt.x); g.shots.push({ x: pt.x, y: pt.y, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, t: 0.8, dmg: 8 * m.pet }); }
        else pt.t = 0.2;
      }
    }
    g.shots = g.shots.filter((s) => {
      s.x += s.vx * dt; s.y += s.vy * dt; s.t -= dt;
      const f = g.foes.find((f2) => Math.hypot(f2.x - s.x, f2.y - s.y) < f2.r + 5);
      if (f) { hurtFoe(f, s.dmg, Math.atan2(s.vy, s.vx)); return false; }
      return s.t > 0;
    });
    // 怪物往角色走；碰到就扣血
    for (const f of g.foes) {
      if (f.ot > 0) f.ot -= dt; if (f.flash > 0) f.flash -= dt;
      const dx = h.x - f.x, dy = h.y - f.y, d = Math.hypot(dx, dy) || 1;
      f.x += (dx / d * f.sp + f.kx) * dt; f.y += (dy / d * f.sp + f.ky) * dt; f.kx *= 0.86; f.ky *= 0.86;
      if (d < f.r + HERO_R && h.inv <= 0) {
        h.hp -= f.dmg; h.inv = 0.7; g.fx.push({ t: 0.5, txt: `−${f.dmg}`, x: h.x, y: h.y - 30, c: '#ff6b57' });
        if (h.hp <= 0) { h.hp = 0; return die(); }
      }
    }
    // 字母：靠近就撿
    const pr = PICK * m.magnet;
    g.orbs = g.orbs.filter((o) => {
      o.t -= dt; if (o.t <= 0) return false;
      const d = Math.hypot(o.x - h.x, o.y - h.y);
      if (d < pr * 2.2) { o.x += (h.x - o.x) * Math.min(1, dt * 5); o.y += (h.y - o.y) * Math.min(1, dt * 5); }   // 吸過來
      if (d < pr) { pick(o.c); return false; }
      return true;
    });
  }
  function spawn(el) {
    const g = game, side = Math.floor(Math.random() * 4), ty = topY();
    const x = side === 0 ? -20 : side === 1 ? LW + 20 : rnd(0, LW), y = side === 2 ? ty - 10 : side === 3 ? LH + 20 : rnd(ty, LH);
    const lvl = 1 + el / 60, r = Math.random();
    const type = el > 30 && r < 0.18 ? 'brute' : el > 15 && r < 0.45 ? 'bat' : 'slime';
    const base = { slime: { r: 12, hp: 20, sp: 42, dmg: 8 }, bat: { r: 10, hp: 12, sp: 72, dmg: 6 }, brute: { r: 19, hp: 70, sp: 30, dmg: 14 } }[type];
    g.foes.push({ type, x, y, r: base.r, hp: base.hp * lvl, max: base.hp * lvl, sp: base.sp * (1 + el / 400), dmg: base.dmg, kx: 0, ky: 0, ph: Math.random() * 6 });
  }
  function spawnBoss() {
    const g = game, hp = BOSS_HP * (1 + Math.max(0, g.bossIdx - 1) * 0.6);
    g.boss = { type: 'boss', x: LW / 2, y: -40, r: 32, hp, max: hp, sp: 30, dmg: 18, kx: 0, ky: 0, ph: 0 };
    g.foes.push(g.boss);
    banner('👹', L('墨水大王來了！', 'The Ink King is here!'), L('有護盾：拼好一個字打破它', 'Shielded — spell a word to break it'), '#b48cff');
  }
  function hurtFoe(f, dmg, ang) {
    const g = game;
    if (f.type === 'boss' && g.shieldOff <= 0) dmg *= 0.25;   // 護盾
    f.hp -= dmg; f.flash = 0.1;
    const kb = f.type === 'boss' ? 30 : f.type === 'brute' ? 90 : 160; f.kx += Math.cos(ang) * kb; f.ky += Math.sin(ang) * kb;
    if (f.hp <= 0) kill(f);
  }
  function kill(f, noDrop) {
    const g = game, i = g.foes.indexOf(f); if (i < 0) return;
    g.foes.splice(i, 1);
    if (f.type === 'boss') {
      g.boss = null; g.bosses++; g.score += P.boss;
      burst(f.x, f.y, '#b48cff', 30);
      banner('👑', L(`打倒墨水大王！+${P.boss}`, `Ink King defeated! +${P.boss}`), '', '#CCFF00');
      return;
    }
    const pts = f.type === 'brute' ? P.brute : P.kill; g.score += pts; g.kills++;
    burst(f.x, f.y, f.type === 'brute' ? '#ff9a3c' : f.type === 'bat' ? '#b48cff' : '#4ECDC4', 8);
    if (!noDrop && Math.random() < (f.type === 'brute' ? 1 : 0.45)) drop(f.x, f.y);
  }
  // 掉字母：多半是下一個要的字母，其他是干擾；太久沒掉正確的就保證掉一個
  function drop(x, y) {
    const g = game, a = g.w.word.toLowerCase(), need = a[g.idx]; if (!need) return;
    const onField = g.orbs.some((o) => o.c === need);
    g.sinceNeed++;
    let c;
    if ((!onField && g.sinceNeed >= 3) || Math.random() < 0.5) { c = need; g.sinceNeed = 0; }
    else { const al = 'abcdefghijklmnopqrstuvwxyz'.replace(need, ''); c = Math.random() < 0.5 ? (a.replace(new RegExp(need, 'g'), '')[Math.floor(Math.random() * Math.max(1, a.length - 1))] || al[Math.floor(Math.random() * 25)]) : al[Math.floor(Math.random() * 25)]; }
    g.orbs.push({ c, x, y, t: 9 });
  }
  function pick(c) {
    const g = game, h = g.hero, a = g.w.word.toLowerCase();
    if (c === a[g.idx]) {
      g.idx++; g.miss = 0; g.score += P.letter;
      g.fx.push({ t: 0.6, txt: c.toUpperCase(), x: h.x, y: h.y - 34, c: '#CCFF00' });
      if (g.idx >= a.length) { showWord(); return wordDone(); }
    } else {
      g.miss++; g.fx.push({ t: 0.6, txt: `✕ ${c}`, x: h.x, y: h.y - 34, c: '#ff6b57' });
    }
    showWord();
  }
  // 拼好一個字：無雙大招清場（大王打破護盾＋重傷），然後升級三選一
  function wordDone() {
    const g = game, h = g.hero; g.words++; g.score += P.word;
    speak(g.w.word);
    g.fx.push({ t: 0.7, musou: 1, x: h.x, y: h.y });
    g.foes.slice().forEach((f) => { if (f.type === 'boss') { g.shieldOff = 6; hurtFoe(f, 160, 0); } else kill(f, Math.random() > 0.15); });
    g.orbs = []; h.inv = 1.2;
    banner('💥', L(`無雙！${g.w.word} +${P.word}`, `MUSOU! ${g.w.word} +${P.word}`), short(g.w), '#CCFF00');
    setTimeout(() => { if (game === g && !g.over && !g.spell) levelUp(); }, 650);
  }
  function levelUp() {
    const g = game; g.lv++; g.menu = true; joy = null; showWord();
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
    g.menu = false; g.last = performance.now(); pane(''); nextWord();
  }
  function burst(x, y, c, n) { for (let k = 0; k < n; k++) { const a = Math.random() * 6.28, v = rnd(40, 140); game.fx.push({ t: 0.5, p: 1, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c }); } }

  // ── 血量用完 → 拼字 ──
  function die() {
    const g = game; g.deaths++; joy = null;
    const pool = spellPool(), w = shuffle(pool.filter((x) => x.id !== g.w.id))[0] || pool[0];
    g.spell = { w, ans: answersOf(w)[0], shown: 1, tries: 0 };
    showWord(); renderSpell(); speak(w.word);
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
      h.hp = Math.round(h.max * 0.7); h.inv = 2;
      g.foes.slice().forEach((f) => { if (f.type !== 'boss' && Math.hypot(f.x - h.x, f.y - h.y) < 110) kill(f, true); });   // 復活時把身邊的怪推開
      showWord(); banner('✓', L('答對！繼續戰鬥', 'Correct! Keep fighting'), '', '#CCFF00');
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
    clearTimeout(bannerT); bannerT = setTimeout(() => el.classList.remove('on'), 1500);
  }

  // ── 結束 ──
  function end() {
    cancelAnimationFrame(raf);
    const g = game; if (!g || g.over) return;
    g.over = true; g.spell = null; g.menu = false; joy = null; showWord();
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
        ${L(`拼出 ${g.words} 個字・打倒 ${g.kills} 隻怪・墨水大王 ${g.bosses}・Lv${g.lv}・倒下 ${g.deaths}`, `${g.words} words · ${g.kills} monsters · ${g.bosses} Ink Kings · Lv${g.lv} · ${g.deaths} KOs`)}</div>
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
  }
  function draw() {
    if (!cx) return;
    cx.setTransform(S, 0, 0, S, 0, 0);
    // 場地：深綠草地＋格紋
    cx.fillStyle = '#1d3b24'; cx.fillRect(0, 0, LW, LH);
    cx.fillStyle = 'rgba(255,255,255,.035)';
    for (let x = 0; x < LW; x += 40) for (let y = 0; y < LH; y += 40) if (((x + y) / 40) % 2 === 0) cx.fillRect(x, y, 40, 40);
    cx.fillStyle = 'rgba(204,255,0,.07)'; for (let i = 0; i < 40; i++) cx.fillRect((i * 97) % LW, (i * 151) % LH, 3, 6);
    const g = game; if (!g) return;
    const h = g.hero;
    // 字母球
    g.orbs.forEach((o) => {
      const blink = o.t < 2 && Math.floor(o.t * 6) % 2;
      if (blink) return;
      cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(o.x, o.y + 12, 9, 3, 0, 0, 7); cx.fill();
      const by = Math.sin(g.clock * 4 + o.x) * 2;
      cx.fillStyle = '#fff6c2'; cx.strokeStyle = '#ffb547'; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(o.x, o.y + by, 11, 0, 7); cx.fill(); cx.stroke();
      cx.fillStyle = '#5a3a00'; cx.font = '800 14px Syne, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(o.c, o.x, o.y + by + 1); cx.textBaseline = 'alphabetic';
    });
    // 怪物（y 越下面越晚畫）
    const list = g.foes.slice().sort((a, b) => a.y - b.y);
    list.forEach((f) => drawFoe(f));
    // 寵物的小球
    g.shots.forEach((s2) => { cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.arc(s2.x, s2.y, 4, 0, 7); cx.fill(); });
    // 火球
    for (let i = 0; i < g.mod.orbit; i++) {
      const a = g.clock * 3 + i * Math.PI * 2 / g.mod.orbit, ox = h.x + Math.cos(a) * 52, oy = h.y + Math.sin(a) * 52;
      cx.fillStyle = 'rgba(255,140,40,.35)'; cx.beginPath(); cx.arc(ox, oy, 12, 0, 7); cx.fill();
      cx.fillStyle = '#ffb547'; cx.beginPath(); cx.arc(ox, oy, 7, 0, 7); cx.fill();
    }
    // 寵物＋角色
    if (hasPet()) drawImg(petImg, g.pet.x, g.pet.y, 30, 30, h.face, 0);
    if (!(h.inv > 0 && Math.floor(h.inv * 12) % 2)) {
      cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(h.x, h.y + 22, 14, 4, 0, 0, 7); cx.fill();
      const bob = Math.abs(Math.sin(h.walk)) * 3;
      if (heroImg) drawImg(heroImg, h.x, h.y - bob, 44, 67, h.face, 1);
      else { cx.fillStyle = '#CCFF00'; cx.beginPath(); cx.arc(h.x, h.y, HERO_R, 0, 7); cx.fill(); }
    }
    // 特效
    g.fx.forEach((f) => {
      if (f.slash) {   // 揮砍：顏色跟衣服一樣
        const col = (typeof AV_TOPC !== 'undefined' && look && AV_TOPC[look.topC]) || '#CCFF00';
        cx.save(); cx.globalAlpha = f.t / 0.16; cx.strokeStyle = col; cx.lineWidth = 7; cx.lineCap = 'round';
        cx.beginPath(); cx.arc(f.x, f.y, f.r * 0.8, f.a - 1.1, f.a + 1.1); cx.stroke();
        cx.strokeStyle = '#fff'; cx.lineWidth = 2; cx.beginPath(); cx.arc(f.x, f.y, f.r * 0.8, f.a - 0.9, f.a + 0.9); cx.stroke(); cx.restore();
      } else if (f.musou) {
        const k = 1 - f.t / 0.7;
        cx.save(); cx.globalAlpha = (1 - k) * 0.6; cx.fillStyle = '#fff'; cx.fillRect(0, 0, LW, LH);
        cx.globalAlpha = 1 - k; cx.strokeStyle = '#CCFF00'; cx.lineWidth = 10; cx.beginPath(); cx.arc(f.x, f.y, k * Math.max(LW, LH), 0, 7); cx.stroke(); cx.restore();
      } else if (f.p) {
        f.x += f.vx * 0.016; f.y += f.vy * 0.016; cx.globalAlpha = f.t / 0.5; cx.fillStyle = f.c; cx.fillRect(f.x - 2, f.y - 2, 4, 4); cx.globalAlpha = 1;
      } else if (f.txt) {
        f.y -= 0.5; cx.globalAlpha = Math.min(1, f.t * 2); cx.fillStyle = f.c; cx.font = '800 15px Syne, sans-serif'; cx.textAlign = 'center'; cx.fillText(f.txt, f.x, f.y); cx.globalAlpha = 1;
      }
    });
    // 大王血條
    if (g.boss) {
      const b = g.boss, w = Math.min(260, LW - 40), x = (LW - w) / 2, y = LH - 30;
      cx.fillStyle = 'rgba(0,0,0,.55)'; cx.fillRect(x - 2, y - 2, w + 4, 14);
      cx.fillStyle = g.shieldOff > 0 ? '#ff6b57' : '#b48cff'; cx.fillRect(x, y, w * Math.max(0, b.hp / b.max), 10);
      cx.fillStyle = '#fff'; cx.font = '700 11px "Noto Sans TC", sans-serif'; cx.textAlign = 'center';
      cx.fillText(g.shieldOff > 0 ? L('墨水大王・護盾破了！', 'Ink King · shield broken!') : L('墨水大王・🛡️ 護盾（拼好字打破）', 'Ink King · 🛡️ shield (spell a word)'), LW / 2, y - 5);
    }
    // 搖桿
    if (joy) {
      cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(joy.x0, joy.y0, 50, 0, 7); cx.stroke();
      cx.fillStyle = 'rgba(204,255,0,.45)'; cx.beginPath(); cx.arc(joy.x0 + joy.dx, joy.y0 + joy.dy, 20, 0, 7); cx.fill();
    } else if (g.elapsed < 4 && !g.menu && !g.spell) {
      cx.fillStyle = 'rgba(255,255,255,.6)'; cx.font = '700 14px "Noto Sans TC", sans-serif'; cx.textAlign = 'center';
      cx.fillText(L('👆 手指按住拖曳就能移動', '👆 Hold and drag to move'), LW / 2, LH - 50);
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
    if (f.type === 'bat') {
      const wv = Math.sin(t * 18 + f.ph) * 5;
      cx.fillStyle = fl ? '#fff' : '#7d5bd6';
      cx.beginPath(); cx.moveTo(x - 4, y); cx.lineTo(x - r - 8, y - 6 + wv); cx.lineTo(x - r, y + 4); cx.fill();
      cx.beginPath(); cx.moveTo(x + 4, y); cx.lineTo(x + r + 8, y - 6 + wv); cx.lineTo(x + r, y + 4); cx.fill();
      cx.beginPath(); cx.arc(x, y, r * 0.75, 0, 7); cx.fill();
    } else {
      const sq = Math.sin(t * 6 + f.ph) * 0.08;
      cx.fillStyle = fl ? '#fff' : f.type === 'boss' ? '#3b2a6b' : f.type === 'brute' ? '#a5512a' : '#2c8c84';
      cx.beginPath(); cx.ellipse(x, y, r * (1 + sq), r * (1 - sq), 0, 0, 7); cx.fill();
      if (f.type === 'boss') {   // 皇冠＋護盾
        cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.moveTo(x - 16, y - r + 4); cx.lineTo(x - 16, y - r - 12); cx.lineTo(x - 8, y - r - 4); cx.lineTo(x, y - r - 14); cx.lineTo(x + 8, y - r - 4); cx.lineTo(x + 16, y - r - 12); cx.lineTo(x + 16, y - r + 4); cx.fill();
        if (game.shieldOff <= 0) { cx.strokeStyle = `rgba(180,140,255,${0.5 + 0.3 * Math.sin(t * 5)})`; cx.lineWidth = 4; cx.beginPath(); cx.arc(x, y, r + 8, 0, 7); cx.stroke(); }
      }
    }
    // 眼睛
    const ex = r * 0.35, ey = f.type === 'bat' ? y - 2 : y - r * 0.2;
    cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(x - ex, ey, r * 0.22, 0, 7); cx.arc(x + ex, ey, r * 0.22, 0, 7); cx.fill();
    cx.fillStyle = '#111'; const lx = Math.sign(game.hero.x - x) * r * 0.07;
    cx.beginPath(); cx.arc(x - ex + lx, ey, r * 0.11, 0, 7); cx.arc(x + ex + lx, ey, r * 0.11, 0, 7); cx.fill();
    if (f.type !== 'slime' && f.type !== 'bat' && f.hp < f.max && f.type !== 'boss') {   // 大塊頭血條
      cx.fillStyle = 'rgba(0,0,0,.5)'; cx.fillRect(x - r, y - r - 8, r * 2, 4); cx.fillStyle = '#ff6b57'; cx.fillRect(x - r, y - r - 8, r * 2 * f.hp / f.max, 4);
    }
  }

  function onClick(e) {
    const t = e.target.closest('[data-wh]'); if (!t) return;
    const a = t.dataset.wh;
    if (a === 'start') { if (typeof unlockAudio === 'function') unlockAudio(); start(); }
    if (a === 'close') close();
    if (a === 'check') check();
    if (a === 'sk') takeSkill(t.dataset.sk);
    if (a === 'quit') {
      if (game && !game.over && !trial && !confirm(L('離開這一局？這局不會計分。', "Quit this game? It won't be scored."))) return;
      close();
    }
  }
  // 測試用
  const _t = { get game() { return game; }, end, check, toPts, pick, wordDone, spawnBoss, levelUp, takeSkill, get trial() { return trial; },
    get LW() { return LW; }, get LH() { return LH; }, get heroImg() { return heroImg; }, get petImg() { return petImg; }, setJoy(dx, dy) { joy = dx === null ? null : { id: -1, x0: 100, y0: 100, dx, dy }; } };
  return { id: ID, need: NEED, card, bestText, open, close, _t };
})();
GAMES.push(WH6);
