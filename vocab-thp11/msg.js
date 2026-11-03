// 英文順起來．探索英文島 - 留言、宣言、空降與同學分身（msg.js v2：加老師模式）
// 只在登入雲端帳號後出現（用 cloud.js 的 api）；後台是英文島後台 GAS 的「留言.gs」
//
// 悄悄話：只有老師看得到。宣言：馬上出現在自己的島上；老師核准後同班同學也看得到（公布欄、同學分身頭上）
// 老師回覆 → 紙飛機飛到信箱；老師空降（給一個人或全班）→ 小鳥叼信飛來；點了才打開
// 同學分身：同班同學的角色在他最後去的單元附近散步（不即時連線、不顯示真名和積分）
(() => {
  const MAX_LEN = 60, PULL_GAP = 30000, MATE_MAX = 12;
  const BAD = /幹|靠北|靠杯|白癡|白痴|智障|去死|垃圾|笨蛋|fuck|shit|bitch|stupid|idiot/i;   // 常見不雅字，後台會再擋一次
  const C = () => window.cloud;
  const authed = () => !!(C() && C().on && C().auth && C().auth());
  let served = false;   // 後台第一次成功回應 inbox 才顯示信箱（後台還沒裝 留言.gs 時整個功能藏起來）
  const on = () => authed() && served;
  let box = { mine: [], drops: [], board: [], mates: [], used: 0, max: 3 };
  let pulledAt = 0, pulling = null, tab = 'write', kind = 'decl', flying = false;
  const likedHere = {};   // 這次打開 App 按過的讚（收信時伺服器資料可能比按讚早一步，不能被蓋掉）
  const fmt = (t) => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const unreadReplies = () => box.mine.filter((m) => m.reply && !m.read);
  const unreadDrops = () => box.drops.filter((d) => !d.read);

  // ── 老師模式（msg.js v2，2026/11/03）：班級「老師」的帳號，信箱換成 小鳥信／待核准／留言／公布欄；後台是「老師.gs」──
  const T_LEN = 200;
  let tbox = null, tOk = true, tTo = '全部', tFilter = 'all';
  const isT = () => authed() && C().auth().cls === '老師';
  const tOn = () => isT() && !!tbox;
  const tPend = () => (tbox ? tbox.msgs.filter((m) => m.type === 'decl' && m.status === 'pending') : []);
  const tNew = () => (tbox ? tbox.msgs.filter((m) => m.type === 'whisper' && m.status === 'new') : []);
  (() => {
    const s = document.createElement('style');
    s.textContent = `.tlab{display:block;font-size:12px;font-weight:700;color:var(--muted);margin:10px 0 4px}
.tsel{width:100%;box-sizing:border-box;border-radius:12px;border:2px solid var(--line);background:var(--card);color:var(--ink);padding:9px 10px;font:600 15px 'Noto Sans TC',sans-serif}
.tsel:focus{outline:none;border-color:var(--mint)}
.tmeta{display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:12px;color:var(--muted)}.tmeta b{color:var(--ink);font-size:14px}
.tbtns{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}.tbtns .btn{flex:1;min-width:84px;padding:8px 10px;font-size:14px}
.tbtns .btn.sel{box-shadow:0 0 0 3px rgba(204,255,0,.35)}
.tre{min-height:60px;margin-top:8px}
.tchips{display:flex;gap:6px;margin:4px 0 8px}.tchips button{border:2px solid var(--line);background:var(--card);color:var(--ink);border-radius:20px;padding:4px 12px;font:700 12px 'Noto Sans TC',sans-serif;cursor:pointer}.tchips button.on{border-color:var(--lime);color:var(--lime)}
.tpin{border-color:var(--lime);margin-bottom:8px}`;
    document.head.appendChild(s);
  })();
  const myDecl = () => box.mine.filter((m) => m.type === 'decl' && m.status !== 'private').pop() || box.mine.filter((m) => m.type === 'decl').pop();

  // ── 拉信：打開 App、回到首頁時（最多每分鐘一次）──
  async function pull(force) {
    if (!authed()) return;
    if (pulling) return pulling;
    if (!force && Date.now() - pulledAt < PULL_GAP) return;
    pulling = (async () => {
      try {
        const d = await C().api('inbox', { since: pulledAt });
        served = true;
        box = { mine: d.mine || [], drops: d.drops || [], board: d.board || [], mates: d.mates || [], used: d.used || 0, max: d.max || 3 };
        [...box.board, ...box.mates.map((m) => m.decl).filter(Boolean)].forEach((b) => { if (likedHere[b.id]) { b.liked = true; b.likes = Math.max(b.likes || 0, likedHere[b.id]); } });
        pulledAt = Date.now();
        if (isT() && tOk) {
          try { tbox = await C().api('tInbox', {}); }
          catch (e) { if (/沒有這個 action|只有老師/.test(e.message)) { tOk = false; tbox = null; } }   // 後台還沒裝 老師.gs：照學生版
        }
        try { await db.set('msgbox', box); } catch (e) {}
        paint(); deliver();
      } catch (e) { if (/沒有這個 action/.test(e.message)) { served = false; pulledAt = Date.now() + 29 * 60000; paint(); } }   // 後台還沒裝 留言.gs：30 分鐘後再試，不要一直打；其他錯誤（沒網路）下次再拉
      finally { pulling = null; }
    })();
    return pulling;
  }

  // ── 頭上顯示宣言（自己和同學）：學生自己開關，預設開 ──
  const headOn = () => st.set.declHead !== false;
  function headDecl() { const d = on() && headOn() && myDecl(); return d ? d.text : ''; }
  let heroKeyNow = '';
  function refreshHero() {   // 宣言或開關改了：重畫自己的角色（2D）、通知 3D
    const k = headDecl(); if (k === heroKeyNow) return; heroKeyNow = k;
    if (typeof placeHero === 'function' && $('heroPos') && !st.walking) placeHero();
    if (typeof i3d !== 'undefined' && i3d && i3d.update) i3d.update();
  }
  function toggleHead() {
    st.set.declHead = !headOn(); saveSet();
    toast(headOn() ? L('📜 頭上會顯示宣言', '📜 Declarations shown above heads') : L('頭上不顯示宣言了（暱稱照樣顯示）', 'Declarations hidden'));
    matesKey = null; paint();
  }

  // ── 首頁：信箱按鈕、未讀數、我的宣言（地圖正上方）──
  function paint() {
    const btn = $('mailBtn'), strip = $('declStrip'); if (!btn) return;
    btn.hidden = !on(); if (!on()) { strip.hidden = true; redrawMates(); refreshHero(); return; }
    const n = unreadReplies().length + unreadDrops().length + tPend().length + tNew().length;
    $('mailDot').hidden = !n; $('mailDot').textContent = n;
    const d = myDecl();
    strip.hidden = false;
    if (tOn()) {   // 老師：地圖上方改成寫小鳥信的入口
      const k = tPend().length, w = tNew().length;
      strip.innerHTML = `🐦 <b class="new">${L('寫小鳥信給大家 ›', 'Send a bird letter ›')}</b><small>${k ? L(`待核准 ${k}`, `${k} to review`) : ''}${k && w ? '・' : ''}${w ? L(`新悄悄話 ${w}`, `${w} new notes`) : ''}</small>`;
      redrawMates(); refreshHero(); return;
    }
    const sw = `<button class="dh ${headOn() ? 'on' : ''}" data-declhead="1" aria-pressed="${headOn()}">${headOn() ? L('頭上顯示 ✓', 'Above head ✓') : L('頭上不顯示', 'Not above head')}</button>`;
    strip.innerHTML = d
      ? `📜 <b>${esc(d.text)}</b><small>${d.status === 'public' ? L('同學看得到', 'Public') : d.status === 'private' ? L('只在你的島上', 'Only on your island') : L('等老師核准', 'Waiting')}</small>${sw}`
      : `📜 <b class="new">${L('寫下你這週的宣言 ›', 'Write your goal for this week ›')}</b>${sw}`;
    redrawMates(); refreshHero();
  }

  // ── 信箱 ──
  function open(t, fresh) {
    if (t) tab = t;
    const wasT = tOn();
    if (!fresh) Promise.resolve(pull(true)).then(() => { if ($('modal').classList.contains('show') && $('mBody') && ((tab !== 'write' && tab !== 'send') || tOn() !== wasT)) open(tab, true); });   // 打開信箱一定重新收信（正在打字的分頁不重畫）
    const nR = unreadReplies().length + unreadDrops().length;
    const T = tOn();
    const tabs = T
      ? [['send', L('🐦 小鳥信', '🐦 Bird')], ['review', L('✅ 待核准', '✅ Review'), tPend().length], ['notes', L('💬 留言', '💬 Notes'), tNew().length], ['board', L('📌 公布欄', '📌 Board')]]
      : [['write', L('✏️ 寫信', '✏️ Write')], ['mine', L('📬 我的信', '📬 My letters'), nR], ['board', L('📌 公布欄', '📌 Board')]];
    if (!tabs.some((x) => x[0] === tab)) tab = tabs[0][0];
    const body = { write: writeHTML, mine: mineHTML, board: boardHTML, send: tSendHTML, review: tReviewHTML, notes: tNotesHTML }[tab];
    $('sheet').innerHTML = `<h3 style="margin-top:0">📮 ${T ? L('老師信箱', 'Teacher mailbox') : L('島上信箱', 'Island mailbox')} <small>MAILBOX</small></h3>
      <div class="mtabs">${tabs.map(([k, n, c]) => `<button data-mtab="${k}" class="${tab === k ? 'on' : ''}">${n}${c ? `<i>${c}</i>` : ''}</button>`).join('')}</div>
      <div id="mBody">${body()}</div>
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
  // 公布欄最上面：最新一封寄給全部或自己班的小鳥信
  function pinHTML() {
    const p = box.drops.filter((d) => d.to !== 'me').slice().sort((a, b) => b.at - a.at)[0];
    return p ? `<div class="mitem tpin"><div class="mm"><span class="mpill ok">📌 ${L('老師的話', 'From your teacher')}</span><span>${fmt(p.at)}</span></div>
      <div class="mt" style="margin-top:6px">${esc(p.text)}</div></div>` : '';
  }
  function boardHTML() {
    const pin = pinHTML();
    if (!box.board.length) return pin + `<div class="mempty">${L('還沒有公開的宣言', 'No declarations yet')}</div>`;
    return pin + `<div class="mlist">${box.board.map((b) => `<div class="mitem mboard"><div class="ava2">${avatarSVG(safeLook(b.look), 'idle', 'body')}</div>
      <div style="flex:1;min-width:0"><b style="font-size:14px">${esc(b.nick)}</b><div class="mt">${esc(b.text)}</div>
      <div class="mm" style="align-items:center"><span>${fmt(b.at)}</span><button class="mlike ${b.liked ? 'on' : ''}" data-mlike="${esc(b.id)}" ${b.liked ? 'disabled' : ''}>${b.liked ? '❤️' : '🤍'} ${b.likes || 0}</button></div></div></div>`).join('')}</div>`;
  }
  // ── 老師：小鳥信、待核准、留言 ──
  const toName = (to) => (to === '全部' ? L('全部', 'Everyone') : to);
  const who = (m) => `<div class="tmeta"><b>${esc(m.nick || m.sid)}</b><span>${esc(m.cls)}・${esc(m.sid)}${m.name ? '・' + esc(m.name) : ''}</span><span>${fmt(m.at)}</span></div>`;
  function tSendHTML() {
    const opts = [['全部', L('全部（所有班）', 'Everyone')], ...tbox.classes.map((c) => [c, c]), ['@', L('某個學生（填學號）', 'One student')]];
    const sent = tbox.drops.map((d) => `<div class="mitem"><div class="mm"><span class="mpill ok">🐦 ${esc(toName(d.to))}</span><span>${fmt(d.at)}</span>${d.until ? `<span>${L('到', 'until')} ${esc(d.until)}</span>` : ''}<span>${L(`${d.reads} 人看過`, `${d.reads} read`)}</span></div>
      <div class="mt" style="margin-top:6px">${esc(d.text)}</div></div>`).join('');
    return `<label class="tlab" for="tTo">${L('寄給', 'To')}</label>
      <select id="tTo" class="tsel">${opts.map(([v, n]) => `<option value="${esc(v)}" ${v === tTo ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
      <input id="tSid" class="tsel" style="margin-top:6px" inputmode="numeric" placeholder="${L('學號，例 1101', 'Student no., e.g. 1101')}" ${tTo === '@' ? '' : 'hidden'}>
      <label class="tlab" for="tText">${L('內容', 'Message')}</label>
      <textarea class="mta" id="tText" maxlength="${T_LEN}" placeholder="${L('例如：這週大家都很努力！', 'e.g. Great work this week!')}"></textarea>
      <div class="mcount"><span id="tCount">0</span> / ${T_LEN}</div>
      <label class="tlab" for="tUntil">${L('顯示到哪一天（可不填）', 'Show until (optional)')}</label>
      <input id="tUntil" class="tsel" type="date">
      <p class="cerr" id="tErr"></p>
      <div class="btnrow" style="margin-top:6px"><button class="btn" data-tsend="1">🐦 ${L('送出', 'Send')}</button></div>
      <p class="note" style="margin-top:8px">${L('學生下次打開 App 會看到小鳥叼信飛來；寄給全部或一班的，也會釘在公布欄最上面。', 'Students see a bird bring the letter next time they open the app; letters to everyone or a class are pinned on the board.')}</p>
      ${sent ? `<h3>${L('最近寄出', 'Recently sent')} <small>SENT</small></h3><div class="mlist">${sent}</div>` : ''}`;
  }
  const revBtns = (m) => `<div class="tbtns"><button class="btn${m.status === 'public' ? ' sel' : ''}" data-trev="${esc(m.id)}" data-st="public">${L('公開', 'Public')}</button><button class="btn ghost${m.status === 'private' ? ' sel' : ''}" data-trev="${esc(m.id)}" data-st="private">${L('不公開', 'Private')}</button></div>`;
  const replyBox = (m) => `<div class="tbtns"><button class="btn ghost" data-treopen="${esc(m.id)}">✈️ ${m.reply ? L('改回覆', 'Edit reply') : L('回覆', 'Reply')}</button></div>
      <div data-trebox="${esc(m.id)}" hidden><textarea class="mta tre" maxlength="200" placeholder="${L('回覆的話（學生會收到紙飛機）', 'Your reply (sent as a paper plane)')}">${esc(m.reply || '')}</textarea>
      <div class="tbtns"><button class="btn" data-treply="${esc(m.id)}">${L('送出回覆', 'Send reply')}</button></div></div>`;
  function tReviewHTML() {
    const list = tPend();
    if (!list.length) return `<div class="mempty">${L('沒有待核准的宣言 🎉', 'Nothing to review 🎉')}</div>`;
    return `<div class="mlist">${list.map((m) => `<div class="mitem">${who(m)}<div class="mt" style="margin-top:6px">📜 ${esc(m.text)}</div>${revBtns(m)}${replyBox(m)}</div>`).join('')}</div>`;
  }
  function tNotesHTML() {
    const list = tbox.msgs.filter((m) => tFilter === 'all' || m.type === tFilter);
    const chips = [['all', L('全部', 'All')], ['whisper', L('🤫 悄悄話', '🤫 Notes')], ['decl', L('📜 宣言', '📜 Declarations')]];
    return `<div class="tchips">${chips.map(([k, n]) => `<button data-tfil="${k}" class="${tFilter === k ? 'on' : ''}">${n}</button>`).join('')}</div>
      ${list.length ? `<div class="mlist">${list.map((m) => `<div class="mitem ${m.type === 'whisper' && m.status === 'new' ? 'new' : ''}">${who(m)}
        <div class="mt" style="margin-top:6px">${m.type === 'decl' ? '📜 ' : '🤫 '}${esc(m.text)}</div>
        <div class="mm">${statusPill(m)}</div>
        ${m.reply ? `<div class="mr"><b>✈️ ${L('你的回覆', 'Your reply')}・${fmt(m.replyAt)}${m.read ? L('・學生看過了', ' · read') : ''}</b>${esc(m.reply)}</div>` : ''}
        ${m.type === 'decl' ? revBtns(m) : ''}${replyBox(m)}</div>`).join('')}</div>` : `<div class="mempty">${L('還沒有留言', 'No messages yet')}</div>`}`;
  }
  async function tSend(btn) {
    const sel = $('tTo').value, to = sel === '@' ? ($('tSid').value || '').trim() : sel, text = ($('tText').value || '').trim();
    if (sel === '@' && !to) return $('tSid').focus();
    if (!text) return $('tText').focus();
    btn.disabled = true; btn.textContent = L('送出中…', 'Sending…'); $('tErr').textContent = '';
    try {
      await C().api('tPostDrop', { to, text, until: $('tUntil').value || '' });
      toast(L(`🐦 小鳥信寄給${toName(to)}了`, `🐦 Sent to ${toName(to)}`)); confetti(30);
      await pull(true); open('send', true);
    } catch (e) { if ($('tErr')) $('tErr').textContent = e.message; btn.disabled = false; btn.textContent = '🐦 ' + L('送出', 'Send'); }
  }
  async function tReview(id, status, btn) {
    btn.disabled = true;
    try {
      await C().api('tReview', { id, status });
      const m = tbox.msgs.find((x) => x.id === id); if (m) m.status = status;
      toast(status === 'public' ? L('📜 公開了，同班同學看得到', '📜 Now public') : L('只留在學生自己的島上', 'Kept private'));
      paint(); open(tab, true);
    } catch (e) { toast(e.message); btn.disabled = false; }
  }
  async function tReply(id, btn) {
    const ta = document.querySelector(`[data-trebox="${CSS.escape(id)}"] textarea`), text = (ta.value || '').trim();
    btn.disabled = true;
    try {
      const r = await C().api('tReply', { id, text });
      const m = tbox.msgs.find((x) => x.id === id);
      if (m) { m.reply = text; m.replyAt = r.replyAt || Date.now(); m.read = false; if (text && m.type === 'whisper' && m.status === 'new') m.status = 'seen'; }
      toast(text ? L('✈️ 回覆送出了', '✈️ Reply sent') : L('回覆收回了', 'Reply removed'));
      paint(); open(tab, true);
    } catch (e) { toast(e.message); btn.disabled = false; }
  }

  async function send(btn) {
    const ta = $('mText'), text = (ta.value || '').trim().replace(/\s+/g, ' ');
    if (!text) return ta.focus();
    if (BAD.test(text)) { $('mErr').textContent = L('有不適合的字，換個說法吧', 'Please use kind words'); return; }
    btn.disabled = true; btn.textContent = L('送出中…', 'Sending…'); $('mErr').textContent = '';
    try {
      const r = await C().api('postMessage', { type: kind, text, at: st.meta.avatarAt || '' });
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
      likedHere[id] = r.likes;
      [...box.board, ...box.mates.map((m) => m.decl).filter(Boolean)].forEach((b) => { if (b.id === id) { b.likes = r.likes; b.liked = true; } });
      btn.classList.add('on'); btn.textContent = `❤️ ${r.likes}`;
      document.querySelectorAll(`[data-mlike="${CSS.escape(id)}"]`).forEach((x) => { x.classList.add('on'); x.disabled = true; x.textContent = `❤️ ${r.likes}`; });   // 畫面剛好重畫過也更新
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
    if (m.decl && headOn()) t.push({ text: '📜 ' + (m.decl.text.length > 12 ? m.decl.text.slice(0, 12) + '…' : m.decl.text), bg: '#ffffff', fg: '#1a3a1a', size: 26 });
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
      const tag = m.decl && headOn() ? (m.decl.text.length > 10 ? m.decl.text.slice(0, 10) + '…' : m.decl.text) : '';
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
    if (e.target.closest('[data-declhead]')) { e.stopPropagation(); return toggleHead(); }
    if (e.target.closest('#declStrip')) { if (tOn()) return open('send'); if (!myDecl()) { tab = 'write'; kind = 'decl'; } return open(myDecl() ? 'mine' : 'write'); }
    const mt = e.target.closest('#mates [data-mate]'); if (mt) { e.stopPropagation(); return openMate(mt.dataset.mate); }
    const t = e.target.closest('[data-mtab],[data-mkind],[data-msend],[data-mlike],[data-mnext],[data-tsend],[data-trev],[data-treopen],[data-treply],[data-tfil]'); if (!t) return;
    if (t.dataset.mtab) return open(t.dataset.mtab);
    if (t.dataset.tsend) return tSend(t);
    if (t.dataset.trev) return tReview(t.dataset.trev, t.dataset.st, t);
    if (t.dataset.treply) return tReply(t.dataset.treply, t);
    if (t.dataset.treopen) { const b = document.querySelector(`[data-trebox="${CSS.escape(t.dataset.treopen)}"]`); if (b) { b.hidden = !b.hidden; if (!b.hidden) b.querySelector('textarea').focus(); } return; }
    if (t.dataset.tfil) { tFilter = t.dataset.tfil; return open('notes', true); }
    if (t.dataset.mkind) { const v = $('mText') ? $('mText').value : ''; kind = t.dataset.mkind; open('write'); $('mText').value = v; $('mCount').textContent = v.length; return; }
    if (t.dataset.msend) return send(t);
    if (t.dataset.mlike) return like(t.dataset.mlike, t);
    if (t.dataset.mnext) { if (unreadReplies().length || unreadDrops().length) return openLetter(); $('modal').classList.remove('show'); return; }
  }, true);
  document.addEventListener('input', (e) => {
    if (e.target.id === 'mText') $('mCount').textContent = e.target.value.length;
    if (e.target.id === 'tText') $('tCount').textContent = e.target.value.length;
  });
  document.addEventListener('change', (e) => { if (e.target.id === 'tTo') { tTo = e.target.value; $('tSid').hidden = tTo !== '@'; } });
  addEventListener('cloud-auth', () => { if (!authed()) served = false; paint(); if (authed()) pull(true).then(syncAvatar); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pull(false); });
  setInterval(() => { if (!authed()) return; if (on()) { syncAvatar(); deliver(); } if ($('v-home').classList.contains('active')) pull(false); }, 15000);
  const ready = () => (st.ready ? Promise.resolve() : new Promise((r) => addEventListener('island-ready', r, { once: true })));
  ready().then(async () => {
    try { const b = await db.get('msgbox'); if (b) box = b; avKey = (await db.get('msgav')) || ''; } catch (e) {}
    paint();
    if (authed()) pull(true).then(syncAvatar);
  });

  window.islandMsg = { open, pull, paint, draw2D, mates, openMate, deliver, syncAvatar, headDecl, _box: () => box };
})();
