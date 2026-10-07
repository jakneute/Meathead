// The cutscenes' set dressing, done the SNES way: doors, plaques, posters, panels and glass as inked slabs, bevelled
// (lit along the top and left, shadowed along the bottom and right), their faces shaded in stepped ramps with the
// ordered dither where the steps meet. Everything here goes through `shaded`, so each shape is worked out pixel by
// pixel once and then blitted; meant for the static backgrounds (themselves painted once with `layer`).

import { shaded, RAMP } from './snes';
import { bayer } from './raster';

type Ctx = CanvasRenderingContext2D;

/** The ink round set dressing (a warm black, like the figures'). */
export const SET_INK = '#120a10';

const fill = (g: Ctx, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/** Paper, darkest to lightest (a poster, a notice, a file). */
export const PAPER = ['#8c8a7c', '#b0ae9e', '#cecbb8', '#e4e1cc', '#f4f1de', '#fcfaf0'];
/** Frosted glass in a door. */
export const FROST = ['#5c6c6c', '#74868a', '#8c9ea0', '#a8b8b8', '#c4d0ce', '#dce6e2'];
/** A painted steel door (institutional green-grey). */
export const DOOR_GREEN = ['#141a17', '#1e2622', '#28322d', '#334039', '#405048', '#506258', '#647a6e'];
/** Brass (a handle, a number plate, a frame). */
export const BRASS = ['#3c2804', '#6a4a0c', '#9a7018', '#c49a2c', '#e4c050', '#f8e290'];

export interface SlabOpts {
  /** The bevel's width (px). */
  b?: number;
  /** How lit the face is at its top, and at its bottom (0..1). */
  hi?: number; lo?: number;
  /** Let into the wall (a recess, a panel): the bevel lit along the bottom and right instead. */
  inset?: boolean;
  /** The outline round it (null: none). */
  ink?: string | null;
  /** How lit the face is, by its across (0..1 each way): added to the falloff (a sheen, a pool of light). */
  tex?: (u: number, v: number) => number;
  /** A key of its own (when `tex` differs between two slabs on the same ramp). */
  key?: string;
}

/**
 * A slab, its top left at (x, y): bevelled, the face falling off in steps of `ramp` from top to bottom, dithered where
 * they meet; inked round the outside (the ink outside the w x h, so the slab itself keeps its size).
 */
export const slab = (g: Ctx, x: number, y: number, w: number, h: number, ramp: string[], o: SlabOpts = {}) => {
  const b = o.b ?? 1, hi = o.hi ?? 0.62, lo = o.lo ?? 0.4, inset = !!o.inset, tex = o.tex;
  w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
  if (o.ink !== null) fill(g, x - 1, y - 1, w + 2, h + 2, o.ink ?? SET_INK);
  const key = `slab|${o.key ?? ''}|${ramp.join('')}|${b}|${hi}|${lo}|${inset ? 1 : 0}`;
  shaded(g, key, x, y, w, h, ramp, (u, v) => {
    const px = u * w, py = v * h, dt = py, dl = px, db = h - py, dr = w - px, m = Math.min(dt, dl, db, dr);
    let l = hi + (lo - hi) * v + (tex ? tex(u, v) : 0);
    if (m < b) {
      const lit = m === dt || m === dl;
      l = inset ? (lit ? Math.min(l, lo) - 0.28 : Math.max(l, hi) + 0.22) : (lit ? Math.max(l, hi) + 0.28 : Math.min(l, lo) - 0.3);
    }
    return Math.max(0, Math.min(1, l));
  });
};

/** A run of glass (a window, a mirror, a frosted pane): banded down, a streak of light across it at a slant. */
export const glass = (g: Ctx, x: number, y: number, w: number, h: number, ramp: string[], key = '') => {
  w = Math.round(w); h = Math.round(h);
  shaded(g, `glass|${key}|${ramp.join('')}`, x, y, w, h, ramp, (u, v) => {
    const px = u * w, py = v * h, d = px + py * 0.6;
    const streak = (d % 22) < 3 ? 0.35 : (d % 22) < 5 ? 0.18 : 0;
    return 0.72 - v * 0.42 + streak;
  });
};

export interface DoorOpts {
  /** The door's own colour, and its frame's. */
  leaf?: string[]; frame?: string[];
  /** A window in the top half of it: frosted, or wired safety glass. */
  window?: 'frost' | 'wire' | null;
  /** Which side the handle's on (1: right). */
  handle?: 1 | -1;
  /** A steel kick plate along the bottom. */
  kick?: boolean;
  /** Two panels let into it (when there's no window). */
  panels?: boolean;
  /** The frame's width. */
  fw?: number;
}

/**
 * A door, shut, in its frame: the frame bevelled round it, the leaf in it (the gap round the leaf in shadow), a window
 * of frosted or wired glass let into the top, or two panels; the lever handle on its backplate; the kick plate along
 * the bottom, screwed on; the shadow it throws across the floor. (x, y): the frame's top left; h down to the floor.
 */
export const door = (g: Ctx, x: number, y: number, w: number, h: number, o: DoorOpts = {}) => {
  const L = o.leaf ?? DOOR_GREEN, F = o.frame ?? RAMP.steel, fw = o.fw ?? 3, side = o.handle ?? 1, St = RAMP.steel;
  // The frame (its jambs and head), then the leaf in it, the gap round the leaf dark
  slab(g, x, y, w, h, F, { b: 1, hi: 0.58, lo: 0.42 });
  const lx = x + fw, ly = y + fw, lw = w - fw * 2, lh = h - fw;
  fill(g, lx - 1, ly - 1, lw + 2, lh + 1, SET_INK);
  slab(g, lx, ly, lw, lh, L, { b: 1, hi: 0.6, lo: 0.32, ink: null });
  // The window, or the panels
  if (o.window) {
    const ww = Math.round(lw * 0.56), wh = Math.round(lh * 0.24), wx = lx + Math.round((lw - ww) / 2), wy = ly + Math.round(lh * 0.1);
    slab(g, wx - 2, wy - 2, ww + 4, wh + 4, L, { b: 1, inset: true, hi: 0.5, lo: 0.4, ink: null });
    fill(g, wx - 1, wy - 1, ww + 2, wh + 2, SET_INK);
    glass(g, wx, wy, ww, wh, FROST, 'door');
    if (o.window === 'wire') for (let yy = wy; yy < wy + wh; yy++) for (let xx = wx; xx < wx + ww; xx++) if ((xx - wx + yy - wy) % 4 === 0 || (xx - wx - (yy - wy) + 400) % 4 === 0) fill(g, xx, yy, 1, 1, 'rgba(40, 50, 52, 0.35)');
  }
  if (o.panels ?? !o.window) {
    const pw = lw - 8, top = o.window ? ly + Math.round(lh * 0.42) : ly + 5;
    const ph1 = o.window ? 0 : Math.round(lh * 0.36), ph2 = Math.round(lh * (o.window ? 0.3 : 0.36));
    if (ph1) slab(g, lx + 4, top, pw, ph1, L, { b: 1, inset: true, hi: 0.5, lo: 0.36, ink: null });
    slab(g, lx + 4, o.window ? top : top + ph1 + 6, pw, ph2, L, { b: 1, inset: true, hi: 0.5, lo: 0.36, ink: null });
  }
  // The handle: the backplate, the lever out off it, lit along its top
  const hx = side > 0 ? lx + lw - 5 : lx + 2, hy = ly + Math.round(lh * 0.5);
  slab(g, hx, hy - 3, 3, 8, St, { b: 1, hi: 0.6, lo: 0.4 });
  const lvx = side > 0 ? hx - 4 : hx + 2;
  fill(g, lvx - 1, hy - 1, 7, 4, SET_INK);
  fill(g, lvx, hy, 5, 2, St[3]); fill(g, lvx, hy, 5, 1, St[5]); fill(g, side > 0 ? hx : hx + 1, hy, 2, 2, St[4]);
  // The kick plate, screwed on
  if (o.kick) {
    const kh = Math.max(4, Math.round(lh * 0.1)), ky = ly + lh - kh - 1;
    slab(g, lx + 1, ky, lw - 2, kh, St, { b: 1, hi: 0.55, lo: 0.38, ink: L[0] });
    for (const sx of [lx + 2, lx + lw - 3]) { fill(g, sx, ky + 1, 1, 1, St[1]); fill(g, sx, ky + kh - 2, 1, 1, St[1]); }
  }
};

/**
 * A sign or plaque: a bevelled slab in `ramp`, inked, a hairline lit round inside the bevel; the lettering goes on
 * after. (A sign's face lit a little more at the top.)
 */
export const plaque = (g: Ctx, x: number, y: number, w: number, h: number, ramp: string[], b = 2) =>
  slab(g, x, y, w, h, ramp, { b, hi: 0.66, lo: 0.42 });

/**
 * A sheet of paper on a wall (a poster, a notice): the paper shaded down it, the bottom corner curling off the wall
 * (its back showing, its shadow under), a strip of tape across each top corner; a thin shadow down its right.
 */
export const paper = (g: Ctx, x: number, y: number, w: number, h: number, ramp: string[] = PAPER, curl = 4) => {
  fill(g, x + 1, y + 1, w, h, 'rgba(0, 0, 0, 0.35)');
  slab(g, x, y, w, h, ramp, { b: 1, hi: 0.86, lo: 0.6, ink: null });
  if (curl) {
    // (the corner peeled off the wall: what's behind it, then the back of the paper)
    for (let k = 0; k < curl; k++) {
      fill(g, x + w - curl + k, y + h - 1 - k, curl - k, 1, 'rgba(0, 0, 0, 0.45)');
      fill(g, x + w - curl + k, y + h - curl + k, 1, curl - k, ramp[Math.max(0, ramp.length - 2 - (k % 2))]);
    }
    fill(g, x + w - curl, y + h - curl, 1, curl, ramp[1]);
  }
  // (tape)
  for (const tx of [x - 2, x + w - 5]) { fill(g, tx, y - 2, 7, 4, '#e8dcb0'); fill(g, tx, y - 2, 7, 1, '#f8f0d0'); fill(g, tx, y + 1, 7, 1, '#c4b888'); for (let k = 0; k < 4; k++) if ((k & 1) === 0) fill(g, tx + (k ? 6 : 0), y - 2 + k, 1, 1, '#b4a878'); }
};

/** A dithered scatter of `c` over a rect, `a` (0..1) of it (a smudge, grime, a pool of light). */
export const stipple = (g: Ctx, x: number, y: number, w: number, h: number, c: string, a: number | ((u: number, v: number) => number)) => {
  g.fillStyle = c;
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    const k = typeof a === 'number' ? a : a((xx + 0.5) / w, (yy + 0.5) / h);
    if (bayer(x + xx, y + yy) + 0.5 < k) g.fillRect(x + xx, y + yy, 1, 1);
  }
};

/** A strip light up on a ceiling: the steel housing, the diffuser lit, its ends. `on`: lit or not. */
export const tubeFixture = (g: Ctx, x: number, y: number, w: number, on = true) => {
  slab(g, x, y, w, 2, RAMP.steel, { b: 0, hi: 0.5, lo: 0.3 });
  fill(g, x + 1, y + 2, w - 2, 2, on ? '#fcfcf0' : '#7c7c70'); fill(g, x + 1, y + 3, w - 2, 1, on ? '#e8e8d4' : '#5c5c54');
  if (on) for (let k = 3; k < w - 3; k += 6) fill(g, x + k, y + 2, 2, 1, '#ffffff');
  fill(g, x, y + 2, 1, 2, RAMP.steel[2]); fill(g, x + w - 1, y + 2, 1, 2, RAMP.steel[1]);
};

/** A ramp (darkest to lightest, `n` steps) worked out from one colour: down toward black, up toward white. */
export const rampOf = (hex: string, n = 6) => {
  const c = parseInt(hex.slice(1), 16), ch = [(c >> 16) & 255, (c >> 8) & 255, c & 255];
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1) * 1.5 - 0.95;
    const v = ch.map(x => Math.round(k < 0 ? x * (1 + k * 0.85) : x + (255 - x) * k * 0.7));
    out.push('#' + v.map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join(''));
  }
  return out;
};

/** The light round a cylinder stood up (a bottle, a can, a bucket): lit down its left, falling off to its right. */
export const upright = (amb = 0.18) => (u: number, v: number) => { const n = u * 2 - 1; return amb + (1 - amb) * Math.max(0, Math.sqrt(Math.max(0, 1 - n * n)) * 0.75 - n * 0.35) - v * 0.12; };
