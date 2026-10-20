// "WELCOME TO HAPPY LAND": Meathead 2's theme (the title screen; cues.ts's last fallback at the hub, the staff room and
// the way in). The sequel's take on Meathead 1's title (src/m1/game/platform/music/songs.ts `title`: E minor at 150, the
// power-chord riff E E - E G A / E E - E C D, the brass tune up the E minor chord to the B and back down, eight bars):
// the same key, tempo, riff and tune, so it's known from the first bar, re-harmonized (a C - D lift, the A minor
// seventh and the B7 with its D-sharp leading back home, a C major seventh under the high E), with a new middle in the
// relative major. Played the Mega Man way (the user's: "give it more of a high energy mega man vibe"): a square lead
// with its harmony a third under it, a singing lead guitar answering, power chords, a pumping octave bass, sixteenth
// arpeggios, a rock kit with a fill into every section.
//
// E minor, 150, straight. 32 bars: a 4-bar intro (once: Meathead 1's riff on the guitars alone, the band crashing in
// on C and D, a snare roll up the B7 and the arpeggio climbing), then the 28-bar loop:
//   A  (8)  Meathead 1's tune on the square lead (scooped, a D-sharp run up into the high E), the guitar answering in
//           its gaps, the riff on the power chords, the bass pumping octaves, synth-brass stabs, a rock kit.
//   B  (8)  G major: a new tune built off the old one's head on the lead guitar with the square a third over it, the
//           sixteenth arpeggios, the Mega Man 2 kick-kick-snare; down to the B7 to go home.
//   A' (8)  everything: the tune harmonized, the brass and the choir, the arpeggios, the sixteenth-hat kit; it falls off
//           its last E into the break.
//   BR (4)  the riff, the square and the guitar in octaves on it over the power chords, half time, a fill to the top.
//
// ARRANGEMENTS (each crossfades into the next without losing its place):
//   main      the whole band
//   lounge    after hours (the staff room's stand-in): the tune on a Rhodes, the finger bass, slow strings, a half-time
//             sidestick groove
//   calliope  the hub's stand-in, all chip: square leads, synth brass, synth bass, the kit
//   cutscene  under a scene: the tune on a violin, slow strings, the bass

import type { Song } from '../engine';
import { scale, harm, pump, arp16, riff as riffOf, BEAT, BEAT16, MM2, HALF, X, FILL, FILL2, FILL_BIG, sec } from './mega';

type Bar = string | [string, string];
const join = (...parts: string[][]) => parts.flat().join(' | ');
const rest = (n: number) => Array.from({ length: n }, () => 'r1');
const rep = (bar: string, n: number) => Array.from({ length: n }, () => bar);
/** Everything an octave up / down (each bar's o-number moved; its > and < as they are). */
const up = (bars: string[]) => bars.map(b => b.replace(/o(\d)/g, (_, n) => `o${Number(n) + 1}`));
const down = (bars: string[]) => bars.map(b => b.replace(/o(\d)/g, (_, n) => `o${Number(n) - 1}`));

// The chords: voicings (o4, upward), and the bass's root and fifth (o2)
const V: Record<string, string> = {
  Em: 'e g b', C: 'e g >c', D: 'f+ a >d', B7: 'd+ f+ a b', Am7: 'e g a >c', Cmaj7: 'e g b >c', G: 'd g b', 'D/F#': 'f+ a >d',
};
/** The same voicings as octave-notes (for the arpeggios). */
const VN: Record<string, string[]> = {
  Em: ['4e', '4g', '4b'], C: ['4e', '4g', '5c'], D: ['4f+', '4a', '5d'], B7: ['4d+', '4f+', '4b'], Am7: ['4e', '4a', '5c'], Cmaj7: ['4e', '4g', '5c'],
  G: ['4d', '4g', '4b'], 'D/F#': ['4f+', '4a', '5d'],
};
const R: Record<string, [string, string]> = {
  Em: ['e', 'b'], C: ['c', 'g'], D: ['d', 'a'], B7: ['b', 'f+'], Am7: ['a', 'e'], Cmaj7: ['c', 'g'], G: ['g', 'd'], 'D/F#': ['f+', 'd'],
};
const A: Bar[] = ['Em', ['C', 'D'], 'Em', ['Am7', 'B7'], 'Cmaj7', 'Am7', 'D', ['Em', 'D']];
const A2: Bar[] = [...A.slice(0, 7), ['Em', 'B7']];
const B: Bar[] = ['G', 'D/F#', 'Em', 'C', 'Am7', 'D', ['G', 'Em'], 'B7'];
const BR: Bar[] = ['Em', ['C', 'D'], 'Em', 'B7'];
const EM = scale('e', 'minor'), GM = scale('g', 'major');

/** A bar per chord (or two chords a bar, half each). */
const each = (prog: Bar[], full: (c: string) => string, half: (a: string, b: string) => string) => prog.map(b => (typeof b === 'string' ? full(b) : half(b[0], b[1])));
const pads = (prog: Bar[]) => each(prog, c => `o4 {${V[c]}}1`, (a, b) => `o4 {${V[a]}}2 {${V[b]}}2`);
/** Synth-brass stabs: the one, the and of two, and a push into the next chord. */
const hits = (prog: Bar[]) => each(prog, c => `o4 !{${V[c]}}8 r8 r8 {${V[c]}}8 r4 r8 {${V[c]}}8`, (a, b) => `o4 !{${V[a]}}8 r8 r8 {${V[a]}}8 !{${V[b]}}8 r8 r8 {${V[b]}}8`);
const root = (c: string) => R[c][0];

// ---- The tunes ----

/** Meathead 1's riff (the intro's guitars, the break's). */
const RIFF = ['o4 e8 e8 r8 e8 g4 a4', 'o4 e8 e8 r8 e8 c4 d4'];
/** The riff on the power chords under A, its two-beat pickups following the new chords. */
const RIFF_A = [
  'o2 e8 e8 r8 e8 g4 a4',
  'o2 c8 c8 r8 c8 d8 d8 r8 d8',
  'o2 e8 e8 r8 e8 g4 a4',
  'o2 a8 a8 r8 a8 b8 b8 r8 b8',
  'o2 c8 c8 r8 c8 e4 g4',
  'o2 a8 a8 r8 a8 g4 e4',
  'o2 d8 d8 r8 d8 f+4 a4',
  'o2 e8 e8 r8 e8 d8 d8 r8 d8',
];
const RIFF_A2 = [...RIFF_A.slice(0, 7), 'o2 e8 e8 r8 e8 b8 b8 r8 b8'];
/** Meathead 1's tune (A): up the E minor chord and down, scooped, a D-sharp run up into the high E, a pickup out. */
const HOOK = [
  'o5 e4. g8 !b4 a8 g8',
  'o5 a4 g8 e8 _b-1 d4 r4',
  'o5 e4. g8 !b4 >d8 <b8',
  'o5 a2 a8 b8 >c8 d+8',
  'o6 _b-1 e4. d8 <b4 a8 g8',
  'o5 a4 b8 g8 e4 r4',
  'o5 d4. e8 g4 a8 b8',
  'o5 e2 r8 d8 e8 f+8',
];
/** The tune the second time (A'): it falls off its last E into the break. */
const HOOK2 = [...HOOK.slice(0, 7), 'o5 _f-4/2 e2 r2'];
/** The lead guitar answering in the tune's gaps (A). */
const ANSWERS = ['r1', 'o4 r2 a8 b8 >d8 f+8', 'r1', 'r1', 'r1', 'o4 r2 e8 g8 a8 b8', 'r1', 'o4 r2 b8 >d8 e8 f+8'];
/** The middle (B): the old tune's head (up the chord a dotted quarter) in G, and on up. */
const BMEL = [
  'o5 g4. b8 >d4 c8 <b8',
  'o5 a4 f+8 d8 a4. r8',
  'o5 g4. b8 >e4 d8 c8',
  'o4 b4 g8 e8 >c4. r8',
  'o5 c4. e8 a4 g8 e8',
  'o5 f+4 d8 <a8 >d4 e8 f+8',
  'o5 g4 b4 a4 g4',
  'o5 f+2 d+4 <b4',
];
/** The break: the old riff, then down the B7 home. */
const BREAK = [...RIFF, 'o4 e8 e8 r8 e8 g8 a8 b8 >d8', 'o5 d+4 <b4 f+4 d+4'];

// ---- The kit ----
const INTRO_KIT = ['_v110 {kx}8 k8 r8 k8 {ks}4 {ks}4', '{kx}8 k8 r8 k8 {ks}4 {ks}4', '{kx}4 r4 {kx}4 r4', '_v50 s16 s16 s16 s16 _v70 s16 s16 s16 s16 _v90 s16 s16 s16 s16 _v115 s16 s16 (tom1)16 (tom4)16'];
const LITE = '{kh}8 h8 h8 h8 {mh}8 h8 {kh}8 h8';

export const TITLE: Song = {
  title: 'Welcome to Happy Land',
  bpm: 150,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.6,
  delay: { beats: 0.75, feedback: 0.25, tone: 2800 },
  parts: {
    lead: { inst: 'squarelead', pan: 0, rev: 0.18, dly: 0.12, mml: join(rest(4), ['_v110'], HOOK, ['_v100'], harm(BMEL, GM, 2), ['_v112'], HOOK2, ['_v108'], up(BREAK)) },
    harmony: { inst: 'squarelead', pan: 0.35, rev: 0.18, dly: 0.1, vol: 0.5, not: ['lounge', 'cutscene'], mml: join(rest(4), rest(4), ['_v95'], harm(HOOK.slice(4), EM, -2), rest(8), harm(HOOK2, EM, -2), rest(4)) },
    guitar: {
      inst: 'distlead', pan: -0.3, rev: 0.2, dly: 0.12, vol: 0.62, not: ['lounge', 'cutscene'],
      mml: join(['_v105'], RIFF, rest(2), ['_v95'], ANSWERS, ['_v110'], BMEL, rest(8), ['_v105'], BREAK),
    },
    brass: { inst: 'synthbrass', pan: 0.2, rev: 0.22, vol: 0.5, not: ['lounge'], mml: join(['r1', 'r1', 'o4 _v110 !{e g >c}4 r4 !{f+ a >d}4 r4', '_v90 o4 {d+ f+ a b}1'], ['_v95'], hits(A), ['_v80'], pads(B), ['_v105'], hits(A2), ['_v100'], hits(BR)) },
    power: {
      inst: 'powerchord', pan: -0.4, rev: 0.08, vol: 0.48, not: ['lounge', 'cutscene'],
      mml: join(['_v110'], down(down(RIFF)), ['o2 !c4 r4 !d4 r4', 'o2 b8 b8 b8 b8 b8 b8 b8 b8'], RIFF_A, riffOf(B, root, 'x x . x x . x x'), RIFF_A2, down(down(RIFF)), ['o2 e8 e8 r8 e8 g8 a8 b8 o3 d8', 'o2 b8 b8 b8 b8 b8 b8 b8 b8']),
    },
    bass: { inst: 'bass', pan: 0, rev: 0.04, vol: 0.85, mml: join(['_v105'], down(down(down(RIFF))), ['o2 !c4 r4 !d4 r4', 'o1 b8 b8 o2 b8 o1 b8 b8 b8 o2 b8 o1 b8'], ['_v100'], pump(A, root), pump(B, root), pump(A2, root), pump(BR, root)) },
    arp: { inst: 'clav', pan: 0.4, rev: 0.15, dly: 0.12, vol: 0.32, not: ['lounge', 'cutscene'], mml: join(rest(3), ['_v85'], arp16(['B7'], c => VN[c], 0), rest(8), ['_v90'], arp16(B, c => VN[c], 0), arp16(A2, c => VN[c], 0), rest(4)) },
    strings: { inst: 'strings', pan: 0, rev: 0.32, vol: 0.38, mml: join(rest(4), ['_v60'], pads(A), ['_v70'], pads(B), ['_v85'], pads(A2), ['_v75'], pads(BR)) },
    choir: { inst: 'choir', pan: 0, rev: 0.4, vol: 0.5, not: ['lounge', 'calliope', 'cutscene'], mml: join(rest(20), ['_v90'], pads(A2), rest(4)) },
    drums: {
      inst: 'kick', drums: true, rev: 0.1, vol: 0.8, not: ['lounge', 'cutscene'],
      mml: join(INTRO_KIT, ['_v100'], sec(BEAT, 8, FILL2), sec(MM2, 8, FILL), ['_v108'], sec(BEAT16, 8, FILL2), ['_v100', X(HALF), HALF, HALF, FILL_BIG]),
    },
    kitLite: { inst: 'kick', drums: true, rev: 0.12, vol: 0.6, only: ['lounge'], mml: join(['_v85'], rep(LITE, 32)) },
    timpani: {
      inst: 'timpani', pan: -0.15, rev: 0.3, vol: 0.75, not: ['lounge', 'calliope'],
      mml: join(['r1', 'r1', 'o2 _v110 c4 r4 d4 r4', 'o2 _v40 [b32]8 _v60 [b32]8 _v85 [b32]8 _v115 [b32]8'], ['o2 _v110 e4 r2.'], rest(7), ['o2 g4 r2.'], rest(7), ['o2 e4 r2.'], rest(7), ['o2 e4 r2.', 'r1', 'r1', 'o2 _v50 [b32]8 _v70 [b32]8 _v95 [b32]8 _v120 [b32]8']),
    },
    // (a major chord on the note: C, D, B for the B7, G)
    hit: { inst: 'orchstab', pan: 0, rev: 0.3, vol: 0.7, not: ['lounge', 'calliope', 'cutscene'], mml: join(['r1', 'r1', 'o4 c4 r4 d4 r4', 'o4 b4 r2.'], ['o4 e4 r2.'], rest(7), ['o4 g4 r2.'], rest(7), ['o4 e4 r2.'], rest(6), ['o4 r2 b4 r4'], rest(4)) },
  },
  arrangements: {
    main: {},
    lounge: {
      inst: { lead: 'epiano', strings: 'slowstrings', brass: 'pwm' },
      mute: ['choir', 'timpani', 'hit', 'arp'],
      vol: { strings: 0.6, lead: 0.95, brass: 0.6, bass: 0.8 },
      rev: { lead: 0.3 },
      level: 0.85,
    },
    calliope: {
      inst: { guitar: 'squarelead', brass: 'synthbrass', bass: 'synthbass', arp: 'squarelead', strings: 'pwm' },
      mute: ['power'],
      vol: { guitar: 0.55, bass: 0.7, arp: 0.6, strings: 0.8 },
      level: 0.9,
    },
    cutscene: {
      solo: ['lead', 'strings', 'bass', 'brass'],
      inst: { lead: 'violin', strings: 'slowstrings', brass: 'pwm' },
      vol: { bass: 0.55, strings: 0.75, brass: 0.45 },
      rev: { lead: 0.4 },
      level: 0.75,
    },
  },
};
