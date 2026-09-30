// Alcatraz, drawn, past the tour: the cell house (three tiers of cells, the
// galleries in front of them coming down in the quakes, the floor gone into the
// old fort underneath in places, the far end of the block come down in a heap),
// the recreation yard up top (the bleachers, the wall and the guard tower, the
// lighthouse and the water tower, the city across the bay at sunset), the old
// switchback road down the cliffs (a stretch of it washed out into the bay), and
// the citadel: the old fort's brick vaults under the prison, down in the bedrock,
// the flooded cistern. The faults opening in all of it are faultDraw.ts's, with
// the ground they've opened in drawn here.

import type { GameState } from '../../core/state';
import type { GroundRun } from '../../core/terrain';
import { runYAt } from '../../core/terrain';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { COURSE, FaultLook } from './course';
import type { ErnieRuntime } from './runtime';
import { tourWrecked } from './alcatraz';
import { faultAmount, collapseState, quakeAmount } from './quake';
import { drawFault } from './faultDraw';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;
const Y = GROUND_Y;
const C = COURSE.cellblock, IS = COURSE.island;
/** Where each part is. */
const HOUSE = [C.x1, IS.house], YARD = [IS.house, IS.yard], CITADEL = [IS.yard, C.x2];
const inPart = (x: number, [a, b]: number[]) => x >= a && x < b;
/** The top of the yard wall; the tops of the citadel's vaults. */
const WALL_TOP = Y - 390, VAULT = Y - 230, ROOF = Y - 470;

// ---------------------------------------------------------------------------
// Behind everything (screen space): out in the yard, the sunset over the bay and the city
// ---------------------------------------------------------------------------

/** True if the yard's in view (the sky's drawn behind it); otherwise it's dark indoors. */
export const drawIslandBackdrop = (ctx: Ctx, state: GameState) => {
  const cx = state.camera.x;
  if (!(cx + CANVAS_WIDTH > YARD[0] - 60 && cx < YARD[1] + 60)) { ctx.fillStyle = '#0E1114'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return; }
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  g.addColorStop(0, '#3B1F4A'); g.addColorStop(0.35, '#B4436C'); g.addColorStop(0.6, '#F59E62'); g.addColorStop(0.75, '#FCD9A0');
  ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // The sun going down over the Golden Gate (what's left of it, smoking)
  const hz = 330 - Math.max(-60, Math.min(60, (state.camera.y - (Y - 790)) * 0.12));
  ctx.fillStyle = 'rgba(254, 240, 138, 0.9)'; ctx.beginPath(); ctx.arc(640 - cx * 0.02 % 200, hz - 20, 30, 0, Math.PI * 2); ctx.fill();
  const par = (k: number, w: number) => ((-cx * k) % w + w) % w;
  // The city across the water: the skyline, the pyramid, the tower on the hill, some of it burning
  ctx.fillStyle = '#4A2A4F';
  const o = par(0.08, 900);
  for (let rep = -1; rep < 2; rep++) {
    const bx = o + rep * 900;
    for (let i = 0; i < 30; i++) { const h = 18 + hash(i) * 60, w = 16 + hash(i + 9) * 20; ctx.fillRect(bx + i * 30, hz - h, w, h); }
    ctx.beginPath(); ctx.moveTo(bx + 380, hz); ctx.lineTo(bx + 400, hz - 120); ctx.lineTo(bx + 420, hz); ctx.fill();
    ctx.fillRect(bx + 640, hz - 90, 10, 90);
    ctx.fillStyle = 'rgba(249, 115, 22, 0.8)'; ctx.fillRect(bx + 220, hz - 40, 14, 8); ctx.fillRect(bx + 520, hz - 30, 10, 6);
    ctx.fillStyle = 'rgba(80, 60, 70, 0.5)'; ctx.beginPath(); ctx.arc(bx + 227, hz - 70 - (state.frame * 0.2 % 40), 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4A2A4F';
  }
  // The bay
  const w = ctx.createLinearGradient(0, hz, 0, CANVAS_HEIGHT);
  w.addColorStop(0, '#E2917A'); w.addColorStop(0.2, '#6E4A7A'); w.addColorStop(1, '#1E2A4A');
  ctx.fillStyle = w; ctx.fillRect(0, hz, CANVAS_WIDTH, CANVAS_HEIGHT - hz);
  ctx.fillStyle = 'rgba(254, 215, 170, 0.35)';
  for (let i = 0; i < 16; i++) { const y = hz + 8 + i * 16; ctx.fillRect((par(0.2, 800) + i * 97) % 800, y, 30 + (i % 3) * 12, 2); }
};

// ---------------------------------------------------------------------------
// Behind the terrain: the cell house, the yard, the cliffs, the citadel
// ---------------------------------------------------------------------------

export const drawIslandBack = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const cx = state.camera.x;
  if (cx < HOUSE[1] + 60) drawHouse(ctx, state, rt);
  if (cx + CANVAS_WIDTH > YARD[0] - 100 && cx < YARD[1] + 100) drawYard(ctx, state);
  if (cx + CANVAS_WIDTH > CITADEL[0] - 60) drawCitadel(ctx, state);
  // The ground, and the faults opening in it
  for (const r of state.groundRuns) if (r.x2 > C.x1 && visible(state, r.x1, r.x2)) drawGround(ctx, state, r);
  drawPits(ctx, state);
  COURSE.faults.forEach((f, i) => {
    if (!f.look || f.look === 'street' || !visible(state, f.x - 80, f.x + f.w + 80)) return;
    const since = state.frame - (rt.quakes.faults[i].openedAt ?? -999);
    drawFault(ctx, state, f, i, faultAmount(rt.quakes, i), since, r => drawSurface(ctx, state, r, f.look!));
  });
  // The galleries (and the tower's walk, the gun ports), some of them giving way
  COURSE.ledges.forEach((l, i) => {
    if (l.x < C.x1 || !visible(state, l.x, l.x + l.w)) return;
    const k = collapseState(rt.quakes, i);
    if (k.gone && k.fallY > 1200) return;
    ctx.save();
    if (k.gone) { ctx.translate(l.x + l.w / 2, l.y + k.fallY); ctx.rotate(Math.min(0.6, k.fallY * 0.004)); ctx.translate(-l.x - l.w / 2, -l.y); }
    else if (k.k > 0) ctx.translate(Math.sin(state.frame * 1.9 + i) * 2 * k.k, Math.sin(state.frame * 1.3) * k.k * 1.5);
    if (inPart(l.x, HOUSE)) drawGallery(ctx, l.x, l.y, l.w, k.k > 0 && !k.gone);
    else if (inPart(l.x, YARD)) drawTowerWalk(ctx, l.x, l.y, l.w);
    else drawGunPort(ctx, l.x, l.y, l.w, k.k > 0 && !k.gone);
    ctx.restore();
  });
  void quakeAmount;
};

/** The cell house: the back wall, the skylights (one smashed in once the tour's over), three tiers of cells, the end wall. */
const drawHouse = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const x1 = Math.max(HOUSE[0] - 60, state.camera.x - 20), x2 = Math.min(HOUSE[1], state.camera.x + CANVAS_WIDTH + 20);
  if (x2 <= x1) return;
  const top = state.camera.y - 20;
  const wrecked = tourWrecked(rt.tour);
  ctx.fillStyle = '#5E6B63'; ctx.fillRect(x1, top, x2 - x1, Y - top);
  // Roof trusses and the skylights (one of them smashed in, afterwards)
  ctx.fillStyle = '#2B3330'; ctx.fillRect(x1, Math.max(top, ROOF - 400), x2 - x1, ROOF - Math.max(top, ROOF - 400));
  for (let x = Math.floor(x1 / 200) * 200; x < x2; x += 200) {
    const broken = wrecked && Math.abs(x + 100 - C.crashX) < 110;
    ctx.fillStyle = broken ? '#0B1220' : '#8FA3B0'; ctx.fillRect(x + 40, ROOF - 36, 120, 30);
    if (!broken) { ctx.fillStyle = '#2B3330'; for (let k = 1; k < 4; k++) ctx.fillRect(x + 40 + k * 30, ROOF - 36, 3, 30); }
    else {
      ctx.fillStyle = '#8FA3B0'; ctx.beginPath(); ctx.moveTo(x + 40, ROOF - 36); ctx.lineTo(x + 62, ROOF - 20); ctx.lineTo(x + 40, ROOF - 6); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 160, ROOF - 36); ctx.lineTo(x + 138, ROOF - 26); ctx.lineTo(x + 160, ROOF - 10); ctx.fill();
      ctx.fillStyle = 'rgba(253, 230, 138, 0.12)';
      ctx.beginPath(); ctx.moveTo(x + 40, ROOF - 6); ctx.lineTo(x + 160, ROOF - 6); ctx.lineTo(x + 200, Y); ctx.lineTo(x + 10, Y); ctx.fill();
    }
    // Cracks in the wall from the quakes
    ctx.strokeStyle = 'rgba(30, 36, 33, 0.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 20, ROOF + 10); ctx.lineTo(x + 34 + hash(x) * 20, ROOF + 50); ctx.lineTo(x + 24, ROOF + 90); ctx.stroke();
  }
  // Three tiers of cells, kept dim and quiet (they're only the back wall: what you stand on is the galleries in front):
  // bars, a bunk, a sink, the numbers
  ctx.fillStyle = '#323B37'; ctx.fillRect(x1, IS.tier3 - 120, x2 - x1, Y - (IS.tier3 - 120));
  for (const tierY of [Y, IS.tier2, IS.tier3]) {
    for (let x = Math.floor(x1 / 70) * 70; x < x2; x += 70) {
      ctx.fillStyle = '#1A201D'; ctx.fillRect(x + 6, tierY - 100, 58, 96);
      ctx.fillStyle = '#3B342B'; ctx.fillRect(x + 11, tierY - 40, 32, 5);
      ctx.fillStyle = '#4A4F4C'; ctx.fillRect(x + 48, tierY - 32, 9, 7);
      ctx.fillStyle = '#48524D'; for (let b = x + 9; b < x + 62; b += 9) ctx.fillRect(b, tierY - 100, 1, 96);
      ctx.fillRect(x + 6, tierY - 100, 58, 2);
      ctx.fillStyle = 'rgba(231, 229, 228, 0.3)'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.fillText(`${Math.abs(Math.floor(x / 70)) % 40 + (tierY === Y ? 100 : tierY === IS.tier2 ? 200 : 300)}`, x + 24, tierY - 106);
    }
  }
  // Signs
  const sx = C.x1 + 240;
  if (visible(state, sx - 100, sx + 200)) {
    ctx.fillStyle = '#1C1917'; ctx.fillRect(sx, Y - 420, 160, 30);
    ctx.fillStyle = '#F5F5F4'; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('BROADWAY', sx + 80, Y - 400); ctx.textAlign = 'left';
  }
  const dx = HOUSE[1];
  if (visible(state, dx - 300, dx + 60)) {
    // The end wall, the door out to the yard at the top of the stairs, its sign
    ctx.fillStyle = '#4B5550'; ctx.fillRect(dx - 40, top, 40, IS.tier3 - 90 - top);
    ctx.fillStyle = '#FCD9A0'; ctx.fillRect(dx - 40, IS.tier3 - 90, 40, 90);
    ctx.fillStyle = '#1C1917'; ctx.fillRect(dx - 190, IS.tier3 - 130, 170, 24);
    ctx.fillStyle = '#F5F5F4'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('RECREATION YARD', dx - 105, IS.tier3 - 114); ctx.textAlign = 'left';
  }
};

/** The yard: its walls, the guard tower, the lighthouse and the water tower; then the cliff face over the road down. */
const drawYard = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  const wx1 = YARD[0], wallX = YARD[0] + 930;
  // The lighthouse, behind the yard wall
  const lx = YARD[0] + 700;
  if (visible(state, lx - 60, lx + 60)) {
    ctx.fillStyle = '#E7E5E4'; ctx.beginPath(); ctx.moveTo(lx - 22, WALL_TOP + 40); ctx.lineTo(lx - 14, WALL_TOP - 260); ctx.lineTo(lx + 14, WALL_TOP - 260); ctx.lineTo(lx + 22, WALL_TOP + 40); ctx.fill();
    ctx.fillStyle = '#1C1917'; ctx.fillRect(lx - 20, WALL_TOP - 300, 40, 40);
    ctx.fillStyle = '#FEF08A'; ctx.fillRect(lx - 14, WALL_TOP - 294, 28, 28);
    ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.moveTo(lx - 24, WALL_TOP - 300); ctx.lineTo(lx, WALL_TOP - 320); ctx.lineTo(lx + 24, WALL_TOP - 300); ctx.fill();
    // Its beam going round
    const a = Math.sin(f * 0.03);
    ctx.fillStyle = 'rgba(254, 240, 138, 0.18)'; ctx.beginPath(); ctx.moveTo(lx, WALL_TOP - 280); ctx.lineTo(lx + a * 500, WALL_TOP - 330); ctx.lineTo(lx + a * 500, WALL_TOP - 230); ctx.fill();
  }
  // The yard walls: tall concrete, the wire along the top
  if (visible(state, wx1, wallX)) {
    ctx.fillStyle = '#8A8F87'; ctx.fillRect(wx1, WALL_TOP - 130, wallX - wx1, IS.tier3 - (WALL_TOP - 130));
    ctx.fillStyle = '#6B706A'; for (let x = wx1; x < wallX; x += 80) ctx.fillRect(x, WALL_TOP - 130, 3, IS.tier3 - (WALL_TOP - 130));
    ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 1;
    for (let x = wx1; x < wallX; x += 14) { ctx.beginPath(); ctx.arc(x + 7, WALL_TOP - 136, 6, 0, Math.PI * 2); ctx.stroke(); }
    // A handball court painted on it, and somebody's name scratched in
    ctx.strokeStyle = '#F5F5F4'; ctx.lineWidth = 2; ctx.strokeRect(wx1 + 120, IS.tier3 - 140, 160, 140);
    ctx.fillStyle = 'rgba(245,245,244,0.7)'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText('AL WAS HERE', wx1 + 330, IS.tier3 - 90);
  }
  // The guard tower on the wall
  const gx = YARD[0] + 820;
  if (visible(state, gx - 80, gx + 80)) {
    ctx.fillStyle = '#57534E'; ctx.fillRect(gx - 8, WALL_TOP - 110, 6, 110); ctx.fillRect(gx + 62, WALL_TOP - 110, 6, 110);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(gx - 20, WALL_TOP - 170, 100, 60);
    ctx.fillStyle = '#1C2320'; ctx.fillRect(gx - 12, WALL_TOP - 160, 84, 26);
    ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.moveTo(gx - 28, WALL_TOP - 170); ctx.lineTo(gx + 30, WALL_TOP - 196); ctx.lineTo(gx + 88, WALL_TOP - 170); ctx.fill();
    ctx.fillStyle = '#FEF9C3'; ctx.fillRect(gx + 22, WALL_TOP - 186, 16, 10);
  }
  // Past the wall, over the road down: the island's cliff face rising behind it, the water tower up on top
  const c1 = wallX, c2 = YARD[1];
  if (visible(state, c1, c2)) {
    const top = WALL_TOP - 60;
    const faceY = (x: number) => top + Math.sin(x * 0.013) * 12 + (x - c1) * 0.18;
    const tx = YARD[0] + 1850;
    if (visible(state, tx - 90, tx + 90)) {
      // (stood on the cliff top: each leg down to the ground under it, a little way into it)
      const legs = [tx - 60, tx - 20, tx + 20, tx + 60], t0 = Math.min(...legs.map(faceY)) - 150;
      ctx.fillStyle = '#6B3F2A';
      for (const lx2 of legs) ctx.fillRect(lx2 - 3, t0, 6, faceY(lx2) + 8 - t0);
      ctx.strokeStyle = '#6B3F2A'; ctx.lineWidth = 2;
      ctx.beginPath(); for (let k = 0; k < 3; k++) { ctx.moveTo(legs[k], t0 + 40 + k * 10); ctx.lineTo(legs[k + 1], t0 + 90 + k * 10); } ctx.stroke();
      ctx.fillStyle = '#9A6B4F'; ctx.fillRect(tx - 70, t0 - 100, 140, 100);
      ctx.fillStyle = '#6B3F2A'; ctx.beginPath(); ctx.moveTo(tx - 74, t0 - 100); ctx.lineTo(tx, t0 - 140); ctx.lineTo(tx + 74, t0 - 100); ctx.fill();
      ctx.fillStyle = '#F5F5F4'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
      ctx.fillText('PEACE AND', tx, t0 - 64); ctx.fillText('FREEDOM', tx, t0 - 50); ctx.textAlign = 'left';
    }
    ctx.fillStyle = '#6E5D4E';
    ctx.beginPath(); ctx.moveTo(c1, top);
    for (let x = c1; x <= c2; x += 40) ctx.lineTo(x, faceY(x));
    ctx.lineTo(c2, Y); ctx.lineTo(c1, Y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(40, 30, 24, 0.45)'; ctx.lineWidth = 2;
    for (let x = Math.floor(c1 / 90) * 90; x < c2; x += 90) { ctx.beginPath(); ctx.moveTo(x, top + 30 + (x - c1) * 0.18); ctx.lineTo(x + 30, top + 90 + (x - c1) * 0.18); ctx.lineTo(x + 10, top + 160 + (x - c1) * 0.18); ctx.stroke(); }
    // Scrub and ice plant clinging on
    for (let x = Math.floor(c1 / 60) * 60; x < c2; x += 60) { ctx.fillStyle = hash(x) < 0.5 ? '#4D7C0F' : '#9D174D'; ctx.fillRect(x + hash(x + 1) * 30, top + 40 + (x - c1) * 0.18 + hash(x + 2) * 120, 14, 6); }
  }
};

/** The citadel: the old fort's brick vaults, down in the bedrock, and its lamps. */
const drawCitadel = (ctx: Ctx, state: GameState) => {
  const x1 = Math.max(CITADEL[0], state.camera.x - 20), x2 = Math.min(CITADEL[1], state.camera.x + CANVAS_WIDTH + 20);
  if (x2 <= x1) return;
  const top = state.camera.y - 20;
  // The bedrock over it all
  ctx.fillStyle = '#231813'; ctx.fillRect(x1, top, x2 - x1, VAULT - top);
  ctx.fillStyle = '#34251E'; for (let y = Math.floor(top / 50) * 50; y < VAULT; y += 50) ctx.fillRect(x1, y, x2 - x1, 16);
  // The vaults: brick, arched, one after another
  ctx.fillStyle = '#5A3526'; ctx.fillRect(x1, VAULT, x2 - x1, Y - VAULT);
  ctx.fillStyle = '#7C4A3A';
  for (let y = VAULT; y < Y; y += 12) for (let x = Math.floor(x1 / 26) * 26 + ((y / 12) % 2) * 13; x < x2; x += 26) ctx.fillRect(x, y, 24, 10);
  for (let x = Math.floor(x1 / 200) * 200; x < x2; x += 200) {
    ctx.fillStyle = '#1C120D';
    ctx.beginPath(); ctx.moveTo(x + 30, Y); ctx.lineTo(x + 30, VAULT + 90); ctx.arc(x + 100, VAULT + 90, 70, Math.PI, 0); ctx.lineTo(x + 170, Y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8B5A45'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x + 100, VAULT + 90, 73, Math.PI, 0); ctx.stroke();
    // A lamp in each, and water weeping down the brick
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(x + 186, VAULT + 30, 6, 10);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.35)'; ctx.fillRect(x + 10 + hash(x) * 10, VAULT, 4, Y - VAULT);
  }
  const sx = CITADEL[0] + 60;
  if (visible(state, sx, sx + 200)) {
    ctx.fillStyle = '#1C1917'; ctx.fillRect(sx, VAULT + 10, 170, 22);
    ctx.fillStyle = '#E7E5E4'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('CITADEL 1859: NO ENTRY', sx + 85, VAULT + 25); ctx.textAlign = 'left';
  }
};

// ---------------------------------------------------------------------------
// The ground
// ---------------------------------------------------------------------------

/** Which look a stretch of island ground has. */
const lookOf = (surface?: string): FaultLook => (surface === 'yard' || surface === 'bleacher' ? 'yard' : surface === 'cliff' ? 'rock' : surface === 'citadel' ? 'brick' : 'floor');

const drawGround = (ctx: Ctx, state: GameState, r: GroundRun) => {
  if (r.surface === 'stairs') { drawStairs(ctx, state, r); return; }
  if (r.surface === 'rubble') { drawSurface(ctx, state, r, 'floor'); drawRubble(ctx, r); return; }
  drawSurface(ctx, state, r, lookOf(r.surface));
  if (r.surface === 'yard') { ctx.fillStyle = 'rgba(245, 245, 244, 0.6)'; for (let x = Math.ceil(r.x1 / 160) * 160; x < r.x2; x += 160) ctx.fillRect(x, runYAt(r, x) + 3, 40, 2); }
  if (r.surface === 'bleacher') { ctx.fillStyle = '#D6D3D1'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 4); ctx.fillStyle = '#57534E'; ctx.fillRect(r.x1, r.y1 + 4, 3, 50); }
};

/** A stretch of the island's ground (or a fault's) in the look for where it is. */
const drawSurface = (ctx: Ctx, state: GameState, r: GroundRun, look: FaultLook) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  const band = (d1: number, d2: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(r.x1, r.y1 + d1); ctx.lineTo(r.x2, r.y2 + d1); ctx.lineTo(r.x2, Math.min(bottom + 400, r.y2 + d2)); ctx.lineTo(r.x1, Math.min(bottom + 400, r.y1 + d2)); ctx.closePath(); ctx.fill();
  };
  switch (look) {
    case 'floor': band(0, 1400, '#3A3E3A'); band(0, 22, '#8A8F87'); band(22, 28, '#2B3330'); band(0, 2, '#A3A8A0'); break;
    case 'yard': band(0, 1400, '#57534E'); band(0, 30, '#A8A29E'); band(30, 34, '#6B706A'); band(0, 2, '#D6D3D1'); break;
    case 'rock': {
      band(0, 1400, '#57493E'); band(0, 10, '#9C8468'); band(10, 16, '#6E5D4E'); band(0, 2, '#B8A07F');
      ctx.fillStyle = 'rgba(30, 22, 16, 0.35)';
      for (let x = Math.ceil(r.x1 / 50) * 50; x < r.x2; x += 50) { const y = runYAt(r, x); ctx.fillRect(x, y + 30 + hash(x) * 60, 22, 6); }
      break;
    }
    case 'brick': band(0, 1400, '#2A1C16'); band(0, 18, '#7C4A3A'); band(18, 22, '#3B2A22'); band(0, 2, '#9A6B55'); break;
    default: break;
  }
};

/** The far end of the block, come down in a heap: broken cell fronts, bars, a bunk, slabs of gallery. */
const drawRubble = (ctx: Ctx, r: GroundRun) => {
  for (let x = r.x1 + 8; x < r.x2 - 8; x += 22) {
    const y = runYAt(r, x), s = hash(x);
    ctx.fillStyle = s < 0.33 ? '#6B706A' : s < 0.66 ? '#8A8F87' : '#4B5550';
    ctx.save(); ctx.translate(x, y + 4); ctx.rotate((s - 0.5) * 0.8); ctx.fillRect(-12, -10, 24, 14); ctx.restore();
    if (s > 0.7) { ctx.fillStyle = '#9CA3AF'; ctx.save(); ctx.translate(x, y); ctx.rotate(s * 2); ctx.fillRect(-1, -20, 2, 24); ctx.restore(); }
  }
};

/** The stairs up to the yard door. */
const drawStairs = (ctx: Ctx, state: GameState, r: GroundRun) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  ctx.fillStyle = '#3A3E3A'; ctx.beginPath(); ctx.moveTo(r.x1, r.y1); ctx.lineTo(r.x2, r.y2); ctx.lineTo(r.x2, bottom); ctx.lineTo(r.x1, bottom); ctx.fill();
  const n = 8;
  for (let k = 0; k < n; k++) {
    const x = r.x1 + (k / n) * (r.x2 - r.x1), y = r.y1 + ((k + 1) / n) * (r.y2 - r.y1);
    ctx.fillStyle = '#8A8F87'; ctx.fillRect(x, y, (r.x2 - r.x1) / n + 1, (r.y1 - r.y2) / n + 1);
    ctx.fillStyle = '#A3A8A0'; ctx.fillRect(x, y, (r.x2 - r.x1) / n + 1, 2);
  }
};

/** The holes: down into the old fort under the cell house; the road washed out into the bay; the flooded cistern. */
const drawPits = (ctx: Ctx, state: GameState) => {
  const runs = state.groundRuns;
  const bottom = state.camera.y + CANVAS_HEIGHT + 40;
  for (let i = 0; i + 1 < runs.length; i++) {
    const a = runs[i], n = runs[i + 1];
    if (a.x2 < C.x1 || n.x1 <= a.x2 + 1 || !visible(state, a.x2, n.x1)) continue;
    // (the faults draw their own)
    if (COURSE.faults.some(f => Math.abs(f.x - a.x2) < 2)) continue;
    const top = Math.min(a.y2, n.y1), x = a.x2, w = n.x1 - a.x2;
    if (inPart(x, HOUSE)) {
      const g = ctx.createLinearGradient(0, top, 0, top + 300);
      g.addColorStop(0, '#2B2420'); g.addColorStop(1, '#050404');
      ctx.fillStyle = g; ctx.fillRect(x, top, w, bottom - top);
      // Old brick down there, the fort under the prison, and the broken edges of the floor with the rebar sticking out
      ctx.fillStyle = 'rgba(124, 74, 58, 0.35)';
      for (let y = top + 60; y < top + 260; y += 14) for (let bx = x + ((y / 14) % 2) * 12; bx < x + w; bx += 26) ctx.fillRect(bx, y, 22, 10);
      ctx.strokeStyle = '#78716C'; ctx.lineWidth = 2;
      for (const ex of [x, x + w]) for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(ex, top + 6 + k * 6); ctx.lineTo(ex + (ex === x ? 1 : -1) * (10 + k * 5), top + 12 + k * 9); ctx.stroke(); }
    } else if (inPart(x, YARD)) {
      // Washed out: the cliff falls away to the rocks and the bay far below
      ctx.fillStyle = '#4A3D33';
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + 30, top + 120); ctx.lineTo(x + w - 30, top + 120); ctx.lineTo(x + w, top); ctx.lineTo(x + w, bottom); ctx.lineTo(x, bottom); ctx.fill();
      const g = ctx.createLinearGradient(0, top + 60, 0, top + 400);
      g.addColorStop(0, 'rgba(30, 42, 74, 0)'); g.addColorStop(1, 'rgba(30, 42, 74, 1)');
      ctx.fillStyle = '#2A2019'; ctx.fillRect(x + 20, top + 10, w - 40, bottom - top);
      ctx.fillStyle = g; ctx.fillRect(x + 20, top + 60, w - 40, bottom - top);
      ctx.fillStyle = 'rgba(248, 250, 252, 0.5)'; ctx.fillRect(x + 30 + (state.frame % 40), top + 330, 30, 3);
    } else {
      // The cistern: black water, a long way down
      ctx.fillStyle = '#0B0806'; ctx.fillRect(x, top, w, bottom - top);
      ctx.fillStyle = '#7C4A3A'; ctx.fillRect(x, top, 6, 90); ctx.fillRect(x + w - 6, top, 6, 90);
      ctx.fillStyle = '#10223A'; ctx.fillRect(x + 6, top + 70, w - 12, bottom - top - 70);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)'; ctx.fillRect(x + 12 + Math.sin(state.frame * 0.05) * 6, top + 72, w - 40, 2);
    }
  }
};

// ---------------------------------------------------------------------------
// Ledges
// ---------------------------------------------------------------------------

/** A gallery in front of a tier of cells: a steel walkway, the railing, the brackets under it. Shaking loose, sparks off the bolts. */
const drawGallery = (ctx: Ctx, x: number, y: number, w: number, going: boolean) => {
  // (bright and solid against the dim cells behind: the thing you can stand on should read as that)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fillRect(x, y + 14, w, 8);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(x, y, w, 14);
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = '#4B5563'; for (let gx = x + 4; gx < x + w - 2; gx += 8) ctx.fillRect(gx, y + 5, 4, 4);
  // A yellow safety stripe along its edge
  ctx.fillStyle = '#EAB308'; ctx.fillRect(x, y + 10, w, 3);
  ctx.fillStyle = '#1F2937'; for (let sx = x; sx < x + w; sx += 12) ctx.fillRect(sx, y + 10, 5, 3);
  // The railing (thin, so it doesn't clutter), the brackets under it
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x, y - 28, w, 2);
  for (let rx = x; rx <= x + w; rx += 24) ctx.fillRect(rx, y - 28, 2, 28);
  ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 3;
  for (let bx = x + 20; bx < x + w - 10; bx += 90) { ctx.beginPath(); ctx.moveTo(bx, y + 14); ctx.lineTo(bx + 16, y + 34); ctx.stroke(); }
  if (going) { ctx.fillStyle = '#FDE047'; ctx.fillRect(x + 2, y + 6, 3, 3); ctx.fillRect(x + w - 5, y + 6, 3, 3); }
};

/** The guard tower's walk. */
const drawTowerWalk = (ctx: Ctx, x: number, y: number, w: number) => {
  ctx.fillStyle = '#78716C'; ctx.fillRect(x, y, w, 10);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = '#57534E'; ctx.fillRect(x, y - 26, w, 3); for (let rx = x; rx <= x + w; rx += 18) ctx.fillRect(rx, y - 26, 3, 26);
};

/** An old gun port's stone sill, out over the cistern (it won't hold). */
const drawGunPort = (ctx: Ctx, x: number, y: number, w: number, going: boolean) => {
  ctx.fillStyle = '#8B5A45'; ctx.fillRect(x, y, w, 14);
  ctx.fillStyle = '#A8735C'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = '#5A3526'; for (let bx = x + 4; bx < x + w; bx += 22) ctx.fillRect(bx, y + 5, 1, 9);
  if (going) { ctx.strokeStyle = '#1C120D'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w * 0.4, y); ctx.lineTo(x + w * 0.5, y + 7); ctx.lineTo(x + w * 0.45, y + 14); ctx.stroke(); }
};
