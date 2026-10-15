// Round the temple. He comes down off the temple's roof by its left side and walks away from it; the path curves
// round, the whole way, and brings him back to it (a loop round a clearing with the temple in its mouth): where it
// ends, a wing of the temple runs out across it, and that's the wall the trees come down on.
//
// Meathead 1's storm-climb trick (the play strip wrapped round a cylinder, render/world.ts) bends the strip away at the
// sides as the path curves; everything past the strip is drawn here, in screen space, from a camera going round the
// loop with him (the old 16-bit tricks): the floor's a Mode 7 plane (each row of it scaled for how far off it is,
// drawn chunky), the path's far side on it; the temple a scaled set of boxes (its faces coming round into view and
// going out of it, nearer and bigger at the start and the end, smaller across the loop in the middle); the jungle
// round the loop and the hills past it slide by at their own rates, the far ones the other way.
// Everything out there's put through the one camera (proj()), and put in order back to front piece by piece (inOrder):
// the temple's tiers, its wing (cut into slabs that sit on the steps, never through them), the trees, Artie's blind.
//
// The loop's angle is world x over its radius, so the near side of it moves with the strip (1:1 where it meets it).
//
// The look (the final pass): the temple's faces in the roof's sandy stone, each face's shade stepped from the stone's
// ramp by how it's turned to the light; block courses and staggered joints in perspective (dark joint, lit lip), a lit
// cornice, moss along the foot, carved glyph panels, vines; the stairs with lit treads. Trees with stepped crowns,
// the hills with lit crests, clouds going round with the loop.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { GY } from '../geometry';
import { x0, TEMPLE_X } from './arena';
import { timeOfDay, skyRamp, farTint, sunAt, drawSun, drawStars, drawMoon, cloudTint } from '../../timeOfDay';
import { pixelBlob, mix, checker } from '../../intro/art/kit';
import { STONE as SR, MOSS } from '../roof/stone';

type Ctx = CanvasRenderingContext2D;

/** The strip's wrapped round a cylinder of this (a gentle bend: the fight's edges stay put). */
export const ORBIT_WRAP = 700;
/** The loop: its radius; its angle where he comes in (left of the temple) and where it ends (the wing), even about 0. */
export const PR = 560;
const A_END = (TEMPLE_X - x0) / PR / 2, A_START = -A_END;
/** The temple's middle: out from the loop's middle toward its open side (polar angle PI), front (stairs) facing in. */
const TD = 420;
/** The camera: focal length (the near side of the loop at 1:1 on the strip), how far out from the loop's middle, how high.
 *  (Its eye's HC up, looking level: the horizon's HC over where the near side of the loop meets the strip's ground, GY,
 *  so the floor and everything stood on it meet the strip there; off the middle the strip's own bend (ORBIT_WRAP) and
 *  the loop's part a little, which is why things handed from one to the other (Artie's blind, tower.ts) blend across.) */
export const F = 900, DC = F + PR, HC = 400;
/** The temple's wing across the path at its end: how wide, the angle its middle's at (its near face at the wall). */
const WING_W = 180;
const WING_A = A_END + Math.asin(WING_W / 2 / PR);
const WING_U0 = 300;
/** Where the last tree hits the wing (its face, out at the path; how high). */
const HIT_U = PR - 10, HIT_Y = 221;
/** Light from one side (world-fixed: the faces brighten and darken as they come round). */
export const SUN = (() => { const x = -0.6, z = 0.75, l = Math.hypot(x, z); return { x: x / l, z: z / l }; })();

/** The loop's angle at a world x. */
export const orbitAngle = (worldX: number) => A_START + (worldX - x0) / PR;

export interface View { phi: number; hy: number; cos: number; sin: number }
export const viewOf = (state: GameState): View => {
  const phi = orbitAngle(state.camera.x + CANVAS_WIDTH / 2);
  // (the horizon put where the near side of the loop lands on the strip's ground, wherever the camera is up and down)
  return { phi, hy: GY - state.camera.y - HC, cos: Math.cos(phi), sin: Math.sin(phi) };
};
/** A ground-plane point (px, pz: the loop's middle at 0) at height y: on screen, how far, its scale. */
export const proj = (v: View, px: number, y: number, pz: number) => {
  const X = px * v.cos - pz * v.sin, Z = DC - px * v.sin - pz * v.cos;
  const k = F / Math.max(40, Z);
  return { x: CANVAS_WIDTH / 2 + X * k, y: v.hy + (HC - y) * k, z: Z, k };
};
export const depth = (v: View, px: number, pz: number) => DC - px * v.sin - pz * v.cos;
export const polar = (r: number, a: number) => ({ x: r * Math.sin(a), z: r * Math.cos(a) });
export const camPos = (v: View) => ({ x: DC * v.sin, z: DC * v.cos });

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * k)));
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
};
const poly = (c: Ctx, pts: { x: number; y: number }[], col: string) => {
  c.fillStyle = col; c.beginPath();
  pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
  c.closePath(); c.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// Prisms (the temple's tiers, its wing): a footprint (a convex outline, going round), from y0 up to y1, stood on the
// floor. Each face's turned by its own edge (its normal square to it, out from the middle), seen only when it's turned
// toward the camera; the top only from above. Pieces butt up against each other (never through each other: the wing's
// cut where it meets the temple's steps), so they can be put in order back to front (see inOrder).

export type Pt = { x: number; z: number };
/** A footprint edge's own frame (for things on its face): where `along` starts from, which way it runs; its name. */
interface Edge { tag: string; o: Pt; d: Pt }
interface BoxOpts {
  col: string;
  /** Something on a face once it's drawn (stairs, damage): which face (its edge's tag), and the face's frame. */
  onFace?: (c: Ctx, v: View, face: string, at: (along: number, y: number, out?: number) => { x: number; y: number }) => void;
  /** The top edge broken (the roof caved in): its notches. */
  broken?: boolean;
}
/** A face's stone, stepped from the ramp by how lit it is (0.62 .. 1.02). */
const stoneAt = (lit: number, off = 0) => SR[Math.max(0, Math.min(SR.length - 1, Math.round(1 + ((lit - 0.62) / 0.4) * 4) + off))];
const seg = (c: Ctx, p: { x: number; y: number }, q: { x: number; y: number }, col: string, w = 1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); };
const centroid = (pts: Pt[]) => ({ x: pts.reduce((s, p) => s + p.x, 0) / pts.length, z: pts.reduce((s, p) => s + p.z, 0) / pts.length });
/** An edge's outward normal (unit), square to the edge, away from the middle. */
const normalOf = (a: Pt, b: Pt, mid: Pt) => {
  let nx = b.z - a.z, nz = -(b.x - a.x); const l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l;
  if (nx * ((a.x + b.x) / 2 - mid.x) + nz * ((a.z + b.z) / 2 - mid.z) < 0) { nx = -nx; nz = -nz; }
  return { x: nx, z: nz };
};
/** Plain edges, named by their index (a square's faces: 0 back, 1 +x side, 2 front, 3 -x side), measured from their start. */
const plainEdges = (pts: Pt[]): Edge[] => pts.map((a, i) => { const b = pts[(i + 1) % pts.length], l = Math.hypot(b.x - a.x, b.z - a.z) || 1; return { tag: String(i), o: a, d: { x: (b.x - a.x) / l, z: (b.z - a.z) / l } }; });

const drawBox = (c: Ctx, v: View, corners: Pt[], y0: number, y1: number, o: BoxOpts, edges = plainEdges(corners)) => {
  const cam = camPos(v);
  const mid = centroid(corners);
  const stone = o.col === STONE || o.col === STONE_WING || o.col === SHRINE;
  const tone = o.col === STONE ? 0 : -1;
  const n = corners.length;
  for (let i = 0; i < n; i++) {
    const a = corners[i], b = corners[(i + 1) % n], E = edges[i];
    // (a cut face: up against the piece next to it, never seen)
    if (E.tag === 'cut') continue;
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    if (len < 1) continue;
    const { x: nx, z: nz } = normalOf(a, b, mid);
    // (turned away: not seen)
    if (nx * (cam.x - a.x) + nz * (cam.z - a.z) <= 0) continue;
    const lit = 0.62 + 0.4 * Math.max(0, nx * SUN.x + nz * SUN.z);
    const top = (t: number) => (o.broken && t > 0.25 && t < 0.75 ? y1 - 26 - 18 * Math.sin(t * 40 + i) ** 2 : y1);
    const pts: { x: number; y: number }[] = [proj(v, a.x, y0, a.z), proj(v, b.x, y0, b.z)];
    for (let t = 1; t >= 0; t -= 0.125) pts.push(proj(v, a.x + (b.x - a.x) * t, top(t), a.z + (b.z - a.z) * t));
    const face = stone ? stoneAt(lit, tone) : shade(o.col, lit);
    poly(c, pts, face);
    const P = (t: number, y: number) => proj(v, a.x + (b.x - a.x) * t, y, a.z + (b.z - a.z) * t);
    const dk = stone ? stoneAt(lit, tone - 2) : shade(o.col, lit * 0.7), lt = stone ? stoneAt(lit, tone + 1) : shade(o.col, lit * 1.15);
    // (moss along the foot, if it's stood on the floor)
    if (y0 === 0) poly(c, [P(0, y0), P(1, y0), P(1, y0 + 9), P(0, y0 + 9)], MOSS[1]);
    // (the courses: a dark joint, a lit lip under it; the blocks' joints staggered course to course, all on the one
    // grid up the building, so pieces stacked on each other carry the same courses on)
    const nj = Math.max(1, Math.round(len / 64));
    for (let y = Math.ceil((y0 + 1) / 17) * 17, row = Math.round(y / 17); y < y1 - 6; y += 17, row++) {
      seg(c, P(0, y), P(1, y), dk); seg(c, P(0, y - 1.5), P(1, y - 1.5), lt);
      const yb = Math.min(y + 17, y1 - 2);
      for (let j = 0; j < nj; j++) { const t = (j + (row % 2 ? 0.5 : 0.1)) / nj; if (t < 0.98) seg(c, P(t, y), P(t, yb), dk); }
    }
    // (the cornice: lit along the top edge, its shadow under it)
    if (!o.broken && y1 - y0 > 14) { poly(c, [P(0, y1 - 6), P(1, y1 - 6), P(1, y1), P(0, y1)], stone ? stoneAt(lit, tone + 2) : lt); seg(c, P(0, y1 - 7), P(1, y1 - 7), dk); }
    // (glyph panels, carved in, and a vine or two down it)
    if (y1 - y0 >= 60 && nj >= 2) for (let j = 1; j < nj; j += 2) {
      const t = j / nj, w2 = 0.35 / nj, yy = (y0 + y1) / 2;
      poly(c, [P(t - w2, yy - 10), P(t + w2, yy - 10), P(t + w2, yy + 10), P(t - w2, yy + 10)], dk);
      poly(c, [P(t - w2 * 0.6, yy - 6), P(t + w2 * 0.6, yy - 6), P(t + w2 * 0.6, yy + 6), P(t - w2 * 0.6, yy + 6)], face);
      seg(c, P(t - w2, yy + 10), P(t + w2, yy + 10), lt);
    }
    if (y1 - y0 > 14 && len > 30) for (let j = 0; j < 3; j++) { const t = ((j * 0.37 + i * 0.21) % 0.9) + 0.05, hgt = (y1 - y0) * (0.3 + ((j + i) % 3) * 0.2); seg(c, P(t, y1 - 4), P(t + 0.004, y1 - hgt), MOSS[2], 2); }
    if (o.onFace) {
      // (kept to its face)
      c.save(); c.beginPath(); pts.forEach((p, k) => (k ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath(); c.clip();
      o.onFace(c, v, E.tag, (along, y, out = 0) => proj(v, E.o.x + E.d.x * along + nx * out, y, E.o.z + E.d.z * along + nz * out));
      c.restore();
    }
  }
  // Its top, if it's below the eye
  if (HC > y1 && !o.broken) poly(c, corners.map(p => proj(v, p.x, y1, p.z)), stone ? stoneAt(1, tone + 1) : shade(o.col, 1.12));
};
/** The temple's footprint at this half-size (its middle out at TD, toward the loop's open side). */
const square = (a: number): Pt[] => [{ x: -a, z: -a - TD }, { x: a, z: -a - TD }, { x: a, z: a - TD }, { x: -a, z: a - TD }];

/** The wing's line: out from the loop's middle (WD), and across it (WE). */
const WD = { x: Math.sin(WING_A), z: Math.cos(WING_A) }, WE = { x: Math.cos(WING_A), z: -Math.sin(WING_A) };
const wingAt = (u: number, s: number) => ({ x: WD.x * u + WE.x * s, z: WD.z * u + WE.z * s });
/** A box along the wing's line (u out from the loop's middle, w across), its edges named: `near` the face he comes up
 *  to (the tree hit it), `tail` its far end, `back`, `end` the end at the temple. */
const wingBox = (u0: number, u1: number, w: number): { pts: Pt[]; edges: Edge[] } => {
  const pts = [wingAt(u0, -w / 2), wingAt(u1, -w / 2), wingAt(u1, w / 2), wingAt(u0, w / 2)];
  return { pts, edges: [{ tag: 'near', o: pts[0], d: WD }, { tag: 'tail', o: pts[1], d: WE }, { tag: 'back', o: pts[2], d: { x: -WD.x, z: -WD.z } }, { tag: 'end', o: pts[3], d: { x: -WE.x, z: -WE.z } }] };
};
/** A footprint cut down to one side of x = at (`keep` +1: x past it; -1: short of it), the cut's edge named `cut`. */
const clipX = (f: { pts: Pt[]; edges: Edge[] }, at: number, keep: 1 | -1) => {
  const pts: Pt[] = [], edges: Edge[] = [], n = f.pts.length;
  const cut: Edge = { tag: 'cut', o: { x: at, z: 0 }, d: { x: 0, z: 1 } };
  for (let i = 0; i < n; i++) {
    const A = f.pts[i], B = f.pts[(i + 1) % n];
    const da = (A.x - at) * keep, db = (B.x - at) * keep;
    if (da >= 0) { pts.push(A); edges.push(f.edges[i]); }
    if ((da >= 0) !== (db >= 0)) {
      const t = da / (da - db);
      pts.push({ x: A.x + (B.x - A.x) * t, z: A.z + (B.z - A.z) * t });
      edges.push(da >= 0 ? cut : f.edges[i]);
    }
  }
  return { pts, edges };
};

// ---------------------------------------------------------------------------------------------------------------

const STONE = SR[4], STONE_WING = SR[3], SHRINE = SR[2];
const TIERS = 5, TIER_H = 70, BASE = 300, INSET = 45;
const SHRINE_A = 90, SHRINE_H = 90;

/** Something in the scene to put in order: what it stands on (a footprint; a tree's just its trunk's point), from how
 *  high to how high, how far off its middle is (the tie-break), and drawing it. */
export interface OrbitItem { foot: Pt[]; y0: number; y1: number; z: number; draw: () => void }

/** The temple: its stepped tiers (stairs up the front), the shrine on top with its roof caved in. A piece apiece. */
const templeItems = (c: Ctx, v: View): OrbitItem[] => {
  const out: OrbitItem[] = [];
  for (let i = 0; i < TIERS; i++) {
    const a = BASE - INSET * i, y0 = TIER_H * i, y1 = y0 + TIER_H, foot = square(a);
    out.push({ foot, y0, y1, z: depth(v, 0, -TD), draw: () => drawBox(c, v, foot, y0, y1, {
      col: STONE,
      // (the stairs, up the middle of the front: face 2 runs +x to -x on its loop side)
      onFace: (c2, _v, face, at) => {
        if (face !== '2') return;
        const s0 = a - 55, s1 = a + 55;
        poly(c2, [at(s0 - 8, y0), at(s0, y0), at(s0, y1), at(s0 - 8, y1)], SR[2]);
        poly(c2, [at(s1, y0), at(s1 + 8, y0), at(s1 + 8, y1), at(s1, y1)], SR[2]);
        poly(c2, [at(s0, y0), at(s1, y0), at(s1, y1), at(s0, y1)], SR[3]);
        // (each step: its lit tread, the riser's shadow under it)
        for (let y = y0 + 10; y < y1; y += 10) { const l = at(s0, y), r = at(s1, y), l2 = at(s0, y - 3), r2 = at(s1, y - 3); poly(c2, [l2, r2, r, l], SR[5]); seg(c2, l, r, SR[1]); }
      },
    }) });
  }
  // The shrine on top: its doorway (the jaguar's mouth), its roof fallen in
  const sy0 = TIER_H * TIERS, sf = square(SHRINE_A);
  out.push({ foot: sf, y0: sy0, y1: sy0 + SHRINE_H, z: depth(v, 0, -TD), draw: () => drawBox(c, v, sf, sy0, sy0 + SHRINE_H, {
    col: SHRINE, broken: true,
    onFace: (c2, _v, face, at) => {
      if (face !== '2') return;
      poly(c2, [at(SHRINE_A - 26, sy0), at(SHRINE_A + 26, sy0), at(SHRINE_A + 26, sy0 + 50), at(SHRINE_A, sy0 + 62), at(SHRINE_A - 26, sy0 + 50)], '#1C1917');
      // (its fangs)
      for (const s of [-14, 0, 14]) poly(c2, [at(SHRINE_A + s - 5, sy0 + 50), at(SHRINE_A + s + 5, sy0 + 50), at(SHRINE_A + s, sy0 + 40)], '#E7E5E4');
    },
  }) });
  return out;
};

/** The wing that runs out across the path (the wall at the end), knocked about where the last tree hit it. It comes
 *  off the temple's front corner: cut where it meets the steps (each slab of it sat on the step it's over, up to the
 *  next step's face), so no piece of it goes into the temple. */
const WING_H = 220;
const wingItems = (c: Ctx, v: View, hit: boolean): OrbitItem[] => {
  const low = wingBox(WING_U0, PR + 240, WING_W);
  const out: OrbitItem[] = [];
  const hitFace = (c2: Ctx, _v: View, face: string, at: (along: number, y: number, out?: number) => { x: number; y: number }) => {
    // (the face toward him as he comes: along it is out from the loop's middle)
    if (face !== 'near' || !hit) return;
    const u = HIT_U - WING_U0, pts: { x: number; y: number }[] = [];
    for (let k = 0; k < 10; k++) {
      const ang = (k / 10) * Math.PI * 2, rr = k % 2 ? 26 : 44;
      pts.push(at(u + Math.cos(ang) * rr, HIT_Y + Math.sin(ang) * rr * 0.8));
    }
    poly(c2, pts, '#3F3A35');
    c2.strokeStyle = '#2B2724'; c2.lineWidth = 2;
    for (const [du, dy] of [[-70, -50], [60, -70], [-40, 40]] as const) {
      const a0 = at(u, HIT_Y), a1 = at(u + du, HIT_Y + dy);
      c2.beginPath(); c2.moveTo(a0.x, a0.y); c2.lineTo(a1.x, a1.y); c2.stroke();
    }
  };
  // (the slabs: past the bottom step's face, all the way up; then over each step, from its top up)
  const steps = [BASE, BASE - INSET, BASE - INSET * 2, BASE - INSET * 3];
  steps.forEach((x, k) => {
    let f = clipX(low, x, 1);
    if (k > 0) f = clipX(f, steps[k - 1], -1);
    const y0 = k * TIER_H;
    if (f.pts.length < 3 || y0 >= WING_H) return;
    const m = centroid(f.pts);
    out.push({ foot: f.pts, y0, y1: WING_H, z: depth(v, m.x, m.z), draw: () => drawBox(c, v, f.pts, y0, WING_H, { col: STONE_WING, onFace: hitFace }, f.edges) });
  });
  // (its parapet, set back along the top)
  const up = wingBox(WING_U0, PR - 160, WING_W - 40);
  const um = centroid(up.pts);
  out.push({ foot: up.pts, y0: WING_H, y1: 300, z: depth(v, um.x, um.z), draw: () => drawBox(c, v, up.pts, WING_H, 300, { col: STONE_WING }, up.edges) });
  return out;
};

/**
 * Back to front. Anything one piece's footprint keeps clear of across one of its edges is behind or in front of it by
 * which side of that edge the camera's on; anything wholly above or below another, by which side of that height the
 * eye is. (Pieces up against each other, the trees round them, the blind: none drawn over what's in front of it, as
 * one point's depth each would.) Nothing to say either way: the further off first.
 */
const inOrder = (items: OrbitItem[], cam: Pt) => {
  const n = items.length;
  const before: number[][] = items.map(() => []), deg = new Array<number>(n).fill(0);
  const mids = items.map(it => centroid(it.foot));
  /** +1: q's in front of p (q's all outside one of p's edges, the camera on q's side of it); -1 behind; 0 neither. */
  const across = (p: number, q: number) => {
    const f = items[p].foot, g = items[q].foot, m = mids[p];
    if (f.length < 3) return 0;
    for (let i = 0; i < f.length; i++) {
      const a = f[i], b = f[(i + 1) % f.length];
      const nrm = normalOf(a, b, m);
      if (g.every(r => nrm.x * (r.x - a.x) + nrm.z * (r.z - a.z) >= -0.5)) return nrm.x * (cam.x - a.x) + nrm.z * (cam.z - a.z) > 0 ? 1 : -1;
    }
    return 0;
  };
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const A = items[i], B = items[j];
    // (+1: j's in front of i)
    let r: number;
    if (B.y0 >= A.y1 - 0.5) r = HC > A.y1 ? 1 : -1;
    else if (A.y0 >= B.y1 - 0.5) r = HC > B.y1 ? -1 : 1;
    else r = across(i, j) || -across(j, i);
    if (r > 0) { before[i].push(j); deg[j]++; } else if (r < 0) { before[j].push(i); deg[i]++; }
  }
  const done = new Array<boolean>(n).fill(false), out: OrbitItem[] = [];
  for (let k = 0; k < n; k++) {
    // (the furthest off of what's free to go; caught in a circle (it shouldn't be), the furthest off of the lot)
    let pick = -1;
    for (let i = 0; i < n; i++) if (!done[i] && deg[i] === 0 && (pick < 0 || items[i].z > items[pick].z)) pick = i;
    if (pick < 0) for (let i = 0; i < n; i++) if (!done[i] && (pick < 0 || items[i].z > items[pick].z)) pick = i;
    done[pick] = true; out.push(items[pick]);
    for (const j of before[pick]) deg[j]--;
  }
  return out;
};

/** A jungle tree (a scaled sprite: as big as it is near, dimmer further back): a two-tone trunk, a crown in steps. */
const LEAVES = ['#0F3A1C', '#16552A', '#22703A', '#3A8C44', '#62AE52'];
const LOBES: [number, number, number][] = [[0, 0, 1], [-0.7, 0.45, 0.7], [0.7, 0.45, 0.7], [-0.3, -0.35, 0.6], [0.4, -0.25, 0.55]];
const drawTree = (c: Ctx, v: View, px: number, pz: number, i: number) => {
  const b = proj(v, px, 0, pz);
  const h = 300 + ((i * 37) % 120), t = proj(v, px, h, pz);
  const dim = Math.max(0.5, Math.min(1, 1.3 - b.z / 3000));
  const tw = Math.max(2, Math.round(18 * b.k));
  // (stood on the ground: its shadow pooled round its foot, flattened by how far off it is; its roots flaring out)
  c.fillStyle = shade('#1E3A14', dim);
  c.beginPath(); c.ellipse(Math.round(b.x + tw * 0.6), Math.round(b.y), Math.max(3, tw * 2.4), Math.max(1, tw * 0.45), 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = shade('#3A2C1E', dim);
  c.beginPath(); c.moveTo(b.x - tw * 1.3, b.y + 1); c.lineTo(b.x - tw / 2, b.y - tw * 1.4); c.lineTo(b.x + tw / 2, b.y - tw * 1.4); c.lineTo(b.x + tw * 1.3, b.y + 1); c.closePath(); c.fill();
  c.fillStyle = shade('#4A3826', dim); c.fillRect(Math.round(b.x - tw / 2), Math.round(t.y), tw, Math.round(b.y - t.y));
  c.fillStyle = shade('#6E5438', dim); c.fillRect(Math.round(b.x - tw / 2), Math.round(t.y), Math.max(1, Math.round(tw / 3)), Math.round(b.y - t.y));
  const r = 70 * b.k;
  // (shadow, body, lit, highlight: each lobe in steps, lit from the upper left)
  const lobes = (col: string, ox: number, oy: number, k: number) => {
    c.fillStyle = shade(col, dim); c.beginPath();
    for (const [dx, dy, s] of LOBES) { const cx = t.x + dx * r + ox * r, cy = t.y + dy * r + oy * r; c.moveTo(cx + r * s * k, cy); c.arc(cx, cy, r * s * k, 0, Math.PI * 2); }
    c.fill();
  };
  lobes(LEAVES[0], 0.04, 0.08, 1.05);
  lobes(LEAVES[i % 3 ? 2 : 1], 0, 0, 0.92);
  lobes(LEAVES[3], -0.2, -0.22, 0.5);
  if (r > 12) { c.fillStyle = shade(LEAVES[4], dim); for (const [dx, dy, s] of LOBES) c.fillRect(Math.round(t.x + dx * r - r * s * 0.45), Math.round(t.y + dy * r - r * s * 0.5), Math.max(2, Math.round(r * s * 0.25)), Math.max(2, Math.round(r * 0.08))); }
};
/** The jungle round the loop (outside it: the loop's middle is open, the temple in full view), fixed in the world. */
const TREES: { x: number; z: number }[] = (() => {
  const out: { x: number; z: number }[] = [];
  const h = (n: number) => { const x = Math.sin(n * 91.7) * 43758.5; return x - Math.floor(x); };
  for (let i = 0; i < 46; i++) { const a = (i / 46) * Math.PI * 2; out.push(polar(PR + 260 + h(i) * 160, a)); }
  return out;
})();

/** A bumpy band round the loop at radius r (the jungle's canopy, the hills): its far side, as one shape. */
const band = (c: Ctx, v: View, r: number, height: (a: number) => number, col: string, nearest: number, crest?: string, bands?: [number, string][]) => {
  const tops: { x: number; y: number }[] = [], bases: { x: number; y: number }[] = [];
  for (let k = 0; k < 720; k++) {
    const a = (k / 720) * Math.PI * 2, p = polar(r, a);
    if (depth(v, p.x, p.z) < nearest) continue;
    tops.push(proj(v, p.x, height(a), p.z)); bases.push(proj(v, p.x, 0, p.z));
  }
  const order = tops.map((_, i) => i).sort((i, j) => tops[i].x - tops[j].x);
  if (order.length < 2) return;
  // (lit along its crest: the shape in a lighter step, then itself a little lower over it)
  const outline = (dy: number) => {
    c.beginPath();
    order.forEach((i, n) => (n ? c.lineTo(tops[i].x, tops[i].y + dy) : c.moveTo(tops[i].x, tops[i].y + dy)));
    for (let n = order.length - 1; n >= 0; n--) c.lineTo(bases[order[n]].x, bases[order[n]].y + 3);
    c.closePath();
  };
  const layer = (dy: number, cl: string) => { c.fillStyle = cl; outline(dy); c.fill(); };
  /** A step down into `cl` at dy under the crest: a row of dither, then the step solid. */
  const step = (dy: number, cl: string) => { c.save(); outline(dy - 2); c.clip(); checker(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, cl, 0); c.restore(); layer(dy, cl); };
  if (crest) { layer(0, crest); step(4, col); } else layer(0, col);
  // (darker going down, in steps following the crest: the far side of the hills in their own shade)
  if (bands) for (const [dy, cl] of bands) step(dy, cl);
};

// ---------------------------------------------------------------------------------------------------------------
// The floor, Mode 7 style: row by row, each row scaled for how far off it is, chunky (a quarter size, blown up)

const FS = 4, FW = CANVAS_WIDTH / FS, FH = CANVAS_HEIGHT / FS;
let floorCanvas: HTMLCanvasElement | null = null, floorImg: ImageData | null = null;
const HAZE_DAY = [150, 196, 160];
const mixRgb = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k);
const GRASS = [[61, 107, 26], [70, 120, 30]], GRASS_DOT = [92, 140, 40];
const DIRT = [138, 110, 75], DIRT_DK = [112, 88, 58], FOOT = [107, 90, 64], JUNGLE = [31, 77, 36];
const hash2 = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5; return x - Math.floor(x); };

const drawFloor = (c: Ctx, v: View) => {
  if (typeof document === 'undefined') return;
  if (!floorCanvas) { floorCanvas = document.createElement('canvas'); floorCanvas.width = FW; floorCanvas.height = FH; floorImg = floorCanvas.getContext('2d')!.createImageData(FW, FH); }
  const d = floorImg!.data;
  d.fill(0);
  // (the haze at the hour's color)
  const hz = timeOfDay().haze, HAZE = mixRgb(HAZE_DAY, [1, 3, 5].map(i => parseInt(hz.slice(i, i + 2), 16)), Math.max(0, timeOfDay().skyK - 0.1));
  const cam = camPos(v);
  const rx = v.cos, rz = -v.sin, fx = -v.sin, fz = -v.cos;
  const row0 = Math.max(0, Math.floor(v.hy / FS) + 1);
  for (let ry = row0; ry < FH; ry++) {
    const sy = ry * FS + FS / 2 - v.hy;
    if (sy <= 0) continue;
    const Z = (F * HC) / sy;
    // (banded haze toward the horizon, in steps, not smooth)
    const fog = Z > 5200 ? 0.75 : Z > 3800 ? 0.5 : Z > 2900 ? 0.25 : 0;
    for (let rxi = 0; rxi < FW; rxi++) {
      const X = ((rxi * FS + FS / 2 - CANVAS_WIDTH / 2) * Z) / F;
      const px = cam.x + rx * X + fx * Z, pz = cam.z + rz * X + fz * Z;
      const r = Math.hypot(px, pz);
      let col: number[];
      if (r > PR + 470) col = JUNGLE;
      // (the beaten earth round the foot of the temple and its wing: just a lip round what's stood there)
      else if (Math.abs(px) < BASE + 12 && Math.abs(pz + TD) < BASE + 12) col = FOOT;
      else if (px * WD.x + pz * WD.z > WING_U0 - 12 && px * WD.x + pz * WD.z < PR + 252 && Math.abs(px * WE.x + pz * WE.z) < WING_W / 2 + 12) col = FOOT;
      else {
        const off = Math.abs(r - PR);
        const a = Math.atan2(px, pz);
        if (off < 70 && a > A_START - 0.15 && a < WING_A + 0.1) col = off > 44 && off < 52 ? DIRT_DK : DIRT;
        else {
          col = GRASS[(Math.floor(px / 90) + Math.floor(pz / 90)) & 1];
          if (hash2(Math.floor(px / 30), Math.floor(pz / 30)) > 0.86) col = GRASS_DOT;
        }
      }
      const o = (ry * FW + rxi) * 4;
      d[o] = col[0] + (HAZE[0] - col[0]) * fog; d[o + 1] = col[1] + (HAZE[1] - col[1]) * fog; d[o + 2] = col[2] + (HAZE[2] - col[2]) * fog; d[o + 3] = 255;
    }
  }
  floorCanvas!.getContext('2d')!.putImageData(floorImg!, 0, 0);
  c.save(); c.imageSmoothingEnabled = false;
  c.drawImage(floorCanvas!, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  c.restore();
};

/** The lot: sky, hills, the jungle round the loop, its floor (the path's far side on it), the temple, back to front.
 *  `extra`: something else stood out there (Artie's blind, tower.ts), put in order with the rest; or, coming round
 *  onto the strip, over the lot. */
export const drawOrbitBackdrop = (c: Ctx, state: GameState, templeHit: boolean, extra?: { item: OrbitItem; over: boolean } | null) => {
  const v = viewOf(state);
  // Sky, in bands (no smooth gradient: the old way)
  // (as the hour has it: timeOfDay.ts)
  const tod = timeOfDay();
  const SKY = skyRamp(['#2A7FC9', '#3A8FD3', '#4C9FDB', '#62AFE0', '#7CBFE4', '#98CEE6', '#B4DCE6'], tod);
  const top = Math.max(0, Math.min(v.hy, CANVAS_HEIGHT));
  for (let i = 0; i < SKY.length; i++) { c.fillStyle = SKY[i]; c.fillRect(0, Math.floor((top * i) / SKY.length), CANVAS_WIDTH, Math.ceil(top / SKY.length) + 1); }
  c.fillStyle = SKY[SKY.length - 1]; c.fillRect(0, top, CANVAS_WIDTH, CANVAS_HEIGHT - top);
  // (after sundown, the stars, turning with the loop; the moon, the sun low over the hills)
  drawStars(c, 0, 0, CANVAS_WIDTH, top, state.frame, v.phi * 1600, tod);
  const sk = ((((-v.phi * 700 + 560) % 1600) + 1600) % 1600) - 400;
  drawMoon(c, sk, Math.max(40, top - 300), 18, tod);
  { const s = sunAt(sk + 300, top - 240, top, tod); drawSun(c, s.x, s.y, 22, tod); }
  // The hills, far off (they slide by the other way, fastest); a nearer ridge
  // (clouds, going round with the loop, slowly drifting)
  const cc = [cloudTint('#B9C6DA', tod), cloudTint('#E6ECF4', tod), cloudTint('#FFFFFF', tod)];
  for (let i = 0; i < 5; i++) {
    const cx = ((((-v.phi * 900 + i * 380 + state.frame * 0.05) % 1900) + 1900) % 1900) - 300, cy = 50 + ((i * 53) % 120);
    if (cy > top - 40) continue;
    for (const [dx, dy, rw, rh, k] of [[0, 6, 40, 10, 0], [-22, 0, 22, 12, 1], [12, -4, 26, 16, 1], [30, 4, 18, 9, 1], [4, -8, 16, 9, 2]] as const) pixelBlob(c, cx + dx * 1.4, cy + dy * 1.4, rw * 1.4, rh * 1.4, cc[k]);
  }
  // (farthest: the peaks, palest, jagged, in steps of shade down them; then the hills, then the nearer ridge, each
  // darker and greener, banded darker going down)
  const hzd = (col: string, k: number, far = 1) => mix(farTint(col, far, tod), SKY[SKY.length - 1], k);
  const jagA = (a: number, n: number, seed: number) => { const x = Math.sin(Math.floor(a * n) * 91.7 + seed) * 43758.5; return x - Math.floor(x) - 0.5; };
  band(c, v, 5600, a => 1250 + 420 * Math.sin(4 * a + 0.5) + 200 * Math.sin(9 * a + 2) + 90 * Math.sin(23 * a) + 70 * jagA(a, 160, 3), hzd('#7A9AAE', 0.45), 600, hzd('#B8D0DC', 0.45),
    [[10, hzd('#6A889C', 0.45)], [26, hzd('#5E7C90', 0.5)]]);
  band(c, v, 4200, a => 700 + 260 * Math.sin(3 * a) + 140 * Math.sin(7 * a + 1) + 60 * Math.sin(17 * a + 2) + 30 * jagA(a, 240, 7), hzd('#6E9C96', 0.15), 600, hzd('#94BEB6', 0.15),
    [[12, hzd('#5E8C84', 0.15)], [28, hzd('#527E76', 0.18)], [50, hzd('#48706A', 0.22)]]);
  band(c, v, 3000, a => 380 + 120 * Math.sin(5 * a + 2) + 70 * Math.sin(13 * a) + 26 * Math.abs(Math.sin(70 * a)), farTint('#4A7A5E', 0.7, tod), 600, farTint('#6A9A6E', 0.7, tod),
    [[14, farTint('#3E6C50', 0.7, tod)], [32, farTint('#346046', 0.7, tod)]]);
  drawFloor(c, v);
  // The jungle's canopy round the loop (its far side)
  band(c, v, PR + 520, a => 330 + 60 * Math.sin(9 * a) + 40 * Math.sin(23 * a + 1), '#1B5E2E', DC - 150, '#2E7A3A');
  // The trees round about, the temple and its wing, back to front (the near side of the loop is the play strip's)
  const items: OrbitItem[] = [];
  TREES.forEach((p, i) => { const z = depth(v, p.x, p.z); if (z > F + 420) items.push({ foot: [p], y0: 0, y1: 370 + ((i * 37) % 120), z, draw: () => drawTree(c, v, p.x, p.z, i) }); });
  items.push(...templeItems(c, v), ...wingItems(c, v, templeHit));
  if (extra && !extra.over) items.push(extra.item);
  inOrder(items, camPos(v)).forEach(it => it.draw());
  if (extra?.over) extra.item.draw();
};
