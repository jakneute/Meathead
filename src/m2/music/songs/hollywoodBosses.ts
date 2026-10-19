// HOLLYWOOD LAND's fights: the Ensemble Cast (the Revengers, the warehouse's sub-boss) and Stuntman Steve (the land's
// boss, on his stunt stage). The land's theme and its set pieces are in hollywood.ts.
//
// ---- "REVENGERS: RESEMBLE" (boss:ensemble-cast) ----
// Dozens of A-listers in costume dogpiling him, sure they're superheroes: an overblown franchise main title, the
// Marvel fanfare as a parody of itself. A low brass ostinato (da-da-dum da-da-da-da DUM) on trombones and tuba, the
// strings' spiccato sixteenths, piano octaves, taiko and a rock kit, the brass section on a fanfare that leaps a fifth
// ("RE-VEN-GERS"), and a "RE-SEM-BLE!" stinger at the end of every phrase, three hits with the band stopped. Franchise
// inflation: every eight bars it lurches up a key for the next phase (E-flat, PHASE TWO in E, PHASE THREE in F, the
// trumpets and choir and glockenspiel piling on), and then a self-important "sacrifice" bridge in D-flat on the
// violins and choir, the Bb7 bringing it back to E-flat to do it all again.
// E-flat major, 144. 36 bars: a 4-bar logo (once: the strings swooping up, the low brass's BWAAAM on E-flat, then
// C-flat, timpani, the choir swelling), then:
//   P1 (8)  Eb - Bb/D - Cm - Ab - Eb/G - Ab - Bbsus - Bb: the brass's fanfare, the ostinato.
//   P2 (8)  the same in E: the violins' counterline, the choir's pads.
//   P3 (8)  the same in F: the trumpets an octave up, the choir singing the tune, the glockenspiel.
//   B  (8)  D-flat: Db - Ab/C - Bbm7 - Gb - Db/F - Gb - Absus - Bb7: the violins and the choir, the snare rolling.
// ARRANGEMENTS: main, intro (CAPTAIN AMERICANO's entrance: the brass, the low brass, the strings, the choir, the
// timpani and the hits; no kit).
//
// ---- "TWO SECONDS OF FAME" (boss:stuntman-steve) ----
// A washed-up 80s Cannon-films stuntman, a coward in a yellow suit: a cheesy hair-metal / action-movie power anthem
// for him (Stan Bush, a montage, a keytar). The tune on a keytar (the saw lead), palm-muted chugs in the verse and
// power chords in the chorus, a finger bass in eighths, analog synth brass, a PWM pad, gang "HEY!"s, a big room on the
// kit, Simmons-ish tom fills, and the montage's wailing alto sax solo. The joke: the pre-chorus builds and builds and
// then, where the drop should be, it sidesteps: everything stops for a bar but a woodblock tiptoeing and one timid
// keytar note (that's his whole act). And the last chorus goes up a whole step, because of course it does.
// A major, 132. 40 bars: a 4-bar fanfare (once: "STE-VE!" on the synth brass, power-chord hits, a tom roll), then:
//   V  (8)  A5 - G5 D5 - A5 - G5 D5 - F#m - D - E - E: the keytar's riff over the chugs, the gang HEYs.
//   P  (4)  Bm - D - E - (the sidestep).
//   C  (8)  A - E/G# - F#m - D - A - E - D - E: the anthem, power chords, the choir.
//   S  (8)  F#m - D - E - A - F#m - D - E - F#7: the sax solo, F#7 the pivot.
//   C2 (8)  the chorus in B (E at the end: the IV in B, the V back home in A).
// ARRANGEMENTS: main, intro (his entrance, the crowd eating up the fling: the synth brass, the pad, the bass, the
// keytar, the power chords; no kit).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, chord, bars } from './jungle';

const ROLL = (n: string) => `o2 _v55 [${n}32]8 _v75 [${n}32]8 _v95 [${n}32]8 _v115 [${n}32]8`;

// =====================================================================================================================
// REVENGERS: RESEMBLE

const EV: Record<string, string[]> = {
  Eb: ['4e-', '4g', '4b-'], B: ['3b', '4d+', '4f+'], Bb: ['4d', '4f', '4b-'], 'Bb/D': ['4d', '4f', '4b-'], Cm: ['4c', '4e-', '4g'], Ab: ['4c', '4e-', '4a-'],
  'Eb/G': ['4e-', '4g', '4b-'], Bbsus: ['4e-', '4f', '4b-'], Db: ['4d-', '4f', '4a-'], 'Ab/C': ['4c', '4e-', '4a-'], Bbm7: ['3a-', '3b-', '4d-', '4f'],
  Gb: ['4d-', '4g-', '4b-'], 'Db/F': ['4d-', '4f', '4a-'], Absus: ['4d-', '4e-', '4a-'], Bb7: ['4d', '4f', '4a-', '4b-'],
};
const ER: Record<string, [string, string]> = {
  Eb: ['e-', 'b-'], B: ['b', 'f+'], Bb: ['b-', 'f'], 'Bb/D': ['d', 'b-'], Cm: ['c', 'g'], Ab: ['a-', 'e-'], 'Eb/G': ['g', 'e-'], Bbsus: ['b-', 'f'],
  Db: ['d-', 'a-'], 'Ab/C': ['c', 'a-'], Bbm7: ['b-', 'f'], Gb: ['g-', 'd-'], 'Db/F': ['f', 'd-'], Absus: ['a-', 'e-'], Bb7: ['b-', 'f'],
};
const E_IN: Bar[] = ['Eb', 'B', 'Eb', 'Bb'];
const E_P: Bar[] = ['Eb', 'Bb/D', 'Cm', 'Ab', 'Eb/G', 'Ab', 'Bbsus', 'Bb'];
const E_B: Bar[] = ['Db', 'Ab/C', 'Bbm7', 'Gb', 'Db/F', 'Gb', 'Absus', 'Bb7'];

/** A phase: its bars transposed (the franchise's next installment, a key up). */
const ph = (k: number, bs: string[]) => [`_k${k}`, ...bs];
/** The three phases of something, then the bridge at pitch. */
const phases = (p: string[], b: string[]) => [...ph(0, p), ...ph(1, p), ...ph(2, p), ...ph(0, b)];

const ePads = (prog: Bar[]) => bars(prog, (c, b) => chord(EV[c], b === 4 ? '1' : '2'));
const eOst = (prog: Bar[]) => bars(prog, c => { const v = EV[c]; return [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 2, 1, 0, 1].map(k => nt(v[k], '16')).join(' '); });
/** The low brass: da-da-dum da-da-da-da DUM. */
const eLow = (prog: Bar[]) => bars(prog, c => { const [r, f] = ER[c]; return `o2 ${r}8 ${r}16 ${r}16 ${r}8 ${r}8 ${r}8 ${r}16 ${r}16 ${f}4`; });
const eOct = (prog: Bar[]) => bars(prog, c => { const r = ER[c][0]; return Array.from({ length: 4 }, () => `o3 ${r}8 o4 ${r}8`).join(' '); });

const E_HOOK = ['o4 e-4. b-8 o5 e-2', 'o5 d8 e-8 f8 d8 o4 b-2', 'o4 g4. o5 c8 e-4 g4', 'o5 f2 e-4 c4', 'o4 e-4. b-8 o5 e-4 g4', 'o5 a-2 g4 f4', 'o5 e-2 f2', 'o5 d2 r4 o4 b-4'];
const E_CTR = ['o5 g1', 'o5 f1', 'o5 g1', 'o5 a-1', 'o5 b-1', 'o5 a-2 o6 c2', 'o5 b-1', 'o5 a-2 f2'];
const E_BMEL = ['o5 f2. e-8 d-8', 'o5 e-2 c2', 'o5 d-4. c8 d-4 f4', 'o5 b-1', 'o5 a-2. g-8 f8', 'o5 g-2 b-2', 'o5 d-2 e-2', 'o5 d2 f4 a-4'];
/** The stinger at the end of each phase: RE-SEM-BLE! */
const E_STING = (x: string) => `${x}8 r8 ${x}8 r8 ${x}4 r4`;

const EK = '{kh}8 h8 {sh}8 h8 k8 {kh}8 {sh}8 h8';
const EK_IN = '{kx}8 h8 {sh}8 h8 k8 {kh}8 {sh}8 h8';
const EK_STING = '{kx}8 r8 {kx}8 r8 {kx}4 s16 s16 s16 s16';
const EK_B = '{ki}4 i4 {si}4 i4';
const EK_B_IN = '{kx}4 i4 {si}4 i4';
const EK_ROLL = '_v60 [s16]4 _v80 [s16]4 _v100 [s16]4 _v120 [s16]4';
const ESWOOP = '_g2 o3 b-4 o6 b-2. _g0';

export const BOSS_ENSEMBLE: Song = {
  title: 'Revengers: Resemble',
  bpm: 144,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 1,
  delay: { beats: 0.75, feedback: 0.22, tone: 2600 },
  parts: {
    hook: { inst: 'brass', pan: 0, rev: 0.3, dly: 0.05, mml: join(rest(4), ['_v110'], ph(0, E_HOOK), ph(1, E_HOOK), ['_v115'], ph(2, E_HOOK), ['_k0'], rest(8)) },
    trumpet: { inst: 'trumpet', pan: 0.2, rev: 0.3, vol: 0.6, mml: join(rest(20), ['_v105'], ph(2, up(E_HOOK)), ['_k0'], rest(8)) },
    glock: { inst: 'glock', pan: 0.4, rev: 0.35, vol: 0.5, mml: join(rest(20), ['_v90'], ph(2, up(E_HOOK)), ['_k0'], rest(8)) },
    violins: { inst: 'strings', pan: 0.3, rev: 0.4, vol: 0.65, mml: join(rest(12), ['_v85'], ph(1, E_CTR), ['_v95'], ph(2, up(E_HOOK)), ['_v105'], ph(0, up(E_BMEL))) },
    choir: { inst: 'choir', pan: 0, rev: 0.5, vol: 0.55, mml: join(['_v75'], ePads(E_IN), rest(8), ['_v80'], ph(1, ePads(E_P)), ['_v100'], ph(2, E_HOOK), ['_v100'], ph(0, E_BMEL)) },
    horns: { inst: 'horn', pan: -0.3, rev: 0.4, vol: 0.6, mml: join(['_v90'], ePads(E_IN), ['_v85'], phases(ePads(E_P), ePads(E_B))) },
    strings: { inst: 'strings', pan: -0.2, rev: 0.3, vol: 0.45, mml: join(['q6 _v70'], ePads(E_IN), ['_v95'], ph(0, eOst(E_P)), ph(1, eOst(E_P)), ph(2, eOst(E_P)), ['_v80'], ph(0, eOst(E_B))) },
    lowbrass: { inst: 'trombone', pan: -0.1, rev: 0.25, vol: 0.7, mml: join(['_v120 o2 e-1', 'o1 b1', 'o2 e-1', 'o2 b-2 r2'], ['q6 _v105'], phases(eLow(E_P), eLow(E_B))) },
    tuba: { inst: 'tuba', pan: 0, rev: 0.15, vol: 0.55, tr: -12, mml: join(['_v115 o2 e-1', 'o1 b1', 'o2 e-1', 'o2 b-2 r2'], ['q6 _v100'], phases(eLow(E_P), eLow(E_B))) },
    piano: { inst: 'piano', pan: 0.25, rev: 0.25, vol: 0.45, mml: join(rest(4), ['_v90'], phases(eOct(E_P), eOct(E_B))) },
    swoop: { inst: 'strings', pan: 0.35, rev: 0.45, vol: 0.45, mml: join(['_v95 _g2 o3 e-4 o6 e-2. _g0'], rest(10), [ESWOOP], rest(7), [ESWOOP], rest(7), [ESWOOP], rest(8)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.2, vol: 0.7, not: ['intro'],
      mml: join(['r1', 'r1', 'r1', EK_ROLL], ['_v105'], [EK_IN, ...rep(EK, 6), EK_STING], [EK_IN, ...rep(EK, 6), EK_STING], ['_v110'], [EK_IN, ...rep(EK, 6), EK_STING], ['_v95'], [EK_B_IN, ...rep(EK_B, 6), EK_ROLL]),
    },
    taiko: { inst: 'taiko', drums: true, rev: 0.35, vol: 0.7, not: ['intro'], mml: join(rest(4), ['_v105'], rep('f4 r8 f8 r4 f4', 24), rep('f2 r2', 7), ['f8 f8 f8 f8 f4 f4']) },
    timpani: {
      inst: 'timpani', pan: 0.1, rev: 0.35, vol: 0.65,
      mml: join(
        ['_v115 o2 e-4 r2.', 'o2 b4 r2.', 'o2 e-4 r2.', ROLL('b-')],
        ...[0, 1, 2].map(k => [`_k${k} _v110 o2 e-4 r2.`, ...rest(6), 'o2 b-8 r8 b-8 r8 b-4 r4']),
        ['_k0 o2 d-4 r2.'], rest(6), [ROLL('b-')],
      ),
    },
    hits: {
      inst: 'orchhit', pan: 0, rev: 0.4, vol: 0.5,
      mml: join(['_v110 o4 e-4 r2.', 'o3 b4 r2.', 'o4 e-4 r2.', 'o4 b-4 r2.'], ...[0, 1, 2].map(k => [`_k${k} o4 e-4 r2.`, ...rest(6), E_STING('o4 b-')]), ['_k0 o4 d-4 r2.'], rest(7)),
    },
  },
  arrangements: {
    main: {},
    intro: { solo: ['hook', 'lowbrass', 'tuba', 'strings', 'choir', 'timpani', 'horns', 'swoop', 'hits'], level: 0.85 },
  },
};

// =====================================================================================================================
// TWO SECONDS OF FAME

const SV: Record<string, string[]> = {
  A5: ['3a', '4e', '4a'], G5: ['3g', '4d', '4g'], D5: ['3a', '4d', '4a'], 'F#m': ['4c+', '4f+', '4a'], D: ['4d', '4f+', '4a'], E: ['3b', '4e', '4g+'],
  Bm: ['4d', '4f+', '4b'], A: ['4c+', '4e', '4a'], 'E/G#': ['3b', '4e', '4g+'], 'F#7': ['4c+', '4e', '4f+', '4a+'],
};
const SR: Record<string, string> = { A5: 'a', G5: 'g', D5: 'd', 'F#m': 'f+', D: 'd', E: 'e', Bm: 'b', A: 'a', 'E/G#': 'g+', 'F#7': 'f+' };
const S_IN: Bar[] = ['A', 'A', 'D', 'E'];
const S_V: Bar[] = ['A5', ['G5', 'D5'], 'A5', ['G5', 'D5'], 'F#m', 'D', 'E', 'E'];
const S_P3: Bar[] = ['Bm', 'D', 'E'];
const S_C: Bar[] = ['A', 'E/G#', 'F#m', 'D', 'A', 'E', 'D', 'E'];
const S_S: Bar[] = ['F#m', 'D', 'E', 'A', 'F#m', 'D', 'E', 'F#7'];
/** The sidestep: a bar of nothing. */
const SIDESTEP = 'r1';
/** The last chorus: up a whole step to B, but its last bar at pitch (E: the IV in B turned the V back home in A). */
const c2 = (bs: string[]) => ['_k2', ...bs.slice(0, 7), '_k0', bs[7]];

const sx = (c: string, len = '') => chord(SV[c], len);
const sPads = (prog: Bar[]) => bars(prog, (c, b) => sx(c, b === 4 ? '1' : '2'));
const sStabs = (prog: Bar[]) => bars(prog, (c, b) => { const x = sx(c); return b === 4 ? `${x}8 r8 r8 ${x}8 r2` : `${x}8 r8 r8 ${x}8`; });
const sAnthem = (prog: Bar[]) => bars(prog, (c, b) => { const x = sx(c); return b === 4 ? `${x}4. ${x}8 r4 ${x}4` : `${x}4. ${x}8`; });
const s8 = (oct: number) => (prog: Bar[]) => bars(prog, (c, b) => `o${oct} ${Array.from({ length: b * 2 }, () => `${SR[c]}8`).join(' ')}`);
const sGtr = s8(2), sBass = s8(1);

const SL_V = [
  'o5 a8 a8 o6 c+8 o5 a8 e8 a8 o6 c+8 e8',
  'o6 d4 o5 b8 g8 a4 f+8 d8',
  'o5 a8 a8 o6 c+8 o5 a8 e8 a8 o6 c+8 e8',
  'o6 d8 e8 d8 o5 b8 a2',
  'o5 f+4 a4 o6 c+4. o5 b8',
  'o5 a4 f+4 d2',
  'o5 e8 f+8 g+8 a8 b8 o6 c+8 d8 e8',
  'o6 e2 r2',
];
const SL_P = ['o5 f+4 b4 o6 d4 c+4', 'o5 b4 a4 f+4 a4', 'o5 g+4 b4 o6 e4 g+4', '_v60 r2. o5 e16 r16 r8 _v110'];
const SL_C = ['o6 c+4. o5 b8 a4 o6 e4', 'o6 e4. d8 c+4 o5 b4', 'o5 a4. b8 o6 c+4 e4', 'o6 f+2 e4 d4', 'o6 c+4. o5 b8 a4 o6 e4', 'o6 g+4. f+8 e4 d4', 'o6 f+4 e4 d4 c+4', 'o5 b2 g+4 e4'];
const SS_SAX = [
  'o5 _b-2 c+4. o4 b8 a4 f+4',
  'o4 a8 b8 o5 d8 e8 f+4 _f-3 e4',
  'o5 g+8 f+8 e8 d8 o4 b4. g+8',
  'o4 a2 o5 c+4 e4',
  'o5 f+8 a8 f+8 e8 c+8 e8 c+8 o4 b8',
  'o4 a4 o5 d4 f+4 a4',
  'o5 _b-2 b2 g+4 e4',
  'o5 a+4 c+4 e4 f+4',
];
const S_HEY = ['r1', 'r2. o4 {a >d f+}8 r8', 'r1', 'r2. o4 {a >d f+}8 r8', 'r1', 'r1', 'r1', 'r2. o3 {b >e g+}8 r8'];

const SK = '{kh}8 h8 {sh}8 h8 k8 k8 {sh}8 h8';
const SK_IN = '{kx}8 h8 {sh}8 h8 k8 k8 {sh}8 h8';
const SK_P = '{kh}8 h8 {sh}8 h8 {kh}8 h8 {sh}8 h8';
const SK_BUILD = '{ks}8 s8 {ks}8 s8 {ks}16 s16 s16 s16 s16 s16 s16 s16';
const SK_TIPTOE = 'r2. e16 r16 e16 r16';
const SK_C = '{ki}8 i8 {si}8 i8 {ki}8 {ki}8 {si}8 i8';
const SK_C_IN = '{kx}8 i8 {si}8 i8 {ki}8 {ki}8 {si}8 i8';
const SK_S = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 o8';
const SK_S_IN = '{kx}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 o8';
const SK_FILL = '{kh}8 h8 {sh}8 h8 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16';
const SK_ROLL = '_v70 s16 s16 s16 s16 _v90 s16 s16 s16 s16 _v110 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16';

export const BOSS_STEVE: Song = {
  title: 'Two Seconds of Fame',
  bpm: 132,
  loopFrom: 16,
  reverb: 'room',
  reverbMix: 0.85,
  delay: { beats: 0.75, feedback: 0.3, tone: 3200 },
  parts: {
    lead: { inst: 'sawlead', pan: 0, rev: 0.25, dly: 0.18, cho: 0.25, mml: join(rest(4), ['_v105'], SL_V, ['_v105'], SL_P, ['_v110'], SL_C, rest(8), c2(SL_C)) },
    sax: { inst: 'sax', pan: 0.1, rev: 0.3, dly: 0.15, mml: join(rest(24), ['_v110'], SS_SAX, rest(8)) },
    synbrass: {
      inst: 'synthbrass', pan: -0.2, rev: 0.25, vol: 0.6,
      mml: join(
        ['_v115 o4 {e a >c+}4. {e a >c+}8 r2', 'o4 {a >c+ e}4. {a >c+ e}8 r2', 'o4 {f+ a >d}2 {a >d f+}2', 'o4 {g+ b >e}1'],
        ['q5 _v100'], sStabs(S_V), ['q8 _v85'], sPads(S_P3), [SIDESTEP], ['q6 _v105'], sAnthem(S_C), ['q8 _v75'], sPads(S_S), ['q6 _v110'], c2(sAnthem(S_C)),
      ),
    },
    pad: { inst: 'pwm', pan: 0.2, rev: 0.4, vol: 0.35, mml: join(['_v85'], sPads(S_IN), ['_v70'], sPads(S_V), sPads(S_P3), [SIDESTEP], ['_v80'], sPads(S_C), sPads(S_S), c2(sPads(S_C))) },
    power: {
      inst: 'powerchord', pan: -0.35, rev: 0.12, vol: 0.6,
      mml: join(
        ['q6 _v115 o2 a4. a8 r2', 'o2 a4. a8 r2', 'o2 d2 d2', `o2 ${'e8 '.repeat(8).trim()}`],
        ['@chug _v105'], sGtr(S_V), ['@ _v105'], sGtr(S_P3), [SIDESTEP], ['_v110'], sGtr(S_C), sGtr(S_S), c2(sGtr(S_C)),
      ),
    },
    bass: {
      inst: 'bass', pan: 0, rev: 0.06, vol: 0.8,
      mml: join(['q6 _v110 o1 a4. a8 r2', 'o1 a4. a8 r2', 'o1 d2 d2', `o1 ${'e8 '.repeat(8).trim()}`], ['_v100'], sBass(S_V), sBass(S_P3), [SIDESTEP], ['_v105'], sBass(S_C), sBass(S_S), c2(sBass(S_C))),
    },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.5, mml: join(rest(4), ['q3 _v115'], S_HEY, rest(4), ['q8 _v90'], sPads(S_C), rest(8), ['_v100'], c2(sPads(S_C))) },
    kit: {
      inst: 'kick', drums: true, rev: 0.3, vol: 0.75, not: ['intro'],
      mml: join(
        ['_v115 {kx}4. {kx}8 r2', '{kx}4. {kx}8 r2', '{kx}2 {kx}2', SK_ROLL],
        ['_v105'], [SK_IN, ...rep(SK, 6), SK_FILL], [SK_P, SK_P, SK_BUILD, SK_TIPTOE],
        ['_v110'], [SK_C_IN, ...rep(SK_C, 6), SK_FILL], ['_v100'], [SK_S_IN, ...rep(SK_S, 6), SK_FILL], ['_v115'], [SK_C_IN, ...rep(SK_C, 6), SK_FILL],
      ),
    },
  },
  arrangements: {
    main: {},
    intro: { solo: ['synbrass', 'pad', 'bass', 'lead', 'power'], vol: { power: 0.7 }, level: 0.8 },
  },
};
