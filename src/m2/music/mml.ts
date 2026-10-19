// Meathead 2's MML: Meathead 1's dialect (m1/game/platform/music/mml.ts: every M1 line parses the same here) and the
// extensions a late-90s score needs: velocity, accents and ghost notes, expression swells, per-note pan, bends,
// falls, portamento, vibrato depth, legato slurs, swing, effect sends, transposition, an instrument change mid-line,
// any drum by name. The whole dialect is documented for the composers in MML.md.

import { KITS } from './bank/index';

export interface NoteEv {
  /** When (beats from the part's start) and how long (beats). */
  t: number; d: number;
  /** A MIDI note, or a drum's name. */
  n: number | string;
  /** Velocity 0..1. */
  v: number;
  /** How much of the length it's held (1 = all of it; a slurred note a little over). */
  gate: number;
  /** Played on this instrument instead of the part's (@name). */
  inst?: string;
  /** Per-note pan offset (-1..1). */
  pan?: number;
  /** Bends into the note from this many semitones off, over bendT beats. */
  bend?: number; bendT?: number;
  /** Falls this many semitones at its end, over fallT beats. */
  fall?: number; fallT?: number;
  /** Vibrato depth (cents), overriding the instrument's. */
  vib?: number;
  /** Slurred into from the note before: no new attack. */
  slur?: boolean;
}
export type CtrlKind = 'expr' | 'rev' | 'dly' | 'cho';
/** A control change: expression or a send level (0..1), ramped over `ramp` beats (0: straight away). */
export interface CtrlEv { t: number; k: CtrlKind; v: number; ramp: number }
export interface Parsed { notes: NoteEv[]; ctrl: CtrlEv[]; length: number }
export interface ParseOpts { drums?: boolean; kit?: string; swing?: number; grid?: number }

const NOTE: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

/** Swing: offbeats of the grid pushed late (0 straight, 1 a full triplet feel); a time warped to where it's played. */
const warp = (t: number, swing: number, grid: number) => {
  if (!swing) return t;
  const pair = 8 / grid, h = pair / 2, d = (swing * h) / 3;
  const base = Math.floor(t / pair + 1e-9) * pair, u = t - base;
  return base + (u < h ? (u * (h + d)) / h : h + d + ((u - h) * (h - d)) / h);
};

export const parseMML = (src: string, o: ParseOpts = {}): Parsed => {
  const s = src.toLowerCase();
  const drums = !!o.drums;
  const kit = { ...KITS.acoustic, ...(o.kit ? KITS[o.kit] : {}) };
  let i = 0;
  let octave = 4, len = 8, vel = 12 / 15, gate = 7 / 8, t = 0;
  let swing = o.swing ?? 0, grid = o.grid ?? 8;
  let pan: number | undefined, vib: number | undefined, inst: string | undefined;
  let glide = 0, tr = 0, prevN: number | null = null;
  let accent = 1, bend: [number, number] | null = null, fall: [number, number] | null = null, slurNext = false;
  let lastPushed: NoteEv[] = [];
  const notes: NoteEv[] = [], ctrl: CtrlEv[] = [];

  const num = () => { let v = ''; while (i < s.length && /[0-9]/.test(s[i])) v += s[i++]; return v ? Number(v) : NaN; };
  /** A signed decimal (_b-1.5, _p-40). */
  const snum = () => { let v = ''; if (s[i] === '-' || s[i] === '+') v += s[i++]; while (i < s.length && /[0-9.]/.test(s[i])) v += s[i++]; return v && v !== '-' && v !== '+' ? Number(v) : NaN; };
  /** A length: 4, 8., and any ^ties; in beats (a quarter note is one). */
  const length = () => {
    const readOne = () => {
      const n = num();
      let beats = 4 / (Number.isNaN(n) ? len : n);
      let add = beats / 2;
      while (s[i] === '.') { beats += add; add /= 2; i++; }
      return beats;
    };
    let beats = readOne();
    while (s[i] === '^') { i++; beats += readOne(); }
    return beats;
  };
  /** An optional "/length" after a command (a ramp, a bend's time), or the default. */
  const slash = (def: number) => { if (s[i] === '/') { i++; return length(); } return def; };
  const pitch = () => {
    let n = NOTE[s[i++]];
    while (s[i] === '+' || s[i] === '#' || s[i] === '-') { n += s[i] === '-' ? -1 : 1; i++; }
    return (octave + 1) * 12 + n + tr;
  };
  /** Puts down a note (or a chord's notes) at t for d beats, swung, with whatever's pending on it. */
  const push = (ns: (number | string)[], d: number) => {
    const a = warp(t, swing, grid), b = warp(t + d, swing, grid);
    const v = Math.min(1, vel * accent);
    const out: NoteEv[] = [];
    for (const n of ns) {
      const e: NoteEv = { t: a, d: b - a, n, v, gate: drums ? 1 : gate };
      if (inst) e.inst = inst;
      if (pan !== undefined) e.pan = pan;
      if (vib !== undefined) e.vib = vib;
      if (typeof n === 'number') {
        if (bend) { e.bend = bend[0]; e.bendT = bend[1]; }
        else if (glide > 0 && prevN !== null && ns.length === 1 && prevN !== n) { e.bend = prevN - n; e.bendT = glide; }
        if (fall) { e.fall = fall[0]; e.fallT = fall[1]; }
      }
      if (slurNext) e.slur = true;
      notes.push(e); out.push(e);
    }
    const last = ns[ns.length - 1];
    if (typeof last === 'number') prevN = last;
    accent = 1; bend = null; fall = null; slurNext = false;
    lastPushed = out;
    t += d;
  };
  const ctl = (k: CtrlKind, v: number, ramp: number) => { if (!Number.isNaN(v)) ctrl.push({ t: warp(t, swing, grid), k, v: Math.max(0, Math.min(1, v / 127)), ramp }); };
  /** A drum by letter (this part's kit) or by (name). */
  const drumAt = (): string | null => {
    const c = s[i];
    if (c === '(') { const close = s.indexOf(')', i); const name = s.slice(i + 1, close < 0 ? s.length : close).trim(); i = close < 0 ? s.length : close + 1; return name; }
    if (kit[c]) { i++; return kit[c]; }
    return null;
  };

  const stack: { at: number; count: number }[] = [];
  while (i < s.length) {
    const ch = s[i];
    if (/\s|\|/.test(ch)) { i++; continue; }
    if (ch === '[') { i++; stack.push({ at: i, count: 0 }); continue; }
    if (ch === ']') {
      i++;
      const times = num();
      const top = stack[stack.length - 1];
      if (!top) continue;
      top.count++;
      if (top.count < (Number.isNaN(times) ? 2 : times)) { i = top.at; continue; }
      stack.pop();
      continue;
    }
    // (extensions first: they're all symbols, so they mean the same in a drum part)
    if (ch === '!') { i++; accent = 1.35; continue; }
    if (ch === '?') { i++; accent = 0.45; continue; }
    if (ch === '~') { i++; for (const e of lastPushed) e.gate = 1.04; slurNext = true; continue; }
    if (ch === '@') { i++; let name = ''; while (i < s.length && /[a-z0-9]/.test(s[i])) name += s[i++]; inst = name || undefined; continue; }
    if (ch === '_') {
      i++;
      const c = s[i++];
      switch (c) {
        case 'v': { const v = num(); if (!Number.isNaN(v)) vel = Math.max(0, Math.min(127, v)) / 127; break; }
        case 'e': { const v = num(); ctl('expr', v, slash(0)); break; }
        case 'r': { const v = num(); ctl('rev', v, slash(0)); break; }
        case 'd': { const v = num(); ctl('dly', v, slash(0)); break; }
        case 'c': { const v = num(); ctl('cho', v, slash(0)); break; }
        case 'p': { const v = snum(); pan = Number.isNaN(v) || v === 0 ? undefined : Math.max(-1, Math.min(1, v / 100)); break; }
        case 'b': { const v = snum(); const d = slash(0.25); if (!Number.isNaN(v) && v) bend = [v, d]; break; }
        case 'f': { const v = snum(); const d = slash(0.5); if (!Number.isNaN(v) && v) fall = [v, d]; break; }
        case 'g': { if (s[i] === '0') { i++; glide = 0; } else glide = length(); break; }
        case 'm': { const v = num(); vib = Number.isNaN(v) ? undefined : v; break; }
        case 'q': { const v = num(); if (!Number.isNaN(v)) gate = Math.max(1, Math.min(100, v)) / 100; break; }
        case 'w': { const v = num(); if (!Number.isNaN(v)) swing = Math.max(0, Math.min(100, v)) / 100; if (s[i] === ',') { i++; const g = num(); if (g === 8 || g === 16) grid = g; } break; }
        case 'k': { const v = snum(); if (!Number.isNaN(v)) tr = Math.round(v); break; }
        default: break;
      }
      continue;
    }
    if (drums) {
      if (ch === '{') {
        i++;
        const hits: string[] = [];
        while (i < s.length && s[i] !== '}') { if (/\s/.test(s[i])) { i++; continue; } const d = drumAt(); if (d) hits.push(d); else i++; }
        i++;
        push(hits, length());
        continue;
      }
      if (ch === '(' || kit[ch]) { const d = drumAt(); if (d) push([d], length()); continue; }
    }
    if (ch === 'o') { i++; octave = num(); continue; }
    if (ch === '>') { i++; octave++; continue; }
    if (ch === '<') { i++; octave--; continue; }
    if (ch === 'l') { i++; len = num(); continue; }
    if (ch === 'v') { i++; vel = num() / 15; continue; }
    if (ch === 'q') { i++; gate = num() / 8; continue; }
    if (ch === 'r') { i++; const d = length(); t += d; continue; }
    if (ch === '{') {
      i++;
      const ns: number[] = [];
      const saved = octave;
      while (i < s.length && s[i] !== '}') {
        const c = s[i];
        if (/\s/.test(c)) { i++; continue; }
        if (c === '>') { octave++; i++; continue; }
        if (c === '<') { octave--; i++; continue; }
        if (c in NOTE) { ns.push(pitch()); continue; }
        i++;
      }
      i++;
      octave = saved;
      push(ns, length());
      continue;
    }
    if (!drums && ch in NOTE) { const n = pitch(); push([n], length()); continue; }
    i++; // (anything else: skipped)
  }
  return { notes, ctrl, length: t };
};
