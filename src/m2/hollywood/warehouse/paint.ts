// The secret warehouse's painting kit (the final pass: peak SNES, on the boulevard's kit so the land's of a piece): the
// soundstage's materials in stepped ramps (the corrugated siding, the black-painted stage deck, the chroma green of the
// cycs, galvanized pipe and truss, the plywood and 2x4s of the flats, gaffer tape), worked out once per hour (pal());
// the view: the boulevard's one eye (spooky/town's, off the camera), and the depths the warehouse is built at, picked so
// that at the camera's rest everything lands where the play's laid out (the back of the floor at BACK_Y); and the
// pieces a film set is built from (C-stands and their sandbags, pipe battens and box truss, apple boxes, flight cases),
// and the picture's branding (REVENGERS: RESEMBLE, END-OF-THE-WORLD'S-DAY).

import type { GameState } from '../../../m1/game/core/state';
import {
  type Ctx, type View, type Look, INK, box, checker, mix, hash, poly, at, atDepth, still, viewIn, timeOfDay, skyAt, hourMix,
  farTint, STEEL, BRASS, VELVET, PLY, SAND, CONCRETE, LIP, STEVE, ramp6, dimmed, signText, signW, board, plain,
} from '../blvd/kit';
import { rampDown, tone } from '../../signLetters';
import { GY, BACK } from './layout';

export type { Ctx, View, Look };
export { INK };

// ---------------------------------------------------------------------------------------------------------------
// The view and the depths

/** How high over the floor line the eye is at the camera's rest (viewOf: the camera's y + 252; its rest GY - 550). */
export const REST = 298;
/** The depth that lands `h` px up the screen from the floor line at the camera's rest. */
export const dUp = (h: number) => 1 - h / REST;
/** The back wall's line (the back of the stage floor: BACK_Y at rest). */
export const WALL_D = dUp(BACK);
/** The cycs and the flats (just in front of the wall), and the gear stood in front of them (cameras, signs, chairs). */
export const CYC_D = dUp(BACK - 4), PROP_D = dUp(BACK - 12), GEAR_D = dUp(BACK - 20);
/** The script's showpiece on the main stage (its case, its plinth, its marquee), and where the script's flung out of it
 *  from (ending.ts). */
export const CASE_D = dUp(44);
/** Depth as distance back (the eye's off the play plane by Z0): for things laid flat going back (the fallen wall). */
const Z0 = 1100;
export const zOf = (d: number) => Z0 * (1 / d - 1);
export const dOfZ = (z: number) => Z0 / (Z0 + z);

export const wview = (state: GameState): View => viewIn(state);
/** The floor's screen y at depth d. */
export const floorY = (v: View, d: number) => v.eye.y + (GY - v.eye.y) * d;
/** On screen: something at world x a..b at depth d (by where it lands: no pop-in). */
export const seenAt = (v: View, a: number, b: number, d = 1, pad = 80) => {
  const [sa] = at(v.eye, a, 0, d), [sb] = at(v.eye, b, 0, d);
  return sb > v.cam.x - pad && sa < v.cam.x + 800 + pad;
};
/** A quad of floor (y = GY) from x a..b, depth d0 back to d1. */
export const floorQ = (c: Ctx, eye: View['eye'], a: number, b: number, d0: number, d1: number, col: string) =>
  poly(c, [at(eye, a, GY, d0), at(eye, b, GY, d0), at(eye, b, GY, d1), at(eye, a, GY, d1)], col);

// ---------------------------------------------------------------------------------------------------------------
// Materials (darkest first)

/** Corrugated steel siding (the warehouse's walls), a cool warm-gray. */
export const SIDING = ['#141216', '#201D23', '#2D2930', '#3B363F', '#4D4752', '#635C68', '#837B88'];
/** The stage deck: black-painted plywood, scuffed. */
export const DECK = ['#0C0B0E', '#151318', '#1E1B22', '#28252D', '#34303A', '#45404C'];
/** Chroma green (the cycs, the flats, the pits' dressing), lit by the studio lights. */
export const CHROMA = ['#062A10', '#0B4419', '#126224', '#188030', '#22A040', '#4CC466', '#92E6A4'];
/** Painted steel (the frame's columns and girders): the warehouse's red oxide primer. */
export const OXIDE = ['#200A08', '#3A1410', '#561E16', '#73291C', '#913A28', '#B05A40'];
/** Black flight-case and gear (cameras, monitors, the dolly). */
export const GEAR = ['#08080A', '#121216', '#1C1C22', '#28282F', '#36363E', '#4A4A54', '#6A6A76'];
/** Stage blacks (duvetyne, black masking). */
export const BLACKS = ['#060508', '#0C0A0E', '#141118', '#1C1820', '#26212A'];
/** Gaffer tape and spike marks. */
export const TAPE = { pink: '#F472B6', white: '#F1EFE8', glow: '#C8F07A', yellow: '#FACC15', blue: '#60A5FA', red: '#EF4444' };
/** Foam rubble (New New York's: gray, painted). */
export const FOAM = ['#2A2628', '#423C3E', '#5E5658', '#7C7476', '#9C9496', '#BEB6B6'];

export interface WPal {
  key: string;
  siding: string[]; deck: string[]; chroma: string[]; oxide: string[]; gear: string[]; blacks: string[]; steel: string[];
  ply: string[]; sand: string[]; brass: string[]; velvet: string[]; concrete: string[]; lip: string[]; foam: string[];
  /** The scenery's (set back: dimmed a step, so none of it reads as somewhere to stand). */
  plyD: string[]; steelD: string[];
  haze: string;
}
let palCache: WPal | null = null;
/** Indoors (the walls down: a half share of the hour's light): a color for the hour, barely. */
export const inside = (c: string) => farTint(hourMix(c, mix(c, '#5A3448', 0.08), mix(c, '#0E1024', 0.2)), 0.04);
export const pal = (): WPal => {
  const tod = timeOfDay();
  if (palCache && palCache.key === tod.key) return palCache;
  const I = (r: string[]) => r.map(inside);
  palCache = {
    key: tod.key,
    siding: I(SIDING), deck: I(DECK), chroma: I(CHROMA), oxide: I(OXIDE), gear: I(GEAR), blacks: I(BLACKS), steel: I(STEEL),
    ply: I(PLY), sand: I(SAND), brass: I(BRASS), velvet: I(VELVET), concrete: I(CONCRETE), lip: I(LIP), foam: I(FOAM),
    plyD: PLY.map(dimmed), steelD: STEEL.map(dimmed),
    haze: skyAt(0.9, tod),
  };
  return palCache;
};
/** A color going back into the dark of the soundstage (d: its depth; nearer the back wall, dimmer). */
export const back = (col: string, d: number) => mix(inside(col), '#0A090C', Math.max(0, Math.min(0.5, (1 - d) * 0.9)));
export const rampB = (col: string, d: number) => ramp6(col).map(c => back(c, d));

// ---------------------------------------------------------------------------------------------------------------
// Pieces

/** A horizontal steel pipe (a batten, a rail), inked, lit along its top. */
export const pipe = (g: Ctx, x0: number, x1: number, y: number, w: number, R: string[]) => {
  box(g, x0, y - 1, x1 - x0, w + 2, INK);
  box(g, x0, y, x1 - x0, w, R[3]);
  box(g, x0, y, x1 - x0, 1, R[5]);
  if (w > 2) box(g, x0, y + w - 1, x1 - x0, 1, R[1]);
};
/** An upright steel pipe (a scaffold's standard, a stand's riser). */
export const riser = (g: Ctx, x: number, top: number, foot: number, w: number, R: string[]) => {
  box(g, x - 1, top, w + 2, foot - top, INK);
  box(g, x, top, w, foot - top, R[3]);
  box(g, x, top, 1, foot - top, R[5]);
  if (w > 2) box(g, x + w - 1, top, 1, foot - top, R[1]);
};
/**
 * Box truss (the lighting grid's, the banners'): two chords, the zigzag between them, a strut at every node, lit along
 * the top chord. x0..x1, its top at y, `h` deep.
 */
export const truss = (g: Ctx, x0: number, x1: number, y: number, h: number, R: string[], step = 16) => {
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath();
  for (let x = x0, k = 0; x < x1 - 1; x += step, k++) { g.moveTo(x, y + (k % 2 ? h : 0)); g.lineTo(Math.min(x1, x + step), y + (k % 2 ? 0 : h)); }
  g.stroke();
  g.strokeStyle = R[2]; g.lineWidth = 1.4; g.beginPath();
  for (let x = x0, k = 0; x < x1 - 1; x += step, k++) { g.moveTo(x, y + (k % 2 ? h : 0)); g.lineTo(Math.min(x1, x + step), y + (k % 2 ? 0 : h)); }
  g.stroke();
  pipe(g, x0, x1, y - 1, 3, R);
  pipe(g, x0, x1, y + h - 1, 3, R);
  for (let x = x0; x <= x1; x += step * 2) box(g, x - 1, y, 2, h, R[1]);
};
/** A sandbag (burlap, its seam, a handle), its middle-bottom at (x, y). */
export const sandbag = (g: Ctx, x: number, y: number, w = 18, S = pal().sand) => {
  box(g, x - w / 2 - 1, y - 9, w + 2, 9, INK);
  box(g, x - w / 2, y - 8, w, 8, S[3]); box(g, x - w / 2, y - 8, w, 2, S[4]); box(g, x - w / 2, y - 8, 2, 8, S[5]);
  box(g, x - w / 2, y - 2, w, 2, S[1]); box(g, x - 1, y - 8, 2, 8, S[2]); box(g, x - 3, y - 10, 6, 2, S[1]);
};
/** A C-stand (chrome: a turtle base of three legs, the riser, the knuckle, the arm, a sandbag on its leg), its foot at
 *  (x, y), `h` tall; returns the top of its riser. */
export const cStand = (g: Ctx, x: number, y: number, h: number, R = pal().steel) => {
  for (const [dx, dy] of [[-18, 0], [16, 0], [4, -3]] as const) { g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x, y - 16); g.lineTo(x + dx, y + dy); g.stroke(); g.strokeStyle = R[4]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y - 16); g.lineTo(x + dx, y + dy); g.stroke(); }
  riser(g, x - 2, y - h, y - 14, 4, R);
  box(g, x - 3, y - h * 0.55, 6, 4, INK); box(g, x - 2, y - h * 0.55 + 1, 4, 2, R[4]);
  sandbag(g, x - 10, y, 16);
  return y - h;
};
/** An apple box (plywood, its hand hole, stenciled), its foot at (x, y). */
export const appleBox = (g: Ctx, x: number, y: number, w = 30, h = 14, P = pal().ply) => {
  box(g, x - 1, y - h - 1, w + 2, h + 1, INK);
  box(g, x, y - h, w, h, P[3]); box(g, x, y - h, w, 1, P[5]); box(g, x, y - h, 2, h, P[4]); box(g, x + w - 2, y - h, 2, h, P[1]);
  box(g, x + w / 2 - 5, y - h + 3, 10, 3, P[0]); box(g, x + 3, y - 4, w - 6, 1, P[2]);
  // (the ply's grain, its nail heads, a scuff off a corner)
  for (let k = 0; k < 3; k++) box(g, x + 3 + ((k * 7 + x) % 5), y - h + 7 + k * 2, Math.max(4, w * 0.3 - k * 2), 1, P[2]);
  for (const nx of [x + 2, x + w - 4]) for (const ny of [y - h + 2, y - 3]) box(g, nx, ny, 1, 1, P[0]);
  box(g, x + w - 6, y - h, 4, 1, P[4]);
};
/** A flight case (black, its aluminium corners and edging, a stencil on its lid), its foot at (x, y). */
export const flightCase = (g: Ctx, x: number, y: number, w: number, h: number, label?: string) => {
  const G = pal().gear, S = pal().steel;
  box(g, x - 1, y - h - 1, w + 2, h + 1, INK);
  box(g, x, y - h, w, h, G[3]); box(g, x, y - h, w, 2, G[5]); box(g, x, y - h, 2, h, G[4]); box(g, x + w - 3, y - h, 3, h, G[1]);
  for (const cx of [x, x + w - 5]) for (const cy of [y - h, y - 5]) { box(g, cx, cy, 5, 5, S[3]); box(g, cx, cy, 2, 2, S[5]); }
  box(g, x, y - h * 0.55, w, 2, S[2]); box(g, x, y - h * 0.55, w, 1, S[4]);
  box(g, x + w / 2 - 4, y - h * 0.55 - 2, 8, 5, S[1]);
  if (label && w > signW(label, plain(1, 1, '#000')) + 8) signText(g, label, x + w / 2, y - h * 0.55 - 5, plain(1, 1, '#E8E4DA'));
  // (the rivets along its edging, the latch's shine, scuffs dragged across it, a strip of tape stuck on)
  for (let rx = x + 8; rx < x + w - 7; rx += 6) { box(g, rx, y - h + 1, 1, 1, S[5]); box(g, rx, y - 3, 1, 1, S[4]); }
  box(g, x + w / 2 - 3, y - h * 0.55 - 1, 2, 1, S[5]);
  for (let k = 0; k < 3; k++) { const sx = x + 6 + ((k * 13 + w) % Math.max(1, w - 14)); box(g, sx, y - h * 0.3 + k, 5, 1, G[4]); }
  if (h > 18) { box(g, x + 4, y - h + 4, 10, 4, '#F4F0E8'); box(g, x + 4, y - h + 7, 10, 1, '#C8C2B4'); }
};
/** A run of gaffer tape (a spike mark: a T, a cross, an L), its middle at (x, y), lying on the floor (sy squashed). */
export const spike = (g: Ctx, x: number, y: number, col: string, kind: 0 | 1 | 2, s = 1) => {
  const w = Math.round(8 * s), t = Math.max(1, Math.round(1.5 * s));
  if (kind === 0) { box(g, x - w / 2, y, w, t, col); box(g, x - t / 2, y, t, Math.max(1, Math.round(3 * s)), col); }
  else if (kind === 1) { box(g, x - w / 2, y, w, t, col); box(g, x - t / 2, y - Math.round(2 * s), t, Math.max(1, Math.round(4 * s)), col); }
  else { box(g, x - w / 2, y, w, t, col); box(g, x - w / 2, y - Math.round(2 * s), t, Math.max(1, Math.round(3 * s)), col); }
};

// ---------------------------------------------------------------------------------------------------------------
// The branding (the picture's): REVENGERS in big gold block capitals inked in a deep red, the subtitle under it

/** REVENGERS' own lettering: bold gold block capitals in a ramp, inked oxblood, a drop shadow. */
export const revLook = (sx: number, sy: number, col = '#F2C24A'): Look => ({ sx, sy, bold: true, fill: rampDown(col, 0.42), dither: true, ink: '#3A0408', shadow: '#12020A', drop: Math.max(1, sx), gap: 1 });
/** Its subtitle's: condensed silver capitals, a lean. */
export const subLook = (sx: number, sy: number): Look => ({ sx, sy, fill: ['#FFFFFF', '#E2E6EE', '#B8C0CC', '#B8C0CC', '#6A7280'], dither: true, ink: '#12020A', slant: 0.3, gap: 1 });
/** The logo: REVENGERS over a red bar with the subtitle in it; the big R's star. Its middle at (x, y) (the bar's middle);
 *  `s` its size. */
export const revLogo = (g: Ctx, x: number, y: number, s: 1 | 2 | 3, sub: string) => {
  const big = revLook(s + 1, s + 2), L2 = subLook(Math.max(1, s - 1), s);
  const w = signW('REVENGERS', big), sw = signW(sub, L2);
  const bw = Math.max(w, sw) + 14 * s, bh = 7 * s + 6;
  // (the bar: deep red, stepped, a gold rule along it)
  const R = ramp6('#8A0E1E');
  box(g, x - bw / 2 - 1, y - bh / 2 - 1, bw + 2, bh + 2, INK);
  box(g, x - bw / 2, y - bh / 2, bw, bh, R[3]); box(g, x - bw / 2, y - bh / 2, bw, 2, R[4]); box(g, x - bw / 2, y + bh / 2 - 2, bw, 2, R[1]);
  poly(g, [[x - bw / 2 - 6 * s, y - bh / 2], [x - bw / 2, y - bh / 2], [x - bw / 2, y + bh / 2], [x - bw / 2 - 6 * s, y + bh / 2], [x - bw / 2 - 2 * s, y]], R[2]);
  poly(g, [[x + bw / 2 + 6 * s, y - bh / 2], [x + bw / 2, y - bh / 2], [x + bw / 2, y + bh / 2], [x + bw / 2 + 6 * s, y + bh / 2], [x + bw / 2 + 2 * s, y]], R[2]);
  box(g, x - bw / 2, y - bh / 2 + 1, bw, 1, '#E8B83A');
  signText(g, sub, x, y + Math.round(3.5 * s), L2);
  signText(g, 'REVENGERS', x, y - bh / 2 - 3, big);
};

/** A board on a C-stand (a set sign: QUIET ON SET), its foot at (x, y): the board's lines in its look. */
export const standSign = (g: Ctx, x: number, y: number, lines: string[], L: Look, bg: string, h = 120) => {
  const top = cStand(g, x, y, h);
  // (the arm out to the board, the knuckle)
  box(g, x - 3, top - 2, 6, 6, INK); box(g, x - 2, top - 1, 4, 4, pal().steel[4]);
  board(g, x, top - 22, lines, L, bg, pal().steel, 6);
};

void checker; void hash; void atDepth; void still; void STEVE; void tone; void dimmed;
