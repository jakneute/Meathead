// WILDERNESS LAND's music (land id 'frontier'): the land's theme, a version of it for every stretch, and its set
// pieces' own songs (the train, the saloon brawl, the high-noon duel and its DRAW!, Timber Tumble). The fights (the
// TEENAGERS' Road Rash chase, Tucker) are in frontierBosses.ts. The high-energy rework: western stages the way Mega Man
// did them (a galloping kit, a galloping bass, power chords, twin leads, a fill into every section).
//
// ---- "BIG FAKE COUNTRY" (land:frontier) ----
// The park's frontier as a western stage theme: The Big Country's open-range tune (up the fourth, the third held) on a
// harmonica out front, galloping: the kick and snare in a gallop, the bass galloping root and fifth, power chords on
// the gallop, a banjo rolling eighths, the steel guitar's chick; the fiddle in thirds under the tune the second time
// (the minor iv's sigh, the A-flat); the Big Country sweep for B (the strings on the tune, a distorted guitar an octave
// under, the horns, the flat-three and flat-seven of every widescreen sunset); "On the Trail" for C (the tune whistled,
// a hee-HAW leap, the clip-clop up front, the ride cymbal).
// Written in C, played in B major (every pitched part tr -1), 152, straight. 36 bars: a 4-bar horn call (once: C - F/C
// - C - G7, the timpani rolling up into it, the band hitting), then A1 (C - C - F - C - Am - F - D7 - G7), A2 (C - C/E
// - F - Fm - C/G - A7 - D7 G7 - C), B (F - C/E - Dm7 - G - Eb - Bb - F - G7sus G7), C (Am - E7 - Am - E7 - F - C - Dm7
// - G7).
// ARRANGEMENTS (cues.ts: the section, and in the town and the log ride the HUD's stretch):
//   wilds / main  the whole western band
//   train     the stood-still train on a revisit: the harmonica, the steel guitar, the bass, the hooves (calmer)
//   town / gulch  Main Street's band: the tune on the fiddle, a honky-tonk piano's stride, the banjo, the horns
//   saloon    the saloon's piano player alone, both hands, before anybody's started anything
//   mill      the mill pond and the sawmill: a lumberjack polka-punk (the tune on accordion, the kick-snare gallop)
//   mine      the Mother Lode: the harmonica far off down a shaft, a cello drone, harp drips, muffled
//   logride   (Timber Tumble's own song is seq:log-ride) the ride's speakers: the tune on an organ, muffled
//   sewer     (fallback) a theremin, the drone, the drips
//   river     (fallback) the real river: flute, strings, horns, timpani, oohs, a nylon guitar
//   woods     the REAL woods outside the park: the tune on a plain flute over a fingerpicked nylon guitar, a warm pad,
//             oohs: the first sincere thing in the land
//   dirtbike  the trail either side of the chase: the woods with the harmonica back and the bass
//   arena     the clearing, the body on the branch: a lone whistle a long way off, the drone, oohs
//   hush      the fake-out's beat before he pops: the drone and nothing else
//   cutscene  the harmonica soft, the nylon guitar, a pad, the bass
//   boss      the band, the timpani and kit up
//
// ---- "FARE EVASION" (seq:train) ----
// The train, caboose to engine: Morricone meets a runaway locomotive at Mega Man speed. The twang guitar through the
// echo on the tune, a whistle (flute) answering, a mariachi trumpet an octave up (and in thirds), a wordless choir,
// tolling bells, the strings churning sixteenths, a sixteenth train beat under a rock kit, a galloping bass, power
// chords, a whip at the end of every phrase, the harmonica's train whistle; a Phrygian C with the horns.
// E minor, 160. 36 bars: a 4-bar pull-out (once: the whistle, the train beat getting up to speed, the bell), A (Em - Em -
// C - D - Em - Em - Am - B7), A2 (the trumpet up the octave, the choir under), B (G - D - Em - C - Am - Em - C - B7),
// C (Em - F - Em - F - Am - B7 - Em - B7).
// ARRANGEMENTS (cues.ts trainArr): run, roof (and main: everything), inside (in a car: thinner, the wind gone), tunnel
// (in the dark: the beat, the bass, the horns, oohs, muffled), engine (Tucker's insult and the KILL: the bells, the
// twang, the strings, timpani), crash (the shot, the close-up, the crash).
//
// ---- "LAST CALL" (seq:brawl) ----
// The saloon's BRAWL!: the piano player doesn't stop, he speeds up. A boogie-rockabilly two-step at 208: the piano's
// right hand on the tune and its left hand stomping, the bass walking eighths, a rock kit, an overdriven guitar
// answering, an alto sax squealing with the tune, the trumpet's shout chorus, trombone smears, slapsticks on the
// punches. A glissando and a crash to start it (once). A (C - C - G7 x4 - C - C), B (F - F - C - C - D7 - D7 - G7 - G7),
// A2 (to C7), C (Am - E7 - Am - E7 - F - C - D7 - G7: the minor punch-up).
//
// ---- "HIGH NOON" (seq:duel) and "DRAW!" (seq:draw) ----
// The Wild West Show's duel. The standoff (A minor, 66: kept slow, a standoff is a standoff, but tense, not quaint): a
// tolling bell, a whistle with a wide vibrato, the twang's tremolo answers, a sixteenth tick and a heartbeat, a string
// drone and pad; the trumpet takes the tune for its second half (the deguello). Arrangements: standoff (the intro),
// tense (the duel itself: the tick, the heartbeat, the drone, the bell). Then DRAW! is its own song, so it can start
// on the call: a stinger (an orchestra hit, a brass stab falling off, the crash, the whip, timpani), then a Mega Man
// gallop in A minor (172): the trumpet with a distorted guitar in thirds, power chords and the bass galloping, the
// choir's HEYs.
//
// ---- "TIMBER TUMBLE" (seq:log-ride) ----
// The log ride's own song, sung by its animatronic lumberjacks, gone from a jug band to a country-rock hoedown: the tune
// on the choir with a banjo and an overdriven guitar doubling it, a fiddle's counterline, the bass on root-fifth
// eighths, power chords, a steel guitar's chop, a shaker's washboard sixteenths, a driving kit. D major, 156. 34 bars:
// a "HEY-HO" pickup (once), A (D - D - G - D - D - B7 - E7 A7 - D), B (G - G - D - B7 - Em - A7 - D - A7), A again, C
// (the verse in B minor: Bm - Bm - F#7 - F#7 - Bm - Bm - E7 - A7).
// ARRANGEMENTS (cues.ts logArr): queue (the town's queue: the ride's speakers, muffled), station (the platform), ride
// (everything), lift (the chain: the banjo, humming oohs, a ratchet), break (the giant saw: timpani, low strings, the
// trombone), sewer (FERAL: the tune on a distorted lead, a synth-bass grind a half step off, tribal toms, muffled),
// river (REAL: the tune on French horns, a flute, harp, cello, strings, timpani), chipper (the sluice: the tune on a
// square lead over a snare roll and a trombone ostinato, the strings and timpani).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, pat, pads, harm, scale, sec, troll, g1, KIT, FILL } from './mmkit';

const GALLOP_KIT = '{kh}8 k16 k16 {sh}8 k16 k16 {kh}8 k16 k16 {sh}8 h16 h16';
const GALLOP_BASS = "!B8 B16 B16 28 B16 B16 !B8 B16 B16 28 B'16 B16";

// =====================================================================================================================
// BIG FAKE COUNTRY (written in C: every pitched part tr -1, B major)

const W_IN: Bar[] = ['C', 'F/C', 'C', 'G7'];
const W_A1: Bar[] = ['C', 'C', 'F', 'C', 'Am', 'F', 'D7', 'G7'];
const W_A2: Bar[] = ['C', 'C/E', 'F', 'Fm', 'C/G', 'A7', ['D7', 'G7'], 'C'];
const W_B: Bar[] = ['F', 'C/E', 'Dm7', 'G', 'Eb', 'Bb', 'F', ['G7sus', 'G7']];
const W_C: Bar[] = ['Am', 'E7', 'Am', 'E7', 'F', 'C', 'Dm7', 'G7'];
const W_LOOP: Bar[] = [...W_A1, ...W_A2, ...W_B, ...W_C];
const W_ALL: Bar[] = [...W_IN, ...W_LOOP];

const WM_A1 = ['o4 g4 o5 c4 e4. d8', 'o5 c4. o4 g8 r8 g8 a8 b8', 'o5 c4 f4 a4. g8', 'o5 e2 r8 e8 f8 g8', 'o5 e4 a4 o6 c4. o5 b8', 'o5 a4 f8 c8 r8 c8 d8 e8', 'o5 f+4 a4 o6 c4 o5 a4', 'o5 g2 r8 g8 a8 b8'];
const WM_A2 = ['o4 g4 o5 c4 e4. d8', 'o5 c4. o4 g8 r8 g8 a8 b8', 'o5 c4 f4 a4. g8', 'o5 _b-1 a-2. g8 f8', 'o5 e4 g4 c4. d8', 'o5 e4 c+4 o4 a4 o5 e4', 'o5 d4 f+8 a8 g4 f8 d8', 'o5 c2. r4'];
const WM_B = ['o5 a2. g8 f8', 'o5 g2 e2', 'o5 f2. e8 d8', 'o5 d2 g2', 'o5 g2. f8 e-8', 'o5 f2 d2', 'o5 c4 f4 a4 o6 c4', 'o6 c2 o5 b2'];
const WM_C = ['o5 e8 a8 r8 a8 g+8 a8 b4', 'o6 d4 o5 b4 g+4 e4', 'o5 c8 e8 r8 e8 d+8 e8 a4', 'o5 g+2 o6 e4 o5 e4', 'o5 f8 a8 r8 a8 g8 a8 o6 c4', 'o5 g2 e4 c4', 'o5 d8 f8 a8 o6 c8 o5 b8 a8 f8 d8', 'o5 g4 o4 g4 b4 r4'];
const W_TUNE = [...WM_A1, ...WM_A2, ...WM_B, ...WM_C];
const CMAJ = scale('c', 'major');
const W_A2_TWIN = harm(WM_A2, [CMAJ, CMAJ, CMAJ, scale('c', 'minor'), CMAJ, scale('d', 'harmonic'), CMAJ, CMAJ]);
const W_HORN_IN = ['o3 g4. o4 c8 g2', 'o4 a4. g8 f2', 'o4 e4. g8 o5 c2', 'o4 b2 g4 r4'];
const W_HORN_B = ['o4 c1', 'o4 c1', 'o4 a2 f2', 'o4 b1', 'o4 b-1', 'o4 b-2 a-2', 'o4 a1', 'o4 g1'];
const CLIP = '(woodblock)8. (woodblocklo)16 (woodblock)8. (woodblocklo)16 (woodblock)8. (woodblocklo)16 (woodblock)8. (woodblocklo)16';
const ONLY_TUNE = ['train', 'town', 'gulch', 'saloon', 'mill', 'mine', 'logride', 'sewer', 'river', 'woods', 'dirtbike', 'arena', 'cutscene'];
const W_DRIPS = W_ALL.map((b, i) => (i % 2 ? 'r1' : pat([g1(b)], "2'8 r8 r2 0''16 r16 r8", 60)[0]));

export const LAND_FRONTIER: Song = {
  title: 'Big Fake Country',
  bpm: 152,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.75,
  delay: { beats: 0.75, feedback: 0.25, tone: 2800 },
  parts: {
    lead: { inst: 'harmonica', tr: -1, pan: 0, rev: 0.22, dly: 0.08, not: ONLY_TUNE, mml: join(rest(4), ['_v108'], WM_A1, WM_A2, rest(8), ['@flute _m28 _v104'], WM_C) },
    tune: { inst: 'harmonica', tr: -1, pan: 0, rev: 0.28, dly: 0.08, only: ONLY_TUNE, mml: join(rest(4), ['_v100'], W_TUNE) },
    counter: { inst: 'violin', tr: -1, pan: 0.3, rev: 0.25, vol: 0.5, mml: join(rest(12), ['_v95'], W_A2_TWIN, rest(16)) },
    sweep: { inst: 'strings', tr: -1, pan: 0.15, rev: 0.38, vol: 0.75, mml: join(rest(20), ['_v108'], WM_B, rest(8)) },
    glead: { inst: 'distlead', tr: -1, pan: -0.25, rev: 0.22, dly: 0.12, vol: 0.4, mml: join(rest(20), ['_v100'], up(WM_B, -1), rest(8)) },
    pad: { inst: 'slowstrings', tr: -1, pan: -0.1, rev: 0.4, vol: 0.3, mml: join(['_v80'], pads(W_ALL, 55)) },
    horns: { inst: 'horn', tr: -1, pan: -0.3, rev: 0.35, vol: 0.6, mml: join(['_v105'], W_HORN_IN, rest(16), ['_v92'], W_HORN_B, rest(8)) },
    banjo: { inst: 'banjo', tr: -1, pan: 0.4, rev: 0.12, vol: 0.38, mml: join(['q5 _v95'], rest(4), pat(W_LOOP, "!08 18 28 0'8 !18 28 0'8 28", 60)) },
    steel: { inst: 'steelgtr', tr: -1, pan: -0.4, rev: 0.15, vol: 0.42, mml: join(['q3 _v90'], rest(4), pat(W_LOOP, 'r8 X8 r8 X8', 55)) },
    gtr: { inst: 'powerchord', tr: -1, pan: -0.35, rev: 0.1, vol: 0.42, mml: join(['_v110'], pat(W_IN, '!R4 r4 R4 R4', 41), ['_v100'], pat([...W_A1, ...W_A2], '!R8 R16 R16 R8 R16 R16 !R8 R16 R16 R8 R8', 41), pat(W_B, '!R2 R4. R8', 41), pat(W_C, '!R8 R8 r8 R8 !R8 R8 r8 R8', 41)) },
    bass: { inst: 'bass', tr: -1, pan: 0, rev: 0.05, vol: 0.82, mml: join(['_v108'], pat(W_IN, 'B4 r4 B4 r4', 29), ['_v100'], pat([...W_A1, ...W_A2], GALLOP_BASS, 29), pat(W_B, "B4. B8 B'4 B4", 29), pat(W_C, "B8 B'8 B8 B'8", 29)) },
    clip: { inst: 'kick', drums: true, pan: 0.2, rev: 0.15, vol: 0.5, not: ['saloon', 'mine', 'sewer', 'woods', 'arena', 'hush', 'cutscene', 'river'], mml: join(['_v60'], rest(2), rep(CLIP, 2), ['_v70'], rep(CLIP, 16), ['_v55'], rep(CLIP, 8), ['_v100'], rep(CLIP, 8)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.15, vol: 0.72, not: ['saloon', 'mine', 'sewer', 'woods', 'arena', 'hush', 'cutscene', 'train', 'logride', 'river', 'dirtbike', 'mill'],
      mml: join(['_v110 {kx}4 r4 {kx}4 r4', '{kx}4 r4 {kx}4 r4', '{kx}4 r4 {kx}4 {kx}4', FILL.big], ['_v100'], sec(8, GALLOP_KIT, FILL.toms), sec(8, GALLOP_KIT, FILL.big), sec(8, KIT.rock, FILL.snare), sec(8, KIT.ride, FILL.big)),
    },
    punk: { inst: 'kick', drums: true, rev: 0.12, vol: 0.7, only: ['mill'], mml: join(['_v100'], rest(4), sec(8, KIT.punk, FILL.toms), sec(8, KIT.punk, FILL.snare), sec(8, KIT.punk, FILL.toms), sec(8, KIT.punk, FILL.big)) },
    timp: {
      inst: 'timpani', tr: -1, pan: 0.1, rev: 0.32, vol: 0.55,
      mml: join(['_v90 o2 c4 r2.', 'o2 c4 r2.', 'o2 c4 r4 g4 r4', troll('o2 g')], ['_v100 o2 c4 r2.'], rest(6), [troll('o2 g')], ['o2 c4 r2.'], rest(6), [troll('o2 g')], ['o2 f4 r2.'], rest(3), ['o2 e-4 r2.', 'r1', 'o2 f4 r2.', troll('o2 g')], ['o2 a4 r2.'], rest(6), [troll('o2 g')]),
    },
    piano: { inst: 'piano', tr: -1, pan: -0.2, rev: 0.18, vol: 0.55, only: ['town', 'gulch', 'saloon'], mml: join(['q5 _v95'], pat(W_ALL, 'B8 X8 28 X8', 36, 60)) },
    accordion: { inst: 'accordion', tr: -1, pan: -0.25, rev: 0.2, vol: 0.45, only: ['mill'], mml: join(['q4 _v90'], pat(W_ALL, 'r8 X8', 55)) },
    drone: { inst: 'cello', tr: -1, pan: -0.1, rev: 0.45, vol: 0.45, only: ['mine', 'sewer', 'arena', 'hush', 'river'], mml: join(['q8 _v80'], pat(W_ALL, 'R1', 36)) },
    drips: { inst: 'harp', tr: -1, pan: 0.35, rev: 0.6, dly: 0.35, vol: 0.4, only: ['mine', 'sewer'], mml: join(['_v80'], W_DRIPS) },
    oohs: { inst: 'oohs', tr: -1, pan: 0, rev: 0.5, vol: 0.32, only: ['woods', 'dirtbike', 'arena', 'river', 'cutscene'], mml: join(['_v75'], pads(W_ALL, 55)) },
    nylon: { inst: 'nylongtr', tr: -1, pan: -0.3, rev: 0.25, vol: 0.5, only: ['woods', 'dirtbike', 'river', 'cutscene'], mml: join(['q7 _v85'], pat(W_ALL, "08 28 0'8 18 0'8 28 18 28", 48)) },
  },
  arrangements: {
    main: {},
    wilds: {},
    train: { solo: ['tune', 'steel', 'bass', 'clip', 'pad'], vol: { tune: 0.75, clip: 0.8, steel: 0.9, bass: 0.7 }, rev: { tune: 0.4 }, level: 0.75 },
    town: { solo: ['tune', 'piano', 'banjo', 'bass', 'kit', 'clip', 'horns', 'gtr'], inst: { tune: 'violin' }, vol: { tune: 0.85, banjo: 1.2, clip: 0.6, horns: 0.8, gtr: 0.8 } },
    gulch: { solo: ['tune', 'piano', 'banjo', 'bass', 'kit', 'clip', 'horns', 'gtr'], inst: { tune: 'violin' }, vol: { tune: 0.85, banjo: 1.2, clip: 0.6, horns: 0.8, gtr: 0.8 } },
    saloon: { solo: ['tune', 'piano'], inst: { tune: 'piano' }, vol: { tune: 0.8, piano: 1.1 }, rev: { tune: 0.15, piano: 0.15 }, level: 0.85 },
    mill: { solo: ['tune', 'accordion', 'banjo', 'bass', 'gtr', 'punk'], inst: { tune: 'accordion' }, vol: { tune: 0.85, banjo: 1.2 } },
    mine: { solo: ['tune', 'drone', 'drips'], vol: { tune: 0.6, drone: 1.1 }, rev: { tune: 0.65 }, lowpass: 4500, level: 0.65 },
    logride: { solo: ['tune', 'banjo', 'bass', 'clip', 'gtr'], inst: { tune: 'organ' }, vol: { tune: 0.7 }, lowpass: 2600, level: 0.6 },
    sewer: { solo: ['tune', 'drone', 'drips'], inst: { tune: 'theremin' }, vol: { tune: 0.45 }, rev: { tune: 0.6 }, lowpass: 2200, level: 0.6 },
    river: { solo: ['tune', 'sweep', 'pad', 'horns', 'timp', 'oohs', 'nylon', 'drone'], inst: { tune: 'flute' }, vol: { tune: 0.85, pad: 1.5, sweep: 0.8, nylon: 0.9, drone: 0.9 }, rev: { tune: 0.4 } },
    woods: { solo: ['tune', 'nylon', 'pad', 'oohs'], inst: { tune: 'flute', pad: 'warmpad' }, vol: { tune: 0.7, pad: 1.4, oohs: 0.9, nylon: 1.2 }, rev: { tune: 0.4 }, level: 0.8 },
    dirtbike: { solo: ['tune', 'nylon', 'pad', 'oohs', 'bass'], inst: { pad: 'warmpad' }, vol: { tune: 0.7, pad: 1.4, oohs: 0.9, nylon: 1.2, bass: 0.6 }, level: 0.8 },
    arena: { solo: ['tune', 'drone', 'oohs'], inst: { tune: 'flute' }, vol: { tune: 0.45, oohs: 0.9, drone: 1.1 }, rev: { tune: 0.65 }, level: 0.65 },
    hush: { solo: ['drone'], vol: { drone: 1 }, level: 0.5 },
    cutscene: { solo: ['tune', 'nylon', 'pad', 'bass'], vol: { tune: 0.65, pad: 1.4, bass: 0.5, nylon: 1.0 }, rev: { tune: 0.4 }, level: 0.75 },
    boss: { vol: { timp: 1.3, kit: 1.2, horns: 1.1, gtr: 1.15 } },
  },
};

// =====================================================================================================================
// FARE EVASION

const T_IN: Bar[] = ['Em', 'Em', 'Em', 'B7'];
const T_A: Bar[] = ['Em', 'Em', 'C', 'D', 'Em', 'Em', 'Am', 'B7'];
const T_A2: Bar[] = ['Em', 'Em', 'C', 'D', 'Em', 'Em', ['Am', 'B7'], 'Em'];
const T_B: Bar[] = ['G', 'D', 'Em', 'C', 'Am', 'Em', 'C', 'B7'];
const T_C: Bar[] = ['Em', 'F', 'Em', 'F', 'Am', 'B7', 'Em', 'B7'];
const T_LOOP: Bar[] = [...T_A, ...T_A2, ...T_B, ...T_C];
const T_ALL: Bar[] = [...T_IN, ...T_LOOP];

const TM_A0 = ['o4 e4. e8 g8 a8 b4', 'o4 b8 a8 g8 a8 e4. e8', 'o4 e4. e8 g8 a8 o5 c4', 'o5 d8 c8 o4 b8 a8 f+4. f+8', 'o4 e4. e8 g8 a8 b4', 'o5 e8 d8 o4 b8 g8 e4. e8'];
const TM_A = [...TM_A0, 'o4 a4. a8 o5 c8 o4 b8 a4', 'o4 b2 d+4 f+4'];
const TM_A2 = [...TM_A0, 'o4 a4 o5 c4 o4 b4 d+4', 'o4 e2. r4'];
const TM_B = ['o5 d4. o4 b8 r8 b8 g4', 'o5 a4. f+8 r8 f+8 d4', 'o5 g2. e4', 'o5 e2 r8 e8 f+8 g8', 'o5 c4. e8 r8 e8 a4', 'o5 b4. g8 r8 g8 e4', 'o5 e2 c4 e4', 'o5 f+2 d+2'];
const TM_C = ['o3 b4. o4 e8 r8 e8 f4', 'o4 f2 e4 f4', 'o3 b4. o4 e8 r8 e8 f4', 'o4 f2 a2', 'o4 a4. o5 c8 r8 c8 o4 b4', 'o4 b2 a2', 'o4 g4. e8 r8 e8 g4', 'o4 f+2 d+2'];
const EH = scale('e', 'harmonic');
const TM_A2_TWIN = harm(TM_A2, EH);
const T_WH = ['r1', 'r2 o6 e8 d8 o5 b4', 'r1', 'r2 o6 d8 c8 o5 a4', 'r1', 'r2 o5 g8 a8 b4', 'r1', 'r2 o5 f+8 a8 b4'];
const WHOO = 'o5 _b-2 {g b >e}4. r8 _f-3 {g b >e}2';
const TB = '{kh}16 ?s16 s16 ?s16 !{sh}16 ?s16 s16 ?s16 {kh}16 ?s16 s16 ?s16 !{sh}16 ?s16 s16 ?s16';
const WHIP8 = [...rest(7), 'r2. a4'];

export const SEQ_TRAIN: Song = {
  title: 'Fare Evasion',
  bpm: 160,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.7,
  delay: { beats: 0.75, feedback: 0.32, tone: 2600 },
  parts: {
    twang: { inst: 'cleangtr', pan: -0.15, rev: 0.32, dly: 0.28, cho: 0.15, mml: join(rest(4), ['_v112'], TM_A, TM_A2, rest(8), ['_v100'], pat(T_C, "!08 18 28 18 !0'8 28 18 28", 52)) },
    whistle: { inst: 'flute', pan: 0.3, rev: 0.4, dly: 0.2, vol: 0.7, vib: [5.5, 30, 0.15], mml: join(rest(4), ['_v98'], T_WH, rest(24)) },
    trumpet: { inst: 'trumpet', pan: 0.15, rev: 0.3, vol: 0.75, mml: join(rest(12), ['_v108'], up(TM_A2), ['_v104'], TM_B, rest(8)) },
    twin: { inst: 'trumpet', pan: 0.4, rev: 0.3, vol: 0.45, mml: join(rest(12), ['_v100'], up(TM_A2_TWIN), harm(TM_B, EH), rest(8)) },
    choir: { inst: 'choir', pan: 0, rev: 0.48, vol: 0.5, mml: join(rest(12), ['_v75'], pads(T_A2, 55), ['_v98'], TM_B, ['_v80'], pads(T_C, 55)) },
    horns: { inst: 'horn', pan: -0.3, rev: 0.38, vol: 0.7, mml: join(rest(28), ['_v112'], TM_C) },
    strings: { inst: 'strings', pan: 0.25, rev: 0.3, vol: 0.35, mml: join(['q5 _v90'], rest(2), pat(T_ALL.slice(2), '!116 116 216 116', 59)) },
    gtr: { inst: 'powerchord', pan: -0.4, rev: 0.1, vol: 0.42, mml: join(rest(2), ['_v105'], pat(T_ALL.slice(2, 4), '!R8 R8 R8 R8 !R8 R8 R8 R8', 40), pat([...T_A, ...T_A2, ...T_B], '!R8 R16 R16 R8 R16 R16 !R8 R16 R16 R8 R8', 40), ['@chug'], pat(T_C, '!R16 R16 R16 R16', 40), ['@']) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.82, mml: join(['q6 _v105'], rest(2), pat(T_ALL.slice(2), GALLOP_BASS, 28)) },
    beat: { inst: 'kicksoft', drums: true, kit: 'brush', rev: 0.15, vol: 0.55, mml: join(['_v70', TB, '_v85', TB, '_v100', TB, TB], rep(TB, 32)) },
    kit: { inst: 'kick', drums: true, rev: 0.18, vol: 0.68, mml: join(rest(3), [FILL.big], ['_v100'], sec(8, KIT.mm, FILL.toms), sec(8, KIT.mm, FILL.snare), sec(8, KIT.drive, FILL.toms), ['_v105'], sec(8, KIT.half, FILL.big)) },
    whip: { inst: 'slapstick', drums: true, pan: 0.35, rev: 0.3, vol: 0.6, mml: join(['_v110'], rest(4), WHIP8, WHIP8, WHIP8, WHIP8) },
    bell: { inst: 'chimes', pan: 0.4, rev: 0.5, vol: 0.42, mml: join(['_v90'], ['o5 e2 e2', 'r1', 'o5 e2 e2', 'r1'], rest(16), ['_v95'], T_B.map((c, i) => (i % 2 ? 'r1' : pat([g1(c)], 'R2 r2', 64)[0])), ['o5 e1', 'o5 f1', 'o5 e1', 'o5 f1', 'r1', 'r1', 'o5 e1', 'r1']) },
    toot: { inst: 'harmonica', pan: -0.35, rev: 0.45, vol: 0.5, mml: join(['_v100'], [WHOO, 'r1', WHOO, 'r1'], rest(15), [WHOO], rest(7), [WHOO], rest(8)) },
    timp: {
      inst: 'timpani', pan: 0.1, rev: 0.32, vol: 0.55,
      mml: join(['r1', 'r1', 'o2 _v90 e4 r2.', troll('o1 b')], ['_v100 o2 e4 r2.'], rest(6), [troll('o1 b')], ['o2 e4 r2.'], rest(6), [troll('o1 b')], ['o2 g4 r2.'], rest(6), [troll('o1 b')], ['o2 e4 r2.', 'o2 f4 r2.', 'o2 e4 r2.', 'o2 f4 r2.', 'o2 a4 r2.', 'o1 b4 r2.', 'o2 e4 r2.', troll('o1 b')]),
    },
  },
  arrangements: {
    main: {},
    roof: {},
    run: { vol: { choir: 0.8 } },
    inside: { mute: ['kit', 'choir', 'horns', 'whip', 'gtr'], vol: { beat: 1.2, strings: 0.8, twang: 0.9 }, lowpass: 5000, level: 0.85 },
    tunnel: { solo: ['beat', 'bass', 'horns', 'choir', 'strings', 'toot', 'timp'], inst: { choir: 'oohs' }, vol: { choir: 0.8, strings: 0.6 }, rev: { horns: 0.55 }, lowpass: 2400, level: 0.8 },
    engine: { solo: ['bell', 'strings', 'bass', 'timp', 'twang', 'beat', 'whip', 'horns', 'gtr'], vol: { bell: 0.7, timp: 0.8, gtr: 0.8 }, level: 0.9 },
    crash: { solo: ['strings', 'choir', 'timp', 'horns', 'bell'], vol: { choir: 0.75 }, level: 0.8 },
  },
};

// =====================================================================================================================
// LAST CALL

const B_A: Bar[] = ['C', 'C', 'G7', 'G7', 'G7', 'G7', 'C', 'C'];
const B_B: Bar[] = ['F', 'F', 'C', 'C', 'D7', 'D7', 'G7', 'G7'];
const B_A2: Bar[] = ['C', 'C', 'G7', 'G7', 'G7', 'G7', 'C', 'C7'];
const B_C: Bar[] = ['Am', 'E7', 'Am', 'E7', 'F', 'C', 'D7', 'G7'];
const B_LOOP: Bar[] = [...B_A, ...B_B, ...B_A2, ...B_C];

const BM_A0 = ['o5 e8 d+8 e8 g8 r8 e8 c8 r8', 'o5 d8 c+8 d8 f8 r8 d8 o4 b8 r8', 'o5 d8 c+8 d8 f8 r8 d8 o4 b8 g8', 'o4 a8 b8 o5 c8 d8 f4 e8 d8', 'o5 d8 c+8 d8 f8 r8 d8 o4 b8 r8', 'o5 d8 e8 f8 g8 a4 g8 f8', 'o5 e8 d+8 e8 g8 o6 c4 o5 g8 e8'];
const BM_A = [...BM_A0, 'o5 c4 r8 g8 o6 c4 r4'];
const BM_A2 = [...BM_A0, 'o5 c4 e8 g8 b-4 r4'];
const BM_B = ['o5 a4. g8 a8 g8 f8 c8', 'o5 f8 e8 f8 a8 r8 f8 c4', 'o5 g4. f8 g8 f8 e8 c8', 'o5 e8 d+8 e8 g8 r8 e8 c4', 'o5 f+8 e8 f+8 a8 o6 c4 o5 a8 f+8', 'o5 d8 e8 f+8 a8 o6 d4 c4', 'o5 b8 a8 g8 f8 e8 d8 c8 o4 b8', 'o4 g8 a8 b8 o5 d8 f8 g8 a8 b8'];
const BM_C = ['o4 a8 a8 r8 a8 g+8 a8 b8 o5 c8', 'o5 d8 o4 b8 g+8 e8 r8 e8 g+8 b8', 'o5 c8 c8 r8 c8 o4 b8 o5 c8 d8 e8', 'o5 e8 d8 o4 b8 g+8 e4 r4', 'o5 f8 f8 r8 f8 e8 f8 a8 o6 c8', 'o5 g8 e8 c8 e8 g4 r4', 'o5 f+8 a8 o6 c8 o5 a8 f+8 d8 c8 o4 a8', 'o4 g8 b8 o5 d8 f8 g4 r4'];
const BONE_END = 'r2 _b-5 o3 g4 _f-5 o3 g4';
const BONE_C = ['o3 a2 e2', 'o3 g+2 e2', 'o3 a2 c2', 'o3 b2 _f-4 e2', 'o3 f2 a2', 'o3 g2 e2', 'o3 f+2 a2', BONE_END];
const GTR_ANS = ['r1', 'r1', 'r1', 'r2 o4 g8 a+8 b8 o5 d8', 'r1', 'r1', 'r1', 'r2 o4 e8 g8 a+8 b8'];
const PUNCH = 'r2. a4';

export const SEQ_BRAWL: Song = {
  title: 'Last Call',
  bpm: 208,
  loopFrom: 8,
  reverb: 'room',
  reverbMix: 0.75,
  parts: {
    rh: { inst: 'piano', pan: 0.1, rev: 0.15, vol: 0.9, mml: join(['q6 _v112 o6 c32 o5 b32 a32 g32 f32 e32 d32 c32 o4 b32 a32 g32 f32 e32 d32 c32 o3 b32 o4 {c e g}4 r4', 'o3 {g b >d f}4 r4 o4 g8 a8 b8 o5 d8'], ['_v108'], BM_A, BM_B, up(BM_A2), BM_C) },
    lh: { inst: 'piano', pan: -0.15, rev: 0.15, vol: 0.55, mml: join(['q5 _v100'], ['r1', 'r1'], pat(B_LOOP, 'B8 X8 28 X8', 36, 52)) },
    sax: { inst: 'sax', pan: 0.35, rev: 0.2, vol: 0.55, mml: join(['_v105'], rest(18), BM_A2, BM_C) },
    trumpet: { inst: 'trumpet', pan: -0.3, rev: 0.22, vol: 0.62, mml: join(['_v112'], rest(10), BM_B, rest(16)) },
    bone: { inst: 'trombone', pan: -0.2, rev: 0.2, vol: 0.55, mml: join(['_v105'], rest(2), [...rest(7), BONE_END], [...rest(7), BONE_END], [...rest(7), BONE_END], BONE_C) },
    gtr: { inst: 'overdrive', pan: -0.4, rev: 0.15, vol: 0.45, mml: join(['_v105'], rest(2), GTR_ANS, pat(B_B, '!R4 r4 !R4 r4', 52), GTR_ANS, pat(B_C, '!R8 R8 r8 R8 !R8 r8 R4', 52)) },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.8, mml: join(['q6 _v108'], ['o2 c4 r2.', 'o1 g4 r2.'], pat(B_LOOP, "B8 B8 18 18 28 28 B'8 28", 28)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.15, vol: 0.68,
      mml: join(['_v115 {kx}4 r4 r4 s4', '?s8 ?s8 s8 s8 s8 s8 !{s(tom4)}8 !{kx}8'], ['_v100'], ...[0, 1, 2, 3].map(() => sec(8, KIT.rock, FILL.toms))),
    },
    smack: { inst: 'slapstick', drums: true, pan: -0.3, rev: 0.2, vol: 0.55, mml: join(['_v110 r2. a4', 'r1'], ...[0, 1, 2, 3].map(() => ['r1', 'r1', 'r1', PUNCH, 'r1', 'r1', 'r1', PUNCH])) },
  },
  arrangements: { main: {} },
};

// =====================================================================================================================
// HIGH NOON and DRAW!

const D_PROG: Bar[] = ['Am', 'Am', 'Am', 'Am', 'Dm', 'Dm', 'Am', 'Am', 'F', 'F', 'E', 'E', 'Am', 'Am', 'E7', 'Am'];
const DM = ['o5 e2 a2', 'o6 c2. o5 b8 a8', 'o5 b2 e2', 'r1', 'o5 d2 f2', 'o5 a2. g8 f8', 'o5 e1', 'r1', 'o5 f2 a2', 'o6 c2. o5 b-8 a8', 'o5 g+2 b2', 'o6 d2. c8 o5 b8', 'o5 a1', 'r1', 'o5 b2 g+2', 'o5 a2 r2'];
const D_TWANG = ['r1', 'r1', 'r1', 'o3 a8 o4 e8 a8 o5 c8 e4 r4', 'r1', 'r1', 'r1', 'o3 a8 o4 e8 a8 o5 c8 e4 r4', 'r1', 'r1', 'r1', 'o3 e8 b8 o4 e8 g+8 b4 r4', 'r1', 'o3 a8 o4 e8 a8 o5 c8 e4 r4', 'r1', 'o4 [a32]16 r2'];

export const SEQ_DUEL: Song = {
  title: 'High Noon',
  bpm: 66,
  reverb: 'hall',
  reverbMix: 0.9,
  delay: { beats: 1, feedback: 0.35, tone: 2200 },
  parts: {
    whistle: { inst: 'flute', pan: 0.1, rev: 0.45, dly: 0.2, vib: [5, 38, 0.25], mml: join(['_v95'], DM.slice(0, 8), rest(8)) },
    trumpet: { inst: 'trumpet', pan: -0.1, rev: 0.45, dly: 0.15, vol: 0.75, vib: [5, 25, 0.3], mml: join(['_v98'], rest(8), DM.slice(8)) },
    twang: { inst: 'cleangtr', pan: -0.35, rev: 0.4, dly: 0.35, vol: 0.6, mml: join(['_v95'], D_TWANG) },
    drone: { inst: 'slowstrings', pan: 0, rev: 0.45, vol: 0.4, mml: join(['q8 _v80'], pat(D_PROG, 'R1', 45)) },
    pad: { inst: 'strings', pan: 0.2, rev: 0.45, vol: 0.25, mml: join(['q8 _v70'], pads(D_PROG, 57)) },
    bass: { inst: 'bass', pan: 0, rev: 0.15, vol: 0.6, mml: join(['_v92'], pat(D_PROG, '!B8 B16 B16 r4 B8 B16 B16 r4', 28)) },
    bell: { inst: 'chimes', pan: 0.3, rev: 0.6, vol: 0.45, mml: join(['_v90'], D_PROG.map((c, i) => (i % 2 ? 'r1' : pat([g1(c)], 'R2 r2', 60)[0]))) },
    tick: { inst: 'woodblock', drums: true, pan: -0.2, rev: 0.25, vol: 0.35, mml: join(['_v80'], rep('!e16 ?e16 e16 ?e16 !e16 ?e16 e16 ?e16 !e16 ?e16 e16 ?e16 !e16 ?e16 e16 ?e16', 16)) },
    heart: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.2, vol: 0.55, mml: join(['_v100'], rep('k8 ?k8 r4 k8 ?k8 r4', 16)) },
  },
  arrangements: {
    standoff: {},
    main: {},
    tense: { solo: ['tick', 'heart', 'drone', 'bell'], vol: { tick: 1.4, heart: 1.3 }, level: 0.9 },
  },
};

const DW_PROG: Bar[] = ['Am', 'Am', 'G', 'G', 'F', 'F', 'E', 'E7', 'Am', 'Am', 'Dm', 'Dm', 'Am', 'F', 'E7', 'Am'];
const DW = [
  'o5 e8 e16 e16 e8 e8 a4 e4', 'o5 c8 c16 c16 c8 c8 e4 c4', 'o5 d8 d16 d16 d8 d8 g4 d4', 'o4 b8 b16 b16 b8 b8 o5 d4 o4 b4',
  'o5 c8 c16 c16 c8 c8 f4 a4', 'o5 a8 g8 f8 e8 f4 c4', 'o4 b8 b16 b16 b8 o5 c8 d4 e4', 'o5 g+2 e4 r4',
  'o5 e8 e16 e16 e8 e8 a4 e4', 'o5 a8 a16 a16 a8 g8 e4 c4', 'o5 d8 d16 d16 d8 e8 f4 a4', 'o5 a8 g8 f8 e8 d4 f4',
  'o5 e8 e16 e16 e8 e8 a4 o6 c4', 'o6 c8 o5 b8 a8 g8 f4 a4', 'o5 g+8 a8 b8 o6 c8 d4 o5 b4', 'o5 a4 e4 a4 r4',
];
const DW_TWIN = harm(DW, scale('a', 'harmonic'));

export const SEQ_DRAW: Song = {
  title: 'DRAW!',
  bpm: 172,
  loopFrom: 4,
  reverb: 'hall',
  reverbMix: 0.8,
  parts: {
    hit: { inst: 'orchhit', pan: 0, rev: 0.4, vol: 0.75, mml: join(['_v120 o4 a4 r2.'], rest(16)) },
    stab: { inst: 'brass', pan: -0.1, rev: 0.32, vol: 0.7, mml: join(['_v120 _f-7/4 o4 {e a >c e}2. r4'], ['_v105'], rest(8), pat(DW_PROG.slice(8), '!X4 r8 X8 r2', 57)) },
    trumpet: { inst: 'trumpet', pan: 0.15, rev: 0.28, vol: 0.85, mml: join(['r1'], ['_v112'], DW) },
    twin: { inst: 'distlead', pan: -0.3, rev: 0.22, vol: 0.4, mml: join(['r1'], ['_v100'], up(DW_TWIN, -1)) },
    violins: { inst: 'strings', pan: 0.3, rev: 0.3, vol: 0.4, mml: join(['r1'], ['_v100'], DW.slice(0, 8), rest(8)) },
    gtr: { inst: 'powerchord', pan: -0.4, rev: 0.1, vol: 0.45, mml: join(['_v115 o2 a4 r2.'], ['_v105'], pat(DW_PROG, '!R8 R16 R16 R8 R16 R16 !R8 R16 R16 R8 R8', 40)) },
    horns: { inst: 'horn', pan: -0.35, rev: 0.38, vol: 0.55, mml: join(['_v110 o3 a2. r4'], ['_v95'], pads(DW_PROG, 52)) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.8, mml: join(['_v115 o2 a4 r2.'], ['q6 _v105'], pat(DW_PROG, GALLOP_BASS, 28)) },
    choir: { inst: 'choir', pan: 0, rev: 0.4, vol: 0.5, mml: join(['_v120 _f-5/4 o4 {a >c e}2. r4'], ['_v115'], DW_PROG.map((c, i) => (i % 4 === 3 ? pat([g1(c)], 'r2. X8 r8', 57)[0] : 'r1'))) },
    kit: { inst: 'kick', drums: true, rev: 0.18, vol: 0.7, mml: join(['_v120 {kx(gong)}4 r2.'], ['_v105'], sec(8, GALLOP_KIT, FILL.toms), sec(8, GALLOP_KIT, FILL.big)) },
    whip: { inst: 'slapstick', drums: true, pan: 0.3, rev: 0.3, vol: 0.6, mml: join(['_v120 r8 a8 r2.'], ['_v110'], [...rest(7), 'r2. a4', ...rest(7), 'r2. a4']) },
    timp: { inst: 'timpani', pan: 0.1, rev: 0.35, vol: 0.6, mml: join(['_v120 o2 a4 r2.'], ['_v100 o2 a4 r2.'], rest(6), [troll('o2 e')], ['o2 a4 r2.'], rest(6), [troll('o2 e')]) },
  },
  arrangements: { main: {} },
};

// =====================================================================================================================
// TIMBER TUMBLE

const L_IN: Bar[] = ['D', 'A7'];
const L_A: Bar[] = ['D', 'D', 'G', 'D', 'D', 'B7', ['E7', 'A7'], 'D'];
const L_B: Bar[] = ['G', 'G', 'D', 'B7', 'Em', 'A7', 'D', 'A7'];
const L_C: Bar[] = ['Bm', 'Bm', 'F#7', 'F#7', 'Bm', 'Bm', 'E7', 'A7'];
const L_LOOP: Bar[] = [...L_A, ...L_B, ...L_A, ...L_C];
const L_ALL: Bar[] = [...L_IN, ...L_LOOP];

const LM_A0 = ['o4 a4 o5 d8 d8 d4 f+8 e8', 'o5 d4 o4 a4 f+4 a4', 'o4 b4 o5 d8 d8 g4 f+8 e8', 'o5 f+2 r4 o4 a4', 'o4 a4 o5 d8 d8 d4 f+8 a8', 'o5 b4 a8 f+8 d+4 f+4', 'o5 e4 g+4 a4 g4'];
const LM_A = [...LM_A0, 'o5 f+4 e8 d8 d4 r4'];
const LM_A2 = [...LM_A0, 'o5 d2 r2'];
const LM_B = ['o5 d4 g4 g4. f+8', 'o5 e8 d8 o4 b8 g8 b2', 'o5 c+4 d4 f+4. e8', 'o5 d+8 e8 f+8 a8 b2', 'o5 b4 g4 e4. g8', 'o5 a4 e4 c+4. e8', 'o5 d4 f+4 a4 o6 d4', 'o6 c+4 o5 a4 g4 e4'];
const LM_C = ['o4 b4 o5 d4 f+4 d4', 'o5 b2 f+2', 'o5 a+4 f+4 c+4 f+4', 'o5 e2 c+2', 'o5 d4 f+4 b4 o6 d4', 'o6 c+8 o5 b8 a8 f+8 d2', 'o5 g+4 b4 e4 g+4', 'o5 a4 g4 e4 c+4'];
const L_TUNE = [...LM_A, ...LM_B, ...LM_A2, ...LM_C];
const L_HEY = ['o4 r2 {f+ a >d}4 r4', 'o4 r2 {e g a >c+}4 r4'];
const L_FIDDLE_B = ['o5 b2 o6 d2', 'o5 b1', 'o5 a2 f+2', 'o5 a1', 'o5 g2 b2', 'o5 g1', 'o5 f+2 a2', 'o5 g2 a2'];
const L_FIDDLE_C = ['o5 f+1', 'o5 d1', 'o5 e1', 'o5 c+1', 'o5 f+1', 'o5 f+2 d2', 'o5 e1', 'o5 c+2 e2'];
const WASH = 'z16 ?z16 z16 ?z16 {ze}16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 {ze}16 ?z16 z16 z16';
const RATCHET = '(woodblocklo)16 ?(woodblocklo)16 (woodblocklo)16 ?(woodblocklo)16';
const L_TOMS = '(tom4)8 ?(tom4)16 ?(tom4)16 (tom3)8 (tom4)8 (tom4)8 ?(tom4)16 ?(tom4)16 (tom2)8 (tom4)8';

export const SEQ_LOG_RIDE: Song = {
  title: 'Timber Tumble',
  bpm: 156,
  loopFrom: 8,
  reverb: 'hall',
  reverbMix: 0.7,
  delay: { beats: 0.5, feedback: 0.22, tone: 3000 },
  parts: {
    sing: { inst: 'choir', pan: 0, rev: 0.3, vol: 0.7, mml: join(['_v115'], L_HEY, ['_v105'], L_TUNE) },
    pluck: { inst: 'banjo', pan: 0.25, rev: 0.12, vol: 0.55, mml: join(['q6 _v105'], rest(2), L_TUNE) },
    gtrlead: { inst: 'overdrive', pan: -0.2, rev: 0.15, dly: 0.1, vol: 0.4, mml: join(['_v105'], rest(2), up(L_TUNE, -1)) },
    fiddle: { inst: 'violin', pan: -0.3, rev: 0.25, vol: 0.45, mml: join(['_v95'], rest(10), L_FIDDLE_B, rest(8), L_FIDDLE_C) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.8, mml: join(['q5 _v108'], pat(L_ALL, "!B8 B'8 28 B'8", 28)) },
    gtr: { inst: 'powerchord', pan: -0.4, rev: 0.1, vol: 0.4, mml: join(['_v110'], pat(L_IN, '!R4 r4 R4 R4', 40), ['_v100'], pat(L_LOOP, '!R8 R8 R8 !R8 r8 R8 !R8 R8', 40)) },
    chop: { inst: 'steelgtr', pan: 0.4, rev: 0.12, vol: 0.42, mml: join(['q3 _v90'], rest(2), pat(L_LOOP, 'r8 X8', 55)) },
    wash: { inst: 'shaker', drums: true, pan: 0.3, rev: 0.12, vol: 0.45, mml: join(['_v95'], rest(2), rep(WASH, 32)) },
    kit: { inst: 'kick', drums: true, rev: 0.15, vol: 0.68, mml: join(['_v110 {kx}4 r4 r2', FILL.big], ['_v100'], sec(8, KIT.drive, FILL.toms), sec(8, KIT.mm, FILL.snare), sec(8, KIT.drive, FILL.toms), sec(8, KIT.mm, FILL.big)) },
    ratchet: { inst: 'woodblocklo', drums: true, pan: -0.25, rev: 0.15, vol: 0.5, only: ['lift'], mml: join(['_v90'], rep(`${RATCHET} ${RATCHET} ${RATCHET} ${RATCHET}`, 34)) },
    grind: { inst: 'synthbass', pan: 0, rev: 0.22, vol: 0.55, only: ['sewer'], mml: join(['q6 _v100'], pat(L_ALL, '_k0 !R16 R16 R16 _k1 R16', 28), ['_k0']) },
    toms: { inst: 'tom4', drums: true, rev: 0.35, vol: 0.6, only: ['sewer'], mml: join(['_v100'], rep(L_TOMS, 34)) },
    strings: { inst: 'strings', pan: 0.2, rev: 0.4, vol: 0.4, only: ['river', 'break', 'chipper'], mml: join(['_v90'], pads(L_ALL, 55)) },
    trem: { inst: 'strings', pan: -0.2, rev: 0.3, vol: 0.35, only: ['break', 'chipper'], mml: join(['q5 _v95'], pat(L_ALL, '016 116', 55)) },
    timp: { inst: 'timpani', pan: 0.1, rev: 0.35, vol: 0.6, only: ['river', 'break', 'chipper'], mml: join(['_v100 o2 d4 r2.', troll('o2 a')], ...[L_A, L_B, L_A, L_C].map(s => [pat([g1(s[0])], 'B4 r2.', 38)[0], ...rest(6), troll('o2 a')])) },
    roll: { inst: 'snare', drums: true, rev: 0.25, vol: 0.5, only: ['chipper'], mml: join(rep('[s32]32', 34)) },
    low: { inst: 'trombone', pan: -0.1, rev: 0.25, vol: 0.55, only: ['chipper', 'break'], mml: join(['q5 _v105'], pat(L_ALL, '!R8 R8 r8 R8 _k1 R4 _k0 R4', 38)) },
    cello: { inst: 'cello', pan: -0.15, rev: 0.3, vol: 0.6, only: ['river'], mml: join(['q8 _v95'], pat(L_ALL, 'B2. 24', 38)) },
  },
  arrangements: {
    main: {},
    ride: {},
    queue: { solo: ['sing', 'pluck', 'bass', 'wash', 'chop', 'kit'], vol: { sing: 0.8, kit: 0.6 }, lowpass: 2200, level: 0.5 },
    station: { solo: ['sing', 'pluck', 'bass', 'wash', 'chop', 'fiddle', 'kit'], vol: { kit: 0.75 }, lowpass: 4200, level: 0.7 },
    lift: { solo: ['sing', 'pluck', 'bass', 'ratchet'], inst: { sing: 'oohs' }, vol: { sing: 0.7, bass: 0.6 }, level: 0.85 },
    break: { solo: ['timp', 'strings', 'trem', 'low'], inst: { strings: 'slowstrings' }, vol: { timp: 1.2 }, level: 0.9 },
    sewer: { solo: ['sing', 'grind', 'toms', 'bass'], inst: { sing: 'distlead', bass: 'synthbass' }, vol: { sing: 0.45, bass: 0.55 }, rev: { sing: 0.5 }, lowpass: 3200, level: 0.8 },
    river: { solo: ['sing', 'pluck', 'chop', 'strings', 'timp', 'fiddle', 'cello'], inst: { sing: 'horn', pluck: 'flute', chop: 'harp' }, vol: { sing: 0.85, pluck: 0.6, chop: 0.8, strings: 0.8, fiddle: 0.6 }, rev: { sing: 0.45, pluck: 0.4 } },
    chipper: { solo: ['pluck', 'roll', 'low', 'strings', 'trem', 'timp'], inst: { pluck: 'squarelead' }, vol: { pluck: 0.6, timp: 1.1 }, level: 0.95 },
  },
};
