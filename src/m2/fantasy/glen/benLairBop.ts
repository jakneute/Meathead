// A BOP-A-KNIGHT, drawn: CON-FUCK-TIOUS's sparring partners in Fairy Land's lair (benLair.ts's m2:fy_bop). The gift
// shop's inflatable punching bag, a knight: a pear of silver-blue vinyl on a fat sand-filled bottom (hot pink), printed
// all over as armor (the breastplate's plates and rivets, a great helm with its eye slit and breaths, a heart crest on a
// printed shield), an inflated pink plume up top, a foam sword glued to its side sticking out front (what it bops him
// with), the seams, the valve nub, the vinyl's hard shine. No arms or legs: it's a bag. Popped: a crumpled skin flat on
// the floor, the helm wrinkled, the sword lying by it.
//
// Painted once (its own canvas, upright, and the popped one); drawn turned about its bottom as it wobbles (lean, in
// radians: + toward where it faces). Feet at the origin, facing right; the engine's mirror for facing left.

import type { Enemy } from '../../../m1/types';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A1028';
/** Ramps (deep .. lit): the vinyl, the bottom, the plume, the sword's foam, the print's gold. */
const VINYL = ['#2E3A5C', '#4A5A86', '#6E80AE', '#96A8D2', '#C4D2F0', '#F2F6FF'];
const BOTTOM = ['#5A0A30', '#8A1448', '#B82266', '#E04A8C', '#F884B6', '#FFC4DE'];
const PLUME = ['#6A0A3A', '#9A1656', '#CC2E7A', '#F05CA0', '#FF9ACB', '#FFD4EA'];
const FOAM = ['#6A4A1A', '#9A7030', '#C89A4A', '#E8C070', '#F8DE9E', '#FFF4D2'];
const PRINT = ['#5A3A04', '#8A5E08', '#C08A10', '#EAB516', '#FAD43A', '#FFF08A'];
const W = 56, H = 88, OX = 22, OY = 84;

/** A filled shape in an ink outline. */
const fill = (g: Ctx, shape: () => void, col: string, ink = true) => {
  if (ink) { g.save(); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); shape(); g.stroke(); g.restore(); }
  g.fillStyle = col; g.beginPath(); shape(); g.fill();
};
const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, w, h); };

let upCv: HTMLCanvasElement | null = null, deadCv: HTMLCanvasElement | null = null;
/** The body's outline, about its bottom at (0, 0): the sand bottom's round, up into the pear, the round top. */
const pear = (g: Ctx) => {
  g.moveTo(-15, -6);
  g.bezierCurveTo(-19, -20, -9, -34, -10, -48);
  g.bezierCurveTo(-11, -62, -6, -70, 0, -70);
  g.bezierCurveTo(6, -70, 11, -62, 10, -48);
  g.bezierCurveTo(9, -34, 19, -20, 15, -6);
  g.closePath();
};
const paintUp = (g: Ctx) => {
  g.translate(OX, OY);
  // (the plume: three inflated lobes off the top, bent back)
  for (const [x, y, r] of [[-7, -78, 5], [-2, -82, 6], [4, -79, 5]] as const) { fill(g, () => g.ellipse(x, y, r, r * 1.3, -0.4, 0, Math.PI * 2), PLUME[3]); }
  for (const [x, y] of [[-8, -80], [-3, -85], [3, -82]] as const) box(g, x, y, 2, 3, PLUME[5]);
  box(g, -6, -74, 10, 2, PLUME[1]);
  // (the body: vinyl in bands, dark down its right, lit down its left)
  fill(g, () => pear(g), VINYL[2]);
  g.save(); g.beginPath(); pear(g); g.clip();
  for (let i = 0; i < 6; i++) box(g, -20 + i * 7, -72, 7, 72, [VINYL[3], VINYL[3], VINYL[2], VINYL[2], VINYL[1], VINYL[0]][i]);
  // (dither seams between the bands)
  g.fillStyle = VINYL[2]; for (let y = -70; y < 0; y += 2) { g.fillRect(-7 + ((y / 2) & 1), y, 1, 1); g.fillRect(7 + ((y / 2) & 1), y, 1, 1); }
  // (the printed great helm on the top: its dome, the eye slit, the breaths, a center ridge)
  box(g, -10, -64, 20, 18, VINYL[1]); box(g, -10, -64, 20, 2, VINYL[4]);
  box(g, -9, -56, 18, 3, INK); box(g, -8, -55, 7, 1, '#3A4466'); box(g, 1, -55, 7, 1, '#3A4466');
  box(g, -1, -64, 2, 18, VINYL[3]);
  for (let k = 0; k < 4; k++) { box(g, 3 + k * 2, -50, 1, 3, INK); box(g, -4 - k * 2, -50, 1, 3, INK); }
  box(g, -10, -47, 20, 2, PRINT[2]);
  // (the printed breastplate: its plates, rivets, a gold trim; the shield on its front, a pink heart crest)
  for (const y of [-40, -32, -24]) { box(g, -13, y, 26, 1, VINYL[0]); box(g, -13, y + 1, 26, 1, VINYL[4]); }
  for (const [x, y] of [[-10, -42], [10, -42], [-11, -26], [11, -26]] as const) { box(g, x, y, 2, 2, PRINT[3]); box(g, x, y, 1, 1, PRINT[5]); }
  fill(g, () => { g.moveTo(-1, -40); g.lineTo(11, -40); g.lineTo(11, -30); g.quadraticCurveTo(10, -22, 5, -19); g.quadraticCurveTo(0, -22, -1, -30); g.closePath(); }, '#F2F2F8');
  box(g, 0, -39, 10, 2, PRINT[3]);
  fill(g, () => { g.moveTo(5, -24); g.bezierCurveTo(-1, -29, 1, -35, 5, -32); g.bezierCurveTo(9, -35, 11, -29, 5, -24); }, BOTTOM[3], false);
  box(g, 3, -32, 2, 1, BOTTOM[5]);
  // (the vinyl's hard shine down its left, and the seam up its middle)
  box(g, -8, -66, 2, 12, '#FFFFFF'); box(g, -9, -44, 2, 22, VINYL[5]); box(g, -7, -60, 1, 4, '#FFFFFF');
  g.restore();
  // (the sand bottom: a fat pink round, banded, a seam, the valve nub)
  const bot = () => g.ellipse(0, -6, 17, 8, 0, 0, Math.PI * 2);
  fill(g, bot, BOTTOM[2]);
  g.save(); g.beginPath(); bot(); g.clip();
  box(g, -18, -14, 36, 4, BOTTOM[3]); box(g, -18, -10, 36, 3, BOTTOM[2]); box(g, -18, -7, 36, 4, BOTTOM[1]); box(g, -18, -3, 36, 6, BOTTOM[0]);
  box(g, -12, -13, 8, 1, BOTTOM[5]);
  g.restore();
  box(g, -17, -7, 34, 1, BOTTOM[0]);
  box(g, 10, -11, 3, 3, INK); box(g, 11, -10, 1, 1, BOTTOM[4]);
  // (the foam sword glued to its side, out front: the blade, the crossguard, the grip and pommel, the glue's blob)
  fill(g, () => { g.moveTo(10, -36); g.lineTo(31, -44); g.lineTo(34, -42); g.lineTo(13, -32); g.closePath(); }, FOAM[3]);
  g.strokeStyle = FOAM[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(14, -36); g.lineTo(30, -42.5); g.stroke();
  g.strokeStyle = FOAM[1]; g.beginPath(); g.moveTo(14, -33); g.lineTo(32, -41); g.stroke();
  fill(g, () => { g.moveTo(7, -41); g.lineTo(11, -42); g.lineTo(15, -30); g.lineTo(11, -29); g.closePath(); }, PRINT[3]);
  box(g, 5, -36, 5, 4, '#7A3A1A'); box(g, 3, -36, 3, 3, PRINT[2]);
  box(g, 8, -37, 4, 3, 'rgba(240,250,255,0.7)');
};
const paintDead = (g: Ctx) => {
  g.translate(OX, OY);
  // (the skin, flat and crumpled: folds across it, the helm's print wrinkled up one end, the bottom slumped)
  fill(g, () => { g.moveTo(-20, 0); g.quadraticCurveTo(-22, -8, -12, -9); g.lineTo(6, -12); g.quadraticCurveTo(16, -10, 22, -4); g.lineTo(24, 0); g.closePath(); }, VINYL[2]);
  for (let k = 0; k < 5; k++) { box(g, -14 + k * 7, -9 + (k % 2), 1, 8, VINYL[0]); box(g, -13 + k * 7, -9 + (k % 2), 1, 7, VINYL[4]); }
  box(g, 8, -10, 10, 5, VINYL[1]); box(g, 9, -8, 8, 1, INK);
  fill(g, () => g.ellipse(-16, -3, 9, 4, 0, 0, Math.PI * 2), BOTTOM[2]);
  box(g, -22, -4, 12, 1, BOTTOM[4]);
  fill(g, () => g.ellipse(22, -6, 4, 2.4, 0.6, 0, Math.PI * 2), PLUME[2]);
  // (the sword, lying)
  fill(g, () => { g.moveTo(-6, -1); g.lineTo(18, -3); g.lineTo(18, 0); g.lineTo(-6, 1); g.closePath(); }, FOAM[3]);
  box(g, -9, -3, 3, 5, PRINT[3]);
};
const canvasOf = (dead: boolean) => {
  if (typeof document === 'undefined') return null;
  if (dead ? deadCv : upCv) return dead ? deadCv : upCv;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!;
  if (dead) paintDead(g); else paintUp(g);
  if (dead) deadCv = cv; else upCv = cv;
  return cv;
};

/** It (feet at the origin, facing right), wobbling by `lean`; popped, the skin on the floor. */
export const drawBop = (c: Ctx, e: Enemy, _f: number, lean: number) => {
  const dead = e.health <= 0;
  const cv = canvasOf(dead);
  if (!cv) return;
  if (dead) { c.drawImage(cv, -OX, -OY); return; }
  c.save();
  // (turned about its sand bottom: it rocks on its round)
  c.translate(0, -6); c.rotate(lean); c.translate(0, 6);
  // (a hit: it squashes a moment)
  if ((e.hitFlash ?? 0) > 0) c.scale(1.08, 0.94);
  c.drawImage(cv, -OX, -OY);
  c.restore();
};
