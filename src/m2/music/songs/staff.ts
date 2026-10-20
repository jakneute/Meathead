// "BREAK ROOM": the staff room behind the STAFF ONLY door (the practice pen: nobody fights back, he can't be hurt, he
// tries his weapons out on whoever wanders in). The Mega Man pass (the user's: "give it more of a high energy mega man
// vibe"): the breakroom muzak's tune turned into a Mega Man X lab groove: a square lead with an FM bell piano
// sparkling an octave over it, slap bass popping octaves, a clavinet chopping sixteenths, synth-brass hits, a rock kit
// on sixteenth hats, and a lead guitar taking the coffee break.
//
// D major, 144, straight. 42 bars: a 2-bar vamp (once), then the 40-bar loop, AABA plus a solo:
//   A   (8)  the tune: up the chord to the major seventh, syncopated; Dmaj7 - Bm7 - Em7 - A7, a F#m7 - B7(b9)
//            secondary, a half cadence on the A7sus.
//   A2  (8)  again (the lead guitar answering in the gaps), home to D.
//   B   (8)  the bridge: up to G, its minor six, F#m7 - B7, Em7 - A7, and the flat six (B-flat maj7) for a key-change
//            feint before the A7 brings it back; the brass hits.
//   A3  (8)  the tune again, the guitar answering.
//   C   (8)  the coffee break: the lead guitar solos over D and G, the kit driving, a fill to the top.
//
// ARRANGEMENTS: main only.

import type { Song } from '../engine';
import { octs, stabs as stabsOf, BEAT16, DRIVE, FILL, FILL2, FILL_BIG, sec } from './mega';

const join = (...parts: string[][]) => parts.flat().join(' | ');
const rest = (n: number) => Array.from({ length: n }, () => 'r1');
const up = (bars: string[]) => bars.map(b => b.replace(/o(\d)/g, (_, n) => `o${Number(n) + 1}`));
/** A chord from notes with their octaves ('4f+', '5c+'), lowest first. */
const ch = (ns: string[], len: string) => {
  let o = Number(ns[0][0]);
  let s = `o${o} {`;
  for (const n of ns) { const no = Number(n[0]); s += '>'.repeat(no - o) + n.slice(1) + ' '; o = no; }
  return `${s.trim()}}${len}`;
};

type Bar = string | [string, string];
// The chords: rootless ninth voicings (around o4), and the bass's root
const V: Record<string, string[]> = {
  Dmaj7: ['4f+', '4a', '5c+', '5e'], Bm7: ['4f+', '4a', '5c+', '5d'], Em7: ['4g', '4b', '5d', '5f+'], A7: ['4g', '4b', '5c+', '5f+'],
  A7sus: ['4g', '4b', '5d', '5e'], 'F#m7': ['4a', '5c+', '5e', '5g+'], B7: ['4a', '5c', '5d+', '5f+'], Gmaj7: ['4f+', '4a', '4b', '5d'],
  Gm6: ['4e', '4g', '4b-', '5d'], Bbmaj7: ['4f', '4a', '5c', '5d'],
};
const R: Record<string, string> = { Dmaj7: 'd', Bm7: 'b', Em7: 'e', A7: 'a', A7sus: 'a', 'F#m7': 'f+', B7: 'b', Gmaj7: 'g', Gm6: 'g', Bbmaj7: 'b-' };
const VAMP: Bar[] = ['Em7', 'A7'];
const A: Bar[] = ['Dmaj7', 'Bm7', 'Em7', 'A7', 'F#m7', 'B7', 'Em7', ['A7sus', 'A7']];
const A2: Bar[] = ['Dmaj7', 'Bm7', 'Em7', 'A7', 'F#m7', 'B7', ['Em7', 'A7'], 'Dmaj7'];
const B: Bar[] = ['Gmaj7', 'Gm6', 'F#m7', 'B7', 'Em7', 'A7', 'Bbmaj7', 'A7'];
const C: Bar[] = ['Dmaj7', 'Gmaj7', 'Dmaj7', 'Gmaj7', 'Dmaj7', 'Gmaj7', 'Em7', 'A7'];
const ALL = [...VAMP, ...A, ...A2, ...B, ...A2, ...C];
const each = (prog: Bar[], full: (c: string) => string, half: (a: string, b: string) => string) => prog.map(b => (typeof b === 'string' ? full(b) : half(b[0], b[1])));
const pads = (prog: Bar[]) => each(prog, c => ch(V[c], '1'), (a, b) => `${ch(V[a], '2')} ${ch(V[b], '2')}`);
const root = (c: string) => R[c];
/** The slap bass popping octaves (the A, B-flat and B from the octave down). */
const lowOf = (c: string) => (/^[ab]/.test(R[c]) ? 1 : 2);
const bassOct = (prog: Bar[]) => each(prog,
  c => octs([c], root, lowOf(c))[0],
  (a, b) => `${octs([a], root, lowOf(a))[0].split(' ').slice(0, 8).join(' ')} ${octs([b], root, lowOf(b))[0].split(' ').slice(0, 8).join(' ')}`);

// ---- The tunes ----
const TUNE = [
  'o5 r8 f+8 a8 >c+8 r8 <a4 f+8', 'o5 e4 d4 r8 a8 b8 >c+8', 'o5 r8 g8 b8 >d8 r8 <b4 g8', 'o5 g4. f+8 e4 r4',
  'o5 r8 a8 >c+8 e8 r8 c+4 <a8', 'o5 b4. a8 f+4 d+4', 'o5 e4. g8 b4 a8 g8', 'o5 a4. g8 e4 r4',
];
const TUNE2 = [...TUNE.slice(0, 6), 'o5 e4. g8 c+4 e4', 'o5 d2. r4'];
const BRIDGE = [
  'o5 b2. a8 b8', 'o5 b-2. a8 g8', 'o5 a2. g+8 a8', 'o5 b4 a4 f+4 d+4',
  'o5 g2. f+8 g8', 'o5 a4 g4 e4 c+4', 'o5 d2 f4 a4', 'o5 g2 e4 r4',
];
/** The guitar's answers in the tune's gaps (A2, A3). */
const FILLS = ['r1', 'o5 r2 f+8 a8 b8 >d8', 'r1', 'o5 r2 c+8 e8 g8 b8', 'r1', 'o5 r2 d+8 f+8 a8 b8', 'r1', 'r1'];
/** The coffee break: the guitar's solo. */
const SOLO = [
  'o4 a8 f+8 r8 e8 f+8 a8 b8 >d8', 'o5 e4 d8 <b8 a8 g8 f+8 d8', 'o4 r8 c+8 d8 e8 f+8 a8 >c+8 e8', 'o5 d2 <b8 >d8 e8 f+8',
  'o5 a8 f+8 e8 d8 r8 e8 f+8 a8', 'o5 b8 a8 g8 f+8 e8 d8 <b8 >d8', 'o4 e8 g8 b8 >d8 e8 g8 b4', 'o5 a4 g8 e8 c+8 <a8 b8 >c+8',
];
const STABS_B = ['r1', 'r1', 'r1', `r2 r8 !${ch(V.B7, '8')} r8 !${ch(V.B7, '8')}`, 'r1', 'r1', `!${ch(V.Bbmaj7, '8')} r8 r8 ${ch(V.Bbmaj7, '8')} r2`, `!${ch(V.A7, '4')} r8 !${ch(V.A7, '8')} r2`];

export const STAFF: Song = {
  title: 'Break Room',
  bpm: 144,
  loopFrom: 8,
  reverb: 'room',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.3, tone: 2600 },
  parts: {
    lead: { inst: 'squarelead', pan: 0, rev: 0.18, dly: 0.12, mml: join(rest(2), ['_v108'], TUNE, TUNE2, ['_v112'], BRIDGE, ['_v108'], TUNE2, rest(8)) },
    bell: { inst: 'fmpiano', pan: 0.3, rev: 0.25, dly: 0.15, vol: 0.3, mml: join(rest(2), ['_v95'], up(TUNE), up(TUNE2), rest(8), up(TUNE2), rest(8)) },
    guitar: { inst: 'distlead', pan: -0.3, rev: 0.2, dly: 0.15, vol: 0.6, mml: join(rest(10), ['_v100'], FILLS, rest(8), FILLS, ['_v110'], SOLO) },
    clav: { inst: 'clav', pan: 0.4, rev: 0.12, vol: 0.4, mml: join(['_v90'], stabsOf(ALL, c => V[c], '! . x x . x . x')) },
    brass: { inst: 'synthbrass', pan: -0.2, rev: 0.2, vol: 0.5, mml: join(rest(18), ['_v110'], STABS_B, rest(16)) },
    bass: { inst: 'slapbass', pan: 0, rev: 0.04, vol: 0.8, mml: join(['_v100'], bassOct(ALL)) },
    pad: { inst: 'pwm', pan: 0, rev: 0.35, vol: 0.32, mml: join(['_v70'], pads(ALL)) },
    drums: {
      inst: 'kick', drums: true, rev: 0.1, vol: 0.75,
      mml: join(['_v90 {kh}8 h8 {sh}8 h8 {kh}8 h8 {sh}8 h8', '_v95 ' + FILL], ['_v100'], sec(BEAT16, 8, FILL), sec(BEAT16, 8, FILL2), sec(DRIVE, 8, FILL), sec(BEAT16, 8, FILL2), ['_v108'], sec(DRIVE, 8, FILL_BIG)),
    },
  },
  arrangements: { main: {} },
};
