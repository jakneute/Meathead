// Foreign Lands' painting kit (on Hollywood's boulevard kit, hollywood/blvd/kit.ts: its ramps, its ink, its one-eye
// faces going back, its stills): the fake 3D (one eye for the scene, Spooky Land's: a box's top and sides going back
// toward it, straight walls, things farther back dimmed), what he can stand on read as standable (a lit lip along its
// top), the scenery (facades, set back and dimmed, braced from behind like the cheap plywood they are: never mistaken
// for somewhere to stand), the promenade along the lagoon (granite pavers going back to the iron railing, its near edge
// bent the SNES way), and the pavilions' signs: held up (on posts, hung off a frame, bolted to a facade), every
// pavilion's own lettering (the park's alphabet, signLetters.ts), never over by anything.
//
// The SNES pass: every surface in stepped ramps, lit from the upper left, inked; textures for the pavilions to build
// with (cut stone, rock, planks, stucco, shingles); still art painted once for the hour into a stamp (still/stillAt,
// facade()), only what moves drawn live.

import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../m1/constants';
import {
  box, mix, checker, hash, at, atDepth, poly, viewOf, timeOfDay, hourMix, signText, signW, signH, skyAt, farTint, stamp, bandedGradient, hazeBands, steppedGlow, pixelBlob,
  INK, LIP, ramp6, hour, dimmed, rampH, glassOf, lit, slab, post, ball, topBack, sideBack, underBack, board, words, deco, paint, plain, still, stillAt, type View, type Look,
} from '../hollywood/blvd/kit';
import { two4, sandbags } from '../hollywood/blvd/fronts';
import { rampDown, tone } from '../signLetters';
import { GY } from './geometry';

export {
  box, mix, checker, hash, at, atDepth, poly, viewOf, timeOfDay, hourMix, signText, signW, signH, skyAt, farTint, stamp, bandedGradient, hazeBands, steppedGlow, pixelBlob,
  INK, LIP, ramp6, hour, dimmed, rampH, glassOf, lit, slab, post, ball, topBack, sideBack, underBack, board, words, deco, paint, plain, still, stillAt, rampDown, tone, two4, sandbags,
};
export type { View, Look };
export type Ctx = CanvasRenderingContext2D;

/** Where the pavilions' facades stand (back from the play plane: scenery), and the lagoon's railing. */
export const FACADE_D = 0.88, RAIL_D = 0.8;
/** Where a facade's braces come down behind it (on the promenade, short of the railing). */
export const BRACE_D = 0.818;
/** How far toward him the promenade's near edge comes (the bent band under his feet). */
export const NEAR_BAND = 260;
/** The near band's bend (Hollywood's street's: intro kit BEND). */
const BEND = 0.004;

/** On screen, world x a..b at depth d (by where it's drawn: no pop-in)? */
export const onScreen = (v: View, a: number, b: number, d = 1, pad = 80) => {
  const [sa] = at(v.eye, a, 0, d), [sb] = at(v.eye, b, 0, d);
  return sb > v.cam.x - pad && sa < v.cam.x + CANVAS_WIDTH + pad;
};

// ---------------------------------------------------------------------------------------------------------------
// Textures (local: paint into a stamp or straight down). `R`: a ramp6 (shadow .. highlight).

/** Cut stone in courses: each block a step of its own (seeded), lit along its top and left, its joints shaded under. */
export const stoneBlocks = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0, bw = 40, bh = 20) => {
  box(g, x, y, w, h, R[1]);
  for (let yy = y, row = 0; yy < y + h; yy += bh, row++) {
    const rh = Math.min(bh, y + h - yy);
    for (let xx = x - (row % 2 ? bw / 2 : 0); xx < x + w; xx += bw) {
      const a = Math.max(x, xx), b = Math.min(x + w, xx + bw);
      if (b - a < 2) continue;
      const t = hash(seed + Math.round(xx) * 0.37 + row * 3.1);
      const col = R[t > 0.82 ? 4 : t > 0.3 ? 3 : 2];
      box(g, a, yy, b - a - 1, rh - 1, col);
      box(g, a, yy, b - a - 1, 1, R[Math.min(5, (t > 0.82 ? 4 : 3) + 1)]);
      box(g, a, yy, 1, rh - 1, mix(col, R[5], 0.4));
      box(g, a, yy + rh - 2, b - a - 1, 1, R[2]);
      checker(g, a + 1, yy + rh - 4, b - a - 2, 2, R[2], 0, 1);
      // (a chip, a crack now and then)
      if (t < 0.12 && b - a > 10) { box(g, a + (b - a) * 0.6, yy + 3, 3, 2, R[1]); box(g, a + (b - a) * 0.6 + 1, yy + 5, 1, 3, R[1]); }
    }
  }
};
/** Rock: strata banded across (lit lumps over each, shaded under), cracks down, a lichen fleck or two. */
export const rockFace = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0) => {
  box(g, x, y, w, h, R[2]);
  for (let yy = y + 4, k = 0; yy < y + h; k++) {
    const sh = 10 + Math.floor(hash(seed + k * 2.3) * 16);
    box(g, x, yy, w, 2, R[1]); checker(g, x, yy + 2, w, 2, R[1], 0, 1);
    // (the lumps along the stratum: lit tops, shaded bottoms)
    for (let xx = x + hash(seed + k) * 30 - 20; xx < x + w; xx += 18 + hash(seed + k * 7 + xx) * 26) {
      const lw = 10 + hash(seed + xx * 0.1 + k) * 24, lh = Math.min(sh - 3, 4 + hash(seed + xx + k * 3) * 8);
      const a = Math.max(x, xx), b = Math.min(x + w, xx + lw);
      if (b - a < 3) continue;
      box(g, a, yy + 3, b - a, lh, R[3]); box(g, a, yy + 3, b - a, 1, R[4]); box(g, a, yy + 3, Math.min(3, b - a), lh, R[4]);
      box(g, a, yy + 3 + lh, b - a, 1, R[1]);
    }
    yy += sh;
  }
  // (cracks running down)
  for (let k = 0; k < w / 40; k++) {
    let cx = x + hash(seed + k * 4.4) * w, cy = y + hash(seed + k * 1.7) * h * 0.6;
    for (let s = 0; s < 6; s++) { const nx = cx + (hash(seed + k * 9 + s) - 0.5) * 8; box(g, Math.min(cx, nx), cy, Math.abs(nx - cx) + 1, 6, R[0]); cx = nx; cy += 6; if (cy > y + h) break; }
  }
};
/** Boards (planks: across, or up and down), each a step, their grain, a nail at each end. */
export const planks = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], vertical = false, seed = 0, pw = 10) => {
  box(g, x, y, w, h, R[1]);
  const n = Math.ceil((vertical ? w : h) / pw);
  for (let i = 0; i < n; i++) {
    const t = hash(seed + i * 1.93), col = R[t > 0.75 ? 4 : t > 0.25 ? 3 : 2];
    if (vertical) {
      const bx = x + i * pw, bw = Math.min(pw, x + w - bx) - 1;
      box(g, bx, y, bw, h, col); box(g, bx, y, 1, h, mix(col, R[5], 0.4)); box(g, bx + bw - 1, y, 1, h, R[2]);
      for (let k = 0; k < h / 16; k++) box(g, bx + 2 + (k % 2) * 3, y + hash(seed + i * 5 + k) * h, 1, 6, R[2]);
      box(g, bx + bw / 2, y + 3, 1, 1, R[0]); box(g, bx + bw / 2, y + h - 4, 1, 1, R[0]);
    } else {
      const by = y + i * pw, bh = Math.min(pw, y + h - by) - 1;
      box(g, x, by, w, bh, col); box(g, x, by, w, 1, mix(col, R[5], 0.4)); box(g, x, by + bh - 1, w, 1, R[2]);
      for (let k = 0; k < w / 22; k++) box(g, x + hash(seed + i * 3 + k) * w, by + 2 + (k % 2) * 3, 8, 1, R[2]);
      // (the butt joints, staggered)
      for (let jx = x + ((i * 37) % 90) + 40; jx < x + w - 4; jx += 120) { box(g, jx, by, 1, bh, R[0]); box(g, jx + 2, by + bh / 2, 1, 1, R[0]); }
    }
  }
};
/** Stucco: grain stippled over it, a crack or two, water stains down from the top. */
export const stucco = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0) => {
  for (let i = 0; i < (w * h) / 220; i++) box(g, x + hash(seed + i * 1.3) * w, y + hash(seed + i * 2.9) * h, 2, 1, i % 3 ? R[2] : R[4]);
  for (let k = 0; k < w / 120; k++) { const sx = x + 10 + hash(seed + k * 5.5) * (w - 20); checker(g, sx, y + 4, 6, 18 + hash(seed + k) * 30, R[2], 0, 1); }
  for (let k = 0; k < w / 160; k++) {
    let cx = x + hash(seed + k * 8.1) * w, cy = y + h * 0.3 + hash(seed + k * 2.2) * h * 0.5;
    for (let s = 0; s < 5; s++) { box(g, cx, cy, 1, 4, R[1]); cx += hash(seed + s + k) > 0.5 ? 1 : -1; cy += 4; }
  }
};
/** Roof tiles (barrel tile, Spanish-style): rows of rounded tiles, each lit, a shaded gap between. */
export const barrelTile = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], rowH = 8) => {
  box(g, x, y, w, h, R[1]);
  for (let yy = y, row = 0; yy < y + h; yy += rowH, row++) for (let xx = x + (row % 2) * 3; xx < x + w; xx += 6) {
    box(g, xx, yy, 5, rowH - 1, R[3]); box(g, xx, yy, 2, rowH - 1, R[4]); box(g, xx + 4, yy, 1, rowH - 1, R[2]); box(g, xx, yy + rowH - 2, 5, 1, R[2]);
  }
};
/** Wooden shingles (scale-cut, the stave church's): rows, each shingle rounded at its foot, shaded under. */
export const shingles = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], sw = 8, rowH = 7, seed = 0) => {
  box(g, x, y, w, h, R[1]);
  for (let yy = y, row = 0; yy < y + h; yy += rowH, row++) for (let xx = x - (row % 2 ? sw / 2 : 0); xx < x + w; xx += sw) {
    const t = hash(seed + xx * 0.3 + row * 1.7), col = R[t > 0.8 ? 4 : t > 0.3 ? 3 : 2];
    const a = Math.max(x, xx), b = Math.min(x + w, xx + sw - 1);
    if (b <= a) continue;
    box(g, a, yy, b - a, rowH - 2, col); box(g, a, yy, b - a, 1, R[Math.min(5, R.indexOf(col) + 1)]);
    box(g, a + 1, yy + rowH - 2, Math.max(1, b - a - 2), 1, col);
    box(g, a, yy + rowH - 1, b - a, 1, R[0]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Boxes in the play plane (what he stands on and walks into): the top and the side he can see going back, then the
// front. Standable: the lit lip along the front's top edge.

export type BoxLook = 'stone' | 'rock' | 'plank' | 'stucco' | 'metal';
export interface Box3 { x: number; top: number; w: number; bottom: number; col: string; standable?: boolean; back?: number; look?: BoxLook }
/** The faces going back (draw every box's before any box's front: nothing going back over something nearer). */
export const box3Back = (c: Ctx, v: View, b: Box3) => {
  const R = ramp6(hour(b.col)), d1 = b.back ?? 0.93;
  topBack(c, v.eye, b.x, b.x + b.w, b.top, 1, d1, R, 3);
  sideBack(c, v.eye, b.x, -1, b.top, b.bottom, 1, d1, R, 3, false);
  sideBack(c, v.eye, b.x + b.w, 1, b.top, b.bottom, 1, d1, R, 3, false);
  // (its top's texture going back: a joint or two across, if it's stone or planks)
  if (b.look && (b.look === 'stone' || b.look === 'plank') && v.eye.y < b.top - 1) {
    c.strokeStyle = R[1]; c.lineWidth = 1; c.beginPath();
    for (const d of [1 - (1 - d1) * 0.33, 1 - (1 - d1) * 0.66]) { const [px0, py] = at(v.eye, b.x, b.top, d), [px1] = at(v.eye, b.x + b.w, b.top, d); c.moveTo(px0, Math.round(py) + 0.5); c.lineTo(px1, Math.round(py) + 0.5); }
    c.stroke();
  }
};
/** A box's front, painted (local: its top-left at 0, 0). */
const paintBoxFront = (g: Ctx, w: number, h: number, col: string, look: BoxLook | undefined, seed: number) => {
  const R = ramp6(hour(col));
  if (look === 'stone') stoneBlocks(g, 0, 0, w, h, R, seed);
  else if (look === 'rock') rockFace(g, 0, 0, w, h, R, seed);
  else if (look === 'plank') planks(g, 0, 0, w, h, R, false, seed, 12);
  else if (look === 'metal') { slab(g, 0, 0, w, h, R, false); for (let x = 12; x < w - 4; x += 24) { box(g, x, 0, 1, h, R[1]); box(g, x + 1, 0, 1, h, R[4]); } for (let y = 6; y < h; y += 20) for (let x = 4; x < w; x += 24) box(g, x, y, 2, 2, R[5]); }
  else { slab(g, 0, 0, w, h, R, h > 40); if (look === 'stucco') stucco(g, 0, 0, w, h, R, seed); else checker(g, 3, 3, w - 6, 2, R[4], 0, 2); }
  // (its left edge lit, its right edge in shade; grime up the foot)
  box(g, 0, 0, 2, h, R[4]); box(g, w - 3, 0, 3, h, R[1]);
  if (h > 30) { checker(g, 0, h - 10, w, 6, R[1], 1, 2); box(g, 0, h - 4, w, 4, R[1]); }
  box(g, -1, 0, 1, h, INK); box(g, w, 0, 1, h, INK); box(g, 0, h - 1, w, 1, INK);
  box(g, 0, 0, w, 1, INK);
};
export const box3Front = (c: Ctx, b: Box3) => {
  const w = Math.round(b.w), h = Math.round(b.bottom - b.top);
  if (h <= 0 || w <= 0) return;
  // (a plain one's a few fills: live; a textured one's stamped for the hour)
  if (!b.look) { c.save(); c.translate(b.x, b.top); paintBoxFront(c, w, h, b.col, undefined, 0); c.restore(); }
  else still(c, `fl-b3-${b.look}-${b.col}-${w}x${h}-${Math.round(b.x) % 997}`, b.x, b.top, -2, -1, w + 4, h + 2, g => paintBoxFront(g, w, h, b.col, b.look, Math.round(b.x)));
  if (b.standable) lip(c, b.x, b.top, b.w);
};
/** The lit lip along the top of anything he can stand on (warm, catching the light; a glint along it). */
export const lip = (c: Ctx, x: number, y: number, w: number) => {
  box(c, x, y, w, 3, LIP[2]); box(c, x, y, w, 1, LIP[3]); box(c, x, y + 3, w, 1, LIP[1]);
};
/** A lot of boxes, in the right order (all the going-back faces, then the fronts). */
export const boxes3 = (c: Ctx, v: View, list: Box3[]) => {
  const vis = list.filter(b => onScreen(v, b.x, b.x + b.w, 1));
  for (const b of vis) box3Back(c, v, b);
  for (const b of vis) box3Front(c, b);
};
/** A one-way ledge he can stand on (a terrace, a beam, a balcony): its top going back, its front stepped (lit along its
 *  top, its underside in shade, a bracket's shadow), inked, the lit lip. */
export const ledge3 = (c: Ctx, v: View, x: number, y: number, w: number, col: string, thick = 16, look?: BoxLook) => {
  const R = ramp6(hour(col));
  topBack(c, v.eye, x, x + w, y, 1, 0.94, R, 2);
  underBack(c, v.eye, x, x + w, y + thick, 1, 0.95, R, 2);
  if (look && look !== 'metal' && thick >= 8) still(c, `fl-l3-${look}-${col}-${Math.round(w)}x${thick}-${Math.round(x) % 997}`, x, y, -1, 0, w + 2, thick + 1, g => paintBoxFront(g, Math.round(w), thick, col, look, Math.round(x)));
  else {
    box(c, x, y, w, thick, R[3]); box(c, x, y + 3, w, Math.max(1, thick - 6), R[2]); checker(c, x, y + thick - 5, w, 2, R[1], 0, 1);
    box(c, x, y + thick - 3, w, 3, R[1]); box(c, x, y, 2, thick, R[4]); box(c, x + w - 2, y, 2, thick, R[1]);
  }
  box(c, x - 1, y, 1, thick, INK); box(c, x + w, y, 1, thick, INK); box(c, x, y + thick, w, 1, INK);
  lip(c, x, y, w);
};

// ---------------------------------------------------------------------------------------------------------------
// Scenery, set back (dimmed: not somewhere to stand)

/** A facade standing on the ground at depth d: `paint` draws it as if at the play plane, local x 0 at its left, y 0 at
 *  its foot (it's scaled back toward the eye). Live (no stamp): for anything that moves on it. */
export const setBack = (c: Ctx, v: View, x: number, w: number, d: number, paint: () => void) => {
  if (!onScreen(v, x, x + w, d)) return;
  atDepth(c, v.eye, d, () => { c.save(); c.translate(x, GY); paint(); c.restore(); });
};
/**
 * A facade, painted once for the hour into a stamp (`key` names it: the same key, the same picture), standing at
 * depth d (FACADE_D: the pavilions' fronts), its local x 0 at world x, y 0 at its foot, `h` its height (the stamp's box
 * reaches `over` past its top and `side` past its ends for roofs and eaves). At FACADE_D it's braced from behind:
 * plywood, 2x4s down to sandbags on the promenade, seen past its ends going back.
 */
export const facade = (c: Ctx, v: View, key: string, x: number, w: number, h: number, paintIt: (g: Ctx) => void, d = FACADE_D, over = 120, side = 50, braced = d === FACADE_D) => {
  if (!onScreen(v, x - side, x + w + side, d)) return;
  if (braced) braces(c, v.eye, x, x + w, GY - h);
  atDepth(c, v.eye, d, () => still(c, `fl-${key}`, x, GY, -side, -h - over, w + side * 2, h + over + 2, paintIt));
};
/** A facade's bracing round its two ends (x0..x1 at the play plane, its top `top`): its plywood edge going back, the
 *  long brace from up its back to the promenade, a short one lower, sandbags on their feet. */
export const braces = (c: Ctx, eye: View['eye'], x0: number, x1: number, top: number) => {
  const d0 = FACADE_D;
  for (const [e, side] of [[x0, -1], [x1, 1]] as const) {
    if ((eye.x - e) * side <= 1) continue;
    const P = (xx: number, y: number, d: number) => at(eye, xx, y, d);
    poly(c, [P(e, top, d0), P(e, top, d0 - 0.006), P(e, GY, d0 - 0.006), P(e, GY, d0)], dimmed('#C99E5C'));
    const ex = e - side * 6, s = (d0 + BRACE_D) / 2;
    const [ax, ay] = P(ex, top + 24, d0 - 0.004), [bx, by] = P(ex, GY, BRACE_D);
    const [cx, cy] = P(ex, top + (GY - top) * 0.6, d0 - 0.004), [dx, dy] = P(ex, GY, d0 - 0.035);
    two4(c, ax, ay, bx, by, 3 * s);
    two4(c, cx, cy, dx, dy, 3 * s);
    sandbags(c, bx, by + 1, BRACE_D); sandbags(c, dx, dy + 1, d0 - 0.02);
  }
};
/** A flat wall (dimmed), local to setBack: its left foot at (x, 0), `h` up; stepped, stucco grain, inked; its trim a
 *  stepped cornice. */
export const wall = (c: Ctx, x: number, w: number, h: number, col: string, trim?: string) => {
  const R = ramp6(dimmed(col));
  box(c, x - 1, -h - 1, w + 2, h + 1, INK);
  slab(c, x, -h, w, h, R);
  for (let i = 0; i < (w * h) / 700; i++) box(c, x + hash(x + w + i * 1.3) * w, -h + hash(h + i * 2.9) * h, 2, 1, i % 3 ? R[2] : R[4]);
  if (trim) {
    const T = ramp6(dimmed(trim));
    box(c, x - 5, -h - 7, w + 10, 8, INK); box(c, x - 4, -h - 6, w + 8, 6, T[3]); box(c, x - 4, -h - 6, w + 8, 1, T[5]); box(c, x - 4, -h - 2, w + 8, 1, T[1]);
    box(c, x, -h + 1, w, 2, 'rgba(28, 16, 20, 0.3)');
  }
};
/** A doorway or window (local to setBack or a facade): its frame, a stepped sill and lintel, its glass by the hour (the
 *  sky in it by day, lit warm after dark when `glow`), a mullion; a door (tall) gets a dark inside and a step. */
export const hole = (c: Ctx, x: number, y: number, w: number, h: number, glow = false) => {
  const lampsOn = timeOfDay().lamps > 0.3, G = glassOf(), door = h > w * 1.4 && h > 50;
  box(c, x - 2, y - 2, w + 4, h + 3, INK);
  if (door) {
    box(c, x, y, w, h, lampsOn && glow ? '#6A3E12' : '#1C1014');
    if (lampsOn && glow) { box(c, x + 2, y + 2, w - 4, h - 4, '#B07024'); box(c, x + 2, y + 2, w - 4, (h - 4) * 0.4, '#E8A646'); checker(c, x + 2, y + 2 + (h - 4) * 0.4, w - 4, 2, '#E8A646', 0, 1); }
    else { box(c, x, y, w, 4, '#2A1A1E'); checker(c, x, y + 4, w, 2, '#2A1A1E', 0, 1); }
    box(c, x - 4, y - 5, w + 8, 4, INK); box(c, x - 3, y - 4, w + 6, 2, mix('#8A7A6A', INK, 0.3));
    box(c, x - 3, y + h - 2, w + 6, 2, mix('#6A5A4A', INK, 0.3));
    return;
  }
  const on = lampsOn && glow;
  box(c, x, y, w, h, on ? '#C88A36' : G[1]);
  box(c, x, y, w, Math.round(h * 0.4), on ? '#E8A646' : G[2]); checker(c, x, y + Math.round(h * 0.4), w, 2, on ? '#E8A646' : G[2], 0, 1);
  if (!on) { box(c, x + 2, y + 2, 2, Math.max(1, h - 6), G[4]); box(c, x + 5, y + 2, 1, Math.max(1, h * 0.5), G[3]); }
  box(c, x + Math.floor(w / 2), y, 1, h, INK); box(c, x, y + Math.floor(h / 2), w, 1, INK);
  // (the sill under it, the lintel over it: shaded, not ledges)
  box(c, x - 4, y + h + 1, w + 8, 3, INK); box(c, x - 3, y + h + 1, w + 6, 2, mix('#8A7A6A', INK, 0.4));
  box(c, x - 3, y - 4, w + 6, 2, mix('#6A5A4A', INK, 0.4));
};

// ---------------------------------------------------------------------------------------------------------------
// The promenade (along the lagoon: granite pavers going back to the iron railing over the water, a lamp now and then;
// its near edge a coping stone with its lit lip, and under it the paving coming toward him, bent: the joints fanning
// out from where he's looking)

const PAVER = 80;
const ROWS = [1, 0.986, 0.962, 0.938, 0.914, 0.89, 0.866, 0.842, 0.83];
/** The promenade going back (world x A0..B0, from depth `from` to the railing): the coping along the front, the paving
 *  field in rows (lighter at the front, a darker paver here and there, a running bond), the granite edging strip, the
 *  railing's plinth; then the railing. (Behind a pool dug out of it, from the pool's far wall back.) */
export const pavingBack = (c: Ctx, v: View, A0: number, B0: number, from = 1, top = '#D6CBB4', face = '#8C7F68') => {
  const eye = v.eye, tod = timeOfDay(), haze = skyAt(0.9, tod);
  const T = (col: string, d: number) => mix(hour(col, 0.12), haze, (1 - d) * 0.35);
  const R = ramp6(top);
  const P = (x: number, d: number) => at(eye, x, GY, d);
  const Q = (xa: number, xb: number, d0: number, d1: number, col: string) => poly(c, [P(xa, d0), P(xb, d0), P(xb, d1), P(xa, d1)], col);
  if (eye.y < GY - 1) {
    const all = ROWS.map(d => Math.min(d, from)), rows = all.slice(1);
    for (let i = 0; i < all.length - 1; i++) if (all[i] > all[i + 1]) Q(A0, B0, all[i], all[i + 1], T(i === 0 ? R[4] : R[i % 2 ? 3 : 2], all[i]));
    Q(A0, B0, Math.min(from, 0.83), Math.min(from, 0.812), T(mix(face, INK, 0.25), 0.82));
    Q(A0, B0, Math.min(from, 0.812), RAIL_D, T(mix(face, '#FFFFFF', 0.1), 0.81));
    // (a darker paver here and there: seeded by its square)
    for (let i = 0; i < rows.length - 1; i++) {
      const off = (i % 2) * PAVER / 2;
      for (let x = Math.floor((A0 - off) / PAVER) * PAVER + off; x < B0; x += PAVER) {
        const hh = hash(x * 0.011 + i * 7.7);
        if (hh > 0.72) Q(Math.max(A0, x + 2), Math.min(B0, x + PAVER - 2), rows[i] - 0.002, rows[i + 1] + 0.002, T(hh > 0.9 ? R[4] : R[2], rows[i]));
      }
    }
    // (the joints: across between the rows, and back between the pavers, a running bond)
    c.strokeStyle = T(R[1], 0.9); c.lineWidth = 1; c.beginPath();
    for (let i = 0; i < rows.length; i++) { const [px0, py] = P(A0, rows[i]), [px1] = P(B0, rows[i]); c.moveTo(px0, Math.round(py) + 0.5); c.lineTo(px1, Math.round(py) + 0.5); }
    for (let i = 0; i < rows.length - 1; i++) {
      const off = (i % 2) * PAVER / 2;
      for (let x = Math.ceil((A0 - off) / PAVER) * PAVER + off; x < B0; x += PAVER) { const [p0, q0] = P(x, rows[i]), [p1, q1] = P(x, rows[i + 1]); c.moveTo(p0, q0); c.lineTo(p1, q1); }
    }
    c.stroke();
  }
  railing(c, v, A0, B0);
};
/** The railing at the lagoon's edge (world x A0..B0): its posts (finials), balusters, the top rail lit; a lamp every so
 *  far, its globes glowing after dark. */
export const railing = (c: Ctx, v: View, A0: number, B0: number) => {
  const eye = v.eye, tod = timeOfDay();
  const P = (x: number, d: number) => at(eye, x, GY, d);
  const IR = ramp6(dimmed('#2E3436'));
  const [, ry] = P(A0, RAIL_D), k = RAIL_D;
  const [ra] = P(A0, RAIL_D), [rb] = P(B0, RAIL_D);
  const rh = 34 * k, top0 = Math.round(ry - rh);
  box(c, ra, top0 - 1, rb - ra, 4, INK); box(c, ra, top0, rb - ra, 2, IR[3]); box(c, ra, top0, rb - ra, 1, IR[5]);
  box(c, ra, Math.round(ry - 8 * k), rb - ra, 2, IR[2]);
  for (let x = Math.ceil(A0 / 14) * 14; x < B0; x += 14) { const [px] = P(x, RAIL_D); box(c, Math.round(px), top0 + 2, 1, Math.round(rh - 2), x % 70 === 0 ? IR[1] : IR[2]); }
  for (let x = Math.ceil(A0 / 140) * 140; x < B0; x += 140) {
    const [px] = P(x, RAIL_D), X0 = Math.round(px);
    box(c, X0 - 2, top0 - 4, 5, Math.round(rh + 4), INK); box(c, X0 - 1, top0 - 3, 3, Math.round(rh + 3), IR[3]); box(c, X0 - 1, top0 - 3, 1, Math.round(rh + 3), IR[5]);
    box(c, X0 - 2, top0 - 7, 5, 3, INK); box(c, X0 - 1, top0 - 6, 3, 2, IR[4]);
  }
  const lampsOn = tod.lamps > 0.3;
  for (let x = Math.ceil(A0 / 700) * 700 + 350; x < B0; x += 700) {
    const [px] = P(x, RAIL_D), X0 = Math.round(px), lh = Math.round(118 * k);
    box(c, X0 - 2, ry - lh, 5, lh, INK); box(c, X0 - 1, ry - lh, 3, lh, IR[3]); box(c, X0 - 1, ry - lh, 1, lh, IR[5]);
    box(c, X0 - 4, ry - 6, 9, 6, INK); box(c, X0 - 3, ry - 5, 7, 5, IR[2]);
    box(c, X0 - 7, ry - lh - 2, 15, 3, INK); box(c, X0 - 6, ry - lh - 1, 13, 1, IR[4]);
    for (const s of [-1, 1]) {
      const gx = X0 + s * 6;
      if (lampsOn) steppedGlow(c, gx, ry - lh - 7, 16, '#FFE7A0', 0.0, 0.28, 4);
      c.fillStyle = INK; c.beginPath(); c.arc(gx, ry - lh - 7, 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = lampsOn ? '#FFF4C8' : dimmed('#E8E4D8'); c.beginPath(); c.arc(gx, ry - lh - 7, 4, 0, Math.PI * 2); c.fill();
      box(c, gx - 2, ry - lh - 10, 2, 2, lampsOn ? '#FFFFFF' : dimmed('#FFFFFF'));
    }
  }
};
export const promenade = (c: Ctx, v: View, x0: number, x1: number, top = '#D6CBB4', face = '#8C7F68') => {
  const a = Math.max(x0, v.cam.x - 160), b = Math.min(x1, v.cam.x + CANVAS_WIDTH + 160);
  if (b <= a) return;
  const eye = v.eye;
  // (wider at the back where the run goes on off screen: the field's ends spread past the screen there)
  const A = eye.x + (a - eye.x) / RAIL_D, B = eye.x + (b - eye.x) / RAIL_D;
  const A0 = x0 < a - 0.5 ? Math.min(a, A) : a, B0 = x1 > b + 0.5 ? Math.max(b, B) : b;
  pavingBack(c, v, A0, B0, 1, top, face);
  // The front: the coping stone (lit lip: he walks on it), its joints; then the paving under it coming toward him,
  // banded darker the nearer, its joints fanning out from the eye (the bent ground plane)
  const F = ramp6(hour(face)), N = ramp6(hour(mix(top, face, 0.45)));
  box(c, a, GY, b - a, 12, F[3]); box(c, a, GY + 8, b - a, 4, F[2]); checker(c, a, GY + 6, b - a, 2, F[2], 0, 1);
  for (let x = Math.ceil(a / PAVER) * PAVER; x < b; x += PAVER) { box(c, x, GY + 1, 1, 11, F[1]); box(c, x + 1, GY + 3, 1, 9, F[4]); }
  box(c, a, GY + 12, b - a, 1, INK);
  const fy = (y: number) => 1 + (y - GY) * BEND, fx = (x: number, y: number) => eye.x + (x - eye.x) * fy(y);
  const ys = [GY + 13, GY + 26, GY + 44, GY + 68, GY + 100, GY + 140, GY + 190, GY + NEAR_BAND];
  c.save(); c.beginPath(); c.rect(a, GY + 13, b - a, NEAR_BAND + 600); c.clip();
  for (let i = 0; i < ys.length - 1; i++) box(c, a, ys[i], b - a, ys[i + 1] - ys[i], N[[4, 3, 3, 2, 2, 1, 1][i]]);
  box(c, a, GY + NEAR_BAND, b - a, 600, N[1]);
  // (the darker pavers coming toward him, the joints fanned)
  for (let i = 0; i < ys.length - 1; i++) {
    const off = (i % 2) * PAVER / 2, y0 = ys[i], y1 = ys[i + 1];
    const lo = eye.x + (a - eye.x) / fy(y0) - PAVER, hi = eye.x + (b - eye.x) / fy(y0) + PAVER;
    for (let x = Math.floor((lo - off) / PAVER) * PAVER + off; x < hi; x += PAVER) {
      const hh = hash(x * 0.013 + i * 3.1 + 40);
      if (hh > 0.75) poly(c, [[fx(x + 2, y0), y0 + 1], [fx(x + PAVER - 2, y0), y0 + 1], [fx(x + PAVER - 2, y1), y1 - 1], [fx(x + 2, y1), y1 - 1]], N[hh > 0.9 ? 4 : 2]);
    }
  }
  c.strokeStyle = N[0]; c.lineWidth = 1; c.beginPath();
  for (let i = 0; i < ys.length; i++) { c.moveTo(a, ys[i] + 0.5); c.lineTo(b, ys[i] + 0.5); }
  for (let i = 0; i < ys.length - 1; i++) {
    const off = (i % 2) * PAVER / 2, y0 = ys[i], y1 = ys[i + 1];
    const lo = eye.x + (a - eye.x) / fy(y0) - PAVER, hi = eye.x + (b - eye.x) / fy(y0) + PAVER;
    for (let x = Math.floor((lo - off) / PAVER) * PAVER + off; x < hi; x += PAVER) { c.moveTo(fx(x, y0), y0); c.lineTo(fx(x, y1), y1); }
  }
  c.stroke();
  c.restore();
  lip(c, a, GY, b - a);
};

// ---------------------------------------------------------------------------------------------------------------
// Signs (held up: on two posts, or hung off a frame; each pavilion its own lettering)

/** A pavilion's sign on two posts, standing at world x on the ground at feetY (the board's middle `up` over it). */
export const postBoard = (c: Ctx, x: number, feetY: number, lines: string[], L: Look, bg: string, frame?: string[], up = 110) => {
  // (the board's size first, to put the posts under its ends)
  const lh = signH(L) + Math.max(2, (L.sy ?? 1) * 2), pad = 6;
  const w = Math.round(Math.max(...lines.map(l => signW(l, L))) + pad * 2), h = Math.round(lh * lines.length + pad * 1.5);
  const y = feetY - up;
  const P = ramp6(hour('#5C4630'));
  for (const px0 of [x - w / 2 + 8, x + w / 2 - 8]) {
    post(c, px0, y, feetY, 6, P);
    // (the post's foot: a concrete footing, its shadow)
    box(c, px0 - 6, feetY - 4, 12, 4, INK); box(c, px0 - 5, feetY - 4, 10, 3, hour('#8C8476')); box(c, px0 - 5, feetY - 4, 10, 1, hour('#B8B0A0'));
  }
  board(c, x, y, lines, L, bg, frame);
  return [w, h];
};
/** A sign hung by two chains off something over it at hangY (a beam, an arch), its middle at y. */
export const hungBoard = (c: Ctx, x: number, hangY: number, y: number, lines: string[], L: Look, bg: string, frame?: string[]) => {
  const lh = signH(L) + Math.max(2, (L.sy ?? 1) * 2);
  const w = Math.round(Math.max(...lines.map(l => signW(l, L))) + 12), h = Math.round(lh * lines.length + 9);
  for (const sx of [x - w / 2 + 6, x + w / 2 - 6]) {
    box(c, sx - 2, hangY - 2, 5, 3, INK); box(c, sx - 1, hangY - 2, 3, 1, '#A1A1AA');
    for (let k = hangY; k < y - h / 2; k += 4) { box(c, sx - 1, k, 3, 3, INK); box(c, sx, k, 1, 2, (k / 4) % 2 ? '#A1A1AA' : '#71717A'); }
  }
  board(c, x, y, lines, L, bg, frame);
};

// ---------------------------------------------------------------------------------------------------------------
// Bits every pavilion hangs about

/** A string of little flags or bulbs swagged between two points (papel picado, bunting, lights). */
export const swag = (c: Ctx, x0: number, y0: number, x1: number, y1: number, sag: number, cols: string[], kind: 'flags' | 'bulbs' | 'lanterns' = 'flags', step = 18) => {
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
  const lamps = timeOfDay().lamps, on = lamps > 0.3;
  const pt = (t: number) => [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + sag * 4 * t * (1 - t)] as const;
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath();
  for (let i = 0; i <= n; i++) { const [x, y] = pt(i / n); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
  c.stroke();
  for (let i = 1; i < n; i++) {
    const [fx, fy] = pt(i / n), x = Math.round(fx), y = Math.round(fy), col = cols[i % cols.length];
    if (kind === 'flags') {
      // (a sheet of tissue paper, its cut-out pattern (a diamond, holes, a scalloped foot), lit on its left)
      const R = ramp6(dimmed(col));
      poly(c, [[x - 7, y - 1], [x + 7, y - 1], [x + 7, y + 11], [x + 5, y + 14], [x + 2, y + 11], [x, y + 14], [x - 2, y + 11], [x - 5, y + 14], [x - 7, y + 11]], INK);
      poly(c, [[x - 6, y], [x + 6, y], [x + 6, y + 10], [x + 4.5, y + 12.5], [x + 2, y + 10], [x, y + 12.5], [x - 2, y + 10], [x - 4.5, y + 12.5], [x - 6, y + 10]], R[3]);
      box(c, x - 6, y, 3, 10, R[4]); box(c, x + 3, y, 3, 10, R[2]);
      box(c, x - 1, y + 3, 2, 2, INK); box(c, x - 3, y + 5, 2, 2, INK); box(c, x + 1, y + 5, 2, 2, INK); box(c, x - 1, y + 7, 2, 2, INK);
      box(c, x - 5, y + 2, 1, 1, INK); box(c, x + 4, y + 2, 1, 1, INK);
    } else if (kind === 'bulbs') {
      if (on) steppedGlow(c, x, y + 3, 8, '#FFE7A0', 0, 0.3 * lamps, 3);
      box(c, x - 2, y - 1, 4, 2, INK); box(c, x - 1, y - 1, 2, 1, '#71717A');
      box(c, x - 3, y + 1, 6, 6, INK);
      box(c, x - 2, y + 1, 4, 5, on ? '#FFF4C8' : dimmed(mix(col, '#FFFFFF', 0.3)));
      box(c, x - 2, y + 1, 1, 2, on ? '#FFFFFF' : dimmed('#FFFFFF'));
    } else lantern(c, x, y + 4, 7, col);
  }
};
/** A paper lantern (red, ribbed, a gold band top and bottom, a tassel), glowing after dark. */
export const lantern = (c: Ctx, x: number, y: number, r: number, col = '#DC2626') => {
  const lamps = timeOfDay().lamps, on = lamps > 0.3, body = on ? mix(col, '#FDE68A', 0.45 * lamps) : dimmed(col), R = ramp6(body);
  if (on) steppedGlow(c, x, y, r * 2.4, '#FFB070', 0, 0.3 * lamps, 4);
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, r + 1, r * 0.8 + 1, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[2]; c.beginPath(); c.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[3]; c.beginPath(); c.ellipse(x - r * 0.15, y - r * 0.1, r * 0.7, r * 0.62, 0, 0, Math.PI * 2); c.fill();
  box(c, x - r * 0.55, y - r * 0.45, Math.max(1, r * 0.3), r * 0.7, R[4]);
  for (const k of [-0.5, 0, 0.5]) box(c, x + k * r, y - r * 0.7, 1, r * 1.4, R[1]);
  const G = ramp6(dimmed('#CA8A04'));
  box(c, x - r * 0.7, y - r * 0.8 - 1, r * 1.4, 3, INK); box(c, x - r * 0.7 + 1, y - r * 0.8, r * 1.4 - 2, 1, G[4]);
  box(c, x - r * 0.7, y + r * 0.8 - 2, r * 1.4, 3, INK); box(c, x - r * 0.7 + 1, y + r * 0.8 - 1, r * 1.4 - 2, 1, G[3]);
  box(c, x - 1, y + r * 0.8 + 1, 2, r * 0.7, G[3]); box(c, x - 1, y + r * 0.8 + r * 0.7, 2, 2, G[1]);
};
/** A flag on a pole (world: the pole's foot on the ground at x), its stripes, waving (shaded in its troughs, lit on its
 *  crests), the gold finial, the halyard. */
export const flagPole = (c: Ctx, x: number, feetY: number, h: number, stripes: string[], f: number, vertical = false) => {
  const P = ramp6(hour('#9CA3AF'));
  post(c, x, feetY - h, feetY, 4, P);
  box(c, x - 5, feetY - 5, 11, 5, INK); box(c, x - 4, feetY - 5, 9, 4, P[2]); box(c, x - 4, feetY - 5, 9, 1, P[4]);
  ball(c, x, feetY - h - 4, 3, '#CA8A04');
  box(c, x + 2, feetY - h + 2, 1, h - 40, P[1]);
  const fw = 48, fh = 30, top = feetY - h + 2;
  for (let i = 0; i < fw; i += 2) {
    const ph = f * 0.08 + i * 0.12, wave = Math.sin(ph) * 2 * (i / fw + 0.3), lightK = Math.cos(ph);
    const shade = (col: string) => { const R = ramp6(hour(col)); return lightK > 0.55 ? R[4] : lightK < -0.55 ? R[2] : R[3]; };
    box(c, x + 2 + i, top + wave - 1, 2, fh + 2, INK);
    stripes.forEach((col, k) => {
      if (vertical) { const band = Math.floor((i / fw) * stripes.length); if (band === k) box(c, x + 2 + i, top + wave, 2, fh, shade(col)); }
      else box(c, x + 2 + i, top + wave + (k * fh) / stripes.length, 2, Math.ceil(fh / stripes.length), shade(col));
    });
  }
};

/** A seeded pick 0..1 for a pavilion's bits. */
export const rnd = (n: number) => hash(n * 7.13 + 1.7);
export const viewIn = (state: GameState) => viewOf(state);
/** Lettering looks for each pavilion (the park's alphabet, set each pavilion's way). */
export const LOOKS = {
  /** Mexico: a festive painted hand, hot pink and marigold, a dark drop. */
  mexico: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#F472B6', 0.3), dither: true, shadow: '#3B0764', drop: 1, gap: 1 }),
  /** Norway: carved into wood, a rune-ish lean. */
  norway: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FDE68A', 0.25), grain: '#B45309', lip: '#78350F', slant: 0.4, gap: 1 }),
  /** China: gold on red lacquer, bold. */
  china: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FCD34D', 0.35), dither: true, bold: s >= 2, shadow: '#450A0A', drop: 1, gap: 1 }),
  /** Germany: blackletter-ish (serifs, bold, gold leaf). */
  germany: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FBBF24', 0.3), serif: true, ink: '#1C1917', gap: 2 }),
  /** Italy: a sign-painter's cream script-ish (serifs, a lean), red shadow. */
  italy: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FEF3C7', 0.2), serif: true, slant: 0.5, shadow: '#991B1B', drop: 1, gap: 2 }),
  /** Japan: brush-ish black on white paper, heavy, a red hanko-ish drop. */
  japan: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#1C1917', 0.15), bold: s >= 2, shadow: '#DC2626', drop: 1, gap: 1 }),
  /** Morocco: tile-blue and gold, a raised edge. */
  morocco: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FCD34D', 0.3), hi: '#FEF9C3', ink: '#1E3A8A', gap: 1 }),
  /** France: thin gold serifs on bistro green, a lean. */
  france: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FDE68A', 0.25), serif: true, slant: 0.3, ink: '#14532D', gap: 2 }),
  /** The UK: enamel-sign white on red, bold, a dark drop. */
  uk: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#F8FAFC', 0.15), bold: s >= 2, shadow: '#1E3A8A', drop: 1, gap: 1 }),
  /** Canada: routed into a plank (carved, wood grain), lumber-camp yellow. */
  canada: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FDE68A', 0.3), grain: '#92400E', lip: '#78350F', gap: 1 }),
  /** The land's own (the gate, the PA horns): red, white and blue, stars-and-stripes loud. */
  land: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#F8FAFC', 0.2), ink: '#1E3A8A', shadow: '#991B1B', drop: 2, gap: 1 }),
} as const;

void farTint; void bandedGradient; void hazeBands; void pixelBlob; void stamp; void rampH; void words; void deco; void paint; void plain; void sideBack;
