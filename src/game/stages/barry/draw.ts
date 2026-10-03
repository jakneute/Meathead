// Drawing Barry's stage: the night skyline (the backdrop, burning at the end), the
// mean streets (brownstones and storefronts, the trenches where the street's dug
// up, stoops, parked cars, scaffolding, the steam grates), the rooftops (tar and
// parapets, the alleys between, water towers, the walk-up with its fire escapes
// and its tenants' windows), the street at the end. The skyscraper's floors and
// the power room are in rooms.ts; the lighting, the elevator, the fades and the
// ride down in hud.ts.

import { drawDumpster } from './dumpster';
import { drawHydrant } from '../../render/props/hydrant';
import { drawFire } from '../../render/fx/fire';
import { brickPattern, checker, bandedGradient, hazeBands, pixelBlob, steppedGlow, tilePattern } from '../../render/pixelArt';
import { INK, dark, lite, ink, shaded } from '../../render/npc/kit';
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
import { drawRooms, drawRoomFront, slab, column, pipe, letter } from './rooms';
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
    for (let i = 0; i < 4; i++) { const t = ((f * 0.6 + i * 45 + id * 30) % 180 + 180) % 180 / 180, r = 20 + t * 50; pixelBlob(ctx, bx + 45 + Math.sin(t * 4 + id) * 20, top - t * 260, r, r, `rgba(20, 16, 14, ${(0.55 * (1 - t)).toFixed(3)})`); }
  }
  // A blast going up somewhere out there now and then
  const bt = f % 150;
  if (bt < 20) { const ex = 100 + hash(Math.floor(f / 150)) * 600, k = 1 - bt / 20; steppedGlow(ctx, ex, 330, 20 + bt * 5, '#FED7AA', k, k * 0.25, 4); steppedGlow(ctx, ex, 330, (20 + bt * 5) * 0.4, '#FFFBEB', k, k * 0.5, 2); }
  // A helicopter, its searchlight sweeping the smoke
  const hx = ((f * 1.1) % (CANVAS_WIDTH + 300)) - 150, hy = 110 + Math.sin(f * 0.02) * 10;
  const sweep = Math.sin(f * 0.03) * 0.5;
  ctx.fillStyle = 'rgba(254, 249, 195, 0.12)'; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - 60 + sweep * 300, 470); ctx.lineTo(hx + 60 + sweep * 300, 470); ctx.closePath(); ctx.fill();
  // (a silhouette against the glow: the body, its tail boom and fin, the skids, the rotor blurring)
  ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.ellipse(hx, hy, 18, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(hx - 40, hy - 2, 26, 3); ctx.fillRect(hx - 42, hy - 7, 3, 8);
  ctx.fillRect(hx - 12, hy + 9, 26, 2); ctx.fillRect(hx - 8, hy + 6, 2, 3); ctx.fillRect(hx + 8, hy + 6, 2, 3); ctx.fillRect(hx - 1, hy - 11, 3, 4);
  ctx.fillStyle = '#3B1F14'; ctx.fillRect(hx - 14, hy - 5, 20, 1); ctx.fillStyle = '#1E293B'; ctx.fillRect(hx + 6, hy - 4, 9, 5);
  ctx.fillStyle = '#0A0A0A'; ctx.fillRect(hx - 30, hy - 12, 60 * Math.abs(Math.sin(f * 1.3)), 2);
  if (f % 30 < 15) { ctx.fillStyle = '#EF4444'; ctx.fillRect(hx - 40, hy - 3, 3, 3); steppedGlow(ctx, hx - 38.5, hy - 1.5, 8, '#EF4444', 0.3, 0.05, 3); }
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
    const ti = Math.floor(hash(k + 3) * tones.length), tone = tones[ti];
    // (its face: brick in its own tone, every course shadowed under, darker where it meets the next one along)
    const face = () => {
      if (!burning) { ctx.rect(x, top, 262, h); return; }
      // Its top bitten off, jagged
      ctx.moveTo(x, Y); ctx.lineTo(x, top + hash(k + 5) * 40);
      for (let j = 1; j <= 8; j++) ctx.lineTo(x + j * 32.5, top + (j % 2 ? 30 + hash(k * 3 + j) * 70 : hash(k * 5 + j) * 30));
      ctx.lineTo(x + 262, Y); ctx.closePath();
    };
    ctx.save(); ctx.beginPath(); face(); ctx.clip();
    ctx.fillStyle = brickPattern(ctx, 'barry-front-' + ti, 16, 8, [tone, lite(tone, 0.05)], dark(tone, 0.35));
    ctx.fillRect(x, top - 10, 262, h + 10);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x, top, 262, 30);
    checker(ctx, x, top, 12, h, 'rgba(0, 0, 0, 0.2)'); checker(ctx, x + 250, top, 12, h, 'rgba(0, 0, 0, 0.2)', 1);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x + 252, top, 10, h);
    if (burning) { for (let j = 0; j < 3; j++) pixelBlob(ctx, x + 40 + j * 80, top + 90 + hash(k + j) * 120, 26, 40, 'rgba(0,0,0,0.35)'); } // scorch
    ctx.restore();
    if (burning) { ctx.beginPath(); face(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke(); }
    // A cornice: a moulded ledge, lit along its top, dentils under it (gone with the top, where it's been bitten off)
    if (!burning) {
      slab(ctx, x - 4, top, 270, 10, '#2A2420', 2);
      ctx.fillStyle = '#44403C'; ctx.fillRect(x - 2, top + 4, 266, 1);
      ctx.fillStyle = '#1C1917'; for (let d = x; d < x + 262; d += 8) ctx.fillRect(d, top + 10, 4, 3);
    }
    // Windows, some lit, a few flickering, a silhouette in one now and then; stone lintels over them, sills under
    for (let row = 0; row < 6; row++) for (let c = 0; c < 3; c++) {
      const wx = x + 28 + c * 78, wy = top + 30 + row * 56;
      if (wy > Y - 150) continue;
      const lit = hash(k * 31 + row * 7 + c) < (burning ? 0.2 : 0.45) && (hash(k * 5 + row + c + Math.floor(f / 90)) > 0.04);
      const glass = lit ? (burning ? '#F97316' : '#FCD34D') : '#111827';
      ctx.fillStyle = glass; ctx.fillRect(wx, wy, 34, 40);
      if (lit) {
        // (the lamp inside: brighter up top, the room's back wall darker under it)
        ctx.fillStyle = lite(glass, 0.35); ctx.fillRect(wx, wy, 34, 8);
        ctx.fillStyle = dark(glass, 0.18); ctx.fillRect(wx, wy + 30, 34, 10);
        ctx.fillStyle = dark(glass, 0.3); ctx.fillRect(wx + 26, wy + 8, 8, 32);
      } else {
        ctx.fillStyle = '#1E293B'; ctx.fillRect(wx + 3, wy + 3, 2, 8); ctx.fillRect(wx + 5, wy + 3, 4, 2);
      }
      if (lit && hash(k + row * 3 + c * 11) < 0.12) { ctx.fillStyle = 'rgba(17,24,39,0.8)'; ctx.fillRect(wx + 10, wy + 12, 12, 28); ctx.beginPath(); ctx.arc(wx + 16, wy + 12, 6, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(wx + 16, wy, 2, 40); ctx.fillRect(wx, wy + 19, 34, 2);
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(wx - 0.5, wy - 0.5, 35, 41);
      slab(ctx, wx - 3, wy - 6, 40, 6, '#78716C', 1);
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(wx + 15, wy - 5, 4, 4);
      slab(ctx, wx - 3, wy + 40, 40, 4, '#57534E', 1);
    }
    // A fire escape down the front of every other one: slatted landings, railings, the ladders between
    if (k % 2 === 0) {
      for (let row = 1; row < 5; row++) {
        const y = top + 26 + row * 56 + 44; if (y > Y - 160) break;
        fireEscape(ctx, x + 20, y, 120, 18);
        ladder(ctx, x + 30 + (row % 2) * 90, y, x + 70 + (row % 2) * 10, y + 38);
      }
    }
    // The shopfront at street level: a lit window, an awning, a sign
    const shop = Math.floor(hash(k + 9) * 5);
    slab(ctx, x + 20, Y - 130, 220, 130, '#0F172A', 2);
    ctx.fillStyle = '#1E293B'; ctx.fillRect(x + 24, Y - 128, 212, 4);
    // (the display window: what's in it on shelves, the glass's glare, inked)
    ctx.fillStyle = shop === 0 ? 'rgba(252, 211, 77, 0.35)' : shop === 1 ? 'rgba(96, 165, 250, 0.3)' : 'rgba(17,24,39,0.8)'; ctx.fillRect(x + 30, Y - 110, 120, 80);
    if (shop < 2) {
      ctx.fillStyle = shop === 0 ? 'rgba(254, 243, 199, 0.25)' : 'rgba(191, 219, 254, 0.25)'; ctx.fillRect(x + 30, Y - 110, 120, 14);
      for (let sh = 0; sh < 2; sh++) {
        const sy = Y - 82 + sh * 28;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)'; ctx.fillRect(x + 32, sy, 116, 2);
        for (let g = 0; g < 9; g++) { const gh = 6 + hash(k * 13 + g + sh * 9) * 10; ctx.fillStyle = ['#7C2D12', '#1E3A8A', '#14532D', '#7F1D1D'][(g + sh + k) & 3]; ctx.fillRect(x + 36 + g * 12, sy - gh, 8, gh); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x + 36 + g * 12, sy - gh, 2, gh); }
      }
    }
    ctx.fillStyle = shop < 2 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(x + 40, Y - 30); ctx.lineTo(x + 80, Y - 110); ctx.lineTo(x + 96, Y - 110); ctx.lineTo(x + 56, Y - 30); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 29.5, Y - 110.5, 121, 81);
    slab(ctx, x + 26, Y - 30, 128, 4, '#44403C', 1);
    if (shop < 3) {
      // (the awning: stripes, a scalloped valance, its shadow on the front under it; part of the building behind, so it's
      // dimmed back into it, no lit top edge to it: nothing anyone could stand on, unlike the stoops and cars in front)
      const aw = ['#B91C1C', '#1D4ED8', '#15803D'][shop];
      checker(ctx, x + 20, Y - 126, 220, 6, 'rgba(0, 0, 0, 0.35)');
      ctx.fillStyle = aw; ctx.fillRect(x + 16, Y - 150, 228, 24);
      ctx.fillStyle = lite(aw, 0.2); for (let s = 0; s < 228; s += 24) ctx.fillRect(x + 16 + s, Y - 150, 12, 24);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 16, Y - 133, 228, 7);
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 15.5, Y - 150.5, 229, 25);
      for (let s = 0; s < 228; s += 12) { ctx.fillStyle = (s / 12) % 2 ? '#F8FAFC' : dark(aw, 0.1); ctx.beginPath(); ctx.arc(x + 22 + s, Y - 126, 6, 0, Math.PI); ctx.fill(); ctx.strokeStyle = INK; ctx.stroke(); }
      ctx.fillStyle = 'rgba(10, 15, 30, 0.45)'; ctx.fillRect(x + 15, Y - 151, 230, 32);
    }
    // (the door: panels, a glass light in its top, a brass knob)
    const door = shop === 3 ? '#57534E' : '#1C1917';
    slab(ctx, x + 170, Y - 110, 50, 110, door, 2);
    ctx.fillStyle = shop === 0 || shop === 1 ? 'rgba(254, 243, 199, 0.35)' : '#0B0F17'; ctx.fillRect(x + 176, Y - 104, 38, 34);
    ctx.strokeStyle = INK; ctx.strokeRect(x + 175.5, Y - 104.5, 39, 35);
    ctx.fillStyle = dark(door, 0.3); ctx.fillRect(x + 176, Y - 62, 38, 1); ctx.fillRect(x + 176, Y - 62, 1, 54);
    ctx.fillStyle = lite(door, 0.15); ctx.fillRect(x + 177, Y - 9, 37, 1); ctx.fillRect(x + 213, Y - 61, 1, 52);
    ink(ctx, () => ctx.arc(x + 211, Y - 58, 2.5, 0, Math.PI * 2), '#CA8A04', 0.8);
    if (shop === 4) {
      // A roll-down gate, closed: the slats, each lit on its top, the bottom bar and its padlock
      for (let y = Y - 128; y < Y; y += 8) { ctx.fillStyle = '#44403C'; ctx.fillRect(x + 20, y, 220, 5); ctx.fillStyle = '#5E5955'; ctx.fillRect(x + 20, y, 220, 1); ctx.fillStyle = '#1C1917'; ctx.fillRect(x + 20, y + 5, 220, 1); }
      slab(ctx, x + 20, Y - 6, 220, 6, '#57534E', 1);
      ink(ctx, () => ctx.rect(x + 126, Y - 10, 8, 7), '#A8A29E', 0.8);
    }
    // At the end: the tops of half of them on fire, smoke going up off them, a glow in the windows
    if (burning && hash(k * 3 + 1) < 0.55) {
      drawFlames(ctx, x + 30, top, 200, f + k * 17);
      for (let i = 0; i < 4; i++) { const t = ((f * 0.8 + i * 40 + k * 11) % 160) / 160; pixelBlob(ctx, x + 130 + Math.sin(t * 5 + k) * 30, top - 40 - t * 260, 24 + t * 50, 24 + t * 50, 'rgba(28, 25, 23, 0.55)'); }
    }
    // Graffiti: a big piece across a closed gate, a smaller one along the wall under a window, tags on the doors
    const words = GRAFFITI[Math.floor(hash(k + 23) * GRAFFITI.length)];
    if (shop === 4) drawGraffiti(ctx, x + 40, Y - 44, words, 30, k + 101, 196);
    else if (hash(k + 17) < 0.5) drawGraffiti(ctx, x + 36, Y - 7, words, 15, k + 57, 128);
    if (hash(k + 29) < 0.45) drawTagOnly(ctx, x + 176, Y - 46, k + 7);
  }
};

/** A fire escape's landing (x .. x + w, its floor at y): slats, the railing round it (h high), balusters, inked iron. */
const fireEscape = (ctx: Ctx, x: number, y: number, w: number, h: number) => {
  ctx.fillStyle = INK; ctx.fillRect(x, y - 3, w, 4); ctx.fillRect(x, y - h, w, 3);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(x, y - 3, w, 1); ctx.fillRect(x, y - h, w, 1);
  ctx.fillStyle = '#18181B'; for (let bx = x; bx <= x + w; bx += 6) ctx.fillRect(bx, y - h + 3, 1, h - 6);
  ctx.fillStyle = INK; ctx.fillRect(x, y - h, 2, h); ctx.fillRect(x + w - 2, y - h, 2, h);
  ctx.fillStyle = '#52525B'; ctx.fillRect(x, y - h, 1, h);
};

/** A fire escape's ladder from (x0, y0) down to (x1, y1): two rails and the rungs between. */
const ladder = (ctx: Ctx, x0: number, y0: number, x1: number, y1: number) => {
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.moveTo(x0 + 6, y0); ctx.lineTo(x1 + 6, y1); ctx.stroke();
  ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 1;
  for (let t = 0.12; t < 1; t += 0.16) { const rx = x0 + (x1 - x0) * t, ry = y0 + (y1 - y0) * t; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + 6, ry); ctx.stroke(); }
};

/** What's sprayed on the walls. */
const GRAFFITI = ['BARRY SUX', 'NO LIGHT', '4EVA', 'CON ED = DEAD', 'LIGHTS OUT', 'KAOS', 'DARK CITY'];

/** A lot where a building's come down: a heap of rubble and rebar, a jagged stub of wall, fire in the heap, smoke. */
const drawCollapsedLot = (ctx: Ctx, x: number, f: number, k: number) => {
  // The wall stub: brick, broken off jagged, a window hole through it
  const stub = () => { ctx.moveTo(x + 10, Y); ctx.lineTo(x + 20, Y - 140 - hash(k) * 80); ctx.lineTo(x + 40, Y - 110); ctx.lineTo(x + 52, Y - 170 - hash(k + 1) * 60); ctx.lineTo(x + 70, Y - 90); ctx.lineTo(x + 70, Y); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); stub(); ctx.clip();
  ctx.fillStyle = brickPattern(ctx, 'barry-front-2', 16, 8, ['#3F3A3A', lite('#3F3A3A', 0.05)], dark('#3F3A3A', 0.35)); ctx.fillRect(x, Y - 240, 80, 240);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 10, Y - 240, 8, 240);
  checker(ctx, x + 56, Y - 240, 14, 240, 'rgba(0, 0, 0, 0.3)');
  ctx.restore();
  ctx.beginPath(); stub(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#111827'; ctx.fillRect(x + 26, Y - 120, 16, 20); ctx.strokeStyle = INK; ctx.strokeRect(x + 25.5, Y - 120.5, 17, 21); // a window hole in it
  ctx.fillStyle = '#F97316'; ctx.fillRect(x + 27, Y - 104, 14, 2);
  // The heap: broken masonry in bands (lit along its crest), chunks lying on it lit on their tops, rebar sticking out
  const heap = () => { ctx.moveTo(x, Y); ctx.quadraticCurveTo(x + 130, Y - 110, x + 262, Y); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); heap(); ctx.clip();
  bandedGradient(ctx, x, Y - 56, 262, 56, ['#78716C', '#57534E', '#3F3A37'], 5);
  checker(ctx, x, Y - 12, 262, 12, 'rgba(0, 0, 0, 0.25)');
  ctx.restore();
  ctx.beginPath(); heap(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  for (let j = 0; j < 12; j++) slab(ctx, Math.round(x + 30 + hash(k * 9 + j) * 200), Math.round(Y - 10 - hash(k * 11 + j) * 70), Math.round(12 + hash(j) * 14), 8, j % 3 ? '#78716C' : '#7C4A3A', 1);
  for (let j = 0; j < 5; j++) {
    const rx = x + 60 + j * 35;
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(rx, Y - 50); ctx.lineTo(rx + 10 - j * 4, Y - 90 - j * 6); ctx.stroke();
    ctx.strokeStyle = '#9A3412'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(rx, Y - 50); ctx.lineTo(rx + 10 - j * 4, Y - 90 - j * 6); ctx.stroke();
  } // rebar
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
    // (the courses lit a little under the roof's edge, going dark down toward the street; its corners in shadow)
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 24);
    checker(ctx, r.x1, r.y1 + 200, r.x2 - r.x1, 60, 'rgba(0, 0, 0, 0.18)');
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(r.x1, r.y1 + 260, r.x2 - r.x1, bottom - r.y1 - 260);
    checker(ctx, r.x2 - 12, r.y1, 12, bottom - r.y1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = INK; ctx.fillRect(r.x1, r.y1, 1, bottom - r.y1); ctx.fillRect(r.x2 - 1, r.y1, 1, bottom - r.y1);
    const out = blackout(state.frame, (r.x1 + r.x2) / 2) > 0.5;
    for (let y = r.y1 + 40; y < bottom; y += 60) for (let x = r.x1 + 24; x < r.x2 - 40; x += 70) {
      const lit = !out && hash(x * 0.3 + y) < 0.5;
      const glass = lit ? '#FCD34D' : '#0F141F';
      // (a lintel, the pane (lit up top, a sash across), a sill)
      ctx.fillStyle = glass; ctx.fillRect(x, y, 30, 36);
      if (lit) { ctx.fillStyle = '#FDE68A'; ctx.fillRect(x, y, 30, 7); ctx.fillStyle = '#D4A82F'; ctx.fillRect(x + 22, y + 7, 8, 29); }
      else { ctx.fillStyle = '#1E2533'; ctx.fillRect(x + 3, y + 3, 2, 6); }
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(x, y + 17, 30, 2);
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 0.5, y - 0.5, 31, 37);
      ctx.fillStyle = '#57534E'; ctx.fillRect(x - 3, y - 5, 36, 4); ctx.fillStyle = '#78716C'; ctx.fillRect(x - 3, y - 5, 36, 1);
      ctx.fillStyle = '#57534E'; ctx.fillRect(x - 3, y + 36, 36, 3); ctx.fillStyle = '#78716C'; ctx.fillRect(x - 3, y + 36, 36, 1);
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
      // Dug up: packed dirt in strata, timber shoring down each side, a burst pipe across it, a puddle at the bottom, the dark
      ctx.fillStyle = '#050403'; ctx.fillRect(x1, top, x2 - x1, bottom - top);
      bandedGradient(ctx, x1, top, x2 - x1, 260, ['#4A3728', '#35271B', '#1F1712', '#110C08', '#050403'], 10);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = top + 18; y < top + 200; y += 23) ctx.fillRect(x1, y, x2 - x1, 1);
      ctx.fillStyle = 'rgba(120, 113, 108, 0.35)'; for (let s = 0; s < 8; s++) ctx.fillRect(x1 + 14 + hash(x1 + s) * (x2 - x1 - 28), top + 10 + hash(x1 * 3 + s) * 150, 4, 3);
      column(ctx, x1, top, 10, 200, '#6B4F3A'); column(ctx, x2 - 10, top, 10, 200, '#6B4F3A');
      ctx.fillStyle = '#A8A29E'; for (let y = top + 20; y < top + 200; y += 60) { ctx.fillRect(x1 + 4, y, 2, 2); ctx.fillRect(x2 - 6, y, 2, 2); }
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(x1 + 10, top, 3, 200); ctx.fillRect(x2 - 13, top, 3, 200);
      pipe(ctx, x1, top + 70, x2 - x1, 12, '#57534E'); // a pipe across it
      slab(ctx, x1 + 22, top + 68, 6, 16, '#78716C', 1); slab(ctx, x2 - 28, top + 68, 6, 16, '#78716C', 1);
      ctx.fillStyle = INK; ctx.fillRect(x1 + 34, top + 80, 22, 2);
      ctx.fillStyle = 'rgba(96, 165, 250, 0.6)'; for (let k = 0; k < 3; k++) { const dy = top + 82 + ((state.frame * 3 + k * 17) % 120); ctx.fillRect(x1 + 30 + k * 30, dy, 2, 6); ctx.fillStyle = 'rgba(219, 234, 254, 0.8)'; ctx.fillRect(x1 + 30 + k * 30, dy, 1, 2); ctx.fillStyle = 'rgba(96, 165, 250, 0.6)'; } // dripping
      ctx.fillStyle = 'rgba(14, 116, 144, 0.3)'; ctx.fillRect(x1 + 10, top + 240, x2 - x1 - 20, 8);
      ctx.fillStyle = 'rgba(103, 232, 249, 0.3)'; ctx.fillRect(x1 + 16, top + 240, x2 - x1 - 32, 1); ctx.fillRect(x1 + 30, top + 243, 12, 1);
    } else {
      // An alley: brick walls down into the dark (the near one lit, the far in shadow), a fire escape on one, a lit window far down
      ctx.fillStyle = '#16181F'; ctx.fillRect(x1, top, x2 - x1, bottom - top);
      ctx.fillStyle = brickPattern(ctx, 'barry-alley', 12, 6, ['#1B1E26', '#1E212A'], '#121419'); ctx.fillRect(x1 + 18, top, x2 - x1 - 36, bottom - top);
      checker(ctx, x1 + 18, top + 60, x2 - x1 - 36, bottom - top - 60, 'rgba(0, 0, 0, 0.35)');
      ctx.fillStyle = '#23262F'; ctx.fillRect(x1, top, 18, bottom - top); ctx.fillStyle = '#2C303B'; ctx.fillRect(x1, top, 4, bottom - top);
      ctx.fillStyle = '#0C0D12'; ctx.fillRect(x2 - 18, top, 18, bottom - top);
      ctx.fillStyle = INK; ctx.fillRect(x1 + 18, top, 1, bottom - top); ctx.fillRect(x2 - 19, top, 1, bottom - top);
      for (let y = top + 60; y < bottom; y += 80) { fireEscape(ctx, x1 + 20, y + 14, 50, 14); ladder(ctx, x1 + 30, y + 14, x1 + 60, y + 70); }
      ctx.fillStyle = 'rgba(252, 211, 77, 0.35)'; ctx.fillRect(x2 - 50, top + 330, 16, 20);
      ctx.fillStyle = 'rgba(254, 243, 199, 0.3)'; ctx.fillRect(x2 - 50, top + 330, 16, 5);
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x2 - 50.5, top + 329.5, 17, 21);
    }
  }
};

/** A roof: tar and gravel, flashing along its lip, a parapet at each end. */
const drawRoof = (ctx: Ctx, state: GameState, x1: number, x2: number, y: number) => {
  ctx.fillStyle = '#27272A'; ctx.fillRect(x1, y, x2 - x1, 16);
  ctx.save(); ctx.translate(0, y);
  ctx.fillStyle = tilePattern(ctx, 'barryGravel', 19, 8, g => { g.fillStyle = '#27272A'; g.fillRect(0, 0, 19, 8); g.fillStyle = '#52525B'; g.fillRect(7, 5, 2, 2); g.fillRect(15, 3, 1, 1); g.fillStyle = '#3F3F46'; g.fillRect(2, 2, 2, 1); g.fillRect(11, 6, 1, 1); g.fillStyle = '#18181B'; g.fillRect(8, 7, 2, 1); });
  ctx.fillRect(x1, 4, x2 - x1, 12);
  ctx.restore();
  ctx.fillStyle = '#52525B'; ctx.fillRect(x1, y, x2 - x1, 3); ctx.fillStyle = '#71717A'; ctx.fillRect(x1, y, x2 - x1, 1);
  ctx.fillStyle = INK; ctx.fillRect(x1, y + 3, x2 - x1, 1);
  checker(ctx, x1, y + 12, x2 - x1, 4, 'rgba(0, 0, 0, 0.3)');
  slab(ctx, x1 - 4, y - 8, 8, 24, '#27272A', 1); slab(ctx, x2 - 4, y - 8, 8, 24, '#27272A', 1); // the parapet at each end
  ctx.fillStyle = '#52525B'; ctx.fillRect(x1 - 4, y - 8, 8, 2); ctx.fillRect(x2 - 4, y - 8, 8, 2);
  void state;
};

/** A wooden water tank on a steel stand: staves and hoops, the cone roof, its legs (the barrel x .. x + w, y .. y + h). */
const waterTank = (ctx: Ctx, x: number, y: number, w: number, h: number, roof: number, legsTo: number, inset: number) => {
  // (the legs and the cross-bracing between them)
  const lx0 = x + inset, lx1 = x + w - inset;
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx0, y + h); ctx.lineTo(lx1, legsTo); ctx.moveTo(lx1, y + h); ctx.lineTo(lx0, legsTo); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(lx0, y + h); ctx.lineTo(lx0 - 4, legsTo); ctx.moveTo(lx1, y + h); ctx.lineTo(lx1 + 4, legsTo); ctx.stroke();
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx0, y + h); ctx.lineTo(lx0 - 4, legsTo); ctx.moveTo(lx1, y + h); ctx.lineTo(lx1 + 4, legsTo); ctx.stroke();
  // (the barrel: staves, lit down the left, in shadow down the right; iron hoops round it)
  ctx.fillStyle = '#6B4423'; ctx.fillRect(x, y, w, h);
  for (let sx = x; sx < x + w; sx += 6) { ctx.fillStyle = hash(sx) < 0.5 ? '#74492A' : '#63401F'; ctx.fillRect(sx, y, 5, h); ctx.fillStyle = '#4A2F18'; ctx.fillRect(sx + 5, y, 1, h); }
  ctx.fillStyle = 'rgba(255, 237, 213, 0.18)'; ctx.fillRect(x, y, Math.round(w * 0.28), h);
  ctx.fillStyle = 'rgba(28, 10, 5, 0.3)'; ctx.fillRect(x + Math.round(w * 0.72), y, w - Math.round(w * 0.72), h);
  for (let hy = y + 8; hy < y + h; hy += 16) { ctx.fillStyle = '#1F1F23'; ctx.fillRect(x - 1, hy, w + 2, 3); ctx.fillStyle = '#52525B'; ctx.fillRect(x - 1, hy, w + 2, 1); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  // (the roof: a shingled cone, lit down its left slope, a finial)
  const cone = () => { ctx.moveTo(x - 6, y); ctx.lineTo(x + w / 2, y - roof); ctx.lineTo(x + w + 6, y); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); cone(); ctx.clip();
  ctx.fillStyle = '#374151'; ctx.fillRect(x - 6, y - roof, w + 12, roof);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(x - 6, y - roof, (w + 12) * 0.4, roof);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(x + w * 0.72, y - roof, w * 0.3 + 6, roof);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let ry = y - roof + 6; ry < y; ry += 6) ctx.fillRect(x - 6, ry, w + 12, 1);
  ctx.restore();
  ctx.beginPath(); cone(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
  ink(ctx, () => ctx.arc(x + w / 2, y - roof - 2, 2.5, 0, Math.PI * 2), '#6B7280', 0.8);
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
    ctx.fillStyle = INK; ctx.fillRect(b.x1 - 61, top, 1, base - top); ctx.fillRect(b.x2 + 60, top, 1, base - top);
    if (i) { for (let y = top + 120; y < base; y += 240) { ctx.fillStyle = '#B8860B'; ctx.fillRect(b.x1 - 60, y, b.x2 - b.x1 + 120, 4); ctx.fillStyle = '#E3B341'; ctx.fillRect(b.x1 - 60, y, b.x2 - b.x1 + 120, 1); ctx.fillStyle = '#7A5A08'; ctx.fillRect(b.x1 - 60, y + 4, b.x2 - b.x1 + 120, 1); } }
    // The cornice at the roof line (dentils under it), and the parapet wall standing up along the roof's edge, its coping
    const cw = b.x2 - b.x1 + 140;
    slab(ctx, b.x1 - 70, top, cw, 16, i ? '#8B6914' : '#3F1B14', 2);
    ctx.fillStyle = i ? '#6B500F' : '#2A120D'; for (let d = b.x1 - 66; d < b.x2 + 66; d += 10) ctx.fillRect(d, top + 9, 5, 5);
    ctx.fillStyle = i ? '#C9A227' : '#5A2A1E'; ctx.fillRect(b.x1 - 68, top + 3, cw - 4, 1);
    checker(ctx, b.x1 - 60, top + 16, b.x2 - b.x1 + 120, 6, 'rgba(0, 0, 0, 0.25)');
    slab(ctx, b.x1 - 64, top - 22, b.x2 - b.x1 + 128, 22, i ? '#A8A29E' : '#57261C', 2);
    if (!i) { ctx.fillStyle = '#4A2017'; for (let y = top - 16; y < top; y += 6) ctx.fillRect(b.x1 - 62, y, b.x2 - b.x1 + 124, 1); }
    slab(ctx, b.x1 - 66, top - 26, b.x2 - b.x1 + 132, 5, i ? '#D6D3D1' : '#7C3A2B', 1);
    // Up on the roof: a water tank on legs, a vent stack, an antenna
    const wx = b.x1 + 60;
    waterTank(ctx, wx, top - 130, 60, 72, 30, top - 22, 10);
    column(ctx, b.x2 - 70, top - 64, 22, 42, '#52525B');
    slab(ctx, b.x2 - 74, top - 70, 30, 8, '#3F3F46', 1);
    ctx.fillStyle = '#18181B'; ctx.fillRect(b.x2 - 70, top - 62, 22, 3);
    column(ctx, b.x2 - 31, top - 150, 4, 128, '#71717A');
    slab(ctx, b.x2 - 42, top - 131, 27, 3, '#71717A', 1); slab(ctx, b.x2 - 38, top - 117, 19, 3, '#71717A', 1);
    if (Math.floor(state.frame / 30) % 2) { ink(ctx, () => ctx.rect(b.x2 - 31, top - 154, 5, 5), '#EF4444', 0.8); ctx.fillStyle = '#FCA5A5'; ctx.fillRect(b.x2 - 30, top - 153, 2, 2); steppedGlow(ctx, b.x2 - 28.5, top - 151.5, 10, '#EF4444', 0.3, 0.05, 3); }
  });
  // The windows (the tenants lean out of these)
  for (const w of COURSE.windows) {
    if (w.y < state.camera.y - 100 || w.y > state.camera.y + CANVAS_HEIGHT + 100) continue;
    const lit = hash(w.v * 13) < 0.7 && blackoutAt(state.frame, w.x, w.y) < 0.5;
    const swanky = w.x >= COURSE.climb.buildings[1].x1;
    // (the frame and its lintel, the pane (lit up top), the curtains in folds, the sill)
    slab(ctx, w.x - 4, w.y - 74, 68, 78, swanky ? '#57534E' : '#1C1917', 2);
    ctx.fillStyle = lit ? '#FDE68A' : '#111827'; ctx.fillRect(w.x, w.y - 70, 60, 70);
    if (lit) { ctx.fillStyle = '#FEF3C7'; ctx.fillRect(w.x, w.y - 70, 60, 14); ctx.fillStyle = '#EBCB6A'; ctx.fillRect(w.x, w.y - 16, 60, 16); }
    else { ctx.fillStyle = '#1E293B'; ctx.fillRect(w.x + 18, w.y - 66, 3, 14); ctx.fillRect(w.x + 21, w.y - 66, 6, 3); }
    const cur = lit ? '#B45309' : '#374151';
    for (const cx of [w.x, w.x + 46]) {
      ctx.fillStyle = lit ? 'rgba(146, 64, 14, 0.55)' : 'rgba(55, 65, 81, 0.7)'; ctx.fillRect(cx, w.y - 70, 14, 70); // curtains
      ctx.fillStyle = lit ? 'rgba(120, 53, 15, 0.5)' : 'rgba(17, 24, 39, 0.5)'; for (let fx = cx + 3; fx < cx + 14; fx += 5) ctx.fillRect(fx, w.y - 70, 2, 70);
      ctx.fillStyle = lite(cur, 0.3); ctx.fillRect(cx + 1, w.y - 70, 1, 70);
    }
    ctx.fillStyle = INK; ctx.fillRect(w.x + 29, w.y - 70, 2, 70); ctx.fillRect(w.x, w.y - 36, 60, 2);
    ctx.fillStyle = lit ? '#FEF9C3' : '#334155'; ctx.fillRect(w.x + 29, w.y - 70, 1, 70);
    slab(ctx, w.x - 6, w.y, 72, 5, '#A8A29E', 1); // the sill
    slab(ctx, w.x - 8, w.y - 80, 76, 6, swanky ? '#C8BBA0' : '#78716C', 1); // the lintel
    // (up the swanky one: a striped awning over it, a gold frame, a little planter on the sill)
    if (swanky) {
      ctx.strokeStyle = '#B8860B'; ctx.lineWidth = 2; ctx.strokeRect(w.x - 4, w.y - 74, 68, 78);
      ctx.strokeStyle = '#E3B341'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(w.x - 4.5, w.y + 4); ctx.lineTo(w.x - 4.5, w.y - 74.5); ctx.lineTo(w.x + 64, w.y - 74.5); ctx.stroke();
      for (let k = 0; k < 6; k++) { const col = k % 2 ? '#F5F5F4' : '#14532D'; ctx.fillStyle = col; ctx.fillRect(w.x - 8 + k * 13, w.y - 88, 13, 12); ctx.fillStyle = lite(col, 0.2); ctx.fillRect(w.x - 8 + k * 13, w.y - 88, 13, 3); ctx.fillStyle = dark(col, 0.2); ctx.fillRect(w.x - 8 + k * 13, w.y - 79, 13, 3); }
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(w.x - 8.5, w.y - 88.5, 79, 13);
      for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#F5F5F4' : '#14532D'; ctx.beginPath(); ctx.arc(w.x - 1.5 + k * 13, w.y - 76, 6.5, 0, Math.PI); ctx.fill(); ctx.strokeStyle = INK; ctx.stroke(); }
      for (let k = 0; k < 4; k++) { ink(ctx, () => ctx.arc(w.x + 14 + k * 11, w.y - 8, 5, 0, Math.PI * 2), '#16A34A', 0.8); ctx.fillStyle = '#4ADE80'; ctx.fillRect(w.x + 11 + k * 11, w.y - 11, 3, 2); ctx.fillStyle = k % 2 ? '#F472B6' : '#FDE047'; ctx.fillRect(w.x + 15 + k * 11, w.y - 10, 2, 2); }
      slab(ctx, w.x + 8, w.y - 6, 44, 6, '#57534E', 1);
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
  // The plinth, and the shed on it: ribbed steel, lit down its left, in shadow down its right, its roof's overhang
  slab(ctx, x1 - 10, roof - 8, x2 - x1 + 20, 8, '#57534E', 1);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(x1, top, x2 - x1, roof - 8 - top);
  for (let x = x1 + 4; x < x2; x += 10) { ctx.fillStyle = '#4B5563'; ctx.fillRect(x, top, 3, roof - 8 - top); ctx.fillStyle = '#8B93A0'; ctx.fillRect(x - 2, top, 1, roof - 8 - top); }
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x1, top, 40, roof - 8 - top);
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x2 - 50, top, 50, roof - 8 - top);
  checker(ctx, x1, top + 2, x2 - x1, 10, 'rgba(0, 0, 0, 0.3)');
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x1 + 0.5, top + 0.5, x2 - x1 - 1, roof - 8 - top - 1);
  slab(ctx, x1 - 8, top - 10, x2 - x1 + 16, 12, '#374151', 2);
  // Conduits coming up out of the roof into its side, and a cable tray along the top
  for (const [cx, w] of [[x1 - 40, 14], [x1 - 22, 10]] as [number, number][]) {
    column(ctx, cx, top + 30 + w, w, roof - top - 30 - w, '#9CA3AF');
    pipe(ctx, cx, top + 30, x1 - cx, w, '#9CA3AF');
    slab(ctx, cx - 1, top + 30, w + 2, w + 2, '#9CA3AF', 1);
    slab(ctx, cx - 2, roof - 6, w + 4, 6, '#6B7280', 1);
  }
  slab(ctx, x1 - 50, top + 25, 60, 5, '#1F2937', 1);
  // Insulators on its roof (stacked glazed discs), the lines off to a pole at the corner of the roof
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) { const ix = x1 + 60 + k * 90; ctx.beginPath(); ctx.moveTo(ix, top - 34); ctx.quadraticCurveTo(x2 + 80, top - 20 + k * 4, x2 + 150, top - 90 + k * 8); ctx.stroke(); }
  for (let k = 0; k < 3; k++) {
    const ix = x1 + 60 + k * 90;
    column(ctx, ix - 2, top - 34, 4, 24, '#78716C');
    for (let d = 0; d < 3; d++) { ink(ctx, () => ctx.ellipse(ix, top - 30 + d * 7, 7, 3, 0, 0, Math.PI * 2), '#A16207', 0.8); ctx.fillStyle = '#EAB308'; ctx.fillRect(ix - 5, top - 32 + d * 7, 4, 1); }
  }
  column(ctx, x2 + 146, top - 110, 8, roof - top + 110, '#57432F');
  ctx.fillStyle = '#3F2F20'; for (let py = top - 100; py < roof; py += 30) ctx.fillRect(x2 + 148, py, 3, 1);
  slab(ctx, x2 + 128, top - 96, 44, 5, '#57432F', 1);
  for (const ix of [x2 + 134, x2 + 150, x2 + 166]) ink(ctx, () => ctx.rect(ix - 2, top - 101, 4, 5), '#A16207', 0.6);
  // The transformer behind its fence, beside it (humming): the tank, its cooling fins, the bushings on top
  const tx = x2 + 20;
  slab(ctx, tx, roof - 90, 90, 76, '#4B5563', 2);
  for (let k = 0; k < 6; k++) column(ctx, tx + 6 + k * 14, roof - 86, 6, 68, '#374151');
  for (let k = 0; k < 3; k++) { column(ctx, tx + 18 + k * 25, roof - 98, 4, 8, '#A16207'); ink(ctx, () => ctx.ellipse(tx + 20 + k * 25, roof - 96, 6, 4, 0, 0, Math.PI * 2), '#A16207', 0.8); ctx.fillStyle = '#EAB308'; ctx.fillRect(tx + 16 + k * 25, roof - 98, 4, 1); }
  // (the chain-link: posts, a top rail, the diamond mesh)
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.55)'; ctx.lineWidth = 1;
  for (let x = tx - 6; x < tx + 104; x += 8) { ctx.beginPath(); ctx.moveTo(x, roof - 14); ctx.lineTo(x + 8, roof - 70); ctx.moveTo(x + 8, roof - 14); ctx.lineTo(x, roof - 70); ctx.stroke(); }
  pipe(ctx, tx - 6, roof - 72, 110, 3, '#6B7280');
  for (const px of [tx - 6, tx + 48, tx + 102]) column(ctx, px - 1, roof - 72, 3, 58, '#6B7280');
  // HIGH VOLTAGE plates
  const plate = (px: number, py: number) => {
    slab(ctx, px, py, 54, 30, '#F8FAFC', 1);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(px + 1, py + 1, 52, 8); ctx.fillStyle = '#EF4444'; ctx.fillRect(px + 1, py + 1, 52, 1);
    letter(ctx, 'DANGER', px + 27, py + 7, 'bold 5px "Press Start 2P"', '#F8FAFC', '#7F1D1D');
    ctx.fillStyle = '#111827'; ctx.textAlign = 'center'; ctx.fillText('HIGH', px + 27, py + 18); ctx.fillText('VOLTAGE', px + 27, py + 26); ctx.textAlign = 'left';
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(px + 2, py + 11, 1, 1); ctx.fillRect(px + 51, py + 11, 1, 1); ctx.fillRect(px + 2, py + 27, 1, 1); ctx.fillRect(px + 51, py + 27, 1, 1);
  };
  plate(x1 + 20, top + 30); plate(x2 - 74, top + 30); plate(tx + 18, roof - 60);
  // Vents up top, glowing and buzzing; a panel of lights blinking
  for (let k = 0; k < 2; k++) {
    const vx = x1 + 30 + k * 220, a = 0.4 + 0.3 * Math.sin(f * 0.3 + k);
    slab(ctx, vx, top + 80, 60, 26, '#1F2937', 2);
    steppedGlow(ctx, vx + 30, top + 93, 30, '#38BDF8', a * 0.35, 0.02, 3);
    for (let y = top + 84; y < top + 104; y += 5) { ctx.fillStyle = `rgba(56, 189, 248, ${a})`; ctx.fillRect(vx + 4, y, 52, 2); ctx.fillStyle = `rgba(186, 230, 253, ${a})`; ctx.fillRect(vx + 4, y, 16, 1); }
  }
  slab(ctx, x2 - 70, top + 118, 40, 30, '#111827', 1);
  for (let k = 0; k < 6; k++) {
    const red = (Math.floor(f / 10) + k * 3) % 4 === 0, green = (Math.floor(f / 7) + k) % 3 === 0;
    const lx = x2 - 66 + (k % 3) * 12, ly = top + 124 + Math.floor(k / 3) * 12;
    ctx.fillStyle = INK; ctx.fillRect(lx - 1, ly - 1, 8, 8);
    ctx.fillStyle = red ? '#EF4444' : green ? '#22C55E' : '#3F3F46'; ctx.fillRect(lx, ly, 6, 6);
    if (red || green) { ctx.fillStyle = red ? '#FCA5A5' : '#86EFAC'; ctx.fillRect(lx, ly, 3, 3); }
  }
  // Now and then a spark off the lines
  if (f % 97 < 5) { for (let k = 0; k < 5; k++) { const sx = x1 + 150 + hash(f + k) * 30, sy = top - 40 + hash(f * 2 + k) * 20; ctx.fillStyle = '#FDE047'; ctx.fillRect(sx, sy, 3, 3); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(sx + 1, sy + 1, 1, 1); } }
  // The door: steel, DANGER over it, the bolt on it
  const dx = door - 30, dy = roof;
  slab(ctx, dx, dy - 96, 60, 96, '#374151', 2);
  slab(ctx, dx + 4, dy - 92, 52, 88, '#4B5563', 2);
  ctx.fillStyle = '#3F4A5A'; ctx.fillRect(dx + 10, dy - 84, 40, 24); ctx.fillRect(dx + 10, dy - 44, 40, 32);
  ctx.fillStyle = '#5B6678'; ctx.fillRect(dx + 10, dy - 61, 40, 1); ctx.fillRect(dx + 10, dy - 13, 40, 1);
  slab(ctx, dx + 46, dy - 54, 10, 8, '#9CA3AF', 1);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(dx + 3, dy - 84, 2, 8); ctx.fillRect(dx + 3, dy - 24, 2, 8);
  slab(ctx, dx, dy - 108, 60, 12, '#FACC15', 1);
  letter(ctx, 'DANGER', door, dy - 99, 'bold 7px "Press Start 2P"', '#111827', '#CA8A04');
  ink(ctx, () => { ctx.moveTo(door, dy - 80); ctx.lineTo(door - 8, dy - 64); ctx.lineTo(door + 1, dy - 66); ctx.lineTo(door - 4, dy - 52); ctx.lineTo(door + 9, dy - 70); ctx.lineTo(door, dy - 68); ctx.closePath(); }, '#FDE047', 0.8);
  // A caged bulb over it
  steppedGlow(ctx, door, dy - 118, 16, '#FEF3C7', 0.3, 0.04, 3);
  ink(ctx, () => ctx.arc(door, dy - 118, 5, 0, Math.PI * 2), '#FEF3C7', 0.8);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(door - 2, dy - 121, 2, 2);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(door - 5, dy - 118); ctx.lineTo(door + 5, dy - 118); ctx.moveTo(door, dy - 124); ctx.lineTo(door, dy - 113); ctx.stroke();
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
      // The deli: its sign board (DELI, what it sells), the window lit (stock on the shelves, the cat in it), OPEN blinking
      slab(ctx, x, y - 190, 220, 34, '#1E3A8A', 2);
      ctx.strokeStyle = '#60A5FA'; ctx.lineWidth = 1; ctx.strokeRect(x + 3.5, y - 186.5, 213, 27);
      ctx.font = 'bold 12px "Press Start 2P"'; ctx.fillStyle = '#713F12'; ctx.fillText('DELI', x + 13, y - 165); ctx.fillStyle = '#FDE047'; ctx.fillText('DELI', x + 12, y - 166);
      ctx.font = '6px "Press Start 2P"'; ctx.fillStyle = '#172554'; ctx.fillText('GROCERY - ATM - LOTTO - CAT', x + 71, y - 167); ctx.fillStyle = '#FDE047'; ctx.fillText('GROCERY - ATM - LOTTO - CAT', x + 70, y - 168);
      ctx.fillStyle = 'rgba(252, 211, 77, 0.4)'; ctx.fillRect(x + 10, y - 150, 140, 110);
      ctx.fillStyle = 'rgba(254, 243, 199, 0.25)'; ctx.fillRect(x + 10, y - 150, 140, 20);
      for (let sh = 0; sh < 3; sh++) {
        const sy = y - 124 + sh * 26;
        ctx.fillStyle = 'rgba(41, 37, 36, 0.7)'; ctx.fillRect(x + 12, sy, 136, 2);
        for (let g = 0; g < 11; g++) { if (sh === 2 && g > 3 && g < 8) continue; const gh = 8 + hash(x + g * 3 + sh) * 10; const col = ['#DC2626', '#2563EB', '#16A34A', '#F59E0B', '#F8FAFC'][(g + sh) % 5]; ctx.fillStyle = col; ctx.fillRect(x + 16 + g * 12, sy - gh, 9, gh); ctx.fillStyle = lite(col, 0.4); ctx.fillRect(x + 16 + g * 12, sy - gh, 2, gh); ctx.fillStyle = 'rgba(28, 25, 23, 0.6)'; ctx.fillRect(x + 24 + g * 12, sy - gh, 1, gh); }
      }
      // (the bodega cat, curled in the window: orange, striped, one eye open on you)
      shaded(ctx, () => ctx.ellipse(x + 60, y - 50, 12, 7, 0, 0, Math.PI * 2), '#F97316', x + 48, y - 57, 24, 14);
      ctx.fillStyle = '#C2410C'; ctx.fillRect(x + 54, y - 56, 2, 5); ctx.fillRect(x + 59, y - 57, 2, 6); ctx.fillRect(x + 64, y - 56, 2, 5);
      shaded(ctx, () => ctx.arc(x + 70, y - 58, 5, 0, Math.PI * 2), '#F97316', x + 65, y - 63, 10, 10);
      ink(ctx, () => { ctx.moveTo(x + 66, y - 61); ctx.lineTo(x + 67, y - 66); ctx.lineTo(x + 70, y - 62); ctx.closePath(); }, '#F97316', 0.8);
      ink(ctx, () => { ctx.moveTo(x + 71, y - 62); ctx.lineTo(x + 74, y - 66); ctx.lineTo(x + 75, y - 60); ctx.closePath(); }, '#F97316', 0.8);
      ctx.fillStyle = '#84CC16'; ctx.fillRect(x + 71, y - 59, 2, 2); ctx.fillStyle = INK; ctx.fillRect(x + 68, y - 58, 2, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.moveTo(x + 20, y - 40); ctx.lineTo(x + 70, y - 150); ctx.lineTo(x + 86, y - 150); ctx.lineTo(x + 36, y - 40); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 9.5, y - 150.5, 141, 111);
      if (Math.floor(f / 30) % 2) { steppedGlow(ctx, x + 114, y - 123, 20, '#22C55E', 0.3, 0.04, 3); ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillStyle = '#14532D'; ctx.fillText('OPEN', x + 101, y - 119); ctx.fillStyle = '#4ADE80'; ctx.fillText('OPEN', x + 100, y - 120); }
      break;
    }
    case 'newsstand':
      // A newsstand: a green kiosk, its overhang, the papers and the mags pinned up across it
      slab(ctx, x, y - 110, 120, 110, '#166534', 2);
      ctx.fillStyle = '#14532D'; for (let px = x + 4; px < x + 116; px += 8) ctx.fillRect(px, y - 34, 1, 32);
      slab(ctx, x + 2, y - 36, 116, 4, '#15803D', 1);
      for (let k = 0; k < 6; k++) {
        const mx = x + 8 + k * 18, my = y - 90 + (k % 2) * 6, col = ['#F8FAFC', '#FDE047', '#F8FAFC', '#F472B6', '#F8FAFC', '#60A5FA'][k];
        slab(ctx, mx, my, 14, 20, col, 1);
        ctx.fillStyle = k % 2 ? '#DC2626' : '#111827'; ctx.fillRect(mx + 2, my + 2, 10, 3);
        ctx.fillStyle = '#9CA3AF'; ctx.fillRect(mx + 2, my + 8, 10, 1); ctx.fillRect(mx + 2, my + 11, 8, 1); ctx.fillRect(mx + 2, my + 14, 10, 1);
        ctx.fillStyle = '#A8A29E'; ctx.fillRect(mx + 6, my - 1, 2, 2);
      }
      slab(ctx, x - 6, y - 118, 132, 12, '#14532D', 2);
      letter(ctx, 'NEWS', x + 56, y - 108, 'bold 6px "Press Start 2P"', '#FDE047', '#052E16');
      break;
    case 'barrier':
      // A striped sawhorse, a blinking light on it
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 16, y); ctx.lineTo(x - 10, y - 30); ctx.moveTo(x + 16, y); ctx.lineTo(x + 10, y - 30); ctx.stroke();
      ctx.strokeStyle = '#78350F'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 16, y); ctx.lineTo(x - 10, y - 30); ctx.moveTo(x + 16, y); ctx.lineTo(x + 10, y - 30); ctx.stroke();
      ctx.strokeStyle = '#A16207'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 17, y); ctx.lineTo(x - 11, y - 30); ctx.moveTo(x + 15, y); ctx.lineTo(x + 9, y - 30); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.rect(x - 20, y - 36, 40, 10); ctx.clip();
      ctx.fillStyle = '#F97316'; ctx.fillRect(x - 20, y - 36, 40, 10);
      ctx.fillStyle = '#F8FAFC'; for (let k = -1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x - 18 + k * 10, y - 26); ctx.lineTo(x - 13 + k * 10, y - 36); ctx.lineTo(x - 8 + k * 10, y - 36); ctx.lineTo(x - 13 + k * 10, y - 26); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - 20, y - 36, 40, 2); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x - 20, y - 28, 40, 2);
      ctx.restore();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 20.5, y - 36.5, 41, 11);
      column(ctx, x - 2, y - 40, 4, 4, '#1F2937');
      if (Math.floor(f / 20) % 2) { steppedGlow(ctx, x, y - 42, 12, '#FDE047', 0.35, 0.05, 3); ink(ctx, () => ctx.arc(x, y - 42, 4, 0, Math.PI * 2), '#FDE047', 0.8); ctx.fillStyle = '#FEF9C3'; ctx.fillRect(x - 2, y - 44, 2, 2); }
      else ink(ctx, () => ctx.arc(x, y - 42, 4, 0, Math.PI * 2), '#854D0E', 0.8);
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
      ctx.fillStyle = 'rgba(147, 197, 253, 0.35)'; ctx.fillRect(x + 60, y, 100, 3); ctx.fillRect(x + 72, y - 1, 76, 5);
      ctx.fillStyle = 'rgba(240, 249, 255, 0.5)'; ctx.fillRect(x + 90, y, 20, 1); ctx.fillRect(x + 124, y + 1, 10, 1);
      break;
    case 'car': drawCar(ctx, x, y, pr.w ?? 150, pr.v ?? 0, false); break;
    case 'burningcar': drawCar(ctx, x, y, 150, 3, true); drawFlames(ctx, x + 20, y - 60, 110, f); break;
    case 'rubble': for (let k = 0; k < 8; k++) slab(ctx, x + k * 18, y - 6 - (k % 3) * 8, 20, 10, k % 3 === 1 ? '#7C4A3A' : '#57534E', 1); break;
    case 'dumpster': {
      // A dumpster: steel, ribbed, its lid down, NO DUMPING stenciled on it, casters, a bag slung on top
      const w = pr.w ?? 110;
      slab(ctx, x, y - 66, w, 62, '#166534', 2);
      for (let rx = x + 14; rx < x + w - 8; rx += 24) column(ctx, rx, y - 62, 5, 56, '#15803D');
      ctx.fillStyle = 'rgba(120, 53, 15, 0.45)'; ctx.fillRect(x + 4, y - 14, 18, 8); ctx.fillRect(x + w - 30, y - 20, 10, 14);
      checker(ctx, x + 2, y - 14, w - 4, 10, 'rgba(0, 0, 0, 0.18)');
      slab(ctx, x + 10, y - 47, 90, 11, '#14532D', 1);
      ctx.fillStyle = '#F8FAFC'; ctx.font = '6px "Press Start 2P"'; ctx.fillText('NO DUMPING', x + 14, y - 40);
      for (const cx of [x + 10, x + w - 18]) { slab(ctx, cx, y - 5, 8, 3, '#374151', 1); ink(ctx, () => ctx.arc(cx + 4, y - 2, 2.5, 0, Math.PI * 2), '#1F2937', 0.8); }
      slab(ctx, x - 4, y - 72, w + 8, 8, '#14532D', 2);
      shaded(ctx, () => ctx.ellipse(x + 30, y - 76, 16, 8, 0, 0, Math.PI * 2), '#1F2937', x + 14, y - 84, 32, 16); // a bag on top
      ctx.fillStyle = '#4B5563'; ctx.fillRect(x + 22, y - 81, 6, 1); ctx.fillStyle = INK; ctx.fillRect(x + 30, y - 85, 2, 3);
      break;
    }
    case 'scaffold': {
      // A sidewalk shed: green plywood walk on pipes (clamped, braced), the bills on it anyway, a lit bulb under it
      const w = pr.w ?? 300, h = pr.h ?? 190;
      for (let px = x + 6; px < x + w; px += 70) column(ctx, px, y - h, 5, h, '#9CA3AF');
      ctx.strokeStyle = INK; ctx.lineWidth = 3; for (let px = x + 6; px + 70 < x + w; px += 70) { ctx.beginPath(); ctx.moveTo(px, y - h + 14); ctx.lineTo(px + 70, y - h + 60); ctx.stroke(); }
      ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 1.5; for (let px = x + 6; px + 70 < x + w; px += 70) { ctx.beginPath(); ctx.moveTo(px, y - h + 14); ctx.lineTo(px + 70, y - h + 60); ctx.stroke(); }
      slab(ctx, x, y - h, w, 14, '#166534', 2);
      ctx.fillStyle = '#14532D'; for (let px = x + 48; px < x + w; px += 48) ctx.fillRect(px, y - h + 2, 1, 10);
      for (let px = x + 6; px < x + w; px += 70) slab(ctx, px - 1, y - h + 13, 7, 4, '#D1D5DB', 1);
      ctx.fillStyle = '#FDE047'; ctx.font = '5px "Press Start 2P"'; ctx.fillText('POST NO BILLS', x + 20, y - h + 10);
      for (let b = 0; b < Math.floor(w / 120); b++) { const bx = x + 110 + b * 120; ink(ctx, () => ctx.rect(bx, y - h + 2, 22, 10), b % 2 ? '#F472B6' : '#F8FAFC', 0.6); ctx.fillStyle = '#111827'; ctx.fillRect(bx + 3, y - h + 5, 14, 1); ctx.fillRect(bx + 3, y - h + 8, 10, 1); }
      // (its deck up top, plainly something to stand on, unlike the shop awnings behind: bare boards, lit along the edge,
      // hazard tape along the lip, a kick rail)
      slab(ctx, x - 2, y - h - 5, w + 4, 6, '#C9A46B', 1);
      ctx.fillStyle = '#EBD3A3'; ctx.fillRect(x - 1, y - h - 5, w + 2, 1);
      ctx.fillStyle = '#8A6A3B'; for (let px = x + 30; px < x + w; px += 30) ctx.fillRect(px, y - h - 4, 1, 4);
      for (let px = x; px < x + w; px += 16) { ctx.fillStyle = '#FACC15'; ctx.fillRect(px, y - h + 1, 8, 2); ctx.fillStyle = '#111827'; ctx.fillRect(px + 8, y - h + 1, 8, 2); }
      break;
    }
    case 'phonebooth':
      // A phone booth: a steel frame, its glass (scratched, a glare across it), the phone inside, PHONE lit on top
      slab(ctx, x, y - 110, 44, 110, '#9CA3AF', 2);
      ctx.fillStyle = 'rgba(186, 230, 253, 0.3)'; ctx.fillRect(x + 4, y - 96, 36, 70);
      ctx.fillStyle = '#374151'; ctx.fillRect(x + 22, y - 78, 12, 20); ctx.fillStyle = '#111827'; ctx.fillRect(x + 24, y - 82, 8, 4); ctx.fillStyle = '#6B7280'; ctx.fillRect(x + 24, y - 72, 8, 8);
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 28, y - 58); ctx.quadraticCurveTo(x + 22, y - 48, x + 28, y - 42); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.moveTo(x + 6, y - 40); ctx.lineTo(x + 26, y - 96); ctx.lineTo(x + 32, y - 96); ctx.lineTo(x + 12, y - 40); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x + 10, y - 70, 6, 1); ctx.fillRect(x + 30, y - 50, 5, 1);
      ctx.strokeStyle = INK; ctx.strokeRect(x + 3.5, y - 96.5, 37, 71);
      ctx.fillStyle = '#6B7280'; ctx.fillRect(x + 4, y - 26, 36, 22); ctx.fillStyle = '#8B93A0'; ctx.fillRect(x + 4, y - 26, 36, 1);
      slab(ctx, x, y - 120, 44, 12, '#1D4ED8', 1);
      steppedGlow(ctx, x + 22, y - 114, 20, '#93C5FD', 0.2, 0.03, 3);
      letter(ctx, 'PHONE', x + 22, y - 111, '5px "Press Start 2P"', '#F8FAFC', '#1E3A8A');
      break;
    case 'skyscraper': {
      // The skyscraper's base: black glass in a steel grid (the night reflected in it), a canopy with its address, the revolving door
      ctx.fillStyle = '#0B1220'; ctx.fillRect(x - 40, y - 560, 420, 560);
      for (let yy = y - 540; yy < y - 160; yy += 40) for (let xx = x - 30; xx < x + 370; xx += 50) {
        ctx.fillStyle = 'rgba(96, 165, 250, 0.18)'; ctx.fillRect(xx, yy, 44, 34);
        ctx.fillStyle = 'rgba(147, 197, 253, 0.12)'; ctx.fillRect(xx, yy, 44, 6);
        ctx.fillStyle = 'rgba(191, 219, 254, 0.18)'; ctx.fillRect(xx + 4 + ((xx + yy) % 3) * 8, yy + 2, 2, 30);
        if (hash(xx * 0.1 + yy) < 0.08) { ctx.fillStyle = 'rgba(253, 224, 71, 0.5)'; ctx.fillRect(xx + 8, yy + 10, 28, 18); }
      }
      ctx.fillStyle = '#1E293B'; for (let xx = x - 36; xx < x + 376; xx += 50) ctx.fillRect(xx, y - 560, 6, 400);
      ctx.fillStyle = '#334155'; for (let xx = x - 36; xx < x + 376; xx += 50) ctx.fillRect(xx, y - 560, 1, 400);
      ctx.fillStyle = INK; ctx.fillRect(x - 41, y - 560, 1, 560); ctx.fillRect(x + 380, y - 560, 1, 560);
      // (the canopy: a steel slab, the address in brushed letters, its light down onto the door)
      slab(ctx, x - 10, y - 190, 260, 20, '#1F2937', 2);
      ctx.fillStyle = '#475569'; ctx.fillRect(x - 8, y - 188, 256, 1);
      letter(ctx, '1 BARRY PLAZA', x + 103, y - 176, 'bold 8px "Press Start 2P"', '#F8FAFC', '#0F172A');
      ctx.fillStyle = 'rgba(191, 219, 254, 0.5)'; ctx.fillRect(x + 50, y - 150, 100, 150);
      ctx.fillStyle = 'rgba(254, 243, 199, 0.18)'; ctx.fillRect(x + 50, y - 150, 100, 40);
      const sp = (f * 0.05) % 1;
      for (let k = 0; k < 3; k++) { const a = sp * Math.PI * 2 + k * 2.1; column(ctx, Math.round(x + 100 + Math.cos(a) * 44 - 2), y - 150, 4, 150, '#94A3B8'); } // the revolving door, going round
      slab(ctx, x + 46, y - 154, 108, 6, '#334155', 1);
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 49.5, y - 150.5, 101, 151);
      steppedGlow(ctx, x + 100, y - 167, 22, '#FDE047', 0.3, 0.04, 3);
      ink(ctx, () => ctx.rect(x + 90, y - 170, 20, 6), '#FDE047', 0.8); ctx.fillStyle = '#FEF9C3'; ctx.fillRect(x + 92, y - 169, 8, 1);
      break;
    }
  }
};

/** A parked car: its body in steps (lit along the top), the cabin, glass, chrome, the wheels; a cab (checks, the roof sign); a burned-out wreck. */
const drawCar = (ctx: Ctx, x: number, y: number, w: number, v: number, wrecked: boolean) => {
  const body = wrecked ? '#292524' : ['#FACC15', '#1E293B', '#7F1D1D', '#E5E7EB'][v % 4];
  // (the wheel arches, dark, behind)
  ctx.fillStyle = INK; for (const wx of [x + 30, x + w - 30]) { ctx.beginPath(); ctx.arc(wx, y - 12, 14, Math.PI, 0); ctx.fill(); }
  // The cabin: the roof lit, the pillars, the glass (the front and back panes, a glint across each)
  const cabin = () => { ctx.moveTo(x + 30, y - 40); ctx.lineTo(x + 45, y - 64); ctx.lineTo(x + w - 45, y - 64); ctx.lineTo(x + w - 25, y - 40); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); cabin(); ctx.clip();
  ctx.fillStyle = body; ctx.fillRect(x, y - 64, w, 24);
  ctx.fillStyle = lite(body, 0.3); ctx.fillRect(x, y - 64, w, 3);
  ctx.fillStyle = wrecked ? '#0C0A09' : '#1E3A5F'; ctx.fillRect(x + 48, y - 60, 30, 18); ctx.fillRect(x + 82, y - 60, w - 130, 18);
  if (!wrecked) {
    ctx.fillStyle = '#2D5285'; ctx.fillRect(x + 48, y - 60, 30, 5); ctx.fillRect(x + 82, y - 60, w - 130, 5);
    ctx.fillStyle = 'rgba(191, 219, 254, 0.55)'; for (const gx of [x + 54, x + 92]) { ctx.beginPath(); ctx.moveTo(gx, y - 42); ctx.lineTo(gx + 8, y - 60); ctx.lineTo(gx + 12, y - 60); ctx.lineTo(gx + 4, y - 42); ctx.fill(); }
  } else {
    // (blown out: shards round the frame)
    ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.moveTo(x + 48, y - 60); ctx.lineTo(x + 58, y - 60); ctx.lineTo(x + 50, y - 50); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + w - 48, y - 42); ctx.lineTo(x + w - 60, y - 42); ctx.lineTo(x + w - 50, y - 52); ctx.fill();
  }
  ctx.restore();
  ctx.beginPath(); cabin(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = INK; ctx.strokeRect(x + 47.5, y - 60.5, 31, 19); ctx.strokeRect(x + 81.5, y - 60.5, w - 129, 19);
  // The body: lit along its shoulder, a crease, the shadow along the rocker; the door seams, the handles
  const shell = () => ctx.roundRect(x, y - 40, w, 28, [6, 8, 3, 3]);
  ctx.save(); ctx.beginPath(); shell(); ctx.clip();
  ctx.fillStyle = body; ctx.fillRect(x, y - 40, w, 28);
  ctx.fillStyle = lite(body, 0.3); ctx.fillRect(x, y - 40, w, 4);
  ctx.fillStyle = lite(body, 0.55); ctx.fillRect(x + 8, y - 39, w - 30, 1);
  ctx.fillStyle = dark(body, 0.2); ctx.fillRect(x, y - 24, w, 12);
  ctx.fillStyle = dark(body, 0.4); ctx.fillRect(x, y - 16, w, 4);
  ctx.fillStyle = lite(body, 0.15); ctx.fillRect(x, y - 27, w, 1);
  if (wrecked) { checker(ctx, x, y - 40, w, 28, 'rgba(0, 0, 0, 0.35)'); ctx.fillStyle = '#7C2D12'; ctx.fillRect(x + 20, y - 30, 14, 6); ctx.fillRect(x + w - 50, y - 36, 10, 8); }
  ctx.restore();
  ctx.beginPath(); shell(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = dark(body, 0.5); ctx.fillRect(x + 80, y - 39, 1, 24); ctx.fillRect(x + w - 46, y - 39, 1, 24);
  if (!wrecked) { ctx.fillStyle = '#D1D5DB'; ctx.fillRect(x + 66, y - 33, 6, 2); ctx.fillRect(x + w - 60, y - 33, 6, 2); ctx.fillStyle = INK; ctx.fillRect(x + 66, y - 31, 6, 1); ctx.fillRect(x + w - 60, y - 31, 6, 1); }
  // (chrome bumpers)
  slab(ctx, x - 2, y - 20, 10, 5, wrecked ? '#44403C' : '#D1D5DB', 1); slab(ctx, x + w - 8, y - 20, 10, 5, wrecked ? '#44403C' : '#D1D5DB', 1);
  if (v % 4 === 0 && !wrecked) {
    // A cab: the checks along its flank, its roof light
    ctx.fillStyle = '#111827'; for (let k = 0; k < w; k += 16) ctx.fillRect(x + k, y - 30, 8, 4);
    ctx.fillStyle = INK; ctx.fillRect(x, y - 31, w, 1); ctx.fillRect(x, y - 26, w, 1);
    slab(ctx, x + w / 2 - 12, y - 72, 24, 8, '#F8FAFC', 1);
    ctx.fillStyle = '#111827'; ctx.font = '5px "Press Start 2P"'; ctx.fillText('TAXI', x + w / 2 - 10, y - 66);
  }
  // The wheels: the tire, a lit rim, the hubcap stepped, its nut
  for (const wx of [x + 30, x + w - 30]) {
    if (wrecked) { ink(ctx, () => ctx.ellipse(wx, y - 8, 12, 8, 0, 0, Math.PI * 2), '#1C1917'); ink(ctx, () => ctx.arc(wx, y - 9, 5, 0, Math.PI * 2), '#57534E', 0.8); ctx.fillStyle = '#7C2D12'; ctx.fillRect(wx - 2, y - 11, 3, 2); continue; }
    ink(ctx, () => ctx.arc(wx, y - 10, 11, 0, Math.PI * 2), '#111827');
    ctx.strokeStyle = '#374151'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(wx, y - 10, 9, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
    ink(ctx, () => ctx.arc(wx, y - 10, 5, 0, Math.PI * 2), '#9CA3AF', 0.8);
    ctx.fillStyle = '#E5E7EB'; ctx.fillRect(wx - 3, y - 13, 3, 2); ctx.fillStyle = '#6B7280'; ctx.fillRect(wx + 1, y - 8, 3, 2);
    ctx.fillStyle = INK; ctx.fillRect(wx - 1, y - 11, 2, 2);
  }
  // (the lights: headlamp at the front, a glow off it; the tail lamp)
  if (!wrecked) {
    steppedGlow(ctx, x + w - 2, y - 33, 10, '#FEF08A', 0.3, 0.05, 3);
    ink(ctx, () => ctx.rect(x + w - 4, y - 36, 4, 6), '#FEF08A', 0.8);
    ink(ctx, () => ctx.rect(x, y - 36, 4, 6), '#DC2626', 0.8); ctx.fillStyle = '#FCA5A5'; ctx.fillRect(x + 1, y - 35, 1, 2);
  }
};

/** Fire along (x .. x + w), its feet at y: the shared fire (see render/fx/fire), smoke rolling off it. */
export const drawFlames = (ctx: Ctx, x: number, y: number, w: number, f: number) => drawFire(ctx, x + w / 2, y, w, Math.min(90, 40 + w * 0.35), f, { smoke: 1, seed: Math.floor(x) });

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
      // Brownstone steps (each tread lit along its nosing, the riser under it in shadow), an iron railing with its newel posts
      ctx.fillStyle = '#5A3B2B'; ctx.fillRect(x, y, w, Y - y);
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let px = x + 7; px < x + w; px += 19) ctx.fillRect(px, y + 6, 1, Y - y - 6);
      for (let yy = y + 14; yy < Y; yy += 14) { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, yy, w, 3); ctx.fillStyle = '#7A5640'; ctx.fillRect(x, yy + 3, w, 1); }
      checker(ctx, x + w - 10, y, 10, Y - y, 'rgba(0, 0, 0, 0.2)');
      ctx.fillStyle = '#6B4A36'; ctx.fillRect(x, y, w, 5); ctx.fillStyle = '#8A6248'; ctx.fillRect(x, y, w, 1);
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, Y - y - 1);
      ctx.fillStyle = '#111827'; for (let px = x + 6; px < x + w; px += 12) ctx.fillRect(px - 1, y - 26, 2, 26);
      ctx.fillStyle = '#3F3F46'; for (let px = x + 6; px < x + w; px += 12) ctx.fillRect(px - 1, y - 24, 1, 22);
      ctx.fillStyle = INK; ctx.fillRect(x + 4, y - 27, w - 8, 3); ctx.fillStyle = '#52525B'; ctx.fillRect(x + 4, y - 27, w - 8, 1);
      for (const px of [x + 4, x + w - 7]) { column(ctx, px - 1, y - 30, 5, 30, '#18181B'); ink(ctx, () => ctx.arc(px + 1.5, y - 32, 3, 0, Math.PI * 2), '#27272A', 0.8); ctx.fillStyle = '#71717A'; ctx.fillRect(px, y - 34, 1, 1); }
      break;
    }
    case 'rooftop': break;
    case 'plank':
      // A scaffold board laid across: grain, the end grain, nail heads
      slab(ctx, x, y, w, 8, '#A16207', 1);
      ctx.fillStyle = '#8A5206'; for (let gx = x + 6; gx < x + w - 6; gx += 17) ctx.fillRect(gx, y + 3, 9, 1);
      ctx.fillStyle = '#713F12'; ctx.fillRect(x + 1, y + 6, w - 2, 1);
      ctx.fillStyle = '#57534E'; ctx.fillRect(x + 4, y + 3, 2, 2); ctx.fillRect(x + w - 6, y + 3, 2, 2);
      break;
    case 'escape': {
      // A fire escape landing: iron grating, a railing, the ladder up to the next one
      ctx.fillStyle = INK; ctx.fillRect(x, y, w, 6);
      ctx.fillStyle = '#27272A'; ctx.fillRect(x, y, w, 2);
      ctx.fillStyle = '#3F3F46'; for (let px = x + 3; px < x + w; px += 7) ctx.fillRect(px, y + 2, 3, 3);
      ctx.fillStyle = '#52525B'; ctx.fillRect(x, y, w, 1);
      ctx.fillStyle = INK; ctx.fillRect(x, y - 31, w, 3);
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(x, y - 31, w, 1);
      for (let px = x; px <= x + w; px += 14) { ctx.fillStyle = INK; ctx.fillRect(px - 1, y - 30, 2, 30); ctx.fillStyle = '#3F3F46'; ctx.fillRect(px - 1, y - 28, 1, 26); }
      ctx.fillStyle = '#18181B'; ctx.fillRect(x, y - 16, w, 1);
      break;
    }
    case 'tank':
      // A water tower: wooden barrel on legs, a cone roof
      waterTank(ctx, x, y - 90, w, 90, 40, y + 122, 10);
      slab(ctx, x - 2, y - 3, w + 4, 6, '#111827', 1);
      break;
    case 'ac':
      // A rooftop AC unit: a steel box, louvers down its side, the fan's grille on top-front
      slab(ctx, x, y, w, 50, '#9CA3AF', 2);
      for (let px = x + 6; px < x + w - 4; px += 8) { ctx.fillStyle = '#6B7280'; ctx.fillRect(px, y + 8, 4, 34); ctx.fillStyle = '#C3C8CF'; ctx.fillRect(px, y + 8, 4, 1); ctx.fillStyle = '#4B5563'; ctx.fillRect(px + 3, y + 9, 1, 33); }
      ink(ctx, () => ctx.arc(x + w / 2, y + 25, 14, 0, Math.PI * 2), '#374151');
      ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + w / 2, y + 25, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#1F2937'; for (let a = 0; a < 3; a++) { const t = a * 2.1 + (state.frame * 0.4); ctx.beginPath(); ctx.moveTo(x + w / 2, y + 25); ctx.lineTo(x + w / 2 + Math.cos(t) * 12, y + 25 + Math.sin(t) * 12); ctx.stroke(); }
      ink(ctx, () => ctx.arc(x + w / 2, y + 25, 3, 0, Math.PI * 2), '#9CA3AF', 0.8);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x + w / 2 - 9, y + 15, 4, 1);
      slab(ctx, x - 2, y - 2, w + 4, 4, '#B4BAC4', 1);
      break;
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
    ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x + 8, y + 6); ctx.lineTo(x + 30, y + 40); ctx.moveTo(x + w - 8, y + 6); ctx.lineTo(x + w - 30, y + 40); ctx.stroke();
    ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + 8, y + 6); ctx.lineTo(x + 30, y + 40); ctx.moveTo(x + w - 8, y + 6); ctx.lineTo(x + w - 30, y + 40); ctx.stroke();
    ctx.fillStyle = INK; ctx.fillRect(x, y, w, 6);
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(x, y, w, 2); ctx.fillStyle = '#71717A'; ctx.fillRect(x, y, w, 1);
    ctx.fillStyle = '#52525B'; for (let px = x + 3; px < x + w; px += 6) ctx.fillRect(px, y + 2, 3, 3);
    for (const ry of [y - 24, y - 12]) { ctx.fillStyle = INK; ctx.fillRect(x, ry - 1, w, 3); ctx.fillStyle = '#52525B'; ctx.fillRect(x, ry - 1, w, 1); }
    for (let px = x; px <= x + w; px += 30) { ctx.fillStyle = INK; ctx.fillRect(px - 1, y - 24, 3, 24); ctx.fillStyle = '#52525B'; ctx.fillRect(px - 1, y - 24, 1, 24); }
    return;
  }
  if (l.look === 'bench') {
    slab(ctx, x, y, w, 8, '#78350F', 1); ctx.fillStyle = '#5A270B'; ctx.fillRect(x + 1, y + 4, w - 2, 1);
    column(ctx, x + 8, y + 8, 6, Y - y - 8, '#1C1917'); column(ctx, x + w - 14, y + 8, 6, Y - y - 8, '#1C1917');
    return;
  }
  // (the rest are drawn with their props: here just their top edge)
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x, y, w, 2);
};

const drawLamp = (ctx: Ctx, state: GameState, x: number, y: number, look: string, level: number) => {
  const on = level > 0.05;
  if (look === 'street') {
    // A cobra-head street lamp on its pole: the pole stepped, its arm, the head (lit lens under it)
    column(ctx, x + 36, y, 6, Y - y, '#1F2937');
    slab(ctx, x + 34, Y - 24, 10, 24, '#1F2937', 1);
    ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x + 39, y + 4); ctx.quadraticCurveTo(x + 38, y - 16, x + 6, y - 6); ctx.stroke();
    ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 39, y + 4); ctx.quadraticCurveTo(x + 38, y - 16, x + 6, y - 6); ctx.stroke();
    ctx.strokeStyle = '#374151'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 37, y + 2); ctx.quadraticCurveTo(x + 36, y - 16, x + 6, y - 8); ctx.stroke();
    shaded(ctx, () => ctx.ellipse(x, y - 4, 18, 7, 0, 0, Math.PI * 2), '#374151', x - 18, y - 11, 36, 14);
    if (on) steppedGlow(ctx, x, y + 2, 22, '#FFECB3', 0.25 * level, 0.03, 3);
    ink(ctx, () => ctx.ellipse(x, y + 1, 12, 3.5, 0, 0, Math.PI * 2), on ? `rgba(255, 236, 179, ${0.5 + level * 0.5})` : '#44403C', 0.8);
    if (on) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 6, y, 8, 1); }
  } else if (look === 'sign') {
    // A neon sign: a black box on a bracket, the tubes lit pink (a glow round them), or dead
    slab(ctx, x - 36, y - 14, 72, 26, '#111827', 2);
    ctx.fillStyle = '#374151'; ctx.fillRect(x - 33, y - 11, 66, 1);
    if (on) steppedGlow(ctx, x, y, 34, '#F472B6', 0.22, 0.03, 3);
    ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
    if (on) { ctx.fillStyle = '#9D174D'; ctx.fillText(x % 2 ? 'OPEN 24' : 'XXX', x + 1, y + 4); }
    ctx.fillStyle = on ? '#F472B6' : '#4B1D36'; ctx.fillText(x % 2 ? 'OPEN 24' : 'XXX', x, y + 3);
    ctx.textAlign = 'left';
  } else if (look === 'bulb') {
    // A bare bulb on its cord: the socket, the glass lit (a hot spot), a glow
    ctx.strokeStyle = '#111827'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 12); ctx.stroke();
    column(ctx, x - 2, y + 8, 4, 5, '#57534E');
    if (on) steppedGlow(ctx, x, y + 16, 16, '#FEF3C7', 0.3, 0.03, 3);
    ink(ctx, () => ctx.arc(x, y + 16, 5, 0, Math.PI * 2), on ? '#FEF3C7' : '#44403C', 0.8);
    ctx.fillStyle = on ? '#FFFFFF' : '#57534E'; ctx.fillRect(x - 2, y + 13, 2, 2);
  } else if (look === 'tube') {
    // A strip light: its housing, the tube lit (or dead)
    slab(ctx, x - 40, y, 80, 5, '#9CA3AF', 1);
    ctx.fillStyle = INK; ctx.fillRect(x - 37, y + 5, 74, 4);
    ctx.fillStyle = on ? '#F0F9FF' : '#52525B'; ctx.fillRect(x - 36, y + 5, 72, 3);
    if (on) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 30, y + 5, 60, 1); ctx.fillStyle = 'rgba(240, 249, 255, 0.15)'; ctx.fillRect(x - 40, y + 9, 80, 3); }
    ctx.fillStyle = '#6B7280'; ctx.fillRect(x - 38, y + 5, 2, 3); ctx.fillRect(x + 36, y + 5, 2, 3);
  } else {
    // An aircraft beacon on its mast: red, blinking
    column(ctx, x - 2, y, 4, 40, '#18181B');
    if (on) steppedGlow(ctx, x, y, 14, '#EF4444', 0.35, 0.04, 3);
    ink(ctx, () => ctx.arc(x, y, 4, 0, Math.PI * 2), on ? '#EF4444' : '#450A0A', 0.8);
    if (on) { ctx.fillStyle = '#FCA5A5'; ctx.fillRect(x - 2, y - 2, 2, 2); }
  }
  void state;
};

/** A subway grate: steel bars; hissing wisps when it's about to go, a column of steam when it does. */
const drawVent = (ctx: Ctx, state: GameState, x: number, w: number, st: string) => {
  const f = state.frame;
  ctx.fillStyle = INK; ctx.fillRect(x - 1, Y - 4, w + 2, 7);
  ctx.fillStyle = '#0B0F17'; ctx.fillRect(x, Y - 3, w, 5);
  for (let px = x + 3; px < x + w; px += 9) { ctx.fillStyle = '#6B7280'; ctx.fillRect(px, Y - 3, 3, 5); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(px, Y - 3, 3, 1); }
  if (st === 'warn') {
    for (let k = 0; k < 4; k++) { const t = ((f * 2 + k * 11) % 30) / 30; pixelBlob(ctx, x + 12 + k * (w - 24) / 3, Y - 6 - t * 30, 4 + t * 6, 4 + t * 6, 'rgba(226, 232, 240, 0.35)'); }
  } else if (st === 'blast') {
    // (the column: bands of steam thinning as it goes up, widening; puffs rolling up it)
    for (let b = 0; b < 6; b++) {
      const t0 = b / 6, t1 = (b + 1) / 6;
      ctx.fillStyle = `rgba(241, 245, 249, ${(0.85 * (1 - t0)).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(x - 40 * t0, Y - 300 * t0); ctx.lineTo(x + w + 40 * t0, Y - 300 * t0); ctx.lineTo(x + w + 40 * t1, Y - 300 * t1); ctx.lineTo(x - 40 * t1, Y - 300 * t1); ctx.closePath(); ctx.fill();
    }
    for (let k = 0; k < 8; k++) { const t = ((f * 5 + k * 13) % 60) / 60; pixelBlob(ctx, x + w / 2 + Math.sin(k * 2 + f * 0.2) * (10 + t * 40), Y - t * 280, 10 + t * 20, 10 + t * 20, 'rgba(248, 250, 252, 0.5)'); }
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
