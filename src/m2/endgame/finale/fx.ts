// THE KAIJU FINALE's wreckage effects, pooled (nothing allocated once the run's going): dust puffs (stepped rings, two
// tones, no blur), chunks of debris (flung, tumbling as little squares, landing and lying a while), fires on the rubble
// (dimmed: tongues of stepped color, no glow, no light thrown: the owner's finale wrecks), and smoke off them.
// Culled by where they are on screen (with their own size as margin).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH as W } from '../../../m1/constants';
import { floorY } from './geo';

type Ctx = CanvasRenderingContext2D;

interface Puff { on: boolean; x: number; y: number; vx: number; vy: number; r: number; t: number; life: number; col: string }
interface Chunk { on: boolean; x: number; y: number; vx: number; vy: number; s: number; t: number; life: number; col: string; down: boolean }
interface Fire { on: boolean; x: number; y: number; w: number; t: number; life: number }

const PUFFS: Puff[] = Array.from({ length: 160 }, () => ({ on: false, x: 0, y: 0, vx: 0, vy: 0, r: 0, t: 0, life: 0, col: '' }));
const CHUNKS: Chunk[] = Array.from({ length: 220 }, () => ({ on: false, x: 0, y: 0, vx: 0, vy: 0, s: 0, t: 0, life: 0, col: '', down: false }));
const FIRES: Fire[] = Array.from({ length: 24 }, () => ({ on: false, x: 0, y: 0, w: 0, t: 0, life: 0 }));
let pi = 0, ci = 0, fi = 0;

export const clearFx = () => { for (const p of PUFFS) p.on = false; for (const c of CHUNKS) c.on = false; for (const f of FIRES) f.on = false; };

/** A puff of dust (or smoke: dark), rising and spreading. */
export const puff = (x: number, y: number, r: number, col = '#C8BCA8', vx = 0, vy = -0.4, life = 60) => {
  const p = PUFFS[pi]; pi = (pi + 1) % PUFFS.length;
  p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.r = r; p.t = 0; p.life = life; p.col = col;
};
/** A cloud of them along a span (a building coming down): `n` puffs, rolling out. */
export const dustLine = (x0: number, x1: number, y: number, n: number, col = '#C8BCA8', big = 1) => {
  for (let k = 0; k < n; k++) { const x = x0 + ((k + 0.5) / n) * (x1 - x0); puff(x + (Math.random() - 0.5) * 10, y - Math.random() * 8, (6 + Math.random() * 8) * big, col, (Math.random() - 0.5) * 1.2, -0.2 - Math.random() * 0.5, 50 + Math.random() * 40); }
};
/** Chunks flung off (a wreck's: its colors). */
export const debris = (x: number, y: number, n: number, cols: readonly string[], speed = 4, up = 5) => {
  for (let k = 0; k < n; k++) {
    const c = CHUNKS[ci]; ci = (ci + 1) % CHUNKS.length;
    c.on = true; c.x = x + (Math.random() - 0.5) * 20; c.y = y; c.vx = (Math.random() - 0.5) * speed * 2; c.vy = -Math.random() * up - 1; c.s = 2 + Math.floor(Math.random() * 4);
    c.t = 0; c.life = 200 + Math.random() * 120; c.col = cols[k % cols.length]; c.down = false;
  }
};
/** A fire on a wreck (burning a while, then smoke). */
export const fireAt = (x: number, y: number, w: number, life = 600) => {
  const f = FIRES[fi]; fi = (fi + 1) % FIRES.length;
  f.on = true; f.x = x; f.y = y; f.w = w; f.t = 0; f.life = life;
};

export const updateFx = (state: GameState) => {
  for (const p of PUFFS) { if (!p.on) continue; p.t++; p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.r += 0.12; if (p.t > p.life) p.on = false; }
  for (const c of CHUNKS) {
    if (!c.on) continue;
    c.t++;
    if (!c.down) { c.x += c.vx; c.y += c.vy; c.vy += 0.3; const fy = floorY(c.x); if (c.y >= fy - c.s) { c.y = fy - c.s; c.down = true; } }
    if (c.t > c.life) c.on = false;
  }
  for (const f of FIRES) {
    if (!f.on) continue;
    f.t++;
    if (f.t % 9 === 0) puff(f.x + (Math.random() - 0.5) * f.w, f.y - 6, 5 + Math.random() * 4, f.t > f.life * 0.6 ? '#5A5458' : '#3A3436', (Math.random() - 0.5) * 0.3, -0.7, 70);
    if (f.t > f.life) f.on = false;
  }
  void state;
};

const viewL = (state: GameState) => state.camera.x - 60, viewR = (state: GameState) => state.camera.x + W + 60;

/** Behind the actors: the chunks lying, the fires (dimmed), the dust (before the landmarks still up in front of it?
 *  no: all the wreckage is on the walking line, drawn after the landmarks and before the actors). */
export const drawFx = (c: Ctx, state: GameState) => {
  const L = viewL(state), Rr = viewR(state), f = state.frame;
  for (const fr of FIRES) {
    if (!fr.on || fr.x + fr.w < L || fr.x - fr.w > Rr) continue;
    const k = fr.t > fr.life * 0.7 ? 1 - (fr.t - fr.life * 0.7) / (fr.life * 0.3) : 1;
    // (tongues: three stepped colors, dimmed (it's daylight and they're far below him), flickering)
    for (let i = 0; i < Math.max(2, Math.round(fr.w / 10)); i++) {
      const x = fr.x - fr.w / 2 + (i + 0.5) * (fr.w / Math.max(2, Math.round(fr.w / 10))), h = (6 + ((i * 7 + (f >> 2)) % 5) * 2) * k;
      if (h < 1) continue;
      c.fillStyle = '#9A3A1A'; c.fillRect(Math.round(x - 3), Math.round(fr.y - h), 6, Math.round(h));
      c.fillStyle = '#C8642A'; c.fillRect(Math.round(x - 2), Math.round(fr.y - h * 0.7), 4, Math.round(h * 0.7));
      c.fillStyle = '#D8A050'; c.fillRect(Math.round(x - 1), Math.round(fr.y - h * 0.35), 2, Math.round(h * 0.35));
    }
  }
  for (const ch of CHUNKS) {
    if (!ch.on || ch.x < L || ch.x > Rr) continue;
    c.fillStyle = '#0B0A10'; c.fillRect(Math.round(ch.x) - 1, Math.round(ch.y) - 1, ch.s + 2, ch.s + 2);
    c.fillStyle = ch.col; c.fillRect(Math.round(ch.x), Math.round(ch.y), ch.s, ch.s);
  }
};
/** Over the actors' feet: the dust (it rolls round them). */
export const drawDust = (c: Ctx, state: GameState) => {
  const L = viewL(state), Rr = viewR(state);
  for (const p of PUFFS) {
    if (!p.on || p.x + p.r < L || p.x - p.r > Rr) continue;
    const k = 1 - p.t / p.life;
    c.globalAlpha = 0.5 * k; c.fillStyle = p.col;
    c.beginPath(); c.arc(Math.round(p.x), Math.round(p.y), Math.round(p.r), 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.35 * k; c.fillStyle = '#FFFFFF';
    c.beginPath(); c.arc(Math.round(p.x - p.r * 0.3), Math.round(p.y - p.r * 0.3), Math.round(p.r * 0.5), 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
};
