// Under the open river, the ride's own works (what the guests never see from the boat): the guide rail the launches run
// on (a steel I-beam on concrete footings, back along the bed), the cable tray strung beside it (its cables sagging,
// the junction boxes with their lights), the hippo's hydraulic mast up to where it bobs, the elephant's spray pump's
// intake, and what the guests have dropped over the side for twenty years (sunglasses, cameras, hats, a churro...).
// All of it on the floor planes running back (under.ts's projection: x and y at depth s), fogged into the green,
// drawn before the wobble so it sways with the rest of the water. Nothing here's stood on.

import type { GameState } from '../../../m1/game/core/state';
import { box, hash, mix, rampOf, INK } from '../../intro/art/kit';
import { signAt, stencil } from '../letters';
import { DOCK, FALLS, WS, bedAt } from './course';
import { R, viewOf, onScreen, pX, pY, unX, waterAt, stepCols, type Ctx, type V } from './under';

const S_RAIL = 0.9, S_TRAY = 0.85, S_JUNK = 0.95;
const A = DOCK + 30, B = FALLS.x - 40;
/** Fogged toward the open river's water, by depth (further back: more). */
const fogK = (s: number) => 0.25 + (1 - s) * 2.2;
const fog = (v: V, col: string, s: number) => mix(col, waterAt('open', 0.62, v.tod), Math.min(0.85, fogK(s)));
const fogR = (v: V, col: string, s: number) => rampOf(col).map(c2 => fog(v, c2, s));

/** The bed's y at depth s, under screen-world x (relative x back on that plane). */
const bedY = (v: V, s: number, wx: number) => pY(v, s, bedAt(wx));

// ---------------------------------------------------------------------------------------------------------------
// The guide rail and its footings

const drawRail = (c: Ctx, v: V) => {
  const s = S_RAIL, St = fogR(v, '#6A7078', s), Cn = fogR(v, '#8A8A80', s), rust = fog(v, '#8A4A22', s);
  const a = Math.max(pX(v, s, R(A)), v.l - 4), b = Math.min(pX(v, s, R(B)), v.r + 4);
  if (b <= a) return;
  // (the footings: every 96, a concrete block sunk in the silt, lit on its top and left, the rail's clip bolted on)
  for (let wx = Math.ceil((unX(v, s, a) - R(0)) / 96) * 96; R(wx) < unX(v, s, b) + 1; wx += 96) {
    const x = Math.round(pX(v, s, R(wx))), by = Math.round(bedY(v, s, wx)), ry = by - Math.round(16 * s);
    box(c, x - 6, ry, 13, by - ry + 4, INK); box(c, x - 5, ry + 1, 11, by - ry + 2, Cn[2]); box(c, x - 5, ry + 1, 2, by - ry + 2, Cn[3]); box(c, x + 4, ry + 1, 2, by - ry + 2, Cn[1]);
    box(c, x - 3, ry + 5, 2, 2, St[4]); box(c, x + 2, ry + 5, 2, 2, St[4]);
    if (hash(wx) > 0.6) box(c, x - 5, ry + 8, 11, 2, rust);
  }
  // (the rail itself: the top flange lit (the launches' guide wheels polish it), the web, the bottom flange, rust bleeding)
  // (two pixels a column; each band of every column gathered into one stepped outline (stepCols), the rust over them)
  const ink: number[] = [], b4: number[] = [], b3: number[] = [], b1: number[] = [], b2: number[] = [], rs: number[] = [];
  for (let x = Math.floor(a / 2) * 2; x < b; x += 2) {
    const wx = unX(v, s, x) - R(0), y = Math.round(bedY(v, s, wx)) - Math.round(22 * s);
    ink.push(x, y - 1, 11); b4.push(x, y, 2); b3.push(x, y + 2, 1); b1.push(x, y + 3, 4); b2.push(x, y + 7, 2);
    if (hash(Math.floor(wx / 6)) > 0.82) rs.push(x, y + 3, 3 + Math.floor(hash(wx) * 4));
  }
  stepCols(c, ink, 2, INK); stepCols(c, b4, 2, St[4]); stepCols(c, b3, 2, St[3]); stepCols(c, b1, 2, St[1]); stepCols(c, b2, 2, St[2]);
  stepCols(c, rs, 2, rust);
};

// ---------------------------------------------------------------------------------------------------------------
// The cable tray behind it: posts, the cables sagging between them (a bundle: black, yellow, the red one), the boxes

const drawTray = (c: Ctx, v: V) => {
  const s = S_TRAY, St = fogR(v, '#5A6068', s), f = v.f;
  const wa = unX(v, s, v.l - 40) - R(0), wb = unX(v, s, v.r + 40) - R(0);
  const cols = [fog(v, '#1A1A1A', s), fog(v, '#C8A020', s), fog(v, '#A02020', s)];
  for (let wx = Math.max(A, Math.floor(wa / 160) * 160); wx < Math.min(B, wb); wx += 160) {
    const x0 = Math.round(pX(v, s, R(wx))), x1 = Math.round(pX(v, s, R(wx + 160)));
    const y0 = Math.round(bedY(v, s, wx)), y1 = Math.round(bedY(v, s, wx + 160)), top = Math.round(46 * s);
    // (the post: a steel angle, its foot bolted to a pad)
    box(c, x0 - 2, y0 - top - 1, 5, top + 1, INK); box(c, x0 - 1, y0 - top, 3, top, St[2]); box(c, x0 - 1, y0 - top, 1, top, St[3]);
    box(c, x0 - 5, y0 - 2, 11, 3, St[1]); box(c, x0 - 6, y0 - top - 2, 13, 3, St[3]);
    // (the cables: each its own sag, stepped two pixels at a time)
    if (wx + 160 <= B) cols.forEach((col, k) => {
      const sag = 10 + k * 4 + (hash(wx + k) * 6 | 0), run: number[] = [];
      for (let x = x0 + 2; x < x1 - 1; x += 2) {
        const t = (x - x0) / (x1 - x0), y = Math.round(y0 - top + k * 2 + (y1 - y0) * t + sag * 4 * t * (1 - t));
        run.push(x, y, 2);
      }
      stepCols(c, run, 2, col);
    });
    // (every third post, a junction box: its door, the stencil, the light (blinking: it's still live, somehow))
    if (Math.round(wx / 160) % 3 === 1) {
      const jx = x0 + 6, jy = y0 - top + 8, J = fogR(v, '#7A8A6A', s);
      box(c, jx - 1, jy - 1, 26, 22, INK); box(c, jx, jy, 24, 20, J[2]); box(c, jx, jy, 24, 2, J[3]); box(c, jx + 22, jy, 2, 20, J[1]);
      box(c, jx + 2, jy + 4, 1, 14, J[0]);
      signAt(c, '480V', jx + 13, jy + 12, 5, stencil(5, fog(v, '#E8C030', s)));
      const on = (f + wx) % 80 < 40;
      box(c, jx + 18, jy + 15, 3, 3, on ? '#FF4030' : fog(v, '#5A1010', s));
      if (on) { c.fillStyle = 'rgba(255, 80, 60, 0.18)'; c.fillRect(jx + 14, jy + 11, 11, 11); }
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The hippo's mast and the elephant's pump

const HIPPO = 2380, PUMP = 2150;
const drawMast = (c: Ctx, v: V) => {
  const s = 0.91, St = fogR(v, '#7A8088', s), f = v.f;
  const x = Math.round(pX(v, s, R(HIPPO))), by = Math.round(bedY(v, s, HIPPO)), top = Math.round(pY(v, s, WS));
  if (!onScreen(v, x - 60, x + 60)) return;
  // (the base: a steel box on the rail, bolted down, the hydraulic unit on it, the hoses)
  const H = fogR(v, '#C8A030', s);
  box(c, x - 31, by - 37, 62, 38, INK); box(c, x - 30, by - 36, 60, 36, H[2]); box(c, x - 30, by - 36, 60, 3, H[3]); box(c, x + 26, by - 33, 4, 33, H[1]);
  for (let k = 0; k < 6; k++) box(c, x - 30 + k * 10, by - 8, 5, 8, k % 2 ? fog(v, '#1A1A14', s) : H[3]);
  signAt(c, 'HIPPO 1', x, by - 18, 5, stencil(5, fog(v, '#1A1A14', s)));
  // (the mast's cylinder, the chrome rod up out of it, bobbing with the hippo up there; cross-braced)
  const bob = ((f >> 4) % 2) * 3, rodTop = top - 6 + bob;
  box(c, x - 9, by - 140, 18, 104, INK); box(c, x - 8, by - 139, 16, 103, St[1]); box(c, x - 8, by - 139, 4, 103, St[2]); box(c, x + 5, by - 139, 3, 103, St[0]);
  for (let y = by - 130; y < by - 40; y += 24) { box(c, x - 9, y, 18, 3, INK); box(c, x - 8, y + 1, 16, 1, St[3]); }
  if (rodTop < by - 140) { box(c, x - 4, rodTop, 8, by - 140 - rodTop, INK); box(c, x - 3, rodTop, 6, by - 140 - rodTop, fog(v, '#D8E0E8', s * 0.98)); box(c, x - 3, rodTop, 2, by - 140 - rodTop, '#F0F6FA'); }
  // (the hoses off it, curling down into the base)
  c.strokeStyle = INK; c.lineWidth = 4;
  for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x + d * 8, by - 120); c.quadraticCurveTo(x + d * 30, by - 90, x + d * 22, by - 37); c.stroke(); }
  c.strokeStyle = fog(v, '#2A2A2A', s); c.lineWidth = 2;
  for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x + d * 8, by - 120); c.quadraticCurveTo(x + d * 30, by - 90, x + d * 22, by - 37); c.stroke(); }
  // (the oil weeping out of a fitting: a slick drifting up, now and then)
  if ((f >> 2) % 40 < 14) { const t = ((f >> 2) % 40) / 14; box(c, x + 10, by - 120 - t * 40, 3, 2, `rgba(60, 40, 90, ${(0.6 * (1 - t)).toFixed(2)})`); }
};

const drawPump = (c: Ctx, v: V) => {
  const s = 0.87, St = fogR(v, '#4A6A5A', s);
  const x = Math.round(pX(v, s, R(PUMP))), by = Math.round(bedY(v, s, PUMP)), top = Math.round(pY(v, s, WS)) - 4;
  if (!onScreen(v, x - 50, x + 50)) return;
  // (the intake pipe: down from the bank, an elbow, along the bed to the strainer; flanged every so far)
  box(c, x - 7, top, 14, by - 24 - top, INK); box(c, x - 6, top, 12, by - 24 - top, St[2]); box(c, x - 6, top, 3, by - 24 - top, St[3]); box(c, x + 3, top, 3, by - 24 - top, St[1]);
  for (let y = top + 30; y < by - 30; y += 40) { box(c, x - 9, y, 18, 4, INK); box(c, x - 8, y + 1, 16, 2, St[3]); }
  box(c, x - 7, by - 30, 50, 14, INK); box(c, x - 6, by - 29, 48, 12, St[2]); box(c, x - 6, by - 29, 48, 3, St[3]);
  // (the strainer: a cage over its mouth, weed caught in it)
  box(c, x + 42, by - 36, 22, 26, INK);
  for (let k = 0; k < 5; k++) box(c, x + 44 + k * 4, by - 35, 2, 24, St[3]);
  for (let k = 0; k < 4; k++) box(c, x + 43, by - 32 + k * 6, 20, 1, St[1]);
  for (let k = 0; k < 4; k++) box(c, x + 46 + k * 4, by - 30 + (k % 2) * 8, 3, 6, fog(v, '#3A6A2A', s));
  signAt(c, 'SPRAY 2', x + 18, by - 20, 5, stencil(5, fog(v, '#E8E0C0', s)));
  // (it's drawing: a little silt streaming in at its mouth)
  for (let k = 0; k < 4; k++) { const t = ((v.f + k * 13) % 40) / 40; box(c, x + 74 - t * 18, by - 30 + k * 5 + Math.round(Math.sin(t * 6 + k) * 2), 2, 1, `rgba(200, 220, 190, ${(0.7 * t).toFixed(2)})`); }
};

// ---------------------------------------------------------------------------------------------------------------
// What went over the side: lying on the bed a little way back, half sunk in the silt

type Junk = 'shades' | 'camera' | 'hat' | 'coins' | 'churro' | 'cup' | 'shoe' | 'map' | 'teeth';
const JUNK: [number, Junk][] = [
  [520, 'coins'], [640, 'shades'], [800, 'camera'], [990, 'hat'], [1180, 'cup'], [1330, 'coins'], [1500, 'churro'], [1690, 'shoe'],
  [1880, 'map'], [2040, 'coins'], [2280, 'teeth'], [2520, 'shades'], [2700, 'camera'], [2860, 'cup'], [3050, 'coins'], [3220, 'hat'],
];
const junkAt = (c: Ctx, v: V, k: Junk, x: number, y: number, seed: number) => {
  const s = S_JUNK, F = (col: string) => fog(v, col, s);
  const half = () => box(c, x - 12, y - 1, 26, 3, F('#6A6A50'));
  switch (k) {
    case 'coins': for (let i = 0; i < 6; i++) { const cx = x - 10 + Math.floor(hash(seed + i) * 22), cy = y - 2 + (i % 2); box(c, cx, cy, 4, 2, F('#C8A040')); box(c, cx, cy, 2, 1, (v.f + i * 17 + seed) % 120 < 6 ? '#FFFFFF' : F('#F8E080')); } break;
    case 'shades': box(c, x - 8, y - 5, 7, 5, INK); box(c, x + 1, y - 5, 7, 5, INK); box(c, x - 7, y - 4, 5, 3, F('#3A2A4A')); box(c, x + 2, y - 4, 5, 3, F('#3A2A4A')); box(c, x - 1, y - 5, 2, 1, INK); box(c, x - 6, y - 4, 2, 1, F('#B8A8E0')); box(c, x + 7, y - 6, 6, 1, INK); break;
    case 'camera': box(c, x - 8, y - 9, 16, 9, INK); box(c, x - 7, y - 8, 14, 7, F('#E8C030')); box(c, x - 7, y - 8, 14, 2, F('#F8E070')); box(c, x - 2, y - 7, 6, 5, INK); box(c, x - 1, y - 6, 4, 3, F('#4A6A8A')); box(c, x - 6, y - 8, 3, 2, F('#1A1A1A')); half(); break;
    case 'hat': { const H = fogR(v, '#E0D4A8', s); box(c, x - 12, y - 3, 24, 3, INK); box(c, x - 11, y - 3, 22, 2, H[2]); box(c, x - 6, y - 10, 12, 8, INK); box(c, x - 5, y - 9, 10, 6, H[2]); box(c, x - 5, y - 9, 10, 2, H[3]); box(c, x - 5, y - 5, 10, 1, F('#6A4A2A')); half(); break; }
    case 'cup': box(c, x - 5, y - 12, 10, 12, INK); box(c, x - 4, y - 11, 8, 11, F('#D83A2A')); box(c, x - 4, y - 7, 8, 3, F('#F8F0E0')); box(c, x - 4, y - 11, 2, 11, F('#F06A5A')); box(c, x + 1, y - 18, 2, 7, F('#E8E8F0')); half(); break;
    case 'churro': c.save(); c.translate(x, y - 2); c.rotate(-0.25); box(c, -14, -3, 28, 6, INK); box(c, -13, -2, 26, 4, F('#C8883A')); for (let i = -12; i < 12; i += 3) box(c, i, -2, 1, 4, F('#8A5A20')); box(c, -13, -2, 26, 1, F('#F0D090')); c.restore(); break;
    case 'shoe': box(c, x - 10, y - 7, 20, 7, INK); box(c, x - 9, y - 6, 18, 5, F('#E8E8E8')); box(c, x - 9, y - 2, 18, 2, F('#8A8A8A')); box(c, x - 9, y - 6, 8, 3, F('#3A6AC8')); for (let i = 0; i < 3; i++) box(c, x - 1 + i * 3, y - 6, 1, 2, INK); half(); break;
    case 'map': box(c, x - 11, y - 3, 22, 4, INK); box(c, x - 10, y - 3, 10, 3, F('#E8E0B0')); box(c, x, y - 3, 10, 3, F('#C8D8A0')); box(c, x - 6, y - 2, 3, 1, F('#B02020')); box(c, x + 3, y - 2, 4, 1, F('#3A6A3A')); break;
    case 'teeth': box(c, x - 8, y - 6, 16, 6, INK); box(c, x - 7, y - 5, 14, 4, F('#E890A0')); for (let i = -6; i < 7; i += 2) box(c, i + x, y - 5, 1, 2, F('#F8F4E8')); break;
  }
};
const drawJunk = (c: Ctx, v: V) => {
  const s = S_JUNK;
  JUNK.forEach(([wx, k], i) => {
    const x = Math.round(pX(v, s, R(wx)));
    if (x < v.l - 30 || x > v.r + 30) return;
    junkAt(c, v, k, x, Math.round(bedY(v, s, wx)), i * 7.3);
  });
};

// ---------------------------------------------------------------------------------------------------------------

/** The open river's ride works (under the waterline, in the clip the water's painted in, before the wobble). */
export const drawRideWorks = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  if (!onScreen(v, R(DOCK), R(FALLS.x)) || v.b < WS) return;
  c.save(); c.beginPath(); c.rect(R(DOCK), WS, FALLS.x - DOCK, 2000); c.clip();
  drawTray(c, v);
  drawPump(c, v);
  drawRail(c, v);
  drawMast(c, v);
  drawJunk(c, v);
  c.restore();
};
