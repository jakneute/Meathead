// The crossings over the water to duck under on a log (layout's LOW_BRANCHES; what hits him is logs.ts'
// updateBranches, unchanged): each a real thing of its place, reaching out over the river from the far bank and held up
// there, its face at the play plane a solid mass down to the gap (impassable reads impassable: nothing under it but the
// open water), its body going back to the far bank in the scene's one perspective (its top and sides showing only where
// the eye can see them), its prop standing in the water behind his line.
//
//   creek:  a pine blown down off the far bank: its root plate torn up and stood on end over its hole, the trunk laid
//           across a fiberglass boulder in the creek, its crown toward him, boughs dragging down to the gap.
//   rapids: an aspen the beavers felled: their gnawed stump on the far bank, the butt hung up on it, the trunk across
//           their lodge out in the rapids, its leafy crown toward him.
//   river:  the park's fake-rock canyon wall: a low brow of it out over the river from a fiberglass butte on the far
//           bank, propped on a steel column in the water (the park's tell, as its overhangs'): molded rock from the gap
//           up past the top of the screen.
//
// The play-plane faces and the props are painted once for the hour (stamps); only the going-back faces (a handful of
// polygons) and what moves (needles swaying, drips) are drawn live.

import { GY } from '../geometry';
import { type Ctx, type View, box, checker, mix, hash, at, poly, still, atDepth, seen, ball, fiberglass, timeOfDay, farTint, skyAt, INK, FAR, NEEDLE, BARK, FIBER, STEEL, DIRT, GRASS, STONE } from './paint';
import { LOW_BRANCHES, BRANCH_GAP, X } from './layout';
import { waterOf, surfaceY } from './water';

/** How far the crossing reaches out either side of its [from, to] (drawn and hit alike: logs.ts hits with it). */
export const LIMB_OUT = 46;

type Kind = 'pine' | 'aspen' | 'brow';
interface Crossing { kind: Kind; L0: number; L1: number; mx: number; bottom: number; s: number; seed: number }
let CROSS: Crossing[] | null = null;
const crossings = (): Crossing[] => (CROSS ??= LOW_BRANCHES.map(([a, b], i) => {
  const L0 = X(a) - LIMB_OUT, L1 = X(b) + LIMB_OUT, mx = (L0 + L1) / 2, w = waterOf(mx), key = w?.key ?? '';
  const kind: Kind = key.startsWith('rapids') ? 'aspen' : key === 'river' ? 'brow' : 'pine';
  return { kind, L0, L1, mx, bottom: GY - BRANCH_GAP, s: w ? surfaceY(w) : GY + 26, seed: 17 + i * 31 };
}));

// ---------------------------------------------------------------------------------------------------------------
// Materials

/** Aspen bark: chalky white-gray (its black "eyes" on it). */
const ABARK = ['#24221E', '#45423A', '#6E6A60', '#9C978A', '#C4C0B2', '#E2DED0', '#F6F3E8'];
/** Aspen leaves, late summer: green going gold. */
const ALEAF = ['#141806', '#26300C', '#3E4E14', '#5E7020', '#86942A', '#B4B23A', '#E0D468'];
/** The pale chewed wood. */
const CHEW = ['#6A4E24', '#94743A', '#BC9A56', '#DCC07A', '#F0DCA2'];
/** Mud (the lodge's). */
const MUD = ['#120C06', '#20160C', '#302214', '#42301C', '#584226', '#705634'];

/** A ramp for depth d (1 the play plane, FAR the far bank): hazier the further back. Memoized for the hour. */
const tintMemo = new Map<string, string[]>();
let tintKey = '';
const tinted = (name: string, R: string[], d: number) => {
  const tod = timeOfDay();
  if (tod.key !== tintKey) { tintKey = tod.key; tintMemo.clear(); }
  const key = name + d.toFixed(3);
  let v = tintMemo.get(key);
  if (!v) {
    const k = Math.max(0, Math.min(1, (1 - d) / (1 - FAR))), haze = skyAt(0.9, tod);
    v = R.map(col => mix(farTint(col, 0.2 + 0.5 * k, tod), haze, 0.22 * k));
    tintMemo.set(key, v);
  }
  return v;
};

// ---------------------------------------------------------------------------------------------------------------
// Going back (live): a solid's faces from depth dNear back to dFar, the outline `pts` (world, at the play plane; up its
// left, across its top, down its right) carried toward the one eye; faces turned away skipped. Banded (hazier going
// back). `shade` picks the ramp step by the face's outward normal.

const faces = (c: Ctx, eye: { x: number; y: number }, pts: [number, number][], dNear: number, dFar: number, name: string, R: string[], shade: (nx: number, ny: number) => number, bands = 3) => {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [px, py] = pts[i], [qx, qy] = pts[i + 1], dx = qx - px, dy = qy - py, len = Math.hypot(dx, dy) || 1;
    const nx = dy / len, ny = -dx / len;
    if (ny > 0.5) continue;
    if (nx * (eye.x - (px + qx) / 2) + ny * (eye.y - (py + qy) / 2) <= 0) continue;
    const idx = shade(nx, ny);
    for (let j = 0; j < bands; j++) {
      const d0 = dNear - ((dNear - dFar) * j) / bands, d1 = dNear - ((dNear - dFar) * (j + 1)) / bands;
      const T = tinted(name, R, Math.round(((d0 + d1) / 2) * 50) / 50);
      // (a hair of overlap between bands: no seams)
      poly(c, [at(eye, px, py, d0 + 0.002), at(eye, qx, qy, d0 + 0.002), at(eye, qx, qy, d1), at(eye, px, py, d1)], T[idx]);
    }
  }
};

/** A line going back along a solid's edge (an ink edge, a bark ridge, a stratum). */
const along = (c: Ctx, eye: { x: number; y: number }, x: number, y: number, dNear: number, dFar: number, col: string, w = 1) => {
  const [ax, ay] = at(eye, x, y, dNear), [bx, by] = at(eye, x, y, dFar);
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
};

/** A round trunk's upper half (its lower half's never seen: it's under the eye). */
const ring = (cx: number, cy: number, r: number): [number, number][] => {
  const p: [number, number][] = [];
  for (let k = 0; k <= 8; k++) { const t = Math.PI + (k * Math.PI) / 8; p.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); }
  return p;
};
/** Bark lit from the upper left: the up-left faces brightest, the top, the up-right, the sides darker. */
const barkShade = (nx: number, ny: number) => (ny < -0.92 ? 4 : nx < 0 ? (ny < -0.4 ? 5 : 3) : ny < -0.4 ? 3 : 2);

const drawTrunk = (c: Ctx, v: View, cx: number, cy: number, r: number, name: string, R: string[], dNear: number, aspen: boolean, seed: number) => {
  const eye = v.eye, dFar = FAR + 0.005;
  faces(c, eye, ring(cx, cy, r), dNear, dFar, name, R, barkShade, 4);
  // (its marks running back along it, on the faces he sees: bark ridges on the pine, the aspen's black eyes)
  const T = tinted(name, R, (dNear + dFar) / 2);
  for (let k = 1; k < 8; k++) {
    const t = Math.PI + (k * Math.PI) / 8, x = cx + Math.cos(t) * r, y = cy + Math.sin(t) * r;
    if (Math.cos(t) * (eye.x - x) + Math.sin(t) * (eye.y - y) <= 0) continue;
    if (!aspen) { if (k % 2) along(c, eye, x, y, dNear, dFar, T[1]); continue; }
    for (let m = 0; m < 6; m++) {
      const d = dFar + (dNear - dFar) * ((m + hash(seed + k * 7 + m)) / 6);
      if (hash(seed + k * 3.3 + m * 1.7) > 0.45) continue;
      const [ex, ey] = at(eye, x, y, d);
      box(c, ex - 3 * d, ey, 6 * d, Math.max(1, 2 * d), T[0]);
    }
  }
  // (inked down its two sides)
  along(c, eye, cx - r, cy, dNear, dFar, INK); along(c, eye, cx + r, cy, dNear, dFar, INK);
};

// ---------------------------------------------------------------------------------------------------------------
// The crowns (tip on: the top of the fallen tree pointing at him), at the play plane (and a darker copy just behind, so
// it has some body going back). Local: (0, 0) the gap's top at the crossing's middle.

const HW = 84, CY = -70, TOPR = 116, HUB = -86;
const domePts = (seed: number, jag: number): [number, number][] => {
  const p: [number, number][] = [[-HW, 0]];
  for (let y = -12; y > CY; y -= 12) p.push([-HW - jag * hash(seed + y), y]);
  for (let i = 0; i <= 26; i++) {
    const t = Math.PI + (i / 26) * Math.PI, out = jag * (i % 2 ? 1 : 0.15) + jag * 0.5 * hash(seed + i * 3.1);
    p.push([Math.cos(t) * (HW + out), CY + Math.sin(t) * (TOPR + out)]);
  }
  for (let y = CY + 12; y < 0; y += 12) p.push([HW + jag * hash(seed + y * 1.3), y]);
  p.push([HW, 0]);
  return p;
};
const trace = (g: Ctx, pts: [number, number][]) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
/** A jagged ring of bough tips about the hub. */
const whorl = (g: Ctx, cx: number, cy: number, rx: number, ry: number, n: number, seed: number) => {
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, k = i % 2 ? 1 : 0.84 - 0.06 * hash(seed + i);
    const x = cx + Math.cos(t) * rx * k, y = cy + Math.sin(t) * ry * k;
    if (i) g.lineTo(x, y); else g.moveTo(x, y);
  }
  g.closePath();
};

/** The boughs' lowest dragging flat along the gap's top: shade, the tips hanging to the line and no lower. */
const dragLine = (g: Ctx, D0: string, D1: string, D2: string) => {
  box(g, -HW - 10, -9, HW * 2 + 20, 9, D0);
  checker(g, -HW - 10, -13, HW * 2 + 20, 4, D1, 1);
  for (let x = -HW - 4; x < HW + 4; x += 6) box(g, x, -4 + (x % 4 ? 1 : 0), 2, 4 - (x % 4 ? 1 : 0), D2);
  box(g, -HW - 6, -1, HW * 2 + 12, 1, INK);
};

const paintPineCrown = (g: Ctx, N: string[], B: string[], seed: number) => {
  const pts = domePts(seed, 6);
  g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 3; trace(g, pts); g.fill(); g.stroke();
  g.save(); trace(g, pts); g.clip();
  box(g, -HW - 10, -TOPR + CY - 10, HW * 2 + 20, TOPR - CY + 12, N[1]);
  // (the whorls, outermost first: each a ring of bough tips, its shade under, its body, lit up and left; the
  // branches coming out from the leader between them)
  for (let k = 0; k < 5; k++) {
    const sc = 1 - k * 0.19, rx = 98 * sc, ry = 122 * sc, cx = -k * 2, cy = HUB - k * 2;
    g.save(); g.translate(2, 3); g.fillStyle = N[k]; whorl(g, cx, cy, rx, ry, 30 - k * 4, seed + k); g.fill(); g.restore();
    g.fillStyle = N[k + 1]; whorl(g, cx, cy, rx, ry, 30 - k * 4, seed + k); g.fill();
    g.save(); whorl(g, cx, cy, rx, ry, 30 - k * 4, seed + k); g.clip();
    g.fillStyle = N[k + 2]; whorl(g, cx - rx * 0.16, cy - ry * 0.16, rx * 0.8, ry * 0.8, 30 - k * 4, seed + k + 9); g.fill();
    checker(g, cx - rx, cy - ry * 0.2, rx * 1.2, 2, N[k + 2], k % 2);
    g.restore();
    if (k === 1 || k === 3) for (let i = 0; i < 9; i++) {
      const t = (i / 9) * Math.PI * 2 + k * 0.5 + (hash(seed + k * 11 + i) - 0.5) * 0.6, r0 = 10, r1 = rx * (0.5 + hash(seed + i * 3.7 + k) * 0.3);
      g.strokeStyle = B[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + Math.cos(t) * r0, cy + Math.sin(t) * r0 * 1.2); g.lineTo(cx + Math.cos(t) * r1, cy + Math.sin(t) * r1 * 1.24); g.stroke();
      g.strokeStyle = B[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + Math.cos(t) * r0 - 1, cy + Math.sin(t) * r0 * 1.2 - 1); g.lineTo(cx + Math.cos(t) * r1 - 1, cy + Math.sin(t) * r1 * 1.24 - 1); g.stroke();
    }
    // (needle tufts along the ring: lit up-left, dark down-right)
    for (let i = 0; i < 26 - k * 3; i++) {
      const t = (i / (26 - k * 3)) * Math.PI * 2, x = cx + Math.cos(t) * rx * 0.88, y = cy + Math.sin(t) * ry * 0.88;
      box(g, x - 1, y - 1, 2, 3, Math.cos(t) + Math.sin(t) < 0 ? N[Math.min(6, k + 3)] : N[k]);
    }
  }
  // (the leader's tip, pointing straight at him)
  ball(g, -8, HUB - 8, 7, 7, [N[1], N[3], N[4], N[5], N[6], '#B4D488']);
  dragLine(g, N[0], N[1], N[2]);
  g.restore();
  for (let i = 0; i < pts.length; i += 2) { const [x, y] = pts[i]; if (y < -14) box(g, x - 1, y - 1, 2, 3, x < 0 ? N[4] : N[2]); }
};

const paintAspenCrown = (g: Ctx, Lf: string[], Bw: string[], seed: number) => {
  const pts = domePts(seed, 9);
  g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 3; trace(g, pts); g.fill(); g.stroke();
  g.save(); trace(g, pts); g.clip();
  box(g, -HW - 10, -TOPR + CY - 10, HW * 2 + 20, TOPR - CY + 12, Lf[1]);
  const clumps = (k: number) => {
    const r = 104 - k * 27, n = Math.max(5, Math.round(r / 7)), cr = 18 - k * 3;
    for (let j = 0; j < n; j++) {
      const t = (j / n) * Math.PI * 2 + k * 0.4 + hash(seed + j) * 0.2, x = Math.cos(t) * r * 0.9 - k * 2, y = HUB + Math.sin(t) * r * 1.08 - k * 2;
      g.fillStyle = Lf[k]; g.beginPath(); g.arc(x + 2, y + 3, cr, 0, Math.PI * 2); g.fill();
      g.fillStyle = Lf[k + 1]; g.beginPath(); g.arc(x, y, cr, 0, Math.PI * 2); g.fill();
      g.fillStyle = Lf[k + 2]; g.beginPath(); g.arc(x - cr * 0.3, y - cr * 0.3, cr * 0.55, 0, Math.PI * 2); g.fill();
      // (single leaves catching the light, flickering coins of gold)
      for (let m = 0; m < 4; m++) box(g, x - cr * 0.6 + hash(seed + j * 5 + m) * cr * 1.1, y - cr * 0.7 + hash(seed + j * 3 + m * 2) * cr * 1.2, 2, 2, m % 2 ? Lf[Math.min(6, k + 3)] : Lf[k]);
    }
  };
  clumps(0);
  // (the white branches out from the trunk's tip, crooked and uneven, mostly lost in the leaves: bits between clumps)
  for (let i = 0; i < 7; i++) {
    const t = (i / 7) * Math.PI * 2 + 0.3 + (hash(seed + i * 2.9) - 0.5) * 0.7, r1 = 44 + hash(seed + i) * 40;
    const x1 = Math.cos(t) * r1, y1 = HUB + Math.sin(t) * r1 * 1.1;
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(0, HUB); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = Bw[3]; g.lineWidth = 3; g.stroke();
    g.strokeStyle = Bw[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(-1, HUB - 1); g.lineTo(x1 - 1, y1 - 1); g.stroke();
  }
  clumps(1); clumps(2); clumps(3);
  // (the trunk's broken tip in the middle: white, a dark eye)
  ball(g, -2, HUB - 2, 8, 8, [Bw[1], Bw[3], Bw[4], Bw[5], Bw[6], '#FFFFFF']);
  box(g, -6, HUB + 1, 6, 2, Bw[0]);
  dragLine(g, Lf[0], Lf[1], Lf[2]);
  g.restore();
  for (let i = 0; i < pts.length; i += 2) { const [x, y] = pts[i]; if (y < -14) { g.fillStyle = x < 0 ? Lf[4] : Lf[2]; g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); } }
};

// ---------------------------------------------------------------------------------------------------------------
// What holds them up (stamps at their depth; local (0, 0) the gap's top at the crossing's middle; the far bank's top
// is at 62, the water at 80)

/** The pine's root plate, torn up standing on end over the hole it came out of (the trunk goes into its middle). */
const paintRootPlate = (g: Ctx, D: string[], B: string[], G: string[], S: string[], seed: number) => {
  const cy = -48, rx = 80, ry = 112;
  const el = (x: number, y: number, ex: number, ey: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, ex, ey, 0, 0, Math.PI * 2); g.fill(); };
  // (the hole it tore out of the bank, at its foot; clods thrown about)
  el(6, 63, 98, 8, INK); el(8, 63, 90, 6, D[0]);
  for (let i = 0; i < 9; i++) { const x = -110 + hash(seed + i) * 220; box(g, x, 58 + hash(seed + i * 2) * 4, 6, 4, D[2]); box(g, x, 58 + hash(seed + i * 2) * 4, 6, 1, D[4]); }
  // (the plate: inked, its dirt in steps, lit up and left, shaded down and right)
  el(0, cy, rx + 2, ry + 2, INK); el(0, cy, rx, ry, D[2]);
  g.save(); g.beginPath(); g.ellipse(0, cy, rx, ry, 0, 0, Math.PI * 2); g.clip();
  el(-10, cy - 12, rx * 0.8, ry * 0.8, D[3]); el(-24, cy - 30, rx * 0.44, ry * 0.42, D[4]);
  checker(g, -rx, cy - 10, rx * 1.5, 2, D[3], 0);
  el(rx * 0.55, cy + ry * 0.62, rx * 0.72, ry * 0.5, D[1]);
  // (stones caught in it)
  for (let i = 0; i < 8; i++) { const t = hash(seed + i * 4.1) * Math.PI * 2, r = 0.25 + hash(seed + i) * 0.6; ball(g, Math.cos(t) * rx * r, cy + Math.sin(t) * ry * r, 4 + hash(seed + i * 9) * 3, 3 + hash(seed + i * 7) * 2, S); }
  g.restore();
  // (the roots: out from the middle to past the edge, thick to thin, their snapped ends sticking out)
  for (let k = 0; k < 18; k++) {
    const t = (k / 18) * Math.PI * 2 + hash(seed + k) * 0.3, r1 = 0.7 + hash(seed + k * 1.9) * 0.5;
    const x1 = Math.cos(t) * rx * r1, y1 = cy + Math.sin(t) * ry * r1, xm = x1 * 0.5 + Math.sin(t) * 8, ym = cy + (y1 - cy) * 0.5 - Math.cos(t) * 8;
    const stroke = (w: number, col: string, o = 0) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(o, cy + o); g.quadraticCurveTo(xm + o, ym + o, x1 + o, y1 + o); g.stroke(); };
    stroke(5, INK); stroke(3, k % 3 ? B[3] : B[2]); stroke(1, B[5], -1);
    if (r1 > 1) { g.strokeStyle = B[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 + Math.cos(t) * 10, y1 + Math.sin(t) * 10 + 4); g.stroke(); }
  }
  // (the turf it carried up with it, sticking out past its top edge)
  for (let i = 0; i < 22; i++) {
    const t = Math.PI * 1.08 + (i / 21) * Math.PI * 0.84, x = Math.cos(t) * (rx + 1), y = cy + Math.sin(t) * (ry + 1);
    for (let m = -1; m <= 1; m++) { g.strokeStyle = m < 0 ? G[5] : G[3]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + m * 2, y); g.lineTo(x + m * 3 + Math.cos(t) * 6, y + Math.sin(t) * 8); g.stroke(); }
  }
  // (where the trunk goes in)
  el(0, cy, 22, 22, D[1]);
};

/** The fiberglass boulder in the creek the pine's trunk came down across (its seams and bolts: the park's). */
const paintBoulder = (g: Ctx, F: string[], seed: number) => {
  const pts: [number, number][] = [[-52, 81], [-58, 44], [-50, 8], [-34, -20], [-10, -31], [16, -30], [38, -18], [54, 12], [58, 48], [52, 81]];
  g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 3; trace(g, pts); g.fill(); g.stroke();
  g.save(); trace(g, pts); g.clip();
  fiberglass(g, -60, -34, 120, 118, F, seed, true);
  box(g, 34, -34, 26, 118, F[2]); checker(g, 28, -34, 6, 118, F[2], 0); box(g, 48, -34, 12, 118, F[1]);
  box(g, -60, -34, 120, 4, F[5]);
  // (where the trunk lies on it: scuffed, bark flakes)
  for (let i = 0; i < 6; i++) box(g, -16 + i * 6, -30 + (i % 2), 4, 2, i % 2 ? '#5E361E' : F[1]);
  // (wet up from the water)
  box(g, -60, 66, 120, 15, F[1]); checker(g, -60, 62, 120, 4, F[1], 1);
  g.restore();
  for (let x = -56; x < 56; x += 8) box(g, x, 78 + ((x >> 3) % 2), 6, 2, '#E8F4F8');
};

/** The beavers' gnawed stump on the far bank, the aspen's butt hung up on its point; their chips all round. */
const paintStump = (g: Ctx, Bw: string[], C: string[], D: string[], seed: number) => {
  for (let i = 0; i < 16; i++) { const x = -60 + hash(seed + i) * 120, y = 58 + hash(seed + i * 3) * 5; box(g, x, y, 4, 2, C[3]); box(g, x, y, 4, 1, C[4]); }
  // (the stump: white bark, flared at its foot, its black eyes; then the waist they chewed, pale, to a point)
  g.fillStyle = INK; g.beginPath(); g.moveTo(-24, 64); g.lineTo(-19, 40); g.lineTo(-18, 8); g.lineTo(0, -32); g.lineTo(18, 8); g.lineTo(19, 40); g.lineTo(24, 64); g.closePath(); g.fill();
  g.fillStyle = Bw[3]; g.beginPath(); g.moveTo(-22, 63); g.lineTo(-17, 40); g.lineTo(-17, 10); g.lineTo(17, 10); g.lineTo(17, 40); g.lineTo(22, 63); g.closePath(); g.fill();
  box(g, -17, 10, 8, 53, Bw[5]); box(g, -15, 10, 2, 53, Bw[6]); box(g, 9, 10, 8, 53, Bw[2]);
  for (let y = 18; y < 58; y += 9) box(g, -12 + hash(seed + y) * 16, y, 7, 2, Bw[0]);
  g.fillStyle = C[2]; g.beginPath(); g.moveTo(-17, 10); g.lineTo(0, -30); g.lineTo(17, 10); g.closePath(); g.fill();
  g.fillStyle = C[3]; g.beginPath(); g.moveTo(-15, 9); g.lineTo(-1, -26); g.lineTo(2, 9); g.closePath(); g.fill();
  // (their tooth marks, in rows)
  for (let y = -16; y < 8; y += 5) for (let x = -12 + (y + 16) * -0.2; x < 12; x += 5) if (Math.abs(x) < (y + 32) * 0.42) box(g, x, y, 3, 1, C[0]);
  box(g, -17, 9, 34, 2, C[1]);
  // (the mound of chips piled against its foot)
  g.fillStyle = D[3]; g.beginPath(); g.ellipse(0, 63, 40, 5, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 10; i++) box(g, -30 + i * 6, 60 + (i % 3), 4, 2, C[i % 2 ? 2 : 4]);
};

/** The beavers' lodge out in the rapids, the aspen's trunk laid across its top: sticks and mud. */
const paintLodge = (g: Ctx, M: string[], B: string[], seed: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 20; i++) { const t = Math.PI + (i / 20) * Math.PI, out = (i % 2) * 4 + hash(seed + i) * 3; pts.push([Math.cos(t) * (74 + out), 81 + Math.sin(t) * (111 + out)]); }
  g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 3; trace(g, pts); g.fill(); g.stroke();
  g.save(); trace(g, pts); g.clip();
  box(g, -80, -36, 160, 120, M[1]);
  g.fillStyle = M[2]; g.beginPath(); g.ellipse(-12, 6, 56, 70, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = M[3]; g.beginPath(); g.ellipse(-24, -8, 28, 36, 0, 0, Math.PI * 2); g.fill();
  // (the sticks, every which way, lit along their tops)
  for (let i = 0; i < 80; i++) {
    const x = -74 + hash(seed + i * 1.3) * 148, y = -30 + hash(seed + i * 2.7) * 112, a = (hash(seed + i * 4.1) - 0.5) * 1.8, l = 12 + hash(seed + i) * 22;
    const dx = Math.cos(a) * l, dy = Math.sin(a) * l, col = B[1 + (i % 4)];
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + dx, y + dy); g.stroke();
    g.strokeStyle = col; g.lineWidth = 2; g.stroke();
    if (i % 3 === 0) box(g, x + dx * 0.5, y + dy * 0.5 - 1, 2, 1, C(B, 5));
  }
  checker(g, 30, -36, 50, 120, M[0], 0);
  box(g, -80, 70, 160, 14, M[0]);
  g.restore();
  // (sticks poking out of it)
  for (let i = 0; i < 9; i++) { const t = Math.PI * 1.1 + (i / 8) * Math.PI * 0.8, x = Math.cos(t) * 74, y = 81 + Math.sin(t) * 110; g.strokeStyle = B[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(t + 0.4) * 12, y + Math.sin(t + 0.4) * 12); g.stroke(); }
  for (let x = -70; x < 70; x += 8) box(g, x, 78 + ((x >> 3) % 2), 6, 2, '#E8F4F8');
};
const C = (R: string[], i: number) => R[Math.min(R.length - 1, i)];

/** The fake-rock butte on the far bank the brow comes out of: molded fiberglass, its seams and bolts, wider at its
 *  foot; the river's dark undercut in under the brow. */
const paintButte = (g: Ctx, F: string[], seed: number) => {
  const pts: [number, number][] = [[-206, 81], [-198, -40], [-182, -190], [-166, -340], [-148, -500], [-128, -720], [128, -720], [146, -520], [162, -360], [180, -210], [196, -60], [206, 81]];
  const j = pts.map(([x, y], i) => [x + (hash(seed + i) - 0.5) * 14, y] as [number, number]);
  g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 3; trace(g, j); g.fill(); g.stroke();
  g.save(); trace(g, j); g.clip();
  fiberglass(g, -220, -730, 440, 815, F, seed, true);
  box(g, -220, -730, 30, 815, F[4]); checker(g, -190, -730, 6, 815, F[4], 0);
  box(g, 176, -730, 44, 815, F[1]); checker(g, 168, -730, 8, 815, F[1], 1);
  // (in under the brow: its shadow, dark, deeper down to the water)
  box(g, -92, 0, 184, 81, F[1]); checker(g, -92, 0, 184, 4, F[2], 0); box(g, -80, 16, 160, 65, F[0]);
  box(g, -220, 70, 440, 11, F[1]);
  g.restore();
  for (let x = -200; x < 200; x += 8) box(g, x, 78 + ((x >> 3) % 2), 6, 2, '#E8F4F8');
};

/** The steel column under the brow (an I-beam, riveted, its cap plate bolted up into the rock, a brace). */
const paintColumn = (g: Ctx, S: string[]) => {
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-6, 44); g.lineTo(-50, 3); g.stroke();
  g.strokeStyle = S[3]; g.lineWidth = 4; g.stroke(); g.strokeStyle = S[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(-7, 42); g.lineTo(-50, 1); g.stroke();
  box(g, -9, 0, 18, 81, INK); box(g, -8, 0, 16, 81, S[3]); box(g, -8, 0, 4, 81, S[5]); box(g, -7, 0, 1, 81, S[6]); box(g, 4, 0, 4, 81, S[1]);
  for (let y = 8; y < 76; y += 12) { box(g, -1, y, 2, 2, S[6]); box(g, -1, y + 2, 2, 1, S[0]); }
  // (a rust streak down it)
  box(g, 1, 20, 2, 40, '#7A3A1A'); box(g, 1, 60, 1, 12, '#5A2A12');
  box(g, -16, 0, 32, 6, INK); box(g, -15, 0, 30, 5, S[4]); box(g, -15, 0, 30, 1, S[6]);
  for (const bx of [-12, 9]) { box(g, bx, 1, 3, 3, S[1]); box(g, bx, 1, 2, 2, S[6]); }
  // (wet at the water)
  box(g, -8, 70, 16, 11, S[1]);
  for (let x = -16; x < 16; x += 6) box(g, x, 78 + ((x >> 2) % 2), 5, 2, '#E8F4F8');
};

/** The brow's face at the play plane: molded fiberglass from the gap up past the top of the screen, its underlip in
 *  shade down to a hard edge at the gap's top (nothing below it but the water), stained under the seams. */
const BROW_H = 720, BROW_W = 80;
const browPts = (seed: number): [number, number][] => {
  const p: [number, number][] = [[-BROW_W, 0]];
  for (let y = -30; y > -BROW_H; y -= 30) p.push([-BROW_W - 3 - hash(seed + y) * 7, y]);
  p.push([-BROW_W, -BROW_H], [BROW_W, -BROW_H]);
  for (let y = -BROW_H + 30; y < 0; y += 30) p.push([BROW_W + 3 + hash(seed + y * 1.7) * 7, y]);
  p.push([BROW_W, 0]);
  return p;
};
const paintBrow = (g: Ctx, F: string[], seed: number) => {
  const pts = browPts(seed);
  g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 3; trace(g, pts); g.fill(); g.stroke();
  g.save(); trace(g, pts); g.clip();
  fiberglass(g, -BROW_W - 12, -BROW_H, BROW_W * 2 + 24, BROW_H, F, seed, true);
  box(g, -BROW_W - 12, -BROW_H, 16, BROW_H, F[4]); checker(g, -BROW_W + 4, -BROW_H, 4, BROW_H, F[4], 0);
  box(g, BROW_W - 10, -BROW_H, 22, BROW_H, F[2]); checker(g, BROW_W - 16, -BROW_H, 6, BROW_H, F[2], 1); box(g, BROW_W - 2, -BROW_H, 14, BROW_H, F[1]);
  // (water stains streaking down from its ledges; moss in the damp)
  for (let i = 0; i < 9; i++) { const x = -BROW_W + 10 + hash(seed + i * 2.3) * (BROW_W * 2 - 20), y = -BROW_H + hash(seed + i * 5.7) * (BROW_H - 80); box(g, x, y, 2, 30 + hash(seed + i) * 50, F[2]); }
  for (let i = 0; i < 7; i++) { const x = -BROW_W + 8 + hash(seed + i * 3.9) * (BROW_W * 2 - 30), y = -40 - hash(seed + i * 6.1) * 260; box(g, x, y, 12, 3, '#3C5A22'); box(g, x + 2, y - 1, 6, 1, '#6C8C3A'); }
  // (the underlip: the rock rounding away under, in steps darker to the gap's edge)
  box(g, -BROW_W - 12, -22, BROW_W * 2 + 24, 8, F[2]); checker(g, -BROW_W - 12, -26, BROW_W * 2 + 24, 4, F[2], 0);
  box(g, -BROW_W - 12, -14, BROW_W * 2 + 24, 8, F[1]); box(g, -BROW_W - 12, -6, BROW_W * 2 + 24, 6, F[0]);
  box(g, -BROW_W - 12, -1, BROW_W * 2 + 24, 1, INK);
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** Behind the play plane (before the water's body and the raised ground): what holds each crossing up, and its body
 *  going back to the far bank. */
export const drawCrossingsBack = (c: Ctx, v: View) => {
  const eye = v.eye;
  for (const X0 of crossings()) {
    const { kind, L0, L1, mx, bottom, seed } = X0;
    if (!seen(v, L0 - 220, L1 + 220, FAR) && !seen(v, L0 - 40, L1 + 40, 1)) continue;
    if (kind === 'brow') {
      atDepth(c, eye, FAR, () => still(c, `xbutte-${seed}`, mx, bottom, -224, -734, 448, 822, g => paintButte(g, tinted('fiber', FIBER, FAR), seed)));
      // (the brow going back into the butte: its sides where he can see them, strata running along them)
      const box4: [number, number][] = [[mx - BROW_W, bottom], [mx - BROW_W, bottom - BROW_H], [mx + BROW_W, bottom - BROW_H], [mx + BROW_W, bottom]];
      faces(c, eye, box4, 1, FAR + 0.005, 'fiber', FIBER, (nx) => (nx < 0 ? 4 : 2), 4);
      const T = tinted('fiber', FIBER, 0.85);
      for (let y = bottom - 30; y > bottom - 460; y -= 26 + Math.round(hash(seed + y) * 20)) {
        if (eye.x < mx - BROW_W) along(c, eye, mx - BROW_W, y, 1, FAR + 0.005, T[5]);
        if (eye.x > mx + BROW_W) along(c, eye, mx + BROW_W, y, 1, FAR + 0.005, T[1]);
      }
      atDepth(c, eye, 0.86, () => still(c, 'xcolumn', mx, bottom, -60, -4, 90, 88, g => paintColumn(g, tinted('steel', STEEL, 0.86))));
      continue;
    }
    const pine = kind === 'pine', cy = bottom - 46, r = pine ? 18 : 14;
    if (pine) atDepth(c, eye, FAR, () => still(c, `xroot-${seed}`, mx, bottom, -124, -172, 248, 248, g => paintRootPlate(g, tinted('dirt', DIRT, FAR), tinted('bark', BARK, FAR), tinted('grass', GRASS, FAR), tinted('stone', STONE, FAR), seed)));
    else atDepth(c, eye, FAR, () => still(c, `xstump-${seed}`, mx, bottom, -70, -40, 140, 110, g => paintStump(g, tinted('abark', ABARK, FAR), tinted('chew', CHEW, FAR), tinted('dirt', DIRT, FAR), seed)));
    if (pine) atDepth(c, eye, 0.85, () => still(c, `xboulder-${seed}`, mx, bottom, -64, -38, 128, 124, g => paintBoulder(g, tinted('fiber', FIBER, 0.85), seed)));
    else atDepth(c, eye, 0.85, () => still(c, `xlodge-${seed}`, mx, bottom, -90, -40, 180, 126, g => paintLodge(g, tinted('mud', MUD, 0.85), tinted('bark', BARK, 0.85), seed)));
    drawTrunk(c, v, mx, cy, r, pine ? 'bark' : 'abark', pine ? BARK : ABARK, 0.94, !pine, seed);
    // (its crown's far side, a step darker, just behind the near: some body to it going back)
    atDepth(c, eye, 0.94, () => still(c, `x${kind}-back-${seed}`, mx, bottom, -100, -204, 200, 212, g => {
      const R = tinted(pine ? 'needleB' : 'aleafB', (pine ? NEEDLE : ALEAF).map(col => mix(col, INK, 0.3)), 0.94);
      if (pine) paintPineCrown(g, R, tinted('bark', BARK, 0.94), seed + 5); else paintAspenCrown(g, R, tinted('abark', ABARK, 0.94), seed + 5);
    }));
  }
};

/** At the play plane, in front of him: each crossing's face (the crown toward him, the brow's rock), and what moves on
 *  it (a fringe of needles or leaves swaying under it, well clear of his ducked head; drips off the brow's lip). */
export const drawCrossingsFront = (c: Ctx, v: View) => {
  const f = v.f;
  for (const X0 of crossings()) {
    const { kind, L0, L1, mx, bottom, s, seed } = X0;
    if (!seen(v, L0 - 30, L1 + 30, 1)) continue;
    if (kind === 'brow') {
      still(c, `xbrow-${seed}`, mx, bottom, -BROW_W - 14, -BROW_H - 4, BROW_W * 2 + 28, BROW_H + 6, g => paintBrow(g, tinted('fiber', FIBER, 1), seed));
      // (drips off the lip into the river)
      for (let k = 0; k < 4; k++) {
        const x = mx - 60 + k * 37 + (k % 2) * 6, ph = ((f + k * 23) % 50) / 50, y = bottom + ph * ph * (s - bottom);
        box(c, x, y, 2, 3, 'rgba(200, 232, 244, 0.85)');
        if (ph > 0.9) box(c, x - 2, s - 1, 6, 1, '#E8F4F8');
      }
      continue;
    }
    const pine = kind === 'pine';
    still(c, `x${kind}-${seed}`, mx, bottom, -100, -204, 200, 212, g => {
      if (pine) paintPineCrown(g, tinted('needle', NEEDLE, 1), tinted('bark', BARK, 1), seed);
      else paintAspenCrown(g, tinted('aleaf', ALEAF, 1), tinted('abark', ABARK, 1), seed);
    });
    const tip = pine ? tinted('needle', NEEDLE, 1)[2] : tinted('aleaf', ALEAF, 1)[3];
    for (let x = mx - HW + 4; x < mx + HW - 4; x += 7) box(c, x + Math.round(Math.sin(f * 0.05 + x) * 0.8), bottom, 3, 2 + ((x >> 3) % 2) * 2, tip);
  }
};
