// Drawing Ernie's stage: the sky (sunset over the bay), the painted ladies up
// and down the hills, the streets and the faults opening in them, the stuff
// coming down in the quakes, the Golden Gate coming apart (towers, cables, the
// far lane, the steel underneath, the burning wrecks), and the HUD (the quake
// banner, the fades). The bay, the jet ski and the cell house are in drawSea.ts.

import type { GameState } from '../../core/state';
import type { GroundRun } from '../../core/terrain';
import { runYAt } from '../../core/terrain';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, ARENA_LEFT } from '../../../constants';
import { STAGE_BACKDROPS } from '../../render/backdrops/stages';
import { drawBackdropFront } from '../../render/backdrops';
import { blitLayer } from '../../render/backdrops/core';
import type { Live } from '../../render/backdrops';
import type { LayerSpec } from '../../render/backdrops/core';
import { COURSE } from './course';
import { getErnie, regionOf, downFade, AWAY_FRAMES, ErnieRuntime, inHipsterScene } from './runtime';
import { SKIP_AFTER, drawSkipPrompt } from '../../platform/skip';
import { Quakes, quakeAmount, faultAmount, DEBRIS_HOLD, BRIDGE_HOLD, Debris, inQuakeCountry, PIECE_BOTTOM } from './quake';
import { Bridge, mainCableY, TOWER_TOP, SPAN_WARN, DROP_TO_WATER, FAR_LANE, UNDER_STEEL, BgCar, screamOf, onBridge } from './bridge';
import { drawFault } from './faultDraw';
import { drawDistricts } from './streetsDraw';
import { Car, CAR_W, CAR_H, CAR_WARN, carsComing } from './traffic';
import { drawBayBackdrop, drawSeaBack, drawSeaMid, drawSeaFront, drawSeaHud, drawCellMid, drawCellFront, drawCellHud } from './drawSea';
import { drawIslandBackdrop, drawIslandBack } from './islandDraw';
import { CRASH_X, hipsterY } from './doorCrash';
import { sentenceShown } from '../../platform/speech';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;
const Y = GROUND_Y;

export const bubble = (ctx: Ctx, x: number, y: number, said: string, color = '#F8FAFC') => {
  const text = sentenceShown(said);
  ctx.save();
  ctx.font = 'bold 8px "Press Start 2P"';
  // (a long line goes over two, split at the space nearest its middle)
  let lines = [text];
  if (ctx.measureText(text).width > 340 && text.includes(' ')) {
    const mid = text.length / 2;
    let cut = -1;
    for (let i = 0; i < text.length; i++) if (text[i] === ' ' && (cut < 0 || Math.abs(i - mid) < Math.abs(cut - mid))) cut = i;
    lines = [text.slice(0, cut), text.slice(cut + 1)];
  }
  const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 14, h = 8 + lines.length * 12;
  // (and the box is kept on screen, whole: it slides along to fit, its tail still pointing at whoever's talking)
  const m = ctx.getTransform();
  let bx = x - w / 2;
  const left = m.a * bx + m.e, right = m.a * (bx + w) + m.e, edge = 8 * m.a;
  if (left < edge) bx += (edge - left) / m.a;
  else if (right > ctx.canvas.width - edge) bx -= (right - (ctx.canvas.width - edge)) / m.a;
  ctx.fillStyle = color; ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
  ctx.fillRect(bx, y - 2 - h, w, h); ctx.strokeRect(bx, y - 2 - h, w, h);
  const tx = Math.max(bx + 8, Math.min(bx + w - 8, x));
  ctx.beginPath(); ctx.moveTo(tx - 5, y - 2); ctx.lineTo(tx + 5, y - 2); ctx.lineTo(tx, y + 6); ctx.fillStyle = color; ctx.fill();
  ctx.fillStyle = '#111827'; ctx.textAlign = 'center';
  lines.forEach((l, i) => ctx.fillText(l, bx + w / 2, y - 2 - h + 14 + i * 12));
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
  if (region === 'cell') { drawIslandBackdrop(ctx, state); return true; }
  if (region === 'bay') { drawBayBackdrop(ctx, state, rt); return true; }
  // The streets: sunset over the city (the painted ladies up the hills, the bay and the bridge out beyond them)
  const k = Math.max(0, Math.min(1, (state.camera.x + 400 - COURSE.streets.x1) / (COURSE.bridge.x1 - COURSE.streets.x1)));
  ctx.save();
  // (the city sinks away as you climb, and rises as you drop)
  ctx.translate(0, Math.max(-40, Math.min(40, -(state.camera.y - (Y - 550)) * 0.15)));
  layer(ctx, state, 0);
  // Over the toll plaza the city behind fades into the view from the bridge (the bay far below, Marin ahead)
  const toBridge = Math.max(0, Math.min(1, (state.camera.x + 400 - (COURSE.bridge.x1 - 900)) / 700));
  // (the bay out beyond the city, with the far headlands, but not the bridge: you're headed for that, it's never scenery)
  if (toBridge < 1) { drawFarBay(ctx, state); layer(ctx, state, 2); layer(ctx, state, 3); layer(ctx, state, 4); }
  if (toBridge > 0) { ctx.globalAlpha = toBridge; drawBridgeView(ctx, state); ctx.globalAlpha = 1; }
  ctx.restore();
  // Dust in the air in a quake
  const a = quakeAmount(rt.quakes);
  if (a > 0) { ctx.fillStyle = `rgba(120, 100, 80, ${a * 0.18})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  void k;
  return true;
};

/** Behind the city: the far headlands and the bay under the sunset (no bridge). */
const drawFarBay = (ctx: Ctx, state: GameState) => {
  const W = CANVAS_WIDTH, horizon = 410;
  const drift = state.camera.x * 0.1;
  ctx.fillStyle = '#4B3D5A';
  ctx.beginPath(); ctx.moveTo(0, horizon);
  for (let x = 0; x <= W + 20; x += 16) ctx.lineTo(x, horizon - 12 - 22 * Math.sin((x + drift) * 0.005) - 8 * Math.sin((x + drift) * 0.019));
  ctx.lineTo(W + 20, horizon); ctx.fill();
  ctx.fillStyle = '#2E4A6B'; ctx.fillRect(0, horizon, W, CANVAS_HEIGHT + 80 - horizon);
  ctx.fillStyle = '#3B5B80';
  for (let y = horizon + 4; y < CANVAS_HEIGHT + 60; y += 6) for (let x = ((y * 7 - drift * 0.5) % 22 + 22) % 22; x < W; x += 22) ctx.fillRect(x, y, 8, 2);
};

/** Out on the bridge: the bay far below, the city behind you, the Marin headlands ahead, the island out in the water. */
const drawBridgeView = (ctx: Ctx, state: GameState) => {
  const W = CANVAS_WIDTH, f = state.frame;
  const horizon = 330;
  // (a slow drift as you go, from where the bridge starts)
  const cx = (state.camera.x - (COURSE.bridge.x1 - 1200)) * 0.03;
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
  if (region === 'cell') { drawIslandBack(ctx, state, rt); return; }
  const cam = state.camera.x;
  if (cam < COURSE.bridge.x1 + 200) drawDistricts(ctx, state, quakeAmount(rt.quakes));
  if (cam + CANVAS_WIDTH > COURSE.bridge.x1 - 700) drawBridge(ctx, state, rt.bridge);
  for (const r of state.groundRuns) if (r.surface === 'street' && visible(state, r.x1, r.x2)) drawStreet(ctx, state, r);
  drawFaults(ctx, state, rt.quakes);
  drawPlaza(ctx, state);
  for (const l of COURSE.ledges) if (visible(state, l.x, l.x + l.w)) drawFireEscape(ctx, l.x, l.y, l.w);
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
    if (!visible(state, f.x - 80, f.x + f.w + 80)) return;
    const since = state.frame - (qk.faults[i].openedAt ?? -999);
    drawFault(ctx, state, f, i, faultAmount(qk, i), since, r => drawStreet(ctx, state, r));
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
const cableY = mainCableY;

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
  if (region === 'cell') { drawCellMid(ctx, state, rt); drawLoose(ctx, state, rt.quakes); for (const d of rt.quakes.debris) drawDebris(ctx, d, state.frame); return; }
  drawLoose(ctx, state, rt.quakes);
  for (const d of rt.quakes.debris) drawDebris(ctx, d, state.frame);
  for (const c of rt.bridge.traffic.cars) if (c.state !== 'coming') drawTrafficCar(ctx, c, state.frame);
};

/** A minivan in your lane, doing sixty: headlights on, somebody panicking at the wheel, a roof you could stand on. */
const drawTrafficCar = (ctx: Ctx, c: Car, f: number) => {
  ctx.save();
  ctx.translate(c.x + CAR_W / 2, c.y);
  ctx.rotate(c.rot);
  ctx.scale(c.dir, 1);
  // (crashed: burnt out, on fire)
  if (c.state === 'crashed') ctx.filter = 'brightness(0.35)';
  const w = CAR_W, h = CAR_H;
  // Body, with a sloped nose
  ctx.fillStyle = c.color;
  ctx.beginPath(); ctx.moveTo(-w / 2, -8); ctx.lineTo(-w / 2, -h + 4); ctx.lineTo(w / 2 - 26, -h); ctx.lineTo(w / 2 - 8, -h + 22); ctx.lineTo(w / 2, -h + 24); ctx.lineTo(w / 2, -8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'; ctx.fillRect(-w / 2, -16, w, 8);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; ctx.fillRect(-w / 2, -h + 4, w - 26, 2);
  // Windows, and whoever's driving: hands up off the wheel, screaming
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(-w / 2 + 6, -h + 9, 22, 13); ctx.fillRect(-w / 2 + 32, -h + 9, 22, 13);
  ctx.beginPath(); ctx.moveTo(w / 2 - 42, -h + 9); ctx.lineTo(w / 2 - 26, -h + 9); ctx.lineTo(w / 2 - 14, -h + 21); ctx.lineTo(w / 2 - 42, -h + 21); ctx.fill();
  ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(w / 2 - 32, -h + 15, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#450A0A'; ctx.fillRect(w / 2 - 30, -h + 16, 2, 3);
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(w / 2 - 38, -h + 7 + Math.sin(f * 0.8) * 2, 3, 6); ctx.fillRect(w / 2 - 26, -h + 7 - Math.sin(f * 0.8) * 2, 3, 6);
  // Door line, handle, bumpers
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fillRect(-4, -h + 8, 1, h - 16); ctx.fillRect(4, -24, 6, 2);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(w / 2 - 4, -14, 6, 5); ctx.fillRect(-w / 2 - 2, -14, 5, 5);
  // Headlight (and its beam out ahead) and tail light
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(w / 2 - 5, -h + 26, 5, 5);
  ctx.fillStyle = 'rgba(254, 249, 195, 0.18)';
  ctx.beginPath(); ctx.moveTo(w / 2, -h + 26); ctx.lineTo(w / 2 + 120, -h + 10); ctx.lineTo(w / 2 + 120, -h + 50); ctx.lineTo(w / 2, -h + 31); ctx.fill();
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-w / 2, -h + 24, 3, 7);
  // Wheels, spinning
  for (const wx of [-w / 2 + 20, w / 2 - 20]) {
    ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(wx, -7, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 2;
    const a = f * 0.9 * (c.state === 'driving' ? 1 : 0.3);
    ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * 5, -7 + Math.sin(a) * 5); ctx.lineTo(wx - Math.cos(a) * 5, -7 - Math.sin(a) * 5); ctx.stroke();
  }
  if (c.state === 'crashed') {
    ctx.filter = 'none';
    for (let i = 0; i < 6; i++) {
      const fx = -CAR_W / 2 + 10 + i * 16, h = 18 + Math.sin(f * 0.4 + i * 2) * 8;
      ctx.fillStyle = i % 2 ? 'rgba(249, 115, 22, 0.9)' : 'rgba(253, 224, 71, 0.85)';
      ctx.beginPath(); ctx.moveTo(fx - 7, -CAR_H + 4); ctx.quadraticCurveTo(fx + Math.sin(f * 0.3 + i) * 5, -CAR_H - h, fx + 7, -CAR_H + 4); ctx.fill();
    }
  }
  ctx.restore();
  // Smoke off the tires
  if (c.state === 'driving' && f % 2 === 0) {
    ctx.fillStyle = 'rgba(214, 211, 209, 0.5)';
    ctx.beginPath(); ctx.arc(c.dir > 0 ? c.x - 4 : c.x + CAR_W + 4, c.y - 6, 5 + (f % 6), 0, Math.PI * 2); ctx.fill();
  }
};

/** A car on its way that isn't in view yet: headlights and a honking horn at that edge of the screen. */
const drawCarWarning = (ctx: Ctx, state: GameState, c: Car) => {
  const k = c.t / CAR_WARN;
  const y = GROUND_Y - state.camera.y - 26;
  const left = c.dir > 0;
  const x = left ? 0 : CANVAS_WIDTH;
  // The headlights' glow creeping in
  const g = ctx.createRadialGradient(x, y, 4, x, y, 80 + k * 120);
  g.addColorStop(0, `rgba(254, 249, 195, ${0.35 + k * 0.45})`); g.addColorStop(1, 'rgba(254, 249, 195, 0)');
  ctx.fillStyle = g; ctx.fillRect(left ? 0 : CANVAS_WIDTH - 220, y - 200, 220, 400);
  if (Math.floor(state.frame / 6) % 2) return;
  ctx.save();
  ctx.fillStyle = '#EF4444';
  const ax = left ? 18 : CANVAS_WIDTH - 18, d = left ? 1 : -1;
  ctx.beginPath(); ctx.moveTo(ax + d * 16, y); ctx.lineTo(ax, y - 12); ctx.lineTo(ax, y + 12); ctx.fill();
  ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = left ? 'left' : 'right';
  ctx.fillStyle = '#000'; ctx.fillText('HONK!', ax + d * 22 + 2, y - 16 + 2);
  ctx.fillStyle = '#FDE047'; ctx.fillText('HONK!', ax + d * 22, y - 16);
  ctx.restore();
};

const drawDebris = (ctx: Ctx, d: Debris, f: number) => {
  const steel = d.look === 'rivet' || d.look === 'beam';
  const hold0 = steel ? BRIDGE_HOLD : DEBRIS_HOLD;
  // The shadow where it's going to land, darker the closer it gets
  const k = d.hold > 0 ? 0.2 + 0.3 * (1 - d.hold / hold0) : Math.min(1, 0.5 + d.vy / 20);
  ctx.fillStyle = `rgba(0, 0, 0, ${0.25 + k * 0.35})`;
  ctx.beginPath(); ctx.ellipse(d.x, d.ground - 1, 8 + k * 10, 3, 0, 0, Math.PI * 2); ctx.fill();
  // ...and a target on the ground under it, flashing faster as it comes
  const rate = d.hold > 0 ? 6 : 3;
  if (Math.floor(f / rate) % 2 === 0) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.95)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(d.x, d.ground - 2, 22, 6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.95)'; ctx.fillRect(d.x - 1, d.ground - 22, 3, 11); ctx.fillRect(d.x - 1, d.ground - 9, 3, 3);
  }
  // A big flashing arrow pointing down under it while it's about to go
  if (d.hold > 0 && Math.floor(f / 5) % 2 === 0) {
    const ay = d.y + 22 + Math.sin(f * 0.4) * 3;
    ctx.fillStyle = '#FDE047'; ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(d.x - 5, ay); ctx.lineTo(d.x + 5, ay); ctx.lineTo(d.x + 5, ay + 12); ctx.lineTo(d.x + 12, ay + 12);
    ctx.lineTo(d.x, ay + 26); ctx.lineTo(d.x - 12, ay + 12); ctx.lineTo(d.x - 5, ay + 12); ctx.closePath();
    ctx.fill(); ctx.stroke();
  }
  // On the bridge it swings from a snapped suspender cable first (up out of the top of the view)
  const swing = steel && d.hold > 0 ? Math.sin(f * 0.25) * 0.25 : 0;
  if (steel && d.hold > 0) {
    ctx.strokeStyle = '#8E2A20'; ctx.lineWidth = 3;
    // (the stretch of snapped cable it's swinging on, from where it's still fixed above)
    const len = Math.max(20, d.y - mainCableY(d.x));
    ctx.beginPath(); ctx.moveTo(d.x - Math.sin(swing) * len, d.y - len); ctx.lineTo(d.x, d.y - 8); ctx.stroke();
  }
  ctx.save();
  // Wobbling on the sill (or swinging on its cable) first
  const wob = d.hold > 0 ? (steel ? swing : Math.sin(f * 1.2) * 0.2) : 0;
  ctx.translate(d.x, d.y);
  ctx.rotate(d.rot + wob);
  drawPiece(ctx, d.look);
  ctx.restore();
  // The sill it's sat on
  if (d.hold > 0 && d.sill) { ctx.fillStyle = '#FFFBEB'; ctx.fillRect(d.x - 16, d.y + PIECE_BOTTOM[d.look], 32, 4); }
};

/** Everything that's loose, sat where it's been all along (a pot on a sill, an AC unit in a window, a fitting hanging off a cable), rattling in a quake. */
const drawLoose = (ctx: Ctx, state: GameState, qk: Quakes) => {
  const a = quakeAmount(qk), f = state.frame;
  for (const l of qk.loose) {
    if (l.gone || l.x < state.camera.x - 60 || l.x > state.camera.x + CANVAS_WIDTH + 60) continue;
    const steel = l.look === 'rivet' || l.look === 'beam';
    if (steel) {
      // Clamped to its suspender cable (the cable runs right through it): a collar and a couple of bolts
      ctx.fillStyle = '#6E1F17'; ctx.fillRect(l.x - 5, l.y - 16, 10, 5);
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(l.x - 4, l.y - 15, 2, 2); ctx.fillRect(l.x + 2, l.y - 15, 2, 2);
    } else if (l.look === 'lamp') {
      // Hung off the roof trusses on its chain
      ctx.strokeStyle = '#52525B'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(l.x, l.y - 150); ctx.lineTo(l.x + (a > 0 ? Math.sin(f * 0.5 + l.x) * a * 6 : 0), l.y - 8); ctx.stroke();
    } else if (l.look === 'ac') {
      // Its brackets under it
      ctx.strokeStyle = '#52525B'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(l.x - 12, l.y); ctx.lineTo(l.x - 4, l.y + 10); ctx.moveTo(l.x + 12, l.y); ctx.lineTo(l.x + 4, l.y + 10); ctx.stroke();
    }
    ctx.save();
    ctx.translate(l.x + (a > 0 ? Math.sin(f * 1.3 + l.x) * a * 1.5 : 0), l.y - PIECE_BOTTOM[l.look]);
    if (a > 0) ctx.rotate(Math.sin(f * 0.9 + l.x * 0.1) * a * 0.12);
    else if (steel) ctx.rotate(Math.sin(f * 0.04 + l.x) * 0.05);
    drawPiece(ctx, l.look);
    ctx.restore();
  }
};

/** One of the things that come down, centered on (0, 0). */
const drawPiece = (ctx: Ctx, look: Debris['look']) => {
  switch (look) {
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
    case 'lamp':
      // A cell house light: an enameled shade, the bulb glowing under it
      ctx.fillStyle = '#E5E7EB'; ctx.beginPath(); ctx.moveTo(-14, 4); ctx.lineTo(-5, -8); ctx.lineTo(5, -8); ctx.lineTo(14, 4); ctx.fill();
      ctx.fillStyle = '#52525B'; ctx.fillRect(-3, -12, 6, 5);
      ctx.fillStyle = '#FEF9C3'; ctx.beginPath(); ctx.arc(0, 6, 4, 0, Math.PI * 2); ctx.fill();
      break;
    case 'plaster':
      // A slab of the gallery's underside, cracked through, hanging by its rebar
      ctx.fillStyle = '#A8A29E'; ctx.beginPath(); ctx.moveTo(-14, -6); ctx.lineTo(12, -6); ctx.lineTo(15, 3); ctx.lineTo(4, 8); ctx.lineTo(-12, 5); ctx.fill();
      ctx.fillStyle = '#78716C'; ctx.fillRect(-14, 2, 28, 2);
      ctx.fillStyle = '#57534E'; ctx.fillRect(-6, -12, 2, 8); ctx.fillRect(6, -12, 2, 8);
      break;
    case 'rock':
      ctx.fillStyle = '#78716C'; ctx.beginPath(); ctx.moveTo(-14, 6); ctx.lineTo(-12, -6); ctx.lineTo(-2, -12); ctx.lineTo(12, -8); ctx.lineTo(15, 4); ctx.lineTo(6, 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(-8, -8, 8, 3);
      ctx.fillStyle = '#44403C'; ctx.fillRect(-10, 5, 18, 3);
      break;
  }
};

// ---------------------------------------------------------------------------
// In front
// ---------------------------------------------------------------------------

export const drawErnieFront = (ctx: Ctx, state: GameState) => {
  const rt = getErnie(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'bay') { drawSeaFront(ctx, state, rt); return; }
  if (region === 'cell') { drawCellFront(ctx, state, rt); drawDoorCrashFront(ctx, state, rt); return; }
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
  if ((region === 'main' || region === 'cell') && inQuakeCountry(state)) drawQuakeBanner(ctx, state, rt.quakes);
  if (region === 'main') for (const c of carsComing(rt.bridge.traffic)) drawCarWarning(ctx, state, c);
  if (region === 'bay') drawSeaHud(ctx, state, rt);
  if (region === 'cell') drawCellHud(ctx, state, rt);
  if (inHipsterScene(rt) && rt.sceneT > SKIP_AFTER) drawSkipPrompt(ctx, CANVAS_WIDTH);
  if (region === 'cell' && rt.doorCrash.phase === 'scene') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, 36); ctx.fillRect(0, CANVAS_HEIGHT - 36, CANVAS_WIDTH, 36); }
  // Letterbox over the drop
  if (rt.bridge.plunge && state.deathTimer <= 0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, 36); ctx.fillRect(0, CANVAS_HEIGHT - 36, CANVAS_WIDTH, 36); }
  // (the fades go over the weather, where there is any: see drawErnieWeather)
  if (!hasWeather(state)) drawFades(ctx, rt);
  void onBridge;
};

/** Whether the stage's weather gets drawn over the level (it isn't in the boss arena). */
const hasWeather = (state: GameState) => state.camera.x < ARENA_LEFT - CANVAS_WIDTH / 2;

/** The weather, then the fades to black over the top of it (not the sky's stars drifting over a black screen). */
export const drawErnieWeather = (ctx: Ctx, state: GameState) => {
  const rt = getErnie(state)!;
  drawBackdropFront(ctx, 'Ernie Earthquake', state.camera.x, state.camera.y, state.frame || 0);
  drawFades(ctx, rt);
  return true;
};

const drawFades = (ctx: Ctx, rt: ErnieRuntime) => {
  // Down off the bridge
  const d = downFade(rt);
  if (d > 0) { ctx.fillStyle = `rgba(0,0,0,${d})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  // Up the ramp and away
  if (rt.awayT > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, rt.awayT / (AWAY_FRAMES * 0.7))})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
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

/** The lines outside Ernie's door: the night tour's guide, then Meathead. */
const drawDoorCrashFront = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const dc = rt.doorCrash;
  if (dc.lineT <= 0 || !dc.line) return;
  if (dc.who === 'guide') bubble(ctx, CRASH_X + 130, Y - 100, dc.line);
  else if (dc.who === 'hipster') bubble(ctx, CRASH_X, Math.max(state.camera.y + 64, hipsterY(dc) - 90), dc.line);
  else { const p = state.player; bubble(ctx, p.pos.x + p.width / 2, p.pos.y - 16, dc.line); }
};
