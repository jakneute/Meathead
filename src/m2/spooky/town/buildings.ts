// The town's buildings: the shopfronts along the back of the street (a step back from where he walks, at SHOP_D: their
// fronts painted once each, their sides and roofs going back from them in perspective, the side he's looking at), and
// DRACULA'S OTHER CASTLE at the top of the stairs (at the play plane: its door's the way in). Victorian gothic, every
// one: steep gables with their finials and bargeboards, pointed windows (lamplit after dark, some), the boards over the
// doors (the modern conveniences: APOTHECARY - NOW WITH DRIVE-THRU...). Dimmed: none of it's to stand on (only the
// balconies are: props.ts draws those, out at the play plane, lit along their lips).

import { timeOfDay, farTint, skyAt, hourMix } from '../../timeOfDay';
import { SECTIONS, GY } from '../geometry';
import { X, Y, STAIRS, PLAZA } from './layout';
import { type Ctx, type View, INK, box, checker, mix, hash, poly, at, atDepth, stamp, board, wall, gothicWindow, steppedGlow, STONE, OAK, IRON, BRASS } from './paint';

const { x1 } = SECTIONS.town;
/** Where the shopfronts stand (back from the play plane), and how far back they go. */
export const SHOP_D = 0.9, SHOP_BACK = 0.74;

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');

type Goods = 'bottles' | 'potions' | 'candles' | 'crystal' | 'smoothie' | 'gifts' | 'cafe';
interface Shop {
  /** x (from the section's start), frontage, wall height (to the eaves), its stucco, the board, what's in its windows. */
  rx: number; w: number; h: number; wall: string; sign: string; goods: Goods;
  /** The ground it stands on (height), a bay window up a floor, a mansard roof instead of the gable. */
  base: number; bay?: boolean; mansard?: boolean;
  /** Where its board goes (its middle, in the front's own coordinates) and its size, if not over the shopfront. */
  signAt?: [number, number]; signSize?: number;
}
/** The shops (the walk-away's street has the same ones: walkAway/donnie.ts). */
export const SHOPS: Shop[] = [
  { rx: 400, w: 150, h: 210, wall: '#523A52', sign: 'COFFIN CAFE - OAT MILK', goods: 'cafe', base: 0, signSize: 6 },
  { rx: 680, w: 440, h: 290, wall: '#4A3A5E', sign: 'APOTHECARY - NOW WITH DRIVE-THRU', goods: 'bottles', base: PLAZA.h, bay: true, signAt: [340, -150], signSize: 6 },
  { rx: 1160, w: 260, h: 220, wall: '#3E3550', sign: 'GHOST TOURS - BOOK ONLINE', goods: 'gifts', base: PLAZA.h, mansard: true },
  { rx: 1760, w: 380, h: 270, wall: '#3E3550', sign: 'POTION SHOPPE - TAP TO PAY', goods: 'potions', base: 0 },
  { rx: 3050, w: 340, h: 220, wall: '#523A52', sign: 'CANDLES (BATTERY OPERATED)', goods: 'candles', base: 0, bay: true },
  { rx: 5100, w: 300, h: 225, wall: '#3A3A58', sign: 'FORTUNES TOLD - CARDS ACCEPTED', goods: 'crystal', base: 0, mansard: true, signAt: [120, -110], signSize: 6 },
  { rx: 7200, w: 720, h: 300, wall: '#4C3448', sign: 'YE OLDE SMOOTHIE BAR', goods: 'smoothie', base: 0 },
  { rx: 8150, w: 280, h: 215, wall: '#4A3A5E', sign: 'CURSED GIFTS & SUNSCREEN', goods: 'gifts', base: 0, bay: true },
];

/** The shop's walls, for the hour: its stucco's ramp, a little into the haze, dimmed (it's the back of the scene). */
const rampFor = (col: string) => {
  const tod = timeOfDay();
  const c = mix(mix(farTint(hourMix(col, mix(col, '#3A2238', 0.15), mix(col, '#0A0814', 0.35), tod), 0.35, tod), '#1A1428', 0.18), skyAt(0.9, tod), 0.04);
  return [mix(c, INK, 0.55), mix(c, INK, 0.3), c, mix(c, '#FFFFFF', 0.12), mix(c, '#FFFFFF', 0.24)];
};
const glassOf = () => {
  const tod = timeOfDay(), lit = tod.lamps;
  return lit > 0.4 ? ['#2A1A10', '#6A4220', '#9A6A2E', '#C8923C'] : [hourMix('#1A1830', '#2A1A2A', '#0E0A16', tod), hourMix('#3A3858', '#4A3040', '#1A1428', tod), hourMix('#5A5880', '#6A4A58', '#2A2238', tod), hourMix('#8A88B0', '#9A6A70', '#3A3050', tod)];
};
const gableOf = (s: Shop) => (s.mansard ? 46 : Math.min(140, s.w * 0.42));

/** What's in a shop window (x, y its top-left, w by h). */
const goods = (g: Ctx, kind: Goods, x: number, y: number, w: number, h: number, seed: number) => {
  // (the shelf, then the wares on it, then the glass's glint)
  box(g, x, y + h - 6, w, 3, OAK[3]); box(g, x, y + h - 6, w, 1, OAK[5]);
  box(g, x, y + h * 0.45, w, 2, OAK[3]);
  for (const sy of [y + h * 0.45, y + h - 6]) for (let i = 0; i < w / 9 - 1; i++) {
    const px = x + 4 + i * 9, t = hash(seed + i * 1.7 + sy);
    if (kind === 'bottles' || kind === 'potions') {
      const col = ['#16A34A', '#7E22CE', '#B91C1C', '#0E7490', '#CA8A04'][Math.floor(t * 5)];
      box(g, px, sy - 10, 6, 10, INK); box(g, px + 1, sy - 9, 4, 9, col); box(g, px + 2, sy - 13, 2, 4, INK); box(g, px + 1, sy - 8, 1, 4, mix(col, '#FFFFFF', 0.5));
    } else if (kind === 'candles') {
      box(g, px + 1, sy - 12, 4, 12, '#E7E5E4'); box(g, px + 1, sy - 12, 1, 12, '#FFFFFF'); box(g, px + 2, sy - 15, 2, 3, '#FDE047'); box(g, px + 2, sy - 14, 1, 1, '#FFFFFF');
    } else if (kind === 'crystal') {
      if (i % 3 === 1) { g.fillStyle = INK; g.beginPath(); g.arc(px + 3, sy - 7, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = '#A5B4FC'; g.beginPath(); g.arc(px + 3, sy - 7, 6, 0, Math.PI * 2); g.fill(); box(g, px, sy - 11, 2, 2, '#FFFFFF'); }
      else box(g, px, sy - 8, 6, 8, ['#7E22CE', '#1E1036'][i % 2]);
    } else if (kind === 'smoothie') {
      const col = ['#F472B6', '#A3E635', '#FB923C', '#C084FC'][Math.floor(t * 4)];
      box(g, px, sy - 12, 7, 12, INK); box(g, px + 1, sy - 11, 5, 11, col); box(g, px + 3, sy - 16, 1, 5, '#F5F5F4'); box(g, px + 1, sy - 11, 5, 2, '#FFFFFF');
    } else if (kind === 'cafe') {
      box(g, px, sy - 7, 7, 7, INK); box(g, px + 1, sy - 6, 5, 6, '#F5F5F4'); box(g, px + 6, sy - 5, 2, 3, INK); box(g, px + 2, sy - 9, 1, 2, '#A8A29E');
    } else {
      const col = ['#F97316', '#FDE047', '#22D3EE', '#E9D5FF'][Math.floor(t * 4)];
      box(g, px, sy - 9, 7, 9, INK); box(g, px + 1, sy - 8, 5, 8, col); box(g, px + 1, sy - 8, 5, 1, mix(col, '#FFFFFF', 0.5));
    }
  }
  box(g, x + 2, y + 2, 2, h * 0.5, 'rgba(255,255,255,0.18)'); box(g, x + 5, y + 2, 1, h * 0.3, 'rgba(255,255,255,0.12)');
};

/** A shop's front, painted flat in its own coordinates: its foot at (0, 0), x across 0..w (the walk screens paint it too: walkAway/spookyTown.ts). */
export const paintFront = (g: Ctx, s: Shop, i: number) => {
  const { w, h } = s, R = rampFor(s.wall), trim = rampFor('#6A587E'), glass = glassOf();
  const top = -h, gh = gableOf(s), seed = i * 31 + 7;
  // A chimney behind the roof
  box(g, w * 0.74 - 1, top - gh * 0.9 - 1, 18, gh * 0.9 + 4, INK); box(g, w * 0.74, top - gh * 0.9, 16, gh * 0.9 + 2, R[1]); box(g, w * 0.74, top - gh * 0.9, 4, gh * 0.9 + 2, R[2]);
  box(g, w * 0.74 - 3, top - gh * 0.9 - 6, 22, 6, INK); box(g, w * 0.74 - 2, top - gh * 0.9 - 5, 20, 4, R[2]); box(g, w * 0.74 - 2, top - gh * 0.9 - 5, 20, 1, R[3]);
  for (const k of [0, 1]) { box(g, w * 0.74 + 2 + k * 8, top - gh * 0.9 - 12, 5, 7, INK); box(g, w * 0.74 + 3 + k * 8, top - gh * 0.9 - 11, 3, 6, '#7C3A2A'); }
  if (s.mansard) {
    // A mansard: the steep slate sides (scalloped shingles), dormers with their own little gables
    const S = rampFor('#343048');
    poly(g, [[-8, top + 2], [14, top - gh], [w - 14, top - gh], [w + 8, top + 2]], INK);
    poly(g, [[-6, top + 1], [15, top - gh + 2], [w - 15, top - gh + 2], [w + 6, top + 1]], S[2]);
    for (let y = top - gh + 6, row = 0; y < top; y += 6, row++) { const k = (y - (top - gh)) / gh, l = 15 - 21 * k, r = w - 15 + 21 * k; for (let x = l + (row % 2) * 5; x < r - 4; x += 10) { box(g, x, y, 9, 1, S[1]); box(g, x, y - 2, 1, 2, S[1]); } box(g, l, y - 4, 4, 4, S[3]); }
    box(g, 14, top - gh - 2, w - 28, 4, INK); box(g, 15, top - gh - 1, w - 30, 2, trim[3]);
    for (let d = 34; d < w - 50; d += 70) {
      poly(g, [[d - 4, top - 8], [d - 4, top - 30], [d + 12, top - 44], [d + 28, top - 30], [d + 28, top - 8]], INK);
      poly(g, [[d - 2, top - 8], [d - 2, top - 29], [d + 12, top - 41], [d + 26, top - 29], [d + 26, top - 8]], R[2]);
      box(g, d + 4, top - 28, 16, 20, INK); box(g, d + 5, top - 27, 14, 18, glass[1]); box(g, d + 5, top - 27, 14, 6, glass[2]); box(g, d + 11, top - 27, 2, 18, INK);
    }
  } else {
    // The steep gable: the wall carried up into it, its bargeboards (lit up the left slope), the finial, an attic window
    poly(g, [[-10, top + 3], [w / 2, top - gh - 3], [w + 10, top + 3]], INK);
    poly(g, [[0, top], [w / 2, top - gh + 6], [w, top]], R[2]);
    poly(g, [[0, top], [w / 2, top - gh + 6], [w / 2, top - gh + 18], [10, top]], R[3]);
    checker(g, w / 2 - 20, top - 30, 40, 26, R[1]);
    for (let k = 0; k <= 1; k += 1 / Math.max(8, Math.round(w / 6))) {
      const lx = -8 + k * (w / 2 + 8), ly = top + 2 - k * (gh + 4), rx = w + 8 - k * (w / 2 + 8);
      box(g, lx - 2, ly - 1, 6, 6, trim[2]); box(g, lx - 2, ly - 1, 6, 2, trim[4]);
      box(g, rx - 4, ly - 1, 6, 6, trim[1]); box(g, rx - 4, ly - 1, 6, 1, trim[3]);
    }
    // (the gingerbread under the bargeboards: a row of drops)
    for (let k = 0.08; k < 0.95; k += 0.07) { box(g, -6 + k * (w / 2 + 6), top + 6 - k * (gh + 2), 2, 5, trim[1]); box(g, w + 4 - k * (w / 2 + 6), top + 6 - k * (gh + 2), 2, 5, trim[1]); }
    box(g, w / 2 - 2, top - gh - 20, 4, 18, INK); box(g, w / 2 - 1, top - gh - 19, 2, 17, IRON[4]);
    box(g, w / 2 - 4, top - gh - 26, 8, 8, INK); box(g, w / 2 - 3, top - gh - 25, 6, 6, IRON[3]); box(g, w / 2 - 3, top - gh - 25, 2, 2, IRON[5]);
    gothicWindow(g, w / 2 - 9, top - gh * 0.55, 18, Math.max(16, gh * 0.35), trim, glass);
  }
  // The walls (stucco, stepped, cracked, grimy at the foot); quoins at its corners; the cornice under the eaves
  wall(g, 0, top, w, h, R, seed);
  for (let y = top + 6, k = 0; y < -14; y += 16, k++) for (const qx of [0, w - (k % 2 ? 10 : 16)]) { box(g, qx, y, k % 2 ? 10 : 16, 12, R[3]); box(g, qx, y + 12, k % 2 ? 10 : 16, 1, R[1]); box(g, qx, y, k % 2 ? 10 : 16, 1, R[4]); }
  box(g, -6, top - 1, w + 12, 8, INK); box(g, -5, top, w + 10, 6, trim[2]); box(g, -5, top, w + 10, 2, trim[4]);
  for (let x = -2; x < w; x += 8) box(g, x, top + 7, 4, 4, trim[1]);
  checker(g, 0, top + 11, w, 4, R[0]);
  // Up a floor: a bay window (out from the wall: its sides shaded, its own little roof), or a row of pointed windows
  const f2 = top + 40, f2h = Math.min(70, h * 0.3);
  if (s.bay) {
    const bw = Math.min(w * 0.42, 130), bx = (w - bw) / 2;
    box(g, bx - 1, f2 - 12, bw + 2, f2h + 26, INK); box(g, bx, f2 - 11, bw, f2h + 24, R[3]);
    box(g, bx, f2 - 11, 10, f2h + 24, R[4]); box(g, bx + bw - 12, f2 - 11, 12, f2h + 24, R[1]);
    const nw = 3, pw = (bw - 28) / nw;
    for (let k = 0; k < nw; k++) gothicWindow(g, bx + 14 + k * pw + 2, f2, pw - 6, f2h - 6, trim, glass);
    poly(g, [[bx - 6, f2 - 11], [bx + bw / 2, f2 - 30], [bx + bw + 6, f2 - 11]], INK);
    poly(g, [[bx - 4, f2 - 12], [bx + bw / 2, f2 - 28], [bx + bw + 4, f2 - 12]], rampFor('#343048')[2]);
    poly(g, [[bx - 4, f2 - 12], [bx + bw / 2, f2 - 28], [bx + bw / 2, f2 - 24], [bx + 2, f2 - 12]], rampFor('#343048')[3]);
    box(g, bx + 4, f2 + f2h + 13, bw - 8, 3, R[0]);
    for (let k = 0; k < 3; k++) box(g, bx + 10 + k * ((bw - 26) / 2), f2 + f2h + 13, 6, 8, trim[1]);
    for (const wx of [24, w - 44]) if (wx + 20 < bx || wx > bx + bw) gothicWindow(g, wx, f2 + 4, 20, f2h - 8, trim, glass);
  } else {
    const n = Math.max(2, Math.floor((w - 24) / 60));
    for (let k = 0; k < n; k++) gothicWindow(g, 16 + k * ((w - 32) / n) + ((w - 32) / n - 24) / 2, f2 + 4, 24, f2h - 4, trim, glass);
  }
  // The shopfront: its fascia (the board over it), the display windows (what they sell), the door (pointed, dark)
  const sf = -96, door = 34, dx = w / 2 - door / 2;
  box(g, 6, sf - 2, w - 12, 98, INK); box(g, 7, sf - 1, w - 14, 97, R[1]);
  box(g, 7, sf - 1, w - 14, 2, R[2]);
  const wy = -72, wh = 56;
  for (const [wx, ww] of [[14, dx - 22], [dx + door + 8, w - dx - door - 22]] as const) {
    if (ww < 12) continue;
    box(g, wx - 2, wy - 2, ww + 4, wh + 4, INK);
    box(g, wx, wy, ww, wh, glass[1]); box(g, wx, wy, ww, wh * 0.4, glass[2]);
    goods(g, s.goods, wx + 1, wy + 2, ww - 2, wh - 3, i * 9 + wx);
    box(g, wx - 1, wy - 2, ww + 2, 2, trim[3]);
    for (let mx = wx + 30; mx < wx + ww - 8; mx += 30) box(g, mx, wy, 2, wh, OAK[2]);
    // (the bulkhead under it: a panel, lit at its top)
    box(g, wx, wy + wh + 2, ww, 14, R[0]); box(g, wx + 2, wy + wh + 4, ww - 4, 1, R[2]); box(g, wx + 2, wy + wh + 13, ww - 4, 1, R[0]);
  }
  poly(g, [[dx - 4, 0], [dx - 4, -62], [dx + door / 2, -80], [dx + door + 4, -62], [dx + door + 4, 0]], INK);
  poly(g, [[dx - 2, 0], [dx - 2, -61], [dx + door / 2, -77], [dx + door + 2, -61], [dx + door + 2, 0]], OAK[2]);
  for (let k = 0; k < 4; k++) box(g, dx + 2 + k * 8, -58, 1, 56, OAK[1]);
  box(g, dx - 2, -61, 3, 61, OAK[4]);
  box(g, dx + 6, -54, door - 12, 18, INK); box(g, dx + 7, -53, door - 14, 16, glass[2]);
  box(g, dx + door - 8, -30, 3, 3, BRASS[4]);
  box(g, dx - 6, -2, door + 12, 4, INK); box(g, dx - 5, -2, door + 10, 2, STONE[5]);
  // (its board, over the shopfront: the town's)
  board(g, s.signAt?.[0] ?? w / 2, s.signAt?.[1] ?? sf - 14, s.sign, '#1E1036', '#E9D5FF', s.signSize ?? (s.sign.length > 26 ? 7 : 8));
  // (the plinth; a cobweb in a corner; a satellite dish, a wifi aerial: the modern conveniences)
  box(g, 0, -6, w, 6, R[0]); box(g, 0, -6, w, 1, R[2]);
  g.strokeStyle = '#B8B4C8'; g.lineWidth = 1;
  for (let k = 1; k <= 3; k++) { g.beginPath(); g.moveTo(8, sf + 1 + k * 4); g.lineTo(8 + k * 4, sf + 1); g.stroke(); }
  g.beginPath(); g.moveTo(8, sf + 1); g.lineTo(20, sf + 13); g.stroke();
  if (i % 3 === 1) { const ax = w - 34, ay = top + 22; g.fillStyle = INK; g.beginPath(); g.ellipse(ax, ay, 11, 9, -0.4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C8C4D0'; g.beginPath(); g.ellipse(ax, ay, 9, 7, -0.4, 0, Math.PI * 2); g.fill(); box(g, ax - 2, ay - 2, 4, 4, '#8A8698'); box(g, ax + 6, ay + 6, 3, 8, IRON[2]); }
};

/** Each shop's side and its roof going back (the side he's looking at), then its front. */
const drawShop = (c: Ctx, v: View, s: Shop, i: number) => {
  const eye = v.eye, x0 = X(s.rx), xr = x0 + s.w, base = Y(s.base), top = base - s.h, gh = gableOf(s);
  const R = rampFor(s.wall), S = rampFor('#343048');
  // (the side he's looking at: its wall in steps darker back, windows on it, then the roof's slope over it)
  const side = eye.x > xr ? 1 : eye.x < x0 ? -1 : 0;
  if (side) {
    const e = side > 0 ? xr : x0;
    const P = (y: number, d: number) => at(eye, e, y, d);
    const steps = [R[1], R[1], R[0]];
    for (let k = 0; k < 3; k++) {
      const a = SHOP_D - ((SHOP_D - SHOP_BACK) * k) / 3, b = SHOP_D - ((SHOP_D - SHOP_BACK) * (k + 1)) / 3;
      poly(c, [P(top, a), P(top, b), P(base, b), P(base, a)], steps[k]);
    }
    // (a window or two down the side, a drainpipe at the corner)
    for (const [dd, yy] of [[0.86, top + 50], [0.86, top + 130], [0.79, top + 50]] as const) {
      if (yy > base - 70) continue;
      poly(c, [P(yy, dd), P(yy, dd - 0.03), P(yy + 34, dd - 0.03), P(yy + 34, dd)], INK);
      poly(c, [P(yy + 2, dd - 0.004), P(yy + 2, dd - 0.026), P(yy + 33, dd - 0.026), P(yy + 33, dd - 0.004)], glassOf()[1]);
    }
    const [px0, py0] = P(top + 8, SHOP_D - 0.006), [, py1] = P(base, SHOP_D - 0.006);
    box(c, px0 - 2, py0, 4, py1 - py0, INK); box(c, px0 - 1, py0, 2, py1 - py0, IRON[3]);
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); const [ax, ay] = P(top, SHOP_D), [bx, by] = P(top, SHOP_BACK), [, cy] = P(base, SHOP_BACK); c.moveTo(ax, ay); c.lineTo(bx, by); c.lineTo(bx, cy); c.stroke();
    // (the roof's slope on that side: slate, coursed, going back)
    const cx = x0 + s.w / 2;
    const ridge = s.mansard ? top - gh : top - gh + 6, rx = s.mansard ? (side > 0 ? xr - 14 : x0 + 14) : cx, ex = e + side * 8;
    const Q = (x: number, y: number, d: number) => at(eye, x, y, d);
    for (let k = 0; k < 4; k++) {
      const a = SHOP_D - ((SHOP_D - SHOP_BACK) * k) / 4, b = SHOP_D - ((SHOP_D - SHOP_BACK) * (k + 1)) / 4;
      poly(c, [Q(ex, top + 2, a), Q(rx, ridge, a), Q(rx, ridge, b), Q(ex, top + 2, b)], S[[3, 2, 2, 1][k]]);
    }
    // (the courses of slate along it)
    c.strokeStyle = S[1]; c.lineWidth = 1; c.beginPath();
    for (let k = 1; k < 6; k++) { const t = k / 6, xx = ex + (rx - ex) * t, yy = top + 2 + (ridge - top - 2) * t; const [p0, q0] = Q(xx, yy, SHOP_D), [p1, q1] = Q(xx, yy, SHOP_BACK); c.moveTo(p0, q0); c.lineTo(p1, q1); }
    c.stroke();
    const [r0x, r0y] = Q(rx, ridge, SHOP_D), [r1x, r1y] = Q(rx, ridge, SHOP_BACK);
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(r0x, r0y); c.lineTo(r1x, r1y); c.stroke();
    const [e0x, e0y] = Q(ex, top + 2, SHOP_D), [e1x, e1y] = Q(ex, top + 2, SHOP_BACK);
    c.beginPath(); c.moveTo(e0x, e0y); c.lineTo(e1x, e1y); c.stroke();
  }
  // (its front)
  const tod = timeOfDay();
  atDepth(c, eye, SHOP_D, () => {
    c.save(); c.translate(x0, base);
    stamp(c, `tn-shop-${i}-${tod.key}-${fontIn()}`, -24, -s.h - gh - 40, s.w + 48, s.h + gh + 44, g => paintFront(g, s, i));
    c.restore();
  });
};

export const drawShops = (c: Ctx, v: View) => {
  const on = SHOPS.map((s, i) => ({ s, i })).filter(({ s }) => {
    const [a] = at(v.eye, X(s.rx) - 40, GY, SHOP_D), [b] = at(v.eye, X(s.rx + s.w) + 40, GY, SHOP_D);
    return b > v.cam.x - 200 && a < v.cam.x + 1000;
  });
  // (the farthest from the eye first: nearer ones' fronts over farther ones' sides)
  on.sort((p, q) => Math.abs(X(q.s.rx + q.s.w / 2) - v.eye.x) - Math.abs(X(p.s.rx + p.s.w / 2) - v.eye.x));
  for (const { s, i } of on) drawShop(c, v, s, i);
};

/** The shops' windows, lamplit after dark (each lit one a dim warm glow, stepped: no glare). Drawn live over them. */
export const shopLights = (): { x: number; y: number }[] => SHOPS.map(s => ({ x: X(s.rx + s.w / 2), y: Y(s.base) - 60 }));

// ---------------------------------------------------------------------------------------------------------------
// DRACULA'S OTHER CASTLE, at the top of the stairs (at the play plane: its door's the way in)

const CL = X(STAIRS.b1), CR = x1 + 40, CB = Y(STAIRS.top), CH = 640;
const paintCastle = (g: Ctx) => {
  const tod = timeOfDay();
  const S = STONE.map(col => mix(farTint(hourMix(col, mix(col, '#3A2238', 0.15), mix(col, '#06040C', 0.3), tod), 0.2, tod), '#2E1E40', 0.22));
  const glow = tod.lamps > 0.3;
  const top = CB - CH, w = CR - CL;
  // The keep's tower (behind the wall, up the middle): coursed, its windows, its pointed slate roof, a flag
  const tx = CL + w * 0.45, tw = 150;
  box(g, tx - 1, top - 200, tw + 2, 210, INK);
  for (let y = top - 199; y < top + 10; y += 14) for (let x = tx; x < tx + tw; x += 28) { const o = ((y - top) / 14) % 2 ? 14 : 0; box(g, x + o, y, 27, 13, S[3 + (hash(x * 0.1 + y) > 0.6 ? 1 : 0)]); box(g, x + o, y, 27, 1, S[5]); }
  box(g, tx, top - 199, 12, 209, S[4]); box(g, tx + tw - 16, top - 199, 16, 209, S[2]);
  for (let k = 0; k < 2; k++) gothicWindow(g, tx + 40 + k * 50, top - 160, 20, 46, S, glow ? ['#2A0A0A', '#6A1A1A', '#8A2A1A', '#B8462A'] : ['#0E0A16', '#1A1428', '#2A2238', '#3A3050']);
  for (let x = tx - 6; x < tx + tw + 6; x += 22) { box(g, x - 1, top - 226, 16, 28, INK); box(g, x, top - 225, 14, 26, S[4]); box(g, x, top - 225, 14, 3, S[6]); }
  const R = ['#1A0A2E', '#2A1048', '#3B0764', '#561A8A', '#7A3AAE'];
  poly(g, [[tx - 14, top - 196], [tx + tw / 2, top - 330], [tx + tw + 14, top - 196]], INK);
  poly(g, [[tx - 11, top - 198], [tx + tw / 2, top - 325], [tx + tw + 11, top - 198]], R[2]);
  poly(g, [[tx - 11, top - 198], [tx + tw / 2, top - 325], [tx + tw / 2, top - 198]], R[3]);
  poly(g, [[tx - 11, top - 198], [tx + tw / 2, top - 325], [tx + tw * 0.2, top - 198]], R[4]);
  for (let y = top - 312; y < top - 200; y += 8) { const k = (y - (top - 325)) / 127; box(g, tx + tw / 2 - k * (tw / 2 + 11), y, k * (tw + 22), 1, R[1]); }
  box(g, tx + tw / 2 - 1, top - 380, 3, 56, INK); box(g, tx + tw / 2, top - 378, 1, 54, IRON[4]);
  poly(g, [[tx + tw / 2 + 2, top - 376], [tx + tw / 2 + 40, top - 368], [tx + tw / 2 + 30, top - 360], [tx + tw / 2 + 40, top - 352], [tx + tw / 2 + 2, top - 356]], '#7F1D1D');
  poly(g, [[tx + tw / 2 + 2, top - 376], [tx + tw / 2 + 40, top - 368], [tx + tw / 2 + 2, top - 368]], '#B91C1C');
  // The curtain wall: dressed stone in courses (each block its own tone, lit along its top), battlements along the top
  box(g, CL - 1, top - 1, w + 2, CH + 1, INK);
  for (let y = top, row = 0; y < CB; y += 20, row++) for (let x = CL + (row % 2 ? -18 : 0); x < CR; x += 36) {
    const t = hash(x * 0.13 + y * 0.71), xa = Math.max(CL, x), xb = Math.min(CR, x + 36);
    box(g, xa, y, xb - xa - 1, 19, S[t > 0.75 ? 4 : t > 0.3 ? 3 : 2]); box(g, xa, y, xb - xa - 1, 1, S[5]); box(g, xa, y + 18, xb - xa - 1, 1, S[1]);
    if (t < 0.12) checker(g, xa + 2, y + 4, 12, 8, S[1]);
  }
  box(g, CL, top, 18, CH, S[4]); box(g, CL, top, 6, CH, S[5]);
  checker(g, CL, CB - 60, w, 30, S[1]); box(g, CL, CB - 30, w, 30, S[1]);
  for (let x = CL; x < CR; x += 50) { box(g, x - 1, top - 31, 32, 31, INK); box(g, x, top - 30, 30, 30, S[3]); box(g, x, top - 30, 30, 3, S[5]); box(g, x + 26, top - 30, 4, 30, S[1]); }
  // (pilasters up it: a lit edge, a shaded one, their bases)
  for (let px = CL + 150; px < CR - 60; px += 190) { box(g, px, top, 22, CH, S[4]); box(g, px, top, 4, CH, S[5]); box(g, px + 18, top, 4, CH, S[2]); box(g, px + 22, top, 3, CH, S[1]); box(g, px - 4, CB - 40, 30, 40, S[3]); box(g, px - 4, CB - 40, 30, 3, S[5]); }
  // (the banners down it: deep red, a bat on each, hung from iron rods, their tails cut)
  for (const bx of [CL + 230, x1 - 300]) {
    box(g, bx - 30, top + 96, 60, 4, INK); box(g, bx - 29, top + 97, 58, 2, IRON[4]);
    poly(g, [[bx - 23, top + 100], [bx + 23, top + 100], [bx + 23, top + 290], [bx, top + 270], [bx - 23, top + 290]], INK);
    poly(g, [[bx - 21, top + 100], [bx + 21, top + 100], [bx + 21, top + 286], [bx, top + 267], [bx - 21, top + 286]], '#7F1D1D');
    poly(g, [[bx - 21, top + 100], [bx - 12, top + 100], [bx - 12, top + 278], [bx - 21, top + 286]], '#991B1B');
    poly(g, [[bx + 13, top + 100], [bx + 21, top + 100], [bx + 21, top + 286], [bx + 13, top + 280]], '#5A1010');
    box(g, bx - 21, top + 108, 42, 2, BRASS[4]); box(g, bx - 21, top + 252, 42, 2, BRASS[4]);
    poly(g, [[bx, top + 170], [bx - 6, top + 162], [bx - 16, top + 158], [bx - 12, top + 172], [bx - 4, top + 176], [bx, top + 184], [bx + 4, top + 176], [bx + 12, top + 172], [bx + 16, top + 158], [bx + 6, top + 162]], INK);
    box(g, bx - 3, top + 160, 2, 4, INK); box(g, bx + 1, top + 160, 2, 4, INK);
  }
  // (arrow slits, pointed windows (lit red after dark, dim), ivy creeping up)
  for (let row = 0; row < 3; row++) for (let wx = CL + 70; wx < CR - 80; wx += 130) {
    if (row === 2 && wx > CR - 420) continue;
    gothicWindow(g, wx, top + 50 + row * 130, 28, 60, S, glow ? ['#2A0A0A', '#5A1414', '#7A2018', '#9A3A22'] : ['#0E0A16', '#1A1428', '#2A2238', '#3A3050']);
  }
  for (let k = 0; k < 3; k++) { const ix = CL + 30 + k * 200; for (let y = CB - 10; y > CB - 200 - k * 60; y -= 3) { const s = Math.sin(y * 0.08 + k) * 6; box(g, ix + s, y, 3, 3, (y >> 2) % 3 ? '#1E3A1E' : '#2E5A26'); if (y % 15 === 0) box(g, ix + s + 3, y, 4, 2, '#3E7A2E'); } }
  // The signs: DRACULA'S OTHER CASTLE, the rules under it
  board(g, x1 - 160, CB - 282, "DRACULA'S OTHER CASTLE", '#450A0A', '#FECACA');
  board(g, x1 - 160, CB - 254, 'NO FLASH PHOTOGRAPHY - NO STROLLERS', '#1E1036', '#E9D5FF', 6);
  // The door: big, arched, its stone surround, oak planks studded with iron, open a crack (black in the gap)
  const dl = x1 - 132, dr = x1 - 28, dt = CB - 170;
  poly(g, [[dl - 12, CB], [dl - 12, dt], [(dl + dr) / 2, dt - 44], [dr + 12, dt], [dr + 12, CB]], INK);
  poly(g, [[dl - 10, CB], [dl - 10, dt], [(dl + dr) / 2, dt - 40], [dr + 10, dt], [dr + 10, CB]], S[4]);
  for (let k = 0; k < 9; k++) { const a = Math.PI + (k / 8) * Math.PI, ax = (dl + dr) / 2 + Math.cos(a) * 62, ay = dt + Math.sin(a) * 38; box(g, ax - 5, ay - 4, 10, 8, k % 2 ? S[5] : S[3]); }
  poly(g, [[dl, CB], [dl, dt], [(dl + dr) / 2, dt - 28], [dr, dt], [dr, CB]], INK);
  poly(g, [[dl + 2, CB], [dl + 2, dt + 1], [(dl + dr) / 2, dt - 25], [dr - 2, dt + 1], [dr - 2, CB]], OAK[3]);
  for (let x = dl + 12; x < dr; x += 12) box(g, x, dt - 20, 1, 190, OAK[1]);
  box(g, dl + 2, dt + 1, 4, 170, OAK[5]);
  for (const y of [dt + 20, dt + 90, CB - 26]) { box(g, dl + 2, y, dr - dl - 4, 6, INK); box(g, dl + 2, y + 1, dr - dl - 4, 3, IRON[3]); box(g, dl + 2, y + 1, dr - dl - 4, 1, IRON[5]); }
  for (let y = dt + 10; y < CB; y += 24) for (const x of [dl + 8, dr - 12]) { box(g, x, y, 4, 4, INK); box(g, x, y, 2, 2, IRON[5]); }
  box(g, x1 - 82, dt - 10, 8, 180, '#050308');
  g.fillStyle = INK; g.beginPath(); g.arc(x1 - 92, CB - 80, 7, 0, Math.PI * 2); g.fill();
  g.strokeStyle = BRASS[3]; g.lineWidth = 2; g.beginPath(); g.arc(x1 - 92, CB - 78, 5, 0, Math.PI * 2); g.stroke();
  box(g, dl - 14, CB - 4, dr - dl + 28, 4, S[5]);
  // (the torches' sconces either side of the door: their flames are live)
  for (const tx2 of [dl - 30, dr + 14]) { box(g, tx2 - 6, CB - 128, 12, 6, INK); box(g, tx2 - 5, CB - 127, 10, 4, IRON[3]); poly(g, [[tx2 - 7, CB - 138], [tx2 + 7, CB - 138], [tx2 + 3, CB - 126], [tx2 - 3, CB - 126]], INK); poly(g, [[tx2 - 5, CB - 137], [tx2 + 5, CB - 137], [tx2 + 2, CB - 127], [tx2 - 2, CB - 127]], IRON[4]); box(g, tx2 - 1, CB - 122, 2, 16, INK); }
};

export const drawCastle = (c: Ctx, v: View) => {
  if (CR < v.v0 || CL > v.v1 + 200) return;
  const tod = timeOfDay();
  // (its left side going back, seen from the left: the stone in courses, darker back)
  const S = STONE.map(col => farTint(col, 0.2, tod));
  if (v.eye.x < CL) {
    const P = (y: number, d: number) => at(v.eye, CL, y, d);
    for (let k = 0; k < 4; k++) { const a = 1 - 0.05 * k, b = 1 - 0.05 * (k + 1); poly(c, [P(CB - CH - 31, a), P(CB - CH - 31, b), P(CB, b), P(CB, a)], S[[2, 2, 1, 1][k]]); }
    c.strokeStyle = S[1]; c.lineWidth = 1; c.beginPath();
    for (let y = CB - CH; y < CB; y += 20) { const [p0, q0] = P(y, 1), [p1, q1] = P(y, 0.8); c.moveTo(p0, q0); c.lineTo(p1, q1); }
    c.stroke();
  }
  stamp(c, `tn-castle-${tod.key}-${fontIn()}`, CL - 20, CB - CH - 400, CR - CL + 40, CH + 404, paintCastle);
  // (the torches by the door: flames in flat steps, flickering; their glow dim)
  for (const tx of [x1 - 162, x1 - 14]) {
    const k = (v.f >> 2) + tx, fl = hash(k * 0.37) * 3, fy = CB - 139;
    steppedGlow(c, tx, fy - 6, 26, '#F59E0B', 0.08 + 0.1 * tod.lamps, 0, 3);
    box(c, tx - 5, fy - 10 - fl, 10, 12 + fl, '#B45309'); box(c, tx - 3, fy - 14 - fl, 6, 14 + fl, '#F59E0B'); box(c, tx - 1, fy - 17 - fl, 3, 12, '#FDE68A');
  }
};
