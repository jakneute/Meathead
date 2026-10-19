// What an instrument is (InstDef), and the kinds of synthesis the bank's instruments are made with: each a factory
// that, given a zone's root note, describes the sample to make (a ZoneJob) and how to render it, a block at a time
// (a generator, so bank/build.ts can spread the work over idle time and never stall a frame).
//
//   held      a sustained sound (bowed, blown, sung, an organ, a pad): an attack, then exactly one second that loops.
//             An ensemble of whole-hertz voices read from band-limited wavetables, the attack's own spectrum crossfaded
//             into the steady one (a bow biting, brass blatting bright then settling), a pitch scoop, staggered entries,
//             looped noise (breath, bow hiss), a body EQ, a drive, a tremolo.
//   pluck     a plucked string (Karplus-Strong): one or more strings (a power chord), a body EQ, an amp and cabinet.
//   modal     a struck thing: damped sine modes (a piano's strings, a marimba bar, a bell, a drum skin) and a strike.
//   custom    anything else, sample by sample (FM pianos, swept synth basses, the drums).
//
// MULTI-SAMPLED: every pitched instrument is made at several roots (its `zones`, an octave apart by default), and a
// note plays from the nearest one: never sped up or slowed down by more than half an octave, so nothing chipmunks
// and the formants (a voice's vowel, a violin's body) stay where they belong.

import { TAU, midiHz, hzMidi, table, rd, harmonics, loopNoise, Biquad, KS, pickShape, ringModes, drive, smooth, chain, seedOf, rng, type BiquadType, type Mode } from './dsp';

export interface Env { a: number; d: number; s: number; r: number }
export interface ZoneJob {
  sr: number;
  /** Length in samples. */
  len: number;
  ch: 1 | 2;
  /** The MIDI note the sample actually plays at its own rate (held voices are rounded to whole hertz). */
  pitch: number;
  /** Where it loops (samples), for a held sound. */
  loop?: [number, number];
  /** Fills `out` (ch arrays of len), yielding every block. */
  render: (out: Float32Array[]) => Generator<void, void, unknown>;
  /** A one-shot's tail is faded off over its last this-many seconds. */
  fade?: number;
}
export interface InstDef {
  /** For the docs and the sound test: what it is. */
  family: string;
  desc: string;
  /** The roots it's sampled at (MIDI notes). */
  zones: number[];
  job: (root: number, id: string) => ZoneJob;
  /** Share another instrument's samples (a different envelope on the same sound). */
  alias?: string;
  /** The note's own envelope (seconds; s is a level 0..1), on top of what's in the sample. */
  env: Env;
  /** Overall level. */
  gain: number;
  /** Vibrato on held notes: rate (Hz), depth (cents), how long before it comes in (seconds). */
  vib?: [number, number, number?];
  /** How much a soft note is also darker (0: velocity is only loudness; 1: a lot darker, a piano's hammer). */
  velBright?: number;
  /** Played as it is (a drum): no pitch. */
  drum?: boolean;
  /** Cuts off any still-ringing hit of the same group on the same part (the open hat by the closed). */
  choke?: string;
  /** Most notes ringing at once on one part (the oldest let go past it). */
  poly?: number;
  /** One note at a time on a part (a bass, a lead): a new note cuts the last. */
  mono?: boolean;
}

export const SR_HI = 44100, SR_MID = 32000, SR_LO = 22050;
/** Zones every `step` semitones from `lo` to `hi`. */
export const zonesFrom = (lo: number, hi: number, step = 12) => { const z: number[] = []; for (let m = lo; m <= hi; m += step) z.push(m); return z; };

/** Fills `out` from a per-sample function (mono, or [l, r]), yielding every block. */
function* perSample(out: Float32Array[], f: (i: number) => number | [number, number]) {
  const L = out[0], R = out[1], n = L.length;
  for (let i = 0; i < n; i++) {
    const v = f(i);
    if (typeof v === 'number') { L[i] = v; if (R) R[i] = v; } else { L[i] = v[0]; if (R) R[i] = v[1]; }
    if ((i & 2047) === 2047) yield;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// HELD

export interface HeldOpts {
  sr?: number;
  /** The attack's length (seconds): everything time-varying is over by then. */
  pre?: number;
  /** The voices: [cents off, pan -1..1, level]. One in the middle if not given. */
  voices?: [number, number, number][];
  /** The steady spectrum: harmonic k (at hz) of a voice at the zone's root. */
  spec: (k: number, hz: number, root: number) => number;
  /** The attack's spectrum, crossfaded into the steady one by `atkW` (u: 0..1 through the attack; 1 = all attack). */
  atk?: (k: number, hz: number, root: number) => number;
  atkW?: (u: number) => number;
  /** Amplitude through the attack (u 0..1); 1 after. */
  amp?: (u: number) => number;
  /** Starts this many cents off and settles (a lip, a reed, a singer). */
  scoop?: number;
  /** The voices come in up to this many seconds apart. */
  stagger?: number;
  /** Each voice's pitch wandering: [rate (whole Hz), cents]: an ensemble breathing. */
  wob?: [number, number];
  /** Looped noise through a band-pass: center (Hz; or times the root if rel), Q, level in the loop, extra in the attack. */
  noise?: { f: number; q: number; lvl: number; atk?: number; rel?: boolean };
  /** A body (EQ: biquads, static). */
  body?: [BiquadType, number, number, number?][];
  /** A soft clip after it all (1 is none). */
  drive?: number;
  /** A tremolo: [rate (whole Hz), depth 0..1]. */
  trem?: [number, number];
  /** Round each voice's hertz to an even number (so half of it's a whole number too: an organ's 16'). */
  even?: boolean;
  /** Highest harmonic to carry (Hz). */
  maxHz?: number;
}

/** A held sound (see the top of the file). */
export const held = (o: HeldOpts) => (root: number, id: string): ZoneJob => {
  const sr = o.sr ?? SR_MID, pre = Math.round((o.pre ?? 0.1) * sr);
  const f0 = midiHz(root);
  const round = (hz: number) => (o.even ? Math.max(2, 2 * Math.round(hz / 2)) : Math.max(1, Math.round(hz)));
  const base = round(f0);
  const voices = (o.voices ?? [[0, 0, 1]]).map(([c, pan, g], j) => {
    let f = round(base * Math.pow(2, c / 1200));
    if (c !== 0 && f === base) f += (c > 0 ? 1 : -1) * (o.even ? 2 : 1);
    const r = rng(seedOf(id + j));
    return { f, gl: g * Math.sqrt(0.5 * (1 - pan)), gr: g * Math.sqrt(0.5 * (1 + pan)), off: r() * 0.5 + 0.5, wph: r() * TAU, st: o.stagger ? Math.round(((j * 0.618) % 1) * o.stagger * sr) : 0 };
  });
  const nh = harmonics(base * 1.03, sr, o.maxHz);
  const steady = table(`${id}|s`, nh, k => o.spec(k, k * base, root));
  const atk = o.atk ? table(`${id}|a`, nh, k => o.atk!(k, k * base, root)) : null;
  const len = pre + sr;
  return {
    sr, len, ch: 2, pitch: hzMidi(base), loop: [pre, pre + sr],
    render: function* (out) {
      const L = out[0], R = out[1];
      const scoopS = Math.max(1, Math.round(pre * 0.6));
      const scoopPh = new Float64Array(voices.length);
      const wobA = o.wob ? voices.map(v => (v.f * (Math.pow(2, o.wob![1] / 1200) - 1)) / (TAU * o.wob![0])) : null;
      const nz = o.noise ? [loopNoise(sr, seedOf(id + 'nl')), loopNoise(sr, seedOf(id + 'nr'))] : null;
      const nf = o.noise ? [0, 1].map(() => new Biquad('bp', o.noise!.rel ? o.noise!.f * base : o.noise!.f, o.noise!.q, sr)) : null;
      const bodies = o.body ? [chain(o.body, sr), chain(o.body, sr)] : null;
      const dr = o.drive && o.drive > 1 ? o.drive : 0;
      for (let i = 0; i < len; i++) {
        const t = i / sr, u = i < pre ? i / pre : 1;
        let l = 0, r = 0;
        const w = atk && i < pre ? (o.atkW ? o.atkW(u) : 1 - u) : 0;
        for (let j = 0; j < voices.length; j++) {
          const v = voices[j];
          if (i < v.st) continue;
          if (o.scoop && i < scoopS) scoopPh[j] += (v.f * (Math.pow(2, (o.scoop * (1 - smooth(i / scoopS))) / 1200) - 1)) / sr;
          let ph = (i * v.f) / sr + v.off + scoopPh[j];
          if (wobA) ph += wobA[j] * Math.sin(TAU * o.wob![0] * t + v.wph);
          let s = rd(steady, ph);
          if (w > 0) s += (rd(atk!, ph) - s) * w;
          if (v.st && i < v.st + 400) s *= (i - v.st) / 400;
          l += s * v.gl; r += s * v.gr;
        }
        if (nz) {
          const extra = i < pre ? (o.noise!.atk ?? 0) * (1 - u) : 0, lv = o.noise!.lvl + extra;
          l += nf![0].run(nz[0][i % sr]) * lv * 4; r += nf![1].run(nz[1][i % sr]) * lv * 4;
        }
        if (bodies) { l = bodies[0](l); r = bodies[1](r); }
        if (dr) { l = drive(l * 0.6, dr); r = drive(r * 0.6, dr); }
        if (o.trem) { const g = 1 - o.trem[1] * (0.5 + 0.5 * Math.sin(TAU * o.trem[0] * t)); l *= g; r *= g; }
        if (o.amp && i < pre) { const g = o.amp(u); l *= g; r *= g; }
        L[i] = l; R[i] = r;
        if ((i & 2047) === 2047) yield;
      }
    },
  };
};

// ---------------------------------------------------------------------------------------------------------------
// PLUCK

export interface PluckOpts {
  sr?: number;
  /** Seconds long (or by the root). */
  len: number | ((root: number) => number);
  /** How long the fundamental rings (seconds), by frequency. */
  t60: (hz: number) => number;
  /** 0..1: how slowly the top dies. */
  bright: number;
  /** 0..1: the pick (a thumb to a plectrum). */
  hard: number;
  /** Where along the string it's plucked (0..0.5). */
  pos: number;
  /** The strings: [semitones up, level, cents, pan]. One if not given. */
  strings?: [number, number, number, number][];
  /** The strings come in this many seconds apart (a strum, a section). */
  strum?: number;
  /** A body (EQ), and a second one for the right ear if it's to differ. */
  body?: [BiquadType, number, number, number?][];
  bodyR?: [BiquadType, number, number, number?][];
  /** An amp: driven this hard, then a cabinet (EQ). */
  drive?: number;
  cab?: [BiquadType, number, number, number?][];
  /** A sitar's bridge buzz (0..1). */
  buzz?: number;
  /** A transient on the front: a slap's pop, a pick's click, a bachi's crack: level, center (Hz), how long (s). */
  click?: [number, number, number];
  /** A low thump on the front (a thumb, a body knock): level, Hz, decay (s). */
  thump?: [number, number, number];
}

export const pluck = (o: PluckOpts) => (root: number, id: string): ZoneJob => {
  const sr = o.sr ?? SR_HI, f0 = midiHz(root);
  const len = Math.round((typeof o.len === 'number' ? o.len : o.len(root)) * sr);
  const strings = o.strings ?? [[0, 1, 0, 0]];
  return {
    sr, len, ch: 2, pitch: root, fade: 0.04,
    render: function* (out) {
      const L = out[0], R = out[1];
      const ks = strings.map(([semi, , cents], j) => {
        const hz = f0 * Math.pow(2, semi / 12 + cents / 1200);
        const s = new KS(sr, hz, o.t60(hz), o.bright);
        s.pluck(pickShape(seedOf(id + j), o.hard), o.pos);
        return s;
      });
      const pan = strings.map(([, g, , p]) => [g * Math.sqrt(0.5 * (1 - p)), g * Math.sqrt(0.5 * (1 + p))]);
      const startAt = strings.map((_, j) => Math.round(j * (o.strum ?? 0) * sr));
      const bl = o.body ? chain(o.body, sr) : null, br = o.body ? chain(o.bodyR ?? o.body, sr) : null;
      const cl = o.cab ? chain(o.cab, sr) : null, cr = o.cab ? chain(o.cab, sr) : null;
      const hpB = o.buzz ? [new Biquad('hp', 1800, 0.7, sr), new Biquad('hp', 1800, 0.7, sr)] : null;
      const ck = o.click ? new Biquad('bp', o.click[1], 1.2, sr) : null, cn = rng(seedOf(id + 'click'));
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        let l = 0, r = 0;
        for (let j = 0; j < ks.length; j++) { if (i < startAt[j]) continue; const v = ks[j].run(); l += v * pan[j][0]; r += v * pan[j][1]; }
        if (o.click && t < o.click[2] * 4) { const c = ck!.run(cn()) * o.click[0] * Math.exp(-t / o.click[2]) * 3; l += c; r += c; }
        if (o.thump && t < o.thump[2] * 8) { const th = o.thump[0] * Math.sin(TAU * o.thump[1] * t) * Math.exp(-t / o.thump[2]); l += th; r += th; }
        if (bl) { l = bl(l); r = br!(r); }
        if (hpB) { l += o.buzz! * Math.tanh(6 * hpB[0].run(l)) * Math.min(1, Math.abs(l) * 4); r += o.buzz! * Math.tanh(6 * hpB[1].run(r)) * Math.min(1, Math.abs(r) * 4); }
        if (o.drive) { l = drive(l * 1.5, o.drive); r = drive(r * 1.5, o.drive); }
        if (cl) { l = cl(l); r = cr!(r); }
        L[i] = l; R[i] = r;
        if ((i & 2047) === 2047) yield;
      }
    },
  };
};

// ---------------------------------------------------------------------------------------------------------------
// MODAL

export interface ModalOpts {
  sr?: number;
  len: number | ((root: number) => number);
  /** The modes for a zone at f0 (Hz). */
  modes: (f0: number, root: number) => Mode[];
  /** The strike: a burst of filtered noise: level, center Hz, Q, decay (s). */
  strike?: [number, number, number, number];
  /** Stereo (the modes' own l/r), or mono. */
  stereo?: boolean;
  /** A tremolo baked in (a vibraphone's motor): rate Hz, depth, and the right ear's phase offset (radians). */
  trem?: [number, number, number];
}

export const modal = (o: ModalOpts) => (root: number, id: string): ZoneJob => {
  const sr = o.sr ?? SR_HI, f0 = midiHz(root);
  const len = Math.round((typeof o.len === 'number' ? o.len : o.len(root)) * sr);
  return {
    sr, len, ch: o.stereo ? 2 : 1, pitch: root, fade: 0.05,
    render: function* (out) {
      yield* ringModes(out, sr, o.modes(f0, root));
      if (o.strike) {
        const [lvl, f, q, dec] = o.strike, bq = new Biquad('bp', f, q, sr), r = rng(seedOf(id + 's')), n = Math.min(len, Math.round(dec * 8 * sr));
        for (let i = 0; i < n; i++) { const v = bq.run(r()) * lvl * Math.exp(-i / (dec * sr)) * 3; out[0][i] += v; if (out[1]) out[1][i] += v; }
      }
      if (o.trem) {
        const [rate, depth, off] = o.trem;
        for (let i = 0; i < len; i++) { const t = (TAU * rate * i) / sr; out[0][i] *= 1 - depth * (0.5 + 0.5 * Math.sin(t)); if (out[1]) out[1][i] *= 1 - depth * (0.5 + 0.5 * Math.sin(t + off)); }
      }
    },
  };
};

// ---------------------------------------------------------------------------------------------------------------
// CUSTOM

export interface CustomOpts {
  sr?: number;
  /** Seconds (or by the root). A held one: the attack's length, and a one-second loop after it. */
  len: number | ((root: number) => number);
  ch?: 1 | 2;
  /** Held: the sound loops after `len` seconds, for exactly one second (whole-hertz everything, as in held()). */
  held?: boolean;
  /** Round the root to whole hertz (a held sound) or not; or to an even number of hertz (so half of it's whole too). */
  whole?: boolean;
  even?: boolean;
  /** Makes the zone's per-sample function: (i) => a sample, or [l, r]. */
  make: (f0: number, sr: number, seed: number, root: number) => (i: number) => number | [number, number];
  fade?: number;
}

export const custom = (o: CustomOpts) => (root: number, id: string): ZoneJob => {
  const sr = o.sr ?? SR_HI;
  const f0 = o.even ? Math.max(2, 2 * Math.round(midiHz(root) / 2)) : o.whole || o.held ? Math.max(1, Math.round(midiHz(root))) : midiHz(root);
  const pre = Math.round((typeof o.len === 'number' ? o.len : o.len(root)) * sr);
  const len = o.held ? pre + sr : pre;
  const f = o.make(f0, sr, seedOf(id), root);
  return {
    sr, len, ch: o.ch ?? 1, pitch: hzMidi(f0), loop: o.held ? [pre, pre + sr] : undefined, fade: o.held ? undefined : (o.fade ?? 0.03),
    render: out => perSample(out, f),
  };
};

/** One cycle's worth of a classic wave as a wavetable at a zone (cached): 'saw', 'square', 'tri', or a pulse width. */
export const waveAt = (kind: 'saw' | 'square' | 'tri' | number, hz: number, sr: number, cut = 20000) => {
  const n = harmonics(hz, sr, cut);
  const spec = kind === 'saw' ? (k: number) => 1 / k : kind === 'square' ? (k: number) => (k % 2 ? 1 / k : 0) : kind === 'tri' ? (k: number) => (k % 2 ? (((k - 1) / 2) % 2 ? -1 : 1) / (k * k) : 0) : (k: number) => Math.sin(Math.PI * k * kind) / k;
  return table(`wave|${kind}|${n}`, n, spec);
};
export { rd };
