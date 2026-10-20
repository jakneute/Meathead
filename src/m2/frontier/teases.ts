// Wilderness Land's far teases (screen space; every backdrop that shows the far off draws them): the land's OTHER
// attractions where they'd be seen from wherever he is, each one stood at its own spot on the land's map, so it holds
// its direction and distance from section to section (it slides by parallax as he goes; it's never repeated, never
// popped in), and the neighboring lands' landmarks out past the park's edge.
//
//   THE TRESTLE        the railroad's high timber trestle across a gorge between two fiberglass bluffs, a tunnel in
//                      each; Tucker's train crossing it now and then (the engine's stack puffing), seen from the wilds
//   SAWDUST GULCH      the Mother Lode's fiberglass mountain and its timber headframe (the sheave wheel), the false
//                      fronts' tops, the church's white steeple, the cedar water tower, the windmill (turning), the
//                      mill's brick stack (smoking), telegraph poles
//   TIMBER TUMBLE      the ride's fiberglass mountain: the lift hill's trestle up its left, the trough along a ledge,
//                      THE BIG DROP down its right face on its bents, the splash pool (a log goes up, along and down
//                      it, and the water comes up white); from outside the park, its BACK: raw plywood and the steel
//                      armature holding the shell up
//   SPOOKY LAND        (next door) Donnie Dracula's OTHER castle: lilac stone, the keep's purple spike and red flag,
//                      the round towers' snuffer roofs, and the clock tower by it
//   FUTURE LAND        (next door, the other way) 1962's tomorrow: the needle tower and its saucer, the giant atom,
//                      a rocket on its gantry
//
// Where each is: `lx` along the land's map (the land's own world x from FRX: the sections lie left to right in the
// order they're played), `par` how much it slides (how far off it is: one eye, so the farther, the slower). `hide`:
// where he's IN it (it's the scenery then, not the far off). Each is painted once for the hour into a stamp; only what
// moves on it is drawn live, and only when it's on screen. No volcanoes anywhere.

import { CANVAS_WIDTH } from '../../m1/constants';
import { type Ctx, box, checker, mix, hash, poly, stamp, bandedGradient, pixelBlob, INK, timeOfDay, farTint, skyAt } from './wilds/paint';
import { hourMix, type TimeOfDay } from '../timeOfDay';
import { mist } from '../adventure/farArt';
import { signText } from '../signLetters';

const W = CANVAS_WIDTH;
type T = (c: string) => string;

/** A far thing's color for the hour, then into the sky's haze by `k` (the wilds' far layers'). */
const farCol = (tod: TimeOfDay, k: number): T => c => mix(farTint(hourMix(c, mix(c, '#8A5A48', 0.18), mix(c, '#141832', 0.45), tod), 1, tod), skyAt(0.88, tod), k);
/** A ramp off one color: shadow, shade, itself, lit, highlight. */
const rampT = (t: T, c: string) => [t(mix(c, '#141A30', 0.5)), t(mix(c, '#141A30', 0.26)), t(c), t(mix(c, '#F4ECD8', 0.24)), t(mix(c, '#FFFFFF', 0.45))];
const line = (g: Ctx, pts: number[], w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); for (let i = 0; i < pts.length; i += 2) (i ? g.lineTo(pts[i], pts[i + 1]) : g.moveTo(pts[i], pts[i + 1])); g.stroke(); };
/** A little stepped pine (shade, lit left, a tip), its foot at (x, y). */
const minipine = (g: Ctx, x: number, y: number, h: number, N: string[]) => {
  for (let t = 0; t < 3; t++) {
    const y0 = y - h + t * h * 0.28, half = 2 + t * h * 0.13;
    poly(g, [[x, y0], [x + half, y0 + h * 0.42], [x - half, y0 + h * 0.42]], N[1]);
    poly(g, [[x, y0], [x - half, y0 + h * 0.42], [x - half * 0.2, y0 + h * 0.42]], N[3]);
  }
  box(g, x - 1, y - h, 1, 2, N[4]);
};
/** A molded fiberglass crag through `pts` (its feet on `foot`): banded down, strata lit along their tops, each peak's
 *  right flank in shade (dithered off), the panel seams bolted down it; the ridge inked. */
const crag = (g: Ctx, pts: [number, number][], foot: number, F: string[], bolt: string, seed: number) => {
  const xa = pts[0][0], xb = pts[pts.length - 1][0], top = Math.min(...pts.map(p => p[1]));
  const shape: [number, number][] = [[xa, foot], ...pts, [xb, foot]];
  poly(g, shape.map(([x, y]) => [x, y - 1] as [number, number]), INK);
  g.save(); g.beginPath(); shape.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  bandedGradient(g, xa, top, xb - xa, foot - top, [F[4], F[3], F[3], F[2], F[2], F[1]], 7);
  for (let k = 0, y = top + 10; y < foot; k++, y += 14 + (k % 3) * 3) for (let x = xa + (k % 3) * 9; x < xb; x += 34 + ((k * 13) % 20)) {
    const lw = 18 + ((k * 7 + x) % 14);
    box(g, x, y, lw, 2, F[4]); box(g, x, y + 2, lw, 3, F[1]); checker(g, x, y + 5, lw, 2, F[1], k % 2);
  }
  for (let i = 1; i < pts.length - 1; i++) if (pts[i - 1][1] > pts[i][1] && pts[i + 1][1] >= pts[i][1]) {
    const [px, py] = pts[i];
    poly(g, [[px, py], [px + (foot - py) * 0.42, foot], [px + 4, foot]], F[1]);
    checker(g, px - 6, py + 6, 8, foot - py, F[1], 0);
    poly(g, [[px, py], [px - 3, py + 6], [px - (foot - py) * 0.2, foot], [px - (foot - py) * 0.34, foot]], F[4]);
  }
  for (let sx = xa + 40 + (seed % 3) * 10; sx < xb - 20; sx += 70) { box(g, sx, top, 1, foot - top, F[1]); box(g, sx + 1, top, 1, foot - top, F[3]); for (let by = top + 8; by < foot; by += 14) box(g, sx - 1, by, 2, 2, bolt); }
  g.restore();
  line(g, pts.flat(), 1, F[0]);
};

// ---------------------------------------------------------------------------------------------------------------
// THE TRESTLE

const TRW = 440, TRH = 176, DECK = 58, PORTAL_L = 72, PORTAL_R = 368;
const paintTrestle = (g: Ctx, tod: TimeOfDay) => {
  const t = farCol(tod, 0.26), F = rampT(t, '#9A7E62'), P = rampT(t, '#7E5A36'), S = rampT(t, '#5A6068'), N = rampT(t, '#2E5440');
  // (the gorge's back wall, far: hazier rock in steps)
  const B = rampT(farCol(tod, 0.52), '#8A7460');
  poly(g, [[60, TRH], [70, 96], [120, 104], [170, 92], [230, 108], [290, 94], [340, 102], [380, 92], [384, TRH]], B[2]);
  for (let y = 100; y < TRH; y += 10) box(g, 66, y, 316, 1, (y / 10) % 2 ? B[1] : B[3]);
  // (the bluffs either side: the park's fiberglass, molded, bolted; a tunnel portal in each, the timber frame round it)
  crag(g, [[0, 62], [10, 40], [34, 30], [52, 36], [64, 44], [78, 50], [90, 58], [96, 70]], TRH, F, S[3], 3);
  crag(g, [[344, 66], [356, 50], [378, 42], [400, 26], [420, 34], [440, 40]], TRH, F, S[3], 7);
  for (const px of [PORTAL_L - 14, PORTAL_R]) {
    poly(g, [[px - 3, DECK + 2], [px - 3, DECK - 18], [px + 7, DECK - 25], [px + 17, DECK - 18], [px + 17, DECK + 2]], INK);
    poly(g, [[px - 1, DECK + 1], [px - 1, DECK - 17], [px + 7, DECK - 23], [px + 15, DECK - 17], [px + 15, DECK + 1]], t('#0E0A08'));
    box(g, px - 4, DECK - 26, 22, 3, P[3]); box(g, px - 4, DECK - 26, 22, 1, P[4]);
    for (const sx of [px - 4, px + 15]) { box(g, sx, DECK - 23, 3, 25, P[2]); box(g, sx, DECK - 23, 1, 25, P[4]); }
  }
  // (the bents: tapered timber towers down from the deck, X-braced, sway-braced across; lit down their left)
  for (let bx = 96; bx <= 344; bx += 31) {
    const a = 6, b = 14;
    poly(g, [[bx - a, DECK + 4], [bx + a, DECK + 4], [bx + b, TRH], [bx - b, TRH]], P[1]);
    line(g, [bx - a, DECK + 4, bx - b, TRH], 2, P[3]); line(g, [bx + a, DECK + 4, bx + b, TRH], 2, P[2]);
    line(g, [bx, DECK + 4, bx, TRH], 1, P[2]);
    for (let y = DECK + 16, k = 0; y < TRH - 6; y += 20, k++) { const u = (y - DECK) / (TRH - DECK), w = a + (b - a) * u; line(g, [bx - w, y, bx + w + 2, y + 20], 1, P[k % 2 ? 2 : 3]); line(g, [bx + w, y, bx - w - 2, y + 20], 1, P[1]); box(g, bx - w, y, w * 2, 1, P[3]); }
    if (bx + 31 <= 344) for (let y = DECK + 30; y < TRH; y += 40) line(g, [bx + 10, y, bx + 21, y + 14], 1, P[0]);
  }
  // (the deck: its stringer, the ties' ends in a row, the rail and its guard timber, a water barrel on its stand)
  // (kept dark along its top: far off, and nothing to stand on)
  box(g, PORTAL_L, DECK, PORTAL_R - PORTAL_L, 6, P[0]); box(g, PORTAL_L, DECK + 2, PORTAL_R - PORTAL_L, 3, P[1]); checker(g, PORTAL_L, DECK + 1, PORTAL_R - PORTAL_L, 1, P[2]);
  for (let x = PORTAL_L; x < PORTAL_R; x += 4) box(g, x, DECK + 5, 2, 2, P[0]);
  box(g, PORTAL_L, DECK - 2, PORTAL_R - PORTAL_L, 2, S[1]);
  for (let x = PORTAL_L + 6; x < PORTAL_R; x += 12) box(g, x, DECK - 6, 1, 4, P[1]);
  box(g, PORTAL_L, DECK - 6, PORTAL_R - PORTAL_L, 1, P[1]);
  box(g, 214, DECK - 10, 8, 8, P[1]); box(g, 214, DECK - 10, 8, 2, P[3]); box(g, 215, DECK - 12, 6, 2, S[2]);
  // (the river down in the gorge, glinting between the bents; firs at the bluffs' feet)
  const R = rampT(t, '#3E7A9A');
  box(g, 70, TRH - 14, 300, 14, R[1]); for (let k = 0; k < 14; k++) box(g, 78 + hash(k * 2.3) * 280, TRH - 12 + (k % 3) * 3, 6 + (k % 4) * 3, 1, R[4]);
  for (let i = 0; i < 30; i++) { const x = (i < 15 ? 4 + i * 7 : 330 + (i - 15) * 7) + hash(i) * 4; minipine(g, x, TRH - 2 - hash(i * 3.1) * 8, 14 + hash(i * 1.7) * 14, N); }
  mist(g, TRW, TRH - 60, 60, skyAt(0.92, tod), 0, 0.4, 4);
};
/** Tucker's train over the trestle: out of the left tunnel, across, into the right one (clipped to the deck between the
 *  portals), the stack puffing; `u` 0..1 along its run. */
const trainOn = (c: Ctx, x0: number, top: number, u: number, f: number, t: T) => {
  const len = 150, x = x0 + PORTAL_L - len + (PORTAL_R - PORTAL_L + len) * u, y = top + DECK - 2;
  c.save(); c.beginPath(); c.rect(x0 + PORTAL_L - 4, top, PORTAL_R - PORTAL_L + 8, DECK + 10); c.clip();
  const Rd = rampT(t, '#A3262A'), Mr = rampT(t, '#5E2230'), Bk = rampT(t, '#26262E'), Br = rampT(t, '#C8962E');
  // (the cars from the back: a caboose, coaches, a boxcar, the tender, the engine at the front, right)
  const cars: [number, string[], number][] = [[22, Rd, 11], [24, Mr, 10], [24, Mr, 10], [22, Rd, 10], [16, Bk, 8]];
  let cx = x;
  for (const [w, R, h] of cars) {
    box(c, cx, y - h - 3, w, h + 1, INK); box(c, cx + 1, y - h - 2, w - 2, h - 1, R[2]); box(c, cx + 1, y - h - 2, w - 2, 1, R[4]); box(c, cx + 1, y - 4, w - 2, 1, R[0]);
    if (R !== Bk) for (let wx = cx + 3; wx < cx + w - 4; wx += 5) box(c, wx, y - h + 1, 3, 3, t('#F4E4B8'));
    box(c, cx + 3, y - 3, 3, 3, INK); box(c, cx + w - 6, y - 3, 3, 3, INK);
    cx += w + 2;
  }
  // (the engine: the boiler, its brass band, the cab, the big stack, the headlamp, the cowcatcher)
  box(c, cx, y - 13, 12, 12, INK); box(c, cx + 1, y - 12, 10, 10, Rd[1]); box(c, cx + 2, y - 11, 4, 3, t('#F4E4B8'));
  box(c, cx + 11, y - 9, 18, 8, INK); box(c, cx + 12, y - 8, 16, 6, Bk[2]); box(c, cx + 12, y - 8, 16, 1, Bk[4]); box(c, cx + 18, y - 8, 2, 6, Br[3]);
  box(c, cx + 23, y - 15, 5, 7, INK); box(c, cx + 24, y - 14, 3, 6, Bk[3]); box(c, cx + 22, y - 16, 7, 2, INK);
  box(c, cx + 28, y - 7, 2, 2, (f >> 4) % 2 ? '#FFF2B0' : t('#F2D27A'));
  poly(c, [[cx + 29, y - 4], [cx + 33, y], [cx + 29, y]], Rd[2]);
  for (const wx of [cx + 4, cx + 14, cx + 22]) box(c, wx, y - 3, 3, 3, INK);
  c.restore();
  // (the stack's smoke: puffs left behind it, rising and thinning)
  const Sm = [t('#8A8A90'), t('#C4C4C8'), t('#ECECEE')];
  for (let k = 0; k < 6; k++) {
    const age = (f * 0.5 + k * 9) % 54, px = cx + 25 - age * 0.9, py = y - 18 - age * 0.5, r = 3 + age * 0.12;
    if (px < x0 + PORTAL_L - 6 || px > x0 + PORTAL_R + 30) continue;
    c.globalAlpha = Math.max(0, 0.9 - age / 60); pixelBlob(c, px, py, r, r * 0.8, Sm[age < 18 ? 0 : age < 36 ? 1 : 2]); c.globalAlpha = 1;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// SAWDUST GULCH

const GW = 520, GH = 240;
const WM = [52, 132] as const, STACK = [372, 82] as const;
const paintGulch = (g: Ctx, tod: TimeOfDay) => {
  const t = farCol(tod, 0.3), lamps = tod.lamps > 0.3;
  const F = rampT(t, '#A8906C'), Tm = rampT(t, '#5E4426'), Wd = rampT(t, '#8A6440'), Wh = rampT(t, '#E2DED2'), St = rampT(t, '#5A626C'), N = rampT(t, '#2A4A30');
  const Bk = rampT(t, '#8E3E2C'), Rf = rampT(t, '#5A3A30'), Cd = rampT(t, '#9A6A44');
  // ---- the Mother Lode's fiberglass mountain behind the town, its pines on its ledges
  crag(g, [[200, 150], [226, 112], [256, 96], [286, 70], [310, 52], [330, 60], [356, 40], [380, 30], [404, 46], [430, 62], [456, 58], [480, 84], [504, 110], [520, 128]], GH, F, St[3], 5);
  for (const [px, py] of [[244, 112], [300, 82], [342, 70], [398, 62], [446, 76], [490, 114]] as const) minipine(g, px, py + 8, 16, N);
  // ---- the headframe on its shoulder: two timber legs, the braces, the cap, the sheave wheel up top, the cable down
  const hx = 300, hb = GH - 30, ht = hb - 92;
  for (const lx of [hx - 16, hx + 16]) { box(g, lx - 3, ht, 6, hb - ht, INK); box(g, lx - 2, ht, 4, hb - ht, Tm[2]); box(g, lx - 2, ht, 1, hb - ht, Tm[4]); }
  line(g, [hx - 16, ht + 4, hx, ht - 22, hx + 16, ht + 4], 3, INK); line(g, [hx - 16, ht + 4, hx, ht - 22, hx + 16, ht + 4], 2, Tm[3]);
  line(g, [hx - 16, ht + 40, hx + 16, ht + 4], 2, Tm[2]); line(g, [hx + 16, ht + 40, hx - 16, ht + 4], 2, Tm[1]);
  box(g, hx - 22, ht - 2, 44, 5, INK); box(g, hx - 21, ht - 1, 42, 3, Tm[3]); box(g, hx - 21, ht - 1, 42, 1, Tm[4]);
  g.fillStyle = INK; g.beginPath(); g.arc(hx, ht - 18, 11, 0, Math.PI * 2); g.fill();
  g.strokeStyle = St[3]; g.lineWidth = 2; g.beginPath(); g.arc(hx, ht - 18, 8, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; line(g, [hx, ht - 18, hx + Math.cos(a) * 8, ht - 18 + Math.sin(a) * 8], 1, St[2]); }
  box(g, hx - 1, ht - 19, 2, 2, t('#C8962E')); box(g, hx + 8, ht - 18, 1, hb - ht + 18, St[1]);
  box(g, hx - 24, ht + 18, 48, 12, INK); box(g, hx - 23, ht + 19, 46, 10, Wd[3]); box(g, hx - 23, ht + 19, 46, 1, Wd[4]);
  for (let k = 0; k < 5; k++) box(g, hx - 19 + k * 9, ht + 23, 6, 2, Tm[1]);
  // ---- the town's skyline along the foot: false fronts (parapets stepped, cornices lit), each its own paint
  const fronts: [number, number, number, string][] = [[6, 34, 58, '#A0784C'], [42, 30, 70, '#8E3E2C'], [74, 40, 64, '#6E7E5A'], [116, 26, 52, '#B89A6A'], [214, 36, 66, '#7A5A3C'], [252, 28, 50, '#9A5A3A'], [326, 38, 60, '#8A8270'], [366, 30, 46, '#A0784C'], [398, 44, 54, '#6A4A30']];
  for (const [fx, fw, fh, col] of fronts) {
    const R = rampT(t, col), y = GH - fh;
    box(g, fx - 1, y - 1, fw + 2, fh + 1, INK); box(g, fx, y, fw, fh, R[2]); box(g, fx, y, 2, fh, R[3]); box(g, fx + fw - 3, y, 3, fh, R[1]);
    for (let yy = y + 4; yy < GH; yy += 4) box(g, fx + 2, yy, fw - 5, 1, R[1]);
    box(g, fx - 2, y, fw + 4, 3, R[3]); box(g, fx - 2, y + 3, fw + 4, 1, R[0]);
    box(g, fx + fw * 0.25, y - 6, fw * 0.5, 6, R[2]); box(g, fx + fw * 0.25, y - 6, fw * 0.5, 1, R[4]);
    for (let wx = fx + 5; wx < fx + fw - 7; wx += 9) for (const wy of [y + 10, y + 26]) if (wy < GH - 14) { box(g, wx, wy, 5, 7, INK); box(g, wx + 1, wy + 1, 3, 5, lamps && hash(wx + wy) > 0.35 ? '#F2C266' : t('#3A4A5A')); }
  }
  // ---- the church: white clapboard, its roof, the steeple with its bell window and cross
  const cx = 168, cw = 40;
  box(g, cx - cw / 2 - 1, GH - 46, cw + 2, 46, INK); box(g, cx - cw / 2, GH - 45, cw, 45, Wh[2]); box(g, cx - cw / 2, GH - 45, 4, 45, Wh[4]); box(g, cx + cw / 2 - 5, GH - 45, 5, 45, Wh[1]);
  for (let y = GH - 42; y < GH; y += 3) box(g, cx - cw / 2, y, cw, 1, Wh[1]);
  poly(g, [[cx - cw / 2 - 4, GH - 44], [cx, GH - 62], [cx + cw / 2 + 4, GH - 44]], INK); poly(g, [[cx - cw / 2 - 2, GH - 45], [cx, GH - 60], [cx + cw / 2 + 2, GH - 45]], Rf[2]); poly(g, [[cx - cw / 2 - 2, GH - 45], [cx, GH - 60], [cx - 6, GH - 45]], Rf[3]);
  box(g, cx - 8, GH - 96, 16, 42, INK); box(g, cx - 7, GH - 95, 14, 41, Wh[2]); box(g, cx - 7, GH - 95, 3, 41, Wh[4]); box(g, cx + 3, GH - 95, 4, 41, Wh[1]);
  box(g, cx - 3, GH - 90, 6, 8, t('#2A2A30')); box(g, cx - 2, GH - 88, 4, 4, t('#B8902E'));
  poly(g, [[cx - 10, GH - 96], [cx, GH - 128], [cx + 10, GH - 96]], INK); poly(g, [[cx - 8, GH - 97], [cx, GH - 125], [cx + 8, GH - 97]], Rf[2]); poly(g, [[cx - 8, GH - 97], [cx, GH - 125], [cx - 2, GH - 97]], Rf[3]);
  box(g, cx - 1, GH - 136, 2, 10, St[1]); box(g, cx - 3, GH - 133, 6, 1, St[1]);
  for (const wx of [cx - 14, cx + 8]) { box(g, wx, GH - 34, 6, 12, INK); box(g, wx + 1, GH - 33, 4, 10, lamps ? '#E8B05A' : t('#5A7A94')); }
  // ---- the cedar water tower on its legs: staves banded with hoops, its cone roof, the spout
  const tx = 228, tb = GH - 62;
  for (const lx of [tx - 14, tx - 5, tx + 5, tx + 14]) box(g, lx - 1, tb, 2, GH - tb, Tm[1]);
  line(g, [tx - 14, tb + 4, tx + 14, tb + 30, tx - 14, tb + 56], 1, Tm[2]);
  box(g, tx - 18, tb - 30, 36, 31, INK);
  for (let x = tx - 17; x < tx + 17; x += 2) { const u = (x - tx + 17) / 34; box(g, x, tb - 29, 2, 29, Cd[u < 0.2 ? 4 : u < 0.5 ? 3 : u < 0.8 ? 2 : 1]); }
  for (const hy of [tb - 24, tb - 14, tb - 5]) box(g, tx - 17, hy, 34, 1, St[1]);
  poly(g, [[tx - 21, tb - 29], [tx, tb - 46], [tx + 21, tb - 29]], INK); poly(g, [[tx - 19, tb - 30], [tx, tb - 44], [tx + 19, tb - 30]], Rf[2]); poly(g, [[tx - 19, tb - 30], [tx, tb - 44], [tx - 4, tb - 30]], Rf[3]);
  line(g, [tx + 17, tb - 8, tx + 26, tb + 2], 2, St[2]);
  // ---- the windmill's lattice tower (the blades are live), its tail vane
  const [wx, wy] = WM;
  line(g, [wx - 12, GH, wx - 2, wy + 4], 2, St[2]); line(g, [wx + 12, GH, wx + 2, wy + 4], 2, St[2]);
  g.strokeStyle = St[1]; g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 6; k++) { const y0 = GH - k * 18, y1 = y0 - 18, h0 = 12 - k * 1.6, h1 = 12 - (k + 1) * 1.6; g.moveTo(wx - h0, y0); g.lineTo(wx + h1, y1); g.moveTo(wx + h0, y0); g.lineTo(wx - h1, y1); } g.stroke();
  box(g, wx, wy - 1, 18, 2, St[2]); poly(g, [[wx + 14, wy - 7], [wx + 26, wy - 4], [wx + 26, wy + 4], [wx + 14, wy + 1]], St[3]);
  // ---- the mill's brick stack (its smoke's live), the mill's shed roof at its foot
  const [sx, sy] = STACK;
  box(g, sx - 6, sy, 12, GH - sy, INK); for (let x = sx - 5; x < sx + 5; x += 2) box(g, x, sy, 2, GH - sy, Bk[x < sx - 2 ? 3 : x < sx + 2 ? 2 : 1]);
  for (let y = sy + 4; y < GH; y += 6) checker(g, sx - 5, y, 10, 1, Bk[0]);
  box(g, sx - 8, sy - 4, 16, 5, INK); box(g, sx - 7, sy - 3, 14, 3, Bk[3]);
  poly(g, [[sx - 40, GH - 40], [sx + 34, GH - 52], [sx + 34, GH], [sx - 40, GH]], INK); poly(g, [[sx - 39, GH - 39], [sx + 33, GH - 51], [sx + 33, GH], [sx - 39, GH]], Wd[2]);
  for (let x = sx - 36; x < sx + 32; x += 6) box(g, x, GH - 40 - (x - sx + 40) * 0.16, 1, 40, Wd[1]);
  // ---- telegraph poles and their sagging wires, pines between it all
  const poles = [24, 132, 264, 470];
  g.strokeStyle = t('#2A2018'); g.lineWidth = 1;
  for (let i = 0; i + 1 < poles.length; i++) { g.beginPath(); g.moveTo(poles[i], GH - 70); g.quadraticCurveTo((poles[i] + poles[i + 1]) / 2, GH - 60, poles[i + 1], GH - 70); g.stroke(); }
  for (const px of poles) { box(g, px - 1, GH - 76, 2, 76, Tm[1]); box(g, px - 6, GH - 72, 13, 2, Tm[1]); }
  for (let i = 0; i < 26; i++) { const x = hash(i * 4.1) * GW; if (Math.abs(x - cx) < 26 || Math.abs(x - tx) < 22) continue; minipine(g, x, GH - 1, 12 + hash(i * 2.2) * 16, N); }
  mist(g, GW, GH - 70, 70, skyAt(0.92, tod), 0, 0.3, 4);
};
const liveGulch = (c: Ctx, x0: number, top: number, f: number, t: T) => {
  // (the windmill's blades turning; the stack's smoke rolling off downwind)
  const [wx, wy] = WM, St = rampT(t, '#5A626C');
  for (let k = 0; k < 8; k++) { const a = f * 0.03 + (k * Math.PI) / 4; c.strokeStyle = k % 2 ? St[3] : St[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 + wx, top + wy); c.lineTo(x0 + wx + Math.cos(a) * 13, top + wy + Math.sin(a) * 13); c.stroke(); }
  box(c, x0 + wx - 2, top + wy - 2, 4, 4, INK);
  const [sx, sy] = STACK, Sm = [t('#8A8A90'), t('#B4B4BA'), t('#D8D8DC')];
  for (let k = 0; k < 7; k++) {
    const age = (f * 0.35 + k * 14) % 98, r = 4 + age * 0.12;
    c.globalAlpha = Math.max(0, 0.85 - age / 110);
    pixelBlob(c, x0 + sx - age * 0.55, top + sy - 6 - age * 0.62, r, r * 0.75, Sm[age < 30 ? 0 : age < 64 ? 1 : 2]);
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// TIMBER TUMBLE

const TTW = 560, TTH = 270;
/** The ride's line: the lift hill up the left, the trough along the ledge, the big drop down the right face. */
const LIFT: [number, number, number, number] = [56, TTH - 26, 236, 70];
const LEDGE: [number, number, number, number] = [236, 70, 320, 82];
const DROP: [number, number, number, number] = [320, 82, 452, TTH - 26];
const POOL = 478;
const TT_CRAG: [number, number][] = [[0, 170], [30, 140], [60, 128], [96, 100], [130, 86], [160, 60], [196, 46], [230, 34], [262, 22], [290, 30], [316, 18], [346, 34], [380, 58], [410, 76], [440, 104], [470, 128], [500, 150], [530, 176], [560, 196]];
const paintTumble = (back: boolean) => (g: Ctx, tod: TimeOfDay) => {
  const t = farCol(tod, back ? 0.46 : 0.28), F = rampT(t, '#9C8C74'), P = rampT(t, '#7A5634'), S = rampT(t, '#5A626E'), N = rampT(t, '#2A4C34'), Ply = rampT(t, '#B08A56'), Wt = rampT(t, '#4C9AC0');
  if (back) {
    // (from outside the park: the shell's BACK. Raw plywood panels in courses (seams, a water stain), the steel
    // armature holding it up (uprights, rails, diagonals, footings), a light tower; the lift hill's trestle showing)
    const shape: [number, number][] = [[0, TTH], ...TT_CRAG.map(([x, y]) => [TTW - x, y] as [number, number]).reverse(), [TTW, TTH]];
    poly(g, shape.map(([x, y]) => [x, y - 1] as [number, number]), INK);
    g.save(); g.beginPath(); shape.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    for (let r = 0, y = 10; y < TTH; y += 24, r++) for (let x = -(r % 2) * 24; x < TTW; x += 48) {
      const k = hash(x * 0.37 + r * 7);
      box(g, x, y, 48, 24, Ply[k > 0.7 ? 3 : 2]); box(g, x, y, 48, 1, Ply[1]); box(g, x, y, 1, 24, Ply[1]);
      for (let gy = y + 4; gy < y + 22; gy += 5) box(g, x + 4 + hash(x + gy) * 18, gy, 10 + hash(gy) * 16, 1, Ply[1]);
      if (k > 0.86) { g.globalAlpha = 0.45; pixelBlob(g, x + 22, y + 16, 12, 6, Ply[0]); g.globalAlpha = 1; }
    }
    g.restore();
    // (the armature: a steel lattice in bays (uprights to under the shell, rails across, a diagonal in every bay), each
    // member inked, lit down its left; concrete footings)
    const crest = (x: number) => shape.reduce((m, [px, py]) => (Math.abs(px - x) < 26 ? Math.min(m, py) : m), TTH);
    const stud = (xa: number, ya: number, xb: number, yb: number, w = 2) => { line(g, [xa, ya, xb, yb], w + 2, INK); line(g, [xa, ya, xb, yb], w, S[2]); line(g, [xa - 1, ya, xb - 1, yb], 1, S[4]); };
    const xs: number[] = []; for (let x = 44; x < TTW - 30; x += 44) xs.push(x);
    for (const x of xs) stud(x, TTH, x, Math.min(TTH - 20, crest(x) + 14), 3);
    for (let y = TTH - 40; y > 30; y -= 40) for (let i = 0; i + 1 < xs.length; i++) { const a = xs[i], b = xs[i + 1]; if (crest(a) + 16 < y && crest(b) + 16 < y) { stud(a, y, b, y); stud(a, y, b, y - 40 > crest(b) + 16 ? y - 40 : y, 1); } }
    for (const x of xs) { box(g, x - 7, TTH - 7, 14, 7, INK); box(g, x - 6, TTH - 6, 12, 6, t('#8A8478')); box(g, x - 6, TTH - 6, 12, 1, t('#B4AEA2')); }
    signText(g, 'PROP 31', 280, TTH - 74, { sx: 1, sy: 1, fill: t('#2A2218') });
  } else {
    crag(g, TT_CRAG, TTH, F, S[3], 11);
    for (const [px, py] of [[70, 140], [120, 106], [178, 74], [250, 50], [372, 78], [404, 98], [436, 124], [500, 168], [528, 186], [30, 166]] as const) minipine(g, px, py + 12, 18, N);
  }
  // ---- the lift hill: a timber trestle climbing to the top, the trough on it, the chain glinting up its middle
  const [la, lb, lc, ld] = LIFT, LA = back ? TTW - la : la, LC = back ? TTW - lc : lc;
  for (let k = 0; k <= 9; k++) {
    const x = LA + ((LC - LA) * k) / 9, y = lb + ((ld - lb) * k) / 9;
    box(g, x - 2, y + 6, 4, TTH - y - 6, INK); box(g, x - 1, y + 6, 2, TTH - y - 6, P[2]); box(g, x - 1, y + 6, 1, TTH - y - 6, P[4]);
    if (k < 9) { const nx = LA + ((LC - LA) * (k + 1)) / 9, ny = lb + ((ld - lb) * (k + 1)) / 9; line(g, [x, TTH - 4, nx, ny + 10], 1, P[1]); line(g, [x, y + 10, nx, TTH - 4], 1, P[1]); for (let yy = y + 26; yy < TTH; yy += 24) box(g, Math.min(x, nx), yy, Math.abs(nx - x) + 1, 2, P[1]); }
  }
  line(g, [LA, lb, LC, ld], 8, INK); line(g, [LA, lb, LC, ld], 6, P[2]); line(g, [LA, lb - 3, LC, ld - 3], 1, P[4]);
  for (let k = 0; k < 18; k++) { const u = k / 18; box(g, LA + (LC - LA) * u, lb - 1 + (ld - lb) * u, 2, 1, S[4]); }
  if (back) { mist(g, TTW, TTH - 80, 80, skyAt(0.92, tod), 0, 0.34, 4); return; }
  // ---- the trough along the ledge, the water in it
  const [ea, eb, ec, ed] = LEDGE;
  line(g, [ea, eb, ec, ed], 8, INK); line(g, [ea, eb, ec, ed], 6, P[2]); line(g, [ea, eb - 2, ec, ed - 2], 2, Wt[3]);
  // ---- THE BIG DROP: steep down the right face on its bents, the trough, the water white where it runs fast
  const [da, db, dc, dd] = DROP;
  for (let k = 1; k <= 7; k++) { const x = da + ((dc - da) * k) / 8, y = db + ((dd - db) * k * k) / 64; box(g, x - 2, y + 4, 4, TTH - y - 4, INK); box(g, x - 1, y + 4, 2, TTH - y - 4, P[2]); box(g, x - 1, y + 4, 1, TTH - y - 4, P[4]); line(g, [x - 8, TTH, x, y + 10, x + 8, TTH], 1, P[1]); }
  g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); for (let k = 0; k <= 16; k++) { const u = k / 16, x = da + (dc - da) * u, y = db + (dd - db) * u * u; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.strokeStyle = P[2]; g.lineWidth = 7; g.stroke();
  g.strokeStyle = Wt[4]; g.lineWidth = 2; g.beginPath(); for (let k = 4; k <= 16; k++) { const u = k / 16, x = da + (dc - da) * u, y = db + (dd - db) * u * u - 2; k > 4 ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  // ---- the splash pool at its foot (banded, the white water on it), the viewing bridge over it, a light tower
  bandedGradient(g, POOL - 40, TTH - 18, 90, 18, [Wt[3], Wt[2], Wt[1]], 3);
  for (let k = 0; k < 9; k++) pixelBlob(g, POOL - 28 + k * 7, TTH - 18 - (k % 3) * 2, 4, 3, k % 2 ? Wt[4] : t('#F4FAFF'));
  box(g, POOL - 44, TTH - 26, 98, 3, INK); box(g, POOL - 43, TTH - 25, 96, 1, P[4]); for (let x = POOL - 42; x < POOL + 52; x += 8) box(g, x, TTH - 32, 1, 6, P[2]);
  const lt = 540;
  box(g, lt - 1, TTH - 170, 3, 170, S[2]); box(g, lt - 1, TTH - 170, 1, 170, S[4]); for (let y = TTH - 160; y < TTH; y += 16) line(g, [lt - 5, y, lt + 6, y + 16], 1, S[1]);
  box(g, lt - 12, TTH - 176, 26, 3, S[3]); for (const hx of [lt - 11, lt + 4]) { box(g, hx, TTH - 184, 8, 8, INK); box(g, hx + 1, TTH - 183, 6, 6, tod.lamps > 0.3 ? '#FFF0B0' : S[2]); }
  // ---- its name on a plank board high on the face (nothing over it)
  box(g, 128, 112, 92, 17, INK); box(g, 129, 113, 90, 15, P[3]); box(g, 129, 113, 90, 1, P[4]); box(g, 129, 127, 90, 1, P[1]);
  for (const px of [136, 210]) box(g, px, 129, 3, 14, P[1]);
  signText(g, 'TIMBER TUMBLE', 174, 125, { sx: 1, sy: 1, fill: t('#3A1A08') });
  mist(g, TTW, TTH - 70, 70, skyAt(0.92, tod), 0, 0.3, 4);
};
/** A log up the lift, along the ledge and down the drop, then the splash coming up white. */
const liveTumble = (c: Ctx, x0: number, top: number, f: number, t: T) => {
  const P = 720, k = (f % P) / P;
  const seg = (s: [number, number, number, number], u: number, curve = false): [number, number, number] => [s[0] + (s[2] - s[0]) * u, s[1] + (s[3] - s[1]) * (curve ? u * u : u), Math.atan2((s[3] - s[1]) * (curve ? 2 * Math.max(0.05, u) : 1), s[2] - s[0])];
  const at = k < 0.6 ? seg(LIFT, k / 0.6) : k < 0.78 ? seg(LEDGE, (k - 0.6) / 0.18) : k < 0.86 ? seg(DROP, (k - 0.78) / 0.08, true) : null;
  if (at) {
    const [x, y, a] = at;
    c.save(); c.translate(x0 + x, top + y - 3); c.rotate(a);
    box(c, -7, -4, 14, 5, INK); box(c, -6, -3, 12, 3, t('#7A4A24')); box(c, -6, -3, 12, 1, t('#A06A38')); box(c, 4, -3, 2, 3, t('#C8A070'));
    for (const rx of [-3, 1]) { box(c, rx, -7, 2, 3, t('#E8B890')); }
    c.restore();
  } else {
    // (the splash: white water thrown up over the pool, falling back)
    const u = (k - 0.86) / 0.14, Wt = [t('#9CCCE8'), t('#E4F2FA'), t('#FFFFFF')];
    for (let i = 0; i < 10; i++) {
      const a = Math.PI * (0.15 + (i / 9) * 0.7), r = 6 + u * 30, px = x0 + POOL - 26 + Math.cos(a) * r * 0.9, py = top + TTH - 22 - Math.sin(a) * r * (1.2 - u) + u * u * 14;
      if (u > 0.8 && i % 2) continue;
      pixelBlob(c, px, py, 3 + (1 - u) * 2, 2.5, Wt[i % 3]);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The neighbors: Spooky Land, Future Land

const SPW = 220, SPH = 244, CRAG_UP = 56;
const paintSpooky = (g: Ctx, tod: TimeOfDay) => {
  const t = farCol(tod, 0.5), glow = tod.lamps > 0.3;
  const S = rampT(t, '#766A8C'), P = rampT(t, '#561A8A'), Rd = t('#B91C1C'), win = glow ? t('#C04A28') : S[0];
  // (its crag under it: dark rock in steps, dead trees along the top)
  const C = rampT(t, '#3A3046');
  poly(g, [[0, SPH], [20, SPH - 96], [60, SPH - 108], [120, SPH - 114], [170, SPH - 102], [220, SPH - 86], [220, SPH]], C[1]);
  for (let y = SPH - 100; y < SPH; y += 12) box(g, 10, y, 200, 1, C[(y >> 2) % 2 ? 0 : 2]);
  poly(g, [[20, SPH - 96], [60, SPH - 108], [70, SPH - 60], [30, SPH - 40]], C[2]);
  for (let i = 0; i < 12; i++) { const x = 14 + i * 17, y = SPH - 102 - hash(i) * 8; line(g, [x, y, x, y - 8, x - 3, y - 11], 1, rampT(t, '#2A2238')[1]); line(g, [x, y - 6, x + 3, y - 9], 1, rampT(t, '#2A2238')[1]); }
  g.save(); g.translate(0, -CRAG_UP);
  // (the keep: coursed stone, battlements, the purple spike and its red flag)
  const kx = 92, kw = 30, kt = SPH - 128, base = SPH - 54;
  box(g, kx - 1, kt - 1, kw + 2, base - kt + 1, INK);
  for (let y = kt, r = 0; y < base; y += 4, r++) for (let x = kx + (r % 2) * 3; x < kx + kw; x += 6) { box(g, x, y, Math.min(5, kx + kw - x), 3, S[hash(x + y) > 0.6 ? 3 : 2]); box(g, x, y, Math.min(5, kx + kw - x), 1, S[3]); }
  box(g, kx, kt, 3, base - kt, S[4]); box(g, kx + kw - 4, kt, 4, base - kt, S[1]);
  for (const lx of [kx + 8, kx + 19]) { box(g, lx, kt + 12, 4, 10, INK); box(g, lx + 1, kt + 13, 2, 8, win); }
  poly(g, [[kx - 4, kt], [kx + kw / 2, kt - 44], [kx + kw + 4, kt]], INK); poly(g, [[kx - 2, kt - 1], [kx + kw / 2, kt - 41], [kx + kw + 2, kt - 1]], P[2]); poly(g, [[kx - 2, kt - 1], [kx + kw / 2, kt - 41], [kx + kw * 0.25, kt - 1]], P[3]);
  box(g, kx + kw / 2 - 1, kt - 56, 2, 14, INK); poly(g, [[kx + kw / 2 + 1, kt - 56], [kx + kw / 2 + 12, kt - 53], [kx + kw / 2 + 1, kt - 49]], Rd);
  // (the curtain wall, battlements, the round towers' snuffer roofs)
  const wl = 50, wr = 150, wt = SPH - 82;
  box(g, wl - 1, wt - 1, wr - wl + 2, base - wt + 1, INK);
  for (let y = wt, r = 0; y < base; y += 5, r++) for (let x = wl + (r % 2 ? -4 : 0); x < wr; x += 9) { const a = Math.max(wl, x), b = Math.min(wr, x + 9); box(g, a, y, b - a - 1, 4, S[hash(x * 0.3 + y) > 0.7 ? 3 : 2]); box(g, a, y, b - a - 1, 1, S[3]); }
  for (let x = wl; x < wr; x += 10) { box(g, x, wt - 6, 6, 6, INK); box(g, x + 1, wt - 5, 4, 5, S[3]); }
  for (const wx of [wl + 18, wl + 66, wl + 82]) { box(g, wx, wt + 10, 4, 9, INK); box(g, wx + 1, wt + 11, 2, 7, win); }
  for (const [tx, th] of [[wl - 4, 62], [wr + 4, 70]] as const) {
    const tw = 18, tt = base - th;
    box(g, tx - tw / 2 - 1, tt - 1, tw + 2, th + 1, INK); for (let u = 0; u < tw; u += 2) box(g, tx - tw / 2 + u, tt, 2, th, S[u < 4 ? 4 : u < 10 ? 3 : u < 14 ? 2 : 1]);
    box(g, tx - 1, tt + 14, 3, 7, win);
    poly(g, [[tx - tw / 2 - 4, tt + 1], [tx, tt - 30], [tx + tw / 2 + 4, tt + 1]], INK); poly(g, [[tx - tw / 2 - 2, tt], [tx, tt - 28], [tx + tw / 2 + 2, tt]], P[2]); poly(g, [[tx - tw / 2 - 2, tt], [tx, tt - 28], [tx - 2, tt]], P[4]);
  }
  // (the clock tower by it: tall, the clock face lit after dark, its spire)
  const cx = 196, ct = SPH - 150;
  box(g, cx - 9, ct - 1, 18, SPH - 30 - ct + 1, INK); for (let u = 0; u < 16; u += 2) box(g, cx - 8 + u, ct, 2, SPH - 30 - ct, S[u < 4 ? 4 : u < 8 ? 3 : u < 12 ? 2 : 1]);
  g.fillStyle = INK; g.beginPath(); g.arc(cx, ct + 18, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = glow ? t('#F2D27A') : t('#E8E0C8'); g.beginPath(); g.arc(cx, ct + 18, 5.5, 0, Math.PI * 2); g.fill();
  line(g, [cx, ct + 18, cx, ct + 14], 1, INK); line(g, [cx, ct + 18, cx + 3, ct + 19], 1, INK);
  poly(g, [[cx - 12, ct + 1], [cx, ct - 30], [cx + 12, ct + 1]], INK); poly(g, [[cx - 10, ct], [cx, ct - 28], [cx + 10, ct]], P[1]); poly(g, [[cx - 10, ct], [cx, ct - 28], [cx - 2, ct]], P[3]);
  g.restore();
  mist(g, SPW, SPH - 90, 90, skyAt(0.92, tod), 0.1, 0.5, 4);
};
const FTW = 200, FTH = 290;
const paintFuture = (g: Ctx, tod: TimeOfDay) => {
  const t = farCol(tod, 0.5), glow = tod.lamps > 0.3;
  const Wh = rampT(t, '#D8DCE4'), Or = rampT(t, '#E8742A'), Tl = rampT(t, '#3AA8A8'), St = rampT(t, '#7A808C');
  // (the needle: three legs tapering up, waisted, to the saucer and its halo, the spire, the beacon)
  const nx = 70, sy = 46;
  for (const [a, b] of [[-14, -3], [14, 3], [-2, 0]] as const) poly(g, [[nx + a - 2, FTH], [nx + a + 2, FTH], [nx + b + 2, sy + 10], [nx + b - 2, sy + 10]], a ? Wh[2] : Wh[1]);
  line(g, [nx - 13, FTH - 4, nx - 3, sy + 12], 1, Wh[4]);
  box(g, nx - 7, sy + 60, 14, 3, Wh[1]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(nx, sy + 4, 28, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Or[2]; g.beginPath(); g.ellipse(nx, sy + 4, 27, 8, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Or[3]; g.beginPath(); g.ellipse(nx - 4, sy + 2, 20, 4, 0, 0, Math.PI * 2); g.fill();
  box(g, nx - 22, sy + 6, 44, 2, glow ? '#FFE7A0' : t('#3A4A60'));
  g.fillStyle = Wh[2]; g.beginPath(); g.ellipse(nx, sy - 2, 12, 6, 0, Math.PI, 0); g.fill();
  box(g, nx - 1, sy - 30, 2, 26, St[2]); box(g, nx - 1, sy - 34, 2, 4, glow ? '#FF6B6B' : Or[2]);
  // (the giant atom: a ball, three orbit rings round it)
  const ax = 140, ay = 150;
  g.fillStyle = INK; g.beginPath(); g.arc(ax, ay, 12, 0, Math.PI * 2); g.fill(); g.fillStyle = Tl[2]; g.beginPath(); g.arc(ax, ay, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = Tl[4]; g.beginPath(); g.arc(ax - 4, ay - 4, 4, 0, Math.PI * 2); g.fill();
  for (const r of [0, 1.05, -1.05]) { g.strokeStyle = St[3]; g.lineWidth = 2; g.beginPath(); g.ellipse(ax, ay, 30, 9, r, 0, Math.PI * 2); g.stroke(); }
  line(g, [ax, ay + 12, ax - 8, FTH, ax + 8, FTH], 2, St[2]); box(g, ax - 1, ay + 12, 2, FTH - ay - 12, St[1]);
  // (a rocket on its gantry: fins, its band, the nose)
  const rx = 178, rb = FTH - 6;
  box(g, rx + 9, rb - 92, 2, 92, St[1]); for (let y = rb - 88; y < rb; y += 10) line(g, [rx + 9, y, rx + 15, y + 10], 1, St[1]);
  box(g, rx - 5, rb - 66, 10, 60, INK); box(g, rx - 4, rb - 65, 8, 59, Wh[2]); box(g, rx - 4, rb - 65, 2, 59, Wh[4]); box(g, rx - 4, rb - 40, 8, 6, Or[2]);
  poly(g, [[rx - 5, rb - 66], [rx, rb - 84], [rx + 5, rb - 66]], Or[2]); poly(g, [[rx - 5, rb - 16], [rx - 11, rb], [rx - 5, rb - 6]], Or[1]); poly(g, [[rx + 5, rb - 16], [rx + 11, rb], [rx + 5, rb - 6]], Or[1]);
  // (a dome and the low, swoopy roofs at its feet)
  g.fillStyle = INK; g.beginPath(); g.arc(30, FTH, 24, Math.PI, 0); g.fill(); g.fillStyle = Wh[1]; g.beginPath(); g.arc(30, FTH, 23, Math.PI, 0); g.fill(); g.fillStyle = Wh[3]; g.beginPath(); g.arc(24, FTH - 4, 12, Math.PI, Math.PI * 1.6); g.fill();
  poly(g, [[90, FTH], [100, FTH - 14], [130, FTH - 22], [118, FTH - 12], [120, FTH]], Tl[1]);
  mist(g, FTW, FTH - 80, 80, skyAt(0.92, tod), 0.1, 0.5, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// Where they are, drawn

interface Tease { id: string; lx: number; par: number; w: number; h: number; layer: 'far' | 'near'; sink: number; paint: (g: Ctx, tod: TimeOfDay) => void; back?: (g: Ctx, tod: TimeOfDay) => void; live?: (c: Ctx, x0: number, top: number, f: number, t: T) => void; hide?: [number, number] }
const TEASES: Tease[] = [
  { id: 'future', lx: -16000, par: 0.008, w: FTW, h: FTH, layer: 'far', sink: 40, paint: paintFuture },
  { id: 'spooky', lx: 84000, par: 0.008, w: SPW, h: SPH, layer: 'far', sink: 36, paint: paintSpooky },
  { id: 'trestle', lx: 29000, par: 0.016, w: TRW, h: TRH, layer: 'near', sink: 26, paint: paintTrestle },
  { id: 'gulch', lx: 46500, par: 0.02, w: GW, h: GH, layer: 'near', sink: 24, paint: paintGulch, live: liveGulch, hide: [38800, 55800] },
  { id: 'tumble', lx: 61000, par: 0.02, w: TTW, h: TTH, layer: 'near', sink: 24, paint: paintTumble(false), back: paintTumble(true), live: liveTumble, hide: [55800, 66500] },
];

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');

/**
 * The teases on screen (screen space): `prog` how far along the land's map the view's middle is (world x - FRX),
 * `foot` the screen row their feet stand on (the far layers' ground line), `layer` which: the neighbors (drawn behind
 * the park's painted flats) or the attractions (in front of them, behind the pines). `outside`: seen from out past the
 * park's fence (Timber Tumble's back shows). `train`: Tucker's train may cross the trestle (not while he's on it).
 */
export const drawTeases = (c: Ctx, prog: number, foot: number, f: number, layer: 'far' | 'near', opts: { outside?: boolean; train?: boolean } = {}) => {
  const tod = timeOfDay();
  for (const s of TEASES) {
    if (s.layer !== layer || (s.hide && prog >= s.hide[0] && prog < s.hide[1])) continue;
    const cx = W / 2 + (s.lx - prog) * s.par, x0 = Math.round(cx - s.w / 2);
    if (x0 > W || x0 + s.w < 0) continue;
    const top = Math.round(foot + s.sink - s.h), back = opts.outside && s.back;
    const k = s.id === 'tumble' ? (back ? 0.46 : 0.28) : s.id === 'gulch' ? 0.3 : s.id === 'trestle' ? 0.26 : 0.5;
    c.save(); c.translate(x0, top);
    stamp(c, `fr-tease-${s.id}${back ? '-back' : ''}-${tod.key}-${fontIn()}`, 0, 0, s.w, s.h, g => (back ? s.back! : s.paint)(g, tod));
    c.restore();
    const t = farCol(tod, k);
    if (s.live && !back) s.live(c, x0, top, f, t);
    if (s.id === 'trestle' && opts.train !== false) { const P = 1500, u = (f % P) / 520; if (u <= 1) trainOn(c, x0, top, u, f, t); }
  }
};
