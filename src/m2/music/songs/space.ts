// FUTURE LAND's music (land id 'space'): the land's theme, a version of it for every section, and its set pieces'
// own songs (the hijacked star sled on the Voyage to 2010, the queen stalking him in the dark basement). The fights
// (the flying saucer over the whole orbit, the queen at the space disco) are in spaceBosses.ts.
//
// The Mega Man pass (the user's: "it sounds too cutesy overall. give it more of a high energy mega man vibe with the
// songs"): the bachelor-pad lounge is gone; Future Land is a Mega Man X space stage now (Star Man, Storm Eagle).
//
// ---- "THE FUTURE IS STILL LOADING" (land:space) ----
// The future as imagined in 1962, played at Mega Man speed: the hook on a saw lead with a square a third under it,
// the "ooh" chorus an octave under it (the space-age choir it always had), FM-piano arpeggios in sixteenths, synth-brass
// stabs, power chords, a synth bass pumping octaves, a rock kit, bongos; harp glissandi whooshing into each section.
// A B section that jumps up a major third to E major (the World of Tomorrow, gleaming), and a bridge that turns into a
// 60s TV space show at full tilt: a line cliche in B-flat minor, a wordless soprano over it doubling the lead, the
// Raymond Scott machine ticking in sixteenths on the FM piano, the toms rolling.
//
// D-flat major, 156, straight. 36 bars: a 4-bar intro (once: the harp's glissando, the lead falling through a Lydian
// G-flat, the voices swelling, the timpani), then:
//   A1 (8)  Dbmaj7 - D9 (the chromatic slide up: the Esquivel lurch) - Ebm7 - Ab13 - Fm7 - Bb7b9 - Ebm7 Ab13 - Db6.
//   A2 (8)  the hook harmonized, the "ooh"s under it, the arpeggios in; B7 to turn the corner.
//   B  (8)  E major: Emaj7 - C#m7 - F#m7 - B7 - Emaj7 - G#7 - C#m7 F#7 - B7 Ab13 (the half step down home), the
//           Mega Man 2 gallop.
//   C  (8)  the bridge: Bbm - Bbm(maj7) - Bbm7 - Bbm6 (the bass walking down the line) - Gbmaj7 - Ebm7 - Fm7 -
//           Ab7sus Ab13; the soprano and the lead, the machine, the toms.
//
// ARRANGEMENTS (one per section, crossfading as he walks; same song, the place kept):
//   square     the whole band outdoors
//   atom       backstage at the Voyage to 2010, the ride's own 1990 re-record of the park theme heard through the
//              flats: the FM piano on the hook, warm pad, the synth bass, muffled
//   ride       the same, unmuffled (the ride's fallback: seq:space-train is its own song)
//   drag       the main drag, escalated: the hook on a trumpet, the kit and the brass up
//   needle     Space Needle 2's lobby and its slow, slow spin: elevator muzak (vibes, a Rhodes, upright, brushes, the
//              harp noodling), through the PA
//   orbit      (the saucer's fight has the whole orbit: boss:ufo) out in space: the theremin, oohs, soprano, harp
//   crater     the impact site, a 50s B-movie: the hook on the theremin over the whole band, the timpani up
//   xenoscare  XENOSCARE (the crater past its door: cues.ts asks for it): the cheap alien-encounter ride in the dark:
//              the hook far off on the vibes, a low drone, a heartbeat, a low choir, the theremin on the bridge
//   queen      the hold, the queen behind her glass: the drone, the heartbeat, the vibes alone on the hook in a big
//              dark room, the low choir, slow strings, the theremin on the bridge
//   stalker    (seq:stalker is its own song) the drone, the heartbeat and the low choir only
//   disco      the top of the basement's stairs and the space disco (cues.ts asks for it past the stairs): the
//              theme as the hall's own disco record, four on the floor and an octave bass
//   cutscene   vibes on the hook, slow strings, the harp's arpeggios, the bass, the soprano
//   boss       (a fight without a theme) the whole band, the kit and the timpani up

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, hi, chord, bars } from './jungle';
import { scale, harm, pump, arp16, riff, stabs, BEAT, BEAT16, MM2, FILL, FILL2, FILL_BIG, ROLL_UP, X, sec } from './mega';

/** A timpani roll over a bar, building. */
const ROLL = (n: string) => `o2 _v50 [${n}32]8 _v70 [${n}32]8 _v90 [${n}32]8 _v110 [${n}32]8`;

// =====================================================================================================================
// THE FUTURE IS STILL LOADING

const V: Record<string, string[]> = {
  Dbmaj7: ['3a-', '4c', '4d-', '4f'], D9: ['3a', '4c', '4e', '4f+'], Ebm7: ['3b-', '4d-', '4e-', '4g-'], Ab13: ['3g-', '4c', '4e-', '4f'],
  Fm7: ['3a-', '4c', '4e-', '4f'], Bb7b9: ['3a-', '3b', '4d', '4f'], Db6: ['3a-', '3b-', '4d-', '4f'], B7: ['3a', '3b', '4d+', '4f+'],
  Emaj7: ['3b', '4d+', '4e', '4g+'], 'C#m7': ['3b', '4c+', '4e', '4g+'], 'F#m7': ['3a', '4c+', '4e', '4f+'], 'G#7': ['3g+', '4c', '4d+', '4f+'],
  'F#7': ['3a+', '4c+', '4e', '4f+'], Bbm: ['3b-', '4d-', '4f'], BbmM7: ['3a', '4d-', '4f'], Bbm7: ['3a-', '4d-', '4f'], Bbm6: ['3g', '4d-', '4f'],
  Gbmaj7: ['3g-', '3b-', '4d-', '4f'], Ab7sus: ['3g-', '3a-', '4d-', '4e-'],
};
/** The bass's root and the note it bounces to. */
const R: Record<string, [string, string]> = {
  Dbmaj7: ['d-', 'a-'], D9: ['d', 'a'], Ebm7: ['e-', 'b-'], Ab13: ['a-', 'e-'], Fm7: ['f', 'c'], Bb7b9: ['b-', 'f'], Db6: ['d-', 'a-'],
  B7: ['b', 'f+'], Emaj7: ['e', 'b'], 'C#m7': ['c+', 'g+'], 'F#m7': ['f+', 'c+'], 'G#7': ['g+', 'd+'], 'F#7': ['f+', 'c+'],
  Bbm: ['b-', 'f'], BbmM7: ['a', 'f'], Bbm7: ['a-', 'f'], Bbm6: ['g', 'd-'], Gbmaj7: ['g-', 'd-'], Ab7sus: ['a-', 'e-'],
};
const root = (c: string) => R[c][0];
const INTRO: Bar[] = ['Gbmaj7', 'Gbmaj7', 'Ab7sus', 'Ab13'];
const A1: Bar[] = ['Dbmaj7', 'D9', 'Ebm7', 'Ab13', 'Fm7', 'Bb7b9', ['Ebm7', 'Ab13'], 'Db6'];
const A2: Bar[] = ['Dbmaj7', 'D9', 'Ebm7', 'Ab13', 'Fm7', 'Bb7b9', 'Ebm7', 'B7'];
const B: Bar[] = ['Emaj7', 'C#m7', 'F#m7', 'B7', 'Emaj7', 'G#7', ['C#m7', 'F#7'], ['B7', 'Ab13']];
const C: Bar[] = ['Bbm', 'BbmM7', 'Bbm7', 'Bbm6', 'Gbmaj7', 'Ebm7', 'Fm7', ['Ab7sus', 'Ab13']];
const LOOP: Bar[] = [...A1, ...A2, ...B, ...C];
const DBM = scale('d-', 'major'), EMAJ = scale('e', 'major');

const pads = (prog: Bar[]) => bars(prog, (c, b) => chord(V[c], b === 4 ? '1' : '2'));
/** The harp arpeggiating (an octave up). */
const harpArp = (prog: Bar[]) => bars(prog, (c, b) => { const v = V[c].map(hi), n = [v[0], v[1], v[2], hi(v[0])]; return [0, 1, 2, 3, 2, 1, 2, 1].slice(0, b * 2).map(k => nt(n[k], '8')).join(' '); });
const drone = (prog: Bar[]) => bars(prog, (c, b) => `o2 {${R[c][0]} ${R[c][1]}}${b === 4 ? '1' : '2'}`);
/** The disco record's octave bass. */
const octs = (prog: Bar[]) => bars(prog, (c, b) => { const r = R[c][0]; return Array.from({ length: b }, () => `o2 ${r}8 o3 ${r}8`).join(' '); });
/** The voicing's top three (the arpeggios and the stabs want them). */
const top3 = (c: string) => (V[c].length > 3 ? V[c].slice(1) : V[c]);

// ---- The tunes ----
const T_IN = ['o6 d-8 o5 b-8 f8 d-8 o6 c8 o5 a-8 f8 c8', 'o5 b-2. r4', 'o5 a-8 e-8 d-8 o4 a-8 o5 g-8 d-8 o4 a-8 g-8', 'o5 c2 r2'];
const T_A = [
  'o5 r8 f8 a-8 o6 c8 !d-4. c8',
  'o6 c8 o5 a8 o6 e8 f+8 !e4 c4',
  'o5 e-8 g-8 b-8 o6 d-8 o5 !b-4 g-8 e-8',
  'o5 f2 r8 e-8 c8 o4 a-8',
  'o5 r8 c8 e-8 f8 a-4. g8',
  'o5 a-8 f8 d8 o4 b8 o5 d4 f4',
];
const T_A1 = [...T_A, 'o5 g-4 e-8 d-8 c4 e-4', 'o5 d-2 r4 o4 a-8 b-8'];
const T_A2 = [...T_A, 'o5 g-4 e-8 d-8 o4 b-4 o5 e-4', 'o5 d+8 f+8 a8 b8 a4 f+4'];
const T_B = [
  'o5 b4. g+8 e4 d+4',
  'o5 e4 c+8 e8 g+2',
  'o5 a4. f+8 c+4 e4',
  'o5 d+2 r8 f+8 g+8 a8',
  'o5 b4. g+8 e4 f+4',
  'o5 f+4. d+8 c4 o4 g+4',
  'o5 e4 g+8 e8 a+4 c+4',
  'o5 d+4 o4 b4 o5 c4 e-4',
];
/** The bridge (the soprano and the lead). */
const T_C = ['o5 f2. e-8 f8', 'o5 f2 g-4 f4', 'o5 a-2. g-4', 'o5 f2 d-2', 'o5 b-2. a-4', 'o5 g-2 f4 e-4', 'o5 a-2 o6 c2', 'o6 d-2 c2'];
/** The harp's glissandos into each section (a beat each). */
const GL_GB = 'o4 g-32 b-32 o5 d-32 f32 g-32 b-32 o6 d-32 f32';
const GL_DB = 'o4 d-32 f32 a-32 o5 c32 d-32 f32 a-32 o6 c32';
const GL_E = 'o4 e32 g+32 b32 o5 d+32 e32 g+32 b32 o6 d+32';
const GL_BB = 'o4 f32 b-32 o5 d-32 f32 b-32 o6 d-32 f32 b-32';

// ---- The drums ----
const KC = '{kh}8 h8 {s(tom3)}8 h8 {kh}8 (tom2)8 {s(tom3)}8 (tom4)8';
const BONGO = 'b16 b16 (bongolo)8 b8 (bongolo)8 b16 b16 (bongolo)8 ?b8 (bongolo)8';
const BRUSH = '{ki}4 {ish}8 i8 i4 {ish}8 i8';
const DISCO = '{kh}8 o8 {ks}8 o8 {kh}8 o8 {ks}8 o8';
const HEART = 'k8 ?k8 r4 r2';
const CALM = ['needle', 'xenoscare', 'queen', 'stalker', 'cutscene', 'orbit'];

export const LAND_SPACE: Song = {
  title: 'The Future Is Still Loading',
  bpm: 156,
  loopFrom: 16,
  reverb: 'plate',
  reverbMix: 0.6,
  delay: { beats: 0.75, feedback: 0.3, tone: 3000 },
  parts: {
    hook: { inst: 'sawlead', pan: 0, rev: 0.2, dly: 0.12, mml: join(['_v100'], T_IN, ['_v110'], T_A1, ['_v112'], T_A2, ['_v114'], T_B, ['_v105'], T_C) },
    harmony: { inst: 'squarelead', pan: 0.35, rev: 0.2, dly: 0.1, vol: 0.45, not: [...CALM, 'disco'], mml: join(rest(12), ['_v95'], harm(T_A2, DBM, -2), harm(T_B, EMAJ, -2), rest(8)) },
    voices: {
      inst: 'oohs', pan: 0.1, rev: 0.3, vol: 0.45, not: ['needle', 'atom', 'ride', 'xenoscare', 'stalker'],
      mml: join(['_v75 _e40 _e115/1^1 ' + chord(V.Gbmaj7.map(hi), '1'), chord(V.Gbmaj7.map(hi), '1'), chord(V.Ab7sus.map(hi), '1'), `${chord(V.Ab13.map(hi), '2')} r2`, '_e127'], rest(8), ['_v90'], up(T_A2, -1), ['_v95'], up(T_B, -1), rest(8)),
    },
    sop: { inst: 'oohs', pan: -0.1, rev: 0.4, dly: 0.15, vol: 0.6, mml: join(rest(4), rest(24), ['_v105'], T_C) },
    brass: {
      inst: 'synthbrass', pan: -0.3, rev: 0.2, vol: 0.45, not: CALM,
      mml: join(['r1', 'r1', 'r1', `_v100 r2 ${chord(V.Ab13, '8')} r8 !${chord(V.Ab13, '8')} r8`], ['_v100'], stabs(A1, top3, '! . . x . x . .'), stabs(A2, top3, '! . . x . x . x'), stabs(B, top3, '! . x . . x . x'), ['_v85'], pads(C)),
    },
    strings: { inst: 'strings', pan: 0.2, rev: 0.35, vol: 0.32, mml: join(['_v75'], up(pads(INTRO)), ['_v60'], up(pads(A1)), ['_v70'], up(pads(A2)), ['_v80'], up(pads(B)), ['_v75'], up(pads(C))) },
    arp: { inst: 'fmpiano', pan: 0.45, rev: 0.2, dly: 0.12, vol: 0.32, not: CALM, mml: join(rest(12), ['_v85'], arp16(A2, top3, 0), arp16(B, top3, 0), ['_v90'], arp16(C, top3, 0)) },
    power: { inst: 'powerchord', pan: -0.45, rev: 0.06, vol: 0.38, not: [...CALM, 'atom', 'ride', 'disco'], mml: join(['_v100'], riff(INTRO, root, '! - - - x - x -'), ['_v105'], riff(A1, root, '! x . x x . x x'), riff(A2, root, '! x . x x . x x'), riff(B, root, '! x x x x x x x'), riff(C, root, '! - - x - - x -')) },
    bass: { inst: 'synthbass', pan: 0, rev: 0.04, vol: 0.62, not: ['disco'], mml: join(['_v95'], riff(INTRO, root, '! - - - x - x -', 2), ['_v100'], pump(LOOP, root)) },
    harp: {
      inst: 'harp', pan: 0.3, rev: 0.35, vol: 0.45, not: ['xenoscare', 'stalker', 'disco'],
      mml: join([`_v75 ${GL_GB} r2.`, 'r1', 'r1', `r2. ${GL_DB}`], rest(15), [`r2. ${GL_E}`], rest(7), [`r2. ${GL_BB}`], rest(7), [`r2. ${GL_DB}`]),
    },
    arpCalm: { inst: 'harp', pan: -0.25, rev: 0.4, dly: 0.12, vol: 0.4, only: ['cutscene', 'needle', 'orbit', 'queen'], mml: join(['_v70'], harpArp(INTRO), harpArp(LOOP)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.1, vol: 0.75, not: [...CALM, 'disco'],
      mml: join(['r1', 'r1', '_v90 {kx}4 r2.', ROLL_UP], ['_v100'], sec(BEAT, 8, FILL), sec(BEAT16, 8, FILL2), ['_v108'], sec(MM2, 8, FILL), ['_v100'], sec(KC, 8, FILL_BIG)),
    },
    perc: { inst: 'bongohi', drums: true, pan: 0.5, rev: 0.15, vol: 0.4, only: ['main', 'square', 'drag', 'atom', 'ride', 'boss', 'crater'], mml: join(rest(4), ['_v90'], rep(BONGO, 32)) },
    timpani: {
      inst: 'timpani', pan: -0.1, rev: 0.3, vol: 0.5, not: ['needle', 'atom', 'ride', 'disco'],
      mml: join(['_v85 o2 g-4 r2.', 'r1', 'o2 a-4 r2.', ROLL('a-')], ['_v95 o2 d-4 r2.'], rest(7), ['o2 d-4 r2.'], rest(6), [ROLL('b')], ['_v100 o2 e4 r2.'], rest(6), [ROLL('f')], ['_v95 o2 b-4 r2.'], rest(6), [ROLL('a-')]),
    },
    drone: { inst: 'warmpad', pan: 0, rev: 0.45, vol: 0.45, only: ['xenoscare', 'queen', 'stalker'], mml: join(['_v80'], drone(INTRO), drone(LOOP)) },
    choirLow: { inst: 'choir', pan: 0, rev: 0.5, vol: 0.4, only: ['xenoscare', 'queen', 'stalker'], mml: join(['_v70'], up(pads(INTRO), -1), up(pads(LOOP), -1)) },
    heart: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.3, vol: 0.55, only: ['xenoscare', 'queen', 'stalker'], mml: join(['_v100'], rep(HEART, 36)) },
    brushes: { inst: 'kicksoft', drums: true, kit: 'brush', rev: 0.2, vol: 0.55, only: ['needle'], mml: join(rest(4), ['_v85'], rep(BRUSH, 32)) },
    disco: { inst: 'kick', drums: true, rev: 0.1, vol: 0.7, only: ['disco'], mml: join(['r1', 'r1', 'r1', ROLL_UP], ['_v105'], rep(DISCO, 32)) },
    octs: { inst: 'synthbass', pan: 0, rev: 0.04, vol: 0.55, only: ['disco'], mml: join(rest(4), ['_v100'], octs(LOOP)) },
    piano: { inst: 'epiano', pan: -0.4, rev: 0.2, vol: 0.4, only: ['needle', 'atom', 'ride', 'disco'], mml: join(['q4'], rest(4), ['_v80'], stabs(LOOP, top3, '! . . x . . x .')) },
  },
  arrangements: {
    main: {},
    square: {},
    atom: {
      inst: { hook: 'fmpiano', strings: 'warmpad', harmony: 'fmpiano', brass: 'synthbrass' },
      vol: { hook: 1.1, strings: 0.5, bass: 0.8, kit: 0.7, harmony: 0.8 },
      lowpass: 2200, level: 0.75,
    },
    ride: {
      inst: { hook: 'fmpiano', strings: 'warmpad', harmony: 'fmpiano' },
      vol: { hook: 1.1, strings: 0.5, bass: 0.8, harmony: 0.8 },
    },
    drag: { inst: { hook: 'trumpet', harmony: 'trumpet', brass: 'brass' }, vol: { hook: 1.1, kit: 1.12, brass: 1.2, harmony: 1.1 }, rev: { hook: 0.2 } },
    needle: {
      solo: ['hook', 'strings', 'piano', 'bass', 'brushes', 'arpCalm', 'sop'],
      inst: { hook: 'vibes', strings: 'slowstrings', bass: 'upright', sop: 'flute' },
      vol: { hook: 1.1, strings: 0.6, piano: 0.85, arpCalm: 0.6, sop: 0.8, bass: 1.2 },
      lowpass: 3500, level: 0.75,
    },
    orbit: {
      solo: ['hook', 'voices', 'sop', 'strings', 'bass', 'harp', 'arpCalm', 'timpani'],
      inst: { hook: 'theremin', strings: 'slowstrings' },
      vol: { hook: 1.0, strings: 0.6, bass: 0.6 },
      rev: { hook: 0.4, sop: 0.5 },
      level: 0.85,
    },
    crater: {
      inst: { hook: 'theremin', harmony: 'sawlead' },
      vol: { hook: 1.0, timpani: 1.3, kit: 0.85, strings: 1.25 },
      rev: { hook: 0.35 },
    },
    xenoscare: {
      solo: ['hook', 'sop', 'drone', 'heart', 'choirLow', 'bass', 'timpani'],
      inst: { hook: 'vibes', sop: 'theremin', bass: 'synthbass' },
      vol: { hook: 0.7, sop: 0.55, bass: 0.45, timpani: 0.8 },
      rev: { hook: 0.55, sop: 0.5 },
      level: 0.85,
    },
    queen: {
      solo: ['hook', 'sop', 'drone', 'heart', 'choirLow', 'strings', 'timpani', 'arpCalm'],
      inst: { hook: 'vibes', sop: 'theremin', strings: 'slowstrings', arpCalm: 'vibes' },
      vol: { hook: 0.6, sop: 0.55, strings: 0.8, choirLow: 1.2, heart: 1.1, arpCalm: 0.35 },
      rev: { hook: 0.6 },
      level: 0.85,
    },
    stalker: { solo: ['drone', 'heart', 'choirLow', 'timpani'], level: 0.8 },
    disco: {
      solo: ['hook', 'voices', 'sop', 'brass', 'strings', 'piano', 'disco', 'octs', 'arp'],
      vol: { piano: 0.8, strings: 1.2 },
      level: 0.9,
    },
    cutscene: {
      solo: ['hook', 'strings', 'arpCalm', 'bass', 'sop'],
      inst: { hook: 'vibes', strings: 'slowstrings', bass: 'upright' },
      vol: { bass: 0.8, strings: 0.65, sop: 0.6, hook: 1.1 },
      rev: { hook: 0.45 },
      level: 0.75,
    },
    boss: { vol: { kit: 1.15, brass: 1.1, timpani: 1.2 } },
  },
};

// =====================================================================================================================
// "VOYAGE TO 2010" (seq:space-train)
// The star sled ride's own soundtrack, made in 1990 and never updated: the cheesiest corporate-optimism synth pop money
// could buy (EPCOT pavilion, a car show reveal), pushed to Mega Man X speed: a DX bell piano and a saw lead in octaves
// on the hook, a square a third under them in the chorus, synth brass stabs, a PWM pad, a marimba sequencer in
// sixteenths, slap bass pumping octaves, gated snare and claps with a fill into every section, a glockenspiel doubling
// the chorus and a choir singing "aah" at the future. The chorus goes up a half step (the truck driver's gear change:
// of course it does).
// A major, 164. 32 bars, looping: A (8: Aadd9 - F#m7 - Dadd9 - E - Aadd9 - F#m7 - Bm7 - D/E E), B (8: the bVI - bVII
// - I lift: Fmaj7 - G6 - Amaj7 - F#m7 - Dmaj7 - C#m7 - Bm7 - E7sus F), then the both again in B-flat (the last bar
// back down to E7sus E to come home).
// ARRANGEMENTS (cues.ts picks by where the sled is): act1 (the dark ride: the bell piano, the pad, the sequencer, the
// glock, the bass, a light kit), lift (the chain lift: the bass and the brass in, a ratchet ticking), space (act 2:
// everything), warehouse (the breaker's gone and the lights are on: one tinny speaker still playing the bell piano,
// the bass and the kit), cutscene (the brake run, the drop, the station, the launch: everything, orchestra hits).

const VT: Record<string, string[]> = {
  Aadd9: ['4c+', '4e', '4a', '4b'], 'F#m7': ['4c+', '4e', '4f+', '4a'], Dadd9: ['3a', '4d', '4e', '4f+'], E: ['3b', '4e', '4g+'],
  Bm7: ['3a', '3b', '4d', '4f+'], 'D/E': ['3a', '4d', '4f+'], Fmaj7: ['3a', '4c', '4e', '4f'], G6: ['3b', '4d', '4e', '4g'],
  Amaj7: ['4c+', '4e', '4g+', '4a'], Dmaj7: ['4c+', '4d', '4f+', '4a'], 'C#m7': ['3b', '4c+', '4e', '4g+'], E7sus: ['3b', '4d', '4e', '4a'],
  F: ['4c', '4f', '4a'],
};
const RV: Record<string, string> = {
  Aadd9: 'a', 'F#m7': 'f+', Dadd9: 'd', E: 'e', Bm7: 'b', 'D/E': 'e', Fmaj7: 'f', G6: 'g', Amaj7: 'a', Dmaj7: 'd', 'C#m7': 'c+', E7sus: 'e', F: 'f',
};
const VA: Bar[] = ['Aadd9', 'F#m7', 'Dadd9', 'E', 'Aadd9', 'F#m7', 'Bm7', ['D/E', 'E']];
/** The chorus: the first time it ends on F (the way up to B-flat); the second, back down to E. */
const VB1: Bar[] = ['Fmaj7', 'G6', 'Amaj7', 'F#m7', 'Dmaj7', 'C#m7', 'Bm7', ['E7sus', 'F']];
const VB2: Bar[] = ['Fmaj7', 'G6', 'Amaj7', 'F#m7', 'Dmaj7', 'C#m7', 'Bm7', ['E7sus', 'E']];
/** A part over the whole ride: A, B, then both a half step up (the last bar back down). */
const ride = (f: (p: Bar[]) => string[]) => [...f(VA), ...f(VB1), '_k1', ...f(VA), ...f(VB2.slice(0, 7)), '_k0', ...f(VB2.slice(7))];
const rideMel = (a: string[], b1: string[], b2: string[]) => [...a, ...b1, '_k1', ...a, ...b2.slice(0, 7), '_k0', b2[7]];
const vRoot = (c: string) => RV[c];

const vPads = (prog: Bar[]) => bars(prog, (c, b) => chord(VT[c], b === 4 ? '1' : '2'));
const vSeq = (prog: Bar[]) => bars(prog, (c, b) => {
  const v = VT[c].map(hi), n = [v[0], v[1], v[2], hi(v[0])];
  return [0, 1, 2, 3, 2, 1, 0, 1, 0, 1, 2, 3, 2, 1, 2, 1].slice(0, b * 4).map(k => nt(n[k], '16')).join(' ');
});

const VM_A = [
  'o5 e8 a8 b8 o6 c+8 !e4 c+8 o5 b8',
  'o5 a4 f+8 e8 c+4 e4',
  'o5 f+8 a8 b8 o6 d8 !f+4 e8 d8',
  'o6 e2 o5 b4 g+4',
  'o5 e8 a8 b8 o6 c+8 !e4 f+8 e8',
  'o6 c+4. o5 a8 f+4 a4',
  'o5 b4 a8 f+8 d4 f+4',
  'o5 e2. r4',
];
const VM_B = [
  'o5 a4. o6 c8 e2',
  'o6 d4. o5 b8 g2',
  'o5 a8 b8 o6 c+8 e8 g+4 e4',
  'o6 f+4 e8 c+8 o5 a2',
  'o5 f+4. a8 o6 c+4 d4',
  'o6 e4. c+8 o5 g+4 b4',
  'o5 a4 b4 o6 d4 f+4',
];
const VM_B1 = [...VM_B, 'o6 e4 d4 c4 o5 a4'];
const VM_B2 = [...VM_B, 'o6 e4 d4 o5 b4 g+4'];
const AMJ = scale('a', 'major');

const TK = '{kh}8 h8 {sph}8 h8 {kh}8 {kh}8 {sph}8 h8';
const TK16 = '{kh}16 h16 h16 h16 {sph}16 h16 h16 {kh}16 h16 h16 {kh}16 h16 {sph}16 h16 h16 h16';
const TK_FILL = '{kh}8 h8 {sp}8 h8 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 {s(tom4)}8';

export const SEQ_SPACE_TRAIN: Song = {
  title: 'Voyage to 2010',
  bpm: 164,
  reverb: 'plate',
  reverbMix: 0.65,
  delay: { beats: 0.75, feedback: 0.3, tone: 3500 },
  parts: {
    lead: { inst: 'fmpiano', pan: 0.1, rev: 0.22, dly: 0.15, mml: join(['_v110'], rideMel(VM_A, VM_B1, VM_B2)) },
    saw: { inst: 'sawlead', pan: -0.1, rev: 0.2, dly: 0.12, vol: 0.5, not: ['act1', 'warehouse'], mml: join(['_v105'], rideMel(up(VM_A, -1), up(VM_B1, -1), up(VM_B2, -1))) },
    harmony: { inst: 'squarelead', pan: 0.35, rev: 0.2, vol: 0.4, not: ['act1', 'warehouse'], mml: join(rest(8), ['_v95'], harm(VM_B1, AMJ, -2), ['_k1'], rest(8), harm(VM_B2.slice(0, 7), AMJ, -2), ['_k0'], harm([VM_B2[7]], AMJ, -2)) },
    glock: { inst: 'glock', pan: 0.35, rev: 0.3, dly: 0.2, vol: 0.3, mml: join(['_v85'], rest(8), up(VM_B1), ['_k1'], rest(8), up(VM_B2.slice(0, 7)), ['_k0'], up([VM_B2[7]])) },
    brass: { inst: 'synthbrass', pan: -0.35, rev: 0.18, vol: 0.45, mml: join(['_v100'], ride(p => stabs(p, c => VT[c], '! . . x . x . x'))) },
    pad: { inst: 'pwm', pan: 0.2, rev: 0.35, vol: 0.38, mml: join(['_v80'], ride(vPads)) },
    arp: { inst: 'marimba', pan: 0.45, rev: 0.18, dly: 0.12, vol: 0.32, mml: join(['q4 _v90'], ride(vSeq)) },
    choir: { inst: 'choir', pan: 0, rev: 0.4, vol: 0.4, mml: join(rest(8), ['_v90'], vPads(VB1), ['_k1'], rest(8), vPads(VB2.slice(0, 7)), ['_k0'], vPads(VB2.slice(7))) },
    bass: { inst: 'slapbass', pan: 0, rev: 0.04, vol: 0.75, mml: join(['_v105'], ride(p => pump(p, vRoot))) },
    kit: { inst: 'kick', drums: true, rev: 0.25, vol: 0.72, mml: join(['_v105'], sec(TK, 8, TK_FILL), sec(TK16, 8, FILL2), sec(TK, 8, TK_FILL), sec(TK16, 8, FILL_BIG)) },
    ratchet: { inst: 'woodblock', drums: true, pan: -0.4, rev: 0.2, vol: 0.4, only: ['lift'], mml: join(['_v80'], rep('(woodblocklo)8 ?(woodblocklo)8 (woodblocklo)8 ?(woodblocklo)8 (woodblocklo)8 ?(woodblocklo)8 (woodblocklo)8 ?(woodblocklo)8', 32)) },
    hits: {
      inst: 'orchstab', pan: 0, rev: 0.3, vol: 0.55, only: ['cutscene'],
      mml: join(['_v110 o4 a4 r2.'], rest(7), ['o4 f4 r2.'], rest(6), ['o4 e4 r4 o4 f4 r4'], ['_k1'], ['o4 a4 r2.'], rest(7), ['o4 f4 r2.'], rest(6), ['_k0'], ['o4 e4 r4 o4 e4 r4']),
    },
  },
  arrangements: {
    main: {},
    space: {},
    act1: { solo: ['lead', 'pad', 'arp', 'glock', 'bass', 'kit'], vol: { pad: 0.8, arp: 0.8, bass: 0.7, kit: 0.55 }, level: 0.8 },
    lift: { solo: ['lead', 'saw', 'pad', 'arp', 'bass', 'ratchet', 'choir', 'brass'], vol: { bass: 0.85 }, level: 0.88 },
    warehouse: { solo: ['lead', 'bass', 'kit'], vol: { kit: 0.6, bass: 0.8 }, lowpass: 1600, level: 0.6 },
    cutscene: { vol: { kit: 1.15, choir: 1.2, brass: 1.15 } },
  },
};

// =====================================================================================================================
// "SOMETHING IN THE VENTS" (seq:stalker)
// The basement under XENOSCARE, the queen hunting him in the dark (the user's: atmospheric, scary, creepy: so the dark
// and the near stay that way through the high-energy pass). No beat: a contrabass drone on F-sharp swelling and sinking
// like something breathing, a warm pad on the fifth under it, the "ooh"s breathing in and out, a string cluster
// (F-sharp against G) swelling up out of nothing, a timpani rumble growing into a far-off taiko hit, a gong now and
// then, drips (harp harmonics, echoing). When she's out: her clicks (castanets, claves), a heartbeat, her motif low on
// the horns (F-sharp, G, C: the minor second and the tritone). When she's on him it's a Mega Man chase at last: a
// sixteenth synth-bass ostinato, palm-muted guitars chugging it, a distorted lead screaming her motif, the kit with
// double kick, taiko, tremolo strings sawing at the minor second, brass stabs on the tritone.
// F-sharp (Locrian-ish: the G and the C), 80 (the hunt's sixteenths feel like a 160 chase). 32 bars, looping.
// ARRANGEMENTS (cues.ts picks by what she's doing): dark (she's away), near (she's out: the tells, the prowl, the
// search, the ceiling), hunt (she's seen him: the crouch, the leap, the run), panic (the stairs' run: her heard behind
// him, never seen: creepy, no beat).

/** Four bars of a drone note: swelling up out of nothing over two, sinking back over two (re-bowed). */
const swell4 = (n: string) => `_e20 _e110/1^1 ${n}1^1 _e110 _e20/1^1 ${n}1^1`;
const ST_HIGH = ['r1', 'r1', 'r1', 'r1', '_e20 _e100/1^1 o5 {f+ g}1^1', '_e100 _e10/1^1 o5 {f+ g}1^1'];
const ST_HITS = ['_v60 f4 r2.', 'r1', 'r1', 'r2 _v40 f4 r4', 'r1', 'r1', '_v50 r4 f4 r2', 'r1'];
const ST_TIMP = ['r1', 'r1', 'r1', 'r1', 'r1', 'r1', 'o2 _v25 [f+32]32', 'o2 _v45 [f+32]16 _v65 [f+32]16'];
const ST_DRIP = ['_v45 o6 c8 r8 r2.', 'r1', 'r2 r8 o5 g8 r4', 'r1', 'r4 o6 f+8 r8 r2', 'r1', 'r1', 'r2. o5 c+8 r8'];
const ST_CLICK = ['(castanets)32 (castanets)32 (castanets)32 r32 r8 r4 r2', 'r2 r8 (clave)32 (clave)32 (clave)32 r32 r4'];
const ST_HORN = ['r1', 'r1', 'r1', '_v75 o3 f+2. g4', 'o3 c1', 'r1', 'r1', 'r1'];
const ST_PULSE = 'o1 f+16 f+16 o2 f+16 o1 f+16 f+16 g16 f+16 o2 c16 o1 f+16 f+16 o2 f+16 o1 f+16 g16 f+16 o2 c16 o1 g16';
const ST_CHUG = 'o2 !f+16 f+16 f+16 f+16 !f+16 f+16 g16 f+16 !f+16 f+16 f+16 f+16 !c16 f+16 g16 f+16';
const ST_SCREAM = ['_v110 o5 f+2. g4', 'o6 c1', 'o5 f+4 g4 o6 c4 o5 g4', 'o5 f+1', '_v115 o5 a2. b-4', 'o6 e-1', 'o5 a4 b-4 o6 e-4 o5 b-4', 'o5 a2 _f-7/2 a2'];
const ST_GROOVE = '{kh}16 k16 h16 k16 {sh}16 k16 {kh}16 k16 {kh}16 k16 h16 k16 {sh}16 k16 h16 k16';
const ST_FILL = 's16 s16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16 {s(china)}8 {s(china)}8';
const ST_TAIKO = 'f8 r8 f16 f16 r8 f8 r8 f16 f16 f16 f16';
const ST_STABS = ['_v105 o3 {f+ >c}8 r8 r4 r8 o3 {g >d-}8 r4', 'r2 o3 {f+ >c}8 r8 o3 {g >c+}4'];

export const SEQ_STALKER: Song = {
  title: 'Something in the Vents',
  bpm: 80,
  reverb: 'cave',
  reverbMix: 1,
  delay: { beats: 1.5, feedback: 0.45, tone: 1800 },
  parts: {
    drone: { inst: 'cello', pan: -0.1, rev: 0.4, vol: 0.6, mml: join(['_v85'], rep(swell4('o2 f+'), 8)) },
    low2: { inst: 'cello', pan: 0.2, rev: 0.45, vol: 0.45, mml: join(rest(8), ['_v80'], rep(swell4('o3 c'), 2), rest(8), rep(swell4('o2 g'), 2)) },
    pad: { inst: 'warmpad', pan: 0, rev: 0.5, vol: 0.35, mml: join(['_v65'], rep('o2 {f+ >c+}1^1^1^1', 8)) },
    high: { inst: 'slowstrings', pan: 0.3, rev: 0.55, vol: 0.3, mml: join(['_v70'], rep(ST_HIGH.join(' | '), 4)) },
    // (out of every arrangement (the user: a constant whooshing over the stalk): the 'ooh's breathing in and out read as
    // wind, not breath; the cello drone's swell carries the breathing)
    breath: { inst: 'oohs', pan: -0.25, rev: 0.6, vol: 0.4, mml: join(['_v60'], rep('_e5 _e70/1 o3 f+1 _e70 _e5/1 o3 f+1', 16)) },
    hits: { inst: 'taiko', drums: true, pan: 0.35, rev: 0.75, vol: 0.55, mml: join(rep(ST_HITS.join(' | '), 4)) },
    timp: { inst: 'timpani', pan: -0.3, rev: 0.55, vol: 0.5, mml: join(rep(ST_TIMP.join(' | '), 4)) },
    gong: { inst: 'gong', drums: true, kit: 'orchestra', rev: 0.7, vol: 0.4, mml: join(['_v55 _q100 g1^1^1'], rest(13), ['_v50 g1^1^1'], rest(13)) },
    drips: { inst: 'harp', pan: 0.55, rev: 0.6, dly: 0.5, vol: 0.35, mml: join(rep(ST_DRIP.join(' | '), 4)) },
    clicks: { inst: 'castanets', drums: true, pan: -0.5, rev: 0.5, dly: 0.3, vol: 0.4, mml: join(['_v75'], rep(ST_CLICK.join(' | '), 16)) },
    heart: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.25, vol: 0.55, mml: join(['_v100'], rep('k16 ?k16 r8 k16 ?k16 r8 k16 ?k16 r8 k16 ?k16 r8', 32)) },
    horn: { inst: 'horn', pan: -0.2, rev: 0.5, vol: 0.5, mml: join(rep(ST_HORN.join(' | '), 4)) },
    pulse: { inst: 'synthbass', pan: 0, rev: 0.06, vol: 0.55, only: ['hunt'], mml: join(['_v105'], rep(ST_PULSE, 32)) },
    chug: { inst: 'chug', pan: -0.4, rev: 0.05, vol: 0.45, only: ['hunt'], mml: join(['_v105'], rep(ST_CHUG, 32)) },
    scream: { inst: 'distlead', pan: 0.25, rev: 0.3, dly: 0.2, vol: 0.5, only: ['hunt'], mml: join(rest(8), rep(ST_SCREAM.join(' | '), 2), rest(8)) },
    groove: { inst: 'kick', drums: true, rev: 0.2, vol: 0.65, only: ['hunt'], mml: join(['_v105'], rep([X(ST_GROOVE), ...rep(ST_GROOVE, 6), ST_FILL].join(' | '), 4)) },
    taiko: { inst: 'taiko', drums: true, rev: 0.35, vol: 0.6, only: ['hunt', 'panic'], mml: join(['_v100'], rep(ST_TAIKO, 32)) },
    stabs: { inst: 'brass', pan: 0.3, rev: 0.3, vol: 0.45, only: ['hunt'], mml: join(rep(ST_STABS.join(' | '), 16)) },
    trem: { inst: 'strings', pan: -0.3, rev: 0.4, vol: 0.3, only: ['hunt', 'panic'], mml: join(['_v85'], rep('o5 [f+32 g32]16', 32)) },
  },
  arrangements: {
    dark: { solo: ['drone', 'pad', 'hits', 'timp', 'gong', 'drips', 'high'], vol: { high: 0.6 }, level: 0.85 },
    near: { solo: ['drone', 'low2', 'pad', 'hits', 'timp', 'gong', 'drips', 'high', 'clicks', 'heart', 'horn'], level: 0.95 },
    main: { solo: ['drone', 'low2', 'pad', 'hits', 'timp', 'gong', 'drips', 'high', 'clicks', 'heart', 'horn'], level: 0.95 },
    hunt: { mute: ['breath', 'drips', 'heart'], vol: { drone: 0.8, horn: 1.2 } },
    // (the stairs' panic run, her heard and not seen: no beat, no guitars; the drone and the cluster up loud, her clicks,
    // his heart, the strings sawing at the minor second, the taiko under it)
    panic: { solo: ['drone', 'low2', 'pad', 'high', 'hits', 'timp', 'clicks', 'heart', 'horn', 'trem', 'taiko'], vol: { drone: 1.2, high: 1.4, heart: 1.3, clicks: 1.3, trem: 0.9, taiko: 0.6 }, level: 1 },
  },
};
