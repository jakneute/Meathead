// FOREIGN LANDS' music (land id 'foreign'): the land's theme, re-orchestrated for every pavilion as he walks the World
// Showcase, and the helicopter's tour before he jacks it. The fights (the landmark gauntlet, Helicopter Harry) are in
// foreignBosses.ts.
//
// ---- "THE WHOLE WORLD, FIXED" (land:foreign) ----
// Happy Land's World Showcase: ten countries round a lagoon, every one of them improved. One cheerful travelogue tune
// (an 80s Epcot "wonders of the world" anthem, the hook pentatonic so every country can claim it), played in each
// pavilion by that pavilion's own theme-park band: kitsch, never mockery. The Banjo-Kazooie trick: the same song,
// the place kept, the band changing as he walks from one into the next.
//
// G major, 116, straight. 36 bars: a 4-bar fanfare (once: C - D - Bm Em - Am7 D7, the head of the tune climbing to
// it), then the 32-bar loop:
//   A1 (8)  G - Em - C - D - G - Em - Am7 D7 - G: the hook (down from the D, up the pentatonic, the answer climbing).
//   A2 (8)  ... C D - G: the hook again, up to the high G.
//   B  (8)  C - D - Bm - Em - C - D - Em - F: the tune opening out, the F (the flat seven) the passport stamp.
//   C  (8)  B-flat: Bb - Gm - Eb - F - Bb - Gm - Cm - D7: a bridge somewhere else entirely, the D7 home.
//
// ARRANGEMENTS (one per pavilion, crossfading as he walks; every country's band from the same parts):
//   mexico   mariachi: two trumpets in thirds, the violins long, the vihuela's afterbeats (nylon guitar), the
//            guitarron (upright), shaker and claves
//   norway   a hardanger fiddle reeling the tune over its own drone (the strings' open fifths), a willow flute's long
//            notes, foot stomps
//   china    the tune on a koto in pipa tremolo with a dizi (flute) shadowing it, the drone low, the lion-dance drum,
//            china cymbal, woodblock and gong
//   germany  oompah: the tune on clarinet, the horn in thirds, the accordion's pah, the tuba's oom, the cuckoo
//            clock's glockenspiel, bass drum and snare
//   italy    Venice: the tune on a mandolin's tremolo (banjo), the accordion, a guitar's afterbeats, a tambourine
//            shaking tarantella triplets
//   japan    the tune on shamisen, a shakuhachi's long notes (flute), a koto's arpeggios, a sho's pad, taiko and
//            hyoshigi (woodblock)
//   morocco  the tune on a buzzing sitar (the oud of the park), a ghaita's long notes (oboe), the drone (cello),
//            darbuka in maqsum and a riq's jingles
//   france   musette: the tune on accordion, a violin's long notes, la pompe on the guitar, the upright, brushes
//   uk       a colliery brass band in a music hall: the tune on the brass section, the horn in thirds, a trombone's
//            long notes, the hall's piano on the afterbeats, the tuba, bass drum and snare
//   canada   a fiddle reel (the tune in running eighths, ornamented), the piano's vamp, the upright, a Mountie's horn,
//            bass drum and snare
//   heli     (the helicopter's own music is seq:heli and boss:heli-gauntlet; this is the pad on a revisit: the ride
//            closed) vibes, a warm pad, the upright
//   harry    (Harry's fight is his own; this is his slab on a revisit: the construction site, empty) a harmon
//            trumpet, slow strings, a low drone
//   cutscene celesta, slow strings, harp, the upright soft
//   main     (the sound test) the World Showcase's own: trumpet, horns, strings, harp, glockenspiel, pizzicato
//   boss     (a fight without a theme) the same, the kit up
//
// ---- "THE TOLERANCE TOUR" (seq:heli) ----
// HELICOPTER RIDES ACROSS THE WORLD before he takes it: Harry's soothing tour, a soft-rock hippie lullaby off a 70s
// in-flight tape (America, Bread, a little Ravi Shankar for the culture): a 12-string's arpeggios, a flute floating
// the tune in long notes, a warm pad, vibes, the upright, a shaker barely there, a celesta's wind chime, the sitar
// answering at the ends of phrases. The B-flat over C (the Mixolydian flat seven): peace. Then, after "SHUT UP,
// HIPPIE." and Harry's landing, the turn: the tune gone, a low D drone, the strings' D/E-flat tremolo, the timpani
// rolling, the trombones growling the gauntlet's motif up from below (the landmarks waking).
// C major, 120 (felt in two: everything in long notes). 24 bars: A (8: Cmaj7 - Bb/C - Fmaj7/C - Cmaj7 - Am7 - Dm7 -
// Fmaj7 - Gsus G), A2 (8: ... Fmaj7 G - Cmaj7), B (8: Fmaj7 - Em7 - Dm7 - Cmaj7 - Bbmaj7 - Am7 - Dm7 - Gsus G). The
// tune comes back at the start of Harry's own song, the hippie he's about to rip off.
// ARRANGEMENTS (cues.ts heliArr): pad (the helipad and its queue: the ride's speakers, muffled), board (climbing in,
// the lift), tour (round the park: the sitar in), turn (Harry turned, the landmarks stirring).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, chord, bars, hi } from './jungle';

// =====================================================================================================================
// Melody tools: the tune's bars turned into a second trumpet in thirds, a fiddle's running eighths, a mandolin's
// tremolo (each bar in its own scale, so the thirds and the turns stay in the key).

const PC: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const SHARP = ['c', 'c+', 'd', 'd+', 'e', 'f', 'f+', 'g', 'g+', 'a', 'a+', 'b'];
const FLAT = ['c', 'd-', 'd', 'e-', 'e', 'f', 'g-', 'g', 'a-', 'a', 'b-', 'b'];
interface Ev { m: number | null; len: string; pre: string }
interface Scale { pcs: number[]; flat: boolean }
/** A bar of plain melody ('o5 d4. o4 b8 g4'): its notes (MIDI) and lengths. */
const parse = (bar: string): Ev[] => {
  let oct = 4;
  const out: Ev[] = [];
  for (const tok of bar.trim().split(/\s+/)) {
    const om = /^o(\d)$/.exec(tok);
    if (om) { oct = Number(om[1]); continue; }
    const nm = /^([!?]?)([a-gr])([+#-]?)(\d+\.*)$/.exec(tok);
    if (!nm) throw new Error(`foreign: melody token ${tok}`);
    const [, pre, l, acc, len] = nm;
    if (l === 'r') { out.push({ m: null, len, pre: '' }); continue; }
    out.push({ m: 12 * (oct + 1) + PC[l] + (acc === '-' ? -1 : acc ? 1 : 0), len, pre });
  }
  return out;
};
const beatsOf = (len: string) => { const n = parseInt(len, 10); let b = 4 / n, add = b / 2; for (const ch of len.slice(String(n).length)) if (ch === '.') { b += add; add /= 2; } return b; };
const note = (m: number, len: string, sc: Scale, pre = '') => `o${Math.floor(m / 12) - 1} ${pre}${(sc.flat ? FLAT : SHARP)[m % 12]}${len}`;
const ladderOf = new Map<Scale, number[]>();
const ladder = (sc: Scale) => { let l = ladderOf.get(sc); if (!l) { l = []; for (let m = 24; m <= 108; m++) if (sc.pcs.includes(m % 12)) l.push(m); ladderOf.set(sc, l); } return l; };
/** k steps along the scale from m (a note outside it: a minor third down, a tone up). */
const step = (m: number, k: number, sc: Scale) => { const l = ladder(sc), i = l.indexOf(m); return i < 0 ? m + (k < 0 ? -3 : 2) : l[i + k]; };
/** The bar a diatonic third under. */
const thirds = (bar: string, sc: Scale) => parse(bar).map(e => (e.m === null ? `r${e.len}` : note(step(e.m, -2, sc), e.len, sc, e.pre))).join(' ');
/** The bar as a fiddler plays it: every long note broken into eighths (the note, the one above, the note, a third
 *  under), the first one dug in. */
const fiddled = (bar: string, sc: Scale) => parse(bar).map(e => {
  if (e.m === null) return `r${e.len}`;
  const n = beatsOf(e.len) * 2;
  if (n <= 1 || n !== Math.round(n)) return note(e.m, e.len, sc, e.pre);
  const cyc = [e.m, step(e.m, 1, sc), e.m, step(e.m, -2, sc)];
  return Array.from({ length: n }, (_, i) => note(cyc[i % 4], '8', sc, i === 0 ? '!' : '')).join(' ');
}).join(' ');
/** The bar in tremolo (a mandolin's, a pipa's): every note thirty-seconds. */
const tremolo = (bar: string, sc: Scale) => parse(bar).map(e => (e.m === null ? `r${e.len}` : `o${Math.floor(e.m / 12) - 1} [${(sc.flat ? FLAT : SHARP)[e.m % 12]}32]${Math.round(beatsOf(e.len) * 8)}`)).join(' ');

const G_MAJ: Scale = { pcs: [7, 9, 11, 0, 2, 4, 6], flat: false };
const F_MAJ: Scale = { pcs: [5, 7, 9, 10, 0, 2, 4], flat: true };
const BB_MAJ: Scale = { pcs: [10, 0, 2, 3, 5, 7, 9], flat: true };
const G_HMIN: Scale = { pcs: [7, 9, 10, 0, 2, 3, 6], flat: true };

// =====================================================================================================================
// THE WHOLE WORLD, FIXED

const V: Record<string, string[]> = {
  G: ['4d', '4g', '4b'], Em: ['4e', '4g', '4b'], C: ['4e', '4g', '5c'], D: ['4d', '4f+', '4a'], Am7: ['4c', '4e', '4a'], D7: ['4c', '4f+', '4a'],
  Bm: ['4d', '4f+', '4b'], F: ['4c', '4f', '4a'], Bb: ['4d', '4f', '4b-'], Gm: ['4d', '4g', '4b-'], Eb: ['4e-', '4g', '4b-'], Cm: ['4c', '4e-', '4g'],
};
const R: Record<string, [string, string]> = {
  G: ['g', 'd'], Em: ['e', 'b'], C: ['c', 'g'], D: ['d', 'a'], Am7: ['a', 'e'], D7: ['d', 'a'], Bm: ['b', 'f+'], F: ['f', 'c'],
  Bb: ['b-', 'f'], Gm: ['g', 'd'], Eb: ['e-', 'b-'], Cm: ['c', 'g'],
};
const W_IN: Bar[] = ['C', 'D', ['Bm', 'Em'], ['Am7', 'D7']];
const W_A1: Bar[] = ['G', 'Em', 'C', 'D', 'G', 'Em', ['Am7', 'D7'], 'G'];
const W_A2: Bar[] = ['G', 'Em', 'C', 'D', 'G', 'Em', ['C', 'D'], 'G'];
const W_B: Bar[] = ['C', 'D', 'Bm', 'Em', 'C', 'D', 'Em', 'F'];
const W_C: Bar[] = ['Bb', 'Gm', 'Eb', 'F', 'Bb', 'Gm', 'Cm', 'D7'];
const W_ALL: Bar[] = [...W_IN, ...W_A1, ...W_A2, ...W_B, ...W_C];
/** Each bar's scale (for the thirds and the fiddle's turns). */
const W_SC: Scale[] = [...Array.from({ length: 27 }, () => G_MAJ), F_MAJ, ...Array.from({ length: 7 }, () => BB_MAJ), G_HMIN];
/** The bars where a section ends (the drums fill), and where each starts (its dynamics). */
const W_ENDS = new Set([3, 11, 19, 27, 35]);
const W_STARTS = [0, 4, 12, 20, 28];
/** Velocities in at each section's start (the fanfare, A1, A2, B, C). */
const dyn = (bs: string[], vs: number[]) => bs.flatMap((b, i) => { const k = W_STARTS.indexOf(i); return k >= 0 ? [`_v${vs[k]}`, b] : [b]; });

// ---- The tune ----
const M_IN = ['o5 c4 e8 g8 o6 c2', 'o5 d4 f+8 a8 o6 d2', 'o5 b4 a4 g4 b4', 'o5 a4 g4 f+4 a4'];
const M_A = ['o5 d4. o4 b8 g4 a8 b8', 'o5 e4 d8 o4 b8 g2', 'o4 a4. g8 e4 g8 a8', 'o4 b4 a8 g8 a2', 'o5 d4. o4 b8 g4 a8 b8', 'o5 e4 g8 e8 d4 o4 b8 o5 d8'];
const M_A1 = [...M_A, 'o5 e4 d8 o4 b8 a4 b8 a8', 'o4 g2. r4'];
const M_A2 = [...M_A, 'o5 e4 g8 e8 d4 e8 f+8', 'o5 g2. r8 d8'];
const M_B = ['o5 g4. e8 c4 e4', 'o5 f+4. d8 o4 a4 o5 d4', 'o5 f+4 e8 d8 o4 b4 o5 d4', 'o5 e2 o4 b4 r4', 'o5 g4. e8 c4 g4', 'o5 a4. f+8 d4 a4', 'o5 b4 a8 g8 e4 g4', 'o5 f4. c8 o4 a4 o5 c4'];
const M_C = ['o5 d4. f8 b-4 a8 g8', 'o5 g4 f8 d8 o4 b-2', 'o5 c4. e-8 g4 f8 e-8', 'o5 f4 e-8 d8 c2', 'o5 d4. f8 b-4 a8 g8', 'o5 b-4 a8 g8 f4 d4', 'o5 e-4 g8 e-8 c4 e-4', 'o5 d4 f+4 a4 f+4'];
const MEL = [...M_IN, ...M_A1, ...M_A2, ...M_B, ...M_C];

/** The counter-line: long notes under the tune (strings, horn, flute, oboe: by country). */
const CT_A = ['o4 g2 b2', 'o4 b2 g2', 'o4 g2 e2', 'o4 f+2 a2', 'o4 g2 b2', 'o4 b2 o5 e2'];
const COUNTER = [
  'o4 g1', 'o4 a1', 'o4 b2 b2', 'o5 c2 c2',
  ...CT_A, 'o5 c2 o4 a2', 'o4 b1',
  ...CT_A, 'o4 g2 a2', 'o4 b2 o5 d2',
  'o4 g1', 'o4 a1', 'o4 f+1', 'o4 g1', 'o4 g1', 'o4 a1', 'o4 b2 g2', 'o4 a2 e-2',
  'o4 f1', 'o4 g1', 'o4 g1', 'o4 a1', 'o4 f1', 'o4 g1', 'o4 g1', 'o4 f+1',
];

const wPads = (prog: Bar[]) => bars(prog, (c, b) => chord(V[c], b === 4 ? '1' : '2'));
/** The afterbeats (the vihuela, the accordion's pah, la pompe, the music hall's piano). */
const wChick = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(V[c], '4'); return b === 4 ? `r4 ${x} r4 ${x}` : `r4 ${x}`; });
/** The oom: the root, then the fifth. */
const wBoom = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = R[c]; return b === 4 ? `o2 ${r}4 r4 ${f}4 r4` : `o2 ${r}4 r4`; });
/** A koto's (a harp's) sixteenths: up the chord and back, a beat each. */
const wArp = (prog: Bar[]) => bars(prog, (c, b) => {
  const v = V[c], upb = [v[0], v[1], v[2], hi(v[0])], dnb = [hi(v[1]), hi(v[0]), v[2], v[1]];
  return Array.from({ length: b }, (_, i) => (i % 2 ? dnb : upb).map(n => nt(n, '16')).join(' ')).join(' ');
});
/** The drone: open fifths, held on G through the A sections (the hardanger's strings ringing), with the chords
 *  elsewhere. */
const FIFTH: Record<string, string> = { c: 'g', d: 'a', 'e-': 'b-', e: 'b', f: '>c', g: '>d', 'b-': '>f', b: '>f+', a: '>e' };
const DRONE = W_ALL.map((b, i) => {
  if (i >= 4 && i < 20) return 'o2 {g >d}1';
  const r = R[typeof b === 'string' ? b : b[0]][0];
  return `o2 {${r} ${FIFTH[r]}}1`;
});

// ---- The drums (a pattern a bar; the section's last bar fills, its first crashes) ----
const perBar = (normal: string, fill: string, first = normal) => W_ALL.map((_, i) => (W_ENDS.has(i) ? fill : W_STARTS.includes(i) ? first : normal));
const POLKA = perBar('k4 s4 k4 s4', 'k4 s8 s8 s16 s16 s16 s16 s8 s8', '{kx}4 s4 k4 s4');
const MEX = perBar('{z(clave)}8 ?z8 z8 {z(clave)}8 z8 ?z8 {z(clave)}8 ?z8', 'z8 z8 z8 z8 c16 c16 d8 d8 c8');
const DARBUKA = perBar('d8 c8 ?b8 c8 d8 ?b8 c8 ?j8', 'd16 d16 c16 c16 d16 c16 b16 b16 d8 c8 d8 {dj}8', '{dj}8 c8 ?b8 c8 d8 ?b8 c8 ?j8');
const TAMB = perBar('!j12 ?j12 j12 !j12 ?j12 j12 !j12 ?j12 j12 !j12 ?j12 j12', '!j12 j12 j12 !j12 j12 j12 !j6 !j6 !j6');
const TAIKO = perBar('f4 r8 f8 e8 e8 f4', 'f8 f8 f8 f8 f16 f16 f16 f16 f4');
const LION = perBar('(tom3)4 (tom3)8 (china)8 r8 (tom3)8 (china)8 (woodblock)8', '(tom3)16 (tom3)16 (tom3)16 (tom3)16 (tom3)16 (tom3)16 (tom3)16 (tom3)16 (china)8 (china)8 (china)4', '{(gong)(tom3)}4 (tom3)8 (china)8 r8 (tom3)8 (china)8 (woodblock)8');
const STOMP = perBar('(kicksoft)4 r4 (kicksoft)4 r8 (kicksoft)8', '(kicksoft)4 (kicksoft)4 (kicksoft)8 (kicksoft)8 (kicksoft)4');
const BRUSH = perBar('{ki}4 {ish}8 i8 i4 {ish}8 i8', 'k4 s8 s8 s8 s8 s4');

const VEL_TUNE = [95, 100, 104, 100, 98];

export const LAND_FOREIGN: Song = {
  title: 'The Whole World, Fixed',
  bpm: 116,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.75,
  delay: { beats: 0.75, feedback: 0.25, tone: 3000 },
  parts: {
    tune: { inst: 'trumpet', pan: 0, rev: 0.25, dly: 0.08, mml: join(dyn(MEL, VEL_TUNE)) },
    tune2: { inst: 'trumpet', pan: 0.2, rev: 0.25, vol: 0.62, mml: join(dyn(MEL.map((b, i) => thirds(b, W_SC[i])), [85, 90, 94, 90, 88])) },
    trem: { inst: 'banjo', pan: 0, rev: 0.25, dly: 0.1, vol: 0.8, mml: join(dyn(MEL.map((b, i) => tremolo(b, W_SC[i])), [85, 90, 95, 90, 88])) },
    fiddle: { inst: 'violin', pan: 0.05, rev: 0.22, vol: 0.85, mml: join(dyn(MEL.map((b, i) => fiddled(b, W_SC[i])), [92, 98, 104, 98, 96])) },
    counter: { inst: 'horn', pan: -0.3, rev: 0.32, vol: 0.5, mml: join(['_v80'], COUNTER) },
    chick: { inst: 'pizz', pan: 0.35, rev: 0.18, vol: 0.5, mml: join(['q5 _v85'], wChick(W_ALL)) },
    bass: { inst: 'upright', pan: 0, rev: 0.08, vol: 0.75, mml: join(['q6 _v100'], wBoom(W_ALL)) },
    pad: { inst: 'strings', pan: 0, rev: 0.4, vol: 0.32, mml: join(['_v75'], wPads(W_ALL)) },
    drone: { inst: 'strings', pan: -0.1, rev: 0.35, vol: 0.32, mml: join(['_v80'], DRONE) },
    arp: { inst: 'harp', pan: 0.3, rev: 0.35, vol: 0.4, mml: join(['_v75'], wArp(W_ALL)) },
    bells: { inst: 'glock', pan: 0.4, rev: 0.3, dly: 0.12, vol: 0.32, mml: join(['_v80'], up(MEL)) },
    polka: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.2, vol: 0.55, mml: join(['_v95'], POLKA) },
    mex: { inst: 'shaker', drums: true, pan: 0.25, rev: 0.15, vol: 0.5, mml: join(['_v90'], MEX) },
    darbuka: { inst: 'congahi', drums: true, pan: -0.15, rev: 0.18, vol: 0.65, mml: join(['_v100'], DARBUKA) },
    tamb: { inst: 'tamb', drums: true, pan: 0.3, rev: 0.18, vol: 0.45, mml: join(['_v95'], TAMB) },
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.55, mml: join(['_v100'], TAIKO) },
    lion: { inst: 'tom3', drums: true, pan: -0.1, rev: 0.22, vol: 0.5, mml: join(['_v95'], LION) },
    stomp: { inst: 'kicksoft', drums: true, rev: 0.25, vol: 0.6, mml: join(['_v100'], STOMP) },
    brush: { inst: 'kicksoft', drums: true, kit: 'brush', rev: 0.2, vol: 0.6, swing: 0.55, grid: 8, mml: join(['_v90'], BRUSH) },
  },
  arrangements: {
    main: { solo: ['tune', 'counter', 'pad', 'arp', 'bells', 'chick', 'bass', 'polka'], vol: { polka: 0.7 } },
    mexico: {
      solo: ['tune', 'tune2', 'counter', 'chick', 'bass', 'mex'],
      inst: { counter: 'strings', chick: 'nylongtr' },
      vol: { tune: 0.9, counter: 0.45, chick: 0.65 }, rev: { tune: 0.3, tune2: 0.3 },
    },
    norway: {
      solo: ['fiddle', 'drone', 'counter', 'bass', 'stomp'],
      inst: { counter: 'flute' },
      vol: { drone: 0.42, counter: 0.4, bass: 0.55 }, rev: { fiddle: 0.35, counter: 0.45 },
    },
    china: {
      solo: ['trem', 'tune', 'drone', 'lion'],
      inst: { trem: 'koto', tune: 'flute', drone: 'cello' },
      vol: { tune: 0.45, drone: 0.3, trem: 0.85 }, rev: { tune: 0.35 },
    },
    germany: {
      solo: ['tune', 'tune2', 'chick', 'bass', 'bells', 'polka'],
      inst: { tune: 'clarinet', tune2: 'horn', chick: 'accordion', bass: 'tuba' },
      vol: { tune2: 0.55, chick: 0.45, bells: 0.4, polka: 0.65 },
    },
    italy: {
      solo: ['trem', 'counter', 'chick', 'bass', 'tamb'],
      inst: { counter: 'accordion', chick: 'nylongtr' },
      vol: { counter: 0.4, chick: 0.6 },
    },
    japan: {
      solo: ['tune', 'counter', 'arp', 'pad', 'taiko'],
      inst: { tune: 'shamisen', counter: 'flute', arp: 'koto', pad: 'warmpad' },
      vol: { counter: 0.38, arp: 0.38, pad: 0.25 }, rev: { counter: 0.45, tune: 0.3 },
    },
    morocco: {
      solo: ['tune', 'counter', 'drone', 'darbuka'],
      inst: { tune: 'sitar', counter: 'oboe', drone: 'cello' },
      vol: { counter: 0.35, drone: 0.38 }, rev: { tune: 0.3, counter: 0.35 },
    },
    france: {
      solo: ['tune', 'counter', 'chick', 'bass', 'brush'],
      inst: { tune: 'accordion', counter: 'violin', chick: 'nylongtr' },
      vol: { counter: 0.35, chick: 0.6 }, rev: { tune: 0.25 },
    },
    uk: {
      solo: ['tune', 'tune2', 'counter', 'chick', 'bass', 'polka'],
      inst: { tune: 'brass', tune2: 'horn', counter: 'trombone', chick: 'piano', bass: 'tuba' },
      vol: { tune: 0.85, tune2: 0.55, counter: 0.45, chick: 0.45, polka: 0.65 },
    },
    canada: {
      solo: ['fiddle', 'counter', 'chick', 'bass', 'polka'],
      inst: { chick: 'piano' },
      vol: { counter: 0.4, chick: 0.5, polka: 0.5 },
    },
    heli: { solo: ['tune', 'pad', 'bass'], inst: { tune: 'vibes', pad: 'warmpad' }, vol: { tune: 0.6, pad: 0.4, bass: 0.55 }, rev: { tune: 0.4 }, level: 0.7 },
    harry: { solo: ['tune', 'pad', 'bass', 'drone'], inst: { tune: 'mutetrumpet', pad: 'slowstrings', drone: 'cello' }, vol: { tune: 0.65, pad: 0.4, bass: 0.5, drone: 0.3 }, rev: { tune: 0.45 }, level: 0.7 },
    cutscene: {
      solo: ['tune', 'counter', 'arp', 'pad', 'bass'],
      inst: { tune: 'celesta', counter: 'slowstrings', pad: 'slowstrings' },
      vol: { counter: 0.35, pad: 0.3, arp: 0.35, bass: 0.45 }, rev: { tune: 0.45 }, level: 0.75,
    },
    boss: { solo: ['tune', 'counter', 'pad', 'arp', 'bells', 'chick', 'bass', 'polka', 'taiko'], vol: { polka: 0.9, taiko: 0.7 } },
  },
};

// =====================================================================================================================
// THE TOLERANCE TOUR

const TV: Record<string, string[]> = {
  Cmaj7: ['4e', '4g', '4b'], 'Bb/C': ['4d', '4f', '4b-'], 'Fmaj7/C': ['4e', '4a', '5c'], Am7: ['4e', '4g', '5c'], Dm7: ['4d', '4f', '4a', '5c'],
  Fmaj7: ['4e', '4f', '4a', '5c'], Gsus: ['4d', '4g', '5c'], G: ['4d', '4g', '4b'], Em7: ['4d', '4e', '4g', '4b'], Bbmaj7: ['4d', '4f', '4a', '4b-'],
};
const TR: Record<string, [string, string]> = {
  Cmaj7: ['c', 'g'], 'Bb/C': ['c', 'f'], 'Fmaj7/C': ['c', 'f'], Am7: ['a', 'e'], Dm7: ['d', 'a'], Fmaj7: ['f', 'c'], Gsus: ['g', 'd'], G: ['g', 'd'],
  Em7: ['e', 'b'], Bbmaj7: ['b-', 'f'],
};
export const T_A: Bar[] = ['Cmaj7', 'Bb/C', 'Fmaj7/C', 'Cmaj7', 'Am7', 'Dm7', 'Fmaj7', ['Gsus', 'G']];
const T_A2: Bar[] = ['Cmaj7', 'Bb/C', 'Fmaj7/C', 'Cmaj7', 'Am7', 'Dm7', ['Fmaj7', 'G'], 'Cmaj7'];
const T_B: Bar[] = ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7', 'Bbmaj7', 'Am7', 'Dm7', ['Gsus', 'G']];
const T_ALL = [...T_A, ...T_A2, ...T_B];

/** The tour's tune (Harry's song opens on its first four bars). */
export const TM_A = ['o5 e2. g4', 'o5 f2 d2', 'o5 c2 o4 a4 o5 c4', 'o4 b1', 'o5 c2. e4', 'o5 d2 f4 a4', 'o5 g2 e4 c4', 'o5 d1'];
const TM_A2 = [...TM_A.slice(0, 6), 'o5 c2 d2', 'o5 e1'];
const TM_B = ['o5 a2. g4', 'o5 g2 e2', 'o5 f2. e4', 'o5 e1', 'o5 d2. f4', 'o5 e2 c2', 'o5 d2 a4 f4', 'o5 d2 o4 b2'];

/** The 12-string's arpeggio: the bass note, then up and down the chord in eighths. */
export const tourGtr = (prog: Bar[]) => bars(prog, (c, b) => {
  const n = [`3${TR[c][0]}`, ...TV[c]];
  const idx = [0, 1, 2, 3, 2, 1, 2, 1];
  return idx.slice(0, b * 2).map(k => nt(n[Math.min(k, n.length - 1)], '8')).join(' ');
});
const tPads = (prog: Bar[]) => bars(prog, (c, b) => chord(TV[c], b === 4 ? '1' : '2'));
const tBass = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = TR[c]; return b === 4 ? `o2 ${r}2 ${f}2` : `o2 ${r}2`; });
/** The sitar's answers at the ends of phrases (bars 4 and 8 of each eight). */
const SITAR8 = ['r1', 'r1', 'r1', 'r2 o4 e8 g8 a8 b8', 'r1', 'r1', 'r1', 'r2 o5 d8 c8 o4 a8 g8'];
/** The wind chime: a celesta run down at the top of each eight. */
const CHIME8 = ['o6 g16 e16 d16 c16 o5 b16 g16 e16 d16 c2', ...rest(7)];
const TPERC = ['(triangle)4 ?z8 z8 ?z8 ?z8 z8 ?z8', ...rep('?z8 ?z8 z8 ?z8 ?z8 ?z8 z8 ?z8', 3)];
/** The turn: the trombones growling the gauntlet's motif from below, every four bars. */
const TURN_BRASS = ['o2 a12. o3 d24 f12 a2.', 'r1', 'o3 d12. f24 a12 o4 d2.', 'r1'];
const TROLL = 'o2 _v50 [d32]8 _v70 [d32]8 _v90 [d32]8 _v115 [d32]8';

export const SEQ_HELI: Song = {
  title: 'The Tolerance Tour',
  bpm: 120,
  reverb: 'hall',
  reverbMix: 1,
  delay: { beats: 1.5, feedback: 0.35, tone: 2600 },
  parts: {
    flute: { inst: 'flute', pan: 0, rev: 0.45, dly: 0.2, vol: 0.85, mml: join(['_v90'], TM_A, TM_A2, ['_v95'], TM_B) },
    gtr: { inst: 'steelgtr', pan: -0.3, rev: 0.3, cho: 0.45, vol: 0.55, mml: join(['_v80'], tourGtr(T_ALL)) },
    pad: { inst: 'warmpad', pan: 0, rev: 0.5, vol: 0.32, mml: join(['_v80'], tPads(T_ALL)) },
    vibes: { inst: 'vibes', pan: 0.35, rev: 0.4, dly: 0.15, vol: 0.32, mml: join(['_v70'], bars(T_ALL, (c, b) => (b === 4 ? `${chord(TV[c], '2')} r2` : `${chord(TV[c], '4')} r4`))) },
    bass: { inst: 'upright', pan: 0, rev: 0.12, vol: 0.6, mml: join(['q7 _v85'], tBass(T_ALL)) },
    sitar: { inst: 'sitar', pan: 0.3, rev: 0.4, dly: 0.25, vol: 0.5, mml: join(['_v85'], SITAR8, SITAR8, SITAR8) },
    chimes: { inst: 'celesta', pan: 0.4, rev: 0.5, dly: 0.2, vol: 0.35, mml: join(['_v70'], CHIME8, CHIME8, CHIME8) },
    perc: { inst: 'shaker', drums: true, pan: 0.2, rev: 0.25, vol: 0.35, mml: join(['_v70'], rep(TPERC.join(' | '), 6)) },
    drone: { inst: 'cello', pan: -0.1, rev: 0.35, vol: 0.55, mml: join(['_v95'], rep('o2 d1', 24)) },
    trem: { inst: 'strings', pan: 0.15, rev: 0.4, vol: 0.4, mml: join(['_v80'], rep('_e35 _e110/1^1^1 o3 [{d e-}32]32 | o3 [{d e-}32]32 | o3 [{d e-}32]32 | _e127 o3 [{d e-}32]32', 6)) },
    lowbrass: { inst: 'trombone', pan: -0.2, rev: 0.35, vol: 0.6, mml: join(['_v105'], rep(TURN_BRASS.join(' | '), 6)) },
    timp: { inst: 'timpani', pan: 0.1, rev: 0.35, vol: 0.6, mml: join(rep(`o2 _v100 d4 r2. | r1 | o2 _v90 d4 r2. | ${TROLL}`, 6)) },
  },
  arrangements: {
    main: { solo: ['flute', 'gtr', 'pad', 'vibes', 'bass', 'sitar', 'chimes', 'perc'] },
    pad: { solo: ['flute', 'gtr', 'pad', 'vibes', 'bass', 'chimes', 'perc'], lowpass: 2400, level: 0.55 },
    board: { solo: ['flute', 'gtr', 'pad', 'vibes', 'bass', 'chimes', 'perc'], level: 0.8 },
    tour: { solo: ['flute', 'gtr', 'pad', 'vibes', 'bass', 'sitar', 'chimes', 'perc'], level: 0.8 },
    turn: { solo: ['drone', 'trem', 'lowbrass', 'timp'], level: 0.9 },
  },
};
