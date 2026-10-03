// Drawing Dale's stage: the desert twilight (the backdrop), the landing (Dale's
// truck and his crew's crates), the desert (arroyos, rock shelves, cacti, the odd
// cow skull), the warehouse (corrugated steel, conveyor belts, pallet racks, the
// stairs), the office upstairs (drawn with Chuco's things in junkieDraw.ts), and
// the fades. The convoy's in convoyDraw.ts, the town in townDraw.ts.

import type { GameState } from '../../core/state';
import { bandedGradient, checker, hazeBands, steppedGlow, tilePattern } from '../../render/pixelArt';
import { INK, dark, lite, ink, shadedTop } from '../../render/npc/kit';
import { slab, column, pipe, letter, hazard } from '../../render/bosses/daleTruck';
import type { GroundRun } from '../../core/terrain';
import { runYAt } from '../../core/terrain';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, ARENA_LEFT } from '../../../constants';
import { STAGE_BACKDROPS } from '../../render/backdrops/stages';
import { blitLayer } from '../../render/backdrops/core';
import type { Live } from '../../render/backdrops';
import type { LayerSpec } from '../../render/backdrops/core';
import { drawBackdropFront } from '../../render/backdrops';
import { drawDeliveryTruck, DELIVERY_TRUCK } from '../../render/bosses/daleTruck';
import { drawDale } from '../../render/bosses/dale';
import type { Enemy } from '../../../types';
import { COURSE, Cactus, Ledge } from './course';
import { getDale, regionOf, fadeAmount, DaleRuntime } from './runtime';
import { CRATE, CRATE_WARN, beltBox, feedX } from './hazards';
import { daleVisible } from './intro';
import { saying, drawBubble } from './script';
import { drawOffice, drawOfficeFront, drawJunkieHud } from './junkieDraw';
import { drawHighwayBackdrop, drawConvoyBack, drawConvoyFront, drawConvoyHud } from './convoyDraw';
import { drawTownBack, drawTownMid, drawTownFront, drawTownHud } from './townDraw';

type Ctx = CanvasRenderingContext2D;
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;
const Y = GROUND_Y;

// ---------------------------------------------------------------------------
// Sky
// ---------------------------------------------------------------------------

const LAYERS = STAGE_BACKDROPS['Drug Trade Dale'].layers;
export const layer = (ctx: Ctx, camX: number, camY: number, frame: number, i: number) => {
  const l = LAYERS[i];
  if (typeof l === 'function') { ctx.save(); (l as Live)(ctx, { camX, camY, frame }); ctx.restore(); }
  else blitLayer(ctx, l as LayerSpec, camX, camY, frame);
};

export const drawDaleBackdrop = (ctx: Ctx, state: GameState): boolean => {
  const rt = getDale(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'highway') { drawHighwayBackdrop(ctx, state, rt); return true; }
  // Inside the warehouse (or up in the office): its walls are the backdrop
  if (region === 'desert' && state.camera.x > COURSE.warehouse.x1 + 40) { ctx.fillStyle = '#1C1917'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return true; }
  // Out in the desert (or the town): dusk over the Sandias, the mesas, the balloons
  ctx.save();
  ctx.translate(0, Math.max(-40, Math.min(40, -(state.camera.y - (Y - 550)) * 0.15)));
  for (let i = 0; i < LAYERS.length; i++) layer(ctx, state.camera.x, state.camera.y, state.frame, i);
  ctx.restore();
  return true;
};

// ---------------------------------------------------------------------------
// World: behind everything that moves
// ---------------------------------------------------------------------------

/**
 * A tumbleweed out on the far flats, behind everything: small (it's a way off), rolling along just over the lip
 * of the ground you're on at a distant pace, bouncing now and then.
 */
const drawTumbleweed = (ctx: Ctx, state: GameState) => {
  const f = state.frame, span = CANVAS_WIDTH + 200;
  const sx = ((f * 0.9 - state.camera.x * 0.36) % span + span) % span - 100;
  const wx = state.camera.x + sx;
  let ground: number | null = null;
  for (const r of state.groundRuns) if (wx >= r.x1 && wx <= r.x2) { const y = r.y1 + (wx - r.x1) / Math.max(1, r.x2 - r.x1) * (r.y2 - r.y1); if (ground === null || y < ground) ground = y; }
  if (ground === null) return;
  const y = ground - 12 - Math.abs(Math.sin(f * 0.07)) * 8;
  ctx.save();
  ctx.translate(wx, y); ctx.rotate(f * 0.06);
  // (a dark tangle under a sunlit one)
  for (const [c, w] of [['#4A3418', 2], ['#9A7442', 1]] as const) {
    ctx.strokeStyle = c; ctx.lineWidth = w;
    ctx.beginPath(); for (let i = 0; i < 5; i++) { ctx.moveTo(-6, (i - 2) * 2.5); ctx.lineTo(6, (2 - i) * 2.5); } ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
};

export const drawDaleBack = (ctx: Ctx, state: GameState) => {
  const rt = getDale(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'highway') { drawConvoyBack(ctx, state, rt); return; }
  if (region === 'town' || state.camera.x < COURSE.warehouse.x1 - 200) drawTumbleweed(ctx, state);
  if (region === 'town') { drawTownBack(ctx, state, rt); return; }
  drawArroyos(ctx, state);
  drawScenery(ctx, state);
  drawLanding(ctx, state, rt);
  if (visible(state, COURSE.warehouse.x1 - 300, COURSE.office.x2 + 100)) drawWarehouse(ctx, state, rt);
  for (const l of COURSE.ledges) if (visible(state, l.x, l.x + l.w) && regionOf(l.x) === 'desert') drawLedge(ctx, l);
  for (const r of state.groundRuns) if (visible(state, r.x1, r.x2) && (r.surface === 'concrete' || r.surface === 'stairs' || r.surface === 'office')) drawFloor(ctx, state, r);
  if (visible(state, COURSE.office.x1 - 100, COURSE.office.x2 + 100)) drawOffice(ctx, state, rt.junkie);
};

/** The arroyos: dry washes cut down through the red rock (the gaps in the ground). */
const drawArroyos = (ctx: Ctx, state: GameState) => {
  for (const gp of gulches(state)) drawGulch(ctx, state, gp.x1, gp.x2, gp.yl, gp.yr);
};

/**
 * Dale's EMPLOYEE OF THE MONTH plaque, hung from the rafters: a gold frame, an empty photo spot with a question mark
 * in it, the name plate (NOBODY, AGAIN), a couple of gold stars. Every line of it sized to fit.
 */
const drawEmployeeSign = (ctx: Ctx, x: number, y: number, f: number) => {
  const w = 300, h = 84;
  // The chains up to the rafters (links, lit on one side)
  for (const cx of [x + 30, x + w - 30]) for (let cy = y - 40; cy < y; cy += 6) { ctx.fillStyle = INK; ctx.fillRect(cx - 2, cy, 4, 5); ctx.fillStyle = (cy / 6) % 2 ? '#A1A1AA' : '#71717A'; ctx.fillRect(cx - 1, cy + 1, 2, 3); }
  // The frame and the board
  slab(ctx, x - 4, y - 4, w + 8, h + 8, '#92400E', 2);
  slab(ctx, x - 1, y - 1, w + 2, h + 2, '#EAB308', 2);
  bandedGradient(ctx, x + 3, y + 3, w - 6, h - 6, ['#6D28D9', '#5B21B6', '#4C1D95', '#3B0764'], 5);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  // The photo: nobody in it
  const px = x + 12, py = y + 12, pw = 50, ph = 60;
  slab(ctx, px - 3, py - 3, pw + 6, ph + 6, '#FACC15', 2);
  bandedGradient(ctx, px, py, pw, ph, ['#F3F4F6', '#E5E7EB', '#D1D5DB'], 3);
  ink(ctx, () => { ctx.arc(px + pw / 2, py + 22, 11, 0, Math.PI * 2); }, '#9CA3AF', 1);
  ink(ctx, () => ctx.roundRect(px + 9, py + 36, pw - 18, 24, [8, 8, 0, 0]), '#9CA3AF', 1);
  ctx.fillStyle = '#B8BEC6'; ctx.fillRect(px + 12, py + 39, 6, 20);
  ctx.fillStyle = '#6B7280'; ctx.font = 'bold 14px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('?', px + pw / 2, py + 29);
  // The words, each fitted to the space right of the photo
  const tx = px + pw + 12, tw = x + w - 12 - tx, mid = tx + tw / 2;
  const fit = (text: string, size: number, font: string) => { let s = size; do { ctx.font = `${font} ${s}px "Press Start 2P"`; s--; } while (ctx.measureText(text).width > tw && s > 4); };
  ctx.fillStyle = '#F9A8D4'; fit("DALE'S DRUGS", 7, 'bold'); ctx.fillText("DALE'S DRUGS", mid, y + 20);
  ctx.fillStyle = '#FDE047'; fit('EMPLOYEE', 14, 'bold'); ctx.fillText('EMPLOYEE', mid, y + 39);
  fit('OF THE MONTH', 10, 'bold'); ctx.fillText('OF THE MONTH', mid, y + 54);
  // The name plate
  slab(ctx, tx + 8, y + 60, tw - 16, 14, '#D6D3D1', 1);
  ctx.textAlign = 'center'; ctx.fillStyle = '#1C1917'; fit('NOBODY, AGAIN', 7, 'bold'); ctx.fillText('NOBODY, AGAIN', mid, y + 70);
  ctx.textAlign = 'left';
  // Gold stars either side of the title, twinkling
  for (const [sx, sy, k] of [[tx + 2, y + 34, 0], [x + w - 12, y + 34, 1]] as const) {
    const r = 5 + Math.sin(f * 0.1 + k * 2) * 1;
    ink(ctx, () => { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } ctx.closePath(); }, '#FDE047', 0.8);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(sx - 1, sy - 2, 1, 1);
  }
};

/** The gaps between the desert's ground on screen: where they are, and the ground's height either side. */
const gulches = (state: GameState) => {
  const runs = state.groundRuns;
  const out: { x1: number; x2: number; yl: number; yr: number }[] = [];
  for (let i = 0; i + 1 < runs.length; i++) {
    const a = runs[i], n = runs[i + 1];
    if (n.x1 <= a.x2 + 1 || regionOf(a.x2) !== 'desert' || a.surface || n.surface || !visible(state, a.x2, n.x1)) continue;
    out.push({ x1: a.x2, x2: n.x1, yl: a.y2, yr: n.y1 });
  }
  return out;
};

/**
 * Looking down into a crevasse: a crack in the rock, its two walls zigzagging down and in to a slot of black (never
 * out over the sky beside it). The near-left wall catches the light, faceted and split with fractures; the right one's
 * in shadow. A rock jammed in where it narrows, dead brush hanging off the lip, and it all goes black with depth.
 */
const drawGulch = (ctx: Ctx, state: GameState, x1: number, x2: number, yl: number, yr: number) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  const w = x2 - x1, top = Math.max(yl, yr), depth = Math.max(bottom, top + 60) - top;
  const seed = Math.round(x1);
  const mid = (x1 + x2) / 2;
  // Its walls, zigzagging down and in: a point every step down, pulled in (and jutting back out now and then)
  const wall = (from: number, dir: 1 | -1) => {
    const pts: [number, number][] = [[from, top]];
    let y = top;
    for (let k = 0; y < top + depth; k++) {
      y += 14 + hash(seed + k * 7 + (dir > 0 ? 0 : 90)) * 20;
      const narrow = Math.min(1, (y - top) / 300);
      const inset = w * (0.08 + narrow * 0.36);
      const jag = (hash(seed + k * 11 + (dir > 0 ? 3 : 93)) - 0.4) * Math.min(22, w * 0.12);
      pts.push([from + dir * Math.max(0, inset + jag), y]);
    }
    return pts;
  };
  const left = wall(x1, 1), right = wall(x2, -1);
  // The rock the crack's in, below the lip (layered, like the faces of the rims either side of it)
  for (let k = 0, y = top; y < top + depth; k++) {
    const h = 12 + hash(seed + k * 3 + 200) * 12;
    ctx.fillStyle = ['#B5602F', '#9A4A26', '#C0703A', '#83391E'][k % 4];
    ctx.fillRect(x1, y, w, h + 1);
    y += h;
  }
  const path = () => { ctx.beginPath(); left.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]); ctx.closePath(); };
  ctx.save();
  path(); ctx.clip();
  // The depths: dim rock at the top of it going to black
  ctx.fillStyle = '#050201'; ctx.fillRect(x1 - 10, top, w + 20, depth);
  bandedGradient(ctx, x1 - 10, top, w + 20, 320, ['#6B3219', '#4A2010', '#2E1208', '#180A04', '#050201'], 10);
  // The two walls, faceted: each zig of the edge is a slab of rock, shaded a bit differently from the next
  const faces = (pts: [number, number][], dir: 1 | -1, shades: string[]) => {
    for (let k = 0; k + 1 < pts.length; k++) {
      const [ax, ay] = pts[k], [bx, by] = pts[k + 1];
      const thick = Math.max(6, w * 0.1 * (1 - Math.min(0.7, (ay - top) / 400)));
      ctx.fillStyle = shades[Math.floor(hash(seed + k * 17 + dir) * shades.length)];
      ctx.beginPath(); ctx.moveTo(ax - dir * 40, ay); ctx.lineTo(ax + dir * thick, ay); ctx.lineTo(bx + dir * thick * 0.7, by); ctx.lineTo(bx - dir * 40, by); ctx.closePath(); ctx.fill();
      // (a fracture down it now and then, and the lit edge of the slab)
      if (hash(seed + k * 23 + dir) < 0.45) { ctx.strokeStyle = 'rgba(20, 6, 2, 0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ax + dir * thick * 0.4, ay); ctx.lineTo(ax + dir * thick * 0.2 + (bx - ax) * 0.5, (ay + by) / 2); ctx.lineTo(bx + dir * thick * 0.3, by); ctx.stroke(); }
      ctx.fillStyle = dir > 0 ? 'rgba(255, 196, 140, 0.35)' : 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(Math.min(ax, ax + dir * thick), ay, Math.abs(thick), 2);
    }
  };
  faces(left, 1, ['#B4673A', '#A05A31', '#C0764A', '#94502B']);
  faces(right, -1, ['#57260F', '#4A1F0C', '#663019', '#3E1A0A']);
  // A rock jammed across where it narrows, and a smaller one under it
  if (w > 90) {
    const cy = top + 150 + hash(seed + 3) * 50;
    ctx.fillStyle = '#5A2E18'; ctx.beginPath(); ctx.ellipse(mid + (hash(seed + 2) - 0.5) * 20, cy, Math.min(34, w * 0.2), 13, 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8A4C2C'; ctx.beginPath(); ctx.ellipse(mid - 8, cy - 5, 12, 5, 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3F1D0E'; ctx.beginPath(); ctx.ellipse(mid + 10, cy + 40, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
  }
  // Going black with depth, over the lot
  hazeBands(ctx, x1 - 10, top + 40, w + 20, 260, '#050201', 0, 0.95, 8);
  ctx.fillStyle = 'rgba(5, 2, 1, 0.95)'; ctx.fillRect(x1 - 10, top + 300, w + 20, Math.max(0, depth - 300));
  // A little dust hanging in it
  ctx.fillStyle = 'rgba(214, 167, 122, 0.07)'; ctx.fillRect(x1, top + 60, w, 50);
  ctx.restore();
  // Dead brush hanging off the lips
  ctx.strokeStyle = '#6B5A3A'; ctx.lineWidth = 1.5;
  for (const [x, y, d] of [[x1 + 4, yl + 6, 1], [x2 - 4, yr + 10, -1]] as const) {
    ctx.beginPath(); for (let k = 0; k < 4; k++) { ctx.moveTo(x, y); ctx.lineTo(x + d * (6 + k * 3), y + 6 + k * 5); } ctx.stroke();
  }
  // The edges of the crack
  ctx.strokeStyle = 'rgba(30, 10, 3, 0.85)'; ctx.lineWidth = 2.5;
  for (const pts of [left, right]) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
};

/**
 * The rims either side of a gulch, over the ground's own cliff face: a jagged lip of rock with its layers showing
 * down the face, a few loose stones on the edge (so the drop reads as a drop, not a step).
 */
const drawGulchRims = (ctx: Ctx, state: GameState) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  for (const gp of gulches(state)) {
    for (const [edge, lip, dir] of [[gp.x1, gp.yl, -1], [gp.x2, gp.yr, 1]] as const) {
      // dir: which way the ground goes from the edge (-1: the ground's to the left of the gap)
      const seed = Math.round(edge);
      const face = 26;
      const x0 = dir < 0 ? edge - face : edge;
      for (let y = lip + 4, k = 0; y < bottom; k++) {
        const h = 12 + hash(seed + k) * 12;
        ctx.fillStyle = ['#C0703A', '#9A4A26', '#B5602F', '#83391E'][k % 4];
        ctx.fillRect(x0, y, face, h + 1);
        y += h;
      }
      // The jagged edge of it, into the gap
      ctx.fillStyle = dir < 0 ? '#A9582C' : '#6E2F18';
      ctx.beginPath(); ctx.moveTo(edge, lip);
      for (let y = lip; y < Math.min(bottom, lip + 400); y += 14) ctx.lineTo(edge - dir * (3 + hash(seed + y) * 7), y + 7);
      ctx.lineTo(edge, Math.min(bottom, lip + 400)); ctx.closePath(); ctx.fill();
      // (each stratum's lit top edge down the face)
      for (let y = lip + 4, k = 0; y < bottom; k++) { ctx.fillStyle = 'rgba(255, 210, 160, 0.25)'; ctx.fillRect(x0, Math.floor(y), face, 1); y += 12 + hash(seed + k) * 12; }
      // An overhanging lip and a couple of loose stones on it
      ink(ctx, () => { ctx.moveTo(edge + dir * 30, lip); ctx.lineTo(edge - dir * 6, lip); ctx.lineTo(edge - dir * 2, lip + 8); ctx.lineTo(edge + dir * 30, lip + 6); }, '#D48A4C', 1);
      ctx.fillStyle = '#E8A86A'; ctx.fillRect(Math.min(edge + dir * 26, edge - dir * 4), lip + 1, 28, 1);
      for (const [sx, r] of [[12, 3], [20, 2]]) { ink(ctx, () => ctx.arc(edge + dir * sx, lip - r + 1, r, 0, Math.PI * 2), '#8A5A3A', 0.8); ctx.fillStyle = '#B07A52'; ctx.fillRect(edge + dir * sx - 1, lip - r * 2 + 2, 1, 1); }
    }
  }
};
/** Bits of desert: rocks, yucca, a cow skull, fence posts along the dirt road at the landing. */
const drawScenery = (ctx: Ctx, state: GameState) => {
  const x0 = Math.floor((state.camera.x - 100) / 90), x1 = Math.ceil((state.camera.x + CANVAS_WIDTH + 100) / 90);
  for (let k = x0; k <= x1; k++) {
    const x = k * 90 + hash(k) * 50;
    if (regionOf(x) !== 'desert' || x > COURSE.warehouse.x1 - 60 || x < COURSE.desert.x1) continue;
    const run = state.groundRuns.find(r => x >= r.x1 && x <= r.x2 && !r.surface);
    if (!run) continue;
    const y = runYAt(run, x);
    const h = hash(k + 7);
    if (h < 0.3) {
      // A boulder: lit on top, the dark under it, a crack across it
      const rw = 10 + h * 20, rh = 6 + h * 6;
      shadedTop(ctx, () => ctx.ellipse(x, y - 4, rw, rh, 0, Math.PI, 0), '#8A5A3A', x - rw, y - 4 - rh, rw * 2, rh);
      ctx.fillStyle = '#B98A62'; ctx.fillRect(x - 6, y - 4 - rh + 2, 8, 2);
      ctx.fillStyle = '#5A3520'; ctx.fillRect(x + rw * 0.2, y - 4 - rh * 0.6, 1, rh * 0.5);
    } else if (h < 0.5) {
      // A yucca: blades fanning out, a dark one behind each lit one, inked tips
      for (let i = -3; i <= 3; i++) { const tx = x + i * 4, ty = y - 16 - Math.abs(3 - Math.abs(i)) * 4; ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke(); }
      for (let i = -3; i <= 3; i++) { const tx = x + i * 4, ty = y - 16 - Math.abs(3 - Math.abs(i)) * 4; ctx.strokeStyle = i < 0 ? '#6E9A22' : '#3F6212'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke(); }
      ctx.fillStyle = '#A3C55A'; ctx.fillRect(x - 5, y - 10, 1, 4);
    } else if (h < 0.56) {
      // A bleached cow skull (inked; the horns, the sockets, the nose holes, a crack)
      ctx.lineCap = 'round';
      ctx.strokeStyle = INK; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(x - 7, y - 9); ctx.quadraticCurveTo(x - 16, y - 12, x - 18, y - 20); ctx.moveTo(x + 7, y - 9); ctx.quadraticCurveTo(x + 16, y - 12, x + 18, y - 20); ctx.stroke();
      ctx.strokeStyle = '#E7DFC8'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.lineCap = 'butt';
      ink(ctx, () => { ctx.ellipse(x, y - 6, 8, 6, 0, 0, Math.PI * 2); ctx.rect(x - 3, y - 4, 6, 6); }, '#F5F0E1', 1);
      ctx.fillStyle = '#F5F0E1'; ctx.fillRect(x - 2, y - 5, 4, 4);
      ctx.fillStyle = '#D6CCAE'; ctx.fillRect(x + 3, y - 8, 4, 6);
      ctx.fillStyle = '#1C1917'; ctx.fillRect(x - 5, y - 8, 3, 3); ctx.fillRect(x + 2, y - 8, 3, 3); ctx.fillRect(x - 2, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1);
    } else if (h < 0.75) {
      // A creosote bush: two humps, lit along their tops, specks of yellow bloom
      const r = 7 + h * 5;
      shadedTop(ctx, () => ctx.arc(x, y - 5, r, Math.PI, 0), '#6B7F3A', x - r, y - 5 - r, r * 2, r);
      shadedTop(ctx, () => ctx.arc(x + 6, y - 3, 5, Math.PI, 0), '#556B2F', x + 1, y - 8, 10, 5);
      ctx.fillStyle = '#FDE047'; ctx.fillRect(x - 3, y - 5 - r + 3, 1, 1); ctx.fillRect(x + 2, y - 5 - r + 5, 1, 1);
    }
  }
  // Fence posts and barbed wire along the turnout, a sign
  const lx = COURSE.landing.truckX;
  if (visible(state, lx - 700, lx + 800)) {
    for (let x = lx - 540; x < lx + 700; x += 120) { column(ctx, x - 2, Y - 50, 5, 50, '#6B4A2A'); ctx.fillStyle = '#3F2A16'; ctx.fillRect(x - 1, Y - 50, 3, 1); }
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.9)'; ctx.lineWidth = 1;
    for (const dy of [36, 22]) {
      ctx.beginPath(); ctx.moveTo(lx - 540, Y - dy); for (let x = lx - 540; x < lx + 700; x += 20) ctx.lineTo(x + 20, Y - dy + Math.sin(x) * 1.5); ctx.stroke();
      // (the barbs)
      ctx.fillStyle = '#57534E'; for (let x = lx - 530; x < lx + 700; x += 20) { const by = Y - dy + Math.sin(x - 10) * 1.5; ctx.fillRect(x - 1, by - 2, 1, 4); ctx.fillRect(x - 2, by - 1, 3, 1); }
    }
    // (the sign: weathered planks on a post, stenciled red, a bullet hole or two)
    column(ctx, lx - 428, Y - 66, 6, 66, '#6B4A2A');
    slab(ctx, lx - 470, Y - 110, 90, 44, '#D6B98C', 2);
    ctx.fillStyle = '#B8996A'; ctx.fillRect(lx - 468, Y - 96, 86, 1); ctx.fillRect(lx - 468, Y - 82, 86, 1);
    ctx.fillStyle = '#9A7A4E'; ctx.fillRect(lx - 460, Y - 104, 6, 1); ctx.fillRect(lx - 400, Y - 88, 8, 1); ctx.fillRect(lx - 440, Y - 74, 5, 1);
    ctx.fillStyle = INK; ctx.fillRect(lx - 393, Y - 102, 2, 2); ctx.fillRect(lx - 456, Y - 78, 2, 2);
    letter(ctx, 'NO', lx - 425, Y - 96, 'bold 7px "Press Start 2P"', '#7F1D1D', '#B8996A');
    letter(ctx, 'TRESPASSING', lx - 425, Y - 84, 'bold 7px "Press Start 2P"', '#7F1D1D', '#B8996A');
    letter(ctx, '(OR FEDS)', lx - 425, Y - 74, '5px "Press Start 2P"', '#7F1D1D', '#B8996A');
  }
};

/** Dale's truck backed up to a stack of crates, Dale with one in his arms (then legging it, then gone). */
const drawLanding = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const it = rt.intro;
  const L = COURSE.landing;
  if (!visible(state, L.truckX - 300, it.truckX + DELIVERY_TRUCK.w + 400)) return;
  // The crate pile (what they were loading)
  const px = L.truckX - 180;
  for (let i = 0; i < 6; i++) {
    const cx = px + (i % 3) * 32 + (i >= 3 ? 16 : 0), cy = Y - 28 - (i >= 3 ? 28 : 0);
    drawCrate(ctx, cx, cy, 30);
  }
  if (it.phase !== 'gone' || it.truckX < L.truckX + 3000) drawDeliveryTruck(ctx, it.truckX, Y - DELIVERY_TRUCK.h, state.frame, false, it.speed > 0.5, it.speed);
  if (daleVisible(it)) {
    const dale = { pos: { x: 0, y: 0 }, width: 80, height: 80, bossState: 'idle' } as unknown as Enemy;
    ctx.save();
    const run = it.phase === 'running' ? Math.sin(state.frame * 0.5) * 2 : 0;
    ctx.translate(it.daleX - 40, Y - 80 + run);
    drawDale(ctx, dale, state.frame);
    ctx.restore();
    // The crate he's holding (till he drops it)
    if (it.phase === 'loading') drawCrate(ctx, it.daleX - 14, Y - 60, 28);
    const text = saying(rt.talk, 'dale');
    if (text) drawBubble(ctx, it.daleX, Y - 96, text, '#FDF4FF');
  }
  if (it.crate) {
    if (!it.crate.broke) drawCrate(ctx, it.crate.x - 14, it.crate.y, 28);
    else {
      // (smashed: its boards in the dirt, inked, the powder spilled in a heap)
      ctx.fillStyle = '#E2E8F0'; ctx.beginPath(); ctx.ellipse(it.crate.x, Y - 2, 22, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.ellipse(it.crate.x - 2, Y - 3, 16, 3, 0, 0, Math.PI * 2); ctx.fill();
      slab(ctx, it.crate.x - 18, Y - 6, 12, 6, '#B7791F', 1);
      ctx.save(); ctx.translate(it.crate.x + 8, Y - 3); ctx.rotate(-0.25); slab(ctx, -8, -3, 16, 5, '#A16207', 1); ctx.restore();
    }
  }
};

/**
 * A wooden crate of "produce" (s wide, h tall): planks lit along their tops, a frame round the face and a brace
 * across it, nail heads, the stencil, inked round.
 */
export const drawCrate = (ctx: Ctx, x: number, y: number, s: number, h = s) => {
  ctx.fillStyle = '#A16207'; ctx.fillRect(x, y, s, h);
  const pl = Math.max(4, Math.round(h / 4));
  for (let py = y; py < y + h; py += pl) { ctx.fillStyle = '#C08A2E'; ctx.fillRect(x, py, s, 1); ctx.fillStyle = '#7C4A0E'; ctx.fillRect(x, py + pl - 1, s, 1); }
  // (the frame round the face, lit top left; the brace corner to corner)
  const e = Math.max(2, Math.round(s / 10));
  ctx.fillStyle = '#854D0E'; ctx.fillRect(x, y, s, e); ctx.fillRect(x, y + h - e, s, e); ctx.fillRect(x, y, e, h); ctx.fillRect(x + s - e, y, e, h);
  ctx.fillStyle = '#CA9A3E'; ctx.fillRect(x, y, s, 1); ctx.fillRect(x, y, 1, h);
  ctx.strokeStyle = '#713F12'; ctx.lineWidth = e; ctx.beginPath(); ctx.moveTo(x + e, y + e); ctx.lineTo(x + s - e, y + h - e); ctx.stroke();
  ctx.fillStyle = '#3F2A10'; for (const [nx, ny] of [[x + e / 2, y + e / 2], [x + s - e, y + e / 2], [x + e / 2, y + h - e], [x + s - e, y + h - e]]) ctx.fillRect(Math.floor(nx), Math.floor(ny), 1, 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, s - 1, h - 1);
  ctx.fillStyle = '#1E3A8A'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('PRODUCE', x + s / 2, y + h / 2 - 3); ctx.textAlign = 'left';
};

/** A shelf of sandstone jutting out of the ground: a lit lip, its strata, the shadow under it, inked. */
const drawLedge = (ctx: Ctx, l: Ledge) => {
  if (l.look === 'rack') return drawRack(ctx, l);
  const rock = () => { ctx.moveTo(l.x - 4, l.y + 2); ctx.lineTo(l.x + l.w + 4, l.y + 2); ctx.lineTo(l.x + l.w - 10, l.y + 22); ctx.lineTo(l.x + 12, l.y + 26); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); rock(); ctx.clip();
  ctx.fillStyle = '#8A4A2A'; ctx.fillRect(l.x - 4, l.y, l.w + 8, 28);
  ctx.fillStyle = '#9E5A34'; ctx.fillRect(l.x - 4, l.y + 4, l.w + 8, 5);
  ctx.fillStyle = '#6B3420'; ctx.fillRect(l.x - 4, l.y + 16, l.w + 8, 12);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; ctx.fillRect(l.x + l.w - 30, l.y, 40, 28);
  ctx.fillStyle = '#5A2A18'; for (let x = l.x + 8; x < l.x + l.w - 8; x += 22) ctx.fillRect(x, l.y + 10, 10, 2);
  ctx.fillStyle = '#B86E40'; for (let x = l.x + 14; x < l.x + l.w - 8; x += 22) ctx.fillRect(x, l.y + 9, 6, 1);
  ctx.restore();
  ctx.beginPath(); rock(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
  slab(ctx, l.x - 4, l.y, l.w + 8, 4, '#C8763F', 1);
};

// ---------------------------------------------------------------------------
// The warehouse
// ---------------------------------------------------------------------------

const drawWarehouse = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const W = COURSE.warehouse;
  const top = Y - 520, ceil = W.ceiling;
  // Inside: corrugated steel, girders, strip lights, stacks of pallets in the back
  const wx1 = Math.max(W.x1, state.camera.x - 20), wx2 = Math.min(COURSE.office.x2, state.camera.x + CANVAS_WIDTH + 20);
  if (wx2 > wx1) {
    // (lit along the middle where the strip lights are, into the gloom up by the roof and down by the floor)
    bandedGradient(ctx, wx1, top, wx2 - wx1, Y - top, ['#2E2A27', '#3A3632', '#44403C', '#4A4642', '#44403C', '#3A3632', '#302C29'], 12);
    // (each rib of it: a lit edge on the left, a shadowed one on the right)
    for (let x = Math.floor(wx1 / 14) * 14; x < wx2; x += 14) { ctx.fillStyle = '#57534E'; ctx.fillRect(x, top, 6, Y - top); ctx.fillStyle = '#625E58'; ctx.fillRect(x, top, 2, Y - top); ctx.fillStyle = '#36322F'; ctx.fillRect(x + 6, top, 2, Y - top); }
    // (rust run down the ribs here and there)
    for (let x = Math.ceil(wx1 / 90) * 90; x < wx2 - 64; x += 90) { if (hash(x * 0.37) < 0.55) continue; ctx.fillStyle = 'rgba(120, 53, 15, 0.3)'; ctx.fillRect(x + Math.round(hash(x) * 60), ceil + 20 + Math.round(hash(x * 3) * 80), 4, 60 + Math.round(hash(x * 5) * 200)); }
    // The roof: girders along it, the purlins between, the whole underside in shadow
    const gx1 = Math.max(W.x1, wx1), gx2 = Math.min(W.x2, wx2);
    if (gx2 > gx1) {
      ctx.fillStyle = '#292524'; ctx.fillRect(gx1, ceil - 40, gx2 - gx1, 40);
      ctx.fillStyle = '#3A3330'; ctx.fillRect(gx1, ceil - 40, gx2 - gx1, 4); ctx.fillRect(gx1, ceil - 8, gx2 - gx1, 8);
      ctx.fillStyle = '#1C1917'; ctx.fillRect(gx1, ceil - 36, gx2 - gx1, 2); ctx.fillRect(gx1, ceil - 10, gx2 - gx1, 2);
      for (let x = Math.ceil(gx1 / 130) * 130; x < gx2 - 10; x += 130) { ctx.fillStyle = '#3A3330'; ctx.fillRect(x, ceil - 40, 10, 40); ctx.fillStyle = '#4A433E'; ctx.fillRect(x, ceil - 40, 3, 40); }
      checker(ctx, gx1, ceil, gx2 - gx1, 14, 'rgba(0, 0, 0, 0.25)');
    }
  }
  for (let x = W.x1 + 120; x < W.x2; x += 260) {
    if (!visible(state, x - 20, x + 20)) continue;
    // A steel column (rust-red I-beam: its flanges lit and shadowed, the web between, bolted plates up it)
    column(ctx, x - 8, ceil, 16, Y - ceil, '#8A3A12');
    ctx.fillStyle = '#5A240A'; ctx.fillRect(x - 3, ceil, 6, Y - ceil);
    ctx.fillStyle = '#A84B1C'; ctx.fillRect(x - 3, ceil, 1, Y - ceil);
    for (let y = ceil + 40; y < Y - 20; y += 90) { slab(ctx, x - 9, y, 18, 8, '#7A3210', 1); ctx.fillStyle = '#D6A27A'; ctx.fillRect(x - 6, y + 3, 1, 1); ctx.fillRect(x + 5, y + 3, 1, 1); }
    slab(ctx, x - 12, Y - 8, 24, 8, '#57534E', 1);
    // A strip light on chains (a steel hood, the tube under it, lit or flickering)
    ctx.fillStyle = '#1C1917'; for (const cx of [x + 60, x + 120]) for (let cy = ceil; cy < ceil + 28; cy += 4) ctx.fillRect(cx, cy, 1, 3);
    const flick = hash(x + Math.floor(state.frame / 7)) > 0.97 ? 0.3 : 1;
    slab(ctx, x + 52, ceil + 27, 76, 5, '#57534E', 1);
    ctx.fillStyle = `rgba(254, 249, 195, ${flick})`; ctx.fillRect(x + 54, ceil + 31, 72, 5);
    ctx.fillStyle = `rgba(255, 255, 255, ${flick})`; ctx.fillRect(x + 56, ceil + 32, 68, 1);
    // (its pool of light down the wall, in steps)
    for (let k = 0; k < 5; k++) {
      const a = 0.15 * flick * (1 - k / 5), span = Y - ceil - 36, y0 = ceil + 36 + k * span / 5, y1 = y0 + span / 5;
      const s0 = (y0 - ceil - 36) / span, s1 = (y1 - ceil - 36) / span;
      ctx.fillStyle = `rgba(254, 249, 195, ${a.toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(x + 54 - 44 * s0, y0); ctx.lineTo(x + 126 + 44 * s0, y0); ctx.lineTo(x + 126 + 44 * s1, y1); ctx.lineTo(x + 54 - 44 * s1, y1); ctx.fill();
    }
  }
  // Pallets of crates stacked against the back wall
  for (let x = W.x1 + 200; x < W.stairs - 100; x += 330) {
    if (!visible(state, x, x + 120)) continue;
    for (let i = 0; i < 8; i++) { const c = i % 4, r = Math.floor(i / 4); drawCrate(ctx, x + c * 30, Y - 140 - r * 30 - 60, 30); }
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x, Y - 260, 120, 260);
  }
  // A banner Dale's had made
  const bx = W.x1 + 900;
  if (visible(state, bx, bx + 300)) drawEmployeeSign(ctx, bx, ceil + 40, state.frame);
  // The loading dock door (you come in through it): the outside wall, the rolled-up door
  const dx = W.x1;
  if (visible(state, dx - 60, dx + 60)) {
    // (the wall over the door, end on: corrugated, each rib lit on top and shadowed under; the door's header)
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(dx - 30, top - 30, 30, Y - 170 - top + 30);
    for (let y = top - 30; y < Y - 170; y += 10) { ctx.fillStyle = '#C7CCD3'; ctx.fillRect(dx - 30, y, 30, 1); ctx.fillStyle = '#6B7280'; ctx.fillRect(dx - 30, y + 6, 30, 3); }
    ctx.fillStyle = INK; ctx.fillRect(dx - 31, top - 30, 1, Y - 170 - top + 30); ctx.fillRect(dx - 1, top - 30, 1, Y - 170 - top + 30);
    slab(ctx, dx - 34, Y - 176, 40, 12, '#374151', 1);
    hazard(ctx, dx - 33, Y - 174, 38, 8, 4);
  }
  // The belts, the crates riding them
  COURSE.belts.forEach((b, i) => { if (visible(state, b.x, b.x + b.w)) { drawBelt(ctx, i, rt.hazards.beltShift[i], state.frame); drawFeed(ctx, i, rt.hazards.beltTimers[i], state.frame); } });
  for (const cr of rt.hazards.crates) {
    if (!visible(state, cr.x, cr.x + CRATE)) continue;
    // (one about to tip off a high line: rocking, split, the powder trickling out of it all the way down to where it'll land)
    if (cr.wobble && !cr.falling) {
      const cx = cr.x + CRATE / 2;
      for (let k = 0; k < 14; k++) { const y = cr.y + CRATE + ((state.frame * 5 + k * 37) % (550 - cr.y - CRATE)); ctx.fillStyle = k % 2 ? 'rgba(248, 250, 252, 0.85)' : 'rgba(226, 232, 240, 0.7)'; ctx.fillRect(cx - 3 + hash(k) * 6, y, 2, 4); }
      ctx.fillStyle = 'rgba(248, 250, 252, 0.6)'; ctx.beginPath(); ctx.ellipse(cx, 548, 10 + cr.wobble * 0.5, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.translate(cx, cr.y + CRATE); ctx.rotate(Math.sin(cr.wobble * 0.6) * 0.12 * (1 + cr.wobble / 20)); drawCrate(ctx, -CRATE / 2, -CRATE, CRATE); ctx.restore();
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(cx - 4, cr.y + CRATE - 6, 8, 3);
    } else drawCrate(ctx, cr.x, cr.y, CRATE);
  }
};

const drawBelt = (ctx: Ctx, i: number, shift: number, frame: number) => {
  const box = beltBox(i), b = COURSE.belts[i];
  if (b.high) {
    // Hung from the roof: the rods down to it, the truss under it, swaying a hair with the motor's shake
    const sway = Math.sin(frame * 0.2 + i) * 0.6;
    for (let x = box.x + 30; x < box.x + box.w; x += 120) {
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, COURSE.warehouse.ceiling); ctx.lineTo(x + sway, box.y + 10); ctx.stroke();
      ctx.strokeStyle = '#57534E'; ctx.lineWidth = 1; ctx.stroke();
    }
    pipe(ctx, box.x + 4, box.y + 10, box.w - 8, 10, '#374151');
    ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 1.5;
    for (let x = box.x + 6; x < box.x + box.w - 16; x += 16) { ctx.beginPath(); ctx.moveTo(x, box.y + 19); ctx.lineTo(x + 8, box.y + 11); ctx.lineTo(x + 16, box.y + 19); ctx.stroke(); }
    ctx.fillStyle = '#FACC15'; ctx.fillRect(box.x + 4, box.y + 10, box.w - 8, 2);
    // (and the hazard stripes along its underside: don't stand under this)
    hazard(ctx, box.x + 4, box.y + 20, box.w - 14, 4, 4);
  } else {
    // The machine under it (a steel housing, lit along the top, its access panels, hazard tape along the lip)
    slab(ctx, box.x + 10, box.y + 10, box.w - 20, box.h - 10, '#374151', 2);
    for (let x = box.x + 20; x < box.x + box.w - 20; x += 40) { ctx.fillStyle = '#1F2937'; ctx.fillRect(x, box.y + 14, 6, box.h - 14); ctx.fillStyle = '#4B5563'; ctx.fillRect(x, box.y + 14, 1, box.h - 14); }
    hazard(ctx, box.x + 10, box.y + 10, box.w - 20, 4, 4);
  }
  // The belt: black rubber (a sheen along its top), its ridges going by, the drums at either end
  ctx.fillStyle = '#111827'; ctx.fillRect(box.x, box.y, box.w, 10);
  ctx.fillStyle = '#374151'; ctx.fillRect(box.x, box.y, box.w, 1);
  ctx.fillStyle = '#4B5563';
  const off = ((shift % 16) + 16) % 16;
  for (let x = box.x + off; x < box.x + box.w; x += 16) { ctx.fillRect(x, box.y + 1, 3, 3); }
  ctx.fillStyle = INK; ctx.fillRect(box.x, box.y + 9, box.w, 1);
  for (const dx of [box.x + 5, box.x + box.w - 5]) {
    ink(ctx, () => ctx.arc(dx, box.y + 5, 6, 0, Math.PI * 2), '#6B7280', 1);
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(dx - 3, box.y + 1, 3, 2); ctx.fillStyle = INK; ctx.fillRect(dx - 1, box.y + 4, 2, 2);
  }
  // An arrow painted on the side: which way it runs
  const dir = COURSE.belts[i].speed < 0 ? -1 : 1;
  if (!b.high) for (let x = box.x + 40; x < box.x + box.w - 40; x += 90) ink(ctx, () => { ctx.moveTo(x + dir * 12, box.y + 26); ctx.lineTo(x - dir * 6, box.y + 20); ctx.lineTo(x - dir * 6, box.y + 32); ctx.closePath(); }, '#FDE047', 1);
};

/**
 * Where a belt's crates come on: a chute down from the ceiling over the feed end, a hazard-striped hopper mouth and a
 * beacon on it. When the next one's coming the beacon goes round, flashing, and the crate's seen coming down the chute
 * (through its window), the mouth lighting up just before it drops onto the belt.
 */
const drawFeed = (ctx: Ctx, i: number, timer: number, frame: number) => {
  const b = COURSE.belts[i], fx = feedX(i), cx = fx + CRATE / 2;
  const top = Math.max(b.y - 200, COURSE.warehouse.ceiling - 40), mouth = b.y - CRATE - 14;
  const warn = timer <= CRATE_WARN;
  // The chute: steel, a window down it, rivets up its edges
  column(ctx, cx - 22, top, 44, mouth - top, '#4B5563');
  ctx.fillStyle = '#111827'; ctx.fillRect(cx - 16, top + 10, 32, mouth - top - 20);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(cx - 15, top + 11, 30, mouth - top - 22);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(cx - 16.5, top + 9.5, 33, mouth - top - 19);
  ctx.fillStyle = '#9CA3AF'; for (let y = top + 6; y < mouth - 4; y += 14) { ctx.fillRect(cx - 20, y, 1, 1); ctx.fillRect(cx + 19, y, 1, 1); }
  // (the crate coming down it, while it's on its way)
  if (warn) {
    const k = 1 - timer / CRATE_WARN;
    ctx.save(); ctx.beginPath(); ctx.rect(cx - 16, top + 10, 32, mouth - top - 10); ctx.clip();
    drawCrate(ctx, fx, top - CRATE + k * (mouth - top + CRATE - 4), CRATE);
    ctx.restore();
  }
  // The hopper mouth: hazard stripes round it, lit up red as the crate's about to come out
  hazard(ctx, cx - 26, mouth, 52, 10, 5);
  ctx.fillStyle = INK; ctx.fillRect(cx - 27, mouth, 1, 10); ctx.fillRect(cx + 26, mouth, 1, 10);
  if (warn && timer < 20 && Math.floor(frame / 4) % 2) { ctx.fillStyle = 'rgba(239, 68, 68, 0.55)'; ctx.fillRect(cx - 26, mouth, 52, 10); }
  // The beacon on the side of it: dark till one's coming, then going round, flashing amber, throwing its light about
  const bx = cx + 30, by = mouth - 30;
  slab(ctx, bx - 6, by + 5, 12, 7, '#374151', 1);
  const lens = warn ? (Math.floor(frame / 5) % 2 ? '#F59E0B' : '#FDE68A') : '#78350F';
  if (warn) steppedGlow(ctx, bx, by + 2, 18, '#FBBF24', 0.3, 0.05, 3);
  ink(ctx, () => { ctx.arc(bx, by + 4, 9, Math.PI, 0); ctx.closePath(); }, lens, 1);
  ctx.fillStyle = dark(lens, 0.25); ctx.fillRect(bx + 3, by - 3, 4, 7);
  ctx.fillStyle = lite(lens, 0.6); ctx.fillRect(bx - 5, by - 1, 2, 3);
  if (warn) {
    const a = frame * 0.3;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.22)';
    ctx.beginPath(); ctx.moveTo(bx, by + 2); ctx.lineTo(bx + Math.cos(a) * 140, by + 2 + Math.sin(a) * 60); ctx.lineTo(bx + Math.cos(a + 0.4) * 140, by + 2 + Math.sin(a + 0.4) * 60); ctx.fill();
    // (and an arrow over the mouth, pointing down at where it'll land)
    if (Math.floor(frame / 8) % 2) ink(ctx, () => { ctx.moveTo(cx - 8, mouth - 30); ctx.lineTo(cx + 8, mouth - 30); ctx.lineTo(cx, mouth - 18); ctx.closePath(); }, '#EF4444', 1);
  }
};

/** Orange steel pallet racking, a pallet on top. */
const drawRack = (ctx: Ctx, l: Ledge) => {
  // (the cross bracing behind, then the uprights: punched with their slots)
  for (let y = l.y + 10; y < Y - 10; y += 30) { ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(l.x + 5, y); ctx.lineTo(l.x + l.w - 5, y + 20); ctx.stroke(); ctx.strokeStyle = '#C2410C'; ctx.lineWidth = 1.5; ctx.stroke(); }
  for (const ux of [l.x + 2, l.x + l.w - 8]) { column(ctx, ux, l.y, 6, Y - l.y, '#EA580C'); ctx.fillStyle = '#7C2D12'; for (let y = l.y + 6; y < Y - 4; y += 8) ctx.fillRect(ux + 2, y, 2, 3); }
  pipe(ctx, l.x, l.y + 4, l.w, 8, '#1D4ED8');
  // (the pallet on top: its slats, the blocks between)
  slab(ctx, l.x + 2, l.y - 2, l.w - 4, 6, '#B45309', 1);
  for (let x = l.x + 6; x < l.x + l.w - 6; x += 18) { ctx.fillStyle = '#78350F'; ctx.fillRect(x, l.y - 1, 3, 4); ctx.fillStyle = '#D97706'; ctx.fillRect(x + 4, l.y - 1, 6, 1); }
};

/** The warehouse floor (concrete), the steel stairs up, the office floor. */
const drawFloor = (ctx: Ctx, state: GameState, r: GroundRun) => {
  if (r.surface === 'stairs') {
    // Steel stairs, a handrail, open underneath
    const steps = 20;
    // (the stringer under them, then the handrail and its posts, then the treads: diamond plate, a lit nosing)
    ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(r.x1, r.y1 + 10); ctx.lineTo(r.x2, r.y2 + 10); ctx.stroke();
    ctx.strokeStyle = '#374151'; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(r.x1, r.y1 + 8); ctx.lineTo(r.x2, r.y2 + 8); ctx.stroke();
    for (let x = r.x1; x <= r.x2; x += 60) { const y = runYAt(r, x); column(ctx, x - 1, y - 40, 3, 40, '#9CA3AF'); }
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(r.x1, r.y1 - 40); ctx.lineTo(r.x2, r.y2 - 40); ctx.stroke();
    ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(r.x1, r.y1 - 41); ctx.lineTo(r.x2, r.y2 - 41); ctx.stroke();
    for (let i = 0; i < steps; i++) {
      const x = r.x1 + (i / steps) * (r.x2 - r.x1), w = (r.x2 - r.x1) / steps;
      const y = runYAt(r, x + w / 2);
      slab(ctx, x, y, w + 1, 5, '#6B7280', 1);
      ctx.fillStyle = '#9CA3AF'; for (let k = 3; k < w - 2; k += 4) ctx.fillRect(x + k, y + 2, 2, 1);
      ctx.fillStyle = '#374151'; ctx.fillRect(x, y + 5, 2, 10);
    }
    return;
  }
  if (r.surface === 'office') {
    // The mezzanine: the office floor on steel joists (the deck's edge lit, the joists in shadow under it)
    pipe(ctx, r.x1, r.y1, r.x2 - r.x1, 26, '#57534E');
    ctx.fillStyle = '#44403C'; for (let x = r.x1; x < r.x2; x += 40) ctx.fillRect(x + 20, r.y1 + 8, 1, 12);
    for (let x = r.x1; x < r.x2; x += 40) { column(ctx, x, r.y1 + 26, 8, Y - r.y1 - 26, '#292524'); }
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 2);
    return;
  }
  // The concrete: power-troweled slab (speckled, the joints sawn into it), the yellow lane marks, worn
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  ctx.fillStyle = '#6B6660'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, bottom - r.y1);
  ctx.fillStyle = tilePattern(ctx, 'daleConcrete', 40, 20, g => {
    g.fillStyle = '#7A756F'; for (const [a, b] of [[3, 4], [17, 11], [29, 3], [35, 15], [9, 16], [24, 7]]) g.fillRect(a, b, 1, 1);
    g.fillStyle = '#5C5751'; for (const [a, b] of [[11, 2], [21, 17], [38, 9], [6, 10], [31, 12]]) g.fillRect(a, b, 1, 1);
  });
  ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, bottom - r.y1);
  ctx.fillStyle = '#8A857E'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 3);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 1);
  hazeBands(ctx, r.x1, r.y1 + 3, r.x2 - r.x1, 40, '#1C1917', 0.25, 0, 4);
  for (let x = r.x1 + 30; x < r.x2; x += 90) { ctx.fillStyle = '#FACC15'; ctx.fillRect(x, r.y1 + 8, 40, 3); ctx.fillStyle = '#A16207'; ctx.fillRect(x, r.y1 + 10, 40, 1); ctx.fillStyle = '#6B6660'; ctx.fillRect(x + 12 + (x % 7), r.y1 + 8, 3, 2); }
  for (let x = r.x1; x < r.x2; x += 120) { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, r.y1, 1, 40); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x + 1, r.y1, 1, 40); }
};

// ---------------------------------------------------------------------------
// World: over the terrain, behind everything that moves
// ---------------------------------------------------------------------------

export const drawDaleMid = (ctx: Ctx, state: GameState) => {
  const rt = getDale(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'town') { drawTownMid(ctx, state, rt); return; }
  if (region !== 'desert') return;
  drawGulchRims(ctx, state);
  for (const c of COURSE.cacti) if (visible(state, c.x - 40, c.x + 40)) drawCactus(ctx, c, state.frame);
};

/**
 * A saguaro (arms up), or a clump of prickly pear with its pink fruit. They hurt, so they don't look like the
 * scenery: a hard black outline, bright green, long spines bristling out all round (a glint running along them),
 * and a warning-red tint at their bases.
 */
const drawCactus = (ctx: Ctx, c: Cactus, f: number) => {
  const g = '#43B02A', light = '#9BE15D', dark = '#23701A', line = '#08200A';
  const spines: { x: number; y: number; a: number }[] = [];
  // A dusty red halo on the ground under it
  // (in steps, out from the foot of it)
  const hr = c.look === 'saguaro' ? 44 : 36;
  for (let k = 0; k < 3; k++) { ctx.fillStyle = 'rgba(220, 38, 38, 0.16)'; ctx.beginPath(); ctx.ellipse(c.x, c.y, Math.min(46, hr * (1 - k * 0.3)), 9 - k * 2.5, 0, 0, Math.PI * 2); ctx.fill(); }
  if (c.look === 'saguaro') {
    const trunk = (x: number, y: number, w: number, h: number, pass: 'line' | 'fill') => {
      if (pass === 'line') { ctx.fillStyle = line; ctx.beginPath(); ctx.roundRect(x - w / 2 - 3, y - h - 3, w + 6, h + 3, [w / 2 + 3, w / 2 + 3, 0, 0]); ctx.fill(); return; }
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h, w, h, [w / 2, w / 2, 0, 0]); ctx.fill();
      ctx.fillStyle = light; ctx.fillRect(x - w / 2 + 3, y - h + 6, 3, h - 8);
      ctx.fillStyle = dark; ctx.fillRect(x + w / 2 - 6, y - h + 6, 3, h - 8); ctx.fillRect(x - 1, y - h + 8, 2, h - 10);
      for (let yy = y - h + 7; yy < y - 4; yy += 9) { spines.push({ x: x - w / 2, y: yy, a: Math.PI + 0.35 }, { x: x + w / 2, y: yy + 4, a: -0.35 }); }
      spines.push({ x, y: y - h, a: -Math.PI / 2 }, { x: x - w / 3, y: y - h + 3, a: -Math.PI * 0.75 }, { x: x + w / 3, y: y - h + 3, a: -Math.PI * 0.25 });
    };
    const armL = { x: c.x - 22, y: c.y - c.h * 0.55 + 6, h: c.h * 0.32 }, armR = { x: c.x + 22, y: c.y - c.h * 0.4 + 6, h: c.h * 0.26 };
    for (const pass of ['line', 'fill'] as const) {
      if (pass === 'line') { ctx.fillStyle = line; ctx.fillRect(c.x - 29, c.y - c.h * 0.55 - 3, 24, 16); ctx.fillRect(c.x + 5, c.y - c.h * 0.4 - 3, 24, 16); }
      else { ctx.fillStyle = g; ctx.fillRect(c.x - 26, c.y - c.h * 0.55, 18, 10); ctx.fillRect(c.x + 8, c.y - c.h * 0.4, 18, 10); }
      trunk(c.x, c.y, 22, c.h, pass); trunk(armL.x, armL.y, 14, armL.h, pass); trunk(armR.x, armR.y, 14, armR.h, pass);
    }
    ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.arc(c.x, c.y - c.h - 3, 4, 0, Math.PI * 2); ctx.fill();
  } else {
    // Prickly pear: stacked paddles
    const pads: [number, number, number, number, number][] = [
      [c.x, c.y - c.h * 0.3, 14, c.h * 0.32, 0.1], [c.x - 12, c.y - c.h * 0.62, 10, c.h * 0.24, -0.4], [c.x + 11, c.y - c.h * 0.7, 10, c.h * 0.24, 0.35],
    ];
    for (const pass of ['line', 'fill'] as const) for (const [x, y, rx, ry, a] of pads) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      if (pass === 'line') { ctx.fillStyle = line; ctx.beginPath(); ctx.ellipse(0, 0, rx + 3, ry + 3, 0, 0, Math.PI * 2); ctx.fill(); }
      else {
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = light; ctx.beginPath(); ctx.ellipse(-rx * 0.3, -ry * 0.3, rx * 0.35, ry * 0.45, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FEF9C3'; for (let i = -2; i <= 2; i++) ctx.fillRect(i * rx * 0.35, (i % 2) * ry * 0.3, 2, 2);
      }
      ctx.restore();
      if (pass === 'fill') for (let k = 0; k < 9; k++) { const t = (k / 9) * Math.PI * 2; const ex = Math.cos(t) * rx, ey = Math.sin(t) * ry; spines.push({ x: x + ex * Math.cos(a) - ey * Math.sin(a), y: y + ex * Math.sin(a) + ey * Math.cos(a), a: t + a }); }
    }
    ctx.fillStyle = '#DB2777'; ctx.beginPath(); ctx.arc(c.x - 14, c.y - c.h * 0.86, 3.5, 0, Math.PI * 2); ctx.arc(c.x + 14, c.y - c.h * 0.92, 3.5, 0, Math.PI * 2); ctx.fill();
  }
  // The spines: long, pale, sharp-tipped, bristling out all round; a glint running round them
  const glint = Math.floor(f / 3) % Math.max(1, spines.length + 20);
  spines.forEach((s, i) => {
    const len = 7, ex = s.x + Math.cos(s.a) * len, ey = s.y + Math.sin(s.a) * len;
    ctx.strokeStyle = i === glint ? '#FFFFFF' : '#FEF08A'; ctx.lineWidth = i === glint ? 2.5 : 1.5;
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.fillStyle = line; ctx.fillRect(ex - 1, ey - 1, 2, 2);
  });
};
// ---------------------------------------------------------------------------
// World: in front of everything
// ---------------------------------------------------------------------------

export const drawDaleFront = (ctx: Ctx, state: GameState) => {
  const rt = getDale(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'highway') { drawConvoyFront(ctx, state, rt); return; }
  if (region === 'town') { drawTownFront(ctx, state, rt); return; }
  if (visible(state, COURSE.office.x1 - 100, COURSE.office.x2 + 100)) drawOfficeFront(ctx, state, rt);
  if (visible(state, COURSE.warehouse.x1 - 100, COURSE.office.x2 + 100)) drawWarehouseOutside(ctx, state);
};

/**
 * The warehouse from outside: a big corrugated shed, its name painted down the side, the loading dock's door rolled
 * up at this end. It's in front of everything (you can't see in) till you walk in through the door, then it goes.
 */
const drawWarehouseOutside = (ctx: Ctx, state: GameState) => {
  const W = COURSE.warehouse;
  const p = state.player;
  const a = Math.max(0, Math.min(1, (W.x1 + 40 - (p.pos.x + p.width / 2)) / 120));
  if (a <= 0) return;
  const x1 = W.x1 - 30, x2 = COURSE.office.x2 + 60, top = Y - 520;
  ctx.save();
  ctx.globalAlpha = a;
  // The siding: corrugated steel in bands (lit up under the eaves, the dust of the yard up the bottom), each rib lit
  // on its left and shadowed on its right
  const vx1 = Math.max(x1, state.camera.x - 20), vx2 = Math.min(x2, state.camera.x + CANVAS_WIDTH + 20);
  if (vx2 > vx1) {
    bandedGradient(ctx, vx1, top, vx2 - vx1, Y - top, ['#B8B3AE', '#ABA6A1', '#A8A29E', '#9E9690', '#94877A'], 6);
    for (let x = Math.floor(vx1 / 14) * 14; x < vx2; x += 14) { ctx.fillStyle = '#8A8580'; ctx.fillRect(x, top, 6, Y - top); ctx.fillStyle = '#C4BFBA'; ctx.fillRect(x, top, 1, Y - top); ctx.fillStyle = '#6E6964'; ctx.fillRect(x + 5, top, 1, Y - top); }
    checker(ctx, vx1, Y - 24, vx2 - vx1, 24, 'rgba(160, 112, 63, 0.35)');
  }
  // The roof's edge (a gutter), rust streaks
  pipe(ctx, x1 - 10, top - 14, x2 - x1 + 20, 16, '#57534E');
  for (let x = x1 + 60; x < x2; x += 230) if (visible(state, x, x + 12)) { const h = 120 + hash(x) * 160; ctx.fillStyle = 'rgba(146, 64, 14, 0.35)'; ctx.fillRect(x, top + 2, 10, h); ctx.fillStyle = 'rgba(146, 64, 14, 0.3)'; ctx.fillRect(x + 3, top + 2, 4, h + 30); }
  // Its name down the side
  const sx = x1 + 170;
  if (visible(state, sx, sx + 520)) {
    slab(ctx, sx - 3, top + 57, 526, 96, '#7F1D1D', 3);
    slab(ctx, sx + 2, top + 62, 516, 86, '#FEF3C7', 2);
    ctx.fillStyle = '#F5E6B8'; ctx.fillRect(sx + 4, top + 128, 512, 18);
    ctx.fillStyle = 'rgba(146, 64, 14, 0.25)'; ctx.fillRect(sx + 120, top + 64, 6, 40); ctx.fillRect(sx + 400, top + 64, 4, 60); // (rust run down it)
    letter(ctx, 'DESERT SUN', sx + 260, top + 100, 'bold 26px "Press Start 2P"', '#B91C1C', '#7F1D1D');
    letter(ctx, 'PRODUCE CO.', sx + 260, top + 124, 'bold 14px "Press Start 2P"', '#B91C1C', '#7F1D1D');
    letter(ctx, 'WHOLESALE ONLY - NO VISITORS - NO FEDS', sx + 260, top + 142, '7px "Press Start 2P"', '#1C1917', '#D6C79A');
    // (a sun coming up behind the name, in steps)
    for (let k = 0; k < 3; k++) { ctx.fillStyle = ['#FDBA74', '#FB923C', '#F97316'][k]; ctx.beginPath(); ctx.arc(sx + 40, top + 112, 22 - k * 6, Math.PI, 0); ctx.fill(); }
    ctx.fillStyle = INK; ctx.fillRect(sx + 16, top + 112, 48, 1);
  }
  // The loading dock's door, rolled up: the way in (the dark inside, the door's slats rolled up under its hood, the
  // hazard stripes along the bottom of it, the bumpers)
  ctx.fillStyle = '#0C0A09'; ctx.fillRect(x1, Y - 190, 120, 190);
  bandedGradient(ctx, x1, Y - 190, 120, 60, ['#1C1917', '#0C0A09'], 3);
  slab(ctx, x1 - 4, Y - 212, 128, 8, '#57534E', 1);
  for (let y = Y - 206; y < Y - 186; y += 5) { ctx.fillStyle = '#6B7280'; ctx.fillRect(x1, y, 120, 3); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x1, y, 120, 1); ctx.fillStyle = INK; ctx.fillRect(x1, y + 3, 120, 1); }
  hazard(ctx, x1, Y - 190, 120, 5, 4);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x1 - 0.5, Y - 206.5, 121, 207);
  for (const bx of [x1 + 4, x1 + 104]) slab(ctx, bx, Y - 30, 12, 14, '#1C1917', 1);
  letter(ctx, 'DOCK 1', x1 + 48, Y - 216, 'bold 8px "Press Start 2P"', '#FACC15', '#57534E');
  ctx.restore();
};

// ---------------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------------

export const drawDaleHud = (ctx: Ctx, state: GameState) => {
  const rt = getDale(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'desert') drawJunkieHud(ctx, state, rt);
  if (region === 'highway') drawConvoyHud(ctx, state, rt);
  if (region === 'town') drawTownHud(ctx, state, rt);
  if (!hasWeather(state)) drawFades(ctx, rt);
};

/** Whether the stage's weather gets drawn over the level (it isn't in the boss arena). */
const hasWeather = (state: GameState) => state.camera.x < ARENA_LEFT - CANVAS_WIDTH / 2;

/** The weather out in the open, then the fades over the top of it. */
export const drawDaleWeather = (ctx: Ctx, state: GameState) => {
  const rt = getDale(state)!;
  const region = regionOf(state.camera.x + 400);
  const outside = region === 'town' || (region === 'desert' && state.camera.x < COURSE.warehouse.x1 - 200);
  if (outside) drawBackdropFront(ctx, 'Drug Trade Dale', state.camera.x, state.camera.y, state.frame || 0);
  drawFades(ctx, rt);
  return true;
};

const drawFades = (ctx: Ctx, rt: DaleRuntime) => {
  const d = fadeAmount(rt);
  if (d > 0) { ctx.fillStyle = `rgba(0,0,0,${d})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
};
