// "WALK IT OFF": the walk-away (after the boss, Meathead walking at the camera, the wreck burning away behind him, his
// head down over his new toy: Mega Man 2's ending walk). The Mega Man pass (the user's: "give it more of a high energy
// mega man vibe"): a hard-rock strut, the cool-guys-don't-look-at-explosions walk with the band behind it: a singing
// lead guitar that knows it did good (scooping up into its notes, falling off them), a square lead a third under it the
// second time round, power chords stabbing the soul changes, the rock organ, the bass pumping octaves, a rock kit with
// a fill every four bars.
//
// A-flat major, 132, straight. 18 bars: a 2-bar Eb7sus swell (once: the organ and the strings rising, the snare roll),
// then the 16-bar loop: Abmaj9 - Cm7 F7 - Bbm9 - Eb13 - Dbmaj9 - Dbm6 (the minor four: the soul) - Cm7 F7 - Bbm7 Eb7;
// again, with the A-flat 7 to the four, the long climb (Cm7, F7) and home, an Eb7sus turnaround into the top.
//
// Each boss's walk-away gets its own colour (one arrangement each; `walkaway:<boss>` is the song with only that one, so
// the walk-away after him plays it):
//   main     the lead guitar (any walk-away without its own)
//   artie    Safari Artie: the trumpet on the tune, congas
//   donnie   Donnie Dracula: the pipe organ on the tune, a harpsichord's arpeggios, the choir for the organ
//   queen    the space queen: the supersaw, synth bass, a PWM pad, FM arpeggios, a 909 four-on-the-floor
//   steve    Stuntman Steve: the keytar (a saw lead), clavinet stabs, slap bass
//   harry    Helicopter Harry: synth brass on the tune, the sitar answering
//   tucker   Tucker: a twangy clean guitar through the delay (Morricone's), a steel guitar, harmonica for the square

import type { Song } from '../engine';
import { scale, harm, pump, arp16, riff, BEAT, FILL, FILL2, X } from './mega';

const join = (...parts: string[][]) => parts.flat().join(' | ');
const rest = (n: number) => Array.from({ length: n }, () => 'r1');
const rep = (bar: string, n: number) => Array.from({ length: n }, () => bar);
const up = (bars: string[]) => bars.map(b => b.replace(/o(\d)/g, (_, n) => `o${Number(n) + 1}`));
const ch = (ns: string[], len: string) => {
  let o = Number(ns[0][0]);
  let s = `o${o} {`;
  for (const n of ns) { const no = Number(n[0]); s += '>'.repeat(no - o) + n.slice(1) + ' '; o = no; }
  return `${s.trim()}}${len}`;
};

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
const root = (c: string) => R[c][0].slice(1);
const SWELL: Bar[] = ['Eb7sus', 'Eb7sus'];
const LOOP: Bar[] = [
  'Abmaj7', ['Cm7', 'F7'], 'Bbm7', 'Eb7', 'Dbmaj7', 'Dbm6', ['Cm7', 'F7'], ['Bbm7', 'Eb7'],
  'Abmaj7', 'Ab7', 'Dbmaj7', 'Dbm6', 'Cm7', 'F7', ['Bbm7', 'Eb7'], ['Abmaj7', 'Eb7sus'],
];
const each = (prog: Bar[], full: (c: string) => string, half: (a: string, b: string) => string) => prog.map(b => (typeof b === 'string' ? full(b) : half(b[0], b[1])));
const pads = (prog: Bar[]) => each(prog, c => ch(V[c], '1'), (a, b) => `${ch(V[a], '2')} ${ch(V[b], '2')}`);
/** Stabs: the one, the and of two pushed, four. */
const stabs = (prog: Bar[]) => each(prog,
  c => `!${ch(V[c], '8')} r8 r8 ${ch(V[c], '8')} r4 ${ch(V[c], '8')} r8`,
  (a, b) => `!${ch(V[a], '8')} r8 r8 ${ch(V[a], '8')} !${ch(V[b], '8')} r8 ${ch(V[b], '8')} r8`);

/** The tune (an octave up for the lead guitar). */
const TUNE = up([
  'o3 r8 a-8 >c8 e-8 _b-1 g2', 'o4 g8 f8 e-8 c8 a4 r4', 'o4 r8 d-8 f8 a-8 _b-1 >c2', 'o5 c8 <b-8 g8 e-8 _f-3 d-2',
  'o4 c4. <a-8 f4 a-4', 'o3 b-4. a-8 e4 d-4', 'o3 e-4 g4 a4 >c4', 'o4 d-4. c8 <b-4 g4',
  'o3 r8 a-8 >c8 e-8 _b-1 g2', 'o4 g-8 f8 e-8 c8 _b-1 e-4 r4', 'o4 f4. a-8 >c4 <a-4', 'o4 b-4. a-8 e4 d-4',
  'o4 g4. a-8 b-4 >c4', 'o5 c2 o4 a4 o5 e-4', 'o5 d-4 c4 <b-4 g4', 'o4 _f-4/4 a-2 r2',
]);
/** The key (the square's harmony, a third under the tune the second time round). */
const AB = scale('a-', 'major');

const FLOOR = 'k8 o8 {kp}8 o8 k8 o8 {kp}8 {ho}8';
const CONGA = 'c8 ?c8 d8 c8 ?c8 c8 d8 ?d8';

export const WALKAWAY: Song = {
  title: 'Walk It Off',
  bpm: 132,
  loopFrom: 8,
  reverb: 'hall',
  reverbMix: 0.65,
  delay: { beats: 0.75, feedback: 0.3, tone: 2600 },
  parts: {
    lead: { inst: 'distlead', pan: 0, rev: 0.22, dly: 0.15, vol: 0.8, mml: join(['r1', '_v95 o4 r2 r8 e-8 f8 g8'], ['_v110'], TUNE) },
    harmony: { inst: 'squarelead', pan: 0.35, rev: 0.2, dly: 0.1, vol: 0.42, mml: join(rest(10), ['_v95'], harm(TUNE.slice(8), AB, -2)) },
    organ: { inst: 'organ', pan: -0.3, rev: 0.2, vol: 0.42, mml: join(['_v85 _e30 _e127/1^1'], pads(SWELL), ['_v75'], pads(LOOP)) },
    stabs: { inst: 'synthbrass', pan: 0.25, rev: 0.2, vol: 0.4, mml: join(rest(2), ['_v100'], stabs(LOOP)) },
    power: { inst: 'powerchord', pan: -0.4, rev: 0.08, vol: 0.42, mml: join(['_v100 o2 e-1', 'o2 e-8 e-8 e-8 e-8 e-8 e-8 e-8 e-8'], ['_v105'], riff(LOOP, root, '! - - x . x x .')) },
    arp: { inst: 'clav', pan: 0.45, rev: 0.15, dly: 0.12, vol: 0.28, mml: join(rest(10), ['_v85'], arp16(LOOP.slice(8), c => V[c], 0)) },
    bass: { inst: 'bass', pan: 0, rev: 0.04, vol: 0.85, mml: join(['_v100 o2 e-1', 'o2 e-8 e-8 o3 e-8 o2 e-8 e-8 e-8 o1 b-8 a8'], ['_v100'], pump(LOOP, root)) },
    strings: { inst: 'strings', pan: 0.05, rev: 0.35, vol: 0.38, mml: join(['_v70 _e30 _e127/1^1'], pads(SWELL), ['_v65'], pads(LOOP)) },
    drums: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.8, not: ['queen'],
      mml: join(['r1', '_v60 s16 s16 s16 s16 _v80 s16 s16 s16 s16 _v100 s16 s16 (tom1)16 (tom1)16 (tom3)8 (tom4)8'], ['_v100'], [X(BEAT), BEAT, BEAT, FILL, X(BEAT), BEAT, BEAT, FILL2, X(BEAT), BEAT, BEAT, FILL, X(BEAT), BEAT, BEAT, FILL2]),
    },
    congas: { inst: 'congahi', drums: true, pan: 0.3, rev: 0.2, vol: 0.7, only: ['artie'], mml: join(rest(2), ['_v90'], rep(CONGA, 16)) },
    floor: { inst: '909kick', drums: true, kit: '909', rev: 0.15, vol: 0.75, only: ['queen'], mml: join(['r1', '_v80 p16 p16 p16 p16 p16 p16 p16 p16 {kp}4 {kp}4'], ['_v100'], rep(FLOOR, 16)) },
  },
  arrangements: {
    main: {},
    artie: { inst: { lead: 'trumpet', harmony: 'trumpet' }, vol: { lead: 1.05, harmony: 1.1 }, rev: { lead: 0.28 } },
    donnie: { inst: { lead: 'churchorgan', harmony: 'organ', arp: 'harpsichord', organ: 'choir' }, vol: { organ: 0.9, lead: 1.0, arp: 1.3 }, rev: { lead: 0.4 } },
    queen: { inst: { lead: 'supersaw', harmony: 'sawlead', bass: 'synthbass', organ: 'pwm', arp: 'fmpiano', stabs: 'strings' }, vol: { lead: 0.95, bass: 0.75, arp: 1.3 } },
    steve: { inst: { lead: 'sawlead', arp: 'clav', bass: 'slapbass', stabs: 'synthbrass' }, vol: { lead: 1.0, arp: 1.3 } },
    harry: { inst: { lead: 'synthbrass', harmony: 'sitar', organ: 'organslow' }, vol: { lead: 1.1, harmony: 1.3 } },
    tucker: { inst: { lead: 'cleangtr', harmony: 'harmonica', arp: 'steelgtr', organ: 'organslow' }, vol: { harmony: 1.0, arp: 1.3 }, rev: { lead: 0.32 } },
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
