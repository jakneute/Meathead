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
/** Salsa in a hurry: cowbell and kick on the beat, bongos and congas running sixteenths, the snare on two and four. */
const SALSA = '{kw}16 b16 b16 c16 {sw}16 b16 c16 c16 {kw}16 b16 b16 c16 {sw}16 c16 {kd}16 d16';
const SALSA_FILL = '{kw}16 b16 b16 c16 {sw}16 b16 c16 c16 t16 t16 t16 t16 u16 u16 {kx}8';
/** Drum and bass's two-step over a slow tempo: the snare twice a beat, so 92 feels like 184. */
const DNB = '{kh}16 h16 {sh}16 h16 h16 {kh}16 {sh}16 h16 {kh}16 h16 {sh}16 h16 h16 {kh}16 {sh}16 h16';
const DNB_FILL = '{kh}16 h16 {sh}16 h16 h16 {kh}16 {sh}16 h16 s16 s16 s16 s16 t16 t16 u16 u16';
/** Eight bars of a groove: in on a crash, a fill at the end of each four. */
const chase8 = (groove: string, fill: string) => b(groove.replace(/^\{k/, '{kx'), groove, groove, fill, groove, groove, groove, fill);

// Tunes (and roots) used by more than one part of their song
const ERNIE_ROOTS = ['e', 'a', 'e', 'a', 'c', 'a', 'd', 'e'];
const HECTOR_ROOTS = ['c/g', 'd/a', 'c/g', 'c/g', 'f/c', 'c/g', 'g/d', 'c/g'];
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
// Dale's: D minor, sixteen bars. The hook spells it out in note names: B(-flat), A, D (slow, the B-flat leaning on the
// A, the menace), answered quick and cocky with D, E, A, D (the grin); F, A, C, E climbing (an F major seventh, the
// lounge chord); F, A, C, A, D, E. The second eight up high on a D drone, the E-flat grinding on it (the heat), then
// the hook again and down through the E-flat to the A7. Its roots (F|A: split halfway) and the chords, rootless.
const DALE_TUNE = ['o4 l8 b-4. a d2', 'o4 l8 r d e a > d4 r4', 'o4 l8 b-4. a d2', 'o4 l8 f a > c e^2', 'o4 l8 f4 a > c^4 < a > d', 'o5 e2. r4', 'o4 l8 b-4. a g4 f4', 'o4 e4 c+4 e4 a4',
  'o5 a2 b-4 a4', 'o5 l8 g4. f e-2', 'o5 l8 d4. e f4 a4', 'o5 g2 e4 c+4', 'o4 l8 b-4. a d2', 'o4 l8 r d e a > d4 r4', 'o4 l8 g4. f e-2', 'o4 d4 c+4 < a4 r4'];
const DALE_ROOTS = ['d/a', 'd/a', 'g/d', 'f/c|a/e', 'b-/f', 'a/e', 'g/d', 'a/e', 'd/a', 'e-/b-', 'd/a', 'c/g|a/e', 'b-/f', 'g/d', 'e-/b-', 'a/e'];
/** (Dm9, Gm6/9, Fmaj9, A7b9, Bbmaj9, Ebmaj9, C7: rootless, in octave 3, topping out round E4-A4) */
const DALE_CHORD: Record<string, string> = { d: 'fa>ce', g: 'b->dea', f: 'a>ceg', a: 'gb->c+e', 'b-': 'a>cdf', 'e-': 'gb->df', c: 'gb->ce' };
/** A bass-ish line a bar at a time: `full` with R the root, F the fifth (below), O the root an octave up; `half` twice where the bar's split. */
const daleBars = (o: number, full: string, half: string) => DALE_ROOTS.map(r => {
  const one = (p: string, rf: string) => { const [root, fifth] = rf.split('/'); return p.replace(/O([\d.]*)/g, `>${root}$1<`).replace(/F/g, fifth).replace(/R/g, root); };
  const [x, y] = r.split('|');
  return `o${o} ` + (y ? `${one(half, x)} ${one(half, y)}` : one(full, x));
}).join(' | ');
/** The chords a bar at a time: `full(chord)`, or `half` on each where the bar's split. */
const daleKeys = (o: number, full: (c: string) => string, half: (c: string) => string) => DALE_ROOTS.map(r => {
  const [x, y] = r.split('|').map(s => DALE_CHORD[s.split('/')[0]]);
  return `o${o} ` + (y ? `${half(x)} ${half(y)}` : full(x));
}).join(' | ');
/** The beakers: the chord's tones up high in eighths, picked out in a ticking order (each note with its own octave). */
const daleGlass = (o: number) => DALE_ROOTS.map(r => {
  const tones = (c: string) => { let up = 0; const out: string[] = []; for (const m of c.match(/>|[a-g][+-]?/g)!) { if (m === '>') up++; else out.push(`o${o + up} ${m}8`); } return out; };
  const [x, y] = r.split('|').map(s => tones(DALE_CHORD[s.split('/')[0]]));
  return [0, 2, 1, 3, 2, 0, 3, 1].map((k, i) => (y && i >= 4 ? y : x)[k]).join(' ');
}).join(' | ');
// (the kit: dry out in the desert, shaker and rim and a low conga; ticking sixteenths in the lab; a heartbeat on the
// frame drum for the duel; the convoy on the congas twice as busy; the strip-mall lounge with the clap on the backbeat
// and the tambourine, and Riggs's cab the same flat out)
const DALE_DRY = 'v12 {kz}8 z8 {mz}8 z16 d16 {kz}16 k16 z8 {mz}8 z8';
const DALE_DRY_TURN = 'v12 {kz}8 z8 {mz}8 z16 d16 {kz}16 k16 c16 c16 d16 d16 c8';
const DALE_LAB = 'v12 k16 v8 h16 h16 h16 v12 m16 v8 h16 h16 h16 v12 k16 v8 h16 v12 k16 v8 h16 v12 m16 v8 h16 h16 h16';
const DALE_HEART = 'v12 {kd}8. d16 r2.';
const DALE_CONVOY = '{kh}16 c16 {sh}16 d16 {kh}16 c16 {sh}16 c16 {kh}16 d16 {sh}16 c16 {kh}16 {kh}16 {sh}16 d16';
const DALE_CONVOY_FILL = '{kh}16 c16 {sh}16 d16 {kh}16 c16 {sh}16 c16 s16 s16 t16 t16 u16 u16 {kx}8';
const DALE_LOUNGE = 'v12 {kh}8 j8 {sph}8 j8 h16 k16 {kh}8 {sph}8 {oj}8';
const DALE_LOUNGE_FILL = 'v12 {kh}8 j8 {sph}8 j8 t16 t16 u16 u16 {sp}8 {kx}8';
const DALE_CAB = '{kj}16 j16 {spj}16 j16 {kj}16 j16 {spj}16 {kj}16 {kj}16 j16 {spj}16 j16 {kj}16 j16 {spj}16 j16';
const DALE_CAB_FILL = '{kj}16 j16 {spj}16 j16 {kj}16 j16 {spj}16 {kj}16 s16 s16 s16 s16 {sp}16 {sp}16 {kx}8';

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
const down = (s: string) => s.replace(/o(\d)/g, (_, n) => `o${Number(n) - 1}`);
// (the kit: a cross-stick on two and four, the hats ticking like the clock, the kick laid back; the second four pushing
// sixteenths, the snare in for the cross-stick, toms into the turnaround)
const MAP_TICK = 'v11 {kh}8 h8 {mh}8 h8 h8 {kh}8 {mh}8 h8';
const MAP_TICK_FILL = 'v11 {kh}8 h8 {mh}8 h8 h8 {kh}8 m16 m16 {mo}8';
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
    bpm: 92,
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
    },
    arrangements: {
      main: {},
      set2: { vol: { lead: 0.6, keys: 0.6, hum: 0.8 } },
    },
  },

  // The deploy: the map swooping down on the target (three and a half seconds or so). The manhunt launching: power
  // chords and the brass hammering C three times, climbing to the E-flat and falling through the D-flat, the timpani
  // rolling up under it on the G, and everything coming down on C minor with the taiko and the crash.
  fanfare: {
    bpm: 132, once: true,
    parts: {
      lead: { inst: 'brass', mml: 'o4 l8 c c c e-4. d- c < g > c2 r8' },
      harm: { inst: 'horn', vol: 0.8, mml: 'o3 l8 g g g g4. f e- d e-2 r8' },
      low: { inst: 'power', vol: 0.8, mml: 'o2 l8 c c c c4. d- c < g > c2 r8' },
      timp: { inst: 'timpani', vol: 0.9, mml: 'o2 l16 v7 [g]6 v9 [g]6 v12 [g]6 v15 c4 r4.' },
      drums: { inst: 'kick', drums: true, mml: 'v13 {kf}8 {kf}8 {kf}8 r8 r4 v8 [s32]4 v11 [s32]4 v14 [s32]4 v15 {kxf}4 r4.' },
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

  // Hector: Miami, salsa. Steel drum and piano on the beach; minor and stormy when the storm hits; the stolen boat with
  // the Coast Guard after it as salsa flat out (trumpet up front, the bongos and congas running sixteenths, the bass
  // pumping, the horns stabbing every bar); choir up the storm tower.
  hector: {
    bpm: 124,
    parts: {
      lead: { inst: 'steel', mml: b('o5 l8 c e g a4 g e c', 'o5 d4 f a g2', 'o5 c e g a4 > c < a g', 'o5 e2. r4', 'o5 f4 a > c < b4 g4', 'o5 e4 g a g4 e4', 'o5 d4 e f g4 b4', 'o6 c1') },
      montuno: { inst: 'piano', vol: 0.7, pan: -0.35, mml: [['ceg', 'e'], ['dfa', 'f'], ['ceg', 'e'], ['ceg', 'e'], ['fac', 'a'], ['ceg', 'e'], ['gbd', 'b'], ['ceg', 'e']].map(([c, t]) => `o4 {${c}}8 ${t}8 r8 {${c}}8 r8 ${t}8 {${c}}8 r8`).join(' | ') },
      bass: { inst: 'bass', not: ['boat'], mml: bass(2, 'R4. F8 r8 O8 F4', HECTOR_ROOTS) },
      pump: { inst: 'bass', only: ['boat'], mml: bass(2, 'R8 R8 O8 R8 F8 R8 O8 F8', HECTOR_ROOTS) },
      perc: { inst: 'kick', drums: true, not: ['storm', 'tower', 'boat'], mml: rep('{kw}8 b8 c8 {bw}8 {kd}8 b8 c8 {cw}8', 8) },
      storm: { inst: 'kick', drums: true, only: ['storm', 'tower'], mml: b(DRIVE, DRIVE, DRIVE, ROCK_FILL, DRIVE, DRIVE, DRIVE, ROCK_FILL) },
      salsa: { inst: 'kick', drums: true, only: ['boat'], mml: chase8(SALSA, SALSA_FILL) },
      horns: { inst: 'brass', vol: 0.7, pan: 0.3, only: ['beach'], mml: rep('o4 r2 r8 {ceg}8 {ceg}8 r8 | o4 r2 r8 {dfa}8 {dfa}8 r8', 4) },
      mambo: { inst: 'brass', vol: 0.65, pan: 0.3, only: ['boat'], mml: ['ceg', 'dfa', 'ceg', 'ceg', 'fac', 'ceg', 'gbd', 'ceg'].map(c => `o4 {${c}}8 r8 r8 {${c}}8 r4 {${c}}8 {${c}}8`).join(' | ') },
      pad: { inst: 'choir', vol: 0.6, only: ['tower'], mml: pad(4, ['ceg', 'dfa', 'ceg', 'ceg', 'fac', 'ceg', 'gbd', 'ceg']) },
      str: { inst: 'strings', vol: 0.6, only: ['storm'], mml: pad(4, ['ce-g', 'dfa-', 'ce-g', 'ce-g', 'fa-c', 'ce-g', 'gbd', 'ce-g']) },
    },
    arrangements: {
      beach: {},
      storm: { inst: { lead: 'trumpet', montuno: 'organ' } },
      boat: { inst: { lead: 'trumpet' }, vol: { montuno: 1.15 } },
      tower: { inst: { lead: 'brass', montuno: 'strings' }, vol: { montuno: 0.5 } },
      daycare: { mute: ['perc'], inst: { lead: 'bell', montuno: 'harp' } },
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

  // Dale: Albuquerque, a meth dealer in the desert. Half Breaking Bad (a twangy baritone guitar drowning in its amp's
  // spring tank, a lonely drone shimmering in the heat, dry hand percussion, a rattlesnake), half Better Call Saul (a
  // cheesy combo organ, a walking bass, muted trumpets grinning, the strip-mall lawyer's TV spot). D minor at 100: menace
  // with a smirk, the hook spelling out B-A-D and D-E-A-D. Out in the desert the baritone on the tune over the drone,
  // a dry groove on the shaker and the rim, the Rhodes sliding in a chord behind the beat, the snake rattling in the
  // gaps; the warehouse is the cook (the drone gone to the factory's hum, a synth bass ticking, glassware tinking, hats
  // running like a lab timer); the convoy a chase (an overdriven lead with the baritone under it, power chords and the
  // bass in sixteenths, the congas twice as busy); the last truck a duel (the baritone, the drone, a heartbeat on the
  // frame drum, the timpani, the snake); Deadwood Gulch is Saul's, at full grin (the organ on the tune, walking bass,
  // the organ skanking, muted trumpets, the clap and the tambourine); and Riggs's cab coming up the street is the
  // lounge flat out (the organ and the baritone, the horns, the bass pumping, the kit twice as busy).
  dale: {
    bpm: 100,
    parts: {
      // (Walt's: the baritone, down an octave)
      bari: { inst: 'twang', pan: -0.1, not: ['town'], mml: b(...DALE_TUNE.map(down)) },
      // (Saul's: the organ on the tune, up where it's written; on the convoy the overdriven lead)
      lead: { inst: 'combo', pan: 0.15, only: ['highway', 'town', 'cab'], mml: b(...DALE_TUNE) },
      drone: { inst: 'heat', vol: 0.9, only: ['desert', 'standoff'], mml: rep('o2 {d>d}1^1^1^1', 4) },
      hum: { inst: 'hum', vol: 1.3, only: ['warehouse'], mml: rep('o3 d1^1^1^1', 4) },
      bass: { inst: 'bass', vol: 0.9, only: ['desert'], mml: daleBars(2, 'R4. R8 r4 F8 R8', 'R4. R8') },
      pulse: { inst: 'synthbass', vol: 0.75, only: ['warehouse'], mml: daleBars(2, 'q4 R8 R8 O8 R8 R8 R8 O8 R8', 'q4 R8 R8 O8 R8') },
      walk: { inst: 'bass', only: ['town'], mml: b('o2 d4 f4 a4 c+4', 'o2 d4 a4 > c4 < f+4', 'o2 g4 b-4 > d4 < e4', 'o2 f4 > c4 < a4 b4', 'o2 b-4 > d4 c4 < b4', 'o2 a4 > c+4 < a4 a-4', 'o2 g4 b-4 > d4 < g+4', 'o2 a4 > c+4 e4 < c+4',
        'o2 d4 a4 f4 e4', 'o2 e-4 g4 b-4 c+4', 'o2 d4 f4 a4 b4', 'o3 c4 < g4 a4 b4', 'o2 b-4 > d4 f4 < a4', 'o2 g4 b-4 > d4 < e4', 'o2 e-4 g4 b-4 a-4', 'o2 a4 > c+4 e4 < c+4') },
      pump: { inst: 'bass', only: ['highway', 'cab'], mml: daleBars(2, 'q6 R16 R16 O16 R16 R16 R16 O16 R16 R16 R16 O16 R16 R16 F16 O16 R16', 'q6 R16 R16 O16 R16 R16 F16 O16 R16') },
      power: { inst: 'power', vol: 0.85, pan: -0.3, only: ['highway'], mml: daleBars(2, 'q5 R16 R16 R8 R16 R16 R8 R16 R16 R8 R8 R8', 'q5 R16 R16 R8 R16 R16 R8') },
      // (the Rhodes in the desert: a chord slid in late, a smirk; the organ skanking in town; stabbing eighths on the cab)
      keys: { inst: 'epiano', vol: 0.45, pan: 0.3, only: ['desert'], mml: daleKeys(3, c => `r2 r8 {${c}}4.`, c => `r8 {${c}}4.`) },
      comp: { inst: 'organ', vol: 0.5, pan: -0.3, only: ['town'], mml: daleKeys(3, c => `r8 {${c}}8 r4 r8 {${c}}8 r4`, c => `r8 {${c}}8 r4`) },
      push: { inst: 'organ', vol: 0.45, pan: -0.3, only: ['cab'], mml: daleKeys(3, c => `r8 {${c}}8 r8 {${c}}8 r8 {${c}}8 r8 {${c}}8`, c => `r8 {${c}}8 r8 {${c}}8`) },
      // (the horns grinning in the gaps the tune leaves)
      horns: { inst: 'mute', vol: 0.9, pan: 0.35, only: ['town', 'cab'], mml: b('r1', 'o4 r2 {fa>d}8 r8 {fa>d}8 r8', 'r1', 'o4 r2. {gb->c+}8 r8', 'r1', 'o4 r2. {gb->c+e}8 r8', 'r1', 'o4 {gb->c+}8 r8 r2.',
        'r1', 'o4 r2 {gb->d}8 r8 {gb->d}8 r8', 'r1', 'r1', 'r1', 'o4 r2 {b->de}8 r8 {b->de}8 r8', 'r1', 'o4 r2. {gb->c+e}8 r8') },
      // (the cook: beakers tinking up high)
      glass: { inst: 'tink', vol: 0.75, pan: 0.3, only: ['warehouse'], mml: daleGlass(5) },
      // (a rattlesnake in the gaps)
      rattle: { inst: 'rattle', vol: 1, pan: 0.45, only: ['desert', 'standoff'], mml: b('r1', 'o4 r2 c2', 'r1', 'r1', 'r1', 'o4 r2. c4', 'r1', 'r1', 'r1', 'r1', 'r1', 'r1', 'r1', 'o4 r2 c2', 'r1', 'o4 r2. c4') },
      timp: { inst: 'timpani', vol: 0.75, only: ['standoff'], mml: b('v12 o2 d4 r2.', 'r1', 'r1', 'r1', 'r1', 'r1', 'r1', 'o2 a4 r2.', 'o2 d4 r2.', 'r1', 'r1', 'r1', 'r1', 'r1', 'o2 e-4 r2.', 'o2 a4 r4 v8 [a32]8 v11 [a32]8') },
      drums: { inst: 'kick', drums: true, only: ['desert'], mml: rep(b(DALE_DRY, DALE_DRY, DALE_DRY, DALE_DRY_TURN), 4) },
      lab: { inst: 'kick', drums: true, only: ['warehouse'], mml: rep(DALE_LAB, 16) },
      heart: { inst: 'kick', drums: true, only: ['standoff'], mml: rep(DALE_HEART, 16) },
      convoy: { inst: 'kick', drums: true, only: ['highway'], mml: b(chase8(DALE_CONVOY, DALE_CONVOY_FILL), chase8(DALE_CONVOY, DALE_CONVOY_FILL)) },
      lounge: { inst: 'kick', drums: true, only: ['town'], mml: b(DALE_LOUNGE.replace('{kh}', '{kxh}'), rep(DALE_LOUNGE, 6), DALE_LOUNGE_FILL, rep(DALE_LOUNGE, 7), DALE_LOUNGE_FILL) },
      cab: { inst: 'kick', drums: true, only: ['cab'], mml: b(chase8(DALE_CAB, DALE_CAB_FILL), chase8(DALE_CAB, DALE_CAB_FILL)) },
    },
    arrangements: {
      desert: {},
      warehouse: { vol: { pulse: 1.25, glass: 1.15 } },
      highway: { inst: { lead: 'guitar' }, vol: { bari: 0.5 } },
      // (the last truck: Riggs and Dale arguing over the radio, him out on the hood, a duel at eighty miles an hour)
      standoff: { vol: { bari: 1.15, drone: 1.3, timp: 1.2 } },
      town: { vol: { lead: 1.15, walk: 1.15, comp: 1.3 } },
      cab: { inst: { horns: 'brass' }, vol: { bari: 0.55, horns: 0.7 } },
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
      'Hector Hurricane': { inst: { lead: 'steel', color: 'strings' } },
      'Toxic Tommy': { inst: { lead: 'organ', color: 'epiano' } },
      'Blackout Barry': { inst: { lead: 'sax', color: 'strings' } },
      'Oily Oscar': { inst: { lead: 'slide', color: 'fiddle' } },
      'Drug Trade Dale': { inst: { lead: 'combo', color: 'twang' } },
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
