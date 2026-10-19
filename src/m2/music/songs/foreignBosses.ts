// FOREIGN LANDS' fights: the helicopter gauntlet (the nine landmark mechs, the land's mini-boss rush) and Helicopter
// Harry (the land's boss, in the AMERICA pavilion's dig). The land's theme and the tour are in foreign.ts.
//
// ---- "RIDE OF THE WONDERS" (boss:heli-gauntlet) ----
// He's jacked the tour helicopter and the wonders of the world are coming up out of the park on legs: Wagner's Ride
// of the Valkyries by way of Apocalypse Now, an aerial gunship blast. Strings whirling in triplets (up two octaves of
// the chord and back), the horns' theme in the Ride's own rhythm (the dotted triplet: da-da-DUM, leaping up the
// chord and holding the top), cellos and a rock bass galloping that same rhythm, palm-muted chugs, a 12/8 rock kit,
// timpani, the choir, the trumpets taking the theme up the octave the second time. Each landmark flavors it with its
// country (the theme doubled by its own instrument, its own percussion): the Eiffel Tower's accordion, the Opera
// House's choir and a didgeridoo drone (tuba), the Redeemer's samba (flute, surdo, agogo), Pisa's mandolin (banjo),
// the Taj Mahal's sitar and tabla, Big Ben's Westminster quarters, the Colosseum's brass and war drums, the
// Pyramid's mizmar (oboe) and darbuka, the moai's log drums (marimba) and taiko.
// D minor, 150, triplet (12/8) feel. 36 bars: a 4-bar intro (once: the strings whirling alone, the horns' call,
// A7), then:
//   A  (8)  Dm - Dm - F - F - Bb - Gm - A - A7: the theme on the horns and the choir (the Valkyries).
//   A2 (8)  Dm - Dm - F - F - Bb - C - Dm - Dm: the trumpets an octave up, the choir singing it.
//   B  (8)  F - F - Ab - Ab - Bb - Bb - A - A7: the hymn, broad, on the choir and the horns, the Ab out of nowhere.
//   C  (8)  Dm - Eb/D - Dm - Eb/D - Gm - Bb - E7 - A7: the brass hammering the rhythm on one note, the Neapolitan
//           E-flat over the D pedal, orchestra hits.
// ARRANGEMENTS (cues.ts heliArr): main (the goon waves between landmarks), one per landmark (eiffel, opera, redeemer,
// pisa, taj, bigben, colosseum, pyramid, moai: while it's rising, fighting and going down), down (Harry's rocket and
// the fall: the kit and the band out, the strings, choir, horns and timpani).
//
// ---- "LOVE IT OR LEAVE IT" (boss:helicopter-harry) ----
// The hippie tour pilot, kicked out of his own helicopter, rips off the tie-dye: underneath, a swearing bigot in a
// bandana with an M60, and the Statue of Liberty at his beck. The song does what he does. It opens on the tour's own
// tune, a 12-string, a flute and a sitar (peace, love, C major), and a record scratch tears it off: an M60 burst, a
// snare roll, and an 80s action-movie war anthem (Rambo, Commando, Missing in Action) in the parallel minor. A
// military snare cadence, synth brass on the theme (up an octave, then a rising fourth), French horns, a pulsing
// synth bass, a big gated kit, orchestra hits and rimshot bursts for the gun. A pompous "Liberty" B in A-flat for the
// statue (half time, her stomps on bass drum and taiko, the choir, a bell tolling); a C for the walls' sweeps (the
// synth bass in sixteenths, the brass stabbing, the gun on the offbeats, D-flat, the diminished seventh back).
// C minor, 120. 46 bars: the 6-bar intro (once: four bars of the tour, the scratch and the burst, the brass swell),
// then:
//   A  (8)  Cm - Ab - Fm - G - Cm - Ab - Fm G - Cm: the theme.
//   A2 (8)  ... Bb: the horns with it.
//   B  (8)  Ab - Ab/C - Db - Eb - Ab - Fm - Db - G: Lady Liberty, the choir and the bell.
//   C  (8)  Cm - Cm - Db - Db - Cm - Cm - Bb - Bdim7: the sweeps.
//   A3 (8)  the theme with the trumpet an octave up, everything in.
// ARRANGEMENTS: main; intro (his entrance: the cutscene, the kit and the gun out under the rant); rage (the statue's
// come apart: no stomps, no bell, the kit and the gun up).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, chord, bars, hi } from './jungle';
import { T_A, TM_A, tourGtr } from './foreign';

const down = (bs: string[]) => up(bs, -1);
const ROLL = (n: string, o = 2) => `o${o} _v55 [${n}32]8 _v75 [${n}32]8 _v95 [${n}32]8 _v115 [${n}32]8`;

// =====================================================================================================================
// RIDE OF THE WONDERS

const GV: Record<string, string[]> = {
  Dm: ['4d', '4f', '4a'], F: ['4c', '4f', '4a'], Bb: ['4d', '4f', '4b-'], Gm: ['4d', '4g', '4b-'], A: ['4c+', '4e', '4a'], A7: ['4c+', '4e', '4g'],
  C: ['4c', '4e', '4g'], Ab: ['4c', '4e-', '4a-'], 'Eb/D': ['4e-', '4g', '4b-'], E7: ['4d', '4e', '4g+'],
};
const GR: Record<string, [string, string]> = {
  Dm: ['d', 'a'], F: ['f', 'c'], Bb: ['b-', 'f'], Gm: ['g', 'd'], A: ['a', 'e'], A7: ['a', 'e'], C: ['c', 'g'], Ab: ['a-', 'e-'], 'Eb/D': ['d', 'b-'], E7: ['e', 'b'],
};
/** The orchestra hit's note for each chord (it plays a major chord on it). */
const GHIT: Record<string, string> = { Dm: 'o4 f', F: 'o4 f', Bb: 'o3 b-', Gm: 'o3 b-', A: 'o4 a', A7: 'o4 a', C: 'o4 c', Ab: 'o4 a-', 'Eb/D': 'o4 e-', E7: 'o4 e' };
const G_IN: Bar[] = ['Dm', 'Dm', 'Dm', 'A7'];
const G_A: Bar[] = ['Dm', 'Dm', 'F', 'F', 'Bb', 'Gm', 'A', 'A7'];
const G_A2: Bar[] = ['Dm', 'Dm', 'F', 'F', 'Bb', 'C', 'Dm', 'Dm'];
const G_B: Bar[] = ['F', 'F', 'Ab', 'Ab', 'Bb', 'Bb', 'A', 'A7'];
const G_C: Bar[] = ['Dm', 'Eb/D', 'Dm', 'Eb/D', 'Gm', 'Bb', 'E7', 'A7'];
const G_LOOP: Bar[] = [...G_A, ...G_A2, ...G_B, ...G_C];
const G_ALL: Bar[] = [...G_IN, ...G_LOOP];
const g1 = (b: Bar) => (typeof b === 'string' ? b : b[0]);

// ---- The theme (the horns' octave; the trumpets have it an octave up) ----
const TH_IN = ['r1', 'r1', 'o3 a12. o4 d24 f12 a2.', 'o4 g12. f24 e12 c+12. d24 e12 a2'];
const TH_A0 = [
  'o3 a12. o4 d24 f12 a2 f12. d24 f12',
  'o4 a12. f24 a12 o5 d2.',
  'o4 c12. f24 a12 o5 c2 o4 a12. f24 a12',
  'o5 c12. o4 a24 o5 c12 f2.',
  'o4 b-12. o5 d24 f12 b-2 f12. d24 f12',
];
const TH_A = [...TH_A0, 'o5 g12. d24 o4 b-12 o5 d2 o4 b-12. g24 b-12', 'o4 a12. o5 c+24 e12 a2 e12. c+24 e12', 'o5 g2 f12. e24 d12 c+4'];
const TH_A2 = [...TH_A0, 'o5 e12. g24 e12 c2 o4 g12. o5 c24 e12', 'o4 a12. o5 d24 f12 a2.', 'o5 d2. r4'];
const TH_B = ['o5 c2. f4', 'o5 a2 g4 f4', 'o5 e-2. a-4', 'o5 c2 o4 b-4 a-4', 'o5 d2. f4', 'o5 b-2 a4 g4', 'o5 a2. e4', 'o5 c+2 e4 g4'];
const TH_C1 = 'o4 d12. d24 d12 f4 d12. d24 d12 a4', TH_C2 = 'o4 e-12. e-24 e-12 g4 e-12. e-24 e-12 b-4';
const TH_C = [TH_C1, TH_C2, TH_C1, TH_C2, 'o4 g12. g24 g12 b-4 o5 d12. d24 d12 g4', 'o4 b-12. b-24 b-12 o5 d4 f12. f24 f12 b-4', 'o4 b12. o5 e24 g+12 b2.', 'o5 a12. g24 e12 c+12. e24 g12 a4 o4 a4'];
const THEME = [...TH_IN, ...TH_A, ...TH_A2, ...TH_B, ...TH_C];

const gPads = (prog: Bar[]) => bars(prog, (c, b) => chord(GV[c], b === 4 ? '1' : '2'));
/** The violins' whirl: up two octaves of the chord in triplets, a turn at the top, back down. */
const gWhirl = (prog: Bar[]) => bars(prog, c => {
  const v = GV[c], h = v.map(hi), hh = hi(h[0]);
  return [v[0], v[1], v[2], h[0], h[1], h[2], hh, h[2], h[1], h[0], v[2], v[1]].map((n, i) => nt(n, '12', i % 3 === 0 ? '!' : '')).join(' ');
});
/** The Ride's gallop (da-da-DUM a beat) on the root, the fifth on three. */
const gallop = (oct: number) => (prog: Bar[]) => bars(prog, c => { const [r, f] = GR[c]; return `o${oct} ` + [r, r, f, r].map(x => `!${x}12. ${x}24 ${x}12`).join(' '); });
/** The low brass: the root long, a kick into the next bar. */
const gLow = (prog: Bar[]) => bars(prog, c => { const [r] = GR[c]; return `o2 ${r}2. ${r}12. ${r}24 ${r}12`; });
/** Big Ben: the Westminster quarters at the top of each eight (where the chord's D minor or F), the hour's bongs
 *  elsewhere. */
const BIGBEN = G_ALL.map((b, i) => {
  const at = (i - 4) % 8, sect = Math.floor((i - 4) / 8);
  if (i >= 4 && sect < 3 && at === 0) return 'o5 f4 e4 d4 o4 a4';
  if (i >= 4 && sect < 3 && at === 1) return 'o4 a4 o5 e4 f4 d4';
  return `o4 ${GR[g1(b)][0]}2 r2`;
});

// ---- The drums ----
const GK = '{kh}12 h12 h12 {sh}12 h12 k12 {kh}12 h12 h12 {sh}12 h12 ?h12';
const GK_IN = GK.replace('{kh}', '{kx}');
const GK_FILL = '{kh}12 h12 h12 {sh}12 h12 k12 (tom1)12 (tom1)12 (tom2)12 (tom3)12 (tom3)12 (tom4)12';
const GK_B = '{ki}12 i12 i12 {si}12 i12 k12 {ki}12 i12 i12 {si}12 i12 i12';
const GK_B_IN = GK_B.replace('{ki}', '{kx}');
const GK_C = '{kh}12 h12 k12 {sh}12 h12 k12 {kh}12 h12 k12 {sh}12 k12 k12';
const GK_C_IN = GK_C.replace('{kh}', '{kx}');
const GK_ROLL = '_v60 s12 s12 s12 _v80 s12 s12 s12 _v100 s12 s12 s12 _v120 s24 s24 s24 s24 s24 s24';
const SAMBA = '{k z}12 z12 (timbale)12 {(cowbell) z}12 z12 (timbale)12 {k z}12 (cowbell)12 (timbale)12 {(cowbell) z}12 z12 (timbale)12';
const TABLA = 'd12 ?b12 c12 d12 ?b12 c12 d12 b12 c12 c12 b12 ?b12';
const WAR = 'f4 r12 r12 f12 f4 f12. f24 f12';

/** The extras each landmark brings; every arrangement mutes the ones that aren't its. */
const EXTRA = ['color', 'bigben', 'samba', 'tabla', 'taiko', 'didge'];
const mech = (own: string[], color?: string, more: Record<string, number> = {}) => ({
  mute: EXTRA.filter(p => !own.includes(p)), ...(color ? { inst: { color } } : {}), vol: { ...more },
});

export const BOSS_HELI_GAUNTLET: Song = {
  title: 'Ride of the Wonders',
  bpm: 150,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.95,
  delay: { beats: 1, feedback: 0.2, tone: 2600 },
  parts: {
    horns: { inst: 'horn', pan: -0.15, rev: 0.32, mml: join(['_v110'], THEME.slice(0, 20), ['_v100'], down(TH_B), ['_v115'], TH_C) },
    trumpet: { inst: 'trumpet', pan: 0.2, rev: 0.3, vol: 0.7, mml: join(rest(12), ['_v108'], up(TH_A2), rest(8), ['_v112'], up(TH_C)) },
    // (the Valkyries themselves: the choir sings the theme with the horns)
    choir: { inst: 'choir', pan: 0, rev: 0.5, vol: 0.6, mml: join(['_v80'], gPads(G_IN), ['_v95'], TH_A, ['_v100'], TH_A2, ['_v105'], TH_B, ['_v90'], gPads(G_C)) },
    violins: { inst: 'strings', pan: 0.3, rev: 0.35, vol: 0.5, mml: join(['q7 _e40 _e127/1^1^1 _v90'], gWhirl(G_IN), ['_v95'], gWhirl(G_LOOP)) },
    cellos: { inst: 'cello', pan: -0.25, rev: 0.25, vol: 0.5, mml: join(['q6 _v95'], gallop(3)(G_ALL)) },
    trombone: { inst: 'trombone', pan: -0.05, rev: 0.28, vol: 0.55, mml: join(['_v100'], gLow(G_IN), gLow(G_A), gLow(G_A2), gLow(G_B), ['_v115'], down(TH_C)) },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.75, mml: join(['q6 _v100'], rest(2), gallop(2)(G_ALL.slice(2))) },
    chug: { inst: 'chug', pan: 0.4, rev: 0.12, vol: 0.45, mml: join(['q5 _v100'], rest(2), gallop(2)(G_ALL.slice(2))) },
    timpani: {
      inst: 'timpani', pan: 0.1, rev: 0.35, vol: 0.65,
      mml: join(
        ['o2 _v90 d4 r2.', 'o2 d4 r2.', 'o2 d4 r4 a4 r4', ROLL('a')],
        ...[G_A, G_A2, G_B, G_C].map(sec => [...sec.slice(0, 7).map(c => { const [r, f] = GR[g1(c)]; return `o2 _v105 ${r}4 r4 ${f}4 r4`; }), ROLL(GR[g1(sec[7])][0])]),
      ),
    },
    hits: {
      inst: 'orchhit', pan: 0, rev: 0.4, vol: 0.45,
      mml: join(['r1', 'r1', 'r1', 'o4 r2. a4'], ...[G_A, G_A2, G_B].map(sec => [`${GHIT[g1(sec[0])]}4 r2.`, ...rest(7)]), G_C.map(c => `${GHIT[g1(c)]}4 r2.`)),
    },
    kit: {
      inst: 'kick', drums: true, rev: 0.22, vol: 0.7, not: ['down'],
      mml: join(
        ['r1', 'r1', '_v90 ' + GK_IN, GK_ROLL],
        ['_v105'], [GK_IN, ...rep(GK, 6), GK_FILL], [GK_IN, ...rep(GK, 6), GK_FILL],
        ['_v100'], [GK_B_IN, ...rep(GK_B, 6), GK_FILL], ['_v110'], [GK_C_IN, ...rep(GK_C, 6), GK_ROLL],
      ),
    },
    // (the landmarks' own)
    color: { inst: 'accordion', pan: 0.3, rev: 0.3, vol: 0.55, mml: join(['_v100'], THEME) },
    bigben: { inst: 'chimes', pan: -0.3, rev: 0.5, vol: 0.5, mml: join(['_v100'], BIGBEN) },
    samba: { inst: 'bassdrum', drums: true, kit: 'orchestra', pan: 0.2, rev: 0.18, vol: 0.5, mml: join(['_v100'], rep(SAMBA, 36)) },
    tabla: { inst: 'congahi', drums: true, pan: -0.2, rev: 0.18, vol: 0.55, mml: join(['_v100'], rep(TABLA, 36)) },
    taiko: { inst: 'taiko', drums: true, rev: 0.35, vol: 0.6, mml: join(['_v105'], rep(WAR, 36)) },
    didge: { inst: 'tuba', pan: -0.1, rev: 0.25, vol: 0.4, vib: [5, 30, 0], mml: join(['q8 _v90'], rep('o1 _e70 d12. _e127 d24 d12 _e80 d2. | o1 _e70 d12. _e127 d24 d12 _e90 d4 _e70 d12. _e127 d24 d12 d4', 18)) },
  },
  arrangements: {
    main: mech([]),
    eiffel: mech(['color'], 'accordion'),
    opera: mech(['color', 'didge'], 'oohs', { color: 0.6, choir: 0.8 }),
    redeemer: mech(['color', 'samba'], 'flute', { color: 0.6 }),
    pisa: mech(['color'], 'banjo', { color: 0.6 }),
    taj: mech(['color', 'tabla'], 'sitar', { color: 0.6 }),
    bigben: mech(['bigben']),
    colosseum: mech(['color', 'taiko'], 'brass', { color: 0.6 }),
    pyramid: mech(['color', 'tabla'], 'oboe', { color: 0.55 }),
    moai: mech(['color', 'taiko'], 'marimba', { color: 0.7 }),
    down: { solo: ['violins', 'choir', 'horns', 'timpani', 'cellos', 'trombone'], vol: { choir: 0.75 }, level: 0.85 },
  },
};

// =====================================================================================================================
// LOVE IT OR LEAVE IT

const HV: Record<string, string[]> = {
  Cmaj7: ['4e', '4g', '4b'], 'Bb/C': ['4d', '4f', '4b-'], 'Fmaj7/C': ['4e', '4a', '5c'],
  Cm: ['4c', '4e-', '4g'], Ab: ['4c', '4e-', '4a-'], Fm: ['4c', '4f', '4a-'], G: ['3b', '4d', '4g'], Bb: ['4d', '4f', '4b-'], 'Ab/C': ['4c', '4e-', '4a-'],
  Db: ['4d-', '4f', '4a-'], Eb: ['3b-', '4e-', '4g'], Bdim7: ['3b', '4d', '4f', '4a-'],
};
const HR: Record<string, [string, string]> = {
  Cmaj7: ['c', 'g'], 'Bb/C': ['c', 'f'], 'Fmaj7/C': ['c', 'f'],
  Cm: ['c', 'g'], Ab: ['a-', 'e-'], Fm: ['f', 'c'], G: ['g', 'd'], Bb: ['b-', 'f'], 'Ab/C': ['c', 'a-'], Db: ['d-', 'a-'], Eb: ['e-', 'b-'], Bdim7: ['b', 'f'],
};
const H_A: Bar[] = ['Cm', 'Ab', 'Fm', 'G', 'Cm', 'Ab', ['Fm', 'G'], 'Cm'];
const H_A2: Bar[] = ['Cm', 'Ab', 'Fm', 'G', 'Cm', 'Ab', ['Fm', 'G'], 'Bb'];
const H_B: Bar[] = ['Ab', 'Ab/C', 'Db', 'Eb', 'Ab', 'Fm', 'Db', 'G'];
const H_C: Bar[] = ['Cm', 'Cm', 'Db', 'Db', 'Cm', 'Cm', 'Bb', 'Bdim7'];

// ---- The tunes ----
const HT_A0 = ['o4 c4. g8 o5 c2', 'o4 b-4. a-8 e-2', 'o4 f8 g8 a-8 b-8 o5 c4 e-4', 'o5 d2 o4 b4 g4', 'o4 c4. g8 o5 c4 e-8 f8', 'o5 g4. f8 e-4 c4', 'o5 d-4 c4 o4 b4. g8'];
const HT_A = [...HT_A0, 'o5 c2 r4 o4 g8 g8'];
const HT_A2 = [...HT_A0, 'o4 b-2 r4 f8 f8'];
const HT_B = ['o4 e-2 a-2', 'o5 c2. o4 b-4', 'o4 a-2 f2', 'o4 g1', 'o4 e-4 a-4 o5 c4 e-4', 'o5 f2 e-4 c4', 'o5 d-2 c4 o4 a-4', 'o4 b2 o5 d2'];
const HT_C = [
  'o4 c8 c8 r8 c8 r8 e-8 f8 g8', 'o4 c8 c8 r8 c8 r8 e-8 f8 g8', 'o4 d-8 d-8 r8 d-8 r8 f8 g-8 a-8', 'o4 d-8 d-8 r8 d-8 r8 f8 a-8 b-8',
  'o4 c8 c8 r8 c8 r8 e-8 f8 g8', 'o4 b-8 a-8 g8 f8 e-8 d8 c8 o3 b8', 'o4 d8 f8 b-8 o5 d8 f4 d4', 'o4 b8 o5 d8 f8 a-8 b4 r4',
];
/** The intro's last bar: the brass swelling on the G, the pickup into the theme. */
const HT_SWELL = 'o4 g2. g8 g8';

const hPads = (prog: Bar[]) => bars(prog, (c, b) => chord(HV[c], b === 4 ? '1' : '2'));
/** The strings' ostinato: the chord in eighths, rocking. */
const hOst = (prog: Bar[]) => bars(prog, (c, b) => { const v = HV[c]; return [0, 1, 2, 1, 0, 1, 2, 1].slice(0, b * 2).map(k => nt(v[k], '8')).join(' '); });
/** The strings in the sweeps: the root's octaves in sixteenths. */
const hOct16 = (prog: Bar[]) => bars(prog, (c, b) => { const r = HR[c][0]; return Array.from({ length: b * 2 }, () => `o4 ${r}16 o5 ${r}16`).join(' '); });
const hSyn8 = (prog: Bar[]) => bars(prog, (c, b) => { const [r] = HR[c]; return `o2 ${Array.from({ length: b * 2 }, (_, i) => (i % 4 === 0 ? `!${r}8` : `${r}8`)).join(' ')}`; });
const hSyn16 = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = HR[c]; return `o2 ${Array.from({ length: b * 4 }, (_, i) => (i % 8 === 6 ? `${f}16` : i % 4 === 0 ? `!${r}16` : `${r}16`)).join(' ')}`; });
const hHalf = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = HR[c]; return b === 4 ? `o2 ${r}2 ${f}2` : `o2 ${r}2`; });
/** The low brass: the root, dug in, a kick off the bar's end. */
const hLow = (prog: Bar[]) => bars(prog, (c, b) => { const [r] = HR[c]; return b === 4 ? `o2 !${r}4. ${r}8 ${r}2` : `o2 !${r}4. ${r}8`; });
/** The horns' stabs in the sweeps. */
const hStabs = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(HV[c], '8'); return b === 4 ? `${x} r8 r8 ${x} r2` : `${x} r8 r8 ${x}`; });
const hTimp = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = HR[c]; return b === 4 ? `o2 ${r}4 r4 ${f}4 r4` : `o2 ${r}4 r4`; });
/** The bell (Liberty's) tolling the chord's root. */
const hBell = (prog: Bar[]) => bars(prog, c => { const r = HR[c][0]; return `o${['a-', 'b', 'b-', 'g', 'f'].includes(r) ? 4 : 5} ${r}2 r2`; });

// ---- The drums ----
const MARCH = '!s8. ?s16 s8 !s8 ?s16 ?s16 s8 !s8 s8';
const MARCH_ROLL = '_v60 [s32]8 _v80 [s32]8 _v100 [s32]8 _v120 [s32]8';
const HK = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8';
const HK_IN = HK.replace('{kh}', '{kx}');
const HK_FILL = '{kh}8 h8 {sh}8 h8 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16';
const HK_HALF = '{kh}8 h8 h8 h8 {sh}8 h8 h8 h8';
const HK_HALF_IN = HK_HALF.replace('{kh}', '{kx}');
const HK_C = '{kh}16 h16 h16 h16 {sh}16 h16 {kh}16 h16 {kh}16 h16 h16 h16 {sh}16 h16 h16 {kh}16';
const HK_C_IN = HK_C.replace('{kh}', '{kx}');
/** The M60: rimshot bursts at the ends of phrases (and on the offbeats in the sweeps). */
const GUN = 'r2 _v115 (rimshot)16 (rimshot)16 (rimshot)16 (rimshot)16 (rimshot)16 (rimshot)16 (rimshot)16 (rimshot)16';
const GUN_C = 'r8 _v110 (rimshot)16 (rimshot)16 r8 (rimshot)16 (rimshot)16 r8 (rimshot)16 (rimshot)16 r8 (rimshot)16 (rimshot)16';
/** The orchestra hits through a phrase of the theme: the Eb (Cm7's top) on the ones, G (the dominant) kicking
 *  bars 4 and 8. */
const H_PHRASE_HITS = ['o4 e-4 r2.', 'r1', 'r1', 'r2. o3 g4', 'o4 e-4 r2.', 'r1', 'r1', 'r2. o3 g4'];
const gunPhrase = () => ['r1', 'r1', 'r1', GUN, 'r1', 'r1', 'r1', GUN];

export const BOSS_HARRY: Song = {
  title: 'Love It or Leave It',
  bpm: 120,
  loopFrom: 24,
  reverb: 'hall',
  reverbMix: 0.85,
  delay: { beats: 0.75, feedback: 0.25, tone: 2800 },
  parts: {
    // (the hippie: the tour's own tune, four bars, then torn off)
    folk: { inst: 'steelgtr', pan: -0.3, rev: 0.3, cho: 0.45, vol: 0.6, mml: join(['_v80'], tourGtr(T_A.slice(0, 4)), rest(42)) },
    flute: { inst: 'flute', pan: 0, rev: 0.45, dly: 0.2, vol: 0.8, mml: join(['_v90'], TM_A.slice(0, 3), ['o4 b2. r4'], rest(42)) },
    sitar: { inst: 'sitar', pan: 0.35, rev: 0.4, dly: 0.25, vol: 0.5, mml: join(['_v85'], ['r1', 'r2 o4 e8 g8 a8 b8', 'r1', 'r2 o5 d8 c8 o4 a8 g8'], rest(42)) },
    scratch: { inst: 'scratch', drums: true, rev: 0.15, vol: 0.8, mml: join(rest(4), ['_v120 g4 r4 [(snare)32]8 r4', 'r1'], rest(40)) },
    // (Rambo)
    lead: { inst: 'synthbrass', pan: 0, rev: 0.28, dly: 0.1, mml: join(rest(5), ['_v100 _e50 _e127/2.', HT_SWELL], ['_v110'], HT_A, HT_A2, ['_v105'], rest(8), ['_v112'], HT_C, ['_v115'], HT_A) },
    horns: {
      inst: 'horn', pan: -0.3, rev: 0.35, vol: 0.6,
      mml: join(rest(5), ['_v95 o4 {d g}1'], ['_v90'], hPads(H_A), ['_v100'], HT_A2, ['_v110'], HT_B, ['_v105 q5'], hStabs(H_C), ['q8 _v110'], HT_A),
    },
    trumpet: { inst: 'trumpet', pan: 0.25, rev: 0.3, vol: 0.6, mml: join(rest(38), ['_v108'], up(HT_A)) },
    choir: { inst: 'choir', pan: 0, rev: 0.5, vol: 0.5, mml: join(rest(22), ['_v95'], hPads(H_B), rest(8), ['_v90'], hPads(H_A)) },
    strings: {
      inst: 'strings', pan: 0.3, rev: 0.32, vol: 0.45,
      mml: join(rest(4), ['_v100 o4 {c e- g}1', 'o3 {b >d g}1'], ['_v85 q6'], hOst(H_A), hOst(H_A2), ['q8 _v95'], up(hPads(H_B)), ['q6 _v90'], hOct16(H_C), ['_v90'], hOst(H_A)),
    },
    lowbrass: { inst: 'trombone', pan: -0.1, rev: 0.25, vol: 0.55, mml: join(rest(4), ['_v115 o2 c4 r2.', 'o2 g1'], ['_v100'], hLow(H_A), hLow(H_A2), ['_v105'], hHalf(H_B), hLow(H_C), hLow(H_A)) },
    synbass: { inst: 'synthbass', pan: 0, rev: 0.05, vol: 0.7, mml: join(rest(4), ['_v110 o2 c4 r2.', 'o2 g8 g8 g8 g8 g8 g8 g8 g8'], ['_v100'], hSyn8(H_A), hSyn8(H_A2), hHalf(H_B), ['_v95'], hSyn16(H_C), ['_v100'], hSyn8(H_A)) },
    timpani: { inst: 'timpani', pan: 0.15, rev: 0.35, vol: 0.6, mml: join(rest(4), ['o2 _v120 c4 r2.', ROLL('g')], ['_v100'], hTimp(H_A), hTimp(H_A2), hHalf(H_B), rest(7), [ROLL('b')], hTimp(H_A)) },
    hits: {
      inst: 'orchhit', pan: 0, rev: 0.4, vol: 0.45,
      mml: join(
        rest(4), ['_v120 r4 r4 r4 o4 a-4', 'o4 e-4 r2.'], H_PHRASE_HITS, H_PHRASE_HITS, ['o4 a-4 r2.'], rest(7),
        ['e-', 'e-', 'a-', 'a-', 'e-', 'e-'].map(n => `r8 o4 ${n}8 r4 r8 ${n}8 r4`), ['o4 b-4 r2.', 'r2. o3 g4'], H_PHRASE_HITS,
      ),
    },
    bell: { inst: 'chimes', pan: -0.35, rev: 0.5, vol: 0.4, mml: join(rest(22), ['_v100'], hBell(H_B), rest(16)) },
    snare: {
      inst: 'snare2', drums: true, kit: 'orchestra', pan: 0.1, rev: 0.25, vol: 0.55,
      mml: join(rest(5), [MARCH_ROLL], ['_v100'], [...rep(MARCH, 7), MARCH_ROLL], [...rep(MARCH, 7), MARCH_ROLL], [...rep('r1', 7), MARCH_ROLL], ['_v95'], rep(MARCH, 8), ['_v105'], [...rep(MARCH, 7), MARCH_ROLL]),
    },
    kit: {
      inst: 'kick', drums: true, rev: 0.3, vol: 0.7, not: ['intro'],
      mml: join(rest(6), ['_v105'], [HK_IN, ...rep(HK, 6), HK_FILL], [HK_IN, ...rep(HK, 6), HK_FILL], ['_v100'], [HK_HALF_IN, ...rep(HK_HALF, 6), HK_FILL], ['_v105'], [HK_C_IN, ...rep(HK_C, 6), HK_FILL], ['_v110'], [HK_IN, ...rep(HK, 6), HK_FILL]),
    },
    gun: { inst: 'rimshot', drums: true, pan: 0.2, rev: 0.12, vol: 0.5, not: ['intro'], mml: join(rest(6), gunPhrase(), gunPhrase(), rest(8), rep(GUN_C, 6), ['r1', GUN], gunPhrase()) },
    // (Lady Liberty's stomps)
    stomp: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.4, vol: 0.75, not: ['intro', 'rage'], mml: join(rest(22), ['_v120 {k(gong)(taiko)}2 {k(taiko)}2'], rep('{k(taiko)}2 {k(taiko)}2', 7), rest(16)) },
  },
  arrangements: {
    main: {},
    intro: { vol: { lead: 0.85, synbass: 0.8 }, level: 0.85 },
    rage: { vol: { kit: 1.2, gun: 1.35, lead: 1.1, snare: 1.15, synbass: 1.1 } },
  },
};
