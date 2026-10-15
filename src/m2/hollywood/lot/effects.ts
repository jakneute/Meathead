// The old studio tour's "special effects" on the backlot: they work, sort of, and hurt whoever's in them.
//
//   THE RAINSTORM (New York Street): sprinkler pipes overhead; it drizzles, then pours (the tell: the rumble, the rain
//   doubling), then the "lightning" rig fires and the whole wet street goes live for a moment. Up off the pavement (a
//   fire escape, a crate, the air) and it's nothing. Anybody on the street gets it (the extras too).
//
//   THE FLASH FLOOD (the tank across the street): a sunk tank of tour water, and the guests pee in it (yellow-brown,
//   scummy, foam, trash floating, the stink, the flies; NO PEEING IN THE TANK, ignored). Falling in hurts a little and
//   he's out of it in disgust: a big gross splash, him flung back out onto the nearer bank, gagging (not put back at
//   the start). Whoever else gets knocked in is done for. Every so often the dump tank up on its tower tips (the tell:
//   the klaxon, the tank rocking) and the surge comes up out of the tank, high enough to take him off a low wire.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, isTalking } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { setHazardZones, hazardVictims, hazardHit, hazardKill, boxHits } from '../../hazardHit';
import { box, meatheadSays } from '../section';
import { onWire } from '../wires';
import { GY } from '../geometry';
import { X, RAIN, TANK } from './layout';
import { words, print, enamel } from '../blvd/paint';
import { TANK_GAG } from './lines';

type Ctx = CanvasRenderingContext2D;

/** Him flung back out of the tank (carried along an arc, from where he went in to the nearer bank), frames in, of n. */
interface Fling { t: number; n: number; x0: number; y0: number; x1: number; y1: number; h: number; dir: number; said: boolean }
const FLINGS = new WeakMap<object, { fling: Fling | null }>();
const flingOf = (state: GameState) => { const k = state.stage as object; let f = FLINGS.get(k); if (!f) { f = { fling: null }; FLINGS.set(k, f); } return f; };
/** He's being flung out of the tank right now (no controls of his own). */
export const flungOut = (state: GameState) => !!flingOf(state).fling;
/** The tank's water, its scum and its spray (not so bright the lighting takes any of it for fire). */
const PEE = ['#A16207', '#8A6A12', '#B08D2A', '#D9D4A8', '#78590F'];

const startFling = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  const toL = cx - X(TANK.a) < X(TANK.b) - cx;
  const tx = toL ? X(TANK.a) - 110 : X(TANK.b) + 110, dx = Math.abs(tx - cx);
  const fl: Fling = { t: 0, n: Math.round(34 + dx / 14), x0: p.pos.x, y0: p.pos.y, x1: tx - p.width / 2, y1: GY - p.height, h: 190 + dx * 0.12, dir: toL ? -1 : 1, said: false };
  flingOf(state).fling = fl;
  // (it stings: a little, not a death sentence)
  if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 8, 'm2:hw_tank', undefined, 8);
  if (p.health <= 0) { flingOf(state).fling = null; return; }
  p.carried = true; p.vel.x = 0; p.vel.y = 0; p.facing = fl.dir as 1 | -1;
  playSound('splash', 1, -6); playSound('splash', 0.7, 4); playSound('squish', 0.6, -2); shakeScreen(state, 5, 3);
  // (the big gross splash: up out of the tank, all over)
  for (let k = 0; k < 46; k++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, s = 3 + Math.random() * 9;
    state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 40, y: GY + 26 }, vel: { x: Math.cos(a) * s, y: Math.sin(a) * s - 2 }, life: 40 + Math.random() * 30, color: PEE[k % PEE.length], size: 2 + Math.random() * 4, grav: 0.35 });
  }
};
/** A frame of him flung out (carried along the arc); done, he's on the bank and his own again. */
const runFling = (state: GameState) => {
  const fs = flingOf(state), fl = fs.fling, p = state.player;
  if (!fl) return;
  if (p.health <= 0 || state.deathTimer > 0) { p.carried = false; fs.fling = null; return; }
  fl.t++;
  const u = Math.min(1, fl.t / fl.n), k = u * u * (3 - 2 * u);
  p.pos.x = fl.x0 + (fl.x1 - fl.x0) * k;
  p.pos.y = fl.y0 + (fl.y1 - fl.y0) * u - 4 * fl.h * u * (1 - u);
  p.vel.x = 0; p.vel.y = 0; p.facing = fl.dir as 1 | -1;
  // (dripping the whole way)
  if (fl.t % 2 === 0) state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + p.height * (0.3 + Math.random() * 0.6) }, vel: { x: (Math.random() - 0.5), y: 1 }, life: 26, color: PEE[fl.t % 3], size: 2 + Math.random() * 2, grav: 0.3 });
  // (the gag: his own say about it, if the hurt didn't already get one out of him)
  if (!fl.said && fl.t === 3) { fl.said = true; if (!isTalking() && !state.isMeatheadSpeaking) meatheadSays(state, pickLine(TANK_GAG), false); }
  if (fl.t === Math.round(fl.n * 0.45)) playSound('retch', 0.7, 0);
  if (u >= 1) { p.carried = false; p.vel.x = 0; p.vel.y = 2; fs.fling = null; playSound('splat', 0.6, -6); }
};

export const rainPhase = (state: GameState) => state.frame % RAIN.period;
export const floodPhase = (state: GameState) => (state.frame + 120) % TANK.period;
const surgeLevel = (t: number) => {
  // (how high the surge is over the street: up fast, down slower)
  if (t < TANK.surge || t >= TANK.surgeEnd + 30) return -30;
  if (t < TANK.surge + 10) return -30 + ((t - TANK.surge) / 10) * (TANK.surgeH + 30);
  if (t < TANK.surgeEnd) return TANK.surgeH;
  return TANK.surgeH - ((t - TANK.surgeEnd) / 30) * (TANK.surgeH + 30);
};

export interface FxEvents { zapped?: boolean; pour?: boolean; warn?: boolean; surge?: boolean; dunked?: boolean }

export const updateEffects = (ctx: FrameContext): FxEvents => {
  const { state } = ctx, p = state.player, ev: FxEvents = {};
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const near = (a: number, b: number) => cx > X(a) - 900 && cx < X(b) + 900;
  const zones = [];
  // The rainstorm
  const rt = rainPhase(state);
  if (near(RAIN.a, RAIN.b)) {
    if (rt === RAIN.tell) { playSound('thunder', 0.4, -4); ev.pour = true; }
    if (rt === RAIN.zap) { playSound('thunder', 1, 2); playSound('taser', 0.7, -2); shakeScreen(state, 6, 3); ev.zapped = true; }
  }
  if (rt >= RAIN.tell - 30) zones.push({ x0: X(RAIN.a), x1: X(RAIN.b), y0: GY - 30, y1: GY + 2, ground: true });
  if (rt >= RAIN.zap && rt < RAIN.zapEnd) {
    // (on the wet street: his feet on the pavement)
    if (p.health > 0 && p.isGrounded && Math.abs(feet - GY) < 3 && cx > X(RAIN.a) && cx < X(RAIN.b) && p.invincibilityTimer <= 0 && !p.inCutscene)
      hurtPlayer(ctx, 13, 'm2:hw_rain', { x: 0, y: -8 }, 20);
    if (rt === RAIN.zap) for (const e of hazardVictims(state)) if (e.enemyType !== 'flyer' && boxHits(e, X(RAIN.a), GY - 6, X(RAIN.b) - X(RAIN.a), 8)) { e.shockedUntil = state.frame + 30; hazardHit(ctx, e, 45, e.pos.x + e.width / 2, 'ZAPPED!', { color: '#BAE6FD', knock: 2 }); }
  }
  // The flash flood
  const ft = floodPhase(state);
  if (near(TANK.a, TANK.b)) {
    if (ft === TANK.warn || ft === TANK.warn + 14) { playSound('alarm', 0.4, 0); if (ft === TANK.warn) ev.warn = true; }
    if (ft === TANK.surge) { playSound('tsunami', 0.8, 0); playSound('splash', 0.9, -4); shakeScreen(state, 5, 3); ev.surge = true; }
  }
  const lvl = surgeLevel(ft), top = GY - lvl;
  zones.push({ x0: X(TANK.a), x1: X(TANK.b), y0: Math.min(GY, top), y1: GY + TANK.depth, ground: true });
  const inTank = cx > X(TANK.a) + 4 && cx < X(TANK.b) - 4;
  runFling(state);
  if (p.health > 0 && inTank && !p.inCutscene && !flungOut(state)) {
    if (feet > GY + 30) {
      // (in the tank: on a wire (reeled down into it), the sting knocks him off it and he's flung out next frame;
      // otherwise flung straight back out onto the nearer bank, gagging)
      if (onWire(state)) { if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 8, 'm2:hw_tank', undefined, 8); }
      else { startFling(ctx); ev.dunked = true; }
    } else if (lvl > 0 && feet > top + 10 && p.invincibilityTimer <= 0) {
      // (the surge: up round him, off whatever he's hanging on)
      hurtPlayer(ctx, 11, 'm2:hw_flood', { x: (Math.random() - 0.5) * 6, y: -7 }, 22);
    }
  }
  for (const e of hazardVictims(state, { flyers: false })) {
    if (!boxHits(e, X(TANK.a) + 4, Math.min(GY + 30, top + 10), X(TANK.b) - X(TANK.a) - 8, GY + TANK.depth)) continue;
    hazardKill(ctx, e, e.pos.x + e.width / 2, 'FLASH FLOOD!', { color: '#7DD3FC', fling: { x: 0, y: -6 }, sound: 'splash' });
  }
  setHazardZones(state, 'lot-fx', zones);
  return ev;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The rain rig's pipes (behind), the rain and the zap (in front). */
export const drawRainBack = (c: Ctx, state: GameState) => {
  const a = X(RAIN.a), b = X(RAIN.b), y = GY - 430;
  if (b < state.camera.x - 100 || a > state.camera.x + 900) return;
  box(c, a - 20, y - 6, b - a + 40, 8, '#52525B'); box(c, a - 20, y - 6, b - a + 40, 2, '#71717A');
  for (let x = a; x <= b; x += 60) box(c, x - 3, y + 2, 6, 8, '#3F3F46');
  for (const x of [a - 20, b + 12]) box(c, x, y, 8, 430, '#57534E');
  // (the lightning rig: a spark gap box up on the pipe, a sign on it)
  box(c, (a + b) / 2 - 30, y - 34, 60, 28, '#18181B'); box(c, (a + b) / 2 - 26, y - 30, 52, 20, '#FACC15');
  // (the wet: puddles shining on the street)
  for (let x = a + 30; x < b; x += 140) { c.fillStyle = 'rgba(147, 197, 253, 0.35)'; c.beginPath(); c.ellipse(x, GY + 2, 40, 4, 0, 0, Math.PI * 2); c.fill(); }
};
export const drawRainFront = (c: Ctx, state: GameState) => {
  const a = X(RAIN.a), b = X(RAIN.b), y = GY - 420, t = rainPhase(state), f = state.frame;
  if (b < state.camera.x - 100 || a > state.camera.x + 900) return;
  const heavy = t >= RAIN.tell;
  c.strokeStyle = heavy ? 'rgba(191, 219, 254, 0.7)' : 'rgba(191, 219, 254, 0.4)'; c.lineWidth = 1; c.beginPath();
  const step = heavy ? 14 : 30;
  for (let x = Math.max(a, state.camera.x - 20); x < Math.min(b, state.camera.x + 820); x += step) {
    const k = ((x * 7 + f * 13) % 420 + 420) % 420;
    c.moveTo(x, y + k); c.lineTo(x - 2, y + k + 16);
  }
  c.stroke();
  if (t >= RAIN.zap && t < RAIN.zapEnd) {
    // (the bolt off the rig down into the street, and the street crawling with it)
    c.fillStyle = 'rgba(255, 255, 255, 0.35)'; c.fillRect(state.camera.x, GY - 600, 800, 800);
    c.strokeStyle = '#F0F9FF'; c.lineWidth = 3; c.beginPath();
    let bx = (a + b) / 2, by = y - 20; c.moveTo(bx, by);
    while (by < GY) { bx += ((by * 13 + t) % 40) - 20; by += 40; c.lineTo(bx, by); }
    c.stroke();
    c.strokeStyle = '#BAE6FD'; c.lineWidth = 2; c.beginPath();
    for (let x = a; x < b; x += 24) { c.moveTo(x, GY); c.lineTo(x + 8, GY - 6 - ((x + t * 7) % 10)); c.lineTo(x + 16, GY); }
    c.stroke();
  }
};

/** The tank (behind), its water and the surge (in front), the dump tank on its tower. */
export const drawFloodBack = (c: Ctx, state: GameState) => {
  const a = X(TANK.a), b = X(TANK.b);
  if (b < state.camera.x - 200 || a > state.camera.x + 1000) return;
  const t = floodPhase(state), f = state.frame;
  box(c, a, GY, b - a, TANK.depth + 400, '#292108');
  box(c, a, GY, 10, TANK.depth, '#64748B'); box(c, b - 10, GY, 10, TANK.depth, '#64748B');
  // (the walls: a crusty brown ring at the waterline, streaks down from the lip where they lean over it to go)
  for (const wx of [a, b - 10]) {
    box(c, wx, GY + 22, 10, 12, '#713F12'); box(c, wx, GY + 34, 10, 6, '#A16207');
    for (let k = 0; k < 4; k++) box(c, wx + 2 + (k % 2) * 4, GY + 2, 2, 8 + ((k * 7) % 14), '#854D0E');
  }
  // (the dump tank: up on its tower behind the far end, tipping for the surge)
  const tx = b - 120, rock = t >= TANK.warn && t < TANK.surgeEnd ? Math.sin(t * 0.5) * 0.08 + (t >= TANK.surge ? 0.6 : 0) : 0;
  for (const lx of [tx - 50, tx + 50]) box(c, lx - 4, GY - 300, 8, 300, '#57534E');
  c.save(); c.translate(tx, GY - 330); c.rotate(-rock);
  box(c, -70, -50, 140, 80, '#000'); box(c, -68, -48, 136, 76, '#475569'); box(c, -68, -48, 136, 4, '#94A3B8');
  // (what's in it, by the stain down its side)
  box(c, -60, 10, 120, 6, '#854D0E'); box(c, -40, 16, 4, 12, '#854D0E'); box(c, 22, 16, 4, 8, '#854D0E');
  c.restore();
  if (t >= TANK.warn && t < TANK.surge && t % 20 < 10) { box(c, tx - 6, GY - 400, 12, 12, '#EF4444'); }
  // NO PEEING IN THE TANK: a big board bolted across the tower's legs (above the surge), ignored: a yellow stain right
  // up the post under it, somebody's added to it
  const sy = GY - 262;
  box(c, tx - 92, sy - 2, 184, 56, '#000'); box(c, tx - 90, sy, 180, 52, '#FEF3C7'); box(c, tx - 90, sy, 180, 4, '#DC2626'); box(c, tx - 90, sy + 48, 180, 4, '#DC2626');
  words(c, 'NO PEEING', tx, sy + 22, enamel(10, '#B91C1C'));
  words(c, 'IN THE TANK', tx, sy + 40, print(1, '#18181B'));
  box(c, tx + 46, GY - 200, 8, 200, 'rgba(161, 98, 7, 0.55)');
  box(c, tx + 48, sy + 54, 52, 16, '#FDE68A'); box(c, tx + 70, sy + 50, 8, 6, 'rgba(226, 232, 240, 0.8)');
  words(c, 'PLEASE', tx + 74, sy + 65, print(1, '#18181B'));
  // (and a counter on the near sign's post, under the FLASH FLOOD sign)
  const px = X(TANK.a) - 180;
  box(c, px - 52, GY - 128, 104, 34, '#000'); box(c, px - 50, GY - 126, 100, 30, '#E7E5E4');
  words(c, 'DAYS WITHOUT A', px, GY - 116, print(1, '#18181B'));
  words(c, 'PEE IN IT: 0', px, GY - 104, print(1, f % 60 < 40 ? '#B91C1C' : '#7F1D1D'));
};
/** The floating trash, bobbing at (x, y): a cup, a diaper, a can, a dead fish, a page of the script, a turd. */
const junk = (c: Ctx, k: number, x: number, y: number, f: number) => {
  c.save(); c.translate(x, y); c.rotate(Math.sin(f * 0.04 + k) * 0.25);
  switch (k % 6) {
    case 0: box(c, -5, -8, 10, 10, '#F8FAFC'); box(c, -5, -8, 10, 3, '#DC2626'); box(c, 0, -14, 2, 7, '#FACC15'); break;
    case 1: box(c, -10, -5, 20, 7, '#E7E5E4'); box(c, -4, -5, 8, 7, '#CA8A04'); break;
    case 2: box(c, -7, -4, 14, 6, '#B91C1C'); box(c, -7, -4, 3, 6, '#D4D4D8'); break;
    case 3: box(c, -9, -3, 16, 5, '#94A3B8'); box(c, 7, -5, 5, 8, '#94A3B8'); box(c, -6, -3, 2, 2, '#18181B'); break;
    case 4: box(c, -6, -6, 12, 9, '#D6D3B1'); box(c, -4, -3, 8, 1, '#78716C'); break;
    default: box(c, -8, -4, 16, 6, '#78350F'); box(c, -4, -7, 9, 4, '#713F12'); box(c, -1, -9, 3, 3, '#78350F');
  }
  c.restore();
};
export const drawFloodFront = (c: Ctx, state: GameState) => {
  const a = X(TANK.a), b = X(TANK.b);
  if (b < state.camera.x - 200 || a > state.camera.x + 1000) return;
  const t = floodPhase(state), lvl = surgeLevel(t), f = state.frame;
  const top = GY + 30 - Math.max(0, lvl + 30);
  // (the water: yellow going brown down to the murk at the bottom)
  c.fillStyle = 'rgba(176, 141, 42, 0.8)'; c.fillRect(a + 4, top, b - a - 8, GY + TANK.depth - top);
  c.fillStyle = 'rgba(113, 63, 18, 0.55)'; c.fillRect(a + 4, Math.max(top, GY + 70), b - a - 8, GY + TANK.depth - Math.max(top, GY + 70));
  c.fillStyle = 'rgba(66, 32, 6, 0.5)'; c.fillRect(a + 4, Math.max(top, GY + 120), b - a - 8, GY + TANK.depth - Math.max(top, GY + 120));
  // (bubbles coming up out of the murk: something down there's still going)
  for (let k = 0; k < 10; k++) {
    const by = GY + TANK.depth - ((f * (0.6 + (k % 3) * 0.3) + k * 53) % (TANK.depth - 30 + Math.max(0, lvl))), bx = a + 30 + ((k * 97) % (b - a - 60)) + Math.sin(f * 0.1 + k) * 3;
    if (by > top + 4) box(c, bx, by, 3, 3, 'rgba(217, 212, 168, 0.7)');
  }
  // (the scum on top: a foamy yellow-white crust, in clumps)
  for (let x = a + 4; x < b - 4; x += 12) {
    const w = Math.sin(x * 0.05 + f * 0.12) * 2, clump = (x * 13) % 5;
    box(c, x, top - 2 + w, 9, 3, clump < 2 ? '#D9D4A8' : '#B08D2A');
    if (clump === 0) box(c, x + 2, top - 5 + w, 6, 3, '#E7E2B8');
  }
  // (the trash, floating on it)
  for (let k = 0; k < 9; k++) { const jx = a + 50 + ((k * 101 + Math.sin(f * 0.01 + k) * 20) % (b - a - 100)); junk(c, k, jx, top + Math.sin(jx * 0.05 + f * 0.12) * 2, f); }
  if (lvl > 0) for (let k = 0; k < 6; k++) { c.fillStyle = 'rgba(217, 212, 168, 0.85)'; c.beginPath(); c.arc(a + ((k * 157 + f * 3) % (b - a)), top, 8 + (k % 3) * 4, 0, Math.PI * 2); c.fill(); }
  // (the stink coming up off it, wavy and green; the flies over it)
  c.strokeStyle = 'rgba(132, 204, 22, 0.45)'; c.lineWidth = 2;
  for (let k = 0; k < 7; k++) {
    const sx = a + 70 + k * ((b - a - 140) / 6), ph = ((f * 0.6 + k * 37) % 90) / 90, sy = top - 10 - ph * 70;
    c.globalAlpha = 1 - ph; c.beginPath(); c.moveTo(sx, sy);
    for (let j = 1; j <= 4; j++) c.lineTo(sx + Math.sin(f * 0.08 + j + k) * 6, sy - j * 9);
    c.stroke();
  }
  c.globalAlpha = 1;
  for (let k = 0; k < 14; k++) {
    const fx = a + 40 + ((k * 67) % (b - a - 80)) + Math.sin(f * 0.21 + k * 2) * 18, fy = top - 22 - (k % 4) * 10 + Math.cos(f * 0.27 + k) * 9;
    box(c, fx, fy, 2, 2, '#18181B'); if ((f + k) % 4 < 2) box(c, fx - 1, fy - 1, 4, 1, 'rgba(226, 232, 240, 0.6)');
  }
};
