// JUNGLE LAND's music (land id 'adventure'): the land's theme, a version of it for every section, and its set pieces'
// own songs (the boat, the mine cart, the roof coming in). The bosses (the T. rex, Safari Artie) are in jungleBosses.ts.
//
// ---- "DARKEST JUNGLE LAND" (land:adventure) ----
// Les Baxter exotica by way of a Saturday matinee: a beguine with a marimba ostinato, congas and claves, a pan flute
// out front, and a B section that turns into a full-blown adventure-serial march in the relative major.
//
// C minor, 100, straight eighths (the marimba's 3+3+2 against the beguine). 36 bars: a 4-bar intro (once: birds, the
// marimba starting up, jungle toms building, a harp run into it), then the 32-bar loop:
//   A1 (8)  the hook on pan flute: up the C minor arpeggio, the A-flat and the augmented second (B down to A-flat) over
//           the G7 flat-nine, Cm - Cm/Bb - Abmaj7 - G7b9; the Neapolitan D-flat brushing past at the half cadence.
//   A2 (8)  the hook again, the clarinet answering under it, the jungle toms in, oohs, the brass stabbing; it turns
//           to B-flat at the end (Ab - Bb - Bb7) instead of G.
//   B  (8)  E-flat major, the matinee: the brass section's march (dotted pickups up to the B-flat), horns in thirds
//           under it, snare and timpani; Eb - Ab/Eb - Eb - Bb/D - Cm - Abmaj7 - Fm7 - Ab7.
//   C  (8)  "Quiet Village": D-flat, the vibes doubling the tune, harp arpeggios, oohs, the clarinet low; Dbmaj7 -
//           Cm7 - Fm7 - Bbm7 - Eb7 - Abmaj7 - G7b9, the diminished run up into the hook.
//
// ARRANGEMENTS (one per section, crossfading as he walks; same song, the place kept):
//   jungle      the whole jungle: pan flute, marimba, congas, claves, birds, toms, the brass march
//   queue       the Jungle Cruise queue's speakers: vibes on the tune, nylon guitar, marimba, a soft kit, muffled
//   river       (the boat's own song is seq:river; this is the fallback) flute, guitar, marimba, light
//   underwater  celesta, slow strings, harp, oohs (and the engine muffles it under water)
//   dino        the robot dinosaur zoo: horns on the tune, pizzicato ostinato, timpani, taiko, xylophone, brass
//   temple      backstage at the temple: oboe snake-charmer, cello, low choir, hand drums and toms, no kit
//   cart        (the cart's own song is seq:mine-cart; the fallback) the full band driving
//   roof        after the roof: dazed, a harmon-muted trumpet, vibes, guitar, the kit soft
//   clearing    the calm before Artie: flute, slow strings, timpani, toms and hand drums, no kit
//   cutscene    vibes on the tune, strings, harp, marimba, the bass soft
//   boss        (any fight without a theme) the jungle with taiko

import type { Song } from '../engine';

export type Bar = string | [string, string];
export const join = (...parts: string[][]) => parts.flat().join(' | ');
export const rest = (n: number) => Array.from({ length: n }, () => 'r1');
export const rep = (bar: string, n: number) => Array.from({ length: n }, () => bar);
/** Everything n octaves up (each bar's o-numbers raised). */
export const up = (bars: string[], n = 1) => bars.map(b => b.replace(/o(\d)/g, (_, k) => `o${Number(k) + n}`));
/** One note at its octave ('4e-'), with a length (and an accent or ghost before it). */
export const nt = (n: string, len: string, pre = '') => `o${n[0]} ${pre}${n.slice(1)}${len}`;
/** An octave-note an octave up. */
export const hi = (n: string) => `${Number(n[0]) + 1}${n.slice(1)}`;
/** A chord of octave-notes, lowest first: ['3a-', '4c', '4e-'] -> 'o3 {a- >c e-}'. */
export const chord = (ns: string[], len: string) => {
  let o = Number(ns[0][0]);
  let s = `o${o} {`;
  for (const n of ns) { const k = Number(n[0]); s += '>'.repeat(Math.max(0, k - o)) + n.slice(1) + ' '; o = k; }
  return `${s.trim()}}${len}`;
};
/** A bar per chord, or two chords a bar (half each): `f(chord, beats)` makes that many beats. */
export const bars = (prog: Bar[], f: (c: string, beats: 4 | 2) => string) => prog.map(b => (typeof b === 'string' ? f(b, 4) : `${f(b[0], 2)} ${f(b[1], 2)}`));
/** A pattern of eighths (or sixteenths) cut to a number of beats. */
export const cut = (toks: string[], beats: number, per = 2) => toks.slice(0, beats * per).join(' ');

// =====================================================================================================================
// DARKEST JUNGLE LAND

const V: Record<string, string[]> = {
  Cm: ['4e-', '4g', '5c', '5d'], 'Cm/Bb': ['4e-', '4g', '4b-', '5c'], Abmaj7: ['3a-', '4c', '4e-', '4g'], G7b9: ['3b', '4d', '4f', '4a-'],
  G7sus: ['4d', '4f', '4g', '5c'], G7: ['3b', '4d', '4f', '4g'], Dbmaj7: ['4d-', '4f', '4a-', '5c'], Bb: ['4d', '4f', '4b-', '5d'],
  Bb7: ['4d', '4f', '4a-', '4b-'], Eb: ['4e-', '4g', '4b-', '5e-'], 'Ab/Eb': ['4e-', '4a-', '5c', '5e-'], 'Bb/D': ['4d', '4f', '4b-', '5d'],
  Fm7: ['3a-', '4c', '4e-', '4f'], Ab7: ['4c', '4e-', '4g-', '4a-'], Cm7: ['4e-', '4g', '4b-', '5d'], Bbm7: ['4d-', '4f', '4a-', '5c'],
  Eb7: ['4d-', '4g', '4b-', '5c'],
};
const R: Record<string, [string, string]> = {
  Cm: ['c', 'g'], 'Cm/Bb': ['b-', 'g'], Abmaj7: ['a-', 'e-'], G7b9: ['g', 'd'], G7sus: ['g', 'd'], G7: ['g', 'd'], Dbmaj7: ['d-', 'a-'],
  Bb: ['b-', 'f'], Bb7: ['b-', 'f'], Eb: ['e-', 'b-'], 'Ab/Eb': ['e-', 'a-'], 'Bb/D': ['d', 'b-'], Fm7: ['f', 'c'], Ab7: ['a-', 'e-'],
  Cm7: ['c', 'g'], Bbm7: ['b-', 'f'], Eb7: ['e-', 'b-'],
};
const INTRO: Bar[] = ['Cm', 'Cm', 'Abmaj7', ['G7sus', 'G7']];
const A1: Bar[] = ['Cm', 'Cm/Bb', 'Abmaj7', 'G7b9', 'Cm', 'Cm/Bb', ['Abmaj7', 'Dbmaj7'], ['G7sus', 'G7']];
const A2: Bar[] = ['Cm', 'Cm/Bb', 'Abmaj7', 'G7b9', 'Cm', 'Cm/Bb', ['Abmaj7', 'Bb'], 'Bb7'];
const B: Bar[] = ['Eb', 'Ab/Eb', 'Eb', 'Bb/D', 'Cm', 'Abmaj7', 'Fm7', 'Ab7'];
const C: Bar[] = ['Dbmaj7', 'Dbmaj7', 'Cm7', 'Fm7', 'Bbm7', 'Eb7', 'Abmaj7', 'G7b9'];
const LOOP: Bar[] = [...A1, ...A2, ...B, ...C];

const pads = (prog: Bar[]) => bars(prog, (c, b) => chord(V[c], b === 4 ? '1' : '2'));
/** The marimba's ostinato: the chord broken 3+3+2, accented. */
const ostinato = (prog: Bar[]) => bars(prog, (c, b) => {
  const v = V[c], n = [...v, hi(v[0])];
  const idx = [0, 1, 2, 0, 1, 2, 3, 2], acc = [1, 0, 0, 1, 0, 0, 1, 0];
  return cut(idx.map((k, i) => nt(n[k], '8', acc[i] ? '!' : '')), b);
});
/** The harp: up two octaves of the chord and down again, in sixteenths. */
const harp16 = (prog: Bar[]) => bars(prog, (c, b) => {
  const v = V[c], n = [...v, ...v.map(hi)];
  return cut([...n, ...[...n].reverse()].map(x => nt(x, '16')), b, 4);
});
/** The harp, gently: up the chord in eighths. */
const harp8 = (prog: Bar[]) => bars(prog, (c, b) => { const v = V[c], n = [...v, ...v.map(hi)]; return cut(n.map(x => nt(x, '8')), b); });
/** The nylon guitar's strum (the bolero's long-short). */
const strum = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(V[c], ''); const toks = [`${x}8.`, `${x}16`, 'r8', `${x}8`, 'r8', `${x}8`, `${x}8`, 'r8']; return b === 4 ? toks.join(' ') : `${x}8. ${x}16 r8 ${x}8`; });
/** The beguine bass: the root long, the fifth, the root, the fifth. */
const beguine = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = R[c]; return b === 4 ? `o2 ${r}4. ${f}8 ${r}4 ${f}4` : `o2 ${r}4. ${f}8`; });
/** The march's bass. */
const marchBass = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = R[c]; return b === 4 ? `o2 ${r}4 ${f}4 ${r}4 ${f}8 ${r}8` : `o2 ${r}4 ${f}4`; });
const halves = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = R[c]; return b === 4 ? `o2 ${r}2 ${f}2` : `o2 ${r}2`; });

// ---- The tunes ----
const T_INTRO = ['r1', 'o5 r2 g4. _b-1 a-8', 'o5 g2 e-4 c4', 'o5 d2 o4 b4 r4'];
const T_A = [
  'o5 c4 r8 o4 g8 o5 c8 e-8 g4',
  'o5 a-8 g8 f8 e-8 _b-1 f2',
  'o5 e-4 r8 c8 e-8 g8 o6 c4',
  'o5 b4 a-8 g8 f8 e-8 d8 o4 b8',
  'o5 c4 r8 o4 g8 o5 c8 e-8 g4',
  'o5 b-8 a-8 g8 f8 g4 e-4',
];
const T_A1 = [...T_A, 'o5 c8 e-8 a-8 g8 f4. d-8', 'o5 c2 o4 b2'];
const T_A2 = [...T_A, 'o5 c8 e-8 a-8 g8 f4 d4', 'o5 d8 c8 o4 b-8 a-8 f4 a-8 b-8'];
const T_B = [
  'o4 b-8. b-16 o5 e-4 f8. g16 b-4',
  'o5 a-2 g8. f16 e-4',
  'o5 g4. f8 e-4 d8 e-8',
  'o5 f2. r8 o4 b-8',
  'o4 b-8. b-16 o5 c4 d8. e-16 g4',
  'o5 a-4. g8 o6 _b-1 c2',
  'o5 b-4 a-8 g8 f4 e-8 f8',
  'o5 g-4 f4 e-4 c4',
];
const T_C = [
  'o5 f2 a-4 o6 c4',
  'o6 d-4. c8 o5 a-2',
  'o5 g2 b-4 o6 d4',
  'o6 e-4. d-8 c2',
  'o5 f2 a-4 b-8 o6 c8',
  'o6 d-4. c8 o5 b-4 g4',
  'o5 a-4 g4 e-4 c4',
  'o5 d4 f4 a-4 b4',
];
/** The clarinet's answers under A2, and its low line in C. */
const K_A2 = ['o4 g2 e-2', 'o4 d2 e-4 f4', 'o4 e-2 c4 e-4', 'o4 d2 o3 b2', 'o4 e-2. d4', 'o4 d4 e-4 f4 g4', 'o4 a-2 b-2', 'o4 a-4 b-8 o5 c8 d4 f4'];
const K_C = ['o3 a-1', 'o3 a-2 b-4 o4 c4', 'o4 d2 o3 b-2', 'o3 a-2 o4 c2', 'o4 d-2 c4 o3 b-4', 'o3 b-2 g2', 'o3 a-2 o4 c2', 'o3 b2 o4 d4 f4'];
/** The horns: thirds under the march, long tones in C. */
const H_B = ['o4 g2 b-2', 'o4 a-2 o5 c2', 'o4 b-2 g2', 'o4 b-1', 'o4 g2 b-2', 'o5 c2 e-2', 'o4 a-2 o5 c2', 'o5 c2 o4 a-2'];
const H_C = ['o4 f1', 'o4 f1', 'o4 e-1', 'o4 c1', 'o4 d-1', 'o4 d-1', 'o4 c1', 'o3 b1'];

// ---- The drums ----
const GA = 'k8 ?h8 m8 {kh}8 k8 ?h8 m8 h8';
const GA_IN = '{kx}8 ?h8 m8 {kh}8 k8 ?h8 m8 h8';
const FILL_A = 'k8 ?h8 m8 {kh}8 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)8 (tom4)8';
const MARCH = '{kh}8 s16 s16 {sh}8 k8 {kh}8 s16 s16 {sh}8 h8';
const MARCH_IN = '{kx}8 s16 s16 {sh}8 k8 {kh}8 s16 s16 {sh}8 h8';
const FILL_B = '_v70 s16 s16 s16 s16 _v85 s16 s16 s16 s16 _v100 (tom1)16 (tom1)16 (tom2)16 (tom2)16 _v115 (tom3)16 (tom3)16 (tom4)16 (tom4)16';
const RIDE_C = '{ki}4 ?i8 i8 {mi}4 ?i8 i8';
const RIDE_C_IN = '{kx}4 ?i8 i8 {mi}4 ?i8 i8';
const FILL_C = 'k8 i8 m8 i8 s16 s16 (tom2)16 (tom3)16 (tom4)8 (tom4)8';
const KRUPA = '(tom4)8 ?(tom4)8 (tom3)8 (tom4)8 ?(tom4)8 (tom4)8 (tom3)8 ?(tom3)8';
const CONGA = '?c8 c8 d8 ?c8 c8 ?c8 d8 d8';
const CONGA_SOFT = 'c4 ?c8 d8 c4 ?c8 d8';
const BONGO = 'b16 ?b16 (bongolo)16 ?b16 b16 ?b16 (bongolo)16 ?b16 b16 ?b16 (bongolo)16 ?b16 b16 b16 (bongolo)16 (bongolo)16';
const CLAVE = '(clave)8 r8 r8 (clave)8 r8 r8 (clave)8 r8 | r4 (clave)4 (clave)4 r4';
const CHIRP1 = 'o6 _b-4 g16 _b-4 g16 r8 r4 o6 [e32 f+32]4 r4';
const CHIRP2 = 'r2 o6 _b5 c8 _b5 c8 r4';
const CHIRP3 = 'r4 o6 [d32 e32]4 r4 o6 _b-3 a16 _b-3 a16 r8';

export const LAND_ADVENTURE: Song = {
  title: 'Darkest Jungle Land',
  bpm: 100,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.85,
  delay: { beats: 0.75, feedback: 0.3, tone: 2600 },
  parts: {
    tune: { inst: 'panflute', pan: 0, rev: 0.3, dly: 0.12, mml: join(['_v100'], T_INTRO, T_A1, ['_v105'], T_A2, ['_v110'], T_B, ['_v95'], T_C) },
    counter: { inst: 'clarinet', pan: -0.3, rev: 0.28, vol: 0.62, mml: join(rest(4), rest(8), ['_v80'], K_A2, rest(8), ['_v75'], K_C) },
    brass: {
      inst: 'brass', pan: 0.1, rev: 0.28, vol: 0.85,
      mml: join(
        ['r1', 'r1', `_e40 _e127/1 _v90 ${chord(V.Abmaj7, '1')}`, `${chord(V.G7sus, '2')} ${chord(V.G7, '4')} r4`],
        rest(8),
        ['r1', 'r1', 'r1', `r2 r8 _v100 ${chord(V.G7b9, '8')} r4`, 'r1', 'r1', 'r1', `r2 ${chord(V.Bb7, '8')} r8 !${chord(V.Bb7, '8')} r8`],
        ['_v110'], T_B,
        rest(8),
      ),
    },
    horns: { inst: 'horn', pan: -0.35, rev: 0.35, vol: 0.6, mml: join(['_v80 o4 c1', 'o4 c1', 'o3 a-1', 'o3 g1'], rest(16), ['_v90'], H_B, ['_v65'], H_C) },
    strings: { inst: 'strings', pan: 0, rev: 0.38, vol: 0.5, mml: join(['_v70'], pads(INTRO), ['_v55'], pads(A1), ['_v65'], pads(A2), ['_v90'], pads(B), ['_v70'], pads(C)) },
    marimba: { inst: 'marimba', pan: 0.25, rev: 0.25, vol: 0.6, mml: join(['_v85'], ostinato(INTRO), ostinato(A1), ostinato(A2), ['_v65'], ostinato(B), ['_v80'], ostinato(C)) },
    vibes: { inst: 'vibes', pan: 0.35, rev: 0.4, dly: 0.15, vol: 0.55, mml: join(rest(4), rest(24), ['_v85'], T_C) },
    harp: {
      inst: 'harp', pan: -0.25, rev: 0.4, vol: 0.5,
      mml: join(['r1', 'r1', 'r1', '_v80 o4 g16 b16 o5 d16 f16 a-16 b16 o6 d16 f16 a-4 r4'], rest(24), ['_v70'], harp16(C)),
    },
    harpA: { inst: 'harp', pan: -0.25, rev: 0.4, vol: 0.5, only: ['underwater', 'cutscene'], mml: join(rest(4), ['_v65'], harp8(A1), harp8(A2), harp8(B), rest(8)) },
    oohs: { inst: 'oohs', pan: 0, rev: 0.45, vol: 0.5, mml: join(rest(4), rest(8), ['_v55'], pads(A2), rest(8), ['_v70'], pads(C)) },
    bass: { inst: 'upright', pan: 0, rev: 0.08, vol: 0.85, mml: join(['r1', 'r1', '_v95 o2 a-1', 'o2 g4. g8 a-4 b4'], beguine(A1), beguine(A2), ['_v105'], marchBass(B), ['_v90'], halves(C)) },
    gtr: { inst: 'nylongtr', pan: -0.4, rev: 0.2, vol: 0.55, only: ['queue', 'river', 'roof'], mml: join(rest(4), ['_v80'], strum(LOOP)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.7,
      mml: join(rest(4), ['_v85 ' + GA_IN], rep(GA, 6), [FILL_A], [GA_IN], rep(GA, 6), [FILL_A], ['_v100 ' + MARCH_IN], rep(MARCH, 6), [FILL_B], ['_v75 ' + RIDE_C_IN], rep(RIDE_C, 6), [FILL_C]),
    },
    toms: {
      inst: 'tom4', drums: true, pan: -0.15, rev: 0.25, vol: 0.6,
      mml: join(
        ['_v50 (tom4)4 r4 (tom4)4 r4', '_v60 (tom4)4 r8 (tom3)8 (tom4)4 r8 (tom3)8', '_v75 (tom4)8 (tom3)8 (tom4)8 (tom3)8 (tom4)8 (tom3)8 (tom4)8 (tom3)8', '_v95 (tom4)16 (tom4)16 (tom4)16 (tom4)16 (tom3)16 (tom3)16 (tom3)16 (tom3)16 (tom2)16 (tom2)16 (tom2)16 (tom2)16 (tom1)16 (tom1)16 (tom1)16 (tom1)16'],
        rest(8), ['_v75 ' + KRUPA], rep(KRUPA, 7), rest(16),
      ),
    },
    perc: { inst: 'congahi', drums: true, pan: 0.3, rev: 0.18, vol: 0.6, mml: join(['r1', 'r1', '_v70 ' + CONGA, CONGA], ['_v85 ' + CONGA], rep(CONGA, 15), ['_v80 ' + BONGO], rep(BONGO, 7), ['_v70 ' + CONGA_SOFT], rep(CONGA_SOFT, 7)) },
    clave: { inst: 'clave', drums: true, pan: 0.45, rev: 0.2, vol: 0.45, not: ['dino', 'temple', 'clearing', 'underwater', 'cutscene'], mml: join(rest(4), ['_v80'], rep(CLAVE, 16)) },
    timpani: {
      inst: 'timpani', pan: -0.1, rev: 0.32, vol: 0.7,
      mml: join(
        ['_v90 o2 c4 r2.', 'r1', 'o2 a-4 r2.', 'o2 _v40 [g32]8 _v60 [g32]8 _v85 [g32]8 _v110 [g32]8'],
        ['_v100 o2 c4 r2.'], rest(7),
        ['o2 c4 r2.'], rest(6), ['o2 _v50 [f32]8 _v70 [f32]8 _v90 [f32]8 _v110 [f32]8'],
        ['_v110 o2 e-4 r2.', 'r1', 'o2 e-4 r2.', 'o2 d4 r2.', 'o2 c4 r2.', 'o2 a-4 r2.', 'o2 f4 r2.', 'o2 _v60 [a-32]8 _v80 [a-32]8 _v100 [a-32]8 _v115 [a-32]8'],
        ['_v80 o2 d-4 r2.'], rest(6), ['o2 _v50 [g32]8 _v70 [g32]8 _v90 [g32]8 _v110 [g32]8'],
      ),
    },
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.8, only: ['dino', 'boss', 'cart'], mml: join(rest(4), ['_v95'], rep('f4 r4 f8 f8 r4', 16), ['_v110'], rep('f4 f4 f4 f8 f8', 8), ['_v80'], rep('f2 r2', 8)) },
    bird: {
      inst: 'flute', pan: 0.6, rev: 0.5, dly: 0.3, vol: 0.4, only: ['jungle', 'clearing', 'main'],
      mml: join(['_v70 ' + CHIRP1, CHIRP2, 'r1', 'r1'], ['r1', 'r1', 'r1', CHIRP3], rest(4), rest(8), rest(8), ['r1', CHIRP2, 'r1', 'r1', 'r1', CHIRP1, 'r1', 'r1']),
    },
  },
  arrangements: {
    jungle: {},
    main: {},
    queue: {
      inst: { tune: 'vibes' },
      mute: ['brass', 'horns', 'timpani', 'toms', 'oohs', 'harp', 'counter', 'vibes'],
      vol: { strings: 0.3, kit: 0.55, perc: 0.5, tune: 0.9 },
      rev: { tune: 0.25 },
      lowpass: 4200, level: 0.8,
    },
    river: { inst: { tune: 'flute' }, mute: ['brass', 'timpani', 'toms', 'harp'], vol: { strings: 0.4, kit: 0.6 }, level: 0.85 },
    underwater: {
      solo: ['tune', 'strings', 'harp', 'harpA', 'oohs', 'vibes', 'bass'],
      inst: { tune: 'celesta', strings: 'slowstrings' },
      vol: { bass: 0.5, strings: 0.6, vibes: 0.4 },
      rev: { tune: 0.5, harp: 0.5, harpA: 0.5 },
      level: 0.7,
    },
    dino: {
      inst: { tune: 'horn', marimba: 'pizz', counter: 'cello', vibes: 'xylophone' },
      mute: ['oohs', 'harp'],
      vol: { timpani: 1.15, brass: 1.05, strings: 0.65, marimba: 0.7, counter: 0.8, tune: 0.9 },
      rev: { tune: 0.35 },
    },
    temple: {
      inst: { tune: 'oboe', counter: 'cello', strings: 'slowstrings', oohs: 'choir', vibes: 'marimba' },
      mute: ['kit', 'brass', 'timpani', 'horns'],
      vol: { marimba: 0.45, toms: 0.85, strings: 0.45, oohs: 0.6, perc: 0.7, counter: 0.75 },
      rev: { tune: 0.5, marimba: 0.4, perc: 0.35 },
      level: 0.85,
    },
    cart: { vol: { kit: 1.1 } },
    roof: {
      inst: { tune: 'mutetrumpet', marimba: 'vibes' },
      mute: ['brass', 'horns', 'toms', 'timpani', 'oohs', 'harp', 'vibes'],
      vol: { kit: 0.5, strings: 0.35, marimba: 0.5 },
      rev: { tune: 0.35 },
      level: 0.8,
    },
    clearing: {
      inst: { tune: 'flute', strings: 'slowstrings' },
      mute: ['kit', 'brass'],
      vol: { marimba: 0.45, toms: 0.7, timpani: 0.9, perc: 0.5, strings: 0.6 },
      level: 0.85,
    },
    cutscene: {
      solo: ['tune', 'strings', 'harp', 'harpA', 'bass', 'marimba', 'oohs'],
      inst: { tune: 'vibes', strings: 'slowstrings' },
      vol: { bass: 0.5, strings: 0.55, marimba: 0.4, oohs: 0.4 },
      rev: { tune: 0.45 },
      level: 0.75,
    },
    boss: { vol: { kit: 1.1 } },
  },
};

// =====================================================================================================================
// "BACKSIDE OF WATER" (seq:river): the Jungle Cruise's own canned ride music, under Safari Artie's set. A dumb, sunny
// tiki calypso on steel drum (the ride's been playing it since 1962), a drummer who does a ba-dum-tss at the end of
// every eight bars whether there was a joke or not; under the water, the same tune gone dreamy (celesta, a warm pad,
// harp, oohs: and the engine muffles it).
//
// G major, 120. 34 bars: a 2-bar vamp on D7 (once), then A (8) A (8) B (8) A (8):
//   A   G - Em7 - Am7 - D7 - G - E7 - A7 D7 - G, the steel drum's syncopated hook, ba-dum-tss.
//   A2  the same, the vibes doubling it, a run up into
//   B   C - Cm6 - G/B - E7 - Am7 - Eb7 (the tritone sub: the jungle detour) - D7sus - D7, the clarinet holding under it.
//   A3  the hook, ba-dum-tss, and round.
// ARRANGEMENTS: boat (the ride), underwater.

const V2: Record<string, string[]> = {
  G: ['4d', '4g', '4b'], Em7: ['4e', '4g', '4b', '5d'], Am7: ['4e', '4g', '4a', '5c'], D7: ['4d', '4f+', '4a', '5c'], E7: ['4e', '4g+', '4b', '5d'],
  A7: ['4e', '4g', '4a', '5c+'], C: ['4e', '4g', '5c'], Cm6: ['4e-', '4g', '4a', '5c'], 'G/B': ['4d', '4g', '4b'], Eb7: ['4e-', '4g', '4b-', '5d-'],
  D7sus: ['4d', '4g', '4a', '5c'],
};
const R2: Record<string, [string, string]> = {
  G: ['g', 'd'], Em7: ['e', 'b'], Am7: ['a', 'e'], D7: ['d', 'a'], E7: ['e', 'b'], A7: ['a', 'e'], C: ['c', 'g'], Cm6: ['c', 'g'], 'G/B': ['b', 'd'],
  Eb7: ['e-', 'b-'], D7sus: ['d', 'a'],
};
const RV_IN: Bar[] = ['D7', 'D7'];
const RV_A: Bar[] = ['G', 'Em7', 'Am7', 'D7', 'G', 'E7', ['A7', 'D7'], 'G'];
const RV_B: Bar[] = ['C', 'Cm6', 'G/B', 'E7', 'Am7', 'Eb7', 'D7sus', 'D7'];
const RV_ALL: Bar[] = [...RV_IN, ...RV_A, ...RV_A, ...RV_B, ...RV_A];

const RV_HOOK = [
  'o5 d8 d8 r8 b8 r8 g4 a8',
  'o5 b4 a8 g8 r8 e8 g4',
  'o6 c8 c8 r8 o5 a8 r8 e4 g8',
  'o5 a4 g8 f+8 r8 d8 f+4',
  'o5 d8 d8 r8 b8 r8 o6 d4 c8',
  'o5 b4 g+8 e8 r8 g+8 b4',
  'o6 c+8 o5 a8 e8 a8 o6 c8 o5 a8 f+8 a8',
];
const RV_A1 = [...RV_HOOK, 'o5 g4 r8 d8 g4 r4'];
const RV_A2 = [...RV_HOOK, 'o5 g4 r4 r8 g8 a8 b8'];
const RV_BM = [
  'o6 c4. o5 b8 a8 g8 e8 g8',
  'o5 a4. g8 e-4 c4',
  'o5 d4. e8 g8 b8 r8 d8',
  'o5 g+4 b4 o6 d4 e4',
  'o6 c4. o5 b8 a8 g8 e8 c8',
  'o5 d-4 e-8 g8 b-8 g8 e-4',
  'o5 d4 g4 c4 a4',
  'o5 f+4 a4 o6 c4 o5 a8 f+8',
];
const rvPads = (prog: Bar[]) => bars(prog, (c, b) => chord(V2[c], b === 4 ? '1' : '2'));
const rvStrum = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(V2[c], ''); return cut([`${x}8`, `${x}8`, 'r8', `${x}8`, 'r8', `${x}8`, `${x}8`, 'r8'], b); });
const rvSkank = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(V2[c], ''); return cut(['r8', `${x}8`, 'r8', `${x}8`, 'r8', `${x}8`, 'r8', `${x}8`], b); });
const rvBass = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = R2[c]; return b === 4 ? `o2 ${r}4 r8 ${f}8 ${r}4 ${f}8 ${r}8` : `o2 ${r}4 r8 ${f}8`; });
const rvHarp = (prog: Bar[]) => bars(prog, (c, b) => { const v = V2[c], n = [...v, ...v.map(hi)]; return cut([...n, ...n].slice(0, 8).map(x => nt(x, '8')), b); });

const CAL = 'k8 ?h8 {mh}8 k8 k8 ?h8 {mh}8 ?h8';
const CAL_IN = '{kx}8 ?h8 {mh}8 k8 k8 ?h8 {mh}8 ?h8';
const BADUM = 'k8 ?h8 {mh}8 k8 s8 (tom3)8 {k(crash)}4';
const CAL_FILL = 'k8 ?h8 {mh}8 k8 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)8 (tom4)8';
const CAL_CONGA = 'c8 c8 d8 ?c8 c8 c8 d8 ?d8';
const SHAKE16 = 'z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16';

export const SEQ_RIVER: Song = {
  title: 'Backside of Water',
  bpm: 120,
  loopFrom: 8,
  reverb: 'plate',
  reverbMix: 0.7,
  delay: { beats: 0.5, feedback: 0.25, tone: 3200 },
  parts: {
    tune: { inst: 'steeldrum', pan: 0.05, rev: 0.22, dly: 0.12, mml: join(['_v95 r1', 'o5 r2 r8 d8 e8 f+8'], RV_A1, RV_A2, ['_v100'], RV_BM, ['_v95'], RV_A1) },
    vibes: { inst: 'vibes', pan: 0.35, rev: 0.3, vol: 0.45, not: ['underwater'], mml: join(rest(2), rest(8), ['_v75'], RV_A2, rest(8), RV_A1) },
    counter: { inst: 'clarinet', pan: -0.3, rev: 0.3, vol: 0.55, mml: join(rest(2), rest(16), ['_v80 o4 g1', 'o4 e-1', 'o4 d2 g2', 'o4 g+1', 'o4 e2 g2', 'o4 g1', 'o4 g2 a2', 'o4 f+2 a2'], rest(8)) },
    gtr: { inst: 'steelgtr', pan: -0.4, rev: 0.15, vol: 0.5, not: ['underwater'], mml: join(['_v75'], rvStrum(RV_ALL)) },
    marimba: { inst: 'marimba', pan: 0.4, rev: 0.15, vol: 0.5, not: ['underwater'], mml: join(['q4 _v80'], rvSkank(RV_ALL)) },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.8, mml: join(['_v95'], rvBass(RV_ALL)) },
    pad: { inst: 'warmpad', pan: 0, rev: 0.45, vol: 0.5, only: ['underwater'], mml: join(['_v80'], rvPads(RV_ALL)) },
    oohs: { inst: 'oohs', pan: 0, rev: 0.5, vol: 0.4, only: ['underwater'], mml: join(rest(2), rest(16), ['_v70'], rvPads(RV_B), rest(8)) },
    harp: { inst: 'harp', pan: -0.2, rev: 0.45, vol: 0.45, only: ['underwater'], mml: join(['_v70'], rvHarp(RV_ALL)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.65, not: ['underwater'],
      mml: join(['_v80 ' + CAL, 'k8 ?h8 {mh}8 k8 (tom1)8 (tom2)8 (tom3)8 (tom4)8'], ['_v90 ' + CAL_IN], rep(CAL, 6), [BADUM], rep(CAL, 7), [CAL_FILL], [CAL_IN], rep(CAL, 6), [CAL_FILL], [CAL_IN], rep(CAL, 6), [BADUM]),
    },
    perc: { inst: 'congahi', drums: true, pan: 0.3, rev: 0.15, vol: 0.55, not: ['underwater'], mml: join(['_v80'], rep(CAL_CONGA, 34)) },
    shaker: { inst: 'shaker', drums: true, pan: -0.5, rev: 0.1, vol: 0.4, not: ['underwater'], mml: join(['_v75'], rep(SHAKE16, 34)) },
  },
  arrangements: {
    boat: {},
    underwater: {
      solo: ['tune', 'counter', 'bass', 'pad', 'oohs', 'harp'],
      inst: { tune: 'celesta', bass: 'upright', counter: 'flute' },
      vol: { bass: 0.5, tune: 0.8 },
      rev: { tune: 0.5, counter: 0.5 },
      level: 0.75,
    },
  },
};

// =====================================================================================================================
// "UNFRIENDLY GUESTS" (seq:mine-cart): the actual dangerous track. A Saturday-serial mine-cart chase: strings
// galloping, a trumpet on the tune, xylophone up top, a train beat; when Safari Artie comes up behind him in his own
// cart (the 'chase' arrangement), the whole brass section piles on, taiko, choir, and the trombones keep quoting
// Artie's own theme ("Tough Crowd", transposed) right behind him.
//
// F-sharp minor, 152. 36 bars: a 4-bar intro (once: the cart clacking out of the station, faster and faster, a
// timpani roll, the brass swelling on C#7), then the 32-bar loop:
//   A   (8)  F#m - D - E, the trumpet's hook (up from the C-sharp to the B, over the top), a half cadence on C#7.
//   A2  (8)  the hook, then up to B minor, D/E, the C#7 sus resolving.
//   B   (8)  A major, broad: A - E/G# - F#m - C#m - D - A/C# - Bm7 - E7, an orchestra hit in.
//   C   (8)  the Neapolitan (G major against F-sharp minor: Indy's), back and forth, D - E, C#7 and the run up.
// ARRANGEMENTS: ride (Meathead alone), chase (Artie on his tail).

const V3: Record<string, string[]> = {
  'F#m': ['4c+', '4f+', '4a'], D: ['4d', '4f+', '4a'], E: ['4e', '4g+', '4b'], Bm: ['4d', '4f+', '4b'], 'C#7': ['4c+', '4f', '4g+', '4b'],
  'D/E': ['4d', '4f+', '4a'], 'C#7sus': ['4c+', '4f+', '4g+', '4b'], A: ['4c+', '4e', '4a'], 'E/G#': ['4e', '4g+', '4b'], 'C#m': ['4c+', '4e', '4g+'],
  'A/C#': ['4c+', '4e', '4a'], Bm7: ['4d', '4f+', '4a', '4b'], E7: ['4d', '4e', '4g+', '4b'], G: ['4d', '4g', '4b'],
};
const R3: Record<string, string> = {
  'F#m': 'f+', D: 'd', E: 'e', Bm: 'b', 'C#7': 'c+', 'D/E': 'e', 'C#7sus': 'c+', A: 'a', 'E/G#': 'g+', 'C#m': 'c+', 'A/C#': 'c+', Bm7: 'b', E7: 'e', G: 'g',
};
const MC_A: Bar[] = ['F#m', 'F#m', 'D', 'E', 'F#m', 'F#m', 'Bm', 'C#7'];
const MC_A2: Bar[] = ['F#m', 'F#m', 'D', 'E', 'Bm', 'D/E', 'C#7sus', 'C#7'];
const MC_B: Bar[] = ['A', 'E/G#', 'F#m', 'C#m', 'D', 'A/C#', 'Bm7', 'E7'];
const MC_C: Bar[] = ['G', 'F#m', 'G', 'F#m', 'D', 'E', 'C#7sus', 'C#7'];
const MC_LOOP: Bar[] = [...MC_A, ...MC_A2, ...MC_B, ...MC_C];

const MC_HOOK = ['o5 f+4. c+8 f+8 g+8 a8 b8', 'o6 c+4 o5 a4 f+2', 'o5 f+4. d8 f+8 a8 o6 d8 c+8', 'o5 b2 g+4 e4'];
const MC_TA = [...MC_HOOK, 'o5 f+4. c+8 f+8 g+8 a8 b8', 'o6 c+4 e4 d8 c+8 o5 b8 a8', 'o5 b4. a8 g+8 f+8 e8 d8', 'o5 f2 g+4 b4'];
const MC_TA2 = [...MC_HOOK, 'o5 d4. f+8 b8 o6 c+8 d8 e8', 'o6 f+2 e4 d4', 'o6 c+4. o5 b8 a4 f+4', 'o5 f4 g+4 b4 o6 c+4'];
const MC_TB = ['o5 e2 a4. b8', 'o6 c+4 o5 b8 a8 b2', 'o5 a2 f+4. g+8', 'o5 a4 g+8 f+8 e2', 'o5 f+2 a4. o6 d8', 'o6 c+4 o5 b8 a8 e4 a4', 'o5 b4. a8 f+4 d4', 'o5 e4 g+4 b4 o6 d4'];
const MC_TC = ['o5 g8 a8 b8 g8 o6 d4 o5 b4', 'o5 a8 g+8 f+8 f8 f+2', 'o5 b8 o6 d8 g8 f+8 e4 d4', 'o6 c+2 o5 a2', 'o5 a8 b8 o6 c+8 d8 e4 f+4', 'o6 e2 d4 c+4', 'o6 c+2 o5 b2', 'o5 f8 f+8 g+8 a8 b8 o6 c+8 d8 f8'];
const MC_TUNE = [...MC_TA, ...MC_TA2, ...MC_TB, ...MC_TC];
/** Artie's theme's first two bars ("Tough Crowd", jungleBosses.ts), down to F-sharp minor, on the trombones. */
const ARTIE_QUOTE = ['o4 c+8 c+8 r8 c+8 _b-2 e4 f+4', 'o4 a4. g+8 f+8 e8 c+4'];

/** The strings' gallop: the chord's bottom and middle notes, long-short-short. */
const gallop = (prog: Bar[]) => bars(prog, (c, b) => {
  const v = V3[c], g = (n: string) => `${nt(n, '8')} ${nt(n, '16')} ${nt(n, '16', '?')}`;
  const toks = [g(v[0]), g(v[2] ?? v[1]), g(v[0]), g(v[2] ?? v[1])];
  return toks.slice(0, b).join(' ');
});
const mcBass = (prog: Bar[]) => bars(prog, (c, b) => { const r = R3[c]; const t = [`o2 ${r}8`, `o2 ${r}8`, `o3 ${r}8`, `o2 ${r}8`, `o2 ${r}8`, `o2 ${r}8`, `o3 ${r}8`, `o2 ${r}8`]; return cut(t, b); });
const mcPads = (prog: Bar[]) => bars(prog, (c, b) => chord(V3[c], b === 4 ? '1' : '2'));
const TRAIN = '{kh}16 ?h16 h16 ?h16 {sh}16 ?h16 h16 ?h16 {kh}16 ?h16 {kh}16 ?h16 {sh}16 ?h16 h16 h16';
const TRAIN_IN = '{kx}16 ?h16 h16 ?h16 {sh}16 ?h16 h16 ?h16 {kh}16 ?h16 {kh}16 ?h16 {sh}16 ?h16 h16 h16';
const TRAIN_FILL = '{kh}16 ?h16 h16 ?h16 {sh}16 ?h16 h16 ?h16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 (tom4)16';

export const SEQ_MINE_CART: Song = {
  title: 'Unfriendly Guests',
  bpm: 152,
  loopFrom: 16,
  reverb: 'cave',
  reverbMix: 0.6,
  delay: { beats: 0.75, feedback: 0.2, tone: 2400 },
  parts: {
    trumpet: { inst: 'trumpet', pan: 0, rev: 0.2, dly: 0.08, mml: join(rest(4), ['_v105'], MC_TUNE) },
    xylo: { inst: 'xylophone', pan: 0.4, rev: 0.2, vol: 0.45, mml: join(rest(4), ['_v85'], up(MC_TA), rest(16), ['_v80'], up(MC_TC)) },
    brass: { inst: 'brass', pan: -0.1, rev: 0.25, vol: 0.75, only: ['chase'], mml: join(['r1', 'r1', 'r1', `_e40 _e127/1 _v100 ${chord(V3['C#7'], '1')}`], ['_v105'], up(MC_TUNE, -1)) },
    trombone: { inst: 'trombone', pan: -0.4, rev: 0.22, vol: 0.8, only: ['chase'], mml: join(rest(4), ['_v110'], ARTIE_QUOTE, ['r1', 'r1'], ARTIE_QUOTE, ['r1', 'r1'], ARTIE_QUOTE, rest(6), rest(16)) },
    horns: {
      inst: 'horn', pan: 0.3, rev: 0.3, vol: 0.6,
      mml: join(
        ['_v70 o4 c+1', 'o4 c+1', 'o4 c+1', '_e50 _e127/1 o4 f1'],
        ['_v80 o4 c+1', 'o4 c+1', 'o4 d1', 'o4 e1', 'o4 c+1', 'o4 c+1', 'o4 d1', 'o4 f1'],
        ['o4 c+2 e2', 'o4 f+2 e2', 'o4 d2 f+2', 'o4 e2 g+2', 'o4 f+2 d2', 'o4 e2 d2', 'o4 c+2 o3 b2', 'o4 c+1'],
        ['_v90 o4 c+1', 'o4 b1', 'o4 a1', 'o4 g+1', 'o4 a1', 'o4 a1', 'o4 f+2 a2', 'o4 g+2 b2'],
        ['o4 b1', 'o4 a1', 'o4 b1', 'o4 a1', 'o4 a1', 'o4 b1', 'o4 b1', 'o4 b1'],
      ),
    },
    strings: { inst: 'strings', pan: -0.2, rev: 0.25, vol: 0.55, mml: join(['_v60 o3 f+1', 'o3 f+1', '_v75 ' + gallop(['F#m'])[0], gallop(['C#7'])[0]], ['_v90'], gallop(MC_LOOP)) },
    choir: { inst: 'choir', pan: 0, rev: 0.4, vol: 0.5, only: ['chase'], mml: join(rest(4), rest(16), ['_v85'], mcPads(MC_B), mcPads(MC_C)) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.8, mml: join(['r1', 'r1', '_v90 ' + mcBass(['F#m'])[0], mcBass(['C#7'])[0]], ['_v100'], mcBass(MC_LOOP)) },
    clack: { inst: 'woodblock', drums: true, pan: 0.2, rev: 0.25, vol: 0.6, mml: join(['_v70 e4 e4 e4 e4', 'e4 e4 e8 e8 e8 e8', '_v80 e8 e8 e8 e8 e8 e8 e8 e8', '_v90 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16'], rest(32)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.1, vol: 0.7,
      mml: join(
        ['r1', 'r1', 'r1', '_v50 s16 s16 s16 s16 _v70 s16 s16 s16 s16 _v90 s16 s16 s16 s16 _v110 s16 s16 (tom1)16 (tom4)16'],
        ['_v95 ' + TRAIN_IN], rep(TRAIN, 6), [TRAIN_FILL], [TRAIN_IN], rep(TRAIN, 6), [TRAIN_FILL],
        [TRAIN_IN], rep(TRAIN, 6), [TRAIN_FILL], [TRAIN_IN], rep(TRAIN, 6), [TRAIN_FILL],
      ),
    },
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.75, only: ['chase'], mml: join(rest(4), ['_v100'], rep('f4 r8 f8 f4 r4', 24), rep('f8 f8 r4 f8 f8 r4', 8)) },
    timpani: {
      inst: 'timpani', pan: 0.1, rev: 0.3, vol: 0.65,
      mml: join(
        ['r1', 'r1', 'o2 _v40 [f+32]8 _v55 [f+32]8 _v70 [f+32]8 _v85 [f+32]8', 'o2 _v95 [c+32]8 [c+32]8 [c+32]8 _v115 [c+32]8'],
        ['_v105 o2 f+4 r2.'], rest(7), ['o2 f+4 r2.'], rest(7), ['o2 a4 r2.'], rest(7), ['o2 g4 r2.', 'o2 f+4 r2.', 'o2 g4 r2.', 'o2 f+4 r2.', 'r1', 'r1', 'o2 c+4 r2.', 'o2 _v70 [c+32]8 _v85 [c+32]8 _v100 [c+32]8 _v115 [c+32]8'],
      ),
    },
    hit: { inst: 'orchhit', pan: 0, rev: 0.3, vol: 0.6, mml: join(rest(4), rest(16), ['_v100 o4 a4 r2.'], rest(7), ['o4 g4 r2.'], rest(7)) },
  },
  arrangements: {
    ride: { vol: { horns: 0.8 } },
    chase: { vol: { trumpet: 1.05, horns: 1.2, kit: 1.1, xylo: 0.8 } },
  },
};

// =====================================================================================================================
// "BRING THE HOUSE DOWN" (seq:temple-collapse): up through the temple's roof, Artie having his say on it, then the
// roof going in after him, left to right, and off the edge. Till he's tumbled off it.
//
// E-flat minor, 176, 16 bars: the violins running (up the E-flat minor arpeggio to the D-natural, down chromatically
// over C-flat), brass stabs in threes, choir, taiko, timpani on every bar, orchestra hits as the tiles go.
//   1-8   Ebm - Cb - Abm - Bb7 - Ebm - Cb - F half-dim - Bb7b9
//   9-16  Gb - Db/F - Ebm - Cb - Abm - Eb/G (a flash of major) - Cb - Bb7
// ARRANGEMENTS: artie (Artie's say on the roof, before it goes: the bass, the timpani and the horns, low), run.

const V4: Record<string, string[]> = {
  Ebm: ['4e-', '4g-', '4b-'], Cb: ['4e-', '4g-', '4b'], Abm: ['4e-', '4a-', '4b'], Bb7: ['4d', '4f', '4a-', '4b-'], Bb7b9: ['4d', '4f', '4a-', '4b'],
  Fhd: ['4e-', '4f', '4a-', '4b'], Gb: ['4d-', '4g-', '4b-'], 'Db/F': ['4d-', '4f', '4a-'], 'Eb/G': ['4e-', '4g', '4b-'],
};
const R4: Record<string, string> = { Ebm: '2e-', Cb: '1b', Abm: '2a-', Bb7: '2b-', Bb7b9: '2b-', Fhd: '2f', Gb: '2g-', 'Db/F': '2f', 'Eb/G': '2g' };
const TC_PROG: Bar[] = ['Ebm', 'Cb', 'Abm', 'Bb7', 'Ebm', 'Cb', 'Fhd', 'Bb7b9', 'Gb', 'Db/F', 'Ebm', 'Cb', 'Abm', 'Eb/G', 'Cb', 'Bb7'];
const TC_TUNE = [
  'o5 e-8 g-8 b-8 o6 e-4 d4 o5 b-8', 'o5 b4. b-8 a-8 g-8 f8 e-8', 'o5 e-4 b4 a-4 g-4', 'o5 d4 f4 a-4 o6 d4',
  'o5 e-8 g-8 b-8 o6 e-4 d4 o5 b-8', 'o5 b4. b-8 a-8 g-8 f8 e-8', 'o5 f8 a-8 b8 o6 e-8 d8 o5 b8 a-8 f8', 'o5 d8 f8 a-8 b8 o6 d4 o5 b-4',
  'o5 g-4. b-8 o6 d-4 e-4', 'o6 f4 e-4 d-4 o5 a-4', 'o5 b-4. g-8 e-4 g-4', 'o5 b2 g-4 e-4',
  'o5 a-4. b8 o6 e-4 a-4', 'o6 g4. f8 e-4 o5 b-4', 'o6 e-4 g-4 f4 e-4', 'o6 d4 o5 b-4 a-4 f4',
];
const tcStabs = (prog: Bar[]) => bars(prog, c => { const x = chord(V4[c], ''); return `${x}8 r8 r8 ${x}8 r8 ${x}8 r4`; });
const tcBass = (prog: Bar[]) => bars(prog, c => { const r = R4[c]; return [r, r, hi(r), r, r, r, hi(r), r].map(n => nt(n, '8')).join(' '); });
const tcPads = (prog: Bar[]) => bars(prog, c => chord(V4[c], '1'));
const GALLOP = '{kh}8 h8 {sh}8 h8 {kh}8 h8 {sh}8 {kh}8';
const GALLOP_X = '{kx}8 h8 {sh}8 h8 {kh}8 h8 {sh}8 {kh}8';
const GALLOP_FILL = '{kh}8 h8 {sh}8 h8 s16 s16 s16 s16 (tom2)16 (tom2)16 (tom4)16 (tom4)16';

export const SEQ_TEMPLE_COLLAPSE: Song = {
  title: 'Bring the House Down',
  bpm: 176,
  reverb: 'hall',
  reverbMix: 0.8,
  parts: {
    violins: { inst: 'strings', pan: 0.2, rev: 0.3, mml: join(['_v105'], TC_TUNE) },
    brass: { inst: 'brass', pan: -0.15, rev: 0.25, vol: 0.7, mml: join(['_v105'], tcStabs(TC_PROG)) },
    horns: { inst: 'horn', pan: -0.35, rev: 0.32, vol: 0.6, mml: join(['_v85 o4 g-1', 'o4 g-1', 'o4 e-1', 'o4 d1', 'o4 g-1', 'o4 g-1', 'o4 e-1', 'o4 d1', 'o4 d-1', 'o4 d-1', 'o4 e-1', 'o4 e-1', 'o4 e-1', 'o4 e-1', 'o4 e-1', 'o4 d1']) },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.5, mml: join(['_v85'], tcPads(TC_PROG)) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.8, mml: join(['_v100'], tcBass(TC_PROG)) },
    timpani: { inst: 'timpani', pan: 0.1, rev: 0.3, vol: 0.7, mml: join(['_v110'], TC_PROG.map(c => `o2 ${R4[c as string].slice(1)}4 r2.`)) },
    kit: { inst: 'kick', drums: true, rev: 0.12, vol: 0.7, mml: join(['_v100 ' + GALLOP_X], rep(GALLOP, 2), [GALLOP_FILL], [GALLOP_X], rep(GALLOP, 2), [GALLOP_FILL], [GALLOP_X], rep(GALLOP, 2), [GALLOP_FILL], [GALLOP_X], rep(GALLOP, 2), [GALLOP_FILL]) },
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.75, mml: join(['_v105'], rep('f4 r4 f4 r4', 7), ['f8 f8 f8 f8 f4 f4'], rep('f4 r4 f4 r4', 7), ['f8 f8 f8 f8 f8 f8 f4']) },
    hit: { inst: 'orchhit', pan: 0, rev: 0.3, vol: 0.55, mml: join(['_v100 o4 g-4 r2.'], rest(3), ['o4 g-4 r2.'], rest(3), ['o4 g-4 r2.'], rest(3), ['o4 b4 r2.'], rest(3)) },
  },
  arrangements: {
    run: {},
    artie: { solo: ['bass', 'timpani', 'horns', 'taiko'], vol: { bass: 0.75, taiko: 0.45, horns: 0.7 }, level: 0.75 },
  },
};
