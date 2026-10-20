// Jungle Land's own set pieces seen far off from its other sections (painted into the backdrops' hourly stamps), each
// to the look it has up close now:
//   THE TEMPLE OF THE JAGUAR: the stepped pyramid in the roof's sandy stone (roof/stone.ts's ramp: block courses, a lit
//     cornice on each tier, carved glyph panels, moss along the foot, vines), the stair up its front, the entrance's
//     fanged mouth at its foot, and behind it the show building it's the front of (the stucco box, a rooftop unit, the
//     giant jaguar head on top from behind: raw fiberglass on its lumber frame), as the walk-away has it.
//   PRE-HYSTERIC PARK: the water tower (the dino backdrop's: banded tank, bracing, catwalk, the land's green band, a red
//     light after dark), the T. rex paddock's steel fence (bars, concrete pillars, its log gate post with the sign board
//     and the torch on top, the yellow warning plates), the monorail's beam on its T-head pillars and its cars (white,
//     the orange stripe), drawn live going by.
//   THE JUNGLE CRUISE: the queue house's long thatched roof on its bamboo posts, the boathouse's two tiers, the lookout
//     on its stilts with its striped pennant, a launch at the dock (its green-and-white canopy).
// Every one takes `T` (a color into the layer's haze and the hour's light) and paints on whole pixels; nothing on any
// of it is lit along a top like a ledge would be (none of it's to stand on). No volcanoes.

import { INK as INK0, box, checker, mix, hash, pixelBlob } from '../intro/art/kit';
import { STONE, MOSS } from './roof/stone';

type Ctx = CanvasRenderingContext2D;
type Tint = (col: string) => string;

const poly = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
/** A five-step ramp round a color, tinted. */
const rampT = (T: Tint, c: string) => [T(mix(c, '#1A1208', 0.5)), T(mix(c, '#1A1208', 0.26)), T(c), T(mix(c, '#F4E8D0', 0.24)), T(mix(c, '#FFFFFF', 0.45))];

// ---------------------------------------------------------------------------------------------------------------
// The Temple of the Jaguar

/**
 * The temple and its show building, the base tier's foot's middle at (x, foot), `w` its base's width (its height's
 * w * 0.42; the jaguar head on the box behind tops it). Torches lit by the entrance after dark (`lamps`).
 */
export const farTemple = (g: Ctx, x: number, foot: number, w: number, T: Tint, lamps: number) => {
  const u = w / 200, INK = T(INK0);
  const S = STONE.map(T), M = MOSS.map(T);
  const P = (n: number) => Math.round(n * u);
  const L = Math.round(x - w / 2);
  const B = (bx: number, by: number, bw: number, bh: number, col: string) => box(g, L + P(bx), Math.round(foot) - P(by), Math.max(1, P(bw)), Math.max(1, P(bh)), col);
  // The show building behind: the stucco box, its parapet, a rooftop unit; the jaguar head on it from behind
  const ST = rampT(T, '#8E8470'), GV = rampT(T, '#8E969D'), FB = rampT(T, '#86826A'), LB = rampT(T, '#8E6A3A'), LF = rampT(T, '#3E6A34');
  const BT = 112;
  B(28, BT + 1, 146, BT + 1, INK); B(29, BT, 144, BT, ST[2]);
  // (its stucco banded darker going down, the parapet's cap and its shadow, panel joints, the corner in shade)
  for (let k = 0; k < 4; k++) { B(29, BT - 24 - k * 22, 144, 22, ST[k < 2 ? 2 : 1]); checker(g, L + P(29), Math.round(foot) - P(BT - 22 - k * 22), P(144), 2, ST[1], k % 2); }
  B(29, BT, 144, 3, ST[3]); B(29, BT - 3, 144, 1, ST[0]);
  for (let k = 1; k < 6; k++) B(29 + k * 24, BT - 4, 1, BT - 4, ST[1]);
  B(164, BT, 9, BT, ST[1]); checker(g, L + P(160), Math.round(foot) - P(BT), 2, P(BT), ST[1]);
  // (louvered vents high up, a ladder up its side, the crew door's light)
  for (const vx of [44, 70]) { B(vx, BT - 12, 14, 8, ST[0]); for (let k = 0; k < 4; k++) B(vx + 1, BT - 13 - k * 2, 12, 1, ST[3]); }
  B(156, BT, 1, BT - 30, GV[1]); B(160, BT, 1, BT - 30, GV[1]); for (let y = BT - 2; y > 30; y -= 4) B(156, y, 5, 1, GV[2]);
  // (the theming: jungle climbing its corners so it's not a bare box)
  for (const [cx, hh] of [[34, 70], [168, 54]] as const) for (let k = 0; k < hh; k += 5) { const r = 4 + hash(cx + k) * 4; pixelBlob(g, L + P(cx + Math.sin(k * 0.3) * 3), Math.round(foot) - P(30 + k), r * u, r * 0.7 * u, LF[k % 10 ? 1 : 2]); }
  // (on its roof: a unit, an exhaust fan; the jaguar head)
  B(38, BT + 12, 28, 12, INK); B(39, BT + 11, 26, 11, GV[2]); for (let k = 0; k < 4; k++) B(41 + k * 6, BT + 9, 3, 7, GV[0]);
  B(80, BT + 6, 10, 6, GV[1]); B(78, BT + 8, 14, 3, GV[3]);
  {
    const hx = L + P(142), hy = Math.round(foot) - P(BT);
    poly(g, [[hx - P(24), hy], [hx - P(22), hy - P(15)], [hx - P(16), hy - P(20)], [hx - P(10), hy - P(13)], [hx, hy - P(17)], [hx + P(10), hy - P(13)], [hx + P(16), hy - P(20)], [hx + P(22), hy - P(15)], [hx + P(24), hy]], FB[1]);
    poly(g, [[hx - P(24), hy], [hx - P(22), hy - P(15)], [hx - P(16), hy - P(20)], [hx - P(12), hy - P(14)], [hx - P(14), hy]], FB[3]);
    box(g, hx - P(20), hy - P(10), P(40), 1, FB[0]);
    box(g, hx - P(12), hy - P(16), 1, P(16), LB[2]); box(g, hx + P(12), hy - P(16), 1, P(16), LB[2]); box(g, hx - P(18), hy - P(6), P(36), 1, LB[1]);
    if (lamps > 0.2) box(g, hx - 1, hy - P(22), 2, 2, '#FF5040');
  }
  // The tiers: four, each in courses of the sandy blocks (lit top and left), a cornice along the top, moss low
  const tiers = 4, th = 21, inset = 26;
  for (let i = 0; i < tiers; i++) {
    const tl = i * inset, tw = 200 - i * inset * 2, ty = (i + 1) * th;
    B(tl - 1, ty + 1, tw + 2, th + 1, INK);
    B(tl, ty, tw, th, S[3]);
    for (let r = 0; r < 3; r++) {
      const cy = ty - 4 - r * 6;
      B(tl, cy + 1, tw, 1, S[1]);
      for (let jx = tl + ((r + i) % 2) * 5 + 3; jx < tl + tw - 2; jx += 10) { B(jx, cy + 6, 1, 5, S[1]); B(jx + 1, cy + 6, 1, 1, S[5]); }
    }
    B(tl, ty, 3, th, S[4]); B(tl, ty, 1, th, S[5]); B(tl + tw - 6, ty, 6, th, S[2]); checker(g, L + P(tl + tw - 8), Math.round(foot) - P(ty), 2, P(th), S[2]);
    // (the cornice: a cap, its shadow under)
    B(tl, ty, tw, 3, S[5]); B(tl, ty - 3, tw, 1, S[1]);
    // (glyph panels along the upper tiers)
    if (i >= 1) for (let gx = tl + 14; gx < tl + tw - 14; gx += 26) { if (Math.abs(gx + 4 - 100) < 18) continue; B(gx, ty - 6, 9, 8, S[2]); B(gx + 2, ty - 8, 2, 2, S[0]); B(gx + 5, ty - 8, 2, 2, S[0]); B(gx + 3, ty - 11, 3, 1, S[0]); }
    // (moss along the foot of each, dripping)
    for (let mx = tl + 2; mx < tl + tw - 3; mx += 4) if (hash(mx * 0.7 + i * 13) > 0.5) { B(mx, ty - th + 3, 3, 2 + (hash(mx + i) > 0.7 ? 2 : 0), M[1]); }
    // (vines off its edge)
    for (let k = 0; k < 3; k++) { const vx = tl + 10 + hash(i * 5 + k) * (tw - 20), len = 6 + hash(i + k * 3) * 12; for (let d = 0; d < len; d += 2) B(vx + (d % 4 ? 1 : 0), ty - 3 - d, 1, 2, d % 6 ? M[2] : M[3]); }
  }
  // The stair up the front: treads in shade, their lips lit; the walls either side
  const sTop = tiers * th;
  B(86, sTop, 28, sTop, S[2]);
  for (let y = sTop; y > 0; y -= 3) { B(87, y, 26, 1, S[4]); B(87, y - 1, 26, 2, S[1]); }
  B(85, sTop, 1, sTop, INK); B(114, sTop, 1, sTop, INK);
  // (the shrine on top: a doorway, dark; a roof comb over it)
  B(84, sTop + 16, 32, 16, INK); B(85, sTop + 15, 30, 15, S[3]); B(85, sTop + 15, 3, 15, S[5]); B(110, sTop + 15, 5, 15, S[2]);
  B(94, sTop + 11, 12, 11, '#140C08'); B(83, sTop + 18, 34, 3, S[4]); B(83, sTop + 15, 34, 1, S[1]);
  // The entrance in the foot, right of the stair: the jaguar's mouth, fangs along the lintel, torches either side
  B(146, 18, 22, 18, S[2]); B(149, 14, 16, 14, '#140C08');
  for (let k = 0; k < 4; k++) B(150 + k * 4, 14, 2, 2 + (k % 2), T('#EDE6D2'));
  for (const tx of [143, 170]) { B(tx, 16, 1, 10, T('#5A3A1E')); B(tx - 1, 19, 3, 3, lamps > 0.25 ? '#FFB040' : T('#C8641A')); }
};

// ---------------------------------------------------------------------------------------------------------------
// Pre-Hysteric Park

/** The park's water tower (the dino backdrop's), its legs' feet at (x, foot): ~100 px tall. */
export const farWaterTower = (g: Ctx, x: number, foot: number, T: Tint, lamps: number) => {
  const ST = ['#4E5862', '#6A747E', '#8A949E', '#AAB4BC', '#CCD4DA'].map(T);
  const wx = Math.round(x), wy = Math.round(foot);
  for (const lx of [-17, -7, 5, 15]) box(g, wx + lx, wy - 58, 2, 58, ST[lx < 0 ? 2 : 1]);
  for (let y = wy - 52; y < wy - 6; y += 16) {
    box(g, wx - 17, y, 34, 1, ST[1]);
    for (let k = 0; k < 16; k += 2) { box(g, wx - 15 + k * 0.6, y + k, 1, 2, ST[0]); box(g, wx + 13 - k * 0.6, y + k, 1, 2, ST[0]); }
  }
  const tankL = wx - 22, tankT = wy - 84, bands = [3, 4, 3, 2, 2, 2, 1, 1, 0];
  for (let k = 0; k < bands.length; k++) box(g, tankL + Math.round((k * 44) / bands.length), tankT, Math.ceil(44 / bands.length) + 1, 28, ST[bands[k]]);
  for (let k = 1; k < bands.length; k++) if (bands[k] !== bands[k - 1]) checker(g, tankL + Math.round((k * 44) / bands.length) - 2, tankT, 2, 28, ST[bands[k]]);
  box(g, tankL, tankT + 28, 44, 2, ST[0]);
  const GB = [T('#2A5A2A'), T('#3E7A3A'), T('#5A9A4A')];
  box(g, tankL, tankT + 10, 44, 8, GB[1]); box(g, tankL, tankT + 10, 8, 8, GB[2]); box(g, tankL + 32, tankT + 10, 12, 8, GB[0]);
  for (let k = 0; k < 9; k++) if (k !== 4) box(g, tankL + 4 + k * 4, tankT + 13, 2, 2, T('#F2E8C8'));
  box(g, tankL - 3, tankT + 30, 50, 2, ST[1]); for (let k = 0; k <= 50; k += 5) box(g, tankL - 3 + k, tankT + 24, 1, 6, ST[0]); box(g, tankL - 3, tankT + 24, 50, 1, ST[0]);
  const roof = [ST[4], ST[3], ST[2], ST[1]];
  for (let k = 0; k < 4; k++) { const a = -24 + k * 12, b = a + 12; poly(g, [[wx + a, tankT], [wx + a * 0.12, tankT - 13], [wx + b * 0.12, tankT - 13], [wx + b, tankT]], roof[k]); }
  box(g, wx - 1, tankT - 18, 2, 5, ST[0]);
  if (lamps > 0.1) { box(g, wx - 3, tankT - 22, 6, 6, mix(ST[2], '#FF3020', 0.35 * lamps)); box(g, wx - 1, tankT - 20, 2, 2, '#FF5040'); }
  else box(g, wx - 1, tankT - 20, 2, 2, T('#8A2A20'));
};

/** The T. rex paddock's fence along x0..x1 (its foot at `foot`, `h` tall): steel bars, concrete pillars, yellow
 *  warning plates; at `gate` the log post with the sign board on it and the torch on its top (lit after dark). */
export const farPaddock = (g: Ctx, x0: number, x1: number, foot: number, h: number, gate: number, T: Tint, lamps: number) => {
  const F = ['#3A4048', '#5A6068', '#7E848C', '#A2A8AE'].map(T), C = ['#6A6862', '#8A8880', '#AAA89E', '#C8C6BC'].map(T), INK = T(INK0);
  const top = Math.round(foot - h);
  box(g, x0, top, x1 - x0, 2, F[1]); box(g, x0, top + Math.round(h * 0.45), x1 - x0, 1, F[1]);
  for (let x = x0; x < x1; x += 3) box(g, x, top, 1, h, (x / 3) % 2 ? F[2] : F[1]);
  for (let x = x0 + 4; x < x1; x += 40) {
    box(g, x - 1, top - 4, 7, h + 4, INK); box(g, x, top - 3, 5, h + 3, C[2]); box(g, x, top - 3, 1, h + 3, C[3]); box(g, x + 4, top - 3, 1, h + 3, C[1]);
    if ((x - x0) % 80 < 40) { box(g, x + 8, top + 6, 9, 5, T('#E8C030')); box(g, x + 9, top + 7, 7, 1, T('#3A2A10')); box(g, x + 9, top + 9, 5, 1, T('#3A2A10')); }
  }
  // (the gate post: a log tower, the sign board on it, the torch)
  const L = rampT(T, '#7A5E40');
  const gx = Math.round(gate);
  box(g, gx - 5, top - 22, 11, h + 22, INK); box(g, gx - 4, top - 21, 9, h + 21, L[2]); box(g, gx - 4, top - 21, 2, h + 21, L[3]); box(g, gx + 3, top - 21, 2, h + 21, L[1]);
  for (let y = top - 16; y < foot; y += 6) box(g, gx - 4, y, 9, 1, L[1]);
  box(g, gx - 22, top - 16, 44, 11, INK); box(g, gx - 21, top - 15, 42, 9, L[2]); box(g, gx - 21, top - 15, 42, 1, L[3]);
  for (let k = 0; k < 7; k++) box(g, gx - 17 + k * 5, top - 12, 3, 2, T('#F2D890'));
  box(g, gx - 2, top - 27, 5, 5, L[0]);
  if (lamps > 0.15) { box(g, gx - 3, top - 34, 7, 7, mix(L[2], '#FF9A30', 0.4 * lamps)); box(g, gx - 1, top - 32, 3, 4, '#FFB040'); box(g, gx, top - 31, 1, 2, '#FFF0B0'); }
  else { box(g, gx - 1, top - 31, 3, 4, T('#E87A20')); box(g, gx, top - 33, 1, 2, T('#F8C040')); }
};

/** The monorail's beam along x0..x1 at `y` (its top), on T-head pillars every `every` down to `foot`. */
export const farMonorailBeam = (g: Ctx, x0: number, x1: number, y: number, foot: number, T: Tint, every = 150) => {
  const S = ['#4A525A', '#6A727A', '#8A929A', '#A4ACB4', '#C8D0D6'].map(T);
  for (let x = x0 + 30; x < x1; x += every) {
    box(g, x, y + 5, 5, foot - y - 5, S[2]); box(g, x, y + 5, 1, foot - y - 5, S[3]); box(g, x + 4, y + 5, 1, foot - y - 5, S[1]);
    box(g, x - 4, y + 5, 13, 3, S[1]); box(g, x - 4, y + 5, 13, 1, S[3]);
  }
  box(g, x0, y, x1 - x0, 5, S[3]); box(g, x0, y + 4, x1 - x0, 1, S[1]); box(g, x0, y + 5, x1 - x0, 1, S[0]);
  for (let x = x0; x < x1; x += 24) box(g, x, y + 1, 1, 3, S[2]);
};
/** The monorail going by on its beam (live, cheap): `n` cars, the nose at x, their skirts at y (the beam's top). */
export const drawMonorail = (c: Ctx, x: number, y: number, T: Tint, lamps: number, n = 3, dir = 1) => {
  const CAR = ['#8A8E92', '#B4B8BC', '#D8DCE0', '#F2F4F6'].map(T), stripe = T('#C2410C'), win = T('#2A3A4A');
  const lit = lamps > 0.2 ? mix(win, '#FFD890', 0.65 * Math.min(1, lamps * 1.3)) : mix(win, T('#8AB0D0'), 0.35);
  const cw = 34;
  for (let i = 0; i < n; i++) {
    const cx = Math.round(x - dir * (i + 1) * (cw + 2) + (dir < 0 ? 0 : 0));
    box(c, cx, y - 13, cw, 11, CAR[2]); box(c, cx + 1, y - 14, cw - 2, 1, CAR[3]); box(c, cx, y - 4, cw, 2, CAR[1]);
    box(c, cx, y - 6, cw, 2, stripe);
    for (let k = 0; k < 4; k++) box(c, cx + 3 + k * 8, y - 11, 5, 3, lit);
  }
  // (the nose: rounded, its windshield)
  const nx = dir > 0 ? Math.round(x - 2) : Math.round(x - (n + 1) * (cw + 2) + cw + 2 - 8);
  box(c, nx, y - 12, 8, 9, CAR[2]); box(c, nx + (dir > 0 ? 6 : 0), y - 9, 2, 6, CAR[2]); box(c, nx + (dir > 0 ? 1 : 3), y - 11, 4, 3, win);
  box(c, nx, y - 6, 8, 2, stripe);
};

// ---------------------------------------------------------------------------------------------------------------
// The Jungle Cruise

/** A thatched roof (eaves y, ridge top), banded straw lit up the left, its fringe. */
const thatch = (g: Ctx, x0: number, x1: number, y: number, top: number, P: string[]) => {
  const mx = (x0 + x1) / 2;
  poly(g, [[x0 - 1, y + 1], [mx, top - 1], [x1 + 1, y + 1]], mix(P[0], '#0A0604', 0.45));
  poly(g, [[x0, y], [mx, top], [x1, y]], P[2]);
  poly(g, [[x0, y], [mx, top], [mx - (x1 - x0) * 0.12, y]], P[3]);
  poly(g, [[mx + (x1 - x0) * 0.2, y], [mx, top], [x1, y]], P[1]);
  for (let k = 1; k < 4; k++) { const yy = Math.round(top + ((y - top) * k) / 4), hw = ((x1 - x0) / 2) * (k / 4); for (let x = Math.round(mx - hw); x < mx + hw; x += 3) box(g, x, yy, 2, 1, x < mx ? P[4] : P[0]); }
  for (let x = Math.round(x0); x < x1; x += 2) box(g, x, y, 1, 2 + ((x * 7) % 3), P[1]);
};

/** The Jungle Cruise far off, the boathouse's middle at (x, foot): the queue house's long thatch to its left (on its
 *  bamboo posts), the boathouse's two tiers, the lookout on its stilts (the pennant), a launch at the dock. ~150 tall. */
export const farCruise = (g: Ctx, x: number, foot: number, T: Tint, lamps: number) => {
  const TH = rampT(T, '#C0A060'), RF = rampT(T, '#A88A52'), BM = rampT(T, '#C9A64E'), W = rampT(T, '#7A5230'), INK = T(INK0);
  x = Math.round(x); foot = Math.round(foot);
  // The queue house: a long hipped thatch, low, on its posts; the crowd's heads under its eave
  const qa = x - 230, qb = x - 70;
  for (let px = qa + 6; px < qb; px += 16) { box(g, px, foot - 26, 2, 26, BM[2]); box(g, px, foot - 26, 1, 26, BM[3]); }
  for (let hx = qa + 4; hx < qb - 4; hx += 3) box(g, hx, foot - 10 - (hash(hx) > 0.5 ? 1 : 0), 2, 2, T(['#F0C8A2', '#6E4426', '#D9A877', '#A86B43', '#3A2A1A'][Math.floor(hash(hx * 1.3) * 5)]));
  poly(g, [[qa - 8, foot - 24], [qa + 20, foot - 52], [qb - 20, foot - 52], [qb + 8, foot - 24]], INK);
  poly(g, [[qa - 7, foot - 25], [qa + 20, foot - 51], [qb - 20, foot - 51], [qb + 7, foot - 25]], RF[2]);
  poly(g, [[qa - 7, foot - 25], [qa + 20, foot - 51], [qa + 26, foot - 51], [qa + 2, foot - 25]], RF[3]);
  for (let yy = foot - 47; yy < foot - 26; yy += 5) for (let xx = qa; xx < qb; xx += 3) if (hash(xx * 0.3 + yy) > 0.4) box(g, xx, yy, 2, 1, hash(xx + yy) > 0.6 ? RF[1] : RF[3]);
  for (let xx = qa - 6; xx < qb + 6; xx += 2) box(g, xx, foot - 25, 1, 2 + ((xx * 5) % 3), RF[1]);
  // The boathouse: two tiers of thatch on bamboo posts, the sign board on the ridge
  for (let k = -3; k <= 3; k++) { const px = x + k * 18; box(g, px - 1, foot - 46, 3, 46, INK); box(g, px, foot - 46, 2, 46, BM[2]); }
  thatch(g, x - 70, x + 70, foot - 44, foot - 66, TH);
  thatch(g, x - 42, x + 42, foot - 62, foot - 82, TH);
  box(g, x - 28, foot - 94, 56, 11, INK); box(g, x - 27, foot - 93, 54, 9, W[2]); box(g, x - 27, foot - 93, 54, 1, W[3]);
  for (let k = 0; k < 8; k++) box(g, x - 22 + k * 6, foot - 90, 4, 3, T('#FDE68A'));
  if (lamps > 0.3) for (const lx of [x - 60, x + 60]) { box(g, lx - 2, foot - 42, 4, 4, '#FFD27A'); }
  // (a launch at the dock under it: its striped canopy, the hull white over its red boot top)
  const bx = x - 30;
  for (let k = 0; k < 8; k++) box(g, bx + k * 7, foot - 22, 7, 4, k % 2 ? T('#F4F0E8') : T('#2E7A4A'));
  box(g, bx, foot - 18, 56, 1, INK); for (const sx of [bx + 2, bx + 52]) box(g, sx, foot - 18, 1, 8, T('#C8C0B0'));
  box(g, bx - 4, foot - 10, 64, 6, T('#E8E4DA')); box(g, bx - 4, foot - 10, 64, 1, T('#FFFFFF')); box(g, bx - 2, foot - 4, 60, 2, T('#B91C1C'));
  // The lookout on its stilts, right of it: the deck, the thatch cone, the striped pennant
  const lx = x + 104;
  for (const sx of [-9, -3, 3, 9]) { box(g, lx + sx - 1, foot - 70, 2, 70, INK); box(g, lx + sx, foot - 70, 1, 70, BM[sx < 0 ? 3 : 2]); }
  for (let y = foot - 64; y < foot - 10; y += 14) for (let k = 0; k < 14; k += 2) { box(g, lx - 9 + k * 1.3, y + k, 1, 2, BM[1]); box(g, lx + 9 - k * 1.3, y + k, 1, 2, BM[1]); }
  box(g, lx - 14, foot - 73, 28, 4, INK); box(g, lx - 13, foot - 72, 26, 2, W[2]);
  for (let k = lx - 12; k <= lx + 12; k += 4) box(g, k, foot - 80, 1, 7, W[1]);
  thatch(g, lx - 17, lx + 17, foot - 80, foot - 100, TH);
  box(g, lx, foot - 112, 1, 12, T('#3A2A1A'));
  for (let k = 0; k < 3; k++) poly(g, [[lx + 1, foot - 112 + k * 2], [lx + 13 - k * 2, foot - 109 + k], [lx + 1, foot - 106]], k % 2 ? T('#F4F0E8') : T('#D8402A'));
};

/** Birds wheeling (live): `n` of them round (cx, cy) over a span, flapping in two frames. */
export const drawBirds = (c: Ctx, f: number, cx: number, cy: number, span: number, n: number, col: string) => {
  for (let i = 0; i < n; i++) {
    const a = f * (0.006 + i * 0.0013) + i * 2.1;
    const bx = Math.round(cx + Math.cos(a) * span * (0.5 + 0.5 * hash(i)) ), by = Math.round(cy + Math.sin(a * 1.7) * 14 + i * 5);
    const flap = Math.floor((f + i * 7) / 9) % 2;
    box(c, bx - 4, by - flap * 2, 4, 1, col); box(c, bx, by, 1, 1, col); box(c, bx + 1, by - flap * 2, 4, 1, col);
  }
};

void pixelBlob;
