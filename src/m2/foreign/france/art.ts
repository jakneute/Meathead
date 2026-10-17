// FRANCE's art (the SNES pass): the Haussmann fronts (limestone in courses over a painted wooden shopfront (its gold
// lettered fascia, its windows of goods, the glazed door), the rusticated entresol, tall French windows in their
// surrounds and pediments, iron balconettes and the long balcony, the cornice and its dentils, the zinc mansard and its
// dormers, chimney stacks and their pots; braced from behind), the CAFES (the striped awnings on their iron arms,
// scalloped and fringed; the gingham tables and the bentwood chairs), the newspaper column (its posters, its cupola),
// THE CABARET (the gilt proscenium, the velvet curtain in its folds behind the stage, the swagged valance and its
// tassels; the stage's boards, its black-and-gold apron, the footlights; the marquee in bulbs on its gilt posts), THE
// ARC (cut stone in courses, the coffered vault and the light through it, the archivolt, the relief panels, the
// frieze, the cornice, the attic and its shields and its inscription, the plinth and the winged figure on it; the
// stairwell up its left pier; the SERVICE LIFT's riveted shaft and its brass cage), the flower stall, the Mona Lisa
// stand; and LE LOUVRE (the palace wings behind the courtyard, the glass pyramid in its steel lattice with the gift
// shop dim inside, the fountain nozzles and their gurgle and their jets, the Mona Lisa postcard on its easel behind a
// velvet rope, the Seine (a puddle), the bouquinistes' green boxes, the apartment block, its balconies). Still art
// painted once for the hour; only what moves live. No layout here: index.ts and louvre.ts say where.

import { GY } from '../geometry';
import {
  type Ctx, type View, INK, box, mix, poly, checker, hash, at, atDepth, ramp6, dimmed, hour, slab, post, ball, timeOfDay, steppedGlow, pixelBlob,
  stoneBlocks, planks, hole, facade, still, board, words, plain, LOOKS, onScreen, lip, topBack, box3Back, ledge3, glassOf, skyAt, flagPole,
} from '../kit';
import { bulbs } from '../../hollywood/blvd/kit';
import { balustrade, ironRail } from '../italy/art';

const lampsOn = () => timeOfDay().lamps > 0.3;
export const STONE = '#E7DCC4', CREAM = '#EDE4D3', ZINC = '#6A7488', IRON = '#2E3436', BISTRO = '#14532D', OXBLOOD = '#7F1D1D', GOLD = '#CA8A04', VELVET = '#8E1230';

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** A stone cornice and its dentils (local): lit along its top, the dentils' shadows under. */
const cornice = (g: Ctx, x: number, y: number, w: number, S: string[]) => {
  box(g, x - 1, y - 1, w + 2, 10, INK); box(g, x, y, w, 8, S[3]); box(g, x, y, w, 1, S[5]); box(g, x, y + 6, w, 2, S[1]);
  for (let k = x + 2; k < x + w - 3; k += 6) { box(g, k, y + 8, 4, 4, S[2]); box(g, k, y + 11, 4, 1, INK); }
};
/** A tall French window (local) in its stone surround: the glass by the hour in its panes, the mullions, a pediment
 *  over it (triangular or a segment) or a plain lintel; an iron balconette across its foot. */
const frenchWindow = (g: Ctx, x: number, y: number, w: number, h: number, S: string[], ped: 0 | 1 | 2, rail = true) => {
  box(g, x - 4, y - 4, w + 8, h + 6, INK); box(g, x - 3, y - 3, w + 6, h + 4, S[3]); box(g, x - 3, y - 3, w + 6, 1, S[5]); box(g, x - 3, y - 3, 1, h + 4, S[4]); box(g, x + w + 2, y - 3, 1, h + 4, S[1]);
  hole(g, x, y, w, h, true);
  for (let k = 1; k < 3; k++) box(g, x, y + Math.round((h * k) / 3), w, 1, INK);
  if (ped === 1) { poly(g, [[x - 6, y - 4], [x + w / 2, y - 14], [x + w + 6, y - 4]], INK); poly(g, [[x - 5, y - 5], [x + w / 2, y - 13], [x + w + 5, y - 5]], S[3]); box(g, x - 5, y - 6, w + 10, 2, S[4]); }
  else if (ped === 2) { g.fillStyle = INK; g.beginPath(); g.ellipse(x + w / 2, y - 4, w / 2 + 7, 8, 0, Math.PI, 0); g.fill(); g.fillStyle = S[3]; g.beginPath(); g.ellipse(x + w / 2, y - 4, w / 2 + 6, 7, 0, Math.PI, 0); g.fill(); box(g, x - 6, y - 6, w + 12, 2, S[4]); }
  else { box(g, x - 5, y - 8, w + 10, 5, INK); box(g, x - 4, y - 7, w + 8, 3, S[4]); }
  if (rail) {
    const I = ramp6(dimmed(IRON));
    box(g, x - 3, y + h - 14, w + 6, 2, INK); box(g, x - 3, y + h - 14, w + 6, 1, I[4]);
    for (let k = x - 2; k < x + w + 2; k += 3) box(g, k, y + h - 12, 1, 12, I[2]);
    g.strokeStyle = I[3]; g.lineWidth = 1; for (let k = x + 2; k < x + w - 2; k += 8) { g.beginPath(); g.arc(k + 2, y + h - 6, 2.5, 0, Math.PI * 1.7); g.stroke(); }
  }
  box(g, x - 4, y + h + 2, w + 8, 3, INK); box(g, x - 3, y + h + 2, w + 6, 2, S[4]);
};
/** A zinc mansard (local) from y up `mh`, its slope in from either end: standing seams in steps, the dormers (stone
 *  surrounds, little pediments, their glass), the zinc ridge, the chimney stacks and their clay pots. */
const mansard = (g: Ctx, x: number, y: number, w: number, mh: number, seed: number, scenery = true) => {
  const Z = ramp6(scenery ? dimmed(ZINC) : hour(ZINC)), S = ramp6(scenery ? dimmed(STONE) : hour(STONE)), Br = ramp6(scenery ? dimmed('#B8684A') : hour('#B8684A'));
  // (the chimney stacks behind the ridge)
  for (const cx of [x + w * 0.22, x + w * 0.74]) {
    const cxr = Math.round(cx);
    box(g, cxr - 12, y - mh - 22, 24, 24, INK); box(g, cxr - 11, y - mh - 21, 22, 23, S[2]); box(g, cxr - 11, y - mh - 21, 5, 23, S[3]); box(g, cxr - 13, y - mh - 23, 26, 3, S[4]);
    for (let k = 0; k < 4; k++) { const px0 = cxr - 9 + k * 5; box(g, px0 - 1, y - mh - 31, 5, 9, INK); box(g, px0, y - mh - 30, 3, 8, Br[3]); box(g, px0, y - mh - 30, 1, 8, Br[4]); }
  }
  const sh: [number, number][] = [[x - 4, y], [x + 10, y - mh], [x + w - 10, y - mh], [x + w + 4, y]];
  poly(g, sh.map(([a, b]) => [a + (a < x + w / 2 ? -1 : 1), b + (b < y ? -1 : 1)] as [number, number]), INK);
  poly(g, sh, Z[2]);
  g.save(); g.beginPath(); sh.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.clip();
  for (let sx = x - 4; sx < x + w + 4; sx += 6) { box(g, sx, y - mh, 1, mh, Z[4]); box(g, sx + 1, y - mh, 1, mh, Z[1]); }
  box(g, x - 4, y - mh, w + 8, Math.round(mh * 0.35), Z[3]); checker(g, x - 4, y - mh + Math.round(mh * 0.35), w + 8, 2, Z[3], 0, 1);
  g.restore();
  box(g, x + 8, y - mh - 2, w - 16, 3, INK); box(g, x + 9, y - mh - 2, w - 18, 2, Z[5]);
  // (the dormers)
  const n = Math.max(1, Math.floor(w / 70));
  for (let k = 0; k < n; k++) {
    const dx = Math.round(x + (w / n) * (k + 0.5) - 9), dy = y - mh + 6;
    box(g, dx - 3, dy - 1, 24, mh - 6, INK); box(g, dx - 2, dy, 22, mh - 8, S[3]); box(g, dx - 2, dy, 2, mh - 8, S[4]);
    hole(g, dx + 2, dy + 5, 14, mh - 18, true);
    poly(g, [[dx - 4, dy], [dx + 9, dy - 9], [dx + 22, dy]], INK); poly(g, [[dx - 3, dy - 1], [dx + 9, dy - 8], [dx + 21, dy - 1]], S[3]);
    if (hash(seed + k) > 0.6) { g.fillStyle = INK; g.beginPath(); g.arc(dx + 9, dy - 3, 2, 0, Math.PI * 2); g.fill(); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The Haussmann fronts (FACADE_D, braced)

type Shop = 'bakery' | 'cheese' | 'perfume' | 'berets' | 'snails';
export interface FrFront { rx: number; w: number; h: number; name: string; shop: Shop; paint: string }
const shopGoods = (g: Ctx, x: number, y: number, w: number, h: number, shop: Shop, seed: number) => {
  const D = (c: string) => ramp6(dimmed(c));
  for (let k = 0; k < Math.floor(w / 9); k++) {
    const gx = x + 3 + k * 9, gy = y + h - 4;
    if (shop === 'bakery') { const R = D('#C88A3A'); if (k % 2) { poly(g, [[gx - 1, gy], [gx + 1, gy - 22], [gx + 6, gy - 22], [gx + 8, gy]], INK); box(g, gx + 1, gy - 21, 5, 21, R[3]); box(g, gx + 1, gy - 21, 2, 21, R[4]); for (let s = gy - 18; s < gy; s += 5) box(g, gx + 2, s, 3, 1, R[1]); } else { box(g, gx - 1, gy - 7, 9, 8, INK); box(g, gx, gy - 6, 7, 6, R[3]); box(g, gx + 1, gy - 6, 3, 2, R[5]); } }
    else if (shop === 'cheese') { const R = D(['#F2D16B', '#F4EFE4', '#E8A33A'][k % 3]); g.fillStyle = INK; g.beginPath(); g.ellipse(gx + 4, gy - 4, 5, 4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.ellipse(gx + 4, gy - 4, 4, 3, 0, 0, Math.PI * 2); g.fill(); box(g, gx + 1, gy - 6, 3, 1, R[5]); if (k % 2) box(g, gx + 4, gy - 4, 2, 2, R[1]); }
    else if (shop === 'perfume') { const R = D(['#F472B6', '#A78BFA', '#FDE68A', '#7DD3FC'][k % 4]); box(g, gx, gy - 12, 7, 12, INK); box(g, gx + 1, gy - 11, 5, 11, R[3]); box(g, gx + 1, gy - 11, 1, 11, R[5]); box(g, gx + 2, gy - 15, 3, 3, D(GOLD)[3]); }
    else if (shop === 'berets') { const R = D(['#1C1917', '#B91C1C', '#1E3A8A', '#14532D'][k % 4]); box(g, gx + 3, gy - 16, 1, 16, D('#A8A29E')[2]); g.fillStyle = INK; g.beginPath(); g.ellipse(gx + 4, gy - 16, 6, 3, -0.15, 0, Math.PI * 2); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.ellipse(gx + 4, gy - 16, 5, 2, -0.15, 0, Math.PI * 2); g.fill(); box(g, gx + 2, gy - 19, 1, 2, R[3]); }
    else { const R = D('#A16207'); g.fillStyle = INK; g.beginPath(); g.arc(gx + 4, gy - 5, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.arc(gx + 4, gy - 5, 4, 0, Math.PI * 2); g.fill(); g.strokeStyle = R[1]; g.lineWidth = 1; g.beginPath(); g.arc(gx + 4, gy - 5, 2, 0, Math.PI * 1.6); g.stroke(); box(g, gx - 2, gy - 2, 6, 2, D('#65A30D')[3]); }
  }
  box(g, x, y + h - 3, w, 3, D('#57534E')[2]);
};
const paintFront = (g: Ctx, f: FrFront) => {
  const { w, h } = f, S = ramp6(dimmed(STONE)), P = ramp6(dimmed(f.paint)), Gd = ramp6(dimmed(GOLD)), seed = f.rx;
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  stoneBlocks(g, 0, -h, w, h - 96, S, seed, 36, 14);
  // (the entresol's rustication: deep horizontal joints over the shop)
  for (let y = -128; y < -96; y += 8) { box(g, 0, y, w, 1, S[0]); box(g, 0, y + 1, w, 1, S[4]); }
  // (the long balcony along the main floor, its iron rail: dimmed (scenery))
  const balY = -h + Math.round((h - 128) * 0.55) + 16;
  // (the windows, floor by floor: the main floor's pediments, the next's lintels)
  const n = Math.max(2, Math.floor((w - 20) / 58)), rows = h > 235 ? 2 : 1;
  for (let row = 0; row < rows; row++) for (let k = 0; k < n; k++) {
    const wx = Math.round(18 + k * ((w - 58) / Math.max(1, n - 1))), wy = row === 0 ? balY - 44 : -h + 22;
    if (row === 1 && wy + 42 > balY - 60) continue;
    frenchWindow(g, wx, wy, 22, 42, S, row === 0 ? ((k % 2) as 0 | 1) === 0 ? 1 : 2 : 0, row !== 0);
  }
  const I = ramp6(dimmed(IRON));
  box(g, 6, balY - 1, w - 12, 5, INK); box(g, 7, balY, w - 14, 3, S[3]); box(g, 7, balY, w - 14, 1, S[5]);
  for (let x = 12; x < w - 12; x += 26) { box(g, x, balY + 4, 6, 6, S[2]); box(g, x, balY + 9, 6, 1, INK); }
  box(g, 7, balY - 16, w - 14, 2, INK); box(g, 7, balY - 16, w - 14, 1, I[4]);
  for (let x = 9; x < w - 9; x += 4) box(g, x, balY - 14, 1, 14, I[2]);
  g.strokeStyle = I[3]; g.lineWidth = 1; for (let x = 14; x < w - 14; x += 12) { g.beginPath(); g.arc(x, balY - 7, 3, 0, Math.PI * 1.7); g.stroke(); }
  // (the cornice, the mansard over it)
  cornice(g, -4, -h - 8, w + 8, S);
  mansard(g, 0, -h - 8, w, 46, seed);
  // (the shopfront: painted wood, its pilasters, the gold fascia, the windows of goods, the glazed door)
  box(g, 0, -96, w, 96, INK); box(g, 1, -95, w - 2, 95, P[3]); box(g, 1, -95, w - 2, 2, P[5]); box(g, 1, -95, 3, 95, P[4]);
  for (const px0 of [2, w - 12]) { box(g, px0, -95, 10, 95, P[2]); box(g, px0, -95, 2, 95, P[4]); box(g, px0 + 2, -90, 6, 2, Gd[3]); box(g, px0 + 2, -10, 6, 2, Gd[3]); }
  const dx = Math.round(w / 2 - 17);
  for (const [sx, sw] of [[16, dx - 26], [dx + 44, w - dx - 60]] as const) {
    if (sw < 20) continue;
    box(g, sx - 2, -72, sw + 4, 58, INK); box(g, sx - 1, -71, sw + 2, 56, Gd[2]);
    hole(g, sx, -70, sw, 42, false);
    shopGoods(g, sx, -70, sw, 42, f.shop, seed);
    box(g, sx - 1, -26, sw + 2, 10, P[2]); box(g, sx - 1, -26, sw + 2, 1, P[4]); box(g, sx + 4, -22, sw - 8, 3, P[1]);
  }
  hole(g, dx, -80, 34, 80, true);
  box(g, dx + 16, -80, 2, 80, P[2]); box(g, dx + 2, -46, 30, 2, P[2]); box(g, dx + 26, -44, 3, 3, Gd[4]);
  board(g, w / 2, -86, [f.name], LOOKS.france(1), dimmed(f.paint), Gd, 4);
  // (a street lamp's bracket out of the pier, its lantern lit after dark)
  const lx = w - 18;
  box(g, lx - 12, -140, 14, 2, I[2]); box(g, lx - 12, -140, 2, 8, I[2]);
  box(g, lx - 17, -132, 12, 14, INK); box(g, lx - 16, -131, 10, 12, lampsOn() ? '#FFE7A0' : dimmed('#C8D0D8')); box(g, lx - 18, -134, 14, 3, I[3]);
};
export const drawFront = (c: Ctx, v: View, x: number, f: FrFront) => facade(c, v, `fr-front-${f.rx}`, x, f.w, f.h, g => paintFront(g, f), undefined, 90, 22);

// ---------------------------------------------------------------------------------------------------------------
// The cafes: the awnings, the tables and chairs; the newspaper column

/** A cafe's awning at the play plane (a..b, its top at y): its iron arms back to the front (set back), the canvas
 *  going back over them, the sloped face in its stripes (in steps), the scalloped valance and its fringe; the lit lip. */
export const cafeAwning = (c: Ctx, v: View, a: number, b: number, y: number, col: string) => {
  if (!onScreen(v, a - 20, b + 20)) return;
  const C = ramp6(hour(col)), Wt = ramp6(hour('#F4EFE4')), I = ramp6(dimmed(IRON));
  for (const ax of [a + 12, b - 12]) { const [p0, q0] = at(v.eye, ax, y + 48, 1), [p1, q1] = at(v.eye, ax, y + 4, 0.9); c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke(); c.strokeStyle = I[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke(); }
  topBack(c, v.eye, a, b, y, 1, 0.92, C, 3);
  for (let x = a, k = 0; x < b; x += 20, k++) {
    const R = k % 2 ? Wt : C, sw = Math.min(20, b - x);
    box(c, x, y, sw, 40, R[3]); box(c, x, y, 3, 40, R[4]); box(c, x + sw - 4, y, 4, 40, R[2]);
    box(c, x, y, sw, 6, R[4]); checker(c, x, y + 6, sw, 2, R[4], 0, 1); box(c, x, y + 32, sw, 8, R[2]); checker(c, x, y + 30, sw, 2, R[2], 0, 1);
  }
  // (the valance: scalloped, its stripes running on, a fringe along its foot)
  box(c, a - 1, y + 40, b - a + 2, 2, INK);
  for (let x = a, k = 0; x < b; x += 20, k++) {
    const R = k % 2 ? Wt : C;
    c.fillStyle = INK; c.beginPath(); c.moveTo(x, y + 41); c.lineTo(x + 20, y + 41); c.lineTo(x + 20, y + 44); c.quadraticCurveTo(x + 10, y + 54, x, y + 44); c.closePath(); c.fill();
    c.fillStyle = R[2]; c.beginPath(); c.moveTo(x + 1, y + 42); c.lineTo(x + 19, y + 42); c.lineTo(x + 19, y + 43); c.quadraticCurveTo(x + 10, y + 52, x + 1, y + 43); c.closePath(); c.fill();
    box(c, x + 4, y + 42, 2, 3, R[4]);
  }
  box(c, a - 1, y, 1, 42, INK); box(c, b, y, 1, 42, INK);
  lip(c, a, y, b - a);
};
/** A bentwood bistro chair (set back, dimmed): its round seat and its woven cane, the hoop back, the legs. */
const bistroChair = (c: Ctx, v: View, x: number, dir: number) => {
  const [px, py] = at(v.eye, x, GY, 0.96), Wd = ramp6(dimmed('#5C3A1A')), Cn = ramp6(dimmed('#D8B878'));
  for (const lx of [px - 7, px + 6]) { box(c, lx - 1, py - 26, 3, 26, INK); box(c, lx, py - 26, 1, 26, Wd[3]); }
  box(c, px - 10, py - 29, 21, 5, INK); box(c, px - 9, py - 28, 19, 3, Cn[3]); checker(c, px - 9, py - 28, 19, 3, Cn[2], 0, 1);
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.ellipse(px - dir * 6, py - 40, 6, 11, 0, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = Wd[3]; c.lineWidth = 1.5; c.beginPath(); c.ellipse(px - dir * 6, py - 40, 6, 11, 0, 0, Math.PI * 2); c.stroke();
};
/** A cafe table (a box he stands on): its gingham cloth down to the ground (in its folds, its hem), a candle in a wine
 *  bottle on it; the chairs either side, set back. */
export const bistroTable = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 30, b + 30)) return;
  bistroChair(c, v, a - 10, -1); bistroChair(c, v, b + 10, 1);
  const w = b - a, h = GY - top;
  box3Back(c, v, { x: a, top, w, bottom: GY, col: '#F4EFE4' });
  still(c, `fr-table-${w}x${h}`, a, top, -4, -1, w + 8, h + 2, g => {
    const R = hour('#B91C1C'), Wt = hour('#F8F4EC'), Dk = hour('#7F1D1D');
    poly(g, [[-1, 0], [w + 1, 0], [w + 4, h], [-4, h]], INK);
    g.save(); g.beginPath(); g.moveTo(0, 1); g.lineTo(w, 1); g.lineTo(w + 3, h - 1); g.lineTo(-3, h - 1); g.closePath(); g.clip();
    box(g, -4, 0, w + 8, h, Wt);
    for (let x = -4; x < w + 4; x += 8) box(g, x, 0, 4, h, mix(Wt, R, 0.5));
    for (let y = 0; y < h; y += 8) { box(g, -4, y, w + 8, 4, mix(Wt, R, 0.5)); for (let x = -4; x < w + 4; x += 8) box(g, x, y, 4, 4, R); }
    // (its folds: shade down them, a lit edge)
    for (const fx of [Math.round(w * 0.3), Math.round(w * 0.7)]) { box(g, fx, 4, 3, h - 4, 'rgba(28, 16, 20, 0.28)'); box(g, fx - 1, 4, 1, h - 4, 'rgba(255, 255, 255, 0.25)'); }
    box(g, -4, 0, w + 8, 3, 'rgba(255, 255, 255, 0.3)'); box(g, -4, h - 4, w + 8, 4, Dk);
    g.restore();
  });
  // (the candle in its bottle: the glass, the wax down it, the flame)
  const cx = Math.round(a + w / 2 + 6), G = ramp6(hour('#1F4A2E'));
  box(c, cx - 3, top - 12, 6, 12, INK); box(c, cx - 2, top - 11, 4, 11, G[2]); box(c, cx - 2, top - 11, 1, 11, G[4]); box(c, cx - 1, top - 15, 2, 4, INK);
  box(c, cx - 1, top - 19, 2, 5, hour('#F4EFE4')); box(c, cx - 2, top - 15, 1, 3, hour('#F4EFE4'));
  box(c, cx - 1, top - 23, 2, 4, '#FDBA3A'); box(c, cx, top - 22, 1, 2, '#FFF4C8');
  if (lampsOn()) steppedGlow(c, cx, top - 21, 14, '#FFD27A', 0, 0.35, 3);
  lip(c, a, top, w);
};
/** The newspaper column (a box he stands on: round, dark green): lit down its left, its posters pasted round in bands,
 *  its base molding, the cornice ring at its top (the lit lip), the little cupola set back on it. */
export const morrisColumn = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top, G = ramp6(hour(BISTRO));
  topBack(c, v.eye, a, b, top, 1, 0.95, G, 2);
  // (the cupola on top, set back: its scalloped dome, the finial)
  const [qx, qy] = at(v.eye, (a + b) / 2, top, 0.97), D = ramp6(dimmed(BISTRO));
  c.save(); c.beginPath(); c.rect(qx - 40, qy - 40, 80, top - (qy - 40)); c.clip();
  c.fillStyle = INK; c.beginPath(); c.arc(qx, qy, w / 2 - 6, Math.PI, 0); c.fill(); c.fillStyle = D[3]; c.beginPath(); c.arc(qx, qy, w / 2 - 7, Math.PI, 0); c.fill();
  for (let k = 1; k < 5; k++) box(c, qx - (w / 2 - 7) + (k * (w - 14)) / 5, qy - (w / 2 - 8) * Math.sin((k / 5) * Math.PI), 1, (w / 2 - 8) * Math.sin((k / 5) * Math.PI), D[1]);
  box(c, qx - 1, qy - w / 2 - 6, 2, 8, D[4]); ball(c, qx, qy - w / 2 - 8, 2, dimmed(GOLD), true);
  c.restore();
  still(c, `fr-column-${w}x${h}`, a, top, -4, -2, w + 8, h + 3, g => {
    box(g, -1, 0, w + 2, h + 1, INK);
    const band = (x: number, ww: number, col: string) => box(g, x, 0, ww, h, col);
    band(0, w, G[3]); band(0, 6, G[4]); band(6, 6, mix(G[3], G[4], 0.5)); band(w - 12, 12, G[2]); band(w - 5, 5, G[1]);
    // (the posters in bands round it, curving away at its edges)
    const POST = [['LE CABARET', '#FDE68A', '#7F1D1D'], ['MIMES', '#F8FAFC', '#1C1917'], ['LOST CAT', '#FCA5A5', '#1C1917'], ['CAN-CAN', '#BFDBFE', '#1E3A8A']];
    for (let k = 0; k < 3; k++) {
      const py0 = 22 + k * 46, [txt, bg, ink] = POST[k % POST.length], B = ramp6(hour(bg));
      box(g, 4, py0 - 1, w - 8, 40, INK); box(g, 5, py0, w - 10, 38, B[3]); box(g, 5, py0, 4, 38, B[4]); box(g, w - 12, py0, 7, 38, B[2]); box(g, w - 7, py0, 2, 38, B[1]);
      words(g, txt, w / 2, py0 + 12, plain(1, 1, hour(ink)));
      box(g, 12, py0 + 18, w - 24, 12, B[1]); box(g, 14, py0 + 20, w - 28, 2, hour(ink)); box(g, 14, py0 + 25, w - 34, 2, hour(ink));
      if (k === 1) { box(g, w - 18, py0 + 4, 8, 6, B[2]); poly(g, [[w - 18, py0 + 38], [w - 6, py0 + 30], [w - 6, py0 + 38]], B[1]); }
    }
    // (the base molding, the cornice ring)
    box(g, -2, h - 14, w + 4, 14, INK); box(g, -1, h - 13, w + 2, 12, G[2]); box(g, -1, h - 13, w + 2, 2, G[4]);
    box(g, -3, 0, w + 6, 10, INK); box(g, -2, 1, w + 4, 8, G[3]); box(g, -2, 1, w + 4, 2, G[5]); box(g, -2, 7, w + 4, 2, G[1]);
  });
  lip(c, a - 2, top, w + 4);
};

// ---------------------------------------------------------------------------------------------------------------
// THE CABARET

/** The curtain behind the stage (at 0.93; local foot at 0): the gilt proscenium round it, the velvet in its folds
 *  (each one lit and shaded in steps), its gold fringe, the swagged valance over it and its tassels, the dark gap where
 *  it parts. */
const paintCurtain = (g: Ctx, w: number, h: number) => {
  const V = ramp6(dimmed(VELVET)), Gd = ramp6(dimmed(GOLD));
  box(g, -12, -h - 24, w + 24, h + 24, INK);
  // (the proscenium: gilt, its moldings in steps)
  box(g, -11, -h - 23, w + 22, h + 23, Gd[2]); box(g, -11, -h - 23, w + 22, 3, Gd[4]); box(g, -11, -h - 23, 3, h + 23, Gd[4]); box(g, w + 8, -h - 23, 3, h + 23, Gd[1]);
  for (let y = -h - 16; y < 0; y += 10) { box(g, -8, y, 4, 5, Gd[3]); box(g, w + 4, y, 4, 5, Gd[3]); }
  box(g, 0, -h, w, h, '#1C0A10');
  // (the folds: each a lit ridge, its shade, the trough)
  for (let x = 0, k = 0; x < w; x += 16, k++) {
    if (Math.abs(x + 8 - w / 2) < 6) continue;
    box(g, x, -h, 16, h, V[2]); box(g, x + 2, -h, 4, h, V[3]); box(g, x + 3, -h, 1, h, V[4]); box(g, x + 11, -h, 5, h, V[1]); box(g, x + 15, -h, 1, h, V[0]);
    checker(g, x + 6, -h, 2, h, V[3], k % 2, 1);
  }
  // (the gap where it parts, a sliver of light from backstage)
  box(g, w / 2 - 3, -h, 6, h, '#0E0408'); box(g, w / 2 - 1, -h * 0.7, 1, h * 0.7, dimmed('#FDE68A'));
  // (the fringe along its foot)
  box(g, 0, -12, w, 3, Gd[3]); for (let x = 0; x < w; x += 3) box(g, x, -9, 2, 7, x % 6 ? Gd[2] : Gd[4]);
  // (the valance: velvet swags across its top, the gold rope and tassels between them)
  for (let x = 0; x < w; x += 60) {
    g.fillStyle = INK; g.beginPath(); g.moveTo(x, -h); g.lineTo(x + 60, -h); g.lineTo(x + 60, -h + 10); g.quadraticCurveTo(x + 30, -h + 46, x, -h + 10); g.closePath(); g.fill();
    g.fillStyle = V[3]; g.beginPath(); g.moveTo(x + 1, -h); g.lineTo(x + 59, -h); g.lineTo(x + 59, -h + 9); g.quadraticCurveTo(x + 30, -h + 43, x + 1, -h + 9); g.closePath(); g.fill();
    for (let k = 0; k < 3; k++) { g.strokeStyle = k === 1 ? V[5] : V[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 4, -h + 8 + k * 6); g.quadraticCurveTo(x + 30, -h + 30 + k * 6, x + 56, -h + 8 + k * 6); g.stroke(); }
    if (x > 0) { box(g, x - 2, -h, 4, 22, Gd[3]); ball(g, x, -h + 24, 3, Gd[3], true); for (let t = -2; t <= 2; t += 2) box(g, x + t, -h + 27, 1, 9, Gd[2]); }
  }
  box(g, 0, -h, w, 4, Gd[3]); box(g, 0, -h, w, 1, Gd[5]);
};
export const drawCurtain = (c: Ctx, v: View, a: number, b: number) => facade(c, v, `fr-curtain-${b - a}`, a, b - a, 300, g => paintCurtain(g, b - a, 300), 0.93, 30, 16, false);
/** The stage (a box he stands on): its boards going back, its apron (black, gold-trimmed panels), the footlights along
 *  its lip in their hoods (always on: it's a show), the lit lip. */
export const drawStage = (c: Ctx, v: View, a: number, b: number, top: number, f: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top;
  box3Back(c, v, { x: a, top, w, bottom: GY, col: '#8B5A2B', look: 'plank' });
  still(c, `fr-stage-${w}x${h}`, a, top, -2, -1, w + 4, h + 2, g => {
    const K = ramp6(hour('#1C1917')), Gd = ramp6(hour(GOLD));
    box(g, -1, 0, w + 2, h + 1, INK); slab(g, 0, 0, w, h, K, false);
    box(g, 0, 0, w, 12, ramp6(hour('#8B5A2B'))[2]); box(g, 0, 0, w, 1, ramp6(hour('#8B5A2B'))[4]);
    for (let x = 8; x < w - 30; x += 48) { box(g, x, 18, 40, h - 26, INK); box(g, x + 1, 19, 38, h - 28, K[2]); box(g, x + 1, 19, 38, 1, Gd[3]); box(g, x + 1, 19, 1, h - 28, Gd[4]); box(g, x + 38, 19, 1, h - 28, Gd[1]); box(g, x + 1, h - 10, 38, 1, Gd[2]); g.fillStyle = Gd[3]; g.beginPath(); g.arc(x + 20, 19 + (h - 28) / 2, 4, 0, Math.PI * 2); g.fill(); }
    box(g, 0, 14, w, 2, Gd[3]);
  });
  // (the footlights: a hood over each lamp along the lip, glowing)
  for (let x = a + 14; x < b - 10; x += 28) {
    steppedGlow(c, x, top + 6, 12, '#FFE7A0', 0, 0.3, 3);
    box(c, x - 5, top + 2, 10, 6, INK); box(c, x - 4, top + 3, 8, 3, ((x >> 3) + (f >> 5)) % 7 ? '#FFF4C8' : '#FDE68A'); box(c, x - 5, top + 7, 10, 2, hour('#1C1917'));
  }
  lip(c, a, top, w);
};
/** The marquee over the stage (one-way: its top the high way): its gilt fluted posts down to the stage, the black
 *  enamel board and its gold border, CAN-CAN in bulbs, the chasing bulbs along its foot, its top going back. */
export const drawMarquee = (c: Ctx, v: View, a: number, b: number, y: number, stageY: number, f: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const Gd = ramp6(hour(GOLD));
  for (const px0 of [a + 6, b - 6]) { post(c, px0, y + 30, stageY, 6, Gd); box(c, px0 - 2, y + 34, 1, stageY - y - 36, Gd[1]); box(c, px0 - 5, stageY - 6, 10, 6, INK); box(c, px0 - 4, stageY - 5, 8, 4, Gd[3]); }
  topBack(c, v.eye, a, b, y, 1, 0.95, ramp6(hour('#1C1917')), 2);
  still(c, `fr-marquee-${b - a}`, a, y, -2, -1, b - a + 4, 36, g => {
    const w = b - a, K = ramp6(hour('#1C1917'));
    box(g, -1, 0, w + 2, 35, INK); box(g, 0, 0, w, 34, K[3]); box(g, 0, 0, w, 2, K[5]);
    box(g, 2, 3, w - 4, 1, Gd[4]); box(g, 2, 25, w - 4, 1, Gd[2]); box(g, 2, 3, 1, 23, Gd[4]); box(g, w - 3, 3, 1, 23, Gd[2]);
    words(g, 'CAN-CAN', w / 2, 21, bulbs(2, 2, '#FDE68A', true));
  });
  for (let x = a + 6, k = 0; x < b - 2; x += 12, k++) {
    const on = (k + (f >> 3)) % 3 !== 0;
    if (on) steppedGlow(c, x + 2, y + 30, 6, '#FFE7A0', 0, 0.3, 2);
    box(c, x - 1, y + 27, 6, 6, INK); box(c, x, y + 28, 4, 4, on ? '#FFF4C8' : '#78350F'); if (on) box(c, x, y + 28, 1, 1, '#FFFFFF');
  }
  lip(c, a, y, b - a);
};

// ---------------------------------------------------------------------------------------------------------------
// THE ARC (at the play plane: the wall behind its ledges) and its SERVICE LIFT

export interface ArcP { legL: [number, number]; legR: [number, number]; deck: [number, number, number]; level2: [number, number, number]; top: [number, number, number]; girders: [number, number, number][] }
/** The arc's body (local: its left foot at 0, 0; `W` across): cut stone in courses (dimmed: behind its ledges), the vault
 *  through it (coffered, going back to its far end, the courtyard's light through it), the archivolt, the relief
 *  panels, the stairwell up the left pier (its newel, its slits), the frieze and its procession, the cornice, the attic
 *  (its shields, its inscription), the plinth and the winged figure on it. Heights `hy(h)` up from the ground. */
const paintArc = (g: Ctx, W: number, P: ArcP) => {
  const S = ramp6(dimmed(STONE)), Sd = ramp6(dimmed('#B8A888')), Bz = ramp6(dimmed('#5E7A6A')), on = lampsOn();
  const lx = (rx: number) => rx - P.legL[0], va = lx(P.legL[1]), vb = lx(P.legR[0]);
  box(g, -1, -561, W + 2, 562, INK);
  stoneBlocks(g, 0, -560, W, 560, S, 31, 40, 20);
  box(g, 0, -560, 18, 560, Sd[2]); box(g, W - 18, -560, 18, 560, Sd[1]); box(g, 0, -560, 3, 560, S[4]);
  // (the vault: its far end's opening (the light through it), its coffers going back, the shade under its crown)
  const cx = (va + vb) / 2, rx = (vb - va) / 2, spring = -300, ry = 170;
  const arch = (k: number) => { g.beginPath(); g.moveTo(cx - rx * k, 0); g.lineTo(cx - rx * k, spring * k); g.ellipse(cx, spring * k, rx * k, ry * k, 0, Math.PI, 0); g.lineTo(cx + rx * k, 0); g.closePath(); };
  g.fillStyle = INK; arch(1.02); g.fill();
  const VR = [Sd[0], Sd[1], Sd[2], Sd[1]];
  for (let k = 0; k < 4; k++) { g.fillStyle = VR[k]; arch(1 - k * 0.08); g.fill(); }
  g.save(); arch(1); g.clip();
  for (let k = 0; k < 4; k++) {
    const kk = 1 - k * 0.08 - 0.04;
    for (let i = 1; i < 12; i++) { const a = Math.PI + (i / 12) * Math.PI, qx = cx + Math.cos(a) * rx * kk, qy = spring * kk + Math.sin(a) * ry * kk; box(g, qx - 6, qy - 5, 12, 10, Sd[k % 2 ? 0 : 1]); box(g, qx - 4, qy - 3, 8, 6, Sd[k % 2 ? 1 : 2]); box(g, qx - 1, qy - 1, 2, 2, Sd[3]); }
  }
  g.fillStyle = on ? '#1A1A34' : skyAt(0.9); arch(0.66); g.fill();
  box(g, cx - rx * 0.66, -40, rx * 1.32, 40, on ? '#2A2830' : dimmed('#D6CBB4')); box(g, cx - rx * 0.66, -40, rx * 1.32, 1, dimmed('#8C7F68'));
  g.restore();
  // (the archivolt round it: voussoirs, the keystone)
  for (let i = 0; i <= 18; i++) { const a = Math.PI + (i / 18) * Math.PI, qx = cx + Math.cos(a) * (rx + 12), qy = spring + Math.sin(a) * (ry + 12); box(g, qx - 6, qy - 6, 12, 12, INK); box(g, qx - 5, qy - 5, 10, 10, i % 2 ? S[2] : S[4]); box(g, qx - 5, qy - 5, 10, 1, S[5]); }
  box(g, cx - 12, spring - ry - 26, 24, 26, INK); box(g, cx - 11, spring - ry - 25, 22, 24, S[4]); box(g, cx - 11, spring - ry - 25, 22, 2, S[5]); box(g, cx - 5, spring - ry - 18, 10, 10, Sd[2]); box(g, cx - 3, spring - ry - 16, 2, 2, INK); box(g, cx + 1, spring - ry - 16, 2, 2, INK);
  // (the relief panels over the piers: a group of figures in steps, lit up their left)
  for (const px0 of [26, W - 134]) {
    box(g, px0 - 2, -486, 112, 172, INK); box(g, px0, -484, 108, 168, Sd[1]); box(g, px0, -484, 108, 2, Sd[3]);
    for (let k = 0; k < 4; k++) {
      const fx = px0 + 16 + k * 24, fh = 70 + (k % 2) * 20, fy = -330;
      box(g, fx - 6, fy - fh, 13, fh, Sd[3]); box(g, fx - 6, fy - fh, 4, fh, Sd[4]); box(g, fx + 4, fy - fh, 3, fh, Sd[2]);
      g.fillStyle = Sd[3]; g.beginPath(); g.arc(fx, fy - fh - 7, 6, 0, Math.PI * 2); g.fill(); box(g, fx - 3, fy - fh - 11, 3, 3, Sd[4]);
      if (k === 1) { poly(g, [[fx, fy - fh + 4], [fx + 30, fy - fh - 40], [fx + 18, fy - fh + 14]], Sd[2]); poly(g, [[fx, fy - fh + 4], [fx + 26, fy - fh - 36], [fx + 6, fy - fh + 4]], Sd[4]); }
      if (k === 2) { box(g, fx + 6, fy - fh - 30, 2, 40, Sd[4]); }
    }
    box(g, px0, -318, 108, 4, Sd[0]);
  }
  // (the stairwell up the left pier: dark, the newel up its middle, slits of light)
  const sw0 = 16, sw1 = va - 16;
  box(g, sw0 - 1, -301, sw1 - sw0 + 2, 301, INK); box(g, sw0, -300, sw1 - sw0, 300, mix(Sd[0], '#1C1014', 0.4));
  box(g, (sw0 + sw1) / 2 - 5, -300, 10, 300, Sd[1]); box(g, (sw0 + sw1) / 2 - 5, -300, 2, 300, Sd[2]);
  for (const y of [-260, -150, -50]) { box(g, sw0 + 10, y, 6, 22, on ? '#1A1A34' : skyAt(0.9)); box(g, sw1 - 16, y + 30, 6, 22, on ? '#1A1A34' : skyAt(0.9)); }
  box(g, sw0, -300, sw1 - sw0, 6, Sd[2]);
  // (the frieze band over the vault, its procession in relief)
  box(g, 0, -501, W, 28, INK); box(g, 0, -500, W, 26, Sd[2]); box(g, 0, -500, W, 2, S[4]); box(g, 0, -476, W, 2, Sd[0]);
  for (let x = 10; x < W - 10; x += 14) { const hh = 14 + (x % 28 ? 0 : 2); box(g, x, -476 - hh, 6, hh, Sd[3]); box(g, x, -476 - hh, 2, hh, Sd[4]); g.fillStyle = Sd[3]; g.beginPath(); g.arc(x + 3, -479 - hh, 3, 0, Math.PI * 2); g.fill(); }
  // (the cornice over it all, its dentils)
  cornice(g, -10, -568, W + 20, S);
  // (the attic: the middle block, its round shields in a row, the inscription cut in it)
  const [l2a, l2b, l2h] = P.level2, ax = lx(l2a), aw = l2b - l2a, ah = l2h - 560;
  box(g, ax - 1, -l2h - 1, aw + 2, ah + 2, INK); stoneBlocks(g, ax, -l2h, aw, ah, S, 7, 40, 15);
  for (let x = ax + 16; x < ax + aw - 12; x += 32) { g.fillStyle = INK; g.beginPath(); g.arc(x, -l2h + 36, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = Sd[2]; g.beginPath(); g.arc(x, -l2h + 36, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = Sd[4]; g.beginPath(); g.arc(x - 2, -l2h + 34, 4, 0, Math.PI * 2); g.fill(); }
  words(g, 'OURS IS BIGGER', ax + aw / 2, -l2h + 26, { ...LOOKS.france(1), fill: Sd[0], lip: S[5] });
  // (the plinth: its moldings top and foot, its die between)
  const [pa, pb, ph] = P.top, px0 = lx(pa), pw = pb - pa;
  box(g, px0 - 1, -ph - 1, pw + 2, ph - l2h + 2, INK); stoneBlocks(g, px0, -ph, pw, ph - l2h, S, 3, 40, 20);
  box(g, px0 - 6, -l2h - 12, pw + 12, 12, INK); box(g, px0 - 5, -l2h - 11, pw + 10, 10, S[3]); box(g, px0 - 5, -l2h - 11, pw + 10, 2, S[5]);
  box(g, px0 + 10, -ph + 30, pw - 20, ph - l2h - 70, Sd[1]); box(g, px0 + 10, -ph + 30, pw - 20, 2, Sd[0]);
  // (the winged figure on top, in bronze gone green: her robe, her wings up, her raised arm, the wreath)
  const fx = px0 + pw / 2, fy = -ph;
  poly(g, [[fx - 16, fy], [fx - 10, fy - 54], [fx + 10, fy - 54], [fx + 18, fy]], INK); poly(g, [[fx - 15, fy - 1], [fx - 9, fy - 53], [fx + 9, fy - 53], [fx + 17, fy - 1]], Bz[2]); poly(g, [[fx - 15, fy - 1], [fx - 9, fy - 53], [fx - 2, fy - 53], [fx - 4, fy - 1]], Bz[3]);
  for (let k = 0; k < 4; k++) box(g, fx - 8 + k * 5, fy - 46, 1, 44, Bz[1]);
  for (const d of [-1, 1]) { poly(g, [[fx + d * 4, fy - 50], [fx + d * 38, fy - 96], [fx + d * 30, fy - 64], [fx + d * 10, fy - 44]], INK); poly(g, [[fx + d * 5, fy - 50], [fx + d * 35, fy - 92], [fx + d * 28, fy - 64], [fx + d * 10, fy - 46]], d < 0 ? Bz[3] : Bz[2]); for (let k = 0; k < 3; k++) box(g, fx + d * (14 + k * 6), fy - 60 - k * 9, 2, 8, Bz[1]); }
  g.fillStyle = INK; g.beginPath(); g.arc(fx, fy - 60, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = Bz[3]; g.beginPath(); g.arc(fx, fy - 60, 6, 0, Math.PI * 2); g.fill(); box(g, fx - 3, fy - 64, 3, 3, Bz[4]);
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(fx + 6, fy - 52); g.lineTo(fx + 16, fy - 82); g.stroke(); g.strokeStyle = Bz[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(fx + 6, fy - 52); g.lineTo(fx + 16, fy - 82); g.stroke();
  g.strokeStyle = dimmed('#CA8A04'); g.lineWidth = 2; g.beginPath(); g.arc(fx - 12, fy - 70, 5, 0, Math.PI * 2); g.stroke();
};
/** The arc: its body (stamped, behind its ledges), the balustrades along the backs of its decks, the decks and the
 *  landings (cut stone, the lit lips), the tricolor flying from the figure's hand. */
export const drawArcArt = (c: Ctx, v: View, X: (rx: number) => number, Y: (h: number) => number, P: ArcP, f: number) => {
  const L0 = X(P.legL[0]), R1 = X(P.legR[1]);
  if (!onScreen(v, L0 - 60, R1 + 60)) return;
  const W = R1 - L0;
  still(c, `fr-arc-${W}`, L0, GY, -24, -P.top[2] - 110, W + 48, P.top[2] + 112, g => paintArc(g, W, P));
  for (const [a, b, h] of [P.deck, P.level2, P.top]) { balustrade(c, v, X(a) + 4, X(b) - 4, Y(h)); ledge3(c, v, X(a), Y(h), b - a, '#B8A888', h === P.deck[2] ? 20 : 14, 'stone'); }
  for (const [a, b, h] of P.girders) ledge3(c, v, X(a), Y(h), b - a, '#B8A888', 8, 'stone');
  // (the tricolor in the figure's raised hand)
  const fx = X((P.top[0] + P.top[1]) / 2) + 16, fy = Y(P.top[2]) - 82;
  box(c, fx - 1, fy - 70, 3, 74, INK); box(c, fx, fy - 70, 1, 74, hour('#9CA3AF'));
  for (let i = 0; i < 36; i += 2) {
    const ph = f * 0.08 + i * 0.14, wave = Math.sin(ph) * 2 * (i / 36 + 0.3), lk = Math.cos(ph), sh = lk > 0.55 ? 4 : lk < -0.55 ? 2 : 3;
    const col = i < 12 ? '#002395' : i < 24 ? '#F8FAFC' : '#ED2939';
    box(c, fx + 2 + i, fy - 68 + wave - 1, 2, 26, INK); box(c, fx + 2 + i, fy - 68 + wave, 2, 24, ramp6(hour(col))[sh]);
  }
};
/** The service lift's shaft up the right pier (rails a..b from the ground to the header at `headY`): riveted steel
 *  I-beams, the header and its pulley wheel turning, the cable down to the car. */
export const drawLiftShaft = (c: Ctx, a: number, b: number, headY: number, carY: number, f: number) => {
  const St = ramp6(hour('#4A5260'));
  for (const rx of [a - 6, b]) { box(c, rx - 1, headY, 8, GY - headY, INK); box(c, rx, headY, 6, GY - headY, St[2]); box(c, rx + 2, headY, 2, GY - headY, St[4]); box(c, rx, headY, 1, GY - headY, St[3]); for (let y = headY + 6; y < GY; y += 14) { box(c, rx + 1, y, 1, 1, St[5]); box(c, rx + 4, y, 1, 1, St[5]); } }
  box(c, a - 13, headY - 11, b - a + 27, 13, INK); box(c, a - 12, headY - 10, b - a + 25, 11, St[3]); box(c, a - 12, headY - 10, b - a + 25, 2, St[5]); for (let x = a - 8; x < b + 12; x += 10) box(c, x, headY - 6, 2, 2, St[1]);
  const px = (a + b) / 2;
  c.fillStyle = INK; c.beginPath(); c.arc(px, headY - 16, 9, 0, Math.PI * 2); c.fill(); c.fillStyle = St[3]; c.beginPath(); c.arc(px, headY - 16, 8, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 3; k++) { const an = f * 0.05 + (k * Math.PI * 2) / 3; c.strokeStyle = St[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(px, headY - 16); c.lineTo(px + Math.cos(an) * 7, headY - 16 + Math.sin(an) * 7); c.stroke(); }
  ball(c, px, headY - 16, 2, hour(GOLD), true);
  box(c, px - 1, headY - 16, 2, Math.max(0, carY - 70 - headY + 16), INK); box(c, px, headY - 16, 1, Math.max(0, carY - 70 - headY + 16), St[4]);
};
/** The lift's car (its floor at y: one-way, carried): a brass-framed cage, the scissor gate across its front, the lamp
 *  in its roof (lit after dark), its floor (the lit lip). */
export const drawLiftCar = (c: Ctx, v: View, x: number, w: number, y: number) => {
  const Bz = ramp6(hour('#B07A2A')), on = lampsOn();
  box(c, x - 1, y - 71, w + 2, 72, INK);
  box(c, x, y - 70, w, 70, on ? '#6A3E12' : '#2A1A10'); if (on) { box(c, x + 2, y - 64, w - 4, 30, '#B07024'); checker(c, x + 2, y - 34, w - 4, 2, '#B07024', 0, 1); }
  box(c, x, y - 70, w, 8, Bz[3]); box(c, x, y - 70, w, 1, Bz[5]);
  poly(c, [[x + 6, y - 70], [x + w / 2, y - 80], [x + w - 6, y - 70]], INK); poly(c, [[x + 7, y - 70], [x + w / 2, y - 79], [x + w - 7, y - 70]], Bz[3]);
  ball(c, x + w / 2, y - 82, 3, on ? '#FFF4C8' : hour(GOLD), true); if (on) steppedGlow(c, x + w / 2, y - 60, 30, '#FFE7A0', 0, 0.3, 3);
  for (const sx of [x, x + w - 4]) { box(c, sx, y - 70, 4, 70, Bz[2]); box(c, sx, y - 70, 1, 70, Bz[4]); }
  // (the scissor gate: brass lattice in diamonds)
  c.strokeStyle = Bz[3]; c.lineWidth = 1; c.beginPath();
  for (let k = 0; k < w; k += 10) { c.moveTo(x + 4 + k, y - 60); c.lineTo(x + 14 + k, y - 4); c.moveTo(x + 14 + k, y - 60); c.lineTo(x + 4 + k, y - 4); }
  c.stroke();
  box(c, x + 4, y - 62, w - 8, 2, Bz[4]); box(c, x + 4, y - 4, w - 8, 2, Bz[2]);
  ledge3(c, v, x, y, w, '#B07A2A', 8);
};

// ---------------------------------------------------------------------------------------------------------------
// The flower stall, the Mona Lisa stand

/** The flower stall (a box he stands on): green-painted wood, tiers of zinc buckets in front, bunches in them in steps
 *  (roses, tulips, sunflowers, lavender), the chalk price slate. */
export const drawFlowerStall = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top;
  box3Back(c, v, { x: a, top, w, bottom: GY, col: '#166534', look: 'plank' });
  still(c, `fr-flowers-${w}x${h}`, a, top, -4, -16, w + 8, h + 17, g => {
    const G = ramp6(hour('#166534')), Z = ramp6(hour('#9CA3AF'));
    box(g, -1, 0, w + 2, h + 1, INK); planks(g, 0, 0, w, h, G, true, 3, 10);
    for (let row = 0; row < 2; row++) for (let k = 0; k < 4; k++) {
      const bx = 6 + k * ((w - 12) / 4) + (row % 2) * 6, by = 14 + row * 36, bw = 18;
      box(g, bx - 1, by + 10, bw + 2, 18, INK); box(g, bx, by + 11, bw, 16, Z[3]); box(g, bx, by + 11, 3, 16, Z[5]); box(g, bx + bw - 3, by + 11, 3, 16, Z[1]); box(g, bx, by + 13, bw, 1, Z[2]);
      const F = ramp6(hour(['#E11D48', '#FDE047', '#F97316', '#A78BFA', '#F8FAFC', '#F472B6'][(row * 4 + k) % 6]));
      for (let s = 0; s < 4; s++) box(g, bx + 3 + s * 4, by + 2, 1, 10, hour('#3F6212'));
      for (let s = 0; s < 4; s++) { const fx = bx + 3 + s * 4, fy = by - 2 + (s % 2) * 3; pixelBlob(g, fx, fy, 3.5, 3, F[2]); box(g, fx - 2, fy - 2, 2, 2, F[4]); }
    }
    box(g, w - 26, h - 22, 22, 16, INK); box(g, w - 25, h - 21, 20, 14, '#2A2A2E'); words(g, '$12', w - 15, h - 11, plain(1, 1, '#F4F4F2'));
  });
  lip(c, a, top, w);
};
/** The Mona Lisa stand (a box he stands on): its wooden front, the print in its gilt frame (her dark dress, her folded
 *  hands, her face, the hazy landscape behind), a rack of postcards of her. */
export const drawMonaStand = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top;
  box3Back(c, v, { x: a, top, w, bottom: GY, col: '#78350F', look: 'plank' });
  still(c, `fr-mona-${w}x${h}`, a, top, -2, -1, w + 4, h + 2, g => {
    const Wd = ramp6(hour('#78350F')), Gd = ramp6(hour(GOLD));
    box(g, -1, 0, w + 2, h + 1, INK); planks(g, 0, 0, w, h, Wd, false, 7, 12);
    const fx = Math.round(w / 2 - 22), fy = 10;
    box(g, fx - 5, fy - 5, 54, 64, INK); box(g, fx - 4, fy - 4, 52, 62, Gd[3]); box(g, fx - 4, fy - 4, 52, 2, Gd[5]); box(g, fx - 4, fy - 4, 2, 62, Gd[4]); box(g, fx + 46, fy - 4, 2, 62, Gd[1]); for (let k = 0; k < 6; k++) box(g, fx - 3 + k * 9, fy - 3, 3, 1, Gd[1]);
    bandOf(g, fx, fy, 44, 54);
    // (the postcards of her in a rack either side)
    for (const px0 of [6, w - 16]) for (let k = 0; k < 3; k++) { box(g, px0 - 1, 12 + k * 22, 12, 16, INK); box(g, px0, 13 + k * 22, 10, 14, hour('#4A5A3A')); box(g, px0 + 3, 15 + k * 22, 4, 4, hour('#D8B080')); box(g, px0 + 2, 19 + k * 22, 6, 7, hour('#2A2018')); }
  });
  lip(c, a, top, w);
};
/** The Mona Lisa herself (local, in a w x h box): the hazy landscape in bands, her hair and veil, her face (THAT
 *  smile), her dark dress, her hands folded. */
const bandOf = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const L = ['#6A7A5A', '#7A8A62', '#5A6A4A', '#4A5A3A'];
  for (let k = 0; k < 4; k++) box(g, x, y + (k * h) / 4, w, h / 4 + 1, hour(L[k]));
  checker(g, x, y + h / 4 - 1, w, 2, hour(L[1]), 0, 1);
  box(g, x + 4, y + h * 0.3, 8, 2, hour('#8A6A4A'));
  const cx = x + w / 2;
  poly(g, [[cx - 14, y + h], [cx - 10, y + 22], [cx + 10, y + 22], [cx + 14, y + h]], hour('#2A2018'));
  g.fillStyle = hour('#1C1410'); g.beginPath(); g.ellipse(cx, y + 16, 9, 11, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = hour('#D8B080'); g.beginPath(); g.ellipse(cx, y + 16, 6, 8, 0, 0, Math.PI * 2); g.fill();
  box(g, cx - 4, y + 10, 3, 6, hour('#E8C898')); box(g, cx - 3, y + 15, 2, 1, hour('#3A2A20')); box(g, cx + 1, y + 15, 2, 1, hour('#3A2A20'));
  box(g, cx - 2, y + 20, 4, 1, hour('#8A5A40')); box(g, cx + 2, y + 19, 1, 1, hour('#8A5A40'));
  box(g, cx - 4, y + 23, 8, 6, hour('#D8B080'));
  g.fillStyle = hour('#D8B080'); g.beginPath(); g.ellipse(cx - 2, y + 40, 8, 4, 0.2, 0, Math.PI * 2); g.fill(); box(g, cx - 7, y + 38, 6, 2, hour('#E8C898'));
};

// ---------------------------------------------------------------------------------------------------------------
// LE LOUVRE

/** The palace wings behind the courtyard (at 0.9; local foot at 0): limestone, the ground arcade, the tall windows and
 *  their pediments between paired pilasters, statues in niches, the central pavilion taller under its own steep roof,
 *  the slate mansard, its oeil-de-boeuf dormers, the chimneys. */
const paintPalace = (g: Ctx, w: number, h: number) => {
  const S = ramp6(dimmed(CREAM)), Sd = ramp6(dimmed('#C8BCA4')), Sl = ramp6(dimmed('#4A5468'));
  // (the mansard over the wings, its dormers, its chimneys)
  mansard(g, 0, -h, w, 54, 11);
  // (the central pavilion: taller, its own steep roof)
  const pw = 220, px0 = w / 2 - pw / 2;
  box(g, px0 - 1, -h - 61, pw + 2, 62, INK); stoneBlocks(g, px0, -h - 60, pw, 60, S, 4, 36, 14);
  poly(g, [[px0 - 6, -h - 60], [px0 + 30, -h - 150], [px0 + pw - 30, -h - 150], [px0 + pw + 6, -h - 60]], INK);
  poly(g, [[px0 - 5, -h - 61], [px0 + 31, -h - 149], [px0 + pw - 31, -h - 149], [px0 + pw + 5, -h - 61]], Sl[2]);
  poly(g, [[px0 - 5, -h - 61], [px0 + 31, -h - 149], [px0 + 70, -h - 149], [px0 + 40, -h - 61]], Sl[3]);
  for (let x = px0 + 4; x < px0 + pw - 4; x += 6) box(g, x, -h - 140, 1, 76, Sl[1]);
  box(g, px0 + 30, -h - 152, pw - 60, 3, INK); box(g, px0 + 31, -h - 151, pw - 62, 2, Sl[5]);
  for (const ox of [px0 + 50, px0 + pw / 2, px0 + pw - 50]) { g.fillStyle = INK; g.beginPath(); g.arc(ox, -h - 100, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = S[3]; g.beginPath(); g.arc(ox, -h - 100, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = lampsOn() ? '#E8A646' : dimmed('#3A4A68'); g.beginPath(); g.arc(ox, -h - 100, 5, 0, Math.PI * 2); g.fill(); }
  // (the wall: limestone in courses)
  box(g, -1, -h - 1, w + 2, h + 1, INK); stoneBlocks(g, 0, -h, w, h, S, 13, 40, 16);
  cornice(g, -4, -h - 8, w + 8, S);
  // (the bays: paired pilasters, the tall window and its pediment, a statue in a niche over the arcade)
  for (let x = 0, k = 0; x < w; x += 60, k++) {
    for (const px1 of [x + 2, x + 9]) { box(g, px1, -h + 4, 5, h - 104, Sd[3]); box(g, px1, -h + 4, 1, h - 104, Sd[5]); box(g, px1 + 4, -h + 4, 1, h - 104, Sd[1]); }
    box(g, x, -h + 4, 16, 6, Sd[4]);
    if (x + 58 > w) break;
    frenchWindow(g, x + 26, -h + 40, 24, 62, S, ((k % 2) + 1) as 1 | 2, false);
    box(g, x + 30, -h + 128, 16, 30, INK); box(g, x + 31, -h + 129, 14, 28, Sd[1]); g.fillStyle = Sd[1]; g.beginPath(); g.arc(x + 38, -h + 129, 7, Math.PI, 0); g.fill();
    box(g, x + 35, -h + 132, 6, 22, Sd[4]); g.fillStyle = Sd[4]; g.beginPath(); g.arc(x + 38, -h + 130, 3, 0, Math.PI * 2); g.fill();
  }
  // (the ground arcade: round arches, the dark of it, lamps in it after dark)
  box(g, 0, -100, w, 4, INK); box(g, 0, -99, w, 2, S[5]);
  for (let x = 6; x < w - 40; x += 60) {
    g.fillStyle = INK; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, -66); g.arc(x + 24, -66, 24, Math.PI, 0); g.lineTo(x + 48, 0); g.closePath(); g.fill();
    g.fillStyle = '#1C1014'; g.beginPath(); g.moveTo(x + 2, 0); g.lineTo(x + 2, -66); g.arc(x + 24, -66, 22, Math.PI, 0); g.lineTo(x + 46, 0); g.closePath(); g.fill();
    if (lampsOn()) { steppedGlow(g, x + 24, -70, 16, '#FFB070', 0, 0.3, 3); box(g, x + 22, -74, 4, 6, '#FFE7A0'); }
    box(g, x + 22, -94, 4, 6, S[4]);
  }
  box(g, 0, -6, w, 6, Sd[1]);
};
export const drawPalace = (c: Ctx, v: View, x: number, w: number, h: number) => facade(c, v, `fr-palace-${w}x${h}`, x, w, h, g => paintPalace(g, w, h), 0.9, 170, 12, false);
/** A tier of the pyramid's front (local: its top-left 0, 0; w x h): the glass by the hour (the sky in it, banded,
 *  glinting), the gift shop dim behind it (shelves of snow globes and mugs), the steel lattice of diamonds over it,
 *  the frame's members inked, their nodes. */
const paintTier = (g: Ctx, w: number, h: number, i: number) => {
  const G = glassOf(), St = ramp6(hour('#3E4A5A')), on = lampsOn();
  box(g, -1, 0, w + 2, h + 1, INK);
  box(g, 0, 0, w, h, G[1]); box(g, 0, 0, w, Math.round(h * 0.4), G[2]); checker(g, 0, Math.round(h * 0.4), w, 2, G[2], 0, 1);
  // (the gift shop inside, dim)
  const In = on ? '#8A5A2A' : '#24344A';
  for (const sy of [h * 0.45, h * 0.8]) { box(g, 6, sy, w - 12, 2, In); for (let x = 12; x < w - 12; x += 18) { const k = (x / 18 + i) % 3; if (k === 0) { g.fillStyle = In; g.beginPath(); g.arc(x, sy - 5, 4, 0, Math.PI * 2); g.fill(); } else if (k === 1) box(g, x - 3, sy - 8, 6, 8, In); else box(g, x - 2, sy - 12, 4, 12, In); } }
  if (on) { g.globalAlpha = 0.35; box(g, 0, 0, w, h, '#E8A646'); g.globalAlpha = 1; }
  // (the sky's glints going across, a sheen down it)
  for (let x = 10 + (i * 17) % 40; x < w; x += 70) { poly(g, [[x, 0], [x + 10, 0], [x - 20, h], [x - 30, h]], 'rgba(255, 255, 255, 0.16)'); }
  // (the lattice: diamonds of steel, a node at every crossing)
  g.strokeStyle = St[2]; g.lineWidth = 2; g.beginPath();
  for (let x = -h; x < w + h; x += 40) { g.moveTo(x, 0); g.lineTo(x + h, h); g.moveTo(x + h, 0); g.lineTo(x, h); }
  g.stroke();
  g.strokeStyle = St[4]; g.lineWidth = 1; g.beginPath();
  for (let x = -h; x < w + h; x += 40) { g.moveTo(x, -1); g.lineTo(x + h, h - 1); }
  g.stroke();
  for (let x = 0; x < w; x += 40) for (const y of [0, h / 2, h]) { box(g, x + (y === h / 2 ? 20 : 0) - 2, y - 2, 4, 4, INK); box(g, x + (y === h / 2 ? 20 : 0) - 1, y - 1, 2, 2, St[5]); }
  box(g, 0, 0, w, 3, St[3]); box(g, 0, h - 3, w, 3, St[1]); box(g, 0, 0, 3, h, St[3]); box(g, w - 3, 0, 3, h, St[1]);
};
/** The pyramid: every tier's going-back faces first (glass tops in their frames), then the fronts (stamped), the lit
 *  lips along each tier's top. */
export const drawPyramidArt = (c: Ctx, v: View, tiers: { a: number; b: number; top: number; bottom: number }[]) => {
  const vis = tiers.filter(t => onScreen(v, t.a, t.b));
  for (const t of vis) box3Back(c, v, { x: t.a, top: t.top, w: t.b - t.a, bottom: t.bottom, col: '#7FA8D0' });
  vis.forEach((t, i) => {
    const w = t.b - t.a, h = t.bottom - t.top;
    still(c, `fr-tier-${w}x${h}-${i}`, t.a, t.top, -2, -1, w + 4, h + 2, g => paintTier(g, w, h, i));
    lip(c, t.a, t.top, w);
  });
};
/** A fountain nozzle set in a step (at x, its foot on the step's top at y): the grate round it, the brass nozzle; its
 *  gurgle (the tell): water bubbling up out of it, spitting. */
export const nozzle = (c: Ctx, x: number, y: number, gurgle: number, f: number) => {
  const St = ramp6(hour('#334155')), Bz = ramp6(hour('#B07A2A'));
  box(c, x - 10, y - 4, 20, 4, INK); box(c, x - 9, y - 4, 18, 3, St[2]); for (let k = x - 8; k < x + 8; k += 3) box(c, k, y - 4, 1, 3, St[0]);
  box(c, x - 4, y - 9, 8, 6, INK); box(c, x - 3, y - 8, 6, 5, Bz[3]); box(c, x - 3, y - 8, 2, 5, Bz[5]); box(c, x - 2, y - 10, 4, 2, INK);
  if (gurgle >= 0 && (f >> 2) % 2) {
    for (let k = 0; k < 4; k++) { const bx = x - 5 + ((k * 7 + f) % 11), by = y - 12 - gurgle * 10 - ((f + k * 5) % 8); box(c, bx - 1, by - 1, 4, 4, '#0E4A5A'); box(c, bx, by, 2, 2, '#BAE6FD'); }
    box(c, x - 6, y - 12, 12, 2, '#E0F2FE');
  }
};
/** A jet (live): the water column in stepped bands (the outer spray, the body, the white core), ripples running up it,
 *  the crown of spray at its top, the splash round its foot. */
export const jet = (c: Ctx, x: number, base: number, h: number, hw: number, f: number) => {
  c.globalAlpha = 0.8;
  box(c, x - hw, base - h, hw * 2, h, '#7DD3FC'); box(c, x - hw * 0.65, base - h, hw * 1.3, h, '#BAE6FD'); box(c, x - hw * 0.3, base - h, hw * 0.6, h, '#F0F9FF');
  checker(c, x - hw, base - h, 3, h, '#E0F2FE', 0, 1); checker(c, x + hw - 3, base - h, 3, h, '#38BDF8', 1, 1);
  for (let y = base - ((f * 6) % 18); y > base - h; y -= 18) box(c, x - hw + 2, y, hw * 2 - 4, 2, '#FFFFFF');
  c.globalAlpha = 1;
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI * (0.1 + (k / 9) * 0.8), r = hw + 6 + ((f * 2 + k * 7) % 14), dx = Math.round(x + Math.cos(a) * r), dy = Math.round(base - h + Math.sin(a) * r * 0.6 + ((f + k * 5) % 10));
    box(c, dx - 2, dy - 2, 5, 5, '#0E4A5A'); box(c, dx - 1, dy - 1, 3, 3, '#E0F2FE'); box(c, dx - 1, dy - 1, 1, 1, '#FFFFFF');
  }
  for (let k = 0; k < 6; k++) { const sx = x + Math.sin(f * 0.4 + k * 2) * (hw + 10); box(c, sx - 2, base - 6 - (k % 3) * 4, 4, 4, '#E0F2FE'); }
};
/** The Mona Lisa (a postcard of her) on the apex, set back: its easel, the card in its little frame, the velvet rope
 *  on two brass stanchions in front of it. */
export const monaPostcard = (c: Ctx, v: View, x: number, y: number) => {
  const d = 0.97, [px, py] = at(v.eye, x, y, d), Wd = ramp6(dimmed('#6B4423')), Gd = ramp6(hour(GOLD)), Vl = ramp6(hour(VELVET));
  c.save(); c.beginPath(); c.rect(px - 60, py - 60, 120, y - (py - 60)); c.clip();
  for (const [lx0, lx1] of [[px - 8, px - 12], [px + 8, px + 12], [px, px + 2]] as const) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(lx0, py - 40); c.lineTo(lx1, py); c.stroke(); c.strokeStyle = Wd[3]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(lx0, py - 40); c.lineTo(lx1, py); c.stroke(); }
  box(c, px - 11, py - 46, 22, 28, INK); box(c, px - 10, py - 45, 20, 26, dimmed(GOLD)); bandOf(c, px - 8, py - 43, 16, 22);
  box(c, px - 12, py - 19, 24, 3, INK); box(c, px - 11, py - 19, 22, 2, Wd[4]);
  c.restore();
  // (the rope, in front of it on the apex)
  for (const sx of [x - 26, x + 26]) { post(c, sx, y - 30, y, 4, Gd); ball(c, sx, y - 32, 3, Gd[3], true); box(c, sx - 5, y - 3, 10, 3, INK); box(c, sx - 4, y - 3, 8, 2, Gd[3]); }
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 26, y - 26); c.quadraticCurveTo(x, y - 12, x + 26, y - 26); c.stroke();
  c.strokeStyle = Vl[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 26, y - 26); c.quadraticCurveTo(x, y - 12, x + 26, y - 26); c.stroke();
  c.strokeStyle = Vl[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 24, y - 27); c.quadraticCurveTo(x, y - 14, x + 24, y - 27); c.stroke();
};
/** The Seine (a puddle) lying on the paving (a..b): the sky in it, banded, its glint, its muddy rim, a paper boat. */
export const puddle = (c: Ctx, v: View, a: number, b: number, f: number) => {
  if (!onScreen(v, a, b) || v.eye.y >= GY - 1) return;
  const P = (x: number, d: number) => at(v.eye, x, GY, d), sky = skyAt(0.6);
  const ring = (k: number, d0: number, d1: number) => [P(a + k, d0), P(a + (b - a) * 0.3, d0 + 0.004), P(b - k, d0), P(b - k - 6, d1), P(a + (b - a) * 0.6, d1 - 0.004), P(a + k + 4, d1)] as [number, number][];
  poly(c, ring(0, 0.992, 0.952), hour('#6A5A48'));
  poly(c, ring(3, 0.988, 0.956), mix(sky, '#3A4A5A', 0.35));
  poly(c, ring(10, 0.982, 0.962), mix(sky, '#FFFFFF', 0.15));
  const [gx, gy] = P(a + (b - a) * 0.4 + Math.sin(f * 0.03) * 6, 0.972);
  box(c, gx, gy, 10, 1, '#FFFFFF'); box(c, gx + 3, gy + 2, 5, 1, mix(sky, '#FFFFFF', 0.5));
  const [bx, by] = P(a + (b - a) * 0.62, 0.97), bob = Math.sin(f * 0.06) * 0.6;
  poly(c, [[bx - 6, by - 2 + bob], [bx + 6, by - 2 + bob], [bx + 4, by + 1 + bob], [bx - 4, by + 1 + bob]], INK); poly(c, [[bx - 5, by - 2 + bob], [bx + 5, by - 2 + bob], [bx + 3, by + bob], [bx - 3, by + bob]], '#F4F4F2');
  poly(c, [[bx - 3, by - 2 + bob], [bx, by - 8 + bob], [bx + 3, by - 2 + bob]], INK); poly(c, [[bx - 2, by - 2 + bob], [bx, by - 7 + bob], [bx + 2, by - 2 + bob]], '#E5E5E2');
};
/** A bouquiniste's box (a box he stands on): green-painted sheet over wood, riveted, its padlock; the lid propped open
 *  behind it (set back) with prints pinned up; the old books inside going back. */
export const bookstall = (c: Ctx, v: View, a: number, b: number, top: number, seed: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top, G = ramp6(hour('#166534'));
  // (the lid propped open behind, its prints)
  const [la, ly] = at(v.eye, a, top, 0.95), [lb] = at(v.eye, b, top, 0.95), D = ramp6(dimmed('#166534'));
  c.save(); c.beginPath(); c.rect(la - 4, ly - 60, lb - la + 8, top - (ly - 60)); c.clip();
  box(c, la - 1, ly - 52, lb - la + 2, 53, INK); box(c, la, ly - 51, lb - la, 51, D[3]); box(c, la, ly - 51, lb - la, 2, D[5]);
  for (let k = 0; k < 3; k++) { const px0 = la + 6 + k * ((lb - la - 12) / 3), pw = (lb - la - 12) / 3 - 6, PC = ramp6(dimmed(['#F4EFE4', '#E8D8A8', '#D8E4EC'][(seed + k) % 3])); box(c, px0 - 1, ly - 45, pw + 2, 32, INK); box(c, px0, ly - 44, pw, 30, PC[3]); box(c, px0 + 3, ly - 40, pw - 6, 14, PC[1]); box(c, px0 + 3, ly - 22, pw - 8, 1, PC[0]); box(c, px0 + pw / 2 - 1, ly - 46, 2, 2, dimmed('#DC2626')); }
  c.restore();
  // (the books inside going back: their tops in a row)
  if (v.eye.y < top - 1) {
    const BK = ['#7F1D1D', '#1E3A8A', '#A16207', '#14532D', '#57534E', '#E7E5E4'];
    for (let x = a + 4, k = 0; x < b - 6; x += 7, k++) { const [p0, q0] = at(v.eye, x, top, 0.99), [p1, q1] = at(v.eye, x + 6, top, 0.955); poly(c, [[p0, q0], [p0 + 6 * 0.99, q0], [p1, q1], [p1 - 6 * 0.955, q1]], hour(BK[(k + seed) % BK.length])); }
  }
  still(c, `fr-bookstall-${w}x${h}`, a, top, -2, -1, w + 4, h + 2, g => {
    box(g, -1, 0, w + 2, h + 1, INK); slab(g, 0, 0, w, h, G, true);
    for (let x = 0; x < w; x += 24) { box(g, x, 0, 1, h, G[1]); box(g, x + 1, 0, 1, h, G[4]); }
    for (let y = 4; y < h; y += 14) for (let x = 4; x < w; x += 12) box(g, x, y, 1, 1, G[5]);
    box(g, 0, 0, w, 6, G[4]); box(g, 0, 5, w, 1, G[1]);
    const lx = w / 2;
    box(g, lx - 5, 8, 10, 14, INK); box(g, lx - 4, 9, 8, 12, hour('#A1A1AA')); box(g, lx - 4, 9, 2, 12, hour('#E5E7EB'));
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(lx, 26, 5, 0, Math.PI * 2); g.stroke(); g.strokeStyle = hour(GOLD); g.lineWidth = 1.5; g.beginPath(); g.arc(lx, 26, 5, Math.PI, Math.PI * 2.2); g.stroke();
    box(g, lx - 6, 28, 12, 10, INK); box(g, lx - 5, 29, 10, 8, hour(GOLD)); box(g, lx - 5, 29, 3, 8, hour('#FCD34D')); box(g, lx - 1, 31, 2, 3, INK);
  });
  lip(c, a, top, w);
};
/** The apartment block (a box he climbs over): its Haussmann front (the carriage door and a shop at its foot, the
 *  floors of tall windows and iron balconettes, the long balcony, the cornice), the zinc mansard up its top (its
 *  dormers), the chimney stacks set back along its roof. */
export const apartmentBlock = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 20, b + 20)) return;
  const w = b - a, h = GY - top;
  box3Back(c, v, { x: a, top, w, bottom: GY, col: '#7A8496' });
  // (the chimney stacks set back on its roof, behind where he walks)
  const S = ramp6(dimmed(STONE)), Br = ramp6(dimmed('#B8684A'));
  for (const rx of [a + 30, b - 50]) {
    const [px, py] = at(v.eye, rx, top, 0.95);
    c.save(); c.beginPath(); c.rect(px - 20, py - 60, 60, top - (py - 60)); c.clip();
    box(c, px - 1, py - 34, 26, 35, INK); box(c, px, py - 33, 24, 34, S[2]); box(c, px, py - 33, 5, 34, S[3]); box(c, px - 2, py - 36, 28, 4, S[4]);
    for (let k = 0; k < 4; k++) { box(c, px + 1 + k * 6, py - 44, 5, 9, INK); box(c, px + 2 + k * 6, py - 43, 3, 8, Br[3]); }
    c.restore();
  }
  still(c, `fr-block-${w}x${h}`, a, top, -6, -1, w + 12, h + 2, g => {
    const St = ramp6(hour(STONE)), Z = ramp6(hour(ZINC)), I = ramp6(hour(IRON)), Gp = ramp6(hour(BISTRO));
    box(g, -1, 0, w + 2, h + 1, INK);
    // (the mansard up its top: zinc in seams, its dormers)
    box(g, 0, 0, w, 52, Z[2]); for (let x = 0; x < w; x += 6) { box(g, x, 0, 1, 52, Z[4]); box(g, x + 1, 0, 1, 52, Z[1]); } box(g, 0, 0, w, 16, Z[3]);
    for (let k = 0; k < 3; k++) { const dx = 26 + k * ((w - 72) / 2); box(g, dx - 3, 8, 26, 40, INK); box(g, dx - 2, 9, 24, 38, St[3]); hole(g, dx + 2, 14, 16, 26, true); poly(g, [[dx - 4, 9], [dx + 10, 0], [dx + 24, 9]], St[4]); }
    // (the stone front under it)
    stoneBlocks(g, 0, 52, w, h - 52, St, 23, 36, 14);
    box(g, -3, 52, w + 6, 8, INK); box(g, -2, 53, w + 4, 6, St[4]); box(g, -2, 53, w + 4, 1, St[5]);
    for (let wy = 74, row = 0; wy < h - 130; wy += 76, row++) for (let k = 0; k < 3; k++) {
      const wx = 22 + k * ((w - 66) / 2);
      box(g, wx - 4, wy - 4, 30, 54, INK); box(g, wx - 3, wy - 3, 28, 52, St[3]); box(g, wx - 3, wy - 3, 28, 1, St[5]);
      hole(g, wx, wy, 22, 46, true);
      box(g, wx - 3, wy + 30, 28, 2, INK); for (let x = wx - 2; x < wx + 25; x += 3) box(g, x, wy + 32, 1, 12, I[2]); box(g, wx - 3, wy + 44, 28, 2, I[3]);
      if (row === 0) { poly(g, [[wx - 6, wy - 4], [wx + 11, wy - 14], [wx + 28, wy - 4]], INK); poly(g, [[wx - 5, wy - 5], [wx + 11, wy - 13], [wx + 27, wy - 5]], St[4]); }
    }
    // (the ground floor: the carriage door, green, its panels; a little shop beside it)
    box(g, 0, h - 110, w, 4, INK); box(g, 0, h - 109, w, 2, St[5]);
    for (let y = h - 104; y < h; y += 9) { box(g, 0, y, w, 1, St[0]); box(g, 0, y + 1, w, 1, St[4]); }
    const dx = 18, dw = 70;
    g.fillStyle = INK; g.beginPath(); g.moveTo(dx - 2, h); g.lineTo(dx - 2, h - 70); g.arc(dx + dw / 2, h - 70, dw / 2 + 2, Math.PI, 0); g.lineTo(dx + dw + 2, h); g.closePath(); g.fill();
    g.fillStyle = Gp[3]; g.beginPath(); g.moveTo(dx, h); g.lineTo(dx, h - 70); g.arc(dx + dw / 2, h - 70, dw / 2, Math.PI, 0); g.lineTo(dx + dw, h); g.closePath(); g.fill();
    box(g, dx + dw / 2 - 1, h - 104, 2, 104, Gp[1]);
    for (const px0 of [dx + 4, dx + dw / 2 + 4]) for (const py0 of [h - 66, h - 32]) { box(g, px0, py0, dw / 2 - 8, 26, Gp[2]); box(g, px0, py0, dw / 2 - 8, 1, Gp[4]); box(g, px0, py0, 1, 26, Gp[4]); }
    box(g, dx + dw / 2 - 5, h - 44, 3, 3, hour(GOLD)); box(g, dx + dw / 2 + 2, h - 44, 3, 3, hour(GOLD));
    hole(g, w - 80, h - 80, 56, 46, false);
    box(g, w - 84, h - 96, 64, 14, INK); box(g, w - 83, h - 95, 62, 12, Gp[3]); words(g, 'TABAC', w - 52, h - 85, plain(1, 1, hour('#FDE68A')));
  });
  lip(c, a, top, w);
};
/** France's flag: the tricolor on its pole in stepped folds. */
export const drawFrFlag = (c: Ctx, x: number, f: number) => flagPole(c, x, GY, 200, ['#002395', '#F8FAFC', '#ED2939'], f, true);
/** An iron balcony off the apartment block (one-way, at the play plane): its iron slab, the brackets under it, the
 *  rail along its back (set back), geraniums. */
export const ironBalcony = (c: Ctx, v: View, a: number, b: number, y: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const I = ramp6(hour(IRON));
  for (let x = a + 8; x < b - 6; x += 30) for (const [col, lw] of [[INK, 3], [I[3], 1]] as const) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x, y + 8); c.quadraticCurveTo(x + 8, y + 12, x + 2, y + 26); c.stroke(); }
  ledge3(c, v, a, y, b - a, '#5A646C', 8);
  ironRail(c, v, a, b, y);
};

void hash; void atDepth; void words;
