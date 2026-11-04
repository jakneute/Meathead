// The dragon cars from behind, at the classic ride's fidelity (dragon.ts: the same dragons, the same ramps, seen from
// the rear): a car's scaled hull end on (a rounded tub: its lit lip along the top, the scales in rows lit on their
// crowns, dithered seams, the gilt trim band and its studs, the belly's banded plates under it, shaded down to the
// keel), the bat wings folded along its sides (their fingers and the gilt claw at the wrist poking up past the hull),
// two gem tail lamps in gilt bezels (lit live), the steel chassis under it (the road wheels on the rails, the upstops,
// the side guides), the brass handrail posts up off its edges with their leather-wrapped ends (what his fists hold).
// The rear car: the tail curled off the back and up to one side, spined, its tip the dragon's own (a flame tuft, a
// crystal spade, a bolt). The front car: the neck rising off it, its crest of spines, the back of the skull, the cheek
// frills and the horns (FIRE's banded ivory, ICE's faceted crystal and its icicle beard, LIGHTNING's zigzag antlers
// tipped in gold), the eyes' glow at its sides. Each element's own: FIRE warm in its seams (embers and smoke live), ICE
// rimed with frost (icicles off its trim, its breath live), LIGHTNING with its copper coils (sparks live).
//
// Painted once per lane, car, haze step and light (out in the open or in the mountain) and hour, at twice the size,
// and put down scaled with the track (turned through a roll): one drawImage a car. What moves is drawn live over it.

import { mix, box, INK, GOLD, IRON, ramp6, polyF, checker, type Ctx } from '../../kit';
import { LOOKS } from '../dragon';
import type { Lane } from '../layout';
import { pic, placed, hazeOf } from './sprites';

/** The handrails' tops (his fists go there): out from the middle, up off the track. */
export const RAIL_X = 46, RAIL_Y = 58;
/** His car's floor (where his boots are), up from the track. */
export const FLOOR_Y = 22;
/** The hull's top (its lit lip), up off the track. */
const LIP = 40;

const BOX = { w: 172, h: 188, ox: 86, oy: 170 };

interface P { B: string[]; Bl: string[]; W: string[]; Hn: string[]; Cr: string[]; G: string[]; I: string[]; Lt: string[]; Cu: string[]; lip: string; lipHi: string; eye: string }
const palOf = (lane: Lane, step: number, cave: boolean): P => {
  const L = LOOKS[lane], H = (c: string) => hazeOf(c, step, cave), R = (c: string) => ramp6(c).map(H);
  return {
    B: R(L.body), Bl: R(L.belly), W: R(L.wing), Hn: R(L.horn), Cr: R(L.crest), G: GOLD.map(H), I: IRON.map(H), Lt: R('#6A3A22'), Cu: R('#C2662A'),
    lip: H(mix(L.belly, '#FFF6D8', 0.5)), lipHi: H('#FFFBEA'), eye: H(L.eye),
  };
};

const disc = (g: Ctx, x: number, y: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2); g.fill(); };
const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
/** A polygon with an ink line a pixel out all round. */
const inked = (g: Ctx, pts: [number, number][], col: string) => {
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  polyF(g, pts.map(([x, y]) => { const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1; return [x + (dx / l) * 1.3, y + (dy / l) * 1.3] as [number, number]; }), INK);
  polyF(g, pts, col);
};

// ---------------------------------------------------------------------------------------------------------------
// The parts

/** The chassis under the hull: the bogie, the road wheels on the rails (end on: tall and narrow), the upstops, the side
 *  guides, the axle. */
const chassis = (g: Ctx, P: P) => {
  const I = P.I;
  box(g, -44, -8, 88, 9, INK); box(g, -43, -7, 86, 7, I[2]); box(g, -43, -7, 86, 1, I[4]); box(g, -43, -1, 86, 1, I[0]);
  for (let x = -38; x < 40; x += 9) box(g, x, -4, 2, 2, I[5]);
  for (const s of [-1, 1]) {
    const wx = s * 36;
    // (the road wheel on the rail, end on; the upstop under the rail's head; the side guide out past it)
    ell(g, wx, -3, 5.4, 8, INK); ell(g, wx, -3, 4.2, 6.8, I[3]); ell(g, wx - 1, -5, 2, 4, I[4]); box(g, wx - 1, -9, 2, 1, I[5]);
    ell(g, wx, 9, 4.2, 4.2, INK); ell(g, wx, 9, 3, 3, I[2]); box(g, wx - 1, 7, 2, 1, I[4]);
    box(g, wx - 2, 1, 4, 6, INK); box(g, wx - 1, 1, 2, 6, I[1]);
    ell(g, wx + s * 9, 2, 3, 4.4, INK); ell(g, wx + s * 9, 2, 2, 3.4, I[3]);
  }
};

/** A bat wing folded along a side, seen end on: the fingers raking up past the hull's edge, the membrane between them
 *  scalloped, the wrist's gilt claw at the top. */
const foldedWing = (g: Ctx, P: P, s: number) => {
  const W = P.W, x0 = s * 54;
  const mem: [number, number][] = [[x0, -10], [x0 + s * 14, -16], [x0 + s * 20, -30], [x0 + s * 16, -34], [x0 + s * 22, -46], [x0 + s * 12, -44], [x0 + s * 10, -54], [x0 + s * 2, -42], [x0 - s * 2, -36]];
  inked(g, mem, W[2]);
  polyF(g, [[x0 + s * 2, -40], [x0 + s * 10, -52], [x0 + s * 12, -44], [x0 + s * 8, -36]], W[3]);
  polyF(g, [[x0 + s * 14, -18], [x0 + s * 20, -30], [x0 + s * 14, -28]], W[1]);
  checker(g, Math.min(x0, x0 + s * 14), -20, 14, 2, W[1], 0, 1);
  // (the finger bones)
  g.lineCap = 'round';
  for (const [tx, ty] of [[x0 + s * 22, -46], [x0 + s * 20, -30], [x0 + s * 14, -16]] as const) {
    g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x0 + s * 8, -48); g.lineTo(tx, ty); g.stroke();
    g.strokeStyle = P.B[4]; g.lineWidth = 1.1; g.stroke();
  }
  g.lineCap = 'butt';
  // (the wrist, its gilt claw up)
  disc(g, x0 + s * 8, -48, 3.4, INK); disc(g, x0 + s * 8, -48, 2.4, P.B[3]); disc(g, x0 + s * 7, -49, 1, P.B[5]);
  polyF(g, [[x0 + s * 7, -50], [x0 + s * 11, -60], [x0 + s * 10, -50]], P.G[3]); box(g, x0 + s * 9, -57, 1, 2, P.G[5]);
};

/** The hull end on: a rounded tub, its lit lip, the scales, the trim, the belly plates, the tail lamps' bezels. */
const hull = (g: Ctx, P: P, lane: Lane) => {
  const B = P.B, Bl = P.Bl, G = P.G;
  const tub: [number, number][] = [[-58, -LIP], [58, -LIP], [60, -34], [58, -20], [52, -8], [40, -1], [-40, -1], [-52, -8], [-58, -20], [-60, -34]];
  inked(g, tub, B[3]);
  // (lit along the top and down the left, shaded down the right and toward the keel, the seams dithered)
  box(g, -58, -39, 116, 6, B[4]); checker(g, -58, -33, 116, 2, B[4], 0, 1);
  polyF(g, [[-60, -34], [-58, -20], [-52, -8], [-48, -8], [-54, -20], [-56, -34]], B[4]);
  polyF(g, [[60, -34], [58, -20], [52, -8], [46, -8], [53, -20], [55, -34]], B[2]);
  polyF(g, [[-50, -9], [50, -9], [40, -1], [-40, -1]], B[1]);
  checker(g, -48, -11, 96, 2, B[1], 0, 1);
  // (the scales: rows of little cups, offset row to row, each lit on its crown)
  for (let r = 0; r < 3; r++) {
    const y = -33 + r * 5;
    for (let x = -55 + (r % 2) * 4; x < 54; x += 8) { box(g, x, y + 3, 5, 1, B[1]); box(g, x + 5, y, 1, 4, B[2]); box(g, x + 1, y, 2, 1, B[5]); box(g, x, y + 1, 1, 2, B[4]); }
  }
  // (the gilt trim band, its studs)
  box(g, -59, -20, 118, 5, INK); box(g, -58, -19, 116, 3, G[3]); box(g, -58, -19, 116, 1, G[5]); box(g, -58, -17, 116, 1, G[1]);
  for (let x = -54; x < 56; x += 12) box(g, x, -18, 2, 2, G[1]);
  // (the belly: banded plates, their seams)
  polyF(g, [[-56, -15], [56, -15], [52, -9], [-52, -9]], Bl[3]);
  box(g, -56, -15, 112, 1, Bl[4]); for (let x = -50; x < 52; x += 8) box(g, x, -14, 1, 5, Bl[1]);
  // (the tail lamps' gilt bezels (the gems are live), the lip's top)
  for (const s of [-1, 1]) { const x = s * 32; box(g, x - 6, -15, 12, 9, INK); box(g, x - 5, -14, 10, 7, G[2]); box(g, x - 5, -14, 10, 1, G[4]); box(g, x - 4, -13, 8, 5, INK); }
  // (the lit lip (warm: the top he stands in), its rivets)
  box(g, -58, -LIP - 2, 116, 4, INK); box(g, -57, -LIP - 1, 114, 2, P.lip); box(g, -57, -LIP - 1, 114, 1, P.lipHi);
  for (let x = -52; x < 54; x += 11) box(g, x, -LIP + 2, 2, 1, B[1]);
  // (the element's own)
  if (lane === 2) {
    // (frost rimed along the lip and the trim; icicles hung off the trim)
    for (let x = -56; x < 56; x += 3) { box(g, x, -LIP + 1 + ((x * 7) & 1), 2, 1, mix(P.lipHi, '#E0F7FF', 0.5)); if (((x * 13) & 7) < 3) box(g, x, -16, 1, 1, '#F0FAFF'); }
    for (let k = 0; k < 9; k++) { const x = -48 + k * 12 + (k % 2) * 3, l = 4 + ((k * 5) % 4); polyF(g, [[x - 2, -15], [x + 2, -15], [x, -15 + l]], P.Hn[4]); box(g, x - 1, -15, 1, l - 2, P.Hn[5]); }
  } else if (lane === 1) {
    // (the seams between the scales glowing like coals)
    for (let r = 0; r < 3; r++) for (let x = -51 + (r % 2) * 4; x < 52; x += 16) box(g, x, -30 + r * 5, 3, 1, mix(P.Bl[4], '#FDE047', 0.4));
  } else {
    // (the copper coils, either side of the middle: wound bands, a brass ball up off each)
    for (const s of [-1, 1]) {
      const x = s * 14;
      box(g, x - 5, -36, 10, 20, INK);
      for (let k = 0; k < 9; k++) { box(g, x - 4, -35 + k * 2, 8, 1, P.Cu[k % 2 ? 2 : 4]); box(g, x - 4, -34 + k * 2, 8, 1, P.Cu[1]); }
      box(g, x - 4, -35, 2, 18, P.Cu[5]);
      box(g, x - 1, -44, 2, 8, INK); disc(g, x, -46, 3.4, INK); disc(g, x, -46, 2.4, G[3]); box(g, x - 1, -47, 1, 1, G[5]);
    }
  }
};

/** The handrail posts up off the hull's edges, their bars end on (a leather-wrapped end and a brass ball): thin and
 *  dimmed (to hold, not to stand on). */
const rails = (g: Ctx, P: P) => {
  const G = P.G.map(c => mix(c, '#2A1E3A', 0.2)), L = P.Lt;
  for (const s of [-1, 1]) {
    const x = s * RAIL_X;
    box(g, x - 3, -RAIL_Y, 6, RAIL_Y - LIP + 2, INK); box(g, x - 2, -RAIL_Y, 4, RAIL_Y - LIP + 1, G[3]); box(g, x - 2, -RAIL_Y, 1, RAIL_Y - LIP + 1, G[5]); box(g, x + 1, -RAIL_Y, 1, RAIL_Y - LIP + 1, G[1]);
    box(g, x - 4, -LIP - 2, 8, 3, INK); box(g, x - 3, -LIP - 2, 6, 1, G[2]);
    disc(g, x, -RAIL_Y, 6, INK); disc(g, x, -RAIL_Y, 4.8, L[2]); disc(g, x - 1, -RAIL_Y - 1, 2.6, L[4]);
    for (let k = 0; k < 3; k++) box(g, x - 3 + k * 2, -RAIL_Y - 3 + k * 2, 1, 1, L[5]);
    disc(g, x, -RAIL_Y, 1.6, G[4]);
  }
};

/** The tail: off the back's middle, out and curled up to one side (clear of his legs), tapering, spined; its tip. */
const TAIL = (t: number): [number, number] => { const a = 1 - t; return [a * a * 4 + 2 * a * t * 58 + t * t * 40, a * a * -12 + 2 * a * t * 8 + t * t * -56]; };
export const tail = (g: Ctx, P: P, lane: Lane) => {
  const B = P.B, Bl = P.Bl, n = 16;
  for (let k = n; k >= 0; k--) { const u = k / n, [x, y] = TAIL(u), r = 8 * (1 - u) + 2.6; disc(g, x, y, r + 1.3, INK); }
  for (let k = n; k >= 0; k--) {
    const u = k / n, [x, y] = TAIL(u), r = 8 * (1 - u) + 2.6;
    disc(g, x, y, r, B[3]); disc(g, x - r * 0.28, y - r * 0.3, r * 0.6, B[4]); disc(g, x + r * 0.32, y + r * 0.34, r * 0.42, Bl[3]);
    if (k % 3 === 1 && k < n - 1) { const [nx, ny] = TAIL(Math.min(1, u + 0.06)), a = Math.atan2(ny - y, nx - x); polyF(g, [[x + Math.sin(a) * r, y - Math.cos(a) * r], [x + Math.sin(a) * (r + 6) - Math.cos(a) * 3, y - Math.cos(a) * (r + 6) - Math.sin(a) * 3], [x + Math.sin(a) * r - Math.cos(a) * 5, y - Math.cos(a) * r - Math.sin(a) * 5]], P.Cr[3]); }
  }
  const [tx, ty] = TAIL(1);
  if (lane === 1) for (const [dx, dy, s, col] of [[0, -4, 9, P.Cr[2]], [-4, -10, 6, P.Cr[4]], [3, -12, 4, P.Bl[5]]] as const) polyF(g, [[tx - s, ty + 2], [tx + dx, ty + dy - s], [tx + s, ty + 2]], col);
  else if (lane === 2) { inked(g, [[tx, ty - 16], [tx + 8, ty - 4], [tx, ty + 4], [tx - 8, ty - 4]], P.Hn[3]); polyF(g, [[tx, ty - 16], [tx - 8, ty - 4], [tx, ty - 2]], P.Hn[5]); }
  else { inked(g, [[tx - 2, ty - 18], [tx + 7, ty - 18], [tx + 2, ty - 9], [tx + 8, ty - 9], [tx - 4, ty + 6], [tx, ty - 5], [tx - 6, ty - 5]], P.Cr[3]); box(g, tx, ty - 17, 4, 2, P.Cr[5]); }
};

/** The neck and the back of the head over the front car (the eyes' glow at the skull's sides: live). */
export const HEAD_Y = -116, EYE_X = 22;
const head = (g: Ctx, P: P, lane: Lane) => {
  const B = P.B, Hn = P.Hn, Cr = P.Cr;
  // (the neck: up off the hull, thick at its root, tapering and leaning a touch as it rises away, banded lit left to
  // shaded right, the scales across it in rows lit on their crowns, a fin of crest spines up its back)
  const neck: [number, number][] = [[-22, -LIP + 2], [22, -LIP + 2], [17, -62], [13, -84], [12, -102], [-12, -102], [-14, -84], [-18, -62]];
  inked(g, neck, B[3]);
  polyF(g, [[-22, -LIP + 2], [-10, -LIP + 2], [-7, -84], [-6, -102], [-12, -102], [-14, -84], [-18, -62]], B[4]);
  polyF(g, [[12, -LIP + 2], [22, -LIP + 2], [17, -62], [13, -84], [12, -102], [7, -102], [8, -84], [10, -62]], B[2]);
  checker(g, 6, -100, 3, 60, B[2], 0, 1);
  for (let y = -46; y > -100; y -= 6) { const hw = 20 - ((-y - 40) / 62) * 8; for (let x = -hw + 2; x < hw - 3; x += 7) { const o = ((y / 6) & 1) * 3; box(g, x + o, y, 4, 1, B[1]); box(g, x + o + 1, y - 2, 2, 1, B[5]); } }
  for (let k = 0; k < 6; k++) { const y = -46 - k * 10, h = 7 - k * 0.4; inked(g, [[-2.5, y + 3], [0, y - h], [2.5, y + 3]], Cr[k % 2 ? 2 : 4]); box(g, -1, y - h + 3, 1, h - 2, Cr[5]); }
  // (the skull from behind: its round, banded to the light; the jaw's hinges out each side)
  ell(g, 0, HEAD_Y, 27, 20, INK);
  ell(g, 0, HEAD_Y, 25.6, 18.6, B[2]);
  ell(g, -2, HEAD_Y - 1, 23, 16.6, B[3]);
  ell(g, -7, HEAD_Y - 6, 13, 8, B[4]);
  box(g, -12, HEAD_Y - 11, 6, 2, B[5]);
  checker(g, -20, HEAD_Y + 6, 40, 2, B[2], 0, 1);
  for (const s of [-1, 1]) {
    // (the cheek frill: three spines swept back off each side)
    for (let k = 0; k < 3; k++) inked(g, [[s * 20, HEAD_Y - 2 + k * 6], [s * (36 + k * 3), HEAD_Y - 8 + k * 9], [s * 22, HEAD_Y + 3 + k * 6]], Cr[2 + (k % 2)]);
    // (the eye's socket at the skull's edge: the glow's live)
    ell(g, s * EYE_X, HEAD_Y - 2, 4, 3, INK);
  }
  // (the horns, by dragon)
  if (lane === 1) {
    for (const s of [-1, 1]) {
      const pts: [number, number][] = [[s * 8, HEAD_Y - 14], [s * 26, HEAD_Y - 30], [s * 34, HEAD_Y - 52], [s * 28, HEAD_Y - 34], [s * 14, HEAD_Y - 10]];
      inked(g, pts, Hn[3]); polyF(g, [[s * 8, HEAD_Y - 14], [s * 26, HEAD_Y - 30], [s * 34, HEAD_Y - 52], [s * 22, HEAD_Y - 28]], s < 0 ? Hn[4] : Hn[2]);
      for (let k = 1; k < 4; k++) { const u = k / 4; box(g, s * (8 + 24 * u) - 2, HEAD_Y - 14 - 34 * u, 4, 1, Hn[1]); }
    }
  } else if (lane === 2) {
    for (const s of [-1, 1]) {
      for (const [bx, ex, ey] of [[8, 22, -56], [14, 32, -44]] as const) { inked(g, [[s * (bx - 4), HEAD_Y - 12], [s * ex, HEAD_Y + ey], [s * (bx + 4), HEAD_Y - 10]], Hn[3]); polyF(g, [[s * (bx - 4), HEAD_Y - 12], [s * ex, HEAD_Y + ey], [s * bx, HEAD_Y - 11]], s < 0 ? Hn[5] : Hn[4]); }
      // (the icicle beard, poking out past the jaw)
      for (let k = 0; k < 3; k++) { const x = s * (14 + k * 5), l = 8 + ((k * 7) % 4) * 2; inked(g, [[x - 2, HEAD_Y + 14], [x + 2, HEAD_Y + 14], [x, HEAD_Y + 14 + l]], Hn[3]); box(g, x, HEAD_Y + 14, 1, l - 3, Hn[5]); }
    }
    for (let x = -20; x < 20; x += 3) box(g, x, HEAD_Y - 17 + ((x * 5) & 1), 2, 1, '#F0FAFF');
  } else {
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const s of [-1, 1]) {
      const pts: [number, number][] = [[s * 10, HEAD_Y - 12], [s * 20, HEAD_Y - 22], [s * 16, HEAD_Y - 26], [s * 28, HEAD_Y - 38], [s * 22, HEAD_Y - 38], [s * 30, HEAD_Y - 54]];
      const line = () => { g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); };
      g.strokeStyle = INK; g.lineWidth = 7; line(); g.stroke();
      g.strokeStyle = Hn[3]; g.lineWidth = 4.4; line(); g.stroke();
      g.strokeStyle = Hn[5]; g.lineWidth = 1.2; line(); g.stroke();
      disc(g, pts[5][0], pts[5][1], 3, INK); disc(g, pts[5][0], pts[5][1], 2.2, P.G[4]);
    }
    g.lineCap = 'butt'; g.lineJoin = 'miter';
    for (let k = 0; k < 4; k++) inked(g, [[-9 + k * 6, HEAD_Y - 16], [-6 + k * 6, HEAD_Y - 27], [-3 + k * 6, HEAD_Y - 16]], Cr[3]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The pictures

/** A car from behind (0 the rear: his, its tail curled up; 1 the middle; 2 the front: its neck and head), at a haze
 *  step, in the open or the mountain. Its origin: the track's top under its middle. */
/** The sizes a car's painted at (it's put down at the one at or just over the size it's shown: crisp, no smoothing). */
const RB = [0.32, 0.42, 0.55, 0.72, 0.9, 1.1, 1.35, 1.7];
const resFor = (k: number) => { for (const r of RB) if (r >= k * 0.98) return r; return RB[RB.length - 1]; };
export const carBack = (lane: Lane, which: 0 | 1 | 2, step: number, cave: boolean, noTail = false, k = 1) => {
  const res = resFor(k);
  return placed(pic(`bcar${lane}${which}${step}${cave ? 1 : 0}${noTail ? 1 : 0}@${res}`, BOX.w, BOX.h, BOX.ox, BOX.oy, res, g => {
    const P = palOf(lane, step, cave);
    chassis(g, P);
    foldedWing(g, P, -1); foldedWing(g, P, 1);
    if (which === 2) head(g, P, lane);
    hull(g, P, lane);
    rails(g, P);
    if (which === 0 && !noTail) tail(g, P, lane);
  }), BOX.w, BOX.h, BOX.ox, BOX.oy);
};

/** His car's near wall (over his boots and shins): the hull end on again, and the tail over it. */
export const panelBack = (lane: Lane, cave: boolean, k = 1) => placed(pic(`bpanel${lane}${cave ? 1 : 0}@${resFor(k)}`, BOX.w, 90, BOX.ox, 72, resFor(k), g => {
  const P = palOf(lane, 0, cave);
  g.save(); g.beginPath(); g.rect(-90, -32, 180, 60); g.clip();
  hull(g, P, lane);
  g.restore();
  // (the cut along its top: the hull's inside wall, a step darker, the lip lit)
  box(g, -58, -34, 116, 4, INK); box(g, -57, -33, 114, 2, P.lip); box(g, -57, -33, 114, 1, P.lipHi);
  tail(g, P, lane);
}), BOX.w, 90, BOX.ox, 72);

// ---------------------------------------------------------------------------------------------------------------
// Live over a car (screen space: its origin at x, y, scale k, turned a)

const LAMP = [['#FEF08A', '#FFFFFF'], ['#FDBA74', '#FFF6B0'], ['#BAE6FD', '#FFFFFF']];
const LAMP_OFF = LOOKS.map(L => mix(L.wing, '#000000', 0.2));
/** The gem tail lamps (chasing, or flashing red with a hole coming), the eyes' glow on the front car, the element's
 *  live bits (FIRE's embers and smoke, ICE's breath, LIGHTNING's sparks off the coils). */
export const carLive = (c: Ctx, lane: Lane, which: 0 | 1 | 2, f: number, danger: boolean, step: number, k = 1) => {
  for (const s of [-1, 1]) {
    const on = danger ? f % 12 < 6 : (f / 6 + (s > 0 ? 2 : 0) + which * 3) % 8 < 5;
    box(c, s * 32 - 4, -13, 8, 5, danger ? (on ? '#FF4A4A' : '#5A0A0A') : on ? LAMP[lane][0] : LAMP_OFF[lane]);
    if (on && k > 0.7) box(c, s * 32 - 3, -13, 3, 1, danger ? '#FFD0D0' : LAMP[lane][1]);
  }
  if (step > 1 || k < 0.45) return;
  if (which === 2) {
    const blink = f % 140 < 5;
    for (const s of [-1, 1]) {
      box(c, s * EYE_X - 3, HEAD_Y - 3, 6, 2, danger && f % 12 < 6 ? '#FF3030' : blink ? INK : LOOKS[lane].eye);
      if (!blink) box(c, s * EYE_X - 2 + (s > 0 ? 2 : 0), HEAD_Y - 3, 1, 1, '#FFFFFF');
    }
    // (its breath over its head, puffing)
    const ph = f % 36;
    if (ph < 20) {
      const u = ph / 20;
      if (lane === 1) {
        c.globalAlpha = 0.6 * (1 - u); box(c, -6 + u * 4, HEAD_Y - 36 - u * 30, 8 + u * 8, 6 + u * 6, '#57534E'); c.globalAlpha = 1;
        for (let k = 0; k < 3; k++) box(c, -10 + k * 10 + Math.sin(f * 0.2 + k) * 3, HEAD_Y - 26 - ((f * 1.5 + k * 13) % 40), 2, 2, k % 2 ? '#FDE047' : '#F97316');
      } else if (lane === 2) for (let k = 0; k < 4; k++) { box(c, -14 + k * 9, HEAD_Y - 30 - u * 22 - k * 3, 3, 3, '#E0F2FE'); if ((f + k) % 5 === 0) box(c, -15 + k * 9, HEAD_Y - 29 - u * 22 - k * 3, 5, 1, '#FFFFFF'); }
      else if ((f >> 1) % 3 === 0) { c.strokeStyle = '#FEF08A'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-8, HEAD_Y - 30); c.lineTo(-2, HEAD_Y - 38); c.lineTo(2, HEAD_Y - 31); c.lineTo(9, HEAD_Y - 40); c.stroke(); }
    }
  }
  if (lane === 1 && which === 0) {
    // (embers off the hull's seams, up and away)
    for (let k = 0; k < 3; k++) { const u = ((f * 0.9 + k * 23) % 50) / 50; box(c, -40 + k * 36 + Math.sin(f * 0.1 + k * 2) * 6, -40 - u * 40, 2, 2, u < 0.5 ? '#FDE047' : '#F97316'); }
  } else if (lane === 0 && which === 0 && f % 50 < 6) {
    // (a spark across the coils' balls)
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-14, -46); c.lineTo(-6, -50); c.lineTo(0, -44); c.lineTo(7, -49); c.lineTo(14, -46); c.stroke();
    c.strokeStyle = '#C4B5FD'; c.lineWidth = 0.8; c.stroke();
  }
};
