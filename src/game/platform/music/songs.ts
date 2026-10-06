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
const TRAIN = '{kh}16 h16 s16 h16 {kh}16 h16 s16 {sh}16 {kh}16 h16 s16 h16 {kh}16 h16 {sh}16 s16';

// The chases' grooves (each stage's own: same tempo as the stage's theme, so the song keeps its place, but twice as
// busy, so it feels twice as fast). A bar each, and a fill to end a phrase on.
/** Double kick running sixteenths, the snare on every offbeat eighth: the avalanche coming down behind him. */
const AVALANCHE = '{kh}16 k16 {sh}16 k16 {kh}16 k16 {sh}16 k16 {kh}16 k16 {sh}16 k16 {kh}16 k16 {sh}16 {kh}16';
const AVALANCHE_FILL = '{kh}16 k16 {sh}16 k16 {kh}16 k16 {sh}16 k16 s16 s16 t16 t16 u16 u16 {kf}8';
/** Double kick under a rock backbeat: the bikers' southern rock flat out. */
const HAMMER = '{kh}16 h16 {kh}16 h16 {sh}16 h16 {kh}16 {kh}16 {kh}16 h16 {kh}16 h16 {sh}16 h16 {kh}16 {sh}16';
const HAMMER_FILL = '{kh}16 h16 {kh}16 h16 {sh}16 h16 {kh}16 {kh}16 s16 s16 s16 s16 t16 t16 u16 u16';
/** Surf drums: toms running in sixteenths under the backbeat (Wipe Out). */
const WIPE = '{kt}16 t16 t16 t16 {st}16 t16 u16 u16 {kt}16 t16 t16 t16 {st}16 t16 u16 u16';
const WIPE_FILL = '{kt}16 t16 t16 t16 {st}16 t16 u16 u16 s16 s16 s16 s16 {su}16 {su}16 {kx}8';
/** Salsa in a hurry: cowbell and kick on the beat, bongos and congas running sixteenths, the snare on two and four. */
const SALSA = '{kw}16 b16 b16 c16 {sw}16 b16 c16 c16 {kw}16 b16 b16 c16 {sw}16 c16 {kd}16 d16';
const SALSA_FILL = '{kw}16 b16 b16 c16 {sw}16 b16 c16 c16 t16 t16 t16 t16 u16 u16 {kx}8';
/** Drum and bass's two-step over a slow tempo: the snare twice a beat, so 92 feels like 184. */
const DNB = '{kh}16 h16 {sh}16 h16 h16 {kh}16 {sh}16 h16 {kh}16 h16 {sh}16 h16 h16 {kh}16 {sh}16 h16';
const DNB_FILL = '{kh}16 h16 {sh}16 h16 h16 {kh}16 {sh}16 h16 s16 s16 s16 s16 t16 t16 u16 u16';
/** A gallop on the toms (the posse riding), kick and snare under it. */
const GALLOP = '{kh}8 t16 t16 {sh}8 t16 t16 {kh}8 t16 t16 {sh}8 u16 u16';
const GALLOP_FILL = '{kh}8 t16 t16 {sh}8 t16 t16 s16 s16 t16 t16 u16 u16 {kx}8';
/** Eight bars of a groove: in on a crash, a fill at the end of each four. */
const chase8 = (groove: string, fill: string) => b(groove.replace(/^\{k/, '{kx'), groove, groove, fill, groove, groove, groove, fill);

// Tunes (and roots) used by more than one part of their song
const ERNIE_ROOTS = ['e', 'a', 'e', 'a', 'c', 'a', 'd', 'e'];
const HECTOR_ROOTS = ['c/g', 'd/a', 'c/g', 'c/g', 'f/c', 'c/g', 'g/d', 'c/g'];
const TOMMY_ROOTS = ['c', 'c', 'e-', 'f', 'c', 'f', 'a-', 'c'];
const OSCAR_TUNE = ['o5 l8 e4 g+ a b4 a g+', 'o5 f+4 e d e2', 'o5 e4 g+ a b4 > d c+', 'o5 b2. r4', 'o5 a4 b > c+ d4 c+ < b', 'o5 a4 g+ f+ e4 d4', 'o5 c+4 d e f+4 g+4', 'o5 a1'];
const OSCAR_ROOTS = ['e', 'd', 'e', 'e', 'a', 'd', 'a', 'a'];
const DALE_TUNE = ['o5 l8 d4. a a4 g f', 'o5 e4. f d2', 'o5 d4. a > c4 < b- a', 'o5 a2. r4', 'o5 b-4. a g4 f e', 'o5 f4. g a2', 'o5 g4 f e d4 c+4', 'o5 d1'];
const DALE_ROOTS = ['d', 'a', 'd', 'a', 'g', 'd', 'a', 'd'];

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
  // The map (the stage select): a cool, sneaky, funky briefing groove. Darker for the second four.
  map: {
    bpm: 104,
    parts: {
      bass: { inst: 'slap', mml: rep('o2 l8 d r d f g r a > c < | o2 l8 d r d f a g f e', 4) },
      keys: { inst: 'epiano', vol: 0.8, pan: -0.3, mml: stabs(4, ['dfac', 'egb-d', 'dfac', 'c+eg', 'dfac', 'egb-d', 'fac', 'c+ega']) },
      lead: { inst: 'sax', pan: 0.2, mml: b('o5 l8 d4 f g a4 r4', 'o5 c a4 g f g4 r8', 'o5 d4 f g a4 > c d', 'o6 d4. c o5 a2', 'o5 f4 g a > c4 < a4', 'o5 g f d f g2', 'o5 a4 > c d f4 e d', 'o6 d2 r2') },
      drums: { inst: 'kick', drums: true, mml: rep('k8 h8 {sh}8 h8 k8 k8 {sh}8 {hz}8', 8) },
      pad: { inst: 'pad', vol: 0.6, only: ['set2'], mml: pad(3, ['dfa', 'dfa', 'dfa', 'c+ea', 'dfa', 'dfa', 'fac', 'c+ea']) },
    },
    arrangements: {
      main: {},
      set2: { inst: { keys: 'organ', lead: 'trumpet' }, vol: { keys: 0.7 } },
    },
  },

  // A fanfare as the map swoops down on the target (the deploy; three and a half seconds or so)
  fanfare: {
    bpm: 132, once: true,
    parts: {
      lead: { inst: 'trumpet', mml: 'o4 l8 g g g > c4. < g > c e g2 r8' },
      harm: { inst: 'brass', vol: 0.8, mml: 'o4 l8 e e e g4. e g c e2 r8' },
      low: { inst: 'brass', vol: 0.8, mml: 'o3 l8 c c c e4. c e g > c2 < r8' },
      hit: { inst: 'hit', mml: 'o4 c4 r4 r4 r8 r4 c4 r4' },
      timp: { inst: 'timpani', mml: 'o2 l16 g g g g g g g g g g g g g g g g g g g g g g g g g4 r4' },
      cym: { inst: 'kick', drums: true, mml: '{kx}4 r4 r4 r8 r4 {kx}4 r4' },
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

  // Oscar: Texas. Banjo and harmonica in the field; elevator music in the break room; the chase on Dirty Dan's chopper
  // is southern rock flat out (the guitar and the harmonica on the tune together, double kick, the bass pumping, the
  // power chords chugging, the banjo rolling over the top); the power chords stay in for the field on fire out back
  // of the office; honky-tonk at the bar.
  oscar: {
    bpm: 140,
    parts: {
      lead: { inst: 'harmonica', mml: b(...OSCAR_TUNE) },
      hook: { inst: 'harmonica', vol: 0.6, pan: 0.25, only: ['chase'], mml: b(...OSCAR_TUNE) },
      banjo: { inst: 'banjo', vol: 0.8, pan: -0.35, not: ['break'], mml: [['eg+b', 'e'], ['df+a', 'd'], ['eg+b', 'e'], ['eg+b', 'e'], ['ac+e', 'a'], ['df+a', 'd'], ['ac+e', 'a'], ['ac+e', 'a']].map(([c, t]) => { const n = notes(c); return `o4 l16 ${n[0]} ${n[1]} ${n[2]} o5 ${t} o4 ${n[1]} ${n[2]} o5 ${t} o4 ${n[1]} ${n[0]} ${n[1]} ${n[2]} o5 ${t} o4 ${n[2]} ${n[1]} ${n[0]} ${n[2]}`; }).join(' | ') },
      bass: { inst: 'bass', not: ['chase'], mml: bass(2, 'R4 F4 R4 F4', ['e/b', 'd/a', 'e/b', 'e/b', 'a/e', 'd/a', 'a/e', 'a/e']) },
      pump: { inst: 'bass', only: ['chase'], mml: bass(2, 'R8 R8 O8 R8 R8 R8 O8 R8', OSCAR_ROOTS) },
      drums: { inst: 'kick', drums: true, not: ['break', 'chase'], mml: rep(TRAIN, 8) },
      chase: { inst: 'kick', drums: true, only: ['chase'], mml: chase8(HAMMER, HAMMER_FILL) },
      power: { inst: 'power', vol: 0.8, only: ['chase', 'burn'], mml: bass(2, 'R8 R8 r8 R8 R4 R8 R8', OSCAR_ROOTS) },
      muzak: { inst: 'kick', drums: true, only: ['break'], mml: rep('{km}8 z8 z8 {kz}8 m8 z8 z8 z8', 8) },
      keys: { inst: 'piano', vol: 0.7, only: ['end'], mml: skank(4, ['eg+b', 'df+a', 'eg+b', 'eg+b', 'ac+e', 'df+a', 'ac+e', 'ac+e']) },
    },
    arrangements: {
      field: {},
      break: { inst: { lead: 'epiano', bass: 'bass' }, vol: { lead: 0.8 } },
      chase: { inst: { lead: 'guitar' }, vol: { banjo: 0.75 } },
      // (the field burning out back of the office: the field's own, the chase's power chords still in it, lower)
      burn: { vol: { power: 0.55 } },
      end: { inst: { lead: 'piano' } },
    },
  },

  // Dale: a spaghetti western. Whistling out in the desert; the cartel's machinery ticking over in the warehouse; the
  // convoy as a chase (a trumpet, the power chords, the bass and the toms galloping); the standoff with Riggs on the last
  // truck stripped back to a duel (whistle, bells, the choir); the full showdown in town; and Riggs's cab coming up the
  // street as the posse at full gallop (trumpet and whistle on the tune, the choir, the bells, the strummed guitar).
  dale: {
    bpm: 100,
    parts: {
      lead: { inst: 'whistle', mml: b(...DALE_TUNE) },
      // (the cab coming up the street: the whistle an octave up over the trumpet)
      hook: { inst: 'whistle', vol: 0.6, pan: 0.2, only: ['cab'], mml: up(b(...DALE_TUNE)) },
      gtr: { inst: 'nylon', vol: 0.8, pan: -0.35, mml: [['dfa', 'd'], ['c+eg', 'c+'], ['dfa', 'd'], ['c+ea', 'a'], ['gb-d', 'g'], ['dfa', 'd'], ['c+eg', 'c+'], ['dfa', 'd']].map(([c]) => `o3 {${c}}4 {${c}}8 {${c}}8 {${c}}4 {${c}}8 {${c}}8`).join(' | ') },
      bass: { inst: 'bass', not: ['highway', 'cab'], mml: bass(2, 'R4 r8 F8 R4 F4', ['d/a', 'a/e', 'd/a', 'a/e', 'g/d', 'd/a', 'a/e', 'd/a']) },
      gallop: { inst: 'bass', only: ['highway', 'cab'], mml: bass(2, 'R8 R16 R16 R8 R16 R16 R8 R16 R16 O8 R16 R16', DALE_ROOTS) },
      timp: { inst: 'timpani', vol: 0.8, mml: rep('o2 d4 r2. | o2 a4 r2. ', 4) },
      drums: { inst: 'kick', drums: true, only: ['desert'], mml: rep('k8 r8 m8 r8 k8 k8 m8 r8', 8) },
      works: { inst: 'kick', drums: true, only: ['warehouse'], mml: rep('k8 z16 z16 m8 z16 z16 k8 z16 z16 m8 z16 z16', 8) },
      road: { inst: 'kick', drums: true, only: ['highway', 'cab'], mml: chase8(GALLOP, GALLOP_FILL) },
      choir: { inst: 'choir', vol: 0.6, only: ['town', 'standoff', 'cab'], mml: pad(4, ['dfa', 'c+eg', 'dfa', 'c+ea', 'gb->d', 'dfa', 'c+eg', 'dfa']) },
      bells: { inst: 'bell', vol: 0.5, only: ['town', 'standoff', 'cab'], mml: rep('o5 d2 r2 | o4 a2 r2', 4) },
    },
    arrangements: {
      desert: {},
      warehouse: { vol: { lead: 0.85, gtr: 0.7 } },
      highway: { inst: { lead: 'trumpet', gtr: 'power' }, vol: { gtr: 0.5 } },
      // (the last truck: Riggs and Dale arguing over the radio, him out on the hood, a duel at eighty miles an hour)
      standoff: { vol: { gtr: 0.5, choir: 0.45 } },
      town: { inst: { lead: 'trumpet' } },
      cab: { inst: { lead: 'trumpet' }, vol: { choir: 0.75, gtr: 0.9 } },
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
      'Oily Oscar': { inst: { lead: 'harmonica', color: 'banjo' } },
      'Drug Trade Dale': { inst: { lead: 'trumpet', color: 'nylon' } },
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
