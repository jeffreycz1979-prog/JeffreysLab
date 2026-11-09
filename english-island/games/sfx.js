// ═══════════════════════════════════════════════════════
//  英文島共用音效 GameSfx（Web Audio 即時合成，沒有音檔、沒有版權問題）
//  用法：GameSfx.play('boom')；靜音開關共用 st.set.sfxMute（全部遊戲一起靜音）
//  HUD 按鈕：GameSfx.btn('data-wb="snd"') 產生 🔊 按鈕；點了呼叫 GameSfx.toggle(按鈕)
//  必須在各遊戲 script 之前載入
// ═══════════════════════════════════════════════════════
const GameSfx = (() => {
  let ac = null, master = null, noiseBuf = null;
  const last = {};                                   // 節流：同一種聲音太密就略過
  const GAP = { shot: 120, tick: 60, kill: 45, swing: 90, smack: 40, ouch: 300, thud: 60, jump: 80 };     // 毫秒
  const on = () => !(typeof st !== 'undefined' && st.set && st.set.sfxMute);

  function audio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination); } catch (e) { return null; } }
    if (ac.state === 'closed') { ac = null; return audio(); }
    if (ac.state !== 'running') ac.resume().catch(() => {});   // iOS 第二局沒聲音的修正
    return ac;
  }
  function noise() {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.6, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function tone(f, dur, { type = 'sine', vol = 0.3, at = 0, slide = 0 } = {}) {
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  // 濾過的雜訊：爆炸用 lowpass、刷過用 bandpass
  function hiss(f0, f1, vol, dur, { type = 'lowpass', at = 0 } = {}) {
    const t = ac.currentTime + at, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise(); f.type = type; f.Q.value = 1; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02);
  }
  const arp = (notes, base, step, o) => notes.forEach((n, i) => tone(base * Math.pow(2, n / 12), o.dur || 0.16, { ...o, at: i * step }));

  const S = {
    shot() { tone(1400, 0.06, { type: 'square', vol: 0.035, slide: 0.45 }); },                         // 自動射擊：很小聲
    tick() { tone(900, 0.04, { type: 'square', vol: 0.06, slide: 0.7 }); },                            // 打中但沒打死
    kill() { hiss(2400, 300, 0.32, 0.22); tone(320, 0.12, { type: 'triangle', vol: 0.12, slide: 0.5 }); },
    gold() { hiss(2400, 300, 0.32, 0.22); arp([0, 7, 12, 19], 784, 0.05, { type: 'triangle', vol: 0.12, dur: 0.12 }); },
    hurt() { hiss(1200, 80, 0.6, 0.55); tone(220, 0.5, { type: 'sawtooth', vol: 0.16, slide: 0.35 }); },  // 自己被打中
    bomb() { hiss(3000, 60, 0.75, 1.0); tone(110, 0.9, { type: 'sine', vol: 0.35, slide: 0.4 }); },
    power() { tone(440, 0.28, { type: 'triangle', vol: 0.16, slide: 2.4 }); arp([0, 4, 7], 880, 0.06, { type: 'sine', vol: 0.1, at: 0.12, dur: 0.12 }); },
    star() { tone(1568, 0.18, { type: 'sine', vol: 0.14 }); tone(2093, 0.25, { type: 'sine', vol: 0.12, at: 0.07 }); },
    wave() { arp([0, 4, 7, 12], 523, 0.07, { type: 'triangle', vol: 0.14 }); },
    alert() { tone(988, 0.1, { type: 'square', vol: 0.07 }); tone(988, 0.1, { type: 'square', vol: 0.07, at: 0.16 }); },
    right() { tone(784, 0.1, { type: 'triangle', vol: 0.16 }); tone(1175, 0.16, { type: 'triangle', vol: 0.16, at: 0.08 }); },
    wrong() { tone(196, 0.28, { type: 'sawtooth', vol: 0.13, slide: 0.7 }); },
    buy() { tone(1319, 0.08, { type: 'square', vol: 0.07 }); tone(1760, 0.18, { type: 'square', vol: 0.07, at: 0.07 }); },
    go() { tone(220, 0.45, { type: 'sawtooth', vol: 0.08, slide: 3 }); hiss(400, 3000, 0.12, 0.45, { type: 'bandpass' }); },
    // ── Word Brawl ──
    swing() { hiss(900, 3200, 0.1, 0.12, { type: 'bandpass' }); },                                     // 揮刀
    smack(n = 0) { const k = Math.pow(2, Math.min(n, 12) / 12); tone(330 * k, 0.09, { type: 'square', vol: 0.07, slide: 0.6 }); hiss(1800 * k, 400, 0.14, 0.08); },  // 連續打倒越多音越高
    ouch() { tone(300, 0.08, { type: 'square', vol: 0.05, slide: 0.7 }); },                            // 小怪碰到，輕輕的
    thud() { hiss(900, 50, 0.45, 0.35); tone(80, 0.3, { type: 'sine', vol: 0.3, slide: 0.5 }); },     // 踩地、流星落地
    roar() { tone(90, 0.9, { type: 'sawtooth', vol: 0.18, slide: 0.6 }); tone(135, 0.9, { type: 'sawtooth', vol: 0.12, slide: 0.55 }); hiss(600, 120, 0.25, 0.9); },
    pop() { tone(660, 0.07, { type: 'sine', vol: 0.12, slide: 1.8 }); },                              // 撿到對的字母
    level() { arp([0, 4, 7, 12, 16], 659, 0.06, { type: 'square', vol: 0.06, dur: 0.12 }); },
    full() { tone(523, 0.5, { type: 'triangle', vol: 0.12, slide: 2 }); tone(1047, 0.3, { type: 'sine', vol: 0.1, at: 0.35 }); },
    musou() { hiss(200, 4000, 0.4, 0.5, { type: 'bandpass' }); arp([0, 7, 12], 262, 0.05, { type: 'sawtooth', vol: 0.1, dur: 0.6 }); },
    // ── Word Jump ──
    jump() { tone(330 + Math.random() * 40, 0.14, { type: 'sine', vol: 0.09, slide: 2 }); },          // 一般跳：短短上升，很輕
    spring() { tone(220, 0.45, { type: 'triangle', vol: 0.16, slide: 4 }); tone(880, 0.25, { type: 'sine', vol: 0.06, at: 0.05, slide: 1.5 }); },  // 彈簧：大大的 boing
    crack() { hiss(5000, 900, 0.3, 0.12, { type: 'bandpass' }); tone(180, 0.1, { type: 'square', vol: 0.06, slide: 0.6 }); },  // 平台碎掉
    fall() { tone(880, 0.7, { type: 'sine', vol: 0.12, slide: 0.18 }); },                               // 掉下去：往下滑的哨音
    end() { arp([0, 4, 7, 12, 16, 19, 24], 523, 0.08, { type: 'triangle', vol: 0.14, dur: 0.22 }); },
  };

  function play(name, ...a) {
    if (!on() || !S[name] || !audio()) return;
    const now = performance.now();
    if (GAP[name] && now - (last[name] || 0) < GAP[name]) return;
    last[name] = now;
    try { S[name](...a); } catch (e) {}
  }
  const icon = () => (on() ? '🔊' : '🔇');
  const btn = (attr) => `<span class="sfx-btn" ${attr} style="pointer-events:auto;cursor:pointer">${icon()}</span>`;
  function toggle(el) {
    st.set.sfxMute = on();
    if (typeof saveSet === 'function') saveSet();
    if (el) el.textContent = icon();
    if (on()) play('right');
  }
  return { play, on, btn, toggle, icon };
})();
