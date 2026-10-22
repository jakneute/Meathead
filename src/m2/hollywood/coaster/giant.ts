// The NORMAL track's end (the lever left on NORMAL: track.ts back): off stop 3, down the long drop into the distance,
// level, up over the lip of a GIANT TOILET and straight down into it. Flushed: the water swirls, it glugs, the train
// and him go down the drain; the fade, the station (index.ts). EXPERIMENTAL's launch is untouched.
//   the toilet   facing the track (its bowl's front to the left, the tank at the back): white porcelain in steps (lit
//                up its left, a streak of shine round it, dithered into its shade), the gold seat (a ring seen from just
//                above), its lid up against the tank, the gold handle, bolt caps, the supply line; the water in it
//   two layers   the back (tank, lid, the seat and the water: behind the track and the train) and the front (the near
//                half of the seat and water, the bowl under it: over the train going down into it; drawn again over him
//                once he's past the lip). Both stamps (lazy); only the swirl's live.

import type { GameState } from '../../../m1/game/core/state';
import { type Ctx, type CView, INK, vis, pal, goldStar } from './paint';
import { box, checker, stillAt, atDepth, ramp6, hour } from '../blvd/kit';
import { GY } from './layout';
import { tracks, STEP } from './track';

/** Where it is: its opening's middle (x), its rim (y), its depth; how far along the NORMAL track its lip is (s). */
export interface Giant { x: number; y: number; d: number; s: number }
let GT: Giant | null = null;
export const giant = (): Giant => {
  if (GT) return GT;
  // (the lip: the top of the last crest, near the track's end)
  const tr = tracks().back, pts = tr.pts, n = pts.length;
  let bi = Math.max(0, Math.round(((tr.marks.get('flush') ?? tr.len) - 260) / STEP));
  for (let i = bi; i < n; i++) if (pts[i].y < pts[bi].y) bi = i;
  const p = pts[bi];
  GT = { x: p.x + 80, y: p.y + 16, d: p.d, s: bi * STEP };
  return GT;
};

const ellF = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { if (rx <= 0 || ry <= 0) return; g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
const ramps = () => ({ P: pal().porcelain.slice(), G: pal().gold.slice(), W: ramp6(hour('#4F9CC4')) });

/** The seat (a gold ring from just above, its edge under) and the water in it. Origin: the opening's middle on the rim. */
const paintSeat = (g: Ctx) => {
  const { P, G, W } = ramps();
  // (the seat's edge, then its top: stepped round to the light, a streak of shine on its near left)
  ellF(g, 0, 5, 114, 25, INK); ellF(g, 0, 0, 114, 25, INK);
  ellF(g, 0, 5, 112, 23, G[1]); ellF(g, 0, 3, 112, 22, G[2]);
  ellF(g, 0, 0, 112, 22, G[3]); ellF(g, -14, -3, 96, 17, G[4]);
  g.save(); g.beginPath(); g.ellipse(0, 0, 112, 22, 0, 0, Math.PI * 2); g.clip(); checker(g, 40, -24, 74, 48, G[3], 0, 2); checker(g, 80, -24, 34, 48, G[2], 0, 2); g.restore();
  g.strokeStyle = G[5]; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 104, 19, 0, Math.PI * 0.62, Math.PI * 0.95); g.stroke();
  g.lineWidth = 1; g.beginPath(); g.ellipse(0, 0, 106, 20, 0, Math.PI * 1.15, Math.PI * 1.4); g.stroke();
  // (the opening: the bowl's inner wall going down at the back, the water)
  ellF(g, 2, 0, 93, 16, INK);
  g.save(); g.beginPath(); g.ellipse(2, 0, 91, 14.5, 0, 0, Math.PI * 2); g.clip();
  box(g, -92, -16, 186, 32, P[2]); box(g, -92, -16, 186, 4, P[3]); box(g, -60, -14, 50, 1, P[4]); box(g, 40, -16, 60, 32, P[1]);
  ellF(g, 2, 3, 86, 11, W[2]); ellF(g, -6, 2, 70, 8, W[3]); ellF(g, -18, 1, 40, 4.5, W[4]);
  checker(g, -60, -2, 120, 2, W[4], 0, 2);
  box(g, -40, -1, 22, 2, W[5]); box(g, -12, 0, 8, 1, W[5]); box(g, 30, 3, 14, 1, W[4]);
  // (the drain's dark down in it)
  ellF(g, 18, 5, 18, 3.4, W[1]); ellF(g, 18, 5, 10, 2, W[0]);
  g.restore();
};

/** The back: the tank (its lid, the handle, a gold star), the supply line, the lid up against it, the hinge, the seat. */
const paintBack = (g: Ctx, H: number) => {
  const { P, G } = ramps();
  // (the supply line: out of the ground at the back, braided, up to the tank's foot)
  box(g, 176, -14, 10, H + 14, INK); box(g, 178, -14, 6, H + 14, pal().chrome[2]);
  for (let y = -14; y < H; y += 3) box(g, 178 + ((y / 3) & 1) * 3, y, 2, 2, pal().chrome[4]);
  box(g, 170, H - 12, 22, 12, INK); box(g, 172, H - 10, 18, 8, pal().chrome[3]); box(g, 172, H - 10, 18, 2, pal().chrome[5]);
  // The tank: rounded, stepped across
  g.fillStyle = INK; g.beginPath(); g.roundRect(94, -252, 116, 250, 10); g.fill();
  g.save(); g.beginPath(); g.roundRect(97, -249, 110, 244, 8); g.clip();
  box(g, 90, -260, 130, 260, P[3]);
  box(g, 97, -249, 22, 244, P[4]); checker(g, 119, -249, 6, 244, P[4], 0, 2);
  box(g, 102, -236, 4, 150, P[5]); checker(g, 102, -86, 4, 30, P[5], 0, 2); box(g, 106, -238, 40, 3, P[5]);
  box(g, 178, -249, 30, 244, P[2]); checker(g, 170, -249, 8, 244, P[2], 0, 2); box(g, 200, -249, 7, 244, P[1]);
  box(g, 97, -249, 110, 8, P[2]); checker(g, 97, -241, 110, 4, P[2], 0, 2);
  box(g, 97, -24, 110, 19, P[1]); checker(g, 97, -32, 110, 8, P[1], 0, 2);
  g.restore();
  // (the lid: overhanging, its top lit, the front, a gold band, its underside dark)
  g.fillStyle = INK; g.beginPath(); g.roundRect(84, -272, 136, 28, 8); g.fill();
  g.fillStyle = P[3]; g.beginPath(); g.roundRect(87, -269, 130, 22, 6); g.fill();
  box(g, 90, -269, 124, 3, P[5]); box(g, 88, -266, 128, 6, P[4]); box(g, 88, -252, 128, 3, P[2]); box(g, 90, -249, 124, 2, P[1]);
  box(g, 88, -257, 128, 3, G[3]); box(g, 88, -257, 128, 1, G[5]); box(g, 196, -266, 20, 14, P[2]);
  // (the handle: a gold escutcheon, the lever out the front)
  ellF(g, 112, -212, 9, 9, INK); ellF(g, 112, -212, 7, 7, G[2]); ellF(g, 110, -214, 4.5, 4.5, G[4]); box(g, 108, -216, 2, 2, G[5]);
  box(g, 76, -216, 36, 9, INK); box(g, 78, -214, 32, 5, G[3]); box(g, 78, -214, 32, 2, G[5]); box(g, 78, -210, 32, 1, G[1]);
  ellF(g, 76, -212, 6, 6, INK); ellF(g, 76, -212, 4.4, 4.4, G[3]); box(g, 74, -215, 2, 2, G[5]);
  // (a gold star on its face, and the maker's oval low down)
  goldStar(g, 156, -140, 18);
  ellF(g, 152, -52, 16, 7, INK); ellF(g, 152, -52, 14, 5, G[3]); box(g, 142, -55, 12, 2, G[5]);
  // (the lid up against the tank: porcelain, gold edged)
  const lid = () => { g.beginPath(); g.moveTo(70, -2); g.lineTo(100, -2); g.lineTo(98, -214); g.quadraticCurveTo(90, -236, 76, -220); g.closePath(); };
  lid(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.fillStyle = P[3]; g.fill();
  g.save(); lid(); g.clip();
  box(g, 66, -240, 10, 240, P[4]); box(g, 74, -220, 3, 180, P[5]); checker(g, 76, -240, 4, 240, P[4], 0, 2);
  box(g, 90, -240, 12, 240, P[2]); box(g, 96, -240, 4, 240, G[3]); box(g, 96, -240, 1, 240, G[5]);
  g.restore();
  // (the hinges)
  for (const hx of [80, 94]) { box(g, hx - 1, -16, 14, 12, INK); box(g, hx, -15, 12, 10, G[3]); box(g, hx, -15, 12, 3, G[5]); box(g, hx + 9, -15, 3, 10, G[1]); }
  paintSeat(g);
};

/** The front: the near half of the seat and its water again (over whatever's gone in), the bowl down to its foot. */
const paintFront = (g: Ctx, H: number) => {
  const { P, G } = ramps();
  // The bowl: one shape from under the seat down to its foot; rounded to the light in steps, the streak of shine round
  // its belly, the trapway's hump down the pedestal, its right in shade, light bounced up under it; ink round it
  const body = () => {
    g.beginPath(); g.moveTo(-112, 10); g.quadraticCurveTo(-118, H * 0.62, -36, H * 0.72);
    g.lineTo(-30, H); g.lineTo(70, H); g.lineTo(74, H * 0.62); g.quadraticCurveTo(108, H * 0.42, 110, 10);
    g.quadraticCurveTo(0, 34, -112, 10); g.closePath();
  };
  g.save(); body(); g.clip();
  box(g, -130, 0, 260, H + 4, P[2]);
  ellF(g, -26, H * 0.36, 96, H * 0.34, P[3]); checker(g, 40, 0, 10, H, P[3], 0, 2);
  ellF(g, -58, H * 0.3, 44, H * 0.2, P[4]); checker(g, -14, H * 0.12, 8, H * 0.3, P[4], 1, 2);
  g.strokeStyle = P[5]; g.lineWidth = 3; g.beginPath(); g.ellipse(-26, H * 0.38, 82, H * 0.28, 0, Math.PI * 0.86, Math.PI * 1.22); g.stroke();
  box(g, -98, H * 0.22, 3, H * 0.14, P[5]);
  box(g, 84, 0, 30, H, P[1]); checker(g, 74, 0, 10, H, P[1], 0, 2);
  box(g, -130, 10, 260, 8, P[1]); checker(g, -130, 18, 260, 6, P[1], 0, 2);
  g.strokeStyle = P[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(66, H - 6); g.quadraticCurveTo(20, H - 10, 26, H * 0.82); g.quadraticCurveTo(32, H * 0.7, 0, H * 0.68); g.stroke();
  g.strokeStyle = P[4]; g.beginPath(); g.moveTo(62, H - 3); g.quadraticCurveTo(16, H - 7, 22, H * 0.82); g.stroke();
  g.strokeStyle = P[3]; g.beginPath(); g.moveTo(-100, H * 0.56); g.quadraticCurveTo(-90, H * 0.68, -40, H * 0.68); g.stroke();
  box(g, -40, H - 8, 120, 8, P[1]); checker(g, -40, H - 14, 120, 6, P[1], 0, 2);
  g.restore();
  body(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  g.save(); g.beginPath(); g.rect(-140, 0, 380, 40); g.clip(); paintSeat(g); g.restore();
  // (the bolt caps on its foot: gold, domed)
  for (const bx of [-26, 66]) { ellF(g, bx, H - 7, 8, 7, INK); ellF(g, bx, H - 7.5, 6.4, 5.4, G[2]); ellF(g, bx - 1.5, H - 9.5, 3.4, 2.6, G[4]); box(g, bx - 3, H - 12, 2, 2, G[5]); }
  // (its shadow on the ground)
  g.fillStyle = 'rgba(24, 14, 20, 0.3)'; g.beginPath(); g.ellipse(30, H, 120, 6, 0, 0, Math.PI); g.fill();
};

const BX = -150, BW = 390;
const seenAt = (v: CView, t: Giant) => vis(v, t.x - 140, t.x + 230, t.y - 290, GY, t.d);
/** Behind the track and the train (the far pass: before the track). */
export const drawGiantBack = (c: Ctx, v: CView) => {
  const t = giant(), H = Math.round(GY - t.y);
  if (!seenAt(v, t)) return;
  stillAt(c, v, t.d, `hwc-giant-back-${H}`, t.x, t.y, BX, -290, BW, H + 300, g => paintBack(g, H));
};
/** Over the track going down into it (and the train, him, once he's past the lip: `flush` 0..1 how far it's gone). */
export const drawGiantFront = (c: Ctx, v: CView, state: GameState, flush = 0) => {
  const t = giant(), H = Math.round(GY - t.y);
  if (!seenAt(v, t)) return;
  stillAt(c, v, t.d, `hwc-giant-front-${H}`, t.x, t.y, BX, -2, BW, H + 14, g => paintFront(g, H));
  if (flush <= 0) return;
  // The flush: the water round and round in bands, drawn in toward the drain, foam on it; the hole opening up
  const f = state.frame, W = ramp6(hour('#4F9CC4'));
  atDepth(c, v.eye, t.d, () => {
    c.save(); c.translate(t.x + 2, t.y + 1);
    c.beginPath(); c.ellipse(0, 0, 90, 14, 0, 0, Math.PI * 2); c.clip();
    c.fillStyle = W[2]; c.fillRect(-92, -16, 184, 32);
    for (let j = 0; j < 5; j++) {
      const u = 1 - (((f * 0.02 + j / 5) % 1)), a0 = f * 0.22 + j * 1.3;
      c.strokeStyle = j % 2 ? W[4] : W[3]; c.lineWidth = 3;
      c.beginPath(); c.ellipse(16 * (1 - u), 2, 88 * u + 6, 13 * u + 1.5, 0, a0, a0 + 2.4); c.stroke();
      c.strokeStyle = W[5]; c.lineWidth = 1;
      c.beginPath(); c.ellipse(16 * (1 - u), 2, 88 * u + 6, 13 * u + 1.5, 0, a0 + 0.3, a0 + 0.9); c.stroke();
    }
    for (let k = 0; k < 14; k++) { const a = f * 0.18 + k * 0.45, r = 0.3 + ((k * 37) % 60) / 100; box(c, Math.cos(a) * 86 * r, Math.sin(a) * 12 * r, 3, 2, W[5]); }
    const hole = Math.min(1, flush * 1.5);
    c.fillStyle = INK; c.beginPath(); c.ellipse(16, 3, 10 + 26 * hole, 2 + 4 * hole, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = W[0]; c.beginPath(); c.ellipse(16, 3, 7 + 22 * hole, 1.2 + 3 * hole, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  });
};
