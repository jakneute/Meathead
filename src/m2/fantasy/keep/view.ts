// The castle's base's view helpers (one eye over the scene: kit.ts's view): a strip of ground between two depths, what
// of a run is on screen at a depth, a run of still art painted in stretches (a stamp each, only those on screen put
// down), and where a point at a depth lands.

import { CANVAS_WIDTH } from '../../../m1/constants';
import { type Ctx, type View, at, stillAt, seen, polyF } from '../kit';
import { X, Y, GY } from './layout';

/** A strip of ground between two depths (world x a..b at height y). */
export const Q = (c: Ctx, v: View, a: number, b: number, d0: number, d1: number, col: string, y = GY) =>
  polyF(c, [at(v.eye, a, y, d0), at(v.eye, b, y, d0), at(v.eye, b, y, d1), at(v.eye, a, y, d1)], col);
/** The world x range of a..b that's on screen at depth d. */
export const clipAt = (v: View, a: number, b: number, d: number, m = 60): [number, number] => {
  const L = v.eye.x + (v.cam.x - m - v.eye.x) / d, Rr = v.eye.x + (v.cam.x + CANVAS_WIDTH + m - v.eye.x) / d;
  return [Math.max(a, L), Math.min(b, Rr)];
};
/** Is world x a..b (play plane) on screen? */
export const onScreenV = (v: View, a: number, b: number) => b > v.cam.x - 60 && a < v.cam.x + CANVAS_WIDTH + 60;
/** Where a thing at rx (from the section's start), height h, depth d lands. */
export const scr = (v: View, rx: number, h: number, d: number) => at(v.eye, X(rx), Y(h), d);

/** A run of still art at depth d along rx a..b, standing on height `foot`, painted in stretches (a stamp each, only the
 *  ones on screen put down). `paint(g, w, sx)`: local coords, x 0..w (the stretch starts at rx sx), y up from 0 (the
 *  foot) to -up, down to `down`. */
export const SEG = 320;
export const run = (c: Ctx, v: View, d: number, key: string, ra: number, rb: number, foot: number, up: number, paint: (g: Ctx, w: number, sx: number) => void, down = 4) => {
  for (let sx = Math.floor(ra / SEG) * SEG; sx < rb; sx += SEG) {
    const s0 = Math.max(ra, sx), s1 = Math.min(rb, sx + SEG), w = s1 - s0;
    if (w <= 0 || !seen(v, X(s0), X(s1), d, 40)) continue;
    const top = Y(foot) - up, bot = Y(foot) + down;
    if (at(v.eye, X(s0), bot, d)[1] < v.cam.y - 20 || at(v.eye, X(s0), top, d)[1] > v.cam.y + 640) continue;
    stillAt(c, v, d, `kp-${key}-${s0}`, X(s0), Y(foot), -2, -up, w + 4, up + down, g => {
      g.save(); g.beginPath(); g.rect(0, -up, w, up + down); g.clip(); paint(g, w, s0); g.restore();
    });
  }
};
