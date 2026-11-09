// ═══════════════════════════════════════════════════════
//  英文島共用音效 GameSfx（Web Audio 即時合成，沒有音檔、沒有版權問題）
//  用法：GameSfx.play('boom')；靜音開關共用 st.set.sfxMute（全部遊戲一起靜音）
//  背景音樂：GameSfx.music(song)、GameSfx.duck(true/false)、GameSfx.stopMusic()（song 格式見下面「背景音樂」）
//  HUD 按鈕：GameSfx.btn('data-wb="snd"') 產生 🔊 按鈕；點了呼叫 GameSfx.toggle(按鈕)
//  必須在各遊戲 script 之前載入
// ═══════════════════════════════════════════════════════
const GameSfx = (() => {
  let ac = null, master = null, noiseBuf = null;
  const last = {};                                   // 節流：同一種聲音太密就略過
  const GAP = { shot: 120, tick: 60, kill: 45, swing: 90, smack: 40, ouch: 300, thud: 60, jump: 80, coin: 50, bonk: 80, dash: 70, rim: 90, wall: 90 };     // 毫秒
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
  function tone(f, dur, { type = 'sine', vol = 0.3, at = 0, slide = 0, out = null } = {}) {
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out || master); o.start(t); o.stop(t + dur + 0.02);
  }
  // 濾過的雜訊：爆炸用 lowpass、刷過用 bandpass
  function hiss(f0, f1, vol, dur, { type = 'lowpass', at = 0, out = null } = {}) {
    const t = ac.currentTime + at, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise(); f.type = type; f.Q.value = 1; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(out || master); s.start(t); s.stop(t + dur + 0.02);
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
    // ── Dino Quest ──
    coin() { tone(988, 0.06, { type: 'square', vol: 0.06 }); tone(1319, 0.2, { type: 'square', vol: 0.06, at: 0.06 }); },
    stomp() { tone(500, 0.12, { type: 'square', vol: 0.09, slide: 0.35 }); hiss(1200, 200, 0.15, 0.08); },
    bonk() { tone(150, 0.07, { type: 'square', vol: 0.09, slide: 0.8 }); },
    qblock() { arp([0, 7, 12], 659, 0.05, { type: 'square', vol: 0.06, dur: 0.1 }); },
    swim() { tone(500 + Math.random() * 200, 0.12, { type: 'sine', vol: 0.07, slide: 2.2 }); },
    clear() { arp([0, 4, 7, 12, 7, 12, 16, 19, 24], 392, 0.075, { type: 'square', vol: 0.06, dur: 0.18 }); },
    spit() { hiss(600, 2500, 0.3, 0.3, { type: 'bandpass' }); tone(160, 0.3, { type: 'sawtooth', vol: 0.1, slide: 1.8 }); },   // 魔王吐火
    victory() {   // 全破號角：上行琶音 → 大和弦
      arp([0, 4, 7, 12], 523, 0.11, { type: 'square', vol: 0.07, dur: 0.14 });
      arp([5, 9, 12, 17], 523, 0.11, { type: 'square', vol: 0.07, dur: 0.14, at: 0.5 });
      arp([7, 11, 14, 19], 523, 0.11, { type: 'square', vol: 0.07, dur: 0.14, at: 1.0 });
      [12, 16, 19, 24].forEach((n) => tone(523 * Math.pow(2, n / 12), 1.4, { type: 'triangle', vol: 0.09, at: 1.5 }));
      [0, 0.12, 0.24, 1.5].forEach((t) => hiss(3000, 200, 0.25, 0.25, { at: t }));
    },
    // ── Word Run ──
    dash() { hiss(700, 2600, 0.14, 0.1, { type: 'bandpass' }); },                                         // 換跑道
    slide() { hiss(2200, 500, 0.16, 0.3, { type: 'bandpass' }); },                                       // 滑過藤蔓
    boost() { tone(330, 0.5, { type: 'sawtooth', vol: 0.06, slide: 2.5 }); hiss(500, 4000, 0.12, 0.5, { type: 'bandpass' }); },  // 答對加速
    slowdn() { tone(440, 0.6, { type: 'sawtooth', vol: 0.06, slide: 0.4 }); },                           // 跑錯門減速
    // ── Word Shot ──
    throw() { hiss(400, 1800, 0.18, 0.18, { type: 'bandpass' }); },                                       // 出手
    rim() { tone(1250, 0.22, { type: 'triangle', vol: 0.09, slide: 0.97 }); tone(1870, 0.15, { type: 'sine', vol: 0.05 }); },   // 碰到籃框：鐵框聲
    wall() { tone(160, 0.08, { type: 'sine', vol: 0.18, slide: 0.7 }); },                                // 球撞牆
    net() { hiss(5000, 1500, 0.2, 0.28, { type: 'highpass' }); },                                         // 唰～進網
    cheer() { hiss(900, 1600, 0.12, 0.9, { type: 'bandpass' }); hiss(1200, 2000, 0.1, 0.8, { type: 'bandpass', at: 0.1 }); },  // 連進：觀眾歡呼
    end() { arp([0, 4, 7, 12, 16, 19, 24], 523, 0.08, { type: 'triangle', vol: 0.14, dur: 0.22 }); },
  };

  // ═════ 背景音樂：步進音序器（每格＝八分音符），25ms 排程、提前 0.12 秒排聲音 ═════
  // song = { bpm, key(MIDI), chords:[[根音半音, 'M'|'m'],…每小節一個], mel:[半音或 null,…每格一個], bass:'1.5.1.5.',
  //          kick:'x...x...', snare:'..x...x.', hat:'xxxxxxxx', hatKind:'hat'|'drip'|'bubble', lead:'square', leadVol, leadDur(格), echo, pad, bassType }
  let mus = null;
  const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function drum(kind, t, out) {
    const at = t - ac.currentTime;
    if (kind === 'kick') tone(150, 0.16, { type: 'sine', vol: 0.5, slide: 0.3, at, out });
    else if (kind === 'snare') { hiss(2500, 900, 0.22, 0.12, { type: 'bandpass', at, out }); tone(190, 0.08, { type: 'triangle', vol: 0.1, at, out }); }
    else if (kind === 'hat') hiss(9000, 7000, 0.07, 0.03, { type: 'highpass', at, out });
    else if (kind === 'drip') tone(1800 + Math.random() * 900, 0.09, { type: 'sine', vol: 0.06, slide: 1.6, at, out });
    else if (kind === 'bubble') tone(400 + Math.random() * 500, 0.1, { type: 'sine', vol: 0.06, slide: 2.4, at, out });
  }
  function musStep(t, i) {
    const S2 = mus.song, sd = 60 / S2.bpm / 2, bar = Math.floor(i / 8) % S2.chords.length, b = i % 8, out = mus.gain, at = t - ac.currentTime;
    const [cr, q] = S2.chords[bar], root = S2.key + cr;
    const ch = (s3) => s3 && s3[b] === 'x';
    if (ch(S2.kick)) drum('kick', t, out);
    if (ch(S2.snare)) drum('snare', t, out);
    if (ch(S2.hat)) drum(S2.hatKind || 'hat', t, out);
    const bc = S2.bass && S2.bass[b];
    if (bc && bc !== '.') tone(mf(root - 24 + ({ 1: 0, 3: q === 'm' ? 3 : 4, 5: 7, 8: 12 }[bc] || 0)), sd * (S2.bassLen || 0.9), { type: S2.bassType || 'triangle', vol: S2.bassVol || 0.22, at, out });
    if (S2.pad && b === 0) [0, q === 'm' ? 3 : 4, 7].forEach((n) => tone(mf(root - 12 + n), sd * 7.5, { type: 'sine', vol: S2.pad, at, out }));
    const n = S2.mel[i % S2.mel.length];
    if (n != null) {
      const f = mf(S2.key + n), d = sd * (S2.leadDur || 0.9);
      tone(f, d, { type: S2.lead || 'square', vol: S2.leadVol || 0.05, at, out });
      if (S2.echo) tone(f, d, { type: S2.lead || 'square', vol: (S2.leadVol || 0.05) * 0.35, at: at + sd * 1.5, out });
    }
  }
  function music(song) {
    stopMusic(true);
    if (!song || !audio()) return;
    const gain = ac.createGain(); gain.gain.setValueAtTime(0.0001, ac.currentTime); gain.connect(master);
    gain.gain.exponentialRampToValueAtTime(MUS_VOL, ac.currentTime + 0.6);   // 淡入
    mus = { song, gain, i: 0, next: ac.currentTime + 0.1, duck: false };
    mus.timer = setInterval(() => {
      if (!mus || !ac) return;
      if (ac.currentTime - mus.next > 0.5) mus.next = ac.currentTime + 0.05;   // 背景回來：不要一次補一大堆音符
      while (mus.next < ac.currentTime + 0.12) {
        if (on()) { try { musStep(mus.next, mus.i); } catch (e) {} }
        mus.i++; mus.next += 60 / mus.song.bpm / 2;
      }
    }, 25);
  }
  function stopMusic(now) {
    if (!mus) return;
    const m = mus; mus = null; clearInterval(m.timer);
    try { m.gain.gain.cancelScheduledValues(ac.currentTime); m.gain.gain.setTargetAtTime(0.0001, ac.currentTime, now ? 0.03 : 0.25); setTimeout(() => m.gain.disconnect(), 1500); } catch (e) {}
  }
  // 答題、拼字、唸單字時把音樂壓小聲
  function duck(d) {
    if (!mus || mus.duck === d) return; mus.duck = d;
    try { mus.gain.gain.setTargetAtTime(d ? MUS_VOL * 0.25 : MUS_VOL, ac.currentTime, 0.15); } catch (e) {}
  }
  const MUS_VOL = 0.5;
  document.addEventListener('visibilitychange', () => {   // 切到背景：音樂停住，回來再繼續
    if (!ac || !mus) return;
    if (document.hidden) ac.suspend().catch(() => {}); else ac.resume().catch(() => {});
  });

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
  return { play, on, btn, toggle, icon, music, stopMusic, duck };
})();
