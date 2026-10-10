// The jungle's painting kit (on top of the intro's: the same ramps, dither and ink, so it all comes out of a piece).
// Leaves, fronds, bark, buttress roots, rock, planks; and the view (where the eye is, what's on screen), with the
// perspective the intro uses: anything at depth d stands d of the way from where he's looking to where it'd be at the
// play plane (so it parallaxes and stands on the ground going back by itself).

import type { GameState } from '../../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../../m1/constants';
import { type Ctx, INK, box, checker, mix, rampOf, hash, PIX } from '../../../intro/art/kit';

export { type Ctx, INK, box, checker, mix, rampOf, hash, PIX };

// ---------------------------------------------------------------------------------------------------------------
// Palettes (darkest first)

export const LEAF = ['#0B2210', '#143A17', '#1F5420', '#2E7029', '#4A9133', '#7BB843', '#B4DC6A'];
export const BARK = ['#170E08', '#271910', '#3A2817', '#503820', '#694B2C', '#86653E', '#A6855A'];
export const MOSS = ['#1C3510', '#2F5214', '#466F1A', '#5F8F22', '#84B32F', '#B4DA52'];
export const EARTH = ['#130C07', '#21160D', '#302014', '#422D1B', '#563D25', '#6E5134'];
export const ROCK = ['#181714', '#2A2924', '#3F3C33', '#575240', '#716B54', '#918A6C', '#B4AC8A'];
export const RAVINE = ['#13261A', '#0D1C13', '#08130D', '#050C08', '#020604'];

// ---------------------------------------------------------------------------------------------------------------
// The view

export interface View {
  cam: { x: number; y: number };
  /** Where he's looking from (the vanishing point: everything going back goes toward it). */
  eye: { x: number; y: number };
  /** What's on screen (world), with a margin. */
  v0: number; v1: number; top: number; bot: number;
  f: number;
}
export const viewOf = (state: GameState): View => {
  const cam = state.camera;
  return {
    cam: { x: cam.x, y: cam.y },
    eye: { x: cam.x + CANVAS_WIDTH / 2, y: cam.y + CANVAS_HEIGHT * 0.42 },
    v0: cam.x - 120, v1: cam.x + CANVAS_WIDTH + 120, top: cam.y - 40, bot: cam.y + CANVAS_HEIGHT + 40,
    f: state.frame,
  };
};
/** A world point at the play plane, put back (d < 1) or brought forward (d > 1) toward the eye. */
export const at = (eye: { x: number; y: number }, x: number, y: number, d: number): [number, number] => [eye.x + (x - eye.x) * d, eye.y + (y - eye.y) * d];

/** A polygon, filled. */
export const poly = (c: Ctx, pts: [number, number][], col: string) => {
  c.fillStyle = col; c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath(); c.fill();
};

/**
 * A face going back from the play plane at x = e (a cliff's side, a ravine's bank), from `top` to `bottom`, seen only
 * when he's looking at it (on its `side` of it: 1 its face looks right). In steps: darker the further back.
 */
export const sideFace = (c: Ctx, eye: { x: number; y: number }, e: number, side: 1 | -1, top: number, bottom: number, depth: number, cols: string[], strata?: number[]) => {
  if ((eye.x - e) * side <= 1) return;
  const pt = (k: number, y: number) => at(eye, e, y, 1 - (1 - depth) * k);
  const steps = cols.length;
  for (let i = 0; i < steps; i++) {
    const k0 = i / steps, k1 = (i + 1) / steps;
    poly(c, [pt(k0, top), pt(k1, top), pt(k1, bottom), pt(k0, bottom)], cols[i]);
  }
  // (layers in the rock, going back with it)
  if (strata) for (const y of strata) {
    if (y < top || y > bottom) continue;
    const [xa, ya] = pt(0, y), [xb, yb] = pt(1, y);
    c.strokeStyle = 'rgba(8, 10, 8, 0.45)'; c.lineWidth = 2; c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.stroke();
  }
  const [x1, t1] = pt(1, top);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, top); c.lineTo(x1, t1); c.stroke();
};

// ---------------------------------------------------------------------------------------------------------------
// Leaves and fronds

/** One leaf: pointed, its upper half lit and lower half shaded, a midrib. `a`: the way it points. */
export const leaf = (c: Ctx, x: number, y: number, len: number, a: number, r: string[], lit = 3, ink = true) => {
  const w = len * 0.34, cx = Math.cos(a), sy = Math.sin(a), nx = -sy, ny = cx;
  const tip: [number, number] = [x + cx * len, y + sy * len], mid: [number, number] = [x + cx * len * 0.45, y + sy * len * 0.45];
  if (ink) { c.fillStyle = INK; c.beginPath(); c.moveTo(x - cx, y - sy); c.quadraticCurveTo(mid[0] + nx * (w + 1.5), mid[1] + ny * (w + 1.5), tip[0] + cx * 1.5, tip[1] + sy * 1.5); c.quadraticCurveTo(mid[0] - nx * (w + 1.5), mid[1] - ny * (w + 1.5), x - cx, y - sy); c.fill(); }
  c.fillStyle = r[lit - 1]; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(mid[0] - nx * w, mid[1] - ny * w, tip[0], tip[1]); c.lineTo(mid[0], mid[1]); c.fill();
  c.fillStyle = r[lit]; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(mid[0] + nx * w, mid[1] + ny * w, tip[0], tip[1]); c.lineTo(mid[0], mid[1]); c.fill();
  // (the midrib, and a glint where the light catches)
  c.strokeStyle = r[Math.max(0, lit - 2)]; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(tip[0], tip[1]); c.stroke();
  if (len > 9) box(c, mid[0] + nx * w * 0.45 - 1, mid[1] + ny * w * 0.45 - 1, 2, 1, r[Math.min(r.length - 1, lit + 2)]);
};

/**
 * A clump of foliage (a crown, a bush, the leaves round a limb): rounded, built up from the back (dark, inked) to the
 * front (lit from the upper left), with leaf tips sticking out round its edge.
 */
export const clump = (c: Ctx, cx: number, cy: number, rw: number, rh: number, seed: number, r: string[] = LEAF, shade = 0) => {
  const R = (i: number) => r[Math.max(0, Math.min(r.length - 1, i - shade))];
  const n = Math.max(5, Math.round((rw * rh) / 140));
  // (the ink round it, then its dark body)
  const lobes: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = hash(seed + i * 1.37) * Math.PI * 2, d = Math.sqrt(hash(seed + i * 2.11));
    lobes.push([cx + Math.cos(a) * rw * 0.62 * d, cy + Math.sin(a) * rh * 0.55 * d, Math.max(5, Math.min(rw, rh) * (0.38 + hash(seed + i * 3.7) * 0.28))]);
  }
  c.fillStyle = INK; for (const [x, y, s] of lobes) { c.beginPath(); c.ellipse(x, y, s + 2, s * 0.8 + 2, 0, 0, Math.PI * 2); c.fill(); }
  // (leaf tips round the edge, pointing out)
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 + hash(seed + i) * 0.4;
    const ex = cx + Math.cos(a) * rw * 0.82, ey = cy + Math.sin(a) * rh * 0.78;
    leaf(c, ex - Math.cos(a) * 6, ey - Math.sin(a) * 6, 10 + hash(seed + i * 5.1) * 6, a + 0.4, r, Math.sin(a) < -0.2 ? Math.min(r.length - 2, 3 + 1 - shade) : Math.max(1, 2 - shade));
  }
  c.fillStyle = R(1); for (const [x, y, s] of lobes) { c.beginPath(); c.ellipse(x, y, s, s * 0.8, 0, 0, Math.PI * 2); c.fill(); }
  // (lit toward the upper left, in steps)
  for (const [step, dx, dy, k] of [[2, -0.12, -0.14, 0.82], [3, -0.24, -0.28, 0.58], [4, -0.34, -0.4, 0.32]] as const) {
    c.fillStyle = R(step);
    for (const [x, y, s] of lobes) { c.beginPath(); c.ellipse(x + s * dx, y + s * dy, s * k, s * k * 0.78, 0, 0, Math.PI * 2); c.fill(); }
  }
  // (the dither where the shade meets the light, and leaf marks over it)
  for (let i = 0; i < n * 3; i++) {
    const a = hash(seed + i * 7.7) * Math.PI * 2, d = Math.sqrt(hash(seed + i * 9.1));
    const x = cx + Math.cos(a) * rw * 0.6 * d, y = cy + Math.sin(a) * rh * 0.55 * d;
    const up = y < cy - rh * 0.1 && x < cx + rw * 0.2;
    leaf(c, x, y, 6 + hash(seed + i) * 5, a, r, up ? Math.min(r.length - 2, 5 - shade) : Math.max(1, 3 - shade), false);
  }
};

/** A fern: fronds arching out of a crown, leaflets down each. `sway`: radians the lot leans. */
export const fern = (c: Ctx, x: number, y: number, h: number, seed: number, sway = 0, r: string[] = LEAF, lit = 3) => {
  const fronds = 5 + Math.floor(hash(seed) * 3);
  for (let i = 0; i < fronds; i++) {
    const t = i / (fronds - 1), a0 = -Math.PI / 2 + (t - 0.5) * 2.4 + sway * (0.6 + t * 0.4);
    const len = h * (0.75 + hash(seed + i * 1.9) * 0.35) * (1 - Math.abs(t - 0.5) * 0.5);
    // (each frond curls over toward its tip)
    const bend = (t < 0.5 ? -1 : 1) * 0.9;
    let px = x, py = y, a = a0;
    const segs = 8, sl = len / segs;
    const L = Math.max(1, Math.min(r.length - 2, lit + (t < 0.5 ? 1 : -1)));
    for (let s = 0; s < segs; s++) {
      a += bend / segs;
      const nx = px + Math.cos(a) * sl, ny = py + Math.sin(a) * sl;
      c.strokeStyle = r[Math.max(0, L - 2)]; c.lineWidth = 2; c.beginPath(); c.moveTo(px, py); c.lineTo(nx, ny); c.stroke();
      const ll = sl * 1.5 * (1 - s / segs * 0.7);
      leaf(c, nx, ny, ll, a - 1.1, r, L, false);
      leaf(c, nx, ny, ll, a + 1.1, r, Math.max(1, L - 1), false);
      px = nx; py = ny;
    }
  }
};

/** A big tropical leaf (an elephant ear): a broad heart on a stalk. */
export const bigLeaf = (c: Ctx, x: number, y: number, s: number, a: number, r: string[] = LEAF, lit = 3) => {
  const cx = Math.cos(a), sy = Math.sin(a);
  const tx = x + cx * s * 1.6, ty = y + sy * s * 1.6;
  c.strokeStyle = r[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + cx * s * 0.5, y + sy * s * 0.5); c.stroke();
  leaf(c, x + cx * s * 0.4, y + sy * s * 0.4, s * 1.4, a, r, lit);
  // (the veins)
  for (let k = 0.3; k < 0.9; k += 0.18) {
    const mx = x + cx * s * (0.4 + 1.4 * k), my = y + sy * s * (0.4 + 1.4 * k);
    c.strokeStyle = r[Math.max(0, lit - 2)]; c.lineWidth = 1;
    c.beginPath(); c.moveTo(mx, my); c.lineTo(mx - sy * s * 0.3 + cx * 4, my + cx * s * 0.3 + sy * 4); c.stroke();
    c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + sy * s * 0.3 + cx * 4, my - cx * s * 0.3 + sy * 4); c.stroke();
  }
  void tx; void ty;
};

// ---------------------------------------------------------------------------------------------------------------
// Wood

/**
 * A length of bark (a trunk), w wide, from y0 to y1: round, stepped across (lit on the left), grooves running down it
 * (wavering, a lit edge beside each), the odd knot, moss up its left. Tiles going up if y1 - y0 is a multiple of 128.
 */
export const bark = (c: Ctx, x: number, y0: number, y1: number, w: number, seed: number, r: string[] = BARK, moss = true) => {
  const order = [3, 4, 4, 3, 3, 2, 2, 2, 1, 1, 0];
  for (let i = 0; i < order.length; i++) {
    const xa = x + (w * i) / order.length, xb = x + (w * (i + 1)) / order.length;
    box(c, xa, y0, Math.max(1, xb - xa + 0.5), y1 - y0, r[order[i] + 1]);
  }
  // (the steps dithered into each other)
  for (let i = 1; i < order.length; i++) if (order[i] !== order[i - 1]) checker(c, x + (w * i) / order.length - PIX, y0, PIX, y1 - y0, r[order[i] + 1], 0);
  // (grooves: a dark line wandering down, a lit one beside it)
  const grooves = Math.max(3, Math.round(w / 9));
  for (let g = 0; g < grooves; g++) {
    const gx = x + ((g + 0.3 + hash(seed + g) * 0.4) / grooves) * w;
    const k = (gx - x) / w, dk = k < 0.4 ? 2 : k < 0.75 ? 1 : 0;
    for (let y = y0; y < y1; y += 4) {
      const wob = Math.round(Math.sin((y / 128) * Math.PI * 2 * 2 + g * 1.7 + seed) * 2);
      box(c, gx + wob, y, 2, 4, r[dk]);
      if (k < 0.6) box(c, gx + wob - 2, y, 1, 4, r[Math.min(r.length - 1, dk + 4)]);
    }
  }
  // (a knot, now and then: a ring of bark round a dark hollow)
  if (hash(seed * 3.3) > 0.45 && w > 24) {
    const ky = y0 + 30 + hash(seed * 5.1) * Math.max(1, y1 - y0 - 70), kx = x + w * (0.3 + hash(seed * 6.7) * 0.3);
    c.fillStyle = INK; c.beginPath(); c.ellipse(kx, ky, 6, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = r[4]; c.beginPath(); c.ellipse(kx, ky, 5, 8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = r[2]; c.beginPath(); c.ellipse(kx + 1, ky + 1, 3, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = r[0]; c.beginPath(); c.ellipse(kx + 1, ky + 1, 2, 3, 0, 0, Math.PI * 2); c.fill();
  }
  // (moss creeping up the shaded side and over the lit one, in patches)
  if (moss) for (let i = 0; i < 3; i++) {
    const my = y0 + hash(seed + i * 4.4) * (y1 - y0), mh = 10 + hash(seed + i * 8.8) * 26;
    const mx = x + (hash(seed + i * 2.2) > 0.5 ? 0 : w * 0.55);
    for (let yy = my; yy < Math.min(y1, my + mh); yy += 2) {
      const ww = Math.round((w * 0.3) * Math.sin(((yy - my) / mh) * Math.PI));
      box(c, mx, yy, ww, 2, MOSS[mx === x ? 3 : 1]);
      if (ww > 4) box(c, mx + 1, yy, 2, 1, MOSS[mx === x ? 5 : 2]);
    }
  }
  box(c, x - 1, y0, 1, y1 - y0, INK); box(c, x + w, y0, 1, y1 - y0, INK);
};

/**
 * Buttress roots: the foot of a trunk (x, w) flaring out onto the ground at `foot`, the bark's steps following the
 * flare round; ridges (the buttresses) running down it and out along the ground as roots, lit on their left; moss
 * along them; a fern in a crook.
 */
export const roots = (c: Ctx, x: number, w: number, foot: number, seed: number, r: string[] = BARK) => {
  const h = Math.min(150, w * 1.5 + 26), cx = x + w / 2;
  const at = (u: number, t: number): [number, number] => [cx + (u - 0.5) * w * (1 + 1.5 * t ** 2.4), foot - h + h * t];
  const order = [3, 4, 4, 3, 3, 2, 2, 2, 1, 1, 0], n = order.length, rows = 10;
  // (the flare: the trunk's own steps, spreading)
  for (let i = 0; i < n; i++) for (let k = 0; k < rows; k++) {
    const u0 = i / n, u1 = (i + 1) / n, t0 = k / rows, t1 = (k + 1) / rows;
    poly(c, [at(u0, t0), at(u1 + 0.004, t0), at(u1 + 0.004, t1 + 0.01), at(u0, t1 + 0.01)], r[order[i] + 1]);
  }
  c.strokeStyle = INK; c.lineWidth = 1;
  for (const u of [0, 1]) { c.beginPath(); for (let k = 0; k <= rows; k++) { const [px, py] = at(u, k / rows); if (k) c.lineTo(px, py); else c.moveTo(px, py); } c.stroke(); }
  // (the buttresses: ridges down the flare and out along the ground as roots, tapering)
  const fins = [0.06, 0.24, 0.5, 0.74, 0.94].map((u, i) => ({ u: u + (hash(seed + i) - 0.5) * 0.06, out: (0.5 + hash(seed + i * 2.7) * 0.7) * w }));
  for (const f of fins) {
    const side = f.u < 0.5 ? -1 : 1, lit = f.u < 0.6;
    const pts: [number, number][] = [];
    for (let k = 2; k <= rows; k++) pts.push(at(f.u, k / rows));
    const [fx, fy] = pts[pts.length - 1];
    pts.push([fx + side * f.out * 0.6, fy - 2], [fx + side * f.out, fy]);
    const thick = (k: number) => Math.max(1.5, 5 * (1 - k / pts.length) + 2);
    // (the ridge: dark under it, then the lit edge along it)
    for (const [col, dx, wd] of [[INK, 0, 2], [r[1], 1, 0], [lit ? r[6] : r[4], -1, -1.5]] as [string, number, number][]) {
      c.strokeStyle = col; c.lineCap = 'round';
      for (let k = 1; k < pts.length; k++) { c.lineWidth = thick(k) + wd; c.beginPath(); c.moveTo(pts[k - 1][0] + dx, pts[k - 1][1]); c.lineTo(pts[k][0] + dx, pts[k][1]); c.stroke(); }
    }
    c.lineCap = 'butt';
    // (moss along the root where it runs out on the ground)
    box(c, Math.min(fx, fx + side * f.out * 0.8), fy - 4, Math.abs(f.out * 0.8), 2, MOSS[3]);
  }
  // (shadow at the foot, between the roots)
  for (let k = 0; k < 3; k++) box(c, at(0.1, 1)[0] + 6, foot - 1 - k, at(0.9, 1)[0] - at(0.1, 1)[0] - 12, 1, r[0]);
  // (a fern in a crook)
  fern(c, cx + w * (hash(seed * 9) > 0.5 ? -0.9 : 0.9), foot, 20 + hash(seed) * 12, seed + 4, 0, LEAF, 3);
};

/**
 * A limb to stand on: round wood w long from (x, y) (its top), thick `t`, its top lit (the lip that says stand here:
 * a bright bark highlight and a strip of moss), its underside dark, knots, a cut end, leaves hanging off under it.
 */
export const limb = (c: Ctx, x: number, y: number, w: number, t: number, seed: number, ends: { left: 'trunk' | 'cut' | 'taper'; right: 'trunk' | 'cut' | 'taper' }) => {
  const r = BARK;
  const lx = ends.left === 'taper' ? 10 : 0, rx = ends.right === 'taper' ? 10 : 0;
  // (the ink, the body in steps top to bottom)
  poly(c, [[x - 1, y - 1], [x + w + 1, y - 1], [x + w - rx + 1, y + t + 1], [x + lx - 1, y + t + 1]], INK);
  const bands = [5, 4, 3, 3, 2, 2, 1, 1, 0];
  for (let i = 0; i < bands.length; i++) {
    const ya = y + (t * i) / bands.length, yb = y + (t * (i + 1)) / bands.length;
    const k0 = ya - y, k1 = yb - y;
    poly(c, [[x + (lx * k0) / t, ya], [x + w - (rx * k0) / t, ya], [x + w - (rx * k1) / t, yb + 0.5], [x + (lx * k1) / t, yb + 0.5]], r[bands[i] + 1]);
  }
  // (bark lines along it)
  for (let i = 0; i < w / 14; i++) {
    const bx = x + 6 + hash(seed + i) * (w - 18), by = y + t * (0.35 + hash(seed + i * 2.3) * 0.4), bl = 8 + hash(seed + i * 3.1) * 14;
    box(c, bx, by, bl, 1, r[1]); box(c, bx + 2, by - 1, bl - 4, 1, r[5]);
  }
  // (the lip: moss along the top, a bright highlight, grass sticking up out of it)
  box(c, x + lx * 0.2, y, w - (lx + rx) * 0.2, 4, MOSS[3]);
  box(c, x + lx * 0.2, y, w - (lx + rx) * 0.2, 2, MOSS[5]);
  checker(c, x + 2, y + 4, w - 4, PIX, MOSS[2]);
  for (let i = 0; i < w / 10; i++) { const gx = x + 4 + hash(seed + i * 4.9) * (w - 8); box(c, gx, y - 3, 1, 3, MOSS[4]); box(c, gx + 1, y - 2, 1, 2, MOSS[5]); }
  // (a cut end: the rings)
  const cut = (cx: number) => {
    c.fillStyle = INK; c.beginPath(); c.ellipse(cx, y + t / 2, t * 0.32 + 1, t / 2 + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#B08A5C'; c.beginPath(); c.ellipse(cx, y + t / 2, t * 0.32, t / 2, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#8A6840'; c.lineWidth = 1; c.beginPath(); c.ellipse(cx, y + t / 2, t * 0.18, t * 0.3, 0, 0, Math.PI * 2); c.stroke();
    box(c, cx - 1, y + t / 2 - 1, 2, 2, '#6A4C2E');
  };
  if (ends.left === 'cut') cut(x + 2);
  if (ends.right === 'cut') cut(x + w - 2);
  // (leaves and a strand or two of moss hanging off under it)
  for (let i = 0; i < w / 40; i++) {
    const hx = x + 14 + hash(seed + i * 6.1) * (w - 28);
    leaf(c, hx, y + t - 2, 9 + hash(seed + i) * 6, Math.PI / 2 + (hash(seed + i * 1.1) - 0.5) * 1.4, LEAF, 3);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Rock

/**
 * A rock face (a cliff, a pillar) over (x, y, w, h): blocks of stone, each lit on its upper left and dark on its lower
 * right, ink in the cracks; no flat lit tops (nothing on a cliff face reads as a ledge); moss and ferns in the cracks.
 */
export const rockFace = (c: Ctx, x: number, y: number, w: number, h: number, seed: number, r: string[] = ROCK) => {
  box(c, x, y, w, h, r[1]);
  // (fissures down it behind the boulders)
  for (let i = 0; i < w / 60; i++) { const fx = x + hash(seed + i * 1.9) * w; for (let yy = y; yy < y + h; yy += 4) box(c, fx + Math.sin(yy * 0.05 + i) * 5, yy, 3, 4, r[0]); }
  // (boulders, overlapping, the lower in front: each lit up and left, shaded down and right, inked; moss over the tops)
  const n = Math.ceil((w * h) / 2300), bs: [number, number, number, number, number][] = [];
  for (let i = 0; i < n; i++) bs.push([x + hash(seed + i * 1.13) * w, y + hash(seed + i * 2.71) * h, 20 + hash(seed + i * 3.3) * 34, 15 + hash(seed + i * 4.7) * 24, seed + i * 7.7]);
  bs.sort((p, q) => p[1] - q[1]);
  for (const [cx, cy, rw, rh, sd] of bs) {
    const pts: [number, number][] = [];
    for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2 + hash(sd) * 0.6, j = 0.78 + hash(sd + k * 1.7) * 0.3; pts.push([cx + Math.cos(a) * rw * j, cy + Math.sin(a) * rh * j]); }
    const out = pts.map(([px, py]) => [cx + (px - cx) * 1.06 + 0.5, cy + (py - cy) * 1.06 + 0.5] as [number, number]);
    poly(c, out, INK);
    poly(c, pts, r[2 + Math.floor(hash(sd * 1.3) * 2)]);
    const sh = (dx: number, dy: number, k: number) => pts.map(([px, py]) => [cx + (px - cx) * k + dx, cy + (py - cy) * k + dy] as [number, number]);
    poly(c, sh(-rw * 0.12, -rh * 0.14, 0.72), r[4]);
    poly(c, sh(-rw * 0.24, -rh * 0.28, 0.4), r[5]);
    checker(c, cx - rw * 0.4, cy - rh * 0.05, rw * 0.7, PIX, r[4]);
    // (the shade under it)
    poly(c, [pts[0], pts[1], pts[2], pts[3], [cx, cy + rh * 0.55]], r[1]);
    const m = hash(sd * 2.3);
    if (m > 0.55) {
      // (moss cap and drips)
      const top = pts.filter(([, py]) => py < cy - rh * 0.3);
      for (const [px, py] of top) { box(c, px - 6, py - 1, 12, 4, MOSS[2]); box(c, px - 5, py - 1, 9, 1, MOSS[4]); box(c, px - 2, py + 3, 2, 3 + hash(px) * 8, MOSS[1]); }
    } else if (m < 0.06) fern(c, cx, cy - rh * 0.6, 18, sd, 0.4, LEAF, 3);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Planks and posts (signs, the lookout, the arch)

/** A plank (or a few side by side): wood grain, a lit top edge, a shaded bottom one, nail heads, ink round it. */
export const plank = (c: Ctx, x: number, y: number, w: number, h: number, col: string, seed: number, nails = true) => {
  const r = rampOf(col);
  box(c, x - 1, y - 1, w + 2, h + 2, INK);
  box(c, x, y, w, h, col);
  box(c, x, y, w, 2, r[3]); box(c, x, y, w, 1, r[4]);
  box(c, x, y + h - 2, w, 2, r[1]);
  checker(c, x, y + 2, w, PIX, r[3]);
  // (grain: long thin streaks, a knot)
  for (let i = 0; i < h / 3; i++) {
    const gy = y + 3 + i * 3 + hash(seed + i) * 2, gx = x + hash(seed + i * 2.7) * w * 0.4, gl = w * (0.3 + hash(seed + i * 4.1) * 0.6);
    if (gy < y + h - 3) box(c, gx, gy, Math.min(gl, x + w - gx - 2), 1, i % 2 ? r[1] : mix(col, r[1], 0.5));
  }
  if (w > 30 && hash(seed * 7) > 0.5) { const kx = x + w * (0.2 + hash(seed * 3) * 0.6), ky = y + h / 2; c.fillStyle = r[0]; c.beginPath(); c.ellipse(kx, ky, 3, 1.5, 0, 0, Math.PI * 2); c.fill(); }
  if (nails) for (const nx of [x + 4, x + w - 6]) { box(c, nx, y + h / 2 - 1, 2, 2, '#2A2A30'); box(c, nx, y + h / 2 - 1, 1, 1, '#9CA3AF'); }
};

/** A post (a log, sunk in the ground): round, stepped across, its top cut. */
export const post = (c: Ctx, x: number, top: number, foot: number, w: number, col = '#5E432A') => {
  const r = rampOf(col);
  const order = [3, 4, 3, 2, 2, 1, 1, 0];
  for (let i = 0; i < order.length; i++) box(c, x + (w * i) / order.length, top, Math.max(1, w / order.length + 0.5), foot - top, r[order[i]]);
  box(c, x - 1, top, 1, foot - top, INK); box(c, x + w, top, 1, foot - top, INK);
  c.fillStyle = INK; c.beginPath(); c.ellipse(x + w / 2, top, w / 2 + 1, 3, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#A07A50'; c.beginPath(); c.ellipse(x + w / 2, top, w / 2 - 1, 2, 0, 0, Math.PI * 2); c.fill();
  // (a mound of dirt round its foot, and a lashing of rope)
  c.fillStyle = EARTH[3]; c.beginPath(); c.ellipse(x + w / 2, foot, w, 3, 0, Math.PI, 0); c.fill();
};

/** Rope lashed round something (x, y: the middle of it, w wide): turns of it, lit on top. */
export const lashing = (c: Ctx, x: number, y: number, w: number, turns = 3) => {
  for (let i = 0; i < turns; i++) {
    const ly = y - turns * 1.5 + i * 3;
    box(c, x - w / 2 - 1, ly - 1, w + 2, 4, INK);
    box(c, x - w / 2, ly, w, 2, '#C8A86A'); box(c, x - w / 2, ly + 2, w, 1, '#7A6236');
  }
};

/** Bamboo: a pole in segments, nodes ringed, lit down the left. Vertical (or across, with `across`). */
export const bamboo = (c: Ctx, x: number, y: number, len: number, w: number, across = false) => {
  const r = ['#4A5418', '#6E7A22', '#94A030', '#B8C24A', '#DDE27A'];
  if (across) {
    box(c, x, y - 1, len, w + 2, INK);
    box(c, x, y, len, w, r[2]); box(c, x, y, len, Math.max(1, w / 3), r[3]); box(c, x, y, len, 1, r[4]); box(c, x, y + w - 2, len, 2, r[1]);
    for (let k = 18; k < len; k += 26) { box(c, x + k, y - 1, 2, w + 2, r[0]); box(c, x + k + 2, y, 1, w, r[4]); }
  } else {
    box(c, x - 1, y, w + 2, len, INK);
    box(c, x, y, w, len, r[2]); box(c, x, y, Math.max(1, w / 3), len, r[3]); box(c, x + 1, y, 1, len, r[4]); box(c, x + w - 2, y, 2, len, r[1]);
    for (let k = 20; k < len; k += 30) { box(c, x - 1, y + k, w + 2, 2, r[0]); box(c, x, y + k + 2, w, 1, r[4]); }
  }
};

/** Words carved into wood: cut in dark, the lower lip of each cut catching the light. */
export const carved = (c: Ctx, s: string, x: number, y: number, size: number, cut = '#2A1A0C', lip = '#E8C890') => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = 'center';
  c.fillStyle = lip; c.fillText(s, x + 1, y + 1);
  c.fillStyle = cut; c.fillText(s, x, y);
  c.textAlign = 'left';
};
/** Words painted on: a drop shadow under them. */
export const painted = (c: Ctx, s: string, x: number, y: number, size: number, col: string, shadow: string | null = INK) => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = 'center';
  if (shadow) { c.fillStyle = shadow; c.fillText(s, x + 1, y + 1); }
  c.fillStyle = col; c.fillText(s, x, y);
  c.textAlign = 'left';
};
export const textW = (c: Ctx, s: string, size: number) => { c.font = `${size}px "Press Start 2P"`; return c.measureText(s).width; };
