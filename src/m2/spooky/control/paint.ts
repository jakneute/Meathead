// The control room's, the gift shop's and the ballroom's painting kit: the intro's SNES kit (stepped ramps, dithered
// seams, ink lines, stamps) plus the light fake 3D these indoor rooms get. One eye per scene (the middle of the screen,
// a little above halfway); the back wall stands WALL_D back (so it parallaxes a touch and everything on it shrinks with
// it), the floor runs from its foot forward to his plane (its seams going back to the eye), and a wall end or a
// partition shows the one side of it that faces the eye. Walls stay straight: nothing bends.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { GY } from '../geometry';
import { INK, box, rampOf, checker, stamp, mix, sign } from '../../intro/art/kit';
import { type Look, signW, signH, plate } from '../../signLetters';

export {
  INK, box, text, slab, pole, ball, sign, rampOf, dark, lite, mix, checker, bandedGradient, steppedGlow, stamp, hash,
  pixelBlob, hazeBands, PIX,
} from '../../intro/art/kit';

type Ctx = CanvasRenderingContext2D;
export type P = [number, number];
export interface Eye { x: number; y: number }

/** How far back the rooms' back walls stand. */
export const WALL_D = 0.86;
/** The rooms' ceilings (world y at their plane). */
export const CEIL = GY - 560;

export const eyeOf = (state: GameState): Eye => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT * 0.42 });
/** Draws `paint` as if `d` back. */
export const inDepth = (c: Ctx, eye: Eye, d: number, paint: () => void) => {
  c.save(); c.translate(eye.x * (1 - d), eye.y * (1 - d)); c.scale(d, d); paint(); c.restore();
};
/** A point `d` back, where it's drawn. */
export const at = (eye: Eye, x: number, y: number, d: number): P => [eye.x + (x - eye.x) * d, eye.y + (y - eye.y) * d];
/** The x span (in that layer's own units) that's on screen at depth d. */
export const spanAt = (eye: Eye, d: number, pad = 60): P => [eye.x - CANVAS_WIDTH / 2 / d - pad, eye.x + CANVAS_WIDTH / 2 / d + pad];
export const quad = (c: Ctx, col: string, a: P, b: P, cc: P, dd: P) => {
  c.fillStyle = col; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(cc[0], cc[1]); c.lineTo(dd[0], dd[1]); c.closePath(); c.fill();
};
export const seg = (c: Ctx, a: P, b: P, col: string, w = 1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
/** An ink-outlined box. */
export const ol = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { box(c, x - 1, y - 1, w + 2, h + 2, INK); box(c, x, y, w, h, col); };
/** A box shaded in steps: lit top and left, shadowed bottom and right (no ink unless asked). */
export const shade = (c: Ctx, x: number, y: number, w: number, h: number, col: string, ink = true, e = 2) => {
  const r = rampOf(col);
  if (ink) box(c, x - 1, y - 1, w + 2, h + 2, INK);
  box(c, x, y, w, h, col);
  if (w > e * 2 && h > e * 2) {
    box(c, x, y, w, e, r[3]); box(c, x, y, e, h, r[3]);
    box(c, x, y + h - e, w, e, r[1]); box(c, x + w - e, y + e, e, h - e, r[1]);
    box(c, x, y, w, 1, r[4]);
  }
};
/** A filled path, ink round it (`ink` px), then the fill. */
export const inked = (c: Ctx, path: () => void, col: string, ink = 2) => {
  c.beginPath(); path();
  if (ink > 0) { c.strokeStyle = INK; c.lineWidth = ink; c.lineJoin = 'round'; c.stroke(); }
  c.fillStyle = col; c.fill();
};

/** Something stood on: a front, its lip lit along the top (two steps), its edge dark under the lip. */
export const standTop = (c: Ctx, x: number, top: number, w: number, col: string, lip: string) => {
  const r = rampOf(lip);
  box(c, x - 1, top - 1, w + 2, 9, INK);
  box(c, x, top, w, 7, col);
  box(c, x, top, w, 2, r[4]); box(c, x, top + 2, w, 2, r[3]);
  checker(c, x, top + 4, w, 2, r[2]);
  box(c, x, top + 6, w, 1, rampOf(col)[1]);
};

/**
 * The floor from the back wall's foot forward to his plane: `cols` back to front, each band dithered into the next,
 * seams going back to the eye every `seam`, joints across at `across` depths. World x from L to R.
 */
export const backFloor = (c: Ctx, eye: Eye, L: number, R: number, cols: string[], seam: number, seamCol: string, across: number[] = []) => {
  const n = cols.length;
  const fy = (d: number) => eye.y + (GY - eye.y) * d;
  const [s0, s1] = spanAt(eye, WALL_D, 0);
  const a = Math.max(L, s0 - 200), b = Math.min(R, s1 + 200);
  if (b <= a) return;
  for (let i = 0; i < n; i++) {
    const d0 = WALL_D + (1 - WALL_D) * (i / n), d1 = WALL_D + (1 - WALL_D) * ((i + 1) / n);
    const y0 = Math.floor(fy(d0)), y1 = Math.ceil(fy(d1));
    box(c, a, y0, b - a, y1 - y0 + 1, cols[i]);
    if (i) checker(c, a, y0, b - a, 2, cols[i - 1]);
  }
  c.strokeStyle = seamCol; c.lineWidth = 1; c.beginPath();
  for (let x = Math.floor(Math.max(L, s0 - 200) / seam) * seam; x < b + seam; x += seam) {
    const p = at(eye, x, GY, WALL_D), q = at(eye, x, GY, 1);
    if (Math.max(p[0], q[0]) < L || Math.min(p[0], q[0]) > R) continue;
    c.moveTo(Math.max(L, Math.min(R, p[0])), p[1]); c.lineTo(Math.max(L, Math.min(R, q[0])), q[1]);
  }
  c.stroke();
  for (const d of across) box(c, a, Math.round(fy(d)), b - a, 1, seamCol);
};

/** The floor from the back wall's foot forward as tiles (`size` wide at his plane, `rows` deep), two colors checkered,
 *  the rows further back a step darker, grout between. */
export const tileFloor = (c: Ctx, eye: Eye, L: number, R: number, size: number, cols: [string, string], rows: number, grout: string) => {
  const [s0, s1] = spanAt(eye, WALL_D, 0);
  const a = Math.max(L, Math.floor((s0 - 200) / size) * size), b = Math.min(R, s1 + 200);
  if (b <= a) return;
  for (let r = 0; r < rows; r++) {
    const d0 = WALL_D + (1 - WALL_D) * (r / rows), d1 = WALL_D + (1 - WALL_D) * ((r + 1) / rows);
    const k = (rows - 1 - r) * 0.09;
    const ca = mix(cols[0], INK, k), cb = mix(cols[1], INK, k);
    for (let x = a; x < b; x += size) {
      const x2 = Math.min(b, x + size);
      quad(c, (Math.floor(x / size) + r) % 2 ? ca : cb, at(eye, x, GY, d0), at(eye, x2, GY, d0), at(eye, x2, GY, d1), at(eye, x, GY, d1));
    }
    box(c, a, Math.round(eye.y + (GY - eye.y) * d0), b - a, 1, grout);
  }
  c.strokeStyle = grout; c.lineWidth = 1; c.beginPath();
  for (let x = a; x <= b; x += size) { const p = at(eye, x, GY, WALL_D), q = at(eye, x, GY, 1); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); }
  c.stroke();
};

/** A sign board sized to its words, its middle at (cx, cy). */
export const plaque = (c: Ctx, cx: number, cy: number, words: string, face: string, ink: string, size = 8, frame?: string, look?: Look) => {
  // (the staff's plain enamel, unless it's given a look of its own)
  const L = look ?? plate(size, ink, mix(face, INK, 0.45)), w = Math.ceil(signW(words, L)) + 16, h = Math.max(size, signH(L)) + 10;
  sign(c, cx - w / 2, cy - h / 2, w, h, face, words, ink, size, frame, L);
};

/**
 * The back wall from L to R (world, at WALL_D: in its own units), in stamped tiles `tw` wide from CEIL - 200 down to
 * the floor: `paint(g, x, i)` paints tile i, whose left edge is at x (every tile with the same `variant(i)` is the same
 * picture). Only the tiles on screen.
 */
export const wallRun = (c: Ctx, eye: Eye, key: string, L: number, R: number, tw: number, variants: number,
  paint: (g: Ctx, x: number, v: number) => void, haze?: string) => {
  const top = CEIL - 260;
  inDepth(c, eye, WALL_D, () => {
    const [s0, s1] = spanAt(eye, WALL_D, 10);
    const a = Math.max(L, s0), b = Math.min(R, s1);
    if (b <= a) return;
    c.save(); c.beginPath(); c.rect(L, top, R - L, GY - top); c.clip();
    for (let i = Math.floor((a - L) / tw); L + i * tw < b; i++) {
      const x = L + i * tw, v = ((i % variants) + variants) % variants;
      c.save(); c.translate(x, 0);
      stamp(c, `${key}:${v}`, 0, top, tw, GY - top, g => paint(g, 0, v));
      c.restore();
    }
    // (a little air between him and it: the wall a step dimmer than what's at his plane)
    if (haze) { c.fillStyle = haze; c.fillRect(a, top, b - a, GY - top); }
    c.restore();
  });
};

/**
 * A wall end or partition at x = X (its face at his plane), from `top` to the floor, going straight back to the back
 * wall: drawn only if it faces the eye (`side`: -1 its left face, 1 its right). Banded darker going back.
 */
export const wallSide = (c: Ctx, eye: Eye, X: number, side: -1 | 1, top: number, col: string, courses = false) => {
  if (side < 0 ? eye.x >= X : eye.x <= X) return;
  const r = rampOf(col);
  const ds = [1, 0.97, 0.94, 0.91, 0.885, WALL_D];
  for (let i = 0; i < ds.length - 1; i++) quad(c, mix(r[1], INK, i * 0.1), at(eye, X, top, ds[i]), at(eye, X, top, ds[i + 1]), at(eye, X, GY, ds[i + 1]), at(eye, X, GY, ds[i]));
  if (courses) {
    // (block courses going back along it, every 16; the base dark)
    c.strokeStyle = mix(r[0], INK, 0.2); c.lineWidth = 1; c.beginPath();
    for (let y = GY - 16; y > top; y -= 16) { const a = at(eye, X, y, 1), b = at(eye, X, y, WALL_D); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
    c.stroke();
    quad(c, '#1E1A17', at(eye, X, GY - 12, 1), at(eye, X, GY - 12, WALL_D), at(eye, X, GY, WALL_D), at(eye, X, GY, 1));
  }
  seg(c, at(eye, X, top, WALL_D), at(eye, X, GY, WALL_D), INK, 2);
};

/** The ceiling's underside from his plane back to the back wall (he's under it): banded, joints going back. */
export const ceiling = (c: Ctx, eye: Eye, L: number, R: number, cols: string[], beam: number, beamCol: string) => {
  if (eye.y <= CEIL) return;
  const n = cols.length;
  for (let i = 0; i < n; i++) {
    const d0 = 1 - (1 - WALL_D) * (i / n), d1 = 1 - (1 - WALL_D) * ((i + 1) / n);
    quad(c, cols[i], at(eye, L, CEIL, d0), at(eye, R, CEIL, d0), at(eye, R, CEIL, d1), at(eye, L, CEIL, d1));
  }
  const [s0, s1] = spanAt(eye, 1, 100);
  c.strokeStyle = beamCol; c.lineWidth = 1; c.beginPath();
  for (let x = Math.ceil(Math.max(L, s0) / beam) * beam; x < Math.min(R, s1); x += beam) { const p = at(eye, x, CEIL, 1), q = at(eye, x, CEIL, WALL_D); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); }
  c.stroke();
};

/** The ground in front at his plane (down from GY, off the bottom of the screen): banded, its top lit (walked on). */
export const frontFloor = (c: Ctx, L: number, R: number, cols: string[], lip: string) => {
  const r = rampOf(lip);
  for (let i = 0; i < cols.length; i++) box(c, L, GY + 4 + i * 10, R - L, i === cols.length - 1 ? 400 : 10, cols[i]);
  for (let i = 1; i < cols.length; i++) checker(c, L, GY + 4 + i * 10, R - L, 2, cols[i - 1]);
  box(c, L, GY, R - L, 2, r[4]); box(c, L, GY + 2, R - L, 2, r[2]);
};
