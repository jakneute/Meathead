// FOREIGN LANDS' music (land id 'foreign'): the land's theme, re-orchestrated for every pavilion as he walks the World
// Showcase, and the helicopter's tour before he jacks it. The fights (the landmark gauntlet, Helicopter Harry) are in
// foreignBosses.ts.
//
// ---- "THE WHOLE WORLD, FIXED" (land:foreign) ----
// Happy Land's World Showcase: ten countries round a lagoon, every one of them improved. One travelogue hook
// (pentatonic, so every country can claim it) played as a Mega Man stage: a rock core under every pavilion (the kit
// driving sixteenths, the bass pumping octaves, power chords), and on top each pavilion's own band taking the tune
// (the Banjo-Kazooie trick: the same song, the place kept, the band changing as he walks): kitsch, never mockery.
// G major, 160, straight. 36 bars: a 4-bar fanfare (once: C - D - Bm Em - Am7 D7, the tune's head climbing to it, the
// band hitting with it), then A1 (G - Em - C - D - G - Em - Am7 D7 - G), A2 (... C D - G, up to the high G), B (C - D
// - Bm - Em - C - D - Em - F, the flat-seven F the passport stamp), C (B-flat: Bb - Gm - Eb - F - Bb - Gm - Cm - D7, a
// bridge somewhere else entirely, the D7 home).
// ARRANGEMENTS (one per pavilion, crossfading as he walks; the rock core under all of them):
//   main     the World Showcase's own: trumpet and a second in thirds, a horn counterline, a square arpeggio
//   mexico   mariachi: two trumpets in thirds, the violins long, the vihuela's afterbeats (nylon), shaker and claves
//   norway   a hardanger fiddle reeling the tune in eighths over its open-fifth drone, a willow flute's long notes
//   china    the tune on a koto in pipa tremolo, a dizi (flute) shadowing it, the drone, the lion-dance drum and china
//   germany  polka-punk: the tune on clarinet with a horn in thirds, the accordion's afterbeats, the kick-snare gallop
//   italy    the tune on a mandolin's tremolo (banjo), the accordion's long notes, a guitar's afterbeats, tambourine
//   japan    the tune on shamisen, a shakuhachi's long notes (flute), a koto's sixteenths, taiko
//   morocco  the tune on a buzzing sitar, a ghaita's long notes (oboe), the drone (cello), darbuka
//   france   musette: the tune on accordion, a violin's long notes, la pompe on the guitar
//   uk       a colliery brass band: the brass section on the tune, a horn in thirds, a trombone's long notes, the
//            music hall's piano on the afterbeats
//   canada   a fiddle reel (the tune in running eighths), the piano's afterbeats, a horn counterline
//   heli     (the helipad on a revisit: the ride closed) vibes, a warm pad, the bass, no drums
//   harry    (his slab on a revisit: the construction site, empty) a harmon trumpet, slow strings, a low drone
//   cutscene a horn on the tune, slow strings, a harp's sixteenths, the bass soft
//   boss     (a fight without a theme) everything, taiko in
//
// ---- "THE TOLERANCE TOUR" (seq:heli) ----
// HELICOPTER RIDES ACROSS THE WORLD before he takes it: Harry's soothing tour, a 70s soft-rock cruise off an in-flight
// tape (America, the Eagles, a little Ravi Shankar for the culture): a 12-string's arpeggios, the tune floating on a
// flute, a warm pad, the bass rocking root and fifth, a laid-back kit and shaker, the sitar answering at phrase ends.
// The B-flat over C (the Mixolydian flat seven): peace. Calm, not cute. Then, after "SHUT UP, HIPPIE." and Harry's
// landing, the turn: the tune gone, a low D drone, the strings' D/E-flat tremolo, the timpani rolling, the trombones
// growling the gauntlet's motif.
// C major, 120. 24 bars: A (Cmaj7 - Bb/C - Fmaj7/C - Cmaj7 - Am7 - Dm7 - Fmaj7 - Gsus G), A2 (... Fmaj7 G - Cmaj7), B
// (Fmaj7 - Em7 - Dm7 - Cmaj7 - Bbmaj7 - Am7 - Dm7 - Gsus G). The tune comes back at the start of Harry's own song.
// ARRANGEMENTS (cues.ts heliArr): pad (the helipad and its queue: the ride's speakers, muffled), board (climbing in,
// the lift), tour (round the park: the sitar in), turn (Harry turned, the landmarks stirring).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, pat, pads, harm, scale, sec, tone, chordStr, KIT, FILL } from './mmkit';

// =====================================================================================================================
// Melody tools: the tune's bars as a fiddler's running eighths and a mandolin's (a pipa's) tremolo.

const PC: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const SHARP = ['c', 'c+', 'd', 'd+', 'e', 'f', 'f+', 'g', 'g+', 'a', 'a+', 'b'];
interface Ev { m: number | null; len: string; pre: string }
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
const note = (m: number, len: string, pre = '') => `o${Math.floor(m / 12) - 1} ${pre}${SHARP[m % 12]}${len}`;
const ladder = (sc: number[]) => { const l: number[] = []; for (let m = 24; m <= 108; m++) if (sc.includes(m % 12)) l.push(m); return l; };
const step = (m: number, k: number, sc: number[]) => { const l = ladder(sc), i = l.indexOf(m); return i < 0 ? m + (k < 0 ? -3 : 2) : l[i + k]; };
/** The bar as a fiddler plays it: every long note broken into eighths (the note, the one above, the note, a third
 *  under), the first one dug in. */
const fiddled = (bar: string, sc: number[]) => parse(bar).map(e => {
  if (e.m === null) return `r${e.len}`;
  const n = beatsOf(e.len) * 2;
  if (n <= 1 || n !== Math.round(n)) return note(e.m, e.len, e.pre);
  const cyc = [e.m, step(e.m, 1, sc), e.m, step(e.m, -2, sc)];
  return Array.from({ length: n }, (_, i) => note(cyc[i % 4], '8', i === 0 ? '!' : '')).join(' ');
}).join(' ');
/** The bar in tremolo: every note thirty-seconds. */
const tremolo = (bar: string) => parse(bar).map(e => (e.m === null ? `r${e.len}` : `o${Math.floor(e.m / 12) - 1} [${SHARP[e.m % 12]}32]${Math.round(beatsOf(e.len) * 8)}`)).join(' ');

const G_MAJ = scale('g', 'major'), F_MAJ = scale('f', 'major'), BB_MAJ = scale('bb', 'major'), G_HMIN = scale('g', 'harmonic');

// =====================================================================================================================
// THE WHOLE WORLD, FIXED

const W_IN: Bar[] = ['C', 'D', ['Bm', 'Em'], ['Am7', 'D7']];
const W_A1: Bar[] = ['G', 'Em', 'C', 'D', 'G', 'Em', ['Am7', 'D7'], 'G'];
const W_A2: Bar[] = ['G', 'Em', 'C', 'D', 'G', 'Em', ['C', 'D'], 'G'];
const W_B: Bar[] = ['C', 'D', 'Bm', 'Em', 'C', 'D', 'Em', 'F'];
const W_C: Bar[] = ['Bb', 'Gm', 'Eb', 'F', 'Bb', 'Gm', 'Cm', 'D7'];
const W_LOOP: Bar[] = [...W_A1, ...W_A2, ...W_B, ...W_C];
const W_ALL: Bar[] = [...W_IN, ...W_LOOP];
/** Each bar's scale (for the thirds and the fiddle's turns). */
const W_SC: number[][] = [...rep(G_MAJ, 27), F_MAJ, ...rep(BB_MAJ, 7), G_HMIN];

const M_IN = ['o5 c8 c8 e8 g8 o6 c4 r4', 'o5 d8 d8 f+8 a8 o6 d4 r4', 'o5 b4 a4 g4 b4', 'o5 a8 a8 g8 g8 f+4 a4'];
const M_A = ['o5 d4. o4 b8 g4 a8 b8', 'o5 e4 d8 o4 b8 r8 g4.', 'o4 a4. g8 e4 g8 a8', 'o4 b4 a8 g8 r8 a4.', 'o5 d4. o4 b8 g4 a8 b8', 'o5 e4 g8 e8 d4 o4 b8 o5 d8'];
const M_A1 = [...M_A, 'o5 e4 d8 o4 b8 a4 b8 a8', 'o4 g4 r8 g8 a8 b8 o5 d4'];
const M_A2 = [...M_A, 'o5 e4 g8 e8 d4 e8 f+8', 'o5 g4. r8 g8 a8 b8 o6 d8'];
const M_B = ['o5 g4. e8 c4 e4', 'o5 f+4. d8 o4 a4 o5 d4', 'o5 f+4 e8 d8 o4 b4 o5 d4', 'o5 e4. o4 b8 r8 b8 o5 d8 e8', 'o5 g4. e8 c4 g4', 'o5 a4. f+8 d4 a4', 'o5 b4 a8 g8 e4 g4', 'o5 f4. c8 r8 c8 d8 f8'];
const M_C = ['o5 d4. f8 b-4 a8 g8', 'o5 g4 f8 d8 r8 o4 b-4.', 'o5 c4. e-8 g4 f8 e-8', 'o5 f4 e-8 d8 c4 f4', 'o5 d4. f8 b-4 a8 g8', 'o5 b-4 a8 g8 f4 d4', 'o5 e-4 g8 e-8 c4 e-4', 'o5 d4 f+4 a4 f+8 a8'];
const MEL = [...M_IN, ...M_A1, ...M_A2, ...M_B, ...M_C];
const MEL3 = harm(MEL, W_SC);

const CT_A = ['o4 g2 b2', 'o4 b2 g2', 'o4 g2 e2', 'o4 f+2 a2', 'o4 g2 b2', 'o4 b2 o5 e2'];
const COUNTER = [
  'o4 g1', 'o4 a1', 'o4 b2 b2', 'o5 c2 c2',
  ...CT_A, 'o5 c2 o4 a2', 'o4 b1',
  ...CT_A, 'o4 g2 a2', 'o4 b2 o5 d2',
  'o4 g1', 'o4 a1', 'o4 f+1', 'o4 g1', 'o4 g1', 'o4 a1', 'o4 b2 g2', 'o4 a2 f2',
  'o4 f1', 'o4 g1', 'o4 g1', 'o4 a1', 'o4 f1', 'o4 g1', 'o4 g1', 'o4 f+1',
];
/** The drone: open fifths, held on G through the A sections, on the chords elsewhere. */
const DRONE = W_ALL.map((b, i) => { const r = tone(typeof b === 'string' ? b : b[0], 0, 36); return i >= 4 && i < 20 ? 'o2 {g >d}1' : chordStr([r, r + 7], '1'); });

const W_KIT = join(['_v112 {kx}4 r4 {kx}4 r4', '{kx}4 r4 {kx}4 r4', '{kx}4 {kx}4 {kx}4 {kx}4', FILL.big], ['_v100'], sec(8, KIT.mm, FILL.toms), sec(8, KIT.drive, FILL.snare), sec(8, KIT.ride, FILL.toms), sec(8, KIT.mm, FILL.big));
const W_PUNK = join(['_v112 {kx}4 r4 {kx}4 r4', '{kx}4 r4 {kx}4 r4', '{kx}4 {kx}4 {kx}4 {kx}4', FILL.big], ['_v100'], sec(8, KIT.punk, FILL.toms), sec(8, KIT.punk, FILL.snare), sec(8, KIT.punk, FILL.toms), sec(8, KIT.punk, FILL.big));
const perc = (bar: string) => join(rest(4), rep(bar, 32));
const CORE = ['bass', 'gtr', 'kit'];

export const LAND_FOREIGN: Song = {
  title: 'The Whole World, Fixed',
  bpm: 160,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.7,
  delay: { beats: 0.75, feedback: 0.25, tone: 3000 },
  parts: {
    tune: { inst: 'trumpet', pan: 0, rev: 0.22, dly: 0.08, mml: join(['_v108'], MEL) },
    tune2: { inst: 'trumpet', pan: 0.25, rev: 0.25, vol: 0.5, mml: join(['_v100'], MEL3) },
    trem: { inst: 'banjo', pan: 0, rev: 0.22, dly: 0.1, vol: 0.75, mml: join(['_v95'], MEL.map(tremolo)) },
    fiddle: { inst: 'violin', pan: 0.05, rev: 0.22, vol: 0.85, mml: join(['_v104'], MEL.map((b, i) => fiddled(b, W_SC[i]))) },
    counter: { inst: 'horn', pan: -0.3, rev: 0.32, vol: 0.45, mml: join(['_v85'], COUNTER) },
    chick: { inst: 'nylongtr', pan: 0.35, rev: 0.15, vol: 0.45, mml: join(['q4 _v90'], pat(W_ALL, 'r8 X8 r8 X8', 55)) },
    pad: { inst: 'strings', pan: 0, rev: 0.4, vol: 0.28, mml: join(['_v80'], pads(W_ALL, 55)) },
    drone: { inst: 'strings', pan: -0.1, rev: 0.35, vol: 0.3, mml: join(['_v85'], DRONE) },
    arp: { inst: 'squarelead', pan: 0.35, rev: 0.2, dly: 0.12, vol: 0.2, mml: join(['q5 _v90'], pat(W_ALL, "016 116 216 0'16", 62)) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.82, mml: join(['_v108'], pat(W_IN, '!B4 r4 B4 r4', 28), ['_v100'], pat(W_LOOP, "B8 B'8 B8 B'8 B8 B'8 B8 B'8", 28)) },
    gtr: { inst: 'powerchord', pan: -0.4, rev: 0.1, vol: 0.42, mml: join(['_v110'], pat(W_IN, '!R4 r4 R4 r4', 40), ['_v100'], pat(W_LOOP, '!R8 R8 R8 !R8 r8 R8 !R8 R8', 40)) },
    kit: { inst: 'kick', drums: true, rev: 0.12, vol: 0.7, mml: W_KIT },
    punk: { inst: 'kick', drums: true, rev: 0.12, vol: 0.7, mml: W_PUNK },
    mex: { inst: 'shaker', drums: true, pan: 0.25, rev: 0.15, vol: 0.5, mml: perc('{z(clave)}8 ?z8 z8 {z(clave)}8 z8 ?z8 {z(clave)}8 ?z8') },
    darbuka: { inst: 'congahi', drums: true, pan: -0.15, rev: 0.18, vol: 0.6, mml: perc('d16 ?c16 c16 ?b16 d16 ?b16 c16 ?c16 d16 ?c16 c16 ?b16 c16 c16 d8') },
    tamb: { inst: 'tamb', drums: true, pan: 0.3, rev: 0.18, vol: 0.45, mml: perc('!j12 ?j12 j12 !j12 ?j12 j12 !j12 ?j12 j12 !j12 ?j12 j12') },
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.55, mml: perc('f4 r8 f8 e8 e8 f4') },
    lion: { inst: 'tom3', drums: true, pan: -0.1, rev: 0.22, vol: 0.5, mml: perc('(tom3)8 (tom3)8 (china)8 r8 (tom3)8 (tom3)8 (china)8 (woodblock)8') },
  },
  arrangements: {
    main: { solo: ['tune', 'tune2', 'counter', 'pad', 'arp', ...CORE] },
    mexico: { solo: ['tune', 'tune2', 'counter', 'chick', 'mex', ...CORE], inst: { counter: 'strings' }, vol: { tune: 0.95, tune2: 0.6, counter: 0.4, chick: 1.2 }, rev: { tune: 0.3, tune2: 0.3 } },
    norway: { solo: ['fiddle', 'drone', 'counter', ...CORE], inst: { counter: 'flute' }, vol: { drone: 1.3, counter: 0.8 }, rev: { fiddle: 0.3, counter: 0.45 } },
    china: { solo: ['trem', 'tune', 'drone', 'lion', ...CORE], inst: { trem: 'koto', tune: 'flute', drone: 'cello' }, vol: { tune: 0.45, drone: 1.1, trem: 1.1 }, rev: { tune: 0.35 } },
    germany: { solo: ['tune', 'tune2', 'chick', 'bass', 'gtr', 'punk'], inst: { tune: 'clarinet', tune2: 'horn', chick: 'accordion' }, vol: { tune2: 0.9, chick: 0.9 } },
    italy: { solo: ['trem', 'counter', 'chick', 'tamb', ...CORE], inst: { counter: 'accordion' }, vol: { counter: 0.8, chick: 1.2 } },
    japan: { solo: ['tune', 'counter', 'arp', 'taiko', ...CORE], inst: { tune: 'shamisen', counter: 'flute', arp: 'koto' }, vol: { counter: 0.8, arp: 1.6 }, rev: { counter: 0.45, tune: 0.3 } },
    morocco: { solo: ['tune', 'counter', 'drone', 'darbuka', ...CORE], inst: { tune: 'sitar', counter: 'oboe', drone: 'cello' }, vol: { counter: 0.75, drone: 1.2 }, rev: { tune: 0.3, counter: 0.35 } },
    france: { solo: ['tune', 'counter', 'chick', ...CORE], inst: { tune: 'accordion', counter: 'violin' }, vol: { counter: 0.75, chick: 1.2, kit: 0.8 }, rev: { tune: 0.25 } },
    uk: { solo: ['tune', 'tune2', 'counter', 'chick', ...CORE], inst: { tune: 'brass', tune2: 'horn', counter: 'trombone', chick: 'piano' }, vol: { tune: 0.85, tune2: 0.9, counter: 0.9, chick: 1.0 } },
    canada: { solo: ['fiddle', 'counter', 'chick', ...CORE], inst: { chick: 'piano' }, vol: { counter: 0.8, chick: 1.0 } },
    heli: { solo: ['tune', 'pad', 'bass'], inst: { tune: 'vibes', pad: 'warmpad' }, vol: { tune: 0.6, pad: 1.3, bass: 0.55 }, rev: { tune: 0.4 }, level: 0.7 },
    harry: { solo: ['tune', 'pad', 'bass', 'drone'], inst: { tune: 'mutetrumpet', pad: 'slowstrings', drone: 'cello' }, vol: { tune: 0.65, pad: 1.3, bass: 0.5, drone: 0.9 }, rev: { tune: 0.45 }, level: 0.7 },
    cutscene: { solo: ['tune', 'counter', 'arp', 'pad', 'bass'], inst: { tune: 'horn', counter: 'slowstrings', pad: 'slowstrings', arp: 'harp' }, vol: { tune: 0.8, counter: 0.8, pad: 1.1, arp: 1.6, bass: 0.5 }, rev: { tune: 0.4 }, level: 0.75 },
    boss: { solo: ['tune', 'tune2', 'counter', 'pad', 'arp', 'taiko', ...CORE], vol: { kit: 1.15, gtr: 1.15, taiko: 1.2 } },
  },
};

// =====================================================================================================================
// THE TOLERANCE TOUR

export const T_A: Bar[] = ['Cmaj7', 'Bb/C', 'Fmaj7/C', 'Cmaj7', 'Am7', 'Dm7', 'Fmaj7', ['Gsus', 'G']];
const T_A2: Bar[] = ['Cmaj7', 'Bb/C', 'Fmaj7/C', 'Cmaj7', 'Am7', 'Dm7', ['Fmaj7', 'G'], 'Cmaj7'];
const T_B: Bar[] = ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7', 'Bbmaj7', 'Am7', 'Dm7', ['Gsus', 'G']];
const T_ALL = [...T_A, ...T_A2, ...T_B];

/** The tour's tune (Harry's song opens on its first four bars). */
export const TM_A = ['o5 e2. g4', 'o5 f2 d2', 'o5 c2 o4 a4 o5 c4', 'o4 b1', 'o5 c2. e4', 'o5 d2 f4 a4', 'o5 g2 e4 c4', 'o5 d1'];
const TM_A2 = [...TM_A.slice(0, 6), 'o5 c2 d2', 'o5 e1'];
const TM_B = ['o5 a2. g4', 'o5 g2 e2', 'o5 f2. e4', 'o5 e1', 'o5 d2. f4', 'o5 e2 c2', 'o5 d2 a4 f4', 'o5 d2 o4 b2'];

/** The 12-string's arpeggio: the bass note, then up and down the chord in eighths. */
export const tourGtr = (prog: Bar[]) => pat(prog, 'B8 08 18 28 38 28 18 28', 48);
const SITAR8 = ['r1', 'r1', 'r1', 'r2 o4 e8 g8 a8 b8', 'r1', 'r1', 'r1', 'r2 o5 d8 c8 o4 a8 g8'];
const T_KIT = '{kh}8 ?h8 h8 ?h8 {sh}8 ?h8 h8 ?h8';
const TURN_BRASS = ['o2 a12. o3 d24 f12 a2.', 'r1', 'o3 d12. f24 a12 o4 d2.', 'r1'];
const TROLL = 'o2 _v50 [d32]8 _v70 [d32]8 _v90 [d32]8 _v115 [d32]8';

export const SEQ_HELI: Song = {
  title: 'The Tolerance Tour',
  bpm: 120,
  reverb: 'hall',
  reverbMix: 0.9,
  delay: { beats: 1.5, feedback: 0.35, tone: 2600 },
  parts: {
    flute: { inst: 'flute', pan: 0, rev: 0.4, dly: 0.2, vol: 0.85, mml: join(['_v92'], TM_A, TM_A2, ['_v96'], TM_B) },
    gtr: { inst: 'steelgtr', pan: -0.3, rev: 0.3, cho: 0.45, vol: 0.55, mml: join(['_v82'], tourGtr(T_ALL)) },
    pad: { inst: 'warmpad', pan: 0, rev: 0.45, vol: 0.3, mml: join(['_v80'], pads(T_ALL, 55)) },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.65, mml: join(['q7 _v90'], pat(T_ALL, 'B4. B8 24 B4', 33)) },
    sitar: { inst: 'sitar', pan: 0.3, rev: 0.4, dly: 0.25, vol: 0.5, mml: join(['_v88'], SITAR8, SITAR8, SITAR8) },
    kit: { inst: 'kick', drums: true, rev: 0.2, vol: 0.5, mml: join(['_v85'], sec(8, T_KIT, T_KIT), sec(8, T_KIT, '{kh}8 ?h8 h8 ?h8 {sh}8 ?h8 (tom3)8 (tom4)8'), sec(8, T_KIT, T_KIT)) },
    perc: { inst: 'shaker', drums: true, pan: 0.2, rev: 0.25, vol: 0.35, mml: join(['_v75'], rep('?z8 z8 ?z8 z8 ?z8 z8 ?z8 z8', 24)) },
    drone: { inst: 'cello', pan: -0.1, rev: 0.35, vol: 0.55, mml: join(['_v95'], rep('o2 d1', 24)) },
    trem: { inst: 'strings', pan: 0.15, rev: 0.4, vol: 0.4, mml: join(['_v80'], rep('_e35 _e110/1^1^1 o3 [{d e-}32]32 | o3 [{d e-}32]32 | o3 [{d e-}32]32 | _e127 o3 [{d e-}32]32', 6)) },
    lowbrass: { inst: 'trombone', pan: -0.2, rev: 0.35, vol: 0.6, mml: join(['_v105'], rep(TURN_BRASS.join(' | '), 6)) },
    timp: { inst: 'timpani', pan: 0.1, rev: 0.35, vol: 0.6, mml: join(rep(`o2 _v100 d4 r2. | r1 | o2 _v90 d4 r2. | ${TROLL}`, 6)) },
  },
  arrangements: {
    main: { solo: ['flute', 'gtr', 'pad', 'bass', 'sitar', 'kit', 'perc'] },
    pad: { solo: ['flute', 'gtr', 'pad', 'bass', 'kit', 'perc'], lowpass: 2400, level: 0.55 },
    board: { solo: ['flute', 'gtr', 'pad', 'bass', 'kit', 'perc'], level: 0.8 },
    tour: { solo: ['flute', 'gtr', 'pad', 'bass', 'sitar', 'kit', 'perc'], level: 0.8 },
    turn: { solo: ['drone', 'trem', 'lowbrass', 'timp'], level: 0.9 },
  },
};
