// The secret warehouse's far off (screen space; the backdrop), seen once the walls are down, between the frame's columns
// and over the fallen back wall: the boulevard's own far off (blvd/far.ts: the smoggy sky by the hour, the mountains,
// the HAPPYWOOD hill on its foothills, the city in the haze, the studio lot's soundstages and water tower, the palms
// along the next street over), each on its own ground at the depth its slide says it's at (one eye: its ground lands
// where the eye's perspective puts it), and nearest, the production's base camp parked out on the lot behind the
// warehouse (the honeywagons, the grip and electric trucks, the generator, the wardrobe trailer, a crane truck, the
// cast's trailers, the catering tent; light towers over it), on its asphalt, which goes on down to the fallen wall.
// Each layer's painted once for the hour into a tile and slid along; as he climbs, each drops by how near it is.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay, skyAt, hourMix, type TimeOfDay } from '../../timeOfDay';
import { mist } from '../../adventure/farArt';
import { type Ctx, INK, box, checker, mix, hash, poly, hazeBands, bandedGradient, signText, plain, STEVE } from '../blvd/kit';
import { FAR, tile, farCol, rampF, paintMountains, paintFoothills, drawHill, paintCity, paintLot, paintPalms } from '../blvd/far';
import { HWX } from '../geometry';
import { GY } from './layout';
import { REST } from './paint';
import { drawHwSky, drawHwHorizon, drawHwLandmarks } from '../landmarks';
import { drawBust } from '../../grossBust';
import { steveBust } from '../steveBust';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
/** The camera's rest (y). */
const CAM_REST = GY - 550;
/** The eye's line on screen (the horizon). */
const EYE = 252;
/** Where a layer's ground lands at depth k (the eye's perspective), at rest. */
const groundAt = (k: number) => EYE + REST * k;

// ---------------------------------------------------------------------------------------------------------------
// Base camp: the production's trucks and trailers parked out on the lot

const BW = 1400, BH = 150, BG = 10;
type T = (c: string) => string;
/** A wheel: its tire inked, the sidewall, the hub lit up its upper left, the lugs; `r` its radius, middle at (x, y). */
const wheel = (g: Ctx, T: T, x: number, y: number, r: number) => {
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#26262C'); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  const hr = Math.max(1.5, r * 0.5);
  g.fillStyle = T('#8A8E96'); g.beginPath(); g.arc(x, y, hr, 0, Math.PI * 2); g.fill();
  box(g, x - hr + 1, y - hr + 1, Math.max(1, hr * 0.6), Math.max(1, hr * 0.6), T('#D2D6DC'));
  box(g, x - 1, y - 1, 2, 2, T('#4A4E56'));
};
/** A fender arched over a wheel, in the body's ramp. */
const fender = (g: Ctx, x: number, y: number, r: number, R: string[]) => { box(g, x - r - 3, y - r - 3, r * 2 + 6, 2, INK); box(g, x - r - 2, y - r - 2, r * 2 + 4, 1, R[1]); };
/** Corrugated siding from x0 to x1, top..foot: ribs in pairs (a lit one, a shaded one), dithered off up top. */
const ribs = (g: Ctx, x0: number, x1: number, top: number, foot: number, R: string[], step = 5) => {
  for (let k = x0 + 3; k < x1 - 3; k += step) { box(g, k, top, 1, foot - top, R[3]); box(g, k + 1, top, 1, foot - top, R[1]); }
  checker(g, x0, top, x1 - x0, 2, R[4], 0, 1);
};
/** A window: its rubber gasket inked, the glass (the sky in it by day, banded; lit warm after dark), a curtain half
 *  drawn, a glint. */
const pane = (g: Ctx, T: T, x: number, y: number, w: number, h: number, i: number) => {
  const on = timeOfDay().lamps > 0.3 && hash(i * 7.1) > 0.35;
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  if (on) { box(g, x, y, w, h, '#F2B060'); box(g, x, y, w, Math.ceil(h / 2), '#FFD88A'); }
  else { box(g, x, y, w, h, T('#3A4258')); box(g, x, y, w, Math.ceil(h / 3), T('#7A8AA0')); box(g, x, y + Math.ceil(h / 3), w, 1, T('#5A6A84')); }
  box(g, x, y, Math.max(2, Math.round(w * 0.35)), h, on ? '#C8783A' : T('#C8B8A0'));
  for (let k = 0; k < h; k += 2) box(g, x + Math.round(w * 0.35) - 1, y + k, 1, 1, on ? '#8A4A1A' : T('#9A8A72'));
  if (!on) box(g, x + w - 3, y + 1, 1, 2, T('#E8F0F8'));
};
/** A run of cable off a trailer to the ground, sagging (rubber black, a lit edge). */
const sag = (g: Ctx, T: T, x0: number, y0: number, x1: number, y1: number) => {
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + 4, x1, y1); g.stroke();
  g.strokeStyle = T('#4A4A54'); g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0 - 1); g.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + 3, x1, y1 - 1); g.stroke();
};
/** One of the trailers (a star's, the honeywagon, wardrobe): its body corrugated, its corners rounded, a stripe along
 *  it, the roof's AC (a grille) and a vent, the door (a star on a cast's), windows (a curtain half drawn; lit after
 *  dark), the name on a placard, the steps and their rail, the A-frame hitch on its jack with the propane bottles, the
 *  axles under their fenders, the skirting's shadow, its power cable down to the lot. */
const trailer = (g: Ctx, T: T, x: number, f: number, w: number, h: number, body: string, label: string | null, star: boolean, i: number) => {
  const R = rampF(T, body), S = rampF(T, '#8A8E96'), St = rampF(T, ['#3A6AB8', '#B4243A', '#2A8A4A'][i % 3]), top = f - h - 8, foot = f - 8;
  // (the hitch: the A-frame, its jack stand down on a block, the propane bottles on it)
  poly(g, [[x, foot - 8], [x - 16, foot - 4], [x - 16, foot - 2], [x, foot - 4]], INK); box(g, x - 15, foot - 5, 15, 1, S[2]);
  box(g, x - 13, foot - 4, 2, 10, INK); box(g, x - 12, foot - 3, 1, 8, S[3]); box(g, x - 15, f - 2, 6, 2, T('#6A5A44'));
  for (const px of [x - 9, x - 4]) { box(g, px - 1, foot - 19, 5, 13, INK); box(g, px, foot - 18, 3, 11, T('#ECEAE4')); box(g, px, foot - 18, 1, 11, T('#FFFFFF')); box(g, px + 1, foot - 21, 1, 3, S[1]); }
  // (the body, its corners rounded off)
  box(g, x - 1, top - 1, w + 2, h + 2, INK);
  box(g, x, top, w, h, R[2]);
  ribs(g, x, x + w, top + 3, foot - 2, R);
  box(g, x, top, w, 2, R[4]); box(g, x, top + 2, w, 1, R[3]); box(g, x, top, 2, h, R[3]); box(g, x + w - 3, top, 3, h, R[1]);
  g.clearRect(x - 1, top - 1, 2, 1); g.clearRect(x + w - 1, top - 1, 2, 1); g.clearRect(x - 1, top, 1, 1); g.clearRect(x + w, top, 1, 1); box(g, x, top, 1, 1, INK); box(g, x + w - 1, top, 1, 1, INK);
  // (its stripe, the skirting dark under it, grime up from the road)
  const sy = top + Math.round(h * 0.62);
  box(g, x, sy, w, 3, St[2]); box(g, x, sy, w, 1, St[3]); box(g, x, sy + 3, w, 1, St[0]);
  box(g, x, foot - 4, w, 4, R[0]); checker(g, x, foot - 7, w, 3, R[1], 0, 1);
  // (the roof: the AC and its grille, a vent)
  const ax = Math.round(x + w * 0.3);
  box(g, ax - 1, top - 7, 20, 7, INK); box(g, ax, top - 6, 18, 6, T('#C8C8D0')); box(g, ax, top - 6, 18, 1, T('#ECECF0')); for (let k = 2; k < 17; k += 2) box(g, ax + k, top - 4, 1, 3, T('#8A8A94'));
  box(g, x + w - 26, top - 3, 8, 3, INK); box(g, x + w - 25, top - 2, 6, 2, S[3]);
  // (the door: its frame, its little window, the star on a cast's, the handle; the steps up to it, their rail)
  const dx = x + 10 + (i % 3) * 6, dt = top + 6, dh = foot - dt - 2;
  box(g, dx - 2, dt - 1, 16, dh + 2, INK); box(g, dx - 1, dt, 14, dh, R[3]); box(g, dx, dt + 1, 12, dh - 1, R[1]); box(g, dx, dt + 1, 1, dh - 1, R[2]);
  box(g, dx + 2, dt + 3, 8, 6, T('#3A4258')); box(g, dx + 2, dt + 3, 8, 2, T('#7A8AA0'));
  box(g, dx + 9, dt + Math.round(dh * 0.5), 2, 2, T('#E8C25A'));
  if (star) {
    const sx = dx + 6, sty = dt + 16, pts = (o: number, i2: number) => { g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? i2 : o; g.lineTo(sx + Math.cos(a) * rr, sty + Math.sin(a) * rr); } g.closePath(); g.fill(); };
    g.fillStyle = INK; pts(5.5, 2.4); g.fillStyle = T('#E8C25A'); pts(4.2, 1.6); box(g, sx - 1, sty - 2, 1, 1, T('#FFF6C8'));
  }
  for (let k = 0; k < 3; k++) { box(g, dx - 2 - k, foot - 1 + k * 3, 16 + k * 2, 2, INK); box(g, dx - 1 - k, foot - 1 + k * 3, 14 + k * 2, 1, S[3]); }
  box(g, dx + 15, foot - 8, 1, 16, S[1]); box(g, dx + 15, foot - 8, 4, 1, S[1]);
  // (windows along it; the name on its placard)
  for (let k = 0; k < Math.floor((w - 40) / 22); k++) pane(g, T, dx + 22 + k * 22, top + 8, 11, 8, i * 7 + k);
  if (label) {
    const lw = label.length * 6 + 8, lx = Math.round(x + w * 0.62 - lw / 2), ly = top + 20;
    box(g, lx - 1, ly - 1, lw + 2, 11, INK); box(g, lx, ly, lw, 9, T('#F4F0E4')); box(g, lx, ly, lw, 1, T('#FFFFFF')); box(g, lx, ly + 8, lw, 1, T('#B8B0A0'));
    signText(g, label, x + w * 0.62, ly + 8, plain(1, 1, T('#2A2228')));
  }
  // (the axles under their fenders; its cable down to the lot)
  for (const wx of [x + w * 0.62 + 5, x + w * 0.62 + 19]) { fender(g, wx, f - 4, 4, R); wheel(g, T, wx, f - 4, 4); }
  sag(g, T, x + w - 6, foot - 6, x + w + 18, f);
};
/** One of the trucks (GRIP, ELECTRIC): the box on its frame (panels between riveted posts, the crew's name painted on and
 *  the studio's under it, a stripe, the ladder rack, the side door, the lift gate down at the back with an apple box and
 *  a cable spool on it), the cab (the windshield raked, the sky in its glass, the door's seam, the mirror, the grille and
 *  bumper in chrome, the headlight, the fuel tank, the stack), the wheels in their wells, a mud flap. */
const truck = (g: Ctx, T: T, x: number, f: number, w: number, box2: string, cab: string, label: string, i: number) => {
  const R = rampF(T, box2), C = rampF(T, cab), S = rampF(T, '#8A8E96'), h = 46, top = f - h - 8, foot = f - 10;
  // (the frame under it all)
  box(g, x - 26, foot - 1, w + 28, 4, INK); box(g, x - 25, foot, w + 26, 2, T('#2A2A30'));
  // (the box: panels between posts, rivets down the posts, lit up top and down its left)
  box(g, x - 1, top - 1, w + 2, h + 2, INK);
  box(g, x, top, w, h, R[2]); box(g, x, top, w, 2, R[4]); box(g, x, top + 2, w, 1, R[3]); box(g, x, top, 2, h, R[3]); box(g, x + w - 3, top, 3, h, R[1]);
  for (let k = x + 20; k < x + w - 6; k += 24) { box(g, k, top + 2, 1, h - 3, R[1]); box(g, k + 1, top + 2, 1, h - 3, R[3]); for (let y = top + 5; y < top + h - 2; y += 6) box(g, k - 1, y, 1, 1, R[0]); }
  box(g, x, top + h - 7, w, 3, C[2]); box(g, x, top + h - 7, w, 1, C[3]);
  box(g, x, top + h - 3, w, 3, R[1]); checker(g, x, top + h - 4, w, 1, R[1], 1, 1);
  // (its side door)
  box(g, x + w - 30, top + 6, 18, h - 13, R[1]); box(g, x + w - 29, top + 7, 16, h - 15, R[2]); box(g, x + w - 29, top + 7, 16, 1, R[3]); box(g, x + w - 16, top + h / 2, 2, 3, S[4]);
  // (the name painted on, the studio's under it)
  signText(g, label, x + (w - 30) / 2, top + 16, { sx: 1, sy: 1, fill: [C[3], C[2], C[2], C[1]], dither: true, shadow: R[0], drop: 1 });
  signText(g, 'HAPPYWOOD', x + (w - 30) / 2, top + 27, plain(1, 1, R[0]));
  // (the ladder rack)
  for (let k = x + 10; k < x + w - 4; k += 28) box(g, k, top - 5, 2, 5, INK);
  box(g, x + 4, top - 7, w - 8, 2, INK); box(g, x + 6, top - 8, w - 24, 1, S[3]); for (let k = x + 8; k < x + w - 20; k += 7) box(g, k, top - 9, 1, 2, S[2]);
  // (the lift gate down at the back, its load: an apple box, a cable spool)
  box(g, x + w - 1, foot - 3, 22, 3, INK); box(g, x + w, foot - 2, 20, 1, S[3]);
  box(g, x + w + 2, foot - 11, 9, 8, INK); box(g, x + w + 3, foot - 10, 7, 6, T('#C99E5C')); box(g, x + w + 3, foot - 10, 7, 1, T('#E6C488')); box(g, x + w + 5, foot - 8, 3, 1, T('#5C3A1A'));
  g.fillStyle = INK; g.beginPath(); g.arc(x + w + 15, foot - 8, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#E8A020'); g.beginPath(); g.arc(x + w + 15, foot - 8, 4, 0, Math.PI * 2); g.fill(); box(g, x + w + 14, foot - 9, 2, 2, INK);
  // (the cab: the windshield raked, its glass, the door's seam and handle, the mirror, the grille, bumper, headlight)
  poly(g, [[x + 1, top + 13], [x - 15, top + 13], [x - 25, top + 25], [x - 27, foot + 1], [x + 1, foot + 1]], INK);
  poly(g, [[x, top + 14], [x - 15, top + 14], [x - 24, top + 26], [x - 26, foot], [x, foot]], C[2]);
  poly(g, [[x, top + 14], [x - 15, top + 14], [x - 17, top + 16], [x, top + 16]], C[4]);
  box(g, x - 26, top + 27, 26, 1, C[3]);
  poly(g, [[x - 3, top + 16], [x - 14, top + 16], [x - 21, top + 25], [x - 3, top + 25]], INK);
  poly(g, [[x - 4, top + 17], [x - 14, top + 17], [x - 20, top + 24], [x - 4, top + 24]], T('#5A7088'));
  poly(g, [[x - 4, top + 17], [x - 14, top + 17], [x - 16, top + 19], [x - 4, top + 19]], T('#A8B8C8'));
  box(g, x - 10, top + 18, 1, 5, T('#C8D8E8'));
  box(g, x - 4, top + 27, 1, foot - top - 28, C[0]); box(g, x - 8, top + 30, 3, 1, S[4]);
  box(g, x - 22, top + 18, 2, 6, INK); box(g, x - 23, top + 18, 2, 4, S[3]);
  box(g, x - 29, foot - 10, 4, 10, INK); box(g, x - 28, foot - 9, 2, 8, S[3]); for (let y = foot - 8; y < foot; y += 2) box(g, x - 28, y, 2, 1, S[1]);
  box(g, x - 28, foot - 14, 3, 3, T('#FFF2C0')); box(g, x - 30, foot, 8, 3, INK); box(g, x - 29, foot, 6, 2, S[4]);
  // (the fuel tank, the stack up behind the cab)
  box(g, x - 18, foot - 4, 12, 5, INK); box(g, x - 17, foot - 3, 10, 3, S[3]); box(g, x - 17, foot - 3, 10, 1, S[4]);
  box(g, x - 1, top + 2, 3, 13, INK); box(g, x, top + 3, 1, 11, S[3]);
  // (the wheels in their wells, a mud flap)
  for (const wx of [x - 14, x + w * 0.7 + 4, x + w * 0.7 + 18]) { fender(g, wx, f - 5, 5, wx < x ? C : R); wheel(g, T, wx, f - 5, 5); }
  box(g, x + w * 0.7 + 25, f - 9, 2, 8, INK);
  void i;
};
/** The generator on its trailer: a big boxy hum (its housing lit up top, louvers stepped, the control panel's door with
 *  its dials and lamps, a warning sticker, the lifting eye), the exhaust stack sooted at its lip, the tongue, the wheels;
 *  its cables out to the lot. */
const genny = (g: Ctx, T: T, x: number, f: number) => {
  const R = rampF(T, '#6A7A5A'), S = rampF(T, '#8A8E96'), top = f - 38;
  box(g, x - 12, f - 8, 13, 2, INK); box(g, x - 13, f - 8, 2, 8, INK);
  box(g, x - 1, top - 1, 62, 31, INK); box(g, x, top, 60, 29, R[2]); box(g, x, top, 60, 2, R[4]); box(g, x, top + 2, 60, 1, R[3]); box(g, x, top, 2, 29, R[3]); box(g, x + 57, top, 3, 29, R[1]);
  box(g, x, top + 26, 60, 3, R[1]);
  for (let k = 0; k < 4; k++) for (let y = 0; y < 4; y++) { box(g, x + 5 + k * 8, top + 5 + y * 3, 6, 1, R[0]); box(g, x + 5 + k * 8, top + 6 + y * 3, 6, 1, R[3]); }
  box(g, x + 39, top + 5, 16, 17, R[1]); box(g, x + 40, top + 6, 14, 15, R[2]); box(g, x + 40, top + 6, 14, 1, R[3]);
  for (const dx2 of [43, 50]) { box(g, x + dx2 - 1, top + 8, 5, 5, INK); box(g, x + dx2, top + 9, 3, 3, T('#F4F0E4')); box(g, x + dx2 + 1, top + 10, 1, 1, T('#B4243A')); }
  box(g, x + 42, top + 16, 2, 2, T('#3ADA5A')); box(g, x + 46, top + 16, 2, 2, T('#E8A020'));
  box(g, x + 30, top + 6, 7, 6, INK); poly(g, [[x + 33, top + 7], [x + 36, top + 11], [x + 31, top + 11]], T('#E8C020'));
  // (the stack, sooted at its lip; the lifting eye)
  box(g, x + 49, top - 15, 6, 15, INK); box(g, x + 50, top - 14, 4, 14, S[2]); box(g, x + 50, top - 14, 1, 14, S[4]); box(g, x + 49, top - 16, 6, 2, T('#1A1A1A'));
  box(g, x + 24, top - 4, 6, 4, INK); box(g, x + 25, top - 3, 4, 1, S[3]);
  signText(g, 'GENNY', x + 20, f - 13, plain(1, 1, T('#E8E4C0'), R[0]));
  for (const wx of [x + 14, x + 44]) { fender(g, wx, f - 4, 4, R); wheel(g, T, wx, f - 4, 4); }
  for (let k = 0; k < 3; k++) sag(g, T, x + 60, top + 22 + k, x + 74 + k * 6, f);
};
/** A light tower: its trailer (the outriggers down on their pads, its little engine box, a wheel), the mast in lattice,
 *  the lamp bank (four heads in their rims, lit after dark). */
const lightTower = (g: Ctx, T: T, x: number, f: number) => {
  const Y = rampF(T, '#C8A020'), S = rampF(T, '#6A6E78');
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x, f - 6); g.lineTo(x + s * 20, f - 2); g.stroke(); box(g, x + s * 20 - 2, f - 2, 5, 2, T('#3A3438')); }
  box(g, x - 13, f - 13, 28, 10, INK); box(g, x - 12, f - 12, 26, 8, Y[2]); box(g, x - 12, f - 12, 26, 1, Y[4]); box(g, x - 12, f - 5, 26, 1, Y[1]);
  for (let k = 0; k < 3; k++) box(g, x - 9 + k * 3, f - 10, 1, 4, Y[0]);
  wheel(g, T, x + 6, f - 3, 3);
  // (the mast: two chords, the zigzag between them)
  box(g, x - 2, f - 112, 1, 100, INK); box(g, x + 2, f - 112, 1, 100, INK);
  g.strokeStyle = S[3]; g.lineWidth = 1; g.beginPath(); for (let y = f - 110; y < f - 14; y += 5) { g.moveTo(x - 1, y); g.lineTo(x + 2, y + 5); } g.stroke();
  box(g, x - 1, f - 112, 1, 100, S[4]);
  // (the lamp bank: its frame, four heads in rims, lit after dark)
  box(g, x - 13, f - 124, 27, 14, INK); box(g, x - 12, f - 123, 25, 1, S[3]);
  const on = timeOfDay().lamps > 0.3;
  for (let k = 0; k < 2; k++) for (let r = 0; r < 2; r++) {
    const lx = x - 12 + k * 13, ly = f - 122 + r * 6;
    box(g, lx, ly, 11, 5, S[1]); box(g, lx + 1, ly + 1, 9, 3, on ? '#FFF2C8' : T('#C8C8B8')); box(g, lx + 1, ly + 1, 3, 1, on ? '#FFFFFF' : T('#ECECE0'));
  }
};
/** The catering tent: white, peaked (its far slope shaded, dithered), the valance scalloped red and white, its poles;
 *  the tables under it (the chafing dishes catching the light), the crew in line at it (shirts, caps, a plate), a
 *  cooler. */
const tent = (g: Ctx, T: T, x: number, f: number, w: number) => {
  const P = rampF(T, '#F0ECE2'), Rd = rampF(T, '#B4243A'), S = rampF(T, '#6A6E78');
  for (const px of [x, x + w / 2, x + w]) { box(g, px - 1, f - 34, 3, 34, INK); box(g, px, f - 34, 1, 34, S[3]); }
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 6, f - 32); g.lineTo(x + w / 2, f - 53); g.lineTo(x + w + 6, f - 32); g.closePath(); g.fill();
  g.fillStyle = P[3]; g.beginPath(); g.moveTo(x - 4, f - 33); g.lineTo(x + w / 2, f - 51); g.lineTo(x + w / 2, f - 33); g.closePath(); g.fill();
  g.fillStyle = P[2]; g.beginPath(); g.moveTo(x + w / 2, f - 51); g.lineTo(x + w + 4, f - 33); g.lineTo(x + w / 2, f - 33); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.moveTo(x + w / 2, f - 51); g.lineTo(x + w + 4, f - 33); g.lineTo(x + w / 2, f - 33); g.closePath(); g.clip(); checker(g, x + w / 2, f - 44, w / 2 + 4, 11, P[1], 0, 1); g.restore();
  box(g, x + w / 2 - 1, f - 54, 2, 3, S[2]);
  // (the valance: scallops, red and white)
  for (let k = 0, sx = x - 4; sx < x + w + 4; k++, sx += 8) { const col = k % 2 ? P[3] : Rd[2]; box(g, sx, f - 33, 8, 4, col); box(g, sx + 1, f - 29, 6, 1, col); box(g, sx + 2, f - 28, 4, 1, col); box(g, sx, f - 33, 8, 1, k % 2 ? P[4] : Rd[3]); }
  box(g, x - 4, f - 34, w + 8, 1, INK);
  // (the tables: their cloths, the chafing dishes, the legs)
  box(g, x + 5, f - 15, w - 10, 5, INK); box(g, x + 6, f - 14, w - 12, 3, P[3]); box(g, x + 6, f - 14, w - 12, 1, P[4]); box(g, x + 6, f - 11, w - 12, 1, P[1]);
  for (let k = x + 10; k < x + w - 14; k += 14) { box(g, k - 1, f - 19, 10, 5, INK); box(g, k, f - 18, 8, 3, S[3]); box(g, k, f - 18, 8, 1, S[4]); box(g, k + 3, f - 20, 2, 1, S[2]); }
  box(g, x + 8, f - 10, 2, 10, S[2]); box(g, x + w - 10, f - 10, 2, 10, S[2]);
  // (the crew in line: shirts, caps, a plate held out)
  for (let k = 0; k < Math.floor(w / 10); k++) {
    const gx = x + 4 + k * 10, bob = k % 2, shirt = rampF(T, ['#2A2A30', '#3A4A6A', '#5A4A3A', '#8A2A2A'][k % 4]), skin = ['#E2B48C', '#8A5A36', '#C8946A', '#5A3A24'][k % 4];
    box(g, gx - 1, f - 14 - bob, 6, 15, INK); box(g, gx, f - 9 - bob, 4, 9, shirt[2]); box(g, gx, f - 9 - bob, 1, 9, shirt[3]); box(g, gx, f - 3, 4, 3, T('#2A2A34'));
    box(g, gx, f - 13 - bob, 4, 4, T(skin)); box(g, gx, f - 13 - bob, 1, 4, T(mix(skin, '#FFFFFF', 0.2)));
    if (k % 3 === 0) box(g, gx - 1, f - 14 - bob, 6, 2, T(['#B4243A', '#18181B', '#3A6AB8'][k % 3]));
    if (k % 4 === 1) box(g, gx + 4, f - 10 - bob, 3, 1, T('#F4F0E8'));
  }
  box(g, x + w + 8, f - 9, 14, 9, INK); box(g, x + w + 9, f - 8, 12, 7, T('#2A62B8')); box(g, x + w + 9, f - 8, 12, 2, T('#F4F0E8'));
};
/** The crane truck: its carrier (the cab, the outriggers down on their pads, hazard stripes), the turntable and its
 *  counterweight, the boom up in three telescoping sections (each narrower, lit along its top), the cable down to the
 *  hook block. */
const craneTruck = (g: Ctx, T: T, x: number, f: number) => {
  const R = rampF(T, '#C8A020'), S = rampF(T, '#6A6E78');
  for (const ox of [x + 4, x + 74]) { box(g, ox - 1, f - 12, 3, 10, INK); box(g, ox - 4, f - 3, 9, 3, INK); box(g, ox - 3, f - 2, 7, 1, S[3]); }
  box(g, x - 1, f - 31, 82, 23, INK); box(g, x, f - 30, 80, 21, R[2]); box(g, x, f - 30, 80, 2, R[4]); box(g, x, f - 28, 80, 1, R[3]); box(g, x, f - 12, 80, 3, R[1]);
  g.save(); g.beginPath(); g.rect(x + 20, f - 20, 52, 5); g.clip();
  for (let k = 0; k < 9; k++) poly(g, [[x + 20 + k * 7, f - 20], [x + 24 + k * 7, f - 20], [x + 21 + k * 7, f - 15], [x + 17 + k * 7, f - 15]], k % 2 ? INK : R[3]);
  g.restore();
  // (the cab at the front, its glass)
  box(g, x + 62, f - 44, 18, 15, INK); box(g, x + 63, f - 43, 16, 13, R[2]); box(g, x + 63, f - 43, 16, 1, R[4]); box(g, x + 65, f - 41, 12, 6, T('#5A7088')); box(g, x + 65, f - 41, 12, 2, T('#A8B8C8'));
  // (the turntable and its counterweight)
  box(g, x + 32, f - 42, 30, 13, INK); box(g, x + 33, f - 41, 28, 11, R[2]); box(g, x + 33, f - 41, 28, 1, R[4]);
  box(g, x + 30, f - 40, 8, 10, T('#3A3A42')); box(g, x + 30, f - 40, 8, 1, T('#5A5A64'));
  // (the boom: three sections up to the left, each narrower, its tip sheave; the cable and the hook block)
  const seg = (x0: number, y0: number, x1: number, y1: number, wd: number) => {
    g.strokeStyle = INK; g.lineWidth = wd + 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = R[2]; g.lineWidth = wd; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = R[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(x0 - wd / 2 + 1, y0); g.lineTo(x1 - wd / 2 + 1, y1); g.stroke();
  };
  seg(x + 50, f - 38, x + 34, f - 78, 6); seg(x + 36, f - 74, x + 22, f - 108, 4); seg(x + 23, f - 104, x + 12, f - 130, 3);
  box(g, x + 9, f - 134, 6, 6, INK); box(g, x + 10, f - 133, 4, 4, S[3]);
  box(g, x + 11, f - 128, 1, 62, T('#2A2A30'));
  box(g, x + 8, f - 66, 8, 7, INK); box(g, x + 9, f - 65, 6, 5, R[3]); box(g, x + 11, f - 59, 2, 4, INK); box(g, x + 10, f - 56, 3, 1, INK);
  for (const wx of [x + 12, x + 34, x + 66]) { fender(g, wx, f - 5, 5, R); wheel(g, T, wx, f - 5, 5); }
};
const paintBaseCamp = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.06), f = BH - BG;
  // (back to front along it: a crane truck with its arm up, the trailers, the trucks, the generator, the tent)
  const items: ((x: number, i: number) => number)[] = [
    (x, i) => { trailer(g, T, x, f, 150, 60, '#E8E4DA', 'SUPERBMAN', true, i); return 150; },
    (x, i) => { truck(g, T, x, f, 120, '#E2E2E6', '#B4243A', 'GRIP', i); return 120; },
    (x, i) => { trailer(g, T, x, f, 130, 52, '#D8D4CA', 'HONEYWAGON', false, i); return 130; },
    (x) => { genny(g, T, x, f); return 60; },
    (x, i) => { trailer(g, T, x, f, 140, 56, '#E8E4DA', 'WARDROBE', false, i); return 140; },
    (x) => { craneTruck(g, T, x, f); return 90; },
    (x, i) => { truck(g, T, x, f, 130, '#E2E2E6', '#3A6AB8', 'ELECTRIC', i); return 130; },
    (x) => { tent(g, T, x, f, 110); return 110; },
    (x, i) => { trailer(g, T, x, f, 150, 60, '#ECE6D8', 'THUD', true, i); return 150; },
  ];
  let x = 20;
  items.forEach((it, i) => { const w = it(x, i); if (i % 3 === 2) lightTower(g, T, x + w + 18, f); x += w + 40 + hash(i * 3.7) * 24; });
  // (a poster of Steve's on the honeywagon's end: he's everywhere)
  const px = 529, py = f - 30;
  box(g, px - 1, py - 1, 14, 18, INK); box(g, px, py, 12, 16, T(STEVE[4])); box(g, px, py, 12, 1, T(STEVE[5]));
  drawBust(g, steveBust('poster', T('#FFFFFF')), px, py + 1, 12, 11, 150);
  box(g, px, py + 12, 12, 3, T('#B42222')); box(g, px + 5, py - 2, 2, 2, T('#A1A1AA'));
  // (the lot's asphalt under it: banded, the parking lines, oil stains, the cable runs along it to the trailers)
  box(g, 0, f, BW, BG, T('#5A5458')); box(g, 0, f, BW, 1, T('#7A7478')); checker(g, 0, f + 6, BW, 2, T('#4E484C'), 0, 1);
  for (let k = 0; k < BW; k += 30) box(g, k, f + 4, 12, 1, T('#8A8478'));
  for (let k = 0; k < 18; k++) { const ox = Math.round(hash(k * 4.3) * BW); box(g, ox, f + 2 + (k % 3) * 2, 6 + (k % 4) * 2, 1, T('#3E383C')); }
  for (let k = 0; k < 4; k++) { const cx = 100 + k * 330; box(g, cx, f + 1 + (k % 2), 120, 1, INK); box(g, cx, f + (k % 2), 120, 1, T('#3A3A44')); }
  mist(g, BW, 0, f, skyAt(0.9, tod), 0.16, 0.04, 4);
};

// ---------------------------------------------------------------------------------------------------------------

/** How far each layer sits back (its slide across, and how far it drops as he climbs: the nearer, the more). */
const K = { mtn: 0.003, foot: 0.008, city: 0.022, lot: 0.055, palms: 0.11, camp: 0.36 } as const;

export const drawWarehouseFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), cam = state.camera.x, f = state.frame;
  const up = CAM_REST - state.camera.y;
  const drop = (k: number) => Math.round(up * k);
  /** The horizon (the eye's line: where the far layers' ground goes off to). */
  const hz = EYE - 8 + Math.round(up * 0.002);
  drawTodSky(c, 0, 0, W, H, FAR.SKY, { bands: 16, horizon: hz + 20, sun: [620, 90], moon: [160, 70], t: f, scroll: cam * 0.02 });
  hazeBands(c, 0, Math.round(hz - 150), W, 160, hourMix('#B89A72', '#C88A62', '#2E2C44', tod), 0, 0.3, 7);
  const under = (y: number, k: number, base: string) => {
    if (y >= H) return;
    const T2 = farCol(tod, k);
    bandedGradient(c, 0, Math.round(y), W, H - Math.round(y), [T2(base), T2(mix(base, '#3A3236', 0.18)), T2(mix(base, '#3A3236', 0.32))], 4);
  };
  drawHwSky(c, state, hz);
  tile(c, `hb-mtn-${tod.key}`, cam * K.mtn + 300, groundAt(K.mtn) - FAR.MH + 10 + drop(K.mtn), FAR.MH, FAR.TW, g => paintMountains(g, tod));
  drawHwHorizon(c, state, groundAt(0.0035) + 4 + drop(0.0035));
  drawHill(c, 560 - (cam - HWX) * 0.004, groundAt(0.004) + 6 + drop(0.004), f);
  tile(c, `hb-foot-${tod.key}`, cam * K.foot + 140, groundAt(K.foot) - FAR.FH + 26 + drop(K.foot), FAR.FH, FAR.TW, g => paintFoothills(g, tod));
  under(groundAt(K.foot) + 26 + drop(K.foot), 0.34, '#8A8A6A');
  tile(c, `hb-city-${tod.key}`, cam * K.city + 520, groundAt(K.city) - (FAR.CH - FAR.CG) + drop(K.city), FAR.CH, FAR.TW, g => paintCity(g, tod));
  under(groundAt(K.city) + FAR.CG + drop(K.city), 0.42, '#8A8070');
  // (the land's other attractions: Thrones of the Stars back the way he flew in, the backlot and the rest ahead)
  drawHwLandmarks(c, state, groundAt(0.03) + drop(0.03));
  tile(c, `hb-lot-${tod.key}`, cam * K.lot + 80, groundAt(K.lot) - (FAR.SH - FAR.SG) + drop(K.lot), FAR.SH, FAR.LW, g => paintLot(g, tod));
  under(groundAt(K.lot) + FAR.SG + drop(K.lot), 0.2, '#6A6466');
  tile(c, `hb-palms-${tod.key}`, cam * K.palms + 400, groundAt(K.palms) - (FAR.PH - FAR.PG) + drop(K.palms), FAR.PH, FAR.PW, g => paintPalms(g, tod));
  under(groundAt(K.palms) + FAR.PG + drop(K.palms), 0.12, '#6E6668');
  // (base camp, on the lot right behind the warehouse: its asphalt going on down to the fallen wall)
  tile(c, `hww-camp-${tod.key}`, cam * K.camp + 200, groundAt(K.camp) - (BH - BG) + drop(K.camp), BH, BW, g => paintBaseCamp(g, tod));
  under(groundAt(K.camp) + BG + drop(K.camp), 0.04, '#58525A');
  void INK;
};
