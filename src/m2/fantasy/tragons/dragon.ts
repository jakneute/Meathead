// Truelling Tragons' dragons, at full detail: a car of a train at the origin (its roof's middle at 0, 0, the front off
// to +x): car 0 the rear (its tail curled up off the back), 1 the middle, 2 the front (the neck up off its nose and the
// head out ahead, jaws open). Each lane its own dragon: LIGHTNING gold with purple wings and zigzag horns, FIRE red
// with an orange belly and ivory horns, ICE blue with a frosted belly, crystal horns and an icicle beard.
//
// A car: a scaled hull in six steps (the scales in rows, a gilt trim band, the belly's plates), a bat wing folded along
// its side (veined, a gilt claw at the wrist), gem lamps in gilt bezels, the steel chassis with its road and upstop
// wheels, the coupler; along the top the lit back he stands on (warm: somewhere to stand), and over it the HANDLEBAR on
// its brass posts with leather grips (thin, dim: a thing to hold, not a step).
//
// The still parts are painted once per lane, car and hour into a sprite (at twice the size, put down turned and scaled
// with the track: one drawImage a car); what moves (the lamps chasing or flashing red, the eye's glint, the breath's
// puffs, a spare's flapping bat wings) is drawn live over it.

import { timeOfDay, thisHour } from '../../timeOfDay';
import { INK, mix, box, checker, hour, ramp6, GOLD, IRON, ballR, polyF, type Ctx } from '../kit';
import { CAR, type Lane } from './layout';

interface Look { body: string; belly: string; wing: string; horn: string; crest: string; eye: string }
/** By lane: LIGHTNING, FIRE, ICE. */
const LOOKS: Look[] = [
  { body: '#E2B21E', belly: '#FFF0A0', wing: '#5A2A9A', horn: '#9A5AE8', crest: '#B88AF4', eye: '#F4F0FF' },
  { body: '#C42828', belly: '#F2902E', wing: '#6E1414', horn: '#F2E6C8', crest: '#F6A02A', eye: '#FDE047' },
  { body: '#3A8ED8', belly: '#DCEFFC', wing: '#1E4A9A', horn: '#E8F8FF', crest: '#9ADCFF', eye: '#E0F7FF' },
];

/** The sprite's box about the car's origin (local px), and how much finer it's painted. */
const SPR = { x: -136, y: -130, w: 276, h: 196 }, RES = 2;

type R6 = string[];
interface Pal { B: R6; Bl: R6; W: R6; Hn: R6; Cr: R6; G: R6; I: R6; Lt: R6; lip: string; lipHi: string; eye: string }
const palOf = (lane: Lane, char: boolean): Pal => {
  const L = LOOKS[lane];
  const H = (c: string) => (char ? mix(c, '#140C08', 0.86) : hour(c, 0.06));
  const R = (c: string) => ramp6(c).map(H);
  return {
    B: R(L.body), Bl: R(L.belly), W: R(L.wing), Hn: R(L.horn), Cr: R(L.crest), G: GOLD.map(H), I: IRON.map(H), Lt: R('#6A3A22'),
    lip: H(mix(L.belly, '#FFF6D8', 0.5)), lipHi: H('#FFFBEA'), eye: char ? '#F8FAFC' : L.eye,
  };
};

const disc = (g: Ctx, x: number, y: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2); g.fill(); };
const inked = (g: Ctx, pts: [number, number][], col: string) => {
  // (an ink outline a pixel out all round, then the fill)
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  polyF(g, pts.map(([x, y]) => { const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1; return [x + dx / l * 1.2, y + dy / l * 1.2] as [number, number]; }), INK);
  polyF(g, pts, col);
};

/** The wheels and chassis under the hull (behind it). */
const chassis = (g: Ctx, P: Pal, i: number) => {
  const I = P.I;
  box(g, -44, 37, 88, 8, INK); box(g, -43, 38, 86, 6, I[2]); box(g, -43, 38, 86, 1, I[4]); box(g, -43, 43, 86, 1, I[0]);
  for (let x = -38; x < 40; x += 10) box(g, x, 40, 1, 1, I[5]);
  for (const wx of [-30, 30]) {
    // (the road wheel on the rail, the upstop under it, the side guide)
    disc(g, wx, 43, 6.2, INK); disc(g, wx, 43, 5, I[3]); disc(g, wx - 1, 42, 3.4, I[4]); disc(g, wx, 43, 1.6, I[1]); box(g, wx - 3, 39, 2, 1, I[5]);
    disc(g, wx + 7, 53, 3.4, INK); disc(g, wx + 7, 53, 2.4, I[2]);
    box(g, wx - 2, 44, 4, 10, INK); box(g, wx - 1, 44, 2, 9, I[1]);
  }
  if (i > 0) { box(g, -58, 31, 12, 6, INK); box(g, -57, 32, 10, 4, I[3]); box(g, -57, 32, 10, 1, I[5]); disc(g, -57, 34, 2.4, I[1]); }
};

/** The hull: scales in rows, the gilt trim, the belly's plates, the lamps' bezels, the lit back. */
const hull = (g: Ctx, P: Pal) => {
  const B = P.B, Bl = P.Bl, G = P.G;
  const pts: [number, number][] = [[-49, 0], [49, 0], [51, 5], [51, 28], [46, 39], [-46, 39], [-51, 28], [-51, 5]];
  inked(g, pts, B[3]);
  // (lit along the top, shaded down to the keel, the seams dithered)
  box(g, -50, 1, 100, 6, B[4]); box(g, -49, 1, 98, 1, B[5]); checker(g, -50, 7, 100, 2, B[4], 0, 1);
  box(g, 46, 4, 4, 22, B[2]); box(g, -50, 4, 2, 22, B[4]);
  // (the scales: rows of little cups, offset row to row, each lit on its crown)
  for (let r = 0; r < 3; r++) {
    const y = 9 + r * 5;
    for (let x = -47 + (r % 2) * 4; x < 46; x += 8) { box(g, x, y + 3, 5, 1, B[1]); box(g, x + 5, y, 1, 4, B[2]); box(g, x + 1, y, 2, 1, B[5]); box(g, x, y + 1, 1, 2, B[4]); }
  }
  // (the gilt trim band, its studs)
  box(g, -51, 22, 102, 4, INK); box(g, -50, 23, 100, 2, G[3]); box(g, -50, 23, 100, 1, G[5]);
  for (let x = -46; x < 48; x += 12) box(g, x, 23, 2, 2, G[1]);
  // (the belly: banded plates, their seams, shading to the keel)
  polyF(g, [[-50, 26], [50, 26], [50, 28], [45, 38], [-45, 38], [-50, 28]], Bl[3]);
  box(g, -50, 26, 100, 2, Bl[4]); checker(g, -48, 33, 96, 2, Bl[2], 0, 1); box(g, -45, 36, 90, 2, Bl[1]);
  for (let x = -44; x < 46; x += 7) box(g, x, 27, 1, 10, Bl[1]);
  // (the lamps' gilt bezels: the gems are live)
  for (let k = 0; k < 4; k++) { const x = -36 + k * 24; box(g, x - 4, 27, 9, 8, INK); box(g, x - 3, 28, 7, 6, G[2]); box(g, x - 3, 28, 7, 1, G[4]); box(g, x - 2, 29, 5, 4, INK); }
};

/** A bat wing folded along the side: wrist at the front, fingers raking back, the membrane scalloped between them. */
const foldedWing = (g: Ctx, P: Pal, x0: number, x1: number) => {
  const W = P.W, B = P.B;
  const tips: [number, number][] = [0, 1, 2, 3].map(k => [x0 + ((x1 - x0) * k) / 4 - 2, 20 + (k % 2) * 2]);
  const mem: [number, number][] = [[x1, 3], [x0 + 6, 3], [x0, 8], [x0 - 2, 20]];
  for (let k = 0; k < tips.length; k++) {
    const [tx, ty] = tips[k], nx = k + 1 < tips.length ? tips[k + 1][0] : x1 - 2;
    mem.push([tx, ty]); mem.push([(tx + nx) / 2, ty - 5]);
  }
  mem.push([x1 - 2, 18]);
  inked(g, mem, W[2]);
  // (the membrane lit along its leading edge, shaded in its scallops)
  box(g, x0 + 4, 4, x1 - x0 - 6, 2, W[3]); box(g, x0 + 4, 4, x1 - x0 - 6, 1, W[4]);
  for (const [tx, ty] of tips) box(g, tx + 2, ty - 4, 6, 2, W[1]);
  checker(g, x0, 15, x1 - x0, 2, W[1], 0, 1);
  // (the finger bones from the wrist)
  g.lineCap = 'round';
  for (const [tx, ty] of tips) { g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x1 - 3, 6); g.lineTo(tx, ty); g.stroke(); g.strokeStyle = B[4]; g.lineWidth = 1.1; g.stroke(); }
  g.lineCap = 'butt';
  // (the wrist and its gilt claw)
  disc(g, x1 - 3, 6, 3.4, INK); disc(g, x1 - 3, 6, 2.4, B[3]); disc(g, x1 - 4, 5, 1, B[5]);
  polyF(g, [[x1 - 2, 3], [x1 + 4, -1], [x1, 5]], P.G[3]);
};

/** The handlebar along the back: brass posts, a bar with leather grips, ball ends (thin and dim: to hold, not stand). */
const handlebar = (g: Ctx, P: Pal) => {
  const G = P.G.map(c => mix(c, '#2A1E3A', 0.22)), L = P.Lt;
  for (const px of [-40, 0, 40]) { box(g, px - 2, -15, 4, 15, INK); box(g, px - 1, -15, 2, 14, G[3]); box(g, px - 1, -15, 1, 14, G[5]); box(g, px - 3, -2, 6, 2, INK); box(g, px - 2, -2, 4, 1, G[2]); }
  box(g, -42, -19, 84, 5, INK); box(g, -41, -18, 82, 3, G[3]); box(g, -41, -18, 82, 1, G[5]); box(g, -41, -16, 82, 1, G[1]);
  for (const gx of [-32, -16, 6, 22]) { box(g, gx, -19, 11, 5, INK); box(g, gx + 1, -18, 9, 3, L[2]); box(g, gx + 1, -18, 9, 1, L[4]); for (let k = 0; k < 3; k++) box(g, gx + 2 + k * 3, -17, 1, 1, L[5]); }
  ballR(g, -43, -17, 2.6, G); ballR(g, 43, -17, 2.6, G);
};

/** The lit back he stands on. */
const back = (g: Ctx, P: Pal) => {
  box(g, -50, -2, 100, 4, INK); box(g, -49, -1, 98, 2, P.lip); box(g, -49, -1, 98, 1, P.lipHi);
  for (let x = -44; x < 46; x += 11) box(g, x, 1, 2, 1, P.B[1]);
};

/** The tail: curled up and back off the rear, tapering, spined, a tip of its own (a flame, a crystal spade, a bolt). */
const tail = (g: Ctx, P: Pal, lane: Lane) => {
  const B = P.B, Bl = P.Bl;
  const q = (t: number): [number, number] => { const a = 1 - t; return [a * a * -44 + 2 * a * t * -104 + t * t * -82, a * a * 16 + 2 * a * t * 14 + t * t * -50]; };
  const n = 16;
  for (let k = n; k >= 0; k--) { const t = k / n, [x, y] = q(t), r = 9 * (1 - t) + 2.6; disc(g, x, y, r + 1.2, INK); }
  for (let k = n; k >= 0; k--) {
    const t = k / n, [x, y] = q(t), r = 9 * (1 - t) + 2.6;
    disc(g, x, y, r, B[3]); disc(g, x - r * 0.25, y - r * 0.3, r * 0.6, B[4]); disc(g, x + r * 0.3, y + r * 0.35, r * 0.45, Bl[3]);
    if (k % 3 === 1 && k < n - 1) { const [nx, ny] = q(Math.min(1, t + 0.06)), a = Math.atan2(ny - y, nx - x); polyF(g, [[x + Math.sin(a) * r, y - Math.cos(a) * r], [x + Math.sin(a) * (r + 6) - Math.cos(a) * 3, y - Math.cos(a) * (r + 6) - Math.sin(a) * 3], [x + Math.sin(a) * r - Math.cos(a) * 5, y - Math.cos(a) * r - Math.sin(a) * 5]], P.Cr[3]); }
  }
  const [tx, ty] = q(1);
  if (lane === 1) {
    // (a flame tuft)
    for (const [dx, dy, s, col] of [[0, -4, 9, P.Cr[2]], [-4, -10, 6, P.Cr[4]], [3, -12, 4, P.Bl[5]]] as const) polyF(g, [[tx - s, ty + 2], [tx + dx, ty + dy - s], [tx + s, ty + 2]], col);
  } else if (lane === 2) {
    // (a crystal spade)
    inked(g, [[tx, ty - 16], [tx + 8, ty - 4], [tx, ty + 4], [tx - 8, ty - 4]], P.Hn[3]);
    polyF(g, [[tx, ty - 16], [tx - 8, ty - 4], [tx, ty - 2]], P.Hn[5]);
  } else {
    // (a lightning bolt)
    inked(g, [[tx - 2, ty - 18], [tx + 7, ty - 18], [tx + 2, ty - 9], [tx + 8, ty - 9], [tx - 4, ty + 6], [tx, ty - 5], [tx - 6, ty - 5]], P.Cr[3]);
    box(g, tx, ty - 17, 4, 2, P.Cr[5]);
  }
};

/** The neck up off the front car's nose and the head out ahead (its mouth about (84, -35): the breath comes out there). */
const head = (g: Ctx, P: Pal, lane: Lane) => {
  const B = P.B, Bl = P.Bl, Hn = P.Hn, Cr = P.Cr;
  // (the neck: an S up off the nose, the throat's plates down its front, scales up its back)
  const neck: [number, number][] = [[32, 1], [36, -18], [38, -36], [44, -52], [56, -52], [56, -40], [52, -24], [51, 1]];
  inked(g, neck, B[3]);
  polyF(g, [[46, 1], [50, -22], [54, -38], [56, -40], [52, -24], [51, 1]], Bl[3]);
  for (let y = -4; y > -40; y -= 5) box(g, 46 + (y < -20 ? 4 : 1), y, 6, 1, Bl[1]);
  polyF(g, [[32, 1], [36, -18], [38, -36], [41, -36], [39, -18], [36, 1]], B[4]);
  for (let k = 0; k < 6; k++) { const y = -6 - k * 8, x = 36 + k * 1.3; polyF(g, [[x, y], [x - 6, y - 4], [x, y - 5]], Cr[3]); }
  // (the skull, the snout out ahead, the jaw dropped open)
  const skull: [number, number][] = [[40, -56], [52, -66], [68, -62], [86, -50], [92, -44], [88, -38], [66, -39], [52, -38], [40, -44]];
  inked(g, skull, B[3]);
  polyF(g, [[42, -56], [52, -65], [68, -61], [86, -49], [70, -55], [54, -58]], B[4]);
  box(g, 54, -63, 10, 1, B[5]);
  polyF(g, [[52, -38], [66, -39], [88, -38], [86, -42], [64, -44], [46, -42]], B[2]);
  const jaw: [number, number][] = [[50, -36], [66, -34], [86, -30], [84, -25], [62, -23], [48, -28]];
  inked(g, jaw, B[2]);
  polyF(g, [[50, -28], [62, -24], [84, -26], [84, -28], [60, -27]], Bl[3]);
  // (the mouth's dark inside, a tongue, the teeth)
  polyF(g, [[56, -38], [87, -38], [85, -31], [60, -33]], '#3A0A12');
  polyF(g, [[62, -34], [80, -33], [76, -31], [64, -32]], mix('#E05A7A', '#3A0A12', 0.2));
  for (let k = 0; k < 5; k++) { const x = 62 + k * 5; polyF(g, [[x, -38], [x + 3, -38], [x + 1.5, -34.5]], '#FFF8E8'); polyF(g, [[x + 2, -32], [x + 5, -32], [x + 3.5, -35]], '#F2E6CC'); }
  // (the nostril, steaming; the brow ridge, the eye under it: lit, a slit pupil)
  box(g, 85, -47, 3, 2, INK);
  polyF(g, [[52, -58], [66, -58], [70, -54], [54, -53]], B[1]);
  box(g, 57, -54, 9, 6, INK); box(g, 58, -53, 7, 4, P.eye); box(g, 61, -53, 2, 4, INK); box(g, 58, -53, 2, 1, '#FFFFFF');
  // (the cheek frill: three spines back)
  for (let k = 0; k < 3; k++) polyF(g, [[46, -46 + k * 4], [32 - k * 3, -50 + k * 7], [44, -42 + k * 4]], Cr[2 + (k % 2)]);
  // (the horns, by dragon)
  if (lane === 1) {
    // (ivory, curved back and up, banded)
    for (const [bx, by, ex, ey, w] of [[46, -60, 20, -86, 5], [56, -63, 38, -92, 4]] as const) {
      const pts: [number, number][] = [[bx - w, by], [(bx + ex) / 2 - w - 4, (by + ey) / 2 + 2], [ex, ey], [(bx + ex) / 2 + 2, (by + ey) / 2 + 4], [bx + w, by + 2]];
      inked(g, pts, Hn[3]); polyF(g, [[bx - w, by], [(bx + ex) / 2 - w - 4, (by + ey) / 2 + 2], [ex, ey], [(bx + ex) / 2 - 2, (by + ey) / 2]], Hn[4]);
      for (let k = 1; k < 4; k++) { const u = k / 4; box(g, bx + (ex - bx) * u - 3, by + (ey - by) * u, 5, 1, Hn[1]); }
    }
  } else if (lane === 2) {
    // (crystal: straight, faceted, and an icicle beard under the jaw)
    for (const [bx, by, ex, ey] of [[46, -60, 24, -90], [58, -63, 46, -96]] as const) {
      inked(g, [[bx - 4, by], [ex, ey], [bx + 4, by + 2]], Hn[3]); polyF(g, [[bx - 4, by], [ex, ey], [bx, by + 1]], Hn[5]);
    }
    for (let k = 0; k < 6; k++) { const x = 54 + k * 5, l = 6 + ((k * 7) % 4) * 2; inked(g, [[x, -24], [x + 3.5, -24], [x + 1.6, -24 + l]], Hn[3]); box(g, x + 1, -24, 1, l - 2, Hn[5]); }
  } else {
    // (zigzag antlers, purple, tipped gold; a crest of spikes down the skull)
    for (const [bx, by, s] of [[46, -60, 1], [58, -63, 0.85]] as const) {
      const pts: [number, number][] = [[bx, by], [bx - 10 * s, by - 10 * s], [bx - 4 * s, by - 13 * s], [bx - 16 * s, by - 26 * s], [bx - 8 * s, by - 22 * s], [bx - 6 * s, by - 34 * s]];
      g.lineCap = 'round'; g.lineJoin = 'round';
      g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      g.strokeStyle = Hn[3]; g.lineWidth = 3.6; g.stroke(); g.strokeStyle = Hn[5]; g.lineWidth = 1; g.stroke();
      g.lineCap = 'butt'; g.lineJoin = 'miter';
      disc(g, pts[5][0], pts[5][1], 2.4, P.G[4]);
    }
    for (let k = 0; k < 4; k++) polyF(g, [[64 + k * 6, -61 + k * 3], [62 + k * 6, -70 + k * 3], [68 + k * 6, -60 + k * 3]], Cr[3]);
  }
};

/** The whole still car (local, origin its roof's middle). */
export const paintDragon = (g: Ctx, lane: Lane, i: number, char: boolean) => {
  const P = palOf(lane, char);
  chassis(g, P, i);
  if (i === 0) tail(g, P, lane);
  hull(g, P);
  if (i === 1) foldedWing(g, P, -36, 30);
  else if (i === 2) foldedWing(g, P, -40, 18);
  else foldedWing(g, P, -24, 22);
  if (i === 2) head(g, P, lane);
  back(g, P);
  handlebar(g, P);
};

// ---------------------------------------------------------------------------------------------------------------
// The sprites (per lane, car, char and hour)

const sprites = new Map<string, HTMLCanvasElement>();
/** (off out of Fairy Land: landCaches.ts) */
export const clearDragonSprites = () => sprites.clear();
const sprite = (lane: Lane, i: number, char: boolean) => {
  if (typeof document === 'undefined') return null;
  const key = `${lane}-${i}-${char ? 1 : 0}-${timeOfDay().key}`;
  let cv = thisHour(sprites).get(key);
  if (!cv) {
    if (sprites.size > 60) sprites.clear();
    cv = document.createElement('canvas'); cv.width = SPR.w * RES; cv.height = SPR.h * RES;
    const g = cv.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    g.setTransform(RES, 0, 0, RES, -SPR.x * RES, -SPR.y * RES);
    paintDragon(g, lane, i, char);
    sprites.set(key, cv);
  }
  return cv;
};

/** A spare's bat wings, spread and beating (behind the middle car). */
const spreadWings = (c: Ctx, lane: Lane, f: number) => {
  const P = palOf(lane, false), a = Math.sin(f * 0.45) * 0.6;
  for (const side of [-1, 1]) {
    c.save(); c.translate(side * 26, -4); c.rotate(side * (0.35 + a));
    const tips: [number, number][] = [[side * 150, -58], [side * 128, -8], [side * 98, -26], [side * 66, 4]];
    c.fillStyle = INK; c.beginPath(); c.moveTo(0, 0); c.lineTo(side * 40, -50); tips.forEach(([x, y]) => c.lineTo(x, y)); c.closePath(); c.fill();
    c.fillStyle = P.W[2]; c.beginPath(); c.moveTo(side * 3, -1); c.lineTo(side * 40, -47); c.lineTo(side * 146, -55); c.lineTo(side * 126, -10); c.lineTo(side * 98, -24); c.lineTo(side * 66, 1); c.closePath(); c.fill();
    c.fillStyle = P.W[3]; c.beginPath(); c.moveTo(side * 6, -4); c.lineTo(side * 40, -47); c.lineTo(side * 146, -55); c.lineTo(side * 60, -36); c.closePath(); c.fill();
    c.strokeStyle = P.B[4]; c.lineWidth = 2;
    for (const [x, y] of tips) { c.beginPath(); c.moveTo(side * 40, -47); c.lineTo(x, y); c.stroke(); }
    c.restore();
  }
};

/** A car put down: the sprite (or painted live where there's no canvas), then its live bits. `danger` its lamps and eye
 *  flashing red (a hole coming on its track); `wings` (a spare coming down) its bat wings out and beating; `char`
 *  burnt black. */
export const paintCar = (c: Ctx, lane: Lane, i: number, f: number, opts: { danger?: boolean; wings?: boolean; char?: boolean } = {}) => {
  if (opts.wings && i === 1) spreadWings(c, lane, f);
  const cv = sprite(lane, i, !!opts.char);
  if (cv) {
    const sm = c.imageSmoothingEnabled;
    c.imageSmoothingEnabled = true;
    c.drawImage(cv, SPR.x, SPR.y, SPR.w, SPR.h);
    c.imageSmoothingEnabled = sm;
  } else paintDragon(c, lane, i, !!opts.char);
  if (opts.char) return;
  const L = LOOKS[lane];
  // (the gem lamps: chasing along in the dragon's colors, or flashing red)
  for (let k = 0; k < 4; k++) {
    const x = -36 + k * 24, on = opts.danger ? f % 12 < 6 : (f / 6 + k + i * 4) % 8 < 4;
    const col = opts.danger ? (on ? '#FF4A4A' : '#5A0A0A') : on ? mix(L.belly, '#FFFFFF', 0.4) : mix(L.wing, '#000000', 0.2);
    box(c, x - 2, 29, 5, 4, col);
    if (on) box(c, x - 1, 29, 2, 1, '#FFFFFF');
  }
  if (i !== 2) return;
  // (the eye red with the danger; a glint now and then)
  if (opts.danger && f % 12 < 6) box(c, 58, -53, 7, 4, '#FF3030');
  else if (f % 90 < 4) box(c, 58, -53, 3, 2, '#FFFFFF');
  // (its breath, idling: fire puffs, frost glitter, sparks; the nostril steaming)
  const ph = f % 30;
  if (ph < 14) {
    const bx = 90, by = -35;
    if (lane === 1) for (let k = 0; k < 4; k++) box(c, bx + k * 6, by - 2 + ((f + k) % 3) - k, 6 - k, 5 - (k >> 1), ['#FFF6B0', '#FDE047', '#F97316', '#B91C1C'][k]);
    else if (lane === 2) for (let k = 0; k < 4; k++) { box(c, bx + k * 7, by - k * 2 + ((f >> 1) + k) % 3, 3, 3, '#E0F2FE'); if ((f + k) % 5 === 0) box(c, bx + k * 7 - 1, by - k * 2 + 1, 5, 1, '#FFFFFF'); }
    else { c.strokeStyle = (f >> 1) % 2 ? '#FFFFFF' : '#FEF08A'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 6, by - 6); c.lineTo(bx + 10, by + 2); c.lineTo(bx + 18, by - 5); c.stroke(); }
  }
  if (lane !== 2 && f % 40 < 20) { const u = (f % 40) / 20; c.globalAlpha = 0.5 * (1 - u); box(c, 88 + u * 6, -50 - u * 8, 3 + u * 3, 3 + u * 2, lane === 1 ? '#78716C' : '#E9D5FF'); c.globalAlpha = 1; }
};

/** A train's length in cars, for anybody laying them out by hand (the deaths). */
export const DRAGON_CAR = CAR;
