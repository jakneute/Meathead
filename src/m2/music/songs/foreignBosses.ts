// FOREIGN LANDS' fights: the helicopter gauntlet (the nine landmark mechs, the land's mini-boss rush) and Helicopter
// Harry (the land's boss, in the AMERICA pavilion's dig). The land's theme and the tour are in foreign.ts. Both at
// Mega Man boss intensity.
//
// ---- "RIDE OF THE WONDERS" (boss:heli-gauntlet) ----
// He's jacked the tour helicopter and the wonders of the world are coming up out of the park on legs: Wagner's Ride
// of the Valkyries by way of Apocalypse Now as a twelve-eight gallop-metal shooter. The choir (the Valkyries
// themselves) and the horns on the theme in the Ride's own rhythm (the dotted triplet: da-da-DUM, leaping up the chord and holding the top), the
// strings whirling up two octaves in triplets, power chords and the bass galloping that same rhythm with the kick
// doubling it, a 12/8 rock kit, timpani; the trumpets take the theme up the octave the second time, a second trumpet in
// thirds. A broad B hymn (the A-flat out of nowhere), a C hammering the rhythm over the Neapolitan E-flat. Each
// landmark doubles the theme on its country's instrument and brings its percussion: the Eiffel Tower's accordion, the
// Opera House's oohs and a didgeridoo (tuba), the Redeemer's flute and samba, Pisa's mandolin (banjo), the Taj
// Mahal's sitar and tabla, Big Ben's Westminster quarters, the Colosseum's brass and war drums, the Pyramid's oboe and
// darbuka, the moai's log drums (marimba) and taiko.
// D minor, 158, triplet (12/8) feel. 36 bars: a 4-bar intro (once: the strings whirling alone, the horns' call, A7),
// A (Dm - Dm - F - F - Bb - Gm - A - A7), A2 (Dm - Dm - F - F - Bb - C - Dm - Dm), B (F - F - Ab - Ab - Bb - Bb - A -
// A7), C (Dm - Eb/D - Dm - Eb/D - Gm - Bb - E7 - A7).
// ARRANGEMENTS (cues.ts heliArr): main (the goon waves), eiffel, opera, redeemer, pisa, taj, bigben, colosseum,
// pyramid, moai (a landmark rising, fighting, going down), down (Harry's rocket and the fall: no kit, no guitars).
//
// ---- "LOVE IT OR LEAVE IT" (boss:helicopter-harry) ----
// The hippie tour pilot rips off the tie-dye: underneath, a swearing bigot in a bandana with an M60, the Statue of
// Liberty at his beck. It opens on the tour's own tune (a 12-string, a flute, a sitar: peace, love, C major), and a
// record scratch tears it off: an M60 burst, a snare roll, and an 80s action-movie war anthem at Mega Man pace in the
// parallel minor: synth brass on the theme, the horns, a pumping synth bass, palm-muted sixteenths, a big kit with a
// military snare cadence on top, orchestra hits, rimshot bursts for the gun. A pompous "Liberty" B in A-flat for the
// statue (half time, her stomps on bass drum and taiko, the choir, a bell tolling); a C for the walls' sweeps (the synth
// bass in sixteenths, brass stabs, the gun on the offbeats, D-flat, the diminished seventh back); A3 with the trumpet
// an octave up.
// C minor, 150. 46 bars: the 6-bar intro (once: four bars of the tour, the scratch and the burst, the brass swell),
// then A (Cm - Ab - Fm - G - Cm - Ab - Fm G - Cm), A2 (... Bb), B (Ab - Ab/C - Db - Eb - Ab - Fm - Db - G), C (Cm - Cm -
// Db - Db - Cm - Cm - Bb - Bdim7), A3.
// ARRANGEMENTS: main; intro (his entrance: the kit and the gun out under the rant); rage (the statue's come apart: no
// stomps or bell, the kit and the gun up).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, pat, pads, harm, scale, sec, troll, g1, KIT, FILL } from './mmkit';
import { T_A, TM_A, tourGtr } from './foreign';

// =====================================================================================================================
// RIDE OF THE WONDERS

const G_IN: Bar[] = ['Dm', 'Dm', 'Dm', 'A7'];
const G_A: Bar[] = ['Dm', 'Dm', 'F', 'F', 'Bb', 'Gm', 'A', 'A7'];
const G_A2: Bar[] = ['Dm', 'Dm', 'F', 'F', 'Bb', 'C', 'Dm', 'Dm'];
const G_B: Bar[] = ['F', 'F', 'Ab', 'Ab', 'Bb', 'Bb', 'A', 'A7'];
const G_C: Bar[] = ['Dm', 'Eb/D', 'Dm', 'Eb/D', 'Gm', 'Bb', 'E7', 'A7'];
const G_LOOP: Bar[] = [...G_A, ...G_A2, ...G_B, ...G_C];
const G_ALL: Bar[] = [...G_IN, ...G_LOOP];
/** The orchestra hit's note for each chord (it plays a major chord on it). */
const GHIT: Record<string, string> = { Dm: 'o4 f', F: 'o4 f', Bb: 'o3 b-', Gm: 'o3 b-', A: 'o4 a', A7: 'o4 a', C: 'o4 c', Ab: 'o4 a-', 'Eb/D': 'o4 e-', E7: 'o4 e' };

const TH_IN = ['r1', 'r1', 'o3 a12. o4 d24 f12 a2.', 'o4 g12. f24 e12 c+12. d24 e12 a2'];
const TH_A0 = ['o3 a12. o4 d24 f12 a2 f12. d24 f12', 'o4 a12. f24 a12 o5 d2.', 'o4 c12. f24 a12 o5 c2 o4 a12. f24 a12', 'o5 c12. o4 a24 o5 c12 f2.', 'o4 b-12. o5 d24 f12 b-2 f12. d24 f12'];
const TH_A = [...TH_A0, 'o5 g12. d24 o4 b-12 o5 d2 o4 b-12. g24 b-12', 'o4 a12. o5 c+24 e12 a2 e12. c+24 e12', 'o5 g2 f12. e24 d12 c+4'];
const TH_A2 = [...TH_A0, 'o5 e12. g24 e12 c2 o4 g12. o5 c24 e12', 'o4 a12. o5 d24 f12 a2.', 'o5 d2. r4'];
const TH_B = ['o5 c2. f4', 'o5 a2 g4 f4', 'o5 e-2. a-4', 'o5 c2 o4 b-4 a-4', 'o5 d2. f4', 'o5 b-2 a4 g4', 'o5 a2. e4', 'o5 c+2 e4 g4'];
const TH_C1 = 'o4 d12. d24 d12 f4 d12. d24 d12 a4', TH_C2 = 'o4 e-12. e-24 e-12 g4 e-12. e-24 e-12 b-4';
const TH_C = [TH_C1, TH_C2, TH_C1, TH_C2, 'o4 g12. g24 g12 b-4 o5 d12. d24 d12 g4', 'o4 b-12. b-24 b-12 o5 d4 f12. f24 f12 b-4', 'o4 b12. o5 e24 g+12 b2.', 'o5 a12. g24 e12 c+12. e24 g12 a4 o4 a4'];
const THEME = [...TH_IN, ...TH_A, ...TH_A2, ...TH_B, ...TH_C];
const TH_A2_TWIN = harm(TH_A2, scale('d', 'minor'));

/** The Ride's gallop on the chord's root (da-da-DUM a beat). */
const GALLOP = '!R12. R24 R12 !R12. R24 R12 !R12. R24 R12 !R12. R24 R12';
const BIGBEN = G_ALL.map((b, i) => {
  const at = (i - 4) % 8, sect = Math.floor((i - 4) / 8);
  if (i >= 4 && sect < 3 && at === 0) return 'o5 f4 e4 d4 o4 a4';
  if (i >= 4 && sect < 3 && at === 1) return 'o4 a4 o5 e4 f4 d4';
  return pat([g1(b)], 'R2 r2', 60)[0];
});

const GK = '{kh}12 k12 k12 {sh}12 h12 k12 {kh}12 k12 k12 {sh}12 h12 ?h12';
const GK_FILL = '{kh}12 k12 k12 {sh}12 h12 k12 (tom1)12 (tom1)12 (tom2)12 (tom3)12 (tom3)12 (tom4)12';
const GK_B = '{ki}12 i12 i12 {si}12 i12 k12 {ki}12 i12 i12 {si}12 i12 i12';
const GK_C = '{kh}12 k12 k12 {sh}12 k12 k12 {kh}12 k12 k12 {sh}12 k12 k12';
const GK_ROLL = 's12 s12 s12 s12 s12 s12 !s12 s12 s12 !s24 s24 s24 s24 s24 s24';
const SAMBA = '{k z}12 z12 (timbale)12 {(cowbell) z}12 z12 (timbale)12 {k z}12 (cowbell)12 (timbale)12 {(cowbell) z}12 z12 (timbale)12';
const TABLA = 'd12 ?b12 c12 d12 ?b12 c12 d12 b12 c12 c12 b12 ?b12';
const WAR = 'f4 r12 r12 f12 f4 f12. f24 f12';

const EXTRA = ['color', 'bigben', 'samba', 'tabla', 'taiko', 'didge'];
// (each landmark's own colors well up front (the user's: "make sure the ride of the wonders instrumentation changes
// when fighting the different monuments. the song seems to be exactly the same"): its instrument takes the lead from
// the horns as well as doubling it, the brass and the choir back off under it, its own percussion up; vol's a multiplier on each part's own)
const mech = (own: string[], color?: string, more: Record<string, number> = {}) => ({
  mute: EXTRA.filter(p => !own.includes(p)),
  ...(color ? { inst: { color, horns: color } } : {}),
  vol: own.length ? { trumpet: 0.4, twin: 0.4, choir: 0.65, ...more, color: 1.6, samba: 1.4, tabla: 1.4, taiko: 1.35, didge: 1.5, bigben: 1.5 } : { ...more },
});

export const BOSS_HELI_GAUNTLET: Song = {
  title: 'Ride of the Wonders',
  bpm: 158,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.85,
  delay: { beats: 1, feedback: 0.2, tone: 2800 },
  parts: {
    horns: { inst: 'horn', pan: -0.15, rev: 0.3, vol: 0.8, mml: join(['_v112'], THEME.slice(0, 20), ['_v100'], up(TH_B, -1), ['_v118'], TH_C) },
    trumpet: { inst: 'trumpet', pan: 0.2, rev: 0.28, vol: 0.7, mml: join(rest(12), ['_v110'], up(TH_A2), rest(8), ['_v112'], up(TH_C)) },
    twin: { inst: 'trumpet', pan: 0.4, rev: 0.3, vol: 0.45, mml: join(rest(12), ['_v100'], up(TH_A2_TWIN), rest(16)) },
    choir: { inst: 'choir', pan: 0, rev: 0.42, vol: 0.72, mml: join(['_v80'], pads(G_IN, 57), ['_v98'], TH_A, ['_v102'], TH_A2, ['_v108'], TH_B, ['_v92'], pads(G_C, 57)) },
    violins: { inst: 'strings', pan: 0.3, rev: 0.32, vol: 0.45, mml: join(['q7 _e40 _e127/1^1^1 _v90'], pat(G_IN, "!012 112 212 0'12 1'12 2'12 0''12 2'12 1'12 0'12 212 112", 62), ['_v98'], pat(G_LOOP, "!012 112 212 0'12 1'12 2'12 0''12 2'12 1'12 0'12 212 112", 62)) },
    gtr: { inst: 'powerchord', pan: -0.4, rev: 0.1, vol: 0.45, not: ['down'], mml: join(rest(2), ['_v110'], pat(G_ALL.slice(2), GALLOP, 40)) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.8, mml: join(rest(2), ['_v105'], pat(G_ALL.slice(2), GALLOP.replace(/R/g, 'B'), 28)) },
    cellos: { inst: 'cello', pan: -0.25, rev: 0.25, vol: 0.45, mml: join(['q6 _v98'], pat(G_ALL, GALLOP, 45)) },
    trombone: { inst: 'trombone', pan: -0.05, rev: 0.25, vol: 0.5, mml: join(['_v100'], pat([...G_IN, ...G_A, ...G_A2, ...G_B], 'B2. B12. B24 B12', 38), ['_v115'], up(TH_C, -1)) },
    timp: {
      inst: 'timpani', pan: 0.1, rev: 0.35, vol: 0.62,
      mml: join(['_v90 o2 d4 r2.', 'o2 d4 r2.', 'o2 d4 r4 a4 r4', troll('o2 a')], ...[G_A, G_A2, G_B, G_C].map(s => [...pat(s.slice(0, 7), '!B4 r4 24 r4', 38), troll('o2 a')])),
    },
    hits: { inst: 'orchstab', pan: 0, rev: 0.38, vol: 0.45, mml: join(['r1', 'r1', 'r1', '_v110 o4 r2. a4'], ...[G_A, G_A2, G_B].map(s => [`${GHIT[g1(s[0])]}4 r2.`, ...rest(7)]), G_C.map(c => `${GHIT[g1(c)]}4 r2.`)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.2, vol: 0.72, not: ['down'],
      mml: join(['r1', 'r1', '_v95 ' + GK.replace('{kh}', '{kx}'), GK_ROLL], ['_v105'], sec(8, GK, GK_FILL), sec(8, GK, GK_FILL), ['_v100'], sec(8, GK_B, GK_FILL), ['_v112'], sec(8, GK_C, GK_ROLL)),
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
    down: { solo: ['violins', 'choir', 'horns', 'timp', 'cellos', 'trombone'], vol: { choir: 0.75 }, level: 0.85 },
  },
};

// =====================================================================================================================
// LOVE IT OR LEAVE IT

const H_A: Bar[] = ['Cm', 'Ab', 'Fm', 'G', 'Cm', 'Ab', ['Fm', 'G'], 'Cm'];
const H_A2: Bar[] = ['Cm', 'Ab', 'Fm', 'G', 'Cm', 'Ab', ['Fm', 'G'], 'Bb'];
const H_B: Bar[] = ['Ab', 'Ab/C', 'Db', 'Eb', 'Ab', 'Fm', 'Db', 'G'];
const H_C: Bar[] = ['Cm', 'Cm', 'Db', 'Db', 'Cm', 'Cm', 'Bb', 'Bdim7'];

const HT_A0 = ['o4 c4. g8 o5 c4. d8', 'o4 b-4. a-8 e-4 c8 e-8', 'o4 f8 g8 a-8 b-8 o5 c4 e-4', 'o5 d4. o4 b8 r8 b8 g4', 'o4 c4. g8 o5 c4 e-8 f8', 'o5 g4. f8 e-4 c4', 'o5 d-4 c4 o4 b4. g8'];
const HT_A = [...HT_A0, 'o5 c2 r4 o4 g8 g8'];
const HT_A2 = [...HT_A0, 'o4 b-2 r4 f8 f8'];
const HT_B = ['o4 e-2 a-2', 'o5 c2. o4 b-4', 'o4 a-2 f2', 'o4 g1', 'o4 e-4 a-4 o5 c4 e-4', 'o5 f2 e-4 c4', 'o5 d-2 c4 o4 a-4', 'o4 b2 o5 d2'];
const HT_C = [
  'o4 c8 c8 r8 c8 r8 e-8 f8 g8', 'o4 c8 c8 r8 c8 r8 e-8 f8 g8', 'o4 d-8 d-8 r8 d-8 r8 f8 g-8 a-8', 'o4 d-8 d-8 r8 d-8 r8 f8 a-8 b-8',
  'o4 c8 c8 r8 c8 r8 e-8 f8 g8', 'o4 b-8 a-8 g8 f8 e-8 d8 c8 o3 b8', 'o4 d8 f8 b-8 o5 d8 f4 d4', 'o4 b8 o5 d8 f8 a-8 b4 r4',
];
const HT_A2_TWIN = harm(HT_A2, scale('c', 'harmonic'));
const HT_SWELL = 'o4 g2. g8 g8';

const MARCH = '!s8. ?s16 s8 !s8 ?s16 ?s16 s8 !s8 s8';
const MARCH_ROLL = '?s32 ?s32 ?s32 ?s32 ?s32 ?s32 ?s32 ?s32 s32 s32 s32 s32 s32 s32 s32 s32 s32 s32 s32 s32 s32 s32 s32 s32 !s32 !s32 !s32 !s32 !s32 !s32 !s32 !s32';
const HK_HALF = '{kh}8 h8 h8 h8 {sh}8 h8 h8 {kh}8';
const HK_C = '{kh}16 h16 h16 h16 {sh}16 h16 {kh}16 h16 {kh}16 h16 h16 h16 {sh}16 h16 h16 {kh}16';
const GUN = 'r2 _v115 (rimshot)16 (rimshot)16 (rimshot)16 (rimshot)16 (rimshot)16 (rimshot)16 (rimshot)16 (rimshot)16';
const GUN_C = 'r8 _v110 (rimshot)16 (rimshot)16 r8 (rimshot)16 (rimshot)16 r8 (rimshot)16 (rimshot)16 r8 (rimshot)16 (rimshot)16';
const H_PHRASE_HITS = ['o4 e-4 r2.', 'r1', 'r1', 'r2. o3 g4', 'o4 e-4 r2.', 'r1', 'r1', 'r2. o3 g4'];
const gunPhrase = () => ['r1', 'r1', 'r1', GUN, 'r1', 'r1', 'r1', GUN];
const SYN8 = "!B8 B8 B'8 B8 !B8 B8 B'8 B8";
const SYN16 = "!B16 B16 B16 B16 B'16 B16 B16 B16 !B16 B16 B16 B16 B'16 B16 216 B16";

export const BOSS_HARRY: Song = {
  title: 'Love It or Leave It',
  bpm: 150,
  loopFrom: 24,
  reverb: 'hall',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.25, tone: 2800 },
  parts: {
    // (the hippie: the tour's own tune, four bars, then torn off)
    folk: { inst: 'steelgtr', pan: -0.3, rev: 0.3, cho: 0.45, vol: 0.6, mml: join(['_v82'], tourGtr(T_A.slice(0, 4)), rest(42)) },
    flute: { inst: 'flute', pan: 0, rev: 0.45, dly: 0.2, vol: 0.8, mml: join(['_v90'], TM_A.slice(0, 3), ['o4 b2. r4'], rest(42)) },
    sitar: { inst: 'sitar', pan: 0.35, rev: 0.4, dly: 0.25, vol: 0.5, mml: join(['_v85'], ['r1', 'r2 o4 e8 g8 a8 b8', 'r1', 'r2 o5 d8 c8 o4 a8 g8'], rest(42)) },
    scratch: { inst: 'scratch', drums: true, rev: 0.15, vol: 0.8, mml: join(rest(4), ['_v120 g4 r4 [(snare)32]8 r4', 'r1'], rest(40)) },
    // (Rambo)
    lead: { inst: 'synthbrass', pan: 0, rev: 0.25, dly: 0.1, mml: join(rest(5), ['_v100 _e50 _e127/2.', HT_SWELL], ['_v112'], HT_A, HT_A2, ['_v105'], rest(8), ['_v114'], HT_C, ['_v116'], HT_A) },
    twin: { inst: 'synthbrass', pan: 0.35, rev: 0.25, vol: 0.45, mml: join(rest(14), ['_v100'], HT_A2_TWIN, rest(24)) },
    horns: { inst: 'horn', pan: -0.3, rev: 0.32, vol: 0.55, mml: join(rest(5), ['_v95 o4 {d g}1'], ['_v90'], pads(H_A, 55), ['_v100'], HT_A2, ['_v110'], HT_B, ['_v105 q5'], pat(H_C, '!X8 r8 r8 X8 r2', 55), ['q8 _v110'], HT_A) },
    trumpet: { inst: 'trumpet', pan: 0.25, rev: 0.28, vol: 0.6, mml: join(rest(38), ['_v110'], up(HT_A)) },
    choir: { inst: 'choir', pan: 0, rev: 0.48, vol: 0.48, mml: join(rest(22), ['_v95'], pads(H_B, 55), rest(8), ['_v90'], pads(H_A, 55)) },
    strings: { inst: 'strings', pan: 0.3, rev: 0.3, vol: 0.4, mml: join(rest(4), ['_v100 o4 {c e- g}1', 'o3 {b >d g}1'], ['_v85 q6'], pat([...H_A, ...H_A2], '08 18 28 18', 60), ['q8 _v95'], pads(H_B, 60), ['q6 _v90'], pat(H_C, "R16 R'16", 60), ['_v90'], pat(H_A, '08 18 28 18', 60)) },
    gtr: { inst: 'chug', pan: -0.4, rev: 0.08, vol: 0.45, not: ['intro'], mml: join(rest(6), ['_v108'], pat([...H_A, ...H_A2], '!R16 R16 R16 R16 !R16 R16 r8', 40), ['@powerchord'], pat(H_B, '!R2 R2', 40), ['@ _v110'], pat(H_C, '!R16 R16 R16 R16', 40), pat(H_A, '!R16 R16 R16 R16 !R16 R16 r8', 40)) },
    synbass: { inst: 'synthbass', pan: 0, rev: 0.05, vol: 0.7, mml: join(rest(4), ['_v110 o2 c4 r2.', 'o2 g8 g8 g8 g8 g8 g8 g8 g8'], ['_v100'], pat([...H_A, ...H_A2], SYN8, 28), pat(H_B, 'B2 B2', 28), ['_v98'], pat(H_C, SYN16, 28), ['_v100'], pat(H_A, SYN8, 28)) },
    timp: { inst: 'timpani', pan: 0.15, rev: 0.35, vol: 0.55, mml: join(rest(4), ['o2 _v120 c4 r2.', troll('o2 g')], ['_v100'], pat([...H_A, ...H_A2], 'B4 r4 24 r4', 38), pat(H_B, 'B2 B2', 38), rest(7), [troll('o2 b')], pat(H_A, 'B4 r4 24 r4', 38)) },
    hits: {
      inst: 'orchhit', pan: 0, rev: 0.4, vol: 0.45,
      mml: join(rest(4), ['_v120 r4 r4 r4 o4 a-4', 'o4 e-4 r2.'], H_PHRASE_HITS, H_PHRASE_HITS, ['o4 a-4 r2.'], rest(7),
        ['e-', 'e-', 'a-', 'a-', 'e-', 'e-'].map(n => `r8 o4 ${n}8 r4 r8 ${n}8 r4`), ['o4 b-4 r2.', 'r2. o3 g4'], H_PHRASE_HITS),
    },
    bell: { inst: 'chimes', pan: -0.35, rev: 0.5, vol: 0.4, mml: join(rest(22), ['_v100'], pat(H_B, 'R2 r2', 63), rest(16)) },
    snare: {
      inst: 'snare2', drums: true, kit: 'orchestra', pan: 0.1, rev: 0.22, vol: 0.45,
      mml: join(rest(5), [MARCH_ROLL], ['_v100'], [...rep(MARCH, 7), MARCH_ROLL], [...rep(MARCH, 7), MARCH_ROLL], [...rep('r1', 7), MARCH_ROLL], ['_v95'], rep(MARCH, 8), ['_v105'], [...rep(MARCH, 7), MARCH_ROLL]),
    },
    kit: {
      inst: 'kick', drums: true, rev: 0.25, vol: 0.72, not: ['intro'],
      mml: join(rest(6), ['_v105'], sec(8, KIT.mm, FILL.toms), sec(8, KIT.mm, FILL.big), ['_v100'], sec(8, HK_HALF, FILL.toms), ['_v105'], sec(8, HK_C, FILL.snare), ['_v110'], sec(8, KIT.drive, FILL.big)),
    },
    gun: { inst: 'rimshot', drums: true, pan: 0.2, rev: 0.12, vol: 0.5, not: ['intro'], mml: join(rest(6), gunPhrase(), gunPhrase(), rest(8), rep(GUN_C, 6), ['r1', GUN], gunPhrase()) },
    stomp: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.4, vol: 0.75, not: ['intro', 'rage'], mml: join(rest(22), ['_v120 {k(gong)(taiko)}2 {k(taiko)}2'], rep('{k(taiko)}2 {k(taiko)}2', 7), rest(16)) },
  },
  arrangements: {
    main: {},
    intro: { vol: { lead: 0.85, synbass: 0.8 }, level: 0.85 },
    rage: { vol: { kit: 1.2, gun: 1.35, lead: 1.1, snare: 1.15, synbass: 1.1, gtr: 1.15 } },
  },
};
