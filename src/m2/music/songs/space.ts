// FUTURE LAND's music (land id 'space'): the land's theme, a version of it for every section, and its set pieces'
// own songs (the hijacked star sled on the Voyage to 2010, the queen stalking him in the dark basement). The fights
// (the flying saucer over the whole orbit, the queen at the space disco) are in spaceBosses.ts.
//
// ---- "THE FUTURE IS STILL LOADING" (land:space) ----
// The future as imagined in 1962: space-age bachelor-pad pop (Esquivel, Les Baxter's sci-fi side, Raymond Scott),
// recorded in ping-pong stereo off a studio plate. The hook on vibraphone with a wordless "ooh" chorus an octave under
// it, the "zu-zu" voices chirping chords hard right while the brass section pows back hard left, a lounge piano
// comping the Charleston, an upright bouncing two, a light swing on the ride, bongos. A B section that jumps up a
// major third to E major (the World of Tomorrow, gleaming), and a bridge that turns into a 60s TV space show: a
// line cliche in B-flat minor, a wordless soprano over it (the Star Trek lady), and a Raymond Scott machine on the
// xylophone ticking away in sixteenths.
//
// D-flat major, 132, a light swing. 36 bars: a 4-bar intro (once: the harp's glissando, the vibes falling through a
// Lydian G-flat, the voices swelling, the timpani), then:
//   A1 (8)  Dbmaj7 - D9 (the chromatic slide up: the Esquivel lurch) - Ebm7 - Ab13 - Fm7 - Bb7b9 - Ebm7 Ab13 - Db6;
//           the hook on vibes, the zu-zus answering.
//   A2 (8)  the hook again, the "ooh"s under it in unison, the trombone's guide tones; B7 to turn the corner.
//   B  (8)  E major: Emaj7 - C#m7 - F#m7 - B7 - Emaj7 - G#7 - C#m7 F#7 - B7 Ab13 (the half step down home), the
//           snare on the backbeat, the brass pows doubled.
//   C  (8)  the bridge: Bbm - Bbm(maj7) - Bbm7 - Bbm6 (the bass walking down the line) - Gbmaj7 - Ebm7 - Fm7 -
//           Ab7sus Ab13; the soprano, the xylophone machine, toms and woodblocks.
//
// ARRANGEMENTS (one per section, crossfading as he walks; same song, the place kept):
//   square     the full space-age orchestra outdoors (the park's horn speakers can only wish)
//   atom       backstage at the Voyage to 2010, the ride's own 1990 re-record of the park theme heard through the
//              flats: DX bell piano on the hook, warm pad, synth bass, Rhodes, muffled
//   ride       the same, unmuffled (the ride's fallback: seq:space-train is its own song)
//   drag       the main drag, escalated: the hook on an open trumpet, the kit and the brass up
//   needle     Space Needle 2's lobby and its slow, slow spin: elevator muzak (vibes, flute on the bridge, Rhodes,
//              upright, brushes, the harp noodling), through the PA
//   orbit      (the saucer's fight has the whole orbit: boss:ufo) out in space: theremin, oohs, soprano, harp
//   crater     the impact site, a 50s B-movie: the hook on theremin, the timpani and strings up, the bongos gone
//   xenoscare  XENOSCARE (the crater past its door: cues.ts asks for it): the cheap alien-encounter ride in the dark:
//              the hook on a tinkly celesta, a low synth drone, a heartbeat, a low choir, the theremin on the bridge
//   queen      the hold, the queen behind her glass: the drone, the heartbeat, the vibes alone on the hook in a big
//              dark room, the low choir, slow strings, the theremin on the bridge
//   stalker    (seq:stalker is its own song) the drone, the heartbeat and the low choir only
//   disco      the top of the basement's stairs and the space disco (cues.ts asks for it past the stairs): the
//              theme as the hall's own disco record, four on the floor and an octave bass
//   cutscene   celesta on the hook, slow strings, the harp's arpeggios, the upright, the soprano
//   boss       (a fight without a theme) the full band, the kit and the timpani up
//
// ---- "VOYAGE TO 2010" (seq:space-train) ----
// The star sled ride's own soundtrack, made in 1990 and never updated: the cheesiest corporate-optimism synth pop
// money could buy (EPCOT pavilion, a car show reveal): a DX bell piano on the hook, synth brass stabs, a PWM pad, a
// marimba sequencer in sixteenths, slap bass, gated snare and claps, a glockenspiel doubling the chorus and a choir
// singing "aah" at the future. The chorus goes up a half step (the truck driver's gear change: of course it does).
// A major, 144. 32 bars, looping: A (8: Aadd9 - F#m7 - Dadd9 - E - Aadd9 - F#m7 - Bm7 - D/E E), B (8: the bVI - bVII
// - I lift: Fmaj7 - G6 - Amaj7 - F#m7 - Dmaj7 - C#m7 - Bm7 - E7sus F), then the both again in B-flat (the last bar
// back down to E7sus E to come home).
// ARRANGEMENTS (cues.ts picks by where the sled is): act1 (the dark ride, slow: bell piano, pad, marimba, glock, no
// kit), lift (the chain lift: the bass and the brass in, a ratchet ticking), space (act 2, fast: everything), warehouse
// (the breaker's gone and the lights are on: one tinny speaker still playing the bell piano, the bass and the kit),
// cutscene (the brake run, the drop, the station, the launch: everything, orchestra hits).
//
// ---- "SOMETHING IN THE VENTS" (seq:stalker) ----
// The basement under XENOSCARE, the queen hunting him in the dark (the user's: atmospheric, scary, creepy). No beat:
// a contrabass drone on F-sharp swelling and sinking like something breathing, a warm pad on the fifth under it, the
// "ooh"s breathing in and out, a string cluster (F-sharp against G) swelling up out of nothing, a timpani rumble
// growing into a far-off taiko hit, a gong now and then, drips (harp harmonics, echoing). When she's out: her clicks
// (castanets, claves), a heartbeat, her motif low on the horns (F-sharp, G, C: the minor second and the tritone),
// the drone's tritone below. When she's on him: the groove at last: a sixteenth synth-bass ostinato, the kit, taiko,
// tremolo strings sawing at the minor second, brass stabs on the tritone.
// F-sharp (Locrian-ish: the G and the C), 80. 32 bars, looping.
// ARRANGEMENTS (cues.ts picks by what she's doing): dark (she's away), near (she's out: the tells, the prowl, the
// search, the ceiling), hunt (she's seen him: the crouch, the leap, the run; and the stairs).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, hi, chord, bars } from './jungle';

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
const INTRO: Bar[] = ['Gbmaj7', 'Gbmaj7', 'Ab7sus', 'Ab13'];
const A1: Bar[] = ['Dbmaj7', 'D9', 'Ebm7', 'Ab13', 'Fm7', 'Bb7b9', ['Ebm7', 'Ab13'], 'Db6'];
const A2: Bar[] = ['Dbmaj7', 'D9', 'Ebm7', 'Ab13', 'Fm7', 'Bb7b9', 'Ebm7', 'B7'];
const B: Bar[] = ['Emaj7', 'C#m7', 'F#m7', 'B7', 'Emaj7', 'G#7', ['C#m7', 'F#7'], ['B7', 'Ab13']];
const C: Bar[] = ['Bbm', 'BbmM7', 'Bbm7', 'Bbm6', 'Gbmaj7', 'Ebm7', 'Fm7', ['Ab7sus', 'Ab13']];
const LOOP: Bar[] = [...A1, ...A2, ...B, ...C];

const pads = (prog: Bar[]) => bars(prog, (c, b) => chord(V[c], b === 4 ? '1' : '2'));
/** The zu-zus: the chord an octave up, chirped on the and of two and three, and the and of four. */
const zuzu = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(V[c].map(hi), '8'); return b === 4 ? `r4 ${x} ${x} r4 ${x} r8` : `r8 ${x} ${x} r8`; });
/** The brass pows: every other bar, the and of three and a harder and of four. */
const pows = (prog: Bar[]) => prog.map((b, i) => {
  if (i % 2 === 0) return 'r1';
  if (typeof b === 'string') { const x = chord(V[b], '8'); return `_v95 r2 r8 ${x} r8 _v118 ${x}`; }
  return `_v95 r4 r8 ${chord(V[b[0]], '8')} r4 r8 _v118 ${chord(V[b[1]], '8')}`;
});
/** The piano's Charleston. */
const comp = (prog: Bar[]) => bars(prog, (c, b) => (b === 4 ? `${chord(V[c], '4.')} ${chord(V[c], '8')} r2` : `${chord(V[c], '4')} r4`));
/** The upright's bounce: the root, its pickup, the fifth. */
const bounce = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = R[c]; return b === 4 ? `o2 ${r}4. ${r}8 ${f}4 ${f}8 ${r}8` : `o2 ${r}4. ${f}8`; });
/** The Raymond Scott machine: the chord in sixteenths up and back. */
const machine = (prog: Bar[]) => bars(prog, (c, b) => {
  const v = V[c].map(hi), n = [v[0], v[1], v[2], hi(v[0])];
  return [0, 1, 2, 3, 2, 1, 0, 1, 0, 1, 2, 3, 2, 1, 2, 1].slice(0, b * 4).map(k => nt(n[k], '16')).join(' ');
});
/** The harp arpeggiating (an octave up). */
const arp = (prog: Bar[]) => bars(prog, (c, b) => { const v = V[c].map(hi), n = [v[0], v[1], v[2], hi(v[0])]; return [0, 1, 2, 3, 2, 1, 2, 1].slice(0, b * 2).map(k => nt(n[k], '8')).join(' '); });
const drone = (prog: Bar[]) => bars(prog, (c, b) => `o2 {${R[c][0]} ${R[c][1]}}${b === 4 ? '1' : '2'}`);
/** The disco record's octave bass. */
const octs = (prog: Bar[]) => bars(prog, (c, b) => { const r = R[c][0]; return Array.from({ length: b }, () => `o2 ${r}8 o3 ${r}8`).join(' '); });

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
/** The bridge's soprano. */
const T_C = ['o5 f1', 'o5 f2 g-4 f4', 'o5 a-2. g-4', 'o5 f2 d-2', 'o5 b-2. a-4', 'o5 g-2 f4 e-4', 'o5 a-2 o6 c2', 'o6 d-2 c2'];
/** The trombone's guide tones (A2, B). */
const TB_A2 = ['o4 c1', 'o4 c1', 'o4 d-1', 'o4 c1', 'o4 c1', 'o3 b1', 'o3 b-1', 'o3 b1'];
const TB_B = ['o3 g+1', 'o3 g+1', 'o3 a1', 'o3 a1', 'o3 g+1', 'o3 g+2 f+2', 'o3 e2 e2', 'o3 d+1'];
/** The harp's glissandos into each section (a beat each). */
const GL_GB = 'o4 g-32 b-32 o5 d-32 f32 g-32 b-32 o6 d-32 f32';
const GL_DB = 'o4 d-32 f32 a-32 o5 c32 d-32 f32 a-32 o6 c32';
const GL_E = 'o4 e32 g+32 b32 o5 d+32 e32 g+32 b32 o6 d+32';
const GL_BB = 'o4 f32 b-32 o5 d-32 f32 b-32 o6 d-32 f32 b-32';

// ---- The drums ----
const K = '{ki}8 ?i8 {mi}8 i8 {ki}8 ?i8 {mi}8 i8';
const K_IN = '{kx}8 ?i8 {mi}8 i8 {ki}8 ?i8 {mi}8 i8';
const KB = '{ki}8 ?i8 {si}8 i8 {ki}8 {ki}8 {si}8 i8';
const KB_IN = '{kx}8 ?i8 {si}8 i8 {ki}8 {ki}8 {si}8 i8';
const KC = '{kh}8 ?h8 {h(tom3)}8 ?h8 {kh}8 ?h8 {h(tom3)}8 (tom2)8';
const KC_IN = '{kx}8 ?h8 {h(tom3)}8 ?h8 {kh}8 ?h8 {h(tom3)}8 (tom2)8';
const KFILL = '{ki}8 ?i8 {mi}8 i8 s16 s16 (tom2)16 (tom2)16 (tom3)8 (tom4)8';
const BONGO = 'b16 b16 (bongolo)8 b8 (bongolo)8 b16 b16 (bongolo)8 ?b8 (bongolo)8';
const SHAKE = 'z8 ?z8 {zj}8 ?z8 z8 ?z8 {zj}8 ?z8';
const WOOD = 'e8 ?e8 (woodblocklo)8 ?e8 e8 ?e8 (woodblocklo)8 e8';
const BRUSH = '{ki}4 {ish}8 i8 i4 {ish}8 i8';
const DISCO = '{kh}8 o8 {ks}8 o8 {kh}8 o8 {ks}8 o8';
const HEART = 'k8 ?k8 r4 r2';

export const LAND_SPACE: Song = {
  title: 'The Future Is Still Loading',
  bpm: 132,
  swing: 0.25,
  grid: 8,
  loopFrom: 16,
  reverb: 'plate',
  reverbMix: 0.85,
  delay: { beats: 0.75, feedback: 0.3, tone: 3000 },
  parts: {
    hook: { inst: 'vibes', pan: 0, rev: 0.28, dly: 0.12, mml: join(['_v95'], T_IN, ['_v105'], T_A1, ['_v108'], T_A2, ['_v110'], T_B, rest(8)) },
    voices: {
      inst: 'oohs', pan: 0.1, rev: 0.35, vol: 0.55, not: ['needle', 'atom', 'ride', 'xenoscare', 'stalker'],
      mml: join(['_v75 _e40 _e115/1^1 ' + chord(V.Gbmaj7.map(hi), '1'), chord(V.Gbmaj7.map(hi), '1'), chord(V.Ab7sus.map(hi), '1'), `${chord(V.Ab13.map(hi), '2')} r2`, '_e127'], rest(8), ['_v90'], up(T_A2, -1), ['_v95'], up(T_B, -1), rest(8)),
    },
    zuzu: { inst: 'oohs', pan: 0.75, rev: 0.25, vol: 0.4, mml: join(['q3'], rest(4), ['_v90'], zuzu(A1), zuzu(A2), rest(16)) },
    sop: { inst: 'oohs', pan: -0.1, rev: 0.45, dly: 0.15, vol: 0.7, mml: join(rest(4), rest(24), ['_v100'], T_C) },
    brass: {
      inst: 'brass', pan: -0.75, rev: 0.25, vol: 0.55,
      mml: join(['r1', 'r1', 'r1', `_v100 r2 ${chord(V.Ab13, '8')} r8 ${chord(V.Ab13, '8')} r8`], pows(A1), pows(A2), pows(B), ['_v70'], rest(4), pads(['Gbmaj7', 'Ebm7', 'Fm7', ['Ab7sus', 'Ab13']])),
    },
    bone: { inst: 'trombone', pan: -0.3, rev: 0.3, vol: 0.5, not: ['needle', 'cutscene'], mml: join(rest(4), rest(8), ['_v85'], TB_A2, TB_B, rest(8)) },
    strings: { inst: 'strings', pan: 0.2, rev: 0.4, vol: 0.32, mml: join(['_v75'], up(pads(INTRO)), ['_v60'], up(pads(A1)), ['_v70'], up(pads(A2)), ['_v80'], up(pads(B)), ['_v70'], up(pads(C))) },
    machine: { inst: 'xylophone', pan: 0.45, rev: 0.25, dly: 0.1, vol: 0.32, mml: join(['q4'], rest(4), rest(24), ['_v85'], machine(C)) },
    piano: { inst: 'piano', pan: -0.4, rev: 0.22, vol: 0.4, mml: join(rest(4), ['_v80'], comp(LOOP)) },
    bass: { inst: 'upright', pan: 0, rev: 0.08, vol: 0.85, mml: join(['_v95 o2 g-4 r2.', 'o2 g-4 r4 d-4 r4', 'o2 a-4 r2.', 'o2 a-4 r4 e-4 r4'], ['_v100'], bounce(LOOP)) },
    harp: {
      inst: 'harp', pan: 0.3, rev: 0.4, vol: 0.45, not: ['xenoscare', 'stalker', 'disco'],
      mml: join([`_v75 ${GL_GB} r2.`, 'r1', 'r1', `r2. ${GL_DB}`], rest(15), [`r2. ${GL_E}`], rest(7), [`r2. ${GL_BB}`], rest(7), [`r2. ${GL_DB}`]),
    },
    arp: { inst: 'harp', pan: -0.25, rev: 0.4, dly: 0.12, vol: 0.4, only: ['cutscene', 'needle', 'orbit', 'queen'], mml: join(['_v70'], arp(INTRO), arp(LOOP)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.14, vol: 0.6, not: ['needle', 'xenoscare', 'queen', 'stalker', 'cutscene', 'orbit', 'disco'],
      mml: join(['r1', 'r1', 'r1', '_v80 r2 s16 s16 s16 s16 (tom3)8 (tom4)8'], ['_v95 ' + K_IN], rep(K, 6), [KFILL], [K_IN], rep(K, 6), [KFILL], ['_v105 ' + KB_IN], rep(KB, 6), [KFILL], ['_v95 ' + KC_IN], rep(KC, 6), [KFILL]),
    },
    perc: { inst: 'bongohi', drums: true, pan: 0.5, rev: 0.18, vol: 0.45, only: ['main', 'square', 'drag', 'atom', 'ride', 'boss'], mml: join(rest(4), ['_v85'], rep(BONGO, 16), rep(SHAKE, 8), rep(WOOD, 8)) },
    timpani: {
      inst: 'timpani', pan: -0.1, rev: 0.35, vol: 0.5, not: ['needle', 'atom', 'ride', 'disco'],
      mml: join(['_v85 o2 g-4 r2.', 'r1', 'o2 a-4 r2.', ROLL('a-')], ['_v95 o2 d-4 r2.'], rest(7), ['o2 d-4 r2.'], rest(6), [ROLL('b')], ['_v100 o2 e4 r2.'], rest(6), [ROLL('f')], ['_v95 o2 b-4 r2.'], rest(6), [ROLL('a-')]),
    },
    drone: { inst: 'warmpad', pan: 0, rev: 0.5, vol: 0.45, only: ['xenoscare', 'queen', 'stalker'], mml: join(['_v80'], drone(INTRO), drone(LOOP)) },
    choirLow: { inst: 'choir', pan: 0, rev: 0.55, vol: 0.4, only: ['xenoscare', 'queen', 'stalker'], mml: join(['_v70'], up(pads(INTRO), -1), up(pads(LOOP), -1)) },
    heart: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.3, vol: 0.55, only: ['xenoscare', 'queen', 'stalker'], mml: join(['_v100'], rep(HEART, 36)) },
    brushes: { inst: 'kicksoft', drums: true, kit: 'brush', rev: 0.2, vol: 0.55, only: ['needle'], mml: join(rest(4), ['_v85'], rep(BRUSH, 32)) },
    disco: { inst: 'kick', drums: true, rev: 0.12, vol: 0.65, swing: 0, only: ['disco'], mml: join(rest(4), ['_v100'], rep(DISCO, 32)) },
    octs: { inst: 'synthbass', pan: 0, rev: 0.05, vol: 0.5, swing: 0, only: ['disco'], mml: join(rest(4), ['_v95'], octs(LOOP)) },
  },
  arrangements: {
    main: {},
    square: {},
    atom: {
      inst: { hook: 'fmpiano', strings: 'warmpad', bass: 'synthbass', piano: 'epiano', machine: 'marimba' },
      mute: ['brass', 'bone', 'zuzu'],
      vol: { hook: 0.95, strings: 0.45, bass: 0.6, piano: 0.5, kit: 0.7 },
      lowpass: 2200, level: 0.75,
    },
    ride: {
      inst: { hook: 'fmpiano', strings: 'warmpad', bass: 'synthbass', piano: 'epiano', machine: 'marimba' },
      mute: ['brass', 'bone', 'zuzu'],
      vol: { hook: 0.95, strings: 0.45, bass: 0.6, piano: 0.5 },
    },
    drag: { inst: { hook: 'trumpet' }, vol: { hook: 0.85, kit: 1.15, brass: 1.2, bone: 1.1, timpani: 0.8 }, rev: { hook: 0.22 } },
    needle: {
      solo: ['hook', 'strings', 'piano', 'bass', 'brushes', 'arp', 'sop'],
      inst: { strings: 'slowstrings', piano: 'epiano', sop: 'flute' },
      vol: { hook: 0.9, strings: 0.6, piano: 0.85, arp: 0.6, sop: 0.8 },
      lowpass: 3500, level: 0.75,
    },
    orbit: {
      solo: ['hook', 'voices', 'sop', 'strings', 'bass', 'harp', 'arp', 'timpani'],
      inst: { hook: 'theremin', strings: 'slowstrings' },
      vol: { hook: 0.8, strings: 0.6, bass: 0.6 },
      rev: { hook: 0.45, sop: 0.6 },
      level: 0.85,
    },
    crater: {
      inst: { hook: 'theremin', piano: 'vibes' },
      mute: ['zuzu', 'perc', 'brass'],
      vol: { hook: 0.8, timpani: 1.3, kit: 0.7, strings: 1.25, piano: 0.8 },
      rev: { hook: 0.4 },
    },
    xenoscare: {
      solo: ['hook', 'sop', 'drone', 'heart', 'choirLow', 'bass', 'timpani', 'machine'],
      inst: { hook: 'celesta', sop: 'theremin', bass: 'synthbass' },
      vol: { hook: 0.55, sop: 0.55, bass: 0.45, machine: 0.6, timpani: 0.8 },
      rev: { hook: 0.6, sop: 0.55 },
      level: 0.85,
    },
    queen: {
      solo: ['hook', 'sop', 'drone', 'heart', 'choirLow', 'strings', 'timpani', 'arp'],
      inst: { sop: 'theremin', strings: 'slowstrings', arp: 'celesta' },
      vol: { hook: 0.45, sop: 0.55, strings: 0.8, choirLow: 1.2, heart: 1.1, arp: 0.35 },
      rev: { hook: 0.65 },
      level: 0.85,
    },
    stalker: { solo: ['drone', 'heart', 'choirLow', 'timpani'], level: 0.8 },
    disco: {
      solo: ['hook', 'voices', 'zuzu', 'sop', 'brass', 'strings', 'piano', 'disco', 'octs', 'machine'],
      inst: { piano: 'epiano', machine: 'marimba' },
      vol: { piano: 0.8, strings: 1.2 },
      level: 0.9,
    },
    cutscene: {
      solo: ['hook', 'strings', 'arp', 'bass', 'sop'],
      inst: { hook: 'celesta', strings: 'slowstrings' },
      vol: { bass: 0.5, strings: 0.65, sop: 0.6 },
      rev: { hook: 0.45 },
      level: 0.75,
    },
    boss: { vol: { kit: 1.15, brass: 1.1, timpani: 1.2 } },
  },
};

// =====================================================================================================================
// VOYAGE TO 2010

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

const vPads = (prog: Bar[]) => bars(prog, (c, b) => chord(VT[c], b === 4 ? '1' : '2'));
const vStabs = (prog: Bar[]) => bars(prog, (c, b) => (b === 4 ? `${chord(VT[c], '4')} r8 ${chord(VT[c], '8')} r2` : `${chord(VT[c], '4')} r4`));
const vSeq = (prog: Bar[]) => bars(prog, (c, b) => {
  const v = VT[c].map(hi), n = [v[0], v[1], v[2], hi(v[0])];
  return [0, 1, 2, 3, 2, 1, 0, 1, 0, 1, 2, 3, 2, 1, 2, 1].slice(0, b * 4).map(k => nt(n[k], '16')).join(' ');
});
const vSlap = (prog: Bar[]) => bars(prog, (c, b) => {
  const r = RV[c];
  return b === 4 ? `o2 ${r}8 ${r}8 o3 ${r}8 o2 ${r}8 ${r}16 ${r}16 ${r}8 o3 ${r}8 o2 ${r}8` : `o2 ${r}8 ${r}8 o3 ${r}8 o2 ${r}8`;
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

const TK = 'k8 h8 {sp}8 h8 k8 k8 {sp}8 h8';
const TK_IN = '{kx}8 h8 {sp}8 h8 k8 k8 {sp}8 h8';
const TK_FILL = 'k8 h8 {sp}8 h8 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 {s(tom4)}8';

export const SEQ_SPACE_TRAIN: Song = {
  title: 'Voyage to 2010',
  bpm: 144,
  reverb: 'plate',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.3, tone: 3500 },
  parts: {
    lead: { inst: 'fmpiano', pan: 0, rev: 0.25, dly: 0.15, mml: join(['_v105'], rideMel(VM_A, VM_B1, VM_B2)) },
    glock: { inst: 'glock', pan: 0.35, rev: 0.3, dly: 0.2, vol: 0.35, mml: join(['_v85'], rest(8), up(VM_B1), ['_k1'], rest(8), up(VM_B2.slice(0, 7)), ['_k0'], up([VM_B2[7]])) },
    brass: { inst: 'synthbrass', pan: -0.35, rev: 0.2, vol: 0.45, mml: join(['_v100'], [...vStabs(VA), ...vPads(VB1), '_k1', ...vStabs(VA), ...vPads(VB2.slice(0, 7)), '_k0', ...vPads(VB2.slice(7))]) },
    pad: { inst: 'pwm', pan: 0.2, rev: 0.4, vol: 0.4, mml: join(['_v80'], ride(vPads)) },
    arp: { inst: 'marimba', pan: 0.45, rev: 0.2, dly: 0.12, vol: 0.32, mml: join(['q4 _v85'], ride(vSeq)) },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.4, mml: join(rest(8), ['_v90'], vPads(VB1), ['_k1'], rest(8), vPads(VB2.slice(0, 7)), ['_k0'], vPads(VB2.slice(7))) },
    bass: { inst: 'slapbass', pan: 0, rev: 0.05, vol: 0.75, mml: join(['_v100'], ride(vSlap)) },
    kit: { inst: 'kick', drums: true, rev: 0.3, vol: 0.65, mml: join(['_v105'], rep([TK_IN, ...rep(TK, 6), TK_FILL].join(' | '), 4)) },
    ratchet: { inst: 'woodblock', drums: true, pan: -0.4, rev: 0.2, vol: 0.4, only: ['lift'], mml: join(['_v80'], rep('(woodblocklo)8 ?(woodblocklo)8 (woodblocklo)8 ?(woodblocklo)8 (woodblocklo)8 ?(woodblocklo)8 (woodblocklo)8 ?(woodblocklo)8', 32)) },
    hits: {
      inst: 'orchhit', pan: 0, rev: 0.35, vol: 0.55, only: ['cutscene'],
      mml: join(['_v110 o4 a4 r2.'], rest(7), ['o4 f4 r2.'], rest(6), ['o4 e4 r4 o4 f4 r4'], ['_k1'], ['o4 a4 r2.'], rest(7), ['o4 f4 r2.'], rest(6), ['_k0'], ['o4 e4 r4 o4 e4 r4']),
    },
  },
  arrangements: {
    main: {},
    space: {},
    act1: { solo: ['lead', 'pad', 'arp', 'glock'], vol: { pad: 0.8, arp: 0.75 }, level: 0.75 },
    lift: { solo: ['lead', 'pad', 'arp', 'bass', 'ratchet', 'choir', 'brass'], vol: { bass: 0.8 }, level: 0.85 },
    warehouse: { solo: ['lead', 'bass', 'kit'], vol: { kit: 0.55, bass: 0.8 }, lowpass: 1600, level: 0.6 },
    cutscene: { vol: { kit: 1.15, choir: 1.2, brass: 1.15 } },
  },
};

// =====================================================================================================================
// SOMETHING IN THE VENTS

/** Four bars of a drone note: swelling up out of nothing over two, sinking back over two (re-bowed). */
const swell4 = (n: string) => `_e20 _e110/1^1 ${n}1^1 _e110 _e20/1^1 ${n}1^1`;
const ST_HIGH = ['r1', 'r1', 'r1', 'r1', '_e20 _e100/1^1 o5 {f+ g}1^1', '_e100 _e10/1^1 o5 {f+ g}1^1'];
const ST_HITS = ['_v60 f4 r2.', 'r1', 'r1', 'r2 _v40 f4 r4', 'r1', 'r1', '_v50 r4 f4 r2', 'r1'];
const ST_TIMP = ['r1', 'r1', 'r1', 'r1', 'r1', 'r1', 'o2 _v25 [f+32]32', 'o2 _v45 [f+32]16 _v65 [f+32]16'];
const ST_DRIP = ['_v45 o6 c8 r8 r2.', 'r1', 'r2 r8 o5 g8 r4', 'r1', 'r4 o6 f+8 r8 r2', 'r1', 'r1', 'r2. o5 c+8 r8'];
const ST_CLICK = ['(castanets)32 (castanets)32 (castanets)32 r32 r8 r4 r2', 'r2 r8 (clave)32 (clave)32 (clave)32 r32 r4'];
const ST_HORN = ['r1', 'r1', 'r1', '_v75 o3 f+2. g4', 'o3 c1', 'r1', 'r1', 'r1'];
const ST_PULSE = 'o1 f+16 f+16 o2 f+16 o1 f+16 f+16 g16 f+16 o2 c16 o1 f+16 f+16 o2 f+16 o1 f+16 g16 f+16 o2 c16 o1 g16';
const ST_GROOVE = 'k16 ?h16 h16 ?h16 s16 ?h16 k16 h16 ?k16 h16 k16 ?h16 s16 h16 ?h16 h16';
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
    breath: { inst: 'oohs', pan: -0.25, rev: 0.6, vol: 0.4, mml: join(['_v60'], rep('_e5 _e70/1 o3 f+1 _e70 _e5/1 o3 f+1', 16)) },
    hits: { inst: 'taiko', drums: true, pan: 0.35, rev: 0.75, vol: 0.55, mml: join(rep(ST_HITS.join(' | '), 4)) },
    timp: { inst: 'timpani', pan: -0.3, rev: 0.55, vol: 0.5, mml: join(rep(ST_TIMP.join(' | '), 4)) },
    gong: { inst: 'gong', drums: true, kit: 'orchestra', rev: 0.7, vol: 0.4, mml: join(['_v55 _q100 g1^1^1'], rest(13), ['_v50 g1^1^1'], rest(13)) },
    drips: { inst: 'harp', pan: 0.55, rev: 0.6, dly: 0.5, vol: 0.35, mml: join(rep(ST_DRIP.join(' | '), 4)) },
    clicks: { inst: 'castanets', drums: true, pan: -0.5, rev: 0.5, dly: 0.3, vol: 0.4, mml: join(['_v75'], rep(ST_CLICK.join(' | '), 16)) },
    heart: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.25, vol: 0.55, mml: join(['_v100'], rep('k16 ?k16 r8 k16 ?k16 r8 k16 ?k16 r8 k16 ?k16 r8', 32)) },
    horn: { inst: 'horn', pan: -0.2, rev: 0.5, vol: 0.5, mml: join(rep(ST_HORN.join(' | '), 4)) },
    pulse: { inst: 'synthbass', pan: 0, rev: 0.08, vol: 0.55, only: ['hunt'], mml: join(['_v105'], rep(ST_PULSE, 32)) },
    groove: { inst: 'kick', drums: true, rev: 0.25, vol: 0.6, only: ['hunt'], mml: join(['_v105'], rep([...rep(ST_GROOVE, 7), ST_FILL].join(' | '), 4)) },
    taiko: { inst: 'taiko', drums: true, rev: 0.4, vol: 0.6, only: ['hunt'], mml: join(['_v100'], rep(ST_TAIKO, 32)) },
    stabs: { inst: 'brass', pan: 0.3, rev: 0.3, vol: 0.45, only: ['hunt'], mml: join(rep(ST_STABS.join(' | '), 16)) },
    trem: { inst: 'strings', pan: -0.3, rev: 0.4, vol: 0.3, only: ['hunt'], mml: join(['_v85'], rep('o5 [f+32 g32]16', 32)) },
  },
  arrangements: {
    dark: { solo: ['drone', 'pad', 'breath', 'hits', 'timp', 'gong', 'drips', 'high'], vol: { high: 0.6 }, level: 0.85 },
    near: { solo: ['drone', 'low2', 'pad', 'breath', 'hits', 'timp', 'gong', 'drips', 'high', 'clicks', 'heart', 'horn'], level: 0.95 },
    main: { solo: ['drone', 'low2', 'pad', 'breath', 'hits', 'timp', 'gong', 'drips', 'high', 'clicks', 'heart', 'horn'], level: 0.95 },
    hunt: { mute: ['breath', 'drips'], vol: { drone: 0.8, horn: 1.2 } },
  },
};
