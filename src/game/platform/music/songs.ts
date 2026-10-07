// Every tune in the game. Each stage has one theme with an arrangement for each part of the stage (the tune carries
// on through, the instruments change around it: Banjo-Kazooie style); the bosses share one theme, arranged for each
// of them; and the menus, the cutscenes and the jingles have their own. Written in MML (see mml.ts). Every part's
// written a bar at a time with its octave at the start of the bar, so a bar can't drift.

import type { Song } from './engine';

/** Bars joined up. */
const b = (...bars: string[]) => bars.join(' | ');
/** A bar (or a few) repeated. */
const rep = (s: string, n: number) => `[${s}]${n}`;
/** One chord per bar, held (a pad). `chords` like 'ace', 'dfa' (all in octave o). */
const pad = (o: number, chords: string[], len = '1') => chords.map(c => `o${o} {${c}}${len}`).join(' | ');
/** Offbeat stabs, four a bar. */
const stabs = (o: number, chords: string[]) => chords.map(c => `o${o} r8 {${c}}8 r8 {${c}}8 r8 {${c}}8 r8 {${c}}8`).join(' | ');
/** Two stabs a bar, on the "and" of one and three (a skank). */
const skank = (o: number, chords: string[]) => chords.map(c => `o${o} r8 {${c}}8 r4 r8 {${c}}8 r4`).join(' | ');
/** Up-and-down eighth-note arpeggios: [low octave notes, high octave note] per bar, e.g. ['ace', 'a']. */
/** The notes in a chord string ('eg+b' is e, g+, b). */
const notes = (c: string) => c.match(/[a-g][+#-]?/g) ?? [];
const arp = (o: number, bars: [string, string][]) => bars.map(([c, top]) => {
  const n = notes(c);
  return `o${o} ${n[0]} ${n[1]} ${n[2]} o${o + 1} ${top} o${o} ${n[2]} ${n[1]} ${n[0]} ${n[1]}`;
}).join(' | ');
/** A bass line: `pattern` with R the root (and F its fifth, O the root an octave up), one root per bar. */
const bass = (o: number, pattern: string, roots: string[]) => roots.map(r => {
  const [root, fifth] = r.split('/');
  return `o${o} ` + pattern.replace(/O/g, `>${root}<`).replace(/F/g, fifth ?? root).replace(/R/g, root);
}).join(' | ');
/** A tune an octave up (every bar's octave raised; its > and < stay as they are). */
const up = (s: string) => s.replace(/o(\d)/g, (_, n) => `o${Number(n) + 1}`);

// A few drum grooves (a bar each)
const ROCK = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8';
const ROCK_FILL = '{kh}8 h8 {sh}8 h8 s16 s16 t16 t16 u16 u16 {kx}8';
const DRIVE = '{kh}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {sh}8';
const FOUR = '{kh}8 o8 {kph}8 o8 {kh}8 o8 {kph}8 o8';
const FUNK = '{kh}16 h16 h16 k16 {sh}16 h16 h16 k16 h16 k16 h16 h16 {sh}16 h16 {kh}16 h16';
const BOOM = 'k8 h8 {sh}8 h8 r16 k16 k8 {sh}8 h8';
const LIGHT = 'k8 z8 m8 z8 k8 k8 m8 z8';

// The chases' grooves (each stage's own: same tempo as the stage's theme, so the song keeps its place, but twice as
// busy, so it feels twice as fast). A bar each, and a fill to end a phrase on.
/** Double kick running sixteenths, the snare on every offbeat eighth: the avalanche coming down behind him. */
const AVALANCHE = '{kh}16 k16 {sh}16 k16 {kh}16 k16 {sh}16 k16 {kh}16 k16 {sh}16 k16 {kh}16 k16 {sh}16 {kh}16';
const AVALANCHE_FILL = '{kh}16 k16 {sh}16 k16 {kh}16 k16 {sh}16 k16 s16 s16 t16 t16 u16 u16 {kf}8';
/** Surf drums: toms running in sixteenths under the backbeat (Wipe Out). */
const WIPE = '{kt}16 t16 t16 t16 {st}16 t16 u16 u16 {kt}16 t16 t16 t16 {st}16 t16 u16 u16';
const WIPE_FILL = '{kt}16 t16 t16 t16 {st}16 t16 u16 u16 s16 s16 s16 s16 {su}16 {su}16 {kx}8';
/** Drum and bass's two-step over a slow tempo: the snare twice a beat, so 92 feels like 184. */
const DNB = '{kh}16 h16 {sh}16 h16 h16 {kh}16 {sh}16 h16 {kh}16 h16 {sh}16 h16 h16 {kh}16 {sh}16 h16';
const DNB_FILL = '{kh}16 h16 {sh}16 h16 h16 {kh}16 {sh}16 h16 s16 s16 s16 s16 t16 t16 u16 u16';
/** Eight bars of a groove: in on a crash, a fill at the end of each four. */
const chase8 = (groove: string, fill: string) => b(groove.replace(/^\{k/, '{kx'), groove, groove, fill, groove, groove, groove, fill);

// Tunes (and roots) used by more than one part of their song
const ERNIE_ROOTS = ['e', 'a', 'e', 'a', 'c', 'a', 'd', 'e'];
// Hector's: a TV cop show's chase theme (the eighties, Miami, a synth that wanted to be a guitar), G minor at 150,
// sixteen bars. The hook's the six o'clock news sting: G, G, up to the D and hanging there, then C, B-flat, C (and
// answered: D, C, A, F); bar eight and sixteen the band all on the sting together, D, D, D, (C, A, F-sharp) back into
// it. The second eight up high on the borrowed E-flat, the hook in the middle of it. On the sand it's Dorian (the E
// natural, the C major: sunny); as the wind gets up the E goes flat (plain minor, the C's minor); and in the storm the
// A goes flat too (the Phrygian: the F's minor, an A-flat under bar seven) and the hook's answer slides down to the
// D-flat, the blue note, so it's still the song, only rotten.
const HECTOR_TUNE = ['o5 l8 g g > d4. c < b- > c', 'o6 d4. c8 < a4 f4', 'o5 l8 g g > d4. c d f', 'o6 g2 r8 f8 e8 d8',
  'o5 l8 g g > d4. c < b- > c', 'o6 d4. c8 < b-4 f4', 'o5 g4. a8 > c4 e4', 'o6 l8 d d r d r c < a f+',
  'o6 g2 f8 e-8 d8 e-8', 'o6 f2 e-8 d8 c8 d8', 'o5 l8 g g > d4. c d f', 'o6 g2 r8 f8 e8 d8',
  'o6 b-4. g8 e-4 g4', 'o6 a4. f8 c4 f4', 'o6 e-4 d4 c4 < b-4', 'o6 l8 d d r d r c < a f+'];
/** The wind up: the E gone flat. */
const HECTOR_GUST = HECTOR_TUNE.map(bar => bar.replace(/e(?![-+])/g, 'e-'));
/** The storm: the A gone flat too (not on the sting, the D major's), and the answer down to the D-flat. */
const HECTOR_DARK = HECTOR_GUST.map((bar, i) => i === 7 || i === 15 ? bar : bar.replace(/a(?![-+])/g, 'a-')).map((bar, i) => i === 3 || i === 11 ? bar.replace(/d8$/, 'd-8') : bar);
/** (G minor, F, C, B-flat, D, E-flat; the C gone minor in the wind; the F minor and the A-flat in the storm) */
const HECTOR_SUN_CHORDS = ['dgb-', 'cfa', 'dgb-', 'ceg', 'dgb-', 'dfb-', 'ceg', 'df+a', 'e-gb-', 'cfa', 'dgb-', 'ceg', 'e-gb-', 'cfa', 'e-gb-', 'df+a'];
const HECTOR_GUST_CHORDS = HECTOR_SUN_CHORDS.map(c => c === 'ceg' ? 'ce-g' : c);
const HECTOR_CHORDS = HECTOR_GUST_CHORDS.map((c, i) => i === 6 ? 'ce-a-' : c === 'cfa' ? 'cfa-' : c);
const HECTOR_SUN_ROOTS = ['g/d', 'f/c', 'g/d', 'c/g', 'g/d', 'b-/f', 'c/g', 'd/a', 'e-/b-', 'f/c', 'g/d', 'c/g', 'e-/b-', 'f/c', 'e-/b-', 'd/a'];
const HECTOR_ROOTS = HECTOR_SUN_ROOTS.map((r, i) => i === 6 ? 'a-/e-' : r);
/** The radar ticking: sixteenths up and over the chord and back. */
const hecTick = (o: number, chords: string[]) => chords.map(c => { const [x, y, z] = notes(c); return `o${o} l16 ${x} ${y} ${z} > ${x} < ${z} ${y} ${x} ${y} ${z} > ${x} < ${z} ${y} ${x} ${y} ${z} ${y}`; }).join(' | ');
/** A line a bar at a time over the roots, the sting bars (eight and sixteen) all on D with the band: D, D, D. */
const hecBars = (o: number, pattern: string, roots: string[], sting = 'd') => roots.map((r, i) => i === 7 || i === 15
  ? `o${o} l8 ${sting} ${sting} r ${sting} r4 ${sting}4` : bass(o, pattern, [r])).join(' | ');
/** One root a bar, as notes (the wind, the timpani). */
const hecRoot = (i: number) => HECTOR_ROOTS[i].split('/')[0];
/** The orchestra hits on the sting (a D major chord, the hit's own), and on the G at the top of each eight. */
const HECTOR_STING = HECTOR_ROOTS.map((_, i) => i === 7 || i === 15 ? 'o4 l8 d d r d r2' : i === 0 || i === 8 ? 'o4 g4 r2.' : 'r1').join(' | ');
// (the kit: on the sand an eighties rock beat, the snare and the clap together for the gated crack, the toms rolling
// the fills; the wind up, the hats in sixteenths, the kick pushing; the storm the kick doubling, toms in the gaps; the
// boat twice as busy, the double kick running and the snare on every offbeat; up the tower half time on the taiko; the
// daycare a clock ticking and a heartbeat)
const HEC_BEACH = '{kh}8 h8 {sph}8 h8 h8 {kh}8 {sph}8 h8';
const HEC_BEACH_FILL = '{kh}8 h8 {sph}8 h8 t16 t16 t16 u16 u16 u16 {sp}8';
const HEC_WIND = '{kh}16 h16 h16 {kh}16 {sph}16 h16 o8 {kh}16 h16 {kh}16 h16 {sph}16 h16 o16 h16';
const HEC_WIND_FILL = '{kh}16 h16 h16 {kh}16 {sph}16 h16 o8 {st}16 t16 {st}16 t16 {su}16 u16 {sp}8';
const HEC_STORM = '{kh}16 k16 h16 k16 {sph}16 h16 {kh}16 k16 {kh}16 h16 {kh}16 k16 {sph}16 h16 {kt}16 u16';
const HEC_STORM_FILL = '{kh}16 k16 h16 k16 {sph}16 h16 {kh}16 k16 {st}16 t16 {su}16 u16 {sf}16 f16 {kx}8';
const HEC_BOAT = '{kh}16 k16 {sp}16 k16 {kt}16 k16 {sp}16 k16 {kh}16 k16 {sp}16 k16 {ku}16 k16 {sp}16 {kh}16';
const HEC_BOAT_FILL = '{kh}16 k16 {sp}16 k16 {kt}16 k16 {sp}16 k16 s16 s16 t16 t16 u16 u16 {kx}8';
const HEC_TOWER = '{kf}8 f8 r8 u16 u16 {sfp}4 r8 t16 u16';
const HEC_TOWER_FILL = '{kf}8 f8 r8 u16 u16 {sf}16 s16 t16 t16 u16 u16 f16 f16';
/** The sting on the kit: the crash and the kick with the band, D, D, D, a roll back in. */
const HEC_STING = '{kxp}8 {kxp}8 r8 {kxp}8 r8 s16 s16 t16 t16 u16 u16';
/** Sixteen bars of a groove: in on a crash, a fill before the sting, the sting, and the same again. */
const hecKit = (groove: string, fill: string) => b(groove.replace(/^\{k/, '{kx'), groove, groove, groove, groove, groove, fill, HEC_STING,
  groove.replace(/^\{k/, '{kx'), groove, groove, groove, groove, groove, fill, HEC_STING);
const TOMMY_ROOTS = ['c', 'c', 'e-', 'f', 'c', 'f', 'a-', 'c'];
// Oscar's: C-sharp minor, down-tuned, sixteen bars. The hook (off the low C-sharp, up through the blue note, the G, into
// the fifth, and falling back home; each eight ending on the Phrygian-dominant run down to the B-sharp, the border in it),
// the second eight up high over F-sharp minor, and the D, the flat two, the menace, before the G-sharp turns it round.
const OSCAR_TUNE = ['o4 l8 c+4. e f+ g g+4', 'o4 l8 b g+ f+ e c+2', 'o4 l8 b4. > c+ < b a f+4', 'o4 l8 e f+ g+2 r4',
  'o4 l8 c+4. e a4 g+ e', 'o4 l8 f+ f+ d+ f+ b4 a4', 'o4 l8 g+4 e c+ e4 f+4', 'o4 l8 g+4. a g+ f+ d+ c',
  'o5 l8 c+4. < b a4 f+4', 'o4 l8 a b a f+ e2', 'o4 l8 e4. f+ g g+ b4', 'o5 c+2. r4',
  'o5 l8 e4. c+ < a4 e4', 'o4 l8 a4 g+ a b4 > c+4', 'o5 l8 d4. c+ < a4 f+4', 'o4 l8 g+2 a g+ c4'];
const OSCAR_ROOTS = ['c+', 'c+', 'b', 'c+', 'a', 'b', 'c+', 'g+', 'f+', 'f+', 'c+', 'c+', 'a', 'a', 'd', 'g+'];
const OSCAR_FIFTH: Record<string, string> = { 'c+': 'g+', b: 'f+', a: 'e', 'g+': 'd+', 'f+': 'c+', d: 'a' };
const OSCAR_BASS = OSCAR_ROOTS.map(r => `${r}/${OSCAR_FIFTH[r]}`);
/** (C#m, B, A, G# with the B-sharp in the bass, F#m, D) */
const OSCAR_CHORDS = OSCAR_ROOTS.map(r => ({ 'c+': 'c+eg+', b: '<b>d+f+', a: 'c+ea', 'g+': 'cd+g+', 'f+': 'c+f+a', d: 'df+a' } as Record<string, string>)[r]);
/** The note `k` half steps over `root` (in octave `o`), as 'oN x'. */
const PC = ['c', 'c+', 'd', 'd+', 'e', 'f', 'f+', 'g', 'g+', 'a', 'a+', 'b'];
const above = (o: number, root: string, k: number) => { const n = PC.indexOf(root) + k; return `o${o + Math.floor(n / 12)} ${PC[n % 12]}`; };
// (the baritone's riff, the bass in unison with it: a dotted stab off the low string and the push through the blue note
// into the next; the second eight half time, stomping)
const OSCAR_RIFF = ['o2 l8 c+. c+16 r c+ e c+ g g+', 'o2 l8 c+. c+16 r c+ b g+ g e', 'o2 l8 b. b16 r b > d+ < b a f+', 'o2 l8 c+. c+16 r c+ e c+ g g+',
  'o2 l8 a. a16 r a > c+ < a g+ e', 'o2 l8 b. b16 r b a f+ d+ f+', 'o2 l8 c+. c+16 r c+ e c+ g g+', 'o2 l8 g+. g+16 r g+ a g+ f+ d+',
  'o2 f+4. f+8 r8 f+8 a8 g+8', 'o2 f+4. f+8 r8 f+8 e8 c+8', 'o2 c+4. c+8 r8 c+8 e8 g8', 'o2 c+4. c+8 r8 c+8 g+8 g8',
  'o2 a4. a8 r8 a8 a4', 'o2 a4. a8 r8 a8 g+8 e8', 'o2 d4. d8 r8 d8 f+8 a8', 'o2 l16 g+8 g+8 g+8 g+8 a g+ a g+ > c8 < g+8'];
// (the chopper: the down-tuned rig. Palm-muted sixteenths on the low string, ringing power chords stabbing in the gaps
// (the blues' flat five in the first eight, Pantera; the second eight a big chord on the one and the push), the run
// down to the B-sharp and the hammering into the top as they are)
const OSCAR_CHUG = OSCAR_ROOTS.map((r, i) => i === 7 || i === 15 ? 'r1' : i < 8 ? `o2 q4 l16 ${r} ${r} ${r} ${r} r8 ${r} ${r} r8 ${r} ${r} r4` : `o2 q4 l16 r4 ${r} ${r} r8 ${r} ${r} ${r} ${r} r4`).join(' | ');
const OSCAR_CRUNCH = OSCAR_ROOTS.map((r, i) => {
  if (i === 7) return 'o2 l8 g+. g+16 r a g+ f+ d+ o3 c';
  if (i === 15) return 'o2 l16 g+8 g+8 g+8 g+8 a g+ a g+ o3 c8 c8';
  const minor = r === 'c+' || r === 'f+';
  if (i >= 8) return `o2 ${r}4 r8 ${r}8 r4 ${above(2, r, minor ? 3 : 7)}8 ${above(2, r, minor ? 5 : 9)}8`;
  // (the flat five on the minor chords; the major ones (A, B) just the fifth and the octave, so they don't fight the tune)
  const [x, y, z, w] = (!minor ? [7, 12, 7, 5] : i % 2 ? [10, 7, 5, 3] : [3, 6, 7, 6]).map(k => above(2, r, k));
  return `r4 ${x}8 r8 ${y}8 r8 ${z}8 ${w}8`;
}).join(' | ');
// (the kit: a stomp in the field, toms in the second eight; laid back on the rim at lunch; double kick on the chopper,
// the second eight thrashing, the snare on every offbeat; half time and the taiko in the fire; a two-step in the bar)
const OSCAR_STOMP = '{kh}8 h8 {sph}8 h8 {kh}8 {kh}16 k16 {sph}8 h8';
const OSCAR_STOMP_FILL = '{kh}8 h8 {sph}8 h8 u16 u16 t16 t16 s16 s16 {kx}8';
const OSCAR_TOMS = '{ku}8 j8 {spj}8 u8 {ku}8 {ku}16 u16 {spj}8 j8';
const OSCAR_TOMS_FILL = '{ku}8 j8 {spj}8 u8 t16 t16 u16 u16 s16 s16 {kx}8';
const OSCAR_LAZY = 'v12 k4 {mz}8 z8 r8 k8 {mz}8 z8';
const OSCAR_LAZY_FILL = 'v12 k4 {mz}8 z8 r8 k8 n16 n16 n8';
const OSCAR_METAL = '{kh}16 k16 {kh}16 k16 {skh}16 k16 {kh}16 k16 {kh}16 k16 {kh}16 k16 {skh}16 k16 {kh}16 k16';
const OSCAR_METAL_FILL = '{kh}16 k16 {kh}16 k16 {skh}16 k16 {kh}16 k16 s16 s16 t16 t16 u16 u16 {kx}8';
const OSCAR_THRASH = '{ko}16 k16 {sk}16 k16 {ko}16 k16 {sk}16 k16 {ko}16 k16 {sk}16 k16 {ko}16 k16 {sk}16 k16';
const OSCAR_THRASH_FILL = '{ko}16 k16 {sk}16 k16 {ko}16 k16 {sk}16 k16 s16 s16 s16 s16 t16 u16 {kx}8';
const OSCAR_DOOM = '{kf}4 r8 k8 {sf}4 r4';
const OSCAR_DOOM_FILL = '{kf}4 r8 k8 {sf}8 u8 t16 t16 u8';
const OSCAR_TWOSTEP = '{kh}8 h8 {sjh}8 h8 {kh}8 h8 {sjh}8 h8';
const OSCAR_TWOSTEP_FILL = '{kh}8 h8 {sjh}8 h8 n16 n16 n16 n16 {sj}8 {kx}8';
// Dale's: Dick Dale's (Drug Trade Dale's), surf guitar gone to the cartel. A Phrygian dominant (A, B-flat, C-sharp, D,
// E, F, G: the King of the Surf Guitar's scale, and the narcocorrido's), sixteen bars. The hook, tremolo-picked: up the
// fifth and leaning on the flat six (A, E, F, E: the menace), falling back through the C-sharp to the B-flat; then the
// same off the B-flat. Bars four and sixteen the whole band stops dead on three hits, SAY. MY. NAME. (A, A, B-flat), and
// bar eight answers YOU'RE GOD-DAMN RIGHT. The second eight goes down the Andalusian steps (D minor, C, B-flat, A: the
// cartel's cadence), the tune spelling each chord out top down, then bottom up, then the scale run all the way down
// into the hits. (Every note with its own length, no ties: the tremolo's made from it.)
const DALE_TUNE = ['o4 a4. > e8 f4. e8', 'o5 d8 c+8 d8 e8 c+4 < b-4', 'o4 b-4. > f8 g4. f8', 'o5 e4 e4 f4 r4',
  'o4 a4. > e8 f4. e8', 'o5 d8 c+8 d8 e8 f4 g4', 'o5 a4. g8 b-4 a8 g8', 'o5 r4 e8 e8 f8 e4.',
  'o5 a2 f4 d4', 'o5 g2 e4 c4', 'o5 f2 d4 < b-4', 'o5 e2 c+4 < a4',
  'o5 d4 f4 a4 > d4', 'o5 c4 e4 g4 > c4', 'o5 b-8 a8 g8 f8 e8 d8 c+8 < b-8', 'o5 e4 e4 f4 r4'];
/** The second trumpet (mariachi's): the tune a third under it in the scale (a sixth under where that's the chord's). */
const DALE_THIRDS = ['o4 f4. > c+8 d4. c+8', 'o4 b-8 a8 b-8 > c+8 < a4 g4', 'o4 g4. > d8 e4. d8', 'o5 c+4 c+4 d4 r4',
  'o4 f4. > c+8 d4. c+8', 'o4 b-8 a8 b-8 > c+8 d4 e4', 'o5 f4. e8 g4 f8 e8', 'o5 r4 c+8 c+8 d8 c+4.',
  'o5 f2 d4 < a4', 'o5 e2 c4 < g4', 'o5 d2 < b-4 f4', 'o5 c+2 < a4 e4',
  'o4 a4 > d4 f4 a4', 'o4 g4 > c4 e4 g4', 'o5 g8 f8 e8 d8 c+8 < b-8 a8 g8', 'o5 c+4 c+4 d4 r4'];
const DALE_ROOTS = ['a/e', 'a/e', 'b-/f', 'a/e', 'a/e', 'a/e', 'g/d', 'a/e', 'd/a', 'c/g', 'b-/f', 'a/e', 'd/a', 'c/g', 'b-/f', 'a/e'];
/** (A, B-flat, G minor, D minor, C) */
const DALE_CHORD: Record<string, string> = { a: 'c+ea', 'b-': 'dfb-', g: 'dgb-', d: 'dfa', c: 'ceg' };
/** The hits: bars four and sixteen (SAY. MY. NAME.), and eight (YOU'RE GOD-DAMN RIGHT). */
const DALE_HIT = [3, 7, 15];
/** The tune tremolo-picked: every note `min` beats long or more re-picked in `div`ths, the rest picked once and left to ring (the hits left as hits). */
const daleTrem = (div: number, min = 0) => DALE_TUNE.map((bar, i) => DALE_HIT.includes(i) ? bar : bar.replace(/([a-g][+-]?)(\d+)(\.?)/g, (m, n, l, dot) => {
  const beats = (4 / Number(l)) * (dot ? 1.5 : 1);
  return beats < min ? m : `[${n}${div}]${(div / 4) * beats}`;
}));
/** A line a bar at a time: `pattern` with R the root, F its fifth, O the root an octave up (or a function of the root), and the hits on `a` and `bb` (notes or chords). */
const daleBars = (o: number, pattern: string | ((root: string) => string), a = 'a', bb = 'b-') => DALE_ROOTS.map((r, i) => {
  if (i === 7) return `o${o} r4 ${a}8 ${a}8 ${bb}8 ${a}4.`;
  if (DALE_HIT.includes(i)) return `o${o} ${a}4 ${a}4 ${bb}4 r4`;
  const [root, fifth] = r.split('/');
  return `o${o} ` + (typeof pattern === 'string' ? pattern.replace(/O/g, `>${root}<`).replace(/F/g, fifth).replace(/R/g, root) : pattern(root));
}).join(' | ');
// (the gallop: an eighth and two sixteenths, four to the bar, off the low string, the B-flat and the run down in each)
const DALE_RIFF = ['o2 l16 a8 a a a8 a a b-8 a a g8 f e', 'o2 l16 a8 a a a8 a a > c+8 < a a > d8 c+ < b-', 'o2 l16 b-8 b- b- b-8 b- b- > d8 < b- b- > f8 e d', 'o2 a4 a4 b-4 r4',
  'o2 l16 a8 a a a8 a a b-8 a a g8 f e', 'o2 l16 a8 a a a8 a a > c+8 < a a > d8 c+ < b-', 'o2 l16 g8 g g g8 g g b-8 g g > d8 c+ < b-', 'o2 r4 a8 a8 b-8 a4.',
  'o2 l16 d8 d d d8 d d f8 d d a8 g f', 'o2 l16 c8 c c c8 c c e8 c c g8 f e', 'o2 l16 b-8 b- b- b-8 b- b- > d8 < b- b- > f8 e d', 'o2 l16 a8 a a a8 a a > c+8 < a a > e8 d c+',
  'o2 l16 d8 d d d8 d d f8 d d a8 g f', 'o2 l16 c8 c c c8 c c e8 c c g8 f e', 'o2 l16 b-8 b- b- b-8 b- b- > d8 < b- b- > f8 e d', 'o2 a4 a4 b-4 r4'];
// (the strut: the gallop eased off, a dotted eighth and a sixteenth, then two eighths, the run down kept at the bar's end)
const DALE_STRUT = ['o2 l16 a8. a a8 a8 b-8. a g8 f e', 'o2 l16 a8. a a8 a8 > c+8. < a > d8 c+ < b-', 'o2 l16 b-8. b- b-8 b-8 > d8. < b- > f8 e d', 'o2 a4 a4 b-4 r4',
  'o2 l16 a8. a a8 a8 b-8. a g8 f e', 'o2 l16 a8. a a8 a8 > c+8. < a > d8 c+ < b-', 'o2 l16 g8. g g8 g8 b-8. g > d8 c+ < b-', 'o2 r4 a8 a8 b-8 a4.',
  'o2 l16 d8. d d8 d8 f8. d a8 g f', 'o2 l16 c8. c c8 c8 e8. c g8 f e', 'o2 l16 b-8. b- b-8 b-8 > d8. < b- > f8 e d', 'o2 l16 a8. a a8 a8 > c+8. < a > e8 d c+',
  'o2 l16 d8. d d8 d8 f8. d a8 g f', 'o2 l16 c8. c c8 c8 e8. c g8 f e', 'o2 l16 b-8. b- b-8 b-8 > d8. < b- > f8 e d', 'o2 a4 a4 b-4 r4'];
// (the cook's crystals: each chord picked out in eighths up high, cold; quiet for the hits)
const DALE_ICE: Record<string, string[]> = { a: ['o4 a', 'o5 c+', 'o5 e', 'o5 a'], 'b-': ['o4 b-', 'o5 d', 'o5 f', 'o5 b-'], g: ['o4 g', 'o4 b-', 'o5 d', 'o5 g'], d: ['o5 d', 'o5 f', 'o5 a', 'o6 d'], c: ['o5 c', 'o5 e', 'o5 g', 'o6 c'] };
const DALE_CRYSTAL = DALE_ROOTS.map((r, i) => DALE_HIT.includes(i) ? 'r1' : [0, 2, 1, 3, 2, 1, 0, 2].map(k => `${DALE_ICE[r.split('/')[0]][k]}8`).join(' ')).join(' | ');
// (the kit: surf drums out in the desert, a tom at the end of the bar; the cook a machine, the hats ticking and the
// lighter's crack; the convoy double kick, a tom on the offbeat; the last truck galloping on the taiko and the toms;
// Deadwood Gulch a narcocorrido's polka; Riggs's cab the polka twice as busy. Every one stopping dead for the hits)
const DALE_SURF = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 u8';
const DALE_SURF_FILL = '{kh}8 h8 {sh}8 h8 s8 t8 u8 {kx}8';
const DALE_SAY = '{kx}4 {kx}4 {kx}4 s16 s16 s16 s16';
const DALE_RIGHT = 's16 s16 t16 u16 {kx}8 {kx}8 {kx}8 {kx}4.';
const DALE_COOK = '{kh}8 h16 h16 {sh}8 h8 {kh}8 {kh}16 h16 {sh}8 a8';
const DALE_COOK_FILL = '{kh}8 h16 h16 {sh}8 h8 s16 s16 a16 s16 t16 u16 {kx}8';
const DALE_RUN = '{kh}16 k16 {sh}8 {kh}16 k16 {sh}16 t16 {kh}16 k16 {sh}8 {kh}16 k16 {sh}8';
const DALE_RUN_FILL = '{kh}16 k16 {sh}16 t16 {kh}16 k16 {sh}16 u16 s16 s16 t16 t16 u16 u16 {kx}8';
const DALE_DUEL = '{kf}8 u16 u16 {sf}8 r8 {kf}8 k8 {sf}8 t8';
const DALE_DUEL_FILL = '{kf}8 u16 u16 {sf}8 u8 t8 t8 f8 {kxf}8';
const DALE_POLKA = '{kh}8 {sh}8 {kh}8 {sh}8 {kh}8 {sh}8 {kh}8 {sjh}8';
const DALE_POLKA_FILL = '{kh}8 {sh}8 {kh}8 {sh}8 s16 s16 t16 t16 u16 u16 {kx}8';
const DALE_STAMPEDE = '{kh}16 j16 {sh}16 j16 {kh}16 j16 {sh}16 j16 {kh}16 j16 {sh}16 j16 {kh}16 {kh}16 {sh}16 j16';
const DALE_STAMPEDE_FILL = '{kh}16 j16 {sh}16 j16 {kh}16 j16 {sh}16 j16 s16 s16 t16 t16 u16 u16 {kx}8';
/** Sixteen bars of a groove round the hits: in on a crash (and again at the second eight), a fill before the last four. */
const daleKit = (groove: string, fill: string) => b(groove.replace(/^\{k/, '{kx'), groove, groove, DALE_SAY, groove, groove, groove, DALE_RIGHT,
  groove.replace(/^\{k/, '{kx'), groove, groove, fill, groove, groove, groove, DALE_SAY);

// Barry's: the tune (on the sax, in the alto's smoky middle), the high wail over the dread, the Rhodes' chords and the
// strings' guide tones (one a bar, or two where the chord changes halfway), and the brushes and the ride
const BARRY_TUNE = ['o4 l8 f4 a- b- > c4 < b- a-', 'o4 g4 f e- f2', 'o4 f4 a- b- > c e- d- c', 'o4 b-2. r4', 'o4 a-4 b- > c d-4 c4', 'o4 b-4 a- g f4 e-4', 'o4 d-4 e- f g4 e-4', 'o4 f1'];
const BARRY_HIGH = ['o5 r4 c4 e-4 d-8 c8', 'o5 d-2. r8 c8', 'o5 e-4 f4 a-4. g8', 'o5 g-2. r4', 'o5 f4 a-4 > c4. < b-8', 'o5 a-4 f4 d-4 c4', 'o5 d-4. c8 < b-4 g4', 'o5 d-2 c2'];
// (Fm9, Dbmaj7#11, Fm9 Bbm9, C7b9, Dbmaj9, Gm7b5 C7b9, Bbm7 C7#9, Fm(maj7); then Fm9 and Gb over the F pedal, Dbmaj9, Bbm9, Gm7b5, C7b9)
const BARRY_CHORDS: [string, string?][] = [['e-ga->c'], ['fga->c'], ['e-ga->c', 'a->cd-f'], ['eb->d-g'], ['fa->ce-'], ['fb->d-', 'eb->d-'], ['fa->d-', 'eb->e-'], ['ea->cg'],
  ['e-ga->c'], ['g-b->d-f'], ['e-ga->c'], ['g-b->d-f'], ['fa->ce-'], ['a->cd-f'], ['fb->d-'], ['eb->d-g']];
const BARRY_TREM: [string, string?][] = [['a->e-'], ['a->c'], ['a->e-', 'a->d-'], ['b->e'], ['a->c'], ['b->f', 'b->e'], ['a->d-', 'b->e'], ['a->c'],
  ['a->e-'], ['g->f'], ['a->e-'], ['g->f'], ['a->c'], ['a->d-'], ['b->f'], ['b->e', 'b->d-']];
const BARRY_JAZZ = 'v11 {ki}4 {hin}8 i8 i4 {hin}8 i8';

// Artie's: F-sharp minor, sixteen bars. The tune (a leap up a fifth and back, then the long climb; the second eight up
// on the flat two, G, the Phrygian menace, and the C-sharp major turning it back round), its chords (bar seven's split,
// D then C-sharp), and the riffs.
const ARTIE_TUNE = ['o5 l8 f+4. > c+ d4 c+4', 'o5 a4 b a f+2', 'o5 g+4. b > e4 d c+', 'o6 c+2. r4', 'o5 f+4. > c+ d4 e4', 'o6 f+4 e d c+4 < b4', 'o5 a4 b4 > c+4 < e+4', 'o5 f+1',
  'o6 d2 c+4 < a4', 'o5 b2 g+4 e4', 'o5 a4. b > c+4 e4', 'o6 f+2. r4', 'o6 g4. f+ d4 < b4', 'o6 d4 < b g b4 > d4', 'o6 c+4 < b a g+4 e+4', 'o5 g+2. r4'];
const ARTIE_ROOTS = ['f+', 'd', 'e', 'c+', 'f+', 'b', 'd|c+', 'f+', 'd', 'e', 'f+', 'f+', 'g', 'g', 'c+', 'c+'];
/** The chords as voiced up in octave 4 (for the pads, and the ostinato's tones). */
const ARTIE_CHORD: Record<string, string> = { 'f+': 'f+a>c+', d: 'f+a>d', e: 'g+b>e', 'c+': 'g+>c+e+', b: 'f+b>d', g: 'gb>d' };
/** A bass-ish line a bar at a time: `full` with R the root (O an octave up), or `half` twice where the bar's split (d|c+). */
const artieBars = (o: number, full: string, half: string, roots: string[]) => roots.map(r => {
  const [x, y] = r.split('|');
  const one = (p: string, n: string) => p.replace(/O/g, `>${n}<`).replace(/R/g, n);
  return `o${o} ` + (y ? `${one(half, x)} ${one(half, y)}` : one(full, x));
}).join(' | ');
/** The ice running under it all: sixteenths up and down the chord, in threes against the beat (6 + 6 + 4). */
const artieIce = (o: number) => ARTIE_ROOTS.map(r => {
  const tones = (c: string) => { let up = 0; const out: string[] = []; for (const m of ARTIE_CHORD[c].match(/>|[a-g][+-]?/g)!) { if (m === '>') up++; else out.push(`o${o + up} ${m}16`); } out.push(`o${o + 1} ${out[0].split(' ')[1].replace('16', '')}16`); return out; };
  const [x, y] = r.split('|');
  const idx = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3];
  return idx.map((k, i) => tones(y && i >= 8 ? y : x)[k]).join(' ');
}).join(' | ');
const artiePad = (o: number) => ARTIE_ROOTS.map(r => { const [x, y] = r.split('|'); return y ? `o${o} {${ARTIE_CHORD[x]}}2 {${ARTIE_CHORD[y]}}2` : `o${o} {${ARTIE_CHORD[x]}}1`; }).join(' | ');
// (the riff: a dotted stab and the push into the next, on the low strings; the second eight half time, heavy)
const ARTIE_RIFF = ['o2 l8 f+. f+16 r f+ r f+ a g+', 'o2 l8 d. d16 r d r d f+ e', 'o2 l8 e. e16 r e r e g+ a', 'o2 l8 c+. c+16 r c+ c+ c+ e+ g+',
  'o2 l8 f+. f+16 r f+ r f+ a g+', 'o2 l8 b. b16 r b r b > d c+', 'o2 l8 d. d16 r d c+. c+16 r c+', 'o2 l8 f+. f+16 r f+ f+16 f+16 f+ a b',
  'o2 d4. d8 r8 d8 d4', 'o2 e4. e8 r8 e8 e4', 'o2 f+4. f+8 r8 f+8 f+4', 'o2 f+4. f+8 r8 f+8 a8 g+8', 'o2 g4. g8 r8 g8 g4', 'o2 g4. g8 r8 g8 b8 a8', 'o2 c+4. c+8 r8 c+8 c+4', 'o2 l16 c+8 c+8 c+8 c+8 c+ c+ c+ c+ e+8 g+8'];
// (the drums: a rock beat thumping the low tom; the second eight on the taiko and the toms, the gale; on the summit the
// toms all the way; the tram half time on the ride)
const ARTIE_BEAT = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {ku}8';
const ARTIE_BEAT_FILL = '{kh}8 h8 {sh}8 h8 {kt}16 t16 t8 {su}16 u16 {kx}8';
const ARTIE_GALE = '{kf}8 u16 u16 {sf}8 u8 {kf}8 f8 {su}8 u16 t16';
const ARTIE_GALE_X = ARTIE_GALE.replace('{kf}', '{kxf}');
const ARTIE_GALE_FILL = '{kf}8 u16 u16 {sf}8 u8 s16 s16 t16 t16 u16 u16 f16 f16';
const ARTIE_PEAK = '{kf}8 o8 {sf}8 u16 u16 {kf}8 {kf}8 {sf}8 t16 u16';
const ARTIE_GLIDE = '{ki}8 i8 i8 {ki}8 {si}8 i8 i8 i8';
const ARTIE_GLIDE_FILL = '{ki}8 i8 i8 {ki}8 {si}8 t16 t16 u16 u16 f8';

// The map's: C minor, sixteen bars. The hook (C, up to the G, leaning on the A-flat; the B natural hanging over the G;
// the second eight up high, the D-flat and the G at the end, the menace), its roots, the electric piano's chords and the
// low brass's fifths.
const MAP_TUNE = ['o5 l8 c4. g a-4 g4', 'o5 l8 f e- d e- c4 r4', 'o5 l8 c4. g a-4 > c4', 'o5 b2. r4', 'o5 l8 c4. g a-4 g4', 'o6 l8 e- d c < b- a-4 g4', 'o5 l8 a-4. g f4 d-4', 'o5 d2 < b4 r4',
  'o6 c2 < a-4 f4', 'o5 l8 g a- g f e-2', 'o5 l8 g4. > c e-4 d4', 'o6 c2. r4', 'o6 l8 e-4. d c4 < a-4', 'o5 l8 f4. e- d-4 c4', 'o5 l8 b4. a- g4 f4', 'o5 e-2 d4 r4'];
const MAP_ROOTS = ['c/g', 'c/g', 'a-/e-', 'g/d', 'c/g', 'c/g', 'd-/a-', 'g/d', 'f/c', 'f/c', 'c/g', 'c/g', 'a-/e-', 'd-/a-', 'g/d', 'g/d'];
/** (Cm9, Abmaj7, G7b9, Dbmaj7, Fm7: rootless where the bass has it) */
const MAP_CHORD: Record<string, string> = { 'c/g': 'ce-g>d', 'a-/e-': 'ce-g', 'g/d': '<b>dfa-', 'd-/a-': 'd-fa->c', 'f/c': 'ca-e-f' };
const MAP_LOW: Record<string, string> = { 'c/g': 'cg', 'a-/e-': 'a->e-', 'g/d': 'g>d', 'd-/a-': 'd-a-', 'f/c': 'f>c' };
/** A tune an octave down. */
/**
 * The White House open: the same tune, gone major (every flat in it natural: C major, and the chords under it I, vi, ii,
 * IV, V), for the brass. The roots and the triads for it.
 */
const MAP_TUNE_UP = MAP_TUNE.map(bar => bar.replace(/([a-g])-/g, '$1'));
const MAP_ROOTS_UP = MAP_ROOTS.map(r => r.replace(/-/g, ''));
const MAP_TRIAD: Record<string, string> = { 'c/g': 'ceg', 'a/e': 'ace', 'g/d': '<b>dg', 'd/a': 'dfa', 'f/c': 'cfa' };
const MAP_MARCH = 'v12 {kh}8 s16 s16 {sh}8 s16 s16 {kh}8 s16 s16 {sh}8 h8';
const MAP_MARCH_FILL = 'v12 {kh}8 s16 s16 {sh}8 s16 s16 s16 s16 t16 t16 u16 u16 {sx}8';
const down = (s: string) => s.replace(/o(\d)/g, (_, n) => `o${Number(n) - 1}`);
// (the kit: a cross-stick on two and four, the hats ticking like the clock, the kick laid back; the second four pushing
// sixteenths, the snare in for the cross-stick, toms into the turnaround)
const MAP_TICK = 'v12 {kh}8 h16 h16 {smh}8 h8 {kh}16 h16 {kh}8 {smh}8 h16 k16';
const MAP_TICK_FILL = 'v12 {kh}8 h16 h16 {smh}8 h8 {kh}8 s16 t16 u16 u16 {sx}8';
const MAP_PUSH = 'v12 {kh}16 h16 h16 h16 {sh}16 h16 h16 k16 h16 k16 h16 h16 {sh}16 h16 {mh}16 h16';
const MAP_PUSH_FILL = 'v12 {kh}16 h16 h16 h16 {sh}16 h16 h16 k16 t16 t16 u16 u16 {su}16 s16 s16 s16';
const MAP_TYPE = 'v11 r4 e16 e16 e16 r16 r4 e16 r16 e16 e16 | v11 r2 e16 e16 r8 e16 e16 e16 e16';

export const SONGS: Record<string, Song> = {
  // ---------------------------------------------------------------------------------------------------------------
  // The title: a big, dumb, heroic rock anthem. Power chords, a brass tune, a lot of drums.
  title: {
    bpm: 150,
    parts: {
      riff: { inst: 'power', vol: 0.9, pan: -0.3, mml: rep('o2 l8 e e r e g4 a4 | o2 l8 e e r e c4 d4', 4) },
      bass: { inst: 'bass', mml: rep('o2 l8 e e e e g g a a | o2 l8 e e e e c c d d', 4) },
      lead: { inst: 'brass', pan: 0.15, mml: b('o5 l8 e4. g b4 a g', 'o5 a4 g e d2', 'o5 e4. g b4 > d < b', 'o5 a2^4 r4', 'o6 e4. d < b4 a g', 'o5 a4 b g e2', 'o5 d4. e g4 a b', 'o5 e1') },
      harm: { inst: 'strings', vol: 0.6, pan: 0.35, mml: rep(`${pad(4, ['egb'])} | o4 {ceg}2 {df+a}2`, 4) },
      drums: { inst: 'kick', drums: true, mml: b(`{kx}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8`, ROCK, ROCK, ROCK, ROCK, ROCK, ROCK, ROCK_FILL) },
      choir: { inst: 'choir', vol: 0.8, only: ['ending'], mml: b('o5 l8 e4. g b4 a g', 'o5 a4 g e d2', 'o5 e4. g b4 > d < b', 'o5 a2^4 r4', 'o6 e4. d < b4 a g', 'o5 a4 b g e2', 'o5 d4. e g4 a b', 'o5 e1') },
    },
    arrangements: {
      main: {},
      ending: { inst: { lead: 'trumpet', harm: 'slowstrings' }, vol: { riff: 0.7 } },
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // The gym (the opening stage): an 80s workout montage. A pumping synth bass, gated drums, a brass hook to punch the
  // air to, a guitar chugging under it.
  gym: {
    bpm: 128,
    parts: {
      bass: { inst: 'bass', mml: rep('o2 l8 e e > e < e e e > e < e | o2 l8 c c > c < c d d > d < d', 4) },
      chug: { inst: 'power', vol: 0.7, pan: -0.3, mml: rep('o3 l16 e e e e r8 e e e e r8 e8 g8 | o3 l16 c c c c r8 c c d d r8 d8 f+8', 4) },
      lead: { inst: 'brass', pan: 0.2, mml: b('o5 l8 b4 b a g4 e4', 'o5 g4 a b > d4 < b4', 'o5 b4 b a g4 a4', 'o5 b2. r4', 'o6 e4 d < b > d4 e4', 'o6 d4 < b a g4 a4', 'o5 b4 > d < b a4 g4', 'o5 e1') },
      pad: { inst: 'strings', vol: 0.5, pan: 0.35, mml: rep(`${pad(4, ['egb'])} | o4 {ceg}2 {df+a}2`, 4) },
      drums: { inst: 'kick', drums: true, mml: b(DRIVE, DRIVE, DRIVE, ROCK_FILL, DRIVE, DRIVE, DRIVE, ROCK_FILL) },
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // The map (the stage select): the back office of the FBI at night, the cork board of mugshots and the red string, the
  // tube flickering, cold coffee, picking which of America's most wanted to go after. C minor at 92: a synth bass
  // pulsing a low ostinato, an out-of-tune electric piano, the tube and the radiator humming a pedal under it, a cross-
  // stick and the hats ticking like the clock on the wall, somebody typing up a report, and a hollow thriller synth on
  // the hook. The second four: the horns down under the hook, the bass running sixteenths, the strings trembling, the low
  // brass swelling, the timpani, a clock ticking on the piano, the kit pushing harder: the manhunt's on.
  map: {
    bpm: 108,
    parts: {
      lead: { inst: 'hollow', pan: 0.15, mml: b(...MAP_TUNE) },
      horn: { inst: 'horn', vol: 0.8, pan: -0.1, only: ['set2'], mml: b(...MAP_TUNE.map(down)) },
      bass: { inst: 'synthbass', vol: 0.9, not: ['set2'], mml: bass(2, 'q6 R8 R16 R16 r8 R8 O8 R8 F8 R8', MAP_ROOTS) },
      run: { inst: 'synthbass', vol: 0.8, only: ['set2'], mml: bass(2, 'q5 l16 R R O R R R F R R R O R R F O R', MAP_ROOTS) },
      keys: { inst: 'murk', vol: 0.7, pan: -0.3, mml: MAP_ROOTS.map(r => `o4 {${MAP_CHORD[r]}}4. {${MAP_CHORD[r]}}8 r2`).join(' | ') },
      // (the clock: G and A-flat, ticking over every chord)
      tick: { inst: 'murk', vol: 0.4, pan: 0.35, only: ['set2'], mml: rep('o5 l8 g a- g a- g a- g a-', 16) },
      hum: { inst: 'hum', vol: 0.8, mml: rep('o3 c1^1^1^1', 4) },
      str: { inst: 'strings', vol: 0.4, pan: 0.3, only: ['set2'], mml: MAP_ROOTS.map(r => `o4 l16 [{${MAP_CHORD[r]}}]16`).join(' | ') },
      low: { inst: 'swell', vol: 0.6, only: ['set2'], mml: MAP_ROOTS.map(r => `o2 {${MAP_LOW[r]}}1`).join(' | ') },
      timp: { inst: 'timpani', vol: 0.7, only: ['set2'], mml: b('v12 o2 c4 r2.', 'r1', 'r1', 'o2 g4 r2.', 'o2 c4 r2.', 'r1', 'r1', 'o2 g4 r2.', 'o2 f4 r2.', 'r1', 'o2 c4 r2.', 'r1', 'o2 a-4 r2.', 'o2 d-4 r2.', 'o2 g4 r2.', 'o2 g4 r4 v8 [g32]8 v12 [g32]8') },
      drums: { inst: 'kick', drums: true, not: ['set2'], mml: rep(b(rep(MAP_TICK, 7), MAP_TICK_FILL), 2) },
      push: { inst: 'kick', drums: true, only: ['set2'], mml: b(MAP_PUSH.replace('{kh}', '{kxh}'), MAP_PUSH, MAP_PUSH, MAP_PUSH, MAP_PUSH, MAP_PUSH, MAP_PUSH, MAP_PUSH_FILL, MAP_PUSH.replace('{kh}', '{kxh}'), MAP_PUSH, MAP_PUSH, MAP_PUSH, MAP_PUSH, MAP_PUSH, MAP_PUSH, MAP_PUSH_FILL) },
      // (somebody two desks over typing up a report; the bell at the end of the line)
      type: { inst: 'kick', drums: true, mml: b(rep(MAP_TYPE, 7), 'v11 r4 e16 e16 e16 e16 e16 e16 e16 e16 r4', 'v11 e16 e16 e16 r16 r2.') },
      ding: { inst: 'bell', vol: 0.6, pan: 0.4, mml: b(rep('r1', 15), 'o6 r4 g4 r2') },
      // The White House open (all eight dead): the same tune gone major and triumphant: the brass on it, the horns an
      // octave under, the strings and the choir holding the chords, a marching bass, the timpani on the roots, a snare
      // march with a crash at the top of each eight, the bell ringing in the downbeats
      wlead: { inst: 'brass', pan: 0.15, only: ['whitehouse'], mml: b(...MAP_TUNE_UP) },
      whorn: { inst: 'horn', vol: 0.75, pan: -0.15, only: ['whitehouse'], mml: b(...MAP_TUNE_UP.map(down)) },
      wstr: { inst: 'strings', vol: 0.55, pan: 0.3, only: ['whitehouse'], mml: MAP_ROOTS_UP.map(r => `o4 {${MAP_TRIAD[r]}}1`).join(' | ') },
      wchoir: { inst: 'choir', vol: 0.45, pan: -0.3, only: ['whitehouse'], mml: MAP_ROOTS_UP.map(r => `o4 {${MAP_TRIAD[r]}}1`).join(' | ') },
      wbass: { inst: 'bass', vol: 0.85, only: ['whitehouse'], mml: bass(2, 'R4 F4 R4 F8 R8', MAP_ROOTS_UP) },
      wtimp: { inst: 'timpani', vol: 0.75, only: ['whitehouse'], mml: MAP_ROOTS_UP.map((r, i) => { const n = r.split('/')[0]; return i === 15 ? `v12 o2 ${n}4 r4 v8 [${n}32]8 v12 [${n}32]8` : `v12 o2 ${n}4 r4 ${n}4 r4`; }).join(' | ') },
      wdrums: { inst: 'kick', drums: true, only: ['whitehouse'], mml: b(MAP_MARCH.replace('{kh}', '{kxh}'), MAP_MARCH, MAP_MARCH, MAP_MARCH, MAP_MARCH, MAP_MARCH, MAP_MARCH, MAP_MARCH_FILL, MAP_MARCH.replace('{kh}', '{kxh}'), MAP_MARCH, MAP_MARCH, MAP_MARCH, MAP_MARCH, MAP_MARCH, MAP_MARCH, MAP_MARCH_FILL) },
      wbell: { inst: 'bell', vol: 0.4, pan: 0.4, only: ['whitehouse'], mml: MAP_ROOTS_UP.map((r, i) => i % 4 === 0 ? `o6 ${r.split('/')[0]}4 r2.` : 'r1').join(' | ') },
    },
    arrangements: {
      main: {},
      set2: { vol: { lead: 0.6, keys: 0.6, hum: 0.8 } },
      whitehouse: { mute: ['lead', 'bass', 'keys', 'hum', 'drums', 'type', 'ding'] },
    },
  },

  // The deploy: the map swooping down on the target (three and a half seconds or so). The manhunt launching: power
  // chords and the brass hammering C three times, climbing to the E-flat and falling through the D-flat, the timpani
  // rolling up under it on the G, and everything coming down on C minor with the taiko and the crash.
  fanfare: {
    bpm: 146, once: true,
    parts: {
      lead: { inst: 'brass', mml: 'o4 l8 c c c e-4. d- c < g > c2 r8' },
      harm: { inst: 'horn', vol: 0.8, mml: 'o3 l8 g g g g4. f e- d e-2 r8' },
      low: { inst: 'power', vol: 0.8, mml: 'o2 l8 c c c c4. d- c < g > c2 r8' },
      timp: { inst: 'timpani', vol: 0.9, mml: 'o2 l16 v7 [g]6 v9 [g]6 v12 [g]6 v15 c4 r4.' },
      drums: { inst: 'kick', drums: true, mml: 'v13 {kxf}8 {kf}8 {kf}8 k16 k16 {kf}8 k16 k16 v9 [s32]4 v12 [s32]4 v15 [s32]4 {kxf}4 k16 k16 {kf}8 {kxf}8' },
      // Off to Washington (the White House): the same three hits, but on G, up to the C and on up the C major chord to
      // land on its G, the horns and the power chords under it in C major, the bell on the landing: the victory lap
      wlead: { inst: 'brass', only: ['whitehouse'], mml: 'o4 l8 g g g > c4. < g > c e g2 r8' },
      wharm: { inst: 'horn', vol: 0.8, only: ['whitehouse'], mml: 'o3 l8 e e e g4. e g > c e2 r8' },
      wlow: { inst: 'power', vol: 0.8, only: ['whitehouse'], mml: 'o2 l8 c c c c4. c e g c2 r8' },
      wbell: { inst: 'bell', vol: 0.6, only: ['whitehouse'], mml: 'r2 r4 r8 r16 o6 l16 c e g > c4 r8 r4' },
    },
    arrangements: {
      main: {},
      whitehouse: { mute: ['lead', 'harm', 'low'] },
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // Artie: Alaska, frozen and brutal. F-sharp minor at 144, the low strings chugging a riff with some weight to it, a
  // pulse-wave ostinato running cold sixteenths under everything, the tune up top; the second eight half time on the
  // taiko and the toms, the gale. Up the trail a cold saw lead over the riff and the kit; on the tram the horns over a
  // synth bass pulse and the ride, half time, hanging in the air; the high woods and the summit the whole mountain (brass
  // and horns on the tune together, the choir, the wind howling, the toms the whole way); hushed and hollow in the ice
  // cave (a glass harmonica on the tune, the wind moaning, a low drone, the taiko like a heartbeat and the ice cracking);
  // flat out down the ski run with the avalanche behind him (the guitar and the saw on the tune, the power chords
  // galloping in sixteenths, the bass pumping, double kick); and after it, the kit gone, to the door: taiko and toms,
  // the power chords hitting, the timpani, the choir and the low brass swelling, a snare roll up into the top again.
  artie: {
    bpm: 144,
    parts: {
      lead: { inst: 'saw', pan: 0.1, mml: b(...ARTIE_TUNE) },
      // (on the summit and down the ski run: the tune doubled)
      hook: { inst: 'saw', vol: 0.55, pan: 0.25, only: ['summit', 'ski'], mml: b(...ARTIE_TUNE) },
      riff: { inst: 'power', vol: 0.75, pan: -0.3, only: ['trail', 'summit'], mml: b(...ARTIE_RIFF) },
      gallop: { inst: 'power', vol: 0.6, pan: -0.3, only: ['ski'], mml: artieBars(2, 'R8 R16 R16 R8 R16 R16 R8 R16 R16 R8 R16 R16', 'R8 R16 R16 R8 R16 R16', ARTIE_ROOTS) },
      // (the door: the power chords on the downbeat, then hammering into the top)
      hits: { inst: 'power', vol: 0.7, pan: -0.3, only: ['door'], mml: b(artieBars(2, 'R2. r4', 'R2', ARTIE_ROOTS.slice(0, 12)), 'o2 g4 r4 g4 r4', 'o2 g4 g4 g4 g4', 'o2 l8 c+ c+ c+ c+ c+ c+ c+ c+', 'o2 l16 c+ c+ c+ c+ c+ c+ c+ c+ c+8 c+8 e+8 g+8') },
      bass: { inst: 'bass', vol: 0.8, only: ['trail', 'summit'], mml: b(artieBars(2, 'R8 R8 R8 R8 R8 R8 O8 R8', 'R8 R8 O8 R8', ARTIE_ROOTS.slice(0, 8)), artieBars(2, 'R4. R8 r8 R8 R4', '', ARTIE_ROOTS.slice(8))) },
      pump: { inst: 'bass', only: ['tram', 'ski'], mml: artieBars(2, 'R8 O8 R8 O8 R8 O8 R8 O8', 'R8 O8 R8 O8', ARTIE_ROOTS) },
      drone: { inst: 'synthbass', only: ['cave', 'door'], mml: artieBars(2, 'R1', 'R2', ARTIE_ROOTS) },
      ice: { inst: 'ice', vol: 0.7, pan: -0.35, not: ['door'], mml: artieIce(4) },
      pad: { inst: 'strings', vol: 0.55, pan: 0.3, only: ['tram', 'summit', 'door'], mml: artiePad(4) },
      low: { inst: 'swell', vol: 0.6, only: ['door'], mml: artiePad(3) },
      // (the wind: up and down with the chords, a gust every bar or two)
      wind: { inst: 'gale', vol: 0.8, pan: 0.15, only: ['tram', 'summit', 'cave'], mml: b('o4 a1^1', 'o4 g+1^1', 'o4 f+1^1', 'o4 a1', 'o5 c+1', 'o4 a1', 'o4 b1', 'o5 c+1^1', 'o5 d1^1', 'o5 c+1^1') },
      drums: { inst: 'kick', drums: true, only: ['trail'], mml: b(ARTIE_BEAT.replace('{kh}', '{kx}'), ARTIE_BEAT, ARTIE_BEAT, ARTIE_BEAT_FILL, ARTIE_BEAT, ARTIE_BEAT, ARTIE_BEAT, ARTIE_BEAT_FILL,
        ARTIE_GALE_X, ARTIE_GALE, ARTIE_GALE, ARTIE_GALE_FILL, ARTIE_GALE, ARTIE_GALE, ARTIE_GALE, ARTIE_GALE_FILL) },
      peak: { inst: 'kick', drums: true, only: ['summit'], mml: b(ARTIE_PEAK.replace('{kf}', '{kxf}'), ARTIE_PEAK, ARTIE_PEAK, ARTIE_GALE_FILL, ARTIE_PEAK, ARTIE_PEAK, ARTIE_PEAK, ARTIE_GALE_FILL,
        ARTIE_GALE_X, ARTIE_GALE, ARTIE_GALE_X, ARTIE_GALE_FILL, ARTIE_GALE_X, ARTIE_GALE, ARTIE_GALE_X, ARTIE_GALE_FILL) },
      glide: { inst: 'kick', drums: true, only: ['tram'], mml: rep(b(ARTIE_GLIDE, ARTIE_GLIDE, ARTIE_GLIDE, ARTIE_GLIDE_FILL), 4) },
      // (the cave: the taiko far off like a heartbeat, the ice cracking)
      hollow: { inst: 'kick', drums: true, only: ['cave'], mml: rep(b('v8 f4 r4 v7 a8 r8 r4', 'v8 f4 r8 v6 a16 a16 r4 v7 u8 u8', 'v8 f4 r4 r2', 'v8 f8 f8 r4 v7 a8 r8 t8 u8'), 4) },
      ski: { inst: 'kick', drums: true, only: ['ski'], mml: b(chase8(AVALANCHE, AVALANCHE_FILL), chase8(AVALANCHE.replace('{kh}', '{kfh}'), AVALANCHE_FILL)) },
      door: { inst: 'kick', drums: true, only: ['door'], mml: b('v12 {fx}4 u8 u8 {sf}4 u8 u8', rep('f4 u8 u8 {sf}4 u8 u8', 7), rep('f8 f8 u8 u8 {sf}8 f8 u8 t8', 4),
        '{sf}8 s16 s16 s8 s16 s16 {sf}8 s16 s16 s8 s16 s16', '{sf}8 s16 s16 s8 s16 s16 {sf}8 s16 s16 s8 s16 s16', 'v10 [s16]8 v12 [s16]8', 'v9 [s32]8 v11 [s32]8 v13 [s32]8 v15 [s32]8') },
      timp: { inst: 'timpani', vol: 0.8, only: ['door'], mml: b('v12 ' + artieBars(2, 'R4 r2.', 'R4 r4', ARTIE_ROOTS.slice(0, 14)), 'o2 c+4 r4 l16 c+ c+ c+ c+ c+ c+ c+ c+', 'o2 v8 [c+32]8 v10 [c+32]8 v12 [c+32]8 v15 [c+32]8') },
    },
    arrangements: {
      trail: {},
      // (the tram: hanging in the air, half time, the horns on the tune, a synth pulse and the ice up front)
      tram: { inst: { lead: 'horn', pump: 'synthbass' }, vol: { ice: 1.3, wind: 0.6, pad: 0.8, pump: 0.8 } },
      summit: { inst: { lead: 'brass', hook: 'horn', pad: 'choir' }, vol: { hook: 1.4, wind: 1.3, peak: 0.8 } },
      cave: { inst: { lead: 'glass' }, vol: { ice: 0.55, wind: 0.9, drone: 0.75 } },
      ski: { inst: { lead: 'guitar' }, vol: { ice: 0.8 } },
      // (the run's over, the cabin's under it: the kit gone, the horns on the tune, building the rest of the way to the door)
      door: { inst: { lead: 'horn', pad: 'choir' }, vol: { drone: 0.8 } },
    },
  },

  // Victor: tribal drums and marimba on the cliffs; a club track at Club Caldera; big and dark inside the volcano; the party in the lounge.
  victor: {
    bpm: 118,
    parts: {
      lead: { inst: 'marimba', mml: b('o5 l8 d4 f g a4 g f', 'o5 g4 f d c2', 'o5 d4 f g a4 > c d', 'o5 a2. r4', 'o5 b4 a g f4 g4', 'o5 a4 g f e4 d4', 'o5 c4 d e f4 e4', 'o5 d1') },
      bass: { inst: 'synthbass', mml: bass(2, 'R8. R16 r8 R8 O8 R8 r8 R8', ['d', 'c', 'd', 'a', 'g', 'a', 'c', 'd']) },
      congas: { inst: 'kick', drums: true, not: ['club', 'lounge', 'dance'], mml: rep('c8 c16 c16 d8 c8 r8 c8 d8 d8', 8) },
      toms: { inst: 'kick', drums: true, only: ['cliffs', 'inside', 'inside-near', 'inside-nearer'], mml: rep('u8 r8 u8 t8 u4 u8 t8', 8) },
      club: { inst: 'kick', drums: true, only: ['club', 'lounge', 'dance'], mml: rep(FOUR, 8) },
      stabs: { inst: 'epiano', vol: 0.7, pan: -0.3, only: ['club', 'lounge', 'dance'], mml: skank(4, ['dfa', 'ceg', 'dfa', 'ace', 'gb>d', 'ace', 'ceg', 'dfa']) },
      pad: { inst: 'choir', vol: 0.6, pan: 0.3, only: ['inside', 'inside-near', 'inside-nearer'], mml: pad(4, ['dfa', 'ceg', 'dfa', 'ace', 'gb>d', 'ace', 'ceg', 'dfa']) },
      // The club's sound system: a kick on every beat and a sub bass pumping on the offbeats, booming. On the floor it's
      // right there; up the shaft it's the club through the rock, a block away (just the boom, quiet, louder as he climbs)
      thump: { inst: 'kick', drums: true, only: ['dance', 'inside-near', 'inside-nearer'], mml: rep('k4 k4 k4 k4', 8) },
      sub: { inst: 'synthbass', only: ['dance', 'inside-near', 'inside-nearer'], mml: bass(1, 'r8 R8 r8 R8 r8 R8 r8 R8', ['d', 'c', 'd', 'a', 'g', 'a', 'c', 'd']) },
    },
    arrangements: {
      cliffs: {},
      club: { inst: { lead: 'sax' } },
      inside: { inst: { lead: 'brass' } },
      // (up the shaft, getting near the club: its boom coming through the rock)
      'inside-near': { inst: { lead: 'brass' }, vol: { thump: 0.3, sub: 0.35 } },
      'inside-nearer': { inst: { lead: 'brass' }, vol: { thump: 0.55, sub: 0.6 } },
      // (on Club Caldera's floor and up its atrium: the sound system, loud, the sax and the stabs riding over the boom)
      dance: { inst: { lead: 'sax' }, vol: { thump: 1.35, sub: 1.3, lead: 0.8 } },
      lounge: { inst: { lead: 'trumpet' } },
    },
  },

  // Ernie: San Francisco funk (slap bass, clav, a horn section); the bridge coming down; surf guitar on the pier; the
  // jet ski run across the bay as a surf chase (the toms running, the slap pumping, the horns stabbing); organ on the
  // tour; then the island with the quakes back on: the funk and the timpani in the cell house, the horns out in the
  // yard and down the cliffs, dark and low in the citadel's vaults on the way down to the door.
  ernie: {
    bpm: 112,
    parts: {
      lead: { inst: 'brass', pan: 0.2, mml: b('o5 l8 e r e g a4 b4', 'o6 d4 < b a g4 e4', 'o5 e r e g a4 b4', 'o6 d e d < b a2', 'o5 g4 a b > c+4 < b4', 'o5 a4 g e g2', 'o5 f+4 g a b4 a4', 'o5 e2. r4') },
      bass: { inst: 'slap', not: ['jetski'], mml: bass(2, 'R8 r16 R16 O8 R8 r16 R16 F8 R8 O8', ['e/b', 'a/e', 'e/b', 'a/e', 'c/g', 'a/e', 'd/a', 'e/b']) },
      pump: { inst: 'slap', only: ['jetski'], mml: bass(2, 'R16 R16 O8 R16 R16 O8 R16 R16 O8 R16 R16 O8', ERNIE_ROOTS) },
      clav: { inst: 'clav', vol: 0.8, pan: -0.35, not: ['cell', 'vaults'], mml: stabs(4, ['egbd', 'ac+eg', 'egbd', 'ac+eg', 'cegb', 'aceg', 'df+ac', 'egbd']) },
      horns: { inst: 'brass', vol: 0.6, pan: 0.3, only: ['jetski', 'yard'], mml: ['egb', 'ac+e', 'egb', 'ac+e', 'ceg', 'ace', 'df+a', 'egb'].map(c => `o4 {${c}}8 r8 r4 r8 {${c}}8 {${c}}8 r8`).join(' | ') },
      drums: { inst: 'kick', drums: true, not: ['bridge', 'bay', 'jetski'], mml: rep(FUNK, 8) },
      bridge: { inst: 'kick', drums: true, only: ['bridge'], mml: b(DRIVE, DRIVE, DRIVE, ROCK_FILL, DRIVE, DRIVE, DRIVE, ROCK_FILL) },
      timp: { inst: 'timpani', only: ['bridge', 'island', 'yard', 'vaults'], mml: rep('o2 e4 r4 e8 e8 r4', 8) },
      surf: { inst: 'kick', drums: true, only: ['bay'], mml: rep('{kh}8 h8 {sh}8 {kh}8 r8 k8 {sh}8 h8', 8) },
      wipe: { inst: 'kick', drums: true, only: ['jetski'], mml: chase8(WIPE, WIPE_FILL) },
      pad: { inst: 'strings', vol: 0.6, only: ['bridge', 'cell', 'island', 'vaults'], mml: pad(4, ['egb', 'ac+e', 'egb', 'ac+e', 'ceg', 'ace', 'df+a', 'egb']) },
    },
    arrangements: {
      streets: {},
      bridge: { inst: { lead: 'trumpet' } },
      bay: { inst: { lead: 'guitar', clav: 'nylon' } },
      jetski: { inst: { lead: 'guitar' }, vol: { clav: 0.7 } },
      cell: { inst: { lead: 'organ', bass: 'bass' }, vol: { drums: 0.6 } },
      // (the tour's over and the quakes are back: the funk, the timpani rumbling under it, still the organ indoors)
      island: { inst: { lead: 'organ' }, vol: { pad: 0.5 } },
      yard: { inst: { lead: 'trumpet' } },
      vaults: { inst: { lead: 'organ', bass: 'bass' }, vol: { lead: 0.8, drums: 0.5, timp: 0.8 } },
    },
  },

  // Hector: Miami, and a TV weatherman calling up a hurricane. A TV cop show's chase theme turned up to eleven: G minor
  // at 150, a synth bass pulsing, gated drums, a screaming lead on the six o'clock news sting, and the whole band
  // hitting the sting together at the end of each eight. On the sand it's sunny (Dorian): the lead synth, the bass
  // pulsing eighths, the weather desk's FM keys ticking the chords like the radar, a pad, an eighties rock beat. As the
  // wind gets up it goes plain minor and the lead goes to a cranked guitar, the bass in sixteenths, power chords
  // stabbing, the hats running, the brass on the sting, the wind. Then the storm proper, Phrygian: the guitar with the
  // synth an octave under it, palm-muted down-tuned chugs and a fuzz bass on the same riff, the drop chords ringing,
  // the orchestra on the sting, the kick doubling, the timpani, the siren. The stolen boat with the Coast Guard after
  // it the most of all, twice as busy (the chugs and the fuzz in straight sixteenths, the double kick running, the
  // snare on every offbeat). Up the storm tower huge and slow: half time on the taiko, the horns on the hook, the choir
  // and the low brass, the drop chords ringing, the gale howling. The flooded daycare eerie: the hook on a music box, a
  // glass pad, a clock ticking and a heartbeat.
  hector: {
    bpm: 150,
    parts: {
      // (the tune: the synth on the sand, the guitar from the wind on; in the storm and on the boat the synth an octave under it)
      sun: { inst: 'hammer', vol: 1.2, pan: 0.1, only: ['beach'], mml: b(...HECTOR_TUNE) },
      wind: { inst: 'guitar', vol: 1.15, pan: 0.1, only: ['gust'], mml: b(...HECTOR_GUST) },
      dark: { inst: 'guitar', vol: 1.1, pan: 0.1, not: ['beach', 'gust'], mml: b(...HECTOR_DARK) },
      under: { inst: 'hammer', vol: 0.55, pan: -0.1, only: ['storm', 'boat'], mml: down(b(...HECTOR_DARK)) },
      // (the bass: pulsing eighths, then sixteenths, then the fuzz on the riff; the boat straight sixteenths)
      pulse: { inst: 'synthbass', vol: 0.72, only: ['beach'], mml: hecBars(2, 'R8 R8 O8 R8 R8 R8 O8 R8', HECTOR_SUN_ROOTS) },
      run: { inst: 'synthbass', vol: 0.72, only: ['gust'], mml: hecBars(2, 'q5 l16 R R R R O R R R R R R R O R F R', HECTOR_SUN_ROOTS) },
      grind: { inst: 'grit', vol: 0.6, only: ['storm'], mml: hecBars(2, 'q5 l16 R R R R R8 R R R R R8 l8 F O', HECTOR_ROOTS) },
      rush: { inst: 'grit', vol: 0.7, only: ['boat'], mml: hecBars(2, 'q5 l16 R R O R R R O R R R O R R F O F', HECTOR_ROOTS) },
      low: { inst: 'synthbass', vol: 0.8, only: ['tower', 'daycare'], mml: bass(2, 'R1', HECTOR_ROOTS) },
      // (the guitars: power chords stabbing in the wind; down-tuned in the storm, chugged and ringing)
      stab: { inst: 'power', vol: 0.65, pan: -0.3, only: ['gust'], mml: hecBars(2, 'R4. R8 r8 R8 R4', HECTOR_SUN_ROOTS) },
      chug: { inst: 'chug', vol: 1.1, pan: -0.3, only: ['storm'], mml: hecBars(2, 'q4 l16 R R R R R8 R R R R R8 R8 R8', HECTOR_ROOTS) },
      saw: { inst: 'chug', vol: 1.0, pan: -0.3, only: ['boat'], mml: hecBars(2, 'q4 l16 R R R R R R R R R R R R R R R R', HECTOR_ROOTS) },
      ring: { inst: 'drop', vol: 0.75, pan: 0.3, only: ['storm', 'boat', 'tower'], mml: hecBars(2, 'R2. r8 R8', HECTOR_ROOTS) },
      // (the weather desk: the FM keys ticking the chords, a pad under them)
      tick: { inst: 'dx', vol: 0.8, pan: -0.35, only: ['beach'], mml: hecTick(4, HECTOR_SUN_CHORDS) },
      tock: { inst: 'dx', vol: 0.65, pan: -0.35, only: ['gust'], mml: hecTick(4, HECTOR_GUST_CHORDS) },
      pad: { inst: 'pad', vol: 0.45, pan: 0.3, only: ['beach'], mml: pad(4, HECTOR_SUN_CHORDS) },
      mpad: { inst: 'pad', vol: 0.45, pan: 0.3, only: ['gust'], mml: pad(4, HECTOR_GUST_CHORDS) },
      // (the sting: the brass and the orchestra hit, with the band)
      brass: { inst: 'brass', vol: 0.6, pan: 0.3, only: ['gust', 'storm', 'boat', 'tower'], mml: HECTOR_ROOTS.map((_, i) => i === 7 || i === 15 ? 'o4 l8 {df+a} {df+a} r {df+a} r2' : 'r1').join(' | ') },
      hits: { inst: 'hit', vol: 0.75, only: ['storm', 'boat', 'tower'], mml: HECTOR_STING },
      // (the wind howling up and down with the chords; the siren wailing through the middle of each eight)
      gale: { inst: 'gale', vol: 0.7, pan: 0.15, not: ['beach'], mml: HECTOR_ROOTS.map((_, i) => `o4 ${hecRoot(i)}1`).join(' | ') },
      siren: { inst: 'tornado', vol: 0.55, pan: -0.2, only: ['storm', 'boat', 'tower'], mml: rep('r1^1^1^1 o5 e1^1^1 r1', 2) },
      timp: { inst: 'timpani', vol: 0.75, only: ['storm'], mml: HECTOR_ROOTS.map((_, i) => i === 7 || i === 15 ? 'v12 o2 l8 d d r d r2' : i % 4 === 0 ? `v12 o2 ${hecRoot(i)}4 r2.` : 'r1').join(' | ') },
      boom: { inst: 'timpani', vol: 0.8, only: ['tower'], mml: HECTOR_ROOTS.map((_, i) => i === 7 || i === 15 ? 'v12 o2 l8 d d r d r4 v9 [d32]8' : `v12 o2 ${hecRoot(i)}4 r4 ${hecRoot(i)}4 r4`).join(' | ') },
      choir: { inst: 'choir', vol: 0.55, pan: -0.25, only: ['tower'], mml: pad(4, HECTOR_CHORDS) },
      swell: { inst: 'swell', vol: 0.45, only: ['tower'], mml: pad(3, HECTOR_CHORDS) },
      // (the daycare: a glass pad, water dripping)
      glass: { inst: 'glass', vol: 0.5, pan: 0.3, only: ['daycare'], mml: pad(4, HECTOR_CHORDS) },
      drip: { inst: 'tink', vol: 0.45, pan: 0.4, only: ['daycare'], mml: rep(b('o6 r2 g16 r8. r4', 'r1', 'o6 r4. d16 r16 r2', 'o6 r2. b-16 r8.'), 4) },
      sand: { inst: 'kick', drums: true, vol: 0.9, only: ['beach'], mml: hecKit(HEC_BEACH, HEC_BEACH_FILL) },
      gusts: { inst: 'kick', drums: true, vol: 0.9, only: ['gust'], mml: hecKit(HEC_WIND, HEC_WIND_FILL) },
      pound: { inst: 'kick', drums: true, vol: 0.62, only: ['storm'], mml: hecKit(HEC_STORM, HEC_STORM_FILL) },
      squall: { inst: 'kick', drums: true, vol: 0.82, only: ['boat'], mml: hecKit(HEC_BOAT, HEC_BOAT_FILL) },
      eye: { inst: 'kick', drums: true, vol: 0.85, only: ['tower'], mml: hecKit(HEC_TOWER, HEC_TOWER_FILL) },
      clock: { inst: 'kick', drums: true, only: ['daycare'], mml: rep(b('v9 {fm}8 v7 f8 v5 m4 m4 m4', 'v5 m4 m4 m4 m4'), 8) },
    },
    arrangements: {
      // (the beach, sunny)
      beach: {},
      // (the storm coming in: the wind; and the storm proper)
      gust: {},
      storm: { vol: { gale: 1.2, siren: 1.2 } },
      // (the stolen boat, the Coast Guard after it)
      boat: { vol: { gale: 1.0, siren: 0.8 } },
      // (up the storm tower, the eye, the waterspout)
      tower: { inst: { dark: 'horn' }, vol: { gale: 1.3, siren: 0.6, low: 0.8 } },
      // (the hook on a music box)
      daycare: { inst: { dark: 'bell' }, vol: { dark: 1.6, gale: 0.7, low: 0.9 } },
    },
  },

  // Tommy: Flint. A slow, heavy boom-bap on the corner; on the bike (and surfing the wave down the street) the same
  // tempo with a drum and bass two-step under it, so it runs at twice the speed: the guitar on the tune, organ stabs,
  // the bass rolling in eighths; hollow and dripping in the sewer; and the sewer coming down round him, the two-step
  // under the sewer's own pad and the organ.
  tommy: {
    bpm: 92,
    parts: {
      lead: { inst: 'organ', mml: b('o5 l8 c4 e- f g4 f e-', 'o5 c2 r4 < b- > c', 'o5 e- f g b- a-4 g4', 'o5 f2. r4', 'o5 c4 e- f g4 b-4', 'o5 a-4 g f e-4 d4', 'o5 c4 e- d c4 < b-4', 'o5 c1') },
      keys: { inst: 'epiano', vol: 0.7, pan: -0.3, not: ['sewer', 'escape'], mml: pad(4, ['ce-gb-', 'ce-gb-', 'e-gb-', 'fa-c', 'ce-g', 'fa-c', 'a-ce-', 'ce-g'], '2 r2') },
      bass: { inst: 'bass', not: ['road', 'escape'], mml: bass(1, 'R4. R8 r8 O8 R4', TOMMY_ROOTS) },
      pump: { inst: 'bass', only: ['road', 'escape'], mml: bass(2, 'R8 R8 O8 R8 r8 R8 O8 R8', TOMMY_ROOTS) },
      drums: { inst: 'kick', drums: true, not: ['sewer', 'road', 'escape'], mml: rep(BOOM, 8) },
      road: { inst: 'kick', drums: true, only: ['road', 'escape'], mml: chase8(DNB, DNB_FILL) },
      scratch: { inst: 'kick', drums: true, only: ['hood', 'road', 'ruins'], mml: rep('r1 | r1 | r1 | r2 r4 g8 g8', 2) },
      drip: { inst: 'kick', drums: true, only: ['sewer'], mml: rep('m8 r8 r4 r8 m8 r4', 8) },
      pad: { inst: 'pad', vol: 0.8, only: ['sewer', 'escape'], mml: pad(3, ['ce-g', 'ce-g', 'e-gb-', 'fa-c', 'ce-g', 'fa-c', 'a-ce-', 'ce-g']) },
    },
    arrangements: {
      hood: {},
      road: { inst: { lead: 'guitar', keys: 'organ' }, vol: { keys: 0.55 } },
      sewer: { inst: { lead: 'bell' }, vol: { lead: 0.7 } },
      escape: { vol: { road: 0.85 } },
      ruins: { inst: { lead: 'brass' } },
    },
  },

  // Barry: New York noir, the late-70s kind (Taxi Driver: Herrmann's sax at three in the morning, the steam coming up out
  // of the street). Sixteen bars: the tune on a lonely alto sax over a walking upright, Rhodes on minor ninths, brushes and
  // the ride, a muted trumpet answering; then eight bars of dread on an F pedal (low brass swelling, the timpani like a
  // heartbeat, the snare tapping and then rolling up into the top again, the harp running down) with the sax up high and
  // wailing over it. Elevator music in the office tower (vibes, a bossa on the rim) with the dread creeping in under it in
  // R&D; the roofs with a muted trumpet on the tune over the sax and the horn section stabbing (and for the ride down on
  // Barry's man); the fire escape with the strings trembling in under it; the power room the dread turned up, an open
  // trumpet and an organ.
  barry: {
    bpm: 108,
    parts: {
      lead: { inst: 'sax', pan: 0.1, mml: b(...BARRY_TUNE, ...BARRY_HIGH) },
      // (up on the roofs: a muted trumpet on the tune an octave over the sax, the two together up top for the wail)
      hi: { inst: 'mute', vol: 0.85, pan: 0.2, only: ['roofs', 'climb'], mml: b(...BARRY_TUNE.map(up), ...BARRY_HIGH) },
      walk: { inst: 'bass', mml: b('o2 l4 f a- > c d', 'o3 l4 d- < a- f g-', 'o2 l4 f a- b- b', 'o3 l4 c < g e d', 'o2 l4 d- e- f a-', 'o2 l4 g b- > c < b', 'o2 l4 b- a- g e', 'o2 l4 f c e- e',
        'o2 f1', 'o2 f1', 'o2 f1', 'o2 f2. e-4', 'o2 l4 d- f a- a', 'o2 l4 b- f d- a-', 'o2 l4 g f e- d-', 'o2 l4 c e g g-') },
      // (the Rhodes: rootless minor ninths, laid back behind the beat; held and dark through the dread)
      keys: { inst: 'epiano', vol: 0.7, pan: -0.3, mml: b(...BARRY_CHORDS.slice(0, 8).map(([x, y]) => `o3 {${x}}2 r8 {${y ?? x}}4.`), ...BARRY_CHORDS.slice(8).map(([x, y]) => y ? `o3 {${x}}2 {${y}}2` : `o3 {${x}}1`)) },
      drums: { inst: 'kick', drums: true, not: ['tower', 'lab'], mml: b(BARRY_JAZZ.replace('{ki}', '{kx}'), BARRY_JAZZ, BARRY_JAZZ, BARRY_JAZZ, BARRY_JAZZ, BARRY_JAZZ, BARRY_JAZZ, 'v11 {ki}4 {hin}8 i8 {ki}4 n16 n16 t16 u16',
        'v9 r4 h4 r4 h4', 'v9 r4 h4 r4 h4', 'v9 r4 h4 r4 h4', 'v9 r4 h4 r4 h4', 'v9 i4 {hi}4 i4 {hi}4', 'v9 i4 {hi}4 i4 {hi}4', 'v9 i4 {hi}4 i4 {hi}4', 'v9 i4 {hi}4 i4 {hi}4') },
      bossa: { inst: 'kick', drums: true, only: ['tower', 'lab'], mml: rep('{km}8 z8 z8 {kmz}8 z8 {km}8 z8 {mz}8', 16) },
      // (Herrmann's snare: a tap like a march a long way off, then rolling up louder into the top of the tune)
      roll: { inst: 'kick', drums: true, not: ['tower'], mml: b(rep('r1', 8), 'v8 s8. s16 s4 r2', 'r1', 'v8 s8. s16 s4 r2', 'r1', 'r1', 'v5 [s32]16 v6 [s32]16', 'v7 [s32]16 v9 [s32]16', 'v10 [s32]16 v13 [s32]8 v15 s8 r8') },
      // (the muted trumpets: a little "wah" in the gaps the sax leaves; stingers in the dread)
      stab: { inst: 'mute', vol: 0.6, pan: 0.35, not: ['tower', 'lab'], mml: b('r1', 'o4 r2 r8 {fa->c}8 r8 {fa->c}8', 'r1', 'o4 r4 r8 {b->d-e}8 r8 {b->d-e}8 r4', 'r1', 'o4 r2 r8 {b->d-e}8 r4', 'r1', 'o4 r2 {a->ce}4 r4',
        'r1', 'o4 {b->d-f}8 r4. r2', 'r1', 'o4 {b->d-g-}8 r4. r2', 'r1', 'r1', 'o4 r2 {b->d-f}8 r8 {b->d-f}8 r8', 'o4 {b->d-e}8 r8 {b->d-e}8 r8 r2') },
      // (the dread: low brass swelling up on the F, the G-flat grinding against it a half step up)
      low: { inst: 'swell', vol: 0.7, not: ['tower'], mml: b(rep('r1', 8), 'o2 {f>c}1', 'o2 {g->d-}1', 'o2 {f>c}1', 'o2 {g->d-}1', 'o2 {d-a-}1', 'o2 {b->f}1', 'o2 {g>d-}1', 'o2 {cb->e}1') },
      timp: { inst: 'timpani', vol: 0.8, pan: -0.1, not: ['tower'], mml: b(rep('r1', 8), 'v12 o2 f8. f16 r2.', 'o2 f8. f16 r2.', 'o2 f8. f16 r2.', 'o2 f8. f16 r2.', 'o2 d-8. d-16 r2.', 'o2 b-8. b-16 r2.', 'o2 g8. g16 r2.', 'o2 v10 c4 r4 v8 [c32]8 v13 [c32]8') },
      // (the night shimmering: the harp running up into the dread, and back down off the G-flat)
      harp: { inst: 'harp', vol: 0.55, pan: -0.4, mml: b('r1', 'r1', 'r1', 'o4 r2 l16 c e g b- > c e g b-', 'r1', 'r1', 'r1', 'o4 r2 l32 c d- e f g a- b- > c d- e f g a- b- > c d-',
        'r1', 'r1', 'r1', 'o6 r2 l32 f e- d- c < b- a- g- f e- d- c < b- a- g- f e-', 'r1', 'r1', 'r1', 'r1') },
      // (the strings trembling on the chords' guide tones)
      str: { inst: 'strings', vol: 0.6, pan: 0.25, only: ['lab', 'climb', 'power'], mml: b(...BARRY_TREM.map(([x, y]) => y ? `o3 l16 [{${x}}]8 [{${y}}]8` : `o3 l16 [{${x}}]16`)) },
    },
    arrangements: {
      streets: {},
      // (the office tower: elevator music, vibes on the tune and a bossa on the rim, the dread kept out of it)
      tower: { inst: { lead: 'vibes' }, vol: { keys: 0.6, walk: 0.8 } },
      // (R&D: the elevator music, the dread creeping back in under it and the strings sawing away quietly: something's not right in here)
      lab: { inst: { lead: 'vibes' }, vol: { keys: 0.6, walk: 0.8, str: 0.45, low: 0.55, timp: 0.6, roll: 0.5 } },
      roofs: { inst: { stab: 'brass' }, vol: { lead: 0.7, stab: 0.85 } },
      // (up the fire escape: the strings trembling in under the horns, nearer the top)
      climb: { inst: { stab: 'brass' }, vol: { lead: 0.7, stab: 0.85, str: 0.6 } },
      // (the power room: the dread turned up, an open trumpet on the tune, an organ humming the chords)
      power: { inst: { lead: 'trumpet', keys: 'organ' }, vol: { keys: 0.5, low: 1.25, timp: 1.15, roll: 1.1 } },
    },
  },

  // Oscar: Houston, oil money and outlaw bikers. Dark outlaw country-rock in C-sharp minor at 126, down-tuned: a slide
  // guitar on the tune over a baritone guitar's riff (the bass in unison with it), a boot-stomp kit and a harmonica
  // wailing in the gaps; the second eight half time, on the toms. Lunch in the break room is the radio: a pedal steel on
  // the tune, a nylon-string strumming a lazy two-feel, the rim. On Dirty Dan's chopper it's heavy metal (southern, the
  // Pantera end of it): palm-muted sixteenths on the low string, down-tuned power chords stabbing in the gaps, double kick
  // and then thrashing, two lead guitars screaming the tune in octaves. The field on fire: half time and doom, the
  // power chords ringing, the taiko, a choir down low, the harmonica on the tune alone. The bar: the band in the corner,
  // a fiddle on the tune, a honky-tonk upright on it an octave up and on the offbeats, a two-step.
  oscar: {
    bpm: 126,
    parts: {
      lead: { inst: 'slide', pan: 0.1, mml: b(...OSCAR_TUNE) },
      // (on the chopper and in the bar: the tune an octave up)
      hi: { inst: 'guitar', pan: 0.2, only: ['chase', 'end'], mml: up(b(...OSCAR_TUNE)) },
      riff: { inst: 'bari', vol: 0.8, pan: -0.3, only: ['field'], mml: b(...OSCAR_RIFF) },
      bass: { inst: 'bass', vol: 0.85, only: ['field'], mml: b(...OSCAR_RIFF) },
      // (the harmonica answering: a lick into the second phrase and into the last one, and holding chords under the high eight)
      wail: { inst: 'harmonica', vol: 0.85, pan: 0.3, only: ['field'], mml: b('r1', 'r1', 'r1', 'o5 r2. l16 c+ < b g+ e', 'r1', 'r1', 'r1', 'r1',
        'v9 o4 {f+a}1', 'o4 {f+a}1', 'o4 {eg+}1', 'o4 {eg+}2. v12 o5 l16 e d+ c+ < b', 'v9 o4 {c+e}1', 'o4 {c+e}1', 'o4 {df+}1', 'o4 {cd+}2. r4') },
      strum: { inst: 'nylon', vol: 1.1, pan: -0.3, only: ['break'], mml: OSCAR_CHORDS.map(c => `o3 r4 {${c}}8 {${c}}8 r4 {${c}}4`).join(' | ') },
      two: { inst: 'bass', vol: 1.1, only: ['break'], mml: bass(2, 'R4 r4 F4 r4', OSCAR_BASS) },
      band: { inst: 'bass', vol: 1.15, only: ['end'], mml: bass(2, 'R4 F4 R4 F4', OSCAR_BASS) },
      keys: { inst: 'honky', vol: 0.8, pan: -0.3, only: ['end'], mml: stabs(4, OSCAR_CHORDS) },
      chug: { inst: 'chug', vol: 1.35, pan: -0.3, only: ['chase'], mml: OSCAR_CHUG },
      crunch: { inst: 'drop', vol: 1.15, pan: 0.3, only: ['chase'], mml: OSCAR_CRUNCH },
      pump: { inst: 'bass', vol: 0.8, only: ['chase'], mml: bass(2, 'R8 R8 R8 R8 R8 R8 R8 R8', OSCAR_ROOTS) },
      doom: { inst: 'drop', vol: 0.9, only: ['burn'], mml: b(...OSCAR_ROOTS.slice(0, 8).map(r => `o2 ${r}2. r8 ${r}8`), ...OSCAR_ROOTS.slice(8).map(r => `o2 ${r}4. ${r}8 r4 ${r}4`)) },
      low: { inst: 'bass', only: ['burn'], mml: bass(2, 'R1', OSCAR_ROOTS) },
      choir: { inst: 'choir', vol: 0.5, pan: -0.2, only: ['burn'], mml: pad(3, OSCAR_CHORDS) },
      stomp: { inst: 'kick', drums: true, only: ['field'], mml: b(OSCAR_STOMP.replace('{kh}', '{kxh}'), OSCAR_STOMP, OSCAR_STOMP, OSCAR_STOMP_FILL, OSCAR_STOMP, OSCAR_STOMP, OSCAR_STOMP, OSCAR_STOMP_FILL,
        OSCAR_TOMS.replace('{ku}', '{kxu}'), OSCAR_TOMS, OSCAR_TOMS, OSCAR_TOMS_FILL, OSCAR_TOMS, OSCAR_TOMS, OSCAR_TOMS, OSCAR_STOMP_FILL) },
      lazy: { inst: 'kick', drums: true, only: ['break'], mml: rep(b(OSCAR_LAZY, OSCAR_LAZY, OSCAR_LAZY, OSCAR_LAZY_FILL), 4) },
      metal: { inst: 'kick', drums: true, vol: 0.8, only: ['chase'], mml: b(OSCAR_METAL.replace('{kh}', '{kxh}'), OSCAR_METAL, OSCAR_METAL, OSCAR_METAL_FILL, OSCAR_METAL, OSCAR_METAL, OSCAR_METAL, OSCAR_METAL_FILL,
        OSCAR_THRASH.replace('{ko}', '{kx}'), OSCAR_THRASH, OSCAR_THRASH, OSCAR_THRASH_FILL, OSCAR_THRASH.replace('{ko}', '{kx}'), OSCAR_THRASH, OSCAR_THRASH, OSCAR_THRASH_FILL) },
      doomkit: { inst: 'kick', drums: true, only: ['burn'], mml: b(OSCAR_DOOM.replace('{kf}', '{kxf}'), rep(OSCAR_DOOM, 6), OSCAR_DOOM_FILL, OSCAR_DOOM.replace('{kf}', '{kxf}'), rep(OSCAR_DOOM, 6), OSCAR_DOOM_FILL) },
      twostep: { inst: 'kick', drums: true, only: ['end'], mml: rep(b(OSCAR_TWOSTEP.replace('{kh}', '{kxh}'), OSCAR_TWOSTEP, OSCAR_TWOSTEP, OSCAR_TWOSTEP_FILL), 4) },
    },
    arrangements: {
      field: {},
      // (lunch: the radio on, a pedal steel on the tune)
      break: { inst: { lead: 'pedal' }, vol: { lead: 1.2 } },
      // (the chopper: two guitars on the tune in octaves)
      chase: { inst: { lead: 'guitar' }, vol: { lead: 0.5 } },
      // (the field on fire: the harmonica on its own over the doom)
      burn: { inst: { lead: 'harmonica' } },
      // (the bar band: the fiddle, the honky-tonk upright an octave up)
      end: { inst: { lead: 'fiddle', hi: 'honky' }, vol: { lead: 1.1, hi: 1.4 } },
    },
  },

  // Dale: Albuquerque, a meth dealer in the desert, and the cartel he cooks for. Surf guitar gone bad: Dick Dale's
  // (Drug Trade Dale's) tremolo picking in the Phrygian dominant, which is the narcocorrido's scale too; Walt's SAY MY
  // NAME as three dead stops for the whole band, and YOU'RE GOD-DAMN RIGHT answering it; Saul's strip-mall grin in town,
  // where the cartel's band plays. A Phrygian dominant at 126, strutting. Out in the desert the surf guitar singing
  // the hook through a dark spring tank (the long notes re-picked in eighths), Dale's baritone strutting under it with
  // the bass, power chords ringing back in the haze, surf drums with a tom to end the bar, a rattlesnake answering the
  // stops; the warehouse is the cook, cold (the tune on a synth, the strut palm-muted, a synth bass in eighths, the
  // crystals glittering up high, a machine of a kit); the convoy flat out (the overdriven lead tremolo-picking in
  // sixteenths, the palm-muted gallop, the bass and the kit in sixteenths); the last truck a duel (the trumpet's call,
  // no quarter, over the baritone ringing, power chords, the timpani and the taiko, the snake); Deadwood Gulch the
  // cartel's band, a narcocorrido (the
  // accordion on the tune, a trumpet a third under, the oom-pah bass, the baritone strumming the offbeats, a polka);
  // and Riggs's cab coming up the street the same with the rig in (power chords, the palm-muted gallop, the bass in
  // sixteenths, the polka twice as busy).
  dale: {
    bpm: 126,
    parts: {
      // (the surf guitar: the long notes re-picked in eighths, the rest left to sing; on the convoy the overdriven lead
      // tremolo-picking all of it in sixteenths)
      lead: { inst: 'surf', vol: 2, pan: 0.15, only: ['desert'], mml: b(...daleTrem(8, 1.5)) },
      shred: { inst: 'guitar', vol: 0.88, pan: 0.15, only: ['highway'], mml: b(...daleTrem(16)) },
      // (the tune played straight: the cold synth in the cook, the trumpet's call on the last truck, the accordion in town)
      tune: { inst: 'saw', pan: 0.1, only: ['warehouse', 'standoff', 'town', 'cab'], mml: b(...DALE_TUNE) },
      harm: { inst: 'trumpet', vol: 0.55, pan: -0.2, only: ['town', 'cab'], mml: b(...DALE_THIRDS) },
      // (the strut: Dale's baritone through its spring tank, the bass in unison; palm-muted in the cook; on the chases
      // the full gallop, palm-muted)
      riff: { inst: 'twang', vol: 0.6, pan: -0.25, only: ['desert'], mml: b(...DALE_STRUT) },
      bass: { inst: 'bass', vol: 0.9, only: ['desert'], mml: b(...DALE_STRUT) },
      palm: { inst: 'chug', vol: 0.95, pan: -0.3, only: ['warehouse'], mml: b(...DALE_STRUT) },
      chug: { inst: 'chug', vol: 0.95, pan: -0.3, only: ['highway', 'cab'], mml: b(...DALE_RIFF) },
      power: { inst: 'drop', vol: 0.7, pan: 0.3, only: ['desert', 'highway', 'cab'], mml: daleBars(2, 'R2. r8 R8') },
      pulse: { inst: 'synthbass', vol: 0.8, only: ['warehouse'], mml: daleBars(2, 'q5 l8 R R O R R R O R') },
      pump: { inst: 'bass', vol: 0.85, only: ['highway', 'cab'], mml: daleBars(2, 'q6 l16 R R O R R R O R R R O R R F O R') },
      crystal: { inst: 'ice', vol: 1.1, pan: 0.35, only: ['warehouse'], mml: DALE_CRYSTAL },
      // (the duel: the baritone and the bass ringing, the drop chord under them)
      ring: { inst: 'twang', vol: 0.65, pan: -0.25, only: ['standoff'], mml: daleBars(2, 'R4. R8 r8 R8 F4') },
      low: { inst: 'bass', only: ['standoff'], mml: daleBars(2, 'R4. R8 r8 R8 F4') },
      doom: { inst: 'drop', vol: 0.65, pan: 0.3, only: ['standoff'], mml: daleBars(2, 'R1') },
      timp: { inst: 'timpani', vol: 0.8, only: ['standoff'], mml: daleBars(2, 'R4 r2.') },
      // (the cartel's band: oom-pah, the baritone guitar strumming the offbeats like a bajo sexto)
      oompah: { inst: 'bass', vol: 1.1, only: ['town'], mml: daleBars(2, 'R4 F4 R4 F4') },
      bajo: { inst: 'bari', vol: 0.5, pan: -0.3, only: ['town'], mml: daleBars(3, r => rep(`r8 {${DALE_CHORD[r]}}8`, 4), `{${DALE_CHORD.a}}`, `{${DALE_CHORD['b-']}}`) },
      // (a rattlesnake answering SAY MY NAME)
      rattle: { inst: 'rattle', pan: 0.45, only: ['desert', 'standoff'], mml: DALE_ROOTS.map((_, i) => i === 3 || i === 15 ? 'o4 r2. c4' : 'r1').join(' | ') },
      surfkit: { inst: 'kick', drums: true, vol: 0.9, only: ['desert'], mml: daleKit(DALE_SURF, DALE_SURF_FILL) },
      cook: { inst: 'kick', drums: true, only: ['warehouse'], mml: daleKit(DALE_COOK, DALE_COOK_FILL) },
      run: { inst: 'kick', drums: true, vol: 0.75, only: ['highway'], mml: daleKit(DALE_RUN, DALE_RUN_FILL) },
      duel: { inst: 'kick', drums: true, only: ['standoff'], mml: daleKit(DALE_DUEL, DALE_DUEL_FILL) },
      polka: { inst: 'kick', drums: true, only: ['town'], mml: daleKit(DALE_POLKA, DALE_POLKA_FILL) },
      stampede: { inst: 'kick', drums: true, only: ['cab'], mml: daleKit(DALE_STAMPEDE, DALE_STAMPEDE_FILL) },
    },
    arrangements: {
      // (out in the open the power chords sit back behind the surf guitar)
      desert: { vol: { power: 0.75 } },
      warehouse: {},
      highway: { vol: { chug: 0.8 } },
      // (the last truck: Riggs and Dale arguing over the radio, him out on the hood, a duel at eighty miles an hour)
      standoff: { inst: { tune: 'trumpet' } },
      town: { inst: { tune: 'accordion' } },
      cab: { inst: { tune: 'accordion', harm: 'brass' } },
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // The bosses: one hard-driving theme, arranged for each of them (the lead and the colors are his stage's).
  boss: {
    bpm: 160,
    parts: {
      riff: { inst: 'power', vol: 0.85, pan: -0.3, mml: rep('o2 l8 b b > d < b > e < b > f+ < b | o2 l8 b b > d < b > g f+ e d', 4) },
      bass: { inst: 'bass', mml: rep('o2 l8 b b b b b b b b | o2 l8 g g g g f+ f+ f+ f+', 4) },
      lead: { inst: 'brass', pan: 0.2, mml: b('o5 l8 b4. > d c+4 < b4', 'o5 a4 g f+ g2', 'o5 b4. > d e4 f+4', 'o6 e2. r4', 'o6 g4. f+ e4 d4', 'o6 c+4 < b a+ b2', 'o5 g4 a b > c+4 d4', 'o6 c+2 < a+2') },
      drums: { inst: 'kick', drums: true, mml: b('{kx}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {kh}8', DRIVE, DRIVE, ROCK_FILL, DRIVE, DRIVE, DRIVE, ROCK_FILL) },
      hits: { inst: 'hit', vol: 0.8, mml: rep('o4 b4 r2. | r1', 4) },
      color: { inst: 'strings', vol: 0.6, pan: 0.35, mml: rep('o4 l16 [b > d f+ <]5 b | o4 l16 g b > d < g b > d < g b > d < f+ a+ > c+ < f+ a+ > c+ < f+', 4) },
    },
    arrangements: {
      'Artie Avalanche': { inst: { lead: 'saw', color: 'ice' } },
      'Victor Volcano': { inst: { lead: 'brass', color: 'marimba' } },
      'Ernie Earthquake': { inst: { lead: 'trumpet', color: 'clav' } },
      'Hector Hurricane': { inst: { lead: 'hammer', color: 'dx' } },
      'Toxic Tommy': { inst: { lead: 'organ', color: 'epiano' } },
      'Blackout Barry': { inst: { lead: 'sax', color: 'strings' } },
      'Oily Oscar': { inst: { lead: 'slide', color: 'fiddle' } },
      'Drug Trade Dale': { inst: { lead: 'accordion', color: 'surf' } },
    },
  },

  // ---------------------------------------------------------------------------------------------------------------
  // The finale (the alien who wore the President): his own theme, not the bosses' one. D minor, a saucer-organ tune
  // wobbling over a clav arpeggio and a driving synth bass, an eerie choir under it all; then the second half, the
  // presidential fanfare he's been hiding behind, turned sour in brass. Begging, it's all stripped away: the tune on
  // its own, slow and thin, the choir hanging on.
  imposter: {
    bpm: 152,
    parts: {
      lead: { inst: 'organ', pan: 0.15, mml: b(
        'o5 d4. f8 a4 g8 f8', 'o5 e4 f8 e8 d2', 'o5 d4. f8 b-4 a8 g8', 'o5 a2. r4',
        'o5 a4. > c8 d4 c8 < a8', 'o5 g4 a8 g8 f2', 'o5 e4 f8 g8 b-4 a4', 'o5 c+2 < a2',
        'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1') },
      fanfare: { inst: 'brass', pan: -0.15, mml: b(
        'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1', 'o5 r1',
        'o5 f8 f16 f16 b-4 f4 d4', 'o5 g8 g16 g16 > c4 < g4 e4', 'o5 a4. g8 f4 e4', 'o5 d2. r4',
        'o5 f8 f16 f16 b-4 > d4 c8 < b-8', 'o5 a4 g8 a8 > c2', 'o5 c+4 e4 a4 g4', 'o5 e2 c+4 < a4') },
      ost: { inst: 'clav', vol: 0.7, pan: -0.35, mml: arp(4, [
        ['dfa', 'd'], ['dfa', 'd'], ['dfb-', 'd'], ['c+ea', 'c+'], ['dfa', 'd'], ['dfa', 'd'], ['dgb-', 'd'], ['c+ea', 'c+'],
        ['dfb-', 'd'], ['ceg', 'c'], ['dfa', 'd'], ['dfa', 'd'], ['dfb-', 'd'], ['ceg', 'c'], ['c+ea', 'c+'], ['c+ea', 'c+']]) },
      bass: { inst: 'synthbass', mml: bass(2, 'R8 R8 O8 R8 R8 R8 O8 F8', [
        'd/a', 'd/a', 'b-/f', 'a/e', 'd/a', 'd/a', 'g/d', 'a/e', 'b-/f', 'c/g', 'd/a', 'd/a', 'b-/f', 'c/g', 'a/e', 'a/e']) },
      choir: { inst: 'choir', vol: 0.55, pan: 0.3, mml: pad(4, ['dfa', 'dfa', 'dfb-', 'c+ea', 'dfa', 'dfa', 'dgb-', 'c+ea', 'dfb-', 'ceg', 'dfa', 'dfa', 'dfb-', 'ceg', 'c+ea', 'c+ea']) },
      hits: { inst: 'timpani', vol: 0.8, mml: ['d', 'd', 'b-', 'a', 'd', 'd', 'g', 'a', 'b-', 'c', 'd', 'd', 'b-', 'c', 'a', 'a'].map(r => `o2 ${r}4 r2.`).join(' | ') },
      drums: { inst: 'kick', drums: true, mml: b('{kx}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {kh}8', DRIVE, DRIVE, ROCK_FILL, DRIVE, DRIVE, DRIVE, ROCK_FILL,
        '{kx}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {kh}8', DRIVE, DRIVE, ROCK_FILL, '{kx}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {kh}8', DRIVE, DRIVE, 's16 s16 s16 s16 t16 t16 u16 u16 {kx}4 {kx}4') },
    },
    arrangements: {
      fight: {},
      // (begging: just the tune, on something thin and sorry, and the choir; everything else gone)
      plead: { inst: { lead: 'flute', fanfare: 'harmonica' }, mute: ['ost', 'bass', 'hits', 'drums'], vol: { choir: 0.8 } },
    },
  },

  // A mid-boss (the moose, the doorman, the Eye, Chuco, the thing in the cistern): tense, pounding.
  midboss: {
    bpm: 150,
    parts: {
      ost: { inst: 'strings', vol: 0.8, pan: -0.3, mml: rep('o4 l16 e e g e a e g e b e a e g e f+ e', 4) + ' | ' + rep('o4 l16 c c e c f c e c g c f c e c d c', 2) + ' | ' + rep('o4 l16 d+ d+ f+ d+ a d+ f+ d+ b d+ a d+ f+ d+ e d+', 2) },
      bass: { inst: 'synthbass', mml: b('o2 l8 e e e e e e e e', 'o2 l8 e e e e e e e e', 'o2 l8 e e e e e e e e', 'o2 l8 e e e e e e e e', 'o2 l8 c c c c c c c c', 'o2 l8 c c c c c c c c', 'o1 l8 b b b b b b b b', 'o1 l8 b b b b b b b b') },
      toms: { inst: 'kick', drums: true, mml: rep('{ku}8 u8 t8 u8 {ku}8 t8 {su}8 t8', 7) + ' | s16 s16 s16 s16 t16 t16 u16 u16 {kx}4 {kx}4' },
      brass: { inst: 'brass', vol: 0.8, pan: 0.3, mml: b('o4 {egb}4 r2.', 'r1', 'o4 {egb}4 r4 {egb}8 {egb}8 r4', 'r1', 'o4 {ceg}4 r2.', 'o4 {ceg}8 {ceg}8 r4 r2', 'o3 {bd+f+}4 r2.', 'o3 {bd+f+}2. r4') },
    },
  },

  // Boss down: a short victory fanfare.
  victory: {
    bpm: 150, once: true,
    parts: {
      lead: { inst: 'trumpet', mml: 'o5 l16 c c c8 c8 < g8 > c4 r8 e8 g2' },
      harm: { inst: 'brass', vol: 0.8, mml: 'o4 l16 g g g8 g8 e8 g4 r8 > c8 e2' },
      low: { inst: 'bass', mml: 'o2 l16 c c c8 c8 < g8 > c4 r8 c8 c2' },
      drums: { inst: 'kick', drums: true, mml: 's16 s16 s8 s8 s8 {kx}4 r8 k8 {kx}2' },
    },
  },

  // Died: a sad trombone, more or less.
  death: {
    bpm: 84, once: true,
    parts: {
      lead: { inst: 'brass', mml: 'o4 l4 g f+ f e2.' },
      low: { inst: 'bass', mml: 'o2 l4 g f+ f e2.' },
    },
  },

  // The weapon screen (and its firing range): "look at this cool fucking weapon you got" (Mega Man 6's weapon get,
  // the camera shot out): E minor, chugging power chords, a heroic brass hook over it, stabs and a pounding drive.
  weapon: {
    bpm: 152,
    parts: {
      riff: { inst: 'power', vol: 0.9, pan: -0.3, mml: b(
        'o2 l8 e e e e g e a e', 'o2 l8 e e e e b e a g', 'o2 l8 c c c c e c g c', 'o2 l8 d d d d f+ d a d',
        'o2 l8 e e e e g e a e', 'o2 l8 e e e e b e > d < b', 'o2 l8 c c c c e c g c', 'o2 l8 b b b b b b > d+ f+') },
      bass: { inst: 'bass', mml: bass(2, 'R8 R8 R8 R8 R8 R8 O8 R8', ['e', 'e', 'c', 'd', 'e', 'e', 'c', 'b']) },
      lead: { inst: 'trumpet', pan: 0.15, mml: b(
        'o5 e8 e8 r8 e8 g4 a4', 'o5 b4. a8 g8 e8 r4', 'o5 c8 c8 r8 c8 e4 g4', 'o5 f+4. e8 d8 f+8 r4',
        'o5 e8 e8 r8 e8 g4 b4', 'o6 e4. d8 < b8 g8 r4', 'o5 c8 e8 g8 > c8 < b4 a4', 'o5 d+2 f+4 b4') },
      stabs: { inst: 'brass', vol: 0.75, pan: 0.35, mml: ['egb', 'egb', 'ceg', 'df+a', 'egb', 'egb', 'ceg', 'd+f+b'].map(c => `o4 {${c}}8 r8 r8 {${c}}8 r2`).join(' | ') },
      hits: { inst: 'hit', vol: 0.8, mml: b('o4 e4 r2.', 'r1', 'r1', 'r1', 'o4 e4 r2.', 'r1', 'r1', 'o3 b4 r4 b4 r4') },
      drums: { inst: 'kick', drums: true, mml: b('{kx}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {kh}8', DRIVE, DRIVE, ROCK_FILL, '{kx}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {kh}8', DRIVE, DRIVE, 's16 s16 s16 s16 t16 t16 u16 u16 {kx}4 {kx}4') },
    },
  },

  // The briefings (the intro, and the man on the radio): a sneaky spy groove. Darker on the radio.
  briefing: {
    bpm: 96,
    parts: {
      bass: { inst: 'bass', mml: rep('o2 l8 c r c e- g r f e- | o2 l8 c r c e- f g a- g', 4) },
      vibes: { inst: 'bell', vol: 0.5, pan: 0.3, mml: rep('o5 l8 r4 g r r4 f+ r | o5 l8 r4 g r r4 a- r', 4) },
      lead: { inst: 'trumpet', vol: 0.8, mml: b('o5 l8 c4. e- g2', 'o5 f4 e- d e-2', 'o5 c4. e- g4 b-4', 'o5 a-2. r4', 'o5 g4. f e-4 d4', 'o5 e-4 d c d2', 'o5 c4 d e- f4 d4', 'o5 c1') },
      drums: { inst: 'kick', drums: true, mml: rep(LIGHT, 8) },
      pad: { inst: 'strings', vol: 0.5, mml: pad(4, ['ce-g', 'ce-g', 'ce-g', 'fa-c', 'ce-g', 'ce-g', 'a-ce-', 'ce-g']) },
    },
    arrangements: {
      main: {},
      radio: { inst: { lead: 'organ', vibes: 'epiano', pad: 'pad' }, mute: ['drums'], vol: { lead: 0.8 } },
    },
  },
};
