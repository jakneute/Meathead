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
//
// The loop's angle is world x over its radius, so the near side of it moves with the strip (1:1 where it meets it).
//
// Crude (the first pass): flat-shaded boxes, lit from one side (so the faces change as they turn).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { GY } from '../geometry';
import { x0, TEMPLE_X } from './arena';

type Ctx = CanvasRenderingContext2D;

/** The strip's wrapped round a cylinder of this (a gentle bend: the fight's edges stay put). */
export const ORBIT_WRAP = 700;
/** The loop: its radius; its angle where he comes in (left of the temple) and where it ends (the wing), even about 0. */
const PR = 560;
const A_END = (TEMPLE_X - x0) / PR / 2, A_START = -A_END;
/** The temple's middle: out from the loop's middle toward its open side (polar angle PI), front (stairs) facing in. */
const TD = 420;
/** The camera: focal length (the near side of the loop at 1:1 on the strip), how far out from the loop's middle, how high. */
const F = 900, DC = F + PR, HC = 400;
/** The temple's wing across the path at its end: how wide, the angle its middle's at (its near face at the wall). */
const WING_W = 180;
const WING_A = A_END + Math.asin(WING_W / 2 / PR);
const WING_U0 = 300;
/** Where the last tree hits the wing (its face, out at the path; how high). */
const HIT_U = PR - 10, HIT_Y = 221;
/** Light from one side (world-fixed: the faces brighten and darken as they come round). */
const SUN = (() => { const x = -0.6, z = 0.75, l = Math.hypot(x, z); return { x: x / l, z: z / l }; })();

/** The loop's angle at a world x. */
export const orbitAngle = (worldX: number) => A_START + (worldX - x0) / PR;

interface View { phi: number; hy: number; cos: number; sin: number }
const viewOf = (state: GameState): View => {
  const phi = orbitAngle(state.camera.x + CANVAS_WIDTH / 2);
  // (the horizon put where the near side of the loop lands on the strip's ground, wherever the camera is up and down)
  return { phi, hy: GY - state.camera.y - HC, cos: Math.cos(phi), sin: Math.sin(phi) };
};
/** A ground-plane point (px, pz: the loop's middle at 0) at height y: on screen, how far, its scale. */
const proj = (v: View, px: number, y: number, pz: number) => {
  const X = px * v.cos - pz * v.sin, Z = DC - px * v.sin - pz * v.cos;
  const k = F / Math.max(40, Z);
  return { x: CANVAS_WIDTH / 2 + X * k, y: v.hy + (HC - y) * k, z: Z, k };
};
const depth = (v: View, px: number, pz: number) => DC - px * v.sin - pz * v.cos;
const polar = (r: number, a: number) => ({ x: r * Math.sin(a), z: r * Math.cos(a) });
const camPos = (v: View) => ({ x: DC * v.sin, z: DC * v.cos });

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
// Boxes (the temple's tiers, its wing): a footprint (four corners, going round), from y0 up to y1

type Pt = { x: number; z: number };
interface BoxOpts {
  col: string;
  /** Something on a face once it's drawn (stairs, damage): which face (its corner index), and the face's frame. */
  onFace?: (c: Ctx, v: View, face: number, at: (along: number, y: number, out?: number) => { x: number; y: number }) => void;
  /** The top edge broken (the roof caved in): its notches. */
  broken?: boolean;
}
const drawBox = (c: Ctx, v: View, corners: Pt[], y0: number, y1: number, o: BoxOpts) => {
  const cam = camPos(v);
  const mid = { x: corners.reduce((s, p) => s + p.x, 0) / 4, z: corners.reduce((s, p) => s + p.z, 0) / 4 };
  for (let i = 0; i < 4; i++) {
    const a = corners[i], b = corners[(i + 1) % 4];
    const m = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
    let nx = m.x - mid.x, nz = m.z - mid.z; const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl;
    // (turned away: not seen)
    if (nx * (cam.x - m.x) + nz * (cam.z - m.z) <= 0) continue;
    const lit = 0.62 + 0.4 * Math.max(0, nx * SUN.x + nz * SUN.z);
    const top = (t: number) => (o.broken && t > 0.25 && t < 0.75 ? y1 - 26 - 18 * Math.sin(t * 40 + i) ** 2 : y1);
    const pts: { x: number; y: number }[] = [proj(v, a.x, y0, a.z), proj(v, b.x, y0, b.z)];
    for (let t = 1; t >= 0; t -= 0.125) pts.push(proj(v, a.x + (b.x - a.x) * t, top(t), a.z + (b.z - a.z) * t));
    poly(c, pts, shade(o.col, lit));
    // (a course of stone, or two)
    c.strokeStyle = shade(o.col, lit * 0.78); c.lineWidth = 1;
    for (let y = y0 + 34; y < y1 - 8; y += 34) {
      const p = proj(v, a.x, y, a.z), q = proj(v, b.x, y, b.z);
      c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke();
    }
    if (o.onFace) {
      const len = Math.hypot(b.x - a.x, b.z - a.z), ux = (b.x - a.x) / len, uz = (b.z - a.z) / len;
      o.onFace(c, v, i, (along, y, out = 0) => proj(v, a.x + ux * along + nx * out, y, a.z + uz * along + nz * out));
    }
  }
  // Its top, if it's below the eye
  if (HC > y1 && !o.broken) poly(c, corners.map(p => proj(v, p.x, y1, p.z)), shade(o.col, 1.12));
};
/** The temple's footprint at this half-size (its middle out at TD, toward the loop's open side). */
const square = (a: number): Pt[] => [{ x: -a, z: -a - TD }, { x: a, z: -a - TD }, { x: a, z: a - TD }, { x: -a, z: a - TD }];
/** A box along the wing's line: u out from the loop's middle, w across. */
const wingBox = (u0: number, u1: number, w: number): Pt[] => {
  const d = { x: Math.sin(WING_A), z: Math.cos(WING_A) }, e = { x: Math.cos(WING_A), z: -Math.sin(WING_A) };
  const at = (u: number, s: number) => ({ x: d.x * u + e.x * s, z: d.z * u + e.z * s });
  return [at(u0, -w / 2), at(u1, -w / 2), at(u1, w / 2), at(u0, w / 2)];
};

// ---------------------------------------------------------------------------------------------------------------

const STONE = '#8C8378', STONE_WING = '#81786D', SHRINE = '#7C6F62';
const TIERS = 5, TIER_H = 70, BASE = 300, INSET = 45;
const SHRINE_A = 90, SHRINE_H = 90;

/** The temple: its stepped tiers (stairs up the front), the shrine on top with its roof caved in. */
const drawTemple = (c: Ctx, v: View) => {
  for (let i = 0; i < TIERS; i++) {
    const a = BASE - INSET * i, y0 = TIER_H * i, y1 = y0 + TIER_H;
    drawBox(c, v, square(a), y0, y1, {
      col: STONE,
      // (the stairs, up the middle of the front: face 2 runs +x to -x on its loop side)
      onFace: (c2, _v, face, at) => {
        if (face !== 2) return;
        const s0 = a - 55, s1 = a + 55;
        poly(c2, [at(s0, y0), at(s1, y0), at(s1, y1), at(s0, y1)], '#6B6259');
        c2.strokeStyle = '#A39A8F'; c2.lineWidth = 1;
        for (let y = y0 + 10; y < y1; y += 12) { const l = at(s0, y), r = at(s1, y); c2.beginPath(); c2.moveTo(l.x, l.y); c2.lineTo(r.x, r.y); c2.stroke(); }
      },
    });
  }
  // The shrine on top: its doorway (the jaguar's mouth), its roof fallen in
  const sy0 = TIER_H * TIERS;
  drawBox(c, v, square(SHRINE_A), sy0, sy0 + SHRINE_H, {
    col: SHRINE, broken: true,
    onFace: (c2, _v, face, at) => {
      if (face !== 2) return;
      poly(c2, [at(SHRINE_A - 26, sy0), at(SHRINE_A + 26, sy0), at(SHRINE_A + 26, sy0 + 50), at(SHRINE_A, sy0 + 62), at(SHRINE_A - 26, sy0 + 50)], '#1C1917');
      // (its fangs)
      for (const s of [-14, 0, 14]) poly(c2, [at(SHRINE_A + s - 5, sy0 + 50), at(SHRINE_A + s + 5, sy0 + 50), at(SHRINE_A + s, sy0 + 40)], '#E7E5E4');
    },
  });
};

/** The wing that runs out across the path (the wall at the end), knocked about where the last tree hit it. */
const drawWing = (c: Ctx, v: View, hit: boolean) => {
  drawBox(c, v, wingBox(WING_U0, PR + 240, WING_W), 0, 220, {
    col: STONE_WING,
    onFace: (c2, _v, face, at) => {
      // (face 0 is the one toward him as he comes: along it is out from the loop's middle)
      if (face !== 0 || !hit) return;
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
    },
  });
  drawBox(c, v, wingBox(WING_U0, PR - 160, WING_W - 40), 220, 300, { col: STONE_WING });
};

/** A jungle tree (a scaled sprite: as big as it is near, dimmer further back). */
const drawTree = (c: Ctx, v: View, px: number, pz: number, i: number) => {
  const b = proj(v, px, 0, pz);
  const h = 300 + ((i * 37) % 120), t = proj(v, px, h, pz);
  const dim = Math.max(0.5, Math.min(1, 1.3 - b.z / 3000));
  c.fillStyle = shade('#4A3826', dim); c.fillRect(Math.round(b.x - 9 * b.k), Math.round(t.y), Math.max(1, Math.round(18 * b.k)), Math.round(b.y - t.y));
  c.fillStyle = shade(i % 3 ? '#166534' : '#14532D', dim);
  const r = 70 * b.k;
  c.beginPath(); c.arc(t.x, t.y, r, 0, Math.PI * 2); c.arc(t.x - r * 0.7, t.y + r * 0.45, r * 0.7, 0, Math.PI * 2); c.arc(t.x + r * 0.7, t.y + r * 0.45, r * 0.7, 0, Math.PI * 2); c.fill();
  c.fillStyle = shade('#22A04B', dim); c.fillRect(Math.round(t.x - r * 0.5), Math.round(t.y - r * 0.8), Math.round(r * 0.6), Math.max(1, Math.round(r * 0.2)));
};
/** The jungle round the loop (outside it: the loop's middle is open, the temple in full view), fixed in the world. */
const TREES: { x: number; z: number }[] = (() => {
  const out: { x: number; z: number }[] = [];
  const h = (n: number) => { const x = Math.sin(n * 91.7) * 43758.5; return x - Math.floor(x); };
  for (let i = 0; i < 46; i++) { const a = (i / 46) * Math.PI * 2; out.push(polar(PR + 260 + h(i) * 160, a)); }
  return out;
})();

/** A bumpy band round the loop at radius r (the jungle's canopy, the hills): its far side, as one shape. */
const band = (c: Ctx, v: View, r: number, height: (a: number) => number, col: string, nearest: number) => {
  const tops: { x: number; y: number }[] = [], bases: { x: number; y: number }[] = [];
  for (let k = 0; k < 720; k++) {
    const a = (k / 720) * Math.PI * 2, p = polar(r, a);
    if (depth(v, p.x, p.z) < nearest) continue;
    tops.push(proj(v, p.x, height(a), p.z)); bases.push(proj(v, p.x, 0, p.z));
  }
  const order = tops.map((_, i) => i).sort((i, j) => tops[i].x - tops[j].x);
  if (order.length < 2) return;
  c.fillStyle = col; c.beginPath();
  order.forEach((i, n) => (n ? c.lineTo(tops[i].x, tops[i].y) : c.moveTo(tops[i].x, tops[i].y)));
  for (let n = order.length - 1; n >= 0; n--) c.lineTo(bases[order[n]].x, bases[order[n]].y + 3);
  c.closePath(); c.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// The floor, Mode 7 style: row by row, each row scaled for how far off it is, chunky (a quarter size, blown up)

const FS = 4, FW = CANVAS_WIDTH / FS, FH = CANVAS_HEIGHT / FS;
let floorCanvas: HTMLCanvasElement | null = null, floorImg: ImageData | null = null;
const HAZE = [150, 196, 160];
const GRASS = [[61, 107, 26], [70, 120, 30]], GRASS_DOT = [92, 140, 40];
const DIRT = [138, 110, 75], DIRT_DK = [112, 88, 58], FOOT = [107, 90, 64], JUNGLE = [31, 77, 36];
const hash2 = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5; return x - Math.floor(x); };

const drawFloor = (c: Ctx, v: View) => {
  if (typeof document === 'undefined') return;
  if (!floorCanvas) { floorCanvas = document.createElement('canvas'); floorCanvas.width = FW; floorCanvas.height = FH; floorImg = floorCanvas.getContext('2d')!.createImageData(FW, FH); }
  const d = floorImg!.data;
  d.fill(0);
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
      else if (Math.abs(px) < BASE + 50 && Math.abs(pz + TD) < BASE + 50) col = FOOT;
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

/** The lot: sky, hills, the jungle round the loop, its floor (the path's far side on it), the temple, back to front. */
export const drawOrbitBackdrop = (c: Ctx, state: GameState, templeHit: boolean) => {
  const v = viewOf(state);
  // Sky, in bands (no smooth gradient: the old way)
  const SKY = ['#2A7FC9', '#3A8FD3', '#4C9FDB', '#62AFE0', '#7CBFE4', '#98CEE6', '#B4DCE6'];
  const top = Math.max(0, Math.min(v.hy, CANVAS_HEIGHT));
  for (let i = 0; i < SKY.length; i++) { c.fillStyle = SKY[i]; c.fillRect(0, Math.floor((top * i) / SKY.length), CANVAS_WIDTH, Math.ceil(top / SKY.length) + 1); }
  c.fillStyle = '#B4DCE6'; c.fillRect(0, top, CANVAS_WIDTH, CANVAS_HEIGHT - top);
  // The hills, far off (they slide by the other way, fastest); a nearer ridge
  band(c, v, 4200, a => 700 + 260 * Math.sin(3 * a) + 140 * Math.sin(7 * a + 1) + 60 * Math.sin(17 * a + 2), '#6E9C96', 600);
  band(c, v, 3000, a => 380 + 120 * Math.sin(5 * a + 2) + 70 * Math.sin(13 * a), '#4A7A5E', 600);
  drawFloor(c, v);
  // The jungle's canopy round the loop (its far side)
  band(c, v, PR + 520, a => 330 + 60 * Math.sin(9 * a) + 40 * Math.sin(23 * a + 1), '#1B5E2E', DC - 150);
  // The trees round about and the temple, back to front (the near side of the loop is the play strip's)
  const items: { z: number; draw: () => void }[] = [];
  TREES.forEach((p, i) => { const z = depth(v, p.x, p.z); if (z > F + 420) items.push({ z, draw: () => drawTree(c, v, p.x, p.z, i) }); });
  items.push({ z: depth(v, 0, -TD), draw: () => drawTemple(c, v) });
  const wm = polar((WING_U0 + PR + 240) / 2, WING_A);
  items.push({ z: depth(v, wm.x, wm.z), draw: () => drawWing(c, v, templeHit) });
  items.sort((a, b) => b.z - a.z).forEach(it => it.draw());
};
