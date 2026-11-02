// The minigames' own music (the owner's: "minigames should play their own music too. sound test, get crackin'." and
// "monster mash should have 2 tracks: character selection and fighting"). Each game plays its own song from the game
// being chosen (its controls card on) to its end beat or its try-again box; a win (or a loss) gets a short sting that
// plays once (cues.ts gameCand: it rings out to its end even once the game's moved on). Every tune here is original.
//
//   game:hack          JUNGLE LAND's paddock gate hack. "BRUTE FORCE": tense techno-hacker. A minor, 136, straight:
//                      a 909 four on the floor, a sixteenth synth-bass ostinato, the tune cold on an FM bell piano with
//                      a square an octave under, square sixteenth arpeggios under the second A, a PWM pad, taiko on the
//                      downbeats (the dino park's), the Neapolitan B-flat. 4-bar boot (once), then A A2 B and a half-time
//                      breakdown. Sting: "ACCESS GRANTED" (A major: a bell run up, an arcade orchestra stab).
//   game:lockpick      FUTURE LAND's Area 51 lock. "FIVE TUMBLERS": spy-jazz heist with a sci-fi edge. G minor, 112,
//                      swung: an upright's sneaking ostinato (root, the third, the chromatic climb to the fifth), a clean
//                      guitar on the tune through the echo, pizzicato tiptoes, brushes and ride, the vibes doubling it the
//                      second time with a theremin's far-off wisps, a harmon trumpet on the bridge. Sting: "TUMBLERS
//                      SET" (the Gm(maj7) on the vibes, a rimshot, the theremin rising).
//   game:mash-select   SPOOKY LAND's MONSTER MASH cabinet: the boot, the controls, CHOOSE YOUR MONSTER, the CONTINUE?.
//                      "CHOOSE YOUR MONSTER": a goofy monster-party boogaloo on an 808. Written in E minor, tr -1 (E-flat
//                      minor), 126, sixteenth swing: the tune on a xylophone (the bones) with a square an octave under,
//                      a slap bass, organ chops, the oohs, a theremin "woo-OOO" at every phrase end; the B on the organ
//                      with the clavinet chopping and a cowbell.
//   game:mash-fight    The bouts (VS, the rounds, the MONSTROSITY). "FIGHT IS BEGIN": 90s arcade fighting-game
//                      techno-metal. Written in E minor, tr +1 (F minor), 150: 909 four on the floor, sixteenth chugs,
//                      THE orchestra hit (orch2) on the downbeats, the tune on a distorted lead (an overdrive a third
//                      under the second time), a pumping synth bass; a B with the choir on the tune over half time and
//                      power chords; a C where a pipe organ does the monster walk (E - F Phrygian) over double kick.
//                      Stings: "MONSTROSITY!" (he won the match: orchestra hits up the E minor scale) and "GAME OVER"
//                      (the kid won: the xylophone sliding down chromatically, the theremin falling).
//   game:plunge        HOLLYWOOD LAND's TEST YOUR PLUNGE. "TEST YOUR PLUNGE": a carnival strongman strut / game-show
//                      bump. Written in G, tr +1 (A-flat), 116, swung: the tune on a harmon trumpet, the brass section's
//                      "bum-bum BAH" answers, a tuba's oom-pah, trombone smears like a flush the second time, a gospel
//                      organ, the strength bell (glock) at every section, the minor-iv sigh and timpani on the heave.
//                      Sting: "CLOG BUSTED" (a snare roll, the bell, the brass, the tuba falling off).
//   game:gallery       WILDERNESS LAND's DEAD-EYE DOOLEY'S SHOOTIN' GALLERY. "DEAD-EYE DOOLEY'S": a penny-arcade
//                      honky-tonk rag. F, 172: the piano's right hand on the tune (chromatic rag turns), its left hand
//                      striding, banjo offbeats, an upright, a woodblock clip-clop in the kit; a B round the ragtime
//                      circle (D7 - G7 - C7 - F), a C where a square lead takes the tune (the arcade). Sting:
//                      "EVERYBODY'S A WINNER" (a piano run up, the banjo, a bell, the F).
//   game:bumper        CARTOON LAND's BUMPER BASH. "BUMPER BASH": demolition-derby carnival punk. Written in A minor,
//                      tr -1 (A-flat minor), 196: a fast-Leslie rock organ on a chromatic carnival tune, a distorted lead
//                      an octave under the second time, eighth-note power chords, a pumping bass, a driving kit; a bright
//                      B in C (the brass, a calliope pumping the offbeats); a C that's a pile-up (B-flat against A minor,
//                      slapsticks and toms, brass hits). Stings: "EVERYBODY'S DEAD!" (the bVI - bVII - I on the organ
//                      and brass) and "TIME!" (a stutter, the power chord whammied down an octave, a china).
//
// MUSIC.md's registry lists them (the Minigames table).

import type { Song, Part } from '../engine';
import { join, rest, rep, up, bars, chord, type Bar } from './jungle';
import { scale, harm, pump, arp16, riff, stabs, held, BEAT, DRIVE, BEAT16, MM2, HALF, FILL, FILL2, FILL_BIG, ROLL_UP, sec } from './mega';

// ---- Helpers ----

const NM = ['c', 'c+', 'd', 'e-', 'e', 'f', 'f+', 'g', 'a-', 'a', 'b-', 'b'];
/** A MIDI note as MML, its octave set ('!' or '?' before it). */
const mn = (m: number, len: string, pre = '') => `o${Math.floor(m / 12) - 1} ${pre}${NM[m % 12]}${len}`;
const LB: Record<string, number> = { '16': 0.25, '8': 0.5, '8.': 0.75, '4': 1, '4.': 1.5, '2': 2, '2.': 3, '1': 4 };
/** A step of a bass pattern: semitones off the root (null: a rest), its length, an accent or ghost. */
type Step = [number | null, string, string?];
const seq = (root: number, steps: Step[], beats: number) => {
  const out: string[] = [];
  let t = 0;
  for (const [o, len, pre] of steps) {
    if (t >= beats - 1e-6) break;
    out.push(o === null ? `r${len}` : mn(root + o, len, pre ?? ''));
    t += LB[len];
  }
  return out.join(' ');
};
/** A bass pattern under a progression (roots as MIDI notes). */
const walk = (prog: Bar[], R: Record<string, number>, f: (c: string) => Step[]) => bars(prog, (c, b) => seq(R[c], f(c), b));
/** Everything an octave down. */
const dn = (b: string[]) => up(b, -1);
/** Every melodic part transposed (written in one key, played in another). */
const trAll = (parts: Record<string, Part>, n: number): Record<string, Part> =>
  Object.fromEntries(Object.entries(parts).map(([k, p]) => [k, p.drums ? p : { ...p, tr: n }]));
/** n bars of a groove: `open` first, the fill last. */
const run = (open: string, groove: string, n: number, fill: string) => [open, ...rep(groove, n - 2), fill];

// =====================================================================================================================
// "BRUTE FORCE" (game:hack): JUNGLE LAND's paddock gate hack. A minor, 136.
//   IN  (4)  the boot: the bass ostinato alone, the hats ticking, the kick, a snare build.
//   A   (8)  Am - F - Dm - E - Am - F - Bb - E: the tune on the bell piano, the square under it.
//   A2  (8)  again, square sixteenth arpeggios under it; it turns up to the high G-sharp.
//   B   (8)  Dm - Am - Dm - Am - F - G - E - E: the tune long, the arpeggios on.
//   C   (8)  half time: the tune in pieces, the pad, the bass ticking, a roll up to the top.

const HK_V: Record<string, string[]> = {
  Am: ['4a', '5c', '5e'], F: ['4a', '5c', '5f'], Dm: ['4a', '5d', '5f'], E: ['4g+', '4b', '5e'], Bb: ['4b-', '5d', '5f'], G: ['4b', '5d', '5g'],
};
const HK_R: Record<string, number> = { Am: 45, F: 41, Dm: 38, E: 40, Bb: 46, G: 43 };
const HK_MAJ = new Set(['F', 'E', 'Bb', 'G']);
const hkOst = (c: string): Step[] => {
  const third = HK_MAJ.has(c) ? 4 : 3;
  return [[0, '16', '!'], [0, '16', '?'], [12, '16'], [0, '16'], [0, '16'], [7, '16'], [12, '16'], [0, '16', '?'],
    [0, '16', '!'], [0, '16', '?'], [12, '16'], [0, '16'], [7, '16'], [0, '16'], [12, '16'], [third + 12, '16']];
};
const HK_IN: Bar[] = ['Am', 'Am', 'Am', 'Am'];
const HK_PA: Bar[] = ['Am', 'F', 'Dm', 'E', 'Am', 'F', 'Bb', 'E'];
const HK_PB: Bar[] = ['Dm', 'Am', 'Dm', 'Am', 'F', 'G', 'E', 'E'];
const HK_PC: Bar[] = ['Am', 'Am', 'F', 'F', 'Dm', 'Dm', 'E', 'E'];
const HK_ALL = [...HK_IN, ...HK_PA, ...HK_PA, ...HK_PB, ...HK_PC];
const HK_A = [
  'o5 e8. a16 r8 b8 >c4 <b8 a8', 'o5 a4 r8 g8 f8 e8 r4', 'o5 d8. f16 r8 a8 >d4 c8 <a8', 'o5 b2 g+4 e4',
  'o5 e8. a16 r8 b8 >c4 d8 e8', 'o6 f4 e8 d8 c8 <a8 r4', 'o5 b-8. b-16 r8 >d8 f4 e8 d8', 'o5 g+4 b4 >e2',
];
const HK_A2 = [...HK_A.slice(0, 6), 'o5 b-8. b-16 r8 >d8 f4 a4', 'o6 g+2 e2'];
const HK_B = ['o5 f2 e4 d4', 'o5 e2. c4', 'o5 f4 a4 >d4 c4', 'o5 b4 a2 e4', 'o5 a2 >c4 <a4', 'o5 b2 >d4 <b4', 'o5 g+1', 'o5 e2 r2'];
const HK_C = ['o5 e8. a16 r8 b8 >c4 r4', 'r1', 'o5 a8. >c16 r8 <a8 f4 r4', 'r1', 'o5 d8. f16 r8 a8 >d4 r4', 'r1', 'o5 b2 g+4 e4', 'o5 g+2 b4 >d4'];
// (the 909: four on the floor with the open hats on the offbeats; a taiko under every section's first kick)
const HK_TECH = 'k8 o8 {kp}8 o8 k8 o8 {kp}8 o8';
const HK_TECH16 = 'k16 h16 o16 h16 {kp}16 h16 o16 h16 k16 h16 o16 h16 {kp}16 h16 o16 ?h16';
const HK_HALF = 'k8 h8 h8 h8 {kp}8 h8 h8 h8';
const HK_FILL = '_v90 s16 s16 s16 s16 _v100 s16 s16 s16 s16 _v112 s16 s16 s16 s16 _v122 {kp}8 {kp}8 _v104';
const hkOpen = (g: string) => g.replace(/^k/, '{kx(taiko)}');
const HK_TICK = '_v70 ?h16 h16 ?h16 h16 ?h16 h16 ?h16 h16 ?h16 h16 ?h16 h16 ?h16 h16 ?h16 h16';

export const GAME_HACK: Song = {
  title: 'Brute Force',
  bpm: 136,
  loopFrom: 16,
  reverb: 'room',
  reverbMix: 0.7,
  delay: { beats: 0.75, feedback: 0.35, tone: 2600 },
  parts: {
    lead: { inst: 'fmpiano', pan: 0.1, rev: 0.22, dly: 0.18, vol: 0.85, mml: join(rest(4), ['_v108'], HK_A, HK_A2, ['_v112'], HK_B, ['_v100'], HK_C) },
    under: { inst: 'squarelead', pan: -0.15, rev: 0.18, dly: 0.22, vol: 0.38, mml: join(rest(4), ['_v96'], dn(HK_A), dn(HK_A2), dn(HK_B), rest(8)) },
    arp: { inst: 'squarelead', pan: 0.45, rev: 0.2, dly: 0.12, vol: 0.24, mml: join(rest(12), ['_v80'], arp16([...HK_PA, ...HK_PB], c => HK_V[c], 0), rest(8)) },
    bass: { inst: 'synthbass', pan: 0, rev: 0.05, vol: 0.85, mml: join(['_v100'], walk(HK_ALL, HK_R, hkOst)) },
    pad: { inst: 'pwm', pan: 0, rev: 0.4, vol: 0.3, mml: join(rest(2), ['_v66'], held([...HK_IN.slice(2), ...HK_PA, ...HK_PA, ...HK_PB, ...HK_PC], c => HK_V[c])) },
    drums: {
      inst: 'kick', drums: true, kit: '909', rev: 0.12, vol: 0.9,
      mml: join([HK_TICK, HK_TICK, '_v95 k8 h8 k8 h8 k8 h8 k8 o8', HK_FILL], ['_v104'], run(hkOpen(HK_TECH), HK_TECH, 8, HK_FILL), run(hkOpen(HK_TECH16), HK_TECH16, 8, HK_FILL),
        run(hkOpen(HK_TECH), HK_TECH, 8, HK_FILL), ['_v96'], run(hkOpen(HK_HALF), HK_HALF, 8, ROLL_UP)),
    },
  },
  arrangements: { main: {} },
};

/** "ACCESS GRANTED": the puzzle solved (2.6 s; the massacre's cut comes in under its ring). */
export const GAME_HACK_GRANTED: Song = {
  title: 'Access Granted',
  bpm: 136,
  length: 6,
  once: true,
  reverb: 'room',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.35, tone: 2600 },
  parts: {
    bell: { inst: 'fmpiano', pan: 0.1, rev: 0.25, dly: 0.25, vol: 0.9, mml: 'o4 _v110 a16 o5 c+16 e16 a16 o6 c+16 e16 _v120 a8 r4 r4 r4 r4' },
    pad: { inst: 'pwm', pan: 0, rev: 0.4, vol: 0.4, mml: 'r2 o4 _v90 {a >c+ e a}1' },
    hit: { inst: 'orchstab', pan: 0, rev: 0.25, vol: 0.75, mml: 'r2 o4 _v120 a4 r2.' },
    bass: { inst: 'synthbass', pan: 0, rev: 0.05, vol: 0.75, mml: 'r2 o2 _v110 a1' },
    drums: { inst: 'kick', drums: true, kit: '909', rev: 0.15, vol: 0.8, mml: '_v90 s16 s16 s16 s16 _v110 s16 s16 s16 s16 _v124 {kx(taiko)}4 r4 r2' },
  },
};

// =====================================================================================================================
// "FIVE TUMBLERS" (game:lockpick): FUTURE LAND's Area 51 door. G minor, 112, swung.
//   IN  (2)  the upright's ostinato alone, the hat pedal, a brush roll.
//   A   (8)  Gm - Gm - Cm - Cm - Gm - Gm - Eb7 - D7(#9): the clean guitar on the tune, pizzicato tiptoes.
//   A2  (8)  again, the vibes doubling it an octave up, the theremin far off, the pad.
//   B   (8)  Ebmaj7 - Ebmaj7 - Cm7 - Cm7 - Am7b5 - D7 - Gm - D7: a harmon trumpet on the bridge, the bass walking,
//            brushes sweeping.

const LK_V: Record<string, string[]> = {
  Gm: ['4b-', '5d', '5f+'], Cm: ['4g', '4b-', '5e-'], Eb7: ['4g', '4b-', '5d-'], D7: ['4f+', '5c', '5f'],
  Ebmaj7: ['4g', '4b-', '5d'], Cm7: ['4b-', '5e-', '5g'], Am7b5: ['4g', '5c', '5e-'],
};
const LK_R: Record<string, number> = { Gm: 43, Cm: 36, Eb7: 39, D7: 38, Ebmaj7: 39, Cm7: 36, Am7b5: 45 };
const LK_MIN = new Set(['Gm', 'Cm', 'Cm7', 'Am7b5']);
const lkSneak = (c: string): Step[] => [[0, '8', '!'], [null, '8'], [0, '8'], [LK_MIN.has(c) ? 3 : 4, '8'], [null, '8'], [5, '8'], [6, '8'], [7, '8']];
const lkWalk = (c: string): Step[] => [[0, '4.', '!'], [7, '8'], [null, '8'], [12, '8'], [c === 'Ebmaj7' ? 11 : 10, '8'], [7, '8']];
const LK_IN: Bar[] = ['Gm', 'Gm'];
const LK_PA: Bar[] = ['Gm', 'Gm', 'Cm', 'Cm', 'Gm', 'Gm', 'Eb7', 'D7'];
const LK_PB: Bar[] = ['Ebmaj7', 'Ebmaj7', 'Cm7', 'Cm7', 'Am7b5', 'D7', 'Gm', 'D7'];
const LK_A = [
  'o5 r8 d8 g8 b-8 a4 g8 d8', 'o5 f+4. g8 r2', 'o5 r8 g8 >c8 e-8 d4 c8 <g8', 'o5 a-4. g8 r2',
  'o5 r8 b-8 >d8 f8 e4 d8 <b-8', 'o5 a8 b-8 a8 g8 f+2', 'o5 r8 g8 b-8 >d-8 c4 <b-8 g8', 'o5 f+2 r2',
];
const LK_A2 = [...LK_A.slice(0, 7), 'o5 f+4 a4 >c4 <a4'];
const LK_B = ['o5 g2. f8 g8', 'o5 d1', 'o5 e-2. d8 e-8', 'o4 b-1', 'o5 c4 e-4 g4 f4', 'o5 f+2 e-4 c4', 'o4 b-2 a4 g4', 'o4 f+2 a4 >c4'];
const LK_THER = ['r1', 'r2 o6 d2', 'r1', 'r2 o5 a-2', 'r1', 'r2 o5 f+2', 'r1', 'r1'];
const LK_SPY = 'k8 (ride)8 {h(ride)}8 m8 k8 (ride)8 {h(ride)}8 (ride)8';
const LK_SPYX = '{k(crash)}8 (ride)8 {h(ride)}8 m8 k8 (ride)8 {h(ride)}8 (ride)8';
const LK_FILL = 'k8 (ride)8 {h(ride)}8 m8 s16 s16 s16 s16 (tom2)8 (tom4)8';
const LK_SWEEP = 'k8 s8 {hs}8 s8 k8 s8 {hs}8 s8';

export const GAME_LOCKPICK: Song = {
  title: 'Five Tumblers',
  bpm: 112,
  swing: 0.55, grid: 8,
  loopFrom: 8,
  reverb: 'room',
  reverbMix: 0.9,
  delay: { beats: 0.75, feedback: 0.4, tone: 2200 },
  parts: {
    guitar: { inst: 'cleangtr', pan: -0.15, rev: 0.25, dly: 0.3, vol: 0.85, mml: join(rest(2), ['_v104'], LK_A, LK_A2, rest(8)) },
    vibes: { inst: 'vibes', pan: 0.35, rev: 0.3, dly: 0.15, vol: 0.38, mml: join(rest(10), ['_v88'], up(LK_A2), ['_v74'], stabs(LK_PB, c => LK_V[c], '! . . . . x . .')) },
    trumpet: { inst: 'mutetrumpet', pan: 0.1, rev: 0.3, dly: 0.15, vol: 0.7, mml: join(rest(18), ['_v104'], LK_B) },
    ther: { inst: 'theremin', pan: 0.5, rev: 0.45, dly: 0.3, vol: 0.28, mml: join(['_g8'], rest(10), ['_v90'], LK_THER, rest(8)) },
    pizz: { inst: 'pizz', pan: 0.3, rev: 0.2, vol: 0.42, mml: join(rest(2), ['_v92'], stabs([...LK_PA, ...LK_PA], c => LK_V[c], '. x . . . x . .'), rest(8)) },
    pad: { inst: 'warmpad', pan: 0, rev: 0.4, vol: 0.26, mml: join(rest(10), ['_v62'], held([...LK_PA, ...LK_PB], c => LK_V[c])) },
    bass: { inst: 'upright', pan: 0, rev: 0.08, vol: 0.85, mml: join(['_v104'], walk([...LK_IN, ...LK_PA, ...LK_PA], LK_R, lkSneak), walk(LK_PB, LK_R, lkWalk)) },
    drums: {
      inst: 'kick', drums: true, kit: 'brush', rev: 0.15, vol: 0.85,
      mml: join(['_v80 h4 h4 h4 h4', '_v86 h4 h4 h4 s16 s16 s16 s16'], ['_v96'], run(LK_SPYX, LK_SPY, 8, LK_FILL), run(LK_SPYX, LK_SPY, 8, LK_FILL), ['_v88'], run(LK_SPYX, LK_SWEEP, 8, LK_FILL)),
    },
  },
  arrangements: { main: {} },
};

/** "TUMBLERS SET": the lock's turned (2.1 s). */
export const GAME_LOCKPICK_OPEN: Song = {
  title: 'Tumblers Set',
  bpm: 112,
  length: 4,
  once: true,
  reverb: 'room',
  reverbMix: 0.9,
  delay: { beats: 0.75, feedback: 0.4, tone: 2200 },
  parts: {
    vibes: { inst: 'vibes', pan: 0.2, rev: 0.35, dly: 0.25, vol: 0.7, mml: 'r8 o4 _v110 {g b- >d f+}2..' },
    guitar: { inst: 'cleangtr', pan: -0.2, rev: 0.25, dly: 0.35, vol: 0.6, mml: 'o5 _v104 d16 f+16 a16 o6 d16 r4 r2' },
    ther: { inst: 'theremin', pan: 0.4, rev: 0.45, dly: 0.3, vol: 0.35, mml: '_g8 o5 _v96 d4 o6 g2.' },
    bass: { inst: 'upright', pan: 0, rev: 0.08, vol: 0.85, mml: 'o2 _v112 _b-5 g4 r2.' },
    drums: { inst: 'kick', drums: true, kit: 'brush', rev: 0.15, vol: 0.8, mml: '_v120 {k(rimshot)}4 r2.' },
  },
};

// =====================================================================================================================
// "CHOOSE YOUR MONSTER" (game:mash-select): the MONSTER MASH cabinet's menus. Written in E minor (tr -1), 126.
//   IN  (2)  the organ's Em and B7 with the theremin's "woo-OOO", the 808's clap pickup.
//   A   (8)  Em - Em - Am - Am - C7 - B7 - Em - B7: the xylophone's bones.
//   A2  (8)  again, a square under it.
//   B   (8)  G - G - C - C - A7 - A7 - C7 - B7: the organ takes it, the clavinet chops, the cowbell.
//   A3  (8)  the bones again.

const MS_V: Record<string, string[]> = {
  Em: ['4e', '4g', '4b'], Am: ['4e', '4a', '5c'], C7: ['4e', '4g', '4b-'], B7: ['4d+', '4f+', '4a'],
  G: ['4d', '4g', '4b'], C: ['4e', '4g', '5c'], A7: ['4c+', '4e', '4g'],
};
const MS_R: Record<string, number> = { Em: 40, Am: 45, C7: 36, B7: 35, G: 43, C: 36, A7: 45 };
const msSlap = (c: string): Step[] => [[0, '8.', '!'], [0, '16'], [null, '8'], [12, '8'], [0, '8'], [7, '8'], [c === 'G' || c === 'C' ? 9 : 10, '8'], [12, '8']];
const MS_IN: Bar[] = ['Em', 'B7'];
const MS_PA: Bar[] = ['Em', 'Em', 'Am', 'Am', 'C7', 'B7', 'Em', 'B7'];
const MS_PB: Bar[] = ['G', 'G', 'C', 'C', 'A7', 'A7', 'C7', 'B7'];
const MS_ALL = [...MS_IN, ...MS_PA, ...MS_PA, ...MS_PB, ...MS_PA];
const MS_A = [
  'o5 e8 g8 b8 r16 a+16 b8 g8 e8 r8', 'o5 f+8 g8 f+8 e8 d+4 r4', 'o5 a8 >c8 e8 r16 d+16 e8 c8 <a8 r8', 'o5 b8 >c8 <b8 a8 g+4 r4',
  'o5 g8 b-8 >c8 e8 r8 d8 c8 <b-8', 'o5 a8 b8 >c8 d+8 r8 c8 <b8 a8', 'o5 g4 e4 b4 >e4', 'o6 d+4 c4 <b4 r4',
];
const MS_A2 = [...MS_A.slice(0, 7), 'o5 b4 >d+4 f+4 r4'];
const MS_B = [
  'o5 d4. <b8 r8 >d8 e8 g8', 'o5 b2 a4 g4', 'o5 e4. c8 r8 e8 g8 >c8', 'o6 e2 d4 c4',
  'o5 c+4. e8 r8 g8 a8 b-8', 'o5 a2 g4 e4', 'o5 g4 b-4 >c4 e4', 'o6 d+2 <b4 f+4',
];
const MS_WOO_A = ['r1', 'r1', 'r1', 'r2 o5 e4 o6 e4', 'r1', 'r1', 'r1', 'r2 o6 d+4 o5 b4'];
const MS_WOO_B = ['r1', 'r1', 'r1', 'r2 o5 g4 o6 c4', 'r1', 'r1', 'r1', 'r2 o6 d+4 o5 b4'];
const MS_CHOP = '. x . x . x . x';
const MS_GROOVE = 'k8 h16 h16 {sp}8 h16 k16 r16 k16 h8 {sp}8 h16 h16';
const MS_BELL = 'k8 w16 h16 {sp}8 h16 k16 r16 k16 w8 {sp}8 h16 h16';
const MS_FILL = '{kp}8 h16 h16 {sp}8 h16 h16 s16 s16 s16 s16 (808tom)16 (808tom)16 (808tomlo)16 (808tomlo)16';
const msOpen = (g: string) => g.replace(/^k/, '{kx}');

export const GAME_MASH_SELECT: Song = {
  title: 'Choose Your Monster',
  bpm: 126,
  swing: 0.45, grid: 16,
  loopFrom: 8,
  reverb: 'room',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.3, tone: 2400 },
  parts: trAll({
    bones: { inst: 'xylophone', pan: 0.1, rev: 0.22, dly: 0.1, vol: 0.8, mml: join(rest(2), ['_v108'], MS_A, MS_A2, rest(8), MS_A) },
    under: { inst: 'squarelead', pan: -0.25, rev: 0.18, dly: 0.12, vol: 0.3, mml: join(rest(10), ['_v92'], dn(MS_A2), rest(8), dn(MS_A)) },
    organ: {
      inst: 'organ', pan: -0.1, rev: 0.2, vol: 0.5,
      mml: join(['o4 _v100 {e g b}2 r2', 'o4 {d+ f+ a}2 r2'], ['_v80'], stabs([...MS_PA, ...MS_PA], c => MS_V[c], MS_CHOP), ['_v112'], MS_B, ['_v80'], stabs(MS_PA, c => MS_V[c], MS_CHOP)),
    },
    clav: { inst: 'clav', pan: 0.4, rev: 0.12, vol: 0.4, mml: join(rest(18), ['_v88'], stabs(MS_PB, c => MS_V[c], MS_CHOP), rest(8)) },
    woo: { inst: 'theremin', pan: 0.45, rev: 0.45, dly: 0.25, vol: 0.32, mml: join(['_g8 _v92'], ['o5 b1', 'o6 e2 o5 b2'], MS_WOO_A, MS_WOO_A, MS_WOO_B, MS_WOO_A) },
    oohs: { inst: 'oohs', pan: 0, rev: 0.45, vol: 0.28, mml: join(['_v62'], held(MS_ALL, c => MS_V[c])) },
    bass: { inst: 'slapbass', pan: 0, rev: 0.05, vol: 0.8, mml: join(['_v102'], walk(MS_ALL, MS_R, msSlap)) },
    drums: {
      inst: 'kick', drums: true, kit: '808', rev: 0.1, vol: 0.88,
      mml: join(['_v92 r2 s16 s16 s16 s16 {kp}4', MS_FILL], ['_v102'], run(msOpen(MS_GROOVE), MS_GROOVE, 8, MS_FILL), run(msOpen(MS_GROOVE), MS_GROOVE, 8, MS_FILL),
        run(msOpen(MS_BELL), MS_BELL, 8, MS_FILL), run(msOpen(MS_GROOVE), MS_GROOVE, 8, MS_FILL)),
    },
  }, -1),
  arrangements: { main: {} },
};

// "FIGHT IS BEGIN" (game:mash-fight): the bouts. Written in E minor (tr +1), 150.
//   IN  (4)  the chugs on the E, orchestra hits, the four on the floor coming in.
//   A   (8)  Em - Em - C - D - Em - Em - C - B: the distorted lead.
//   A2  (8)  again, the overdrive a third under it.
//   B   (8)  Am - Am - Em - Em - C - D - B - B: the choir on the tune, half time, power chords held.
//   C   (8)  Em - F - Em - F - Em - F - G - B: the pipe organ's monster walk over double kick.

const FT_R: Record<string, string> = { Em: 'e', C: 'c', D: 'd', B: 'b', Am: 'a', F: 'f', G: 'g' };
const ftRoot = (c: string) => FT_R[c];
const FT_IN: Bar[] = ['Em', 'Em', 'Em', 'Em'];
const FT_PA: Bar[] = ['Em', 'Em', 'C', 'D', 'Em', 'Em', 'C', 'B'];
const FT_PB: Bar[] = ['Am', 'Am', 'Em', 'Em', 'C', 'D', 'B', 'B'];
const FT_PC: Bar[] = ['Em', 'F', 'Em', 'F', 'Em', 'F', 'G', 'B'];
const FT_ALL = [...FT_IN, ...FT_PA, ...FT_PA, ...FT_PB, ...FT_PC];
const FT_A = [
  'o5 e8 e16 e16 g8 e8 a8 g8 e8 d8', 'o5 e4 b4 a8 g8 f+8 g8', 'o5 e8 e16 e16 g8 e8 >c8 <b8 g8 e8', 'o5 f+2 a4 >d4',
  'o5 e8 e16 e16 g8 e8 a8 g8 b8 >d8', 'o6 e4 d8 <b8 >d4 <b4', 'o6 c4 <b8 g8 a4 g8 e8', 'o5 d+2 f+4 b4',
];
const FT_A2 = [...FT_A.slice(0, 7), 'o5 b2 a4 f+4'];
const FT_B = ['o5 e2. c4', 'o5 a2 g4 e4', 'o5 g2. e4', 'o5 b2 a4 g4', 'o5 e2 g4 >c4', 'o6 d2 c4 <a4', 'o5 b1', 'o5 d+2 f+4 a4'];
const FT_WALK_E = 'o4 e8 e8 g8 e8 f8 e8 d+8 e8', FT_WALK_F = 'o4 f8 f8 a8 f8 >c8 <b8 a8 f8';
const FT_C = [FT_WALK_E, FT_WALK_F, FT_WALK_E, FT_WALK_F, FT_WALK_E, FT_WALK_F, 'o4 g8 g8 b8 g8 >d8 c+8 c8 <b8', 'o4 b8 b8 >d+8 <b8 >f+8 f8 e8 d+8'];
const FT_HIT_A = ['o4 !e8 r8 r2.', 'r1', 'r1', 'r1', 'o4 !e8 r8 r2.', 'r1', 'r1', 'o4 !b8 r8 r8 b8 r2'];
const FT_HIT_C = ['o4 !e8 r8 r2.', 'o4 !f8 r8 r2.', 'o4 !e8 r8 r2.', 'o4 !f8 r8 r2.', 'o4 !e8 r8 r2.', 'o4 !f8 r8 r2.', 'o4 !g8 r8 r2.', 'o4 !b8 r8 b8 r8 b8 r8 b4'];
/** Sixteenth chugs on the root, the beats leaned on. */
const chug16 = (prog: Bar[]) => bars(prog, (c, b) => `o2 ${Array.from({ length: b * 4 }, (_, i) => `${i % 4 === 0 ? '!' : ''}${ftRoot(c)}16`).join(' ')}`);
const FT_FLOOR = 'k8 h8 k8 h8 k8 h8 k8 h8';
const FT_TECH = 'k8 o8 {kp}8 o8 k8 o8 {kp}8 o8';
const FT_TECH16 = 'k16 k16 o16 h16 {kp}16 h16 o16 k16 k16 h16 o16 h16 {kp}16 h16 o16 h16';
const FT_HALF = 'k8 h8 h8 h8 {kp(taiko)}8 h8 k8 h8';
const FT_DBL = 'k16 k16 k16 k16 {kp}16 k16 k16 k16 k16 k16 k16 k16 {kp}16 k16 k16 k16';
const ftOpen = (g: string) => g.replace(/^k/, '{kx}');

export const GAME_MASH_FIGHT: Song = {
  title: 'Fight Is Begin',
  bpm: 150,
  loopFrom: 16,
  reverb: 'room',
  reverbMix: 0.6,
  delay: { beats: 0.75, feedback: 0.25, tone: 2600 },
  parts: trAll({
    lead: { inst: 'distlead', pan: 0.15, rev: 0.18, dly: 0.12, vol: 0.55, mml: join(rest(4), ['_v110'], FT_A, FT_A2, ['_v112'], FT_B, rest(8)) },
    harm: { inst: 'overdrive', pan: -0.3, rev: 0.15, dly: 0.1, vol: 0.4, mml: join(rest(12), ['_v100'], harm(FT_A2, scale('e', 'harmonic'), -2), rest(16)) },
    choir: { inst: 'choir', pan: 0, rev: 0.4, vol: 0.42, mml: join(rest(20), ['_v96'], FT_B, rest(8)) },
    organ: { inst: 'churchorgan', pan: 0.2, rev: 0.35, vol: 0.45, mml: join(rest(28), ['_v104'], FT_C) },
    hits: { inst: 'orch2', pan: 0, rev: 0.2, vol: 0.55, mml: join(['_v118'], riff(FT_IN, ftRoot, '! . . x . . x .', 4), FT_HIT_A, FT_HIT_A, rest(8), FT_HIT_C) },
    chug: { inst: 'chug', pan: 0.3, rev: 0.05, vol: 0.48, mml: join(['_v104'], chug16([...FT_IN, ...FT_PA, ...FT_PA]), rest(8), chug16(FT_PC)) },
    power: { inst: 'powerchord', pan: -0.35, rev: 0.08, vol: 0.48, mml: join(rest(4), ['_v110'], riff([...FT_PA, ...FT_PA], ftRoot, '! . . x . . x .'), riff(FT_PB, ftRoot, '! - - - x - x -'), riff(FT_PC, ftRoot, '! . x . ! . x .')) },
    bass: { inst: 'synthbass', pan: 0, rev: 0.05, vol: 0.78, mml: join(['_v100'], pump(FT_ALL, ftRoot)) },
    drums: {
      inst: 'kick', drums: true, kit: '909', rev: 0.12, vol: 0.85,
      mml: join(['_v100'], [ftOpen(FT_FLOOR), FT_FLOOR, FT_FLOOR, HK_FILL], ['_v106'], run(ftOpen(FT_TECH), FT_TECH, 8, HK_FILL), run(ftOpen(FT_TECH16), FT_TECH16, 8, HK_FILL),
        run('{kx(taiko)}8 h8 h8 h8 {kp(taiko)}8 h8 k8 h8', FT_HALF, 8, HK_FILL), run(ftOpen(FT_DBL), FT_DBL, 8, ROLL_UP)),
    },
  }, 1),
  arrangements: { main: {} },
};

/** "MONSTROSITY!": he won the match (2.4 s). */
export const GAME_MASH_WIN: Song = {
  title: 'Monstrosity!',
  bpm: 150,
  length: 6,
  once: true,
  reverb: 'room',
  reverbMix: 0.6,
  parts: trAll({
    hit: { inst: 'orch2', pan: 0, rev: 0.2, vol: 0.7, mml: 'o4 _v118 e8 r8 g8 a8 r8 b8 o5 _v127 e2 r4' },
    lead: { inst: 'distlead', pan: 0.15, rev: 0.2, dly: 0.1, vol: 0.5, mml: 'r2 r8 o4 _v112 b8 o5 e8 g8 _m50 b2' },
    chug: { inst: 'chug', pan: 0.3, rev: 0.05, vol: 0.5, mml: 'o2 _v112 e16 e16 e16 e16 e16 e16 e16 e16 r2 o2 e2' },
    power: { inst: 'powerchord', pan: -0.3, rev: 0.08, vol: 0.55, mml: 'o2 _v118 e8 r8 g8 a8 r8 b8 o3 _v124 e2 r4' },
    bass: { inst: 'synthbass', pan: 0, rev: 0.05, vol: 0.75, mml: 'o2 _v112 e8 r8 g8 a8 r8 b8 o2 e2 r4' },
    drums: { inst: 'kick', drums: true, kit: '909', rev: 0.15, vol: 0.85, mml: '_v118 {kx}8 k8 {ks}8 k8 {ks}8 {ks}8 _v127 {kx}2 r4' },
  }, 1),
};

/** "GAME OVER": the kid won the match (2.9 s). */
export const GAME_MASH_LOSE: Song = {
  title: 'Game Over',
  bpm: 126,
  length: 6,
  once: true,
  reverb: 'room',
  reverbMix: 0.8,
  parts: trAll({
    bones: { inst: 'xylophone', pan: 0.1, rev: 0.25, vol: 0.85, mml: 'o6 _v110 e8 d+8 d8 c+8 c8 <b8 a+8 a8 r2' },
    woo: { inst: 'theremin', pan: 0.4, rev: 0.45, dly: 0.25, vol: 0.38, mml: '_g4 o5 _v96 b2 o4 e2.. r8' },
    bass: { inst: 'slapbass', pan: 0, rev: 0.05, vol: 0.8, mml: 'o2 _v104 e8 d+8 d8 c+8 c8 o1 b8 a+8 a8 o1 e2' },
    drums: { inst: 'kick', drums: true, kit: '808', rev: 0.12, vol: 0.8, mml: '_v100 r1 (808tom)8 (808tomlo)8 {k(808clap)}4' },
  }, -1),
};

// =====================================================================================================================
// "TEST YOUR PLUNGE" (game:plunge): HOLLYWOOD LAND's clog. Written in G (tr +1), 116, swung.
//   IN  (2)  a snare roll; the brass's fanfare on the D7.
//   A   (8)  G - G - C - G - A7 - D7 - G - D7: the harmon trumpet's strut, the brass answering "bum-bum BAH".
//   A2  (8)  again, the trombone smearing up into the gaps.
//   B   (8)  Em - Em - C - Cm - G - E7 - A7 - D7: the heave (the minor iv), timpani, half time.

const PL_V: Record<string, string[]> = {
  G: ['4d', '4g', '4b'], C: ['4e', '4g', '5c'], A7: ['4e', '4g', '5c+'], D7: ['4f+', '4a', '5c'], Em: ['4e', '4g', '4b'], Cm: ['4e-', '4g', '5c'], E7: ['4e', '4g+', '5d'],
};
const PL_R: Record<string, number> = { G: 43, C: 36, A7: 45, D7: 38, Em: 40, Cm: 36, E7: 40 };
const plOompah = (): Step[] => [[0, '4', '!'], [7, '4'], [12, '8'], [0, '8'], [7, '4']];
const PL_IN: Bar[] = ['D7', 'D7'];
const PL_PA: Bar[] = ['G', 'G', 'C', 'G', 'A7', 'D7', 'G', 'D7'];
const PL_PA2: Bar[] = ['G', 'G', 'C', 'G', 'A7', 'D7', 'G', 'G'];
const PL_PB: Bar[] = ['Em', 'Em', 'C', 'Cm', 'G', 'E7', 'A7', 'D7'];
const PL_ALL = [...PL_IN, ...PL_PA, ...PL_PA2, ...PL_PB];
const PL_A = [
  'o5 g4. d8 r8 g8 a8 b8', 'o5 a+8 b4. a8 g8 e8 d8', 'o5 e4. g8 r8 >c8 <b8 g8', 'o5 a8 b4. g4 r4',
  'o5 c+4. e8 r8 g8 a8 b8', 'o6 c8 c4. <a8 f+4.', 'o5 g4 b4 >d4 <b4', 'o5 a2 r2',
];
const PL_A2 = [...PL_A.slice(0, 7), 'o5 g2 r2'];
const PL_B = [
  'o5 b4. g8 r8 e8 f+8 g8', 'o5 b2 a4 g4', 'o5 e4. g8 r8 >c8 <b8 a8', 'o5 g4 e-4 c4 r4',
  'o5 d4. g8 r8 b8 >d8 <b8', 'o5 g+2 e4 d4', 'o5 c+4. e8 r8 a8 g8 e8', 'o5 f+4 a4 >c4 <a4',
];
/** The brass's "bum-bum BAH" on the second bar of every two. */
const plAnswers = (prog: Bar[]) => prog.map((c, i) => (i % 2 ? stabs([c], k => PL_V[k], '. . . . x . ! -')[0] : 'r1'));
const PL_SMEAR = 'r2 o3 _b-12/4 g4 _f-7/8 d4';
const PL_STRUT = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 !{s(tom1)}8 h8';
const PL_STRX = '{kx}8 h8 {sh}8 h8 {kh}8 {kh}8 !{s(tom1)}8 h8';
const PL_ROLL = '_v60 s16 s16 s16 s16 _v75 s16 s16 s16 s16 _v90 s16 s16 s16 s16 _v105 s16 s16 s16 s16';

export const GAME_PLUNGE: Song = {
  title: 'Test Your Plunge',
  bpm: 116,
  swing: 0.5, grid: 8,
  loopFrom: 8,
  reverb: 'hall',
  reverbMix: 0.7,
  parts: trAll({
    lead: { inst: 'mutetrumpet', pan: 0.05, rev: 0.25, dly: 0.08, vol: 0.85, mml: join(rest(2), ['_v108'], PL_A, PL_A2, ['_v114'], PL_B) },
    brass: {
      inst: 'brass', pan: -0.2, rev: 0.25, vol: 0.5,
      mml: join(['r1', 'o4 _v116 {f+ a >d}8. {f+ a >d}16 {f+ a >d}4 {a >c f+}2'], ['_v108'], plAnswers(PL_PA), plAnswers(PL_PA2), ['_v104'], stabs(PL_PB, c => PL_V[c], '! . . x . . x .')),
    },
    bone: { inst: 'trombone', pan: 0.35, rev: 0.25, vol: 0.5, mml: join(rest(10), ['_v100'], PL_PA2.map((_, i) => (i % 2 ? PL_SMEAR : 'r1')), rest(8)) },
    tuba: { inst: 'tuba', pan: 0, rev: 0.12, vol: 0.75, mml: join(['_v106'], walk(PL_ALL, PL_R, plOompah)) },
    organ: { inst: 'organslow', pan: 0.25, rev: 0.3, vol: 0.28, mml: join(rest(2), ['_v72'], held([...PL_PA, ...PL_PA2, ...PL_PB], c => PL_V[c])) },
    bell: { inst: 'glock', pan: 0.3, rev: 0.35, vol: 0.42, mml: join(rest(2), ['_v116'], ['o6 g4 r2.', ...rest(7)], ['o6 g4 r2.', ...rest(7)], ['o6 e4 r2.', ...rest(6), 'r2 o6 d4 d4']) },
    timp: { inst: 'timpani', pan: -0.1, rev: 0.3, vol: 0.55, mml: join(rest(18), ['_v106'], bars(PL_PB, c => `${mn(PL_R[c], '4', '!')} r2.`)) },
    drums: {
      inst: 'kick', drums: true, rev: 0.15, vol: 0.8,
      mml: join([PL_ROLL, '_v112 {kx}4. s8 {ks}4 (tom4)8 (tom4)8'], ['_v104'], sec(PL_STRUT, 8, FILL, PL_STRX), sec(PL_STRUT, 8, FILL2, PL_STRX), ['_v100'], sec(HALF, 8, ROLL_UP)),
    },
  }, 1),
  arrangements: { main: {} },
};

/** "CLOG BUSTED": the clog blows clear (2.6 s; the shard's card comes up under its ring). */
export const GAME_PLUNGE_WIN: Song = {
  title: 'Clog Busted',
  bpm: 116,
  length: 5,
  once: true,
  reverb: 'hall',
  reverbMix: 0.7,
  parts: trAll({
    trumpet: { inst: 'trumpet', pan: 0, rev: 0.25, vol: 0.6, mml: 'r4 o5 _v116 g8 b8 >d4. <b8 >g4' },
    brass: { inst: 'brass', pan: -0.2, rev: 0.25, vol: 0.55, mml: 'r4 o4 _v120 {b >d g}4 r8 {b >d g}8 {b >d g}2' },
    bell: { inst: 'glock', pan: 0.3, rev: 0.35, vol: 0.55, mml: 'r4 o6 _v122 g4 r4 o7 d4 r4' },
    tuba: { inst: 'tuba', pan: 0, rev: 0.12, vol: 0.8, mml: 'r4 o2 _v116 g4 r4 _f-12/4 g2' },
    drums: { inst: 'kick', drums: true, rev: 0.15, vol: 0.8, mml: '_v80 s32 s32 s32 s32 s32 s32 s32 s32 _v124 {kx}4 r4 {ks}8 {ks}8 {kx}4' },
  }, 1),
};

// =====================================================================================================================
// "DEAD-EYE DOOLEY'S" (game:gallery): WILDERNESS LAND's shooting gallery. F, 172.
//   IN  (2)  the piano running up the C7.
//   A   (8)  F - F - C7 - C7 - F - F7 - Bb - C7: the piano's rag, its left hand striding, banjo offbeats.
//   A2  (8)  again (a square doubling it: the penny arcade), home to F.
//   B   (8)  D7 - D7 - G7 - G7 - C7 - C7 - F - C7: round the ragtime circle, the gallop.
//   A2  (8)  again.
//   C   (8)  Bb - Bb - F - F - G7 - G7 - C7 - C7: the square lead takes the tune, the kit driving.

const GL_V: Record<string, string[]> = {
  F: ['4f', '4a', '5c'], C7: ['4e', '4g', '4b-'], F7: ['4e-', '4f', '4a'], Bb: ['4d', '4f', '4b-'], D7: ['4f+', '4a', '5c'], G7: ['4f', '4g', '4b'],
};
const GL_R: Record<string, number> = { F: 41, C7: 36, F7: 41, Bb: 34, D7: 38, G7: 43 };
const glStride = (prog: Bar[]) => bars(prog, (c, b) => {
  const r = GL_R[c], ch = chord(GL_V[c], '4');
  return b === 4 ? `${mn(r, '4', '!')} ${ch} ${mn(r + 7, '4')} ${ch}` : `${mn(r, '4', '!')} ${ch}`;
});
const glTwo = (): Step[] => [[0, '4', '!'], [7, '4'], [12, '4'], [7, '4']];
const GL_IN: Bar[] = ['C7', 'C7'];
const GL_PA: Bar[] = ['F', 'F', 'C7', 'C7', 'F', 'F7', 'Bb', 'C7'];
const GL_PA2: Bar[] = ['F', 'F', 'C7', 'C7', 'F', 'F7', ['Bb', 'C7'], 'F'];
const GL_PB: Bar[] = ['D7', 'D7', 'G7', 'G7', 'C7', 'C7', 'F', 'C7'];
const GL_PC: Bar[] = ['Bb', 'Bb', 'F', 'F', 'G7', 'G7', 'C7', 'C7'];
const GL_LOOP = [...GL_PA, ...GL_PA2, ...GL_PB, ...GL_PA2, ...GL_PC];
const GL_ALL = [...GL_IN, ...GL_LOOP];
const GL_INTRO = ['o4 c16 e16 g16 b-16 o5 c16 e16 g16 b-16 o6 c4 r4', 'o5 b-8 a8 g8 e8 c4 r4'];
const GL_A = [
  'o5 c8 f8 a8 >c8 r8 <a8 >c4', 'o5 b-8 a8 g+8 a8 f4 r4', 'o5 c8 e8 g8 b-8 r8 g8 b-4', 'o5 a8 g8 f+8 g8 e4 r4',
  'o5 c8 f8 a8 >c8 r8 <a8 >f4', 'o6 e-8 d8 c8 <a8 >c4 <a4', 'o5 b-8 >d8 f8 d8 <b-4 g4', 'o5 a4 g4 e4 c4',
];
const GL_A2 = [...GL_A.slice(0, 6), 'o5 b-8 >d8 f8 d8 c8 <b-8 g8 e8', 'o5 f4 a4 f4 r4'];
const GL_B = [
  'o5 f+8 a8 >d8 f+8 r8 e8 d8 c8', 'o5 a4 f+4 d4 r4', 'o5 g8 b8 >d8 f8 r8 e8 d8 <b8', 'o5 g4 b4 >d4 r4',
  'o5 e8 g8 b-8 >e8 r8 d8 c8 <b-8', 'o5 g4 e4 c4 r4', 'o5 a8 >c8 f8 a8 r8 g8 f8 c8', 'o5 b-4 g4 e4 c4',
];
const GL_C = [
  'o5 d4 f4 b-4 >d4', 'o6 c8 d8 c8 <b-8 a4 f4', 'o5 c4 f4 a4 >c4', 'o5 b-8 >c8 <b-8 a8 g4 f4',
  'o5 d4 g4 b4 >d4', 'o6 f8 e8 d8 <b8 g4 d4', 'o5 e4 g4 b-4 >e4', 'o6 d8 c8 <b-8 g8 e4 c4',
];
const GL_BEAT = '{kh}8 e8 {sh}8 h8 {kh}8 e8 {sh}8 h8';

export const GAME_GALLERY: Song = {
  title: "Dead-Eye Dooley's",
  bpm: 172,
  loopFrom: 8,
  reverb: 'room',
  reverbMix: 0.6,
  delay: { beats: 0.5, feedback: 0.2, tone: 2800 },
  parts: {
    piano: { inst: 'piano', pan: 0.1, rev: 0.18, vol: 0.62, mml: join(['_v106'], GL_INTRO, GL_A, GL_A2, GL_B, GL_A2, rest(8)) },
    lh: { inst: 'piano', pan: -0.1, rev: 0.15, vol: 0.42, mml: join(['_v86'], glStride(GL_ALL)) },
    square: { inst: 'squarelead', pan: -0.2, rev: 0.2, dly: 0.12, vol: 0.32, mml: join(rest(10), ['_v88'], GL_A2, rest(8), GL_A2, ['_v118'], GL_C) },
    banjo: { inst: 'banjo', pan: 0.4, rev: 0.12, vol: 0.4, mml: join(rest(2), ['_v92'], stabs(GL_LOOP, c => GL_V[c], '. x . x . x . x')) },
    bass: { inst: 'upright', pan: 0, rev: 0.06, vol: 0.55, mml: join(['_v100'], walk(GL_ALL, GL_R, glTwo)) },
    drums: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.75,
      mml: join(['_v100 r2 s16 s16 s16 s16 {ks}4', FILL], ['_v106'], sec(GL_BEAT, 8, FILL), sec(GL_BEAT, 8, FILL2), sec(MM2, 8, FILL), sec(GL_BEAT, 8, FILL2), sec(DRIVE, 8, FILL_BIG)),
    },
  },
  arrangements: { main: {} },
};

/** "EVERYBODY'S A WINNER": the time's up (2.1 s). */
export const GAME_GALLERY_END: Song = {
  title: "Everybody's a Winner",
  bpm: 172,
  length: 6,
  once: true,
  reverb: 'room',
  reverbMix: 0.6,
  parts: {
    piano: { inst: 'piano', pan: 0, rev: 0.2, vol: 0.65, mml: 'o4 _v108 c16 f16 a16 o5 c16 f16 a16 o6 c16 f16 o5 _v118 {f a >c f}4 r4 o4 {f a >c f}2' },
    banjo: { inst: 'banjo', pan: 0.4, rev: 0.12, vol: 0.45, mml: 'r2 o4 _v104 {f a >c}8 {f a >c}8 r4 {f a >c}2' },
    bell: { inst: 'glock', pan: 0.3, rev: 0.3, vol: 0.45, mml: 'r2 o6 _v118 c4 r4 o6 f2' },
    bass: { inst: 'upright', pan: 0, rev: 0.06, vol: 0.6, mml: 'r2 o2 _v110 c4 r4 f2' },
    drums: { inst: 'kick', drums: true, rev: 0.12, vol: 0.8, mml: '_v100 s16 s16 s16 s16 s16 s16 s16 s16 _v120 {kx}4 r4 {kx}4 r4' },
  },
};

// =====================================================================================================================
// "BUMPER BASH" (game:bumper): CARTOON LAND's bumper cars. Written in A minor (tr -1), 196.
//   IN  (2)  the countdown: the E stuttering, a fill.
//   A   (8)  Am - Am - Dm - E - Am - Am - F - E: the organ's carnival tune, power-chord eighths.
//   A2  (8)  again, the distorted lead an octave under.
//   B   (8)  C - C - G - G - F - F - E - E: bright, the brass, the calliope pumping offbeats.
//   C   (8)  Am - Bb - Am - Bb - F - E - F - E: the pile-up: brass hits, slapsticks and toms, the guitar wailing.
//   A3  (8)  the tune again, both of them.

const BB_V: Record<string, string[]> = {
  Am: ['4e', '4a', '5c'], Dm: ['4f', '4a', '5d'], E: ['4e', '4g+', '4b'], F: ['4f', '4a', '5c'], C: ['4e', '4g', '5c'], G: ['4d', '4g', '4b'], Bb: ['4d', '4f', '4b-'],
};
const BB_R: Record<string, string> = { Am: 'a', Dm: 'd', E: 'e', F: 'f', C: 'c', G: 'g', Bb: 'b-' };
const bbRoot = (c: string) => BB_R[c];
const BB_IN: Bar[] = ['E', 'E'];
const BB_PA: Bar[] = ['Am', 'Am', 'Dm', 'E', 'Am', 'Am', 'F', 'E'];
const BB_PB: Bar[] = ['C', 'C', 'G', 'G', 'F', 'F', 'E', 'E'];
const BB_PC: Bar[] = ['Am', 'Bb', 'Am', 'Bb', 'F', 'E', 'F', 'E'];
const BB_ALL = [...BB_IN, ...BB_PA, ...BB_PA, ...BB_PB, ...BB_PC, ...BB_PA];
const BB_A = [
  'o5 e8 d+8 e8 a8 r8 g+8 a8 >c8', 'o6 e4 d8 c8 <b8 a8 g+8 a8', 'o5 d8 c+8 d8 f8 r8 e8 f8 a8', 'o5 g+4 b4 >d4 <b4',
  'o5 e8 d+8 e8 a8 r8 g+8 a8 >c8', 'o6 e8 f8 e8 d+8 e4 c4', 'o5 a8 g+8 a8 >c8 f4 e8 d8', 'o6 c4 <b4 g+4 e4',
];
const BB_B = [
  'o5 g4. e8 g8 >c8 e8 g8', 'o6 f8 e8 d8 c8 <b4 g4', 'o5 g4. d8 g8 b8 >d8 g8', 'o6 f8 e8 d8 <b8 g4 d4',
  'o5 a4. f8 a8 >c8 f8 a8', 'o6 g8 f8 e8 d8 c4 <a4', 'o5 g+4. e8 g+8 b8 >e8 g+8', 'o6 b4 a4 g+4 e4',
];
const BB_WAIL = ['o5 _m60 e1', 'o5 f1', 'o5 e1', 'o5 f1', 'o5 a2 >c2', 'o5 b1', 'o6 c2 d2', 'o6 e2 _m0 <b2'];
const BB_PILE = '! . ! . x x ! .';
const BB_CHAOS = '{kx}8 (slapstick)8 {s(tom1)}8 k8 {k(tom2)}8 (slapstick)8 {s(tom4)}8 k8';

export const GAME_BUMPER: Song = {
  title: 'Bumper Bash',
  bpm: 196,
  loopFrom: 8,
  reverb: 'room',
  reverbMix: 0.6,
  delay: { beats: 0.75, feedback: 0.25, tone: 2600 },
  parts: trAll({
    organ: { inst: 'organ', pan: 0.1, rev: 0.18, vol: 0.55, mml: join(rest(2), ['_v110'], BB_A, BB_A, ['_v112'], BB_B, rest(8), ['_v110'], BB_A) },
    guitar: { inst: 'distlead', pan: -0.3, rev: 0.15, dly: 0.1, vol: 0.4, mml: join(rest(10), ['_v100'], dn(BB_A), ['_v106'], dn(BB_B), ['_v112'], BB_WAIL, ['_v100'], dn(BB_A)) },
    calliope: { inst: 'calliope', pan: 0.4, rev: 0.2, vol: 0.28, mml: join(rest(18), ['_v86'], stabs(BB_PB, c => BB_V[c], '. x . x . x . x'), rest(16)) },
    brass: { inst: 'brass', pan: 0.25, rev: 0.2, vol: 0.5, mml: join(rest(18), ['_v110'], stabs(BB_PB, c => BB_V[c], '! . . x . . x .'), ['_v116'], stabs(BB_PC, c => BB_V[c], BB_PILE), rest(8)) },
    power: {
      inst: 'powerchord', pan: -0.4, rev: 0.08, vol: 0.48,
      mml: join(['_v106'], riff(BB_IN, bbRoot, '! x x x ! x x x'), riff([...BB_PA, ...BB_PA], bbRoot, '! x x x ! x x x'), riff(BB_PB, bbRoot, '! - x - ! - x x'), riff(BB_PC, bbRoot, BB_PILE), riff(BB_PA, bbRoot, '! x x x ! x x x')),
    },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.8, mml: join(['_v104'], pump(BB_ALL, bbRoot)) },
    drums: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.82,
      mml: join(['_v100 {ks}8 {ks}8 r8 {ks}8 r8 {ks}8 {ks}8 r8', FILL], ['_v106'], sec(DRIVE, 8, FILL), sec(BEAT16, 8, FILL2), sec(BEAT, 8, FILL), [...rep(BB_CHAOS, 7), FILL_BIG], sec(DRIVE, 8, FILL2)),
    },
  }, -1),
  arrangements: { main: {} },
};

/** "EVERYBODY'S DEAD!": every rival car wrecked (2.4 s). */
export const GAME_BUMPER_WIN: Song = {
  title: "Everybody's Dead!",
  bpm: 196,
  length: 8,
  once: true,
  reverb: 'room',
  reverbMix: 0.6,
  parts: trAll({
    organ: { inst: 'organ', pan: 0.1, rev: 0.2, vol: 0.55, mml: 'o5 _v110 a16 b16 >c16 d16 e16 f+16 g+16 a16 o6 _v120 {c+ e a}2 r4 o5 {a >c+ e a}2.' },
    brass: { inst: 'brass', pan: -0.2, rev: 0.2, vol: 0.55, mml: 'r2 o4 _v118 {a >c f}8 r8 {b >d g}8 r8 _v124 {c+ e a}2.. r8' },
    power: { inst: 'powerchord', pan: -0.4, rev: 0.08, vol: 0.5, mml: 'r2 o2 _v118 !f8 r8 g8 r8 _v124 a2.. r8' },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.8, mml: 'r2 o2 _v112 f8 r8 g8 r8 a2.. r8' },
    drums: { inst: 'kick', drums: true, rev: 0.12, vol: 0.85, mml: '_v104 s16 s16 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 _v120 {kx}8 r8 {kx}8 r8 _v127 {kx}2.. r8' },
  }, -1),
};

/** "TIME!": the clock ran out (1.8 s). */
export const GAME_BUMPER_LOSE: Song = {
  title: 'Time!',
  bpm: 196,
  length: 6,
  once: true,
  reverb: 'room',
  reverbMix: 0.6,
  parts: trAll({
    organ: { inst: 'organ', pan: 0.1, rev: 0.2, vol: 0.5, mml: 'o5 _v112 {a >c e}8 {a >c e}8 r4 o4 _v104 {g+ b >d f}2. r4' },
    power: { inst: 'powerchord', pan: -0.4, rev: 0.08, vol: 0.55, mml: 'o2 _v120 !a8 a8 r4 _f-12/2 a2. r4' },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.8, mml: 'o2 _v114 a8 a8 r4 _f-12/2 a2. r4' },
    drums: { inst: 'kick', drums: true, rev: 0.12, vol: 0.85, mml: '_v118 {kx}8 {ks}8 r4 _v124 {k(china)}2. (slapstick)4' },
  }, -1),
};
