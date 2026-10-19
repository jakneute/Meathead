// WILDERNESS LAND's fights: the TEENAGERS (the dirt-bike chase: one song for the sequence and the sub-boss) and
// Tucker the train conductor (the land's boss). The land's theme and its set pieces are in frontier.ts.
//
// ---- "TWENTY BUCKS A HEAD" (seq:road-rash = boss:teenagers) ----
// The chase in a Genesis road-racer's view, scored like one: a Road Rash cartridge's driving rock (the user's: "a
// Genesis-era Road Rash-style driving rock track"). Crunchy palm-muted riffs with a blue flat-five in them, a slap
// bass locked to the riff, a relentless kit (sixteenth hats, the snare on two and four, a tom fill every eight), the
// hook on an overdriven guitar, and the YM2612's colors on top: an FM bell-piano and analog brass doing the chip's
// lead and its stabs. Not Steve's hair metal (no keytar, no anthem) and not the demon's thrash (no gallop, no
// double kick): a garage-rock road trip at a dead run.
// Written in E minor, played in F-sharp minor (every pitched part tr +2), 186. 36 bars: a 4-bar count-in (once: the
// slap bass alone, the chugs, the brass, a squeal), then:
//   A  (8)  Em - Em - Em - C D (x2): the riff, the hook on the overdrive.
//   B  (8)  C - D - Em - Em - C - D - B7 - B7: the chorus, power chords, the FM piano's arpeggios, the brass stabs.
//   A2 (8)  the hook again, the brass doubling it, a distorted guitar an octave down.
//   C  (8)  Am - Am - C - D - Am - Am - B7 - B7: half time, the riff up a fourth, the FM piano's solo.
// ARRANGEMENTS (cues.ts bossArrs): main (the chase), last (THE LAST MILE: a cowbell, everything up), outro (Tucker's
// ledger and the fade: the bass, the chugs, the kit).
//
// ---- "PLUS INTEREST" (boss:tucker) ----
// Tucker: blind, unkillable, petty, firing a flintlock at sounds over a fare. A spaghetti western gone manic (Morricone's
// The Good, the Bad and the Ugly chased through the streets by South Park's Mel Gibson): the whistle's hook (a flute
// with a wide vibrato) twitching up and down a fourth like a man pulling faces, a choir's "wah-wah-wah"s answering
// it, tolling bells, a twang guitar, a jaw harp (a clav bent into every note), two trumpets mourning in thirds like a
// mariachi at a funeral, a galloping cello and bass, a military snare gallop, whips, an anvil, the ledger's "ka-ching"
// (a triangle). The C section is the Mel Gibson chase: the chords sliding a half step up and back (A minor, B-flat),
// the twang and the jaw harp in a chromatic panic, the kit in a double-time polka.
// Written in A minor, played in G-sharp minor (every pitched part tr -1), 112. 36 bars: the jumpscare (once: an
// orchestra hit, the brass and the choir screaming a cluster that falls off an octave, the crash and a gong), the
// hook's head alone, the ka-ching, the whistle cackling up into the gallop; then:
//   A  (8)  Am - Am - G - G - F - F - E - E7: the whistle, the wahs.
//   B  (8)  Dm - Am - E7 - Am - Dm - Am - B7 - E7: the trumpets in thirds, mourning, the gallop going on under them.
//   C  (8)  Am - Bb - Am - Bb - C - B - Bb - E7: the chase.
//   A2 (8)  the whistle and a trumpet together, the bells every bar, the anvil.
// ARRANGEMENTS: main (the fight); intro (from the fake-out's pop through the axe tree: the kit out, the rest down).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, chord, bars, hi, cut } from './jungle';

const roll = (n: string, o = 2) => `o${o} _v50 [${n}32]8 _v70 [${n}32]8 _v90 [${n}32]8 _v110 [${n}32]8`;
const g1 = (b: Bar) => (typeof b === 'string' ? b : b[0]);

// =====================================================================================================================
// TWENTY BUCKS A HEAD (written in E minor: every pitched part tr +2)

const RV: Record<string, string[]> = {
  Em: ['3b', '4e', '4g'], C: ['4c', '4e', '4g'], D: ['4d', '4f+', '4a'], Am: ['4c', '4e', '4a'], B7: ['3b', '4d+', '4f+', '4a'], G: ['3b', '4d', '4g'],
};
const RR: Record<string, [string, string]> = { Em: ['e', 'b'], C: ['c', 'g'], D: ['d', 'a'], Am: ['a', 'e'], B7: ['b', 'f+'], G: ['g', 'd'] };
const R_B: Bar[] = ['C', 'D', 'Em', 'Em', 'C', 'D', 'B7', 'B7'];

// ---- The riffs (the chugs and the slap bass together) ----
const R1 = 'o2 e8 e16 e16 g8 e8 a8 e8 b-8 a8';
const R2 = 'o2 e8 e16 e16 g8 e8 d8 e8 b8 o3 d8';
const R3 = 'o2 c8 c16 c16 e8 c8 d8 d16 d16 f+8 d8';
const RIFF_A = [R1, R2, R1, R3, R1, R2, R1, R3];
const RCA = 'o2 a8 a16 a16 o3 c8 o2 a8 o3 d8 o2 a8 o3 e-8 d8';
const RCC = 'o2 c8 c16 c16 e8 c8 g8 c8 b-8 g8';
const RCD = 'o2 d8 d16 d16 f+8 d8 a8 d8 o3 c8 o2 a8';
const RCB = 'o2 b8 b16 b16 o3 d+8 o2 b8 o3 f+8 o2 b8 o3 a8 f+8';
const RIFF_C = [RCA, RCA, RCC, RCD, RCA, RCA, RCB, RCB];

// ---- The tunes ----
const R_HOOK = ['o5 e4 g8 a8 r8 b4.', 'o5 a8 g8 e8 d8 e2', 'o5 e4 g8 a8 r8 o6 d4.', 'o6 c8 o5 b8 a8 g8 a4 f+4', 'o5 e4 g8 a8 r8 b4.', 'o5 a8 g8 e8 d8 e2', 'o5 g8 a8 b8 o6 d8 e4 d8 o5 b8', 'o5 g4 e4 a4 f+4'];
const R_CHORUS = ['o5 e2 d4 c4', 'o5 d2. r4', 'o5 e4 g4 b4 a4', 'o5 g2 e2', 'o5 e2 d4 c4', 'o5 d2 f+4 a4', 'o5 b2 a4 f+4', 'o5 _b-1 d+2 f+2'];
const R_FM = ['o5 a8 b8 o6 c8 e8 d8 c8 o5 b8 a8', 'o5 e4 a4 o6 c2', 'o5 g8 a8 b8 o6 c8 e8 d8 c8 o5 g8', 'o5 f+4 a4 o6 d2', 'o6 e8 d8 c8 o5 a8 o6 e8 d8 c8 o5 a8', 'o6 c4 o5 a4 e4 a4', 'o5 b8 o6 c8 d+8 f+8 d+4 o5 b4', 'o5 a8 f+8 d+8 o4 b8 o5 d+2'];

const rPower = (prog: Bar[]) => bars(prog, (c, b) => { const r = RR[c][0]; return b === 4 ? `o2 !${r}2 ${r}2` : `o2 !${r}2`; });
const rEighths = (prog: Bar[]) => bars(prog, c => { const r = RR[c][0]; return `o2 !${r}8 ${r}8 ${r}8 ${r}8 !${r}8 ${r}8 ${r}8 ${r}8`; });
/** The slap in the chorus: root, the octave popped, the fifth. */
const rSlap = (prog: Bar[]) => bars(prog, c => { const [r, f] = RR[c]; return `o2 ${r}8 r8 >${r}8< ${r}8 r8 ${r}8 >${r}8< ${f}8`; });
const rStabs = (prog: Bar[]) => bars(prog, c => { const x = chord(RV[c], '8'); return `${x} r8 r8 ${x} r2`; });
/** The FM piano's sixteenths, up and down the chord. */
const rArp = (prog: Bar[]) => bars(prog, (c, b) => { const v = RV[c], n = [v[0], v[1], v[2], hi(v[0])]; return cut([...n, ...[...n].reverse(), ...n, ...[...n].reverse()].map(x => nt(x, '16')), b, 4); });

const RK = '{kh}16 ?h16 h16 ?h16 {sh}16 ?h16 h16 {kh}16 ?h16 h16 {kh}16 ?h16 {sh}16 ?h16 h16 ?h16';
const RK_IN = RK.replace('{kh}', '{kx}');
const RK_FILL = '{kh}16 ?h16 h16 ?h16 {sh}16 ?h16 h16 ?h16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 (tom4)16';
const RKH = '{kh}16 ?h16 h16 ?h16 h16 ?h16 k16 ?h16 {sh}16 ?h16 h16 ?h16 h16 ?h16 h16 ?h16';
const RKH_IN = RKH.replace('{kh}', '{kx}');
const sec = (inBar: string, bar: string, fill: string) => [inBar, ...rep(bar, 6), fill];

export const SEQ_ROAD_RASH: Song = {
  title: 'Twenty Bucks a Head',
  bpm: 186,
  loopFrom: 16,
  reverb: 'room',
  reverbMix: 0.7,
  delay: { beats: 0.75, feedback: 0.25, tone: 3000 },
  parts: {
    lead: { inst: 'overdrive', tr: 2, pan: 0.1, rev: 0.2, dly: 0.12, mml: join(['_v110'], ['r1', 'r1', 'r1', 'o5 r2. _b-3 b4'], R_HOOK, R_CHORUS, R_HOOK, rest(8)) },
    harm: { inst: 'distlead', tr: 2, pan: -0.2, rev: 0.2, vol: 0.5, mml: join(['_v100'], rest(20), up(R_HOOK, -1), rest(8)) },
    chug: { inst: 'chug', tr: 2, pan: 0.45, rev: 0.1, vol: 0.55, mml: join(['q5 _v110'], ['r1', R2, R1, R3], RIFF_A, rEighths(R_B), RIFF_A, RIFF_C) },
    power: { inst: 'powerchord', tr: 2, pan: -0.45, rev: 0.12, vol: 0.5, mml: join(['_v105'], rest(12), rPower(R_B), rest(16)) },
    slap: { inst: 'slapbass', tr: 2, pan: 0, rev: 0.05, vol: 0.85, mml: join(['q6 _v110'], [R1, R2, R1, R3], RIFF_A, rSlap(R_B), RIFF_A, RIFF_C) },
    stab: {
      inst: 'synthbrass', tr: 2, pan: -0.15, rev: 0.2, vol: 0.55,
      mml: join(['_v110'], ['r1', 'r1', `${chord(RV.Em, '8')} r8 r4 ${chord(RV.Em, '8')} r8 r4`, `${chord(RV.C, '4')} r4 ${chord(RV.D, '4')} r4`], rest(8), rStabs(R_B), ['_v95'], R_HOOK, rest(8)),
    },
    fm: { inst: 'fmpiano', tr: 2, pan: 0.3, rev: 0.25, dly: 0.2, vol: 0.5, mml: join(['_v95'], rest(12), rArp(R_B), rest(8), ['_v110'], R_FM) },
    kit: {
      inst: 'kick', drums: true, rev: 0.15, vol: 0.8,
      mml: join(['_v70 ' + 'h16 '.repeat(16).trim(), '_v105 ' + RK_IN, RK, RK_FILL], sec(RK_IN, RK, RK_FILL), sec(RK_IN, RK, RK_FILL), sec(RK_IN, RK, RK_FILL), sec(RKH_IN, RKH, RK_FILL)),
    },
    cow: { inst: 'cowbell', drums: true, pan: 0.25, rev: 0.1, vol: 0.45, only: ['last'], mml: join(['_v100'], rep('!w4 w4 !w4 w4', 36)) },
  },
  arrangements: {
    main: {},
    last: { vol: { lead: 1.1, kit: 1.1, stab: 1.2, chug: 1.1 } },
    outro: { solo: ['slap', 'chug', 'kit'], vol: { kit: 0.6, chug: 0.6 }, level: 0.6 },
  },
};

// =====================================================================================================================
// PLUS INTEREST (written in A minor: every pitched part tr -1)

const UV: Record<string, string[]> = {
  Am: ['4c', '4e', '4a'], G: ['3b', '4d', '4g'], F: ['4c', '4f', '4a'], E: ['3b', '4e', '4g+'], E7: ['3b', '4d', '4e', '4g+'], Dm: ['4d', '4f', '4a'],
  B7: ['3b', '4d+', '4f+', '4a'], Bb: ['4d', '4f', '4b-'], C: ['4c', '4e', '4g'], B: ['3b', '4d+', '4f+'],
};
const UR: Record<string, [string, string]> = {
  Am: ['a', 'e'], G: ['g', 'd'], F: ['f', 'c'], E: ['e', 'b'], E7: ['e', 'b'], Dm: ['d', 'a'], B7: ['b', 'f+'], Bb: ['b-', 'f'], C: ['c', 'g'], B: ['b', 'f+'],
};
const U_A: Bar[] = ['Am', 'Am', 'G', 'G', 'F', 'F', 'E', 'E7'];
const U_B: Bar[] = ['Dm', 'Am', 'E7', 'Am', 'Dm', 'Am', 'B7', 'E7'];
const U_C: Bar[] = ['Am', 'Bb', 'Am', 'Bb', 'C', 'B', 'Bb', 'E7'];

const UM_A = ['o5 e16 a16 e16 a16 e4 r8 c8 d8 e8', 'o5 a4. g8 e2', 'o5 d16 g16 d16 g16 d4 r8 o4 b8 o5 c8 d8', 'o5 g4. f8 d2', 'o5 c16 f16 c16 f16 c4 r8 a8 g8 f8', 'o5 e8 f8 e8 d8 c4 o4 a4', 'o4 b8 o5 c8 d8 e8 f8 e8 d8 c8', 'o4 b2 g+4 e4'];
const UT1 = ['o5 f2. e8 d8', 'o5 e2. c4', 'o5 d2. c8 o4 b8', 'o5 c1', 'o5 a2. g8 f8', 'o5 e2 a2', 'o5 a2 f+4 d+4', 'o5 e1'];
const UT2 = ['o5 d2. c8 o4 b8', 'o5 c2. o4 a4', 'o4 b2. a8 g+8', 'o4 a1', 'o5 f2. e8 d8', 'o5 c2 e2', 'o5 f+2 d+4 o4 b4', 'o4 g+1'];
const UM_C = ['o4 a8 a8 b-8 a8 o5 c8 o4 b-8 a8 g+8', 'o4 b-8 b-8 o5 c8 o4 b-8 o5 d8 c8 o4 b-8 a8', 'o4 a8 a8 b-8 a8 o5 c8 o4 b-8 a8 g+8', 'o4 b-8 o5 d8 f8 d8 b-4 r4', 'o5 c8 c8 d8 c8 e8 d8 c8 o4 b8', 'o4 b8 b8 o5 c+8 o4 b8 o5 d+8 c+8 o4 b8 a+8', 'o4 b-8 b-8 o5 c8 o4 b-8 o5 d8 c8 o4 b-8 a8', 'o4 g+8 b8 o5 d8 e8 f8 e8 d8 o4 b8'];

/** The choir's "wah-wah-wah" in the whistle's held notes (every other bar of A). */
const uWahs = (prog: Bar[]) => prog.map((b, i) => { if (i % 2 === 0) return 'r1'; const x = chord(UV[g1(b)], '8'); return `r2 _b-1 ${x} r8 _b-1 ${x} _b-1 ${x}`; });
const uPads = (prog: Bar[]) => bars(prog, (c, b) => chord(UV[c], b === 4 ? '1' : '2'));
/** The gallop: da-da-DUM on the root, the fifth on three. */
const uGallop = (prog: Bar[]) => bars(prog, c => { const [r, a] = UR[c]; return `o2 ${r}16 ${r}16 !${r}8 ${r}16 ${r}16 !${r}8 ${a}16 ${a}16 !${a}8 ${r}16 ${r}16 !${r}8`; });
/** The chase's bass: straight sixteenths. */
const uRun = (prog: Bar[]) => bars(prog, c => { const r = UR[c][0]; return `o2 ${`!${r}16 ${r}16 ${r}16 ${r}16 `.repeat(4).trim()}`; });
/** The jaw harp: a boing on every offbeat. */
const uBoing = (prog: Bar[]) => bars(prog, c => { const r = UR[c][0]; return `o3 ${`r8 _b-3 ${r}8 `.repeat(4).trim()}`; });
const uStabs = (prog: Bar[]) => bars(prog, c => { const x = chord(UV[c], '8'); return `${x} r8 r8 ${x} r2`; });
const uArp = (prog: Bar[]) => bars(prog, c => { const v = UV[c]; return [v[0], v[1], v[2], hi(v[0]), v[2], v[1], v[0], v[1]].map(n => nt(n, '8')).join(' '); });

const UK = '{ks}16 ?s16 !s8 s16 ?s16 !s8 {ks}16 ?s16 !s8 s16 s16 !s8';
const UK_IN = UK.replace('{ks}', '{kx}');
const UK_FILL = '{ks}16 ?s16 !s8 s16 ?s16 !s8 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16';
const UK_CHASE = '{kh}16 ?s16 {sh}16 ?s16 {kh}16 ?s16 {sh}16 ?s16 {kh}16 ?s16 {sh}16 ?s16 {kh}16 ?s16 {sh}16 s16';
const UK_CHASE_IN = UK_CHASE.replace('{kh}', '{kx}');
const KACHING = '(triangle)8 (triangle)8 r2.';
const ANVIL = 'r4 (ridebell)4 r4 (ridebell)4';
const WHIP = 'r2. a4';

export const BOSS_TUCKER: Song = {
  title: 'Plus Interest',
  bpm: 112,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.85,
  delay: { beats: 0.75, feedback: 0.3, tone: 2600 },
  parts: {
    hit: { inst: 'orchhit', tr: -1, pan: 0, rev: 0.4, vol: 0.8, mml: join(['_v127 o4 b-4 r2.'], rest(35)) },
    brass: { inst: 'brass', tr: -1, pan: -0.15, rev: 0.35, vol: 0.6, mml: join(['_v127 _f-12/2 o3 {a b- >e a}2. r4'], rest(3), rest(16), ['_v110'], uStabs(U_C), rest(8)) },
    choir: {
      inst: 'choir', tr: -1, pan: 0, rev: 0.45, vol: 0.6,
      mml: join(['_v127 _f-12/2 o4 {a b- >e}2. r4'], rest(3), ['_v105'], uWahs(U_A), ['_v70'], uPads(U_B), ['_v110'], uStabs(U_C), ['_v105'], uWahs(U_A)),
    },
    whistle: {
      inst: 'flute', tr: -1, pan: 0.1, rev: 0.35, dly: 0.12, vib: [6, 40, 0.12],
      mml: join(['_v100'], ['r1', 'o5 e16 a16 e16 a16 e4 r2', 'r1', 'o5 e16 a16 e16 a16 o6 c16 e16 c16 e16 a4 r4'], UM_A, rest(16), UM_A),
    },
    trumpet: { inst: 'trumpet', tr: -1, pan: 0.2, rev: 0.4, vol: 0.7, vib: [5.5, 30, 0.2], mml: join(['_v100'], rest(12), UT1, rest(8), ['_v90'], UM_A) },
    trumpet2: { inst: 'trumpet', tr: -1, pan: -0.25, rev: 0.4, vol: 0.6, vib: [5.2, 30, 0.2], mml: join(['_v95'], rest(12), UT2, rest(16)) },
    twang: { inst: 'cleangtr', tr: -1, pan: -0.3, rev: 0.35, dly: 0.25, vol: 0.75, mml: join(['_v100'], ['r1', 'r1', 'o3 a8 o4 e8 a8 o5 c8 e4 r4', 'r1'], rest(8), ['q6 _v80'], uArp(U_B), ['q7 _v110'], UM_C, rest(8)) },
    jaw: { inst: 'clav', tr: -1, pan: 0.35, rev: 0.2, vol: 0.45, mml: join(['_v100'], ['r1', 'r1', 'o3 r8 _b-3 a8 r8 _b-3 a8 r2', 'r1'], rest(16), uBoing(U_C), rest(8)) },
    cello: { inst: 'cello', tr: -1, pan: -0.2, rev: 0.25, vol: 0.55, mml: join(['q6 _v110 o2 a4 r2.', 'r1', 'r1'], uGallop(['E7']), uGallop(U_A), uGallop(U_B), uRun(U_C), uGallop(U_A)) },
    bass: { inst: 'bass', tr: -1, pan: 0, rev: 0.06, vol: 0.7, mml: join(['q6 _v110 o2 a4 r2.', 'r1', 'r1'], uGallop(['E7']), uGallop(U_A), uGallop(U_B), uRun(U_C), uGallop(U_A)) },
    strings: { inst: 'strings', tr: -1, pan: 0.25, rev: 0.4, vol: 0.35, mml: join(['_v85'], rest(12), uPads(U_B), uPads(U_C), uPads(U_A)) },
    bells: {
      inst: 'chimes', tr: -1, pan: 0.35, rev: 0.55, vol: 0.45,
      mml: join(['_v110 o5 {a b-}2 r2', 'r1', 'r1', 'r1'], ['_v95'], U_A.map((c, i) => (i % 4 ? 'r1' : `o5 ${UR[g1(c)][0]}2 r2`)), rest(16), U_A.map(c => `o5 ${UR[g1(c)][0]}2 r2`)),
    },
    timpani: {
      inst: 'timpani', tr: -1, pan: 0.1, rev: 0.35, vol: 0.65,
      mml: join(['_v127 o2 a4 r2.', 'r1', 'r1', roll('e')], ...[U_A, U_B, U_C, U_A].map(s => [`_v105 o2 ${UR[g1(s[0])][0]}4 r2.`, ...rest(6), roll('e')])),
    },
    kit: {
      inst: 'kick', drums: true, rev: 0.18, vol: 0.65,
      mml: join(['r1', 'r1', 'r1', '_v50 s16 s16 s16 s16 _v70 s16 s16 s16 s16 _v90 s16 s16 s16 s16 _v115 s16 s16 s16 s16'], ['_v100'], sec(UK_IN, UK, UK_FILL), sec(UK_IN, UK, UK_FILL), ['_v110'], sec(UK_CHASE_IN, UK_CHASE, UK_FILL), ['_v100'], sec(UK_IN, UK, UK_FILL)),
    },
    perc: {
      inst: 'crash', drums: true, pan: 0.2, rev: 0.3, vol: 0.6,
      mml: join(['_v127 {x(gong)}4 r2.', 'r1', '_v100 ' + KACHING, 'r1'], [...rest(7), WHIP], [...rest(7), WHIP], [KACHING, 'r1', 'r1', 'r1', KACHING, 'r1', 'r1', WHIP], ['_v85'], [...rep(ANVIL, 7), 'r4 (ridebell)4 r4 a4']),
    },
  },
  arrangements: {
    main: {},
    intro: { mute: ['kit'], vol: { cello: 0.7, bass: 0.7, whistle: 0.85, choir: 0.8 }, level: 0.85 },
  },
};
