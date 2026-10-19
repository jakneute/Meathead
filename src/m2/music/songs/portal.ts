// "HEADING IN": the walk into a land through its portal (portalWalk.ts: about seven and a half seconds: the swirl goes
// white, he walks up the way in, HEADING TO <LAND>, the iris closes). It plays once: a whoosh (a harp glissando up two
// octaves, the strings and the choir swelling out of nothing, a timpani roll, the crash as the white comes) and then a
// fanfare as he walks: up to the F-sharp, the flat six and flat seven (B-flat, C: the heroic sidestep), home to a big D
// with the trumpet on the high D, held as the iris closes.
//
// D major, 128, 4 bars (16 beats: the walk's length). Each land's walk gets its own colour (one arrangement each;
// `portal:<land>` is the song with only that one):
//   main        the orchestra (any land without its own)
//   adventure   pan flute on the fanfare, congas under it
//   spooky      the pipe organ, a harpsichord for the harp, the choir up, a gong
//   space       the theremin, synth brass, an FM-piano glissando, PWM for the horns
//   hollywood   the studio fanfare: the main, the timpani and the choir pushed
//   foreign     accordion, a koto for the harp
//   frontier    harmonica, a steel guitar for the harp, banjo for the brass

import type { Song } from '../engine';

const join = (...bars: string[]) => bars.join(' | ');

export const PORTAL: Song = {
  title: 'Heading In',
  bpm: 128,
  once: true,
  reverb: 'hall',
  reverbMix: 1,
  delay: { beats: 0.75, feedback: 0.25, tone: 3000 },
  parts: {
    lead: { inst: 'trumpet', pan: 0, rev: 0.28, dly: 0.12, mml: join('o4 r2 _v100 a8. a16 >d8. e16', 'o5 f+4. e8 d8 e8 f+8 a8', 'o5 b-4. a8 g4. a8', 'o5 a8 b8 _v115 o6 d2.') },
    brass: { inst: 'brass', pan: -0.15, rev: 0.28, vol: 0.75, mml: join('r1', 'o4 _v95 {d f+ a}4. {d f+ a}8 {d f+ a}2', 'o4 {d f b-}4. {d f b-}8 o4 {e g >c}4. {e g >c}8', 'o4 _v105 {f+ a >d}1') },
    horns: { inst: 'horn', pan: -0.35, rev: 0.3, vol: 0.7, mml: join('r1', 'o4 _v90 a1', 'o4 f2 g2', 'o4 f+1') },
    strings: { inst: 'strings', pan: 0.1, rev: 0.4, vol: 0.85, mml: join('o4 _v100 _e10 _e127/2 {a >d f+}2 {a >d f+}2', 'o4 {a >d f+ a}1', 'o4 {b- >d f b-}2 o5 {c e g >c}2', 'o4 _e127 _e70/1 {a >d f+ a}1') },
    choir: { inst: 'choir', pan: 0, rev: 0.5, vol: 0.6, mml: join('o4 _v90 _e0 _e127/2 {d a >d}2 {d a >d}2', 'r1', 'r1', 'o4 {d f+ a >d}1') },
    harp: { inst: 'harp', pan: 0.3, rev: 0.4, vol: 0.75, mml: join('o3 _v85 d32 e32 f+32 g32 a32 b32 >c+32 d32 e32 f+32 g32 a32 b32 >c+32 d32 e32 r2', 'o4 d8 f+8 a8 >d8 f+8 a8 >d8 r8', 'o4 b-8 >d8 f8 b-8 o4 c8 e8 g8 >c8', 'o4 d16 f+16 a16 >d16 f+16 a16 >d16 f+16 a2') },
    tuba: { inst: 'tuba', pan: 0, rev: 0.12, vol: 0.8, mml: join('r1', 'o2 _v95 d2. o1 a4', 'o1 b-2 o2 c2', 'o2 d1') },
    timpani: { inst: 'timpani', pan: -0.2, rev: 0.3, mml: join('o2 _v40 [a32]8 _v70 [a32]8 _v110 d4 r4', 'o2 d4 r2.', 'o2 b-4 r4 o3 c4 r4', 'o2 _v60 [d32]8 _v90 [d32]8 _v120 d4 r4') },
    glock: { inst: 'glock', pan: 0.35, rev: 0.35, dly: 0.2, vol: 0.55, mml: join('r1', 'r1', 'r1', 'o6 _v90 d8 f+8 a8 >d8 r2') },
    drums: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.25, vol: 0.8, mml: join('r2 _v100 x4 r4', '_v85 k4 s8. s16 k4 s8. s16', 'k4 s8. s16 k4 s16 s16 s16 s16', '_v120 {kx}4 r2.') },
    congas: { inst: 'congahi', drums: true, pan: 0.3, rev: 0.2, vol: 0.7, only: ['adventure'], mml: join('r1', '_v90 c8 ?c8 d8 c8 ?c8 c8 d8 ?d8', 'c8 ?c8 d8 c8 c16 c16 d8 d8 d8', '{cd}4 r2.') },
    gong: { inst: 'gong', drums: true, kit: 'orchestra', rev: 0.4, vol: 0.7, only: ['spooky'], mml: join('r2 _v100 g4 r4', 'r1', 'r1', '_v110 g4 r2.') },
  },
  arrangements: {
    main: {},
    adventure: { inst: { lead: 'panflute', harp: 'marimba' }, vol: { lead: 1.1 } },
    spooky: { inst: { lead: 'churchorgan', harp: 'harpsichord', brass: 'churchorgan' }, vol: { choir: 1.3, lead: 0.8, brass: 0.6 }, rev: { lead: 0.45 } },
    space: { inst: { lead: 'theremin', brass: 'synthbrass', harp: 'fmpiano', horns: 'pwm', choir: 'oohs' }, vol: { lead: 1.1 } },
    hollywood: { vol: { timpani: 1.3, choir: 1.25, strings: 1.1 } },
    foreign: { inst: { lead: 'accordion', harp: 'koto' } },
    frontier: { inst: { lead: 'harmonica', harp: 'steelgtr', brass: 'banjo' }, vol: { brass: 0.9 } },
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
