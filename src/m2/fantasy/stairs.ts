// THE ENCHANTED STAIRCASES: Fairy Land's new traversal mechanic (the user's "surprise me"; the spec's fill-in). The
// Hogwarts sort: a flight of stairs pivoting at one end, swinging on a schedule to dock at a different landing every few
// seconds. Before it moves, the TELL: it creaks and glows (gold along its stringer, sparkles off its treads) for a
// beat. Stood on it as it swings, he goes with it (the point of it he's on carried round the pivot); he can walk up
// and down it, jump on and off it, and time it to reach places. Its treads stay level as it turns (it's enchanted),
// each one lit along its top (standable reads standable); the walking surface is the line along the tread noses.
//
// How it's stood on: a one-way ledge kept under him (his feet's x on the line) each frame, before he moves; on it, he's
// snapped to the line as he walks up or down it, and carried as it turns. From under it, it's a jump-through (it's
// a staircase seen side on: he hops up onto it). The cast don't use them (they keep to the landings).
//
// Two ways one runs:
//   - on the clock: round its docks in turn (`hold` frames at each, the last TELL of them the tell, `swing` frames
//     between), out of step with its neighbors by `phase`;
//   - `ride`: it waits at its first dock till he's been stood on it that long, then (the tell) swings away to its
//     second, carrying him (the one that swings away mid-climb); holds; swings back once he's off it.
//
// Every section can place them: makeStairs(state, defs) in build, updateStairs(ctx, list) first thing in update,
// drawStairs(c, state, list) in drawBack. stairEnd(def, k) is where its free end docks at dock k (put the landing there).

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import type { Block } from '../../m1/types';
import { envSound } from '../bossQuiet';
import { onScreen } from './kit';

type Ctx = CanvasRenderingContext2D;

export interface StairDef {
  /** The pivot: its x, and the walking surface's y there (world). */
  px: number; py: number;
  /** How long the flight is, pivot to free end (px along it). */
  len: number;
  /** The angles it docks at, in turn (radians: 0 runs right, a quarter turn + runs straight down; so -0.6 runs up to
   *  the right from the pivot, Math.PI + 0.6 up to the left). Neighbors close (never through straight up or down:
   *  keep every dock and everything between within ~45 degrees of level, so it's always walkable). */
  docks: number[];
  /** Frames docked at each (the tell's in the last TELL of them), frames swinging from one to the next. */
  hold: number; swing: number;
  /** Frames into its cycle it starts (out of step with its neighbors). */
  phase?: number;
  /** Waits at docks[0] till he's stood on it this many frames, then swings to docks[1] (see above). */
  ride?: number;
  /** Its stone and its runner (the tread's lit lip), if not the castle's. */
  stone?: string; lip?: string;
}

export interface Stair {
  d: StairDef;
  ang: number;
  /** The tell's glow (0..1), and swinging now. */
  tell: number; moving: boolean;
  b: Block;
  /** 'ride' staircases: where it is in its run, frames in it, frames he's been on it (or off it). */
  ride: 'rest' | 'tell' | 'out' | 'away' | 'back'; rt: number; onT: number; offT: number;
  /** Was he on it last frame (for the sounds once a move starts). */
  lastPhase: string;
}

/** How long the tell is before a move (frames). */
export const TELL = 54;
const AWAY = -99999;

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const dirOf = (a: number) => ({ x: Math.cos(a), y: Math.sin(a) });
/** Where its free end is at angle a. */
export const endAt = (d: StairDef, a: number) => ({ x: d.px + Math.cos(a) * d.len, y: d.py + Math.sin(a) * d.len });
/** Where its free end docks at dock k (put that landing's near edge there, its top at y). */
export const stairEnd = (d: StairDef, k: number) => endAt(d, d.docks[k]);

export const makeStairs = (state: GameState, defs: StairDef[]): Stair[] => defs.map((d, i) => {
  const b: Block = { x: 0, y: AWAY, w: 28, h: 12, type: 'platform', oneWay: true, hidden: true, tag: `fa-stair-${i}` } as Block;
  state.blocks.push(b);
  return { d, ang: d.docks[0], tell: 0, moving: false, b, ride: 'rest', rt: 0, onT: 0, offT: 0, lastPhase: 'hold' };
});

/** Is he stood on it (on its ledge, now)? */
export const onStair = (state: GameState, s: Stair) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  return s.b.y !== AWAY && p.health > 0 && p.vel.y >= 0 && Math.abs(feet - s.b.y) <= 2 && cx >= s.b.x - 2 && cx <= s.b.x + s.b.w + 2;
};

/** Its angle and tell this frame, off the clock (or its ride). */
const step = (state: GameState, s: Stair, on: boolean): string => {
  const d = s.d;
  if (d.ride !== undefined) {
    s.rt++;
    if (on) { s.onT++; s.offT = 0; } else { s.offT++; s.onT = 0; }
    const a0 = d.docks[0], a1 = d.docks[1] ?? a0;
    switch (s.ride) {
      case 'rest': s.ang = a0; s.tell = 0; s.moving = false; if (s.onT >= d.ride) { s.ride = 'tell'; s.rt = 0; } return 'hold';
      case 'tell': s.ang = a0; s.tell = s.rt / TELL; if (s.rt >= TELL) { s.ride = 'out'; s.rt = 0; } return 'tell';
      case 'out': s.tell = 0; s.moving = true; s.ang = a0 + (a1 - a0) * ease(Math.min(1, s.rt / d.swing)); if (s.rt >= d.swing) { s.ride = 'away'; s.rt = 0; s.moving = false; } return 'swing';
      case 'away': s.ang = a1; s.tell = s.rt > d.hold - TELL ? Math.min(1, (s.rt - (d.hold - TELL)) / TELL) : 0; if (s.rt >= d.hold && s.offT > 20) { s.ride = 'back'; s.rt = 0; } return s.tell > 0 ? 'tell' : 'hold';
      case 'back': s.tell = 0; s.moving = true; s.ang = a1 + (a0 - a1) * ease(Math.min(1, s.rt / d.swing)); if (s.rt >= d.swing) { s.ride = 'rest'; s.rt = 0; s.moving = false; } return 'swing';
    }
  }
  const n = d.docks.length, per = d.hold + d.swing, t = (state.frame + (d.phase ?? 0)) % (per * n);
  const k = Math.floor(t / per), r = t - k * per;
  if (r < d.hold) {
    s.ang = d.docks[k]; s.moving = false;
    s.tell = r > d.hold - TELL ? (r - (d.hold - TELL)) / TELL : 0;
    return s.tell > 0 ? 'tell' : 'hold';
  }
  const a = d.docks[k], b = d.docks[(k + 1) % n];
  s.ang = a + (b - a) * ease((r - d.hold) / d.swing); s.moving = true; s.tell = 0;
  return 'swing';
};

/** Each frame, first thing in the section's update (before he moves): turn them, carry him round on one, keep its
 *  ledge under his feet. */
export const updateStairs = (ctx: FrameContext, list: Stair[]) => {
  const { state } = ctx, p = state.player;
  for (const s of list) {
    const d = s.d;
    const on = onStair(state, s);
    const before = s.ang;
    const phase = step(state, s, on);
    // (its sounds: the creak and the twinkle as the tell starts, the groan of the swing, the thunk of it docking)
    if (phase !== s.lastPhase) {
      const mid = endAt(d, s.ang);
      if (phase === 'tell') { envSound(state, mid.x, 'rumble', 0.32, 10); envSound(state, mid.x, 'twinkle', 0.28, 4); }
      else if (phase === 'swing') envSound(state, mid.x, 'rumble', 0.45, -2);
      else if (s.lastPhase === 'swing') envSound(state, mid.x, 'thud', 0.45, -8);
      s.lastPhase = phase;
    }
    const cx0 = p.pos.x + p.width / 2, feet0 = p.pos.y + p.height;
    // (on it: carried round with it, the same way along it)
    if (on && s.ang !== before) {
      const o = dirOf(before), n = dirOf(s.ang);
      const u = (cx0 - d.px) * o.x + (feet0 - d.py) * o.y;
      const nx = d.px + n.x * u, ny = d.py + n.y * u;
      p.pos.x += nx - cx0; p.pos.y += ny - feet0;
    }
    // (the ledge under him: where the line is at his x, if he's over the flight and on it or above it)
    const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    const c = Math.cos(s.ang), sn = Math.sin(s.ang);
    const e = endAt(d, s.ang), xa = Math.min(d.px, e.x), xb = Math.max(d.px, e.x);
    let y = AWAY, bx = 0, bw = 0;
    if (Math.abs(c) > 0.2 && cx > xa - 4 && cx < xb + 4 && !((p.dropThroughT ?? 0) > 0) && p.health > 0) {
      const u = Math.max(0, Math.min(d.len, (cx - d.px) / c));
      const ys = d.py + sn * u;
      if (on && Math.abs(feet - ys) < 18) { p.pos.y = ys - p.height; y = ys; }
      else if (feet <= ys + 6) y = ys;
      bx = Math.max(xa, cx - 14); bw = Math.min(xb, cx + 14) - bx;
      if (bw < 6) y = AWAY;
    }
    s.b.y = y; s.b.x = bx; s.b.w = Math.max(6, bw);
  }
};

/** Anybody on any of them (for a section that wants to know: a 'ride' line, say). */
export const ridingAny = (state: GameState, list: Stair[]) => list.find(s => onStair(state, s)) ?? null;

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world space, behind him): the balustrade behind, the stringer, the treads (level, lit along their tops),
// the iron pivot; the tell's glow and sparkles, a trail off the free end while it swings.

const INK = '#1A1028';
/** A stone's steps (shadow, shade, under, itself, lit), off its one color. */
const hexOf = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mixC = (a: string, b: string, k: number) => { const A = hexOf(a), B = hexOf(b); return `#${A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')}`; };
const shadeCache = new Map<string, string[]>();
const shades = (c: string) => { let s = shadeCache.get(c); if (!s) { s = [mixC(c, INK, 0.62), mixC(c, INK, 0.36), mixC(c, INK, 0.14), c, mixC(c, '#FFFFFF', 0.3)]; shadeCache.set(c, s); } return s; };
export const drawStairs = (c: Ctx, state: GameState, list: Stair[]) => {
  const f = state.frame;
  for (const s of list) {
    const d = s.d, e = endAt(d, s.ang);
    if (!onScreen(state, Math.min(d.px, e.x) - 40, Math.max(d.px, e.x) + 40)) continue;
    const dir = dirOf(s.ang), stone = d.stone ?? '#8E84A8', lip = d.lip ?? '#F2E2B8';
    const at = (u: number, up = 0) => ({ x: d.px + dir.x * u, y: d.py + dir.y * u - up });
    const S = shades(stone), OAK = ['#2A1A12', '#4A2E1E', '#6E4A30', '#946A44', '#BA9264'];
    const band = (o0: number, o1: number, col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(d.px, d.py + o0); c.lineTo(e.x, e.y + o0); c.lineTo(e.x, e.y + o1); c.lineTo(d.px, d.py + o1); c.closePath(); c.fill(); };
    // (the balustrade: turned balusters up off the stringer, an oak handrail along their tops, lit along its top, a
    // newel post at each end with a gold cap)
    for (let u = 12; u < d.len - 6; u += 16) {
      const q = at(u), x = Math.round(q.x), y = Math.round(q.y);
      c.fillStyle = INK; c.fillRect(x - 2, y - 33, 4, 31); c.fillRect(x - 3, y - 22, 6, 8);
      c.fillStyle = OAK[2]; c.fillRect(x - 1, y - 32, 2, 29); c.fillStyle = OAK[3]; c.fillRect(x - 2, y - 21, 4, 6); c.fillStyle = OAK[4]; c.fillRect(x - 2, y - 21, 1, 6);
    }
    c.lineCap = 'butt';
    c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(at(0, 35).x, at(0, 35).y); c.lineTo(at(d.len, 35).x, at(d.len, 35).y); c.stroke();
    c.strokeStyle = OAK[2]; c.lineWidth = 4; c.stroke();
    c.strokeStyle = OAK[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(at(0, 37).x, at(0, 37).y); c.lineTo(at(d.len, 37).x, at(d.len, 37).y); c.stroke();
    for (const u of [2, d.len - 2]) { const q = at(u); c.fillStyle = INK; c.fillRect(Math.round(q.x - 4), Math.round(q.y - 42), 8, 40); c.fillStyle = OAK[2]; c.fillRect(Math.round(q.x - 3), Math.round(q.y - 41), 6, 38); c.fillStyle = OAK[4]; c.fillRect(Math.round(q.x - 3), Math.round(q.y - 41), 2, 38); c.fillStyle = INK; c.beginPath(); c.arc(q.x, q.y - 44, 4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F2C84A'; c.beginPath(); c.arc(q.x, q.y - 44, 3, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFF0A8'; c.fillRect(Math.round(q.x - 2), Math.round(q.y - 46), 1, 1); }
    // (the stringer: carved stone in steps (lit along its top, shaded under), sunk panels with a gold line through
    // them, a faint enchanted glow under it (gold in the tell))
    const glowA = 0.12 + s.tell * 0.5 * (0.6 + 0.4 * Math.sin(f * 0.5));
    c.save(); c.globalAlpha = glowA; c.strokeStyle = s.tell > 0 ? '#FFE27A' : '#B9A2FF'; c.lineWidth = 24; c.lineCap = 'round';
    c.beginPath(); c.moveTo(d.px, d.py + 10); c.lineTo(e.x, e.y + 10); c.stroke(); c.restore();
    band(-1, 19, INK); band(1, 17, S[3]); band(1, 4, S[4]); band(12, 17, S[1]); band(15, 17, S[0]);
    for (let u = 20; u < d.len - 24; u += 46) {
      const p0 = at(u), p1 = at(u + 30);
      c.fillStyle = S[2]; c.beginPath(); c.moveTo(p0.x, p0.y + 6); c.lineTo(p1.x, p1.y + 6); c.lineTo(p1.x, p1.y + 11); c.lineTo(p0.x, p0.y + 11); c.closePath(); c.fill();
      c.fillStyle = s.tell > 0 ? '#FFE27A' : '#E0AE3A'; c.beginPath(); c.moveTo(p0.x + 2, p0.y + 8); c.lineTo(p1.x - 2, p1.y + 8); c.lineTo(p1.x - 2, p1.y + 9); c.lineTo(p0.x + 2, p0.y + 9); c.closePath(); c.fill();
    }
    // (the treads: level whatever the angle, stone in steps, each lit along its top; the tell picks them out in gold,
    // in a wave)
    const stepW = Math.max(10, Math.min(18, Math.abs(dir.x) * 16 + 4));
    for (let u = 7; u < d.len - 3; u += 14) {
      const q = at(u), x = Math.round(q.x - stepW / 2), y = Math.round(q.y);
      c.fillStyle = INK; c.fillRect(x - 1, y - 2, stepW + 2, 9);
      c.fillStyle = S[3]; c.fillRect(x, y - 1, stepW, 7);
      c.fillStyle = S[4]; c.fillRect(x, y + 1, 2, 4);
      c.fillStyle = S[1]; c.fillRect(x, y + 5, stepW, 1); c.fillRect(x + stepW - 2, y + 1, 2, 4);
      const wave = s.tell > 0 && Math.sin(u * 0.08 - f * 0.4) > 0.3;
      c.fillStyle = wave ? '#FFE27A' : lip; c.fillRect(x, y - 1, stepW, 2);
      c.fillStyle = wave ? '#FFFFFF' : '#FFF6D8'; c.fillRect(x + 1, y - 1, Math.max(2, stepW - 6), 1);
    }
    // (the pivot: an iron hub, its bolts, a gold boss; a rune ring round it while it moves or tells)
    c.fillStyle = INK; c.beginPath(); c.arc(d.px, d.py + 8, 10, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#26243C'; c.beginPath(); c.arc(d.px, d.py + 8, 8.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#4C4A66'; c.beginPath(); c.arc(d.px - 1.5, d.py + 6.5, 6, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 6; k++) { const a = s.ang + (k * Math.PI) / 3; c.fillStyle = '#8A88A8'; c.fillRect(Math.round(d.px + Math.cos(a) * 6), Math.round(d.py + 8 + Math.sin(a) * 6), 1, 1); }
    c.fillStyle = '#A06C1C'; c.beginPath(); c.arc(d.px, d.py + 8, 3.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F2C84A'; c.beginPath(); c.arc(d.px - 0.8, d.py + 7.2, 2.2, 0, Math.PI * 2); c.fill();
    if (s.tell > 0 || s.moving) {
      const col = s.moving ? '#B9A2FF' : '#FFE27A', r = 14 + Math.sin(f * 0.3) * 2;
      c.strokeStyle = col; c.lineWidth = 1.5;
      c.beginPath(); c.arc(d.px, d.py + 8, r, f * 0.1, f * 0.1 + Math.PI * 1.5); c.stroke();
      for (let k = 0; k < 8; k++) { const a = -f * 0.08 + (k * Math.PI) / 4; c.fillStyle = k % 2 ? col : '#FFFFFF'; c.fillRect(Math.round(d.px + Math.cos(a) * (r + 4)) - 1, Math.round(d.py + 8 + Math.sin(a) * (r + 4)) - 1, 2, 2); }
    }
    // (the tell: sparkles off the treads; swinging: a trail off the free end)
    if (s.tell > 0 && f % 3 === 0) {
      const q = at(Math.random() * d.len);
      state.particles.push({ pos: { x: q.x, y: q.y - 4 }, vel: { x: (Math.random() - 0.5) * 0.6, y: -0.6 - Math.random() }, life: 22, color: Math.random() < 0.5 ? '#FFE27A' : '#FFFFFF', size: 2 });
    }
    if (s.moving && f % 2 === 0) state.particles.push({ pos: { x: e.x, y: e.y + 6 }, vel: { x: 0, y: 0.3 }, life: 18, color: Math.random() < 0.5 ? '#B9A2FF' : '#FFE9FF', size: 2 });
  }
};
