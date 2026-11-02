// ═══════════════════════════════════════════════════════
//  THP11 獎勵遊戲 #3：Word Run（叢林神殿跑酷）
//  解鎖：精熟 3 個單元
//  規則：3 分鐘；三條跑道，左右滑換道、往上滑跳過樹幹、往下滑鑽過藤蔓、大石頭要換道閃開。
//        每隔一段會出現「單字門」：上方出現英文，三條跑道各一個意思，跑進正確那條 +100、加速；跑錯會減速。
//        撞到障礙物要拼字（題目出自所有已開放單元），拼錯就多提示一個字母，時間不暫停。
//        分數換算 0～20，所有遊戲共用每週最高一局。
//  依賴 index.html 的全域：st, $, esc, L, EN, meaning, speak, answersOf, norm, shuffle, distract, todayKey, clockCheck,
//        saveLedger, saveMeta, saveSet, afterPoints, points, gameWeekBestAll, gameCard, masteredCount, GAMES, toast, confetti
// ═══════════════════════════════════════════════════════
const WR = (() => {
  const ID = 'run', NEED = 3, VER = '1.1';
  const TIME = 180, CAP = 20;
  const S_PER_PT = 200;      // 每 200 分 = 1 ⭐（4000 分滿 20）；機器人（瞬間拼字）：單字門全對約 4200、答對 75% 約 3300、答對 55% 約 2700 — 待 Jeffrey 實玩後調整
  const LW = 360, LANE = 104;            // 邏輯寬度；跑道寬（玩家位置）
  const D = 60, F = 6;                   // 最遠看得到的距離；透視參數
  const V0 = 13, VMAX = 25;              // 起始速度、最高速度（公尺／秒）
  const GATE_EVERY = 14000, GATE_V = 14; // 單字門間隔（毫秒）；門靠近時最高速度（留時間讀題）
  const JUMP_T = 0.62, SLIDE_T = 0.7;    // 跳躍、滑行秒數
  const COIN = 5, GATE_PTS = 100;
  let cv, cx, root, S = 1, VH = 640;
  let game = null, raf = 0, sw = null;

  const unlocked = () => masteredCount() >= NEED;
  const wordPool = () => st.words.filter((w) => w.type !== '片語' && !/[ ()/]/.test(w.word) && w.word.length >= 3);
  const toPts = (sc) => Math.min(CAP, Math.floor(sc / S_PER_PT));
  const card = () => gameCard({ id: ID, need: NEED, icon: '🏃', name: 'Word Run' });
  const bestText = () => { const b = st.meta.games && st.meta.games[ID] && st.meta.games[ID].best; return b ? `Word Run ${b}` : ''; };
  const short = (w) => String(meaning(w) || '').split(/[；;,，]/)[0].trim();

  // ── 畫面 ──
  function mount() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'wj wr';
    root.innerHTML = `<canvas></canvas>
      <div class="wb-banner" id="wrBanner"></div>
      <div class="wr-gate" id="wrGate" style="display:none"></div>
      <div class="wj-hud"><button class="wj-x" data-wr="quit">✕</button>
        <span class="wr-coin" id="wrC">🪙 0</span>
        <span class="wj-t" id="wrT">3:00</span><span class="wj-h" id="wrS">0</span><span class="wj-p" id="wrP">⭐ 0</span></div>
      <div class="wj-pane" id="wrPane"></div>`;
    document.body.appendChild(root);
    cv = root.querySelector('canvas'); cx = cv.getContext('2d');
    root.addEventListener('click', onClick);
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', () => { sw = null; });
    addEventListener('resize', resize);
    addEventListener('keydown', onKey);
  }
  function resize() {
    if (!root) return;
    const w = root.clientWidth, h = root.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    S = (w * dpr) / LW; VH = (h * dpr) / S;
  }
  const pane = (html) => { const p = root.querySelector('#wrPane'); p.innerHTML = html; p.style.display = html ? '' : 'none'; };

  // ── 操作：滑動（左右換道、上跳、下滑）；輕點左半／右半也能換道；鍵盤方向鍵＋空白鍵 ──
  const playing = () => game && !game.spell && !game.over;
  function onDown(e) { if (!playing()) return; sw = { x: e.clientX, y: e.clientY, t: performance.now(), used: false }; }
  function onMove(e) {
    if (!sw || !playing()) return;
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y, th = 28;
    if (Math.abs(dx) > th && Math.abs(dx) > Math.abs(dy)) { act(dx > 0 ? 'r' : 'l'); sw.x = e.clientX; sw.y = e.clientY; sw.used = true; }
    else if (Math.abs(dy) > th && !sw.usedV) { act(dy < 0 ? 'u' : 'd'); sw.usedV = true; sw.used = true; sw.x = e.clientX; }
  }
  function onUp(e) {
    if (sw && !sw.used && playing() && performance.now() - sw.t < 350) {   // 輕點：左半往左、右半往右
      const r = root.getBoundingClientRect();
      act(e.clientX - r.left < r.width / 2 ? 'l' : 'r');
    }
    sw = null;
  }
  function onKey(e) {
    if (!playing() || !root.classList.contains('show')) return;
    const m = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ' ': 'u', ArrowDown: 'd' }[e.key];
    if (m) { act(m); e.preventDefault(); }
  }
  function act(m) {
    const p = game.p;
    if (m === 'l') p.lane = Math.max(0, p.lane - 1);
    if (m === 'r') p.lane = Math.min(2, p.lane + 1);
    if (m === 'u' && p.jump <= 0) { p.jump = JUMP_T; p.slide = 0; }
    if (m === 'd') { if (p.jump > 0) p.jump = Math.min(p.jump, 0.12); p.slide = SLIDE_T; }   // 空中往下滑＝快速落地再滑
  }

  // ── 開始畫面 ──
  function open() {
    if (!unlocked()) return toast(L(`精熟 ${NEED} 個單元後解鎖`, `Master ${NEED} units to unlock`));
    mount(); root.classList.add('show'); resize();
    document.body.style.overflow = 'hidden';
    const best = gameWeekBestAll(), pb = (st.meta.games && st.meta.games[ID] && st.meta.games[ID].best) || 0;
    pane(`<div class="wj-card">
      <div class="wj-ic">🏃</div>
      <h2>Word Run</h2>
      <p>${L('衝進叢林神殿，閃過障礙、跑進正確的單字門！', 'Run through the jungle temple and pick the right word gate!')}</p>
      <div class="wj-rules">
        <div>👈👉 ${L('左右滑（或點左右半邊）換跑道', 'Swipe (or tap) left / right to change lanes')}</div>
        <div>🪵 ${L('樹幹：往上滑跳過去', 'Log: swipe up to jump')}</div>
        <div>🌿 ${L('藤蔓：往下滑鑽過去', 'Vines: swipe down to slide')}</div>
        <div>🪨 ${L('大石頭：只能換跑道閃開', 'Boulder: change lanes')}</div>
        <div>🚪 ${L(`單字門：跑進正確意思的那條 +${GATE_PTS}、加速；錯了會減速`, `Word gate: run into the right meaning +${GATE_PTS}; wrong = slow down`)}</div>
        <div>🏃 ${L('跑 2 公尺 +1', '+1 every 2 m')}・🪙 ${L(`金幣 +${COIN}`, `Coins +${COIN}`)}・🔥 ${L('單字門連對 3 個以上，每門再 +50', '3+ gates in a row: +50 each')}</div>
        <div>✏️ ${L('撞到要拼對一個單字才能繼續（時間不會停）', 'Crash = spell a word (clock keeps running)')}</div>
        <div>⭐ ${L(`每 ${S_PER_PT} 分 1 顆星，最多 ${CAP}；所有遊戲每週只算最高一局`, `1 ⭐ per ${S_PER_PT} points, up to ${CAP}; best game of the week counts`)}</div>
      </div>
      <p class="wj-small">${L(`本週遊戲最佳 ${best} / ${CAP} ⭐・個人最高 ${pb} 分`, `Best this week ${best} / ${CAP} ⭐ · Personal best ${pb}`)}<br><span style="opacity:.5">v${VER}</span></p>
      <div class="btnrow"><button class="btn" data-wr="start">${L('開始 Start ▶', 'Start ▶')}</button><button class="btn ghost" data-wr="close">${L('離開', 'Exit')}</button></div>
    </div>`);
    game = null; showGate(); draw();
  }
  function close() {
    cancelAnimationFrame(raf); game = null;
    if (root) root.classList.remove('show');
    document.body.style.overflow = '';
    if (typeof renderQuiz === 'function' && $('v-quiz') && $('v-quiz').classList.contains('active')) renderQuiz();
  }

  // ── 遊戲 ──
  function start() {
    sw = null;
    game = {
      t0: Date.now(), last: performance.now(), clock: 0,
      p: { lane: 1, x: 1, jump: 0, slide: 0, inv: 1500, run: 0 },
      v: V0, dist: 0, genZ: 18, objs: [], deco: [], decoZ: 0, fx: [], slowT: 0, boostT: 0,
      nextGateAt: 9000, gate: null, gates: 0, gatesOk: 0, streak: 0,
      coins: 0, bonus: 0, hits: 0, used: new Set(), spell: null, over: false,
    };
    for (let z = 2; z < D; z += 5) addDeco(z);
    pane(''); showGate();
    loop();
  }
  const score = () => Math.floor(game.dist / 2) + game.coins * COIN + game.bonus;   // 跑 2 公尺 1 分：分數主要靠單字門
  function loop() {
    raf = requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min(0.05, (now - game.last) / 1000); game.last = now;
    const left = TIME - (Date.now() - game.t0) / 1000;
    if (left <= 0) return end();
    if (!game.spell) step(dt);
    hud(left); draw();
  }
  // 產生一排：障礙物（至少留一條能過的路）＋金幣
  function genRow(z) {
    const g = game, lv = Math.min(1, g.clock / 120000);
    const r = Math.random();
    const pick = () => { const q = Math.random(); return q < 0.4 ? 'rock' : q < 0.7 ? 'log' : 'vine'; };
    let lanes = [];
    if (g.clock > 25000 && r < 0.12 + lv * 0.08) {          // 整排樹幹或藤蔓：一定要跳／滑
      const t = Math.random() < 0.5 ? 'log' : 'vine';
      [0, 1, 2].forEach((l) => g.objs.push({ t, lane: l, z }));
      lanes = [0, 1, 2];
    } else {
      const n = Math.random() < 0.38 + lv * 0.3 ? 2 : 1;
      lanes = shuffle([0, 1, 2]).slice(0, n);
      lanes.forEach((l) => g.objs.push({ t: pick(), lane: l, z }));
    }
    const free = [0, 1, 2].filter((l) => !lanes.includes(l));
    if (Math.random() < 0.55) {                            // 金幣：在空的跑道排一串（整排障礙時放在空中，跳起來吃）
      const l = free.length ? free[Math.floor(Math.random() * free.length)] : Math.floor(Math.random() * 3);
      const high = !free.length && lanes.length === 3 && g.objs[g.objs.length - 1].t === 'log';
      for (let i = 0; i < 4; i++) g.objs.push({ t: 'coin', lane: l, z: z + (free.length ? 2 + i * 2.2 : -0.6 + i * 0.6), high: high || !free.length });
    }
  }
  function addDeco(z) {
    const side = Math.random() < 0.5 ? -1 : 1, k = Math.random();
    game.deco.push({ z, x: side * (1.75 + Math.random() * 1.3), t: k < 0.14 ? 'pillar' : k < 0.3 ? 'bush' : 'tree', h: 0.8 + Math.random() * 0.5 });
    if (Math.random() < 0.7) game.deco.push({ z: z + 2.5, x: -side * (1.8 + Math.random() * 1.2), t: Math.random() < 0.3 ? 'bush' : 'tree', h: 0.8 + Math.random() * 0.5 });
  }
  function makeGate(z) {
    const g = game, pool = st.words.filter((w) => w.zh || w.def);
    const fresh = pool.filter((w) => !g.used.has('g' + w.id));
    const w = shuffle(fresh.length ? fresh : pool)[0]; g.used.add('g' + w.id);
    let wrong = distract(w).filter((o) => short(o) !== short(w));
    const seen = new Set([short(w)]); wrong = wrong.filter((o) => { const s = short(o); if (seen.has(s)) return false; seen.add(s); return true; });
    const opts = shuffle([w, ...wrong.slice(0, 2)]);
    g.gate = { z, w, opts, ok: opts.indexOf(w), spoke: false };
    g.objs.push({ t: 'gate', lane: 1, z });
  }
  function step(dt) {
    const g = game, p = g.p, ms = dt * 1000;
    g.clock += ms;
    // 速度：慢慢變快；單字門靠近時限速，留時間讀題
    let v = Math.min(VMAX, V0 + g.clock / 1000 * 0.075);
    if (g.boostT > 0) { v += 4; g.boostT -= ms; }
    if (g.slowT > 0) { v *= 0.6; g.slowT -= ms; }
    if (g.gate && g.gate.z - g.dist > 0) v = Math.min(v, GATE_V);
    g.v = v;
    g.dist += v * dt;
    // 產生前方的東西
    while (g.genZ < g.dist + D) {
      if (!g.gate && g.clock >= g.nextGateAt && g.genZ > g.dist + D - 12) {
        makeGate(g.genZ + 6); g.genZ += 18; g.nextGateAt = g.clock + GATE_EVERY;   // 門前後都不放障礙
      } else {
        genRow(g.genZ);
        const lv = Math.min(1, g.clock / 120000);
        g.genZ += v * (1.15 - lv * 0.3) + Math.random() * v * 0.35;
      }
    }
    while (g.decoZ < g.dist + D) { addDeco(g.decoZ); g.decoZ += 4.5; }
    g.deco = g.deco.filter((o) => o.z - g.dist > -3);
    // 玩家
    p.x += (p.lane - p.x) * Math.min(1, dt * 14);
    if (p.jump > 0) p.jump = Math.max(0, p.jump - dt);
    if (p.slide > 0) p.slide = Math.max(0, p.slide - dt);
    if (p.inv > 0) p.inv -= ms;
    p.run += v * dt;
    if (g.gate && !g.gate.spoke && g.gate.z - g.dist < D - 4) { g.gate.spoke = true; speak(g.gate.w.word); }
    // 碰撞
    const inLane = (l) => Math.abs(p.x - l) < 0.45;
    const air = p.jump > 0.08 && p.jump < JUMP_T - 0.05;
    for (const o of g.objs) {
      const d = o.z - g.dist;
      if (o.t === 'coin') {
        if (!o.got && Math.abs(d) < 0.9 && inLane(o.lane) && (!o.high || air)) { o.got = true; g.coins++; sparkle(o.lane, '#ffd23f', 5); }
        continue;
      }
      if (o.done || d > 0.4) continue;
      o.done = true;
      if (o.t === 'gate') { passGate(); continue; }
      if (!inLane(o.lane) || p.inv > 0) continue;
      if (o.t === 'log' && air) { o.cleared = true; continue; }
      if (o.t === 'vine' && p.slide > 0) { o.cleared = true; continue; }
      return crash(o);
    }
    g.objs = g.objs.filter((o) => o.z - g.dist > -6);
    g.fx.forEach((f) => { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 600 * dt; f.a -= dt * 1.6; });
    g.fx = g.fx.filter((f) => f.a > 0);
  }
  function passGate() {
    const g = game, gt = g.gate; if (!gt) return;
    const lane = Math.round(g.p.x);
    g.gates++;
    if (lane === gt.ok) {
      g.gatesOk++; g.streak++;
      const b = GATE_PTS + (g.streak >= 3 ? 50 : 0);
      g.bonus += b; g.boostT = 3000;
      banner('✅', L(`答對！+${b}`, `Correct! +${b}`), `${gt.w.word} = ${short(gt.w)}${g.streak >= 3 ? L(`・連對 ${g.streak} 🔥`, ` · ${g.streak} in a row 🔥`) : ''}`, '#4ECDC4');
      sparkle(lane, '#CCFF00', 24);
    } else {
      g.streak = 0; g.slowT = 2500;
      banner('❌', L('跑錯門了，減速！', 'Wrong gate — slow down!'), `${gt.w.word} = ${short(gt.w)}`, '#ff6b57');
    }
    g.gate = null; showGate();
  }
  function sparkle(lane, c, n) {
    const x = LW / 2 + (lane - 1) * LANE, y = VH * 0.78;
    for (let i = 0; i < n; i++) game.fx.push({ x, y, vx: (Math.random() - 0.5) * 260, vy: -120 - Math.random() * 260, a: 1, c });
  }
  let bannerT = 0;
  function banner(ic, title, sub, c) {
    const el = $('wrBanner'); if (!el) return;
    el.style.setProperty('--c', c);
    el.innerHTML = `<span class="ic">${ic}</span><div><b>${esc(title)}</b><small>${esc(sub || '')}</small></div>`;
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    clearTimeout(bannerT); bannerT = setTimeout(() => el.classList.remove('on'), 1200);
  }
  // 單字門的題目：畫面上方固定顯示（三格對齊三條跑道），遠遠就能讀
  function showGate() {
    const el = $('wrGate'); if (!el) return;
    const gt = game && game.gate;
    if (!gt || game.spell) { el.style.display = 'none'; el.innerHTML = ''; el.dataset.k = ''; return; }
    const key = gt.w.id + ':' + Math.round(game.p.x);
    if (el.dataset.k === key) return;
    el.dataset.k = key;
    el.style.display = '';
    el.innerHTML = `<div class="wr-q">🚪 <b>${esc(gt.w.word)}</b><button class="spk small" data-say="${esc(gt.w.word)}">🔊</button></div>
      <div class="wr-opts">${gt.opts.map((o, i) => `<div class="${Math.round(game.p.x) === i ? 'on' : ''}">${esc(short(o))}</div>`).join('')}</div>`;
  }

  // ── 撞到 → 拼字 ──
  function crash(o) {
    const g = game; g.hits++;
    sparkle(o.lane, '#ff6b57', 18);
    sw = null;
    const pool = wordPool(), fresh = pool.filter((w) => !g.used.has(w.id));
    const w = shuffle(fresh.length ? fresh : pool)[0]; g.used.add(w.id);
    g.spell = { w, ans: answersOf(w)[0], shown: 1, tries: 0, what: o.t };
    showGate(); renderSpell(); speak(w.word);
  }
  function renderSpell(bad) {
    const s = game.spell, a = s.ans;
    const hint = a.split('').map((c, i) => (i < s.shown ? c : '_')).join(' ');
    const what = { rock: L('撞到大石頭了！', 'You hit a boulder!'), log: L('被樹幹絆倒了！', 'You tripped on a log!'), vine: L('被藤蔓纏住了！', 'Caught in the vines!') }[s.what] || '';
    pane(`<div class="wj-card wj-spell ${bad ? 'shake' : ''}">
      <div class="wj-kicker">${what} ${L('拼對才能繼續', 'Spell it to keep going')} ✏️</div>
      <div class="wj-mean" ${EN() ? 'style="font-size:17px"' : ''}>${esc(meaning(s.w))}</div>
      <div class="qmid"><span class="pos">${esc(s.w.pos)}</span><button class="spk small" data-say="${esc(s.w.word)}">🔊</button></div>
      <div class="hintw">${esc(hint)}</div>
      <input class="spellin" id="wrIn" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="type here">
      ${s.tries ? `<div class="wj-small" style="color:var(--coral)">${L(`拼錯 ${s.tries} 次，多給你一個字母`, `${s.tries} wrong — here's another letter`)}</div>` : ''}
      <button class="btn wide" style="margin-top:10px" data-wr="check">${L('確認 Check', 'Check')}</button>
    </div>`);
    const inp = $('wrIn'); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    setTimeout(() => inp.focus(), 50);
  }
  function check() {
    const s = game && game.spell; if (!s) return;
    const v = norm($('wrIn').value || '');
    if (!v) return $('wrIn').focus();
    if (answersOf(s.w).includes(v)) {
      const g = game; g.spell = null; pane('');
      g.objs = g.objs.filter((o) => o.t === 'gate' || o.t === 'coin' || o.z - g.dist > 16);   // 清掉前面的障礙
      g.p.inv = 2000; g.p.jump = 0; g.p.slide = 0; g.last = performance.now();
      showGate();
      banner('✓', L('答對！繼續跑', 'Correct! Run!'), '', '#CCFF00');
    } else {
      s.tries++; s.shown = Math.min(s.ans.length, s.shown + 1);
      renderSpell(true); speak(s.w.word);
    }
  }

  // ── 結束 ──
  function end() {
    cancelAnimationFrame(raf);
    if (game.over) return; game.over = true; game.spell = null; game.gate = null; showGate();
    const sc = score(), pts = toPts(sc), k = todayKey();
    const before = points().total, prev = gameWeekBestAll();
    clockCheck();
    const day = st.ledger.days[k] || (st.ledger.days[k] = { cards: 0 });
    day.gbest = day.gbest || {};
    if (pts > (day.gbest[ID] || 0)) day.gbest[ID] = pts;
    st.meta.games = st.meta.games || {};
    const gm = st.meta.games[ID] || (st.meta.games[ID] = { plays: 0, best: 0 });
    gm.plays++; const record = sc > gm.best; if (record) gm.best = sc;
    saveLedger(); saveMeta();
    const gain = Math.max(0, pts - prev);
    afterPoints(before);
    if (gain) setTimeout(() => confetti(gain >= 10 ? 90 : 50), 150);
    hud(0); draw();
    pane(`<div class="wj-card">
      <div class="wj-kicker">${L('時間到！', "Time's up!")}</div>
      <div class="wj-big">${sc}</div>
      <div class="wj-small">${record ? L('🆕 個人最高紀錄！', '🆕 New personal best!') : L(`個人最高 ${gm.best} 分`, `Personal best ${gm.best}`)}<br>
        ${L(`跑了 ${Math.floor(game.dist)} m・🪙 ${game.coins}・單字門 ${game.gatesOk}/${game.gates}・撞到 ${game.hits} 次`, `${Math.floor(game.dist)} m · 🪙 ${game.coins} · gates ${game.gatesOk}/${game.gates} · ${game.hits} crashes`)}</div>
      <div class="wj-pts">⭐ ${pts} / ${CAP}</div>
      ${gain ? `<div class="gain">+${gain} ⭐</div>`
        : `<div class="gain zero">${prev >= CAP ? L('本週遊戲已經拿滿 20 分，現在純粹好玩 🎮', 'You already got 20 this week — just for fun now 🎮')
          : L(`本週遊戲最佳是 ${prev} 分，超過才會再加分`, `Your best this week is ${prev} — beat it to earn more`)}</div>`}
      <div class="btnrow" style="margin-top:14px"><button class="btn" data-wr="start">${L('再玩一次', 'Play again')}</button><button class="btn ghost" data-wr="close">${L('離開', 'Exit')}</button></div>
    </div>`);
  }

  // ── 繪圖 ──
  function hud(left) {
    const s = Math.max(0, Math.ceil(left));
    $('wrT').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    $('wrT').classList.toggle('low', s <= 20);
    if (!game) return;
    const sc = score();
    $('wrS').textContent = sc; $('wrP').textContent = '⭐ ' + toPts(sc); $('wrC').textContent = '🪙 ' + game.coins;
    showGate();
  }
  // 透視：距離 d（公尺）→ 縮放 s、畫面 y
  const HOR = () => VH * 0.3, BASE = () => VH * 0.8;
  const sc_ = (d) => F / (F + Math.max(-F * 0.6, d));
  const py = (d) => HOR() + (BASE() - HOR()) * sc_(d);
  const px = (lane, d) => LW / 2 + (lane - 1) * LANE * sc_(d);
  function draw() {
    const W = cv.width, H = cv.height;
    cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.fillStyle = '#071209'; cx.fillRect(0, 0, W, H);
    cx.save(); cx.scale(S, S);
    const g = game, dist = g ? g.dist : 0, hor = HOR(), base = BASE();
    // 天空與遠方神殿
    let gr = cx.createLinearGradient(0, 0, 0, hor);
    gr.addColorStop(0, '#04100a'); gr.addColorStop(1, '#1f4a2a');
    cx.fillStyle = gr; cx.fillRect(0, 0, LW, hor + 2);
    cx.fillStyle = 'rgba(204,255,0,.12)'; cx.beginPath(); cx.arc(LW / 2, hor - 10, 60, 0, 7); cx.fill();
    cx.fillStyle = '#0d2414';
    cx.fillRect(LW / 2 - 55, hor - 22, 110, 22); cx.fillRect(LW / 2 - 40, hor - 40, 80, 18); cx.fillRect(LW / 2 - 26, hor - 58, 52, 18); cx.fillRect(LW / 2 - 12, hor - 74, 24, 16);
    // 兩側叢林地面
    gr = cx.createLinearGradient(0, hor, 0, VH);
    gr.addColorStop(0, '#163a1e'); gr.addColorStop(1, '#0f2a15');
    cx.fillStyle = gr; cx.fillRect(0, hor, LW, VH - hor);
    // 石頭步道（梯形）
    const roadW = (d) => LANE * 1.55 * sc_(d);
    cx.fillStyle = '#5c4a32';
    cx.beginPath(); cx.moveTo(LW / 2 - roadW(D), py(D)); cx.lineTo(LW / 2 + roadW(D), py(D)); cx.lineTo(LW / 2 + roadW(-3), py(-3)); cx.lineTo(LW / 2 - roadW(-3), py(-3)); cx.closePath(); cx.fill();
    // 石磚橫紋（跟著前進移動）
    cx.strokeStyle = 'rgba(0,0,0,.28)'; cx.lineWidth = 1.5;
    for (let k = 0; k < 30; k++) {
      const d = k * 2.4 - (dist % 2.4); if (d > D) break;
      const y = py(d), w = roadW(d);
      cx.beginPath(); cx.moveTo(LW / 2 - w, y); cx.lineTo(LW / 2 + w, y); cx.stroke();
    }
    // 跑道分隔線
    cx.strokeStyle = 'rgba(204,255,0,.22)'; cx.lineWidth = 2;
    [-0.5, 0.5].forEach((o) => { cx.beginPath(); cx.moveTo(LW / 2 + o * LANE * sc_(D), py(D)); cx.lineTo(LW / 2 + o * LANE * sc_(-3), py(-3)); cx.stroke(); });
    // 路邊
    cx.strokeStyle = '#3a2e1e'; cx.lineWidth = 4;
    [-1, 1].forEach((sd) => { cx.beginPath(); cx.moveTo(LW / 2 + sd * roadW(D), py(D)); cx.lineTo(LW / 2 + sd * roadW(-3), py(-3)); cx.stroke(); });
    // 遠的先畫：裝飾、障礙、金幣、門
    const list = [];
    if (g) {
      g.deco.forEach((o) => list.push({ d: o.z - dist, o, k: 'deco' }));
      g.objs.forEach((o) => { if (!o.got) list.push({ d: o.z - dist, o, k: o.t }); });
    }
    list.sort((a, b) => b.d - a.d);
    const playerD = 0;
    let playerDrawn = false;
    for (const it of list) {
      if (it.d > D || it.d < -4) continue;
      if (!playerDrawn && it.d < playerD - 0.3) { drawPlayer(); playerDrawn = true; }
      drawObj(it);
    }
    if (!playerDrawn) drawPlayer();
    if (g) g.fx.forEach((f) => { cx.globalAlpha = Math.max(0, f.a); cx.fillStyle = f.c; cx.fillRect(f.x - 2.5, f.y - 2.5, 5, 5); });
    cx.globalAlpha = 1;
    if (g && !g.spell && !g.over && g.clock < 4500) {
      cx.fillStyle = 'rgba(255,255,255,.85)'; cx.font = '700 15px "Noto Sans TC", sans-serif'; cx.textAlign = 'center';
      cx.fillText(L('👈👉 滑動換道・👆 上滑跳・👇 下滑鑽', '👈👉 swipe lanes · 👆 jump · 👇 slide'), LW / 2, VH * 0.42);
    }
    cx.restore();
  }
  function drawObj({ d, o, k }) {
    const s = sc_(d), y = py(d);
    if (k === 'deco') {
      const x = LW / 2 + o.x * LANE * s;
      if (o.t === 'tree') {
        cx.fillStyle = '#3b2a17'; cx.fillRect(x - 6 * s, y - 120 * s * o.h, 12 * s, 120 * s * o.h);
        cx.fillStyle = '#1e5a2a'; cx.beginPath(); cx.arc(x, y - 125 * s * o.h, 44 * s, 0, 7); cx.fill();
        cx.fillStyle = '#2a7a38'; cx.beginPath(); cx.arc(x - 18 * s, y - 140 * s * o.h, 28 * s, 0, 7); cx.arc(x + 20 * s, y - 132 * s * o.h, 26 * s, 0, 7); cx.fill();
      } else if (o.t === 'bush') {
        cx.fillStyle = '#1f6a2e'; cx.beginPath(); cx.arc(x - 14 * s, y - 14 * s, 20 * s, 0, 7); cx.arc(x + 12 * s, y - 16 * s, 22 * s, 0, 7); cx.fill();
      } else {   // 神殿石柱
        cx.fillStyle = '#6d6a5c'; cx.fillRect(x - 13 * s, y - 110 * s, 26 * s, 110 * s);
        cx.fillStyle = '#85826f'; cx.fillRect(x - 18 * s, y - 118 * s, 36 * s, 10 * s);
        cx.fillStyle = '#2a7a38'; cx.fillRect(x - 13 * s, y - 70 * s, 26 * s, 6 * s);
      }
      return;
    }
    const x = px(o.lane, d);
    if (k === 'rock') {
      cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(x, y, 40 * s, 9 * s, 0, 0, 7); cx.fill();
      cx.fillStyle = '#7a7a72'; cx.beginPath(); cx.moveTo(x - 40 * s, y); cx.quadraticCurveTo(x - 44 * s, y - 70 * s, x - 6 * s, y - 84 * s); cx.quadraticCurveTo(x + 40 * s, y - 80 * s, x + 40 * s, y); cx.closePath(); cx.fill();
      cx.fillStyle = '#9a9a90'; cx.beginPath(); cx.ellipse(x - 12 * s, y - 56 * s, 12 * s, 18 * s, -0.5, 0, 7); cx.fill();
      cx.fillStyle = '#2f7a3a'; cx.fillRect(x - 30 * s, y - 20 * s, 18 * s, 5 * s);
    } else if (k === 'log') {
      cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(x, y, 46 * s, 7 * s, 0, 0, 7); cx.fill();
      cx.fillStyle = '#7a4a22'; cx.fillRect(x - 46 * s, y - 24 * s, 92 * s, 22 * s);
      cx.fillStyle = '#9a6332'; cx.fillRect(x - 46 * s, y - 24 * s, 92 * s, 6 * s);
      cx.fillStyle = '#c99a5c'; cx.beginPath(); cx.ellipse(x + 46 * s, y - 13 * s, 6 * s, 11 * s, 0, 0, 7); cx.fill();
      cx.strokeStyle = '#7a4a22'; cx.lineWidth = 1.5 * s; cx.beginPath(); cx.ellipse(x + 46 * s, y - 13 * s, 3 * s, 6 * s, 0, 0, 7); cx.stroke();
    } else if (k === 'vine') {
      const top = y - 92 * s, low = y - 44 * s;
      cx.fillStyle = '#4a3420'; cx.fillRect(x - 50 * s, top, 100 * s, 9 * s);
      cx.strokeStyle = '#2f8a3e'; cx.lineWidth = 4 * s;
      for (let i = -4; i <= 4; i++) { cx.beginPath(); cx.moveTo(x + i * 11 * s, top + 8 * s); cx.quadraticCurveTo(x + i * 11 * s + 5 * s, (top + low) / 2, x + i * 11 * s, low + (i % 2) * 6 * s); cx.stroke(); }
      cx.fillStyle = '#3fae52';
      for (let i = -4; i <= 4; i += 2) { cx.beginPath(); cx.ellipse(x + i * 11 * s, low + 4 * s, 5 * s, 8 * s, 0.4, 0, 7); cx.fill(); }
    } else if (k === 'coin') {
      const bob = Math.sin((game ? game.clock : 0) / 150 + o.z) * 4 * s;
      const cy = y - (o.high ? 70 : 26) * s + bob, r = 11 * s;
      cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.arc(x, cy, r, 0, 7); cx.fill();
      cx.strokeStyle = '#c99a1a'; cx.lineWidth = 2 * s; cx.stroke();
      cx.fillStyle = '#fff6c8'; cx.beginPath(); cx.arc(x - r * 0.3, cy - r * 0.3, r * 0.3, 0, 7); cx.fill();
    } else if (k === 'gate') {
      const gt = game && game.gate;
      const w = LANE * 1.6 * s, top = y - 150 * s;
      cx.fillStyle = '#6d6a5c'; cx.fillRect(LW / 2 - w - 14 * s, top, 22 * s, 150 * s); cx.fillRect(LW / 2 + w - 8 * s, top, 22 * s, 150 * s);
      cx.fillStyle = '#85826f'; cx.fillRect(LW / 2 - w - 22 * s, top - 18 * s, 2 * w + 44 * s, 22 * s);
      cx.fillStyle = '#CCFF00'; cx.font = `800 ${Math.max(6, 16 * s)}px Syne, sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      if (gt) cx.fillText(gt.w.word, LW / 2, top - 7 * s);
      if (gt) gt.opts.forEach((op, i) => {
        const lx = px(i, d), bw = LANE * 0.9 * s, bh = 34 * s, by = top + 22 * s;
        cx.fillStyle = 'rgba(10,20,12,.85)'; cx.strokeStyle = '#4ECDC4'; cx.lineWidth = 2 * s;
        cx.fillRect(lx - bw / 2, by, bw, bh); cx.strokeRect(lx - bw / 2, by, bw, bh);
        cx.fillStyle = '#fff'; cx.font = `700 ${Math.max(5, 13 * s)}px "Noto Sans TC", sans-serif`;
        let t = short(op); if (t.length > 8) t = t.slice(0, 7) + '…';
        cx.fillText(t, lx, by + bh / 2);
        cx.strokeStyle = 'rgba(78,205,196,.5)'; cx.beginPath(); cx.moveTo(lx, by + bh); cx.lineTo(lx, y); cx.stroke();
      });
      cx.textBaseline = 'alphabetic';
    }
  }
  function drawPlayer() {
    const g = game; if (!g) return;
    const p = g.p;
    if (p.inv > 0 && Math.floor(p.inv / 110) % 2) return;     // 無敵時閃爍
    const x = LW / 2 + (p.x - 1) * LANE, base = BASE();
    const jh = p.jump > 0 ? Math.sin(Math.PI * (1 - p.jump / JUMP_T)) * 78 : 0;
    const sl = p.slide > 0;
    cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(x, base + 4, 24 - jh / 8, 6, 0, 0, 7); cx.fill();
    cx.save(); cx.translate(x, base - jh);
    if (sl) {   // 滑行：身體壓低往後仰
      cx.fillStyle = '#CCFF00'; cx.beginPath(); cx.ellipse(0, -14, 26, 12, 0, 0, 7); cx.fill();
      cx.font = '24px "Apple Color Emoji","Segoe UI Emoji",sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText(st.profile ? st.profile.avatar : '🦊', -14, -24);
    } else {
      const ph = Math.sin(p.run * 1.6) * (jh ? 0.2 : 1);
      cx.strokeStyle = '#1a3a1a'; cx.lineWidth = 6; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(-5, -20); cx.lineTo(-5 - ph * 9, -2); cx.moveTo(5, -20); cx.lineTo(5 + ph * 9, -2); cx.stroke();   // 腿
      cx.fillStyle = '#CCFF00'; cx.beginPath(); cx.roundRect ? cx.roundRect(-13, -48, 26, 30, 8) : cx.rect(-13, -48, 26, 30); cx.fill();   // 身體
      cx.strokeStyle = '#CCFF00'; cx.lineWidth = 5;
      cx.beginPath(); cx.moveTo(-12, -42); cx.lineTo(-18 + ph * 8, -26); cx.moveTo(12, -42); cx.lineTo(18 - ph * 8, -26); cx.stroke();   // 手
      cx.font = '28px "Apple Color Emoji","Segoe UI Emoji",sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText(st.profile ? st.profile.avatar : '🦊', 0, -62);
    }
    cx.restore(); cx.textBaseline = 'alphabetic';
  }

  function onClick(e) {
    const t = e.target.closest('[data-wr]'); if (!t) return;
    const a = t.dataset.wr;
    if (a === 'start') { if (typeof unlockAudio === 'function') unlockAudio(); start(); }
    if (a === 'close') close();
    if (a === 'check') check();
    if (a === 'quit') {
      if (game && !game.over && !confirm(L('離開這一局？這局不會計分。', "Quit this game? It won't be scored."))) return;
      close();
    }
  }
  const _t = { get game() { return game; }, check, crash, end, toPts, act, score: () => score(), get VH() { return VH; } };
  return { id: ID, need: NEED, card, bestText, open, close, _t };
})();
GAMES.push(WR);
