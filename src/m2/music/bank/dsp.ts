// The building blocks the instrument bank is synthesized from (bank/instruments.ts, bank/drums.ts): band-limited
// wavetables, filters (the RBJ biquads, a TPT state-variable for anything swept), damped-sine resonators (modal
// synthesis: pianos, mallets, bells, drums), a tuned Karplus-Strong string (plucked anything), a seeded noise source.
//
// Everything here runs at startup, while the samples are made, never per note: the player only plays buffers back.
// Held (looping) sounds rely on one rule: after their attack, every oscillator runs at a whole number of hertz and
// every modulation at a whole number of hertz, so one second of the sound repeats exactly and loops without a click
// (filters are fine: a linear filter fed a periodic signal settles into a periodic one). See bank/instruments.ts.

export const TAU = Math.PI * 2;
export const midiHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
export const hzMidi = (hz: number) => 69 + 12 * Math.log2(hz / 440);
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
/** dB to a gain. */
export const db = (d: number) => Math.pow(10, d / 20);

/** A seeded noise source (xorshift32): -1..1, the same every time for the same seed (every load sounds the same). */
export const rng = (seed: number) => {
  let s = (seed >>> 0) || 0x9e3779b9;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s / 4294967296) * 2 - 1; };
};
/** A seed from a string (an instrument and a zone). */
export const seedOf = (str: string) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

/**
 * One second of noise, to be read round and round (i % length): fed through filters it makes noise that loops (a
 * bow's hiss, a breath, a reed's rasp in a held sound).
 */
export const loopNoise = (sr: number, seed: number) => { const r = rng(seed), n = new Float32Array(sr); for (let i = 0; i < sr; i++) n[i] = r(); return n; };

// ---- Wavetables ----

export const TABLE = 2048;
const tableCache = new Map<string, Float32Array>();
/**
 * One cycle of a wave made of harmonics 1..n, harmonic k at amp(k) (and phase ph(k)), normalized; TABLE + 1 long (the
 * first sample repeated at the end, for the interpolation). Cached by `key`.
 */
export const table = (key: string, n: number, amp: (k: number) => number, ph: (k: number) => number = () => 0): Float32Array => {
  const have = tableCache.get(key);
  if (have) return have;
  const t = new Float32Array(TABLE + 1);
  for (let k = 1; k <= n && k < TABLE / 2; k++) {
    const a = amp(k);
    if (!a) continue;
    // (a rotation per harmonic: cheaper than a sine per sample)
    const w = (TAU * k) / TABLE, p = ph(k);
    let c = Math.cos(p), s = Math.sin(p);
    const cw = Math.cos(w), sw = Math.sin(w);
    for (let i = 0; i < TABLE; i++) { t[i] += a * s; const ns = s * cw + c * sw; c = c * cw - s * sw; s = ns; }
  }
  let peak = 0;
  for (let i = 0; i < TABLE; i++) peak = Math.max(peak, Math.abs(t[i]));
  for (let i = 0; i < TABLE; i++) t[i] /= peak || 1;
  t[TABLE] = t[0];
  tableCache.set(key, t);
  return t;
};
/** Reads a table at a phase in cycles (any value: only its fractional part counts). */
export const rd = (t: Float32Array, ph: number) => {
  const x = (ph - Math.floor(ph)) * TABLE;
  const i = x | 0;
  return t[i] + (t[i + 1] - t[i]) * (x - i);
};
/**
 * How many harmonics of `hz` a sample at `sr` can carry: the zone's played up to half an octave above its root, so
 * everything has to stay under the Nyquist even sped up by that.
 */
export const harmonics = (hz: number, sr: number, maxHz = 20000) => Math.max(1, Math.floor(Math.min(maxHz, sr * 0.5 / 1.42 * 0.96) / hz));

// The classic spectra (amplitude of harmonic k)
export const SAW = (k: number) => 1 / k;
export const SQUARE = (k: number) => (k % 2 ? 1 / k : 0);
export const TRI = (k: number) => (k % 2 ? (((k - 1) / 2) % 2 ? -1 : 1) / (k * k) : 0);
export const pulse = (w: number) => (k: number) => Math.sin(Math.PI * k * w) / k;
/** A resonance bump at `center` Hz, `width` wide (a formant, a body's wood). */
export const bump = (hz: number, center: number, width: number) => Math.exp(-(((hz - center) / width) ** 2));
/** A gentle low-pass's response at `hz` (a second-order roll-off past `cut`). */
export const roll = (hz: number, cut: number, order = 2) => 1 / Math.sqrt(1 + Math.pow(hz / cut, 2 * order));

// ---- Filters ----

export type BiquadType = 'lp' | 'hp' | 'bp' | 'peak' | 'lowshelf' | 'highshelf' | 'notch';
/** An RBJ-cookbook biquad (static: set once). */
export class Biquad {
  b0 = 1; b1 = 0; b2 = 0; a1 = 0; a2 = 0; x1 = 0; x2 = 0; y1 = 0; y2 = 0;
  constructor(type: BiquadType, f: number, q: number, sr: number, gainDb = 0) {
    const w = (TAU * Math.min(f, sr * 0.49)) / sr, cw = Math.cos(w), sw = Math.sin(w), al = sw / (2 * q), A = Math.pow(10, gainDb / 40);
    let b0 = 1, b1 = 0, b2 = 0, a0 = 1, a1 = 0, a2 = 0;
    switch (type) {
      case 'lp': b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; break;
      case 'hp': b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; break;
      case 'bp': b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; break;
      case 'notch': b0 = 1; b1 = -2 * cw; b2 = 1; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; break;
      case 'peak': b0 = 1 + al * A; b1 = -2 * cw; b2 = 1 - al * A; a0 = 1 + al / A; a1 = -2 * cw; a2 = 1 - al / A; break;
      case 'lowshelf': { const s = 2 * Math.sqrt(A) * al; b0 = A * ((A + 1) - (A - 1) * cw + s); b1 = 2 * A * ((A - 1) - (A + 1) * cw); b2 = A * ((A + 1) - (A - 1) * cw - s); a0 = (A + 1) + (A - 1) * cw + s; a1 = -2 * ((A - 1) + (A + 1) * cw); a2 = (A + 1) + (A - 1) * cw - s; break; }
      case 'highshelf': { const s = 2 * Math.sqrt(A) * al; b0 = A * ((A + 1) + (A - 1) * cw + s); b1 = -2 * A * ((A - 1) + (A + 1) * cw); b2 = A * ((A + 1) + (A - 1) * cw - s); a0 = (A + 1) - (A - 1) * cw + s; a1 = 2 * ((A - 1) - (A + 1) * cw); a2 = (A + 1) - (A - 1) * cw - s; break; }
    }
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0;
  }
  run(x: number) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}
/** A chain of biquads (an EQ: a body's resonances, a cabinet). */
export const chain = (list: [BiquadType, number, number, number?][], sr: number) => {
  const fs = list.map(([t, f, q, g]) => new Biquad(t, f, q, sr, g ?? 0));
  return (x: number) => { for (const f of fs) x = f.run(x); return x; };
};

/** A state-variable filter (the topology-preserving one: stable however fast it's swept). */
export class SVF {
  a1 = 0; a2 = 0; a3 = 0; k = 1; ic1 = 0; ic2 = 0; lp = 0; bp = 0; hp = 0;
  constructor(private sr: number) {}
  set(fc: number, q: number) {
    const g = Math.tan((Math.PI * clamp(fc, 10, this.sr * 0.48)) / this.sr);
    this.k = 1 / q; this.a1 = 1 / (1 + g * (g + this.k)); this.a2 = g * this.a1; this.a3 = g * this.a2;
    return this;
  }
  run(x: number) {
    const v3 = x - this.ic2, v1 = this.a1 * this.ic1 + this.a2 * v3, v2 = this.ic2 + this.a2 * this.ic1 + this.a3 * v3;
    this.ic1 = 2 * v1 - this.ic1; this.ic2 = 2 * v2 - this.ic2;
    this.lp = v2; this.bp = v1; this.hp = x - this.k * v1 - v2;
    return v2;
  }
}
/** A one-pole low-pass's coefficient for `fc`. */
export const onePole = (fc: number, sr: number) => 1 - Math.exp((-TAU * fc) / sr);
/** A DC blocker (after anything lopsided: a fuzz, a buzz). */
export const dcBlock = () => { let x1 = 0, y1 = 0; return (x: number) => { const y = x - x1 + 0.995 * y1; x1 = x; y1 = y; return y; }; };

// ---- Resonators (modal synthesis) ----

/** A struck mode: frequency, amplitude, decay (seconds to fall by 60 dB), and its level in each ear; `at` its delay. */
export interface Mode { f: number; a: number; t60: number; l?: number; r?: number; at?: number }
/**
 * Rings a set of modes into `out` (one or two channels), from sample 0 to its length: each one a damped sine run by a
 * two-multiply recurrence. A generator: yields every block so the bank can spread the work out.
 */
export function* ringModes(out: Float32Array[], sr: number, modes: Mode[], maxHz = sr * 0.5 / 1.42 * 0.96) {
  const n = out[0].length, live = modes.filter(m => m.f > 15 && m.f < maxHz && m.a !== 0);
  const M = live.length;
  const c1 = new Float64Array(M), c2 = new Float64Array(M), y1 = new Float64Array(M), y2 = new Float64Array(M), st = new Int32Array(M), gl = new Float64Array(M), gr = new Float64Array(M);
  for (let j = 0; j < M; j++) {
    const m = live[j], w = (TAU * m.f) / sr, r = Math.pow(10, -3 / (Math.max(0.005, m.t60) * sr));
    c1[j] = 2 * r * Math.cos(w); c2[j] = -r * r;
    // (y[-1] = 0, y[0] = a·sin(w)·r: the sine starts from nothing, so there's no click)
    y2[j] = 0; y1[j] = m.a * Math.sin(w);
    st[j] = Math.round((m.at ?? 0) * sr);
    gl[j] = m.l ?? 1; gr[j] = m.r ?? 1;
  }
  const L = out[0], R = out[1];
  const B = 2048;
  for (let i0 = 0; i0 < n; i0 += B) {
    const i1 = Math.min(n, i0 + B);
    for (let j = 0; j < M; j++) {
      let a = y1[j], b = y2[j];
      const k1 = c1[j], k2 = c2[j], s = st[j], l = gl[j], rr = gr[j];
      for (let i = Math.max(i0, s); i < i1; i++) {
        L[i] += a * l; if (R) R[i] += a * rr;
        const y = k1 * a + k2 * b; b = a; a = y;
      }
      if (i1 > s) { y1[j] = a; y2[j] = b; }
      // (died away: dropped)
      if (Math.abs(a) + Math.abs(b) < 1e-7 && i1 > s + sr * 0.05) { c1[j] = 0; c2[j] = 0; y1[j] = 0; y2[j] = 0; }
    }
    yield;
  }
}

// ---- A plucked string ----

/**
 * A Karplus-Strong string tuned exactly (a fractional delay in the loop), at `hz`: `t60` how long the fundamental
 * rings (seconds), `bright` 0..1 how slowly the top dies. Pluck it with `excite`, then run() a sample at a time.
 */
export class KS {
  buf: Float32Array; n: number; idx = 0; prev = 0; apx = 0; apy = 0; c: number; s: number; rho: number;
  constructor(sr: number, hz: number, t60: number, bright: number) {
    const P = sr / hz;
    this.s = 0.5 - 0.42 * clamp(bright, 0, 1);
    this.n = Math.max(2, Math.floor(P - this.s - 0.25));
    const d = P - this.s - this.n;
    this.c = (1 - d) / (1 + d);
    this.rho = Math.pow(10, -3 / (hz * Math.max(0.05, t60)));
    this.buf = new Float32Array(this.n);
  }
  /** Fills the string with a shape (the pick): `shape(i, n)`, then a pick-position comb (`pos` 0..0.5 along). */
  pluck(shape: (i: number, n: number) => number, pos = 0) {
    const n = this.n, b = this.buf;
    for (let i = 0; i < n; i++) b[i] += shape(i, n);
    if (pos > 0) { const d = Math.max(1, Math.round(n * pos)), copy = b.slice(); for (let i = 0; i < n; i++) b[i] = copy[i] - copy[(i + d) % n]; }
    let mean = 0; for (let i = 0; i < n; i++) mean += b[i]; mean /= n; for (let i = 0; i < n; i++) b[i] -= mean;
  }
  run(input = 0) {
    const out = this.buf[this.idx];
    const lp = (1 - this.s) * out + this.s * this.prev; this.prev = out;
    const ap = this.c * lp + this.apx - this.c * this.apy; this.apx = lp; this.apy = ap;
    this.buf[this.idx] = ap * this.rho + input;
    this.idx = this.idx + 1 === this.n ? 0 : this.idx + 1;
    return out;
  }
}
/** A pick's noise burst: `hard` 0..1 (a soft thumb to a hard plectrum), seeded. */
export const pickShape = (seed: number, hard: number) => {
  const r = rng(seed); let lp = 0; const a = 0.08 + 0.9 * hard;
  return (i: number, n: number) => { lp += a * (r() - lp); const win = Math.sin((Math.PI * (i + 0.5)) / n); return lp * (0.4 + 0.6 * win); };
};

// ---- Shaping ----

/** A soft clip (tanh), level-compensated so a quiet signal comes out the size it went in. */
export const drive = (x: number, amt: number) => Math.tanh(x * amt) / Math.tanh(amt);
/** An attack-decay curve: 0 at t=0, up to 1 by `a`, then down by `d` seconds per e-fold. */
export const ad = (t: number, a: number, d: number) => (t < a ? t / a : Math.exp(-(t - a) / d));
/** Smoothstep. */
export const smooth = (u: number) => { const x = clamp(u, 0, 1); return x * x * (3 - 2 * x); };
