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
import { meatheadSays } from '../section';
import { onWire } from '../wires';
import { GY } from '../geometry';
import { X, RAIN, TANK } from './layout';
import {
  type View, INK, box, checker, mix, at, atDepth, still, seen, poly, bandedGradient, signText, board, plain, timeOfDay, skyAt,
  FRONT_D, STEEL, CONCRETE, hour,
} from '../blvd/kit';
import { wallBack } from '../blvd/ground';
import { TILE } from './paint';
import { TANK_GAG } from './lines';
import { canDrown, drownEnemy } from '../../drown';

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
  // (what's in the tank, or caught in the surge over it, drowns in it, past its middle; on the street, the surge flings it)
  const tankTop = () => GY + 30 - Math.max(0, surgeLevel(floodPhase(state)) + 30);
  for (const e of hazardVictims(state, { flyers: false })) {
    if (!boxHits(e, X(TANK.a) + 4, Math.min(GY + 30, top + 10), X(TANK.b) - X(TANK.a) - 8, GY + TANK.depth)) continue;
    const ecx = e.pos.x + e.width / 2;
    if (ecx > X(TANK.a) && ecx < X(TANK.b)) {
      if (canDrown(e) && e.pos.y + e.height * 0.6 > tankTop() + 6) drownEnemy(ctx, e, { surface: tankTop(), x1: X(TANK.a), x2: X(TANK.b), key: 'lot-tank' }, { spray: PEE, surfaceAt: tankTop });
      continue;
    }
    hazardKill(ctx, e, ecx, 'FLASH FLOOD!', { color: '#7DD3FC', fling: { x: 0, y: -6 }, sound: 'splash' });
  }
  setHazardZones(state, 'lot-fx', zones);
  return ev;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (peak SNES, fake 3D: the rig over the street at RIG_D, the tank going back to the fronts, its dump tank up on
// its tower behind it at TOWER_D)

const RIG_D = 0.975, TOWER_D = 0.9;

/** The rain rig over New York Street: the sprinkler main on its two uprights, its nozzles, the lightning rig's spark box
 *  on it (its sign up top), dripping. Behind him. */
export const drawRainRig = (c: Ctx, v: View, state: GameState) => {
  const a = X(RAIN.a), b = X(RAIN.b), y = GY - 430, f = state.frame;
  if (!seen(v, a - 60, b + 60, RIG_D)) return;
  atDepth(c, v.eye, RIG_D, () => {
    still(c, 'lot-rainrig', a, GY, -60, -500, b - a + 120, 502, g => {
      const S = STEEL.map(col => hour(col)), Y2 = ['#5A3A04', '#8A5E08', '#C08A10', '#EAB516', '#FAD43A', '#FFF08A'];
      for (const ux of [-24, b - a + 14]) { box(g, ux - 1, -430, 12, 430, INK); box(g, ux, -430, 10, 430, S[3]); box(g, ux, -430, 3, 430, S[5]); box(g, ux + 8, -430, 2, 430, S[1]); box(g, ux - 6, -10, 22, 10, INK); box(g, ux - 5, -9, 20, 9, S[2]); for (let yy = -400; yy < -20; yy += 60) box(g, ux - 2, yy, 14, 3, S[2]); }
      box(g, -26, -438, b - a + 52, 12, INK); box(g, -25, -437, b - a + 50, 10, S[3]); box(g, -25, -437, b - a + 50, 2, S[5]); box(g, -25, -429, b - a + 50, 2, S[1]);
      for (let x = 0; x <= b - a; x += 60) { box(g, x - 4, -427, 8, 10, INK); box(g, x - 3, -426, 6, 8, S[2]); box(g, x - 2, -418, 4, 3, S[1]); }
      // (the spark box: yellow, its insulators; HIGH VOLTAGE; the rig's sign beside it)
      const sx = (b - a) / 2 - 60;
      box(g, sx - 1, -472, 62, 36, INK); box(g, sx, -471, 60, 34, Y2[3]); box(g, sx, -471, 60, 3, Y2[5]); box(g, sx + 56, -471, 4, 34, Y2[1]);
      for (const ix of [sx + 10, sx + 44]) { box(g, ix - 3, -484, 8, 12, INK); for (let k = 0; k < 3; k++) box(g, ix - 2, -483 + k * 4, 6, 3, k % 2 ? '#8A5A3A' : '#C88A5A'); }
      signText(g, 'HIGH', sx + 30, -456, plain(1, 1, '#18181B')); signText(g, 'VOLTAGE', sx + 30, -446, plain(1, 1, '#18181B'));
      board(g, (b - a) / 2 + 70, -458, ['RAINSTORM EFFECT'], plain(1, 1, '#FACC15'), '#18181B', S, 5);
    });
    // (drips off the nozzles, now and then)
    for (let x = a, k = 0; x <= b; x += 60, k++) { const t = (f * 3 + k * 37) % 120; if (t < 60) box(c, x - 1, y + 12 + t * 6, 2, 4, 'rgba(191, 219, 254, 0.8)'); }
  });
};

/** The wet on the near street: puddles shining the sky, stepped. */
export const drawRainPuddles = (c: Ctx, state: GameState) => {
  const a = X(RAIN.a), b = X(RAIN.b), tod = timeOfDay();
  if (b < state.camera.x - 100 || a > state.camera.x + 900) return;
  const sky = skyAt(0.4, tod), rim = skyAt(0.85, tod);
  for (let x = a + 30, k = 0; x < b; x += 140, k++) {
    const py = GY + 30 + (k % 3) * 34, rw = 40 + (k % 2) * 16, rh = Math.round(4 + (py - GY) / 30);
    for (let r = 0; r < rh; r++) { const t = (r + 0.5) / rh, hw = rw * Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2)); box(c, x - hw, py + r, hw * 2, 1, r < 1 ? rim : sky); }
    box(c, x - rw * 0.4, py + 1, rw * 0.3, 1, '#FFFFFF');
  }
};

export const drawRainFront = (c: Ctx, state: GameState) => {
  const a = X(RAIN.a), b = X(RAIN.b), y = GY - 420, t = rainPhase(state), f = state.frame;
  if (b < state.camera.x - 100 || a > state.camera.x + 900) return;
  const heavy = t >= RAIN.tell;
  // (the rain: two-tone streaks, a lit head and its tail; splashes where it lands when it pours)
  const step = heavy ? 12 : 26;
  for (let x = Math.max(a, state.camera.x - 20); x < Math.min(b, state.camera.x + 820); x += step) {
    const k = ((x * 7 + f * 13) % 420 + 420) % 420, rx = Math.round(x + ((x * 13) % 7));
    box(c, rx, y + k, 1, 12, heavy ? 'rgba(160, 196, 236, 0.75)' : 'rgba(160, 196, 236, 0.45)');
    box(c, rx - 1, y + k + 12, 1, 6, heavy ? 'rgba(220, 236, 255, 0.85)' : 'rgba(220, 236, 255, 0.5)');
    if (heavy && (Math.round(x) + f) % 3 === 0) { const sy = GY - 1; box(c, rx - 3, sy - 2, 2, 1, 'rgba(220,236,255,0.8)'); box(c, rx + 2, sy - 2, 2, 1, 'rgba(220,236,255,0.8)'); box(c, rx - 1, sy - 4, 2, 2, 'rgba(220,236,255,0.6)'); }
  }
  if (t >= RAIN.zap && t < RAIN.zapEnd) {
    // (the flash, in bands; the bolt off the rig down into the street (a blue glow, inked, a white core); the street
    // crawling with it)
    c.fillStyle = 'rgba(255, 255, 255, 0.28)'; c.fillRect(state.camera.x, GY - 600, 800, 800);
    c.fillStyle = 'rgba(200, 230, 255, 0.18)'; c.fillRect(state.camera.x, GY - 600, 800, 300);
    const pts: [number, number][] = [];
    let bx = (a + b) / 2 - 30, by = y - 30; pts.push([bx, by]);
    while (by < GY) { bx += ((by * 13 + t) % 40) - 20; by += 40; pts.push([bx, Math.min(GY, by)]); }
    for (const [w, col] of [[9, 'rgba(96, 165, 250, 0.45)'], [5, INK], [3, '#BAE6FD'], [1, '#FFFFFF']] as const) { c.strokeStyle = col; c.lineWidth = w; c.lineJoin = 'miter'; c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke(); }
    for (let x = a; x < b; x += 24) { const hh = 6 + ((x + t * 7) % 10); c.strokeStyle = '#7DD3FC'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, GY); c.lineTo(x + 8, GY - hh); c.lineTo(x + 16, GY); c.stroke(); box(c, x + 7, GY - hh - 1, 2, 2, '#FFFFFF'); }
  }
};

/** The tank going back: its far wall (pool tile, the brown ring where the level sits), its walls (poured concrete,
 *  going down), what's in it going back to the far wall (the surface, banded, scummed). The near walls are the
 *  street's (ground.ts). */
export const drawTankHole = (c: Ctx, v: View, state: GameState) => {
  const a = X(TANK.a), b = X(TANK.b);
  if (b < v.v0 - 300 || a > v.v1 + 300) return;
  const eye = v.eye, d = FRONT_D, f = state.frame, t = floodPhase(state), lvl = surgeLevel(t);
  const [ax, ay] = at(eye, a, GY, d), [bx] = at(eye, b, GY, d);
  c.save();
  c.beginPath(); c.moveTo(a, GY); c.lineTo(ax, ay); c.lineTo(bx, ay); c.lineTo(b, GY); c.lineTo(b, v.bot); c.lineTo(a, v.bot); c.closePath(); c.clip();
  const x0 = Math.min(a, ax) - 4, w = Math.max(b, bx) - x0 + 8;
  bandedGradient(c, x0, ay - 2, w, GY + TANK.depth + 60 - ay, ['#3A3020', '#2A2412', '#1A160A', '#0A0804'], 6);
  // (the far wall: pool tile in courses, stained up to the ring)
  for (let y = ay, r = 0; y < ay + TANK.depth; y += 10, r++) for (let x = ax + ((r % 2) * 10); x < bx; x += 20) { const st = y - ay > 24; box(c, x, y, 19, 9, mix(TILE[st ? 2 : 3], '#6A4A10', st ? 0.55 : 0.25)); box(c, x, y, 19, 1, mix(TILE[4], '#8A6A20', st ? 0.5 : 0.2)); }
  box(c, ax, ay + 20, bx - ax, 6, '#5A3A0A'); box(c, ax, ay + 26, bx - ax, 3, '#8A6A20');
  c.restore();
  wallBack(c, v, a, 1, 'trench');
  wallBack(c, v, b, -1, 'trench');
  // (what's in it, going back to the far wall: the surface, banded lighter far, scum in clumps)
  const top = GY + 30 - Math.max(0, lvl + 30);
  const P = (x: number, dd: number) => at(eye, x, top, dd);
  const bands = ['#8A6A12', '#9A7A1C', '#A88A2A', '#B89A3A'];
  for (let i = 0; i < 4; i++) { const p = 1 - ((1 - d) * i) / 4, q = 1 - ((1 - d) * (i + 1)) / 4; poly(c, [P(a, p), P(b, p), P(b, q), P(a, q)], bands[i]); }
  for (let k = 0; k < 40; k++) { const sx = a + 10 + ((k * 89) % (b - a - 20)), dd = 1 - (((k * 37) % 100) / 100) * (1 - d), [px, py] = P(sx + Math.sin(f * 0.03 + k) * 6, dd); box(c, px, py, Math.max(2, 6 * dd), 1, k % 3 ? '#D9D4A8' : '#E7E2B8'); }
  const [fx0, fy] = P(a, d), [fx1] = P(b, d);
  box(c, fx0, fy - 1, fx1 - fx0, 2, '#5A3A0A');
};

/** The dump tank up on its tower behind the tank's far end, tipping for the surge (the klaxon light), NO PEEING IN THE
 *  TANK on a board across its legs (somebody's added PLEASE), the yellow stain up the post under it. */
export const drawDumpTower = (c: Ctx, v: View, state: GameState) => {
  const tx = X(TANK.b) - 120;
  if (!seen(v, tx - 120, tx + 120, TOWER_D)) return;
  const t = floodPhase(state);
  const rock = t >= TANK.warn && t < TANK.surgeEnd ? Math.sin(t * 0.5) * 0.08 + (t >= TANK.surge ? 0.6 : 0) : 0;
  atDepth(c, v.eye, TOWER_D, () => {
    still(c, 'lot-dumptower', tx, GY, -110, -310, 220, 312, g => {
      const S = STEEL.map(col => hour(col));
      for (const lx of [-50, 50]) { box(g, lx - 6, -300, 12, 300, INK); box(g, lx - 5, -300, 10, 300, S[3]); box(g, lx - 5, -300, 3, 300, S[5]); box(g, lx + 3, -300, 2, 300, S[1]); box(g, lx - 10, -8, 20, 8, INK); box(g, lx - 9, -7, 18, 7, hour(CONCRETE[4])); }
      g.lineCap = 'butt';
      for (let yy = -280; yy < -20; yy += 70) for (const [x1, y1, x2, y2] of [[-46, yy, 46, yy + 70], [46, yy, -46, yy + 70]] as const) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.strokeStyle = S[2]; g.lineWidth = 2; g.stroke(); }
      box(g, -60, -306, 120, 8, INK); box(g, -59, -305, 118, 6, S[3]); box(g, -59, -305, 118, 2, S[5]);
      // (the board across the legs: NO PEEING IN THE TANK; PLEASE added under it; the stain up the post)
      board(g, 0, -236, ['NO PEEING', 'IN THE TANK'], { sx: 2, sy: 2, fill: ['#E04040', '#C82020', '#B91C1C', '#8A1010'], dither: true, shadow: '#3A0606' }, '#FEF3C7', S, 6);
      box(g, 46, -200, 8, 200, 'rgba(161, 98, 7, 0.55)'); checker(g, 44, -200, 2, 200, 'rgba(161, 98, 7, 0.4)', 0, 1);
      g.save(); g.translate(76, -196); g.rotate(0.08); box(g, -27, -9, 54, 18, INK); box(g, -26, -8, 52, 16, '#FDE68A'); box(g, -26, -8, 52, 2, '#FFF4C0'); signText(g, 'PLEASE', 0, 4, { sx: 1, sy: 1, fill: '#18181B', wobble: 1, seed: 3 }); g.restore();
    });
    // (the tank itself, rocking: riveted steel in steps, its stain down the side)
    c.save(); c.translate(tx, GY - 330); c.rotate(-rock);
    const S2 = ['#1A1C22', '#2C3038', '#3A4A5A', '#475569', '#6A7A8E', '#94A3B8'].map(col => hour(col));
    box(c, -71, -51, 142, 82, INK);
    for (let k = 0; k < 140; k += 2) { const u = k / 140; box(c, -70 + k, -50, 2, 80, S2[u < 0.1 ? 3 : u < 0.35 ? 5 : u < 0.6 ? 4 : u < 0.85 ? 3 : 2]); }
    for (let yy = -40; yy < 30; yy += 18) { box(c, -70, yy, 140, 1, S2[1]); for (let k = -64; k < 70; k += 10) box(c, k, yy + 3, 1, 1, S2[0]); }
    box(c, -70, -50, 140, 3, S2[5]);
    box(c, -60, 10, 120, 6, '#854D0E'); box(c, -40, 16, 4, 12, '#854D0E'); box(c, 22, 16, 4, 8, '#854D0E');
    c.restore();
    if (t >= TANK.warn && t < TANK.surge && t % 20 < 10) { box(c, tx - 7, GY - 401, 14, 14, INK); box(c, tx - 6, GY - 400, 12, 12, '#EF4444'); box(c, tx - 6, GY - 400, 12, 3, '#FCA5A5'); }
  });
};

/** The floating trash, bobbing at (x, y): a cup, a diaper, a can, a dead fish, a page of the script, a turd. */
const junk = (c: Ctx, k: number, x: number, y: number, f: number) => {
  c.save(); c.translate(x, y); c.rotate(Math.sin(f * 0.04 + k) * 0.25);
  switch (k % 6) {
    case 0: box(c, -6, -9, 12, 12, INK); box(c, -5, -8, 10, 10, '#F8FAFC'); box(c, -5, -8, 10, 3, '#DC2626'); box(c, 0, -14, 2, 7, '#FACC15'); break;
    case 1: box(c, -11, -6, 22, 9, INK); box(c, -10, -5, 20, 7, '#E7E5E4'); box(c, -4, -5, 8, 7, '#CA8A04'); box(c, -10, -5, 20, 1, '#FFFFFF'); break;
    case 2: box(c, -8, -5, 16, 8, INK); box(c, -7, -4, 14, 6, '#B91C1C'); box(c, -7, -4, 3, 6, '#D4D4D8'); box(c, -7, -4, 14, 1, '#F87171'); break;
    case 3: box(c, -10, -4, 18, 7, INK); box(c, -9, -3, 16, 5, '#94A3B8'); box(c, 7, -5, 5, 8, '#94A3B8'); box(c, -9, -3, 16, 1, '#CBD5E1'); box(c, -6, -3, 2, 2, '#18181B'); break;
    case 4: box(c, -7, -7, 14, 11, INK); box(c, -6, -6, 12, 9, '#D6D3B1'); box(c, -4, -3, 8, 1, '#78716C'); box(c, -4, -1, 6, 1, '#78716C'); break;
    default: box(c, -9, -5, 18, 8, INK); box(c, -8, -4, 16, 6, '#78350F'); box(c, -4, -7, 9, 4, '#713F12'); box(c, -1, -9, 3, 3, '#78350F'); box(c, -6, -4, 4, 1, '#A16207');
  }
  c.restore();
};
export const drawFloodFront = (c: Ctx, state: GameState) => {
  const a = X(TANK.a), b = X(TANK.b);
  if (b < state.camera.x - 200 || a > state.camera.x + 1000) return;
  const t = floodPhase(state), lvl = surgeLevel(t), f = state.frame;
  const top = GY + 30 - Math.max(0, lvl + 30);
  // (the water's face at the play plane: yellow going brown down to the murk, in bands, dithered between)
  const bot = GY + TANK.depth, cols = ['rgba(184, 150, 50, 0.82)', 'rgba(160, 120, 36, 0.86)', 'rgba(120, 82, 22, 0.9)', 'rgba(80, 50, 12, 0.92)', 'rgba(52, 30, 6, 0.95)'];
  const n = cols.length, bh = (bot - top) / n;
  for (let i = 0; i < n; i++) { const y0 = Math.round(top + i * bh); c.fillStyle = cols[i]; c.fillRect(a + 4, y0, b - a - 8, Math.ceil(bh)); if (i) checker(c, a + 4, y0 - 2, b - a - 8, 2, cols[i], i % 2, 2); }
  // (bubbles coming up out of the murk: something down there's still going)
  for (let k = 0; k < 10; k++) {
    const by = GY + TANK.depth - ((f * (0.6 + (k % 3) * 0.3) + k * 53) % (TANK.depth - 30 + Math.max(0, lvl))), bx = a + 30 + ((k * 97) % (b - a - 60)) + Math.sin(f * 0.1 + k) * 3;
    if (by > top + 4) { box(c, bx, by, 3, 3, 'rgba(217, 212, 168, 0.75)'); box(c, bx, by, 1, 1, '#FFFFFF'); }
  }
  // (the scum along its top: a foamy crust in clumps, lit on top)
  for (let x = a + 4; x < b - 4; x += 12) {
    const w = Math.sin(x * 0.05 + f * 0.12) * 2, clump = (x * 13) % 5;
    box(c, x, top - 2 + w, 9, 3, clump < 2 ? '#D9D4A8' : '#B08D2A'); box(c, x, top - 2 + w, 9, 1, '#F0ECC8');
    if (clump === 0) { box(c, x + 2, top - 5 + w, 6, 3, '#E7E2B8'); box(c, x + 2, top - 5 + w, 6, 1, '#FFFFF0'); }
  }
  for (let k = 0; k < 9; k++) { const jx = a + 50 + ((k * 101 + Math.sin(f * 0.01 + k) * 20) % (b - a - 100)); junk(c, k, jx, top + Math.sin(jx * 0.05 + f * 0.12) * 2, f); }
  if (lvl > 0) for (let k = 0; k < 6; k++) { const sx = a + ((k * 157 + f * 3) % (b - a)), r = 8 + (k % 3) * 4; for (let rr = r; rr > 0; rr -= 3) { c.fillStyle = rr === r ? 'rgba(176, 141, 42, 0.85)' : 'rgba(231, 226, 184, 0.85)'; c.fillRect(Math.round(sx - rr), Math.round(top - rr * 0.8), rr * 2, Math.round(rr * 1.6)); } }
  // (the stink coming up off it, wavy and green, in steps; the flies over it)
  for (let k = 0; k < 7; k++) {
    const sx = a + 70 + k * ((b - a - 140) / 6), ph = ((f * 0.6 + k * 37) % 90) / 90, sy = top - 10 - ph * 70;
    c.fillStyle = `rgba(132, 204, 22, ${(0.45 * (1 - ph)).toFixed(2)})`;
    for (let j = 0; j < 5; j++) c.fillRect(Math.round(sx + Math.sin(f * 0.08 + j + k) * 6), Math.round(sy - j * 9), 2, 7);
  }
  for (let k = 0; k < 14; k++) {
    const fx = a + 40 + ((k * 67) % (b - a - 80)) + Math.sin(f * 0.21 + k * 2) * 18, fy = top - 22 - (k % 4) * 10 + Math.cos(f * 0.27 + k) * 9;
    box(c, fx, fy, 2, 2, '#18181B'); if ((f + k) % 4 < 2) box(c, fx - 1, fy - 1, 4, 1, 'rgba(226, 232, 240, 0.6)');
  }
};
