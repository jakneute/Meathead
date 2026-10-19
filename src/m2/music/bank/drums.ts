// Meathead 2's drums and percussion: an acoustic kit, the 808 and the 909, brushes, the orchestra's, the world's.
// Each is played as it is (no pitch: a drum part's letters, or (name), pick them; see MML.md), made at startup like
// the rest of the bank. Kits (KITS) say which drum each letter of a drum part plays.

import { TAU, rng, Biquad, ringModes, clamp, drive, type Mode } from './dsp';
import { custom, SR_HI, SR_MID, SR_LO, type InstDef, type ZoneJob } from './kit';

type Make = (sr: number, seed: number) => (i: number) => number | [number, number];
const D = (desc: string, sr: number, len: number, ch: 1 | 2, gain: number, make: Make, extra: Partial<InstDef> = {}): InstDef => ({
  family: 'drums', desc, zones: [60], drum: true, gain, env: { a: 0.0005, d: 0, s: 1, r: 0.05 }, poly: 6,
  job: custom({ sr, len, ch, fade: Math.min(0.05, len * 0.2), make: (_f0, s, seed) => make(s, seed) }),
  ...extra,
});
/** A drum made of struck modes plus noise (a cymbal, a bell): its own job. */
const M = (desc: string, sr: number, len: number, gain: number, modes: (r: () => number) => Mode[], noise: ((sr: number, seed: number) => (i: number) => number) | null, extra: Partial<InstDef> = {}): InstDef => ({
  family: 'drums', desc, zones: [60], drum: true, gain, env: { a: 0.0005, d: 0, s: 1, r: 0.15 }, poly: 4,
  job: (_root: number, id: string): ZoneJob => {
    let h = 7; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    const n = Math.round(len * sr);
    return {
      sr, len: n, ch: 2, pitch: 60, fade: 0.08,
      render: function* (out) {
        yield* ringModes(out, sr, modes(rng(h)));
        if (noise) { const f = noise(sr, h ^ 0x5bd1); for (let i = 0; i < n; i++) { const v = f(i); out[0][i] += v; out[1][i] += v * 0.9; if ((i & 4095) === 4095) yield; } }
      },
    };
  },
  ...extra,
});

/** A sine swept down from `hi` to `lo` (Hz) by `sweep` seconds. */
const sweepSine = (sr: number, lo: number, hi: number, sweep: number) => { let ph = 0; return (t: number) => { ph += (lo + (hi - lo) * Math.exp(-t / sweep)) / sr; return Math.sin(TAU * ph); }; };
/** Noise through a filter. */
const noiseThrough = (seed: number, f: Biquad[]) => { const r = rng(seed); return () => { let x = r(); for (const b of f) x = b.run(x); return x; }; };
/** The 808's metal: six square waves at its odd frequencies. */
const METAL = [205.3, 304.4, 369.6, 522.7, 540, 800];
const metal = (sr: number, scale: number) => { const ph = METAL.map(() => 0); return () => { let v = 0; for (let j = 0; j < 6; j++) { ph[j] += (METAL[j] * scale) / sr; v += ph[j] % 1 < 0.5 ? 1 : -1; } return v / 6; }; };
/** A cymbal's modes: n inharmonic partials between lo and hi Hz, each its own decay and side. */
const cymbalModes = (n: number, lo: number, hi: number, t60: number, level = 1) => (r: () => number): Mode[] => Array.from({ length: n }, () => {
  const f = lo * Math.pow(hi / lo, (r() + 1) / 2), p = r();
  return { f, a: (level * (0.3 + 0.7 * Math.abs(r()))) / Math.sqrt(n), t60: t60 * (0.5 + 0.6 * Math.abs(r())) * Math.pow(2000 / f, 0.25), l: Math.sqrt(0.5 * (1 - p)), r: Math.sqrt(0.5 * (1 + p)) };
});
/** A cymbal's wash: high-passed noise, a fast attack, a long decay. */
const wash = (lvl: number, hp: number, dec: number) => (sr: number, seed: number) => { const n = noiseThrough(seed, [new Biquad('hp', hp, 0.7, sr), new Biquad('peak', hp * 2, 1, sr, 3)]); return (i: number) => { const t = i / sr; return n() * lvl * Math.min(1, t / 0.002) * Math.exp(-t / dec); }; };

/** The snare: two shell modes and the wires (band-passed noise), the stick's crack. */
const snareOf = (shell: [number, number], wires: number, dec: number, crack: number) => (sr: number, seed: number) => {
  const n = noiseThrough(seed, [new Biquad('hp', 1200, 0.7, sr), new Biquad('peak', wires, 0.8, sr, 6)]), a = sweepSine(sr, shell[0], shell[0] * 1.15, 0.01), b = sweepSine(sr, shell[1], shell[1] * 1.1, 0.01);
  return (i: number) => { const t = i / sr; return (a(t) * 0.55 * Math.exp(-t / 0.05) + b(t) * 0.3 * Math.exp(-t / 0.035) + n() * 0.9 * Math.exp(-t / dec) + (t < 0.003 ? crack * (1 - t / 0.003) : 0)) * Math.min(1, t / 0.0007); };
};
/** A tom: a skin swept down a little as it rings, its second mode, the stick. */
const tomOf = (f: number, dec: number) => (sr: number, seed: number) => {
  const a = sweepSine(sr, f, f * 1.35, 0.06), b = sweepSine(sr, f * 1.59, f * 1.8, 0.05), n = noiseThrough(seed, [new Biquad('bp', 2500, 0.7, sr)]);
  return (i: number) => { const t = i / sr; return a(t) * Math.exp(-t / dec) + b(t) * 0.25 * Math.exp(-t / (dec * 0.4)) + n() * 0.3 * Math.exp(-t / 0.006); };
};
/** A hand drum (conga, bongo, timbale): the skin's ring, its overtone, the hand's slap. */
const handOf = (f: number, dec: number, slap: number, ring = 1.5) => (sr: number, seed: number) => {
  const a = sweepSine(sr, f, f * 1.08, 0.02), b = sweepSine(sr, f * ring, f * ring * 1.05, 0.02), n = noiseThrough(seed, [new Biquad('bp', 3000, 0.8, sr)]);
  return (i: number) => { const t = i / sr; return a(t) * Math.exp(-t / dec) + b(t) * 0.3 * Math.exp(-t / (dec * 0.5)) + n() * slap * Math.exp(-t / 0.008); };
};
/** A wooden click (a woodblock, a clave, a side stick): a few modes, gone fast. */
const woodOf = (fs: [number, number, number][]) => (sr: number) => (i: number) => { const t = i / sr; let v = 0; for (const [f, a, d] of fs) v += a * Math.sin(TAU * f * t) * Math.exp(-t / d); return v * Math.min(1, t / 0.0004); };
/** A clap: a few bursts of band-passed noise close together, then the room's tail. */
const clapOf = (center: number, tail: number, bursts = [0, 0.011, 0.022, 0.033]) => (sr: number, seed: number) => {
  const n = noiseThrough(seed, [new Biquad('bp', center, 1.3, sr), new Biquad('hp', 600, 0.7, sr)]);
  return (i: number) => { const t = i / sr; let e = 0; for (const b of bursts) if (t >= b) e = Math.max(e, Math.exp(-(t - b) / 0.006)); const last = bursts[bursts.length - 1]; if (t >= last) e = Math.max(e, 0.6 * Math.exp(-(t - last) / tail)); return n() * e * 1.6; };
};
/** Jingles (a tambourine's, sleigh bells'): high inharmonic rings, shaken. */
const jingleOf = (shakes: number[], dec: number) => (sr: number, seed: number) => {
  const r = rng(seed), fs = Array.from({ length: 12 }, () => 5500 + 5500 * Math.abs(r())), n = noiseThrough(seed, [new Biquad('hp', 6000, 0.7, sr)]);
  return (i: number) => { const t = i / sr; let e = 0; for (const s of shakes) if (t >= s) e = Math.max(e, Math.exp(-(t - s) / dec)); let v = 0; for (const f of fs) v += Math.sin(TAU * f * t); return (v / 6 * 0.6 + n() * 0.8) * e; };
};

/** Every drum. */
export const DRUMS: Record<string, InstDef> = {
  // ---- The acoustic kit ----
  kick: D('Kick: the beater, the shell\'s boom', SR_LO, 0.7, 1, 0.95, (sr, seed) => {
    const body = sweepSine(sr, 52, 140, 0.03), n = noiseThrough(seed, [new Biquad('lp', 400, 0.7, sr)]), cl = noiseThrough(seed + 1, [new Biquad('bp', 3200, 1, sr)]);
    return i => { const t = i / sr; return body(t) * Math.exp(-t / 0.28) + n() * 0.5 * Math.exp(-t / 0.03) + cl() * 0.6 * Math.exp(-t / 0.002); };
  }),
  kicksoft: D('Soft kick (the jazz kit\'s, felt beater)', SR_LO, 0.8, 1, 0.9, (sr, seed) => {
    const body = sweepSine(sr, 58, 95, 0.04), n = noiseThrough(seed, [new Biquad('lp', 300, 0.7, sr)]);
    return i => { const t = i / sr; return body(t) * Math.exp(-t / 0.35) + n() * 0.4 * Math.exp(-t / 0.05); };
  }),
  snare: D('Snare: shell, wires, stick', SR_HI, 0.5, 1, 0.6, snareOf([185, 330], 4500, 0.13, 0.5), { velBright: 0.4 }),
  snare2: D('Tight snare (a 90s pop crack)', SR_HI, 0.4, 1, 0.6, snareOf([240, 420], 6000, 0.09, 0.8), { velBright: 0.4 }),
  rimshot: D('Rimshot: shell and the rim\'s crack', SR_HI, 0.4, 1, 0.55, (sr, seed) => {
    const s = snareOf([200, 360], 5000, 0.1, 0.6)(sr, seed);
    return i => { const t = i / sr; return (s(i) as number) * 0.8 + Math.sin(TAU * 1900 * t) * Math.exp(-t / 0.012) * 0.9; };
  }),
  sidestick: D('Side stick (cross-stick click)', SR_HI, 0.15, 1, 0.45, woodOf([[1700, 1, 0.012], [2650, 0.5, 0.008], [520, 0.4, 0.02]])),
  brushsnare: D('Brush on the snare: a papery swish', SR_HI, 0.35, 1, 0.42, (sr, seed) => {
    const n = noiseThrough(seed, [new Biquad('bp', 3500, 0.5, sr), new Biquad('lp', 7000, 0.7, sr)]);
    return i => { const t = i / sr; return n() * Math.min(1, t / 0.012) * Math.exp(-t / 0.11) + Math.sin(TAU * 190 * t) * Math.exp(-t / 0.03) * 0.12; };
  }),
  tom1: D('High tom', SR_LO, 0.6, 1, 0.6, tomOf(210, 0.35)),
  tom2: D('Mid tom', SR_LO, 0.7, 1, 0.62, tomOf(160, 0.4)),
  tom3: D('Low tom', SR_LO, 0.8, 1, 0.65, tomOf(118, 0.45)),
  tom4: D('Floor tom', SR_LO, 0.9, 1, 0.68, tomOf(86, 0.5)),
  hat: D('Closed hi-hat', SR_HI, 0.12, 1, 0.3, (sr, seed) => {
    const m = metal(sr, 1.7), f1 = new Biquad('hp', 7000, 0.7, sr), f2 = new Biquad('peak', 9500, 1, sr, 4), n = noiseThrough(seed, [new Biquad('hp', 8000, 0.7, sr)]);
    return i => { const t = i / sr; return (f2.run(f1.run(m())) * 0.8 + n() * 0.5) * Math.exp(-t / 0.028); };
  }, { choke: 'hat', velBright: 0.5 }),
  ohat: D('Open hi-hat (the closed and pedal hats cut it)', SR_HI, 0.9, 1, 0.26, (sr, seed) => {
    const m = metal(sr, 1.7), f1 = new Biquad('hp', 6500, 0.7, sr), n = noiseThrough(seed, [new Biquad('hp', 7000, 0.7, sr)]);
    return i => { const t = i / sr; return (f1.run(m()) * 0.7 + n() * 0.6) * Math.exp(-t / 0.3); };
  }, { choke: 'hat' }),
  hatpedal: D('Pedal hi-hat (the chick)', SR_HI, 0.15, 1, 0.24, (sr, seed) => {
    const m = metal(sr, 1.6), f1 = new Biquad('hp', 5500, 0.7, sr), n = noiseThrough(seed, [new Biquad('bp', 900, 1, sr)]);
    return i => { const t = i / sr; return f1.run(m()) * Math.exp(-t / 0.04) + n() * 0.3 * Math.exp(-t / 0.01); };
  }, { choke: 'hat' }),
  crash: M('Crash cymbal', SR_HI, 3.5, 0.32, cymbalModes(60, 350, 11000, 2.6), wash(0.5, 4000, 0.9)),
  splash: M('Splash cymbal', SR_HI, 1.4, 0.3, cymbalModes(40, 600, 12000, 0.9), wash(0.5, 5000, 0.35)),
  china: M('China cymbal: trashy', SR_HI, 2.4, 0.32, cymbalModes(55, 300, 7000, 1.4, 1.3), wash(0.7, 2500, 0.6)),
  ride: M('Ride cymbal: the ping over a wash', SR_HI, 2.8, 0.2, r => [...cymbalModes(36, 400, 9000, 2.2, 0.5)(r), { f: 3150, a: 0.3, t60: 0.7 }, { f: 4410, a: 0.22, t60: 0.5 }, { f: 5230, a: 0.15, t60: 0.4 }], wash(0.15, 6000, 1.1)),
  ridebell: M('Ride bell', SR_HI, 2.2, 0.2, r => [...cymbalModes(20, 600, 8000, 1.6, 0.4)(r), { f: 820, a: 0.5, t60: 1.8 }, { f: 2310, a: 0.4, t60: 1.2 }, { f: 3650, a: 0.25, t60: 0.8 }], null),
  clap: D('Hand clap', SR_HI, 0.4, 1, 0.45, clapOf(1200, 0.09)),
  // ---- The 808 ----
  '808kick': D('808 kick: the long boom', SR_LO, 1.4, 1, 0.95, (sr) => { const body = sweepSine(sr, 47, 110, 0.02); return i => { const t = i / sr; return drive(body(t) * 1.1, 1.4) * Math.exp(-t / 0.7) * Math.min(1, t / 0.001); }; }),
  '808snare': D('808 snare', SR_HI, 0.4, 1, 0.55, (sr, seed) => {
    const a = sweepSine(sr, 180, 200, 0.01), b = sweepSine(sr, 330, 360, 0.01), n = noiseThrough(seed, [new Biquad('hp', 1800, 0.7, sr)]);
    return i => { const t = i / sr; return a(t) * 0.5 * Math.exp(-t / 0.06) + b(t) * 0.3 * Math.exp(-t / 0.04) + n() * 0.7 * Math.exp(-t / 0.1); };
  }),
  '808clap': D('808 clap', SR_HI, 0.6, 1, 0.45, clapOf(1100, 0.14, [0, 0.009, 0.019, 0.03])),
  '808hat': D('808 closed hat', SR_HI, 0.1, 1, 0.28, (sr) => { const m = metal(sr, 1), f1 = new Biquad('bp', 8500, 1.2, sr), f2 = new Biquad('hp', 6500, 0.7, sr); return i => f2.run(f1.run(m())) * Math.exp(-i / sr / 0.022) * 2; }, { choke: 'hat' }),
  '808ohat': D('808 open hat', SR_HI, 0.7, 1, 0.26, (sr) => { const m = metal(sr, 1), f1 = new Biquad('bp', 8500, 1.2, sr), f2 = new Biquad('hp', 6500, 0.7, sr); return i => f2.run(f1.run(m())) * Math.exp(-i / sr / 0.2) * 2; }, { choke: 'hat' }),
  '808cowbell': D('808 cowbell', SR_HI, 0.5, 1, 0.3, (sr) => { let a = 0, b = 0; const f = new Biquad('bp', 2600, 1.4, sr); return i => { const t = i / sr; a += 540 / sr; b += 800 / sr; return f.run((a % 1 < 0.5 ? 1 : -1) + (b % 1 < 0.5 ? 1 : -1)) * (0.35 * Math.exp(-t / 0.012) + 0.65 * Math.exp(-t / 0.12)) * 2; }; }),
  '808tom': D('808 tom', SR_LO, 0.7, 1, 0.65, (sr) => { const b = sweepSine(sr, 160, 210, 0.05); return i => b(i / sr) * Math.exp(-i / sr / 0.3); }),
  '808tomlo': D('808 low tom', SR_LO, 0.8, 1, 0.68, (sr) => { const b = sweepSine(sr, 100, 135, 0.06); return i => b(i / sr) * Math.exp(-i / sr / 0.35); }),
  '808rim': D('808 rimshot', SR_HI, 0.08, 1, 0.4, woodOf([[1700, 1, 0.008], [460, 0.5, 0.01]])),
  clave: D('Claves', SR_HI, 0.2, 1, 0.42, woodOf([[2500, 1, 0.03]])),
  // ---- The 909 ----
  '909kick': D('909 kick: punchy, the click on top', SR_MID, 0.6, 1, 0.95, (sr, seed) => {
    const body = sweepSine(sr, 54, 230, 0.011), cl = noiseThrough(seed, [new Biquad('hp', 2000, 0.7, sr)]);
    return i => { const t = i / sr; return drive(body(t) * 1.3, 1.5) * Math.exp(-t / 0.26) + cl() * 0.5 * Math.exp(-t / 0.004); };
  }),
  '909snare': D('909 snare: noisy', SR_HI, 0.45, 1, 0.58, snareOf([190, 345], 7000, 0.15, 0.4)),
  '909clap': D('909 clap', SR_HI, 0.45, 1, 0.45, clapOf(1300, 0.11)),
  '909hat': D('909 closed hat', SR_HI, 0.1, 1, 0.28, (sr, seed) => { const n = noiseThrough(seed, [new Biquad('hp', 8000, 0.7, sr), new Biquad('peak', 11000, 1, sr, 5)]); return i => n() * Math.exp(-i / sr / 0.025) * 1.4; }, { choke: 'hat' }),
  '909ohat': D('909 open hat', SR_HI, 0.6, 1, 0.26, (sr, seed) => { const n = noiseThrough(seed, [new Biquad('hp', 7500, 0.7, sr), new Biquad('peak', 10500, 1, sr, 5)]); return i => n() * Math.exp(-i / sr / 0.18) * 1.4; }, { choke: 'hat' }),
  // ---- Orchestra and the world ----
  taiko: D('Taiko: the huge low drum, the skin dropping as it rings', SR_LO, 1.4, 1, 0.85, (sr, seed) => {
    const body = sweepSine(sr, 56, 95, 0.09), n = noiseThrough(seed, [new Biquad('lp', 260, 0.7, sr)]), st = noiseThrough(seed + 3, [new Biquad('bp', 1500, 1, sr)]);
    return i => { const t = i / sr; return body(t) * Math.exp(-t / 0.5) + n() * 1.6 * Math.exp(-t / 0.08) + st() * 0.3 * Math.exp(-t / 0.004); };
  }),
  bassdrum: D('Concert bass drum: soft, huge', SR_LO, 2, 1, 0.85, (sr, seed) => {
    const body = sweepSine(sr, 42, 55, 0.08), n = noiseThrough(seed, [new Biquad('lp', 150, 0.7, sr)]);
    return i => { const t = i / sr; return (body(t) * Math.exp(-t / 0.7) + n() * 1.5 * Math.exp(-t / 0.15)) * Math.min(1, t / 0.008); };
  }),
  gong: M('Gong (tam-tam): shimmering, swelling, long', SR_MID, 6, 0.45, r => cymbalModes(70, 60, 3000, 5, 1)(r).map((m, j) => ({ ...m, at: (j % 5) * 0.02 })), (sr, seed) => { const n = noiseThrough(seed, [new Biquad('bp', 500, 0.7, sr)]); return i => { const t = i / sr; return n() * 0.4 * Math.exp(-t / 0.05); }; }),
  congahi: D('Conga, high', SR_MID, 0.4, 1, 0.5, handOf(340, 0.12, 0.4)),
  congalo: D('Conga, low (tumba)', SR_MID, 0.5, 1, 0.55, handOf(225, 0.16, 0.35)),
  congaslap: D('Conga slap', SR_MID, 0.25, 1, 0.5, handOf(380, 0.04, 1.4, 2.3)),
  bongohi: D('Bongo, high', SR_MID, 0.25, 1, 0.45, handOf(520, 0.06, 0.5)),
  bongolo: D('Bongo, low', SR_MID, 0.3, 1, 0.48, handOf(360, 0.08, 0.45)),
  timbale: D('Timbale: metal-rimmed, ringing', SR_HI, 0.7, 1, 0.45, (sr, seed) => { const h = handOf(420, 0.2, 0.6, 1.68)(sr, seed); return i => { const t = i / sr; return (h(i) as number) + Math.sin(TAU * 2900 * t) * 0.15 * Math.exp(-t / 0.15); }; }),
  cowbell: D('Cowbell (a real one)', SR_HI, 0.5, 1, 0.32, woodOf([[562, 1, 0.12], [845, 0.8, 0.09], [1310, 0.35, 0.05], [1850, 0.2, 0.03]])),
  tamb: D('Tambourine', SR_HI, 0.45, 1, 0.24, jingleOf([0, 0.012], 0.09)),
  shaker: D('Shaker', SR_HI, 0.12, 1, 0.2, (sr, seed) => { const n = noiseThrough(seed, [new Biquad('bp', 6000, 0.9, sr)]); return i => { const t = i / sr; return n() * Math.sin(Math.PI * clamp(t / 0.1, 0, 1)) * 1.4; }; }),
  castanets: D('Castanets', SR_HI, 0.12, 1, 0.38, (sr) => { const w = woodOf([[2300, 1, 0.006], [3400, 0.6, 0.004], [1200, 0.4, 0.008]])(sr); return i => (w(i) as number) + (i > 0.011 * sr ? (w(i - Math.round(0.011 * sr)) as number) * 0.7 : 0); }),
  woodblock: D('Wood block, high', SR_HI, 0.15, 1, 0.42, woodOf([[1250, 1, 0.025], [2400, 0.4, 0.012]])),
  woodblocklo: D('Wood block, low', SR_HI, 0.18, 1, 0.42, woodOf([[820, 1, 0.03], [1600, 0.4, 0.015]])),
  triangle: M('Triangle, let ring', SR_HI, 3, 0.2, () => [[1400, 1, 2.6], [2950, 0.55, 2.2], [4410, 0.4, 1.8], [5880, 0.3, 1.4], [7420, 0.2, 1.1], [9050, 0.12, 0.8]].map(([f, a, t], j) => ({ f, a, t60: t, l: j % 2 ? 0.7 : 1, r: j % 2 ? 1 : 0.7 })), null),
  trimute: M('Triangle, muted', SR_HI, 0.3, 0.2, () => [[1400, 1, 0.15], [2950, 0.55, 0.12], [4410, 0.4, 0.1], [5880, 0.3, 0.08]].map(([f, a, t]) => ({ f, a, t60: t })), null),
  sleigh: D('Sleigh bells', SR_HI, 0.6, 1, 0.22, jingleOf([0, 0.025, 0.05], 0.12)),
  slapstick: D('Slapstick (whip crack)', SR_HI, 0.2, 1, 0.5, (sr, seed) => { const n = noiseThrough(seed, [new Biquad('bp', 1800, 1.5, sr)]); return i => { const t = i / sr; return n() * 2 * (Math.exp(-t / 0.004) + (t > 0.006 ? 0.5 * Math.exp(-(t - 0.006) / 0.01) : 0)); }; }),
  scratch: D('A record scratch', SR_HI, 0.25, 1, 0.3, (sr, seed) => { let ph = 0; const n = rng(seed); return i => { const t = i / sr, w = Math.abs(Math.sin(TAU * 8 * t)); ph += (250 + 1300 * w) / sr; return Math.sin(TAU * ph) * 0.5 * w + n() * 0.3 * w; }; }),
};

/** What each letter of a drum part plays, by kit (a part's `kit`); letters a kit doesn't name fall back to 'acoustic'. */
export const KITS: Record<string, Record<string, string>> = {
  acoustic: {
    k: 'kick', s: 'snare', h: 'hat', o: 'ohat', x: 'crash', t: 'tom1', u: 'tom3', p: 'clap', c: 'congahi', d: 'congalo',
    b: 'bongohi', w: 'cowbell', z: 'shaker', m: 'sidestick', j: 'tamb', y: 'sleigh', g: 'scratch', i: 'ride', n: 'brushsnare',
    f: 'taiko', a: 'slapstick', e: 'woodblock',
  },
  '808': { k: '808kick', s: '808snare', h: '808hat', o: '808ohat', p: '808clap', w: '808cowbell', m: '808rim', t: '808tom', u: '808tomlo', e: 'clave' },
  '909': { k: '909kick', s: '909snare', h: '909hat', o: '909ohat', p: '909clap' },
  brush: { k: 'kicksoft', s: 'brushsnare', h: 'hatpedal', m: 'sidestick' },
  orchestra: { k: 'bassdrum', s: 'snare2', x: 'crash', g: 'gong', i: 'triangle', e: 'woodblock', w: 'cowbell' },
};
/** The letters a drum part can use (any kit's). */
export const DRUM_LETTERS = new Set(Object.keys(KITS.acoustic));
