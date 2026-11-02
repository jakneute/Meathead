// CON-FUCK-TIOUS's SPARRING ALIEN, drawn (benLair.ts's m2:sp_spar): one of XENOSCARE's busted cheap animatronic greens
// (crater/green.ts: the molded rubber head, the black eyes, the lamé jumpsuit) on its chrome rod, the rod stuck in an old
// car tire full of concrete so it stands up wherever he wheels it; arms out in its CLAW pose, its eyes dead. His touches:
// a gaffer-tape X on its chest (HIT HERE), a strip of tape round its neck seam, a scuffed-off patch on its chin.
//
// Painted once into its own canvas (feet at the origin, facing right; the engine's mirror for facing left), then drawn
// with one drawImage (turned freely: a canvas, not the stamp cache), whatever's done to it.

import type { Enemy } from '../../../m1/types';
import { drawCheapGreen } from '../crater/green';

type Ctx = CanvasRenderingContext2D;
/** Its height (the enemy's box). */
export const SPAR_H = 100;
const W = 120, H = 130, OX = 60, OY = 124, S = 0.6;
const INK = '#120A18';

let cv: HTMLCanvasElement | null | undefined;
const paint = (g: Ctx) => {
  g.save(); g.translate(OX, OY);
  const box = (x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  // (the green on its rod, the rod down into the tire's concrete)
  drawCheapGreen(g, 0, -12, 0, S, 'claw');
  // (the tape: an X on its chest, a wrap round the neck seam)
  for (const [a, b] of [[-1, 1], [1, -1]] as const) {
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(a * 6, -12 - 62 * S); g.lineTo(b * 6, -12 - 44 * S); g.stroke();
    g.strokeStyle = '#A1A1AA'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(a * 6, -12 - 62 * S); g.lineTo(b * 6, -12 - 44 * S); g.stroke();
  }
  box(-6, -12 - 78 * S, 12, 3, '#71717A'); box(-6, -12 - 78 * S, 12, 1, '#D4D4D8');
  // (the tire: black rubber in steps, its tread, the grey concrete in it, the rod's foot)
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -8, 26, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#27272A'; g.beginPath(); g.ellipse(0, -8, 24.5, 7.6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3F3F46'; g.beginPath(); g.ellipse(-2, -10, 22, 5.4, 0, Math.PI, Math.PI * 2); g.fill();
  for (let k = -22; k <= 22; k += 4) box(k, -4 + Math.abs(k) * 0.06, 2, 2, '#18181B');
  g.fillStyle = '#57534E'; g.beginPath(); g.ellipse(0, -11, 14, 3.6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#78716C'; g.beginPath(); g.ellipse(-3, -12, 8, 1.8, 0, 0, Math.PI * 2); g.fill();
  box(-3, -14, 6, 3, '#A1A1AA');
  // (the floor's shadow under it)
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(-24, -1, 48, 2);
  g.restore();
};
const canvas = () => {
  if (cv !== undefined) return cv;
  if (typeof document === 'undefined') return (cv = null);
  cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!;
  paint(g);
  return cv;
};

/** It, feet at the origin, facing right (the engine's turned and mirrored it). Hit: a flash of white over it. */
export const drawSpar = (c: Ctx, e: Enemy, _f: number) => {
  const img = canvas();
  if (!img) return;
  c.drawImage(img, -OX, -OY);
  if ((e.hitFlash ?? 0) > 0) { c.save(); c.globalAlpha = 0.35; c.globalCompositeOperation = 'lighter'; c.drawImage(img, -OX, -OY); c.restore(); }
};
