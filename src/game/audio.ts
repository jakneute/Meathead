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

export const playSound = (type: SoundType = 'gun') => {
  try {
    const ctx = getAudioContext();
    if (type === 'horn') playHorn(ctx);
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
