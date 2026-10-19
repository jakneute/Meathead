// The jingles (each plays once).
//
// "VICTORY!" (jingle:victory): the VICTORY stamp. 164 to the quarter, so an eighth is the 11 frames between the
// letters' stamps (victory.ts). Heavy metal (the user's): power-chord stabs climbing D major (D5, E5, F#5, G5, A5, B5),
// one a letter, over palm-muted chugs on a low D pedal and double kick with the snare on every stab; a shred run into
// the Y, where it all lands on a big D5 (the crash and the china) and the lead's pinch-harmonic squeal bends up to the
// high D. Then it can't help itself: "shave and a haircut" chugged on the guitars and the toms, the "two" a power-chord
// stab and the "bits" a whammy dive-bomb two octaves down off a feeble splash. Eight beats: done as the letters' hold is.
//
// "NYAH NYAH" (jingle:death): his death. 140, eight beats: the muted trumpet and trombone's sad slide down (B-flat,
// A, A-flat, G, the last one wobbling and falling off), and before it's even finished the xylophone's playground taunt
// (D, B, E, D, B) over a tuba's oom-pah, a slapstick on the last one.

import type { Song } from '../engine';

export const VICTORY_JINGLE: Song = {
  title: 'VICTORY!',
  bpm: 164,
  once: true,
  reverb: 'plate',
  reverbMix: 0.7,
  parts: {
    power: { inst: 'powerchord', pan: 0.35, rev: 0.12, vol: 0.6, mml: 'q6 o2 _v85 d8 _v90 e8 _v96 f+8 _v102 g8 _v108 a8 _v114 b8 | q8 o3 _v127 d4. | q5 o2 _v110 d8 a16 a16 b8 a8 r8 !c+8 r8' },
    chug: { inst: 'chug', pan: -0.35, rev: 0.08, vol: 0.55, mml: 'o2 _v95 [d16]12 | q8 o2 _v120 d4. | q5 o2 _v105 d8 a16 a16 b8 a8 r8 !c+8 r8' },
    lead: { inst: 'distlead', pan: 0.1, rev: 0.25, dly: 0.12, vol: 0.55, mml: 'r4. o5 _v90 f+16 g16 a16 b16 >c+16 e16 | o6 _v122 _m80 _b-2 d4. | r2 r8 r8 | o5 _v120 _m0 _f-24/8 d8' },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.75, mml: 'q6 o1 _v100 d8 e8 f+8 g8 a8 b8 | q8 o1 _v120 d4. | q5 o1 _v105 d8 a16 a16 b8 a8 r8 !c+8 r8' },
    drums: { inst: 'kick', drums: true, rev: 0.2, vol: 0.75, mml: '_v100 {kx}16 k16 _v104 {ks}16 k16 _v108 {ks}16 k16 _v112 {ks}16 k16 _v118 {ks}16 k16 _v124 {ks}16 k16 | _v127 {kx(china)}4. | _v110 {kt}8 t16 t16 {k(tom3)}8 {k(tom4)}8 r8 | _v120 {ks}8 _v85 {k(splash)}8' },
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
