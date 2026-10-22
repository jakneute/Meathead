// The dino park's painting kit: the intro's (peak SNES: stepped ramps, banded gradients, dithers, stamps), plus what
// faking depth out here takes: where the eye is, where a point at some depth back from the walk plane lands, the ground
// going back, and the visible side and top of anything standing on it.

import { GY } from '../../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../../m1/constants';
import type { GameState } from '../../../../m1/game/core/state';
import { type Ctx, INK, box, rampOf, stamp, hash } from '../../../intro/art/kit';

export * from '../../../intro/art/kit';

/** Where the camera's looking from (the middle of what's on screen, across and a bit up). */
export interface Eye { x: number; y: number }
export const eyeOf = (state: GameState): Eye => {
  const v = state.view;
  if (v && v.w > 0) return { x: v.x + v.w / 2, y: v.y + v.h * 0.42 };
  return { x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT * 0.42 };
};
/** What of the world's on screen (zoomed out by the temple, a lot more of it). */
export const viewOf = (state: GameState) => state.view && state.view.w > 0 ? state.view : { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };

export type Pt = [number, number];
/** A point at (x, y) in the walk plane, pushed back to depth d (1 the walk plane; less, further off). */
export const P = (eye: Eye, x: number, y: number, d: number): Pt => [eye.x + (x - eye.x) * d, eye.y + (y - eye.y) * d];
/** The ground at depth d: the line it's at on screen. */
export const groundAt = (eye: Eye, d: number) => eye.y + (GY - eye.y) * d;
/** How far back the ground's painted (the backdrop's nearest layer meets it there). */
export const FAR = 0.62;

export const quad = (c: Ctx, pts: Pt[], col: string) => {
  c.fillStyle = col; c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath(); c.fill();
};
export const seg = (c: Ctx, a: Pt, b: Pt, col: string, w = 1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
export const rgba = (hex: string, a: number) => { const n = parseInt(hex.slice(1, 7), 16); return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`; };

/**
 * A block standing on the ground (its front: x..x+w, top..bottom, in the walk plane), going back to depth `back`: its
 * side that faces the eye (if either does) and its top (if the eye's over it), each in steps going back, the far
 * edges inked. Drawn before its front. `side`/`top` paint detail onto them, given where (along 0 front .. 1 back, y)
 * lands; `onlySide` skips the top.
 */
export const prism = (c: Ctx, eye: Eye, x: number, top: number, w: number, bottom: number, back: number, col: string,
  opts: { topCol?: string; side?: (pt: (k: number, y: number) => Pt, e: number, s: 1 | -1) => void; top?: (pt: (u: number, k: number) => Pt) => void; noTop?: boolean; noSide?: boolean; shadow?: boolean } = {}) => {
  const r = rampOf(col);
  const at = (xx: number, y: number, k: number) => P(eye, xx, y, 1 - (1 - back) * k);
  // (its shadow on the ground going back, under the side)
  if (opts.shadow !== false && bottom >= GY - 1) {
    const e = eye.x > x + w ? x + w : x;
    const s = eye.x > x + w ? 1 : -1;
    quad(c, [[e, GY], at(e, GY, 1), [at(e, GY, 1)[0] + s * 10, at(e, GY, 1)[1]], [e + s * 12, GY]], 'rgba(20, 14, 10, 0.3)');
  }
  // The side facing the eye
  if (!opts.noSide) for (const s of [1, -1] as const) {
    const e = s > 0 ? x + w : x;
    if ((eye.x - e) * s <= 2) continue;
    const [x1, t1] = at(e, top, 1), [, b1] = at(e, bottom, 1);
    quad(c, [[e, top], [x1, t1], [x1, b1], [e, bottom]], r[1]);
    // (the shades laid over each other to the back rather than side by side: no antialiased hairline between them;
    // 0.13 then 0.15 over it makes the back fifth's 0.26 as before)
    for (const [k0, k1, a] of [[0.5, 1, 0.13], [0.8, 1, 0.15]] as const) {
      const [xa, ta] = at(e, top, k0), [, ba] = at(e, bottom, k0), [xb, tb] = at(e, top, k1), [, bb] = at(e, bottom, k1);
      quad(c, [[xa, ta], [xb, tb], [xb, bb], [xa, ba]], `rgba(12, 10, 28, ${a})`);
    }
    opts.side?.((k, y) => at(e, y, k), e, s);
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, top); c.lineTo(x1, t1); c.lineTo(x1, b1); c.stroke();
  }
  // The top, if he's up over it
  if (!opts.noTop && top > eye.y + 1) {
    const tc = opts.topCol ?? r[3], tr = rampOf(tc);
    const a = at(x, top, 1), b = at(x + w, top, 1);
    quad(c, [[x, top], [x + w, top], b, a], tc);
    // (darker toward the back, in two steps)
    const m0 = at(x, top, 0.6), m1 = at(x + w, top, 0.6);
    quad(c, [m0, m1, b, a], tr[1]);
    opts.top?.((u, k) => at(x + w * u, top, k));
    seg(c, a, b, INK);
  }
};

/** A long still stretch, stamped in chunks (only those on screen put down), each painted clipped to itself. */
const CH = 400;
export const chunked = (c: Ctx, state: GameState, key: string, x0: number, x1: number, y: number, h: number, paint: (g: Ctx, a: number, b: number) => void) => {
  // (culled where it lands on screen: under a push back in depth, that's not where it stands)
  const m = c.getTransform(), W = c.canvas.width;
  void viewOf; void state;
  for (let a = x0; a < x1; a += CH) {
    const b = Math.min(x1, a + CH);
    const sa = m.a * a + m.e, sb = m.a * b + m.e;
    if (Math.max(sa, sb) < -40 || Math.min(sa, sb) > W + 40) continue;
    stamp(c, `${key}:${a}`, a, y, b - a, h, g => { g.save(); g.beginPath(); g.rect(a, y, b - a, h); g.clip(); paint(g, a, b); g.restore(); });
  }
};

/** Specks scattered (the same every time) over a box. */
export const speckle = (g: Ctx, x: number, y: number, w: number, h: number, cols: string[], n: number, seed: number) => {
  for (let i = 0; i < n; i++) {
    const px = x + Math.floor(hash(seed * 0.0137 + i * 1.371) * w / 2) * 2, py = y + Math.floor(hash(seed * 0.0291 + i * 2.713 + 9.1) * h / 2) * 2;
    box(g, px, py, 2, 2, cols[i % cols.length]);
  }
};

/** Yellow-and-black hazard stripes. */
export const hazard = (g: Ctx, x: number, y: number, w: number, h: number) => {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  box(g, x, y, w, h, '#E8B400');
  g.fillStyle = '#1C1A1E';
  for (let s = x - h - 16; s < x + w; s += 16) { g.beginPath(); g.moveTo(s, y + h); g.lineTo(s + 8, y + h); g.lineTo(s + 8 + h, y); g.lineTo(s + h, y); g.closePath(); g.fill(); }
  box(g, x, y, w, 2, 'rgba(255, 255, 255, 0.28)'); box(g, x, y + h - 2, w, 2, 'rgba(0, 0, 0, 0.3)');
  g.restore();
};

/** A standable lip: a lit top edge (the brightest thing on it), a dark line under. */
export const lipOn = (c: Ctx, x: number, y: number, w: number, col: string) => {
  const r = rampOf(col);
  box(c, x, y, w, 2, r[4]); box(c, x, y + 2, w, 2, r[3]); box(c, x, y + 4, w, 1, r[0]);
};

