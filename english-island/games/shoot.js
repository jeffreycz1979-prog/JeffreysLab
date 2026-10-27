// ═══════════════════════════════════════════════════════
//  獎勵遊戲 #4：Word Shot（單字投籃）
//  解鎖：精熟 4 個單元（試玩：網址加 ?try=shoot，不用解鎖、不計分）
//  規則：3 分鐘；上方出現英文單字，三個籃框的籃板上各寫一個中文意思。
//        從下方把球往後拉（像彈弓），放開就投出去；投進正確意思的籃框得分，空心球再加分，連進有加成。
//        投進錯的籃框要拼出這個字才能繼續；沒投進任何籃框就再投一次（時間會一直走）。
//        越後面越難：第 6 球起籃框會上下移動、第 11 球起有風。
//        分數換算 0～20，所有遊戲共用每週最高一局。
//  依賴 index.html 的全域：st, $, esc, L, EN, meaning, speak, answersOf, norm, shuffle, distract, todayKey, clockCheck,
//        saveLedger, saveMeta, afterPoints, points, gameWeekBestAll, gameCard, masteredCount, GAMES, toast, confetti
// ═══════════════════════════════════════════════════════
const WS = (() => {
  const ID = 'shoot', NEED = 4, VER = '0.4';
  const TIME = 180, CAP = 20;
  const S_PER_PT = 200;               // 每 200 分 1 ⭐（4000 分滿 20）— 待實玩後調整
  const LW = 360;                     // 邏輯寬度
  const G = 980, VMAX = 1080, PULL = 130;   // 重力；最大初速；最大拉弓距離
  const R = 13, RIM = 31, RIMR = 4;   // 球半徑；籃框半寬；籃框邊緣（碰撞點）半徑
  const BASKET = 100, SWISH = 50, STREAK = 50;
  const MOVE_FROM = 6, WIND_FROM = 11;      // 第幾球開始移動籃框、開始有風
  let cv, cx, root, S = 1, VH = 640;
  let game = null, raf = 0, aim = null, trial = false;

  const unlocked = () => masteredCount() >= NEED;
  const wordPool = () => st.words.filter((w) => w.type !== '片語' && !/[ ()/]/.test(w.word) && w.word.length >= 3);
  const toPts = (sc) => Math.min(CAP, Math.floor(sc / S_PER_PT));
  const card = () => gameCard({ id: ID, need: NEED, icon: '🏀', name: 'Word Shot' });
  const bestText = () => { const b = st.meta.games && st.meta.games[ID] && st.meta.games[ID].best; return b ? `Word Shot ${b}` : ''; };
  const short = (w) => String(meaning(w) || '').split(/[；;,，]/)[0].trim();
  const FEVER_LEN = 15;   // 黃金時間 15 秒（v0.3：遠投拿掉，位置固定在中間才好抓力道）
  const REST = () => ({ x: LW / 2, y: VH - 170 });   // 球的發射位置（往下拉 130 也還在畫面裡）
  const elapsed = () => (game ? (Date.now() - game.t0) / 1000 : 0);
  const fever = () => !!game && elapsed() < game.feverEnd;
  const mult = () => (fever() ? 2 : 1) * (game && game.usePower === 'x2' ? 2 : 1);
  const GOLD = '#ffd23f';
  // 道具：連進 2 球（之後每 2 球）可以選一個，用在下一題
  const POWERS = [
    { id: 'x2', ic: '💰', name: ['下一球投進分數 ×2', 'Next basket ×2'] },
    { id: 'time', ic: '⏱️', name: ['遊戲時間 +7 秒', '+7 seconds'] },
    { id: 'big', ic: '⭕', name: ['籃框全部變大', 'Bigger hoops'] },
    { id: 'aim', ic: '🎯', name: ['完整瞄準線', 'Full aim line'] },
  ];
  const rimOf = (h) => (h.big ? 46 : RIM);

  // ── 畫面 ──
  function mount() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'wj wr ws';
    root.innerHTML = `<canvas></canvas>
      <div class="wb-banner" id="wsBanner"></div>
      <div class="wr-gate" id="wsQ" style="display:none"></div>
      <div class="wj-hud"><button class="wj-x" data-ws="quit">✕</button>
        <span class="wr-coin" id="wsB">🏀 0</span>
        <span class="wj-t" id="wsT">3:00</span><span class="wj-h" id="wsS">0</span><span class="wj-p" id="wsP">⭐ 0</span></div>
      <div class="wj-pane" id="wsPane"></div>`;
    document.body.appendChild(root);
    if (!document.getElementById('wsCss')) {
      const st2 = document.createElement('style'); st2.id = 'wsCss';
      st2.textContent = `.ws-pw{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0 6px}
        .ws-pw .btn{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:14px;line-height:1.3;padding:12px 8px;border-color:#4ECDC4;min-height:92px}
        .ws-pw .btn span{font-size:28px}`;
      document.head.appendChild(st2);
    }
    cv = root.querySelector('canvas'); cx = cv.getContext('2d');
    root.addEventListener('click', onClick);
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', () => { aim = null; });
    addEventListener('resize', resize);
  }
  function resize() {
    if (!root) return;
    const w = root.clientWidth, h = root.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    S = (w * dpr) / LW; VH = (h * dpr) / S;
    if (game) layoutHoops(true);
  }
  const pane = (html) => { const p = root.querySelector('#wsPane'); p.innerHTML = html; p.style.display = html ? '' : 'none'; };
  const toLogic = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * LW, y: (e.clientY - r.top) / r.height * VH }; };

  // ── 操作：在下半部按住往後拉，放開投出（拉越遠越用力） ──
  const ready = () => game && !game.spell && !game.over && !game.choosing && game.ball.state === 'rest';
  function onDown(e) {
    if (!ready()) return;
    const p = toLogic(e);
    if (p.y < VH * 0.45) return;    // 上半部不能拉（避免誤觸）
    aim = { x0: p.x, y0: p.y, dx: 0, dy: 0 };
    cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
  }
  function onMove(e) {
    if (!aim || !ready()) return;
    const p = toLogic(e);
    let dx = p.x - aim.x0, dy = p.y - aim.y0; const d = Math.hypot(dx, dy);
    if (d > PULL) { dx *= PULL / d; dy *= PULL / d; }
    aim.dx = dx; aim.dy = dy;
  }
  function onUp() {
    if (!aim || !ready()) { aim = null; return; }
    const d = Math.hypot(aim.dx, aim.dy);
    if (d > 18 && aim.dy > 6) {   // 要往下拉才算（往上推不會投）
      const k = VMAX / PULL, b = game.ball;
      b.vx = -aim.dx * k; b.vy = -aim.dy * k; b.state = 'fly'; b.t = 0; b.touched = false; b.top = b.y;
      game.shots++;
    }
    aim = null;
  }

  // ── 開始畫面 ──
  function open(opts) {
    trial = !!(opts && opts.trial);
    if (!trial && !unlocked()) return toast(L(`精熟 ${NEED} 個單元後解鎖`, `Master ${NEED} units to unlock`));
    if (wordPool().length < 6) return toast(L('單字太少，還不能玩', 'Not enough words yet'));
    mount(); root.classList.add('show'); resize();
    document.body.style.overflow = 'hidden';
    const best = gameWeekBestAll(), pb = (st.meta.games && st.meta.games[ID] && st.meta.games[ID].best) || 0;
    pane(`<div class="wj-card">
      <div class="wj-ic">🏀</div>
      <h2>Word Shot</h2>
      <p>${L('看英文，把球投進正確意思的籃框！', 'Read the word and shoot into the hoop with the right meaning!')}</p>
      <div class="wj-rules">
        <div>👇 ${L('在下面按住，往後拉（像彈弓），放開就投出去；拉越遠越用力', 'Press near the bottom, pull back like a slingshot, let go to shoot')}</div>
        <div>🏀 ${L(`投進正確的籃框 +${BASKET}；空心球（沒碰到籃框）再 +${SWISH}`, `Right hoop +${BASKET}; swish (no rim) +${SWISH}`)}</div>
        <div>🔥 ${L(`連進 3 球以上，每球再 +${STREAK}`, `3+ in a row: +${STREAK} each`)}</div>
        <div>✨ ${L(`籃框發金光＝黃金時間，${FEVER_LEN} 秒內投進分數 ×2`, `Golden hoops = GOLDEN TIME: ×2 for ${FEVER_LEN}s`)}</div>
        <div>🎁 ${L('連進 2 球可以選一個道具：下一球 ×2／時間 +7 秒／籃框變大／完整瞄準線', 'Every 2 in a row: pick a power-up (next basket ×2 / +7 s / bigger hoops / full aim line)')}</div>
        <div>✏️ ${L('投進錯的籃框，要拼出這個字才能繼續（時間不會停）', 'Wrong hoop = spell the word (clock keeps running)')}</div>
        <div>↕️ ${L(`第 ${MOVE_FROM} 題起籃框會上下移動，第 ${WIND_FROM} 題起有風 🌬️`, `Hoops move from word ${MOVE_FROM}; wind from word ${WIND_FROM} 🌬️`)}</div>
        <div>⭐ ${trial ? L('試玩模式：不計分', 'Trial: not scored') : L(`每 ${S_PER_PT} 分 1 顆星，最多 ${CAP}；所有遊戲每週只算最高一局`, `1 ⭐ per ${S_PER_PT} points, up to ${CAP}; best game of the week counts`)}</div>
      </div>
      <p class="wj-small">${trial ? L('🧪 試玩版', '🧪 Trial') : L(`本週遊戲最佳 ${best} / ${CAP} ⭐・個人最高 ${pb} 分`, `Best this week ${best} / ${CAP} ⭐ · Personal best ${pb}`)}<br><span style="opacity:.5">v${VER}</span></p>
      <div class="btnrow"><button class="btn" data-ws="start">${L('開始 Start ▶', 'Start ▶')}</button><button class="btn ghost" data-ws="close">${L('離開', 'Exit')}</button></div>
    </div>`);
    game = null; showQ(); draw();
  }
  function close() {
    cancelAnimationFrame(raf); game = null; aim = null;
    if (root) root.classList.remove('show');
    document.body.style.overflow = '';
    if (typeof renderQuiz === 'function' && $('v-quiz') && $('v-quiz').classList.contains('active')) renderQuiz();
  }

  // ── 遊戲 ──
  function start() {
    aim = null;
    game = {
      t0: Date.now(), last: performance.now(), clock: 0,
      ball: { x: 0, y: 0, vx: 0, vy: 0, state: 'rest', t: 0, touched: false, top: 0, spin: 0 },
      hoops: [], q: null, n: 0, wind: 0, used: new Set(), feverEnd: 0, feverAt: 20 + Math.random() * 10, fevers: 0, power: null, powers: 0, choosing: null,
      score: 0, baskets: 0, swish: 0, wrong: 0, shots: 0, streak: 0, bestStreak: 0, fx: [], spell: null, over: false, pause: 0,
    };
    pane(''); nextQ(); loop();
  }
  // 新的一題：英文單字＋三個意思（一個正確）
  function nextQ() {
    const g = game, pool = wordPool(), fresh = pool.filter((w) => !g.used.has(w.id));
    const w = shuffle(fresh.length ? fresh : pool)[0]; g.used.add(w.id);
    const opts = shuffle([w, ...distract(w, 2)]);
    g.n++;
    g.q = { w, opts, ans: opts.indexOf(w) };
    g.wind = g.n >= WIND_FROM ? (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 110) : 0;
    const pw = g.power; g.power = null; g.usePower = pw;   // 這一題用的道具
    g.hoops = opts.map((o, i) => ({ i, x: 0, y: 0, by: 0, ph: Math.random() * 6, amp: 0, sp: 0, flash: 0, big: pw === 'big', gone: false }));
    showQ(); layoutHoops(false);   // 先放題目，籃框才知道要往下讓多少
    resetBall();
    showQ(); speak(w.word);
  }
  function layoutHoops(keep) {
    const g = game, n = g.n;
    g.hoops.forEach((h, i) => {
      h.x = 62 + i * 118;   // 三個籃框固定在左、中、右（上下移動，籃板不會撞在一起）
      if (!keep) {
        h.yr = 0.22 + Math.random() * 0.12;   // 高度（畫面比例）各不相同
        h.amp = n >= MOVE_FROM ? Math.min(46, 16 + (n - MOVE_FROM) * 4) : 0;
        h.sp = n >= MOVE_FROM ? 1.1 + Math.random() * 0.9 : 0;
      }
      h.by = Math.max(VH * h.yr + 40, topY() + 8 + 66 + h.amp); h.y = h.by;   // 籃板（高 66）不能被題目擋到，連上下移動的幅度也算
    });
  }
  // 題目框下緣（換成遊戲座標）；iPhone 瀏海／動態島會把題目往下推
  function topY() {
    const el = root && root.querySelector('#wsQ .wr-q'), hudEl = root && root.querySelector('.wj-hud');
    const r = cv.getBoundingClientRect(); if (!r.width) return 110;
    const px = el && el.offsetParent ? el.getBoundingClientRect().bottom : (hudEl ? hudEl.getBoundingClientRect().bottom + 56 : 110);
    return (px - r.top) * LW / r.width;
  }
  function resetBall() { const r = REST(), b = game.ball; Object.assign(b, { x: r.x, y: r.y, vx: 0, vy: 0, state: 'rest', t: 0, touched: false, top: r.y }); }

  function loop() {
    raf = requestAnimationFrame(loop);
    const g = game; if (!g) return;
    const now = performance.now(), dt = Math.min(0.033, (now - g.last) / 1000); g.last = now; g.clock += dt * 1000;
    if (g.choosing) { g.last = now; hud(TIME - (g.choosing - g.t0) / 1000); draw(); return; }
    const left = TIME - (Date.now() - g.t0) / 1000;
    if (left <= 0) return end();
    const el = elapsed();
    if (el >= g.feverAt && left > 6) {   // 黃金時間：開局 20～30 秒第一次，之後每 25～35 秒
      g.feverEnd = el + FEVER_LEN; g.feverAt = g.feverEnd + 25 + Math.random() * 10; g.fevers++;
      if (!g.spell) banner('✨', 'GOLDEN TIME!', L(`${FEVER_LEN} 秒內投進分數 ×2`, `×2 for ${FEVER_LEN} seconds`), GOLD);
    }
    if (!g.spell) step(dt);
    hud(left); draw();
  }
  function step(dt) {
    const g = game, b = g.ball;
    g.hoops.forEach((h) => { h.y = h.by + Math.sin(g.clock / 1000 * h.sp + h.ph) * h.amp; if (h.flash > 0) h.flash -= dt; });
    g.fx = g.fx.filter((f) => (f.t -= dt) > 0);
    if (g.pause > 0) { g.pause -= dt; if (g.pause <= 0) g.after && g.after(); return; }
    if (b.state !== 'fly') return;
    // 分成小步移動，快速時不會穿過籃框
    const steps = 3, h_ = dt / steps;
    for (let k = 0; k < steps && b.state === 'fly'; k++) {
      const py = b.y;
      b.vx += g.wind * h_; b.vy += G * h_;
      b.x += b.vx * h_; b.y += b.vy * h_; b.t += h_; b.spin += b.vx * h_ * 0.05; b.top = Math.min(b.top, b.y);
      if (b.vy <= 0) continue;   // 往上飛時球在籃框前面（往畫面裡面投），不會撞到；落下時才判斷籃框
      for (const hp of g.hoops) {
        if (hp.gone) continue;
        const RIM = rimOf(hp);
        for (const s of [-1, 1]) {   // 籃框左右兩個邊緣：反彈
          const rx = hp.x + s * RIM, ry = hp.y, dx = b.x - rx, dy = b.y - ry, d = Math.hypot(dx, dy);
          if (d < R + RIMR && d > 0) {
            const nx = dx / d, ny = dy / d, vn = b.vx * nx + b.vy * ny;
            if (vn < 0) { b.vx -= 1.6 * vn * nx; b.vy -= 1.6 * vn * ny; b.vx *= 0.88; b.vy *= 0.88; }
            b.x = rx + nx * (R + RIMR); b.y = ry + ny * (R + RIMR); b.touched = true;
          }
        }
        const inside = Math.abs(b.x - hp.x) < RIM - RIMR;
        if (inside && py < hp.y && b.y >= hp.y && b.top < hp.y - 4) return land(hp.i);   // 從籃框上方落下穿過＝進球
      }
      if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) * 0.6; }          // 左右牆
      if (b.x > LW - R) { b.x = LW - R; b.vx = -Math.abs(b.vx) * 0.6; }
      if (b.y > VH + 40 || b.t > 4) return miss();
    }
  }
  function land(i) {
    const g = game, b = g.ball, h = g.hoops[i];
    b.state = 'in'; h.flash = 0.6;
    if (i === g.q.ans) {
      let pts = BASKET; g.baskets++; g.streak++; g.bestStreak = Math.max(g.bestStreak, g.streak);
      if (!b.touched) { pts += SWISH; g.swish++; }
      if (g.streak >= 3) pts += STREAK;
      const m = mult(); pts *= m;
      g.score += pts;
      burst(h.x, h.y, '#CCFF00');
      const tag = m > 1 ? ` (×${m})` : '';
      banner(m > 1 ? '✨' : !b.touched ? '💫' : '🏀', (!b.touched ? L(`空心球！+${pts}`, `Swish! +${pts}`) : L(`進了！+${pts}`, `Nice! +${pts}`)) + tag,
        g.streak >= 3 ? L(`連進 ${g.streak} 球 🔥`, `${g.streak} in a row 🔥`) : `${g.q.w.word} = ${short(g.q.w)}`, '#CCFF00');
      g.after = g.streak % 2 === 0 ? offerPower : nextQ; g.pause = 0.75;
    } else {
      g.wrong++; g.streak = 0;
      burst(h.x, h.y, '#ff6b57');
      banner('✕', L('投錯籃框了', 'Wrong hoop'), `${g.q.w.word} = ${short(g.q.w)}`, '#ff6b57');
      g.after = () => openSpell(g.q.w); g.pause = 0.9;
    }
  }
  function offerPower() {
    const g = game; g.choosing = Date.now(); aim = null; showQ();
    pane(`<div class="wj-card"><div class="wj-kicker">🔥 ${L(`連進 ${g.streak} 球！選一個道具（下一題用）`, `${g.streak} in a row! Pick a power-up for the next word`)}</div>
      <div class="ws-pw">${POWERS.map((p) => `<button class="btn ghost" data-ws="pw" data-pw="${p.id}"><span>${p.ic}</span>${L(...p.name)}</button>`).join('')}</div>
      <p class="wj-small">${L('選的時候時間暫停', 'The clock is paused')}</p></div>`);
  }
  function pickPower(id) {
    const g = game; if (!g || !g.choosing) return;
    g.t0 += Date.now() - g.choosing; g.choosing = null; g.last = performance.now();   // 選道具的時間不算
    g.powers++; pane('');
    if (id === 'time') g.t0 += 7000; else g.power = id;   // +7 秒馬上生效；其他用在下一題
    nextQ();
    const p = POWERS.find((x) => x.id === id); banner(p.ic, L(p.name[0], p.name[1]), id === 'time' ? '' : L('這一題可以用', 'For this word'), '#4ECDC4');
  }
  function miss() {
    const g = game; g.streak = 0;
    banner('💨', L('沒進，再投一次', 'Missed — try again'), '', '#4ECDC4');
    resetBall();
  }
  function burst(x, y, c) { for (let k = 0; k < 14; k++) { const a = Math.random() * 6.28, v = 60 + Math.random() * 120; game.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, t: 0.6, c }); } }
  let bannerT = 0;
  function banner(ic, big, small, c) {
    const el = $('wsBanner'); if (!el) return;
    el.style.setProperty('--c', c); el.style.borderColor = c;
    el.innerHTML = `<span class="ic">${ic}</span><div><b>${esc(big)}</b>${small ? `<small>${esc(small)}</small>` : ''}</div>`;
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    clearTimeout(bannerT); bannerT = setTimeout(() => el.classList.remove('on'), 1300);
  }
  function showQ() {
    const el = $('wsQ'); if (!el) return;
    const q = game && game.q;
    if (!q || game.spell || game.over || game.choosing) { el.style.display = 'none'; el.innerHTML = ''; return; }
    el.style.display = '';
    el.innerHTML = `<div class="wr-q">🏀 <b>${esc(q.w.word)}</b><button class="spk small" data-say="${esc(q.w.word)}">🔊</button></div>`;
  }

  // ── 投錯 → 拼字（拼這一題的字） ──
  function openSpell(w) {
    const g = game; aim = null;
    g.spell = { w, ans: answersOf(w)[0], shown: 1, tries: 0 };
    showQ(); renderSpell(); speak(w.word);
  }
  function renderSpell(bad) {
    const s = game.spell, a = s.ans;
    const hint = a.split('').map((c, i) => (i < s.shown ? c : '_')).join(' ');
    pane(`<div class="wj-card wj-spell ${bad ? 'shake' : ''}">
      <div class="wj-kicker">${L('投錯了！拼對才能繼續', 'Wrong hoop! Spell it to keep going')} ✏️</div>
      <div class="wj-mean" ${EN() ? 'style="font-size:17px"' : ''}>${esc(meaning(s.w))}</div>
      <div class="qmid"><span class="pos">${esc(s.w.pos || '')}</span><button class="spk small" data-say="${esc(s.w.word)}">🔊</button></div>
      <div class="hintw">${esc(hint)}</div>
      <input class="spellin" id="wsIn" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="type here">
      ${s.tries ? `<div class="wj-small" style="color:var(--coral)">${L(`拼錯 ${s.tries} 次，多給你一個字母`, `${s.tries} wrong — here's another letter`)}</div>` : ''}
      <button class="btn wide" style="margin-top:10px" data-ws="check">${L('確認 Check', 'Check')}</button>
    </div>`);
    const inp = $('wsIn'); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    setTimeout(() => inp.focus(), 50);
  }
  function check() {
    const s = game && game.spell; if (!s) return;
    const v = norm($('wsIn').value || '');
    if (!v) return $('wsIn').focus();
    if (answersOf(s.w).includes(v)) {
      const g = game; g.spell = null; pane(''); g.last = performance.now();
      banner('✓', L('答對！繼續投', 'Correct! Keep shooting'), '', '#CCFF00');
      nextQ();
    } else {
      s.tries++; s.shown = Math.min(s.ans.length, s.shown + 1);
      renderSpell(true); speak(s.w.word);
    }
  }

  // ── 結束 ──
  function end() {
    cancelAnimationFrame(raf);
    const g = game; if (!g || g.over) return;
    g.over = true; g.spell = null; aim = null; showQ();
    const sc = g.score, pts = toPts(sc);
    let gain = 0, prev = 0, record = false, best = sc;
    if (!trial) {
      const k = todayKey(), before = points().total; prev = gameWeekBestAll();
      clockCheck();
      const day = st.ledger.days[k] || (st.ledger.days[k] = { cards: 0 });
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
        ${L(`投進 ${g.baskets} 球（空心 ${g.swish}）・投錯 ${g.wrong}・出手 ${g.shots} 次・道具 ${g.powers}・最多連進 ${g.bestStreak}`, `${g.baskets} baskets (${g.swish} swish) · ${g.wrong} wrong · ${g.shots} shots · best streak ${g.bestStreak}`)}</div>
      <div class="wj-pts">⭐ ${pts} / ${CAP}</div>
      ${trial ? '' : gain ? `<div class="gain">+${gain} ⭐</div>`
        : `<div class="gain zero">${prev >= CAP ? L('本週遊戲已經拿滿 20 分，現在純粹好玩 🎮', 'You already got 20 this week — just for fun now 🎮')
          : L(`本週遊戲最佳是 ${prev} 分，超過才會再加分`, `Your best this week is ${prev} — beat it to earn more`)}</div>`}
      <div class="btnrow" style="margin-top:14px"><button class="btn" data-ws="start">${L('再玩一次', 'Play again')}</button><button class="btn ghost" data-ws="close">${L('離開', 'Exit')}</button></div>
    </div>`);
  }

  // ── 繪圖 ──
  function hud(left) {
    const g = game, m = Math.floor(left / 60), s = Math.floor(left % 60);
    $('wsT').textContent = `${m}:${String(s).padStart(2, '0')}`; $('wsT').classList.toggle('low', left < 20);
    $('wsS').textContent = g ? g.score : 0; $('wsB').textContent = `🏀 ${g ? g.baskets : 0}`;
    $('wsP').textContent = `⭐ ${g ? toPts(g.score) : 0}`;
  }
  function draw() {
    if (!cx) return;
    cx.setTransform(S, 0, 0, S, 0, 0);
    // 球場：牆面＋木地板
    const floor = VH - 150;
    let gr = cx.createLinearGradient(0, 0, 0, floor); gr.addColorStop(0, '#141a33'); gr.addColorStop(1, '#232c52');
    cx.fillStyle = gr; cx.fillRect(0, 0, LW, floor);
    cx.fillStyle = 'rgba(255,255,255,.04)'; for (let x = 0; x < LW; x += 40) cx.fillRect(x, 0, 1, floor);
    gr = cx.createLinearGradient(0, floor, 0, VH); gr.addColorStop(0, '#c98a4b'); gr.addColorStop(1, '#a8682f');
    cx.fillStyle = gr; cx.fillRect(0, floor, LW, VH - floor);
    cx.strokeStyle = 'rgba(80,40,10,.25)'; cx.lineWidth = 1; for (let x = 0; x < LW; x += 30) { cx.beginPath(); cx.moveTo(x, floor); cx.lineTo(x - 40, VH); cx.stroke(); }
    cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 3; cx.beginPath(); cx.ellipse(LW / 2, VH - 60, 120, 40, 0, Math.PI, 0); cx.stroke();
    const g = game;
    if (!g) return;
    // 風
    if (g.wind && !g.over) {
      cx.save(); cx.globalAlpha = 0.8; cx.fillStyle = '#4ECDC4'; cx.font = '700 13px "Noto Sans TC", sans-serif'; cx.textAlign = 'center';
      const dir = g.wind > 0 ? '→' : '←', n = Math.round(Math.abs(g.wind) / 60);
      cx.fillText(`🌬️ ${L('風', 'Wind')} ${dir.repeat(Math.max(1, n))}`, LW / 2, topY() + 18);   // 題目下方
      cx.restore();
    }
    if (fever() && !g.over) {   // 黃金時間：畫面四周金光＋閃亮
      const left = Math.ceil(g.feverEnd - elapsed()), pul = 0.5 + 0.5 * Math.sin(g.clock / 160);
      cx.save();
      const vg = cx.createRadialGradient(LW / 2, VH / 2, Math.min(LW, VH) * 0.35, LW / 2, VH / 2, Math.max(LW, VH) * 0.75);
      vg.addColorStop(0, 'rgba(255,210,63,0)'); vg.addColorStop(1, `rgba(255,190,40,${0.28 + 0.14 * pul})`);
      cx.fillStyle = vg; cx.fillRect(0, 0, LW, VH);
      for (let i = 0; i < 14; i++) {   // 金色閃光點
        const sx = (i * 97 + g.clock / 9) % LW, sy = (i * 151 + Math.sin(g.clock / 500 + i) * 30 + VH) % (VH - 160);
        cx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(g.clock / 300 + i)); cx.fillStyle = '#fff6c2';
        cx.beginPath(); cx.moveTo(sx, sy - 5); cx.lineTo(sx + 1.5, sy); cx.lineTo(sx, sy + 5); cx.lineTo(sx - 1.5, sy); cx.fill();
        cx.beginPath(); cx.moveTo(sx - 5, sy); cx.lineTo(sx, sy + 1.5); cx.lineTo(sx + 5, sy); cx.lineTo(sx, sy - 1.5); cx.fill();
      }
      cx.globalAlpha = 1; cx.font = '800 16px Syne, "Noto Sans TC", sans-serif'; cx.textAlign = 'center';
      cx.shadowColor = GOLD; cx.shadowBlur = 12; cx.fillStyle = GOLD; cx.fillText(`✨ GOLDEN TIME ×2 · ${left}s`, LW / 2, topY() + (g.wind ? 40 : 20)); cx.restore();
    }
    if (g.spell) return;   // 拼字時只留球場背景
    g.hoops.forEach((h) => drawHoop(h, 'back'));
    drawBall();
    g.hoops.forEach((h) => drawHoop(h, 'front'));
    // 特效
    g.fx.forEach((f) => { f.x += f.vx * 0.016; f.y += f.vy * 0.016; f.vy += 300 * 0.016; cx.globalAlpha = Math.max(0, f.t / 0.6); cx.fillStyle = f.c; cx.beginPath(); cx.arc(f.x, f.y, 3, 0, 7); cx.fill(); });
    cx.globalAlpha = 1;
  }
  function drawHoop(h, layer) {
    const g = game, op = g.q && g.q.opts[h.i], RIM = rimOf(h), gold = fever();
    if (h.gone) {   // 被道具拿掉的籃框：只留淡淡的影子
      if (layer === 'back') { cx.save(); cx.globalAlpha = 0.18; cx.fillStyle = '#fff'; cx.fillRect(h.x - 52, h.y - 66, 104, 54); cx.restore(); }
      return;
    }
    if (layer === 'back') {
      // 籃板（上面寫中文意思）
      const bw = 104, bh = 54, bx = h.x - bw / 2, by = h.y - bh - 12;
      cx.fillStyle = h.flash > 0 ? (h.i === g.q.ans ? 'rgba(204,255,0,.95)' : 'rgba(255,107,87,.95)') : gold ? '#fff4c4' : 'rgba(255,255,255,.95)';
      cx.strokeStyle = gold ? GOLD : '#4ECDC4'; cx.lineWidth = gold ? 5 : 3;
      if (gold) { cx.shadowColor = GOLD; cx.shadowBlur = 18 + 8 * Math.sin(g.clock / 150); }
      cx.beginPath(); cx.roundRect ? cx.roundRect(bx, by, bw, bh, 8) : cx.rect(bx, by, bw, bh); cx.fill(); cx.stroke(); cx.shadowBlur = 0;
      cx.strokeStyle = '#ff6b57'; cx.lineWidth = 2; cx.strokeRect(h.x - 18, h.y - 30, 36, 20);
      if (op) {
        cx.fillStyle = '#10140a'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        let t = short(op); const fs = t.length > 6 ? 13 : 16;
        if (t.length > 9) t = t.slice(0, 8) + '…';
        cx.font = `800 ${fs}px "Noto Sans TC", sans-serif`; cx.fillText(t, h.x, by + 17);
        cx.textBaseline = 'alphabetic';
      }
      // 籃框後半圈
      cx.strokeStyle = gold ? '#e0a100' : '#c94a1a'; cx.lineWidth = 4; cx.beginPath(); cx.ellipse(h.x, h.y, RIM, 7, 0, Math.PI, 0); cx.stroke();
    } else {
      // 籃網＋籃框前半圈（畫在球的前面，看起來像球掉進網子）
      cx.strokeStyle = 'rgba(255,255,255,.75)'; cx.lineWidth = 1.5;
      for (let k = -3; k <= 3; k++) { cx.beginPath(); cx.moveTo(h.x + k * (RIM / 3.2), h.y + 2); cx.lineTo(h.x + k * (RIM / 5), h.y + 34); cx.stroke(); }
      for (let r = 1; r <= 3; r++) { const y = h.y + r * 10, w = RIM - r * 4; cx.beginPath(); cx.moveTo(h.x - w, y); cx.lineTo(h.x + w, y); cx.stroke(); }
      cx.strokeStyle = gold ? GOLD : '#ff7a2f'; cx.lineWidth = 4; cx.beginPath(); cx.ellipse(h.x, h.y, RIM, 7, 0, 0, Math.PI); cx.stroke();
    }
  }
  function drawBall() {
    const g = game, b = g.ball, r = REST();
    let x = b.x, y = b.y;
    if (b.state === 'rest' && !g.spell && !g.over) {
      const px = aim ? aim.dx : 0, py = aim ? aim.dy : 0;
      x = r.x + px; y = r.y + py;
      // 彈弓：兩根柱子＋橡皮筋
      cx.strokeStyle = '#6b4a2b'; cx.lineWidth = 7; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(r.x - 30, r.y + 60); cx.lineTo(r.x - 26, r.y - 4); cx.moveTo(r.x + 30, r.y + 60); cx.lineTo(r.x + 26, r.y - 4); cx.stroke();
      cx.strokeStyle = '#1a3a1a'; cx.lineWidth = 4;
      cx.beginPath(); cx.moveTo(r.x - 26, r.y - 4); cx.lineTo(x, y); cx.lineTo(r.x + 26, r.y - 4); cx.stroke();
      // 瞄準輔助線：只畫前一小段
      if (aim && Math.hypot(px, py) > 18 && py > 6) {
        const k = VMAX / PULL; let vx = -px * k, vy = -py * k, sx = x, sy = y;
        for (let i = 1, n = g.usePower === 'aim' ? 40 : 9; i <= n; i++) {
          const t = 0.035; vx += g.wind * t; vy += G * t; sx += vx * t; sy += vy * t;
          cx.fillStyle = g.usePower === 'aim' ? `rgba(78,205,196,${Math.max(0.25, 0.9 - i * 0.015)})` : `rgba(255,255,255,${0.8 - i * 0.07})`; cx.beginPath(); cx.arc(sx, sy, 3.2, 0, 7); cx.fill();
        }
      } else if (!aim) {
        cx.fillStyle = 'rgba(255,255,255,.55)'; cx.font = '600 12px "Noto Sans TC", sans-serif'; cx.textAlign = 'center';
        cx.fillText(L('按住往下拉，放開投籃', 'Pull down & release'), r.x, r.y + 44);
      }
      if (g.usePower) {   // 這一題的道具
        const p = POWERS.find((x) => x.id === g.usePower);
        cx.save(); cx.textAlign = 'center'; cx.font = '700 13px "Noto Sans TC", sans-serif'; cx.fillStyle = '#4ECDC4';
        cx.fillText(`${p.ic} ${L(p.name[0], p.name[1])}`, r.x, r.y - 44); cx.restore();
      }
    }
    if (b.state === 'in') return;
    // 影子
    cx.fillStyle = 'rgba(0,0,0,.25)'; cx.beginPath(); cx.ellipse(x, VH - 40, 12, 4, 0, 0, 7); cx.fill();
    // 籃球
    const hy = g.hoops.length ? g.hoops.reduce((a, h) => a + h.y, 0) / g.hoops.length : VH * 0.3;
    const far = Math.max(0, Math.min(1, (r.y - y) / Math.max(1, r.y - hy)));   // 0＝在手上，1＝到籃框的高度
    const sc = 1.25 - 0.3 * far;   // 球在手上大一點，飛到籃框附近跟籃框差不多
    cx.save(); cx.translate(x, y); cx.rotate(b.spin); cx.scale(sc, sc);
    if (fever()) { cx.shadowColor = GOLD; cx.shadowBlur = 16; }
    cx.fillStyle = fever() ? '#ffc21a' : '#f28c28'; cx.beginPath(); cx.arc(0, 0, R, 0, 7); cx.fill(); cx.shadowBlur = 0;
    cx.strokeStyle = '#3a1d08'; cx.lineWidth = 1.6;
    cx.beginPath(); cx.arc(0, 0, R, 0, 7); cx.moveTo(-R, 0); cx.lineTo(R, 0); cx.moveTo(0, -R); cx.lineTo(0, R); cx.stroke();
    cx.beginPath(); cx.arc(-R * 1.15, 0, R * 0.8, -0.9, 0.9); cx.stroke(); cx.beginPath(); cx.arc(R * 1.15, 0, R * 0.8, Math.PI - 0.9, Math.PI + 0.9); cx.stroke();
    cx.restore();
  }

  function onClick(e) {
    const t = e.target.closest('[data-ws]'); if (!t) return;
    const a = t.dataset.ws;
    if (a === 'start') { if (typeof unlockAudio === 'function') unlockAudio(); start(); }
    if (a === 'close') close();
    if (a === 'check') check();
    if (a === 'pw') pickPower(t.dataset.pw);
    if (a === 'quit') {
      if (game && !game.over && !trial && !confirm(L('離開這一局？這局不會計分。', "Quit this game? It won't be scored."))) return;
      close();
    }
  }
  // 測試用：直接投出（vx, vy 是初速），或直接判定進某個籃框
  const _t = { get game() { return game; }, shoot(vx, vy) { const b = game.ball; Object.assign(b, { vx, vy, state: 'fly', t: 0, touched: false, top: b.y }); game.shots++; },
    land, check, end, toPts, REST, mult, get VH() { return VH; }, get trial() { return trial; } };
  return { id: ID, need: NEED, card, bestText, open, close, _t };
})();
GAMES.push(WS);
