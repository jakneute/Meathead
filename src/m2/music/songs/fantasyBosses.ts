// FAIRY LAND's fights: the FAIRY WHEEL (trial one), the BROOMSTICK DEATHMATCH (the final trial) and PIPER THE PIXIE
// (the land's boss). The land's theme and Truelling Tragons are in fantasy.ts. All three at Mega Man boss intensity.
//
// ---- "PICK ME! PICK ME!" (boss:fairy-wheel) ----
// Trial one: eight beefy suitors in the gondolas of a gigantic fairy Ferris wheel, throwing crap, and the QTEs in their
// carts. Piper's trials are a dating show with a body count, so it's a 70s game-show theme gone to a disco-funk boss
// fight: the hook on an alto sax (a second sax in thirds at the end), a slap bass popping octaves, a sixteenth disco
// kit with open hats, a clavinet chopping the jazzy chords, the brass section answering and falling off, a trombone
// smearing up into every turnaround, the oohs' "bah"s, the wheel's fairy dust (a harp glissando round every corner).
// No march, no waltz, no open trumpet out front.
// F major, 162. 44 bars: a 4-bar game-show open (once: three dings, the harp, the vamp, the brass's "PICK ME!"), A
// (Fmaj7 - Bb/C - Fmaj7 - Am7 D7 - Gm7 - C7sus C7 - Am7 Dm7 - Gm7 C7), A' (the brass answering), B (Abmaj7 - Dbmaj7 -
// Abmaj7 - Bbm7 Eb7 - Abmaj7 - Dbmaj7 - Gm7 - C7: up a minor third, the strings), C (Dm7 - G7 - Cm7 - F7 - Bbmaj7 - Eb7
// - Am7 D7 - Gm7 C7: the shout chorus round the cycle of fourths, power chords), A'' (everything, the twin saxes).
// ARRANGEMENTS (cues.ts bossArrs): main (the trial), qte (in a suitor's gondola: the think music: the bass, the clav,
// the oohs, a ticking clock, the tambourine).
//
// ---- "LAST MAN FLYING" (boss:broomsticks) ----
// The final trial: behind his back on a broomstick, Star Fox 64's all-range mode round the Great Pixie's castle. An
// orchestral flying march on a rock engine: the violins soaring on the John Williams-style theme (up a fifth and an
// octave, the Lydian raised fourth, the flat-seven chord, the minor iv into the dominant), the brass's hits pushed into
// the next bar, a pumping synth bass, power chords, a sixteenth kit, orchestra hits, harp glissandi; a B in C minor
// for the enemy (the march on the brass, the strings driving, the snare rolling); a C a half step up in D-flat because
// it's earned it (the theme on everything, the choir, the glock), sliding home Ab7 - G7.
// C major (D-flat for C), 168. 36 bars: a 4-bar fanfare (once), A (C - Bb - Am - F G - C - E7 - Am D7 - Fm6 G7), A'
// (the horns in counterpoint), B (Cm - Ab - Bb - G - Cm - Ab - Db - G7), C (Db - B - Bbm - Gb Ab - Db - F7 - Bbm Eb7 -
// Ab7 G7).
// ARRANGEMENTS (cues.ts bossArrs): main (the first lot), late (the late entries: the choir, taiko, louder), win (the
// barrier wilting, the window and the zoom: no drums, the theme, the choir, the horns, the harp).
//
// ---- "IT AIN'T OVER" (boss:piper) ----
// Piper the Pixie, morbidly obese, gone to rage at being called fat, her quake slams wrecking her princess chambers:
// it ain't over till the fat lady sings. A rage aria (the Queen of the Night) as symphonic metal: the aria on a solo
// violin (the soprano's leaps), palm-muted chugs on a Phrygian riff, the strings' Alberti eighths, the brass's
// classical stabs, a pumping bass and a pounding kit; a B of coloratura (staccato triplet arpeggios up past the high A
// on the violin and a flute, the choir holding the fat lady's long notes, power chords); a C for the slams (half time,
// gong and china, the trombones heaving up the flat two, the violin shrieking); A' with the runs and a double kick.
// No organ or harpsichord (Donnie's), no thrash gallop (the demon's), no keytar (Steve's).
// Written in D minor, played in E-flat minor (every pitched part tr +1), 152. 32 bars: A (Dm - Dm/C - Gm/Bb - A7 - Dm
// - F/C - Bb - A7), B (Dm - Gm - C7 - F - Bb - Gm - E7 - A7), C (Dm - Eb - Dm - Eb - Bb - A - Bb - A7), A'.
// ARRANGEMENTS (cues.ts bossArrs, by the fight): intro (the door, her purring on the chaise: the violin quiet over the
// harp, slow strings, a flute's coloratura), awkward (him seeing her: a clock ticking and the bass plodding), main
// (ENRAGED on), fury (her last third: double kick, the choir and brass up), balloon (a flintlock hole, round the room:
// the aria on a theremin, a slide whistle, a tuba), death (her deaths: the aria on the violin alone over the harp and
// the choir, a mock requiem).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, pat, pads, harm, scale, sec, troll, g2, cx, KIT, FILL } from './mmkit';

// =====================================================================================================================
// PICK ME! PICK ME! (F major)

const W_OPEN: Bar[] = ['Bb/C', 'Bb/C', 'Bb/C', 'C7'];
const W_A: Bar[] = ['Fmaj7', 'Bb/C', 'Fmaj7', ['Am7', 'D7'], 'Gm7', ['C7sus', 'C7'], ['Am7', 'Dm7'], ['Gm7', 'C7']];
const W_B: Bar[] = ['Abmaj7', 'Dbmaj7', 'Abmaj7', ['Bbm7', 'Eb7'], 'Abmaj7', 'Dbmaj7', 'Gm7', 'C7'];
const W_C: Bar[] = ['Dm7', 'G7', 'Cm7', 'F7', 'Bbmaj7', 'Eb7', ['Am7', 'D7'], ['Gm7', 'C7']];
const W_LOOP: Bar[] = [...W_A, ...W_A, ...W_B, ...W_C, ...W_A];

const W_HOOK = ['o5 r8 c8 d8 c8 o4 a4 o5 c4', 'o4 r8 b-8 o5 c8 o4 b-8 g4 b-4', 'o5 r8 c8 d8 c8 o4 a8 o5 c8 f8 a8', 'o5 g4 f8 e8 f+4 a4', 'o5 r8 d8 e-8 d8 o4 b-4 o5 d4', 'o5 c4 f4 e4 c4', 'o5 r8 e8 f8 e8 c8 e8 a8 g8', 'o5 f4 g8 f8 e4 r4'];
const W_HOOK_TWIN = harm(W_HOOK, [scale('f', 'major'), scale('f', 'major'), scale('f', 'major'), scale('g', 'minor'), scale('f', 'major'), scale('f', 'major'), scale('f', 'major'), scale('f', 'major')]);
const W_BMEL = ['o5 c2 e-4 g4', 'o5 f2. e-4', 'o5 c4 e-4 a-4 g4', 'o5 f2 g2', 'o5 a-4. g8 e-4 c4', 'o5 f4. e-8 c4 o4 a-4', 'o5 b-2 g4 f4', 'o5 e4 g4 b-4 r4'];
const W_SHOUT = ['o5 f8 f8 r8 f8 r8 e8 f4', 'o5 f8 f8 r8 f8 r8 e8 d4', 'o5 e-8 e-8 r8 e-8 r8 d8 e-4', 'o5 e-8 e-8 r8 e-8 r8 c8 o4 a4', 'o5 d8 d8 r8 d8 r8 c8 d4', 'o5 d-8 d-8 r8 d-8 r8 c8 d-4', 'o5 c4 e4 f+4 a4', 'o5 b-4 a4 g4 e4'];
const W_GLISS = 'o4 c32 d32 e32 f32 g32 a32 b-32 o5 c32 d32 e32 f32 g32 a32 b-32 o6 c32 d32';
const SMEAR = 'r2 _b-5/4 o3 c2';
const DISCO = '{kh}16 ?h16 o8 {sh}16 ?h16 o16 k16 {kh}16 ?h16 o8 {sh}16 ?h16 o8';
const TICK = '(woodblock)4 (woodblocklo)4 (woodblock)4 (woodblocklo)4';

export const BOSS_FAIRY_WHEEL: Song = {
  title: 'Pick Me! Pick Me!',
  bpm: 162,
  loopFrom: 16,
  reverb: 'plate',
  reverbMix: 0.75,
  delay: { beats: 0.75, feedback: 0.25, tone: 3000 },
  parts: {
    lead: { inst: 'sax', pan: 0.05, rev: 0.22, dly: 0.12, mml: join(rest(4), ['_v110'], W_HOOK, W_HOOK, ['_v104'], rest(8), rest(8), ['_v114'], W_HOOK) },
    twin: { inst: 'sax', pan: 0.35, rev: 0.22, vol: 0.5, mml: join(rest(36), ['_v104'], W_HOOK_TWIN) },
    glock: { inst: 'glock', pan: 0.35, rev: 0.32, vol: 0.38, mml: join(['_v110'], ['o6 c4 f4 a4 r4', 'r1', 'r1', 'r1'], rest(40)) },
    oohs: { inst: 'oohs', pan: -0.1, rev: 0.38, vol: 0.45, mml: join(['_v60'], pads(W_OPEN, 57), ['_v62'], pads(W_A, 57), pads(W_A, 57), ['q3 _v90'], pat(W_B, 'r4 X4 r4 X4', 57), ['q7'], rest(8), ['_v80'], pads(W_A, 57)) },
    brass: {
      inst: 'brass', pan: 0.2, rev: 0.28, vol: 0.55,
      mml: join(['_v112'], ['r1', 'r1', `r2 ${cx('Bb/C', 60, '8')} r8 ${cx('Bb/C', 60, '4')}`, `${cx('C7', 60, '2')} _f-4 ${cx('C7', 60, '4')} r4`],
        rest(8), ['_v98'], W_A.map((b, i) => (i % 2 === 0 ? 'r1' : `r2 ${cx(g2(b), 60, '8')} r8 _f-3 ${cx(g2(b), 60, '4')}`)), rest(8), ['_v114'], W_SHOUT, ['_v102'], W_A.map((b, i) => (i % 2 === 0 ? 'r1' : `r2 ${cx(g2(b), 60, '8')} r8 _f-3 ${cx(g2(b), 60, '4')}`))),
    },
    trombone: { inst: 'trombone', pan: -0.3, rev: 0.28, vol: 0.5, mml: join(['_v100'], ['r1', 'r1', 'r1', SMEAR], [...rest(7), SMEAR], [...rest(7), SMEAR], [...rest(7), SMEAR], ['_v108'], up(W_SHOUT, -2), [...rest(7), SMEAR]) },
    strings: { inst: 'strings', pan: 0.25, rev: 0.38, vol: 0.55, mml: join(rest(12), ['_v55'], pads(W_A, 57), ['_v100'], W_BMEL, ['_v62'], pads(W_C, 57), ['_v70'], pads(W_A, 57)) },
    harp: { inst: 'harp', pan: -0.4, rev: 0.4, vol: 0.5, mml: join(['_v95'], ['r1', `${W_GLISS} r2`, 'r1', 'r1'], ...Array.from({ length: 5 }, () => [...rest(7), `r2 ${W_GLISS}`])) },
    clav: { inst: 'clav', pan: -0.25, rev: 0.12, vol: 0.38, mml: join(['q4 _v92'], pat(W_OPEN, 'X16 r16 X16 r16 r8 X16 r16 X8 r8 X16 X16 r8', 55), pat(W_LOOP, '!X16 r16 X16 r16 r8 X16 r16 X8 r8 X16 X16 r8', 55)) },
    gtr: { inst: 'powerchord', pan: 0.4, rev: 0.1, vol: 0.42, mml: join(rest(28), ['_v110'], pat(W_C, '!R8 R8 r8 R8 !R8 R8 R8 R8', 40), rest(8)) },
    bass: { inst: 'slapbass', pan: 0, rev: 0.05, vol: 0.82, mml: join(['_v105'], pat(W_OPEN.slice(0, 3), "B8 r8 B'8 B8 r8 B8 B'8 r8", 28), pat(['C7'], "B8 18 28 38 B'8 38 28 18", 28), pat(W_LOOP, "!B8 B'16 B16 r16 B16 B'8 !B8 B'16 B16 r16 B16 B'8", 28)) },
    kit: { inst: 'kick', drums: true, rev: 0.12, vol: 0.7, not: ['qte'], mml: join(['_v85'], [DISCO, DISCO, DISCO, FILL.roll], ['_v100'], sec(8, DISCO, FILL.toms), sec(8, DISCO, FILL.snare), sec(8, KIT.mm, FILL.toms), ['_v108'], sec(8, KIT.drive, FILL.big), ['_v104'], sec(8, DISCO, FILL.big)) },
    tamb: { inst: 'tamb', drums: true, pan: 0.3, rev: 0.12, vol: 0.38, mml: join(['_v90'], rep('?j16 j16 !j16 ?j16 ?j16 j16 !j16 ?j16 ?j16 j16 !j16 ?j16 ?j16 j16 !j16 ?j16', 44)) },
    clock: { inst: 'woodblock', drums: true, pan: 0.15, rev: 0.25, vol: 0.55, only: ['qte'], mml: join(['_v100'], rep(TICK, 44)) },
  },
  arrangements: {
    main: {},
    qte: { solo: ['bass', 'clock', 'clav', 'oohs', 'tamb'], vol: { clav: 0.8, oohs: 0.65, tamb: 0.6, bass: 0.8 }, level: 0.85 },
  },
};

// =====================================================================================================================
// LAST MAN FLYING (C major; D-flat for C)

const F_OPEN: Bar[] = ['Cm', 'Ab', 'Bb', 'G7'];
const F_A: Bar[] = ['C', 'Bb', 'Am', ['F', 'G'], 'C', 'E7', ['Am', 'D7'], ['Fm6', 'G7']];
const F_B: Bar[] = ['Cm', 'Ab', 'Bb', 'G', 'Cm', 'Ab', 'Db', 'G7'];
const F_C: Bar[] = ['Db', 'B', 'Bbm', ['Gb', 'Ab'], 'Db', 'F7', ['Bbm', 'Eb7'], ['Ab7', 'G7']];
const F_LOOP: Bar[] = [...F_A, ...F_A, ...F_B, ...F_C];

const FLY = ['o4 g4. o5 c8 g2', 'o5 f4. e8 d4 c4', 'o5 e4. a8 o6 c2', 'o5 b4 a4 g4 d4', 'o4 g4. o5 c8 g2', 'o5 g+4. b8 o6 d2', 'o6 c4. o5 b8 a4 f+4', 'o5 a-4. g8 f4 d4'];
const FLY_UP = ['o4 a-4. o5 d-8 a-2', 'o5 g-4. f8 e-4 d-4', 'o5 f4. b-8 o6 d-2', 'o6 c4 o5 b-4 a-4 e-4', 'o4 a-4. o5 d-8 a-2', 'o5 a4. o6 c8 e-2', 'o6 d-4. c8 o5 b-4 g4', 'o5 g-4. f8 f4 d4'];
const MARCH = ['o4 g4 g8 g8 o5 c4 d4', 'o5 e-2 c4 o4 a-4', 'o4 b-4 b-8 b-8 o5 d4 f4', 'o5 d2 o4 b4 g4', 'o4 g4 g8 g8 o5 c4 e-4', 'o5 a-2 g4 f4', 'o5 a-2 f4 d-4', 'o5 d2 o4 b4 g4'];
const FANFARE = ['o4 g4 g8 g8 o5 c2', 'o5 c4 c8 c8 e-2', 'o5 d4 d8 d8 f2', 'o5 g1'];
const HORN_A = ['o4 e2 g2', 'o4 f2 d2', 'o4 e2 c2', 'o4 c2 d2', 'o4 e2 g2', 'o4 e2 d2', 'o4 e2 f+2', 'o4 f2 f2'];
const HORN_C = ['o4 f1', 'o4 e-1', 'o4 d-1', 'o4 d-2 e-2', 'o4 f1', 'o4 e-1', 'o4 d-2 d-2', 'o4 c2 o3 b2'];
const GL_C = 'o4 c32 d32 e32 f32 g32 a32 b32 o5 c32 d32 e32 f32 g32 a32 b32 o6 c32 d32';
const MARCHK = '{ks}8 ?s16 ?s16 s8 ?s16 ?s16 {ks}8 ?s16 ?s16 !s8 s8';

export const BOSS_BROOMSTICKS: Song = {
  title: 'Last Man Flying',
  bpm: 168,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.22, tone: 3200 },
  parts: {
    lead: { inst: 'strings', pan: 0.15, rev: 0.36, mml: join(rest(4), ['_v104'], FLY, ['_v110'], FLY, rest(8), ['_v116'], FLY_UP) },
    brass: { inst: 'brass', pan: -0.15, rev: 0.32, vol: 0.58, mml: join(['_v116'], FANFARE, ['_v98'], pat(F_A, '!X8 r8 r4 r4 r8 X8', 60), pat(F_A, '!X8 r8 r4 r4 r8 X8', 60), ['_v112'], MARCH, ['_v92'], pads(F_C, 60)) },
    horns: { inst: 'horn', pan: -0.35, rev: 0.38, vol: 0.55, mml: join(['_v90'], ['o4 c1', 'o4 c1', 'o4 d1', 'o4 d1'], rest(8), ['_v98'], HORN_A, ['_v100'], up(MARCH, -1), ['_v100'], HORN_C) },
    choir: { inst: 'choir', pan: 0, rev: 0.48, vol: 0.48, only: ['late', 'win'], mml: join(rest(12), ['_v72'], pads(F_A, 57), ['_v88'], up(MARCH, -1), ['_v100'], up(FLY_UP, -1)) },
    glock: { inst: 'glock', pan: 0.35, rev: 0.38, vol: 0.35, mml: join(rest(28), ['_v80'], up(FLY_UP)) },
    lowstr: { inst: 'strings', pan: -0.1, rev: 0.35, vol: 0.38, mml: join(['_v72'], pads(F_OPEN, 55), ['_v58'], pads([...F_A, ...F_A], 55), ['_v72'], pads(F_B, 55), ['_v80'], pads(F_C, 55)) },
    drive: { inst: 'strings', pan: 0.3, rev: 0.25, vol: 0.38, mml: join(rest(12), ['q4 _v78'], pat(F_A, "08 3'8 18 3'8", 62), ['_v90'], pat(F_B, "08 2'8 18 2'8", 62), rest(8)) },
    pwm: { inst: 'pwm', pan: 0, rev: 0.38, cho: 0.3, vol: 0.2, mml: join(['_v60'], pads([...F_OPEN, ...F_LOOP], 57)) },
    gtr: { inst: 'powerchord', pan: -0.4, rev: 0.1, vol: 0.42, not: ['win'], mml: join(['_v110'], pat(F_OPEN, '!R4 R8 R8 R2', 40), ['_v100'], pat([...F_A, ...F_A], '!R8 R8 R8 !R8 r8 R8 !R8 R8', 40), pat(F_B, '!R8 R16 R16 R8 R16 R16 !R8 R16 R16 R8 R8', 40), pat(F_C, '!R8 R8 R8 R8 !R8 R8 R8 R8', 40)) },
    bass: { inst: 'synthbass', pan: 0, rev: 0.05, vol: 0.6, mml: join(['q6 _v102'], pat([...F_OPEN, ...F_LOOP], "B8 B8 B'8 B8 B8 B8 B'8 B8", 28)) },
    kit: { inst: 'kick', drums: true, rev: 0.14, vol: 0.68, not: ['win'], mml: join(['_v95'], [MARCHK.replace('{ks}', '{kx}'), MARCHK, MARCHK, FILL.roll], ['_v102'], sec(8, KIT.mm, FILL.toms), sec(8, KIT.drive, FILL.big), sec(8, MARCHK, FILL.roll), ['_v110'], sec(8, KIT.mm, FILL.big)) },
    taiko: { inst: 'taiko', drums: true, pan: -0.2, rev: 0.3, vol: 0.5, only: ['late'], mml: join(['_v100'], rest(4), rep('!f4 r8 f8 f4 f8 f8', 32)) },
    timp: { inst: 'timpani', pan: -0.1, rev: 0.35, vol: 0.55, mml: join(['_v110'], ['o2 c4 r2.', 'o2 a-4 r2.', 'o2 b-4 r2.', troll('o2 g')], ['_v105'], ['o2 c4 r2.', ...rest(6), troll('o2 g')], ['o2 c4 r2.', ...rest(6), troll('o2 g')], ['o2 c4 r2.', ...rest(6), troll('o2 a-')], ['o2 d-4 r2.', ...rest(6), troll('o2 g')]) },
    hit: { inst: 'orchhit', pan: 0, rev: 0.35, vol: 0.55, mml: join(['_v110'], ['r1', 'r1', 'r1', 'r2 o4 g4 r4'], ['o4 c4 r2.'], rest(7), ['o4 c4 r2.'], rest(7), rest(8), ['o4 d-4 r2.'], rest(7)) },
    harp: { inst: 'harp', pan: -0.4, rev: 0.45, vol: 0.48, mml: join(['_v90'], ['r1', 'r1', 'r1', `r2 ${GL_C}`], [...rest(7), `r2 ${GL_C}`], [...rest(7), `r2 ${GL_C}`], rest(8), [...rest(7), `r2 ${GL_C}`]) },
  },
  arrangements: {
    main: {},
    late: { vol: { kit: 1.1, brass: 1.1, lead: 1.05, bass: 1.05, gtr: 1.1 } },
    win: { solo: ['lead', 'choir', 'horns', 'harp', 'lowstr', 'glock', 'timp', 'pwm'], vol: { choir: 1.1, lowstr: 1.2 }, level: 0.95 },
  },
};

// =====================================================================================================================
// IT AIN'T OVER (written in D minor: every pitched part tr +1)

const P_A = ['Dm', 'Dm/C', 'Gm/Bb', 'A7', 'Dm', 'F/C', 'Bb', 'A7'];
const P_B = ['Dm', 'Gm', 'C7', 'F', 'Bb', 'Gm', 'E7', 'A7'];
const P_C = ['Dm', 'Eb', 'Dm', 'Eb', 'Bb', 'A', 'Bb', 'A7'];
/** The riff on each chord's root: Phrygian, the flat two. */
const RIFF = '!R16 R16 R8 R16 R16 R8 _k1 R8 _k0 R8 _k-2 R8 _k0 R8';

const ARIA = ['o5 a2. f8 d8', 'o5 a4 o6 d4 c4 o5 a4', 'o5 b-2 g4 d4', 'o5 c+2 e4 a4', 'o5 d4 f4 a4 o6 d4', 'o6 c2. o5 a4', 'o5 b-4 o6 d4 c4 o5 b-4', 'o5 a2. r4'];
const ARIA2 = [
  ...ARIA.slice(0, 3),
  'o5 c+16 e16 g16 a16 o6 c+16 e16 g16 a16 g16 e16 c+16 o5 a16 g16 e16 c+16 o4 a16',
  ...ARIA.slice(4, 7),
  'o6 e16 c+16 o5 a16 e16 o6 e16 c+16 o5 a16 e16 o6 g16 e16 c+16 o5 a16 o6 a4',
];
const SHRIEK = ['o6 a1', 'o6 b-1', 'o6 a1', 'o6 b-1', 'o6 f1', 'o6 e1', 'o6 f1', 'o6 e2 c+2'];
const FAT_LADY = ['o5 f1', 'o5 d1', 'o5 e1', 'o5 f1', 'o5 f1', 'o5 g1', 'o5 g+1', 'o5 a1'];
const HEAVE = ['o3 d2. a4', 'o3 b-2. g4', 'o3 a2 f2', 'o3 g2 e-2', 'o3 f2. d4', 'o3 e2. c+4', 'o3 d2 f2', 'o3 e2 c+4 o2 a4'];
const colo = (prog: string[]) => pat(prog, "012 112 212 112 212 0'12 212 0'12 1'12 2'12 1'12 0'12", 69);
const PK = '{kh}8 h8 {sh}8 k8 {kh}8 h8 {sh}8 h8';
const SLAM = '{kx}4 r8 k8 {s(china)}4 r4';
const SLAM_FILL = '{kx}4 r8 k8 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16';
const K16 = Array.from({ length: 16 }, (_, i) => (i % 4 === 0 ? '!k16' : 'k16')).join(' ');

export const BOSS_PIPER: Song = {
  title: 'It Ain\'t Over',
  bpm: 152,
  reverb: 'cathedral',
  reverbMix: 0.7,
  delay: { beats: 0.75, feedback: 0.2, tone: 2800 },
  parts: {
    lead: { inst: 'violin', tr: 1, pan: 0.05, rev: 0.32, dly: 0.1, mml: join(['_v110'], ARIA, ['q3 _v98'], colo(P_B), ['q7 _v114'], SHRIEK, ['_v114'], ARIA2) },
    flute: { inst: 'flute', tr: 1, pan: 0.3, rev: 0.38, vol: 0.5, mml: join(rest(8), ['q3 _v88'], colo(P_B), ['q7'], rest(16)) },
    choir: { inst: 'choir', tr: 1, pan: 0, rev: 0.48, vol: 0.5, mml: join(rest(8), ['_v92'], FAT_LADY, ['_v108'], pat(P_C, 'X2 r2', 57), ['_v88'], pads(P_A, 57)) },
    brass: { inst: 'brass', tr: 1, pan: -0.2, rev: 0.28, vol: 0.52, mml: join(['_v104'], pat(P_A, '!X8 r8 r8 X8 r2', 60), ['_v82'], pads(P_B, 60), ['_v118'], HEAVE, ['_v108'], pat(P_A, '!X8 r8 r8 X8 r2', 60)) },
    strings: { inst: 'strings', tr: 1, pan: 0.25, rev: 0.32, vol: 0.42, mml: join(['q5 _v82'], pat(P_A, "08 2'8 18 2'8", 62), ['q8 _v72'], pads(P_B, 60), ['_v95'], P_C.map(c => `_e50 _e127/1 ${pads([c], 60)[0]}`), ['_e127 q5 _v88'], pat(P_A, "08 2'8 18 2'8", 62)) },
    harp: { inst: 'harp', tr: 1, pan: -0.35, rev: 0.42, vol: 0.55, only: ['intro', 'death'], mml: join(['_v82'], pat([...P_A, ...P_B], "B8 08 18 28 0'8 28 18 08", 50), rest(8), pat(P_A, "B8 08 18 28 0'8 28 18 08", 50)) },
    chug: { inst: 'chug', tr: 1, pan: 0.45, rev: 0.08, vol: 0.48, mml: join(['q5 _v112'], pat(P_A, RIFF, 38), ['_k0 _v104'], pat(P_B, '!R8 R16 R16 R8 R8 !R8 R16 R16 R8 R8', 38), ['_v118'], pat(P_C, '!R8 R8 r4 r4 R16 R16 R8', 38), ['_v114'], pat(P_A, RIFF, 38), ['_k0']) },
    power: { inst: 'powerchord', tr: 1, pan: -0.45, rev: 0.1, vol: 0.45, mml: join(rest(8), ['_v104'], pat(P_B, '!R4. R8 R2', 38), ['_v118'], pat(P_C, '!R4 r2.', 38), ['_v108'], pat(P_A, 'R1', 38)) },
    bass: { inst: 'bass', tr: 1, pan: 0, rev: 0.05, vol: 0.78, mml: join(['q6 _v108'], pat([...P_A, ...P_B], "B8 B8 B'8 B8 B8 B8 B'8 B8", 26), ['q8 _v115'], pat(P_C, 'B2. B4', 26), ['q6 _v110'], pat(P_A, "B8 B8 B'8 B8 B8 B8 B'8 B8", 26)) },
    kit: { inst: 'kick', drums: true, rev: 0.14, vol: 0.68, mml: join(['_v105'], sec(8, PK, FILL.toms), sec(8, KIT.mm, FILL.big), ['_v118'], ['{kx(gong)}4 r8 k8 {s(china)}4 r4', ...rep(SLAM, 6), SLAM_FILL], ['_v110'], sec(8, KIT.dbl, FILL.big)) },
    kick16: { inst: 'kick', drums: true, rev: 0.08, vol: 0.42, only: ['fury'], mml: join(['_v90'], rep(K16, 16), rest(8), rep(K16, 8)) },
    timp: { inst: 'timpani', tr: 1, pan: -0.1, rev: 0.35, vol: 0.55, mml: join(['_v100'], pat([...P_A, ...P_B], 'B8 r8 r4 28 r8 r4', 38), ['_v120'], pat(P_C.slice(0, 7), 'B4 r2.', 38), [troll('o2 a')], ['_v100'], pat(P_A, 'B8 r8 r4 28 r8 r4', 38)) },
    perc: { inst: 'bassdrum', drums: true, kit: 'orchestra', pan: 0, rev: 0.35, vol: 0.5, mml: join(rest(16), ['_v120'], ['{k(gong)}4 r2.', ...rep('k4 r2.', 7)], rest(8)) },
    clock: { inst: 'woodblock', drums: true, pan: 0.15, rev: 0.3, vol: 0.6, only: ['awkward'], mml: join(['_v95'], rep('(woodblock)4 (woodblocklo)4 (woodblock)4 (woodblocklo)4', 32)) },
    slide: { inst: 'flute', tr: 1, pan: 0.2, rev: 0.3, vol: 0.55, only: ['balloon'], mml: join(['_v100 _g4'], rep('o5 c2 o6 c2 | o4 g2. r4', 16)) },
    tuba: { inst: 'tuba', tr: 1, pan: -0.1, rev: 0.15, vol: 0.7, only: ['balloon'], mml: join(['_v100'], pat([...P_A, ...P_B, ...P_C, ...P_A], 'B4 r4 24 r4', 26)) },
  },
  arrangements: {
    main: {},
    fury: { vol: { choir: 1.25, brass: 1.15, kit: 1.05, chug: 1.1 } },
    intro: { solo: ['lead', 'harp', 'strings', 'flute'], inst: { strings: 'slowstrings' }, vol: { lead: 0.6, strings: 0.6, flute: 0.9 }, rev: { lead: 0.5 }, level: 0.8 },
    awkward: { solo: ['clock', 'bass'], inst: { bass: 'upright' }, vol: { bass: 0.45 }, level: 0.7 },
    balloon: { solo: ['lead', 'slide', 'tuba', 'timp'], inst: { lead: 'theremin' }, vol: { lead: 0.75, timp: 0.45 }, level: 0.9 },
    death: { solo: ['lead', 'harp', 'choir'], vol: { lead: 0.7, harp: 0.8, choir: 0.7 }, rev: { lead: 0.55 }, level: 0.75 },
  },
};
