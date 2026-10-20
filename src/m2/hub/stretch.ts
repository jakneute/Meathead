// Each land's stretch of the hub, teasing it: the ground under the promenade in its paving, its buildings along the
// back (its architecture, its materials, its colors), its trees, its landmark up close (Jungle Land's fake rock with
// the falls coming down it, Spooky Land's cemetery gate, Future Land's rocket and saucer, Hollywood Land's studio gate
// and soundstage, Foreign Lands' pavilions, Wilderness Land's fort and water tower, Fairy Land's storybook tower and
// topiary, Cartoon Land's candy-striped water tower), and along the back of the walk its fence (split rail, wrought
// iron, velvet rope, bamboo, a hedge...).
//
// Between two lands, where the lamp post is, they run into each other: the paving dithered from one into the other, a
// plain box hedge both share, one land's trees among the other's, a kiosk on a little plaza of its own.
//
// All of it's still: painted once into stamps a half-stretch wide (draw.ts puts them down), anything that moves (the
// falls, the flames, the flags) drawn live over them (`drawStretchLive`).

import { GROUND_Y } from '../../m1/constants';
import { type Ctx, INK, mix, hash, checker, box, R6, crown, flag } from './kit';
import { SPOTS, HUB_SLOTS, LANDS } from './lands';
import { HUB, HUB_CIRC, slotX, seamX, ROW, GATE, PATH, HUB_HORIZON, depthAt } from './geometry';
import { puffTree } from '../cartoon/kit';
import { COBBLE } from '../fantasy/kit';
import { stucco, barrelTile } from '../foreign/kit';
import { signText, type Look } from '../signLetters';
import { FACADES } from './buildings';
import { wall, clapboard, flatTop, gableBack, awning, board, bulbs, poly, polyI, seg } from './bkit';

/** Which kind of stretch a spot is: a land's id, America USA's street, or the back of the staff building. */
export type StretchId = 'space' | 'frontier' | 'spooky' | 'cartoon' | 'america' | 'hollywood' | 'fantasy' | 'adventure' | 'foreign' | 'staff';
export const stretchOf = (slot: number): StretchId => {
  const s = SPOTS[((slot % HUB_SLOTS) + HUB_SLOTS) % HUB_SLOTS];
  return s.kind === 'land' ? (LANDS[s.land].id as StretchId) : s.kind;
};
/** The spot a world x is in. */
export const slotAt = (x: number) => ((Math.floor((x - HUB.x0) / HUB.slot) % HUB_SLOTS) + HUB_SLOTS) % HUB_SLOTS;

const B = ROW.back, FY = ROW.fence;

// ---------------------------------------------------------------------------------------------------------------
// Ground: the promenade's paving, by land (courses getting deeper toward the walk)

interface Ground { base: string; joint: string; lit: string; fleck?: string; paint?: (g: Ctx, x0: number, x1: number) => void }
const COURSES = [[B, 6], [B + 6, 7], [B + 13, 8], [B + 21, 9]] as const;
/** Paving in courses across [x0, x1): each stone a step of its own, its joint, a lit lip. */
const courses = (g: Ctx, x0: number, x1: number, G: Ground, w0 = 18, seed = 0) => {
  box(g, x0, B, x1 - x0, FY - B, G.joint);
  const sh = mix(G.base, G.joint, 0.45), hi = mix(G.lit, '#FFFFFF', 0.3);
  COURSES.forEach(([y, h], r) => {
    const w = w0 * (1 + r * 0.18), off = (r % 2) * w * 0.5;
    for (let x = Math.floor((x0 - off) / w) * w + off; x < x1; x += w) {
      const t = hash(Math.round(x) * 0.13 + r * 7 + seed), col = t > 0.7 ? mix(G.base, G.lit, 0.35) : t < 0.18 ? mix(G.base, G.joint, 0.25) : G.base;
      box(g, x + 1, y + 1, w - 2, h - 2, col);
      box(g, x + 1, y + 1, w - 2, 1, G.lit); box(g, x + 1, y + 1, 1, h - 2, mix(col, G.lit, 0.5));
      box(g, x + 1, y + h - 2, w - 2, 1, sh); box(g, x + w - 2, y + 2, 1, h - 3, sh);
      checker(g, x + 2, y + h - 4, w - 4, 2, sh, 0, 1);
      if (t > 0.92) box(g, x + 3, y + 2, 2, 1, hi);
      if (t < 0.07 && w > 10) { box(g, x + w * 0.4, y + 2, 1, h - 4, G.joint); box(g, x + w * 0.4 + 1, y + h / 2, 2, 1, G.joint); }
    }
  });
  if (G.fleck) for (let x = x0; x < x1; x += 7) box(g, x + hash(x) * 6, B + hash(x + 3) * (FY - B - 2), 1, 1, G.fleck);
};

const GROUNDS: Record<StretchId, Ground> = {
  space: { base: '#E4ECF4', joint: '#A8B8CC', lit: '#FFFFFF', fleck: '#22BCAC', paint: (g, x0, x1) => {
    box(g, x0, B, x1 - x0, FY - B, '#E4ECF4');
    // (terrazzo: flecks, and teal and pink boomerangs set in it)
    for (let x = Math.floor(x0 / 5) * 5; x < x1; x += 5) { box(g, x + hash(x) * 4, B + hash(x * 1.7) * 28, 1, 1, hash(x * 3) > 0.5 ? '#94A3B8' : '#F0ABFC'); }
    for (let x = Math.floor(x0 / 54) * 54; x < x1; x += 54) {
      const y = B + 8 + (Math.abs(x / 54) % 2) * 8, col = Math.abs(x / 54) % 3 ? '#22BCAC' : '#E8659E';
      box(g, x, y, 10, 2, col); box(g, x + 10, y - 2, 6, 2, col); box(g, x - 4, y + 2, 6, 2, col);
    }
    box(g, x0, B + 13, x1 - x0, 1, '#C2D0E0'); box(g, x0, FY - 2, x1 - x0, 2, '#B8C8DC');
  } },
  frontier: { base: '#B88A5A', joint: '#8A6038', lit: '#D2A878', paint: (g, x0, x1) => {
    box(g, x0, B, x1 - x0, FY - B, '#B88A5A');
    checker(g, x0, B, x1 - x0, 4, '#A07444');
    for (let x = x0; x < x1; x += 9) box(g, x + hash(x) * 8, B + 4 + hash(x + 1) * 22, 2, 1, hash(x + 2) > 0.5 ? '#8A6038' : '#D2A878');
    // (the rail line along it: ties, the two rails, lit along their tops)
    for (let x = Math.floor(x0 / 12) * 12; x < x1; x += 12) { box(g, x, B + 7, 8, 9, '#5E3E22'); box(g, x, B + 7, 8, 1, '#7A5232'); }
    for (const ry of [B + 8, B + 13]) { box(g, x0, ry, x1 - x0, 2, '#57534E'); box(g, x0, ry, x1 - x0, 1, '#D6D3D1'); }
    // (wagon ruts in front of it)
    box(g, x0, B + 20, x1 - x0, 1, '#8A6038'); box(g, x0, B + 25, x1 - x0, 1, '#8A6038');
  } },
  spooky: { base: '#4C4560', joint: '#2A2438', lit: '#6E6684', fleck: '#3F6212' },
  cartoon: { base: '#FFF1F6', joint: '#1A1028', lit: '#FFFFFF', paint: (g, x0, x1) => {
    // (candy tiles: pink and cream checks, inked)
    COURSES.forEach(([y, h], r) => {
      const w = 16 * (1 + r * 0.18);
      for (let x = Math.floor(x0 / w) * w; x < x1; x += w) {
        const k = (Math.round(x / w) + r) % 2;
        box(g, x, y, w, h, k ? '#F9A8D4' : '#FFF1F6');
        box(g, x + 1, y, w - 2, 1, k ? '#FBCFE8' : '#FFFFFF');
        box(g, x, y, 1, h, '#C0507E');
      }
      box(g, x0, y + h - 1, x1 - x0, 1, '#C0507E');
    });
  } },
  america: { base: '#B4533C', joint: '#7A3424', lit: '#D07A5E' },
  hollywood: { base: '#3F3F46', joint: '#27272A', lit: '#52525B', paint: (g, x0, x1) => {
    // (studio asphalt, the lot's lines painted on it, and stars set in the walk along the front)
    box(g, x0, B, x1 - x0, FY - B, '#3F3F46');
    for (let x = x0; x < x1; x += 4) box(g, x + hash(x) * 3, B + hash(x * 2.3) * 28, 1, 1, hash(x * 5) > 0.5 ? '#52525B' : '#2E2E33');
    for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) box(g, x, B + 9, 20, 2, '#E7E5E4');
    box(g, x0, B + 18, x1 - x0, FY - B - 18, '#6B5E58');
    for (let x = Math.floor(x0 / 48) * 48; x < x1; x += 48) {
      box(g, x, B + 18, 1, FY - B - 18, '#4A403C');
      const sx = x + 24, sy = B + 23;
      g.fillStyle = '#C9A227'; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 2.2 : 5; g.lineTo(sx + Math.cos(a) * r * 1.4, sy + Math.sin(a) * r * 0.7); } g.fill();
      box(g, sx - 2, sy - 1, 4, 1, '#FDE68A');
    }
  } },
  fantasy: { base: COBBLE[3], joint: COBBLE[1], lit: COBBLE[4] },
  adventure: { base: '#9C7A52', joint: '#6A4E30', lit: '#BC9A6E', paint: (g, x0, x1) => {
    // (packed earth, flagstones set in it, fallen leaves)
    box(g, x0, B, x1 - x0, FY - B, '#8A6A44');
    for (let x = Math.floor(x0 / 22) * 22; x < x1; x += 22) for (let r = 0; r < 3; r++) {
      const fx = x + hash(x + r) * 8, fy = B + 3 + r * 9, w = 12 + hash(x * 2 + r) * 6;
      box(g, fx, fy, w, 6, '#A8A29E'); box(g, fx, fy, w, 1, '#D6D3D1'); box(g, fx, fy + 5, w, 1, '#57534E');
    }
    for (let x = x0; x < x1; x += 6) box(g, x + hash(x) * 5, B + hash(x * 1.3) * 28, 2, 1, hash(x * 7) > 0.6 ? '#4D7C0F' : hash(x * 7) > 0.3 ? '#A16207' : '#65A30D');
  } },
  foreign: { base: '#E8DCC4', joint: '#B8A684', lit: '#FFF6E2', paint: (g, x0, x1) => {
    // (mosaic: blue and terracotta in a band, cream round it)
    courses(g, x0, x1, { base: '#E8DCC4', joint: '#B8A684', lit: '#FFF6E2' }, 14, 5);
    for (let x = Math.floor(x0 / 8) * 8; x < x1; x += 8) { const k = Math.abs(Math.round(x / 8)) % 4; box(g, x, B + 13, 7, 7, ['#1E40AF', '#F8FAFC', '#C2410C', '#F8FAFC'][k]); box(g, x + 2, B + 15, 3, 3, ['#93C5FD', '#1E40AF', '#FDBA74', '#C2410C'][k]); }
  } },
  staff: { base: '#9A968E', joint: '#6E6A62', lit: '#B4B0A8', paint: (g, x0, x1) => {
    box(g, x0, B, x1 - x0, FY - B, '#9A968E');
    for (let x = Math.floor(x0 / 60) * 60; x < x1; x += 60) box(g, x, B, 1, FY - B, '#6E6A62');
    for (let x = x0; x < x1; x += 30) { box(g, x + hash(x) * 20, B + 6 + hash(x + 1) * 18, 10 + hash(x + 2) * 12, 3, 'rgba(60, 50, 30, 0.25)'); }
    g.strokeStyle = '#6E6A62'; g.lineWidth = 1; g.beginPath(); for (let x = x0; x < x1; x += 90) { g.moveTo(x + 20, B + 4); g.lineTo(x + 30, B + 14); g.lineTo(x + 26, B + 24); } g.stroke();
  } },
};
const paintGround = (g: Ctx, id: StretchId, x0: number, x1: number) => {
  const G = GROUNDS[id];
  if (G.paint) G.paint(g, x0, x1); else courses(g, x0, x1, G, 18, id.length);
};

// ---------------------------------------------------------------------------------------------------------------
// Trees, by land: each stood on the back row's ground at x

type TreeFn = (g: Ctx, x: number, seed: number, s: number) => void;
/** A frond: its rib curving from (x0, y0) through (cx, cy) to (x1, y1), leaflets off both sides (lit ones over shaded),
 *  drooping at the tip. */
const frond = (g: Ctx, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, R: string[], len = 7) => {
  const P = (t: number): [number, number] => [(1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * cx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * cy + t * t * y1];
  for (let k = 1; k <= 12; k++) {
    const t = k / 12, [px, py] = P(t), [qx, qy] = P(Math.max(0, t - 0.05)), dx = px - qx, dy = py - qy, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, L = len * (1 - t * 0.55);
    for (const sd of [1, -1]) { g.strokeStyle = sd > 0 ? R[1] : R[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py); g.lineTo(px + nx * L * sd + dx * 0.6, py + ny * L * sd + Math.abs(L) * 0.5); g.stroke(); }
  }
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
  g.strokeStyle = R[4]; g.lineWidth = 1; g.stroke();
};
/** A trunk in rings (each ring lit at its left, shaded right), leaning `lean` px by its top, tapering. */
const ringTrunk = (g: Ctx, x: number, h: number, w0: number, w1: number, lean: number, R: string[], step = 4, curve = 1) => {
  for (let k = 0; k < h; k += step) {
    const t = k / h, cxk = x + lean * Math.pow(t, curve), w = w0 + (w1 - w0) * t, y = B - k - step;
    box(g, cxk - w / 2 - 1, y, w + 2, step, INK);
    box(g, cxk - w / 2, y, w, step, R[(k / step) % 2 ? 2 : 3]); box(g, cxk - w / 2, y, Math.max(1, w * 0.3), step, R[4]); box(g, cxk + w / 2 - Math.max(1, w * 0.25), y, Math.max(1, w * 0.25), step, R[1]);
    box(g, cxk - w / 2, y + step - 1, w, 1, R[1]);
  }
  return [x + lean, B - h] as const;
};
/** A trunk with bark (furrows up it, a knot), lit at its left. */
const barkTrunk = (g: Ctx, x: number, top: number, w: number, R: string[]) => {
  box(g, x - w / 2 - 1, top, w + 2, B - top, INK);
  for (let u = 0; u < w; u++) box(g, x - w / 2 + u, top, 1, B - top, R[u < w * 0.25 ? 4 : u < w * 0.6 ? 3 : u < w * 0.85 ? 2 : 1]);
  for (let k = 0; k < (B - top) / 6; k++) box(g, x - w / 2 + 1 + hash(k + x) * (w - 2), top + k * 6, 1, 4, R[1]);
  box(g, x - w / 2 - 3, B - 3, w + 6, 3, R[1]); box(g, x - w / 2 - 3, B - 3, 3, 3, R[0]); box(g, x + w / 2, B - 3, 3, 3, R[0]);
};
const pineTree: TreeFn = (g, x, seed, s) => {
  const h = (74 + hash(seed) * 30) * s, R = R6('#2F6B3A');
  barkTrunk(g, x, B - 12 * s, Math.max(4, 5 * s), R6('#6A4428'));
  for (let k = 0; k < 5; k++) {
    const y = B - 8 * s - k * h * 0.17, w = (26 - k * 4.4) * s, top = y - h * 0.3;
    const pts: [number, number][] = [[x - w, y]];
    for (let j = 1; j < 6; j++) { const t = j / 6; pts.push([x - w + w * t, y - (y - top) * t + (j % 2 ? 3 : 0)]); }
    pts.push([x, top]); for (let j = 5; j > 0; j--) { const t = j / 6; pts.push([x + w - w * t, y - (y - top) * t + (j % 2 ? 3 : 0)]); } pts.push([x + w, y]);
    for (let j = 0; j <= 6; j++) pts.push([x + w - (2 * w * j) / 6, y + (j % 2 ? 3 : 0)]);
    g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fillStyle = R[2]; g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
    g.save(); g.clip();
    box(g, x - w, top, w * 0.55, y - top + 4, R[3]); checker(g, x - w * 0.45, top, 2, y - top + 4, R[3]);
    box(g, x + w * 0.35, top, w * 0.65, y - top + 4, R[1]); checker(g, x + w * 0.33, top, 2, y - top + 4, R[1], 1);
    box(g, x - w * 0.7, y - 4, w * 0.4, 2, R[4]); box(g, x - 2, top + 3, 2, 3, R[4]);
    g.restore();
  }
};
const TREES: Record<StretchId, TreeFn> = {
  space: (g, x, seed, s) => {
    // (a Googie tree: a chrome pole banded across, saucer discs stacked up it (their rims lit, undersides stepped), a
    // bulb on top)
    const h = (80 + hash(seed) * 30) * s, C = ['#2A3248', '#4A5670', '#7A88A4', '#AEBAD0', '#DCE4F0', '#FFFFFF'];
    box(g, x - 4, B - h, 8, h, INK); for (let u = 0; u < 6; u++) box(g, x - 3 + u, B - h, 1, h, C[[4, 5, 4, 3, 2, 1][u]]);
    for (let y = B - h + 6; y < B; y += 10) box(g, x - 3, y, 6, 1, C[2]);
    box(g, x - 8, B - 4, 16, 4, INK); box(g, x - 7, B - 3, 14, 3, C[3]);
    for (let k = 0; k < 3; k++) {
      const y = B - h * (0.45 + k * 0.22), r = (22 - k * 5) * s, col = k % 2 ? '#F1F5F9' : '#22BCAC', R = R6(col);
      g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, r + 1, r * 0.28 + 1, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = R[1]; g.beginPath(); g.ellipse(x, y + 1, r, r * 0.28, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = R[3]; g.beginPath(); g.ellipse(x, y - 1, r, r * 0.22, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = R[5]; g.beginPath(); g.ellipse(x - r * 0.3, y - 2, r * 0.4, r * 0.08, 0, 0, Math.PI * 2); g.fill();
      box(g, x - r, y, r * 2, 1, R[2]);
    }
    g.fillStyle = INK; g.beginPath(); g.arc(x, B - h - 4, 5, 0, Math.PI * 2); g.fill();
    for (const [k, col] of [[1, '#B83A6E'], [0.7, '#E8659E'], [0.35, '#FFB8D6']] as const) { g.fillStyle = col; g.beginPath(); g.arc(x - (1 - k) * 2, B - h - 4 - (1 - k) * 2, 4 * k, 0, Math.PI * 2); g.fill(); }
  },
  frontier: (g, x, seed, s) => {
    if (hash(seed + 9) < 0.35) {
      // (a saguaro: ribbed columns, each rib a step of its own, spines dotted, arms with their elbows, a flower)
      const h = (62 + hash(seed) * 20) * s, R = R6('#4D7C3A');
      const col = (x0: number, top: number, bot: number, w: number) => {
        box(g, x0 - w / 2 - 1, top + w / 2, w + 2, bot - top - w / 2, INK);
        g.fillStyle = INK; g.beginPath(); g.arc(x0, top + w / 2, w / 2 + 1, Math.PI, 0); g.fill();
        g.save(); g.beginPath(); g.rect(x0 - w / 2, top + w / 2, w, bot - top - w / 2); g.arc(x0, top + w / 2, w / 2, Math.PI, 0); g.clip();
        for (let u = 0; u < w; u += 2) box(g, x0 - w / 2 + u, top, 2, bot - top, R[[4, 5, 3, 3, 2, 1, 1][Math.min(6, Math.floor((u / w) * 7))]]);
        for (let u = 2; u < w; u += 3) box(g, x0 - w / 2 + u, top + 2, 1, bot - top, R[1]);
        for (let y = top + 4; y < bot; y += 5) box(g, x0 - w / 2 + ((y / 5) % 3) * 3, y, 1, 1, '#F5F0D8');
        g.restore();
      };
      const ax = 18 * s, ay = h * 0.6;
      col(x - ax + 2, B - ay - 20 * s, B - ay * 0.55, 8 * s); box(g, x - ax + 2, B - ay * 0.55 - 6, ax - 4, 7, INK); box(g, x - ax + 3, B - ay * 0.55 - 5, ax - 6, 5, R[3]); box(g, x - ax + 3, B - ay * 0.55 - 5, ax - 6, 1, R[5]);
      col(x + ax - 2, B - ay - 30 * s, B - ay * 0.7, 8 * s); box(g, x + 2, B - ay * 0.7 - 6, ax - 4, 7, INK); box(g, x + 3, B - ay * 0.7 - 5, ax - 6, 5, R[2]);
      col(x, B - h, B, 12 * s);
      g.fillStyle = INK; g.beginPath(); g.arc(x, B - h + 1, 3, 0, Math.PI * 2); g.fill(); box(g, x - 2, B - h - 1, 4, 3, '#F5F0D8'); box(g, x - 1, B - h, 2, 1, '#FDE047');
      return;
    }
    pineTree(g, x, seed, s);
  },
  spooky: (g, x, seed, s) => {
    // (a dead tree: a twisted trunk, its bark furrowed, branches clawing out; lit along one side; a knot hole)
    const h = (80 + hash(seed) * 30) * s;
    g.lineCap = 'round';
    const segs: [number, number, number, number, number][] = [];
    const branch = (x0: number, y0: number, a: number, len: number, w: number, d: number) => {
      const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
      segs.push([x0, y0, x1, y1, w]);
      if (d > 0) { branch(x1, y1, a - 0.5 - hash(seed + d) * 0.3, len * 0.7, w * 0.65, d - 1); branch(x1, y1, a + 0.45 + hash(seed - d) * 0.3, len * 0.66, w * 0.6, d - 1); }
    };
    branch(x, B, -Math.PI / 2 + (hash(seed) - 0.5) * 0.3, h * 0.45, 7 * s, 3);
    for (const [x0, y0, x1, y1, w] of segs) { g.strokeStyle = INK; g.lineWidth = w + 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    for (const [x0, y0, x1, y1, w] of segs) { g.strokeStyle = '#2E2440'; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    for (const [x0, y0, x1, y1, w] of segs) if (w > 2) { g.strokeStyle = '#4C3D5E'; g.lineWidth = Math.max(1, w * 0.35); g.beginPath(); g.moveTo(x0 - w * 0.25, y0); g.lineTo(x1 - w * 0.25, y1); g.stroke(); }
    g.lineCap = 'butt';
    box(g, x - 5, B - 3, 10, 3, '#1A1428'); box(g, x - 2, B - h * 0.25, 3, 4, '#0A0614');
  },
  cartoon: (g, x, seed, s) => puffTree(g, x, B, (70 + hash(seed) * 30) * s, ['#4CC89C', '#FA9ACA', '#86CAF4', '#FCE880'][Math.floor(hash(seed + 1) * 4)], seed),
  america: (g, x, seed, s) => {
    barkTrunk(g, x, B - 34 * s, Math.max(5, 6 * s), R6('#5E3E22'));
    crown(g, x, B - 52 * s, 22 * s, R6('#3F8A4A'));
    box(g, x - 10, B - 2, 20, 2, INK); for (let k = 0; k < 5; k++) box(g, x - 9 + k * 4, B - 2, 2, 1, '#57534E');
  },
  hollywood: (g, x, seed, s) => {
    // (a tall Washingtonia: the skinny trunk in rings, the dead fronds' shag skirt under the crown, the fronds)
    const h = (120 + hash(seed) * 30) * s, lean = (hash(seed + 2) - 0.5) * 16;
    const [tx, ty] = ringTrunk(g, x, h, 5, 4, lean, R6('#8A6A4A'), 3);
    for (let k = 0; k < 12; k++) { const a = Math.PI * 0.2 + (k / 11) * Math.PI * 0.6; g.strokeStyle = k % 2 ? '#6A4E2A' : '#8A6A3A'; g.lineWidth = 2; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + Math.cos(a) * 9, ty + Math.sin(a) * 16); g.stroke(); }
    const R = R6('#4F9A46');
    for (let k = 0; k < 7; k++) { const a = Math.PI + (k / 6) * Math.PI, ex = tx + Math.cos(a) * 28 * s, ey = ty + Math.sin(a) * 12 * s + 12; frond(g, tx, ty, (tx + ex) / 2, ty - 10, ex, ey, R, 5); }
  },
  fantasy: (g, x, seed, s) => {
    const kind = Math.floor(hash(seed + 5) * 3);
    barkTrunk(g, x, B - 12 * s, 4, R6('#5E3E22'));
    // (the pot: terracotta, its rim, a band)
    const T = R6('#B45309');
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 11 * s, B - 13 * s); g.lineTo(x + 11 * s, B - 13 * s); g.lineTo(x + 8 * s, B); g.lineTo(x - 8 * s, B); g.closePath(); g.fill();
    g.fillStyle = T[3]; g.beginPath(); g.moveTo(x - 10 * s, B - 12 * s); g.lineTo(x + 10 * s, B - 12 * s); g.lineTo(x + 7 * s, B - 1); g.lineTo(x - 7 * s, B - 1); g.closePath(); g.fill();
    box(g, x - 9 * s, B - 12 * s, 4 * s, 11 * s, T[4]); box(g, x + 4 * s, B - 12 * s, 4 * s, 11 * s, T[1]);
    box(g, x - 12 * s, B - 15 * s, 24 * s, 4 * s, INK); box(g, x - 11 * s, B - 14 * s, 22 * s, 2 * s, T[4]);
    if (kind === 0) { for (let k = 0; k < 3; k++) crown(g, x, B - 24 * s - k * 20 * s, (13 - k * 2.5) * s, R6('#2F7A4A')); }
    else if (kind === 1) { const h = 80 * s; for (let k = 0; k < 6; k++) { const y = B - 16 * s - k * h / 7, r = (16 - k * 2.2) * s; crown(g, x + (k % 2 ? 2 : -2), y - r * 0.4, r, R6('#2F7A4A')); } }
    else crown(g, x, B - 40 * s, 22 * s, R6('#3A8A54'));
  },
  adventure: (g, x, seed, s) => {
    if (hash(seed + 3) < 0.5) {
      // (a coconut palm, leaning: the trunk in rings curving over, the fronds, the coconuts in stepped shells)
      const h = (90 + hash(seed) * 30) * s, lean = (hash(seed + 2) - 0.5) * 40;
      const [tx, ty] = ringTrunk(g, x, h, 7, 5, lean, R6('#9A7A52'), 3, 2);
      const R = R6('#4D8A16');
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, ex = tx + Math.cos(a) * 34 * s, ey = ty + Math.abs(Math.sin(a)) * 12 * s + (Math.sin(a) < 0 ? -6 : 14) * s; frond(g, tx, ty, (tx + ex) / 2, ty - 14 * s, ex, ey, R, 6); }
      for (const dx of [-3, 3, 0]) { const cy = ty + 4 + (dx === 0 ? 3 : 0); g.fillStyle = INK; g.beginPath(); g.arc(tx + dx, cy, 3.5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#5E3E22'; g.beginPath(); g.arc(tx + dx, cy, 2.5, 0, Math.PI * 2); g.fill(); box(g, tx + dx - 1, cy - 2, 1, 1, '#A07444'); }
      return;
    }
    // (broadleaf jungle, heaped, a fern at its foot)
    barkTrunk(g, x, B - 40 * s, 6, R6('#5E3E22'));
    for (const [dx, dy, r] of [[-14, -46, 18], [14, -50, 18], [0, -66, 22]] as const) crown(g, x + dx * s, B + dy * s, r * s, R6('#2F6B22'));
    const F = R6('#4D7C0F');
    for (let k = 0; k < 5; k++) { const a = Math.PI + 0.3 + k * 0.6; frond(g, x, B, x + Math.cos(a) * 10, B - 14, x + Math.cos(a) * 20, B - 4 + Math.sin(a) * 4, F, 4); }
  },
  foreign: (g, x, seed, s) => {
    if (hash(seed + 4) < 0.6) {
      // (a cypress: tall, a flame of stepped lobes, dark)
      const h = (90 + hash(seed) * 30) * s, R = R6('#24502E');
      g.fillStyle = INK; g.beginPath(); g.ellipse(x, B - h / 2 - 4, 10 * s, h / 2 + 1, 0, 0, Math.PI * 2); g.fill();
      g.save(); g.beginPath(); g.ellipse(x, B - h / 2 - 4, 9 * s, h / 2, 0, 0, Math.PI * 2); g.clip();
      box(g, x - 10 * s, B - h - 4, 20 * s, h, R[2]); box(g, x - 9 * s, B - h - 4, 6 * s, h, R[3]); box(g, x + 4 * s, B - h - 4, 6 * s, h, R[1]);
      for (let y = B - h; y < B; y += 6) { box(g, x - 7 * s + ((y / 6) % 2) * 3, y, 5, 3, R[4]); box(g, x + 2, y + 3, 5, 2, R[0]); }
      checker(g, x - 3 * s, B - h - 4, 2, h, R[3]); g.restore();
      box(g, x - 2, B - 4, 4, 4, '#5E4A32');
      return;
    }
    barkTrunk(g, x, B - 26 * s, 5, R6('#6B5E4A')); crown(g, x, B - 42 * s, 20 * s, R6('#6B8A4A'));
  },
  staff: (g, x, seed, s) => {
    // (a scrubby thing that came up through a crack)
    barkTrunk(g, x, B - 26 * s, 3, R6('#5E4A32'));
    for (const [dx, dy, r] of [[-8, -30, 10], [8, -34, 9], [0, -42, 11]] as const) crown(g, x + dx * s, B + dy * s, r * s, R6('#5A6E34'));
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The buildings along the back, by land (each around its spot's middle cx, standing on the back row)

/** The lands' sign lettering (their own, as in the lands: the park's alphabet set their ways). */
export const LAND_LOOK: Record<string, (big: boolean) => Look> = {
  space: big => ({ sx: 1, sy: big ? 2 : 1, fill: ['#FFFFFF', '#BDF4FF', '#7DF9FF', '#22BCAC'], glow: '#0E5A6A', dither: true }),
  frontier: big => ({ sx: 1, sy: big ? 2 : 1, fill: ['#FFF6D8', '#F2D79A', '#E0B870', '#B0844A'], dither: true, grain: '#A07040', shadow: '#2A1608', wobble: 1, seed: 3 }),
  spooky: big => ({ sx: 1, sy: big ? 2 : 1, fill: ['#D9F99D', '#BEF264', '#86EFAC', '#4D7C0F'], dither: true, ink: '#0A0614', drip: { col: '#65A30D', tip: '#D9F99D', rate: 0.25, len: big ? 5 : 3 }, seed: 5 }),
  cartoon: big => ({ sx: 1, sy: big ? 2 : 1, fill: ['#FFFFFF', '#FFF8C8', '#FCE880', '#F6D23A'], dither: true, ink: '#1A1028', shadow: '#8E1F5A', drop: 1, wobble: 1, seed: 2 }),
  hollywood: big => (big ? { sx: 2, sy: 2, gap: 1, fill: '#FACC15', bulbs: { lit: true, col: '#FFF7C2', dim: '#7A5A10' } } : { sx: 1, sy: 1, fill: ['#FFF7C2', '#FACC15', '#CA8A04'], dither: true, shadow: '#000000' }),
  fantasy: big => ({ sx: 1, sy: big ? 2 : 1, gap: 2, serif: big, fill: ['#FFF6C8', '#F6D365', '#E0AE3A', '#B07A1E'], dither: true, ink: '#3A2208', shadow: '#120A1E' }),
  adventure: big => ({ sx: 1, sy: big ? 2 : 1, fill: ['#3A3226', '#2A2620', '#2A2620', '#4A4232'], dither: true, lip: '#E8DCC0', moss: '#4D7C0F', worn: 0.12, wornCol: '#6A6050', seed: 7 }),
  foreign: big => ({ sx: 1, sy: big ? 2 : 1, gap: big ? 2 : 1, serif: big, fill: ['#FFFFFF', '#FEE2E2', '#FECACA', '#F87171'], dither: true, shadow: '#0A1A4A' }),
};

// ---------------------------------------------------------------------------------------------------------------
// Between two lands: the little plaza where they meet

type Kiosk = 'snacks' | 'fountain' | 'gazebo' | 'souvenir' | 'info';
const KIOSKS: Kiosk[] = ['snacks', 'fountain', 'souvenir', 'gazebo', 'info', 'snacks', 'souvenir', 'fountain', 'gazebo', 'info'];
const kiosk = (g: Ctx, x: number, kind: Kiosk, a: StretchId, b: StretchId, lit: boolean) => {
  switch (kind) {
    case 'snacks': case 'souvenir': {
      // (a little stand: its roof going back, a striped awning, the counter with what's sold, the board on top)
      const body = R6(kind === 'snacks' ? '#F1E8D8' : '#DDE6F2'), aw = kind === 'snacks' ? ['#DC2626', '#F8FAFC'] : ['#2563EB', '#F8FAFC'];
      flatTop(g, x - 34, x + 34, B - 58, x, 0.9, R6('#8A8680'));
      wall(g, x - 30, B - 58, 60, 58, body); clapboard(g, x - 27, B - 58, 50, 58, body, x, 4); box(g, x - 30, B - 58, 3, 58, body[4]);
      box(g, x - 27, B - 42, 54, 20, INK); box(g, x - 26, B - 41, 52, 18, lit ? '#5A3A1A' : '#3A2A1A'); box(g, x - 26, B - 41, 52, 2, '#1A1008');
      if (kind === 'snacks') for (let k = 0; k < 5; k++) { box(g, x - 23 + k * 10, B - 34, 7, 11, INK); box(g, x - 22 + k * 10, B - 33, 5, 10, ['#F59E0B', '#EF4444', '#FDE68A'][k % 3]); box(g, x - 22 + k * 10, B - 33, 5, 2, '#FFFFFF'); }
      else for (let k = 0; k < 6; k++) { const bx = x - 20 + k * 8; g.fillStyle = INK; g.beginPath(); g.arc(bx, B - 31, 3.5, 0, Math.PI * 2); g.fill(); g.fillStyle = ['#EF4444', '#3B82F6', '#FDE047'][k % 3]; g.beginPath(); g.arc(bx, B - 31, 2.5, 0, Math.PI * 2); g.fill(); box(g, bx - 1, B - 33, 1, 1, '#FFFFFF'); box(g, bx, B - 28, 1, 6, '#57534E'); }
      box(g, x - 33, B - 24, 66, 5, INK); box(g, x - 32, B - 23, 64, 3, '#C8C2B8'); box(g, x - 32, B - 23, 64, 1, '#F5F5F4');
      awning(g, x - 32, x + 32, B - 52, 9, aw[0], aw[1], 8);
      board(g, x, B - 72, 66, 11, kind === 'snacks' ? 'SNACKS' : 'SOUVENIRS', { sx: 1, sy: 1, fill: kind === 'snacks' ? ['#B91C1C', '#7F1D1D'] : ['#1E40AF', '#142A66'], dither: true }, '#F8FAFC', '#3A2208');
      bulbs(g, x - 32, B - 59, x + 32, B - 59, 2, lit);
      return;
    }
    case 'fountain': {
      // (a two-tier fountain: the basin's stone rim in steps, banded water, the column, the bowl, the jet's top)
      const S = R6('#D6CDB8');
      g.fillStyle = INK; g.beginPath(); g.ellipse(x, B - 6, 45, 9, 0, 0, Math.PI * 2); g.fill();
      for (const [k, col] of [[1, S[2]], [0.92, S[3]], [0.8, S[4]]] as const) { g.fillStyle = col; g.beginPath(); g.ellipse(x - (1 - k) * 8, B - 7, 44 * k, 8 * k, 0, 0, Math.PI * 2); g.fill(); }
      box(g, x - 44, B - 7, 88, 7, S[2]); box(g, x - 44, B - 7, 88, 1, S[4]); for (let k = -40; k < 44; k += 11) box(g, x + k, B - 6, 1, 6, S[1]);
      g.fillStyle = INK; g.beginPath(); g.ellipse(x, B - 9, 38, 5, 0, 0, Math.PI * 2); g.fill();
      for (const [k, col] of [[1, '#2A7AA8'], [0.8, '#4CA8D8'], [0.5, '#86CAF4'], [0.22, '#C6E8FC']] as const) { g.fillStyle = col; g.beginPath(); g.ellipse(x - (1 - k) * 6, B - 9, 37 * k, 4.5 * k, 0, 0, Math.PI * 2); g.fill(); }
      wall(g, x - 5, B - 38, 10, 30, S);
      g.fillStyle = INK; g.beginPath(); g.ellipse(x, B - 38, 19, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = S[3]; g.beginPath(); g.ellipse(x, B - 38, 18, 4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#4CA8D8'; g.beginPath(); g.ellipse(x, B - 39, 14, 2.5, 0, 0, Math.PI * 2); g.fill();
      box(g, x - 1, B - 50, 3, 12, S[4]); g.fillStyle = INK; g.beginPath(); g.arc(x, B - 51, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = '#D09A30'; g.beginPath(); g.arc(x, B - 51, 2, 0, Math.PI * 2); g.fill();
      for (const dx of [-16, 16]) { g.strokeStyle = '#C6E8FC'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + dx * 0.9, B - 38); g.quadraticCurveTo(x + dx * 1.3, B - 30, x + dx * 1.5, B - 11); g.stroke(); }
      for (let k = 0; k < 6; k++) box(g, x - 28 + k * 11, B - 10 - (k % 2), 2, 1, '#FFFFFF');
      return;
    }
    case 'gazebo': {
      // (a bandstand: white posts, a railing with its balusters, the roof's slopes going back, a finial, bunting)
      const W = R6('#F4F2EE'), Rf = R6(mix('#7A9ABE', '#4A4458', 0.15));
      gableBack(g, x - 42, x + 42, B - 52, x, B - 82, x, 0.9, Rf, 5);
      flatTop(g, x - 34, x + 34, B - 14, x, 0.92, R6('#C8BFAE'));
      for (const px of [-30, -10, 10, 30]) { box(g, x + px - 3, B - 52, 6, 52, INK); box(g, x + px - 2, B - 52, 4, 52, W[3]); box(g, x + px - 2, B - 52, 1, 52, W[5]); box(g, x + px + 1, B - 52, 1, 52, W[2]); }
      box(g, x - 33, B - 16, 66, 4, INK); box(g, x - 32, B - 15, 64, 2, W[4]);
      for (let k = 0; k < 13; k++) { box(g, x - 31 + k * 5, B - 13, 2, 13, W[2]); box(g, x - 31 + k * 5, B - 13, 1, 13, W[4]); }
      box(g, x - 34, B - 3, 68, 3, W[1]);
      polyI(g, [[x - 42, B - 52], [x, B - 82], [x + 42, B - 52]], Rf[3]);
      for (let k = 1; k < 5; k++) { const t = k / 5; seg(g, [x - 42 * (1 - t), B - 52 - 30 * t], [x + 42 * (1 - t), B - 52 - 30 * t], Rf[1]); }
      poly(g, [[x - 41, B - 53], [x, B - 81], [x - 10, B - 53]], Rf[4]);
      for (let k = 0; k < 8; k++) { g.fillStyle = ['#DC2626', '#F8FAFC', '#1E3A8A'][k % 3]; g.beginPath(); g.arc(x - 35 + k * 10, B - 52, 5, 0, Math.PI); g.fill(); }
      box(g, x - 43, B - 53, 86, 2, INK);
      box(g, x - 1, B - 96, 2, 14, '#57534E'); g.fillStyle = INK; g.beginPath(); g.arc(x, B - 96, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = '#D09A30'; g.beginPath(); g.arc(x, B - 96, 2, 0, Math.PI * 2); g.fill();
      return;
    }
    case 'info': {
      // (the info pylon, a big i; the map board, both lands on it the way the guide map has them, under its little roof)
      const P = R6('#2F6B3A');
      wall(g, x - 14, B - 74, 28, 74, P); box(g, x - 14, B - 74, 28, 3, P[5]);
      box(g, x - 11, B - 68, 22, 16, INK); box(g, x - 10, B - 67, 20, 14, '#F8FAFC'); signText(g, 'i', x, B - 55, { sx: 2, sy: 1, fill: ['#1E40AF', '#142A66'], dither: true });
      box(g, x - 42, B - 49, 84, 34, INK); box(g, x - 41, B - 48, 82, 32, '#5E3E22');
      box(g, x - 39, B - 46, 39, 28, mix(GROUNDS[a].base, '#FFFFFF', 0.2)); box(g, x, B - 46, 39, 28, mix(GROUNDS[b].base, '#FFFFFF', 0.2));
      checker(g, x - 39, B - 46, 78, 28, 'rgba(255,255,255,0.18)');
      for (let k = 0; k < 6; k++) box(g, x - 34 + k * 12, B - 42 + (k % 2) * 10, 6, 5, k % 2 ? '#8A5A32' : '#57534E');
      box(g, x - 36, B - 32, 72, 2, '#DC2626'); g.fillStyle = INK; g.beginPath(); g.arc(x, B - 31, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#DC2626'; g.beginPath(); g.arc(x, B - 31, 3, 0, Math.PI * 2); g.fill();
      signText(g, 'YOU ARE HERE', x, B - 21, { sx: 1, sy: 1, fill: '#1A1028' });
      for (const px of [x - 38, x + 34]) { box(g, px, B - 16, 4, 16, INK); box(g, px + 1, B - 16, 2, 16, '#71717A'); }
      polyI(g, [[x - 46, B - 49], [x - 40, B - 56], [x + 40, B - 56], [x + 46, B - 49]], '#3F3F46'); box(g, x - 40, B - 56, 80, 1, '#71717A');
      return;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The fence along the back of the walk (the promenade behind it), by land; a plain shared box hedge where two meet

type FenceFn = (g: Ctx, x0: number, x1: number) => void;
/** A post in stepped columns (lit left, shaded right), inked. */
const post = (g: Ctx, x: number, top: number, w: number, R: string[]) => { box(g, x - 1, top - 1, w + 2, FY - top + 1, INK); for (let u = 0; u < w; u++) box(g, x + u, top, 1, FY - top, R[u < w * 0.3 ? 4 : u < w * 0.65 ? 3 : u < w * 0.85 ? 2 : 1]); };
/** A rail across, lit along its top, shaded under. */
const rail = (g: Ctx, x0: number, x1: number, y: number, h: number, R: string[]) => { box(g, x0, y - 1, x1 - x0, h + 2, INK); box(g, x0, y, x1 - x0, h, R[3]); box(g, x0, y, x1 - x0, 1, R[5]); box(g, x0, y + h - 1, x1 - x0, 1, R[1]); };
const hedge: FenceFn = (g, x0, x1) => {
  // (clipped box hedge: its top a row of lumps in steps, the face banded and dithered, leaf flecks, a flower or two)
  const R = R6('#3F7A3A');
  box(g, x0, FY - 17, x1 - x0, 17, INK);
  box(g, x0, FY - 16, x1 - x0, 16, R[2]); box(g, x0, FY - 16, x1 - x0, 5, R[3]); checker(g, x0, FY - 11, x1 - x0, 2, R[3]);
  box(g, x0, FY - 5, x1 - x0, 5, R[1]); checker(g, x0, FY - 7, x1 - x0, 2, R[1]);
  for (let x = Math.floor(x0 / 6) * 6; x < x1; x += 6) {
    g.fillStyle = INK; g.beginPath(); g.arc(x + 3, FY - 16, 4, Math.PI, 0); g.fill();
    g.fillStyle = R[3]; g.beginPath(); g.arc(x + 3, FY - 16, 3, Math.PI, 0); g.fill(); box(g, x + 2, FY - 18, 2, 1, R[5]);
    if (hash(x) > 0.5) box(g, x + hash(x * 3) * 5, FY - 13 + hash(x * 7) * 8, 1, 1, hash(x * 9) > 0.5 ? R[4] : R[0]);
    if (hash(x) > 0.8) { box(g, x + 1, FY - 11, 2, 2, ['#F472B6', '#FDE047', '#F8FAFC'][Math.floor(hash(x + 1) * 3)]); box(g, x + 1, FY - 11, 1, 1, '#FFFFFF'); }
  }
};
const FENCES: Record<StretchId, FenceFn> = {
  space: (g, x0, x1) => {
    // (a chrome rail on Googie pylons, each capped with a teal or pink bulb)
    const C = ['#2A3248', '#4A5670', '#7A88A4', '#AEBAD0', '#DCE4F0', '#FFFFFF'];
    rail(g, x0, x1, FY - 14, 3, C);
    rail(g, x0, x1, FY - 6, 2, C);
    for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) {
      g.fillStyle = INK; g.beginPath(); g.moveTo(x - 4, FY); g.lineTo(x - 2, FY - 19); g.lineTo(x + 2, FY - 19); g.lineTo(x + 4, FY); g.fill();
      for (let u = -3; u < 3; u++) box(g, x + u, FY - 18 + Math.abs(u), 1, 18 - Math.abs(u), C[[4, 5, 4, 3, 2, 1][u + 3]]);
      const col = R6(Math.abs(x / 30) % 2 ? '#22BCAC' : '#E8659E');
      g.fillStyle = INK; g.beginPath(); g.arc(x, FY - 21, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = col[3]; g.beginPath(); g.arc(x, FY - 21, 3, 0, Math.PI * 2); g.fill(); box(g, x - 2, FY - 23, 1, 1, col[5]);
    }
  },
  frontier: (g, x0, x1) => {
    // (split rail zigzagging: each rail split-faced, lit along its top, its end grain; the posts weathered)
    const W = R6('#9A6A3E');
    for (let x = Math.floor(x0 / 34) * 34; x < x1; x += 34) {
      for (const y of [FY - 18, FY - 9]) {
        g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x + 36, y); g.stroke();
        g.strokeStyle = W[3]; g.lineWidth = 4; g.stroke();
        g.strokeStyle = W[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 2, y + 2); g.lineTo(x + 34, y - 2); g.stroke();
        g.strokeStyle = W[1]; g.beginPath(); g.moveTo(x + 2, y + 5); g.lineTo(x + 34, y + 1); g.stroke();
        box(g, x + 14, y + 1, 4, 1, W[2]);
      }
      post(g, x - 2, FY - 23, 5, R6('#6A4428')); box(g, x - 2, FY - 23, 5, 1, '#8A6038');
    }
  },
  spooky: (g, x0, x1) => {
    // (wrought iron: spear-topped pickets, two rails, piers with their stone caps every so often; pumpkins along it)
    const I = R6('#2A2438');
    rail(g, x0, x1, FY - 20, 2, I); rail(g, x0, x1, FY - 7, 2, I);
    for (let x = Math.floor(x0 / 6) * 6; x < x1; x += 6) { box(g, x, FY - 22, 2, 22, '#18141F'); box(g, x, FY - 22, 1, 22, I[4]); box(g, x - 1, FY - 24, 4, 2, '#18141F'); box(g, x, FY - 27, 2, 3, '#18141F'); box(g, x, FY - 26, 1, 1, I[5]); }
    for (let x = Math.floor(x0 / 48) * 48; x < x1; x += 48) { post(g, x - 4, FY - 28, 8, R6('#6E6684')); box(g, x - 6, FY - 31, 12, 4, INK); box(g, x - 5, FY - 30, 10, 2, '#8A8494'); box(g, x - 5, FY - 30, 10, 1, '#B4AEBE'); }
    for (let x = Math.floor(x0 / 42) * 42 + 20; x < x1; x += 42) if (hash(x) > 0.35) {
      g.fillStyle = INK; g.beginPath(); g.ellipse(x, FY - 4, 8, 6, 0, 0, Math.PI * 2); g.fill();
      for (const [k, col] of [[1, '#9A3412'], [0.8, '#C2410C'], [0.55, '#EA580C'], [0.25, '#FDBA74']] as const) { g.fillStyle = col; g.beginPath(); g.ellipse(x - (1 - k) * 3, FY - 4 - (1 - k) * 2, 7 * k, 5 * k, 0, 0, Math.PI * 2); g.fill(); }
      box(g, x - 1, FY - 9, 1, 9, '#9A3412'); box(g, x - 1, FY - 12, 2, 3, '#3F6212'); box(g, x + 1, FY - 12, 3, 1, '#4D7C0F');
    }
  },
  cartoon: (g, x0, x1) => {
    // (a picket fence of candy: round-topped pickets in pastels, each lit up its left, a white rail)
    rail(g, x0, x1, FY - 13, 3, R6('#FFFFFF'));
    for (let x = Math.floor(x0 / 10) * 10; x < x1; x += 10) {
      const R = R6(['#FA9ACA', '#86CAF4', '#FCE880', '#8AE4BE'][Math.abs(x / 10) % 4]);
      g.fillStyle = INK; g.beginPath(); g.roundRect(x - 1, FY - 21, 9, 21, [4.5, 4.5, 0, 0]); g.fill();
      g.save(); g.beginPath(); g.roundRect(x, FY - 20, 7, 20, [3.5, 3.5, 0, 0]); g.clip();
      box(g, x, FY - 20, 7, 20, R[3]); box(g, x, FY - 20, 2, 20, R[5]); box(g, x + 5, FY - 20, 2, 20, R[2]); box(g, x, FY - 4, 7, 4, R[1]);
      g.restore();
    }
  },
  america: (g, x0, x1) => {
    // (a white picket fence: pointed pickets, two rails, each lit and shaded)
    const W = R6('#F4F2EE');
    rail(g, x0, x1, FY - 13, 2, W); rail(g, x0, x1, FY - 6, 2, W);
    for (let x = Math.floor(x0 / 8) * 8; x < x1; x += 8) {
      g.fillStyle = INK; g.beginPath(); g.moveTo(x - 1, FY); g.lineTo(x - 1, FY - 16); g.lineTo(x + 2.5, FY - 20); g.lineTo(x + 6, FY - 16); g.lineTo(x + 6, FY); g.fill();
      box(g, x, FY - 16, 5, 16, W[3]); box(g, x, FY - 16, 1, 16, W[5]); box(g, x + 4, FY - 16, 1, 16, W[2]); box(g, x + 1, FY - 18, 3, 2, W[4]); box(g, x, FY - 3, 5, 3, W[1]);
    }
  },
  hollywood: (g, x0, x1) => {
    // (brass stanchions, red velvet rope swagged between: the rope banded, lit along its top)
    for (let x = Math.floor(x0 / 36) * 36; x < x1; x += 36) {
      g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x, FY - 16); g.quadraticCurveTo(x + 18, FY - 6, x + 36, FY - 16); g.stroke();
      g.strokeStyle = '#991B1B'; g.lineWidth = 3; g.stroke(); g.strokeStyle = '#EF4444'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 2, FY - 16); g.quadraticCurveTo(x + 18, FY - 7.5, x + 34, FY - 16); g.stroke();
      const Au = R6('#D09A30');
      post(g, x - 2, FY - 18, 4, Au);
      g.fillStyle = INK; g.beginPath(); g.arc(x, FY - 19, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = Au[3]; g.beginPath(); g.arc(x, FY - 19, 3, 0, Math.PI * 2); g.fill(); box(g, x - 2, FY - 21, 1, 1, Au[5]);
      box(g, x - 6, FY - 3, 12, 3, INK); box(g, x - 5, FY - 2, 10, 2, Au[3]); box(g, x - 5, FY - 2, 10, 1, Au[5]);
    }
  },
  fantasy: (g, x0, x1) => {
    hedge(g, x0, x1);
    for (let x = Math.floor(x0 / 54) * 54 + 27; x < x1; x += 54) { box(g, x - 5, FY - 23, 10, 8, INK); box(g, x - 4, FY - 22, 8, 7, '#2F6B2A'); crown(g, x, FY - 27, 7, R6('#3A8A44')); }
  },
  adventure: (g, x0, x1) => {
    // (bamboo poles lashed in a row: each banded at its nodes, lit up its left; rope lashings across)
    const Bm = R6('#B4CC5C');
    for (let x = Math.floor(x0 / 5) * 5; x < x1; x += 5) {
      const h = 18 + (Math.abs(x / 5) % 3) * 2;
      box(g, x, FY - h, 5, h, INK); box(g, x, FY - h + 1, 4, h - 1, Bm[Math.abs(x / 5) % 2 ? 3 : 2]); box(g, x, FY - h + 1, 1, h - 1, Bm[5]); box(g, x + 3, FY - h + 1, 1, h - 1, Bm[1]);
      for (const ny of [FY - h + 7, FY - h + 15]) { box(g, x, ny, 4, 1, Bm[1]); box(g, x, ny + 1, 4, 1, Bm[4]); }
      g.fillStyle = INK; g.beginPath(); g.ellipse(x + 2, FY - h + 1, 2.5, 1, 0, 0, Math.PI * 2); g.fill();
    }
    for (const y of [FY - 13, FY - 6]) { box(g, x0, y, x1 - x0, 2, '#7A5A2A'); box(g, x0, y, x1 - x0, 1, '#C8A060'); }
  },
  foreign: (g, x0, x1) => {
    // (a low stucco wall under barrel tile, pots of geraniums on it)
    const W = R6('#F2E6D0');
    box(g, x0, FY - 13, x1 - x0, 13, INK); box(g, x0, FY - 12, x1 - x0, 12, W[3]);
    stucco(g, x0, FY - 12, x1 - x0, 12, W, 4); box(g, x0, FY - 3, x1 - x0, 3, W[1]); checker(g, x0, FY - 5, x1 - x0, 2, W[1]);
    barrelTile(g, x0, FY - 17, x1 - x0, 5, R6('#C2410C'), 5); box(g, x0, FY - 17, x1 - x0, 1, INK);
    for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) {
      const T = R6('#B45309');
      g.fillStyle = INK; g.beginPath(); g.moveTo(x - 1, FY - 27); g.lineTo(x + 15, FY - 27); g.lineTo(x + 13, FY - 17); g.lineTo(x + 1, FY - 17); g.fill();
      box(g, x, FY - 26, 14, 9, T[3]); box(g, x, FY - 26, 3, 9, T[4]); box(g, x + 11, FY - 26, 3, 9, T[1]); box(g, x - 1, FY - 27, 16, 2, T[4]);
      for (let k = 0; k < 5; k++) { box(g, x + 1 + k * 3, FY - 31 - (k % 2) * 2, 3, 3, ['#DC2626', '#F87171', '#B91C1C'][k % 3]); box(g, x + 1 + k * 3, FY - 28, 2, 2, '#2F6B2A'); }
    }
  },
  staff: (g, x0, x1) => {
    // (chain link on galvanized pipe posts, its top rail, the mesh in diamonds, a privacy slat or two gone)
    const S = R6('#9CA3AF');
    rail(g, x0, x1, FY - 25, 2, S);
    g.strokeStyle = 'rgba(156, 163, 175, 0.85)'; g.lineWidth = 1; g.beginPath();
    for (let x = Math.floor(x0 / 6) * 6; x < x1; x += 6) { g.moveTo(x, FY - 22); g.lineTo(x + 6, FY); g.moveTo(x + 6, FY - 22); g.lineTo(x, FY); }
    g.stroke();
    for (let x = Math.floor(x0 / 60) * 60; x < x1; x += 60) { post(g, x - 2, FY - 27, 4, S); box(g, x - 3, FY - 28, 6, 2, S[1]); }
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Layout round the lap: what stands where (built once)

interface Item { x: number; r: number; paint: (g: Ctx, x: number, lit: boolean) => void }
const BACK_ITEMS: Item[] = [];
/** The trees sharing a seam: each land's kind, interleaved. */
for (let i = 0; i < HUB_SLOTS; i++) {
  const id = stretchOf(i), cx = slotX(i);
  if (id !== 'staff' && id !== 'america') BACK_ITEMS.push({ x: cx, r: 250, paint: (g, x, lit) => FACADES[id](g, x, lit) });
  if (id === 'america') BACK_ITEMS.push({ x: cx, r: 270, paint: (g, x, lit) => FACADES.america(g, x, lit) });
  // (where this one meets the next: a tree of each, mixed, the kiosk between)
  const nx = seamX(i + 1), next = stretchOf(i + 1), seed = i * 31 + 7;
  if (id === 'staff' || next === 'staff') {
    BACK_ITEMS.push({ x: nx + (id === 'staff' ? 40 : -40), r: 60, paint: (g, x) => TREES[id === 'staff' ? next : id](g, x, seed, 1) });
    continue;
  }
  BACK_ITEMS.push({ x: nx - 104, r: 60, paint: (g, x) => TREES[id](g, x, seed, 1) });
  BACK_ITEMS.push({ x: nx + 104, r: 60, paint: (g, x) => TREES[next](g, x, seed + 1, 1) });
  BACK_ITEMS.push({ x: nx - 58, r: 60, paint: (g, x) => TREES[next](g, x, seed + 2, 0.82) });
  BACK_ITEMS.push({ x: nx + 58, r: 60, paint: (g, x) => TREES[id](g, x, seed + 3, 0.82) });
  BACK_ITEMS.push({ x: nx, r: 48, paint: (g, x, lit) => kiosk(g, x, KIOSKS[i], id, next, lit) });
}

/** The back row from x0 to x1 (a stamp's worth): the promenade's paving (dithered one land into the next across each
 * seam), the buildings, the trees, the kiosks. */
export const paintBack = (g: Ctx, x0: number, x1: number, lit: boolean) => {
  // Paving, land by land, blended across the seams
  for (let s = Math.floor((x0 - HUB.x0) / HUB.slot) - 1; s * HUB.slot + HUB.x0 < x1; s++) {
    const a = HUB.x0 + s * HUB.slot, b = a + HUB.slot;
    if (b < x0 - 40 || a > x1 + 40) continue;
    paintGround(g, stretchOf(s), Math.max(a, x0 - 2), Math.min(b, x1 + 2));
  }
  for (let s = Math.floor((x0 - HUB.x0) / HUB.slot); s * HUB.slot + HUB.x0 < x1 + 60; s++) {
    const sx = HUB.x0 + s * HUB.slot;
    if (sx < x0 - 60 || sx > x1 + 60) continue;
    const L = GROUNDS[stretchOf(s - 1)].base, Rr = GROUNDS[stretchOf(s)].base;
    // (one dithered into the other, thinning out either side of the seam)
    checker(g, sx - 40, B, 20, FY - B, Rr, 0, 4); checker(g, sx - 20, B, 20, FY - B, Rr);
    checker(g, sx, B, 20, FY - B, L); checker(g, sx + 20, B, 20, FY - B, L, 0, 4);
  }
  for (const it of BACK_ITEMS) for (const k of [-HUB_CIRC, 0, HUB_CIRC]) {
    const x = it.x + k;
    if (x + it.r > x0 && x - it.r < x1) it.paint(g, x, lit);
  }
};

/** The walk's paving (the roundabout's own, everywhere: warm pavers in courses, deeper toward us), the border inlaid
 * along its back in each land's color, and the portals' paths across it. */
const WALK_COURSES = [[FY, 8], [FY + 8, 9], [FY + 17, 10], [FY + 27, 11], [FY + 38, 12], [FY + 50, 13], [FY + 63, 14], [FY + 77, 16]] as const;
export const paintWalk = (g: Ctx, x0: number, x1: number) => {
  const W = ['#E7D9BC', '#DCCCAB', '#CFBE9C', '#C2B08E'];
  WALK_COURSES.forEach(([y, h], r) => {
    const base = W[Math.min(3, r >> 1)], w = 26 * (1 + r * 0.14), off = (r % 2) * w * 0.5;
    box(g, x0, y, x1 - x0, h, base);
    for (let x = Math.floor((x0 - off) / w) * w + off; x < x1; x += w) {
      const t = hash(Math.round(x) * 0.07 + r * 3), col = t > 0.72 ? mix(base, '#FFFFFF', 0.18) : t < 0.2 ? mix(base, '#8A7650', 0.12) : base, sh = mix(col, '#8A7650', 0.28);
      box(g, x + 1, y + 1, w - 2, h - 2, col);
      box(g, x, y, 1, h, '#B8A584'); box(g, x + 1, y + 1, w - 2, 1, mix(col, '#FFFFFF', 0.4)); box(g, x + 1, y + 1, 1, h - 2, mix(col, '#FFFFFF', 0.2));
      box(g, x + 1, y + h - 2, w - 2, 1, sh); box(g, x + w - 2, y + 2, 1, h - 3, sh); checker(g, x + 2, y + h - 4, w - 4, 2, sh, 0, 1);
      if (t < 0.06) { box(g, x + w * 0.5, y + 2, 1, h - 4, '#B8A584'); box(g, x + w * 0.5 - 2, y + h / 2, 2, 1, '#B8A584'); }
      if (t > 0.95) { box(g, x + w * 0.3, y + h * 0.4, 3, 2, 'rgba(90, 70, 40, 0.25)'); }
    }
    box(g, x0, y + h - 1, x1 - x0, 1, '#B8A584');
  });
  // (the inlay along the back of the walk: each land's color, dithered across the seams)
  for (let s = Math.floor((x0 - HUB.x0) / HUB.slot) - 1; s * HUB.slot + HUB.x0 < x1; s++) {
    const a = HUB.x0 + s * HUB.slot, b = a + HUB.slot, id = stretchOf(s);
    if (b < x0 || a > x1) continue;
    const col = INLAY[id];
    box(g, Math.max(a, x0), FY + 1, Math.min(b, x1) - Math.max(a, x0), 3, col);
    checker(g, Math.max(a, x0), FY + 4, Math.min(b, x1) - Math.max(a, x0), 2, col);
  }
  for (let s = Math.floor((x0 - HUB.x0) / HUB.slot); s * HUB.slot + HUB.x0 < x1 + 40; s++) {
    const sx = HUB.x0 + s * HUB.slot;
    if (sx < x0 - 40 || sx > x1 + 40) continue;
    checker(g, sx - 24, FY + 1, 24, 3, INLAY[stretchOf(s)]); checker(g, sx, FY + 1, 24, 3, INLAY[stretchOf(s - 1)], 1);
  }
  box(g, x0, FY, x1 - x0, 1, '#F5EBD6');
};
const INLAY: Record<StretchId, string> = { space: '#22BCAC', frontier: '#9A6A3E', spooky: '#6D28D9', cartoon: '#EC4899', america: '#1E3A8A', hollywood: '#CA8A04', fantasy: '#2563EB', adventure: '#4D7C0F', foreign: '#C2410C', staff: '#78716C' };

/** A portal's path, in its land's paving: from the walk's front edge up to the portal's foot, narrowing back toward
 * the one eye, curbed both sides. */
export const paintPath = (g: Ctx, cx: number, id: StretchId) => {
  const top = GATE.base, bottom = GROUND_Y + 50;
  const hw = (y: number) => (PATH.far / depthAt(top)) * depthAt(y);
  const G = GROUNDS[id];
  g.save();
  g.beginPath(); g.moveTo(cx - hw(top), top); g.lineTo(cx + hw(top), top); g.lineTo(cx + hw(bottom), bottom); g.lineTo(cx - hw(bottom), bottom); g.closePath();
  g.clip();
  box(g, cx - 60, top, 120, bottom - top, G.base);
  // (its courses: deeper toward us; the joints running back to the eye)
  let y = top;
  for (let r = 0; y < bottom; r++) {
    const h = Math.max(3, Math.round(6 * depthAt(y))), w = hw(y) * 2;
    box(g, cx - 60, y + h - 1, 120, 1, G.joint);
    box(g, cx - 60, y, 120, 1, G.lit);
    for (let k = -2 + (r % 2) * 0.5; k <= 2; k++) box(g, cx + (k * w) / 4.5, y, 1, h, G.joint);
    y += h;
  }
  if (id === 'cartoon') for (let yy = top, r = 0; yy < bottom; r++) { const h = Math.max(3, Math.round(6 * depthAt(yy))); for (let k = -3; k < 3; k++) if ((k + r) % 2 === 0) box(g, cx + (k * hw(yy) * 2) / 6, yy, (hw(yy) * 2) / 6, h - 1, '#F9A8D4'); yy += h; }
  if (id === 'hollywood') { g.fillStyle = '#B91C1C'; g.beginPath(); g.moveTo(cx - hw(top) * 0.7, top); g.lineTo(cx + hw(top) * 0.7, top); g.lineTo(cx + hw(bottom) * 0.7, bottom); g.lineTo(cx - hw(bottom) * 0.7, bottom); g.fill(); box(g, cx - 60, top, 120, 2, '#7F1D1D'); }
  if (id === 'frontier') for (let yy = top; yy < bottom; yy += Math.max(3, Math.round(5 * depthAt(yy)))) { box(g, cx - 60, yy, 120, 1, '#5E3E22'); box(g, cx - 60, yy + 1, 120, 1, '#C08A54'); }
  g.restore();
  // (the curbs)
  for (const s of [-1, 1]) {
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(cx + s * hw(top), top); g.lineTo(cx + s * hw(bottom), bottom); g.stroke();
    g.strokeStyle = '#B4AEA4'; g.lineWidth = 3; g.stroke();
    g.strokeStyle = s < 0 ? '#E7E5E4' : '#8A8680'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + s * hw(top) - s, top); g.lineTo(cx + s * hw(bottom) - s, bottom); g.stroke();
    for (let y = top + 6; y < bottom; y += Math.max(4, Math.round(10 * depthAt(y)))) box(g, cx + s * hw(y) - 1, y, 2, 1, '#6E6A62');
  }
};

/** The fence row from x0 to x1 (a stamp's worth): each land's fence along the back of the walk, gaps where the
 * portals' paths come through (and America USA's street, and round the staff door), a shared hedge across each seam. */
export const paintFence = (g: Ctx, x0: number, x1: number) => {
  for (let s = Math.floor((x0 - HUB.x0) / HUB.slot) - 1; s * HUB.slot + HUB.x0 < x1; s++) {
    const a = HUB.x0 + s * HUB.slot, b = a + HUB.slot, id = stretchOf(s), cx = a + HUB.slot / 2;
    if (b < x0 || a > x1) continue;
    const gap = id === 'america' ? 110 : id === 'staff' ? 230 : PATH.near + 18;
    const runs: [number, number][] = id === 'staff' ? [[a + 70, cx - gap + 120]] : [[a + 70, cx - gap], [cx + gap, b - 70]];
    for (const [p, q] of runs) { const pp = Math.max(p, x0 - 4), qq = Math.min(q, x1 + 4); if (qq > pp) FENCES[id](g, pp, qq); }
  }
  for (let s = Math.floor((x0 - HUB.x0) / HUB.slot); s * HUB.slot + HUB.x0 < x1 + 80; s++) {
    const sx = HUB.x0 + s * HUB.slot;
    if (sx < x0 - 80 || sx > x1 + 80) continue;
    hedge(g, Math.max(sx - 70, x0 - 4), Math.min(sx + 70, x1 + 4));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// What moves in them (live, over the stamps): the falls, flags, the tower's pennant, the fort's flag

export const drawStretchLive = (c: Ctx, cx: number, id: StretchId, f: number) => {
  switch (id) {
    case 'adventure': {
      // (the falls down the fake rock: bands sliding down, the splash at the foot)
      const fx = cx + 150 + 10, top = B - 180, bot = B - 6;
      box(c, fx - 9, top, 18, bot - top, '#4CA8D8');
      for (let k = 0; k < 6; k++) { const y = top + ((f * 3 + k * 30) % (bot - top)); box(c, fx - 8, y, 16, 6, '#C6E8FC'); box(c, fx - 4, y + 10, 8, 4, '#86CAF4'); }
      box(c, fx - 9, top, 3, bot - top, '#E0F2FE');
      for (let k = 0; k < 4; k++) { const a = f * 0.2 + k * 1.6; box(c, fx + Math.cos(a) * 14 - 2, bot - 4 - Math.abs(Math.sin(a)) * 8, 4, 3, '#F0F9FF'); }
      return;
    }
    case 'fantasy': flag(c, cx + 170, B - 272, 22, 8, ['#FACC15'], f, 1); return;
    case 'frontier': flag(c, cx + 100, B - 176, 22, 14, ['#DC2626', '#F8FAFC', '#DC2626', '#F8FAFC'], f, 2); box(c, cx + 99, B - 176, 2, 26, '#57534E'); return;
    case 'foreign': for (let k = 0; k < 5; k++) { const fx = cx - 236 + k * 108; flag(c, fx, B - 132, 20, 12, FLAGS[k], f, k); } return;
    case 'spooky': {
      // (bats round the house, a light going in a window)
      for (let b = 0; b < 3; b++) { const bx = cx - 150 + b * 30 + Math.sin(f * 0.05 + b * 2) * 30, by = B - 220 + Math.cos(f * 0.07 + b) * 14, fl = (f >> 2) % 2 ? 4 : -2; c.fillStyle = '#1F1630'; c.beginPath(); c.moveTo(bx - 9, by + fl); c.lineTo(bx, by); c.lineTo(bx + 9, by + fl); c.lineTo(bx, by + 4); c.closePath(); c.fill(); }
      return;
    }
    case 'hollywood': {
      // (the red light over the stage door, blinking)
      if ((f >> 5) % 2) { c.fillStyle = 'rgba(254, 202, 202, 0.9)'; c.beginPath(); c.arc(cx + 75, B - 68, 3, 0, Math.PI * 2); c.fill(); }
      return;
    }
    default:
  }
};
const FLAGS = [['#1E3A8A', '#F8FAFC', '#DC2626'], ['#15803D', '#F8FAFC', '#DC2626'], ['#000000', '#DC2626', '#FACC15'], ['#F8FAFC', '#1E40AF', '#DC2626'], ['#DC2626', '#F8FAFC', '#DC2626']];

export { HUB_HORIZON };
