// ═══════════════════════════════════════════════════════
//  獎勵遊戲：Word Orbs（單字轉珠）— 第一版（手感階段）
//  規格：專案文件 claude/轉珠遊戲-規格v0.2.md
//  解鎖：精熟 7 個單元（試玩：網址加 ?try=orbs，不用解鎖、不計分）
//  規則：3 分鐘、最多 9 關。按住一顆珠拖曳換位，手放開就攻擊（單手最多 20 秒）。
//        第 1–2 關是選項關：3 種顏色各代表一個選項，消到答案色、不碰錯誤選項色才過。
//        第 3 關起是盾牌關：完成轉珠條件。沒過關 → 字母方塊拼字 → 回同一關再轉。
//        分數換算 0～20，所有遊戲共用每週最高一局；超過 20 只記個人最高分。
//  依賴 index.html 的全域：st, $, esc, L, EN, meaning, speak, answersOf, shuffle, todayKey, clockCheck,
//        saveLedger, saveMeta, afterPoints, points, gameWeekBestAll, gameCard, masteredCount, GAMES, toast, confetti
// ═══════════════════════════════════════════════════════
const WO = (() => {
  const ID = 'orbs', NEED = 7, VER = '0.6';
  const UNIT = 'U7';                      // 題目單元（沒有這個單元就用全部單字）
  const TIME = 180, CAP = 20, S_PER_PT = 500;   // 10/31 Jeffrey 實玩 v0.2 打到第 7 關就 7000 分滿星 → 改成 10000 分滿 20
  const HAND = 20, SPELL = 15;            // 單手秒數、拼字秒數
  const COLS = 6, ROWS = 5, LW = 360, CELL = LW / COLS;
  const COMBO = 50, CLEAR = 200, COMBO_CAP = 15;
  const MULT = [1, 1, 1.2, 1.2, 1.5, 1.5, 2, 2, 3];
  const POP_MS = 320, FALL_MS = 340, COMBO_GAP = 240;   // 一個一個 combo 依序消（像神魔），比較有攻擊的爽感
  const SKILL_CD = 6, ARRANGE = 10, SKILL_COMBO = 0.5;  // 技能：每 6 次攻擊一次；自由排珠 10 秒；用技能那一手 combo 分數 ×0.5
  // 6 種珠：顏色＋圖案（色弱也分得出來）
  const ORB = [
    { c: '#FF5A5A', d: '#B8322F', g: '♥', n: ['紅', 'red'] },
    { c: '#3FA8FF', d: '#1F6FB8', g: '●', n: ['藍', 'blue'] },
    { c: '#5CD65C', d: '#2F8F2F', g: '▲', n: ['綠', 'green'] },
    { c: '#FFD23F', d: '#B8901F', g: '★', n: ['黃', 'yellow'] },
    { c: '#B48CFF', d: '#6E4FB8', g: '◆', n: ['紫', 'purple'] },
    { c: '#FF9AC1', d: '#C25C85', g: '✿', n: ['粉', 'pink'] },
  ];
  // 盾牌：test(hand, k) 只看玩家那一手（hand＝[{c, n, cells}]，每個 combo 一筆；k＝這面盾指定的顏色）
  const colorsOf = (h) => new Set(h.map((x) => x.c));
  // 形狀：相連同色剛好等於該形狀才算（旋轉、鏡像都算；多一顆就不算）
  const SHAPES = {
    line4: [[0, 0], [0, 1], [0, 2], [0, 3]],
    lshape: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
    tshape: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],
    cross: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
  };
  const normKey = (cells) => { const r0 = Math.min(...cells.map((x) => x[0])), c0 = Math.min(...cells.map((x) => x[1])); return cells.map(([r, c]) => `${r - r0},${c - c0}`).sort().join('|'); };
  // 每種形狀的所有轉向／鏡像（正規化成從 0,0 開始的格子）
  const VARIANTS = {};
  const norm = (cells) => { const r0 = Math.min(...cells.map((x) => x[0])), c0 = Math.min(...cells.map((x) => x[1])); return cells.map(([r, c]) => [r - r0, c - c0]); };
  Object.entries(SHAPES).forEach(([id, sh]) => {
    const out = {}; let cur = sh;
    for (let i = 0; i < 4; i++) { cur = cur.map(([r, c]) => [c, -r]); [cur, cur.map(([r, c]) => [r, -c])].forEach((v) => { const n = norm(v); out[normKey(n)] = n; }); }
    VARIANTS[id] = Object.values(out);
  });
  // 形狀盾：盤面上框出一個位置，同色珠要「剛好」填滿這個框才算（框外相連的同色也會讓它不成立）
  const cellKey = (cells) => cells.map(([r, c]) => r * COLS + c).sort((a, b) => a - b).join(',');
  function placeFrame(id) {
    const v = shuffle(VARIANTS[id].slice())[0], H = Math.max(...v.map((x) => x[0])) + 1, W2 = Math.max(...v.map((x) => x[1])) + 1;
    const r0 = rnd(ROWS - H + 1), c0 = rnd(COLS - W2 + 1);
    return v.map(([r, c]) => [r + r0, c + c0]);
  }
  const hasFrame = (h, frame) => { const k = cellKey(frame); return h.some((x) => cellKey(x.cells) === k); };
  const dot = (k) => `<span class="wo-dot sm" style="background:${ORB[k].c}">${ORB[k].g}</span>`;
  const SHIELD = {
    c2: { ic: '🔗', zh: '2 combo', en: '2 combos', tip: () => L('一手消出 2 組以上', 'Make 2+ matches in one move'), test: (h) => h.length >= 2 },
    c3: { ic: '🔗', zh: '3 combo', en: '3 combos', tip: () => L('一手消出 3 組以上', 'Make 3+ matches in one move'), test: (h) => h.length >= 3 },
    c5: { ic: '🔗', zh: '5 combo', en: '5 combos', tip: () => L('一手消出 5 組以上', 'Make 5+ matches in one move'), test: (h) => h.length >= 5 },
    k3: { ic: '🎨', zh: '3 色盾', en: '3 colors', tip: () => L('一手消到 3 種不同顏色', 'Clear 3 different colors in one move'), test: (h) => colorsOf(h).size >= 3 },
    k4: { ic: '🎨', zh: '4 色盾', en: '4 colors', tip: () => L('一手消到 4 種不同顏色', 'Clear 4 different colors in one move'), test: (h) => colorsOf(h).size >= 4 },
    cnt: { ic: '🔢', zh: '數量盾', en: 'Count', color: 1, tip: (k) => L(`一手消 ${dot(k)} 共 6 顆以上（幾組加起來都算）`, `Clear 6+ ${dot(k)} in one move (groups add up)`), test: (h, k) => h.filter((x) => x.c === k).reduce((a, x) => a + x.n, 0) >= 6 },
    ban: { ic: '🚫', zh: '禁色盾', en: 'No-color', color: 1, tip: (k) => L(`3 combo，而且不能消到 ${dot(k)}`, `3 combos without clearing ${dot(k)}`), test: (h, k) => h.length >= 3 && !h.some((x) => x.c === k) },
    line4: { ic: '', shape: 'line4', zh: '一字盾', en: 'Line of 4', tip: () => L('把同色珠轉進框框：剛好 4 顆排成一直線', 'Fill the frame: exactly 4 in a line'), test: (h, k, g) => hasFrame(h, g.frame) },
    lshape: { ic: '', shape: 'lshape', zh: 'L 形盾', en: 'L shape', tip: () => L('把同色珠轉進框框：剛好 5 顆的 L 形', 'Fill the L-shaped frame with one color'), test: (h, k, g) => hasFrame(h, g.frame) },
    tshape: { ic: '', shape: 'tshape', zh: 'T 形盾', en: 'T shape', tip: () => L('把同色珠轉進框框：剛好 5 顆的 T 形', 'Fill the T-shaped frame with one color'), test: (h, k, g) => hasFrame(h, g.frame) },
    cross: { ic: '', shape: 'cross', zh: '十字盾', en: 'Cross', tip: () => L('把同色珠轉進框框：剛好 5 顆的十字', 'Fill the cross frame with one color'), test: (h, k, g) => hasFrame(h, g.frame) },
  };
  // 9 關（第 1–2 關選項關；第 8 關 L／T 隨機；第 9 關魔王兩階段）
  const LEVELS = [
    { q: 'zh2en' }, { q: 'listen' },
    { s: ['c2'] }, { s: ['k3'] }, { s: ['cnt'] }, { s: ['line4'] }, { s: ['ban'] }, { s: ['lt'] },
    { s: ['c5', 'cross'], boss: true },
  ];
  // 技能（每 6 次攻擊三選一）
  const SKILLS = {
    paint: { ic: '🎨', zh: '隨機轉色', en: 'Recolor', tip: ['把 6 顆珠子變成需要的顏色', 'Turn 6 orbs into the color you need'] },
    rainbow: { ic: '🌈', zh: '六屬直排', en: 'Rainbow columns', tip: ['盤面變成每直排一種顏色', 'Each column becomes one color'] },
    ten: { ic: '🔟', zh: '10 combo 版面', en: '10-combo board', tip: ['盤面排好 10 組三連，直接放開就消', 'A board with 10 ready-made matches'] },
    free: { ic: '✋', zh: '自由排珠', en: 'Free arrange', tip: [`${ARRANGE} 秒內可以一直轉珠，放開不會攻擊，時間到才攻擊`, `Drag as many times as you like for ${ARRANGE}s; attack when time is up`] },
  };
  let cv, cx, root, S = 1, VH = 640, BT = 300;   // BT＝珠盤上緣（邏輯座標）
  let game = null, raf = 0, trial = false, drag = null;

  const unlocked = () => masteredCount() >= NEED;
  const okWord = (w) => w.type !== '片語' && /^[a-z]+$/i.test(answersOf(w)[0] || w.word) && (answersOf(w)[0] || w.word).length >= 3;
  const unitWords = () => { const u = st.words.filter((w) => w.unit === UNIT); return u.length >= 6 ? u : st.words; };
  const wordPool = () => unitWords().filter(okWord);
  const toPts = (sc) => Math.min(CAP, Math.floor(sc / S_PER_PT));
  const card = () => gameCard({ id: ID, need: NEED, icon: '🔮', name: 'Word Orbs' });
  const bestText = () => { const b = st.meta.games && st.meta.games[ID] && st.meta.games[ID].best; return b ? `Word Orbs ${b}` : ''; };
  const short = (w) => String(meaning(w) || '').split(/[；;,，]/)[0].trim();
  const now = () => performance.now();

  // ═════ 音效：Web Audio 即時合成（不用音檔）═════
  // 換珠「喀」、消除「啵」（combo 越多音越高）、落地「咚」、過關／失敗提示音
  let ac = null, master = null;
  const sndOn = () => !(st.set && st.set.orbsMute);
  function audio() {
    if (!ac) {
      try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination); } catch (e) { return null; }
    }
    // iOS 播過朗讀或切 App 後會變成 interrupted／suspended：不是 running 就叫醒；已關掉就重建
    if (ac.state === 'closed') { ac = null; return audio(); }
    if (ac.state !== 'running') ac.resume().catch(() => {});
    return ac;
  }
  let noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function tone(f, dur, { type = 'sine', vol = 0.3, at = 0, slide = 0 } = {}) {
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function click(freq, vol, dur = 0.05, at = 0) {   // 濾過的雜訊＝石頭／玻璃互撞
    const t = ac.currentTime + at, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 6;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02);
  }
  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33];
  const SFX = {
    swap() { click(2600 + Math.random() * 900, 0.5, 0.04); tone(1800 + Math.random() * 300, 0.035, { vol: 0.05, type: 'triangle' }); },
    pop(i, at) { const f = 520 * Math.pow(2, PENTA[Math.min(i, PENTA.length - 1)] / 12); tone(f, 0.16, { vol: 0.22, at, slide: 1.5 }); click(3800, 0.25, 0.03, at); },
    land() { tone(140, 0.09, { vol: 0.18, slide: 0.6 }); click(900, 0.15, 0.05); },
    win() { [0, 4, 7, 12].forEach((n, i) => tone(523 * Math.pow(2, n / 12), 0.18, { vol: 0.18, at: i * 0.08, type: 'triangle' })); },
    lose() { tone(220, 0.25, { vol: 0.15, type: 'sawtooth', slide: 0.7 }); },
    tile() { click(2000, 0.3, 0.03); tone(880, 0.06, { vol: 0.08 }); },
  };
  function sfx(name, ...a) { if (!sndOn()) return; if (!audio()) return; try { SFX[name](...a); } catch (e) {} }

  // ═════ 純邏輯（不碰畫面，可以用 Node 測）═════
  const rnd = (n) => Math.floor(Math.random() * n);
  function newBoard() {   // 開局盤面：不要一開始就有三連
    const b = [];
    for (let r = 0; r < ROWS; r++) {
      b.push([]);
      for (let c = 0; c < COLS; c++) {
        let k, t = 0;
        do { k = rnd(6); t++; } while (t < 20 && ((c >= 2 && b[r][c - 1] === k && b[r][c - 2] === k) || (r >= 2 && b[r - 1][c] === k && b[r - 2][c] === k)));
        b[r].push(k);
      }
    }
    return b;
  }
  // 找出所有 combo：橫或直 3 顆以上同色標記；相連的同色標記算同一個 combo
  function findCombos(b) {
    const mark = b.map((row) => row.map(() => false));
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const k = b[r][c]; if (k == null) continue;
      if (c + 2 < COLS && b[r][c + 1] === k && b[r][c + 2] === k) { let e = c; while (e < COLS && b[r][e] === k) mark[r][e++] = true; }
      if (r + 2 < ROWS && b[r + 1][c] === k && b[r + 2][c] === k) { let e = r; while (e < ROWS && b[e][c] === k) mark[e++][c] = true; }
    }
    const seen = mark.map((row) => row.map(() => false)), out = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (!mark[r][c] || seen[r][c]) continue;
      const k = b[r][c], cells = [], stack = [[r, c]]; seen[r][c] = true;
      while (stack.length) {
        const [y, x] = stack.pop(); cells.push([y, x]);
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dy, dx]) => {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS && mark[ny][nx] && !seen[ny][nx] && b[ny][nx] === k) { seen[ny][nx] = true; stack.push([ny, nx]); }
        });
      }
      out.push({ c: k, n: cells.length, cells });
    }
    return out;
  }
  // 落珠：每色至少約 8%；某色連續 8 顆沒出現就強制補它
  function dropColor(g) {
    const miss = g.miss;
    const starved = miss.findIndex((m) => m >= 8);
    const k = starved >= 0 ? starved : rnd(6);
    miss.forEach((_, i) => (miss[i] = i === k ? 0 : miss[i] + 1));
    return k;
  }
  // 判定這一關這一手
  function judge(lv, hand, g) {
    if (lv.q) {
      const opt = g.q.colors, ans = opt[g.q.a];
      const hit = hand.some((x) => x.c === ans), wrong = hand.some((x) => x.c !== ans && opt.includes(x.c));
      return { ok: hit && !wrong, why: wrong ? 'wrong' : hit ? '' : 'miss' };
    }
    return { ok: SHIELD[g.sid].test(hand, g.sk, g), why: 'shield' };
  }

  // ═════ 畫面 ═════
  function mount() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'wj wo';
    root.innerHTML = `<canvas></canvas>
      <div class="wo-top" id="woTop"></div>
      <div class="wj-hud"><button class="wj-x" data-wo="quit">✕</button>
        <span class="wo-snd" id="woSnd" data-wo="snd">🔊</span>
        <span class="wj-t" id="woT">3:00</span><span class="wj-h" id="woS">0</span><span class="wj-p" id="woP">⭐ 0</span></div>
      <button class="wo-sk" id="woSk" data-wo="skill" style="display:none">✨ 0/${SKILL_CD}</button>
      <div class="wj-pane" id="woPane"></div>`;
    document.body.appendChild(root);
    if (!document.getElementById('woFont')) {   // 拼字用 Andika：l／i／h／n 好分辨
      const f = document.createElement('link'); f.id = 'woFont'; f.rel = 'stylesheet';
      f.href = 'https://fonts.googleapis.com/css2?family=Andika:wght@700&display=swap'; document.head.appendChild(f);
    }
    if (!document.getElementById('woCss')) {
      const s = document.createElement('style'); s.id = 'woCss';
      s.textContent = `.wo .wj-hud span{white-space:nowrap;font-size:14px;padding:4px 9px}.wo .wj-hud .wj-t{font-size:12px;opacity:.75}.wo .wj-hud .wj-t.low{opacity:1}
        .wo .wj-hud .wo-snd{pointer-events:auto;cursor:pointer;font-size:14px}
        .wo-dot.sm{width:22px;height:22px;font-size:12px;display:inline-grid;vertical-align:-5px;margin:0 2px}
        .wo-shape{display:inline-grid;gap:2px;vertical-align:middle}.wo-shape i{width:12px;height:12px;border-radius:3px;background:#FFB547}.wo-shape i.o{background:transparent}
        .wo-sk{position:absolute;left:10px;z-index:3;border-radius:14px;border:2px solid #4a5068;background:#131826;color:#aab;font:800 13px Syne,'Noto Sans TC',sans-serif;padding:6px 12px}
        .wo-sk.ready{border-color:#CCFF00;color:#0a0a14;background:#CCFF00;animation:woGlow 1s ease-in-out infinite}
        @keyframes woGlow{50%{box-shadow:0 0 18px #CCFF00}}
        .wo-skills{display:flex;flex-direction:column;gap:10px;margin:14px 0}
        .wo-skills .btn{display:flex;align-items:center;gap:12px;text-align:left;border-color:#4ECDC4;padding:12px 14px}
        .wo-skills .btn span{font-size:28px}.wo-skills .btn small{display:block;font-size:12px;opacity:.75;font-weight:500}
        .wo-top{position:absolute;left:10px;right:10px;top:calc(env(safe-area-inset-top,0px) + 54px);z-index:2;text-align:center;pointer-events:none}
        .wo-top .lvname{font:800 13px Syne,sans-serif;color:#4ECDC4;letter-spacing:.06em}
        .wo-top .prompt{font-size:22px;font-weight:800;margin:4px 0 8px;line-height:1.3}
        .wo-top .prompt button{pointer-events:auto}
        .wo-opts{display:flex;flex-direction:column;gap:6px;align-items:stretch;max-width:320px;margin:0 auto}
        .wo-opt{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.15);border-radius:12px;padding:6px 10px;font-size:17px;font-weight:700;text-align:left}
        .wo-dot{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:15px;flex:none;box-shadow:inset 0 -3px 0 rgba(0,0,0,.25)}
        .wo-shield{display:inline-flex;flex-direction:column;align-items:center;gap:2px;background:rgba(255,255,255,.06);border:2px solid #FFB547;border-radius:16px;padding:10px 18px}
        .wo-shield b{font-size:24px}.wo-shield span{font-size:20px;font-weight:800;color:#FFB547}.wo-shield small{font-size:13px;opacity:.85}
        .wo-next{margin-top:8px;font-size:12px;opacity:.7}
        .wo-boss{width:150px;height:130px;margin:6px auto 0;display:block;animation:woFloat 2.4s ease-in-out infinite}
        .wo-boss.hit{animation:woHit .6s ease-out}
        @keyframes woFloat{50%{transform:translateY(-6px)}}
        @keyframes woHit{0%{transform:translateX(0);filter:brightness(3)}20%{transform:translateX(-10px)}40%{transform:translateX(9px)}60%{transform:translateX(-6px)}100%{transform:none;filter:none}}
        .wo-hp{display:flex;gap:6px;justify-content:center;margin:4px 0 6px}.wo-hp i{width:46px;height:9px;border-radius:5px;background:#FF5A5A;box-shadow:0 0 8px #FF5A5A}.wo-hp i.gone{background:#2a3048;box-shadow:none}
        .wo-res{margin-top:6px;font-size:18px;font-weight:800;min-height:24px}
        .wo-res.ok{color:#CCFF00}.wo-res.bad{color:#FF6B57}
        .wo-tiles{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:14px 0}
        .wo-tile{width:44px;height:48px;border-radius:12px;border:2px solid #4ECDC4;background:#131826;color:#fff;font:700 26px Andika,'Comic Sans MS',system-ui,sans-serif;line-height:1}
        .wo-tile.used{visibility:hidden}.wo-tile.shake{animation:woShake .3s;border-color:#FF6B57}
        @keyframes woShake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
        .wo-slots{display:flex;justify-content:center;gap:5px;margin:12px 0 4px;flex-wrap:wrap}
        .wo-slot{width:28px;height:40px;border-bottom:3px solid #4a5068;font:700 28px Andika,'Comic Sans MS',system-ui,sans-serif;color:#CCFF00}
        .wo-bar{height:8px;border-radius:4px;background:#2a3048;overflow:hidden;margin:8px 0}.wo-bar i{display:block;height:100%;border-radius:4px}`;
      document.head.appendChild(s);
    }
    cv = root.querySelector('canvas'); cx = cv.getContext('2d');
    root.addEventListener('click', onClick);
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp);
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => { if (game) game.last = now(); });
  }
  function resize() {
    if (!root) return;
    const w = root.clientWidth, h = root.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    S = (w * dpr) / LW; VH = (h * dpr) / S;
    BT = VH - ROWS * CELL - 14 - (parseFloat(getComputedStyle(root).paddingBottom) || 0);
    const sk = root.querySelector('#woSk'); if (sk) sk.style.top = ((BT - 52) / VH * h) + 'px';
  }
  const pane = (html) => { const p = root.querySelector('#woPane'); p.innerHTML = html; p.style.display = html ? '' : 'none'; };
  const toLogic = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * LW, y: (e.clientY - r.top) / r.height * VH }; };
  const cellAt = (p) => ({ r: Math.floor((p.y - BT) / CELL), c: Math.floor(p.x / CELL) });
  const inBoard = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;

  // ── 拖曳：按住一顆珠，經過的格子互換；手放開就攻擊 ──
  // 自由排珠（arrange）：和平常一樣拖曳轉珠，但放開不攻擊，可以重新拿起別顆一直轉，時間到才攻擊
  const canDrag = () => game && (game.state === 'idle' || game.state === 'arrange') && !game.over;
  function onDown(e) {
    if (sndOn()) audio();
    if (!canDrag()) return;
    const p = toLogic(e), { r, c } = cellAt(p);
    if (!inBoard(r, c)) return;
    e.preventDefault();
    drag = { r, c, k: game.board[r][c], x: p.x, y: p.y, moved: false };
    cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
  }
  function onMove(e) {
    if (!drag || !canDrag()) return;
    // 手指移動很快時，瀏覽器一次只回報一個點：把中間漏掉的點（coalesced events）都走一遍，珠子才不會「卡住不走」
    const evs = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
    evs.forEach(moveTo);
  }
  function moveTo(e) {
    if (!drag) return;
    const p = toLogic(e); drag.x = Math.max(0, Math.min(LW - 0.01, p.x)); drag.y = Math.max(BT - CELL * 0.4, Math.min(BT + ROWS * CELL + CELL * 0.4, p.y));
    const fr = (drag.y - BT) / CELL - 0.5, fc = drag.x / CELL - 0.5;
    const r = Math.max(0, Math.min(ROWS - 1, Math.round(fr))), c = Math.max(0, Math.min(COLS - 1, Math.round(fc)));
    if (r === drag.r && c === drag.c) return;
    // 相鄰格要離中心夠近才換（避免在格線上抖動）；跳過好幾格時直接沿路一格一格換過去
    const far = Math.abs(r - drag.r) > 1 || Math.abs(c - drag.c) > 1;
    if (!far && Math.hypot(fr - r, fc - c) > 0.45) return;
    while (drag.r !== r || drag.c !== c) {
      const nr = drag.r + Math.sign(r - drag.r), nc = drag.c + Math.sign(c - drag.c);
      swapTo(nr, nc);
    }
  }
  function swapTo(r, c) {
    if (!drag.moved) { drag.moved = true; if (game.state === 'idle') { game.handT0 = now(); game.handLeft = HAND; } }
    const b = game.board; b[drag.r][drag.c] = b[r][c]; b[r][c] = drag.k;
    game.swapFx.push({ r: drag.r, c: drag.c, t: now() }); sfx('swap');
    drag.r = r; drag.c = c;
  }
  function onUp() {
    if (!drag) return;
    const d = drag; drag = null;
    if (game && game.state === 'idle' && (d.moved || findCombos(game.board).length)) attack();   // 盤面已經有三連（技能版面）時，點一下也能攻擊
  }

  // ── 開始畫面 ──
  function open(opts) {
    trial = !!(opts && opts.trial);
    if (!trial && !unlocked()) return toast(L(`精熟 ${NEED} 個單元後解鎖`, `Master ${NEED} units to unlock`));
    if (wordPool().length < 6) return toast(L('單字太少，還不能玩', 'Not enough words yet'));
    mount(); root.classList.add('show'); resize();
    $('woSnd').textContent = sndOn() ? '🔊' : '🔇'; root.querySelector('#woSk').style.display = 'none';
    document.body.style.overflow = 'hidden';
    const best = gameWeekBestAll(), pb = (st.meta.games && st.meta.games[ID] && st.meta.games[ID].best) || 0;
    $('woTop').innerHTML = '';
    pane(`<div class="wj-card">
      <div class="wj-ic">🔮</div>
      <h2>Word Orbs</h2>
      <p>${L('轉珠闖 9 關，打倒第 9 關的魔王！', 'Match orbs through 9 stages and beat the boss!')}</p>
      <div class="wj-rules">
        <div>👆 ${L(`按住一顆珠子拖著走，經過的珠子會跟它換位置；<b>手放開就攻擊</b>（一手最多 ${HAND} 秒）`, `Hold an orb and drag it around; <b>let go to attack</b> (up to ${HAND}s per move)`)}</div>
        <div>💥 ${L('橫的或直的 3 顆以上同色就會消除；消完會掉新珠，連鎖也算分', '3+ in a row or column clear; new orbs fall and chains score too')}</div>
        <div>❓ ${L('第 1–2 關：3 種顏色各代表一個答案，消到正確答案的顏色，而且不要消到錯的答案顏色', 'Stages 1–2: each of 3 colors is an answer — clear the right one, avoid the wrong ones')}</div>
        <div>🛡️ ${L('第 3 關起：照盾牌的條件轉珠（例如一手 3 combo）；盤面會留到下一關', 'From stage 3: break the shield (e.g. 3 combos in one move); the board carries over')}</div>
        <div>✨ ${L(`每攻擊 ${SKILL_CD} 次可以選一個技能（轉色、直排、10 combo 版面、自由排珠），也可以先保留`, `Every ${SKILL_CD} attacks you can pick a skill — or save it`)}</div>
        <div>✏️ ${L('沒過關要拼一個單字，拼完再挑戰同一關（時間會一直走）', 'Miss = spell a word, then try the same stage again (clock keeps running)')}</div>
        <div>⭐ ${trial ? L('試玩模式：不計分', 'Trial: not scored') : L(`每 ${S_PER_PT} 分 1 顆星，最多 ${CAP}；所有遊戲每週只算最高一局，超過只記個人最高分`, `1 ⭐ per ${S_PER_PT} points, up to ${CAP}; best game of the week counts`)}</div>
      </div>
      <p class="wj-small">${trial ? L('🧪 試玩版', '🧪 Trial') : L(`本週遊戲最佳 ${best} / ${CAP} ⭐・個人最高 ${pb} 分`, `Best this week ${best} / ${CAP} ⭐ · Personal best ${pb}`)}<br><span style="opacity:.5">v${VER}</span></p>
      <div class="btnrow"><button class="btn" data-wo="start">${L('開始 Start ▶', 'Start ▶')}</button><button class="btn ghost" data-wo="close">${L('離開', 'Exit')}</button></div>
    </div>`);
    game = null; draw();
  }
  function close() {
    cancelAnimationFrame(raf); game = null; drag = null;
    if (root) root.classList.remove('show');
    document.body.style.overflow = '';
  }

  // ── 一局 ──
  function start() {
    pane('');
    game = {
      board: newBoard(), miss: [0, 0, 0, 0, 0, 0], lv: 0, phase: 0, q: null,
      left: TIME, last: now(), state: 'idle', handT0: 0, handLeft: HAND,
      score: 0, combos: 0, bestHand: 0, fails: 0, spells: 0, maxLv: 1, bossDown: false,
      anim: null, fx: [], swapFx: [], spell: null, over: false, recent: [], msg: null,
      atk: 0, cd0: 0, skillHand: false, skillsUsed: 0, arr: null, sid: '', sk: 0, shake: 0,
    };
    enterLevel();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }
  function enterLevel() {
    const g = game, lv = LEVELS[g.lv];
    g.phase = 0; g.maxLv = Math.max(g.maxLv, g.lv + 1);
    if (lv.q) newQuestion(); else { g.q = null; setShield(); }
    showTop(); skillBtn();
  }
  function newQuestion() {
    const g = game, pool = wordPool().filter((w) => !g.recent.includes(w.id));
    const w = shuffle(pool.length ? pool : wordPool())[0];
    const others = shuffle(wordPool().filter((x) => x.id !== w.id && short(x) !== short(w))).slice(0, 2);
    const words = shuffle([w, ...others]);
    // 選項顏色：挑盤面上數量比較多的 3 色，避免完全沒得消
    const cnt = [0, 0, 0, 0, 0, 0]; g.board.forEach((row) => row.forEach((k) => cnt[k]++));
    const colors = shuffle([0, 1, 2, 3, 4, 5].filter((k) => cnt[k] >= 3)).slice(0, 3);
    while (colors.length < 3) { const k = rnd(6); if (!colors.includes(k)) colors.push(k); }
    g.q = { w, words, colors, a: words.indexOf(w), type: LEVELS[g.lv].q };
    g.recent.push(w.id); if (g.recent.length > 6) g.recent.shift();
    if (g.q.type === 'listen') setTimeout(() => speak(answersOf(w)[0] || w.word), 350);
  }
  function setShield() {   // 這一關（這一階段）的盾：L／T 隨機；有指定顏色的盾挑一色
    const g = game, lv = LEVELS[g.lv];
    let sid = lv.s[lv.boss ? g.phase : 0];
    if (sid === 'lt') sid = Math.random() < 0.5 ? 'lshape' : 'tshape';
    g.sid = sid;
    const cnt = [0, 0, 0, 0, 0, 0]; g.board.forEach((row) => row.forEach((k) => cnt[k]++));
    g.sk = sid === 'ban' ? cnt.indexOf(Math.max(...cnt)) : shuffle([0, 1, 2, 3, 4, 5])[0];   // 禁色挑最多的那色（比較有挑戰）
    g.frame = SHIELD[sid].shape ? placeFrame(SHIELD[sid].shape) : null;
  }
  function shapeSVG(sh) {
    const R2 = Math.max(...sh.map((x) => x[0])) + 1, C2 = Math.max(...sh.map((x) => x[1])) + 1;
    const on = new Set(sh.map(([r, c]) => r + ',' + c));
    let h = `<span class="wo-shape" style="grid-template-columns:repeat(${C2},12px)">`;
    for (let r = 0; r < R2; r++) for (let c = 0; c < C2; c++) h += `<i class="${on.has(r + ',' + c) ? '' : 'o'}"></i>`;
    return h + '</span>';
  }
  const lvName = (i) => (i === 8 ? L('第 9 關・魔王', 'Stage 9 · BOSS') : L(`第 ${i + 1} 關`, `Stage ${i + 1}`));
  function shieldHTML(sid, k, extra) {
    const s = SHIELD[sid];
    return `<div class="wo-shield"><b>🛡️ ${s.shape ? shapeSVG(game && game.frame ? norm(game.frame) : SHAPES[s.shape]) : s.ic}</b><span>${EN() ? s.en : s.zh}</span><small>${s.tip(k)}${extra || ''}</small></div>`;
  }
  const shName = (x) => (x === 'lt' ? L('L／T 形盾', 'L / T shape') : EN() ? SHIELD[x].en : SHIELD[x].zh);
  function nextText() {
    const n = LEVELS[game.lv + 1]; if (!n) return '';
    return `<div class="wo-next">${L('下一關', 'Next')}：${n.s ? n.s.map((x) => `🛡️ ${shName(x)}`).join(' → ') : '❓'}</div>`;
  }
  // 魔王：墨水大王（第二階段變紅、皇冠歪掉、生氣）
  function bossSVG(phase, hit) {
    const body = phase ? '#8a2b4a' : '#3b2a6e', light = phase ? '#c2416b' : '#5b45a8';
    return `<svg class="wo-boss ${hit ? 'hit' : ''}" viewBox="0 0 150 130" aria-hidden="true">
      <ellipse cx="75" cy="122" rx="48" ry="6" fill="#000" opacity=".35"/>
      <path d="M22 118 C10 90 18 52 46 40 C60 34 90 34 104 40 C132 52 140 90 128 118 C118 110 112 122 102 114 C94 124 86 112 75 120 C64 112 56 124 48 114 C38 122 32 110 22 118 Z" fill="${body}"/>
      <path d="M36 70 C40 54 56 46 72 46" stroke="${light}" stroke-width="6" stroke-linecap="round" fill="none" opacity=".7"/>
      <g transform="${phase ? 'rotate(-14 75 30)' : ''}"><path d="M48 40 L52 14 L64 30 L75 8 L86 30 L98 14 L102 40 Z" fill="#FFD23F" stroke="#B8901F" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="75" cy="28" r="4" fill="#FF5A5A"/></g>
      <ellipse cx="57" cy="76" rx="12" ry="${phase ? 9 : 13}" fill="#fff"/><ellipse cx="93" cy="76" rx="12" ry="${phase ? 9 : 13}" fill="#fff"/>
      <circle cx="59" cy="79" r="6" fill="#0a0a14"/><circle cx="91" cy="79" r="6" fill="#0a0a14"/>
      <circle cx="61" cy="77" r="2" fill="#fff"/><circle cx="93" cy="77" r="2" fill="#fff"/>
      <path d="M44 ${phase ? 58 : 62} L68 ${phase ? 68 : 64} M106 ${phase ? 58 : 62} L82 ${phase ? 68 : 64}" stroke="#0a0a14" stroke-width="5" stroke-linecap="round"/>
      <path d="M58 100 Q75 ${phase ? 90 : 110} 92 100" stroke="#0a0a14" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M64 100 l4 6 l4 -6 M78 100 l4 6 l4 -6" fill="#fff"/>
    </svg>`;
  }
  function showTop(res) {
    const g = game, lv = LEVELS[g.lv];
    let body = '';
    if (lv.q) {
      const q = g.q, w = q.w, word = answersOf(w)[0] || w.word;
      const prompt = q.type === 'listen'
        ? `${L('聽聽看，是哪一個字？', 'Which word do you hear?')} <button class="btn ghost" style="padding:4px 12px;font-size:16px" data-wo="say">🔊</button>`
        : esc(short(w));
      body = `<div class="prompt">${prompt}</div><div class="wo-opts">${q.words.map((x, i) => {
        const o = ORB[q.colors[i]];
        return `<div class="wo-opt"><span class="wo-dot" style="background:${o.c}">${o.g}</span>${esc(answersOf(x)[0] || x.word)}</div>`;
      }).join('')}</div>`;
    } else {
      body = (lv.boss ? bossSVG(g.phase, res && res.ok) + `<div class="wo-hp"><i class="${g.phase >= 1 || g.bossDown ? 'gone' : ''}"></i><i class="${g.bossDown ? 'gone' : ''}"></i></div>` : '')
        + shieldHTML(g.sid, g.sk, lv.boss ? L(`（第 ${g.phase + 1} / 2 階段）`, ` (phase ${g.phase + 1}/2)`) : '');
    }
    $('woTop').innerHTML = `<div class="lvname">${lvName(g.lv)}</div>${body}${res ? `<div class="wo-res ${res.ok ? 'ok' : 'bad'}">${res.t}</div>` : nextText()}`;
  }

  // ── 攻擊：結算玩家那一手 → 消除動畫 → 天降連鎖 → 判定 ──
  function attack() {
    const g = game; drag = null;
    const hand = findCombos(g.board);
    g.hand = hand; g.sky = []; g.state = 'anim'; g.comboNow = null;
    g.bestHand = Math.max(g.bestHand, hand.length);
    if (hand.length) popStep(hand, true); else finishHand();
  }
  // 一個 combo 一個 combo 依序消：每個間隔 COMBO_GAP，數字一路往上跳
  function popStep(combos, first) {
    const g = game, base = first ? 0 : g.hand.length + g.sky.length;
    const order = combos.slice().sort((a, b) => Math.min(...a.cells.map((x) => x[0] * 10 + x[1])) - Math.min(...b.cells.map((x) => x[0] * 10 + x[1])));
    const idx = {}; order.forEach((x, j) => x.cells.forEach(([r, c]) => (idx[r * COLS + c] = j)));
    g.anim = { type: 'pop', t0: now(), cells: combos.flatMap((x) => x.cells), order, idx, base, fired: 0, dur: (order.length - 1) * COMBO_GAP + POP_MS };
    if (!first) g.sky.push(...combos);
  }
  function popTick(t) {   // 每個 combo 開始消的瞬間：音效、數字、震動
    const g = game, a = g.anim;
    while (a.fired < a.order.length && t - a.t0 >= a.fired * COMBO_GAP) {
      const x = a.order[a.fired], n = a.base + a.fired + 1;
      sfx('pop', n - 1, 0);
      const cy = x.cells.reduce((s2, c) => s2 + c[0], 0) / x.n, cxx = x.cells.reduce((s2, c) => s2 + c[1], 0) / x.n;
      g.fx.push({ txt: `${n} Combo`, x: (cxx + 0.5) * CELL, y: BT + (cy + 0.5) * CELL, t, col: ORB[x.c].c, big: n >= 5 ? 2 : 0 });
      g.comboNow = { n, t }; g.shake = Math.min(6, 2 + n * 0.5);
      a.fired++;
    }
  }
  function afterPop() {   // 消掉、往下掉、補珠
    const g = game, b = g.board;
    g.anim.cells.forEach(([r, c]) => (b[r][c] = null));
    const fall = b.map((row) => row.map(() => 0));
    for (let c = 0; c < COLS; c++) {
      const keep = []; for (let r = ROWS - 1; r >= 0; r--) if (b[r][c] != null) keep.push([b[r][c], r]);
      for (let r = ROWS - 1, i = 0; r >= 0; r--, i++) {
        if (i < keep.length) { b[r][c] = keep[i][0]; fall[r][c] = r - keep[i][1]; }
        else { b[r][c] = dropColor(g); fall[r][c] = r + 1 + (ROWS - keep.length) * 0.15; }
      }
    }
    g.anim = { type: 'fall', t0: now(), fall };
    setTimeout(() => sfx('land'), FALL_MS * 0.8);
  }
  function afterFall() {
    const more = findCombos(game.board);
    if (more.length) popStep(more, false); else finishHand();
  }
  function finishHand() {
    const g = game, lv = LEVELS[g.lv], hand = g.hand, m = MULT[g.lv];
    g.anim = null;
    const res = judge(lv, hand, g);
    const handN = Math.min(COMBO_CAP, hand.length), skyN = Math.min(COMBO_CAP - handN, g.sky.length);
    let gain;
    const sm = g.skillHand ? SKILL_COMBO : 1;
    if (res.ok) gain = Math.round((handN * COMBO * m * 2 + skyN * COMBO * m) * sm + CLEAR * m);
    else gain = Math.round((handN + skyN) * COMBO * sm);
    g.skillHand = false; g.atk++; skillBtn();
    g.score += gain; g.combos += hand.length + g.sky.length;
    if (gain) g.fx.push({ txt: `+${gain}`, x: LW / 2, y: BT - 18, t: now(), col: res.ok ? '#CCFF00' : '#ffffff', big: 1 });
    sfx(res.ok ? 'win' : 'lose');
    if (res.ok) {
      if (lv.boss && g.phase === 0) { g.phase = 1; setShield(); showTop({ ok: true, t: L('💥 第一階段破了！', '💥 Phase 1 down!') }); setTimeout(() => game === g && !g.over && showTop(), 1100); g.state = 'idle'; return; }
      if (lv.boss) { g.bossDown = true; showTop({ ok: true, t: L('🏆 魔王擊破！', '🏆 Boss defeated!') }); g.state = 'done'; setTimeout(() => game === g && end(true), 1400); return; }
      showTop({ ok: true, t: lv.q ? L('✓ 答對了！', '✓ Correct!') : L('🛡️ 破盾！', '🛡️ Shield broken!') });
      g.state = 'wait';
      setTimeout(() => { if (game !== g || g.over) return; g.lv++; enterLevel(); g.state = 'idle'; }, 900);
    } else {
      g.fails++;
      const t = lv.q
        ? (res.why === 'wrong' ? L('✕ 消到錯的答案了', '✕ You cleared a wrong answer') : L(`✕ 沒有消到 ${ORB[g.q.colors[g.q.a]].g} 答案色`, '✕ Missed the answer color'))
        : L(`✕ 沒有破盾・你轉了 ${hand.length} combo${g.sky.length ? `（天降 ${g.sky.length} 不算）` : ''}`, `✕ Shield held · your move: ${hand.length} combo${g.sky.length ? ` (+${g.sky.length} skyfall don't count)` : ''}`);
      showTop({ ok: false, t: t + (lv.q ? `・${esc(answersOf(g.q.w)[0] || g.q.w.word)}` : '') });
      g.state = 'wait';
      setTimeout(() => { if (game === g && !g.over) startSpell(); }, 1000);
    }
  }

  // ── 技能：每 SKILL_CD 次攻擊可以選一次（三選一，可以先保留）──
  const skillReady = () => game && game.atk - game.cd0 >= SKILL_CD;
  function skillBtn() {
    const b = root && root.querySelector('#woSk'); if (!b || !game) return;
    b.style.display = game.over || game.state === 'spell' || game.state === 'pick' ? 'none' : '';
    const n = Math.min(SKILL_CD, game.atk - game.cd0);
    b.classList.toggle('ready', skillReady());
    b.textContent = skillReady() ? L('✨ 技能！', '✨ SKILL!') : `✨ ${n}/${SKILL_CD}`;
  }
  function openSkills() {
    const g = game; if (!g || g.state !== 'idle' || drag) return;
    if (!skillReady()) return toast(L(`再攻擊 ${SKILL_CD - (g.atk - g.cd0)} 次就能用技能`, `${SKILL_CD - (g.atk - g.cd0)} more attacks to unlock a skill`));
    // 自由排珠一定在選項裡（不會轉的學生靠它破形狀盾），另外兩個隨機；同一輪 CD 的選項固定，關掉再開不會換
    g.pick = g.pick || ['free', ...shuffle(['paint', 'rainbow', 'ten']).slice(0, 2)];
    g.state = 'pick'; $('woTop').style.visibility = 'hidden'; skillBtn();
    pane(`<div class="wj-card"><div class="wj-kicker">✨ ${L('選一個技能', 'Pick a skill')}</div>
      <div class="wo-skills">${g.pick.map((k) => { const s = SKILLS[k]; return `<button class="btn" data-wo="useskill" data-k="${k}"><span>${s.ic}</span><div><b>${EN() ? s.en : s.zh}</b><small>${L(s.tip[0], s.tip[1])}</small></div></button>`; }).join('')}</div>
      <p class="wj-small">${L('用技能那一手的 combo 分數減半', 'Combo points are halved on a skill move')}</p>
      <div class="btnrow"><button class="btn ghost" data-wo="skillcancel">${L('先保留', 'Save it')}</button></div></div>`);
  }
  function closeSkills() { const g = game; pane(''); $('woTop').style.visibility = ''; if (g && g.state === 'pick') g.state = 'idle'; skillBtn(); }
  function useSkill(k) {
    const g = game; if (!g || g.state !== 'pick') return;
    closeSkills();
    const b = g.board, cnt = [0, 0, 0, 0, 0, 0]; b.forEach((row) => row.forEach((x) => cnt[x]++));
    const banned = g.sid === 'ban' ? g.sk : -1;
    if (k === 'paint') {
      let tgt = g.q ? g.q.colors[g.q.a] : g.sid === 'cnt' ? g.sk : -1;
      if (tgt < 0) tgt = cnt.map((n, i) => [n, i]).filter(([, i]) => i !== banned).sort((a2, b2) => b2[0] - a2[0])[0][1];
      const cells = shuffle(b.flatMap((row, r) => row.map((x, c) => [r, c, x])).filter(([, , x]) => x !== tgt)).slice(0, 6);
      cells.forEach(([r, c]) => (b[r][c] = tgt));
    } else if (k === 'rainbow') {
      const perm = shuffle([0, 1, 2, 3, 4, 5]); for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) b[r][c] = perm[c];
    } else if (k === 'ten') {
      let prev = [-1, -1];
      for (let r = 0; r < ROWS; r++) {
        let A, B; do { [A, B] = shuffle([0, 1, 2, 3, 4, 5]); } while (A === prev[0] || B === prev[1] || A === banned || B === banned);
        for (let c = 0; c < COLS; c++) b[r][c] = c < 3 ? A : B; prev = [A, B];
      }
    }
    g.cd0 = g.atk; g.pick = null; g.skillHand = true; g.skillsUsed++; skillBtn();
    sfx('win');
    if (k === 'free') { g.state = 'arrange'; g.arr = { t0: now(), left: ARRANGE, sel: null }; }
    else g.fx.push({ txt: L('放開或點一下就攻擊！', 'Tap or drag to attack!'), x: LW / 2, y: BT - 40, t: now(), col: '#CCFF00', big: 1 });
  }

  // ── 拼字（字母方塊；限時 15 秒，時間會一直走）──
  const CONFUSE = { a: 'eo', e: 'ai', i: 'le', o: 'ua', u: 'on', b: 'dp', d: 'bp', p: 'bq', q: 'pg', l: 'it', n: 'mh', m: 'nw', r: 'n', s: 'z', c: 'k', k: 'c', g: 'q', h: 'n', t: 'f', f: 't', v: 'w', w: 'v', y: 'v', j: 'i', z: 's', x: 'k' };
  function startSpell() {
    const g = game, lv = LEVELS[g.lv];
    let w = lv.q && !g.spellQ ? g.q.w : null;   // 選項關第一次失敗考這題的字，之後輪換
    if (lv.q) g.spellQ = true;
    if (!w) { const pool = wordPool().filter((x) => !g.recent.includes(x.id)); w = shuffle(pool.length ? pool : wordPool())[0]; g.recent.push(w.id); if (g.recent.length > 6) g.recent.shift(); }
    const ans = (answersOf(w)[0] || w.word).toLowerCase();
    const extra = [];
    [...ans].forEach((ch) => (CONFUSE[ch] || '').split('').forEach((x) => { if (!ans.includes(x) && !extra.includes(x)) extra.push(x); }));
    const abc = 'abcdefghijklmnopqrstuvwxyz'.split('').filter((x) => !ans.includes(x));
    const dis = shuffle(extra).slice(0, 3); while (dis.length < 3) { const x = abc[rnd(abc.length)]; if (!dis.includes(x)) dis.push(x); }
    g.spell = { w, ans, tiles: shuffle([...ans, ...dis].map((ch, i) => ({ ch, i, used: false }))), got: 0, t0: now(), left: SPELL };
    g.spells++; g.state = 'spell'; $('woTop').style.visibility = 'hidden'; skillBtn();
    renderSpell();
    setTimeout(() => speak(ans), 250);
  }
  function renderSpell(bad) {
    const s = game.spell, w = s.w;
    pane(`<div class="wj-card wj-spell">
      <div class="wj-kicker">✏️ ${L('拼出這個字', 'Spell the word')}</div>
      <div class="wo-bar"><i id="woSB" style="width:100%;background:#4ECDC4"></i></div>
      <div style="font-size:22px;font-weight:800;margin-top:6px">${esc(short(w))} <small style="opacity:.6;font-size:14px">${esc(w.pos || '')}</small>
        <button class="btn ghost" style="padding:4px 12px;font-size:16px;margin-left:6px" data-wo="sayspell">🔊</button></div>
      <div class="wo-slots">${[...s.ans].map((ch, i) => `<div class="wo-slot">${i < s.got ? esc(ch) : ''}</div>`).join('')}</div>
      <div class="wo-tiles">${s.tiles.map((t, k) => `<button class="wo-tile ${t.used ? 'used' : ''} ${bad === k ? 'shake' : ''}" data-wo="tile" data-k="${k}">${esc(t.ch)}</button>`).join('')}</div>
    </div>`);
  }
  function tapTile(k) {
    const g = game, s = g && g.spell; if (!s) return;
    const t = s.tiles[k]; if (!t || t.used) return;
    if (t.ch === s.ans[s.got]) {
      t.used = true; s.got++;
      if (s.got >= s.ans.length) { renderSpell(); speak(s.ans); setTimeout(() => game === g && endSpell(), 500); return; }
      renderSpell();
    } else renderSpell(k);
  }
  function endSpell() {
    const g = game; if (!g || !g.spell) return;
    g.spell = null; pane(''); $('woTop').style.visibility = '';
    if (LEVELS[g.lv].q) { g.spellQ = false; newQuestion(); }   // 選項關換一題再轉
    g.state = 'idle'; showTop(); skillBtn();
  }

  // ── 結束 ──
  function end(clear) {
    const g = game; if (!g || g.over) return;
    g.over = true; g.spell = null; drag = null; g.state = 'over'; g.arr = null; skillBtn();
    cancelAnimationFrame(raf);
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
      gm.far = Math.max(gm.far || 0, g.maxLv); gm.combo = Math.max(gm.combo || 0, g.bestHand);
      if (g.bossDown) gm.boss = (gm.boss || 0) + 1;
      saveLedger(); saveMeta();
      gain = Math.max(0, pts - prev);
      afterPoints(before);
      if (gain || g.bossDown) setTimeout(() => confetti(g.bossDown ? 100 : gain >= 10 ? 90 : 50), 150);
    }
    hud(); draw();
    $('woTop').innerHTML = ''; $('woTop').style.visibility = '';
    pane(`<div class="wj-card">
      <div class="wj-kicker">${clear ? L('🏆 魔王擊破！', '🏆 Boss defeated!') : L('時間到！', "Time's up!")}</div>
      <div class="wj-big">${sc}</div>
      <div class="wj-small">${trial ? L('🧪 試玩模式，不計分', '🧪 Trial — not scored') : record ? L('🆕 個人最高紀錄！', '🆕 New personal best!') : L(`個人最高 ${best} 分`, `Personal best ${best}`)}<br>
        ${L(`最遠第 ${g.maxLv} 關・總 combo ${g.combos}・單手最多 ${g.bestHand} combo・拼字 ${g.spells} 次`, `Reached stage ${g.maxLv} · ${g.combos} combos · best move ${g.bestHand} · spelled ${g.spells}`)}</div>
      <div class="wj-pts">⭐ ${pts} / ${CAP}</div>
      ${trial ? '' : gain ? `<div class="gain">+${gain} ⭐</div>`
        : `<div class="gain zero">${prev >= CAP ? L('本週遊戲已經拿滿 20 分，現在純粹挑戰紀錄 🎮', 'You already got 20 this week — playing for records now 🎮')
          : L(`本週遊戲最佳是 ${prev} 分，超過才會再加分`, `Your best this week is ${prev} — beat it to earn more`)}</div>`}
      <div class="btnrow" style="margin-top:14px"><button class="btn" data-wo="start">${L('再玩一次', 'Play again')}</button><button class="btn ghost" data-wo="close">${L('離開', 'Exit')}</button></div>
    </div>`);
  }

  // ── 主迴圈：時間只在「可以操作」或「拼字」時走；動畫期間暫停 ──
  function loop() {
    raf = requestAnimationFrame(loop);
    const g = game; if (!g || g.over) return;
    const t = now(), dt = Math.min(0.1, (t - g.last) / 1000); g.last = t;
    if (!document.hidden && (g.state === 'idle' || g.state === 'spell' || g.state === 'arrange' || g.state === 'pick')) {
      g.left -= dt;
      if (g.left <= 0) { g.left = 0; hud(); return end(false); }
    }
    if (g.state === 'idle' && drag && drag.moved) {
      g.handLeft = HAND - (t - g.handT0) / 1000;
      if (g.handLeft <= 0) { g.handLeft = 0; onUp(); }
    }
    if (g.state === 'spell' && g.spell) {
      const s = g.spell; s.left -= dt;
      const bar = $('woSB'); if (bar) { const k = Math.max(0, s.left / SPELL); bar.style.width = k * 100 + '%'; bar.style.background = k > .5 ? '#5CD65C' : k > .25 ? '#FFD23F' : '#FF5A5A'; }
      if (s.left <= 0) endSpell();
    }
    if (g.anim) {
      if (g.anim.type === 'pop') popTick(t);
      const k = (t - g.anim.t0) / (g.anim.type === 'pop' ? g.anim.dur : FALL_MS);
      if (k >= 1) { if (g.anim.type === 'pop') afterPop(); else afterFall(); }
    }
    if (g.state === 'arrange' && g.arr) {
      g.arr.left = ARRANGE - (t - g.arr.t0) / 1000;
      if (g.arr.left <= 0) { g.arr = null; drag = null; g.state = 'idle'; attack(); }
    }
    if (g.shake) g.shake = Math.max(0, g.shake - dt * 30);
    hud(); draw();
  }

  // ── 繪圖 ──
  function hud() {
    const g = game, left = g ? g.left : TIME, m = Math.floor(left / 60), s = Math.floor(left % 60);
    $('woT').textContent = `${m}:${String(s).padStart(2, '0')}`; $('woT').classList.toggle('low', left < 30);
    $('woS').textContent = g ? g.score : 0; $('woP').textContent = `⭐ ${g ? toPts(g.score) : 0}`;
  }
  function orb(x, y, k, r, a = 1) {
    const o = ORB[k];
    cx.globalAlpha = a;
    cx.fillStyle = o.d; cx.beginPath(); cx.arc(x, y + r * 0.08, r, 0, 7); cx.fill();
    cx.fillStyle = o.c; cx.beginPath(); cx.arc(x, y, r * 0.94, 0, 7); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.35)'; cx.beginPath(); cx.ellipse(x - r * 0.3, y - r * 0.38, r * 0.32, r * 0.2, -0.5, 0, 7); cx.fill();
    cx.fillStyle = '#fff'; cx.font = `800 ${r * 0.95}px system-ui, sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(o.g, x, y + r * 0.06);
    cx.globalAlpha = 1;
  }
  function draw() {
    if (!cx) return;
    cx.setTransform(S, 0, 0, S, 0, 0);
    cx.fillStyle = '#0a0a14'; cx.fillRect(0, 0, LW, VH);
    const g = game;
    // 珠盤
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      cx.fillStyle = (r + c) % 2 ? '#1a1f30' : '#151a28';
      cx.fillRect(c * CELL, BT + r * CELL, CELL, CELL);
    }
    // 單手時間條（盤面上方）
    if (g && !g.over) {
      const k = g.state === 'idle' && drag && drag.moved ? Math.max(0, g.handLeft / HAND) : 1;
      cx.fillStyle = '#2a3048'; cx.fillRect(8, BT - 12, LW - 16, 7);
      cx.fillStyle = k > .5 ? '#5CD65C' : k > .25 ? '#FFD23F' : (Math.floor(now() / 150) % 2 ? '#FF5A5A' : '#c43c3c');
      cx.fillRect(8, BT - 12, (LW - 16) * k, 7);
    }
    if (!g) {
      const demo = drawDemo.b || (drawDemo.b = newBoard());
      demo.forEach((row, r) => row.forEach((k, c) => orb((c + 0.5) * CELL, BT + (r + 0.5) * CELL, k, CELL * 0.42, 0.5)));
      return;
    }
    const t = now(), a = g.anim;
    const popIdx = a && a.type === 'pop' ? a.idx : null;
    if (g.shake) cx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
    const fk = a && a.type === 'fall' ? Math.min(1, (t - a.t0) / FALL_MS) : 1;
    // 盤面上方的區域遮掉（掉落的珠從上面滑進來）
    cx.save(); cx.beginPath(); cx.rect(0, BT, LW, ROWS * CELL); cx.clip();
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const k = g.board[r][c]; if (k == null) continue;
      if (drag && drag.moved && drag.r === r && drag.c === c) continue;
      let x = (c + 0.5) * CELL, y = BT + (r + 0.5) * CELL, rad = CELL * 0.42, al = 1;
      if (popIdx && popIdx[r * COLS + c] != null) {
        const pk = Math.max(0, Math.min(1, (t - a.t0 - popIdx[r * COLS + c] * COMBO_GAP) / POP_MS));
        if (pk > 0) { rad *= pk < 0.3 ? 1 + pk : 1.3 - (pk - 0.3) * 1.3; al = pk < 0.3 ? 1 : 1 - (pk - 0.3) / 0.7; }
        else { rad *= 1 + Math.sin(t / 60) * 0.03; }
      }
      if (a && a.type === 'fall' && a.fall[r][c]) y -= a.fall[r][c] * CELL * (1 - fk * fk);
      orb(x, y, k, rad, al);
    }
    cx.restore();
    // 形狀盾的框：橘色發光外框（只畫外圍的邊）
    if (g.frame && !g.over) {
      const on = new Set(g.frame.map(([r, c]) => r * COLS + c)), pulse = 0.55 + Math.sin(t / 220) * 0.25;
      cx.fillStyle = `rgba(255,181,71,${0.12 + pulse * 0.1})`;
      g.frame.forEach(([r, c]) => cx.fillRect(c * CELL, BT + r * CELL, CELL, CELL));
      cx.strokeStyle = `rgba(255,181,71,${pulse + 0.2})`; cx.lineWidth = 4; cx.lineCap = 'round'; cx.beginPath();
      g.frame.forEach(([r, c]) => {
        const x = c * CELL, y = BT + r * CELL;
        if (!on.has((r - 1) * COLS + c) || r === 0) { cx.moveTo(x, y); cx.lineTo(x + CELL, y); }
        if (!on.has((r + 1) * COLS + c) || r === ROWS - 1) { cx.moveTo(x, y + CELL); cx.lineTo(x + CELL, y + CELL); }
        if (c === 0 || !on.has(r * COLS + c - 1)) { cx.moveTo(x, y); cx.lineTo(x, y + CELL); }
        if (c === COLS - 1 || !on.has(r * COLS + c + 1)) { cx.moveTo(x + CELL, y); cx.lineTo(x + CELL, y + CELL); }
      });
      cx.stroke();
    }
    // 自由排珠：紫色時間條＋選到的珠
    if (g.state === 'arrange' && g.arr) {
      const k = Math.max(0, g.arr.left / ARRANGE);
      cx.fillStyle = '#B48CFF'; cx.fillRect(8, BT - 12, (LW - 16) * k, 7);
      cx.fillStyle = '#B48CFF'; cx.font = '800 15px "Noto Sans TC", system-ui, sans-serif'; cx.textAlign = 'center';
      cx.fillText(L('✋ 自由排珠：可以一直轉，放開不會攻擊', '✋ Free arrange: drag freely, release won’t attack'), LW / 2, BT - 72);
    }
    // 拖著的珠：浮在手指上方一點
    if (drag && (g.state === 'idle' || g.state === 'arrange')) {
      const k = drag.moved ? drag.k : null;
      if (k != null) orb(drag.x, drag.y - CELL * 0.35, k, CELL * 0.48, 0.92);
      else { cx.strokeStyle = '#CCFF00'; cx.lineWidth = 3; cx.strokeRect(drag.c * CELL + 2, BT + drag.r * CELL + 2, CELL - 4, CELL - 4); }
    }
    // 盤面上方的大 combo 數字
    if (g.comboNow && t - g.comboNow.t < 1300 && (g.state === 'anim' || g.state === 'wait')) {
      const k = Math.min(1, (t - g.comboNow.t) / 160), n = g.comboNow.n;
      cx.save(); cx.translate(LW / 2, BT - 70); cx.scale(0.6 + k * 0.4 + (1 - k) * 0.5, 0.6 + k * 0.4 + (1 - k) * 0.5);
      cx.font = `800 ${n >= 8 ? 46 : n >= 5 ? 40 : 34}px Syne, system-ui, sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.lineWidth = 6; cx.strokeStyle = 'rgba(0,0,0,.7)'; cx.strokeText(`${n} COMBO`, 0, 0);
      cx.fillStyle = n >= 8 ? '#FF5A5A' : n >= 5 ? '#FFD23F' : '#CCFF00'; cx.fillText(`${n} COMBO`, 0, 0);
      cx.restore();
    }
    // 文字特效
    g.fx = g.fx.filter((f) => t - f.t < 900);
    g.fx.forEach((f) => {
      const k = (t - f.t) / 900;
      cx.globalAlpha = 1 - k; cx.fillStyle = f.col; cx.font = `800 ${f.big ? 22 : 16}px Syne, system-ui, sans-serif`; cx.textAlign = 'center';
      cx.strokeStyle = 'rgba(0,0,0,.6)'; cx.lineWidth = 4; cx.strokeText(f.txt, f.x, f.y - k * 30); cx.fillText(f.txt, f.x, f.y - k * 30);
    });
    cx.globalAlpha = 1;
  }
  const drawDemo = {};

  function onClick(e) {
    const t = e.target.closest('[data-wo]'); if (!t) return;
    const a = t.dataset.wo;
    if (a === 'snd') { st.set.orbsMute = sndOn(); if (typeof saveSet === 'function') saveSet(); $('woSnd').textContent = sndOn() ? '🔊' : '🔇'; if (sndOn()) sfx('tile'); return; }
    if (a === 'start') { audio(); if (typeof unlockAudio === 'function') unlockAudio(); start(); }
    if (a === 'close') close();
    if (a === 'tile') { sfx('tile'); tapTile(+t.dataset.k); }
    if (a === 'skill') openSkills();
    if (a === 'skillcancel') closeSkills();
    if (a === 'useskill') useSkill(t.dataset.k);
    if (a === 'say' && game && game.q) speak(answersOf(game.q.w)[0] || game.q.w.word);
    if (a === 'sayspell' && game && game.spell) speak(game.spell.ans);
    if (a === 'quit') {
      if (game && !game.over && !trial && !confirm(L('離開這一局？這局不會計分。', "Quit this game? It won't be scored."))) return;
      close();
    }
  }
  // 測試用
  const _t = { get game() { return game; }, newBoard, useSkill, openSkills, setShield, SHAPES, hasFrame, findCombos, judge, LEVELS, SHIELD, attack, end, toPts, startSpell, endSpell, tapTile,
    setBoard(b) { game.board = b.map((r) => r.slice()); }, get BT() { return BT; }, CELL };
  return { id: ID, need: NEED, card, bestText, open, close, _t };
})();
GAMES.push(WO);
