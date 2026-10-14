import { mixOut } from './mixer';
import { SoundType } from '../../types';
import { playSfx, warmSfx, stopSfx } from './sfx';

// Sound: the context everything plays in, the sound effects (sampled: see sfx.ts), and a few that are built live
// (the truck horn held down, the sniper's report, the menus' clunks, the radio).

let audioCtx: AudioContext | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioCtx) { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); const c = audioCtx; setTimeout(() => warmSfx(c), 1200); }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

/** Is sound actually coming out yet? (A browser holds it back till the first key or click.) */
export const audioRunning = () => audioCtx?.state === 'running';

export const closeAudio = () => {
  audioCtx?.close();
  audioCtx = null;
};

/**
 * A truck's air horn with somebody slumped on it: one long flat blare that doesn't let up, sagging off at the end
 * (for the given number of seconds).
 */
export const playHornDrone = (seconds: number) => {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.09, t + 0.05);
    gain.gain.setValueAtTime(0.09, t + seconds - 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, t + seconds);
    filter.connect(gain);
    gain.connect(mixOut(ctx, 'sfx'));
    for (const freq of [220, 277, 222]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.setValueAtTime(freq, t + seconds - 0.6);
      osc.frequency.linearRampToValueAtTime(freq * 0.9, t + seconds);
      osc.connect(filter);
      osc.start(t);
      osc.stop(t + seconds);
    }
  } catch {
    // Audio is best-effort.
  }
};

/** A sound effect (see sfx.ts), a little louder or quieter (`vol`), higher or lower (`pitch`, semitones). */
export const playSound = (type: SoundType = 'gun', vol = 1, pitch = 0) => {
  try {
    const c = getAudioContext();
    // (held back by the browser: dropped, not queued up to all go off at once, late, the moment it's let through)
    if (c.state !== 'running') return;
    playSfx(c, type, vol, pitch);
  } catch { /* audio is best-effort; never let it break the game loop */ }
};

/** Cuts off a sound effect still going (every instance of it). */
export const stopSound = (type: SoundType) => { try { stopSfx(type); } catch { /* best-effort */ } };

/**
 * A big-bore rifle from a long way off: the round's supersonic crack, a heavy low thump under it, and the report
 * coming back off the hills a beat later.
 */
export const playSniperShot = () => {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const burst = (at: number, len: number, level: number, from: number, to: number) => {
      const size = Math.floor(ctx.sampleRate * len);
      const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / size, 3);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(from, t + at);
      filter.frequency.exponentialRampToValueAtTime(to, t + at + len);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(level, t + at);
      noise.connect(filter); filter.connect(gain); gain.connect(mixOut(ctx, 'sfx'));
      noise.start(t + at);
    };
    // The crack, the report, the echo
    burst(0, 0.09, 0.9, 9000, 2000);
    burst(0.02, 0.7, 0.55, 1800, 80);
    burst(0.32, 0.9, 0.18, 900, 60);
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(140, t);
    sub.frequency.exponentialRampToValueAtTime(30, t + 0.6);
    subGain.gain.setValueAtTime(0.6, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    sub.connect(subGain); subGain.connect(mixOut(ctx, 'sfx'));
    sub.start(); sub.stop(t + 0.7);
  } catch {
    // Audio is best-effort.
  }
};

export const playGlassShatterSound = () => playSound('glass');

/** Stage select lock-in: a heavy mechanical ka-CHUNK, like a shell racking into the chamber. */
export const playLockInSound = () => {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    [[0, 900, 0.06], [0.07, 110, 0.18]].forEach(([at, freq, gainAmt]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + at);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + at + 0.09);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.setValueAtTime(gainAmt, t + at);
      gain.gain.exponentialRampToValueAtTime(0.001, t + at + 0.12);
      osc.connect(gain);
      gain.connect(mixOut(ctx, 'sfx'));
      osc.start(t);
      osc.stop(t + at + 0.13);
    });
  } catch {
    // Audio is best-effort.
  }
};

/** ENGAGE: a noise slam and a fat rising power chord stab. */
export const playEngageSound = () => {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.35, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    noise.connect(nGain);
    nGain.connect(mixOut(ctx, 'sfx'));
    noise.start();
    // E5 power chord (root, fifth, octave), sliding up into place
    for (const freq of [82.4, 123.5, 164.8]) {
      for (const detune of [-8, 8]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.detune.value = detune;
        osc.frequency.setValueAtTime(freq * 0.75, t);
        osc.frequency.exponentialRampToValueAtTime(freq, t + 0.08);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.setValueAtTime(0.05, t + 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);
        osc.connect(gain);
        gain.connect(mixOut(ctx, 'sfx'));
        osc.start();
        osc.stop(t + 1.3);
      }
    }
  } catch {
    // Audio is best-effort.
  }
};

/** Noise burst helper: `dur` seconds of filtered white noise. */
const noiseBurst = (ctx: AudioContext, dur: number, gainAmt: number, filterType: BiquadFilterType, from: number, to: number) => {
  const t = ctx.currentTime;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainAmt, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(mixOut(ctx, 'sfx'));
  src.start();
};

/** A low sine thump that drops in pitch. */
const thump = (ctx: AudioContext, from: number, to: number, dur: number, gainAmt: number) => {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(gainAmt, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain);
  gain.connect(mixOut(ctx, 'sfx'));
  osc.start();
  osc.stop(t + dur);
};

/** A fist cutting the air. */
export const playWhoosh = () => playSound('whoosh', 1.3);

/** A punch landing square on the camera. */
export const playPunchImpact = () => { playSound('punch', 1.5, -3); playSound('slam', 0.6); };

/** Something heavy (a camera) hitting the floor. */
export const playThud = () => playSound('thud', 1.2);

/** A menu's cursor moving onto something; a menu's OK (into something); its BACK (out of it, cancelled). */
export const playCursor = () => playSound('cursor', 1);
export const playMenuOk = () => playSound('menuok', 1);
export const playMenuBack = () => playSound('menuback', 1);

/** One aggressive keystroke: a clack with a little pitch wobble. */
export const playTypeClack = (heavy = false) => {
  try {
    const ctx = getAudioContext();
    noiseBurst(ctx, heavy ? 0.09 : 0.04, heavy ? 0.4 : 0.22, 'highpass', 2000 + Math.random() * 1500, 900);
    if (heavy) thump(ctx, 180 + Math.random() * 40, 60, 0.12, 0.35);
  } catch { /* best-effort */ }
};

/**
 * A radio channel left open: a hiss under everything, and while the far end's talking, the modulator's buzz and
 * warble over it (a low sawtooth throbbing, the hiss up). Returns controls to key the talking on and off and to close it.
 */
export const openRadio = () => {
  let ctx: AudioContext;
  try { ctx = getAudioContext(); } catch { return { talking: (_on: boolean) => {}, close: () => {} }; }
  const t = ctx.currentTime;
  // The hiss
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
  const band = ctx.createBiquadFilter(); band.type = 'bandpass'; band.frequency.value = 2200; band.Q.value = 0.7;
  const hiss = ctx.createGain(); hiss.gain.setValueAtTime(0.012, t);
  noise.connect(band); band.connect(hiss); hiss.connect(mixOut(ctx, 'sfx'));
  // The modulator: a throbbing low buzz
  const buzz = ctx.createOscillator(); buzz.type = 'sawtooth'; buzz.frequency.value = 62;
  const lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 23;
  const lfoDepth = ctx.createGain(); lfoDepth.gain.value = 0.012;
  const buzzGain = ctx.createGain(); buzzGain.gain.setValueAtTime(0, t);
  lfo.connect(lfoDepth); lfoDepth.connect(buzzGain.gain);
  buzz.connect(buzzGain); buzzGain.connect(mixOut(ctx, 'sfx'));
  noise.start(); buzz.start(); lfo.start();
  let open = true;
  return {
    talking: (on: boolean) => {
      if (!open) return;
      const now = ctx.currentTime;
      buzzGain.gain.setTargetAtTime(on ? 0.005 : 0, now, 0.03);
      hiss.gain.setTargetAtTime(on ? 0.03 : 0.012, now, 0.03);
    },
    close: () => {
      if (!open) return;
      open = false;
      const now = ctx.currentTime;
      hiss.gain.setTargetAtTime(0, now, 0.05); buzzGain.gain.setTargetAtTime(0, now, 0.05);
      for (const s of [noise, buzz, lfo]) s.stop(now + 0.3);
    },
  };
};

/** The squelch as a radio's keyed or let go: a short burst of static, cut off. */
export const playSquelch = () => {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime, len = 0.14;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1200;
    const g = ctx.createGain(); g.gain.value = 0.08;
    src.connect(hp); hp.connect(g); g.connect(mixOut(ctx, 'sfx'));
    src.start(t);
  } catch { /* no audio */ }
};
