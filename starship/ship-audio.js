// ═══════════════════════════════════════════════════════
//  國中星艦 聲音：ShipAudio
//  - 音效：島上共用的 GameSfx（../english-island/games/sfx.js，要先載入）＋飛船專用合成音
//  - 語音：Gateway generate_tts（記憶體快取、一次送一個）→ 失敗改用手機內建語音
//  - 靜音共用 st.set.sfxMute（接到島上後就是島的設定）
// ═══════════════════════════════════════════════════════
const ShipAudio = (() => {
  const GATEWAY_URL = 'https://script.google.com/macros/s/AKfycbz0O6eB9fVC3Xp7g0Kt4U-32Inmf9ieDYJygEf3jW78xaWx10glPscEefEQwgB0jCioug/exec';
  const GATEWAY_TOKEN = 'MYVIEWBOARDgoogleAPI';
  const useFreeKey = (localStorage.getItem('newcore_tools_plan') !== 'pro');
  const muted = () => typeof st !== 'undefined' && st.set && st.set.sfxMute;

  /* ---------- 飛船專用合成音 ---------- */
  let ac = null, out = null;
  function audio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); out = ac.createGain(); out.gain.value = 0.5; out.connect(ac.destination); } catch (e) { return null; } }
    if (ac.state !== 'running') ac.resume().catch(() => {});
    return ac;
  }
  function tone(f, dur, { type = 'sine', vol = 0.2, at = 0, to = 0 } = {}) {
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.03, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
  }
  function whoosh(f0, f1, dur, vol = 0.2, at = 0) {
    const t = ac.currentTime + at, n = ac.createBufferSource(), b = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
    const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.buffer = b; n.connect(f); f.connect(g); g.connect(out); n.start(t);
  }
  const OWN = {
    hover()   { tone(660, 0.12, { vol: 0.08, to: 990 }); },                                        // 點到飛船
    beam()    { tone(110, 1.8, { type: 'sawtooth', vol: 0.06, to: 440 }); tone(220, 1.8, { vol: 0.08, to: 880 }); whoosh(300, 2500, 1.8, 0.08); },
    liftoff() { whoosh(200, 3000, 1.4, 0.25); tone(70, 1.4, { type: 'sawtooth', vol: 0.12, to: 40 }); },
    land()    { whoosh(3000, 300, 1.4, 0.18); tone(880, 1.2, { vol: 0.05, to: 220 }); },
    laser()   { tone(1800, 0.14, { type: 'square', vol: 0.05, to: 260 }); },
    zapMiss() { tone(500, 0.18, { type: 'square', vol: 0.05, to: 120 }); },
    holo()    { tone(300, 0.45, { type: 'triangle', vol: 0.08, to: 1200 }); whoosh(800, 4000, 0.45, 0.05); },
    charge(n = 1) { const f = 392 * Math.pow(2, n * 2 / 12); tone(f, 0.18, { type: 'triangle', vol: 0.15 }); tone(f * 1.5, 0.22, { vol: 0.08, at: 0.08 }); },
    tap()     { tone(1200, 0.04, { type: 'square', vol: 0.035 }); },
    page()    { whoosh(1500, 600, 0.16, 0.06); },
  };
  // 名稱對照：島上 GameSfx 已有的就用它（音色一致）
  const SHARED = { right: 'right', wrong: 'wrong', boom: 'kill', combo: 'level', warp: 'boost', shieldFull: 'victory',
                   end: 'end', great: 'clear', ok: 'wave', pop: 'pop', go: 'go', alert: 'alert' };
  function sfx(name, ...a) {
    if (muted()) return;
    if (OWN[name]) { if (audio()) try { OWN[name](...a); } catch (e) {} return; }
    if (SHARED[name] && typeof GameSfx !== 'undefined') GameSfx.play(SHARED[name], ...a);
  }

  /* ---------- 語音 ---------- */
  const tts = { el: new Audio(), cache: new Map(), inflight: {}, q: [], busy: false, fails: 0, pauseUntil: 0, seq: 0 };
  const sayText = (w) => w.replace(/\.\.\./g, ' ').replace(/[()]/g, '').replace(/\s+\/\s+/g, ', ').replace(/(\S+)\/\S+/g, '$1').replace(/_{2,}/g, ' blank ').replace(/\s+/g, ' ').trim();
  function b64(b) { const s = atob(b.replace(/\s/g, '')), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
  function wav(pcm, rate) {
    const h = new ArrayBuffer(44), v = new DataView(h), ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); v.setUint32(4, 36 + pcm.length, true); ws(8, 'WAVE'); ws(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, pcm.length, true);
    return new Blob([h, pcm], { type: 'audio/wav' });
  }
  function find(o, d = 0) {
    if (!o || d > 6) return null;
    if (typeof o === 'string') { if (/^https?:\/\//.test(o)) return { url: o }; const m = o.match(/^data:([^;]+);base64,(.+)$/s); return m ? { b64: m[2], mime: m[1] } : null; }
    if (typeof o !== 'object') return null;
    for (const k of ['audioContent', 'audio', 'audioBase64', 'base64', 'audioData'])
      if (typeof o[k] === 'string' && o[k].length > 100) return find(o[k], d + 1) || { b64: o[k], mime: o.mimeType || o.mime || 'audio/mpeg' };
    if (o.inlineData && typeof o.inlineData.data === 'string') return { b64: o.inlineData.data, mime: o.inlineData.mimeType || 'audio/L16;rate=24000' };
    if (typeof o.data === 'string' && o.data.length > 100 && o.mimeType) return { b64: o.data, mime: o.mimeType };
    for (const k of Object.keys(o)) { const r = find(o[k], d + 1); if (r) return r; }
    return null;
  }
  async function fetchTTS(text) {
    const res = await fetch(GATEWAY_URL, { method: 'POST', redirect: 'follow',     // 鐵律：redirect follow、不加 Content-Type
      body: JSON.stringify({ auth: GATEWAY_TOKEN, action: 'generate_tts', params: { text, prompt: text, languageCode: 'en-US', useFreeKey } }) });
    const gw = await res.json();
    if (!gw.ok) throw new Error(gw.error || 'Gateway 失敗');
    const a = find(gw); if (!a) throw new Error('沒有音訊');
    if (a.url) return await (await fetch(a.url)).blob();
    const bytes = b64(a.b64), mime = (a.mime || '').toLowerCase();
    if (mime.includes('l16') || mime.includes('pcm')) return wav(bytes, parseInt((mime.match(/rate=(\d+)/) || [])[1] || '24000', 10));
    return new Blob([bytes], { type: bytes[0] === 0x52 && bytes[1] === 0x49 ? 'audio/wav' : (mime || 'audio/mpeg') });
  }
  function pump() {
    if (tts.busy || !tts.q.length) return;
    tts.busy = true; const j = tts.q.shift();
    fetchTTS(j.text).then(j.ok, j.no).finally(() => { tts.busy = false; setTimeout(pump, 300); });
  }
  function get(text, urgent) {
    const key = text.toLowerCase();
    if (tts.cache.has(key)) return Promise.resolve(tts.cache.get(key));
    if (!navigator.onLine || Date.now() < tts.pauseUntil) return Promise.reject(new Error('暫停'));
    if (!tts.inflight[key]) tts.inflight[key] = new Promise((ok, no) => { const j = { text, ok, no }; urgent ? tts.q.unshift(j) : tts.q.push(j); pump(); })
      .then((b) => { tts.fails = 0; tts.cache.set(key, b); return b; })
      .catch((e) => { if (++tts.fails >= 2) { tts.pauseUntil = Date.now() + 60000; tts.fails = 0; tts.q.splice(0).forEach((j) => j.no(e)); } throw e; })
      .finally(() => delete tts.inflight[key]);
    return tts.inflight[key];
  }
  function phone(text, slow) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = slow ? 0.65 : 0.9;
    const v = speechSynthesis.getVoices().find((x) => /en-US/.test(x.lang) && /(Samantha|Google|Natural|Neural)/.test(x.name));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  // 語音不看音效靜音（學生關掉音效還是要聽得到單字）
  async function speak(text, { slow = false, quick = false } = {}) {
    if (!text) return;
    text = sayText(text);
    const my = ++tts.seq;
    tts.el.pause(); if ('speechSynthesis' in window) speechSynthesis.cancel();
    if (quick && !tts.cache.has(text.toLowerCase())) { phone(text, slow); prefetch(text); return; }   // 快刷時不要等網路
    try {
      const blob = await get(text, true);
      if (my !== tts.seq) return;
      if (tts.el.src.startsWith('blob:')) URL.revokeObjectURL(tts.el.src);
      tts.el.src = URL.createObjectURL(blob); tts.el.playbackRate = slow ? 0.75 : 1;
      await tts.el.play();
    } catch (e) { if (my === tts.seq) phone(text, slow); }
  }
  function stop() { tts.seq++; tts.el.pause(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  const prefetch = (text) => { if (text && navigator.onLine) get(sayText(text)).catch(() => {}); };

  // iPhone：第一次一定要手指觸發才能出聲 → 第一次點畫面時先解鎖
  const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  let unlocked = false;
  document.addEventListener('pointerdown', () => {
    if (unlocked) return; unlocked = true;
    audio();
    try { tts.el.src = SILENT; tts.el.play().then(() => tts.el.pause()).catch(() => {}); } catch (e) {}
    try { if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } } catch (e) {}
  }, { passive: true });
  if ('speechSynthesis' in window) speechSynthesis.getVoices();   // 先讓內建語音清單載入

  return { sfx, speak, stop, prefetch, muted };
})();
