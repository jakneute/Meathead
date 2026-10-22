// THE CIRCUS LION, painted (the final pass: peak SNES, matched to Tucker's beasts (arena/beasts.ts) and Artie's
// stampede): each material its own seven-step ramp down to its line tone; stepped bands down each mass, fur-stepped at
// the seams with a dither row; the haunch and shoulder lit over the bands, the ribs and the flank's hollow shaded, fur
// ticked along the back. A full mane in layered locks (three layers, back to front; each lock dark at the root, lit
// toward its tip), a broad muzzle with its whisker pads, the nose leather, golden eyes; jaws open on fangs and a
// curled tongue when it roars. Legs built the way a cat's are: the hind leg hip -> stifle (forward) -> hock (back) ->
// paw, the foreleg shoulder -> elbow (back) -> wrist -> paw, each joint from limb.ts; the walk a lateral sequence and
// the run a rotary gallop, paws planted through their stance and folded up through their swing. The circus kit: the
// little red fez (its gold tassel swinging) and the red studded collar with its gold tag.
//
// Every frame of every pose painted once into a stamp (the engine's stamp cache, lazily) and put down with a drawImage.

import { stamp } from '../../../m1/game/render/stamp';
import { elbow, knee, reachTo } from '../../art/limb';

type Ctx = CanvasRenderingContext2D;
type R7 = readonly [string, string, string, string, string, string, string];
type Pt = [number, number];

const LION: R7 = ['#FCE6B0', '#F0CC84', '#DCAE5E', '#C48E42', '#A06E2E', '#74481C', '#341C08'];
const LION_FAR: R7 = [LION[1], LION[2], LION[3], LION[4], LION[5], LION[5], LION[6]];
const PALE: R7 = ['#FFF8E8', '#F8EAC8', '#ECD6A6', '#D6BA84', '#B49464', '#806440', '#3C2C18'];
const MANE: R7 = ['#F4B460', '#D88E40', '#B4682A', '#8E481A', '#68300E', '#421C08', '#1E0C04'];
const MANE_BACK: R7 = [MANE[1], MANE[2], MANE[3], MANE[4], MANE[5], MANE[5], MANE[6]];
const MANE_FRONT: R7 = ['#FFD488', MANE[0], MANE[1], MANE[2], MANE[3], MANE[4], MANE[6]];
const TUFT: R7 = ['#6A4026', '#52301A', '#3E2212', '#2E180C', '#201008', '#160A04', '#0A0402'];
const FEZ: R7 = ['#FFB0A8', '#F87171', '#DC2626', '#B91C1C', '#8A1414', '#5F0F0F', '#2A0606'];
const GOLD: R7 = ['#FFF8D0', '#FFE680', '#F2C84A', '#C8962E', '#9A6A1C', '#6A4410', '#3A2408'];
const HORN: R7 = ['#FFFCF0', '#F2EAD6', '#DCCFB2', '#BCAE8E', '#968868', '#6A5E46', '#2E281C'];
const NOSE = ['#B07068', '#8A4A46', '#5E2C2A', '#2A1010'];
const EYE = ['#FFE080', '#F2B830', '#C8861C', '#1A0E06'];
const TOOTH = '#FBF6E8', GUM = '#B0404A', TONGUE = ['#F4A0A8', '#D8606A', '#A83A46'], MOUTH = '#3A0A10';
const BLOOD = ['#5F0F0F', '#7F1D1D', '#B91C1C', '#DC2626'];

// ---------------------------------------------------------------------------------------------------------------
// The kit

const h01 = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const dithers = new Map<string, CanvasPattern | string>();
const dith = (c: Ctx, color: string): CanvasPattern | string => {
  let p = dithers.get(color);
  if (p) return p;
  if (typeof document === 'undefined') return color;
  const cv = document.createElement('canvas'); cv.width = 2; cv.height = 2;
  const g = cv.getContext('2d')!;
  g.fillStyle = color; g.fillRect(0, 0, 1, 1); g.fillRect(1, 1, 1, 1);
  p = c.createPattern(cv, 'repeat') ?? color;
  dithers.set(color, p);
  return p;
};
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string | CanvasPattern, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.05, rx), Math.max(0.05, ry), rot, 0, Math.PI * 2); c.fill(); };
const line = (c: Ctx, pts: number[], w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); };
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const tri = (c: Ctx, a: number, b: number, d: number, e: number, f: number, g: number, col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.lineTo(f, g); c.closePath(); c.fill(); };

/** A mass in its ramp, lit from above: banded light to dark down y0..y1, each seam fur-stepped, its line tone round it. */
const coat = (c: Ctx, path: () => void, r: R7, x0: number, x1: number, y0: number, y1: number, lw = 1.1, seed = 0) => {
  c.beginPath(); path(); c.fillStyle = r[3]; c.fill();
  c.save(); c.clip();
  const h = y1 - y0, stops = [-0.2, 0.12, 0.28, 0.5, 0.7, 0.86, 1.3];
  for (let i = 0; i < 6; i++) { const ya = y0 + h * stops[i], yb = y0 + h * stops[i + 1]; c.fillStyle = r[i]; c.fillRect(x0 - 3, ya, x1 - x0 + 6, yb - ya + 1); }
  for (let i = 1; i < 6; i++) {
    const ys = y0 + h * stops[i];
    c.fillStyle = dith(c, r[i - 1]); c.fillRect(x0 - 3, ys, x1 - x0 + 6, 1.2);
    c.fillStyle = r[i - 1];
    for (let x = Math.floor(x0); x < x1; x += 2) { const k = h01(x * 0.37 + i * 11 + seed); if (k > 0.5) c.fillRect(x, ys, 1, 1 + k * 2.6); }
  }
  c.restore();
  c.beginPath(); path(); c.strokeStyle = r[6]; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke();
};
/** A muscle mass lit over the bands (inside the body's clip): stepped, a dither ring round its lit core. */
const mass = (c: Ctx, x: number, y: number, rx: number, ry: number, r: R7, k = 1) => {
  ell(c, x, y, rx, ry, dith(c, r[k + 1])); ell(c, x - rx * 0.1, y - ry * 0.12, rx * 0.8, ry * 0.76, r[k + 1]);
  ell(c, x - rx * 0.24, y - ry * 0.28, rx * 0.46, ry * 0.4, r[k]);
};
/** A tapered run between two points (wa wide at a, wb at b), its ends rounded. */
const taper = (c: Ctx, ax: number, ay: number, bx: number, by: number, wa: number, wb: number, col: string) => {
  const L = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / L, ny = (bx - ax) / L;
  c.fillStyle = col; c.beginPath();
  c.moveTo(ax + nx * wa / 2, ay + ny * wa / 2); c.lineTo(bx + nx * wb / 2, by + ny * wb / 2); c.lineTo(bx - nx * wb / 2, by - ny * wb / 2); c.lineTo(ax - nx * wa / 2, ay - ny * wa / 2);
  c.closePath(); c.fill();
  c.beginPath(); c.ellipse(ax, ay, wa / 2, wa / 2, 0, 0, Math.PI * 2); c.ellipse(bx, by, wb / 2, wb / 2, 0, 0, Math.PI * 2); c.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// The rig: everything at its place (feet at the origin, facing right, the ground at y 0), per pose and frame

export type LionPose = 'stand' | 'walk' | 'run' | 'pounce' | 'land' | 'roar' | 'maul' | 'settle' | 'chew';

interface Rig {
  /** The hind legs' root (the hip) and the forelegs' (the shoulder): the body hangs between them. */
  H: Pt; S: Pt;
  /** The skull's middle and its tip (+ down), the jaws open (0..1.2), the snarl (0..1). */
  head: Pt; ha: number; open: number; snarl: number;
  /** The paws (far hind, far fore, near hind, near fore) and each lower bone's angle off straight down (+ forward). */
  paws: Pt[]; pa: number[];
  /** The tail's three points past its root (off the rump). */
  tail: number[];
  claws: boolean; eye: 0 | 1 | 2; sweep: number; tassel: number;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpRig = (a: Rig, b: Rig, k: number): Rig => ({
  H: [lerp(a.H[0], b.H[0], k), lerp(a.H[1], b.H[1], k)], S: [lerp(a.S[0], b.S[0], k), lerp(a.S[1], b.S[1], k)],
  head: [lerp(a.head[0], b.head[0], k), lerp(a.head[1], b.head[1], k)], ha: lerp(a.ha, b.ha, k), open: lerp(a.open, b.open, k), snarl: lerp(a.snarl, b.snarl, k),
  paws: a.paws.map((p, i) => [lerp(p[0], b.paws[i][0], k), lerp(p[1], b.paws[i][1], k)] as Pt), pa: a.pa.map((v, i) => lerp(v, b.pa[i], k)),
  tail: a.tail.map((v, i) => lerp(v, b.tail[i], k)), claws: k < 0.5 ? a.claws : b.claws, eye: k < 0.5 ? a.eye : b.eye,
  sweep: lerp(a.sweep, b.sweep, k), tassel: lerp(a.tassel, b.tassel, k),
});

const frac = (v: number) => ((v % 1) + 1) % 1;
const smooth = (s: number) => s * s * (3 - 2 * s);
/** A paw through its cycle (q 0..1 from its stance starting): planted and drawn back under it through the stance (`duty`
 *  of it), lifted and swung forward through the rest; its lower bone's angle (the toe-off, the paw folded up in the
 *  swing). */
const step = (q: number, home: number, S: number, duty: number, lift: number, hind: boolean, fold: number): { p: Pt; a: number } => {
  const a0 = hind ? 0.2 : 0.25;
  if (q < duty) {
    const s = q / duty;
    const a = hind ? a0 + 0.55 * Math.max(0, s - 0.6) / 0.4 : a0 - 0.9 * Math.max(0, s - 0.7) / 0.3;
    return { p: [home + S / 2 - S * s, -3], a };
  }
  const s = (q - duty) / (1 - duty), up = Math.sin(Math.PI * s);
  return { p: [home - S / 2 + S * smooth(s), -3 - lift * up * (s < 0.5 ? 1 : 0.8 + 0.2 * (1 - s))], a: a0 - fold * Math.sin(Math.PI * Math.min(1, s * 1.25)) };
};

const rig = (pose: LionPose, ph: number, k: number): Rig => {
  const T = Math.PI * 2, w = Math.sin(ph * T);
  const base = (): Rig => ({
    H: [-32, -37], S: [24, -38], head: [47, -48], ha: 0.05, open: 0, snarl: 0,
    paws: [[-27, -3], [30, -3], [-33, -3], [25, -3]], pa: [0.2, 0.25, 0.2, 0.25],
    tail: [-8, 10, -15, 24, -10 + w * 4, 36], claws: false, eye: 0, sweep: 0, tassel: w * 1.5,
  });
  switch (pose) {
    case 'stand': {
      const r = base(), br = Math.sin(ph * T) * 0.6;
      r.S = [24, -38 + br * 0.5]; r.head = [47, -48 + br * 0.4];
      r.tail = [-8, 10, -16 + w * 2, 24, -12 + w * 6, 35 - Math.abs(w) * 2];
      return r;
    }
    case 'walk': {
      // (a lateral-sequence walk: near hind, near fore, far hind, far fore, a quarter beat apart)
      const r = base(), bob = Math.cos(ph * T * 2) * 0.9;
      const S = 30, D = 0.62;
      const fh = step(frac(ph + 0.5), -28, S, D, 6, true, 0.8), ff = step(frac(ph + 0.75), 30, S, D, 7, false, 1.4);
      const nh = step(frac(ph), -32, S, D, 6, true, 0.8), nf = step(frac(ph + 0.25), 26, S, D, 7, false, 1.4);
      r.paws = [fh.p, ff.p, nh.p, nf.p]; r.pa = [fh.a, ff.a, nh.a, nf.a];
      r.H = [-32, -37 + bob]; r.S = [24, -38 - bob * 0.6]; r.head = [48, -46 - bob * 0.3]; r.ha = 0.12;
      r.tail = [-9, 9, -18 + w * 3, 20, -20 + w * 7, 32];
      r.tassel = Math.sin(ph * T * 2) * 2;
      return r;
    }
    case 'run': {
      // (a rotary gallop: the hinds down one after the other, then the fores; the back flexing, gathered then flung out)
      const r = base(), fl = Math.sin(ph * T), rock = Math.sin(ph * T + 0.8);
      const S = 52, D = 0.32;
      const nh = step(frac(ph), -30, S, D, 11, true, 1.1), fh = step(frac(ph - 0.1), -27, S, D, 11, true, 1.1);
      const ff = step(frac(ph - 0.45), 30, S, D, 13, false, 1.8), nf = step(frac(ph - 0.56), 27, S, D, 13, false, 1.8);
      r.paws = [fh.p, ff.p, nh.p, nf.p]; r.pa = [fh.a, ff.a, nh.a, nf.a];
      r.H = [-32 - fl * 4, -39 + rock * 2.4]; r.S = [24 + fl * 4, -39 - rock * 2.4];
      r.head = [51 + fl * 3, -45 - rock * 1.4]; r.ha = 0.12; r.open = 0.4; r.snarl = 0.3;
      r.tail = [-12, -1, -26, -4 + rock * 3, -40, -9 + rock * 6];
      r.sweep = 0.45; r.tassel = -4;
      return r;
    }
    case 'pounce': {
      // (out of the leap: launched nose up, stretched out flat over the top, reaching down onto him)
      const P: Rig[] = [
        { ...base(), H: [-30, -38], S: [24, -52], head: [46, -61], ha: -0.2, open: 0.6, snarl: 0.7, paws: [[-50, -10], [40, -62], [-55, -6], [44, -58]], pa: [0.9, -0.6, 0.9, -0.6], tail: [-10, 4, -22, 4, -34, 0], claws: true, eye: 1, sweep: 0.4, tassel: -5 },
        { ...base(), H: [-32, -41], S: [24, -48], head: [48, -56], ha: -0.1, open: 0.9, snarl: 1, paws: [[-56, -18], [56, -56], [-60, -14], [60, -52]], pa: [1.1, 0.6, 1.1, 0.6], tail: [-12, 0, -26, -4, -40, -10], claws: true, eye: 1, sweep: 0.55, tassel: -6 },
        { ...base(), H: [-32, -43], S: [24, -43], head: [50, -49], ha: 0.05, open: 1, snarl: 1, paws: [[-55, -26], [60, -42], [-58, -22], [64, -38]], pa: [1.2, 0.8, 1.2, 0.8], tail: [-12, -2, -26, -8, -40, -16], claws: true, eye: 1, sweep: 0.6, tassel: -6 },
        { ...base(), H: [-30, -44], S: [24, -42], head: [49, -48], ha: 0.3, open: 1, snarl: 1, paws: [[-46, -24], [54, -42], [-49, -20], [58, -38]], pa: [1.1, 0.7, 1.1, 0.7], tail: [-12, -6, -26, -14, -38, -24], claws: true, eye: 1, sweep: 0.5, tassel: -5 },
      ];
      return P[Math.max(0, Math.min(3, k))];
    }
    case 'land': {
      // (down on his back: the hinds come down to the ties, the weight onto him as he goes over; into the maul)
      const hit: Rig = { ...base(), H: [-29, -40], S: [24, -43], head: [47, -48], ha: 0.45, open: 0.9, snarl: 1, paws: [[-40, -16], [52, -38], [-44, -12], [56, -34]], pa: [0.7, 0.7, 0.7, 0.7], tail: [-12, -6, -24, -16, -34, -26], claws: true, eye: 1, sweep: 0.2, tassel: -3 };
      return k <= 0 ? hit : lerpRig(hit, rig('maul', 0, 0), Math.min(1, k / 3));
    }
    case 'maul': {
      const sh = Math.sin(ph * T * 2), up = Math.abs(sh);
      return {
        ...base(), H: [-28, -40], S: [28, -38 + w * 2], head: [64 + sh * 2, -32 + up * 3], ha: 0.6 + sh * 0.14, open: 0.25 + 0.65 * Math.abs(Math.sin(ph * T * 2 + 0.6)), snarl: 1,
        paws: [[-22, -3], [48 + w * 4, -26], [-30, -3], [56 - w * 4, -25 - Math.max(0, w) * 4]], pa: [0.3, 0.7, 0.3, 0.7 - Math.max(0, w) * 0.4],
        tail: [-10, -6, -22, -14 + w * 4, -30, -24 + w * 8], claws: true, eye: 1, sweep: 0, tassel: sh * 3,
      };
    }
    case 'chew':
    case 'settle': {
      // (lying on what's left of him, the forepaws out over him, chewing)
      const ch = Math.abs(Math.sin(ph * T)) * 0.4;
      const r: Rig = {
        ...base(), H: [-22, -25], S: [30, -28], head: [62, -24 + ch * 3], ha: 0.55, open: ch, snarl: 0.2,
        paws: [[-8, -2], [52, -14], [-2, 0], [58, -12]], pa: [1.4, 1.2, 1.4, 1.2],
        tail: [-10, 10, -24, 15, -34, 11 + w * 3], claws: false, eye: 0, sweep: 0, tassel: w,
      };
      return pose === 'settle' ? lerpRig(rig('maul', 0, 0), r, Math.min(1, k / 3)) : r;
    }
    case 'roar': {
      // (head up at him, the jaws thrown wide: a one-shot, `k` its frame)
      const O = [0.3, 0.8, 1.1, 1.15, 0.95, 0.4][Math.max(0, Math.min(5, k))];
      return {
        ...base(), H: [-30, -36], S: [24, -37], head: [47, -46], ha: -0.42 - O * 0.04, open: O, snarl: Math.min(1, O + 0.2),
        paws: [[-26, -3], [32, -3], [-34, -3], [26, -3]],
        tail: [-10, -4, -20, -14 + w * 3, -24, -26 + w * 6], eye: O > 0.6 ? 1 : 0, tassel: -O * 3 + w,
      };
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The parts

/** A leg: root -> joint -> joint -> paw (hind: hip, stifle forward, hock back; fore: shoulder, elbow back, wrist), its
 *  line tone, itself, lit down its back edge, shaded down the front; the muscle at its top; the big paw, toes, claws. */
const leg = (c: Ctx, root: Pt, end: Pt, a: number, hind: boolean, R: R7, claws: boolean, sz: number, bloody: number) => {
  const [l1, l2, l3] = hind ? [15, 15, 11] : [15, 17, 6];
  const lx = Math.sin(a) * l3, ly = Math.cos(a) * l3;
  const lo = reachTo(root[0], root[1], end[0] - lx, end[1] - ly, l1, l2);
  const mid = hind ? knee(root[0], root[1], lo[0], lo[1], l1, l2, 1) : elbow(root[0], root[1], lo[0], lo[1], l1, l2, 1);
  const P = [root, mid, lo, [lo[0] + lx, lo[1] + ly] as Pt];
  const W = (hind ? [14, 9, 5.6, 5] : [12, 9, 6.4, 6]).map(v => v * sz);
  for (let i = 0; i < 3; i++) taper(c, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], W[i] + 2, W[i + 1] + 2, R[6]);
  for (let i = 0; i < 3; i++) taper(c, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], W[i], W[i + 1], R[3]);
  for (let i = 0; i < 3; i++) {
    const [ax, ay] = P[i], [bx, by] = P[i + 1], L = Math.hypot(bx - ax, by - ay) || 1;
    let nx = -(by - ay) / L, ny = (bx - ax) / L;
    if (nx + ny > 0) { nx = -nx; ny = -ny; }
    const wa = W[i], wb = W[i + 1];
    taper(c, ax - nx * wa * 0.3, ay - ny * wa * 0.3, bx - nx * wb * 0.3, by - ny * wb * 0.3, wa * 0.32, wb * 0.32, R[4]);
    taper(c, ax - nx * wa * 0.4, ay - ny * wa * 0.4, bx - nx * wb * 0.4, by - ny * wb * 0.4, wa * 0.12, wb * 0.12, R[5]);
    taper(c, ax + nx * wa * 0.2, ay + ny * wa * 0.2, bx + nx * wb * 0.2, by + ny * wb * 0.2, wa * 0.3, wb * 0.3, R[2]);
    taper(c, ax + nx * wa * 0.3, ay + ny * wa * 0.3, bx + nx * wb * 0.3, by + ny * wb * 0.3, wa * 0.1, wb * 0.1, R[1]);
  }
  // (the muscle down the top of it: the gaskin behind the stifle, the forearm's bulge under the elbow; the joints' knobs)
  const mx = lerp(P[1][0], P[2][0], hind ? 0.25 : 0.3), my = lerp(P[1][1], P[2][1], hind ? 0.25 : 0.3);
  ell(c, mx, my, W[1] * 0.5, W[1] * 0.62, dith(c, R[2])); ell(c, mx - 0.4, my - 0.6, W[1] * 0.3, W[1] * 0.4, R[2]);
  ell(c, P[2][0] - 0.4, P[2][1] - 0.4, W[2] * 0.36, W[2] * 0.3, R[1]);
  if (hind) ell(c, P[2][0] - 1, P[2][1], 1.4, 1.2, R[5]);
  // (the paw: big and round, its toes, lit across the top; claws out)
  const [fx, fy] = P[3], r = (hind ? 4.2 : 4.8) * sz;
  ell(c, fx + r * 0.3, fy, r * 1.3 + 1, r * 0.78 + 1, R[6]); ell(c, fx + r * 0.3, fy, r * 1.3, r * 0.78, R[3]);
  ell(c, fx + r * 0.2, fy - r * 0.26, r * 1.02, r * 0.4, R[2]); ell(c, fx, fy - r * 0.36, r * 0.6, r * 0.22, R[1]);
  for (let t = 0; t < 3; t++) px(c, fx + r * (0.1 + t * 0.42), fy - r * 0.1, 0.8, r * 0.7, R[5]);
  if (claws) for (let t = 0; t < 3; t++) {
    const cx = fx + r * (0.5 + t * 0.4), cy = fy + r * 0.3, L = 4 * sz;
    c.fillStyle = HORN[6]; c.beginPath(); c.moveTo(cx - 1, cy - 0.6); c.quadraticCurveTo(cx + L * 0.9, cy - 0.4, cx + L, cy + L * 0.7); c.lineTo(cx + 0.4, cy + 1.2); c.closePath(); c.fill();
    c.fillStyle = HORN[1]; c.beginPath(); c.moveTo(cx - 0.4, cy - 0.1); c.quadraticCurveTo(cx + L * 0.75, cy, cx + L - 0.5, cy + L * 0.6); c.lineTo(cx + 0.3, cy + 0.6); c.closePath(); c.fill();
  }
  if (bloody > 0 && !hind) { c.globalAlpha = Math.min(1, bloody); ell(c, fx + r * 0.3, fy - 0.6, r * 1.1, r * 0.55, BLOOD[1]); ell(c, fx + r * 0.6, fy - 1, r * 0.5, r * 0.26, BLOOD[3]); line(c, [P[2][0], P[2][1], fx, fy - 1], 1.2, BLOOD[0]); c.globalAlpha = 1; }
};

/** The tail: tapered from the root, lit along its top; the dark tuft at its end in locks. */
const tail = (c: Ctx, root: Pt, rel: number[]) => {
  const pts = [root[0], root[1], root[0] + rel[0], root[1] + rel[1], root[0] + rel[2], root[1] + rel[3], root[0] + rel[4], root[1] + rel[5]];
  const P: Pt[] = [];
  for (let i = 0; i + 3 < pts.length; i += 2) for (let s = 0; s < 6; s++) { const u = s / 6; P.push([pts[i] + (pts[i + 2] - pts[i]) * u, pts[i + 1] + (pts[i + 3] - pts[i + 1]) * u]); }
  P.push([pts[6], pts[7]]);
  const rad = (i: number) => 3.6 + (1.8 - 3.6) * (i / (P.length - 1));
  for (const [col, dy, s, add] of [[LION[6], 0, 1, 1], [LION[3], 0, 1, 0], [LION[5], 0.45, 0.55, 0], [LION[2], -0.4, 0.5, 0], [LION[1], -0.6, 0.2, 0]] as const) {
    P.forEach(([x, y], i) => { const rr = rad(i); ell(c, x, y + dy * rr, rr * s + add, rr * s + add, col); });
  }
  // (the tuft: locks fanned on along the tail's way)
  const [ex, ey] = P[P.length - 1], [qx, qy] = P[P.length - 3], dir = Math.atan2(ey - qy, ex - qx);
  for (let i = 0; i < 5; i++) lock(c, ex - Math.cos(dir) * 2, ey - Math.sin(dir) * 2, dir + (i - 2) * 0.32, 7 + h01(i + 3) * 3, 4.4, TUFT, (i - 2) * 0.6);
};

/** A lock of mane from (x, y) at angle `a`, `len` long, `wid` wide at its root, curled `curl` to one side: its line tone
 *  round it, dark at the root, lit toward its tip. */
const lock = (c: Ctx, x: number, y: number, a: number, len: number, wid: number, R: R7, curl: number) => {
  const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
  const path = (s0: number, wk: number, side: number) => {
    const bx = x + dx * len * s0, by = y + dy * len * s0, w = wid * (1 - s0 * 0.55) * wk;
    const tx = x + dx * len + nx * curl, ty = y + dy * len + ny * curl;
    const mx = (bx + tx) / 2 + nx * curl * 0.6, my = (by + ty) / 2 + ny * curl * 0.6;
    c.beginPath();
    c.moveTo(bx + nx * w / 2 * (side >= 0 ? 1 : 0.2), by + ny * w / 2 * (side >= 0 ? 1 : 0.2));
    c.quadraticCurveTo(mx + nx * w * 0.5, my + ny * w * 0.5, tx, ty);
    c.quadraticCurveTo(mx - nx * w * 0.4, my - ny * w * 0.4, bx - nx * w / 2 * (side <= 0 ? 1 : 0.2), by - ny * w / 2 * (side <= 0 ? 1 : 0.2));
    c.closePath();
  };
  path(0, 1, 0); c.fillStyle = R[4]; c.fill(); c.strokeStyle = R[6]; c.lineWidth = 1; c.lineJoin = 'round'; c.stroke();
  path(0.3, 0.8, 0); c.fillStyle = R[3]; c.fill();
  path(0.55, 0.6, 0); c.fillStyle = R[2]; c.fill();
  // (lit along the side the light's from: up, back)
  const lit = (nx + ny < 0 ? 1 : -1);
  path(0.45, 0.45, lit); c.fillStyle = R[1]; c.fill();
  if (dy < 0.2) { path(0.7, 0.22, lit); c.fillStyle = R[0]; c.fill(); }
};

/** The mane round the head (hx, hy): three layers of locks fanned from over the brow, round the back of the head, down
 *  under the jaw over the chest; longest down the neck and chest. `sweep` blows it back (running). */
const mane = (c: Ctx, hx: number, hy: number, sweep: number, seed: number) => {
  const cx = hx - 6, cy = hy + 3;
  const layer = (n: number, r0: number, len: number, wid: number, R: R7, from: number, span: number, s: number) => {
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), j = h01(i * 7.1 + s + seed);
      const a0 = (from - span * t) * Math.PI / 180 + (j - 0.5) * 0.24;
      let dx = Math.cos(a0) - sweep, dy = Math.sin(a0);
      const dl = Math.hypot(dx, dy); dx /= dl; dy /= dl;
      const up = Math.max(0, -dy), dn = Math.max(0, dy);
      const L = len * (1 - 0.32 * up - 0.05 * dn) * (0.85 + j * 0.3);
      lock(c, cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0 * 1.1, Math.atan2(dy, dx), L, wid * (0.9 + j * 0.25), R, (j - 0.5) * 5 + (dy > 0 ? -1.5 : 1.5));
    }
  };
  layer(16, 8.5, 16.5, 9, MANE_BACK, -70, 240, 1);
  layer(14, 8, 14, 8, MANE, -82, 225, 2);
};
/** The ruff round the face: the shortest, lightest locks over the brow and the cheeks and under the jaw. */
const ruff = (c: Ctx, hx: number, hy: number, sweep: number, seed: number) => {
  const cx = hx - 3, cy = hy + 1;
  for (let i = 0; i < 12; i++) {
    const t = i / 11, j = h01(i * 3.9 + 5 + seed);
    const a0 = (-100 - 190 * t) * Math.PI / 180 + (j - 0.5) * 0.2;
    let dx = Math.cos(a0) - sweep * 0.6, dy = Math.sin(a0);
    const dl = Math.hypot(dx, dy); dx /= dl; dy /= dl;
    lock(c, cx + Math.cos(a0) * 9, cy + Math.sin(a0) * 9.4, Math.atan2(dy, dx), 8 + j * 3, 6, MANE_FRONT, (j - 0.5) * 3);
  }
};

/** The face (the skull's middle at the origin, facing right): the broad skull, the rounded ears, the long broad muzzle and
 *  its whisker pads, the dark nose leather, the golden eyes under a heavy brow; the jaws open `open` (fangs, the curled
 *  tongue), the snarl (the lip drawn up off the fangs, the nose wrinkled, the eyes narrowed); blood `bloody`. */
const face = (c: Ctx, open: number, snarl: number, eye: 0 | 1 | 2, bloody: number) => {
  // (the ears: round, dark backed, pale tufted in)
  for (const [ex, ey] of [[-5.5, -9], [0.5, -10.6]] as const) { ell(c, ex, ey, 4.6, 4.2, LION[6]); ell(c, ex, ey, 3.7, 3.3, LION[4]); ell(c, ex + 0.6, ey + 0.6, 2.2, 2, PALE[3]); ell(c, ex - 0.8, ey - 1, 1.6, 1.2, LION[2]); }
  coat(c, () => c.ellipse(-1, -1, 11, 9.6, 0, 0, Math.PI * 2), LION, -12, 10, -11, 9, 1, 31);
  // (the brow: heavy, dark-ticked over the crown)
  for (let i = 0; i < 6; i++) px(c, -7 + i * 2, -9 + (i % 2), 0.9, 1.4, LION[5]);
  const jo = open * 9;
  // (the mouth, open: its dark, the tongue curled up in it)
  if (open > 0.12) {
    c.fillStyle = MOUTH; c.beginPath(); c.moveTo(3, 4.4); c.lineTo(17, 3.6); c.lineTo(15 + jo * 0.1, 5 + jo * 0.7); c.lineTo(4, 6 + jo * 0.5); c.closePath(); c.fill();
    ell(c, 9, 4.6 + jo * 0.55, 5.4, 1.2 + jo * 0.12, TONGUE[2]); ell(c, 9.4, 4.2 + jo * 0.55, 4.6, 0.9 + jo * 0.08, TONGUE[1]); px(c, 8, 3.8 + jo * 0.5, 3, 0.7, TONGUE[0]);
    if (snarl > 0.5) { line(c, [12.6, 5 + jo * 0.55, 13.4, 3.4 + jo * 0.5], 1.2, TONGUE[1]); }
  }
  // (the lower jaw and chin, dropped open about its hinge; the lower fangs)
  c.save(); c.translate(2.5, 5.4); c.rotate(open * 0.62);
  coat(c, () => { c.moveTo(-6, -1); c.lineTo(13, -1.2); c.quadraticCurveTo(15, 2.6, 11, 4.6); c.quadraticCurveTo(2, 6.2, -4, 4); c.closePath(); }, PALE, -6, 15, -1.2, 6, 0.8, 37);
  if (open > 0.12) { px(c, -1, -1.2, 13, 0.9, GUM); for (const fx of [10.6, 6.8]) { tri(c, fx - 0.3, -0.8, fx + 1, -4.4, fx + 2.3, -0.8, HORN[5]); tri(c, fx, -1, fx + 1, -4.1, fx + 2, -1, TOOTH); } for (let t = 0; t < 3; t++) px(c, 1 + t * 1.6, -2, 1, 1, TOOTH); }
  c.restore();
  // (the muzzle: long and broad, pale, puffed at the whisker pads)
  coat(c, () => { c.moveTo(1, -5.5); c.quadraticCurveTo(12, -6.4, 17.2, -2.4); c.quadraticCurveTo(18.6, 2.6, 16, 5); c.quadraticCurveTo(9, 7.4, 2, 5.4); c.quadraticCurveTo(-1, 0, 1, -5.5); c.closePath(); }, PALE, 0, 19, -6.4, 7, 0.9, 41);
  // (the bridge, lit down to the nose; the snarl's wrinkles across it)
  line(c, [0, -7.4, 8, -5.6, 14.4, -3.6], 1.6, LION[2]); line(c, [0.4, -8, 8, -6.4, 14, -4.6], 0.7, LION[0]);
  if (snarl > 0.3) for (let t = 0; t < 3; t++) line(c, [8 + t * 2, -6.4 + t * 0.6, 9 + t * 2, -4.6 + t * 0.6], 0.6, LION[5]);
  // (the whisker pads: rows of dark spots; the black lip line; the whiskers)
  for (let r2 = 0; r2 < 3; r2++) for (let i = 0; i < 4; i++) px(c, 8.4 + i * 1.6 + r2 * 0.4, 0.2 + r2 * 1.3, 0.7, 0.7, PALE[6]);
  // (the snarl: the lip drawn up off the fangs, the gum showing)
  const lipY = 5.2 - snarl * 1.4 * Math.min(1, open * 1.5);
  if (open > 0.12) {
    c.fillStyle = GUM; c.beginPath(); c.moveTo(5, lipY); c.quadraticCurveTo(11, lipY - 0.6, 16.6, lipY - 1.4); c.lineTo(16.6, lipY + 0.6); c.lineTo(5, lipY + 1.2); c.closePath(); c.fill();
    for (const fx of [14, 9.6]) { tri(c, fx - 0.3, lipY + 0.4, fx + 1.2, lipY + 5.6 + open * 1.6, fx + 2.7, lipY + 0.4, HORN[5]); tri(c, fx, lipY + 0.6, fx + 1.2, lipY + 5.2 + open * 1.6, fx + 2.4, lipY + 0.6, TOOTH); px(c, fx + 0.4, lipY + 0.8, 0.8, 2, '#FFFFFF'); }
    for (const ix of [12.3, 13.2]) px(c, ix, lipY + 0.6, 0.8, 1.2, TOOTH);
  }
  line(c, [3, lipY + 0.4, 9, lipY + 0.6, 16.4, lipY - 0.6], 0.9, PALE[6]);
  c.strokeStyle = 'rgba(255, 252, 240, 0.85)'; c.lineWidth = 0.4; c.beginPath();
  for (const [ey, d] of [[0.8, -2.4], [2, -0.4], [3.2, 1.8]] as const) { c.moveTo(13, ey); c.lineTo(22, ey + d); c.moveTo(12, ey + 0.4); c.lineTo(20, ey + d * 1.6 + 0.8); }
  c.stroke();
  // (the nose leather: broad, dark, its nostril, a glint)
  c.fillStyle = NOSE[3]; c.beginPath(); c.moveTo(13.4, -4.2); c.lineTo(18.6, -3.2); c.quadraticCurveTo(19.2, -0.6, 17.4, 0.6); c.lineTo(15.4, -0.4); c.closePath(); c.fill();
  c.fillStyle = NOSE[1]; c.beginPath(); c.moveTo(14.2, -3.6); c.lineTo(18, -2.8); c.quadraticCurveTo(18.2, -1, 17, -0.2); c.closePath(); c.fill();
  px(c, 15, -3.4, 1.6, 0.6, NOSE[0]); px(c, 17.6, -1.2, 0.9, 1, NOSE[3]);
  line(c, [17, 0.6, 16.6, 3.2], 0.7, PALE[6]);
  // (the eye: golden, a dark rim, the round pupil, a glint; narrowed in a snarl; the dark tear mark down from it; the brow)
  if (eye === 2) line(c, [2, -3.6, 4.6, -2.6, 7, -3.4], 1, LION[6]);
  else {
    const eh = eye === 1 ? 0.7 : 1.5;
    ell(c, 4.6, -3, 2.8, eh + 0.6, LION[6]); ell(c, 4.7, -3, 2.2, eh, EYE[2]); ell(c, 4.5, -3 - eh * 0.3, 1.8, eh * 0.55, EYE[1]); ell(c, 4.2, -3 - eh * 0.45, 1, eh * 0.3, EYE[0]);
    ell(c, 5.3, -2.9, 0.75, Math.min(0.8, eh * 0.6), EYE[3]); if (eye === 0) px(c, 3.8, -3.9, 0.7, 0.6, '#FFFFFF');
  }
  line(c, [1.6, -5.4 + (eye === 1 ? 0.8 : 0), 4.6, -6 + (eye === 1 ? 1.4 : 0.4), 7.8, -4.8 + (eye === 1 ? 0.6 : 0)], 1.3, LION[6]);
  line(c, [3.4, -1.4, 4.2, 1, 3.8, 3.4], 0.7, LION[5]);
  ell(c, 2.6, 2.4, 3, 1.6, dith(c, PALE[2]));
  // (blood all over the muzzle and the chin)
  if (bloody > 0) {
    c.globalAlpha = Math.min(1, bloody);
    ell(c, 11, 4.6, 6.4, 2.6, BLOOD[0]); ell(c, 11.4, 4, 5.4, 2, BLOOD[1]); ell(c, 13, 2.8, 3, 1.2, BLOOD[2]); px(c, 12.4, 2.2, 1.6, 0.6, BLOOD[3]);
    line(c, [6, 6.4, 5.6, 9.4, 6.2, 11.4], 1.3, BLOOD[1]); line(c, [12.4, 6.4, 12.8, 9], 1, BLOOD[1]); ell(c, 6.2, 12, 0.8, 1.1, BLOOD[2]);
    c.globalAlpha = 1;
  }
};

/** The fez (its brim's middle at the origin, upright): red, banded lit to dark across it, the gold band round its brim,
 *  the black button on top, the cord and the gold tassel swinging `sw` off the back. */
const fez = (c: Ctx, sw: number) => {
  const shape = () => { c.moveTo(-7, 0.6); c.lineTo(7, 0.6); c.lineTo(5.2, -12); c.quadraticCurveTo(0, -13, -5.2, -12); c.closePath(); };
  c.beginPath(); shape(); c.fillStyle = FEZ[3]; c.fill();
  c.save(); c.clip();
  px(c, -8, -14, 4.6, 16, FEZ[1]); c.fillStyle = dith(c, FEZ[1]); c.fillRect(-3.4, -14, 1.2, 16);
  px(c, -2.2, -14, 3.4, 16, FEZ[2]); c.fillStyle = dith(c, FEZ[4]); c.fillRect(1.2, -14, 1.4, 16);
  px(c, 2.6, -14, 6, 16, FEZ[4]); px(c, 5, -14, 3, 16, FEZ[5]);
  px(c, -6, -13, 2, 12, FEZ[0]);
  // (the gold band: lit, studded with its stitching)
  px(c, -8, -3.4, 16, 4, GOLD[3]); px(c, -8, -3.4, 16, 1, GOLD[1]); px(c, -8, -0.4, 16, 1, GOLD[5]);
  for (let x = -6; x < 6; x += 2.4) px(c, x, -2.2, 1.2, 1, GOLD[0]);
  c.restore();
  c.beginPath(); shape(); c.strokeStyle = FEZ[6]; c.lineWidth = 1; c.lineJoin = 'round'; c.stroke();
  ell(c, 0, -12.4, 5.2, 1.2, FEZ[5]); ell(c, -0.6, -12.6, 3.4, 0.6, FEZ[3]);
  ell(c, 0, -13, 1.6, 1.1, '#141010'); px(c, -0.6, -13.6, 0.8, 0.5, '#6A6060');
  // (the cord and the tassel)
  const tx = -7 + sw, ty = -4;
  line(c, [0, -12.8, -4 + sw * 0.4, -12, tx, ty - 2], 0.9, '#1A0E06');
  c.fillStyle = GOLD[6]; c.beginPath(); c.moveTo(tx - 1.6, ty - 2.6); c.lineTo(tx + 1.6, ty - 2.6); c.lineTo(tx + 2.6, ty + 3.4); c.lineTo(tx - 2.6, ty + 3.4); c.closePath(); c.fill();
  px(c, tx - 1.8, ty - 1, 3.6, 4, GOLD[3]); px(c, tx - 1.8, ty - 1, 1.2, 4, GOLD[1]); px(c, tx + 0.8, ty - 1, 1, 4, GOLD[4]);
  for (let i = 0; i < 4; i++) px(c, tx - 1.8 + i * 1.1, ty + 2.4, 0.6, 1.4, i % 2 ? GOLD[4] : GOLD[2]);
  ell(c, tx, ty - 2.2, 1.6, 1, GOLD[2]); px(c, tx - 0.8, ty - 2.8, 1, 0.6, GOLD[0]);
};

/** The collar round the neck (an arc under the jaw, about (x, y)): red leather, inked, lit along its top, gold studs, the
 *  gold tag hanging off the bottom of it. */
const collar = (c: Ctx, x: number, y: number, rot: number) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  const a0 = Math.PI * 0.12, a1 = Math.PI * 0.86, r = 14;
  c.lineCap = 'butt';
  for (const [w, col] of [[7, FEZ[6]], [5, FEZ[4]], [3, FEZ[3]]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.arc(0, 0, r, a0, a1); c.stroke(); }
  c.strokeStyle = FEZ[1]; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, r - 1.6, a0 + 0.06, a1 - 0.3); c.stroke();
  for (let k = 0; k < 6; k++) {
    const t = a0 + 0.1 + (k / 5) * (a1 - a0 - 0.2), sx = Math.cos(t) * r, sy = Math.sin(t) * r;
    ell(c, sx, sy, 1.5, 1.5, GOLD[5]); ell(c, sx, sy, 1.1, 1.1, GOLD[2]); px(c, sx - 0.7, sy - 0.8, 0.8, 0.6, GOLD[0]);
  }
  // (the tag)
  const tx = Math.cos(Math.PI * 0.42) * r, ty = Math.sin(Math.PI * 0.42) * r + 3;
  line(c, [tx, ty - 3, tx, ty - 1], 0.8, GOLD[5]);
  ell(c, tx, ty + 1, 2.6, 2.6, GOLD[6]); ell(c, tx, ty + 1, 2, 2, GOLD[3]); ell(c, tx - 0.5, ty + 0.4, 1, 1, GOLD[1]); px(c, tx - 0.4, ty + 1.6, 1.2, 0.5, GOLD[5]);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The lion, painted

const paintLion = (c: Ctx, pose: LionPose, fr: number, n: number, k: number, bloody: number) => {
  const R = rig(pose, n > 1 ? fr / n : 0, k);
  const [Hx, Hy] = R.H, [Sx, Sy] = R.S, [hx, hy] = R.head;
  const L = Math.hypot(Sx - Hx, Sy - Hy) || 1, ex = (Sx - Hx) / L, ey = (Sy - Hy) / L, nx = -ey, ny = ex;
  /** A point of the body: u along the spine from the hip, v across it (+ down). */
  const f = (u: number, v: number): Pt => [Hx + ex * u + nx * v, Hy + ey * u + ny * v];
  // ---- the tail (off the rump)
  tail(c, f(-14, -6), R.tail);
  // ---- the far legs, a step darker, behind
  leg(c, f(-1, 1), R.paws[0], R.pa[0], true, LION_FAR, false, 0.95, 0);
  leg(c, f(L, 2), R.paws[1], R.pa[1], false, LION_FAR, R.claws, 0.95, bloody);
  // ---- the body: the deep chest, the waist tucked up, the haunch round
  const body = () => {
    const p = (u: number, v: number) => f(u, v);
    const m = (a: Pt) => c.moveTo(a[0], a[1]), q = (a: Pt, b: Pt) => c.quadraticCurveTo(a[0], a[1], b[0], b[1]);
    m(p(-6, -11)); q(p(L * 0.2, -13.4), p(L * 0.45, -10.6)); q(p(L * 0.75, -10), p(L + 2, -13.4));
    q(p(L + 10, -12.6), p(L + 13, -1)); q(p(L + 14, 9), p(L + 6, 13.4)); q(p(L * 0.75, 15), p(L * 0.45, 11.4));
    q(p(L * 0.28, 9.4), p(L * 0.12, 10)); q(p(-2, 14), p(-10, 9)); q(p(-17, 6), p(-16, -1)); q(p(-15, -10), p(-6, -11));
    c.closePath();
  };
  const xs = [f(-18, 0)[0], f(L + 15, 0)[0], f(-18, 15)[0], f(L + 15, -14)[0]], ys = [f(0, -14)[1], f(L, -14)[1], f(0, 15)[1], f(L, 15)[1]];
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  coat(c, body, LION, bx0, bx1, by0, by1, 1.2, 11);
  c.save(); c.beginPath(); body(); c.clip();
  // (the haunch and the shoulder lit over the bands; the flank's hollow, the ribs; the saddle darker down the spine; the
  // pale belly with its fringe)
  { const [x, y] = f(-3, -2); mass(c, x, y, 14, 12, LION); }
  { const [x, y] = f(L - 1, -1); mass(c, x, y, 10, 13, LION); }
  { const [x, y] = f(L * 0.3, 5); ell(c, x, y, 11, 5, dith(c, LION[5])); }
  for (let i = 0; i < 4; i++) { const a = f(L * 0.5 + i * 4.4, -6), b = f(L * 0.46 + i * 4.4, 7); line(c, [a[0], a[1], b[0], b[1]], 0.8, LION[5]); }
  { const a = f(-12, -7), b = f(-6, 3), d = f(-10, 10); line(c, [a[0], a[1], b[0], b[1], d[0], d[1]], 1, LION[5]); }
  { const a = f(L - 4, -12), b = f(L - 8, 2); line(c, [a[0], a[1], b[0], b[1]], 1, LION[5]); }
  { const a = f(-8, -12), b = f(L * 0.5, -13.6), d = f(L + 2, -14.4); c.fillStyle = LION[4]; c.beginPath(); c.moveTo(a[0], a[1] - 2); c.quadraticCurveTo(b[0], b[1] - 2, d[0], d[1] - 2); c.lineTo(d[0], d[1] + 2.4); c.quadraticCurveTo(b[0], b[1] + 2.6, a[0], a[1] + 2.4); c.closePath(); c.fill(); }
  { const [x, y] = f(L * 0.55, 11); ell(c, x, y, L * 0.42, 4.4, PALE[3], Math.atan2(ey, ex)); ell(c, x + 1, y - 1.2, L * 0.36, 2.4, PALE[2], Math.atan2(ey, ex)); }
  for (let u = L * 0.2; u < L + 4; u += 2) { const kk = h01(u * 2.1); const [x, y] = f(u, 9.6 - kk * 2.4); px(c, x, y, 1, 2 + kk * 2, kk > 0.5 ? PALE[3] : LION[3]); }
  c.restore();
  // (fur ticked along the back)
  for (let u = -8; u < L; u += 2.2) { const kk = h01(u * 1.7 + 5), [x, y] = f(u, -12 + kk * 5); px(c, x, y, 1, 1.4 + h01(u + 5) * 1.6, kk > 0.55 ? LION[1] : LION[5]); }
  // ---- the near legs
  leg(c, f(-3, 2), R.paws[2], R.pa[2], true, LION, false, 1, 0);
  leg(c, f(L - 2, 3), R.paws[3], R.pa[3], false, LION, R.claws, 1, bloody);
  // ---- the mane (behind the face), the collar, the face, the ruff round it, the fez
  mane(c, hx, hy, R.sweep, 0);
  if (bloody > 0) { c.globalAlpha = Math.min(1, bloody); ell(c, hx - 2, hy + 18, 8, 4, BLOOD[0]); ell(c, hx, hy + 17, 5, 2.4, BLOOD[1]); ell(c, hx + 1, hy + 16.4, 2, 1, BLOOD[2]); c.globalAlpha = 1; }
  collar(c, hx - 4, hy + 2, R.ha * 0.5);
  c.save(); c.translate(hx, hy); c.rotate(R.ha);
  ruff(c, 0, 0, R.sweep, 0);
  face(c, R.open, R.snarl, R.eye, bloody);
  c.save(); c.translate(-2, -9.6); c.rotate(-0.3);
  fez(c, R.tassel);
  c.restore();
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------

/** The cycle's frame count and its rate (radians per frame of `t`), by pose. */
const CYCLE: Record<LionPose, [number, number]> = {
  stand: [6, 0.05], walk: [12, 0], run: [12, 0.45], pounce: [1, 0], land: [1, 0], roar: [1, 0], maul: [8, 0.32], settle: [1, 0], chew: [6, 0.14],
};
/** How far it walks a cycle (its own units: the walk's frame comes from how far it's gone, so its paws stay planted). */
export const LION_STRIDE = 30 / 0.62;

/** The lion at (x, feetY), facing (1 right), in a pose: `t` its frame count (the walk: how far it's walked), `k` the
 *  frame of a one-shot (the pounce, the landing, the roar, settling down), scaled `s`, `bloody` 0..1. */
export const drawCircusLion = (c: Ctx, x: number, feetY: number, facing: number, t: number, pose: LionPose, o: { bloody?: number; s?: number; k?: number } = {}) => {
  const [n, per] = CYCLE[pose];
  const fr = pose === 'walk' ? Math.floor(frac(t / LION_STRIDE) * n) : per ? Math.floor(frac((t * per) / (Math.PI * 2)) * n) : 0;
  const k = Math.max(0, Math.min(5, Math.round(o.k ?? 0)));
  const bloody = Math.round((o.bloody ?? 0) * 2) / 2, s = o.s ?? 1;
  c.save(); c.translate(Math.round(x), Math.round(feetY)); c.scale((facing < 0 ? -1 : 1) * s, s);
  stamp(c, `fr-circlion3-${pose}-${fr}-${k}-${bloody}`, -110, -100, 220, 114, g => paintLion(g, pose, fr, n, k, bloody));
  c.restore();
};
