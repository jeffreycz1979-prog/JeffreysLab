// 英文順起來．探索英文島 - 雲端帳號（cloud.js v1）
// 登入（學籍卡號＋4 位數密碼，或登入小卡 QR）、進度自動備份、換手機登入還原
// 後台是獨立的 GAS（在負責 GAS 的 Project 開發）；API 格式見 Claude Docs「英文島後台規劃」
//
// ISLAND_API 空白時整個功能隱藏，學生畫面不會有任何變化
// 測試：網址加 ?api=mock 用手機裡的模擬後台（測試帳號 12345／1234、67890／5678；QR 測試 ?api=mock&k=DEMO1）
(() => {
  const ISLAND_API = '';   // GAS 網頁應用程式網址（…/exec）
  const ID_LABEL = '學籍卡號';
  const PUSH_GAP = 2 * 60000;    // 自動備份最多每 2 分鐘一次
  const HIDE_GAP = 30000;        // App 切到背景時，距離上次備份 30 秒以上就再備份一次
  const qs = new URLSearchParams(location.search);
  const MOCK = qs.get('api') === 'mock';
  const ON = !!ISLAND_API || MOCK;
  window.cloud = { on: ON, mock: MOCK };
  if (!ON) return;

  let auth = null;        // {token, sid, nick, cls, syncedAt, syncedPts, print}
  let pending = null;     // 登入時雲端和手機都有進度，等學生選
  let pushing = null;

  // ── API：同 Gateway 三鐵律（POST、不加 Content-Type、redirect follow、檢查 ok）──
  async function api(action, params = {}) {
    let j;
    if (MOCK) j = await mockApi(action, params, auth && auth.token);
    else {
      const r = await fetch(ISLAND_API, {
        method: 'POST', redirect: 'follow',
        body: JSON.stringify({ action, token: auth ? auth.token : '', params }),
      });
      j = await r.json();
    }
    if (!j || !j.ok) {
      const e = new Error((j && j.error) || '後台沒有回應');
      e.code = j && j.code;
      if (e.code === 'AUTH' && auth) { await dropAuth(); toast('登入已失效，請重新登入'); }
      throw e;
    }
    return j.data || {};
  }

  // ── 進度快照：格式同轉移碼（profile、prog、meta、ledger、sig、set），加上給老師後台看的摘要 ──
  function snapshot() {
    return {
      app: APP_ID, v: 2, profile: st.profile, prog: st.prog, meta: st.meta, ledger: st.ledger,
      sig: st.tampered ? 'TAMPERED' : ledgerSig(),
      set: { books: st.set.books, units: st.set.units, lessons: st.set.lessons, autoSpeak: st.set.autoSpeak },
    };
  }
  function summary() {
    let islands = 0;
    try { allUnits().forEach((u) => { if (unitStations(u).full) islands++; }); } catch (e) {}
    return {
      total: points().total, wallet: walletPts(), week: weekCards(), mastered: masteredCount(), islands,
      lastActive: st.meta.lastActive || '', nick: st.profile ? st.profile.name : '',
      flags: [st.tampered ? 'tampered' : '', st.ledger.clockBad ? 'clock' : ''].filter(Boolean).join(','),
    };
  }
  const round3 = (k, v) => (typeof v === 'number' && !Number.isInteger(v) ? Math.round(v * 1000) / 1000 : v);
  const pack = () => JSON.stringify(snapshot(), round3);
  const ptsOf = (d) => { const keep = st.ledger; st.ledger = d.ledger || { days: {}, bonus: [] }; const t = points().total; st.ledger = keep; return t; };

  const saveAuth = () => db.set('auth', auth);
  async function dropAuth() { auth = null; await db.del('auth'); render(); }

  // ── 備份 ──
  let lastPack = '';
  async function push(force) {
    if (!auth || !st.profile || st.meta.movedOut) return false;
    if (pushing) return pushing;
    const data = pack();
    if (!force && data === lastPack) return false;
    const sum = summary();
    pushing = (async () => {
      try {
        const res = await api('pushProgress', { data, summary: sum, localAt: Date.now(),
          drop: auth.syncedPts != null && sum.total < auth.syncedPts });   // 積分變少（例如按了全部重來）→ 請後台保留上一版
        lastPack = data;
        auth.syncedAt = res.serverAt || Date.now(); auth.syncedPts = sum.total; await saveAuth();
        render(); return true;
      } catch (e) { if (force) toast('備份失敗：' + e.message); return false; }
      finally { pushing = null; }
    })();
    return pushing;
  }
  setInterval(() => { if (auth && Date.now() - (auth.syncedAt || 0) >= PUSH_GAP) push(false); }, 60000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && auth && Date.now() - (auth.syncedAt || 0) >= HIDE_GAP) push(false);
  });

  // ── 套用雲端進度（換手機、選「用雲端的」）──
  async function applyCloud(d) {
    if (!d || d.app !== APP_ID || !d.prog) throw new Error('雲端資料格式不對');
    st.profile = d.profile || st.profile; st.prog = d.prog; st.meta = { ...st.meta, ...d.meta };
    delete st.meta.movedOut;
    st.ledger = d.ledger || { days: {}, bonus: [] };
    if (d.set) st.set = { ...st.set, ...d.set, csvUrl: st.set.csvUrl };
    st.tampered = d.sig !== ledgerSig();   // 雲端資料被改過，異常標記照樣留著
    await db.set('profile', st.profile); await saveProg(); await saveMeta(); await saveSet(); await saveLedger();
    lastPack = pack();
    $('onb').classList.remove('show'); $('modal').classList.remove('show'); checkLock();
    st.cur = null; renderHeader(); renderFilters(); renderHome(); renderMe(); showView('v-home');
  }

  // ── 登入 ──
  async function login(params) {
    const res = await api('login', params);
    auth = { token: res.token, sid: res.sid || params.sid || '', nick: res.nick || '', cls: res.cls || '', syncedAt: 0, syncedPts: null };
    await saveAuth();
    const pull = await api('pullProgress');
    const cloud = pull.data ? (typeof pull.data === 'string' ? JSON.parse(pull.data) : pull.data) : null;
    if (cloud && !st.profile) {
      await applyCloud(cloud); auth.syncedAt = pull.at || Date.now(); auth.syncedPts = points().total; await saveAuth();
      toast(`歡迎回來，${st.profile.name}！雲端進度已還原 ☁️`);
    } else if (cloud && st.profile) {
      const here = points().total, there = ptsOf(cloud);
      if (pack() === JSON.stringify(cloud, round3)) { auth.syncedAt = pull.at; auth.syncedPts = here; await saveAuth(); toast('登入成功 ✅'); }
      else { pending = cloud; return openChoice(here, there, cloud); }
    } else if (!cloud && st.profile) {
      await push(true); toast('登入成功，進度已備份到雲端 ☁️');
    } else {
      toast('登入成功！先取一個暱稱吧');
      $('modal').classList.remove('show');
      if (!$('onbName').value && auth.nick) $('onbName').value = auth.nick;
      render(); return;
    }
    $('modal').classList.remove('show'); render(); renderMe();
  }

  function openLogin() {
    $('sheet').innerHTML = `<h3 style="margin-top:0">登入英文島 <small>LOG IN</small></h3>
      <p class="note">用老師發的登入小卡：掃小卡上的 QR code 最快，或輸入${ID_LABEL}和 4 位數密碼。<br>登入後進度會自動備份，換手機直接登入就好。</p>
      <label class="clab">${ID_LABEL}</label>
      <input class="search" id="cSid" inputmode="numeric" autocomplete="username" autocapitalize="off" spellcheck="false">
      <label class="clab">密碼（4 位數）</label>
      <input class="search" id="cPin" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password">
      <p class="cerr" id="cErr"></p>
      <div class="btnrow" style="margin-top:12px"><button class="btn" data-act="cloudgo">登入</button><button class="btn ghost" data-close="1">取消</button></div>
      ${MOCK ? '<p class="note" style="margin-top:10px">🧪 模擬後台：測試帳號 12345／1234、67890／5678</p>' : ''}`;
    $('modal').classList.add('show');
    setTimeout(() => $('cSid') && $('cSid').focus(), 200);
  }
  async function submitLogin(btn) {
    const sid = ($('cSid').value || '').trim(), pin = ($('cPin').value || '').trim();
    if (!sid) return $('cSid').focus();
    if (!/^\d{4}$/.test(pin)) { $('cErr').textContent = '密碼是 4 位數字'; return $('cPin').focus(); }
    btn.disabled = true; btn.textContent = '登入中…'; $('cErr').textContent = '';
    try { await login({ sid, pin }); }
    catch (e) { if ($('cErr')) $('cErr').textContent = e.message; }
    finally { if (btn.isConnected) { btn.disabled = false; btn.textContent = '登入'; } }
  }

  function openChoice(here, there, cloud) {
    const cloudFirst = there >= here;   // 預設用積分較高的那份
    const nameOf = (d) => esc((d.profile && (d.profile.avatar + ' ' + d.profile.name)) || '');
    const bCloud = `<button class="btn ${cloudFirst ? '' : 'ghost'}" data-act="cloudusecloud">☁️ 用雲端的（${there} ⭐）${cloudFirst ? '・建議' : ''}</button>`;
    const bHere = `<button class="btn ${cloudFirst ? 'ghost' : ''}" data-act="cloudusehere">📱 用這支手機的（${here} ⭐）${cloudFirst ? '' : '・建議'}</button>`;
    $('sheet').innerHTML = `<h3 style="margin-top:0">要用哪一份進度？ <small>WHICH PROGRESS?</small></h3>
      <p class="note">雲端和這支手機都有進度，選一份繼續，另一份會被取代。</p>
      <div class="set"><div class="srow"><div>☁️ 雲端<small>${nameOf(cloud)}</small></div><b>${there} ⭐</b></div>
        <div class="srow"><div>📱 這支手機<small>${esc(st.profile.avatar + ' ' + st.profile.name)}</small></div><b>${here} ⭐</b></div></div>
      <div class="btnrow" style="margin-top:12px;flex-direction:column">${cloudFirst ? bCloud + bHere : bHere + bCloud}</div>`;
    $('modal').classList.add('show');
  }
  async function choose(useCloud) {
    const c = pending; pending = null;
    if (!c) return $('modal').classList.remove('show');
    if (useCloud) { await applyCloud(c); auth.syncedAt = Date.now(); auth.syncedPts = points().total; await saveAuth(); toast('已換成雲端的進度 ☁️'); }
    else { $('modal').classList.remove('show'); await push(true); toast('已用這支手機的進度覆蓋雲端 ☁️'); }
    render(); renderMe();
  }

  async function logout() {
    if (!confirm('登出後，這支手機的進度還在，但不會再自動備份到雲端。\n確定要登出嗎？')) return;
    await push(false); await dropAuth(); renderMe(); toast('已登出');
  }

  // ── 畫面：我的 → 雲端帳號；登入後隱藏轉移碼 ──
  const hhmm = (t) => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  function render() {
    const box = $('cloudBox'); if (!box) return;
    box.style.display = '';
    box.innerHTML = auth
      ? `<div class="srow" style="display:block"><div>☁️ 雲端帳號：${esc(auth.nick || st.profile && st.profile.name || '')}${auth.cls ? '（' + esc(auth.cls) + '）' : ''}
          <small>${auth.syncedAt ? '上次備份 ' + hhmm(auth.syncedAt) : '還沒備份'}・練習後會自動備份${MOCK ? '・🧪 模擬後台' : ''}</small></div>
          <div class="btnrow" style="justify-content:flex-start;margin-top:8px"><button class="btn ghost" data-act="cloudpush">立即備份</button><button class="btn ghost" data-act="cloudout">登出</button></div></div>`
      : `<div class="srow"><div>☁️ 雲端帳號<small>用老師發的登入小卡登入，進度自動備份，換手機直接登入${MOCK ? '・🧪 模擬後台' : ''}</small></div><button class="btn" data-act="cloudin">登入</button></div>`;
    const code = $('codeBox'); if (code) code.style.display = auth ? 'none' : '';
    const onb = $('onbLogin'); if (onb) onb.style.display = auth ? 'none' : '';
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]'); if (!t || !t.dataset.act.startsWith('cloud')) return;
    const a = t.dataset.act;
    if (a === 'cloudin') return openLogin();
    if (a === 'cloudgo') return submitLogin(t);
    if (a === 'cloudusecloud') return choose(true);
    if (a === 'cloudusehere') return choose(false);
    if (a === 'cloudpush') return push(true).then((ok) => ok && toast('已備份 ☁️'));
    if (a === 'cloudout') return logout();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.target.id === 'cPin' || e.target.id === 'cSid')) { const b = document.querySelector('[data-act="cloudgo"]'); if (b) submitLogin(b); } });

  // ── 啟動：等主程式讀完進度，再讀登入狀態；網址帶 ?k= 就用小卡代碼自動登入 ──
  const ready = () => (st.ready ? Promise.resolve() : new Promise((r) => addEventListener('island-ready', r, { once: true })));
  ready().then(async () => {
    auth = (await db.get('auth')) || null;
    render();
    const k = qs.get('k');
    if (k) {
      qs.delete('k'); history.replaceState(null, '', location.pathname + (qs.toString() ? '?' + qs : '') + location.hash);
      if (auth) toast('已經登入了');
      else login({ code: k }).catch((e) => toast('小卡登入失敗：' + e.message));
    }
  });

  // ═══════════════════════════════════════════════════════
  //  模擬後台（?api=mock）：資料存在這支手機的 localStorage，只用來測試畫面流程
  // ═══════════════════════════════════════════════════════
  async function mockApi(action, p, token) {
    await new Promise((r) => setTimeout(r, 400));
    const K = 'eisland-mock';
    let M; try { M = JSON.parse(localStorage.getItem(K)); } catch (e) {}
    M = M || { students: { 12345: { pin: '1234', nick: 'Bella', cls: 'THP11' }, 67890: { pin: '5678', nick: '', cls: 'THP11' } },
      codes: { DEMO1: '12345' }, tokens: {}, progress: {}, fails: {} };
    const save = () => { try { localStorage.setItem(K, JSON.stringify(M)); } catch (e) {} };
    const ok = (data) => ({ ok: true, data }), fail = (error, code) => ({ ok: false, error, code });
    if (action === 'ping') return ok({ pong: true });
    if (action === 'login') {
      let sid = p.sid;
      if (p.code) { sid = M.codes[p.code]; if (!sid) return fail('小卡代碼無效或已經用過'); delete M.codes[p.code]; }
      const s = M.students[sid];
      const f = M.fails[sid] || { n: 0, until: 0 };
      if (f.until > Date.now()) return fail('密碼錯太多次，請 10 分鐘後再試');
      if (!s || (!p.code && s.pin !== p.pin)) {
        if (s) { f.n++; if (f.n >= 5) { f.until = Date.now() + 600000; f.n = 0; } M.fails[sid] = f; save(); }
        return fail(`${ID_LABEL}或密碼不對`);
      }
      delete M.fails[sid];
      const tok = 'T' + Math.random().toString(36).slice(2);
      M.tokens[tok] = sid; save();
      return ok({ token: tok, sid, nick: s.nick, cls: s.cls, cloudAt: (M.progress[sid] || {}).at || 0 });
    }
    const sid = M.tokens[token];
    if (!sid) return fail('請重新登入', 'AUTH');
    if (action === 'pullProgress') { const r = M.progress[sid]; return ok({ data: r ? r.data : null, at: r ? r.at : 0 }); }
    if (action === 'pushProgress') {
      const prev = M.progress[sid];
      M.progress[sid] = { data: p.data, summary: p.summary, at: Date.now(), prev: p.drop && prev ? prev.data : (prev && prev.prev) };
      save(); return ok({ serverAt: M.progress[sid].at });
    }
    return fail('模擬後台沒有這個 action：' + action);
  }
})();
