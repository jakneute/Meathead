// The instruments: short "recordings" of real instruments, the way a SNES game had them, except we make them
// ourselves at startup instead of shipping any (the game stays one file, and fully offline). Each is built at a low
// sample rate (that slightly muffled, gritty SNES character), either as a one-shot that dies away on its own (a pluck,
// a mallet, a drum) or with a short attack and then a one-second loop that can hold for as long as the note does
// (strings, brass, organ, choir). The loops are exactly periodic (every frequency in them is a whole number of Hz, over
// a loop exactly one second long), so they loop without a click.

export const SR = 24000;

export interface Envelope { a: number; d: number; s: number; r: number }
export interface InstrumentDef {
  /** Builds the sample (mono, at SR). */
  make: () => { data: Float32Array; loop?: [number, number] };
  /** The MIDI note the sample plays at its own rate (a drum's played as is). */
  base: number;
  env: Envelope;
  /** Overall level. */
  gain: number;
  /** Vibrato: rate (Hz) and depth (cents), for held notes. */
  vib?: [number, number];
  drum?: boolean;
  /** Share another instrument's sample (a different envelope on the same sound). */
  alias?: string;
}

const TAU = Math.PI * 2;
const midiOf = (hz: number) => 69 + 12 * Math.log2(hz / 440);
const noise = () => Math.random() * 2 - 1;

/** A held sound: `pre` seconds of attack, then a one-second loop; `wave(t)` must be periodic over one second. `atk(t)` shapes the attack only. */
const held = (pre: number, wave: (t: number) => number, atk: (t: number) => number = () => 1, level = 1) => () => {
  const n = Math.round((pre + 1) * SR);
  const data = new Float32Array(n);
  let peak = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; const v = wave(t) * (t < pre ? atk(t / pre) : 1); data[i] = v; peak = Math.max(peak, Math.abs(v)); }
  for (let i = 0; i < n; i++) data[i] = (data[i] / (peak || 1)) * level;
  return { data, loop: [pre, pre + 1] as [number, number] };
};

/** A one-shot: `len` seconds of `f(t)`, normalized. */
const shot = (len: number, f: (t: number, i: number) => number, level = 1) => () => {
  const n = Math.round(len * SR);
  const data = new Float32Array(n);
  let peak = 0;
  for (let i = 0; i < n; i++) { const v = f(i / SR, i); data[i] = v; peak = Math.max(peak, Math.abs(v)); }
  // (a short fade at the very end so nothing clicks)
  const fade = Math.min(n, Math.round(0.02 * SR));
  for (let i = 0; i < n; i++) data[i] = (data[i] / (peak || 1)) * level * (i > n - fade ? (n - i) / fade : 1);
  return { data };
};

/** Sum of harmonics of whole-number frequencies: [freq, amp] pairs. */
const partials = (list: [number, number][]) => (t: number) => { let v = 0; for (const [f, a] of list) v += a * Math.sin(TAU * f * t); return v; };
/** A band-limited saw at f (whole Hz), up to maxHz, each harmonic weighted by shape(k, hz). */
const sawPartials = (f: number, shape: (k: number, hz: number) => number, maxHz = 9000): [number, number][] => {
  const out: [number, number][] = [];
  for (let k = 1; k * f < maxHz; k++) out.push([k * f, shape(k, k * f) / k]);
  return out;
};
/** A formant bump (a vowel, a reed) at `center` Hz, `width` wide. */
const formant = (hz: number, center: number, width: number) => Math.exp(-(((hz - center) / width) ** 2));

/**
 * Karplus-Strong: a plucked string at roughly `hz`. `bright` 0..1 (how much of the pick's click is in it), `damp`
 * how fast it dies (closer to 1: longer). Returns the note it actually lands on (the delay line's whole samples).
 */
const pluck = (hz: number, len: number, bright: number, damp: number, pickPos = 0) => {
  const N = Math.max(2, Math.round(SR / hz));
  const actual = SR / (N + 0.5);
  const make = () => {
    const n = Math.round(len * SR);
    const out = new Float32Array(n);
    const line = new Float32Array(N);
    let prev = 0;
    for (let i = 0; i < N; i++) { const w = noise(); prev = prev + (w - prev) * (0.2 + bright * 0.8); line[i] = prev; }
    // (plucked partway along the string: a comb in the excitation)
    if (pickPos > 0) { const d = Math.round(N * pickPos); const copy = line.slice(); for (let i = 0; i < N; i++) line[i] = copy[i] - copy[(i + d) % N]; }
    let idx = 0, peak = 0;
    for (let i = 0; i < n; i++) {
      const a = line[idx], b = line[(idx + 1) % N];
      const v = (a + b) * 0.5 * damp;
      line[idx] = v;
      out[i] = a;
      peak = Math.max(peak, Math.abs(a));
      idx = (idx + 1) % N;
    }
    const fade = Math.round(0.03 * SR);
    for (let i = 0; i < n; i++) out[i] = (out[i] / (peak || 1)) * (i > n - fade ? (n - i) / fade : 1);
    return { data: out };
  };
  return { make, base: midiOf(actual) };
};

const bass = pluck(110, 1.8, 0.35, 0.9975);
const slap = pluck(110, 1.4, 0.95, 0.996, 0.12);
const nylon = pluck(196, 2.2, 0.55, 0.998, 0.2);
const banjo = pluck(294, 0.9, 1, 0.99, 0.08);
const harp = pluck(262, 1.6, 0.4, 0.997);
const clav = pluck(262, 0.7, 1, 0.992, 0.1);

/**
 * An electric guitar, plugged in and turned up: Karplus-Strong strings (one, or a power chord's root, fifth and octave)
 * picked hard, through a high-gain fuzz (asymmetric, so it growls), then a speaker cabinet (the fizz rolled off up top,
 * the mud cut from the bottom, a honk in the mids). A one-shot that rings on as long as a guitar would.
 */
const electric = (hzs: [number, number][], len: number, drive: number, damp: number, cab = 3400, low = 90) => {
  const root = pluck(hzs[0][0], 0.1, 0.85, damp);
  const a1 = 1 - Math.exp(-TAU * cab / SR), a2 = 1 - Math.exp(-TAU * 4800 / SR), ah = Math.exp(-TAU * low / SR);
  const am = 1 - Math.exp(-TAU * 1300 / SR);
  // (made when it's first wanted, like the rest)
  const make = () => {
    const strings = hzs.map(([hz, amp]) => ({ data: pluck(hz, len, 0.85, damp, 0.13).make().data, amp }));
    let hp = 0, hpIn = 0, lp1 = 0, lp2 = 0, mid1 = 0, mid2 = 0;
    return shot(len, (_t, i) => {
      let x = 0;
      for (const s of strings) x += (s.data[i] ?? 0) * s.amp;
      // (into the amp: the bottom cut so it doesn't flub, then driven hard, a little lopsided so it growls)
      const h = ah * (hp + x - hpIn); hpIn = x; hp = h;
      const d = Math.tanh(drive * (h + 0.12 * h * h));
      // (the cabinet: two gentle lowpasses to take the fizz off, a mid hump added back)
      lp1 += a1 * (d - lp1); lp2 += a2 * (lp1 - lp2);
      mid1 += am * (d - mid1); mid2 += am * (mid1 - mid2);
      return lp2 + 0.45 * (mid1 - mid2);
    })();
  };
  return { make, base: root.base };
};
const leadGuitar = electric([[262, 1]], 2.6, 9, 0.9996);
const powerChord = electric([[131, 1], [196, 0.8], [262, 0.55]], 2.2, 14, 0.9993);
/**
 * Dale's baritone guitar: a low string picked near the bridge on an amp only just breaking up, then drenched in the
 * amp's spring tank (a few early bounces, then the tank feeding back on itself, darker each time round). Sun-bleached.
 */
const daleBari = (() => {
  const gtr = electric([[196, 1]], 3.4, 1.6, 0.9997);
  const make = () => {
    const x = gtr.make().data;
    const n = x.length, y = new Float32Array(n);
    const taps = [[0.029, 0.3], [0.043, 0.24], [0.071, 0.2], [0.097, 0.14]].map(([d, g]) => [Math.round(d * SR), g]);
    const D = Math.round(0.053 * SR);
    let lp = 0, peak = 0;
    for (let i = 0; i < n; i++) {
      let v = x[i];
      for (const [d, g] of taps) if (i >= d) v += g * x[i - d];
      if (i >= D) { lp += 0.3 * (y[i - D] - lp); v += 0.45 * lp; }
      y[i] = v; peak = Math.max(peak, Math.abs(v));
    }
    const fade = Math.round(0.03 * SR);
    for (let i = 0; i < n; i++) y[i] = (y[i] / (peak || 1)) * (i > n - fade ? (n - i) / fade : 1);
    return { data: y };
  };
  return { make, base: gtr.base };
})();
// (Oscar's: a baritone guitar through a clean amp just starting to break up, all twang; and the down-tuned rig, low C-sharp
// power chords, once ringing and once palm-muted, the cabinet darker and the bottom left in so it chugs)
const baritone = electric([[110, 1], [220, 0.2]], 1.8, 2.4, 0.9985, 4200);
const dropChord = electric([[69, 1], [104, 0.85], [139, 0.55]], 2.4, 16, 0.9993, 3000, 55);
const chugChord = electric([[69, 1], [104, 0.8], [139, 0.4]], 0.7, 20, 0.985, 2000, 55);
/** A one-period peak of a periodic wave (to scale it before it's driven). */
const peakOf = (w: (t: number) => number, hz: number) => { let p = 0; for (let i = 0; i < 600; i++) p = Math.max(p, Math.abs(w(i / 600 / hz))); return p || 1; };
const slideTone = partials(sawPartials(262, (k, hz) => Math.exp(-k / 10) * (0.5 + 1.3 * formant(hz, 1050, 420) + 0.7 * formant(hz, 2600, 600)), 7000));
const slidePeak = peakOf(slideTone, 262);

/** Every instrument there is. */
export const INSTRUMENTS: Record<string, InstrumentDef> = {
  // ---- Held (looping) ----
  strings: {
    make: held(0.05, partials([...sawPartials(262, (k) => Math.exp(-k / 9)), ...sawPartials(263, (k) => 0.9 * Math.exp(-k / 9)), ...sawPartials(261, (k) => 0.8 * Math.exp(-k / 9))])),
    base: midiOf(262), env: { a: 0.12, d: 0.2, s: 0.85, r: 0.35 }, gain: 0.5, vib: [5.2, 8],
  },
  slowstrings: { alias: 'strings', make: () => ({ data: new Float32Array(1) }), base: midiOf(262), env: { a: 0.6, d: 0.3, s: 0.9, r: 0.8 }, gain: 0.45, vib: [5, 6] },
  brass: {
    make: held(0.08, partials([...sawPartials(262, (k, hz) => Math.exp(-k / 7) + 0.5 * formant(hz, 1200, 500)), ...sawPartials(263, (k, hz) => 0.8 * (Math.exp(-k / 7) + 0.5 * formant(hz, 1200, 500)))]),
      (u) => 0.4 + 0.6 * u),
    base: midiOf(262), env: { a: 0.04, d: 0.15, s: 0.8, r: 0.15 }, gain: 0.55, vib: [5.5, 10],
  },
  trumpet: {
    make: held(0.06, partials(sawPartials(262, (k, hz) => Math.exp(-k / 10) + 0.8 * formant(hz, 1400, 600))), (u) => 0.3 + 0.7 * u),
    base: midiOf(262), env: { a: 0.025, d: 0.1, s: 0.85, r: 0.12 }, gain: 0.5, vib: [5.8, 14],
  },
  sax: {
    make: held(0.05, partials(sawPartials(262, (k, hz) => (k % 2 ? 1 : 0.55) * (0.6 * formant(hz, 520, 260) + formant(hz, 1600, 500) + 0.15) * Math.exp(-k / 14)))),
    base: midiOf(262), env: { a: 0.03, d: 0.12, s: 0.85, r: 0.12 }, gain: 0.55, vib: [5, 16],
  },
  mute: {
    // A trumpet with a harmon mute in it: the bottom of it choked off, all buzz and nasal honk up top (late-night noir)
    make: held(0.04, partials(sawPartials(262, (k, hz) => (hz < 700 ? 0.3 : 1) * (formant(hz, 1750, 450) + 0.7 * formant(hz, 3300, 700) + 0.06) * Math.exp(-k / 18))), (u) => 0.5 + 0.5 * u),
    base: midiOf(262), env: { a: 0.02, d: 0.12, s: 0.7, r: 0.1 }, gain: 0.42, vib: [5.5, 9],
  },
  // Low brass that swells up out of nothing (the trombones and tuba, Herrmann's dread)
  swell: { alias: 'brass', make: () => ({ data: new Float32Array(1) }), base: midiOf(262), env: { a: 0.9, d: 0.4, s: 0.95, r: 0.7 }, gain: 0.55, vib: [4.5, 5] },
  choir: {
    make: held(0.05, partials([262, 263, 261].flatMap((f, j) => sawPartials(f, (k, hz) => (1 - j * 0.15) * (formant(hz, 730, 160) + 0.7 * formant(hz, 1090, 180) + 0.25 * formant(hz, 2440, 300)) * 1.5, 5000)))),
    base: midiOf(262), env: { a: 0.2, d: 0.2, s: 0.9, r: 0.5 }, gain: 0.5, vib: [4.5, 10],
  },
  organ: {
    make: held(0.01, partials([[262, 1], [524, 0.8], [786, 0.55], [1048, 0.4], [1572, 0.22], [2096, 0.2], [263, 0.35], [525, 0.25]])),
    base: midiOf(262), env: { a: 0.006, d: 0.05, s: 0.9, r: 0.06 }, gain: 0.4,
  },
  flute: {
    make: held(0.09, partials([[523, 1], [1046, 0.18], [1569, 0.06]]), (u) => u + (1 - u) * noise() * 0.6),
    base: midiOf(523), env: { a: 0.05, d: 0.1, s: 0.9, r: 0.12 }, gain: 0.45, vib: [5.5, 14],
  },
  whistle: {
    make: held(0.04, partials([[1047, 1], [2094, 0.06]])),
    base: midiOf(1047), env: { a: 0.03, d: 0.05, s: 0.95, r: 0.1 }, gain: 0.35, vib: [6, 22],
  },
  harmonica: {
    make: held(0.03, partials(sawPartials(262, (k, hz) => (k % 2 ? 1 : 0.7) * (formant(hz, 1100, 500) + 0.35) * Math.exp(-k / 12), 7000))),
    base: midiOf(262), env: { a: 0.02, d: 0.1, s: 0.85, r: 0.08 }, gain: 0.45, vib: [6, 18],
  },
  guitar: {
    // Overdriven lead: a picked electric string through a cranked amp and a cabinet, ringing out
    make: leadGuitar.make, base: leadGuitar.base, env: { a: 0.002, d: 0, s: 1, r: 0.1 }, gain: 0.4, vib: [5.5, 18],
  },
  power: {
    // A power chord (root, fifth, octave) on a distorted electric, chugged
    make: powerChord.make, base: powerChord.base, env: { a: 0.002, d: 0, s: 1, r: 0.06 }, gain: 0.38,
  },
  // A bottleneck slide guitar on a cranked little amp: a nasal honk and a bite up top, driven (tanh, so still periodic),
  // the wide wobble of the slide
  slide: {
    make: held(0.03, (t) => Math.tanh(2.4 * slideTone(t) / slidePeak), (u) => 0.55 + 0.45 * u),
    base: midiOf(262), env: { a: 0.012, d: 0.35, s: 0.72, r: 0.14 }, gain: 0.42, vib: [5.2, 24],
  },
  // A pedal steel on the radio: clean and sweet, swelling in, a slow wide shimmer
  pedal: {
    make: held(0.08, partials([[262, 1], [263, 0.35], [524, 0.4], [786, 0.16], [1048, 0.09], [1310, 0.04]]), (u) => u),
    base: midiOf(262), env: { a: 0.08, d: 0.4, s: 0.78, r: 0.35 }, gain: 0.45, vib: [4.5, 14],
  },
  // A fiddle: a bowed saw with the body's resonances in it (a low wood bump, the bright bite up around 3k), a little
  // twin a hair off, a fast vibrato
  fiddle: {
    make: held(0.05, partials([...sawPartials(262, (k, hz) => Math.exp(-k / 18) * (0.35 + 0.8 * formant(hz, 600, 250) + formant(hz, 2900, 900)), 9000), ...sawPartials(263, (k, hz) => 0.22 * Math.exp(-k / 18) * (0.35 + 0.8 * formant(hz, 600, 250) + formant(hz, 2900, 900)), 9000)]), (u) => 0.4 + 0.6 * u),
    base: midiOf(262), env: { a: 0.035, d: 0.2, s: 0.85, r: 0.12 }, gain: 0.4, vib: [6.2, 18],
  },
  bari: {
    // Baritone guitar: clean-ish and twangy, the low strings (outlaw country)
    make: baritone.make, base: baritone.base, env: { a: 0.002, d: 0, s: 1, r: 0.08 }, gain: 0.5,
  },
  drop: {
    // Down-tuned power chords (low C-sharp), ringing out
    make: dropChord.make, base: dropChord.base, env: { a: 0.002, d: 0, s: 1, r: 0.08 }, gain: 0.36,
  },
  chug: {
    // The same, palm-muted: chugged short and dark
    make: chugChord.make, base: chugChord.base, env: { a: 0.002, d: 0, s: 1, r: 0.03 }, gain: 0.36,
  },
  synthbass: {
    make: held(0.01, partials(sawPartials(65, (k) => Math.exp(-k / 5), 3000))),
    base: midiOf(65), env: { a: 0.004, d: 0.18, s: 0.6, r: 0.06 }, gain: 0.6,
  },
  pad: {
    make: held(0.02, partials([[262, 1], [263, 0.8], [524, 0.3], [786, 0.12], [1310, 0.05]])),
    base: midiOf(262), env: { a: 0.5, d: 0.4, s: 0.8, r: 0.9 }, gain: 0.35,
  },
  // A cold synth lead: two saws a couple of Hz apart (beating, wide), a hard glassy edge up around 2k
  saw: {
    make: held(0.02, partials([...sawPartials(262, (k, hz) => Math.exp(-k / 14) * (1 + 0.9 * formant(hz, 2200, 650)), 4000), ...sawPartials(264, (k, hz) => 0.75 * Math.exp(-k / 14) * (1 + 0.9 * formant(hz, 2200, 650)), 4000)]), (u) => 0.6 + 0.4 * u),
    base: midiOf(262), env: { a: 0.01, d: 0.15, s: 0.8, r: 0.12 }, gain: 0.58, vib: [5.5, 12],
  },
  // French horns: dark, round, big (the mountain)
  horn: {
    make: held(0.1, partials([...sawPartials(262, (k, hz) => Math.exp(-k / 4) + 0.45 * formant(hz, 480, 260), 4500), ...sawPartials(263, (k, hz) => 0.7 * (Math.exp(-k / 4) + 0.45 * formant(hz, 480, 260)), 4500)]), (u) => 0.3 + 0.7 * u),
    base: midiOf(262), env: { a: 0.07, d: 0.2, s: 0.85, r: 0.25 }, gain: 0.6, vib: [5, 8],
  },
  // A glass harmonica: a pure tone and its twin a hertz off (the slow shimmer), a little of the twelfth; eerie, not sweet
  glass: {
    make: held(0.08, partials([[523, 1], [524, 0.75], [1569, 0.14], [2616, 0.05]]), (u) => u),
    base: midiOf(523), env: { a: 0.09, d: 0.3, s: 0.75, r: 0.45 }, gain: 0.42, vib: [4, 6],
  },
  // The gale: wind howling through a band (a hundred-odd partials at whole hertz, random phase, so it loops), gusting;
  // played on a note, the band goes up and down with it
  gale: {
    make: (() => {
      const list: [number, number, number][] = [];
      for (let f = 380; f <= 900; f += 5) list.push([f + Math.floor(Math.random() * 5), formant(f, 600, 160) + 0.12, Math.random() * TAU]);
      return held(0.25, (t) => {
        let v = 0;
        for (const [f, a, ph] of list) v += a * Math.sin(TAU * f * t + ph);
        return v * (0.7 + 0.2 * Math.sin(TAU * t + 0.6) + 0.1 * Math.sin(TAU * 3 * t + 2));
      }, (u) => u);
    })(),
    base: midiOf(600), env: { a: 0.7, d: 0.5, s: 0.9, r: 1.1 }, gain: 0.55,
  },
  // A thriller synth lead: a hollow square (odd harmonics, rolled off), its twin a hertz off for a slow beat; mournful, a little menace
  hollow: {
    make: held(0.06, partials([...sawPartials(262, (k) => (k % 2 ? 1 : 0.12) * Math.exp(-k / 6), 4000), ...sawPartials(263, (k) => 0.6 * (k % 2 ? 1 : 0.12) * Math.exp(-k / 6), 4000)]), (u) => 0.5 + 0.5 * u),
    base: midiOf(262), env: { a: 0.06, d: 0.25, s: 0.8, r: 0.3 }, gain: 0.5, vib: [4.8, 14],
  },
  // The office at night: a fluorescent tube and a radiator humming (a buzzy low tone and its twin a hertz off, the
  // throb), the tube stuttering twice a second-loop; played as a pedal, way down in the mix
  hum: {
    make: held(0.1, (t) => {
      let v = 0;
      for (let k = 1; k * 131 < 3000; k++) v += (Math.sin(TAU * 131 * k * t) + 0.8 * Math.sin(TAU * 132 * k * t)) * (formant(131 * k, 400, 300) + 0.4) / Math.pow(k, 1.1);
      const u = t % 1;
      return v * (1 - 0.35 * Math.exp(-(((u - 0.37) / 0.012) ** 2)) - 0.25 * Math.exp(-(((u - 0.81) / 0.02) ** 2))) * (0.9 + 0.1 * Math.sin(TAU * 3 * t));
    }, (u) => u),
    base: midiOf(131), env: { a: 0.4, d: 0.3, s: 0.9, r: 0.8 }, gain: 0.3,
  },
  // The desert's drone: a reedy low tone and its twin a hertz off (the throb), the heat shimmering up top of it (a few
  // high partials fluttering), the whole thing breathing in and out; the lane's slow vibrato warps it like the air does
  heat: {
    make: held(0.3, (t) => {
      let v = 0;
      for (let k = 1; k * 147 < 2400; k++) v += (Math.sin(TAU * 147 * k * t) + 0.7 * Math.sin(TAU * 148 * k * t)) * (k % 2 ? 1 : 0.6) * (formant(147 * k, 880, 520) + 0.3) / Math.pow(k, 1.2);
      let sh = 0;
      for (const k of [15, 16, 19, 21]) sh += Math.sin(TAU * 147 * k * t);
      return (v + 0.09 * sh * (0.5 + 0.5 * Math.sin(TAU * 7 * t))) * (0.8 + 0.2 * Math.sin(TAU * t));
    }, (u) => u),
    base: midiOf(147), env: { a: 0.9, d: 0.4, s: 0.9, r: 1.2 }, gain: 0.38, vib: [0.4, 9],
  },
  // A combo organ (the strip-mall lawyer's TV spot): a thin, reedy square, bright on top, its vibrato fast and cheesy
  combo: {
    make: held(0.01, partials(sawPartials(262, (k, hz) => (k % 2 ? 1 : 0.4) * (1 + 0.7 * formant(hz, 2100, 900)), 6500))),
    base: midiOf(262), env: { a: 0.005, d: 0.08, s: 0.85, r: 0.07 }, gain: 0.48, vib: [6.5, 20],
  },
  // ---- Plucked, struck, one-shot ----
  piano: {
    make: shot(2.6, (t) => {
      let v = 0;
      for (let k = 1; k <= 12; k++) { const hz = 262 * k * Math.sqrt(1 + 0.0004 * k * k); v += Math.sin(TAU * hz * t) * Math.exp(-t * (0.9 + k * 0.55)) / Math.pow(k, 1.1); }
      return v + (t < 0.012 ? noise() * 0.3 * (1 - t / 0.012) : 0);
    }),
    base: midiOf(262), env: { a: 0.002, d: 0, s: 1, r: 0.18 }, gain: 0.55,
  },
  // The saloon's upright: two strings a note, out of tune with each other (honky-tonk), brighter than the grand
  honky: {
    make: shot(2.2, (t) => {
      let v = 0;
      for (let k = 1; k <= 12; k++) for (const f of [262, 265.5]) { const hz = f * k * Math.sqrt(1 + 0.0004 * k * k); v += Math.sin(TAU * hz * t) * Math.exp(-t * (1.2 + k * 0.5)) / Math.pow(k, 0.9); }
      return v + (t < 0.01 ? noise() * 0.35 * (1 - t / 0.01) : 0);
    }),
    base: midiOf(263.7), env: { a: 0.002, d: 0, s: 1, r: 0.15 }, gain: 0.5,
  },
  epiano: {
    make: shot(2.4, (t) => Math.sin(TAU * 262 * t + (2.2 * Math.exp(-t * 4) + 0.25) * Math.sin(TAU * 262 * t) + 0.4 * Math.exp(-t * 20) * Math.sin(TAU * 262 * 14 * t)) * Math.exp(-t * 1.1)),
    base: midiOf(262), env: { a: 0.002, d: 0, s: 1, r: 0.2 }, gain: 0.5,
  },
  // The office's old electric piano: two tines out of tune with each other (the chorus beating), the tape wobbling under
  // it, the brightness gone off it
  murk: {
    make: shot(2.4, (t) => {
      const wow = 1.5 * Math.sin(TAU * 1.1 * t);
      const tine = (f: number) => Math.sin(TAU * f * t + wow + (1.4 * Math.exp(-t * 5) + 0.15) * Math.sin(TAU * f * t + wow));
      return (tine(262) + 0.8 * tine(262 * 1.009)) * Math.exp(-t * 1.4) + Math.sin(TAU * 131 * t) * Math.exp(-t * 30) * 0.3;
    }),
    base: midiOf(262), env: { a: 0.003, d: 0, s: 1, r: 0.25 }, gain: 0.5,
  },
  bass: { make: bass.make, base: bass.base, env: { a: 0.003, d: 0, s: 1, r: 0.06 }, gain: 0.8 },
  slap: { make: slap.make, base: slap.base, env: { a: 0.002, d: 0, s: 1, r: 0.05 }, gain: 0.75 },
  nylon: { make: nylon.make, base: nylon.base, env: { a: 0.002, d: 0, s: 1, r: 0.12 }, gain: 0.55 },
  banjo: { make: banjo.make, base: banjo.base, env: { a: 0.001, d: 0, s: 1, r: 0.05 }, gain: 0.5 },
  harp: { make: harp.make, base: harp.base, env: { a: 0.002, d: 0, s: 1, r: 0.2 }, gain: 0.5 },
  clav: { make: clav.make, base: clav.base, env: { a: 0.001, d: 0, s: 1, r: 0.04 }, gain: 0.45 },
  marimba: {
    make: shot(1.2, (t) => Math.sin(TAU * 523 * t) * Math.exp(-t * 3.5) + 0.35 * Math.sin(TAU * 523 * 4 * t) * Math.exp(-t * 14) + 0.12 * Math.sin(TAU * 523 * 9.9 * t) * Math.exp(-t * 40) + (t < 0.006 ? noise() * 0.3 : 0)),
    base: midiOf(523), env: { a: 0.001, d: 0, s: 1, r: 0.1 }, gain: 0.5,
  },
  bell: {
    make: shot(2.4, (t) => Math.sin(TAU * 1047 * t) * Math.exp(-t * 1.6) + 0.5 * Math.sin(TAU * 1047 * 2.76 * t) * Math.exp(-t * 3) + 0.25 * Math.sin(TAU * 1047 * 5.4 * t) * Math.exp(-t * 6) + 0.12 * Math.sin(TAU * 1047 * 8.93 * t) * Math.exp(-t * 10)),
    base: midiOf(1047), env: { a: 0.001, d: 0, s: 1, r: 0.3 }, gain: 0.35,
  },
  ice: {
    // A cold pulse-wave pluck (a quarter-duty square, its brightness snapping shut), for running ostinatos
    make: shot(0.7, (t) => {
      let v = 0;
      for (let k = 1; k * 523 < 9000; k++) v += (Math.sin(k * Math.PI * 0.25) / k) * Math.sin(TAU * 523 * k * t) * Math.exp(-t * (4 + k * 1.4));
      return v;
    }),
    base: midiOf(523), env: { a: 0.002, d: 0, s: 1, r: 0.06 }, gain: 0.36,
  },
  vibes: {
    // A vibraphone: soft-mallet bars, the motor's tremolo pulsing on them
    make: shot(3, (t) => (Math.sin(TAU * 262 * t) * Math.exp(-t * 0.9) + 0.22 * Math.sin(TAU * 262 * 4 * t) * Math.exp(-t * 3.5) + 0.08 * Math.sin(TAU * 262 * 10 * t) * Math.exp(-t * 14)) * (1 - 0.32 * (0.5 + 0.5 * Math.sin(TAU * 5.5 * t))) + (t < 0.004 ? noise() * 0.15 : 0)),
    base: midiOf(262), env: { a: 0.002, d: 0, s: 1, r: 0.4 }, gain: 0.45,
  },
  steel: {
    make: shot(1.6, (t) => Math.sin(TAU * 523 * t) * Math.exp(-t * 2.2) + 0.55 * Math.sin(TAU * 1046 * t) * Math.exp(-t * 3) + 0.35 * Math.sin(TAU * 523 * 3.03 * t) * Math.exp(-t * 5) + 0.2 * Math.sin(TAU * 523 * 4.1 * t) * Math.exp(-t * 7)),
    base: midiOf(523), env: { a: 0.004, d: 0, s: 1, r: 0.15 }, gain: 0.45,
  },
  // Dale's baritone guitar, through the spring tank (see daleBari); rings on as long as the note's held
  twang: { make: daleBari.make, base: daleBari.base, env: { a: 0.002, d: 0, s: 1, r: 0.35 }, gain: 0.7, vib: [5, 12] },
  // A rattlesnake: a dry buzz of scales clicking forty-odd times a second, shaking on, wavering; play it on o4 c
  rattle: {
    make: (() => {
      let p = 0;
      return shot(1.6, (t) => {
        const w = noise(); const hp = w - p; p = w;
        const click = Math.exp(-((t * 47) % 1) * 7);
        return hp * click * Math.min(1, t / 0.06) * (t > 1.35 ? Math.exp(-(t - 1.35) * 18) : 1) * (0.7 + 0.3 * Math.sin(TAU * 3 * t));
      });
    })(),
    base: midiOf(262), env: { a: 0.01, d: 0, s: 1, r: 0.12 }, gain: 0.6,
  },
  // Lab glassware: a beaker flicked with a fingernail (a cup's inharmonic modes, gone quick, a tick of a click on it)
  tink: {
    make: shot(0.9, (t) => Math.sin(TAU * 1568 * t) * Math.exp(-t * 7) + 0.45 * Math.sin(TAU * 1568 * 2.32 * t) * Math.exp(-t * 13) + 0.22 * Math.sin(TAU * 1568 * 4.25 * t) * Math.exp(-t * 24) + (t < 0.002 ? noise() * 0.4 : 0)),
    base: midiOf(1568), env: { a: 0.001, d: 0, s: 1, r: 0.12 }, gain: 0.45,
  },
  timpani: {
    make: shot(1.8, (t) => Math.sin(TAU * 98 * t) * Math.exp(-t * 1.8) + 0.4 * Math.sin(TAU * 98 * 1.5 * t) * Math.exp(-t * 3) + (t < 0.03 ? noise() * 0.5 * (1 - t / 0.03) : 0)),
    base: midiOf(98), env: { a: 0.002, d: 0, s: 1, r: 0.3 }, gain: 0.7,
  },
  hit: {
    // The orchestra hit: brass and strings on one big chord, all at once, gone quick
    make: shot(0.9, (t) => {
      let v = 0;
      for (const f of [262, 330, 392, 523, 131]) for (let k = 1; k * f < 6000; k++) v += Math.sin(TAU * f * k * t) * Math.exp(-k / 6) / k;
      return v * Math.exp(-t * 5) + (t < 0.02 ? noise() * 1.2 : 0);
    }),
    base: midiOf(262), env: { a: 0.002, d: 0, s: 1, r: 0.15 }, gain: 0.5,
  },
  // ---- Drums (played as they are) ----
  kick: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.05 }, gain: 0.95, make: shot(0.45, (t) => Math.sin(TAU * (45 * t + (110 / 28) * (1 - Math.exp(-t * 28)))) * Math.exp(-t * 7) + (t < 0.004 ? noise() * 0.6 : 0)) },
  snare: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.05 }, gain: 0.6, make: shot(0.3, (t) => noise() * Math.exp(-t * 16) * 0.9 + Math.sin(TAU * 185 * t) * Math.exp(-t * 22) * 0.7) },
  hat: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.02 }, gain: 0.28, make: (() => { let p = 0; return shot(0.08, (t) => { const w = noise(); const hp = w - p; p = w; return hp * Math.exp(-t * 60); }); })() },
  ohat: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.05 }, gain: 0.25, make: (() => { let p = 0; return shot(0.4, (t) => { const w = noise(); const hp = w - p; p = w; return hp * Math.exp(-t * 8); }); })() },
  crash: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.2 }, gain: 0.3, make: (() => { let p = 0; return shot(1.6, (t) => { const w = noise(); const hp = w - p * 0.6; p = w; return (hp + 0.3 * Math.sin(TAU * 3100 * t) * noise()) * Math.exp(-t * 2.6); }); })() },
  tomh: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.05 }, gain: 0.6, make: shot(0.4, (t) => Math.sin(TAU * (190 * t + (60 / 12) * (1 - Math.exp(-t * 12)))) * Math.exp(-t * 9) + (t < 0.005 ? noise() * 0.4 : 0)) },
  toml: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.05 }, gain: 0.65, make: shot(0.5, (t) => Math.sin(TAU * (110 * t + (40 / 10) * (1 - Math.exp(-t * 10)))) * Math.exp(-t * 7) + (t < 0.005 ? noise() * 0.4 : 0)) },
  clap: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.05 }, gain: 0.45, make: shot(0.3, (t) => noise() * (Math.exp(-((t % 0.011) * 300)) * (t < 0.035 ? 1 : 0) + Math.exp(-(t - 0.035) * 18) * (t >= 0.035 ? 0.8 : 0))) },
  conga: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.04 }, gain: 0.5, make: shot(0.35, (t) => Math.sin(TAU * 330 * t * (1 + 0.1 * Math.exp(-t * 30))) * Math.exp(-t * 11) + (t < 0.004 ? noise() * 0.5 : 0)) },
  congal: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.04 }, gain: 0.55, make: shot(0.45, (t) => Math.sin(TAU * 220 * t * (1 + 0.1 * Math.exp(-t * 30))) * Math.exp(-t * 8) + (t < 0.004 ? noise() * 0.5 : 0)) },
  bongo: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.03 }, gain: 0.45, make: shot(0.2, (t) => Math.sin(TAU * 480 * t) * Math.exp(-t * 20) + (t < 0.003 ? noise() * 0.5 : 0)) },
  cowbell: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.04 }, gain: 0.3, make: shot(0.4, (t) => (Math.sign(Math.sin(TAU * 540 * t)) + Math.sign(Math.sin(TAU * 800 * t))) * Math.exp(-t * 9)) },
  shaker: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.02 }, gain: 0.18, make: (() => { let p = 0; return shot(0.1, (t) => { const w = noise(); const hp = w - p; p = w; return hp * Math.sin(Math.PI * Math.min(1, t / 0.1)); }); })() },
  rim: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.02 }, gain: 0.4, make: shot(0.08, (t) => Math.sin(TAU * 1700 * t) * Math.exp(-t * 60) + noise() * Math.exp(-t * 90) * 0.5) },
  tamb: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.03 }, gain: 0.22, make: (() => { let p = 0; return shot(0.3, (t) => { const w = noise(); const hp = w - p; p = w; return hp * Math.exp(-t * 14) * (1 + 0.5 * Math.sin(TAU * 7000 * t)); }); })() },
  sleigh: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.05 }, gain: 0.2, make: shot(0.45, (t) => (Math.sin(TAU * 5200 * t) + Math.sin(TAU * 6300 * t) + Math.sin(TAU * 7700 * t)) * Math.exp(-t * 10) * (0.6 + 0.4 * Math.sin(TAU * 38 * t))) },
  // (a jazz ride: a ping on top of a wash of inharmonic shimmer, ringing on)
  ride: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.2 }, gain: 0.16, make: (() => { let p = 0; return shot(1.4, (t) => { const w = noise(); const hp = w - p * 0.8; p = w; return ([3150, 4410, 5230, 6720, 8130] as const).reduce((v, f, j) => v + Math.sin(TAU * f * t) * Math.exp(-t * (3 + j)) / (j + 1), 0) * 0.5 + hp * 0.35 * Math.exp(-t * 3.5) + Math.sin(TAU * 610 * t) * Math.exp(-t * 30) * 0.4; }); })() },
  // (brushes on the snare: a soft papery slap, no rattle to it)
  brush: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.04 }, gain: 0.32, make: (() => { let lp = 0; return shot(0.28, (t) => { lp += 0.35 * (noise() - lp); return lp * Math.min(1, t / 0.008) * Math.exp(-t * 15) + Math.sin(TAU * 190 * t) * Math.exp(-t * 35) * 0.15; }); })() },
  // (a taiko: a huge low drum, the skin's pitch dropping as it rings)
  taiko: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.1 }, gain: 0.8, make: (() => { let lp = 0; return shot(0.9, (t) => { lp += 0.08 * (noise() - lp); return Math.sin(TAU * (58 * t + (75 / 9) * (1 - Math.exp(-t * 9)))) * Math.exp(-t * 4.5) + lp * 2.5 * Math.exp(-t * 18) + (t < 0.006 ? noise() * 0.5 : 0); }); })() },
  // (ice cracking: a few sharp glassy clicks in a row)
  crack: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.04 }, gain: 0.32, make: (() => { let p = 0; return shot(0.25, (t) => { const w = noise(); const hp = w - p; p = w; const clicks = t < 0.06 ? Math.exp(-((t % 0.017) * 350)) : 0; return hp * (clicks + 0.4 * Math.exp(-t * 30)) + Math.sin(TAU * 2900 * t) * Math.exp(-t * 26) * 0.35 + Math.sin(TAU * 4100 * t) * Math.exp(-t * 40) * 0.25; }); })() },
  // (a typewriter key: a clack, a little metal in it)
  type: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.02 }, gain: 0.42, make: (() => { let p = 0; return shot(0.09, (t) => { const w = noise(); const hp = w - p; p = w; return hp * Math.exp(-t * 90) + Math.sin(TAU * 900 * t) * Math.exp(-t * 70) * 0.5 + Math.sin(TAU * 3300 * t) * Math.exp(-t * 50) * 0.3; }); })() },
  scratch: { drum: true, base: 60, env: { a: 0.001, d: 0, s: 1, r: 0.02 }, gain: 0.3, make: (() => { let ph = 0; return shot(0.22, (t) => { ph += (300 + 1200 * Math.abs(Math.sin(TAU * 9 * t))) / SR; return Math.sin(TAU * ph) * 0.5 + noise() * 0.5 * Math.abs(Math.sin(TAU * 9 * t)); }); })() },
};

/** Letters for the drums in a drum track. */
export const DRUM_KEYS: Record<string, string> = {
  k: 'kick', s: 'snare', h: 'hat', o: 'ohat', x: 'crash', t: 'tomh', u: 'toml', p: 'clap', c: 'conga', d: 'congal',
  b: 'bongo', w: 'cowbell', z: 'shaker', m: 'rim', j: 'tamb', y: 'sleigh', g: 'scratch', i: 'ride', n: 'brush',
  f: 'taiko', a: 'crack', e: 'type',
};

const built: Record<string, { buf: AudioBuffer; loop?: [number, number]; ctx: BaseAudioContext }> = {};
/** The instrument's sample as a buffer in `ctx` (made the first time it's asked for), and where it loops (seconds), if it does. */
export const sampleFor = (ctx: BaseAudioContext, name: string) => {
  const def = INSTRUMENTS[name];
  const key = def.alias ?? name;
  const have = built[key];
  if (have && have.ctx === ctx) return have;
  const { data, loop } = INSTRUMENTS[key].make();
  const buf = ctx.createBuffer(1, data.length, SR);
  buf.getChannelData(0).set(data);
  return (built[key] = { buf, loop, ctx });
};
