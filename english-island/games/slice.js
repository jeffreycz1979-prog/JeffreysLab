// ═══════════════════════════════════════════════════════
//  獎勵遊戲 #8：Word Slice（聽字切字母）— 原型 v0.1
//  規格：專案文件 claude/英文島-獎勵遊戲總覽.md「第 8 款」
//  解鎖：精熟 8 個單元（試玩：網址加 ?try=slice，不用解鎖、不計分）
//  規則：3 分鐘。念出一個單字、上方顯示空格；字母水果從下面拋上來，每顆標一個箭頭。
//        照箭頭方向劃過「下一個需要的字母」就填進空格，要照順序切（a→p→p→l→e）。
//        切到錯的字母扣 3 秒（不停下來）；方向不對水果會彈開，不算切到、不扣分；漏掉不罰。
//        同一格錯 2 次，空格會淡淡顯示答案。分數換算 0～20，所有遊戲共用每週最高一局。
//  依賴 index.html 的全域：st, $, esc, L, EN, meaning, speak, answersOf, shuffle, todayKey, clockCheck,
//        saveLedger, saveMeta, afterPoints, points, gameWeekBestAll, gameCard, masteredCount, GAMES, toast, confetti
// ═══════════════════════════════════════════════════════
const WSL = (() => {
  const ID = 'slice', NEED = 8, VER = '0.1';
  const UNIT = 'U8';                         // 題目單元（沒有這個單元就用全部單字）
  const TIME = 180, CAP = 20, S_PER_PT = 100;   // 先抓 2000 分滿 20 ⭐，等 Jeffrey 實玩再校準
  const PEN = 3;                             // 切錯字母扣幾秒
  const GRAV = 760, TOL = 40, R = 32;        // 重力（邏輯 px/s²）、方向容許角度、水果半徑
  const PTS_LETTER = 10, PTS_WORD = 20, PTS_PER_LEN = 10, PTS_PERFECT = 30;
  const DIRS = [{ k: 'u', a: -90 }, { k: 'd', a: 90 }, { k: 'l', a: 180 }, { k: 'r', a: 0 }];
  const FRUIT = [
    { c: '#FF5A5A', d: '#B8322F', f: '#FFE1DA' },   // 蘋果
    { c: '#FF9F3F', d: '#C26A1A', f: '#FFE6C2' },   // 橘子
    { c: '#5CD65C', d: '#2F8F2F', f: '#FF8A8A' },   // 西瓜
    { c: '#B48CFF', d: '#6E4FB8', f: '#EDE1FF' },   // 葡萄
    { c: '#FFD23F', d: '#B8901F', f: '#FFF6C8' },   // 檸檬
    { c: '#FF9AC1', d: '#C25C85', f: '#FFE3EE' },   // 水蜜桃
  ];
  // 容易混淆的字母（和轉珠拼字方塊同一套）
  const CONFUSE = { a: 'eo', e: 'ai', i: 'le', o: 'ua', u: 'on', b: 'dp', d: 'bp', p: 'bq', q: 'pg', l: 'it', n: 'mh', m: 'nw', r: 'n', s: 'z', c: 'k', k: 'c', g: 'q', h: 'n', t: 'f', f: 't', v: 'w', w: 'v', y: 'v', j: 'i', z: 's', x: 'k' };
  let cv, cx, root, S = 1, VH = 640;
  let game = null, raf = 0, trial = false, stroke = null;

  const unlocked = () => masteredCount() >= NEED;
  const ansOf = (w) => String(answersOf(w)[0] || w.word).toLowerCase();
  const okWord = (w) => w.type !== '片語' && /^[a-z]+$/.test(ansOf(w)) && ansOf(w).length >= 3 && ansOf(w).length <= 9;
  const unitWords = () => { const u = st.words.filter((w) => w.unit === UNIT && okWord(w)); return u.length >= 6 ? u : st.words.filter(okWord); };
  const wordPool = () => unitWords();
  const toPts = (sc) => Math.min(CAP, Math.floor(sc / S_PER_PT));
  const card = () => gameCard({ id: ID, need: NEED, icon: '🍉', name: 'Word Slice' });
  const bestText = () => { const b = st.meta.games && st.meta.games[ID] && st.meta.games[ID].best; return b ? `Word Slice ${b}` : ''; };
  const short = (w) => String(meaning(w) || '').split(/[；;,，]/)[0].trim();
  const now = () => performance.now();
  const rnd = (n) => Math.floor(Math.random() * n);

  // ═════ 音效（Web Audio 即時合成）═════
  let ac = null, master = null, noiseBuf = null;
  const sndOn = () => !(st.set && st.set.sliceMute);
  function audio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination); } catch (e) { return null; } }
    if (ac.state === 'closed') { ac = null; return audio(); }
    if (ac.state !== 'running') ac.resume().catch(() => {});
    return ac;
  }
  function noise() {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function tone(f, dur, { type = 'sine', vol = 0.3, at = 0, slide = 0 } = {}) {
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function swish(f0, f1, vol, dur) {   // 刀子劃過：濾過的雜訊，頻率滑動
    const t = ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise(); f.type = 'bandpass'; f.Q.value = 2; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02);
  }
  const SFX = {
    slice(i) { swish(1800, 5200, 0.5, 0.14); tone(520 * Math.pow(2, Math.min(i, 12) / 12), 0.12, { vol: 0.16, type: 'triangle', slide: 1.4 }); },
    wrong() { swish(1500, 3000, 0.3, 0.1); tone(196, 0.28, { vol: 0.16, type: 'sawtooth', slide: 0.7 }); },
    bonk() { tone(260, 0.08, { vol: 0.14, type: 'square', slide: 0.6 }); },
    word() { [0, 4, 7, 12, 16].forEach((n, i) => tone(523 * Math.pow(2, n / 12), 0.16, { vol: 0.16, at: i * 0.07, type: 'triangle' })); },
  };
  function sfx(name, ...a) { if (!sndOn() || !audio()) return; try { SFX[name](...a); } catch (e) {} }

  // ═════ 純邏輯 ═════
  // 箭頭方向判定：劃的方向和箭頭差 TOL 度以內都算（小朋友劃不直很正常）
  const angDiff = (a, b) => { let d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
  const dirOk = (vx, vy, dir) => angDiff(Math.atan2(vy, vx) * 180 / Math.PI, dir.a) <= TOL;
  // 線段和圓有沒有交到
  function segHit(x0, y0, x1, y1, cx0, cy0, r) {
    const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy;
    const t = l2 ? Math.max(0, Math.min(1, ((cx0 - x0) * dx + (cy0 - y0) * dy) / l2)) : 0;
    const px = x0 + dx * t - cx0, py = y0 + dy * t - cy0;
    return px * px + py * py <= r * r;
  }
  // 下一顆水果的字母：每 2～3 顆保證出現一次「下一個需要的字母」；其他是容易混淆的字母或單字裡的其他字母
  function pickLetter(g) {
    const need = g.ans[g.pos];
    g.since++;
    if (g.since >= g.every) { g.since = 0; g.every = 2 + rnd(2); return need; }
    const r = Math.random(), conf = (CONFUSE[need] || '').split('').filter((x) => x !== need);
    const others = [...new Set(g.ans.split(''))].filter((x) => x !== need);
    let ch;
    if (r < 0.5 && conf.length) ch = conf[rnd(conf.length)];
    else if (r < 0.8 && others.length) ch = others[rnd(others.length)];
    else { do { ch = 'abcdefghijklmnopqrstuvwxyz'[rnd(26)]; } while (ch === need); }
    return ch;
  }

  // ═════ 畫面 ═════
  function mount() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'wj ws';
    root.innerHTML = `<canvas></canvas>
      <div class="ws-top" id="wsTop"></div>
      <div class="wj-hud"><button class="wj-x" data-ws="quit">✕</button>
        <span class="ws-snd" id="wsSnd" data-ws="snd">🔊</span>
        <span class="wj-t" id="wsT">3:00</span><span class="wj-h" id="wsS">0</span><span class="wj-p" id="wsP">⭐ 0</span></div>
      <div class="wj-pane" id="wsPane"></div>`;
    document.body.appendChild(root);
    if (!document.getElementById('woFont')) {   // 字母用 Andika：l／i／b／d 好分辨（和轉珠共用）
      const f = document.createElement('link'); f.id = 'woFont'; f.rel = 'stylesheet';
      f.href = 'https://fonts.googleapis.com/css2?family=Andika:wght@700&display=swap'; document.head.appendChild(f);
    }
    if (!document.getElementById('wsCss')) {
      const s = document.createElement('style'); s.id = 'wsCss';
      s.textContent = `.ws .wj-hud span{white-space:nowrap;font-size:14px;padding:4px 9px}
        .ws .wj-hud .ws-snd{pointer-events:auto;cursor:pointer}
        .ws-top{position:absolute;left:10px;right:10px;top:calc(env(safe-area-inset-top,0px) + 54px);z-index:2;text-align:center;pointer-events:none}
        .ws-slots{display:flex;justify-content:center;gap:5px;flex-wrap:wrap;margin-top:4px}
        .ws-slot{width:30px;height:42px;border-bottom:3px solid #4a5068;font:700 30px/40px Andika,'Comic Sans MS',system-ui,sans-serif;color:#CCFF00}
        .ws-slot.now{border-color:#CCFF00;animation:wsBlink 1s ease-in-out infinite}
        .ws-slot.ghost{color:rgba(204,255,0,.35)}
        .ws-top.done .ws-slot{color:#0a0a14;background:#CCFF00;border-radius:8px;border-color:transparent;animation:wsPop .4s}
        @keyframes wsBlink{50%{border-color:#4a5068}}
        @keyframes wsPop{40%{transform:scale(1.2)}}
        .ws-mean{display:inline-flex;align-items:center;gap:8px;margin-top:8px;font-size:15px;color:#c6d1c6;background:rgba(0,0,0,.35);border-radius:12px;padding:4px 6px 4px 12px}
        .ws-mean button{pointer-events:auto;border:none;background:#4ECDC4;color:#0a1a1a;border-radius:10px;width:36px;height:32px;font-size:16px}
        .ws-demo{display:flex;justify-content:center;gap:14px;margin:6px 0 2px}
        .ws-demo div{width:58px;height:58px;border-radius:50%;background:#FF5A5A;position:relative;display:grid;place-items:center;font:700 30px Andika,system-ui,sans-serif;color:#fff;text-shadow:0 2px 0 #0006}
        .ws-demo div i{position:absolute;right:-6px;top:-6px;width:26px;height:26px;border-radius:50%;background:#FFE14D;color:#1a1a1a;font:900 16px/26px system-ui;font-style:normal;text-shadow:none}`;
      document.head.appendChild(s);
    }
    cv = root.querySelector('canvas'); cx = cv.getContext('2d');
    root.addEventListener('click', onClick);
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => cv.addEventListener(ev, onUp));
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => { if (game) game.last = now(); });
  }
  function resize() {
    if (!root) return;
    const w = root.clientWidth, h = root.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    S = (w * dpr) / 360; VH = (h * dpr) / S;
  }
  const pane = (html) => { const p = root.querySelector('#wsPane'); p.innerHTML = html; p.style.display = html ? '' : 'none'; };
  const toLogic = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 360, y: (e.clientY - r.top) / r.height * VH }; };

  // ── 劃刀 ──
  function onDown(e) {
    if (sndOn()) audio();
    if (!game || game.over) return;
    e.preventDefault();
    const p = toLogic(e);
    stroke = { pts: [{ x: p.x, y: p.y, t: now() }], hit: new Set() };
    game.trail = [{ x: p.x, y: p.y, t: now() }];
    cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
  }
  function onMove(e) {
    if (!stroke || !game || game.over) return;
    const evs = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
    evs.forEach((ev) => {
      const p = toLogic(ev), t = now(), a = stroke.pts[stroke.pts.length - 1];
      stroke.pts.push({ x: p.x, y: p.y, t }); game.trail.push({ x: p.x, y: p.y, t });
      if (stroke.pts.length > 40) stroke.pts.shift();
      checkHits(a, { x: p.x, y: p.y, t });
    });
  }
  function onUp() { stroke = null; }
  function checkHits(a, b) {
    const g = game;
    g.fruits.forEach((f) => {
      if (f.dead || f.old || stroke.hit.has(f.id) || now() < f.noHit) return;
      if (!segHit(a.x, a.y, b.x, b.y, f.x, f.y, f.r + 4)) return;
      stroke.hit.add(f.id);
      // 方向：用最近約 0.14 秒劃過的整段（太短就用這一小段）
      const t0 = b.t - 140, p0 = stroke.pts.find((p) => p.t >= t0) || a;
      let vx = b.x - p0.x, vy = b.y - p0.y;
      if (Math.hypot(vx, vy) < 14) { vx = b.x - a.x; vy = b.y - a.y; }
      if (dirOk(vx, vy, f.dir)) cut(f, vx, vy); else bounce(f, vx, vy);
    });
  }
  function bounce(f, vx, vy) {   // 方向不對：彈開，不算切到、不扣分
    const l = Math.hypot(vx, vy) || 1;
    f.vx += vx / l * 140; f.vy += vy / l * 140 - 80; f.noHit = now() + 350; f.flash = now();
    sfx('bonk');
  }
  function cut(f, vx, vy) {
    const g = game, need = g.ans[g.pos], ok = f.ch === need;
    f.dead = true;
    const l = Math.hypot(vx, vy) || 1, nx = -vy / l, ny = vx / l, ang = Math.atan2(vy, vx);
    [-1, 1].forEach((s) => g.halves.push({ x: f.x + nx * s * 6, y: f.y + ny * s * 6, vx: f.vx * 0.5 + nx * s * 90, vy: Math.min(f.vy, 0) * 0.3 + ny * s * 90 - 60, ang, spin: s * (2 + Math.random() * 2), side: s, k: f.k, ch: f.ch, t: now(), bad: !ok }));
    for (let i = 0; i < 12; i++) { const a2 = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 180; g.parts.push({ x: f.x, y: f.y, vx: Math.cos(a2) * sp, vy: Math.sin(a2) * sp - 60, t: now(), c: ok ? FRUIT[f.k].c : '#FF5A5A' }); }
    if (ok) {
      g.pos++; g.letters++; g.score += PTS_LETTER; g.wrongHere = 0;
      g.fx.push({ x: f.x, y: f.y - 20, txt: `+${PTS_LETTER}`, col: '#CCFF00', t: now() });
      sfx('slice', g.pos);
      if (g.pos >= g.ans.length) return wordDone();
    } else {
      g.left = Math.max(0, g.left - PEN); g.wrongs++; g.wrongHere++; g.wordWrong++;
      g.fx.push({ x: f.x, y: f.y - 20, txt: `✕ -${PEN}s`, col: '#FF6B57', t: now(), big: true });
      sfx('wrong');
    }
    showTop();
  }
  function wordDone() {
    const g = game, perfect = !g.wordWrong;
    const gain = PTS_WORD + PTS_PER_LEN * g.ans.length + (perfect ? PTS_PERFECT : 0);
    g.score += gain; g.words++; if (perfect) g.perfect++;
    g.fx.push({ x: 180, y: VH * 0.42, txt: perfect ? `Perfect! +${gain}` : `+${gain}`, col: perfect ? '#FFD23F' : '#CCFF00', t: now(), big: true });
    g.fruits.forEach((f) => { f.old = true; });   // 畫面上剩下的水果變淡、切不到，掉下去就好
    g.pause = 1.2; g.spawnT = 0.2;
    sfx('word'); speak(g.ans);
    showTop(true);
  }
  function nextWord() {
    const g = game;
    if (g.wi >= g.deck.length) { g.deck = shuffle(wordPool()); g.wi = 0; }
    g.w = g.deck[g.wi++]; g.ans = ansOf(g.w); g.pos = 0; g.wrongHere = 0; g.wordWrong = 0; g.since = 1; g.every = 2;
    showTop(); setTimeout(() => { if (game === g && !g.over) speak(g.ans); }, 150);
  }
  function showTop(done) {
    const g = game; if (!g) return;
    const slots = g.ans.split('').map((ch, i) => {
      const filled = done || i < g.pos, now2 = !done && i === g.pos, ghost = now2 && g.wrongHere >= 2;   // 同一格錯 2 次：淡淡顯示答案
      return `<span class="ws-slot ${now2 ? 'now' : ''} ${ghost ? 'ghost' : ''}">${filled || ghost ? esc(ch) : ''}</span>`;
    }).join('');
    $('wsTop').className = 'ws-top' + (done ? ' done' : '');
    $('wsTop').innerHTML = `<div class="ws-slots">${slots}</div><div class="ws-mean">${esc(short(g.w))}<button data-ws="say">🔊</button></div>`;
  }
  function spawn() {
    const g = game, ch = pickLetter(g);
    const x0 = 50 + Math.random() * 260, y0 = VH + R + 4, apex = VH * (0.36 + Math.random() * 0.2);
    const vy = -Math.sqrt(2 * GRAV * (y0 - apex)), T = 2 * -vy / GRAV, tx = 50 + Math.random() * 260;
    g.fruits.push({ id: ++g.id, x: x0, y: y0, vx: (tx - x0) / T * 0.6, vy, r: R, ch, dir: DIRS[rnd(4)], k: rnd(FRUIT.length), noHit: 0, flash: 0 });
  }

  // ── 開始畫面 ──
  function open(opts) {
    trial = !!(opts && opts.trial);
    if (!trial && !unlocked()) return toast(L(`精熟 ${NEED} 個單元後解鎖`, `Master ${NEED} units to unlock`));
    if (wordPool().length < 4) return toast(L('單字太少，還不能玩', 'Not enough words yet'));
    mount(); root.classList.add('show'); resize();
    $('wsSnd').textContent = sndOn() ? '🔊' : '🔇';
    document.body.style.overflow = 'hidden';
    const best = gameWeekBestAll(), pb = (st.meta.games && st.meta.games[ID] && st.meta.games[ID].best) || 0;
    $('wsTop').innerHTML = '';
    pane(`<div class="wj-card">
      <div class="wj-ic">🍉</div>
      <h2>Word Slice</h2>
      <p>${L('聽單字，照順序切出每一個字母！', 'Listen, then slice the letters in order!')}</p>
      <div class="ws-demo"><div>a<i>→</i></div><div style="background:#5CD65C">p<i>↑</i></div></div>
      <div class="wj-rules">
        <div>👂 ${L('先聽單字（可以按 🔊 再聽一次），上面會出現空格', 'Listen to the word (tap 🔊 to hear it again)')}</div>
        <div>🔪 ${L('字母水果飛上來時，<b>照黃色箭頭的方向</b>劃過它，就能切開', 'Swipe through a fruit <b>in the direction of its yellow arrow</b>')}</div>
        <div>🔤 ${L('要照順序切：apple 就是 a → p → p → l → e', 'Slice in order: a → p → p → l → e')}</div>
        <div>❌ ${L(`切到錯的字母扣 ${PEN} 秒；方向不對水果會彈開，不扣分；漏掉沒關係，很快會再飛上來`, `Wrong letter = −${PEN}s; wrong direction just bounces; missed letters come back soon`)}</div>
        <div>💡 ${L('同一個字母錯 2 次，空格會偷偷告訴你答案', 'Miss the same letter twice and you get a hint')}</div>
        <div>⭐ ${trial ? L('試玩模式：不計分', 'Trial: not scored') : L(`每 ${S_PER_PT} 分 1 顆星，最多 ${CAP}；所有遊戲每週只算最高一局`, `1 ⭐ per ${S_PER_PT} points, up to ${CAP}; best game of the week counts`)}</div>
      </div>
      <p class="wj-small">${trial ? L('🧪 試玩版', '🧪 Trial') : L(`本週遊戲最佳 ${best} / ${CAP} ⭐・個人最高 ${pb} 分`, `Best this week ${best} / ${CAP} ⭐ · Personal best ${pb}`)}<br><span style="opacity:.5">v${VER}</span></p>
      <div class="btnrow"><button class="btn" data-ws="start">${L('開始 Start ▶', 'Start ▶')}</button><button class="btn ghost" data-ws="close">${L('離開', 'Exit')}</button></div>
    </div>`);
    game = null; drawBg();
  }
  function close() {
    cancelAnimationFrame(raf); game = null; stroke = null;
    if (root) root.classList.remove('show');
    document.body.style.overflow = '';
  }
  function start() {
    pane('');
    cancelAnimationFrame(raf);
    game = { left: TIME, score: 0, words: 0, letters: 0, wrongs: 0, perfect: 0, fruits: [], halves: [], parts: [], fx: [], trail: [],
      spawnT: 0.8, since: 1, every: 2, pause: 0, id: 0, deck: shuffle(wordPool()), wi: 0, last: now(), over: false };
    nextWord(); hud();
    raf = requestAnimationFrame(loop);
  }

  // ── 主迴圈 ──
  function loop() {
    raf = requestAnimationFrame(loop);
    const g = game; if (!g || g.over) return;
    const t = now(), dt = Math.min(0.05, (t - g.last) / 1000); g.last = t;
    if (document.hidden) return;
    g.left -= dt;
    if (g.left <= 0) { g.left = 0; hud(); return end(); }
    if (g.pause > 0) { g.pause -= dt; if (g.pause <= 0) nextWord(); }
    else {
      g.spawnT -= dt;
      if (g.spawnT <= 0) { spawn(); g.spawnT = Math.max(0.66, 0.95 - (TIME - g.left) * 0.0016); }
    }
    g.fruits.forEach((f) => { f.vy += GRAV * dt; f.x += f.vx * dt; f.y += f.vy * dt; if (f.x < f.r) { f.x = f.r; f.vx = Math.abs(f.vx); } if (f.x > 360 - f.r) { f.x = 360 - f.r; f.vx = -Math.abs(f.vx); } });
    g.fruits = g.fruits.filter((f) => !f.dead && !(f.vy > 0 && f.y > VH + f.r + 10));
    g.halves.forEach((h) => { h.vy += GRAV * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.ang += h.spin * dt; });
    g.halves = g.halves.filter((h) => h.y < VH + 60);
    g.parts.forEach((p) => { p.vy += GRAV * 0.6 * dt; p.x += p.vx * dt; p.y += p.vy * dt; });
    g.parts = g.parts.filter((p) => t - p.t < 700);
    g.trail = g.trail.filter((p) => t - p.t < 160);
    hud(); draw();
  }
  function hud() {
    const g = game; if (!g) return;
    const s = Math.ceil(g.left), el = $('wsT');
    el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; el.classList.toggle('low', g.left <= 20);
    $('wsS').textContent = g.score; $('wsP').textContent = `⭐ ${toPts(g.score)}`;
  }
  function drawBg() {
    if (!cx) return;
    cx.setTransform(S, 0, 0, S, 0, 0);
    const gr = cx.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, '#16233a'); gr.addColorStop(1, '#2a1a12');
    cx.fillStyle = gr; cx.fillRect(0, 0, 360, VH);
    cx.strokeStyle = 'rgba(255,255,255,.04)'; cx.lineWidth = 2;   // 木頭砧板紋路
    for (let y = VH * 0.55; y < VH; y += 26) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(360, y + 6); cx.stroke(); }
  }
  function arrow(x, y, a, s) {   // 黃色箭頭小圓章
    cx.save(); cx.translate(x, y);
    cx.fillStyle = '#FFE14D'; cx.strokeStyle = 'rgba(0,0,0,.55)'; cx.lineWidth = 2;
    cx.beginPath(); cx.arc(0, 0, s, 0, Math.PI * 2); cx.fill(); cx.stroke();
    cx.rotate(a * Math.PI / 180); cx.fillStyle = '#1a1a1a';
    cx.beginPath(); cx.moveTo(s * 0.62, 0); cx.lineTo(s * 0.05, -s * 0.5); cx.lineTo(s * 0.05, -s * 0.18); cx.lineTo(-s * 0.6, -s * 0.18);
    cx.lineTo(-s * 0.6, s * 0.18); cx.lineTo(s * 0.05, s * 0.18); cx.lineTo(s * 0.05, s * 0.5); cx.closePath(); cx.fill();
    cx.restore();
  }
  function fruitBody(F, r) {
    cx.fillStyle = F.c; cx.strokeStyle = F.d; cx.lineWidth = 3;
    cx.beginPath(); cx.arc(0, 0, r, 0, Math.PI * 2); cx.fill(); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.35)'; cx.beginPath(); cx.ellipse(-r * 0.38, -r * 0.42, r * 0.28, r * 0.16, -0.6, 0, Math.PI * 2); cx.fill();
  }
  function draw() {
    const g = game, t = now();
    drawBg();
    // 水果
    g.fruits.forEach((f) => {
      const F = FRUIT[f.k];
      cx.save(); cx.translate(f.x, f.y); cx.globalAlpha = f.old ? 0.3 : 1;
      if (t - f.flash < 300) cx.translate(Math.sin((t - f.flash) / 20) * 4, 0);   // 彈開時抖一下
      fruitBody(F, f.r);
      cx.fillStyle = '#3F8F43'; cx.beginPath(); cx.ellipse(6, -f.r - 2, 9, 4, -0.5, 0, Math.PI * 2); cx.fill();   // 葉子
      cx.font = `700 ${f.r * 1.15}px Andika, 'Comic Sans MS', system-ui, sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.lineWidth = 5; cx.lineJoin = 'round'; cx.strokeStyle = 'rgba(0,0,0,.55)'; cx.strokeText(f.ch, 0, 2); cx.fillStyle = '#fff'; cx.fillText(f.ch, 0, 2);
      cx.restore();
      if (!f.old) arrow(f.x + f.r * 0.78, f.y - f.r * 0.78, f.dir.a, t - f.flash < 300 ? 16 : 13);
      cx.globalAlpha = 1;
    });
    // 切開的兩半
    g.halves.forEach((h) => {
      const F = FRUIT[h.k];
      cx.save(); cx.translate(h.x, h.y); cx.rotate(h.ang);
      cx.globalAlpha = Math.max(0, 1 - (t - h.t) / 1100);
      cx.beginPath(); cx.arc(0, 0, R, h.side > 0 ? 0 : Math.PI, h.side > 0 ? Math.PI : Math.PI * 2); cx.closePath();
      cx.fillStyle = h.bad ? '#7a2a2a' : F.c; cx.fill(); cx.strokeStyle = F.d; cx.lineWidth = 3; cx.stroke();
      cx.fillStyle = h.bad ? '#FF8A7A' : F.f; cx.beginPath(); cx.ellipse(0, 0, R - 4, 5, 0, h.side > 0 ? 0 : Math.PI, h.side > 0 ? Math.PI : Math.PI * 2); cx.fill();
      cx.restore();
    });
    cx.globalAlpha = 1;
    // 果汁
    g.parts.forEach((p) => { cx.globalAlpha = Math.max(0, 1 - (t - p.t) / 700); cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, 3.2, 0, Math.PI * 2); cx.fill(); });
    cx.globalAlpha = 1;
    // 刀光
    const tr = g.trail;
    for (let i = 1; i < tr.length; i++) {
      const k = 1 - (t - tr[i].t) / 160;
      cx.strokeStyle = `rgba(255,255,255,${0.85 * k})`; cx.lineWidth = 2 + 7 * k; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(tr[i - 1].x, tr[i - 1].y); cx.lineTo(tr[i].x, tr[i].y); cx.stroke();
    }
    // 文字特效
    g.fx = g.fx.filter((f) => t - f.t < 900);
    g.fx.forEach((f) => {
      const k = (t - f.t) / 900;
      cx.globalAlpha = 1 - k; cx.font = `800 ${f.big ? 24 : 18}px Syne, system-ui, sans-serif`; cx.textAlign = 'center';
      cx.lineWidth = 4; cx.strokeStyle = 'rgba(0,0,0,.6)'; cx.strokeText(f.txt, f.x, f.y - k * 34); cx.fillStyle = f.col; cx.fillText(f.txt, f.x, f.y - k * 34);
    });
    cx.globalAlpha = 1;
  }

  // ── 結束 ──
  function end() {
    const g = game; if (!g || g.over) return;
    g.over = true; stroke = null; cancelAnimationFrame(raf);
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
      gm.words = Math.max(gm.words || 0, g.words);
      saveLedger(); saveMeta();
      gain = Math.max(0, pts - prev);
      afterPoints(before);
      if (gain) setTimeout(() => confetti(gain >= 10 ? 90 : 50), 150);
    }
    hud(); draw(); $('wsTop').innerHTML = '';
    pane(`<div class="wj-card">
      <div class="wj-kicker">${L('時間到！', "Time's up!")}</div>
      <div class="wj-big">${sc}</div>
      <div class="wj-small">${trial ? L('🧪 試玩模式，不計分', '🧪 Trial — not scored') : record ? L('🆕 個人最高紀錄！', '🆕 New personal best!') : L(`個人最高 ${best} 分`, `Personal best ${best}`)}<br>
        ${L(`拼完 ${g.words} 個字（全對 ${g.perfect} 個）・切對 ${g.letters} 個字母・切錯 ${g.wrongs} 次`, `${g.words} words (${g.perfect} perfect) · ${g.letters} letters · ${g.wrongs} wrong`)}</div>
      <div class="wj-pts">⭐ ${pts} / ${CAP}</div>
      ${trial ? '' : gain ? `<div class="gain">+${gain} ⭐</div>`
        : `<div class="gain zero">${prev >= CAP ? L('本週遊戲已經拿滿 20 分，現在純粹挑戰紀錄 🎮', 'You already got 20 this week — playing for records now 🎮')
          : L(`本週遊戲最佳是 ${prev} 分，超過才會再加分`, `Your best this week is ${prev} — beat it to earn more`)}</div>`}
      <div class="btnrow" style="margin-top:14px"><button class="btn" data-ws="start">${L('再玩一次', 'Play again')}</button><button class="btn ghost" data-ws="close">${L('離開', 'Exit')}</button></div>
    </div>`);
  }

  function onClick(e) {
    const t = e.target.closest('[data-ws]'); if (!t) return;
    const a = t.dataset.ws;
    if (a === 'snd') { st.set.sliceMute = sndOn(); if (typeof saveSet === 'function') saveSet(); $('wsSnd').textContent = sndOn() ? '🔊' : '🔇'; return; }
    if (a === 'start') { audio(); if (typeof unlockAudio === 'function') unlockAudio(); start(); }
    if (a === 'close') close();
    if (a === 'say' && game) speak(game.ans);
    if (a === 'quit') {
      if (game && !game.over && !trial && !confirm(L('離開這一局？這局不會計分。', "Quit this game? It won't be scored."))) return;
      close();
    }
  }
  // 測試用
  const _t = { get game() { return game; }, spawn, pickLetter, dirOk, segHit, end, toPts, wordDone, get VH() { return VH; }, get S() { return S; } };
  return { id: ID, need: NEED, card, bestText, open, close, _t };
})();
GAMES.push(WSL);
