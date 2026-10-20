// "AMERICA USA": the way in (the parking garage, security, America USA's street, the ticket line). One patriotic march,
// the park's own, heard four ways as he walks: piped through the garage's PA, ticking along nervously at the security
// checkpoint, the whole band out on America USA's flag-covered street, and rock and roll piano in the line for the
// ticket window. (The joke: it's the same tune the whole way, and it never stops.) The Mega Man pass (the user's: "give
// it more of a high energy mega man vibe"): Sousa played as a Mega Man stage: the trumpet and a square lead on the
// strains with a harmony a third under, power chords and a pumping bass for the oom-pah, offbeat synth-brass chops, a
// rock kit with the march snare's ruffs in it, the trio's broad tune on a singing lead guitar over sixteenth arpeggios,
// the dogfight as a metal riff.
//
// E-flat major, 152, straight. 58 bars: a 2-bar vamp on B-flat 7 (once: a snare roll), then the 56-bar loop:
//   A    (16)  the first strain: dotted, bouncy, up the E-flat to the G; the same figure a step up over Fm7; a C7 (V of
//              ii) arpeggio falling; a half cadence; again (harmonized), through A-flat, A diminished, E-flat over
//              B-flat, C7, F7 and B-flat 7, home.
//   B    (16)  the second strain: call and answer: the lead calls (A-flat, E-flat over G, Fm7, B-flat 7) and the low
//              brass answer in its held notes; the minor six (A-flat minor) on the way home; E-flat 7 to pivot.
//   TRIO (16)  in A-flat, half time: the broad tune on the lead guitar, the square's arpeggios over it; Ab - Db - F7 -
//              Bb7 - Eb7, the G-flat 7 (the flat seven: a lift).
//   DOG   (8)  the "dogfight": F minor, the power chords and the bass snarling up a chromatic riff and the leads snapping
//              back, D-flat 7 sliding down to B-flat 7, a fanfare up to the high D, a roll back to the top.
//
// ARRANGEMENTS (by the intro's zones: each crossfades into the next as he walks):
//   garage    the PA: the tune on the FM piano, a Rhodes on the chops, finger bass, a warm pad, a sidestick groove,
//             muffled (it's coming out of a ceiling speaker in a concrete box)
//   security  the checkpoint: square leads, clavinet chops, a synth bass, hats ticking in sixteenths
//   america   the street: the whole band
//   ticket    the line: rock and roll piano on the tune and the chops, the guitar's riff, a tenor sax on the answers
//   back      the walk back after Wilderness Land (evening, beat, going home the long way): harmonica, nylon guitar,
//             upright bass, slow strings, brushes

import type { Song } from '../engine';
import { scale, harm, pump, arp16, riff, stabs, MM2, HALF, FILL, FILL2, sec } from './mega';

const join = (...parts: string[][]) => parts.flat().join(' | ');
const rest = (n: number) => Array.from({ length: n }, () => 'r1');
const rep = (bar: string, n: number) => Array.from({ length: n }, () => bar);
/** Everything an octave up (each bar's o-numbers raised). */
const up = (bars: string[]) => bars.map(b => b.replace(/o(\d)/g, (_, n) => `o${Number(n) + 1}`));
/** A chord from notes with their octaves ('4g', '5e-'), lowest first. */
const ch = (ns: string[], len: string) => {
  let o = Number(ns[0][0]);
  let s = `o${o} {`;
  for (const n of ns) { const no = Number(n[0]); s += '>'.repeat(no - o) + n.slice(1) + ' '; o = no; }
  return `${s.trim()}}${len}`;
};

type Bar = string | [string, string];
// The chords: voicings (around o4), and the bass's root and fifth
const V: Record<string, string[]> = {
  Eb: ['4g', '4b-', '5e-'], Eb7: ['4g', '4b-', '5d-'], Fm7: ['4a-', '5c', '5e-'], Fm: ['4a-', '5c', '5f'], Bb7: ['4f', '4a-', '5d'],
  C7: ['4g', '4b-', '5e'], Ab: ['4a-', '5c', '5e-'], Adim7: ['4a', '5c', '5e-'], 'Eb/Bb': ['4g', '4b-', '5e-'], F7: ['4a', '5c', '5e-'],
  'Eb/G': ['4g', '4b-', '5e-'], Abm6: ['4a-', '4b', '5f'], 'Ab/C': ['4a-', '5c', '5e-'], Db: ['4a-', '5d-', '5f'], 'Ab/Eb': ['4a-', '5c', '5e-'],
  Ab7: ['4g-', '5c', '5e-'], Gb7: ['4b-', '5d-', '5e'], Bbm7: ['4a-', '5d-', '5f'], Db7: ['4a-', '4b', '5f'],
};
const R: Record<string, [string, string]> = {
  Eb: ['2e-', '1b-'], Eb7: ['2e-', '1b-'], Fm7: ['2f', '2c'], Fm: ['2f', '2c'], Bb7: ['1b-', '2f'], C7: ['2c', '1g'], Ab: ['1a-', '2e-'],
  Adim7: ['1a', '2e-'], 'Eb/Bb': ['1b-', '2e-'], F7: ['2f', '2c'], 'Eb/G': ['1g', '2e-'], Abm6: ['1a-', '2e-'], 'Ab/C': ['2c', '1a-'],
  Db: ['2d-', '1a-'], 'Ab/Eb': ['2e-', '1a-'], Ab7: ['1a-', '2e-'], Gb7: ['2g-', '2d-'], Bbm7: ['1b-', '2f'], Db7: ['2d-', '1a-'],
};
const root = (c: string) => R[c][0].slice(1);
const VAMP: Bar[] = ['Bb7', 'Bb7'];
const A: Bar[] = ['Eb', 'Eb', 'Fm7', 'Bb7', 'Eb', 'C7', 'Fm', 'Bb7', 'Eb', 'Eb', 'Ab', 'Adim7', 'Eb/Bb', 'C7', ['F7', 'Bb7'], 'Eb'];
const B: Bar[] = ['Ab', 'Eb/G', 'Fm7', 'Bb7', 'Ab', 'Eb/G', 'F7', 'Bb7', 'Ab', 'Abm6', 'Eb/Bb', 'C7', 'Fm7', 'Bb7', 'Eb', 'Eb7'];
const TRIO: Bar[] = ['Ab', 'Ab/C', 'Db', 'Db', 'Ab/Eb', 'F7', 'Bb7', 'Eb7', 'Ab', 'Ab7', 'Db', 'Gb7', 'Ab/Eb', 'F7', ['Bbm7', 'Eb7'], 'Ab'];
const DOG: Bar[] = ['Fm', 'Fm', 'C7', 'C7', 'Fm', 'Db7', 'Bb7', 'Bb7'];
const ALL = [...A, ...B, ...TRIO, ...DOG];
const EB = scale('e-', 'major'), AB = scale('a-', 'major');

const each = (prog: Bar[], full: (c: string) => string, half: (a: string, b: string) => string) => prog.map(b => (typeof b === 'string' ? full(b) : half(b[0], b[1])));
const pads = (prog: Bar[]) => each(prog, c => ch(V[c], '1'), (a, b) => `${ch(V[a], '2')} ${ch(V[b], '2')}`);
/** The horns' long notes: the voicing's middle. */
const guides = (prog: Bar[]) => each(prog, c => `o${V[c][1][0]} ${V[c][1].slice(1)}1`, (a, b) => `o${V[a][1][0]} ${V[a][1].slice(1)}2 o${V[b][1][0]} ${V[b][1].slice(1)}2`);

// ---- The tunes ----

/** The first strain. */
const STRAIN = [
  'o4 b-8. >e-16 e-4 e-8. f16 g8. e-16', 'o5 b-4 g4 e-2', 'o5 c8. <a-16 a-4 a-8. b-16 >c8. <a-16', 'o5 d4 <b-4 f2',
  'o4 b-8. >e-16 e-4 e-8. f16 g8. b-16', 'o6 c4 o5 b-4 g4 e4', 'o5 f8. g16 a-8. b-16 >c4 <a-4', 'o5 b-2. r4',
  'o4 b-8. >e-16 e-4 e-8. f16 g8. e-16', 'o5 b-4 g4 e-2', 'o5 c8. <a-16 a-4 >c8. d16 e-8. c16', 'o5 g-4 e-4 c4 <a4',
  'o4 b-8. >e-16 g4 b-4 g4', 'o6 c4 o5 b-4 g4 e4', 'o5 f4 a4 a-4 f4', 'o5 e-2. r4',
];
/** The second strain's calls (the answers are the low brass's). */
const CALLS = [
  'o5 c4 e-4 a-4. g8', 'o5 g2 r2', 'o5 a-4 g4 f4. e-8', 'o5 f2 r2',
  'o5 c4 e-4 a-4. b-8', 'o6 c4 o5 b-4 g4 e-4', 'o5 f4 a4 >c4 e-4', 'o6 d2 r2',
  'o6 c4. o5 a-8 e-4. c8', 'o4 b4 >e-4 f4 a-4', 'o5 g2 b-4. g8', 'o5 b-4 g4 e4 g4',
  'o5 a-4. g8 f4 a-4', 'o5 a-4. f8 d4 f4', 'o5 e-2 g4 b-4', 'o5 d-2 c4 <b-4',
];
/** The trio's broad tune (the lead guitar's). */
const BROAD = up([
  'o4 c2. <a-4', 'o4 e-2. c4', 'o4 f2. e-4', 'o4 d-2 f2',
  'o4 e-2. c4', 'o4 c2 <a2', 'o4 d2. c4', 'o3 b-2. r4',
  'o4 c2. <a-4', 'o4 g-2. e-4', 'o4 f2. a-4', 'o4 b-2 a-4 e4',
  'o4 e-2. c4', 'o4 e-2 c2', 'o4 d-2 c4 <b-4', 'o3 a-1',
]);
/** The dogfight: the leads' snaps back (and the fanfare up). */
const DOG_HI = ['r1', 'o5 c8 r8 <a-8 r8 >c8 d-8 c8 r8', 'r1', 'o5 c8 r8 <b-8 r8 >c8 d-8 e8 r8', 'r1', 'o5 f8 r8 a-8 r8 f8 r8 d-4', 'o5 d4 f4 a-4 >d4', 'o6 d4 r4 r2'];
/** The low brass: the second strain's answers. */
const ANSWERS = ['r1', 'o3 r4 g8 a-8 b-8 r8 e-4', 'r1', 'o3 r4 f8 g8 a-8 r8 d4', 'r1', 'r1', 'r1', 'o3 r4 d8 e-8 f8 g8 a-4', ...rest(8)];
/** The dogfight's riff (the power chords and the bass in unison). */
const DOG_LO = ['o2 f8 f8 c8 f8 f8 g8 a-8 b-8', 'o2 f8 f8 c8 f8 o3 c8 o2 b-8 a-8 g8', 'o2 e8 e8 c8 e8 e8 f8 g8 b-8', 'o2 c8 c8 c8 c8 e8 f8 g8 b-8', 'o2 f8 f8 c8 f8 f8 g8 a-8 o3 c8', 'o3 d-4 c4 o2 b4 b-4', 'o2 b-8 b-8 b-8 b-8 b-8 b-8 b-8 b-8', 'o2 b-8 r8 r4 r2'];

// ---- The kits ----
// America: a rock march (the snare's ruffs in the backbeat)
const MR = '{kh}8 ?s16 ?s16 {sh}8 h8 {kh}8 {kh}8 {sh}8 ?s16 ?s16';
const ROLL = '_v70 s16 s16 s16 s16 s16 s16 s16 s16 _v90 s16 s16 s16 s16 s16 s16 s16 s16';
const DRUMS_M = [
  ROLL, '_v105 s16 s16 s16 s16 s16 s16 s16 s16 {kx}4 r4',
  '_v105', ...sec(MR, 8, FILL), ...sec(MR, 8, FILL2), ...sec(MR, 8, FILL), ...sec(MR, 8, FILL2),
  '_v100', ...sec(HALF, 8, FILL), ...sec(HALF, 8, FILL2),
  '_v110', ...rep(MM2, 7), '_v120 {kx}4 r4 _v70 s16 s16 s16 s16 _v95 s16 s16 s16 s16',
];
// The garage: the PA's groove, the sidestick on 2 and 4
const G = '{kh}8 h8 {mh}8 h8 {kh}8 {kh}8 {mh}8 h8';
const DRUMS_G = ['_v80', 'k8 h8 {mh}8 h8 k8 h8 {mh}8 h8', 'k8 h8 {mh}8 h8 k8 m8 m8 m8', ...rep(G, 56)];
// Security: sixteenths ticking
const S = '{kh}16 ?h16 h16 ?h16 {sh}16 ?h16 h16 ?h16 {kh}16 ?h16 {kh}16 ?h16 {sh}16 ?h16 h16 ?h16';
const DRUMS_S = ['_v85', ...rep(S, 58)];
// The ticket line: rock and roll
const T = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {sh}8';
const DRUMS_T = ['_v95', ...rep(T, 58)];
// The walk back: brushes
const BR = '{ki}4 {is}8 i8 i4 {is}8 i8';
const DRUMS_B = ['_v70', ...rep(BR, 58)];

export const INTRO: Song = {
  title: 'America USA',
  bpm: 152,
  loopFrom: 8,
  reverb: 'hall',
  reverbMix: 0.6,
  delay: { beats: 0.75, feedback: 0.22, tone: 2600 },
  parts: {
    lead: { inst: 'trumpet', pan: 0.05, rev: 0.2, dly: 0.08, mml: join(rest(2), ['_v108'], STRAIN, CALLS, rest(16), DOG_HI) },
    square: { inst: 'squarelead', pan: -0.2, rev: 0.18, dly: 0.1, vol: 0.45, not: ['back', 'garage'], mml: join(rest(2), ['_v100'], STRAIN, CALLS, rest(16), up(DOG_HI)) },
    harmony: { inst: 'squarelead', pan: 0.35, rev: 0.18, vol: 0.42, only: ['america', 'security'], mml: join(rest(2), rest(8), ['_v95'], harm(STRAIN.slice(8), EB, -2), rest(8), harm(CALLS.slice(8), EB, -2), ['_v90'], harm(BROAD, AB, -2), rest(8)) },
    trio: { inst: 'distlead', pan: -0.05, rev: 0.25, dly: 0.15, vol: 0.7, mml: join(rest(34), ['_v105'], BROAD, rest(8)) },
    arp: { inst: 'squarelead', pan: 0.4, rev: 0.2, dly: 0.12, vol: 0.3, only: ['america', 'security'], mml: join(rest(34), ['_v85'], arp16(TRIO, c => V[c], 0), rest(8)) },
    low: { inst: 'trombone', pan: -0.3, rev: 0.2, vol: 0.85, mml: join(rest(18), ['_v105'], ANSWERS, rest(24)) },
    riffg: { inst: 'powerchord', pan: -0.4, rev: 0.08, vol: 0.45, only: ['america', 'ticket'], mml: join(['_v100 o1 b-1', 'o1 b-8 b-8 b-8 b-8 b-8 b-8 b-8 b-8'], ['_v105'], riff(A, root, '! x . x x . x x'), riff(B, root, '! x . x x . x x'), riff(TRIO, root, '! - - - x - x x'), ['_v115'], DOG_LO) },
    horns: { inst: 'horn', pan: -0.4, rev: 0.3, vol: 0.5, only: ['america'], mml: join(rest(2), ['_v85 _q95'], guides(A), guides(B), guides(TRIO), rest(8)) },
    comp: { inst: 'synthbrass', pan: 0.25, rev: 0.15, vol: 0.42, mml: join(['q4 _v90'], stabs(VAMP, c => V[c], '. x . x . x . x'), stabs([...A, ...B], c => V[c], '. x . x . x . x'), stabs(TRIO, c => V[c], '! . . . x . . .'), stabs(DOG, c => V[c], '! . . x . . x .')) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.85, mml: join(['_v100'], pump(VAMP, root), pump([...A, ...B, ...TRIO], root), DOG_LO) },
    pad: { inst: 'warmpad', pan: 0, rev: 0.35, vol: 0.4, only: ['garage', 'back'], mml: join(['_v70'], pads(VAMP), pads(ALL)) },
    drumsM: { inst: 'kick', drums: true, rev: 0.12, vol: 0.85, only: ['america'], mml: join(DRUMS_M) },
    drumsG: { inst: 'kick', drums: true, rev: 0.1, vol: 0.65, only: ['garage'], mml: join(DRUMS_G) },
    drumsS: { inst: 'kick', drums: true, rev: 0.1, vol: 0.65, only: ['security'], mml: join(DRUMS_S) },
    drumsT: { inst: 'kick', drums: true, rev: 0.12, vol: 0.75, only: ['ticket'], mml: join(DRUMS_T) },
    drumsB: { inst: 'kicksoft', drums: true, kit: 'brush', rev: 0.2, vol: 0.7, only: ['back'], mml: join(DRUMS_B) },
  },
  arrangements: {
    garage: {
      inst: { lead: 'fmpiano', trio: 'fmpiano', comp: 'epiano', low: 'cleangtr' },
      vol: { comp: 1.1, pad: 0.9, lead: 0.85, trio: 1.0 },
      rev: { lead: 0.35, trio: 0.35 },
      lowpass: 3800,
      level: 0.8,
    },
    security: {
      inst: { lead: 'squarelead', trio: 'squarelead', low: 'synthbrass', comp: 'clav', bass: 'synthbass' },
      mute: ['square'],
      vol: { comp: 1.1, bass: 0.75, lead: 0.8, trio: 0.75 },
      level: 0.8,
    },
    america: {},
    ticket: {
      inst: { lead: 'piano', trio: 'piano', low: 'tenorsax', comp: 'piano' },
      mute: ['square'],
      vol: { comp: 1.3, lead: 1.1, trio: 1.2 },
      rev: { lead: 0.15, comp: 0.15 },
      level: 0.85,
    },
    back: {
      inst: { lead: 'harmonica', trio: 'harmonica', low: 'nylongtr', comp: 'nylongtr', bass: 'upright', pad: 'slowstrings' },
      vol: { pad: 0.9, comp: 1.2, lead: 0.85, bass: 0.7 },
      rev: { lead: 0.35 },
      level: 0.75,
    },
  },
};
