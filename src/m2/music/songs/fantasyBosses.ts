// FAIRY LAND's fights: the FAIRY WHEEL (trial one), the BROOMSTICK DEATHMATCH (the final trial) and PIPER THE PIXIE
// (the land's boss). The land's theme and Truelling Tragons are in fantasy.ts.
//
// ---- "PICK ME! PICK ME!" (boss:fairy-wheel) ----
// Trial one: eight beefy suitors in the gondolas of a gigantic fairy Ferris wheel, throwing crap, and the QTEs in their
// carts. Piper's trials are a dating show with a body count, so it's scored as one: a swinging 60s TV dating-game bounce
// (The Dating Game's "Whipped Cream", Herb Alpert's Tijuana Brass, Bacharach): the hook on vibes over a two-beat
// (the upright's root and fifth, a sidestick on two and four, a tambourine), Bacharach piano comping, the oohs' "bah"s,
// the brass section's answers falling off, a trombone smearing up into every turnaround, and the wheel's fairy dust (a
// harp glissando round every corner, a glockenspiel). Not a march, not a waltz, no open trumpet out front.
// F major, 140. 44 bars: a 4-bar game-show open (once: three dings, the harp, the vamp, the brass's "PICK ME!"), then:
//   A  (8)  Fmaj7 - Bb/C - Fmaj7 - Am7 D7 - Gm7 - C7sus C7 - Am7 Dm7 - Gm7 C7: the hook.
//   A' (8)  the hook again, the brass answering every other bar.
//   B  (8)  Abmaj7 - Dbmaj7 - Abmaj7 - Bbm7 Eb7 - Abmaj7 - Dbmaj7 - Gm7 - C7: up a minor third for contestant number
//           three, the tune on the strings, the oohs' "bah-bah"s.
//   C  (8)  Dm7 - G7 - Cm7 - F7 - Bbmaj7 - Eb7 - Am7 D7 - Gm7 C7: the shout chorus round the cycle of fourths on the
//           brass, the trombones under it, the bass walking.
//   A''(8)  the hook with everything, the glockenspiel up an octave.
// ARRANGEMENTS (cues.ts bossArrs): main (the trial), qte (in a suitor's gondola: the think music, the bass, the piano,
// the oohs and a ticking clock).
//
// ---- "LAST MAN FLYING" (boss:broomsticks) ----
// The final trial: behind his back on a broomstick, Star Fox 64's all-range mode round the Great Pixie's castle. A
// Star Fox 64 orchestral march (the brass and the snare over a pumping N64 synth bass and a PWM sheen, orchestra hits)
// carrying a John Williams flying theme (the violins soaring up a fifth and an octave, the Lydian raised fourth, the
// flat-seven chord, the minor iv into the dominant); a B in C minor for the enemy (the brass's march, the snare's
// military rolls); a C a half step up in D-flat because it's earned it (the theme on everything, the choir, the glock).
// C major (D-flat for C), 156. 36 bars: a 4-bar fanfare (once: the brass on the march's head, a snare roll, the hit):
//   A  (8)  C - Bb - Am - F G - C - E7 - Am D7 - Fm6 G7: the theme on the violins.
//   A' (8)  the theme again, the horns' counter-melody.
//   B  (8)  Cm - Ab - Bb - G - Cm - Ab - Db - G7: the march on the brass, the strings driving eighths.
//   C  (8)  Db - B - Bbm - Gb Ab - Db - F7 - Bbm Eb7 - Ab7 G7: the theme up a half step, everything, sliding home.
// ARRANGEMENTS (cues.ts bossArrs): main (the first lot), late (the late entries over the wall: the choir, taiko, louder),
// win (the barrier wilting, the window and the zoom: no drums, the theme, the choir, the horns, the harp).
//
// ---- "IT AIN'T OVER" (boss:piper) ----
// Piper the Pixie: morbidly obese, her lust for men killing each other over her, gone to rage at being called fat; the
// fight's quake slams wrecking her princess chambers, fire, ice and lightning loose. It ain't over till the fat lady
// sings: a rage aria (Mozart's Queen of the Night, "Der Holle Rache") as symphonic metal (Nightwish): the aria on a solo
// violin (the soprano's line, leaping, falling off), palm-muted chugs on a Phrygian riff, the strings' Alberti
// eighths, the brass's classical stabs; a B of pure coloratura (the staccato triplet arpeggios up past the high A on
// the violin and a flute, the choir holding the fat lady's long notes); a C for the slams (half time, the gong, the
// china, the trombones heaving up the flat two, the violin shrieking up top); A' with the runs. No organ, no
// harpsichord (Donnie's), no thrash gallop (the demon's), no keytar (Steve's).
// Written in D minor, played in E-flat minor (every pitched part tr +1), 136. 32 bars:
//   A  (8)  Dm - Dm/C - Gm/Bb - A7 - Dm - F/C - Bb - A7: the aria.
//   B  (8)  Dm - Gm - C7 - F - Bb - Gm - E7 - A7: the coloratura.
//   C  (8)  Dm - Eb - Dm - Eb - Bb - A - Bb - A7: the slam.
//   A' (8)  the aria with its runs.
// ARRANGEMENTS (cues.ts bossArrs, by the fight): intro (the door, her on the chaise purring, the close-up: the aria on
// a quiet violin over the harp, a celesta's coloratura, slow strings), awkward (him seeing her, fat, ugly: nothing but
// a clock ticking and the bass plodding), main (ENRAGED on), fury (her last third: double kick, the choir and brass up),
// balloon (a flintlock hole, round the room like a let-go balloon: the aria on a theremin, a slide whistle, a tuba),
// death (her deaths: the aria on her music box, the harp).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, chord, bars, hi } from './jungle';

const sec = (inBar: string, bar: string, fill: string) => [inBar, ...rep(bar, 6), fill];
const roll4 = (n: string) => `o2 _v50 [${n}32]8 _v70 [${n}32]8 _v90 [${n}32]8 _v115 [${n}32]8`;
const SNARE_ROLL = '_v50 s16 s16 s16 s16 _v70 s16 s16 s16 s16 _v90 s16 s16 s16 s16 _v115 s16 s16 s16 s16';
const g2 = (b: Bar) => (typeof b === 'string' ? b : b[1]);

// =====================================================================================================================
// PICK ME! PICK ME! (F major)

const WV: Record<string, string[]> = {
  Fmaj7: ['4e', '4f', '4a', '5c'], 'Bb/C': ['4b-', '5d', '5f'], Am7: ['4e', '4g', '4a', '5c'], D7: ['4d', '4f+', '4a', '5c'], Gm7: ['4f', '4g', '4b-', '5d'],
  C7sus: ['4f', '4g', '4b-', '5c'], C7: ['4e', '4g', '4b-', '5c'], Dm7: ['4f', '4a', '5c', '5d'], Abmaj7: ['4e-', '4g', '4a-', '5c'], Dbmaj7: ['4d-', '4f', '4a-', '5c'],
  Bbm7: ['4d-', '4f', '4a-', '4b-'], Eb7: ['4d-', '4e-', '4g', '4b-'], G7: ['4f', '4g', '4b', '5d'], Cm7: ['4e-', '4g', '4b-', '5c'], F7: ['4e-', '4f', '4a', '5c'],
  Bbmaj7: ['4d', '4f', '4a', '4b-'],
};
const WR: Record<string, [string, string]> = {
  Fmaj7: ['2f', '2c'], 'Bb/C': ['2c', '2g'], Am7: ['2a', '2e'], D7: ['2d', '2a'], Gm7: ['2g', '2d'], C7sus: ['2c', '2g'], C7: ['2c', '2g'], Dm7: ['2d', '2a'],
  Abmaj7: ['2a-', '2e-'], Dbmaj7: ['2d-', '2a-'], Bbm7: ['2b-', '2f'], Eb7: ['2e-', '2b-'], G7: ['2g', '2d'], Cm7: ['2c', '2g'], F7: ['2f', '2c'], Bbmaj7: ['2b-', '2f'],
};
const W_OPEN: Bar[] = ['Bb/C', 'Bb/C', 'Bb/C', 'C7'];
const W_A: Bar[] = ['Fmaj7', 'Bb/C', 'Fmaj7', ['Am7', 'D7'], 'Gm7', ['C7sus', 'C7'], ['Am7', 'Dm7'], ['Gm7', 'C7']];
const W_B: Bar[] = ['Abmaj7', 'Dbmaj7', 'Abmaj7', ['Bbm7', 'Eb7'], 'Abmaj7', 'Dbmaj7', 'Gm7', 'C7'];
const W_C: Bar[] = ['Dm7', 'G7', 'Cm7', 'F7', 'Bbmaj7', 'Eb7', ['Am7', 'D7'], ['Gm7', 'C7']];

/** The hook: pick me, pick me. */
const W_HOOK = [
  'o5 r8 c8 d8 c8 o4 a4 o5 c4',
  'o4 r8 b-8 o5 c8 o4 b-8 g4 b-4',
  'o5 r8 c8 d8 c8 o4 a8 o5 c8 f8 a8',
  'o5 g4 f8 e8 f+4 a4',
  'o5 r8 d8 e-8 d8 o4 b-4 o5 d4',
  'o5 c4 f4 e4 c4',
  'o5 r8 e8 f8 e8 c8 e8 a8 g8',
  'o5 f4 g8 f8 e4 r4',
];
/** Contestant number three. */
const W_BMEL = ['o5 c2 e-4 g4', 'o5 f2. e-4', 'o5 c4 e-4 a-4 g4', 'o5 f2 g2', 'o5 a-4. g8 e-4 c4', 'o5 f4. e-8 c4 o4 a-4', 'o5 b-2 g4 f4', 'o5 e4 g4 b-4 r4'];
/** The shout chorus round the cycle. */
const W_SHOUT = [
  'o5 f8 f8 r8 f8 r8 e8 f4', 'o5 f8 f8 r8 f8 r8 e8 d4', 'o5 e-8 e-8 r8 e-8 r8 d8 e-4', 'o5 e-8 e-8 r8 e-8 r8 c8 o4 a4',
  'o5 d8 d8 r8 d8 r8 c8 d4', 'o5 d-8 d-8 r8 d-8 r8 c8 d-4', 'o5 c4 e4 f+4 a4', 'o5 b-4 a4 g4 e4',
];
const W_GLISS = 'o4 c32 d32 e32 f32 g32 a32 b-32 o5 c32 d32 e32 f32 g32 a32 b-32 o6 c32 d32';
const SMEAR = 'r2 _b-5/4 o3 c2';

const wPads = (prog: Bar[]) => bars(prog, (c, b) => chord(WV[c], b === 4 ? '1' : '2'));
/** The two-beat: the root, the fifth. */
const wTwo = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = WR[c]; return b === 4 ? `${nt(r, '4')} r4 ${nt(f, '4')} r4` : `${nt(r, '4')} ${nt(f, '4')}`; });
/** The bass walking (the shout chorus): the root, the fifth, the octave, the fifth. */
const wWalk = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = WR[c]; return b === 4 ? `${nt(r, '4')} ${nt(f, '4')} ${nt(hi(r), '4')} ${nt(f, '4')}` : `${nt(r, '4')} ${nt(f, '4')}`; });
/** Bacharach comping: on one, the and of two, four. */
const wComp = (prog: Bar[]) => bars(prog, (c, b) => { const v = WV[c]; return b === 4 ? `${chord(v, '4.')} ${chord(v, '8')} r4 ${chord(v, '4')}` : `${chord(v, '4.')} ${chord(v, '8')}`; });
/** The oohs' "bah"s on two and four. */
const wBah = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(WV[c], '4'); return b === 4 ? `r4 ${x} r4 ${x}` : `r4 ${x}`; });
/** The brass answering every other bar, falling off. */
const wAnswer = (prog: Bar[]) => prog.map((b, i) => { if (i % 2 === 0) return 'r1'; const v = WV[g2(b)]; return `r2 ${chord(v, '8')} r8 _f-3 ${chord(v, '4')}`; });

const W_GROOVE = '{kh}8 h8 {mh}8 h8 {kh}8 h8 {mh}8 ?h8';
const W_IN = W_GROOVE.replace('{kh}', '{kx}');
const W_FILL = '{kh}8 h8 {mh}8 h8 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 (tom4)16';
const W_SHOUTK = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8';
const W_SHOUT_IN = W_SHOUTK.replace('{kh}', '{kx}');
const TICK = '(woodblock)4 (woodblocklo)4 (woodblock)4 (woodblocklo)4';

export const BOSS_FAIRY_WHEEL: Song = {
  title: 'Pick Me! Pick Me!',
  bpm: 140,
  loopFrom: 16,
  reverb: 'plate',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.25, tone: 3000 },
  parts: {
    vibes: { inst: 'vibes', pan: 0.05, rev: 0.25, dly: 0.12, mml: join(rest(4), ['_v105'], W_HOOK, W_HOOK, ['_v90'], W_BMEL, rest(8), ['_v110'], W_HOOK) },
    glock: { inst: 'glock', pan: 0.35, rev: 0.35, vol: 0.45, mml: join(['_v110'], ['o6 c4 f4 a4 r4', 'r1', 'r1', 'r1'], rest(32), ['_v75'], up(W_HOOK)) },
    oohs: { inst: 'oohs', pan: -0.1, rev: 0.4, vol: 0.5, mml: join(['_v55'], wPads(W_OPEN), ['_v58'], wPads(W_A), wPads(W_A), ['q3 _v85'], wBah(W_B), ['q7'], rest(8), ['_v80'], wPads(W_A)) },
    brass: {
      inst: 'brass', pan: 0.2, rev: 0.3, vol: 0.6,
      mml: join(
        ['_v110'], ['r1', 'r1', `r2 ${chord(WV['Bb/C'], '8')} r8 ${chord(WV['Bb/C'], '4')}`, `${chord(WV.C7, '2')} _f-4 ${chord(WV.C7, '4')} r4`],
        rest(8), ['_v95'], wAnswer(W_A), rest(8), ['_v112'], W_SHOUT, ['_v100'], wAnswer(W_A),
      ),
    },
    trombone: { inst: 'trombone', pan: -0.3, rev: 0.3, vol: 0.55, mml: join(['_v100'], ['r1', 'r1', 'r1', SMEAR], [...rest(7), SMEAR], [...rest(7), SMEAR], [...rest(7), SMEAR], ['_v105'], up(W_SHOUT, -2), [...rest(7), SMEAR]) },
    strings: { inst: 'strings', pan: 0.25, rev: 0.4, vol: 0.5, mml: join(rest(12), ['_v55'], wPads(W_A), ['_v95'], W_BMEL, ['_v60'], wPads(W_C), ['_v70'], wPads(W_A)) },
    harp: { inst: 'harp', pan: -0.4, rev: 0.4, vol: 0.55, mml: join(['_v95'], ['r1', `${W_GLISS} r2`, 'r1', 'r1'], ...Array.from({ length: 5 }, () => [...rest(7), `r2 ${W_GLISS}`])) },
    piano: { inst: 'piano', pan: -0.2, rev: 0.25, vol: 0.5, mml: join(['_v80'], wComp(W_OPEN), wComp(W_A), wComp(W_A), wComp(W_B), wComp(W_C), wComp(W_A)) },
    bass: {
      inst: 'upright', pan: 0, rev: 0.1, vol: 0.8,
      mml: join(['_v100'], ['o2 c4 r4 c4 r4', 'o2 c4 r4 c4 r4', 'o2 c4 r4 g4 r4', 'o2 c4 e4 g4 b-4'], wTwo(W_A), wTwo(W_A), wTwo(W_B), ['_v108'], wWalk(W_C), ['_v100'], wTwo(W_A)),
    },
    kit: {
      inst: 'kick', drums: true, rev: 0.15, vol: 0.6,
      mml: join(['_v80'], [W_GROOVE, W_GROOVE, W_GROOVE, SNARE_ROLL], ['_v95'], sec(W_IN, W_GROOVE, W_FILL), sec(W_IN, W_GROOVE, W_FILL), sec(W_IN, W_GROOVE, W_FILL), ['_v105'], sec(W_SHOUT_IN, W_SHOUTK, W_FILL), ['_v100'], sec(W_IN, W_GROOVE, W_FILL)),
    },
    tamb: { inst: 'tamb', drums: true, pan: 0.3, rev: 0.15, vol: 0.4, mml: join(['_v90'], rep('?j8 j8 !j8 ?j8 ?j8 j8 !j8 ?j8', 44)) },
    clock: { inst: 'woodblock', drums: true, pan: 0.15, rev: 0.25, vol: 0.55, only: ['qte'], mml: join(['_v100'], rep(TICK, 44)) },
  },
  arrangements: {
    main: {},
    qte: { solo: ['bass', 'clock', 'piano', 'oohs', 'tamb'], vol: { piano: 0.75, oohs: 0.6, tamb: 0.6 }, level: 0.9 },
  },
};

// =====================================================================================================================
// LAST MAN FLYING (C major; D-flat for C)

const FV: Record<string, string[]> = {
  C: ['4e', '4g', '5c'], Bb: ['4d', '4f', '4b-'], Am: ['4e', '4a', '5c'], F: ['4f', '4a', '5c'], G: ['4d', '4g', '4b'], E7: ['4d', '4e', '4g+', '4b'],
  D7: ['4d', '4f+', '4a', '5c'], Fm6: ['4d', '4f', '4a-', '5c'], G7: ['4d', '4f', '4g', '4b'], Cm: ['4e-', '4g', '5c'], Ab: ['4e-', '4a-', '5c'],
  Db: ['4d-', '4f', '4a-'], B: ['4d+', '4f+', '4b'], Bbm: ['4d-', '4f', '4b-'], Gb: ['4d-', '4g-', '4b-'], F7: ['4c', '4e-', '4f', '4a'],
  Eb7: ['4d-', '4e-', '4g', '4b-'], Ab7: ['4c', '4e-', '4g-', '4a-'],
};
const FR: Record<string, string> = {
  C: '2c', Bb: '2b-', Am: '2a', F: '2f', G: '2g', E7: '2e', D7: '2d', Fm6: '2f', G7: '2g', Cm: '2c', Ab: '2a-', Db: '2d-', B: '2b', Bbm: '2b-',
  Gb: '2g-', F7: '2f', Eb7: '2e-', Ab7: '2a-',
};
const F_OPEN: Bar[] = ['Cm', 'Ab', 'Bb', 'G7'];
const F_A: Bar[] = ['C', 'Bb', 'Am', ['F', 'G'], 'C', 'E7', ['Am', 'D7'], ['Fm6', 'G7']];
const F_B: Bar[] = ['Cm', 'Ab', 'Bb', 'G', 'Cm', 'Ab', 'Db', 'G7'];
const F_C: Bar[] = ['Db', 'B', 'Bbm', ['Gb', 'Ab'], 'Db', 'F7', ['Bbm', 'Eb7'], ['Ab7', 'G7']];

/** The flying theme. */
const FLY = ['o4 g4. o5 c8 g2', 'o5 f4. e8 d4 c4', 'o5 e4. a8 o6 c2', 'o5 b4 a4 g4 d4', 'o4 g4. o5 c8 g2', 'o5 g+4. b8 o6 d2', 'o6 c4. o5 b8 a4 f+4', 'o5 a-4. g8 f4 d4'];
/** The flying theme up a half step (C), sliding home at the end. */
const FLY_UP = ['o4 a-4. o5 d-8 a-2', 'o5 g-4. f8 e-4 d-4', 'o5 f4. b-8 o6 d-2', 'o6 c4 o5 b-4 a-4 e-4', 'o4 a-4. o5 d-8 a-2', 'o5 a4. o6 c8 e-2', 'o6 d-4. c8 o5 b-4 g4', 'o5 g-4. f8 f4 d4'];
/** The enemy's march (B). */
const MARCH = ['o4 g4 g8 g8 o5 c4 d4', 'o5 e-2 c4 o4 a-4', 'o4 b-4 b-8 b-8 o5 d4 f4', 'o5 d2 o4 b4 g4', 'o4 g4 g8 g8 o5 c4 e-4', 'o5 a-2 g4 f4', 'o5 a-2 f4 d-4', 'o5 d2 o4 b4 g4'];
const FANFARE = ['o4 g4 g8 g8 o5 c2', 'o5 c4 c8 c8 e-2', 'o5 d4 d8 d8 f2', 'o5 g1'];
const HORN_A = ['o4 e2 g2', 'o4 f2 d2', 'o4 e2 c2', 'o4 c2 d2', 'o4 e2 g2', 'o4 e2 d2', 'o4 e2 f+2', 'o4 f2 f2'];
const HORN_C = ['o4 f1', 'o4 e-1', 'o4 d-1', 'o4 d-2 e-2', 'o4 f1', 'o4 e-1', 'o4 d-2 d-2', 'o4 c2 o3 b2'];
const GL_C = 'o4 c32 d32 e32 f32 g32 a32 b32 o5 c32 d32 e32 f32 g32 a32 b32 o6 c32 d32';

const fPads = (prog: Bar[]) => bars(prog, (c, b) => chord(FV[c], b === 4 ? '1' : '2'));
/** The brass's hits: on one, and pushed into the next bar. */
const fHits = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(FV[c], '8'); return b === 4 ? `${x} r8 r4 r4 r8 ${x}` : `${x} r8 r8 ${x}`; });
/** The strings driving eighths. */
const fDrive = (prog: Bar[]) => bars(prog, (c, b) => { const v = FV[c], top = v[v.length - 1], n = [v[0], top, v[1], top]; return [...n, ...n].slice(0, b * 2).map(x => nt(x, '8')).join(' '); });
/** The N64 synth bass pumping eighths, the octave popped. */
const fPump = (prog: Bar[]) => bars(prog, (c, b) => { const r = FR[c], h = hi(r); return [r, r, h, r, r, r, h, r].slice(0, b * 2).map(x => nt(x, '8')).join(' '); });

const ROCK = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 ?s16 ?s16';
const ROCK_IN = ROCK.replace('{kh}', '{kx}');
const MARCHK = '{ks}8 ?s16 ?s16 s8 ?s16 ?s16 {ks}8 ?s16 ?s16 !s8 s8';
const MARCH_IN = MARCHK.replace('{ks}', '{kx}');
const F_FILL = '{kh}8 h8 {sh}8 h8 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 (tom4)16';

export const BOSS_BROOMSTICKS: Song = {
  title: 'Last Man Flying',
  bpm: 156,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.85,
  delay: { beats: 0.75, feedback: 0.22, tone: 3200 },
  parts: {
    lead: { inst: 'strings', pan: 0.15, rev: 0.4, mml: join(rest(4), ['_v100'], FLY, ['_v108'], FLY, rest(8), ['_v115'], FLY_UP) },
    brass: { inst: 'brass', pan: -0.15, rev: 0.35, vol: 0.6, mml: join(['_v115'], FANFARE, ['_v95'], fHits(F_A), fHits(F_A), ['_v112'], MARCH, ['_v90'], fPads(F_C)) },
    horns: { inst: 'horn', pan: -0.35, rev: 0.4, vol: 0.6, mml: join(['_v90'], ['o4 c1', 'o4 c1', 'o4 d1', 'o4 d1'], rest(8), ['_v95'], HORN_A, ['_v100'], up(MARCH, -1), ['_v100'], HORN_C) },
    choir: { inst: 'choir', pan: 0, rev: 0.5, vol: 0.5, only: ['late', 'win'], mml: join(rest(12), ['_v70'], fPads(F_A), ['_v85'], up(MARCH, -1), ['_v100'], up(FLY_UP, -1)) },
    glock: { inst: 'glock', pan: 0.35, rev: 0.4, vol: 0.4, mml: join(rest(28), ['_v80'], up(FLY_UP)) },
    lowstr: { inst: 'strings', pan: -0.1, rev: 0.35, vol: 0.4, mml: join(['_v70'], fPads(F_OPEN), ['_v58'], fPads(F_A), fPads(F_A), ['_v72'], fPads(F_B), ['_v80'], fPads(F_C)) },
    drive: { inst: 'strings', pan: 0.3, rev: 0.25, vol: 0.4, mml: join(rest(12), ['q4 _v75'], fDrive(F_A), ['_v88'], fDrive(F_B), rest(8)) },
    pwm: { inst: 'pwm', pan: 0, rev: 0.4, cho: 0.3, vol: 0.22, mml: join(['_v60'], fPads(F_OPEN), fPads(F_A), fPads(F_A), fPads(F_B), fPads(F_C)) },
    bass: { inst: 'synthbass', pan: 0, rev: 0.05, vol: 0.6, mml: join(['q6 _v100'], fPump(F_OPEN), fPump(F_A), fPump(F_A), fPump(F_B), fPump(F_C)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.15, vol: 0.65,
      mml: join(['_v95'], [MARCH_IN, MARCHK, MARCHK, SNARE_ROLL], ['_v100'], sec(ROCK_IN, ROCK, F_FILL), sec(ROCK_IN, ROCK, F_FILL), sec(MARCH_IN, MARCHK, F_FILL), ['_v110'], sec(ROCK_IN, ROCK, F_FILL)),
    },
    taiko: { inst: 'taiko', drums: true, pan: -0.2, rev: 0.3, vol: 0.5, only: ['late'], mml: join(['_v100'], rest(4), rep('!f4 r8 f8 f4 r4', 32)) },
    timpani: {
      inst: 'timpani', pan: -0.1, rev: 0.35, vol: 0.6,
      mml: join(['_v110'], ['o2 c4 r2.', 'o2 a-4 r2.', 'o2 b-4 r2.', roll4('g')], ['_v105'], ['o2 c4 r2.', ...rest(6), roll4('g')], ['o2 c4 r2.', ...rest(6), roll4('g')], ['o2 c4 r2.', ...rest(6), roll4('a-')], ['o2 d-4 r2.', ...rest(6), roll4('g')]),
    },
    hit: { inst: 'orchhit', pan: 0, rev: 0.35, vol: 0.6, mml: join(['_v110'], ['r1', 'r1', 'r1', 'r2 o4 g4 r4'], ['o4 c4 r2.'], rest(7), ['o4 c4 r2.'], rest(7), rest(8), ['o4 d-4 r2.'], rest(7)) },
    harp: { inst: 'harp', pan: -0.4, rev: 0.45, vol: 0.5, mml: join(['_v90'], ['r1', 'r1', 'r1', `r2 ${GL_C}`], [...rest(7), `r2 ${GL_C}`], [...rest(7), `r2 ${GL_C}`], rest(8), [...rest(7), `r2 ${GL_C}`]) },
  },
  arrangements: {
    main: {},
    late: { vol: { kit: 1.1, brass: 1.1, lead: 1.05, bass: 1.05 } },
    win: { solo: ['lead', 'choir', 'horns', 'harp', 'lowstr', 'glock', 'timpani', 'pwm'], vol: { choir: 1.1, lowstr: 1.2 }, level: 0.95 },
  },
};

// =====================================================================================================================
// IT AIN'T OVER (written in D minor: every pitched part tr +1)

const PV: Record<string, string[]> = {
  Dm: ['4d', '4f', '4a'], 'Dm/C': ['4c', '4f', '4a'], 'Gm/Bb': ['4d', '4g', '4b-'], A7: ['4c+', '4e', '4g', '4a'], 'F/C': ['4c', '4f', '4a'],
  Bb: ['4d', '4f', '4b-'], Gm: ['4d', '4g', '4b-'], C7: ['4c', '4e', '4g', '4b-'], F: ['4c', '4f', '4a'], E7: ['4d', '4e', '4g+', '4b'],
  Eb: ['4e-', '4g', '4b-'], A: ['4c+', '4e', '4a'],
};
/** The bass note, the fifth over it, and the riff's root (a slash chord's chugs stay on its chord). */
const PR: Record<string, [string, string, string]> = {
  Dm: ['2d', '2a', 'd'], 'Dm/C': ['2c', '2a', 'd'], 'Gm/Bb': ['2b-', '2g', 'g'], A7: ['2a', '2e', 'a'], 'F/C': ['2c', '2f', 'f'], Bb: ['2b-', '2f', 'b-'],
  Gm: ['2g', '2d', 'g'], C7: ['2c', '2g', 'c'], F: ['2f', '2c', 'f'], E7: ['2e', '2b', 'e'], Eb: ['2e-', '2b-', 'e-'], A: ['2a', '2e', 'a'],
};
/** The riff on each root: Phrygian, the flat two. */
const RIFF: Record<string, string> = {
  d: 'o2 d16 d16 d8 d16 d16 d8 e-8 d8 c8 d8', g: 'o2 g16 g16 g8 g16 g16 g8 a-8 g8 f8 g8', a: 'o2 a16 a16 a8 a16 a16 a8 b-8 a8 g8 a8',
  f: 'o2 f16 f16 f8 f16 f16 f8 g-8 f8 c8 f8', 'b-': 'o2 b-16 b-16 b-8 b-16 b-16 b-8 b8 b-8 a8 b-8', c: 'o2 c16 c16 c8 c16 c16 c8 d-8 c8 e8 c8',
  e: 'o2 e16 e16 e8 e16 e16 e8 f8 e8 d8 e8', 'e-': 'o2 e-16 e-16 e-8 e-16 e-16 e-8 e8 e-8 d8 e-8',
};
const P_A = ['Dm', 'Dm/C', 'Gm/Bb', 'A7', 'Dm', 'F/C', 'Bb', 'A7'];
const P_B = ['Dm', 'Gm', 'C7', 'F', 'Bb', 'Gm', 'E7', 'A7'];
const P_C = ['Dm', 'Eb', 'Dm', 'Eb', 'Bb', 'A', 'Bb', 'A7'];

/** The aria. */
const ARIA = ['o5 a2. f8 d8', 'o5 a4 o6 d4 c4 o5 a4', 'o5 b-2 g4 d4', 'o5 c+2 e4 a4', 'o5 d4 f4 a4 o6 d4', 'o6 c2. o5 a4', 'o5 b-4 o6 d4 c4 o5 b-4', 'o5 a2. r4'];
/** The aria again, with its runs. */
const ARIA2 = [
  ...ARIA.slice(0, 3),
  'o5 c+16 e16 g16 a16 o6 c+16 e16 g16 a16 g16 e16 c+16 o5 a16 g16 e16 c+16 o4 a16',
  ...ARIA.slice(4, 7),
  'o6 e16 c+16 o5 a16 e16 o6 e16 c+16 o5 a16 e16 o6 g16 e16 c+16 o5 a16 o6 a4',
];
/** The shrieks over the slam. */
const SHRIEK = ['o6 a1', 'o6 b-1', 'o6 a1', 'o6 b-1', 'o6 f1', 'o6 e1', 'o6 f1', 'o6 e2 c+2'];
/** The fat lady's long notes under the coloratura. */
const FAT_LADY = ['o5 f1', 'o5 d1', 'o5 e1', 'o5 f1', 'o5 f1', 'o5 g1', 'o5 g+1', 'o5 a1'];
/** The trombones heaving up the flat two. */
const HEAVE = ['o3 d2. a4', 'o3 b-2. g4', 'o3 a2 f2', 'o3 g2 e-2', 'o3 f2. d4', 'o3 e2. c+4', 'o3 d2 f2', 'o3 e2 c+4 o2 a4'];
/** The coloratura's voicings (each a triad from the fifth octave). */
const COLO_V: Record<string, string[]> = {
  Dm: ['5d', '5f', '5a'], Gm: ['5d', '5g', '5b-'], C7: ['5c', '5e', '5g'], F: ['5c', '5f', '5a'], Bb: ['5d', '5f', '5b-'], E7: ['5e', '5g+', '5b'], A7: ['5c+', '5e', '5a'],
};

/** The coloratura: staccato triplets climbing the chord and turning at the top. */
const colo = (prog: string[]) => prog.map(c => { const [a, b, d] = COLO_V[c]; return [a, b, d, b, d, hi(a), d, hi(a), hi(b), hi(d), hi(b), hi(a)].map(n => nt(n, '12')).join(' '); });
const pPads = (prog: string[]) => prog.map(c => chord(PV[c], '1'));
/** Mozart's Alberti eighths. */
const alberti = (prog: string[]) => prog.map(c => { const v = PV[c], top = v[v.length - 1], n = [v[0], top, v[1], top]; return [...n, ...n].map(x => nt(x, '8')).join(' '); });
/** The brass's classical stabs. */
const pStab = (prog: string[]) => prog.map(c => { const x = chord(PV[c], '8'); return `${x} r8 r8 ${x} r2`; });
const swell = (prog: string[]) => prog.map(c => `_e50 _e127/1 ${chord(PV[c], '1')}`);
const pHarp = (prog: string[]) => prog.map(c => { const v = PV[c]; return [`3${PR[c][0].slice(1)}`, v[0], v[1], v[2], hi(v[0]), v[2], v[1], v[0]].map(x => nt(x, '8')).join(' '); });
const riffs = (prog: string[]) => prog.map(c => RIFF[PR[c][2]]);
const pEighths = (prog: string[]) => prog.map(c => rep(nt(PR[c][0], '8'), 8).join(' '));
const pSlam = (prog: string[]) => prog.map(c => `${nt(PR[c][0], '2.')} ${nt(PR[c][0], '4')}`);
const pTimp = (prog: string[]) => prog.map(c => `${nt(PR[c][0], '8')} r8 r4 ${nt(PR[c][1], '8')} r8 r4`);
const pOom = (prog: string[]) => prog.map(c => `${nt(PR[c][0], '4')} r4 ${nt(PR[c][1], '4')} r4`);

const PK = '{kh}8 h8 {sh}8 k8 {kh}8 h8 {sh}8 h8';
const PK_IN = PK.replace('{kh}', '{kx}');
const PK_FILL = '{kh}8 h8 {sh}8 k8 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16';
const SLAM = '{kx}4 r8 k8 {s(china)}4 r4';
const SLAM_IN = '{kx(gong)}4 r8 k8 {s(china)}4 r4';
const SLAM_FILL = '{kx}4 r8 k8 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16';
const K16 = Array.from({ length: 16 }, (_, i) => (i % 4 === 0 ? '!k16' : 'k16')).join(' ');

export const BOSS_PIPER: Song = {
  title: 'It Ain\'t Over',
  bpm: 136,
  reverb: 'cathedral',
  reverbMix: 0.75,
  delay: { beats: 0.75, feedback: 0.2, tone: 2800 },
  parts: {
    lead: { inst: 'violin', tr: 1, pan: 0.05, rev: 0.35, dly: 0.1, mml: join(['_v105'], ARIA, ['q3 _v95'], colo(P_B), ['q7 _v110'], SHRIEK, ['_v110'], ARIA2) },
    flute: { inst: 'flute', tr: 1, pan: 0.3, rev: 0.4, vol: 0.55, mml: join(rest(8), ['q3 _v85'], colo(P_B), ['q7'], rest(16)) },
    choir: { inst: 'choir', tr: 1, pan: 0, rev: 0.5, vol: 0.55, mml: join(rest(8), ['_v90'], FAT_LADY, ['_v105'], P_C.map(c => `${chord(PV[c], '2')} r2`), ['_v85'], pPads(P_A)) },
    brass: { inst: 'brass', tr: 1, pan: -0.2, rev: 0.3, vol: 0.55, mml: join(['_v100'], pStab(P_A), ['_v80'], pPads(P_B), ['_v118'], HEAVE, ['_v105'], pStab(P_A)) },
    strings: { inst: 'strings', tr: 1, pan: 0.25, rev: 0.35, vol: 0.45, mml: join(['q5 _v80'], alberti(P_A), ['q8 _v72'], pPads(P_B), ['_v95'], swell(P_C), ['q5 _v85'], alberti(P_A)) },
    harp: { inst: 'harp', tr: 1, pan: -0.35, rev: 0.45, vol: 0.6, only: ['intro', 'death'], mml: join(['_v80'], pHarp(P_A), pHarp(P_B), rest(8), pHarp(P_A)) },
    chug: { inst: 'chug', tr: 1, pan: 0.45, rev: 0.1, vol: 0.5, mml: join(['q5 _v110'], riffs(P_A), ['_v100'], pEighths(P_B), ['_v118'], P_C.map(c => { const r = PR[c][2]; return `o2 !${r}8 ${r}8 r4 r4 ${r}16 ${r}16 ${r}8`; }), ['_v112'], riffs(P_A)) },
    power: { inst: 'powerchord', tr: 1, pan: -0.45, rev: 0.12, vol: 0.45, mml: join(rest(8), ['_v100'], P_B.map(c => `o2 ${PR[c][2]}2 ${PR[c][2]}2`), ['_v118'], P_C.map(c => `o2 !${PR[c][2]}4 r2.`), ['_v105'], P_A.map(c => `o2 ${PR[c][2]}1`)) },
    bass: { inst: 'bass', tr: 1, pan: 0, rev: 0.05, vol: 0.75, mml: join(['q6 _v105'], pEighths(P_A), pEighths(P_B), ['q8 _v115'], pSlam(P_C), ['q6 _v108'], pEighths(P_A)) },
    kit: { inst: 'kick', drums: true, rev: 0.15, vol: 0.65, mml: join(['_v105'], sec(PK_IN, PK, PK_FILL), sec(PK_IN, PK, PK_FILL), ['_v118'], sec(SLAM_IN, SLAM, SLAM_FILL), ['_v108'], sec(PK_IN, PK, PK_FILL)) },
    kick16: { inst: 'kick', drums: true, rev: 0.08, vol: 0.45, only: ['fury'], mml: join(['_v90'], rep(K16, 16), rest(8), rep(K16, 8)) },
    timpani: { inst: 'timpani', tr: 1, pan: -0.1, rev: 0.35, vol: 0.6, mml: join(['_v100'], pTimp(P_A), pTimp(P_B), ['_v120'], P_C.slice(0, 7).map(c => `${nt(PR[c][0], '4')} r2.`), [roll4('a')], ['_v100'], pTimp(P_A)) },
    perc: { inst: 'bassdrum', drums: true, kit: 'orchestra', pan: 0, rev: 0.35, vol: 0.55, mml: join(rest(16), ['_v120'], ['{k(gong)}4 r2.', ...rep('k4 r2.', 7)], rest(8)) },
    clock: { inst: 'woodblock', drums: true, pan: 0.15, rev: 0.3, vol: 0.6, only: ['awkward'], mml: join(['_v95'], rep('(woodblock)4 (woodblocklo)4 (woodblock)4 (woodblocklo)4', 32)) },
    slide: { inst: 'flute', tr: 1, pan: 0.2, rev: 0.3, vol: 0.55, only: ['balloon'], mml: join(['_v100 _g4'], rep('o5 c2 o6 c2 | o4 g2. r4', 16)) },
    tuba: { inst: 'tuba', tr: 1, pan: -0.1, rev: 0.15, vol: 0.7, only: ['balloon'], mml: join(['_v100'], pOom(P_A), pOom(P_B), pOom(P_C), pOom(P_A)) },
  },
  arrangements: {
    main: {},
    fury: { vol: { choir: 1.25, brass: 1.15, kit: 1.05, chug: 1.1 } },
    intro: { solo: ['lead', 'harp', 'strings', 'flute'], inst: { flute: 'celesta', strings: 'slowstrings' }, vol: { lead: 0.6, strings: 0.5, flute: 0.9 }, rev: { lead: 0.5 }, level: 0.8 },
    awkward: { solo: ['clock', 'bass'], inst: { bass: 'upright' }, vol: { bass: 0.45 }, level: 0.7 },
    balloon: { solo: ['lead', 'slide', 'tuba', 'timpani'], inst: { lead: 'theremin' }, vol: { lead: 0.75, timpani: 0.45 }, level: 0.9 },
    death: { solo: ['lead', 'harp'], inst: { lead: 'musicbox' }, vol: { harp: 0.5 }, rev: { lead: 0.55 }, level: 0.75 },
  },
};
