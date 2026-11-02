// ═══════════════════════════════════════════════════════
//  獎勵遊戲 #9：Word Beat（節奏太鼓）— 原型 v0.1
//  規格：專案文件 claude/英文島-獎勵遊戲總覽.md「第 9 款」
//  解鎖：精熟 9 個單元（試玩：網址加 ?try=beat，不用解鎖、不計分；THP11 由驚喜開放）
//  規則：一首 3 分鐘的歌（三段，越來越快）。音符從右邊滑到判定圈：
//        🔴 紅色點畫面左半邊、🔵 藍色點右半邊；⭐ 金色單字音符點哪邊都可以，會唸出單字。
//        判定：好（GREAT）／可（GOOD）／不可（MISS），連續打中有 combo。
//        連續 5 次沒打中或打錯 → 音樂暫停，回答一題聽力題，答完繼續。
//        音樂用 Web Audio 即時合成（沒有音檔、沒有版權問題）；開局前可以校準耳機延遲。
//  依賴 index.html 的全域：st, $, esc, L, EN, meaning, speak, getAudio, browserSpeak, answersOf, shuffle,
//        todayKey, clockCheck, saveLedger, saveMeta, afterPoints, points, gameWeekBestAll, gameCard, masteredCount, GAMES, toast, confetti
// ═══════════════════════════════════════════════════════
const WBT = (() => {
  const ID = 'beat', NEED = 9, VER = '0.2';
  const UNIT = 'U9';
  const CAP = 20, S_PER_PT = 150;          // 暫定 3000 分滿 20 ⭐，等實玩校準
  const GREAT = 0.075, GOOD = 0.15;        // 判定窗（秒）
  const PTS = { great: 10, good: 5, word: 30, quiz: 20 };
  const BOTH = 0.1;                       // 金色單字音符：左右兩下要在 0.1 秒內一起按（Jeffrey 2026/11/02）
  const MISS_RUN = 5;                      // 連續幾次失誤跳聽力題
  const SPEED = 230;                       // 音符移動速度（邏輯 px/秒）
  const JX = 70;                           // 判定圈 x
  const LEAD = 2.4;                        // 開始前的空拍（秒）
  const N_WORDS = 8;                       // 預先下載幾個單字的發音
  // 三段：每段約 1 分鐘，速度越來越快
  const SECTIONS = [{ bpm: 100, bars: 25, lv: 0 }, { bpm: 115, bars: 29, lv: 1 }, { bpm: 130, bars: 32, lv: 2 }];
  // 每小節 8 個八分音符位置；依難度挑節奏型
  const PAT = [
    [[0, 2, 4, 6], [0, 4, 6], [0, 2, 4], [0, 2, 6], [0, 4]],
    [[0, 2, 3, 4, 6], [0, 1, 2, 4, 6], [0, 2, 4, 5, 6], [0, 2, 4, 6, 7], [0, 2, 4, 6]],
    [[0, 1, 2, 4, 5, 6], [0, 2, 3, 4, 6, 7], [0, 1, 2, 3, 4, 6], [0, 2, 3, 4, 5, 6], [0, 2, 4, 5, 6, 7]],
  ];
  // 和弦進行 C–G–Am–F（MIDI 根音）
  const CHORDS = [[48, [0, 4, 7]], [43, [0, 4, 7]], [45, [0, 3, 7]], [41, [0, 4, 7]]];
  let cv, cx, root, S = 1, VH = 640;
  let game = null, raf = 0, trial = false, sched = 0;
  let ac = null, master = null, noiseBuf = null;

  const unlocked = () => (typeof gameOpen === 'function' ? gameOpen({ need: NEED }) : masteredCount() >= NEED);
  const ansOf = (w) => String(answersOf(w)[0] || w.word).toLowerCase();
  const okWord = (w) => w.type !== '片語' && /^[a-z]+$/.test(ansOf(w)) && ansOf(w).length >= 3 && ansOf(w).length <= 10;
  const wordPool = () => { const u = st.words.filter((w) => w.unit === UNIT && okWord(w)); return u.length >= 6 ? u : st.words.filter(okWord); };
  const toPts = (sc) => Math.min(CAP, Math.floor(sc / S_PER_PT));
  const card = () => gameCard({ id: ID, need: NEED, icon: '🥁', name: 'Word Beat' });
  const bestText = () => { const b = st.meta.games && st.meta.games[ID] && st.meta.games[ID].best; return b ? `Word Beat ${b}` : ''; };
  const short = (w) => String(meaning(w) || '').split(/[；;,，]/)[0].trim();
  const lag = () => (st.set && typeof st.set.beatLag === 'number' ? st.set.beatLag : 0);
  const rnd = (n) => Math.floor(Math.random() * n);

  // ═════ 聲音 ═════
  function audio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.6; master.connect(ac.destination); } catch (e) { return null; } }
    if (ac.state === 'closed') { ac = null; return audio(); }
    if (ac.state === 'suspended' && !(game && game.quiz)) ac.resume().catch(() => {});
    return ac;
  }
  function noise() {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function osc(t, f, dur, { type = 'sine', vol = 0.2, slide = 0, out = master } = {}) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.03);
  }
  function nz(t, dur, { f = 8000, q = 1, vol = 0.1, type = 'highpass' } = {}) {
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.03);
  }
  const INST = {
    kick: (t) => { osc(t, 150, 0.22, { vol: 0.55, slide: 0.3 }); },
    snare: (t) => { nz(t, 0.14, { f: 1800, type: 'bandpass', q: 0.8, vol: 0.32 }); osc(t, 220, 0.08, { type: 'triangle', vol: 0.12 }); },
    hat: (t, v = 0.05) => nz(t, 0.04, { f: 9000, vol: v }),
    bass: (t, m, d) => osc(t, hz(m), d, { type: 'sawtooth', vol: 0.11 }),
    lead: (t, m, d) => osc(t, hz(m), d, { type: 'square', vol: 0.045 }),
    pad: (t, m, d) => osc(t, hz(m), d, { type: 'triangle', vol: 0.05 }),
    count: (t, hi) => osc(t, hi ? 1320 : 880, 0.06, { type: 'square', vol: 0.08 }),
  };
  // 打擊回饋（馬上播）：紅＝咚（鼓面）、藍＝咔（鼓邊）
  function hitSnd(red) {
    if (!audio()) return; const t = ac.currentTime;
    if (red) { osc(t, 180, 0.12, { vol: 0.35, slide: 0.55 }); nz(t, 0.05, { f: 600, type: 'lowpass', vol: 0.2 }); }
    else { nz(t, 0.05, { f: 3500, type: 'bandpass', q: 3, vol: 0.4 }); osc(t, 900, 0.04, { type: 'square', vol: 0.06 }); }
  }

  // ═════ 譜面（音樂＋音符）═════
  function buildSong(words) {
    const ev = [], notes = [];
    let t = LEAD, bar = 0, wi = 0;
    // 開頭空拍：4 下倒數
    const b0 = 60 / SECTIONS[0].bpm;
    for (let i = 0; i < 4; i++) ev.push({ t: LEAD - b0 * (4 - i), k: 'count', hi: i === 3 });
    SECTIONS.forEach((sec, si) => {
      const beat = 60 / sec.bpm, e8 = beat / 2;
      for (let b = 0; b < sec.bars; b++, bar++) {
        const [rootM, tri] = CHORDS[bar % 4];
        const wordBar = bar >= 3 && bar % 4 === 3 && words.length;
        // 鼓
        for (let k = 0; k < 8; k++) {
          const tt = t + k * e8;
          ev.push({ t: tt, k: 'hat', v: k % 2 ? 0.035 : 0.06 });
          if (k === 0 || k === 4 || (sec.lv === 2 && k === 3)) ev.push({ t: tt, k: 'kick' });
          if (k === 2 || k === 6) ev.push({ t: tt, k: 'snare' });
        }
        // 貝斯
        [0, 4, 6].forEach((k, i) => ev.push({ t: t + k * e8, k: 'bass', m: rootM + (i === 2 ? 7 : 0), d: e8 * (i === 2 ? 1.8 : 3.6) }));
        // 旋律（單字小節只留和弦墊底，讓單字聽得清楚）
        if (wordBar) ev.push({ t, k: 'pad', m: rootM + 24 + tri[1], d: beat * 4 });
        else {
          const step = sec.lv === 0 ? 2 : 1;
          for (let k = 0; k < 8; k += step) {
            const n = tri[(k / step + bar) % 3] + 60 + (CHORDS[bar % 4][0] - 48) + (sec.lv === 2 && k % 4 === 3 ? 12 : 0);
            ev.push({ t: t + k * e8, k: 'lead', m: n, d: e8 * step * 0.9 });
          }
        }
        // 音符
        if (wordBar) {
          const w = words[wi++ % words.length];
          notes.push({ t, c: 'w', w, id: notes.length });
          ev.push({ t, k: 'voice', w });
        } else if (bar > 0) {
          const P = PAT[sec.lv], lvl = sec.lv === 0 && b > 14 ? PAT[1] : P;   // 第一段後半偶爾出中等節奏
          const pat = lvl[rnd(lvl.length)];
          let last = rnd(2);
          pat.forEach((k) => { if (Math.random() < 0.38) last = 1 - last; notes.push({ t: t + k * e8, c: last ? 'b' : 'r', id: notes.length }); });
        }
        t += beat * 4;
      }
    });
    return { ev: ev.sort((a, b) => a.t - b.t), notes, dur: t + 1.2 };
  }
  // 往前排 0.15 秒內的聲音（AudioContext 暫停時時間不走，自然停下）
  function pump() {
    const g = game; if (!g || g.over || !ac) return;
    const horizon = ac.currentTime - g.t0 + 0.15;
    while (g.ei < g.song.ev.length && g.song.ev[g.ei].t <= horizon) {
      const e = g.song.ev[g.ei++], at = Math.max(ac.currentTime, g.t0 + e.t);
      if (e.k === 'voice') voice(e.w, at);
      else if (INST[e.k]) INST[e.k](at, e.m != null ? e.m : e.hi != null ? e.hi : e.v, e.d);
    }
  }
  function voice(w, at) {
    const buf = game.bufs[ansOf(w)];
    if (buf) { const s = ac.createBufferSource(), g = ac.createGain(); g.gain.value = 1.4; s.buffer = buf; s.connect(g); g.connect(master); s.start(at); }
    else setTimeout(() => { try { browserSpeak(ansOf(w)); } catch (e) {} }, Math.max(0, (at - ac.currentTime) * 1000));
  }

  // ═════ 畫面 ═════
  function mount() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'wj wbt';
    root.innerHTML = `<canvas></canvas>
      <div class="wbt-word" id="wbtWord"></div>
      <div class="wj-hud"><button class="wj-x" data-wbt="quit">✕</button>
        <span class="wj-t" id="wbtT">3:00</span><span class="wj-h" id="wbtS">0</span><span class="wj-p" id="wbtP">⭐ 0</span></div>
      <div class="wj-pane" id="wbtPane"></div>`;
    document.body.appendChild(root);
    if (!document.getElementById('wbtCss')) {
      const s = document.createElement('style'); s.id = 'wbtCss';
      s.textContent = `.wbt .wj-hud span{white-space:nowrap;font-size:14px;padding:4px 9px}
        .wbt-word{position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 70px);text-align:center;pointer-events:none;z-index:2}
        .wbt-word b{display:inline-block;font:800 40px Syne,system-ui,sans-serif;color:#FFD23F;text-shadow:0 0 22px rgba(255,210,63,.7);animation:wbtPop .35s}
        .wbt-word small{display:block;font-size:15px;color:#c6d1c6;margin-top:2px}
        @keyframes wbtPop{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.15)}}
        .wbt-demo{display:flex;justify-content:center;gap:12px;margin:8px 0}
        .wbt-demo span{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font-weight:800;color:#fff;border:3px solid #fff}
        .wbt-cal{width:150px;height:150px;border-radius:50%;margin:18px auto;border:4px solid #4ECDC4;display:grid;place-items:center;font:800 40px Syne,sans-serif;color:#fff;transition:transform .08s,background .08s}
        .wbt-cal.on{transform:scale(1.12);background:#4ECDC4;color:#0a1a1a}
        .wbt-opts{display:flex;flex-direction:column;gap:8px;margin:12px 0 16px}
        .wbt-opts .opt{font-size:18px;text-align:center}
        .wbt-load{height:8px;border-radius:4px;background:#2a3048;overflow:hidden;margin:14px 0}.wbt-load i{display:block;height:100%;background:#CCFF00;transition:width .2s}`;
      document.head.appendChild(s);
    }
    cv = root.querySelector('canvas'); cx = cv.getContext('2d');
    root.addEventListener('click', onClick);
    cv.addEventListener('pointerdown', onTap);
    addEventListener('keydown', onKey);
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => { if (document.hidden && game && !game.over && !game.quiz && ac && game.started) { game.paused = true; ac.suspend().catch(() => {}); showPause(); } });
  }
  function resize() {
    if (!root) return;
    const w = root.clientWidth, h = root.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    S = (w * dpr) / 360; VH = (h * dpr) / S;
  }
  const pane = (html) => { const p = root.querySelector('#wbtPane'); p.innerHTML = html; p.style.display = html ? '' : 'none'; };
  const laneY = () => VH * 0.42;

  // ── 開始畫面 ──
  function open(opts) {
    trial = !!(opts && opts.trial);
    if (!trial && !unlocked()) return toast(L(`精熟 ${NEED} 個單元後解鎖`, `Master ${NEED} units to unlock`));
    if (wordPool().length < 4) return toast(L('單字太少，還不能玩', 'Not enough words yet'));
    mount(); root.classList.add('show'); resize();
    document.body.style.overflow = 'hidden';
    $('wbtWord').innerHTML = '';
    const best = gameWeekBestAll(), pb = (st.meta.games && st.meta.games[ID] && st.meta.games[ID].best) || 0;
    pane(`<div class="wj-card">
      <div class="wj-ic">🥁</div>
      <h2>Word Beat</h2>
      <p>${L('跟著音樂打鼓，還會聽到這個單元的單字！', 'Drum to the music and hear your unit words!')}</p>
      <div class="wbt-demo"><span style="background:#FF5A5A">${L('左', 'L')}</span><span style="background:#3FA8FF">${L('右', 'R')}</span><span style="background:#FFD23F;color:#1a1a1a;width:auto;padding:0 12px;border-radius:23px">⭐ ${L('左＋右', 'L+R')}</span></div>
      <div class="wj-rules">
        <div>🔴 ${L('紅色音符到圈圈時，點<b>畫面左半邊</b>', 'Red note: tap the <b>left half</b>')}</div>
        <div>🔵 ${L('藍色音符點<b>右半邊</b>（鍵盤：F＝左、J＝右）', 'Blue note: tap the <b>right half</b> (keys F / J)')}</div>
        <div>⭐ ${L('金色單字音符：聽到單字時，<b>左右兩邊一起按</b>（兩隻手同時點），分數比較多', 'Gold word note: when you hear the word, hit <b>BOTH sides together</b> — bonus points')}</div>
        <div>🎯 ${L('越準越高分：好（GREAT）＞ 可（GOOD）；連續打中有 combo', 'GREAT > GOOD; keep a combo going')}</div>
        <div>👂 ${L(`連續 ${MISS_RUN} 次沒打中，音樂會暫停，回答一題聽力題再繼續`, `Miss ${MISS_RUN} in a row and the music stops for a listening question`)}</div>
        <div>🎵 ${L('一首歌 3 分鐘，分三段，越來越快', 'One 3-minute song in three parts, getting faster')}</div>
        <div>⭐ ${trial ? L('試玩模式：不計分', 'Trial: not scored') : L(`每 ${S_PER_PT} 分 1 顆星，最多 ${CAP}；所有遊戲每週只算最高一局`, `1 ⭐ per ${S_PER_PT} points, up to ${CAP}; best game of the week counts`)}</div>
      </div>
      <p class="wj-small">🎧 ${L('戴耳機或覺得聲音慢半拍？先校準一次（會記住）', 'Using headphones or sound feels late? Calibrate once (saved)')}：<b>${L(`目前延遲 ${Math.round(lag() * 1000)} 毫秒`, `now ${Math.round(lag() * 1000)} ms`)}</b></p>
      <p class="wj-small">${trial ? L('🧪 試玩版', '🧪 Trial') : L(`本週遊戲最佳 ${best} / ${CAP} ⭐・個人最高 ${pb} 分`, `Best this week ${best} / ${CAP} ⭐ · Personal best ${pb}`)}<br><span style="opacity:.5">v${VER}</span></p>
      <div class="btnrow"><button class="btn" data-wbt="start">${L('開始 Start ▶', 'Start ▶')}</button><button class="btn ghost" data-wbt="cal">🎧 ${L('校準', 'Calibrate')}</button><button class="btn ghost" data-wbt="close">${L('離開', 'Exit')}</button></div>
    </div>`);
    game = null; drawBg();
  }
  function close() {
    cancelAnimationFrame(raf); clearInterval(sched); clearInterval(cal.timer);
    if (game) game.over = true; game = null;
    if (ac && ac.state === 'running') ac.suspend().catch(() => {});
    if (root) root.classList.remove('show');
    document.body.style.overflow = '';
  }

  // ── 延遲校準：跟著 8 下節拍點螢幕，算出平均慢多少 ──
  const cal = { taps: [], clicks: [], timer: 0, on: false };
  function startCal() {
    if (!audio()) return;
    ac.resume().catch(() => {});
    cal.taps = []; cal.clicks = []; cal.on = true;
    const gap = 0.6, t0 = ac.currentTime + 1;
    for (let i = 0; i < 10; i++) { const t = t0 + i * gap; cal.clicks.push(t); osc(t, i < 2 ? 660 : 990, 0.07, { type: 'square', vol: 0.15 }); }
    pane(`<div class="wj-card"><div class="wj-kicker">🎧 ${L('延遲校準', 'Latency check')}</div>
      <p>${L('聽到「嗶」的時候，點下面的圓圈（共 10 下）', 'Tap the circle on each beep (10 beeps)')}</p>
      <button class="wbt-cal" data-wbt="caltap" id="wbtCal">♪</button>
      <p class="wj-small" id="wbtCalN">0 / 10</p>
      <div class="btnrow"><button class="btn ghost" data-wbt="calcancel">${L('取消', 'Cancel')}</button></div></div>`);
    clearInterval(cal.timer);
    cal.timer = setInterval(() => {   // 圓圈跟著聲音閃（畫面提示，用目前的延遲設定對齊）
      const el = $('wbtCal'); if (!el) return clearInterval(cal.timer);
      const now = ac.currentTime - lag(); el.classList.toggle('on', cal.clicks.some((c) => now >= c && now < c + 0.12));
      if (ac.currentTime > cal.clicks[cal.clicks.length - 1] + 1) finishCal();
    }, 16);
  }
  function calTap() {
    if (!cal.on) return;
    cal.taps.push(ac.currentTime);
    const n = $('wbtCalN'); if (n) n.textContent = `${Math.min(10, cal.taps.length)} / 10`;
  }
  function finishCal() {
    clearInterval(cal.timer); if (!cal.on) return; cal.on = false;
    const d = cal.taps.map((t) => { const c = cal.clicks.reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a)); return t - c; }).filter((x) => x > -0.2 && x < 0.45).sort((a, b) => a - b);
    let msg;
    if (d.length >= 5) {
      const med = d[Math.floor(d.length / 2)];
      st.set.beatLag = Math.max(0, Math.min(0.35, Math.round(med * 1000) / 1000));
      if (typeof saveSet === 'function') saveSet();
      msg = L(`完成！延遲 ${Math.round(st.set.beatLag * 1000)} 毫秒，已經記住`, `Done! ${Math.round(st.set.beatLag * 1000)} ms saved`);
    } else msg = L('點的次數不夠，再試一次', 'Not enough taps — try again');
    toast(msg); open({ trial });
  }

  // ── 開始：先下載單字發音，再開歌 ──
  async function start() {
    if (!audio()) return toast(L('這台裝置不能播放音樂', 'Audio not supported'));
    await ac.resume().catch(() => {});
    const words = shuffle(wordPool()).slice(0, N_WORDS);
    pane(`<div class="wj-card"><div class="wj-kicker">🎵 ${L('準備音樂和單字…', 'Getting the music ready…')}</div>
      <div class="wbt-load"><i id="wbtLoad" style="width:0"></i></div><p class="wj-small" id="wbtLoadN">0 / ${words.length}</p></div>`);
    const bufs = {}; let done = 0;
    const one = async (w) => {
      try {
        const blob = await Promise.race([getAudio(ansOf(w), true), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000))]);
        const ab = await blob.arrayBuffer();
        bufs[ansOf(w)] = await new Promise((res, rej) => ac.decodeAudioData(ab, res, rej));
      } catch (e) {}
      done++; const el = $('wbtLoad'); if (el) { el.style.width = (done / words.length * 100) + '%'; $('wbtLoadN').textContent = `${done} / ${words.length}`; }
    };
    await Promise.race([Promise.all(words.map(one)), new Promise((r) => setTimeout(r, 12000))]);
    if (!root.classList.contains('show')) return;   // 等待時按了離開
    const song = buildSong(words);
    pane(''); $('wbtWord').innerHTML = '';
    game = { song, bufs, words, score: 0, combo: 0, maxCombo: 0, great: 0, good: 0, miss: 0, wordHits: 0, quizRight: 0, quizzes: 0,
      missRun: 0, ni: 0, ei: 0, fx: [], pads: { r: 0, b: 0 }, over: false, quiz: null, started: true, paused: false, t0: ac.currentTime + 0.1 };
    clearInterval(sched); sched = setInterval(pump, 25); pump();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }
  const songT = () => ac.currentTime - game.t0;   // 現在歌曲進行到幾秒（聲音排程時間）

  // ── 打鼓 ──
  function onTap(e) {
    if (!game || game.over || game.quiz || game.paused) return;
    e.preventDefault();
    const r = cv.getBoundingClientRect();
    hit((e.clientX - r.left) < r.width / 2 ? 'r' : 'b');
  }
  function onKey(e) {
    if (!root || !root.classList.contains('show') || !game || game.over || game.quiz) return;
    const k = e.key.toLowerCase();
    if (k === 'f' || k === 'd') hit('r'); else if (k === 'j' || k === 'k') hit('b');
  }
  function hit(side) {
    const g = game, t = songT() - lag();
    g.pads[side] = performance.now(); hitSnd(side === 'r');
    // 找判定窗裡最早、還沒判定的音符
    let n = null;
    for (let i = g.ni; i < g.song.notes.length; i++) {
      const x = g.song.notes[i]; if (x.t - t > GOOD) break;
      if (!x.done && Math.abs(x.t - t) <= GOOD) { n = x; break; }
    }
    if (!n) return;   // 沒有音符：空打不扣分
    if (n.c === 'w') {   // 金色單字音符：左右一起按才算
      n.hits = n.hits || {};
      if (n.hits[side] == null) n.hits[side] = t;
      const o = side === 'r' ? 'b' : 'r';
      if (n.hits[o] != null && Math.abs(n.hits[o] - n.hits[side]) <= BOTH) {
        n.done = true;
        const tt = Math.min(n.hits.r, n.hits.b);
        judge(n, Math.abs(n.t - tt) <= GREAT ? 'great' : 'good');
      }
      return;
    }
    n.done = true;
    const dt = Math.abs(n.t - t);
    if (n.c !== 'w' && n.c !== side) return judge(n, 'miss', true);   // 打錯邊
    judge(n, dt <= GREAT ? 'great' : 'good');
  }
  function judge(n, res, wrong) {
    const g = game;
    if (res === 'miss') {
      g.miss++; g.combo = 0; g.missRun++;
      const half = n.c === 'w' && n.hits && Object.keys(n.hits).length;   // 金色只按了一邊
      g.fx.push({ txt: wrong ? L('打錯邊', 'Wrong side') : half ? L('要兩邊一起按！', 'Hit BOTH sides!') : L('不可', 'MISS'), col: '#FF6B57', t: performance.now() });
      if (g.missRun >= MISS_RUN) startQuiz();
      return;
    }
    g.missRun = 0; g.combo++; g.maxCombo = Math.max(g.maxCombo, g.combo);
    let p = res === 'great' ? PTS.great : PTS.good;
    if (n.c === 'w') { p = PTS.word * (res === 'great' ? 1 : 0.5); g.wordHits++; }
    p += Math.min(5, Math.floor(g.combo / 20));   // combo 加成：每 20 combo 每下多 1 分，最多 +5（機器人全對約 5000 分）
    g.score += Math.round(p); g[res]++;
    g.fx.push({ txt: res === 'great' ? L('好！', 'GREAT') : L('可', 'GOOD'), col: res === 'great' ? '#FFD23F' : '#4ECDC4', t: performance.now(), burst: n.c });
  }

  // ── 連續失誤 → 聽力題（音樂暫停）──
  function startQuiz() {
    const g = game, pool = wordPool(), w = g.words[rnd(g.words.length)] || pool[rnd(pool.length)];
    const others = shuffle(pool.filter((x) => short(x) && short(x) !== short(w))).slice(0, 2);
    const opts = shuffle([w, ...others]);
    g.quiz = { w, opts, a: opts.indexOf(w), done: false }; g.quizzes++;
    ac.suspend().catch(() => {});
    pane(`<div class="wj-card"><div class="wj-kicker">👂 ${L('休息一下！聽聽看', 'Quick break! Listen')}</div>
      <p>${L('這個單字是什麼意思？', 'What does this word mean?')}</p>
      <button class="spk" data-wbt="qsay" style="margin:6px auto;display:block">🔊</button>
      <div class="wbt-opts">${opts.map((o, i) => `<button class="opt" data-wbt="qans" data-i="${i}">${esc(short(o))}</button>`).join('')}</div></div>`);
    setTimeout(() => speak(ansOf(w)), 250);
  }
  function quizAnswer(i) {
    const g = game, q = g.quiz; if (!q || q.done) return;
    q.done = true;
    const ok = i === q.a; if (ok) { g.quizRight++; g.score += PTS.quiz; }
    root.querySelectorAll('[data-wbt="qans"]').forEach((b, k) => { b.disabled = true; if (k === q.a) b.classList.add('ok'); else if (k === i) b.classList.add('bad'); });
    root.querySelector('.wbt-opts').insertAdjacentHTML('afterend', `<p style="font-size:18px;font-weight:800">${esc(ansOf(q.w))}・${esc(short(q.w))} ${ok ? `✅ +${PTS.quiz}` : ''}</p>`);
    speak(ansOf(q.w));
    setTimeout(resumeSong, 1600);
  }
  function resumeSong() {
    const g = game; if (!g || g.over) return;
    // 接下來 1.2 秒內的音符直接略過，給一點準備時間
    const t = songT();
    g.song.notes.forEach((n) => { if (!n.done && n.t < t + 1.2) { n.done = true; n.skip = true; } });
    g.quiz = null; g.paused = false; g.missRun = 0; pane('');
    ac.resume().catch(() => {});
  }
  function showPause() {
    pane(`<div class="wj-card"><div class="wj-kicker">⏸️ ${L('暫停', 'Paused')}</div><div class="btnrow"><button class="btn" data-wbt="resume">${L('繼續', 'Resume')}</button></div></div>`);
  }

  // ── 主迴圈 ──
  function loop() {
    raf = requestAnimationFrame(loop);
    const g = game; if (!g || g.over) return;
    const t = songT() - lag();
    if (!g.quiz && !g.paused) {
      // 漏掉的音符
      while (g.ni < g.song.notes.length) {
        const n = g.song.notes[g.ni];
        if (n.done) { g.ni++; continue; }
        if (t - n.t > GOOD) { n.done = true; g.ni++; judge(n, 'miss'); if (g.quiz) break; continue; }
        break;
      }
      // 單字出現在上方（聲音播出的那一小節）
      const wn = g.song.notes.find((n) => n.c === 'w' && t >= n.t - 0.05 && t < n.t + 1.6);
      const key = wn ? wn.id : -1;
      if (key !== g.wordShown) { g.wordShown = key; $('wbtWord').innerHTML = wn ? `<b>${esc(ansOf(wn.w))}</b><small>${esc(short(wn.w))}</small>` : ''; }
      if (songT() >= g.song.dur) return end();
    }
    hud(); draw(t);
  }
  function hud() {
    const g = game, left = Math.max(0, Math.ceil(g.song.dur - Math.max(0, songT())));
    $('wbtT').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    $('wbtS').textContent = g.score; $('wbtP').textContent = `⭐ ${toPts(g.score)}`;
  }
  function drawBg() {
    if (!cx) return;
    cx.setTransform(S, 0, 0, S, 0, 0);
    const gr = cx.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, '#1b1036'); gr.addColorStop(1, '#0a0a14');
    cx.fillStyle = gr; cx.fillRect(0, 0, 360, VH);
  }
  function drum(x, y, r, col, lit) {
    cx.save(); cx.translate(x, y);
    cx.fillStyle = lit ? '#fff' : col; cx.globalAlpha = lit ? 0.95 : 0.9;
    cx.beginPath(); cx.ellipse(0, 0, r, r * 0.42, 0, 0, Math.PI * 2); cx.fill();
    cx.globalAlpha = 1; cx.lineWidth = 4; cx.strokeStyle = 'rgba(255,255,255,.8)'; cx.stroke();
    cx.restore();
  }
  function draw(t) {
    const g = game, Y = laneY(), now = performance.now();
    drawBg();
    const sec = g.song;
    // 跑道
    cx.fillStyle = 'rgba(255,255,255,.06)'; cx.fillRect(0, Y - 34, 360, 68);
    cx.strokeStyle = 'rgba(255,255,255,.15)'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, Y - 34); cx.lineTo(360, Y - 34); cx.moveTo(0, Y + 34); cx.lineTo(360, Y + 34); cx.stroke();
    // 判定圈
    const lastFx = g.fx[g.fx.length - 1], pulse = lastFx && now - lastFx.t < 120 && lastFx.burst;
    cx.lineWidth = 4; cx.strokeStyle = pulse ? '#FFD23F' : 'rgba(255,255,255,.7)';
    cx.beginPath(); cx.arc(JX, Y, 26, 0, Math.PI * 2); cx.stroke();
    cx.lineWidth = 2; cx.strokeStyle = 'rgba(255,255,255,.3)'; cx.beginPath(); cx.arc(JX, Y, 18, 0, Math.PI * 2); cx.stroke();
    // 音符（後面的先畫）
    for (let i = sec.notes.length - 1; i >= g.ni; i--) {
      const n = sec.notes[i]; if (n.done) continue;
      const x = JX + (n.t - t) * SPEED; if (x > 400) continue; if (x < -40) continue;
      if (n.c === 'w') {
        cx.fillStyle = '#FFD23F'; cx.strokeStyle = '#fff'; cx.lineWidth = 3;
        cx.beginPath(); cx.arc(x, Y, 26, 0, Math.PI * 2); cx.fill(); cx.stroke();
        cx.fillStyle = '#1a1a1a'; cx.font = '800 22px system-ui'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('★', x, Y + 1);
        cx.fillStyle = '#FFD23F'; cx.font = '800 15px Syne, system-ui, sans-serif'; cx.fillText(ansOf(n.w), x, Y - 44);
        cx.font = '800 12px "Noto Sans TC", system-ui'; cx.fillText(L('◀ 一起 ▶', '◀ BOTH ▶'), x, Y + 42);
        if (n.hits) { cx.fillStyle = '#fff'; Object.keys(n.hits).forEach((k) => { cx.beginPath(); cx.arc(x + (k === 'r' ? -12 : 12), Y + 18, 4, 0, Math.PI * 2); cx.fill(); }); }
      } else {
        cx.fillStyle = n.c === 'r' ? '#FF5A5A' : '#3FA8FF'; cx.strokeStyle = '#fff'; cx.lineWidth = 3;
        cx.beginPath(); cx.arc(x, Y, 19, 0, Math.PI * 2); cx.fill(); cx.stroke();
        cx.fillStyle = 'rgba(255,255,255,.35)'; cx.beginPath(); cx.arc(x - 6, Y - 6, 6, 0, Math.PI * 2); cx.fill();
      }
    }
    // 判定文字＋combo
    g.fx = g.fx.filter((f) => now - f.t < 500);
    const f = g.fx[g.fx.length - 1];
    if (f) { const k = (now - f.t) / 500; cx.globalAlpha = 1 - k; cx.fillStyle = f.col; cx.font = '800 22px Syne, "Noto Sans TC", system-ui'; cx.textAlign = 'center'; cx.fillText(f.txt, JX + 20, Y - 52 - k * 14); cx.globalAlpha = 1; }
    if (g.combo >= 3) { cx.fillStyle = g.combo >= 30 ? '#FFD23F' : '#CCFF00'; cx.font = '800 30px Syne, system-ui'; cx.textAlign = 'center'; cx.fillText(`${g.combo}`, 230, Y + 82); cx.font = '700 12px Syne, system-ui'; cx.fillText('COMBO', 230, Y + 100); }
    // 失誤計數（滿 5 跳聽力題）
    for (let i = 0; i < MISS_RUN; i++) { cx.fillStyle = i < g.missRun ? '#FF6B57' : 'rgba(255,255,255,.15)'; cx.beginPath(); cx.arc(JX - 24 + i * 12, Y + 52, 4, 0, Math.PI * 2); cx.fill(); }
    // 兩個鼓（點左邊紅、右邊藍）
    const DY = VH * 0.8;
    drum(90, DY, 70, '#FF5A5A', now - g.pads.r < 90);
    drum(270, DY, 70, '#3FA8FF', now - g.pads.b < 90);
    cx.fillStyle = 'rgba(255,255,255,.85)'; cx.font = '800 16px "Noto Sans TC", system-ui'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(L('左 紅', 'L · RED'), 90, DY); cx.fillText(L('右 藍', 'R · BLUE'), 270, DY);
    cx.strokeStyle = 'rgba(255,255,255,.08)'; cx.setLineDash([6, 8]); cx.beginPath(); cx.moveTo(180, Y + 120); cx.lineTo(180, VH); cx.stroke(); cx.setLineDash([]);
    // 段落提示
    const tt = songT();
    if (tt < LEAD) { cx.fillStyle = '#fff'; cx.font = '800 26px Syne, system-ui'; cx.fillText(L('準備…', 'Ready…'), 180, Y + 140); }
  }

  // ── 結束 ──
  function end() {
    const g = game; if (!g || g.over) return;
    g.over = true; clearInterval(sched); cancelAnimationFrame(raf);
    setTimeout(() => { if (ac && (!game || game.over)) ac.suspend().catch(() => {}); }, 1500);
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
      gm.combo = Math.max(gm.combo || 0, g.maxCombo);
      saveLedger(); saveMeta();
      gain = Math.max(0, pts - prev);
      afterPoints(before);
      if (gain) setTimeout(() => confetti(gain >= 10 ? 90 : 50), 150);
    }
    hud(); $('wbtWord').innerHTML = '';
    const total = g.great + g.good + g.miss, acc = total ? Math.round((g.great + g.good * 0.5) / total * 100) : 0;
    pane(`<div class="wj-card">
      <div class="wj-kicker">🎵 ${L('歌曲結束！', 'Song complete!')}</div>
      <div class="wj-big">${sc}</div>
      <div class="wj-small">${trial ? L('🧪 試玩模式，不計分', '🧪 Trial — not scored') : record ? L('🆕 個人最高紀錄！', '🆕 New personal best!') : L(`個人最高 ${best} 分`, `Personal best ${best}`)}<br>
        ${L(`好 ${g.great}・可 ${g.good}・不可 ${g.miss}・最高 ${g.maxCombo} combo・準確度 ${acc}%<br>單字音符 ${g.wordHits} 個・聽力題 ${g.quizRight} / ${g.quizzes}`, `GREAT ${g.great} · GOOD ${g.good} · MISS ${g.miss} · max combo ${g.maxCombo} · ${acc}%<br>Word notes ${g.wordHits} · listening ${g.quizRight} / ${g.quizzes}`)}</div>
      <div class="wj-pts">⭐ ${pts} / ${CAP}</div>
      ${trial ? '' : gain ? `<div class="gain">+${gain} ⭐</div>`
        : `<div class="gain zero">${prev >= CAP ? L('本週遊戲已經拿滿 20 分，現在純粹挑戰紀錄 🎮', 'You already got 20 this week — playing for records now 🎮')
          : L(`本週遊戲最佳是 ${prev} 分，超過才會再加分`, `Your best this week is ${prev} — beat it to earn more`)}</div>`}
      <div class="btnrow" style="margin-top:14px"><button class="btn" data-wbt="start">${L('再玩一次', 'Play again')}</button><button class="btn ghost" data-wbt="close">${L('離開', 'Exit')}</button></div>
    </div>`);
  }

  function onClick(e) {
    const t = e.target.closest('[data-wbt]'); if (!t) return;
    const a = t.dataset.wbt;
    if (a === 'start') { audio(); if (typeof unlockAudio === 'function') unlockAudio(); start(); }
    if (a === 'close') close();
    if (a === 'cal') startCal();
    if (a === 'caltap') calTap();
    if (a === 'calcancel') { clearInterval(cal.timer); cal.on = false; open({ trial }); }
    if (a === 'qsay' && game && game.quiz) speak(ansOf(game.quiz.w));
    if (a === 'qans') quizAnswer(+t.dataset.i);
    if (a === 'resume' && game) { game.paused = false; pane(''); ac.resume().catch(() => {}); }
    if (a === 'quit') {
      if (game && !game.over && !trial && !confirm(L('離開這一局？這局不會計分。', "Quit this game? It won't be scored."))) return;
      close();
    }
  }
  // 測試用
  const _t = { get game() { return game; }, buildSong, hit, startQuiz, quizAnswer, end, toPts, songT: () => songT(), get ac() { return ac; }, finishCal, cal };
  return { id: ID, need: NEED, card, bestText, open, close, _t };
})();
GAMES.push(WBT);
