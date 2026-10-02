// Drawing Barry's stage: the night skyline (the backdrop, burning at the end), the
// mean streets (brownstones and storefronts, the trenches where the street's dug
// up, stoops, parked cars, scaffolding, the steam grates), the rooftops (tar and
// parapets, the alleys between, water towers, the walk-up with its fire escapes
// and its tenants' windows), the street at the end. The skyscraper's floors and
// the power room are in rooms.ts; the lighting, the elevator, the fades and the
// ride down in hud.ts.

import { drawDumpster } from './dumpster';
import { drawHydrant } from '../../render/props/hydrant';
import { brickPattern, checker, bandedGradient, hazeBands, pixelBlob } from '../../render/pixelArt';
import type { GameState } from '../../core/state';
import type { Enemy } from '../../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { STAGE_BACKDROPS, BARRY_SKYLINES_DARK } from '../../render/backdrops/stages';
import { blitLayer } from '../../render/backdrops/core';
import type { Live } from '../../render/backdrops';
import type { LayerSpec } from '../../render/backdrops/core';
import { drawBackdropFront } from '../../render/backdrops';
import { drawBarryKind } from '../../render/enemies/barry';
import { drawKindEnemy } from '../../render/enemies';
import { drawPlayer } from '../../render/player/player';
import { COURSE, Ledge, Prop, placeOf, roomOf } from './course';
import { getBarry, BarryRuntime, ventState, barkOf } from './runtime';
import { saying, drawBubble } from './script';
import { drawGraffiti, drawTagOnly } from './graffiti';
import { drawSurge, drawSurgeFlash } from './surgeDraw';
import { lampLevel, blackout, blackoutUp, blackoutAt } from './lighting';
import { drawRooms, drawRoomFront } from './rooms';
import { drawBarryOverlays, drawBarryScreenHud } from './hud';

type Ctx = CanvasRenderingContext2D;
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;
const Y = GROUND_Y;

// ---------------------------------------------------------------------------
// The sky
// ---------------------------------------------------------------------------

const LAYERS = STAGE_BACKDROPS['Blackout Barry'].layers;
const layer = (ctx: Ctx, camX: number, camY: number, frame: number, i: number) => {
  const l = LAYERS[i];
  if (typeof l === 'function') { ctx.save(); (l as Live)(ctx, { camX, camY, frame }); ctx.restore(); }
  else blitLayer(ctx, l as LayerSpec, camX, camY, frame);
};

export const drawBarryBackdrop = (ctx: Ctx, state: GameState): boolean => {
  const place = placeOf(state.camera.x + CANVAS_WIDTH / 2);
  const rt = getBarry(state)!;
  if (rt.surf?.phase === 'air') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return true; }
  if (roomOf(place)) { ctx.fillStyle = '#07080C'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return true; }
  ctx.fillStyle = '#010208'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.save();
  ctx.translate(0, Math.max(-60, Math.min(60, -(state.camera.y - (Y - 550)) * 0.12)));
  for (let i = 0; i < LAYERS.length; i++) {
    // (up on the roofs the blackout's the real one, below: not the backdrop's own wave)
    if (place === 'roofs' && i === BLACKOUT_WAVE) continue;
    layer(ctx, state.camera.x, state.camera.y, state.frame, i);
    if (place === 'roofs' && i === LAST_SKYLINE) drawSkylineBlackout(ctx, state);
  }
  ctx.restore();
  // The end: the city on fire (an orange glow up the sky, smoke across it)
  if (place === 'landing') { drawDistantChaos(ctx, state); drawCityBurning(ctx, state.frame, 1.2); }
  return true;
};

/** Which of the backdrop's layers are the skylines, and its own blackout wave. */
const LAST_SKYLINE = 2, BLACKOUT_WAVE = 3;

/**
 * The rolling blackout across the skyline: where it's rolled through, the buildings go dark (every light in them
 * out, not just dimmed; the sky over them left as it is); windows sputter at its edges as it goes.
 */
const drawSkylineBlackout = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  const strip = 16;
  const dark: [number, number][] = [];
  for (let sx = 0; sx < CANVAS_WIDTH; sx += strip) {
    // (the wave on the skyline keeps pace with the one over the roofs you're on)
    const b = blackout(f, state.camera.x + sx);
    if (b > 0.5 || (b > 0.25 && hash(sx + Math.floor(f / 3)) < b)) dark.push([sx, strip]);
  }
  if (!dark.length) return;
  ctx.save();
  ctx.beginPath(); for (const [x, w] of dark) ctx.rect(x, -200, w, CANVAS_HEIGHT + 400); ctx.clip();
  for (const l of BARRY_SKYLINES_DARK) blitLayer(ctx, l, state.camera.x, state.camera.y, f);
  ctx.restore();
};

/**
 * Out past the street at the end: the city burning. Towers on fire along their tops, one of them leaning, black smoke
 * going up in columns, blasts going off, a helicopter's searchlight sweeping. (Screen space, a slow parallax.)
 */
const drawDistantChaos = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  const off = state.camera.x * 0.12;
  const shift = -(off % 140), first = Math.trunc(off / 140);
  for (let b = -2; b < 9; b++) {
    // (each tower is its own, wherever it's scrolled to: its height, its windows, which one leans)
    const id = b + first;
    const bx = shift + b * 140, bh = 170 + hash(id * 13 + 7) * 190, top = 470 - bh, lean = hash(id * 5 + 3) < 0.12 ? 0.12 : 0;
    ctx.save(); ctx.translate(bx + 45, 470); ctx.rotate(lean); ctx.translate(-(bx + 45), -470);
    ctx.fillStyle = '#140C0C'; ctx.fillRect(bx, top, 90, bh + 200);
    for (let row = 0; top + 10 + row * 16 < 470; row++) for (let col = 0; col < 6; col++) {
      const w = id * 97 + row * 11 + col;
      let h = hash(w * 3.7);
      // Now and then one goes out, or catches, for a second or so (each on its own slow clock)
      const period = 70 + hash(w + 0.5) * 150, slot = Math.floor((f + hash(w + 0.25) * period) / period);
      if (hash(w * 1.3 + slot * 7.1) < 0.12) h = h < 0.3 ? 0.9 : 0.2;
      if (h < 0.3) { ctx.fillStyle = h < 0.12 ? '#FDE047' : '#F97316'; ctx.fillRect(bx + 8 + col * 14, top + 10 + row * 16, 6, 8); }
    }
    drawFlames(ctx, bx + 5, top + 4, 80, f + Math.abs(id) * 21);
    ctx.restore();
    // Smoke going up off it
    for (let i = 0; i < 4; i++) { const t = ((f * 0.6 + i * 45 + id * 30) % 180 + 180) % 180 / 180; ctx.fillStyle = `rgba(20, 16, 14, ${0.55 * (1 - t)})`; ctx.beginPath(); ctx.arc(bx + 45 + Math.sin(t * 4 + id) * 20, top - t * 260, 20 + t * 50, 0, Math.PI * 2); ctx.fill(); }
  }
  // A blast going up somewhere out there now and then
  const bt = f % 150;
  if (bt < 20) { const ex = 100 + hash(Math.floor(f / 150)) * 600; ctx.fillStyle = `rgba(254, 215, 170, ${1 - bt / 20})`; ctx.beginPath(); ctx.arc(ex, 330, 20 + bt * 5, 0, Math.PI * 2); ctx.fill(); }
  // A helicopter, its searchlight sweeping the smoke
  const hx = ((f * 1.1) % (CANVAS_WIDTH + 300)) - 150, hy = 110 + Math.sin(f * 0.02) * 10;
  const sweep = Math.sin(f * 0.03) * 0.5;
  ctx.fillStyle = 'rgba(254, 249, 195, 0.12)'; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - 60 + sweep * 300, 470); ctx.lineTo(hx + 60 + sweep * 300, 470); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.ellipse(hx, hy, 18, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(hx - 40, hy - 2, 26, 3); ctx.fillRect(hx - 30, hy - 12, 60 * Math.abs(Math.sin(f * 1.3)), 2);
  if (f % 30 < 15) { ctx.fillStyle = '#EF4444'; ctx.fillRect(hx - 40, hy - 3, 3, 3); }
};

/** Fire in the sky over the city: a glow from below, smoke rolling across, embers. (k: how much.) */
export const drawCityBurning = (ctx: Ctx, f: number, k: number) => {
  hazeBands(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT / 2, '#B91C1C', 0, 0.25 * k, 6);
  hazeBands(ctx, 0, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT / 2, '#EA580C', 0.25 * k, 0.55 * k, 6);
  // (smoke rolling across it, in ragged banks)
  for (let i = 0; i < 9; i++) {
    const x = ((i * 137 + f * (0.4 + (i % 3) * 0.2)) % (CANVAS_WIDTH + 300)) - 150, y = 120 + (i * 53) % 220;
    const c = `rgba(28, 25, 23, ${(0.35 * k).toFixed(3)})`;
    pixelBlob(ctx, x, y, 90 + (i % 3) * 30, 26 + (i % 2) * 10, c);
    pixelBlob(ctx, x + 40, y - 14, 50, 16, c);
  }
  ctx.fillStyle = `rgba(253, 186, 116, ${0.8 * k})`;
  for (let i = 0; i < 24; i++) { const x = (i * 97 + f * 1.3) % CANVAS_WIDTH, y = CANVAS_HEIGHT - ((f * (1 + (i % 4) * 0.5) + i * 61) % CANVAS_HEIGHT); ctx.fillRect(x, y, 2, 2); }
};

// ---------------------------------------------------------------------------
// World: behind everything that moves
// ---------------------------------------------------------------------------

export const drawBarryBack = (ctx: Ctx, state: GameState) => {
  const rt = getBarry(state)!;
  const place = placeOf(state.camera.x + CANVAS_WIDTH / 2);
  if (roomOf(place)) { drawRooms(ctx, state, rt, place); return; }
  if (place === 'streets' || place === 'landing') drawStreetFronts(ctx, state, place === 'landing');
  if (place === 'roofs') drawRoofScape(ctx, state);
  drawGaps(ctx, state, place);
  for (const pr of COURSE.props) if (visible(state, pr.x - 100, pr.x + (pr.w ?? 200) + 100)) drawProp(ctx, state, pr);
  for (const r of state.groundRuns) if (r.surface === 'roof' && visible(state, r.x1, r.x2)) drawRoof(ctx, state, r.x1, r.x2, r.y1);
  if (place === 'roofs') drawWalkUp(ctx, state);
};

/** Brownstones and storefronts along the street: stoops, cornices, fire escapes, windows lit (some flickering). */
const drawStreetFronts = (ctx: Ctx, state: GameState, burning: boolean) => {
  const f = state.frame;
  const x0 = Math.floor((state.camera.x - 200) / 260), x1 = Math.ceil((state.camera.x + CANVAS_WIDTH + 200) / 260);
  for (let k = x0; k <= x1; k++) {
    const x = k * 260, h = (burning ? 200 + hash(k) * 200 : 330 + hash(k) * 220), top = Y - h;
    // At the end: every other lot's come down, a heap of rubble and a wall stub where it stood (the city burning past it)
    if (burning && hash(k * 7 + 2) < 0.5) { drawCollapsedLot(ctx, x, f, k); continue; }
    const tones = ['#5B2A1E', '#4A2C24', '#3F3A3A', '#5A3B2B', '#30343F'];
    ctx.fillStyle = tones[Math.floor(hash(k + 3) * tones.length)];
    if (burning) {
      // Its top bitten off, jagged
      ctx.beginPath(); ctx.moveTo(x, Y); ctx.lineTo(x, top + hash(k + 5) * 40);
      for (let j = 1; j <= 8; j++) ctx.lineTo(x + j * 32.5, top + (j % 2 ? 30 + hash(k * 3 + j) * 70 : hash(k * 5 + j) * 30));
      ctx.lineTo(x + 262, Y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.ellipse(x + 40 + j * 80, top + 90 + hash(k + j) * 120, 26, 40, 0, 0, Math.PI * 2); ctx.fill(); } // scorch
    } else ctx.fillRect(x, top, 262, h);
    // Brick courses, a cornice
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = top + 8; y < Y; y += 10) ctx.fillRect(x, y, 262, 1);
    ctx.fillStyle = '#1C1917'; ctx.fillRect(x - 4, top, 270, 10); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x - 4, top + 8, 270, 3);
    // Windows, some lit, a few flickering, a silhouette in one now and then
    for (let row = 0; row < 6; row++) for (let c = 0; c < 3; c++) {
      const wx = x + 28 + c * 78, wy = top + 30 + row * 56;
      if (wy > Y - 150) continue;
      const lit = hash(k * 31 + row * 7 + c) < (burning ? 0.2 : 0.45) && (hash(k * 5 + row + c + Math.floor(f / 90)) > 0.04);
      ctx.fillStyle = lit ? (burning ? '#F97316' : '#FCD34D') : '#111827'; ctx.fillRect(wx, wy, 34, 40);
      if (lit && hash(k + row * 3 + c * 11) < 0.12) { ctx.fillStyle = 'rgba(17,24,39,0.8)'; ctx.fillRect(wx + 10, wy + 12, 12, 28); ctx.beginPath(); ctx.arc(wx + 16, wy + 12, 6, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(wx + 16, wy, 2, 40); ctx.fillRect(wx, wy + 19, 34, 2);
      ctx.fillStyle = '#57534E'; ctx.fillRect(wx - 3, wy + 40, 40, 4);
    }
    // A fire escape down the front of every other one
    if (k % 2 === 0) {
      ctx.strokeStyle = '#0B0B0F'; ctx.lineWidth = 2;
      for (let row = 1; row < 5; row++) { const y = top + 26 + row * 56 + 44; if (y > Y - 160) break; ctx.strokeRect(x + 20, y - 18, 120, 18); ctx.beginPath(); ctx.moveTo(x + 30 + (row % 2) * 90, y); ctx.lineTo(x + 70 + (row % 2) * 10, y + 38); ctx.stroke(); }
    }
    // The shopfront at street level: a lit window, an awning, a sign
    const shop = Math.floor(hash(k + 9) * 5);
    ctx.fillStyle = '#0F172A'; ctx.fillRect(x + 20, Y - 130, 220, 130);
    ctx.fillStyle = shop === 0 ? 'rgba(252, 211, 77, 0.35)' : shop === 1 ? 'rgba(96, 165, 250, 0.3)' : 'rgba(17,24,39,0.8)'; ctx.fillRect(x + 30, Y - 110, 120, 80);
    if (shop < 3) { ctx.fillStyle = ['#B91C1C', '#1D4ED8', '#15803D'][shop]; ctx.fillRect(x + 16, Y - 150, 228, 24); ctx.fillStyle = '#F8FAFC'; for (let s = 0; s < 228; s += 24) ctx.fillRect(x + 16 + s, Y - 128, 12, 4); }
    ctx.fillStyle = shop === 3 ? '#57534E' : '#1C1917'; ctx.fillRect(x + 170, Y - 110, 50, 110); // the door
    if (shop === 4) { ctx.fillStyle = '#44403C'; for (let y = Y - 128; y < Y; y += 8) ctx.fillRect(x + 20, y, 220, 5); } // a roll-down gate, closed
    // At the end: the tops of half of them on fire, smoke going up off them, a glow in the windows
    if (burning && hash(k * 3 + 1) < 0.55) {
      drawFlames(ctx, x + 30, top, 200, f + k * 17);
      ctx.fillStyle = 'rgba(28, 25, 23, 0.55)';
      for (let i = 0; i < 4; i++) { const t = ((f * 0.8 + i * 40 + k * 11) % 160) / 160; ctx.beginPath(); ctx.arc(x + 130 + Math.sin(t * 5 + k) * 30, top - 40 - t * 260, 24 + t * 50, 0, Math.PI * 2); ctx.fill(); }
    }
    // Graffiti: a big piece across a closed gate, a smaller one along the wall under a window, tags on the doors
    const words = GRAFFITI[Math.floor(hash(k + 23) * GRAFFITI.length)];
    if (shop === 4) drawGraffiti(ctx, x + 40, Y - 44, words, 30, k + 101, 196);
    else if (hash(k + 17) < 0.5) drawGraffiti(ctx, x + 36, Y - 7, words, 15, k + 57, 128);
    if (hash(k + 29) < 0.45) drawTagOnly(ctx, x + 176, Y - 46, k + 7);
  }
};

/** What's sprayed on the walls. */
const GRAFFITI = ['BARRY SUX', 'NO LIGHT', '4EVA', 'CON ED = DEAD', 'LIGHTS OUT', 'KAOS', 'DARK CITY'];

/** A lot where a building's come down: a heap of rubble and rebar, a jagged stub of wall, fire in the heap, smoke. */
const drawCollapsedLot = (ctx: Ctx, x: number, f: number, k: number) => {
  ctx.fillStyle = '#3F3A3A';
  ctx.beginPath(); ctx.moveTo(x + 10, Y); ctx.lineTo(x + 20, Y - 140 - hash(k) * 80); ctx.lineTo(x + 40, Y - 110); ctx.lineTo(x + 52, Y - 170 - hash(k + 1) * 60); ctx.lineTo(x + 70, Y - 90); ctx.lineTo(x + 70, Y); ctx.closePath(); ctx.fill(); // the wall stub
  ctx.fillStyle = '#111827'; ctx.fillRect(x + 26, Y - 120, 16, 20); // a window hole in it
  ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.moveTo(x, Y); ctx.quadraticCurveTo(x + 130, Y - 110, x + 262, Y); ctx.fill(); // the heap
  ctx.fillStyle = '#78716C'; for (let j = 0; j < 12; j++) ctx.fillRect(x + 30 + hash(k * 9 + j) * 200, Y - 10 - hash(k * 11 + j) * 70, 12 + hash(j) * 14, 8);
  ctx.strokeStyle = '#7C2D12'; ctx.lineWidth = 2; for (let j = 0; j < 5; j++) { const rx = x + 60 + j * 35; ctx.beginPath(); ctx.moveTo(rx, Y - 50); ctx.lineTo(rx + 10 - j * 4, Y - 90 - j * 6); ctx.stroke(); } // rebar
  drawFlames(ctx, x + 70, Y - 40, 120, f + k * 13);
};

/** The roofs' buildings: each roof's building down to the bottom of the screen, windows lit or out with the blackout. */
const drawRoofScape = (ctx: Ctx, state: GameState) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 40;
  for (const r of state.groundRuns) {
    if (r.surface !== 'roof' || !visible(state, r.x1, r.x2)) continue;
    const seed = Math.round(r.x1);
    const k = Math.abs(seed) % 3;
    ctx.fillStyle = brickPattern(ctx, 'barry-roof-' + k, 16, 8, [['#3B2A2A', '#43302F'], ['#2E3440', '#343B48'], ['#44342A', '#4C3B30']][k] as [string, string], ['#2C1F1F', '#232832', '#33271F'][k]);
    ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, bottom - r.y1);
    // (the courses lit a little under the roof's edge, going dark down toward the street)
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 24);
    checker(ctx, r.x1, r.y1 + 200, r.x2 - r.x1, 60, 'rgba(0, 0, 0, 0.18)');
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(r.x1, r.y1 + 260, r.x2 - r.x1, bottom - r.y1 - 260);
    const out = blackout(state.frame, (r.x1 + r.x2) / 2) > 0.5;
    for (let y = r.y1 + 40; y < bottom; y += 60) for (let x = r.x1 + 24; x < r.x2 - 40; x += 70) {
      const lit = !out && hash(x * 0.3 + y) < 0.5;
      ctx.fillStyle = lit ? '#FCD34D' : '#0F141F'; ctx.fillRect(x, y, 30, 36);
    }
  }
};

/** Every gap in the ground: a trench where the street's dug up, an alley between buildings on the roofs. */
const drawGaps = (ctx: Ctx, state: GameState, place: string) => {
  const runs = state.groundRuns;
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  for (let i = 0; i + 1 < runs.length; i++) {
    const a = runs[i], b = runs[i + 1];
    if (b.x1 <= a.x2 + 1 || !visible(state, a.x2, b.x1) || placeOf(a.x2) !== place) continue;
    const x1 = a.x2, x2 = b.x1, top = Math.max(a.y2, b.y1);
    if (place === 'streets') {
      // Dug up: packed dirt walls, a burst pipe, a puddle at the bottom, the dark
      ctx.fillStyle = '#050403'; ctx.fillRect(x1, top, x2 - x1, bottom - top);
      bandedGradient(ctx, x1, top, x2 - x1, 260, ['#4A3728', '#35271B', '#1F1712', '#110C08', '#050403'], 10);
      ctx.fillStyle = '#6B4F3A'; ctx.fillRect(x1, top, 10, 200); ctx.fillRect(x2 - 10, top, 10, 200);
      ctx.fillStyle = '#57534E'; ctx.fillRect(x1, top + 70, x2 - x1, 12); // a pipe across it
      ctx.fillStyle = 'rgba(96, 165, 250, 0.5)'; for (let k = 0; k < 3; k++) ctx.fillRect(x1 + 30 + k * 30, top + 82 + ((state.frame * 3 + k * 17) % 120), 2, 6); // dripping
      ctx.fillStyle = 'rgba(14, 116, 144, 0.25)'; ctx.fillRect(x1 + 10, top + 240, x2 - x1 - 20, 8);
    } else {
      // An alley: brick walls down into the dark, a fire escape on one, a lit window far down
      ctx.fillStyle = '#16181F'; ctx.fillRect(x1, top, x2 - x1, bottom - top);
      ctx.fillStyle = '#23262F'; ctx.fillRect(x1, top, 18, bottom - top); ctx.fillStyle = '#0C0D12'; ctx.fillRect(x2 - 18, top, 18, bottom - top);
      ctx.strokeStyle = '#07080B'; ctx.lineWidth = 2; for (let y = top + 60; y < bottom; y += 80) { ctx.strokeRect(x1 + 20, y, 50, 14); ctx.beginPath(); ctx.moveTo(x1 + 30, y + 14); ctx.lineTo(x1 + 60, y + 70); ctx.stroke(); }
      ctx.fillStyle = 'rgba(252, 211, 77, 0.35)'; ctx.fillRect(x2 - 50, top + 330, 16, 20);
    }
  }
};

/** A roof: tar and gravel, a parapet lip, vents. */
const drawRoof = (ctx: Ctx, state: GameState, x1: number, x2: number, y: number) => {
  ctx.fillStyle = '#27272A'; ctx.fillRect(x1, y, x2 - x1, 16);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(x1, y, x2 - x1, 3);
  ctx.fillStyle = '#52525B'; for (let x = x1 + 7; x < x2; x += 19) ctx.fillRect(x, y + 5 + (x % 3), 2, 2);
  ctx.fillStyle = '#18181B'; ctx.fillRect(x1 - 4, y - 8, 8, 24); ctx.fillRect(x2 - 4, y - 8, 8, 24); // the parapet at each end
  void state;
};

/** The old walk-up: brick all the way up, windows (lit behind, a tenant in some), its fire escape, the door at the top. */
const drawWalkUp = (ctx: Ctx, state: GameState) => {
  const c = COURSE.climb;
  if (!visible(state, c.x1 - 100, c.x2 + 100)) return;
  // The two walk-ups: brick all the way up to their cornices (the second one taller, older, darker)
  c.buildings.forEach((b, i) => {
    if (!visible(state, b.x1 - 100, b.x2 + 100)) return;
    // (its front runs up to the roof and stops: the parapet along the top, the roof over it, sky above)
    const top = b.top;
    // (the second one's the swanky one: pale limestone, gold on the cornice and between the floors)
    // (down to the roof of the lower building in front, that it rises up out of the back of)
    const base = b.base;
    ctx.fillStyle = i ? brickPattern(ctx, 'barry-limestone', 48, 24, ['#C8BBA0', '#C2B498'], '#A89B80') : brickPattern(ctx, 'barry-brick', 18, 9, ['#6B2E22', '#742F24'], '#4E2119');
    ctx.fillRect(b.x1 - 60, top, b.x2 - b.x1 + 120, base - top);
    // (soot and shadow up the wall between the windows, the whole face darker toward its edges)
    checker(ctx, b.x1 - 60, top, 40, base - top, 'rgba(0, 0, 0, 0.16)');
    checker(ctx, b.x2 + 20, top, 40, base - top, 'rgba(0, 0, 0, 0.16)', 1);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(b.x1 - 60, top, 14, base - top); ctx.fillRect(b.x2 + 46, top, 14, base - top);
    if (i) { ctx.fillStyle = '#B8860B'; for (let y = top + 120; y < base; y += 240) ctx.fillRect(b.x1 - 60, y, b.x2 - b.x1 + 120, 4); }
    // The cornice at the roof line, and the parapet wall standing up along the roof's edge
    ctx.fillStyle = i ? '#8B6914' : '#3F1B14'; ctx.fillRect(b.x1 - 70, top, b.x2 - b.x1 + 140, 16);
    ctx.fillStyle = i ? '#A8A29E' : '#57261C'; ctx.fillRect(b.x1 - 64, top - 22, b.x2 - b.x1 + 128, 22);
    ctx.fillStyle = i ? '#D6D3D1' : '#7C3A2B'; ctx.fillRect(b.x1 - 66, top - 26, b.x2 - b.x1 + 132, 5);
    // Up on the roof: a water tank on legs, a vent stack, an antenna
    const wx = b.x1 + 60;
    ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx + 8, top - 22); ctx.lineTo(wx + 12, top - 60); ctx.moveTo(wx + 52, top - 22); ctx.lineTo(wx + 48, top - 60); ctx.stroke();
    ctx.fillStyle = '#6B4423'; ctx.fillRect(wx, top - 130, 60, 72); ctx.fillStyle = '#4A2F18'; for (let y = top - 122; y < top - 58; y += 16) ctx.fillRect(wx, y, 60, 3);
    ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.moveTo(wx - 6, top - 130); ctx.lineTo(wx + 30, top - 160); ctx.lineTo(wx + 66, top - 130); ctx.fill();
    ctx.fillStyle = '#52525B'; ctx.fillRect(b.x2 - 70, top - 64, 22, 42); ctx.fillStyle = '#3F3F46'; ctx.fillRect(b.x2 - 74, top - 70, 30, 8);
    ctx.fillStyle = '#71717A'; ctx.fillRect(b.x2 - 30, top - 150, 3, 128); ctx.fillRect(b.x2 - 42, top - 130, 27, 2); ctx.fillRect(b.x2 - 38, top - 116, 19, 2);
    if (Math.floor(state.frame / 30) % 2) { ctx.fillStyle = '#EF4444'; ctx.fillRect(b.x2 - 31, top - 154, 5, 5); }
  });
  // The windows (the tenants lean out of these)
  for (const w of COURSE.windows) {
    if (w.y < state.camera.y - 100 || w.y > state.camera.y + CANVAS_HEIGHT + 100) continue;
    const lit = hash(w.v * 13) < 0.7 && blackoutAt(state.frame, w.x, w.y) < 0.5;
    ctx.fillStyle = '#1C1917'; ctx.fillRect(w.x - 4, w.y - 74, 68, 78);
    ctx.fillStyle = lit ? '#FDE68A' : '#111827'; ctx.fillRect(w.x, w.y - 70, 60, 70);
    ctx.fillStyle = lit ? 'rgba(146, 64, 14, 0.45)' : 'rgba(55, 65, 81, 0.6)'; ctx.fillRect(w.x, w.y - 70, 14, 70); ctx.fillRect(w.x + 46, w.y - 70, 14, 70); // curtains
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(w.x - 6, w.y, 72, 5); // the sill
    // (up the swanky one: a striped awning over it, a gold frame, a little planter on the sill)
    if (w.x >= COURSE.climb.buildings[1].x1) {
      ctx.strokeStyle = '#B8860B'; ctx.lineWidth = 2; ctx.strokeRect(w.x - 4, w.y - 74, 68, 78);
      for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#F5F5F4' : '#14532D'; ctx.fillRect(w.x - 8 + k * 13, w.y - 88, 13, 12); }
      ctx.fillStyle = '#57534E'; ctx.fillRect(w.x + 8, w.y - 6, 44, 6); ctx.fillStyle = '#16A34A'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(w.x + 14 + k * 11, w.y - 8, 5, 0, Math.PI * 2); ctx.fill(); }
    }
    // Whoever was in it, gone out of it: the glass bloodied (nobody else comes to it after)
    if (state.enemies.some(e => e.kind === 'tenant' && e.homeX === w.x + 10 && e.homeY === w.y - 44 && (e.aiState === 'fall' || e.aiState === 'splat'))) {
      ctx.fillStyle = 'rgba(127, 29, 29, 0.85)';
      for (let k = 0; k < 7; k++) { const bx = w.x + 6 + hash(w.v * 7 + k) * 44, by = w.y - 64 + hash(w.v * 11 + k) * 40; ctx.beginPath(); ctx.arc(bx, by, 4 + hash(k + w.v) * 7, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(bx - 1, by, 3, 10 + hash(k * 3 + w.v) * 20); }
      ctx.fillStyle = 'rgba(153, 27, 27, 0.9)'; ctx.fillRect(w.x - 6, w.y, 72, 5);
    }
  }
  drawPowerHouse(ctx, state, c.door, c.top);
};

/**
 * The power room, from outside, up on the roof: a corrugated steel shed with a concrete plinth, HIGH VOLTAGE plates
 * all over it, fat conduits coming up out of the roof into it, a transformer humming behind a chain-link fence beside
 * it, insulators on its roof with the lines running off to a pole, vents glowing and buzzing, a panel of blinking
 * lights, and the door with DANGER over it.
 */
const drawPowerHouse = (ctx: Ctx, state: GameState, door: number, roof: number) => {
  const f = state.frame, x1 = door - 170, x2 = door + 170, top = roof - 180;
  // The plinth, and the shed on it: ribbed steel
  ctx.fillStyle = '#57534E'; ctx.fillRect(x1 - 10, roof - 8, x2 - x1 + 20, 8);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(x1, top, x2 - x1, roof - 8 - top);
  ctx.fillStyle = '#4B5563'; for (let x = x1 + 4; x < x2; x += 10) ctx.fillRect(x, top, 3, roof - 8 - top);
  ctx.fillStyle = '#374151'; ctx.fillRect(x1 - 8, top - 10, x2 - x1 + 16, 12);
  // Conduits coming up out of the roof into its side, and a cable tray along the top
  ctx.fillStyle = '#9CA3AF';
  for (const [cx, w] of [[x1 - 40, 14], [x1 - 22, 10]] as [number, number][]) { ctx.fillRect(cx, top + 30, w, roof - top - 30); ctx.fillRect(cx, top + 30, x1 - cx, w); }
  ctx.fillStyle = '#1F2937'; ctx.fillRect(x1 - 50, top + 26, 60, 4);
  // Insulators on its roof, the lines off to a pole at the corner of the roof
  ctx.fillStyle = '#A16207';
  for (let k = 0; k < 3; k++) { const ix = x1 + 60 + k * 90; ctx.fillRect(ix - 2, top - 34, 4, 24); for (let d = 0; d < 3; d++) { ctx.beginPath(); ctx.ellipse(ix, top - 30 + d * 7, 7, 3, 0, 0, Math.PI * 2); ctx.fill(); } }
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) { const ix = x1 + 60 + k * 90; ctx.beginPath(); ctx.moveTo(ix, top - 34); ctx.quadraticCurveTo(x2 + 80, top - 20 + k * 4, x2 + 150, top - 90 + k * 8); ctx.stroke(); }
  ctx.fillStyle = '#44403C'; ctx.fillRect(x2 + 146, top - 110, 8, roof - top + 110); ctx.fillRect(x2 + 128, top - 96, 44, 5);
  // The transformer behind its fence, beside it (humming, a heat shimmer off it)
  const tx = x2 + 20;
  ctx.fillStyle = '#4B5563'; ctx.fillRect(tx, roof - 90, 90, 76); ctx.fillStyle = '#374151'; for (let k = 0; k < 6; k++) ctx.fillRect(tx + 6 + k * 14, roof - 86, 6, 68);
  ctx.fillStyle = '#A16207'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(tx + 20 + k * 25, roof - 96, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.55)'; ctx.lineWidth = 1;
  for (let x = tx - 6; x < tx + 104; x += 8) { ctx.beginPath(); ctx.moveTo(x, roof - 14); ctx.lineTo(x + 8, roof - 70); ctx.moveTo(x + 8, roof - 14); ctx.lineTo(x, roof - 70); ctx.stroke(); }
  ctx.fillStyle = '#6B7280'; ctx.fillRect(tx - 6, roof - 72, 110, 3);
  // HIGH VOLTAGE plates
  const plate = (px: number, py: number) => { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(px, py, 54, 30); ctx.fillStyle = '#DC2626'; ctx.fillRect(px, py, 54, 9); ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('DANGER', px + 27, py + 7); ctx.fillStyle = '#111827'; ctx.fillText('HIGH', px + 27, py + 18); ctx.fillText('VOLTAGE', px + 27, py + 26); ctx.textAlign = 'left'; };
  plate(x1 + 20, top + 30); plate(x2 - 74, top + 30); plate(tx + 18, roof - 60);
  // Vents up top, glowing and buzzing; a panel of lights blinking
  for (let k = 0; k < 2; k++) { const vx = x1 + 30 + k * 220; ctx.fillStyle = '#1F2937'; ctx.fillRect(vx, top + 80, 60, 26); ctx.fillStyle = `rgba(56, 189, 248, ${0.4 + 0.3 * Math.sin(f * 0.3 + k)})`; for (let y = top + 84; y < top + 104; y += 5) ctx.fillRect(vx + 4, y, 52, 2); }
  ctx.fillStyle = '#111827'; ctx.fillRect(x2 - 70, top + 118, 40, 30);
  for (let k = 0; k < 6; k++) { ctx.fillStyle = (Math.floor(f / 10) + k * 3) % 4 === 0 ? '#EF4444' : (Math.floor(f / 7) + k) % 3 === 0 ? '#22C55E' : '#3F3F46'; ctx.fillRect(x2 - 66 + (k % 3) * 12, top + 124 + Math.floor(k / 3) * 12, 6, 6); }
  // Now and then a spark off the lines
  if (f % 97 < 5) { ctx.fillStyle = '#FDE047'; for (let k = 0; k < 5; k++) ctx.fillRect(x1 + 150 + hash(f + k) * 30, top - 40 + hash(f * 2 + k) * 20, 3, 3); }
  // The door: steel, DANGER over it, the bolt on it
  const dx = door - 30, dy = roof;
  ctx.fillStyle = '#374151'; ctx.fillRect(dx, dy - 96, 60, 96);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(dx + 4, dy - 92, 52, 88); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(dx + 48, dy - 52, 6, 4);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(dx, dy - 108, 60, 12); ctx.fillStyle = '#111827'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('DANGER', door, dy - 99);
  ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.moveTo(door, dy - 80); ctx.lineTo(door - 8, dy - 64); ctx.lineTo(door + 1, dy - 66); ctx.lineTo(door - 4, dy - 52); ctx.lineTo(door + 9, dy - 70); ctx.lineTo(door, dy - 68); ctx.closePath(); ctx.fill();
  ctx.textAlign = 'left';
  // A caged bulb over it
  ctx.fillStyle = '#FEF3C7'; ctx.beginPath(); ctx.arc(door, dy - 118, 5, 0, Math.PI * 2); ctx.fill();
};

/** Barry's man, flat on his back in the street where the ride ended. */
const drawBoard = (ctx: Ctx, state: GameState, rt: BarryRuntime) => {
  const x = rt.surf ? rt.surf.x : Number(state.stageMemo.boardX || NaN);
  if (!(x > 0 || x < 0)) return;
  if (rt.surf?.phase === 'air') return;
  // What he left on the street skidding along it (it stays)
  const x0 = COURSE.landing.x1 + 40;
  for (let sx = x0; sx < x - 10; sx += 6) {
    const k = (sx - x0) / Math.max(1, x - x0), w = 6 + hash(sx) * 5;
    ctx.fillStyle = hash(sx * 3) < 0.5 ? 'rgba(127, 29, 29, 0.9)' : 'rgba(153, 27, 27, 0.85)';
    ctx.fillRect(sx, Y + 1, 7, 2 + (1 - k) * 2 + (hash(sx * 7) < 0.15 ? w : 0) * 0.4);
    if (hash(sx * 11) < 0.08) { ctx.beginPath(); ctx.ellipse(sx, Y + 3, w * 1.6, 2.5, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  // (and a pool where he stopped)
  if (!rt.surf) { ctx.fillStyle = 'rgba(127, 29, 29, 0.9)'; ctx.beginPath(); ctx.ellipse(x, Y + 3, 46, 5, 0, 0, Math.PI * 2); ctx.fill(); }
  drawMinionFlat(ctx, x, Y, state.frame);
  // Still riding it down the street, crouched low, arms out
  if (rt.surf?.phase === 'slide') {
    const p = state.player;
    const body = { ...p, pos: { x: -1e6, y: -1e6 }, hidden: false, isGrounded: true, vel: { x: 0, y: 0 }, facing: 1 as const, isCharging: false, isSliding: false, isUppercutting: false, isDivekicking: false, invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0 };
    ctx.save(); ctx.translate(x + 4, Y - 14 - p.height / 2); ctx.rotate(Math.sin(state.frame * 0.5) * 0.04); ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
    drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false, surf: true });
    ctx.restore();
  }
};

/** Barry's man lying flat (the surfboard): feet first, face up, a scorched jumpsuit. */
export const drawMinionFlat = (ctx: Ctx, x: number, y: number, f: number) => {
  const still = { kind: 'minion', pos: { x: 0, y: 0 }, width: 36, height: 62, vel: { x: 0, y: 0 }, facing: 1, homeX: 0, aiState: 'flat', aiTimer: 0, shootTimer: 0 } as unknown as Enemy;
  ctx.save(); ctx.translate(x, y - 6); ctx.rotate(-Math.PI / 2); ctx.filter = 'brightness(0.6) sepia(0.3)';
  drawBarryKind(ctx, still, f, undefined as unknown as GameState);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The props
// ---------------------------------------------------------------------------

const drawProp = (ctx: Ctx, state: GameState, pr: Prop) => {
  const f = state.frame;
  const { x, y } = pr;
  switch (pr.look) {
    case 'bodega': {
      ctx.fillStyle = '#1E3A8A'; ctx.fillRect(x, y - 190, 220, 34);
      ctx.fillStyle = '#FDE047'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.fillText('DELI', x + 12, y - 166); ctx.font = '6px "Press Start 2P"'; ctx.fillText('GROCERY - ATM - LOTTO - CAT', x + 70, y - 168);
      ctx.fillStyle = 'rgba(252, 211, 77, 0.4)'; ctx.fillRect(x + 10, y - 150, 140, 110);
      ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.ellipse(x + 60, y - 50, 12, 7, 0, 0, Math.PI * 2); ctx.fill(); // the bodega cat, in the window
      ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.arc(x + 70, y - 58, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#22C55E'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText(Math.floor(f / 30) % 2 ? 'OPEN' : '', x + 100, y - 120);
      break;
    }
    case 'newsstand':
      ctx.fillStyle = '#166534'; ctx.fillRect(x, y - 110, 120, 110);
      ctx.fillStyle = '#14532D'; ctx.fillRect(x - 6, y - 118, 132, 12);
      ctx.fillStyle = '#F8FAFC'; for (let k = 0; k < 6; k++) ctx.fillRect(x + 8 + k * 18, y - 90 + (k % 2) * 6, 14, 20);
      ctx.fillStyle = '#FDE047'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.fillText('NEWS', x + 44, y - 108);
      break;
    case 'barrier':
      // A striped sawhorse, a blinking light on it
      ctx.fillStyle = '#F97316'; ctx.fillRect(x - 20, y - 36, 40, 10);
      ctx.fillStyle = '#F8FAFC'; for (let k = 0; k < 4; k++) ctx.fillRect(x - 18 + k * 10, y - 36, 5, 10);
      ctx.strokeStyle = '#78350F'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 16, y); ctx.lineTo(x - 10, y - 30); ctx.moveTo(x + 16, y); ctx.lineTo(x + 10, y - 30); ctx.stroke();
      if (Math.floor(f / 20) % 2) { ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.arc(x, y - 42, 4, 0, Math.PI * 2); ctx.fill(); }
      break;
    case 'hydrant': drawHydrant(ctx, x, y); break;
    case 'hydrantspray':
      // (cracked open by the kids, the side nozzle gushing out across the street)
      drawHydrant(ctx, x, y, { open: true });
      for (let k = 0; k < 16; k++) {
        const t = ((f * 2 + k * 9) % 40) / 40;
        ctx.fillStyle = k % 3 ? 'rgba(147, 197, 253, 0.7)' : 'rgba(240, 249, 255, 0.85)';
        ctx.fillRect(Math.round(x + 15 + t * 130), Math.round(y - 19 - Math.sin(t * Math.PI) * 50 + t * 16), 4 - Math.floor(t * 2), 4 - Math.floor(t * 2));
      }
      ctx.fillStyle = 'rgba(147, 197, 253, 0.35)'; ctx.beginPath(); ctx.ellipse(x + 110, y + 1, 50, 3, 0, 0, Math.PI * 2); ctx.fill();
      break;
    case 'car': drawCar(ctx, x, y, pr.w ?? 150, pr.v ?? 0, false); break;
    case 'burningcar': drawCar(ctx, x, y, 150, 3, true); drawFlames(ctx, x + 20, y - 60, 110, f); break;
    case 'rubble': ctx.fillStyle = '#57534E'; for (let k = 0; k < 8; k++) ctx.fillRect(x + k * 18, y - 6 - (k % 3) * 8, 20, 10); break;
    case 'dumpster':
      ctx.fillStyle = '#166534'; ctx.fillRect(x, y - 66, pr.w ?? 110, 66);
      ctx.fillStyle = '#14532D'; ctx.fillRect(x - 4, y - 72, (pr.w ?? 110) + 8, 8);
      ctx.fillStyle = '#F8FAFC'; ctx.font = '6px "Press Start 2P"'; ctx.fillText('NO DUMPING', x + 14, y - 40);
      ctx.fillStyle = '#1F2937'; ctx.beginPath(); ctx.ellipse(x + 30, y - 76, 16, 8, 0, 0, Math.PI * 2); ctx.fill(); // a bag on top
      break;
    case 'scaffold': {
      // A sidewalk shed: green plywood walk on pipes, a lit bulb under it
      const w = pr.w ?? 300, h = pr.h ?? 190;
      ctx.fillStyle = '#166534'; ctx.fillRect(x, y - h, w, 14);
      ctx.fillStyle = '#9CA3AF'; for (let px = x + 6; px < x + w; px += 70) ctx.fillRect(px, y - h, 5, h);
      ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 2; for (let px = x + 6; px + 70 < x + w; px += 70) { ctx.beginPath(); ctx.moveTo(px, y - h + 14); ctx.lineTo(px + 70, y - h + 60); ctx.stroke(); }
      ctx.fillStyle = '#FDE047'; ctx.font = '5px "Press Start 2P"'; ctx.fillText('POST NO BILLS', x + 20, y - h + 10);
      break;
    }
    case 'phonebooth':
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x, y - 110, 44, 110);
      ctx.fillStyle = 'rgba(186, 230, 253, 0.3)'; ctx.fillRect(x + 4, y - 96, 36, 70);
      ctx.fillStyle = '#1D4ED8'; ctx.fillRect(x, y - 120, 44, 12); ctx.fillStyle = '#F8FAFC'; ctx.font = '5px "Press Start 2P"'; ctx.fillText('PHONE', x + 6, y - 112);
      break;
    case 'skyscraper': {
      // The skyscraper's base: black glass, a revolving door, a canopy with its address
      ctx.fillStyle = '#0B1220'; ctx.fillRect(x - 40, y - 560, 420, 560);
      ctx.fillStyle = 'rgba(96, 165, 250, 0.18)'; for (let yy = y - 540; yy < y - 160; yy += 40) for (let xx = x - 30; xx < x + 370; xx += 50) ctx.fillRect(xx, yy, 44, 34);
      ctx.fillStyle = '#1F2937'; ctx.fillRect(x - 10, y - 190, 260, 20);
      ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillText('1 BARRY PLAZA', x + 40, y - 176);
      ctx.fillStyle = 'rgba(191, 219, 254, 0.5)'; ctx.fillRect(x + 50, y - 150, 100, 150);
      const sp = (f * 0.05) % 1;
      ctx.fillStyle = '#94A3B8'; for (let k = 0; k < 3; k++) { const a = sp * Math.PI * 2 + k * 2.1; ctx.fillRect(x + 100 + Math.cos(a) * 44 - 2, y - 150, 4, 150); } // the revolving door, going round
      ctx.fillStyle = '#FDE047'; ctx.fillRect(x + 90, y - 170, 20, 6);
      break;
    }
  }
};

const drawCar = (ctx: Ctx, x: number, y: number, w: number, v: number, wrecked: boolean) => {
  const body = wrecked ? '#292524' : ['#FACC15', '#1E293B', '#7F1D1D', '#E5E7EB'][v % 4];
  ctx.fillStyle = body; ctx.fillRect(x, y - 40, w, 28);
  ctx.beginPath(); ctx.moveTo(x + 30, y - 40); ctx.lineTo(x + 45, y - 64); ctx.lineTo(x + w - 45, y - 64); ctx.lineTo(x + w - 25, y - 40); ctx.fill();
  ctx.fillStyle = wrecked ? '#0C0A09' : 'rgba(30, 58, 95, 0.9)'; ctx.fillRect(x + 48, y - 60, 30, 18); ctx.fillRect(x + 82, y - 60, w - 130, 18);
  if (v % 4 === 0 && !wrecked) { ctx.fillStyle = '#111827'; for (let k = 0; k < w; k += 16) ctx.fillRect(x + k, y - 30, 8, 4); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + w / 2 - 12, y - 72, 24, 8); ctx.fillStyle = '#111827'; ctx.font = '5px "Press Start 2P"'; ctx.fillText('TAXI', x + w / 2 - 10, y - 66); } // a cab
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(x + 30, y - 10, 11, 0, Math.PI * 2); ctx.arc(x + w - 30, y - 10, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6B7280'; ctx.beginPath(); ctx.arc(x + 30, y - 10, 5, 0, Math.PI * 2); ctx.arc(x + w - 30, y - 10, 5, 0, Math.PI * 2); ctx.fill();
  if (!wrecked) { ctx.fillStyle = '#FEF08A'; ctx.fillRect(x + w - 4, y - 36, 4, 6); ctx.fillStyle = '#DC2626'; ctx.fillRect(x, y - 36, 4, 6); }
};

export const drawFlames = (ctx: Ctx, x: number, y: number, w: number, f: number) => {
  for (let k = 0; k < 7; k++) {
    const fx = x + (k * w) / 7, h = 30 + Math.sin(f * 0.4 + k * 1.7) * 14 + (k % 3) * 8;
    ctx.fillStyle = k % 2 ? 'rgba(249, 115, 22, 0.9)' : 'rgba(253, 224, 71, 0.85)';
    ctx.beginPath(); ctx.moveTo(fx - 10, y); ctx.quadraticCurveTo(fx, y - h, fx + 10, y); ctx.fill();
  }
  ctx.fillStyle = 'rgba(41, 37, 36, 0.5)'; for (let k = 0; k < 3; k++) { const t = ((f * 1.5 + k * 30) % 90) / 90; ctx.beginPath(); ctx.arc(x + w / 2 + Math.sin(k + f * 0.02) * 20, y - 40 - t * 120, 14 + t * 24, 0, Math.PI * 2); ctx.fill(); }
};

// ---------------------------------------------------------------------------
// Over the terrain: the ledges, the lamps, the steam
// ---------------------------------------------------------------------------

export const drawBarryMid = (ctx: Ctx, state: GameState) => {
  const place = placeOf(state.camera.x + CANVAS_WIDTH / 2);
  for (const l of COURSE.ledges) if (visible(state, l.x, l.x + l.w)) drawLedge(ctx, state, l);
  for (const l of COURSE.lamps) if (visible(state, l.x - 40, l.x + 40)) drawLamp(ctx, state, l.x, l.y, l.look, lampLevel(l, state.frame));
  if (place === 'roofs') drawClimbBlackout(ctx, state);
  for (const v of COURSE.vents) if (visible(state, v.x, v.x + v.w)) drawVent(ctx, state, v.x, v.w, ventState(v, state.frame));
  // (Barry's man and what he left on the street: over the street, so it's on it)
  if (place === 'landing') drawBoard(ctx, state, getBarry(state)!);
};

/**
 * Up the walk-ups the rolling blackout rolls up and down them, not along: a band of dark sweeping up the fronts of the
 * buildings, everything in it (the landings, the windows) all but gone. You climb into it, and out of it.
 */
const drawClimbBlackout = (ctx: Ctx, state: GameState) => {
  const c = COURSE.climb;
  if (!visible(state, c.x1 - 100, c.x2 + 100)) return;
  const strip = 12, x1 = c.x1 - 100, x2 = c.x2 + 100;
  for (let sy = state.camera.y - 20; sy < state.camera.y + CANVAS_HEIGHT + 20; sy += strip) {
    const b = blackoutUp(state.frame, sy);
    if (b <= 0.02) continue;
    ctx.fillStyle = `rgba(2, 3, 10, ${0.88 * b})`;
    ctx.fillRect(x1, sy, x2 - x1, strip + 1);
  }
};

const drawLedge = (ctx: Ctx, state: GameState, l: Ledge) => {
  const { x, y, w } = l;
  switch (l.look) {
    case 'stoop': {
      // Brownstone steps, an iron railing
      ctx.fillStyle = '#5A3B2B'; ctx.fillRect(x, y, w, Y - y);
      ctx.fillStyle = '#6B4A36'; ctx.fillRect(x, y, w, 5);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let yy = y + 14; yy < Y; yy += 14) ctx.fillRect(x, yy, w, 2);
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 4, y - 26); ctx.lineTo(x + w - 4, y - 26); ctx.stroke();
      for (let px = x + 6; px < x + w; px += 12) { ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y - 26); ctx.stroke(); }
      break;
    }
    case 'rooftop': break;
    case 'plank': ctx.fillStyle = '#A16207'; ctx.fillRect(x, y, w, 8); ctx.fillStyle = '#713F12'; ctx.fillRect(x, y + 6, w, 2); break;
    case 'escape': {
      // A fire escape landing: iron grating, a railing, the ladder up to the next one
      ctx.fillStyle = '#18181B'; ctx.fillRect(x, y, w, 6);
      ctx.strokeStyle = '#27272A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x + w, y - 30); ctx.stroke();
      for (let px = x; px <= x + w; px += 14) { ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y - 30); ctx.stroke(); }
      ctx.fillStyle = '#3F3F46'; for (let px = x + 3; px < x + w; px += 7) ctx.fillRect(px, y + 1, 3, 3);
      break;
    }
    case 'tank': {
      // A water tower: wooden barrel on legs, a cone roof
      ctx.fillStyle = '#6B4423'; ctx.fillRect(x, y - 90, w, 90);
      ctx.fillStyle = '#4A2F18'; for (let yy = y - 80; yy < y; yy += 20) ctx.fillRect(x, yy, w, 3);
      ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.moveTo(x - 6, y - 90); ctx.lineTo(x + w / 2, y - 130); ctx.lineTo(x + w + 6, y - 90); ctx.fill();
      ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 10, y); ctx.lineTo(x + 6, y + 130 - 8); ctx.moveTo(x + w - 10, y); ctx.lineTo(x + w - 6, y + 130 - 8); ctx.stroke();
      ctx.fillStyle = '#111827'; ctx.fillRect(x, y - 3, w, 6);
      break;
    }
    case 'ac': ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x, y, w, 50); ctx.fillStyle = '#6B7280'; for (let px = x + 6; px < x + w - 4; px += 8) ctx.fillRect(px, y + 8, 4, 34); ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.arc(x + w / 2, y + 25, 14, 0, Math.PI * 2); ctx.fill(); break;
    case 'counter': case 'desk': case 'cubicle': case 'shelf': case 'bench': case 'catwalk': drawRoomLedge(ctx, l); break;
    // (the car roofs, dumpsters and scaffolding are drawn with their props)
    default: break;
  }
  void state;
};

/** The indoor ones: a counter, a desk, a cubicle wall, a shelf, a bench, a catwalk. */
const drawRoomLedge = (ctx: Ctx, l: Ledge) => {
  const { x, y, w } = l;
  if (l.look === 'catwalk') {
    // A grated steel catwalk on brackets off the wall, a railing along it
    ctx.fillStyle = '#27272A'; ctx.fillRect(x, y, w, 6);
    ctx.fillStyle = '#52525B'; for (let px = x + 3; px < x + w; px += 6) ctx.fillRect(px, y + 1, 3, 3);
    ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + 8, y + 6); ctx.lineTo(x + 30, y + 40); ctx.moveTo(x + w - 8, y + 6); ctx.lineTo(x + w - 30, y + 40); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 24); ctx.lineTo(x + w, y - 24); ctx.moveTo(x, y - 12); ctx.lineTo(x + w, y - 12); ctx.stroke();
    for (let px = x; px <= x + w; px += 30) { ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y - 24); ctx.stroke(); }
    return;
  }
  if (l.look === 'bench') { ctx.fillStyle = '#78350F'; ctx.fillRect(x, y, w, 8); ctx.fillStyle = '#1C1917'; ctx.fillRect(x + 8, y + 8, 6, Y - y - 8); ctx.fillRect(x + w - 14, y + 8, 6, Y - y - 8); return; }
  // (the rest are drawn with their props: here just their top edge)
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x, y, w, 2);
};

const drawLamp = (ctx: Ctx, state: GameState, x: number, y: number, look: string, level: number) => {
  const on = level > 0.05;
  if (look === 'street') {
    // A cobra-head street lamp on its pole
    ctx.fillStyle = '#1F2937'; ctx.fillRect(x + 36, y, 6, Y - y);
    ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 39, y + 4); ctx.quadraticCurveTo(x + 38, y - 16, x + 6, y - 6); ctx.stroke();
    ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.ellipse(x, y - 4, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = on ? `rgba(255, 236, 179, ${0.5 + level * 0.5})` : '#44403C'; ctx.beginPath(); ctx.ellipse(x, y + 1, 12, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  } else if (look === 'sign') {
    ctx.fillStyle = '#111827'; ctx.fillRect(x - 36, y - 14, 72, 26);
    ctx.fillStyle = on ? '#F472B6' : '#4B1D36'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(x % 2 ? 'OPEN 24' : 'XXX', x, y + 3); ctx.textAlign = 'left';
  } else if (look === 'bulb') {
    ctx.strokeStyle = '#111827'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 12); ctx.stroke();
    ctx.fillStyle = on ? '#FEF3C7' : '#44403C'; ctx.beginPath(); ctx.arc(x, y + 16, 5, 0, Math.PI * 2); ctx.fill();
  } else if (look === 'tube') {
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x - 40, y, 80, 5);
    ctx.fillStyle = on ? '#F0F9FF' : '#52525B'; ctx.fillRect(x - 36, y + 5, 72, 3);
  } else {
    ctx.fillStyle = '#18181B'; ctx.fillRect(x - 2, y, 4, 40);
    ctx.fillStyle = on ? '#EF4444' : '#450A0A'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  }
  void state;
};

/** A subway grate: steel bars; hissing wisps when it's about to go, a column of steam when it does. */
const drawVent = (ctx: Ctx, state: GameState, x: number, w: number, st: string) => {
  const f = state.frame;
  ctx.fillStyle = '#1F2937'; ctx.fillRect(x, Y - 3, w, 5);
  ctx.fillStyle = '#6B7280'; for (let px = x + 3; px < x + w; px += 9) ctx.fillRect(px, Y - 3, 3, 5);
  if (st === 'warn') {
    ctx.fillStyle = 'rgba(226, 232, 240, 0.35)';
    for (let k = 0; k < 4; k++) { const t = ((f * 2 + k * 11) % 30) / 30; ctx.beginPath(); ctx.arc(x + 12 + k * (w - 24) / 3, Y - 6 - t * 30, 4 + t * 6, 0, Math.PI * 2); ctx.fill(); }
  } else if (st === 'blast') {
    const g = ctx.createLinearGradient(0, Y, 0, Y - 300);
    g.addColorStop(0, 'rgba(241, 245, 249, 0.85)'); g.addColorStop(1, 'rgba(241, 245, 249, 0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, Y); ctx.lineTo(x + w, Y); ctx.lineTo(x + w + 40, Y - 300); ctx.lineTo(x - 40, Y - 300); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(248, 250, 252, 0.5)';
    for (let k = 0; k < 8; k++) { const t = ((f * 5 + k * 13) % 60) / 60; ctx.beginPath(); ctx.arc(x + w / 2 + Math.sin(k * 2 + f * 0.2) * (10 + t * 40), Y - t * 280, 10 + t * 20, 0, Math.PI * 2); ctx.fill(); }
  }
};

// ---------------------------------------------------------------------------
// In front: what everyone's saying
// ---------------------------------------------------------------------------

export const drawBarryFront = (ctx: Ctx, state: GameState) => {
  const rt = getBarry(state)!;
  const place = placeOf(state.camera.x + CANVAS_WIDTH / 2);
  if (roomOf(place)) drawRoomFront(ctx, state, rt, place);
  if (place === 'power') drawSurge(ctx, state, rt.power);
  // A tenant leaning out of the window he's stood right in front of: out over him, not hidden behind him (dimmed like
  // the rest if the blackout's on it)
  const p = state.player;
  for (const e of state.enemies) {
    if (e.kind !== 'tenant' || (e.aiState !== 'lean' && e.aiState !== 'throw') || e.health <= 0) continue;
    if (e.pos.x + e.width < p.pos.x || e.pos.x > p.pos.x + p.width || e.pos.y + e.height < p.pos.y || e.pos.y > p.pos.y + p.height) continue;
    ctx.save();
    if (blackoutAt(state.frame, e.pos.x, e.pos.y) > 0.5) ctx.filter = 'brightness(0.35)';
    drawKindEnemy(ctx, e, state);
    ctx.restore();
  }
  for (const e of state.enemies) {
    const b = barkOf(rt, e);
    if (b) drawBubble(ctx, e.pos.x + e.width / 2, e.pos.y - 14, b.text, '#F8FAFC');
  }
  const m = rt.power.minion;
  const mt = saying(rt.talk, 'minion');
  if (m && mt && state.enemies.includes(m)) drawBubble(ctx, m.pos.x + m.width / 2, m.pos.y - 16, mt, '#FEF9C3');
};

// ---------------------------------------------------------------------------
// Screen space
// ---------------------------------------------------------------------------

export const drawBarryHud = (ctx: Ctx, state: GameState) => {
  const rt = getBarry(state)!;
  drawBarryScreenHud(ctx, state, rt);
  drawSurgeFlash(ctx, state, rt.power, CANVAS_WIDTH, CANVAS_HEIGHT);
  // Down the alley into the dumpster: the scene, over everything while it plays
  if (rt.dumpster && state.deathTimer > 0) drawDumpster(ctx, rt.dumpster);
};

/** Over the lot: the weather outside, then the fades, the elevator, the white-out, the ride down. */
export const drawBarryWeather = (ctx: Ctx, state: GameState) => {
  const rt = getBarry(state)!;
  const place = placeOf(state.camera.x + CANVAS_WIDTH / 2);
  if (!roomOf(place) && !rt.surf) drawBackdropFront(ctx, 'Blackout Barry', state.camera.x, state.camera.y, state.frame || 0);
  drawBarryOverlays(ctx, state, rt);
  return true;
};
