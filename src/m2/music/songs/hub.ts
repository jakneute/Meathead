// "ROUND AND ROUND": the hub (Happy Hub: the big roundabout with the lands' portals round it, walked round and round).
// Once a carousel waltz; the Mega Man pass (the user's: "it sounds too cutesy overall. give it more of a high energy
// mega man vibe") makes it the stage select: the merry-go-round's tune (up to the A and its chromatic under-neighbour,
// the figure a step up, the sequence down) straightened into a driving 4/4 on a square lead, its harmony a third under
// it, a singing lead guitar on the middle, sixteenth arpeggios, power chords, the bass pumping octaves, a rock kit with
// a fill into every section.
//
// F major, 160, straight. 34 bars: a 2-bar C7 build (once: the arpeggio climbing, a snare roll), then the 32-bar loop:
//   A   (8)  the hook: F - Gm C7 - C7 - F - F7 - Bb Bbm6 (the minor-six wink: D-flat, C, B-flat) - F/C D7 - G7 C7.
//   A2  (8)  the hook harmonized, the arpeggios in, home to F.
//   B   (8)  the middle in D-flat (the flat six: a sidestep): the lead guitar's tune, the square a third over it;
//            Db - Ebm7 Ab7 - Db Bbm - Gb Ab7 - Gb Gbm6 - Db Bb7 - Ebm7 Ab7, sliding down a half step, D-flat to C7.
//   T   (8)  the whole band: the hook harmonized over the sixteenth-hat kit, the brass, the strings.
//
// ARRANGEMENTS: main (all of it); cutscene (under the hub's scenes: the tune on a horn, slow strings, the bass). And
// one per spot round the plaza (cues.ts picks by the one he's nearest, 'main' between them, crossfading as he walks):
// the same tune in that land's colors, a preview of its theme:
//   adventure  the lead guitar, a pan flute on the harmony, marimba arpeggios, congas and taiko
//   spooky     the rock organ, a harpsichord's arpeggios, the violin on the middle, the pipe organ's chords, a clock
//   space      the saw lead, FM-piano arpeggios, synth bass, a PWM pad, bongos
//   hollywood  the studio: trumpets, the brass section, the timpani
//   foreign    the sitar, a koto's arpeggios, a tambourine
//   frontier   the harmonica, banjo arpeggios, a steel guitar on the middle, the woodblocks galloping
//   cartoon    a harmon trumpet, xylophone sixteenths, an alto sax on the middle, brass stabs, cowbell and woodblocks
//   fantasy    the violin, harp arpeggios, the choir, a triangle
//   america    America USA's band: trumpets, horns, the snare's ruffs
//   staff      the staff room's: the FM piano, a clavinet, slap bass

import type { Song } from '../engine';
import { type Bar, bars as barsOf } from './jungle';
import { scale, harm, pump, arp16, riff, stabs, BEAT, BEAT16, MM2, FILL, FILL2, FILL_BIG, ROLL_UP, sec } from './mega';

const join = (...parts: string[][]) => parts.flat().join(' | ');
const rest = (n: number) => Array.from({ length: n }, () => 'r1');
const rep = (bar: string, n: number) => Array.from({ length: n }, () => bar);
/** A chord from notes with their octaves ('4f', '5c+'), lowest first. */
const ch = (ns: string[], len: string) => {
  let o = Number(ns[0][0]);
  let s = `o${o} {`;
  for (const n of ns) { const no = Number(n[0]); s += '>'.repeat(no - o) + n.slice(1) + ' '; o = no; }
  return `${s.trim()}}${len}`;
};

// The chords: voicings (around o4), and the bass's root
const V: Record<string, string[]> = {
  F: ['4f', '4a', '5c'], 'F/C': ['4f', '4a', '5c'], F7: ['4f', '4a', '5e-'], Gm: ['4g', '4b-', '5d'], C7: ['4e', '4g', '4b-'],
  Bb: ['4f', '4b-', '5d'], Bbm6: ['4f', '4g', '4b-', '5d-'], D7: ['4f+', '4a', '5c'], G7: ['4f', '4g', '4b', '5d'],
  Db: ['4f', '4a-', '5d-'], Ebm7: ['4g-', '4b-', '5d-'], Ab7: ['4g-', '5c', '5e-'], Bbm: ['4f', '4b-', '5d-'], Gb: ['4g-', '4b-', '5d-'],
  Gbm6: ['4g-', '4a', '5d-', '5e-'], Bb7: ['4f', '4a-', '5d'],
};
const R: Record<string, string> = {
  F: 'f', 'F/C': 'c', F7: 'f', Gm: 'g', C7: 'c', Bb: 'b-', Bbm6: 'b-', D7: 'd', G7: 'g', Db: 'd-', Ebm7: 'e-', Ab7: 'a-', Bbm: 'b-', Gb: 'g-',
  Gbm6: 'g-', Bb7: 'b-',
};
const root = (c: string) => R[c];
const INTRO: Bar[] = ['C7', 'C7'];
const A: Bar[] = ['F', ['Gm', 'C7'], 'C7', 'F', 'F7', ['Bb', 'Bbm6'], ['F/C', 'D7'], ['G7', 'C7']];
const A2: Bar[] = [...A.slice(0, 7), ['C7', 'F']];
const B: Bar[] = ['Db', ['Ebm7', 'Ab7'], ['Db', 'Bbm'], ['Gb', 'Ab7'], ['Gb', 'Gbm6'], ['Db', 'Bb7'], ['Ebm7', 'Ab7'], ['Db', 'C7']];
const LOOP: Bar[] = [...A, ...A2, ...B, ...A2];
const FM = scale('f', 'major'), DB = scale('d-', 'major');
const pads = (prog: Bar[]) => barsOf(prog, (c, b) => ch(V[c], b === 4 ? '1' : '2'));

// ---- The tunes ----

/** The hook: up to the A and its chromatic under-neighbour, the figure a step up, the sequence down. */
const HOOK = [
  'o5 a4 g+8 a8 r8 >c8 <a4', 'o5 g4 f+8 g8 r8 b-8 g4', 'o5 e4 d+8 e8 r8 g8 >c4', 'o5 a2. f8 g8',
  'o5 a4 g+8 a8 r8 >c8 e-4', 'o6 d2 d-4 c8 <b-8', 'o5 a4 >c8 <f8 r8 f+8 a4', 'o5 g8 b8 >d4 c4 <b-4',
];
/** The second time, home to F. */
const HOOK2 = [...HOOK.slice(0, 7), 'o5 g4 e4 f2'];
/** The middle, in D-flat (the lead guitar's). */
const MIDDLE = [
  'o5 f2 f8 a-8 >d-4', 'o5 b-2 a-8 g-8 e-4', 'o5 f2 f8 d-8 <b-4', 'o5 d-4. e-8 c4. e-8',
  'o5 g-4. f8 e-8 d-8 <a4', 'o4 a-8 >d-8 f4 a-2', 'o5 g-4. f8 e-4. c8', 'o5 d-2 c8 e8 g4',
];

// ---- The kit ----
const DRUMS = [
  '_v55 s16 s16 s16 s16 _v70 s16 s16 s16 s16 _v85 s16 s16 s16 s16 _v100 s16 s16 s16 s16', ROLL_UP,
  '_v100', ...sec(BEAT, 8, FILL), ...sec(BEAT, 8, FILL2), ...sec(MM2, 8, FILL), '_v108', ...sec(BEAT16, 8, FILL_BIG),
];
/** The lands' own percussion: a bar each, the whole way (each only in its arrangements). */
const land = (bar: string, v = 90) => join([`_v${v}`], rep(bar, 34));

export const HUB: Song = {
  title: 'Round and Round',
  bpm: 160,
  loopFrom: 8,
  reverb: 'hall',
  reverbMix: 0.55,
  delay: { beats: 0.75, feedback: 0.22, tone: 2800 },
  parts: {
    lead: { inst: 'squarelead', pan: 0, rev: 0.18, dly: 0.12, mml: join(rest(2), ['_v108'], HOOK, HOOK2, ['_v98'], harm(MIDDLE, DB, 2), ['_v112'], HOOK2) },
    harmony: { inst: 'squarelead', pan: 0.35, rev: 0.18, dly: 0.1, vol: 0.48, not: ['cutscene'], mml: join(rest(10), ['_v95'], harm(HOOK2, FM, -2), rest(8), harm(HOOK2, FM, -2)) },
    guitar: { inst: 'distlead', pan: -0.25, rev: 0.22, dly: 0.12, vol: 0.62, not: ['cutscene'], mml: join(rest(18), ['_v105'], MIDDLE, rest(8)) },
    arp: { inst: 'clav', pan: 0.4, rev: 0.15, dly: 0.1, vol: 0.32, not: ['cutscene'], mml: join(['_v85'], arp16(INTRO, c => V[c], 0), rest(8), arp16([...A2, ...B, ...A2], c => V[c], 0)) },
    brass: { inst: 'synthbrass', pan: 0.2, rev: 0.2, vol: 0.45, not: ['cutscene'], mml: join(['_v90 _e50 _e127/1^1'], pads(INTRO), ['_v100'], stabs(A, c => V[c], '! . . x . x . x'), stabs(A2, c => V[c], '! . . x . x . x'), ['_v85'], pads(B), ['_v108'], stabs(A2, c => V[c], '! . . x . x . x')) },
    power: { inst: 'powerchord', pan: -0.4, rev: 0.08, vol: 0.45, not: ['cutscene'], mml: join(['_v105'], riff(INTRO, root, 'x x x x x x x x'), riff(LOOP, root, '! x . x x . x x')) },
    bass: { inst: 'bass', pan: 0, rev: 0.04, vol: 0.85, mml: join(['_v100'], pump([...INTRO, ...LOOP], root)) },
    strings: { inst: 'strings', pan: 0, rev: 0.35, vol: 0.38, mml: join(['_v70'], pads(INTRO), ['_v55'], pads(A), ['_v65'], pads(A2), ['_v80'], pads(B), ['_v90'], pads(A2)) },
    choir: { inst: 'choir', pan: 0, rev: 0.4, vol: 0.45, only: ['fantasy', 'hollywood', 'spooky'], mml: join(rest(18), ['_v85'], pads(B), pads(A2)) },
    timpani: { inst: 'timpani', pan: -0.15, rev: 0.3, vol: 0.6, only: ['hollywood', 'america', 'main'], mml: join(['o2 _v50 [c32]8 _v70 [c32]8 _v90 [c32]8 _v110 [c32]8', 'o2 _v115 c4 r2.'], ['o2 _v110 f4 r2.'], rest(7), ['o2 f4 r2.'], rest(7), ['o2 d-4 r2.'], rest(6), ['o2 _v60 [c32]8 _v80 [c32]8 _v100 [c32]8 _v120 [c32]8'], ['o2 f4 r2.'], rest(7)) },
    drums: { inst: 'kick', drums: true, rev: 0.1, vol: 0.78, not: ['cutscene'], mml: join(DRUMS) },
    // (the lands' own percussion: each only in its arrangements)
    hand: { inst: 'congahi', drums: true, pan: 0.3, rev: 0.18, vol: 0.6, only: ['adventure'], mml: land('c16 c16 d8 ?c8 c8 d8 c16 c16 d8 d8') },
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.7, only: ['adventure'], mml: land('f4 r8 f8 f4 f8 f8') },
    tick: { inst: 'woodblock', drums: true, kit: 'orchestra', pan: -0.3, rev: 0.35, vol: 0.45, only: ['spooky'], mml: land('e8 (woodblocklo)8 e8 (woodblocklo)8 e8 (woodblocklo)8 e8 (woodblocklo)8', 85) },
    bongo: { inst: 'bongohi', drums: true, pan: 0.4, rev: 0.18, vol: 0.5, only: ['space'], mml: land('b16 b16 (bongolo)8 b8 (bongolo)8 b16 b16 (bongolo)8 b8 (bongolo)8') },
    tamb: { inst: 'tamb', drums: true, pan: 0.35, rev: 0.15, vol: 0.5, only: ['foreign', 'america'], mml: land('j8 ?j8 j8 ?j8 j8 ?j8 j16 j16 ?j8') },
    clip: { inst: 'woodblock', drums: true, kit: 'orchestra', pan: -0.3, rev: 0.2, vol: 0.5, only: ['frontier'], mml: land('e8 (woodblocklo)16 (woodblocklo)16 e8 (woodblocklo)16 (woodblocklo)16 e8 (woodblocklo)16 (woodblocklo)16 e8 (woodblocklo)16 (woodblocklo)16') },
    toon: { inst: 'woodblock', drums: true, kit: 'orchestra', pan: 0.3, rev: 0.18, vol: 0.55, only: ['cartoon'], mml: land('e8 e8 w8 e8 e16 e16 e8 w8 (slapstick)8') },
    tri: { inst: 'triangle', drums: true, kit: 'orchestra', pan: 0.35, rev: 0.35, vol: 0.45, only: ['fantasy'], mml: land('i8 ?i8 i8 ?i8 i8 ?i8 i8 i8', 80) },
    march: { inst: 'snare2', drums: true, kit: 'orchestra', rev: 0.18, vol: 0.55, only: ['america'], mml: land('s16 s16 s8 ?s8 s8 s16 s16 s8 ?s8 s8') },
  },
  arrangements: {
    main: {},
    // ---- Round the plaza (cues.ts hubArr): each spot's land ----
    adventure: { inst: { lead: 'distlead', harmony: 'panflute', guitar: 'distlead', arp: 'marimba', brass: 'brass' }, vol: { lead: 0.8, harmony: 1.3, arp: 1.3 } },
    spooky: { inst: { lead: 'organ', harmony: 'organ', guitar: 'violin', arp: 'harpsichord', brass: 'churchorgan', strings: 'churchorgan' }, vol: { lead: 1.15, arp: 1.3, strings: 0.6, brass: 0.7, guitar: 1.1 }, rev: { lead: 0.3, guitar: 0.35 } },
    space: { inst: { lead: 'sawlead', harmony: 'sawlead', guitar: 'theremin', arp: 'fmpiano', bass: 'synthbass', strings: 'pwm' }, vol: { arp: 1.4, bass: 0.75, guitar: 1.1 } },
    hollywood: { inst: { lead: 'trumpet', harmony: 'trumpet', guitar: 'horn', brass: 'brass' }, vol: { lead: 1.1, harmony: 1.1, timpani: 1.3, strings: 1.2 } },
    foreign: { inst: { lead: 'sitar', harmony: 'koto', guitar: 'shamisen', arp: 'koto' }, vol: { lead: 1.2, arp: 1.3, harmony: 1.2 } },
    frontier: { inst: { lead: 'harmonica', harmony: 'harmonica', guitar: 'steelgtr', arp: 'banjo' }, vol: { arp: 1.3, harmony: 0.8, guitar: 1.2 } },
    cartoon: { inst: { lead: 'mutetrumpet', harmony: 'trumpet', guitar: 'sax', arp: 'xylophone', brass: 'brass' }, vol: { lead: 1.2, arp: 1.2, harmony: 0.9 } },
    fantasy: { inst: { lead: 'violin', harmony: 'flute', guitar: 'violin', arp: 'harp', brass: 'horn' }, vol: { lead: 1.2, arp: 1.4, harmony: 1.2, strings: 1.3 }, rev: { lead: 0.35, guitar: 0.35 } },
    america: { inst: { lead: 'trumpet', harmony: 'trumpet', guitar: 'horn', brass: 'brass' }, vol: { lead: 1.1, harmony: 1.1, guitar: 1.1 } },
    staff: { inst: { lead: 'fmpiano', harmony: 'fmpiano', guitar: 'distlead', bass: 'slapbass', brass: 'synthbrass', strings: 'pwm' }, vol: { lead: 1.3, harmony: 1.2, bass: 0.85 }, level: 0.9 },
    cutscene: {
      solo: ['lead', 'strings', 'bass'],
      inst: { lead: 'horn', strings: 'slowstrings' },
      vol: { strings: 0.75, bass: 0.55 },
      rev: { lead: 0.4 },
      level: 0.75,
    },
  },
};
