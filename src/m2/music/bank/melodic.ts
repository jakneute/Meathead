// Meathead 2's pitched instruments: the late-90s bank (a PS1 / high-end N64 game's: Final Fantasy VII and IX,
// Symphony of the Night, Banjo-Tooie, Conker, Diddy Kong Racing). All made at startup (bank/build.ts), multi-sampled
// (an octave apart, so nothing's ever sped up or slowed down by more than half an octave), stereo where it matters.
// Names are what a part's `inst` (and MML's @name) asks for; MUSIC.md lists them all for the composers.

import { TAU, rng, Biquad, SVF, bump, roll, drive, clamp, rd, harmonics, table, type Mode } from './dsp';
import { held, pluck, modal, custom, zonesFrom, waveAt, SR_HI, SR_MID, SR_LO, type InstDef } from './kit';

// A few spectra
/** Brass: rich, a little rolled off past `cut`, a bump where the bell sings. */
const brassSpec = (cut: number, f1: number, w1: number, tilt = 0.75) => (k: number, hz: number) => Math.pow(k, -tilt) * roll(hz, cut) * (1 + 0.8 * bump(hz, f1, w1));
/** A vowel: a glottal source (tilted down), shaped by formants: [center Hz, width Hz, level]. */
const vowel = (fs: [number, number, number][], tilt = 1.15) => (k: number, hz: number) => Math.pow(k, -tilt) * (0.02 + fs.reduce((a, [c, w, g]) => a + g * bump(hz, c, w), 0)) * roll(hz, 5000);
/** Male and female formants blended by register (a mixed choir). */
const choirFormants = (root: number, male: [number, number, number][], female: [number, number, number][]) => {
  const x = clamp((root - 50) / 18, 0, 1);
  return male.map(([c, w, g], j) => [c + (female[j][0] - c) * x, w + (female[j][1] - w) * x, g + (female[j][2] - g) * x] as [number, number, number]);
};
const AAH_M: [number, number, number][] = [[700, 130, 1], [1150, 160, 0.55], [2500, 260, 0.3], [3300, 300, 0.12]];
const AAH_F: [number, number, number][] = [[880, 150, 1], [1250, 180, 0.5], [2900, 300, 0.32], [3800, 350, 0.12]];
const OOH_M: [number, number, number][] = [[330, 90, 1], [700, 130, 0.35], [2400, 260, 0.08], [3200, 300, 0.04]];
const OOH_F: [number, number, number][] = [[380, 100, 1], [820, 140, 0.32], [2700, 300, 0.08], [3500, 300, 0.04]];

/** Section voices spread across the stereo: n voices, `spread` cents either side. */
const section = (n: number, spread: number, width = 0.8): [number, number, number][] =>
  Array.from({ length: n }, (_, j) => { const x = n === 1 ? 0 : (j / (n - 1)) * 2 - 1; return [x * spread + (j % 2 ? 1.3 : -0.7), x * width * (j % 2 ? -1 : 1), 1] as [number, number, number]; });

/** The grand piano: two or three strings a note (a hair apart: the beating, the double decay), stiff (the overtones a
 *  little sharp), struck an eighth of the way along, the bass to the left and the treble to the right; the hammer's
 *  knock and the soundboard under it. */
const grand = modal({
  len: root => clamp(5.2 - (root - 30) * 0.05, 1.6, 5),
  stereo: true,
  modes: (f0, root) => {
    const out: Mode[] = [];
    const nStr = root < 34 ? 1 : root < 46 ? 2 : 3;
    const det = [0, 1.1, -0.8].slice(0, nStr);
    const B = 0.00012 * Math.pow(2, (root - 48) / 14);
    const T0 = clamp(14 * Math.pow(2, -(root - 33) / 16), 1.1, 16);
    const K = Math.min(48, Math.floor((SR_HI * 0.33) / f0));
    const pan = clamp((root - 64) / 40, -0.7, 0.7);
    for (let s = 0; s < nStr; s++) {
      const sp = pan + (s - 1) * 0.08;
      const l = Math.sqrt(0.5 * (1 - sp)), r = Math.sqrt(0.5 * (1 + sp));
      for (let k = 1; k <= K; k++) {
        const f = k * f0 * Math.sqrt(1 + B * k * k) * Math.pow(2, det[s] / 1200);
        const strike = Math.abs(Math.sin(Math.PI * k * 0.122));
        const a = (Math.pow(k, -0.85) * (0.25 + strike) * roll(f, 3200 + root * 40, 1.2)) / nStr;
        const t60 = (T0 * (s === 1 ? 0.75 : 1)) / (1 + Math.pow(f / 1400, 1.3));
        out.push({ f, a, t60, l, r });
      }
    }
    // (the soundboard's knock)
    for (const [f, a, t] of [[92, 0.05, 0.09], [151, 0.04, 0.07], [233, 0.03, 0.06], [347, 0.02, 0.05]] as const) out.push({ f, a, t60: t, l: 0.7, r: 0.7 });
    return out;
  },
  strike: [0.05, 2600, 0.8, 0.004],
});

/** A tine electric piano (the Rhodes): the tine's FM bark (velocity-dark with velBright), the tone bar's warm body. */
const tine = custom({
  sr: SR_MID, ch: 2,
  len: root => clamp(3.2 - (root - 36) * 0.03, 1.4, 3.2),
  make: (f0) => (i) => {
    const t = i / SR_MID;
    const idx = 1.3 * Math.exp(-t / 0.22) + 0.35;
    const env = Math.exp(-t / clamp(2.2 * Math.pow(2, -(Math.log2(f0 / 130)) * 0.5), 0.5, 2.6));
    const bark = 0.18 * Math.sin(TAU * f0 * 7.03 * t) * Math.exp(-t / 0.025);
    const a = Math.sin(TAU * f0 * t + idx * Math.sin(TAU * f0 * t)) * env + bark;
    const b = Math.sin(TAU * f0 * 1.0012 * t + idx * Math.sin(TAU * f0 * 1.0012 * t)) * env + bark;
    return [a * 0.8 + b * 0.2, a * 0.2 + b * 0.8];
  },
});

/** The 80s FM electric piano (the DX one): a bell pair on top of a mellow pair. */
const dxPiano = custom({
  sr: SR_HI, ch: 2,
  len: root => clamp(2.6 - (root - 36) * 0.02, 1.2, 2.6),
  make: (f0) => (i) => {
    const t = i / SR_HI;
    const body = Math.sin(TAU * f0 * t + (0.9 * Math.exp(-t / 0.6) + 0.2) * Math.sin(TAU * f0 * t)) * Math.exp(-t / 1.4);
    const bell = Math.sin(TAU * f0 * t + 2.2 * Math.exp(-t / 0.05) * Math.sin(TAU * f0 * 14 * t)) * Math.exp(-t / 0.35);
    const d = Math.sin(TAU * f0 * 1.002 * t + (0.9 * Math.exp(-t / 0.6) + 0.2) * Math.sin(TAU * f0 * 1.002 * t)) * Math.exp(-t / 1.4);
    return [body * 0.6 + bell * 0.35 + d * 0.25, d * 0.6 + bell * 0.35 + body * 0.25];
  },
});

/** A drawbar organ through a Leslie: the drawbars ([footage ratio, level]), the rotor's speed (whole Hz), key click,
 *  the second-harmonic percussion. */
const drawbar = (bars: [number, number][], rotor: number, perc: number) => custom({
  sr: SR_MID, ch: 2, held: true, even: true, len: 0.5,
  make: (f0, sr, seed) => {
    const r = rng(seed);
    const ph = bars.map(() => r() * 0.5 + 0.5);
    const click = new Biquad('bp', 2400, 0.9, sr);
    const lim = sr * 0.33;
    return (i) => {
      const t = i / sr;
      let lo = 0, hiL = 0, hiR = 0;
      for (let j = 0; j < bars.length; j++) {
        const [ratio, lvl] = bars[j];
        const f = f0 * ratio;
        if (f > lim || !lvl) continue;
        // (the horn's Doppler on the high ones, each ear its own side of the rotor)
        if (f > 700) {
          const dop = f * 0.00042;
          hiL += lvl * Math.sin(TAU * (f * t + ph[j] + dop * Math.sin(TAU * rotor * t)));
          hiR += lvl * Math.sin(TAU * (f * t + ph[j] + dop * Math.sin(TAU * rotor * t + 1.9)));
        } else lo += lvl * Math.sin(TAU * (f * t + ph[j]));
      }
      const p = perc * (i < 0.5 * sr ? Math.exp(-t / 0.11) : 0) * Math.sin(TAU * (f0 * 3 * t));
      const k = i < 0.012 * sr ? click.run(r()) * 0.35 * (1 - t / 0.012) : 0;
      const amL = 1 - 0.35 * (0.5 + 0.5 * Math.sin(TAU * rotor * t)), amR = 1 - 0.35 * (0.5 + 0.5 * Math.sin(TAU * rotor * t + 1.9));
      const drum = 1 - 0.12 * (0.5 + 0.5 * Math.sin(TAU * Math.max(1, rotor - 1) * t));
      return [drive(0.32 * (lo * drum + hiL * amL + p + k), 1.4), drive(0.32 * (lo * drum + hiR * amR + p + k), 1.4)];
    };
  },
});
const JAZZ_BARS: [number, number][] = [[0.5, 0.8], [1.5, 0.75], [1, 1], [2, 0.55], [3, 0.3], [4, 0.35], [5, 0.08], [6, 0.12], [8, 0.25]];
const GOSPEL_BARS: [number, number][] = [[0.5, 1], [1.5, 1], [1, 1], [2, 0.7], [3, 0.4], [4, 0.6], [5, 0.2], [6, 0.3], [8, 0.5]];

/** A pipe organ: principals 8' 4' 2', a mixture, each rank a hertz off the last; the pipes' chiff on the way in. */
const pipe = held({
  sr: SR_MID, pre: 0.18, voices: [[0, -0.3, 1], [3, 0.35, 0.6]],
  spec: (k, hz) => (k === 1 ? 1 : k === 2 ? 0.75 : k === 3 ? 0.35 : k === 4 ? 0.55 : k === 6 ? 0.3 : k === 8 ? 0.35 : k === 12 ? 0.18 : k === 16 ? 0.15 : 0.04 / k) * roll(hz, 7000),
  atk: (k, hz) => (k < 6 ? 0.5 : 1.4 / k) * roll(hz, 9000),
  noise: { f: 3, q: 1.5, lvl: 0.01, atk: 0.18, rel: true },
});

/** A steam calliope / band organ: fat whistle pipes with a breathy edge, a reed rank under them. */
const calliope = held({
  sr: SR_MID, pre: 0.08, voices: [[0, -0.2, 1], [6, 0.25, 0.55]],
  spec: (k, hz) => (k === 1 ? 1 : k === 2 ? 0.35 : k === 3 ? 0.3 : 0.25 / (k * k)) + 0.18 * (1 / k) * bump(hz, 1600, 700),
  noise: { f: 2, q: 1.1, lvl: 0.035, atk: 0.12, rel: true },
  amp: u => 0.5 + 0.5 * u,
});

/** The bowed section: eight players (the detune, the spread), a violin's body (the wood, the bridge's bright hill),
 *  the bows biting on the way in, darker and scratchier, then opening up. */
const STR_BODY = (k: number, hz: number) => (1 / k) * (0.45 + 0.7 * bump(hz, 280, 90) + 0.6 * bump(hz, 500, 160) + 0.35 * bump(hz, 1250, 300) + 0.55 * bump(hz, 2700, 700)) * roll(hz, 6500, 3);
const stringSection = held({
  sr: SR_MID, pre: 0.32, voices: section(8, 11, 0.85), stagger: 0.035, wob: [1, 5],
  spec: STR_BODY,
  atk: (k, hz) => STR_BODY(k, hz) * roll(hz, 1300),
  noise: { f: 3200, q: 0.6, lvl: 0.008, atk: 0.05 },
  amp: u => 0.35 + 0.65 * u,
});
/** A solo violin: one bow, the body's peaks stronger, the bow's grit in it. */
const violin = held({
  sr: SR_MID, pre: 0.2,
  spec: (k, hz) => (1 / Math.pow(k, 0.85)) * (0.3 + 0.9 * bump(hz, 290, 70) + 0.7 * bump(hz, 470, 120) + 0.35 * bump(hz, 1000, 200) + 0.9 * bump(hz, 2900, 600)) * roll(hz, 7000, 3),
  atk: (k, hz) => (1 / k) * (0.3 + bump(hz, 290, 80)) * roll(hz, 1600),
  noise: { f: 3800, q: 0.8, lvl: 0.012, atk: 0.08 },
  amp: u => 0.3 + 0.7 * u, scoop: -12,
});
/** A solo cello: deeper wood, the bow's rasp lower. */
const cello = held({
  sr: SR_MID, pre: 0.24,
  spec: (k, hz) => (1 / Math.pow(k, 0.85)) * (0.35 + 0.9 * bump(hz, 200, 60) + 0.7 * bump(hz, 400, 120) + 0.4 * bump(hz, 1100, 250) + 0.5 * bump(hz, 2200, 500)) * roll(hz, 5000, 3),
  atk: (k, hz) => (1 / k) * (0.3 + bump(hz, 200, 70)) * roll(hz, 1000),
  noise: { f: 2400, q: 0.8, lvl: 0.012, atk: 0.08 },
  amp: u => 0.3 + 0.7 * u, scoop: -10,
});

/** The brass section: four players, blatting bright on the way in and settling, a lip scoop, ragged entries. */
const brassSection = held({
  sr: SR_MID, pre: 0.22, voices: [[-6, -0.55, 1], [-2, -0.15, 1], [3, 0.2, 1], [7, 0.55, 1]], stagger: 0.025, scoop: -35,
  spec: brassSpec(2600, 1200, 600),
  atk: brassSpec(6000, 1400, 800, 0.6),
  atkW: u => Math.sin(Math.PI * Math.min(1, u * 1.4)),
  amp: u => 0.25 + 0.75 * Math.min(1, u * 2.5),
  noise: { f: 1500, q: 0.7, lvl: 0.003, atk: 0.05 },
});
const trumpet = held({
  sr: SR_MID, pre: 0.16, scoop: -45,
  spec: brassSpec(4200, 1400, 600, 0.65),
  atk: brassSpec(7000, 1500, 700, 0.55),
  atkW: u => Math.sin(Math.PI * Math.min(1, u * 1.5)),
  amp: u => 0.3 + 0.7 * Math.min(1, u * 3),
  noise: { f: 1800, q: 0.8, lvl: 0.002, atk: 0.04 },
});
/** A trumpet with a harmon mute: the bottom choked off, all buzz and nasal honk (late-night, sleazy). */
const muteTrumpet = held({
  sr: SR_MID, pre: 0.1, scoop: -30,
  spec: (k, hz) => (hz < 650 ? 0.25 : 1) * (bump(hz, 1700, 420) + 0.7 * bump(hz, 3300, 650) + 0.05) * Math.pow(k, -0.5) * roll(hz, 7000),
  amp: u => 0.4 + 0.6 * u,
});
const horn = held({
  sr: SR_MID, pre: 0.22, voices: [[-3, -0.2, 1], [4, 0.2, 0.8]], scoop: -20,
  spec: brassSpec(1100, 450, 250, 0.9),
  atk: brassSpec(2200, 500, 300, 0.8),
  atkW: u => Math.sin(Math.PI * Math.min(1, u * 1.3)),
  amp: u => 0.2 + 0.8 * u,
});
const trombone = held({
  sr: SR_MID, pre: 0.18, scoop: -40,
  spec: brassSpec(2200, 620, 300, 0.6),
  atk: brassSpec(4500, 700, 400, 0.5),
  atkW: u => Math.sin(Math.PI * Math.min(1, u * 1.4)),
  amp: u => 0.25 + 0.75 * Math.min(1, u * 2),
});
const tuba = held({
  sr: SR_LO, pre: 0.2, scoop: -25,
  spec: brassSpec(700, 260, 150, 0.9),
  atk: brassSpec(1400, 300, 200, 0.8),
  atkW: u => Math.sin(Math.PI * Math.min(1, u * 1.3)),
  amp: u => 0.2 + 0.8 * u,
});
/** Analog synth brass: two saws a few cents apart, the filter snapping open and closing back down. */
const synthBrass = held({
  sr: SR_MID, pre: 0.35, voices: [[-8, -0.4, 1], [8, 0.4, 1]],
  spec: (k, hz) => (1 / k) * roll(hz, 1800, 2) * (1 + 0.5 * bump(hz, 1800, 300)),
  atk: (k, hz) => (1 / k) * roll(hz, 6000, 2),
  atkW: u => Math.pow(1 - u, 1.5),
});

/** The flute: nearly a sine, its breath (looped noise round the second harmonic), the chiff as it speaks. */
const flute = held({
  sr: SR_MID, pre: 0.14, scoop: -18,
  spec: k => (k === 1 ? 1 : k === 2 ? 0.22 : k === 3 ? 0.07 : k === 4 ? 0.025 : 0),
  atk: k => (k <= 5 ? [0, 0.6, 0.6, 0.4, 0.3, 0.2][k] : 0),
  noise: { f: 2, q: 1.4, lvl: 0.035, atk: 0.25, rel: true },
  amp: u => u,
});
const panFlute = held({
  sr: SR_MID, pre: 0.12,
  spec: k => (k === 1 ? 1 : k === 2 ? 0.07 : k === 3 ? 0.12 : 0),
  noise: { f: 1.5, q: 0.9, lvl: 0.085, atk: 0.4, rel: true },
  amp: u => u * u,
});
const clarinet = held({
  sr: SR_MID, pre: 0.1,
  spec: (k, hz, root) => (k % 2 ? 1 : root < 66 ? 0.07 : 0.35) / k * roll(hz, 2600) * (1 + 0.35 * bump(hz, 1500, 400)),
  noise: { f: 2500, q: 0.8, lvl: 0.004, atk: 0.04 },
  amp: u => 0.3 + 0.7 * u,
});
const oboe = held({
  sr: SR_MID, pre: 0.1, scoop: -15,
  spec: (k, hz) => Math.pow(k, -0.4) * (0.12 + 1.2 * bump(hz, 1100, 300) + 0.7 * bump(hz, 2900, 500)) * roll(hz, 6000),
  amp: u => 0.3 + 0.7 * u,
});
/** Alto sax: a reed's odd-heavy spectrum through the horn's formants, a little growl (driven), a scoop up into it. */
const altoSax = held({
  sr: SR_MID, pre: 0.12, scoop: -40, drive: 1.6,
  spec: (k, hz) => (k % 2 ? 1 : 0.7) * Math.pow(k, -0.8) * (0.12 + 0.5 * bump(hz, 520, 250) + bump(hz, 1500, 500) + 0.35 * bump(hz, 3000, 600)) * roll(hz, 6000),
  noise: { f: 2600, q: 0.9, lvl: 0.006, atk: 0.06 },
  amp: u => 0.35 + 0.65 * u,
});
/** Tenor sax: darker, a bigger growl (the strip club's). */
const tenorSax = held({
  sr: SR_MID, pre: 0.12, scoop: -50, drive: 2.3,
  spec: (k, hz) => (k % 2 ? 1 : 0.75) * Math.pow(k, -0.8) * (0.12 + 0.6 * bump(hz, 420, 200) + bump(hz, 1200, 400) + 0.35 * bump(hz, 2600, 600)) * roll(hz, 5000),
  noise: { f: 1900, q: 0.8, lvl: 0.009, atk: 0.06 },
  amp: u => 0.35 + 0.65 * u,
});
const harmonica = held({
  sr: SR_MID, pre: 0.08, scoop: -45,
  spec: (k, hz) => (k % 2 ? 1 : 0.65) * Math.pow(k, -0.9) * (0.35 + bump(hz, 1100, 500) + 0.4 * bump(hz, 2600, 600)) * roll(hz, 7000),
  noise: { f: 1800, q: 0.7, lvl: 0.012, atk: 0.06 },
  amp: u => 0.4 + 0.6 * u,
});
/** A musette accordion: three reeds, the outer two a little sharp and flat (the wet beat), the bellows pushing in. */
const accordion = held({
  sr: SR_MID, pre: 0.06, voices: [[0, 0, 1], [14, 0.35, 0.8], [-12, -0.35, 0.7]],
  spec: (k, hz) => (k % 2 ? 1 : 0.5) * Math.pow(k, -0.8) * (0.4 + bump(hz, 1350, 650) + 0.5 * bump(hz, 3000, 700)) * roll(hz, 7000),
  amp: u => 0.5 + 0.5 * u,
});

/** The choir: six singers a side (their vibratos their own), the vowel's formants fixed where a throat puts them
 *  (each zone its own: no chipmunk choirs), breath in it. */
const choir = (male: [number, number, number][], female: [number, number, number][]) => (root: number, id: string) => held({
  sr: SR_MID, pre: 0.3, voices: section(6, 12, 0.9), stagger: 0.05, wob: [5, 9],
  spec: vowel(choirFormants(root, male, female)),
  noise: { f: choirFormants(root, male, female)[1][0], q: 2, lvl: 0.012, atk: 0.04 },
  amp: u => u,
})(root, id);

// Synths
const supersaw = held({
  sr: SR_HI, pre: 0.03, voices: [[-26, -0.9, 0.8], [-15, 0.6, 0.9], [-6, -0.3, 1], [0, 0, 1], [6, 0.3, 1], [15, -0.6, 0.9], [26, 0.9, 0.8]],
  spec: (k, hz) => (1 / k) * roll(hz, 10000),
});
const pwm = custom({
  sr: SR_MID, ch: 2, held: true, len: 0.05,
  make: (f0, sr) => {
    const saw = waveAt('saw', f0 * 1.01, sr, 6000);
    const f1 = f0 + 1;
    return (i) => {
      const t = i / sr;
      const w1 = 0.5 + 0.38 * Math.sin(TAU * t), w2 = 0.5 + 0.38 * Math.sin(TAU * t + 2.1);
      const p1 = (i * f0) / sr, p2 = (i * f1) / sr + 0.3;
      return [(rd(saw, p1) - rd(saw, p1 + w1)) * 0.5, (rd(saw, p2) - rd(saw, p2 + w2)) * 0.5];
    };
  },
});
const warmPad = held({
  sr: SR_MID, pre: 0.05, voices: [[-9, -0.7, 1], [-3, 0.4, 1], [4, -0.3, 1], [10, 0.7, 1]], wob: [1, 4],
  spec: (k, hz) => (1 / k) * roll(hz, 1300, 2) + (k === 1 ? 0.6 : 0),
});
const squareLead = held({
  sr: SR_MID, pre: 0.02, voices: [[-4, -0.3, 1], [4, 0.3, 0.9]],
  spec: (k, hz) => (k % 2 ? 1 / k : 0.04 / k) * roll(hz, 5000),
});
const sawLead = held({
  sr: SR_MID, pre: 0.02, voices: [[-6, -0.25, 1], [6, 0.25, 1]], drive: 1.3,
  spec: (k, hz) => (1 / k) * roll(hz, 7000) * (1 + 0.4 * bump(hz, 2200, 600)),
});
const theremin = held({
  sr: SR_MID, pre: 0.02,
  spec: k => (k === 1 ? 1 : k === 2 ? 0.14 : k === 3 ? 0.06 : k === 4 ? 0.02 : 0),
});
/** A swept, resonant synth bass (a 303's cousin): saw and a square under it, the filter snapping shut. */
const synthBass = custom({
  sr: SR_LO, len: 1.8,
  make: (f0, sr) => {
    const saw = waveAt('saw', f0, sr), sq = waveAt('square', f0 / 2, sr);
    const f = new SVF(sr);
    return (i) => {
      const t = i / sr;
      if ((i & 15) === 0) f.set(160 + 2400 * Math.exp(-t / 0.09) + f0 * 1.5, 2.2);
      const x = rd(saw, (i * f0) / sr) * 0.7 + rd(sq, (i * f0) / (2 * sr)) * 0.4;
      return drive(f.run(x) * 1.2, 1.8) * (t < 0.004 ? t / 0.004 : 1) * Math.exp(-t / 1.6);
    };
  },
});
/** The 808's boom: a sine with a kick of pitch on the front, a little drive. */
const bass808 = custom({
  sr: SR_LO, len: 2.4,
  make: (f0, sr) => { let ph = 0; return (i) => { const t = i / sr; ph += (f0 * (1 + 0.6 * Math.exp(-t / 0.018))) / sr; return drive(Math.sin(TAU * ph) * 1.2, 1.6) * Math.exp(-t / 1.1) * Math.min(1, t / 0.002); }; },
});

// Mallets, bells
const marimba = modal({
  len: root => clamp(2.2 - (root - 48) * 0.03, 0.6, 2.2), stereo: true,
  modes: (f0, root) => {
    const d = clamp(1.6 - (root - 48) * 0.025, 0.35, 1.6);
    return [{ f: f0, a: 1, t60: d, l: 0.8, r: 0.6 }, { f: f0 * 3.93, a: 0.28, t60: d * 0.35, l: 0.6, r: 0.8 }, { f: f0 * 9.2, a: 0.08, t60: d * 0.12 }, { f: f0 * 1.002, a: 0.25, t60: d * 1.2, l: 0.5, r: 0.9 }];
  },
  strike: [0.12, 1800, 1.2, 0.003],
});
const vibes = modal({
  len: 4, stereo: true,
  modes: (f0) => [{ f: f0, a: 1, t60: 4.5 }, { f: f0 * 4, a: 0.22, t60: 1.2 }, { f: f0 * 10, a: 0.05, t60: 0.3 }, { f: f0 * 1.0015, a: 0.2, t60: 5, l: 0.3, r: 1 }],
  strike: [0.04, 3000, 1, 0.002],
  trem: [5, 0.32, 1.6],
});
const glock = modal({
  len: 3, stereo: true,
  modes: (f0) => [{ f: f0, a: 1, t60: 3.2 }, { f: f0 * 2.71, a: 0.42, t60: 1.6, l: 0.7, r: 1 }, { f: f0 * 5.15, a: 0.2, t60: 0.7, l: 1, r: 0.7 }, { f: f0 * 8.93, a: 0.09, t60: 0.3 }],
  strike: [0.08, 6000, 1, 0.0015],
});
const xylophone = modal({
  len: 1, stereo: true,
  modes: (f0) => [{ f: f0, a: 1, t60: 0.6 }, { f: f0 * 3, a: 0.32, t60: 0.22 }, { f: f0 * 6.1, a: 0.1, t60: 0.08 }],
  strike: [0.12, 4000, 1, 0.002],
});
const celesta = modal({
  len: 2.2, stereo: true,
  modes: (f0) => [{ f: f0, a: 1, t60: 1.8 }, { f: f0 * 4, a: 0.22, t60: 0.4, l: 1, r: 0.7 }, { f: f0 * 10.1, a: 0.05, t60: 0.09 }, { f: f0 * 1.001, a: 0.3, t60: 2, l: 0.4, r: 1 }],
  strike: [0.03, 1800, 1.2, 0.003],
});
const musicBox = modal({
  len: 3, stereo: true,
  modes: (f0) => [{ f: f0, a: 1, t60: 3 }, { f: f0 * 3.9, a: 0.3, t60: 0.6, l: 0.7, r: 1 }, { f: f0 * 9.3, a: 0.12, t60: 0.15 }, { f: f0 * 1.003, a: 0.35, t60: 3.5, l: 1, r: 0.4 }],
  strike: [0.1, 7000, 2, 0.001],
});
const tubular = modal({
  len: 5, stereo: true,
  modes: (f0) => [[1, 1, 6], [2.0, 0.5, 4], [3.0, 0.35, 2.6], [4.2, 0.25, 1.5], [5.4, 0.2, 0.9], [6.8, 0.12, 0.5], [1.0015, 0.4, 6.5]].map(([m, a, t], j) => ({ f: f0 * m, a, t60: t, l: j % 2 ? 0.6 : 1, r: j % 2 ? 1 : 0.6 })),
  strike: [0.06, 3500, 1, 0.002],
});
const steelDrum = modal({
  len: 1.6, stereo: true,
  modes: (f0) => [{ f: f0, a: 1, t60: 1.3 }, { f: f0 * 2.0, a: 0.55, t60: 0.9, at: 0.004 }, { f: f0 * 3.0, a: 0.22, t60: 0.6, at: 0.006 }, { f: f0 * 1.004, a: 0.4, t60: 1.2, l: 0.4, r: 1 }, { f: f0 * 4.02, a: 0.08, t60: 0.3 }],
  strike: [0.03, 1500, 1.5, 0.003],
});
const timpani = modal({
  sr: SR_LO, len: 3,
  modes: (f0) => [[1, 1, 2.6], [1.504, 0.5, 1.7], [1.742, 0.3, 1.1], [2.0, 0.26, 0.9], [2.245, 0.16, 0.6], [2.494, 0.12, 0.5], [0.5, 0.15, 0.25]].map(([m, a, t]) => ({ f: f0 * m, a, t60: t })),
  strike: [0.3, 220, 0.6, 0.03],
});

/** The orchestra hit: strings, brass and timpani on one chord (root, fifth, octave, tenth), all at once, gone quick. */
const orchHit = custom({
  sr: SR_MID, ch: 2, len: 1.1,
  make: (f0, sr, seed) => {
    const r = rng(seed);
    const notes = [1, 1.5, 2, 2.52, 0.5];
    const tabs = notes.map(m => table(`ohit|${Math.round(f0 * m)}`, harmonics(f0 * m, sr, 7000), k => (1 / k) * (1 + 0.6 * bump(k * f0 * m, 1300, 500))));
    const ph = notes.map(() => r());
    return (i) => {
      const t = i / sr;
      let l = 0, rr = 0;
      for (let j = 0; j < notes.length; j++) { const s = rd(tabs[j], (i * f0 * notes[j]) / sr + ph[j]) + rd(tabs[j], (i * f0 * notes[j] * 1.004) / sr); l += s * (j % 2 ? 0.7 : 1); rr += s * (j % 2 ? 1 : 0.7); }
      const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.22);
      const thump = Math.sin(TAU * f0 * 0.25 * t) * Math.exp(-t / 0.15) * 0.8;
      const n = t < 0.03 ? r() * (1 - t / 0.03) * 0.8 : 0;
      return [(l * 0.25 * env + thump + n), (rr * 0.25 * env + thump + n)];
    };
  },
});

/** The BIG orchestra hit: the early-90s arcade / SNES one (Konami's: Turtles in Time). A major chord (root, fifth,
 *  octave, tenth) on a brass section three players a note, blatting bright on the hit and settling darker, the
 *  strings an octave over it sawing the same chord, wide; under it a timpani's thump two octaves down (its pitch
 *  dropping as it's struck) and the crack of the whole lot landing at once. Punchy: gone in a quarter second, a little
 *  ring after. Driven a touch so it stays loud. */
const orchStab = custom({
  sr: SR_MID, ch: 2, len: 1.2,
  make: (f0, sr, seed) => {
    const r = rng(seed);
    const brassAmp = (m: number, cut: number, tilt: number) => (k: number) => { const hz = k * f0 * m; return Math.pow(k, -tilt) * roll(hz, cut) * (1 + 0.9 * bump(hz, 1500, 700)); };
    const chord = [1, 1.5, 2, 2.52];
    const n = (m: number, top: number) => harmonics(f0 * m, sr, top);
    const bright = chord.map(m => table(`ostab|b|${Math.round(f0 * m)}`, n(m, 9000), brassAmp(m, 6500, 0.55)));
    const dark = chord.map(m => table(`ostab|d|${Math.round(f0 * m)}`, n(m, 5000), brassAmp(m, 2400, 0.85)));
    const strs = [2, 3, 4, 5.04];
    const saw = strs.map(m => table(`ostab|s|${Math.round(f0 * m)}`, n(m, 9000), k => (1 / k) * roll(k * f0 * m, 7000)));
    // (three brass players a note, a few cents apart; two string desks a note, wider)
    const bDet = [-6, 0, 7].map(c => Math.pow(2, c / 1200)), sDet = [-11, 12].map(c => Math.pow(2, c / 1200));
    const bPh = chord.map(() => bDet.map(() => r())), sPh = strs.map(() => sDet.map(() => r()));
    // (the timpani: two octaves down, kept out of the mud)
    const fl = Math.max(42, f0 * 0.25);
    let last = 0;
    return (i) => {
      const t = i / sr;
      const eb = Math.exp(-t / 0.06);
      let l = 0, rr = 0;
      for (let j = 0; j < chord.length; j++) for (let d = 0; d < bDet.length; d++) {
        const ph = (i * f0 * chord[j] * bDet[d]) / sr + bPh[j][d];
        const s = rd(bright[j], ph) * eb + rd(dark[j], ph) * (1 - eb);
        const pan = (j + d) % 3 === 0 ? 0 : (j + d) % 3 === 1 ? -0.5 : 0.5;
        l += s * (1 - pan * 0.6); rr += s * (1 + pan * 0.6);
      }
      let sl = 0, sr2 = 0;
      for (let j = 0; j < strs.length; j++) for (let d = 0; d < sDet.length; d++) {
        const s = rd(saw[j], (i * f0 * strs[j] * sDet[d]) / sr + sPh[j][d]) * (j === 3 ? 0.6 : 1);
        if (d === 0) { sl += s; sr2 += s * 0.35; } else { sr2 += s; sl += s * 0.35; }
      }
      const atk = Math.min(1, t / 0.003);
      const benv = atk * (0.8 * Math.exp(-t / 0.2) + 0.2 * Math.exp(-t / 0.55));
      const senv = atk * (0.75 * Math.exp(-t / 0.16) + 0.25 * Math.exp(-t / 0.45));
      // (the thump: its pitch falling from half again higher as it's hit)
      const thump = Math.sin(TAU * fl * (t + 0.5 * 0.025 * (1 - Math.exp(-t / 0.025)))) * Math.exp(-t / 0.28);
      // (the crack: a hiss, top-heavy, the first few hundredths)
      const w = r() * 2 - 1, crack = t < 0.035 ? (w - last) * (1 - t / 0.035) * 0.5 : 0;
      last = w;
      const L = l * 0.1 * benv + sl * 0.07 * senv + thump * 0.75 + crack;
      const R = rr * 0.1 * benv + sr2 * 0.07 * senv + thump * 0.75 + crack;
      return [drive(L, 1.6), drive(R, 1.6)];
    };
  },
});

// Plucked
const harpsichord = pluck({
  len: root => clamp(4 - (root - 40) * 0.04, 1.5, 4), t60: hz => clamp(9 * Math.pow(110 / hz, 0.6), 1.2, 9), bright: 0.95, hard: 1, pos: 0.08,
  strings: [[0, 1, 0, -0.25], [0, 0.6, 3, 0.25], [12, 0.45, -2, 0]],
  body: [['peak', 280, 1, 4], ['peak', 2500, 1.5, 3], ['hp', 70, 0.7]],
  bodyR: [['peak', 300, 1, 4], ['peak', 2300, 1.5, 3], ['hp', 70, 0.7]],
});
const clav = pluck({
  len: 0.9, t60: () => 0.5, bright: 0.9, hard: 1, pos: 0.06,
  body: [['hp', 150, 0.7], ['peak', 1200, 1.2, 5], ['lp', 6000, 0.7]],
});
const harp = pluck({
  len: root => clamp(4.5 - (root - 40) * 0.05, 1.5, 4.5), t60: hz => clamp(7 * Math.pow(100 / hz, 0.55), 1.2, 7), bright: 0.45, hard: 0.35, pos: 0.25,
  body: [['peak', 200, 1.2, 3], ['peak', 650, 1.3, 2], ['lp', 7000, 0.7]],
  bodyR: [['peak', 230, 1.2, 3], ['peak', 600, 1.3, 2], ['lp', 6500, 0.7]],
});
const pizz = pluck({
  len: 1, t60: hz => clamp(0.9 * Math.pow(200 / hz, 0.4), 0.25, 1), bright: 0.3, hard: 0.45, pos: 0.22,
  strings: [[0, 1, -6, -0.6], [0, 0.9, 0, 0], [0, 0.85, 7, 0.6]], strum: 0.008,
  body: [['peak', 280, 1, 5], ['peak', 2700, 1, 3], ['lp', 6000, 0.7]],
});
const fingerBass = pluck({
  sr: SR_LO, len: 2.4, t60: hz => clamp(3 * Math.pow(55 / hz, 0.3), 1, 3), bright: 0.28, hard: 0.35, pos: 0.18,
  body: [['lowshelf', 120, 0.7, 3], ['peak', 800, 1, -3], ['lp', 3500, 0.7]],
  thump: [0.25, 60, 0.03],
});
const slapBass = pluck({
  sr: SR_MID, len: 1.8, t60: hz => clamp(2.2 * Math.pow(55 / hz, 0.3), 0.8, 2.2), bright: 0.9, hard: 1, pos: 0.1,
  body: [['peak', 500, 0.8, -5], ['highshelf', 2500, 0.7, 5], ['lowshelf', 100, 0.7, 3]],
  click: [0.35, 3500, 0.003],
});
const upright = pluck({
  sr: SR_LO, len: 1.6, t60: hz => clamp(1.4 * Math.pow(55 / hz, 0.3), 0.5, 1.4), bright: 0.12, hard: 0.25, pos: 0.2,
  body: [['peak', 110, 2, 4], ['peak', 230, 2, 3], ['lp', 2500, 0.7]],
  thump: [0.35, 75, 0.025],
});
const cleanGtr = pluck({
  len: root => clamp(4 - (root - 40) * 0.04, 1.5, 4), t60: hz => clamp(5 * Math.pow(110 / hz, 0.5), 1, 5), bright: 0.65, hard: 0.6, pos: 0.15,
  strings: [[0, 1, -3, -0.55], [0, 0.85, 4, 0.55]],
  body: [['hp', 90, 0.7], ['peak', 2500, 1, 2], ['lp', 6500, 0.7]],
});
const steelGtr = pluck({
  len: root => clamp(4.5 - (root - 40) * 0.04, 1.8, 4.5), t60: hz => clamp(6 * Math.pow(110 / hz, 0.5), 1.2, 6), bright: 0.78, hard: 0.7, pos: 0.13,
  body: [['peak', 100, 2, 6], ['peak', 205, 2, 4], ['peak', 2500, 1, 3], ['highshelf', 7000, 0.7, 2], ['hp', 60, 0.7]],
  bodyR: [['peak', 110, 2, 5], ['peak', 220, 2, 4], ['peak', 2800, 1, 3], ['highshelf', 7000, 0.7, 2], ['hp', 60, 0.7]],
});
const nylonGtr = pluck({
  len: root => clamp(4 - (root - 40) * 0.04, 1.5, 4), t60: hz => clamp(5 * Math.pow(110 / hz, 0.5), 1, 5), bright: 0.38, hard: 0.4, pos: 0.18,
  body: [['peak', 100, 2, 5], ['peak', 220, 2, 3], ['lp', 5000, 0.7], ['hp', 60, 0.7]],
  bodyR: [['peak', 108, 2, 5], ['peak', 240, 2, 3], ['lp', 4800, 0.7], ['hp', 60, 0.7]],
});
/** The amp's cabinet (a 4x12's lows and mid hump, the fizz rolled off). */
const CAB: [import('./dsp').BiquadType, number, number, number?][] = [['hp', 85, 0.7], ['peak', 130, 1, 3], ['peak', 1700, 0.9, 4], ['lp', 4600, 0.7], ['lp', 5800, 0.7]];
const overdrive = pluck({ len: 3, t60: () => 6, bright: 0.7, hard: 0.8, pos: 0.14, drive: 4, cab: CAB, strings: [[0, 1, -2, -0.3], [0, 0.9, 3, 0.3]] });
const distLead = pluck({ len: 5, t60: () => 14, bright: 0.75, hard: 0.85, pos: 0.13, drive: 14, cab: CAB });
const powerChord = pluck({ len: 3, t60: () => 7, bright: 0.7, hard: 0.85, pos: 0.13, drive: 12, cab: CAB, strings: [[0, 1, -3, -0.4], [7, 0.85, 2, 0.35], [12, 0.55, -1, 0]] });
const chug = pluck({ len: 0.8, t60: () => 0.35, bright: 0.3, hard: 0.9, pos: 0.12, drive: 16, cab: [['hp', 80, 0.7], ['peak', 110, 1, 5], ['peak', 1500, 1, 2], ['lp', 3600, 0.7]], strings: [[0, 1, -3, -0.4], [7, 0.8, 2, 0.4], [12, 0.4, 0, 0]] });
const banjo = pluck({
  len: 1.2, t60: () => 0.9, bright: 1, hard: 1, pos: 0.08,
  body: [['hp', 150, 0.7], ['peak', 1000, 1.5, 5], ['peak', 2500, 1.3, 4]],
});
const sitar = pluck({
  len: 4, t60: () => 4, bright: 0.85, hard: 0.9, pos: 0.07, buzz: 0.55,
  body: [['peak', 300, 1.5, 3], ['peak', 2800, 1, 4]],
});
const koto = pluck({
  len: 2.6, t60: hz => clamp(2.4 * Math.pow(200 / hz, 0.3), 0.8, 2.4), bright: 0.72, hard: 0.9, pos: 0.12,
  body: [['peak', 400, 1.3, 4], ['peak', 1700, 1.2, 3], ['hp', 90, 0.7]],
});
const shamisen = pluck({
  len: 1.3, t60: () => 1, bright: 0.95, hard: 1, pos: 0.05, buzz: 0.35,
  click: [0.6, 2400, 0.004], thump: [0.35, 180, 0.02],
  body: [['peak', 900, 1.5, 4], ['hp', 120, 0.7]],
});

const z = zonesFrom;
/** Every pitched instrument. */
export const MELODIC: Record<string, InstDef> = {
  // ---- Keys ----
  piano: { family: 'keys', desc: 'Grand piano: 2-3 strings a note, stiff overtones, hammer and soundboard; stereo (bass left)', zones: z(24, 108), job: grand, env: { a: 0.001, d: 0, s: 1, r: 0.35 }, gain: 0.6, velBright: 0.85, poly: 16 },
  epiano: { family: 'keys', desc: 'Tine electric piano (Rhodes): FM bark when hit hard, warm when soft', zones: z(36, 96), job: tine, env: { a: 0.001, d: 0, s: 1, r: 0.3 }, gain: 0.55, velBright: 0.9, poly: 12 },
  fmpiano: { family: 'keys', desc: 'FM electric piano (the 80s DX bell-piano)', zones: z(36, 96), job: dxPiano, env: { a: 0.001, d: 0, s: 1, r: 0.25 }, gain: 0.45, velBright: 0.6, poly: 12 },
  organ: { family: 'keys', desc: 'Drawbar organ, Leslie on fast, key click and percussion', zones: z(36, 96), job: drawbar(JAZZ_BARS, 7, 0.45), env: { a: 0.004, d: 0, s: 1, r: 0.04 }, gain: 0.42, poly: 10 },
  organslow: { family: 'keys', desc: 'Drawbar organ, gospel registration, Leslie slow (chorale)', zones: z(36, 96), job: drawbar(GOSPEL_BARS, 1, 0), env: { a: 0.006, d: 0, s: 1, r: 0.06 }, gain: 0.38, poly: 10 },
  churchorgan: { family: 'keys', desc: 'Pipe organ: principals and a mixture, chiff', zones: z(24, 96), job: pipe, env: { a: 0.05, d: 0, s: 1, r: 0.4 }, gain: 0.4, poly: 10 },
  calliope: { family: 'keys', desc: 'Steam calliope / band organ: whistle pipes and a reed rank', zones: z(48, 96), job: calliope, env: { a: 0.02, d: 0, s: 1, r: 0.08 }, gain: 0.42, vib: [6.5, 18, 0.05] },
  harpsichord: { family: 'keys', desc: 'Harpsichord: two 8\' strings and a 4\'', zones: z(36, 96), job: harpsichord, env: { a: 0.001, d: 0, s: 1, r: 0.12 }, gain: 0.45, poly: 12 },
  clav: { family: 'keys', desc: 'Clavinet: funky, damped', zones: z(36, 84), job: clav, env: { a: 0.001, d: 0, s: 1, r: 0.05 }, gain: 0.42 },
  accordion: { family: 'keys', desc: 'Musette accordion: three reeds, the wet beat', zones: z(48, 84), job: accordion, env: { a: 0.02, d: 0, s: 1, r: 0.07 }, gain: 0.45 },
  harmonica: { family: 'keys', desc: 'Harmonica: reedy, breathy, bends up into notes', zones: z(60, 96), job: harmonica, env: { a: 0.015, d: 0, s: 1, r: 0.07 }, gain: 0.42, vib: [5.5, 16, 0.25] },
  celesta: { family: 'mallets', desc: 'Celesta', zones: z(60, 108), job: celesta, env: { a: 0.001, d: 0, s: 1, r: 0.4 }, gain: 0.42, poly: 12 },
  musicbox: { family: 'mallets', desc: 'Music box: plucked steel tines in a wooden box', zones: z(60, 108), job: musicBox, env: { a: 0.001, d: 0, s: 1, r: 0.5 }, gain: 0.4, poly: 12 },
  // ---- Mallets / tuned percussion ----
  marimba: { family: 'mallets', desc: 'Marimba (the tube-resonated bars)', zones: z(36, 96), job: marimba, env: { a: 0.001, d: 0, s: 1, r: 0.2 }, gain: 0.55, velBright: 0.5, poly: 10 },
  vibes: { family: 'mallets', desc: 'Vibraphone, the motor on', zones: z(48, 96), job: vibes, env: { a: 0.001, d: 0, s: 1, r: 0.6 }, gain: 0.45, poly: 10 },
  glock: { family: 'mallets', desc: 'Glockenspiel', zones: z(72, 108), job: glock, env: { a: 0.001, d: 0, s: 1, r: 0.5 }, gain: 0.32, poly: 10 },
  xylophone: { family: 'mallets', desc: 'Xylophone', zones: z(60, 108), job: xylophone, env: { a: 0.001, d: 0, s: 1, r: 0.1 }, gain: 0.45, poly: 8 },
  chimes: { family: 'mallets', desc: 'Tubular bells', zones: z(60, 84), job: tubular, env: { a: 0.001, d: 0, s: 1, r: 1.2 }, gain: 0.38, poly: 6 },
  steeldrum: { family: 'mallets', desc: 'Steel drum (pan)', zones: z(48, 96), job: steelDrum, env: { a: 0.002, d: 0, s: 1, r: 0.2 }, gain: 0.45, poly: 8 },
  timpani: { family: 'orchestra', desc: 'Timpani (pitched: play the note)', zones: z(36, 60), job: timpani, env: { a: 0.001, d: 0, s: 1, r: 0.5 }, gain: 0.75, velBright: 0.5, poly: 4 },
  orchhit: { family: 'orchestra', desc: 'Orchestra hit (a major chord on the note: strings, brass, timpani)', zones: z(48, 72), job: orchHit, env: { a: 0.001, d: 0, s: 1, r: 0.2 }, gain: 0.55, poly: 4 },
  orchstab: { family: 'orchestra', desc: 'The BIG orchestra hit (early-90s arcade, Turtles in Time): a major chord on the note, brass blatting bright and strings an octave up, a timpani thump and a crack; punchy', zones: z(48, 72), job: orchStab, env: { a: 0.001, d: 0, s: 1, r: 0.25 }, gain: 0.6, poly: 4 },
  // ---- Strings ----
  strings: { family: 'strings', desc: 'String section: eight players, bows biting in, a violin body', zones: z(36, 96), job: stringSection, env: { a: 0.08, d: 0.3, s: 0.9, r: 0.4 }, gain: 0.5, vib: [5.2, 7, 0.3], poly: 12 },
  slowstrings: { family: 'strings', desc: 'String section, slow swell (shares strings)', alias: 'strings', zones: z(36, 96), job: stringSection, env: { a: 0.7, d: 0.3, s: 0.95, r: 0.9 }, gain: 0.48, vib: [5, 6, 0.5], poly: 12 },
  violin: { family: 'strings', desc: 'Solo violin', zones: z(60, 96), job: violin, env: { a: 0.04, d: 0.2, s: 0.9, r: 0.25 }, gain: 0.45, vib: [5.8, 18, 0.18] },
  cello: { family: 'strings', desc: 'Solo cello (and contrabass down low)', zones: z(36, 72), job: cello, env: { a: 0.05, d: 0.2, s: 0.9, r: 0.3 }, gain: 0.5, vib: [5.2, 16, 0.2] },
  pizz: { family: 'strings', desc: 'String section pizzicato', zones: z(36, 96), job: pizz, env: { a: 0.001, d: 0, s: 1, r: 0.15 }, gain: 0.55, poly: 10 },
  harp: { family: 'strings', desc: 'Concert harp', zones: z(36, 96), job: harp, env: { a: 0.001, d: 0, s: 1, r: 0.6 }, gain: 0.5, poly: 16 },
  // ---- Brass ----
  brass: { family: 'brass', desc: 'Brass section: four players, blatting bright then settling, lips scooping in', zones: z(36, 84), job: brassSection, env: { a: 0.02, d: 0.2, s: 0.85, r: 0.18 }, gain: 0.5, vib: [5.2, 7, 0.35], velBright: 0.5, poly: 10 },
  trumpet: { family: 'brass', desc: 'Solo trumpet', zones: z(48, 96), job: trumpet, env: { a: 0.015, d: 0.15, s: 0.85, r: 0.12 }, gain: 0.45, vib: [5.8, 14, 0.25], velBright: 0.5 },
  mutetrumpet: { family: 'brass', desc: 'Trumpet with a harmon mute (nasal, noir, sleazy)', zones: z(48, 96), job: muteTrumpet, env: { a: 0.012, d: 0.12, s: 0.75, r: 0.1 }, gain: 0.42, vib: [5.5, 10, 0.3] },
  horn: { family: 'brass', desc: 'French horns (a pair): dark, round', zones: z(36, 84), job: horn, env: { a: 0.05, d: 0.2, s: 0.88, r: 0.3 }, gain: 0.55, vib: [5, 7, 0.4], velBright: 0.4 },
  trombone: { family: 'brass', desc: 'Trombone', zones: z(36, 72), job: trombone, env: { a: 0.02, d: 0.15, s: 0.85, r: 0.15 }, gain: 0.5, vib: [5, 9, 0.35], velBright: 0.5 },
  tuba: { family: 'brass', desc: 'Tuba (an oompah bass)', zones: z(24, 60), job: tuba, env: { a: 0.02, d: 0.15, s: 0.85, r: 0.12 }, gain: 0.65, velBright: 0.4, mono: true },
  synthbrass: { family: 'synth', desc: 'Analog synth brass: the filter snapping open and closing back', zones: z(36, 96), job: synthBrass, env: { a: 0.01, d: 0.3, s: 0.85, r: 0.25 }, gain: 0.45, poly: 10 },
  // ---- Woodwinds ----
  flute: { family: 'woodwinds', desc: 'Flute: breathy, chiffs as it speaks', zones: z(60, 96), job: flute, env: { a: 0.03, d: 0.1, s: 0.9, r: 0.12 }, gain: 0.48, vib: [5, 12, 0.25] },
  panflute: { family: 'woodwinds', desc: 'Pan flute: all breath', zones: z(60, 96), job: panFlute, env: { a: 0.03, d: 0.1, s: 0.9, r: 0.15 }, gain: 0.5, vib: [4.8, 8, 0.3] },
  clarinet: { family: 'woodwinds', desc: 'Clarinet: hollow down low (the odd harmonics), brighter up top', zones: z(48, 84), job: clarinet, env: { a: 0.025, d: 0.1, s: 0.9, r: 0.1 }, gain: 0.5, vib: [5, 5, 0.5] },
  oboe: { family: 'woodwinds', desc: 'Oboe: nasal, plaintive', zones: z(60, 96), job: oboe, env: { a: 0.02, d: 0.1, s: 0.9, r: 0.1 }, gain: 0.45, vib: [5.5, 12, 0.25] },
  sax: { family: 'woodwinds', desc: 'Alto sax: scoops in, a little growl', zones: z(48, 84), job: altoSax, env: { a: 0.02, d: 0.12, s: 0.85, r: 0.1 }, gain: 0.48, vib: [5.2, 16, 0.3], velBright: 0.45 },
  tenorsax: { family: 'woodwinds', desc: 'Tenor sax: darker, a bigger growl (the strip club)', zones: z(36, 72), job: tenorSax, env: { a: 0.02, d: 0.12, s: 0.85, r: 0.12 }, gain: 0.5, vib: [5, 18, 0.3], velBright: 0.45 },
  // ---- Voices ----
  choir: { family: 'voices', desc: 'Choir, "aah": six singers a side, mixed (formants by register)', zones: z(36, 84), job: choir(AAH_M, AAH_F), env: { a: 0.18, d: 0.2, s: 0.92, r: 0.5 }, gain: 0.5, poly: 10 },
  oohs: { family: 'voices', desc: 'Choir, "ooh"', zones: z(36, 84), job: choir(OOH_M, OOH_F), env: { a: 0.22, d: 0.2, s: 0.92, r: 0.55 }, gain: 0.55, poly: 10 },
  // ---- Synths ----
  supersaw: { family: 'synth', desc: 'Supersaw: seven saws spread wide (lead or pad)', zones: z(36, 96), job: supersaw, env: { a: 0.005, d: 0.2, s: 0.85, r: 0.25 }, gain: 0.38, poly: 10 },
  pwm: { family: 'synth', desc: 'PWM pad: two pulse waves, their widths swaying', zones: z(36, 96), job: pwm, env: { a: 0.3, d: 0.4, s: 0.85, r: 0.7 }, gain: 0.42, poly: 10 },
  warmpad: { family: 'synth', desc: 'Warm analog pad (slow)', zones: z(36, 96), job: warmPad, env: { a: 0.7, d: 0.4, s: 0.9, r: 1.1 }, gain: 0.42, poly: 10 },
  squarelead: { family: 'synth', desc: 'Square lead', zones: z(48, 96), job: squareLead, env: { a: 0.005, d: 0.15, s: 0.85, r: 0.1 }, gain: 0.38, vib: [5.5, 12, 0.2] },
  sawlead: { family: 'synth', desc: 'Saw lead (a little driven)', zones: z(48, 96), job: sawLead, env: { a: 0.005, d: 0.15, s: 0.85, r: 0.1 }, gain: 0.36, vib: [5.5, 14, 0.2] },
  theremin: { family: 'synth', desc: 'Theremin: nearly a sine, a wide vibrato; use _g for its glide', zones: z(48, 96), job: theremin, env: { a: 0.06, d: 0.1, s: 0.95, r: 0.25 }, gain: 0.42, vib: [6.5, 30, 0.1], mono: true },
  // ---- Basses ----
  bass: { family: 'bass', desc: 'Finger bass (electric)', zones: z(24, 60), job: fingerBass, env: { a: 0.003, d: 0, s: 1, r: 0.06 }, gain: 0.8, velBright: 0.5, mono: true },
  slapbass: { family: 'bass', desc: 'Slap bass: the pop, scooped mids', zones: z(24, 60), job: slapBass, env: { a: 0.002, d: 0, s: 1, r: 0.05 }, gain: 0.7, velBright: 0.4, mono: true },
  upright: { family: 'bass', desc: 'Upright (double) bass, plucked', zones: z(24, 60), job: upright, env: { a: 0.003, d: 0, s: 1, r: 0.08 }, gain: 0.85, velBright: 0.3, mono: true },
  synthbass: { family: 'bass', desc: 'Synth bass: saw and sub square, resonant filter snapping shut', zones: z(24, 60), job: synthBass, env: { a: 0.002, d: 0, s: 1, r: 0.05 }, gain: 0.6, velBright: 0.5, mono: true },
  bass808: { family: 'bass', desc: '808 bass: the long sine boom', zones: z(24, 48), job: bass808, env: { a: 0.002, d: 0, s: 1, r: 0.1 }, gain: 0.75, mono: true },
  // ---- Guitars ----
  cleangtr: { family: 'guitar', desc: 'Clean electric guitar (a touch of chorus)', zones: z(40, 88), job: cleanGtr, env: { a: 0.001, d: 0, s: 1, r: 0.1 }, gain: 0.5, velBright: 0.5, poly: 8 },
  steelgtr: { family: 'guitar', desc: 'Steel-string acoustic guitar', zones: z(40, 88), job: steelGtr, env: { a: 0.001, d: 0, s: 1, r: 0.12 }, gain: 0.55, velBright: 0.5, poly: 8 },
  nylongtr: { family: 'guitar', desc: 'Nylon-string (classical) guitar', zones: z(40, 88), job: nylonGtr, env: { a: 0.001, d: 0, s: 1, r: 0.12 }, gain: 0.58, velBright: 0.5, poly: 8 },
  overdrive: { family: 'guitar', desc: 'Overdriven guitar (crunchy rhythm, single notes)', zones: z(40, 88), job: overdrive, env: { a: 0.002, d: 0, s: 1, r: 0.08 }, gain: 0.38, poly: 6 },
  distlead: { family: 'guitar', desc: 'Distorted lead guitar: sustains, sings (vibrato on held notes)', zones: z(40, 88), job: distLead, env: { a: 0.002, d: 0, s: 1, r: 0.1 }, gain: 0.34, vib: [5.5, 22, 0.25], mono: true },
  powerchord: { family: 'guitar', desc: 'Power chord (root, fifth, octave) on a distorted guitar: play the root', zones: z(28, 64), job: powerChord, env: { a: 0.002, d: 0, s: 1, r: 0.06 }, gain: 0.34, mono: true },
  chug: { family: 'guitar', desc: 'Palm-muted power chord, chugged: play the root', zones: z(28, 64), job: chug, env: { a: 0.002, d: 0, s: 1, r: 0.03 }, gain: 0.36, mono: true },
  banjo: { family: 'guitar', desc: 'Banjo', zones: z(48, 84), job: banjo, env: { a: 0.001, d: 0, s: 1, r: 0.05 }, gain: 0.48, poly: 8 },
  sitar: { family: 'world', desc: 'Sitar: the bridge\'s buzz', zones: z(48, 84), job: sitar, env: { a: 0.001, d: 0, s: 1, r: 0.2 }, gain: 0.45, poly: 6 },
  koto: { family: 'world', desc: 'Koto', zones: z(48, 96), job: koto, env: { a: 0.001, d: 0, s: 1, r: 0.15 }, gain: 0.5, poly: 8 },
  shamisen: { family: 'world', desc: 'Shamisen: the bachi\'s crack, a buzz', zones: z(48, 84), job: shamisen, env: { a: 0.001, d: 0, s: 1, r: 0.08 }, gain: 0.5, poly: 6 },
};
