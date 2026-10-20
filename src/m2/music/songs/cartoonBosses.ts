// CARTOON LAND's fights: the five pundits (the White House's sub-bosses) and STUPID DAD (the land's boss). The land's
// theme is in cartoon.ts.
//
// ---- "THOSE MEAN MEN" (boss:perot, boss:falwell, boss:limbaugh, boss:dole, boss:newt) ----
// The pundits are one Saturday morning show's villains, so they share one theme: a cartoon villain march (Dr. Claw,
// Skeletor, the Snidely Whiplash two-step) stomping in B minor: the march on a tuba with a low clarinet doubling it,
// the brass's "pah" on two and four, a sneaking xylophone answering in the gaps, a march snare, a bass drum and
// cymbal, timpani; a B for the gloat in the relative major (oom-pah, the villain's tune on top); a C creeping up the
// Neapolitan (A minor / B-flat, the "nyeh-heh-heh"). Each pundit's arrangement is his own: his instrument on the
// gloat, his tag at the end of every eight bars, his colors under it all:
//   perot     Texas: a banjo on the gloat, an accordion's pah, a marimba, woodblock clip-clop, a harmonica lick
//   falwell   church: a pipe organ on the gloat and the pad, the choir, a celesta, an organ "A-men" (iv - i) tag
//   limbaugh  the radio show's bumper: a distorted guitar on the gloat, a Hammond's pah, a rock kit in place of the
//             march, finger bass, a rock riff tag
//   dole      the old soldier: a trumpet on the gloat, a bugle charge tag (up the major chord, a Picardy third), the
//             snare and bass drum up, a glockenspiel fife
//   newt      the Oval Office finale, the biggest: the brass section on the gloat, the choir, the hits and timpani up,
//             a brass "CONTRACT!" tag of hits
// No anthem, no fanfare-march (the broomsticks' Star Fox), no metal, no waltz; tuba and bass clarinet lead no other.
// Written in A minor, played in B minor (every pitched part tr +2), 116. 36 bars: a 4-bar entrance (once: "dun, dun...
// DUNNN", Am - Am - F - E7), then the loop:
//   A  (8)  Am - Am - Dm - E7 - Am - F - Dm E7 - Am: the march.
//   A' (8)  Am - Am - Dm - E7 - F - Bdim E7 - Am - Dm G7: again, the horns' counterline, into the relative major.
//   B  (8)  C - G7 - G7 - C - F - C A7 - Dm G7 - C: the gloat, oom-pah under it.
//   C  (8)  Am - Bb - Am - Bb - F - E7 - Am - E7: the creep up the flat two, back to the dominant.
// ARRANGEMENTS (cues.ts bossArrs: the pundit's name): perot, falwell, limbaugh, dole, newt; main (the sound test).
//
// ---- "IT'S FIVE O'CLOCK SOMEWHERE" (boss:stupid-dad) ----
// STUPID DAD LIVE!: Lyle Briscoe, the only cast member left, drunk on the couch in front of the same tape every show.
// The land's sitcom theme drunk: a sloppy bar-band blues shuffle, a 12-bar blues in D with the sitcom's hook (up the
// chord and the hiccup) slurred onto a trombone, the blue third bent into every phrase and the ends falling off; a
// honky-tonk piano's boogie left hand doubled by the bass, a Hammond's slow Leslie lurching (chorus on it), a heavy
// swung shuffle with fills that trip over themselves, a stop-time second chorus where the band hits and waits ("BOY!"),
// distorted guitar answering; and a bridge where the sitcom's old theme comes back sober for four bars over the
// slow strings, then sours (the minor iv, the flat-six seventh) and staggers home. No other boss has a blues, a
// shuffle, a trombone lead, D major or a tempo this slow.
// Written in C, played in D (every pitched part tr +2), 88, a heavy shuffle (swing). 36 bars: a 4-bar intro (once: the
// sitcom's head on a lone tipsy piano, the trombone's pickup), then the loop:
//   A  (12) C7 - F7 - C7 - C7 - F7 - F#dim7 - C7 - A7 - Dm7 - G7 - C7 A7 - Dm7 G7: the blues, the hook slurred.
//   B  (12) the same changes, stop-time for four (the band hits on one and waits), the trombone filling.
//   C  (8)  C - A7 - Dm7 - G7 - Fm6 - C - Ab7 - G7: the sitcom's own theme, then the sour turn home.
// ARRANGEMENTS (cues.ts bossArrs, by amphi/index.ts stupidDadMusic): hush (the show stopped dead, him squinting at
// Meathead: a Hammond humming, muffled), intro (the family glitching, him heaving himself up and crushing the can: the
// trombone, the piano, the bass, the organ, no drums), main (him coming on, and the fight to come).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, chord, bars } from './jungle';

const g1 = (b: Bar) => (typeof b === 'string' ? b : b[0]);

// =====================================================================================================================
// THOSE MEAN MEN (A minor, tr +2)

const PV: Record<string, string[]> = {
  Am: ['4c', '4e', '4a'], E7: ['3b', '4d', '4e', '4g+'], Dm: ['4d', '4f', '4a'], F: ['4c', '4f', '4a'], Bdim: ['4d', '4f', '4b'],
  G7: ['3b', '4d', '4f', '4g'], C: ['4c', '4e', '4g'], A7: ['4c+', '4e', '4g', '4a'], Bb: ['4d', '4f', '4b-'],
};
const PR: Record<string, [string, string]> = {
  Am: ['2a', '2e'], E7: ['2e', '2b'], Dm: ['2d', '2a'], F: ['2f', '2c'], Bdim: ['2b', '2f'], G7: ['2g', '2d'], C: ['2c', '2g'],
  A7: ['2a', '2e'], Bb: ['2b-', '2f'],
};
const P_IN: Bar[] = ['Am', 'Am', 'F', 'E7'];
const PA: Bar[] = ['Am', 'Am', 'Dm', 'E7', 'Am', 'F', ['Dm', 'E7'], 'Am'];
const PA2: Bar[] = ['Am', 'Am', 'Dm', 'E7', 'F', ['Bdim', 'E7'], 'Am', ['Dm', 'G7']];
const PB: Bar[] = ['C', 'G7', 'G7', 'C', 'F', ['C', 'A7'], ['Dm', 'G7'], 'C'];
const PC: Bar[] = ['Am', 'Bb', 'Am', 'Bb', 'F', 'E7', 'Am', 'E7'];
const P_ALL: Bar[] = [...P_IN, ...PA, ...PA2, ...PB, ...PC];

/** The march (the tuba): dum, da-da DUM, dum. */
const T_IN = ['o2 a4 r4 a4 r4', 'o2 a4 r4 a4 r4', 'o2 f2. r4', 'o2 e2 g+4 b4'];
const T_A = [
  'o2 a4 o3 c8 e8 a4 e4',
  'o3 c4 o2 b8 a8 g+4 e4',
  'o2 d4 f8 a8 o3 d4 c4',
  'o2 b4 g+8 e8 b4 r4',
  'o2 a4 o3 c8 e8 a4 g4',
  'o3 f4 e8 d8 c4 o2 a4',
  'o2 f4 d4 e4 g+4',
  'o2 a4 e4 a4 r4',
];
const T_A2 = [...T_A.slice(0, 4), 'o3 c4 o2 a8 f8 o3 c4 f4', 'o3 d4 o2 b4 g+4 e4', 'o2 a4 o3 c4 e4 a4', 'o3 f4 d4 o2 b4 g4'];
/** The creep (C): up the flat two, nyeh-heh-heh. */
const T_C = [
  'o2 a8 a8 a8 b8 o3 c4 o2 a4',
  'o2 b-8 b-8 b-8 o3 c8 d4 o2 b-4',
  'o3 c8 c8 c8 d8 e4 c4',
  'o3 d8 d8 d8 e-8 f4 d4',
  'o3 f4 e4 d4 c4',
  'o2 b4 g+4 e4 g+4',
  'o2 a4 o3 c4 e4 a4',
  'o3 g+4 e4 o2 b4 g+4',
];
/** The gloat (B), on the pundit's own instrument. */
const GLOAT = ['o4 g4. g8 o5 c4 o4 g4', 'o4 f4. e8 d4 g4', 'o4 b4. a8 g4 f4', 'o4 e2 c4 r4', 'o4 a4. a8 o5 c4 o4 a4', 'o4 g4 e4 c+4 e4', 'o4 f4 a4 g4 b4', 'o5 c4 o4 g4 c4 r4'];
/** The horns' counterline (A', C). */
const P_COUNTER_A2 = ['o4 e1', 'o4 e2 f2', 'o4 f1', 'o4 e1', 'o4 c1', 'o4 d2 d2', 'o4 c2 e2', 'o4 d2 o3 b2'];
const P_COUNTER_C = ['o4 e1', 'o4 f1', 'o4 e1', 'o4 f1', 'o4 a1', 'o4 g+1', 'o4 a1', 'o4 g+1'];
/** The xylophone sneaking in the gaps. */
const X_A = ['r1', 'r2 o5 e16 d+16 e16 f16 e8 r8', 'r1', 'r2 o5 g+16 a16 b16 o6 c16 o5 b8 r8', 'r1', 'r2 o5 a16 g16 f16 e16 f8 r8', 'r1', 'r2 o5 e8 r8 o4 a8 r8'];
const X_C = [
  'r2 o5 a16 b16 o6 c16 d16 e8 r8', 'r2 o5 b-16 o6 c16 d16 e-16 f8 r8', 'r2 o6 c16 d16 e16 f16 e8 r8', 'r2 o6 d16 e-16 f16 g16 f8 r8',
  'r1', 'r2 o5 g+16 a16 b16 o6 c16 o5 b8 r8', 'r1', 'r2 o5 b8 r8 g+8 r8',
];

/** Each pundit's tag: the last bar of every eight (over Am, Dm G7, C, E7). */
const TAGS: Record<string, string[]> = {
  perot: ['r2 o5 e8 g8 a4', 'r2 o5 f8 a8 b4', 'r2 o5 e8 g8 o6 c4', 'r2 o5 d8 e8 g+4'],
  falwell: ['o4 r2 {d f a}4 {c e a}4', 'o4 r2 {d f a}4 {d f g b}4', 'o4 r2 {c f a}4 {c e g}4', 'o4 r2 {d f a}4 {d e g+ b}4'],
  limbaugh: ['o4 a8 a8 o5 c8 o4 a8 o5 d8 c8 o4 a8 g8', 'o4 d8 d8 f8 d8 g8 g8 b8 g8', 'o4 c8 c8 e8 c8 g8 e8 c8 o3 g8', 'o4 e8 e8 g+8 e8 b8 g+8 e8 d8'],
  dole: ['o4 e8 a8 o5 c+8 e8 r8 c+8 e4', 'o4 g8 b8 o5 d8 g8 r8 d8 g4', 'o4 g8 o5 c8 e8 g8 r8 e8 g4', 'o4 e8 g+8 b8 o5 e8 r8 o4 b8 o5 e4'],
  newt: [
    `${chord(['4e', '4a', '5c'], '8')} r8 ${chord(['4e', '4a', '5c'], '8')} r8 ${chord(['4f', '4a', '5c'], '4')} ${chord(['4e', '4g+', '4b'], '4')}`,
    `${chord(['4d', '4f', '4a'], '8')} r8 ${chord(['4d', '4f', '4a'], '8')} r8 ${chord(['4d', '4f', '4a'], '4')} ${chord(['4d', '4f', '4b'], '4')}`,
    `${chord(['4e', '4g', '5c'], '8')} r8 ${chord(['4e', '4g', '5c'], '8')} r8 ${chord(['4f', '4a', '5c'], '4')} ${chord(['4e', '4g', '5c'], '4')}`,
    `${chord(['4d', '4e', '4g+'], '8')} r8 ${chord(['4d', '4e', '4g+'], '8')} r8 ${chord(['4d', '4e', '4g+', '4b'], '4')} ${chord(['4d', '4e', '4g+', '4b'], '4')}`,
  ],
};
/** A tag part: rests, and the tag on the last bar of every eight of the loop. */
const tagPart = (t: string[]) => join(rest(11), [t[0]], rest(7), [t[1]], rest(7), [t[2]], rest(7), [t[3]]);

const pPads = (prog: Bar[]) => bars(prog, (c, b) => chord(PV[c], b === 4 ? '1' : '2'));
/** The march bass: the root on one, the fifth on three. */
const pMarch = (prog: Bar[]) => bars(prog, (c, b) => (b === 4 ? `${nt(PR[c][0], '4')} r4 ${nt(PR[c][1], '4')} r4` : `${nt(PR[c][0], '4')} r4`));
/** The pah on two and four. */
const pPah = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(PV[c], '8'); return b === 4 ? `r4 ${x} r8 r4 ${x} r8` : `r4 ${x} r8`; });
/** Timpani on the root at the top and the end of each four bars. */
const pTimp = (prog: Bar[]) => prog.map((b, i) => (i % 4 === 0 || i % 4 === 3 ? `${nt(PR[g1(b)][0], '4')} r2.` : 'r1'));

const MARCH = '!s8. ?s16 s8 ?s8 !s8. ?s16 s4';
const MARCH_FILL = 's16 s16 s16 s16 s16 s16 s16 s16 s16 s16 s16 s16 !s4';
const S_ROLL = '_v45 s16 s16 s16 s16 _v60 s16 s16 s16 s16 _v80 s16 s16 s16 s16 _v105 s16 s16 s16 s16';
const march8 = () => [...rep(MARCH, 7), MARCH_FILL];
const BD = 'k4 r4 k4 r4';
const BD_IN = '{kx}4 r4 k4 r4';
const bd8 = () => [BD_IN, ...rep(BD, 7)];
const RK = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8';
const RK_IN = '{kx}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8';
const RK_FILL = '{kh}8 h8 {sh}8 h8 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16';
const rk8 = () => [RK_IN, ...rep(RK, 6), RK_FILL];
const CLOP = '(woodblock)8. (woodblocklo)16 (woodblock)8. (woodblocklo)16 (woodblock)8. (woodblocklo)16 (woodblock)8. (woodblocklo)16';

export const BOSS_PUNDITS: Song = {
  title: 'Those Mean Men',
  bpm: 116,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.7,
  delay: { beats: 0.5, feedback: 0.2, tone: 2600 },
  parts: {
    // The march: the tuba (an oom-pah under the gloat), a low clarinet an octave over it
    theme: { inst: 'tuba', tr: 2, pan: 0, rev: 0.2, mml: join(['q6 _v110'], T_IN, T_A, T_A2, ['_v95'], pMarch(PB), ['_v115'], T_C) },
    bcl: { inst: 'clarinet', tr: 2, pan: -0.1, rev: 0.22, vol: 0.5, mml: join(['q6 _v95'], up(T_IN), up(T_A), up(T_A2), rest(8), up(T_C)) },
    counter: { inst: 'horn', tr: 2, pan: -0.3, rev: 0.32, vol: 0.5, mml: join(['_v85'], ['o3 a1', 'o3 a1', 'o4 c1', 'o3 b1'], rest(8), P_COUNTER_A2, rest(8), P_COUNTER_C) },
    tagB: { inst: 'trombone', tr: 2, pan: 0.1, rev: 0.25, vol: 0.9, mml: join(['_v105'], rest(20), GLOAT, rest(8)) },
    pad: { inst: 'strings', tr: 2, pan: 0.1, rev: 0.4, vol: 0.28, mml: join(['_v80'], pPads(P_ALL)) },
    bass: { inst: 'upright', tr: 2, pan: 0, rev: 0.08, vol: 0.6, mml: join(['q5 _v100'], pMarch(P_ALL)) },
    pah: {
      inst: 'brass', tr: 2, pan: 0.25, rev: 0.25, vol: 0.42,
      mml: join(['_v100 q5'], [`${chord(PV.Am, '4')} r4 ${chord(PV.Am, '4')} r4`, `${chord(PV.Am, '4')} r4 ${chord(PV.Am, '4')} r4`, `q8 _e60 _e127/2. ${chord(PV.F, '2.')} r4`, `q5 ${chord(PV.E7, '8')} r8 ${chord(PV.E7, '8')} r8 ${chord(PV.E7, '4')} ${chord(PV.E7, '4')}`], ['_v90'], pPah([...PA, ...PA2, ...PB, ...PC])),
    },
    xylo: { inst: 'xylophone', tr: 2, pan: 0.35, rev: 0.25, dly: 0.12, vol: 0.45, mml: join(['_v95'], ['r1', 'r1', 'r1', X_A[3]], X_A, X_A, rest(8), X_C) },
    // (a major chord on the note: the F, the E, the B-flat, the C)
    hits: {
      inst: 'orchstab', tr: 2, pan: 0, rev: 0.3, vol: 0.45,
      mml: join(['_v100'], ['r1', 'r1', 'o4 f2 r2', 'o4 e4 r2.'], ['r1', 'r1', 'r1', 'o4 e4 r2.', 'r1', 'o4 f4 r2.', 'r1', 'r1'], ['r1', 'r1', 'r1', 'o4 e4 r2.', 'o4 f4 r2.', 'r1', 'r1', 'o4 r2 g4 r4'], ['o4 c4 r2.', 'r1', 'r1', 'r1', 'o4 f4 r2.', 'r1', 'r1', 'o4 c4 r2.'], ['r1', 'o4 b-4 r2.', 'r1', 'o4 b-4 r2.', 'o4 f4 r2.', 'o4 e4 r2.', 'r1', 'o4 e4 r4 e4 r4']),
    },
    timp: { inst: 'timpani', tr: 2, pan: -0.15, rev: 0.3, vol: 0.5, mml: join(['_v105'], ['o2 a4 r4 a4 r4', 'o2 a4 r4 a4 r4', 'o2 f2. r4', 'o2 _v50 [e32]8 _v70 [e32]8 _v90 [e32]8 _v115 [e32]8'], ['_v100'], pTimp([...PA, ...PA2, ...PB, ...PC])) },
    choir: { inst: 'choir', tr: 2, pan: 0, rev: 0.45, vol: 0.4, only: ['newt', 'falwell'], mml: join(['_v80'], rest(12), pPads(PA2), pPads(PB), pPads(PC)) },
    snare: { inst: 'snare', drums: true, pan: 0.1, rev: 0.2, vol: 0.5, mml: join(['_v95'], ['r1', 'r1', S_ROLL, '!s4 r4 !s4 !s4'], march8(), march8(), march8(), march8()) },
    bd: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.25, vol: 0.55, mml: join(['_v105'], ['{kx}4 r4 k4 r4', 'k4 r4 k4 r4', '{kx}2. r4', 'k4 r4 k4 k4'], bd8(), bd8(), bd8(), bd8()) },
    rock: { inst: 'kick', drums: true, rev: 0.12, vol: 0.7, only: ['limbaugh'], mml: join(['_v105'], ['{kx}4 r4 k4 r4', 'k4 r4 k4 r4', '{kx}2. r4', RK_FILL], rk8(), rk8(), rk8(), rk8()) },
    clop: { inst: 'woodblock', drums: true, pan: -0.25, rev: 0.15, vol: 0.45, only: ['perot'], mml: join(['_v85'], rest(4), rep(CLOP, 32)) },
    tagPerot: { inst: 'harmonica', tr: 2, pan: 0.3, rev: 0.25, vol: 0.7, only: ['perot'], mml: join(['_v105'], [tagPart(TAGS.perot)]) },
    tagFalwell: { inst: 'churchorgan', tr: 2, pan: 0, rev: 0.45, vol: 0.5, only: ['falwell'], mml: join(['_v100'], [tagPart(TAGS.falwell)]) },
    tagLimbaugh: { inst: 'overdrive', tr: 2, pan: -0.3, rev: 0.15, vol: 0.6, only: ['limbaugh'], mml: join(['_v110'], [tagPart(TAGS.limbaugh)]) },
    tagDole: { inst: 'trumpet', tr: 2, pan: 0.3, rev: 0.3, vol: 0.65, only: ['dole'], mml: join(['_v110'], [tagPart(TAGS.dole)]) },
    tagNewt: { inst: 'brass', tr: 2, pan: 0, rev: 0.3, vol: 0.7, only: ['newt'], mml: join(['_v115'], [tagPart(TAGS.newt)]) },
  },
  arrangements: {
    main: {},
    perot: { inst: { tagB: 'banjo', pah: 'accordion', xylo: 'marimba' }, vol: { snare: 0.4, pah: 0.5, xylo: 0.5 } },
    falwell: { inst: { tagB: 'churchorgan', pad: 'churchorgan', xylo: 'celesta' }, vol: { pad: 0.22, tagB: 0.7, xylo: 0.4 } },
    limbaugh: { mute: ['snare', 'bd'], inst: { tagB: 'distlead', pah: 'organ', bass: 'bass', xylo: 'clav' }, vol: { tagB: 0.7, pah: 0.45, bass: 0.75 } },
    dole: { inst: { tagB: 'trumpet', xylo: 'glock' }, vol: { snare: 0.7, bd: 0.7, xylo: 0.4 } },
    newt: { inst: { tagB: 'brass' }, vol: { hits: 0.65, timp: 0.7, counter: 0.6, pad: 0.35, theme: 1.1 } },
  },
};

// =====================================================================================================================
// IT'S FIVE O'CLOCK SOMEWHERE (C, tr +2)

const DV: Record<string, string[]> = {
  C7: ['3b-', '4c', '4e', '4g'], F7: ['3a', '4c', '4e-', '4f'], 'F#dim7': ['3a', '4c', '4e-', '4f+'], A7: ['3g', '4c+', '4e', '4a'],
  Dm7: ['3a', '4c', '4d', '4f'], G7: ['3b', '4d', '4f', '4g'], C: ['3g', '4c', '4e', '4g'], Fm6: ['3a-', '4c', '4d', '4f'], Ab7: ['3a-', '4c', '4e-', '4g-'],
};
/** The boogie: up the chord to the sixth and the seventh and back, in eighths (the piano's left hand, the bass). */
const BOOG: Record<string, string[]> = {
  C7: ['2c', '2e', '2g', '2a', '2b-', '2a', '2g', '2e'],
  F7: ['2f', '2a', '3c', '3d', '3e-', '3d', '3c', '2a'],
  'F#dim7': ['2f+', '2a', '3c', '3e-', '3f+', '3e-', '3c', '2a'],
  A7: ['2a', '3c+', '3e', '3f+', '3g', '3f+', '3e', '3c+'],
  Dm7: ['2d', '2f', '2a', '2b', '3c', '2b', '2a', '2f'],
  G7: ['2g', '2b', '3d', '3e', '3f', '3e', '3d', '2b'],
};
const D_IN: Bar[] = ['C', 'A7', 'Dm7', 'G7'];
const BLUES: Bar[] = ['C7', 'F7', 'C7', 'C7', 'F7', 'F#dim7', 'C7', 'A7', 'Dm7', 'G7', ['C7', 'A7'], ['Dm7', 'G7']];
const BRIDGE: Bar[] = ['C', 'A7', 'Dm7', 'G7', 'Fm6', 'C', 'Ab7', 'G7'];

/** The sitcom's head, on a lone piano (the intro). */
const SITCOM_HEAD = ['o5 c8 d8 e8 g8 r8 e8 g4', 'o5 a4 g8 e8 c+4 e4', 'o5 f8 e8 f8 a8 r8 f8 a4', 'o5 b4 a8 g8 f4 r4'];
/** The blues (A): the hook slurred, the blue third bent, the ends falling off. */
const BONE_A = [
  'o3 c8 d8 _b-1 e8 g8 r8 e8 g4',
  'o3 a4 g8 e-8 _f-4 c2',
  'o3 c8 d8 _b-1 e8 g8 r8 b-8 o4 c4',
  'o4 _b-2 c2. r4',
  'o3 f8 g8 a8 o4 c8 r8 o3 a8 o4 c4',
  'o4 e-4 c8 o3 a8 f+2',
  'o3 g4 e8 c8 _b-1 e4 c4',
  'o3 c+4 e4 g4 b-4',
  'o3 a2 f4 d4',
  'o3 b4 o4 d4 f4 _f-4 d4',
  'o4 c4 o3 g4 c+4 e4',
  'o3 f8 e8 d8 f8 _b-1 b4 r4',
];
/** The stop-time chorus (B): filling while the band waits. */
const BONE_B = [
  'r4 o3 g8 b-8 o4 c4 r4',
  'r4 o4 e-8 c8 _f-4 o3 g2',
  'r4 o3 g8 b-8 o4 c8 e-8 f8 f+8',
  'o4 _b-1 g2 _f-7 e-4 r4',
  'o4 f4 e-8 c8 o3 a4 f4',
  'o3 f+4 a4 o4 c4 e-4',
  'o3 g4 o4 c4 _b-1 e4 c4',
  'o3 a4 o4 c+4 e4 g4',
  'o3 f4 a4 o4 c4 d4',
  'o4 d4 o3 b4 g4 f4',
  'o3 e4 g4 a4 c+4',
  'o3 d4 f4 g4 r4',
];
/** The bridge (C): the sitcom's old theme, sober for four bars, then the sour turn home. */
const BONE_C = [
  'o3 c8 d8 e8 g8 r8 e8 g4',
  'o3 a4 g8 e8 c+4 e4',
  'o3 f8 e8 f8 a8 r8 f8 a4',
  'o3 b4 a8 g8 f4 d4',
  'o3 a-2 f4 d4',
  'o3 e2. g4',
  'o3 g-4 e-4 c4 o2 a-4',
  'o2 b4 o3 d4 f4 g4',
];
/** The guitar answering at the end of every four bars of a chorus. */
const GTR_12 = ['r1', 'r1', 'r1', 'r2 o3 e-8 e8 g8 b-8', 'r1', 'r1', 'r1', 'r2 o3 c+8 e8 g8 b-8', 'r1', 'r1', 'r1', 'r2 o3 g8 a8 b-8 b8'];

const boogie = (prog: Bar[]) => bars(prog, (c, b) => BOOG[c].slice(0, b * 2).map((n, i) => nt(n, '8', i === 0 ? '!' : '')).join(' '));
const walk = (prog: Bar[]) => bars(prog, (c, b) => [0, 2, 4, 6].slice(0, b).map(i => nt(BOOG[c][i], '4')).join(' '));
const dPads = (prog: Bar[]) => bars(prog, (c, b) => chord(DV[c], b === 4 ? '1' : '2'));
/** The piano's right hand in the bridge: the chord on one and three. */
const dComp = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(DV[c].map(n => `${Number(n[0]) + 1}${n.slice(1)}`), '4'); return b === 4 ? `${x} r4 ${x} r4` : `${x} r4`; });
/** The bass under the bridge: the root, held. */
const dRoots: Record<string, string> = { C: '2c', A7: '2a', Dm7: '2d', G7: '2g', Fm6: '2f', Ab7: '2a-' };

const SHUF = '{kh}8 ?h8 {sh}8 ?h8 {kh}8 {kh}8 {sh}8 ?h8';
const SHUF_IN = '{kx}8 ?h8 {sh}8 ?h8 {kh}8 {kh}8 {sh}8 ?h8';
/** The drunk fill: trips, catches itself. */
const STUMBLE = 's16 ?s16 r8 (tom1)8. (tom2)16 (tom3)8 (tom4)8 r4';
const STOP = '!{kx}8 r8 r2.';
const STOP_PICK = '!{kx}8 r8 r4 s8 s8 s8 s8';
const SAD = '{ki}8 i8 {mi}8 i8 {ki}8 i8 {mi}8 i8';
const SAD_IN = '{kx}8 i8 {mi}8 i8 {ki}8 i8 {mi}8 i8';

export const BOSS_STUPID_DAD: Song = {
  title: "It's Five O'Clock Somewhere",
  bpm: 88,
  swing: 0.62, grid: 8,
  loopFrom: 16,
  reverb: 'room',
  reverbMix: 0.85,
  delay: { beats: 0.75, feedback: 0.2, tone: 2200 },
  parts: {
    bone: { inst: 'trombone', tr: 2, pan: 0.05, rev: 0.25, dly: 0.08, mml: join(['_m30 _v110'], ['r1', 'r1', 'r1', 'r2 r8 o3 a8 b-8 b8'], BONE_A, ['_v105'], BONE_B, ['_v95'], BONE_C) },
    piano: {
      inst: 'piano', tr: 2, pan: -0.2, rev: 0.22, vol: 0.6,
      mml: join(['_v85'], SITCOM_HEAD, ['_v100 q6'], boogie(BLUES), boogie(BLUES), ['q7 _v80'], dComp(BRIDGE)),
    },
    organ: { inst: 'organslow', tr: 2, pan: 0.25, rev: 0.3, cho: 0.35, vol: 0.32, mml: join(['_v75'], dPads(D_IN), ['_v90'], dPads(BLUES), dPads(BLUES), ['_v80'], dPads(BRIDGE)) },
    bass: { inst: 'bass', tr: 2, pan: 0, rev: 0.06, vol: 0.75, mml: join(['q7 _v105'], ['r1', 'r1', 'r1', 'o2 g4 a4 b-4 b4'], walk(BLUES), walk(BLUES), bars(BRIDGE, c => `${nt(dRoots[c], '2.')} ${nt(dRoots[c], '4')}`)) },
    gtr: { inst: 'overdrive', tr: 2, pan: -0.4, rev: 0.18, vol: 0.45, mml: join(['_v100'], rest(4), GTR_12, GTR_12, rest(8)) },
    brass: {
      inst: 'brass', tr: 2, pan: 0.3, rev: 0.25, vol: 0.5,
      mml: join(
        ['_v105'], rest(4),
        rest(11), [`r2 ${chord(DV.Dm7, '8')} r8 ${chord(DV.G7, '4')}`],
        [`${chord(DV.C7, '8')} r8 r2.`, `${chord(DV.C7, '8')} r8 r2.`, `${chord(DV.C7, '8')} r8 r2.`, `${chord(DV.C7, '8')} r8 r2.`], rest(7), [`r2 ${chord(DV.Dm7, '8')} r8 ${chord(DV.G7, '4')}`],
        rest(8),
      ),
    },
    sad: { inst: 'slowstrings', tr: 2, pan: -0.1, rev: 0.45, vol: 0.4, mml: join(rest(28), ['_v85'], dPads(BRIDGE).map(b => b.replace(/o(\d)/g, (_, k) => `o${Number(k) + 1}`))) },
    kit: {
      inst: 'kick', drums: true, rev: 0.14, vol: 0.75,
      mml: join(
        ['_v100'], ['r1', 'r1', 'r1', STUMBLE],
        [SHUF_IN, ...rep(SHUF, 2), STUMBLE, ...rep(SHUF, 3), STUMBLE, ...rep(SHUF, 3), STUMBLE],
        [STOP, STOP, STOP, STOP_PICK, SHUF_IN, ...rep(SHUF, 6), STUMBLE],
        ['_v80'], [SAD_IN, ...rep(SAD, 6), STUMBLE],
      ),
    },
  },
  arrangements: {
    main: {},
    hush: { solo: ['organ'], vol: { organ: 0.8 }, lowpass: 800, level: 0.35 },
    intro: { solo: ['bone', 'piano', 'bass', 'organ', 'sad'], vol: { piano: 0.7 }, level: 0.85 },
  },
};
