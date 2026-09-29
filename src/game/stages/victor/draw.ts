// Drawing Victor's stage: the sky on the trail (the volcano looming bigger and
// nearer as the path curves round toward it), the club at its foot, the cave
// inside, the shaft, the lava, the hazards, and the HUD (the doorman, the
// clashes, the fade through the club doors, the lounge's wide shot).

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { COURSE, isLava } from './course';
import { getVictor, regionOf, enterFade } from './runtime';
import { ventPhase, VENT_HEIGHT, VENT_HALF_WIDTH, BOMB_WARN, BOMB_RADIUS, jetPhase, JET_WARN, barBalls } from './hazards';
import { drawDoormanCorpse, drawDoormanHud, drawClashingMeathead } from './doormanDraw';
import { drawLoungeBack, drawLoungeFront, drawWideShot, drawLoungeHud, drawAftermathFade } from './loungeDraw';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;

// ---------------------------------------------------------------------------
// Sky
// ---------------------------------------------------------------------------

export const drawVictorBackdrop = (ctx: Ctx, state: GameState): boolean => {
  const region = regionOf(state.camera.x + 400);
  if (region === 'inside') { drawCave(ctx, state); return true; }
  if (region === 'lounge') { ctx.fillStyle = '#0B0612'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return true; }
  drawTrailSky(ctx, state);
  return true;
};

/** How far along the trail the camera is (0 at the start, 1 at the foot of the volcano). */
const approach = (state: GameState) => clamp01((state.camera.x + 400 - COURSE.approach.x1) / (COURSE.approach.x2 - COURSE.approach.x1));

const drawTrailSky = (ctx: Ctx, state: GameState) => {
  const k = approach(state), f = state.frame;
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1F0A1A'); g.addColorStop(0.45, '#6B1A1A'); g.addColorStop(0.8, '#D9541F'); g.addColorStop(1, '#F59E0B');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // A smudge of ash across the sky, thicker the closer you get
  ctx.fillStyle = `rgba(30, 20, 20, ${0.2 + k * 0.3})`;
  for (let i = 0; i < 6; i++) { const x = ((i * 190 - f * 0.2 - state.camera.x * 0.02) % (W + 300) + W + 300) % (W + 300) - 150; ctx.beginPath(); ctx.ellipse(x, 60 + (i % 3) * 40, 200, 30, 0, 0, Math.PI * 2); ctx.fill(); }
  // Far ridges
  const horizon = 430 - Math.max(-60, Math.min(60, state.camera.y * 0.04));
  ridge(ctx, horizon + 10, 0.03, '#3B1414', 40, 11, state.camera.x);
  // The volcano: off to the right and small at first; as the trail curves round it swings in and looms
  const s = 0.35 + k * 1.45;
  const cx = W * (1.02 - k * 0.52);
  drawVolcano(ctx, cx, horizon + 30, s, f, k);
  // Nearer ridges in front of its foot
  ridge(ctx, horizon + 60, 0.08, '#240C0C', 60, 23, state.camera.x);
  ridge(ctx, horizon + 110, 0.14, '#160707', 50, 37, state.camera.x);
  // Ash coming down
  ctx.fillStyle = 'rgba(210, 200, 190, 0.5)';
  for (let i = 0; i < 40; i++) {
    const x = ((hash(i) * W + f * (0.3 + hash(i + 3)) - state.camera.x * 0.3) % W + W) % W, y = (hash(i + 7) * H + f * (0.6 + hash(i + 9) * 0.6)) % H;
    ctx.fillRect(x, y, 2, 2);
  }
};

const ridge = (ctx: Ctx, base: number, parallax: number, color: string, amp: number, seed: number, camX: number) => {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, CANVAS_HEIGHT);
  for (let x = 0; x <= CANVAS_WIDTH + 20; x += 20) {
    const wx = x + camX * parallax;
    ctx.lineTo(x, base - amp * (0.5 + 0.5 * Math.sin(wx * 0.011 + seed) * Math.cos(wx * 0.004 + seed * 2)));
  }
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT); ctx.closePath(); ctx.fill();
};

/** The volcano: a dark cone, glowing streams down its flanks, the crater lit from inside, and a plume of smoke. */
export const drawVolcano = (ctx: Ctx, cx: number, base: number, s: number, f: number, k: number) => {
  const h = 280 * s, half = 360 * s, crater = 54 * s;
  const top = base - h;
  // Smoke plume, rolling up and drifting
  for (let i = 0; i < 9; i++) {
    const t = ((f * 0.4 + i * 30) % 270) / 270;
    const r = (20 + t * 70) * s;
    ctx.fillStyle = `rgba(${40 + i * 4}, ${30 + i * 3}, ${30 + i * 3}, ${0.55 * (1 - t)})`;
    ctx.beginPath(); ctx.arc(cx + Math.sin(t * 3 + i) * 20 * s + t * 80 * s, top - t * 220 * s, r, 0, Math.PI * 2); ctx.fill();
  }
  // Cone
  const g = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
  g.addColorStop(0, '#1A0A08'); g.addColorStop(0.5, '#3A1812'); g.addColorStop(1, '#140706');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(cx - half, base); ctx.lineTo(cx - crater, top); ctx.lineTo(cx + crater, top); ctx.lineTo(cx + half, base); ctx.closePath(); ctx.fill();
  // The crater, glowing
  const cg = ctx.createRadialGradient(cx, top, 2, cx, top, crater * 1.8);
  cg.addColorStop(0, 'rgba(254, 240, 138, 0.95)'); cg.addColorStop(0.4, 'rgba(249, 115, 22, 0.6)'); cg.addColorStop(1, 'rgba(249, 115, 22, 0)');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, top, crater * 1.8, 0, Math.PI * 2); ctx.fill();
  // Lava running down the flanks
  ctx.strokeStyle = `rgba(249, 115, 22, ${0.75 + 0.2 * Math.sin(f * 0.05)})`; ctx.lineWidth = Math.max(2, 5 * s);
  for (const [dx, bend] of [[-0.5, -0.3], [0.3, 0.25], [0.7, 0.1]] as [number, number][]) {
    ctx.beginPath(); ctx.moveTo(cx + dx * crater, top + 4);
    ctx.quadraticCurveTo(cx + dx * half * 0.4 + bend * half * 0.4, top + h * 0.5, cx + dx * half * 0.75, base - 6);
    ctx.stroke();
  }
  // Now and then it spits (bombs arcing up out of the crater)
  for (let i = 0; i < 3; i++) {
    const t = ((f + i * 70) % 210) / 60;
    if (t > 1) continue;
    const bx = cx + (i - 1) * 40 * s * t * 3, by = top - Math.sin(t * Math.PI) * 120 * s;
    ctx.fillStyle = '#FB923C'; ctx.beginPath(); ctx.arc(bx, by, 3 * s + 2, 0, Math.PI * 2); ctx.fill();
  }
  void k;
};

/** Inside the volcano: black rock lit red from below, stalactites, embers going up. */
const drawCave = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  g.addColorStop(0, '#080304'); g.addColorStop(0.6, '#1F0806'); g.addColorStop(1, '#5A160A');
  ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // Rock columns far back
  ctx.fillStyle = '#140605';
  for (let i = 0; i < 12; i++) {
    const x = ((i * 137 - state.camera.x * 0.1) % 1100 + 1100) % 1100 - 150, w = 40 + hash(i) * 60;
    ctx.fillRect(x, 0, w, CANVAS_HEIGHT);
  }
  // Stalactites
  ctx.fillStyle = '#0C0404';
  for (let i = 0; i < 16; i++) {
    const x = ((i * 83 - state.camera.x * 0.2) % 1000 + 1000) % 1000 - 100, len = 30 + hash(i + 5) * 90;
    ctx.beginPath(); ctx.moveTo(x - 14, 0); ctx.lineTo(x, len); ctx.lineTo(x + 14, 0); ctx.fill();
  }
  // Embers
  for (let i = 0; i < 30; i++) {
    const x = (hash(i) * CANVAS_WIDTH + Math.sin(f * 0.02 + i) * 20 - state.camera.x * 0.25 + 4000) % CANVAS_WIDTH;
    const y = CANVAS_HEIGHT - ((f * (0.5 + hash(i + 2)) + hash(i + 4) * CANVAS_HEIGHT) % CANVAS_HEIGHT);
    ctx.fillStyle = i % 3 ? '#F97316' : '#FDE047'; ctx.fillRect(x, y, 2, 2);
  }
};

// ---------------------------------------------------------------------------
// World: behind everything that moves
// ---------------------------------------------------------------------------

export const drawVictorBack = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'main') drawClub(ctx, state, rt.doorman.phase === 'dead');
  if (region === 'inside') drawShaftWalls(ctx, state);
  if (region === 'lounge' || rt.lounge.phase === 'crash') drawLoungeBack(ctx, state, rt.lounge);
};

/** Club Caldera: a slab of black basalt set into the foot of the volcano, a neon sign, a red carpet and a velvet rope. */
const drawClub = (ctx: Ctx, state: GameState, open: boolean) => {
  const C = COURSE.club, f = state.frame;
  if (!visible(state, C.x1 - 400, C.door + 300)) return;
  const y = C.y;
  // The front of it, and the rock it's cut into
  ctx.fillStyle = '#140908'; ctx.fillRect(C.door - 260, y - 560, 560, 560);
  ctx.fillStyle = '#1F0E0B'; ctx.fillRect(C.door - 200, y - 420, 440, 420);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = '#2A1410'; ctx.fillRect(C.door - 200 + i * 55, y - 420, 3, 420); }
  // The doors: black lacquer with brass handles; open, there's light and bass inside
  const dx = C.door - 20, dw = 130, dh = 190;
  if (open) {
    const g = ctx.createLinearGradient(dx, y - dh, dx, y);
    g.addColorStop(0, '#7C3AED'); g.addColorStop(1, '#EC4899');
    ctx.fillStyle = g; ctx.fillRect(dx, y - dh, dw, dh);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; for (let i = 0; i < 4; i++) ctx.fillRect(dx + ((f * 3 + i * 40) % dw), y - dh, 6, dh);
    ctx.fillStyle = '#0A0505'; ctx.fillRect(dx - 30, y - dh, 30, dh); ctx.fillRect(dx + dw, y - dh, 30, dh);
  } else {
    ctx.fillStyle = '#0A0505'; ctx.fillRect(dx, y - dh, dw, dh);
    ctx.fillStyle = '#1C1917'; ctx.fillRect(dx + dw / 2 - 1, y - dh, 2, dh);
    ctx.fillStyle = '#CA8A04'; ctx.fillRect(dx + dw / 2 - 12, y - dh / 2, 6, 18); ctx.fillRect(dx + dw / 2 + 6, y - dh / 2, 6, 18);
  }
  // The sign: big pink neon over the door, flickering a little
  const on = Math.floor(f / 7) % 23 !== 0;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.shadowColor = '#EC4899'; ctx.shadowBlur = on ? 22 : 4;
  ctx.fillStyle = on ? '#FBCFE8' : '#9D174D';
  ctx.font = 'bold 24px "Press Start 2P"';
  ctx.fillText('CLUB CALDERA', C.door + 45, y - 300);
  ctx.shadowColor = '#22D3EE'; ctx.shadowBlur = on ? 16 : 3;
  ctx.fillStyle = on ? '#CFFAFE' : '#155E75';
  ctx.font = 'bold 12px "Press Start 2P"';
  ctx.fillText('MEMBERS ONLY', C.door + 45, y - 260);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FDE68A'; ctx.font = '8px "Press Start 2P"';
  ctx.fillText('STRICTLY NO SHIRTLESS GUESTS', C.door + 45, y - 236);
  ctx.restore();
  // Red carpet to the door, velvet rope on brass posts
  ctx.fillStyle = '#991B1B'; ctx.fillRect(C.door - 320, y - 3, 340, 5);
  const ropeX = C.door - 300;
  ctx.fillStyle = '#CA8A04';
  for (const px of [ropeX, ropeX + 120]) { ctx.fillRect(px - 3, y - 50, 6, 50); ctx.beginPath(); ctx.arc(px, y - 52, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(px - 9, y - 4, 18, 4); }
  ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(ropeX, y - 44); ctx.quadraticCurveTo(ropeX + 60, y - 22, ropeX + 120, y - 44); ctx.stroke();
};

/** The shaft: rock walls with glowing seams, pipes and furnace grilles, and the lit window near the top. */
const drawShaftWalls = (ctx: Ctx, state: GameState) => {
  const S = COURSE.shaft, f = state.frame;
  if (!visible(state, S.x1 - 200, S.x2 + 200)) return;
  const top = Math.max(S.top - 520, state.camera.y - 20), bottom = Math.min(S.floor + 200, state.camera.y + CANVAS_HEIGHT + 20);
  // Back wall of the chimney: darker, with pipes running up it
  ctx.fillStyle = 'rgba(20, 8, 6, 0.85)'; ctx.fillRect(S.x1, top, S.x2 - S.x1, bottom - top);
  for (const px of [S.x1 + 120, S.x1 + 420, S.x2 - 90]) {
    ctx.fillStyle = '#3F2A22'; ctx.fillRect(px, top, 14, bottom - top);
    ctx.fillStyle = '#57382D'; ctx.fillRect(px + 2, top, 3, bottom - top);
    for (let y = Math.ceil(top / 160) * 160; y < bottom; y += 160) { ctx.fillStyle = '#2A1B16'; ctx.fillRect(px - 3, y, 20, 8); }
  }
  // Furnace grilles glowing in the back wall
  for (let y = Math.ceil((top - S.floor) / 400) * 400 + S.floor; y < bottom; y += 400) {
    const gx = S.x1 + 250 + (hash(y) - 0.5) * 200;
    ctx.fillStyle = '#1C1917'; ctx.fillRect(gx - 40, y - 60, 80, 50);
    const glow = 0.5 + 0.5 * Math.sin(f * 0.08 + y);
    ctx.fillStyle = `rgba(249, 115, 22, ${0.5 + glow * 0.4})`;
    for (let i = 0; i < 5; i++) ctx.fillRect(gx - 34 + i * 15, y - 54, 9, 38);
  }
  // The side walls themselves
  for (const [x, w] of [[S.x1 - 60, 60], [S.x2, 60]] as [number, number][]) {
    ctx.fillStyle = '#1A0A07'; ctx.fillRect(x, top, w, bottom - top);
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.7)'; ctx.lineWidth = 2;
    for (let y = Math.ceil(top / 70) * 70; y < bottom; y += 70) { ctx.beginPath(); ctx.moveTo(x + 10, y); ctx.lineTo(x + 30, y + 20 + hash(y + x) * 20); ctx.lineTo(x + 50, y + 34); ctx.stroke(); }
  }
  // The opening at the foot of the left wall (where the river comes in) stays dark
  ctx.fillStyle = '#0A0404'; ctx.fillRect(S.x1 - 60, S.floor - 170, 60, 170);
  // The window at the top of the right wall: warm light and silhouettes moving behind the glass
  const w = S.window;
  if (w.y > state.camera.y - 200 && w.y < state.camera.y + CANVAS_HEIGHT + 200) {
    const g = ctx.createLinearGradient(w.x - 20, w.y - 60, w.x - 20, w.y + 60);
    g.addColorStop(0, '#A855F7'); g.addColorStop(1, '#EC4899');
    ctx.fillStyle = g; ctx.fillRect(w.x - 10, w.y - 60, 60, 120);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    for (let i = 0; i < 2; i++) { const sx = w.x + 5 + ((f * 0.4 + i * 30) % 40); ctx.fillRect(sx, w.y - 20, 10, 60); ctx.beginPath(); ctx.arc(sx + 5, w.y - 26, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#CA8A04'; ctx.lineWidth = 4; ctx.strokeRect(w.x - 10, w.y - 60, 60, 120);
    ctx.fillStyle = '#FDE68A'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('VIP', w.x + 20, w.y - 68); ctx.textAlign = 'left';
    // Bass thumping out of it
    if (Math.floor(f / 15) % 2) { ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w.x - 10, w.y, 30, Math.PI * 0.6, Math.PI * 1.4); ctx.stroke(); }
  }
};

// ---------------------------------------------------------------------------
// World: over the terrain, behind the enemies
// ---------------------------------------------------------------------------

export const drawVictorMid = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state)!;
  drawLava(ctx, state);
  drawLedges(ctx, state);
  drawRafts(ctx, state);
  drawVents(ctx, state);
  drawJets(ctx, state);
  drawBars(ctx, state);
  drawBombs(ctx, state);
  if (rt.doorman.corpse) drawDoormanCorpse(ctx, rt.doorman.corpse, state.frame);
};

const drawLava = (ctx: Ctx, state: GameState) => {
  const f = state.frame, bottom = state.camera.y + CANVAS_HEIGHT + 60;
  for (const r of state.groundRuns) {
    if (!isLava(r) || !visible(state, r.x1, r.x2)) continue;
    const x1 = Math.max(r.x1, state.camera.x - 260), x2 = Math.min(r.x2, state.camera.x + CANVAS_WIDTH + 260);
    const y = r.y1;
    // The glow above it
    const glow = ctx.createLinearGradient(0, y - 40, 0, y);
    glow.addColorStop(0, 'rgba(249, 115, 22, 0)'); glow.addColorStop(1, 'rgba(249, 115, 22, 0.22)');
    ctx.fillStyle = glow; ctx.fillRect(x1, y - 40, x2 - x1, 40);
    // The lava: bright at the top, darker crust rolling in it
    const g = ctx.createLinearGradient(0, y, 0, y + 120);
    g.addColorStop(0, '#FDE047'); g.addColorStop(0.15, '#F97316'); g.addColorStop(0.6, '#B91C1C'); g.addColorStop(1, '#450A0A');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x1, bottom);
    for (let x = x1; x <= x2; x += 10) ctx.lineTo(x, y + Math.sin(x * 0.05 + f * 0.08) * 3);
    ctx.lineTo(x2, bottom); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(69, 10, 10, 0.55)';
    for (let x = Math.ceil(x1 / 60) * 60; x < x2; x += 60) { const cx = x + ((f * 0.5 + hash(x) * 60) % 60); ctx.beginPath(); ctx.ellipse(cx, y + 14 + hash(x) * 20, 18, 4, 0, 0, Math.PI * 2); ctx.fill(); }
    // Bubbles popping
    ctx.fillStyle = '#FEF08A';
    for (let x = Math.ceil(x1 / 90) * 90; x < x2; x += 90) { const t = (f + hash(x) * 60) % 60; if (t < 12) { ctx.beginPath(); ctx.arc(x + hash(x + 1) * 60, y - t * 0.6, 3 + t * 0.3, 0, Math.PI * 2); ctx.fill(); } }
  }
};

const drawLedges = (ctx: Ctx, state: GameState) => {
  for (const l of COURSE.ledges) {
    if (!visible(state, l.x, l.x + l.w) || l.y < state.camera.y - 40 || l.y > state.camera.y + CANVAS_HEIGHT + 40) continue;
    if (l.look === 'catwalk') {
      // Steel grating on brackets out of the wall
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(l.x, l.y, l.w, 8);
      ctx.fillStyle = '#18181B'; for (let x = l.x + 4; x < l.x + l.w - 4; x += 8) ctx.fillRect(x, l.y + 2, 4, 4);
      ctx.fillStyle = '#A1A1AA'; ctx.fillRect(l.x, l.y, l.w, 2);
      ctx.fillStyle = '#27272A'; ctx.fillRect(l.x + 10, l.y + 8, 5, 18); ctx.fillRect(l.x + l.w - 15, l.y + 8, 5, 18);
      ctx.fillStyle = '#FACC15'; for (let x = l.x; x < l.x + l.w; x += 20) ctx.fillRect(x, l.y - 2, 10, 2);
    } else {
      // A slab of basalt with a lip of glowing cracks
      ctx.fillStyle = '#2A1410'; ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.x + l.w, l.y); ctx.lineTo(l.x + l.w - 10, l.y + 22); ctx.lineTo(l.x + 12, l.y + 26); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1A0B08'; ctx.fillRect(l.x, l.y, l.w, 5);
      ctx.fillStyle = '#F97316'; for (let x = l.x + 6; x < l.x + l.w - 6; x += 16) ctx.fillRect(x + hash(x) * 6, l.y + 2, 4, 2);
    }
  }
};

const drawRafts = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state)!;
  for (const r of rt.hazards.rafts) {
    const b = r.block;
    if (r.t > 0 || !visible(state, b.x, b.x + b.w)) continue;
    ctx.fillStyle = '#1C1917';
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.w, b.y); ctx.lineTo(b.x + b.w - 8, b.y + 18); ctx.lineTo(b.x + 10, b.y + 20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#44403C'; ctx.fillRect(b.x + 4, b.y, b.w - 8, 3);
    ctx.fillStyle = 'rgba(249, 115, 22, 0.9)'; ctx.fillRect(b.x, b.y + 14, b.w, 3);
  }
};

const drawVents = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  for (const v of COURSE.vents) {
    if (!visible(state, v.x - 60, v.x + 60)) continue;
    const ph = ventPhase(v, f);
    // The crack (a lava spout's just a patch of bubbling)
    if (!v.lava) { ctx.fillStyle = '#0A0404'; ctx.beginPath(); ctx.ellipse(v.x, v.y + 1, 22, 5, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = `rgba(249, 115, 22, ${ph.warning ? 0.9 : 0.35})`;
    ctx.beginPath(); ctx.ellipse(v.x, v.y, 14 + (ph.warning ? Math.sin(f * 0.8) * 3 : 0), 3, 0, 0, Math.PI * 2); ctx.fill();
    if (ph.warning && v.lava) drawSpoutWarning(ctx, v.x, v.y, ph.t / ph.warn, f);
    else if (ph.warning) {
      // Smoke and sparks: it's about to go
      for (let i = 0; i < 4; i++) {
        const t = ((f * 2 + i * 13) % 40) / 40;
        ctx.fillStyle = `rgba(120, 113, 108, ${0.6 * (1 - t)})`; ctx.beginPath(); ctx.arc(v.x + Math.sin(i * 2 + f * 0.1) * 8, v.y - t * 60, 5 + t * 10, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#FDE047'; ctx.fillRect(v.x - 8 + (f * 7) % 16, v.y - 10 - (f * 3) % 20, 2, 2);
    }
    if (ph.burning) {
      const k = Math.min(1, ph.t < ph.warn + 6 ? (ph.t - ph.warn + 1) / 6 : 1);
      const hgt = VENT_HEIGHT * k;
      const g = ctx.createLinearGradient(0, v.y - hgt, 0, v.y);
      g.addColorStop(0, 'rgba(254, 240, 138, 0)'); g.addColorStop(0.3, 'rgba(253, 186, 116, 0.85)'); g.addColorStop(1, v.lava ? 'rgba(234, 88, 12, 0.95)' : 'rgba(254, 240, 138, 0.95)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(v.x - VENT_HALF_WIDTH, v.y);
      for (let y = 0; y <= hgt; y += 12) ctx.lineTo(v.x - VENT_HALF_WIDTH * (1 - y / hgt * 0.5) + Math.sin(f * 0.5 + y) * 4, v.y - y);
      for (let y = hgt; y >= 0; y -= 12) ctx.lineTo(v.x + VENT_HALF_WIDTH * (1 - y / hgt * 0.5) + Math.sin(f * 0.5 + y + 2) * 4, v.y - y);
      ctx.closePath(); ctx.fill();
    }
  }
};

/**
 * A lava spout about to go (k: 0 to 1 through the warning): the lava swells up in a glowing dome and boils, spatter
 * jumps off it, and the column it's about to throw up shows as a shimmer of heat, brighter the closer it gets.
 */
const drawSpoutWarning = (ctx: Ctx, x: number, y: number, k: number, f: number) => {
  const late = k > 0.7;
  const pulse = 0.5 + 0.5 * Math.sin(f * (late ? 1.1 : 0.5));
  // The column to come: a heat shimmer where it'll be, the full height of it
  ctx.save();
  const a = (0.1 + 0.3 * k) * (0.6 + 0.4 * pulse);
  const g = ctx.createLinearGradient(0, y - VENT_HEIGHT, 0, y);
  g.addColorStop(0, 'rgba(253, 186, 116, 0)'); g.addColorStop(0.5, `rgba(251, 146, 60, ${a * 0.6})`); g.addColorStop(1, `rgba(249, 115, 22, ${a})`);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - VENT_HALF_WIDTH, y);
  for (let yy = 0; yy <= VENT_HEIGHT; yy += 14) ctx.lineTo(x - VENT_HALF_WIDTH * (1 - yy / VENT_HEIGHT * 0.5) + Math.sin(f * 0.3 + yy * 0.1) * 3, y - yy);
  for (let yy = VENT_HEIGHT; yy >= 0; yy -= 14) ctx.lineTo(x + VENT_HALF_WIDTH * (1 - yy / VENT_HEIGHT * 0.5) + Math.sin(f * 0.3 + yy * 0.1 + 2) * 3, y - yy);
  ctx.closePath(); ctx.fill();
  // Its edges, dashed, flickering in the last moments
  if (late && f % 6 < 4) {
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -f * 2;
    ctx.beginPath(); ctx.moveTo(x - VENT_HALF_WIDTH, y); ctx.lineTo(x - VENT_HALF_WIDTH * 0.5, y - VENT_HEIGHT); ctx.moveTo(x + VENT_HALF_WIDTH, y); ctx.lineTo(x + VENT_HALF_WIDTH * 0.5, y - VENT_HEIGHT); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
  // The lava swelling up: a dome, bigger and brighter as it comes
  const r = 16 + 22 * k, h = 4 + 16 * k + (late ? pulse * 4 : 0);
  ctx.fillStyle = '#7C2D12'; ctx.beginPath(); ctx.ellipse(x, y + 2, r + 4, h * 0.5 + 3, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = late ? (f % 8 < 4 ? '#FDE047' : '#FB923C') : '#EA580C';
  ctx.beginPath(); ctx.ellipse(x, y + 2, r, h, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = 'rgba(254, 240, 138, 0.8)'; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y + 2 - h * 0.55, r * 0.35, h * 0.25, 0, 0, Math.PI * 2); ctx.fill();
  // Boiling: bubbles swelling and popping round it
  for (let i = 0; i < 5; i++) {
    const bt = ((f + i * 11) % 24) / 24;
    const bx = x + Math.sin(i * 2.3) * (r + 6);
    ctx.strokeStyle = `rgba(253, 224, 71, ${0.9 * (1 - bt)})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(bx, y - 1, 2 + bt * 6 * (0.5 + k), Math.PI, 0); ctx.stroke();
  }
  // Spatter, higher as it comes
  for (let i = 0; i < 3 + Math.floor(k * 5); i++) {
    const st = ((f * 1.5 + i * 17) % 30) / 30;
    const sx = x + Math.sin(i * 1.7 + Math.floor((f + i * 17) / 30)) * r * 0.8;
    const sy = y - Math.sin(st * Math.PI) * (20 + 60 * k);
    ctx.fillStyle = i % 2 ? '#FDE047' : '#F97316'; ctx.fillRect(sx - 2, sy - 2, 4, 4);
  }
  // Smoke off the top
  for (let i = 0; i < 3; i++) {
    const t = ((f * 2 + i * 13) % 40) / 40;
    ctx.fillStyle = `rgba(68, 64, 60, ${0.5 * (1 - t)})`; ctx.beginPath(); ctx.arc(x + Math.sin(i * 2 + f * 0.1) * 10, y - 20 - t * 80, 6 + t * 12, 0, Math.PI * 2); ctx.fill();
  }
};

const drawJets = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  for (const j of COURSE.jets) {
    if (j.y < state.camera.y - 60 || j.y > state.camera.y + CANVAS_HEIGHT + 60) continue;
    const ph = jetPhase(j, f);
    // The nozzle
    ctx.fillStyle = '#52525B'; ctx.fillRect(j.dir > 0 ? j.x : j.x - 22, j.y - 12, 22, 24);
    ctx.fillStyle = '#18181B'; ctx.fillRect(j.dir > 0 ? j.x + 18 : j.x - 22, j.y - 8, 4, 16);
    if (ph.warning) {
      ctx.fillStyle = `rgba(249, 115, 22, ${0.5 + 0.5 * Math.sin(f * 0.9)})`; ctx.beginPath(); ctx.arc(j.x + j.dir * 24, j.y, 8 + (ph.t / JET_WARN) * 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FDE047'; for (let i = 0; i < 3; i++) ctx.fillRect(j.x + j.dir * (26 + ((f * 5 + i * 9) % 30)), j.y - 6 + i * 5, 2, 2);
    }
    if (ph.burning) {
      const len = j.len * Math.min(1, (ph.t - JET_WARN + 1) / 8);
      for (let i = 0; i < 3; i++) {
        const w = 16 - i * 5;
        ctx.fillStyle = ['rgba(234, 88, 12, 0.85)', 'rgba(251, 146, 60, 0.9)', 'rgba(254, 240, 138, 0.95)'][i];
        ctx.beginPath(); ctx.moveTo(j.x + j.dir * 20, j.y - w * 0.6);
        for (let d = 0; d <= len; d += 16) ctx.lineTo(j.x + j.dir * (20 + d), j.y - w * (0.6 + d / len * 0.5) + Math.sin(f * 0.6 + d) * 3);
        for (let d = len; d >= 0; d -= 16) ctx.lineTo(j.x + j.dir * (20 + d), j.y + w * (0.6 + d / len * 0.5) + Math.sin(f * 0.6 + d + 1) * 3);
        ctx.closePath(); ctx.fill();
      }
    }
  }
};

const drawBars = (ctx: Ctx, state: GameState) => {
  for (const b of COURSE.bars) {
    if (b.y < state.camera.y - 200 || b.y > state.camera.y + CANVAS_HEIGHT + 200) continue;
    ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.arc(b.x, b.y, 10, 0, Math.PI * 2); ctx.fill();
    for (const ball of barBalls(b, state.frame)) {
      const g = ctx.createRadialGradient(ball.x, ball.y, 1, ball.x, ball.y, 11);
      g.addColorStop(0, '#FEF9C3'); g.addColorStop(0.5, '#FB923C'); g.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ball.x, ball.y, 11, 0, Math.PI * 2); ctx.fill();
    }
  }
};

const drawBombs = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state)!;
  for (const b of rt.hazards.bombs) {
    if (b.t < BOMB_WARN) {
      // Where it's going to land: a ring closing in, and the bomb coming down on it out of the sky
      const k = b.t / BOMB_WARN;
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 + 0.5 * (Math.floor(b.t / 4) % 2)})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(b.x, b.ground - 2, BOMB_RADIUS * (1.2 - k * 0.4), 10, 0, 0, Math.PI * 2); ctx.stroke();
      const bx = b.x + (1 - k) * 380, by = b.ground - 20 - (1 - k) * 700 + Math.sin(k * Math.PI) * -60;
      ctx.fillStyle = 'rgba(120, 113, 108, 0.5)';
      for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.arc(bx + i * 14, by - i * 22, 8 + i * 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.arc(bx, by, 16, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#F97316'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 10, by - 4); ctx.lineTo(bx - 2, by + 2); ctx.lineTo(bx + 8, by - 6); ctx.stroke();
    } else {
      // The blast
      const k = (b.t - BOMB_WARN) / 18;
      const g = ctx.createRadialGradient(b.x, b.ground - 20, 2, b.x, b.ground - 20, BOMB_RADIUS * (0.6 + k));
      g.addColorStop(0, `rgba(254, 240, 138, ${1 - k})`); g.addColorStop(0.5, `rgba(249, 115, 22, ${0.8 * (1 - k)})`); g.addColorStop(1, 'rgba(120, 30, 10, 0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.ground - 20, BOMB_RADIUS * (0.6 + k), 0, Math.PI * 2); ctx.fill();
    }
  }
};

// ---------------------------------------------------------------------------
// World: in front of everything
// ---------------------------------------------------------------------------

export const drawVictorFront = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state)!;
  drawClashingMeathead(ctx, state, rt.doorman);
  if (rt.lounge.phase === 'crash' || regionOf(state.camera.x + 400) === 'lounge') drawLoungeFront(ctx, state, rt.lounge);
};

// ---------------------------------------------------------------------------
// Screen space
// ---------------------------------------------------------------------------

export const drawVictorHud = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state)!;
  drawDoormanHud(ctx, state, rt.doorman);
  drawLoungeHud(ctx, state, rt.lounge);
  // Through the club doors
  const fade = enterFade(rt);
  if (fade > 0) { ctx.fillStyle = `rgba(0, 0, 0, ${fade})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  drawWideShot(ctx, state, rt.lounge);
  drawAftermathFade(ctx, rt.lounge);
};
