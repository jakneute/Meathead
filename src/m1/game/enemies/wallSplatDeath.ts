// Wall-splatted (Meathead 2: killed by a wall: thrown into one, driven into one by the air grab, charged or shoved into
// one, a flung corpse hitting one hard): nothing left of him to slide down it. Obliterated into a big gooey puddle
// splattered across the wall where he hit (the ceiling splat's, on a side instead of a top), fat runs of goo oozing down
// the wall from it over time and pooling at its foot, meat sliding down after them. It stays a good while, then fades.
// (Meathead 1's wall kills keep their slide down the wall: setWallSplatDeath, core/resist.ts.)

import type { GameState } from '../core/state';
import { floorTopAt } from '../core/terrain';
import type { EnemyDeath } from './deaths';

/** One run of goo down the wall: off the puddle's middle by `dx` (+ out from the wall), how far it'll get, how fast. */
export interface GooRun { dx: number; top: number; max: number; speed: number; start: number; w: number; br: number; seed: number }
/** A lump of him sliding down the wall: where (x fixed), how far down it's got, its pace, size, color. */
export interface Chunk { x: number; y0: number; y: number; vy: number; r: number; col: string; stick: number }

export interface WallSplat {
  /** The wall's face (world x), which way's out from it (into the air), the puddle's middle (world y), its size. */
  wx: number; side: 1 | -1; cy: number; r: number;
  /** The floor at the wall's foot (world y), or null (none near: no pool). */
  foot: number | null;
  seed: number;
  runs: GooRun[];
  chunks: Chunk[];
}

/** How long it stays, and how long it takes to fade at the end (frames). */
export const WALLSPLAT_FRAMES = 1100, WALLSPLAT_FADE = 140;

const MEAT = ['#B45353', '#F0A3A3', '#7F1D1D', '#E8DCC8', '#9F1239'];

/** Turns a fresh death into the puddle on the wall: `wx` the wall's face, `side` the way out from it into the air. */
export const startWallSplat = (state: GameState, d: EnemyDeath, wx: number, side: 1 | -1, cy: number) => {
  const r = Math.max(18, Math.min(44, Math.max(d.w, d.h) * 0.42));
  const f = floorTopAt(state.blocks, wx + side * 6, cy, 0);
  const foot = f !== null && f - cy < 700 ? f : null;
  const seed = Math.random() * 1000;
  const reach = foot !== null ? foot - cy : 260;
  const runs: GooRun[] = [];
  const n = 4 + Math.floor(Math.random() * 3);
  for (let k = 0; k < n; k++) {
    // (spread across the puddle, mostly over the wall's face; the fat ones go all the way down)
    const dx = -side * (r * (k / Math.max(1, n - 1)) * 1.05 - r * 0.15) + (Math.random() - 0.5) * 6;
    const top = r * (0.35 + Math.random() * 0.3);
    const fat = k % 2 === 0;
    const max = fat ? Math.max(20, reach - top - 2) : Math.min(reach - top - 2, 30 + Math.random() * (reach * 0.6));
    runs.push({ dx, top, max: Math.max(10, max), speed: (fat ? 0.42 : 0.3) + Math.random() * 0.25, start: Math.floor(Math.random() * 40), w: fat ? 7 + Math.random() * 4 : 4 + Math.random() * 3, br: fat ? 5 + Math.random() * 2 : 3 + Math.random() * 1.5, seed: Math.random() * 100 });
  }
  const chunks: Chunk[] = [];
  for (let k = 0; k < 3 + Math.floor(Math.random() * 3); k++) {
    const y0 = cy + (Math.random() - 0.5) * r;
    chunks.push({ x: wx - side * (2 + Math.random() * r * 0.9), y0, y: y0, vy: 0, r: 2.5 + Math.random() * 3.5, col: MEAT[k % MEAT.length], stick: Math.floor(Math.random() * 30) });
  }
  d.ws = { wx, side, cy, r, foot, seed, runs, chunks };
  d.vx = 0; d.vy = 0;
};

/** The meat sliding down (stick and slip), drops falling off the bottom of it now and then. False once it's gone. */
export const updateWallSplat = (state: GameState, d: EnemyDeath) => {
  const ws = d.ws;
  if (!ws) return false;
  d.t++;
  const bottom = ws.foot ?? ws.cy + 260;
  for (const c of ws.chunks) {
    if (c.stick > 0) { c.stick--; continue; }
    if (c.y + c.r >= bottom) { c.y = bottom - c.r; continue; }
    c.vy = Math.min(1.4, c.vy + 0.03);
    c.y += c.vy;
    // (it catches on the wall, now and then, and sits a while)
    if (Math.random() < 0.012) { c.stick = 20 + Math.floor(Math.random() * 50); c.vy = 0; }
  }
  // (a drip off the wall where there's no floor to pool on)
  if (ws.foot === null && d.t % 23 === 0 && d.t < WALLSPLAT_FRAMES - WALLSPLAT_FADE) {
    const run = ws.runs[Math.floor(Math.random() * ws.runs.length)];
    state.particles.push({ pos: { x: ws.wx + run.dx, y: ws.cy + run.top + Math.min(run.max, Math.max(0, d.t - run.start) * run.speed) + run.br }, vel: { x: 0, y: 1 }, life: 50, color: '#7F1D1D', size: 2 + Math.random() * 2 });
  }
  return d.t < WALLSPLAT_FRAMES;
};
