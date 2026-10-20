// WILDERNESS LAND's fights: the TEENAGERS (the dirt-bike chase: one song for the sequence and the sub-boss) and
// Tucker the train conductor (the land's boss). The land's theme and its set pieces are in frontier.ts.
//
// ---- "TWENTY BUCKS A HEAD" (seq:road-rash = boss:teenagers) ----
// The chase in a Genesis road-racer's view, scored like one: a Road Rash cartridge's driving garage rock (the user's: "a
// Genesis-era Road Rash-style driving rock track"). Crunchy palm-muted riffs with a blue flat-five in them, a slap
// bass locked to the riff, a relentless kit (sixteenth hats, the snare on two and four, a fill closing every eight),
// the hook on an overdriven guitar, the YM2612's colors on top (an FM bell-piano's arpeggios and solo, analog brass
// stabbing and doubling the hook), and the second time round a distorted guitar takes the harmony in thirds. Not
// Steve's hair metal (no keytar, no anthem) and not the demon's thrash (no gallop, no double kick).
// Written in E minor, played in F-sharp minor (every pitched part tr +2), 186. 36 bars: a 4-bar count-in (once: the
// slap bass alone, the chugs, the brass, a squeal), then A (Em - Em - Em - C D, twice: the riff, the hook), B (C - D -
// Em - Em - C - D - B7 - B7: the chorus, power chords, the FM arpeggios, brass stabs), A2 (the hook with the brass and
// the harmony guitar), C (Am - Am - C - D - Am - Am - B7 - B7: half time, the riff up a fourth, the FM piano's solo).
// ARRANGEMENTS (cues.ts bossArrs): main (the chase), last (THE LAST MILE: a cowbell, everything up), outro (Tucker's
// ledger and the fade: the bass, the chugs, the kit).
//
// ---- "PLUS INTEREST" (boss:tucker) ----
// Tucker: blind, unkillable, petty, firing a flintlock at sounds over a fare. A spaghetti western at Mega Man boss
// speed (The Good, the Bad and the Ugly chased through the streets by South Park's Mel Gibson): the whistle's hook (a
// flute with a wide vibrato) twitching up and down a fourth like a man pulling faces, the choir's "wah-wah-wah"s,
// tolling bells, a twang guitar, a jaw harp (a clav bent into every note), two trumpets mourning in thirds like a
// mariachi at a funeral, palm-muted chugs and the bass galloping, a gallop on the kit, whips, an anvil, the ledger's
// "ka-ching" (a triangle). The C section is the Mel Gibson chase: the chords sliding a half step up and back (A minor,
// B-flat), the twang and the jaw harp in a chromatic panic, the kit in a double-time polka.
// Written in A minor, played in G-sharp minor (every pitched part tr -1), 178. 36 bars: the jumpscare (once: an
// orchestra hit, the brass and the choir screaming a cluster that falls off an octave, the crash and a gong), the
// hook's head alone, the ka-ching, the whistle cackling up into the gallop; then A (Am - Am - G - G - F - F - E - E7),
// B (Dm - Am - E7 - Am - Dm - Am - B7 - E7: the trumpets in thirds), C (Am - Bb - Am - Bb - C - B - Bb - E7: the
// chase), A2 (the whistle and a trumpet together, the bells every bar, the anvil).
// ARRANGEMENTS: main (the fight); intro (from the fake-out's pop through the axe tree: the kit out, the rest down).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, pat, pads, harm, scale, sec, troll, g1, KIT, FILL } from './mmkit';

// =====================================================================================================================
// TWENTY BUCKS A HEAD (written in E minor: every pitched part tr +2)

const R_B: Bar[] = ['C', 'D', 'Em', 'Em', 'C', 'D', 'B7', 'B7'];

const R1 = 'o2 e8 e16 e16 g8 e8 a8 e8 b-8 a8';
const R2 = 'o2 e8 e16 e16 g8 e8 d8 e8 b8 o3 d8';
const R3 = 'o2 c8 c16 c16 e8 c8 d8 d16 d16 f+8 d8';
const RIFF_A = [R1, R2, R1, R3, R1, R2, R1, R3];
const RCA = 'o2 a8 a16 a16 o3 c8 o2 a8 o3 d8 o2 a8 o3 e-8 d8';
const RCC = 'o2 c8 c16 c16 e8 c8 g8 c8 b-8 g8';
const RCD = 'o2 d8 d16 d16 f+8 d8 a8 d8 o3 c8 o2 a8';
const RCB = 'o2 b8 b16 b16 o3 d+8 o2 b8 o3 f+8 o2 b8 o3 a8 f+8';
const RIFF_C = [RCA, RCA, RCC, RCD, RCA, RCA, RCB, RCB];

const R_HOOK = ['o5 e4 g8 a8 r8 b4.', 'o5 a8 g8 e8 d8 e4 r8 e8', 'o5 e4 g8 a8 r8 o6 d4.', 'o6 c8 o5 b8 a8 g8 a4 f+4', 'o5 e4 g8 a8 r8 b4.', 'o5 a8 g8 e8 d8 e4 r8 e8', 'o5 g8 a8 b8 o6 d8 e4 d8 o5 b8', 'o5 g4 e4 a4 f+4'];
const R_CHORUS = ['o5 e4. d8 r8 d8 c4', 'o5 d2. r8 d8', 'o5 e4 g4 b4 a4', 'o5 g4. e8 r8 e8 f+8 g8', 'o5 e4. d8 r8 d8 c4', 'o5 d4. f+8 r8 f+8 a4', 'o5 b4. a8 r8 a8 f+4', 'o5 _b-1 d+2 f+2'];
const R_FM = ['o5 a8 b8 o6 c8 e8 d8 c8 o5 b8 a8', 'o5 e4 a4 o6 c2', 'o5 g8 a8 b8 o6 c8 e8 d8 c8 o5 g8', 'o5 f+4 a4 o6 d2', 'o6 e8 d8 c8 o5 a8 o6 e8 d8 c8 o5 a8', 'o6 c4 o5 a4 e4 a4', 'o5 b8 o6 c8 d+8 f+8 d+4 o5 b4', 'o5 a8 f+8 d+8 o4 b8 o5 d+2'];
const R_HARM = harm(R_HOOK, scale('e', 'minor'));

const RK = '{kh}16 ?h16 h16 ?h16 {sh}16 ?h16 h16 {kh}16 ?h16 h16 {kh}16 ?h16 {sh}16 ?h16 h16 ?h16';
const RKH = '{kh}16 ?h16 h16 ?h16 h16 ?h16 k16 ?h16 {sh}16 ?h16 h16 ?h16 h16 ?h16 h16 ?h16';

export const SEQ_ROAD_RASH: Song = {
  title: 'Twenty Bucks a Head',
  bpm: 186,
  loopFrom: 16,
  reverb: 'room',
  reverbMix: 0.7,
  delay: { beats: 0.75, feedback: 0.25, tone: 3000 },
  parts: {
    lead: { inst: 'overdrive', tr: 2, pan: 0.1, rev: 0.18, dly: 0.12, mml: join(['_v112'], ['r1', 'r1', 'r1', 'o5 r2. _b-3 b4'], R_HOOK, R_CHORUS, R_HOOK, rest(8)) },
    harm: { inst: 'distlead', tr: 2, pan: -0.25, rev: 0.18, vol: 0.45, mml: join(['_v100'], rest(20), R_HARM, rest(8)) },
    chug: { inst: 'chug', tr: 2, pan: 0.45, rev: 0.08, vol: 0.52, mml: join(['q5 _v112'], ['r1', R2, R1, R3], RIFF_A, pat(R_B, '!R8 R8 R8 R8 !R8 R8 R8 R8', 40), RIFF_A, RIFF_C) },
    power: { inst: 'powerchord', tr: 2, pan: -0.45, rev: 0.1, vol: 0.48, mml: join(['_v108'], rest(12), pat(R_B, '!R4. R8 r8 R8 R4', 40), rest(16)) },
    slap: { inst: 'slapbass', tr: 2, pan: 0, rev: 0.05, vol: 0.85, mml: join(['q6 _v112'], [R1, R2, R1, R3], RIFF_A, pat(R_B, "B8 r8 B'8 B8 r8 B8 B'8 28", 28), RIFF_A, RIFF_C) },
    stab: {
      inst: 'synthbrass', tr: 2, pan: -0.15, rev: 0.2, vol: 0.52,
      mml: join(['_v112'], ['r1', 'r1', `${pat(['Em'], 'X8 r8 r4 X8 r8 r4', 59)[0]}`, `${pat([['C', 'D']], 'X4 r4', 59)[0]}`], rest(8), pat(R_B, '!X8 r8 r8 X8 r2', 59), ['_v98'], R_HOOK, rest(8)),
    },
    fm: { inst: 'fmpiano', tr: 2, pan: 0.3, rev: 0.22, dly: 0.2, vol: 0.48, mml: join(['_v95'], rest(12), pat(R_B, "016 116 216 0'16 216 116 016 116", 59), rest(8), ['_v112'], R_FM) },
    kit: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.8,
      mml: join(['_v70 ' + 'h16 '.repeat(16).trim(), '_v105 ' + RK.replace('{kh}', '{kx}'), RK, FILL.big], ['_v105'], sec(8, RK, FILL.toms), sec(8, RK, FILL.snare), sec(8, RK, FILL.toms), sec(8, RKH, FILL.big)),
    },
    cow: { inst: 'cowbell', drums: true, pan: 0.25, rev: 0.1, vol: 0.45, only: ['last'], mml: join(['_v100'], rep('!w4 w4 !w4 w4', 36)) },
  },
  arrangements: {
    main: {},
    last: { vol: { lead: 1.1, kit: 1.1, stab: 1.2, chug: 1.1, harm: 1.15 } },
    outro: { solo: ['slap', 'chug', 'kit'], vol: { kit: 0.6, chug: 0.6 }, level: 0.6 },
  },
};

// =====================================================================================================================
// PLUS INTEREST (written in A minor: every pitched part tr -1)

const U_A: Bar[] = ['Am', 'Am', 'G', 'G', 'F', 'F', 'E', 'E7'];
const U_B: Bar[] = ['Dm', 'Am', 'E7', 'Am', 'Dm', 'Am', 'B7', 'E7'];
const U_C: Bar[] = ['Am', 'Bb', 'Am', 'Bb', 'C', 'B', 'Bb', 'E7'];

const UM_A = ['o5 e16 a16 e16 a16 e4 r8 c8 d8 e8', 'o5 a4. g8 e4. e8', 'o5 d16 g16 d16 g16 d4 r8 o4 b8 o5 c8 d8', 'o5 g4. f8 d4. d8', 'o5 c16 f16 c16 f16 c4 r8 a8 g8 f8', 'o5 e8 f8 e8 d8 c4 o4 a4', 'o4 b8 o5 c8 d8 e8 f8 e8 d8 c8', 'o4 b4 r8 b8 g+4 e4'];
const UT1 = ['o5 f4. e8 r8 e8 d4', 'o5 e2. c4', 'o5 d4. c8 r8 c8 o4 b4', 'o5 c2. r4', 'o5 a4. g8 r8 g8 f4', 'o5 e2 a2', 'o5 a4. f+8 r8 f+8 d+4', 'o5 e2. r4'];
const UT2 = harm(UT1, [scale('d', 'minor'), scale('a', 'harmonic'), scale('a', 'harmonic'), scale('a', 'minor'), scale('d', 'minor'), scale('a', 'minor'), scale('e', 'harmonic'), scale('a', 'harmonic')]);
const UM_C = ['o4 a8 a8 b-8 a8 o5 c8 o4 b-8 a8 g+8', 'o4 b-8 b-8 o5 c8 o4 b-8 o5 d8 c8 o4 b-8 a8', 'o4 a8 a8 b-8 a8 o5 c8 o4 b-8 a8 g+8', 'o4 b-8 o5 d8 f8 d8 b-4 r4', 'o5 c8 c8 d8 c8 e8 d8 c8 o4 b8', 'o4 b8 b8 o5 c+8 o4 b8 o5 d+8 c+8 o4 b8 a+8', 'o4 b-8 b-8 o5 c8 o4 b-8 o5 d8 c8 o4 b-8 a8', 'o4 g+8 b8 o5 d8 e8 f8 e8 d8 o4 b8'];

const uWahs = (prog: Bar[]) => prog.map((b, i) => (i % 2 === 0 ? 'r1' : pat([g1(b)], 'r2 _b-1 X8 r8 _b-1 X8 _b-1 X8', 57)[0]));
const UGAL = '!R16 R16 R8 !R16 R16 R8 !216 216 28 !R16 R16 R8';
const URUN = '!R16 R16 R16 R16';
const UK = '{ks}16 ?s16 !s8 {ks}16 ?s16 !s8 {ks}16 ?s16 !s8 {ks}16 s16 !s8';
const UK_CHASE = '{kh}16 ?s16 {sh}16 ?s16 {kh}16 ?s16 {sh}16 ?s16 {kh}16 ?s16 {sh}16 ?s16 {kh}16 ?s16 {sh}16 s16';
const KACHING = '(triangle)8 (triangle)8 r2.';
const ANVIL = 'r4 (ridebell)4 r4 (ridebell)4';
const WHIP = 'r2. a4';

export const BOSS_TUCKER: Song = {
  title: 'Plus Interest',
  bpm: 178,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.3, tone: 2600 },
  parts: {
    hit: { inst: 'orchhit', tr: -1, pan: 0, rev: 0.4, vol: 0.8, mml: join(['_v127 o4 b-4 r2.'], rest(35)) },
    brass: { inst: 'brass', tr: -1, pan: -0.15, rev: 0.32, vol: 0.55, mml: join(['_v127 _f-12/2 o3 {a b- >e a}2. r4'], rest(3), rest(16), ['_v112'], pat(U_C, '!X8 r8 r8 X8 r8 X8 r4', 57), rest(8)) },
    choir: { inst: 'choir', tr: -1, pan: 0, rev: 0.45, vol: 0.55, mml: join(['_v127 _f-12/2 o4 {a b- >e}2. r4'], rest(3), ['_v108'], uWahs(U_A), ['_v75'], pads(U_B, 55), ['_v112'], pat(U_C, '!X8 r8 r8 X8 r2', 57), ['_v108'], uWahs(U_A)) },
    whistle: { inst: 'flute', tr: -1, pan: 0.1, rev: 0.32, dly: 0.12, vib: [6, 40, 0.12], mml: join(['_v104'], ['r1', 'o5 e16 a16 e16 a16 e4 r2', 'r1', 'o5 e16 a16 e16 a16 o6 c16 e16 c16 e16 a4 r4'], UM_A, rest(16), UM_A) },
    trumpet: { inst: 'trumpet', tr: -1, pan: 0.2, rev: 0.35, vol: 0.7, vib: [5.5, 30, 0.2], mml: join(['_v105'], rest(12), UT1, rest(8), ['_v95'], UM_A) },
    trumpet2: { inst: 'trumpet', tr: -1, pan: -0.25, rev: 0.35, vol: 0.55, vib: [5.2, 30, 0.2], mml: join(['_v100'], rest(12), UT2, rest(16)) },
    twang: { inst: 'cleangtr', tr: -1, pan: -0.3, rev: 0.32, dly: 0.25, vol: 0.7, mml: join(['_v100'], ['r1', 'r1', 'o3 a8 o4 e8 a8 o5 c8 e4 r4', 'r1'], rest(8), ['q6 _v85'], pat(U_B, "08 18 28 0'8 28 18 08 18", 57), ['q7 _v112'], UM_C, rest(8)) },
    jaw: { inst: 'clav', tr: -1, pan: 0.35, rev: 0.18, vol: 0.42, mml: join(['_v100'], ['r1', 'r1', 'o3 r8 _b-3 a8 r8 _b-3 a8 r2', 'r1'], rest(16), pat(U_C, 'r8 _b-3 R8', 55), rest(8)) },
    chug: { inst: 'chug', tr: -1, pan: 0.45, rev: 0.08, vol: 0.45, mml: join(rest(4), ['_v108'], pat([...U_A, ...U_B], UGAL, 41), pat(U_C, URUN, 41), pat(U_A, UGAL, 41)) },
    bass: { inst: 'bass', tr: -1, pan: 0, rev: 0.05, vol: 0.8, mml: join(['q6 _v112 o2 a4 r2.', 'r1', 'r1'], pat(['E7'], UGAL.replace(/R/g, 'B'), 28), pat([...U_A, ...U_B], UGAL.replace(/R/g, 'B'), 28), pat(U_C, "!B16 B16 B'16 B16", 28), pat(U_A, UGAL.replace(/R/g, 'B'), 28)) },
    strings: { inst: 'strings', tr: -1, pan: 0.25, rev: 0.38, vol: 0.32, mml: join(['_v85'], rest(12), pads(U_B, 55), pat(U_C, '016 116 216 116', 57), pads(U_A, 55)) },
    bells: { inst: 'chimes', tr: -1, pan: 0.35, rev: 0.55, vol: 0.42, mml: join(['_v110 o5 {a b-}2 r2', 'r1', 'r1', 'r1'], ['_v95'], U_A.map((c, i) => (i % 4 ? 'r1' : pat([g1(c)], 'R2 r2', 64)[0])), rest(16), pat(U_A, 'R2 r2', 64)) },
    timp: { inst: 'timpani', tr: -1, pan: 0.1, rev: 0.35, vol: 0.6, mml: join(['_v127 o2 a4 r2.', 'r1', 'r1', troll('o2 e')], ...[U_A, U_B, U_C, U_A].map(s => [`_v105 ${pat([g1(s[0])], 'B4 r2.', 38)[0]}`, ...rest(6), troll('o2 e')])) },
    kit: {
      inst: 'kick', drums: true, rev: 0.16, vol: 0.7,
      mml: join(['r1', 'r1', 'r1', '_v100 ' + FILL.roll], ['_v105'], sec(8, UK, FILL.toms), sec(8, KIT.mm, FILL.big), ['_v112'], sec(8, UK_CHASE, FILL.toms), ['_v105'], sec(8, UK, FILL.big)),
    },
    perc: {
      inst: 'crash', drums: true, pan: 0.2, rev: 0.3, vol: 0.55,
      mml: join(['_v127 {x(gong)}4 r2.', 'r1', '_v100 ' + KACHING, 'r1'], [...rest(7), WHIP], [...rest(7), WHIP], [KACHING, 'r1', 'r1', 'r1', KACHING, 'r1', 'r1', WHIP], ['_v85'], [...rep(ANVIL, 7), 'r4 (ridebell)4 r4 a4']),
    },
  },
  arrangements: {
    main: {},
    intro: { mute: ['kit', 'chug'], vol: { bass: 0.7, whistle: 0.85, choir: 0.8 }, level: 0.85 },
  },
};
