// Drawing the bay and the island: the view across the water (Alcatraz getting
// bigger the further you get), the pier, the hipster, the water, the jet ski
// under Meathead (wheelies, leaps and dives), the floating wreckage, the ramp;
// then the cell house, the tour, the ski coming down through the skylight, and
// what's left afterwards.

import type { GameState } from '../../core/state';
import type { ErnieRuntime } from './runtime';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { STAGE_BACKDROPS } from '../../render/backdrops/stages';
import { blitLayer } from '../../render/backdrops/core';
import type { LayerSpec } from '../../render/backdrops/core';
import type { Live } from '../../render/backdrops';
import { drawPlayer } from '../../render/player/player';
import { COURSE } from './course';
import { rideProgress, RIDE_FRAMES, wreckBox, FloatingWreck, JetSki } from './jetski';
import { TOURISTS, FADE_IN, DROP_AT, IMPACT_AT, skiDrop, tourWrecked, tourLaughing } from './alcatraz';
import { drawAlcatraz, bubble } from './draw';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;
const Y = GROUND_Y;

const LAYERS = STAGE_BACKDROPS['Ernie Earthquake'].layers;
const layer = (ctx: Ctx, state: GameState, i: number) => {
  const l = LAYERS[i];
  if (typeof l === 'function') { ctx.save(); (l as Live)(ctx, { camX: state.camera.x, camY: state.camera.y, frame: state.frame }); ctx.restore(); }
  else blitLayer(ctx, l as LayerSpec, state.camera.x, state.camera.y, state.frame);
};

// ---------------------------------------------------------------------------
// The bay
// ---------------------------------------------------------------------------

/** Across the water: the sunset, the bridge back behind you, the city, and the island out ahead getting bigger. */
export const drawBayBackdrop = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  layer(ctx, state, 0);
  // (no bridge back here: out on the water it's just the far shore, the bay, and the island ahead)
  const W = CANVAS_WIDTH, horizon = 412, f = state.frame;
  const drift = state.camera.x * 0.02;
  ctx.fillStyle = '#4B3D5A';
  ctx.beginPath(); ctx.moveTo(0, horizon);
  for (let x = 0; x <= W + 20; x += 16) ctx.lineTo(x, horizon - 18 - 22 * Math.sin((x + drift) * 0.006) - 10 * Math.sin((x + drift) * 0.021) - hash(Math.floor((x + drift) / 16)) * 4);
  ctx.lineTo(W + 20, horizon); ctx.fill();
  const g = ctx.createLinearGradient(0, horizon, 0, CANVAS_HEIGHT);
  g.addColorStop(0, '#6C5B7B'); g.addColorStop(0.15, '#3B5B80'); g.addColorStop(1, '#294461');
  ctx.fillStyle = g; ctx.fillRect(0, horizon, W, CANVAS_HEIGHT - horizon);
  ctx.fillStyle = 'rgba(246, 194, 122, 0.4)';
  for (let i = 0; i < 26; i++) { const x = ((hash(i) * W - state.camera.x * 0.1 + f * 0.1) % W + W) % W, y = horizon + 4 + hash(i + 3) * 60; ctx.fillRect(x, y, 8 + hash(i + 5) * 26, 1); }
  layer(ctx, state, 2);
  const k = rideProgress(rt.ski);
  // The rock: a speck off to the right at first, then filling the view ahead
  const s = 0.45 + k * k * 1.9;
  drawAlcatraz(ctx, CANVAS_WIDTH * (0.82 - k * 0.2), horizon, s, state.frame);
  layer(ctx, state, 3);
};

export const drawSeaBack = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const B = COURSE.bay;
  const x1 = state.camera.x - 20, x2 = state.camera.x + CANVAS_WIDTH + 20;
  // The water, all the way down
  const g = ctx.createLinearGradient(0, Y, 0, Y + 400);
  g.addColorStop(0, '#2F5C85'); g.addColorStop(1, '#0F2640');
  ctx.fillStyle = g; ctx.fillRect(x1, Y - 2, x2 - x1, state.camera.y + CANVAS_HEIGHT + 40 - Y);
  // Streaks on the water (fixed in the world, so they rush past when he's flying along)
  ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
  for (let x = Math.floor(x1 / 90) * 90; x < x2; x += 90) {
    const y = Y + 14 + hash(x) * 120;
    ctx.fillRect(x + hash(x + 1) * 40, y, 24 + hash(x + 2) * 30, 2);
  }
  // The pier
  if (visible(state, B.x1, B.pier)) drawPier(ctx, state);
  void rt;
};

const drawPier = (ctx: Ctx, state: GameState) => {
  const B = COURSE.bay;
  const top = Y - 50;
  // Pilings down into the water
  ctx.fillStyle = '#4A3222';
  for (let x = B.x1 + 20; x < B.pier; x += 70) ctx.fillRect(x, top, 12, Y + 120 - top);
  ctx.fillStyle = 'rgba(15, 38, 64, 0.5)'; ctx.fillRect(B.x1, Y, B.pier - B.x1, 120);
  // The planks
  ctx.fillStyle = '#8A6A45'; ctx.fillRect(B.x1, top, B.pier - B.x1, 12);
  ctx.fillStyle = '#A8845A'; ctx.fillRect(B.x1, top, B.pier - B.x1, 2);
  ctx.fillStyle = '#5E4630'; for (let x = B.x1; x < B.pier; x += 16) ctx.fillRect(x, top, 2, 12);
  // A sign, a bollard with a rope, lifebuoy
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(B.x1 + 120, top - 90, 6, 90);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(B.x1 + 70, top - 124, 110, 50);
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('SAUSALITO', B.x1 + 125, top - 110); ctx.fillText('JET SKI RENTAL', B.x1 + 125, top - 98);
  // (a red placard hung across the bottom of the sign)
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(B.x1 + 94, top - 94, 62, 14);
  ctx.fillStyle = '#DC2626'; ctx.fillText('CLOSED', B.x1 + 125, top - 83);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#27272A'; ctx.fillRect(B.pier - 30, top - 16, 12, 16);
  ctx.strokeStyle = '#F97316'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(B.x1 + 300, top - 40, 14, 0, Math.PI * 2); ctx.stroke();
  void state;
};

export const drawSeaMid = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const js = rt.ski;
  // The hipster (and, till it's taken, his ski)
  drawHipster(ctx, state, js);
  for (const w of js.wrecks) if (visible(state, w.x - 60, w.x + 60)) drawWreck(ctx, w, state.frame);
  if (js.rampX && visible(state, js.rampX - 100, js.rampX + 200)) drawRamp(ctx, js.rampX, state.frame);
  // Meathead's ride
  const p = state.player;
  if (p.jetski && !p.hidden && state.deathTimer <= 0) drawRide(ctx, state);
};

const drawHipster = (ctx: Ctx, state: GameState, js: JetSki) => {
  const h = js.hipster;
  const B = COURSE.bay;
  // His ski, bobbing at the end of the pier till Meathead's on it
  if (!state.player.jetski && js.phase !== 'gone' && visible(state, B.ski - 60, B.ski + 60)) {
    ctx.save(); ctx.translate(B.ski, Y + Math.sin(state.frame * 0.1) * 2); drawSki(ctx, 0); ctx.restore();
  }
  if (!visible(state, h.x - 60, h.x + 60)) return;
  ctx.save();
  ctx.translate(h.x, h.y);
  if (h.state === 'flying') ctx.rotate(h.rot);
  if (h.state === 'swimming') {
    // Just his head and a flailing arm, and the man bun
    ctx.translate(0, Math.sin(state.frame * 0.15) * 2);
    ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(0, -4, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4A2F1D'; ctx.beginPath(); ctx.arc(0, -13, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.strokeRect(-6, -7, 5, 4); ctx.strokeRect(1, -7, 5, 4);
    ctx.fillStyle = '#E0AC69'; ctx.save(); ctx.translate(8, -2); ctx.rotate(-1.2 + Math.sin(state.frame * 0.3) * 0.6); ctx.fillRect(0, -2, 16, 4); ctx.restore();
    ctx.restore();
    return;
  }
  // Sat on it (or flying off it): skinny jeans, flannel, beard, big glasses, man bun, a kombucha
  const sit = h.state === 'sitting';
  ctx.translate(0, sit ? -22 : 0);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-10, -8, 22, 7); ctx.fillRect(8, -8, 5, 16);
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-10, -36, 20, 30);
  ctx.fillStyle = '#111827'; for (let y = -34; y < -8; y += 6) ctx.fillRect(-10, y, 20, 2);
  for (let x = -8; x < 10; x += 6) ctx.fillRect(x, -36, 2, 28);
  ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(1, -45, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4A2F1D'; ctx.beginPath(); ctx.ellipse(3, -39, 8, 7, 0, 0, Math.PI); ctx.fill();
  ctx.beginPath(); ctx.arc(-3, -56, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-7, -54, 16, 4);
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.strokeRect(0, -49, 6, 5); ctx.strokeRect(7, -49, 5, 5);
  // The kombucha
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(8, -30, 10, 4);
  ctx.fillStyle = '#D97706'; ctx.fillRect(16, -38, 6, 14);
  ctx.restore();
};

/** A jet ski, facing right, its keel at (0, 0). */
/** The hipster's ski (the one Meathead takes off him, so it's the same one all the way to Alcatraz). */
const HIPSTER_SKI = '#14B8A6';

const drawSki = (ctx: Ctx, f: number, color = HIPSTER_SKI) => {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-38, -4); ctx.lineTo(30, -4); ctx.quadraticCurveTo(44, -8, 42, -18); ctx.lineTo(10, -20); ctx.lineTo(-34, -16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-34, -12, 64, 3);
  ctx.fillStyle = '#111827'; ctx.fillRect(-38, -4, 70, 3);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-26, -24, 30, 6); // (the seat)
  void f;
};

/** The ski under him, tipped with what he's doing: a wheelie, a leap, a dive, or just the swell. And the handlebars in front. */
const drawRide = (ctx: Ctx, state: GameState) => {
  const p = state.player;
  const feetX = p.pos.x + p.width / 2, feetY = p.pos.y + p.height;
  let tilt = 0;
  if (p.isCharging) tilt = -0.42;
  else if (p.isUppercutting) tilt = -1.05;
  else if (p.isDivekicking) tilt = 0.75;
  else if (!p.isGrounded) tilt = Math.max(-0.35, Math.min(0.35, p.vel.y * 0.03));
  else tilt = Math.sin(state.frame * 0.18) * 0.03;
  ctx.save();
  ctx.translate(feetX, feetY + 2);
  ctx.rotate(tilt);
  drawSki(ctx, state.frame);
  // The steering column up to where his hands are
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(26, -16); ctx.lineTo(18, -40); ctx.stroke();
  ctx.fillStyle = '#111827'; ctx.fillRect(12, -44, 14, 4);
  ctx.restore();
  // Spray: off the back normally, a rooster tail on a wheelie
  if (p.isGrounded || p.isCharging) {
    for (let i = 0; i < (p.isCharging ? 8 : 3); i++) {
      const t = ((state.frame * 2 + i * 7) % 20) / 20;
      ctx.fillStyle = `rgba(224, 242, 254, ${0.8 * (1 - t)})`;
      ctx.beginPath(); ctx.arc(feetX - 40 - t * (p.isCharging ? 60 : 30), feetY - t * (p.isCharging ? 50 : 14) + (p.isCharging ? 0 : 0), 3 + t * 6, 0, Math.PI * 2); ctx.fill();
    }
  }
};

const drawWreck = (ctx: Ctx, w: FloatingWreck, f: number) => {
  const box = wreckBox(w);
  const bob = Math.sin(f * 0.08 + w.x) * 2;
  ctx.save();
  ctx.translate(w.x, Y + bob);
  if (w.look === 'car') {
    ctx.rotate(0.12);
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(-44, -24, 88, 26); ctx.fillRect(-26, -36, 50, 14);
    ctx.fillStyle = '#1E293B'; ctx.fillRect(-22, -34, 18, 10); ctx.fillRect(2, -34, 18, 10);
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(38, -18, 6, 5);
  } else if (w.look === 'buoy') {
    ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-8, -34); ctx.lineTo(8, -34); ctx.lineTo(14, 0); ctx.fill();
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-11, -20, 22, 6);
    ctx.fillStyle = f % 50 < 25 ? '#FDE047' : '#78350F'; ctx.fillRect(-3, -44, 6, 10);
  } else {
    ctx.rotate(Math.sin(w.rot) * 0.1);
    ctx.fillStyle = '#A16207'; ctx.fillRect(-22, -32, 44, 32);
    ctx.strokeStyle = '#78350F'; ctx.lineWidth = 3; ctx.strokeRect(-22, -32, 44, 32);
    ctx.beginPath(); ctx.moveTo(-22, -32); ctx.lineTo(22, 0); ctx.stroke();
  }
  ctx.restore();
  // Chop around it
  ctx.fillStyle = 'rgba(224, 242, 254, 0.7)'; ctx.fillRect(box.x - 6, Y - 1, box.w + 12, 3);
};

const drawRamp = (ctx: Ctx, x: number, f: number) => {
  // A wooden ramp on floats, a banner on it
  ctx.fillStyle = '#6B4A2E';
  ctx.beginPath(); ctx.moveTo(x - 60, Y); ctx.lineTo(x + 140, Y - 110); ctx.lineTo(x + 160, Y - 110); ctx.lineTo(x + 160, Y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8A6A45'; ctx.lineWidth = 3;
  ctx.beginPath(); for (let k = 0; k < 8; k++) { const t = k / 8; ctx.moveTo(x - 60 + t * 200, Y - t * 110); ctx.lineTo(x - 50 + t * 200, Y - t * 110 + 8); } ctx.stroke();
  ctx.fillStyle = '#F97316'; ctx.fillRect(x - 70, Y - 8, 240, 10);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(x + 20, Y - 170, 150, 30);
  ctx.fillStyle = '#111827'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('ALCATRAZ TOURS', x + 95, Y - 159); ctx.fillText('THIS WAY >>', x + 95, Y - 147);
  ctx.textAlign = 'left';
  void f;
};

export const drawSeaFront = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const js = rt.ski;
  const p = state.player;
  // The hipster's lines (in front of everybody)
  const h = js.hipster;
  if (h.lineT > 0 && h.line) bubble(ctx, h.x, h.y - (h.state === 'sitting' ? 90 : h.state === 'swimming' ? 30 : 70), h.line);
  if (js.lineT > 0 && js.line && !p.hidden && state.deathTimer <= 0) bubble(ctx, p.pos.x + p.width / 2, Math.max(state.camera.y + 40, p.pos.y - 16), js.line);
};

export const drawSeaHud = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const js = rt.ski;
  const W = CANVAS_WIDTH;
  if (js.phase === 'theft' || js.phase === 'launch') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 36); ctx.fillRect(0, CANVAS_HEIGHT - 36, W, 36); }
  if (js.phase !== 'riding') return;
  // How far to the island, and the time left
  const k = rideProgress(js);
  // (over on the right, clear of the health and power in the top left)
  const bw = 300, bx = W - bw - 20, by = 40;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(bx - 8, by - 20, bw + 16, 36);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(bx, by, bw, 8);
  ctx.fillStyle = '#38BDF8'; ctx.fillRect(bx, by, bw * k, 8);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(bx + bw * k - 6, by - 4, 12, 6);
  ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'left'; ctx.fillText('SAUSALITO', bx, by - 7);
  ctx.textAlign = 'right'; ctx.fillText('ALCATRAZ', bx + bw, by - 7);
  const left = Math.max(0, Math.ceil((RIDE_FRAMES - js.t) / 60));
  ctx.textAlign = 'center'; ctx.fillStyle = left <= 10 ? '#FDE047' : '#F8FAFC';
  ctx.fillText(`0:${String(left).padStart(2, '0')}`, bx + bw / 2, by - 7);
  // A hint for what's just turned up
  if (js.hintT > 0 && js.hint) {
    ctx.globalAlpha = Math.min(1, js.hintT / 10, (200 - js.hintT) / 20);
    ctx.font = 'bold 10px "Press Start 2P"';
    const w = ctx.measureText(js.hint).width + 24;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(W / 2 - w / 2, CANVAS_HEIGHT - 86, w, 26);
    ctx.fillStyle = '#FDE047'; ctx.fillText(js.hint, W / 2, CANVAS_HEIGHT - 68);
  }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The cell house
// ---------------------------------------------------------------------------

export const drawCellMid = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const tour = rt.tour;
  const C = COURSE.cellblock;
  if (!visible(state, C.crashX - 300, C.crashX + 300)) return;
  if (tourWrecked(tour)) { drawAftermath(ctx, state); return; }
  if (tour.phase !== 'tour') { drawTourGroup(ctx, state, 0); return; }
  drawTourGroup(ctx, state, tour.t);
  // The ski on its way down through the roof, him on it
  const k = skiDrop(tour);
  if (k >= 0) {
    const x = C.crashX, y = Y - 520 + k * 520;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(0.5 + k * 0.3);
    drawSki(ctx, state.frame);
    ctx.restore();
    const p = state.player;
    const body = { ...p, pos: { x: 0, y: 0 }, hidden: false, isGrounded: false, vel: { x: 4, y: 14 }, facing: 1 as const, isDivekicking: true, invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0, isCharging: false, isSliding: false, isUppercutting: false };
    ctx.save();
    ctx.translate(x - p.width / 2, y - p.height - 6);
    drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: 'GUN', showFilthShield: false, invincibilityEnabled: false });
    ctx.restore();
  }
  // Glass coming down with him
  if (tour.t >= DROP_AT - 8 && tour.t < IMPACT_AT + 30) {
    for (let i = 0; i < 16; i++) {
      const t = tour.t - (DROP_AT - 8);
      const gx = C.crashX + (hash(i) - 0.5) * 160, gy = Y - 500 + t * (8 + hash(i + 2) * 8);
      if (gy > Y) continue;
      ctx.fillStyle = 'rgba(203, 213, 225, 0.8)'; ctx.fillRect(gx, gy, 4, 6);
    }
  }
};

/** Alive and listening (and looking up, once they hear him coming). */
const drawTourGroup = (ctx: Ctx, state: GameState, t: number) => {
  const C = COURSE.cellblock;
  const up = t > 250;
  TOURISTS.forEach((tr, i) => {
    const x = C.crashX + tr.dx;
    ctx.save();
    ctx.translate(x, Y);
    if (tr.look === 'guide') ctx.scale(-1, 1);
    drawTourist(ctx, tr.look, i, state.frame, up);
    ctx.restore();
  });
};

const TOURIST_LOOKS: Record<string, { shirt: string; pants: string; skin: string; h: number }> = {
  dad: { shirt: '#F97316', pants: '#D6D3D1', skin: '#F2C9A0', h: 64 },
  mom: { shirt: '#EC4899', pants: '#60A5FA', skin: '#E0AC69', h: 58 },
  kid: { shirt: '#FACC15', pants: '#1E3A8A', skin: '#F2C9A0', h: 40 },
  selfie: { shirt: '#A855F7', pants: '#111827', skin: '#C68642', h: 60 },
  grandpa: { shirt: '#22C55E', pants: '#78716C', skin: '#F2C9A0', h: 58 },
  backpacker: { shirt: '#0EA5E9', pants: '#57534E', skin: '#8D5524', h: 62 },
  guide: { shirt: '#166534', pants: '#A16207', skin: '#E0AC69', h: 62 },
};

const drawTourist = (ctx: Ctx, look: string, i: number, f: number, up: boolean) => {
  const L = TOURIST_LOOKS[look];
  const h = L.h;
  ctx.fillStyle = L.pants; ctx.fillRect(-7, -h * 0.45, 6, h * 0.45); ctx.fillRect(2, -h * 0.45, 6, h * 0.45);
  ctx.fillStyle = L.shirt; ctx.fillRect(-10, -h * 0.85, 20, h * 0.42);
  // Hawaiian flowers on dad
  if (look === 'dad') { ctx.fillStyle = '#FDE047'; for (let k = 0; k < 4; k++) ctx.fillRect(-8 + (k % 2) * 9, -h * 0.8 + Math.floor(k / 2) * 10, 4, 4); }
  ctx.fillStyle = L.skin; ctx.beginPath(); ctx.arc(0, -h * 0.85 - 8, 8, 0, Math.PI * 2); ctx.fill();
  // Looking up at the roof, mouths open
  if (up) { ctx.fillStyle = '#450A0A'; ctx.beginPath(); ctx.ellipse(3, -h * 0.85 - 12, 2, 3, 0, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.fillStyle = '#111827'; ctx.fillRect(2, -h * 0.85 - 10, 5, 2); }
  switch (look) {
    case 'dad': ctx.fillStyle = '#111827'; ctx.fillRect(-4, -h * 0.72, 10, 8); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-9, -h * 0.85 - 18, 18, 4); break; // camera, visor
    case 'mom': ctx.fillStyle = '#7C2D12'; ctx.fillRect(-9, -h * 0.85 - 16, 18, 10); ctx.fillStyle = '#F472B6'; ctx.fillRect(-12, -h * 0.5, 8, 8); break; // hair, bag
    case 'kid': ctx.fillStyle = '#DC2626'; ctx.fillRect(-8, -h * 0.85 - 18, 16, 4); ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.arc(10, -h * 0.9 - 14, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(9, -h * 0.9 - 8, 1, 20); break; // cap, balloon
    case 'selfie': ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(6, -h * 0.7); ctx.lineTo(24, -h * 1.2); ctx.stroke(); ctx.fillStyle = '#111827'; ctx.fillRect(21, -h * 1.26, 8, 10); break;
    case 'grandpa': ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-8, -h * 0.85 - 17, 16, 3); ctx.fillStyle = '#78350F'; ctx.fillRect(12, -h * 0.5, 3, h * 0.5); break; // cane
    case 'backpacker': ctx.fillStyle = '#65A30D'; ctx.fillRect(-18, -h * 0.85, 10, 22); break;
    case 'guide': {
      // The flag on a stick, the ranger hat
      ctx.fillStyle = '#78350F'; ctx.fillRect(-14, -h * 1.5, 2, h * 1.1);
      ctx.fillStyle = '#FDE047'; ctx.fillRect(-12, -h * 1.5 + Math.sin(f * 0.1) * 2, 18, 12);
      ctx.fillStyle = '#A16207'; ctx.fillRect(-12, -h * 0.85 - 16, 24, 3); ctx.fillRect(-6, -h * 0.85 - 22, 12, 7);
      break;
    }
  }
  void i;
};

/** What's left: a crater, the ski on fire in it, and the tour all over the place. */
const drawAftermath = (ctx: Ctx, state: GameState) => {
  const C = COURSE.cellblock, f = state.frame;
  const x = C.crashX;
  // Scorch and the crater
  ctx.fillStyle = 'rgba(20, 16, 14, 0.8)'; ctx.beginPath(); ctx.ellipse(x, Y + 2, 190, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(x, Y + 4, 70, 10, 0, 0, Math.PI); ctx.fill();
  // Blood up the cell bars and across the floor
  ctx.fillStyle = 'rgba(127, 29, 29, 0.85)';
  for (let i = 0; i < 12; i++) { const bx = x + (hash(i) - 0.5) * 420; ctx.beginPath(); ctx.ellipse(bx, Y + 1, 14 + hash(i + 1) * 20, 3, 0, 0, Math.PI * 2); ctx.fill(); }
  for (let i = 0; i < 8; i++) { const bx = x + (hash(i + 20) - 0.5) * 500, by = Y - 40 - hash(i + 21) * 160; ctx.fillRect(bx, by, 5 + hash(i) * 8, 3); ctx.fillRect(bx + 2, by, 2, 10 + hash(i + 3) * 14); }
  // The ski, wrapped round itself, burning
  ctx.save(); ctx.translate(x - 10, Y - 4); ctx.rotate(-0.35); drawSki(ctx, f, '#44403C'); ctx.restore();
  for (let i = 0; i < 5; i++) {
    const fx = x - 34 + i * 14, h = 24 + Math.sin(f * 0.4 + i * 2) * 9;
    ctx.fillStyle = i % 2 ? 'rgba(249, 115, 22, 0.9)' : 'rgba(253, 224, 71, 0.85)';
    ctx.beginPath(); ctx.moveTo(fx - 7, Y - 14); ctx.quadraticCurveTo(fx + Math.sin(f * 0.3 + i) * 5, Y - 14 - h, fx + 7, Y - 14); ctx.fill();
  }
  for (let i = 0; i < 4; i++) {
    const t = ((f * 0.7 + i * 50) % 200) / 200;
    ctx.fillStyle = `rgba(40, 36, 34, ${0.5 * (1 - t)})`;
    ctx.beginPath(); ctx.arc(x + t * 20, Y - 40 - t * 300, 14 + t * 30, 0, Math.PI * 2); ctx.fill();
  }
  // The tour: charred, in bits, strewn out from the middle. The guide's flag, still standing. A selfie stick.
  TOURISTS.forEach((tr, i) => {
    const bx = x + tr.dx * 1.9 + (hash(i + 30) - 0.5) * 30;
    const L = TOURIST_LOOKS[tr.look];
    ctx.save();
    ctx.translate(bx, Y);
    ctx.rotate((hash(i + 40) - 0.5) * 0.4);
    // A charred body, flat out
    ctx.fillStyle = '#1C1917'; ctx.fillRect(-L.h * 0.45, -9, L.h * 0.8, 9);
    ctx.beginPath(); ctx.arc(L.h * 0.4, -6, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = L.shirt; ctx.globalAlpha = 0.5; ctx.fillRect(-L.h * 0.2, -8, L.h * 0.3, 4); ctx.globalAlpha = 1;
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-L.h * 0.5, -3, 10, 3);
    ctx.restore();
    // A limb, further off
    if (i % 2 === 0) { ctx.fillStyle = '#1C1917'; ctx.save(); ctx.translate(bx + (i % 4 ? 70 : -80), Y - 3); ctx.rotate(hash(i) * 3); ctx.fillRect(-8, -2, 16, 5); ctx.restore(); }
  });
  ctx.fillStyle = '#78350F'; ctx.save(); ctx.translate(x + 240, Y); ctx.rotate(0.3); ctx.fillRect(-1, -60, 2, 60); ctx.fillStyle = '#FDE047'; ctx.fillRect(1, -60, 18, 12); ctx.restore();
  ctx.fillStyle = '#111827'; ctx.save(); ctx.translate(x - 250, Y - 2); ctx.rotate(-0.1); ctx.fillRect(0, 0, 34, 2); ctx.fillRect(32, -5, 7, 9); ctx.restore();
  // A balloon, drifting up
  const by = Y - 120 - ((f * 0.4) % 400);
  if (by > Y - 470) { ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.arc(x - 90, by, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x - 90, by + 8, 1, 20); }
};

export const drawCellFront = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const tour = rt.tour;
  const C = COURSE.cellblock;
  // The whole tour chuckling at the guide's joke
  if (tourLaughing(tour)) {
    ctx.save();
    ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
    TOURISTS.forEach((tr, i) => {
      if (i % 2 === 1 && tr.look !== 'guide') return;
      const bob = Math.abs(Math.sin(state.frame * 0.3 + i)) * 4;
      ctx.fillStyle = '#000'; ctx.fillText(tr.look === 'guide' ? 'HO HO!' : 'HA HA!', C.crashX + tr.dx + 1, Y - 92 - bob + 1);
      ctx.fillStyle = '#FDE68A'; ctx.fillText(tr.look === 'guide' ? 'HO HO!' : 'HA HA!', C.crashX + tr.dx, Y - 92 - bob);
    });
    ctx.restore();
  }
  if (tour.lineT <= 0 || !tour.line) return;
  if (tour.who === 'meathead') {
    if (tour.phase === 'tour' && tour.t < IMPACT_AT) {
      // Off the top of the screen, coming closer
      bubble(ctx, C.crashX, state.camera.y + 64, tour.line);
      ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(C.crashX - 6, state.camera.y + 38); ctx.lineTo(C.crashX + 6, state.camera.y + 38); ctx.lineTo(C.crashX, state.camera.y + 26); ctx.fill();
    } else {
      const p = state.player;
      bubble(ctx, p.pos.x + p.width / 2, p.pos.y - 16, tour.line);
    }
    return;
  }
  const i = tour.who === 'guide' ? TOURISTS.length - 1 : Number(tour.who);
  const tr = TOURISTS[i];
  if (!tr) return;
  bubble(ctx, C.crashX + tr.dx, Y - 100, tour.line);
};

export const drawCellHud = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const tour = rt.tour;
  if (tour.phase !== 'tour') return;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, 36); ctx.fillRect(0, CANVAS_HEIGHT - 36, CANVAS_WIDTH, 36);
  if (tour.t < FADE_IN) { ctx.fillStyle = `rgba(0,0,0,${1 - tour.t / FADE_IN})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  // A caption for where we are
  if (tour.t < 120) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, tour.t / 20, (120 - tour.t) / 20);
    ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillStyle = '#F5F5F4';
    ctx.fillText('ALCATRAZ ISLAND. MEANWHILE...', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 14);
    ctx.restore();
  }
  // A white flash on impact
  if (tour.t >= IMPACT_AT && tour.t < IMPACT_AT + 16) { ctx.fillStyle = `rgba(255,255,255,${1 - (tour.t - IMPACT_AT) / 16})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  void state;
};
