// Disaster: The Ride, the lobby's concession stand (the final pass: peak SNES): the counter (a solid: its lit lip stays
// on it, painted in rooms.ts) with its candy case in front, glass glaring, the boxes in rows inside under its
// fluorescent tube; on top of it, left to right, the popcorn machine (its kettle tipping, the corn heaped, a marquee
// cap), the nacho warmer under its red lamp, the cheese pump, the soda fountain (three brands, their levers, the drip
// tray, the ice chute) and a cup stack; on the wall behind, the backlit menu board, the snacks in their own lettering
// and little pictures. All painted once (the counter's stamp; the board into the wall's chunks).

import { type Ctx, INK, box, checker, poly, hash, bandedGradient, pixelBlob, ramp6, words } from '../blvd/kit';
import type { Look } from '../../signLetters';
import { GOLD, TRUSS, CASE } from './paint';

const H = (n: number) => hash(n);
const dot = (g: Ctx, x: number, y: number, col: string) => box(g, x, y, 1, 1, col);
const CHROME = TRUSS;

/** Where the nacho warmer's heat lamp is on the counter (from its top-left), for its live flicker. */
export const WARMER_LAMP = { x: 47, y: -29, w: 30 };

// ---------------------------------------------------------------------------------------------------------------
// The counter

/** The counter, its top-left at (0, 0), w wide, 60 tall (its face), what's on it up to 58 over it. */
export const paintCounter = (g: Ctx, w: number) => {
  const W = ramp6('#92400E'), G = GOLD;
  // (the face: wood, inked, lit down its left, shaded down its right)
  box(g, -1, 0, w + 2, 60, INK);
  box(g, 0, 1, w, 59, W[3]); box(g, 0, 1, 3, 59, W[4]); box(g, 0, 1, 1, 59, W[5]); box(g, w - 5, 1, 5, 59, W[1]); checker(g, w - 8, 1, 3, 59, W[1], 0, 1);
  for (let y = 4; y < 52; y += 3) for (let x = 2; x < w - 4; x += 1) if (H(x * 0.31 + y * 7.3) > 0.93) box(g, x, y, 3, 1, W[2]);
  // (the candy case set into it: chrome frame, the shelves lit by its tube, the boxes in rows, the glass)
  const cx0 = 6, cw = 92, cy0 = 5, ch = 42;
  box(g, cx0 - 2, cy0 - 2, cw + 4, ch + 4, INK);
  box(g, cx0 - 1, cy0 - 1, cw + 2, ch + 2, CHROME[3]); box(g, cx0 - 1, cy0 - 1, cw + 2, 1, CHROME[5]); box(g, cx0 - 1, cy0 + ch, cw + 2, 1, CHROME[1]);
  bandedGradient(g, cx0, cy0, cw, ch, ['#F2E8D0', '#C8B898', '#7A6A54', '#3A3026'], 4, 1);
  box(g, cx0, cy0, cw, 2, '#FFFFFF'); box(g, cx0, cy0 + 2, cw, 1, '#E8F4FC');
  const CANDY: [string, string][] = [['#B91C1C', '#FDE047'], ['#1D4ED8', '#F8FAFC'], ['#15803D', '#FDE68A'], ['#7C2D12', '#FDBA74'], ['#6D28D9', '#F0ABFC'], ['#F59E0B', '#7C2D12'], ['#0F766E', '#99F6E4'], ['#BE185D', '#FBCFE8']];
  for (let r = 0; r < 3; r++) {
    const sy = cy0 + 13 + r * 13;
    // (the shelf: glass edge lit, its shadow, the price tags)
    box(g, cx0, sy, cw, 2, '#D8ECF4'); box(g, cx0, sy, cw, 1, '#FFFFFF'); box(g, cx0, sy + 2, cw, 1, 'rgba(0, 0, 0, 0.35)');
    for (let k = 0, x = cx0 + 2; x < cx0 + cw - 8; k++) {
      const bw = 7 + Math.floor(H(r * 9 + k) * 4), bh = 8 + Math.floor(H(r * 5 + k * 3) * 3), [c, lab] = CANDY[(r * 3 + k * 5) % CANDY.length], R = ramp6(c);
      box(g, x, sy - bh, bw, bh, INK); box(g, x + 1, sy - bh + 1, bw - 2, bh - 1, R[3]); box(g, x + 1, sy - bh + 1, bw - 2, 1, R[4]); box(g, x + 1, sy - bh + 1, 1, bh - 1, R[4]); box(g, x + bw - 2, sy - bh + 1, 1, bh - 1, R[1]);
      box(g, x + 2, sy - bh + 3, bw - 4, 2, lab); if (H(k + r) > 0.5) dot(g, x + 3, sy - 3, lab);
      x += bw + 1;
    }
    for (let k = cx0 + 6; k < cx0 + cw - 4; k += 22) { box(g, k, sy + 1, 5, 3, '#F8FAFC'); dot(g, k + 1, sy + 2, '#B91C1C'); dot(g, k + 3, sy + 2, '#B91C1C'); }
  }
  // (the glass: a cool tint, two glare streaks, its top edge's shine)
  box(g, cx0, cy0, cw, ch, 'rgba(186, 230, 253, 0.08)');
  poly(g, [[cx0 + 10, cy0], [cx0 + 22, cy0], [cx0 + 6, cy0 + ch], [cx0, cy0 + ch]], 'rgba(255, 255, 255, 0.16)');
  poly(g, [[cx0 + 26, cy0], [cx0 + 30, cy0], [cx0 + 14, cy0 + ch], [cx0 + 10, cy0 + ch]], 'rgba(255, 255, 255, 0.2)');
  poly(g, [[cx0 + cw - 18, cy0], [cx0 + cw - 12, cy0], [cx0 + cw - 26, cy0 + ch], [cx0 + cw - 32, cy0 + ch]], 'rgba(255, 255, 255, 0.1)');
  // (smudges: nose prints, a child's hand)
  checker(g, cx0 + 40, cy0 + 26, 6, 4, 'rgba(255, 255, 255, 0.18)', 0, 1); checker(g, cx0 + 62, cy0 + 30, 4, 5, 'rgba(255, 255, 255, 0.14)', 1, 1);
  // (the panel by it: raised, a gold deco fan inlaid; a sticker)
  const px0 = cx0 + cw + 6, pw = w - px0 - 6;
  box(g, px0, 6, pw, 40, W[1]); box(g, px0 + 1, 7, pw - 2, 38, W[2]); box(g, px0 + 1, 7, pw - 2, 1, W[4]); box(g, px0 + 1, 7, 1, 38, W[4]); box(g, px0 + pw - 2, 7, 1, 38, W[0]);
  const fx = px0 + pw / 2, fy = 36;
  for (let i = 0; i < 4; i++) poly(g, [[fx, fy], [fx - 14 + i * 2, fy - 18 + i * 4], [fx + 14 - i * 2, fy - 18 + i * 4]], [G[1], G[3], G[4], G[2]][i]);
  for (let f = -2; f <= 2; f++) { g.strokeStyle = G[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(fx + 0.5, fy); g.lineTo(fx + f * 6 + 0.5, fy - 17); g.stroke(); }
  box(g, fx - 3, fy - 1, 7, 3, G[5]);
  box(g, px0 + 4, 38, pw - 8, 6, '#FEF3C7'); box(g, px0 + 4, 38, pw - 8, 1, '#FFFFFF'); for (let x = px0 + 6; x < px0 + pw - 6; x += 3) box(g, x, 41, 2, 1, '#7F1D1D');
  // (the kick: dark, a gold strip, scuffs)
  box(g, 0, 50, w, 10, W[0]); box(g, 0, 50, w, 1, G[3]); box(g, 0, 51, w, 1, G[1]);
  for (let i = 0; i < 9; i++) box(g, 4 + Math.floor(H(i * 3.3) * (w - 12)), 54 + (i % 3), 4, 1, '#4A2A14');
  // (the top: cream laminate, its rolled edge lit)
  box(g, -4, -2, w + 8, 6, INK); box(g, -3, -1, w + 6, 4, '#E8E0CC'); box(g, -3, -1, w + 6, 1, '#FFFFFF'); box(g, -3, 2, w + 6, 1, '#B8AE96');

  // On it: the popcorn machine
  const pm = 2, pw2 = 38;
  box(g, pm - 1, -16, pw2 + 2, 15, INK); box(g, pm, -15, pw2, 14, '#B91C1C'); box(g, pm, -15, pw2, 2, '#EF4444'); box(g, pm + pw2 - 3, -15, 3, 14, '#7F1D1D');
  box(g, pm + 4, -11, pw2 - 8, 7, '#7F1D1D'); box(g, pm + 5, -10, pw2 - 10, 5, '#FDE047'); for (let k = pm + 6; k < pm + pw2 - 6; k += 3) dot(g, k, -8, '#B91C1C');
  // (its glass box: the corn heaped to the glass, the kettle hung tipping out more, the lamp's yellow light)
  box(g, pm - 1, -50, pw2 + 2, 35, INK);
  bandedGradient(g, pm, -49, pw2, 33, ['#FFF4C8', '#FDE68A', '#F2C14A'], 3, 1);
  for (let i = 0; i < 40; i++) { const x = pm + 2 + H(i * 1.3) * (pw2 - 4), y = -18 - H(i * 2.7) * (8 + (1 - Math.abs(x - pm - pw2 / 2) / (pw2 / 2)) * 6); pixelBlob(g, x, y, 2, 1.6, i % 4 ? '#FFFBEB' : '#F5D78A', 1); }
  for (let i = 0; i < 14; i++) dot(g, pm + 3 + H(i * 5.1) * (pw2 - 6), -18 - H(i * 7.7) * 10, '#D6A43A');
  box(g, pm + pw2 / 2, -48, 1, 10, CHROME[4]);
  poly(g, [[pm + 10, -40], [pm + 28, -42], [pm + 27, -32], [pm + 13, -30]], INK);
  poly(g, [[pm + 11, -39], [pm + 27, -41], [pm + 26, -33], [pm + 14, -31]], CHROME[3]); box(g, pm + 12, -39, 14, 1, CHROME[5]);
  for (let i = 0; i < 6; i++) pixelBlob(g, pm + 9 - i, -39 + i * 3, 1.6, 1.3, '#FFFBEB', 1);
  box(g, pm + 1, -49, 2, 32, 'rgba(255, 255, 255, 0.45)'); poly(g, [[pm + pw2 - 10, -49], [pm + pw2 - 6, -49], [pm + pw2 - 14, -17], [pm + pw2 - 18, -17]], 'rgba(255, 255, 255, 0.22)');
  box(g, pm - 1, -34, pw2 + 2, 1, CHROME[2]);
  // (its cap: red, bulbs round it, a pennant)
  box(g, pm - 3, -57, pw2 + 6, 8, INK); box(g, pm - 2, -56, pw2 + 4, 6, '#B91C1C'); box(g, pm - 2, -56, pw2 + 4, 1, '#F87171');
  for (let k = pm; k < pm + pw2; k += 4) { box(g, k, -54, 2, 2, '#FFF4C8'); dot(g, k, -54, '#FFFFFF'); }
  // The nacho warmer: a glass box on a steel frame, the chips piled, the red lamp in its hood, the cheese pump
  const nw = 44;
  box(g, nw - 1, -36, 36, 35, INK); box(g, nw, -35, 34, 33, 'rgba(186, 230, 253, 0.22)');
  box(g, nw, -35, 34, 6, CASE[2]); box(g, nw, -35, 34, 1, CASE[4]); box(g, WARMER_LAMP.x, WARMER_LAMP.y, WARMER_LAMP.w, 3, '#F97316');
  for (let r = 0; r < 4; r++) for (let i = 0; i < 6 - r; i++) { const x = nw + 3 + r * 2 + i * 5, y = -4 - r * 4; poly(g, [[x, y], [x + 3, y - 6], [x + 6, y]], (i + r) % 2 ? '#E8B830' : '#F2CC50'); dot(g, x + 3, y - 4, '#FFF0A0'); if ((i + r) % 3 === 0) dot(g, x + 2, y - 2, '#C47A1A'); }
  bandedGradient(g, nw, -28, 34, 10, ['rgba(249, 115, 22, 0.25)', 'rgba(249, 115, 22, 0.05)'], 2, 1);
  box(g, nw + 1, -34, 2, 30, 'rgba(255,255,255,0.4)'); box(g, nw + 1, -2, 34, 1, CHROME[2]);
  const cp = 84;
  box(g, cp - 1, -30, 18, 29, INK); box(g, cp, -29, 16, 28, CHROME[3]); box(g, cp, -29, 3, 28, CHROME[5]); box(g, cp + 13, -29, 3, 28, CHROME[1]);
  box(g, cp + 5, -44, 6, 15, INK); box(g, cp + 6, -43, 4, 14, CHROME[2]); box(g, cp + 3, -46, 10, 3, INK); box(g, cp + 4, -45, 8, 1, CHROME[4]);
  box(g, cp + 3, -14, 10, 6, '#F97316'); box(g, cp + 3, -14, 10, 2, '#FDBA74'); box(g, cp + 9, -8, 2, 5, '#F59E0B'); dot(g, cp + 9, -3, '#FDBA74');
  // The soda fountain: steel, its three brands lit, levers, nozzles, the drip tray and its grate, the ice chute
  const sf = 104, sw = 32;
  box(g, sf - 1, -46, sw + 2, 45, INK); box(g, sf, -45, sw, 44, CHROME[3]); box(g, sf, -45, 2, 44, CHROME[5]); box(g, sf + sw - 3, -45, 3, 44, CHROME[1]);
  const BR: [string, string][] = [['#B91C1C', '#FDE047'], ['#15803D', '#F8FAFC'], ['#1E3A8A', '#F97316']];
  BR.forEach(([c, lab], i) => {
    const bx = sf + 2 + i * 10, R = ramp6(c);
    box(g, bx, -43, 9, 13, INK); box(g, bx + 1, -42, 7, 11, R[3]); box(g, bx + 1, -42, 7, 2, R[5]); box(g, bx + 1, -33, 7, 2, R[1]);
    box(g, bx + 2, -39, 5, 3, lab); dot(g, bx + 4, -38, c);
    box(g, bx + 3, -29, 3, 8, INK); box(g, bx + 4, -28, 1, 7, CHROME[5]);
    box(g, bx + 3, -21, 3, 3, CHROME[1]); dot(g, bx + 4, -18, '#6A7A8A');
  });
  box(g, sf + 2, -14, sw - 4, 2, INK); box(g, sf + 2, -12, sw - 4, 10, CASE[2]); for (let k = sf + 3; k < sf + sw - 3; k += 2) box(g, k, -11, 1, 8, CHROME[2]); box(g, sf + 2, -12, sw - 4, 1, CHROME[4]);
  box(g, sf + 10, -17, 8, 5, INK); box(g, sf + 11, -16, 6, 3, '#C8D8E4');
  // (a cup there, half full: FLOOD CUP)
  box(g, sf + 21, -11, 6, 9, INK); box(g, sf + 22, -10, 4, 8, '#F5F5F4'); box(g, sf + 22, -6, 4, 4, '#3B82F6'); box(g, sf + 22, -10, 4, 1, '#FFFFFF');
  // The cup stack
  for (let i = 0; i < 6; i++) { box(g, sf + sw + 2, -6 - i * 5, 9, 6, INK); box(g, sf + sw + 3, -5 - i * 5, 7, 4, i % 2 ? '#DC2626' : '#F5F5F4'); box(g, sf + sw + 3, -5 - i * 5, 1, 4, '#FFFFFF'); }
  // (the lobby's light across the top of it all, the glow off the corn and the lamp on the laminate)
  box(g, nw, -2, 34, 1, 'rgba(253, 186, 116, 0.6)'); box(g, pm, -2, pw2, 1, 'rgba(253, 230, 138, 0.5)');
};

// ---------------------------------------------------------------------------------------------------------------
// The menu board

const header: Look = { sx: 1, sy: 2, fill: ['#FFF7ED', '#FED7AA', '#FB923C', '#EA580C', '#9A3412'], dither: true, ink: '#1C0A06', shadow: '#000000', drop: 1, gap: 1, slant: 0.5 };
const itemL: Look = { sx: 1, sy: 1, fill: ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#CBD5E1'], shadow: '#000000' };
const priceL: Look = { sx: 1, sy: 1, fill: ['#FEF9C3', '#FDE047', '#FACC15', '#CA8A04'], shadow: '#000000', bold: true };

/** The little pictures: 10 x 8 from (x, y). */
const icon = (g: Ctx, k: number, x: number, y: number) => {
  if (k === 0) { box(g, x, y + 5, 10, 3, '#E2E8F0'); for (let i = 0; i < 4; i++) poly(g, [[x + 1 + i * 2, y + 6], [x + 2 + i * 2, y + 1 + (i % 2)], [x + 4 + i * 2, y + 6]], '#F2CC50'); box(g, x + 2, y + 3, 6, 2, '#F97316'); dot(g, x + 4, y + 2, '#EF4444'); }
  else if (k === 1) { box(g, x, y + 3, 10, 4, '#E8B870'); box(g, x + 1, y + 4, 8, 2, '#B4432A'); for (let i = 0; i < 4; i++) dot(g, x + 1 + i * 2, y + 3 + (i % 2), '#FDE047'); poly(g, [[x + 6, y + 3], [x + 9, y], [x + 8, y + 3]], 'rgba(200,200,200,0.8)'); }
  else if (k === 2) { poly(g, [[x + 2, y], [x + 8, y], [x + 7, y + 8], [x + 3, y + 8]], '#F5F5F4'); box(g, x + 3, y + 3, 4, 4, '#3B82F6'); box(g, x + 5, y - 2, 1, 4, '#EF4444'); }
  else if (k === 3) { poly(g, [[x + 1, y + 2], [x + 9, y + 2], [x + 8, y + 8], [x + 2, y + 8]], '#B91C1C'); for (let i = 0; i < 3; i++) box(g, x + 2 + i * 3, y + 3, 1, 5, '#F5F5F4'); for (let i = 0; i < 5; i++) pixelBlob(g, x + 2 + i * 1.5, y + 1, 1.5, 1.2, '#9CA3AF', 1); }
  else if (k === 4) { poly(g, [[x + 2, y + 2], [x + 8, y + 2], [x + 7, y + 8], [x + 3, y + 8]], '#F9A8D4'); pixelBlob(g, x + 5, y + 2, 3, 2, '#FFFFFF', 1); dot(g, x + 5, y - 1, '#DC2626'); box(g, x + 3, y + 5, 4, 1, '#BE185D'); }
  else { box(g, x, y + 2, 10, 5, '#5A3A20'); box(g, x, y + 2, 10, 1, '#8A5A30'); for (let i = 0; i < 4; i++) box(g, x + 1 + i * 2, y + 4, 1, 1, '#9CA3AF'); dot(g, x + 7, y + 5, '#3A2410'); }
};

/** The backlit menu board on the wall (its middle at mx, its top at y; 212 x 104): the lightbox's glow round it, the
 *  chrome frame, the header in the ride's orange, the snacks, their pictures and prices, the glass's glare. */
export const menuBoard = (g: Ctx, mx: number, y: number) => {
  const l = mx - 106, w = 212, h = 104;
  for (let r = 0; r < 3; r++) box(g, l - 4 - r * 3, y - 4 - r * 3, w + 8 + r * 6, h + 8 + r * 6, `rgba(255, 240, 210, ${(0.07 - r * 0.02).toFixed(3)})`);
  box(g, l, y, w, h, INK);
  box(g, l + 1, y + 1, w - 2, h - 2, CHROME[3]); box(g, l + 1, y + 1, w - 2, 1, CHROME[5]); box(g, l + 1, y + 1, 1, h - 2, CHROME[4]); box(g, l + 1, y + h - 2, w - 2, 1, CHROME[1]); box(g, l + w - 2, y + 1, 1, h - 2, CHROME[1]);
  const il = l + 4, it = y + 4, iw = w - 8, ih = h - 8;
  bandedGradient(g, il, it, iw, ih, ['#1C1206', '#120C06', '#0A0604'], 3, 1);
  // (the header: lit red-orange, banded, its lettering)
  bandedGradient(g, il, it, iw, 18, ['#7F1D1D', '#991B1B', '#5A1010'], 3, 1); box(g, il, it, iw, 1, '#F87171'); box(g, il, it + 18, iw, 1, GOLD[3]);
  words(g, 'SNACKS OF MASS DESTRUCTION', mx, it + 16, header);
  const ITEMS: [string, string][] = [['LAVA NACHOS', '$14'], ['TORNADO DOG', '$11'], ['FLOOD CUP, NO REFILLS', '$9'], ['ASH POPCORN', '$12'], ['AFTERSHOCK SHAKE', '$10'], ['MYSTERY RUBBLE BAR', '$8']];
  ITEMS.forEach(([t, p], i) => {
    const ry = it + 22 + i * 13;
    // (a picture, backlit, its little frame)
    box(g, il + 3, ry - 1, 13, 11, '#2A2016'); box(g, il + 4, ry, 11, 9, '#FFF7E0'); icon(g, i, il + 4, ry + 1);
    words(g, t, il + 20, ry + 8, itemL, 'left');
    // (dot leaders to the price)
    for (let x = il + 22 + t.length * 6; x < il + iw - 26; x += 3) dot(g, x, ry + 7, '#6A5A40');
    words(g, p, il + iw - 4, ry + 8, priceL, 'right');
    if (i < ITEMS.length - 1) box(g, il + 2, ry + 11, iw - 4, 1, '#2E2414');
  });
  // (the glass: glare across its top left, the tube's hot spot)
  poly(g, [[il, it], [il + 22, it], [il, it + 22]], 'rgba(255, 255, 255, 0.08)');
  checker(g, il + 60, it + ih - 2, iw - 120, 2, 'rgba(255, 240, 210, 0.12)', 0, 1);
};
