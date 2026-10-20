// The Mega Man kit: the helpers the high-energy rework of Hollywood Land, Foreign Lands, Wilderness Land, Fairy Land and
// Cartoon Land (and their fights) is written with. Chord symbols are read as they're written ('Cmaj7', 'F#m7b5',
// 'Ab/C'), so a part is a pattern run over a progression: the pumping octave bass, the sixteenth arpeggios, the power
// chords' eighths, stabs and pads all come from one `pat()`; the melodies are written by hand, and `harm()` gives a
// line a diatonic third (or sixth) under it for the twin leads. Every note this writes carries its own octave, so no
// stray > can drift a part.

export type Bar = string | [string, string];
export const join = (...parts: string[][]) => parts.flat().join(' | ');
export const rest = (n: number) => Array.from({ length: n }, () => 'r1');
export const rep = <T>(x: T, n: number): T[] => Array.from({ length: n }, () => x);
/** Everything n octaves up (each o-number moved). */
export const up = (bars: string[], n = 1) => bars.map(b => b.replace(/o(\d)/g, (_, k) => `o${Number(k) + n}`));
export const g1 = (b: Bar) => (typeof b === 'string' ? b : b[0]);
export const g2 = (b: Bar) => (typeof b === 'string' ? b : b[1]);

// ---- Pitches ----
const PC: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const NAMES = ['c', 'c+', 'd', 'd+', 'e', 'f', 'f+', 'g', 'g+', 'a', 'a+', 'b'];
const octOf = (m: number) => Math.floor(m / 12) - 1;
const nameOf = (m: number) => NAMES[((m % 12) + 12) % 12];
/** A MIDI note as MML, with its octave. */
export const nm = (m: number, len: string, pre = '') => `o${octOf(m)} ${pre}${nameOf(m)}${len}`;
/** A chord of MIDI notes as MML (lowest first). */
export const chordStr = (ms: number[], len: string, pre = '') => {
  const s = [...ms].sort((a, b) => a - b);
  let o = octOf(s[0]);
  let out = `o${o} ${pre}{`;
  for (const m of s) { const k = octOf(m); out += '>'.repeat(Math.max(0, k - o)) + nameOf(m) + ' '; o = k; }
  return `${out.trim()}}${len}`;
};
/** The lowest MIDI note at or above lo with this pitch class. */
const fit = (pc: number, lo: number) => lo + ((((pc - lo) % 12) + 12) % 12);
/** A length in beats ('8', '4.', '2^8'). */
export const beats = (len: string) => len.split('^').reduce((sum, one) => {
  const n = parseInt(one, 10);
  let b = 4 / n, add = b / 2;
  for (const ch of one.slice(String(n).length)) if (ch === '.') { b += add; add /= 2; }
  return sum + b;
}, 0);

// ---- Chords ----
const QUAL: Record<string, number[]> = {
  '': [0, 4, 7], m: [0, 3, 7], '5': [0, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], '6': [0, 4, 7, 9], m6: [0, 3, 7, 9],
  dim: [0, 3, 6], dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10], aug: [0, 4, 8], sus: [0, 5, 7], sus4: [0, 5, 7], sus2: [0, 2, 7], '7sus': [0, 5, 7, 10],
  add9: [0, 4, 7, 14], madd9: [0, 3, 7, 14], '9': [0, 4, 7, 10, 14], m9: [0, 3, 7, 10, 14], maj9: [0, 4, 7, 11, 14], '7b9': [0, 4, 7, 10, 13],
  mmaj7: [0, 3, 7, 11], '7#5': [0, 4, 8, 10], '7b5': [0, 4, 6, 10], 'maj7#11': [0, 4, 7, 11, 18],
};
export interface Ch { root: number; bass: number; iv: number[] }
const memo = new Map<string, Ch>();
const pcOf = (l: string, acc: string) => (PC[l.toLowerCase()] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0) + 12) % 12;
/** A chord symbol: its root, the note under it, and its intervals up from the root. */
export const ch = (sym: string): Ch => {
  let c = memo.get(sym);
  if (c) return c;
  const m = /^([A-G])([#b]?)([^/]*)(?:\/([A-G])([#b]?))?$/.exec(sym);
  if (!m || !QUAL[m[3]]) throw new Error(`mmkit: chord ${sym}`);
  const root = pcOf(m[1], m[2]);
  c = { root, bass: m[4] ? pcOf(m[4], m[5]) : root, iv: QUAL[m[3]] };
  memo.set(sym, c);
  return c;
};
/** The chord close-voiced up from lo (every tone once). */
export const voice = (sym: string, lo: number) => {
  const c = ch(sym);
  const pcs = [...new Set(c.iv.map(i => (c.root + i) % 12))];
  return pcs.map(p => fit(p, lo)).sort((a, b) => a - b);
};
/** One chord, close-voiced from lo, as MML (a single hit or hold, unlike pat which fills the bar). */
export const cx = (sym: string, lo: number, len: string, pre = '') => chordStr(voice(sym, lo), len, pre);
/** A chord's tone k up from its root at or above lo (0 the root, 1 the third, 2 the fifth, 3 the seventh...; past the
 *  top it carries on an octave up). */
export const tone = (sym: string, k: number, lo: number) => {
  const c = ch(sym), r = fit(c.root, lo), n = c.iv.length;
  return r + c.iv[((k % n) + n) % n] + 12 * Math.floor(k / n);
};

// ---- Patterns over a progression ----
// Tokens: B (the note under the chord), R (the root), 0-5 (chord tones up from the root), X (the whole chord,
// close-voiced from the chord's own floor), each followed by ' (an octave up) or , (down) and a length; r (rest);
// ! and ? before a note accent or ghost it. _commands and @instruments pass through.
const TOKEN = /^([!?]*)([BRX0-9r])(['",]*)([\d.^]+)$/;
/** One chord's worth of a pattern: `beats` long, the pattern cycled (a half bar gets its first half). */
const once = (sym: string, toks: string[], n: number, lo: number, xlo: number) => {
  const out: string[] = [];
  let t = 0, i = 0, guard = 0;
  while (t < n - 1e-6 && guard++ < 512) {
    const tok = toks[i++ % toks.length];
    if (tok.startsWith('_') || tok.startsWith('@')) { out.push(tok); continue; }
    const m = TOKEN.exec(tok);
    if (!m) throw new Error(`mmkit: pattern token ${tok}`);
    const [, pre, what, shift, len] = m;
    const b = beats(len);
    const take = n - t < b - 1e-6 ? n - t : b;
    const L = take === b ? len : lenOf(take);
    const sh = 12 * ([...shift].filter(x => x === "'").length - [...shift].filter(x => x === ',').length);
    if (what === 'r') out.push(`r${L}`);
    else if (what === 'X') out.push(chordStr(voice(sym, xlo + sh), L, pre));
    else {
      const c = ch(sym);
      const m0 = what === 'B' ? fit(c.bass, lo) : what === 'R' ? fit(c.root, lo) : tone(sym, Number(what), lo);
      out.push(nm(m0 + sh, L, pre));
    }
    t += take;
  }
  return out.join(' ');
};
const LENS: [number, string][] = [[4, '1'], [3, '2.'], [2, '2'], [1.5, '4.'], [1, '4'], [0.75, '8.'], [0.5, '8'], [0.25, '16']];
const lenOf = (b: number) => {
  const parts: string[] = [];
  let left = b;
  for (const [v, s] of LENS) while (left >= v - 1e-6) { parts.push(s); left -= v; }
  return parts.join('^');
};
/** A pattern run over a progression, a bar a chord (or two a bar, half each). `lo` is the floor its notes are built
 *  up from; `xlo` the chords' (X). `perBar` beats in a bar (3 for 3/4). */
export const pat = (prog: Bar[], pattern: string, lo: number, xlo = lo, perBar = 4) => {
  const toks = pattern.trim().split(/\s+/);
  return prog.map(b => (typeof b === 'string' ? once(b, toks, perBar, lo, xlo) : `${once(b[0], toks, perBar / 2, lo, xlo)} ${once(b[1], toks, perBar / 2, lo, xlo)}`));
};
/** The chords held (a pad), close-voiced from lo. */
export const pads = (prog: Bar[], lo: number, perBar = 4) => pat(prog, `X${lenOf(perBar)}`, lo, lo, perBar);

// ---- Melodies ----
interface MTok { kind: 'note' | 'other'; text: string; m?: number; pre?: string; len?: string; slur?: string }
const NOTE_TOK = /^([!?]*)([a-g])([+#-]*)([\d.^]*)(~?)$/;
const lex = (bar: string): MTok[] => {
  let o = 4;
  const out: MTok[] = [];
  for (const tok of bar.trim().split(/\s+/)) {
    if (!tok) continue;
    const om = /^o(\d)$/.exec(tok);
    if (om) { o = Number(om[1]); continue; }
    if (tok === '>') { o++; continue; }
    if (tok === '<') { o--; continue; }
    const m = NOTE_TOK.exec(tok);
    if (m) {
      let p = PC[m[2]];
      for (const a of m[3]) p += a === '-' ? -1 : 1;
      out.push({ kind: 'note', text: tok, m: 12 * (o + 1) + p, pre: m[1], len: m[4], slur: m[5] });
    } else out.push({ kind: 'other', text: tok });
  }
  return out;
};
const unlex = (ts: MTok[]) => ts.map(t => (t.kind === 'note' ? `${nm(t.m!, t.len!, t.pre)}${t.slur}` : t.text)).join(' ');
/** A scale by its tonic and mode. */
export const scale = (tonic: string, mode: 'major' | 'minor' | 'harmonic' | 'dorian' | 'mixolydian' | 'phrygian') => {
  const t = pcOf(tonic[0].toUpperCase(), tonic.slice(1) === '#' || tonic.slice(1) === '+' ? '#' : tonic.slice(1) === 'b' || tonic.slice(1) === '-' ? 'b' : '');
  const steps = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], harmonic: [0, 2, 3, 5, 7, 8, 11], dorian: [0, 2, 3, 5, 7, 9, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10] }[mode];
  return steps.map(s => (t + s) % 12);
};
/** k steps along the scale from m (a note off the scale moves with the one under it). */
const stepIn = (m: number, k: number, sc: number[]) => {
  let base = m, off = 0;
  while (!sc.includes(((base % 12) + 12) % 12)) { base--; off++; }
  let n = base;
  const dir = Math.sign(k);
  for (let i = 0; i < Math.abs(k); i++) { do n += dir; while (!sc.includes(((n % 12) + 12) % 12)); }
  return n + off;
};
/** The line a diatonic third under (k = -2), a sixth under (-5), a third over (2)... in the scale (one for the lot, or
 *  one a bar: a dominant's bar in its harmonic minor keeps its leading tone). */
export const harm = (bars: string[], sc: number[] | number[][], k = -2) => bars.map((b, i) => {
  const s = Array.isArray(sc[0]) ? (sc as number[][])[i % sc.length] : (sc as number[]);
  return unlex(lex(b).map(t => (t.kind === 'note' ? { ...t, m: stepIn(t.m!, k, s) } : t)));
});
/** The line transposed (semitones). */
export const tp = (bars: string[], k: number) => bars.map(b => unlex(lex(b).map(t => (t.kind === 'note' ? { ...t, m: t.m! + k } : t))));
/** The line with every note made staccato-short (an eighth at most, the rest of its length rested). */
export const chop = (bars: string[]) => bars.map(b => lex(b).map(t => {
  if (t.kind !== 'note') return t.text;
  const total = beats(t.len || '8');
  if (total <= 0.5) return `${nm(t.m!, t.len!, t.pre)}`;
  return `${nm(t.m!, '8', t.pre)} r${lenOf(total - 0.5)}`;
}).join(' '));

// ---- Drums ----
/** In on a crash: the groove's first kick-and-hat (or kick-and-ride, kick alone) gets the crash instead. */
export const crash = (g: string) => (/\{k[hi]\}/.test(g) ? g.replace(/\{k[hi]\}/, '{kx}') : g.replace(/^(!?)k/, '$1{kx}'));
/** A section of the kit: in on a crash, the groove, a fill in its last bar. */
export const sec = (n: number, groove: string, fill: string) => [crash(groove), ...rep(groove, n - 2), fill];
/** The grooves (a bar each). */
export const KIT = {
  /** Mega Man: kick on one and the and of two, the snare on two and four, sixteenth hats. */
  mm: '{kh}16 ?h16 h16 ?h16 {sh}16 ?h16 h16 {kh}16 ?h16 h16 {kh}16 ?h16 {sh}16 ?h16 h16 ?h16',
  /** Rock eighths. */
  rock: '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8',
  /** Driving: kick on every eighth but the backbeats. */
  drive: '{kh}8 {kh}8 {sh}8 {kh}8 {kh}8 {kh}8 {sh}8 h8',
  /** On the ride. */
  ride: '{ki}8 i8 {si}8 i8 {ki}8 {ki}8 {si}8 i8',
  /** Polka-punk: kick, snare, kick, snare. */
  punk: '{kh}8 {sh}8 {kh}8 {sh}8 {kh}8 {sh}8 {kh}8 {sh}8',
  /** Half time. */
  half: '{kh}8 h8 h8 h8 {sh}8 h8 h8 {kh}8',
  /** Four on the floor, the hats open on the offbeats. */
  disco: '{kh}8 o8 {ks}8 o8 {kh}8 o8 {ks}8 o8',
  /** Double kick under a backbeat. */
  dbl: '{kh}16 k16 k16 k16 {ks}16 k16 k16 k16 {kh}16 k16 k16 k16 {ks}16 k16 k16 k16',
  /** A gallop. */
  gallop: '{kh}8 k16 k16 {sh}8 k16 k16 {kh}8 k16 k16 {sh}8 k16 k16',
};
export const FILL = {
  /** Two beats of the groove, then sixteenths down the toms. */
  toms: '{kh}8 h8 {sh}8 h8 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 (tom4)16',
  /** Two beats, then the snare in sixteenths, accented. */
  snare: '{kh}8 h8 {sh}8 h8 !s16 s16 s16 s16 !s16 s16 !s16 !s16',
  /** A whole bar: the snare, then all the toms, then two hits. */
  big: 's16 s16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16 !{ks}8 !{ks}8',
  /** A whole bar of snare rolling up. */
  roll: '?s16 ?s16 ?s16 ?s16 s16 s16 s16 s16 s16 s16 s16 s16 !s16 !s16 !s16 !s16',
  /** Stops: hits on the eighths of beats three and four. */
  hits: '{kh}8 h8 {sh}8 h8 !{kx}8 r8 !{kx}8 !{ks}8',
};
/** A timpani roll over a bar (o is the octave-note: 'o2 a'). */
export const troll = (note: string) => `${note.split(' ')[0]} [?${note.split(' ')[1]}32]8 [?${note.split(' ')[1]}32]8 [${note.split(' ')[1]}32]8 [!${note.split(' ')[1]}32]8`;
