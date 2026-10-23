// The backlot's soundstages wrecked (the havoc's far off; painted once for the hour into the stages' tile over the lot's
// own paintStages, then the live fires and smoke over it). The damage follows each building's own shape, SNES-style:
//   STAGE 11  burning: its roof holed (the trusses showing through, the corrugated panels torn and peeled up and bent at
//             the hole's ends, the panel ends charred), the elephant door blown in (its slats torn off in steps, the dark
//             inside, a lighting truss fallen across the opening with its cans, cables hanging), the SHOOTING lamp
//             smashed, two high windows blown out; soot streaked up the corrugation from each (dark at the opening,
//             thinning in dither going up); rubble at the door's foot.
//   STAGE 12  a wall caved in at its foot (the panels' broken ends bent in along the ribs, the dark inside, a slumped
//             truss, cables), the rubble heaped out over the lot; two windows blown; Steve's billboard torn (its lower
//             corner ripped off to the backing and the frame's struts, the torn piece hanging off the frame by a corner,
//             LIVE! half gone). Spent: its roof holed too.
//   STAGE 15  burning: its far corner fallen in (roof and wall gone above a jagged break that follows the ribs; the
//             back wall's inside showing (the sky only over it, where the whole wall's gone), the torn roof stub, a truss
//             hanging out of it, twisted beams, cables), the rubble heaped at its foot (the roof's AC unit crushed in it),
//             its roof holed, windows blown.
//   PROPS     two windows blown (soot up to the eaves), the roll-up door buckled in at its corner, the tile edge broken
//             (tiles slid down the wall), its name board hanging off one post.
// Nothing is drawn outside a building's outline but what's fallen (rubble resting at the feet, the hanging bits) and the
// smoke. Live: fires along the burning roofs and out of the holes, smoldering spots (embers, thin smoke); spent, the
// fires out, a few thin wisps.

import { CANVAS_WIDTH } from '../../../m1/constants';
import type { TimeOfDay } from '../../timeOfDay';
import { mist } from '../../adventure/farArt';
import { farCol, rampF } from '../blvd/far';
import { paintStages, smoke, stageRoofs, STAGES } from '../lot/far';
import { type Ctx, INK, box, checker, hash, poly, signText, plain, skyAt } from '../blvd/kit';
import { flame } from './paint';

const W = CANVAS_WIDTH;
const { SW, SH, SG } = STAGES;
/** The stages' foot in the tile. */
const F = SH - SG;
type St = { x: number; w: number; h: number; i: number };
type P = [number, number];
const ROOFS: St[] = stageRoofs();
const COLS = ['#C8BCA8', '#B8B0A4', '#D2C4AA', '#BEB4A0'];
export const burning = (i: number) => hash(i * 5.5 + 2) > 0.3;

/** The roof's line over x (its ridge 24 over the eaves, in the middle). */
const roofY = (s: St, px: number) => F - s.h - 24 * (1 - Math.min(1, Math.abs(px - (s.x + s.w / 2)) / (s.w / 2)));
/** The building's outline (the gable's overhang included). */
const outline = (s: St): P[] => [[s.x - 4, F - s.h], [s.x + s.w / 2, F - s.h - 24], [s.x + s.w + 4, F - s.h], [s.x + s.w, F - s.h], [s.x + s.w, F], [s.x, F], [s.x, F - s.h]];
const trace = (g: Ctx, pts: P[]) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
const clipTo = (g: Ctx, pts: P[]) => { trace(g, pts); g.clip(); };
const line = (g: Ctx, pts: P[], w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'miter'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
const stageOf = (i: number) => ROOFS.find(s => s.i === i);
const doorOf = (s: St) => ({ dx: s.x + s.w * 0.5, dw: Math.min(90, s.w * 0.34), dh: Math.min(s.h - 30, 120) });
const winX = (s: St, k: number) => s.x + s.w * 0.46 + k * 16;

// The plan (which stage gets what; the lot's stages by index: 0 STAGE 11, 1 STAGE 12, 2 STAGE 15)
const HOLE: Record<number, [number, number]> = { 0: [0.22, 0.42], 2: [0.25, 0.42] };
const HOLE_SPENT: Record<number, [number, number]> = { 1: [0.3, 0.42] };
const CAVE = { i: 1, u0: 0.04, u1: 0.17, up: 0.56 };
const CORNER = { i: 2, u: 0.74, down: 56 };
const DOOR = 0;
const WINS: Record<number, number[]> = { 0: [1, 2], 1: [0, 1], 2: [0, 2] };
/** The PROPS shed (the lot's: right after STAGE 12), Steve's billboard (on STAGE 12's end). */
const PROPS = (() => { const s = stageOf(1)!; return { x: s.x + s.w + 14, w: 130, h: 70 }; })();
const BILL = { x: 560, y: F - 182, w: 60, h: 40 };
const holeOf = (s: St, done: boolean) => HOLE[s.i] ?? (done ? HOLE_SPENT[s.i] : undefined);

/** STAGE 15's break: down from its roof at u, stepping along the ribs, to its far wall `down` under the eaves. */
const cornerBreak = (s: St): P[] => {
  const xa = Math.round(s.x + s.w * CORNER.u), xe = s.x + s.w + 1, ya = roofY(s, xa) + 1, ye = F - s.h + CORNER.down;
  const n = Math.ceil((xe - xa) / 5), pts: P[] = [];
  for (let k = 0; k <= n; k++) {
    const u = k / n, px = Math.min(xe, xa + k * 5);
    let py = ya + (ye - ya) * Math.pow(u, 1.35) + (k % 2 ? 3 : -1) + (hash(k * 3.7 + s.i) - 0.5) * 5;
    if (k === 0) py = ya; else if (k === n) py = ye;
    pts.push([px, Math.round(Math.max(roofY(s, px) + 2, py))]);
  }
  return pts;
};

/** Where the fires and the smolder are (tile coordinates), for the live layer. */
export const SMOLDER: { x: number; y: number; keep: boolean }[] = [];
const FIRES: { x: number; y: number; w: number; h: number }[] = [];
const PLUMES: { x: number; y: number; big: boolean }[] = [];
{
  for (const s of ROOFS) {
    const hole = HOLE[s.i], hot = burning(s.i);
    if (hole) {
      const hx = s.x + s.w * (hole[0] + hole[1]) / 2;
      SMOLDER.push({ x: hx, y: roofY(s, hx) + 6, keep: true });
      if (hot) {
        for (const u of [hole[0] + 0.05, (hole[0] + hole[1]) / 2, hole[1] - 0.05]) FIRES.push({ x: s.x + s.w * u, y: roofY(s, s.x + s.w * u) + 5, w: 14, h: 26 });
        PLUMES.push({ x: hx, y: roofY(s, hx) - 4, big: true });
      }
    }
    if (hot) {
      // (along the roof that's still there)
      const end = s.i === CORNER.i ? CORNER.u - 0.06 : 0.84, from = hole ? hole[1] + 0.06 : 0.18;
      for (let u = from; u <= end; u += 0.11) FIRES.push({ x: s.x + s.w * u, y: roofY(s, s.x + s.w * u) + 2, w: 10, h: 16 });
      for (const k of WINS[s.i] ?? []) FIRES.push({ x: winX(s, k) + 4, y: F - s.h + 16, w: 7, h: 12 });
    }
  }
  const s0 = stageOf(DOOR)!, d = doorOf(s0);
  SMOLDER.push({ x: d.dx + 14, y: F - 4, keep: false }, { x: d.dx + d.dw * 0.42, y: F - d.dh * 0.5, keep: true });
  if (burning(DOOR)) FIRES.push({ x: d.dx + d.dw * 0.25, y: F - 6, w: 12, h: 22 });
  const s1 = stageOf(CAVE.i)!;
  SMOLDER.push({ x: s1.x + s1.w * (CAVE.u0 + CAVE.u1) / 2, y: F - 12, keep: true });
  const s2 = stageOf(CORNER.i)!, br = cornerBreak(s2);
  SMOLDER.push({ x: br[Math.floor(br.length * 0.45)][0], y: br[Math.floor(br.length * 0.45)][1] + 3, keep: false }, { x: s2.x + s2.w * 0.93, y: F - 18, keep: true });
  if (burning(CORNER.i)) {
    FIRES.push({ x: s2.x + s2.w * 0.9, y: F - s2.h + CORNER.down - 4, w: 14, h: 24 }, { x: s2.x + s2.w * 0.82, y: F - 16, w: 12, h: 20 });
    PLUMES.push({ x: s2.x + s2.w * 0.88, y: F - s2.h + 20, big: true });
  }
  SMOLDER.push({ x: PROPS.x + PROPS.w * 0.6 + 4, y: F - PROPS.h + 22, keep: false });
}

// ---------------------------------------------------------------------------------------------------------------
// The pieces

type Pal = { R: string[]; IN: string[]; S: string[]; ST: string[]; T: (c: string) => string; glow: boolean };

/** Soot streaked up the corrugation over an opening (x0..x1, its top y0): rib by rib, longest over the middle, dark
 *  at the opening, thinner and dithered going up, the ribs' lit edges showing dimly through. */
const sootUp = (g: Ctx, p: Pal, ribX: number, x0: number, x1: number, y0: number, len: number, seed: number) => {
  const mid = (x0 + x1) / 2, half = (x1 - x0) / 2 + 6;
  for (let gx = ribX + Math.floor((x0 - 6 - ribX) / 5) * 5, k = 0; gx < x1 + 6; gx += 5, k++) {
    const u = (gx + 2.5 - mid) / half;
    if (Math.abs(u) >= 1) continue;
    const l = Math.round(len * (0.3 + 0.7 * (1 - u * u)) * (0.75 + 0.5 * hash(seed + k * 1.9))), a = Math.round(l * 0.4), b = Math.round(l * 0.7);
    box(g, gx, y0 - a, 5, a, p.S[0]);
    box(g, gx, y0 - b, 5, b - a, p.S[1]);
    box(g, gx + 2, y0 - b, 1, b - a, p.S[2]);
    checker(g, gx, y0 - l, 5, l - b, p.S[1], k % 2, 1);
    if (hash(seed + k * 4.1) > 0.5) box(g, gx + 1, y0 - l - 3, 1, 1, p.S[1]);
  }
};

/** A window blown out: the dark inside (a glow low in it, burning), shards left in the frame, its frame scorched. */
const blownWin = (g: Ctx, p: Pal, wx: number, wy: number, ww: number, wh: number, seed: number) => {
  box(g, wx - 1, wy - 1, ww + 2, wh + 2, p.S[0]);
  box(g, wx, wy, ww, wh, p.IN[0]);
  if (p.glow) { box(g, wx, wy + wh - 2, ww, 2, '#6A2410'); box(g, wx + 1, wy + wh - 1, ww - 2, 1, '#A8401A'); }
  const sh = p.T('#9AA4B0');
  box(g, wx, wy, 2, 2, sh); box(g, wx, wy + 2, 1, 1, sh);
  if (hash(seed) > 0.4) { box(g, wx + ww - 2, wy, 2, 1, sh); box(g, wx + ww - 1, wy + 1, 1, 2, sh); }
  else box(g, wx + ww - 3, wy + wh - 1, 3, 1, sh);
};

/** Rubble heaped at the foot (x0..x1, peaking at `peak` of the way along, `hmax` tall): a stepped mound of broken
 *  panels (ribbed, in the building's colors), concrete chunks and dark gaps, lit along its top. */
const heap = (g: Ctx, p: Pal, x0: number, x1: number, hmax: number, peak: number, seed: number) => {
  const span = x1 - x0, top: number[] = [];
  for (let x = x0; x < x1; x += 3) {
    const u = (x - x0) / span, prof = u < peak ? u / peak : (1 - u) / (1 - peak);
    top.push(Math.round(hmax * Math.pow(Math.max(0, prof), 0.7) * (0.8 + 0.25 * hash(seed + x * 0.37))));
  }
  top.forEach((h, k) => { const x = x0 + k * 3; if (h > 0) { box(g, x, F - h - 1, 3, h + 1, INK); box(g, x, F - h, 3, h, p.R[0]); } });
  const CON = [p.T('#5E5A56'), p.T('#8A8680'), p.T('#B4AEA6')];
  for (let k = 0; k < span * 0.55; k++) {
    const u = hash(seed + k * 1.31), x = x0 + u * span, h = top[Math.min(top.length - 1, Math.floor((x - x0) / 3))] ?? 0;
    if (h < 3) continue;
    const y = F - h + hash(seed + k * 2.7) * h * 0.8, cw = 3 + Math.round(hash(seed + k * 3.3) * 5), ch = 2 + Math.round(hash(seed + k * 4.9) * 3), t = hash(seed + k * 5.7);
    box(g, x - 1, y - 1, cw + 2, ch + 2, INK);
    if (t < 0.55) { box(g, x, y, cw, ch, p.R[t < 0.3 ? 1 : 2]); for (let r = 1; r < cw; r += 3) box(g, x + r, y, 1, ch, p.R[3]); }
    else box(g, x, y, cw, ch, CON[t < 0.8 ? 0 : 1]);
    box(g, x, y, cw, 1, t < 0.55 ? p.R[4] : CON[2]);
  }
  // (a bent panel sheet lying across it, ribbed)
  const bx = x0 + span * peak - 10, by = F - hmax * 0.55;
  poly(g, [[bx - 1, by + 4], [bx + 13, by - 4], [bx + 23, by + 1], [bx + 9, by + 9]], INK);
  poly(g, [[bx, by + 4], [bx + 13, by - 3], [bx + 21, by + 1], [bx + 9, by + 8]], p.R[3]);
  for (let r = 0; r < 4; r++) line(g, [[bx + 3 + r * 3, by + 2 - r * 1.5 + 4], [bx + 8 + r * 3, by + 7 - r * 1.5]], 1, p.R[1]);
};

/** A cable hanging from (x, y): sagging, swung a little, its torn end. */
const cable = (g: Ctx, x: number, y: number, len: number, lean: number, col: string) => {
  g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 0.5, y);
  g.quadraticCurveTo(x + lean * 1.4 + 0.5, y + len * 0.6, x + lean + 0.5, y + len); g.stroke();
  box(g, x + lean - 1, y + len, 2, 2, col);
};

/** A lattice truss from a to b (two chords, the zigzag between), steel, inked. */
const truss = (g: Ctx, p: Pal, a: P, b: P, d = 4) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = (-dy / L) * d, ny = (dx / L) * d;
  const c1: P[] = [a, b], c2: P[] = [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny]];
  const zz: P[] = [];
  for (let t = 0, k = 0; t <= 1; t += 6 / L, k++) zz.push([a[0] + dx * t + (k % 2 ? nx : 0), a[1] + dy * t + (k % 2 ? ny : 0)]);
  for (const [w, col] of [[3, INK], [1, p.ST[1]]] as const) { line(g, c1, w, col); line(g, c2, w, col); line(g, zz, Math.max(1, w - 1), col); }
  line(g, c1, 1, p.ST[2]);
};

/** A torn edge along pts (a broken panel end): inked, its metal edge lit, the ends of the ribs bent `dir` (1: down
 *  into the hole under it, -1: up). */
const tornEdge = (g: Ctx, p: Pal, pts: P[], dir: 1 | -1, seed: number) => {
  line(g, pts, 2, INK);
  line(g, pts.map(([x, y]) => [x, y - dir] as P), 1, p.R[4]);
  pts.forEach(([x, y], k) => {
    if (k === pts.length - 1 || hash(seed + k * 2.3) < 0.45) return;
    const l = 3 + Math.round(hash(seed + k * 3.1) * 4);
    box(g, x + 1, dir > 0 ? y + 1 : y - l, 3, l, INK); box(g, x + 2, dir > 0 ? y + 1 : y - l + 1, 1, l - 1, dir > 0 ? p.R[1] : p.R[3]);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Each building

/** A roof holed: jagged inside the gable's face, the dark under it, the trusses through it, the panel ends charred
 *  round it; a panel peeled up and bent back at one end, one hanging down into it at the other. */
const roofHole = (g: Ctx, p: Pal, s: St, u0: number, u1: number) => {
  const x0 = Math.round(s.x + s.w * u0), x1 = Math.round(s.x + s.w * u1), eave = F - s.h, seed = s.i * 17;
  const topE: P[] = [], botE: P[] = [];
  for (let x = x0, k = 0; x <= x1; x += 6, k++) {
    const r = roofY(s, x), b = eave - 2 - Math.round(hash(seed + k) * 3);
    const t = Math.min(b - 3, r + 3 + (k % 2 ? 2 : 0) + Math.round(hash(seed + k * 1.7) * 2));
    topE.push([x, t]); botE.push([x, b]);
  }
  const hole: P[] = [...topE, ...[...botE].reverse()];
  // (the panel ends round it charred, stepped out from the edge)
  g.save(); clipTo(g, outline(s)); trace(g, hole); g.lineWidth = 7; g.strokeStyle = p.S[1]; g.stroke(); g.lineWidth = 3; g.strokeStyle = p.S[0]; g.stroke(); g.restore();
  // (the dark under it, the trusses showing through: the bottom chord, the web up to the rafters)
  poly(g, hole, p.IN[0]);
  g.save(); clipTo(g, hole);
  if (p.glow) box(g, x0, eave - 5, x1 - x0, 5, '#4A1A0E');
  box(g, x0, eave - 6, x1 - x0, 2, p.ST[0]);
  g.strokeStyle = p.ST[1]; g.lineWidth = 1; g.beginPath();
  for (let x = x0 - 4, k = 0; x < x1 + 8; x += 8, k++) { g.moveTo(x, eave - 5); g.lineTo(x + (k % 2 ? 8 : 0), roofY(s, x + 4) - 2); }
  g.stroke();
  for (let x = x0 + 3; x < x1; x += 16) box(g, x, roofY(s, x) + 1, 1, eave - roofY(s, x), p.IN[2]);
  g.restore();
  tornEdge(g, p, topE, 1, seed);
  // (a panel peeled up and bent back off the hole's one end; one hanging down into it at the other)
  const hi = s.x + s.w / 2 > x0 ? x0 : x1, hs = hi === x0 ? -1 : 1, hy = roofY(s, hi) + 2;
  poly(g, [[hi, hy + 1], [hi + hs * 9, hy - 5], [hi + hs * 13, hy - 3], [hi + hs * 6, hy + 3]], INK);
  poly(g, [[hi + hs, hy], [hi + hs * 9, hy - 4], [hi + hs * 11, hy - 3], [hi + hs * 6, hy + 2]], p.R[4]);
  box(g, Math.min(hi + hs * 5, hi + hs * 8), hy - 2, 2, 1, p.R[1]);
  const lo = hi === x0 ? x1 : x0, ly = roofY(s, lo) + 3;
  poly(g, [[lo - 4, ly], [lo + 1, ly], [lo - 1, ly + 8], [lo - 5, ly + 7]], INK);
  box(g, lo - 3, ly + 1, 2, 6, p.R[1]);
};

/** STAGE 11's elephant door blown in: its slats torn off down the opening in steps, the dark inside, a lighting
 *  truss fallen across it with its cans, cables, the SHOOTING lamp smashed, soot up over it, rubble at its foot. */
const doorBlown = (g: Ctx, p: Pal, s: St) => {
  const { dx, dw, dh } = doorOf(s), top = F - dh, seed = s.i * 31 + 5;
  // (the tear: down the door from its top, stepping slat by slat)
  const edge: P[] = [];
  for (let y = top, k = 0; y <= F - dh * 0.3; y += 5, k++) {
    const u = (y - top) / (dh * 0.7);
    edge.push([Math.round(dx + dw * (0.78 - 0.7 * u) + (hash(seed + k) - 0.5) * 8), y]);
  }
  const open: P[] = [[dx, top], ...edge, [dx, edge[edge.length - 1][1]]];
  g.save(); clipTo(g, outline(s));
  sootUp(g, p, s.x + 2, dx, dx + dw * 0.75, top - 3, 44, seed);
  g.restore();
  poly(g, open, p.IN[0]);
  g.save(); clipTo(g, open);
  for (let y = top; y < F; y += 10) box(g, dx, y, dw, 10, p.IN[Math.min(2, Math.floor((y - top) / 30))]);
  if (p.glow) { box(g, dx, F - dh * 0.42, dw, 6, '#5A2010'); checker(g, dx, F - dh * 0.42 - 2, dw, 2, '#5A2010', 0, 2); }
  truss(g, p, [dx - 4, top + 8], [dx + dw * 0.62, F - dh * 0.3 + 6]);
  for (const t of [0.2, 0.48, 0.74]) {
    const cx = dx - 4 + (dw * 0.66) * t, cy = top + 8 + (dh * 0.7 - 2) * t;
    box(g, cx - 3, cy + 3, 7, 6, INK); box(g, cx - 2, cy + 4, 5, 4, p.ST[1]); box(g, cx - 1, cy + 7, 3, 1, t === 0.48 ? '#E8D8A0' : p.ST[0]);
  }
  cable(g, dx + 8, top, 30, 4, INK); cable(g, dx + dw * 0.3, top, 20, -3, p.ST[0]);
  g.restore();
  // (the slats' torn ends, bent in)
  tornEdge(g, p, edge, 1, seed);
  // (the lamp over it smashed, its glass gone, dark)
  box(g, dx + dw / 2 - 7, top - 13, 14, 7, p.S[0]); box(g, dx + dw / 2 - 6, top - 12, 3, 2, '#8A3A3A'); box(g, dx + dw / 2 + 3, top - 9, 3, 1, p.T('#9AA4B0'));
  heap(g, p, dx - 6, dx + dw * 0.6, 14, 0.35, seed);
};

/** STAGE 12's wall caved in at its foot: an arch of broken panel ends (stepping rib by rib), bent in, the dark
 *  inside, a slumped truss, cables down out of it, the rubble heaped out over the lot. */
const caveIn = (g: Ctx, p: Pal, s: St) => {
  const x0 = Math.round(s.x + s.w * CAVE.u0), x1 = Math.round(s.x + s.w * CAVE.u1), seed = s.i * 41 + 3;
  const edge: P[] = [];
  const rib = s.x + 2 + Math.ceil((x0 - s.x - 2) / 5) * 5;
  edge.push([x0, F]);
  for (let x = rib, k = 0; x <= x1; x += 5, k++) {
    const u = (x - x0) / (x1 - x0), up = s.h * CAVE.up * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, u))), 0.6) * (0.82 + 0.3 * hash(seed + k));
    edge.push([x, Math.round(F - Math.max(8, up))]);
    edge.push([Math.min(x1, x + 5), Math.round(F - Math.max(8, up))]);
  }
  edge.push([x1, F]);
  const top = Math.min(...edge.map(e => e[1]));
  g.save(); clipTo(g, outline(s));
  sootUp(g, p, s.x + 2, x0 + 6, x1 - 6, top - 2, 26, seed);
  g.restore();
  poly(g, edge, p.IN[0]);
  g.save(); clipTo(g, edge);
  for (let y = top; y < F; y += 12) box(g, x0, y, x1 - x0, 12, p.IN[F - y < 30 ? 2 : 1]);
  truss(g, p, [x0 - 6, top + 6], [x1 + 4, F - 18]);
  g.restore();
  tornEdge(g, p, edge.slice(1, -1), 1, seed);
  cable(g, x0 + (x1 - x0) * 0.35, top + 2, 22, 3, INK); cable(g, x0 + (x1 - x0) * 0.62, top + 4, 14, -2, p.ST[0]);
  heap(g, p, x0 - 10, x1 + 14, 22, 0.45, seed);
};

/** STAGE 15's corner fallen in (what was above the break is cleared off the tile first): the back wall's inside
 *  under its eaves, the torn roof stub, the wall's torn top, a truss hanging, twisted beams, cables, the rubble. */
const cornerIn = (g: Ctx, p: Pal, s: St) => {
  const br = cornerBreak(s), eave = F - s.h, x1 = s.x + s.w, seed = s.i * 53 + 7;
  const gone: P[] = [...br, [x1 + 8, br[br.length - 1][1]], [x1 + 8, 0], [br[0][0], 0]];
  const inside = (fn: () => void) => { g.save(); clipTo(g, gone); g.beginPath(); g.rect(br[0][0] - 1, eave, x1 - br[0][0] + 10, CORNER.down + 12); g.clip(); fn(); g.restore(); };
  // (the back wall's inside: ribbed, dark, warmer low down if it's burning; its top lip at the eaves)
  inside(() => {
  box(g, br[0][0], eave, x1 - br[0][0] + 1, CORNER.down + 10, p.IN[1]);
  for (let x = s.x + 2; x < x1; x += 5) if (x >= br[0][0]) box(g, x, eave, 1, CORNER.down + 10, p.IN[2]);
  box(g, br[0][0], eave, x1 - br[0][0] + 1, 2, p.R[0]);
  box(g, br[0][0], eave + 2, x1 - br[0][0] + 1, 4, p.IN[0]);
  if (p.glow) for (let k = 0; k < 3; k++) { const y = eave + CORNER.down - 4 - k * 8; box(g, br[0][0], y, x1 - br[0][0], 8, ['#5A2410', '#40180E', '#2E140E'][k]); checker(g, br[0][0], y - 2, x1 - br[0][0], 2, ['#5A2410', '#40180E', '#2E140E'][k], 0, 2); }
  });
  // (a truss hanging out of the roof stub into it; twisted beams up out of the break; cables)
  inside(() => truss(g, p, [br[0][0] + 14, eave + 2], [x1 - 4, eave + 22]));
  for (const k of [Math.floor(br.length * 0.35), Math.floor(br.length * 0.6), Math.floor(br.length * 0.85)]) {
    const [bx, by] = br[k], tx = bx + 4 + hash(seed + k) * 6, ty = Math.max(roofY(s, tx) + 3, by - 10 - hash(seed + k * 2) * 10);
    const beam: P[] = [[bx, by], [bx + 1, (by + ty) / 2 + 2], [tx, ty], [tx + 5, ty + 3]];
    line(g, beam, 4, INK); line(g, beam, 2, p.ST[1]); line(g, beam.slice(0, 3), 1, p.ST[2]);
  }
  tornEdge(g, p, br, 1, seed);
  for (const k of [Math.floor(br.length * 0.2), Math.floor(br.length * 0.5), Math.floor(br.length * 0.72)]) cable(g, br[k][0], br[k][1] + 1, 14 + hash(seed + k) * 16, (hash(seed * 2 + k) - 0.5) * 8, INK);
  // (the rubble at its foot, the roof's AC unit crushed in it)
  heap(g, p, s.x + s.w * 0.66, x1 + 14, 28, 0.72, seed);
  const ax = s.x + s.w * 0.84, ay = F - 20;
  poly(g, [[ax - 1, ay + 3], [ax + 18, ay - 2], [ax + 22, ay + 10], [ax + 3, ay + 15]], INK);
  poly(g, [[ax, ay + 3], [ax + 17, ay - 1], [ax + 20, ay + 9], [ax + 3, ay + 13]], p.T('#9A9EA2'));
  poly(g, [[ax, ay + 3], [ax + 17, ay - 1], [ax + 17, ay + 1], [ax, ay + 5]], p.T('#C8CCD0'));
  for (let k = 0; k < 3; k++) line(g, [[ax + 4, ay + 6 + k * 2], [ax + 14, ay + 4 + k * 2]], 1, p.T('#5A5E62'));
};

/** Steve's billboard torn: its lower corner ripped off to the dark backing and the frame's struts, the torn paper's
 *  white edge; the piece hanging off the frame by a corner (LIVE!'s end on it). */
const billTorn = (g: Ctx, p: Pal) => {
  const { x, y, w, h } = BILL, r = x + w - 1, b = y + h - 1;
  const tear: P[] = [[x + 26, b], [x + 30, b - 6], [x + 34, b - 4], [x + 38, b - 12], [x + 43, b - 10], [x + 46, b - 17], [x + 51, b - 16], [x + 54, b - 24], [r, b - 26]];
  const back: P[] = [...tear, [r, b]];
  poly(g, back, p.T('#241C1E'));
  g.save(); clipTo(g, back);
  for (const sx of [x + 44, x + 55]) { box(g, sx, y, 2, h, p.ST[1]); box(g, sx, y, 1, h, p.ST[2]); }
  box(g, x, b - 10, w, 2, p.ST[1]); box(g, x, b - 10, w, 1, p.ST[2]);
  g.restore();
  line(g, tear.map(([tx, ty]) => [tx - 1, ty - 1] as P), 1, p.T('#F4EEE2'));
  // (the piece, hung by its corner off the frame's edge)
  g.save(); g.translate(r, b - 25); g.rotate(-0.95);
  const piece: P[] = [[0, 0], [0, 22], [-8, 22], [-12, 17], [-16, 19], [-20, 12], [-24, 13], [-27, 5], [-28, 0]];
  poly(g, piece.map(([px, py]) => [px + (px < 0 ? -1 : 1), py + (py > 0 ? 1 : -1)] as P), INK);
  poly(g, piece, p.T('#EAB516'));
  box(g, -27, 0, 27, 2, p.T('#FAD43A'));
  box(g, -14, 5, 2, 7, p.T('#B4243A')); box(g, -14, 5, 5, 2, p.T('#B4243A')); box(g, -14, 8, 4, 1, p.T('#B4243A')); box(g, -14, 11, 5, 1, p.T('#B4243A'));
  box(g, -6, 5, 2, 5, p.T('#B4243A')); box(g, -6, 11, 2, 1, p.T('#B4243A'));
  line(g, piece.slice(2), 1, p.T('#F4EEE2'));
  g.restore();
};

/** The PROPS shed: two windows blown (soot up to the eaves), the roll-up door buckled in at its corner, the tile edge
 *  broken (tiles slid down the wall), its name board hanging off one post (cleared off the tile first). */
const propsWrecked = (g: Ctx, p: Pal) => {
  const { x, w, h } = PROPS, top = F - h, seed = 71;
  const Rr = rampF(p.T, '#B8603E'), body: P[] = [[x - 4, top - 6], [x + w + 4, top - 6], [x + w + 4, top + 1], [x + w, top + 1], [x + w, F], [x, F], [x, top + 1], [x - 4, top + 1]];
  g.save(); clipTo(g, body);
  for (const k of [0, 2]) { const wx = x + w * 0.6 + k * 16; sootUp(g, p, x, wx, wx + 10, top + 14, 18, seed + k); }
  const dx = x + w * 0.12, dw = Math.min(60, w * 0.4);
  sootUp(g, p, x, dx + dw * 0.4, dx + dw, F - 50, 16, seed + 9);
  g.restore();
  for (const k of [0, 2]) blownWin(g, p, x + w * 0.6 + k * 16, top + 15, 10, 10, seed + k);
  // (the door: its corner bowed in, the slats' torn ends lit)
  const gap: P[] = [[dx + dw * 0.45, F], [dx + dw * 0.6, F - 10], [dx + dw * 0.8, F - 17], [dx + dw, F - 22], [dx + dw, F]];
  poly(g, gap, p.IN[0]);
  tornEdge(g, p, gap.slice(0, 4), 1, seed);
  // (the tile edge broken: a run of tiles gone to the dark deck, two slid down the wall)
  const tx = x + w * 0.74;
  box(g, tx, top - 5, 18, 6, p.IN[0]); box(g, tx, top - 5, 18, 1, p.IN[2]);
  for (const [ox, oy] of [[2, 6], [10, 11]]) { poly(g, [[tx + ox, top + oy], [tx + ox + 5, top + oy - 1], [tx + ox + 5, top + oy + 4], [tx + ox, top + oy + 5]], INK); box(g, tx + ox + 1, top + oy, 3, 3, Rr[2]); box(g, tx + ox + 1, top + oy, 3, 1, Rr[3]); }
  // (the name board, hanging off its left post, its right end down on the eaves, scorched)
  const bw = 'PROPS'.length * 6 + 12, bx = x + w / 2 - bw / 2, px = bx + 6, py = top - 8;
  box(g, px, py, 2, 3, p.T('#3A3438'));
  g.save(); g.translate(px, py); g.rotate(0.2);
  box(g, -7, -14, bw + 2, 14, INK); box(g, -6, -13, bw, 12, p.T('#1C1014'));
  signText(g, 'PROPS', x + w / 2 - px, -4, plain(1, 1, p.T('#E8C25A')));
  checker(g, bw - 16, -13, 12, 12, p.S[0], 0, 2); box(g, bw - 8, -13, 4, 12, p.S[0]);
  g.restore();
  line(g, [[bx + bw - 7, top - 5], [bx + bw - 4, top - 9]], 2, p.T('#3A3438'));
};

// ---------------------------------------------------------------------------------------------------------------

/** The stages' tile, wrecked (painted once for the hour; `done` the spent revisit). */
export const paintWrecked = (g: Ctx, tod: TimeOfDay, done: boolean) => {
  paintStages(g, tod);
  const T = farCol(tod, 0.1);
  // (cleared off first: STAGE 15's corner above its break, the PROPS board where it stood)
  const s2 = stageOf(CORNER.i)!, br = cornerBreak(s2);
  g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
  trace(g, [...br, [s2.x + s2.w + 8, br[br.length - 1][1]], [s2.x + s2.w + 8, 0], [br[0][0], 0]]); g.fill();
  const bw = 'PROPS'.length * 6 + 12;
  g.fillRect(Math.floor(PROPS.x + PROPS.w / 2 - bw / 2 - 1), F - PROPS.h - 22, bw + 3, 16);
  g.restore();
  // (the damage painted apart, hazed like the rest, then laid on)
  const cv = document.createElement('canvas'); cv.width = SW; cv.height = SH;
  const d = cv.getContext('2d');
  if (!d) return;
  for (const s of ROOFS) {
    const R = rampF(T, COLS[s.i % COLS.length]);
    const p: Pal = { R, T, IN: ['#0C0809', '#161012', '#211A1A', '#2E2422'].map(T), S: ['#120C0A', '#22180F', '#3A2E26'].map(T), ST: ['#1E2024', '#4A4E56', '#7A808A'].map(T), glow: burning(s.i) && !done };
    const eave = F - s.h;
    // (the high windows blown, soot up the ribs over them onto the gable)
    d.save(); clipTo(d, outline(s));
    for (const k of WINS[s.i] ?? []) sootUp(d, p, s.x + 2, winX(s, k) - 1, winX(s, k) + 9, eave + 9, 22, s.i * 7 + k);
    d.restore();
    for (const k of WINS[s.i] ?? []) blownWin(d, p, winX(s, k), eave + 10, 8, 6, s.i * 7 + k);
    const hole = holeOf(s, done);
    if (hole) roofHole(d, p, s, hole[0], hole[1]);
    if (s.i === DOOR) doorBlown(d, p, s);
    if (s.i === CAVE.i) { caveIn(d, p, s); billTorn(d, p); propsWrecked(d, { ...p, R: rampF(T, '#D8C8A8'), glow: false }); }
    if (s.i === CORNER.i) cornerIn(d, p, s);
  }
  mist(d, SW, 0, F, skyAt(0.9, tod), 0.22, 0.04, 5);
  g.drawImage(cv, 0, 0);
};

/** The thin smoke off a smoldering spot: stepped, rising, leaning with the wind, thinning. */
const wisp = (c: Ctx, x: number, y: number, f: number, seed: number, a: number) => {
  for (let k = 0; k < 6; k++) {
    const t = ((f * 0.45 + k * 27 + seed * 19) % 160) / 160, r = 1 + t * 5;
    c.fillStyle = `rgba(78, 70, 68, ${(a * (1 - t)).toFixed(3)})`;
    c.fillRect(Math.round(x + Math.sin(t * 4 + seed) * 3 + t * 22 - r), Math.round(y - t * 80), Math.round(r * 2), Math.max(2, Math.round(r)));
  }
};
/** Embers glowing in a smoldering spot, flickering. */
const embers = (c: Ctx, x: number, y: number, f: number, seed: number) => {
  c.fillStyle = 'rgba(249, 115, 22, 0.28)'; c.fillRect(Math.round(x - 4), Math.round(y - 1), 8, 3);
  const E = ['#FDBA4A', '#F97316', '#B91C1C'];
  for (let k = 0; k < 4; k++) box(c, x - 3 + ((k * 5 + seed) % 7), y + (k % 2), 1 + (k === 1 ? 1 : 0), 1, E[((f >> 3) + k + seed) % 3]);
};

/** The live fires, smoke and smolder over the wrecked tile (its x offset, its top on screen). */
export const wreckFires = (c: Ctx, off: number, top: number, f: number, done: boolean) => {
  const base = -(((off % SW) + SW) % SW);
  for (let tx = base; tx < W; tx += SW) {
    const vis = (x: number) => tx + x > -80 && tx + x < W + 80;
    if (!done) {
      for (const p of PLUMES) if (vis(p.x)) smoke(c, tx + p.x, top + p.y, f, Math.round(p.x));
      FIRES.forEach((q, j) => { if (vis(q.x)) flame(c, tx + q.x, top + q.y, q.w + hash(j) * 4, q.h + hash(j * 3) * 8, f, j * 11 + 3); });
    }
    SMOLDER.forEach((s, j) => {
      if (!vis(s.x)) return;
      if (!done) { embers(c, tx + s.x, top + s.y, f, j); wisp(c, tx + s.x, top + s.y - 2, f, j * 3 + 1, 0.4); }
      else if (s.keep) wisp(c, tx + s.x, top + s.y - 2, f, j * 3 + 1, 0.26);
    });
  }
};
