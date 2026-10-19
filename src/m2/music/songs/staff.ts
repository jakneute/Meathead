// "BREAK ROOM": the staff room behind the STAFF ONLY door (the practice pen: nobody fights back, he can't be hurt, he
// tries his weapons out on whoever wanders in). Lazy breakroom muzak: the bossa nova off an 80s corporate training
// video, the DX bell piano out front, the vending machine humming along. Nobody in here is working.
//
// D major, 84, a bossa (straight eighths, the 3-3-2 on the guitar and the rim). 42 bars: a 2-bar vamp (once), then
// the 40-bar loop, AABA plus a vamp:
//   A   (8)  the DX piano's tune: lazy, lots of air, up the chord to the major seventh; Dmaj7 - Bm7 - Em7 - A7, a
//            F#m7 - B7(b9) secondary, a half cadence on the A7sus.
//   A2  (8)  again (the flute filling the gaps), home to D.
//   B   (8)  the bridge: up to G, its minor six (the wistful bit), F#m7 - B7, Em7 - A7, and the flat six (B-flat maj7)
//            for a muzak key-change feint before the A7 brings it back. Oohs.
//   A3  (8)  the tune again, the flute filling.
//   C   (8)  the coffee break: the flute noodles over D and G, the slow strings in, and a trombone yawns at the end.
//
// ARRANGEMENTS: main only.

import type { Song } from '../engine';

const join = (...parts: string[][]) => parts.flat().join(' | ');
const rest = (n: number) => Array.from({ length: n }, () => 'r1');
const rep = (bar: string, n: number) => Array.from({ length: n }, () => bar);
/** A chord from notes with their octaves ('4f+', '5c+'), lowest first. */
const ch = (ns: string[], len: string) => {
  let o = Number(ns[0][0]);
  let s = `o${o} {`;
  for (const n of ns) { const no = Number(n[0]); s += '>'.repeat(no - o) + n.slice(1) + ' '; o = no; }
  return `${s.trim()}}${len}`;
};
const nt = (n: string, len: string) => `o${n[0]} ${n.slice(1)}${len}`;

type Bar = string | [string, string];
// The chords: rootless ninth voicings (around o4: the muzak sound), and the bass's root and fifth
const V: Record<string, string[]> = {
  Dmaj7: ['4f+', '4a', '5c+', '5e'], Bm7: ['4f+', '4a', '5c+', '5d'], Em7: ['4g', '4b', '5d', '5f+'], A7: ['4g', '4b', '5c+', '5f+'],
  A7sus: ['4g', '4b', '5d', '5e'], 'F#m7': ['4a', '5c+', '5e', '5g+'], B7: ['4a', '5c', '5d+', '5f+'], Gmaj7: ['4f+', '4a', '4b', '5d'],
  Gm6: ['4e', '4g', '4b-', '5d'], Bbmaj7: ['4f', '4a', '5c', '5d'],
};
const R: Record<string, [string, string]> = {
  Dmaj7: ['2d', '1a'], Bm7: ['1b', '2f+'], Em7: ['2e', '1b'], A7: ['1a', '2e'], A7sus: ['1a', '2e'], 'F#m7': ['2f+', '2c+'],
  B7: ['1b', '2f+'], Gmaj7: ['1g', '2d'], Gm6: ['1g', '2d'], Bbmaj7: ['1b-', '2f'],
};
const VAMP: Bar[] = ['Em7', 'A7'];
const A: Bar[] = ['Dmaj7', 'Bm7', 'Em7', 'A7', 'F#m7', 'B7', 'Em7', ['A7sus', 'A7']];
const A2: Bar[] = ['Dmaj7', 'Bm7', 'Em7', 'A7', 'F#m7', 'B7', ['Em7', 'A7'], 'Dmaj7'];
const B: Bar[] = ['Gmaj7', 'Gm6', 'F#m7', 'B7', 'Em7', 'A7', 'Bbmaj7', 'A7'];
const C: Bar[] = ['Dmaj7', 'Gmaj7', 'Dmaj7', 'Gmaj7', 'Dmaj7', 'Gmaj7', 'Em7', 'A7'];
const ALL = [...VAMP, ...A, ...A2, ...B, ...A2, ...C];

const each = (prog: Bar[], full: (c: string) => string, half: (a: string, b: string) => string) => prog.map(b => (typeof b === 'string' ? full(b) : half(b[0], b[1])));
const pads = (prog: Bar[]) => each(prog, c => ch(V[c], '1'), (a, b) => `${ch(V[a], '2')} ${ch(V[b], '2')}`);
/** The guitar's bossa: the chord on 1, the and of 2, and 4. */
const bossa = (prog: Bar[]) => each(prog,
  c => `${ch(V[c], '8')} r8 r8 ${ch(V[c], '8')} r8 r8 ${ch(V[c], '8')} r8`,
  (a, b) => `${ch(V[a], '8')} r8 r8 ${ch(V[a], '8')} ${ch(V[b], '8')} r8 ${ch(V[b], '8')} r8`);
/** The bass: the root, the fifth on the and of 2, held. */
const bass = (prog: Bar[]) => each(prog,
  c => `${nt(R[c][0], '4.')} ${nt(R[c][1], '8')} ${nt(R[c][1], '2')}`,
  (a, b) => `${nt(R[a][0], '4.')} ${nt(R[a][1], '8')} ${nt(R[b][0], '4.')} ${nt(R[b][1], '8')}`);

// ---- The tunes ----
const TUNE = [
  'o5 r8 f+8 a8 >c+8 r8 <a4 f+8', 'o5 e4 d4 r2', 'o5 r8 g8 b8 >d8 r8 <b4 g8', 'o5 g4. f+8 e4 r4',
  'o5 r8 a8 >c+8 e8 r8 c+4 <a8', 'o5 b4. a8 f+4 d+4', 'o5 e4. g8 b4 a8 g8', 'o5 a4. g8 e4 r4',
];
const TUNE2 = [...TUNE.slice(0, 6), 'o5 e4. g8 c+4 e4', 'o5 d2. r4'];
const BRIDGE = [
  'o5 b2. a8 b8', 'o5 b-2. a8 g8', 'o5 a2. g+8 a8', 'o5 b4 a4 f+4 d+4',
  'o5 g2. f+8 g8', 'o5 a4 g4 e4 c+4', 'o5 d2 f4 a4', 'o5 g2 e4 r4',
];
/** The flute's fills in the tune's gaps (the second and third times). */
const FILLS = ['r1', 'o5 r2 f+8 a8 b8 >d8', 'r1', 'o5 r2 c+8 e8 g8 b8', 'r1', 'r1', 'r1', 'r1'];
/** The coffee break: the flute noodling. */
const NOODLE = [
  'o5 a8 f+8 r8 e8 f+4 r4', 'o5 r8 b8 a8 g8 f+8 e8 d4', 'o5 r4 c+8 d8 e8 f+8 a4', 'o5 b2 r2',
  'o6 d8 c+8 <a8 f+8 r8 e8 f+8 a8', 'o5 g8 f+8 e8 d8 r8 <b8 >d4', 'o5 e4 g4 b4 >d4', 'o6 c+2 <a4 r4',
];

// ---- The kit: sidestick on the bossa, kick on 1 and 3, a shaker in eighths ----
const GROOVE = '{kmz}8 ?z8 z8 {mz}8 {kz}8 ?z8 {mz}8 ?z8';
const RIDE = '{kmi}8 ?i8 i8 {mi}8 {ki}8 ?i8 {mi}8 ?i8';

export const STAFF: Song = {
  title: 'Break Room',
  bpm: 84,
  loopFrom: 8,
  reverb: 'room',
  reverbMix: 0.9,
  delay: { beats: 0.75, feedback: 0.3, tone: 2400 },
  parts: {
    lead: { inst: 'fmpiano', pan: 0, rev: 0.3, dly: 0.15, mml: join(rest(2), ['_v88'], TUNE, TUNE2, BRIDGE, TUNE2, rest(8)) },
    flute: { inst: 'flute', pan: 0.25, rev: 0.3, dly: 0.12, vol: 0.75, mml: join(rest(10), ['_v80'], FILLS, rest(8), FILLS, ['_v88'], NOODLE) },
    gtr: { inst: 'nylongtr', pan: -0.3, rev: 0.2, vol: 0.75, mml: join(['q5 _v72'], bossa(ALL)) },
    bass: { inst: 'bass', pan: 0, rev: 0.08, vol: 0.85, mml: join(['_v88 _q90'], bass(ALL)) },
    pad: { inst: 'warmpad', pan: 0, rev: 0.4, vol: 0.4, mml: join(['_v60'], pads(ALL)) },
    oohs: { inst: 'oohs', pan: 0.1, rev: 0.45, vol: 0.45, mml: join(rest(18), ['_v65'], pads(B), rest(16)) },
    strings: { inst: 'slowstrings', pan: -0.1, rev: 0.4, vol: 0.5, mml: join(rest(34), ['_v60'], pads(C)) },
    tbone: { inst: 'trombone', pan: 0.35, rev: 0.3, vol: 0.6, mml: join(rest(41), ['_v70 o3 r2 _f-7/2 g2']) },
    drums: { inst: 'kick', drums: true, rev: 0.12, vol: 0.55, mml: join(['_v80'], rep('z8 ?z8 z8 ?z8 z8 ?z8 z8 ?z8', 2), rep(GROOVE, 32), ['_v72'], rep(RIDE, 8)) },
  },
  arrangements: { main: {} },
};
