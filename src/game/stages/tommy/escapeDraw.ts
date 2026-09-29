// The way out, drawn. Three cut scenes over the whole screen: the water tower
// (the manhole cover through its tank, the town's water pouring out of the
// hole, him landing on top, the whole thing starting to lean); the family on
// their couch in front of the TV (the room getting darker, the window filling
// up with tower); the tower coming down through the roof (the water with it,
// eating them to the bone, him in his suit in the middle of it). Then the
// ruins: the tower lying across what's left of the house, the three of them
// on what's left of the couch, the TV still on, and past it, the pit.

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { COURSE, RUINS_Y, CAVERN_ROOF } from './course';
import type { TommyRuntime } from './runtime';
import { TOWER_FRAMES, FAMILY_FRAMES, CRUSH_FRAMES, MELT_FRAMES } from './escape';
import { drawStreetSky, drawWaterTower } from './streetDraw';
import { saying, drawBubble } from './script';

type Ctx = CanvasRenderingContext2D;
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** A little Meathead in his yellow suit, for the cut scenes (at his feet, `s` big). */
const suitedMan = (ctx: Ctx, x: number, y: number, s: number, rot = 0, suit = 1) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const yellow = `rgba(250, 204, 21, ${suit})`;
  ctx.fillStyle = suit < 1 ? '#1E3A8A' : yellow; ctx.fillRect(-9, -26, 8, 26); ctx.fillRect(2, -26, 8, 26);
  ctx.fillStyle = suit < 1 ? '#E0AC69' : yellow; ctx.fillRect(-14, -58, 28, 34);
  ctx.fillStyle = yellow; ctx.fillRect(-14, -58, 28, 34); ctx.fillRect(-9, -26, 8, 26); ctx.fillRect(2, -26, 8, 26);
  ctx.beginPath(); ctx.arc(1, -66, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(31, 41, 55, ${suit})`; ctx.fillRect(1, -70, 11, 6);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The cut scenes
// ---------------------------------------------------------------------------

export const drawCutScene = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  const es = rt.escape;
  if (es.phase === 'tower') drawTowerScene(ctx, state, es.t);
  else if (es.phase === 'family') drawFamilyScene(ctx, state, rt, es.t, 0);
  else if (es.phase === 'crush') drawFamilyScene(ctx, state, rt, FAMILY_FRAMES, es.t);
};

/** The tower: the cover through it, the water out of it, him onto it, and over it goes (a push in the whole time, a punch at every impact). */
const drawTowerScene = (ctx: Ctx, state: GameState, t: number) => {
  const tx = 420, ty = 540, s = 1.55;
  const hitAt = 100, landAt = 150;
  // Over it goes: a creak and a shudder first, then faster and faster
  const lean = clamp01((t - landAt - 25) / (TOWER_FRAMES - landAt - 25));
  const tilt = t > landAt ? lean * lean * lean * 0.42 + (t > landAt && t < landAt + 40 ? Math.sin(t * 0.9) * 0.012 : 0) : 0;
  // The camera: pushing in all the way through, punching in and shaking at the hit and the landing
  const punch = (at: number) => (t >= at && t < at + 22 ? Math.sin(((t - at) / 22) * Math.PI) : 0);
  const zoom = 1 + (t / TOWER_FRAMES) * 0.14 + punch(hitAt) * 0.1 + punch(landAt) * 0.07;
  const shakeK = Math.max(punch(hitAt) * 16, punch(landAt) * 12, t > landAt + 40 ? lean * 5 : 0);
  const sx = (Math.random() - 0.5) * shakeK, sy = (Math.random() - 0.5) * shakeK;
  ctx.save();
  ctx.translate(W / 2 + sx, H * 0.55 + sy); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H * 0.55);
  drawStreetSky(ctx, { ...state, camera: { x: COURSE.road.x2 + t * 6, y: GROUND_Y - 550 } } as GameState, 0.85, false);
  // Dust off its feet as it goes
  if (t > landAt + 30) for (let i = 0; i < 6; i++) { const q = ((t * 1.3 + i * 20) % 90) / 90; ctx.fillStyle = `rgba(120, 100, 90, ${0.5 * (1 - q)})`; ctx.beginPath(); ctx.arc(tx - 60 + i * 24 + q * 30 * (i % 2 ? 1 : -1), ty - q * 40, 10 + q * 20, 0, Math.PI * 2); ctx.fill(); }
  drawWaterTower(ctx, tx, ty, s, 0.85, tilt, t >= hitAt);
  const hx = tx + (-20 * Math.cos(tilt) + 196 * Math.sin(tilt)) * s, hy = ty + (-196 * Math.cos(tilt) - 20 * Math.sin(tilt)) * s;
  // The water out of the hole: a thick jet of it, blasting, arcing off and down, spraying
  if (t >= hitAt) {
    const k = clamp01((t - hitAt) / 12);
    ctx.strokeStyle = 'rgba(120, 140, 60, 0.9)'; ctx.lineWidth = 22 * k; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx - 140, hy - 30, hx - 210, H + 40); ctx.stroke();
    ctx.strokeStyle = 'rgba(217, 249, 157, 0.5)'; ctx.lineWidth = 6 * k;
    ctx.beginPath(); ctx.moveTo(hx, hy - 4); ctx.quadraticCurveTo(hx - 140, hy - 36, hx - 206, H + 40); ctx.stroke();
    ctx.fillStyle = 'rgba(190, 200, 120, 0.8)';
    for (let i = 0; i < 18; i++) { const q = ((t * 4 + i * 23) % 100) / 100; ctx.fillRect(hx - q * 210 - 10 + Math.sin(i * 3) * 18 * q, hy + q * q * (H - hy) - 10 + Math.cos(i) * 12 * q, 5, 5); }
  }
  // The hit: a flash, a ring, shards of the tank flying
  if (t >= hitAt && t < hitAt + 45) {
    const k = (t - hitAt) / 45;
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - k})`; ctx.lineWidth = 6 * (1 - k);
    ctx.beginPath(); ctx.arc(hx, hy, 20 + k * 180, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#8E9AAB';
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + 0.3; const d = k * (120 + (i % 3) * 60); ctx.save(); ctx.translate(hx + Math.cos(a) * d, hy + Math.sin(a) * d + k * k * 160); ctx.rotate(t * 0.4 + i); ctx.fillRect(-6, -3, 12, 6); ctx.restore(); }
  }
  // The manhole cover: spinning up out of the bottom of the screen at the tank, a trail behind it, speed lines
  if (t < hitAt) {
    const pos = (u: number) => { const k = clamp01(u / hitAt); return { x: 150 + (tx - 20 * s - 150) * k, y: H + 60 - (H + 60 - (ty - 196 * s)) * (1 - (1 - k) * (1 - k)) }; };
    for (let g = 4; g >= 0; g--) {
      const c = pos(t - g * 2.5);
      ctx.save(); ctx.globalAlpha = g === 0 ? 1 : 0.18; ctx.translate(c.x, c.y); ctx.rotate((t - g * 2.5) * 0.7);
      ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.ellipse(0, 0, 20, 7 + Math.abs(Math.sin((t - g * 2.5) * 0.7)) * 13, 0, 0, Math.PI * 2); ctx.fill();
      if (g === 0) { ctx.strokeStyle = '#292524'; ctx.lineWidth = 1.5; ctx.stroke(); }
      ctx.restore();
    }
    const c = pos(t), p0 = pos(t - 6), a = Math.atan2(c.y - p0.y, c.x - p0.x);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const o = (i - 2.5) * 9; ctx.beginPath(); ctx.moveTo(c.x - Math.cos(a) * 30 - Math.sin(a) * o, c.y - Math.sin(a) * 30 + Math.cos(a) * o); ctx.lineTo(c.x - Math.cos(a) * (80 + (i % 3) * 30) - Math.sin(a) * o, c.y - Math.sin(a) * (80 + (i % 3) * 30) + Math.cos(a) * o); ctx.stroke(); }
  }
  // Him: blasted up after it, tumbling, over the top, and down onto the tank's roof with a CLANG
  if (t > 40) {
    const topX = tx + 270 * Math.sin(tilt) * s, topY = ty - 270 * Math.cos(tilt) * s;
    const pos = (u: number) => { const k = clamp01((u - 40) / (landAt - 40)); return { x: 110 + (topX - 110) * k, y: H + 80 - (H + 80 - topY) * k - Math.sin(k * Math.PI) * 170 }; };
    if (t < landAt) {
      const c = pos(t), p0 = pos(t - 5), a = Math.atan2(c.y - p0.y, c.x - p0.x);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)'; ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) { const o = (i - 2) * 12; ctx.beginPath(); ctx.moveTo(c.x - Math.cos(a) * 30 - Math.sin(a) * o, c.y - 30 - Math.sin(a) * 30 + Math.cos(a) * o); ctx.lineTo(c.x - Math.cos(a) * 110 - Math.sin(a) * o, c.y - 30 - Math.sin(a) * 110 + Math.cos(a) * o); ctx.stroke(); }
      suitedMan(ctx, c.x, c.y, 1.2, t * 0.35);
    } else {
      // (landed: a crouch that springs up, then clinging on as it goes)
      const squash = t < landAt + 12 ? 1 - Math.sin(((t - landAt) / 12) * Math.PI) * 0.3 : 1;
      ctx.save(); ctx.translate(topX, topY); ctx.rotate(tilt); ctx.scale(1, squash); suitedMan(ctx, 0, 0, 1.2, 0); ctx.restore();
    }
    if (t >= landAt && t < landAt + 30) {
      const k = (t - landAt) / 30;
      ctx.fillStyle = `rgba(160, 150, 140, ${0.7 * (1 - k)})`; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(topX + (i - 2.5) * (14 + k * 30), topY + 2 - k * 10, 8 + k * 14, 0, Math.PI * 2); ctx.fill(); }
      ctx.save(); ctx.translate(topX + 70, topY - 70); ctx.rotate(-0.2); ctx.scale(1 + k * 0.4, 1 + k * 0.4);
      ctx.fillStyle = `rgba(253, 224, 71, ${1 - k})`; ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 22 : 44; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(28, 25, 23, ${1 - k})`; ctx.font = 'bold 13px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('CLANG', 0, 6); ctx.textAlign = 'left';
      ctx.restore();
    }
  }
  ctx.restore();
  if (t > hitAt && t < hitAt + 6) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  bubble(ctx, state, 'meathead', tx, ty - 330 * s + 30);
};

/** The family: the couch, the TV, a nice night in; the room going dark as the tower comes over; then the roof coming in. */
const drawFamilyScene = (ctx: Ctx, state: GameState, rt: TommyRuntime, t: number, crushT: number) => {
  const f = state.frame;
  const dark = clamp01((t - 30) / (FAMILY_FRAMES - 30));
  // The room: wallpaper, a window, a lamp, the rug
  ctx.fillStyle = '#C9B99A'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(160, 120, 80, 0.25)'; for (let x = 0; x < W; x += 40) ctx.fillRect(x, 0, 16, 470);
  ctx.fillStyle = '#7C5A3A'; ctx.fillRect(0, 470, W, 130);
  ctx.fillStyle = '#9F1239'; ctx.beginPath(); ctx.ellipse(400, 540, 300, 36, 0, 0, Math.PI * 2); ctx.fill();
  // The window: sky, and the tower in it, coming over and filling it
  ctx.fillStyle = '#5B3A29'; ctx.fillRect(470, 90, 230, 170);
  ctx.fillStyle = '#F59E4B'; ctx.fillRect(480, 100, 210, 150);
  // (coming straight at the window: bigger and bigger in it, dropping as it comes, till the tank fills it)
  ctx.save(); ctx.beginPath(); ctx.rect(480, 100, 210, 150); ctx.clip();
  const come = dark * dark;
  // (once it's through, it's in the room, not in the window: just the dark out there)
  if (crushT === 0) towerByTank(ctx, 585, 150 + come * 40, 0.55 + come * 1.9, 0.08 + come * 0.22);
  else { ctx.fillStyle = '#1C1917'; ctx.fillRect(480, 100, 210, 150); }
  ctx.restore();
  ctx.fillStyle = '#5B3A29'; ctx.fillRect(582, 100, 6, 150); ctx.fillRect(480, 172, 210, 6);
  // The TV (a sitcom, a laugh track), a lamp
  ctx.fillStyle = '#1C1917'; ctx.fillRect(40, 330, 150, 110); ctx.fillStyle = '#44403C'; ctx.fillRect(60, 440, 110, 30);
  ctx.fillStyle = f % 60 < 30 ? '#93C5FD' : '#BFDBFE'; ctx.fillRect(50, 340, 130, 88);
  ctx.fillStyle = '#FDE68A'; ctx.beginPath(); ctx.arc(95, 380, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.arc(140, 386, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#78716C'; ctx.fillRect(720, 290, 8, 180); ctx.fillStyle = '#FDE68A'; ctx.beginPath(); ctx.moveTo(700, 290); ctx.lineTo(748, 290); ctx.lineTo(736, 250); ctx.lineTo(712, 250); ctx.fill();
  // The couch, and them on it
  ctx.fillStyle = '#65743F'; ctx.fillRect(240, 380, 330, 90); ctx.fillRect(230, 340, 350, 50); ctx.fillStyle = '#4D5A2E'; ctx.fillRect(220, 370, 30, 100); ctx.fillRect(560, 370, 30, 100);
  const dissolve = clamp01((crushT - 60) / 120);
  const people: [number, string, string, number][] = [[300, '#1D4ED8', '#E0AC69', 1.1], [400, '#BE185D', '#E0AC69', 1.0], [490, '#16A34A', '#E0AC69', 0.75]];
  people.forEach(([x, shirt, skin, s], i) => {
    const laugh = crushT === 0 && t < 200 ? Math.abs(Math.sin(f * 0.3 + i)) * 3 : 0;
    ctx.save(); ctx.translate(x, 420 - laugh); ctx.scale(s, s);
    if (dissolve < 1) {
      ctx.globalAlpha = 1 - dissolve;
      ctx.fillStyle = shirt; ctx.fillRect(-20, -70, 40, 60);
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -88, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111827'; ctx.fillRect(4, -92, 4, 4); ctx.fillRect(-8, -92, 4, 4);
      ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(0, -78, 6, crushT > 0 ? 7 : 3 + laugh, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (crushT > 60) {
      // What's left: the bones, sat just where they were
      ctx.globalAlpha = clamp01((crushT - 60) / 60);
      ctx.fillStyle = '#E7E5D6'; ctx.beginPath(); ctx.arc(0, -88, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1C1917'; ctx.fillRect(-7, -92, 5, 5); ctx.fillRect(2, -92, 5, 5); ctx.fillRect(-4, -80, 8, 3);
      ctx.strokeStyle = '#E7E5D6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -72); ctx.lineTo(0, -20); for (let r = -64; r < -30; r += 9) { ctx.moveTo(-14, r); ctx.lineTo(14, r); } ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  });
  // The chips, a juice box
  if (crushT === 0) { ctx.fillStyle = '#FACC15'; ctx.fillRect(330, 430, 22, 16); ctx.fillStyle = '#F97316'; ctx.fillRect(488, 390, 10, 14); }
  // Getting dark in here
  ctx.fillStyle = `rgba(20, 16, 30, ${dark * 0.55})`; ctx.fillRect(0, 0, W, H);
  // The roof coming in: the tank through it, the water after it, filling the room
  if (crushT > 0) {
    const k = clamp01(crushT / 40);
    // In through the window and the wall round it: the tank, huge, straight on from where the window was, down into the room
    const ease = 1 - (1 - k) * (1 - k);
    towerByTank(ctx, 585 - ease * 190, 175 + ease * 190, 2.4 + ease * 2.2, 0.3 + ease * 0.25);
    // The window's glass and the wall round it, blown in ahead of it
    for (let i = 0; i < 18; i++) {
      const sx = 480 + hash(i) * 210, sy = 100 + hash(i * 3) * 150;
      const dx = (sx - 585) * (1 + k * 3) - k * 60, dy = k * (160 + hash(i * 5) * 300);
      ctx.save(); ctx.translate(585 + dx, sy + dy); ctx.rotate(k * (hash(i * 7) - 0.5) * 8);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(191, 219, 254, 0.8)' : i % 3 === 1 ? '#78716C' : '#5B3A29';
      ctx.fillRect(-10 - hash(i * 9) * 12, -6, 20 + hash(i * 9) * 24, 12);
      ctx.restore();
    }
    const flood = clamp01((crushT - 20) / 80);
    ctx.fillStyle = 'rgba(92, 104, 36, 0.82)'; ctx.fillRect(0, H - flood * 380, W, flood * 380);
    ctx.fillStyle = 'rgba(217, 249, 157, 0.6)'; for (let i = 0; i < 12; i++) { const x = (i * 71 + crushT * 5) % W; ctx.beginPath(); ctx.arc(x, H - flood * 380 + 4, 4, 0, Math.PI * 2); ctx.fill(); }
    // Him, landing in the middle of it, fine (the suit smoking)
    if (crushT > 40) {
      const land = clamp01((crushT - 40) / 25);
      suitedMan(ctx, 400, -60 + land * 520, 1.6);
      if (crushT > 70) { ctx.fillStyle = 'rgba(214, 211, 209, 0.45)'; for (let k2 = 0; k2 < 4; k2++) { const q = ((crushT * 1.5 + k2 * 20) % 80) / 80; ctx.beginPath(); ctx.arc(390 + k2 * 8, 360 - q * 100, 8 + q * 12, 0, Math.PI * 2); ctx.fill(); } }
    }
    if (crushT < 8) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, 0, W, H); }
    // Out to black at the end
    const out = clamp01((crushT - (CRUSH_FRAMES - 40)) / 40);
    if (out > 0) { ctx.fillStyle = `rgba(0,0,0,${out})`; ctx.fillRect(0, 0, W, H); }
  }
  bubble(ctx, state, 'dad', 300, 300); bubble(ctx, state, 'mom', 400, 300); bubble(ctx, state, 'kid', 490, 330);
  void rt;
};

/**
 * The water tower placed by the middle of its tank (x, y), at scale s and leaning over by tilt: legs, tank, roof and
 * all, FLINT on the side. (For it coming at the window, and in through it.)
 */
const towerByTank = (ctx: Ctx, x: number, y: number, s: number, tilt: number) => {
  const TANK = 188; // (how far up the tower the tank's middle is)
  drawWaterTower(ctx, x - Math.sin(tilt) * TANK * s, y + Math.cos(tilt) * TANK * s, s, 0.9, tilt, false);
};

/** Whoever's talking in a cut scene, over them (screen space). */
const bubble = (ctx: Ctx, state: GameState, who: 'meathead' | 'dad' | 'mom' | 'kid', x: number, y: number) => {
  const rt = (state.stage as TommyRuntime | null);
  if (!rt) return;
  const text = saying(rt.talk, who);
  if (text) drawBubble(ctx, x, y, text, who === 'meathead' ? '#F8FAFC' : '#FEF9C3');
};

// ---------------------------------------------------------------------------
// The ruins
// ---------------------------------------------------------------------------

/** The ground up in the ruins (dirt and rubble), and down at the bottom of the pit (the sewer's floor, and Tommy's door). */
export const drawRuinsGround = (ctx: Ctx, state: GameState) => {
  const bottom = state.camera.y + H + 60;
  for (const r of state.groundRuns) {
    if (r.x2 < state.camera.x - 60 || r.x1 > state.camera.x + W + 60) continue;
    if (r.surface === 'rubble') {
      ctx.fillStyle = '#4A3F35'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 1400);
      ctx.fillStyle = '#5D6B3A'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 6);
      ctx.fillStyle = '#6B635C'; for (let x = r.x1; x < r.x2; x += 23) ctx.fillRect(x + hash(x) * 10, r.y1 - 4 - hash(x * 3) * 6, 8 + hash(x * 7) * 12, 6);
      // The hole's lips: the ground broken off round it
      if (r.x2 === COURSE.ruins.pit) { ctx.fillStyle = '#2A221B'; ctx.fillRect(r.x2 - 16, r.y1, 16, 60); ctx.fillStyle = '#6B635C'; ctx.fillRect(r.x2 - 26, r.y1 - 6, 18, 8); }
      if (r.x1 === COURSE.ruins.pit + COURSE.ruins.pitW) { ctx.fillStyle = '#2A221B'; ctx.fillRect(r.x1, r.y1, 16, 60); ctx.fillStyle = '#6B635C'; ctx.fillRect(r.x1 + 8, r.y1 - 6, 18, 8); }
    } else if (r.surface === 'floor') {
      ctx.fillStyle = '#3F3A36'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, bottom - r.y1);
      ctx.fillStyle = '#57534E'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 5);
    }
  }
  // The hole down: a narrow shaft from the ruins to the cavern outside Tommy's door
  const P = COURSE.ruins.pit, PW = COURSE.ruins.pitW;
  if (P + 800 > state.camera.x && P - 400 < state.camera.x + W) {
    ctx.fillStyle = '#16110E'; ctx.fillRect(P, RUINS_Y, PW, GROUND_Y - 330 - RUINS_Y);
    ctx.fillStyle = '#2A2521'; for (let y = RUINS_Y + 10; y < GROUND_Y - 330; y += 36) { ctx.fillRect(P, y, 10, 26); ctx.fillRect(P + PW - 10, y + 18, 10, 26); }
    ctx.fillStyle = 'rgba(101, 163, 13, 0.3)'; for (let y = RUINS_Y + 80; y < GROUND_Y - 330; y += 220) ctx.fillRect(P + 14, y, 6, 70);
    // The cavern at the bottom: brick, a pipe or two, the door's at the far end of it
    ctx.fillStyle = '#1C1714'; ctx.fillRect(P - 420, GROUND_Y - 330, 900, 330);
    ctx.fillStyle = '#2A2521'; for (let y = GROUND_Y - 320; y < GROUND_Y; y += 16) for (let x = P - 420 + ((y / 16) % 2) * 18; x < P + 480; x += 36) ctx.fillRect(x, y, 32, 12);
    ctx.fillStyle = '#5B4A3B'; ctx.fillRect(P - 420, GROUND_Y - 250, 900, 12);
    // Its ceiling: a slab of old brick on an iron beam, the hole he came down through the only way up
    for (const [x1, x2] of [[P - 420, P], [P + PW, P + 480]]) {
      ctx.fillStyle = '#231C18'; ctx.fillRect(x1, GROUND_Y - CAVERN_ROOF - 160, x2 - x1, 160);
      ctx.fillStyle = '#2F2723'; for (let y = GROUND_Y - CAVERN_ROOF - 150; y < GROUND_Y - CAVERN_ROOF - 14; y += 16) for (let x = x1 + ((y / 16) % 2) * 18; x < x2 - 4; x += 36) ctx.fillRect(x, y, Math.min(32, x2 - x), 12);
      ctx.fillStyle = '#44403C'; ctx.fillRect(x1, GROUND_Y - CAVERN_ROOF - 14, x2 - x1, 14);
      ctx.fillStyle = '#1C1917'; for (let x = x1 + 30; x < x2 - 10; x += 120) ctx.fillRect(x, GROUND_Y - CAVERN_ROOF - 14, 10, 14);
      ctx.fillStyle = 'rgba(101, 163, 13, 0.35)'; for (let x = x1 + 50; x < x2 - 10; x += 90) ctx.fillRect(x, GROUND_Y - CAVERN_ROOF, 4, 6 + ((x * 7) % 9));
    }
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(P, GROUND_Y - 330, PW, 20);
  }
};

/** What's left of the house: the tower lying across it, the three of them on the couch, the TV still going. */
export const drawRuinsHouse = (ctx: Ctx, state: GameState) => {
  const hx = COURSE.ruins.house, y = RUINS_Y, f = state.frame;
  if (hx + 700 < state.camera.x || hx - 700 > state.camera.x + W) return;
  // The walls, what's standing of them
  ctx.fillStyle = '#9E6B5C'; ctx.beginPath(); ctx.moveTo(hx - 260, y); ctx.lineTo(hx - 260, y - 150); ctx.lineTo(hx - 200, y - 120); ctx.lineTo(hx - 170, y - 170); ctx.lineTo(hx - 120, y - 90); ctx.lineTo(hx - 120, y); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx + 180, y); ctx.lineTo(hx + 180, y - 110); ctx.lineTo(hx + 230, y - 160); ctx.lineTo(hx + 260, y - 70); ctx.lineTo(hx + 260, y); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let yy = y - 150; yy < y; yy += 9) { ctx.fillRect(hx - 260, yy, 140, 1); ctx.fillRect(hx + 180, yy, 80, 1); }
  // The water tower, down across it: legs up in the air off to the left, the tank crushed into the middle of the house
  ctx.save(); ctx.translate(hx - 40, y - 10); ctx.rotate(-1.45);
  drawWaterTower(ctx, 0, 0, 1.1, 0.95, 0, true);
  ctx.restore();
  // The couch, and them on it (bones, sat just where they were)
  ctx.fillStyle = '#4D5A2E'; ctx.fillRect(hx + 40, y - 34, 120, 34); ctx.fillRect(hx + 36, y - 52, 128, 18);
  for (let i = 0; i < 3; i++) {
    const px = hx + 62 + i * 38, s = i === 2 ? 0.75 : 1;
    ctx.fillStyle = '#E7E5D6'; ctx.beginPath(); ctx.arc(px, y - 60 * s - 12, 7 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1C1917'; ctx.fillRect(px - 4 * s, y - 62 * s - 14, 3 * s, 3 * s); ctx.fillRect(px + 1, y - 62 * s - 14, 3 * s, 3 * s);
    ctx.strokeStyle = '#E7E5D6'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(px, y - 60 * s - 5); ctx.lineTo(px, y - 34); for (let r = y - 60 * s; r < y - 38; r += 6) { ctx.moveTo(px - 7, r); ctx.lineTo(px + 7, r); } ctx.stroke();
  }
  // The TV on its side, still on
  ctx.fillStyle = '#1C1917'; ctx.fillRect(hx + 190, y - 50, 60, 46); ctx.fillStyle = f % 6 < 3 ? '#E5E7EB' : '#9CA3AF'; ctx.fillRect(hx + 196, y - 44, 48, 34);
  // The water, pooled and smoking
  ctx.fillStyle = 'rgba(92, 104, 36, 0.8)'; ctx.beginPath(); ctx.ellipse(hx, y - 2, 300, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(163, 190, 120, 0.25)'; for (let k = 0; k < 5; k++) { const t = ((f * 0.6 + k * 30) % 150) / 150; ctx.beginPath(); ctx.arc(hx - 200 + k * 100, y - 10 - t * 100, 8 + t * 18, 0, Math.PI * 2); ctx.fill(); }
};

/** The suit coming off him in the ruins: strips of yellow melting down him and away (over him, while it goes). */
export const drawSuitMelt = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  if (rt.escape.phase !== 'melt') return;
  const p = state.player;
  const k = clamp01(rt.escape.t / (MELT_FRAMES - 30));
  ctx.save();
  ctx.globalAlpha = 1 - k;
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(p.pos.x - 2, p.pos.y + k * 40, p.width + 4, p.height - k * 40);
  ctx.globalAlpha = 1;
  for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(250, 204, 21, 0.8)'; ctx.fillRect(p.pos.x + i * 8, p.pos.y + p.height - 4 + ((state.frame + i * 7) % 12), 4, 6); }
  ctx.fillStyle = 'rgba(214, 211, 209, 0.5)'; for (let i = 0; i < 3; i++) { const t = ((state.frame + i * 20) % 60) / 60; ctx.beginPath(); ctx.arc(p.pos.x + 10 + i * 12, p.pos.y - t * 40, 6 + t * 8, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The blast out of the cistern
// ---------------------------------------------------------------------------

/**
 * The floor going under him just before (bubbling, cracking, a glow coming up through it), then the column of sewage
 * that fires him up and out: thick, churning, a hot bright core, streaks racing up it, junk in it, a crown of spray where
 * it bursts out of the floor, and droplets flying off its sides.
 */
export const drawBlast = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  const es = rt.escape;
  const x = COURSE.sewer.cistern.rack, floor = GROUND_Y;
  const f = state.frame;
  if (es.phase === 'suit' && es.t > 50) {
    // The tell: something coming up under him
    const k = clamp01((es.t - 50) / 50);
    const g = ctx.createRadialGradient(x, floor, 4, x, floor, 30 + k * 60);
    g.addColorStop(0, `rgba(217, 249, 157, ${0.8 * k})`); g.addColorStop(1, 'rgba(101, 163, 13, 0)');
    ctx.fillStyle = g; ctx.fillRect(x - 100, floor - 90, 200, 110);
    ctx.strokeStyle = `rgba(190, 242, 100, ${0.5 + k * 0.5})`; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI - Math.PI, len = 10 + k * 40 * (0.6 + hash(i) * 0.6);
      ctx.beginPath(); ctx.moveTo(x, floor + 2); ctx.lineTo(x + Math.cos(a) * len * 0.5, floor + 2 - 3); ctx.lineTo(x + Math.cos(a) * len, floor + 2); ctx.stroke();
    }
    for (let i = 0; i < 6; i++) {
      const q = ((f * (1 + k) + i * 13) % 30) / 30;
      ctx.fillStyle = `rgba(190, 242, 100, ${0.9 * (1 - q)})`;
      ctx.beginPath(); ctx.arc(x - 30 + hash(i + 3) * 60, floor - q * 22 * k, 2 + q * 4, 0, Math.PI * 2); ctx.fill();
    }
    return;
  }
  if (es.phase !== 'blast') return;
  const t = es.t;
  const top = state.camera.y - 40;
  // (never below nothing: a negative size to draw an ellipse at throws, and that stops the whole game drawing)
  const w = Math.max(2, Math.min(1, t / 5) * 64 + Math.sin(f * 0.9) * 4);
  // A glow round it
  const glow = ctx.createLinearGradient(x - w * 2.2, 0, x + w * 2.2, 0);
  glow.addColorStop(0, 'rgba(163, 230, 53, 0)'); glow.addColorStop(0.5, 'rgba(163, 230, 53, 0.35)'); glow.addColorStop(1, 'rgba(163, 230, 53, 0)');
  ctx.fillStyle = glow; ctx.fillRect(x - w * 2.2, top, w * 4.4, floor - top);
  // The column: wobbling edges, dark outside, bright inside
  const column = (half: number, color: string, phase: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let y = floor; y >= top; y -= 16) ctx.lineTo(x - half - Math.sin(y * 0.05 + f * 0.8 + phase) * half * 0.18, y);
    for (let y = top; y <= floor; y += 16) ctx.lineTo(x + half + Math.sin(y * 0.045 - f * 0.7 + phase) * half * 0.18, y);
    ctx.closePath(); ctx.fill();
  };
  column(w, '#3F6212', 0);
  column(w * 0.72, '#65A30D', 1.3);
  column(w * 0.4, '#BEF264', 2.1);
  column(w * 0.16, '#F7FEE7', 3);
  // Streaks racing up it
  ctx.strokeStyle = 'rgba(247, 254, 231, 0.7)'; ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const sx = x + (hash(i) - 0.5) * w * 1.3, sy = floor - ((f * 34 + i * 97) % (floor - top + 200));
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - 40 - hash(i + 9) * 50); ctx.stroke();
  }
  // Junk going up in it: bones, a can, a tire
  for (let i = 0; i < 5; i++) {
    const jy = floor - ((f * 26 + i * 173) % (floor - top + 100)), jx = x + (hash(i + 20) - 0.5) * w;
    ctx.save(); ctx.translate(jx, jy); ctx.rotate(f * 0.3 + i);
    ctx.fillStyle = i % 3 === 0 ? '#E7E5D6' : i % 3 === 1 ? '#78716C' : '#1C1917';
    if (i % 3 === 2) { ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(-8, -3, 16, 6);
    ctx.restore();
  }
  // Where it bursts out of the floor: a crown of spray
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI / 2 + (i / 13 - 0.5) * 2.6, q = ((f * 2 + i * 7) % 24) / 24;
    const r = w * 0.8 + q * 90;
    ctx.fillStyle = `rgba(${i % 2 ? '190, 242, 100' : '101, 163, 13'}, ${0.9 * (1 - q)})`;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, floor + Math.sin(a) * r * 0.6, 5 + (1 - q) * 6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#65A30D'; ctx.beginPath(); ctx.ellipse(x, floor, w * 1.6, 14, 0, Math.PI, 0); ctx.fill();
  // Droplets flung off its sides all the way up
  for (let i = 0; i < 16; i++) {
    const dy = floor - hash(i + 40) * (floor - top), side = i % 2 ? 1 : -1, q = ((f * 3 + i * 11) % 30) / 30;
    ctx.fillStyle = `rgba(190, 242, 100, ${0.85 * (1 - q)})`;
    ctx.beginPath(); ctx.arc(x + side * (w + q * 60), dy - q * 30, 3 + (1 - q) * 3, 0, Math.PI * 2); ctx.fill();
  }
};
