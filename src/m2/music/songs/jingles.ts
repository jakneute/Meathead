// The jingles (each plays once).
//
// "VICTORY!" (jingle:victory): the VICTORY stamp. 164 to the quarter, so an eighth is the 11 frames between the
// letters' stamps (victory.ts): seven brass stabs climbing D major's scale (D, Em, F#m, G, G#dim7, A7), one a letter,
// the big D (the orchestra hit, the crash, the trumpet up to the high A) on the Y. Then it can't help itself: the
// xylophone's "shave and a haircut", and the "two bits" are a trombone and a tuba blowing a raspberry (both falling off
// the note). Eight beats: done as the letters' hold is.
//
// "NYAH NYAH" (jingle:death): his death. 140, eight beats: the muted trumpet and trombone's sad slide down (B-flat,
// A, A-flat, G, the last one wobbling and falling off), and before it's even finished the xylophone's playground taunt
// (D, B, E, D, B) over a tuba's oom-pah, a slapstick on the last one.

import type { Song } from '../engine';

export const VICTORY_JINGLE: Song = {
  title: 'VICTORY!',
  bpm: 164,
  once: true,
  reverb: 'hall',
  reverbMix: 0.8,
  parts: {
    brass: { inst: 'brass', pan: -0.1, rev: 0.25, vol: 0.9, mml: 'o4 _v70 {d f+ a}8 _v78 {e g b}8 _v86 {f+ a >c+}8 _v94 {g b >d}8 _v102 {g+ b >d f}8 _v110 {a >c+ e g}8 _v125 o4 {a >d f+ a}4. r2. r8' },
    trumpet: { inst: 'trumpet', pan: 0.1, rev: 0.25, mml: 'o5 _v80 a8 b8 >c+8 d8 f8 g8 _v120 _m40 a4. r2. r8' },
    strings: { inst: 'strings', pan: 0, rev: 0.35, vol: 0.8, mml: 'r2. o4 _v110 {f+ a >d f+}4. r2. r8' },
    hit: { inst: 'orchhit', pan: 0, rev: 0.3, vol: 0.8, mml: 'r2. o4 _v120 d4 r4 r2 r4' },
    timpani: { inst: 'timpani', pan: -0.2, rev: 0.3, mml: 'o2 _v80 d8 e8 f+8 g8 g+8 a8 o3 _v120 d4. r8 r4 r4 o2 _v110 a8 o3 d8' },
    xylo: { inst: 'xylophone', pan: 0.3, rev: 0.2, vol: 0.8, mml: 'r1 r8 o6 _v105 d8 <a16 a16 b8 a8 r8 r4' },
    trombone: { inst: 'trombone', pan: -0.3, rev: 0.2, mml: 'r1 r2. o2 _v120 !c+8 _f-6 d8' },
    tuba: { inst: 'tuba', pan: 0, rev: 0.12, mml: 'o2 _v90 d8 e8 f+8 g8 g+8 a8 o1 _v120 d4. r8 r4 r4 o2 !c+8 _f-6 o1 d8' },
    drums: { inst: 'kick', drums: true, rev: 0.2, vol: 0.8, mml: '_v70 s8 _v78 s8 _v86 s8 _v94 s8 _v102 s8 _v110 s8 _v127 {kx}4. r8 r4 r4 _v100 k8 _v127 {kx}8' },
  },
};

export const DEATH_JINGLE: Song = {
  title: 'Nyah Nyah',
  bpm: 140,
  once: true,
  reverb: 'room',
  reverbMix: 0.9,
  parts: {
    mute: { inst: 'mutetrumpet', pan: 0.1, rev: 0.25, mml: 'o4 _v100 b-4 a4 a-4 _m70 _f-3/4 g4. r8 r2.' },
    trombone: { inst: 'trombone', pan: -0.15, rev: 0.25, vol: 0.85, mml: 'o3 _v90 b-4 a4 a-4 _f-5/4 g4. r8 r2.' },
    xylo: { inst: 'xylophone', pan: 0.25, rev: 0.2, mml: 'r1 o5 _v105 d4 <b8 >e8 d4 <b4' },
    tuba: { inst: 'tuba', pan: 0, rev: 0.12, vol: 0.85, mml: 'r1 o2 _v95 g4 d4 g4 o1 _f-5/4 g4' },
    drums: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.2, vol: 0.8, mml: 'r1 _v100 k4 e8 e8 k4 _v120 a4' },
  },
};
