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
import { type Ctx, INK, mix, hash, checker, box, R6, inked, slab, pane, crown, flag } from './kit';
import { SPOTS, HUB_SLOTS, LANDS } from './lands';
import { HUB, HUB_CIRC, slotX, seamX, ROW, GATE, PATH, HUB_HORIZON, depthAt } from './geometry';
import { piece, type Far } from '../space/farArt';
import { puffTree, stripes } from '../cartoon/kit';
import { PLASTER, TIMBER, SLATE, COBBLE, STONE as FSTONE } from '../fantasy/kit';
import { stoneBlocks, planks, stucco, barrelTile, shingles } from '../foreign/kit';
import { signText, type Look } from '../signLetters';

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
  box(g, x0, B, x1 - x0, FY - B, G.base);
  COURSES.forEach(([y, h], r) => {
    const w = w0 * (1 + r * 0.18), off = (r % 2) * w * 0.5;
    for (let x = Math.floor((x0 - off) / w) * w + off; x < x1; x += w) {
      const t = hash(Math.round(x) * 0.13 + r * 7 + seed);
      if (t > 0.7) box(g, x + 1, y + 1, w - 2, h - 2, mix(G.base, G.lit, 0.35));
      else if (t < 0.18) box(g, x + 1, y + 1, w - 2, h - 2, mix(G.base, G.joint, 0.25));
      box(g, x, y, 1, h, G.joint);
      box(g, x + 1, y + 1, w - 2, 1, G.lit);
    }
    box(g, x0, y + h - 1, x1 - x0, 1, G.joint);
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
const pineTree: TreeFn = (g, x, seed, s) => {
  const h = (70 + hash(seed) * 30) * s, R = R6('#2F6B3A');
  box(g, x - 2, B - 10 * s, 4, 10 * s, '#5E3E22');
  for (let k = 0; k < 4; k++) {
    const y = B - 8 * s - k * h * 0.22, w = (26 - k * 5) * s;
    inked(g, () => { g.moveTo(x - w, y); g.lineTo(x, y - h * 0.34); g.lineTo(x + w, y); g.closePath(); }, R[2]);
    box(g, x - w * 0.6, y - 3, w * 0.5, 2, R[3]); box(g, x + w * 0.2, y - 4, w * 0.6, 3, R[1]);
  }
};
const TREES: Record<StretchId, TreeFn> = {
  space: (g, x, seed, s) => {
    // (a Googie tree: a slim pole, discs stacked up it, teal and white, a bulb on top)
    const h = (80 + hash(seed) * 30) * s;
    box(g, x - 3, B - h, 6, h, INK); box(g, x - 2, B - h, 4, h, '#CBD5E1'); box(g, x - 2, B - h, 1, h, '#F1F5F9');
    for (let k = 0; k < 3; k++) {
      const y = B - h * (0.45 + k * 0.22), r = (22 - k * 5) * s, col = k % 2 ? '#F1F5F9' : '#22BCAC';
      inked(g, () => g.ellipse(x, y, r, r * 0.28, 0, 0, Math.PI * 2), col);
      box(g, x - r * 0.7, y - 1, r * 0.6, 1, mix(col, '#FFFFFF', 0.5)); box(g, x - r * 0.8, y + 2, r * 1.6, 1, mix(col, INK, 0.3));
    }
    inked(g, () => g.arc(x, B - h - 4, 4, 0, Math.PI * 2), '#E8659E');
  },
  frontier: (g, x, seed, s) => {
    if (hash(seed + 9) < 0.35) {
      // (a saguaro)
      const h = (60 + hash(seed) * 20) * s, R = R6('#4D7C3A');
      inked(g, () => g.roundRect(x - 6, B - h, 12, h, 6), R[3]); box(g, x - 4, B - h + 4, 2, h - 6, R[4]); box(g, x + 3, B - h + 4, 2, h - 6, R[1]);
      inked(g, () => { g.roundRect(x - 20, B - h * 0.7, 8, h * 0.35, 4); }, R[3]); inked(g, () => g.rect(x - 16, B - h * 0.4, 12, 6), R[3]);
      inked(g, () => { g.roundRect(x + 12, B - h * 0.85, 8, h * 0.3, 4); }, R[3]); inked(g, () => g.rect(x + 4, B - h * 0.58, 12, 6), R[3]);
      return;
    }
    pineTree(g, x, seed, s);
  },
  spooky: (g, x, seed, s) => {
    // (a dead tree: a twisted black trunk, its branches clawing out)
    const h = (80 + hash(seed) * 30) * s;
    g.lineCap = 'round';
    const branch = (x0: number, y0: number, a: number, len: number, w: number, d: number) => {
      const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
      g.strokeStyle = INK; g.lineWidth = w + 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = '#3B3049'; g.lineWidth = w; g.stroke();
      if (d > 0) { branch(x1, y1, a - 0.5 - hash(seed + d) * 0.3, len * 0.7, w * 0.65, d - 1); branch(x1, y1, a + 0.45 + hash(seed - d) * 0.3, len * 0.66, w * 0.6, d - 1); }
    };
    branch(x, B, -Math.PI / 2 + (hash(seed) - 0.5) * 0.3, h * 0.45, 7 * s, 3);
  },
  cartoon: (g, x, seed, s) => puffTree(g, x, B, (70 + hash(seed) * 30) * s, ['#4CC89C', '#FA9ACA', '#86CAF4', '#FCE880'][Math.floor(hash(seed + 1) * 4)], seed),
  america: (g, x, seed, s) => { box(g, x - 3, B - 30 * s, 6, 30 * s, '#5E3E22'); crown(g, x, B - 50 * s, 22 * s, R6('#3F8A4A')); },
  hollywood: (g, x, seed, s) => {
    // (a tall Washingtonia palm: the skinny trunk in rings, the shag under the crown)
    const h = (120 + hash(seed) * 30) * s, lean = (hash(seed + 2) - 0.5) * 16;
    for (let k = 0; k < h; k += 3) box(g, x + (lean * k) / h - 2, B - k - 3, 4, 3, (k / 3) % 3 ? '#8A6A4A' : '#6A4E34');
    const tx = x + lean, ty = B - h;
    box(g, tx - 4, ty, 8, 10, '#7A5A34');
    for (let k = 0; k < 7; k++) {
      const a = Math.PI + (k / 6) * Math.PI, ex = tx + Math.cos(a) * 26 * s, ey = ty + Math.sin(a) * 12 * s + 10;
      g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo((tx + ex) / 2, ty - 10, ex, ey); g.stroke();
      g.strokeStyle = k % 2 ? '#3F7A3A' : '#4F9A46'; g.lineWidth = 3; g.stroke();
    }
  },
  fantasy: (g, x, seed, s) => {
    const kind = Math.floor(hash(seed + 5) * 3);
    box(g, x - 2, B - 10 * s, 4, 10 * s, '#5E3E22');
    inked(g, () => g.roundRect(x - 10 * s, B - 12 * s, 20 * s, 10 * s, 2), '#B45309');
    if (kind === 0) { for (let k = 0; k < 3; k++) crown(g, x, B - 22 * s - k * 20 * s, (13 - k * 2.5) * s, R6('#2F7A4A')); }
    else if (kind === 1) {
      // (a spiral topiary)
      const h = 80 * s;
      for (let k = 0; k < 6; k++) { const y = B - 14 * s - k * h / 7, r = (16 - k * 2.2) * s; crown(g, x + (k % 2 ? 2 : -2), y - r * 0.4, r, R6('#2F7A4A')); }
    } else crown(g, x, B - 38 * s, 22 * s, R6('#3A8A54'));
  },
  adventure: (g, x, seed, s) => {
    if (hash(seed + 3) < 0.5) {
      // (a coconut palm, leaning)
      const h = (90 + hash(seed) * 30) * s, lean = (hash(seed + 2) - 0.5) * 40;
      for (let k = 0; k < h; k += 3) { const t = k / h; box(g, x + lean * t * t - 3, B - k - 3, 6, 3, (k / 3) % 2 ? '#8A6A44' : '#A0805A'); }
      const tx = x + lean, ty = B - h;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2, ex = tx + Math.cos(a) * 34 * s, ey = ty + Math.abs(Math.sin(a)) * 12 * s + (Math.sin(a) < 0 ? -6 : 14) * s;
        g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo((tx + ex) / 2, ty - 14 * s, ex, ey); g.stroke();
        g.strokeStyle = k % 2 ? '#3F6212' : '#65A30D'; g.lineWidth = 4; g.stroke();
      }
      for (const dx of [-3, 3]) inked(g, () => g.arc(tx + dx, ty + 4, 3, 0, Math.PI * 2), '#5E3E22');
      return;
    }
    // (broadleaf jungle, heaped, a fern at its foot)
    box(g, x - 3, B - 40 * s, 6, 40 * s, '#5E3E22');
    for (const [dx, dy, r] of [[-14, -46, 18], [14, -50, 18], [0, -66, 22]] as const) crown(g, x + dx * s, B + dy * s, r * s, R6('#2F6B22'));
    for (let k = 0; k < 5; k++) { const a = Math.PI + 0.3 + k * 0.6; g.strokeStyle = '#4D7C0F'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, B); g.quadraticCurveTo(x + Math.cos(a) * 10, B - 14, x + Math.cos(a) * 20, B - 4 + Math.sin(a) * 4); g.stroke(); }
  },
  foreign: (g, x, seed, s) => {
    if (hash(seed + 4) < 0.6) {
      // (a cypress: tall, narrow, dark)
      const h = (90 + hash(seed) * 30) * s, R = R6('#24502E');
      inked(g, () => g.ellipse(x, B - h / 2 - 4, 9 * s, h / 2, 0, 0, Math.PI * 2), R[2]);
      box(g, x - 5 * s, B - h * 0.8, 3, h * 0.6, R[3]); box(g, x + 3 * s, B - h * 0.7, 3, h * 0.5, R[1]);
      return;
    }
    box(g, x - 3, B - 26 * s, 6, 26 * s, '#6B5E4A'); crown(g, x, B - 42 * s, 20 * s, R6('#6B8A4A'));
  },
  staff: (g, x, seed, s) => {
    // (a scrubby thing that came up through a crack)
    box(g, x - 2, B - 26 * s, 3, 26 * s, '#5E4A32');
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

type Facade = (g: Ctx, cx: number, lit: boolean) => void;
const FAR = (lit: boolean): Far => ({ T: c => c, night: lit ? 0.85 : 0, s: 1.25, glass: '#9CC8E8' });

/** A wooden false-front building (Wilderness Land's): boards, a stepped false front, a porch roof on posts. */
const falseFront = (g: Ctx, x: number, w: number, h: number, col: string, sign: string, lit: boolean) => {
  const R = R6(col);
  g.save(); g.beginPath(); g.rect(x - 1, B - h - 12, w + 2, h + 12); g.clip();
  box(g, x - 1, B - h - 1, w + 2, h + 1, INK);
  planks(g, x, B - h, w, h, R, true, Math.round(x), 8);
  // (the stepped false front's top)
  box(g, x + w * 0.25, B - h - 10, w * 0.5, 11, INK); planks(g, x + w * 0.25 + 1, B - h - 9, w * 0.5 - 2, 10, R, true, 3, 8);
  g.restore();
  box(g, x - 2, B - h - 2, w + 4, 3, R[1]);
  // (the sign board)
  box(g, x + 6, B - h + 6, w - 12, 12, INK); box(g, x + 7, B - h + 7, w - 14, 10, '#F2E6C4');
  signText(g, sign, x + w / 2, B - h + 15, { sx: 1, sy: 1, fill: '#3A2208' });
  // (windows, a door, the porch: its roof (dimmed: not to stand on) on posts, the boardwalk)
  pane(g, x + 8, B - h + 26, 12, 14, '#3A2208', lit, '#7A9AB0'); pane(g, x + w - 20, B - h + 26, 12, 14, '#3A2208', lit, '#7A9AB0');
  box(g, x + w / 2 - 7, B - 26, 14, 26, INK); box(g, x + w / 2 - 6, B - 25, 12, 25, '#4A2E18'); box(g, x + w / 2 - 6, B - 25, 5, 25, '#3A2410');
  box(g, x - 4, B - 34, w + 8, 5, mix(R[1], '#3A3040', 0.25)); box(g, x - 4, B - 34, w + 8, 1, R[2]);
  for (const px of [x - 2, x + w / 2 - 14, x + w / 2 + 12, x + w - 1]) box(g, px, B - 30, 3, 30, R[1]);
  box(g, x - 6, B - 4, w + 12, 4, '#7A5232'); box(g, x - 6, B - 4, w + 12, 1, '#A07444');
};

const FACADES: Record<StretchId, Facade> = {
  space: (g, cx, lit) => {
    const F = FAR(lit);
    piece(g, F, 'pavilion', cx - 168, B, 11);
    piece(g, F, 'rocket', cx - 82, B, 4);
    piece(g, F, 'dome', cx + 42, B, 7);
    piece(g, F, 'saucer', cx + 158, B, 9);
  },
  frontier: (g, cx, lit) => {
    // The fort: a stockade of pointed logs, a blockhouse up on its corner, a flag; a store in front of it; the water
    // tower on its legs
    const sx0 = cx - 70, sx1 = cx + 110, sh = 64;
    for (let x = sx0; x < sx1; x += 8) {
      const h = sh + (hash(x) - 0.5) * 6, R = R6('#8A5A32');
      inked(g, () => { g.moveTo(x, B); g.lineTo(x, B - h); g.lineTo(x + 4, B - h - 6); g.lineTo(x + 8, B - h); g.lineTo(x + 8, B); }, R[3]);
      box(g, x + 1, B - h, 2, h, R[4]); box(g, x + 6, B - h, 1, h, R[1]);
    }
    box(g, sx0, B - 46, sx1 - sx0, 3, '#5E3E22');
    // (the blockhouse: bigger above than below, loopholes)
    const bx = cx + 100;
    slab(g, bx - 22, B - 96, 44, 96, R6('#7A4E2A'));
    slab(g, bx - 30, B - 130, 60, 40, R6('#8A5A32'));
    for (let k = 0; k < 4; k++) box(g, bx - 26, B - 124 + k * 9, 52, 1, '#5E3E22');
    inked(g, () => { g.moveTo(bx - 36, B - 130); g.lineTo(bx, B - 152); g.lineTo(bx + 36, B - 130); g.closePath(); }, mix('#5E3E22', '#3A3040', 0.2));
    for (const lx of [-16, 0, 16]) box(g, bx + lx - 1, B - 114, 3, 7, INK);
    falseFront(g, cx - 210, 84, 74, '#A07444', 'GENERAL STORE', lit);
    // (the water tower)
    const wx = cx + 190, R = R6('#9A6A3E');
    for (const lx of [-20, -7, 7, 20]) box(g, wx + lx - 2, B - 92, 4, 92, '#5E3E22');
    g.strokeStyle = '#5E3E22'; g.lineWidth = 2; g.beginPath(); g.moveTo(wx - 20, B - 10); g.lineTo(wx + 20, B - 60); g.moveTo(wx + 20, B - 10); g.lineTo(wx - 20, B - 60); g.stroke();
    inked(g, () => g.rect(wx - 26, B - 136, 52, 46), R[3]);
    for (let k = 0; k < 4; k++) box(g, wx - 26, B - 128 + k * 11, 52, 2, '#3A3A3A');
    box(g, wx - 24, B - 134, 6, 42, R[4]); box(g, wx + 14, B - 134, 10, 42, R[1]);
    inked(g, () => { g.moveTo(wx - 30, B - 136); g.lineTo(wx, B - 156); g.lineTo(wx + 30, B - 136); g.closePath(); }, '#6A4428');
    box(g, wx + 24, B - 104, 16, 3, '#57534E'); box(g, wx + 38, B - 104, 3, 14, '#57534E');
  },
  spooky: (g, cx, lit) => {
    // The haunted house: a crooked gabled front, shutters hanging, a round window up in the gable, the windows lit sick
    // green; a mausoleum; the cemetery behind its wall and gate, stones leaning
    const hx = cx - 210, hw = 120, hh = 120, R = R6('#5A5268');
    slab(g, hx, B - hh, hw, hh, R);
    for (let y = B - hh + 8; y < B; y += 8) box(g, hx + 2, y, hw - 4, 1, R[2]);
    const roof = R6('#2E2440');
    inked(g, () => { g.moveTo(hx - 10, B - hh); g.lineTo(hx + 30, B - hh - 50); g.lineTo(hx + 62, B - hh - 34); g.lineTo(hx + 92, B - hh - 64); g.lineTo(hx + hw + 10, B - hh); g.closePath(); }, roof[2]);
    checker(g, hx, B - hh - 8, hw, 4, roof[1]);
    box(g, hx + 80, B - hh - 96, 10, 40, roof[1]); box(g, hx + 78, B - hh - 98, 14, 4, INK);
    const glow = lit ? '#D9F99D' : '#4A4458';
    for (const [wx, wy] of [[hx + 14, B - hh + 22], [hx + 84, B - hh + 22], [hx + 14, B - hh + 66], [hx + 84, B - hh + 66]] as const) {
      box(g, wx - 1, wy - 1, 22, 26, INK); box(g, wx, wy, 20, 24, glow); box(g, wx + 9, wy, 2, 24, INK); box(g, wx, wy + 11, 20, 2, INK);
      box(g, wx - 8, wy + 2, 6, 20, '#3B3049'); box(g, wx + 23, wy + 4, 6, 20, '#3B3049');
    }
    inked(g, () => g.arc(hx + 92, B - hh - 30, 7, 0, Math.PI * 2), lit ? '#BEF264' : '#3F3F46');
    box(g, hx + 48, B - 34, 24, 34, INK); box(g, hx + 49, B - 33, 22, 33, '#2E1A10');
    // (the mausoleum)
    const mx = cx + 10;
    slab(g, mx - 34, B - 64, 68, 64, R6('#8A8494'));
    inked(g, () => { g.moveTo(mx - 42, B - 64); g.lineTo(mx, B - 88); g.lineTo(mx + 42, B - 64); g.closePath(); }, '#9A94A4');
    for (const px of [-26, -12, 12, 26]) { box(g, mx + px - 3, B - 60, 6, 60, '#B4AEBE'); box(g, mx + px + 1, B - 60, 2, 60, '#6E6880'); }
    box(g, mx - 8, B - 40, 16, 40, '#0A0614');
    // (the cemetery: its stones behind its wall, the gate)
    for (let k = 0; k < 7; k++) {
      const tx = cx + 70 + k * 22 + hash(k) * 6, th = 18 + hash(k + 3) * 10, lean = (hash(k + 7) - 0.5) * 0.3;
      g.save(); g.translate(tx, B - 12); g.rotate(lean);
      inked(g, () => g.roundRect(-6, -th, 12, th, [6, 6, 0, 0]), '#8A8494'); box(g, -4, -th + 4, 2, th - 6, '#B4AEBE'); box(g, -2, -th + 6, 5, 1, '#57506A');
      g.restore();
    }
    slab(g, cx + 60, B - 14, 166, 14, R6('#6E6684'));
    for (const px of [cx + 60, cx + 214]) { slab(g, px - 6, B - 52, 16, 52, R6('#6E6684')); inked(g, () => g.arc(px + 2, B - 56, 7, 0, Math.PI * 2), '#8A8494'); }
  },
  cartoon: (g, cx, lit) => {
    // A wobbly toon house with a mushroom roof; a tall crooked shop, round windows; the candy-striped water tower,
    // smiling; giant lollipops
    const ink3 = (path: () => void, fill: string) => { g.beginPath(); path(); g.fillStyle = fill; g.fill(); g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); };
    const hx = cx - 196;
    ink3(() => { g.moveTo(hx, B); g.quadraticCurveTo(hx - 6, B - 40, hx + 4, B - 70); g.lineTo(hx + 66, B - 70); g.quadraticCurveTo(hx + 76, B - 40, hx + 70, B); g.closePath(); }, '#FFF1F6');
    ink3(() => { g.moveTo(hx - 20, B - 64); g.quadraticCurveTo(hx + 35, B - 130, hx + 90, B - 64); g.closePath(); }, '#DC3442');
    for (const [dx, dy, r] of [[10, -84, 6], [36, -100, 8], [62, -80, 5]] as const) { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(hx + dx, B + dy, r, 0, Math.PI * 2); g.fill(); }
    ink3(() => g.ellipse(hx + 35, B - 40, 10, 12, 0, 0, Math.PI * 2), lit ? '#FFE8A0' : '#86CAF4');
    ink3(() => g.roundRect(hx + 26, B - 22, 18, 22, [9, 9, 0, 0]), '#F2822A');
    // (the crooked tall one)
    const tx = cx - 100;
    ink3(() => { g.moveTo(tx, B); g.lineTo(tx + 6, B - 120); g.quadraticCurveTo(tx + 30, B - 132, tx + 58, B - 116); g.lineTo(tx + 52, B); g.closePath(); }, '#BAA4F0');
    for (const [wx, wy] of [[18, -96], [38, -96], [16, -66], [36, -66]] as const) ink3(() => g.arc(tx + wx, B + wy, 6, 0, Math.PI * 2), lit ? '#FFE8A0' : '#C6E8FC');
    ink3(() => { g.moveTo(tx + 4, B - 116); g.quadraticCurveTo(tx + 30, B - 150, tx + 62, B - 112); g.closePath(); }, '#4CA8E8');
    // (the water tower: candy stripes, a smile, on stripy legs)
    const wx = cx + 150;
    for (const lx of [-24, -8, 8, 24]) { stripes(g, () => g.rect(wx + lx - 3, B - 100, 6, 100), '#FFFFFF', '#DC3442', wx + lx - 3, B - 100, 6, 100, 5, 0.8); g.strokeStyle = INK; g.lineWidth = 1.5; g.strokeRect(wx + lx - 3, B - 100, 6, 100); }
    const tank = () => { g.moveTo(wx - 38, B - 100); g.quadraticCurveTo(wx - 44, B - 140, wx - 32, B - 168); g.lineTo(wx + 32, B - 168); g.quadraticCurveTo(wx + 44, B - 140, wx + 38, B - 100); g.closePath(); };
    stripes(g, tank, '#FFFFFF', '#DC3442', wx - 46, B - 170, 92, 72, 9, 0);
    g.beginPath(); tank(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    ink3(() => { g.moveTo(wx - 40, B - 166); g.quadraticCurveTo(wx, B - 206, wx + 40, B - 166); g.closePath(); }, '#F06A72');
    ink3(() => g.arc(wx, B - 196, 6, 0, Math.PI * 2), '#FCE880');
    // (its face: eyes up in the stripes, a big smile)
    for (const ex of [-12, 12]) { ink3(() => g.ellipse(wx + ex, B - 146, 6, 8, 0, 0, Math.PI * 2), '#FFFFFF'); box(g, wx + ex - 1, B - 146, 4, 5, INK); }
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(wx, B - 130, 14, 0.2, Math.PI - 0.2); g.stroke();
    // (lollipops)
    for (const [lx, h, col] of [[cx + 60, 70, '#4CC89C'], [cx + 84, 56, '#F2822A'], [cx + 218, 64, '#9476DE']] as const) {
      box(g, lx - 2, B - h, 4, h, INK); box(g, lx - 1, B - h, 2, h, '#FFFFFF');
      ink3(() => g.arc(lx, B - h, 14, 0, Math.PI * 2), col);
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.beginPath(); g.arc(lx, B - h, 8, 0, Math.PI * 1.4); g.stroke();
    }
  },
  america: (g, cx, lit) => {
    // Main Street's last shopfronts either side of the gate: brick, cream trim, striped awnings (dimmed back: not to
    // stand on), bunting
    for (const [x0, w, col] of [[cx - 262, 70, '#B4533C'], [cx - 190, 70, '#E8DCC4'], [cx + 118, 70, '#7A9ABE'], [cx + 190, 74, '#B4533C']] as const) {
      const R = R6(col), h = 110 + hash(x0) * 20;
      slab(g, x0, B - h, w, h, R);
      box(g, x0 - 2, B - h - 6, w + 4, 6, '#F1E8D8'); box(g, x0 - 2, B - h - 6, w + 4, 1, '#FFFFFF');
      for (const wy of [B - h + 14, B - h + 44]) for (const wx of [x0 + 8, x0 + w - 22]) pane(g, wx, wy, 14, 18, '#F1E8D8', lit && hash(wx + wy) > 0.4);
      const aw = mix('#DC2626', '#4A4458', 0.3);
      for (let k = 0; k < w; k += 8) box(g, x0 + k, B - 44, 8, 10, (k / 8) % 2 ? mix('#F8FAFC', '#4A4458', 0.25) : aw);
      box(g, x0 + 6, B - 32, w - 12, 32, INK); pane(g, x0 + 7, B - 31, w - 30, 22, '#3A2208', lit); box(g, x0 + w - 22, B - 31, 15, 31, '#5E3E22');
    }
  },
  hollywood: (g, cx, lit) => {
    // The studio gate (two deco pylons, the arch across, the lot beyond); the soundstage, its number painted on;
    // the searchlights soft behind it (not beams: a glow), a camera crane up over the wall
    const gx = cx - 165;
    for (const k of [-1, 1]) {
      const R = R6('#E8DCC4');
      slab(g, gx + k * 46 - 12, B - 110, 24, 110, R);
      for (let s = 0; s < 3; s++) slab(g, gx + k * 46 - 14 + s * 2, B - 120 - s * 8, 28 - s * 4, 10, R);
      for (let y = B - 100; y < B - 10; y += 14) box(g, gx + k * 46 - 8, y, 16, 2, '#C9A227');
    }
    slab(g, gx - 58, B - 104, 116, 16, R6('#E8DCC4'));
    signText(g, 'HAPPYWOOD STUDIOS', gx, B - 92, { sx: 1, sy: 1, fill: ['#FDE68A', '#C9A227', '#8A6A10'], dither: true });
    // (the lot beyond, through the gate)
    box(g, gx - 34, B - 88, 68, 88, '#B8D4E8'); box(g, gx - 34, B - 40, 68, 40, '#D6CDB8'); box(g, gx - 30, B - 70, 30, 30, '#E7E5E4'); box(g, gx + 4, B - 60, 26, 20, '#A8A29E');
    box(g, gx - 34, B - 8, 68, 8, '#52525B');
    // (the guard's booth bar, up)
    box(g, gx - 30, B - 30, 3, 30, '#F8FAFC'); g.save(); g.translate(gx - 29, B - 28); g.rotate(-1.2); for (let k = 0; k < 6; k++) box(g, k * 8, -2, 8, 4, k % 2 ? '#DC2626' : '#F8FAFC'); g.restore();
    // (soft searchlight glow behind the soundstage: a wash, no beams)
    for (let k = 0; k < 3; k++) { g.fillStyle = `rgba(254, 249, 195, ${(0.08 + k * 0.05).toFixed(2)})`; g.beginPath(); g.ellipse(cx + 120, B - 150, 90 - k * 26, 40 - k * 10, 0, 0, Math.PI * 2); g.fill(); }
    // (the soundstage)
    const sx = cx + 30, sw = 190, sh = 128, R = R6('#D6CDB8');
    slab(g, sx, B - sh, sw, sh, R);
    inked(g, () => { g.moveTo(sx - 2, B - sh); g.quadraticCurveTo(sx + sw / 2, B - sh - 24, sx + sw + 2, B - sh); g.closePath(); }, R[2]);
    for (let x = sx + 10; x < sx + sw; x += 20) box(g, x, B - sh + 4, 1, sh - 4, R[2]);
    box(g, sx + 60, B - sh + 18, 70, 40, '#F8FAFC'); box(g, sx + 60, B - sh + 18, 70, 2, '#A8A29E');
    signText(g, 'STAGE 7', sx + 95, B - sh + 46, { sx: 2, sy: 3, fill: ['#3F3F46', '#27272A'], dither: true });
    box(g, sx + 20, B - 60, 50, 60, INK); box(g, sx + 21, B - 59, 48, 59, '#A8A29E'); for (let y = B - 56; y < B; y += 6) box(g, sx + 21, y, 48, 1, '#78716C');
    // (the red light over the door: rolling)
    inked(g, () => g.arc(sx + 45, B - 68, 4, 0, Math.PI * 2), '#EF4444');
    // (a camera crane up over the wall)
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(sx + sw - 30, B - sh); g.lineTo(sx + sw + 30, B - sh - 60); g.stroke();
    g.strokeStyle = '#57534E'; g.lineWidth = 3; g.stroke();
    inked(g, () => g.rect(sx + sw + 22, B - sh - 72, 20, 14), '#27272A'); inked(g, () => g.arc(sx + sw + 30, B - sh - 76, 6, 0, Math.PI * 2), '#3F3F46');
  },
  fantasy: (g, cx, lit) => {
    // Half-timbered cottages, slate roofs, warm windows; the storybook tower (round, a tall blue cone, a pennant); a
    // castle wall behind the portal
    const plaster = PLASTER, timber = TIMBER, slate = SLATE;
    const cottage = (x: number, w: number, h: number) => {
      slab(g, x, B - h, w, h, [plaster[1], plaster[2], plaster[3], plaster[4], plaster[5], '#FFFFFF']);
      box(g, x, B - h, 4, h, timber[2]); box(g, x + w - 4, B - h, 4, h, timber[2]); box(g, x, B - h * 0.5, w, 4, timber[2]);
      g.strokeStyle = timber[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 4, B - h * 0.5); g.lineTo(x + w / 2, B - h + 2); g.lineTo(x + w - 4, B - h * 0.5); g.stroke();
      inked(g, () => { g.moveTo(x - 10, B - h); g.lineTo(x + w / 2, B - h - w * 0.62); g.lineTo(x + w + 10, B - h); g.closePath(); }, slate[3]);
      for (let k = 1; k < 5; k++) { const y = B - h - k * w * 0.12; box(g, x + w / 2 - (w * 0.62 - k * w * 0.12) * 0.75, y, (w * 0.62 - k * w * 0.12) * 1.5, 1, slate[2]); }
      checker(g, x - 6, B - h - 4, w + 12, 2, slate[1]);
      for (const wx of [x + 10, x + w - 24]) { const lt = lit; box(g, wx - 1, B - h * 0.38 - 1, 16, 18, timber[1]); box(g, wx, B - h * 0.38, 14, 16, lt ? '#FFD87A' : '#9CB4D8'); box(g, wx + 6, B - h * 0.38, 2, 16, timber[1]); box(g, wx, B - h * 0.38 + 7, 14, 2, timber[1]); }
      box(g, x + w / 2 - 7, B - 22, 14, 22, timber[0]); box(g, x + w / 2 - 6, B - 21, 12, 21, timber[3]);
      box(g, x + w * 0.7, B - h - w * 0.5, 8, 22, '#7A2A22');
    };
    cottage(cx - 222, 70, 70);
    cottage(cx - 136, 62, 84);
    // (the castle wall behind the portal: crenellated, banners hung down it)
    const wallR = [FSTONE[1], FSTONE[2], FSTONE[3], FSTONE[4], FSTONE[5], '#FFFFFF'];
    slab(g, cx - 66, B - 92, 160, 92, wallR);
    for (let x = cx - 66; x < cx + 94; x += 16) slab(g, x, B - 102, 10, 10, wallR);
    for (const bx of [cx - 50, cx + 70]) { box(g, bx - 9, B - 86, 18, 40, '#1D4ED8'); g.fillStyle = '#1D4ED8'; g.beginPath(); g.moveTo(bx - 9, B - 46); g.lineTo(bx, B - 38); g.lineTo(bx + 9, B - 46); g.fill(); box(g, bx - 3, B - 76, 6, 6, '#FACC15'); }
    // (the storybook tower)
    const tx = cx + 170, tw = 46, th = 176, tR = [plaster[1], plaster[2], plaster[3], plaster[4], plaster[5], '#FFFFFF'];
    slab(g, tx - tw / 2, B - th, tw, th, tR);
    for (let y = B - th + 10; y < B; y += 12) box(g, tx - tw / 2 + 2, y, tw - 4, 1, plaster[2]);
    for (const wy of [B - th + 30, B - th + 80]) { box(g, tx - 6, wy - 1, 12, 20, INK); g.fillStyle = lit ? '#FFD87A' : '#9CB4D8'; g.beginPath(); g.roundRect(tx - 5, wy, 10, 18, [5, 5, 0, 0]); g.fill(); }
    // (a balcony, flowers in a box)
    box(g, tx - tw / 2 - 6, B - th + 54, tw + 12, 4, timber[2]); for (let k = 0; k < 6; k++) box(g, tx - 18 + k * 7, B - th + 50, 4, 4, ['#F472B6', '#FDE047'][k % 2]);
    inked(g, () => { g.moveTo(tx - tw / 2 - 8, B - th); g.lineTo(tx, B - th - 76); g.lineTo(tx + tw / 2 + 8, B - th); g.closePath(); }, '#2563EB');
    box(g, tx - 6, B - th - 60, 4, 56, '#3B82F6'); box(g, tx + 6, B - th - 40, 6, 38, '#1E40AF');
    checker(g, tx - tw / 2 - 4, B - th - 6, tw + 8, 4, '#1E40AF');
    box(g, tx - 1, B - th - 96, 2, 22, '#57534E');
  },
  adventure: (g, cx, lit) => {
    // A bamboo hut with a thatched roof and a tiki in front of it; a carved stone ruin; the fake rock, a cave in it and
    // the falls coming down it (the water's live: drawStretchLive), a pool at its foot
    const hx = cx - 214;
    planks(g, hx, B - 56, 80, 56, R6('#B4CC5C'), true, 5, 7);
    box(g, hx - 1, B - 57, 82, 1, INK);
    box(g, hx + 30, B - 34, 20, 34, '#2A1A0C');
    const thatch = R6('#C8A050');
    inked(g, () => { g.moveTo(hx - 14, B - 50); g.lineTo(hx + 40, B - 100); g.lineTo(hx + 94, B - 50); g.closePath(); }, thatch[3]);
    for (let k = 0; k < 12; k++) { const x = hx - 10 + k * 9; box(g, x, B - 56, 2, 8, thatch[1]); box(g, x + 4, B - 70 + Math.abs(k - 6) * 3, 2, 6, thatch[4]); }
    // (a tiki)
    const kx = cx - 110;
    slab(g, kx - 12, B - 64, 24, 64, R6('#8A5A32'));
    box(g, kx - 9, B - 54, 6, 5, INK); box(g, kx + 3, B - 54, 6, 5, INK); box(g, kx - 7, B - 40, 14, 8, INK); for (let k = 0; k < 3; k++) box(g, kx - 5 + k * 4, B - 40, 2, 3, '#F5F5F4');
    box(g, kx - 14, B - 64, 28, 4, '#C2410C');
    // (a ruin: a broken stone arch, glyphs carved in)
    const rx = cx - 40;
    stoneBlocks(g, rx - 30, B - 84, 18, 84, R6('#A8A29E'), 3, 18, 12);
    stoneBlocks(g, rx + 20, B - 60, 18, 60, R6('#A8A29E'), 5, 18, 12);
    stoneBlocks(g, rx - 30, B - 96, 46, 14, R6('#A8A29E'), 8, 23, 14);
    for (let k = 0; k < 4; k++) box(g, rx - 26 + (k % 2) * 6, B - 76 + k * 16, 6, 6, '#57534E');
    for (let k = 0; k < 5; k++) box(g, rx - 28 + k * 9, B - 98, 3, 26 + hash(k) * 30, '#15803D');
    // (the fake rock: lumps of painted concrete, too orange, a cave mouth, the falls' notch at the top)
    const fx = cx + 150, R = R6('#B0805A');
    const lumps: [number, number, number, number][] = [[-70, -40, 40, 40], [-40, -90, 46, 56], [10, -120, 50, 70], [56, -80, 40, 60], [74, -30, 34, 30], [-10, -40, 60, 40]];
    for (const [dx, dy, rw, rh] of lumps) inked(g, () => g.ellipse(fx + dx, B + dy, rw, rh, 0, 0, Math.PI * 2), R[2]);
    g.save(); g.beginPath(); for (const [dx, dy, rw, rh] of lumps) { g.moveTo(fx + dx + rw, B + dy); g.ellipse(fx + dx, B + dy, rw, rh, 0, 0, Math.PI * 2); } g.clip();
    for (const [dx, dy, rw, rh] of lumps) { g.fillStyle = R[3]; g.beginPath(); g.ellipse(fx + dx - rw * 0.15, B + dy - rh * 0.15, rw * 0.7, rh * 0.7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = R[4]; g.beginPath(); g.ellipse(fx + dx - rw * 0.35, B + dy - rh * 0.4, rw * 0.3, rh * 0.25, 0, 0, Math.PI * 2); g.fill(); }
    for (let y = B - 180; y < B; y += 12) checker(g, fx - 120, y, 240, 2, R[1]);
    box(g, fx - 120, B, 240, 1, INK);
    g.restore();
    // (the cave mouth, the pool)
    inked(g, () => { g.moveTo(fx - 50, B); g.quadraticCurveTo(fx - 36, B - 46, fx - 16, B); g.closePath(); }, '#1C1410');
    inked(g, () => g.ellipse(fx + 30, B - 3, 40, 6, 0, 0, Math.PI * 2), '#2A8AB0');
    for (const [dx, dy, r] of [[-80, -60, 14], [70, -100, 12], [20, -170, 16], [-30, -130, 10]] as const) crown(g, fx + dx, B + dy, r, R6('#3F7A22'));
  },
  foreign: (g, cx, lit) => {
    // A pavilion for each of a few countries, the way an American would do them: an onion dome, a Bavarian half-timber
    // front, a Spanish arcade in barrel tile, a pagoda roof; a gold dome over the lot
    // (onion dome)
    const ox = cx - 196;
    stucco(g, ox - 30, B - 70, 60, 70, R6('#F2E6D0'), 2); slab(g, ox - 30, B - 70, 60, 70, R6('#F2E6D0'));
    slab(g, ox - 10, B - 104, 20, 34, R6('#F2E6D0'));
    inked(g, () => { g.moveTo(ox - 2, B - 104); g.bezierCurveTo(ox - 28, B - 118, ox - 14, B - 140, ox, B - 156); g.bezierCurveTo(ox + 14, B - 140, ox + 28, B - 118, ox + 2, B - 104); g.closePath(); }, '#2E7D5B');
    for (let k = 0; k < 3; k++) box(g, ox - 12 + k * 8, B - 132 + k * 2, 2, 22, k === 0 ? '#5EC49A' : '#1E5A40');
    box(g, ox - 1, B - 166, 2, 12, '#C9A227');
    for (const wx of [ox - 22, ox + 8]) { box(g, wx - 1, B - 52, 14, 22, '#7A2A22'); box(g, wx, B - 51, 12, 20, lit ? '#FFD87A' : '#9CB4D8'); }
    // (half-timber)
    const bx = cx - 120;
    slab(g, bx, B - 96, 62, 96, [PLASTER[1], PLASTER[2], PLASTER[3], PLASTER[4], PLASTER[5], '#FFFFFF']);
    for (const [x1, y1, x2, y2] of [[0, 0, 62, 0], [0, 48, 62, 48], [0, 0, 20, 48], [62, 0, 42, 48], [31, 48, 31, 96]] as const) { g.strokeStyle = TIMBER[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(bx + x1, B - 96 + y1); g.lineTo(bx + x2, B - 96 + y2); g.stroke(); }
    inked(g, () => { g.moveTo(bx - 8, B - 96); g.lineTo(bx + 31, B - 140); g.lineTo(bx + 70, B - 96); g.closePath(); }, '#9A3A22');
    shingles(g, bx - 4, B - 118, 70, 20, R6('#9A3A22'), 7, 6, 1);
    for (const wx of [bx + 8, bx + 40]) { box(g, wx - 1, B - 82, 14, 18, TIMBER[1]); box(g, wx, B - 81, 12, 16, lit ? '#FFD87A' : '#9CB4D8'); box(g, wx - 3, B - 64, 18, 4, '#DC2626'); }
    // (Spanish arcade)
    const ax = cx + 56;
    slab(g, ax, B - 72, 96, 72, R6('#F4E8D2'));
    for (let k = 0; k < 4; k++) { const x = ax + 8 + k * 22; box(g, x - 1, B - 44, 16, 44, INK); g.fillStyle = '#5E3E22'; g.beginPath(); g.roundRect(x, B - 43, 14, 43, [7, 7, 0, 0]); g.fill(); }
    barrelTile(g, ax - 6, B - 86, 108, 14, R6('#C2410C'), 7);
    box(g, ax - 6, B - 86, 108, 1, INK);
    // (the pagoda)
    const px = cx + 196;
    for (let k = 0; k < 3; k++) {
      const y = B - 30 - k * 36, w = 54 - k * 10;
      slab(g, px - w / 2 + 8, y, w - 16, 30, R6('#B91C1C'));
      inked(g, () => { g.moveTo(px - w / 2 - 8, y + 4); g.quadraticCurveTo(px - w / 2, y - 2, px - w / 2 + 6, y - 8); g.lineTo(px + w / 2 - 6, y - 8); g.quadraticCurveTo(px + w / 2, y - 2, px + w / 2 + 8, y + 4); g.closePath(); }, '#1F3B2A');
    }
    box(g, px - 1, B - 152, 2, 22, '#C9A227');
  },
  staff: () => { /* (the back building's its own: draw.ts) */ },
};

// ---------------------------------------------------------------------------------------------------------------
// Between two lands: the little plaza where they meet

type Kiosk = 'snacks' | 'fountain' | 'gazebo' | 'souvenir' | 'info';
const KIOSKS: Kiosk[] = ['snacks', 'fountain', 'souvenir', 'gazebo', 'info', 'snacks', 'souvenir', 'fountain', 'gazebo', 'info'];
const kiosk = (g: Ctx, x: number, kind: Kiosk, a: StretchId, b: StretchId) => {
  const awning = (cols: [string, string]) => { for (let k = 0; k < 8; k++) inked(g, () => { g.moveTo(x - 36 + k * 9, B - 54); g.lineTo(x - 27 + k * 9, B - 54); g.lineTo(x - 31.5 + k * 9, B - 46); g.closePath(); }, mix(cols[k % 2], '#4A4458', 0.25)); };
  switch (kind) {
    case 'snacks': case 'souvenir': {
      slab(g, x - 30, B - 46, 60, 46, R6(kind === 'snacks' ? '#F1E8D8' : '#DDE6F2'));
      box(g, x - 26, B - 40, 52, 16, INK); box(g, x - 25, B - 39, 50, 14, '#3A2A1A');
      if (kind === 'snacks') for (let k = 0; k < 5; k++) { box(g, x - 22 + k * 10, B - 36, 6, 10, ['#F59E0B', '#EF4444', '#FDE68A'][k % 3]); }
      else for (let k = 0; k < 6; k++) inked(g, () => g.arc(x - 20 + k * 8, B - 32, 3, 0, Math.PI * 2), ['#EF4444', '#3B82F6', '#FDE047'][k % 3]);
      box(g, x - 32, B - 24, 64, 4, '#A8A29E');
      awning(kind === 'snacks' ? ['#DC2626', '#F8FAFC'] : ['#2563EB', '#F8FAFC']);
      box(g, x - 36, B - 62, 72, 9, INK); box(g, x - 35, B - 61, 70, 7, '#F8FAFC');
      signText(g, kind === 'snacks' ? 'SNACKS' : 'SOUVENIRS', x, B - 55, { sx: 1, sy: 1, fill: kind === 'snacks' ? '#B91C1C' : '#1E40AF' });
      return;
    }
    case 'fountain': {
      inked(g, () => g.ellipse(x, B - 6, 44, 8, 0, 0, Math.PI * 2), '#D6CDB8');
      inked(g, () => g.ellipse(x, B - 8, 38, 5, 0, 0, Math.PI * 2), '#4CA8D8');
      box(g, x - 30, B - 9, 18, 1, '#C6E8FC');
      slab(g, x - 5, B - 36, 10, 30, R6('#D6CDB8'));
      inked(g, () => g.ellipse(x, B - 36, 18, 4, 0, 0, Math.PI * 2), '#D6CDB8');
      return;
    }
    case 'gazebo': {
      for (const px of [-28, -10, 10, 28]) box(g, x + px - 2, B - 50, 4, 50, '#F8FAFC');
      box(g, x - 32, B - 14, 64, 3, '#F8FAFC'); for (let k = 0; k < 10; k++) box(g, x - 30 + k * 6.5, B - 14, 1, 14, '#E7E5E4');
      inked(g, () => { g.moveTo(x - 40, B - 50); g.lineTo(x, B - 80); g.lineTo(x + 40, B - 50); g.closePath(); }, mix('#7A9ABE', '#4A4458', 0.2));
      box(g, x - 1, B - 92, 2, 12, '#57534E');
      return;
    }
    case 'info': {
      slab(g, x - 14, B - 70, 28, 70, R6('#2F6B3A'));
      box(g, x - 10, B - 64, 20, 14, '#F8FAFC'); signText(g, 'i', x, B - 53, { sx: 2, sy: 1, fill: '#1E40AF' });
      // (the map board: both lands on it, the way it's drawn on the guide map)
      box(g, x - 40, B - 46, 80, 30, INK); box(g, x - 39, B - 45, 39, 28, mix(GROUNDS[a].base, '#FFFFFF', 0.2)); box(g, x, B - 45, 39, 28, mix(GROUNDS[b].base, '#FFFFFF', 0.2));
      box(g, x - 34, B - 36, 66, 2, '#DC2626'); inked(g, () => g.arc(x, B - 31, 3, 0, Math.PI * 2), '#DC2626');
      box(g, x - 36, B - 16, 3, 16, '#3F3F46'); box(g, x + 33, B - 16, 3, 16, '#3F3F46');
      return;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The fence along the back of the walk (the promenade behind it), by land; a plain shared box hedge where two meet

type FenceFn = (g: Ctx, x0: number, x1: number) => void;
const hedge: FenceFn = (g, x0, x1) => {
  const R = R6('#3F7A3A');
  box(g, x0, FY - 16, x1 - x0, 1, INK); box(g, x0, FY - 15, x1 - x0, 15, R[2]); box(g, x0, FY - 15, x1 - x0, 4, R[3]); checker(g, x0, FY - 11, x1 - x0, 2, R[3]);
  box(g, x0, FY - 4, x1 - x0, 4, R[1]);
  for (let x = Math.floor(x0 / 6) * 6; x < x1; x += 6) { box(g, x, FY - 16 + (Math.abs(x / 6) % 2), 3, 1, R[4]); if (hash(x) > 0.75) box(g, x + 1, FY - 10, 2, 2, ['#F472B6', '#FDE047', '#F8FAFC'][Math.floor(hash(x + 1) * 3)]); }
};
const FENCES: Record<StretchId, FenceFn> = {
  space: (g, x0, x1) => {
    box(g, x0, FY - 14, x1 - x0, 4, INK); box(g, x0, FY - 13, x1 - x0, 2, '#E2E8F0'); box(g, x0, FY - 12, x1 - x0, 1, '#94A3B8');
    for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) { inked(g, () => g.roundRect(x - 3, FY - 18, 6, 18, 3), '#CBD5E1'); box(g, x - 1, FY - 16, 1, 14, '#F8FAFC'); inked(g, () => g.arc(x, FY - 20, 3, 0, Math.PI * 2), Math.abs(x / 30) % 2 ? '#22BCAC' : '#E8659E'); }
  },
  frontier: (g, x0, x1) => {
    // (split rail, zigzagging)
    for (let x = Math.floor(x0 / 34) * 34; x < x1; x += 34) {
      for (const y of [FY - 18, FY - 9]) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x + 36, y); g.stroke(); g.strokeStyle = '#9A6A3E'; g.lineWidth = 3; g.stroke(); g.strokeStyle = '#C08A54'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 2, y + 2.5); g.lineTo(x + 34, y - 1.5); g.stroke(); }
      box(g, x - 2, FY - 22, 4, 22, '#6A4428');
    }
  },
  spooky: (g, x0, x1) => {
    box(g, x0, FY - 20, x1 - x0, 2, '#18141F'); box(g, x0, FY - 6, x1 - x0, 2, '#18141F');
    for (let x = Math.floor(x0 / 6) * 6; x < x1; x += 6) { box(g, x, FY - 22, 2, 22, '#18141F'); box(g, x - 1, FY - 24, 4, 2, '#18141F'); box(g, x, FY - 26, 2, 2, '#18141F'); }
    for (let x = Math.floor(x0 / 48) * 48; x < x1; x += 48) { box(g, x - 3, FY - 26, 6, 26, '#18141F'); box(g, x - 4, FY - 30, 8, 4, '#2A2438'); }
    // (pumpkins along it)
    for (let x = Math.floor(x0 / 42) * 42 + 20; x < x1; x += 42) if (hash(x) > 0.35) { inked(g, () => g.ellipse(x, FY - 4, 7, 5, 0, 0, Math.PI * 2), '#EA580C'); box(g, x - 1, FY - 4, 1, 4, '#9A3412'); box(g, x - 4, FY - 6, 2, 2, '#FDBA74'); box(g, x - 1, FY - 11, 2, 3, '#3F6212'); }
  },
  cartoon: (g, x0, x1) => {
    box(g, x0, FY - 12, x1 - x0, 3, '#1A1028'); box(g, x0, FY - 11, x1 - x0, 1, '#FFFFFF');
    for (let x = Math.floor(x0 / 10) * 10; x < x1; x += 10) { const col = ['#FA9ACA', '#86CAF4', '#FCE880', '#8AE4BE'][Math.abs(x / 10) % 4]; inked(g, () => g.roundRect(x, FY - 20, 7, 20, [3.5, 3.5, 0, 0]), col, 1.5); box(g, x + 1, FY - 18, 2, 14, '#FFFFFF'); }
  },
  america: (g, x0, x1) => {
    box(g, x0, FY - 12, x1 - x0, 2, '#E7E5E4');
    for (let x = Math.floor(x0 / 8) * 8; x < x1; x += 8) { inked(g, () => { g.moveTo(x, FY); g.lineTo(x, FY - 16); g.lineTo(x + 2.5, FY - 19); g.lineTo(x + 5, FY - 16); g.lineTo(x + 5, FY); }, '#F8FAFC'); }
  },
  hollywood: (g, x0, x1) => {
    // (brass stanchions, red velvet rope swagged between)
    for (let x = Math.floor(x0 / 36) * 36; x < x1; x += 36) {
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x, FY - 16); g.quadraticCurveTo(x + 18, FY - 6, x + 36, FY - 16); g.stroke();
      g.strokeStyle = '#B91C1C'; g.lineWidth = 2; g.stroke();
      box(g, x - 2, FY - 18, 4, 18, INK); box(g, x - 1, FY - 18, 2, 18, '#E0B84A'); inked(g, () => g.arc(x, FY - 19, 3, 0, Math.PI * 2), '#FDE68A'); box(g, x - 5, FY - 2, 10, 2, '#C9A227');
    }
  },
  fantasy: (g, x0, x1) => {
    hedge(g, x0, x1);
    for (let x = Math.floor(x0 / 54) * 54 + 27; x < x1; x += 54) { box(g, x - 4, FY - 22, 8, 8, '#2F6B2A'); crown(g, x, FY - 26, 7, R6('#3A8A44')); }
  },
  adventure: (g, x0, x1) => {
    for (let x = Math.floor(x0 / 5) * 5; x < x1; x += 5) { const h = 18 + (Math.abs(x / 5) % 3) * 2; box(g, x, FY - h, 4, h, INK); box(g, x, FY - h + 1, 3, h - 1, Math.abs(x / 5) % 2 ? '#B4CC5C' : '#9AB048'); box(g, x, FY - h + 7, 3, 1, '#6A8A28'); }
    box(g, x0, FY - 13, x1 - x0, 2, '#A27E44'); box(g, x0, FY - 6, x1 - x0, 2, '#A27E44');
  },
  foreign: (g, x0, x1) => {
    stucco(g, x0, FY - 12, x1 - x0, 12, R6('#F2E6D0'), 4);
    box(g, x0, FY - 12, x1 - x0, 12, '#EDE0C8'); box(g, x0, FY - 12, x1 - x0, 1, INK);
    barrelTile(g, x0, FY - 16, x1 - x0, 5, R6('#C2410C'), 5);
    for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) { inked(g, () => g.rect(x, FY - 26, 14, 9), '#B45309'); for (let k = 0; k < 4; k++) box(g, x + 1 + k * 3, FY - 30 - (k % 2) * 2, 3, 3, ['#DC2626', '#F8FAFC', '#FDE047', '#DC2626'][k]); }
  },
  staff: (g, x0, x1) => {
    // (chain link on pipe posts, a privacy slat or two gone)
    box(g, x0, FY - 24, x1 - x0, 2, '#9CA3AF');
    g.strokeStyle = 'rgba(156, 163, 175, 0.8)'; g.lineWidth = 1; g.beginPath();
    for (let x = Math.floor(x0 / 6) * 6; x < x1; x += 6) { g.moveTo(x, FY - 22); g.lineTo(x + 6, FY); g.moveTo(x + 6, FY - 22); g.lineTo(x, FY); }
    g.stroke();
    for (let x = Math.floor(x0 / 60) * 60; x < x1; x += 60) box(g, x - 2, FY - 26, 4, 26, '#6B7280');
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
  BACK_ITEMS.push({ x: nx, r: 48, paint: (g, x) => kiosk(g, x, KIOSKS[i], id, next) });
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
      const t = hash(Math.round(x) * 0.07 + r * 3);
      if (t > 0.72) box(g, x + 1, y + 1, w - 2, h - 2, mix(base, '#FFFFFF', 0.18)); else if (t < 0.2) box(g, x + 1, y + 1, w - 2, h - 2, mix(base, '#8A7650', 0.12));
      box(g, x, y, 1, h, '#B8A584'); box(g, x + 1, y + 1, w - 2, 1, mix(base, '#FFFFFF', 0.35));
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
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + s * hw(top), top); g.lineTo(cx + s * hw(bottom), bottom); g.stroke();
    g.strokeStyle = mix(G.lit, '#FFFFFF', 0.3); g.lineWidth = 1; g.beginPath(); g.moveTo(cx + s * hw(top) - s, top); g.lineTo(cx + s * hw(bottom) - s, bottom); g.stroke();
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
