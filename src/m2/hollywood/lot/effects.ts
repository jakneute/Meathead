// The old studio tour's "special effects" on the backlot: they work, sort of, and hurt whoever's in them.
//
//   THE RAINSTORM (New York Street): sprinkler pipes overhead; it drizzles, then pours (the tell: the rumble, the rain
//   doubling), then the "lightning" rig fires and the whole wet street goes live for a moment. Up off the pavement (a
//   fire escape, a crate, the air) and it's nothing. Anybody on the street gets it (the extras too).
//
//   THE FLASH FLOOD (the tank across the street): a sunk tank of tour water. Falling in hurts, and he's put back up at
//   the nearer edge (whoever else gets knocked in is done for). Every so often the dump tank up on its tower tips (the
//   tell: the klaxon, the tank rocking) and the surge comes up out of the tank, high enough to take him off a low wire.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { setHazardZones, hazardVictims, hazardHit, hazardKill, boxHits } from '../../hazardHit';
import { box, teleport } from '../section';
import { GY } from '../geometry';
import { X, RAIN, TANK } from './layout';

type Ctx = CanvasRenderingContext2D;

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
  if (p.health > 0 && inTank && !p.inCutscene) {
    if (feet > GY + 30) {
      // (in the tank: hurt, and back up at the nearer edge)
      if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 10, 'm2:hw_flood', { x: 0, y: -4 }, 16);
      if (p.health > 0) { const toL = cx - X(TANK.a) < X(TANK.b) - cx; teleport(state, toL ? X(TANK.a) - 40 : X(TANK.b) + 40, GY); p.vel.y = -6; }
      playSound('splash', 0.8, 0); ev.dunked = true;
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
  const t = floodPhase(state);
  box(c, a, GY, b - a, TANK.depth + 400, '#1E293B');
  box(c, a, GY, 10, TANK.depth, '#64748B'); box(c, b - 10, GY, 10, TANK.depth, '#64748B');
  // (the dump tank: up on its tower behind the far end, tipping for the surge)
  const tx = b - 120, rock = t >= TANK.warn && t < TANK.surgeEnd ? Math.sin(t * 0.5) * 0.08 + (t >= TANK.surge ? 0.6 : 0) : 0;
  for (const lx of [tx - 50, tx + 50]) box(c, lx - 4, GY - 300, 8, 300, '#57534E');
  c.save(); c.translate(tx, GY - 330); c.rotate(-rock);
  box(c, -70, -50, 140, 80, '#000'); box(c, -68, -48, 136, 76, '#475569'); box(c, -68, -48, 136, 4, '#94A3B8');
  c.restore();
  if (t >= TANK.warn && t < TANK.surge && t % 20 < 10) { box(c, tx - 6, GY - 400, 12, 12, '#EF4444'); }
};
export const drawFloodFront = (c: Ctx, state: GameState) => {
  const a = X(TANK.a), b = X(TANK.b);
  if (b < state.camera.x - 200 || a > state.camera.x + 1000) return;
  const t = floodPhase(state), lvl = surgeLevel(t), f = state.frame;
  const top = GY + 30 - Math.max(0, lvl + 30);
  c.fillStyle = 'rgba(56, 132, 180, 0.75)'; c.fillRect(a + 4, top, b - a - 8, GY + TANK.depth - top);
  c.fillStyle = '#BAE6FD';
  for (let x = a + 4; x < b - 4; x += 16) c.fillRect(x, top + Math.sin(x * 0.05 + f * 0.15) * 2, 10, 3);
  if (lvl > 0) for (let k = 0; k < 6; k++) { c.fillStyle = 'rgba(240, 249, 255, 0.8)'; c.beginPath(); c.arc(a + ((k * 157 + f * 3) % (b - a)), top, 8 + (k % 3) * 4, 0, Math.PI * 2); c.fill(); }
};
