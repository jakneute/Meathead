// Drawing Dale's stage: the desert twilight (the backdrop), the landing (Dale's
// truck and his crew's crates), the desert (arroyos, rock shelves, cacti, the odd
// cow skull), the warehouse (corrugated steel, conveyor belts, pallet racks, the
// stairs), the office upstairs (drawn with Chuco's things in junkieDraw.ts), and
// the fades. The convoy's in convoyDraw.ts, the town in townDraw.ts.

import type { GameState } from '../../core/state';
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
  ctx.strokeStyle = '#6E5230'; ctx.lineWidth = 1.5;
  ctx.translate(wx, y); ctx.rotate(f * 0.06);
  ctx.beginPath(); for (let i = 0; i < 5; i++) { ctx.moveTo(-6, (i - 2) * 2.5); ctx.lineTo(6, (2 - i) * 2.5); } ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
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
  // The chains up to the rafters
  ctx.strokeStyle = '#71717A'; ctx.lineWidth = 2;
  for (const cx of [x + 30, x + w - 30]) { ctx.beginPath(); ctx.moveTo(cx, y - 40); ctx.lineTo(cx, y); ctx.stroke(); }
  // The frame and the board
  ctx.fillStyle = '#92400E'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = '#EAB308'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  const board = ctx.createLinearGradient(0, y, 0, y + h);
  board.addColorStop(0, '#5B21B6'); board.addColorStop(1, '#3B0764');
  ctx.fillStyle = board; ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
  // The photo: nobody in it
  const px = x + 12, py = y + 12, pw = 50, ph = 60;
  ctx.fillStyle = '#FACC15'; ctx.fillRect(px - 3, py - 3, pw + 6, ph + 6);
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = '#9CA3AF'; ctx.beginPath(); ctx.arc(px + pw / 2, py + 22, 11, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(px + 9, py + 36, pw - 18, 24);
  ctx.fillStyle = '#6B7280'; ctx.font = 'bold 14px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('?', px + pw / 2, py + 29);
  // The words, each fitted to the space right of the photo
  const tx = px + pw + 12, tw = x + w - 12 - tx, mid = tx + tw / 2;
  const fit = (text: string, size: number, font: string) => { let s = size; do { ctx.font = `${font} ${s}px "Press Start 2P"`; s--; } while (ctx.measureText(text).width > tw && s > 4); };
  ctx.fillStyle = '#F9A8D4'; fit("DALE'S DRUGS", 7, 'bold'); ctx.fillText("DALE'S DRUGS", mid, y + 20);
  ctx.fillStyle = '#FDE047'; fit('EMPLOYEE', 14, 'bold'); ctx.fillText('EMPLOYEE', mid, y + 39);
  fit('OF THE MONTH', 10, 'bold'); ctx.fillText('OF THE MONTH', mid, y + 54);
  // The name plate
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(tx + 8, y + 60, tw - 16, 14);
  ctx.fillStyle = '#1C1917'; fit('NOBODY, AGAIN', 7, 'bold'); ctx.fillText('NOBODY, AGAIN', mid, y + 70);
  ctx.textAlign = 'left';
  // Gold stars either side of the title, twinkling
  for (const [sx, sy, k] of [[tx + 2, y + 34, 0], [x + w - 12, y + 34, 1]] as const) {
    const r = 5 + Math.sin(f * 0.1 + k * 2) * 1;
    ctx.fillStyle = '#FDE047'; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); }
    ctx.fill();
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
  const deep = ctx.createLinearGradient(0, top, 0, top + 320);
  deep.addColorStop(0, '#6B3219'); deep.addColorStop(0.4, '#2E1208'); deep.addColorStop(1, '#050201');
  ctx.fillStyle = deep; ctx.fillRect(x1 - 10, top, w + 20, depth);
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
  const dark = ctx.createLinearGradient(0, top + 40, 0, top + 300);
  dark.addColorStop(0, 'rgba(5, 2, 1, 0)'); dark.addColorStop(1, 'rgba(5, 2, 1, 0.95)');
  ctx.fillStyle = dark; ctx.fillRect(x1 - 10, top, w + 20, depth);
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
      // An overhanging lip and a couple of loose stones on it
      ctx.fillStyle = '#D48A4C'; ctx.beginPath(); ctx.moveTo(edge + dir * 30, lip); ctx.lineTo(edge - dir * 6, lip); ctx.lineTo(edge - dir * 2, lip + 8); ctx.lineTo(edge + dir * 30, lip + 6); ctx.fill();
      ctx.fillStyle = '#8A5A3A'; ctx.beginPath(); ctx.arc(edge + dir * 12, lip - 2, 3, 0, Math.PI * 2); ctx.arc(edge + dir * 20, lip - 1.5, 2, 0, Math.PI * 2); ctx.fill();
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
    if (h < 0.3) { ctx.fillStyle = '#8A5A3A'; ctx.beginPath(); ctx.ellipse(x, y - 4, 10 + h * 20, 6 + h * 6, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#A8764F'; ctx.fillRect(x - 6, y - 9, 8, 2); }
    else if (h < 0.5) { ctx.strokeStyle = '#4D7C0F'; ctx.lineWidth = 2; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + i * 4, y - 16 - Math.abs(3 - Math.abs(i)) * 4); ctx.stroke(); } }
    else if (h < 0.56) {
      // A bleached cow skull
      ctx.fillStyle = '#F5F0E1'; ctx.beginPath(); ctx.ellipse(x, y - 6, 8, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 3, y - 4, 6, 6);
      ctx.strokeStyle = '#F5F0E1'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 7, y - 9); ctx.quadraticCurveTo(x - 16, y - 12, x - 18, y - 20); ctx.moveTo(x + 7, y - 9); ctx.quadraticCurveTo(x + 16, y - 12, x + 18, y - 20); ctx.stroke();
      ctx.fillStyle = '#1C1917'; ctx.fillRect(x - 5, y - 8, 3, 3); ctx.fillRect(x + 2, y - 8, 3, 3);
    } else if (h < 0.75) { ctx.fillStyle = '#6B7F3A'; ctx.beginPath(); ctx.arc(x, y - 5, 7 + h * 5, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#556B2F'; ctx.beginPath(); ctx.arc(x + 6, y - 3, 5, Math.PI, 0); ctx.fill(); }
  }
  // Fence posts and barbed wire along the turnout, a sign
  const lx = COURSE.landing.truckX;
  if (visible(state, lx - 700, lx + 800)) {
    ctx.strokeStyle = '#6B4A2A'; ctx.lineWidth = 4;
    for (let x = lx - 540; x < lx + 700; x += 120) { ctx.beginPath(); ctx.moveTo(x, Y); ctx.lineTo(x, Y - 50); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.8)'; ctx.lineWidth = 1;
    for (const dy of [36, 22]) { ctx.beginPath(); ctx.moveTo(lx - 540, Y - dy); for (let x = lx - 540; x < lx + 700; x += 20) ctx.lineTo(x + 20, Y - dy + Math.sin(x) * 1.5); ctx.stroke(); }
    ctx.fillStyle = '#D6B98C'; ctx.fillRect(lx - 470, Y - 110, 90, 44); ctx.fillStyle = '#6B4A2A'; ctx.fillRect(lx - 428, Y - 66, 6, 66);
    ctx.fillStyle = '#7F1D1D'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('NO', lx - 425, Y - 96); ctx.fillText('TRESPASSING', lx - 425, Y - 84); ctx.font = '5px "Press Start 2P"'; ctx.fillText('(OR FEDS)', lx - 425, Y - 74);
    ctx.textAlign = 'left';
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
    else { ctx.fillStyle = '#92400E'; ctx.fillRect(it.crate.x - 18, Y - 6, 12, 6); ctx.fillRect(it.crate.x, Y - 5, 16, 5); ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.ellipse(it.crate.x, Y - 2, 22, 4, 0, 0, Math.PI * 2); ctx.fill(); }
  }
};

/** A wooden crate of "produce". */
export const drawCrate = (ctx: Ctx, x: number, y: number, s: number) => {
  ctx.fillStyle = '#A16207'; ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = '#713F12'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
  ctx.beginPath(); ctx.moveTo(x + 2, y + 2); ctx.lineTo(x + s - 2, y + s - 2); ctx.stroke();
  ctx.fillStyle = '#713F12'; ctx.fillRect(x, y + s / 2 - 1, s, 2);
  ctx.fillStyle = '#1E3A8A'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('PRODUCE', x + s / 2, y + s / 2 - 3); ctx.textAlign = 'left';
};

/** A shelf of sandstone jutting out of the ground. */
const drawLedge = (ctx: Ctx, l: Ledge) => {
  if (l.look === 'rack') return drawRack(ctx, l);
  ctx.fillStyle = '#8A4A2A';
  ctx.beginPath(); ctx.moveTo(l.x - 4, l.y + 2); ctx.lineTo(l.x + l.w + 4, l.y + 2); ctx.lineTo(l.x + l.w - 10, l.y + 22); ctx.lineTo(l.x + 12, l.y + 26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C8763F'; ctx.fillRect(l.x - 4, l.y, l.w + 8, 4);
  ctx.fillStyle = '#6B3420'; for (let x = l.x + 8; x < l.x + l.w - 8; x += 22) ctx.fillRect(x, l.y + 8, 10, 2);
};

// ---------------------------------------------------------------------------
// The warehouse
// ---------------------------------------------------------------------------

const drawWarehouse = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const W = COURSE.warehouse;
  const top = Y - 520, ceil = W.ceiling;
  // Inside: corrugated steel, girders, strip lights, stacks of pallets in the back
  ctx.fillStyle = '#44403C'; ctx.fillRect(W.x1, top, COURSE.office.x2 - W.x1, Y - top);
  ctx.fillStyle = '#57534E';
  for (let x = W.x1; x < COURSE.office.x2; x += 14) if (visible(state, x, x + 8)) ctx.fillRect(x, top, 6, Y - top);
  ctx.fillStyle = '#292524'; ctx.fillRect(W.x1, ceil - 40, W.x2 - W.x1, 40);
  for (let x = W.x1 + 120; x < W.x2; x += 260) {
    if (!visible(state, x - 20, x + 20)) continue;
    ctx.fillStyle = '#78350F'; ctx.fillRect(x - 8, ceil, 16, Y - ceil);
    ctx.fillStyle = '#92400E'; for (let y = ceil + 10; y < Y; y += 30) { ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y + 15); ctx.lineTo(x - 8, y + 30); ctx.strokeStyle = '#78350F'; ctx.lineWidth = 2; ctx.stroke(); }
    // A strip light on chains
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 60, ceil); ctx.lineTo(x + 60, ceil + 30); ctx.moveTo(x + 120, ceil); ctx.lineTo(x + 120, ceil + 30); ctx.stroke();
    const flick = hash(x + Math.floor(state.frame / 7)) > 0.97 ? 0.3 : 1;
    ctx.fillStyle = `rgba(254, 249, 195, ${flick})`; ctx.fillRect(x + 54, ceil + 30, 72, 6);
    const g = ctx.createLinearGradient(0, ceil + 36, 0, Y);
    g.addColorStop(0, `rgba(254, 249, 195, ${0.16 * flick})`); g.addColorStop(1, 'rgba(254, 249, 195, 0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + 54, ceil + 36); ctx.lineTo(x + 126, ceil + 36); ctx.lineTo(x + 170, Y); ctx.lineTo(x + 10, Y); ctx.fill();
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
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(dx - 30, top - 30, 30, Y - 170 - top + 30);
    ctx.fillStyle = '#6B7280'; for (let y = top - 30; y < Y - 170; y += 10) ctx.fillRect(dx - 30, y, 30, 3);
    ctx.fillStyle = '#374151'; ctx.fillRect(dx - 34, Y - 176, 40, 12);
    ctx.fillStyle = '#FDE047'; for (let i = 0; i < 6; i++) ctx.fillRect(dx - 34 + i * 7, Y - 176, 3, 12);
  }
  // The belts, the crates riding them
  COURSE.belts.forEach((b, i) => { if (visible(state, b.x, b.x + b.w)) { drawBelt(ctx, i, rt.hazards.beltShift[i]); drawFeed(ctx, i, rt.hazards.beltTimers[i], state.frame); } });
  for (const cr of rt.hazards.crates) if (visible(state, cr.x, cr.x + CRATE)) drawCrate(ctx, cr.x, cr.y, CRATE);
};

const drawBelt = (ctx: Ctx, i: number, shift: number) => {
  const box = beltBox(i);
  // The machine under it
  ctx.fillStyle = '#374151'; ctx.fillRect(box.x + 10, box.y + 10, box.w - 20, box.h - 10);
  ctx.fillStyle = '#1F2937'; for (let x = box.x + 20; x < box.x + box.w - 20; x += 40) ctx.fillRect(x, box.y + 14, 6, box.h - 14);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(box.x + 10, box.y + 10, box.w - 20, 4);
  // The belt: black rubber, its ridges going by
  ctx.fillStyle = '#111827'; ctx.fillRect(box.x, box.y, box.w, 10);
  ctx.fillStyle = '#4B5563';
  const off = ((shift % 16) + 16) % 16;
  for (let x = box.x + off; x < box.x + box.w; x += 16) ctx.fillRect(x, box.y + 1, 3, 3);
  ctx.fillStyle = '#6B7280'; ctx.beginPath(); ctx.arc(box.x + 5, box.y + 5, 6, 0, Math.PI * 2); ctx.arc(box.x + box.w - 5, box.y + 5, 6, 0, Math.PI * 2); ctx.fill();
  // An arrow painted on the side: which way it runs
  ctx.fillStyle = '#FDE047';
  const dir = COURSE.belts[i].speed < 0 ? -1 : 1;
  for (let x = box.x + 40; x < box.x + box.w - 40; x += 90) { ctx.beginPath(); ctx.moveTo(x + dir * 12, box.y + 26); ctx.lineTo(x - dir * 6, box.y + 20); ctx.lineTo(x - dir * 6, box.y + 32); ctx.fill(); }
};

/**
 * Where a belt's crates come on: a chute down from the ceiling over the feed end, a hazard-striped hopper mouth and a
 * beacon on it. When the next one's coming the beacon goes round, flashing, and the crate's seen coming down the chute
 * (through its window), the mouth lighting up just before it drops onto the belt.
 */
const drawFeed = (ctx: Ctx, i: number, timer: number, frame: number) => {
  const b = COURSE.belts[i], fx = feedX(i), cx = fx + CRATE / 2;
  const top = b.y - 200, mouth = b.y - CRATE - 14;
  const warn = timer <= CRATE_WARN;
  // The chute: steel, a window down it
  ctx.fillStyle = '#4B5563'; ctx.fillRect(cx - 22, top, 44, mouth - top);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(cx - 16, top + 10, 32, mouth - top - 20);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(cx - 22, top, 4, mouth - top); ctx.fillRect(cx + 18, top, 4, mouth - top);
  // (the crate coming down it, while it's on its way)
  if (warn) {
    const k = 1 - timer / CRATE_WARN;
    ctx.save(); ctx.beginPath(); ctx.rect(cx - 16, top + 10, 32, mouth - top - 10); ctx.clip();
    drawCrate(ctx, fx, top - CRATE + k * (mouth - top + CRATE - 4), CRATE);
    ctx.restore();
  }
  // The hopper mouth: hazard stripes round it, lit up red as the crate's about to come out
  ctx.fillStyle = '#111827'; ctx.fillRect(cx - 26, mouth, 52, 10);
  for (let x = 0; x < 52; x += 8) { ctx.fillStyle = (x / 8) % 2 ? '#111827' : '#FACC15'; ctx.fillRect(cx - 26 + x, mouth, 4, 10); }
  if (warn && timer < 20 && Math.floor(frame / 4) % 2) { ctx.fillStyle = 'rgba(239, 68, 68, 0.55)'; ctx.fillRect(cx - 26, mouth, 52, 10); }
  // The beacon on the side of it: dark till one's coming, then going round, flashing amber, throwing its light about
  const bx = cx + 30, by = mouth - 30;
  ctx.fillStyle = '#374151'; ctx.fillRect(bx - 5, by + 6, 10, 6);
  ctx.fillStyle = warn ? (Math.floor(frame / 5) % 2 ? '#F59E0B' : '#FDE68A') : '#78350F';
  ctx.beginPath(); ctx.arc(bx, by + 4, 9, Math.PI, 0); ctx.fill();
  if (warn) {
    const a = frame * 0.3;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.22)';
    ctx.beginPath(); ctx.moveTo(bx, by + 2); ctx.lineTo(bx + Math.cos(a) * 140, by + 2 + Math.sin(a) * 60); ctx.lineTo(bx + Math.cos(a + 0.4) * 140, by + 2 + Math.sin(a + 0.4) * 60); ctx.fill();
    // (and an arrow over the mouth, pointing down at where it'll land)
    if (Math.floor(frame / 8) % 2) { ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.moveTo(cx - 8, mouth - 30); ctx.lineTo(cx + 8, mouth - 30); ctx.lineTo(cx, mouth - 18); ctx.fill(); }
  }
};

/** Orange steel pallet racking, a pallet on top. */
const drawRack = (ctx: Ctx, l: Ledge) => {
  ctx.fillStyle = '#EA580C'; ctx.fillRect(l.x + 2, l.y, 6, Y - l.y); ctx.fillRect(l.x + l.w - 8, l.y, 6, Y - l.y);
  ctx.strokeStyle = '#C2410C'; ctx.lineWidth = 2;
  for (let y = l.y + 10; y < Y - 10; y += 30) { ctx.beginPath(); ctx.moveTo(l.x + 5, y); ctx.lineTo(l.x + l.w - 5, y + 20); ctx.stroke(); }
  ctx.fillStyle = '#1D4ED8'; ctx.fillRect(l.x, l.y + 4, l.w, 8);
  ctx.fillStyle = '#B45309'; ctx.fillRect(l.x + 2, l.y - 2, l.w - 4, 6);
  ctx.fillStyle = '#78350F'; for (let x = l.x + 6; x < l.x + l.w - 6; x += 18) ctx.fillRect(x, l.y - 2, 3, 6);
};

/** The warehouse floor (concrete), the steel stairs up, the office floor. */
const drawFloor = (ctx: Ctx, state: GameState, r: GroundRun) => {
  if (r.surface === 'stairs') {
    // Steel stairs, a handrail, open underneath
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const x = r.x1 + (i / steps) * (r.x2 - r.x1), w = (r.x2 - r.x1) / steps;
      const y = runYAt(r, x + w / 2);
      ctx.fillStyle = '#6B7280'; ctx.fillRect(x, y, w + 1, 5);
      ctx.fillStyle = '#374151'; ctx.fillRect(x, y + 5, 2, 10);
    }
    ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(r.x1, r.y1 - 40); ctx.lineTo(r.x2, r.y2 - 40); ctx.stroke();
    ctx.lineWidth = 2; for (let x = r.x1; x <= r.x2; x += 60) { const y = runYAt(r, x); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 40); ctx.stroke(); }
    ctx.strokeStyle = '#374151'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(r.x1, r.y1 + 10); ctx.lineTo(r.x2, r.y2 + 10); ctx.stroke();
    return;
  }
  if (r.surface === 'office') {
    // The mezzanine: the office floor on steel joists
    ctx.fillStyle = '#57534E'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 26);
    ctx.fillStyle = '#292524'; for (let x = r.x1; x < r.x2; x += 40) ctx.fillRect(x, r.y1 + 26, 8, Y - r.y1 - 26);
    ctx.fillStyle = '#78716C'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 4);
    return;
  }
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  ctx.fillStyle = '#6B6660'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, bottom - r.y1);
  ctx.fillStyle = '#8A857E'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 3);
  ctx.fillStyle = '#FACC15'; for (let x = r.x1 + 30; x < r.x2; x += 90) ctx.fillRect(x, r.y1 + 8, 40, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; for (let x = r.x1; x < r.x2; x += 120) ctx.fillRect(x, r.y1, 2, 40);
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
  const halo = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, c.look === 'saguaro' ? 44 : 36);
  halo.addColorStop(0, 'rgba(220, 38, 38, 0.45)'); halo.addColorStop(1, 'rgba(220, 38, 38, 0)');
  ctx.fillStyle = halo; ctx.beginPath(); ctx.ellipse(c.x, c.y, 46, 9, 0, 0, Math.PI * 2); ctx.fill();
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
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(x1, top, x2 - x1, Y - top);
  ctx.fillStyle = '#8A8580';
  for (let x = x1; x < x2; x += 14) if (visible(state, x, x + 6)) ctx.fillRect(x, top, 6, Y - top);
  // The roof's edge, rust streaks
  ctx.fillStyle = '#57534E'; ctx.fillRect(x1 - 10, top - 14, x2 - x1 + 20, 16);
  ctx.fillStyle = 'rgba(146, 64, 14, 0.35)'; for (let x = x1 + 60; x < x2; x += 230) if (visible(state, x, x + 12)) ctx.fillRect(x, top + 2, 10, 120 + hash(x) * 160);
  // Its name down the side
  const sx = x1 + 170;
  if (visible(state, sx, sx + 520)) {
    ctx.fillStyle = '#FEF3C7'; ctx.fillRect(sx, top + 60, 520, 90);
    ctx.strokeStyle = '#7F1D1D'; ctx.lineWidth = 5; ctx.strokeRect(sx, top + 60, 520, 90);
    ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 26px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('DESERT SUN', sx + 260, top + 100); ctx.font = 'bold 14px "Press Start 2P"'; ctx.fillText('PRODUCE CO.', sx + 260, top + 124);
    ctx.font = '7px "Press Start 2P"'; ctx.fillStyle = '#1C1917'; ctx.fillText('WHOLESALE ONLY - NO VISITORS - NO FEDS', sx + 260, top + 142); ctx.textAlign = 'left';
  }
  // The loading dock's door, rolled up: the way in
  ctx.fillStyle = '#0C0A09'; ctx.fillRect(x1, Y - 190, 120, 190);
  ctx.fillStyle = '#6B7280'; for (let y = Y - 206; y < Y - 186; y += 5) ctx.fillRect(x1, y, 120, 3);
  ctx.fillStyle = '#FDE047'; for (let i = 0; i < 8; i++) ctx.fillRect(x1 + i * 16, Y - 190, 8, 5);
  ctx.fillStyle = '#FACC15'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillText('DOCK 1', x1 + 20, Y - 212);
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
