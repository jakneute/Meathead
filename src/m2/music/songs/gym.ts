// "IRON PIT": Meathead's gym, leg day (the opening tutorial: intro/gym). A Mega Man stage theme for a weight room: E
// minor, 152, straight: a chugging power-chord riff like a set of squats (down... and UP), the pumping octave bass, the
// square lead on a tune that climbs like a PR attempt, a synth-brass answer, the rock kit driving. Its cutscenes get
// the same tune soft (the pad, the bass, the bell).
//
// 34 bars: a 2-bar count-in (the riff alone), then the 32-bar loop:
//   A  (8)  the riff and the tune: Em - Em - C - D, Em - Em - C - B (the B major: the strain before the rep)
//   A2 (8)  again, the brass answering the tune's gaps
//   B  (8)  the push: Am - C - D - B, Am - C - D - D, the lead up an octave, sixteenth arps under it
//   C  (8)  the lockout: Em - G - D - A, C - D - B - B, the riff in half time, the kit's toms, a fill to the top
//
// ARRANGEMENTS: main (the tutorial), cutscene (under the cutscenes: the tune on a bell, the pad, the bass).

import type { Song } from '../engine';
import { pump, arp16, riff, stabs, DRIVE, MM2, HALF, FILL, FILL2, FILL_BIG, sec } from './mega';

const join = (...parts: string[][]) => parts.flat().join(' | ');
const rest = (n: number) => Array.from({ length: n }, () => 'r1');
const up = (bars: string[]) => bars.map(b => b.replace(/o(\d)/g, (_, n) => `o${Number(n) + 1}`));
const ch = (ns: string[], len: string) => {
  let o = Number(ns[0][0]);
  let s = `o${o} {`;
  for (const n of ns) { const no = Number(n[0]); s += '>'.repeat(no - o) + n.slice(1) + ' '; o = no; }
  return `${s.trim()}}${len}`;
};

type Bar = string | [string, string];
const V: Record<string, string[]> = {
  Em: ['4e', '4g', '4b'], C: ['4e', '4g', '5c'], D: ['4f+', '4a', '5d'], B: ['4f+', '4b', '5d+'], Am: ['4e', '4a', '5c'], G: ['4d', '4g', '4b'], A: ['4e', '4a', '5c+'],
};
const RT: Record<string, string> = { Em: 'e', C: 'c', D: 'd', B: 'b', Am: 'a', G: 'g', A: 'a' };
const root = (c: string) => RT[c];
const IN: Bar[] = ['Em', 'Em'];
const A: Bar[] = ['Em', 'Em', 'C', 'D', 'Em', 'Em', 'C', 'B'];
const B: Bar[] = ['Am', 'C', 'D', 'B', 'Am', 'C', 'D', 'D'];
const C: Bar[] = ['Em', 'G', 'D', 'A', 'C', 'D', 'B', 'B'];
const ALL = [...IN, ...A, ...A, ...B, ...C];
const pads = (prog: Bar[]) => prog.map(b => (typeof b === 'string' ? ch(V[b], '1') : `${ch(V[b[0]], '2')} ${ch(V[b[1]], '2')}`));

const TUNE = [
  'o5 e8 e8 r8 g8 r8 e8 b8 a8', 'o5 g4 f+8 e8 f+4 r4', 'o5 e8 e8 r8 g8 r8 e8 >c8 <b8', 'o5 a4. g8 f+4 d4',
  'o5 e8 e8 r8 g8 r8 b8 >e8 d8', 'o6 c4 <b8 a8 b4 r4', 'o5 g8 a8 b8 >c8 e4 d8 c8', 'o5 b2 d+4 f+4',
];
const TUNE2 = [...TUNE.slice(0, 7), 'o5 b2. r4'];
const PUSH = [
  'o5 a4 >c8 e8 r8 c8 <a4', 'o5 g4 >c8 e8 g4 e4', 'o5 f+4 a8 >d8 r8 <a8 f+4', 'o5 d+4 f+8 b8 >d+4 <b4',
  'o5 a4 >c8 e8 a4 g8 e8', 'o5 g4 e8 c8 e4 g4', 'o5 f+8 a8 >d8 f+8 a4 f+4', 'o6 d2. r4',
];
const LOCK = [
  'o5 b2 >e4 d4', 'o5 b2 g4 d4', 'o5 a2 >d4 c+4', 'o5 a2 e4 c+4',
  'o5 g2 >c4 <b4', 'o5 a2 >d4 c4', 'o5 b1', 'o5 b2 d+4 f+4',
];
const ANSWERS = ['r1', `r2 r8 !${ch(V.D, '8')} r8 ${ch(V.D, '8')}`, 'r1', `r2 ${ch(V.D, '8')} r8 ${ch(V.D, '4')}`, 'r1', `r2 r8 !${ch(V.B, '8')} r8 ${ch(V.B, '8')}`, 'r1', `!${ch(V.B, '4')} r4 ${ch(V.B, '4')} r4`];

export const GYM: Song = {
  title: 'Iron Pit',
  bpm: 152,
  loopFrom: 2,
  reverb: 'room',
  reverbMix: 0.7,
  delay: { beats: 0.75, feedback: 0.25, tone: 2400 },
  parts: {
    lead: { inst: 'squarelead', pan: 0, rev: 0.18, dly: 0.12, not: ['cutscene'], mml: join(rest(2), ['_v108'], TUNE, TUNE2, ['_v112'], up(PUSH.slice(0, 7)), ['o6 d2. r4'], ['_v110'], LOCK) },
    bell: { inst: 'fmpiano', pan: 0.25, rev: 0.3, dly: 0.15, vol: 0.35, mml: join(rest(2), ['_v92'], up(TUNE), up(TUNE2), up(PUSH), up(LOCK)) },
    arp: { inst: 'squarelead', pan: 0.4, rev: 0.2, dly: 0.1, vol: 0.28, not: ['cutscene'], mml: join(rest(18), ['_v85'], arp16(B, c => V[c], 0), rest(8)) },
    guitar: { inst: 'powerchord', pan: -0.35, rev: 0.08, vol: 0.5, not: ['cutscene'], mml: join(['_v100'], riff(IN, root, '! . . x ! . x x'), ['_v105'], riff([...A, ...A], root, '! . . x ! . x x'), riff(B, root, '! x . x x . x x'), riff(C, root, '! - - - x - x x')) },
    brass: { inst: 'synthbrass', pan: 0.2, rev: 0.2, vol: 0.48, not: ['cutscene'], mml: join(rest(10), ['_v105'], ANSWERS, stabs(B, c => V[c], '. x . x . x . x'), rest(8)) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.85, mml: join(['_v100'], pump(ALL, root)) },
    pad: { inst: 'warmpad', pan: 0, rev: 0.35, vol: 0.32, mml: join(['_v70'], pads(ALL)) },
    drums: {
      inst: 'kick', drums: true, rev: 0.1, vol: 0.8, not: ['cutscene'],
      mml: join(['_v95 {kh}8 h8 h8 h8 {sh}8 h8 h8 h8', '_v100 ' + FILL], ['_v104'], sec(MM2, 8, FILL), sec(DRIVE, 8, FILL2), sec(DRIVE, 8, FILL), sec(HALF, 8, FILL_BIG)),
    },
  },
  arrangements: { main: {}, cutscene: { level: 0.7 } },
};
