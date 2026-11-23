// 英文順起來．探索英文島 - 老師加分（grant.js v1，2026/11/06）
// 老師帳號：信箱多一個「🎁 加分」分頁，選學生（也可以選自己）、選島、填分數和原因 → 後台「老師加分」分頁多一張送分單
// 學生：打開 App 時收到 🎁「老師送你 N 分」，按「收下」才寫進積分帳本（bonus 的 grant:編號，一張只算一次）
// 後台：英文島後台 GAS 的「加分.gs」；還沒裝的時候整個功能藏起來
(() => {
  const C = () => window.cloud;
  const authed = () => !!(C() && C().on && C().auth && C().auth());
  const isT = () => authed() && C().auth().cls === '老師';
  const ISLES = [['vocab-thp11', 'THP11'], ['thp5', 'THP5'], ['thc6', 'THC6'], ['english-island', '測試島']];
  const PRESET = [10, 50, 100, 500, 1000], WHY_LEN = 40, MAX = 2000;
  let served = null;            // null＝還不知道；false＝後台沒裝加分.gs
  let tg = null, gTo = '', gApp = APP_ID, gPts = 100;
  let queue = [], showing = false, checking = null, checkedAt = 0;
  const has = (id) => st.ledger.bonus.some((b) => b.k === 'grant:' + id);
  const fmt = (t) => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const noAction = (e) => /沒有這個 action/.test(String(e && e.message));

  const css = document.createElement('style');
  css.textContent = `
.gift-ov{position:fixed;inset:0;z-index:420;background:rgba(5,5,12,.88);display:flex;align-items:center;justify-content:center;padding:24px}
.gift-card{max-width:340px;width:100%;text-align:center;background:linear-gradient(160deg,#1a3a1a,#0f240f);border:2px solid #CCFF00;border-radius:26px;padding:26px 20px 20px;color:#fff;box-shadow:0 0 40px rgba(204,255,0,.25)}
.gift-ic{font-size:64px;line-height:1;animation:giftBob 1.4s ease-in-out infinite}
@keyframes giftBob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-8px) rotate(4deg)}}
.gift-k{font-size:13px;color:#4ECDC4;letter-spacing:1px;margin-top:10px}
.gift-p{font-family:'Syne',sans-serif;font-weight:800;font-size:52px;color:#CCFF00;line-height:1.1;margin:6px 0;text-shadow:0 0 20px rgba(204,255,0,.45)}
.gift-why{font-size:15px;line-height:1.6;background:rgba(255,255,255,.08);border-radius:14px;padding:10px 12px;margin:8px 0 14px;word-break:break-word}
.gift-card .btn{width:100%}
.gchips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.gchips button{border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:inherit;border-radius:14px;padding:6px 12px;font:inherit;font-size:14px;cursor:pointer}
.gchips button.on{background:#CCFF00;color:#1a3a1a;border-color:#CCFF00;font-weight:700}
.gpill{display:inline-block;border-radius:10px;padding:1px 8px;font-size:12px;background:rgba(78,205,196,.18);color:#4ECDC4}
.gpill.wait{background:rgba(255,200,80,.16);color:#FFC850}`;
  document.head.appendChild(css);

  // ── 學生：收禮物 ──
  async function check(force) {
    if (!authed() || !st.ready || served === false) return;
    if (!force && Date.now() - checkedAt < 60000) return;
    if (checking) return checking;
    checking = (async () => {
      try {
        const r = await C().api('grants', { app: APP_ID });
        served = true; checkedAt = Date.now();
        for (const g of r.list || []) {
          if (has(g.id)) { C().api('claimGrant', { id: g.id, app: APP_ID }).catch(() => {}); continue; }   // 上次收下了但沒回報成功
          if (!queue.some((x) => x.id === g.id)) queue.push(g);
        }
        next();
      } catch (e) { if (noAction(e)) served = false; }
      finally { checking = null; }
    })();
    return checking;
  }
  function next() {
    if (showing || !queue.length) return;
    if (document.querySelector('.legend-ov,.gift-ov')) return setTimeout(next, 1500);
    const g = queue[0]; showing = true;
    const d = document.createElement('div');
    d.className = 'gift-ov';
    d.innerHTML = `<div class="gift-card">
      <div class="gift-ic">🎁</div>
      <div class="gift-k">${L('老師送你一份禮物', 'A GIFT FROM YOUR TEACHER')}</div>
      <div class="gift-p">+${g.pts}</div>
      <div class="gift-why">${esc(g.why || L('老師加分', 'Bonus from teacher'))}</div>
      <button class="btn" data-gtake="1">${L('收下 🎉', 'Accept 🎉')}</button></div>`;
    document.body.appendChild(d);
    d.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-gtake]'); if (!b || b.disabled) return;
      b.disabled = true;
      const before = points().total;
      if (!has(g.id)) { st.ledger.bonus.push({ t: Date.now(), k: 'grant:' + g.id, p: g.pts }); await saveLedger(); }
      queue.shift(); d.remove(); showing = false;
      confetti(80); toast(L(`🎁 +${g.pts} 分，總積分和可用積分都加了`, `🎁 +${g.pts} points added`));
      afterPoints(before);
      try { await C().api('claimGrant', { id: g.id, app: APP_ID }); } catch (e) {}
      if (C().push) C().push(true);
      setTimeout(next, 800);
    });
  }

  // ── 老師：加分分頁（放在 msg.js 的老師信箱裡）──
  async function loadT() {
    try { tg = await C().api('tGrants', {}); served = true; }
    catch (e) { if (noAction(e)) served = false; tg = { err: noAction(e) ? L('後台還沒安裝「加分.gs」', 'Backend needs 加分.gs') : e.message, students: [], list: [] }; }
    return tg;
  }
  const isleName = (v) => (ISLES.find((x) => x[0] === v || x[1] === v) || [v, v])[1];
  function tabHTML() {
    if (!tg) { loadT().then(() => { if ($('gBody')) $('gBody').innerHTML = inner(); }); return `<div id="gBody"><div class="mempty">${L('讀取中…', 'Loading…')}</div></div>`; }
    return `<div id="gBody">${inner()}</div>`;
  }
  function inner() {
    if (tg.err) return `<div class="mempty">${esc(tg.err)}</div>`;
    const me = C().auth().sid;
    if (!gTo) gTo = me;
    const stu = tg.students.map((s) => [s.sid, s.sid === me ? L(`自己（${s.sid}）`, `Me (${s.sid})`) : `${s.cls}・${s.sid}${s.nick ? '・' + s.nick : ''}${s.name ? '・' + s.name : ''}`]);
    const list = tg.list.map((g) => `<div class="mitem"><div class="mm"><b>${esc(g.nick || g.sid)}</b><span>${esc(g.sid)}</span><span>${esc(isleName(g.isl))}</span><span>${fmt(g.at)}</span></div>
      <div class="mt" style="margin-top:6px">🎁 <b>+${g.pts}</b>　${esc(g.why)}</div>
      <div class="mm" style="margin-top:4px">${g.claimedAt ? `<span class="gpill">${L('已收下', 'Accepted')} ${fmt(g.claimedAt)}</span>` : `<span class="gpill wait">${L('還沒打開', 'Not opened yet')}</span>`}</div></div>`).join('');
    return `<label class="tlab" for="gTo">${L('送給', 'To')}</label>
      <select id="gTo" class="tsel">${stu.map(([v, n]) => `<option value="${esc(v)}" ${v === gTo ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
      <label class="tlab" for="gApp">${L('哪一座島', 'Which island')}</label>
      <select id="gApp" class="tsel">${ISLES.map(([v, n]) => `<option value="${v}" ${v === gApp ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
      <label class="tlab">${L('分數', 'Points')}</label>
      <div class="gchips">${PRESET.map((n) => `<button data-gpts="${n}" class="${n === gPts ? 'on' : ''}">+${n}</button>`).join('')}</div>
      <input id="gPts" class="tsel" style="margin-top:6px" type="number" inputmode="numeric" min="1" max="${MAX}" value="${gPts}">
      <label class="tlab" for="gWhy">${L('原因（學生看得到）', 'Reason (students see it)')}</label>
      <input id="gWhy" class="tsel" maxlength="${WHY_LEN}" placeholder="${L('例如：上課回答超棒！', 'e.g. Great answers in class!')}">
      <p class="cerr" id="gErr"></p>
      <div class="btnrow" style="margin-top:6px"><button class="btn" data-gsend="1">🎁 ${L('送出加分', 'Send points')}</button></div>
      <p class="note" style="margin-top:8px">${L('學生下次打開那座島的 App 會跳出禮物，按「收下」才會加進總積分和可用積分；一張只能收一次。', 'The student gets a gift pop-up next time they open that island; points are added when they accept. Each gift counts once.')}</p>
      ${list ? `<h3>${L('最近送出', 'Recently sent')} <small>SENT</small></h3><div class="mlist">${list}</div>` : ''}`;
  }
  async function send(btn) {
    const pts = Math.round(Number($('gPts').value)), why = ($('gWhy').value || '').trim();
    gTo = $('gTo').value; gApp = $('gApp').value;
    if (!(pts >= 1 && pts <= MAX)) { $('gErr').textContent = L(`分數要在 1～${MAX} 之間`, `Points must be 1–${MAX}`); return $('gPts').focus(); }
    btn.disabled = true; btn.textContent = L('送出中…', 'Sending…'); $('gErr').textContent = '';
    try {
      await C().api('tGrant', { to: gTo, app: gApp, pts, why });
      toast(L(`🎁 送出 +${pts} 分`, `🎁 Sent +${pts}`)); confetti(30);
      await loadT();
      if (gTo === C().auth().sid && gApp === APP_ID) check(true);   // 送給自己、就在這座島 → 馬上跳禮物
      if ($('gBody')) $('gBody').innerHTML = inner();
    } catch (e) { if ($('gErr')) $('gErr').textContent = e.message; btn.disabled = false; btn.textContent = '🎁 ' + L('送出加分', 'Send points'); }
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-gpts],[data-gsend]'); if (!t) return;
    if (t.dataset.gsend) return send(t);
    gPts = +t.dataset.gpts; $('gPts').value = gPts;
    document.querySelectorAll('[data-gpts]').forEach((b) => b.classList.toggle('on', b === t));
  }, true);
  document.addEventListener('input', (e) => { if (e.target.id === 'gPts') { gPts = +e.target.value; document.querySelectorAll('[data-gpts]').forEach((b) => b.classList.toggle('on', +b.dataset.gpts === gPts)); } });
  document.addEventListener('change', (e) => { if (e.target.id === 'gTo') gTo = e.target.value; if (e.target.id === 'gApp') gApp = e.target.value; });
  addEventListener('cloud-auth', () => { served = authed() ? served : null; tg = null; gTo = ''; queue = []; if (authed()) check(true); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(false); });
  setInterval(() => check(false), 60000);
  const ready = () => (st.ready ? Promise.resolve() : new Promise((r) => addEventListener('island-ready', r, { once: true })));
  ready().then(() => setTimeout(() => check(true), 2500));

  window.islandGrant = { check, tabHTML, on: () => isT() && served !== false, reload: () => { tg = null; } };
})();
