// "WELCOME TO HAPPY LAND": Meathead 2's theme (the title and menus; cues.ts's last fallback at the hub, the staff room
// and the way in). The quality bar for the composers who follow: a big, catchy, slightly
// sleazy theme-park anthem, the late 90s (a Conker / Banjo-Tooie big band with a strip-club sax out front).
//
// B-flat major, 112, an eighth-note shuffle. 32 bars: a 4-bar fanfare (once: Gb, Ab, up to the Bb, a timpani roll,
// the orchestra hits), then the 28-bar loop:
//   A  (8)  the hook on alto sax: up the six chord to the B-flat, a cheeky B-natural over the G7, the answer scooping
//           up to the F; I - VI7 - ii - V, a stride of slap bass, the organ's offbeats, guitar chops on 2 and 4.
//   B  (8)  the brass section takes it (E-flat, the diminished passing chord, the walk down through G7), horns
//           answering, the strings an octave up, stride piano, congas.
//   A' (8)  the whole park: the hook on sax and trumpet together, the violins and the glockenspiel an octave up,
//           the choir.
//   BR (4)  the sleaze: a half-time break to G-flat, the sax low and bluesy (falling off its notes), the organ
//           swelling, F7 flat-nine and a tom fill back to the top.
//
// ARRANGEMENTS (each crossfades into the next without losing its place):
//   main      the full band
//   lounge    the after-hours version: the hook on a harmon-muted trumpet, electric piano, upright bass, brushes
//   calliope  the carousel's: a steam calliope, an accordion's oom-pah, a tuba, glockenspiel, marimba
//   cutscene  under a scene: celesta, the strings slow and soft, piano, the upright

import type { Song } from '../engine';

type Bar = string | [string, string];
const join = (...parts: string[][]) => parts.flat().join(' | ');
const rest = (n: number) => Array.from({ length: n }, () => 'r1');
/** Everything an octave up (each bar's o-number raised; its > and < as they are). */
const up = (bars: string[]) => bars.map(b => b.replace(/o(\d)/g, (_, n) => `o${Number(n) + 1}`));

// The chords: voicings (o4, upward), and the bass's root and fifth
const V: Record<string, string> = {
  Bb6: 'd f g b-', G7: 'd f g b', Cm7: 'e- g b- >c', F7: 'e- f a >c', Ebmaj7: 'e- g b- >d', Edim7: 'e g b- >d-', 'Bb/D': 'd f b- >d',
  Dm7: 'd f a >c', Gbmaj7: 'd- f g- b-', Abmaj7: 'e- g a- >c', Bb: 'd f b- >d', F7sus: 'e- f b- >c', F7b9: 'e- g- a >c',
};
const R: Record<string, [string, string]> = {
  Bb6: ['b-', 'f'], G7: ['g', 'd'], Cm7: ['c', 'g'], F7: ['f', 'c'], Ebmaj7: ['e-', 'b-'], Edim7: ['e', 'b-'], 'Bb/D': ['d', 'b-'],
  Dm7: ['d', 'a'], Gbmaj7: ['g-', 'd-'], Abmaj7: ['a-', 'e-'], Bb: ['b-', 'f'], F7sus: ['f', 'c'], F7b9: ['f', 'c'],
};
const INTRO: Bar[] = ['Gbmaj7', 'Abmaj7', 'Bb', 'F7'];
const A: Bar[] = ['Bb6', 'G7', 'Cm7', 'F7', 'Bb6', 'G7', ['Cm7', 'F7'], 'Bb6'];
const B: Bar[] = ['Ebmaj7', 'Edim7', 'Bb/D', 'G7', 'Cm7', 'F7', ['Dm7', 'G7'], ['Cm7', 'F7']];
const BR: Bar[] = ['Gbmaj7', 'Gbmaj7', 'F7sus', 'F7b9'];

/** A bar per chord (or two chords a bar, half each). */
const each = (prog: Bar[], full: (c: string) => string, half: (a: string, b: string) => string) => prog.map(b => (typeof b === 'string' ? full(b) : half(b[0], b[1])));
const pads = (prog: Bar[]) => each(prog, c => `o4 {${V[c]}}1`, (a, b) => `o4 {${V[a]}}2 {${V[b]}}2`);
/** The organ's shuffle: the offbeats. */
const offbeats = (prog: Bar[]) => each(prog, c => `o4 r8 {${V[c]}}8 r8 {${V[c]}}8 r8 {${V[c]}}8 r8 {${V[c]}}8`, (a, b) => `o4 r8 {${V[a]}}8 r8 {${V[a]}}8 r8 {${V[b]}}8 r8 {${V[b]}}8`);
/** Guitar chops on 2 and 4. */
const chops = (prog: Bar[]) => each(prog, c => `o4 r4 {${V[c]}}8 r8 r4 {${V[c]}}8 r8`, (a, b) => `o4 r4 {${V[a]}}8 r8 r4 {${V[b]}}8 r8`);
/** The slap bass: root, the octave popped, back down to the fifth. */
const slap = (prog: Bar[]) => each(prog,
  c => { const [r, f] = R[c]; return `o2 ${r}8 r8 >${r}8< ${r}8 r8 ${r}8 >${r}8< ${f}8`; },
  (a, b) => { const [r1] = R[a], [r2, f2] = R[b]; return `o2 ${r1}8 r8 >${r1}8< ${r1}8 ${r2}8 r8 >${r2}8< ${f2}8`; });
/** Stride piano: the bass note on 1 and 3, the chord on 2 and 4. */
const stride = (prog: Bar[]) => each(prog,
  c => { const [r, f] = R[c]; return `o2 ${r}4 o4 {${V[c]}}4 o2 ${f}4 o4 {${V[c]}}4`; },
  (a, b) => `o2 ${R[a][0]}4 o4 {${V[a]}}4 o2 ${R[b][0]}4 o4 {${V[b]}}4`);

// ---- The tunes ----

/** The hook (A): up the six chord to the B-flat, the B-natural over the G7, the answer scooping up. */
const HOOK = [
  'o5 r8 d8 f8 g8 _b-1 !b-4 g8 f8',
  'o5 f4 d8 <b8 r8 b8 >d8 f8',
  'o5 e-4 c8 <g8 r8 b-8 >c8 e-8',
  'o5 _b-2 f2 e-8 d8 c8 <a8',
  'o5 r8 d8 f8 g8 _b-1 !b-4 g8 f8',
  'o5 f4 d8 <b8 r8 >d8 f8 !a-8',
  'o5 g4 e-8 c8 f4 e-8 c8',
  'o5 d2 r8 <f8 g8 a8',
];
/** The hook the second time (A'): it doesn't lead on, it falls off its last note into the break. */
const HOOK2 = [...HOOK.slice(0, 7), 'o5 _f-4/2 d2 r2'];
/** B: the section's line (an octave down from where the violins have it). */
const BMEL = [
  'o4 b-4. g8 _b-1 b-4 >c8 d8',
  'o5 d-4. <b-8 g4 e4',
  'o4 f4. d8 b-2',
  'o4 a-8 g8 f8 d8 <b4 r4',
  'o4 g4. e-8 c4 e-8 g8',
  'o4 a4. f8 c4 r8 c8',
  'o4 d8 f8 a8 >c8 <b4 g4',
  'o4 e-4 d4 c4 <a4',
];
/** The break: the sax down low, bluesy, falling off. */
const BREAK = [
  'o4 b-8 >d-8 f8 g-8 _b-2 f2',
  'o5 e-8 d-8 <b-8 a-8 _f-2 b-2',
  'o4 f8 a-8 b-8 >c8 e-4 c8 <b-8',
  'o4 a4 >c4 e-4 g-4',
];
/** The horns' answers under B. */
const HORNS_B = ['o4 g2 b-2', 'o4 b-2 >d-2', 'o4 b-1', 'o4 b2 a-2', 'o4 g2 b-2', 'o4 a1', 'o4 a2 b2', 'o5 c2 <a2'];

// ---- The kit ----
const GROOVE = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8';
const IN = GROOVE.replace('{kh}', '{kx}');
const FILL = '{kh}8 h8 {sh}8 (tom1)8 (tom1)8 (tom2)8 (tom3)8 (tom4)8';
const RIDE = '{ki}8 i8 {si}8 i8 {ki}8 {ki}8 {si}8 i8';
const RIDE_IN = RIDE.replace('{ki}', '{kx}');
const FILL_B = 's8 s8 (tom1)8 (tom1)8 (tom2)8 (tom2)8 (tom4)8 (tom4)8';
const FILL_BR = '{kh}8 h8 {sh}8 h8 s16 s16 s16 s16 {s(tom4)}8 {kx}8';
const HALF = '{kh}8 h8 h8 h8 {sh}8 h8 o8 h8';
const HALF_IN = HALF.replace('{kh}', '{kx}');
const FILL_TOP = 's16 s16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16 {ks}8 {ks}8';
const SHAKE = 'z8 ?z8 {zj}8 ?z8 z8 ?z8 {zj}8 ?z8';
const CONGA = 'c8 ?c8 d8 c8 ?c8 c8 d8 ?d8';
const BRUSH = '{ki}4 {ish}8 i8 i4 {ish}8 i8';
const OOMPAH = 'k4 {s(trimute)}4 k4 s4';

const rep = (bar: string, n: number) => Array.from({ length: n }, () => bar);

export const TITLE: Song = {
  title: 'Welcome to Happy Land',
  bpm: 112,
  swing: 0.45,
  grid: 8,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.9,
  delay: { beats: 0.75, feedback: 0.28, tone: 2800 },
  parts: {
    hook: { inst: 'sax', pan: 0, rev: 0.2, dly: 0.1, mml: join(rest(4), HOOK, rest(8), HOOK2, BREAK) },
    trumpet: {
      inst: 'trumpet', pan: 0.18, rev: 0.25, dly: 0.08, vol: 0.85,
      mml: join(['o5 d-4. g-8 b-2', 'o5 e-4. a-8 >c2', '_e60 _e127/1 o6 d1', 'o5 c4 r4 r2'], rest(8), rest(8), HOOK2, rest(4)),
    },
    brass: {
      inst: 'brass', pan: -0.1, rev: 0.25,
      mml: join(
        ['o4 {d- g- b-}4. {d- g- b-}8 {d- g- b-}2', 'o4 {e- a- >c}4. {e- a- >c}8 {e- a- >c}2', '_e50 _e127/1 o4 {d f b- >d}1', 'o4 r4 {e- a >c}8 r8 {e- a >c}8 r8 r4'],
        ['_e127 r1', 'o4 r2 r8 {d f b}8 r8 {d f b}8', 'r1', 'o4 r2 r8 {e- a >c}8 r8 {e- a >c}8', 'r1', 'o4 r2 r8 {d f b}8 r8 {f a- >d}8', 'r1', 'o4 {d f b-}4 r4 _f-5/4 {d f b-}2'],
        BMEL,
        ['o4 r2 r8 {d f b-}8 r8 !{d f b-}8', 'o4 r2 r8 {d f b}8 r8 !{d f b}8', 'o4 r2 r8 {e- g >c}8 r8 !{e- g >c}8', 'o4 r2 r8 {e- a >c}8 r8 !{e- a >c}8', 'o4 r2 r8 {d f b-}8 r8 !{d f b-}8', 'o4 r2 r8 {d f b}8 r8 !{f a- >d}8', 'o4 {e- g >c}4 r4 {e- a >c}4 r4', 'o4 _f-5/4 {d f b-}2 r2'],
        ['_e30 _e110/1^1 o4 {d- f b-}1', 'o4 {d- f b-}1', '_e127 o4 r2 {e- f b-}2', 'o4 {e- g- a >c}4 r4 !{e- g- a >c}4 r4'],
      ),
    },
    horns: { inst: 'horn', pan: -0.35, rev: 0.3, vol: 0.8, mml: join(['o4 d-1', 'o4 e-1', 'o4 f1', 'o4 f4 r2.'], rest(8), HORNS_B, ['o4 f1', 'o4 f1', 'o4 g1', 'o4 a1', 'o4 f1', 'o4 f1', 'o4 g2 a2', 'o4 f1'], ['o4 d-1', 'o4 d-1', 'o4 c1', 'o4 c1']) },
    // (a bar of just a _v or a q takes no time: the bar lines are only for reading)
    strings: { inst: 'strings', pan: 0, rev: 0.35, mml: join(['_v90'], pads(INTRO), ['_v70'], pads(A), ['_v90'], pads(B), ['_v105'], pads(A), ['_v80'], pads(BR)) },
    violins: { inst: 'strings', pan: 0.25, rev: 0.4, vol: 0.7, mml: join(rest(12), ['_v75'], up(BMEL), ['_v90'], up(HOOK2), rest(4)) },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.75, mml: join(rest(20), pads(A), pads(BR)) },
    organ: { inst: 'organ', pan: -0.4, rev: 0.15, vol: 0.8, mml: join(['q4'], rest(4), offbeats(A), offbeats(B), offbeats(A), ['q8'], pads(BR)) },
    gtr: { inst: 'cleangtr', pan: 0.45, rev: 0.15, cho: 0.35, vol: 0.7, mml: join(['q3'], rest(4), chops(A), chops(B), chops(A), rest(4)) },
    bass: { inst: 'slapbass', pan: 0, rev: 0.05, mml: join(['o2 g-1', 'o2 a-1', 'o2 b-1', 'o2 f4 r4 r8 f8 g8 a8'], slap(A), slap(B), slap(A), slap(BR)) },
    glock: { inst: 'glock', pan: 0.35, rev: 0.3, dly: 0.18, mml: join(rest(4), ['_v55'], up(HOOK), rest(8), ['_v85'], up(HOOK2), rest(4)) },
    piano: { inst: 'piano', pan: -0.2, rev: 0.22, vol: 0.75, mml: join(rest(12), stride(B), rest(12)) },
    drums: {
      inst: 'kick', drums: true, rev: 0.12, not: ['lounge', 'calliope', 'cutscene'],
      mml: join(
        ['{kx}2 r2', '{kx}2 r2', '_v40 s16 s16 s16 s16 _v60 s16 s16 s16 s16 _v85 s16 s16 s16 s16 _v110 s16 s16 s16 s16', '_v120 {kx}8 r8 r4 r8 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom4)16'],
        ['_v100 ' + IN], rep(GROOVE, 6), [FILL],
        [RIDE_IN], rep(RIDE, 6), [FILL_B],
        [IN], rep(GROOVE, 6), [FILL_BR],
        [HALF_IN, HALF, HALF, FILL_TOP],
      ),
    },
    perc: { inst: 'tamb', drums: true, pan: 0.3, rev: 0.15, vol: 0.8, not: ['lounge', 'calliope', 'cutscene'], mml: join(rest(4), rep(SHAKE, 8), rep(CONGA, 8), rep(SHAKE, 8), rest(4)) },
    timpani: {
      inst: 'timpani', pan: -0.15, rev: 0.3,
      mml: join(['o2 g-4 r2.', 'o2 a-4 r2.', 'o2 _v40 [b-32]8 _v60 [b-32]8 _v85 [b-32]8 _v115 [b-32]8', 'o2 _v120 f8 r8 r4 r2'], rest(8), ['o2 e-4 r2.'], rest(7), ['o2 b-4 r2.'], rest(7), ['o2 g-4 r2.', 'r1', 'r1', 'o2 _v50 [f32]8 _v70 [f32]8 _v95 [f32]8 _v120 [f32]8']),
    },
    hit: { inst: 'orchhit', pan: 0, rev: 0.3, vol: 0.8, mml: join(['o4 g-4 r2.', 'o4 a-4 r2.', 'r1', 'o4 r4 f8 r8 f8 r8 r4'], rest(8), ['o4 e-4 r2.'], rest(7), ['o4 b-4 r2.'], rest(7), ['o4 g-4 r2.'], rest(3)) },
    brushes: { inst: 'kicksoft', drums: true, kit: 'brush', rev: 0.2, only: ['lounge'], mml: join(rest(4), rep(BRUSH, 28)) },
    oompah: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.25, vol: 0.7, only: ['calliope'], mml: join(rest(4), rep(OOMPAH, 28)) },
  },
  arrangements: {
    main: {},
    lounge: {
      inst: { hook: 'mutetrumpet', organ: 'epiano', bass: 'upright', strings: 'slowstrings' },
      mute: ['trumpet', 'brass', 'horns', 'choir', 'violins', 'glock', 'timpani', 'hit'],
      vol: { strings: 0.55, gtr: 0.6, organ: 1.2 },
      rev: { hook: 0.35, organ: 0.3 },
      level: 0.85,
    },
    calliope: {
      inst: { hook: 'calliope', organ: 'accordion', bass: 'tuba', piano: 'marimba' },
      mute: ['trumpet', 'brass', 'horns', 'choir', 'violins', 'strings', 'gtr', 'timpani', 'hit'],
      vol: { glock: 0.8, organ: 0.8 },
      level: 0.9,
    },
    cutscene: {
      solo: ['hook', 'strings', 'piano', 'bass'],
      inst: { hook: 'celesta', strings: 'slowstrings', bass: 'upright' },
      vol: { bass: 0.55, strings: 0.7, piano: 0.8 },
      rev: { hook: 0.45, piano: 0.4 },
      level: 0.75,
    },
  },
};
