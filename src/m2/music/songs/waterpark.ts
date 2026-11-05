// THE WATER PARK, level 1 (the endgame's first: endgame/lot, endgame/park1): its own music, four new pieces (the
// owner's: "for stage 1, the 'before the gate' will play a muted version of the eventual song that plays. it
// currently plays space lands's music. it should be something else. changes tunes based on where you're at" and
// "something new": none of these borrow a note from another song).
//
// ---- "HAPPY WATERS AFTER DARK" (land:park1) ----
// The park at night, the aliens and the demons fighting over him, and still a water park: a Mega Man X night stage.
// The hook on a saw lead (the aliens' color) over power chords and a pumping synth bass, FM-piano sixteenths, synth
// brass; a B that turns sunny in the relative major (E-flat), the water-park fun: the tune on a steel drum, marimba
// sixteenths splashing under it, a glock's sparkle, a driving kit; A' with a square a third under the hook and the
// choir behind it; a C for the standoff (half time, the Neapolitan D-flat): a theremin calling (the aliens), a pipe
// organ and the choir answering (the demons), palm-muted sixteenths, taiko.
// Written in C minor, played in C-sharp minor (every pitched part tr +1), 164. 36 bars: a 4-bar intro (once), then
// A (8) B (8) A' (8) C (8).
// ARRANGEMENTS (cues.ts parkWants): gate (the lot outside the walls: the whole song muffled, quieter, thinner, as if
// heard over the fence; kicking the gate in crossfades it into the full song without losing its place), plaza (and
// main: the whole band), wipeout (the middle plaza between the tube rides: the hook on a distorted guitar, the B on a
// xylophone), descent (the slide down after the kid: the hook on trumpets, triumphant and dumb).
//
// ---- "TUBE STEAK" (seq:wp-tube) ----
// The tube rides, an autorunner: drum and bass at Mega Man speed. A breakbeat kit, a sixteenth synth-bass ostinato, a
// shaker, the hook on a distorted lead (an overdrive a third under it in A'), the FM piano skanking offbeats, a saw
// lead soaring in long notes over string sixteenths on B, a C breakdown on the Neapolitan B-flat with double kick,
// chugs and a theremin siren (the saucers shooting).
// Written in A minor, played in G minor (tr -2), 188. 34 bars: a 2-bar push-off (once), then A B A' C.
// ARRANGEMENTS: card (the controls card, sat in the tube: the bass, the kit, the shaker, low), main (THE BLACK HOLE),
// abyss (THE ABYSS, the second and meaner: the choir and a pipe organ in, the kit up).
//
// ---- "MOUNT EVEREST BUT BETTER" (seq:wp-everest) ----
// The climb: mock-epic, and it never stops rising. A French horn call over the wind (oohs), a gong, sleigh bells for the
// fake snow; the tune in D on the horns in half time, then up a whole step to E (the trumpets take it, the strings
// running sixteenths, the rock kit), up again to F-sharp (everything: the choir, brass stabs, the gallop), and a
// false summit (B-flat - C, timpani rolling) that drops it back to D to climb again.
// D major (then E, then F-sharp), 140. 32 bars: a 4-bar horn call (once), then S1 (8, D) S2 (8, E) S3 (8, F#) T (4).
// ARRANGEMENTS by the floor he's on (cues.ts): base (base camp to CAMP 1: no trumpets, choir or brass), camp (CAMP 2
// to CAMP 3: the trumpets in), death-zone (CAMP 4, THE DEATH ZONE: everything), hillary (THE HILLARY STEP, the refill
// before the summit's door: the thin air, hushed: the oohs, the strings, the horn, the timpani, the bass).
//
// ---- "FAMILY TREE (ONE BRANCH)" (boss:zorzarblax) ----
// The summit's kid, Zorblax and Zarblax's offspring: erratic, mutant, ridiculous. Polka-metal that can't keep time: bars
// of 7/8 lurching into 4/4 and 6/8, the chords jumping a tritone (B-flat to E) for no reason, whole-tone runs. The hook
// on a theremin (his mother's side) with a xylophone doubling it the second time (a toy), a tuba and the chugs
// oom-pahing, orchestra hits on every lurch; a B where it stops dead for a music box lullaby (Mom's) in 6/8, the
// band slamming in halfway; a C that's all double kick and chromatic chugs, the theremin screaming over the choir.
// B-flat major (and E), 192. A 4-bar intro (once: the theremin warbling, the hits), then A (57 eighths: 7 7 8 7 7 7 8 6)
// B (8 bars of 6/8) A' C (8 bars of 4/4).
// ARRANGEMENTS (cues.ts): intro (his intro: no kit, no chugs), main, tantrum (his last third, "I'M TELLING MOM": a
// cowbell in, the kit, the chugs, the theremin and the hits up), death (the theme on a music box alone).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, pat, pads, harm, scale, tp, sec, crash, troll, nm, tone, cx, KIT, FILL } from './mmkit';

// =====================================================================================================================
// HAPPY WATERS AFTER DARK (written in C minor: tr +1)

const P_IN: Bar[] = ['Cm', 'Cm', ['Ab', 'Bb'], 'G7'];
const P_A: Bar[] = ['Cm', 'Cm', 'Ab', 'Bb', 'Cm', 'Cm', ['Ab', 'Bb'], 'G7'];
const P_B: Bar[] = ['Eb', 'Bb', 'Cm', 'Ab', 'Eb', 'Bb', 'Ab', ['Fm', 'G7']];
const P_C: Bar[] = ['Cm', 'Db', 'Cm', 'Db', 'Ab', 'Ab', 'G7', 'G7'];
const P_ALL = [...P_A, ...P_B, ...P_A, ...P_C];

const P_HOOK = [
  'o5 c8 r16 c16 e-8 g8 r8 g8 f8 e-8', 'o5 d4 c8 o4 b8 o5 c2', 'o5 c8 r16 c16 e-8 a-8 r8 a-8 g8 f8', 'o5 g4. f8 d4 o4 b-4',
  'o5 c8 r16 c16 e-8 g8 r8 o6 c8 o5 b-8 g8', 'o5 b-8 a-8 g8 e-8 f4 g4', 'o5 a-8 g8 f8 e-8 d8 e-8 f8 g8', 'o5 b4. a-8 g2',
];
const P_FUN = [
  'o5 g8 b-8 o6 e-8 o5 b-8 g8 b-8 o6 e-4', 'o6 d8 c8 o5 b-8 f8 d4 f4', 'o5 e-8 g8 o6 c8 o5 g8 e-8 g8 o6 c4', 'o6 c8 o5 b-8 a-8 e-8 c4 e-4',
  'o5 g8 b-8 o6 e-8 o5 b-8 o6 g8 f8 e-4', 'o6 f8 e-8 d8 o5 b-8 o6 d4 f4', 'o6 e-4. c8 o5 a-4 o6 c4', 'o6 c8 o5 a-8 f8 a-8 b4 d4',
];
const P_THER_C = ['o5 g4. a-8 g2', 'r1', 'o5 g4. a-8 b2', 'r1', 'o6 c4. o5 b-8 a-2', 'o5 a-8 g8 f8 e-8 f2', 'o5 g1', 'o5 b2 o6 d2'];
const P_HARM = harm(P_HOOK, scale('c', 'harmonic'), -2);
const P_SWOOP = 'r2 o6 c4 o5 g4';

export const LAND_PARK1: Song = {
  title: 'Happy Waters After Dark',
  bpm: 164,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.3, tone: 3200 },
  parts: {
    lead: { inst: 'sawlead', tr: 1, pan: 0.05, rev: 0.25, dly: 0.16, vol: 0.62, mml: join(['_v108'], rest(3), ['r2. o5 _b-2 c4'], P_HOOK, rest(8), P_HOOK, rest(8)) },
    harm: { inst: 'squarelead', tr: 1, pan: -0.3, rev: 0.22, vol: 0.34, mml: join(['_v100'], rest(20), P_HARM, rest(8)) },
    fun: { inst: 'steeldrum', tr: 1, pan: 0.15, rev: 0.25, dly: 0.12, vol: 0.62, mml: join(['_v110'], rest(12), P_FUN, rest(16)) },
    mar: { inst: 'marimba', tr: 1, pan: -0.35, rev: 0.2, vol: 0.4, mml: join(['_v95'], rest(12), pat(P_B, "016 116 216 0'16 216 116 016 116", 55), rest(16)) },
    glock: { inst: 'glock', tr: 1, pan: 0.4, rev: 0.35, dly: 0.25, vol: 0.28, mml: join(['_v90'], rest(12), pat(P_B, "2'8 r8 r4 1'8 r8 r4", 72), rest(16)) },
    arp: { inst: 'fmpiano', tr: 1, pan: 0.3, rev: 0.22, dly: 0.15, vol: 0.36, mml: join(['_v92'], rest(4), pat(P_A, "016 116 216 0'16 216 116 016 116", 60), rest(8), pat(P_A, "016 116 216 0'16 216 116 016 116", 60), rest(8)) },
    ther: { inst: 'theremin', tr: 1, pan: -0.15, rev: 0.4, dly: 0.2, vol: 0.42, mml: join(['_g8 _v100'], ['r1', 'r2 o5 g2', 'o6 c1', 'o5 b2 g2'], rest(7), [P_SWOOP], rest(8), rest(7), [P_SWOOP], P_THER_C) },
    choir: { inst: 'choir', tr: 1, pan: 0, rev: 0.45, vol: 0.36, mml: join(['_v95'], rest(20), pads(P_A, 55), pads(P_C, 55)) },
    organ: { inst: 'churchorgan', tr: 1, pan: 0.2, rev: 0.45, vol: 0.32, mml: join(['_v100'], rest(28), pat(P_C, '!X4. X8 r4 X4', 48)) },
    power: { inst: 'powerchord', tr: 1, pan: -0.4, rev: 0.1, vol: 0.46, mml: join(['_v108'], ['r1', 'r1', 'o2 !a-4. a-8 !b-4. b-8', 'o2 !g2 g8 g8 g8 g8'], pat([...P_A, ...P_B, ...P_A], '!R8 R8 r8 R8 R8 r8 R8 R8', 36), pat(P_C, '!R2 R4. R8', 36)) },
    chug: { inst: 'chug', tr: 1, pan: 0.45, rev: 0.08, vol: 0.46, mml: join(['q5 _v110'], rest(28), pat(P_C, '!R16 R16 R16 R16 R16 R16 !R16 R16', 36)) },
    bass: { inst: 'synthbass', tr: 1, pan: 0, rev: 0.06, vol: 0.8, mml: join(['q6 _v110'], ['o2 c1', 'o2 c2 c4 c4'], pat(P_IN.slice(2), "R8 R8 R'8 R8 R8 R8 R'8 R8", 36), pat(P_ALL, "R8 R8 R'8 R8 R8 R8 R'8 R8", 36)) },
    brass: { inst: 'synthbrass', tr: 1, pan: -0.15, rev: 0.2, vol: 0.4, mml: join(['_v108'], rest(4), pat(P_A, '!X8 r8 r8 X8 r4 r8 X8', 60), rest(8), pat(P_A, '!X8 r8 r8 X8 r4 r8 X8', 60), rest(8)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.14, vol: 0.78,
      mml: join(['_v100'], ['{kx}4 r4 r2', 'r2 s16 s16 s16 s16 (tom1)16 (tom1)16 (tom4)16 (tom4)16', crash(KIT.mm), FILL.big],
        sec(8, KIT.mm, FILL.toms), sec(8, KIT.drive, FILL.snare), sec(8, KIT.mm, FILL.toms), sec(8, KIT.half, FILL.big)),
    },
    taiko: { inst: 'kick', drums: true, rev: 0.3, vol: 0.55, mml: join(['_v110'], rest(28), rep('f4 r4 f8 f8 r4', 7), ['f8 f8 f8 f8 !f4 !f4']) },
  },
  arrangements: {
    main: {},
    plaza: {},
    gate: { lowpass: 520, level: 0.5, mute: ['arp', 'harm', 'glock', 'ther', 'chug', 'mar', 'choir'], vol: { kit: 0.9, bass: 1.1 } },
    wipeout: { inst: { lead: 'distlead', fun: 'xylophone' }, vol: { lead: 0.72, fun: 0.85 } },
    descent: { inst: { lead: 'trumpet', harm: 'trumpet', fun: 'trumpet' }, mute: ['chug', 'organ', 'ther'], vol: { lead: 1.2, harm: 1.4 } },
  },
};

// =====================================================================================================================
// TUBE STEAK (written in A minor: tr -2)

const T_A: Bar[] = ['Am', 'Am', 'F', 'G', 'Am', 'Am', 'F', ['G', 'E7']];
const T_B: Bar[] = ['F', 'G', 'Em', 'Am', 'F', 'G', 'E7', 'E7'];
const T_C: Bar[] = ['Am', 'Bb', 'Am', 'Bb', 'Dm', 'Dm', 'E7', 'E7'];
const T_ALL = [...T_A, ...T_B, ...T_A, ...T_C];

const T_HOOK = [
  'o5 a8 a16 a16 o6 c8 o5 a8 o6 e8 d8 c8 o5 b8', 'o5 a4 e8 g8 a4 r4', 'o5 a8 a16 a16 o6 c8 o5 a8 o6 f8 e8 d8 c8', 'o6 d4 o5 b8 g8 b4 o6 d4',
  'o5 a8 a16 a16 o6 c8 o5 a8 o6 e8 g8 a8 e8', 'o6 d8 c8 o5 b8 a8 b4 e4', 'o6 c8 o5 a8 f8 a8 o6 c8 f8 e8 d8', 'o6 d4 o5 b4 g+4 e4',
];
const T_SOAR = ['o6 c2. o5 a4', 'o5 b2 o6 d2', 'o6 e2. d4', 'o6 c2 o5 a2', 'o6 f2. e4', 'o6 d2 g2', 'o6 g+2. f4', 'o6 e1'];
const T_HARM = harm(T_HOOK, scale('a', 'harmonic'), -2);
const BREAK = '{kh}16 ?h16 {kh}16 ?h16 {sh}16 ?h16 h16 ?s16 ?h16 ?s16 {kh}16 ?h16 {sh}16 ?h16 h16 ?s16';

export const SEQ_WP_TUBE: Song = {
  title: 'Tube Steak',
  bpm: 188,
  loopFrom: 8,
  reverb: 'room',
  reverbMix: 0.7,
  delay: { beats: 0.75, feedback: 0.25, tone: 3000 },
  parts: {
    lead: { inst: 'distlead', tr: -2, pan: 0.1, rev: 0.18, dly: 0.12, vol: 0.55, mml: join(['_v110'], ['r1', 'r2. o5 _b-3 a4'], T_HOOK, rest(8), T_HOOK, rest(8)) },
    harm: { inst: 'overdrive', tr: -2, pan: -0.3, rev: 0.16, vol: 0.4, mml: join(['_v100'], rest(18), T_HARM, rest(8)) },
    saw: { inst: 'sawlead', tr: -2, pan: 0.05, rev: 0.3, dly: 0.2, vol: 0.5, mml: join(['_v105'], rest(10), T_SOAR, rest(16)) },
    str: { inst: 'strings', tr: -2, pan: -0.2, rev: 0.3, vol: 0.34, mml: join(['_v95'], rest(10), pat(T_B, "016 116 216 0'16", 57), rest(16)) },
    fm: { inst: 'fmpiano', tr: -2, pan: 0.35, rev: 0.2, vol: 0.34, mml: join(['_v100'], rest(2), pat(T_A, 'r8 X8 r8 X8 r8 X8 r8 X8', 57), rest(8), pat(T_A, 'r8 X8 r8 X8 r8 X8 r8 X8', 57), rest(8)) },
    ther: { inst: 'theremin', tr: -2, pan: 0.25, rev: 0.4, dly: 0.25, vol: 0.36, mml: join(['_g4 _v100'], rest(26), rep('o5 a2 o6 d+2', 7), ['o6 e1']) },
    power: { inst: 'powerchord', tr: -2, pan: -0.4, rev: 0.1, vol: 0.44, mml: join(['_v108'], ['r1', 'o2 !a4 r4 !a4 a8 a8'], pat(T_A, '!R8 R8 R8 R8 !R8 R8 R8 R8', 33), pat(T_B, '!R4. R8 r8 R8 R4', 33), pat(T_A, '!R8 R8 R8 R8 !R8 R8 R8 R8', 33), rest(8)) },
    chug: { inst: 'chug', tr: -2, pan: 0.45, rev: 0.08, vol: 0.46, mml: join(['q5 _v112'], rest(26), pat(T_C, '!R16 R16 R16 R16 !R16 R16 R16 R16', 33)) },
    bass: { inst: 'synthbass', tr: -2, pan: 0, rev: 0.05, vol: 0.78, mml: join(['q6 _v112'], ['o2 a1', "o2 a16 a16 a16 a16 o3 a16 a16 a16 a16 o2 a16 a16 o3 a16 a16 o2 a16 a16 o3 a16 a16"], pat(T_ALL, "R16 R16 R'16 R16", 33)) },
    shk: { inst: 'shaker', drums: true, pan: 0.3, rev: 0.1, vol: 0.35, mml: join(['_v90'], rep('z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16', 34)) },
    choir: { inst: 'choir', tr: -2, rev: 0.45, vol: 0.34, only: ['abyss'], mml: join(['_v100'], rest(2), pads(T_ALL, 57)) },
    organ: { inst: 'churchorgan', tr: -2, pan: -0.15, rev: 0.4, vol: 0.3, only: ['abyss'], mml: join(['_v100'], rest(2), pat(T_ALL, '!X8 r8 r8 X8 r4 X4', 45)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.8,
      mml: join(['_v100'], ['_v60 ' + FILL.roll, '_v105 ' + FILL.big], sec(8, BREAK, FILL.toms), sec(8, KIT.mm, FILL.snare), sec(8, BREAK, FILL.toms), sec(8, KIT.dbl, FILL.big)),
    },
  },
  arrangements: {
    main: {},
    card: { solo: ['bass', 'kit', 'shk'], vol: { kit: 0.55 }, level: 0.8 },
    abyss: { vol: { kit: 1.1, lead: 1.05 } },
  },
};

// =====================================================================================================================
// MOUNT EVEREST BUT BETTER (D, then E, then F-sharp)

const NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PCN: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/** A chord symbol moved k semitones (its root and its bass). */
const trSym = (sym: string, k: number) => sym.replace(/([A-G])([#b]?)/g, (_, l: string, a: string) => NOTE[(PCN[l] + (a === '#' ? 1 : a === 'b' ? -1 : 0) + k + 120) % 12]);
const trProg = (prog: Bar[], k: number): Bar[] => prog.map(b => (typeof b === 'string' ? trSym(b, k) : [trSym(b[0], k), trSym(b[1], k)]));

const E_S: Bar[] = ['D', 'A/C#', 'Bm', 'G', 'D', 'G', 'A7sus', 'A7'];
const E_S2 = trProg(E_S, 2), E_S3 = trProg(E_S, 4);
const E_T: Bar[] = ['Bb', 'C', 'Bb', 'C'];
const E_CLIMB = [...E_S, ...E_S2, ...E_S3];

const E_M = ['o4 a4 o5 d4. e8 f+4', 'o5 e2 c+4 o4 a4', 'o4 b4 o5 d4. e8 f+4', 'o5 g2. f+8 e8', 'o5 f+4 a4. g8 f+4', 'o5 g4 b4. a8 g4', 'o5 a2 d4 e4', 'o5 c+2 e2'];
const E_TM = ['o5 d1', 'o5 e1', 'o5 f1', 'o5 g2 e2'];
const E_CALL = ['o4 a2 o5 d2', 'o5 e1', 'o4 a2 o5 d4 e4', 'o5 f+1'];

export const SEQ_WP_EVEREST: Song = {
  title: 'Mount Everest But Better',
  bpm: 140,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 1,
  delay: { beats: 1.5, feedback: 0.25, tone: 2600 },
  parts: {
    horn: { inst: 'horn', pan: -0.1, rev: 0.4, vol: 0.62, mml: join(['_v110'], E_CALL, E_M, harm(tp(E_M, 2), scale('e', 'major'), -2), harm(tp(E_M, 4), scale('f+', 'major'), -2), E_TM) },
    trumpet: { inst: 'trumpet', pan: 0.15, rev: 0.32, vol: 0.5, mml: join(['_v112'], rest(12), tp(E_M, 2), tp(E_M, 4), up(E_TM)) },
    oohs: { inst: 'oohs', pan: 0, rev: 0.5, vol: 0.34, mml: join(['_e20 _e110/1^1 _v90'], ['o4 {d a}1', 'o4 {d a}1', 'o4 {e a}1', 'o4 {d a}1'], pads(E_CLIMB, 57), pads(E_T, 57)) },
    choir: { inst: 'choir', rev: 0.45, vol: 0.4, mml: join(['_v105'], rest(20), pads(E_S3, 57), pads(E_T, 57)) },
    str: { inst: 'strings', pan: 0.25, rev: 0.35, vol: 0.36, mml: join(['_v100'], rest(4), pads(E_S, 50), pat([...E_S2, ...E_S3], "016 116 216 0'16", 62), pads(E_T, 55)) },
    brass: { inst: 'brass', pan: -0.25, rev: 0.3, vol: 0.4, mml: join(['_v110'], rest(20), pat(E_S3, '!X8 r8 r8 X8 r4 X4', 55), pat(E_T, '!X4 r4 X4 X4', 55)) },
    power: { inst: 'powerchord', pan: -0.4, rev: 0.12, vol: 0.42, mml: join(['_v105'], rest(12), pat([...E_S2, ...E_S3], '!R8 R8 r8 R8 R8 r8 R8 R8', 38), pat(E_T, '!R4 r4 !R4 R8 R8', 34)) },
    bass: { inst: 'bass', pan: 0, rev: 0.08, vol: 0.75, mml: join(['q6 _v108'], rep('o2 d1', 4), pat(E_S, 'R4. R8 R2', 38), pat([...E_S2, ...E_S3], "R8 R8 R'8 R8 R8 R8 R'8 R8", 38), pat(E_T, "R8 R8 R'8 R8 R8 R8 R'8 R8", 34)) },
    timp: { inst: 'timpani', rev: 0.4, vol: 0.5, mml: join(['_v105'], ['r1', 'r1', 'r1', troll('o2 a')], pat(E_S, 'R4 r4 R4 r4', 38), rest(16), [troll('o2 b-'), troll('o2 c'), troll('o2 b-'), troll('o3 c')]) },
    sleigh: { inst: 'sleigh', drums: true, pan: 0.35, rev: 0.25, vol: 0.3, mml: join(['_v90'], rest(4), rep('y4 y4 y4 y4', 8), rep('y8 y8 y8 y8 y8 y8 y8 y8', 20)) },
    gong: { inst: 'gong', drums: true, kit: 'orchestra', rev: 0.5, vol: 0.45, mml: join(['_v110'], ['g1', 'r1', 'r1', 'r1', 'g1'], rest(27)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.16, vol: 0.76,
      mml: join(['_v100'], ['r1', 'r1', 'r1', FILL.roll], sec(8, KIT.half, FILL.toms), sec(8, KIT.rock, FILL.snare), sec(8, KIT.gallop, FILL.big), [crash(KIT.dbl), KIT.dbl, KIT.dbl, FILL.roll]),
    },
  },
  arrangements: {
    main: {},
    base: { mute: ['trumpet', 'choir', 'brass'], vol: { kit: 0.85 } },
    camp: { mute: ['choir'] },
    'death-zone': { vol: { choir: 1.15, kit: 1.1, brass: 1.1 } },
    hillary: { solo: ['oohs', 'str', 'horn', 'timp', 'bass'], level: 0.72 },
  },
};

// =====================================================================================================================
// FAMILY TREE (ONE BRANCH) (B-flat major, and E: bars of 7/8, 4/4, 6/8 as they come)

/** n eighths held. */
const held8 = (n: number) => Array.from({ length: n }, () => '8').join('^');
/** Oom-pah in eighths (the root, the fifth), n of them. */
const oom = (sym: string, n: number, lo: number) => Array.from({ length: n }, (_, i) => nm(tone(sym, i % 2 ? 2 : 0, lo), '8', i === 0 ? '!' : '')).join(' ');
/** The chugs: the root in eighths, accented on the groups. */
const chugs = (sym: string, n: number, lo: number) => Array.from({ length: n }, (_, i) => nm(tone(sym, 0, lo), '8', i % 2 === 0 ? '!' : '')).join(' ');
const KB: Record<number, string> = {
  7: '{kh}8 {sh}8 {kh}8 {sh}8 {kh}8 h8 {sh}8',
  8: '{kh}8 {sh}8 {kh}8 {sh}8 {kh}8 {sh}8 {kh}8 {sh}8',
  6: '{kh}8 h8 {sh}8 {kh}8 h8 {sh}8',
};
const Z_AM = [7, 7, 8, 7, 7, 7, 8, 6];
const Z_A = ['Bb', 'Bb', 'E', 'Bb', 'Gm', 'Eb', 'E', 'F7'];
const Z_B = ['Bb', 'Gm', 'Eb', 'F', 'Bb', 'Gm', 'Cm', 'F7'];
const Z_C = ['Bb5', 'Bb5', 'E5', 'E5', 'Bb5', 'B5', 'C5', 'F5'];
const Z_BM = rep(6, 8), Z_CM = rep(8, 8);
const Z_HOOK = [
  'o5 b-8 o6 d8 f8 r8 e8 d8 o5 b-8', 'o6 c8 d8 c8 o5 b-8 a8 b-4', 'o5 g+8 b8 o6 e8 g+8 b4 a+4', 'o6 f8 e8 d8 c8 o5 b-8 a-8 g-8',
  'o5 g8 b-8 o6 d8 r8 d8 e-8 d8', 'o6 e-8 d8 c8 o5 b-8 g8 b-4', 'o5 e8 f+8 g+8 a+8 o6 c8 d8 e4', 'o6 f4 e-8 c8 o5 a8 f8',
];
const Z_LULL = ['o6 d4 f8 d4 c8', 'o5 b-4. a8 g8 a8', 'o5 b-4 o6 e-8 d4 c8', 'o6 c4. o5 a4.', 'o6 d4 f8 b-4 a8', 'o6 g4. f8 e-8 d8', 'o6 e-4 c8 o5 g4 a8', 'o6 c2.'];
const Z_SCREAM = ['o5 b-2 o6 e2', 'o6 b-2 o5 e2', 'o5 e1', 'o6 e1', 'o5 b-4 b4 o6 c4 c+4', 'o6 d1', 'o6 e-1', 'o6 f2 o5 f2'];
const Z_IN = ['o5 b-2 o6 e2', 'o5 b-2 o6 e2', 'o6 f2 o5 b2', 'o6 b-1'];
/** A section's bars from its chords and meters. */
const zbars = (chords: string[], meters: number[], f: (c: string, n: number) => string) => chords.map((c, i) => f(c, meters[i]));
const zrest = (meters: number[]) => meters.map(n => `r${held8(n)}`);
const zkit = (meters: number[], first = true) => meters.map((n, i) => (i === 0 && first ? crash(KB[n]) : KB[n]));

export const BOSS_ZORZARBLAX: Song = {
  title: 'Family Tree (One Branch)',
  bpm: 192,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.75,
  delay: { beats: 0.5, feedback: 0.3, tone: 2800 },
  parts: {
    ther: { inst: 'theremin', pan: 0.05, rev: 0.35, dly: 0.18, vol: 0.55, mml: join(['_g16 _v110'], Z_IN, Z_HOOK, Z_BM.slice(0, 4).map(() => 'r2.'), Z_LULL.slice(4), Z_HOOK, Z_SCREAM) },
    xyl: { inst: 'xylophone', pan: 0.35, rev: 0.25, vol: 0.4, mml: join(['_v110'], rest(4), zrest(Z_AM), zrest(Z_BM), Z_HOOK, zrest(Z_CM)) },
    box: { inst: 'musicbox', pan: -0.2, rev: 0.45, dly: 0.2, vol: 0.5, mml: join(['_v100'], rest(4), zrest(Z_AM), Z_LULL, zrest(Z_AM), zrest(Z_CM)) },
    orch: { inst: 'orch2', pan: 0, rev: 0.3, vol: 0.42, mml: join(['_v115'], ['o4 !b-8 r8 r4 r2', 'o4 !e8 r8 r4 r2', 'o4 !b-8 r8 r4 r2', 'o4 !e8 !e8 r4 !b-4 !b-4'],
      zbars(Z_A, Z_AM, (c, n) => (c === 'E' ? `o4 !e8 r${held8(n - 1)}` : `r${held8(n)}`)), zrest(Z_BM.slice(0, 4)), ['o4 !b-8 r4 r8 r4', 'r2.', 'r2.', 'r2.'],
      zbars(Z_A, Z_AM, (c, n) => (c === 'E' ? `o4 !e8 r${held8(n - 1)}` : `r${held8(n)}`)), ['o4 !b-8 r8 r4 r2', 'r1', 'o4 !e8 r8 r4 r2', 'r1', 'o4 !b-8 r8 r4 r2', 'o4 !b8 r8 r4 r2', 'o5 !c8 r8 r4 r2', 'o4 !f8 r8 !f8 r8 !f4 !f4']) },
    tuba: { inst: 'tuba', pan: -0.1, rev: 0.12, vol: 0.62, mml: join(['q5 _v112'], rest(4), zbars(Z_A, Z_AM, (c, n) => oom(c, n, 34)), zrest(Z_BM.slice(0, 4)), zbars(Z_B.slice(4), Z_BM.slice(4), (c, n) => oom(c, n, 34)), zbars(Z_A, Z_AM, (c, n) => oom(c, n, 34)), zrest(Z_CM)) },
    chug: { inst: 'chug', pan: 0.45, rev: 0.08, vol: 0.44, mml: join(['q5 _v110'], rest(4), zbars(Z_A, Z_AM, (c, n) => chugs(c, n, 34)), zrest(Z_BM.slice(0, 4)), zbars(Z_B.slice(4), Z_BM.slice(4), (c, n) => chugs(c, n, 34)), zbars(Z_A, Z_AM, (c, n) => chugs(c, n, 34)), pat(Z_C, '!R16 R16 R16 R16 R16 R16 !R16 R16', 34)) },
    power: { inst: 'powerchord', pan: -0.4, rev: 0.1, vol: 0.44, mml: join(['_v110'], rest(4), zrest(Z_AM), zrest(Z_BM), zbars(Z_A, Z_AM, (c, n) => `${nm(tone(c, 0, 34), held8(n), '!')}`), pat(Z_C, '!R4. R8 r8 R8 R4', 34)) },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.6, mml: join(['q6 _v108'], rest(4), zrest(Z_AM), zrest(Z_BM), zrest(Z_AM), pat(Z_C, "R8 R8 R'8 R8 R8 R8 R'8 R8", 34)) },
    pad: { inst: 'slowstrings', pan: 0.2, rev: 0.45, vol: 0.3, mml: join(['_v90'], rest(4), zrest(Z_AM), zbars(Z_B, Z_BM, (c, n) => cx(c, 55, held8(n))), zrest(Z_AM), zrest(Z_CM)) },
    brass: { inst: 'brass', pan: -0.2, rev: 0.25, vol: 0.38, mml: join(['_v110'], rest(4), zrest(Z_AM), zrest(Z_BM), zbars(Z_A, Z_AM, (c, n) => `${cx(c, 55, '8', '!')} r${held8(n - 1)}`), zrest(Z_CM)) },
    choir: { inst: 'choir', rev: 0.45, vol: 0.38, mml: join(['_v110'], rest(4), zrest(Z_AM), zrest(Z_BM), zrest(Z_AM), zbars(Z_C, Z_CM, c => cx(c.replace('5', ''), 55, '1'))) },
    kit: {
      inst: 'kick', drums: true, rev: 0.14, vol: 0.78,
      mml: join(['_v105'], ['r1', 'r1', 'r1', FILL.big], zkit(Z_AM), zrest(Z_BM.slice(0, 4)), ['{kx}8 h8 {sh}8 a8 h8 {sh}8', KB[6], KB[6], 'a8 a8 s8 s16 s16 (tom1)16 (tom1)16 (tom4)8'], zkit(Z_AM),
        [...rep('{kh}16 k16 k16 k16 {ks}16 k16 k16 k16 {kh}16 k16 k16 k16 {ks}16 k16 k16 k16', 7), FILL.big].map((b, i) => (i === 0 ? crash(b) : b))),
    },
    cow: { inst: 'cowbell', drums: true, pan: 0.3, rev: 0.1, vol: 0.4, only: ['tantrum'], mml: join(['_v100'], rest(4), zbars(Z_A, Z_AM, (_, n) => Array.from({ length: n }, (__, i) => (i % 2 ? 'w8' : '!w8')).join(' ')), zrest(Z_BM), zbars(Z_A, Z_AM, (_, n) => Array.from({ length: n }, (__, i) => (i % 2 ? 'w8' : '!w8')).join(' ')), rep('!w4 w4 !w4 w4', 8)) },
  },
  arrangements: {
    main: {},
    intro: { mute: ['kit', 'chug', 'power', 'tuba', 'brass', 'choir', 'bass'], level: 0.85 },
    tantrum: { vol: { kit: 1.15, chug: 1.2, ther: 1.1, orch: 1.3, choir: 1.2 } },
    death: { solo: ['ther', 'box', 'pad'], inst: { ther: 'musicbox' }, vol: { ther: 0.8 }, level: 0.75 },
  },
};
