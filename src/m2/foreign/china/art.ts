// CHINA's art (the SNES pass). THE GREAT WALL: its walk going back tread by tread to the far parapet's battlements
// (stepped up and down the ridge with it), its face in courses of cut stone (every tread's coping lit, the risers in the
// same stone, drain spouts on the flats, weathering down from the copings, a base course with moss along it, and here
// and there a plywood patch where a stretch of the facsimile fell out), the mountain under it in rock strata (a tile
// for the hour) with pines and scrub up the slope and the wall's shadow across it. The towers climbed inside (their
// dim stone insides, slits of sky, the joists let into the wall under every floor, a banner; stone piers and lintels at
// their doorways; battlements on their roofs). The summit PAGODA (red lacquer columns, lattice windows, the painted
// beams, green glazed roofs: their tile rolls, the tile ends along the eaves, the upturned corners and their fish, the
// bracket sets under; the gold finial). The lantern market: lacquer fronts (moon doors, lattice, glazed hip roofs,
// painted boards) and the paifang (drum stones, painted lintel, glazed roof, a pair of stone lions), the stalls and their
// goods, the lantern posts. The far end: the repair scaffold (galvanized poles, couplers, braces, planks) and the
// wall's raw end (the facsimile's cut: its stone skin and rammed earth, then the mountain's foam on its 2x4s), the
// fireworks battery (its rack, the cardboard mortars, the fuse) and its shells.
// Still art painted once for the hour; only what moves live. No layout here: index.ts and ridge.ts say where.

import type { GroundRun } from '../../../m1/game/core/terrain';
import { GY } from '../geometry';
import {
  type Ctx, type View, type Box3, INK, box, mix, poly, checker, hash, at, atDepth, ramp6, dimmed, hour, slab, post, ball, timeOfDay, glassOf,
  pixelBlob, stoneBlocks, planks, hole, facade, still, board, LOOKS, onScreen, lip, topBack, boxes3, box3Back, box3Front, ledge3, lantern, rockSlab,
} from '../kit';

type XY = (n: number) => number;
const lampsOn = () => timeOfDay().lamps > 0.3;
export const STONE = '#A8A08C', BRICK = '#8C8270', ROCK = '#5B6B3E', LACQUER = '#B91C1C', GOLD = '#CA8A04', GLAZE = '#166534', TEAL = '#0F766E';
const PLYWOOD = '#A87A3E';

// ---------------------------------------------------------------------------------------------------------------
// THE GREAT WALL

interface Tread { a: number; b: number; y: number; rise: number }
/** A run's treads (a flat run is one): where each tread's top is and how far its riser comes down (as the first pass). */
const treadsOf = (r: GroundRun): Tread[] => {
  const n = r.steps?.n ?? 1, out: Tread[] = [];
  for (let i = 0; i < n; i++) {
    const a = r.x1 + ((r.x2 - r.x1) * i) / n, b = r.x1 + ((r.x2 - r.x1) * (i + 1)) / n;
    const y = n === 1 ? r.y1 : r.y1 + ((r.y2 < r.y1 ? i + 1 : i) / n) * (r.y2 - r.y1);
    out.push({ a, b, y, rise: n > 1 ? Math.abs(r.y2 - r.y1) / n + 2 : 0 });
  }
  return out;
};
const slopeOf = (r: GroundRun) => (x: number) => r.y1 + ((x - r.x1) / (r.x2 - r.x1 || 1)) * (r.y2 - r.y1);

/** The mountain's rock (a tile, painted for the hour, laid on the world's grid): strata, lumps lit on top, cracks. */
const TW = 256, TH = 224;
const paintRock = (g: Ctx) => {
  // (slabs and boulders in loose courses (the streets' rock, kit rockSlab), their ends repeating with the tile so it
  // meets itself seamlessly; grass and lichen in the crevices)
  const M = ramp6(hour(ROCK));
  box(g, 0, 0, TW, TH, M[1]);
  const RHS = [22, 34, 28, 26, 36, 20, 30, 28];
  for (let k = 0, y = 0; k < RHS.length; y += RHS[k], k++) {
    const RH = RHS[k], N = 3 + ((k * 2) % 5), end = (i: number) => { const m = ((i % N) + N) % N; return Math.floor(i / N) * TW + m * (TW / N) + k * 37 % 50 + Math.round((hash(k * 3.7 + m * 1.9) - 0.5) * (TW / N) * 0.6); };
    for (let i = -N; end(i) < TW; i++) { if (end(i + 1) < 0) continue; rockSlab(g, end(i) + 1, end(i + 1) - 1, y + 1, y + RH - 1, M, hash(k * 5.3 + (((i % N) + N) % N) * 2.1), k * 17 + i); }
    for (let j = 0; j < 4; j++) box(g, hash(k * 13 + j) * TW, y + RH - 3, 3, 2, hour(j % 2 ? '#6A8A3A' : '#A8B06A'));
  }
  for (let j = 0; j < 5; j++) {
    let cx = hash(j * 4.4 + 9) * TW, cy = hash(j * 1.7 + 3) * TH * 0.7;
    for (let s = 0; s < 7; s++) { const nx = cx + (hash(j * 9 + s) - 0.5) * 8; box(g, Math.min(cx, nx), cy, Math.abs(nx - cx) + 1, 6, M[0]); cx = nx; cy += 6; }
  }
};
/** A pine on the slope (its trunk, three tiers lit on their left), stepped and inked. */
export const pine = (c: Ctx, x: number, foot: number, h: number, scenery = false) => {
  const P = ramp6(scenery ? dimmed('#2F5A2A') : hour('#2F5A2A')), T = ramp6(scenery ? dimmed('#5C3A1A') : hour('#5C3A1A'));
  box(c, x - 2, foot - h * 0.3, 4, h * 0.3, T[2]); box(c, x - 2, foot - h * 0.3, 1, h * 0.3, T[4]);
  for (let k = 0; k < 3; k++) {
    const w = h * (0.42 - k * 0.1), y = foot - h * 0.25 - k * h * 0.22, th = h * 0.34;
    poly(c, [[x - w - 1, y + 1], [x, y - th - 1], [x + w + 1, y + 1]], INK);
    poly(c, [[x - w, y], [x, y - th], [x + w, y]], P[2]);
    poly(c, [[x - w, y], [x, y - th], [x - w * 0.15, y]], P[3]);
    box(c, x - w + 2, y - 2, w * 0.6, 1, P[4]); box(c, x + w * 0.3, y - 2, w * 0.6, 2, P[1]);
  }
};
const shrub = (c: Ctx, x: number, y: number, r: number) => {
  const G = ramp6(hour('#4A6B2A'));
  pixelBlob(c, x, y, r + 1, r * 0.7 + 1, INK); pixelBlob(c, x, y, r, r * 0.7, G[2]); pixelBlob(c, x - r * 0.25, y - r * 0.2, r * 0.6, r * 0.4, G[3]);
  box(c, x - r * 0.4, y - r * 0.5, 2, 1, G[4]);
};
/** The mountain under a run (clipped to it): the rock tile on the world's grid over what's on screen, the wall's
 *  shadow across the slope, pines and scrub seeded by the world (they never crawl). */
const mountain = (c: Ctx, v: View, r: GroundRun) => {
  const f = slopeOf(r), bot = GY + 400;
  const xa = Math.max(r.x1, v.cam.x - 20), xb = Math.min(r.x2, v.cam.x + 820);
  const ya = Math.max(Math.min(r.y1, r.y2) + 150, v.cam.y - 20), yb = Math.min(bot, v.cam.y + 620);
  if (xb <= xa || yb <= ya) return;
  c.save(); c.beginPath(); c.moveTo(r.x1, f(r.x1) + 150); c.lineTo(r.x2, f(r.x2) + 150); c.lineTo(r.x2, bot); c.lineTo(r.x1, bot); c.closePath(); c.clip();
  for (let ty = Math.floor((ya - GY) / TH) * TH + GY; ty < yb; ty += TH) for (let tx = Math.floor(xa / TW) * TW; tx < xb; tx += TW) still(c, 'cn-rock', tx, ty, 0, 0, TW, TH, paintRock);
  // (deeper down the slope, darker: banded, dithered at each step)
  for (let k = 1; k < 4; k++) { const y = GY - 150 + k * 140; if (y > yb) break; c.fillStyle = `rgba(20, 14, 24, ${0.1 * k})`; c.fillRect(xa, Math.max(ya, y), xb - xa, yb - Math.max(ya, y)); checker(c, xa, y - 2, xb - xa, 2, 'rgba(20, 14, 24, 0.12)', 0, 2); }
  c.fillStyle = 'rgba(20, 14, 24, 0.38)'; c.beginPath(); c.moveTo(r.x1, f(r.x1) + 150); c.lineTo(r.x2, f(r.x2) + 150); c.lineTo(r.x2, f(r.x2) + 168); c.lineTo(r.x1, f(r.x1) + 168); c.fill();
  c.restore();
  for (let x = Math.ceil(xa / 64) * 64; x < xb; x += 64) {
    const t = hash(x * 0.031);
    if (t < 0.45) continue;
    const px0 = Math.min(r.x2 - 6, x + t * 30), y = f(px0) + 172 + hash(x * 0.07) * 70;
    if (y > bot - 10 || y < ya - 40 || y > yb + 60) continue;
    if (t > 0.72) pine(c, px0, y, 26 + hash(x) * 22); else shrub(c, px0, y, 8 + t * 6);
  }
};

/** A run's face (local: its top-left at (ox, oy)): cut stone in courses (in step with the world's), weathering under
 *  the copings, the base course and its moss; then every tread's coping, the drain spouts on the flats, and, on some
 *  runs, a plywood patch screwed in where the facsimile's fallen out. */
const paintFace = (g: Ctx, r: GroundRun, trs: Tread[], ox: number, oy: number) => {
  const w = r.x2 - r.x1, H = Math.abs(r.y2 - r.y1) + 150, f = slopeOf(r);
  const B = ramp6(hour(BRICK)), S = ramp6(hour(STONE)), M = ramp6(hour(ROCK));
  const L = (x: number, y: number): [number, number] => [x - ox, y - oy];
  g.save(); g.beginPath();
  [L(r.x1, r.y1), L(r.x2, r.y2), L(r.x2, r.y2 + 150), L(r.x1, r.y1 + 150)].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  for (const t of trs) if (t.rise) g.rect(t.a - ox, t.y - oy, t.b - t.a, t.rise);
  g.clip();
  const y0 = -((((oy - GY) % 18) + 18) % 18), x0 = -(((ox % 36) + 36) % 36);
  stoneBlocks(g, x0, y0, w - x0 + 36, H - y0 + 18, B, Math.round(ox), 36, 18);
  for (const t of trs) for (let x = Math.ceil(t.a / 46) * 46; x < t.b; x += 46) if (hash(x * 0.13) > 0.5) checker(g, x - ox + hash(x) * 20, t.y - oy + 10, 4, 18 + hash(x * 0.7) * 44, B[1], 0, 1);
  // (the base course: bigger, darker blocks along the foot, moss and grass up out of the joint)
  g.fillStyle = B[1]; g.beginPath(); [L(r.x1, r.y1 + 134), L(r.x2, r.y2 + 134), L(r.x2, r.y2 + 150), L(r.x1, r.y1 + 150)].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.fill();
  for (let x = Math.ceil(r.x1 / 26) * 26; x < r.x2; x += 26) { const y = f(x) + 134 - oy; box(g, x - ox, y, 1, 16, B[0]); box(g, x - ox + 1, y, 24, 1, B[2]); box(g, x - ox + 1, y + 1, 2, 14, B[2]); }
  for (let x = Math.ceil(r.x1 / 4) * 4; x < r.x2; x += 4) if (hash(x * 0.21) > 0.55) { const y = f(x) + 136 - oy, hh = 2 + Math.floor(hash(x * 0.9) * 5); box(g, x - ox, y - hh, 2, hh, M[hash(x) > 0.5 ? 3 : 2]); box(g, x - ox, y - hh, 1, 1, M[4]); }
  // (the facsimile showing: a plywood patch where a stretch fell out, its 2x4 frame, screws, a marker scrawl)
  if (trs.length === 1 && w > 220 && hash(ox * 0.017) > 0.55) {
    const px0 = Math.round(w * (0.3 + hash(ox) * 0.4)), py0 = Math.round(f(ox + px0) - oy + 40), P = ramp6(hour(PLYWOOD));
    box(g, px0 - 2, py0 - 2, 76, 52, INK); planks(g, px0, py0, 72, 48, P, true, ox, 12);
    for (const [x, y, ww, hh] of [[px0, py0, 72, 4], [px0, py0 + 44, 72, 4], [px0, py0, 4, 48], [px0 + 68, py0, 4, 48]] as const) { box(g, x, y, ww, hh, P[4]); box(g, x, y, ww, 1, P[5]); }
    for (const [x, y] of [[px0 + 2, py0 + 2], [px0 + 68, py0 + 2], [px0 + 2, py0 + 44], [px0 + 68, py0 + 44]] as const) box(g, x, y, 2, 2, '#71717A');
    box(g, px0 + 14, py0 + 22, 30, 2, hour('#1E3A8A')); box(g, px0 + 46, py0 + 20, 10, 2, hour('#1E3A8A'));
  }
  g.restore();
  for (const t of trs) {
    const x = t.a - ox, y = t.y - oy, tw = t.b - t.a;
    box(g, x, y, tw, 9, S[3]); box(g, x, y + 4, tw, 1, S[4]); box(g, x, y + 8, tw, 1, S[1]); checker(g, x, y + 9, tw, 2, B[1], 0, 1);
    for (let jx = Math.ceil(t.a / 40) * 40; jx < t.b; jx += 40) box(g, jx - ox, y + 4, 1, 5, S[1]);
    if (t.rise) { box(g, x, y, 1, t.rise, S[4]); box(g, x + tw - 1, y, 1, t.rise, B[0]); }
  }
  if (trs.length === 1) for (let x = Math.ceil(r.x1 / 220) * 220 + 90; x < r.x2 - 20; x += 220) {
    const sx = x - ox, sy = r.y1 - oy + 24;
    box(g, sx - 1, sy - 1, 14, 8, INK); box(g, sx, sy, 12, 6, S[3]); box(g, sx, sy, 12, 1, S[5]); box(g, sx + 3, sy + 3, 6, 2, INK);
    checker(g, sx + 3, sy + 8, 6, 64, B[1], 0, 1); box(g, sx + 5, sy + 8, 2, 40, B[1]);
  }
};
/** The walk's top going back (bands, lighter at the front), its paving's joints. */
const walkTop = (c: Ctx, v: View, t: Tread, S: string[]) => {
  if (!topBack(c, v.eye, t.a, t.b, t.y, 1, 0.9, S, 3)) return;
  c.strokeStyle = S[1]; c.lineWidth = 1; c.beginPath();
  for (let x = Math.ceil(t.a / 40) * 40; x < t.b; x += 40) { const [p0, q0] = at(v.eye, x, t.y, 1), [p1, q1] = at(v.eye, x, t.y, 0.9); c.moveTo(p0 + 0.5, q0); c.lineTo(p1 + 0.5, q1); }
  const [a0, b0] = at(v.eye, t.a, t.y, 0.95), [a1] = at(v.eye, t.b, t.y, 0.95);
  c.moveTo(a0, Math.round(b0) + 0.5); c.lineTo(a1, Math.round(b0) + 0.5);
  c.stroke();
};
/** The far parapet over a tread (dimmed: not somewhere to stand): its wall, its coping, battlements on the world's
 *  grid (lit left, shaded right, the odd arrow slit). */
const PD = 0.9;
const farParapet = (c: Ctx, v: View, t: Tread, D: string[]) => {
  const [pa, py] = at(v.eye, t.a, t.y, PD), [pb] = at(v.eye, t.b, t.y, PD), h = 24 * PD, top = Math.round(py - h);
  box(c, pa, top, pb - pa, py - top, D[2]); box(c, pa, top, pb - pa, 2, D[4]); box(c, pa, top + 2, pb - pa, 1, D[3]);
  box(c, pa, Math.round(py - h * 0.5), pb - pa, 1, D[1]); box(c, pa, py - 2, pb - pa, 2, D[1]);
  const mw = Math.round(12 * PD), mh = Math.round(11 * PD), my = top - mh;
  for (let x = Math.ceil(t.a / 22) * 22; x < t.b - 11; x += 22) {
    const [mx] = at(v.eye, x, t.y, PD);
    box(c, mx, my, mw, mh, D[3]); box(c, mx, my, mw, 1, D[5]); box(c, mx, my, 2, mh, D[4]); box(c, mx + mw - 2, my, 2, mh, D[1]);
    if (hash(x * 0.37) > 0.62) box(c, mx + mw / 2 - 1, my + 3, 2, 5, D[0]);
    box(c, mx, top + 3, 1, Math.round(h * 0.5) - 3, D[1]);
  }
};
/** The wall along its runs (the ground ones skipped): the mountain under every run first, then every far parapet, every
 *  walk top, then every face (stamped) and the lit lips on the treads. */
export const drawWall = (c: Ctx, v: View, runs: GroundRun[]) => {
  const vis: { r: GroundRun; i: number; t: Tread[] }[] = [];
  runs.forEach((r, i) => { if ((r.y1 === GY && r.y2 === GY) || !onScreen(v, r.x1, r.x2)) return; vis.push({ r, i, t: treadsOf(r) }); });
  if (!vis.length) return;
  const S = ramp6(hour(STONE)), D = ramp6(dimmed(STONE));
  for (const w of vis) mountain(c, v, w.r);
  for (const w of vis) for (const t of w.t) farParapet(c, v, t, D);
  for (const w of vis) for (const t of w.t) walkTop(c, v, t, S);
  for (const { r, i, t } of vis) {
    const ox = r.x1, oy = Math.min(r.y1, r.y2), w = r.x2 - r.x1, H = Math.abs(r.y2 - r.y1) + 152;
    still(c, `cn-wall-${i}-${Math.round(w)}`, ox, oy, -1, -1, w + 2, H + 2, g => paintFace(g, r, t, ox, oy));
  }
  for (const w of vis) for (const t of w.t) lip(c, t.a, t.y, t.b - t.a);
};

// ---------------------------------------------------------------------------------------------------------------
// The towers (climbed inside)

export interface Tower { a: number; b: number; base?: number; floors: readonly (readonly number[])[]; walls: readonly (readonly number[])[] }
/** A tower's inside (its back wall, local: foot at 0, `H` up): dim stone, the joists let in under each floor, arrow slits
 *  (the sky in them by day), a red banner. */
const paintInside = (g: Ctx, w: number, H: number, T: Tower, top: number, base: number) => {
  const R = ramp6(mix(dimmed('#6B6455'), INK, 0.22)), J = ramp6(mix(dimmed('#5C3A1A'), INK, 0.2)), G = glassOf();
  box(g, -1, -H - 1, w + 2, H + 2, INK);
  stoneBlocks(g, 0, -H, w, H, R, T.a, 26, 13);
  box(g, 0, -H, w, 4, R[0]); checker(g, 0, -H + 4, w, 6, R[0], 0, 2);
  for (const [a, b, h] of T.floors) if (h < top) {
    const y = -(h - base) + 10;
    box(g, a - T.a, y, b - a, 7, J[2]); box(g, a - T.a, y, b - a, 1, J[4]); box(g, a - T.a, y + 6, b - a, 1, J[0]);
    for (let x = a - T.a + 8; x < b - T.a - 6; x += 24) { box(g, x, y + 1, 6, 5, J[1]); box(g, x, y + 1, 6, 1, J[3]); }
  }
  for (let k = 0; k < 3; k++) {
    const sx = Math.round(w * (0.3 + k * 0.2)), sy = -H + 40 + k * 90;
    if (sy + 30 > -8) continue;
    box(g, sx - 4, sy - 3, 14, 30, R[4]); box(g, sx - 2, sy - 1, 10, 27, R[3]);
    box(g, sx - 1, sy - 1, 8, 26, INK); box(g, sx, sy, 6, 24, lampsOn() ? '#1C1430' : G[3]); box(g, sx, sy, 2, 24, lampsOn() ? '#2A2040' : G[4]);
  }
  if (w > 200 && H > 200) {
    const bx = Math.round(w * 0.6), by = -H + 26, bh = Math.min(130, Math.round(H * 0.38)), Rd = ramp6(mix(dimmed(LACQUER), INK, 0.1)), Gd = ramp6(dimmed(GOLD));
    box(g, bx - 4, by - 3, 40, 4, INK); box(g, bx - 3, by - 2, 38, 2, J[3]);
    box(g, bx - 1, by, 34, bh + 1, INK); box(g, bx, by, 32, bh, Rd[3]); box(g, bx, by, 3, bh, Rd[4]); box(g, bx + 28, by, 4, bh, Rd[2]);
    box(g, bx + 3, by + 3, 26, 1, Gd[3]); box(g, bx + 3, by + bh - 6, 26, 1, Gd[3]);
    for (let k = 0; k < 3; k++) { const ky = by + 20 + k * 30; if (ky > by + bh - 20) break; box(g, bx + 10, ky, 12, 12, Gd[2]); box(g, bx + 12, ky + 2, 8, 8, Rd[3]); box(g, bx + 15, ky + 5, 2, 2, Gd[4]); }
    poly(g, [[bx, by + bh], [bx + 16, by + bh + 10], [bx + 32, by + bh]], Rd[3]);
  }
};
const pier = (c: Ctx, x: number, y0: number, y1: number, P: string[]) => {
  box(c, x - 1, y0 - 1, 10, y1 - y0 + 1, INK); box(c, x, y0, 8, y1 - y0, P[3]); box(c, x, y0, 2, y1 - y0, P[4]); box(c, x + 6, y0, 2, y1 - y0, P[1]);
  for (let y = y0 + 12, k = 0; y < y1; y += 12, k++) { box(c, x, y, 8, 1, P[1]); box(c, x + (k % 2 ? 5 : 2), y - 11, 1, 11, P[2]); }
};
/** The doorway's lintel stone (dark: not a ledge). */
const lintel = (c: Ctx, x: number, y: number, P: string[]) => {
  box(c, x - 1, y - 1, 24, 9, INK); box(c, x, y, 22, 7, P[2]); box(c, x, y, 22, 1, P[3]); box(c, x, y + 6, 22, 1, P[0]);
  box(c, x + 7, y + 1, 1, 5, P[1]); box(c, x + 14, y + 1, 1, 5, P[1]);
};
/** A tower (cut away): its inside set back, the battlements on its roof, the piers and lintels at its doorways, its
 *  floors (planks; the roof stone), its solid walls (stone). */
export const drawTower = (c: Ctx, v: View, T: Tower, top: number, X: XY, Y: XY) => {
  if (!onScreen(v, X(T.a), X(T.b))) return;
  const base = T.base ?? 0, w = T.b - T.a, H = top - base;
  // (its inside, set back: kept above its base, so looking up at it, it never comes down over the wall's face)
  c.save(); c.beginPath(); c.rect(X(T.a) - 60, Y(top) - 400, w + 120, Y(base) - Y(top) + 400); c.clip();
  atDepth(c, v.eye, 0.94, () => still(c, `cn-tw-${T.a}`, X(T.a), Y(base), -2, -H - 2, w + 4, H + 4, g => paintInside(g, w, H, T, top, base)));
  c.restore();
  // (the battlements on its roof, behind its floor)
  const D = ramp6(dimmed(STONE)), [pa, py] = at(v.eye, X(T.a), Y(top), 0.93), [pb] = at(v.eye, X(T.b), Y(top), 0.93);
  box(c, pa, py - 12, pb - pa, 12, D[2]); box(c, pa, py - 12, pb - pa, 1, D[4]); box(c, pa, py - 2, pb - pa, 2, D[1]);
  for (let x = X(T.a); x < X(T.b) - 8; x += 26) {
    const [mx, my] = at(v.eye, x, Y(top), 0.93), t = Math.round(my - 24);
    box(c, mx, t, 13, 12, D[3]); box(c, mx, t, 13, 1, D[5]); box(c, mx, t, 2, 12, D[4]); box(c, mx + 11, t, 2, 12, D[1]);
  }
  const P = ramp6(hour(BRICK)), door = base + 110;
  pier(c, X(T.a) - 8, Y(top) - 20, Y(door), P); pier(c, X(T.b), Y(top) - 20, Y(door), P);
  lintel(c, X(T.a) - 10, Y(door), P); lintel(c, X(T.b) - 12, Y(door), P);
  for (const [a, b, h] of T.floors) ledge3(c, v, X(a), Y(h), b - a, h === top ? STONE : '#7C6A4E', h === top ? 16 : 10, h === top ? 'stone' : 'plank');
  boxes3(c, v, T.walls.map(([a, b, lo, hi]) => ({ x: X(a), top: Y(hi), w: b - a, bottom: Y(lo), col: BRICK, standable: true, look: 'stone' as const })));
};

// ---------------------------------------------------------------------------------------------------------------
// Glazed roofs (the pagoda's, the fronts', the paifang's)

/** A glazed roof (local: its ridge's left end at (0, 0), `w` along, `drop` down to the eaves, `out` past each end):
 *  the tile rolls lit down their left, banded lighter up top, the tile ends along the eave, the upturned corners with
 *  their little gold fish, a red fascia and the bracket sets under it. `R`: the glaze's ramp. */
const glazedRoof = (g: Ctx, w: number, drop: number, out: number, R: string[], scenery: boolean) => {
  const Gd = ramp6(scenery ? dimmed(GOLD) : hour(GOLD)), T = ramp6(scenery ? dimmed(TEAL) : hour(TEAL)), Rd = ramp6(scenery ? dimmed(LACQUER) : hour(LACQUER));
  const e = drop - 6;
  const shape: [number, number][] = [[0, 0], [w, 0], [w + out - 10, e - 4], [w + out, e - 18], [w + out + 2, e - 10], [w + out - 8, e + 4], [-out + 8, e + 4], [-out - 2, e - 10], [-out, e - 18], [-out + 10, e - 4]];
  g.save(); g.beginPath(); shape.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  g.fillStyle = R[2]; g.fill(); g.clip();
  box(g, -out - 4, 0, w + out * 2 + 8, Math.round(drop * 0.3), R[3]); checker(g, -out - 4, Math.round(drop * 0.3), w + out * 2 + 8, 2, R[3], 0, 1);
  box(g, -out - 4, Math.round(drop * 0.75), w + out * 2 + 8, drop, R[1]); checker(g, -out - 4, Math.round(drop * 0.75) - 2, w + out * 2 + 8, 2, R[1], 1, 1);
  for (let x = -out; x < w + out; x += 6) { box(g, x, 0, 3, drop, R[3]); box(g, x, 0, 1, drop, R[4]); box(g, x + 3, 0, 1, drop, R[0]); }
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); shape.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke();
  // (the tile ends along the eave, their glints)
  for (let x = -out + 12; x < w + out - 10; x += 6) { box(g, x - 2, e, 5, 4, INK); box(g, x - 1, e, 3, 3, R[4]); box(g, x - 1, e, 1, 1, R[5]); }
  // (the fish on each upturned corner)
  for (const s of [-1, 1]) {
    const tx = s < 0 ? -out : w + out, ty = e - 18;
    poly(g, [[tx - s * 2, ty + 4], [tx + s * 2, ty - 6], [tx + s * 6, ty - 8], [tx + s * 4, ty - 2], [tx + s * 2, ty + 6]], INK);
    poly(g, [[tx - s * 1, ty + 3], [tx + s * 2, ty - 5], [tx + s * 5, ty - 7], [tx + s * 3, ty - 2], [tx + s * 1, ty + 5]], Gd[3]);
    box(g, tx + s * 2, ty - 4, 1, 1, Gd[5]);
  }
  // (the fascia, then the bracket sets: teal and green blocks, gold lines, dark between)
  box(g, -out + 8, e + 4, w + out * 2 - 16, 4, INK); box(g, -out + 9, e + 4, w + out * 2 - 18, 3, Rd[2]);
  box(g, -out + 16, e + 8, w + out * 2 - 32, 8, INK);
  for (let x = -out + 18, k = 0; x < w + out - 22; x += 10, k++) { box(g, x, e + 8, 8, 7, (k % 2 ? T : R)[3]); box(g, x, e + 8, 8, 1, (k % 2 ? T : R)[5]); box(g, x + 2, e + 11, 4, 1, Gd[4]); }
};

// ---------------------------------------------------------------------------------------------------------------
// THE PAGODA at the summit

const paintStorey = (g: Ctx, w: number, h: number, i: number) => {
  const R = ramp6(hour(LACQUER)), T = ramp6(hour(TEAL)), Gd = ramp6(hour(GOLD)), Wd = ramp6(hour('#7C2D12')), on = lampsOn();
  box(g, -1, -h - 1, w + 2, h + 1, INK); slab(g, 0, -h, w, h, R, false);
  box(g, 0, -h, w, 14, T[3]); box(g, 0, -h, w, 1, T[5]); box(g, 0, -h + 13, w, 1, T[1]);
  for (let x = 4; x < w - 6; x += 16) { box(g, x, -h + 4, 8, 6, T[2]); box(g, x + 2, -h + 6, 4, 2, Gd[4]); }
  box(g, 0, -h + 14, w, 2, Gd[3]);
  const lattice = (x: number, y: number, ww: number, hh: number) => {
    box(g, x - 3, y - 3, ww + 6, hh + 6, INK); box(g, x - 2, y - 2, ww + 4, hh + 4, Wd[3]); box(g, x - 2, y - 2, ww + 4, 1, Wd[4]);
    box(g, x, y, ww, hh, on ? '#F2C870' : hour('#E8DCC0')); if (!on) box(g, x, y, ww, Math.round(hh * 0.4), hour('#F4ECD8'));
    for (let k = 4; k < ww; k += 6) box(g, x + k, y, 1, hh, Wd[2]);
    for (let k = 4; k < hh; k += 6) box(g, x, y + k, ww, 1, Wd[2]);
    box(g, x + 2, y + 2, 4, 4, Wd[3]); box(g, x + ww - 6, y + 2, 4, 4, Wd[3]);
  };
  if (i === 0) {
    lattice(w / 2 - 22, -78, 44, 72); box(g, w / 2, -78, 1, 72, Wd[1]);
    for (const wx of [18, w - 50]) if (wx > 10 && wx + 32 < w) lattice(wx, -h + 40, 32, 40);
  } else if (w > 90) { for (const wx of [14, w - 46]) lattice(wx, -h + 32, 32, Math.min(46, h - 50)); }
  else lattice(w / 2 - 14, -h + 30, 28, Math.min(44, h - 46));
  box(g, 0, -6, w, 6, R[1]); box(g, 0, -6, w, 1, R[2]);
};
/** A lacquer column (round: stepped across), its gold capital, its stone base. */
const column = (c: Ctx, x: number, top: number, foot: number, R: string[]) => {
  if (foot - top < 4) return;
  post(c, x, top, foot, 6, R);
  const Gd = ramp6(hour(GOLD)), S = ramp6(hour(STONE));
  box(c, x - 4, top, 9, 4, INK); box(c, x - 3, top, 7, 3, Gd[3]); box(c, x - 3, top, 7, 1, Gd[5]);
  box(c, x - 5, foot - 5, 11, 5, INK); box(c, x - 4, foot - 4, 9, 4, S[3]); box(c, x - 4, foot - 4, 9, 1, S[5]);
};
/** The summit pagoda: each storey's walls set back a touch, the columns, the glazed roofs (what he climbs: their ridges
 *  lit), the gold finial. `roofs`: [a, b, h] bottom to top; `base` the walk's height under it. */
export const drawPagoda = (c: Ctx, v: View, X: XY, Y: XY, roofs: [number, number, number][], base: number, finial: [number, number]) => {
  const a0 = Math.min(...roofs.map(r => r[0])) - 50, b0 = Math.max(...roofs.map(r => r[1])) + 50;
  if (!onScreen(v, X(a0), X(b0))) return;
  let last = base;
  roofs.forEach(([a, b, h], i) => {
    const sa = a + 20, sb = b - 20, sh = h - last, lo = last;
    c.save(); c.beginPath(); c.rect(X(sa) - 60, Y(h) - 200, sb - sa + 120, Y(lo) - Y(h) + 200); c.clip();
    atDepth(c, v.eye, 0.96, () => still(c, `cn-pg-st-${i}-${sb - sa}x${sh}`, X(sa), Y(lo), -2, -sh - 2, sb - sa + 4, sh + 4, g => paintStorey(g, sb - sa, sh, i)));
    c.restore();
    last = h;
  });
  const R = ramp6(hour(LACQUER));
  last = base;
  for (const [a, b, h] of roofs) { for (const px0 of [X(a) + 29, X(b) - 29]) column(c, px0, Y(h) + 34, Y(last), R); last = h; }
  roofs.forEach(([a, b, h], i) => still(c, `cn-pg-rf-${i}-${b - a}`, X(a), Y(h), -48, -4, b - a + 96, 52, g => glazedRoof(g, b - a, 34, 40, ramp6(hour(GLAZE)), false)));
  for (const [a, b, h] of roofs) ledge3(c, v, X(a), Y(h), b - a, GLAZE, 8);
  const [fx, fh] = finial, x = X(fx), y = Y(fh), Gd = ramp6(hour(GOLD));
  post(c, x, y - 40, y, 4, Gd);
  for (let k = 0; k < 4; k++) { box(c, x - 6 + k, y - 12 - k * 7, 13 - k * 2, 3, INK); box(c, x - 5 + k, y - 11 - k * 7, 11 - k * 2, 2, Gd[4]); }
  ball(c, x, y - 46, 6, hour('#FCD34D'));
};

// ---------------------------------------------------------------------------------------------------------------
// The lantern market

export interface CnFront { rx: number; w: number; h: number; name: string; sub: string }
const paintShop = (g: Ctx, f: CnFront) => {
  const { w, h } = f, R = ramp6(dimmed(LACQUER)), Gd = ramp6(dimmed(GOLD)), T = ramp6(dimmed(TEAL)), S = ramp6(dimmed(STONE)), Wd = ramp6(dimmed('#7C2D12'));
  box(g, -2, -h - 2, w + 4, h + 2, INK); slab(g, 0, -h, w, h, R);
  // (the columns at its ends and between, darker lacquer, gold bands)
  for (let x = 0; x <= w - 12; x += Math.max(60, (w - 12) / 3)) { box(g, x, -h, 12, h, R[2]); box(g, x, -h, 3, h, R[3]); box(g, x + 10, -h, 2, h, R[1]); for (const y of [-h + 16, -16]) { box(g, x - 1, y, 14, 3, Gd[3]); box(g, x - 1, y, 14, 1, Gd[5]); } }
  // (the stone plinth along the foot)
  box(g, 0, -12, w, 12, INK); stoneBlocks(g, 0, -11, w, 11, S, f.rx, 24, 11);
  // (the moon door: a round doorway in a stone ring, dark inside (lit warm after dark), a step)
  const cx = w / 2, cy = -36, r = 34, on = lampsOn();
  g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, r + 5, 0, Math.PI * 2); g.fill();
  g.fillStyle = S[3]; g.beginPath(); g.arc(cx, cy, r + 4, 0, Math.PI * 2); g.fill();
  g.fillStyle = S[4]; g.beginPath(); g.arc(cx - 1, cy - 1, r + 4, Math.PI, Math.PI * 1.5); g.lineTo(cx, cy); g.fill();
  g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = on ? '#B07024' : '#1C1014'; g.beginPath(); g.arc(cx, cy, r - 1, 0, Math.PI * 2); g.fill();
  if (on) { box(g, cx - 24, cy - 20, 48, 14, '#E8A646'); checker(g, cx - 24, cy - 6, 48, 2, '#E8A646', 0, 1); }
  box(g, cx - r, -4, r * 2, 4, S[2]); box(g, cx - r, -4, r * 2, 1, S[4]);
  // (the lattice windows: paper behind a fret)
  for (const wx of [20, w - 50]) {
    box(g, wx - 4, -h + 30, 38, 38, INK); box(g, wx - 3, -h + 31, 36, 36, Wd[3]); box(g, wx - 3, -h + 31, 36, 1, Wd[4]);
    box(g, wx, -h + 34, 30, 30, on ? '#F2C870' : dimmed('#E8DCC0'));
    for (let k = 5; k < 30; k += 6) { box(g, wx + k, -h + 34, 1, 30, Wd[2]); box(g, wx, -h + 34 + k, 30, 1, Wd[2]); }
    box(g, wx + 10, -h + 44, 10, 10, Wd[3]);
  }
  // (the painted beam under the eave)
  box(g, -4, -h - 2, w + 8, 10, INK); box(g, -3, -h - 1, w + 6, 8, T[3]); box(g, -3, -h - 1, w + 6, 1, T[5]);
  for (let x = 2; x < w; x += 18) { box(g, x, -h + 1, 10, 4, T[2]); box(g, x + 3, -h + 2, 4, 2, Gd[4]); }
  // (the hip roof: glazed tile up to its ridge, the ridge's beasts)
  g.save(); g.translate(0, -h - 2);
  const rw = w, rh = 38, G = ramp6(dimmed(GLAZE));
  const roof: [number, number][] = [[-26, 0], [-30, -12], [-16, -8], [w * 0.22, -rh], [w * 0.78, -rh], [w + 16, -8], [w + 30, -12], [w + 26, 0]];
  g.beginPath(); roof.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = G[2]; g.fill();
  g.save(); g.clip();
  box(g, -30, -rh, rw + 60, 12, G[3]); checker(g, -30, -rh + 12, rw + 60, 2, G[3], 0, 1); box(g, -30, -8, rw + 60, 8, G[1]);
  for (let x = -24; x < w + 24; x += 6) { box(g, x, -rh, 3, rh, G[3]); box(g, x, -rh, 1, rh, G[4]); box(g, x + 3, -rh, 1, rh, G[0]); }
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); roof.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke();
  box(g, w * 0.22 - 2, -rh - 4, w * 0.56 + 4, 5, INK); box(g, w * 0.22 - 1, -rh - 3, w * 0.56 + 2, 3, G[4]);
  for (const s of [w * 0.22, w * 0.78]) { poly(g, [[s - 4, -rh - 2], [s, -rh - 14], [s + 4, -rh - 10], [s + 3, -rh - 2]], INK); poly(g, [[s - 3, -rh - 3], [s, -rh - 12], [s + 3, -rh - 9], [s + 2, -rh - 3]], Gd[3]); }
  for (let x = -18; x < w + 18; x += 6) { box(g, x, -2, 4, 3, INK); box(g, x + 1, -2, 2, 2, G[4]); }
  g.restore();
  // (a lantern each side of the door; the painted board under the eave; its line under that)
  for (const lx of [cx - r - 16, cx + r + 16]) { box(g, lx, -96, 1, 10, INK); lantern(g, lx, -78, 8); }
  board(g, w / 2, -h + 26, [f.name], LOOKS.china(1), dimmed('#7F1D1D'), ramp6(dimmed(GOLD)), 4);
  board(g, w / 2, -h + 46, [f.sub], { sx: 1, sy: 1, fill: dimmed('#FDE68A') }, dimmed('#450A0A'), ramp6(dimmed(GOLD)), 3);
};
export const drawShop = (c: Ctx, v: View, x: number, f: CnFront) => facade(c, v, `cn-shop-${f.rx}`, x, f.w, f.h, g => paintShop(g, f), undefined, 64, 40);

/** The paifang (set back a touch, dimmed: its roof's nowhere to stand): drum stones, lacquer posts in gold bands, the
 *  painted lintel, a glazed roof with its ridge beasts, two stone lions. Local x 0 at its roof's left (world X(40)). */
const paintPaifang = (g: Ctx) => {
  const R = ramp6(dimmed(LACQUER)), Gd = ramp6(dimmed(GOLD)), T = ramp6(dimmed(TEAL)), S = ramp6(dimmed('#B8B2A6'));
  for (const px0 of [30, 270]) {
    // (the drum stones either side of its foot)
    for (const s of [-1, 1]) { const dx = px0 + 7 + s * 14; g.fillStyle = INK; g.beginPath(); g.arc(dx, -14, 14, 0, Math.PI * 2); g.fill(); g.fillStyle = S[3]; g.beginPath(); g.arc(dx, -14, 13, 0, Math.PI * 2); g.fill(); g.fillStyle = S[4]; g.beginPath(); g.arc(dx - 3, -17, 7, 0, Math.PI * 2); g.fill(); box(g, dx - 14, -4, 28, 4, S[1]); }
    box(g, px0 - 2, -240, 18, 240, INK); box(g, px0 - 1, -240, 16, 240, R[3]); box(g, px0 - 1, -240, 4, 240, R[4]); box(g, px0 + 11, -240, 4, 240, R[1]);
    for (const y of [-232, -60, -16]) { box(g, px0 - 2, y, 18, 4, INK); box(g, px0 - 1, y, 16, 3, Gd[3]); box(g, px0 - 1, y, 16, 1, Gd[5]); }
  }
  // (the lintel: blue-green with gold lines and a medallion in its middle)
  box(g, -8, -242, 330, 16, INK); box(g, -7, -241, 328, 14, T[3]); box(g, -7, -241, 328, 1, T[5]); box(g, -7, -229, 328, 2, T[1]);
  for (let x = 0; x < 314; x += 22) { box(g, x, -238, 14, 8, T[2]); box(g, x + 4, -235, 6, 2, Gd[4]); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(157, -234, 18, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = Gd[3]; g.beginPath(); g.ellipse(157, -234, 17, 6, 0, 0, Math.PI * 2); g.fill(); box(g, 147, -236, 20, 2, Gd[5]);
  g.save(); g.translate(0, -290); glazedRoof(g, 314, 50, 20, ramp6(dimmed(GLAZE)), true); g.restore();
  // (two stone lions on plinths: a mane in curls, a paw on a ball)
  for (const [lx, s] of [[-14, 1], [326, -1]] as const) {
    box(g, lx - 16, -14, 32, 14, INK); stoneBlocks(g, lx - 15, -13, 30, 13, S, lx, 15, 7);
    const y = -14;
    poly(g, [[lx - 10, y], [lx - 10, y - 18], [lx - 4, y - 30], [lx + 8, y - 30], [lx + 12, y - 20], [lx + 10, y]], INK);
    poly(g, [[lx - 9, y], [lx - 9, y - 18], [lx - 3, y - 29], [lx + 7, y - 29], [lx + 11, y - 20], [lx + 9, y]], S[3]);
    for (let k = 0; k < 5; k++) ball(g, lx - 6 + (k % 3) * 5, y - 26 + Math.floor(k / 3) * 5, 2.4, S[2], false);
    box(g, lx + s * 4 - 1, y - 24, 2, 2, INK);
    ball(g, lx + s * 6, y - 6, 4, S[4]);
  }
};
export const drawPaifang = (c: Ctx, v: View, x: number) => facade(c, v, 'cn-paifang', x, 314, 240, paintPaifang, 0.96, 60, 50, false);

/** The stalls (standable plank counters): their tops going back, the goods stood along the backs of them, the fronts
 *  (each lit lip), a red cloth hung under each lip with its gold fringe. */
const paintGoods = (g: Ctx, w: number, kind: number) => {
  for (let x = 6, k = 0; x < w - 14; k++) {
    const t = hash(kind * 13 + k * 2.7), sel = (k + kind) % 4;
    if (sel === 0) { lantern(g, x + 8, -14, 7, t > 0.5 ? '#DC2626' : '#F59E0B'); x += 20; }
    else if (sel === 1) {
      // (a paper fan, open)
      poly(g, [[x, -2], [x + 10, -22], [x + 22, -18], [x + 12, -2]], INK); poly(g, [[x + 1, -3], [x + 10, -21], [x + 21, -17], [x + 12, -3]], hour(t > 0.5 ? '#FDE68A' : '#FBCFE8'));
      for (let j = 0; j < 4; j++) box(g, x + 4 + j * 4, -14 + j, 1, 10 - j * 2, hour('#B91C1C')); x += 26;
    } else if (sel === 2) {
      // (a panda plush: white, black ears and eyes and arms)
      const W = '#F5F5F4', K = '#27272A';
      ball(g, x + 10, -9, 8, hour(W)); ball(g, x + 10, -20, 6, hour(W));
      for (const s of [-1, 1]) { ball(g, x + 10 + s * 5, -25, 2.4, K, false); box(g, x + 10 + s * 3 - 1, -21, 3, 3, K); }
      box(g, x + 1, -12, 4, 6, K); box(g, x + 15, -12, 4, 6, K); x += 24;
    } else {
      // (a basket of fortune cookies)
      box(g, x - 1, -11, 24, 12, INK); planks(g, x, -10, 22, 10, ramp6(hour('#A16207')), true, x, 4);
      for (let j = 0; j < 4; j++) { const cx = x + 3 + j * 5; poly(g, [[cx, -11], [cx + 3, -16], [cx + 6, -11], [cx + 3, -12]], hour('#F59E0B')); box(g, cx + 2, -14, 1, 1, hour('#FDE68A')); }
      x += 28;
    }
  }
};
export const drawStalls = (c: Ctx, v: View, list: Box3[]) => {
  const vis = list.filter(b => onScreen(v, b.x, b.x + b.w));
  for (const b of vis) box3Back(c, v, b);
  for (const b of vis) atDepth(c, v.eye, 0.965, () => still(c, `cn-goods-${Math.round(b.x)}-${b.w}`, b.x, b.top, -2, -32, b.w + 4, 34, g => paintGoods(g, b.w, Math.round(b.x) % 7)));
  for (const b of vis) {
    box3Front(c, b);
    const Rd = ramp6(hour('#B91C1C')), Gd = ramp6(hour(GOLD));
    box(c, b.x + 4, b.top + 5, b.w - 8, 16, INK); box(c, b.x + 5, b.top + 5, b.w - 10, 14, Rd[3]); box(c, b.x + 5, b.top + 5, b.w - 10, 2, Rd[4]); box(c, b.x + b.w - 12, b.top + 5, 7, 14, Rd[2]);
    for (let x = b.x + 6; x < b.x + b.w - 6; x += 3) box(c, x, b.top + 19, 2, 3 + ((x >> 1) & 1), Gd[3]);
    for (let x = b.x + 18; x < b.x + b.w - 12; x += 30) box(c, x, b.top + 9, 6, 6, Gd[2]);
  }
};

/** A lantern post: a lacquer pole on a stone footing, its gold cap, the lantern on top (index.ts's lamps sit on it). */
export const lanternPost = (c: Ctx, x: number, foot: number) => {
  const R = ramp6(hour(LACQUER)), S = ramp6(hour(STONE)), Gd = ramp6(hour(GOLD));
  post(c, x, foot - 64, foot, 4, R);
  box(c, x - 5, foot - 5, 11, 5, INK); box(c, x - 4, foot - 4, 9, 4, S[3]); box(c, x - 4, foot - 4, 9, 1, S[5]);
  box(c, x - 4, foot - 66, 9, 4, INK); box(c, x - 3, foot - 65, 7, 2, Gd[4]);
  lantern(c, x, foot - 74, 8);
};

/** China's flag's stars over the flagPole's waving red (riding its wave): the big one and its four. */
export const flagStars = (c: Ctx, x: number, feetY: number, h: number, f: number) => {
  const top = feetY - h + 2, Y = '#FDE047';
  const at2 = (i: number) => Math.round(Math.sin(f * 0.08 + i * 0.12) * 2 * (i / 48 + 0.3));
  const star = (i: number, y: number, r: number) => {
    const wv = at2(i), cx = x + 2 + i, cy = top + y + wv;
    const pts: [number, number][] = [];
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? r * 0.42 : r; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    poly(c, pts, hour(Y));
  };
  star(9, 9, 5);
  for (const [i, y] of [[17, 3], [20, 7], [20, 12], [17, 16]] as const) star(i, y, 1.8);
};

// ---------------------------------------------------------------------------------------------------------------
// The far end: the battery, the shells, the marks, the scaffold, the wall's raw end

/** The battery's mortars on its rack (at x, the rack's top `top`): five cardboard tubes banded red and gold, labels,
 *  dark mouths, their fuses (one lit and sparking while a volley's coming). */
export const batteryTubes = (c: Ctx, x: number, top: number, sparking: boolean, f: number) => {
  for (let k = 0; k < 5; k++) {
    const tx = x + 6 + k * 19, R = ramp6(hour(k % 2 ? '#DC2626' : '#FCD34D')), W = ramp6(hour('#F5F5F4'));
    box(c, tx - 1, top - 35, 15, 35, INK); box(c, tx, top - 34, 13, 34, R[3]); box(c, tx, top - 34, 3, 34, R[4]); box(c, tx + 10, top - 34, 3, 34, R[1]);
    for (const y of [top - 30, top - 8]) { box(c, tx, y, 13, 3, R[2]); box(c, tx, y, 13, 1, R[5]); }
    box(c, tx + 1, top - 22, 11, 9, W[3]); box(c, tx + 1, top - 22, 11, 1, W[5]); box(c, tx + 3, top - 19, 7, 1, R[1]); box(c, tx + 3, top - 16, 5, 1, R[1]);
    box(c, tx + 1, top - 35, 11, 3, '#1C1014'); box(c, tx + 2, top - 34, 9, 1, '#000000');
    box(c, tx + 11, top - 39, 1, 5, hour('#15803D')); box(c, tx + 12, top - 41, 1, 3, hour('#15803D'));
  }
  // (the long fuse along the rack's front to its left end)
  box(c, x - 6, top - 3, 12, 1, hour('#15803D'));
  if (sparking && (f >> 1) % 2) {
    const sx = x - 6, sy = top - 4;
    box(c, sx - 1, sy - 1, 3, 3, '#FFFFFF'); box(c, sx - 3, sy, 7, 1, '#FDE047'); box(c, sx, sy - 3, 1, 7, '#FDE047');
    for (let k = 0; k < 3; k++) box(c, sx + Math.round(Math.sin(f * 0.9 + k * 2) * 5), sy - 2 - k * 2, 1, 1, '#FB923C');
  }
};
/** Smoke out of the tubes after a volley: stepped puffs rising. */
export const batterySmoke = (c: Ctx, x: number, y: number, r: number) => {
  pixelBlob(c, x, y, r + 1, r * 0.75 + 1, dimmed('#A8A29E')); pixelBlob(c, x - r * 0.2, y - r * 0.2, r * 0.75, r * 0.5, dimmed('#E7E5E4'));
};
/** Where a shell's coming down: a painted X on the stone and a pulsing ring round it, blinking. */
export const shellMark = (c: Ctx, mx: number, my: number, R: number, f: number) => {
  const on = (f >> 3) % 2, col = on ? '#DC2626' : '#FCA5A5', k = 0.5 + 0.5 * Math.sin(f * 0.4);
  c.globalAlpha = 0.25 + 0.2 * k;
  for (let dy = -3; dy <= 3; dy++) { const hw = Math.round(R * Math.sqrt(1 - (dy / 4) ** 2)); box(c, mx - hw, my - 4 + dy * 1.5, hw * 2, 2, '#DC2626'); }
  c.globalAlpha = 1;
  for (const s of [-1, 1]) for (let i = -4; i <= 4; i++) { const x = mx + i * 4, y = my - 7 + s * i * 2 * -1; box(c, x - 2, y - 2, 5, 5, INK); box(c, x - 1, y - 1, 3, 3, col); }
};
/** A shell in flight: a stepped ball, its fuse sparking behind it. */
export const shell = (c: Ctx, x: number, y: number, f: number) => {
  ball(c, x, y, 6, hour('#DC2626'));
  box(c, x - 1, y - 10, 2, 4, INK); box(c, x, y - 9, 1, 3, '#FDE047');
  if (f % 2) { box(c, x - 1, y - 13, 3, 3, '#FFFFFF'); box(c, x + 2, y - 12, 1, 1, '#FB923C'); }
};
/** The repair scaffold: galvanized poles (couplers every lift), braces, the planks (what he stands on), toe boards. */
export const drawScaffoldArt = (c: Ctx, v: View, X: XY, Y: XY, decks: [number, number, number][], poles: number[], top: number, brace: [number, number, number, number]) => {
  const P = ramp6(hour('#9CA3AF'));
  for (const sx of poles) {
    post(c, X(sx) + 1, Y(top), GY, 4, P);
    for (let h = 140; h < top; h += 140) { box(c, X(sx) - 3, Y(h) - 3, 9, 7, INK); box(c, X(sx) - 2, Y(h) - 2, 7, 5, P[2]); box(c, X(sx) - 2, Y(h) - 2, 7, 1, P[5]); }
    box(c, X(sx) - 6, GY - 4, 15, 4, INK); box(c, X(sx) - 5, GY - 4, 13, 3, P[2]);
  }
  const [l0, l1, r0, r1] = brace;
  for (let h = 70; h < top - 140; h += 140) for (const [xa, ya, xb, yb] of [[l0, h, l1, h + 140], [r0, h + 140, r1, h]] as const) {
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(X(xa), Y(ya)); c.lineTo(X(xb), Y(yb)); c.stroke();
    c.strokeStyle = P[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(X(xa), Y(ya)); c.lineTo(X(xb), Y(yb)); c.stroke();
    c.strokeStyle = P[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(X(xa), Y(ya) - 1); c.lineTo(X(xb), Y(yb) - 1); c.stroke();
  }
  for (const [a, b, h] of decks) {
    ledge3(c, v, X(a), Y(h), b - a, '#A16207', 8, 'plank');
    const Tb = ramp6(dimmed('#A16207')), [ta, ty] = at(v.eye, X(a), Y(h), 0.95), [tb] = at(v.eye, X(b), Y(h), 0.95);
    if (v.eye.y < Y(h)) { box(c, ta, ty - 6, tb - ta, 6, Tb[2]); box(c, ta, ty - 6, tb - ta, 1, Tb[4]); }
  }
};
/** The wall's raw end (x .. x + w, from `top` to the ground): the cut through the facsimile: the wall's stone skin and
 *  rammed earth up top, then the mountain's foam on its 2x4 studs; a jagged edge, rubble at its foot. */
export const drawRawEnd = (c: Ctx, x: number, w: number, top: number) => {
  still(c, `cn-rawend-${w}-${top}`, x, top, -10, -6, w + 20, GY - top + 10, g => {
    const B = ramp6(hour(BRICK)), E = ramp6(hour('#8A6A44')), F = ramp6(hour('#D8CFA8')), P = ramp6(hour(PLYWOOD)), H = GY - top;
    // (the jagged edge: a ragged left side)
    const edge: [number, number][] = [];
    for (let y = 0; y <= H; y += 12) edge.push([Math.round(hash(y * 0.31 + x) * 10) - 4, y]);
    const shape: [number, number][] = [...edge, [w, H], [w, 0]];
    g.save(); g.beginPath(); shape.forEach(([px0, py], i) => (i ? g.lineTo(px0, py) : g.moveTo(px0, py))); g.closePath(); g.fillStyle = INK; g.fill(); g.clip();
    // (the wall's section: stone blocks round a rammed-earth core in layers)
    stoneBlocks(g, -6, 0, w + 6, 150, B, x, 14, 10);
    box(g, 4, 10, w - 12, 128, E[2]); for (let y = 12; y < 136; y += 8) { box(g, 4, y, w - 12, 1, E[1]); box(g, 4, y + 1, w - 12, 1, E[3]); }
    // (the mountain below it: foam, its fiberglass skin a green-gray, the studs inside)
    box(g, -6, 150, w + 6, H - 150, F[3]);
    for (let i = 0; i < (w * (H - 150)) / 60; i++) box(g, hash(i * 1.3 + x) * w, 150 + hash(i * 2.9) * (H - 150), 2, 1, F[2]);
    box(g, -6, 150, 6, H - 150, hour('#5B6B3E'));
    for (const sx of [10, w - 10]) { box(g, sx - 3, 150, 6, H - 150, P[3]); box(g, sx - 3, 150, 1, H - 150, P[5]); box(g, sx + 2, 150, 1, H - 150, P[1]); }
    g.restore();
    // (rubble at its foot)
    for (let k = 0; k < 7; k++) { const rx = -8 + hash(k * 3.1) * (w + 16), rr = 3 + hash(k * 1.7) * 4; ball(g, rx, H - rr + 1, rr, k % 2 ? B[3] : F[2]); }
  });
};

void hole;
