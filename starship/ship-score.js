// ═══════════════════════════════════════════════════════
//  國中星艦 計分：ShipScore（2026/11/23 定案，11/26 接島）
//  - 一個「航程」＝段考前約兩週到段考結束（航線表 from／to），範圍＝books（可多冊：國一、國二同班）＋ units
//  - 每艙整個航程只算最高的一次：
//      單字艙＝max(20 字回合答對數, 60 秒衝刺答對數)
//      文法艙＝6 − 答錯次數（最低 0），範圍內任一課的最佳
//      段考艙＝答對題數 × 5（只算這次航程的段考範圍）
//  - 三艙全對（20 字回合 20/20＋文法 6/6＋段考 100）→ 總分補到 200
//  - 刷出新高就把「新總分 − 已入帳」立刻入帳（onCredit）
//  - 島上：store 存進島的 st.meta（跟著雲端備份）；已入帳數從島的帳本算（ledgerSum），不怕紀錄被清掉重複給分
// ═══════════════════════════════════════════════════════
const ShipScore = (() => {
  const FULL_BONUS_TO = 200, GRAM_MAX = 6, V20 = 20;
  let V = null, S = null;
  let onCredit = (delta, kind) => {};
  let store = {
    load: (id) => { try { return JSON.parse(localStorage.getItem('jhship-score:' + id) || 'null'); } catch (e) { return null; } },
    save: (id, obj) => { try { localStorage.setItem('jhship-score:' + id, JSON.stringify(obj)); } catch (e) {} },
  };
  let ledgerSum = null;            // 島上：() => 這個航程已經入帳的總分

  const blank = () => ({ v20: 0, v20full: false, sprint: 0, gram: 0, exam: 0, credited: 0 });
  const syncCredited = () => { if (ledgerSum) { const n = ledgerSum(); if (typeof n === 'number') S.credited = n; } };
  const load = () => { S = Object.assign(blank(), V ? store.load(V.id) || {} : {}); syncCredited(); };
  const save = () => { if (V) store.save(V.id, S); };
  const day = (d) => new Date(d + 'T00:00:00');

  function setVoyage(v) { V = v || null; load(); }
  function active(now = new Date()) {
    if (!V) return false;
    const end = day(V.to); end.setDate(end.getDate() + 1);           // 結束日當天還可以用
    return now >= day(V.from) && now < end;
  }
  function daysLeft(now = new Date()) { if (!V) return 0; const end = day(V.to); end.setDate(end.getDate() + 1); return Math.max(0, Math.ceil((end - now) / 864e5)); }

  // 這次練習算不算分：冊別在航程裡、選的單元都在範圍內
  const inRange = (book, units) => !!V && active() && V.books.includes(book) && units.length > 0 && units.every((u) => V.units.includes(u));

  function parts() {
    const vocab = Math.max(S.v20, S.sprint);
    const base = vocab + S.gram + S.exam;
    const allFull = S.v20full && S.gram >= GRAM_MAX && S.exam >= 100;
    return { vocab, gram: S.gram, exam: S.exam, base, allFull, total: allFull ? Math.max(FULL_BONUS_TO, base) : base, credited: S.credited };
  }

  // 回傳 { counted, value, prev（這艙之前的紀錄）, best, delta（這次入帳）, newBest, capped, bonus（這次剛達成全對）}
  function record(kind, value, extra = {}) {
    if (!V || !active()) return { counted: false };
    load();                                   // 先讀最新（島上可能在別的地方改過）
    const before = parts();
    const isV = kind === 'v20' || kind === 'sprint';
    const prev = S[kind];
    if (value > prev) S[kind] = value;
    if (kind === 'v20' && extra.full) S.v20full = true;
    const after = parts(), delta = after.total - S.credited;
    if (delta > 0) S.credited += delta;
    save();
    if (delta > 0) { try { onCredit(delta, kind); } catch (e) {} }
    const prevCabin = isV ? before.vocab : prev, cabin = isV ? after.vocab : S[kind];
    return { counted: true, value, prev: prevCabin, best: cabin, delta: Math.max(0, delta), newBest: value > prevCabin,
             capped: after.allFull && delta <= 0 && value > prevCabin, bonus: after.allFull && !before.allFull };
  }

  return {
    setVoyage, active, daysLeft, inRange, parts, record,
    get voyage() { return V; },
    set onCredit(f) { onCredit = f; },
    set store(s) { store = s; if (V) load(); },
    set ledgerSum(f) { ledgerSum = f; if (V) load(); },
    FULL_BONUS_TO, GRAM_MAX, V20,
    _reset() { S = blank(); syncCredited(); save(); },
  };
})();
