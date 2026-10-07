// The White House, the SNES way, for the ending's night establishing shot and the epilogue's burning lawn: the wings
// in stone (the courses banded, floodlit from the lawn, the shadow under the cornice), the rusticated ground course,
// quoins at the corners; the cornice and its dentils, the balustrade along the roof; the windows in their surrounds,
// muntins and sills, the caps over them (alternating pediments on the ground floor), lit warm inside, curtains drawn
// at the sides; the portico: the pediment and its raking cornice, the oculus, the entablature, six columns shaded
// round with their capitals and bases, the lantern, the fanlit door, the steps; the hedges along the front; the iron
// fence and its posts; the flag. Painted once into the backgrounds' layers (only the flag, the fountain's jet and the
// stars move).

import { shaded } from './snes';
import { bayer } from './raster';
import { SET_INK } from './props';

type Ctx = CanvasRenderingContext2D;

const fill = (g: Ctx, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

export interface WHLook {
  key: string;
  /** The stone, darkest to lightest (8). */
  stone: string[];
  /** What's lit inside the windows, darkest to lightest (6). */
  lit: string[];
  /** The hedges (5). */
  hedge: string[];
  /** How lit the wings' stone is across (u) and down (v) them. */
  wall: (u: number, v: number) => number;
}

/** Floodlit at night, from the lawn: the light up from under, falling off to the ends. */
export const WH_NIGHT: WHLook = {
  key: 'night',
  stone: ['#3a3a56', '#50506e', '#686888', '#8282a2', '#9e9ebc', '#babad2', '#d6d6e6', '#f2f2fa'],
  lit: ['#5c3010', '#94581c', '#c88a34', '#eab45a', '#fcdc9c', '#fff2d4'],
  hedge: ['#040e06', '#08180a', '#0e2410', '#163218', '#204222'],
  wall: (u, v) => 0.5 + v * 0.34 - Math.abs(u - 0.5) * 0.5,
};
/** On fire: scorched, the stone lit orange from the fires in it. */
export const WH_BURNT: WHLook = {
  key: 'burnt',
  stone: ['#1a1012', '#2c1e1e', '#3e2c2c', '#54403c', '#6c5448', '#866a58', '#a08068', '#ba9878'],
  lit: ['#5c0a00', '#a81c00', '#e04000', '#f87c00', '#fcb820', '#fce890'],
  hedge: ['#0a0804', '#161006', '#241a0a', '#34260e', '#463414'],
  wall: (u, v) => 0.62 - v * 0.3 - Math.abs(u - 0.5) * 0.45,
};

/** The window grid along the wings (the fires in the epilogue go in these): x of each, and the two rows. */
export const WH_WINDOWS = (() => { const r: [number, number][] = []; for (const row of [68, 86]) for (let x = 42; x < 216; x += 14) if (x <= 96 || x >= 158) r.push([x, row]); return r; })();
/** The portico's six columns (x of each, 5 wide). */
const COLS = [0, 1, 2, 3, 4, 5].map(i => 98 + i * 11);

/** A window 7 x 10 at (x, y), in its surround: the reveal, the glass lit inside (curtains at the sides), the muntins, the sill, the cap. */
const whWindow = (g: Ctx, x: number, y: number, L: WHLook, cap: 'flat' | 'tri' | 'arch', w = 7) => {
  const S = L.stone, Lt = L.lit;
  fill(g, x - 2, y - 2, w + 4, 14, S[5]); fill(g, x - 2, y - 2, w + 4, 1, S[6]); fill(g, x - 2, y - 2, 1, 14, S[6]); fill(g, x + w + 1, y - 2, 1, 14, S[3]);
  fill(g, x - 1, y - 1, w + 2, 12, SET_INK);
  for (let yy = 0; yy < 10; yy++) for (let xx = 0; xx < w; xx++) {
    let l = 2.2 + yy * 0.2 + bayer(x + xx, y + yy) * 0.9;
    if (xx === 0 || xx === w - 1) l -= 1.4;
    fill(g, x + xx, y + yy, 1, 1, Lt[Math.max(0, Math.min(Lt.length - 1, Math.round(l)))]);
  }
  // (the muntins: the sashes meeting across the middle)
  const mid = x + Math.floor(w / 2);
  fill(g, mid, y, 1, 10, S[4]); fill(g, x, y + 3, w, 1, S[4]); fill(g, x, y + 5, w, 1, S[3]); fill(g, x, y + 7, w, 1, S[4]);
  // The sill, its shadow
  fill(g, x - 2, y + 11, w + 4, 1, S[7]); fill(g, x - 1, y + 12, w + 2, 1, S[1]);
  // The cap
  if (cap === 'flat') { fill(g, x - 3, y - 4, w + 6, 1, S[7]); fill(g, x - 3, y - 3, w + 6, 1, S[2]); }
  else if (cap === 'tri') {
    const cx = x + w / 2;
    for (let j = 0; j < 4; j++) { const hw = 1 + j * 1.6, l = Math.round(cx - hw), r = Math.round(cx + hw); fill(g, l, y - 7 + j, r - l, 1, j === 3 ? S[2] : S[6]); fill(g, l, y - 7 + j, 1, 1, S[7]); fill(g, r - 1, y - 7 + j, 1, 1, S[3]); }
    fill(g, Math.round(cx) - 1, y - 8, 2, 1, SET_INK);
  } else {
    for (let j = 0; j < 3; j++) { const hw = 3 + j * 1.3, l = Math.round(x + w / 2 - hw), r = Math.round(x + w / 2 + hw); fill(g, l, y - 5 + j, r - l, 1, j === 2 ? S[2] : S[6]); }
  }
};

/** The building (wings, roof, portico, steps, hedges), onto `g`. */
export const paintWhiteHouse = (g: Ctx, L: WHLook) => {
  const S = L.stone;
  // The wings: stone in courses, floodlit; the shadow under the cornice
  fill(g, 35, 61, 186, 48, SET_INK);
  shaded(g, `wh-wall-${L.key}`, 36, 62, 184, 38, S, (u, v) => {
    const py = v * 38, px = u * 184;
    let l = L.wall(u, v);
    if (Math.floor(py) % 4 === 3) l -= 0.1;
    if (py < 3) l -= 0.32 - py * 0.08;
    if (px < 4 || px > 180) l += 0.12 * (Math.floor(py / 3) % 2 ? 1 : 0.2);
    return l;
  });
  // (the quoins at the corners: the stones alternating long and short, each lit on top)
  for (const qx of [36, 216]) for (let y = 62; y < 100; y += 3) { const w = Math.floor((y - 62) / 3) % 2 ? 4 : 3, x = qx === 36 ? 36 : 220 - w; fill(g, x, y, w, 1, S[6]); fill(g, x, y + 2, w, 1, S[2]); }
  // The ground course, rusticated: blocks, deep joints, lit along the top
  shaded(g, `wh-base-${L.key}`, 36, 100, 184, 8, S, (u, v) => {
    const px = Math.floor(u * 184), py = Math.floor(v * 8);
    if (py === 0) return L.wall(u, 1) + 0.15;
    if (py === 4 || (px + (py > 4 ? 5 : 0)) % 10 === 0) return 0.1;
    return L.wall(u, 1) - 0.12 - py * 0.03;
  });
  // The windows, row on row
  WH_WINDOWS.forEach(([x, y], i) => whWindow(g, x, y, L, y < 80 ? 'flat' : (i % 2 ? 'tri' : 'arch')));
  // The cornice: lit along its top, the dentils under it, the shadow it throws
  fill(g, 33, 57, 190, 1, SET_INK);
  fill(g, 34, 58, 188, 1, S[7]); fill(g, 34, 59, 188, 1, S[5]); fill(g, 34, 60, 188, 1, S[4]);
  for (let x = 34; x < 222; x++) fill(g, x, 61, 1, 1, x % 2 ? S[5] : S[1]);
  fill(g, 34, 62, 188, 1, S[0]); fill(g, 33, 58, 1, 4, SET_INK); fill(g, 222, 58, 1, 4, SET_INK);
  // The balustrade along the roof: the rail, the balusters (the sky through them), the pedestals
  fill(g, 36, 51, 184, 1, SET_INK);
  fill(g, 36, 52, 184, 1, S[6]); fill(g, 36, 53, 184, 1, S[3]);
  for (let x = 36; x < 220; x++) {
    const k = (x - 36) % 3;
    if (k === 2) continue;
    fill(g, x, 54, 1, 3, k === 0 ? S[5] : S[3]); fill(g, x, 55, 1, 1, k === 0 ? S[6] : S[2]);
  }
  fill(g, 36, 57, 184, 1, S[4]);
  for (let x = 36; x < 220; x += 23) { fill(g, x, 51, 4, 6, S[5]); fill(g, x, 51, 4, 1, S[7]); fill(g, x + 3, 52, 1, 5, S[2]); fill(g, x - 1, 51, 1, 6, SET_INK); fill(g, x + 4, 51, 1, 6, SET_INK); }
  fill(g, 35, 51, 1, 7, SET_INK); fill(g, 220, 51, 1, 7, SET_INK);
  // The portico: the wall behind the columns (in their shadow), its windows, the lantern, the door and its fanlight
  fill(g, 95, 61, 66, 42, SET_INK);
  shaded(g, `wh-porch-${L.key}`, 96, 62, 64, 40, S, (u, v) => {
    const py = v * 40;
    let l = L.wall(u, v) - 0.26;
    if (Math.floor(py) % 4 === 3) l -= 0.08;
    if (py < 6) l -= 0.25 - py * 0.04;
    return l;
  });
  for (const x of [115, 137]) { whWindow(g, x, 68, L, 'flat', 5); whWindow(g, x, 86, L, 'tri', 5); }
  // (the door: its surround, the fanlight over it, the light inside)
  fill(g, 122, 80, 13, 23, S[5]); fill(g, 122, 80, 1, 23, S[6]); fill(g, 134, 80, 1, 23, S[3]);
  for (let yy = 0; yy < 7; yy++) for (let xx = -6; xx <= 6; xx++) {
    const d = Math.hypot(xx, 7 - yy);
    if (d < 5.5) fill(g, 128 + xx, 82 + yy, 1, 1, (Math.abs(Math.atan2(7 - yy, xx) * 4 / Math.PI % 1) < 0.18 && d > 1.5) ? S[4] : L.lit[3 + (d < 3 ? 1 : 0)]);
    else if (d < 6.5) fill(g, 128 + xx, 82 + yy, 1, 1, SET_INK);
  }
  fill(g, 123, 88, 11, 1, SET_INK); fill(g, 123, 89, 11, 14, SET_INK);
  for (let yy = 90; yy < 103; yy++) for (let xx = 124; xx < 133; xx++) fill(g, xx, yy, 1, 1, L.lit[Math.min(5, Math.round(2.5 + (yy - 90) * 0.18 + bayer(xx, yy) * 0.8))]);
  fill(g, 128, 90, 1, 13, S[1]); fill(g, 124, 90, 1, 13, L.lit[1]); fill(g, 132, 90, 1, 13, L.lit[1]);
  // (the lantern hung in the middle, on its chain)
  fill(g, 128, 62, 1, 6, S[1]);
  fill(g, 126, 68, 5, 6, SET_INK); fill(g, 127, 69, 3, 4, L.lit[5]); fill(g, 127, 72, 3, 1, L.lit[3]); fill(g, 126, 67, 5, 1, S[2]); fill(g, 127, 74, 3, 1, S[2]);
  // The steps up to it
  for (let k = 0; k < 3; k++) { const x0 = 92 - k * 3, w = 72 + k * 6, y = 102 + k * 2; fill(g, x0, y, w, 1, S[6 - k]); fill(g, x0, y + 1, w, 1, S[3 - k]); fill(g, x0 - 1, y, 1, 2, SET_INK); fill(g, x0 + w, y, 1, 2, SET_INK); }
  // The columns: shaded round (lit from the left and the lawn), darker up under the entablature; the capitals, the bases
  const RND = [2, 5, 7, 6, 4, 2];
  for (const cx of COLS) {
    fill(g, cx - 1, 62, 7, 40, SET_INK);
    for (let y = 63; y < 100; y++) for (let k = 0; k < 5; k++) {
      const shade = RND[k] - (y < 67 ? 2 : y < 70 ? 1 : 0) + (bayer(cx + k, y) > 0.3 && y >= 67 && y < 70 ? 1 : 0);
      fill(g, cx + k, y, 1, 1, S[Math.max(0, Math.min(7, shade))]);
    }
    // (the capital: the abacus, the volutes curled at its corners; the base, its torus and plinth)
    fill(g, cx - 2, 61, 9, 1, S[7]); fill(g, cx - 1, 62, 7, 1, S[5]); fill(g, cx - 2, 61, 1, 2, S[3]); fill(g, cx + 6, 61, 1, 2, S[3]);
    fill(g, cx - 1, 63, 1, 1, S[2]); fill(g, cx + 5, 63, 1, 1, S[2]);
    fill(g, cx - 1, 99, 7, 1, S[6]); fill(g, cx - 2, 100, 9, 2, S[5]); fill(g, cx - 2, 101, 9, 1, S[3]); fill(g, cx - 3, 100, 1, 2, SET_INK); fill(g, cx + 7, 100, 1, 2, SET_INK);
  }
  // The entablature over them: the architrave, the frieze, the dentils, the shadow it throws
  fill(g, 91, 57, 74, 1, SET_INK);
  fill(g, 92, 58, 72, 1, S[7]); fill(g, 92, 59, 72, 1, S[5]); fill(g, 92, 60, 72, 1, S[4]);
  for (let x = 92; x < 164; x++) fill(g, x, 61, 1, 1, x % 2 ? S[6] : S[2]);
  fill(g, 91, 58, 1, 4, SET_INK); fill(g, 164, 58, 1, 4, SET_INK);
  // The pediment: the raking cornice lit along its top, the tympanum let in behind it, the oculus in the middle
  for (let j = 0; j < 18; j++) {
    const y = 40 + j, hw = Math.round(j * 2 + 2), l = 128 - hw, r = 128 + hw;
    fill(g, l - 1, y, 1, 1, SET_INK); fill(g, r, y, 1, 1, SET_INK);
    if (j === 0) { fill(g, l, y, r - l, 1, S[7]); continue; }
    for (let x = l; x < r; x++) {
      const dl = x - l, dr = r - 1 - x, edge = Math.min(dl, dr);
      let c: string;
      if (j >= 16) c = j === 16 ? S[6] : S[3];
      else if (edge < 2) c = dl <= dr ? S[edge ? 5 : 7] : S[edge ? 3 : 5];
      else if (edge < 3) c = S[1];
      else c = S[Math.max(0, Math.min(7, Math.round(3 + (j / 16) * 1.2 + bayer(x, y) * 0.8)))];
      fill(g, x, y, 1, 1, c);
    }
  }
  fill(g, 127, 39, 2, 1, SET_INK);
  for (let yy = -3; yy <= 3; yy++) for (let xx = -5; xx <= 5; xx++) { const d = (xx / 5.5) ** 2 + (yy / 3.5) ** 2; if (d < 1) fill(g, 128 + xx, 50 + yy, 1, 1, d > 0.55 ? (xx + yy < 0 ? S[6] : S[3]) : S[2]); }
  // The flagpole, its gold ball
  fill(g, 127, 22, 1, 18, S[5]); fill(g, 128, 23, 1, 17, S[2]);
  fill(g, 126, 20, 3, 2, '#c08c00'); fill(g, 126, 20, 1, 1, '#f8d440');
  // The hedges along the front, clipped round, lit along their tops
  for (const [x0, x1] of [[36, 90], [166, 220]]) for (let x = x0; x < x1; x++) {
    const top = 103 + Math.round(Math.abs(Math.sin((x - x0) * 0.32)) * -2 + 1);
    fill(g, x, top - 1, 1, 1, SET_INK);
    for (let y = top; y < 111; y++) {
      const l = 3.6 - (y - top) * 0.55 + bayer(x, y) * 1.1 - (Math.sin((x - x0) * 0.32) < 0.1 && y > top + 1 ? 0.8 : 0);
      fill(g, x, y, 1, 1, L.hedge[Math.max(0, Math.min(4, Math.round(l)))]);
    }
  }
};

/** The iron fence across the lawn: rails, pickets with spear tips, posts with ball caps; `glint`: what catches on the iron. */
export const paintFence = (g: Ctx, y: number, glint: string) => {
  const IR = ['#040406', '#0c0c12', '#16161e', '#22222e', '#34344a'];
  for (let x = 1; x < 256; x += 4) { fill(g, x, y - 3, 1, 12, IR[1]); fill(g, x, y - 4, 1, 1, glint); fill(g, x - 1, y - 3, 3, 1, IR[2]); }
  for (const ry of [y - 1, y + 6]) { fill(g, 0, ry, 256, 1, IR[3]); fill(g, 0, ry + 1, 256, 1, IR[0]); }
  for (let x = 14; x < 256; x += 40) {
    fill(g, x - 1, y - 5, 5, 16, SET_INK); fill(g, x, y - 4, 3, 15, IR[2]); fill(g, x, y - 4, 1, 15, IR[4]); fill(g, x + 2, y - 4, 1, 15, IR[0]);
    fill(g, x - 1, y - 8, 5, 3, SET_INK); fill(g, x, y - 8, 3, 3, IR[3]); fill(g, x, y - 8, 1, 1, glint);
  }
};

/** The flag on the roof: the stripes in folds (`wave` 0/1 moves the folds along), the canton; `burnt`: half of it burned off, the edge glowing. */
export const whFlag = (g: Ctx, wave: number, burnt: boolean) => {
  const len = burnt ? 8 : 14;
  for (let x = 0; x < len; x++) {
    const fold = Math.sin((x + wave * 2) * 0.9), dy = Math.round(fold * 0.6 * (x / len));
    for (let y = 0; y < 10; y++) {
      const canton = x < 6 && y < 5;
      const lit = fold > 0.3 ? 1 : fold < -0.4 ? -1 : 0;
      let c = canton ? ['#0a0a2c', '#141444', '#1e1e5c'][lit + 1] : Math.floor(y / 2) % 2 === 0 ? ['#9c1a0a', '#c82814', '#e84a2c'][lit + 1] : ['#b4b4c0', '#dcdce4', '#fcfcfc'][lit + 1];
      if (canton && (x + y) % 2 === 0 && y % 2 === 0 && x > 0) c = '#e8e8f0';
      fill(g, 128 + x, 22 + y + dy, 1, 1, c);
    }
    if (burnt && x === len - 1) for (let y = 0; y < 10; y += 2) { fill(g, 128 + x + 1, 22 + y + dy, 1, 1, y % 4 ? '#f87c00' : '#2a1410'); }
  }
};
