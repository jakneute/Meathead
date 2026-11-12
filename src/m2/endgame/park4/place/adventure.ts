// SAFARI ARTIE's place in hell (PRIDE): HELL'S JUNGLE CRUISE. He told everybody, every day, that he was the best guide
// in the park. Now he gives the same tour forever, to the guest who killed him. Ned's knockoff of his clearing: the
// jungle burning low under a sickly green sky, the canopy's crowns lit by the fire along their tops, a boiling tar river
// out past it with the cruise's boat stuck in it, and his own statue (BEST GUIDE, a hat the size of a car) toppled on
// its face. Along the back of the path: the understory burnt to stalks and ash, the reviews nailed up on stakes (ONE
// STAR), his BEST GUIDE plaque with the BEST crossed out, tiki torches, skulls on poles.
//
//   - the sky and the far off (adventure/clearing/orbit.ts ORBIT_HOOKS.sky, out to the loop's horizon, turned with it):
//     banded green-black down to a fire glow, smoke columns; slid round with the loop: the far ridge of burnt jungle
//     (charred palms, fires), the tar river with the boat, the toppled statue;
//   - the ridge's and the canopy's colors (ORBIT_HOOKS.pal): char black-green, their crests lit orange like a fire line;
//   - the understory (adventure/clearing/art.ts CLEARING_HOOKS.under): burnt, painted once in chunks;
//   - the set pieces along the back (CLEARING_HOOKS.back, after the understory: behind the PA poles, the blind, the
//     bushes and the fence), each painted once; the torches' flames live.

import type { GameState } from '../../../../m1/game/core/state';
import type { HellPlace } from '../defs';
import { GY } from '../../../adventure/geometry';
import { ARENA_L } from '../../../adventure/clearing/arena';
import { pixelBlob, pixelRidge } from '../../../../m1/game/render/pixelArt';
import {
  type Ctx, type Look, W, H, INK, h01, box, poly, line, bake, strip, sign, skull, bone, flame, motes, seen,
  bandedGradient, hazeBands, steppedGlow, checker, signText, BONE,
} from './kitPA';

const CHAR = ['#050604', '#0B0E08', '#12170C', '#1A2212', '#26301A', '#364224'];
const FIRE = ['#FFF0A0', '#FAB040', '#E06A1C', '#8A2A10'];
const GOLDR = ['#3A2A06', '#6A4E0C', '#9A7614', '#C8A024', '#E8C84E', '#FFF0A0'];
const WOOD = ['#100A06', '#1E140A', '#302012', '#46301C', '#5E4428', '#7A5C38'];
const TAR = ['#040404', '#0A0A0C', '#141418', '#202028', '#30303A'];

// ---------------------------------------------------------------------------------------------------------------
// The sky and the far off (screen space, its horizon at the loop's, turned with it)

const HZ = 400;
const paintSky = (g: Ctx) => {
  bandedGradient(g, 0, 0, W, HZ, ['#020402', '#040804', '#081006', '#0E1A08', '#16260A', '#22300C', '#36340E', '#56380E', '#7E4212', '#A85418'], 16);
  box(g, 0, HZ, W, H - HZ, '#0A0E06');
  // (smoke going up off the fires: columns leaning off right, black, lit under their bellies)
  for (let k = 0; k < 7; k++) {
    const bx = 40 + k * 118 + h01(k * 3.1) * 40;
    for (let j = 0; j < 14; j++) {
      const y = HZ - 20 - j * 26, x = bx + j * j * 0.9 + Math.sin(j * 0.7 + k) * 6, r = 10 + j * 3.4;
      pixelBlob(g, x, y + 2, r, r * 0.5, j < 4 ? '#3A2410' : '#0E1408');
      pixelBlob(g, x + 3, y, r * 0.9, r * 0.42, j < 3 ? '#1A140C' : '#070A05');
    }
  }
  // (a sick moon through it, half hid)
  steppedGlow(g, 640, 70, 80, '#90AE34', 0.12, 0, 5);
  g.fillStyle = INK; g.beginPath(); g.arc(640, 70, 24, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#7A8E3A'; g.beginPath(); g.arc(640, 70, 22, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#9AAE4E'; g.beginPath(); g.arc(636, 66, 15, 0, Math.PI * 2); g.fill();
  checker(g, 618, 74, 44, 2, '#5E6E2A', 0, 2);
  for (const [cx, cy, r] of [[648, 76, 4], [632, 62, 3], [646, 60, 2]] as const) { g.fillStyle = '#5E6E2A'; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); }
  pixelBlob(g, 660, 78, 50, 8, '#070A05'); pixelBlob(g, 610, 88, 40, 6, '#0E1408');
};

/** The far ridge: burnt jungle along a ridge (charred palms, snapped), fires along it; the tar river at its foot with
 *  the cruise's boat in it; his statue toppled on its face. A tile 1200 wide, 190 tall (its foot at the horizon). */
const TW = 1200, TH = 190;
const palm = (g: Ctx, x: number, y: number, h: number, lean: number, col: string, burning: boolean) => {
  g.lineCap = 'round';
  line(g, [[x, y], [x + lean * 0.5, y - h * 0.55], [x + lean, y - h]], col, 3);
  // (the fronds: burnt to stubs, hanging)
  const tx = x + lean, ty = y - h;
  for (let k = 0; k < 5; k++) { const a = -Math.PI * 0.9 + k * 0.45, len = 8 + (k % 2) * 5; line(g, [[tx, ty], [tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.5 + len * 0.5]], col, 2); }
  if (burning) { steppedGlow(g, tx, ty, 16, '#E06A1C', 0.35, 0, 3); box(g, tx - 2, ty - 6, 4, 6, FIRE[2]); box(g, tx - 1, ty - 8, 2, 4, FIRE[1]); }
};
const paintFar = (g: Ctx) => {
  const top = (x: number) => { const xx = ((x % TW) + TW) % TW, k = Math.max(0, xx - (TW - 80)) / 80; const f = (u: number) => 120 + Math.sin(u * 0.009 + 1) * 16 + Math.sin(u * 0.031) * 6; return f(xx) * (1 - k) + f(0) * k; };
  pixelRidge(g, 0, TW, TH - 30, top, 0, { fill: '#0C1208', rim: '#3A1C0A', lit: '#5A2A0E' }, 1, 2);
  box(g, 0, TH - 30, TW, 30, '#0C1208');
  // (the fire line along it: low flames in steps, a glow)
  for (let x = 0; x < TW; x += 6) { const y = top(x), k = h01(x * 0.13); if (k > 0.55) { box(g, x, y - 2 - k * 4, 4, 2 + k * 4, k > 0.8 ? FIRE[1] : FIRE[2]); box(g, x + 1, y - 3 - k * 6, 2, 2, FIRE[3]); } }
  for (let k = 0; k < 7; k++) steppedGlow(g, 80 + k * 170, top(80 + k * 170) - 4, 40, '#E06A1C', 0.16, 0, 4);
  // (charred palms up off it, some still burning)
  for (let k = 0; k < 38; k++) { const x = h01(k * 4.7 + 1) * TW; if (x > 470 && x < 760) continue; palm(g, x, top(x) + 2, 22 + h01(k * 2.1) * 30, (h01(k * 3.3) - 0.5) * 14, '#080C06', k % 5 === 0); }
  // (his statue, toppled on its face down the slope: the plinth, BEST GUIDE on it, the legs up off it, the hat rolled off)
  const sx = 520, sy = top(560) + 6;
  box(g, sx - 2, sy - 22, 46, 24, INK); box(g, sx, sy - 20, 42, 22, '#4A3A1A'); box(g, sx, sy - 20, 42, 2, '#7A6230');
  signText(g, 'BEST', sx + 21, sy - 11, { sx: 1, sy: 1, fill: GOLDR[4], gap: 1 }); signText(g, 'GUIDE', sx + 21, sy - 3, { sx: 1, sy: 1, fill: GOLDR[4], gap: 1 });
  // (the boots still on the plinth, the rest of him down the slope on his face)
  box(g, sx + 8, sy - 34, 8, 14, INK); box(g, sx + 26, sy - 34, 8, 14, INK); box(g, sx + 9, sy - 33, 6, 12, GOLDR[2]); box(g, sx + 27, sy - 33, 6, 12, GOLDR[2]);
  poly(g, [[sx + 46, sy - 16], [sx + 150, sy + 4], [sx + 150, sy + 18], [sx + 46, sy]], INK);
  poly(g, [[sx + 48, sy - 14], [sx + 148, sy + 6], [sx + 148, sy + 16], [sx + 48, sy - 2]], GOLDR[2]);
  line(g, [[sx + 48, sy - 14], [sx + 148, sy + 6]], GOLDR[4], 1);
  // (his arm out, finger pointing at nothing; his head a lump past it, the crack across it)
  line(g, [[sx + 96, sy - 2], [sx + 122, sy - 22], [sx + 136, sy - 30]], INK, 6); line(g, [[sx + 96, sy - 2], [sx + 122, sy - 22], [sx + 136, sy - 30]], GOLDR[3], 3);
  pixelBlob(g, sx + 162, sy + 8, 16, 12, INK, 2); pixelBlob(g, sx + 162, sy + 8, 14, 10, GOLDR[3], 2); line(g, [[sx + 154, sy], [sx + 166, sy + 12]], INK, 1);
  // (the hat, rolled off: big as a car)
  pixelBlob(g, sx + 214, sy + 10, 30, 7, INK, 2); pixelBlob(g, sx + 214, sy + 10, 28, 5, '#8A7A4A', 2); pixelBlob(g, sx + 214, sy + 2, 15, 9, INK, 2); pixelBlob(g, sx + 214, sy + 2, 13, 8, '#A6965E', 2); box(g, sx + 202, sy + 4, 24, 2, '#3A1A0A');
  // (the tar river along the foot: black, bubbles lit by the fires; the cruise's boat stuck in it, its awning burnt)
  const ry = TH - 26;
  box(g, 0, ry, TW, 26, TAR[1]); box(g, 0, ry, TW, 2, TAR[3]); checker(g, 0, ry + 2, TW, 2, TAR[2], 0, 2);
  for (let k = 0; k < 60; k++) { const x = h01(k * 7.7) * TW, y = ry + 5 + h01(k * 3.9) * 18; box(g, x, y, 3, 2, TAR[3]); box(g, x + 1, y, 1, 1, k % 3 ? '#5A3A1A' : '#8A5A2A'); }
  const bx = 880;
  poly(g, [[bx - 2, ry + 6], [bx + 72, ry + 6], [bx + 66, ry + 16], [bx + 4, ry + 16]], INK); poly(g, [[bx, ry + 7], [bx + 70, ry + 7], [bx + 64, ry + 14], [bx + 6, ry + 14]], '#3A4A3A');
  box(g, bx + 4, ry + 7, 64, 2, '#6A7A5A');
  for (const px of [bx + 8, bx + 34, bx + 62]) box(g, px, ry - 12, 2, 19, INK);
  poly(g, [[bx + 4, ry - 14], [bx + 66, ry - 14], [bx + 60, ry - 10], [bx + 10, ry - 10]], '#5A2A1A'); for (let k = 0; k < 6; k++) box(g, bx + 12 + k * 9, ry - 10, 3, 3, INK);
  steppedGlow(g, bx + 36, ry - 14, 18, '#E06A1C', 0.3, 0, 3); box(g, bx + 30, ry - 20, 4, 6, FIRE[2]); box(g, bx + 44, ry - 18, 3, 4, FIRE[1]);
  hazeBands(g, 0, ry - 30, TW, 30, '#3A2A10', 0, 0.35, 4, 2);
};

const SKY_TOP = '#020402';
const drawSky = (c: Ctx, hy: number, phi: number, state: GameState) => {
  const sky = bake('rf4-ad-sky', W, H, paintSky), y0 = Math.round(hy - HZ);
  if (y0 > 0) { c.fillStyle = SKY_TOP; c.fillRect(0, 0, W, y0); }
  c.drawImage(sky, 0, y0);
  strip(c, bake('rf4-ad-far', TW, TH, paintFar), -phi * 900 + 420, hy - TH + 4);
  void state;
  return true;
};

/** Over the whole loop once it's drawn (the floor round it, the jungle, the temple): scorched (one multiply fill, then
 *  the smoke lying low over the far side of the loop, dithered). */
const scorch = (c: Ctx, hy: number, state: GameState) => {
  c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#7A6440'; c.fillRect(0, 0, W, H); c.restore();
  c.drawImage(bake('rf4-ad-smoke', W, 60, g => { hazeBands(g, 0, 0, W, 60, '#1A1A10', 0.55, 0, 5, 2); }), 0, Math.round(hy - 150));
  void state;
};

const skyLive = (c: Ctx, state: GameState) => {
  const f = state.frame;
  motes(c, f, 16, [FIRE[1], FIRE[2], '#FAD07A'], false, 0.7);
  motes(c, f + 500, 10, ['#3A4030', '#545A44'], true, 0.4);
};

export const adventurePlace: HellPlace = {
  light: { dark: 0.34, shade: [12, 20, 4], grade: '#D8E8B0' },
  skyLive,
};
/** (orbit.ts ORBIT_HOOKS, set by rf/adventure.ts: only while his refight's on) */
export const adventureSky = drawSky;
export const adventureScorch = scorch;
export const ADVENTURE_PAL = {
  ridge: ['#0E1408', '#4A240C', '#0A1006', '#070C05'],
  canopy: ['#121A0C', '#7A3A12', '#0E1609', '#0B1207', '#080E05'],
};

// ---------------------------------------------------------------------------------------------------------------
// The understory, burnt (world space, chunks 400 wide, 72 tall, its foot at GY - 2)

const UCH = 400;
const paintUnder = (g: Ctx, cx: number) => {
  const C = CHAR;
  box(g, 0, 62, UCH, 10, C[0]); checker(g, 0, 60, UCH, 2, C[0], 0, 2);
  for (let row = 0; row < 2; row++) for (let x = -40 + row * 13; x < UCH + 40; x += 21) {
    const k = h01((cx + x) * 0.071 + row * 3.3), y = 70 - (row ? 0 : 5), s = row ? 0.75 + k * 0.3 : 1 + k * 0.4;
    const kind = Math.floor(h01((cx + x) * 0.13 + row) * 5);
    if (kind === 0) {
      // (a fern burnt to black wire, curled)
      for (let j = -2; j <= 2; j++) { g.lineCap = 'round'; line(g, [[x, y], [x + j * 5 * s, y - 14 * s], [x + j * 8 * s, y - 18 * s + Math.abs(j) * 3]], j % 2 ? C[2] : C[3], 1); }
    } else if (kind === 1) {
      // (a stalk, charred, an ember still in its tip)
      box(g, x, y - 26 * s, 2, 26 * s, C[2]); box(g, x, y - 26 * s, 1, 26 * s, C[4]);
      if (k > 0.6) { box(g, x, y - 28 * s, 2, 2, FIRE[2]); box(g, x, y - 28 * s, 1, 1, FIRE[1]); }
    } else if (kind === 2) {
      // (a leaf gone brown, hanging off a black stem)
      box(g, x, y - 20 * s, 2, 20 * s, C[2]);
      poly(g, [[x + 1, y - 20 * s], [x + 10 * s, y - 12 * s], [x + 6 * s, y - 6 * s]], '#3A2A10'); line(g, [[x + 1, y - 20 * s], [x + 7 * s, y - 9 * s]], '#5A3A16', 1);
    } else if (kind === 3) {
      // (a heap of ash, smoking)
      pixelBlob(g, x, y - 3, 10 * s, 4 * s, '#2A2A26', 2); pixelBlob(g, x - 2, y - 5, 6 * s, 2 * s, '#4A4840', 2);
      if (k > 0.5) { box(g, x - 1, y - 4, 2, 1, FIRE[2]); }
    } else {
      // (a stump of a bamboo, split, black)
      box(g, x - 2, y - 16 * s, 5, 16 * s, C[1]); box(g, x - 2, y - 16 * s, 2, 16 * s, C[3]); box(g, x - 2, y - 9 * s, 5, 1, C[0]);
      poly(g, [[x - 2, y - 16 * s], [x, y - 20 * s], [x + 3, y - 16 * s]], C[2]);
    }
  }
  // (a few skulls and bones in the ash)
  for (let k = 0; k < 3; k++) { const x = 40 + h01(cx * 0.01 + k * 5.1) * (UCH - 80); if (k === 0) skull(g, x, 70, 0.8); else bone(g, x, 68, 14, k % 2 ? -2 : 1); }
};
const drawUnder = (c: Ctx, L: number, R: number) => {
  for (let cx = Math.floor(L / UCH) * UCH; cx < R; cx += UCH) c.drawImage(bake(`rf4-ad-under-${((cx / UCH) % 4 + 4) % 4}`, UCH, 72, g => paintUnder(g, cx % (UCH * 4))), cx, GY - 74);
  return true;
};
export const adventureUnder = drawUnder;

// ---------------------------------------------------------------------------------------------------------------
// The set pieces along the back (world space; each painter's foot at (0, 0))

const WRITE: Look = { sx: 1, sy: 2, fill: ['#F0E4C0', '#D4C49A'], gap: 1, shadow: INK };
const star = (g: Ctx, x: number, y: number, on: boolean) => {
  const P: [number, number][] = [[0, -4], [1, -1], [4, -1], [2, 1], [3, 4], [0, 2], [-3, 4], [-2, 1], [-4, -1], [-1, -1]];
  poly(g, P.map(([a, b]) => [x + a * 1.3, y + b * 1.3]), INK);
  poly(g, P.map(([a, b]) => [x + a, y + b]), on ? GOLDR[4] : '#3A3426');
};
/** A review nailed to a stake: stars across its top (one lit, or none), the words. */
const paintReview = (g: Ctx, lit: number, lines: string[]) => {
  box(g, -2, -138, 5, 138, INK); box(g, -1, -138, 3, 138, WOOD[3]); box(g, -1, -138, 1, 138, WOOD[5]);
  const [w, h] = sign(g, 0, -112, [['     ', WRITE], ...lines.map(t => [t, WRITE] as [string, Look])], '#3A3020', WOOD, 6);
  for (let k = 0; k < 5; k++) star(g, -20 + k * 10, -112 - h / 2 + 10, k < lit);
  void w;
  box(g, -2, -112 - h / 2 + 2, 3, 3, '#8A8A90');
};
/** His plaque on a post: brass, BEST GUIDE IN THE PARK on it; BEST scratched through, WORST daubed over it in red. */
const paintPlaque = (g: Ctx) => {
  for (const px of [-28, 24]) { box(g, px - 1, -150, 7, 150, INK); box(g, px, -150, 5, 150, WOOD[3]); box(g, px, -150, 1, 150, WOOD[5]); }
  const engr: Look = { sx: 1, sy: 2, fill: GOLDR[1], gap: 1, lip: GOLDR[5] };
  sign(g, 0, -120, [['BEST', { sx: 2, sy: 2, fill: GOLDR[1], gap: 1, lip: GOLDR[5] }], ['GUIDE IN', engr], ['THE PARK', engr], ['SAFARI ARTIE', engr]], GOLDR[3], WOOD, 6);
  // (BEST crossed through, scratched; WORST daubed over it, dripping)
  line(g, [[-22, -143], [22, -151]], '#2A1A0A', 2); line(g, [[-22, -151], [22, -143]], '#2A1A0A', 2);
  signText(g, 'WORST', 1, -159, { sx: 2, sy: 2, fill: ['#D8281C', '#A8180E'], gap: 1, slant: 0.4, shadow: INK });
  for (const [dx, len] of [[-12, 6], [2, 9], [14, 4]] as const) box(g, dx, -159, 2, len, '#A8180E');
};
/** A welcome board on two posts. */
const paintWelcome = (g: Ctx) => {
  for (const px of [-52, 46]) { box(g, px - 1, -120, 8, 120, INK); box(g, px, -120, 6, 120, WOOD[3]); box(g, px, -120, 2, 120, WOOD[5]); }
  const big: Look = { sx: 2, sy: 2, fill: [FIRE[0], FIRE[1], FIRE[2]], gap: 1, shadow: INK, dither: true };
  sign(g, 0, -88, [["WELCOME TO", WRITE], ["HELL'S", big], ['JUNGLE CRUISE', big], ['AN ORIGINAL ATTRACTION BY NED', { sx: 1, sy: 1, fill: '#C8B890', gap: 1 }]], '#2A1A10', WOOD, 6);
};
/** A tiki torch: a bamboo pole, its cup (the flame's live). */
const paintTorch = (g: Ctx) => {
  box(g, -3, -84, 6, 84, INK); box(g, -2, -84, 4, 84, '#6A5A2A'); box(g, -2, -84, 1, 84, '#9A8A4A'); for (let y = -76; y < 0; y += 14) box(g, -3, y, 6, 1, INK);
  box(g, -7, -92, 14, 9, INK); box(g, -6, -91, 12, 7, '#4A3A1A'); box(g, -6, -91, 12, 1, '#7A6A3A'); for (let k = 0; k < 4; k++) box(g, -5 + k * 3, -88, 1, 4, '#2A1E0E');
};
/** A skull up on a pole, a necklace of teeth under it. */
const paintSkullPole = (g: Ctx) => {
  box(g, -2, -74, 5, 74, INK); box(g, -1, -74, 3, 74, WOOD[2]); box(g, -1, -74, 1, 74, WOOD[4]);
  skull(g, 0, -70, 1.2);
  for (let k = 0; k < 6; k++) { box(g, -8 + k * 3, -64 + (k === 0 || k === 5 ? 0 : 2), 2, 4, BONE[4]); }
};

type Piece = { rx: number; k: 'review' | 'plaque' | 'welcome' | 'torch' | 'skull'; lit?: number; text?: string[] };
const PIECES: Piece[] = [
  { rx: -460, k: 'torch' }, { rx: -300, k: 'welcome' }, { rx: -110, k: 'review', lit: 1, text: ['HE TALKED THE', 'WHOLE TIME.'] },
  { rx: -30, k: 'skull' }, { rx: 30, k: 'torch' }, { rx: 120, k: 'review', lit: 1, text: ['WOULDN\'T', 'SHUT UP.'] },
  { rx: 210, k: 'skull' }, { rx: 395, k: 'plaque' }, { rx: 560, k: 'review', lit: 0, text: ['GOT EATEN.', 'BY THE TOUR.'] },
  { rx: 690, k: 'torch' },
];
const BOXES: Record<Piece['k'], [number, number, number, number]> = {
  review: [-48, -172, 96, 174], plaque: [-60, -180, 120, 182], welcome: [-120, -140, 240, 142], torch: [-10, -96, 20, 98], skull: [-14, -90, 28, 92],
};
const TORCHES = PIECES.filter(p => p.k === 'torch');
export const adventureBack = (c: Ctx, state: GameState) => {
  for (const p of PIECES) {
    const x = ARENA_L + p.rx, [bx, by, bw, bh] = BOXES[p.k];
    if (!seen(state, x + bx, x + bx + bw)) continue;
    const cv = bake(`rf4-ad-${p.k}-${p.rx}`, bw, bh, g => {
      g.translate(-bx, -by);
      if (p.k === 'review') paintReview(g, p.lit ?? 0, p.text ?? []);
      else if (p.k === 'plaque') paintPlaque(g);
      else if (p.k === 'welcome') paintWelcome(g);
      else if (p.k === 'torch') paintTorch(g);
      else paintSkullPole(g);
    });
    c.drawImage(cv, Math.round(x + bx), Math.round(GY - 2 + by));
  }
  for (let i = 0; i < TORCHES.length; i++) { const x = ARENA_L + TORCHES[i].rx; if (seen(state, x - 20, x + 20)) flame(c, x, GY - 2 - 92, state.frame, i, FIRE, 0.9); }
};

// (dev: the set pieces on a sheet)
export const adventureSheet = (g: Ctx) => {
  g.fillStyle = '#2A3020'; g.fillRect(0, 0, 1200, 600);
  g.drawImage(bake('rf4-ad-far', TW, TH, paintFar), 0, 0);
  g.save(); g.translate(0, 200); paintUnder(g, 0); g.restore();
  const at = (x: number, y: number, fn: () => void) => { g.save(); g.translate(x, y); fn(); g.restore(); };
  at(520, 420, () => paintReview(g, 1, ['HE TALKED THE', 'WHOLE TIME.'])); at(660, 420, () => paintPlaque(g)); at(840, 420, () => paintWelcome(g));
  at(990, 420, () => paintTorch(g)); at(1040, 420, () => paintSkullPole(g)); at(1120, 420, () => paintReview(g, 0, ['GOT EATEN.', 'BY THE TOUR.']));
  at(0, 420, () => { g.drawImage(bake('rf4-ad-sky', W, H, paintSky), 0, 0, 400, 300, 0, -300, 400, 300); });
};
