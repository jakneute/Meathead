// PIPER THE PIXIE's place in hell (LUST: bloodlust): HELL'S PIXIE BEDROOM. She wanted Meathead dead so badly she could
// taste it. Now he's the only visitor she ever gets, forever. Her chambers gone dark maroon, thorned vines up her walls
// with thorned hearts on them; her trophy wall of dead suitors swapped for a kill wall of crude Meathead dolls pinned
// to their shields, every one of them still alive and grinning, under her board (MEATHEADS KILLED: 0, VISITORS THIS
// CENTURY: 1 (HIM)); the sheets changed once a century (the card's pinned to them), flies over the bed; out the
// balcony and the hall's window, hell: a thorned heart for a moon over a valley of thorn spires.
//
// In through fantasy/bedroom/room.ts ROOM_HOOKS (key, wallOver, trophies, after) and view.ts VIEW_HOOKS.view: painted
// once (the room's own still art, keyed apart for the refight); live: only the flies.

import type { GameState } from '../../../../m1/game/core/state';
import type { HellPlace } from '../defs';
import { GY } from '../../../fantasy/geometry';
import { CEIL_Y, R, LEDGES, TROPHY_X } from '../../../fantasy/bedroom/layout';
import { pixelBlob } from '../../../../m1/game/render/pixelArt';
import { type Ctx, type Look, INK, h01, box, poly, line, bake, sign, bandedGradient, steppedGlow, checker, signText, seen } from './kitPA';

const THORN = ['#0A0406', '#16080C', '#241014', '#38181E', '#4E2228'];
const HEART = ['#3A0410', '#6A0A1E', '#A01430', '#D02848', '#F05A78', '#FFA0B4'];
const BURLAP = ['#2A1E10', '#46341C', '#64502E', '#82703E', '#A08E56', '#BEAC74'];
const WALNUT = ['#140A06', '#24140C', '#361E12', '#4A2A1A', '#603824', '#7A4A30'];

// ---------------------------------------------------------------------------------------------------------------
// Her walls (world space, over her own paint, in the wall's stretch a..b)

/** A thorned vine from (x, y) going up and along, `len` long. */
const vine = (g: Ctx, x: number, y: number, len: number, seed: number) => {
  let cx = x, cy = y, a = -Math.PI / 2 + (h01(seed) - 0.5) * 0.8;
  const pts: [number, number][] = [[cx, cy]];
  for (let i = 0; i < len; i += 6) { a += (h01(seed + i * 0.13) - 0.5) * 0.5; cx += Math.cos(a) * 6; cy += Math.sin(a) * 6; pts.push([cx, cy]); }
  g.lineCap = 'round'; g.lineJoin = 'round';
  line(g, pts, INK, 5); line(g, pts, THORN[3], 3); line(g, pts.map(([px, py]) => [px - 1, py - 1]), THORN[4], 1);
  for (let i = 2; i < pts.length; i += 2) { const [px, py] = pts[i], s = i % 4 ? 1 : -1; poly(g, [[px, py - 1], [px + s * 6, py - 3], [px, py + 2]], INK); poly(g, [[px, py], [px + s * 5, py - 2], [px, py + 1]], '#7A2A30'); }
  return pts[pts.length - 1];
};
/** A heart wrapped in thorns, its middle at (x, y). */
const thornHeart = (g: Ctx, x: number, y: number, s = 1) => {
  const heart = (k: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x - 6 * s * k, y - 2 * s, 7 * s * k, Math.PI * 0.75, Math.PI * 2); g.arc(x + 6 * s * k, y - 2 * s, 7 * s * k, Math.PI, Math.PI * 2.25); g.lineTo(x, y + 13 * s * k); g.closePath(); g.fill(); };
  heart(1.15, INK); heart(1, HEART[2]); heart(0.7, HEART[3]);
  box(g, x - 7 * s, y - 6 * s, 3 * s, 2 * s, HEART[5]);
  for (let k = 0; k < 7; k++) { const ax = x - 12 * s + k * 4 * s; line(g, [[ax, y - 8 * s + (k % 2) * 12 * s], [ax + 5 * s, y + 6 * s - (k % 2) * 10 * s]], THORN[1], 2); box(g, ax + 2 * s, y - 2 * s + (k % 3) * 3 * s, 2, 2, '#C8A0A0'); }
  // (a drop off its tip)
  box(g, x - 1, y + 13 * s, 2, 4 * s, HEART[1]);
};
const wallOver = (g: Ctx, a: number, b: number) => {
  // (dark maroon over all of it: her pink gone to the color of a scab)
  g.save(); g.globalCompositeOperation = 'multiply';
  g.fillStyle = '#7E3A4E'; g.fillRect(a, CEIL_Y - 10, b - a, GY - CEIL_Y + 10);
  g.fillStyle = '#B07080'; g.fillRect(a, GY, b - a, 140);
  g.restore();
  bandedGradient(g, a, CEIL_Y, b - a, 120, ['rgba(10,2,6,0.7)', 'rgba(10,2,6,0.45)', 'rgba(10,2,6,0.25)', 'rgba(10,2,6,0.1)', 'rgba(10,2,6,0)'], 5);
  // (vines up from the wainscot, thorned hearts on them; every 150 or so, each its own)
  for (let x = Math.floor(a / 150) * 150; x < b + 150; x += 150) {
    const seed = x * 0.017, vx = x + h01(seed) * 60;
    if (vx < a - 40 || vx > b + 40) continue;
    const end = vine(g, vx, GY - 120, 140 + h01(seed * 3) * 140, seed * 11);
    if (h01(seed * 7) > 0.35) thornHeart(g, end[0], end[1] - 4, 0.9 + h01(seed * 5) * 0.4);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The kill wall (world space, in the trophies' box: TROPHY_X - 120 .. + 180, GY - 464 .. GY - 160)

/** A crude Meathead doll, stuffed burlap (rag limbs, no joints to bend), his glasses in wire, a stitched mouth grinning,
 *  pins stuck all through him; its middle at (x, y). */
const doll = (g: Ctx, x: number, y: number, i: number) => {
  const B = BURLAP;
  // (rag arms and legs: stuffed tubes, stitched at the ends)
  for (const s of [-1, 1]) {
    line(g, [[x + s * 8, y - 6], [x + s * 20, y + 2 + (i % 2) * 4]], INK, 7); line(g, [[x + s * 8, y - 6], [x + s * 20, y + 2 + (i % 2) * 4]], B[3], 5);
    line(g, [[x + s * 5, y + 10], [x + s * 9, y + 26]], INK, 7); line(g, [[x + s * 5, y + 10], [x + s * 9, y + 26]], B[2], 5);
  }
  // (the body: a lump of burlap, blue trunks drawn on, his belt)
  pixelBlob(g, x, y + 2, 12, 13, INK, 1); pixelBlob(g, x, y + 2, 11, 12, B[3], 1); pixelBlob(g, x - 3, y - 1, 5, 6, B[4], 1);
  box(g, x - 10, y + 6, 20, 7, '#2A4AA0'); box(g, x - 10, y + 5, 20, 2, '#C8A020');
  // (the head: big, round, burlap; a black buzz drawn on; the glasses in wire; button eyes; a stitched grin)
  pixelBlob(g, x, y - 18, 12, 11, INK, 1); pixelBlob(g, x, y - 18, 11, 10, B[3], 1); pixelBlob(g, x - 3, y - 21, 5, 4, B[4], 1);
  box(g, x - 9, y - 28, 18, 4, '#1A1410');
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(x + s * 5 - 4, y - 20, 8, 6); box(g, x + s * 5 - 1, y - 18, 3, 3, INK); box(g, x + s * 5, y - 18, 1, 1, '#E8E8E8'); }
  box(g, x - 1, y - 18, 2, 1, INK);
  for (let k = -5; k <= 5; k += 2) { box(g, x + k, y - 11 + Math.round(Math.abs(k) * 0.2), 1, 3, INK); }
  box(g, x - 6, y - 10, 12, 1, '#7A2020');
  // (pins: steel, colored heads, all through him)
  for (let k = 0; k < 6; k++) {
    const px = x + (h01(i * 7 + k) - 0.5) * 20, py = y - 24 + h01(i * 3 + k * 2) * 36, ang = -0.7 + h01(i + k) * 1.4;
    line(g, [[px, py], [px + Math.cos(ang) * 9, py - Math.sin(ang) * 9]], '#C8C8D0', 1);
    box(g, px + Math.cos(ang) * 9 - 1, py - Math.sin(ang) * 9 - 1, 3, 3, [HEART[3], '#F2C84A', '#4A8AE0'][k % 3]);
  }
  // (a big hat pin through his head, a knife through the gut on one)
  line(g, [[x - 18, y - 30], [x + 10, y - 14]], '#D8D8E0', 1); box(g, x - 20, y - 32, 4, 4, HEART[4]);
  if (i === 4) { line(g, [[x + 4, y + 4], [x + 22, y - 6]], INK, 4); line(g, [[x + 4, y + 4], [x + 22, y - 6]], '#C8C8D0', 2); box(g, x + 20, y - 9, 6, 5, WALNUT[3]); }
};
const shield = (g: Ctx, x: number, y: number) => {
  const sh = (k: number): [number, number][] => [[x - 26 * k, y - 30 * k], [x + 26 * k, y - 30 * k], [x + 26 * k, y + 8 * k], [x, y + 32 * k], [x - 26 * k, y + 8 * k]];
  poly(g, sh(1.08), INK); poly(g, sh(1), '#8A6A20'); poly(g, sh(0.9), WALNUT[3]); poly(g, sh(0.9).map(([px, py]) => [px - 2, py - 2]), WALNUT[4]); poly(g, sh(0.78), WALNUT[2]);
};
const paintKillWall = (g: Ctx) => {
  const x = TROPHY_X + 45, y = GY - 450, w = 216, l = x - w / 2;
  // (her board: the felt, the header, the score)
  box(g, l - 5, y - 1, w + 10, 64, INK); box(g, l - 4, y, w + 8, 62, '#8A6A20'); box(g, l - 4, y, w + 8, 1, '#E8C84E');
  box(g, l, y + 4, w, 54, '#1A0A10'); checker(g, l, y + 4, w, 2, '#2A1018', 0, 2);
  const chalk = '#ECE4E0';
  signText(g, 'MEATHEADS KILLED:', x - 20, y + 20, { sx: 1, sy: 2, fill: chalk, gap: 1 });
  signText(g, '0', x + 86, y + 22, { sx: 3, sy: 3, fill: HEART[4], gap: 1, shadow: INK });
  signText(g, 'VISITORS THIS CENTURY: 1', x, y + 38, { sx: 1, sy: 1, fill: chalk, gap: 1 });
  signText(g, '(HIM. AGAIN.)', x, y + 52, { sx: 1, sy: 1, fill: HEART[4], gap: 1 });
  // (the dolls on the suitors' shields, in their places; a name plate each, all the same)
  const plate: Look = { sx: 1, sy: 1, fill: '#2A1A06', gap: 1 };
  for (let i = 0; i < 6; i++) {
    const sx = TROPHY_X - 30 + (i % 3) * 75, sy = GY - 328 + Math.floor(i / 3) * 114;
    shield(g, sx, sy);
    doll(g, sx, sy - 4, i);
    box(g, sx - 25, sy + 36, 50, 9, INK); box(g, sx - 24, sy + 37, 48, 7, '#C8A024'); signText(g, 'MEATHEAD', sx, sy + 43, plate);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The view out (her balcony's doors, the hall's window): hell

const view = (g: Ctx, l: number, r: number, top: number, bot: number, hY: number) => {
  const w = r - l;
  bandedGradient(g, l, top, w, hY - top, ['#0A0206', '#160410', '#24061A', '#360A22', '#4E1028', '#6E1A2E', '#94283A', '#B84448'], 12);
  box(g, l, hY, w, bot - hY, '#1A060C');
  // (the moon: a heart, thorned round, bleeding light)
  const mx = l + w * 0.68, my = top + (hY - top) * 0.3;
  steppedGlow(g, mx, my, 40, '#F05A78', 0.18, 0, 4);
  thornHeart(g, mx, my, 1.3);
  // (the valley: thorn spires in three rows, hazed, the near ones black)
  const rows: [number, string, number][] = [[hY - 6, '#5A1A26', 18], [hY + 6, '#36101A', 14], [bot, '#140408', 22]];
  rows.forEach(([base, col, n], ri) => {
    for (let k = 0; k < n; k++) {
      const x = l + h01(k * 3.7 + ri * 11) * w, h = (10 + h01(k * 5.1 + ri) * 30) * (ri + 1) * 0.8;
      poly(g, [[x - 4 - ri * 2, base], [x, base - h], [x + 4 + ri * 2, base]], col);
      if (ri === 2) { poly(g, [[x, base - h * 0.5], [x + 6, base - h * 0.62], [x + 1, base - h * 0.42]], col); }
    }
    if (ri < 2) box(g, l, base - 2, w, bot - base + 2, col);
  });
  // (fires down in the valley)
  for (let k = 0; k < 4; k++) { const x = l + 10 + h01(k * 9.1) * (w - 20), y = hY + 4 + (k % 2) * 6; steppedGlow(g, x, y, 10, '#F08A40', 0.35, 0, 3); box(g, x - 1, y - 3, 3, 3, '#FAD07A'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The bed: the sheets changed once a century (world space, over her bed; its top's lip kept clear: it's a ledge)

const [BED_X, BED_W] = LEDGES[0];
const paintBedGrime = (g: Ctx) => {
  const w = BED_W;
  // (stains on the mattress and down the skirt: brown, yellow at the edges, dithered)
  for (let k = 0; k < 7; k++) {
    const x = 20 + h01(k * 3.3) * (w - 60), y = 40 + h01(k * 1.9) * 18, rw = 10 + h01(k * 5.7) * 18;
    pixelBlob(g, x, y, rw + 2, 5, 'rgba(160, 120, 40, 0.5)', 1); pixelBlob(g, x, y, rw, 4, 'rgba(90, 60, 20, 0.6)', 1);
  }
  for (let k = 0; k < 4; k++) { const x = 30 + k * 64; pixelBlob(g, x, 78, 8, 10, 'rgba(60, 40, 20, 0.5)', 1); }
  // (cobwebs between the posts, up under the valance)
  for (const cx of [6, w - 6]) {
    g.strokeStyle = 'rgba(220, 220, 230, 0.55)'; g.lineWidth = 1;
    for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(cx, 2); g.lineTo(cx + (cx < w / 2 ? 1 : -1) * (14 + k * 6), 32 - k * 5); g.stroke(); }
    for (let r = 1; r < 4; r++) { g.beginPath(); g.arc(cx, 2, r * 9, cx < w / 2 ? 0.1 : Math.PI * 0.6, cx < w / 2 ? Math.PI * 0.4 : Math.PI * 0.9); g.stroke(); }
  }
  // (the card pinned to the sheets)
  const card: Look = { sx: 1, sy: 1, fill: INK, gap: 1 };
  sign(g, w / 2 + 40, 50, [['SHEETS CHANGED:', card], ['1926', card]], '#E8DCC0', WALNUT, 3);
  box(g, w / 2 + 40, 36, 2, 4, '#C8C8D0');
};
/** Bed grime drawn over the bed (its box from the mattress down; the canopy top above it untouched). */
const drawAfter = (c: Ctx, state: GameState) => {
  const bx = R(BED_X);
  if (!seen(state, bx - 20, bx + BED_W + 20)) return;
  c.drawImage(bake('rf4-fa-bedgrime', BED_W, 100, paintBedGrime), bx, GY - 100);
  // (the flies over it, live)
  const f = state.frame;
  for (let k = 0; k < 5; k++) {
    const a = f * (0.07 + k * 0.013) + k * 1.7, fx = bx + BED_W * 0.5 + Math.cos(a) * (40 + k * 18), fy = GY - 80 + Math.sin(a * 1.6) * 16 - k * 3;
    c.fillStyle = INK; c.fillRect(Math.round(fx), Math.round(fy), 2, 2);
    if ((f >> 1) % 2) { c.fillStyle = 'rgba(200, 210, 230, 0.7)'; c.fillRect(Math.round(fx) - 1, Math.round(fy) - 1, 1, 1); c.fillRect(Math.round(fx) + 2, Math.round(fy) - 1, 1, 1); }
  }
};

export const fantasyPlace: HellPlace = {
  light: { dark: 0.28, shade: [26, 4, 12], grade: '#F2CCD4' },
};
export const FANTASY_HOOKS = { key: '-rf4', wallOver, trophies: paintKillWall, after: drawAfter, view };

// (dev: a sheet)
export const fantasySheet = (g: Ctx) => {
  g.fillStyle = '#5A3A44'; g.fillRect(0, 0, 900, 420);
  g.save(); g.translate(-(TROPHY_X - 120), -(GY - 464)); paintKillWall(g); g.restore();
  g.save(); g.translate(330, 0); view(g, 0, 200, 0, 220, 160); g.restore();
  g.save(); g.translate(560, 20); g.fillStyle = '#C890A0'; g.fillRect(0, 0, BED_W, 100); paintBedGrime(g); g.restore();
  g.save(); g.translate(330, 240 - (GY - 170)); g.fillStyle = '#E0B0C0'; g.fillRect(0, GY - 170, 560, 170); wallOver(g, 0, 560); g.restore();
};
