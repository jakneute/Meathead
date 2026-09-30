// The way out, drawn. Cut scenes over the whole screen: the street, the manhole
// cover blasting up out of it and him after it; the water tower (the cover
// through its tank, him slamming into it, and over it goes onto the next block,
// the tank bursting); him surfing the cover down the street on the front of the
// wave, the houses going under and melting away; the family on their couch in
// front of the TV (the room getting darker, the window filling up with the
// wave); the wave through the wall, and close up, eating them to the bone. Then
// the ruins: a block's worth of houses washed out and melted, the three of them
// on what's left of their couch, the TV still on, and past it, the pit.

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { COURSE, RUINS_Y, CAVERN_ROOF } from './course';
import type { TommyRuntime } from './runtime';
import { TOWER_FRAMES, SURF_FRAMES, FAMILY_FRAMES, CRUSH_FRAMES, MELT_FRAMES, LAUNCH, COVER_HIT, MAN_HIT, TOWER_DOWN, inSkippable } from './escape';
import { SKIP_AFTER, drawSkipPrompt } from '../../platform/skip';
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
  if (es.phase === 'tower') { if (es.t < LAUNCH) drawLaunchScene(ctx, state, es.t); else drawTowerScene(ctx, state, es.t - LAUNCH); }
  else if (es.phase === 'surf') drawSurfScene(ctx, state, es.t);
  else if (es.phase === 'family') drawFamilyScene(ctx, state, rt, es.t, 0);
  else if (es.phase === 'crush') drawFamilyScene(ctx, state, rt, FAMILY_FRAMES, es.t);
};

/** SKIP >> while the scene can be skipped (from the blast out of the cistern to the ruins). */
export const drawEscapeSkip = (ctx: Ctx, rt: TommyRuntime) => { if (inSkippable(rt.escape) && rt.escape.sceneT > SKIP_AFTER) drawSkipPrompt(ctx, W); };

/** A manhole cover, spinning (edge-on and face-on as it turns), at (x, y). */
const drawCover = (ctx: Ctx, x: number, y: number, spin: number, s = 1) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 6 + Math.abs(Math.sin(spin)) * 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#292524'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
};

/**
 * The street at the foot of the tower, dusk: a manhole in the road. It shudders, then the cover blasts up out of it
 * spinning, a geyser of the stuff after it, and him after that, up out of the top of the screen.
 */
const drawLaunchScene = (ctx: Ctx, state: GameState, t: number) => {
  const shake = t >= 8 && t < 26 ? (Math.random() - 0.5) * 14 : t >= 34 && t < 46 ? (Math.random() - 0.5) * 8 : t < 8 ? (Math.random() - 0.5) * 3 : 0;
  ctx.save(); ctx.translate(shake, shake * 0.6);
  drawStreetSky(ctx, { ...state, camera: { x: COURSE.road.x2 - 400, y: GROUND_Y - 550 } } as GameState, 0.85, true);
  // The road, the curb, a house or two across it
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(-20, 470, W + 40, 150);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(-20, 458, W + 40, 12);
  ctx.fillStyle = '#FDE68A'; for (let x = 0; x < W; x += 90) ctx.fillRect(x, 540, 50, 5);
  drawHouse(ctx, 120, 458, 0.9, 0);
  drawHouse(ctx, 640, 458, 0.85, 3);
  // The manhole
  const mx = 400, my = 500;
  ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(mx, my, 34, 10, 0, 0, Math.PI * 2); ctx.fill();
  if (t < 8) drawCover(ctx, mx + (Math.random() - 0.5) * 3, my - 2 - Math.random() * 3, 0, 1.5);
  // The cover, blasted up spinning
  if (t >= 8) { const k = (t - 8) * 26; if (my - k > -60) drawCover(ctx, mx, my - k, t * 0.8, 1.5); }
  // The geyser after it
  if (t >= 8) {
    const h = Math.min(1, (t - 8) / 8) * (my + 60);
    ctx.fillStyle = '#65A30D'; ctx.fillRect(mx - 22, my - h, 44, h);
    ctx.fillStyle = '#BEF264'; ctx.fillRect(mx - 10, my - h, 20, h);
    for (let i = 0; i < 12; i++) { const q = ((t * 3 + i * 9) % 30) / 30; ctx.fillStyle = `rgba(190, 242, 100, ${1 - q})`; ctx.beginPath(); ctx.arc(mx + (i % 2 ? 1 : -1) * (24 + q * 70), my - q * 40, 5, 0, Math.PI * 2); ctx.fill(); }
  }
  // Him, after it, in his suit, arms up
  if (t >= 34) { const y = my - (t - 34) * 30; if (y > -100) { suitedMan(ctx, mx, y, 1.6, Math.sin(t) * 0.1); ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)'; ctx.lineWidth = 3; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(mx + i * 12, y + 10); ctx.lineTo(mx + i * 12, y + 90); ctx.stroke(); } } }
  ctx.restore();
  if (t >= 8 && t < 12) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, 0, W, H); }
  // (a moment of black in, and out: the cut)
  if (t < 4) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 4})`; ctx.fillRect(0, 0, W, H); }
};

/** A little house on the block (its door at x, its floor at y): walls, a roof, windows, a porch light. */
const HOUSE_COLORS = ['#9E6B5C', '#7D8C9E', '#B8A27A', '#7C9A6E', '#A7766C', '#8B7FA3'];
const drawHouse = (ctx: Ctx, x: number, y: number, s: number, seed: number) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = HOUSE_COLORS[seed % HOUSE_COLORS.length]; ctx.fillRect(-80, -110, 160, 110);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let yy = -104; yy < 0; yy += 9) ctx.fillRect(-80, yy, 160, 1);
  ctx.fillStyle = ['#3F2A1D', '#4B5563', '#57534E'][seed % 3]; ctx.beginPath(); ctx.moveTo(-94, -108); ctx.lineTo(0, -168); ctx.lineTo(94, -108); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(-62, -86, 34, 28); ctx.fillRect(28, -86, 34, 28);
  ctx.fillStyle = '#44403C'; ctx.fillRect(-62, -73, 34, 2); ctx.fillRect(-46, -86, 2, 28); ctx.fillRect(28, -73, 34, 2); ctx.fillRect(44, -86, 2, 28);
  ctx.fillStyle = '#5B3A29'; ctx.fillRect(-14, -58, 28, 58);
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(18, -60, 5, 6);
  ctx.restore();
};

/**
 * The tower: the cover through its tank (the town's water jetting out of the hole), him slamming into it after (a dent,
 * a CLANG, him bouncing off it), and over it goes, onto the next block over: slow at first, then all at once, the tank
 * bursting as it hits and the water going out of it in a wave. A push in the whole time, a punch at every impact.
 */
const drawTowerScene = (ctx: Ctx, state: GameState, t: number) => {
  const tx = 330, ty = 540, s = 1.45;
  // Over it goes: a shudder, then faster and faster (to the right: onto the block over there)
  const lean = clamp01((t - MAN_HIT - 10) / (TOWER_DOWN - MAN_HIT - 10));
  const tilt = t > MAN_HIT ? lean * lean * lean * 1.35 + (t < MAN_HIT + 30 ? Math.sin(t * 0.9) * 0.015 : 0) : 0;
  const punch = (at: number) => (t >= at && t < at + 22 ? Math.sin(((t - at) / 22) * Math.PI) : 0);
  const zoom = 1 + Math.min(t, TOWER_DOWN) / TOWER_DOWN * 0.08 + punch(COVER_HIT) * 0.1 + punch(MAN_HIT) * 0.08 + punch(TOWER_DOWN) * 0.12;
  const shakeK = Math.max(punch(COVER_HIT) * 16, punch(MAN_HIT) * 14, punch(TOWER_DOWN) * 26, t > MAN_HIT + 20 && t < TOWER_DOWN ? lean * 5 : 0);
  const sx = (Math.random() - 0.5) * shakeK, sy = (Math.random() - 0.5) * shakeK;
  ctx.save();
  ctx.translate(W / 2 + sx, H * 0.55 + sy); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H * 0.55);
  drawStreetSky(ctx, { ...state, camera: { x: COURSE.road.x2 + t * 4, y: GROUND_Y - 550 } } as GameState, 0.85, false);
  // The block over there it's going to come down on
  for (let i = 0; i < 4; i++) drawHouse(ctx, 560 + i * 130, 560, 0.55, i + 2);
  if (t > MAN_HIT + 30) for (let i = 0; i < 6; i++) { const q = ((t * 1.3 + i * 20) % 90) / 90; ctx.fillStyle = `rgba(120, 100, 90, ${0.5 * (1 - q)})`; ctx.beginPath(); ctx.arc(tx - 60 + i * 24 + q * 30 * (i % 2 ? 1 : -1), ty - q * 40, 10 + q * 20, 0, Math.PI * 2); ctx.fill(); }
  const down = t >= TOWER_DOWN;
  if (!down) drawWaterTower(ctx, tx, ty, s, 0.85, tilt, t >= COVER_HIT);
  else {
    // Down across the block, the tank burst open, the wave going out of it
    drawWaterTower(ctx, tx, ty, s, 0.85, 1.35, true);
    const k = clamp01((t - TOWER_DOWN) / 30);
    ctx.fillStyle = 'rgba(92, 104, 36, 0.9)';
    ctx.beginPath(); ctx.moveTo(560, 580); ctx.quadraticCurveTo(620 + k * 200, 560 - 180 * k, 700 + k * 400, 560 - 120 * k); ctx.lineTo(W + 60, 600); ctx.lineTo(560, 620); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 14; i++) { const q = ((t * 3 + i * 13) % 40) / 40; ctx.fillStyle = `rgba(217, 249, 157, ${0.8 * (1 - q)})`; ctx.beginPath(); ctx.arc(620 + i * 30 + q * 60, 540 - 120 * k - q * 50 + (i % 3) * 20, 6 + q * 8, 0, Math.PI * 2); ctx.fill(); }
  }
  const tank = (u: number) => ({ x: tx + (-20 * Math.cos(u) + 196 * Math.sin(u)) * s, y: ty + (-196 * Math.cos(u) - 20 * Math.sin(u)) * s });
  const hole = tank(tilt);
  // The water jetting out of the hole
  if (t >= COVER_HIT && !down) {
    const k = clamp01((t - COVER_HIT) / 12);
    ctx.strokeStyle = 'rgba(120, 140, 60, 0.9)'; ctx.lineWidth = 22 * k; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hole.x, hole.y); ctx.quadraticCurveTo(hole.x - 140, hole.y - 30, hole.x - 210, H + 40); ctx.stroke();
    ctx.fillStyle = 'rgba(190, 200, 120, 0.8)';
    for (let i = 0; i < 16; i++) { const q = ((t * 4 + i * 23) % 100) / 100; ctx.fillRect(hole.x - q * 210 - 10 + Math.sin(i * 3) * 18 * q, hole.y + q * q * (H - hole.y) - 10, 5, 5); }
  }
  // The hits: a flash and a ring, shards flying
  for (const at of [COVER_HIT, MAN_HIT]) if (t >= at && t < at + 45 && !down) {
    const k = (t - at) / 45, c = at === COVER_HIT ? hole : tank(tilt * 0.5);
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - k})`; ctx.lineWidth = 6 * (1 - k);
    ctx.beginPath(); ctx.arc(c.x, c.y, 20 + k * 180, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#8E9AAB';
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.3, d = k * (120 + (i % 3) * 60); ctx.save(); ctx.translate(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d + k * k * 160); ctx.rotate(t * 0.4 + i); ctx.fillRect(-6, -3, 12, 6); ctx.restore(); }
  }
  // The cover: up out of the bottom of the screen at the tank (then, through it, dropping away on the far side)
  if (t < COVER_HIT) {
    const k = clamp01(t / COVER_HIT);
    drawCover(ctx, 120 + (hole.x - 120) * k, H + 60 - (H + 60 - hole.y) * (1 - (1 - k) * (1 - k)), t * 0.7, 1.2);
  } else if (!down) drawCover(ctx, hole.x + (t - COVER_HIT) * 3, hole.y + (t - COVER_HIT) ** 2 * 0.08, t * 0.5, 1.2);
  // Him: blasted up after it, straight into the side of the tank, and off it
  if (t > 15 && !down) {
    const hit = tank(0);
    if (t < MAN_HIT) {
      const k = clamp01((t - 15) / (MAN_HIT - 15));
      suitedMan(ctx, 90 + (hit.x - 30 - 90) * k, H + 80 - (H + 80 - hit.y - 40) * (1 - (1 - k) * (1 - k)), 1.2, t * 0.35);
    } else {
      // (splatted against it a moment, then off, falling back, tumbling)
      const u = t - MAN_HIT;
      const x = hit.x - 30 - u * 1.2, y = hit.y + 40 + (u > 10 ? (u - 10) ** 2 * 0.05 : 0);
      ctx.save(); ctx.translate(x, y); ctx.scale(u < 10 ? 0.7 : 1, 1); suitedMan(ctx, 0, 0, 1.2, u < 10 ? 0 : (u - 10) * -0.2); ctx.restore();
      if (u < 30) {
        const k = u / 30;
        ctx.save(); ctx.translate(hit.x + 40, hit.y - 40); ctx.rotate(-0.2); ctx.scale(1 + k * 0.4, 1 + k * 0.4);
        ctx.fillStyle = `rgba(253, 224, 71, ${1 - k})`; ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 22 : 44; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
        ctx.fillStyle = `rgba(28, 25, 23, ${1 - k})`; ctx.font = 'bold 13px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('CLANG', 0, 6); ctx.textAlign = 'left';
        ctx.restore();
      }
    }
  }
  ctx.restore();
  if ((t > COVER_HIT && t < COVER_HIT + 5) || (t > TOWER_DOWN && t < TOWER_DOWN + 8)) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  // (out to white as the wave goes)
  if (t > TOWER_FRAMES - LAUNCH - 14) { ctx.fillStyle = `rgba(255,255,255,${(t - (TOWER_FRAMES - LAUNCH - 14)) / 14})`; ctx.fillRect(0, 0, W, H); }
  bubble(ctx, state, 'meathead', 260, 150);
};

/**
 * Down the street on the front of the wave: him on the cover up on its crest, in his suit, riding it (knees bent, arms
 * out); the block going by, and every house the wave reaches lifted, tipped over into it and melting away (a skeleton
 * or two bobbing up out of it); junk in the wave behind him.
 */
const drawSurfScene = (ctx: Ctx, state: GameState, t: number) => {
  const f = state.frame;
  drawStreetSky(ctx, { ...state, camera: { x: COURSE.road.x2 + 2000 + t * 3, y: GROUND_Y - 550 } } as GameState, 0.9, false);
  const scroll = t * 7;
  // The street, going by
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(0, 500, W, 100);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(0, 488, W, 12);
  ctx.fillStyle = '#FDE68A'; for (let x = -((scroll) % 90); x < W; x += 90) ctx.fillRect(x, 560, 50, 5);
  const crestX = 360 + Math.sin(t * 0.05) * 20;
  // The houses: every 280 along, reached by the wave and gone
  for (let i = 0; i < 12; i++) {
    const hx = 600 + i * 280 - scroll;
    if (hx < -200 || hx > W + 200) continue;
    const e = clamp01((crestX + 90 - hx) / 220);
    ctx.save();
    if (e > 0) { ctx.translate(hx, 488); ctx.rotate(-e * 0.6); ctx.translate(-hx, -488 - e * 20); ctx.globalAlpha = 1 - e; }
    drawHouse(ctx, hx, 488, 0.95, i);
    ctx.restore();
    if (e > 0 && e < 1) {
      // Melting: smoke and bubbles off it, a skeleton coming up out of it
      for (let k = 0; k < 4; k++) { const q = ((f * 0.8 + k * 20 + i * 7) % 60) / 60; ctx.fillStyle = `rgba(163, 190, 120, ${0.5 * (1 - q)})`; ctx.beginPath(); ctx.arc(hx - 60 + k * 40, 400 - q * 120, 12 + q * 20, 0, Math.PI * 2); ctx.fill(); }
      if (i % 2 === 0) skeleton(ctx, hx + 30, 470 - e * 60, 0.8, e * 2);
    }
  }
  // Folk out on the street and their dogs: running for it (not fast enough), then caught up, tumbling over into the
  // wave, melting down to the bone
  for (let i = 0; i < 16; i++) {
    const dog = i % 3 === 1;
    const wx = 480 + i * 170 + (i % 2) * 60 + t * (dog ? 3.2 : 2.2);
    const px = wx - scroll;
    if (px < -100 || px > W + 60) continue;
    const e = clamp01((crestX + 50 - px) / 140);
    const run = Math.sin(f * 0.6 + i) * 5;
    ctx.save();
    if (e > 0) {
      // Swept up into it: lifted, tumbling back, going under
      ctx.translate(px - e * 120, 510 - Math.sin(e * Math.PI) * 140 + e * e * 60);
      ctx.rotate(-e * 5 - i);
      ctx.globalAlpha = 1 - e;
    } else ctx.translate(px, 510);
    if (dog) {
      ctx.fillStyle = ['#78350F', '#A16207', '#1C1917'][i % 3];
      ctx.fillRect(-14, -16, 28, 10); ctx.fillRect(10, -22, 10, 10);
      ctx.fillRect(-12 + run * 0.5, -6, 4, 6); ctx.fillRect(8 - run * 0.5, -6, 4, 6); ctx.fillRect(-16, -18, 4, 3);
      if (e > 0) { ctx.strokeStyle = '#E7E5D6'; ctx.lineWidth = 2; ctx.strokeRect(-12, -15, 24, 7); }
    } else {
      const shirt = ['#DC2626', '#2563EB', '#F59E0B', '#7C3AED', '#0D9488'][i % 5], skin = ['#E0AC69', '#8D5524', '#C68642', '#F2C9A0'][i % 4];
      ctx.fillStyle = '#1F2937'; ctx.fillRect(-7 + run * 0.4, -24, 6, 24); ctx.fillRect(2 - run * 0.4, -24, 6, 24);
      ctx.fillStyle = shirt; ctx.fillRect(-9, -50, 18, 27);
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -58, 8, 0, Math.PI * 2); ctx.fill();
      // (arms up, running for it; looking back at it)
      ctx.fillRect(-13, -66 + run * 0.3, 4, 16); ctx.fillRect(9, -66 - run * 0.3, 4, 16);
      ctx.fillStyle = '#450A0A'; ctx.beginPath(); ctx.ellipse(-3, -56, 2.5, 3, 0, 0, Math.PI * 2); ctx.fill();
      if (e > 0.3) skeleton(ctx, 0, 0, 0.7, (e - 0.3) * 2);
    }
    ctx.restore();
    // (and they're screaming)
    if (!dog && e === 0 && px < crestX + 260 && i % 2 === 0) { ctx.save(); ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillStyle = '#FEF9C3'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeText('AAAH!', px - 16, 440); ctx.fillText('AAAH!', px - 16, 440); ctx.restore(); }
  }
  // The wave: a wall of it from the left up to the crest, curling over, foam along the top, junk in it
  const top = 250 + Math.sin(t * 0.08) * 10;
  const g = ctx.createLinearGradient(0, top, 0, H);
  g.addColorStop(0, '#84A13A'); g.addColorStop(0.4, '#5C6824'); g.addColorStop(1, '#3A4217');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-20, H); ctx.lineTo(-20, top - 20);
  for (let x = -20; x <= crestX; x += 20) ctx.lineTo(x, top - 20 + Math.sin(x * 0.03 + t * 0.2) * 10);
  ctx.quadraticCurveTo(crestX + 80, top - 30, crestX + 60, top + 60);
  ctx.quadraticCurveTo(crestX + 110, top + 160, crestX + 160, H);
  ctx.closePath(); ctx.fill();
  // (its lip curling over, and foam)
  ctx.fillStyle = 'rgba(217, 249, 157, 0.85)';
  for (let x = -20; x <= crestX + 60; x += 14) ctx.fillRect(x, top - 24 + Math.sin(x * 0.03 + t * 0.2) * 10, 10, 6);
  for (let i = 0; i < 10; i++) { const q = ((t * 3 + i * 11) % 40) / 40; ctx.fillStyle = `rgba(217, 249, 157, ${0.8 * (1 - q)})`; ctx.beginPath(); ctx.arc(crestX + 60 + q * 60, top + 40 + i * 20 - q * 30, 5 + q * 6, 0, Math.PI * 2); ctx.fill(); }
  // Junk tumbling in it: a car, a mailbox, a couch, a skeleton
  for (let i = 0; i < 5; i++) {
    const jx = ((i * 173 + t * 2) % (crestX + 40)), jy = top + 60 + (i * 67) % 200;
    ctx.save(); ctx.translate(jx, jy); ctx.rotate(t * 0.05 + i);
    ctx.fillStyle = ['#DC2626', '#1E3A8A', '#65743F', '#E7E5D6', '#44403C'][i];
    if (i === 3) skeleton(ctx, 0, 0, 0.6, 1); else ctx.fillRect(-18, -8, 36, 16);
    ctx.restore();
  }
  // Him, on the cover on the crest, riding it
  const bob = Math.sin(t * 0.15) * 6;
  const rx = crestX - 20, ry = top - 26 + bob;
  ctx.save(); ctx.translate(rx, ry); ctx.rotate(-0.12 + Math.sin(t * 0.1) * 0.08);
  drawCover(ctx, 0, 6, 1.4, 1.6);
  ctx.restore();
  suitedMan(ctx, rx, ry, 1.3, -0.1 + Math.sin(t * 0.1) * 0.06);
  // (arms out for balance)
  ctx.fillStyle = '#FACC15'; ctx.save(); ctx.translate(rx, ry - 60); ctx.rotate(Math.sin(t * 0.2) * 0.2); ctx.fillRect(-44, -4, 88, 8); ctx.restore();
  // Spray off the front of it
  for (let i = 0; i < 8; i++) { const q = ((t * 4 + i * 9) % 30) / 30; ctx.fillStyle = `rgba(190, 242, 100, ${0.9 * (1 - q)})`; ctx.fillRect(rx + 30 + q * 80, ry - q * 40 + i * 3, 5, 5); }
  if (t < 12) { ctx.fillStyle = `rgba(255,255,255,${1 - t / 12})`; ctx.fillRect(0, 0, W, H); }
  bubble(ctx, state, 'meathead', rx, ry - 110);
  void SURF_FRAMES;
};

/** A skeleton (bones, grinning), upright at its feet (x, y), `s` big. */
const skeleton = (ctx: Ctx, x: number, y: number, s: number, a = 1) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= Math.min(1, a);
  ctx.fillStyle = '#E7E5D6'; ctx.beginPath(); ctx.arc(0, -70, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-6, -74, 4, 4); ctx.fillRect(2, -74, 4, 4); ctx.fillRect(-4, -64, 8, 2);
  ctx.strokeStyle = '#E7E5D6'; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(0, -58); ctx.lineTo(0, -24); for (let r = -54; r < -30; r += 6) { ctx.moveTo(-10, r); ctx.lineTo(10, r); }
  ctx.moveTo(0, -24); ctx.lineTo(-8, 0); ctx.moveTo(0, -24); ctx.lineTo(8, 0); ctx.moveTo(0, -52); ctx.lineTo(-16, -30); ctx.moveTo(0, -52); ctx.lineTo(16, -30);
  ctx.stroke();
  ctx.restore();
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
  // (the wave coming up the street at the window: a green wall rising in it, foam along the top, till it fills it)
  ctx.save(); ctx.beginPath(); ctx.rect(480, 100, 210, 150); ctx.clip();
  const come = dark * dark;
  if (crushT === 0) {
    const wy = 250 - come * 170;
    ctx.fillStyle = '#5C6824'; ctx.fillRect(480, wy, 210, 260);
    ctx.fillStyle = '#84A13A'; ctx.beginPath(); ctx.moveTo(480, wy + 10); for (let x = 480; x <= 690; x += 15) ctx.lineTo(x, wy + Math.sin(x * 0.08 + f * 0.2) * 6); ctx.lineTo(690, wy + 30); ctx.lineTo(480, wy + 30); ctx.fill();
    ctx.fillStyle = 'rgba(217, 249, 157, 0.9)'; for (let x = 480; x <= 690; x += 12) ctx.fillRect(x, wy - 3 + Math.sin(x * 0.08 + f * 0.2) * 6, 8, 4);
    // (a car and a mailbox going by in it)
    ctx.fillStyle = '#DC2626'; ctx.fillRect(500 + (f * 2) % 180, wy + 40, 30, 12); ctx.fillStyle = '#1E3A8A'; ctx.fillRect(620 - (f * 1.3) % 140, wy + 70, 10, 16);
  } else { ctx.fillStyle = '#3A4217'; ctx.fillRect(480, 100, 210, 150); }
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
  // The wave through the window and the wall round it, filling the room
  if (crushT > 0) {
    const k = clamp01(crushT / 30);
    for (let i = 0; i < 18; i++) {
      const sx = 480 + hash(i) * 210, sy = 100 + hash(i * 3) * 150;
      const dx = (sx - 585) * (1 + k * 3) - k * 120, dy = k * (160 + hash(i * 5) * 300);
      ctx.save(); ctx.translate(585 + dx, sy + dy); ctx.rotate(k * (hash(i * 7) - 0.5) * 8);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(191, 219, 254, 0.8)' : i % 3 === 1 ? '#78716C' : '#5B3A29';
      ctx.fillRect(-10 - hash(i * 9) * 12, -6, 20 + hash(i * 9) * 24, 12);
      ctx.restore();
    }
    const flood = clamp01((crushT - 6) / 50);
    ctx.fillStyle = 'rgba(92, 104, 36, 0.8)';
    ctx.beginPath(); ctx.moveTo(W, 90); ctx.quadraticCurveTo(W - flood * 500, 200, W - flood * 900, H); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.fillRect(0, H - flood * 300, W, flood * 300);
    ctx.fillStyle = 'rgba(217, 249, 157, 0.6)'; for (let i = 0; i < 12; i++) { const x = (i * 71 + crushT * 5) % W; ctx.beginPath(); ctx.arc(x, H - flood * 300 + 4, 4, 0, Math.PI * 2); ctx.fill(); }
    if (crushT < 8) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, 0, W, H); }
    // Close up on them: in it, the skin coming away (sizzling, smoking) from the top down to the bone
    if (crushT > 40) drawBurnCloseUp(ctx, f, crushT);
    const out = clamp01((crushT - (CRUSH_FRAMES - 40)) / 40);
    if (out > 0) { ctx.fillStyle = `rgba(0,0,0,${out})`; ctx.fillRect(0, 0, W, H); }
  }
  bubble(ctx, state, 'dad', 300, 300); bubble(ctx, state, 'mom', 400, 300); bubble(ctx, state, 'kid', 490, 330);
  void rt;
};

/**
 * Close up on the three of them on the couch as the wave eats them: pushed right in, the green stuff over them, and
 * each one's skin burning away from the top down (a line of fizz working down them, smoke coming off), the bones left
 * sat there grinning.
 */
const drawBurnCloseUp = (ctx: Ctx, f: number, crushT: number) => {
  const zin = clamp01((crushT - 40) / 20);
  ctx.save();
  ctx.globalAlpha = zin;
  ctx.fillStyle = '#3A4217'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#4D5A2E'; ctx.fillRect(40, 380, 720, 220);
  const burn = clamp01((crushT - 70) / 110);
  const people: [number, string, string, number][] = [[190, '#1D4ED8', '#E0AC69', 2.1], [400, '#BE185D', '#E0AC69', 2.0], [610, '#16A34A', '#E0AC69', 1.6]];
  people.forEach(([x, shirt, skin, sc], i) => {
    ctx.save(); ctx.translate(x, 470); ctx.scale(sc, sc);
    // (their mouths open: screaming)
    const b = clamp01(burn * 1.3 - i * 0.12);
    const cut = -120 + b * 130;
    skeleton(ctx, 0, 40, 1.2);
    ctx.save(); ctx.beginPath(); ctx.rect(-40, cut, 80, 200); ctx.clip();
    ctx.fillStyle = shirt; ctx.fillRect(-20, -70, 40, 60);
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -88, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.fillRect(4, -94, 4, 4); ctx.fillRect(-8, -94, 4, 4);
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(0, -78, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // The line it's burning along: fizz and smoke
    if (b > 0 && b < 1) {
      ctx.fillStyle = 'rgba(217, 249, 157, 0.9)'; for (let k = 0; k < 8; k++) ctx.fillRect(-22 + k * 6, cut - 2 + Math.sin(f * 0.8 + k) * 2, 4, 4);
      for (let k = 0; k < 3; k++) { const q = ((f * 0.9 + k * 15) % 40) / 40; ctx.fillStyle = `rgba(200, 200, 180, ${0.5 * (1 - q)})`; ctx.beginPath(); ctx.arc(-10 + k * 10, cut - q * 50, 5 + q * 8, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  });
  // The green stuff over it all, bubbling
  ctx.fillStyle = 'rgba(92, 104, 36, 0.35)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(217, 249, 157, 0.6)'; for (let i = 0; i < 20; i++) { const q = ((f * 1.5 + i * 17) % 80) / 80; ctx.beginPath(); ctx.arc((i * 47) % W, H - q * H, 3 + (i % 3) * 2, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
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

/**
 * What's left of the block: a row of houses washed out and melted (walls down to stumps, a doorframe standing on its own,
 * a bathtub, a fridge on its side, the odd skeleton), theirs among them, the three of them on what's left of the couch,
 * the TV still going; the water, pooled and smoking. Off in the distance, the tower, lying where it came down.
 */
export const drawRuinsHouse = (ctx: Ctx, state: GameState) => {
  const hx = COURSE.ruins.house, y = RUINS_Y, f = state.frame;
  if (hx + 1500 < state.camera.x || hx - 1500 > state.camera.x + W) return;
  // The tower, down, off in the distance behind
  ctx.save(); ctx.globalAlpha = 0.55; ctx.translate(hx - 900, y - 40); ctx.rotate(-1.45); drawWaterTower(ctx, 0, 0, 0.7, 0.95, 0, true); ctx.restore();
  // The other houses: washed out and melted
  for (const [dx, seed] of [[-1060, 1], [-560, 4], [720, 2]] as [number, number][]) wreckedHouse(ctx, hx + dx, y, seed, f);
  // Theirs: what's standing of the walls
  ctx.fillStyle = '#9E6B5C'; ctx.beginPath(); ctx.moveTo(hx - 260, y); ctx.lineTo(hx - 260, y - 150); ctx.lineTo(hx - 200, y - 120); ctx.lineTo(hx - 170, y - 170); ctx.lineTo(hx - 120, y - 90); ctx.lineTo(hx - 120, y); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx + 180, y); ctx.lineTo(hx + 180, y - 110); ctx.lineTo(hx + 230, y - 160); ctx.lineTo(hx + 260, y - 70); ctx.lineTo(hx + 260, y); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let yy = y - 150; yy < y; yy += 9) { ctx.fillRect(hx - 260, yy, 140, 1); ctx.fillRect(hx + 180, yy, 80, 1); }
  // (the green stuff's line up the walls, and the walls eaten away under it)
  ctx.fillStyle = 'rgba(92, 104, 36, 0.35)'; ctx.fillRect(hx - 260, y - 60, 140, 60); ctx.fillRect(hx + 180, y - 60, 80, 60);
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
  drawLairSign(ctx, state);
  // The water, pooled and smoking, all along the block
  ctx.fillStyle = 'rgba(92, 104, 36, 0.8)';
  for (const [dx, w] of [[-1060, 220], [-560, 240], [0, 300], [720, 160]] as [number, number][]) { ctx.beginPath(); ctx.ellipse(hx + dx, y - 2, w, 8, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(163, 190, 120, 0.25)'; for (let k = 0; k < 10; k++) { const t = ((f * 0.6 + k * 30) % 150) / 150; ctx.beginPath(); ctx.arc(hx - 1200 + k * 200, y - 10 - t * 100, 8 + t * 18, 0, Math.PI * 2); ctx.fill(); }
};

/**
 * A big dumb neon sign on a pole right in front of the hole: TOMMY'S LAIR in green neon, chase lights round its edge,
 * and a fat arrow under it flashing, pointing straight down the hole. (Who put it up is anyone's guess.)
 */
const drawLairSign = (ctx: Ctx, state: GameState) => {
  const P = COURSE.ruins.pit, PW = COURSE.ruins.pitW, y = RUINS_Y, f = state.frame;
  const sx = P - 120, sy = y - 300;
  // (big: scaled up about its middle)
  ctx.save(); ctx.translate(sx, sy + 31); ctx.scale(1.4, 1.4); ctx.translate(-sx, -(sy + 31));
  // The pole, and a little buzzing transformer box on it
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(sx - 4, sy + 60, 8, (y - sy - 60) / 1.4 + 20);
  // The board
  ctx.fillStyle = '#18181B'; ctx.fillRect(sx - 110, sy, 220, 62);
  ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 3; ctx.strokeRect(sx - 110, sy, 220, 62);
  // Chase lights round its edge
  for (let i = 0; i < 26; i++) {
    const perim = 2 * (220 + 62), d = (i / 26) * perim;
    const [lx, ly] = d < 220 ? [sx - 110 + d, sy] : d < 282 ? [sx + 110, sy + d - 220] : d < 502 ? [sx + 110 - (d - 282), sy + 62] : [sx - 110, sy + 62 - (d - 502)];
    ctx.fillStyle = (i + Math.floor(f / 5)) % 3 === 0 ? '#FDE047' : '#713F12';
    ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2); ctx.fill();
  }
  // TOMMY'S LAIR, buzzing (it cuts out now and then)
  const on = (f % 97) > 6 && (f % 41) !== 3;
  ctx.save();
  ctx.font = 'bold 20px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.shadowColor = '#84CC16'; ctx.shadowBlur = on ? 16 : 0;
  ctx.fillStyle = on ? '#D9F99D' : '#365314';
  ctx.fillText("TOMMY'S", sx, sy + 28);
  ctx.fillText('LAIR', sx, sy + 54);
  ctx.restore();
  ctx.restore();
  // The arrow: from the sign, out over the hole and straight down it, flashing
  const lit = Math.floor(f / 12) % 2 === 0;
  ctx.save();
  ctx.strokeStyle = lit ? '#F472B6' : '#6B213F'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowColor = '#F472B6'; ctx.shadowBlur = lit ? 14 : 0;
  const ax = P + PW / 2;
  ctx.beginPath(); ctx.moveTo(sx + 154, sy + 31); ctx.lineTo(ax, sy + 31); ctx.lineTo(ax, y - 30); ctx.stroke();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath(); ctx.moveTo(ax - 22, y - 40); ctx.lineTo(ax + 22, y - 40); ctx.lineTo(ax, y - 8); ctx.closePath(); ctx.fill();
  ctx.restore();
};

/** Somebody else's house on the block, after: stumps of wall, a doorframe on its own, a tub or a fridge, a skeleton. */
const wreckedHouse = (ctx: Ctx, x: number, y: number, seed: number, f: number) => {
  ctx.fillStyle = HOUSE_COLORS[seed % HOUSE_COLORS.length];
  ctx.beginPath(); ctx.moveTo(x - 140, y); ctx.lineTo(x - 140, y - 70 - seed * 8); ctx.lineTo(x - 110, y - 40); ctx.lineTo(x - 90, y - 90); ctx.lineTo(x - 60, y - 30); ctx.lineTo(x - 60, y); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 80, y); ctx.lineTo(x + 80, y - 50); ctx.lineTo(x + 110, y - 100 + seed * 6); ctx.lineTo(x + 140, y - 40); ctx.lineTo(x + 140, y); ctx.fill();
  ctx.fillStyle = 'rgba(92, 104, 36, 0.35)'; ctx.fillRect(x - 140, y - 50, 80, 50); ctx.fillRect(x + 80, y - 50, 60, 50);
  // The doorframe, standing on its own
  ctx.fillStyle = '#5B3A29'; ctx.fillRect(x - 24, y - 90, 6, 90); ctx.fillRect(x + 18, y - 90, 6, 90); ctx.fillRect(x - 24, y - 94, 48, 6);
  // A bathtub, or a fridge on its side
  if (seed % 2) { ctx.fillStyle = '#F5F5F4'; ctx.fillRect(x + 30, y - 22, 44, 22); ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x + 30, y - 22, 44, 4); }
  else { ctx.fillStyle = '#E7E5E4'; ctx.fillRect(x + 20, y - 26, 60, 26); ctx.fillStyle = '#A8A29E'; ctx.fillRect(x + 64, y - 22, 3, 14); }
  // Whoever lived there, sat up against what's left
  skeleton(ctx, x - 90, y, 0.55);
  // Roof shingles and bricks about
  ctx.fillStyle = '#44403C'; for (let i = 0; i < 6; i++) ctx.fillRect(x - 120 + i * 40 + ((i * 13) % 11), y - 4 - (i % 2) * 3, 14, 5);
  void f;
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
