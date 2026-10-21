// ═══════════════════════════════════════════════════════
//  THP11 獎勵遊戲 #2：Word Blaster（太空射擊）
//  解鎖：精熟 2 個單元
//  規則：3 分鐘；飛機可在畫面下半部自由移動、自動射擊；被打中要拼字（題目出自所有已開放單元），
//        拼錯就多提示一個字母，拼對才繼續，時間不暫停；道具：⚡ 快速射擊、🔱 散彈、⏳ 慢動作。
//        分數換算 0～20，所有遊戲共用每週最高一局。
//  依賴 index.html 的全域：st, $, esc, L, EN, meaning, speak, answersOf, norm, shuffle, todayKey, clockCheck,
//        saveLedger, saveMeta, saveSet, afterPoints, points, gameWeekBestAll, gameCard, masteredCount, GAMES, toast, confetti
// ═══════════════════════════════════════════════════════
const WB = (() => {
  const ID = 'blaster', NEED = 2, VER = '1.0';
  const TIME = 180, CAP = 20;
  const S_PER_PT = 200;      // 每 200 分 = 1 ⭐（4000 分滿 20）；機器人（瞬間拼字）3 分鐘約 5400～6100，真人含拼字時間預估 1300～4300
  const LW = 360;
  const PW_TIME = { rapid: 9000, spread: 9000, slow: 6000 };
  const PW_INFO = {
    rapid: { ic: '⚡', c: '#CCFF00', zh: '快速射擊', en: 'Rapid fire' },
    spread: { ic: '🔱', c: '#4ECDC4', zh: '散彈', en: 'Spread shot' },
    slow: { ic: '⏳', c: '#ffb547', zh: '慢動作', en: 'Slow motion' },
  };
  let cv, cx, root, S = 1, VH = 640;
  let game = null, raf = 0, keys = { l: 0, r: 0, u: 0, d: 0 };
  let finger = null, tiltG = null, tiltSeen = 0;
  addEventListener('deviceorientation', (e) => { if (e.gamma != null) { tiltG = e.gamma; tiltSeen = Date.now(); } });
  const ctl = () => st.set.blasterCtl || 'drag';   // drag＝手指拖曳（預設）、tilt＝搖晃（只控制左右）

  const unlocked = () => masteredCount() >= NEED;
  const wordPool = () => st.words.filter((w) => w.type !== '片語' && !/[ ()/]/.test(w.word) && w.word.length >= 3);
  const toPts = (sc) => Math.min(CAP, Math.floor(sc / S_PER_PT));
  const card = () => gameCard({ id: ID, need: NEED, icon: '👾', name: 'Word Blaster' });
  const bestText = () => { const b = st.meta.games && st.meta.games[ID] && st.meta.games[ID].best; return b ? `Word Blaster ${b}` : ''; };

  // ── 畫面 ──
  function mount() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'wj';
    root.innerHTML = `<canvas></canvas>
      <div class="wj-hud"><button class="wj-x" data-wb="quit">✕</button>
        <span class="wb-pw" id="wbPw" style="display:none"></span>
        <span class="wj-t" id="wbT">3:00</span><span class="wj-h" id="wbS">0</span><span class="wj-p" id="wbP">⭐ 0</span></div>
      <div class="wj-pane" id="wbPane"></div>`;
    document.body.appendChild(root);
    cv = root.querySelector('canvas'); cx = cv.getContext('2d');
    root.addEventListener('click', onClick);
    cv.addEventListener('pointerdown', onPtr); cv.addEventListener('pointermove', onPtr);
    ['pointerup', 'pointercancel'].forEach((e) => cv.addEventListener(e, () => { finger = null; }));
    addEventListener('resize', resize);
    addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  }
  function resize() {
    if (!root) return;
    const w = root.clientWidth, h = root.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    S = (w * dpr) / LW; VH = (h * dpr) / S;
  }
  function onPtr(e) {   // 手指拖曳：飛機跑到手指上方一點，不會被手指擋住
    if (!game || game.spell || game.over) return;
    if (e.type === 'pointermove' && !finger && !(e.pointerType === 'mouse' && e.buttons)) return;
    const r = root.getBoundingClientRect();
    finger = { x: ((e.clientX - r.left) / r.width) * LW, y: ((e.clientY - r.top) / r.height) * VH - 70 };
  }
  function onKey(e) {
    if (!game || game.over || game.spell || !root.classList.contains('show')) return;
    const d = e.type === 'keydown' ? 1 : 0, m = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd' }[e.key];
    if (m) { keys[m] = d; e.preventDefault(); }
  }
  const pane = (html) => { const p = root.querySelector('#wbPane'); p.innerHTML = html; p.style.display = html ? '' : 'none'; };

  // ── 開始畫面 ──
  function open() {
    if (!unlocked()) return toast(L(`精熟 ${NEED} 個單元後解鎖`, `Master ${NEED} units to unlock`));
    mount(); root.classList.add('show'); resize();
    document.body.style.overflow = 'hidden';
    const best = gameWeekBestAll(), pb = (st.meta.games && st.meta.games[ID] && st.meta.games[ID].best) || 0;
    pane(`<div class="wj-card">
      <div style="font-size:52px">👾</div>
      <h2>Word Blaster</h2>
      <p>${L('打下外星人，撿道具升級武器！', 'Blast the aliens and power up!')}</p>
      <div class="wj-ctl">
        <button class="${ctl() === 'drag' ? 'on' : ''}" data-wb="ctl" data-c="drag">👆 ${L('手指拖曳', 'Drag')}<small>${L('飛機跟著手指，前後左右都能動', 'Ship follows your finger')}</small></button>
        <button class="${ctl() === 'tilt' ? 'on' : ''}" data-wb="ctl" data-c="tilt">📱 ${L('搖晃手機', 'Tilt')}<small>${L('只能左右移動', 'Left and right only')}</small></button>
      </div>
      <div class="wj-rules">
        <div>⚡ ${L('快速射擊：射速變快', 'Rapid fire')}　🔱 ${L('散彈：一次 3 發，再撿升級 5 發', 'Spread: 3 shots, 5 if you grab another')}</div>
        <div>⏳ ${L('慢動作：敵人和子彈變慢', 'Slow motion: enemies slow down')}　✨ ${L('金色外星人一定掉道具', 'Gold aliens always drop one')}</div>
        <div>✏️ ${L('被打中要拼對一個單字才能繼續（時間不會停，道具會消失）', 'Get hit = spell a word to continue (clock keeps running, power-ups lost)')}</div>
        <div>⭐ ${L(`每 ${S_PER_PT} 分 1 顆星，最多 ${CAP}；所有遊戲每週只算最高一局`, `1 ⭐ per ${S_PER_PT} points, up to ${CAP}; best game of the week counts`)}</div>
      </div>
      <p class="wj-small">${L(`本週遊戲最佳 ${best} / ${CAP} ⭐・個人最高 ${pb} 分`, `Best this week ${best} / ${CAP} ⭐ · Personal best ${pb}`)}<br><span style="opacity:.5">v${VER}</span></p>
      <div class="btnrow"><button class="btn" data-wb="start">${L('開始 Start ▶', 'Start ▶')}</button><button class="btn ghost" data-wb="close">${L('離開', 'Exit')}</button></div>
    </div>`);
    game = null; draw();
  }
  function close() {
    cancelAnimationFrame(raf); game = null;
    if (root) root.classList.remove('show');
    document.body.style.overflow = '';
    if (typeof renderQuiz === 'function' && $('v-quiz').classList.contains('active')) renderQuiz();
  }

  // ── 遊戲 ──
  async function begin() {
    if (ctl() === 'tilt' && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try { if ((await DeviceOrientationEvent.requestPermission()) !== 'granted') throw 0; }
      catch (e) { st.set.blasterCtl = 'drag'; saveSet(); toast(L('沒有開啟動作感應，改用手指拖曳', 'Motion not allowed — using drag')); }
    }
    start();
    if (ctl() === 'tilt') setTimeout(() => {
      if (game && Date.now() - tiltSeen > 1500) { st.set.blasterCtl = 'drag'; saveSet(); toast(L('這支手機不支援搖晃，改用手指拖曳', 'Tilt not supported — using drag')); }
    }, 1500);
  }
  function start() {
    finger = null; keys = { l: 0, r: 0, u: 0, d: 0 };
    game = {
      t0: Date.now(), last: performance.now(), clock: 0,
      ship: { x: LW / 2, y: VH - 90, inv: 2000 }, fireCd: 0,
      shots: [], eshots: [], foes: [], drops: [], fx: [],
      pw: { rapid: 0, spread: 0, slow: 0 }, spreadLv: 1,
      score: 0, wave: 0, hits: 0, kills: 0, used: new Set(), spell: null, over: false, nextDive: 2500,
      stars: Array.from({ length: 60 }, () => ({ x: Math.random() * LW, y: Math.random() * 1000, v: 0.4 + Math.random() * 1.4 })),
    };
    nextWave();
    pane('');
    loop();
  }
  // 一波敵人：越後面越多排、越常俯衝、子彈越快；每波一隻金色（一定掉道具）
  function nextWave() {
    const g = game; g.wave++;
    const rows = Math.min(5, 2 + Math.floor(g.wave / 2)), cols = 6;
    const gold = Math.floor(Math.random() * rows * cols);
    let i = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++, i++) {
      const sx = 40 + c * 56, sy = 70 + r * 38;
      // 越後面越耐打：一般 1 → 2（第 4 波起）；裝甲 2 → 3（第 5 波起）；金色 1
      const kind = i === gold ? 'gold' : r === 0 && g.wave > 1 ? 'armor' : 'basic';
      const hp = kind === 'gold' ? 1 : kind === 'armor' ? (g.wave >= 5 ? 3 : 2) : (g.wave >= 4 ? 2 : 1);
      g.foes.push({ sx, sy, x: sx + (Math.random() - 0.5) * 200, y: -40 - r * 40 - Math.random() * 60, hp, max: hp, kind, st: 'enter', t: Math.random() * 6 });
    }
    g.waveAt = g.clock;
  }
  function loop() {
    raf = requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min(3, (now - game.last) / (1000 / 60)); game.last = now;
    const left = TIME - (Date.now() - game.t0) / 1000;
    if (left <= 0) return end();
    if (!game.spell) step(dt);
    hud(left); draw();
  }
  const active = (k) => game.pw[k] > game.clock;
  function step(dt) {
    const g = game, sh = g.ship, ms = dt * 16.67;
    g.clock += ms;
    const sf = active('slow') ? 0.4 : 1;          // 慢動作：敵人、子彈、道具變慢
    const lv = Math.min(6, g.wave);                 // 難度
    // 飛機移動
    const minY = VH * 0.45, maxY = VH - 40;
    if (keys.l || keys.r || keys.u || keys.d) {
      sh.x += (keys.r - keys.l) * 6 * dt; sh.y += (keys.d - keys.u) * 6 * dt;
    } else if (finger) {
      const dx = finger.x - sh.x, dy = finger.y - sh.y, d = Math.hypot(dx, dy), mx = 11 * dt;
      if (d > 1) { const k = Math.min(1, mx / d); sh.x += dx * k; sh.y += dy * k; }
    } else if (ctl() === 'tilt' && tiltG != null && Date.now() - tiltSeen < 1000) {
      const t = Math.abs(tiltG) < 2 ? 0 : tiltG; sh.x += Math.max(-1, Math.min(1, t / 20)) * 7 * dt;
    }
    sh.x = Math.max(16, Math.min(LW - 16, sh.x)); sh.y = Math.max(minY, Math.min(maxY, sh.y));
    if (sh.inv > 0) sh.inv -= ms;
    // 自動射擊
    g.fireCd -= ms;
    if (g.fireCd <= 0) {
      g.fireCd = active('rapid') ? 105 : 270;
      const angs = !active('spread') ? [0] : g.spreadLv >= 2 ? [-0.32, -0.16, 0, 0.16, 0.32] : [-0.2, 0, 0.2];
      angs.forEach((a) => g.shots.push({ x: sh.x, y: sh.y - 18, vx: Math.sin(a) * 11, vy: -Math.cos(a) * 11 }));
    }
    g.shots.forEach((b) => { b.x += b.vx * dt; b.y += b.vy * dt; });
    g.shots = g.shots.filter((b) => b.y > -20 && b.x > -20 && b.x < LW + 20 && !b.hit);
    // 敵人：進場 → 隊形左右擺動 → 俯衝
    const sway = Math.sin(g.clock / 1200) * 26;
    g.nextDive -= ms * sf;
    if (g.nextDive <= 0) {
      const ready = g.foes.filter((f) => f.st === 'form');
      if (ready.length) { const f = ready[Math.floor(Math.random() * ready.length)]; f.st = 'dive'; f.dx = sh.x; f.t = 0; }
      g.nextDive = Math.max(700, 2600 - lv * 300) * (0.6 + Math.random() * 0.8);
    }
    for (const f of g.foes) {
      f.t += dt * 0.05 * sf;
      if (f.st === 'enter') {
        const tx = f.sx + sway, ty = f.sy;
        f.x += (tx - f.x) * Math.min(1, 0.06 * dt * sf); f.y += (ty - f.y) * Math.min(1, 0.06 * dt * sf);
        if (Math.abs(f.x - tx) < 2 && Math.abs(f.y - ty) < 2) f.st = 'form';
      } else if (f.st === 'form') {
        f.x = f.sx + sway; f.y = f.sy + Math.sin(f.t * 2 + f.sx) * 3;
      } else if (f.st === 'dive') {
        f.y += (3 + lv * 0.45) * dt * sf;
        f.x += ((f.dx - f.x) * 0.02 + Math.sin(f.t * 3) * 1.6) * dt * sf;
        if (f.y > VH + 30) { f.y = -30; f.st = 'enter'; }   // 從上面回到隊形
      }
      // 開火（瞄準飛機）
      if (f.st !== 'enter' && Math.random() < (0.0018 + lv * 0.0011) * dt * sf * (f.st === 'dive' ? 3 : 1)) {
        const dx = sh.x - f.x, dy = sh.y - f.y, d = Math.hypot(dx, dy) || 1, sp = 2.6 + lv * 0.3;
        g.eshots.push({ x: f.x, y: f.y + 10, vx: (dx / d) * sp, vy: (dy / d) * sp });
      }
    }
    g.eshots.forEach((b) => { b.x += b.vx * dt * sf; b.y += b.vy * dt * sf; });
    g.eshots = g.eshots.filter((b) => b.y < VH + 20 && b.y > -20 && b.x > -20 && b.x < LW + 20);
    // 子彈打敵人
    for (const b of g.shots) for (const f of g.foes) {
      if (f.dead || b.hit) continue;
      if (Math.abs(b.x - f.x) < 17 && Math.abs(b.y - f.y) < 15) {
        b.hit = true; f.hp--;
        if (f.hp <= 0) kill(f); else boom(f.x, f.y, '#ffffff', 4);
      }
    }
    g.foes = g.foes.filter((f) => !f.dead);
    // 道具
    g.drops.forEach((d) => { d.y += 1.7 * dt * sf; });
    for (const d of g.drops) if (Math.hypot(d.x - sh.x, d.y - sh.y) < 28) { d.got = true; power(d.k); }
    g.drops = g.drops.filter((d) => !d.got && d.y < VH + 20);
    // 被打中
    if (sh.inv <= 0) {
      const hitB = g.eshots.some((b) => Math.hypot(b.x - sh.x, b.y - sh.y) < 11);
      const hitF = g.foes.some((f) => Math.abs(f.x - sh.x) < 20 && Math.abs(f.y - sh.y) < 18);
      if (hitB || hitF) return hit();
    }
    // 下一波
    if (!g.foes.length) { g.score += 50; flash(L(`第 ${g.wave} 波完成 +50`, `Wave ${g.wave} clear +50`)); nextWave(); }
    g.fx.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.a -= 0.03 * dt; });
    g.fx = g.fx.filter((p) => p.a > 0);
  }
  function kill(f) {
    const g = game; f.dead = true; g.kills++;
    const pts = f.kind === 'gold' ? 50 : 10 * f.max;
    const bonus = f.st === 'dive' ? 10 : 0;
    const before = toPts(g.score); g.score += pts + bonus;
    if (toPts(g.score) > before) flash('+1 ⭐');
    boom(f.x, f.y, f.kind === 'gold' ? '#ffd23f' : f.kind === 'armor' ? '#ffb547' : '#4ECDC4', 10);
    if (f.kind === 'gold' || Math.random() < 0.09) {
      const ks = Object.keys(PW_TIME);
      g.drops.push({ x: f.x, y: f.y, k: ks[Math.floor(Math.random() * ks.length)] });
    }
  }
  function power(k) {
    const g = game, info = PW_INFO[k];
    if (k === 'spread' && active('spread')) g.spreadLv = 2;
    if (k === 'spread' && !active('spread')) g.spreadLv = 1;
    g.pw[k] = Math.max(g.pw[k], g.clock) + PW_TIME[k];
    flash(`${info.ic} ${L(info.zh, info.en)}${k === 'spread' && g.spreadLv === 2 ? ' ×5' : ''}`);
  }
  function boom(x, y, c, n) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 1 + Math.random() * 3; game.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, a: 1, c }); } }

  // ── 被打中 → 拼字 ──
  function hit() {
    const g = game; g.hits++;
    boom(g.ship.x, g.ship.y, '#ff6b57', 18);
    keys = { l: 0, r: 0, u: 0, d: 0 }; finger = null;
    const pool = wordPool(), fresh = pool.filter((w) => !g.used.has(w.id));
    const w = shuffle(fresh.length ? fresh : pool)[0]; g.used.add(w.id);
    g.spell = { w, ans: answersOf(w)[0], shown: 1, tries: 0 };
    renderSpell(); speak(w.word);
  }
  function renderSpell(bad) {
    const s = game.spell, a = s.ans;
    const hint = a.split('').map((c, i) => (i < s.shown ? c : '_')).join(' ');
    pane(`<div class="wj-card wj-spell ${bad ? 'shake' : ''}">
      <div class="wj-kicker">${L('被打中了！拼對才能繼續', 'Hit! Spell it to keep going')} ✏️</div>
      <div class="wj-mean" ${EN() ? 'style="font-size:17px"' : ''}>${esc(meaning(s.w))}</div>
      <div class="qmid"><span class="pos">${esc(s.w.pos)}</span><button class="spk small" data-say="${esc(s.w.word)}">🔊</button></div>
      <div class="hintw">${esc(hint)}</div>
      <input class="spellin" id="wbIn" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="type here">
      ${s.tries ? `<div class="wj-small" style="color:var(--coral)">${L(`拼錯 ${s.tries} 次，多給你一個字母`, `${s.tries} wrong — here's another letter`)}</div>` : ''}
      <button class="btn wide" style="margin-top:10px" data-wb="check">${L('確認 Check', 'Check')}</button>
    </div>`);
    const inp = $('wbIn'); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    setTimeout(() => inp.focus(), 50);
  }
  function check() {
    const s = game && game.spell; if (!s) return;
    const v = norm($('wbIn').value || '');
    if (!v) return $('wbIn').focus();
    if (answersOf(s.w).includes(v)) {
      const g = game; g.spell = null; pane('');
      g.ship = { x: LW / 2, y: VH - 90, inv: 2500 };          // 2.5 秒無敵
      g.eshots = []; g.pw = { rapid: 0, spread: 0, slow: 0 }; g.spreadLv = 1;   // 道具消失
      g.foes.forEach((f) => { if (f.st === 'dive') { f.y = -30; f.st = 'enter'; } });
      g.last = performance.now();
      flash(L('✓ 答對！繼續', '✓ Correct! Go!'));
    } else {
      s.tries++; s.shown = Math.min(s.ans.length, s.shown + 1);
      renderSpell(true); speak(s.w.word);
    }
  }

  // ── 結束 ──
  function end() {
    cancelAnimationFrame(raf);
    if (game.over) return; game.over = true; game.spell = null;
    const sc = game.score, pts = toPts(sc), k = todayKey();
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
      <div class="wj-small">${record ? L('🆕 個人最高紀錄！', '🆕 New personal best!') : L(`個人最高 ${gm.best}`, `Personal best ${gm.best}`)}・${L(`第 ${game.wave} 波・打下 ${game.kills} 隻・被打中 ${game.hits} 次`, `Wave ${game.wave} · ${game.kills} aliens · hit ${game.hits}×`)}</div>
      <div class="wj-pts">⭐ ${pts} / ${CAP}</div>
      ${gain ? `<div class="gain">+${gain} ⭐</div>`
        : `<div class="gain zero">${prev >= CAP ? L('本週遊戲已經拿滿 20 分，現在純粹好玩 🎮', 'You already got 20 this week — just for fun now 🎮')
          : L(`本週遊戲最佳是 ${prev} 分，超過才會再加分`, `Your best this week is ${prev} — beat it to earn more`)}</div>`}
      <div class="btnrow" style="margin-top:14px"><button class="btn" data-wb="start">${L('再玩一次', 'Play again')}</button><button class="btn ghost" data-wb="close">${L('離開', 'Exit')}</button></div>
    </div>`);
  }

  // ── 繪圖 ──
  function hud(left) {
    const s = Math.max(0, Math.ceil(left));
    $('wbT').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    $('wbT').classList.toggle('low', s <= 20);
    if (!game) return;
    $('wbS').textContent = game.score; $('wbP').textContent = '⭐ ' + toPts(game.score);
    $('wbPw').innerHTML = Object.keys(PW_INFO).filter(active).map((k) => {
      const sec = Math.ceil((game.pw[k] - game.clock) / 1000);
      return `${PW_INFO[k].ic}${k === 'spread' && game.spreadLv === 2 ? '×5' : ''}<small>${sec}</small>`;
    }).join(' ');
    $('wbPw').style.display = $('wbPw').innerHTML ? '' : 'none';
  }
  let flashes = [];
  const flash = (t) => flashes.push({ t, a: 1, y: -26 * flashes.filter((f) => f.a > 0.6).length });   // 同時多個提示往下錯開
  function alien(x, y, f) {   // 原創外星蟲：圓身體＋眼睛＋觸角
    const col = f.kind === 'gold' ? '#ffd23f' : f.kind === 'armor' ? (f.hp > 1 ? '#ffb547' : '#ff8a5c') : f.hp > 1 ? '#a78bfa' : '#4ECDC4';   // 紫色＝要打兩下
    cx.save(); cx.translate(x, y);
    const wob = Math.sin(f.t * 6) * 3;
    cx.strokeStyle = col; cx.lineWidth = 2;
    cx.beginPath(); cx.moveTo(-6, -9); cx.lineTo(-10, -16 + wob); cx.moveTo(6, -9); cx.lineTo(10, -16 - wob); cx.stroke();
    cx.fillStyle = col; cx.beginPath(); cx.ellipse(0, 0, 15, 11, 0, 0, 7); cx.fill();
    cx.beginPath(); cx.moveTo(-15, 2); cx.lineTo(-21, 9 + wob); cx.lineTo(-11, 7); cx.moveTo(15, 2); cx.lineTo(21, 9 - wob); cx.lineTo(11, 7); cx.fill();
    cx.fillStyle = '#0a0a14'; cx.beginPath(); cx.arc(-5, -1, 3.2, 0, 7); cx.arc(5, -1, 3.2, 0, 7); cx.fill();
    cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(-4, -2, 1.1, 0, 7); cx.arc(6, -2, 1.1, 0, 7); cx.fill();
    if (f.kind === 'gold') { cx.strokeStyle = 'rgba(255,210,63,.6)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(0, 0, 20 + Math.sin(f.t * 8) * 2, 0, 7); cx.stroke(); }
    cx.restore();
  }
  function ship(x, y, inv) {
    if (inv > 0 && Math.floor(inv / 120) % 2) return;     // 無敵時閃爍
    cx.save(); cx.translate(x, y);
    if (active('slow')) { cx.strokeStyle = 'rgba(255,181,71,.5)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(0, 0, 26, 0, 7); cx.stroke(); }
    cx.fillStyle = '#ff6b57'; cx.beginPath(); cx.moveTo(-7, 16); cx.lineTo(0, 24 + Math.random() * 6); cx.lineTo(7, 16); cx.fill();   // 火焰
    cx.fillStyle = '#CCFF00'; cx.beginPath(); cx.moveTo(0, -22); cx.lineTo(18, 16); cx.lineTo(0, 9); cx.lineTo(-18, 16); cx.closePath(); cx.fill();
    cx.font = '20px "Apple Color Emoji","Segoe UI Emoji",sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(st.profile ? st.profile.avatar : '🦊', 0, 2);
    cx.restore(); cx.textBaseline = 'alphabetic';
  }
  function draw() {
    const W = cv.width, H = cv.height;
    cx.fillStyle = '#06070f'; cx.fillRect(0, 0, W, H);
    cx.save(); cx.scale(S, S);
    if (game) {
      const g = game, sf = active('slow') ? 0.4 : 1;
      cx.fillStyle = 'rgba(255,255,255,.6)';
      g.stars.forEach((s) => { if (!g.spell && !g.over) s.y = (s.y + s.v * sf) % 1000; if (s.y < VH) cx.fillRect(s.x, s.y, s.v > 1.2 ? 2 : 1, s.v > 1.2 ? 2 : 1); });
      if (active('slow')) { cx.fillStyle = 'rgba(255,181,71,.06)'; cx.fillRect(0, 0, LW, VH); }
      g.foes.forEach((f) => alien(f.x, f.y, f));
      cx.fillStyle = '#CCFF00'; g.shots.forEach((b) => cx.fillRect(b.x - 2, b.y - 7, 4, 12));
      g.eshots.forEach((b) => { cx.fillStyle = '#ff6b57'; cx.beginPath(); cx.arc(b.x, b.y, 4.5, 0, 7); cx.fill(); cx.fillStyle = '#ffd2cb'; cx.beginPath(); cx.arc(b.x, b.y, 2, 0, 7); cx.fill(); });
      g.drops.forEach((d) => {
        const i = PW_INFO[d.k];
        cx.fillStyle = 'rgba(0,0,0,.55)'; cx.strokeStyle = i.c; cx.lineWidth = 2; cx.beginPath(); cx.arc(d.x, d.y, 14, 0, 7); cx.fill(); cx.stroke();
        cx.font = '16px "Apple Color Emoji","Segoe UI Emoji",sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(i.ic, d.x, d.y + 1); cx.textBaseline = 'alphabetic';
      });
      g.fx.forEach((p) => { cx.globalAlpha = Math.max(0, p.a); cx.fillStyle = p.c; cx.fillRect(p.x - 2, p.y - 2, 4, 4); });
      cx.globalAlpha = 1;
      if (!g.spell || g.over) ship(g.ship.x, g.ship.y, g.ship.inv);
      flashes = flashes.filter((f) => f.a > 0);
      flashes.forEach((f) => {
        cx.globalAlpha = f.a; cx.fillStyle = '#CCFF00'; cx.font = '800 20px Syne, "Noto Sans TC", sans-serif'; cx.textAlign = 'center';
        cx.fillText(f.t, LW / 2, VH * 0.4 - f.y); f.y += 0.7; f.a -= 0.014;
      });
      cx.globalAlpha = 1;
      if (!g.spell && !g.over && Date.now() - g.t0 < 4000) {
        cx.fillStyle = 'rgba(255,255,255,.75)'; cx.font = '700 15px "Noto Sans TC", sans-serif'; cx.textAlign = 'center';
        cx.fillText(ctl() === 'tilt' ? L('📱 左右傾斜手機移動', '📱 Tilt to move') : L('👆 按住拖曳，飛機跟著手指走', '👆 Hold and drag to move'), LW / 2, VH * 0.36);
      }
    }
    cx.restore();
  }

  function onClick(e) {
    const t = e.target.closest('[data-wb]'); if (!t) return;
    const a = t.dataset.wb;
    if (a === 'start') { if (typeof unlockAudio === 'function') unlockAudio(); begin(); }
    if (a === 'ctl') { st.set.blasterCtl = t.dataset.c; saveSet(); open(); }
    if (a === 'close') close();
    if (a === 'check') check();
    if (a === 'quit') {
      if (game && !game.over && !confirm(L('離開這一局？這局不會計分。', "Quit this game? It won't be scored."))) return;
      close();
    }
  }
  const _t = { get game() { return game; }, check, hit, end, toPts, power, get VH() { return VH; } };
  return { id: ID, need: NEED, card, bestText, open, close, _t };
})();
GAMES.push(WB);
