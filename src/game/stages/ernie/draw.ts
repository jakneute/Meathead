// Drawing Ernie's stage: the sky (sunset over the bay), the painted ladies up
// and down the hills, the streets and the faults opening in them, the stuff
// coming down in the quakes, the Golden Gate coming apart (towers, cables, the
// far lane, the steel underneath, the burning wrecks), and the HUD (the quake
// banner, the fades). The bay, the jet ski and the cell house are in drawSea.ts.

import type { GameState } from '../../core/state';
import { bandedGradient, checker, hazeBands, pixelBlob, steppedGlow } from '../../render/pixelArt';
import { INK, ink, shaded, shadedTop, dark, lite } from '../../render/npc/kit';
import { drawFire } from '../../render/fx/fire';
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
import { drawPlungeFall, drawBayCorpse } from './plungeDraw';
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
  const ridge = (x: number) => horizon - 12 - 22 * Math.sin((x + drift) * 0.005) - 8 * Math.sin((x + drift) * 0.019);
  // (the headlands: lit along the crest by the sunset, fading into the haze down by the water)
  ctx.fillStyle = '#4B3D5A';
  ctx.beginPath(); ctx.moveTo(0, horizon);
  for (let x = 0; x <= W + 20; x += 16) ctx.lineTo(x, ridge(x));
  ctx.lineTo(W + 20, horizon); ctx.fill();
  for (let x = 0; x < W; x += 2) { const y = Math.round(ridge(x) / 2) * 2; ctx.fillStyle = '#7A4E6A'; ctx.fillRect(x, y, 2, 2); if ((x / 2) % 2) { ctx.fillStyle = '#5E4462'; ctx.fillRect(x, y + 4, 2, 2); } }
  hazeBands(ctx, 0, horizon - 30, W, 30, '#B4436C', 0, 0.35, 4);
  // (the water: in bands, the swell's lines across it)
  bandedGradient(ctx, 0, horizon, W, CANVAS_HEIGHT + 80 - horizon, ['#4A5A7E', '#3B5B80', '#2E4A6B', '#25405C'], 8);
  ctx.fillStyle = '#5276A0';
  for (let y = horizon + 4; y < CANVAS_HEIGHT + 60; y += 6) for (let x = ((y * 7 - drift * 0.5) % 22 + 22) % 22; x < W; x += 22) ctx.fillRect(x, y, 8, 2);
  ctx.fillStyle = 'rgba(246, 194, 122, 0.3)';
  for (let y = horizon + 2; y < horizon + 40; y += 6) for (let x = ((y * 13 - drift * 0.5) % 46 + 46) % 46; x < W; x += 46) ctx.fillRect(x, y, 6, 1);
};

/** Out on the bridge: the bay far below, the city behind you, the Marin headlands ahead, the island out in the water. */
const drawBridgeView = (ctx: Ctx, state: GameState) => {
  const W = CANVAS_WIDTH, f = state.frame;
  const horizon = 330;
  // (a slow drift as you go, from where the bridge starts)
  const cx = (state.camera.x - (COURSE.bridge.x1 - 1200)) * 0.03;
  // The bay
  bandedGradient(ctx, 0, horizon, W, CANVAS_HEIGHT + 80 - horizon, ['#6C5B7B', '#35567A', '#2E4A6B', '#25405C', '#1B2F4A'], 14);
  ctx.fillStyle = 'rgba(246, 194, 122, 0.35)';
  for (let i = 0; i < 30; i++) { const x = ((hash(i) * W + f * 0.2) % W), y = horizon + 6 + hash(i + 3) * 200; ctx.fillRect(x, y, 10 + hash(i + 5) * 30, 1); }
  // The city behind (left), fading into the haze: each tower lit down its sunward edge, a window or two catching it
  for (let i = 0; i < 26; i++) {
    const x = Math.round(-60 + i * 18 - cx), h = Math.round(20 + hash(i * 7) * 50);
    if (x > W * 0.45) break;
    ctx.fillStyle = '#4B3D5A'; ctx.fillRect(x, horizon - h, 16, h);
    ctx.fillStyle = '#3A2E48'; ctx.fillRect(x, horizon - h, 2, h);
    ctx.fillStyle = '#7A5A78'; ctx.fillRect(x + 14, horizon - h, 2, h); ctx.fillRect(x, horizon - h, 16, 1);
    if (hash(i * 7 + 1) < 0.4) { ctx.fillStyle = '#F6C27A'; ctx.fillRect(x + 4 + Math.round(hash(i) * 8), horizon - h + 6, 2, 2); }
  }
  // (the pyramid)
  ctx.fillStyle = '#4B3D5A'; ctx.beginPath(); ctx.moveTo(120 - cx, horizon - 100); ctx.lineTo(108 - cx, horizon); ctx.lineTo(132 - cx, horizon); ctx.fill();
  ctx.fillStyle = '#7A5A78'; ctx.beginPath(); ctx.moveTo(120 - cx, horizon - 100); ctx.lineTo(132 - cx, horizon); ctx.lineTo(126 - cx, horizon); ctx.fill();
  hazeBands(ctx, 0, horizon - 70, W * 0.5, 70, '#B4436C', 0, 0.4, 5);
  // Marin ahead (right): green-brown headlands, lit along the crest, the gullies down them in shadow
  const mx0 = W * 0.55;
  const mRidge = (x: number) => horizon - 20 - 60 * Math.sin((x - mx0) / (W * 0.45) * Math.PI * 0.9) - hash(x) * 6;
  ctx.fillStyle = '#3D4A3A';
  ctx.beginPath(); ctx.moveTo(mx0 - cx * 0.5, horizon);
  for (let x = mx0; x <= W + 20; x += 20) ctx.lineTo(x - cx * 0.5, mRidge(x));
  ctx.lineTo(W + 20, horizon); ctx.fill();
  for (let x = mx0; x < W + 20; x += 20) {
    const x0 = Math.round(x - cx * 0.5), y0 = Math.round(mRidge(x)), y1 = Math.round(mRidge(x + 20));
    ctx.strokeStyle = '#6E7A50'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0 + 1); ctx.lineTo(x0 + 20, y1 + 1); ctx.stroke();
    if (hash(x + 3) < 0.5) pixelBlob(ctx, x0 + 10, y0 + 14 + hash(x + 4) * 16, 8, 4, '#2E3A2E');
  }
  hazeBands(ctx, mx0 - cx * 0.5, horizon - 40, W, 40, '#9A6A7C', 0, 0.35, 4);
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
  const ln = Math.max(1, 1.1 / s), px = Math.max(1, 1 / s);
  // The rock: lit on its sunward face, the cliffs in shadow, strata across it, scrub on the ledges, inked
  const rock = () => { ctx.beginPath(); ctx.moveTo(-160, 0); ctx.lineTo(-130, -30); ctx.lineTo(-60, -44); ctx.lineTo(40, -50); ctx.lineTo(120, -36); ctx.lineTo(170, 0); ctx.closePath(); };
  ctx.save(); rock(); ctx.clip();
  ctx.fillStyle = '#5B5146'; ctx.fillRect(-160, -50, 330, 50);
  ctx.fillStyle = '#4A4239'; ctx.fillRect(-160, -50, 70, 50);
  ctx.fillStyle = '#7A6A58'; ctx.beginPath(); ctx.moveTo(40, -50); ctx.lineTo(120, -36); ctx.lineTo(170, 0); ctx.lineTo(100, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#463E36'; for (let k = 0; k < 4; k++) ctx.fillRect(-160, -40 + k * 10, 330, 2 * px);
  ctx.fillStyle = '#2E2924'; ctx.fillRect(-160, -6, 330, 6);
  ctx.restore();
  rock(); ctx.strokeStyle = INK; ctx.lineWidth = ln; ctx.stroke();
  ctx.fillStyle = '#4A5A3A'; ctx.fillRect(-120, -36, 60, 6); ctx.fillRect(60, -40, 50, 5);
  ctx.fillStyle = '#6A7A4A'; ctx.fillRect(-120, -36, 40, 2 * px); ctx.fillRect(60, -40, 30, 2 * px);
  // The cell house: long, pale, its roof lit, rows of windows, the shadowed end
  ctx.fillStyle = INK; ctx.fillRect(-80 - ln, -92 - ln, 170 + ln * 2, 46 + ln * 2);
  ctx.fillStyle = '#D8D2C4'; ctx.fillRect(-80, -92, 170, 46);
  ctx.fillStyle = '#B8B0A0'; ctx.fillRect(-80, -92, 170, 6);
  ctx.fillStyle = '#EDE6D6'; ctx.fillRect(-80, -92, 170, 2 * px);
  ctx.fillStyle = '#B4AC9C'; ctx.fillRect(66, -86, 24, 40);
  ctx.fillStyle = '#3B3F46'; for (let wx = -72; wx < 84; wx += 12) { ctx.fillRect(wx, -80, 6, 12); ctx.fillRect(wx, -62, 6, 10); }
  ctx.fillStyle = '#F6C27A'; for (let wx = -72; wx < 84; wx += 36) ctx.fillRect(wx, -80, 2 * px, 4 * px);
  // Other buildings down the slope
  for (const [bx, by, bw, bh] of [[-140, -44, 50, 20], [100, -48, 40, 16]]) {
    ctx.fillStyle = INK; ctx.fillRect(bx - ln, by - ln, bw + ln * 2, bh + ln * 2);
    ctx.fillStyle = '#C9C1B0'; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#E2DACA'; ctx.fillRect(bx, by, bw, 2 * px); ctx.fillStyle = '#A8A090'; ctx.fillRect(bx + bw - 6, by, 6, bh);
  }
  // The water tower
  ctx.strokeStyle = '#8A8478'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(112, -98); ctx.lineTo(108, -48); ctx.moveTo(134, -98); ctx.lineTo(138, -48); ctx.moveTo(110, -70); ctx.lineTo(136, -70); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(110 - ln, -118 - ln, 26 + ln * 2, 20 + ln * 2);
  ctx.fillStyle = '#E7E2D6'; ctx.fillRect(110, -118, 26, 20);
  ctx.fillStyle = '#F5F2EA'; ctx.fillRect(110, -118, 8, 20); ctx.fillStyle = '#B8B2A6'; ctx.fillRect(128, -118, 8, 20);
  // The lighthouse, and its light going round
  ctx.fillStyle = INK; ctx.fillRect(-116 - ln, -126, 12 + ln * 2, 82);
  ctx.fillStyle = '#E7E2D6'; ctx.fillRect(-116, -126, 12, 82);
  ctx.fillStyle = '#F5F2EA'; ctx.fillRect(-116, -126, 4, 82); ctx.fillStyle = '#B8B2A6'; ctx.fillRect(-107, -126, 3, 82);
  ctx.fillStyle = '#374151'; ctx.fillRect(-118, -134, 16, 8);
  const beam = 0.5 + 0.5 * Math.sin(f * 0.05);
  ctx.fillStyle = `rgba(253, 230, 138, ${0.4 + beam * 0.6})`; ctx.beginPath(); ctx.arc(-110, -130, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFBEB'; ctx.fillRect(-112, -132, 3, 3);
  // (the beam: brightest at the lamp, in steps out from it)
  const reach = Math.cos(f * 0.05) * 260;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-110, -130); ctx.lineTo(-110 + reach, -150); ctx.lineTo(-110 + reach, -110); ctx.closePath(); ctx.clip();
  for (let k = 0; k < 3; k++) {
    const u0 = -110 + reach * (k / 3), u1 = -110 + reach * ((k + 1) / 3);
    ctx.fillStyle = `rgba(253, 230, 138, ${(beam * 0.3 * (1 - k * 0.3)).toFixed(3)})`;
    ctx.fillRect(Math.min(u0, u1), -150, Math.abs(u1 - u0), 40);
  }
  ctx.restore();
  // (the foam where the rock meets the water)
  ctx.fillStyle = 'rgba(241, 245, 249, 0.7)'; for (let k = -150; k < 160; k += 24) ctx.fillRect(k + ((f >> 3) % 2) * 4, -2, 12, 2 * px);
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
  const quad = (d1: number, d2: number) => {
    ctx.beginPath(); ctx.moveTo(r.x1, r.y1 + d1); ctx.lineTo(r.x2, r.y2 + d1); ctx.lineTo(r.x2, Math.min(bottom + 400, r.y2 + d2)); ctx.lineTo(r.x1, Math.min(bottom + 400, r.y1 + d2)); ctx.closePath();
  };
  const band = (d1: number, d2: number, color: string) => { ctx.fillStyle = color; quad(d1, d2); ctx.fill(); };
  /** A row of dither along the street, d1 to d2 under its top (where one band steps into the next). */
  const dither = (d1: number, d2: number, color: string, phase = 0) => {
    ctx.save(); quad(d1, d2); ctx.clip();
    checker(ctx, r.x1, Math.min(r.y1, r.y2) + d1 - 2, r.x2 - r.x1, Math.abs(r.y2 - r.y1) + d2 - d1 + 4, color, phase);
    ctx.restore();
  };
  band(0, 1400, '#4A3A2E'); dither(52, 56, '#3B3A3E');
  // (the dirt under it: strata, a stone or two)
  for (let x = Math.ceil(r.x1 / 70) * 70; x < r.x2; x += 70) { const y = runYAt(r, x); ctx.fillStyle = '#3E3026'; ctx.fillRect(x + Math.round(hash(x) * 30), y + 70 + Math.round(hash(x + 1) * 50), 20, 3); ctx.fillStyle = '#5A4838'; ctx.fillRect(x + Math.round(hash(x) * 30), y + 69 + Math.round(hash(x + 1) * 50), 12, 1); }
  band(0, 12, '#B8B4AE'); dither(8, 12, '#A8A49E');
  band(12, 16, '#6B6B6B'); band(12, 13, '#8A8A8A');
  band(16, 48, '#3B3A3E'); dither(16, 18, '#2A292C'); dither(44, 48, '#2E2D31');
  band(0, 2, '#D6D3D1'); dither(2, 4, '#D6D3D1', 1);
  // The cable car slot and a rail
  band(28, 30, '#1C1917');
  band(26, 27, '#A8A29E'); band(25, 26, '#E7E5E4');
  // Expansion joints in the sidewalk (each lit along its far edge); grit and patches in the road
  for (let x = Math.ceil(r.x1 / 40) * 40; x < r.x2; x += 40) {
    const y = runYAt(r, x);
    ctx.fillStyle = '#8A8680'; ctx.fillRect(x, y, 2, 12); ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x + 2, y + 2, 1, 10);
    ctx.fillStyle = '#4A494E'; ctx.fillRect(x + Math.round(hash(x) * 30), y + 20 + Math.round(hash(x + 2) * 4), 2, 2);
    if (hash(x + 5) < 0.2) { ctx.fillStyle = '#2E2D31'; ctx.fillRect(x + 6, y + 34, 22, 8); ctx.fillStyle = '#444348'; ctx.fillRect(x + 6, y + 34, 22, 1); }
  }
};

/** The faults: paved over, then cracking (dust, the crack spreading), then open: a chasm, rubble in the lips. */
const drawFaults = (ctx: Ctx, state: GameState, qk: Quakes) => {
  COURSE.faults.forEach((f, i) => {
    if (!visible(state, f.x - 80, f.x + f.w + 80)) return;
    const since = state.frame - (qk.faults[i].openedAt ?? -999);
    drawFault(ctx, state, f, i, faultAmount(qk, i), since, r => drawStreet(ctx, state, r));
  });
};

/** A run of ironwork as a line: inked, the iron, a lit edge along it. */
const iron = (ctx: Ctx, path: () => void, w = 2) => {
  ctx.beginPath(); path();
  ctx.strokeStyle = INK; ctx.lineWidth = w + 2; ctx.stroke();
  ctx.strokeStyle = '#1F2937'; ctx.lineWidth = w; ctx.stroke();
  ctx.save(); ctx.translate(-0.5, -0.5); ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
};

/** Iron fire escapes on the fronts of the houses (you can get up on them). */
const drawFireEscape = (ctx: Ctx, x: number, y: number, w: number) => {
  // Brackets back to the wall, a ladder hanging down
  iron(ctx, () => { ctx.moveTo(x + 6, y + 5); ctx.lineTo(x + 20, y + 26); ctx.moveTo(x + w - 6, y + 5); ctx.lineTo(x + w - 20, y + 26); });
  iron(ctx, () => { ctx.moveTo(x + w - 30, y + 5); ctx.lineTo(x + w - 30, y + 60); ctx.moveTo(x + w - 16, y + 5); ctx.lineTo(x + w - 16, y + 60); for (let ly = y + 14; ly < y + 60; ly += 10) { ctx.moveTo(x + w - 30, ly); ctx.lineTo(x + w - 16, ly); } });
  // The rail and its balusters
  iron(ctx, () => { ctx.moveTo(x, y); ctx.lineTo(x, y - 30); ctx.lineTo(x + w, y - 30); ctx.lineTo(x + w, y); for (let rx = x + 12; rx < x + w; rx += 12) { ctx.moveTo(rx, y); ctx.lineTo(rx, y - 30); } });
  // The grating: inked, its slots, lit along the front edge
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, w + 2, 7);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(x, y, w, 5);
  ctx.fillStyle = '#374151'; for (let gx = x + 3; gx < x + w; gx += 6) ctx.fillRect(gx, y + 1, 2, 3);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(x, y, w, 1);
};

/** The toll plaza before the bridge, and the way down off the far end. */
const drawPlaza = (ctx: Ctx, state: GameState) => {
  const px = COURSE.bridge.x1 - 480;
  if (visible(state, px - 100, px + 500)) {
    // The toll gantry over the road: the bridge's own red steel, riveted, lit on the left
    for (const gx of [px, px + 380]) {
      slab(ctx, gx, Y - 200, 12, 200, RED);
      ctx.fillStyle = RED_DARK; for (let ry = Y - 190; ry < Y; ry += 16) ctx.fillRect(gx + 5, ry, 2, 2);
    }
    slab(ctx, px - 10, Y - 212, 412, 20, RED);
    ctx.fillStyle = RED_DARK; for (let rx = px - 4; rx < px + 400; rx += 14) { ctx.fillRect(rx, Y - 209, 2, 2); ctx.fillRect(rx, Y - 197, 2, 2); }
    ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillStyle = '#5A1810'; ctx.fillText('GOLDEN GATE BRIDGE', px + 197, Y - 197);
    ctx.fillStyle = '#F8FAFC'; ctx.fillText('GOLDEN GATE BRIDGE', px + 196, Y - 198);
    ctx.textAlign = 'left';
    ctx.fillStyle = INK; ctx.fillRect(px + 170, Y - 192, 2, 12); ctx.fillRect(px + 218, Y - 192, 2, 12);
    signPlate(ctx, px + 150, Y - 180, 90, 22, '#16A34A', 'TOLL: $9.75', 7);
    // A booth: the window (the sunset in it), the roof, the stripe, the door
    slab(ctx, px + 60, Y - 90, 50, 90, '#E7E5E4');
    ctx.fillStyle = INK; ctx.fillRect(px + 65, Y - 81, 40, 32);
    bandedGradient(ctx, px + 66, Y - 80, 38, 30, ['#BFDBFE', '#93C5FD', '#F6C27A'], 3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.fillRect(px + 70, Y - 76, 2, 10); ctx.fillRect(px + 72, Y - 78, 2, 4);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(px + 84, Y - 80, 2, 30);
    ctx.fillStyle = '#C0392B'; ctx.fillRect(px + 60, Y - 40, 50, 4);
    ctx.fillStyle = '#D6D3D1'; ctx.fillRect(px + 70, Y - 34, 30, 34); ctx.fillStyle = INK; ctx.fillRect(px + 70, Y - 34, 1, 34); ctx.fillRect(px + 94, Y - 20, 3, 2);
    slab(ctx, px + 56, Y - 96, 58, 8, RED);
  }
  const ex = COURSE.bridge.exit;
  if (visible(state, ex - 200, ex + 100)) {
    slab(ctx, ex - 72, Y - 106, 6, 106, '#E7E5E4', 1);
    signPlate(ctx, ex - 130, Y - 150, 120, 44, '#166534', '', 7);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('VISTA POINT', ex - 70, Y - 133); ctx.fillText('WATER  >>', ex - 70, Y - 117);
    ctx.textAlign = 'left';
    // Stairs going down (each tread where he walks down them: one per 14 down the ground's slope, course.ts)
    for (let s = 0; s <= 6; s++) {
      const sx = ex - 26 + s * 14;
      ctx.fillStyle = INK; ctx.fillRect(sx - 1, Y + s * 12 - 1, 42, 14);
      ctx.fillStyle = '#78716C'; ctx.fillRect(sx, Y + s * 12, 40, 12);
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(sx, Y + s * 12, 40, 2);
      ctx.fillStyle = '#57534E'; ctx.fillRect(sx, Y + s * 12 + 9, 40, 3);
    }
  }
};

/** A road sign: its plate inked with a white border, a lit top edge, the lettering. */
const signPlate = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string, text: string, size: number) => {
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(color, 0.2); ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = dark(color, 0.3); ctx.fillRect(x, y + h - 2, w, 2);
  ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 1; ctx.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  if (!text) return;
  ctx.font = `bold ${size}px "Press Start 2P"`; ctx.textAlign = 'center';
  ctx.fillStyle = '#F8FAFC'; ctx.fillText(text, x + w / 2, y + h / 2 + size / 2);
  ctx.textAlign = 'left';
};

/** A block lit from the upper left: a light top and left edge, a dark right and bottom, inked round. */
const slab = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, e = 2) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.3); ctx.fillRect(x, y, w, e); ctx.fillRect(x, y, e, h);
  ctx.fillStyle = dark(c, 0.25); ctx.fillRect(x + w - e, y, e, h); ctx.fillRect(x, y + h - e, w, e);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
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
    hazeBands(ctx, state.camera.x, water - 300, CANVAS_WIDTH, 300, '#CBD5E1', 0.05, 0.35, 6);
    bandedGradient(ctx, state.camera.x, water, CANVAS_WIDTH, 400, ['#35567A', '#2A4664', '#1E344D', '#0F1E33'], 10);
    for (let x = Math.floor(state.camera.x / 30) * 30; x < state.camera.x + CANVAS_WIDTH; x += 30) {
      const fx = Math.round(x + Math.sin(state.frame * 0.05 + x) * 4);
      ctx.fillStyle = '#E0F2FE'; ctx.fillRect(fx, water, 16, 2);
      ctx.fillStyle = '#7DA7C9'; ctx.fillRect(fx + 2, water + 2, 12, 2);
    }
  }
  if (x2 < x1) return;
  // Towers (behind the deck: it goes through them)
  for (const tx of B.towers) if (visible(state, tx - 80, tx + 80)) drawTower(ctx, tx, state);
  // Suspender cables (each inked, lit down one side) and the main cable, its wrapping bands
  ctx.beginPath();
  for (let x = Math.ceil(x1 / 50) * 50; x < x2; x += 50) { if (B.towers.some(t => Math.abs(x - t) < 40)) continue; ctx.moveTo(x, cableY(x)); ctx.lineTo(x, Y + FAR_LANE); }
  ctx.strokeStyle = '#5A1810'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = RED_DARK; ctx.lineWidth = 2; ctx.stroke();
  ctx.save(); ctx.translate(-0.5, 0); ctx.strokeStyle = RED; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  const cable = (dy: number) => { ctx.beginPath(); ctx.moveTo(x1, cableY(x1) + dy); for (let x = x1; x <= x2; x += 10) ctx.lineTo(x, cableY(x) + dy); };
  cable(0); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke();
  ctx.strokeStyle = RED; ctx.lineWidth = 7; ctx.stroke();
  cable(2); ctx.strokeStyle = RED_DARK; ctx.lineWidth = 2; ctx.stroke();
  cable(-2); ctx.strokeStyle = RED_LIGHT; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = RED_DARK; for (let x = Math.ceil(x1 / 25) * 25; x < x2; x += 25) ctx.fillRect(x, cableY(x) - 3, 1, 6);
  // The far lane (the cars going over the side from it): the deck edge lit, its shadowed underside, the curb
  const fl1 = Math.max(B.x1, x1), fl2 = Math.min(B.x2, x2);
  ctx.fillStyle = '#57534E'; ctx.fillRect(fl1, Y + FAR_LANE, fl2 - fl1, -FAR_LANE);
  ctx.fillStyle = '#44403C'; ctx.fillRect(fl1, Y + FAR_LANE + 6, fl2 - fl1, -FAR_LANE - 6);
  checker(ctx, fl1, Y + FAR_LANE + 4, fl2 - fl1, 2, '#44403C');
  ctx.fillStyle = INK; ctx.fillRect(fl1, Y + FAR_LANE - 1, fl2 - fl1, 1);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(fl1, Y + FAR_LANE, fl2 - fl1, 2);
  ctx.fillStyle = '#D6D3D1'; for (let x = Math.ceil(fl1 / 70) * 70; x < fl2 - 30; x += 70) ctx.fillRect(x + 35, Y + FAR_LANE + 4, 24, 1);
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
        // (the cracks, lit along one lip)
        for (const [c, ox] of [[RED_LIGHT, 1], ['#111111', 0]] as const) {
          ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath();
          ctx.moveTo(s.x + s.w * 0.3 + ox, Y); ctx.lineTo(s.x + s.w * 0.4 + ox, Y + 20 * k); ctx.lineTo(s.x + s.w * 0.35 + ox, Y + 40 * k);
          ctx.moveTo(s.x + s.w * 0.7 + ox, Y); ctx.lineTo(s.x + s.w * 0.62 + ox, Y + 24 * k);
          ctx.stroke();
        }
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
    // Torn ends either side of a gap: the slab's broken face (lit, inked), steel bent down out of it
    if (st.open) {
      const torn = (pts: number[][]) => {
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.closePath();
        ctx.fillStyle = '#44403C'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
      };
      torn([[s.x, Y], [s.x + 10, Y + 6], [s.x + 2, Y + 24], [s.x, Y + 24]]);
      torn([[s.x + s.w, Y], [s.x + s.w - 12, Y + 5], [s.x + s.w - 3, Y + 22], [s.x + s.w, Y + 22]]);
      ctx.fillStyle = '#78716C'; ctx.fillRect(s.x, Y, 6, 2); ctx.fillRect(s.x + s.w - 8, Y, 8, 2);
      ctx.beginPath(); ctx.moveTo(s.x + 6, Y + 30); ctx.lineTo(s.x + 20, Y + 60); ctx.moveTo(s.x + s.w - 6, Y + 30); ctx.lineTo(s.x + s.w - 24, Y + 70);
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(); ctx.strokeStyle = RED_DARK; ctx.lineWidth = 2; ctx.stroke();
    }
  });
  // Wrecks on the deck, burning
  for (const w of COURSE.wrecks) if (visible(state, w.x - 60, w.x + 60)) drawBurningWreck(ctx, w.x, state.frame);
};

const drawTower = (ctx: Ctx, tx: number, state: GameState) => {
  const bottom = Math.max(Y + 400, state.camera.y + CANVAS_HEIGHT + 20);
  const legW = 64, lx = tx - legW / 2, h = bottom - TOWER_TOP;
  // The leg: lit down its left in steps, shadowed right, dithered between, inked; rivet lines up it
  ctx.fillStyle = INK; ctx.fillRect(lx - 1, TOWER_TOP, legW + 2, h);
  ctx.fillStyle = RED; ctx.fillRect(lx, TOWER_TOP, legW, h);
  ctx.fillStyle = RED_LIGHT; ctx.fillRect(lx, TOWER_TOP, 5, h);
  checker(ctx, lx + 5, TOWER_TOP, 4, h, RED_LIGHT);
  ctx.fillStyle = RED_DARK; ctx.fillRect(tx + legW / 2 - 14, TOWER_TOP, 14, h);
  checker(ctx, tx + legW / 2 - 18, TOWER_TOP, 4, h, RED_DARK);
  ctx.fillStyle = '#6E1F17'; ctx.fillRect(tx + legW / 2 - 4, TOWER_TOP, 4, h);
  ctx.fillStyle = RED_DARK; for (let ry = TOWER_TOP + 8; ry < bottom; ry += 10) { ctx.fillRect(lx + 10, ry, 2, 2); ctx.fillRect(tx + legW / 2 - 22, ry, 2, 2); }
  // The art deco setbacks and the recessed panels (each panel's fluting lit on one side), the bands across
  for (let y = TOWER_TOP + 40; y < Y - 60; y += 120) {
    ctx.fillStyle = INK; ctx.fillRect(lx + 11, y - 1, legW - 22, 82);
    ctx.fillStyle = RED_DARK; ctx.fillRect(lx + 12, y, legW - 24, 80);
    ctx.fillStyle = '#6E1F17'; ctx.fillRect(lx + 12, y, legW - 24, 4);
    for (let k = 0; k < 4; k++) { ctx.fillStyle = '#6E1F17'; ctx.fillRect(lx + 16 + k * 9, y + 6, 4, 68); ctx.fillStyle = RED; ctx.fillRect(lx + 20 + k * 9, y + 6, 1, 68); }
    ctx.fillStyle = INK; ctx.fillRect(lx - 7, y + 95, legW + 14, 10);
    ctx.fillStyle = RED_LIGHT; ctx.fillRect(lx - 6, y + 96, legW + 12, 8);
    ctx.fillStyle = '#F07A6A'; ctx.fillRect(lx - 6, y + 96, legW + 12, 2);
    ctx.fillStyle = RED_DARK; ctx.fillRect(lx - 6, y + 102, legW + 12, 2);
  }
  // The saddle on top
  slab(ctx, lx - 8, TOWER_TOP - 18, legW + 16, 22, RED_DARK);
  // Aircraft warning light
  const on = state.frame % 60 < 30;
  if (on) steppedGlow(ctx, tx, TOWER_TOP - 22, 16, '#EF4444', 0.35, 0.05, 3);
  ctx.fillStyle = INK; ctx.fillRect(tx - 5, TOWER_TOP - 27, 10, 10);
  ctx.fillStyle = on ? '#EF4444' : '#7F1D1D'; ctx.fillRect(tx - 4, TOWER_TOP - 26, 8, 8);
  if (on) { ctx.fillStyle = '#FECACA'; ctx.fillRect(tx - 3, TOWER_TOP - 25, 3, 3); }
};

/** The road deck and the steel truss under it, from x1 to x2. */
const drawDeck = (ctx: Ctx, x1: number, x2: number, state: GameState) => {
  // Truss: chords, verticals and X-bracing (inked, lit along the top of each member)
  ctx.beginPath();
  ctx.moveTo(x1, Y + 20); ctx.lineTo(x2, Y + 20); ctx.moveTo(x1, Y + UNDER_STEEL); ctx.lineTo(x2, Y + UNDER_STEEL);
  for (let x = Math.ceil(x1 / 60) * 60; x < x2; x += 60) {
    ctx.moveTo(x, Y + 20); ctx.lineTo(x, Y + UNDER_STEEL);
    if (x + 60 <= x2) { ctx.moveTo(x, Y + 20); ctx.lineTo(x + 60, Y + UNDER_STEEL); ctx.moveTo(x + 60, Y + 20); ctx.lineTo(x, Y + UNDER_STEEL); }
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = RED_DARK; ctx.lineWidth = 4; ctx.stroke();
  ctx.save(); ctx.translate(0, -1); ctx.strokeStyle = '#A8352A'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  // (gusset plates where they meet)
  ctx.fillStyle = RED_DARK; for (let x = Math.ceil(x1 / 60) * 60; x < x2; x += 60) { ctx.fillRect(x - 4, Y + UNDER_STEEL - 4, 8, 8); ctx.fillStyle = '#5A1810'; ctx.fillRect(x - 1, Y + UNDER_STEEL - 1, 2, 2); ctx.fillStyle = RED_DARK; }
  // The stiffening girder the road sits on
  ctx.fillStyle = INK; ctx.fillRect(x1, Y + 7, x2 - x1, 18);
  ctx.fillStyle = RED; ctx.fillRect(x1, Y + 8, x2 - x1, 16);
  ctx.fillStyle = RED_LIGHT; ctx.fillRect(x1, Y + 8, x2 - x1, 2);
  ctx.fillStyle = RED_DARK; ctx.fillRect(x1, Y + 20, x2 - x1, 4);
  checker(ctx, x1, Y + 18, x2 - x1, 2, RED_DARK);
  ctx.fillStyle = RED_DARK; for (let x = Math.ceil(x1 / 12) * 12; x < x2; x += 12) ctx.fillRect(x, Y + 13, 2, 2);
  // The road
  ctx.fillStyle = '#44403C'; ctx.fillRect(x1, Y, x2 - x1, 9);
  ctx.fillStyle = '#57534E'; ctx.fillRect(x1, Y, x2 - x1, 1);
  ctx.fillStyle = '#F8FAFC'; for (let x = Math.ceil(x1 / 70) * 70; x < x2 - 30; x += 70) ctx.fillRect(x, Y + 4, 30, 2);
  ctx.fillStyle = '#A8A29E'; for (let x = Math.ceil(x1 / 70) * 70; x < x2 - 30; x += 70) ctx.fillRect(x, Y + 6, 30, 1);
  // The railing along the near side: the top rail lit, the posts inked
  ctx.fillStyle = INK; ctx.fillRect(x1, Y - 23, x2 - x1, 5);
  for (let x = Math.ceil(x1 / 16) * 16; x < x2; x += 16) ctx.fillRect(x - 1, Y - 22, 4, 22);
  ctx.fillStyle = RED; ctx.fillRect(x1, Y - 22, x2 - x1, 3);
  ctx.fillStyle = RED_LIGHT; ctx.fillRect(x1, Y - 22, x2 - x1, 1);
  for (let x = Math.ceil(x1 / 16) * 16; x < x2; x += 16) { ctx.fillStyle = RED; ctx.fillRect(x, Y - 19, 2, 19); ctx.fillStyle = RED_LIGHT; ctx.fillRect(x, Y - 19, 1, 19); }
  void state;
};

/** A wheel side on: inked tire, a lit arc over the top, a hubcap with its glint. */
const wheel = (ctx: Ctx, x: number, y: number, r: number, hub = '#9CA3AF') => {
  ink(ctx, () => ctx.arc(x, y, r, 0, Math.PI * 2), '#1F2937');
  ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r - 2, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
  ink(ctx, () => ctx.arc(x, y, r * 0.48, 0, Math.PI * 2), hub);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(Math.round(x - r * 0.25), Math.round(y - r * 0.25), 2, 2);
};

/** A sedan side on, its wheels on (0, 0): the body lit along its top, shadowed along the sill, the glass, inked. */
const drawCar = (ctx: Ctx, color: string, burnt = false) => {
  const body = () => { ctx.moveTo(-30, -20); ctx.lineTo(30, -20); ctx.lineTo(30, -6); ctx.lineTo(-30, -6); ctx.closePath(); };
  const cab = () => { ctx.moveTo(-18, -20); ctx.lineTo(-15, -32); ctx.lineTo(13, -32); ctx.lineTo(16, -20); ctx.closePath(); };
  shadedTop(ctx, cab, color, -18, -32, 34, 13);
  shadedTop(ctx, body, color, -30, -20, 60, 14);
  if (burnt) {
    // (burnt out: the glass gone, the paint blistered off in patches)
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(-15, -30, 12, 9); ctx.fillRect(1, -30, 12, 9);
    ctx.fillStyle = '#57534E'; for (let k = 0; k < 5; k++) ctx.fillRect(-26 + k * 11, -16 + (k % 2) * 4, 6, 2);
    ctx.fillStyle = '#7C2D12'; ctx.fillRect(-20, -12, 8, 2); ctx.fillRect(8, -18, 6, 2);
  } else {
    ink(ctx, () => { ctx.rect(-15, -30, 12, 9); ctx.rect(1, -30, 12, 9); }, '#93C5FD');
    ctx.fillStyle = '#DBEAFE'; ctx.fillRect(-13, -29, 2, 4); ctx.fillRect(3, -29, 2, 4);
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(27, -17, 3, 3);
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(-30, -17, 2, 3);
  }
  ctx.fillStyle = dark(color, 0.4); ctx.fillRect(-1, -19, 1, 12);
  wheel(ctx, -18, -6, 6, burnt ? '#44403C' : '#9CA3AF'); wheel(ctx, 18, -6, 6, burnt ? '#44403C' : '#9CA3AF');
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
  drawCar(ctx, '#292524', true);
  ctx.fillStyle = '#44403C'; ctx.fillRect(-18, -32, 34, 3);
  ctx.restore();
  // Flames and smoke
  drawFire(ctx, x, Y - 18, 62, 48, f, { seed: Math.floor(x) });
  for (let i = 0; i < 4; i++) {
    const t = ((f * 0.8 + i * 40) % 160) / 160, r = 12 + t * 26;
    pixelBlob(ctx, x + t * 30, Y - 50 - t * 160, r, r * 0.8, `rgba(40, 36, 34, ${(0.5 * (1 - t)).toFixed(3)})`);
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
  // (drawn from its 100 x 46 design, scaled up to its size)
  ctx.scale(CAR_W / 100, CAR_H / 46);
  const w = 100, h = 46;
  // The headlight's beam out ahead, brightest by the lamp
  for (let k = 0; k < 3; k++) {
    const a = w / 2 + k * 40, b = a + 40, spread = (k + 1) / 3;
    ctx.fillStyle = `rgba(254, 249, 195, ${(0.22 - k * 0.06).toFixed(3)})`;
    ctx.beginPath(); ctx.moveTo(a, -h + 26 - (spread - 1 / 3) * 16); ctx.lineTo(b, -h + 26 - spread * 16); ctx.lineTo(b, -h + 31 + spread * 19); ctx.lineTo(a, -h + 31 + (spread - 1 / 3) * 19); ctx.closePath(); ctx.fill();
  }
  // Body, with a sloped nose: lit along the roof, shadowed along the sill, inked
  const body = () => { ctx.moveTo(-w / 2, -8); ctx.lineTo(-w / 2, -h + 4); ctx.lineTo(w / 2 - 26, -h); ctx.lineTo(w / 2 - 8, -h + 22); ctx.lineTo(w / 2, -h + 24); ctx.lineTo(w / 2, -8); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = c.color; ctx.fillRect(-w / 2, -h, w, h);
  ctx.fillStyle = lite(c.color, 0.25); ctx.fillRect(-w / 2, -h, w, 7);
  checker(ctx, -w / 2, -h + 7, w, 2, lite(c.color, 0.25));
  ctx.fillStyle = dark(c.color, 0.22); ctx.fillRect(-w / 2, -18, w, 10);
  checker(ctx, -w / 2, -20, w, 2, dark(c.color, 0.22));
  ctx.fillStyle = dark(c.color, 0.4); ctx.fillRect(-w / 2, -11, w, 3);
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();
  // Windows, and whoever's driving: hands up off the wheel, screaming
  ink(ctx, () => { ctx.rect(-w / 2 + 6, -h + 9, 22, 13); ctx.rect(-w / 2 + 32, -h + 9, 22, 13); }, '#1E293B');
  ink(ctx, () => { ctx.moveTo(w / 2 - 42, -h + 9); ctx.lineTo(w / 2 - 26, -h + 9); ctx.lineTo(w / 2 - 14, -h + 21); ctx.lineTo(w / 2 - 42, -h + 21); ctx.closePath(); }, '#1E293B');
  ctx.fillStyle = '#334155'; ctx.fillRect(-w / 2 + 6, -h + 9, 22, 3); ctx.fillRect(-w / 2 + 32, -h + 9, 22, 3);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; ctx.fillRect(-w / 2 + 8, -h + 12, 2, 6); ctx.fillRect(-w / 2 + 34, -h + 12, 2, 6);
  ink(ctx, () => ctx.arc(w / 2 - 32, -h + 15, 4, 0, Math.PI * 2), '#E0AC69', 0.8);
  ctx.fillStyle = '#450A0A'; ctx.fillRect(w / 2 - 30, -h + 16, 2, 3);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(w / 2 - 33, -h + 13, 1, 1); ctx.fillRect(w / 2 - 30, -h + 13, 1, 1);
  ink(ctx, () => { ctx.rect(w / 2 - 38, -h + 7 + Math.sin(f * 0.8) * 2, 3, 6); ctx.rect(w / 2 - 26, -h + 7 - Math.sin(f * 0.8) * 2, 3, 6); }, '#E0AC69', 0.6);
  // Door line, handle, bumpers
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fillRect(-4, -h + 8, 1, h - 16); ctx.fillRect(4, -24, 6, 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; ctx.fillRect(-3, -h + 8, 1, h - 16);
  for (const [bx, bw] of [[w / 2 - 4, 6], [-w / 2 - 2, 5]]) { ctx.fillStyle = INK; ctx.fillRect(bx - 1, -15, bw + 2, 7); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(bx, -14, bw, 5); ctx.fillStyle = '#E5E7EB'; ctx.fillRect(bx, -14, bw, 1); }
  // Headlight and tail light
  ctx.fillStyle = INK; ctx.fillRect(w / 2 - 6, -h + 25, 6, 7);
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(w / 2 - 5, -h + 26, 5, 5);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(w / 2 - 4, -h + 27, 2, 2);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-w / 2, -h + 24, 3, 7); ctx.fillStyle = '#FCA5A5'; ctx.fillRect(-w / 2, -h + 24, 3, 2);
  // Wheels, spinning
  for (const wx of [-w / 2 + 20, w / 2 - 20]) {
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(wx, -7, 11, Math.PI, 0); ctx.fill();
    wheel(ctx, wx, -7, 9, '#6B7280');
    ctx.strokeStyle = '#374151'; ctx.lineWidth = 2;
    const a = f * 0.9 * (c.state === 'driving' ? 1 : 0.3);
    ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * 4, -7 + Math.sin(a) * 4); ctx.lineTo(wx - Math.cos(a) * 4, -7 - Math.sin(a) * 4); ctx.stroke();
  }
  ctx.restore();
  // Smoke off the tires
  if (c.state === 'driving' && f % 2 === 0) {
    const r = 5 + (f % 6);
    pixelBlob(ctx, c.dir > 0 ? c.x - 4 : c.x + CAR_W + 4, c.y - 6, r, r * 0.8, 'rgba(214, 211, 209, 0.5)');
  }
};

/** A car on its way that isn't in view yet: headlights and a honking horn at that edge of the screen. */
const drawCarWarning = (ctx: Ctx, state: GameState, c: Car) => {
  const k = c.t / CAR_WARN;
  const y = GROUND_Y - state.camera.y - 26;
  const left = c.dir > 0;
  const x = left ? 0 : CANVAS_WIDTH;
  // The headlights' glow creeping in, in rings
  ctx.save(); ctx.beginPath(); ctx.rect(left ? 0 : CANVAS_WIDTH - 220, y - 200, 220, 400); ctx.clip();
  steppedGlow(ctx, x, y, 80 + k * 120, '#FEF9C3', 0.35 + k * 0.45, 0, 5);
  ctx.restore();
  if (Math.floor(state.frame / 6) % 2) return;
  ctx.save();
  const ax = left ? 18 : CANVAS_WIDTH - 18, d = left ? 1 : -1;
  ctx.beginPath(); ctx.moveTo(ax + d * 16, y); ctx.lineTo(ax, y - 12); ctx.lineTo(ax, y + 12); ctx.closePath();
  ctx.fillStyle = '#EF4444'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
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
    // (the stretch of snapped cable it's swinging on, from where it's still fixed above)
    const len = Math.max(20, d.y - mainCableY(d.x));
    ctx.beginPath(); ctx.moveTo(d.x - Math.sin(swing) * len, d.y - len); ctx.lineTo(d.x, d.y - 8);
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = '#8E2A20'; ctx.lineWidth = 3; ctx.stroke();
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
      ctx.fillStyle = INK; ctx.fillRect(l.x - 6, l.y - 17, 12, 7);
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
    case 'pot': {
      // A terracotta pot (lit down its left, its rim), a geranium in it
      const pot = () => { ctx.moveTo(-8, -8); ctx.lineTo(8, -8); ctx.lineTo(6, 8); ctx.lineTo(-6, 8); ctx.closePath(); };
      shaded(ctx, pot, '#C2410C', -8, -8, 16, 16);
      ink(ctx, () => ctx.rect(-9, -10, 18, 4), '#9A3412');
      ctx.fillStyle = '#C2410C'; ctx.fillRect(-8, -10, 16, 1);
      ink(ctx, () => ctx.arc(0, -14, 8, 0, Math.PI * 2), '#16A34A');
      ctx.fillStyle = '#15803D'; ctx.fillRect(1, -12, 5, 4); ctx.fillStyle = '#4ADE80'; ctx.fillRect(-5, -19, 4, 2);
      ink(ctx, () => ctx.rect(-3, -18, 4, 4), '#F472B6', 0.8);
      ctx.fillStyle = '#FBCFE8'; ctx.fillRect(-3, -18, 2, 1);
      break;
    }
    case 'brick':
      ink(ctx, () => ctx.rect(-11, -6, 22, 12), '#991B1B');
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-10.5, 2, 21, 3.5);
      ctx.fillStyle = '#B91C1C'; ctx.fillRect(-10.5, -5.5, 21, 2);
      ctx.fillStyle = '#D6D3D1'; ctx.fillRect(-10.5, -5.5, 21, 1);
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-4, -2, 2, 2); ctx.fillRect(4, 0, 2, 1);
      break;
    case 'ac':
      // A window unit: the case lit on top, its grille, the vents, the drip stain
      ink(ctx, () => ctx.rect(-16, -12, 32, 24), '#D4D4D8');
      ctx.fillStyle = '#F4F4F5'; ctx.fillRect(-15.5, -11.5, 31, 2);
      ctx.fillStyle = '#A1A1AA'; ctx.fillRect(13, -11, 2.5, 21);
      ctx.fillStyle = '#71717A'; for (let y = -8; y < 10; y += 4) { ctx.fillRect(-12, y, 24, 2); }
      ctx.fillStyle = '#E4E4E7'; for (let y = -8; y < 10; y += 4) ctx.fillRect(-12, y + 2, 24, 1);
      ctx.fillStyle = '#27272A'; ctx.fillRect(-16, 10, 32, 2);
      break;
    case 'rivet':
      // A cable band's bolt: the round head lit at the top left, the shank
      ink(ctx, () => ctx.rect(-3, -12, 6, 24), '#7F1D1D');
      ctx.fillStyle = '#991B1B'; ctx.fillRect(-2.5, -11.5, 2, 23);
      ink(ctx, () => ctx.arc(0, 0, 8, 0, Math.PI * 2), '#B91C1C');
      ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.arc(-1.5, -1.5, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FCA5A5'; ctx.fillRect(-4, -4, 2, 2);
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(2, 3, 3, 2);
      break;
    case 'beam':
      // A length of I-beam: flanges lit along the top, the web in shadow, rivets
      ink(ctx, () => ctx.rect(-18, -5, 36, 10), RED);
      ctx.fillStyle = RED_DARK; ctx.fillRect(-17.5, -4.5, 35, 2.5); ctx.fillRect(-17.5, 2, 35, 2.5);
      ctx.fillStyle = RED_LIGHT; ctx.fillRect(-17.5, -4.5, 35, 1);
      ctx.fillStyle = '#6E1F17'; for (let x = -14; x < 18; x += 7) ctx.fillRect(x, -1, 1.5, 1.5);
      break;
    case 'lamp':
      // A cell house light: an enameled shade, the bulb glowing under it
      ink(ctx, () => { ctx.moveTo(-14, 4); ctx.lineTo(-5, -8); ctx.lineTo(5, -8); ctx.lineTo(14, 4); ctx.closePath(); }, '#E5E7EB');
      ctx.fillStyle = '#F9FAFB'; ctx.beginPath(); ctx.moveTo(-12, 3); ctx.lineTo(-4, -7); ctx.lineTo(-1, -7); ctx.lineTo(-6, 3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-13, 2.5, 26, 1.5);
      ink(ctx, () => ctx.rect(-3, -12, 6, 5), '#52525B');
      ink(ctx, () => ctx.arc(0, 6, 4, 0, Math.PI * 2), '#FEF9C3', 0.8);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-2, 4, 2, 2);
      break;
    case 'plaster': {
      // A slab of the gallery's underside, cracked through, hanging by its rebar
      ctx.fillStyle = INK; ctx.fillRect(-7, -13, 4, 9); ctx.fillRect(5, -13, 4, 9);
      ctx.fillStyle = '#7C4A2A'; ctx.fillRect(-6, -12, 2, 8); ctx.fillRect(6, -12, 2, 8);
      const slabP = () => { ctx.moveTo(-14, -6); ctx.lineTo(12, -6); ctx.lineTo(15, 3); ctx.lineTo(4, 8); ctx.lineTo(-12, 5); ctx.closePath(); };
      shadedTop(ctx, slabP, '#A8A29E', -14, -6, 29, 14);
      ctx.fillStyle = '#78716C'; ctx.fillRect(-12, 2, 25, 2);
      ctx.strokeStyle = '#57534E'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(1, -1); ctx.lineTo(-1, 4); ctx.stroke();
      break;
    }
    case 'rock': {
      const rk = () => { ctx.moveTo(-14, 6); ctx.lineTo(-12, -6); ctx.lineTo(-2, -12); ctx.lineTo(12, -8); ctx.lineTo(15, 4); ctx.lineTo(6, 10); ctx.closePath(); };
      shaded(ctx, rk, '#78716C', -14, -12, 29, 22);
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(-8, -8, 8, 3);
      ctx.fillStyle = '#D6D3D1'; ctx.fillRect(-7, -8, 3, 1);
      ctx.fillStyle = '#44403C'; ctx.fillRect(-10, 5, 18, 3);
      ctx.fillStyle = '#57534E'; ctx.fillRect(2, -3, 5, 1); ctx.fillRect(6, -2, 1, 4);
      break;
    }
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
  // (him, on the way down; then in the bay, the kill cam)
  if (pl && !pl.splashAt) drawPlungeFall(ctx, state, pl);
  if (pl && pl.splashAt && state.deathTimer > 0) drawBayCorpse(ctx, state, pl, GROUND_Y + DROP_TO_WATER, state.deathFrames);
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
