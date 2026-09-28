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
import { COURSE, RUINS_Y } from './course';
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

/** The tower: the cover through it, the water out of it, him onto it, and over it goes. */
const drawTowerScene = (ctx: Ctx, state: GameState, t: number) => {
  drawStreetSky(ctx, { ...state, camera: { x: COURSE.road.x2, y: GROUND_Y - 550 } } as GameState, 0.85);
  const tx = 420, ty = 540, s = 1.55;
  const hitAt = 100, landAt = 150;
  const tilt = t > landAt ? Math.min(0.32, ((t - landAt) / (TOWER_FRAMES - landAt)) ** 2 * 0.32) : 0;
  const shake = (t > hitAt && t < hitAt + 12) || (t > landAt && t < landAt + 14) ? (Math.random() - 0.5) * 10 : 0;
  ctx.save(); ctx.translate(shake, 0);
  drawWaterTower(ctx, tx, ty, s, 0.85, tilt, t >= hitAt);
  // The hole, and the water out of it: an arc of it, brown-green, pouring off
  if (t >= hitAt) {
    const hx = tx + (-20 * Math.cos(tilt) + 196 * Math.sin(tilt)) * s, hy = ty + (-196 * Math.cos(tilt) - 20 * Math.sin(tilt)) * s;
    const k = clamp01((t - hitAt) / 30);
    ctx.strokeStyle = 'rgba(120, 140, 60, 0.85)'; ctx.lineWidth = 14 * k;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx - 90, hy - 10, hx - 150, H); ctx.stroke();
    ctx.fillStyle = 'rgba(190, 200, 120, 0.6)'; for (let i = 0; i < 8; i++) { const q = ((t * 3 + i * 17) % 100) / 100; ctx.fillRect(hx - q * 150 - 6, hy + q * q * (H - hy) - 4, 5, 10); }
  }
  // The manhole cover, spinning up out of the bottom of the screen at the tank
  if (t < hitAt) {
    const k = t / hitAt;
    const x = 160 + (tx - 20 * s - 160) * k, y = H + 40 - (H + 40 - (ty - 196 * s)) * (1 - (1 - k) * (1 - k));
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.5);
    ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 6 + Math.abs(Math.sin(t * 0.5)) * 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // Him: up after it, over the top, and down onto the tank's roof
  if (t > 40) {
    const k = clamp01((t - 40) / (landAt - 40));
    const topX = tx + 270 * Math.sin(tilt) * s, topY = ty - 270 * Math.cos(tilt) * s;
    const x = 120 + (topX - 120) * k, y = H + 60 - (H + 60 - topY) * k - Math.sin(k * Math.PI) * 120;
    suitedMan(ctx, x, y, 1.1, t < landAt ? t * 0.3 : tilt);
  }
  ctx.restore();
  if (t > hitAt && t < hitAt + 8) { ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(0, 0, W, H); }
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
  ctx.save(); ctx.beginPath(); ctx.rect(480, 100, 210, 150); ctx.clip();
  const lean = 0.25 + dark * 1.0;
  drawWaterTower(ctx, 560, 420, 1.1 + dark * 0.8, 0.9, lean, true);
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
    ctx.fillStyle = '#6B7280'; ctx.beginPath(); ctx.ellipse(430, -260 + k * 420, 330, 180, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1E3A8A'; ctx.font = 'bold 40px "Press Start 2P"'; ctx.save(); ctx.translate(360, -200 + k * 420); ctx.rotate(0.2); ctx.fillText('FLINT', -60, 0); ctx.restore();
    for (let i = 0; i < 18; i++) { ctx.fillStyle = i % 2 ? '#78716C' : '#A8A29E'; ctx.fillRect(hash(i) * W, -40 + k * (200 + hash(i * 3) * 300), 20 + hash(i * 5) * 30, 12); }
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
