// The fire extinguisher's foam on the queen (the intro's spray-and-shake beat): thick, billowing, clustered bubbles.
// Each lump is a cluster of overlapping bubbles shaded in a stepped white-to-blue-gray ramp, inked dark round the
// cluster's edge, a bright pip on each bubble; painted once per (look, size) into a stamp and put down after that.
// On her: globs on her head, crest, shoulders and arms, drips running down, a pile at her feet; it builds as he
// sprays, then (her shaking it off) shrinks and thins, its edges popping. In the air: the clouds out of the nozzle, the
// globs hitting her, the globs she flings off like a wet dog, the popped specks.

import { stamp } from '../../../m1/game/render/stamp';
import { GY } from '../geometry';

type Ctx = CanvasRenderingContext2D;

/** Ink (the cluster's edge), then shade to light: blue-gray to white. */
const INK = '#273244';
const SUD = ['#7D8BA1', '#A9B6C8', '#CFD8E3', '#E8EEF4', '#F8FAFC', '#FFFFFF'] as const;
/** The sizes a cluster's painted at (its radius); asked-for sizes go to the nearest. */
const SIZES = [3, 5, 7, 10, 13, 17] as const;
const LOOKS = 6;

const rnd = (seed: number) => { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string) => {
  if (rx <= 0 || ry <= 0) return; c.fillStyle = col; c.beginPath(); c.ellipse(Math.round(x), Math.round(y), rx, ry, 0, 0, Math.PI * 2); c.fill();
};

/** One lump of foam, round (0, 0), radius about R: bubbles in a heap, flatter underneath, the light up and left. */
const paintCluster = (c: Ctx, R: number, look: number) => {
  const r = rnd(look * 31 + R * 7 + 3);
  const n = R <= 3 ? 3 : R <= 7 ? 5 : 7;
  const bs: { x: number; y: number; r: number }[] = [{ x: 0, y: -R * 0.12, r: R * 0.62 }];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.8, d = R * (0.38 + r() * 0.26);
    const y = Math.sin(a) * d * 0.8;
    bs.push({ x: Math.cos(a) * d, y: y > 0 ? y * 0.6 : y, r: R * (0.34 + r() * 0.24) });
  }
  // (the little ones round the edge, stuck on)
  const small = R >= 7 ? 3 : R >= 5 ? 1 : 0;
  for (let i = 0; i < small; i++) { const a = r() * Math.PI * 2; bs.push({ x: Math.cos(a) * R * 0.92, y: Math.sin(a) * R * 0.62, r: Math.max(1.2, R * 0.16) }); }
  // (back first: the higher ones behind, the lower ones in front of them)
  bs.sort((p, q) => p.y - q.y);
  // (the ink round the whole heap, then each bubble shaded in steps over it)
  for (const b of bs) ell(c, b.x, b.y, b.r + 1.4, b.r * 0.92 + 1.4, INK);
  for (const b of bs) {
    const k = b.r;
    ell(c, b.x, b.y, k, k * 0.92, SUD[0]);
    ell(c, b.x - k * 0.08, b.y - k * 0.12, k * 0.84, k * 0.76, SUD[1]);
    ell(c, b.x - k * 0.16, b.y - k * 0.22, k * 0.66, k * 0.58, SUD[2]);
    if (k >= 2.5) ell(c, b.x - k * 0.24, b.y - k * 0.3, k * 0.46, k * 0.4, SUD[3]);
    if (k >= 4) ell(c, b.x - k * 0.3, b.y - k * 0.36, k * 0.26, k * 0.22, SUD[4]);
    // (its pip of shine)
    c.fillStyle = SUD[5]; c.fillRect(Math.round(b.x - k * 0.45), Math.round(b.y - k * 0.5), k >= 5 ? 2 : 1, k >= 5 ? 2 : 1);
  }
};

/** A lump of foam at (x, y), about r across (radius), in look `look` (any whole number). */
export const foamLump = (c: Ctx, x: number, y: number, r: number, look: number) => {
  if (r < 1.5) { speck(c, x, y, look); return; }
  let R: number = SIZES[0];
  for (const s of SIZES) if (Math.abs(s - r) < Math.abs(R - r)) R = s;
  const L = ((look % LOOKS) + LOOKS) % LOOKS;
  const tx = Math.round(x), ty = Math.round(y);
  c.translate(tx, ty);
  stamp(c, `qfoam|${L}|${R}`, -R * 1.5 - 3, -R * 1.3 - 3, R * 3 + 6, R * 2.6 + 6, g => paintCluster(g, R, L));
  c.translate(-tx, -ty);
};

/** A popped bubble's specks: a few pixels of white and pale blue. */
export const speck = (c: Ctx, x: number, y: number, i: number) => {
  c.fillStyle = i % 3 ? SUD[4] : SUD[2]; c.fillRect(Math.round(x), Math.round(y), 1, 1);
  if (i % 2) { c.fillStyle = SUD[5]; c.fillRect(Math.round(x) + 2, Math.round(y) - 1, 1, 1); }
};

/** A pop at the edge of a lump: a ring of specks flying out from where a bubble was. */
const pop = (c: Ctx, x: number, y: number, k: number, i: number) => {
  const d = 2 + k * 5;
  for (let j = 0; j < 4; j++) { const a = j * 1.57 + i; speck(c, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, i + j); }
};

const hash = (a: number, b: number) => { let h = (a * 374761393 + b * 668265263) >>> 0; h = ((h ^ (h >>> 13)) * 1274126177) >>> 0; return (h ^ (h >>> 16)) / 4294967296; };

// ---------------------------------------------------------------------------------------------------------------
// On her

/** A glob's spot on her: x, y (her local, facing right, before her lean), its size, when it's on (foam 0..1). */
type Glob = readonly [number, number, number, number];
const BODY: Glob[] = [
  // (her crest and dome: the most of it, where he aimed)
  [12, -302, 14, 0.05], [-26, -306, 12, 0.18], [-58, -300, 10, 0.32], [-86, -290, 8, 0.5], [40, -276, 11, 0.1], [58, -258, 7, 0.4], [20, -282, 9, 0.6],
  // (her shoulders, her neck)
  [22, -228, 13, 0.08], [-6, -236, 11, 0.24], [-30, -218, 9, 0.44], [8, -246, 8, 0.7],
  // (her chest, her belly)
  [24, -200, 10, 0.2], [-18, -190, 9, 0.36], [30, -176, 8, 0.52], [2, -162, 9, 0.62], [-24, -150, 7, 0.78], [12, -134, 8, 0.84],
  // (her hips)
  [-12, -118, 9, 0.56], [16, -112, 7, 0.74],
];
/** The pile at her feet (on the floor, her local): what's run off her. */
const PILE: Glob[] = [[-6, -42, 13, 0.3], [-30, -41, 11, 0.42], [20, -41, 12, 0.48], [-52, -39, 8, 0.66], [42, -39, 9, 0.6], [6, -50, 9, 0.72], [-20, -50, 7, 0.86], [62, -38, 5, 0.9]];
/** Drips: which globs run, and how far. */
const DRIPS: [number, number][] = [[1, 30], [7, 34], [11, 26], [14, 40], [3, 24]];

/** How much of a glob's on (0..1) at this much foam: it swells in as he sprays, shrinks back as she sheds it. */
const on = (foam: number, at: number) => Math.max(0, Math.min(1, (foam - at) / 0.3));

/**
 * The foam on her: drawn over her (the caller's transform: her floor, facing; not her lean, given here as `rot` round
 * (0, py)), hands where her two arms end (her local), how much (0..1), shedding (her shaking it off), the frame.
 */
export const drawFoamOn = (c: Ctx, foam: number, shed: boolean, t: number, rot: number, py: number, hands: readonly { x: number; y: number }[], floor: number) => {
  if (foam <= 0) return;
  const cs = Math.cos(rot), sn = Math.sin(rot);
  const P = (x: number, y: number) => ({ x: x * cs - (y - py) * sn, y: x * sn + (y - py) * cs + py });
  // (shaking it off: each glob jittering its own way)
  const jig = (i: number) => (shed ? Math.sin(t * 1.4 + i * 2.1) * 2.5 : 0);
  // (the pile at her feet: on the floor, no lean; it's last to go)
  for (let i = 0; i < PILE.length; i++) {
    const [x, y, r, at] = PILE[i], k = on(shed ? foam + 0.25 : foam, at);
    if (k <= 0) continue;
    foamLump(c, x, floor + (y + 36) * k, r * (0.4 + 0.6 * k), i + 3);
    if (shed && hash(t >> 2, i + 40) < 0.2) pop(c, x + r * 0.8, floor + y + 36 - r * 0.4, hash(t, i), i);
  }
  // (drips running down off her: a creamy streak, a bead at its end, slowly sliding)
  for (let d = 0; d < DRIPS.length; d++) {
    const [gi, len] = DRIPS[d], [x, y, r, at] = BODY[gi], k = on(foam, at + 0.15);
    if (k <= 0) continue;
    const slide = shed ? 1 : 0.6 + 0.4 * ((t * 0.01 + d * 0.37) % 1);
    const L = len * k * slide, top = P(x + r * 0.2, y + r * 0.4), end = P(x + r * 0.2, y + r * 0.4 + L), w = Math.max(2, 4 * k);
    c.strokeStyle = INK; c.lineWidth = w + 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(top.x, top.y); c.lineTo(end.x, end.y); c.stroke();
    c.strokeStyle = SUD[1]; c.lineWidth = w; c.beginPath(); c.moveTo(top.x, top.y); c.lineTo(end.x, end.y); c.stroke();
    c.strokeStyle = SUD[3]; c.lineWidth = Math.max(1, w - 2); c.beginPath(); c.moveTo(top.x - 1, top.y); c.lineTo(end.x - 1, end.y - 2); c.stroke();
    c.lineCap = 'butt';
    foamLump(c, end.x, end.y + 1, 2.5 + 2 * k, d);
  }
  // (the globs on her, and on her arms)
  const arms: Glob[] = [];
  for (let h = 0; h < hands.length; h++) {
    const hd = hands[h], at = h ? 0.5 : 0.15;
    arms.push([hd.x, hd.y - 4, 8, at], [(hd.x + 22) / 2, (hd.y - 222) / 2, 9, at + 0.12]);
  }
  const all = BODY.concat(arms);
  for (let i = 0; i < all.length; i++) {
    const [x, y, r, at] = all[i], k = on(foam, at);
    if (k <= 0) continue;
    const p = P(x + jig(i), y + jig(i + 7) * 0.6), rr = r * (0.35 + 0.65 * k);
    foamLump(c, p.x, p.y, rr, i);
    // (its edge popping: bubbles bursting off it as it goes; now and then as it piles on)
    if (hash(t >> 1, i) < (shed ? 0.3 : 0.04)) pop(c, p.x + (hash(t, i + 9) - 0.5) * rr * 2, p.y - rr * 0.6, hash(t >> 1, i + 3), i);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// In the air

/** A bit of foam loose: a lump flying (or billowing in place), or a popped speck. */
export interface Sud {
  x: number; y: number; vx: number; vy: number;
  /** Its size (radius); grows (a cloud billowing) or shrinks by `dr` a frame. */
  r: number; dr: number;
  life: number; grav: number; look: number;
  speck?: boolean;
  /** Landed on the floor: it lies there, settling, going. */
  down?: boolean;
}

const MAX_SUDS = 70;
export const addSud = (suds: Sud[], s: Sud) => { if (suds.length < MAX_SUDS) suds.push(s); };

/** Bursts a lump into specks. */
const burst = (suds: Sud[], s: Sud, n: number) => {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 0.6 + Math.random() * 1.4;
    addSud(suds, { x: s.x + Math.cos(a) * s.r * 0.6, y: s.y + Math.sin(a) * s.r * 0.5, vx: s.vx * 0.3 + Math.cos(a) * v, vy: s.vy * 0.2 + Math.sin(a) * v - 0.5, r: 1, dr: 0, life: 10 + Math.random() * 8, grav: 0.12, look: i, speck: true });
  }
};

/**
 * Moves the loose foam on: falling, billowing, landing (lying there, shrinking), hitting her (`hit`: the lump's spent,
 * just its pop), going (popping into specks).
 */
export const tickSuds = (suds: Sud[], hit: (s: Sud) => boolean) => {
  for (let i = suds.length - 1; i >= 0; i--) {
    const s = suds[i];
    s.life--;
    if (!s.down) { s.x += s.vx; s.y += s.vy; s.vy += s.grav; s.vx *= s.speck ? 0.94 : 0.985; }
    s.r = Math.max(0, s.r + s.dr);
    if (!s.speck && !s.down && s.y + s.r * 0.5 >= GY) { s.down = true; s.y = GY - s.r * 0.4; s.dr = -s.r / Math.max(8, s.life); }
    const spent = !s.speck && !s.down && hit(s);
    if (s.life <= 0 || s.r <= 0.5 || spent) {
      if (!s.speck) burst(suds, s, spent ? 3 : s.r > 6 ? 4 : 2);
      suds.splice(i, 1);
    }
  }
};

export const drawSuds = (c: Ctx, suds: Sud[]) => {
  for (const s of suds) {
    if (s.speck) speck(c, s.x, s.y, s.look);
    else foamLump(c, s.x, s.y, s.r, s.look);
  }
};
