// CON-FUCK-TIOUS's TACKLING DUMMY, drawn (benLair.ts's m2:jg_tackle, the coco-nuts' trial): a padded football dummy
// on a spring post, the kind that rocks back when you hit it. A stuffed tube in a stolen park-staff jersey (Jungle
// Cruise green and khaki, a sharpie 00 on it), a burlap sack tied on top for a head (stitched X eyes, a stitched grin,
// a strip of duct tape across the brow), the coil spring under it, a rusted base plate bolted to nothing. No arms, no
// legs: nothing to bend. Painted once into its own canvas (feet at the origin, facing right; the engine mirrors it).

import type { Enemy } from '../../../m1/types';
import { shapeR, pxR, lineR, ellR, dith, type Ramp } from '../../foreign/heli/harryArt';
import { signAt, print } from '../letters';

type Ctx = CanvasRenderingContext2D;
/** Its height (the enemy's box), its head (from its feet, facing right). */
export const TACKLE_H = 96;
export const TACKLE_HEAD = { x: 1, y: -82, r: 12 };
const W = 80, H = 112, OX = 40, OY = 106;

const JERSEY: Ramp = ['#7FB069', '#4E8A3A', '#386A2A', '#26481C', '#0C1808'];
const KHAKI: Ramp = ['#E8D8A8', '#CCB880', '#A8945E', '#7C6C40', '#2C2414'];
const BURLAP: Ramp = ['#D8B884', '#B8935E', '#957244', '#6A4E2C', '#2A1C0C'];
const STEEL: Ramp = ['#C6CCD4', '#9097A2', '#6C7280', '#4C5260', '#1A1E26'];
const RUST: Ramp = ['#C27A4C', '#94522E', '#6E3A22', '#4A2616', '#1A0C08'];
const TAPE: Ramp = ['#D4D4D8', '#A1A1AA', '#71717A', '#52525B', '#18181B'];

let cv: HTMLCanvasElement | null | undefined;
const paint = (g: Ctx) => {
  g.save(); g.translate(OX, OY);
  // ---- the base plate (rusted, four bolts) and the floor's shadow
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(-24, -1, 48, 2);
  shapeR(g, () => g.rect(-20, -6, 40, 6), RUST, -20, 20, 1);
  pxR(g, -19, -6, 38, 1, RUST[0]);
  for (const bx of [-16, -6, 6, 16]) { ellR(g, bx, -3, 1.4, 1.4, RUST[4]); pxR(g, bx - 1, -4, 1, 1, STEEL[0]); }
  // ---- the coil spring: rings stacked from the plate to the body's foot, lit on the left, a back half in shadow
  for (let k = 0; k < 6; k++) {
    const y = -9 - k * 3.4;
    g.strokeStyle = STEEL[4]; g.lineWidth = 3; g.beginPath(); g.ellipse(0, y, 9, 2.4, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = STEEL[2]; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, y, 9, 2.4, 0, Math.PI, Math.PI * 2); g.stroke();
    g.strokeStyle = STEEL[0]; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, y, 9, 2.4, 0, 0, Math.PI); g.stroke();
    pxR(g, -8, y, 2, 1, '#FFFFFF');
  }
  shapeR(g, () => g.rect(-12, -32, 24, 5), STEEL, -12, 12, 1);
  // ---- the padded body: a tube, quilted, in the jersey (green over khaki), its ramp in bands round it
  const top = -70, bot = -30, bw = 17;
  shapeR(g, () => g.roundRect(-bw, top, bw * 2, bot - top, 7), JERSEY, -bw, bw, 1.4);
  // (the khaki yoke over the shoulders, the stripes round the middle)
  shapeR(g, () => g.roundRect(-bw, top, bw * 2, 12, [7, 7, 2, 2]), KHAKI, -bw, bw, 1);
  for (const y of [top + 24, top + 29]) { pxR(g, -bw + 1, y, bw * 2 - 2, 3, KHAKI[1]); pxR(g, -bw + 1, y, bw * 2 - 2, 1, KHAKI[0]); pxR(g, -bw + 1, y + 2, bw * 2 - 2, 1, KHAKI[3]); }
  // (the quilting: seams down it, the padding puffed between them)
  for (const sx of [-9, 0, 9]) { pxR(g, sx, top + 12, 1, bot - top - 14, JERSEY[3]); pxR(g, sx + 1, top + 12, 1, bot - top - 14, dith(g, JERSEY[0])); }
  // (the number, sharpied on)
  signAt(g, '00', 3, top + 18, 4, print(4, '#F2F2E6'));
  // (the hem, frayed; a split taped shut, stuffing poking out of the other)
  for (let k = -bw + 2; k < bw - 2; k += 3) pxR(g, k, bot - 2, 2, 2 + (k % 2 ? 1 : 0), JERSEY[4]);
  shapeR(g, () => g.rect(-14, top + 34, 9, 3), TAPE, -14, -5, 0.8);
  ellR(g, 11, top + 36, 3, 2, '#F2EAD8'); pxR(g, 10, top + 35, 2, 1, '#FFFFFF');
  // ---- the neck: the sack's tie (a hank of rope), then the sack head
  shapeR(g, () => g.rect(-7, top - 4, 14, 6), BURLAP, -7, 7, 1);
  lineR(g, [-8, top - 1, 8, top - 1], 2.4, '#4A321C'); lineR(g, [-8, top - 1.6, 8, top - 1.6], 1, '#B08A5A');
  lineR(g, [7, top - 1, 11, top + 5], 1.6, '#4A321C'); lineR(g, [7, top - 1, 13, top + 3], 1.4, '#6A4C2E');
  const hx = TACKLE_HEAD.x, hy = TACKLE_HEAD.y, r = TACKLE_HEAD.r;
  shapeR(g, () => g.ellipse(hx, hy, r, r * 1.05, 0, 0, Math.PI * 2), BURLAP, hx - r, hx + r, 1.2);
  // (the weave: a dither of the deep over it, the lit up-left)
  g.fillStyle = dith(g, BURLAP[3]); g.beginPath(); g.ellipse(hx + 2, hy + 2, r * 0.9, r * 0.9, 0, 0, Math.PI * 2); g.fill();
  shapeR(g, () => g.ellipse(hx - 3, hy - 3, r * 0.55, r * 0.5, 0, 0, Math.PI * 2), BURLAP, hx - 9, hx + 3, 0);
  // (the duct tape across the brow; the stitched X eyes and grin, toward the way it faces)
  shapeR(g, () => g.rect(hx - r + 1, hy - 7, r * 2 - 2, 4), TAPE, hx - r, hx + r, 0.8);
  for (const ex of [hx + 1, hx + 7]) { lineR(g, [ex - 2, hy - 1, ex + 2, hy + 3], 1.3, '#1A0C06'); lineR(g, [ex + 2, hy - 1, ex - 2, hy + 3], 1.3, '#1A0C06'); }
  lineR(g, [hx - 1, hy + 6, hx + 3, hy + 8, hx + 9, hy + 6], 1.2, '#1A0C06');
  for (const sx of [hx + 1, hx + 4, hx + 7]) lineR(g, [sx, hy + 5, sx, hy + 9], 0.8, '#1A0C06');
  // (the sack's knot sticking up off the top)
  lineR(g, [hx - 2, hy - r, hx - 5, hy - r - 5], 2.4, BURLAP[3]); lineR(g, [hx + 1, hy - r, hx + 3, hy - r - 6], 2, BURLAP[2]);
  g.restore();
};
const canvas = () => {
  if (cv !== undefined) return cv;
  if (typeof document === 'undefined') return (cv = null);
  cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  paint(cv.getContext('2d')!);
  return cv;
};

/** It, feet at the origin, facing right (the engine's turned and mirrored it). Hit: a flash of white over it; rocking
 *  on its spring a moment after a hit (`e.hitFlash` counting down). */
export const drawTackle = (c: Ctx, e: Enemy, _f: number) => {
  const img = canvas();
  if (!img) return;
  const hf = e.hitFlash ?? 0;
  if (hf > 0) { c.save(); c.translate(0, -6); c.rotate(Math.sin(hf * 0.9) * 0.08); c.translate(0, 6); }
  c.drawImage(img, -OX, -OY);
  if (hf > 0) { c.save(); c.globalAlpha = 0.35; c.globalCompositeOperation = 'lighter'; c.drawImage(img, -OX, -OY); c.restore(); c.restore(); }
};
