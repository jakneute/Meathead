// Thrones of the Stars' painting kit (the final pass: peak SNES, on the boulevard's kit so the land's of a piece): the
// coaster's materials in stepped ramps (the crimson box spine, the gold rails, galvanized lattice, riveted plate, the
// bathroom set's porcelain, chrome and tile, marble, the velvet), each worked out once per hour (pal()); the one eye
// for the scene (the boulevard's: spooky/town's view, off the camera) and what's on screen of the world at any depth,
// zoomed or not (the rides pull the camera right back: state.view); and the pieces the structure's built from (the
// lattice towers, the riveted columns, the beams' stepped cones of light, footings).

import type { GameState } from '../../../m1/game/core/state';
import {
  type Ctx, type View, INK, box, checker, mix, hash, poly, at, atDepth, timeOfDay, skyAt, hourMix, farTint,
  STEEL, BRASS, VELVET, PLY, SAND, CONCRETE, LIP, ramp6, hour, dimmed, viewIn,
} from '../blvd/kit';

export type { Ctx, View };
export { INK };

// ---------------------------------------------------------------------------------------------------------------
// The view (one eye: the boulevard's; what's on screen from the zoomed-out rides too)

export interface CView extends View {
  /** What's on screen of the play plane (world), zoomed or not. */
  vx: number; vy: number; vw: number; vh: number;
}
export const cview = (state: GameState): CView => {
  const v = viewIn(state), w = state.view ?? { x: state.camera.x, y: state.camera.y, w: 800, h: 600 };
  return { ...v, vx: w.x, vy: w.y, vw: w.w, vh: w.h };
};
/** Something at world x a..b, y top..bot, at depth d: on screen (by where it's drawn: no pop-in)? */
export const vis = (v: CView, a: number, b: number, top = -1e9, bot = 1e9, d = 1, pad = 60) => {
  const [sa, st] = at(v.eye, a, top, d), [sb, sb2] = at(v.eye, b, bot, d);
  return sb > v.vx - pad && sa < v.vx + v.vw + pad && sb2 > v.vy - pad && st < v.vy + v.vh + pad;
};
/** The world x range on screen at depth d. */
export const spanAt = (v: CView, d: number, pad = 80): [number, number] => [v.eye.x + (v.vx - pad - v.eye.x) / d, v.eye.x + (v.vx + v.vw + pad - v.eye.x) / d];
/** The screen y of ground line y at depth d. */
export const yAt = (v: CView, y: number, d: number) => v.eye.y + (y - v.eye.y) * d;

// ---------------------------------------------------------------------------------------------------------------
// Materials (darkest first), and the palette for the hour

/** The box spine under the rails: crimson, lacquered. */
export const CRIMSON = ['#2A0408', '#4E0A12', '#78121C', '#A01E28', '#C8423E', '#EE7A62'];
/** Porcelain (the toilets, the sinks, the urinals). */
export const PORCELAIN = ['#5E5A56', '#8C8882', '#B8B4AE', '#DCD8D2', '#F2F0EA', '#FFFFFF'];
/** Chrome (the faucets, the flush valves, the dryers). */
export const CHROME = ['#2A2E36', '#4A505C', '#7A828E', '#AEB6C0', '#D8DEE6', '#FFFFFF'];
/** Marble (the plinths): warm white, veined gray. */
export const MARBLE = ['#6A625A', '#9A928A', '#C4BEB4', '#E2DCD2', '#F2EEE6', '#FFFFFF'];
/** The hazard stripes' yellow. */
export const HAZARD = ['#4A3404', '#7A5A08', '#B8880E', '#E8B416', '#F8D44A', '#FFF09A'];
/** Poo, in steps (the clogs, the blowouts). */
export const POO = ['#1E1006', '#3A220C', '#5C3A16', '#7A4E1E', '#9A6A2E', '#BC8A48'];
/** Biohazard green (stop 3's case, its fumes). */
export const BIO = ['#14280A', '#2A4A12', '#4D7C0F', '#84CC16', '#BEF264', '#ECFCCB'];

export interface Pal {
  key: string;
  steel: string[]; steelD: string[]; crimson: string[]; gold: string[]; velvet: string[]; ply: string[]; sand: string[];
  concrete: string[]; porcelain: string[]; chrome: string[]; marble: string[]; hazard: string[]; lip: string[];
  /** The sky low down (the haze everything far goes into). */
  haze: string;
}
let palCache: Pal | null = null;
/** Every ramp for the hour (near: barely into the haze; steelD: the structure's, set back a step, dimmed). */
export const pal = (): Pal => {
  const tod = timeOfDay();
  if (palCache && palCache.key === tod.key) return palCache;
  const H = (r: string[]) => r.map(c => hour(c));
  palCache = {
    key: tod.key,
    steel: H(STEEL), steelD: STEEL.map(dimmed), crimson: H(CRIMSON), gold: H(BRASS), velvet: H(VELVET), ply: PLY.map(dimmed), sand: SAND.map(dimmed),
    concrete: H(CONCRETE), porcelain: H(PORCELAIN), chrome: H(CHROME), marble: H(MARBLE), hazard: H(HAZARD), lip: H(LIP),
    haze: skyAt(0.9, tod),
  };
  return palCache;
};
/** A color going back into the haze (d: the depth; 1 the play plane). */
export const far = (col: string, d: number, k = 0.75) => mix(farTint(hourMix(col, mix(col, '#7A4A5A', 0.16), mix(col, '#141832', 0.4)), 1), skyAt(0.9, timeOfDay()), Math.min(0.85, (1 - d) * k));

// ---------------------------------------------------------------------------------------------------------------
// Pieces

/** A stroke along a path, inked: ink under, the color, its lit edge up-left. */
export const tube = (c: Ctx, path: () => void, w: number, R: string[], lit = true) => {
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); path(); c.stroke();
  c.strokeStyle = R[2]; c.lineWidth = w; c.beginPath(); path(); c.stroke();
  if (lit && w >= 3) { c.save(); c.translate(-Math.max(0.5, w * 0.2), -Math.max(0.5, w * 0.25)); c.strokeStyle = R[4]; c.lineWidth = Math.max(1, w * 0.34); c.beginPath(); path(); c.stroke(); c.restore(); }
  c.lineCap = 'butt';
};
/** A straight steel member (screen or world), inked, lit along its top-left. */
export const member = (c: Ctx, ax: number, ay: number, bx: number, by: number, w: number, R: string[]) => {
  c.lineCap = 'butt';
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  c.strokeStyle = R[3]; c.lineWidth = w; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  if (w >= 3) { c.strokeStyle = R[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(ax - w / 3, ay - w / 3); c.lineTo(bx - w / 3, by - w / 3); c.stroke(); }
};

/**
 * A lattice tower (the coaster's legs): two chords (galvanized, stepped across, inked), cross-braced in bays, a strut
 * across every bay, gussets at the joints; its concrete footing at `foot`. `w` across, from `top` down to `foot`. `R`
 * its steel ramp (6). Taper: how much narrower at the top (0 none).
 */
export const lattice = (c: Ctx, x: number, top: number, foot: number, w: number, R: string[], bay = 44, taper = 0, footing = true, anchor = top, ink = INK) => {
  if (foot - top < 4) return;
  // (the bays counted from `anchor`, wherever it's cut off: the bracing doesn't crawl as the view does)
  const b0 = anchor + 6 + Math.max(0, Math.ceil((top - anchor) / bay)) * bay;
  const ch = Math.max(2, Math.round(w * 0.16));
  const xl = (y: number) => Math.round(x - w / 2 + taper * w * 0.5 * (1 - (y - top) / (foot - top)));
  const xr = (y: number) => Math.round(x + w / 2 - taper * w * 0.5 * (1 - (y - top) / (foot - top)));
  // (the bracing first, behind the chords: one path for the lot)
  c.strokeStyle = ink; c.lineWidth = Math.max(2, ch * 0.7) + 1.5; c.beginPath();
  const bs = b0 - bay >= anchor + 6 ? b0 - bay : b0;
  const brace = () => { for (let y = bs; y < foot - 4; y += bay) { const y1 = Math.min(foot - 4, y + bay); c.moveTo(xl(y) + ch, y); c.lineTo(xr(y1) - ch, y1); c.moveTo(xr(y) - ch, y); c.lineTo(xl(y1) + ch, y1); } };
  brace(); c.stroke();
  c.strokeStyle = R[2]; c.lineWidth = Math.max(1, ch * 0.7); c.beginPath(); brace(); c.stroke();
  // (the struts across each bay, lit along the top)
  for (let y = b0; y < foot - 4; y += bay) { const a = xl(y), b = xr(y); box(c, a, y - 1, b - a, 4, ink); box(c, a, y, b - a, 2, R[3]); }
  // (the two chords: stepped across, ink round; the near one lit, the far one in shade)
  const chord = (left: boolean) => {
    // (in runs: straight where it doesn't taper, stepped where it does)
    const step = taper ? 24 : foot - top;
    for (let y = top; y < foot; y += step) {
      const y1 = Math.min(foot, y + step), xx = left ? xl(y) : xr(y) - ch;
      box(c, xx - 1, y, ch + 2, y1 - y, ink);
      box(c, xx, y, ch, y1 - y, left ? R[3] : R[2]);
      box(c, xx, y, Math.max(1, Math.round(ch * 0.35)), y1 - y, left ? R[5] : R[3]);
      if (ch > 3) box(c, xx + ch - 1, y, 1, y1 - y, R[1]);
    }
  };
  chord(true); chord(false);
  // (gussets at the struts' ends)
  if (w > 18) for (let y = b0; y < foot - 4; y += bay) { box(c, xl(y) + ch, y - 3, 3, 3, R[1]); box(c, xr(y) - ch - 3, y - 3, 3, 3, R[1]); }
  if (footing) pier(c, x, foot, w + 14, R);
};
/** A concrete pier at a leg's foot (its cap, the anchor bolts). */
export const pier = (c: Ctx, x: number, foot: number, w: number, R?: string[], Kc?: string[]) => {
  const K = Kc ?? pal().concrete;
  box(c, x - w / 2 - 1, foot - 13, w + 2, 14, INK);
  box(c, x - w / 2, foot - 12, w, 12, K[3]); box(c, x - w / 2, foot - 12, w, 2, K[5]); box(c, x - w / 2, foot - 12, 2, 12, K[4]); box(c, x + w / 2 - 3, foot - 12, 3, 12, K[2]);
  checker(c, x - w / 2, foot - 4, w, 4, K[2], 0, 2);
  const b = R ?? pal().steel;
  for (const bx of [x - w / 2 + 4, x + w / 2 - 6]) { box(c, bx, foot - 15, 2, 3, b[1]); box(c, bx, foot - 15, 1, 1, b[4]); }
};
/** Rivets in a row (a bead of light on each). */
export const rivets = (c: Ctx, x0: number, x1: number, y: number, step: number, R: string[]) => {
  for (let x = x0; x <= x1; x += step) { box(c, x, y, 2, 2, R[1]); box(c, x, y, 1, 1, R[5]); }
};
/** Hazard stripes (diagonal, yellow on black) across a box. */
export const hazard = (c: Ctx, x: number, y: number, w: number, h: number, step = 10) => {
  const Y = pal().hazard;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  box(c, x, y, w, h, '#18141A');
  c.fillStyle = Y[3];
  for (let k = -h; k < w + h; k += step * 2) { c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + step, y + h); c.lineTo(x + k + step + h, y); c.lineTo(x + k + h, y); c.closePath(); c.fill(); }
  box(c, x, y, w, 1, Y[5]);
  c.restore();
};
/** A five-pointed star polygon about (x, y). */
export const starAt = (c: Ctx, x: number, y: number, r: number, col: string, inner = 0.42) => {
  c.fillStyle = col; c.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * inner : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath(); c.fill();
};
/** A gold star, stepped: inked, the gold, lit up-left, a glint. */
export const goldStar = (c: Ctx, x: number, y: number, r: number) => {
  const G = pal().gold;
  starAt(c, x + 0.5, y + 1, r + 1.5, INK);
  starAt(c, x, y, r, G[2]);
  starAt(c, x - 0.5, y - 0.5, r * 0.72, G[4]);
  starAt(c, x - 1, y - 1, r * 0.3, G[5]);
};
/**
 * A beam of light down from a lamp at (x, top) onto (x ± spread) at y: banded, brighter toward the lamp (stepped, not
 * smooth), a pool on the floor.
 */
export const beam = (c: Ctx, x: number, top: number, y: number, spread: number, col: string, a = 0.16) => {
  const n = 4;
  for (let i = 0; i < n; i++) {
    const k0 = i / n, k1 = (i + 1) / n, w0 = 8 + (spread - 8) * k0, w1 = 8 + (spread - 8) * k1;
    const y0 = top + (y - top) * k0, y1 = top + (y - top) * k1;
    c.fillStyle = col; c.globalAlpha = a * (1 - i * 0.16);
    c.beginPath(); c.moveTo(x - w0, y0); c.lineTo(x + w0, y0); c.lineTo(x + w1, y1); c.lineTo(x - w1, y1); c.closePath(); c.fill();
  }
  c.globalAlpha = a * 1.4; c.beginPath(); c.ellipse(x, y, spread, 4, 0, 0, Math.PI * 2); c.fill();
  c.globalAlpha = 1;
};
/** A par can (a stage light) at (x, y), pointing down at `ang` (0 straight down). */
export const parCan = (c: Ctx, x: number, y: number, ang: number, on: boolean) => {
  const S = pal().steel;
  c.save(); c.translate(x, y); c.rotate(ang);
  box(c, -7, -10, 14, 18, INK); box(c, -6, -9, 12, 16, '#26222A'); box(c, -6, -9, 3, 16, '#3E3A46');
  box(c, -8, 6, 16, 4, INK); box(c, -7, 6, 14, 3, on ? '#FFF6C8' : '#B8B090'); box(c, -5, 6, 4, 1, '#FFFFFF');
  c.restore();
  box(c, x - 1, y - 18, 2, 10, S[2]);
};
/** A sign board hung on two chains from `from` (its middle at x, y; w, h its board's). */
export const chains = (c: Ctx, xs: number[], from: number, to: number) => {
  const S = pal().steel;
  for (const cx of xs) for (let yy = from; yy < to; yy += 6) { box(c, cx - 2, yy, 4, 5, INK); box(c, cx - 1, yy + 1, 2, 3, (yy / 6) % 2 ? S[3] : S[4]); }
};

void PLY; void SAND; void CONCRETE; void LIP; void BRASS; void VELVET; void poly; void hash; void atDepth; void ramp6;
