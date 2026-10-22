// The hub's far off, round the roundabout (painted into stamps by the hour; draw.ts puts them down): each land's
// landmark over its stretch the way the land itself has it now (the lands' own painters wherever there's one to call:
// Future Land's SPACE NEEDLE 2 and GIANT ATOM, the Wilderness's real Rockies and its painted plywood flats, Spooky Land's
// crags with Dracula's first castle, his OTHER CASTLE and the ELEVATOR TO HELL's clock tower, the CARTOON LAND water
// tower, the HAPPYWOOD hill with THRONES OF THE STARS, the Great Pixie's castle, the jungle's temple with the T. rex over
// its paddock fence, the World Showcase's mountain, castle and cathedral), and in front of them a busy band of each
// land's rides (Ferris wheels, coasters, drop towers, flags, tents, balloons...), so there's no bare sky over any of it.
// What moves (a wheel's cars, a coaster's train, smoke, the searchlights, the falls, birds) is drawn live over it,
// cheaply. Then the haze, the treeline round the park's edge, the monorail on its beam.
//
// The hub's one eye is the cylinder's middle: all of this is far enough off that it's flat.

import { INK, mix, hash, checker, box, R6, inked, type Ctx } from './kit';
import type { StretchId } from './stretch';
import { timeOfDay, farTint, skyAt, type TimeOfDay } from '../timeOfDay';
import { farCol, drawHill, farCoaster } from '../hollywood/blvd/far';
import { drawNeedle, drawGiantAtom } from '../space/square/sky';
import { piece, type Far } from '../space/farArt';
import { paintRockies, paintFlats, MH as ROCKIES_H, PH as FLATS_H } from '../frontier/wilds/far';
import { paintCrags } from '../spooky/town/sky';
import { drawTowerIntact } from '../walkAway/spookyTown';
import { drawTowerAt } from '../cartoon/monument';
import { drawCastleAt } from '../fantasy/monument';
import { drawRexStill } from '../adventure/dino/rex';
import { FAR_STILLS, cullStill } from '../foreign/backdrop';
import { signText } from '../signLetters';

/** The haze over something painted in it: painted into a canvas of its own, then washed toward the sky by k (only where
 *  it's painted), then put down. */
/** The landmarks, hazed, as painted (paintLandmark: by which, where, the hour, the scale and the part of it): kept across
 *  the hub's visits (the stage's stamps aren't), so walking back onto the hub doesn't paint them all over again. */
const HAZED = new Map<string, HTMLCanvasElement>();
const HAZED_MAX = 10;
/** Which landmark's being painted (paintLandmark), for HAZED. */
let hazeKey: string | null = null;
const hazed = (g: Ctx, x0: number, y0: number, w: number, h: number, k: number, tod: TimeOfDay, paint: (o: Ctx) => void) => {
  if (typeof document === 'undefined') return;
  const m = g.getTransform(), s = Math.max(1, Math.abs(m.a));
  const W = Math.ceil(w * s), H = Math.ceil(h * s);
  // (only the part of it that lands on the canvas it's going on (a big landmark pushed right in, mostly off it: the
  // hub's portal exit), in whole pixels of the full picture, so what's painted is the same pixels either way)
  let i0 = 0, i1 = W, j0 = 0, j1 = H;
  if (m.a > 0 && m.d > 0 && m.b === 0 && m.c === 0) {
    const sx = W / w, sy = H / h;
    i0 = Math.max(0, Math.floor(((-m.e / m.a) - x0) * sx) - 2); i1 = Math.min(W, Math.ceil(((g.canvas.width - m.e) / m.a - x0) * sx) + 2);
    j0 = Math.max(0, Math.floor(((-m.f / m.d) - y0) * sy) - 2); j1 = Math.min(H, Math.ceil(((g.canvas.height - m.f) / m.d - y0) * sy) + 2);
    if (i1 <= i0 || j1 <= j0) return;
  }
  // (just the whole ones at a whole scale (the hub's own view): none of a zoom's passing sizes)
  const ck = hazeKey && s === Math.round(s) && i0 === 0 && j0 === 0 && i1 === W && j1 === H ? `${hazeKey}|${tod.key}|${x0},${y0},${w},${h}|${s}` : null;
  let cv = ck ? HAZED.get(ck) : undefined;
  if (cv) { HAZED.delete(ck!); HAZED.set(ck!, cv); }
  else {
    cv = document.createElement('canvas'); cv.width = i1 - i0; cv.height = j1 - j0;
    const o = cv.getContext('2d')!;
    o.setTransform(s, 0, 0, s, -x0 * s - i0, -y0 * s - j0);
    paint(o);
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalCompositeOperation = 'source-atop'; o.globalAlpha = k; o.fillStyle = skyAt(0.86, tod); o.fillRect(0, 0, cv.width, cv.height);
    if (ck) { HAZED.set(ck, cv); if (HAZED.size > HAZED_MAX) HAZED.delete(HAZED.keys().next().value!); }
  }
  g.drawImage(cv, x0 + (i0 * w) / W, y0 + (j0 * h) / H, (cv.width * w) / W, (cv.height * h) / H);
};
const poly = (g: Ctx, pts: number[], col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };
/** A five-step far ramp round a color (deep .. highlight), for the hour and the distance. */
const rampT = (T: (c: string) => string, c: string) => [T(mix(c, '#1C1430', 0.5)), T(mix(c, '#1C1430', 0.26)), T(c), T(mix(c, '#F4E8D0', 0.24)), T(mix(c, '#FFFFFF', 0.45))];

// ---------------------------------------------------------------------------------------------------------------
// Ride kit (far off: small, flat-lit from the left, a row of dither at each step)

/** A Ferris wheel's still parts: the A-frame legs, the rim (two rings, spokes), its hub; the cars are live. */
const wheelFrame = (g: Ctx, x: number, foot: number, r: number, R: string[]) => {
  const cy = foot - r - 6;
  g.lineCap = 'butt';
  for (const s of [-1, 1]) { g.strokeStyle = R[0]; g.lineWidth = 3; g.beginPath(); g.moveTo(x + s * r * 0.55, foot); g.lineTo(x, cy); g.stroke(); g.strokeStyle = R[2]; g.lineWidth = 1; g.stroke(); }
  g.strokeStyle = R[1]; g.lineWidth = 1;
  g.beginPath(); for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; g.moveTo(x, cy); g.lineTo(x + Math.cos(a) * r, cy + Math.sin(a) * r); } g.stroke();
  g.strokeStyle = R[0]; g.lineWidth = 3; g.beginPath(); g.arc(x, cy, r, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = R[3]; g.lineWidth = 1; g.beginPath(); g.arc(x, cy, r, Math.PI * 0.6, Math.PI * 1.6); g.stroke();
  g.strokeStyle = R[2]; g.beginPath(); g.arc(x, cy, r * 0.82, 0, Math.PI * 2); g.stroke();
  box(g, x - 3, cy - 3, 6, 6, R[0]); box(g, x - 2, cy - 2, 3, 3, R[4]);
  box(g, x - r * 0.7, foot - 4, r * 1.4, 4, R[1]); box(g, x - r * 0.7, foot - 4, r * 1.4, 1, R[3]);
};
/** Its cars going round (live). */
const wheelCars = (c: Ctx, x: number, foot: number, r: number, f: number, cols: string[], n = 12) => {
  const cy = foot - r - 6;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + f * 0.004, px = x + Math.cos(a) * r, py = cy + Math.sin(a) * r;
    c.fillStyle = cols[k % cols.length]; c.fillRect(Math.round(px - 2), Math.round(py), 4, 4);
  }
};
/** A coaster: lattice legs, its track (a lift, a drop, hills, a loop), ink under, lit along its top. */
const coaster = (g: Ctx, x0: number, x1: number, foot: number, h: number, R: string[], seed: number, loop = true) => {
  const yAt = (x: number) => { const u = (x - x0) / (x1 - x0); return foot - h * (u < 0.18 ? u / 0.18 : 0.25 + 0.55 * Math.abs(Math.cos((u - 0.18) * 7 + seed)) * (1 - u * 0.5)); };
  for (let x = x0 + 4; x < x1; x += 10) { const y = yAt(x); box(g, x, y, 2, foot - y, R[1]); if ((x / 10) % 2 < 1) { g.strokeStyle = R[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x + 10, foot); g.stroke(); } }
  g.strokeStyle = R[0]; g.lineWidth = 4; g.beginPath(); for (let x = x0; x <= x1; x += 3) g.lineTo(x, yAt(x)); g.stroke();
  g.strokeStyle = R[3]; g.lineWidth = 2; g.stroke();
  g.strokeStyle = R[4]; g.lineWidth = 1; g.beginPath(); for (let x = x0; x <= x1; x += 3) g.lineTo(x, yAt(x) - 1); g.stroke();
  if (loop) { const lx = x0 + (x1 - x0) * 0.66, ly = foot - h * 0.3; g.strokeStyle = R[0]; g.lineWidth = 4; g.beginPath(); g.arc(lx, ly, h * 0.22, 0, Math.PI * 2); g.stroke(); g.strokeStyle = R[3]; g.lineWidth = 2; g.stroke(); }
  return yAt;
};
/** A drop tower: a lattice mast, its top crown, the ring of seats (live goes up and down: here at the foot). */
const dropTower = (g: Ctx, x: number, foot: number, h: number, R: string[], cap: string) => {
  box(g, x - 4, foot - h, 8, h, R[0]); box(g, x - 3, foot - h, 6, h, R[2]); box(g, x - 3, foot - h, 2, h, R[3]);
  for (let y = foot - h + 4; y < foot; y += 6) box(g, x - 3, y, 6, 1, R[1]);
  box(g, x - 7, foot - h - 6, 14, 6, R[0]); box(g, x - 6, foot - h - 5, 12, 4, cap); box(g, x - 6, foot - h - 5, 4, 2, mix(cap, '#FFFFFF', 0.4));
  box(g, x - 1, foot - h - 14, 2, 8, R[1]);
};
/** A big top or a striped tent. */
const tent = (g: Ctx, x: number, foot: number, w: number, h: number, a: string, b: string, T: (c: string) => string) => {
  const n = 6;
  for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n; poly(g, [x - w / 2 + u0 * w, foot - h * 0.45, x, foot - h, x - w / 2 + u1 * w, foot - h * 0.45], T(i % 2 ? a : b)); }
  box(g, x - w / 2, foot - h * 0.45, w, h * 0.45, T(mix(b, '#000000', 0.12)));
  for (let k = 0; k < 6; k++) box(g, x - w / 2 + (k * w) / 6, foot - h * 0.45, w / 12, h * 0.45, T(a));
  box(g, x - w / 2, foot - h * 0.45, w, 2, T(mix(a, '#000000', 0.3)));
  box(g, x - 1, foot - h - 8, 2, 8, T('#57534E')); poly(g, [x + 1, foot - h - 8, x + 9, foot - h - 6, x + 1, foot - h - 4], T(a));
};
/** A flag on a pole (still: the far ones barely move). */
const pennant = (g: Ctx, x: number, foot: number, h: number, col: string, T: (c: string) => string) => {
  box(g, x, foot - h, 1, h, T('#57534E')); poly(g, [x + 1, foot - h, x + 10, foot - h + 3, x + 1, foot - h + 6], T(col));
};
/** A row of trees along a foot (the stretch's own kind of tree, far off). */
const farTrees = (g: Ctx, x0: number, x1: number, foot: number, R: string[], kind: 'round' | 'pine' | 'palm' | 'dead' | 'cypress' | 'lolly', seed: number) => {
  for (let x = x0; x < x1; x += 9 + hash(x * 0.3 + seed) * 10) {
    const h = 12 + hash(x + seed) * 14;
    if (kind === 'pine') { for (let k = 0; k < 3; k++) { const w = 7 - k * 2, y = foot - k * h * 0.3; poly(g, [x - w, y, x, y - h * 0.5, x + w, y], R[k === 2 ? 2 : 1]); box(g, x - w + 1, y - 2, 2, 1, R[3]); } }
    else if (kind === 'palm') { box(g, x, foot - h * 1.4, 1, h * 1.4, R[0]); for (let k = -2; k <= 2; k++) poly(g, [x, foot - h * 1.4, x + k * 5, foot - h * 1.4 + 3 + Math.abs(k), x + k * 4, foot - h * 1.4 + 1], R[2]); }
    else if (kind === 'dead') { g.strokeStyle = R[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, foot); g.lineTo(x, foot - h); g.moveTo(x, foot - h * 0.6); g.lineTo(x - 5, foot - h * 0.9); g.moveTo(x, foot - h * 0.7); g.lineTo(x + 4, foot - h); g.stroke(); }
    else if (kind === 'cypress') { g.fillStyle = R[1]; g.beginPath(); g.ellipse(x, foot - h * 0.7, 3, h * 0.7, 0, 0, Math.PI * 2); g.fill(); box(g, x - 2, foot - h, 1, h * 0.8, R[2]); }
    else if (kind === 'lolly') { box(g, x, foot - h, 1, h, R[0]); g.fillStyle = R[(Math.floor(hash(x) * 3)) + 1]; g.beginPath(); g.arc(x, foot - h, 5, 0, Math.PI * 2); g.fill(); box(g, x - 3, foot - h - 3, 2, 2, R[4]); }
    else { g.fillStyle = R[1]; g.beginPath(); g.arc(x, foot - h * 0.6, h * 0.5, 0, Math.PI * 2); g.fill(); g.fillStyle = R[2]; g.beginPath(); g.arc(x - h * 0.12, foot - h * 0.7, h * 0.33, 0, Math.PI * 2); g.fill(); box(g, x - h * 0.3, foot - h * 0.85, 2, 2, R[3]); }
  }
  box(g, x0, foot - 1, x1 - x0, 4, R[1]);
};

// ---------------------------------------------------------------------------------------------------------------
// The landmarks (each round its spot's middle x, its foot on Y; the stamp's box is x-270..x+270, Y-340..Y+10)

export const LANDMARK_BOX = { x: -270, y: -440, w: 540, h: 450 } as const;
/** Each land's landmark's box (as tight as it goes: what's put down every frame is its area). */
export const landmarkBox = (id: StretchId) => { const top = id === 'space' ? -440 : id === 'fantasy' ? -400 : id === 'spooky' ? -330 : id === 'hollywood' ? -370 : -320; return { x: -270, y: top, w: 540, h: 10 - top }; };

/** Dracula's OTHER CASTLE as the town has it, far off: lilac-gray dressed stone in courses, battlements, the keep's
 *  purple slate spike and its red flag, the round towers' candle-snuffer roofs, the bat banners, pointed windows lit red
 *  after dark, ivy, the big oak door between its torches. */
const otherCastle = (g: Ctx, x: number, Y: number, tod: TimeOfDay) => {
  const T = farCol(tod, 0.18);
  const S = ['#1E1830', '#2A2238', '#3E3452', '#584C6E', '#766A8C', '#968AAA', '#B8AECA'].map(c => T(mix(c, '#2E1E40', 0.12)));
  const P = ['#1A0A2E', '#2A1048', '#3B0764', '#561A8A', '#7A3AAE'].map(T);
  const glow = tod.lamps > 0.3, win = glow ? T('#9A3A22') : S[1], win2 = glow ? T('#E07A3A') : S[2];
  const wl = x - 78, wr = x + 78, top = Y - 78;
  // (the keep behind the wall, up the middle: coursed, its two lancets, its battlements, the purple spike, the flag)
  const kx = x - 22, kw = 44, kt = Y - 150;
  box(g, kx - 1, kt - 1, kw + 2, Y - kt, INK);
  for (let y = kt, r = 0; y < top; y += 5, r++) for (let xx = kx + (r % 2) * 4; xx < kx + kw; xx += 8) { box(g, xx, y, Math.min(7, kx + kw - xx), 4, S[hash(xx + y) > 0.6 ? 4 : 3]); box(g, xx, y, Math.min(7, kx + kw - xx), 1, S[5]); }
  box(g, kx, kt, 4, top - kt, S[5]); box(g, kx + kw - 6, kt, 6, top - kt, S[2]);
  for (const lx of [kx + 12, kx + 28]) { box(g, lx - 1, kt + 18, 6, 18, INK); poly(g, [lx - 1, kt + 18, lx + 2, kt + 13, lx + 5, kt + 18], INK); box(g, lx, kt + 19, 4, 16, win); if (glow) box(g, lx, kt + 19, 1, 16, win2); }
  for (let xx = kx - 3; xx < kx + kw + 3; xx += 8) { box(g, xx - 1, kt - 8, 7, 9, INK); box(g, xx, kt - 7, 5, 7, S[4]); box(g, xx, kt - 7, 5, 1, S[6]); }
  poly(g, [kx - 6, kt - 6, kx + kw / 2, kt - 62, kx + kw + 6, kt - 6], INK);
  poly(g, [kx - 4, kt - 7, kx + kw / 2, kt - 59, kx + kw + 4, kt - 7], P[2]);
  poly(g, [kx - 4, kt - 7, kx + kw / 2, kt - 59, kx + kw / 2, kt - 7], P[3]);
  poly(g, [kx - 4, kt - 7, kx + kw / 2, kt - 59, kx + kw * 0.22, kt - 7], P[4]);
  for (let y = kt - 52; y < kt - 8; y += 5) { const k = (y - (kt - 59)) / 52; box(g, kx + kw / 2 - k * (kw / 2 + 4), y, k * (kw + 8), 1, P[1]); }
  box(g, kx + kw / 2 - 1, kt - 82, 2, 24, INK);
  poly(g, [kx + kw / 2 + 1, kt - 82, kx + kw / 2 + 18, kt - 78, kx + kw / 2 + 13, kt - 74, kx + kw / 2 + 18, kt - 70, kx + kw / 2 + 1, kt - 72], T('#7F1D1D'));
  poly(g, [kx + kw / 2 + 1, kt - 82, kx + kw / 2 + 18, kt - 78, kx + kw / 2 + 1, kt - 78], T('#B91C1C'));
  // (the round towers at the wall's ends: candle-snuffer roofs)
  for (const [tx, th] of [[wl - 6, 100], [wr + 6, 112]] as const) {
    const tw = 26, tt = Y - th;
    box(g, tx - tw / 2 - 1, tt - 1, tw + 2, th + 1, INK);
    for (let u = 0; u < tw; u += 2) box(g, tx - tw / 2 + u, tt, 2, th, S[u < 4 ? 5 : u < 10 ? 4 : u < 18 ? 3 : u < 22 ? 2 : 1]);
    for (let y = tt + 5; y < Y; y += 5) checker(g, tx - tw / 2, y, tw, 1, S[1]);
    for (const wy of [tt + 20, tt + 48]) { box(g, tx - 2, wy, 4, 9, INK); box(g, tx - 1, wy + 1, 2, 7, win); }
    poly(g, [tx - tw / 2 - 5, tt + 1, tx, tt - 46, tx + tw / 2 + 5, tt + 1], INK);
    poly(g, [tx - tw / 2 - 3, tt, tx, tt - 43, tx + tw / 2 + 3, tt], P[2]); poly(g, [tx - tw / 2 - 3, tt, tx, tt - 43, tx - 3, tt], P[4]); poly(g, [tx + 6, tt, tx, tt - 43, tx + tw / 2 + 3, tt], P[1]);
    box(g, tx - 1, tt - 52, 2, 10, INK);
  }
  // (the curtain wall: dressed stone in courses, each block its own tone, lit along its top; battlements; pilasters)
  box(g, wl - 1, top - 1, wr - wl + 2, Y - top + 1, INK);
  for (let y = top, r = 0; y < Y; y += 6, r++) for (let xx = wl + (r % 2 ? -5 : 0); xx < wr; xx += 11) {
    const a = Math.max(wl, xx), b = Math.min(wr, xx + 11), t = hash(xx * 0.13 + y * 0.71);
    box(g, a, y, b - a - 1, 5, S[t > 0.75 ? 4 : t > 0.3 ? 3 : 2]); box(g, a, y, b - a - 1, 1, S[5]);
  }
  box(g, wl, top, 5, Y - top, S[5]); checker(g, wl, Y - 18, wr - wl, 9, S[1]); box(g, wl, Y - 9, wr - wl, 9, S[1]);
  for (let xx = wl; xx < wr; xx += 15) { box(g, xx - 1, top - 10, 10, 10, INK); box(g, xx, top - 9, 8, 9, S[3]); box(g, xx, top - 9, 8, 1, S[5]); box(g, xx + 6, top - 9, 2, 9, S[1]); }
  for (const px of [x - 40, x + 30]) { box(g, px, top, 6, Y - top, S[4]); box(g, px, top, 1, Y - top, S[5]); box(g, px + 5, top, 2, Y - top, S[1]); }
  // (the bat banners, hung from their rods, tails cut)
  for (const bx of [x - 58, x + 54]) {
    box(g, bx - 8, top + 10, 16, 1, INK);
    poly(g, [bx - 6, top + 11, bx + 6, top + 11, bx + 6, top + 54, bx, top + 48, bx - 6, top + 54], INK);
    poly(g, [bx - 5, top + 11, bx + 5, top + 11, bx + 5, top + 52, bx, top + 47, bx - 5, top + 52], T('#7F1D1D'));
    box(g, bx - 5, top + 11, 2, 40, T('#991B1B')); box(g, bx + 3, top + 11, 2, 40, T('#5A1010'));
    box(g, bx - 5, top + 14, 10, 1, T('#D09A30'));
    poly(g, [bx, top + 26, bx - 2, top + 24, bx - 5, top + 23, bx - 4, top + 27, bx - 1, top + 28, bx, top + 31, bx + 1, top + 28, bx + 4, top + 27, bx + 5, top + 23, bx + 2, top + 24], INK);
  }
  // (pointed windows along the wall, lit red after dark)
  for (const wx of [x - 26, x - 8, x + 12]) { box(g, wx - 1, top + 16, 7, 16, INK); poly(g, [wx - 1, top + 16, wx + 2.5, top + 11, wx + 6, top + 16], INK); box(g, wx, top + 17, 5, 14, win); box(g, wx + 2, top + 17, 1, 14, INK); }
  // (the door: a big pointed arch, its voussoirs, oak planks studded with iron, open a crack; the torches either side)
  const dl = x - 12, dr = x + 12, dt = Y - 30;
  poly(g, [dl - 4, Y, dl - 4, dt, x, dt - 12, dr + 4, dt, dr + 4, Y], INK);
  poly(g, [dl - 3, Y, dl - 3, dt, x, dt - 11, dr + 3, dt, dr + 3, Y], S[5]);
  poly(g, [dl, Y, dl, dt + 1, x, dt - 7, dr, dt + 1, dr, Y], T('#4A2E1A'));
  for (let xx = dl + 4; xx < dr; xx += 4) box(g, xx, dt - 4, 1, 34, T('#2E1A0E'));
  for (const yy of [dt + 6, Y - 8]) box(g, dl, yy, dr - dl, 2, T('#36344E'));
  box(g, x + 3, dt - 2, 2, 32, '#050308');
  for (const tx of [dl - 9, dr + 7]) { box(g, tx, Y - 24, 3, 6, INK); box(g, tx, Y - 28, 3, 4, glow ? '#F59E0B' : T('#B45309')); }
  // (ivy up the wall's foot)
  for (let k = 0; k < 4; k++) { const ix = wl + 6 + k * 41; for (let y = Y - 2; y > Y - 26 - k * 7; y -= 2) box(g, ix + Math.sin(y * 0.3 + k) * 2, y, 2, 2, (y >> 1) % 3 ? T('#1E3A1E') : T('#2E5A26')); }
};

/** The jungle's temple, far: stepped, its top broken off, carved glyphs, moss and vines down it, a dark doorway. */
const jungleTemple = (g: Ctx, x: number, Y: number, T: (c: string) => string) => {
  const S = rampT(T, '#9A9488'), M = rampT(T, '#4D7C0F');
  for (let k = 0; k < 7; k++) {
    const w = 170 - k * 20, h = 18, y = Y - 20 - (k + 1) * h, x0 = x - w / 2;
    box(g, x0 - 1, y - 1, w + 2, h + 1, INK);
    for (let xx = x0, r = 0; xx < x0 + w; xx += 12, r++) { const t = hash(xx * 0.7 + k * 13); box(g, xx, y, Math.min(11, x0 + w - xx), h - 1, S[t > 0.7 ? 3 : t > 0.25 ? 2 : 1]); box(g, xx, y, Math.min(11, x0 + w - xx), 1, S[4]); }
    box(g, x0, y, 6, h, S[3]); box(g, x0 + w - 10, y, 10, h, S[1]);
    for (let xx = x0 + 10; xx < x0 + w - 12; xx += 22) { box(g, xx, y + 5, 6, 6, S[0]); box(g, xx + 1, y + 6, 2, 2, S[3]); }
    checker(g, x0, y, w, 3, M[2]);
    for (let xx = x0 + 4; xx < x0 + w; xx += 9 + hash(xx) * 14) box(g, xx, y, 2, 4 + hash(xx * 3) * 8, M[1]);
  }
  // (the stair up its middle)
  const sx = x - 14;
  for (let y = Y - 20 - 7 * 18; y < Y - 20; y += 3) { box(g, sx, y, 28, 2, S[3]); box(g, sx, y + 2, 28, 1, S[0]); }
  box(g, sx - 2, Y - 20 - 7 * 18, 2, 7 * 18, INK); box(g, sx + 28, Y - 20 - 7 * 18, 2, 7 * 18, INK);
  // (its broken top: the shrine's walls in a ragged line, the doorway dark, a glow in it after dark)
  const ty = Y - 20 - 7 * 18;
  poly(g, [x - 34, ty, x - 34, ty - 26, x - 20, ty - 34, x - 6, ty - 22, x + 10, ty - 30, x + 34, ty - 18, x + 34, ty], INK);
  poly(g, [x - 33, ty, x - 33, ty - 25, x - 20, ty - 32, x - 6, ty - 21, x + 10, ty - 29, x + 33, ty - 17, x + 33, ty], S[2]);
  box(g, x - 33, ty - 25, 6, 25, S[3]);
  box(g, x - 8, ty - 18, 16, 18, INK); box(g, x - 6, ty - 16, 12, 16, timeOfDay().lamps > 0.3 ? T('#F59E0B') : S[0]);
  for (let k = 0; k < 6; k++) { const vx = x - 60 + k * 23; for (let y = ty + 10 + k * 4; y < Y - 30 - (k % 3) * 14; y += 2) box(g, vx + Math.sin(y * 0.2 + k) * 2, y, 2, 2, (y >> 1) % 3 ? M[1] : M[2]); }
};

/** Germany's castle hill, Japan's mountain and France's cathedral, the World Showcase's own (FAR_STILLS), side by side,
 *  each windowed to where its landmark is. */
const showcase = (g: Ctx, x: number, Y: number, tod: TimeOfDay) => {
  const one = (id: 'japan' | 'germany' | 'france' | 'uk', s: number, cx: number, ax: number, aw: number) => {
    const S = FAR_STILLS[id];
    if (!S) return;
    g.save(); g.beginPath(); g.rect(cx - (aw * s) / 2, Y - S.h * s - 10, aw * s, S.h * s + 20); g.clip();
    g.translate(cx - ax * s, Y - S.h * s); g.scale(s, s);
    // (just its window's worth: the rest of the still was painted only to be clipped off)
    cullStill(ax - aw / 2 - 4, ax + aw / 2 + 4);
    try { S.paint(g, farCol(tod, S.k * 0.5), tod); } finally { cullStill(-Infinity, Infinity); }
    g.restore();
  };
  one('japan', 0.62, x + 10, 480, 640);
  one('germany', 0.5, x - 160, 450, 420);
  one('france', 0.5, x + 170, 520, 440);
  one('uk', 0.42, x + 70, 300, 200);
};

export const paintLandmark = (g: Ctx, id: StretchId, x: number, Y: number) => {
  hazeKey = id;
  try { paintLandmarkNow(g, id, x, Y); } finally { hazeKey = null; }
};
const paintLandmarkNow = (g: Ctx, id: StretchId, x: number, Y: number) => {
  const tod = timeOfDay(), night = tod.lamps;
  const L = LANDMARK_BOX;
  switch (id) {
    case 'space': hazed(g, x + L.x, Y + L.y, L.w, L.h, 0.16, tod, o => {
      const F: Far = { T: farCol(tod, 0.4), night, s: 0.8, glass: '#9CC8E8' };
      piece(o, F, 'orbitron', x - 200, Y - 6, 3); piece(o, F, 'hotel', x + 200, Y - 6, 5); piece(o, F, 'radar', x + 252, Y - 4, 6);
      piece(o, F, 'spire', x - 240, Y - 4, 8); piece(o, F, 'geo', x - 40, Y - 4, 2); piece(o, F, 'dome', x + 150, Y - 2, 9);
      drawGiantAtom(o, x - 110, Y - 190, 0.56, 0);
      drawNeedle(o, x + 74, Y, 0.62, 0);
    }); return;
    case 'frontier': hazed(g, x + L.x, Y + L.y, L.w, L.h, 0.1, tod, o => {
      o.save(); o.translate(x - 470, Y - ROCKIES_H * 1.05 - 30); o.scale(1.05, 1.05); paintRockies(o, tod); o.restore();
      o.save(); o.translate(x - 520, Y - FLATS_H * 0.8 + 4); o.scale(0.8, 0.8); paintFlats(o, tod); o.restore();
      o.save(); o.translate(x + 40, Y); o.scale(1.5, 1.5); timberTumble(o, 0, 0, farCol(tod, 0.12)); o.restore();
      frontierTown(o, x - 140, Y, farCol(tod, 0.25), night);
    }); return;
    case 'spooky': hazed(g, x + L.x, Y + L.y, L.w, L.h, 0.08, tod, o => {
      o.save(); o.translate(x - 300, Y - 280 * 0.62 - 40); o.scale(0.62, 0.62); paintCrags(o, tod); o.restore();
      drawTowerIntact(o, x + 168, Y + 2, 0.5, 0);
      otherCastle(o, x - 60, Y, tod);
      farTrees(o, x - 270, x + 270, Y + 2, rampT(farCol(tod, 0.3), '#2A2238'), 'dead', 5);
    }); return;
    case 'cartoon': hazed(g, x + L.x, Y + L.y, L.w, L.h, 0.08, tod, o => toonland(o, x, Y, tod)); return;
    case 'hollywood': hazed(g, x + L.x, Y + L.y, L.w, L.h, 0.06, tod, o => {
      o.save(); o.translate(x - 10, Y - 50); o.scale(0.92, 0.92); drawHill(o, 0, 0, 0); o.restore();
      hollywoodLot(o, x, Y, farCol(tod, 0.3), night);
      o.save(); o.beginPath(); o.rect(x + 40, Y - 330, 240, 340); o.clip(); farCoaster(o, x + 190, Y - 4, 0.36, farCol(tod, 0.25)('#B91C1C')); o.restore();
    }); return;
    case 'fantasy': hazed(g, x + L.x, Y + L.y, L.w, L.h, 0.04, tod, o => {
      fairyHills(o, x, Y, tod);
      drawCastleAt(o, x + 10, Y + 8, 0.82, 0);
    }); return;
    case 'adventure': hazed(g, x + L.x, Y + L.y, L.w, L.h, 0.08, tod, o => jungle(o, x, Y, tod)); return;
    case 'foreign': hazed(g, x + L.x, Y + L.y, L.w, L.h, 0.06, tod, o => showcase(o, x, Y, tod)); return;
    default:
  }
};

/** TIMBER TUMBLE: the fiberglass mountain the log flume comes down, on trestles, the splash at its foot; a water tank,
 *  a windmill. */
const timberTumble = (g: Ctx, x: number, Y: number, T: (c: string) => string) => {
  const R = rampT(T, '#B0805A'), W = rampT(T, '#4CA8D8'), Tr = rampT(T, '#8A6A44');
  const ridge = (u: number) => Y - 20 - 120 * Math.max(0, 1 - Math.abs(u) ** 1.4) - 12 * Math.sin(u * 9);
  g.fillStyle = R[2]; g.beginPath(); g.moveTo(x - 110, Y); for (let k = -110; k <= 110; k += 4) g.lineTo(x + k, ridge(k / 110)); g.lineTo(x + 110, Y); g.closePath(); g.fill();
  for (let k = -110; k < 0; k += 4) box(g, x + k, ridge(k / 110), 4, 6, R[4]);
  for (let k = 0; k < 110; k += 4) box(g, x + k, ridge(k / 110), 4, 14, R[1]);
  for (let k = -100; k < 100; k += 14) { const y = ridge(k / 110) + 14 + hash(k) * 30; box(g, x + k, y, 8, 3, R[3]); box(g, x + k, y + 3, 8, 1, R[0]); }
  for (let k = -96; k < 96; k += 22) { g.fillStyle = rampT(T, '#2F5A2A')[1]; g.beginPath(); g.arc(x + k, ridge(k / 110) + 30, 6, 0, Math.PI * 2); g.fill(); }
  // (the flume: a trough down the face on trestles, the water in it, the splash)
  const fy = (u: number) => Y - 128 + u * 108 + Math.sin(u * 5) * 6;
  for (let u = 0; u <= 1; u += 0.08) { const fx = x - 30 + u * 140, y = fy(u); box(g, fx - 1, y + 3, 2, Y - y, Tr[0]); g.strokeStyle = Tr[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(fx, y + 6); g.lineTo(fx + 11, Y); g.stroke(); }
  g.strokeStyle = Tr[0]; g.lineWidth = 5; g.beginPath(); for (let u = 0; u <= 1; u += 0.05) g.lineTo(x - 30 + u * 140, fy(u)); g.stroke();
  g.strokeStyle = W[3]; g.lineWidth = 2; g.stroke();
  for (let k = 0; k < 6; k++) { g.fillStyle = W[4]; g.beginPath(); g.arc(x + 112 + (k - 3) * 4, Y - 6 - (k % 2) * 4, 3 + (k % 3), 0, Math.PI * 2); g.fill(); }
  // (the water tank on its legs, the windmill on its lattice)
  const wx = x + 230;
  for (const lx of [-8, 8]) box(g, wx + lx - 1, Y - 50, 2, 50, Tr[0]);
  box(g, wx - 13, Y - 74, 26, 24, Tr[2]); box(g, wx - 13, Y - 74, 5, 24, Tr[3]); box(g, wx + 7, Y - 74, 6, 24, Tr[1]);
  for (let k = 0; k < 3; k++) box(g, wx - 13, Y - 70 + k * 8, 26, 1, T('#3A3A3A'));
  poly(g, [wx - 16, Y - 74, wx, Y - 86, wx + 16, Y - 74], Tr[1]);
};
/** The Wilderness's town far off: false fronts' backs, the white church and its steeple, the mill's stack, poles. */
const frontierTown = (g: Ctx, x: number, Y: number, T: (c: string) => string, night: number) => {
  const W = rampT(T, '#A07444'), C = rampT(T, '#F2EEE4');
  for (let k = 0; k < 6; k++) {
    const fx = x - 110 + k * 30, h = 26 + hash(k * 3) * 16, w = 26;
    box(g, fx, Y - h, w, h, W[k % 2 ? 2 : 1]); box(g, fx, Y - h, 3, h, W[3]); box(g, fx + w * 0.25, Y - h - 6, w * 0.5, 6, W[1]);
    for (let wx = fx + 4; wx < fx + w - 4; wx += 8) box(g, wx, Y - h + 8, 4, 5, night > 0.3 && hash(wx) > 0.4 ? T('#F0A83E') : W[0]);
  }
  // (the church: white boards, the steeple, its bell window)
  const cx = x + 90;
  box(g, cx - 16, Y - 36, 32, 36, C[2]); box(g, cx - 16, Y - 36, 4, 36, C[4]); box(g, cx + 10, Y - 36, 6, 36, C[1]);
  poly(g, [cx - 19, Y - 36, cx, Y - 52, cx + 19, Y - 36], C[1]);
  box(g, cx - 6, Y - 76, 12, 30, C[2]); box(g, cx - 6, Y - 76, 3, 30, C[4]); box(g, cx - 2, Y - 70, 4, 6, C[0]);
  poly(g, [cx - 8, Y - 76, cx, Y - 100, cx + 8, Y - 76], C[1]); box(g, cx, Y - 108, 1, 8, C[0]); box(g, cx - 2, Y - 106, 5, 1, C[0]);
  box(g, cx - 4, Y - 18, 8, 18, C[0]);
  // (the mill's stack, telegraph poles and their wires)
  box(g, x - 150, Y - 74, 8, 74, rampT(T, '#7A3424')[1]); box(g, x - 150, Y - 74, 2, 74, rampT(T, '#7A3424')[3]); box(g, x - 152, Y - 78, 12, 4, rampT(T, '#7A3424')[0]);
  for (let k = 0; k < 5; k++) { const px = x - 130 + k * 60; box(g, px, Y - 44, 1, 44, W[0]); box(g, px - 4, Y - 42, 9, 1, W[0]); }
  g.strokeStyle = W[0]; g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 4; k++) { const px = x - 130 + k * 60; g.moveTo(px, Y - 42); g.quadraticCurveTo(px + 30, Y - 36, px + 60, Y - 42); } g.stroke();
};
/** Cartoon Land far off: the rolling two-tone hills with faces, lollipop trees, a rainbow over them, a candy coaster,
 *  the CARTOON LAND water tower (the land's own monument). */
const toonland = (g: Ctx, x: number, Y: number, tod: TimeOfDay) => {
  const T = (c: string) => farTint(c, 0.5, tod);
  // (the rainbow: banded, inked edge, a cloud at each foot)
  for (const [i, col] of ['#EF4444', '#F97316', '#FDE047', '#4ADE80', '#60A5FA', '#A78BFA'].entries()) { g.strokeStyle = T(col); g.lineWidth = 6; g.beginPath(); g.arc(x - 20, Y - 30, 190 - i * 6, Math.PI * 1.02, Math.PI * 1.98); g.stroke(); }
  g.strokeStyle = T(INK); g.lineWidth = 1; g.beginPath(); g.arc(x - 20, Y - 30, 193, Math.PI * 1.02, Math.PI * 1.98); g.stroke();
  for (const cx of [x - 206, x + 166]) for (const [dx, dy, r] of [[0, 0, 14], [14, -6, 16], [28, 0, 12]] as const) { g.fillStyle = T(INK); g.beginPath(); g.arc(cx + dx, Y - 50 + dy, r + 1.5, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#FFFFFF'); g.beginPath(); g.arc(cx + dx, Y - 50 + dy, r, 0, Math.PI * 2); g.fill(); }
  // (the far hills, their faces)
  const H = ['#6CCC6A', '#3CAA4C', '#22803A'].map(T);
  for (const [hx, r, col] of [[x - 170, 80, H[0]], [x + 150, 96, H[0]], [x - 40, 110, H[1]]] as const) {
    g.fillStyle = T(INK); g.beginPath(); g.arc(hx, Y + 10, r + 2, Math.PI, 0); g.fill();
    g.fillStyle = col; g.beginPath(); g.arc(hx, Y + 10, r, Math.PI, 0); g.fill();
    g.fillStyle = mix(col, '#FFFFFF', 0.25); g.beginPath(); g.arc(hx - r * 0.3, Y + 10 - r * 0.25, r * 0.5, Math.PI, Math.PI * 1.6); g.fill();
    box(g, hx - 14, Y + 10 - r * 0.55, 5, 7, T(INK)); box(g, hx + 9, Y + 10 - r * 0.55, 5, 7, T(INK));
    g.strokeStyle = T(INK); g.lineWidth = 2; g.beginPath(); g.arc(hx, Y + 10 - r * 0.42, 10, 0.3, Math.PI - 0.3); g.stroke();
  }
  farTrees(g, x - 270, x + 270, Y + 4, ['#2E1A5A', '#F472B6', '#FDE047', '#FB923C', '#FFFFFF'].map(T), 'lolly', 3);
  // (a candy coaster round the right, a striped big top)
  coaster(g, x + 120, x + 268, Y - 4, 96, ['#4A060E', '#7A0E1C', '#DC3442', '#FFFFFF', '#FFF8C8'].map(T), 2);
  tent(g, x - 210, Y, 70, 60, '#DC3442', '#FFFFFF', T);
  drawTowerAt(g, x + 6, Y - 18, 0.92, 0);
};
/** The studio lot round the hill: soundstages with their numbers, the water tower, a painted sky backdrop on its 2x4s. */
const hollywoodLot = (g: Ctx, x: number, Y: number, T: (c: string) => string, night: number) => {
  const S = rampT(T, '#D6CDB8');
  for (const [sx, n] of [[x - 250, '3'], [x - 170, '5'], [x + 80, '9']] as const) {
    box(g, sx, Y - 54, 70, 54, S[2]); box(g, sx, Y - 54, 6, 54, S[3]); box(g, sx + 58, Y - 54, 12, 54, S[1]);
    poly(g, [sx - 2, Y - 54, sx + 35, Y - 64, sx + 72, Y - 54], S[1]);
    for (let xx = sx + 10; xx < sx + 60; xx += 10) box(g, xx, Y - 52, 1, 50, S[1]);
    box(g, sx + 22, Y - 46, 26, 18, S[4]); signText(g, n, sx + 35, Y - 31, { sx: 2, sy: 2, fill: T('#3F3F46') });
    box(g, sx + 8, Y - 20, 16, 20, S[0]);
  }
  // (the water tower)
  const wx = x - 100;
  for (const lx of [-10, 10]) box(g, wx + lx - 1, Y - 70, 2, 70, S[0]);
  box(g, wx - 16, Y - 98, 32, 30, S[3]); box(g, wx - 16, Y - 98, 6, 30, S[4]); box(g, wx + 8, Y - 98, 8, 30, S[1]);
  poly(g, [wx - 18, Y - 98, wx, Y - 110, wx + 18, Y - 98], S[1]);
  signText(g, 'HW', wx, Y - 78, { sx: 1, sy: 2, fill: T('#B91C1C') });
  // (a painted sky backdrop propped up on its 2x4s)
  const bx = x + 160;
  box(g, bx, Y - 70, 90, 60, T('#7AB6E8')); box(g, bx, Y - 40, 90, 30, T('#BEE0F4'));
  for (const [cx, cy] of [[bx + 20, Y - 58], [bx + 60, Y - 50]] as const) { g.fillStyle = T('#FFFFFF'); g.beginPath(); g.arc(cx, cy, 7, 0, Math.PI * 2); g.arc(cx + 9, cy - 2, 9, 0, Math.PI * 2); g.fill(); }
  box(g, bx, Y - 70, 90, 1, T(INK));
  for (const lx of [bx + 10, bx + 80]) { g.strokeStyle = T('#8A6A44'); g.lineWidth = 2; g.beginPath(); g.moveTo(lx, Y - 60); g.lineTo(lx + 16, Y); g.stroke(); }
  farTrees(g, x - 270, x + 270, Y + 2, rampT(T, '#3F7A3A'), 'palm', 7);
  void night;
};
/** Fairy Land far off: snowy hills, firs, a village, a far fairy wheel. */
const fairyHills = (g: Ctx, x: number, Y: number, tod: TimeOfDay) => {
  const T = farCol(tod, 0.3), H = rampT(T, '#6E7AA0'), Sn = rampT(T, '#ECF2FC');
  const y1 = (u: number) => Y - 60 - 40 * Math.sin(u * 2.4 + 1) - 14 * Math.sin(u * 7);
  g.fillStyle = H[2]; g.beginPath(); g.moveTo(x - 270, Y); for (let k = -270; k <= 270; k += 4) g.lineTo(x + k, y1(k / 100)); g.lineTo(x + 270, Y); g.closePath(); g.fill();
  for (let k = -270; k < 270; k += 4) { const y = y1(k / 100); box(g, x + k, y, 4, 8, y1((k + 4) / 100) < y ? Sn[2] : Sn[4]); }
  farTrees(g, x - 270, x + 270, Y - 4, rampT(T, '#2A5A4C'), 'pine', 9);
  wheelFrame(g, x - 200, Y - 6, 44, rampT(T, '#C8A0E0'));
};
/** The jungle: crowns heaped in the haze, the temple poking out of them, the falls off a cliff, the paddock's tall fence
 *  with PRE-HYSTERIC PARK over its gate and the T. rex (the land's own animatronic) looking over it. */
const jungle = (g: Ctx, x: number, Y: number, tod: TimeOfDay) => {
  const T = farCol(tod, 0.3), Lf = rampT(T, '#2F6B22');
  for (let k = -280; k < 280; k += 26) { const r = 20 + hash(k) * 16, y = Y - 40 - hash(k * 3) * 30; g.fillStyle = Lf[0]; g.beginPath(); g.arc(x + k, y, r, 0, Math.PI * 2); g.fill(); g.fillStyle = Lf[1]; g.beginPath(); g.arc(x + k - 3, y - 3, r * 0.8, 0, Math.PI * 2); g.fill(); g.fillStyle = Lf[2]; g.beginPath(); g.arc(x + k - 6, y - 7, r * 0.45, 0, Math.PI * 2); g.fill(); checker(g, x + k - r * 0.6, y - 2, r * 1.1, 2, Lf[2]); }
  jungleTemple(g, x - 30, Y, T);
  // (the paddock off to the left: a tall fence of posts and mesh, hazard striped, its sign; the rex over it)
  const px0 = x - 270, px1 = x - 90, fh = 64;
  g.save(); g.translate(x - 170, Y - 4); g.scale(0.62, 0.62); drawRexStill(g, 0, 0, 1, 0); g.restore();
  for (let fx = px0; fx <= px1; fx += 20) { box(g, fx - 2, Y - fh, 4, fh, INK); box(g, fx - 1, Y - fh, 2, fh, T('#8A929C')); box(g, fx - 3, Y - fh - 2, 6, 2, T('#E8B400')); }
  g.strokeStyle = T('#5A626C'); g.lineWidth = 1; g.beginPath(); for (let y = Y - fh + 6; y < Y; y += 8) { g.moveTo(px0, y); g.lineTo(px1, y); } g.stroke();
  box(g, px0, Y - fh, px1 - px0, 2, T('#3A4048'));
  for (let k = 0; k < 8; k++) box(g, px0 + 6 + k * 22, Y - 24, 10, 6, k % 2 ? T('#E8B400') : T('#1C1A1E'));
  const sx = x - 120;
  box(g, sx - 34, Y - fh - 22, 68, 18, INK); box(g, sx - 33, Y - fh - 21, 66, 16, T('#7C2D12'));
  signText(g, 'PRE-HYSTERIC', sx, Y - fh - 13, { sx: 1, sy: 1, fill: [T('#FFF6C0'), T('#FDE047'), T('#D07A1A')], dither: true });
  signText(g, 'PARK', sx, Y - fh - 6, { sx: 1, sy: 1, fill: T('#FDE047') });
};

/** America USA's: the biggest flag in the world on the biggest pole (its stripes in steps where they fold, its canton's
 *  stars), the gilt ball and a bald eagle on top of it, wings out. `f` the flag's wave. */
export const paintAmericaLandmark = (g: Ctx, x: number, Y: number, f: number) => {
  const tod = timeOfDay(), T = farCol(tod, 0.32);
  const P = rampT(T, '#C8C4BC');
  box(g, x - 5, Y - 310, 10, 310, INK); box(g, x - 4, Y - 310, 8, 310, P[2]); box(g, x - 4, Y - 310, 2, 310, P[4]); box(g, x + 2, Y - 310, 2, 310, P[1]);
  for (let y = Y - 300; y < Y; y += 40) box(g, x - 5, y, 10, 2, P[1]);
  const wave = (k: number) => Math.sin(f * 0.05 + k * 0.07) * 7, fold = (k: number) => Math.cos(f * 0.05 + k * 0.07);
  const red = rampT(T, '#C81E2E'), wht = rampT(T, '#F4F2EE'), blu = rampT(T, '#1E3A8A');
  for (let k = 0; k < 160; k += 4) {
    const s = fold(k), shade = s > 0.6 ? 3 : s > -0.2 ? 2 : 1;
    for (let r = 0; r < 13; r++) {
      const inCanton = k < 66 && r < 7, col = inCanton ? blu[shade] : (r % 2 ? wht : red)[shade];
      box(g, x + 5 + k, Y - 300 + r * 7 + wave(k), 4, 8, col);
    }
    if (k < 66) for (let r = 0; r < 7; r++) if ((k / 4 + r) % 2 === 0) box(g, x + 6 + k, Y - 298 + r * 7 + wave(k), 1, 1, wht[4]);
  }
  for (let k = 0; k < 160; k += 4) box(g, x + 5 + k, Y - 300 + wave(k) - 1, 4, 1, INK);
  // (the gilt ball, the eagle on it)
  const Au = rampT(T, '#D09A30');
  g.fillStyle = INK; g.beginPath(); g.arc(x, Y - 314, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = Au[2]; g.beginPath(); g.arc(x, Y - 314, 5, 0, Math.PI * 2); g.fill(); box(g, x - 3, Y - 317, 2, 2, Au[4]);
  const Br = rampT(T, '#6A3A12');
  poly(g, [x - 36, Y - 336, x - 20, Y - 330, x - 6, Y - 326, x, Y - 320, x + 6, Y - 326, x + 20, Y - 330, x + 36, Y - 336, x + 30, Y - 326, x + 10, Y - 318, x - 10, Y - 318, x - 30, Y - 326], INK);
  poly(g, [x - 34, Y - 335, x - 20, Y - 329, x - 6, Y - 325, x, Y - 321, x + 6, Y - 325, x + 20, Y - 329, x + 34, Y - 335, x + 28, Y - 327, x + 10, Y - 319, x - 10, Y - 319, x - 28, Y - 327], Br[2]);
  for (let k = 0; k < 4; k++) { box(g, x - 30 + k * 6, Y - 330 + k, 2, 4, Br[1]); box(g, x + 26 - k * 6, Y - 330 + k, 2, 4, Br[1]); }
  box(g, x - 4, Y - 330, 8, 10, Br[3]);
  g.fillStyle = INK; g.beginPath(); g.arc(x, Y - 334, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = wht[3]; g.beginPath(); g.arc(x, Y - 334, 4, 0, Math.PI * 2); g.fill();
  box(g, x + 3, Y - 335, 4, 2, rampT(T, '#F59E0B')[3]); box(g, x + 1, Y - 336, 1, 1, INK);
};

// ---------------------------------------------------------------------------------------------------------------
// The busy band in front: each stretch's rides and goings-on over the trees (foot on Y, x-270..x+270)

export const SKYLINE_BOX = { x: -270, y: -150, w: 540, h: 156 } as const;

export const paintSkyline = (g: Ctx, id: StretchId, x: number, Y: number) => {
  const tod = timeOfDay(), T = farCol(tod, 0.42);
  const R = (c: string) => rampT(T, c);
  switch (id) {
    case 'space':
      coaster(g, x - 260, x - 90, Y, 70, R('#E2E8F0'), 1);
      dropTower(g, x - 60, Y, 120, R('#CBD5E1'), T('#22BCAC'));
      wheelFrame(g, x + 190, Y, 46, R('#E8659E'));
      for (const [px, k] of [[x - 150, 'saucer'], [x + 60, 'spire'], [x + 250, 'dome']] as const) piece(g, { T, night: tod.lamps, s: 0.5, glass: '#9CC8E8' }, k, px, Y, 4);
      farTrees(g, x - 270, x + 270, Y, R('#22BCAC'), 'round', 1);
      return;
    case 'frontier':
      coaster(g, x - 250, x - 40, Y, 64, R('#8A5A32'), 3, false);
      tent(g, x + 60, Y, 60, 46, '#B91C1C', '#F2E6C4', T);
      for (let k = 0; k < 4; k++) pennant(g, x + 120 + k * 30, Y, 50, ['#DC2626', '#1E3A8A'][k % 2], T);
      { const C = R('#57534E'); box(g, x + 220, Y - 50, 30, 30, C[2]); box(g, x + 228, Y - 66, 10, 16, C[1]); box(g, x + 214, Y - 22, 46, 6, C[0]); }
      farTrees(g, x - 270, x + 270, Y, R('#2F5A2A'), 'pine', 2);
      return;
    case 'spooky':
      wheelFrame(g, x - 200, Y, 50, R('#4C3D5E'));
      dropTower(g, x + 40, Y, 110, R('#3B3049'), T('#86EFAC'));
      for (let k = 0; k < 5; k++) { const tx = x + 90 + k * 34, h = 30 + hash(k) * 30; box(g, tx, Y - h, 14, h, R('#3B3049')[1]); poly(g, [tx - 3, Y - h, tx + 7, Y - h - 18, tx + 17, Y - h], R('#2E2440')[1]); if (tod.lamps > 0.3) box(g, tx + 5, Y - h + 8, 4, 5, T('#BEF264')); }
      farTrees(g, x - 270, x + 270, Y, R('#2A2438'), 'dead', 3);
      return;
    case 'cartoon':
      wheelFrame(g, x - 190, Y, 52, R('#F472B6'));
      tent(g, x + 30, Y, 70, 54, '#86CAF4', '#FFFFFF', T);
      coaster(g, x + 100, x + 268, Y, 60, R('#9476DE'), 4);
      farTrees(g, x - 270, x + 270, Y, R('#4CC89C'), 'lolly', 4);
      return;
    case 'america':
      for (let k = 0; k < 9; k++) { const bx = x - 260 + k * 60, h = 40 + hash(k * 7) * 50; const C = R(['#B4533C', '#E8DCC4', '#7A9ABE'][k % 3]); box(g, bx, Y - h, 46, h, C[2]); box(g, bx, Y - h, 4, h, C[3]); box(g, bx + 38, Y - h, 8, h, C[1]); box(g, bx - 2, Y - h - 4, 50, 4, C[3]); for (let wy = Y - h + 8; wy < Y - 12; wy += 12) for (let wx = bx + 8; wx < bx + 40; wx += 12) box(g, wx, wy, 5, 6, tod.lamps > 0.3 && hash(wx + wy) > 0.5 ? T('#F0A83E') : C[0]); pennant(g, bx + 22, Y - h, 16, k % 2 ? '#DC2626' : '#1E3A8A', T); }
      return;
    case 'hollywood':
      dropTower(g, x - 220, Y, 116, R('#3F3F46'), T('#FACC15'));
      for (let k = 0; k < 3; k++) { const bx = x - 150 + k * 90; const C = R('#27272A'); box(g, bx, Y - 70, 70, 34, C[1]); box(g, bx + 2, Y - 68, 66, 30, T(['#B91C1C', '#1D4ED8', '#CA8A04'][k])); signText(g, ['NOW', 'SOON', 'HITS'][k], bx + 35, Y - 48, { sx: 1, sy: 1, fill: T('#FFFFFF') }); box(g, bx + 33, Y - 36, 4, 36, C[0]); }
      wheelFrame(g, x + 200, Y, 46, R('#E7E5E4'));
      farTrees(g, x - 270, x + 270, Y, R('#3F7A3A'), 'palm', 5);
      return;
    case 'fantasy':
      for (let k = 0; k < 4; k++) tent(g, x - 230 + k * 50, Y, 40, 40, ['#1D4ED8', '#B91C1C', '#CA8A04', '#15803D'][k], '#F8FAFC', T);
      wheelFrame(g, x + 80, Y, 48, R('#93C5FD'));
      dropTower(g, x + 220, Y, 100, R('#D6D3D1'), T('#2563EB'));
      farTrees(g, x - 270, x + 270, Y, R('#2A5A4C'), 'pine', 6);
      return;
    case 'adventure':
      coaster(g, x - 260, x - 70, Y, 60, R('#8A5A32'), 5, false);
      for (let k = 0; k < 3; k++) { const hx = x + 20 + k * 70; poly(g, [hx - 24, Y - 24, hx, Y - 50, hx + 24, Y - 24], R('#C8A050')[2]); box(g, hx - 18, Y - 24, 36, 24, R('#B4CC5C')[1]); }
      farTrees(g, x - 270, x + 270, Y, R('#3F6212'), 'palm', 7);
      return;
    case 'foreign':
      wheelFrame(g, x - 190, Y, 50, R('#E8ECEF'));
      for (let k = 0; k < 4; k++) { const bx = x - 90 + k * 80; const C = R(['#F2E6D0', '#B91C1C', '#2E7D5B', '#C8BFAE'][k]); box(g, bx, Y - 40, 50, 40, C[2]); box(g, bx, Y - 40, 4, 40, C[3]); if (k === 2) { g.fillStyle = C[2]; g.beginPath(); g.ellipse(bx + 25, Y - 48, 12, 14, 0, Math.PI, 0); g.fill(); } else poly(g, [bx - 4, Y - 40, bx + 25, Y - 58, bx + 54, Y - 40], C[1]); pennant(g, bx + 25, Y - 56, 20, ['#1E3A8A', '#DC2626', '#15803D', '#FACC15'][k], T); }
      farTrees(g, x - 270, x + 270, Y, R('#24502E'), 'cypress', 8);
      return;
    case 'staff':
      // (backstage: warehouse roofs, a cooling tower, a crane, the utility poles)
      for (let k = 0; k < 5; k++) { const bx = x - 250 + k * 100, C = R('#8A8680'); box(g, bx, Y - 40, 86, 40, C[1]); poly(g, [bx, Y - 40, bx + 43, Y - 52, bx + 86, Y - 40], C[2]); for (let v = bx + 10; v < bx + 80; v += 16) box(g, v, Y - 46, 4, 4, C[0]); }
      { const C = R('#B4B0A8'); poly(g, [x - 40, Y, x - 30, Y - 70, x + 30, Y - 70, x + 40, Y], C[2]); box(g, x - 30, Y - 70, 10, 70, C[3]); }
      { const C = R('#E8B400'); box(g, x + 120, Y - 130, 4, 130, C[1]); box(g, x + 70, Y - 130, 120, 4, C[2]); }
      return;
    default:
  }
};

/** Where each stretch's live bits are (the wheel's middle etc.), for drawFarLive. */
const WHEELS: Partial<Record<StretchId, [number, number, string[]]>> = {
  space: [190, 46, ['#22BCAC', '#F8FAFC', '#E8659E']], spooky: [-200, 50, ['#86EFAC', '#5B21B6']], cartoon: [-190, 52, ['#FDE047', '#60A5FA', '#F472B6', '#4ADE80']],
  hollywood: [200, 46, ['#DC2626', '#FACC15']], fantasy: [80, 48, ['#FACC15', '#F472B6', '#60A5FA']], foreign: [-190, 50, ['#DC2626', '#F8FAFC', '#1E40AF']],
};
/** What moves far off over each stretch (live, cheap): the wheel's cars, smoke and steam, searchlights, birds. */
export const drawFarLive = (c: Ctx, id: StretchId, x: number, Y: number, f: number) => {
  const tod = timeOfDay(), T = farCol(tod, 0.42);
  const w = WHEELS[id];
  if (w) wheelCars(c, x + w[0], Y + 34, w[1], f, w[2].map(T));
  switch (id) {
    case 'frontier': {
      // (the train's steam going along the far line, the mill's smoke)
      for (let k = 0; k < 5; k++) { const t = ((f * 0.4 + k * 20) % 100) / 100; c.fillStyle = `rgba(240, 236, 228, ${(0.5 * (1 - t)).toFixed(2)})`; c.beginPath(); c.arc(x - 290 + t * 14, Y - 80 - t * 40, 3 + t * 8, 0, Math.PI * 2); c.fill(); }
      return;
    }
    case 'hollywood': {
      for (const k of [-1, 1]) { const a = Math.sin(f * 0.015 + k * 1.3) * 0.5 + k * 0.15; c.fillStyle = 'rgba(254, 249, 195, 0.16)'; c.beginPath(); c.moveTo(x + k * 120, Y - 40); c.lineTo(x + k * 120 + Math.sin(a) * 300 - 12, Y - 40 - Math.cos(a) * 300); c.lineTo(x + k * 120 + Math.sin(a) * 300 + 12, Y - 40 - Math.cos(a) * 300); c.closePath(); c.fill(); }
      return;
    }
    case 'spooky': {
      for (let b = 0; b < 4; b++) { const bx = x - 100 + b * 50 + Math.sin(f * 0.04 + b * 2) * 30, by = Y - 200 + Math.cos(f * 0.06 + b) * 16, fl = (f >> 2) % 2 ? 3 : -2; c.fillStyle = '#1F1630'; c.beginPath(); c.moveTo(bx - 6, by + fl); c.lineTo(bx, by); c.lineTo(bx + 6, by + fl); c.lineTo(bx, by + 3); c.closePath(); c.fill(); }
      return;
    }
    case 'staff': {
      for (let k = 0; k < 4; k++) { const t = ((f * 0.3 + k * 25) % 100) / 100; c.fillStyle = `rgba(230, 230, 230, ${(0.4 * (1 - t)).toFixed(2)})`; c.beginPath(); c.arc(x + Math.sin(t * 4) * 6, Y + 70 - t * 50, 6 + t * 12, 0, Math.PI * 2); c.fill(); }
      return;
    }
    default:
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The park's edge: the treeline round it (stepped crowns), the monorail's beam and its pylons (stamped strips)

export const paintTreeline = (g: Ctx, x0: number, x1: number, top: number) => {
  const tod = timeOfDay(), T = (c: string) => farTint(c, 0.3, tod);
  const Lf = ['#16401E', '#1F5A2A', '#2F6B3A', '#3F8A4A', '#5AA05A'].map(T);
  // (the monorail's beam: concrete, banded, its lit top edge, the pylons down to the trees)
  const C = ['#6E6A62', '#8E8A82', '#B4B0A8', '#D6D3D1', '#F5F5F4'].map(T);
  for (let x = Math.floor(x0 / 160) * 160; x < x1; x += 160) {
    box(g, x - 5, top + 408, 10, 60, C[1]); box(g, x - 5, top + 408, 3, 60, C[3]); box(g, x + 2, top + 408, 3, 60, C[0]);
    box(g, x - 9, top + 406, 18, 4, C[0]);
    poly(g, [x - 5, top + 412, x - 14, top + 408, x + 14, top + 408, x + 5, top + 412], C[1]);
  }
  box(g, x0, top + 398, x1 - x0, 10, INK); box(g, x0, top + 399, x1 - x0, 8, C[2]); box(g, x0, top + 399, x1 - x0, 2, C[4]); box(g, x0, top + 405, x1 - x0, 2, C[1]);
  checker(g, x0, top + 401, x1 - x0, 2, C[3]);
  for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) box(g, x, top + 399, 1, 8, C[1]);
  // (the trees: heaped crowns, stepped, a row behind and a row in front)
  for (const [row, dy, rr] of [[0, 446, 18], [1, 458, 24]] as const) for (let x = Math.floor(x0 / 34) * 34 - 34; x < x1 + 34; x += 34) {
    const r = rr + hash(x * 0.37 + row) * 10, cx = x + hash(x + row * 9) * 14, cy = top + dy;
    g.fillStyle = Lf[0]; g.beginPath(); g.arc(cx, cy, r + 1, Math.PI, 0); g.fill();
    g.fillStyle = Lf[1 + row]; g.beginPath(); g.arc(cx, cy, r, Math.PI, 0); g.fill();
    g.fillStyle = Lf[2 + row]; g.beginPath(); g.arc(cx - r * 0.25, cy - r * 0.1, r * 0.62, Math.PI, 0); g.fill();
    checker(g, cx - r * 0.8, cy - r * 0.45, r * 1.2, 2, Lf[2 + row]);
    box(g, cx - r * 0.45, cy - r * 0.7, 3, 2, Lf[4]);
  }
  box(g, x0, top + 466, x1 - x0, 6, Lf[0]);
};

/** A cloud (stamped once per kind and hour): lumps on a flat foot, stepped (lit lumps up top, the shade under), inked
 *  soft by its own darkest step. */
export const paintCloud = (g: Ctx, kind: number, cols: string[]) => {
  const lumps = [[-34, 0, 16], [-8, -8, 22], [20, -4, 18], [44, 2, 12], [6, 2, 16]].map(([dx, dy, r], i) => [dx + (kind % 3) * (i - 2) * 2, dy, r + ((kind + i) % 3) * 2]);
  for (const [dx, dy, r] of lumps) { g.fillStyle = cols[0]; g.beginPath(); g.arc(dx, dy + 2, r + 1, Math.PI, 0); g.fill(); }
  for (const [dx, dy, r] of lumps) { g.fillStyle = cols[1]; g.beginPath(); g.arc(dx, dy + 2, r, Math.PI, 0); g.fill(); }
  for (const [dx, dy, r] of lumps) { g.fillStyle = cols[2]; g.beginPath(); g.arc(dx - 2, dy - 1, r * 0.78, Math.PI, 0); g.fill(); }
  for (const [dx, dy, r] of lumps) { g.fillStyle = cols[3]; g.beginPath(); g.arc(dx - 4, dy - 4, r * 0.42, Math.PI, 0); g.fill(); }
  for (const [dx, dy, r] of lumps) checker(g, dx - r * 0.7, dy - r * 0.3, r * 1.2, 2, cols[2]);
  box(g, -52, 0, 112, 4, cols[1]); box(g, -46, 2, 100, 2, cols[0]);
};

export { inked, R6 };

/** The park's blimp (stamped by the hour): its envelope banded lit to shade, fins, the gondola, HAPPY LAND down its
 *  side; its tail light blinks live. */
export const paintBlimp = (g: Ctx) => {
  const tod = timeOfDay(), T = (c: string) => farTint(c, 0.4, tod);
  const E = ['#5A6680', '#8A96B0', '#C4CCDC', '#E6EAF2', '#FFFFFF'].map(T);
  const shell = (rx: number, ry: number, dy: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(0, dy, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
  poly(g, [40, -2, 58, -14, 60, -2], E[1]); poly(g, [40, 2, 58, 14, 60, 2], E[0]);
  shell(51, 15, 0, INK); shell(50, 14, 0, E[1]); shell(48, 11, -2, E[2]); shell(44, 7, -4, E[3]); shell(30, 3, -7, E[4]);
  checker(g, -44, 4, 88, 2, E[1]);
  box(g, -46, -1, 92, 5, T('#DC2626')); box(g, -46, -1, 92, 1, T('#F87171'));
  signText(g, 'HAPPY LAND', 0, 4, { sx: 1, sy: 1, fill: T('#FFFFFF') });
  box(g, -10, 13, 20, 6, INK); box(g, -9, 14, 18, 4, E[2]); for (let k = 0; k < 4; k++) box(g, -7 + k * 4, 15, 2, 2, T('#1E3A5A'));
};
/** A hot-air balloon (stamped by kind and hour): the envelope in gores, its basket hung under. */
export const paintHotAir = (g: Ctx, kind: number) => {
  const tod = timeOfDay(), T = (c: string) => farTint(c, 0.45, tod);
  const P = [['#DC2626', '#FDE047'], ['#2563EB', '#F8FAFC'], ['#16A34A', '#F97316'], ['#9333EA', '#FDE047']][kind % 4];
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 15, 17, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 6; i++) { g.save(); g.beginPath(); g.ellipse(0, 0, 14, 16, 0, 0, Math.PI * 2); g.clip(); box(g, -14 + i * 5, -16, 5, 32, T(i % 2 ? P[0] : P[1])); g.restore(); }
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(-5, -6, 4, 7, 0, 0, Math.PI * 2); g.fill();
  checker(g, 4, -14, 8, 28, T('#1A1028'));
  poly(g, [-9, 12, 9, 12, 4, 20, -4, 20], T(P[0]));
  box(g, -4, 20, 1, 5, INK); box(g, 3, 20, 1, 5, INK); box(g, -4, 25, 8, 5, T('#8A5A32')); box(g, -4, 25, 8, 1, T('#B88A5A'));
};
