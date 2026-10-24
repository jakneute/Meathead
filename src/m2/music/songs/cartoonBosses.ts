// CARTOON LAND's fights: the five pundits (the White House's sub-bosses) and DAD GUY (the land's boss). The land's
// theme is in cartoon.ts. Both at Mega Man boss intensity.
//
// ---- "THOSE MEAN MEN" (boss:perot, boss:falwell, boss:limbaugh, boss:dole, boss:newt) ----
// The pundits are one Saturday morning show's villains, so they share one theme: the cartoon villain's stomp (Dr.
// Claw, Skeletor, Snidely Whiplash) as a heavy march-metal boss fight: the march's tune on a growling tenor sax with a
// trombone an octave under it, the guitars and the bass stomping it in unison, a snare cadence over a pounding kick, the
// brass's stabs on two and four, a square lead sneaking in the gaps; a B gloating in the relative major (the pundit's
// own instrument on top, the bass pumping); a C creeping up the Neapolitan (A minor / B-flat, the "nyeh-heh-heh") over
// palm-muted sixteenths. Each pundit's arrangement is his own: his instrument on the gloat, his tag at the end of
// every eight bars, his colors under it all:
//   perot     Texas: a banjo on the gloat, an accordion's stabs, a marimba sneaking, woodblock clip-clop, a harmonica lick
//   falwell   church: a pipe organ on the gloat and the pad, the choir, vibes sneaking, an organ "A-men" (iv - i) tag
//   limbaugh  the radio show's bumper: a distorted guitar on the gloat, a Hammond's stabs, a rock kit, a riff tag
//   dole      the old soldier: a trumpet on the gloat, a bugle charge tag (a Picardy third), a fife (flute) sneaking
//   newt      the Oval Office finale, the biggest: the brass section on the gloat, the choir, the hits, a "CONTRACT!" tag
// No anthem, no fanfare (the broomsticks'), no symphonic metal (Piper's), no waltz; tenor sax leads no other.
// Written in A minor, played in B minor (every pitched part tr +2), 140. 36 bars: a 4-bar entrance (once: "dun, dun...
// DUNNN", Am - Am - F - E7), A (Am - Am - Dm - E7 - Am - F - Dm E7 - Am), A' (Am - Am - Dm - E7 - F - Bdim E7 - Am -
// Dm G7), B (C - G7 - G7 - C - F - C A7 - Dm G7 - C: the gloat), C (Am - Bb - Am - Bb - F - E7 - Am - E7: the creep).
// ARRANGEMENTS (cues.ts bossArrs: the pundit's name): perot, falwell, limbaugh, dole, newt; main (the sound test).
//
// ---- "IT'S FIVE O'CLOCK SOMEWHERE" (boss:stupid-dad) ----
// DAD GUY LIVE!: Honk Azoria, drunk on the couch in front of the same tape every show. The land's sitcom theme
// drunk, as a fast, heavy blues-rock shuffle (a bar band at last orders, going for it): a 12-bar blues in D with the
// sitcom's hook slurred onto a trombone (the blue third bent in, the ends falling off), a boogie riff on the piano's
// left hand, the bass and the power chords together, a Hammond on the fast Leslie, a heavy swung kit with fills that
// trip over themselves, a stop-time second chorus where the band hits and waits ("BOY!"), a distorted guitar
// answering; and a bridge where the sitcom's old theme comes back sober over strings, then sours (the minor iv, the
// flat-six seventh) and staggers home. No other boss has a blues, a shuffle, a trombone lead or D major.
// Written in C, played in D (every pitched part tr +2), 146, a heavy shuffle (swing). 36 bars: a 4-bar intro (once:
// the sitcom's head on a lone tipsy piano, the trombone's pickup), A (12: C7 - F7 - C7 - C7 - F7 - F#dim7 - C7 - A7 -
// Dm7 - G7 - C7 A7 - Dm7 G7), B (12: the same, stop-time for four, the trombone filling), C (8: C - A7 - Dm7 - G7 - Fm6 -
// C - Ab7 - G7: the sitcom's own theme, then the sour turn home).
// ARRANGEMENTS (cues.ts bossArrs, by amphi/index.ts stupidDadMusic): hush (the show stopped dead: a Hammond humming,
// muffled), intro (the family glitching, him heaving himself up and crushing the can: the trombone, the piano, the
// bass, the organ, no drums), main (him coming on, and the fight to come).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, pat, pads, sec, troll, g1, cx, KIT, FILL } from './mmkit';

// =====================================================================================================================
// THOSE MEAN MEN (A minor, tr +2)

const P_IN: Bar[] = ['Am', 'Am', 'F', 'E7'];
const PA: Bar[] = ['Am', 'Am', 'Dm', 'E7', 'Am', 'F', ['Dm', 'E7'], 'Am'];
const PA2: Bar[] = ['Am', 'Am', 'Dm', 'E7', 'F', ['Bdim', 'E7'], 'Am', ['Dm', 'G7']];
const PB: Bar[] = ['C', 'G7', 'G7', 'C', 'F', ['C', 'A7'], ['Dm', 'G7'], 'C'];
const PC: Bar[] = ['Am', 'Bb', 'Am', 'Bb', 'F', 'E7', 'Am', 'E7'];
const P_LOOP: Bar[] = [...PA, ...PA2, ...PB, ...PC];
const P_ALL: Bar[] = [...P_IN, ...P_LOOP];

/** The march: dum, da-da DUM, dum. */
const T_IN = ['o2 a4 r4 a4 r4', 'o2 a4 r4 a4 r4', 'o2 f2. r4', 'o2 e2 g+4 b4'];
const T_A = ['o2 a4 o3 c8 e8 a4 e4', 'o3 c4 o2 b8 a8 g+4 e4', 'o2 d4 f8 a8 o3 d4 c4', 'o2 b4 g+8 e8 b4 r4', 'o2 a4 o3 c8 e8 a4 g4', 'o3 f4 e8 d8 c4 o2 a4', 'o2 f4 d4 e4 g+4', 'o2 a4 e4 a4 r4'];
const T_A2 = [...T_A.slice(0, 4), 'o3 c4 o2 a8 f8 o3 c4 f4', 'o3 d4 o2 b4 g+4 e4', 'o2 a4 o3 c4 e4 a4', 'o3 f4 d4 o2 b4 g4'];
const T_C = ['o2 a8 a8 a8 b8 o3 c4 o2 a4', 'o2 b-8 b-8 b-8 o3 c8 d4 o2 b-4', 'o3 c8 c8 c8 d8 e4 c4', 'o3 d8 d8 d8 e-8 f4 d4', 'o3 f4 e4 d4 c4', 'o2 b4 g+4 e4 g+4', 'o2 a4 o3 c4 e4 a4', 'o3 g+4 e4 o2 b4 g+4'];
const MARCH = [...T_IN, ...T_A, ...T_A2, ...rest(8), ...T_C];
const GLOAT = ['o4 g4. g8 o5 c4 o4 g4', 'o4 f4. e8 d4 g4', 'o4 b4. a8 g4 f4', 'o4 e2 c4 r4', 'o4 a4. a8 o5 c4 o4 a4', 'o4 g4 e4 c+4 e4', 'o4 f4 a4 g4 b4', 'o5 c4 o4 g4 c4 r4'];
const P_COUNTER_A2 = ['o4 e1', 'o4 e2 f2', 'o4 f1', 'o4 e1', 'o4 c1', 'o4 d2 d2', 'o4 c2 e2', 'o4 d2 o3 b2'];
const P_COUNTER_C = ['o4 e1', 'o4 f1', 'o4 e1', 'o4 f1', 'o4 a1', 'o4 g+1', 'o4 a1', 'o4 g+1'];
const X_A = ['r1', 'r2 o5 e16 d+16 e16 f16 e8 r8', 'r1', 'r2 o5 g+16 a16 b16 o6 c16 o5 b8 r8', 'r1', 'r2 o5 a16 g16 f16 e16 f8 r8', 'r1', 'r2 o5 e8 r8 o4 a8 r8'];
const X_C = ['r2 o5 a16 b16 o6 c16 d16 e8 r8', 'r2 o5 b-16 o6 c16 d16 e-16 f8 r8', 'r2 o6 c16 d16 e16 f16 e8 r8', 'r2 o6 d16 e-16 f16 g16 f8 r8', 'r1', 'r2 o5 g+16 a16 b16 o6 c16 o5 b8 r8', 'r1', 'r2 o5 b8 r8 g+8 r8'];

const TAGS: Record<string, string[]> = {
  perot: ['r2 o5 e8 g8 a4', 'r2 o5 f8 a8 b4', 'r2 o5 e8 g8 o6 c4', 'r2 o5 d8 e8 g+4'],
  falwell: ['o4 r2 {d f a}4 {c e a}4', 'o4 r2 {d f a}4 {d f g b}4', 'o4 r2 {c f a}4 {c e g}4', 'o4 r2 {d f a}4 {d e g+ b}4'],
  limbaugh: ['o4 a8 a8 o5 c8 o4 a8 o5 d8 c8 o4 a8 g8', 'o4 d8 d8 f8 d8 g8 g8 b8 g8', 'o4 c8 c8 e8 c8 g8 e8 c8 o3 g8', 'o4 e8 e8 g+8 e8 b8 g+8 e8 d8'],
  dole: ['o4 e8 a8 o5 c+8 e8 r8 c+8 e4', 'o4 g8 b8 o5 d8 g8 r8 d8 g4', 'o4 g8 o5 c8 e8 g8 r8 e8 g4', 'o4 e8 g+8 b8 o5 e8 r8 o4 b8 o5 e4'],
  newt: [
    `${cx('Am', 64, '8')} r8 ${cx('Am', 64, '8')} r8 ${cx('F', 65, '4')} ${cx('E', 64, '4')}`,
    `${cx('Dm', 62, '8')} r8 ${cx('Dm', 62, '8')} r8 ${cx('Dm', 62, '4')} ${cx('G7', 62, '4')}`,
    `${cx('C', 64, '8')} r8 ${cx('C', 64, '8')} r8 ${cx('F', 65, '4')} ${cx('C', 64, '4')}`,
    `${cx('E7', 62, '8')} r8 ${cx('E7', 62, '8')} r8 ${cx('E7', 62, '4')} ${cx('E7', 62, '4')}`,
  ],
};
/** A tag part: rests, and the tag on the last bar of every eight of the loop. */
const tagPart = (t: string[]) => join(rest(11), [t[0]], rest(7), [t[1]], rest(7), [t[2]], rest(7), [t[3]]);
const PK = '{kh}8 ?s16 ?s16 {sh}8 ?s16 ?s16 {kh}8 ?s16 ?s16 {sh}8 s16 s16';
const CLOP = '(woodblock)8. (woodblocklo)16 (woodblock)8. (woodblocklo)16 (woodblock)8. (woodblocklo)16 (woodblock)8. (woodblocklo)16';

export const BOSS_PUNDITS: Song = {
  title: 'Those Mean Men',
  bpm: 140,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.65,
  delay: { beats: 0.5, feedback: 0.2, tone: 2600 },
  parts: {
    theme: { inst: 'tenorsax', tr: 2, pan: 0.05, rev: 0.2, dly: 0.06, mml: join(['_v112'], up(MARCH)) },
    low: { inst: 'trombone', tr: 2, pan: -0.15, rev: 0.22, vol: 0.55, mml: join(['q6 _v108'], up(MARCH)) },
    counter: { inst: 'horn', tr: 2, pan: -0.3, rev: 0.32, vol: 0.45, mml: join(['_v85'], ['o3 a1', 'o3 a1', 'o4 c1', 'o3 b1'], rest(8), P_COUNTER_A2, rest(8), P_COUNTER_C) },
    tagB: { inst: 'trombone', tr: 2, pan: 0.1, rev: 0.25, vol: 0.85, mml: join(['_v108'], rest(20), GLOAT, rest(8)) },
    pad: { inst: 'strings', tr: 2, pan: 0.1, rev: 0.38, vol: 0.26, mml: join(['_v80'], pads(P_ALL, 55)) },
    gtr: { inst: 'chug', tr: 2, pan: -0.4, rev: 0.08, vol: 0.45, mml: join(['q6 _v112'], up(T_IN, 0), T_A, T_A2, ['@powerchord'], pat(PB, '!R4. R8 R2', 38), ['@chug _v116'], pat(PC, '!R16 R16 R16 R16', 38), ['@']) },
    bass: { inst: 'bass', tr: 2, pan: 0, rev: 0.05, vol: 0.78, mml: join(['q6 _v108'], up(T_IN, -1), up(T_A, -1), up(T_A2, -1), pat(PB, "B8 B'8 B8 B'8", 26), pat(PC, "!B8 B8 B8 B8", 26)) },
    pah: { inst: 'brass', tr: 2, pan: 0.25, rev: 0.25, vol: 0.42, mml: join(['_v100 q5'], [`${cx('Am', 60, '4')} r4 ${cx('Am', 60, '4')} r4`, `${cx('Am', 60, '4')} r4 ${cx('Am', 60, '4')} r4`, `q8 _e60 _e127/2. ${cx('F', 60, '2.')} r4`, `q5 ${cx('E7', 59, '8')} r8 ${cx('E7', 59, '8')} r8 ${cx('E7', 59, '4')} ${cx('E7', 59, '4')}`], ['_v92'], pat(P_LOOP, 'r4 !X8 r8 r4 !X8 r8', 59)) },
    xylo: { inst: 'squarelead', tr: 2, pan: 0.35, rev: 0.22, dly: 0.12, vol: 0.38, mml: join(['_v95'], ['r1', 'r1', 'r1', X_A[3]], X_A, X_A, rest(8), X_C) },
    hits: { inst: 'orchstab', tr: 2, pan: 0, rev: 0.3, vol: 0.45, mml: join(['_v104'], ['r1', 'r1', 'o4 f2 r2', 'o4 e4 r2.'], ['r1', 'r1', 'r1', 'o4 e4 r2.', 'r1', 'o4 f4 r2.', 'r1', 'r1'], ['r1', 'r1', 'r1', 'o4 e4 r2.', 'o4 f4 r2.', 'r1', 'r1', 'o4 r2 g4 r4'], ['o4 c4 r2.', 'r1', 'r1', 'r1', 'o4 f4 r2.', 'r1', 'r1', 'o4 c4 r2.'], ['r1', 'o4 b-4 r2.', 'r1', 'o4 b-4 r2.', 'o4 f4 r2.', 'o4 e4 r2.', 'r1', 'o4 e4 r4 e4 r4']) },
    timp: { inst: 'timpani', tr: 2, pan: -0.15, rev: 0.3, vol: 0.5, mml: join(['_v105'], ['o2 a4 r4 a4 r4', 'o2 a4 r4 a4 r4', 'o2 f2. r4', troll('o2 e')], ['_v100'], P_LOOP.map((b, i) => (i % 4 === 0 || i % 4 === 3 ? pat([g1(b)], 'B4 r2.', 38)[0] : 'r1'))) },
    choir: { inst: 'choir', tr: 2, pan: 0, rev: 0.45, vol: 0.4, only: ['newt', 'falwell'], mml: join(['_v80'], rest(12), pads([...PA2, ...PB, ...PC], 55)) },
    kit: { inst: 'kick', drums: true, rev: 0.12, vol: 0.72, not: ['limbaugh'], mml: join(['_v108'], ['{kx}4 r4 k4 r4', 'k4 r4 k4 r4', '{kx}2. r4', FILL.roll], ['_v102'], sec(8, PK, FILL.toms), sec(8, PK, FILL.snare), sec(8, KIT.drive, FILL.toms), sec(8, KIT.dbl, FILL.big)) },
    rock: { inst: 'kick', drums: true, rev: 0.12, vol: 0.72, only: ['limbaugh'], mml: join(['_v108'], ['{kx}4 r4 k4 r4', 'k4 r4 k4 r4', '{kx}2. r4', FILL.toms], ['_v102'], sec(8, KIT.rock, FILL.toms), sec(8, KIT.mm, FILL.snare), sec(8, KIT.drive, FILL.toms), sec(8, KIT.mm, FILL.big)) },
    clop: { inst: 'woodblock', drums: true, pan: -0.25, rev: 0.15, vol: 0.42, only: ['perot'], mml: join(['_v85'], rest(4), rep(CLOP, 32)) },
    tagPerot: { inst: 'harmonica', tr: 2, pan: 0.3, rev: 0.25, vol: 0.7, only: ['perot'], mml: join(['_v108'], [tagPart(TAGS.perot)]) },
    tagFalwell: { inst: 'churchorgan', tr: 2, pan: 0, rev: 0.45, vol: 0.5, only: ['falwell'], mml: join(['_v100'], [tagPart(TAGS.falwell)]) },
    tagLimbaugh: { inst: 'overdrive', tr: 2, pan: -0.3, rev: 0.15, vol: 0.6, only: ['limbaugh'], mml: join(['_v112'], [tagPart(TAGS.limbaugh)]) },
    tagDole: { inst: 'trumpet', tr: 2, pan: 0.3, rev: 0.3, vol: 0.65, only: ['dole'], mml: join(['_v112'], [tagPart(TAGS.dole)]) },
    tagNewt: { inst: 'brass', tr: 2, pan: 0, rev: 0.3, vol: 0.7, only: ['newt'], mml: join(['_v116'], [tagPart(TAGS.newt)]) },
  },
  arrangements: {
    main: {},
    perot: { inst: { tagB: 'banjo', pah: 'accordion', xylo: 'marimba' }, vol: { pah: 1.1, xylo: 1.2 } },
    falwell: { inst: { tagB: 'churchorgan', pad: 'churchorgan', xylo: 'vibes' }, vol: { pad: 0.85, tagB: 0.75, xylo: 1.1 } },
    limbaugh: { inst: { tagB: 'distlead', pah: 'organ', xylo: 'organ' }, vol: { tagB: 0.75, pah: 1.1, gtr: 1.15 } },
    dole: { inst: { tagB: 'trumpet', xylo: 'flute' }, vol: { kit: 1.1, xylo: 1.1 } },
    newt: { inst: { tagB: 'brass' }, vol: { hits: 1.4, timp: 1.4, counter: 1.3, pad: 1.3, theme: 1.1, gtr: 1.1 } },
  },
};

// =====================================================================================================================
// IT'S FIVE O'CLOCK SOMEWHERE (C, tr +2)

const D_IN: Bar[] = ['C', 'A7', 'Dm7', 'G7'];
const BLUES: Bar[] = ['C7', 'F7', 'C7', 'C7', 'F7', 'F#dim7', 'C7', 'A7', 'Dm7', 'G7', ['C7', 'A7'], ['Dm7', 'G7']];
const BRIDGE: Bar[] = ['C', 'A7', 'Dm7', 'G7', 'Fm6', 'C', 'Ab7', 'G7'];
/** The boogie riff: up the chord to its seventh and the octave, and back down. */
const BOOGIE = "!08 18 28 38 0'8 38 28 18";
const SITCOM_HEAD = ['o5 c8 d8 e8 g8 r8 e8 g4', 'o5 a4 g8 e8 c+4 e4', 'o5 f8 e8 f8 a8 r8 f8 a4', 'o5 b4 a8 g8 f4 r4'];
const BONE_A = [
  'o3 c8 d8 _b-1 e8 g8 r8 e8 g4', 'o3 a4 g8 e-8 _f-4 c2', 'o3 c8 d8 _b-1 e8 g8 r8 b-8 o4 c4', 'o4 _b-2 c2. r4',
  'o3 f8 g8 a8 o4 c8 r8 o3 a8 o4 c4', 'o4 e-4 c8 o3 a8 f+2', 'o3 g4 e8 c8 _b-1 e4 c4', 'o3 c+4 e4 g4 b-4',
  'o3 a2 f4 d4', 'o3 b4 o4 d4 f4 _f-4 d4', 'o4 c4 o3 g4 c+4 e4', 'o3 f8 e8 d8 f8 _b-1 b4 r4',
];
const BONE_B = [
  'r4 o3 g8 b-8 o4 c4 r4', 'r4 o4 e-8 c8 _f-4 o3 g2', 'r4 o3 g8 b-8 o4 c8 e-8 f8 f+8', 'o4 _b-1 g2 _f-7 e-4 r4',
  'o4 f4 e-8 c8 o3 a4 f4', 'o3 f+4 a4 o4 c4 e-4', 'o3 g4 o4 c4 _b-1 e4 c4', 'o3 a4 o4 c+4 e4 g4',
  'o3 f4 a4 o4 c4 d4', 'o4 d4 o3 b4 g4 f4', 'o3 e4 g4 a4 c+4', 'o3 d4 f4 g4 r4',
];
const BONE_C = ['o3 c8 d8 e8 g8 r8 e8 g4', 'o3 a4 g8 e8 c+4 e4', 'o3 f8 e8 f8 a8 r8 f8 a4', 'o3 b4 a8 g8 f4 d4', 'o3 a-2 f4 d4', 'o3 e2. g4', 'o3 g-4 e-4 c4 o2 a-4', 'o2 b4 o3 d4 f4 g4'];
const GTR_12 = ['r1', 'r1', 'r1', 'r2 o4 e-8 e8 g8 b-8', 'r1', 'r1', 'r1', 'r2 o4 c+8 e8 g8 b-8', 'r1', 'r1', 'r1', 'r2 o4 g8 a8 b-8 b8'];
const SHUF = '{kh}8 ?h8 {sh}8 ?h8 {kh}8 {kh}8 {sh}8 ?h8';
const STUMBLE = 's16 ?s16 r8 (tom1)8. (tom2)16 (tom3)8 (tom4)8 !{kx}4';
const STOP = '!{kx}8 r8 r2.';
const STOP_PICK = '!{kx}8 r8 r4 s8 s8 s8 s8';

export const BOSS_STUPID_DAD: Song = {
  title: "It's Five O'Clock Somewhere",
  bpm: 146,
  swing: 0.6, grid: 8,
  loopFrom: 16,
  reverb: 'room',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.2, tone: 2400 },
  parts: {
    bone: { inst: 'trombone', tr: 2, pan: 0.05, rev: 0.22, dly: 0.08, mml: join(['_m30 _v112'], ['r1', 'r1', 'r1', 'r2 r8 o3 a8 b-8 b8'], BONE_A, ['_v108'], BONE_B, ['_v98'], BONE_C) },
    piano: { inst: 'piano', tr: 2, pan: -0.2, rev: 0.2, vol: 0.55, mml: join(['_v88'], SITCOM_HEAD, ['_v104 q6'], pat([...BLUES, ...BLUES], BOOGIE, 36), ['q7 _v82'], pat(BRIDGE, 'X4 r4 X4 r4', 60)) },
    organ: { inst: 'organ', tr: 2, pan: 0.25, rev: 0.28, cho: 0.25, vol: 0.3, mml: join(['_v75'], pads(D_IN, 55), ['_v92'], pads([...BLUES, ...BLUES], 55), ['_v80'], pads(BRIDGE, 55)) },
    bass: { inst: 'bass', tr: 2, pan: 0, rev: 0.05, vol: 0.8, mml: join(['q7 _v108'], ['r1', 'r1', 'r1', 'o2 g4 a4 b-4 b4'], pat([...BLUES, ...BLUES], BOOGIE, 26), pat(BRIDGE, 'B2. B4', 26)) },
    gtr: { inst: 'powerchord', tr: 2, pan: -0.4, rev: 0.1, vol: 0.42, mml: join(rest(4), ['_v108'], pat(BLUES, '!R8 R8 R8 R8 !R8 R8 R8 R8', 38), pat(BLUES.slice(0, 4), '!R8 r8 r2.', 38), pat(BLUES.slice(4), '!R8 R8 R8 R8 !R8 R8 R8 R8', 38), ['_v95'], pat(BRIDGE, '!R2 R2', 38)) },
    lead: { inst: 'overdrive', tr: 2, pan: 0.4, rev: 0.18, vol: 0.45, mml: join(['_v104'], rest(4), GTR_12, GTR_12, rest(8)) },
    brass: { inst: 'brass', tr: 2, pan: 0.3, rev: 0.25, vol: 0.5, mml: join(['_v108'], rest(4), rest(11), [`r2 ${cx('Dm7', 57, '8')} r8 ${cx('G7', 57, '4')}`], rep(`${cx('C7', 57, '8')} r8 r2.`, 4), rest(7), [`r2 ${cx('Dm7', 57, '8')} r8 ${cx('G7', 57, '4')}`], rest(8)) },
    sad: { inst: 'strings', tr: 2, pan: -0.1, rev: 0.42, vol: 0.4, mml: join(rest(28), ['_v88'], pads(BRIDGE, 67)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.75,
      mml: join(['_v104'], ['r1', 'r1', 'r1', STUMBLE], [...sec(4, SHUF, STUMBLE), ...rep(SHUF, 3), STUMBLE, ...rep(SHUF, 3), STUMBLE], [STOP, STOP, STOP, STOP_PICK, ...sec(7, SHUF, SHUF), STUMBLE], ['_v95'], sec(8, '{ki}8 i8 {si}8 i8 {ki}8 {ki}8 {si}8 i8', STUMBLE)),
    },
  },
  arrangements: {
    main: {},
    hush: { solo: ['organ'], vol: { organ: 1.2 }, lowpass: 800, level: 0.35 },
    intro: { solo: ['bone', 'piano', 'bass', 'organ', 'sad'], vol: { piano: 0.8 }, level: 0.85 },
  },
};
