// A fault in the street, drawn: paved over; then the quake gets into it (the
// pavement heaves up into a ridge, a crack runs across it and out into the road
// either side, dust puffs out); then it splits: the two sides tear apart, the
// pavement that was over it breaks up and tumbles in, the broken slabs at the
// edges hang down into it, and what's left is a ragged fissure narrowing away
// into the dark, with the ground's layers in its walls, roots, a snapped water
// main spraying and a severed cable spitting sparks.

import type { GameState } from '../../core/state';
import type { GroundRun } from '../../core/terrain';
import { CANVAS_HEIGHT } from '../../../constants';
import type { Fault } from './course';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const easeOut = (k: number) => 1 - (1 - k) * (1 - k);

/** How long it takes to tear open, and how deep the fissure's drawn. */
const OPEN_FRAMES = 18, DEPTH = 380;
const SIDEWALK = '#B8B4AE', SIDEWALK_TOP = '#D6D3D1', CURB = '#6B6B6B', ASPHALT = '#3B3A3E', DIRT = '#4A3A2E';

/**
 * k: 0 paved, 0..1 cracking, 1 open. `since`: frames since it opened.
 * drawStreet draws a stretch of street (the same as the rest of the road).
 */
export const drawFault = (ctx: Ctx, state: GameState, f: Fault, i: number, k: number, since: number, drawStreet: (r: GroundRun) => void) => {
  const seed = i * 37 + 11;
  const r: GroundRun = { x1: f.x, y1: f.y, x2: f.x + f.w, y2: f.y };
  if (k < 1) { drawCracking(ctx, state, f, r, seed, k, drawStreet); return; }
  const spread = easeOut(Math.min(1, since / OPEN_FRAMES));
  // The ground either side of it, cut through (its layers show in the walls)
  drawStreet(r);
  drawFissure(ctx, state, f, seed, spread);
  drawOuterCracks(ctx, f, seed, 1);
  drawLips(ctx, f, seed, spread);
  if (since < 60) drawTumbling(ctx, f, seed, since);
};

// ---------------------------------------------------------------------------

/** The pavement heaving up into a ridge, a crack running across it and out beyond, down into the road's edge. */
const drawCracking = (ctx: Ctx, state: GameState, f: Fault, r: GroundRun, seed: number, k: number, drawStreet: (r: GroundRun) => void) => {
  const mid = f.x + f.w * (0.4 + hash(seed) * 0.2);
  const lift = k * 0.05;
  const shake = Math.sin(state.frame * 1.7 + seed) * k * 1.2;
  // (the ground under it, so nothing shows round the edges of the tipped halves)
  drawStreet(r);
  // Two halves, each tipped up toward the crack (a pressure ridge), shaking
  for (const side of [0, 1]) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(side ? mid : f.x - 1, f.y - 40, side ? f.x + f.w + 1 - mid : mid - f.x + 1, CANVAS_HEIGHT + 400);
    ctx.clip();
    const px = side ? f.x + f.w : f.x;
    ctx.translate(px + shake, f.y);
    ctx.rotate(side ? lift : -lift);
    ctx.translate(-px, -f.y);
    drawStreet(r);
    ctx.restore();
  }
  // The crack: a jagged line across the top, opening up a little, then on down through the curb and the road's edge
  const gap = 1 + k * 5;
  ctx.fillStyle = '#0C0907';
  ctx.beginPath();
  const top = f.y - Math.abs(Math.sin(lift) * (mid - f.x));
  ctx.moveTo(mid - gap, top);
  for (let d = 6; d <= 14 + k * 40; d += 6) ctx.lineTo(mid - gap * (1 - d / 70) + (hash(seed + d) - 0.5) * 8, f.y + d);
  for (let d = 14 + k * 40; d >= 6; d -= 6) ctx.lineTo(mid + gap * (1 - d / 70) + (hash(seed + d) - 0.5) * 8 + 1, f.y + d);
  ctx.lineTo(mid + gap, top);
  ctx.closePath(); ctx.fill();
  drawOuterCracks(ctx, f, seed, k);
  // Grit jumping off the surface
  ctx.fillStyle = 'rgba(168, 162, 158, 0.8)';
  for (let n = 0; n < 5; n++) {
    const t = ((state.frame * 0.9 + n * 13 + seed) % 22) / 22;
    ctx.fillRect(mid + (hash(seed + n) - 0.5) * f.w * 0.8, top - 2 - Math.sin(t * Math.PI) * 10 * k, 2, 2);
  }
};

/** Cracks spidering out across the pavement either side, and down its edge (k: how far they've got). */
const drawOuterCracks = (ctx: Ctx, f: Fault, seed: number, k: number) => {
  ctx.strokeStyle = 'rgba(12, 9, 7, 0.85)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? f.x : f.x + f.w;
    for (let c = 0; c < 3; c++) {
      const len = (26 + hash(seed + c * 5 + side) * 50) * k;
      let x = x0, y = f.y + 1 + c * 5;
      ctx.moveTo(x, y);
      for (let s = 0; s < 6; s++) {
        x += side * len / 6;
        y += (hash(seed + c * 17 + s + side * 3) - 0.5) * 4 + (c === 2 ? 3 : 0);
        ctx.lineTo(x, Math.max(f.y + 1, y));
      }
    }
  }
  ctx.stroke();
};

/** Half-width of the fissure d below the surface (narrowing, ragged), and where its middle wanders to. */
const wall = (f: Fault, seed: number, spread: number, d: number, side: number) => {
  const half = f.w / 2;
  const narrow = 1 - 0.55 * Math.min(1, d / DEPTH);
  // (right at the top it stays on the edge you can stand on; below that it's rock, as ragged as it likes)
  const jag = (hash(seed + Math.round(d / 12) * 7 + side * 101) - 0.5) * (d < 10 ? 4 : 16);
  const wander = Math.sin(d * 0.018 + seed) * 10 * Math.min(1, d / 60);
  return f.x + half + wander + side * (half * narrow * spread - 2 + jag * spread);
};

const drawFissure = (ctx: Ctx, state: GameState, f: Fault, seed: number, spread: number) => {
  const left: [number, number][] = [], right: [number, number][] = [];
  for (let d = 0; d <= DEPTH; d += 12) {
    left.push([wall(f, seed, spread, d, -1), f.y + d]);
    right.push([wall(f, seed, spread, d, 1), f.y + d]);
  }
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (const [x, y] of left) ctx.lineTo(x, y);
    const bx = (left[left.length - 1][0] + right[right.length - 1][0]) / 2;
    ctx.lineTo(bx, f.y + DEPTH + 30);
    for (let n = right.length - 1; n >= 0; n--) ctx.lineTo(right[n][0], right[n][1]);
    ctx.closePath();
  };
  // The dark
  const g = ctx.createLinearGradient(0, f.y, 0, f.y + DEPTH);
  g.addColorStop(0, '#1E150F'); g.addColorStop(0.35, '#0D0906'); g.addColorStop(1, '#000000');
  ctx.fillStyle = g;
  path(); ctx.fill();
  ctx.save();
  path(); ctx.clip();
  // A glow way down there, breathing
  const glow = ctx.createRadialGradient(f.x + f.w / 2, f.y + DEPTH, 4, f.x + f.w / 2, f.y + DEPTH, f.w * 0.6);
  glow.addColorStop(0, `rgba(249, 115, 22, ${0.28 + 0.1 * Math.sin(state.frame * 0.05 + seed)})`); glow.addColorStop(1, 'rgba(249, 115, 22, 0)');
  ctx.fillStyle = glow; ctx.fillRect(f.x - 40, f.y + DEPTH - f.w, f.w + 80, f.w + 40);
  // The far wall of the crack, lit a little from above, fading into the dark
  const back = ctx.createLinearGradient(0, f.y, 0, f.y + 140);
  back.addColorStop(0, 'rgba(90, 67, 49, 0.55)'); back.addColorStop(1, 'rgba(90, 67, 49, 0)');
  ctx.fillStyle = back;
  ctx.beginPath(); ctx.moveTo(left[0][0] + 6, f.y);
  for (let d = 0; d < 140; d += 14) ctx.lineTo(f.x + f.w * (0.3 + hash(seed + d) * 0.15), f.y + d);
  for (let d = 140; d >= 0; d -= 14) ctx.lineTo(f.x + f.w * (0.62 + hash(seed + d + 3) * 0.15), f.y + d);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  // The walls: the road's layers cut through (sidewalk, curb, asphalt, then dirt and rock), a lit edge on the left, shadow on the right
  for (const [pts, side] of [[left, -1], [right, 1]] as [[number, number][], number][]) {
    ctx.save();
    // A band of the wall's face just inside the edge
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (const [x, y] of pts) ctx.lineTo(x, y);
    for (let n = pts.length - 1; n >= 0; n--) ctx.lineTo(pts[n][0] - side * (8 + hash(seed + n * 3 + side) * 6) * (1 - n / pts.length), pts[n][1]);
    ctx.closePath();
    ctx.clip();
    const layers: [number, number, string][] = [[0, 10, SIDEWALK], [10, 14, CURB], [14, 46, ASPHALT], [46, 120, DIRT], [120, 240, '#3A2C22'], [240, DEPTH + 40, '#241A13']];
    for (const [a, b, c] of layers) { ctx.fillStyle = c; ctx.fillRect(f.x - 30, f.y + a, f.w + 60, b - a); }
    ctx.fillStyle = side < 0 ? 'rgba(255, 237, 213, 0.12)' : 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(f.x - 30, f.y, f.w + 60, DEPTH);
    // Stones in the dirt
    ctx.fillStyle = '#6B5A4C';
    for (let n = 0; n < 8; n++) { const d = 50 + hash(seed + n * 9 + side) * 220; ctx.beginPath(); ctx.ellipse(wall(f, seed, 1, d, side) - side * 5, f.y + d, 3 + hash(n + seed) * 3, 2 + hash(n) * 2, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    // The broken edge of the wall
    ctx.strokeStyle = side < 0 ? 'rgba(120, 94, 72, 0.9)' : 'rgba(20, 14, 10, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const [x, y] of pts) ctx.lineTo(x, y); ctx.stroke();
  }
  if (spread < 0.6) return;
  // Roots hanging out of the dirt
  ctx.strokeStyle = '#6B4A2E'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let n = 0; n < 3; n++) {
    const d = 55 + n * 22, x = wall(f, seed, spread, d, -1);
    ctx.moveTo(x, f.y + d); ctx.quadraticCurveTo(x + 8, f.y + d + 6, x + 5 + hash(seed + n) * 6, f.y + d + 18 + hash(n) * 10);
  }
  ctx.stroke();
  // A snapped water main in the left wall, spraying out into the crack
  const py = f.y + 64, px = wall(f, seed, spread, 64, -1);
  ctx.fillStyle = '#57534E'; ctx.fillRect(px - 10, py - 5, 18, 10);
  ctx.fillStyle = '#292524'; ctx.beginPath(); ctx.ellipse(px + 8, py, 2.5, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(191, 219, 254, 0.8)';
  for (let n = 0; n < 10; n++) {
    const t = ((state.frame * 0.05 + n * 0.1) % 1);
    ctx.fillRect(px + 10 + t * 26, py + t * t * 60 - Math.sin(t * 3) * 4, 3, 3);
  }
  // A severed cable in the right wall, twitching and spitting sparks now and then
  const cy = f.y + 36, cx = wall(f, seed, spread, 36, 1);
  const tw = Math.sin(state.frame * 0.4 + seed) * 3;
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx + 4, cy); ctx.quadraticCurveTo(cx - 12, cy + 8, cx - 16 + tw, cy + 26); ctx.stroke();
  if ((state.frame + seed * 7) % 70 < 8) {
    ctx.fillStyle = '#FDE047';
    for (let n = 0; n < 6; n++) ctx.fillRect(cx - 16 + tw + (hash(state.frame + n) - 0.5) * 16, cy + 26 + (hash(state.frame + n + 9) - 0.5) * 14, 2, 2);
  }
};

/** The broken slabs at each edge, hinged down into the hole (the pavement's edge goes with them). */
const drawLips = (ctx: Ctx, f: Fault, seed: number, spread: number) => {
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? f.x : f.x + f.w;
    const len = Math.min(34, f.w * 0.22) * (0.8 + hash(seed + side) * 0.4);
    const ang = (0.3 + hash(seed + side * 5) * 0.35) * spread;
    ctx.save();
    ctx.translate(x0, f.y);
    ctx.rotate(side < 0 ? ang : -ang);
    ctx.scale(-side, 1);
    // (drawn going left from the hinge, so -side flips it to hang into the hole): a slab of sidewalk and the
    // asphalt under it, snapped off ragged at the end, the layers showing in the break
    const end = (d: number) => -len + (hash(seed + side * 13 + d) - 0.5) * 8;
    const slab = (d1: number, d2: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(0, d1); ctx.lineTo(end(d1), d1); ctx.lineTo(end(d2), d2); ctx.lineTo(0, d2); ctx.closePath(); ctx.fill();
    };
    slab(0, 9, SIDEWALK); slab(9, 12, CURB); slab(12, 22, ASPHALT); slab(0, 2, SIDEWALK_TOP);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; ctx.fillRect(-len * 0.5, 0, 1, 9);
    ctx.restore();
    // A little rubble lodged at the hinge
    ctx.fillStyle = '#57534E';
    ctx.beginPath(); ctx.arc(x0 - side * 4, f.y + 20, 4, 0, Math.PI * 2); ctx.arc(x0 - side * 10, f.y + 26, 3, 0, Math.PI * 2); ctx.fill();
  }
};

/** The pavement that was over it, broken into slabs, tumbling in. */
const drawTumbling = (ctx: Ctx, f: Fault, seed: number, since: number) => {
  const n = 4;
  for (let c = 0; c < n; c++) {
    const w = f.w / n - 4;
    const x = f.x + 4 + c * (f.w / n) + w / 2;
    const delay = hash(seed + c) * 6;
    const t = Math.max(0, since - delay);
    const y = f.y + 0.45 * t * t;
    if (y > f.y + DEPTH) continue;
    ctx.save();
    ctx.translate(x + (c - (n - 1) / 2) * t * 0.3, y + 10);
    ctx.rotate((hash(seed + c * 3) - 0.5) * t * 0.12);
    ctx.globalAlpha = Math.max(0, 1 - y / (f.y + DEPTH) * 0.2 - (y - f.y) / DEPTH);
    ctx.fillStyle = ASPHALT; ctx.fillRect(-w / 2, 2, w, 14);
    ctx.fillStyle = SIDEWALK; ctx.fillRect(-w / 2, -8, w, 10);
    ctx.fillStyle = SIDEWALK_TOP; ctx.fillRect(-w / 2, -8, w, 2);
    ctx.restore();
  }
};
