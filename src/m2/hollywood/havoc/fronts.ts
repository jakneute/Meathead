// The havoc's fronts (back from the play plane at FRONT_D: dimmed, none of them to stand on): the backlot's plywood
// streets on fire, one sheet deep, painted up as the real thing and held up from behind by 2x4s down to sandbags (the
// boulevard's bracing, going back past their ends): HAPPYWOOD BURGERS and the diners (stucco, a pylon sign, the chrome
// band), the BANKs, the POST OFFICE and CITY HALL (dressed stone, columns, a pediment, gold letters cut in the frieze),
// CHICAGO, PRECINCT 13 and MAIN STREET USA (brick, quoins, the cornice), GOTHAM-ISH and the GRAND HOTEL (deco: fluted
// piers, chevrons, a stepped parapet), the SALOON (board-and-batten), the MOTEL (its pylon in bulbs), the THEATER (its
// marquee, its blade sign), PARIS STREET and the CAFE DE PARIS (cream stone, a slate mansard and its dormers, iron
// balconies, the cafe's awning), OLD LONDON (brick, a white bay, chimney pots). All of them scorched (soot up from the
// windows in steps, the glass blown out, a hole burnt through a corner), burning along their tops and out of a window;
// Main Street's under snow. The tornado leaves only stumps (the 2x4s snapped, sandbags, a scrap of plywood).
//
// The ones that come down: tipping toward us about their feet (warped live a band of rows at a time, each band at the
// depth and height it's got to; past the eye's line their backs show: the 2x4 frame, the plywood's raw back, the
// sandbags), down flat across the street at last. The REVENGERS: RESEMBLE billboard on its I-beams the same. The LIGHT
// TOWER (a skinny lattice mast, its lamp bank) tips right over LAVA RIVER 2 and lies across it, a plank: lit along its
// top. At the start, DISASTER: THE RIDE's end: its poured concrete front (cracks, its name), the corner torn open where
// its far wall went, the wall out flat on the street (its inside face up, in three, the ride's own black panels).

import { GY } from '../geometry';
import { X, FALLS, DECOR, DOWNHILL } from './layout';
import type { Hv } from './state';
import { isTorn } from './chase';
import { spent } from './hazards';
import type { GameState } from '../../../m1/game/core/state';
import {
  type Ctx, type View, INK, box, checker, mix, hash, poly, at, atDepth, still, seen, signText, signW, FRONT_D, BACK_D, PLY, SAND, BRASS,
  STEEL, STEVE, ramp6, dimmed, rampH, glassOf, lit, slab, ball, board, deco, bulbs, paint, plain, sideBack,
} from '../blvd/kit';
import { bracing, plywood, two4, sandbags } from '../blvd/fronts';
import { gate } from '../../hub/letters';
import { rampDown } from '../../signLetters';
import { bricks, battens } from '../lot/paint';
import { revLook, subLook } from '../warehouse/paint';
import { SHELL, BLACKS, levelQ, sideQ, showLook } from '../disaster/paint';
import { steveCard } from '../blvd/props';
import { SNOW, PXD, flame, flamesAlong, smokeUp, sprite, scaleOf, lip, hazard } from './paint';

const FD = FRONT_D;

type Style = 'diner' | 'store' | 'motel' | 'civic' | 'brick' | 'deco' | 'west' | 'theater' | 'paris' | 'london';
interface HFront { rx: number; w: number; h: number; wall: string; name: string; style: Style; trim: string; sub?: string; snow: boolean }

const STYLE: Record<string, [Style, string, string?]> = {
  'HAPPYWOOD BURGERS': ['diner', '#F2C24A', 'NOW FLAME-BROILED. ALL OF IT.'],
  'BANK OF BURBANK': ['civic', '#E8C25A', 'YOUR MONEY IS SOMEWHERE'],
  CHICAGO: ['brick', '#D8C8A8', 'THE WINDY-ISH CITY'],
  'GOTHAM-ISH': ['deco', '#C8A040', 'LEGALLY DISTINCT'],
  'DRY CLEANERS': ['store', '#2E6A8A', 'SAME DAY SERVICE'],
  'PRECINCT 13': ['brick', '#D8C8A8', 'TO PROTECT AND SERVE'],
  'GRAND HOTEL': ['deco', '#E8C25A', 'NO VACANCY'],
  SALOON: ['west', '#F2E2C2', 'NO SPURS ON THE PIANO'],
  'HILLS DRIVE INN': ['diner', '#7AD8E8', 'NOW SHOWING: EVERYTHING'],
  MOTEL: ['motel', '#E84A6A', 'VACANCY'],
  DINER: ['diner', '#E84A6A', 'PIE OF THE DAY: ASH'],
  'GIFT SHOP': ['store', '#B4243A', 'SNOW GLOBES 50% OFF'],
  BANK: ['civic', '#E8C25A'],
  THEATER: ['theater', '#E8C25A'],
  'POST OFFICE': ['civic', '#E8C25A', 'U.S. MAIL-ISH'],
  'CITY HALL': ['civic', '#E8C25A', 'FIGHT CITY HALL'],
  'PARIS STREET': ['paris', '#2E5A3A', 'BOULANGERIE'],
  'CAFE DE PARIS': ['paris', '#8A1A2A', 'CAFE'],
  'OLD LONDON': ['london', '#1C1C24', 'TEA ROOM'],
  'MAIN STREET USA': ['brick', '#F2E2C2', 'EST. 1955-ISH'],
};
const asFront = (rx: number, w: number, h: number, wall: string, name: string): HFront => {
  const [style, trim, sub] = STYLE[name] ?? ['store', '#E8C25A'];
  return { rx, w, h, wall, name, style, trim, sub, snow: rx > DOWNHILL.b };
};
const FALL_WALL = ['#D8C8A8', '#C8B898', '#A8442A', '#1E3A8A', '#6A3A2A', '#8A3E2C'];
export const FRONTS: HFront[] = DECOR.map(([rx, w, h, wall, name]) => asFront(rx, w, h, wall, name));
const FALL_FRONTS: (HFront | null)[] = FALLS.map(([rx, w, h, how, name], i) => (how === 'flat' ? asFront(rx, w, h, name.includes('PARIS') ? '#D8CCB0' : FALL_WALL[i], name) : null));

/** The western town's lettering (the lot's): serifed capitals in painted wood. */
const wood = (col: string, sx = 2, sy = 2) => ({ sx, sy, serif: true, gap: 2, fill: rampDown(col, 0.35), dither: true, ink: '#1C1014', shadow: '#1C1014', drop: 1, grain: mix(col, '#1C1014', 0.3), worn: 0.06, wornCol: mix(col, '#1C1014', 0.5) });
/** Gold leaf, serifed (a bank's frieze, a Paris shop's fascia). */
const leaf = (sx = 2, sy = 2) => ({ sx, sy, serif: true, gap: 2, fill: rampDown(dimmed('#F2C24A'), 0.4), dither: true, ink: INK, shadow: INK, drop: 1 });

// ---------------------------------------------------------------------------------------------------------------
// Pieces of a front

/** Soot up a wall from (x, y): a plume in stepped rows, widening, thinning. */
export const soot = (g: Ctx, x: number, y: number, hh: number, w = 10) => {
  for (let r = 0; r < hh; r += 3) { const hw = w / 2 + r * 0.32, a = 0.6 * (1 - r / hh); g.fillStyle = `rgba(18, 10, 10, ${a.toFixed(2)})`; g.fillRect(Math.round(x - hw), Math.round(y - r - 3), Math.round(hw * 2), 3); }
};
/** A window: its frame, the glass by the hour (lit after dark), or blown out (black, shards round the frame, soot up
 *  over it). */
export const win = (g: Ctx, x: number, y: number, ww: number, wh: number, R: string[], seed: number, arch = false) => {
  const glass = glassOf(), out = hash(seed * 1.7) > 0.55, on = !out && lit() && hash(seed) > 0.5;
  box(g, x - 2, y - 2, ww + 4, wh + 4, INK);
  if (arch) { g.fillStyle = INK; g.beginPath(); g.arc(x + ww / 2, y, ww / 2 + 2, Math.PI, 0); g.fill(); g.fillStyle = out ? '#0C0606' : glass[2]; g.beginPath(); g.arc(x + ww / 2, y, ww / 2, Math.PI, 0); g.fill(); }
  if (out) {
    box(g, x, y, ww, wh, '#0C0606'); box(g, x, y + wh - 4, ww, 4, '#2A0E08');
    poly(g, [[x, y], [x + ww * 0.4, y], [x, y + wh * 0.35]], glass[2]); poly(g, [[x + ww, y + wh], [x + ww * 0.55, y + wh], [x + ww, y + wh * 0.6]], glass[1]);
    soot(g, x + ww / 2, y, 26 + hash(seed) * 20, ww);
  } else {
    box(g, x, y, ww, wh, on ? '#C88A36' : glass[1]); box(g, x, y, ww, Math.round(wh * 0.3), on ? '#E8A646' : glass[2]); checker(g, x, y + Math.round(wh * 0.3), ww, 2, on ? '#E8A646' : glass[2], 0, 1);
    box(g, x + ww / 2 - 1, y, 2, wh, R[1]);
    poly(g, [[x + 3, y + wh], [x + 7, y + wh], [x + 7 + wh * 0.4, y], [x + 3 + wh * 0.4, y]], 'rgba(255, 255, 255, 0.16)');
  }
  box(g, x - 3, y + wh + 2, ww + 6, 3, R[1]); box(g, x - 3, y + wh + 2, ww + 6, 1, R[3]);
};
/** Rows of windows between y0 and y1 across the front. */
const windows = (g: Ctx, f: HFront, y0: number, y1: number, R: string[], opts: { ww?: number; wh?: number; gap?: number; arch?: boolean; inset?: number } = {}) => {
  const ww = opts.ww ?? 26, wh = opts.wh ?? 34, gapY = opts.gap ?? 56, inset = opts.inset ?? 18;
  const n = Math.max(2, Math.floor((f.w - inset * 2 + 20) / (ww + 24)));
  for (let wy = y0, r = 0; wy + wh < y1; wy += gapY, r++) for (let k = 0; k < n; k++) {
    const wx = Math.round(inset + (k * (f.w - inset * 2 - ww)) / (n - 1));
    win(g, wx, wy, ww, wh, R, f.rx + r * 13 + k * 7, opts.arch);
  }
};
/** The street floor: a plate window (blown out or not), its riser, the door; returns the window's top. */
const shopfront = (g: Ctx, f: HFront, R: string[], T: string[], goods: (x: number, y: number, w: number, h: number) => void) => {
  const { w } = f, glass = glassOf(), dw = 38, dx = w - dw - 20, wx = 16, ww = dx - wx - 14, wh = 70, wy = -wh - 18;
  const out = hash(f.rx * 0.37) > 0.45;
  box(g, wx - 4, wy - 4, ww + 8, wh + 8, INK); box(g, wx - 3, wy - 3, ww + 6, wh + 6, T[3]); box(g, wx - 3, wy - 3, ww + 6, 1, T[5]); box(g, wx - 3, wy - 3, 1, wh + 6, T[4]);
  box(g, wx, wy, ww, wh, out ? '#140A08' : glass[1]); if (!out) box(g, wx, wy, ww, Math.round(wh * 0.3), glass[2]);
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
  goods(wx + 2, wy + 2, ww - 4, wh - 4);
  if (out) { g.fillStyle = 'rgba(10, 4, 4, 0.45)'; g.fillRect(wx, wy, ww, wh); poly(g, [[wx, wy], [wx + 24, wy], [wx, wy + 30]], glass[2]); poly(g, [[wx + ww, wy], [wx + ww - 18, wy], [wx + ww, wy + 22]], glass[1]); }
  else poly(g, [[wx + 10, wy + wh], [wx + 22, wy + wh], [wx + 22 + wh * 0.6, wy], [wx + 10 + wh * 0.6, wy]], 'rgba(255, 255, 255, 0.18)');
  g.restore();
  if (out) soot(g, wx + ww / 2, wy, 50, ww * 0.6);
  box(g, wx - 4, -18, ww + 8, 18, INK); box(g, wx - 3, -17, ww + 6, 17, T[2]); for (let x = wx - 3; x < wx + ww + 3; x += 8) box(g, x, -17, 1, 17, T[1]); box(g, wx - 3, -17, ww + 6, 2, T[4]);
  box(g, dx - 2, -78, dw + 4, 78, INK); box(g, dx - 1, -77, dw + 2, 77, T[3]); box(g, dx - 1, -77, dw + 2, 1, T[5]);
  box(g, dx + 4, -72, dw - 8, 56, glass[1]); box(g, dx + 4, -72, dw - 8, 16, glass[2]); box(g, dx + 4, -40, dw - 8, 3, INK);
  box(g, dx + 4, -14, dw - 8, 12, T[1]);
  return wy;
};
/** A cornice (stepped bands, dentils; shaded on top: scenery, not a ledge), across the front at y. */
export const cornice = (g: Ctx, w: number, y: number, S: string[]) => {
  box(g, -8, y - 14, w + 16, 16, INK);
  box(g, -7, y - 13, w + 14, 5, S[2]); box(g, -7, y - 13, w + 14, 1, S[1]);
  box(g, -5, y - 8, w + 10, 4, S[3]); for (let x = -4; x < w + 4; x += 6) box(g, x, y - 5, 3, 3, S[4]);
  box(g, -3, y - 2, w + 6, 3, S[2]);
  box(g, -7, y + 2, w + 14, 3, 'rgba(28, 16, 20, 0.35)');
};
/** Snow along a top edge (dimmed: not a ledge), a little overhang, icicles. */
export const snowCap = (g: Ctx, x: number, y: number, w: number, seed: number) => {
  const S = SNOW.map(dimmed);
  for (let k = 0; k < w; k += 6) { const hh = 3 + hash(seed + k * 0.3) * 5; box(g, x + k, y - hh, 7, hh + 2, S[3]); box(g, x + k, y - hh, 7, 1, S[4]); }
  box(g, x, y + 1, w, 1, S[1]);
  for (let k = 4; k < w - 4; k += 9 + Math.floor(hash(seed + k) * 7)) { const l = 3 + hash(seed * 2 + k) * 7; box(g, x + k, y + 2, 2, l, S[2]); box(g, x + k, y + 2, 1, l - 1, S[4]); }
};
/** A hole burnt through the plywood at a top corner: jagged, black, its edge charred, the 2x4 frame showing through. */
const burnHole = (g: Ctx, f: HFront) => {
  const right = hash(f.rx * 0.11) > 0.5, w = 36 + hash(f.rx) * 30, x0 = right ? f.w - w - 6 : 6, y0 = -f.h;
  const pts: [number, number][] = [[x0, y0]];
  for (let k = 0; k <= 6; k++) pts.push([x0 + (w * k) / 6, y0 + 10 + hash(f.rx + k) * 26 + (k % 2) * 8]);
  pts.push([x0 + w, y0]);
  poly(g, pts.map(([x, y]) => [x + (x < x0 + w / 2 ? -2 : 2), y + 3] as [number, number]), dimmed('#3A1A0E'));
  poly(g, pts, '#0E0806');
  box(g, x0 + w * 0.4, y0, 4, 30, dimmed(PLY[2]));
};

/** Stucco over a slab: light in bands down it (a step lit up top, a step shaded toward the foot, dithered between),
 *  scored courses with a lit edge under each, its grain, rain streaks run down from the top, a fresher skim patch. */
const stuccoBands = (g: Ctx, w: number, h: number, R: string[], seed: number) => {
  const up = mix(R[3], R[4], 0.25), low = mix(R[3], R[2], 0.55), b1 = -h + Math.round(h * 0.3), b2 = -h + Math.round(h * 0.7);
  box(g, 5, -h + 2, w - 10, b1 + h - 2, up); checker(g, 5, b1, w - 10, 2, up, 0, 2);
  box(g, 5, b2 + 2, w - 10, -b2 - 8, low); checker(g, 5, b2, w - 10, 2, low, 0, 2);
  for (let y = -h + 30, r = 0; y < -12; y += 32, r++) { box(g, 5, y, w - 10, 1, R[2]); box(g, 5, y + 1, w - 10, 1, R[4]); for (let x = r % 2 ? 40 : 76; x < w - 8; x += 72) { box(g, x, y - 31, 1, 31, R[2]); box(g, x + 1, y - 31, 1, 31, R[4]); } }
  for (let i = 0; i < (w * h) / 180; i++) box(g, 4 + hash(seed + i * 1.3) * (w - 8), -h + 2 + hash(seed + i * 2.9) * (h - 4), 1 + (i % 2), 1, i % 3 ? R[2] : R[4]);
  for (let k = 0; k < 3; k++) { const sx = 24 + hash(seed * 1.9 + k) * (w - 48), len = 24 + hash(seed + k * 4.7) * 50; for (let y = 0; y < len; y += 2) box(g, sx + ((y >> 1) % 2), -h + 4 + y, 1, 1, y < len * 0.6 ? R[1] : R[2]); }
  if (w > 160) { const px = 30 + hash(seed * 3.1) * (w - 120), py = -h + 40 + hash(seed * 5.3) * (h * 0.3); box(g, px, py, 46, 20, mix(R[3], R[4], 0.45)); box(g, px, py, 46, 1, R[4]); box(g, px, py + 19, 46, 1, R[2]); checker(g, px, py + 1, 46, 18, R[3], 0, 3); }
};

// ---------------------------------------------------------------------------------------------------------------
// The fronts, painted flat (their foot at (0, 0), x across 0..w)

const paintFront = (g: Ctx, f: HFront) => {
  const { w, h } = f, R = rampH(f.wall, true), T = rampH(f.trim, true), S = rampH('#C8BCA4', true);
  let subY = 0, wy = -96, nameY = -h + 22, nameL = paint(12, '#F8F2E2', INK), nameBg = '#2A1A1A', nameFrame = STEEL.map(dimmed);
  const generic = (x: number, y: number, ww: number, hh: number) => { for (let k = 0; k < 3; k++) box(g, x + 8 + k * (ww / 3), y + hh - 26, ww / 3 - 14, 26, dimmed(['#6A5A4A', '#4A3A2A', '#7A6A5A'][k])); };
  // (the roof things, behind the parapet)
  if (f.style === 'london') for (const cx of [w * 0.2, w * 0.75]) { const Br = rampH('#8A3E2C', true); box(g, cx - 13, -h - 34, 26, 36, INK); bricks(g, cx - 12, -h - 33, 24, 34, Br, dimmed('#2A1A16'), f.rx); for (let k = 0; k < 3; k++) { box(g, cx - 10 + k * 8, -h - 42, 6, 9, INK); box(g, cx - 9 + k * 8, -h - 41, 4, 8, dimmed('#B8603E')); } }
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  if (f.style === 'brick' || f.style === 'london') {
    bricks(g, 0, -h, w, h, R, dimmed('#3A2A26'), f.rx);
    for (let y = -h + 4, k = 0; y < -10; y += 12, k++) for (const qx of [0, w - (k % 2 ? 14 : 20)]) { box(g, qx, y, k % 2 ? 14 : 20, 11, S[3]); box(g, qx, y, k % 2 ? 14 : 20, 1, S[5]); box(g, qx, y + 10, k % 2 ? 14 : 20, 1, S[1]); }
    cornice(g, w, -h, S);
    if (f.style === 'london') {
      // (the white stucco ground floor, the bay window out over the pavement painted on, the black door's fanlight)
      const Wt = rampH('#E8E2D4', true);
      box(g, 0, -110, w, 110, Wt[3]); box(g, 0, -110, w, 3, Wt[4]); for (let y = -104; y < 0; y += 12) box(g, 0, y, w, 1, Wt[2]);
      windows(g, f, -h + 30, -130, R, { ww: 24, wh: 40, gap: 60 });
      const bx = 24, bw = w * 0.5;
      box(g, bx - 3, -100, bw + 6, 84, INK); box(g, bx - 2, -99, bw + 4, 82, Wt[2]);
      for (let k = 0; k < 4; k++) win(g, bx + 4 + k * (bw / 4), -92, bw / 4 - 8, 52, Wt, f.rx + 40 + k);
      const dx = w - 56; g.fillStyle = INK; g.beginPath(); g.arc(dx + 18, -84, 18, Math.PI, 0); g.fill(); g.fillStyle = glassOf()[2]; g.beginPath(); g.arc(dx + 18, -84, 15, Math.PI, 0); g.fill();
      box(g, dx - 2, -84, 40, 84, INK); box(g, dx, -82, 36, 82, T[2]); box(g, dx, -82, 3, 82, T[4]); ball(g, dx + 18, -50, 2, '#C8962E');
      wy = -96; nameY = -122; nameL = leaf(1, 2); nameBg = '#1C1C24'; nameFrame = BRASS.map(dimmed); subY = -h + 18;
    } else {
      windows(g, f, -h + 30, -130, R);
      wy = shopfront(g, f, R, T, generic);
      if (f.name === 'PRECINCT 13') { for (const lx of [10, f.w - 26]) { box(g, lx, -96, 16, 18, INK); box(g, lx + 1, -95, 14, 16, lit() ? '#7AB8FF' : dimmed('#3A6AB8')); box(g, lx + 1, -95, 14, 3, '#C8E0FF'); } }
      nameY = wy - 26;
    }
  } else if (f.style === 'civic') {
    // (dressed stone in courses, the pediment, four columns, the steps, gold letters in the frieze)
    const St = rampH(f.wall === '#57534E' || f.wall === '#3F3F46' ? '#A89C88' : '#B8AC98', true);
    slab(g, 0, -h, w, h, St);
    for (let y = -h + 8; y < 0; y += 12) { box(g, 0, y, w, 1, St[1]); for (let x = (y / 12) % 2 ? 0 : 24; x < w; x += 48) box(g, x, y, 1, 12, St[2]); }
    poly(g, [[-8, -h], [w / 2, -h - 44], [w + 8, -h]], INK); poly(g, [[-5, -h - 1], [w / 2, -h - 41], [w + 5, -h - 1]], St[3]); poly(g, [[w / 2, -h - 41], [w + 5, -h - 1], [w / 2, -h - 1]], St[2]);
    poly(g, [[14, -h - 4], [w / 2, -h - 30], [w - 14, -h - 4]], St[1]);
    box(g, -6, -h, w + 12, 26, INK); box(g, -5, -h + 1, w + 10, 24, St[3]); box(g, -5, -h + 1, w + 10, 2, St[4]); box(g, -5, -h + 23, w + 10, 2, St[1]);
    const n = 4;
    for (let k = 0; k < n; k++) { const px = 14 + (k * (w - 50)) / (n - 1); box(g, px - 1, -h + 26, 24, h - 52, INK); slab(g, px, -h + 26, 22, h - 52, St, false); for (let fx = 4; fx < 20; fx += 4) box(g, px + fx, -h + 30, 1, h - 60, St[2]); box(g, px - 4, -h + 26, 30, 6, St[4]); box(g, px - 4, -32, 30, 6, St[2]); }
    for (let k = 0; k < n - 1; k++) { const px = 36 + (k * (w - 50)) / (n - 1), ww = (w - 50) / (n - 1) - 22; win(g, px + ww * 0.15, -h + 60, ww * 0.7, 50, St, f.rx + k * 3, true); box(g, px + ww * 0.2, -80, ww * 0.6, 54, INK); box(g, px + ww * 0.2 + 1, -79, ww * 0.6 - 2, 53, dimmed(PLY[1])); }
    for (let k = 0; k < 3; k++) { box(g, -6 + k * 4, -26 + k * 8, w + 12 - k * 8, 9, INK); box(g, -5 + k * 4, -25 + k * 8, w + 10 - k * 8, 7, St[3 - (k % 2)]); box(g, -5 + k * 4, -25 + k * 8, w + 10 - k * 8, 1, St[5]); }
    signText(g, f.name, w / 2, -h + 19, leaf(f.name.length > 12 ? 1 : 2, 2));
    nameY = 0;
  } else if (f.style === 'deco' || f.style === 'theater') {
    slab(g, 0, -h, w, h, R);
    stuccoBands(g, w, h, R, f.rx);
    for (const px of [0, w - 18]) { box(g, px, -h, 18, h, R[4]); for (let k = 2; k < 18; k += 4) box(g, px + k, -h, 1, h, R[2]); box(g, px + 16, -h, 2, h, R[1]); }
    for (let x = 18; x < w - 18; x += 12) poly(g, [[x, -h + 30], [x + 6, -h + 24], [x + 12, -h + 30], [x + 12, -h + 34], [x + 6, -h + 28], [x, -h + 34]], T[3]);
    box(g, 18, -h + 34, w - 36, 2, T[1]);
    const cw = Math.min(140, w * 0.45);
    for (let k = 0; k < 3; k++) { const sw = cw - k * 34, sx = w / 2 - sw / 2, sy = -h - 14 - k * 12; box(g, sx - 1, sy - 1, sw + 2, 14, INK); box(g, sx, sy, sw, 13, R[3]); box(g, sx, sy, sw, 2, R[4]); box(g, sx + sw - 3, sy, 3, 13, R[1]); for (let x = sx + 6; x < sx + sw - 4; x += 8) box(g, x, sy + 4, 2, 9, R[2]); }
    if (f.style === 'theater') {
      // (the marquee box over the doors: its bulbs, NOW SHOWING; the blade sign up the front)
      windows(g, f, -h + 50, -170, R, { ww: 22, wh: 30, inset: 34 });
      box(g, 6, -150, w - 12, 50, INK); box(g, 8, -148, w - 16, 46, dimmed('#1C1917'));
      for (let x = 10; x < w - 10; x += 6) { box(g, x, -147, 2, 2, lit() ? '#FFF2C0' : dimmed('#8A7A5A')); box(g, x, -105, 2, 2, lit() ? '#FFF2C0' : dimmed('#8A7A5A')); }
      signText(g, 'NOW SHOWING', w / 2, -130, plain(1, 1, dimmed('#F8F2E2')));
      signText(g, 'EVERYTHING', w / 2, -114, plain(1, 2, dimmed('#FDE047')));
      box(g, w / 2 - 50, -98, 100, 98, INK); box(g, w / 2 - 48, -96, 96, 96, dimmed('#3A1A0E')); for (const dx2 of [-46, 2]) { box(g, w / 2 + dx2, -92, 44, 92, dimmed('#5A2A1A')); box(g, w / 2 + dx2 + 4, -60, 36, 3, BRASS.map(dimmed)[3]); }
      const bx = w - 40; box(g, bx - 2, -h + 4, 30, h - 160, INK); box(g, bx, -h + 6, 26, h - 164, dimmed('#7F1D1D'));
      'THEATER'.split('').forEach((ch, i) => signText(g, ch, bx + 13, -h + 26 + i * 20, bulbs(2, 2, '#FFF4C8')));
      nameY = 0;
    } else {
      windows(g, f, -h + 54, -120, R, { ww: 24, wh: 34 });
      wy = shopfront(g, f, R, T, generic);
      nameY = -h + 1; nameL = deco('#F2C24A', dimmed('#1C1014'), 3); nameBg = '#2A1A22'; nameFrame = BRASS.map(dimmed);
    }
  } else if (f.style === 'west') {
    const body = h - 50;
    const top: [number, number][] = [[0, -body], [0, -h + 20], [w * 0.2, -h + 20], [w * 0.2, -h], [w * 0.8, -h], [w * 0.8, -h + 20], [w, -h + 20], [w, -body]];
    g.save(); g.beginPath(); top.concat([[w, 0], [0, 0]]).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    battens(g, 0, -h - 20, w, h + 20, R, f.rx);
    g.restore();
    const Bd = rampH('#8C6438', true);
    for (let i = 0; i + 1 < top.length; i++) { const [ax, ay] = top[i], [bx, by] = top[i + 1]; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.strokeStyle = Bd[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, ay + 1); g.lineTo(bx, by + 1); g.stroke(); }
    box(g, 10, -h + 22, w - 20, 30, INK); box(g, 12, -h + 24, w - 24, 26, dimmed('#2A1A10'));
    signText(g, f.name, w / 2, -h + 44, wood(dimmed('#F2E2C2')));
    for (const wx of [26, w - 52]) win(g, wx, -body + 10, 26, 30, Bd, f.rx + wx);
    const dx = w / 2; box(g, dx - 24, -76, 48, 76, INK); box(g, dx - 22, -74, 44, 74, dimmed('#1A1010'));
    for (const s of [-1, 1]) { const bx = s < 0 ? dx - 21 : dx + 1; box(g, bx - 1, -58, 22, 36, INK); box(g, bx, -57, 20, 34, Bd[3]); for (let y = -54; y < -24; y += 4) box(g, bx + 2, y, 16, 2, Bd[1]); }
    win(g, 18, -70, 34, 40, Bd, f.rx + 5); win(g, w - 52, -70, 34, 40, Bd, f.rx + 6);
    nameY = 0; wy = -body; subY = -body + 56;
  } else if (f.style === 'paris') {
    // (cream stone in courses, rusticated low; a slate mansard with its dormers; tall windows with iron balconies; the
    // shop: the cafe's striped awning or the boulangerie's green fascia)
    const St = rampH(f.wall, true), Sl = rampH('#3A4250', true), Ir = rampH('#1E2226', true);
    slab(g, 0, -h, w, h, St);
    for (let y = -h + 6; y < -100; y += 10) box(g, 0, y, w, 1, St[2]);
    for (let y = -100; y < 0; y += 14) { box(g, 0, y, w, 2, St[1]); for (let x = (y / 14) % 2 ? 0 : 20; x < w; x += 40) box(g, x, y, 2, 14, St[1]); }
    poly(g, [[-6, -h + 2], [8, -h - 40], [w - 8, -h - 40], [w + 6, -h + 2]], INK);
    poly(g, [[-4, -h], [9, -h - 38], [w - 9, -h - 38], [w + 4, -h]], Sl[2]);
    for (let y = -h - 36; y < -h; y += 4) box(g, 0, y, w, 1, Sl[1]);
    poly(g, [[-4, -h], [9, -h - 38], [14, -h - 38], [2, -h]], Sl[4]);
    for (let k = 0; k < 3; k++) { const dx = w * (0.2 + k * 0.3) - 10; box(g, dx - 2, -h - 32, 24, 30, INK); box(g, dx, -h - 30, 20, 28, St[3]); poly(g, [[dx - 3, -h - 30], [dx + 10, -h - 42], [dx + 23, -h - 30]], Sl[3]); win(g, dx + 4, -h - 24, 12, 18, St, f.rx + 70 + k, true); }
    box(g, -6, -h - 2, w + 12, 6, INK); box(g, -5, -h - 1, w + 10, 4, St[4]);
    for (let r = 0; r < 2; r++) {
      const y = -h + 22 + r * 72, n = Math.max(3, Math.floor(w / 62));
      for (let k = 0; k < n; k++) { const x = 16 + (k * (w - 54)) / (n - 1); win(g, x, y, 22, 48, St, f.rx + r * 9 + k); for (const sx of [x - 8, x + 24]) { box(g, sx, y - 1, 6, 50, INK); box(g, sx + 1, y, 4, 48, dimmed('#3A5A44')); } }
      box(g, 6, y + 40, w - 12, 2, INK); box(g, 6, y + 42, w - 12, 12, 'rgba(0,0,0,0)');
      for (let x = 8; x < w - 8; x += 5) { box(g, x, y + 42, 1, 12, Ir[3]); }
      box(g, 6, y + 41, w - 12, 2, Ir[4]); box(g, 6, y + 53, w - 12, 1, Ir[2]);
    }
    if (f.name.includes('CAFE')) {
      const A2 = rampH('#8A1A2A', true), Wt = rampH('#F4EEE2', true), ay = -112;
      box(g, 8, -96, w - 16, 96, INK); box(g, 10, -94, w - 20, 94, dimmed('#2A1810'));
      for (let k = 0; k < 4; k++) { box(g, 18 + k * ((w - 46) / 3), -60, 14, 22, INK); box(g, 19 + k * ((w - 46) / 3), -59, 12, 6, dimmed('#E8E0D0')); box(g, 24 + k * ((w - 46) / 3), -53, 2, 15, dimmed('#3A2A1A')); }
      for (let x = 6, k = 0; x < w - 6; x += 12, k++) poly(g, [[x, ay], [x + 12, ay], [x + 13, ay + 22], [x + 1, ay + 22]], (k % 2 ? Wt : A2)[2]);
      for (let x = 6, k = 0; x < w - 6; x += 12, k++) { g.fillStyle = (k % 2 ? Wt : A2)[1]; g.beginPath(); g.arc(x + 7, ay + 22, 6, 0, Math.PI); g.fill(); }
      box(g, 6, ay - 1, w - 12, 2, INK);
      nameY = ay - 14; nameL = leaf(2, 2); nameBg = '#5A0E18';
    } else {
      const G = rampH('#2E5A3A', true);
      box(g, 6, -120, w - 12, 120, INK); box(g, 8, -118, w - 16, 26, G[2]); box(g, 8, -118, w - 16, 2, G[4]); box(g, 8, -94, w - 16, 94, G[1]);
      signText(g, f.sub ?? 'BOULANGERIE', w / 2, -100, leaf(1, 2));
      win(g, 18, -86, w * 0.55, 60, G, f.rx + 90); box(g, w - 54, -86, 40, 86, INK); box(g, w - 52, -84, 36, 84, G[2]);
      nameY = -h + 85; nameL = plain(1, 1, '#F8FAFC'); nameBg = '#1E3A8A';
    }
  } else {
    // (stucco: the diner, the drive-in, the store, the motel)
    slab(g, 0, -h, w, h, R);
    stuccoBands(g, w, h, R, f.rx);
    if (f.style === 'diner') {
      // (a band of windows, the chrome stripe, a googie pylon off one end with a starburst)
      box(g, 0, -h + 40, w, 6, dimmed('#D8DCE2')); box(g, 0, -h + 40, w, 2, dimmed('#FFFFFF')); box(g, 0, -h + 46, w, 2, dimmed('#7A7E86'));
      windows(g, f, -h + 62, -110, R, { ww: 34, wh: 30, gap: 50 });
      wy = shopfront(g, f, R, T, (x, y, ww, hh) => { for (let k = 0; k < ww / 30; k++) { box(g, x + k * 30, y + hh - 22, 24, 22, dimmed('#8A1A2A')); box(g, x + k * 30 + 4, y + hh - 30, 16, 8, dimmed('#D8D0C0')); } });
      const px = w - 14;
      poly(g, [[px - 12, -h - 60], [px + 8, -h - 70], [px + 14, -h + 40], [px - 6, -h + 50]], INK); poly(g, [[px - 10, -h - 58], [px + 6, -h - 66], [px + 12, -h + 38], [px - 4, -h + 48]], T[3]); poly(g, [[px - 10, -h - 58], [px - 5, -h - 61], [px + 1, -h + 46], [px - 4, -h + 48]], T[4]);
      for (let k = 0; k < 8; k++) { const an = (k * Math.PI) / 4; g.strokeStyle = k % 2 ? T[4] : '#F2D06A'; g.lineWidth = 2; g.beginPath(); g.moveTo(px, -h - 76); g.lineTo(px + Math.cos(an) * (k % 2 ? 7 : 13), -h - 76 + Math.sin(an) * (k % 2 ? 7 : 13)); g.stroke(); }
      nameY = -h + 20; nameL = bulbs(2, 2, f.trim); nameBg = '#1C1014';
    } else if (f.style === 'motel') {
      for (let k = 0; k < Math.floor(w / 52); k++) { const dx = 10 + k * 52; box(g, dx - 1, -82, 30, 82, INK); box(g, dx, -81, 28, 81, T[2]); box(g, dx, -81, 28, 2, T[4]); signText(g, String(k + 1), dx + 14, -66, plain(1, 1, BRASS.map(dimmed)[4])); win(g, dx + 34, -70, 12, 22, R, f.rx + k); }
      box(g, -6, -96, w + 12, 10, INK); box(g, -5, -95, w + 10, 8, T[3]); box(g, -5, -95, w + 10, 2, T[4]);
      windows(g, f, -h + 40, -120, R, { ww: 28, wh: 26, gap: 50 });
      const px = w * 0.5; box(g, px - 50, -h - 6, 100, 50, INK); box(g, px - 48, -h - 4, 96, 46, dimmed('#1C1014'));
      for (let x = px - 46; x < px + 46; x += 6) { box(g, x, -h - 2, 2, 2, lit() ? '#FFF2C0' : dimmed('#8A7A5A')); }
      nameY = 0; signText(g, 'MOTEL', px, -h + 28, bulbs(3, 3, f.trim));
      wy = -96;
    } else {
      wy = shopfront(g, f, R, T, (x, y, ww, hh) => {
        if (f.name === 'GIFT SHOP') for (let k = 0; k < ww / 16; k++) { g.fillStyle = INK; g.beginPath(); g.arc(x + 8 + k * 16, y + hh - 14, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#C8ECFF'); g.beginPath(); g.arc(x + 8 + k * 16, y + hh - 14, 5, 0, Math.PI * 2); g.fill(); box(g, x + 4 + k * 16, y + hh - 8, 8, 4, dimmed('#6A3A1A')); }
        else { for (let k = 0; k < ww / 12; k++) { box(g, x + 4 + k * 12, y + 4, 1, hh - 20, dimmed('#5A5A62')); box(g, x + k * 12, y + 12, 9, hh - 30, dimmed(['#F8FAFC', '#7AB8D8', '#E8C25A'][k % 3])); } box(g, x, y + 2, ww, 2, dimmed('#8A8A92')); }
      });
      // (the awning, painted flat: stripes down to a scalloped valance)
      const A2 = rampH(f.trim, true), Wt = rampH('#F4EEE2', true), ay = wy - 26;
      for (let x = 10, k = 0; x < w - 10; x += 12, k++) poly(g, [[x, ay], [x + 12, ay], [x + 13, ay + 18], [x + 1, ay + 18]], (k % 2 ? Wt : A2)[2]);
      for (let x = 10, k = 0; x < w - 10; x += 12, k++) { g.fillStyle = (k % 2 ? Wt : A2)[1]; g.beginPath(); g.arc(x + 7, ay + 18, 6, 0, Math.PI); g.fill(); }
      windows(g, f, -h + 36, ay - 34, R, { ww: 26, wh: 30 });
      nameY = ay - 18;
    }
  }
  plywood(g, w, h, R);
  // (the scorch: a hole burnt through a top corner; the foot blackened, stepped)
  burnHole(g, f);
  checker(g, 0, -14, w, 8, 'rgba(18, 10, 10, 0.5)', 1, 2); box(g, 0, -8, w, 8, 'rgba(18, 10, 10, 0.45)');
  // (the window it's burning out of: blackened, soot up over it)
  { const [fx, fy] = fireWindow(f); box(g, fx - 14, fy - 32, 28, 34, INK); box(g, fx - 12, fy - 30, 24, 30, '#140806'); box(g, fx - 12, fy - 4, 24, 4, '#3A1206'); soot(g, fx, fy - 30, 54, 24); }
  // (the name, on its board; the joke under, on a card)
  if (nameY < 0) {
    const L = nameL, tw = signW(f.name, L);
    if (tw < w - 8) board(g, w / 2, nameY, [f.name], L, nameBg, nameFrame, 6);
    else signText(g, f.name, w / 2, nameY + 4, plain(1, 2, dimmed('#F8F2E2'), INK));
  }
  if (f.sub && f.style !== 'paris' && f.style !== 'civic' && f.style !== 'theater') {
    const subL = plain(1, 1, '#2A1A1A'), sw = signW(f.sub, subL) + 12;
    if (sw < w - 10) board(g, Math.max(sw / 2 + 6, Math.min(w - sw / 2 - 6, w / 2)), subY || wy - 12, [f.sub], subL, '#F2EAD8', PLY.map(dimmed), 5);
  }
  // (snow on it: Main Street's, under the hill)
  if (f.snow) { snowCap(g, -6, -h, w + 12, f.rx); snowCap(g, 4, wy - 2, w - 8, f.rx + 3); }
  void SAND; void STEVE; void gate; void ramp6;
};

/** Where a front burns out of a window (local), for the live flames. */
const fireWindow = (f: HFront): [number, number] => [Math.round(f.w * (0.28 + hash(f.rx * 0.7) * 0.4)), Math.round(-f.h * (0.45 + hash(f.rx * 0.3) * 0.15))];

/** Its back (local; it's only ever a front): the plywood's raw back, the 2x4 frame (studs, plates, a brace), the
 *  struts snapped off it, sandbags; painted with the foot at the top (y = how far up it is). */
const paintBack = (g: Ctx, w: number, h: number, seed: number) => {
  const P = PLY.map(dimmed);
  box(g, -2, -2, w + 4, h + 4, INK);
  box(g, 0, 0, w, h, P[3]);
  for (let i = 0; i < (w * h) / 90; i++) box(g, hash(seed + i * 1.3) * w, hash(seed + i * 2.9) * h, 3, 1, i % 3 ? P[2] : P[4]);
  for (let x = 96; x < w; x += 96) box(g, x, 0, 1, h, P[1]);
  const stud = (x0: number, y0: number, x1: number, y1: number) => { g.lineCap = 'butt'; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = P[4]; g.lineWidth = 6; g.stroke(); g.strokeStyle = P[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x0 - 2, y0); g.lineTo(x1 - 2, y1); g.stroke(); };
  for (let x = 6; x < w; x += 48) stud(x, 0, x, h);
  stud(0, 4, w, 4); stud(0, h - 4, w, h - 4); stud(0, h * 0.5, w, h * 0.5);
  stud(8, 8, w - 8, h * 0.5 - 6);
  for (const sx of [w * 0.2, w * 0.8]) { box(g, sx - 5, h * 0.6, 10, 26, INK); box(g, sx - 4, h * 0.6, 8, 24, P[3]); }
  for (const [bx, by] of [[w * 0.3, h * 0.25], [w * 0.7, h * 0.3]]) for (const [dx, dy] of [[-10, 0], [4, 0], [-3, -6]]) { g.fillStyle = INK; g.beginPath(); g.ellipse(bx + dx, by + dy, 9, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed(SAND[3]); g.beginPath(); g.ellipse(bx + dx, by + dy, 8, 4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed(SAND[5]); g.beginPath(); g.ellipse(bx + dx - 2, by + dy - 1, 4, 2, 0, 0, Math.PI * 2); g.fill(); }
  signText(g, 'PROPERTY OF HAPPYWOOD', w / 2, h * 0.75, { sx: 1, sy: 1, fill: P[1], stencil: true });
};

// ---------------------------------------------------------------------------------------------------------------
// The billboard: REVENGERS: RESEMBLE on its I-beams

const POST_H = 120;
const paintBillboard = (g: Ctx, w: number, fh: number) => {
  const S = STEEL.map(dimmed), N = rampH('#1E3A8A', true), top = -POST_H - fh;
  for (const px of [30, w - 40]) { box(g, px - 1, -POST_H - 4, 14, POST_H + 4, INK); box(g, px, -POST_H - 4, 12, POST_H + 4, S[3]); box(g, px, -POST_H - 4, 3, POST_H + 4, S[5]); box(g, px + 9, -POST_H - 4, 3, POST_H + 4, S[1]); for (let y = -POST_H + 10; y < -6; y += 24) { box(g, px + 2, y, 8, 2, S[1]); } box(g, px - 6, -6, 24, 6, INK); box(g, px - 5, -5, 22, 5, S[2]); }
  g.strokeStyle = S[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(42, -POST_H + 6); g.lineTo(w - 40, -12); g.moveTo(w - 40, -POST_H + 6); g.lineTo(42, -12); g.stroke();
  // (the catwalk under the face, its rail; its gooseneck lamps)
  box(g, -6, -POST_H - 4, w + 12, 6, INK); box(g, -5, -POST_H - 3, w + 10, 4, S[2]);
  for (let x = 20; x < w; x += 60) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x, -POST_H - 4); g.quadraticCurveTo(x, -POST_H - 26, x + 14, -POST_H - 24); g.stroke(); box(g, x + 10, -POST_H - 27, 10, 6, S[1]); box(g, x + 11, -POST_H - 22, 8, 2, lit() ? '#FFF2C0' : S[4]); }
  // (the face: the frame, the navy board, the team posed in silhouette, the title)
  box(g, -3, top - 3, w + 6, fh + 6, INK); box(g, -2, top - 2, w + 4, fh + 4, S[3]); box(g, -2, top - 2, w + 4, 1, S[5]);
  for (let y = top, k = 0; y < top + fh; y += 8, k++) box(g, 0, y, w, Math.min(8, top + fh - y), N[[3, 3, 2, 2, 3, 1][k % 6]]);
  for (let k = 0; k < 7; k++) { const cx = 30 + k * ((w - 60) / 6), foot = top + fh - 4, hh = 50 + (k % 3) * 8, col = dimmed(['#B4243A', '#3A6AB8', '#2A8A4A', '#8A3AB8', '#C8962E', '#DC2626', '#0E7490'][k]); box(g, cx - 8, foot - hh, 16, hh, mix(col, INK, 0.25)); ball(g, cx, foot - hh - 7, 6, dimmed('#D8A880')); }
  signText(g, 'THE REVENGERS 19', w / 2, top + 30, revLook(2, 2));
  signText(g, 'RESEMBLE', w / 2, top + 52, subLook(2, 2));
  // (somebody's snipe pasted over its corner: Steve)
  steveCard(g, w - 34, top + 34, 0.6, 2);
  // (scorch up its face)
  for (let k = 0; k < 3; k++) { const sx = 40 + k * 110; for (let r = 0; r < 60; r += 3) { g.fillStyle = `rgba(14, 8, 8, ${(0.5 * (1 - r / 60)).toFixed(2)})`; g.fillRect(sx - 8 - r * 0.3, top + fh - r - 3, 16 + r * 0.6, 3); } }
};

// ---------------------------------------------------------------------------------------------------------------
// Tipping: a front warped a band of rows at a time

/** The front (its sprite: face up while he can see it, its back once it's past the eye's line), tipped `k` radians
 *  toward us about its foot (at FRONT_D, world x0). */
const tipped = (c: Ctx, v: View, x0: number, h: number, k: number, face: HTMLCanvasElement, back: HTMLCanvasElement, s: number, bx: number, byF: number, bw: number) => {
  const eye = v.eye, cs = Math.cos(k), sn = Math.sin(k);
  const P = (u: number) => { const d = FD + Math.max(0, u) * sn * PXD; return { d, y: eye.y + (GY - u * cs - eye.y) * d }; };
  const faceUp = P(h).y < P(0).y - 1;
  const img = faceUp ? face : back, rows = 4 * s;
  const prev = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
  for (let ry = 0; ry < img.height; ry += rows) {
    const rh = Math.min(rows, img.height - ry);
    const u0 = faceUp ? -(byF + ry / s) : -2 + ry / s, u1 = faceUp ? -(byF + (ry + rh) / s) : -2 + (ry + rh) / s;
    const p0 = P(u0), p1 = P(u1), dm = (p0.d + p1.d) / 2;
    const y0 = Math.min(p0.y, p1.y), y1 = Math.max(p0.y, p1.y);
    if (y1 - y0 < 0.05) continue;
    c.drawImage(img, 0, ry, img.width, rh, eye.x + (x0 + bx - eye.x) * dm, y0, bw * dm, y1 - y0 + 0.6);
  }
  c.imageSmoothingEnabled = prev;
};
/** Its shadow on the street as it comes over (darker, longer). */
const fallShadow = (c: Ctx, v: View, x0: number, w: number, h: number, k: number) => {
  const sn = Math.sin(k), d1 = FD + h * sn * PXD, eye = v.eye;
  c.fillStyle = `rgba(10, 6, 8, ${(0.18 + sn * 0.4).toFixed(2)})`;
  c.beginPath(); [at(eye, x0, GY, FD), at(eye, x0 + w, GY, FD), at(eye, x0 + w, GY, Math.max(FD, d1)), at(eye, x0, GY, Math.max(FD, d1))].forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
};

/** A fall's angle now (0 up .. PI/2 down flat). */
const angleOf = (fl: Hv['falls'][number]) => fl.phase === 'up' ? 0 : fl.phase === 'creak' ? Math.min(1, fl.t / 54) * 0.06 + (fl.t % 8 < 4 ? 0.006 : 0) : fl.phase === 'falling' ? 0.06 + Math.pow(fl.t / 22, 1.6) * (Math.PI / 2 - 0.06) : Math.PI / 2;

// ---------------------------------------------------------------------------------------------------------------
// Stumps (what the tornado left)

const paintStump = (g: Ctx, w: number, seed: number) => {
  const P = PLY.map(dimmed);
  for (let sx = 12, k = 0; sx < w - 6; sx += 48, k++) {
    const hh = 14 + ((k * 37 + seed) % 4) * 9;
    box(g, sx - 1, -hh - 1, 8, hh + 1, INK); box(g, sx, -hh, 6, hh, P[3]); box(g, sx, -hh, 2, hh, P[5]);
    poly(g, [[sx - 1, -hh], [sx + 2, -hh - 6], [sx + 4, -hh - 1], [sx + 7, -hh - 5], [sx + 7, -hh]], P[4]);
  }
  for (const [x, y, ww] of [[w * 0.3, -6, 30], [w * 0.65, -4, 22]] as const) { poly(g, [[x, y], [x + ww, y - 8], [x + ww + 4, y - 2], [x + 6, y + 4]], INK); poly(g, [[x + 1, y], [x + ww, y - 7], [x + ww + 2, y - 2], [x + 6, y + 3]], P[2]); }
  sandbagsLocal(g, w / 2, 0);
};
const sandbagsLocal = (g: Ctx, x: number, y: number) => {
  const S = SAND.map(dimmed);
  for (const [dx, dy, ww, hh] of [[-14, 0, 15, 8], [1, 0, 15, 8], [-7, -7, 15, 8]] as const) { g.fillStyle = INK; g.beginPath(); g.ellipse(x + dx + ww / 2, y + dy - hh / 2, ww / 2 + 1, hh / 2 + 1, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = S[2]; g.beginPath(); g.ellipse(x + dx + ww / 2, y + dy - hh / 2, ww / 2, hh / 2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = S[4]; g.beginPath(); g.ellipse(x + dx + ww / 2 - 2, y + dy - hh / 2 - 1, ww * 0.3, hh * 0.22, 0, 0, Math.PI * 2); g.fill(); }
};

// ---------------------------------------------------------------------------------------------------------------
// Putting them down

interface Piece { x0: number; x1: number; top: number; braced: boolean; draw: () => void }

export const drawHavocFronts = (c: Ctx, v: View, state: GameState, hv: Hv) => {
  const eye = v.eye, f = state.frame, done = spent(state), pieces: Piece[] = [];
  FRONTS.forEach((fr, i) => {
    const x0 = X(fr.rx), x1 = x0 + fr.w;
    if (!seen(v, x0 - 80, x1 + 80, FD, 120)) return;
    if (isTorn(state, 'facade', i)) { pieces.push({ x0, x1, top: GY - 40, braced: false, draw: () => atDepth(c, eye, FD, () => still(c, `hh-stump-${fr.w}`, x0, GY, -10, -60, fr.w + 20, 62, g => paintStump(g, fr.w, fr.rx))) }); return; }
    pieces.push({ x0, x1, top: GY - fr.h, braced: true, draw: () => atDepth(c, eye, FD, () => {
      still(c, `hh-front-${fr.rx}`, x0, GY, -40, -fr.h - 110, fr.w + 80, fr.h + 112, g => paintFront(g, fr));
      if (!done) {
        flamesAlong(c, x0 + 8, GY - fr.h, fr.w - 16, f, 0.9, fr.rx);
        const [wx, wy] = fireWindow(fr);
        flame(c, x0 + wx, GY + wy, 22, 30, f, fr.rx + 3);
      }
    }) });
  });
  FALLS.forEach(([rx, w, h, how], i) => {
    const fl = hv.falls.find(q => q.i === i);
    if (!fl || how === 'bridge') return;
    const x0 = X(rx), x1 = x0 + w;
    if (!seen(v, x0 - 100, x1 + 100, FD, 160) && !(x1 > v.v0 - 60 && x0 < v.v1 + 60)) return;
    if (isTorn(state, 'fall', i)) { pieces.push({ x0, x1, top: GY - 40, braced: false, draw: () => atDepth(c, eye, FD, () => still(c, `hh-stump-${w}`, x0, GY, -10, -60, w + 20, 62, g => paintStump(g, w, rx))) }); return; }
    const bill = how === 'billboard', fh = bill ? Math.round(h * 0.6) : h, H = bill ? POST_H + fh : h;
    const fr = FALL_FRONTS[i];
    const face = (g: Ctx) => (bill ? paintBillboard(g, w, fh) : paintFront(g, fr!));
    const k = angleOf(fl);
    if (fl.phase === 'up') {
      pieces.push({ x0, x1, top: GY - H, braced: !bill, draw: () => atDepth(c, eye, FD, () => {
        still(c, `hh-fall-${i}`, x0, GY, -40, -H - 110, w + 80, H + 112, face);
        if (!done) flamesAlong(c, x0 + 12, GY - H, w - 24, f, 0.8, rx);
      }) });
      return;
    }
    pieces.push({ x0, x1, top: GY - H, braced: fl.phase === 'creak', draw: () => {
      const s = scaleOf(c);
      const fs = sprite(`hh-fallface-${i}`, s, -40, -H - 110, w + 80, H + 112, face);
      const bs = sprite(`hh-fallback-${i}`, s, -40, -2, w + 80, H + 112, g => paintBack(g, w, H, rx));
      if (fl.phase !== 'down') fallShadow(c, v, x0, w, H, k);
      tipped(c, v, x0, H, k, fs, bs, s, -40, -H - 110, w + 80);
      // (the creak: its tell, over where its top's drawn)
      if (fl.phase === 'creak' && f % 10 < 5) { const [tx, ty] = at(eye, x0 + w / 2, GY - H * Math.cos(k), FD); signText(c, '!', tx, ty - 14, { sx: 3, sy: 3, fill: ['#FCA5A5', '#EF4444', '#B91C1C'], ink: INK, shadow: INK }); }
    } });
  });
  // (the farthest from the eye first: nearer ones' fronts over farther ones' bracing)
  pieces.sort((p, q) => Math.abs((q.x0 + q.x1) / 2 - eye.x) - Math.abs((p.x0 + p.x1) / 2 - eye.x));
  for (const p of pieces) { if (p.braced) bracing(c, eye, p.x0, p.x1, p.top); p.draw(); }
  // (smoke going up off the burning ones)
  if (!done) for (const fr of FRONTS) {
    const x0 = X(fr.rx);
    if (!seen(v, x0 - 100, x0 + fr.w + 200, FD, 160)) continue;
    const i = FRONTS.indexOf(fr);
    if (isTorn(state, 'facade', i)) continue;
    const [sx, sy] = at(eye, x0 + fr.w * 0.5, GY - fr.h - 20, FD);
    smokeUp(c, sx, sy, f, fr.rx, 0.9, 0.42);
  }
  void BACK_D; void sideBack; void two4; void sandbags; void showLook;
};

/** The LIGHT TOWER (the bridge): standing on the bank of LAVA RIVER 2, tipping right over it, lying across it. At the
 *  play plane: when it's down he walks on it (its top lit). */
export const drawLightTower = (c: Ctx, v: View, state: GameState, hv: Hv) => {
  const i = FALLS.findIndex(q => q[3] === 'bridge');
  if (i < 0) return;
  const [rx, w, h] = FALLS[i], fl = hv.falls.find(q => q.i === i);
  if (!fl) return;
  const x = X(rx), f = state.frame, down = fl.phase === 'down';
  if (!(x + w + h + 60 > v.v0 && x - 60 < v.v1)) return;
  const k = angleOf(fl), S = STEEL.map(col => mix(col, '#2A1A14', 0.12)), M = 14;
  // (its footing on the bank: a concrete pad, the hinge pin, a plate: LIGHT TOWER 2)
  box(c, x + w - 34, GY - 7, 34, 7, INK); box(c, x + w - 33, GY - 6, 32, 6, '#6E6862'); box(c, x + w - 33, GY - 6, 32, 1, '#9A948C');
  ball(c, x + w - 2, GY - 5, 3, '#57534E');
  c.save(); c.translate(x + w, GY); c.rotate(k);
  // (the mast: two chords, the lacing zigzag, rungs; the cable up it)
  for (const lx of [-M, -2]) { box(c, lx - 1, -h, 4, h, INK); box(c, lx, -h, 2, h, S[4]); }
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); for (let y = 0; y > -h + 12; y -= 16) { c.moveTo(-M + 1, y); c.lineTo(-2, y - 8); c.lineTo(-M + 1, y - 16); } c.stroke();
  c.strokeStyle = S[3]; c.lineWidth = 1; c.beginPath(); for (let y = 0; y > -h + 12; y -= 16) { c.moveTo(-M + 1, y); c.lineTo(-2, y - 8); c.lineTo(-M + 1, y - 16); } c.stroke();
  box(c, -M + 3, -h, 2, h, '#18181B');
  // (the lamp bank up top, off its left: a frame, two rows of three, the yoke)
  box(c, -40, -h - 26, 40, 28, INK); box(c, -39, -h - 25, 38, 26, S[2]); box(c, -39, -h - 25, 38, 2, S[4]);
  for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) { const on = !down && !spent(state); box(c, -37 + q * 12, -h - 23 + r * 12, 10, 10, INK); box(c, -36 + q * 12, -h - 22 + r * 12, 8, 8, on ? '#FEF3C7' : '#57534E'); if (on) box(c, -36 + q * 12, -h - 22 + r * 12, 3, 3, '#FFFFFF'); }
  c.restore();
  if (!down) {
    // (the beams: a stepped haze down off the lamps while it's standing and lit)
    if (!spent(state) && fl.phase === 'up') { const lx = x + w - 20, ly = GY - h - 12; for (let kk = 0; kk < 3; kk++) { c.fillStyle = `rgba(254, 243, 199, ${(0.08 - kk * 0.02).toFixed(3)})`; c.beginPath(); c.moveTo(lx - 20, ly); c.lineTo(lx + 20, ly); c.lineTo(lx + 120 + kk * 30, ly + 260); c.lineTo(lx - 120 - kk * 30, ly + 260); c.closePath(); c.fill(); } }
    return;
  }
  // (down: across the river, a plank: its top going back, lit along its edge (he walks on it))
  const y = GY - 14, a = x + w - 10, b = x + w + h;
  if (v.eye.y < y) levelQ(c, v.eye, a, b, y, 1, 0.975, S[3]);
  lip(c, a, y, b - a);
  void f;
};

// ---------------------------------------------------------------------------------------------------------------
// The start: DISASTER: THE RIDE's end

const RIDE_H = 420, RIDE_L = -200, RIDE_R = 130, OUT_D = 0.846;
const paintRideFront = (g: Ctx) => {
  const C = rampH('#6A625E', true), w = RIDE_R - RIDE_L, x0 = 0;
  box(g, x0 - 2, -RIDE_H - 2, w + 4, RIDE_H + 2, INK);
  slab(g, x0, -RIDE_H, w, RIDE_H, C);
  for (let y = -RIDE_H + 30; y < 0; y += 40) box(g, x0, y, w, 1, C[1]);
  for (let x = 40; x < w; x += 80) box(g, x0 + x, -RIDE_H, 1, RIDE_H, C[2]);
  for (let y = -RIDE_H + 14; y < 0; y += 40) for (let x = 20; x < w; x += 40) box(g, x0 + x, y, 2, 2, C[1]);
  // (cracks: zigzags spreading down from the torn corner)
  for (let k = 0; k < 4; k++) { let x = w - 20 - k * 60, y = -RIDE_H + 20 + k * 30; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 6; s++) { x -= 6 + hash(k * 7 + s) * 16; y += 14 + hash(k + s * 3) * 16; g.lineTo(x, y); } g.stroke(); }
  // (its name up top, the stage's number, an EXIT sign by the hole)
  signText(g, 'DISASTER:', w / 2 - 6, -RIDE_H + 54, showLook(3, 3, '#F97316'));
  signText(g, 'THE RIDE', w / 2 - 6, -RIDE_H + 92, gate({ sx: 3, sy: 3 }, '#FDE047', '#7C2D12'));
  signText(g, 'SOUNDSTAGE 66', w / 2 - 6, -RIDE_H + 116, { sx: 1, sy: 1, fill: dimmed('#E7E5E4'), stencil: true });
  // (soot over all of it from the hole)
  for (let r = 0; r < 160; r += 3) { g.fillStyle = `rgba(12, 6, 6, ${(0.5 * (1 - r / 160)).toFixed(2)})`; g.fillRect(w - 140 - r * 0.2, -240 - r, 120 + r * 0.4, 3); }
};
/** The hole (the corner torn open), as a path. */
const holePath = (c: Ctx) => {
  c.beginPath(); c.moveTo(X(10), GY);
  for (let k = 0; k <= 8; k++) c.lineTo(X(10 + k * 15), GY - 230 - ((k * 37) % 5) * 10);
  c.lineTo(X(RIDE_R), GY - 280); c.lineTo(X(RIDE_R), GY); c.closePath();
};
export const drawRideEnd = (c: Ctx, v: View, state: GameState) => {
  if (!(X(520) > v.v0 && X(RIDE_L) < v.v1)) return;
  const eye = v.eye, f = state.frame, done = spent(state), xr = X(RIDE_R);
  // The far wall, out flat on the street (its inside face up, broken in three: the ride's black panels)
  const W3 = 380 / 3;
  for (let i = 0; i < 3; i++) {
    const a = xr + i * W3 + 4, b = a + W3 - 10, tilt = (i - 1) * 0.004;
    for (let j = 0; j < 4; j++) levelQ(c, eye, a, b, GY - 3 + j * tilt * 100, 0.975 - ((0.975 - OUT_D) * j) / 4, 0.975 - ((0.975 - OUT_D) * (j + 1)) / 4, [BLACKS[3], BLACKS[2], BLACKS[2], BLACKS[1]][j]);
    c.strokeStyle = BLACKS[1]; c.lineWidth = 1; c.beginPath();
    for (let x = a + 40; x < b; x += 96) { const [p, q] = at(eye, x, GY - 3, 0.975), [p2, q2] = at(eye, x, GY - 3, OUT_D); c.moveTo(p, q); c.lineTo(p2, q2); }
    c.stroke();
    const [p, q] = at(eye, a, GY - 3, OUT_D), [p2] = at(eye, b, GY - 3, OUT_D); box(c, p, q - 1, p2 - p, 2, INK);
    const [n0, m0] = at(eye, a, GY - 3, 0.975), [n1] = at(eye, b, GY - 3, 0.975); box(c, n0, m0, n1 - n0, 3, SHELL[3]); box(c, n0, m0, n1 - n0, 1, SHELL[5]);
  }
  // (its EXIT sign, lying in it, dead)
  { const [ex, ey] = at(eye, xr + 250, GY - 3, 0.92); box(c, ex - 15, ey - 5, 30, 8, INK); box(c, ex - 14, ey - 4, 28, 6, '#5A1010'); }
  // The building's end: its corner open where the far wall went (the inside: dark, the seats in tiers, the screen's fire)
  if (eye.x > xr + 1) {
    const bands: [number, number, string][] = [[0, 20, '#141012'], [20, 120, '#0E0C10'], [120, 300, '#0A0809'], [300, RIDE_H, '#141012']];
    for (const [h0, h1, col] of bands) sideQ(c, eye, xr, GY - h1, GY - h0, 1, OUT_D, col);
    for (let t = 0; t < 4; t++) { const h0 = 10 + t * 22; sideQ(c, eye, xr, GY - h0 - 4, GY - h0, 0.98 - t * 0.03, 0.9 - t * 0.012, '#2A2228'); }
    const fl = 0.5 + 0.5 * Math.sin(f * 0.3) * Math.sin(f * 0.13);
    if (!done) sideQ(c, eye, xr, GY - 260, GY - 150, 0.9, OUT_D + 0.01, `rgba(242, 106, 18, ${(0.25 + fl * 0.2).toFixed(2)})`);
    for (const h of [RIDE_H - 30, RIDE_H - 60]) { const [p, q] = at(eye, xr, GY - h, 1), [p2, q2] = at(eye, xr, GY - h, OUT_D); c.strokeStyle = '#3A3A44'; c.lineWidth = 2; c.beginPath(); c.moveTo(p, q); c.lineTo(p2, q2); c.stroke(); }
  }
  // Its front (at the play plane), the hole torn in its corner
  still(c, 'hh-ride-front', X(RIDE_L), GY, -4, -RIDE_H - 4, RIDE_R - RIDE_L + 8, RIDE_H + 6, paintRideFront);
  c.save(); holePath(c); c.clip();
  const dk = ['#0C0A0E', '#100C10', '#140E12', '#1A1216'];
  for (let i = 0; i < 4; i++) box(c, X(0), GY - 300 + i * 75, 160, 76, dk[i]);
  for (let t = 0; t < 3; t++) box(c, X(10), GY - 40 - t * 30, 120, 6, '#2A2228');
  if (!done) { const fl = 0.5 + 0.5 * Math.sin(f * 0.27); c.fillStyle = `rgba(242, 106, 18, ${(0.12 + fl * 0.14).toFixed(2)})`; c.fillRect(X(0), GY - 300, 160, 300); }
  c.restore();
  // (the hole's edge: broken concrete, rebar bent out)
  c.strokeStyle = INK; c.lineWidth = 3; holePath(c); c.stroke();
  for (const y of [GY - 200, GY - 130, GY - 60]) { c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(X(10), y); c.quadraticCurveTo(X(24), y - 10, X(32), y + 8); c.stroke(); c.strokeStyle = '#8A3A1A'; c.lineWidth = 2; c.stroke(); c.lineCap = 'butt'; }
  // (rubble at its foot, chunks of block in steps)
  for (let k = 0; k < 12; k++) { const rx2 = X(16) + hash(k * 3.1) * 140, s2 = 6 + hash(k * 1.7) * 12, d = 0.96 + hash(k) * 0.03, [sx, sy] = at(eye, rx2, GY, d); box(c, sx - 1, sy - s2 * 0.6 - 1, s2 + 2, s2 * 0.6 + 2, INK); box(c, sx, sy - s2 * 0.6, s2, s2 * 0.6, SHELL[3]); box(c, sx, sy - s2 * 0.6, s2, 1, SHELL[5]); }
  if (!done) smokeUp(c, X(70), GY - 240, f, 3, 1, 0.4);
};

void hazard; void board;
