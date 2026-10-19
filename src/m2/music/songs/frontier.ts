// WILDERNESS LAND's music (land id 'frontier'): the land's theme, a version of it for every stretch, and its set
// pieces' own songs (the train, the saloon brawl, the high-noon duel and its DRAW!, Timber Tumble). The fights (the
// TEENAGERS' Road Rash chase, Tucker) are in frontierBosses.ts.
//
// ---- "BIG FAKE COUNTRY" (land:frontier) ----
// The park's frontier, scored the way Hollywood scored the West when the West was a backlot: an open-range main title
// (Jerome Moross's The Big Country, Elmer Bernstein's Magnificent Seven) on a theme-park budget, a harmonica out front
// and a woodblock clip-clopping under it like Grofe's donkey. Written in C, played in B major (every pitched part
// tr -1: nobody else has B), 100, straight. 36 bars: a 4-bar horn call (once: C - F/C - C - G7, the timpani rolling
// up into it), then the 32-bar loop:
//   A1 (8)  C - C - F - C - Am - F - D7 - G7: the hook on harmonica (a wide-open cowboy tune: up the fourth, the third
//           held), the upright's boom on one and three, the steel guitar's chick on two and four, a banjo rolling.
//   A2 (8)  C - C/E - F - Fm - C/G - A7 - D7 G7 - C: the minor iv's sigh (the A-flat), the fiddle's counterline under.
//   B  (8)  F - C/E - Dm7 - G - E-flat - B-flat - F - G7sus G7: the Big Country sweep, the tune on the string section
//           with the horns under it, the flat-three and flat-seven of every widescreen sunset.
//   C  (8)  Am - E7 - Am - E7 - F - C - Dm7 - G7: "On the Trail": the lope, the tune whistled (flute), a hee-HAW leap
//           in it, the clip-clop up front.
// ARRANGEMENTS (cues.ts: the section, and in the town and the log ride the HUD's stretch):
//   wilds     (and main) the whole western band
//   train     the stood-still train on a revisit: a lonesome harmonica, the steel guitar, the upright, the hooves
//   town / gulch  Main Street's band: the tune on the fiddle, honky-tonk stride piano, banjo, a tuba for the bass
//   saloon    the saloon's piano player, both hands, before anybody's started anything (the brawl is seq:brawl)
//   mill      the mill pond and the sawmill: a lumberjack polka (clarinet, accordion, banjo, tuba, the woodblock
//             hammering)
//   mine      the Mother Lode: the harmonica far off down a shaft, a cello drone, celesta drips, muffled
//   logride   (Timber Tumble's own song is seq:log-ride) the ride's speakers: a calliope, muffled
//   sewer     (fallback) a theremin, the drone, the drips
//   river     (fallback) the real river: flute, strings, horns, timpani, oohs, a nylon guitar
//   woods     the REAL woods outside the park: the tune on a plain flute over a fingerpicked nylon guitar, a warm pad,
//             oohs: the first sincere thing in the land
//   dirtbike  the trail either side of the chase: the woods with the harmonica back
//   arena     the clearing, the body on the branch: a lone whistle a long way off, the drone, oohs
//   hush      the fake-out's beat before he pops: the drone and nothing else
//   cutscene  the harmonica soft, the nylon guitar, a pad, the upright
//   boss      the band, the timpani and kit up
//
// ---- "FARE EVASION" (seq:train) ----
// The train, caboose to engine: Morricone meets a runaway locomotive. A twangy guitar through the echo on the tune,
// a whistle (flute) answering, a mariachi trumpet, a wordless choir and tolling bells, the strings churning the train's
// rhythm in sixteenths, the brushes' train beat (chugga-chugga), a galloping bass, a whip at the end of every phrase,
// the harmonica's train whistle.
// E minor, 148. 36 bars: a 4-bar pull-out (once: the whistle, the train beat getting up to speed, the bell), then A
// (Em - Em - C - D - Em - Em - Am - B7: the twang), A2 (the trumpet an octave up, the choir under), B (G - D - Em - C -
// Am - Em - C - B7: the choir and the trumpet in unison, the bells), C (Em - F - Em - F - Am - B7 - Em - B7: the
// horns' Phrygian menace, the twang arpeggiating).
// ARRANGEMENTS (cues.ts trainArr): run (the run for the caboose), roof (on top, and main: everything), inside (in a
// car: thinner, the wind gone), tunnel (in the dark: the beat, the bass, the horns, oohs, muffled), engine (Tucker's
// insult and the KILL: the bells, the twang, the strings, timpani), crash (the shot, the close-up, the crash).
//
// ---- "LAST CALL" (seq:brawl) ----
// The saloon's BRAWL!: the piano player doesn't stop, he speeds up. A ragtime two-step at a gallop (C, 208): the
// piano's right hand on the tune, stride in the left, a banjo, a tuba, a clarinet squealing over it, trombone smears,
// a slide whistle (theremin) every eight bars, slapsticks on the punches. A glissando and a crash to start it (once).
// A (C - C - G7 x4 - C - C), B (F - F - C - C - D7 - D7 - G7 - G7, the trumpet's shout chorus), A2 (the clarinet and
// the trumpet with it, to C7), C (Am - E7 - Am - E7 - F - C - D7 - G7: the minor punch-up, the trombone and tuba).
//
// ---- "HIGH NOON" (seq:duel) and "DRAW!" (seq:draw) ----
// The Wild West Show's duel. The standoff (A minor, 66): a tolling bell, a whistle with a wide vibrato, the twang's
// tremolo, a muted heartbeat, a pocket watch's music-box chime, a ticking woodblock, a string drone; the trumpet takes
// the tune for its second half (the deguello). Arrangements: standoff (the intro: the announcer, him walked to his
// mark), tense (the duel itself, waiting for the DRAW!: the tick, the heartbeat, the drone, the bell). Then DRAW! is
// its own song, so it can start on the call: a stinger (an orchestra hit, a brass stab falling off, the crash, the
// whip, timpani), then a galop in A minor (164) for the posse he gets for cheating, or the crowd as he walks off.
//
// ---- "TIMBER TUMBLE" (seq:log-ride) ----
// The log ride's own song, sung by its animatronic lumberjacks: a jaunty jug-band singalong (Country Bear Jamboree,
// Splash Mountain), D major, 132. The tune on the choir with a banjo doubling it, a fiddle, a jug (tuba), a washboard
// (shaker and woodblock), a steel guitar's chop, a slide whistle down every drop. 34 bars: a "HEY-HO" pickup (once),
// A (D - D - G - D - D - B7 - E7 A7 - D), B (G - G - D - B7 - Em - A7 - D - A7), A again, C (the verse in B minor: Bm
// - Bm - F#7 - F#7 - Bm - Bm - E7 - A7).
// ARRANGEMENTS (cues.ts logArr): queue (the town's queue: the ride's speakers, muffled), station (the platform and the
// booth's scene), ride (the tracked ride: everything), lift (the chain: the banjo, humming, a ratchet), break (the
// giant saw: the band's gone, timpani and low strings), sewer (FERAL: the tune on a distorted lead, a synth-bass grind
// a half step off, tribal toms, muffled), river (REAL: the tune on French horns, a flute, harp, cello, strings and
// timpani: a nature documentary), chipper (the sluice: the tune on a xylophone over a snare roll and a trombone
// ostinato, the strings and timpani).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, chord, bars, hi, cut } from './jungle';

const roll = (n: string, o = 2) => `o${o} _v50 [${n}32]8 _v70 [${n}32]8 _v90 [${n}32]8 _v110 [${n}32]8`;
const g1 = (b: Bar) => (typeof b === 'string' ? b : b[0]);

// =====================================================================================================================
// BIG FAKE COUNTRY (written in C: every pitched part tr -1, B major)

const WV: Record<string, string[]> = {
  C: ['4c', '4e', '4g'], 'F/C': ['4c', '4f', '4a'], G7: ['3b', '4d', '4f', '4g'], F: ['4c', '4f', '4a'], Am: ['4c', '4e', '4a'],
  D7: ['4c', '4d', '4f+', '4a'], 'C/E': ['4e', '4g', '5c'], Fm: ['4c', '4f', '4a-'], 'C/G': ['4e', '4g', '5c'], A7: ['4c+', '4e', '4g', '4a'],
  Dm7: ['4d', '4f', '4a', '5c'], G: ['3b', '4d', '4g'], Eb: ['4e-', '4g', '4b-'], Bb: ['4d', '4f', '4b-'], G7sus: ['4c', '4d', '4f', '4g'],
  E7: ['3b', '4d', '4e', '4g+'],
};
const WR: Record<string, [string, string]> = {
  C: ['c', 'g'], 'F/C': ['c', 'f'], G7: ['g', 'd'], F: ['f', 'c'], Am: ['a', 'e'], D7: ['d', 'a'], 'C/E': ['e', 'g'], Fm: ['f', 'c'],
  'C/G': ['g', 'c'], A7: ['a', 'e'], Dm7: ['d', 'a'], G: ['g', 'd'], Eb: ['e-', 'b-'], Bb: ['b-', 'f'], G7sus: ['g', 'd'], E7: ['e', 'b'],
};
const W_IN: Bar[] = ['C', 'F/C', 'C', 'G7'];
const W_A1: Bar[] = ['C', 'C', 'F', 'C', 'Am', 'F', 'D7', 'G7'];
const W_A2: Bar[] = ['C', 'C/E', 'F', 'Fm', 'C/G', 'A7', ['D7', 'G7'], 'C'];
const W_B: Bar[] = ['F', 'C/E', 'Dm7', 'G', 'Eb', 'Bb', 'F', ['G7sus', 'G7']];
const W_C: Bar[] = ['Am', 'E7', 'Am', 'E7', 'F', 'C', 'Dm7', 'G7'];
const W_LOOP: Bar[] = [...W_A1, ...W_A2, ...W_B, ...W_C];
const W_ALL: Bar[] = [...W_IN, ...W_LOOP];

// ---- The tune ----
const WM_A1 = [
  'o4 g4 o5 c4 e4. d8',
  'o5 c2 o4 g4 a8 b8',
  'o5 c4 f4 a4. g8',
  'o5 e2. r8 e8',
  'o5 e4 a4 o6 c4. o5 b8',
  'o5 a4 f4 c4 d8 e8',
  'o5 f+4 a4 o6 c4 o5 a4',
  'o5 g2. r4',
];
const WM_A2 = [
  'o4 g4 o5 c4 e4. d8',
  'o5 c2 o4 g4 a8 b8',
  'o5 c4 f4 a4. g8',
  'o5 _b-1 a-2. g8 f8',
  'o5 e4 g4 c4. d8',
  'o5 e4 c+4 o4 a4 o5 e4',
  'o5 d4 f+8 a8 g4 f8 d8',
  'o5 c2. r4',
];
const WM_B = [
  'o5 a2. g8 f8',
  'o5 g2 e2',
  'o5 f2. e8 d8',
  'o5 d2 g2',
  'o5 g2. f8 e-8',
  'o5 f2 d2',
  'o5 c4 f4 a4 o6 c4',
  'o6 c2 o5 b2',
];
const WM_C = [
  'o5 e8 a8 r8 a8 g+8 a8 b4',
  'o6 d4 o5 b4 g+4 e4',
  'o5 c8 e8 r8 e8 d+8 e8 a4',
  'o5 g+2 o6 e4 o5 e4',
  'o5 f8 a8 r8 a8 g8 a8 o6 c4',
  'o5 g2 e4 c4',
  'o5 d8 f8 a8 o6 c8 o5 b8 a8 f8 d8',
  'o5 g4 o4 g4 b4 r4',
];
/** The fiddle's counterline under A2 (an octave under the tune). */
const W_COUNTER = ['o4 e2 g2', 'o4 g2 e2', 'o4 f2 a2', 'o4 a-1', 'o4 g2 e2', 'o4 g2 e2', 'o4 f+2 f2', 'o4 e2. r4'];
/** The horns: the call, and long tones under B. */
const W_HORN_IN = ['o3 g4. o4 c8 g2', 'o4 a4. g8 f2', 'o4 e4. g8 o5 c2', 'o4 b2 g4 r4'];
const W_HORN_B = ['o4 c1', 'o4 c1', 'o4 a2 f2', 'o4 b1', 'o4 b-1', 'o4 b-2 a-2', 'o4 a1', 'o4 g1'];

const wPads = (prog: Bar[]) => bars(prog, (c, b) => chord(WV[c], b === 4 ? '1' : '2'));
/** The banjo's forward roll. */
const wRoll = (prog: Bar[]) => bars(prog, (c, b) => { const v = WV[c]; return cut([v[0], v[1], v[2], hi(v[0]), v[1], v[2], hi(v[0]), v[2]].map((n, i) => nt(n, '8', i % 3 === 0 ? '!' : '')), b); });
/** The steel guitar's chick on two and four. */
const wChick = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(WV[c], '8'); return b === 4 ? `r4 ${x} r8 r4 ${x} r8` : `r4 ${x} r8`; });
/** The boom: the root on one, the other on three. */
const wBoom = (prog: Bar[]) => bars(prog, (c, b) => { const [r, a] = WR[c]; return b === 4 ? `o2 ${r}4 r4 ${a}4 r4` : `o2 ${r}4 r4`; });
/** Stride piano. */
const wStride = (prog: Bar[]) => bars(prog, (c, b) => { const [r, a] = WR[c], x = chord(WV[c], '4'); return b === 4 ? `o2 ${r}4 ${x} o2 ${a}4 ${x}` : `o2 ${r}4 ${x}`; });
/** The accordion's pah. */
const wPah = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(WV[c], '4'); return b === 4 ? `r4 ${x} r4 ${x}` : `r4 ${x}`; });
/** The nylon guitar, fingerpicked. */
const wPick = (prog: Bar[]) => bars(prog, (c, b) => { const v = WV[c]; return cut([v[0], v[2], hi(v[0]), v[1], hi(v[0]), v[2], v[1], v[2]].map(n => nt(n, '8')), b); });
const wDrone = (prog: Bar[]) => bars(prog, (c, b) => `o2 ${WR[c][0]}${b === 4 ? '1' : '2'}`);
/** Celesta drips, every other bar, off the top of the chord. */
const wDrips = (prog: Bar[]) => prog.map((b, i) => (i % 2 ? 'r1' : `${nt(hi(WV[g1(b)][2]), '8')} r8 r2 ${nt(hi(WV[g1(b)][0]), '16')} r16 r8`));

const CLIP = '(woodblock)8. (woodblocklo)16 (woodblock)8. (woodblocklo)16 (woodblock)8. (woodblocklo)16 (woodblock)8. (woodblocklo)16';
const LOPE = 'k4 s8 ?s8 k8 k8 s8 ?s8';
const LOPE_FILL = 'k4 s8 s8 s16 s16 s16 s16 s8 s8';

const ONLY_TUNE = ['train', 'town', 'gulch', 'saloon', 'mill', 'mine', 'logride', 'sewer', 'river', 'woods', 'dirtbike', 'arena', 'cutscene'];

export const LAND_FRONTIER: Song = {
  title: 'Big Fake Country',
  bpm: 100,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.25, tone: 2600 },
  parts: {
    // (the wilds' lead: harmonica on the A's, the tune whistled for C; B is the strings')
    lead: { inst: 'harmonica', tr: -1, pan: 0, rev: 0.25, dly: 0.08, not: ONLY_TUNE, mml: join(['_v100'], rest(4), WM_A1, WM_A2, rest(8), ['@flute _m28 _v95'], WM_C) },
    // (the whole tune on one instrument, for the arrangements that re-voice it)
    tune: { inst: 'harmonica', tr: -1, pan: 0, rev: 0.28, dly: 0.08, only: ONLY_TUNE, mml: join(['_v95'], rest(4), WM_A1, WM_A2, WM_B, WM_C) },
    counter: { inst: 'violin', tr: -1, pan: 0.3, rev: 0.3, vol: 0.55, mml: join(['_v85'], rest(12), W_COUNTER, rest(16)) },
    sweep: { inst: 'strings', tr: -1, pan: 0.15, rev: 0.4, vol: 0.85, mml: join(['_v100'], rest(20), WM_B, rest(8)) },
    pad: { inst: 'slowstrings', tr: -1, pan: -0.1, rev: 0.4, vol: 0.32, mml: join(['_v80'], wPads(W_ALL)) },
    horns: { inst: 'horn', tr: -1, pan: -0.3, rev: 0.35, vol: 0.7, mml: join(['_v100'], W_HORN_IN, rest(16), ['_v85'], W_HORN_B, rest(8)) },
    banjo: { inst: 'banjo', tr: -1, pan: 0.4, rev: 0.15, vol: 0.42, mml: join(['q5 _v95'], rest(4), wRoll(W_LOOP)) },
    steel: { inst: 'steelgtr', tr: -1, pan: -0.4, rev: 0.18, vol: 0.5, mml: join(['q3 _v90'], rest(4), wChick(W_LOOP)) },
    bass: { inst: 'upright', tr: -1, pan: 0, rev: 0.08, vol: 0.85, mml: join(['q6 _v105'], wBoom(W_ALL)) },
    clip: {
      inst: 'kick', drums: true, pan: 0.2, rev: 0.15, vol: 0.55, not: ['saloon', 'mine', 'sewer', 'woods', 'arena', 'hush', 'cutscene', 'river'],
      mml: join(['_v50'], rest(2), rep(CLIP, 2), ['_v75'], rep(CLIP, 16), ['_v55'], rep(CLIP, 8), ['_v100'], rep(CLIP, 8)),
    },
    kit: {
      inst: 'kicksoft', drums: true, kit: 'brush', rev: 0.2, vol: 0.7, not: ['saloon', 'mine', 'sewer', 'woods', 'arena', 'hush', 'cutscene', 'train', 'logride', 'river', 'dirtbike'],
      mml: join(['_v95'], rest(4), [...rep(LOPE, 7), LOPE_FILL], [...rep(LOPE, 7), LOPE_FILL], [...rep(LOPE, 7), LOPE_FILL], [...rep(LOPE, 7), LOPE_FILL]),
    },
    timpani: {
      inst: 'timpani', tr: -1, pan: 0.1, rev: 0.35, vol: 0.6,
      mml: join(['o2 _v80 c4 r2.', 'o2 c4 r2.', 'o2 c4 r4 g4 r4', roll('g')], ['_v100 o2 c4 r2.'], rest(7), ['o2 c4 r2.'], rest(6), [roll('g')], ['o2 f4 r2.'], rest(3), ['o2 e-4 r2.', 'r1', 'o2 f4 r2.', roll('g')], ['o2 a4 r2.'], rest(6), [roll('g')]),
    },
    piano: { inst: 'piano', tr: -1, pan: -0.2, rev: 0.2, vol: 0.6, only: ['town', 'gulch', 'saloon'], mml: join(['q5 _v90'], wStride(W_ALL)) },
    accordion: { inst: 'accordion', tr: -1, pan: -0.25, rev: 0.2, vol: 0.45, only: ['mill'], mml: join(['q4 _v90'], wPah(W_ALL)) },
    drone: { inst: 'cello', tr: -1, pan: -0.1, rev: 0.45, vol: 0.45, only: ['mine', 'sewer', 'arena', 'hush'], mml: join(['q8 _v80'], wDrone(W_ALL)) },
    drips: { inst: 'celesta', tr: -1, pan: 0.35, rev: 0.6, dly: 0.35, vol: 0.35, only: ['mine', 'sewer'], mml: join(['_v80'], wDrips(W_ALL)) },
    oohs: { inst: 'oohs', tr: -1, pan: 0, rev: 0.5, vol: 0.35, only: ['woods', 'dirtbike', 'arena', 'river', 'cutscene'], mml: join(['_v75'], wPads(W_ALL)) },
    nylon: { inst: 'nylongtr', tr: -1, pan: -0.3, rev: 0.25, vol: 0.5, only: ['woods', 'dirtbike', 'river', 'cutscene'], mml: join(['q7 _v85'], wPick(W_ALL)) },
  },
  arrangements: {
    main: {},
    wilds: {},
    train: { solo: ['tune', 'steel', 'bass', 'clip'], vol: { tune: 0.75, clip: 0.4, steel: 0.4 }, rev: { tune: 0.4 }, level: 0.75 },
    town: { solo: ['tune', 'piano', 'banjo', 'bass', 'kit', 'clip', 'horns'], inst: { tune: 'violin', bass: 'tuba' }, vol: { tune: 0.8, banjo: 0.55, clip: 0.35, horns: 0.5 } },
    gulch: { solo: ['tune', 'piano', 'banjo', 'bass', 'kit', 'clip', 'horns'], inst: { tune: 'violin', bass: 'tuba' }, vol: { tune: 0.8, banjo: 0.55, clip: 0.35, horns: 0.5 } },
    saloon: { solo: ['tune', 'piano'], inst: { tune: 'piano' }, vol: { tune: 0.75, piano: 0.65 }, rev: { tune: 0.15, piano: 0.15 }, level: 0.85 },
    mill: { solo: ['tune', 'accordion', 'banjo', 'bass', 'clip', 'kit'], inst: { tune: 'clarinet', bass: 'tuba' }, vol: { tune: 0.8, clip: 0.85, banjo: 0.5 } },
    mine: { solo: ['tune', 'drone', 'drips'], vol: { tune: 0.6, drone: 0.5 }, rev: { tune: 0.65 }, lowpass: 4500, level: 0.7 },
    logride: { solo: ['tune', 'banjo', 'bass', 'clip'], inst: { tune: 'calliope', bass: 'tuba' }, vol: { tune: 0.7 }, lowpass: 2600, level: 0.6 },
    sewer: { solo: ['tune', 'drone', 'drips'], inst: { tune: 'theremin' }, vol: { tune: 0.45 }, rev: { tune: 0.6 }, lowpass: 2200, level: 0.6 },
    river: {
      solo: ['tune', 'sweep', 'pad', 'horns', 'timpani', 'oohs', 'nylon', 'bass'],
      inst: { tune: 'flute', bass: 'cello' }, vol: { tune: 0.85, pad: 0.6, sweep: 0.7, nylon: 0.45 }, rev: { tune: 0.4 },
    },
    woods: {
      solo: ['tune', 'nylon', 'pad', 'oohs'], inst: { tune: 'flute', pad: 'warmpad' },
      vol: { tune: 0.7, pad: 0.45, oohs: 0.3, nylon: 0.6 }, rev: { tune: 0.4 }, level: 0.8,
    },
    dirtbike: { solo: ['tune', 'nylon', 'pad', 'oohs', 'bass'], inst: { pad: 'warmpad' }, vol: { tune: 0.7, pad: 0.45, oohs: 0.3, nylon: 0.6, bass: 0.5 }, level: 0.8 },
    arena: { solo: ['tune', 'drone', 'oohs'], inst: { tune: 'flute' }, vol: { tune: 0.45, oohs: 0.3, drone: 0.5 }, rev: { tune: 0.65 }, level: 0.65 },
    hush: { solo: ['drone'], vol: { drone: 0.45 }, level: 0.5 },
    cutscene: { solo: ['tune', 'nylon', 'pad', 'bass'], vol: { tune: 0.65, pad: 0.45, bass: 0.45, nylon: 0.5 }, rev: { tune: 0.4 }, level: 0.75 },
    boss: { vol: { timpani: 1.3, kit: 1.2, horns: 1.1 } },
  },
};

// =====================================================================================================================
// FARE EVASION

const TV: Record<string, string[]> = {
  Em: ['3b', '4e', '4g'], C: ['4c', '4e', '4g'], D: ['4d', '4f+', '4a'], Am: ['4c', '4e', '4a'], B7: ['3b', '4d+', '4f+', '4a'],
  G: ['3b', '4d', '4g'], F: ['4c', '4f', '4a'],
};
const TR: Record<string, [string, string]> = { Em: ['e', 'b'], C: ['c', 'g'], D: ['d', 'a'], Am: ['a', 'e'], B7: ['b', 'f+'], G: ['g', 'd'], F: ['f', 'c'] };
const T_IN: Bar[] = ['Em', 'Em', 'Em', 'B7'];
const T_A: Bar[] = ['Em', 'Em', 'C', 'D', 'Em', 'Em', 'Am', 'B7'];
const T_A2: Bar[] = ['Em', 'Em', 'C', 'D', 'Em', 'Em', ['Am', 'B7'], 'Em'];
const T_B: Bar[] = ['G', 'D', 'Em', 'C', 'Am', 'Em', 'C', 'B7'];
const T_C: Bar[] = ['Em', 'F', 'Em', 'F', 'Am', 'B7', 'Em', 'B7'];
const T_LOOP: Bar[] = [...T_A, ...T_A2, ...T_B, ...T_C];
const T_ALL: Bar[] = [...T_IN, ...T_LOOP];

const TM_A0 = ['o4 e4. e8 g8 a8 b4', 'o4 b8 a8 g8 a8 e2', 'o4 e4. e8 g8 a8 o5 c4', 'o5 d8 c8 o4 b8 a8 f+2', 'o4 e4. e8 g8 a8 b4', 'o5 e8 d8 o4 b8 g8 e2'];
const TM_A = [...TM_A0, 'o4 a4. a8 o5 c8 o4 b8 a4', 'o4 b2 d+4 f+4'];
const TM_A2 = [...TM_A0, 'o4 a4 o5 c4 o4 b4 d+4', 'o4 e2. r4'];
const TM_B = ['o5 d2 o4 b4 g4', 'o5 a2 f+4 d4', 'o5 g2. e4', 'o5 e1', 'o5 c2 e4 a4', 'o5 b2 g4 e4', 'o5 e2 c4 e4', 'o5 f+2 d+2'];
const TM_C = ['o3 b2 o4 e2', 'o4 f1', 'o3 b2 o4 e2', 'o4 f2 a2', 'o4 a2 o5 c2', 'o4 b2 a2', 'o4 g2 e2', 'o4 f+2 d+2'];
/** The whistle's answers in A (in the twang's held notes). */
const T_WH = ['r1', 'r2 o6 e8 d8 o5 b4', 'r1', 'r2 o6 d8 c8 o5 a4', 'r1', 'r2 o5 g8 a8 b4', 'r1', 'r2 o5 f+8 a8 b4'];
/** The train whistle (harmonica chords, scooped and falling off). */
const WHOO = 'o5 _b-2 {g b >e}4. r8 _f-3 {g b >e}2';

const tArp = (prog: Bar[]) => bars(prog, (c, b) => { const v = TV[c]; return cut([v[0], v[1], v[2], v[1], hi(v[0]), v[2], v[1], v[2]].map((n, i) => nt(n, '8', i === 0 || i === 4 ? '!' : '')), b); });
/** The strings churning the train's rhythm. */
const tChurn = (prog: Bar[]) => bars(prog, (c, b) => { const v = TV[c]; const g = `${nt(v[1], '16', '!')} ${nt(v[1], '16')} ${nt(v[2], '16')} ${nt(v[1], '16')}`; return Array(b).fill(g).join(' '); });
const tGallop = (prog: Bar[]) => bars(prog, (c, b) => { const [r, a] = TR[c]; return b === 4 ? `o2 ${r}8 ${r}16 ${r}16 ${a}8 ${r}16 ${r}16 ${r}8 ${r}16 ${r}16 ${a}8 ${a}8` : `o2 ${r}8 ${r}16 ${r}16 ${a}8 ${r}16 ${r}16`; });
const tPads = (prog: Bar[]) => bars(prog, (c, b) => chord(TV[c], b === 4 ? '1' : '2'));

const TB = '{kh}16 ?s16 s16 ?s16 !{sh}16 ?s16 s16 ?s16 {kh}16 ?s16 s16 ?s16 !{sh}16 ?s16 s16 ?s16';
const BACK = 'k4 s4 k8 k8 s4';
const BACK_IN = '{kx}4 s4 k8 k8 s4';
const BACK_FILL = 'k4 s4 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom3)16 (tom4)8';
const BACK_HALF = '{kx}4 r4 s4 r4';
const BACK_HALF2 = 'k4 r4 s4 r8 k8';
/** The whip at the end of every eight. */
const WHIP8 = [...rest(7), 'r2. a4'];

export const SEQ_TRAIN: Song = {
  title: 'Fare Evasion',
  bpm: 148,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.75,
  delay: { beats: 0.75, feedback: 0.32, tone: 2400 },
  parts: {
    twang: { inst: 'cleangtr', pan: -0.15, rev: 0.35, dly: 0.3, cho: 0.15, mml: join(['_v110'], rest(4), TM_A, TM_A2, rest(8), ['_v95'], tArp(T_C)) },
    whistle: { inst: 'flute', pan: 0.3, rev: 0.4, dly: 0.2, vol: 0.7, vib: [5.5, 30, 0.15], mml: join(['_v95'], rest(4), T_WH, rest(24)) },
    trumpet: { inst: 'trumpet', pan: 0.15, rev: 0.35, vol: 0.75, mml: join(['_v105'], rest(12), up(TM_A2), ['_v100'], TM_B, rest(8)) },
    choir: { inst: 'choir', pan: 0, rev: 0.5, vol: 0.55, mml: join(['_v70'], rest(12), tPads(T_A2), ['_v95'], TM_B, ['_v75'], tPads(T_C)) },
    horns: { inst: 'horn', pan: -0.3, rev: 0.4, vol: 0.75, mml: join(['_v90'], rest(28), ['_v110'], TM_C) },
    strings: { inst: 'strings', pan: 0.25, rev: 0.3, vol: 0.35, mml: join(['q5 _v90'], rest(2), tChurn(T_ALL.slice(2))) },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.8, mml: join(['q6 _v105'], rest(2), tGallop(T_ALL.slice(2))) },
    beat: { inst: 'kicksoft', drums: true, kit: 'brush', rev: 0.15, vol: 0.75, mml: join(['_v40 ' + TB, '_v60 ' + TB, '_v85 ' + TB, '_v105 ' + TB], rep(TB, 32)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.2, vol: 0.6,
      mml: join(rest(4), ['_v100'], [BACK_IN, ...rep(BACK, 6), BACK_FILL], [BACK_IN, ...rep(BACK, 6), BACK_FILL], [BACK_IN, ...rep(BACK, 6), BACK_FILL], ['_v105'], [BACK_HALF, ...rep(BACK_HALF2, 6), BACK_FILL]),
    },
    whip: { inst: 'slapstick', drums: true, pan: 0.35, rev: 0.3, vol: 0.6, mml: join(['_v110'], rest(4), WHIP8, WHIP8, WHIP8, WHIP8) },
    bell: { inst: 'chimes', pan: 0.4, rev: 0.5, vol: 0.45, mml: join(['_v90'], ['o5 e2 e2', 'r1', 'o5 e2 e2', 'r1'], rest(16), ['_v95'], T_B.map((c, i) => (i % 2 ? 'r1' : `o5 ${TR[g1(c)][0]}2 r2`)), ['o5 e1', 'o5 f1', 'o5 e1', 'o5 f1', 'r1', 'r1', 'o5 e1', 'r1']) },
    toot: { inst: 'harmonica', pan: -0.35, rev: 0.45, vol: 0.55, mml: join(['_v100'], [WHOO, 'r1', WHOO, 'r1'], rest(15), [WHOO], rest(7), [WHOO], rest(8)) },
    timpani: {
      inst: 'timpani', pan: 0.1, rev: 0.35, vol: 0.6,
      mml: join(['r1', 'r1', 'o2 _v90 e4 r2.', roll('b', 1)], ['_v100 o2 e4 r2.'], rest(7), ['o2 e4 r2.'], rest(6), [roll('b', 1)], ['o2 g4 r2.'], rest(6), [roll('b', 1)], ['o2 e4 r2.', 'o2 f4 r2.', 'o2 e4 r2.', 'o2 f4 r2.', 'o2 a4 r2.', 'o1 b4 r2.', 'o2 e4 r2.', roll('b', 1)]),
    },
  },
  arrangements: {
    main: {},
    roof: {},
    run: { vol: { choir: 0.8 } },
    inside: { mute: ['kit', 'choir', 'horns', 'whip'], vol: { beat: 0.75, strings: 0.7, twang: 0.9 }, lowpass: 5000, level: 0.85 },
    tunnel: { solo: ['beat', 'bass', 'horns', 'choir', 'strings', 'toot', 'timpani'], inst: { choir: 'oohs' }, vol: { choir: 0.8, strings: 0.6 }, rev: { horns: 0.55 }, lowpass: 2400, level: 0.8 },
    engine: { solo: ['bell', 'strings', 'bass', 'timpani', 'twang', 'beat', 'whip', 'horns'], vol: { bell: 0.7, timpani: 0.8 }, level: 0.9 },
    crash: { solo: ['strings', 'choir', 'timpani', 'horns', 'bell'], vol: { choir: 0.75 }, level: 0.8 },
  },
};

// =====================================================================================================================
// LAST CALL

const BV: Record<string, string[]> = {
  C: ['4c', '4e', '4g'], G7: ['3b', '4d', '4f', '4g'], F: ['4c', '4f', '4a'], D7: ['4c', '4d', '4f+', '4a'], Am: ['4c', '4e', '4a'],
  E7: ['3b', '4d', '4e', '4g+'], C7: ['4c', '4e', '4g', '4b-'],
};
const BR: Record<string, [string, string]> = { C: ['c', 'g'], G7: ['g', 'd'], F: ['f', 'c'], D7: ['d', 'a'], Am: ['a', 'e'], E7: ['e', 'b'], C7: ['c', 'g'] };
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
/** The trombone: a smear into every eight, and the bouncer's line under C. */
const BONE_END = 'r2 _b-5 o3 g4 _f-5 o3 g4';
const BONE_C = ['o3 a2 e2', 'o3 g+2 e2', 'o3 a2 c2', 'o3 b2 _f-4 e2', 'o3 f2 a2', 'o3 g2 e2', 'o3 f+2 a2', BONE_END];
const SLIDE = '_g4 o5 c4 o6 c4 o5 c4 _g0 r4';

const bStride = (prog: Bar[]) => bars(prog, (c, b) => { const [r, a] = BR[c], x = chord(BV[c], '4'); return b === 4 ? `o2 ${r}4 ${x} o2 ${a}4 ${x}` : `o2 ${r}4 ${x}`; });
const bOom = (prog: Bar[]) => bars(prog, (c, b) => { const [r, a] = BR[c]; return b === 4 ? `o2 ${r}4 r4 ${a}4 r4` : `o2 ${r}4 r4`; });
const bChop = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(BV[c], '4'); return b === 4 ? `r4 ${x} r4 ${x}` : `r4 ${x}`; });

const TWO = 'k4 s4 k4 s4';
const TWO_IN = '{kx}4 s4 k4 s4';
const TWO_FILL = 'k4 s4 s8 s8 (tom1)8 (tom3)8';
const PUNCH = 'r2. a4';

export const SEQ_BRAWL: Song = {
  title: 'Last Call',
  bpm: 208,
  loopFrom: 8,
  reverb: 'room',
  reverbMix: 0.8,
  parts: {
    rh: {
      inst: 'piano', pan: 0.1, rev: 0.15, vol: 0.9,
      mml: join(['q6 _v110 o6 c32 o5 b32 a32 g32 f32 e32 d32 c32 o4 b32 a32 g32 f32 e32 d32 c32 o3 b32 o4 {c e g}4 r4', 'o3 {g b >d f}4 r4 o4 g8 a8 b8 o5 d8'], BM_A, BM_B, up(BM_A2), BM_C),
    },
    lh: { inst: 'piano', pan: -0.15, rev: 0.15, vol: 0.6, mml: join(['q5 _v95'], ['r1', 'r1'], bStride(B_LOOP)) },
    clarinet: { inst: 'clarinet', pan: 0.35, rev: 0.2, vol: 0.6, mml: join(['_v100'], rest(18), BM_A2, BM_C) },
    trumpet: { inst: 'trumpet', pan: -0.3, rev: 0.22, vol: 0.65, mml: join(['_v110'], rest(10), BM_B, rest(16)) },
    bone: { inst: 'trombone', pan: -0.2, rev: 0.2, vol: 0.6, mml: join(['_v105'], rest(2), [...rest(7), BONE_END], [...rest(7), BONE_END], [...rest(7), BONE_END], BONE_C) },
    tuba: { inst: 'tuba', pan: 0, rev: 0.08, vol: 0.7, mml: join(['q5 _v105'], ['o2 c4 r2.', 'o2 g4 r2.'], bOom(B_LOOP)) },
    banjo: { inst: 'banjo', pan: 0.4, rev: 0.12, vol: 0.4, mml: join(['q3 _v95'], rest(2), bChop(B_LOOP)) },
    slide: { inst: 'theremin', pan: 0.25, rev: 0.25, vol: 0.4, mml: join(['_v100'], rest(2), [...rest(7), SLIDE], [...rest(7), SLIDE], [...rest(7), SLIDE], [...rest(7), SLIDE]) },
    kit: {
      inst: 'kick', drums: true, rev: 0.15, vol: 0.65,
      mml: join(['_v115 {kx}4 r4 r4 s4', '_v80 s8 s8 _v95 s8 s8 _v110 s8 s8 _v120 {s(tom4)}8 {kx}8'], ['_v100'], ...[0, 1, 2, 3].map(() => [TWO_IN, ...rep(TWO, 6), TWO_FILL])),
    },
    smack: { inst: 'slapstick', drums: true, pan: -0.3, rev: 0.2, vol: 0.55, mml: join(['_v110 r2. a4', 'r1'], ...[0, 1, 2, 3].map(() => ['r1', 'r1', 'r1', PUNCH, 'r1', 'r1', 'r1', PUNCH])) },
  },
  arrangements: { main: {} },
};

// =====================================================================================================================
// HIGH NOON and DRAW!

const DV: Record<string, string[]> = {
  Am: ['4c', '4e', '4a'], Dm: ['4d', '4f', '4a'], F: ['4c', '4f', '4a'], E: ['3b', '4e', '4g+'], E7: ['3b', '4d', '4e', '4g+'],
  G: ['3b', '4d', '4g'],
};
const DR: Record<string, [string, string]> = { Am: ['a', 'e'], Dm: ['d', 'a'], F: ['f', 'c'], E: ['e', 'b'], E7: ['e', 'b'], G: ['g', 'd'] };
const D_PROG: Bar[] = ['Am', 'Am', 'Am', 'Am', 'Dm', 'Dm', 'Am', 'Am', 'F', 'F', 'E', 'E', 'Am', 'Am', 'E7', 'Am'];
const DM = ['o5 e2 a2', 'o6 c2. o5 b8 a8', 'o5 b2 e2', 'r1', 'o5 d2 f2', 'o5 a2. g8 f8', 'o5 e1', 'r1', 'o5 f2 a2', 'o6 c2. o5 b-8 a8', 'o5 g+2 b2', 'o6 d2. c8 o5 b8', 'o5 a1', 'r1', 'o5 b2 g+2', 'o5 a2 r2'];
/** The twang's tremolo answers (in the whistle's gaps). */
const D_TWANG = ['r1', 'r1', 'r1', 'o3 a8 o4 e8 a8 o5 c8 e4 r4', 'r1', 'r1', 'r1', 'o3 a8 o4 e8 a8 o5 c8 e4 r4', 'r1', 'r1', 'r1', 'o3 e8 b8 o4 e8 g+8 b4 r4', 'r1', 'o3 a8 o4 e8 a8 o5 c8 e4 r4', 'r1', 'o4 [a32]16 r2'];
/** The pocket watch's chime (a music box). */
const D_WATCH = ['o6 e8 c8 o5 a8 o6 c8 e4 r4', 'r1', 'r1', 'r1', 'o6 f8 d8 o5 a8 o6 d8 f4 r4', 'r1', 'r1', 'r1', 'r1', 'r1', 'r1', 'r1', 'o6 e8 c8 o5 a8 o6 c8 e4 r4', 'r1', 'r1', 'r1'];

export const SEQ_DUEL: Song = {
  title: 'High Noon',
  bpm: 66,
  reverb: 'hall',
  reverbMix: 0.9,
  delay: { beats: 1, feedback: 0.35, tone: 2200 },
  parts: {
    whistle: { inst: 'flute', pan: 0.1, rev: 0.45, dly: 0.2, vib: [5, 38, 0.25], mml: join(['_v95'], DM.slice(0, 8), rest(8)) },
    trumpet: { inst: 'trumpet', pan: -0.1, rev: 0.45, dly: 0.15, vol: 0.75, vib: [5, 25, 0.3], mml: join(['_v95'], rest(8), DM.slice(8)) },
    twang: { inst: 'cleangtr', pan: -0.35, rev: 0.4, dly: 0.35, vol: 0.6, mml: join(['_v95'], D_TWANG) },
    watch: { inst: 'musicbox', pan: 0.4, rev: 0.4, vol: 0.4, mml: join(['_v80'], D_WATCH) },
    drone: { inst: 'slowstrings', pan: 0, rev: 0.45, vol: 0.4, mml: join(['q8 _v80'], bars(D_PROG, c => `o3 ${DR[c][0]}1`)) },
    pad: { inst: 'strings', pan: 0.2, rev: 0.45, vol: 0.25, mml: join(['q8 _v70'], bars(D_PROG, c => chord(DV[c], '1'))) },
    bass: { inst: 'upright', pan: 0, rev: 0.15, vol: 0.6, mml: join(['_v90'], bars(D_PROG, c => `o2 ${DR[c][0]}2 r2`)) },
    bell: { inst: 'chimes', pan: 0.3, rev: 0.6, vol: 0.45, mml: join(['_v90'], D_PROG.map((c, i) => (i % 2 ? 'r1' : `o4 ${DR[g1(c)][0]}2 r2`))) },
    tick: { inst: 'woodblock', drums: true, pan: -0.2, rev: 0.25, vol: 0.35, mml: join(['_v80'], rep('e4 ?e4 e4 ?e4', 16)) },
    heart: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.2, vol: 0.55, mml: join(['_v100'], rep('k8 ?k8 r2.', 16)) },
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
const dGallop = (prog: Bar[]) => bars(prog, c => { const v = DV[c]; return `${[v[1], v[2], v[1], v[2]].map(n => `${nt(n, '16', '!')} ${nt(n, '16')} ${nt(n, '8')}`).join(' ')}`; });
const SNARE_G = '{ks}16 ?s16 !s8 s16 ?s16 !s8 {ks}16 ?s16 !s8 s16 ?s16 !s8';

export const SEQ_DRAW: Song = {
  title: 'DRAW!',
  bpm: 164,
  loopFrom: 4,
  reverb: 'hall',
  reverbMix: 0.85,
  parts: {
    hit: { inst: 'orchhit', pan: 0, rev: 0.4, vol: 0.75, mml: join(['_v120 o4 a4 r2.'], rest(16)) },
    stab: { inst: 'brass', pan: -0.1, rev: 0.35, vol: 0.85, mml: join(['_v120 _f-7/4 o4 {e a >c e}2. r4'], ['_v105'], rest(8), DW.slice(8).map((b, i) => (i % 2 ? 'r1' : `${chord(DV[g1(DW_PROG[8 + i])], '4')} r2.`))) },
    trumpet: { inst: 'trumpet', pan: 0.15, rev: 0.3, vol: 0.8, mml: join(['r1'], ['_v110'], DW) },
    violins: { inst: 'strings', pan: 0.3, rev: 0.3, vol: 0.45, mml: join(['r1'], ['_v100'], DW.slice(0, 8), rest(8)) },
    gallop: { inst: 'pizz', pan: -0.3, rev: 0.25, vol: 0.5, mml: join(['r1'], ['q5 _v100'], dGallop(DW_PROG)) },
    horns: { inst: 'horn', pan: -0.35, rev: 0.4, vol: 0.6, mml: join(['_v110 o3 a2. r4'], ['_v95'], bars(DW_PROG, c => chord(DV[c].slice(0, 2), '1'))) },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.75, mml: join(['_v115 o2 a4 r2.'], ['q6 _v105'], bars(DW_PROG, c => { const [r, a] = DR[c]; return `o2 ${r}4 ${a}4 ${r}4 ${a}4`; })) },
    choir: { inst: 'choir', pan: 0, rev: 0.4, vol: 0.55, mml: join(['_v120 _f-5/4 o4 {a >c e}2. r4'], ['_v115'], DW_PROG.map((c, i) => (i % 4 === 3 ? `r2. ${chord(DV[g1(c)], '8')} r8` : 'r1'))) },
    kit: { inst: 'kick', drums: true, rev: 0.2, vol: 0.65, mml: join(['_v120 {kx(gong)}4 r2.'], ['_v100'], ['{kx}16 ?s16 !s8 s16 ?s16 !s8 {ks}16 ?s16 !s8 s16 ?s16 !s8'], rep(SNARE_G, 7), ['{kx}16 ?s16 !s8 s16 ?s16 !s8 {ks}16 ?s16 !s8 s16 ?s16 !s8'], rep(SNARE_G, 6), ['s16 s16 s16 s16 (tom1)16 (tom1)16 (tom3)16 (tom3)16 (tom4)8 (tom4)8 {kx}4']) },
    whip: { inst: 'slapstick', drums: true, pan: 0.3, rev: 0.3, vol: 0.6, mml: join(['_v120 r8 a8 r2.'], ['_v110'], [...rest(7), 'r2. a4', ...rest(7), 'r2. a4']) },
    timpani: { inst: 'timpani', pan: 0.1, rev: 0.35, vol: 0.65, mml: join(['_v120 o2 a4 r2.'], ['_v100 o2 a4 r2.'], rest(6), [roll('e')], ['o2 a4 r2.'], rest(6), [roll('e')]) },
  },
  arrangements: { main: {} },
};

// =====================================================================================================================
// TIMBER TUMBLE

const LV: Record<string, string[]> = {
  D: ['4d', '4f+', '4a'], G: ['3b', '4d', '4g'], B7: ['3b', '4d+', '4f+', '4a'], E7: ['3b', '4d', '4e', '4g+'], A7: ['4c+', '4e', '4g', '4a'],
  Em: ['3b', '4e', '4g'], Bm: ['3b', '4d', '4f+'], 'F#7': ['4c+', '4e', '4f+', '4a+'],
};
const LR: Record<string, [string, string]> = { D: ['d', 'a'], G: ['g', 'd'], B7: ['b', 'f+'], E7: ['e', 'b'], A7: ['a', 'e'], Em: ['e', 'b'], Bm: ['b', 'f+'], 'F#7': ['f+', 'c+'] };
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
/** "HEY-HO!": the pickup. */
const L_HEY = ['o4 r2 {f+ a >d}4 r4', 'o4 r2 {e g a >c+}4 r4'];
/** The fiddle's counter (B and the C verse). */
const L_FIDDLE_B = ['o5 b2 o6 d2', 'o5 b1', 'o5 a2 f+2', 'o5 a1', 'o5 g2 b2', 'o5 g1', 'o5 f+2 a2', 'o5 g2 a2'];
const L_FIDDLE_C = ['o5 f+1', 'o5 d1', 'o5 e1', 'o5 c+1', 'o5 f+1', 'o5 f+2 d2', 'o5 e1', 'o5 c+2 e2'];
const L_SLIDE = 'r2 _g4 o6 d4 o5 d4 _g0';

const lOom = (prog: Bar[]) => bars(prog, (c, b) => { const [r, a] = LR[c]; return b === 4 ? `o2 ${r}4 r4 ${a}4 r4` : `o2 ${r}4 r4`; });
const lChop = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(LV[c], '8'); return b === 4 ? `r4 ${x} r8 r4 ${x} ${x}` : `r4 ${x} r8`; });
const lPads = (prog: Bar[]) => bars(prog, (c, b) => chord(LV[c], b === 4 ? '1' : '2'));
/** The sewer's grind: the root and a half step over it, in sixteenths, never resolving. */
const lGrind = (prog: Bar[]) => bars(prog, (c, b) => { const r = LR[c][0]; const g = `o2 !${r}16 ${r}16 ${r}16 _k1 ${r}16 _k0`; return Array(b).fill(g).join(' '); });
const lTrem = (prog: Bar[]) => bars(prog, (c, b) => { const v = LV[c]; return `${nt(v[0], '16')} ${nt(v[1], '16')} `.repeat(b * 2).trim(); });

const WASH = 'z16 ?z16 z16 ?z16 {ze}16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 {ze}16 ?z16 z16 z16';
const RATCHET = '(woodblocklo)16 ?(woodblocklo)16 (woodblocklo)16 ?(woodblocklo)16';
const L_TOMS = '(tom4)8 ?(tom4)16 ?(tom4)16 (tom3)8 (tom4)8 (tom4)8 ?(tom4)16 ?(tom4)16 (tom2)8 (tom4)8';
const L_ROLL = '_v60 s32 s32 s32 s32 s32 s32 s32 s32 _v80 s32 s32 s32 s32 s32 s32 s32 s32 _v100 s32 s32 s32 s32 s32 s32 s32 s32 _v115 s32 s32 s32 s32 s32 s32 s32 s32';

export const SEQ_LOG_RIDE: Song = {
  title: 'Timber Tumble',
  bpm: 132,
  loopFrom: 8,
  reverb: 'hall',
  reverbMix: 0.75,
  delay: { beats: 0.5, feedback: 0.22, tone: 3000 },
  parts: {
    sing: { inst: 'choir', pan: 0, rev: 0.3, vol: 0.75, mml: join(['_v110'], L_HEY, ['_v100'], L_TUNE) },
    pluck: { inst: 'banjo', pan: 0.25, rev: 0.15, vol: 0.55, mml: join(['q6 _v100'], rest(2), L_TUNE) },
    fiddle: { inst: 'violin', pan: -0.3, rev: 0.25, vol: 0.45, mml: join(['_v90'], rest(10), L_FIDDLE_B, rest(8), L_FIDDLE_C) },
    jug: { inst: 'tuba', pan: 0, rev: 0.08, vol: 0.75, mml: join(['q5 _v105'], lOom(L_ALL)) },
    chop: { inst: 'steelgtr', pan: -0.4, rev: 0.15, vol: 0.45, mml: join(['q3 _v90'], rest(2), lChop(L_LOOP)) },
    slide: { inst: 'theremin', pan: 0.35, rev: 0.25, vol: 0.4, mml: join(['_v100'], rest(2), ...[0, 1, 2, 3].map(() => [...rest(7), L_SLIDE])) },
    wash: { inst: 'shaker', drums: true, pan: 0.3, rev: 0.12, vol: 0.5, mml: join(['_v95'], rest(2), rep(WASH, 32)) },
    kit: { inst: 'kick', drums: true, rev: 0.15, vol: 0.5, mml: join(['_v100 {kx}4 r4 r2', 's8 s8 s8 s8 (tom1)8 (tom3)8 {kx}4'], rep('k4 s4 k8 k8 s4', 32)) },
    ratchet: { inst: 'woodblocklo', drums: true, pan: -0.25, rev: 0.15, vol: 0.5, only: ['lift'], mml: join(['_v90'], rep(`${RATCHET} ${RATCHET} ${RATCHET} ${RATCHET}`, 34)) },
    grind: { inst: 'synthbass', pan: 0, rev: 0.25, vol: 0.55, only: ['sewer'], mml: join(['q6 _v100'], lGrind(L_ALL)) },
    toms: { inst: 'tom4', drums: true, rev: 0.35, vol: 0.6, only: ['sewer'], mml: join(['_v100'], rep(L_TOMS, 34)) },
    strings: { inst: 'strings', pan: 0.2, rev: 0.4, vol: 0.4, only: ['river', 'break', 'chipper'], mml: join(['_v90'], lPads(L_ALL)) },
    trem: { inst: 'strings', pan: -0.2, rev: 0.3, vol: 0.35, only: ['break', 'chipper'], mml: join(['q5 _v95'], lTrem(L_ALL)) },
    timp: { inst: 'timpani', pan: 0.1, rev: 0.35, vol: 0.6, only: ['river', 'break', 'chipper'], mml: join(['_v100 o2 d4 r2.', roll('a')], ...[L_A, L_B, L_A, L_C].map(sec => [`o2 ${LR[g1(sec[0])][0]}4 r2.`, ...rest(6), roll('a')])) },
    roll: { inst: 'snare', drums: true, rev: 0.25, vol: 0.5, only: ['chipper'], mml: join(rep(L_ROLL, 34)) },
    low: { inst: 'trombone', pan: -0.1, rev: 0.25, vol: 0.55, only: ['chipper', 'break'], mml: join(['q5 _v105'], bars(L_ALL, (c, b) => { const r = LR[c][0]; return b === 4 ? `o2 ${r}8 ${r}8 r8 ${r}8 _k1 ${r}4 _k0 ${r}4` : `o2 ${r}8 ${r}8 r8 ${r}8`; })) },
  },
  arrangements: {
    main: {},
    ride: {},
    queue: { solo: ['sing', 'pluck', 'jug', 'wash', 'chop'], vol: { sing: 0.8 }, lowpass: 2200, level: 0.5 },
    station: { solo: ['sing', 'pluck', 'jug', 'wash', 'chop', 'fiddle'], lowpass: 4200, level: 0.7 },
    lift: { solo: ['sing', 'pluck', 'jug', 'ratchet'], inst: { sing: 'oohs' }, vol: { sing: 0.7, jug: 0.6 }, level: 0.85 },
    break: { solo: ['timp', 'strings', 'trem', 'low'], inst: { strings: 'slowstrings' }, vol: { timp: 1.2 }, level: 0.9 },
    sewer: { solo: ['sing', 'grind', 'toms', 'jug'], inst: { sing: 'distlead', jug: 'synthbass' }, vol: { sing: 0.45, jug: 0.55 }, rev: { sing: 0.5 }, lowpass: 3200, level: 0.8 },
    river: {
      solo: ['sing', 'pluck', 'chop', 'jug', 'strings', 'timp', 'fiddle'],
      inst: { sing: 'horn', pluck: 'flute', chop: 'harp', jug: 'cello' },
      vol: { sing: 0.85, pluck: 0.6, chop: 0.55, jug: 0.6, strings: 0.7, fiddle: 0.5 }, rev: { sing: 0.45, pluck: 0.4 },
    },
    chipper: { solo: ['pluck', 'roll', 'low', 'strings', 'trem', 'timp'], inst: { pluck: 'xylophone' }, vol: { pluck: 0.75, timp: 1.1 }, level: 0.95 },
  },
};
