// "HEADING IN": the walk into a land through its portal (portalWalk.ts: about seven and a half seconds: the swirl goes
// white, he walks up the way in, HEADING TO <LAND>, the iris closes). It plays once, Mega Man's READY at the stage's
// start (the user's: "give it more of a high energy mega man vibe"): a sixteenth arpeggio whooshing up two octaves over
// a snare roll, the crash as the white comes, then a fanfare riff as he walks: the square lead with its harmony a third
// under, power chords, the bass pumping, up through G and A, the flat six and flat seven (B-flat, C: the heroic
// sidestep) hit together, home to a big D on the high D, held as the iris closes.
//
// D major, 160, 5 bars (20 beats: the walk's length). Each land's walk gets its own colour (one arrangement each;
// `portal:<land>` is the song with only that one):
//   main        the band (any land without its own)
//   adventure   the lead guitar, a marimba for the arpeggio, congas and taiko
//   spooky      the rock organ, a harpsichord for the arpeggio, the choir up, a gong
//   space       the saw lead, the FM piano's arpeggio, synth bass
//   hollywood   the studio fanfare: trumpets, the brass, the timpani and the choir pushed
//   foreign     the synth brass on the tune, a koto's arpeggio
//   frontier    the harmonica, a steel guitar's arpeggio

import type { Song } from '../engine';
import { scale, harm, pump, arp16, riff, X, BEAT, FILL2 } from './mega';

const join = (...bars: string[]) => bars.join(' | ');
type Bar = string | [string, string];
const PROG: Bar[] = ['A', 'D', ['G', 'A'], ['Bb', 'C'], 'D'];
const VN: Record<string, string[]> = { A: ['4c+', '4e', '4a'], D: ['4d', '4f+', '4a'], G: ['4d', '4g', '4b'], Bb: ['4d', '4f', '4b-'], C: ['4e', '4g', '5c'] };
const RT: Record<string, string> = { A: 'a', D: 'd', G: 'g', Bb: 'b-', C: 'c' };
const root = (c: string) => RT[c];

/** The whoosh: up the A major chord two octaves and a bit in sixteenths. */
const WHOOSH = 'o3 a16 o4 c+16 o4 e16 o4 a16 o5 c+16 o5 e16 o5 a16 o6 c+16 o5 e16 o5 a16 o6 c+16 o6 e16 o6 a16 o6 e16 o6 c+16 o5 a16';
const TUNE = ['o4 r2 _v105 a8 a16 a16 o5 d8 e8', 'o5 !f+4. e8 d8 e8 f+8 a8', 'o5 b4. a8 g8 a8 b8 o6 c+8', 'o6 !d4 c8 o5 b-8 !o6 c4 o5 b-8 o6 c8', 'o6 !d2. r4'];
const DM = scale('d', 'mixolydian');

export const PORTAL: Song = {
  title: 'Heading In',
  bpm: 160,
  once: true,
  reverb: 'hall',
  reverbMix: 0.75,
  delay: { beats: 0.75, feedback: 0.25, tone: 3000 },
  parts: {
    lead: { inst: 'squarelead', pan: 0, rev: 0.22, dly: 0.12, mml: join(...TUNE) },
    harmony: { inst: 'squarelead', pan: 0.35, rev: 0.22, dly: 0.1, vol: 0.5, mml: join('r1', ...harm(TUNE.slice(1, 3), DM, -2), 'o5 !b-4 a8 f8 !g4 g8 g8', 'o5 !a2. r4') },
    arp: { inst: 'squarelead', pan: -0.3, rev: 0.25, dly: 0.15, vol: 0.38, mml: join(`_v95 ${WHOOSH}`, ...arp16(PROG.slice(1, 4), c => VN[c]), 'o5 _v100 d16 f+16 a16 o6 d16 f+16 a16 o6 d4. r4') },
    brass: { inst: 'synthbrass', pan: -0.15, rev: 0.25, vol: 0.55, mml: join('r1', 'o4 _v100 !{d f+ a}8 r8 r8 {d f+ a}8 r4 r8 {d f+ a}8', 'o4 !{d g b}8 r8 r8 {d g b}8 !{c+ e a}8 r8 r8 {c+ e a}8', 'o4 _v110 !{d f b-}4. {d f b-}8 !{e g >c}4. {e g >c}8', 'o4 _v115 {f+ a >d}1') },
    power: { inst: 'powerchord', pan: -0.4, rev: 0.08, vol: 0.5, mml: join('r1', ...riff(PROG.slice(1, 3), root, '! x . x x . x x'), 'o2 _v115 !b-4. b-8 o3 !c4. c8', 'o2 !d1') },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.85, mml: join('o2 _v100 a1', ...pump(PROG.slice(1, 4), root), 'o2 _v115 d4 r2.') },
    strings: { inst: 'strings', pan: 0.1, rev: 0.4, vol: 0.5, mml: join('o4 _v100 _e10 _e127/1 {a >c+ e}1', 'o4 {a >d f+ a}1', 'o4 {b >d g}2 {a >c+ e}2', 'o4 {b- >d f b-}2 o5 {c e g >c}2', 'o4 _e127 _e70/1 {a >d f+ a}1') },
    choir: { inst: 'choir', pan: 0, rev: 0.5, vol: 0.5, mml: join('r1', 'r1', 'r1', 'o4 _v90 _e60 _e127/2 {d f b-}2 {e g >c}2', 'o4 {d f+ a >d}1') },
    timpani: { inst: 'timpani', pan: -0.2, rev: 0.3, mml: join('o2 _v40 [a32]8 _v60 [a32]8 _v85 [a32]8 _v110 [a32]8', 'o2 _v115 d4 r2.', 'r1', 'o2 b-4. b-8 o3 c4. c8', 'o2 _v120 d4 r2.') },
    hit: { inst: 'orchstab', pan: 0, rev: 0.3, vol: 0.65, mml: join('r1', 'o4 _v110 d4 r2.', 'r1', 'o4 b-4. r8 o5 c4. r8', 'o4 _v120 d4 r2.') },
    drums: { inst: 'kick', drums: true, rev: 0.15, vol: 0.8, mml: join('_v50 s16 s16 s16 s16 _v65 s16 s16 s16 s16 _v85 s16 s16 s16 s16 _v105 s16 s16 (tom1)16 (tom4)16', `_v105 ${X(BEAT)}`, FILL2, '_v115 {kx}4. k8 {kx}4. {ks}8', '_v120 {kx}4 r2.') },
    congas: { inst: 'congahi', drums: true, pan: 0.3, rev: 0.2, vol: 0.7, only: ['adventure'], mml: join('r1', '_v95 c16 c16 d8 c8 d8 c16 c16 d8 c8 d8', 'c16 c16 d8 c8 d8 c16 c16 d8 d8 d8', '{cd}4. c8 {cd}4. d8', '{cd}4 r2.') },
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.75, only: ['adventure'], mml: join('r2 _v90 f8 f8 f8 f8', '_v110 f4 r4 f4 r4', 'f4 r4 f8 f8 f4', 'f4. f8 f4. f8', 'f4 r2.') },
    gong: { inst: 'gong', drums: true, kit: 'orchestra', rev: 0.4, vol: 0.7, only: ['spooky'], mml: join('r1', '_v100 g4 r2.', 'r1', 'r1', '_v115 g4 r2.') },
  },
  arrangements: {
    main: {},
    adventure: { inst: { lead: 'distlead', harmony: 'distlead', arp: 'marimba' }, vol: { lead: 0.75, harmony: 0.6 } },
    spooky: { inst: { lead: 'organ', harmony: 'organ', arp: 'harpsichord', brass: 'churchorgan' }, vol: { choir: 1.3, lead: 1.1, brass: 0.6, arp: 1.2 }, rev: { lead: 0.35 } },
    space: { inst: { lead: 'sawlead', harmony: 'sawlead', arp: 'fmpiano', bass: 'synthbass', strings: 'pwm' }, vol: { arp: 1.3, bass: 0.75 } },
    hollywood: { inst: { lead: 'trumpet', harmony: 'trumpet', brass: 'brass', arp: 'xylophone' }, vol: { timpani: 1.3, choir: 1.25, strings: 1.1, lead: 1.1 } },
    foreign: { inst: { lead: 'synthbrass', harmony: 'synthbrass', arp: 'koto' }, vol: { arp: 1.3 } },
    frontier: { inst: { lead: 'harmonica', harmony: 'harmonica', arp: 'steelgtr' }, vol: { arp: 1.4, harmony: 0.7 } },
  },
};

/** The song with only one arrangement (a land's walk in). */
const onlyArr = (song: Song, arr: string, title: string): Song => ({ ...song, title, arrangements: { [arr]: song.arrangements![arr] } });
export const PORTAL_ADVENTURE = onlyArr(PORTAL, 'adventure', 'Heading In (Jungle Land)');
export const PORTAL_SPOOKY = onlyArr(PORTAL, 'spooky', 'Heading In (Spooky Land)');
export const PORTAL_SPACE = onlyArr(PORTAL, 'space', 'Heading In (Future Land)');
export const PORTAL_HOLLYWOOD = onlyArr(PORTAL, 'hollywood', 'Heading In (Hollywood Land)');
export const PORTAL_FOREIGN = onlyArr(PORTAL, 'foreign', 'Heading In (Foreign Lands)');
export const PORTAL_FRONTIER = onlyArr(PORTAL, 'frontier', 'Heading In (Wilderness Land)');
