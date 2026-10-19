// The rooms the music plays in: impulse responses for the convolution reverb, generated (never shipped): early
// reflections off the walls, then a dense tail whose highs die faster than its lows (the air, the walls soaking up
// the top), each ear its own (decorrelated: wide). Made once per kind per audio context.

import { rng } from './bank/dsp';

export type ReverbKind = 'room' | 'hall' | 'cathedral' | 'cave' | 'plate' | 'spring';
interface RoomDef {
  /** Seconds to fall 60 dB (the mids). */
  decay: number;
  /** The highs' decay, as a share of the mids'; the lows'. */
  hi: number; lo: number;
  /** Pre-delay (seconds). */
  pre: number;
  /** Early reflections: [seconds after the pre-delay, level]. */
  early: [number, number][];
  /** Discrete echoes (a cave's walls): [seconds, level]. */
  echoes?: [number, number][];
  /** A spring's boing: a resonance (Hz) the tail rings at. */
  ring?: number;
}
const ROOMS: Record<ReverbKind, RoomDef> = {
  room: { decay: 0.75, hi: 0.5, lo: 1, pre: 0.006, early: [[0.004, 0.6], [0.009, 0.45], [0.013, 0.4], [0.019, 0.3], [0.026, 0.22], [0.033, 0.16]] },
  hall: { decay: 2.3, hi: 0.45, lo: 1.15, pre: 0.022, early: [[0.011, 0.45], [0.019, 0.36], [0.027, 0.3], [0.037, 0.25], [0.049, 0.2], [0.061, 0.16], [0.075, 0.12]] },
  cathedral: { decay: 4.6, hi: 0.4, lo: 1.2, pre: 0.04, early: [[0.021, 0.35], [0.038, 0.3], [0.057, 0.26], [0.079, 0.22], [0.101, 0.18], [0.13, 0.14]] },
  cave: { decay: 3.2, hi: 0.3, lo: 1.1, pre: 0.03, early: [[0.015, 0.4], [0.031, 0.3]], echoes: [[0.11, 0.42], [0.19, 0.3], [0.28, 0.22], [0.41, 0.15], [0.57, 0.1]] },
  plate: { decay: 1.7, hi: 0.8, lo: 0.9, pre: 0.002, early: [] },
  spring: { decay: 1.4, hi: 0.5, lo: 0.8, pre: 0.012, early: [[0.03, 0.5], [0.061, 0.35], [0.092, 0.25]], ring: 1900 },
};

const cache = new WeakMap<BaseAudioContext, Map<ReverbKind, AudioBuffer>>();

/** The impulse response of a kind of room, in this context (made the first time it's asked for). */
export const reverbIR = (ctx: BaseAudioContext, kind: ReverbKind): AudioBuffer => {
  let m = cache.get(ctx);
  if (!m) { m = new Map(); cache.set(ctx, m); }
  const have = m.get(kind);
  if (have) return have;
  const R = ROOMS[kind], sr = ctx.sampleRate;
  const len = Math.round(Math.min(6, R.decay * R.lo * 1.1 + R.pre + 0.1) * sr);
  const buf = ctx.createBuffer(2, len, sr);
  const pre = Math.round(R.pre * sr);
  const kMid = 6.91 / (R.decay * sr), kHi = 6.91 / (R.decay * R.hi * sr), kLo = 6.91 / (R.decay * R.lo * sr);
  const aLo = 1 - Math.exp((-2 * Math.PI * 500) / sr), aHi = 1 - Math.exp((-2 * Math.PI * 3500) / sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch), r = rng(0x51f15e + ch * 7919 + kind.length * 31);
    let lo = 0, hp = 0, y1 = 0, y2 = 0;
    const rw = R.ring ? (2 * Math.PI * R.ring) / sr : 0, c1 = 2 * 0.9985 * Math.cos(rw), c2 = -0.9985 * 0.9985;
    for (let i = pre; i < len; i++) {
      const n = i - pre, w = r();
      lo += aLo * (w - lo);
      hp += aHi * (w - hp);
      const high = w - hp, mid = hp - lo;
      let v = lo * Math.exp(-kLo * n) + mid * Math.exp(-kMid * n) + high * Math.exp(-kHi * n) * 0.8;
      // (a spring rings at its own pitch)
      if (rw) { const y = v * 0.002 + c1 * y1 + c2 * y2; y2 = y1; y1 = y; v = v * 0.6 + y * 0.6; }
      // (the tail builds in rather than starting at full)
      d[i] = v * Math.min(1, n / (0.012 * sr)) * 0.5;
    }
    for (const [at, g] of R.early) { const i = pre + Math.round((at + (ch ? 0.0023 : 0)) * sr); if (i < len) d[i] += ch ? -g : g; }
    for (const [at, g] of R.echoes ?? []) {
      const i0 = pre + Math.round((at + (ch ? 0.007 : 0)) * sr);
      for (let k = 0; k < 0.012 * sr && i0 + k < len; k++) d[i0 + k] += r() * g * Math.exp(-k / (0.003 * sr));
    }
  }
  m.set(kind, buf);
  return buf;
};
