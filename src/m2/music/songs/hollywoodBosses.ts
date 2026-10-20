// HOLLYWOOD LAND's fights: the Ensemble Cast (the Revengers, the warehouse's sub-boss) and Stuntman Steve (the land's
// boss, on his stunt stage). The land's theme and its set pieces are in hollywood.ts. Both at Mega Man boss pace.
//
// ---- "REVENGERS: RESEMBLE" (boss:ensemble-cast) ----
// Dozens of A-listers in costume dogpiling him, sure they're superheroes: the franchise fanfare as a Mega Man boss
// fight. The brass section's fanfare leaping a fifth ("RE-VEN-GERS") over the low brass's da-da-dum da-da-da-da DUM,
// palm-muted sixteenths galloping, the bass pumping octaves, the strings' sixteenths, taiko and a sixteenth kit; a
// "RE-SEM-BLE!" stinger closing every phase, the band hitting it together. Franchise inflation: every eight bars it
// lurches up a key (E-flat, PHASE TWO in E with the trumpets in thirds, PHASE THREE in F with the trumpet an octave up
// and the choir on the tune), then a self-important "sacrifice" bridge in D-flat in half time (the violins and choir,
// the snare rolling), the Bb7 back to E-flat to do it all again.
// E-flat major, 156. 36 bars: a 4-bar logo (once: the strings swooping up, the low brass's BWAAAM on E-flat, then
// C-flat, timpani, the choir swelling, a roll), then P1 (Eb - Bb/D - Cm - Ab - Eb/G - Ab - Bbsus - Bb), P2 (the same in
// E), P3 (in F), B (D-flat: Db - Ab/C - Bbm7 - Gb - Db/F - Gb - Absus - Bb7).
// ARRANGEMENTS: main, intro (CAPTAIN AMERICANO's entrance: the brass, the low brass, the strings, the choir, timpani
// and hits; no kit, no guitars).
//
// ---- "TWO SECONDS OF FAME" (boss:stuntman-steve) ----
// A washed-up 80s Cannon-films stuntman, a coward in a yellow suit: a hair-metal power anthem at Mega Man X speed. The
// keytar (a saw lead) on the riff, sixteenth palm-mutes in the verse and power chords in the chorus, the bass pumping
// octaves, analog synth brass, a PWM pad, gang "HEY!"s, Simmons-ish tom fills, the montage's alto sax solo over an FM
// arpeggio. The joke: the pre-chorus builds and builds and then, where the drop should be, sidesteps: a bar of nothing
// but a tiptoeing woodblock and one timid keytar note. And the last chorus goes up a whole step (twin keytars now).
// A major, 174. 40 bars: a 4-bar fanfare (once: "STE-VE!" on the synth brass, power-chord hits, a tom roll), V (A5 -
// G5 D5 - A5 - G5 D5 - F#m - D - E - E), P (Bm - D - E - the sidestep), C (A - E/G# - F#m - D - A - E - D - E), S (F#m
// - D - E - A - F#m - D - E - F#7, the sax), C2 (the chorus in B, its last bar at pitch).
// ARRANGEMENTS: main, intro (his entrance: the synth brass, pad, bass, keytar, power chords; no kit).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, pat, pads, harm, scale, sec, KIT, FILL, troll } from './mmkit';

// =====================================================================================================================
// REVENGERS: RESEMBLE

const E_IN: Bar[] = ['Eb', 'B', 'Eb', 'Bb'];
const E_P: Bar[] = ['Eb', 'Bb/D', 'Cm', 'Ab', 'Eb/G', 'Ab', 'Bbsus', 'Bb'];
const E_B: Bar[] = ['Db', 'Ab/C', 'Bbm7', 'Gb', 'Db/F', 'Gb', 'Absus', 'Bb7'];
/** A phase: its bars transposed (the franchise's next installment, a key up). */
const ph = (k: number, bs: string[]) => [`_k${k}`, ...bs];
const phases = (p: string[], b: string[]) => [...ph(0, p), ...ph(1, p), ...ph(2, p), ...ph(0, b)];

const E_HOOK = ['o4 e-4. b-8 o5 e-4. f8', 'o5 d8 e-8 f8 d8 o4 b-4 r8 b-8', 'o4 g4. o5 c8 e-4 g4', 'o5 f4. e-8 r8 e-8 c4', 'o4 e-4. b-8 o5 e-4 g4', 'o5 a-4. g8 r8 g8 f4', 'o5 e-4. f8 g4 f4', 'o5 d8 r8 d8 r8 d4 r4'];
const E_CTR = ['o5 g1', 'o5 f1', 'o5 g1', 'o5 a-1', 'o5 b-1', 'o5 a-2 o6 c2', 'o5 b-1', 'o5 a-8 r8 a-8 r8 a-4 r4'];
const E_BMEL = ['o5 f2. e-8 d-8', 'o5 e-2 c2', 'o5 d-4. c8 d-4 f4', 'o5 b-1', 'o5 a-2. g-8 f8', 'o5 g-2 b-2', 'o5 d-2 e-2', 'o5 d2 f4 a-4'];
const E_TWIN = harm(E_HOOK, scale('eb', 'major'));
const E_STING = '{kx}8 r8 {kx}8 r8 {kx}4 s16 s16 s16 s16';
const E_SWOOP = '_g2 o3 b-4 o6 b-2. _g0';
const E_HALF = '{kh}8 h8 h8 h8 {sh}8 h8 h8 {kh}8';

export const BOSS_ENSEMBLE: Song = {
  title: 'Revengers: Resemble',
  bpm: 156,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.9,
  delay: { beats: 0.75, feedback: 0.22, tone: 2800 },
  parts: {
    hook: { inst: 'brass', pan: 0, rev: 0.28, dly: 0.05, mml: join(rest(4), ['_v112'], ph(0, E_HOOK), ph(1, E_HOOK), ['_v118'], ph(2, E_HOOK), ['_k0'], rest(8)) },
    twin: { inst: 'trumpet', pan: 0.25, rev: 0.28, vol: 0.55, mml: join(rest(12), ['_v105'], ph(1, E_TWIN), ['_v110'], ph(2, up(E_HOOK)), ['_k0'], rest(8)) },
    violins: { inst: 'strings', pan: 0.3, rev: 0.38, vol: 0.6, mml: join(rest(12), ['_v90'], ph(1, E_CTR), ['_v95'], ph(2, E_CTR), ['_k0 _v108'], up(E_BMEL)) },
    choir: { inst: 'choir', pan: 0, rev: 0.48, vol: 0.5, mml: join(['_v80'], pads(E_IN, 55), rest(8), ['_v85'], ph(1, pads(E_P, 55)), ['_v100'], ph(2, E_HOOK), ['_k0 _v100'], E_BMEL) },
    strings: { inst: 'strings', pan: -0.25, rev: 0.3, vol: 0.38, mml: join(['q6 _v75'], pads(E_IN, 55), ['_v95'], phases(pat(E_P, '016 116 216 116', 63), pat(E_B, '016 116 216 116', 63))) },
    lowbrass: { inst: 'trombone', pan: -0.1, rev: 0.25, vol: 0.6, mml: join(['_v120 o2 e-1', 'o1 b1', 'o2 e-1', 'o2 b-2 r2'], ['q6 _v108'], phases(pat(E_P, '!B8 B16 B16 B8 B8 B8 B16 B16 24', 39), pat(E_B, '!B8 B16 B16 B8 B8 B8 B16 B16 24', 39))) },
    chug: { inst: 'chug', pan: 0.4, rev: 0.08, vol: 0.42, not: ['intro'], mml: join(['_v110'], pat(E_IN, '!R4 r2.', 40), phases(pat(E_P.slice(0, 7), '!R8 R16 R16 !R8 R16 R16 !R8 R16 R16 !R8 R16 R16', 40).concat(['o2 b-8 r8 b-8 r8 b-4 r4']), pat(E_B, '!R8 R8 R8 R8 !R8 R8 R8 R8', 40))) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.8, mml: join(['_v110 o1 e-1', 'o1 b1', 'o1 e-1', 'o1 b-2 r2'], ['_v100'], phases(pat(E_P.slice(0, 7), "B8 B'8 B8 B'8 B8 B'8 B8 B'8", 28).concat(['o1 b-8 r8 b-8 r8 b-4 r4']), pat(E_B, "!B4. B8 B'4 B4", 28))) },
    swoop: { inst: 'strings', pan: 0.35, rev: 0.45, vol: 0.42, mml: join(['_v95 _g2 o3 e-4 o6 e-2. _g0'], rest(10), [E_SWOOP], rest(7), [E_SWOOP], rest(7), [E_SWOOP], rest(8)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.18, vol: 0.72, not: ['intro'],
      mml: join(['r1', 'r1', 'r1', '_v90 ' + FILL.roll], ['_v105'], sec(8, KIT.mm, E_STING), sec(8, KIT.mm, E_STING), ['_v112'], sec(8, KIT.drive, E_STING), ['_v100'], sec(8, E_HALF, FILL.big)),
    },
    taiko: { inst: 'taiko', drums: true, rev: 0.35, vol: 0.6, not: ['intro'], mml: join(rest(4), ['_v105'], rep('f4 r8 f8 r8 f8 f4', 24), rep('f2 f4 f4', 7), ['f8 f8 f8 f8 f4 f4']) },
    timp: {
      inst: 'timpani', pan: 0.1, rev: 0.35, vol: 0.6,
      mml: join(['_v115 o2 e-4 r2.', 'o1 b4 r2.', 'o2 e-4 r2.', troll('o2 b-')], ...[0, 1, 2].map(k => [`_k${k} _v110 o2 e-4 r2.`, ...rest(6), 'o2 b-8 r8 b-8 r8 b-4 r4']), ['_k0 o2 d-4 r2.'], rest(6), [troll('o2 b-')]),
    },
    hits: { inst: 'orchstab', pan: 0, rev: 0.38, vol: 0.48, mml: join(['_v112 o4 e-4 r2.', 'o3 b4 r2.', 'o4 e-4 r2.', 'o4 b-4 r2.'], ...[0, 1, 2].map(k => [`_k${k} o4 e-4 r2.`, ...rest(6), 'o4 b-8 r8 b-8 r8 b-4 r4']), ['_k0 o4 d-4 r2.'], rest(7)) },
  },
  arrangements: {
    main: {},
    intro: { solo: ['hook', 'lowbrass', 'strings', 'choir', 'timp', 'swoop', 'hits', 'violins', 'twin'], level: 0.85 },
  },
};

// =====================================================================================================================
// TWO SECONDS OF FAME

const S_IN: Bar[] = ['A', 'A', 'D', 'E'];
const S_V: Bar[] = ['A5', ['G5', 'D5'], 'A5', ['G5', 'D5'], 'F#m', 'D', 'E', 'E'];
const S_P3: Bar[] = ['Bm', 'D', 'E'];
const S_C: Bar[] = ['A', 'E/G#', 'F#m', 'D', 'A', 'E', 'D', 'E'];
const S_S: Bar[] = ['F#m', 'D', 'E', 'A', 'F#m', 'D', 'E', 'F#7'];
/** The sidestep: a bar of nothing. */
const SIDESTEP = 'r1';
/** The last chorus: up a whole step to B, but its last bar at pitch (E: the IV in B turned the V back home in A). */
const c2 = (bs: string[]) => ['_k2', ...bs.slice(0, 7), '_k0', bs[7]];

const SL_V = [
  'o5 a8 a8 o6 c+8 o5 a8 e8 a8 o6 c+8 e8',
  'o6 d8 r8 o5 b8 g8 a8 r8 f+8 d8',
  'o5 a8 a8 o6 c+8 o5 a8 e8 a8 o6 c+8 e8',
  'o6 d8 e8 d8 o5 b8 a4 r8 e8',
  'o5 f+8 a8 o6 c+8 o5 a8 o6 c+4. o5 b8',
  'o5 a8 f+8 d8 f+8 a4 r4',
  'o5 e8 f+8 g+8 a8 b8 o6 c+8 d8 e8',
  'o6 e2 r2',
];
const SL_P = ['o5 f+8 r8 b8 r8 o6 d8 r8 c+8 r8', 'o5 b8 r8 a8 r8 f+8 r8 a8 r8', 'o5 g+8 b8 o6 e8 g+8 b8 g+8 e8 o5 b8', '_v60 r2. o5 e16 r16 r8 _v112'];
const SL_C = ['o6 c+4. o5 b8 a4 o6 e4', 'o6 e4. d8 c+4 o5 b4', 'o5 a4. b8 o6 c+4 e4', 'o6 f+4. e8 r8 e8 d4', 'o6 c+4. o5 b8 a4 o6 e4', 'o6 g+4. f+8 e4 d4', 'o6 f+4 e4 d4 c+4', 'o5 b2 g+4 e4'];
const SL_C2TWIN = harm(SL_C, scale('a', 'major'));
const SS_SAX = [
  'o5 _b-2 c+4. o4 b8 a4 f+4',
  'o4 a8 b8 o5 d8 e8 f+4 _f-3 e4',
  'o5 g+8 f+8 e8 d8 o4 b4. g+8',
  'o4 a2 o5 c+8 e8 a8 g+8',
  'o5 f+8 a8 f+8 e8 c+8 e8 c+8 o4 b8',
  'o4 a4 o5 d4 f+4 a4',
  'o5 _b-2 b2 g+4 e4',
  'o5 a+4 c+4 e4 f+4',
];
const S_HEY = ['r1', 'r2. o4 {a >d f+}8 r8', 'r1', 'r2. o4 {a >d f+}8 r8', 'r1', 'r1', 'r1', 'r2. o3 {b >e g+}8 r8'];
const SK_BUILD = '{ks}8 s8 {ks}8 s8 {ks}16 s16 s16 s16 s16 s16 s16 s16';
const SK_TIPTOE = 'r2. e16 r16 e16 r16';

export const BOSS_STEVE: Song = {
  title: 'Two Seconds of Fame',
  bpm: 174,
  loopFrom: 16,
  reverb: 'room',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.3, tone: 3200 },
  parts: {
    lead: { inst: 'sawlead', pan: 0, rev: 0.22, dly: 0.15, cho: 0.2, mml: join(rest(4), ['_v108'], SL_V, ['_v105'], SL_P, ['_v112'], SL_C, rest(8), c2(SL_C)) },
    twin: { inst: 'sawlead', pan: 0.35, rev: 0.22, cho: 0.2, vol: 0.45, mml: join(rest(32), ['_v100'], c2(SL_C2TWIN)) },
    sax: { inst: 'sax', pan: 0.1, rev: 0.28, dly: 0.15, mml: join(rest(24), ['_v112'], SS_SAX, rest(8)) },
    synbrass: {
      inst: 'synthbrass', pan: -0.2, rev: 0.22, vol: 0.55,
      mml: join(['_v118 o4 {e a >c+}4. {e a >c+}8 r2', 'o4 {a >c+ e}4. {a >c+ e}8 r2', 'o4 {f+ a >d}2 {a >d f+}2', 'o4 {g+ b >e}1'],
        ['q5 _v100'], pat(S_V, '!X8 r8 r8 X8 r2', 57), ['q8 _v85'], pads(S_P3, 57), [SIDESTEP], ['q6 _v108'], pat(S_C, '!X4. X8 r4 X4', 57), ['q8 _v78'], pads(S_S, 57), ['q6 _v112'], c2(pat(S_C, '!X4. X8 r4 X4', 57))),
    },
    pad: { inst: 'pwm', pan: 0.2, rev: 0.4, vol: 0.3, mml: join(['_v85'], pads(S_IN, 57), ['_v70'], pads(S_V, 57), pads(S_P3, 57), [SIDESTEP], ['_v80'], pads(S_C, 57), pads(S_S, 57), c2(pads(S_C, 57))) },
    power: {
      inst: 'powerchord', pan: -0.4, rev: 0.1, vol: 0.5,
      mml: join(['_v115 o2 a4. a8 r2', 'o2 a4. a8 r2', 'o2 d2 d2', `o2 ${'e8 '.repeat(8).trim()}`],
        ['@chug _v108'], pat(S_V, '!R16 R16 R16 R16 !R16 R16 R16 R16', 40), ['@ _v105'], pat(S_P3, '!R8 R8 R8 R8 !R8 R8 R8 R8', 40), [SIDESTEP],
        ['_v112'], pat(S_C, '!R4. R8 R8 R8 !R8 R8', 40), pat(S_S, '!R8 R8 r8 R8 !R8 R8 R8 R8', 40), c2(pat(S_C, '!R4. R8 R8 R8 !R8 R8', 40))),
    },
    bass: {
      inst: 'bass', pan: 0, rev: 0.05, vol: 0.82,
      mml: join(['_v112 o1 a4. a8 r2', 'o1 a4. a8 r2', 'o2 d2 d2', `o1 ${'e8 '.repeat(8).trim()}`], ['_v102'], pat(S_V, "B8 B'8 B8 B'8", 28), pat(S_P3, '!B8 B8 B8 B8', 28), [SIDESTEP],
        ['_v106'], pat(S_C, "B8 B'8 B8 B'8", 28), pat(S_S, "!B8 B8 B'8 B8", 28), c2(pat(S_C, "B8 B'8 B8 B'8", 28))),
    },
    arp: { inst: 'fmpiano', pan: 0.35, rev: 0.25, dly: 0.15, vol: 0.32, mml: join(rest(24), ['_v95'], pat(S_S, "016 116 216 0'16", 57), rest(8)) },
    choir: { inst: 'choir', pan: 0, rev: 0.42, vol: 0.45, mml: join(rest(4), ['q3 _v118'], S_HEY, rest(4), ['q8 _v90'], pads(S_C, 55), rest(8), ['_v100'], c2(pads(S_C, 55))) },
    kit: {
      inst: 'kick', drums: true, rev: 0.28, vol: 0.75, not: ['intro'],
      mml: join(['_v115 {kx}4. {kx}8 r2', '{kx}4. {kx}8 r2', '{kx}2 {kx}2', FILL.big],
        ['_v105'], sec(8, KIT.mm, FILL.toms), [KIT.rock, KIT.rock, SK_BUILD, SK_TIPTOE],
        ['_v112'], sec(8, KIT.drive, FILL.big), ['_v102'], sec(8, KIT.mm, FILL.snare), ['_v115'], sec(8, KIT.drive, FILL.big)),
    },
  },
  arrangements: {
    main: {},
    intro: { solo: ['synbrass', 'pad', 'bass', 'lead', 'power'], vol: { power: 0.7 }, level: 0.8 },
  },
};
