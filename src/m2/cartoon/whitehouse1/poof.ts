// Cartoon kills (the projection's on: no blood, no bodies): whatever dies in the cartoon White House goes up in a puff
// of smoke, the Saturday morning way: a burst of fat round cloud, inked, swelling and thinning out, stars flying off it,
// a twinkle; a pundit's costume bits flung up out of it, spinning off (his face, his ears, his charts; his wig, his
// Bible). The engine calls poofEnemy (core/cartoonKills.ts) where it would leave a body; this draws it.

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { setPoofHook } from '../../../m1/game/core/cartoonKills';
import { playSound } from '../../../m1/game/platform/audio';
import { getCartoon } from '../section';
import { INK, onScreen, type Ctx } from '../kit';
import { whOf, type Puff, type PuffBit } from './state';
import { dith } from '../amphi/paint';

/** A puff where the enemy was (its middle), as big as it was. */
export const puffAt = (state: GameState, x: number, y: number, size: number, bits?: PuffBit[]) => {
  whOf(state).puffs.push({ x, y, t: 0, size, bits });
};

setPoofHook((state: GameState, e: Enemy) => {
  if (!getCartoon(state)) return;
  puffAt(state, e.pos.x + e.width / 2, e.pos.y + e.height * 0.55, Math.max(e.width, e.height * 0.7));
  playSound('poof', 1, Math.random() * 2 - 1);
});

const PUFF_LEN = 46;
export const updatePuffs = (state: GameState) => {
  const s = whOf(state);
  for (const p of s.puffs) {
    p.t++;
    for (const b of p.bits ?? []) { b.x += b.vx; b.y += b.vy; b.vy += 0.35; b.rot += b.spin; }
  }
  s.puffs = s.puffs.filter(p => p.t < (p.bits?.length ? 160 : PUFF_LEN));
};

const lump = (c: Ctx, x: number, y: number, r: number) => { c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2); };
/** The puffs (world space; over the set, under the HUD). `drawBit` draws a pundit's costume bit (his art's). */
export const drawPuffs = (c: Ctx, state: GameState, drawBit?: (c: Ctx, b: PuffBit) => void) => {
  for (const p of whOf(state).puffs) {
    if (!onScreen(state, p.x - 200, p.x + 200)) continue;
    drawPuff(c, p);
    if (drawBit) for (const b of p.bits ?? []) drawBit(c, b);
  }
};
const drawPuff = (c: Ctx, p: Puff) => {
  const t = p.t / PUFF_LEN;
  if (t >= 1) return;
  // (it swells fast, then hangs there thinning out and rising a little)
  const grow = Math.min(1, t / 0.18), R = p.size * (0.35 + 0.35 * grow + 0.12 * t), rise = t * 14;
  const alpha = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
  const lumps: [number, number, number][] = [[0, 0, 0.62], [-0.55, 0.12, 0.45], [0.55, 0.1, 0.48], [-0.28, -0.42, 0.42], [0.3, -0.4, 0.44], [0, 0.34, 0.4], [-0.62, -0.18, 0.3], [0.66, -0.16, 0.3]];
  c.save(); c.globalAlpha = alpha;
  c.translate(p.x, p.y - rise);
  // (ink round the whole cloud, then the cloud in stepped tones (shade, mid, lit, a highlight), dithered between)
  c.fillStyle = INK; c.beginPath(); for (const [dx, dy, r] of lumps) lump(c, dx * R, dy * R, r * R + 2.5); c.fill();
  c.fillStyle = '#9C96B4'; c.beginPath(); for (const [dx, dy, r] of lumps) lump(c, dx * R, dy * R, r * R); c.fill();
  c.fillStyle = '#C9C4D6'; c.beginPath(); for (const [dx, dy, r] of lumps) lump(c, dx * R - r * R * 0.08, dy * R - r * R * 0.1, r * R * 0.9); c.fill();
  c.fillStyle = dith(c, '#F4F1FA'); c.beginPath(); for (const [dx, dy, r] of lumps) lump(c, dx * R - r * R * 0.14, dy * R - r * R * 0.18, r * R * 0.84); c.fill();
  c.fillStyle = '#F4F1FA'; c.beginPath(); for (const [dx, dy, r] of lumps) lump(c, dx * R - r * R * 0.2, dy * R - r * R * 0.24, r * R * 0.72); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); for (const [dx, dy, r] of lumps.slice(0, 5)) lump(c, dx * R - r * R * 0.36, dy * R - r * R * 0.42, r * R * 0.26); c.fill();
  // (the burst's speed lines out of it, the first moments)
  if (t < 0.35) { c.strokeStyle = INK; c.lineWidth = 2; for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.2, r0 = R * 1.05 + t * 40, r1 = r0 + 10; c.beginPath(); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0 * 0.8); c.lineTo(Math.cos(a) * r1, Math.sin(a) * r1 * 0.8); c.stroke(); } }
  // (the stars flying off it, and a twinkle at the end)
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.4, d = R * (0.7 + t * 1.3), sx = Math.cos(a) * d, sy = Math.sin(a) * d * 0.8 - t * 10, r = 5 * (1 - t * 0.6);
    star(c, sx, sy, r, k % 2 ? '#FDE047' : '#FFFFFF');
  }
  if (t > 0.55) { const k = (t - 0.55) / 0.45, r = 9 * Math.sin(k * Math.PI); c.fillStyle = '#FFFFFF'; c.fillRect(-0.75, -R - r, 1.5, r * 2); c.fillRect(-r, -R - 0.75, r * 2, 1.5); }
  c.restore();
};
export const star = (c: Ctx, x: number, y: number, r: number, col: string) => {
  c.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath(); c.fillStyle = INK; c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); c.fillStyle = col; c.fill();
};
