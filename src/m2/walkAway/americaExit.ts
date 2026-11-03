// The alpha's end walk (endWalk.ts): Meathead walking out of Happy Land through AMERICA USA at the camera, the park
// going away behind him at whatever hour it is (dusk, or night with the NEVERENDING FIREWORKS SHOW over it).
//
// Underfoot: America USA's brick street (running bond, the odd scorched brick, a navy roundel with a white star every
// so often down its middle), the granite curbs lit along their tops, the brick soldier course, the cream sidewalk
// slabs with a bronze star set in here and there. Either side the street's shopfronts going off into the haze (the
// intro's own: BIG EASY BEIGNETS, HONKY TONK HEAVEN, DEEP DISH DEPOT, CHOWDAH HOUSE...: siding, brick, brownstone,
// terracotta, cornices, shutters, New Orleans' iron balconies, the shop boards, striped awnings, windows lit after
// dark), the navy lamp posts with their banners and PA horns (lit after dark), bunting along under the fronts' cornices,
// flag poles with Old Glory flapping (live), the ticket booths (CLOSED), THE EAGLE (A SHRUB) by them, the Fountain of
// Freedom (its eagle spitting), a popcorn cart and a churro cart, benches, trash cans, the signs; the litter he's left
// (dropped churros, cups, a tiny flag, popcorn) coming by again and again.
//
// Behind it all, at the street's end: the biggest flag in the world on its pole (the hub's America landmark, flapping),
// and past it round the hub the lands' landmarks over their rides, the hub's own art (hub/far.ts), small and hazed over
// the park's tree line. The fireworks (timeOfDay.ts drawStars, at the last hour) go off behind all of it. No volcanoes.

import { type Ctx, type Prop, type SceneDef, LW, HOR, ME_X, SPEED, INK, box, hash, mix, rampOf, stipple } from './kit';
import { farStrip } from './farStrip';
import { gradeOf } from './screen';
import { timeOfDay, drawStars, drawMoon, farTint, skyAt, multiply } from '../timeOfDay';
import { FLAG_RED, FLAG_WHITE, FLAG_BLUE, eagle } from '../intro/art/kit';
import { signText, federal, gilt } from '../intro/art/letters';
import { shrunk, farTreeline } from '../parkFar';
import { paintLandmark, paintSkyline, landmarkBox, SKYLINE_BOX } from '../hub/far';
import type { StretchId } from '../hub/stretch';

/** Lamps lit (after dark). */
const lit = () => timeOfDay().lamps > 0.3;
/** His path's middle (m across): everything's set out from it. */
const PX = ME_X;
const GOLD = ['#5C3A06', '#9A6A0E', '#D4A017', '#F2CC4A', '#FFF0A0'];
const IRON = rampOf('#22315E');
const HEDGE = ['#123A1C', '#1E5A2A', '#2F7D3A', '#4CA04A', '#7CC466'];
const STONE = rampOf('#CFC6B6');
const BRICKS = ['#A84A2E', '#9C4228', '#B25536', '#94402A'];
const CONC = ['#7E766A', '#9A9284', '#B8B0A0', '#D2CABA', '#E8E0D0'];
/** Words on a board: the way in's enamel, a cell a pixel. */
const words = (g: Ctx, s: string, x: number, base: number, col: string, shadow?: string) => signText(g, s, x, base, federal(6, col, shadow));

// ---------------------------------------------------------------------------------------------------------------
// The ground: the brick street down the middle, the curbs, the soldier course, the sidewalks' slabs

const ground = (g: Ctx, w: number, h: number) => {
  const cx = w / 2, road = 42, curb = 5;
  // (the sidewalks: cream slabs 2 m square, each its own step, lit along the top and left, the joints dark; a bronze
  // star set in now and then, gum)
  box(g, 0, 0, w, h, CONC[0]);
  for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) {
    const t = hash(x * 0.37 + y * 1.13), col = CONC[t > 0.7 ? 3 : 2];
    box(g, x + 1, y + 1, 31, 31, col); box(g, x + 1, y + 1, 31, 1, CONC[4]); box(g, x + 1, y + 1, 1, 31, CONC[4]);
    box(g, x + 1, y + 31, 31, 1, CONC[1]); box(g, x + 31, y + 1, 1, 31, CONC[1]);
    if (t > 0.82) {
      const sx = x + 16, sy = y + 16;
      g.fillStyle = GOLD[1]; g.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 3 : 7; g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r * 0.9); }
      g.closePath(); g.fill(); box(g, sx - 2, sy - 3, 2, 2, GOLD[3]);
    }
    for (let k = 0; k < 3; k++) if (hash(t * 41 + k) > 0.6) box(g, x + 4 + hash(t * 13 + k) * 24, y + 4 + hash(t * 29 + k) * 24, 2, 1, CONC[1]);
  }
  // (the street: bricks in running bond, each lit along its top, the joints dark; the odd one scorched or replaced)
  box(g, cx - road, 0, road * 2, h, '#5A2616');
  for (let y = 0, r = 0; y < h; y += 4, r++) for (let x = cx - road - (r % 2) * 4; x < cx + road; x += 8) {
    const t = hash(x * 0.71 + y * 1.37), col = t > 0.96 ? '#6A3424' : t > 0.93 ? '#C8806A' : BRICKS[Math.floor(t * 4) % 4];
    const x0 = Math.max(cx - road, x), x1 = Math.min(cx + road, x + 7);
    if (x1 <= x0) continue;
    box(g, x0, y, x1 - x0, 3, col); box(g, x0, y, x1 - x0, 1, mix(col, '#FFFFFF', 0.16));
  }
  // (worn smooth down the middle where everybody walks: a dither of paler brick)
  for (let y = 0; y < h; y += 2) for (let x = cx - 14 + (y % 4 ? 1 : 0); x < cx + 14; x += 2) if (hash(x * 3.1 + y * 0.7) > 0.55) box(g, x, y, 1, 1, '#B86448');
  // (the stars down the middle: a navy roundel, a white star, every 8 m)
  for (let y = 64; y < h; y += 128) {
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, y, 13, 12, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = FLAG_BLUE[2]; g.beginPath(); g.ellipse(cx, y, 12, 11, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = FLAG_BLUE[3]; g.beginPath(); g.ellipse(cx - 2, y - 2, 8, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = FLAG_WHITE[3]; g.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 3.4 : 8; g.lineTo(cx + Math.cos(a) * r, y + Math.sin(a) * r); }
    g.closePath(); g.fill(); box(g, cx - 2, y - 4, 2, 2, '#FFFFFF');
  }
  // (the curbs: granite, the top lit (it's a step), the gutter dark against the bricks; a soldier course of brick
  // along the sidewalk side)
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? cx - road - curb : cx + road;
    box(g, x0, 0, curb, h, '#A39886'); box(g, side < 0 ? x0 : x0 + curb - 2, 0, 2, h, '#F4ECDA'); box(g, side < 0 ? x0 + curb - 1 : x0, 0, 1, h, '#3E2A1C');
    for (let y = 0; y < h; y += 48) box(g, x0, y, curb, 1, '#6E6352');
    const sx = side < 0 ? x0 - 8 : x0 + curb;
    box(g, sx, 0, 8, h, '#4A2216');
    for (let y = 0; y < h; y += 4) { const col = hash(y * 0.9 + side) > 0.5 ? '#8E3A24' : '#9A4428'; box(g, sx, y, 7, 3, col); box(g, sx, y, 7, 1, mix(col, '#FFFFFF', 0.18)); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The far off: round the hub, each land's landmark over its rides (the hub's own art), the park's tree line along their
// feet, the haze; painted once for the hour

const SW = LW + 60, SH = 72;
/** Where each land stands along the strip (its px, the picture's 30 in), round the hub from the way out: bunched into
 *  the V of sky down the street between the fronts (the giant flag's at 322), the Rockies furthest back (painted first). */
const MARKS: [StretchId, number][] = [['frontier', 420], ['foreign', 150], ['adventure', 204], ['fantasy', 254], ['hollywood', 290], ['cartoon', 354], ['spooky', 386], ['space', 446]];
/** Each land's box brought down to this (strip px, at twice the picture: farStrip.ts's). */
const MK = 0.24;
const paintPark = (g: Ctx) => {
  const tod = timeOfDay(), haze = skyAt(0.86, tod), foot = SH * 2 - 10;
  for (const [id, x] of MARKS) {
    const b = landmarkBox(id);
    shrunk(g, b.w, b.h, o => paintLandmark(o, id, -b.x, -b.y), x * 2 + b.x * MK, foot + b.y * MK, b.w * MK, b.h * MK, haze, 0.28);
  }
  for (const [id, x] of MARKS) {
    const b = SKYLINE_BOX;
    shrunk(g, b.w, b.h, o => paintSkyline(o, id, -b.x, -b.y), x * 2 + b.x * MK, foot + b.y * MK, b.w * MK, b.h * MK, haze, 0.18);
  }
  farTreeline(g, 0, SW * 2, foot - 9, farTint('#2A3A2A', 1, tod), 3);
  // (the haze lying along the foot: banded, dithered)
  const h2 = mix(tod.haze, haze, 0.5);
  for (let k = 0; k < 3; k++) { g.fillStyle = stipple(g, h2, k % 2); g.fillRect(0, foot - 8 + k * 6, SW * 2, 6); }
  box(g, 0, foot + 6, SW * 2, SH * 2 - foot - 6, h2);
};

/** Old Glory's steps, lit by the hour, and hazed for each fog step (0 near .. 3 far): worked out once an hour. */
let flagCols: { key: string; R: string[][]; W: string[][]; B: string[][] } | null = null;
const flagRamps = () => {
  const tod = timeOfDay();
  if (!flagCols || flagCols.key !== tod.key) {
    const gr = gradeOf(), hz = tod.haze;
    const lvl = (r: string[]) => [0, 1, 2, 3].map(f => r.map(c => mix(multiply(c, gr), hz, 0.16 * f)));
    flagCols = { key: tod.key, R: lvl(FLAG_RED), W: lvl(FLAG_WHITE), B: lvl(FLAG_BLUE) };
  }
  return flagCols;
};
/** Old Glory flying off a pole at (x, y) (its hoist's top), fw by fh picture px, waving (live: a column of stripes at a
 *  time, each lit by how its fold faces). `fog` 0..3. */
const flyFlag = (c: Ctx, x: number, y: number, fw: number, fh: number, t: number, seed: number, fog: number) => {
  if (fw < 2 || fh < 1) return;
  const { R, W, B } = flagRamps();
  const cols = Math.max(2, Math.min(22, Math.round(fw / 2))), cw = fw / cols;
  const rows = fh >= 13 ? 13 : fh >= 5 ? 5 : 3, rh = fh / rows, canton = Math.ceil(rows * 0.54);
  for (let k = 0; k < cols; k++) {
    const ph = t * 0.12 + k * 0.7 + seed, u = (k + 1) / cols;
    const wv = Math.sin(ph) * Math.max(0.5, fh * 0.14) * (u + 0.2);
    const l = Math.max(0, Math.min(4, Math.round(2 + Math.cos(ph) * 1.6)));
    const px = Math.round(x + k * cw), pw = Math.max(1, Math.round(x + (k + 1) * cw) - px);
    for (let r = 0; r < rows; r++) {
      const col = k < cols * 0.42 && r < canton ? B[fog][l] : r % 2 ? W[fog][l] : R[fog][l];
      box(c, px, Math.round(y + r * rh + wv), pw, Math.max(1, Math.ceil(rh)), col);
    }
    if (fw > 18 && k < cols * 0.42 && k % 2 === 0) for (let r = 0; r < canton; r += 2) box(c, px, Math.round(y + 1 + r * rh + wv), 1, 1, W[fog][4]);
  }
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  // (how far he's come: the street's props go round by it (props(), `looped`): back() is drawn before them each frame)
  travelNow = SPEED * t;
  // (the stars, the moon, and at the last hour the fireworks over the park: timeOfDay.ts drawStars, fireworks.ts)
  drawStars(c, 0, 0, LW, HOR - 10, t, 0, tod, 1);
  drawMoon(c, 56, 16, 6, tod);
  // (round the hub: the lands' landmarks over their rides, the tree line, the haze)
  c.drawImage(farStrip('wa-am-park', SW, SH, paintPark), -30 + Math.round(sway * 0.1), HOR + 4 - SH);
  // (at the street's end: the biggest flag in the world on the biggest pole, the gilt ball, the eagle on it)
  const T = (col: string) => farTint(col, 0.6, tod);
  const x = Math.round(292 + sway * 0.18), top = HOR - 40;
  box(c, x - 2, top, 3, HOR - top + 1, T('#4A4E58')); box(c, x - 1, top, 1, HOR - top + 1, T('#E8E6E0'));
  box(c, x - 1, top - 3, 2, 2, T('#F2CC4A')); box(c, x - 4, top - 5, 8, 1, T('#5C3A16')); box(c, x - 1, top - 6, 2, 1, T('#F1EFEA'));
  flyFlag(c, x + 1, top, 22, 13, t * 0.6, 0, 2);
};

// ---------------------------------------------------------------------------------------------------------------
// The shopfronts (the intro's own buildings, the districts' look and their shops)

type Mat = 'siding' | 'brick' | 'stone' | 'terra';
interface Shop {
  wall: string; mat: Mat; trim: string; shutter?: string; name: string; face: string; ink: string; awn: [string, string];
  door: string; curtain: string; h: number; wide?: boolean; balcony?: boolean;
}
const SHOPS: Shop[] = [
  { wall: '#E9A3C2', mat: 'siding', trim: '#F2EEE2', shutter: '#2E7D5B', name: 'BIG EASY BEIGNETS', face: '#FEF3C7', ink: '#7C2D12', awn: ['#2E7D5B', '#F2EEE2'], door: '#2E7D5B', curtain: '#7C3AED', h: 7.2, balcony: true },
  { wall: '#B5463A', mat: 'brick', trim: '#F3E2C0', name: 'HONKY TONK HEAVEN', face: '#7F1D1D', ink: '#FDE047', awn: ['#7F1D1D', '#F3E2C0'], door: '#5A2E0E', curtain: '#FACC15', h: 7.8 },
  { wall: '#7A4A38', mat: 'stone', trim: '#D3C3A5', name: 'DEEP DISH DEPOT', face: '#B91C1C', ink: '#FEF3C7', awn: ['#B91C1C', '#F8FAFC'], door: '#3F2A14', curtain: '#F59E0B', h: 8.4, wide: true },
  { wall: '#8C4030', mat: 'brick', trim: '#2F6B3A', name: "CUP O' JOE-MERICA", face: '#14532D', ink: '#FEF3C7', awn: ['#14532D', '#F3E2C0'], door: '#2F6B3A', curtain: '#A3E635', h: 7.4 },
  { wall: '#9A3A2C', mat: 'brick', trim: '#EEEAE0', shutter: '#1F3A2A', name: 'CHOWDAH HOUSE', face: '#1E3A8A', ink: '#FEF3C7', awn: ['#1E3A8A', '#EEEAE0'], door: '#1F3A2A', curtain: '#F1EFEA', h: 7.0 },
  { wall: '#97D8B0', mat: 'siding', trim: '#F2EEE2', shutter: '#6D3FA6', name: 'VOODOO-RAMA GIFTS', face: '#4C1D95', ink: '#FDE047', awn: ['#6D3FA6', '#E8B400'], door: '#6D3FA6', curtain: '#B91C1C', h: 7.2, balcony: true },
  { wall: '#D5A040', mat: 'brick', trim: '#5A2E0E', name: 'BOOT BARN-O-RAMA', face: '#78350F', ink: '#FEF3C7', awn: ['#78350F', '#FEF3C7'], door: '#78350F', curtain: '#B91C1C', h: 7.6 },
  { wall: '#C0673B', mat: 'terra', trim: '#EAD9B8', name: 'WINDY CITY TEES', face: '#1E3A8A', ink: '#F8FAFC', awn: ['#1E3A8A', '#F8FAFC'], door: '#1E3A8A', curtain: '#1E3A8A', h: 8.0, wide: true },
  { wall: '#74463A', mat: 'brick', trim: '#3F7A3A', name: 'FLYING FISH MARKET', face: '#0E7490', ink: '#F8FAFC', awn: ['#0E7490', '#F8FAFC'], door: '#0E7490', curtain: '#0E7490', h: 7.4 },
  { wall: '#87362A', mat: 'brick', trim: '#EEEAE0', shutter: '#141A2E', name: 'REVOLUTION GIFTS', face: '#7F1D1D', ink: '#FDE047', awn: ['#7F1D1D', '#EEEAE0'], door: '#7F1D1D', curtain: '#1E3A8A', h: 7.2 },
];
/** A front's width (m), its px a meter (two stories, low: the sky over the street's kept open for the fireworks), and
 *  how far out from his path the fronts stand (m: the street's a wide plaza). */
const SHOP_W = 5.1, SHOP_PPM = 26, SHOP_X = 12.2;

/** A window: its frame, the glass (the sky's reflection banded down it by day; after dark the room lit, mostly), the
 *  curtains, a glint, the sill. */
const pane = (g: Ctx, x: number, y: number, w: number, h: number, S: Shop, seed: number, T: string[]) => {
  box(g, x - 2, y - 2, w + 4, h + 4, INK); box(g, x - 1, y - 1, w + 2, h + 2, T[2]); box(g, x - 1, y - 1, w + 2, 1, T[4]);
  const on = lit() && hash(seed) > 0.25;
  if (on) {
    box(g, x, y, w, h, '#F6C462'); box(g, x, y, w, Math.ceil(h * 0.4), '#FFE2A0');
    if (hash(seed * 3) > 0.6) box(g, x + Math.round(w * 0.35), y + Math.round(h * 0.35), Math.max(2, Math.round(w * 0.3)), h - Math.round(h * 0.35), '#7A4A2A');
  } else {
    box(g, x, y, w, h, '#2A3448'); box(g, x, y, w, Math.ceil(h * 0.3), '#5A7298'); box(g, x, y + Math.ceil(h * 0.3), w, 2, '#3E5272');
    box(g, x + 1, y + 1, 1, Math.min(4, h - 2), '#C8D8F0');
  }
  const C = rampOf(S.curtain);
  box(g, x, y, 2, h, C[on ? 3 : 1]); box(g, x + w - 2, y, 2, h, C[on ? 2 : 0]);
  if (!S.wide) box(g, x, y + Math.round(h / 2), w, 1, T[1]);
  box(g, x - 2, y + h + 1, w + 4, 2, T[3]); box(g, x - 2, y + h + 2, w + 4, 1, T[1]);
  if (S.shutter) for (const sx of [x - 6, x + w + 2]) {
    const R = rampOf(S.shutter);
    box(g, sx, y - 1, 4, h + 2, INK); box(g, sx + 1, y, 2, h, R[2]);
    for (let k = y + 1; k < y + h; k += 2) box(g, sx + 1, k, 2, 1, R[1]);
  }
};

const paintShop = (S: Shop) => (g: Ctx, w: number, h: number) => {
  const W = rampOf(S.wall), T = rampOf(S.trim);
  const signY = h - 60, awnY = h - 46, shopY = h - 36;
  // (the wall, in its own stuff)
  box(g, 0, 8, w, h - 8, S.mat === 'siding' ? W[2] : W[1]);
  if (S.mat === 'siding') for (let y = 10; y < signY; y += 4) { box(g, 0, y, w, 1, W[3]); box(g, 0, y + 3, w, 1, W[1]); }
  else if (S.mat === 'brick') for (let y = 8, r = 0; y < signY; y += 4, r++) for (let x = (r % 2) * -4; x < w; x += 8) { const col = hash(x * 0.3 + y * 1.7 + w) > 0.85 ? W[3] : W[2]; box(g, x, y, 7, 3, col); box(g, x, y, 7, 1, mix(col, '#FFFFFF', 0.12)); }
  else if (S.mat === 'stone') for (let y = 8, r = 0; y < signY; y += 8, r++) for (let x = (r % 2) * -8; x < w; x += 16) { box(g, x, y, 15, 7, W[2]); box(g, x, y, 15, 1, W[3]); box(g, x, y, 1, 7, W[3]); }
  else for (let y = 8; y < signY; y += 8) for (let x = 0; x < w; x += 8) { box(g, x, y, 7, 7, W[2]); box(g, x, y, 7, 1, W[4]); box(g, x + 1, y + 1, 2, 2, W[3]); }
  // (lit down its left, shaded down its right, dithered between)
  box(g, 0, 8, 2, h - 8, W[3]); box(g, w - 4, 8, 4, h - 8, W[0]);
  for (let y = 8; y < h; y += 2) box(g, w - 5, y + ((y / 2) % 2), 1, 1, W[0]);
  // (the cornice: thrown out on brackets, dentils under it, dimmed (nothing to stand on up there))
  const dT = T.map(c => mix(c, '#3A4A78', 0.2));
  box(g, 0, 0, w, 7, INK); box(g, 0, 1, w, 5, dT[2]); box(g, 0, 1, w, 1, dT[3]); box(g, 0, 5, w, 1, dT[1]);
  for (let x = 2; x < w - 2; x += 4) box(g, x, 7, 2, 2, dT[0]);
  for (const bx of [2, w - 5]) box(g, bx, 7, 3, 4, dT[1]);
  // (bunting swagged along under it: red, white and blue fans)
  for (let x = 4, k = 0; x < w - 10; x += 10, k++) {
    const R = [FLAG_RED, FLAG_WHITE, FLAG_BLUE][k % 3];
    g.fillStyle = INK; g.beginPath(); g.moveTo(x, 9); g.lineTo(x + 10, 9); g.quadraticCurveTo(x + 5, 17, x, 9); g.fill();
    g.fillStyle = R[2]; g.beginPath(); g.moveTo(x + 1, 9); g.lineTo(x + 9, 9); g.quadraticCurveTo(x + 5, 15, x + 1, 9); g.fill();
    box(g, x + 2, 9, 6, 1, R[3]);
  }
  // (the upstairs: two rows of windows)
  const rowH = Math.floor((signY - 14) / 2);
  for (let r = 0; r < 2; r++) {
    const y = 14 + r * rowH, wh = rowH - 9;
    if (S.wide) for (let i = 0; i < 3; i++) pane(g, 8 + i * 42, y, 32, wh, S, r * 7 + i + w * 0.1 + S.h, T);
    else for (let i = 0; i < 4; i++) pane(g, 12 + i * 30, y, 14, wh, S, r * 7 + i + w * 0.1 + S.h, T);
  }
  // (New Orleans' iron lace: a balcony along the first floor, dim, its railing in curls)
  if (S.balcony) {
    const by = 14 + rowH * 2 - 4, I = ['#141822', '#262C3A', '#3C4456'].map(c => mix(c, '#3A4A78', 0.2));
    box(g, 0, by, w, 3, I[0]); box(g, 0, by, w, 1, I[2]);
    box(g, 0, by - 10, w, 1, I[1]);
    for (let x = 1; x < w; x += 4) { box(g, x, by - 9, 1, 9, I[1]); if ((x / 4) % 2 < 1) box(g, x + 1, by - 6, 2, 2, I[2]); }
    for (let x = 4; x < w; x += 12) box(g, x, by + 3, 4, 3, '#2F7D3A');
  }
  // (the shop's board: inked, its face banded, the name)
  box(g, 2, signY, w - 4, 13, INK); box(g, 3, signY + 1, w - 6, 11, S.face);
  const F = rampOf(S.face);
  box(g, 3, signY + 1, w - 6, 1, F[4]); box(g, 3, signY + 2, w - 6, 1, F[3]); box(g, 3, signY + 11, w - 6, 1, F[1]);
  for (const bx of [5, w - 7]) { box(g, bx, signY + 3, 1, 1, F[0]); box(g, bx, signY + 9, 1, 1, F[0]); }
  words(g, S.name, w / 2, signY + 10, S.ink, mix(S.face, INK, 0.55));
  // (the awning: striped, lit along its top, shaded under, scalloped)
  const A0 = rampOf(S.awn[0]), A1 = rampOf(S.awn[1]);
  box(g, 0, awnY - 1, w, 10, INK);
  for (let x = 1, k = 0; x < w - 1; x += 8, k++) {
    const A = k % 2 ? A1 : A0, sw = Math.min(8, w - 1 - x);
    box(g, x, awnY, sw, 8, A[2]); box(g, x, awnY, sw, 2, A[3]); box(g, x, awnY + 6, sw, 2, A[1]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + sw / 2, awnY + 8, sw / 2, 3, 0, 0, Math.PI); g.fill();
    g.fillStyle = A[1]; g.beginPath(); g.ellipse(x + sw / 2, awnY + 8, sw / 2 - 1, 2, 0, 0, Math.PI); g.fill();
  }
  // (the shopfront: its frame, the big window (the stock in it; lit warm after dark), the door, the stoop)
  box(g, 4, shopY, w - 8, h - shopY - 2, INK); box(g, 5, shopY + 1, w - 10, h - shopY - 4, T[2]); box(g, 5, shopY + 1, w - 10, 1, T[4]);
  const gx = 9, gw = Math.round(w * 0.58), gy = shopY + 5, gh = h - shopY - 12;
  box(g, gx - 1, gy - 1, gw + 2, gh + 2, INK);
  if (lit()) { box(g, gx, gy, gw, gh, '#F2B860'); box(g, gx, gy, gw, Math.ceil(gh * 0.4), '#FFDC94'); }
  else { box(g, gx, gy, gw, gh, '#3A4A60'); box(g, gx, gy, gw, Math.ceil(gh * 0.35), '#7A92B8'); }
  for (let i = 0; i < 5; i++) {
    const sx = gx + 4 + i * Math.floor((gw - 8) / 5), col = ['#B91C1C', '#F8FAFC', '#1E3A8A', '#F59E0B', S.curtain][(i + S.name.length) % 5], ph = 6 + Math.round(hash(i + S.h) * 8);
    box(g, sx - 1, gy + gh - ph - 1, 9, ph + 1, INK); box(g, sx, gy + gh - ph, 7, ph, col); box(g, sx, gy + gh - ph, 7, 1, mix(col, '#FFFFFF', 0.4));
  }
  box(g, gx, gy + gh - 2, gw, 2, T[1]);
  g.fillStyle = 'rgba(255, 255, 255, 0.18)'; g.beginPath(); g.moveTo(gx + gw * 0.5, gy); g.lineTo(gx + gw * 0.62, gy); g.lineTo(gx + gw * 0.3, gy + gh); g.lineTo(gx + gw * 0.18, gy + gh); g.closePath(); g.fill();
  const D = rampOf(S.door), dx = Math.round(w * 0.72), dw = 18, dy = shopY + 4;
  box(g, dx - 1, dy - 1, dw + 2, h - dy - 1, INK); box(g, dx, dy, dw, h - dy - 3, D[2]); box(g, dx, dy, 2, h - dy - 3, D[3]); box(g, dx + dw - 2, dy, 2, h - dy - 3, D[1]);
  box(g, dx + 3, dy + 3, dw - 6, 10, lit() ? '#FFDC94' : '#3E5272'); box(g, dx + 3, dy + 3, dw - 6, 1, INK);
  box(g, dx + dw - 5, dy + 18, 2, 2, GOLD[3]);
  box(g, 0, h - 3, w, 3, '#B6AC9A'); box(g, 0, h - 3, w, 1, '#F4ECDA');
  // (a flag on a bracket off the front, over the board)
  const fx = w - 22, fy = signY - 16;
  box(g, fx - 1, fy - 2, 1, 16, '#B8BCC4'); box(g, fx - 2, fy - 3, 3, 2, GOLD[3]);
  for (let r = 0; r < 7; r++) box(g, fx, fy + r * 1.5 + 1, 14, 2, r % 2 ? FLAG_WHITE[3] : FLAG_RED[2]);
  box(g, fx, fy + 1, 6, 6, FLAG_BLUE[2]); box(g, fx + 1, fy + 2, 1, 1, '#FFFFFF'); box(g, fx + 3, fy + 4, 1, 1, '#FFFFFF');
};

// ---------------------------------------------------------------------------------------------------------------
// The street furniture

/** A lamp post: a navy iron base, the fluted post, gold collars, the crossarm with a PA horn at each end (the PA that
 *  won't shut up), the acorn globe (lit after dark), a gold finial, the banner on its bracket (red or blue, a star). */
const LAMP_PPM = 28, LAMP_W = 1.4, LAMP_H = 3.8;
const paintLamp = (k: number) => (g: Ctx, w: number, h: number) => {
  const m = Math.round(w / 2);
  box(g, m - 6, h - 9, 12, 9, INK); box(g, m - 5, h - 8, 10, 8, IRON[2]); box(g, m - 5, h - 8, 2, 8, IRON[3]); box(g, m + 3, h - 8, 2, 8, IRON[1]);
  box(g, m - 4, h - 15, 8, 6, INK); box(g, m - 3, h - 14, 6, 5, IRON[2]); box(g, m - 3, h - 14, 1, 5, IRON[3]);
  box(g, m - 2, 22, 4, h - 37, INK); box(g, m - 1, 22, 1, h - 37, IRON[3]); box(g, m, 22, 1, h - 37, IRON[1]);
  for (const cy of [h - 18, 70, 38]) { box(g, m - 3, cy, 6, 3, INK); box(g, m - 2, cy, 4, 2, GOLD[2]); box(g, m - 2, cy, 4, 1, GOLD[4]); }
  // (the crossarm, a PA horn hung off each end: gray trumpets, their mouths out and down)
  box(g, m - 15, 24, 30, 3, INK); box(g, m - 14, 25, 28, 1, IRON[3]);
  for (const d of [-1, 1]) {
    const hx = m + d * 12, H = rampOf('#9AA0A8');
    box(g, hx - 1, 27, 2, 3, INK);
    g.fillStyle = INK; g.beginPath(); g.moveTo(hx, 29); g.lineTo(hx, 33); g.lineTo(hx + d * 7, 37); g.lineTo(hx + d * 7, 27); g.closePath(); g.fill();
    g.fillStyle = H[2]; g.beginPath(); g.moveTo(hx, 30); g.lineTo(hx, 32); g.lineTo(hx + d * 6, 35); g.lineTo(hx + d * 6, 28); g.closePath(); g.fill();
    box(g, Math.min(hx, hx + d * 6), 30, 6, 1, H[4]);
    box(g, hx + d * 6 - (d > 0 ? 0 : 1), 28, 2, 8, H[0]);
  }
  // (the globe: lit after dark, a cap, the finial)
  const on = lit();
  g.fillStyle = INK; g.beginPath(); g.ellipse(m, 14, 6, 8, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = on ? '#F8DE8A' : '#E8D49A'; g.beginPath(); g.ellipse(m, 14, 5, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = on ? '#FFF6D0' : '#F7EBC0'; g.beginPath(); g.ellipse(m - 1, 13, 3, 5, 0, 0, Math.PI * 2); g.fill();
  box(g, m - 2, 10, 1, 2, '#FFFFFF');
  box(g, m - 4, 20, 8, 3, INK); box(g, m - 3, 20, 6, 2, IRON[2]);
  box(g, m - 5, 5, 10, 2, INK); box(g, m - 4, 3, 8, 2, IRON[2]); box(g, m - 1, 0, 2, 3, GOLD[3]);
  // (the banner on its bracket: navy or red, a white star, stripes, a notched foot)
  const B = k % 2 ? FLAG_RED : FLAG_BLUE;
  box(g, m + 1, 44, 11, 1, GOLD[2]);
  box(g, m + 3, 45, 9, 26, INK); box(g, m + 4, 45, 7, 25, B[2]); box(g, m + 4, 45, 1, 25, B[3]); box(g, m + 10, 45, 1, 25, B[1]);
  g.fillStyle = '#F8FAFC'; g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 1.2 : 3; g.lineTo(m + 7.5 + Math.cos(a) * r, 51 + Math.sin(a) * r); }
  g.closePath(); g.fill();
  for (let i = 0; i < 3; i++) box(g, m + 4, 57 + i * 4, 7, 2, i % 2 ? B[1] : FLAG_WHITE[3]);
  g.clearRect(m + 6, 68, 3, 3); box(g, m + 6, 67, 3, 1, B[1]);
};
/** The lamp's glow after dark (live: stepped rings round the globe). */
const lampGlow = (c: Ctx, sx: number, sy: number, s: number) => {
  const k = timeOfDay().lamps;
  if (k <= 0.3 || s < 2) return;
  const y = Math.round(sy - (LAMP_H - 14 / LAMP_PPM) * s);
  for (const [r, a] of [[0.75, 0.07], [0.5, 0.1], [0.3, 0.16]] as const) { c.fillStyle = `rgba(255, 220, 140, ${(a * k).toFixed(3)})`; c.beginPath(); c.arc(Math.round(sx), y, Math.max(1, r * s), 0, Math.PI * 2); c.fill(); }
};

/** A flag pole: a gilt foot, the white pole, the gold ball (the flag's live: flyFlag). */
const POLE_PPM = 24, POLE_H = 4.6;
const paintPole = (g: Ctx, w: number, h: number) => {
  const m = Math.round(w / 2);
  box(g, m - 5, h - 5, 10, 5, INK); box(g, m - 4, h - 4, 8, 4, STONE[2]); box(g, m - 4, h - 4, 8, 1, STONE[4]);
  box(g, m - 3, h - 8, 6, 3, INK); box(g, m - 2, h - 8, 4, 2, GOLD[2]);
  box(g, m - 2, 4, 3, h - 12, INK); box(g, m - 1, 4, 1, h - 12, '#F1EFEA'); box(g, m, 4, 1, h - 12, '#B8B4AE');
  g.fillStyle = INK; g.beginPath(); g.arc(m, 3, 3, 0, Math.PI * 2); g.fill();
  g.fillStyle = GOLD[2]; g.beginPath(); g.arc(m, 3, 2, 0, Math.PI * 2); g.fill(); box(g, m - 1, 1, 1, 1, GOLD[4]);
};
const fogOf = (s: number) => { const d = 160 / s; return d < 8 ? 0 : d < 16 ? 1 : d < 30 ? 2 : 3; };
const poleFlag = (seed: number) => (c: Ctx, sx: number, sy: number, s: number, t: number) => {
  if (s < 1.2) return;
  flyFlag(c, sx + Math.max(1, s * 0.05), sy - (POLE_H - 0.35) * s, 1.6 * s, 1.0 * s, t, seed, fogOf(s));
};

/** The ticket booths: navy beadboard under the counters (a star a panel), white clapboard, the two windows (blinds
 *  down, CLOSED: it's that late), the prices over them, gold, the striped roof, the TICKETS board on it ringed in bulbs
 *  (lit after dark), the cupola. */
const paintBooth = (g: Ctx, w: number, h: number) => {
  const on = lit();
  // (the plinth, the beadboard, the stars)
  box(g, 0, h - 4, w, 4, '#6B6258'); box(g, 0, h - 4, w, 1, '#9A9084');
  box(g, 2, h - 24, w - 4, 20, INK); box(g, 3, h - 23, w - 6, 18, FLAG_BLUE[2]);
  for (let x = 5; x < w - 4; x += 4) { box(g, x, h - 21, 1, 15, FLAG_BLUE[1]); box(g, x + 1, h - 21, 1, 15, FLAG_BLUE[3]); }
  for (const cx of [26, w - 26]) { g.fillStyle = '#F1EFEA'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 1.6 : 4; g.lineTo(cx + Math.cos(a) * r, h - 14 + Math.sin(a) * r); } g.closePath(); g.fill(); }
  box(g, 1, h - 26, w - 2, 2, '#7E5A14'); box(g, 1, h - 26, w - 2, 1, '#D8B650');
  // (the walls: white clapboard)
  box(g, 2, h - 58, w - 4, 32, '#ECE5D6');
  for (let y = h - 57; y < h - 26; y += 3) { box(g, 2, y, w - 4, 1, '#FFFFFF'); box(g, 2, y + 2, w - 4, 1, '#B9AE98'); }
  // (the windows: red frames, the blinds down, CLOSED)
  for (const wx of [8, w - 46]) {
    box(g, wx - 2, h - 56, 42, 30, INK); box(g, wx - 1, h - 55, 40, 28, '#B91C1C'); box(g, wx - 1, h - 55, 40, 1, '#F06A55');
    for (let y = h - 53; y < h - 28; y += 3) { box(g, wx + 1, y, 36, 3, '#D8C9A8'); box(g, wx + 1, y, 36, 1, '#EFE4C8'); }
    box(g, wx + 1, h - 45, 36, 11, INK); box(g, wx + 2, h - 44, 34, 9, '#FEF3C7'); box(g, wx + 2, h - 44, 34, 1, '#FFFBEB');
    words(g, 'CLOSED', wx + 19, h - 36, '#B91C1C');
  }
  // (the frieze: navy, the prices in gold, a star between)
  box(g, 2, h - 70, w - 4, 12, INK); box(g, 3, h - 69, w - 6, 10, FLAG_BLUE[1]); box(g, 3, h - 69, w - 6, 1, FLAG_BLUE[3]);
  for (const px of [27, w - 27]) signText(g, '$189', px, h - 61, gilt(6, INK));
  box(g, w / 2 - 1, h - 66, 2, 2, GOLD[3]);
  box(g, 0, h - 73, w, 3, INK); box(g, 1, h - 72, w - 2, 1, GOLD[3]);
  // (the roof: red and white stripes, lit high, shaded toward the eave)
  const rt = h - 88, rb = h - 73, n = 11;
  for (let y = rt; y < rb; y++) {
    const k = (y - rt) / (rb - rt), xl = 10 - 10 * k, xr = w - 10 + 10 * k, sh = k < 0.3 ? 3 : k < 0.75 ? 2 : 1;
    for (let s = 0; s < n; s++) { const a = Math.round(xl + ((xr - xl) * s) / n), b = Math.round(xl + ((xr - xl) * (s + 1)) / n); box(g, a, y, b - a, 1, (s % 2 ? FLAG_WHITE : FLAG_RED)[sh]); }
  }
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(10, rt); g.lineTo(w - 10, rt); g.lineTo(w, rb); g.lineTo(0, rb); g.closePath(); g.stroke();
  // (the TICKETS board up on the roof, its bulbs)
  const bx = Math.round(w / 2 - 28);
  box(g, bx, h - 102, 56, 16, INK); box(g, bx + 1, h - 101, 54, 14, FLAG_RED[1]); box(g, bx + 4, h - 98, 48, 8, FLAG_RED[0]);
  signText(g, 'TICKETS', w / 2, h - 91, gilt(6, INK));
  for (let x = bx + 2; x < bx + 55; x += 4) for (const y of [h - 101, h - 88]) box(g, x, y, 1, 1, on && (x / 4) % 2 < 1 ? '#FFF6C0' : '#8A6A2A');
  // (the cupola: louvers, the navy dome, the ball)
  box(g, w / 2 - 7, h - 112, 14, 10, INK); box(g, w / 2 - 6, h - 111, 12, 9, FLAG_WHITE[3]);
  for (let y = h - 110; y < h - 103; y += 2) box(g, w / 2 - 4, y, 8, 1, FLAG_WHITE[1]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, h - 112, 9, 7, 0, Math.PI, Math.PI * 2); g.fill();
  g.fillStyle = FLAG_BLUE[2]; g.beginPath(); g.ellipse(w / 2, h - 112, 8, 6, 0, Math.PI, Math.PI * 2); g.fill();
  g.fillStyle = FLAG_BLUE[3]; g.beginPath(); g.ellipse(w / 2 - 2, h - 113, 4, 4, 0, Math.PI, Math.PI * 2); g.fill();
  box(g, w / 2 - 1, h - 122, 2, 3, GOLD[3]);
};

/** THE EAGLE BY THE TICKET BOOTHS (A SHRUB): the hedge clipped into an eagle, wings up, head turned, in its stone
 *  planter banded red, white and blue, labeled in case. */
const paintEagle = (g: Ctx, w: number, h: number) => {
  const cx = Math.round(w / 2), base = h - 24, k = 0.6;
  const P = (x: number, y: number) => [cx + x * k, base + (y + 46) * k] as const;
  const wing = [-8, -118, -26, -146, -50, -166, -68, -170, -62, -158, -70, -150, -58, -144, -64, -134, -50, -130, -54, -120, -38, -118, -38, -108, -16, -100];
  const shape = (ox: number, oy: number) => {
    g.beginPath();
    for (const d of [-1, 1]) { for (let i = 0; i < wing.length; i += 2) { const [x, y] = P(wing[i] * d, wing[i + 1]); i ? g.lineTo(x + ox, y + oy) : g.moveTo(x + ox, y + oy); } g.closePath(); }
    const [bx, by] = P(0, -100); g.moveTo(bx + 17 * k + ox, by + oy); g.ellipse(bx + ox, by + oy, 17 * k, 28 * k, 0, 0, Math.PI * 2);
    const [hx, hy] = P(2, -136); g.moveTo(hx + 11 * k + ox, hy + oy); g.ellipse(hx + ox, hy + oy, 11 * k, 10 * k, 0, 0, Math.PI * 2);
    const b0 = P(10, -141), b1 = P(24, -136), b2 = P(12, -129); g.moveTo(b0[0] + ox, b0[1] + oy); g.lineTo(b1[0] + ox, b1[1] + oy); g.lineTo(b2[0] + ox, b2[1] + oy); g.closePath();
    const t0 = P(-12, -78), t1 = P(12, -78), t2 = P(16, -64), t3 = P(-16, -64); g.moveTo(t0[0] + ox, t0[1] + oy); g.lineTo(t1[0] + ox, t1[1] + oy); g.lineTo(t2[0] + ox, t2[1] + oy); g.lineTo(t3[0] + ox, t3[1] + oy); g.closePath();
  };
  g.fillStyle = INK; shape(1, 1); g.fill(); shape(-1, -1); g.fill();
  g.fillStyle = HEDGE[1]; shape(0, 0); g.fill();
  g.save(); shape(0, 0); g.clip();
  const top = P(0, -172)[1], bot = P(0, -60)[1];
  for (let py = Math.floor(top); py < bot; py += 3) for (let px = 0; px < w; px += 3) {
    const t = hash(px * 0.73 + py * 1.91), up = (bot - py) / (bot - top), lean = (w - px) / w;
    const v = up * 0.5 + lean * 0.35 + (t - 0.5) * 0.5;
    box(g, px + (t > 0.5 ? 1 : 0), py, 3, 3, v > 0.72 ? HEDGE[4] : v > 0.52 ? HEDGE[3] : v > 0.32 ? HEDGE[2] : v > 0.12 ? HEDGE[1] : HEDGE[0]);
  }
  for (const d of [-1, 1]) for (let i = 0; i < 4; i++) { const a = P(d * (16 + i * 10), -108 - i * 6), b = P(d * (30 + i * 10), -140 - i * 7); g.strokeStyle = HEDGE[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  g.restore();
  const [ex, ey] = P(5, -139); box(g, ex, ey, 2, 2, INK); box(g, ex, ey, 1, 1, '#E8F0D0');
  // (the trunk, the planter, its bands, the label)
  box(g, cx - 3, base - 10, 6, 11, '#5A3A1E'); box(g, cx - 3, base - 10, 2, 11, '#7A5230');
  box(g, 2, base - 3, w - 4, 5, INK); box(g, 3, base - 2, w - 6, 3, STONE[3]); box(g, 3, base - 2, w - 6, 1, STONE[4]);
  box(g, 4, base + 2, w - 8, h - base - 2, INK); box(g, 5, base + 2, w - 10, h - base - 3, STONE[2]); box(g, 5, base + 2, 2, h - base - 3, STONE[3]);
  box(g, 5, base + 4, w - 10, 3, FLAG_RED[2]); box(g, 5, base + 7, w - 10, 2, FLAG_WHITE[3]); box(g, 5, base + 9, w - 10, 3, FLAG_BLUE[2]);
  box(g, 5, base + 13, w - 10, 10, INK); box(g, 6, base + 14, w - 12, 8, '#FEF3C7');
  words(g, 'EAGLE (A SHRUB)', cx, base + 21, '#14532D');
};

/** The Fountain of Freedom: the basin (its plaque: THE FOUNTAIN OF FREEDOM, WISHES: TAX FREE), the water and the
 *  coins in it, the pedestal with its spouts, the fluted column banded red, white and blue, the bald eagle on top
 *  (spitting: live). */
const FOUNT_PPM = 28, FOUNT_W = 4.6, FOUNT_H = 5.2;
const paintFountain = (g: Ctx, w: number, h: number) => {
  const cx = Math.round(w / 2);
  // (the basin's back rim, the water, the coins)
  box(g, 6, h - 34, w - 12, 6, INK); box(g, 7, h - 33, w - 14, 4, STONE[2]); box(g, 7, h - 33, w - 14, 1, STONE[4]);
  box(g, 7, h - 29, w - 14, 2, '#9BD3F5'); box(g, 7, h - 27, w - 14, 3, '#4F98D8');
  for (let i = 0; i < 12; i++) box(g, 9 + hash(i * 3.1) * (w - 18), h - 27 + hash(i * 7.7) * 2, 2, 1, hash(i) > 0.3 ? '#E8B400' : '#C0C0C8');
  // (the pedestal, its spouts, the column, its bands, the capital)
  box(g, cx - 13, h - 46, 26, 18, INK); box(g, cx - 12, h - 45, 24, 16, STONE[2]); box(g, cx - 12, h - 45, 24, 2, STONE[3]); box(g, cx + 9, h - 45, 3, 16, STONE[1]);
  for (const sx of [cx - 13, cx + 12]) { box(g, sx - 1, h - 40, 3, 3, INK); box(g, sx, h - 39, 1, 1, GOLD[3]); }
  box(g, cx - 8, h - 42, 16, 5, INK); box(g, cx - 7, h - 41, 14, 3, '#B8862E');
  box(g, cx - 8, h - 104, 16, 58, INK);
  const col = ['#F6F2E8', '#E7E1D4', '#D2CABA', '#B8B0A0'];
  for (let i = 0; i < 14; i++) box(g, cx - 7 + i, h - 104, 1, 58, col[[0, 0, 1, 0, 1, 1, 2, 1, 2, 2, 3, 2, 3, 3][i]]);
  box(g, cx - 7, h - 78, 14, 3, FLAG_RED[2]); box(g, cx - 7, h - 75, 14, 2, FLAG_WHITE[3]); box(g, cx - 7, h - 73, 14, 3, FLAG_BLUE[2]);
  box(g, cx - 10, h - 108, 20, 4, INK); box(g, cx - 9, h - 107, 18, 2, STONE[3]);
  box(g, cx - 12, h - 112, 24, 4, INK); box(g, cx - 11, h - 111, 22, 2, STONE[3]); box(g, cx - 11, h - 111, 22, 1, STONE[4]);
  eagle(g, cx, h - 126, 0.8);
  // (the basin's front: panels, the plaque, its foot)
  box(g, 1, h - 24, w - 2, 22, INK); box(g, 2, h - 23, w - 4, 20, STONE[2]); box(g, 2, h - 23, w - 4, 2, STONE[4]); box(g, 2, h - 5, w - 4, 2, STONE[1]);
  box(g, 5, h - 22, w - 10, 18, INK); box(g, 6, h - 21, w - 12, 16, '#B8862E'); box(g, 6, h - 21, w - 12, 1, '#F3D77A'); box(g, 6, h - 6, w - 12, 1, '#7A5A18');
  words(g, 'FOUNTAIN OF FREEDOM', cx, h - 14, '#3A2408');
  words(g, 'WISHES: TAX FREE', cx, h - 7, '#5A3A10');
  box(g, 0, h - 3, w, 3, STONE[1]);
};
/** The eagle's spit: an arc of water from its beak into the basin, the colors marching down it; a splash (live). */
const fountainLive = (c: Ctx, sx: number, sy: number, s: number, t: number) => {
  if (s < 4) return;
  const k = s / FOUNT_PPM, X = (px: number) => sx + (px - (FOUNT_W * FOUNT_PPM) / 2) * k, Y = (py: number) => sy - (FOUNT_H * FOUNT_PPM - py) * k;
  const H = Math.round(FOUNT_H * FOUNT_PPM), W2 = (FOUNT_W * FOUNT_PPM) / 2;
  const x0 = X(W2 + 7), y0 = Y(H - 132), x1 = X(W2 + 40), y1 = Y(H - 28), n = Math.max(6, Math.round(Math.hypot(x1 - x0, y1 - y0) / 2)), th = Math.max(1, Math.round(k * 2));
  const f = Math.floor(t / 2);
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = x0 + (x1 - x0) * u, y = y0 - 10 * k * u + (y1 - y0 + 10 * k) * u * u, q = (i - f) & 3;
    box(c, x - th / 2, y - th / 2, th, th, q === 0 ? '#F2FAFF' : q === 1 ? '#BFE3FF' : '#7FC0F0');
  }
  for (let i = 0; i < 4; i++) { const u = ((t + i * 6) % 22) / 22; box(c, x1 + (i - 1.5) * 3 * k * u, y1 - Math.sin(u * Math.PI) * 5 * k, th, th, '#DDF1FF'); }
};

/** A cart (popcorn's or churros'): spoked red wheels, the body with its gold trim, the glass case (popcorn heaped in
 *  it, or churros stood up), the striped canopy on its poles, the board on top. */
const paintCart = (kind: 'popcorn' | 'churro') => (g: Ctx, w: number, h: number) => {
  const body = rampOf(kind === 'popcorn' ? '#B91C1C' : '#1E3A8A'), cx = Math.round(w / 2);
  // (the canopy's poles, the case, the body)
  for (const px of [6, w - 8]) { box(g, px, 14, 2, h - 40, INK); box(g, px, 14, 1, h - 40, '#E8E6E0'); }
  box(g, 6, h - 52, w - 12, 22, INK); box(g, 7, h - 51, w - 14, 20, kind === 'popcorn' ? '#FFF6D8' : '#E8D8C0'); box(g, 7, h - 51, w - 14, 3, '#FFFFFF');
  if (kind === 'popcorn') for (let i = 0; i < 70; i++) { const px = 8 + hash(i * 1.7) * (w - 18), py = h - 36 + hash(i * 3.3) * 5 - (1 - Math.abs(px - cx) / cx) * 6; box(g, px, py, 2, 2, hash(i * 5.1) > 0.4 ? '#FDE68A' : '#FFFBEB'); }
  else for (let i = 0; i < 8; i++) { const px = 11 + i * ((w - 22) / 7); box(g, px - 1, h - 48, 3, 17, '#7A4A1E'); box(g, px, h - 48, 1, 17, '#D4A060'); for (let y = h - 47; y < h - 31; y += 3) box(g, px - 1, y, 1, 1, '#FFF4D0'); }
  box(g, 7, h - 32, w - 14, 1, 'rgba(255, 255, 255, 0.5)');
  box(g, 3, h - 30, w - 6, 18, INK); box(g, 4, h - 29, w - 8, 16, body[2]); box(g, 4, h - 29, w - 8, 2, body[3]); box(g, 4, h - 15, w - 8, 2, body[1]);
  box(g, 4, h - 25, w - 8, 1, GOLD[3]); box(g, 4, h - 18, w - 8, 1, GOLD[2]);
  // (the wheels: rims, spokes, hubs)
  for (const wx of [12, w - 12]) {
    g.fillStyle = INK; g.beginPath(); g.arc(wx, h - 8, 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#C62828'; g.beginPath(); g.arc(wx, h - 8, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#F8FAFC'; g.beginPath(); g.arc(wx, h - 8, 5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#C62828'; g.lineWidth = 1; for (let a = 0; a < 6; a++) { g.beginPath(); g.moveTo(wx, h - 8); g.lineTo(wx + Math.cos(a) * 5, h - 8 + Math.sin(a) * 5); g.stroke(); }
    box(g, wx - 1, h - 9, 2, 2, GOLD[3]);
  }
  // (the canopy: stripes, scalloped, lit on top)
  box(g, 1, 13, w - 2, 9, INK);
  for (let x = 2, k = 0; x < w - 2; x += 6, k++) { const R = k % 2 ? FLAG_WHITE : FLAG_RED, sw = Math.min(6, w - 2 - x); box(g, x, 14, sw, 7, R[2]); box(g, x, 14, sw, 2, R[3]); g.fillStyle = R[1]; g.beginPath(); g.ellipse(x + sw / 2, 21, sw / 2, 2, 0, 0, Math.PI); g.fill(); }
  // (the board)
  box(g, 4, 0, w - 8, 12, INK); box(g, 5, 1, w - 10, 10, '#FEF3C7'); box(g, 5, 1, w - 10, 1, '#FFFFFF');
  words(g, kind === 'popcorn' ? 'POPCORN' : 'CHURROS', cx, 9, kind === 'popcorn' ? '#B91C1C' : '#1E3A8A');
};

/** A bench: slats lit along their tops, iron ends, the brass plaque. */
const paintBench = (g: Ctx, w: number, h: number) => {
  const wd = rampOf('#8A5A2E');
  for (let i = 0; i < 3; i++) { box(g, 2, 2 + i * 4, w - 4, 4, INK); box(g, 3, 3 + i * 4, w - 6, 2, wd[2]); box(g, 3, 3 + i * 4, w - 6, 1, wd[3]); }
  box(g, 1, h - 13, w - 2, 5, INK); box(g, 2, h - 12, w - 4, 3, wd[2]); box(g, 2, h - 12, w - 4, 1, wd[4]);
  for (const ex of [5, w - 9]) { box(g, ex, 1, 4, h - 1, '#1D1F2A'); box(g, ex, 1, 1, h - 1, '#4A4E66'); box(g, ex - 1, h - 2, 6, 2, '#1D1F2A'); }
  box(g, w / 2 - 5, 6, 10, 3, INK); box(g, w / 2 - 4, 7, 8, 1, GOLD[3]);
};
/** A trash can: navy, banded red and white, a star, its lid. */
const paintCan = (g: Ctx, w: number, h: number) => {
  const B = FLAG_BLUE;
  box(g, 2, 6, w - 4, h - 6, INK);
  const cols = [B[3], B[3], B[2], B[2], B[2], B[1], B[1], B[0]];
  for (let i = 0; i < w - 6; i++) box(g, 3 + i, 7, 1, h - 8, cols[Math.min(cols.length - 1, Math.floor((i / (w - 6)) * cols.length))]);
  box(g, 3, 13, w - 6, 3, FLAG_RED[2]); box(g, 3, 16, w - 6, 2, FLAG_WHITE[3]); box(g, 3, 18, w - 6, 3, FLAG_RED[2]);
  box(g, w / 2 - 2, h - 9, 3, 3, '#F8FAFC');
  g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, 6, w / 2, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = B[2]; g.beginPath(); g.ellipse(w / 2, 5, w / 2 - 1, 2, 0, 0, Math.PI * 2); g.fill();
  box(g, w / 2 - 3, 4, 3, 1, B[4]); box(g, w / 2 - 2, 0, 4, 3, INK); box(g, w / 2 - 1, 1, 2, 1, B[3]);
};
/** A board on two posts, planted on the sidewalk: the words, a star either end. */
const paintBoard = (lines: string[], face: string, ink: string) => (g: Ctx, w: number, h: number) => {
  const bh = 6 + lines.length * 9;
  for (const px of [8, w - 10]) { box(g, px - 1, bh, 4, h - bh, INK); box(g, px, bh, 2, h - bh, '#5C3A1E'); box(g, px, bh, 1, h - bh, '#8A5A2E'); }
  const F = rampOf(face);
  box(g, 0, 0, w, bh + 2, INK); box(g, 1, 1, w - 2, bh, face); box(g, 1, 1, w - 2, 1, F[4]); box(g, 1, 2, w - 2, 1, F[3]); box(g, 1, bh, w - 2, 1, F[1]);
  lines.forEach((s, i) => words(g, s, w / 2, 10 + i * 9, ink, mix(face, INK, 0.5)));
  for (const sx of [4, w - 5]) box(g, sx - 1, 4, 2, 2, GOLD[3]);
};

// (the litter: what he's dropped on his way out, coming by again and again)
const churro = (g: Ctx, w: number, h: number) => { box(g, 0, h - 3, w, 3, INK); box(g, 1, h - 3, w - 2, 2, '#B07A3A'); box(g, 1, h - 3, w - 2, 1, '#E8B870'); for (let x = 2; x < w - 1; x += 3) box(g, x, h - 3, 1, 1, '#FFF4D0'); };
const cup = (g: Ctx, w: number, h: number) => { box(g, 0, h - 5, w - 2, 5, INK); box(g, 1, h - 4, w - 4, 3, '#F8FAFC'); box(g, 1, h - 3, w - 4, 1, '#B91C1C'); box(g, w - 3, h - 4, 2, 3, '#1E3A8A'); box(g, 2, h - 7, 1, 3, '#E8E6E0'); };
const tinyFlag = (g: Ctx, w: number, h: number) => { box(g, 1, h - 2, w - 2, 1, '#8A6A3A'); box(g, w - 7, h - 5, 6, 3, FLAG_RED[2]); box(g, w - 7, h - 4, 6, 1, FLAG_WHITE[3]); box(g, w - 7, h - 5, 3, 2, FLAG_BLUE[2]); };
const popcorn = (g: Ctx, w: number, h: number) => { for (let i = 0; i < 6; i++) box(g, hash(i * 2.3) * (w - 2), h - 2 - hash(i * 4.1) * 2, 2, 2, i % 2 ? '#FDE68A' : '#FFFBEB'); };
const stub = (g: Ctx, w: number, h: number) => { box(g, 0, h - 3, w, 3, '#7F1D1D'); box(g, 1, h - 3, w - 2, 2, '#F6D24E'); box(g, w - 4, h - 3, 1, 2, '#7F1D1D'); };

// ---------------------------------------------------------------------------------------------------------------
// What's along the way (z: how far off it is when he sets off, m; x across, from his path)

/** The street goes on as long as he walks (the end walk waits on a press, as long as it takes): everything along its
 *  sides comes round again, the street being STREET m long. What's gone off to the far end (STREET m off: a few px,
 *  in the haze, behind the next one along) is brought back in by the camera, past the edge of the picture there (the
 *  sides' things are wide of the picture till they're a few meters off), and goes off away again like the rest. */
const STREET = 154;
let travelNow = 0;
const looped = (p: Prop): Prop => {
  const z0 = p.z;
  return Object.defineProperty(p, 'z', { get: () => z0 - STREET * Math.floor((z0 + travelNow - 0.6) / STREET), enumerable: true });
};

const props = (): Prop[] => {
  travelNow = 0;
  const out: Prop[] = [];
  const at = (off: number) => PX + off;
  // The shopfronts either side, on and on into the haze
  for (let i = 0; i < 44; i++) {
    const side = i % 2 ? 1 : -1, k = (i * 3 + (i >> 1)) % SHOPS.length, S = SHOPS[k];
    out.push({ id: `wa-am-shop${k}`, x: at(side * (SHOP_X + SHOP_W / 2)), z: 3 + i * 3.5, w: SHOP_W, h: S.h * 0.66, ppm: SHOP_PPM, paint: paintShop(S) });
  }
  // The lamps out on the sidewalks (none where the booths and the eagle stand), short: the sky's kept open
  for (let i = 0; i < 32; i++) {
    const z = 2.8 + (i * STREET) / 32;
    for (const side of [-1, 1]) {
      if (side > 0 && z > 5 && z < 15) continue;
      out.push({ id: `wa-am-lamp${(i + (side > 0 ? 1 : 0)) % 2}`, x: at(side * 6.2), z, w: LAMP_W, h: LAMP_H, ppm: LAMP_PPM, paint: paintLamp(i + (side > 0 ? 1 : 0)), live: lampGlow });
    }
  }
  // Flag poles out by the fronts, Old Glory on each
  for (let i = 0; i < 8; i++) out.push({ id: 'wa-am-pole', x: at((i % 2 ? 1 : -1) * 9.6), z: 5 + (i * STREET) / 8, w: 0.5, h: POLE_H, ppm: POLE_PPM, paint: paintPole, live: poleFlag(i * 1.7) });
  // The ticket booths and THE EAGLE (A SHRUB) by them, the carts
  out.push({ id: 'wa-am-booth', x: at(4.7), z: 10.5, w: 4.0, h: 5.1, ppm: 24, paint: paintBooth });
  out.push({ id: 'wa-am-eagle', x: at(4.6), z: 6.5, w: 3.2, h: 3.4, ppm: 32, paint: paintEagle });
  out.push({ id: 'wa-am-popcorn', x: at(-4.4), z: 4, w: 2.2, h: 2.8, ppm: 28, paint: paintCart('popcorn') });
  out.push({ id: 'wa-am-churro', x: at(4.4), z: 33, w: 2.2, h: 2.8, ppm: 28, paint: paintCart('churro') });
  // Benches, trash cans, the signs
  for (const [x, z] of [[5.6, 16], [-5.6, 30], [5.6, 36], [-5.6, 51]] as const) out.push({ id: 'wa-am-bench', x: at(x), z, w: 1.9, h: 1.0, ppm: 28, paint: paintBench });
  for (const [x, z] of [[3.0, 4.6], [-3.0, 19], [3.0, 22.5], [-3.0, 40], [3.0, 47]] as const) out.push({ id: 'wa-am-can', x: at(x), z, w: 0.7, h: 1.1, ppm: 32, paint: paintCan });
  out.push({ id: 'wa-am-sign0', x: at(4.6), z: 20, w: 2.6, h: 2.2, ppm: 28, paint: paintBoard(['NO REFUNDS'], '#1E3A8A', '#FEF3C7') });
  out.push({ id: 'wa-am-sign1', x: at(4.6), z: 26, w: 3.6, h: 2.4, ppm: 28, paint: paintBoard(['LAND OF THE FREE', 'ADMISSION $189'], '#FEF3C7', '#7F1D1D') });
  out.forEach(looped);
  // (the fountain's in the middle of the street: it doesn't come round again (it'd be at the camera))
  out.push({ id: 'wa-am-fountain', x: PX, z: 8, w: FOUNT_W, h: FOUNT_H, ppm: FOUNT_PPM, paint: paintFountain, live: fountainLive });
  // His litter, all the way
  const litter: [string, (g: Ctx, w: number, h: number) => void, number, number][] = [['churro', churro, 0.4, 0.1], ['cup', cup, 0.25, 0.2], ['flag', tinyFlag, 0.3, 0.16], ['pop', popcorn, 0.25, 0.1], ['stub', stub, 0.2, 0.08]];
  for (let k = 0; k < 16; k++) { const [id, paint, w, h] = litter[k % litter.length]; out.push({ id: `wa-am-lit-${id}`, x: PX + (hash(k * 2.7) - 0.5) * 4.4, z: 2 + k * 1.9, w, h, ppm: 40, paint, wrap: true }); }
  return out;
};

export const AMERICA_EXIT: SceneDef = {
  land: 'AMERICA USA',
  weapon: null,
  title: 'HEADING HOME',
  sky: ['#121634', '#1E2250', '#33306A', '#563E78', '#8A5276', '#C27064'],
  haze: '#7E5A80',
  ground, back, props,
  drawWeapon: () => {},
  grip: [[-4, 2], [16, 2]],
  rim: '#FDE68A',
};
