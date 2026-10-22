// Disaster: The Ride's painting kit (the final pass: peak SNES, on the boulevard's kit so the land's of a piece): the
// ride's own materials in stepped ramps, darkest first (the lobby's maroon flock and its patterned cinema carpet, the
// pre-show's indigo, the theater's black box: duvetyne, acoustic panels, the black deck; truss aluminium, road-case
// black, the screen's silver), the view (the boulevard's one eye, off the camera; out wider in the wide shot), the depths
// the rooms are built at (their back walls at WALL_D, the screen hung in front of the theater's), and the pieces a cheap
// ride's built from (box truss, a lit lip along whatever he stands on, a board hung on chains, a sign on a stand, a
// framed one-sheet, the PA's horn) and its branding (DISASTER: in orange bulbs, THE RIDE in gold, the outside's).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import {
  type Ctx, type View, type Look, INK, box, checker, mix, poly, at, atDepth, stamp, ramp6, signText, signW, signH, board, plain, bulbs,
  BRASS, STEEL, LIP, viewOf,
} from '../blvd/kit';
import { gate } from '../blvd/paint';
import { GY } from './layout';

export type { Ctx, View, Look };
export { INK };

// ---------------------------------------------------------------------------------------------------------------
// The view and the depths

/** How high over the floor line the eye is at the camera's rest (the camera's y + 252; its rest GY - 550). */
export const REST = 298;
/** The depth that lands `h` px up the screen from the floor line at the camera's rest. */
export const dUp = (h: number) => 1 - h / REST;
/** The rooms' back walls (the floor goes back 46 px at rest). */
export const WALL_D = dUp(46);
/** Hung in front of the back wall: the theater's screen and its masking; the lobby's posters' easels and the like. */
export const SCREEN_D = dUp(30), NEAR_D = dUp(14);

/** The view, the one eye off the camera; what's on screen from the real view (wider in the wide shot). */
export const dview = (state: GameState): View => {
  const v = viewOf(state), sv = state.view;
  if (sv && (sv.w > CANVAS_WIDTH + 1 || sv.h > CANVAS_HEIGHT + 1)) { v.v0 = sv.x - 120; v.v1 = sv.x + sv.w + 120; v.top = sv.y - 40; v.bot = sv.y + sv.h + 40; }
  return v;
};
/** Where a world point drawn at depth d lands (in the world, at the play plane), by the camera's eye now: for things
 *  that come off art drawn at depth (particles, captions, a prop torn loose) so they start where it's drawn. */
export const fromDepth = (state: GameState, x: number, y: number, d: number): [number, number] => at(viewOf(state).eye, x, y, d);
/** Where the effects stand, and the screen hangs. */
export const EFX_D = 0.97;
/** On screen: something at world x a..b at depth d (by where it lands: no pop-in). */
export const seenD = (v: View, a: number, b: number, d = 1, pad = 60) => {
  const [sa] = at(v.eye, a, 0, d), [sb] = at(v.eye, b, 0, d);
  return sb > v.v0 - pad && sa < v.v1 + pad;
};
/** The world x span on screen at depth d. */
export const spanAt = (v: View, d: number, pad = 60): [number, number] => [v.eye.x + (v.v0 - pad - v.eye.x) / d, v.eye.x + (v.v1 + pad - v.eye.x) / d];
/** The world y span on screen at depth d. */
export const spanY = (v: View, d: number, pad = 40): [number, number] => [v.eye.y + (v.top - pad - v.eye.y) / d, v.eye.y + (v.bot + pad - v.eye.y) / d];
/** A quad of a level plane (y), x a..b, from depth d0 back to d1. */
export const levelQ = (c: Ctx, eye: View['eye'], a: number, b: number, y: number, d0: number, d1: number, col: string) =>
  poly(c, [at(eye, a, y, d0), at(eye, b, y, d0), at(eye, b, y, d1), at(eye, a, y, d1)], col);
/** A quad of an upright plane across x = e (a side wall), y top..bottom, from depth d0 back to d1. */
export const sideQ = (c: Ctx, eye: View['eye'], e: number, top: number, bottom: number, d0: number, d1: number, col: string) =>
  poly(c, [at(eye, e, top, d0), at(eye, e, top, d1), at(eye, e, bottom, d1), at(eye, e, bottom, d0)], col);

// ---------------------------------------------------------------------------------------------------------------
// Materials (darkest first)

/** The lobby's flocked maroon walls. */
export const MAROON = ['#1E060C', '#360A16', '#520E20', '#6E162A', '#8E2236', '#B03A4A'];
/** The lobby's cinema carpet (deep red, the pattern's gold and teal on it). */
export const CARPET = ['#1A0608', '#2E0A0E', '#461016', '#5E1820', '#7A222A', '#963236'];
/** The pre-show's indigo (walls and carpet). */
export const INDIGO = ['#0C0A24', '#16123A', '#221C52', '#2E266A', '#3E3486', '#5446A6'];
/** The theater's blacks (duvetyne, the acoustic panels, the deck). */
export const BLACKS = ['#060508', '#0C0A0E', '#141118', '#1C1820', '#26212A', '#332C38'];
/** Truss aluminium and the rig's steel (a cool bright gray). */
export const TRUSS = ['#1E2228', '#343A44', '#525A66', '#76808E', '#A2ACBA', '#D4DCE6'];
/** Road-case black (the FX DEPT cases, the effects' boxes). */
export const CASE = ['#08080A', '#121216', '#1C1C22', '#28282F', '#36363E', '#4A4A54'];
/** Gold trim (the lobby's moldings, the rails' brass). */
export const GOLD = BRASS;
/** The screen's silver (lit by what's on it). */
export const SILVER = ['#3A3E46', '#5A606A', '#7E8590', '#A4AAB4', '#C8CDD4', '#ECEFF2'];
/** Poured concrete (the building's shell, the far wall's cut end). */
export const SHELL = ['#1E1C1E', '#2E2B2E', '#423E40', '#585354', '#726C6C', '#908A88'];
/** Soot, char, scorch (the wreck). */
export const CHAR = ['#0A0807', '#141110', '#1E1A18', '#2A2522', '#38312C', '#4A413A'];
/** Frost and ice (the AC once it's real). */
export const ICE = ['#3A5A78', '#5A84A6', '#84AECC', '#AED0E6', '#D4EAF6', '#F4FBFF'];
/** Fire: ember to white-hot. */
export const FIRE = ['#5A0A04', '#9A1A06', '#D2380A', '#F06A12', '#FCA526', '#FDE68A', '#FFF8DC'];
/** Water (the flood out of the screen). */
export const WATER = ['#0A1A3A', '#12305E', '#1C4A88', '#2E6AB2', '#5A96D4', '#A6CEF2'];
export { STEEL, LIP };

// ---------------------------------------------------------------------------------------------------------------
// Pieces

/** The lit lip along the top of anything he stands on (inked over, shaded under: standable reads standable). */
export const lip = (g: Ctx, x: number, y: number, w: number) => {
  box(g, x - 1, y - 1, w + 2, 1, INK);
  box(g, x, y, w, 3, LIP[2]); box(g, x, y, w, 1, LIP[3]); box(g, x, y + 3, w, 1, LIP[0]);
};
/** A dim rail (scenery, never a ledge): a thin bar, no lip. */
export const dimRail = (g: Ctx, x0: number, x1: number, y: number, col: string) => { box(g, x0, y - 1, x1 - x0, 3, INK); box(g, x0, y, x1 - x0, 1, col); };

/** A horizontal tube (a pipe, a truss chord): inked, lit along its top, shaded under. */
export const tubeH = (g: Ctx, x0: number, x1: number, y: number, w: number, R: string[]) => {
  box(g, x0, y - 1, x1 - x0, w + 2, INK);
  box(g, x0, y, x1 - x0, w, R[3]);
  box(g, x0, y, x1 - x0, 1, R[5]);
  if (w > 2) box(g, x0, y + w - 1, x1 - x0, 1, R[1]);
};
/** An upright tube. */
export const tubeV = (g: Ctx, x: number, top: number, foot: number, w: number, R: string[]) => {
  box(g, x - 1, top, w + 2, foot - top, INK);
  box(g, x, top, w, foot - top, R[3]);
  box(g, x, top, 1, foot - top, R[5]);
  if (w > 2) box(g, x + w - 1, top, 1, foot - top, R[1]);
};
/** Box truss seen side on (x0..x1, its top chord at y, `h` deep): the chords, the zigzag lacing, a strut at each node. */
export const truss = (g: Ctx, x0: number, x1: number, y: number, h: number, R: string[], step = 14) => {
  for (const [w, col] of [[3, INK], [1, R[2]]] as const) {
    g.strokeStyle = col; g.lineWidth = w; g.beginPath();
    for (let x = x0, k = 0; x < x1 - 1; x += step, k++) { g.moveTo(x, y + (k % 2 ? h : 0)); g.lineTo(Math.min(x1, x + step), y + (k % 2 ? 0 : h)); }
    g.stroke();
  }
  tubeH(g, x0, x1, y - 1, 3, R);
  tubeH(g, x0, x1, y + h - 2, 3, R);
  for (let x = x0; x <= x1; x += step * 2) { box(g, x - 1, y, 2, h, R[1]); box(g, x - 1, y, 1, h, R[4]); }
};
/** Chain (a hung thing's), from (x, y0) down to y1: links alternately lit and dark. */
export const chain = (g: Ctx, x: number, y0: number, y1: number, R = TRUSS) => {
  box(g, x - 1, y0, 3, y1 - y0, INK);
  for (let y = y0; y < y1; y += 6) box(g, x, y + 1, 1, 4, (Math.floor(y / 6) % 2) ? R[3] : R[5]);
};

/** A board hung on two chains (its middle at x, its top at y) from the ceiling (ceilY): beveled, framed, the words on
 *  it. Returns its height. */
export const hungBoard = (g: Ctx, x: number, y: number, ceilY: number, lines: string[], L: Look, bg: string, frame = GOLD) => {
  const lh = signH(L) + Math.max(2, (L.sy ?? 1) * 2);
  const w = Math.max(...lines.map(l => signW(l, L))) + 16, h = lh * lines.length + 8;
  for (const s of [-1, 1]) chain(g, Math.round(x + s * (w / 2 - 10)), ceilY, y + 2);
  board(g, x, y + h / 2, lines, L, bg, frame, 6);
  return h;
};
/** A sign on a floor stand (a stanchion-topped post, its round foot), feet at (x, y); its top board's lines. */
export const standBoard = (g: Ctx, x: number, y: number, lines: string[], L: Look, bg: string, postH = 64) => {
  const G = GOLD;
  box(g, x - 13, y - 5, 26, 5, INK); box(g, x - 12, y - 4, 24, 4, G[2]); box(g, x - 12, y - 4, 24, 1, G[4]);
  tubeV(g, x - 2, y - postH, y - 4, 4, G);
  const lh = signH(L) + Math.max(2, (L.sy ?? 1) * 2), h = lh * lines.length + 8;
  board(g, x, y - postH - h / 2 + 2, lines, L, bg, G, 6);
};
/** A one-sheet in a lit frame on the wall (its middle at x, its top at y; w x h): the poster's art painted by `art`
 *  inside the frame's clip, the glass's glint. */
export const oneSheet = (g: Ctx, x: number, y: number, w: number, h: number, art: (g: Ctx, l: number, t: number, w: number, h: number) => void) => {
  const l = Math.round(x - w / 2), G = GOLD;
  box(g, l - 6, y - 6, w + 12, h + 12, INK);
  box(g, l - 5, y - 5, w + 10, h + 10, G[3]); box(g, l - 5, y - 5, w + 10, 1, G[5]); box(g, l - 5, y - 5, 1, h + 10, G[4]);
  box(g, l - 5, y + h + 4, w + 10, 1, G[1]); box(g, l + w + 4, y - 5, 1, h + 10, G[2]);
  box(g, l - 2, y - 2, w + 4, h + 4, G[1]);
  g.save(); g.beginPath(); g.rect(l, y, w, h); g.clip(); art(g, l, y, w, h); g.restore();
  // (the glass: a glint across its top corner)
  poly(g, [[l + 4, y], [l + 14, y], [l, y + 14], [l, y + 4]], 'rgba(255,255,255,0.18)');
  // (the case's lamp over it, a little hood)
  box(g, l + w / 2 - 12, y - 12, 24, 5, INK); box(g, l + w / 2 - 11, y - 11, 22, 3, G[2]); box(g, l + w / 2 - 11, y - 11, 22, 1, G[4]);
};
/** The PA's horn on its bracket (the park's: gray, a trumpet), hung at (x, y) off the ceiling. */
export const horn = (g: Ctx, x: number, y: number) => {
  const S = STEEL;
  box(g, x - 1, y, 3, 8, INK); box(g, x, y, 1, 8, S[4]);
  box(g, x - 7, y + 8, 14, 7, INK); box(g, x - 6, y + 9, 12, 5, S[3]); box(g, x - 6, y + 9, 12, 1, S[5]);
  poly(g, [[x - 10, y + 15], [x + 10, y + 15], [x + 17, y + 33], [x - 17, y + 33]], INK);
  poly(g, [[x - 9, y + 16], [x + 9, y + 16], [x + 15, y + 32], [x - 15, y + 32]], S[3]);
  poly(g, [[x - 9, y + 16], [x - 3, y + 16], [x - 6, y + 32], [x - 15, y + 32]], S[5]);
  poly(g, [[x + 4, y + 16], [x + 9, y + 16], [x + 15, y + 32], [x + 8, y + 32]], S[1]);
  box(g, x - 15, y + 31, 30, 2, S[0]);
};

// ---------------------------------------------------------------------------------------------------------------
// The branding (the outside's, on the marquee: DISASTER: in orange bulbs, THE RIDE in gold, inked rust)

export const disasterLook = (s: number, on: boolean): Look => bulbs(s, s, '#F97316', on);
export const rideLook = (s: number): Look => gate({ sx: s, sy: s }, '#FDE047', '#7C2D12');
/** Painted show-letters (a sign-writer's, top-lit, a drop shadow), the ride's own. */
export const showLook = (sx: number, sy: number, col: string, shadow = '#1C0A06'): Look => ({ sx, sy, fill: [mix(col, '#FFFFFF', 0.35), mix(col, '#FFFFFF', 0.15), col, col, mix(col, '#000000', 0.25)], dither: true, shadow, drop: 1, gap: 1 });
/** Stenciled on a case or a crate. */
export const stencil = (col: string): Look => ({ sx: 1, sy: 1, fill: col, stencil: true, gap: 1 });

/** Painted once and put down after (a stamp, keyed): `paint` in local coordinates about (x, y), box bx, by, bw, bh. */
export const still = (c: Ctx, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `hwd-${key}`, bx, by, bw, bh, paint);
  c.restore();
};
/** At depth d (scaled toward the eye), something drawn as if at the play plane. */
export const deep = (c: Ctx, v: View, d: number, draw: () => void) => { if (d === 1) draw(); else atDepth(c, v.eye, d, draw); };
/** Art put down turned (a sign hung askew, a set knocked crooked) can't be stamped (stamps only go down flat), so it's
 *  painted live every frame; between pixels (the camera creeping) its dithering and edges came out different every
 *  frame: it crawled. Pinned: about (x, y), that point on a whole device pixel, turned by `ang`; then `draw` as if
 *  unturned (in the same coordinates as before: x, y included). Lands on the same pixels frame to frame. (The thing
 *  turned keeps whole-pixel steps against the art round it, half a pixel at most: steadier than the crawl.) */
export const turned = (c: Ctx, x: number, y: number, ang: number, draw: () => void) => {
  // (not turned: just drawn (stamped, between pixels with everything round it))
  if (!ang) { draw(); return; }
  c.save(); c.translate(x, y);
  const m = c.getTransform(); c.setTransform(m.a, m.b, m.c, m.d, Math.round(m.e), Math.round(m.f));
  c.rotate(ang); c.translate(-x, -y); draw(); c.restore();
};
/** Width on screen of an upright face across x = e going back from the play plane to depth d1: under a pixel or so it's
 *  a sliver that flickers as the camera creeps (not drawn). */
export const faceWide = (v: View, e: number, d1: number) => Math.abs(v.eye.x - e) * (1 - d1);

void checker; void signText; void plain; void ramp6; void GY;
