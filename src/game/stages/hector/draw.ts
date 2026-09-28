// Drawing for Hector's stage: the sky (sunny to hurricane, and the inside of the
// storm), the ground (sand, road, boardwalk, lawn) and the sea, the scenery
// (umbrellas, motels, signs, boats), the platforms, the hazards and the HUD.

import type { GameState } from '../../state';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../constants';
import { drawBackdrop, drawBackdropFront } from '../../render/backdrops';
import { COURSE, Plat, Prop, palmTip } from './course';
import { getHector, regionOf, HectorRuntime } from './runtime';
import { drawNews } from './news';
import { drawWaterHazards, drawAirMeter } from './drawWater';
import { STRIKE_WARN, shockPhase, AWNING_BOUNCE, SEA_DEPTH } from './hazards';
import { copsLeft } from './beach';
import { towerFlash, TOWER, RISE_WARNING } from './tower';
import { drawBoatScene, drawBoatFront, drawTowerJunk, drawEyeArena, drawDaycare, drawDaycareFront, drawPoolWater } from './drawSet';
import { drawEyeHud } from './eyeDraw';

type Ctx = CanvasRenderingContext2D;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;

/** How stormy it is where the camera is (0 sunny, 1 hurricane). */
export const stormAt = (state: GameState, rt: HectorRuntime) => {
  const region = regionOf(state.camera.x + 400);
  if (region === 'main') return rt.beach.storm;
  // (after the Eye it's sunshine all the way to the boss door)
  if (region === 'daycare') return 0;
  return 1;
};

// ---------------------------------------------------------------------------
// Sky
// ---------------------------------------------------------------------------

export const drawHectorBackdrop = (ctx: Ctx, state: GameState): boolean => {
  const rt = getHector(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'tower' || region === 'eye') { drawInsideStorm(ctx, state); return true; }
  const storm = stormAt(state, rt);
  // (after the Eye: the sky of a storm that's just ended)
  if (storm < 1) drawBackdrop(ctx, region === 'daycare' ? 'Hector After' : 'Hector Sunny', state.camera.x, state.camera.y, state.frame);
  if (storm > 0) {
    ctx.save(); ctx.globalAlpha = storm;
    drawBackdrop(ctx, 'Hector Hurricane', state.camera.x, state.camera.y, state.frame);
    ctx.restore();
  }
  return true;
};

export const drawHectorWeather = (ctx: Ctx, state: GameState): boolean => {
  const rt = getHector(state)!;
  const region = regionOf(state.camera.x + 400);
  const storm = region === 'tower' || region === 'eye' ? 1 : stormAt(state, rt);
  if (storm > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(8, 14, 32, ${0.22 * storm})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = storm;
    drawBackdropFront(ctx, 'Hector Hurricane', state.camera.x, state.camera.y, state.frame);
    ctx.restore();
  }
  return true;
};

/** Inside the hurricane: bands of cloud and rain spiralling round (turning as you go round the storm), lightning in the murk. */
const drawInsideStorm = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  g.addColorStop(0, '#0B1224'); g.addColorStop(0.5, '#1A2340'); g.addColorStop(1, '#0B1020');
  ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // The storm turning: as you go round, the bands slide past (and they spin on their own too)
  const turn = (state.camera.x / TOWER.circumference) * Math.PI * 2 + f * 0.004;
  ctx.save();
  ctx.translate(CANVAS_WIDTH / 2, -200 - state.camera.y * 0.05 % 200);
  for (let band = 0; band < 7; band++) {
    ctx.strokeStyle = band % 2 ? 'rgba(96, 112, 150, 0.25)' : 'rgba(40, 52, 88, 0.45)';
    ctx.lineWidth = 36 + band * 8;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 1.6; a += 0.08) {
      const r = 160 + band * 110 + a * 60;
      const ang = a + turn + band * 0.7;
      const x = Math.cos(ang) * r, y = Math.sin(ang) * r * 0.45 + 500;
      if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
  // Lightning somewhere in the storm
  const cycle = 200, t = f % cycle;
  if (t < 8) {
    ctx.fillStyle = `rgba(210, 225, 255, ${t < 3 ? 0.35 : 0.12})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const s = Math.floor(f / cycle);
    ctx.strokeStyle = '#E0E7FF'; ctx.lineWidth = 2; ctx.beginPath();
    let x = 100 + hash(s) * 600, y = 0; ctx.moveTo(x, y);
    for (let i = 0; i < 8; i++) { x += (hash(s * 9 + i) - 0.5) * 70; y += 35; ctx.lineTo(x, y); }
    ctx.stroke();
  }
};

// ---------------------------------------------------------------------------
// World layers
// ---------------------------------------------------------------------------

export const drawHectorBack = (ctx: Ctx, state: GameState) => {
  const rt = getHector(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'tower') { drawEyeWall(ctx, state); return; }
  if (region === 'eye') return;
  drawSea(ctx, state);
  for (const p of COURSE.props) if (visible(state, p.x - (p.w ?? 100), p.x + (p.w ?? 100) + 100)) drawProp(ctx, state, p, rt);
  drawGround(ctx, state);
  if (region === 'daycare' || visible(state, COURSE.daycare.x1, COURSE.daycare.x2)) drawDaycare(ctx, state, rt.daycare);
};

export const drawHectorMid = (ctx: Ctx, state: GameState) => {
  const rt = getHector(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'tower') { drawTowerJunk(ctx, state, rt.tower); return; }
  if (region === 'eye') { drawEyeArena(ctx, state, rt.eye); return; }
  COURSE.plats.forEach((p, i) => { if (visible(state, p.x, p.x + p.w)) drawPlat(ctx, state, p, i, rt); });
  drawFloats(ctx, state, rt);
  drawShocks(ctx, state);
  for (const s of rt.hazards.scorches) {
    ctx.fillStyle = `rgba(20, 20, 20, ${0.6 * (1 - s.t / 400)})`;
    ctx.beginPath(); ctx.ellipse(s.x, s.y - 1, 24, 5, 0, 0, Math.PI * 2); ctx.fill();
  }
  // Lightning about to land: a flickering ring, sparks crawling up
  for (const s of rt.hazards.strikes) {
    if (s.t >= STRIKE_WARN) continue;
    const k = Math.max(0, s.t / STRIKE_WARN);
    ctx.save();
    ctx.globalAlpha = 0.4 + 0.6 * (Math.abs(Math.floor(s.t / 4) % 2));
    ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(s.x, s.ground - 2, 30 - k * 8, 7 - k * 2, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = `rgba(253, 224, 71, ${0.15 + k * 0.3})`; ctx.fillRect(s.x - 24, s.ground - 300 * k, 48, 300 * k);
    ctx.fillStyle = '#FDE047'; ctx.font = 'bold 14px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('!', s.x, s.ground - 30);
    ctx.restore();
  }
  for (const d of rt.hazards.debris) if (d.warn <= 0) drawDebris(ctx, d.x, d.y, d.rot, d.look, d.size);
  drawPoliceCruiser(ctx, state, rt);
  drawBoatScene(ctx, state, rt.boat);
};

export const drawHectorFront = (ctx: Ctx, state: GameState) => {
  const rt = getHector(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'main') {
    drawWaterFront(ctx, state);
    drawPoolWater(ctx, state);
    drawBoatFront(ctx, state, rt.boat);
    drawWaterHazards(ctx, state, rt.hazards);
    drawAirMeter(ctx, state, rt.hazards);
  }
  // Lightning bolts
  for (const s of rt.hazards.strikes) {
    if (s.t < STRIKE_WARN) continue;
    ctx.save();
    ctx.strokeStyle = '#F8FAFF'; ctx.lineWidth = 5; ctx.shadowColor = '#BFDBFE'; ctx.shadowBlur = 18;
    ctx.beginPath();
    let x = s.x + (hash(s.x) - 0.5) * 60, y = state.camera.y - 20;
    ctx.moveTo(x, y);
    const steps = 9;
    for (let i = 1; i <= steps; i++) { const ty = y + (s.ground - y) * (i / steps); x = i === steps ? s.x : x + (hash(s.x + i * 13 + s.t) - 0.5) * 50; ctx.lineTo(x, ty); }
    ctx.stroke();
    ctx.restore();
  }
  if (region === 'tower') drawRisingStorm(ctx, state, rt.tower.riseY);
  if (region === 'daycare') drawDaycareFront(ctx, state, rt.daycare);
};

/** The storm rising up the tower: a churning wall of cloud, spray and junk swallowing everything below it. */
const drawRisingStorm = (ctx: Ctx, state: GameState, top: number) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 40;
  if (top > bottom) return;
  const x0 = state.camera.x - 600, x1 = state.camera.x + CANVAS_WIDTH + 600, f = state.frame;
  const g = ctx.createLinearGradient(0, top - 30, 0, top + 260);
  g.addColorStop(0, 'rgba(71, 85, 105, 0.95)'); g.addColorStop(1, '#0F172A');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x0, bottom);
  for (let x = x0; x <= x1; x += 24) ctx.lineTo(x, top - 18 - Math.abs(Math.sin(x * 0.03 + f * 0.12)) * 26 - Math.sin(x * 0.011 - f * 0.05) * 10);
  ctx.lineTo(x1, bottom); ctx.closePath(); ctx.fill();
  // (a line of foam along the crest, so you can see it coming)
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.85)'; ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 24) { const y = top - 18 - Math.abs(Math.sin(x * 0.03 + f * 0.12)) * 26 - Math.sin(x * 0.011 - f * 0.05) * 10; if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.stroke();
  // Spray whipping off the top of it, and junk tumbling in it
  ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
  for (let i = 0; i < 30; i++) {
    const x = x0 + ((i * 97 + f * (6 + (i % 4))) % (x1 - x0)), y = top - 30 - ((i * 37 + f * 2) % 50);
    ctx.fillRect(x, y, 10, 2);
  }
  ctx.fillStyle = '#78350F';
  for (let i = 0; i < 8; i++) {
    const x = x0 + ((i * 211 + f * 4) % (x1 - x0)), y = top + 40 + ((i * 53) % 120);
    ctx.save(); ctx.translate(x, y); ctx.rotate(f * 0.1 + i); ctx.fillRect(-12, -4, 24, 8); ctx.restore();
  }
  // Lightning flickering inside it
  if (hash(Math.floor(f / 6)) > 0.8) { ctx.fillStyle = 'rgba(224, 231, 255, 0.25)'; ctx.fillRect(x0, top, x1 - x0, bottom - top); }
};

export const drawHectorHud = (ctx: Ctx, state: GameState) => {
  const rt = getHector(state)!;
  const b = rt.beach;
  ctx.save();
  ctx.textAlign = 'center';
  // The cops have you boxed in
  // (once the rain's started, the sirens' red and blue flashing's gone; you've still got the cops to kill)
  const raining = b.storm > 0;
  if (b.police === 'fight' || (b.police === 'coming' && b.policeT > 30 && !raining)) {
    const y = 190;
    const text = b.police === 'fight' ? `THE COPS ARE HERE: ${copsLeft(state, b)} LEFT` : 'SIRENS...';
    ctx.font = 'bold 12px "Press Start 2P"';
    ctx.fillStyle = raining ? '#F8FAFC' : Math.floor(state.frame / 12) % 2 ? '#3B82F6' : '#EF4444';
    ctx.fillText(text, CANVAS_WIDTH / 2, y);
  }
  // Held up at the tiki bar
  if (b.lock && state.player.pos.x > b.lock.x - 260) {
    ctx.font = 'bold 10px "Press Start 2P"'; ctx.fillStyle = '#FDE047';
    ctx.fillText('KILL THE COPS TO MOVE ON', CANVAS_WIDTH / 2, 214);
  }
  // Junk about to blow in from the right: an arrow at its height
  for (const d of rt.hazards.debris) {
    if (d.warn <= 0 || Math.floor(state.frame / 5) % 2) continue;
    const y = Math.max(40, Math.min(560, d.y - state.camera.y));
    ctx.fillStyle = '#F97316'; ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH - 44, y); ctx.lineTo(CANVAS_WIDTH - 20, y - 16); ctx.lineTo(CANVAS_WIDTH - 20, y + 16); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
  drawEyeHud(ctx, state, rt.eye);
  // Up the storm: it's rising under you
  if (regionOf(state.player.pos.x) === 'tower' && rt.tower.inT > 30 && rt.tower.inT < RISE_WARNING && Math.floor(state.frame / 10) % 3 !== 0) {
    ctx.save(); ctx.textAlign = 'center'; ctx.font = 'bold 16px "Press Start 2P"';
    ctx.fillStyle = '#000'; ctx.fillText("THE STORM'S RISING! CLIMB!", CANVAS_WIDTH / 2 + 2, 152);
    ctx.fillStyle = '#FDE047'; ctx.fillText("THE STORM'S RISING! CLIMB!", CANVAS_WIDTH / 2, 150);
    ctx.restore();
  }
  drawNews(ctx, state, rt.news);
  // Whiteouts: the jump up to the Eye, and the storm dying
  const flash = Math.max(towerFlash(rt.tower), rt.clearT > 0 ? (rt.clearT < 40 ? rt.clearT / 40 : Math.max(0, 1 - (rt.clearT - 40) / 50)) : 0);
  if (flash > 0) { ctx.fillStyle = `rgba(240, 245, 255, ${flash})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
};

// ---------------------------------------------------------------------------
// Ground and water
// ---------------------------------------------------------------------------

/** The sea, under every stretch of open water (and out past the end of the marina). */
/** Every stretch of sea: the open water between the docks and the water under them. */
const seaStretches = (state: GameState) => {
  const out: { x1: number; x2: number }[] = [];
  const runs = state.groundRuns;
  runs.forEach((r, i) => {
    if (r.pitAfter === 'water') { const next = runs[i + 1]; out.push({ x1: r.x2, x2: next && next.x1 > r.x2 ? next.x1 : COURSE.sea.x2 }); }
    if (r.surface === 'dock') out.push({ x1: r.x1, x2: r.x2 });
  });
  return out;
};

const drawSea = (ctx: Ctx, state: GameState) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  seaStretches(state).forEach(({ x1, x2 }) => {
    if (!visible(state, x1, x2)) return;
    const y = COURSE.sea.y;
    const g = ctx.createLinearGradient(0, y, 0, y + SEA_DEPTH);
    g.addColorStop(0, '#1E4E6E'); g.addColorStop(1, '#0B2A40');
    ctx.fillStyle = g; ctx.fillRect(x1, y, x2 - x1, bottom - y);
    // The bottom: sand, weed, a tyre, somebody's shopping cart
    const floor = y + SEA_DEPTH;
    ctx.fillStyle = '#B79E6B'; ctx.fillRect(x1, floor, x2 - x1, Math.max(0, bottom - floor));
    ctx.fillStyle = '#8C7650'; for (let x = Math.ceil(x1 / 17) * 17; x < x2; x += 17) ctx.fillRect(x, floor + 6 + hash(x) * 20, 3, 2);
    ctx.strokeStyle = '#166534'; ctx.lineWidth = 3;
    for (let x = Math.ceil(x1 / 90) * 90; x < x2; x += 90) { const sway = Math.sin(state.frame * 0.05 + x) * 6; ctx.beginPath(); ctx.moveTo(x, floor); ctx.quadraticCurveTo(x + sway, floor - 25, x - sway, floor - 50 - hash(x) * 30); ctx.stroke(); }
    for (let x = Math.ceil(x1 / 610) * 610; x < x2; x += 610) { ctx.strokeStyle = '#111827'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(x + 200, floor - 8, 16, 8, 0, 0, Math.PI * 2); ctx.stroke(); }
  });
};

/** A rolling surface line over the open water, in front of anything sinking into it. */
const drawWaterFront = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  seaStretches(state).forEach(({ x1, x2 }) => {
    if (!visible(state, x1, x2)) return;
    const y = COURSE.sea.y;
    // The water over whatever's in it (him, swimming), a murky tint deepening toward the bottom
    const g = ctx.createLinearGradient(0, y, 0, y + SEA_DEPTH);
    g.addColorStop(0, 'rgba(30, 78, 110, 0.55)'); g.addColorStop(1, 'rgba(8, 30, 50, 0.35)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x1, y + SEA_DEPTH);
    for (let x = x1; x <= x2; x += 10) ctx.lineTo(x, y + Math.sin(x * 0.04 + f * 0.1) * 4);
    ctx.lineTo(x2, y + SEA_DEPTH); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.8)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = x1; x <= x2; x += 10) { const yy = y + Math.sin(x * 0.04 + f * 0.1) * 4; if (x === x1) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
    ctx.stroke();
  });
};

const SURFACE_LOOK: Record<string, { top: string; body: string; dark: string }> = {
  sand: { top: '#F3E3B5', body: '#E6CF95', dark: '#C9AE70' },
  road: { top: '#4B5563', body: '#374151', dark: '#1F2937' },
  dock: { top: '#A16207', body: '#854D0E', dark: '#5B3A1E' },
  grass: { top: '#65A30D', body: '#7C5A3A', dark: '#4D7C0F' },
  pool: { top: '#7DD3FC', body: '#E0F2FE', dark: '#38BDF8' },
};

const drawGround = (ctx: Ctx, state: GameState) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  for (const r of state.groundRuns) {
    if (!r.surface || !visible(state, r.x1, r.x2)) continue;
    const look = SURFACE_LOOK[r.surface] ?? SURFACE_LOOK.sand;
    const x1 = Math.max(r.x1, state.camera.x - 260), x2 = Math.min(r.x2, state.camera.x + CANVAS_WIDTH + 260);
    const yAt = (x: number) => (r.x2 === r.x1 ? r.y1 : r.y1 + ((x - r.x1) / (r.x2 - r.x1)) * (r.y2 - r.y1));
    if (r.surface === 'dock') {
      // Boardwalk on pilings down into the water, driven into the sea bed
      ctx.fillStyle = look.dark;
      const bed = COURSE.sea.y + SEA_DEPTH + 6;
      for (let x = Math.ceil(x1 / 70) * 70; x < x2; x += 70) ctx.fillRect(x, yAt(x), 10, bed - yAt(x));
      ctx.fillStyle = look.body; ctx.fillRect(x1, yAt(x1), x2 - x1, 14);
      ctx.fillStyle = look.top;
      for (let x = Math.floor(x1 / 26) * 26; x < x2; x += 26) ctx.fillRect(Math.max(x1, x), yAt(x), Math.min(24, x2 - x), 4);
      continue;
    }
    ctx.fillStyle = look.body;
    ctx.beginPath(); ctx.moveTo(x1, yAt(x1)); ctx.lineTo(x2, yAt(x2)); ctx.lineTo(x2, bottom); ctx.lineTo(x1, bottom); ctx.closePath(); ctx.fill();
    ctx.fillStyle = look.top;
    ctx.beginPath(); ctx.moveTo(x1, yAt(x1)); ctx.lineTo(x2, yAt(x2)); ctx.lineTo(x2, yAt(x2) + 8); ctx.lineTo(x1, yAt(x1) + 8); ctx.closePath(); ctx.fill();
    if (r.surface === 'sand') {
      ctx.fillStyle = look.dark;
      for (let x = Math.ceil(x1 / 13) * 13; x < x2; x += 13) ctx.fillRect(x + hash(x) * 6, yAt(x) + 14 + hash(x + 1) * 60, 2, 2);
      // Shells and a footprint or two
      ctx.fillStyle = '#FDF2F8';
      for (let x = Math.ceil(x1 / 170) * 170; x < x2; x += 170) { ctx.beginPath(); ctx.arc(x + hash(x) * 40, yAt(x) + 5, 2.5, Math.PI, 0); ctx.fill(); }
    } else if (r.surface === 'road') {
      // Lane markings, the curb, puddles
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x1, yAt(x1), x2 - x1, 3);
      ctx.fillStyle = '#FACC15';
      for (let x = Math.ceil(x1 / 80) * 80; x < x2; x += 80) ctx.fillRect(x, yAt(x) + 22, 40, 3);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
      for (let x = Math.ceil(x1 / 230) * 230; x < x2; x += 230) { ctx.beginPath(); ctx.ellipse(x + 60, yAt(x) + 34, 30, 4, 0, 0, Math.PI * 2); ctx.fill(); }
    } else if (r.surface === 'grass') {
      ctx.fillStyle = look.dark;
      for (let x = Math.ceil(x1 / 6) * 6; x < x2; x += 6) ctx.fillRect(x, yAt(x) - 2 - hash(x) * 3, 2, 4);
      ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x1, yAt(x1) + 16, x2 - x1, 10); // sidewalk
    } else if (r.surface === 'pool') {
      ctx.fillStyle = '#BAE6FD';
      for (let x = Math.ceil(x1 / 20) * 20; x < x2; x += 20) ctx.fillRect(x, yAt(x), 1, 60);
    }
  }
};

// ---------------------------------------------------------------------------
// Scenery
// ---------------------------------------------------------------------------

const drawProp = (ctx: Ctx, state: GameState, p: Prop, rt: HectorRuntime) => {
  const storm = rt.beach.storm;
  const f = state.frame;
  const sway = storm * Math.sin(f * 0.15 + p.x) * 0.25 - storm * 0.5;
  switch (p.look) {
    case 'umbrella': {
      // (it's a trampoline: bounce on it and it gives; in the storm it shakes and strains, but it holds)
      const idx = COURSE.plats.findIndex(q => q.look === 'umbrella' && Math.abs(q.x + 45 - p.x) < 2);
      const bi = rt.hazards.awningBlocks.findIndex(b => b.tag === `awning-${idx}`);
      const wob = bi >= 0 ? rt.hazards.awningWobble[bi] : 0;
      const give = wob > 0 ? Math.sin(wob * 0.6) * (wob / 24) * 8 : 0;
      ctx.save(); ctx.translate(p.x, p.y + give); ctx.rotate(sway * 0.25 + (storm > 0 ? Math.sin(f * 0.4 + p.x) * 0.05 * storm : 0));
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-1.5, -90, 3, 90);
      ctx.fillStyle = p.color ?? '#F43F5E';
      ctx.beginPath(); ctx.moveTo(-55, -80); ctx.quadraticCurveTo(0, -120, 55, -80); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#F8FAFC';
      for (let i = -2; i <= 2; i += 2) { ctx.beginPath(); ctx.moveTo(i * 11, -80); ctx.quadraticCurveTo(i * 9, -112, 0, -104); ctx.lineTo((i + 1) * 11, -80); ctx.fill(); }
      ctx.restore();
      return;
    }
    case 'net':
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(p.x - 2, p.y - 100, 4, 100);
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.8)'; ctx.lineWidth = 1;
      for (let y = p.y - 98; y < p.y - 60; y += 6) { ctx.beginPath(); ctx.moveTo(p.x - 2, y); ctx.lineTo(p.x + 2, y); ctx.stroke(); }
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(p.x - 4, p.y - 100, 8, 4);
      return;
    case 'palm': {
      const { x: tx, y: ty, lean } = palmTip(p.x, f, storm);
      ctx.save(); ctx.translate(p.x, p.y);
      ctx.strokeStyle = '#7C5A3A'; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(tx * 0.3, ty * 0.6, tx, ty); ctx.stroke();
      ctx.fillStyle = '#15803D';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + lean + Math.sin(f * 0.2 + i) * 0.15 * (0.3 + storm);
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * 40, ty + Math.sin(a) * 20 - 10, tx + Math.cos(a) * 70, ty + Math.sin(a) * 30 + 10); ctx.lineTo(tx + Math.cos(a) * 60, ty + Math.sin(a) * 30 + 16); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = '#78350F'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(tx - 6 + i * 6, ty + 6, 4, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      return;
    }
    case 'tiki':
      ctx.fillStyle = '#92400E'; ctx.fillRect(p.x - 90, p.y - 90, 8, 90); ctx.fillRect(p.x + 82, p.y - 90, 8, 90);
      ctx.fillStyle = '#A16207'; ctx.fillRect(p.x - 90, p.y - 40, 180, 40);
      ctx.fillStyle = '#CA8A04';
      ctx.beginPath(); ctx.moveTo(p.x - 120, p.y - 86); ctx.lineTo(p.x, p.y - 150); ctx.lineTo(p.x + 120, p.y - 86); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#A16207'; ctx.lineWidth = 2;
      for (let i = -110; i < 110; i += 8) { ctx.beginPath(); ctx.moveTo(p.x + i, p.y - 86); ctx.lineTo(p.x + i + 4, p.y - 78); ctx.stroke(); }
      ctx.fillStyle = '#FDE047'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(p.text ?? '', p.x, p.y - 58); ctx.textAlign = 'left';
      return;
    case 'motel': drawMotel(ctx, state, p, storm); return;
    case 'sign': {
      ctx.fillStyle = '#374151'; ctx.fillRect(p.x - 3, p.y - 170, 6, 170);
      const on = Math.floor(f / (6 + hash(p.x) * 20)) % 9 !== 0; // flickering in the storm
      ctx.fillStyle = '#111827'; ctx.fillRect(p.x - 70, p.y - 210, 140, 44);
      ctx.strokeStyle = on ? (p.color ?? '#F43F5E') : '#374151'; ctx.lineWidth = 3; ctx.strokeRect(p.x - 66, p.y - 206, 132, 36);
      ctx.fillStyle = on ? (p.color ?? '#F43F5E') : '#4B5563'; ctx.font = 'bold 11px "Press Start 2P"'; ctx.textAlign = 'center';
      ctx.fillText(p.text ?? '', p.x, p.y - 182); ctx.textAlign = 'left';
      return;
    }
    case 'powerline': {
      // A snapped power pole, its line down in the water, sparking
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-0.25);
      ctx.fillStyle = '#57534E'; ctx.fillRect(-5, -220, 10, 220); ctx.fillRect(-30, -210, 60, 6);
      ctx.restore();
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(p.x - 45, p.y - 205); ctx.quadraticCurveTo(p.x + 20, p.y - 60, p.x + 60, p.y - 2); ctx.stroke();
      if (f % 20 < 6) { ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.arc(p.x + 60, p.y - 4, 5 + (f % 3), 0, Math.PI * 2); ctx.fill(); }
      return;
    }
    case 'pool': {
      // Tiled edge (the water's drawn in front)
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(p.x - 8, p.y - 4, (p.w ?? 300) + 16, 6);
      return;
    }
    case 'yacht': {
      const w = p.w ?? 280;
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath(); ctx.moveTo(p.x, p.y - 90); ctx.lineTo(p.x + w, p.y - 90); ctx.lineTo(p.x + w - 30, p.y + 10); ctx.lineTo(p.x + 20, p.y + 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1E3A8A'; ctx.fillRect(p.x + 10, p.y - 40, w - 30, 6);
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(p.x + 60, p.y - 140, 140, 50);
      ctx.fillStyle = '#0F172A'; for (let i = 0; i < 4; i++) ctx.fillRect(p.x + 70 + i * 32, p.y - 130, 22, 14);
      ctx.fillStyle = '#111827'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillText('REEL DEAL', p.x + 40, p.y - 20);
      return;
    }
  }
};

/** A tacky two-storey motel: pastel stucco, a row of doors, windows, a neon name that flickers in the storm. */
const drawMotel = (ctx: Ctx, state: GameState, p: Prop, storm: number) => {
  const w = p.w ?? 600, h = p.h ?? 260, x = p.x, base = p.y;
  const color = p.color ?? '#5EEAD4';
  ctx.fillStyle = '#FDF2F8'; ctx.fillRect(x, base - h, w, h);
  ctx.fillStyle = color; ctx.fillRect(x, base - h, w, 16); ctx.fillRect(x, base - h / 2 - 8, w, 8);
  // Doors downstairs and up
  for (let dx = 40; dx < w - 40; dx += 90) {
    for (const fy of [base, base - h / 2 + 2]) {
      ctx.fillStyle = color; ctx.fillRect(x + dx, fy - 70, 34, 70);
      ctx.fillStyle = '#FDE047'; ctx.fillRect(x + dx + 26, fy - 38, 4, 4);
      ctx.fillStyle = '#1E3A5F'; ctx.fillRect(x + dx + 44, fy - 60, 30, 26);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(x + dx + 46, fy - 58, 8, 22);
    }
  }
  // The neon name on the roof
  const on = storm < 0.5 || Math.floor(state.frame / (5 + hash(x) * 17)) % 7 !== 0;
  ctx.fillStyle = '#111827'; ctx.fillRect(x + w / 2 - 130, base - h - 50, 260, 44);
  ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillStyle = on ? '#F472B6' : '#4B5563';
  if (on) { ctx.shadowColor = '#F472B6'; ctx.shadowBlur = 10; }
  ctx.fillText(p.text ?? 'MOTEL', x + w / 2, base - h - 20);
  ctx.shadowBlur = 0; ctx.textAlign = 'left';
};

// ---------------------------------------------------------------------------
// Platforms
// ---------------------------------------------------------------------------

const drawPlat = (ctx: Ctx, state: GameState, p: Plat, i: number, rt: HectorRuntime) => {
  const ground = 550;
  switch (p.look) {
    case 'lifeguard':
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(p.x + 8, p.y, 6, ground - p.y); ctx.fillRect(p.x + p.w - 14, p.y, 6, ground - p.y);
      ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.x + 11, p.y + 20); ctx.lineTo(p.x + p.w - 11, ground - 10); ctx.stroke();
      ctx.fillStyle = '#EF4444'; ctx.fillRect(p.x, p.y - 50, p.w, 50);
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(p.x + 8, p.y - 40, p.w - 16, 22);
      ctx.fillStyle = '#EF4444'; ctx.fillRect(p.x + p.w / 2 - 3, p.y - 38, 6, 18); ctx.fillRect(p.x + p.w / 2 - 9, p.y - 32, 18, 6);
      ctx.fillStyle = '#FACC15'; ctx.fillRect(p.x - 6, p.y, p.w + 12, 6);
      return;
    case 'pier':
      ctx.fillStyle = '#5B3A1E';
      for (let x = p.x + 10; x < p.x + p.w; x += 60) ctx.fillRect(x, p.y, 10, COURSE.sea.y - p.y + 60);
      ctx.fillStyle = '#A16207'; ctx.fillRect(p.x, p.y, p.w, 12);
      ctx.fillStyle = '#854D0E'; for (let x = p.x; x < p.x + p.w; x += 22) ctx.fillRect(x, p.y, 2, 12);
      // Broken plank ends
      ctx.fillStyle = '#A16207';
      ctx.beginPath(); ctx.moveTo(p.x + p.w, p.y); ctx.lineTo(p.x + p.w + 14, p.y + 4); ctx.lineTo(p.x + p.w, p.y + 10); ctx.fill();
      return;
    case 'balcony':
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(p.x, p.y, p.w, 10);
      ctx.fillStyle = '#6B7280';
      for (let x = p.x; x <= p.x + p.w; x += 14) ctx.fillRect(x, p.y - 26, 2, 26);
      ctx.fillRect(p.x, p.y - 28, p.w, 3);
      return;
    case 'car': {
      const c = p.color ?? '#DC2626';
      ctx.fillStyle = c; ctx.fillRect(p.x - 20, p.y + 10, p.w + 40, 30);
      ctx.beginPath(); ctx.moveTo(p.x, p.y + 10); ctx.lineTo(p.x + 12, p.y); ctx.lineTo(p.x + p.w - 12, p.y); ctx.lineTo(p.x + p.w, p.y + 10); ctx.fill();
      ctx.fillStyle = '#93C5FD'; ctx.fillRect(p.x + 16, p.y + 3, p.w / 2 - 20, 8); ctx.fillRect(p.x + p.w / 2 + 4, p.y + 3, p.w / 2 - 20, 8);
      ctx.fillStyle = '#111827'; for (const wx of [p.x, p.x + p.w - 8]) { ctx.beginPath(); ctx.arc(wx + 4, p.y + 40, 10, 0, Math.PI * 2); ctx.fill(); }
      return;
    }
    case 'palm':
      // (the frond top the iguanas sit in: the trunk's drawn with the scenery)
      return;
    case 'umbrella':
      // (drawn with the scenery)
      return;
    case 'awning': {
      const idx = rt.hazards.awningBlocks.findIndex(b => b.tag === `awning-${i}`);
      const wob = idx >= 0 ? rt.hazards.awningWobble[idx] : 0;
      const sag = wob > 0 ? Math.sin(wob * 0.6) * (wob / 24) * 8 : 0;
      // Poles, with springs where the canopy sits on them
      ctx.fillStyle = '#374151'; ctx.fillRect(p.x, p.y + 10, 4, 550 - p.y - 10); ctx.fillRect(p.x + p.w - 4, p.y + 10, 4, 550 - p.y - 10);
      ctx.strokeStyle = '#D1D5DB'; ctx.lineWidth = 2;
      for (const sx of [p.x + 2, p.x + p.w - 2]) { ctx.beginPath(); for (let k = 0; k < 5; k++) { ctx.moveTo(sx - 5, p.y + 12 + k * 4 + sag * 0.5); ctx.lineTo(sx + 5, p.y + 14 + k * 4 + sag * 0.5); } ctx.stroke(); }
      // The canopy: bold stripes, a dark outline, a shine along the top
      for (let k = 0; k < 6; k++) {
        ctx.fillStyle = k % 2 ? '#F8FAFC' : (p.color ?? '#F472B6');
        const sx = p.x + (k * p.w) / 6;
        ctx.beginPath(); ctx.moveTo(sx, p.y + sag); ctx.lineTo(sx + p.w / 6, p.y + sag); ctx.lineTo(sx + p.w / 6, p.y + 16 + sag); ctx.quadraticCurveTo(sx + p.w / 12, p.y + 26 + sag, sx, p.y + 16 + sag); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.strokeRect(p.x, p.y + sag, p.w, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(p.x + 3, p.y + 2 + sag, p.w - 6, 2);
      // Bouncing arrows over every one: it's for jumping on
      const hop = Math.abs(Math.sin(state.frame * 0.12 + i)) * 8;
      ctx.fillStyle = '#FDE047'; ctx.strokeStyle = '#78350F'; ctx.lineWidth = 1.5;
      for (const k of [0, 1]) {
        const ay = p.y - 22 - hop - k * 12;
        ctx.beginPath(); ctx.moveTo(p.x + p.w / 2, ay - 10); ctx.lineTo(p.x + p.w / 2 - 12, ay + 2); ctx.lineTo(p.x + p.w / 2 - 6, ay + 2); ctx.lineTo(p.x + p.w / 2, ay - 4); ctx.lineTo(p.x + p.w / 2 + 6, ay + 2); ctx.lineTo(p.x + p.w / 2 + 12, ay + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      void AWNING_BOUNCE;
      return;
    }
    case 'boat':
      ctx.fillStyle = '#CBD5E1'; ctx.fillRect(p.x, p.y, p.w, 8);
      return;
    default:
      ctx.fillStyle = '#854D0E'; ctx.fillRect(p.x, p.y, p.w, 14);
  }
};

const drawFloats = (ctx: Ctx, state: GameState, rt: HectorRuntime) => {
  for (const b of rt.hazards.floatBlocks) {
    if (!visible(state, b.x, b.x + b.w)) continue;
    ctx.fillStyle = '#2563EB';
    for (let x = b.x + 12; x < b.x + b.w - 10; x += 34) { ctx.beginPath(); ctx.ellipse(x + 8, b.y + 16, 12, 9, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#A16207'; ctx.fillRect(b.x, b.y, b.w, 10);
    ctx.fillStyle = '#854D0E'; for (let x = b.x; x < b.x + b.w; x += 18) ctx.fillRect(x, b.y, 2, 10);
  }
};

const drawShocks = (ctx: Ctx, state: GameState) => {
  for (const z of COURSE.shocks) {
    if (!visible(state, z.x1, z.x2)) continue;
    const { live, warning } = shockPhase(z, state.frame);
    // Standing water, going electric
    ctx.fillStyle = live ? `rgba(253, 224, 71, ${0.35 + 0.25 * Math.sin(state.frame * 0.8)})` : 'rgba(56, 189, 248, 0.45)';
    ctx.fillRect(z.x1, z.y - 3, z.x2 - z.x1, 6);
    if (live) {
      ctx.strokeStyle = '#FEF9C3'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = z.x1; x < z.x2; x += 30) { const j = (state.frame * 7 + x) % 11; ctx.moveTo(x, z.y - 2); ctx.lineTo(x + 8, z.y - 10 - j); ctx.lineTo(x + 15, z.y - 2); }
      ctx.stroke();
    } else if (warning && Math.floor(state.frame / 4) % 2 === 0) {
      ctx.fillStyle = '#FDE047'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
      ctx.fillText('! LIVE WIRE !', (z.x1 + z.x2) / 2, z.y - 30); ctx.textAlign = 'left';
      for (let k = 0; k < 4; k++) { const x = z.x1 + hash(state.frame + k) * (z.x2 - z.x1); ctx.fillStyle = '#FDE047'; ctx.fillRect(x, z.y - 6, 3, 3); }
    }
  }
};

/** Junk in the wind: a folding beach chair, a beach umbrella, a trash can, a cooler. */
export const drawDebris = (ctx: Ctx, x: number, y: number, rot: number, look: string, size: number) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const s = size / 2;
  switch (look) {
    case 'chair':
      ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-s, s); ctx.lineTo(s * 0.4, -s); ctx.moveTo(-s * 0.2, s); ctx.lineTo(s, -s * 0.2); ctx.stroke();
      ctx.fillStyle = '#F43F5E'; ctx.fillRect(-s * 0.7, -s * 0.5, s * 1.2, s * 0.8);
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-s * 0.7, -s * 0.2, s * 1.2, s * 0.2);
      break;
    case 'umbrella':
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-1.5, -s, 3, s * 2);
      ctx.fillStyle = '#22D3EE'; ctx.beginPath(); ctx.moveTo(-s, -s * 0.2); ctx.quadraticCurveTo(0, -s * 1.3, s, -s * 0.2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.2); ctx.quadraticCurveTo(0, -s * 1.1, s * 0.3, -s * 0.2); ctx.fill();
      break;
    case 'trashcan':
      ctx.fillStyle = '#4B5563'; ctx.fillRect(-s * 0.7, -s, s * 1.4, s * 2);
      ctx.fillStyle = '#6B7280'; ctx.fillRect(-s * 0.8, -s, s * 1.6, 4);
      ctx.fillStyle = '#374151'; for (let i = -1; i <= 1; i++) ctx.fillRect(i * s * 0.4 - 1, -s + 6, 2, s * 1.7);
      break;
    default:
      ctx.fillStyle = '#2563EB'; ctx.fillRect(-s, -s * 0.6, s * 2, s * 1.2);
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-s, -s * 0.6, s * 2, 5);
  }
  ctx.restore();
};

const drawPoliceCruiser = (ctx: Ctx, state: GameState, rt: HectorRuntime) => {
  const b = rt.beach;
  if (b.police !== 'coming' && b.police !== 'fight' && b.police !== 'done') return;
  if (!b.cruiserX) return;
  const x = b.cruiserX, y = 550;
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 70, y - 40, 150, 26);
  ctx.fillStyle = '#111827'; ctx.fillRect(x - 70, y - 26, 150, 6);
  ctx.beginPath(); ctx.moveTo(x - 40, y - 40); ctx.lineTo(x - 26, y - 62); ctx.lineTo(x + 40, y - 62); ctx.lineTo(x + 56, y - 40); ctx.fillStyle = '#F8FAFC'; ctx.fill();
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(x - 22, y - 58, 28, 16); ctx.fillRect(x + 10, y - 58, 26, 16);
  ctx.fillStyle = '#1E3A8A'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillText('POLICE', x - 36, y - 18);
  // (the light bar goes dark once it's raining, or once the cops are all dead)
  const lit = b.storm <= 0 && b.police !== 'done';
  const blink = lit && Math.floor(state.frame / 6) % 2;
  ctx.fillStyle = !lit ? '#7F1D1D' : blink ? '#EF4444' : '#3B82F6'; ctx.fillRect(x - 6, y - 70, 10, 8);
  ctx.fillStyle = !lit ? '#1E3A8A' : blink ? '#3B82F6' : '#EF4444'; ctx.fillRect(x + 6, y - 70, 10, 8);
  ctx.fillStyle = '#111827'; for (const wx of [x - 44, x + 50]) { ctx.beginPath(); ctx.arc(wx, y - 10, 11, 0, Math.PI * 2); ctx.fill(); }
  if (blink) { ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'; ctx.fillRect(state.camera.x, state.camera.y, CANVAS_WIDTH, CANVAS_HEIGHT); }
};

// ---------------------------------------------------------------------------
// The storm tower's eye wall (drawn flat; the renderer wraps it round)
// ---------------------------------------------------------------------------

const drawEyeWall = (ctx: Ctx, state: GameState) => {
  const C = TOWER.circumference;
  const x0 = state.camera.x - 600, x1 = state.camera.x + CANVAS_WIDTH + 600;
  const top = state.camera.y - 20, h = CANVAS_HEIGHT + 40;
  const g = ctx.createLinearGradient(0, top, 0, top + h);
  g.addColorStop(0, '#26324F'); g.addColorStop(1, '#141B30');
  ctx.fillStyle = g; ctx.fillRect(x0, top, x1 - x0, h);
  // Streaks of rain and cloud whirling down the wall (they repeat every lap, so the wrap's seamless)
  const f = state.frame;
  for (let k = Math.floor((x0 - TOWER.x0) / (C / 24)) - 1; k * (C / 24) + TOWER.x0 < x1; k++) {
    const x = TOWER.x0 + k * (C / 24);
    const seed = ((k % 24) + 24) % 24;
    ctx.fillStyle = seed % 3 === 0 ? 'rgba(148, 163, 184, 0.18)' : 'rgba(71, 85, 105, 0.3)';
    const w = 18 + hash(seed) * 30;
    const slide = (f * (2 + hash(seed + 5) * 3) + hash(seed) * 600) % 600;
    for (let y = top - 600 + slide; y < top + h; y += 300) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + 20); ctx.lineTo(x + w - 20, y + 260); ctx.lineTo(x - 20, y + 240); ctx.closePath(); ctx.fill();
    }
  }
  // The floor of the storm: a churning ring of water at the bottom
  if (state.camera.y + CANVAS_HEIGHT > TOWER.floorY - 20) {
    ctx.fillStyle = '#1E3A5F'; ctx.fillRect(x0, TOWER.floorY, x1 - x0, 200);
    ctx.fillStyle = '#E0F2FE';
    for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) ctx.fillRect(x + ((f * 3) % 30), TOWER.floorY + Math.sin(x * 0.1 + f * 0.2) * 3, 16, 3);
  }
};

void clamp01;
