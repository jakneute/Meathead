// The jingles (each plays once).
//
// "VICTORY!" (jingle:victory): the VICTORY stamp, heavy metal (the user's: "make the victory theme more heavy metal
// like"). 150 to the quarter (an eighth's 12 frames exactly, so every letter's the same distance after the last),
// thirteen beats (5.2 s), in E. A bar of lead-in before a letter's down (victory.ts waits for it): the open E power
// chord rung out with the crash and an orchestra hit, a pinch-harmonic squeal scooped up an octave over two beats of
// palm-muted sixteenths on the double kick, and the Konami cadence (C, D) on hits. Then a hit a letter on the eighths
// (V I C T O R Y), the riff climbing E G A B-flat B D E with an orchestra hit and a power chord on every one, the
// double kick galloping under, the crash on the Y. Then a beat of shred (a sextuplet run down) over the chugs, the
// cadence on hits again with a tom fill, and the last stab: the big E rung out three beats, the crash and the china,
// the lead's high E whammied down two octaves in its last beat (the letters fade with it: victory.ts). The hits are
// `orch2`, THE orchestra hit (bank/melodic.ts). Its beats are the letters': change one, change victory.ts's LEAD_BEATS.
//
// "NYAH NYAH" (jingle:death): his death. 160, eight beats: the square lead diving down a chromatic sixteenth run while
// the power chords fall a half step at a time (B-flat, A, A-flat, G, the last one falling off), then the playground
// taunt (D, B, E, D, B) on the square and the lead guitar in octaves over the rock kit, the china and a slapstick on
// the last one.

import type { Song } from '../engine';

export const VICTORY_JINGLE: Song = {
  title: 'VICTORY!',
  bpm: 150,
  length: 13,
  once: true,
  reverb: 'room',
  reverbMix: 0.5,
  parts: {
    // (THE orchestra hit on every chord change, the last stab the loudest)
    hit: { inst: 'orch2', pan: 0, rev: 0.2, vol: 0.8, mml: 'o4 _v124 e8 r8 r2 _v116 c8 _v120 d8 | o4 _v110 e8 _v112 g8 _v114 a8 _v116 b-8 _v118 b8 o5 _v122 d8 _v127 e8 r8 | r4 o4 _v120 c8 _v124 d8 | o4 _v127 e8 r8 r2' },
    // (the open chords, rung out on the hits)
    power: { inst: 'powerchord', pan: -0.3, rev: 0.08, vol: 0.6, mml: 'q8 o2 _v127 e4 r2 _v118 c8 _v122 d8 | q7 o2 _v112 e8 _v114 g8 _v116 a8 _v118 b-8 _v120 b8 o3 _v122 d8 _v127 e4 | r4 q7 o2 _v120 c8 _v124 d8 | q8 o2 _v127 e2.' },
    // (palm mutes, chugged under the squeal and the shred)
    chug: { inst: 'chug', pan: 0.3, rev: 0.04, vol: 0.55, mml: 'r4 o2 [_v118 e16 _v100 e16]4 r4 | r1 | o2 [_v118 e16 _v100 e16]2 r4 | r2.' },
    // (the lead: the pinch squeal, the riff an octave up, the shred, the whammy dive)
    lead: { inst: 'distlead', pan: 0.15, rev: 0.18, dly: 0.08, vol: 0.5, mml: 'r4 o6 _v112 _m80 _b-12/16 e4. r8 r4 | q6 _m0 o4 _v100 e8 g8 a8 b-8 b8 o5 d8 q8 _v115 _m40 e4 | _m0 o6 _v118 e24 d24 o5 b24 a24 g24 e24 _v120 c8 d8 | o6 _v127 _m70 _f-24/4 e2.' },
    bass: { inst: 'bass', pan: 0, rev: 0.04, vol: 0.6, mml: 'q7 o1 _v118 e4 [e16]8 _v115 c8 d8 | o1 e8 g8 a8 b-8 b8 o2 d8 e4 | o1 [e16]4 c8 d8 | q8 o1 _v120 e2.' },
    // (double kick under it all, the snare on the beats and the hits, crashes on the E's)
    drums: { inst: 'kick', drums: true, rev: 0.15, vol: 0.85, mml: '_v127 {kx}4 _v105 [{ks}16 k16 k16 k16]2 _v118 {ks}8 {ks}8 | _v110 [{ks}16 _v95 k16]6 _v127 {kxs}4 | _v100 [k16]4 _v120 {ks}16 (tom2)16 {k(tom4)}16 (tom4)16 | _v127 {kx(china)}4 r2' },
  },
};

export const DEATH_JINGLE: Song = {
  title: 'Nyah Nyah',
  bpm: 160,
  once: true,
  reverb: 'room',
  reverbMix: 0.7,
  parts: {
    dive: { inst: 'squarelead', pan: 0, rev: 0.2, dly: 0.12, vol: 0.8, mml: 'o6 _v115 b-16 a16 a-16 g16 o6 _v110 a16 a-16 g16 f+16 _v105 a-16 g16 f+16 f16 _v100 g16 f+16 f16 e16 | o5 _v115 d4 o4 b8 o5 e8 d4 o4 _f-12/4 b4' },
    guitar: { inst: 'distlead', pan: -0.25, rev: 0.18, vol: 0.55, mml: 'o4 _v110 b-4 a4 a-4 _f-7/4 g4 | o4 _v110 d4 o3 b8 o4 e8 d4 o3 _f-12/4 b4' },
    power: { inst: 'powerchord', pan: 0.35, rev: 0.08, vol: 0.5, mml: 'o2 _v120 !b-8 b-8 a8 a8 a-8 a-8 _f-12/4 g4 | o2 _v115 g8 r8 g8 r8 g4 o1 _f-7/4 g4' },
    bass: { inst: 'bass', pan: 0, rev: 0.04, vol: 0.8, mml: 'o2 _v115 b-8 b-8 a8 a8 a-8 a-8 g8 g8 | o2 _v110 g8 g8 d8 d8 g4 o1 _f-5/4 g4' },
    drums: { inst: 'kick', drums: true, rev: 0.15, vol: 0.8, mml: '_v120 {kx}8 k8 {ks}8 k8 {ks}8 k8 _v100 s16 s16 (tom2)16 (tom4)16 | _v115 {kx}4 {ks}8 s8 {ks}4 _v127 {kx(china)(slapstick)}4' },
  },
};
