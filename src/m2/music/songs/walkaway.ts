// "WALK IT OFF": the walk-away (after the boss, Meathead walking at the camera, the wreck burning away behind him, his
// head down over his new toy: Mega Man 2's ending walk). A slow 70s soul strut, the cool-guys-don't-look-at-explosions
// walk: a tenor sax that knows it did good (scooping up into its notes, falling off them), slow-Leslie organ, a clean
// guitar's chorused stabs, a bass that struts, a lazy backbeat, the strings swelling in behind.
//
// A-flat major, 84, straight (the hats' sixteenths pushed a little). 18 bars: a 2-bar Eb7sus swell (once), then the
// 16-bar loop: Abmaj9 - Cm7 F7 - Bbm9 - Eb13 - Dbmaj9 - Dbm6 (the minor four: the soul) - Cm7 F7 - Bbm7 Eb7; again,
// with the A-flat 7 to the four, the long climb (Cm7, F7) and home, an Eb7sus turnaround into the top.
//
// Each boss's walk-away gets its own colour (one arrangement each; `walkaway:<boss>` is the song with only that one, so
// the walk-away after him plays it):
//   main     the tenor sax (any walk-away without its own)
//   artie    Safari Artie: exotica: vibes on the tune, congas
//   donnie   Donnie Dracula: the pipe organ on the tune, harpsichord stabs, the choir for the organ, no kit
//   queen    the space queen: a saw lead, synth bass, PWM pad, FM stabs, a 909 four-on-the-floor
//   steve    Stuntman Steve: a distorted lead guitar, clavinet, slap bass
//   harry    Helicopter Harry: sitar and the fast Leslie
//   tucker   Tucker: a twangy clean guitar through the delay (Morricone's), a steel guitar, harmonica chords, upright

import type { Song } from '../engine';

const join = (...parts: string[][]) => parts.flat().join(' | ');
const rest = (n: number) => Array.from({ length: n }, () => 'r1');
const rep = (bar: string, n: number) => Array.from({ length: n }, () => bar);
const ch = (ns: string[], len: string) => {
  let o = Number(ns[0][0]);
  let s = `o${o} {`;
  for (const n of ns) { const no = Number(n[0]); s += '>'.repeat(no - o) + n.slice(1) + ' '; o = no; }
  return `${s.trim()}}${len}`;
};
const nt = (n: string, len: string) => `o${n[0]} ${n.slice(1)}${len}`;
const upv = (ns: string[]) => ns.map(n => String(Number(n[0]) + 1) + n.slice(1));

type Bar = string | [string, string];
// Rootless voicings (around o4), the bass's root and fifth
const V: Record<string, string[]> = {
  Abmaj7: ['4c', '4e-', '4g', '4b-'], Cm7: ['4e-', '4g', '4b-', '5d'], F7: ['4e-', '4a', '5c', '5d'], Bbm7: ['4d-', '4f', '4a-', '5c'],
  Eb7: ['4d-', '4f', '4g', '5c'], Eb7sus: ['4d-', '4f', '4a-', '4b-'], Dbmaj7: ['4f', '4a-', '5c', '5e-'], Dbm6: ['4e', '4a-', '4b-', '5d-'],
  Ab7: ['4c', '4e-', '4g-', '4b-'],
};
const R: Record<string, [string, string]> = {
  Abmaj7: ['1a-', '2e-'], Cm7: ['2c', '2g'], F7: ['2f', '2c'], Bbm7: ['1b-', '2f'], Eb7: ['2e-', '1b-'], Eb7sus: ['2e-', '1b-'],
  Dbmaj7: ['2d-', '2a-'], Dbm6: ['2d-', '2a-'], Ab7: ['1a-', '2e-'],
};
const SWELL: Bar[] = ['Eb7sus', 'Eb7sus'];
const LOOP: Bar[] = [
  'Abmaj7', ['Cm7', 'F7'], 'Bbm7', 'Eb7', 'Dbmaj7', 'Dbm6', ['Cm7', 'F7'], ['Bbm7', 'Eb7'],
  'Abmaj7', 'Ab7', 'Dbmaj7', 'Dbm6', 'Cm7', 'F7', ['Bbm7', 'Eb7'], ['Abmaj7', 'Eb7sus'],
];
const each = (prog: Bar[], full: (c: string) => string, half: (a: string, b: string) => string) => prog.map(b => (typeof b === 'string' ? full(b) : half(b[0], b[1])));
const pads = (prog: Bar[]) => each(prog, c => ch(V[c], '1'), (a, b) => `${ch(V[a], '2')} ${ch(V[b], '2')}`);
/** The guitar's stabs, an octave up: the and of 2's sixteenth push, 4. */
const stabs = (prog: Bar[]) => each(prog,
  c => `r4 ${ch(upv(V[c]), '8.')} ${ch(upv(V[c]), '16')} r4 ${ch(upv(V[c]), '8')} r8`,
  (a, b) => `r4 ${ch(upv(V[a]), '8.')} ${ch(upv(V[a]), '16')} r4 ${ch(upv(V[b]), '8')} r8`);
/** The strut: root, fifth, root, and the root again ahead of the next bar. */
const strut = (prog: Bar[]) => each(prog,
  c => `${nt(R[c][0], '4.')} ${nt(R[c][1], '8')} ${nt(R[c][0], '4')} r8 ${nt(R[c][0], '8')}`,
  (a, b) => `${nt(R[a][0], '4.')} ${nt(R[a][1], '8')} ${nt(R[b][0], '4.')} ${nt(R[b][1], '8')}`);

/** The sax's tune. */
const TUNE = [
  'o3 r8 a-8 >c8 e-8 _b-1 g2', 'o4 g8 f8 e-8 c8 a4 r4', 'o4 r8 d-8 f8 a-8 _b-1 >c2', 'o5 c8 <b-8 g8 e-8 _f-3 d-2',
  'o4 c4. <a-8 f4 a-4', 'o3 b-4. a-8 e4 d-4', 'o3 e-4 g4 a4 >c4', 'o4 d-4. c8 <b-4 g4',
  'o3 r8 a-8 >c8 e-8 _b-1 g2', 'o4 g-8 f8 e-8 c8 _b-1 e-4 r4', 'o4 f4. a-8 >c4 <a-4', 'o4 b-4. a-8 e4 d-4',
  'o4 g4. a-8 b-4 >c4', 'o5 c2 o4 a4 o5 e-4', 'o5 d-4 c4 <b-4 g4', 'o4 _f-4/4 a-2 r2',
];

const GROOVE = 'k8 h16 h16 {sh}8 h16 k16 h8 k8 {sh}8 h8';
const FILL = 'k8 h16 h16 {sh}8 h16 k16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom3)16 (tom4)8';
const CONGA = 'c8 ?c8 d8 c8 ?c8 c8 d8 ?d8';
const FLOOR = 'k8 o8 {kp}8 o8 k8 o8 {kp}8 {ho}8';

export const WALKAWAY: Song = {
  title: 'Walk It Off',
  bpm: 84,
  loopFrom: 8,
  reverb: 'hall',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.32, tone: 2400 },
  parts: {
    lead: { inst: 'tenorsax', pan: 0, rev: 0.25, dly: 0.12, mml: join(['r1', '_v80 o3 r2 r8 e-8 f8 g8'], ['_v95'], TUNE) },
    organ: { inst: 'organslow', pan: -0.3, rev: 0.25, vol: 0.55, mml: join(['_v80 _e30 _e127/1^1'], pads(SWELL), ['_v72'], pads(LOOP)) },
    gtr: { inst: 'cleangtr', pan: 0.35, rev: 0.2, cho: 0.4, vol: 0.55, mml: join(['q4 _v80'], rest(2), stabs(LOOP)) },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.85, mml: join(['_v92'], ['o2 e-1', 'o2 e-2. o1 b-4'], strut(LOOP)) },
    strings: { inst: 'slowstrings', pan: 0.05, rev: 0.4, vol: 0.55, mml: join(rest(6), ['_v75'], pads(LOOP.slice(4, 8)), rest(4), pads(LOOP.slice(12, 16))) },
    drums: {
      inst: 'kick', drums: true, rev: 0.25, vol: 0.75, swing: 0.3, grid: 16, not: ['donnie', 'queen'],
      mml: join(['r1', '_v70 r2 s16 s16 s16 s16 (tom1)8 (tom3)8'], ['_v90'], rep(GROOVE, 7), [FILL], rep(GROOVE, 7), [FILL]),
    },
    congas: { inst: 'congahi', drums: true, pan: 0.3, rev: 0.2, vol: 0.7, only: ['artie'], mml: join(rest(2), ['_v85'], rep(CONGA, 16)) },
    floor: { inst: '909kick', drums: true, kit: '909', rev: 0.15, vol: 0.7, only: ['queen'], mml: join(rest(2), ['_v95'], rep(FLOOR, 16)) },
  },
  arrangements: {
    main: {},
    artie: { inst: { lead: 'vibes' }, vol: { lead: 1.1 }, rev: { lead: 0.35 } },
    donnie: { inst: { lead: 'churchorgan', gtr: 'harpsichord', organ: 'choir', bass: 'cello', strings: 'strings' }, vol: { organ: 0.8, lead: 0.8 }, rev: { lead: 0.45 } },
    queen: { inst: { lead: 'sawlead', bass: 'synthbass', organ: 'pwm', gtr: 'fmpiano' }, vol: { lead: 0.75 } },
    steve: { inst: { lead: 'distlead', gtr: 'clav', bass: 'slapbass' }, vol: { lead: 0.7, gtr: 0.8 } },
    harry: { inst: { lead: 'sitar', organ: 'organ' }, vol: { lead: 0.95 } },
    tucker: { inst: { lead: 'cleangtr', gtr: 'steelgtr', organ: 'harmonica', bass: 'upright' }, vol: { organ: 0.5 }, rev: { lead: 0.35 } },
  },
};

/** The song with only one arrangement (a boss's walk-away). */
const onlyArr = (song: Song, arr: string, title: string): Song => ({ ...song, title, arrangements: { [arr]: song.arrangements![arr] } });
export const WALKAWAY_ARTIE = onlyArr(WALKAWAY, 'artie', 'Walk It Off (Safari Artie)');
export const WALKAWAY_DONNIE = onlyArr(WALKAWAY, 'donnie', 'Walk It Off (Donnie Dracula)');
export const WALKAWAY_QUEEN = onlyArr(WALKAWAY, 'queen', 'Walk It Off (the space queen)');
export const WALKAWAY_STEVE = onlyArr(WALKAWAY, 'steve', 'Walk It Off (Stuntman Steve)');
export const WALKAWAY_HARRY = onlyArr(WALKAWAY, 'harry', 'Walk It Off (Helicopter Harry)');
export const WALKAWAY_TUCKER = onlyArr(WALKAWAY, 'tucker', 'Walk It Off (Tucker)');
