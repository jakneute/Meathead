// The jingles (each plays once).
//
// "VICTORY!" (jingle:victory): the VICTORY stamp. Orchestra hits, Turtles in Time's stage clear's way (the user's):
// 160 to the quarter, fourteen beats (5.25 s). A bar of lead-in first, before a letter's down (victory.ts waits for
// it): the hits going DUN, DUN-DUN, and the big Konami cadence (A-flat, B-flat) with the snare's roll into the
// letters. Then a hit a letter, on the eighths, the chords climbing (C, D, E, F, G, A major) with the trumpets and the
// timpani on them and the snare on every one; a beat's breath (the trumpets' run, the strings' sweep, the snare roll)
// and the Y on the next bar's one: the biggest hit, high C, the crash. Then the cadence again, smaller (A-flat,
// A-flat, B-flat), and the last hit, the china, the trombone too pleased with itself and falling off it. The hits are
// `orchstab` (the bank's big early-90s one) doubled an octave down on `orchhit`. Its beats are the letters': change
// one, change victory.ts's STAMP_AT and LEAD.
//
// "NYAH NYAH" (jingle:death): his death. 140, eight beats: the muted trumpet and trombone's sad slide down (B-flat,
// A, A-flat, G, the last one wobbling and falling off), and before it's even finished the xylophone's playground taunt
// (D, B, E, D, B) over a tuba's oom-pah, a slapstick on the last one.

import type { Song } from '../engine';

export const VICTORY_JINGLE: Song = {
  title: 'VICTORY!',
  bpm: 160,
  length: 14,
  once: true,
  reverb: 'hall',
  reverbMix: 0.6,
  parts: {
    stab: { inst: 'orchstab', pan: 0, rev: 0.22, vol: 0.85, mml: 'o4 _v110 c8 r8 _v100 c16 c16 r8 _v108 a-8 r8 _v114 b-8 r8 | o4 _v100 c8 _v104 d8 _v108 e8 _v112 f8 _v116 g8 _v120 a8 r4 | o5 _v127 c4. r8 o4 _v110 a-8 r16 a-16 _v118 b-8 r8 | o5 _v127 c4 r4' },
    low: { inst: 'orchhit', pan: 0, rev: 0.18, vol: 0.55, mml: 'o3 _v110 c8 r8 _v100 c16 c16 r8 _v108 a-8 r8 _v114 b-8 r8 | o3 _v100 c8 _v104 d8 _v108 e8 _v112 f8 _v116 g8 _v120 a8 r4 | o4 _v127 c4. r8 o3 _v110 a-8 r16 a-16 _v118 b-8 r8 | o4 _v127 c4 r4' },
    trumpet: { inst: 'trumpet', pan: 0.2, rev: 0.25, vol: 0.6, mml: 'q6 o5 _v105 c8 r8 c16 c16 r8 o4 a-8 r8 b-8 _v95 a16 b16 | q6 o5 _v105 c8 d8 e8 f8 g8 a8 _v95 f16 g16 a16 b16 | q7 o6 _v127 _m40 c4. r8 o5 _v110 _m0 a-8 r16 a-16 b-8 r8 | q8 o6 _v127 _m50 c4 r4' },
    brass: { inst: 'brass', pan: -0.2, rev: 0.25, vol: 0.55, mml: 'q6 o4 _v105 c8 r8 c16 c16 r8 o3 a-8 r8 b-8 _v95 a16 b16 | q6 o4 _v105 c8 d8 e8 f8 g8 a8 _v95 f16 g16 a16 b16 | q7 o5 _v127 c4. r8 o4 _v110 a-8 r16 a-16 b-8 r8 | q8 o5 _v127 c4 r4' },
    strings: { inst: 'strings', pan: 0, rev: 0.3, vol: 0.5, mml: 'r1 | r2. o5 _v90 c32 d32 e32 f32 g32 a32 b32 >c32 | o6 _v120 c4. r8 r2 | o6 _v120 c4 r4' },
    timpani: { inst: 'timpani', pan: 0, rev: 0.2, vol: 0.8, mml: 'o2 _v115 c8 r8 c16 c16 r8 a-8 r8 b-8 r8 | o2 _v105 c8 d8 e8 f8 g8 a8 _v80 [g32]8 | o3 _v127 c4. r8 o2 _v110 a-8 r16 a-16 b-8 r8 | o3 _v127 c4 r4' },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.65, mml: 'q6 o2 _v110 c8 r8 c16 c16 r8 o1 a-8 r8 b-8 r8 | q6 o2 _v105 c8 d8 e8 f8 g8 a8 o1 g8 g8 | q7 o2 _v120 c4. r8 o1 a-8 r16 a-16 b-8 r8 | q8 o2 _v120 c4 r4' },
    trombone: { inst: 'trombone', pan: -0.1, rev: 0.25, vol: 0.7, mml: 'r1 | r1 | r1 | o3 _v110 _f-12/8 c4 r4' },
    drums: { inst: 'kick', drums: true, rev: 0.2, vol: 0.75, mml: '_v120 {kx}8 r8 _v105 {ks}16 {ks}16 r8 _v110 {ks}8 r8 _v115 {ks}8 _v90 s32 _v100 s32 _v110 s32 _v120 s32 | _v105 {ks}8 _v108 {ks}8 _v111 {ks}8 _v114 {ks}8 _v117 {ks}8 _v120 {ks}8 _v95 s16 _v105 s16 _v115 s16 _v125 s16 | _v127 {kx}4. r8 _v110 {ks}8 r16 {ks}16 _v118 {ks}8 r8 | _v127 {kx(china)}4 r4' },
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
