// "WELCOME TO HAPPY LAND": Meathead 2's theme (the title screen; cues.ts's last fallback at the hub, the staff room and
// the way in). The sequel's take on Meathead 1's title (src/m1/game/platform/music/songs.ts `title`: E minor at 150, the
// power-chord riff E E - E G A / E E - E C D, the brass tune up the E minor chord to the B and back down, eight bars):
// the same key, tempo, riff and tune, so it's known from the first bar, but gone to the theme park: a steam calliope
// starts it up, the tune's re-harmonized (a C - D lift, the A minor seventh and the B7 with its D-sharp leading back
// home, a C major seventh under the high E), there's a whole new middle on the midway in the relative major, and the
// orchestra the PS1 can afford. The quality bar for the composers who follow.
//
// E minor, 150, straight eighths. 32 bars: a 4-bar intro (once: the calliope plays Meathead 1's riff alone over an
// oom-pah, the band crashes in on C and D, a snare roll up the B7), then the 28-bar loop:
//   A  (8)  Meathead 1's tune on the trumpet (scooped, a D-sharp run up into the high E, gaps the calliope answers in),
//           the riff on power chords, the bass driving eighths, the strings and horns holding the new chords, a rock kit.
//   B  (8)  the midway: G major, a new tune built off the old one's head (up the chord a dotted quarter, then on up) on
//           the calliope with the glockenspiel an octave over it, a tuba and accordion oom-pah, the ride cymbal, a
//           tambourine; down to the B7 to go home.
//   A' (8)  the whole park: the tune on the trumpet, the brass an octave under it, the glockenspiel an octave over, the
//           choir, the calliope running arpeggios, the kit driving eighths; it falls off its last E into the break.
//   BR (4)  the sideshow: the calliope plays the old riff alone over the oom-pah, the choir holding, a fill to the top.
//
// ARRANGEMENTS (each crossfades into the next without losing its place):
//   main      the full band
//   lounge    after hours: the tune on a harmon-muted trumpet, vibes, upright bass, slow strings, brushes
//   calliope  the carousel's: the tune on the calliope, marimba, glockenspiel, the oom-pah all the way through
//   cutscene  under a scene: celesta, slow strings, the upright

import type { Song } from '../engine';

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
const R: Record<string, [string, string]> = {
  Em: ['e', 'b'], C: ['c', 'g'], D: ['d', 'a'], B7: ['b', 'f+'], Am7: ['a', 'e'], Cmaj7: ['c', 'g'], G: ['g', 'd'], 'D/F#': ['f+', 'd'],
};
const INTRO: Bar[] = ['Em', 'Em', ['C', 'D'], 'B7'];
const A: Bar[] = ['Em', ['C', 'D'], 'Em', ['Am7', 'B7'], 'Cmaj7', 'Am7', 'D', ['Em', 'D']];
const A2: Bar[] = [...A.slice(0, 7), ['Em', 'B7']];
const B: Bar[] = ['G', 'D/F#', 'Em', 'C', 'Am7', 'D', ['G', 'Em'], 'B7'];
const BR: Bar[] = ['Em', ['C', 'D'], 'Em', 'B7'];

/** A bar per chord (or two chords a bar, half each). */
const each = (prog: Bar[], full: (c: string) => string, half: (a: string, b: string) => string) => prog.map(b => (typeof b === 'string' ? full(b) : half(b[0], b[1])));
const pads = (prog: Bar[]) => each(prog, c => `o4 {${V[c]}}1`, (a, b) => `o4 {${V[a]}}2 {${V[b]}}2`);
/** The bass driving eighths: the root, the octave popped, the fifth to finish (Meathead 1's bass, filled in). */
const drive = (prog: Bar[]) => each(prog,
  c => { const [r, f] = R[c]; return `o2 ${r}8 ${r}8 >${r}8< ${r}8 ${r}8 ${r}8 ${f}8 ${r}8`; },
  (a, b) => { const [r1] = R[a], [r2] = R[b]; return `o2 ${r1}8 ${r1}8 >${r1}8< ${r1}8 ${r2}8 ${r2}8 >${r2}8< ${r2}8`; });
/** The oom (the tuba: the root on one, the fifth on three) and the pah (the accordion: the chord on two and four). */
const oom = (prog: Bar[]) => each(prog, c => `o2 ${R[c][0]}4 r4 ${R[c][1]}4 r4`, (a, b) => `o2 ${R[a][0]}4 r4 ${R[b][0]}4 r4`);
const pah = (prog: Bar[]) => each(prog, c => `o4 r4 {${V[c]}}4 r4 {${V[c]}}4`, (a, b) => `o4 r4 {${V[a]}}4 r4 {${V[b]}}4`);
/** The horns: the root and fifth, held. */
const horns = (prog: Bar[]) => each(prog, c => `o3 {${R[c][0]} ${R[c][1]}}1`, (a, b) => `o3 {${R[a][0]} ${R[a][1]}}2 {${R[b][0]} ${R[b][1]}}2`);
/** The calliope running up and down each chord in eighths (A'). */
const tones = (c: string) => V[c].replace(/>/g, '').split(' ');
const arps = (prog: Bar[]) => each(prog,
  c => { const [x, y, z] = tones(c); return `o5 ${x}8 ${y}8 ${z}8 ${y}8 ${x}8 ${y}8 ${z}8 ${y}8`; },
  (a, b) => { const [x, y, z] = tones(a), [p, q, s] = tones(b); return `o5 ${x}8 ${y}8 ${z}8 ${y}8 ${p}8 ${q}8 ${s}8 ${q}8`; });
/** A short brass hit on the downbeat of every other bar. */
const hits = (prog: Bar[]) => prog.map((b, i) => (i % 2 ? 'r1' : `o4 {${V[typeof b === 'string' ? b : b[0]]}}8 r8 r2.`));

// ---- The tunes ----

/** Meathead 1's riff (the intro's calliope, the break's). */
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
/** Meathead 1's tune (A): the same notes up the E minor chord and down, scooped, shortened where the calliope answers,
 *  a D-sharp run up into the high E, and a pickup into the midway. */
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
/** The tune the second time (A'): no pickup, it falls off its last E into the break. */
const HOOK2 = [...HOOK.slice(0, 7), 'o5 _f-4/2 e2 r2'];
/** The calliope answering in the tune's gaps (A). */
const ANSWERS = ['r1', 'o5 r2 a8 f+8 d8 f+8', 'r1', 'r1', 'r1', 'o5 r2 c8 <a8 e8 a8', 'r1', 'r1'];
/** The midway (B): the old tune's head (up the chord a dotted quarter) in G, and on up. */
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
/** The break: the calliope plays the old riff, then down the B7 home. */
const BREAK = [...RIFF, 'o4 e8 e8 r8 e8 g8 a8 b8 >d8', 'o5 d+4 <b4 f+4 d+4'];

// ---- The kit ----
const ROCK = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8';
const ROCK_IN = ROCK.replace('{kh}', '{kx}');
const ROCK_FILL = '{kh}8 h8 {sh}8 h8 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 {kx}8';
const DRIVE = '{kh}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {sh}8';
const DRIVE_IN = DRIVE.replace('{kh}', '{kx}');
const RIDE = '{ki}8 i8 {si}8 i8 {ki}8 i8 {si}8 i8';
const RIDE_IN = RIDE.replace('{ki}', '{kx}');
const FILL_B = 's8 s8 (tom1)8 (tom1)8 (tom2)8 (tom2)8 (tom4)8 (tom4)8';
const HALF = '{kh}8 h8 h8 h8 {sh}8 h8 h8 h8';
const HALF_IN = HALF.replace('{kh}', '{kx}');
const FILL_TOP = 's16 s16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16 {ks}8 {ks}8';
const TAMB = 'j8 ?j8 j8 ?j8 j8 ?j8 j8 ?j8';
const BRUSH = '{ki}4 {ish}8 i8 i4 {ish}8 i8';
const OOMPAH = 'k4 {s(trimute)}4 k4 s4';

export const TITLE: Song = {
  title: 'Welcome to Happy Land',
  bpm: 150,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.85,
  delay: { beats: 0.75, feedback: 0.25, tone: 2800 },
  parts: {
    lead: { inst: 'trumpet', pan: 0.1, rev: 0.22, dly: 0.1, mml: join(rest(4), HOOK, rest(8), HOOK2, rest(4)) },
    brass: {
      inst: 'brass', pan: -0.15, rev: 0.25, vol: 0.85,
      mml: join(
        ['r1', 'r1', 'o4 {e g >c}4 r4 {f+ a >d}4 r4', '_e50 _e127/1 o4 {d+ f+ a b}1'],
        hits(A),
        ['_e70'], pads(B), ['_e127'],
        down(HOOK2),
        ['o4 {e g b}4 r2.', 'r1', 'r1', 'o4 r2 {d+ f+ a b}4 r4'],
      ),
    },
    horns: { inst: 'horn', pan: -0.35, rev: 0.3, vol: 0.7, mml: join(rest(2), horns(INTRO.slice(2)), horns(A), horns(B), horns(A2), rest(4)) },
    calliope: { inst: 'calliope', pan: 0.3, rev: 0.25, dly: 0.12, mml: join(RIFF, rest(2), ANSWERS, BMEL, ['_v80'], arps(A2), ['_v100'], BREAK) },
    glock: { inst: 'glock', pan: 0.4, rev: 0.3, dly: 0.15, mml: join(rest(12), ['_v70'], up(BMEL), ['_v85'], up(HOOK2), rest(4)) },
    gtr: { inst: 'powerchord', pan: -0.3, rev: 0.1, vol: 0.8, mml: join(rest(2), ['o2 c4 r4 d4 r4', 'o2 b2 b2'], RIFF_A, each(B, c => `o2 ${R[c][0]}2 ${R[c][0]}2`, (a, b) => `o2 ${R[a][0]}2 ${R[b][0]}2`), RIFF_A2, rest(4)) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, mml: join(rest(2), ['o2 c4 r4 d4 r4', 'o2 b4 r4 b4 r4'], drive(A), drive(B), drive(A2), rest(4)) },
    tuba: { inst: 'tuba', pan: 0, rev: 0.15, not: ['lounge', 'calliope', 'cutscene'], mml: join(oom(INTRO.slice(0, 2)), rest(2), rest(8), oom(B), rest(8), oom(BR)) },
    accordion: { inst: 'accordion', pan: 0.25, rev: 0.2, vol: 0.6, not: ['lounge', 'calliope', 'cutscene'], mml: join(['q4'], pah(INTRO.slice(0, 2)), rest(2), rest(8), pah(B), rest(8), pah(BR)) },
    // (a bar of just a _v or a q takes no time: the bar lines are only for reading)
    strings: { inst: 'strings', pan: 0, rev: 0.35, mml: join(rest(2), ['_v85'], pads(INTRO.slice(2)), ['_v70'], pads(A), ['_v80'], pads(B), ['_v100'], pads(A2), ['_v80'], pads(BR)) },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.7, mml: join(rest(20), pads(A2), pads(BR)) },
    drums: {
      inst: 'kick', drums: true, rev: 0.12, not: ['lounge', 'calliope', 'cutscene'],
      mml: join(
        ['r1', 'r1', '_v115 {kx}4 r4 {kx}4 r4', '_v40 s16 s16 s16 s16 _v60 s16 s16 s16 s16 _v85 s16 s16 s16 s16 _v110 s16 s16 s16 s16'],
        ['_v100 ' + ROCK_IN], rep(ROCK, 6), [ROCK_FILL],
        [RIDE_IN], rep(RIDE, 6), [FILL_B],
        [DRIVE_IN], rep(DRIVE, 6), [ROCK_FILL],
        [HALF_IN, HALF, HALF, FILL_TOP],
      ),
    },
    oompah: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.25, vol: 0.6, not: ['lounge', 'calliope', 'cutscene'], mml: join(rep(OOMPAH, 2), rest(2), rest(8), rep(OOMPAH, 8), rest(8), rep(OOMPAH, 4)) },
    perc: { inst: 'tamb', drums: true, pan: 0.3, rev: 0.15, vol: 0.7, not: ['lounge', 'calliope', 'cutscene'], mml: join(rest(12), rep(TAMB, 16), rest(4)) },
    timpani: {
      inst: 'timpani', pan: -0.15, rev: 0.3,
      mml: join(['r1', 'r1', 'o2 c4 r4 d4 r4', 'o2 _v40 [b32]8 _v60 [b32]8 _v85 [b32]8 _v115 [b32]8'], ['o2 _v110 e4 r2.'], rest(7), ['o2 g4 r2.'], rest(7), ['o2 e4 r2.'], rest(7), ['o2 e4 r2.', 'r1', 'r1', 'o2 _v50 [b32]8 _v70 [b32]8 _v95 [b32]8 _v120 [b32]8']),
    },
    // (a major chord on the note: C, D, B for the B7, G)
    hit: { inst: 'orchstab', pan: 0, rev: 0.3, vol: 0.75, mml: join(['r1', 'r1', 'o4 c4 r4 d4 r4', 'o4 b4 r2.'], rest(8), ['o4 g4 r2.'], rest(7), rest(7), ['o4 r2 b4 r4'], rest(4)) },
    brushes: { inst: 'kicksoft', drums: true, kit: 'brush', rev: 0.2, only: ['lounge'], mml: rep(BRUSH, 32).join(' | ') },
    // (the carousel's: the oom-pah the whole way)
    tubaAll: { inst: 'tuba', pan: 0, rev: 0.15, only: ['calliope'], mml: join(oom(INTRO), oom(A), oom(B), oom(A2), oom(BR)) },
    accAll: { inst: 'accordion', pan: 0.25, rev: 0.2, vol: 0.6, only: ['calliope'], mml: join(['q4'], pah(INTRO), pah(A), pah(B), pah(A2), pah(BR)) },
    oompahAll: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.25, vol: 0.6, only: ['calliope'], mml: rep(OOMPAH, 32).join(' | ') },
  },
  arrangements: {
    main: {},
    lounge: {
      inst: { lead: 'mutetrumpet', calliope: 'vibes', glock: 'vibes', bass: 'upright', strings: 'slowstrings' },
      mute: ['brass', 'horns', 'choir', 'gtr', 'timpani', 'hit'],
      vol: { strings: 0.55, calliope: 0.7, glock: 0.6 },
      rev: { lead: 0.35 },
      level: 0.85,
    },
    calliope: {
      inst: { lead: 'calliope', calliope: 'marimba' },
      mute: ['brass', 'horns', 'strings', 'choir', 'gtr', 'bass', 'timpani', 'hit'],
      vol: { glock: 0.8 },
      level: 0.9,
    },
    cutscene: {
      solo: ['lead', 'strings', 'bass'],
      inst: { lead: 'celesta', strings: 'slowstrings', bass: 'upright' },
      vol: { bass: 0.55, strings: 0.7 },
      rev: { lead: 0.45 },
      level: 0.75,
    },
  },
};
