// "AMERICA USA": the way in (the parking garage, security, America USA's street, the ticket line). One patriotic march,
// the park's own, heard four ways as he walks: piped through the garage's PA as muzak, ticking along nervously at the
// security checkpoint, the full Sousa band out on America USA's flag-covered street, and honky-tonk ragtime in the line
// for the ticket window. (The joke: it's the same tune the whole way, and it never stops.)
//
// E-flat major, 116, a march in two (straight eighths). 58 bars: a 2-bar vamp on B-flat 7 (once), then the 56-bar loop:
//   A    (16)  the first strain: dotted, bouncy, up the E-flat to the G; the same figure a step up over Fm7; a C7 (V of
//              ii) arpeggio falling; a half cadence; again, through A-flat, A diminished, E-flat over B-flat, C7, F7 and
//              B-flat 7, home.
//   B    (16)  the second strain: call and answer: the lead calls (A-flat, E-flat over G, Fm7, B-flat 7) and the low
//              brass answer in its held notes; the minor six (A-flat minor) on the way home; E-flat 7 to pivot.
//   TRIO (16)  in A-flat (the march's trio, in the four as they are): the broad tune down low, the horns' (the piccolo's
//              obbligato over it on the street); Ab - Db - F7 - Bb7 - Eb7, the G-flat 7 (the flat seven: a lift).
//   DOG   (8)  the "dogfight": F minor, the trombones snarling up a chromatic riff and the trumpets snapping back,
//              D-flat 7 sliding down to B-flat 7, a fanfare up to the high D, back to the top.
//
// ARRANGEMENTS (by the intro's zones: each crossfades into the next as he walks):
//   garage    the PA's muzak: vibes on the tune, electric piano on the two-beat, finger bass, a warm pad, rimshot and
//             hats, muffled (it's coming out of a ceiling speaker in a concrete box)
//   security  the checkpoint: clarinet, pizzicato, a pulsing synth bass, hats ticking in sixteenths, a woodblock clock
//   america   the street: the full marching band (trumpet, piccolo, horns, trombones, the brass section on the pahs,
//             tuba, the snare and bass drum and cymbals)
//   ticket    the line: honky-tonk piano, banjo, tuba, a two-step on the sidestick
//   back      the walk back after Wilderness Land (evening, beat, going home the long way): harmonica, nylon guitar,
//             upright bass, slow strings, brushes

import type { Song } from '../engine';

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
const nt = (n: string, len: string) => `o${n[0]} ${n.slice(1)}${len}`;

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
const VAMP: Bar[] = ['Bb7', 'Bb7'];
const A: Bar[] = ['Eb', 'Eb', 'Fm7', 'Bb7', 'Eb', 'C7', 'Fm', 'Bb7', 'Eb', 'Eb', 'Ab', 'Adim7', 'Eb/Bb', 'C7', ['F7', 'Bb7'], 'Eb'];
const B: Bar[] = ['Ab', 'Eb/G', 'Fm7', 'Bb7', 'Ab', 'Eb/G', 'F7', 'Bb7', 'Ab', 'Abm6', 'Eb/Bb', 'C7', 'Fm7', 'Bb7', 'Eb', 'Eb7'];
const TRIO: Bar[] = ['Ab', 'Ab/C', 'Db', 'Db', 'Ab/Eb', 'F7', 'Bb7', 'Eb7', 'Ab', 'Ab7', 'Db', 'Gb7', 'Ab/Eb', 'F7', ['Bbm7', 'Eb7'], 'Ab'];
const DOG: Bar[] = ['Fm', 'Fm', 'C7', 'C7', 'Fm', 'Db7', 'Bb7', 'Bb7'];
const ALL = [...A, ...B, ...TRIO, ...DOG];

const each = (prog: Bar[], full: (c: string) => string, half: (a: string, b: string) => string) => prog.map(b => (typeof b === 'string' ? full(b) : half(b[0], b[1])));
const pads = (prog: Bar[]) => each(prog, c => ch(V[c], '1'), (a, b) => `${ch(V[a], '2')} ${ch(V[b], '2')}`);
/** The pahs on 2 and 4. */
const pahs = (prog: Bar[]) => each(prog, c => `r4 ${ch(V[c], '4')} r4 ${ch(V[c], '4')}`, (a, b) => `r4 ${ch(V[a], '4')} r4 ${ch(V[b], '4')}`);
/** The ooms on 1 and 3: root and fifth (two chords: the roots). */
const ooms = (prog: Bar[]) => each(prog, c => `${nt(R[c][0], '4')} r4 ${nt(R[c][1], '4')} r4`, (a, b) => `${nt(R[a][0], '4')} r4 ${nt(R[b][0], '4')} r4`);
/** The horns' long notes: the voicing's middle. */
const guides = (prog: Bar[]) => each(prog, c => nt(V[c][1], '1'), (a, b) => `${nt(V[a][1], '2')} ${nt(V[b][1], '2')}`);
/** The piccolo's obbligato over the trio: down and up the chord an octave over, in eighths. */
const obbligato = (prog: Bar[]) => each(prog,
  c => { const v = V[c].map(n => String(Number(n[0]) + 1) + n.slice(1)); return [v[2], v[1], v[0], v[1], v[2], v[1], v[0], v[1]].map(n => nt(n, '8')).join(' '); },
  (a, b) => { const va = V[a].map(n => String(Number(n[0]) + 1) + n.slice(1)), vb = V[b].map(n => String(Number(n[0]) + 1) + n.slice(1)); return [va[2], va[1], va[0], va[1], vb[2], vb[1], vb[0], vb[1]].map(n => nt(n, '8')).join(' '); });

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
/** The trio's broad tune (down low: the horns and trombones' register). */
const BROAD = [
  'o4 c2. <a-4', 'o4 e-2. c4', 'o4 f2. e-4', 'o4 d-2 f2',
  'o4 e-2. c4', 'o4 c2 <a2', 'o4 d2. c4', 'o3 b-2. r4',
  'o4 c2. <a-4', 'o4 g-2. e-4', 'o4 f2. a-4', 'o4 b-2 a-4 e4',
  'o4 e-2. c4', 'o4 e-2 c2', 'o4 d-2 c4 <b-4', 'o3 a-1',
];
/** The dogfight: the trumpets' snaps back (and the fanfare up). */
const DOG_HI = ['r1', 'o5 c8 r8 <a-8 r8 >c8 d-8 c8 r8', 'r1', 'o5 c8 r8 <b-8 r8 >c8 d-8 e8 r8', 'r1', 'o5 f8 r8 a-8 r8 f8 r8 d-4', 'o5 d4 f4 a-4 >d4', 'o6 d4 r4 r2'];
/** The low brass: the second strain's answers, then the dogfight's riff. */
const ANSWERS = ['r1', 'o3 r4 g8 a-8 b-8 r8 e-4', 'r1', 'o3 r4 f8 g8 a-8 r8 d4', 'r1', 'r1', 'r1', 'o3 r4 d8 e-8 f8 g8 a-4', ...rest(8)];
const DOG_LO = ['o3 f8 r8 c8 r8 f8 g8 a-8 b-8', 'r1', 'o3 e8 r8 c8 r8 e8 f8 g8 b-8', 'r1', 'o3 f8 r8 c8 r8 f8 g8 a-8 >c8', 'o4 d-4 c4 <b4 b-4', 'o3 b-4 r4 b-4 r4', 'o3 b-8 r8 r4 r2'];

// ---- The kits ----
// America: the marching band
const M = 'k4 s8 ?s16 ?s16 k4 s8 s16 s16';
const M_IN = '{kx}4 s8 ?s16 ?s16 k4 s8 s16 s16';
const M_FILL = 'k4 s8 s16 s16 s16 s16 s16 s16 {ks}8 {ks}8';
const M_TRIO = 'k4 ?s8 ?s8 k4 ?s8 ?s8';
const M_DOG = 'k8 k8 s8 k8 k8 s8 s16 s16 s8';
const M_ROLL = '_v120 {kx}4 r4 _v60 s16 s16 s16 s16 _v90 s16 s16 s16 s16';
const DRUMS_M = [
  '_v70 s16 s16 s16 s16 s16 s16 s16 s16 _v90 s16 s16 s16 s16 s16 s16 s16 s16', '_v105 s16 s16 s16 s16 s16 s16 s16 s16 {kx}4 r4',
  '_v105', M_IN, ...rep(M, 6), M_FILL, M_IN, ...rep(M, 6), M_FILL,
  M_IN, ...rep(M, 6), M_FILL, M_IN, ...rep(M, 6), M_FILL,
  '_v90 {kx}4 ?s8 ?s8 k4 ?s8 ?s8', ...rep(M_TRIO, 6), M_FILL, '{kx}4 ?s8 ?s8 k4 ?s8 ?s8', ...rep(M_TRIO, 6), '_v105 ' + M_FILL,
  M_DOG, M_DOG, M_DOG, M_DOG, M_DOG, M_DOG, M_DOG, M_ROLL, '_v105',
];
// The garage: the PA's two-beat, rimshot on 2 and 4
const G = 'k8 ?h8 {mh}8 ?h8 k8 ?h8 {mh}8 ?h8';
const DRUMS_G = ['_v75', 'k8 ?h8 {mh}8 ?h8 k8 ?h8 {mh}8 h8', 'k8 ?h8 {mh}8 ?h8 k8 m8 m8 m8', ...rep(G, 56)];
// Security: sixteenths ticking, a woodblock clock on 4
const S = '{kh}16 ?h16 h16 ?h16 h16 ?h16 h16 ?h16 {kh}16 ?h16 h16 ?h16 {he}16 ?h16 h16 ?h16';
const DRUMS_S = ['_v80', ...rep(S, 58)];
// The ticket line: a two-step on the sidestick, a tambourine on the offbeats
const T = 'k8 ?j8 m8 ?j8 k8 k8 m8 ?j8';
const DRUMS_T = ['_v85', ...rep(T, 58)];
// The walk back: brushes
const BR = '{ki}4 {is}8 i8 i4 {is}8 i8';
const DRUMS_B = ['_v70', ...rep(BR, 58)];

export const INTRO: Song = {
  title: 'America USA',
  bpm: 116,
  loopFrom: 8,
  reverb: 'hall',
  reverbMix: 0.7,
  delay: { beats: 0.75, feedback: 0.22, tone: 2600 },
  parts: {
    lead: { inst: 'trumpet', pan: 0.05, rev: 0.22, dly: 0.08, mml: join(rest(2), ['_v100'], STRAIN, CALLS, rest(16), DOG_HI) },
    trio: { inst: 'horn', pan: -0.1, rev: 0.28, mml: join(rest(34), ['_v100 _q95'], BROAD, rest(8)) },
    piccolo: { inst: 'flute', pan: 0.3, rev: 0.25, dly: 0.1, vol: 0.55, mml: join(rest(2), ['_v85'], up(STRAIN), rest(16), ['_v70'], obbligato(TRIO), ['_v90'], up(DOG_HI)) },
    low: { inst: 'trombone', pan: -0.3, rev: 0.2, vol: 0.9, mml: join(rest(18), ['_v100'], ANSWERS, rest(16), DOG_LO) },
    horns: { inst: 'horn', pan: -0.4, rev: 0.3, vol: 0.6, mml: join(rest(2), ['_v80 _q95'], guides(A), guides(B), rest(24)) },
    comp: { inst: 'brass', pan: 0.25, rev: 0.18, vol: 0.55, mml: join(['q3 _v80'], pahs(VAMP), pahs(ALL)) },
    bass: { inst: 'tuba', pan: 0, rev: 0.1, vol: 0.85, mml: join(['_v95 q6'], ooms(VAMP), ooms(ALL)) },
    pad: { inst: 'warmpad', pan: 0, rev: 0.35, vol: 0.45, mml: join(['_v70'], pads(VAMP), pads(ALL)) },
    drumsM: { inst: 'kick', drums: true, rev: 0.15, vol: 0.85, only: ['america'], mml: join(DRUMS_M) },
    drumsG: { inst: 'kick', drums: true, rev: 0.1, vol: 0.7, only: ['garage'], mml: join(DRUMS_G) },
    drumsS: { inst: 'kick', drums: true, rev: 0.1, vol: 0.6, only: ['security'], mml: join(DRUMS_S) },
    drumsT: { inst: 'kick', drums: true, rev: 0.12, vol: 0.7, only: ['ticket'], mml: join(DRUMS_T) },
    drumsB: { inst: 'kicksoft', drums: true, kit: 'brush', rev: 0.2, vol: 0.7, only: ['back'], mml: join(DRUMS_B) },
  },
  arrangements: {
    garage: {
      inst: { lead: 'vibes', trio: 'vibes', low: 'cleangtr', comp: 'epiano', bass: 'bass' },
      mute: ['piccolo', 'horns'],
      vol: { comp: 1.1, pad: 0.9, lead: 0.85 },
      rev: { lead: 0.4, trio: 0.4 },
      lowpass: 3800,
      level: 0.8,
    },
    security: {
      inst: { lead: 'clarinet', trio: 'clarinet', low: 'pizz', comp: 'pizz', bass: 'synthbass' },
      mute: ['piccolo', 'horns', 'pad'],
      vol: { comp: 1.2, bass: 0.7, lead: 0.9 },
      level: 0.8,
    },
    america: { mute: ['pad'] },
    ticket: {
      inst: { lead: 'piano', trio: 'piano', low: 'banjo', comp: 'piano' },
      mute: ['piccolo', 'horns', 'pad'],
      vol: { comp: 1.1, lead: 0.9 },
      rev: { lead: 0.15, comp: 0.15 },
      level: 0.85,
    },
    back: {
      inst: { lead: 'harmonica', trio: 'harmonica', low: 'nylongtr', comp: 'nylongtr', bass: 'upright', pad: 'slowstrings' },
      mute: ['piccolo', 'horns'],
      vol: { pad: 0.9, comp: 1.2, lead: 0.85 },
      rev: { lead: 0.35 },
      level: 0.75,
    },
  },
};
