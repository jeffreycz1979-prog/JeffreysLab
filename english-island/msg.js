// 英文順起來．探索英文島 - 留言、宣言、空降與同學分身（msg.js v1）
// 只在登入雲端帳號後出現（用 cloud.js 的 api）；後台是英文島後台 GAS 的「留言.gs」
//
// 悄悄話：只有老師看得到。宣言：馬上出現在自己的島上；老師核准後同班同學也看得到（公布欄、同學分身頭上）
// 老師回覆 → 紙飛機飛到信箱；老師空降（給一個人或全班）→ 小鳥叼信飛來；點了才打開
// 同學分身：同班同學的角色在他最後去的單元附近散步（不即時連線、不顯示真名和積分）
(() => {
  const MAX_LEN = 60, PULL_GAP = 60000, MATE_MAX = 12;
  const BAD = /幹|靠北|靠杯|白癡|白痴|智障|去死|垃圾|笨蛋|fuck|shit|bitch|stupid|idiot/i;   // 常見不雅字，後台會再擋一次
  const C = () => window.cloud;
  const on = () => !!(C() && C().on && C().auth && C().auth());
  let box = { mine: [], drops: [], board: [], mates: [], used: 0, max: 3 };
  let pulledAt = 0, pulling = null, tab = 'write', kind = 'decl', flying = false;
  const fmt = (t) => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const unreadReplies = () => box.mine.filter((m) => m.reply && !m.read);
  const unreadDrops = () => box.drops.filter((d) => !d.read);
  const myDecl = () => box.mine.filter((m) => m.type === 'decl' && m.status !== 'private').pop() || box.mine.filter((m) => m.type === 'decl').pop();

  // ── 拉信：打開 App、回到首頁時（最多每分鐘一次）──
  async function pull(force) {
    if (!on()) return;
    if (pulling) return pulling;
    if (!force && Date.now() - pulledAt < PULL_GAP) return;
    pulling = (async () => {
      try {
        const d = await C().api('inbox', { since: pulledAt });
        box = { mine: d.mine || [], drops: d.drops || [], board: d.board || [], mates: d.mates || [], used: d.used || 0, max: d.max || 3 };
        pulledAt = Date.now();
        try { await db.set('msgbox', box); } catch (e) {}
        paint(); deliver();
      } catch (e) { /* 沒網路：下次再拉 */ }
      finally { pulling = null; }
    })();
    return pulling;
  }

  // ── 首頁：信箱按鈕、未讀數、我的宣言 ──
  function paint() {
    const btn = $('mailBtn'), strip = $('declStrip'); if (!btn) return;
    btn.hidden = !on(); if (!on()) { strip.hidden = true; redrawMates(); return; }
    const n = unreadReplies().length + unreadDrops().length;
    $('mailDot').hidden = !n; $('mailDot').textContent = n;
    const d = myDecl();
    strip.hidden = !d;
    if (d) strip.innerHTML = `📜 <b>${esc(d.text)}</b><small>${d.status === 'public' ? L('同學看得到', 'Public') : d.status === 'private' ? L('只在你的島上', 'Only on your island') : L('等老師核准', 'Waiting for teacher')}</small>`;
    redrawMates();
  }

  // ── 信箱 ──
  function open(t) {
    if (t) tab = t;
    const nR = unreadReplies().length + unreadDrops().length;
    const tabs = [['write', L('✏️ 寫信', '✏️ Write')], ['mine', L('📬 我的信', '📬 My letters'), nR], ['board', L('📌 公布欄', '📌 Board')]];
    $('sheet').innerHTML = `<h3 style="margin-top:0">📮 ${L('島上信箱', 'Island mailbox')} <small>MAILBOX</small></h3>
      <div class="mtabs">${tabs.map(([k, n, c]) => `<button data-mtab="${k}" class="${tab === k ? 'on' : ''}">${n}${c ? `<i>${c}</i>` : ''}</button>`).join('')}</div>
      <div id="mBody">${tab === 'write' ? writeHTML() : tab === 'mine' ? mineHTML() : boardHTML()}</div>
      <div class="btnrow" style="margin-top:14px"><button class="btn ghost" data-close="1">${L('關閉', 'Close')}</button></div>`;
    $('modal').classList.add('show');
    if (tab === 'mine') markAll();
  }
  function writeHTML() {
    const left = Math.max(0, box.max - box.used);
    return `<div class="mkind">
        <button data-mkind="decl" class="${kind === 'decl' ? 'on' : ''}">📜 ${L('宣言', 'Declaration')}<small>${L('寫在你的島上；老師核准後同學也看得到', 'On your island; classmates see it after teacher approves')}</small></button>
        <button data-mkind="whisper" class="${kind === 'whisper' ? 'on' : ''}">🤫 ${L('悄悄話', 'Note to teacher')}<small>${L('只有老師看得到', 'Only your teacher sees it')}</small></button></div>
      <textarea class="mta" id="mText" maxlength="${MAX_LEN}" placeholder="${kind === 'decl' ? L('例如：這週我要背完 U3 的單字！', 'e.g. I will learn all U3 words this week!') : L('想跟老師說的話', 'What do you want to tell your teacher?')}"></textarea>
      <div class="mcount"><span id="mCount">0</span> / ${MAX_LEN}・${L(`今天還能寫 ${left} 則`, `${left} left today`)}</div>
      <p class="cerr" id="mErr"></p>
      <div class="btnrow" style="margin-top:6px"><button class="btn" data-msend="1" ${left ? '' : 'disabled'}>${L('送出', 'Send')}</button></div>
      <p class="note" style="margin-top:10px">${L('老師回覆時，會有一架紙飛機飛到你的島上 ✈️', 'When your teacher replies, a paper plane flies to your island ✈️')}</p>`;
  }
  const statusPill = (m) => m.type === 'whisper'
    ? `<span class="mpill priv">🤫 ${L('悄悄話', 'Note')}</span><span class="mpill ${m.status === 'new' ? 'wait' : 'ok'}">${m.status === 'new' ? L('老師還沒看', 'Not read yet') : L('老師看過了', 'Read')}</span>`
    : `<span class="mpill ${m.status === 'public' ? 'ok' : m.status === 'private' ? 'priv' : 'wait'}">📜 ${m.status === 'public' ? L('已公開', 'Public') : m.status === 'private' ? L('只在你的島上', 'Only on your island') : L('等老師核准', 'Waiting')}</span>${m.status === 'public' && m.likes ? `<span>❤️ ${m.likes}</span>` : ''}`;
  function mineHTML() {
    const drops = box.drops.slice().reverse().map((d) => `<div class="mitem ${d.read ? '' : 'new'}"><div class="mm"><span class="mpill ok">🐦 ${d.to === 'me' ? L('老師寫給你', 'From your teacher') : L('老師寫給全班', 'To the whole class')}</span><span>${fmt(d.at)}</span></div>
      <div class="mt" style="margin-top:6px">${esc(d.text)}</div></div>`);
    const mine = box.mine.slice().reverse().map((m) => `<div class="mitem ${m.reply && !m.read ? 'new' : ''}"><div class="mt">${esc(m.text)}</div>
      <div class="mm">${statusPill(m)}<span>${fmt(m.at)}</span></div>
      ${m.reply ? `<div class="mr"><b>✈️ ${L('老師回覆', 'Teacher replied')}・${fmt(m.replyAt)}</b>${esc(m.reply)}</div>` : ''}</div>`);
    const all = [...drops, ...mine];
    return all.length ? `<div class="mlist">${all.join('')}</div>` : `<div class="mempty">${L('還沒有信。寫一則宣言給自己打氣吧！', 'No letters yet. Write a declaration!')}</div>`;
  }
  function boardHTML() {
    if (!box.board.length) return `<div class="mempty">${L('還沒有公開的宣言', 'No declarations yet')}</div>`;
    return `<div class="mlist">${box.board.map((b) => `<div class="mitem mboard"><div class="ava2">${avatarSVG(safeLook(b.look), 'idle', 'body')}</div>
      <div style="flex:1;min-width:0"><b style="font-size:14px">${esc(b.nick)}</b><div class="mt">${esc(b.text)}</div>
      <div class="mm" style="align-items:center"><span>${fmt(b.at)}</span><button class="mlike ${b.liked ? 'on' : ''}" data-mlike="${esc(b.id)}" ${b.liked ? 'disabled' : ''}>${b.liked ? '❤️' : '🤍'} ${b.likes || 0}</button></div></div></div>`).join('')}</div>`;
  }
  async function send(btn) {
    const ta = $('mText'), text = (ta.value || '').trim().replace(/\s+/g, ' ');
    if (!text) return ta.focus();
    if (BAD.test(text)) { $('mErr').textContent = L('有不適合的字，換個說法吧', 'Please use kind words'); return; }
    btn.disabled = true; btn.textContent = L('送出中…', 'Sending…'); $('mErr').textContent = '';
    try {
      const r = await C().api('postMessage', { type: kind, text });
      box.mine.push({ id: r.id, type: kind, text, status: r.status, reply: '', replyAt: 0, read: true, at: r.at || Date.now(), likes: 0 });
      box.used = r.used != null ? r.used : box.used + 1;
      paint(); confetti(30);
      toast(kind === 'decl' ? L('📜 宣言插在你的島上了！等老師核准就會公開給同學', '📜 Posted on your island!') : L('🤫 悄悄話送出了，只有老師看得到', '🤫 Sent to your teacher'));
      tab = 'mine'; open();
    } catch (e) { if ($('mErr')) $('mErr').textContent = e.message; btn.disabled = false; btn.textContent = L('送出', 'Send'); }
  }
  async function markAll() {
    const ids = unreadReplies().map((m) => m.id), drops = unreadDrops().map((d) => d.id);
    if (!ids.length && !drops.length) return;
    box.mine.forEach((m) => { if (ids.includes(m.id)) m.read = true; });
    box.drops.forEach((d) => { if (drops.includes(d.id)) d.read = true; });
    paint();
    try { await C().api('markRead', { ids, drops }); } catch (e) {}
  }
  async function like(id, btn) {
    btn.disabled = true;
    try {
      const r = await C().api('likeDeclaration', { id });
      [...box.board, ...box.mates.map((m) => m.decl).filter(Boolean)].forEach((b) => { if (b.id === id) { b.likes = r.likes; b.liked = true; } });
      btn.classList.add('on'); btn.textContent = `❤️ ${r.likes}`;
    } catch (e) { toast(e.message); btn.disabled = false; }
  }

  // ── 送信動畫：老師回覆＝紙飛機、空降＝小鳥叼信；飛到信箱，點了打開 ──
  const PLANE = `<svg viewBox="0 0 48 48"><path d="M4 22 L44 6 L30 42 L22 28 Z" fill="#fff" stroke="#1a3a1a" stroke-width="2.5" stroke-linejoin="round"/><path d="M44 6 L22 28 L20 38 L26 31" fill="#E8F7F5" stroke="#1a3a1a" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
  function deliver() {
    if (flying || !on() || !$('v-home').classList.contains('active') || $('modal').classList.contains('show')) return;
    const r = unreadReplies()[0], d = unreadDrops()[0];
    if (!r && !d) return;
    const card = document.querySelector('.island-card'), btn = $('mailBtn');
    if (!card || !btn || btn.hidden) return;
    flying = true;
    const el = document.createElement('div'); el.className = 'flyer';
    el.innerHTML = d && !r ? '<span style="display:inline-block;transform:scaleX(-1)">🐦</span><span style="font-size:20px;margin-left:-14px">✉️</span>' : PLANE;
    el.setAttribute('role', 'button'); el.setAttribute('aria-label', L('有一封信', 'You have a letter'));
    document.body.appendChild(el);
    const cr = card.getBoundingClientRect(), br = btn.getBoundingClientRect();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const x0 = cr.left - 60, y0 = cr.top + cr.height * 0.55, x1 = br.left + br.width / 2 - 23, y1 = br.top + br.height / 2 - 23;
    const dur = reduce ? 1 : 2600, t0 = performance.now();
    let landed = false;
    const done = () => { if (!el.isConnected) return; el.remove(); flying = false; };
    el.onclick = () => { done(); openLetter(); };
    const stepF = (now) => {
      if (!el.isConnected) return;
      const k = Math.min(1, (now - t0) / dur);
      // 從島的左邊飛進來，繞一個大弧，最後降落在信箱上
      const x = x0 + (x1 - x0) * k + Math.sin(k * Math.PI * 2) * 40 * (1 - k);
      const y = y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * cr.height * 0.35;
      const ang = Math.atan2(y1 - y0 - Math.cos(k * Math.PI) * cr.height * 0.35 * Math.PI, x1 - x0) * 180 / Math.PI;
      el.style.transform = `translate(${x}px, ${y}px) rotate(${(ang * (1 - k)).toFixed(1)}deg)`;
      if (k < 1) return requestAnimationFrame(stepF);
      if (!landed) { landed = true; btn.classList.add('shake'); setTimeout(() => btn.classList.remove('shake'), 1100); }
      // 停在信箱上上下浮動，等學生點
      const bob = () => { if (!el.isConnected) return; const b = Math.sin(performance.now() / 300) * 4; el.style.transform = `translate(${x1}px, ${y1 - 18 + b}px)`; requestAnimationFrame(bob); };
      bob();
    };
    el.style.left = '0'; el.style.top = '0';
    requestAnimationFrame(stepF);
    deliver.cancel = done;
  }
  function openLetter() {
    const r = unreadReplies()[0], d = r ? null : unreadDrops()[0];
    if (!r && !d) return open('mine');
    $('sheet').innerHTML = `<div class="mletter">
        <h4>${r ? `✈️ ${L('老師回覆你的', 'Your teacher replied to your')}${r.type === 'decl' ? L('宣言', ' declaration') : L('悄悄話', ' note')}` : `🐦 ${d.to === 'me' ? L('老師寫給你', 'A letter from your teacher') : L('老師寫給全班', 'A letter to the whole class')}`}</h4>
        ${r ? `<div class="q">${esc(r.text)}</div>` : ''}
        <div>${esc(r ? r.reply : d.text)}</div>
        ${r && r.type === 'decl' ? `<div style="margin-top:10px">${statusPill(r)}</div>` : ''}
      </div>
      <div class="btnrow" style="margin-top:14px"><button class="btn" data-mnext="1">${unreadReplies().length + unreadDrops().length > 1 ? L('下一封 ›', 'Next ›') : L('好', 'OK')}</button><button class="btn ghost" data-mtab="mine">${L('看全部的信', 'All letters')}</button></div>`;
    $('modal').classList.add('show');
    if (r) r.read = true; else d.read = true;
    paint();
    C().api('markRead', r ? { ids: [r.id], drops: [] } : { ids: [], drops: [d.id] }).catch(() => {});
    confetti(30);
  }

  // ── 同學分身 ──
  const mateTags = (m) => {
    const t = [];
    if (m.decl) t.push({ text: '📜 ' + (m.decl.text.length > 12 ? m.decl.text.slice(0, 12) + '…' : m.decl.text), bg: '#ffffff', fg: '#1a3a1a', size: 26 });
    t.push({ text: m.nick || L('同學', 'Classmate'), bg: '#1a3a1a', fg: '#CCFF00', size: 28 });
    return t;
  };
  function mates() {
    if (!on()) return [];
    const open = allUnits();
    return box.mates.slice(0, MATE_MAX).map((m) => ({ key: m.key, nick: m.nick, at: open.includes(m.at) ? m.at : open[0], look: safeLook(m.look), decl: m.decl, tags: mateTags(m) }));
  }
  function openMate(key) {
    const m = box.mates.find((x) => x.key === key); if (!m) return;
    $('sheet').innerHTML = `<div style="text-align:center"><div style="width:140px;height:170px;margin:0 auto;border-radius:22px;background:#C9EEEA;border:2px solid var(--green);padding:6px">${avatarSVG(safeLook(m.look), 'idle')}</div>
      <h3 style="margin:10px 0 0">${esc(m.nick || L('同學', 'Classmate'))}</h3>
      ${m.decl ? `<div class="mitem" style="margin-top:12px;text-align:left"><div class="mt">📜 ${esc(m.decl.text)}</div>
        <div class="mm" style="justify-content:flex-end"><button class="mlike ${m.decl.liked ? 'on' : ''}" data-mlike="${esc(m.decl.id)}" ${m.decl.liked ? 'disabled' : ''}>${m.decl.liked ? '❤️' : '🤍'} ${m.decl.likes || 0}</button></div></div>`
        : `<p class="note">${L('還沒有公開的宣言', 'No declaration yet')}</p>`}
      </div><div class="btnrow" style="margin-top:14px"><button class="btn ghost" data-close="1">${L('關閉', 'Close')}</button></div>`;
    $('modal').classList.add('show');
  }
  // 2D：在自己最後去的單元附近，沿小路來回散步（走一段、停一下）
  let walkers = [], raf2 = 0;
  function draw2D() {
    const g = $('mates'), road = $('islandRoad'); walkers = [];
    if (!g) return;
    const list = mates();
    if (!list.length || !road || !st.roadLens) { g.innerHTML = ''; return; }
    const total = road.getTotalLength();
    g.innerHTML = list.map((m, i) => {
      const base = st.roadLens[m.at] != null ? st.roadLens[m.at] : total * 0.5;
      const home = Math.max(10, Math.min(total - 10, base + (i % 2 ? 1 : -1) * (24 + (i % 3) * 10)));
      walkers.push({ home, l: home, to: home, pause: 600 + i * 700, left: i % 2 === 0, moving: false });
      const tag = m.decl ? (m.decl.text.length > 10 ? m.decl.text.slice(0, 10) + '…' : m.decl.text) : '';
      return `<g data-mate="${esc(m.key)}" role="button" tabindex="0" aria-label="${esc(m.nick)}"><g class="mpos">
        <g class="mflip"><g class="av idle">${avatarParts(m.look)}</g></g>
        ${tag ? `<g><rect x="-70" y="-96" width="240" height="46" rx="23" fill="#ffffff" stroke="#1a3a1a" stroke-width="3"/><text x="50" y="-64" text-anchor="middle" font-size="27" font-weight="700" fill="#1a3a1a">📜 ${esc(tag)}</text></g>` : ''}
        <g><rect x="${50 - Math.min(90, 20 + (m.nick || '').length * 11)}" y="${tag ? -44 : -54}" width="${Math.min(180, 40 + (m.nick || '').length * 22)}" height="40" rx="20" fill="#1a3a1a"/>
          <text x="50" y="${tag ? -16 : -26}" text-anchor="middle" font-size="27" font-weight="800" fill="#CCFF00">${esc(m.nick || '')}</text></g>
      </g></g>`;
    }).join('');
    place2D();
    cancelAnimationFrame(raf2); last2 = performance.now(); raf2 = requestAnimationFrame(tick2D);
  }
  function place2D() {
    const road = $('islandRoad'); if (!road) return;
    document.querySelectorAll('#mates [data-mate]').forEach((el, i) => {
      const w = walkers[i]; if (!w) return;
      const p = road.getPointAtLength(w.l);
      el.querySelector('.mpos').setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(.36) translate(-50 -136)`);
      el.querySelector('.mflip').setAttribute('transform', w.left ? 'translate(100 0) scale(-1 1)' : '');
      const av = el.querySelector('.av'); av.classList.toggle('walk', w.moving); av.classList.toggle('idle', !w.moving);
    });
  }
  let last2 = 0;
  function tick2D(now) {
    raf2 = requestAnimationFrame(tick2D);
    const dt = Math.min(100, now - last2); last2 = now;
    if (!walkers.length || document.hidden || !$('v-home').classList.contains('active') || $('island').hidden) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    walkers.forEach((w) => {
      if (w.pause > 0) { w.pause -= dt; w.moving = false; return; }
      if (Math.abs(w.to - w.l) < 0.5) { w.to = w.home + (Math.random() * 2 - 1) * 22; w.pause = 1200 + Math.random() * 2600; w.moving = false; return; }
      const dir = Math.sign(w.to - w.l); w.l += dir * Math.min(Math.abs(w.to - w.l), dt * 0.018); w.moving = true;
      const road = $('islandRoad'), a = road.getPointAtLength(w.l - dir), b = road.getPointAtLength(w.l);
      if (Math.abs(b.x - a.x) > 0.05) w.left = b.x < a.x;
    });
    place2D();
  }
  let matesKey = null;
  function redrawMates() {   // 同學資料有變才重畫（不然散步會一直被打斷）
    const k = JSON.stringify(mates()); if (k === matesKey) return; matesKey = k;
    if ($('mates')) draw2D();
    if (typeof i3d !== 'undefined' && i3d && i3d.update) i3d.update();
  }

  // ── 造型和位置：有變才上傳（給同學看到的分身）──
  let avKey = '';
  async function syncAvatar() {
    if (!on() || !st.profile) return;
    const at = st.meta.avatarAt || '', look = lookOf(), k = JSON.stringify([look, at, st.profile.name]);
    if (k === avKey) return;
    try { await C().api('setAvatar', { look, at, nick: st.profile.name }); avKey = k; try { await db.set('msgav', k); } catch (e) {} } catch (e) {}
  }

  // ── 事件 ──
  document.addEventListener('click', (e) => {
    if (e.target.closest('#mailBtn')) { if (deliver.cancel && flying) deliver.cancel(); return unreadReplies().length || unreadDrops().length ? openLetter() : open(); }
    if (e.target.closest('#declStrip')) return open('mine');
    const mt = e.target.closest('#mates [data-mate]'); if (mt) { e.stopPropagation(); return openMate(mt.dataset.mate); }
    const t = e.target.closest('[data-mtab],[data-mkind],[data-msend],[data-mlike],[data-mnext]'); if (!t) return;
    if (t.dataset.mtab) return open(t.dataset.mtab);
    if (t.dataset.mkind) { const v = $('mText') ? $('mText').value : ''; kind = t.dataset.mkind; open('write'); $('mText').value = v; $('mCount').textContent = v.length; return; }
    if (t.dataset.msend) return send(t);
    if (t.dataset.mlike) return like(t.dataset.mlike, t);
    if (t.dataset.mnext) { if (unreadReplies().length || unreadDrops().length) return openLetter(); $('modal').classList.remove('show'); return; }
  }, true);
  document.addEventListener('input', (e) => { if (e.target.id === 'mText') $('mCount').textContent = e.target.value.length; });
  addEventListener('cloud-auth', () => { paint(); if (on()) { pull(true); syncAvatar(); } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pull(false); });
  setInterval(() => { if (on()) { syncAvatar(); deliver(); if ($('v-home').classList.contains('active')) pull(false); } }, 15000);
  const ready = () => (st.ready ? Promise.resolve() : new Promise((r) => addEventListener('island-ready', r, { once: true })));
  ready().then(async () => {
    try { const b = await db.get('msgbox'); if (b) box = b; avKey = (await db.get('msgav')) || ''; } catch (e) {}
    paint();
    if (on()) { pull(true); syncAvatar(); }
  });

  window.islandMsg = { open, pull, paint, draw2D, mates, openMate, deliver, syncAvatar, _box: () => box };
})();
