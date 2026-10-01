// Fire meeting oil: the blast, drawn. A white flash, a shockwave racing out flat along the ground, a fireball in
// stepped rings (white-hot core, yellow, orange, red, a dark rim), and the fireball lifting off on a column of its own
// smoke into a mushroom cap that cools from orange through to soot and drifts apart. All of it in hard bands, SNES-style:
// no smooth gradients, pixel-snapped edges, a dithered skirt where the smoke thins.

import type { GameState } from '../core/state';
import { BLAST_FRAMES } from '../core/state';
import { pixelBlob } from './pixelArt';

type Ctx = CanvasRenderingContext2D;

const snap = (v: number) => Math.round(v / 2) * 2;
const ease = (k: number) => 1 - (1 - k) * (1 - k);
const clamp01 = (k: number) => Math.max(0, Math.min(1, k));

/** A fixed scatter for a blast (the same lumps every frame it's drawn). */
const rand = (seed: number) => { const v = Math.sin(seed * 12.9898) * 43758.5453; return v - Math.floor(v); };

/**
 * A billowing lump of fire or smoke: each band of `ramp` (rim in to core) a cluster of overlapping puffs rather than
 * a clean ring, so the edges boil; the top of each puff lit a step brighter, the underside a step darker.
 */
const billow = (ctx: Ctx, x: number, y: number, rx: number, ry: number, ramp: string[], seed: number, t: number) => {
  ramp.forEach((c, i) => {
    const k = 1 - i / ramp.length;
    const lr = rx * k, lry = ry * k;
    if (lr < 2) return;
    const n = 7;
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(snap(x), snap(y), snap(lr * 0.72), snap(lry * 0.72), 0, 0, Math.PI * 2); ctx.fill();
    for (let j = 0; j < n; j++) {
      const a = (j / n) * Math.PI * 2 + rand(seed + i * 7 + j) * 0.8 + t * 0.012 * (j % 2 ? 1 : -1);
      const pr = lr * (0.34 + rand(seed + j * 3 + i) * 0.14);
      const px = x + Math.cos(a) * (lr - pr) * 0.95, py = y + Math.sin(a) * (lry - pr * (lry / lr)) * 0.95;
      ctx.beginPath(); ctx.ellipse(snap(px), snap(py), snap(pr), snap(pr * Math.min(1, (lry / lr) * 1.25)), 0, 0, Math.PI * 2); ctx.fill();
    }
  });
};

/** Fire cooling to smoke, by how far along it is (0 hot .. 1 soot): the ramp, rim to core. */
const fireRamp = (cool: number): string[] => {
  if (cool < 0.25) return ['#7F1D1D', '#DC2626', '#F97316', '#FACC15', '#FEF9C3', '#FFFFFF'];
  if (cool < 0.45) return ['#451A03', '#991B1B', '#EA580C', '#F59E0B', '#FDE68A'];
  if (cool < 0.65) return ['#292524', '#57534E', '#9A3412', '#EA580C', '#FBBF24'];
  if (cool < 0.85) return ['#1C1917', '#292524', '#44403C', '#7C2D12', '#C2410C'];
  return ['#1C1917', '#292524', '#44403C', '#57534E'];
};

export const drawBlasts = (ctx: Ctx, state: GameState) => {
  if (!state.blasts?.length) return;
  for (const b of state.blasts) drawBlast(ctx, state, b);
};

const drawBlast = (ctx: Ctx, state: GameState, b: { x: number; y: number; t: number; r: number }) => {
  const { x, y, t, r } = b;
  const k = t / BLAST_FRAMES;
  ctx.save();
  // The flash: the whole view whited out for a beat, then a hot glow fading round the middle
  if (t < 10) {
    const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: 800, h: 600 };
    ctx.fillStyle = `rgba(255, 251, 235, ${((1 - t / 10) * 0.75 * Math.min(1, r / 300)).toFixed(3)})`;
    ctx.fillRect(v.x - 50, v.y - 50, v.w + 100, v.h + 100);
  }
  // The shockwave: a flat ring racing out along the ground to the edge of the blast, and a fainter one after it
  for (const [delay, a0] of [[0, 0.9], [5, 0.45]] as const) {
    const s = clamp01((t - delay) / 22);
    if (s <= 0 || s >= 1) continue;
    const rx = r * ease(s), ry = rx * 0.32;
    ctx.strokeStyle = `rgba(254, 243, 199, ${(a0 * (1 - s)).toFixed(3)})`;
    ctx.lineWidth = snap(10 * (1 - s)) + 2;
    ctx.beginPath(); ctx.ellipse(snap(x), snap(y + r * 0.12), snap(rx), snap(ry), 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(249, 115, 22, ${(a0 * 0.7 * (1 - s)).toFixed(3)})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(snap(x), snap(y + r * 0.12), snap(rx * 0.9), snap(ry * 0.9), 0, 0, Math.PI * 2); ctx.stroke();
  }
  // The fireball: balloons out, then lifts on its column of smoke and spreads into the cap
  const grow = ease(clamp01(t / 12));
  const lift = ease(clamp01((t - 10) / 60));
  const fade = clamp01((k - 0.7) / 0.3);
  const capY = y - lift * r * 0.75;
  const capRx = r * (0.28 + 0.22 * lift) * grow, capRy = r * (0.28 - 0.1 * lift) * grow;
  ctx.globalAlpha = 1 - fade;
  // (the column: from the ground up into the cap, cooler than the cap, narrower at the waist)
  if (lift > 0.05) {
    const cool = clamp01(k * 1.2 + 0.25);
    const colH = y + r * 0.1 - capY;
    const ramp = fireRamp(cool);
    // (pinched at the waist, flaring at the foot; rolling as it goes up)
    for (let i = 0; i < ramp.length; i++) {
      ctx.fillStyle = ramp[i];
      for (let yy = 0; yy < colH; yy += 4) {
        const h = yy / colH;
        const flare = 1 + Math.pow(h, 3) * 1.4 + (1 - h) * 0.25;
        const roll = Math.sin(yy * 0.09 - t * 0.25) * 0.12 + 1;
        const w = r * (0.12 - i * 0.022) * flare * roll * (1 + 0.3 * (1 - lift));
        if (w <= 1) continue;
        ctx.fillRect(snap(x - w), snap(capY + yy), snap(w * 2), 4);
      }
    }
    // the skirt of dust it kicks up where it meets the ground
    pixelBlob(ctx, x, y + r * 0.1, r * 0.35 * lift, r * 0.08, fade > 0 ? '#292524' : '#44403C');
  }
  // (the cap: a hot core at first, rolling over to soot from the outside in, a dark underside to it once it's up)
  const cool = clamp01(k * 1.15);
  const seed = Math.round(x * 0.37 + y * 0.11);
  billow(ctx, x, capY, capRx, capRy, fireRamp(cool), seed, t);
  if (lift > 0.3) {
    ctx.fillStyle = `rgba(28, 25, 23, ${(0.5 * clamp01((lift - 0.3) / 0.4)).toFixed(3)})`;
    ctx.beginPath(); ctx.ellipse(snap(x), snap(capY + capRy * 0.6), snap(capRx * 0.8), snap(capRy * 0.3), 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};
