// Drawing Ernie's stage: the sky (sunset over the bay), the painted ladies up
// and down the hills, the streets and the faults opening in them, the stuff
// coming down in the quakes, the Golden Gate coming apart (towers, cables, the
// far lane, the steel underneath, the burning wrecks), and the HUD (the quake
// banner, the fades). The bay, the jet ski and the cell house are in drawSea.ts.

import type { GameState } from '../../state';
import type { GroundRun } from '../../terrain';
import { runYAt } from '../../terrain';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { STAGE_BACKDROPS } from '../../render/backdrops/stages';
import { blitLayer } from '../../render/backdrops/core';
import type { Live } from '../../render/backdrops';
import type { LayerSpec } from '../../render/backdrops/core';
import { COURSE } from './course';
import { getErnie, regionOf, downFade, AWAY_FRAMES } from './runtime';
import { Quakes, quakeAmount, faultAmount, DEBRIS_HOLD, Debris, inQuakeCountry } from './quake';
import { Bridge, SPAN_WARN, DROP_TO_WATER, FAR_LANE, UNDER_STEEL, BgCar, screamOf, onBridge } from './bridge';
import { drawBayBackdrop, drawSeaBack, drawSeaMid, drawSeaFront, drawSeaHud, drawCellBack, drawCellMid, drawCellFront, drawCellHud } from './drawSea';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;
const Y = GROUND_Y;

export const bubble = (ctx: Ctx, x: number, y: number, text: string, color = '#F8FAFC') => {
  ctx.save();
  ctx.font = 'bold 8px "Press Start 2P"';
  const w = ctx.measureText(text).width + 14;
  ctx.fillStyle = color; ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
  ctx.fillRect(x - w / 2, y - 22, w, 20); ctx.strokeRect(x - w / 2, y - 22, w, 20);
  ctx.beginPath(); ctx.moveTo(x - 5, y - 2); ctx.lineTo(x + 5, y - 2); ctx.lineTo(x, y + 6); ctx.fillStyle = color; ctx.fill();
  ctx.fillStyle = '#111827'; ctx.textAlign = 'center'; ctx.fillText(text, x, y - 8);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// Sky
// ---------------------------------------------------------------------------

const LAYERS = STAGE_BACKDROPS['Ernie Earthquake'].layers;
const layer = (ctx: Ctx, state: GameState, i: number) => {
  const l = LAYERS[i];
  if (typeof l === 'function') { ctx.save(); (l as Live)(ctx, { camX: state.camera.x, camY: state.camera.y, frame: state.frame }); ctx.restore(); }
  else blitLayer(ctx, l as LayerSpec, state.camera.x, state.camera.y, state.frame);
};

export const drawErnieBackdrop = (ctx: Ctx, state: GameState): boolean => {
  const rt = getErnie(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'cell') { ctx.fillStyle = '#0E1114'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return true; }
  if (region === 'bay') { drawBayBackdrop(ctx, state, rt); return true; }
  // The streets: sunset over the city (the painted ladies up the hills, the bay and the bridge out beyond them)
  const k = Math.max(0, Math.min(1, (state.camera.x + 400 - COURSE.streets.x1) / (COURSE.bridge.x1 - COURSE.streets.x1)));
  ctx.save();
  // (the city sinks away as you climb, and rises as you drop)
  ctx.translate(0, Math.max(-40, Math.min(40, -(state.camera.y - (Y - 550)) * 0.15)));
  layer(ctx, state, 0);
  if (state.camera.x + 400 < COURSE.bridge.x1 - 300) {
    layer(ctx, state, 1); layer(ctx, state, 2); layer(ctx, state, 3); layer(ctx, state, 4);
  } else {
    drawBridgeView(ctx, state);
  }
  ctx.restore();
  // Dust in the air in a quake
  const a = quakeAmount(rt.quakes);
  if (a > 0) { ctx.fillStyle = `rgba(120, 100, 80, ${a * 0.18})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  void k;
  return true;
};

/** Out on the bridge: the bay far below, the city behind you, the Marin headlands ahead, the island out in the water. */
const drawBridgeView = (ctx: Ctx, state: GameState) => {
  const W = CANVAS_WIDTH, f = state.frame;
  const horizon = 330;
  const cx = state.camera.x * 0.03;
  // The bay
  const g = ctx.createLinearGradient(0, horizon, 0, CANVAS_HEIGHT + 60);
  g.addColorStop(0, '#6C5B7B'); g.addColorStop(0.2, '#35567A'); g.addColorStop(1, '#1B2F4A');
  ctx.fillStyle = g; ctx.fillRect(0, horizon, W, CANVAS_HEIGHT + 80 - horizon);
  ctx.fillStyle = 'rgba(246, 194, 122, 0.35)';
  for (let i = 0; i < 30; i++) { const x = ((hash(i) * W + f * 0.2) % W), y = horizon + 6 + hash(i + 3) * 200; ctx.fillRect(x, y, 10 + hash(i + 5) * 30, 1); }
  // The city behind (left), fading into the haze
  ctx.fillStyle = '#4B3D5A';
  for (let i = 0; i < 26; i++) {
    const x = -60 + i * 18 - cx, h = 20 + hash(i * 7) * 50;
    if (x > W * 0.45) break;
    ctx.fillRect(x, horizon - h, 16, h);
  }
  // (the pyramid)
  ctx.beginPath(); ctx.moveTo(120 - cx, horizon - 100); ctx.lineTo(108 - cx, horizon); ctx.lineTo(132 - cx, horizon); ctx.fill();
  // Marin ahead (right): green-brown headlands
  ctx.fillStyle = '#3D4A3A';
  ctx.beginPath(); ctx.moveTo(W * 0.55 - cx * 0.5, horizon);
  for (let x = W * 0.55; x <= W + 20; x += 20) ctx.lineTo(x - cx * 0.5, horizon - 20 - 60 * Math.sin((x - W * 0.55) / (W * 0.45) * Math.PI * 0.9) - hash(x) * 6);
  ctx.lineTo(W + 20, horizon); ctx.fill();
  // The island, a speck out in the water
  drawAlcatraz(ctx, W * 0.42 - cx * 0.6, horizon + 2, 0.35, f);
  layer(ctx, state, 2);
  layer(ctx, state, 3);
};

/** Alcatraz: the rock, the cell house on top, the water tower and the lighthouse. Drawn at scale s with its base on the water at (x, y). */
export const drawAlcatraz = (ctx: Ctx, x: number, y: number, s: number, f: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // The rock
  ctx.fillStyle = '#5B5146';
  ctx.beginPath(); ctx.moveTo(-160, 0); ctx.lineTo(-130, -30); ctx.lineTo(-60, -44); ctx.lineTo(40, -50); ctx.lineTo(120, -36); ctx.lineTo(170, 0); ctx.fill();
  ctx.fillStyle = '#4A5A3A'; ctx.fillRect(-120, -36, 60, 6); ctx.fillRect(60, -40, 50, 5);
  // The cell house: long, pale, rows of windows
  ctx.fillStyle = '#D8D2C4'; ctx.fillRect(-80, -92, 170, 46);
  ctx.fillStyle = '#B8B0A0'; ctx.fillRect(-80, -92, 170, 6);
  ctx.fillStyle = '#3B3F46'; for (let wx = -72; wx < 84; wx += 12) { ctx.fillRect(wx, -80, 6, 12); ctx.fillRect(wx, -62, 6, 10); }
  // Other buildings down the slope
  ctx.fillStyle = '#C9C1B0'; ctx.fillRect(-140, -44, 50, 20); ctx.fillRect(100, -48, 40, 16);
  // The water tower
  ctx.fillStyle = '#E7E2D6'; ctx.fillRect(110, -118, 26, 20);
  ctx.strokeStyle = '#8A8478'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(112, -98); ctx.lineTo(108, -48); ctx.moveTo(134, -98); ctx.lineTo(138, -48); ctx.stroke();
  // The lighthouse, and its light going round
  ctx.fillStyle = '#E7E2D6'; ctx.fillRect(-116, -126, 12, 82);
  ctx.fillStyle = '#374151'; ctx.fillRect(-118, -134, 16, 8);
  const beam = 0.5 + 0.5 * Math.sin(f * 0.05);
  ctx.fillStyle = `rgba(253, 230, 138, ${0.4 + beam * 0.6})`; ctx.beginPath(); ctx.arc(-110, -130, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(253, 230, 138, ${beam * 0.25})`;
  ctx.beginPath(); ctx.moveTo(-110, -130); ctx.lineTo(-110 + Math.cos(f * 0.05) * 260, -150); ctx.lineTo(-110 + Math.cos(f * 0.05) * 260, -110); ctx.fill();
  ctx.restore();
};

// ---------------------------------------------------------------------------
// World: behind everything that moves
// ---------------------------------------------------------------------------

export const drawErnieBack = (ctx: Ctx, state: GameState) => {
  const rt = getErnie(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'bay') { drawSeaBack(ctx, state, rt); return; }
  if (region === 'cell') { drawCellBack(ctx, state, rt); return; }
  const cam = state.camera.x;
  if (cam < COURSE.bridge.x1 + 200) drawHouses(ctx, state, rt.quakes);
  if (cam + CANVAS_WIDTH > COURSE.bridge.x1 - 700) drawBridge(ctx, state, rt.bridge);
  for (const r of state.groundRuns) if (r.surface === 'street' && visible(state, r.x1, r.x2)) drawStreet(ctx, state, r);
  drawFaults(ctx, state, rt.quakes);
  drawPlaza(ctx, state);
  for (const l of COURSE.ledges) if (visible(state, l.x, l.x + l.w)) drawFireEscape(ctx, l.x, l.y, l.w);
};

/** Ground height at x, going by the runs either side over a gap (for the houses). */
const groundUnder = (state: GameState, x: number) => {
  let best: number | null = null, dist = Infinity;
  for (const r of state.groundRuns) {
    if (r.surface !== 'street') continue;
    if (x >= r.x1 && x <= r.x2) return runYAt(r, x);
    const d = Math.min(Math.abs(x - r.x1), Math.abs(x - r.x2));
    if (d < dist) { dist = d; best = x < r.x1 ? r.y1 : r.y2; }
  }
  return best ?? Y;
};

const HOUSE_W = 170;
const PAINT = ['#F4A6B5', '#9FD8CB', '#F7D08A', '#B6A4E0', '#F2B880', '#A8D5F2', '#E8E1C8', '#C9E4A8', '#F9C6A8'];

/** The painted ladies, stepping up and down the hills behind the sidewalk. */
const drawHouses = (ctx: Ctx, state: GameState, qk: Quakes) => {
  const S = COURSE.streets;
  const i0 = Math.floor((state.camera.x - 200 - S.x1) / HOUSE_W), i1 = Math.floor((state.camera.x + CANVAS_WIDTH + 200 - S.x1) / HOUSE_W);
  const a = quakeAmount(qk);
  for (let i = Math.max(0, i0); i <= i1; i++) {
    const x = S.x1 + i * HOUSE_W;
    if (x > COURSE.bridge.x1 - 700) break;
    const base = Math.max(groundUnder(state, x + 4), groundUnder(state, x + HOUSE_W - 4)) + 4;
    const wob = a > 0 ? Math.sin(state.frame * 0.9 + i * 2) * a * 2 : 0;
    drawHouse(ctx, x + wob, HOUSE_W - 4, base, i, state.frame);
  }
};

const drawHouse = (ctx: Ctx, x: number, w: number, base: number, i: number, f: number) => {
  const c = PAINT[Math.floor(hash(i) * PAINT.length)];
  const h = 330 + Math.floor(hash(i + 1) * 70);
  const top = base - h;
  const trim = '#FFFBEB', shade = 'rgba(0,0,0,0.18)';
  ctx.fillStyle = c; ctx.fillRect(x, top, w, h);
  ctx.fillStyle = shade; ctx.fillRect(x + w - 8, top, 8, h);
  // Clapboard lines
  ctx.fillStyle = 'rgba(0,0,0,0.06)'; for (let y = top + 8; y < base; y += 8) ctx.fillRect(x, y, w, 1);
  // The garage at street level, the stoop up to the door
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(x + w * 0.52, base - 74, w * 0.4, 74);
  ctx.fillStyle = '#D6D3D1'; for (let y = base - 66; y < base; y += 12) ctx.fillRect(x + w * 0.52 + 4, y, w * 0.4 - 8, 2);
  ctx.fillStyle = '#A8A29E';
  for (let s = 0; s < 6; s++) ctx.fillRect(x + 10 + s * 5, base - 12 * (s + 1), 44 - s * 5, 12);
  ctx.fillStyle = '#7C2D12'; ctx.fillRect(x + 26, base - 128, 26, 56);
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(x + 30, base - 124, 18, 10);
  // The bay window, up two floors
  const bx = x + w * 0.48, bw = w * 0.46;
  ctx.fillStyle = shade; ctx.fillRect(bx + 4, base - 330, bw, 232);
  ctx.fillStyle = c; ctx.fillRect(bx, base - 334, bw, 232);
  ctx.fillStyle = trim; ctx.fillRect(bx - 3, base - 340, bw + 6, 8); ctx.fillRect(bx - 3, base - 104, bw + 6, 6); ctx.fillRect(bx - 3, base - 222, bw + 6, 5);
  for (const fy of [base - 206, base - 320]) {
    for (let k = 0; k < 3; k++) {
      const wx = bx + 6 + k * (bw - 12) / 3;
      ctx.fillStyle = trim; ctx.fillRect(wx - 2, fy - 2, (bw - 12) / 3 - 2, 88);
      ctx.fillStyle = hash(i * 3 + k + fy) > 0.55 ? '#FDE68A' : '#2A2F3A'; ctx.fillRect(wx + 2, fy + 2, (bw - 12) / 3 - 10, 80);
    }
  }
  // Windows on the flat side, sills (and the odd pot on them)
  for (const sill of [base - 190, base - 310]) {
    ctx.fillStyle = trim; ctx.fillRect(x + 10, sill - 66, 40, 66);
    ctx.fillStyle = hash(i * 5 + sill) > 0.5 ? '#FDE68A' : '#2A2F3A'; ctx.fillRect(x + 14, sill - 62, 32, 58);
    ctx.fillStyle = trim; ctx.fillRect(x + 12, sill - 34, 36, 3);
    ctx.fillStyle = trim; ctx.fillRect(x + 6, sill, 48, 5);
    if (hash(i * 7 + sill) > 0.4) {
      ctx.fillStyle = '#C2410C'; ctx.fillRect(x + 16, sill - 10, 12, 10);
      ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.arc(x + 22, sill - 13, 7, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Cornice and brackets, and a gable on some
  ctx.fillStyle = trim; ctx.fillRect(x - 4, top - 10, w + 8, 12);
  for (let bxx = x + 4; bxx < x + w; bxx += 16) ctx.fillRect(bxx, top + 2, 5, 8);
  if (hash(i + 9) > 0.5) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - 4, top - 10); ctx.lineTo(x + w / 2, top - 70); ctx.lineTo(x + w + 4, top - 10); ctx.fill();
    ctx.strokeStyle = trim; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = trim; ctx.beginPath(); ctx.arc(x + w / 2, top - 34, 10, 0, Math.PI * 2); ctx.fill();
  }
  void f;
};

/** A street: the sidewalk he walks on, the curb, the road with the cable car slot, the ground under it. */
const drawStreet = (ctx: Ctx, state: GameState, r: GroundRun) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  const band = (d1: number, d2: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(r.x1, r.y1 + d1); ctx.lineTo(r.x2, r.y2 + d1); ctx.lineTo(r.x2, Math.min(bottom + 400, r.y2 + d2)); ctx.lineTo(r.x1, Math.min(bottom + 400, r.y1 + d2)); ctx.closePath(); ctx.fill();
  };
  band(0, 1400, '#4A3A2E');
  band(0, 12, '#B8B4AE');
  band(12, 16, '#6B6B6B');
  band(16, 48, '#3B3A3E');
  band(0, 2, '#D6D3D1');
  // The cable car slot and a rail
  band(28, 30, '#1C1917');
  band(26, 27, '#A8A29E');
  // Expansion joints in the sidewalk
  ctx.fillStyle = '#8A8680';
  for (let x = Math.ceil(r.x1 / 40) * 40; x < r.x2; x += 40) { const y = runYAt(r, x); ctx.fillRect(x, y, 2, 12); }
};

/** The faults: paved over, then cracking (dust, the crack spreading), then open: a chasm, rubble in the lips. */
const drawFaults = (ctx: Ctx, state: GameState, qk: Quakes) => {
  COURSE.faults.forEach((f, i) => {
    if (!visible(state, f.x, f.x + f.w)) return;
    const k = faultAmount(qk, i);
    const r: GroundRun = { x1: f.x, y1: f.y, x2: f.x + f.w, y2: f.y };
    if (k < 1) {
      // Still paved: the street across it (shaking and cracking as it goes)
      ctx.save();
      if (k > 0) ctx.translate(Math.sin(state.frame * 1.3) * 2 * k, k * 4);
      drawStreet(ctx, state, r);
      if (k > 0) {
        ctx.strokeStyle = `rgba(20, 16, 14, ${0.5 + k * 0.5})`; ctx.lineWidth = 2 + k * 2;
        ctx.beginPath();
        const mid = f.x + f.w / 2;
        ctx.moveTo(mid, f.y);
        for (let s = 1; s <= 6; s++) ctx.lineTo(mid + (hash(i * 13 + s) - 0.5) * f.w * k, f.y + s * 10 * k);
        ctx.moveTo(mid, f.y);
        ctx.lineTo(mid - f.w * 0.45 * k, f.y + 2); ctx.moveTo(mid, f.y); ctx.lineTo(mid + f.w * 0.45 * k, f.y + 3);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    // Open
    const g = ctx.createLinearGradient(0, f.y, 0, f.y + 420);
    g.addColorStop(0, '#2A1E16'); g.addColorStop(0.5, '#0F0A07'); g.addColorStop(1, '#000000');
    ctx.fillStyle = g; ctx.fillRect(f.x, f.y, f.w, state.camera.y + CANVAS_HEIGHT + 60 - f.y);
    // Jagged rock walls, torn asphalt at the lips, a broken pipe dripping
    ctx.fillStyle = '#3B2A1E';
    for (const side of [0, 1]) {
      const x0 = side ? f.x + f.w : f.x;
      ctx.beginPath(); ctx.moveTo(x0, f.y);
      for (let d = 0; d < 380; d += 20) ctx.lineTo(x0 + (side ? -1 : 1) * (4 + hash(i * 17 + d + side) * 16), f.y + d);
      ctx.lineTo(x0, f.y + 380); ctx.fill();
    }
    ctx.fillStyle = '#3B3A3E';
    ctx.beginPath(); ctx.moveTo(f.x - 2, f.y); ctx.lineTo(f.x + 14, f.y + 4); ctx.lineTo(f.x + 6, f.y + 20); ctx.lineTo(f.x - 2, f.y + 16); ctx.fill();
    ctx.beginPath(); ctx.moveTo(f.x + f.w + 2, f.y); ctx.lineTo(f.x + f.w - 16, f.y + 5); ctx.lineTo(f.x + f.w - 4, f.y + 22); ctx.fill();
    ctx.fillStyle = '#57534E'; ctx.fillRect(f.x, f.y + 60, 22, 7);
    ctx.fillStyle = 'rgba(147, 197, 253, 0.7)'; ctx.fillRect(f.x + 18, f.y + 67 + ((state.frame * 3) % 60), 2, 5);
    // A faint glow way down there
    ctx.fillStyle = `rgba(249, 115, 22, ${0.12 + 0.06 * Math.sin(state.frame * 0.05 + i)})`; ctx.fillRect(f.x + 10, f.y + 300, f.w - 20, 80);
  });
};

/** Iron fire escapes on the fronts of the houses (you can get up on them). */
const drawFireEscape = (ctx: Ctx, x: number, y: number, w: number) => {
  ctx.fillStyle = '#1F2937'; ctx.fillRect(x, y, w, 5);
  ctx.fillStyle = '#374151'; for (let gx = x + 3; gx < x + w; gx += 6) ctx.fillRect(gx, y + 1, 2, 3);
  ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 30); ctx.lineTo(x + w, y - 30); ctx.lineTo(x + w, y);
  for (let rx = x + 12; rx < x + w; rx += 12) { ctx.moveTo(rx, y); ctx.lineTo(rx, y - 30); }
  // Brackets back to the wall, a ladder hanging down
  ctx.moveTo(x + 6, y + 5); ctx.lineTo(x + 20, y + 26); ctx.moveTo(x + w - 6, y + 5); ctx.lineTo(x + w - 20, y + 26);
  ctx.moveTo(x + w - 30, y + 5); ctx.lineTo(x + w - 30, y + 60); ctx.moveTo(x + w - 16, y + 5); ctx.lineTo(x + w - 16, y + 60);
  for (let ly = y + 14; ly < y + 60; ly += 10) { ctx.moveTo(x + w - 30, ly); ctx.lineTo(x + w - 16, ly); }
  ctx.stroke();
};

/** The toll plaza before the bridge, and the way down off the far end. */
const drawPlaza = (ctx: Ctx, state: GameState) => {
  const px = COURSE.bridge.x1 - 480;
  if (visible(state, px - 100, px + 500)) {
    // The toll gantry over the road
    ctx.fillStyle = '#C0392B'; ctx.fillRect(px, Y - 200, 12, 200); ctx.fillRect(px + 380, Y - 200, 12, 200); ctx.fillRect(px - 10, Y - 212, 412, 20);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('GOLDEN GATE BRIDGE', px + 196, Y - 198);
    ctx.fillStyle = '#16A34A'; ctx.fillRect(px + 150, Y - 180, 90, 22);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText('TOLL: $9.75', px + 195, Y - 166);
    ctx.textAlign = 'left';
    // A booth
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(px + 60, Y - 90, 50, 90);
    ctx.fillStyle = '#93C5FD'; ctx.fillRect(px + 66, Y - 80, 38, 30);
    ctx.fillStyle = '#C0392B'; ctx.fillRect(px + 56, Y - 96, 58, 8);
  }
  const ex = COURSE.bridge.exit;
  if (visible(state, ex - 200, ex + 100)) {
    ctx.fillStyle = '#166534'; ctx.fillRect(ex - 130, Y - 150, 120, 44);
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(ex - 72, Y - 106, 6, 106);
    ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('VISTA POINT', ex - 70, Y - 133); ctx.fillText('WATER  >>', ex - 70, Y - 117);
    ctx.textAlign = 'left';
    // Stairs going down
    ctx.fillStyle = '#78716C'; for (let s = 0; s < 6; s++) ctx.fillRect(ex + s * 14, Y + s * 12, 40, 12);
  }
};

// ---------------------------------------------------------------------------
// The bridge
// ---------------------------------------------------------------------------

const RED = '#C0392B', RED_DARK = '#8E2A20', RED_LIGHT = '#E0503F';
const TOWER_TOP = Y - 900;

/** The main cable's height at x: from the anchorages up to the tower tops and sagging down between them. */
const cableY = (x: number) => {
  const B = COURSE.bridge, [t1, t2] = B.towers;
  const top = TOWER_TOP + 30;
  if (x < t1) { const k = Math.max(0, (x - (B.x1 - 300)) / (t1 - (B.x1 - 300))); return Y - 40 - (Y - 40 - top) * k * k; }
  if (x > t2) { const k = Math.max(0, ((B.x2 + 300) - x) / ((B.x2 + 300) - t2)); return Y - 40 - (Y - 40 - top) * k * k; }
  const k = (x - t1) / (t2 - t1);
  return top + (Y - 70 - top) * 4 * k * (1 - k);
};

const drawBridge = (ctx: Ctx, state: GameState, br: Bridge) => {
  const B = COURSE.bridge;
  const x1 = Math.max(B.x1 - 300, state.camera.x - 60), x2 = Math.min(B.x2 + 300, state.camera.x + CANVAS_WIDTH + 60);
  // The bay, way down there (only in view on the way down to it)
  const water = Y + DROP_TO_WATER;
  if (state.camera.y + CANVAS_HEIGHT > water - 300) {
    ctx.fillStyle = 'rgba(203, 213, 225, 0.25)'; ctx.fillRect(state.camera.x, water - 300, CANVAS_WIDTH, 300);
    const g = ctx.createLinearGradient(0, water, 0, water + 400);
    g.addColorStop(0, '#35567A'); g.addColorStop(1, '#0F1E33');
    ctx.fillStyle = g; ctx.fillRect(state.camera.x, water, CANVAS_WIDTH, 400);
    ctx.fillStyle = '#E0F2FE'; for (let x = Math.floor(state.camera.x / 30) * 30; x < state.camera.x + CANVAS_WIDTH; x += 30) ctx.fillRect(x + Math.sin(state.frame * 0.05 + x) * 4, water, 16, 2);
  }
  if (x2 < x1) return;
  // Towers (behind the deck: it goes through them)
  for (const tx of B.towers) if (visible(state, tx - 80, tx + 80)) drawTower(ctx, tx, state);
  // Suspender cables and the main cable
  ctx.strokeStyle = RED_DARK; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = Math.ceil(x1 / 50) * 50; x < x2; x += 50) { if (B.towers.some(t => Math.abs(x - t) < 40)) continue; ctx.moveTo(x, cableY(x)); ctx.lineTo(x, Y + FAR_LANE); }
  ctx.stroke();
  ctx.strokeStyle = RED; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(x1, cableY(x1)); for (let x = x1; x <= x2; x += 10) ctx.lineTo(x, cableY(x)); ctx.stroke();
  ctx.strokeStyle = RED_LIGHT; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, cableY(x1) - 2); for (let x = x1; x <= x2; x += 10) ctx.lineTo(x, cableY(x) - 2); ctx.stroke();
  // The far lane (the cars going over the side from it)
  ctx.fillStyle = '#57534E'; ctx.fillRect(Math.max(B.x1, x1), Y + FAR_LANE, Math.min(B.x2, x2) - Math.max(B.x1, x1), -FAR_LANE);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(Math.max(B.x1, x1), Y + FAR_LANE, Math.min(B.x2, x2) - Math.max(B.x1, x1), 2);
  for (const c of br.cars) drawBgCar(ctx, c, state.frame);
  // The steel under the deck (broken where the deck's gone)
  for (const r of state.groundRuns) if (r.surface === 'deck' && visible(state, r.x1, r.x2)) drawDeck(ctx, r.x1, r.x2, state);
  COURSE.spans.forEach((s, i) => {
    const st = br.spans[i];
    if (!visible(state, s.x - 40, s.x + s.w + 40)) return;
    if (!st.open) {
      // Still there (sagging, groaning)
      const k = st.t / SPAN_WARN;
      ctx.save();
      ctx.translate(s.x + s.w / 2, Y);
      ctx.rotate(Math.sin(state.frame * 0.7) * 0.01 * k);
      ctx.translate(-(s.x + s.w / 2), -Y + k * 6);
      drawDeck(ctx, s.x, s.x + s.w, state);
      if (k > 0) {
        ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(s.x + s.w * 0.3, Y); ctx.lineTo(s.x + s.w * 0.4, Y + 20 * k); ctx.lineTo(s.x + s.w * 0.35, Y + 40 * k);
        ctx.moveTo(s.x + s.w * 0.7, Y); ctx.lineTo(s.x + s.w * 0.62, Y + 24 * k);
        ctx.stroke();
      }
      ctx.restore();
    } else if (st.drop < 200) {
      // Gone: the slab on its way down
      const d = st.drop;
      ctx.save();
      ctx.translate(s.x + s.w / 2, Y + 10 + d * d * 0.25);
      ctx.rotate(d * 0.02 * (i % 2 ? 1 : -1));
      ctx.translate(-(s.x + s.w / 2), -Y);
      drawDeck(ctx, s.x + 4, s.x + s.w - 4, state);
      ctx.restore();
    }
    // Torn ends either side of a gap
    if (st.open) {
      ctx.fillStyle = '#44403C';
      ctx.beginPath(); ctx.moveTo(s.x, Y); ctx.lineTo(s.x + 10, Y + 6); ctx.lineTo(s.x + 2, Y + 24); ctx.lineTo(s.x, Y + 24); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s.x + s.w, Y); ctx.lineTo(s.x + s.w - 12, Y + 5); ctx.lineTo(s.x + s.w - 3, Y + 22); ctx.lineTo(s.x + s.w, Y + 22); ctx.fill();
      ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x + 6, Y + 30); ctx.lineTo(s.x + 20, Y + 60); ctx.moveTo(s.x + s.w - 6, Y + 30); ctx.lineTo(s.x + s.w - 24, Y + 70); ctx.stroke();
    }
  });
  // Wrecks on the deck, burning
  for (const w of COURSE.wrecks) if (visible(state, w.x - 60, w.x + 60)) drawBurningWreck(ctx, w.x, state.frame);
};

const drawTower = (ctx: Ctx, tx: number, state: GameState) => {
  const bottom = Math.max(Y + 400, state.camera.y + CANVAS_HEIGHT + 20);
  const legW = 64;
  ctx.fillStyle = RED;
  ctx.fillRect(tx - legW / 2, TOWER_TOP, legW, bottom - TOWER_TOP);
  ctx.fillStyle = RED_DARK; ctx.fillRect(tx + legW / 2 - 14, TOWER_TOP, 14, bottom - TOWER_TOP);
  ctx.fillStyle = RED_LIGHT; ctx.fillRect(tx - legW / 2, TOWER_TOP, 5, bottom - TOWER_TOP);
  // The art deco setbacks and the recessed panels
  for (let y = TOWER_TOP + 40; y < Y - 60; y += 120) {
    ctx.fillStyle = RED_DARK; ctx.fillRect(tx - legW / 2 + 12, y, legW - 24, 80);
    ctx.fillStyle = '#6E1F17'; for (let k = 0; k < 4; k++) ctx.fillRect(tx - legW / 2 + 16 + k * 9, y + 6, 4, 68);
    ctx.fillStyle = RED_LIGHT; ctx.fillRect(tx - legW / 2 - 6, y + 96, legW + 12, 8);
  }
  // The saddle on top
  ctx.fillStyle = RED_DARK; ctx.fillRect(tx - legW / 2 - 8, TOWER_TOP - 18, legW + 16, 22);
  // Aircraft warning light
  ctx.fillStyle = state.frame % 60 < 30 ? '#EF4444' : '#7F1D1D'; ctx.fillRect(tx - 4, TOWER_TOP - 26, 8, 8);
};

/** The road deck and the steel truss under it, from x1 to x2. */
const drawDeck = (ctx: Ctx, x1: number, x2: number, state: GameState) => {
  // Truss: chords, verticals and X-bracing
  ctx.strokeStyle = RED_DARK; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x1, Y + 20); ctx.lineTo(x2, Y + 20); ctx.moveTo(x1, Y + UNDER_STEEL); ctx.lineTo(x2, Y + UNDER_STEEL);
  for (let x = Math.ceil(x1 / 60) * 60; x < x2; x += 60) {
    ctx.moveTo(x, Y + 20); ctx.lineTo(x, Y + UNDER_STEEL);
    if (x + 60 <= x2) { ctx.moveTo(x, Y + 20); ctx.lineTo(x + 60, Y + UNDER_STEEL); ctx.moveTo(x + 60, Y + 20); ctx.lineTo(x, Y + UNDER_STEEL); }
  }
  ctx.stroke();
  ctx.fillStyle = RED; ctx.fillRect(x1, Y + 8, x2 - x1, 16);
  ctx.fillStyle = RED_LIGHT; ctx.fillRect(x1, Y + 8, x2 - x1, 2);
  // The road
  ctx.fillStyle = '#44403C'; ctx.fillRect(x1, Y, x2 - x1, 9);
  ctx.fillStyle = '#F8FAFC'; for (let x = Math.ceil(x1 / 70) * 70; x < x2 - 30; x += 70) ctx.fillRect(x, Y + 4, 30, 2);
  // The railing along the near side
  ctx.fillStyle = RED;
  ctx.fillRect(x1, Y - 22, x2 - x1, 3);
  for (let x = Math.ceil(x1 / 16) * 16; x < x2; x += 16) ctx.fillRect(x, Y - 22, 2, 22);
  void state;
};

const drawCar = (ctx: Ctx, color: string) => {
  ctx.fillStyle = color; ctx.fillRect(-30, -20, 60, 14); ctx.fillRect(-18, -32, 34, 13);
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(-15, -30, 12, 9); ctx.fillRect(1, -30, 12, 9);
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(-18, -6, 6, 0, Math.PI * 2); ctx.arc(18, -6, 6, 0, Math.PI * 2); ctx.fill();
};

const drawBgCar = (ctx: Ctx, c: BgCar, f: number) => {
  if (c.state === 'boom') return;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.rot);
  ctx.scale(0.8, 0.8);
  ctx.globalAlpha = 0.9;
  drawCar(ctx, c.color);
  if (c.state === 'falling') { ctx.fillStyle = f % 6 < 3 ? '#FDE047' : '#F97316'; ctx.fillRect(-34, -22, 6, 6); }
  ctx.restore();
};

const drawBurningWreck = (ctx: Ctx, x: number, f: number) => {
  ctx.save();
  ctx.translate(x, Y);
  ctx.rotate(0.06);
  drawCar(ctx, '#1C1917');
  ctx.fillStyle = '#44403C'; ctx.fillRect(-18, -32, 34, 3);
  ctx.restore();
  // Flames and smoke
  for (let i = 0; i < 5; i++) {
    const fx = x - 22 + i * 11, h = 26 + Math.sin(f * 0.4 + i * 2) * 10;
    ctx.fillStyle = i % 2 ? 'rgba(249, 115, 22, 0.9)' : 'rgba(253, 224, 71, 0.85)';
    ctx.beginPath(); ctx.moveTo(fx - 7, Y - 22); ctx.quadraticCurveTo(fx + Math.sin(f * 0.3 + i) * 5, Y - 22 - h, fx + 7, Y - 22); ctx.fill();
  }
  for (let i = 0; i < 4; i++) {
    const t = ((f * 0.8 + i * 40) % 160) / 160;
    ctx.fillStyle = `rgba(40, 36, 34, ${0.5 * (1 - t)})`;
    ctx.beginPath(); ctx.arc(x + t * 30, Y - 50 - t * 160, 12 + t * 26, 0, Math.PI * 2); ctx.fill();
  }
};

// ---------------------------------------------------------------------------
// Over the terrain, behind what moves: the stuff coming down
// ---------------------------------------------------------------------------

export const drawErnieMid = (ctx: Ctx, state: GameState) => {
  const rt = getErnie(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'bay') { drawSeaMid(ctx, state, rt); return; }
  if (region === 'cell') { drawCellMid(ctx, state, rt); return; }
  for (const d of rt.quakes.debris) drawDebris(ctx, d, state.frame);
};

const drawDebris = (ctx: Ctx, d: Debris, f: number) => {
  // The shadow where it's going to land, darker the closer it gets
  const k = d.hold > 0 ? 0.2 + 0.3 * (1 - d.hold / DEBRIS_HOLD) : Math.min(1, 0.5 + d.vy / 20);
  ctx.fillStyle = `rgba(0, 0, 0, ${0.25 + k * 0.35})`;
  ctx.beginPath(); ctx.ellipse(d.x, d.ground - 1, 8 + k * 10, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  // Wobbling on the sill first
  const wob = d.hold > 0 ? Math.sin(f * 1.2) * 0.2 : 0;
  ctx.translate(d.x, d.y);
  ctx.rotate(d.rot + wob);
  switch (d.look) {
    case 'pot':
      ctx.fillStyle = '#C2410C'; ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(8, -8); ctx.lineTo(6, 8); ctx.lineTo(-6, 8); ctx.fill();
      ctx.fillStyle = '#9A3412'; ctx.fillRect(-9, -10, 18, 4);
      ctx.fillStyle = '#16A34A'; ctx.beginPath(); ctx.arc(0, -14, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F472B6'; ctx.fillRect(-3, -18, 4, 4);
      break;
    case 'brick':
      ctx.fillStyle = '#991B1B'; ctx.fillRect(-11, -6, 22, 12);
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-11, 2, 22, 4);
      ctx.fillStyle = '#D6D3D1'; ctx.fillRect(-11, -6, 22, 1);
      break;
    case 'ac':
      ctx.fillStyle = '#D4D4D8'; ctx.fillRect(-16, -12, 32, 24);
      ctx.fillStyle = '#71717A'; for (let y = -8; y < 10; y += 4) ctx.fillRect(-12, y, 24, 2);
      ctx.fillStyle = '#27272A'; ctx.fillRect(-16, 10, 32, 2);
      break;
    case 'rivet':
      ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-3, -12, 6, 24);
      break;
    case 'beam':
      ctx.fillStyle = RED; ctx.fillRect(-18, -5, 36, 10);
      ctx.fillStyle = RED_DARK; ctx.fillRect(-18, -5, 36, 3); ctx.fillRect(-18, 2, 36, 3);
      break;
  }
  ctx.restore();
  // The sill it's sat on
  if (d.hold > 0 && d.sill) { ctx.fillStyle = '#FFFBEB'; ctx.fillRect(d.x - 16, d.y + 9, 32, 4); }
};

// ---------------------------------------------------------------------------
// In front
// ---------------------------------------------------------------------------

export const drawErnieFront = (ctx: Ctx, state: GameState) => {
  const rt = getErnie(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'bay') { drawSeaFront(ctx, state, rt); return; }
  if (region === 'cell') { drawCellFront(ctx, state, rt); return; }
  // What the burning are screaming
  for (const e of state.enemies) {
    if (e.kind !== 'burning') continue;
    const text = screamOf(rt.bridge, e);
    if (text) bubble(ctx, e.pos.x + e.width / 2, e.pos.y - 14, text, '#FED7AA');
  }
  // Over the side: his screaming, over him
  const pl = rt.bridge.plunge;
  if (pl && state.deathTimer <= 0) {
    // The air rushing past him
    ctx.fillStyle = 'rgba(241, 245, 249, 0.55)';
    for (let i = 0; i < 26; i++) {
      const sx = state.camera.x + hash(i) * CANVAS_WIDTH;
      const sy = state.camera.y + CANVAS_HEIGHT - ((pl.t * (18 + hash(i + 3) * 14) + hash(i + 7) * CANVAS_HEIGHT) % (CANVAS_HEIGHT + 120));
      ctx.fillRect(sx, sy, 2, 30 + hash(i + 5) * 50);
    }
    if (pl.lineT > 0 && pl.line) bubble(ctx, state.player.pos.x + state.player.width / 2, state.player.pos.y - 16, pl.line);
  }
};

// ---------------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------------

export const drawErnieHud = (ctx: Ctx, state: GameState) => {
  const rt = getErnie(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'main' && inQuakeCountry(state)) drawQuakeBanner(ctx, state, rt.quakes);
  if (region === 'bay') drawSeaHud(ctx, state, rt);
  if (region === 'cell') drawCellHud(ctx, state, rt);
  // Letterbox over the drop
  if (rt.bridge.plunge && state.deathTimer <= 0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, 36); ctx.fillRect(0, CANVAS_HEIGHT - 36, CANVAS_WIDTH, 36); }
  // Down off the bridge
  const d = downFade(rt);
  if (d > 0) { ctx.fillStyle = `rgba(0,0,0,${d})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  // Up the ramp and away
  if (rt.awayT > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, rt.awayT / (AWAY_FRAMES * 0.7))})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  void onBridge;
};

/** EARTHQUAKE! and the magnitude, with a seismograph scribbling away under it. */
const drawQuakeBanner = (ctx: Ctx, state: GameState, qk: Quakes) => {
  if (qk.t <= 0) return;
  const a = quakeAmount(qk);
  const big = qk.banner < 100;
  const cx = CANVAS_WIDTH / 2, y = big ? 110 : 64;
  ctx.save();
  ctx.globalAlpha = Math.min(1, qk.t / 20, (qk.dur - qk.t + 1) / 8);
  const jx = (Math.random() - 0.5) * a * 4, jy = (Math.random() - 0.5) * a * 4;
  ctx.translate(jx, jy);
  ctx.textAlign = 'center';
  if (big) {
    ctx.font = 'bold 22px "Press Start 2P"';
    ctx.fillStyle = '#000'; ctx.fillText('EARTHQUAKE!', cx + 3, y + 3);
    ctx.fillStyle = state.frame % 10 < 5 ? '#F97316' : '#FDE047'; ctx.fillText('EARTHQUAKE!', cx, y);
  }
  ctx.font = 'bold 10px "Press Start 2P"';
  const mag = `MAGNITUDE ${qk.mag.toFixed(1)}`;
  ctx.fillStyle = '#000'; ctx.fillText(mag, cx + 2, y + 24 + 2);
  ctx.fillStyle = '#F8FAFC'; ctx.fillText(mag, cx, y + 24);
  // The seismograph
  ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const x = cx - 90 + i * 3;
    const yy = y + 42 + Math.sin((state.frame + i) * 1.7) * Math.sin((state.frame + i) * 0.23) * (4 + a * 10);
    if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
  }
  ctx.stroke();
  ctx.restore();
};
