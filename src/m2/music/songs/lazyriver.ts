// THE WATER PARK, level 2: THE LAZY RIVER (endgame/park2) and its boss, MEHPHISTO, Satan's goth son, with his punk
// brother BRATHAZAR joining him at half. Three new pieces (the owner, 2026-11-05: "And give stage 2 its own theme. The
// second boss should have its own theme that becomes "heavy metal" when the brother appears." and "Mehphisto's music is
// more goth/emo coded"). None of them borrow a note from another song.
//
// ---- "FLOAT ON (FIRE)" (land:park2) ----
// The lazy river's piped-in background music, lounge exotica on a steel drum, gone wrong. A lilting swung groove
// (shaker, sidestick, congas), a nylon guitar skanking the offbeats, an upright bass rocking root to the fifth under,
// vibes rippling; the chords drift (Cmaj7 - Am7 - Dm7 - G7) and then sour every eighth bar (the minor iv, Fm6, then
// the tritone's Db7). Under it, the hell creeping in: a pipe organ's pedal holding a tritone (C and F-sharp) that swells
// and sinks, a low chime tolling the same tritone, and a second steel drum a third under the tune, warbling seasick out
// of tune (a slow wide vibrato). The B is the stoner haze: the drums down to floor toms and rim, the chords sliding down
// chromatically (Am - Am/G# - Am/G - F#m7b5 - Fmaj7 - E7 - Ab7 - G7), oohs moaning low, a fuzz guitar bending lazily
// through a long delay. Then the tune once more with the fuzz doubling it an octave under.
// Written in C major, played in A-flat (every pitched part tr -4), 100, swung. 36 bars: a 4-bar intro (once), then
// A (8) A' (8) B (8) A'' (8).
// ARRANGEMENTS (cues.ts parkWants): calm (the river's head before the son sets it alight: the tune as the park meant
// it, no organ, no chime, no warble; the haze's line on vibes), main (the burning river), caverns (CRYSTAL CAVERNS and
// the grotto before the fight: under the rock, the congas and the skank gone, the organ and the chime up, the steel
// drum far off), coast (after the fight, Meathead coasting on his pretzeled foes with a beer: the hell taken out, the
// fuzz left in).
//
// ---- "NOBODY GETS ME (DAD)" (boss:mehphisto) ----
// MEHPHISTO: the apathetic goth son who secretly wants his dad's approval. Mopey goth / emo rock at 88: a clean guitar
// rippling eighth arpeggios drenched in chorus and delay, a brooding bassline walking the chords in eighths (the Cure,
// Joy Division), a warm pad, a mid-tempo backbeat; the tune on a solo cello, sulking (falling sighs, slurred); a chorus
// that swells (the strings rising, the choir, crashes, the cello up high: the big emo moment), and a bridge that sinks
// into the sulk (D minor - A minor, F - E: the floor toms and the rim alone, a pipe organ's pedal, the clean guitar
// picking the motif high, the cello moaning low).
// Written in A minor, played in B minor (tr +2), 88. 36 bars: a 4-bar intro (the guitar alone, once), then V (8)
// CH (8) BR (8) CH' (8).
// ARRANGEMENTS (cues.ts): intro (the meeting at the river's head and his intro on the beanbag: no kit, no cello),
// main (the fight), hush (his brother being called in: the kit and the bass gone, just the guitar, the pad and the
// cello, low, before the ceiling comes in).
//
// ---- "NOBODY GETS ME (DAD) (BROTHERS' VERSION)" (boss:mehphisto-metal) ----
// The same song as heavy metal the moment BRATHAZAR crashes through the ceiling: twice the tempo (176), so the
// cello's tune comes back twice as fast on a screaming distorted lead (an overdrive a third under it), the clean
// arpeggios become palm-muted sixteenth chugs and power chords, double kick under everything, orchestra hits on the
// chorus, a gallop under the bridge's motif, and a guitar solo of its own. In on one bar, ONCE: the crack (a crash, an
// orchestra hit, a power chord, the lead dive-bombing two octaves), then a bar of chugs and a snare roll into it.
// Written in A minor, played in B minor (tr +2), 176. 42 bars: the 2-bar crash-in (once), then V (8) CH (8) SOLO (8)
// BR (8) CH' (8).
// ARRANGEMENTS: main (it plays from the brother's arrival to the end of the fight; a retry starts back on the son's).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, pat, pads, harm, scale, sec, crash, KIT, FILL } from './mmkit';

// =====================================================================================================================
// FLOAT ON (FIRE) (written in C major: tr -4)

const R_IN: Bar[] = ['Cmaj7', 'Am7', 'Fm6', 'Db7'];
const R_A: Bar[] = ['Cmaj7', 'Am7', 'Dm7', 'G7', 'Cmaj7', 'Am7', 'Fm6', 'Db7'];
const R_B: Bar[] = ['Am', 'Am/G#', 'Am/G', 'F#m7b5', 'Fmaj7', 'E7', 'Ab7', 'G7'];

const R_HOOK = [
  'o5 e4. g8 b4 a8 g8', 'o5 e2 r8 c8 d8 e8', 'o5 f4. a8 o6 c4 o5 b8 a8', 'o5 g2. r4',
  'o5 e4. g8 b4 o6 d8 c8', 'o5 b4 a8 g8 e4 r4', 'o5 a-4. f8 d4 a-8 g8', 'o5 f4 a-8 f8 b4 r4',
];
const R_INTRO = ['o6 e8 d8 c8 o5 b8 g4 e4', 'o5 a8 g8 e8 c8 o4 a2', 'o5 a-8 f8 d8 c8 o4 a-2', 'o5 f8 a-8 b4 r2'];
/** The warble a third under (C major, then C minor for the soured bars). */
const R_HARM = harm(R_HOOK, [...rep(scale('c', 'major'), 6), scale('c', 'minor'), scale('c', 'minor')], -2);
const R_HAZE = [
  'o5 _b-2 a2. g8 e8', 'o5 g+4. b8 o6 e2', 'o6 d4. c8 o5 b4 a4', 'o5 a2 o6 c2',
  'o6 c2. o5 b8 a8', 'o5 g+2 b4 o6 d4', 'o6 e-4. c8 o5 g-4 a-4', 'o5 b2 _f-7 g2',
];
const R_GROOVE = '{kz}8 z8 {mz}8 ?z8 {kz}8 {kz}8 {mz}8 z8';
const R_FILL = '{kz}8 z8 {mz}8 z8 (tom2)8 (tom3)8 (tom4)8 !{kx}8';
const R_TOMS = 'u4 r8 u8 m4 u8 ?m8';
const R_CONGA = 'c8 ?c8 d8 c8 ?c8 c8 d8 ?d8';
/** The organ's tritone, swelling and sinking over four bars. */
const R_DRONE = ['_e30 _e105/1^1 o2 {c f+}1', 'o2 {c f+}1', '_e105 _e30/1^1 o2 {c f+}1', 'o2 {c f+}1'];

export const LAND_PARK2: Song = {
  title: 'Float On (Fire)',
  bpm: 100,
  swing: 0.4, grid: 8,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.85,
  delay: { beats: 0.75, feedback: 0.42, tone: 2400 },
  parts: {
    steel: { inst: 'steeldrum', tr: -4, pan: 0.1, rev: 0.3, dly: 0.18, vol: 0.66, mml: join(['_v110'], R_INTRO, R_HOOK, R_HOOK, rest(8), R_HOOK) },
    warble: { inst: 'steeldrum', tr: -4, pan: -0.35, rev: 0.35, dly: 0.2, vol: 0.4, vib: [0.55, 38, 0], mml: join(['_v100'], rest(12), R_HARM, rest(8), R_HARM) },
    skank: { inst: 'nylongtr', tr: -4, pan: -0.3, rev: 0.22, vol: 0.4, mml: join(['q4 _v95'], rest(4), pat(R_A, 'r8 X8 r8 X8 r8 X8 r8 X8', 55), pat(R_A, 'r8 X8 r8 X8 r8 X8 r8 X8', 55), rest(8), pat(R_A, 'r8 X8 r8 X8 r8 X8 r8 X8', 55)) },
    vibes: { inst: 'vibes', tr: -4, pan: 0.35, rev: 0.35, dly: 0.2, vol: 0.32, mml: join(['_v90'], pads(R_IN, 55), rest(8), pat([...R_A, ...R_B], "0'8 1'8 2'8 3'8 2'8 1'8 0'8 2'8", 55), rest(8)) },
    bass: { inst: 'upright', tr: -4, pan: 0, rev: 0.1, vol: 0.78, mml: join(['q7 _v105'], pat(R_IN, 'R2 R2', 40), pat([...R_A, ...R_A], 'R4. 2,8 r8 R8 2,4', 40), pat(R_B, 'B2. B4', 40), pat(R_A, 'R4. 2,8 r8 R8 2,4', 40)) },
    haze: { inst: 'distlead', tr: -4, pan: 0.2, rev: 0.35, dly: 0.45, vol: 0.4, vib: [4.5, 22, 0.25], mml: join(['_v92'], rest(20), R_HAZE, ['_v80'], up(R_HOOK, -1)) },
    oohs: { inst: 'oohs', tr: -4, pan: 0, rev: 0.5, vol: 0.32, mml: join(['_v88'], rest(20), pads(R_B, 52), rest(8)) },
    drone: { inst: 'churchorgan', tr: -4, pan: -0.1, rev: 0.5, vol: 0.3, mml: join(['_v80'], ['_e0 _e90/1^1 o2 {c f+}1', 'o2 {c f+}1', 'o2 {c f+}1', '_e90 _e30/1 o2 {c f+}1'], R_DRONE, R_DRONE, R_DRONE, R_DRONE, R_DRONE, R_DRONE, R_DRONE, R_DRONE) },
    bell: { inst: 'chimes', tr: -4, pan: 0.25, rev: 0.55, dly: 0.15, vol: 0.34, mml: join(['_v85'], ['o4 c1', 'r1', 'r1', 'o4 f+1'], ...rep(['o4 c1', 'r1', 'r1', 'r1', 'o4 f+1', 'r1', 'r1', 'r1'], 4)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.16, vol: 0.62,
      mml: join(['_v95'], ['r1', 'r1', 'r1', '_v70 ' + FILL.roll + ' _v95'], rep(R_GROOVE, 7), [R_FILL], rep(R_GROOVE, 7), [R_FILL], rep(R_TOMS, 7), [FILL.big], rep(R_GROOVE, 7), [R_FILL]),
    },
    congas: { inst: 'kick', drums: true, pan: -0.25, rev: 0.18, vol: 0.4, mml: join(['_v95'], rest(4), rep(R_CONGA, 16), rest(8), rep(R_CONGA, 8)) },
  },
  arrangements: {
    main: {},
    calm: { mute: ['drone', 'bell', 'warble'], inst: { haze: 'vibes' }, vol: { haze: 0.9 } },
    caverns: { mute: ['congas', 'skank'], vol: { drone: 1.5, bell: 1.4, kit: 0.6, steel: 0.8 }, rev: { steel: 0.6 }, lowpass: 3200 },
    coast: { mute: ['drone', 'bell', 'warble', 'oohs'], vol: { haze: 1.1 } },
  },
};

// =====================================================================================================================
// NOBODY GETS ME (DAD) (written in A minor: tr +2), and its metal version

const M_IN: Bar[] = ['Amadd9', 'Fmaj7', 'Amadd9', 'Fmaj7'];
const M_V: Bar[] = ['Am', 'Fmaj7', 'C', 'G', 'Am', 'Fmaj7', 'Dm', 'E7'];
const M_CH: Bar[] = ['F', 'G', 'Am', 'Am/G', 'F', 'G', 'E7sus', 'E7'];
const M_BR: Bar[] = ['Dm', 'Am', 'Dm', 'Am', 'F', 'E', 'F', 'E'];

/** The sulk: the cello's tune (the metal's lead plays it an octave up). */
const M_VERSE = [
  'o4 e4. d8 c4 o3 b4', 'o4 c2 o3 a4 r4', 'o4 e4. f8 g4 e4', 'o4 d2. r4',
  'o4 e4. d8 c4 o3 b4', 'o4 c4 o3 a8 b8 o4 c4 d4', 'o4 f2 e4 d4', 'o4 e2 o3 g+4 b4',
];
const M_CHORUS = [
  'o4 a2 g4 a4', 'o4 b2 a4 b4', 'o5 c2. o4 b8 a8', 'o4 b4 a4 g4 e4',
  'o4 a2 g4 f4', 'o4 g2 a4 b4', 'o4 a2 b2', 'o4 g+1',
];
/** The bridge's motif (the clean guitar, high). */
const M_MOTIF = ['o5 f2 e2', 'o5 e2 c2', 'o5 f2 a2', 'o5 e1', 'o5 f4 e4 f4 a4', 'o5 g+2 b2', 'o6 c4 o5 b4 a4 f4', 'o5 e1'];
const M_LOW = ['r1', 'r1', 'r1', 'r1', 'o3 a1', 'o3 g+1', 'o3 a1', 'o3 g+1'];
const ARP = "R8 28 0'8 1'8 2'8 1'8 0'8 28";
const M_GROOVE = KIT.rock;
const M_TRIBE = 'u8 ?m8 t8 u8 m8 u8 t8 ?u8';

export const BOSS_MEHPHISTO: Song = {
  title: 'Nobody Gets Me (Dad)',
  bpm: 88,
  loopFrom: 16,
  reverb: 'cathedral',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.38, tone: 2600 },
  parts: {
    cello: { inst: 'cello', tr: 2, pan: 0.05, rev: 0.4, dly: 0.12, vol: 0.62, vib: [5, 18, 0.3], mml: join(['_v105'], rest(4), M_VERSE, M_CHORUS, M_LOW, M_CHORUS) },
    gtr: { inst: 'cleangtr', tr: 2, pan: -0.25, rev: 0.4, dly: 0.35, cho: 0.65, vol: 0.46, mml: join(['_v92'], pat(M_IN, ARP, 52), pat(M_V, ARP, 52), pat(M_CH, ARP, 52), M_MOTIF, pat(M_CH, ARP, 52)) },
    bass: { inst: 'bass', tr: 2, pan: 0, rev: 0.1, vol: 0.76, mml: join(['q6 _v104'], rest(2), ['o2 a2. b4', 'o3 c2 o2 e2'], pat([...M_V, ...M_CH], "R8 R8 R'8 R8 28 R8 18 28", 33), pat(M_BR, 'R2. R4', 33), pat(M_CH, "R8 R8 R'8 R8 28 R8 18 28", 33)) },
    pad: { inst: 'warmpad', tr: 2, pan: 0.2, rev: 0.5, vol: 0.3, mml: join(['_v88'], pads(M_IN, 52), pads(M_V, 52), pads(M_CH, 52), pads(M_BR, 50), pads(M_CH, 52)) },
    str: { inst: 'slowstrings', tr: 2, pan: 0.3, rev: 0.5, vol: 0.36, mml: join(['_v100'], rest(12), ['_e40 _e127/1^1'], pads(M_CH, 57), rest(8), ['_e60 _e127/1'], pads(M_CH, 57)) },
    choir: { inst: 'choir', tr: 2, pan: -0.1, rev: 0.55, vol: 0.32, mml: join(['_v95'], rest(12), pads(M_CH, 55), rest(8), pads(M_CH, 55)) },
    organ: { inst: 'churchorgan', tr: 2, pan: -0.15, rev: 0.55, vol: 0.3, mml: join(['_v90'], rest(20), pat(M_BR, 'R1', 26), rest(8)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.2, vol: 0.72,
      mml: join(['_v98'], ['r1', 'r1', 'r1', '_v75 ' + FILL.roll + ' _v98'], sec(8, M_GROOVE, FILL.snare), sec(8, M_GROOVE.replace(/\{kh\}/g, '{ki}').replace(/h8/g, 'i8'), FILL.toms), rep(M_TRIBE, 7), [FILL.roll], sec(8, M_GROOVE.replace(/\{kh\}/g, '{ki}').replace(/h8/g, 'i8'), FILL.big)),
    },
  },
  arrangements: {
    main: {},
    intro: { mute: ['kit', 'cello', 'str', 'choir'], level: 0.85 },
    hush: { mute: ['kit', 'bass', 'choir', 'str', 'organ'], level: 0.7 },
  },
};

/** The solo (the metal version's own). */
const M_SOLO = [
  'o4 a16 o5 c16 e16 a16 g16 e16 c16 e16 d16 c16 o4 a16 g16 a8 e8',
  'o4 f16 a16 o5 c16 f16 e16 c16 o4 a16 o5 c16 d4 _b-2 c4',
  'o5 e8 g8 e8 c8 o4 g8 o5 c8 e8 g8',
  'o5 _b-2 b2 a16 g16 f16 d16 o4 b4',
  'o5 a16 g16 e16 d16 c16 o4 a16 g16 e16 a16 g16 e16 d16 c4',
  'o4 c16 f16 a16 o5 c16 f16 a16 o6 c8 o5 a2',
  'o5 d16 f16 a16 o6 d16 c16 o5 a16 f16 d16 a8 f8 d8 f8',
  'o5 e16 f16 e16 d16 c16 o4 b16 a16 g+16 b2',
];
const MT_LOOP = [...M_V, ...M_CH, ...M_V, ...M_BR, ...M_CH];
const CHUG16 = '!R16 R16 R16 R16 !R16 R16 R16 R16';
const AM = scale('a', 'harmonic');

export const BOSS_MEHPHISTO_METAL: Song = {
  title: 'Nobody Gets Me (Dad) (Brothers\' Version)',
  bpm: 176,
  loopFrom: 8,
  reverb: 'hall',
  reverbMix: 0.6,
  delay: { beats: 0.75, feedback: 0.25, tone: 3000 },
  parts: {
    lead: { inst: 'distlead', tr: 2, pan: 0.08, rev: 0.22, dly: 0.14, vol: 0.6, mml: join(['_v115'], ['_g4 o5 a8 o3 a2.. _g0', 'r1'], up(M_VERSE), up(M_CHORUS), M_SOLO, M_MOTIF, up(M_CHORUS)) },
    harm: { inst: 'overdrive', tr: 2, pan: -0.3, rev: 0.2, vol: 0.42, mml: join(['_v104'], rest(2), rest(8), harm(up(M_CHORUS), AM, -2), rest(8), harm(M_MOTIF, AM, -2), harm(up(M_CHORUS), AM, -2)) },
    power: { inst: 'powerchord', tr: 2, pan: -0.42, rev: 0.1, vol: 0.46, mml: join(['_v112'], ['o2 !a1', 'r1'], pat(M_V, '!R4. R8 r8 R8 R4', 33), pat(M_CH, '!R8 R8 R8 R8 !R8 R8 R8 R8', 33), pat(M_V, '!R4. R8 r8 R8 R4', 33), pat(M_BR, '!R2 R4. R8', 33), pat(M_CH, '!R8 R8 R8 R8 !R8 R8 R8 R8', 33)) },
    chug: { inst: 'chug', tr: 2, pan: 0.45, rev: 0.08, vol: 0.48, mml: join(['q5 _v112'], ['r1', 'o2 a16 a16 a16 a16 a16 a16 a16 a16 !a16 a16 a16 a16 !a16 a16 !a16 !a16'], pat(M_V, CHUG16, 33), rest(8), pat(M_V, CHUG16, 33), pat(M_BR, '!R8. R16 r8 R8 !R8. R16 R8 R8', 33), rest(8)) },
    bass: { inst: 'synthbass', tr: 2, pan: 0, rev: 0.05, vol: 0.76, mml: join(['q6 _v112'], ['o2 a1', 'o2 a16 a16 a16 a16 a16 a16 a16 a16 a16 a16 a16 a16 a16 a16 a16 a16'], pat(MT_LOOP, "R8 R8 R'8 R8 R8 R8 R'8 R8", 33)) },
    orch: { inst: 'orch2', tr: 2, pan: 0, rev: 0.3, vol: 0.4, mml: join(['_v115'], ['o4 !a8 r8 r4 r2', 'r1'], rest(8), pat(M_CH, '!R8 r8 r4 r2', 57), rest(16), pat(M_CH, '!R8 r8 r4 r2', 57)) },
    choir: { inst: 'choir', tr: 2, rev: 0.45, vol: 0.34, mml: join(['_v105'], rest(10), pads(M_CH, 55), rest(16), pads(M_CH, 55)) },
    organ: { inst: 'churchorgan', tr: 2, pan: 0.2, rev: 0.45, vol: 0.3, mml: join(['_v100'], rest(26), pads(M_BR, 50), rest(8)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.82,
      mml: join(['_v105'], ['{kx}4 r4 r2', '_v70 ' + FILL.roll + ' _v105'], sec(8, KIT.dbl, FILL.toms), [...rep(crash(KIT.dbl), 7), FILL.big], sec(8, KIT.drive, FILL.snare), sec(8, KIT.gallop, FILL.big), [...rep(crash(KIT.dbl), 7), FILL.big]),
    },
  },
  arrangements: {
    main: {},
  },
};
