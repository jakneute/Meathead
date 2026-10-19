// JUNGLE LAND's fights: the T. rex (the paddock's sub-boss) and Safari Artie (the land's boss). The land's theme and
// its set pieces are in jungle.ts.
//
// ---- "ANIMATRONIC APEX" (boss:trex) ----
// A broken robot T. rex out to kill him: slow, stomping, huge. An orchestral stomp (low brass and cello grinding a
// C-sharp/D ostinato, taiko and bass drum on its footsteps, the horns on the tune, choir shouts), and in the middle its
// speaker still doing the friendly bit: a music-box ditty in E major ("Welcome to Dino Land!") that winds down like a
// dying tape, stamped flat by the orchestra playing the same ditty in C-sharp minor.
//
// C-sharp minor, 96. 36 bars: a 4-bar intro (once: the ostinato alone, a gong, the timpani, the choir humming), then:
//   A   (8)  C#m - D/C# (the Neapolitan grinding over the pedal) - C#m - A - G#7: the horns, the stomps.
//   A2  (8)  the same, the brass section an octave under the horns, the choir shouting on the downbeats.
//   B   (8)  the friendly bit: E - A - B7 - E on music box and celesta over soft strings (it winds down, an octave),
//            then the brass slam the ditty in C#m - F#m - G#7 - C#m.
//   C   (8)  the climax: A - E/G# - F#m - C#m/E - D - A/C# - Bm7 - G#7, horns and trumpets in octaves, the violins
//            running, the choir full, orchestra hits.
// ARRANGEMENTS: main, intro (its opening: the ostinato, the drums, the timpani, the choir).
//
// ---- "TOUGH CROWD" (boss:safari-artie) ----
// Safari Artie: a stand-up comic stuck skippering the Jungle Cruise, furious Meathead walked out on his set. A Perez
// Prado exotica mambo (brass shouts, the sax section's riff, piano montuno, congas, timbales, cowbell, "UGH!") that
// keeps dropping into a comedy-club break: a swung Hammond-and-walking-bass combo, a harmon-muted trumpet telling the
// joke, and a ba-dum-tss after every punchline. It opens like he's being introduced at the club (a cheesy B-flat major
// vamp, a drum roll, the rimshot) before the mambo hits in B-flat minor.
//
// B-flat minor, 168. 36 bars: the 4-bar club intro (once), then:
//   A   (8)  Bbm7 - Eb9 (Dorian) - Gbmaj7 - F7 - F7#9: the sax riff, the brass shouts, the montuno, the tumbao.
//   B   (8)  the trumpet's tune (Artie's motif: three Fs, up to the A-flat, the B-flat, the D-flat), screaming up to
//            the sharp-nine at the end.
//   C   (8)  the club: swung, Gbmaj7 - F7 - Ebm7 - Ab7 - Dbmaj7 - Gb7 - C7 - F7, the muted trumpet's set-ups and the
//            rimshots, a fall off the last note.
//   D   (8)  the shout chorus: the tune on trumpet with the whole brass section under it, "UGH!"
// ARRANGEMENTS: main, intro (his ambush: the montuno on the organ, bass, the kit, congas).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, hi, chord, bars } from './jungle';

// =====================================================================================================================
// ANIMATRONIC APEX

const V5: Record<string, string[]> = {
  'C#m': ['4c+', '4e', '4g+'], 'D/C#': ['4d', '4f+', '4a'], A: ['4c+', '4e', '4a'], 'G#7': ['4c', '4d+', '4f+', '4g+'], E: ['4e', '4g+', '4b'],
  B7: ['4d+', '4f+', '4a', '4b'], 'F#m': ['4c+', '4f+', '4a'], 'E/G#': ['4e', '4g+', '4b'], 'C#m/E': ['4c+', '4e', '4g+'], D: ['4d', '4f+', '4a'],
  'A/C#': ['4c+', '4e', '4a'], Bm7: ['4d', '4f+', '4a', '4b'],
};
/** The ostinato's root and the note a half step above it (the grind). */
const R5: Record<string, [string, string]> = {
  'C#m': ['c+', 'd'], 'D/C#': ['c+', 'd'], A: ['a', 'b-'], 'G#7': ['g+', 'a'], E: ['e', 'f'], B7: ['b', 'c'], 'F#m': ['f+', 'g'], 'E/G#': ['g+', 'a'],
  'C#m/E': ['e', 'f'], D: ['d', 'e-'], 'A/C#': ['c+', 'd'], Bm7: ['b', 'c'],
};
const RX_IN: Bar[] = ['C#m', 'C#m', 'D/C#', 'C#m'];
const RX_A: Bar[] = ['C#m', 'C#m', 'D/C#', 'C#m', 'C#m', 'C#m', 'A', 'G#7'];
const RX_B: Bar[] = ['E', 'A', 'B7', 'E', 'C#m', 'F#m', 'G#7', 'C#m'];
const RX_C: Bar[] = ['A', 'E/G#', 'F#m', 'C#m/E', 'D', 'A/C#', 'Bm7', 'G#7'];

/** The low ostinato (o = the octave): the root, again, again, and the grind up to its neighbour. */
const grind = (prog: Bar[], o: number) => bars(prog, c => { const [r, n] = R5[c]; return `o${o} ${r}4 r8 ${r}8 ${r}4 r8 ${n}8`; });
const rxPads = (prog: Bar[]) => bars(prog, c => chord(V5[c], '1'));
/** The violins' run: up the chord two octaves and back, in eighths. */
const rxRun = (prog: Bar[]) => bars(prog, c => { const v = V5[c], n = [...v, ...v.map(hi)]; return [...n, ...[...n].reverse()].slice(0, 8).map(x => nt(hi(x), '8')).join(' '); });

const RX_HORN_A = ['o4 g+2 a4 g+4', 'o4 e2. r4', 'o4 f+2 a4 f+4', 'o4 g+4 f+4 e4 d+4', 'o4 c+4 e4 g+4 o5 c+4', 'o5 e2 d+4 c+4', 'o4 a4 o5 c+4 e2', 'o5 d+4 c4 o4 g+2'];
const RX_HORN_B = ['r1', 'r1', 'r1', 'r1', 'o4 g+1', 'o4 a1', 'o4 g+1', 'o4 g+1'];
const RX_HORN_C = ['o5 c+2. o4 a4', 'o4 b2 g+4 b4', 'o5 c+2 o4 a4 f+4', 'o4 g+2. e4', 'o4 a2 o5 d4 f+4', 'o5 e2 c+4 o4 a4', 'o5 d2 c+4 o4 b4', 'o5 c4 d+4 f+4 g+4'];
const DITTY = ['o6 e8 g+8 b8 g+8 e8 g+8 b4', 'o6 a8 g+8 f+8 e8 c+4 e4', 'o6 d+8 f+8 a8 f+8 b4 a8 f+8', 'o6 g+4 e4 _f-12/2 e2'];
const DITTY_MINOR = ['o4 c+8 e8 g+8 e8 c+8 e8 g+4', 'o4 a8 g+8 f+8 e8 c+4 e4', 'o4 d+8 f+8 g+8 f+8 g+4 c8 d+8', 'o4 e4 c+4 c+2'];
const SHOUT = `${chord(['3c+', '3g+', '4c+'], '8')} r8 r4 r2`;

export const BOSS_TREX: Song = {
  title: 'Animatronic Apex',
  bpm: 96,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 1,
  parts: {
    horns: { inst: 'horn', pan: -0.15, rev: 0.32, mml: join(['r1', 'r1', '_v85 o3 g+1', 'o4 c+2. r4'], ['_v105'], RX_HORN_A, RX_HORN_A, RX_HORN_B, ['_v115'], RX_HORN_C) },
    trumpet: { inst: 'trumpet', pan: 0.2, rev: 0.3, vol: 0.7, mml: join(rest(4), rest(24), ['_v105'], up(RX_HORN_C)) },
    brass: { inst: 'brass', pan: 0.1, rev: 0.3, vol: 0.8, mml: join(rest(4), rest(8), ['_v100'], up(RX_HORN_A, -1), ['r1', 'r1', 'r1', 'r1', '_v115'], DITTY_MINOR, ['_v105'], up(RX_HORN_C, -1)) },
    tuba: { inst: 'tuba', pan: -0.1, rev: 0.2, vol: 0.85, mml: join(['_v100'], grind(RX_IN, 1), grind(RX_A, 1), grind(RX_A, 1), ['_v60 o1 e1', 'o1 a1', 'o1 b1', 'o1 e1', '_v105'], grind(RX_B.slice(4), 1), grind(RX_C, 1)) },
    cello: { inst: 'cello', pan: 0.15, rev: 0.25, vol: 0.75, mml: join(['_v95'], grind(RX_IN, 2), grind(RX_A, 2), grind(RX_A, 2), ['_v45 o2 c+1', 'o2 c+1', 'o2 c+1', 'o2 c+1', '_v100'], grind(RX_B.slice(4), 2), grind(RX_C, 2)) },
    strings: { inst: 'strings', pan: 0, rev: 0.4, vol: 0.45, mml: join(rest(4), ['_v65'], up(rxPads(RX_A), -1), ['_v80'], rxPads(RX_A), ['_v50'], rxPads(RX_B.slice(0, 4)), ['_v85'], rxPads(RX_B.slice(4)), ['_v95'], rxPads(RX_C)) },
    violins: { inst: 'strings', pan: 0.3, rev: 0.35, vol: 0.5, mml: join(rest(4), rest(24), ['_v90'], rxRun(RX_C)) },
    choir: {
      inst: 'choir', pan: 0, rev: 0.45, vol: 0.55,
      mml: join(['_v60 o3 c+1', 'o3 c+1', 'o3 d1', 'o3 c+1'], rest(8), ['_v120 ' + SHOUT, 'r1', SHOUT, 'r1', SHOUT, 'r1', SHOUT, 'r1'], rest(4), ['_v85'], rxPads(RX_B.slice(4)), ['_v95'], rxPads(RX_C)),
    },
    musicbox: { inst: 'musicbox', pan: 0.3, rev: 0.35, vol: 0.7, mml: join(rest(4), rest(16), ['_v95'], DITTY, rest(4), rest(8)) },
    celesta: { inst: 'celesta', pan: -0.3, rev: 0.35, vol: 0.45, mml: join(rest(4), rest(16), ['_v85'], up(DITTY, -1), rest(4), rest(8)) },
    timpani: {
      inst: 'timpani', pan: -0.1, rev: 0.32, vol: 0.75,
      mml: join(
        ['r1', '_v60 o2 c+4 r2.', 'o2 d4 r2.', 'o2 _v50 [c+32]8 _v70 [c+32]8 _v90 [c+32]8 _v115 [c+32]8'],
        ['_v110 o2 c+4 r2.', 'r1', 'r1', 'r1', 'o2 c+4 r2.', 'r1', 'o2 a4 r2.', 'o2 _v70 [g+32]8 _v90 [g+32]8 _v105 [g+32]8 _v120 [g+32]8'],
        ['_v115 o2 c+4 r2.', 'r1', 'r1', 'r1', 'o2 c+4 r2.', 'r1', 'o2 a4 r2.', 'o2 g+4 r2.'],
        ['r1', 'r1', 'r1', 'o2 _v40 [e32]8 _v60 [e32]8 _v90 [e32]8 _v120 [e32]8', '_v120 o2 c+4 r2.', 'o2 f+4 r2.', 'o2 g+4 r2.', 'o2 c+4 r4 _v80 [g+32]8 _v110 [g+32]8'],
        ['_v115 o2 a4 r2.', 'o2 g+4 r2.', 'o2 f+4 r2.', 'o2 e4 r2.', 'o2 d4 r2.', 'o2 c+4 r2.', 'o2 b4 r2.', 'o2 _v70 [g+32]8 _v90 [g+32]8 _v105 [g+32]8 _v120 [g+32]8'],
      ),
    },
    stomp: {
      inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.35, vol: 0.8,
      mml: join(
        ['_v110 {kg}1', 'r1', '_v100 k2 k2', 'k2 k2'],
        ['_v120 {kx}2 k2'], rep('k2 k2', 7), ['{kx}2 k2'], rep('k2 k2', 6), ['k2 _v80 s16 s16 s16 s16 _v110 s16 s16 s16 s16'],
        ['_v70 (triangle)2 r2', 'r1', '(triangle)2 r2', 'r1', '_v125 {kx}2 k2', 'k2 k2', 'k2 k2', 'k2 _v90 s16 s16 s16 s16 _v120 s16 s16 s16 s16'],
        ['_v125 {kgx}2 k2'], rep('k2 k2', 6), ['k4 k4 _v100 s16 s16 s16 s16 _v125 s16 s16 s16 s16'],
      ),
    },
    taiko: {
      inst: 'taiko', drums: true, rev: 0.3, vol: 0.85,
      mml: join(['r1', 'r1', '_v80 f4 r8 f8 f4 r8 f8', 'f4 r8 f8 f8 f8 f8 f8'], ['_v110'], rep('f4 r8 f8 f4 r8 f8', 15), ['f8 f8 f16 f16 f16 f16 f8 f8 f8 f8'], rest(4), rep('f4 r8 f8 f4 r8 f8', 4), ['_v120'], rep('f4 r8 f8 f4 r8 f8', 7), ['f8 f8 f16 f16 f16 f16 f8 f8 f8 f8']),
    },
    hit: { inst: 'orchhit', pan: 0, rev: 0.35, vol: 0.6, mml: join(rest(4), rest(20), ['_v110 o4 e4 r2.'], rest(3), ['o4 a4 r2.'], rest(3), ['o4 d4 r2.'], rest(3)) },
  },
  arrangements: {
    main: {},
    intro: { solo: ['tuba', 'cello', 'stomp', 'taiko', 'timpani', 'choir'], vol: { choir: 0.7 }, level: 0.9 },
  },
};

// =====================================================================================================================
// TOUGH CROWD

const V6: Record<string, string[]> = {
  Bbm7: ['4d-', '4f', '4a-', '5c'], Eb9: ['4d-', '4f', '4g', '4b-'], Gbmaj7: ['4b-', '5d-', '5f'], F7: ['4e-', '4a', '5c'], 'F7#9': ['4a', '5e-', '5a-'],
  Ebm7: ['4d-', '4g-', '4b-'], Ab7: ['4c', '4e-', '4g-'], Dbmaj7: ['4c', '4f', '4a-'], Gb7: ['4e', '4b-', '5d-'], C7: ['4e', '4g', '4b-'],
  Bb6: ['4d', '4f', '4g'], G7: ['4d', '4f', '4b'], Cm7: ['4e-', '4g', '4b-'],
};
const R6: Record<string, [string, string]> = {
  Bbm7: ['b-', 'f'], Eb9: ['e-', 'b-'], Gbmaj7: ['g-', 'd-'], F7: ['f', 'c'], 'F7#9': ['f', 'c'],
};
const AR_A: string[] = ['Bbm7', 'Eb9', 'Bbm7', 'Eb9', 'Gbmaj7', 'F7', 'Bbm7', 'F7#9'];
const AR_C: string[] = ['Gbmaj7', 'F7', 'Ebm7', 'Ab7', 'Dbmaj7', 'Gb7', 'C7', 'F7'];

/** The tumbao: the fifth on the and of two, the next chord's root on four (pushed). */
const tumbao = (prog: string[], next: string) => prog.map((c, i) => `o2 r4 r8 ${R6[c][1]}8 r4 ${R6[prog[i + 1] ?? next][0]}4`);
/** The piano montuno: the chord's notes in octaves, syncopated. */
const montuno = (prog: string[]) => prog.map(c => { const v = V6[c], o = (n: string) => chord([n, hi(n)], '8'); const [a, b, d] = v; return [o(a), o(d), o(b), o(a), 'r8', o(b), o(d), o(b)].join(' '); });
const RIFF: Record<string, string> = {
  Bbm7: 'o4 b-8 o5 d-8 r8 f8 r8 e-8 d-8 r8', Eb9: 'o4 b-8 o5 d-8 r8 g8 r8 f8 e-8 r8', Gbmaj7: 'o4 b-8 o5 d-8 r8 f8 r8 e-8 d-8 r8',
  F7: 'o4 a8 o5 c8 r8 e-8 r8 d-8 c8 r8', 'F7#9': 'o4 a8 o5 c8 r8 e-8 r8 d-8 c8 r8',
};
const riff = (prog: string[]) => prog.map(c => RIFF[c]);
const shouts = (prog: string[]) => prog.map(c => { const x = chord(V6[c], ''); return `r2 r8 ${x}8 r8 !${x}8`; });
const charleston = (prog: string[]) => prog.map(c => { const x = chord(V6[c], ''); return `${x}4. ${x}8 r2`; });

const AR_TUNE = [
  'o5 f8 f8 r8 f8 _b-2 a-4 b-4',
  'o6 d-4. c8 o5 b-8 a-8 f4',
  'o5 f8 f8 r8 f8 _b-2 b-4 o6 d-4',
  'o6 f4. e-8 d-8 c8 o5 b-4',
  'o6 d-4 c8 o5 b-8 r8 b-8 o6 d-8 f8',
  'o6 _b-1 e-2 _f-5 c2',
  'o5 b-8 o6 c8 d-8 e-8 f8 g-8 f8 e-8',
  'o6 _b-3 a-2 _f-7/4 f2',
];
const AR_JOKE = [
  'o5 b-4 a-8 b-8 r8 f8 a-8 b-8',
  'o5 a4 r4 r2',
  'o5 g-4 f8 g-8 r8 d-8 f8 g-8',
  'o5 _f-5 g-4 r4 r2',
  'o5 f8 a-8 o6 c8 d-8 o5 b-4 a-4',
  'o5 e4 d-8 b-8 r2',
  'o5 e8 g8 b-8 o6 c8 d-8 c8 o5 b-8 g8',
  'o5 a4 _f-12/2 c2.',
];
const AR_WALK = ['o2 g-4 b-4 o3 d-4 o2 g4', 'o2 f4 a4 o3 c4 o2 e4', 'o2 e-4 g-4 b-4 a4', 'o2 a-4 o3 c4 e-4 d4', 'o3 d-4 o2 a-4 f4 g4', 'o2 g-4 b-4 o3 d-4 o2 d-4', 'o2 c4 e4 g4 g-4', 'o2 f4 a4 o3 c4 o2 b4'];
const UGH = 'r2. o3 !b-8 r8';

const MAMBO = '{kw}4 w8 w8 {kw}8 w8 {mw}8 w8';
const MAMBO_X = '{kx}4 w8 w8 {kw}8 w8 {mw}8 w8';
const TIMB_FILL = '{kw}4 w8 w8 (timbale)16 (timbale)16 (timbale)16 (timbale)16 (timbale)8 (timbale)8';
const CLUB = '{k(ride)}4 (ride)8 (ride)8 {m(ride)}4 (ride)8 (ride)8';
const BADUM = '{k(ride)}4 (ride)4 s8 (tom3)8 {k(crash)}4';
const TUMB_CONGA = '?c8 ?c8 (congaslap)8 c8 ?c8 ?c8 d8 d8';
const MARTILLO = 'b8 ?b8 (bongolo)8 ?b8 b8 ?b8 (bongolo)8 b8';
const A8 = (x: string, fill: string) => [x, ...rep(MAMBO, 6), fill];

export const BOSS_SAFARI_ARTIE: Song = {
  title: 'Tough Crowd',
  bpm: 168,
  loopFrom: 16,
  reverb: 'room',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.22, tone: 3000 },
  parts: {
    trumpet: { inst: 'trumpet', pan: 0, rev: 0.2, dly: 0.1, mml: join(rest(4), rest(8), ['_v110'], AR_TUNE, rest(8), ['_v118'], AR_TUNE) },
    harmon: { inst: 'mutetrumpet', pan: 0.1, rev: 0.25, dly: 0.12, mml: join(rest(4), rest(16), ['_w55 _v100'], AR_JOKE, ['_w0'], rest(8)) },
    brass: { inst: 'brass', pan: -0.15, rev: 0.22, vol: 0.8, mml: join(['r1', 'r1', 'r1', 'r1'], ['_v105'], shouts(AR_A), shouts(AR_A), rest(8), ['_v115'], up(AR_TUNE, -1)) },
    trombone: { inst: 'trombone', pan: -0.35, rev: 0.2, vol: 0.7, mml: join(rest(4), ['_v100'], AR_A.map(c => `o3 ${R6[c][0]}2 r2`), rest(8), rest(8), ['_v110'], AR_A.map(c => `o3 ${R6[c][0]}4. ${R6[c][0]}8 r2`)) },
    sax: { inst: 'sax', pan: 0.3, rev: 0.18, vol: 0.7, mml: join(rest(4), ['_v100'], riff(AR_A), ['_v80'], riff(AR_A), rest(8), ['_v105'], riff(AR_A)) },
    tenor: { inst: 'tenorsax', pan: 0.4, rev: 0.18, vol: 0.6, mml: join(rest(4), ['_v100'], up(riff(AR_A), -1), ['_v80'], up(riff(AR_A), -1), rest(8), ['_v105'], up(riff(AR_A), -1)) },
    piano: { inst: 'piano', pan: -0.3, rev: 0.15, vol: 0.6, mml: join(rest(4), ['_v95'], montuno(AR_A), montuno(AR_A), rest(8), montuno(AR_A)) },
    organ: {
      inst: 'organ', pan: -0.4, rev: 0.2, vol: 0.6,
      mml: join(['_w55 _v90 ' + charleston(['Bb6'])[0], charleston(['G7'])[0], charleston(['Cm7'])[0].replace('r2', chord(V6.Cm7, '2')), `_e127 ${chord(V6.F7, '1')}`], ['_w0'], rest(16), ['_w55 _v85'], charleston(AR_C), ['_w0'], rest(8)),
    },
    bass: {
      inst: 'bass', pan: 0, rev: 0.05, vol: 0.85,
      mml: join(['_w55 _v95 o2 b-4 o3 d4 o2 f4 a4', 'o2 g4 b4 o3 d4 o2 b4', 'o2 c4 e-4 g4 a4', 'o2 f4 r4 r2'], ['_w0 _v105'], tumbao(AR_A, 'Bbm7'), tumbao(AR_A, 'Gbmaj7'), ['_w55 _v95'], AR_WALK, ['_w0 _v105'], tumbao(AR_A, 'Bbm7')),
    },
    choir: { inst: 'choir', pan: 0, rev: 0.3, vol: 0.55, mml: join(rest(4), ['q3 _v120'], ['r1', UGH, 'r1', UGH, 'r1', 'r1', 'r1', 'r1'], rest(8), rest(8), ['r1', UGH, 'r1', UGH, 'r1', 'r1', 'r1', UGH]) },
    kit: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.7,
      mml: join(
        ['_w55 _v75 ' + CLUB, CLUB, '_v50 s16 s16 s16 s16 _v65 s16 s16 s16 s16 _v80 s16 s16 s16 s16 _v100 s16 s16 s16 s16', '_v110 s8 (tom3)8 {k(crash)}4 r2'],
        ['_w0 _v100'], A8(MAMBO_X, TIMB_FILL), A8(MAMBO_X, TIMB_FILL),
        ['_w55 _v85 ' + CLUB, BADUM, CLUB, BADUM, CLUB, BADUM, CLUB, BADUM],
        ['_w0 _v105'], A8(MAMBO_X, TIMB_FILL),
      ),
    },
    perc: { inst: 'congahi', drums: true, pan: 0.3, rev: 0.15, vol: 0.6, mml: join(rest(4), ['_v90'], rep(TUMB_CONGA, 16), rest(8), rep(TUMB_CONGA, 8)) },
    bongo: { inst: 'bongohi', drums: true, pan: -0.25, rev: 0.15, vol: 0.5, mml: join(rest(4), rest(8), ['_v85'], rep(MARTILLO, 8), rest(8), rep(MARTILLO, 8)) },
  },
  arrangements: {
    main: {},
    intro: { solo: ['piano', 'bass', 'kit', 'perc', 'organ', 'harmon'], inst: { piano: 'organ' }, vol: { piano: 0.9 }, level: 0.85 },
  },
};
