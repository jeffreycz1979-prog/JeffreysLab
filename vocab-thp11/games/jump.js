// ═══════════════════════════════════════════════════════
//  THP11 獎勵遊戲 #1：Word Jump（往上跳）
//  解鎖：至少一個單元 🏅 精熟
//  規則：3 分鐘；掉下去要拼字（題目出自所有已開放單元），拼錯就多提示一個字母，
//        拼對才回到原高度繼續，時間不暫停。高度換算 0～20 分，每週只算最高一局。
//  依賴 index.html 的全域：st, $, esc, L, EN, meaning, speak, answersOf, norm, shuffle,
//        todayKey, clockCheck, saveLedger, afterPoints, points, gameWeekBest, toast, coach, confetti
// ═══════════════════════════════════════════════════════
const WJ = (() => {
  const ID = 'jump';
  const TIME = 180;          // 秒
  const M_PER_PT = 60;       // 每 60 公尺 = 1 分（1200 m 滿分 20）；機器人實測：準 1390 m、普通 930 m、常失誤 780 m（不含真人拼字時間）
  const CAP = 20;
  const LW = 360;            // 邏輯寬度（實際畫面依比例縮放）
  const G = 0.38, JUMP = -11.5, SPRING = -19, RUN = 5.2;
  const PW = 66, PH = 12;
  const EDGE = 0.2;          // 手指模式：左右各 20% 是「穿牆區」，按著就一直往那邊跑
  const VER = '1.3';

  let cv, cx, root, S = 1, VH = 640;   // S＝縮放；VH＝邏輯高度
  let game = null, raf = 0, keys = { l: false, r: false };
  // 操作方式：tilt＝搖晃手機（陀螺儀）、touch＝手指跟隨；鍵盤方向鍵一律可用
  let fingerX = null, tiltG = null, tiltSeen = 0;
  const isTouch = () => matchMedia('(pointer: coarse)').matches;
  const ctl = () => st.set.jumpCtl || (isTouch() && 'DeviceOrientationEvent' in window ? 'tilt' : 'touch');
  addEventListener('deviceorientation', (e) => { if (e.gamma != null) { tiltG = e.gamma; tiltSeen = Date.now(); } });

  // ── 解鎖與題庫 ──
  const masteredUnits = () => [...new Set(st.ledger.bonus.filter((b) => b.k.startsWith('master:')).map((b) => b.k.slice(7)))];
  const unlocked = () => masteredUnits().some((u) => st.words.some((w) => w.unit === u));
  // 拼字題：所有已開放單元的單字（不只精熟單元，還沒練熟的字也考）
  const wordPool = () => st.words.filter((w) => w.type !== '片語' && !/[ ()/]/.test(w.word) && w.word.length >= 3);
  const toPts = (m) => Math.min(CAP, Math.floor(m / M_PER_PT));

  // ── 挑戰頁上的入口卡片 ──
  function card() {
    const best = gameWeekBest(ID), ok = unlocked();
    return `<div class="gamecard ${ok ? '' : 'off'}">
      <div class="gc-ic">🚀</div>
      <div class="gc-m"><b>Word Jump</b><small>${ok
        ? L(`獎勵遊戲・本週最佳 ${best} / ${CAP} ⭐`, `Bonus game · best this week ${best} / ${CAP} ⭐`)
        : L('任一單元挑戰 🏅 精熟後解鎖', 'Unlocks after you master a unit 🏅')}</small></div>
      <button class="go" data-act="game" ${ok ? '' : 'disabled'}>${ok ? L('玩 ▶', 'Play ▶') : '🔒'}</button></div>`;
  }

  // ── 建立畫面 ──
  function mount() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'wj';
    root.innerHTML = `<canvas></canvas>
      <div class="wj-hud"><button class="wj-x" data-wj="quit">✕</button>
        <span class="wj-t" id="wjT">3:00</span><span class="wj-h" id="wjH">0 m</span><span class="wj-p" id="wjP">⭐ 0</span></div>
      <div class="wj-pane" id="wjPane"></div>`;
    document.body.appendChild(root);
    cv = root.querySelector('canvas'); cx = cv.getContext('2d');
    root.addEventListener('click', onClick);
    cv.addEventListener('pointerdown', onPtr); cv.addEventListener('pointermove', onPtr);
    ['pointerup', 'pointercancel'].forEach((e) => cv.addEventListener(e, () => { fingerX = null; }));
    cv.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') fingerX = null; });
    addEventListener('resize', resize);
    addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  }
  function resize() {
    if (!root) return;
    const w = root.clientWidth, h = root.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    S = (w * dpr) / LW; VH = (h * dpr) / S;
  }
  function onPtr(e) {   // 手指跟隨：手指在哪，角色就往哪（只有手指按著時）
    if (!game || game.spell || game.over) return;
    if (e.type === 'pointermove' && fingerX == null && e.pointerType !== 'mouse') return;
    if (e.type === 'pointermove' && e.pointerType === 'mouse' && !e.buttons) return;
    fingerX = (e.clientX / root.clientWidth) * LW;
  }
  function onKey(e) {
    if (!game || game.over || game.spell) return;
    const d = e.type === 'keydown';
    if (e.key === 'ArrowLeft') { keys.l = d; e.preventDefault(); }
    if (e.key === 'ArrowRight') { keys.r = d; e.preventDefault(); }
  }

  // ── 開始畫面 ──
  function open() {
    if (!unlocked()) return toast(L('先把任一單元挑戰到 🏅 精熟', 'Master a unit first 🏅'));
    if (!wordPool().length) return toast(L('精熟單元裡沒有可以拼的單字', 'No spelling words yet'));
    mount(); root.classList.add('show'); resize();
    document.body.style.overflow = 'hidden';
    const best = gameWeekBest(ID), pb = (st.meta.games && st.meta.games[ID] && st.meta.games[ID].bestM) || 0;
    pane(`<div class="wj-card">
      <div style="font-size:52px">${esc(st.profile.avatar)}</div>
      <h2>Word Jump 🚀</h2>
      <p>${L('一直往上跳，看你能跳多高！', 'Jump as high as you can!')}</p>
      <div class="wj-ctl">
        <button class="${ctl() === 'tilt' ? 'on' : ''}" data-wj="ctl" data-c="tilt">📱 ${L('搖晃手機', 'Tilt')}<small>${L('左右傾斜手機', 'Tilt your phone')}</small></button>
        <button class="${ctl() === 'touch' ? 'on' : ''}" data-wj="ctl" data-c="touch">👆 ${L('手指跟隨', 'Finger')}<small>${L('按住螢幕跟著走，按兩側穿牆', 'Follow finger · edges wrap')}</small></button>
      </div>
      <div class="wj-rules">
        <div>⏱ ${L('3 分鐘，時間到就結束', '3 minutes')}</div>
        <div>✏️ ${L('掉下去要拼對一個單字才能繼續（時間不會停）', 'Fall = spell a word to continue (the clock keeps running)')}</div>
        <div>⭐ ${L(`每 ${M_PER_PT} 公尺 1 分，最多 ${CAP} 分`, `1 point per ${M_PER_PT} m, up to ${CAP}`)}</div>
        <div>📅 ${L('每週只算最高的一局', 'Only your best game each week counts')}</div>
      </div>
      <p class="wj-small">${L(`本週最佳 ${best} / ${CAP} ⭐・個人最高 ${pb} m`, `This week ${best} / ${CAP} ⭐ · Personal best ${pb} m`)}<br><span style="opacity:.5">v${VER}</span></p>
      <div class="btnrow"><button class="btn" data-wj="start">${L('開始 Start ▶', 'Start ▶')}</button><button class="btn ghost" data-wj="close">${L('離開', 'Exit')}</button></div>
    </div>`);
    draw(true);
  }
  function close() {
    cancelAnimationFrame(raf); game = null;
    if (root) root.classList.remove('show');
    document.body.style.overflow = '';
    if (typeof renderQuiz === 'function' && $('v-quiz').classList.contains('active')) renderQuiz();
  }
  const pane = (html) => { const p = root.querySelector('#wjPane'); p.innerHTML = html; p.style.display = html ? '' : 'none'; };

  // ── 遊戲 ──
  async function begin() {   // iPhone 的陀螺儀要在按鈕裡請求權限
    if (ctl() === 'tilt' && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        if ((await DeviceOrientationEvent.requestPermission()) !== 'granted') throw 0;
      } catch (e) { st.set.jumpCtl = 'touch'; saveSet(); toast(L('沒有開啟動作感應，改用手指跟隨', 'Motion not allowed — using finger mode')); }
    }
    start();
    if (ctl() === 'tilt') setTimeout(() => {   // 1.5 秒內沒收到陀螺儀資料 → 改用手指
      if (game && Date.now() - tiltSeen > 1500) { st.set.jumpCtl = 'touch'; saveSet(); toast(L('這支手機不支援搖晃，改用手指跟隨', 'Tilt not supported — using finger mode')); }
    }, 1500);
  }
  function start() {
    fingerX = null; keys.l = keys.r = false;
    const y0 = 0;
    game = {
      t0: Date.now(), p: { x: LW / 2, y: y0 - 40, vx: 0, vy: JUMP }, cam: y0 - VH * 0.7, top: y0,
      plats: [], nextY: y0, maxH: 0, falls: 0, spelled: 0, used: new Set(), spell: null, over: false, last: performance.now(),
      stars: Array.from({ length: 40 }, () => ({ x: Math.random() * LW, y: Math.random() * 2000, r: Math.random() * 1.6 + 0.4 })),
    };
    game.plats.push({ x: LW / 2 - PW / 2, y: y0, t: 'n', w: PW, vx: 0 });
    game.nextY = y0;
    fill();
    pane('');
    loop();
  }
  const height = () => Math.max(0, Math.round(-game.p.y / 10));
  // 越高越難：間距變大（主路最大 150，跳躍極限約 174）、平台變小
  const diff = (h) => Math.min(1, h / 1000);
  function gapAt(h) { const k = diff(h); return [50 + 45 * k, 85 + 65 * k]; }
  const widthAt = (h) => Math.round(66 - 22 * diff(h));
  function fill() {
    while (game.nextY > game.cam - 200) {
      const h = -game.nextY / 10, [a, b] = gapAt(h);
      const prevY = game.nextY;
      const gap = a + Math.random() * (b - a);
      game.nextY -= gap;
      // 主路：一般／移動／彈簧，保證一定有一條路跳得上去
      const r = Math.random(), mv = Math.min(0.4, h / 800);
      const t = r < 0.05 ? 's' : r < 0.05 + mv ? 'm' : 'n';
      const w = widthAt(h), x = Math.random() * (LW - w);
      game.plats.push({ x, y: game.nextY, t, w, vx: t === 'm' ? (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.min(2, h / 550)) : 0 });
      const other = () => { let ox; do { ox = Math.random() * (LW - w); } while (Math.abs(ox - x) < w + 20); return ox; };
      // 會碎的平台：放在兩塊主路平台中間當陷阱或捷徑，不會擋住唯一的路
      if (h > 150 && Math.random() < Math.min(0.35, (h - 150) / 900))
        game.plats.push({ x: other(), y: prevY - gap * (0.4 + Math.random() * 0.2), t: 'b', w, vx: 0 });
      // 第二條路：越高越常出現，同一高度附近多一塊一般平台可以選
      if (Math.random() < 0.15 + 0.35 * diff(h))
        game.plats.push({ x: other(), y: game.nextY + (Math.random() * 30 - 15), t: 'n', w, vx: 0 });
    }
    game.plats = game.plats.filter((p) => p.y < game.cam + VH + 60 && !p.gone);
  }
  function loop() {
    raf = requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min(3, (now - game.last) / (1000 / 60)); game.last = now;
    const left = TIME - (Date.now() - game.t0) / 1000;
    if (left <= 0) return end();
    hud(left);
    if (!game.spell) step(dt);
    draw();
  }
  function step(dt) {
    const p = game.p;
    const want = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
    let target = null;
    if (want) target = want * RUN;
    else if (ctl() === 'tilt' && tiltG != null && Date.now() - tiltSeen < 1000) {
      const g = Math.abs(tiltG) < 2 ? 0 : tiltG;          // 2° 以內不動
      target = Math.max(-1, Math.min(1, g / 20)) * RUN * 1.2;   // 傾斜 20° 就全速
    } else if (fingerX != null) {
      if (fingerX < LW * EDGE) target = -RUN * 1.2;          // 按在左邊穿牆區：一直往左跑，穿過邊界
      else if (fingerX > LW * (1 - EDGE)) target = RUN * 1.2; // 按在右邊穿牆區：一直往右跑，穿過邊界
      else {
        let dx = fingerX - p.x; const span = LW + 28;         // 走最近的路（必要時穿牆）
        if (dx > span / 2) dx -= span; else if (dx < -span / 2) dx += span;
        target = Math.abs(dx) < 4 ? 0 : Math.max(-RUN * 1.3, Math.min(RUN * 1.3, dx * 0.18));
      }
    }
    p.vx = target != null ? p.vx + (target - p.vx) * Math.min(1, 0.35 * dt) : p.vx * Math.pow(0.82, dt);
    p.x += p.vx * dt;
    if (p.x < -14) p.x += LW + 28; if (p.x > LW + 14) p.x -= LW + 28;   // 左右穿越
    const py = p.y;
    p.vy += G * dt; p.y += p.vy * dt;
    for (const pl of game.plats) {
      if (pl.t === 'm') { pl.x += pl.vx * dt; if (pl.x < 0 || pl.x > LW - pl.w) pl.vx *= -1; }
    }
    if (p.vy > 0) {   // 往下掉時才會踩到
      for (const pl of game.plats) {
        if (pl.gone) continue;
        if (py <= pl.y && p.y >= pl.y && p.x > pl.x - 8 && p.x < pl.x + pl.w + 8) {
          p.y = pl.y; p.vy = pl.t === 's' ? SPRING : JUMP;
          if (pl.t === 'b') pl.gone = true;
          if (pl.t === 's') pl.boing = 12;
          break;
        }
      }
    }
    if (p.y < game.cam + VH * 0.42) game.cam = p.y - VH * 0.42;
    const h = height();
    if (h > game.maxH) {
      const before = toPts(game.maxH); game.maxH = h;
      if (toPts(h) > before) flash(`+1 ⭐`);
    }
    fill();
    if (p.y > game.cam + VH + 50) fall();
  }

  // ── 掉下去 → 拼字 ──
  function fall() {
    game.falls++;
    keys.l = keys.r = false; fingerX = null;
    const pool = wordPool(), fresh = pool.filter((w) => !game.used.has(w.id));
    const w = shuffle(fresh.length ? fresh : pool)[0]; game.used.add(w.id);
    game.spell = { w, ans: answersOf(w)[0], shown: 1, tries: 0 };
    renderSpell(); speak(w.word);
  }
  function renderSpell(bad) {
    const s = game.spell, a = s.ans;
    const hint = a.split('').map((c, i) => (i < s.shown ? c : '_')).join(' ');
    pane(`<div class="wj-card wj-spell ${bad ? 'shake' : ''}">
      <div class="wj-kicker">${L('掉下去了！拼對才能繼續', 'Oops! Spell it to keep going')} ✏️</div>
      <div class="wj-mean" ${EN() ? 'style="font-size:17px"' : ''}>${esc(meaning(s.w))}</div>
      <div class="qmid"><span class="pos">${esc(s.w.pos)}</span><button class="spk small" data-say="${esc(s.w.word)}">🔊</button></div>
      <div class="hintw">${esc(hint)}</div>
      <input class="spellin" id="wjIn" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="type here">
      ${s.tries ? `<div class="wj-small" style="color:var(--coral)">${L(`拼錯 ${s.tries} 次，多給你一個字母`, `${s.tries} wrong — here's another letter`)}</div>` : ''}
      <button class="btn wide" style="margin-top:10px" data-wj="check">${L('確認 Check', 'Check')}</button>
    </div>`);
    const inp = $('wjIn'); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    setTimeout(() => inp.focus(), 50);
  }
  function check() {
    const s = game && game.spell; if (!s) return;
    const v = norm($('wjIn').value || '');
    if (!v) return $('wjIn').focus();
    if (answersOf(s.w).includes(v)) {
      game.spelled++; game.spell = null; pane('');
      respawn(); flash(L('✓ 答對！繼續跳', '✓ Correct! Go!'));
    } else {
      s.tries++; s.shown = Math.min(s.ans.length, s.shown + 1);
      renderSpell(true); speak(s.w.word);
    }
  }
  function respawn() {   // 回到原本的高度：在畫面下方放一塊安全平台
    const y = game.cam + VH * 0.72;
    game.plats.push({ x: LW / 2 - 40, y, t: 'n', w: 80, vx: 0, safe: 1 });
    game.p = { x: LW / 2, y: y - 2, vx: 0, vy: JUMP };
  }

  // ── 結束 ──
  function end() {
    cancelAnimationFrame(raf);
    if (game.over) return; game.over = true; game.spell = null;
    const m = game.maxH, pts = toPts(m), k = todayKey();
    const before = points().total, prev = gameWeekBest(ID);
    clockCheck();
    const day = st.ledger.days[k] || (st.ledger.days[k] = { cards: 0 });
    day.gbest = day.gbest || {};
    if (pts > (day.gbest[ID] || 0)) day.gbest[ID] = pts;
    st.meta.games = st.meta.games || {};
    const g = st.meta.games[ID] || (st.meta.games[ID] = { plays: 0, bestM: 0 });
    g.plays++; const record = m > g.bestM; if (record) g.bestM = m;
    saveLedger(); saveMeta();
    const gain = Math.max(0, pts - prev);
    afterPoints(before);
    if (gain) setTimeout(() => confetti(gain >= 10 ? 90 : 50), 150);
    hud(0); draw();
    pane(`<div class="wj-card">
      <div class="wj-kicker">${L('時間到！', "Time's up!")}</div>
      <div class="wj-big">${m} m</div>
      <div class="wj-small">${record ? L('🆕 個人最高紀錄！', '🆕 New personal best!') : L(`個人最高 ${g.bestM} m`, `Personal best ${g.bestM} m`)}・${L(`掉下去 ${game.falls} 次`, `${game.falls} falls`)}</div>
      <div class="wj-pts">⭐ ${pts} / ${CAP}</div>
      ${gain ? `<div class="gain">+${gain} ⭐</div>`
        : `<div class="gain zero">${prev >= CAP ? L('本週已經拿滿 20 分，現在純粹好玩 🎮', 'You already got 20 this week — just for fun now 🎮')
          : L(`本週最佳是 ${prev} 分，超過才會再加分`, `Your best this week is ${prev} — beat it to earn more`)}</div>`}
      <div class="btnrow" style="margin-top:14px"><button class="btn" data-wj="start">${L('再玩一次', 'Play again')}</button><button class="btn ghost" data-wj="close">${L('離開', 'Exit')}</button></div>
    </div>`);
  }

  // ── 畫面 ──
  function hud(left) {
    const s = Math.max(0, Math.ceil(left));
    $('wjT').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    $('wjT').classList.toggle('low', s <= 20);
    if (game) { $('wjH').textContent = game.maxH + ' m'; $('wjP').textContent = '⭐ ' + toPts(game.maxH); }
  }
  let flashes = [];
  const flash = (t) => flashes.push({ t, a: 1, y: 0 });
  function draw(idle) {
    const W = cv.width, H = cv.height;
    const gr = cx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0d1430'); gr.addColorStop(1, '#0a0a14');
    cx.fillStyle = gr; cx.fillRect(0, 0, W, H);
    cx.save(); cx.scale(S, S);
    const cam = game ? game.cam : -VH * 0.7;
    // 星星（視差）
    cx.fillStyle = 'rgba(255,255,255,.55)';
    (game ? game.stars : []).forEach((s) => { const y = ((s.y - cam * 0.3) % 2000 + 2000) % 2000; if (y < VH) { cx.beginPath(); cx.arc(s.x, y, s.r, 0, 7); cx.fill(); } });
    if (game) {
      // 分數線：每 60 m 一條
      cx.font = '700 11px Syne, sans-serif'; cx.textAlign = 'right';
      for (let n = 1; n <= CAP; n++) {
        const y = -n * M_PER_PT * 10 - cam; if (y < -10 || y > VH + 10) continue;
        const got = game.maxH >= n * M_PER_PT;
        cx.strokeStyle = got ? 'rgba(78,205,196,.35)' : 'rgba(204,255,0,.28)'; cx.setLineDash([6, 8]);
        cx.beginPath(); cx.moveTo(0, y); cx.lineTo(LW, y); cx.stroke(); cx.setLineDash([]);
        cx.fillStyle = got ? 'rgba(78,205,196,.8)' : 'rgba(204,255,0,.8)'; cx.fillText(`⭐${n}`, LW - 6, y - 4);
      }
      // 平台
      for (const pl of game.plats) {
        if (pl.gone) continue;
        const y = pl.y - cam;
        cx.fillStyle = pl.t === 'm' ? '#4ECDC4' : pl.t === 'b' ? '#6b7387' : pl.safe ? '#ffffff' : '#CCFF00';
        round(pl.x, y, pl.w, PH, 6); cx.fill();
        if (pl.t === 'b') { cx.strokeStyle = '#0a0a14'; cx.beginPath(); cx.moveTo(pl.x + pl.w / 2 - 4, y); cx.lineTo(pl.x + pl.w / 2 + 3, y + PH); cx.stroke(); }
        if (pl.t === 's') { cx.fillStyle = '#ffb547'; const b = pl.boing ? (pl.boing--, 10) : 0; round(pl.x + pl.w / 2 - 9, y - 9 - b, 18, 9 + b, 3); cx.fill(); }
      }
      // 角色（頭像）
      const p = game.p;
      cx.font = '34px "Apple Color Emoji","Segoe UI Emoji",sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'bottom';
      cx.fillText(st.profile ? st.profile.avatar : '🦊', p.x, p.y - cam + 4);
      cx.textBaseline = 'alphabetic';
      // 飄字
      flashes = flashes.filter((f) => f.a > 0);
      flashes.forEach((f) => {
        cx.globalAlpha = f.a; cx.fillStyle = '#CCFF00'; cx.font = '800 22px Syne, sans-serif'; cx.textAlign = 'center';
        cx.fillText(f.t, LW / 2, VH * 0.3 - f.y); f.y += 0.8; f.a -= 0.015;
      });
      cx.globalAlpha = 1;
      // 手指模式：畫出左右穿牆區（按著時亮起）
      if (ctl() === 'touch' && !game.spell && !game.over) {
        const zw = LW * EDGE, inL = fingerX != null && fingerX < zw, inR = fingerX != null && fingerX > LW - zw;
        const early = Date.now() - game.t0 < 4000;
        [[0, inL, '«'], [LW - zw, inR, '»']].forEach(([x, on, ar]) => {
          if (!on && !early) return;
          cx.fillStyle = on ? 'rgba(204,255,0,.12)' : 'rgba(255,255,255,.06)'; cx.fillRect(x, 0, zw, VH);
          cx.fillStyle = on ? 'rgba(204,255,0,.7)' : 'rgba(255,255,255,.45)'; cx.font = '800 30px sans-serif'; cx.textAlign = 'center';
          cx.fillText(ar, x + zw / 2, VH * 0.62);
        });
        if (early) { cx.font = '600 11px "Noto Sans TC", sans-serif'; cx.fillStyle = 'rgba(255,255,255,.6)';
          cx.fillText(L('按這裡穿牆', 'Hold to wrap'), zw / 2, VH * 0.62 + 22); cx.fillText(L('按這裡穿牆', 'Hold to wrap'), LW - zw / 2, VH * 0.62 + 22); }
      }
      // 操作提示（前 4 秒）
      if (!game.spell && !game.over && Date.now() - game.t0 < 4000) {
        cx.fillStyle = 'rgba(255,255,255,.75)'; cx.font = '700 16px "Noto Sans TC", sans-serif'; cx.textAlign = 'center';
        cx.fillText(ctl() === 'tilt' ? L('📱 左右傾斜手機', '📱 Tilt your phone') : L('👆 按住螢幕，角色跟著手指走', '👆 Hold and slide your finger'), LW / 2, VH - 40);
      }
    }
    cx.restore();
  }
  function round(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }

  function onClick(e) {
    const t = e.target.closest('[data-wj]'); if (!t) return;
    const a = t.dataset.wj;
    if (a === 'start') { unlockAudio && unlockAudio(); begin(); }
    if (a === 'ctl') { st.set.jumpCtl = t.dataset.c; saveSet(); open(); }
    if (a === 'close') close();
    if (a === 'check') check();
    if (a === 'quit') {
      if (game && !game.over && !confirm(L('離開這一局？這局不會計分。', "Quit this game? It won't be scored."))) return;
      close();
    }
  }
  // 測試用
  const _t = { get game() { return game; }, check, fall, end, toPts, fill, get fingerX() { return fingerX; } };
  return { card, open, close, _t };
})();
