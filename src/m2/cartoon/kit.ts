// Cartoon Land's painting kit. The park's look is a cartoon's: nothing straight (walls bulge, roofs droop, posts curl),
// candy stripes, puff-ball trees, a cel-painted sky. Here: the land's signs (a lumpy cartoon board on a curly
// candy-striped pole sunk in a grassy hummock, the letters fat, hand-done and bouncing: the park's alphabet,
// signLetters.ts), the sky by the hour over the far rolling hills with the CARTOON LAND WATER TOWER among them
// (monument.ts: bigger every section), the shared shapes (wobbly boxes, stripes, puff-balls, curly posts), and the SNES
// kit (the kiddie square's pass brought it in; every section's to use): the candy materials in six-step ramps, colors
// for the hour, the one eye (Spooky Land's view: a thing at depth d stands d of the way from the eye to where it'd be
// at the play plane), sides and tops going back (curvy ones too: a cartoon wall bulges all the way back), drum tops,
// stepped balls and posts, still art painted once for the hour into a stamp.

import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';
import { mix } from '../../m1/game/render/backdrops/core';
import { stamp } from '../../m1/game/render/stamp';
import { checker } from '../../m1/game/render/pixelArt';
import { drawTodSky, timeOfDay, farTint, hourMix, hourly } from '../timeOfDay';
import { signText, signW, type Look } from '../signLetters';
import { box } from '../adventure/section';
import { at, atDepth, viewOf, type View } from '../spooky/town/paint';
import { drawMonument, type MonumentAt } from './monument';

export type Ctx = CanvasRenderingContext2D;
export { box, mix, stamp, checker, at, atDepth, viewOf, type View };

/** A repeatable 0..1 noise off a number. */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Ink (the outline every shape gets: a cartoon's thick black line, a touch of plum in it). */
export const INK = '#1A1028';

/** Is world x0..x1 on screen (with a margin)? */
export const onScreen = (state: GameState, x0: number, x1: number, m = 60) => x1 > state.camera.x - m && x0 < state.camera.x + CANVAS_WIDTH + m;

/** A color for the hour (near: barely into the haze). */
export const hour = hourly((col: string, k = 0.1) => farTint(hourMix(col, mix(col, '#8A4A6A', 0.14), mix(col, '#141832', 0.34)), k));
/** Scenery's (dimmed toward the air: none of it reads as somewhere to stand). */
// (a missing color (a ramp read past its end somewhere) dims a neutral one instead of throwing: one bad read was
// taking the whole frame down as he came into the land)
export const dimmed = hourly((col: string) => { if (typeof col !== 'string' || col[0] !== '#') col = '#9A94B4'; const tod = timeOfDay(); return mix(farTint(hourMix(col, mix(col, '#6A3A5A', 0.16), mix(col, '#0E1024', 0.42), tod), 0.4, tod), '#8E86B4', 0.2); });
/** After dark (the lamps, the windows). */
export const lit = () => timeOfDay().lamps > 0.35;
/** A color's steps: shade, itself, lit. */
export const steps3 = (col: string) => [mix(col, INK, 0.3), col, mix(col, '#FFFFFF', 0.35)];

// ---------------------------------------------------------------------------------------------------------------
// Shapes (nothing straight)

/** A wobbly box's path: its sides bulge out (or pinch in: `bulge` < 0), its top droops like a cake's icing. */
export const wobblePath = (c: Ctx, x: number, y: number, w: number, h: number, bulge = 6, lean = 0) => {
  c.moveTo(x, y + h);
  c.quadraticCurveTo(x - bulge + lean * 0.5, y + h / 2, x + lean, y);
  c.quadraticCurveTo(x + w / 2 + lean, y - bulge * 0.8, x + w + lean, y);
  c.quadraticCurveTo(x + w + bulge + lean * 0.5, y + h / 2, x + w, y + h);
  c.closePath();
};
/** Fills a path, inks it. */
export const inked = (c: Ctx, path: () => void, fill: string | CanvasPattern, line = 3) => {
  c.beginPath(); path();
  c.fillStyle = fill; c.fill();
  c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = line; c.stroke();
};
/** Candy stripes (diagonal) clipped to a path, over its box. */
export const stripes = (c: Ctx, path: () => void, a: string, b: string, x: number, y: number, w: number, h: number, band = 10, slope = 0.6) => {
  c.save(); c.beginPath(); path(); c.clip();
  c.fillStyle = a; c.fillRect(x - 4, y - 4, w + 8, h + 8);
  c.fillStyle = b;
  for (let k = -h; k < w + h; k += band * 2) { c.beginPath(); c.moveTo(x + k, y + h + 4); c.lineTo(x + k + band, y + h + 4); c.lineTo(x + k + band + (h + 8) * slope, y - 4); c.lineTo(x + k + (h + 8) * slope, y - 4); c.closePath(); c.fill(); }
  c.restore();
};
/** A puff-ball tree (the land's tufty ones): a curly striped trunk bending up to a fluffy ball, lit top-left. */
export const puffTree = (c: Ctx, x: number, feetY: number, h: number, col: string, seed: number, trunkA = '#FFF7E8', trunkB = '#F472B6') => {
  const bend = (hash(seed) - 0.5) * h * 0.5, topX = x + bend, topY = feetY - h;
  // (the trunk: a fat S curve, striped)
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 11; c.beginPath(); c.moveTo(x, feetY); c.bezierCurveTo(x - bend * 0.6, feetY - h * 0.4, topX + bend * 0.4, feetY - h * 0.7, topX, topY); c.stroke();
  c.strokeStyle = trunkA; c.lineWidth = 7; c.stroke();
  c.setLineDash([5, 6]); c.strokeStyle = trunkB; c.stroke(); c.setLineDash([]);
  // (the tuft: lumps round a ball)
  const r = h * 0.2;
  c.fillStyle = INK; c.beginPath(); c.arc(topX, topY, r + 3, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2 + seed; c.beginPath(); c.arc(topX + Math.cos(a) * r * 0.85, topY + Math.sin(a) * r * 0.75, r * 0.42 + 3, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = col; c.beginPath(); c.arc(topX, topY, r, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2 + seed; c.beginPath(); c.arc(topX + Math.cos(a) * r * 0.85, topY + Math.sin(a) * r * 0.75, r * 0.42, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = mix(col, '#FFFFFF', 0.4); c.beginPath(); c.arc(topX - r * 0.35, topY - r * 0.35, r * 0.35, 0, Math.PI * 2); c.fill();
  c.fillStyle = mix(col, INK, 0.25); c.beginPath(); c.arc(topX + r * 0.4, topY + r * 0.45, r * 0.3, 0, Math.PI * 2); c.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// The SNES kit: ramps, the hour, the one eye, still art

/** A material's ramp round a color, darkest first: shadow, shade, a touch under, itself, lit, highlight. */
export const ramp6 = (col: string) => [mix(col, INK, 0.62), mix(col, INK, 0.36), mix(col, INK, 0.14), col, mix(col, '#FFFFFF', 0.3), mix(col, '#FFFFFF', 0.6)];
/** The candy materials (darkest first), lit from the upper left. */
export const BUBBLEGUM = ['#5A1238', '#8E1F5A', '#C83A84', '#EE62A8', '#FA9ACA', '#FFD2E8'];
export const FROSTING = ['#9C7E9A', '#C4A8C0', '#E4D2DE', '#F8EEF2', '#FFFAFC', '#FFFFFF'];
export const MINT = ['#0E4A3E', '#17705C', '#26A07E', '#4CC89C', '#8AE4BE', '#C8F6DE'];
export const LEMON = ['#6A4A06', '#A6760E', '#D8A818', '#F6D23A', '#FCE880', '#FFF8C8'];
export const LILAC = ['#2E1A5A', '#4A2E8A', '#6C4CBC', '#9476DE', '#BAA4F0', '#E0D6FC'];
export const SKY = ['#0E3460', '#18568E', '#2A80C4', '#4CA8E8', '#86CAF4', '#C6E8FC'];
export const TANGERINE = ['#5E1E06', '#94360C', '#CC5A16', '#F2822A', '#FAAE64', '#FFD8AE'];
export const CHERRY = ['#4A060E', '#7A0E1C', '#B01C2C', '#DC3442', '#F06A72', '#FAAEB2'];
export const LICORICE = ['#0C0610', '#1A0E20', '#2A1830', '#3E2646', '#5A3C62', '#7E5E86'];
export const WAFFLE = ['#4A2A0E', '#74461A', '#A06A2C', '#C8924A', '#E2B874', '#F6DCAA'];
export const GRASS = ['#0E3A1E', '#16582A', '#22803A', '#3CAA4C', '#6CCC6A', '#AEEA9C'];
export const BRASS = ['#3A2408', '#6A4410', '#A06C1C', '#D09A30', '#F2C84A', '#FFF0A8'];
export const STEEL = ['#1C1A2C', '#2E2C44', '#46445E', '#64627E', '#8A88A4', '#B8B6CE'];
/** The lit lip along anything he can stand on: warm, catching the light. */
export const LIP = ['#6A3A52', '#B47A98', '#FFE8F2', '#FFFFFF'];
/** A ramp for the hour, near or dimmed (scenery). */
export const rampH = (R: string[], scenery = false) => R.map(scenery ? dimmed : (col: string) => hour(col));
/** A lit window (warm inside after dark; a sky-blue glint by day). Darkest first. */
export const glassOf = () => (lit() ? ['#4A2208', '#8A4A10', '#D08A24', '#F6BE48', '#FFE08A', '#FFF8D8'] : ['#1E3A5A', '#2E5A86', '#4A84B4', '#74AED8', '#A8D4F0', '#E2F4FE']);
/** Where the square's fronts stand (back from the play plane), and where their sides run back to. */
export const FRONT_D = 0.88, BACK_D = 0.78;

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
const fontKey = () => (fontReady() ? 'f' : 'n');
/** Still art at world (x, y): painted once (in local coordinates, the box bx, by, bw, bh about (x, y)) for the hour. */
export const still = (c: Ctx, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `ct-${key}-${timeOfDay().key}-${fontKey()}`, bx, by, bw, bh, paint);
  c.restore();
};
/** Still art standing at world x at depth d (scaled toward the eye). */
export const stillAt = (c: Ctx, v: View, d: number, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  if (d === 1) { still(c, key, x, y, bx, by, bw, bh, paint); return; }
  atDepth(c, v.eye, d, () => still(c, key, x, y, bx, by, bw, bh, paint));
};
/** Is a thing at world x a..b at depth d on screen (by where it's drawn: no pop-in)? */
export const seen = (v: View, a: number, b: number, d = 1, pad = 60) => {
  const [sa] = at(v.eye, a, 0, d), [sb] = at(v.eye, b, 0, d);
  return sb > v.cam.x - pad && sa < v.cam.x + CANVAS_WIDTH + pad;
};
/** A filled polygon. */
export const polyF = (c: Ctx, pts: [number, number][], col: string) => {
  c.fillStyle = col; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
};
/** An inked polygon. */
export const polyI = (c: Ctx, pts: [number, number][], col: string, t = 1) => {
  polyF(c, pts, col);
  c.strokeStyle = INK; c.lineWidth = t; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.stroke();
};
/**
 * A wall's side going back from x = e (the play plane's x of its edge at depth d0) to depth d1, if the eye's past that
 * end, from `top` to `bottom` (world y): in steps, darker going back, inked along its far edge, a lit sliver on its
 * corner. `bow(t)` bends it the cartoon way: how far out (px, + away from the wall) the edge is at height t (0 at its
 * foot, 1 at its top): the same bulge all the way back, so a bulging front's side bulges with it. `R` a ramp6.
 */
export const sideBack = (c: Ctx, eye: View['eye'], e: number, side: 1 | -1, top: number, bottom: number, d0: number, d1: number, R: string[], steps = 3, bow?: (t: number) => number) => {
  if ((eye.x - e) * side <= 1) return false;
  const N = bow ? 14 : 1, edge = (t: number, d: number): [number, number] => at(eye, e + side * (bow ? bow(t) : 0), bottom + (top - bottom) * t, d);
  const strip = (d: number) => Array.from({ length: N + 1 }, (_, i) => edge(i / N, d));
  for (let i = 0; i < steps; i++) {
    const a = d0 - ((d0 - d1) * i) / steps, b = d0 - ((d0 - d1) * (i + 1)) / steps;
    polyF(c, [...strip(a), ...strip(b).reverse()], R[Math.max(0, 2 - i)]);
  }
  const near = strip(d0), far = strip(d1);
  c.fillStyle = R[4]; c.beginPath(); near.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); [...near].reverse().forEach(([x, y]) => c.lineTo(x + side * 1.5, y)); c.closePath(); c.fill();
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath();
  c.moveTo(near[N][0], near[N][1]); c.lineTo(far[N][0], far[N][1]);
  far.slice().reverse().forEach(([x, y]) => c.lineTo(x, y));
  c.stroke();
  return true;
};
/** A top going back from x0..x1 at height y (depth d0) to d1, if the eye's above it: in bands, lighter at the front. */
export const topBack = (c: Ctx, eye: View['eye'], x0: number, x1: number, y: number, d0: number, d1: number, R: string[], n = 3) => {
  if (eye.y >= y - 1) return false;
  for (let i = 0; i < n; i++) {
    const a = d0 - ((d0 - d1) * i) / n, b = d0 - ((d0 - d1) * (i + 1)) / n;
    polyF(c, [at(eye, x0, y, a), at(eye, x1, y, a), at(eye, x1, y, b), at(eye, x0, y, b)], R[Math.max(0, 4 - i)]);
  }
  const [ax, ay] = at(eye, x0, y, d1), [bx, by] = at(eye, x1, y, d1);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  return true;
};
/** A round thing's top going back (a drum's: a carousel's deck, a toadstool's cap): a half ellipse from its front edge
 *  back to depth d, if the eye's above it; a worn ring in from the rim. */
export const drumTop = (c: Ctx, eye: View['eye'], a: number, b: number, y: number, d: number, R: string[]) => {
  if (eye.y >= y - 1) return false;
  const cx = (a + b) / 2, rx = (b - a) / 2, pts: [number, number][] = [];
  for (let i = 0; i <= 16; i++) { const t = (i / 16) * Math.PI; pts.push(at(eye, cx - Math.cos(t) * rx, y, 1 - (1 - d) * Math.sin(t))); }
  polyF(c, pts, R[3]);
  const [mx, my] = at(eye, cx, y, 1 - (1 - d) * 0.5);
  polyF(c, pts.map(([px, py]) => [px + (mx - px) * 0.3, py + (my - py) * 0.3] as [number, number]), R[4]);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke();
  return true;
};
/** How a prop's depth is drawn (boxSides): `d0` its front's depth (1: the play plane); `lines` world y's of lines
 *  running back along its sides (a cloth's hem, drawer seams, a molding); `apron` (px down from its top): a thing on
 *  legs (a table, a bench), its side only its top's thickness, a leg at the back corner (`leg` px wide, 0 for none: a
 *  shelf on brackets) down to `bottom`; `noTop` for no top face (round tops, things nobody'd see the top of);
 *  `sideR` / `topR` other ramps for the sides / the top (default `R`); `cut` [left, right]: where a side stops (world y:
 *  the top of a lower thing against that end, which hides the rest; at or above `top`, that side's never drawn: it's
 *  against something as tall). */
export interface BoxSides { d0?: number; lines?: number[]; apron?: number; leg?: number; noTop?: boolean; sideR?: string[]; topR?: string[]; cut?: [number | null, number | null] }
/**
 * A solid prop's depth (a table, a desk, a counter, a cabinet, a crate, a riser...): its sides going back from its
 * front face (x a..b at depth d0, `top` to `bottom` world y) to depth d1, each only where the eye's past that end (so
 * it opens up as the camera moves away and is gone looking straight at it), and its top going back where the eye's
 * above it. sideBack and topBack plus what Fairy Land's wallSide puts on a wall's return: lines running back to the
 * one eye, a lit corner down the front edge, the far edge inked. A few polygons and strokes a frame (no pixel work);
 * draw it before the front face (the stamp): the sides and the top never cross it. `R` a ramp6.
 */
export const boxSides = (c: Ctx, eye: View['eye'], a: number, b: number, top: number, bottom: number, d1: number, R: string[], o: BoxSides = {}) => {
  const d0 = o.d0 ?? 1, S = o.sideR ?? R;
  if (!o.noTop) topBack(c, eye, a, b, top, d0, d1, o.topR ?? R, 3);
  for (const [e, side] of [[a, -1], [b, 1]] as const) {
    if ((eye.x - e) * side <= 1) continue;
    const cut = o.cut?.[side < 0 ? 0 : 1] ?? null;
    if (cut !== null && cut <= top + 1) continue;
    const low = Math.min(o.apron ? Math.min(bottom, top + o.apron) : bottom, cut ?? Infinity);
    // (the back leg first: it stands behind the side's band)
    if (o.apron && (o.leg ?? 6) > 0 && low < bottom && cut === null) {
      const lw = o.leg ?? 6, dl = d1 + (d0 - d1) * 0.1;
      const [x0, y0] = at(eye, e - side * lw, low, dl), [x1, y1] = at(eye, e, bottom, dl);
      const l = Math.round(Math.min(x0, x1)), w = Math.max(2, Math.round(Math.abs(x1 - x0)));
      box(c, l - 1, y0, w + 2, y1 - y0, INK); box(c, l, y0, w, y1 - y0, S[1]); box(c, side > 0 ? l + w - 1 : l, y0, 1, y1 - y0, S[2]);
    }
    sideBack(c, eye, e, side, top, low, d0, d1, S, 3);
    const [nx, nt] = at(eye, e, top, d0), [fx] = at(eye, e, top, d1);
    if (Math.abs(fx - nx) < 3) continue;
    // (the lines running back: a dark line, lit under it)
    if (o.lines?.length) {
      const dark = new Path2D(), lite = new Path2D();
      for (const y of o.lines) {
        if (y <= top || y >= low) continue;
        const [p0, q0] = at(eye, e, y, d0), [p1, q1] = at(eye, e, y, d1);
        dark.moveTo(p0, q0); dark.lineTo(p1, q1); lite.moveTo(p0, q0 + 1); lite.lineTo(p1, q1 + 1);
      }
      c.lineWidth = 1; c.strokeStyle = S[0]; c.stroke(dark);
      c.globalAlpha = 0.5; c.strokeStyle = S[3]; c.stroke(lite); c.globalAlpha = 1;
    }
    // (the corner: lit down its front edge)
    const [, nb] = at(eye, e, low, d0);
    box(c, Math.round(nx) - (side > 0 ? 0 : 2), nt, 2, nb - nt, S[5]);
  }
};
/** A slab (a face), stepped: lit down its left and along its top, shaded down its right (dithered in). */
export const slab =(g: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  box(g, x, y, w, h, R[3]);
  box(g, x, y, 2, h, R[4]); box(g, x, y, w, 2, R[4]);
  box(g, x + w - 4, y, 4, h, R[2]); checker(g, x + w - 8, y, 4, h, R[2], 0, 1);
};
/** A round post, stepped across, inked (`R` a ramp6). */
export const postR = (g: Ctx, x: number, top: number, foot: number, w: number, R: string[]) => {
  const x0 = Math.round(x - w / 2), t = Math.max(1, Math.round(w * 0.3));
  box(g, x0 - 1, top, w + 2, foot - top, INK);
  box(g, x0, top, w, foot - top, R[3]); box(g, x0, top, t, foot - top, R[4]);
  if (w > 3) box(g, x0 + 1, top, 1, foot - top, R[5]);
  box(g, x0 + w - t, top, t, foot - top, R[1]);
};
/** A ball, stepped (`R` a ramp6): ink, shade, itself up and left, lit, a glint. */
export const ballR = (g: Ctx, x: number, y: number, r: number, R: string[], ink = true) => {
  const disc = (dx: number, dy: number, rr: number, col: string) => { if (rr <= 0) return; g.fillStyle = col; g.beginPath(); g.arc(x + dx, y + dy, rr, 0, Math.PI * 2); g.fill(); };
  if (ink) disc(0, 0, r + 1, INK);
  disc(0, 0, r, R[1]); disc(-r * 0.1, -r * 0.1, r * 0.86, R[2]); disc(-r * 0.22, -r * 0.22, r * 0.62, R[3]); disc(-r * 0.35, -r * 0.35, r * 0.3, R[4]);
  if (r > 2) box(g, x - r * 0.45, y - r * 0.5, Math.max(1, r * 0.2), Math.max(1, r * 0.2), R[5]);
};
/** An ellipse, stepped (`R` a ramp6), lit from the upper left. */
export const eggR = (g: Ctx, x: number, y: number, rx: number, ry: number, R: string[], ink = true, rot = 0) => {
  const el = (dx: number, dy: number, a: number, b: number, col: string) => { if (a <= 0 || b <= 0) return; g.fillStyle = col; g.beginPath(); g.ellipse(x + dx, y + dy, a, b, rot, 0, Math.PI * 2); g.fill(); };
  if (ink) el(0, 0, rx + 1.2, ry + 1.2, INK);
  el(0, 0, rx, ry, R[1]); el(-rx * 0.08, -ry * 0.1, rx * 0.88, ry * 0.84, R[2]); el(-rx * 0.2, -ry * 0.24, rx * 0.64, ry * 0.58, R[3]); el(-rx * 0.34, -ry * 0.4, rx * 0.3, ry * 0.24, R[4]);
  if (rx > 3) box(g, x - rx * 0.46, y - ry * 0.56, Math.max(1, rx * 0.16), Math.max(1, ry * 0.14), R[5]);
};
/** A banded fill down a path (clipped): `R` darkest first, the light at the top; dithered seams. */
export const bandsDown = (g: Ctx, path: () => void, x: number, y: number, w: number, h: number, cols: string[]) => {
  g.save(); g.beginPath(); path(); g.clip();
  const n = cols.length;
  for (let i = 0; i < n; i++) { const y0 = Math.round(y + (h * i) / n); box(g, x, y0, w, Math.ceil(h / n) + 1, cols[i]); if (i) checker(g, x, y0 - 1, w, 2, cols[i], i % 2, 1); }
  g.restore();
};
/** Shading across a path (clipped): lit down its left, shaded down its right, dithered where the steps meet. */
export const shadeAcross = (g: Ctx, path: () => void, x: number, y: number, w: number, h: number, R: string[]) => {
  g.save(); g.beginPath(); path(); g.clip();
  box(g, x - 2, y - 2, w + 4, h + 4, R[3]);
  const l = Math.round(x + w * 0.22), s = Math.round(x + w * 0.64), r = Math.round(x + w * 0.85);
  box(g, x - 2, y - 2, l - x + 2, h + 4, R[4]); box(g, x - 2, y - 2, Math.max(2, Math.round(w * 0.07)) + 2, h + 4, R[5]);
  checker(g, l, y - 2, 2, h + 4, R[4], 0, 1);
  box(g, s, y - 2, x + w - s + 2, h + 4, R[2]); checker(g, s - 2, y - 2, 2, h + 4, R[2], 1, 1);
  box(g, r, y - 2, x + w - r + 2, h + 4, R[1]); checker(g, r - 2, y - 2, 2, h + 4, R[1], 0, 1);
  g.restore();
};
/** A curly candy-striped stroke (a pole, a trunk, a stalk) along a path, in steps: ink, the base, a lit edge up its
 *  left, a shaded one down its right, stripes over it (each stripe lit and shaded too). */
export const candyStroke = (g: Ctx, path: () => void, w: number, A: string[], B: string[] | null, dash = 6) => {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = w + 3; g.stroke();
  g.strokeStyle = A[3]; g.lineWidth = w; g.stroke();
  if (B) { g.setLineDash([dash, dash]); g.strokeStyle = B[3]; g.stroke(); g.setLineDash([]); }
  g.save(); g.translate(w * 0.28, 0); g.beginPath(); path(); g.strokeStyle = A[1]; g.lineWidth = w * 0.3; g.stroke();
  if (B) { g.setLineDash([dash, dash]); g.strokeStyle = B[1]; g.stroke(); g.setLineDash([]); }
  g.restore();
  g.save(); g.translate(-w * 0.26, 0); g.beginPath(); path(); g.strokeStyle = A[5]; g.lineWidth = Math.max(1, w * 0.18); g.stroke();
  if (B) { g.setLineDash([dash, dash]); g.strokeStyle = B[4]; g.stroke(); g.setLineDash([]); }
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Signs

/** The park's letters: fat, hand-done, bouncing off the line, a bright fill banded top to bottom, inked, a drop shadow. */
export const toonLetters = (cell = 2, fill: string[] = ['#FFFFFF', '#FFF7C2', '#FDE047', '#F59E0B'], seed = 0): Look => ({ sx: cell, sy: cell, bold: true, gap: 1, fill, dither: true, ink: INK, shadow: '#3A1030', drop: 2, wobble: 2, seed });

/**
 * A cartoon sign standing at (x, feetY), world space: a lumpy board (a cloud's outline) on a curly candy-striped pole
 * sunk in a grassy hummock, a curl of a bracket under it, two bolts. `lines` top to bottom, the first big. `board` the
 * board's color. Painted once for the hour (a stamp), in steps: the board banded light to shade and bevelled, the
 * pole's stripes lit and shaded, the hummock's grass and its flowers.
 */
export const toonSign = (c: Ctx, x: number, feetY: number, lines: string[], opts: { board?: string; tall?: number; big?: number; seed?: number; pole?: [string, string]; warn?: boolean } = {}) => {
  const big = opts.big ?? 2, seed = opts.seed ?? lines.join('').length;
  const looks = lines.map((_, i) => toonLetters(i ? 1 : big, opts.warn ? ['#FFFFFF', '#FFE4E6', '#FECDD3', '#FB7185'] : i ? ['#FFFFFF', '#FFFFFF', '#FDF2F8', '#F9A8D4'] : undefined, seed + i));
  const w = Math.max(90, ...lines.map((l, i) => signW(l, looks[i]) + 34)), lh = lines.map((_, i) => 7 * (i ? 1 : big) + (i ? 7 : 10));
  const h = lh.reduce((a, b) => a + b, 0) + 18, tall = opts.tall ?? 120;
  const board = opts.board ?? (opts.warn ? '#BE123C' : '#7C3AED');
  const [pa, pb] = opts.pole ?? ['#FFF7E8', '#EF4444'];
  const key = `ctsign2-${lines.join('|')}-${board}-${tall}-${big}-${opts.warn ? 1 : 0}-${timeOfDay().key}-${fontKey()}`;
  c.save(); c.translate(Math.round(x), Math.round(feetY));
  stamp(c, key, -w / 2 - 24, -tall - h - 20, w + 48, tall + h + 30, g => {
    const T = (col: string) => hour(col, 0.12);
    // (the hummock it's sunk in: grass in steps, a few flowers)
    const G = ramp6(T('#6CCC6A'));
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, 1, 24, 9, 0, Math.PI, 0); g.fill();
    g.fillStyle = G[2]; g.beginPath(); g.ellipse(0, 1, 21, 7, 0, Math.PI, 0); g.fill();
    g.fillStyle = G[3]; g.beginPath(); g.ellipse(-3, 0, 15, 5, 0, Math.PI, 0); g.fill();
    g.fillStyle = G[4]; g.beginPath(); g.ellipse(-6, -1, 7, 3, 0, Math.PI, 0); g.fill();
    checker(g, -20, -2, 40, 2, G[2], 0, 1);
    for (const [fx, fc] of [[-14, '#F9A8D4'], [12, '#FDE047'], [-6, '#FFFFFF']] as const) { box(g, fx, -4, 2, 2, fc); box(g, fx, -2, 1, 2, G[1]); }
    // (the pole: a fat curl of candy stripe up to the board, lit up its left, shaded down its right)
    const top = -tall;
    candyStroke(g, () => { g.moveTo(0, -2); g.bezierCurveTo(-14, top * 0.35, 14, top * 0.7, 0, top); }, 8, ramp6(T(pa)), ramp6(T(pb)), 6);
    // (the bracket: a curl out under the board, a bolt at each end)
    const bx = -w / 2, by = top - h, B = T(board), R = ramp6(B);
    g.lineCap = 'round';
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-28, top + 4); g.quadraticCurveTo(-4, top + 16, 0, top - 2); g.quadraticCurveTo(4, top + 16, 28, top + 4); g.stroke();
    g.strokeStyle = T('#C8A0E8'); g.lineWidth = 3; g.stroke();
    g.strokeStyle = T('#EEDCFA'); g.lineWidth = 1; g.beginPath(); g.moveTo(-27, top + 3); g.quadraticCurveTo(-5, top + 13, -1, top - 2); g.stroke();
    // (the board: a cloud's lumpy outline, banded light to shade, bevelled, a shine)
    const cloud = () => {
      g.moveTo(bx + 10, by + h);
      for (let k = 0; k <= 4; k++) g.quadraticCurveTo(bx + (k + 0.5) * (w / 5) - w / 10 + 10, by + h + 7, bx + 10 + (k + 1) * ((w - 20) / 5), by + h);
      g.quadraticCurveTo(bx + w + 8, by + h / 2, bx + w - 10, by);
      for (let k = 4; k >= 0; k--) g.quadraticCurveTo(bx + 10 + (k + 0.5) * ((w - 20) / 5), by - 9, bx + 10 + k * ((w - 20) / 5), by);
      g.quadraticCurveTo(bx - 8, by + h / 2, bx + 10, by + h);
      g.closePath();
    };
    g.fillStyle = mix(R[0], '#000000', 0.2); g.save(); g.translate(3, 4); g.beginPath(); cloud(); g.fill(); g.restore();
    bandsDown(g, cloud, bx - 12, by - 12, w + 24, h + 22, [R[4], R[3], R[3], R[3], R[2], R[1]]);
    g.save(); g.beginPath(); cloud(); g.clip();
    g.translate(2, 2); g.beginPath(); cloud(); g.strokeStyle = R[5]; g.lineWidth = 3; g.stroke();
    g.translate(-4, -4); g.beginPath(); cloud(); g.strokeStyle = R[1]; g.lineWidth = 3; g.stroke();
    g.restore();
    g.beginPath(); cloud(); g.strokeStyle = INK; g.lineWidth = 3.5; g.lineJoin = 'round'; g.stroke();
    // (a shine up the top left, two bolts)
    box(g, bx + 12, by + 1, 10, 2, R[5]); box(g, bx + 10, by + 3, 4, 2, R[5]); box(g, bx + 25, by + 1, 3, 2, R[5]);
    for (const sx of [bx + 8, bx + w - 11]) { box(g, sx, by + h - 6, 4, 4, INK); box(g, sx + 1, by + h - 5, 2, 2, T('#E2E8F0')); }
    // (the letters)
    let ly = by + 12;
    lines.forEach((l, i) => { signText(g, l, 0, Math.round(ly + lh[i] / 2 + (7 * (i ? 1 : big)) / 2 - 2), looks[i]); ly += lh[i]; });
  });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The sky

/**
 * Screen space: the sky by the hour (cel-painted bands), curly cartoon clouds drifting, the far rolling hills in two
 * flat tones with lollipop trees on them, and the CARTOON LAND WATER TOWER standing on the far hill (monument.ts, at
 * the section's size; it drifts across as he goes). For the stubs and the sections not yet given their own far layers.
 */
export const toonSky = (c: Ctx, state: GameState, tower: MonumentAt | null, opts: { hill?: string; near?: string } = {}) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  drawTodSky(c, 0, 0, W, H, ['#38BDF8', '#60C8FA', '#8ED8FB', '#BDE8FD', '#E0F4FE', '#FDF2F8'], { horizon: 420, sun: [620, 100], moon: [170, 90] });
  // (the clouds: lumps on a flat bottom, inked, drifting)
  const tod = timeOfDay(), cloud = hourMix('#FFFFFF', '#FBCFE8', '#475569');
  for (let k = 0; k < 5; k++) {
    const cx = ((k * 240 - state.camera.x * 0.03 + state.frame * 0.05 + 2000) % 1200) - 200, cy = 70 + (k % 3) * 46;
    c.fillStyle = INK;
    for (const [dx, dy, r] of [[0, 0, 22], [26, -10, 26], [54, 0, 20], [24, 6, 18]]) { c.beginPath(); c.arc(cx + dx, cy + dy, r + 2.5, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = cloud;
    for (const [dx, dy, r] of [[0, 0, 22], [26, -10, 26], [54, 0, 20], [24, 6, 18]]) { c.beginPath(); c.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); c.fill(); }
    box(c, cx - 22, cy + 8, 98, 16, cloud);
    c.fillStyle = mix(cloud, '#93C5FD', 0.35); box(c, cx - 18, cy + 18, 90, 4, mix(cloud, '#93C5FD', 0.35));
  }
  // (far hills: rolling humps, a lollipop tree here and there)
  const far = farTint(opts.hill ?? '#A7D8A0', 0.8, tod);
  const off = -((state.camera.x * 0.05) % 600);
  c.fillStyle = far;
  c.beginPath(); c.moveTo(0, 440);
  for (let x = -20; x <= W + 20; x += 20) c.lineTo(x, 380 - Math.sin((x - off) * 0.012) * 26 - Math.sin((x - off) * 0.031) * 8);
  c.lineTo(W, 440); c.closePath(); c.fill();
  if (tower) drawMonument(c, state, tower);
  const near = farTint(opts.near ?? '#6CC07A', 0.55, tod), off2 = -((state.camera.x * 0.12) % 700);
  c.fillStyle = near;
  c.beginPath(); c.moveTo(0, 450);
  for (let x = -20; x <= W + 20; x += 20) c.lineTo(x, 412 - Math.sin((x - off2) * 0.017 + 1) * 16);
  c.lineTo(W, 450); c.closePath(); c.fill();
  for (let k = 0; k < 9; k++) {
    const tx = ((k * 110 + off2 * 1.0) % 990 + 990) % 990 - 60, ty = 412 - Math.sin((tx - off2) * 0.017 + 1) * 16;
    box(c, tx - 1, ty - 16, 2, 16, mix(near, INK, 0.4));
    c.fillStyle = farTint(['#F472B6', '#FDE047', '#FB923C', '#C084FC'][k % 4], 0.55, tod); c.beginPath(); c.arc(tx, ty - 20, 7, 0, Math.PI * 2); c.fill();
  }
  box(c, 0, 446, W, H - 446, mix(near, INK, 0.2));
  return true;
};
