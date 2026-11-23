// ═══════════════════════════════════════════════════════
//  國中星艦 計分：ShipScore（2026/11/23 Jeffrey 定案）
//  - 一個「航程」＝段考前約兩週到段考結束（航線表設定 from／to），範圍＝那次段考的冊別與單元
//  - 每艙整個航程只算最高的一次：
//      單字艙＝max(20 字回合答對數, 60 秒衝刺答對數)
//      文法艙＝6 − 答錯次數（最低 0），範圍內任一課的最佳
//      段考艙＝答對題數 × 5（只算這次航程的段考範圍）
//  - 三艙全對（20 字回合 20/20＋文法 6/6＋段考 100）→ 總分補到 200
//  - 刷出新高就把「新總分 − 已入帳」立刻入帳（onCredit）；接到島上時把 onCredit 接到島的帳本
//  - 不計分：黑洞重刷、範圍外的冊別／單元、全冊總複習
// ═══════════════════════════════════════════════════════
const ShipScore = (() => {
  const FULL_BONUS_TO = 200, GRAM_MAX = 6, V20 = 20;
  let V = null, S = null;
  let onCredit = (delta, why) => {};            // 島上：寫進積分帳本

  const key = () => 'jhship-score:' + V.id;
  const blank = () => ({ v20: 0, v20full: false, sprint: 0, gram: 0, exam: 0, credited: 0, log: [] });
  function load() { try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(key()) || '{}')); } catch (e) { S = blank(); } }
  function save() { try { localStorage.setItem(key(), JSON.stringify(S)); } catch (e) {} }
  const day = (d) => new Date(d + 'T00:00:00');

  function setVoyage(v) { V = v; load(); }
  function active(now = new Date()) {
    if (!V) return false;
    const end = day(V.to); end.setDate(end.getDate() + 1);           // 結束日當天還可以用
    return now >= day(V.from) && now < end;
  }
  function daysLeft(now = new Date()) { const end = day(V.to); end.setDate(end.getDate() + 1); return Math.max(0, Math.ceil((end - now) / 864e5)); }

  // 這次練習算不算分
  const inRange = (book, units) => !!V && active() && book === V.book && units.length > 0 && units.every((u) => V.units.includes(u));

  function parts() {
    const vocab = Math.max(S.v20, S.sprint);
    const base = vocab + S.gram + S.exam;
    const allFull = S.v20full && S.gram >= GRAM_MAX && S.exam >= 100;
    return { vocab, gram: S.gram, exam: S.exam, base, allFull, total: allFull ? Math.max(FULL_BONUS_TO, base) : base, credited: S.credited };
  }

  // 回傳 { counted, best（這艙紀錄）, prev, delta（這次入帳）, bonus（這次剛達成全對）}
  function record(kind, value, extra = {}) {
    if (!V || !active()) return { counted: false };
    const before = parts();
    const field = { v20: 'v20', sprint: 'sprint', gram: 'gram', exam: 'exam' }[kind];
    const prev = S[field];
    if (value > prev) S[field] = value;
    if (kind === 'v20' && extra.full) S.v20full = true;
    const after = parts(), delta = after.total - S.credited;
    if (delta > 0) {
      S.credited += delta;
      S.log.push({ t: Date.now(), kind, value, delta });
      if (S.log.length > 60) S.log = S.log.slice(-60);
      try { onCredit(delta, kind); } catch (e) {}
    }
    save();
    const isV = kind === 'v20' || kind === 'sprint';
    const prevCabin = isV ? before.vocab : prev, cabin = isV ? after.vocab : S[field];   // 單字艙兩種模式合起來比
    return { counted: true, value, prev: prevCabin, best: cabin, delta: Math.max(0, delta), newBest: value > prevCabin,
             capped: after.allFull && after.total <= S.credited && value > prevCabin, bonus: after.allFull && !before.allFull };
  }

  return { setVoyage, active, daysLeft, inRange, parts, record, get voyage() { return V; },
           set onCredit(f) { onCredit = f; }, FULL_BONUS_TO, GRAM_MAX, V20,
           _reset() { S = blank(); save(); } };
})();
