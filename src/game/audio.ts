import { SoundType } from '../types';

// All sound effects are synthesized on the fly with the Web Audio API.

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

export const closeAudio = () => {
  audioCtx?.close();
  audioCtx = null;
};

interface ToneSpec {
  wave: OscillatorType;
  /** Start frequency (Hz); a function for randomized pitch. */
  freq: number | (() => number);
  endFreq: number;
  sweep: 'exp' | 'linear';
  sweepTime: number;
  gain: number;
  endGain: number;
  fadeTime: number;
}

// Simple one-oscillator blips. Every tone is cut off after 0.1s.
const TONES: Partial<Record<SoundType, ToneSpec>> = {
  gun:    { wave: 'sawtooth', freq: 150, endFreq: 40, sweep: 'exp', sweepTime: 0.1, gain: 0.05, endGain: 0.01, fadeTime: 0.1 },
  ice:    { wave: 'sine', freq: 800, endFreq: 1200, sweep: 'exp', sweepTime: 0.1, gain: 0.08, endGain: 0.01, fadeTime: 0.15 },
  flame:  { wave: 'triangle', freq: () => 40 + Math.random() * 40, endFreq: 120, sweep: 'linear', sweepTime: 0.05, gain: 0.03, endGain: 0.001, fadeTime: 0.05 },
  barf:   { wave: 'sawtooth', freq: 160, endFreq: 40, sweep: 'exp', sweepTime: 0.4, gain: 0.1, endGain: 0.001, fadeTime: 0.4 },
  dart:   { wave: 'square', freq: 2200, endFreq: 800, sweep: 'exp', sweepTime: 0.05, gain: 0.04, endGain: 0.001, fadeTime: 0.05 },
  ignite: { wave: 'sawtooth', freq: 50, endFreq: 350, sweep: 'linear', sweepTime: 0.5, gain: 0.3, endGain: 0.001, fadeTime: 0.6 },
  oil:    { wave: 'sine', freq: 100, endFreq: 200, sweep: 'exp', sweepTime: 0.2, gain: 0.1, endGain: 0.001, fadeTime: 0.2 },
  taser:  { wave: 'sawtooth', freq: () => 440 + Math.random() * 200, endFreq: 100, sweep: 'linear', sweepTime: 0.05, gain: 0.04, endGain: 0.001, fadeTime: 0.05 },
  // A water-droplet plink: a high sine that bends up (played in a stream for the victory whiz)
  tinkle: { wave: 'sine', freq: () => 1300 + Math.random() * 1300, endFreq: 3400, sweep: 'exp', sweepTime: 0.045, gain: 0.045, endGain: 0.001, fadeTime: 0.07 },
};

const playTone = (ctx: AudioContext, spec: ToneSpec) => {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = spec.wave;
  osc.frequency.setValueAtTime(typeof spec.freq === 'function' ? spec.freq() : spec.freq, t);
  if (spec.sweep === 'exp') osc.frequency.exponentialRampToValueAtTime(spec.endFreq, t + spec.sweepTime);
  else osc.frequency.linearRampToValueAtTime(spec.endFreq, t + spec.sweepTime);
  gain.gain.setValueAtTime(spec.gain, t);
  gain.gain.exponentialRampToValueAtTime(spec.endGain, t + spec.fadeTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(t + 0.1);
};

/** Two detuned sawtooths, like Dale's truck horn. */
const playHorn = (ctx: AudioContext) => {
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
  gain.connect(ctx.destination);
  for (const freq of [220, 277]) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);
    osc.connect(gain);
    osc.start();
    osc.stop(t + 0.8);
  }
};

/** A police siren: a wailing tone sweeping up and down for a few seconds. */
const playSiren = (ctx: AudioContext) => {
  const t = ctx.currentTime, dur = 3.2;
  const osc = ctx.createOscillator();
  osc.type = 'square';
  for (let i = 0; i < 4; i++) {
    osc.frequency.linearRampToValueAtTime(620, t + i * 0.8);
    osc.frequency.linearRampToValueAtTime(980, t + i * 0.8 + 0.4);
  }
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.035, t + 0.3);
  gain.gain.linearRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(t + dur);
};

/** Thunder: a crack of noise and a long low rumble. */
const playThunder = (ctx: AudioContext) => {
  const t = ctx.currentTime, dur = 2.2;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.5);
  const noise = ctx.createBufferSource(); noise.buffer = buffer;
  const filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1800, t); filter.frequency.exponentialRampToValueAtTime(90, t + 1.2);
  const gain = ctx.createGain(); gain.gain.setValueAtTime(0.35, t); gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  noise.start();
};

/** Half a second of low-passed white noise. */
const playWaveCrash = (ctx: AudioContext) => {
  const t = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, t);
  filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);
  noise.connect(filter);
  filter.connect(ctx.destination);
  noise.start();
};

/** A nuclear blast: a long, deep roar of noise over a sub-bass drop. */
const playNuke = (ctx: AudioContext) => {
  const t = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2500, t);
  filter.frequency.exponentialRampToValueAtTime(60, t + 3);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.5, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 3);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(90, t);
  sub.frequency.exponentialRampToValueAtTime(25, t + 2.5);
  subGain.gain.setValueAtTime(0.4, t);
  subGain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start();
  sub.stop(t + 2.5);
};

export const playSound = (type: SoundType = 'gun') => {
  try {
    const ctx = getAudioContext();
    if (type === 'horn') playHorn(ctx);
    else if (type === 'siren') playSiren(ctx);
    else if (type === 'thunder') playThunder(ctx);
    else if (type === 'nuke') playNuke(ctx);
    else if (type === 'tsunami') playWaveCrash(ctx);
    else playTone(ctx, TONES[type]!);
  } catch {
    // Audio is best-effort; never let it break the game loop.
  }
};

export const playGlassShatterSound = () => {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    for (let i = 0; i < 12; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(1200 + Math.random() * 5000, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(t + 0.3);
    }
  } catch {
    // Audio is best-effort.
  }
};

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
      gain.connect(ctx.destination);
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
    nGain.connect(ctx.destination);
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
        gain.connect(ctx.destination);
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
  gain.connect(ctx.destination);
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
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(t + dur);
};

/** A fist cutting the air. */
export const playWhoosh = () => {
  try { noiseBurst(getAudioContext(), 0.22, 0.35, 'bandpass', 400, 3000); } catch { /* best-effort */ }
};

/** A punch landing square on the camera. */
export const playPunchImpact = () => {
  try {
    const ctx = getAudioContext();
    noiseBurst(ctx, 0.35, 0.6, 'lowpass', 3000, 120);
    thump(ctx, 150, 35, 0.4, 0.7);
  } catch { /* best-effort */ }
};

/** Something heavy (a camera) hitting the floor. */
export const playThud = () => {
  try {
    const ctx = getAudioContext();
    thump(ctx, 90, 30, 0.3, 0.55);
    noiseBurst(ctx, 0.15, 0.2, 'lowpass', 800, 100);
  } catch { /* best-effort */ }
};

/** One aggressive keystroke: a clack with a little pitch wobble. */
export const playTypeClack = (heavy = false) => {
  try {
    const ctx = getAudioContext();
    noiseBurst(ctx, heavy ? 0.09 : 0.04, heavy ? 0.4 : 0.22, 'highpass', 2000 + Math.random() * 1500, 900);
    if (heavy) thump(ctx, 180 + Math.random() * 40, 60, 0.12, 0.35);
  } catch { /* best-effort */ }
};
