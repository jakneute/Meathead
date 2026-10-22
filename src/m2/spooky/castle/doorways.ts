// The castle's doorways, between its rooms: each a passage through a thick stone wall, seen from the one eye (the middle
// of the screen, as the floor strip). The wall's side faces go back from his plane to the back walls; the opening's
// far jamb, its lintel's underside (the soffit) and its threshold go back in perspective, so walking through it the
// near and far edges slide past at different rates. A narrow near pillar (the wall's front edge, nearer than him, dark,
// only ever above the opening) slides past faster still: drawFront. The rooms either side show through, each its own
// paper; a little candlelight spills through each one (castleLighting).
//
// Art only: on the same floor the wall stands across the boundary (nothing there to stop him: he walks through the
// opening); where the floor changes, it stands on the boundary's far side over the step the ground makes (solid under
// the opening, open through it). The gallery's far end: the same, the stairs down into the dark through it.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { INK, box, rampOf, mix, checker, brickPattern, hazeBands } from '../../intro/art/kit';
import { GY } from '../geometry';
import { ROOMS, DY, ceilOf, x1 } from './layout';

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];
/** Depths: the back walls (as the floor strip), the opening's far jamb, the near pillar. Half the wall's thickness; how
 *  tall the opening (at most). */
const K = 0.93, DJ = 0.95, DN = 1.12, HW = 70, OPEN = 260;

export interface Doorway { cx: number; top: number; bottom: number; roof: number; low: number; end: boolean }
/** Every doorway (world y): its wall's middle, the opening's top and bottom (the floor through it), the wall's top, how
 *  far down the wall goes under the opening (where the floor steps). */
export const DOORWAYS: Doorway[] = [];
for (let i = 1; i < ROOMS.length; i++) {
  const L = ROOMS[i - 1], R = ROOMS[i], fL = GY + DY[L.id], fR = GY + DY[R.id];
  const cL = ceilOf(L.id) + DY[L.id], cR = ceilOf(R.id) + DY[R.id];
  DOORWAYS.push({
    cx: R.a + (fL === fR ? 0 : HW), top: Math.max(Math.min(fL, fR) - OPEN, Math.max(cL, cR) + 40), bottom: fR,
    roof: Math.min(cL, cR) - 80, low: Math.max(fL, fR), end: false,
  });
}
{ const f = GY + DY.gallery; DOORWAYS.push({ cx: x1 - HW, top: f - OPEN, bottom: f, roof: ceilOf('gallery') + DY.gallery - 80, low: f, end: true }); }

const S = rampOf('#544A4C'), J = rampOf('#3A3234');

const eyeOf = (state: GameState): Pt => [state.camera.x + CANVAS_WIDTH / 2, state.camera.y + CANVAS_HEIGHT * 0.42];
const at = (e: Pt, x: number, y: number, d: number): Pt => [e[0] + (x - e[0]) * d, e[1] + (y - e[1]) * d];
const quad = (c: Ctx, col: string, a: Pt, b: Pt, cc: Pt, d: Pt) => {
  c.fillStyle = col; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(cc[0], cc[1]); c.lineTo(d[0], d[1]); c.closePath(); c.fill();
};
const seg = (c: Ctx, a: Pt, b: Pt, col: string, w = 1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
/** Is it on screen (by where it lands: its back edge at K, its near pillar at DN)? */
const onScreen = (state: GameState, e: Pt, d: Doorway) => {
  const xs = [K, 1, DN].flatMap(k => [at(e, d.cx - HW, 0, k)[0], at(e, d.cx + HW, 0, k)[0]]);
  return Math.max(...xs) > state.camera.x - 20 && Math.min(...xs) < state.camera.x + CANVAS_WIDTH + 20;
};

/** A side face of the wall (the plane x = sx), from y0 to y1, going back from depth d1 to d0: in bands, darker going
 *  back; its courses running back to the eye. */
const sideFace = (c: Ctx, e: Pt, sx: number, y0: number, y1: number, d0: number, d1: number) => {
  // (how wide it is on screen: seen edge-on it narrows to nothing, its lines with it)
  const wide = Math.abs(sx - e[0]) * (d1 - d0);
  if (wide < 0.5) return;
  const n = 4;
  // (each band on to the back, the next over it: no antialiased hairline between bands crawling as it scrolls)
  for (let i = 0; i < n; i++) {
    const a = d1 - (d1 - d0) * i / n;
    quad(c, mix(S[1], S[0], i / (n - 1)), at(e, sx, y0, a), at(e, sx, y0, d0), at(e, sx, y1, d0), at(e, sx, y1, a));
  }
  if (wide < 3) return;
  c.strokeStyle = S[0]; c.lineWidth = 1; c.beginPath();
  for (let y = Math.ceil(y0 / 32) * 32; y < y1; y += 32) { const p = at(e, sx, y, d1), q = at(e, sx, y, d0); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); }
  c.stroke();
  // (where it meets the back wall: a dark corner)
  seg(c, at(e, sx, y0, d0), at(e, sx, y1, d0), INK, Math.min(2, wide / 3));
};
/** A face square-on to him, d deep (the stone's courses scale with it). */
const flatFace = (c: Ctx, e: Pt, x0: number, y0: number, x1_: number, y1: number, d: number, dark: boolean) => {
  c.save(); c.translate(e[0] * (1 - d), e[1] * (1 - d)); c.scale(d, d);
  c.fillStyle = dark ? brickPattern(c, 'cDoorJamb', 34, 16, [J[2], J[1]], J[0]) : brickPattern(c, 'cDoorStone', 34, 16, [S[2], mix(S[2], S[1], 0.4)], S[0]);
  c.fillRect(x0, y0, x1_ - x0, y1 - y0);
  c.restore();
};

/** The doorways, behind him (drawn after the rooms' walls, before what he stands on). */
export const drawDoorways = (c: Ctx, state: GameState) => {
  const e = eyeOf(state);
  for (const d of DOORWAYS) {
    if (!onScreen(state, e, d)) continue;
    const xa = d.cx - HW, xb = d.cx + HW, side = e[0] < xa ? xa : e[0] > xb ? xb : null;
    if (d.end) {
      // (beyond the gallery's end: the stairwell down into the dark, its steps going down and away)
      box(c, xa, d.roof, 420, d.bottom - d.roof + 300, '#050303');
      for (let k = 0; k < 10; k++) { const sx = xa + k * 26, sy = d.bottom + k * 14, f = k / 10; box(c, sx, sy, 300, 14, mix(S[2], '#050303', f)); box(c, sx, sy, 300, 2, mix(S[4], '#050303', f)); }
    }
    // Behind the opening: the wall going on back from its far jamb to the back walls, and the far jamb itself
    if (side !== null) sideFace(c, e, side, d.top, d.bottom, K, DJ);
    {
      const [ax, ay] = at(e, xa, d.top, DJ), [bx, by] = at(e, xb, d.bottom, DJ);
      flatFace(c, e, xa, d.top, xb, d.bottom, DJ, true);
      // (the passage's far wall in its own shade: darkest in the middle, the rooms' light at either end of it)
      const w = bx - ax;
      for (let k = 1; k < 5; k++) { const inset = w * k / 10; box(c, ax + inset, ay, w - inset * 2, by - ay, `rgba(6, 2, 4, ${0.18 * k})`); }
      hazeBands(c, ax, ay, w, (by - ay) * 0.5, '#060204', 0.6, 0, 4);
      checker(c, ax, ay, w, 6, J[0]); box(c, ax, by - 2, w, 2, J[3]);
    }
    // Above the opening (and under it, where the floor steps): the wall's side, the whole way back
    if (side !== null) { sideFace(c, e, side, d.roof, d.top, K, 1); if (d.low > d.bottom) sideFace(c, e, side, d.bottom, d.low, K, 1); }
    // The soffit under the lintel (he's under it: going back, dark), and the threshold (stone, worn, lit at its edge)
    if (e[1] > d.top) {
      quad(c, J[1], at(e, xa, d.top, 1), at(e, xb, d.top, 1), at(e, xb, d.top, DJ), at(e, xa, d.top, DJ));
      for (const k of [0.97, 0.985]) seg(c, at(e, xa, d.top, k), at(e, xb, d.top, k), J[0]);
    }
    if (e[1] < d.bottom) {
      quad(c, S[2], at(e, xa, d.bottom, DJ), at(e, xb, d.bottom, DJ), at(e, xb, d.bottom, 1), at(e, xa, d.bottom, 1));
      const m = at(e, xa, d.bottom, (1 + DJ) / 2), n = at(e, xb, d.bottom, DJ);
      checker(c, Math.min(m[0], n[0]), n[1], Math.abs(at(e, xb, d.bottom, DJ)[0] - at(e, xa, d.bottom, DJ)[0]), Math.max(2, m[1] - n[1]), 'rgba(10, 4, 6, 0.55)');
      seg(c, at(e, xa, d.bottom, 1), at(e, xb, d.bottom, 1), S[4], 2);
    }
    // The wall's front, square-on, at his plane: above the opening, and under it where the floor steps
    flatFace(c, e, xa, d.roof, xb, d.top, 1, false);
    if (d.low > d.bottom) { flatFace(c, e, xa, d.bottom, xb, d.low, 1, false); box(c, xa, d.bottom, 2 * HW, 2, S[4]); box(c, xa, d.bottom + 2, 2 * HW, 2, S[3]); }
    // (its edges: lit on the left, shaded on the right; a molding under the lintel, its keystone)
    box(c, xa, d.roof, 2, d.top - d.roof, S[3]); box(c, xb - 2, d.roof, 2, d.top - d.roof, S[0]);
    box(c, xa - 4, d.top - 14, 2 * HW + 8, 14, INK); box(c, xa - 3, d.top - 13, 2 * HW + 6, 12, S[2]); box(c, xa - 3, d.top - 13, 2 * HW + 6, 2, S[4]); box(c, xa - 3, d.top - 3, 2 * HW + 6, 2, S[0]);
    // (the opening's top corners rounded off into an arch: stepped stone haunches either side, at his plane, overhead)
    [36, 26, 19, 13, 8, 4, 1].forEach((hw, k) => {
      const y = d.top + k * 6;
      box(c, xa, y, hw + 1, 6, INK); box(c, xa, y, hw, 6, k % 2 ? S[2] : mix(S[2], S[1], 0.4)); box(c, xa, y, hw, 1, S[3]);
      box(c, xb - hw - 1, y, hw + 1, 6, INK); box(c, xb - hw, y, hw, 6, k % 2 ? S[1] : mix(S[1], S[0], 0.4));
    });
    box(c, d.cx - 9, d.top - 34, 18, 22, INK); box(c, d.cx - 8, d.top - 33, 16, 20, S[3]); box(c, d.cx - 8, d.top - 33, 16, 2, S[4]); box(c, d.cx - 3, d.top - 27, 6, 8, S[1]);
  }
};

/** The near pillars: each doorway's wall carried out past his plane, dark against the light, only ever above the
 *  opening's top (never over him, nor anything he needs to see). Over everything. */
export const drawDoorwaysFront = (c: Ctx, state: GameState) => {
  const e = eyeOf(state);
  for (const d of DOORWAYS) {
    if (d.end || !onScreen(state, e, d)) continue;
    // (a slim pillar at each of the wall's corners; each one's side face narrowing to nothing as the eye comes level
    // with it and opening out on its other side past it: both always drawn, nothing switching over)
    const cut = at(e, d.cx, d.top, 1)[1] - 16;
    c.save(); c.beginPath(); c.rect(state.camera.x - 100, d.roof - 2000, CANVAS_WIDTH + 200, cut - (d.roof - 2000)); c.clip();
    for (const xa of [d.cx - HW, d.cx + HW - 16]) {
      const xb = xa + 16, side = e[0] < xa ? xa : e[0] > xb ? xb : null;
      if (side !== null) quad(c, '#140A0C', at(e, side, d.roof, 1), at(e, side, d.roof, DN), at(e, side, d.top - 16, DN), at(e, side, d.top - 16, 1));
      const [ax, ay] = at(e, xa, d.roof, DN), [bx, by] = at(e, xb, d.top - 16, DN);
      box(c, ax - 1, ay, bx - ax + 2, by - ay, INK); box(c, ax, ay, bx - ax, by - ay, '#1A0E10');
      // (a rim of candlelight down the edge facing the room it stands in; a dark cap at its foot)
      box(c, xa < d.cx ? ax : bx - 3, ay, 3, by - ay, '#4A3030');
      box(c, ax - 3, by - 12, bx - ax + 6, 12, INK); box(c, ax - 2, by - 11, bx - ax + 4, 10, '#24161A'); box(c, ax - 2, by - 11, bx - ax + 4, 1, '#4A3030');
    }
    c.restore();
  }
};
