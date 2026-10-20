// The cartoon White House's hazards (a kids' show's: milder than the cat-and-mouse knockoff's anvils and dynamite later
// on), each hurting the mean men as well as him (none of them idles in one: hazard zones), each with a readable rhythm:
//
//   THE RUNAWAY VACUUM   an upright 1990s vacuum with nobody pushing it, roaring up and down the Cross Hall's carpet,
//                        stopping at each end to wheeze (its bag sags) and come back. In front of it, it drags him
//                        toward it; run into, it sucks him in and spits him out (hurt). Jump it.
//   JUST WAXED           the East Room's parquet: a slick (state.groundOil): no stopping, or starting, in a hurry.
//   THE CHANDELIER       swinging on its chain from the East Room's ceiling: a moving platform (a one-way ledge on its
//                        top ring), off the Steinway, up over the chair stack and back.
//   THE BOWLING BALLS    out of the bowling lane's ball return on the second floor's landing (the pins clatter and its
//                        light goes first: the tell), bouncing down the Grand Staircase step by step and along the
//                        floor at the bottom into the return grate. Jump them.
//   THE ROSE BUSHES      thorns: into one, he's thrown up out of it, hurt.
//   THE SPRINKLERS       pop up out of the lawn (a sputter: the tell), then a column of water: cats hate water.
//
// And what the mean men throw (a lobbyist's money bag, a pollster's clipboard, the blimp's stink bomb and its cloud).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { hazardHit, hazardVictims, setHazardZones, boxHits } from '../../hazardHit';
import { envSound } from '../../bossQuiet';
import { whOf, type Ball } from './state';
import { VACUUM, WAX, CHANDELIER, BALL_RETURN, BALL_GRATE, ROSES, SPRINKLERS, SPRINKLE_PERIOD, STAIRS, F2, floorAt, X, Y } from './layout';
import { GY } from '../geometry';

const alive = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const overlaps = (state: GameState, x: number, y: number, w: number, h: number) => { const p = state.player; return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y; };
const away = (state: GameState, x: number) => (state.player.pos.x + state.player.width / 2 < x ? -1 : 1);
/** A hazard's hit on one of the cast (not every frame: once a while each). */
const castHit = (ctx: FrameContext, e: Enemy, dmg: number, fromX: number, call: string, gap = 50, knock = 9) => {
  const s = whOf(ctx.state), at = s.hazHit.get(e) ?? -999;
  if (ctx.state.frame - at < gap) return;
  s.hazHit.set(e, ctx.state.frame);
  hazardHit(ctx, e, dmg, fromX, call, { knock });
};

// ---------------------------------------------------------------------------------------------------------------
// The vacuum

export const VAC_W = 50, VAC_H = 52, VAC_SPEED = 3.2, VAC_PULL = 230;
/** The vacuum's box (world). */
export const vacBox = (state: GameState) => { const v = whOf(state).vac; return { x: v.x - VAC_W / 2, y: GY - VAC_H, w: VAC_W, h: VAC_H }; };
const updateVacuum = (ctx: FrameContext) => {
  const { state } = ctx, v = whOf(state).vac, p = state.player;
  if (v.x === 0) v.x = X(VACUUM.a + 40);
  if (v.pause > 0) { v.pause--; v.bag = Math.max(0, v.bag - 0.03); }
  else {
    v.x += v.dir * VAC_SPEED; v.bag = Math.min(1, v.bag + 0.04);
    if ((v.dir > 0 && v.x > X(VACUUM.b)) || (v.dir < 0 && v.x < X(VACUUM.a))) { v.dir = (v.dir > 0 ? -1 : 1); v.pause = 46; envSound(state, v.x, 'thud', 0.4, -4); }
  }
  if (v.pause === 0 && state.frame % 14 === 0) envSound(state, v.x, 'suck', 0.35, 4);
  const b = vacBox(state);
  setHazardZones(state, 'ct-wh-vacuum', [{ x0: b.x - 50, x1: b.x + b.w + 50, y0: b.y, y1: GY + 2, ground: true }]);
  // (in front of it, on the floor, near enough: dragged toward the nozzle)
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (alive(state) && v.pause === 0 && p.isGrounded && Math.abs(feet - GY) < 6) {
    const d = (cx - v.x) * v.dir;
    if (d > 0 && d < VAC_PULL) { p.pos.x -= v.dir * (1.3 * (1 - d / VAC_PULL) + 0.4); if (state.frame % 6 === 0) state.particles.push({ pos: { x: cx, y: feet - 30 + Math.random() * 20 }, vel: { x: -v.dir * 4, y: 0 }, life: 10, color: 'rgba(226, 232, 240, 0.8)', size: 2 }); }
  }
  // (run into: sucked in, spat out)
  if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, b.x, b.y, b.w, b.h)) {
    hurtPlayer(ctx, 12, 'm2:ct_vacuum', { x: v.dir * 7, y: -9 });
    v.hitAt = state.frame; playSound('suck', 0.8, -6); playSound('boing', 0.5, 2);
    for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: cx, y: p.pos.y + 30 }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 3 }, life: 26, color: ['#26232E', '#3D3849', '#F6F2E9'][i % 3], size: 2 + Math.random() * 2, grav: 0.2 } as typeof state.particles[number]);
  }
  for (const e of hazardVictims(state)) if (boxHits(e, b.x, b.y, b.w, b.h)) castHit(ctx, e, 999, v.x, 'HOOVERED!');
};

// ---------------------------------------------------------------------------------------------------------------
// The chandelier

/** Where its top ring is (world) at frame f, and its swing angle. */
export const chandelierAt = (f: number) => {
  const a = CHANDELIER.amp * Math.sin((f / CHANDELIER.period) * Math.PI * 2);
  return { x: X(CHANDELIER.x) + Math.sin(a) * CHANDELIER.len, y: Y(CHANDELIER.pivotH) + Math.cos(a) * CHANDELIER.len, a };
};
export const makeChandelier = (state: GameState) => {
  const c = whOf(state).chand, at = chandelierAt(state.frame);
  const b: Block = { x: at.x - CHANDELIER.w / 2, y: at.y, w: CHANDELIER.w, h: 12, type: 'platform', oneWay: true, hidden: true, tag: 'ct-wh-chandelier' } as Block;
  state.blocks.push(b);
  c.b = b; c.x = at.x; c.y = at.y;
};
const onChandelier = (state: GameState) => {
  const c = whOf(state).chand, p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  return !!c.b && p.health > 0 && p.vel.y >= 0 && Math.abs(feet - c.b.y) <= 3 && cx >= c.b.x - 4 && cx <= c.b.x + c.b.w + 4;
};
const updateChandelier = (state: GameState) => {
  const c = whOf(state).chand, p = state.player;
  if (!c.b) return;
  const on = onChandelier(state), at = chandelierAt(state.frame);
  c.on = on;
  if (on) { p.pos.x += at.x - c.x; p.pos.y += at.y - c.y; }
  // (the crystals tinkling at the ends of its swing)
  const prev = chandelierAt(state.frame - 1).a, prev2 = chandelierAt(state.frame - 2).a;
  if ((at.a - prev) * (prev - prev2) < 0) envSound(state, at.x, 'tinkle', 0.25, 10);
  c.x = at.x; c.y = at.y; c.b.x = at.x - CHANDELIER.w / 2; c.b.y = at.y;
};
export const ridingChandelier = (state: GameState) => whOf(state).chand.on && onChandelier(state);

// ---------------------------------------------------------------------------------------------------------------
// The bowling balls

export const BALL_R = 13;
/** Where the floor's top is under a ball at world x (on the stairs, step by step). */
const ballFloor = (x: number) => {
  const rx = x - X(0);
  if (rx > STAIRS.a && rx < STAIRS.b) {
    const stepW = (STAIRS.b - STAIRS.a) / STAIRS.steps, k = Math.floor((rx - STAIRS.a) / stepW) + 1;
    return Y(Math.min(F2, (k * F2) / STAIRS.steps));
  }
  return Y(floorAt(rx));
};
const updateBalls = (ctx: FrameContext) => {
  const { state } = ctx, s = whOf(state), p = state.player, rx = p.pos.x + p.width / 2 - X(0);
  const active = rx > 6250 && rx < 7900 && alive(state);
  if (active) {
    s.ballT--;
    if (s.ballT === 36) { s.ballTell = 36; envSound(state, X(BALL_RETURN), 'clink', 0.5, 4); envSound(state, X(BALL_RETURN), 'clang', 0.25, 14); }
    if (s.ballT <= 0) {
      s.ballT = 105 + Math.floor(Math.random() * 45);
      s.balls.push({ x: X(BALL_RETURN) - 30, y: Y(F2) - BALL_R, vx: -2.6, vy: 0, spin: 0, t: 0 });
      envSound(state, X(BALL_RETURN), 'thud', 0.5, -8); envSound(state, X(BALL_RETURN), 'rumble', 0.3, 6);
    }
  }
  if (s.ballTell > 0) s.ballTell--;
  for (const b of s.balls) {
    b.t++;
    const rbx = b.x - X(0);
    // (down the stairs it gathers speed; along the bottom it rolls on, slowing a touch)
    const onStairs = rbx > STAIRS.a && rbx < STAIRS.b;
    b.vx = onStairs ? Math.max(-5.2, b.vx - 0.06) : rbx <= STAIRS.a ? Math.min(-3.6, b.vx + 0.01) : b.vx;
    b.x += b.vx; b.spin += b.vx / BALL_R;
    const fl = ballFloor(b.x) - BALL_R;
    b.vy += 0.6; b.y += b.vy;
    if (b.y >= fl) {
      // (it thumps down each step: a little bounce off the tread)
      if (b.vy > 2.2) { envSound(state, b.x, 'thud', Math.min(0.35, b.vy * 0.06), 6); b.vy = -b.vy * 0.32; } else b.vy = 0;
      b.y = fl;
    }
    if (b.t % 16 === 0 && !onStairs) envSound(state, b.x, 'rumble', 0.12, 12);
    // (into the grate at the bottom: gone)
    if (rbx > BALL_GRATE[0] && rbx < BALL_GRATE[1] && rbx < STAIRS.a) { b.dead = true; envSound(state, b.x, 'clang', 0.5, -2); continue; }
    if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, b.x - BALL_R + 3, b.y - BALL_R + 3, BALL_R * 2 - 6, BALL_R * 2 - 6)) {
      hurtPlayer(ctx, 12, 'm2:ct_bowling', { x: Math.sign(b.vx) * 5, y: -7 });
      playSound('thud', 0.9, -6);
    }
    for (const e of hazardVictims(state)) if (boxHits(e, b.x - BALL_R, b.y - BALL_R, BALL_R * 2, BALL_R * 2)) { castHit(ctx, e, 70, b.x - b.vx * 10, 'STRIKE!', 40, 10); playSound('crash', 0.5, 8); }
    if (b.x < X(6300)) b.dead = true;
  }
  s.balls = s.balls.filter(b => !b.dead);
};

// ---------------------------------------------------------------------------------------------------------------
// The garden: the roses, the sprinklers

/** How a sprinkler's going at frame f: 'off', 'tell' (popped up, sputtering), 'spray'; and how far into it. */
export const sprinklerAt = (phase: number, f: number) => {
  const t = (((f / SPRINKLE_PERIOD) + phase) % 1 + 1) % 1;
  if (t < 0.16) return { st: 'tell' as const, k: t / 0.16 };
  if (t < 0.52) return { st: 'spray' as const, k: (t - 0.16) / 0.36 };
  return { st: 'off' as const, k: 0 };
};
export const SPRAY_H = 150, SPRAY_W = 26, ROSE_H = 42;
const updateGarden = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  setHazardZones(state, 'ct-wh-garden', [
    ...ROSES.map(([a, b]) => ({ x0: X(a), x1: X(b), y0: GY - ROSE_H, y1: GY + 2, ground: true })),
    ...SPRINKLERS.map(([x]) => ({ x0: X(x) - SPRAY_W, x1: X(x) + SPRAY_W, y0: GY - SPRAY_H, y1: GY + 2, ground: true })),
  ]);
  for (const [a, b] of ROSES) {
    const x = X(a), w = b - a;
    if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, x + 6, GY - ROSE_H + 8, w - 12, ROSE_H - 8)) {
      hurtPlayer(ctx, 10, 'm2:ct_roses', { x: away(state, x + w / 2) * 4, y: -11 });
      playSound('crunch', 0.5, 10);
      for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: GY - 30 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 3 }, life: 30, color: i % 2 ? '#F43F5E' : '#16A34A', size: 2.5, grav: 0.2 } as typeof state.particles[number]);
    }
    for (const e of hazardVictims(state)) if (boxHits(e, x + 6, GY - ROSE_H + 8, w - 12, ROSE_H - 8)) castHit(ctx, e, 45, x + w / 2, 'THORNED!', 50, 7);
  }
  for (const [rx, ph] of SPRINKLERS) {
    const x = X(rx), s = sprinklerAt(ph, state.frame);
    if (s.st === 'tell' && state.frame % 10 === 0) envSound(state, x, 'glug', 0.2, 10);
    if (s.st !== 'spray') continue;
    if (state.frame % 12 === 0) envSound(state, x, 'splash', 0.18, 8);
    const h = SPRAY_H * Math.min(1, s.k * 5);
    if (state.frame % 2 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 12, y: GY - h }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 24, color: Math.random() < 0.5 ? '#BAE6FD' : '#E0F2FE', size: 2 + Math.random() * 2, grav: 0.25 } as typeof state.particles[number]);
    if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, x - SPRAY_W / 2, GY - h, SPRAY_W, h)) {
      hurtPlayer(ctx, 7, 'm2:ct_sprinkler', { x: away(state, x) * 7, y: -6 });
      playSound('splash', 0.7, 4);
    }
    for (const e of hazardVictims(state)) if (boxHits(e, x - SPRAY_W / 2, GY - h, SPRAY_W, h)) castHit(ctx, e, 25, x, 'SOAKED!', 60, 8);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// What the mean men throw

const burst = (state: GameState, x: number, y: number, cols: string[], n: number, spread = 5) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * spread, y: -1.5 - Math.random() * 3 }, life: 30 + Math.random() * 20, color: cols[i % cols.length], size: 2.5 + Math.random() * 2, grav: 0.15 } as typeof state.particles[number]);
};
const wallAt = (state: GameState, x: number, y: number) => state.blocks.some(b => !b.oneWay && b.type !== 'platform' && b.type !== 'pit' && x > b.x && x < b.x + b.w && y > b.y + 2 && y < b.y + b.h);
export const updateThrows = (ctx: FrameContext) => {
  const { state } = ctx, s = whOf(state), p = state.player;
  for (const t of s.throws) {
    t.t++;
    if (t.kind === 'cloud') {
      // (a green fug lying there: hurts while he's in it, a while)
      if (t.t % 8 === 0) state.particles.push({ pos: { x: t.x + (Math.random() - 0.5) * 50, y: t.y - 10 - Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 0.6, y: -0.5 }, life: 30, color: 'rgba(132, 204, 22, 0.5)', size: 6 });
      if (t.t < 100 && alive(state) && p.invincibilityTimer <= 0 && overlaps(state, t.x - 36, t.y - 56, 72, 56)) { hurtPlayer(ctx, 7, 'm2:ct_stinkbomb_shot', { x: away(state, t.x) * 3, y: -3 }); playSound('fart', 0.4, 6); }
      if (t.t > 110) t.dead = true;
      continue;
    }
    if (t.kind === 'bills') { if (t.t > 60) t.dead = true; continue; }
    if (t.kind === 'clipboard') {
      // (flat, spinning, straight at him)
      t.x += t.vx; t.vy += 0.02; t.y += t.vy;
      if (t.t % 8 === 0) envSound(state, t.x, 'whoosh', 0.1, 16);
      if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, t.x - 10, t.y - 5, 20, 10)) {
        hurtPlayer(ctx, 8, 'm2:ct_clipboard_shot', { x: Math.sign(t.vx || 1) * 6, y: -4 });
        burst(state, t.x, t.y, ['#F8FAFC', '#A16207'], 8); envSound(state, t.x, 'crack', 0.5, 8); t.dead = true; continue;
      }
      const top = floorTopAt(state.blocks, t.x, t.y - 4, 0);
      if (wallAt(state, t.x, t.y) || (top !== null && t.y >= top) || t.t > 150) { burst(state, t.x, t.y, ['#F8FAFC', '#A16207'], 8); envSound(state, t.x, 'crack', 0.4, 10); t.dead = true; }
      continue;
    }
    // (lobbed: the money bag, the stink bomb)
    t.vy += t.kind === 'stinkbomb' ? 0.25 : 0.32; t.x += t.vx; t.y += t.vy;
    if (t.kind === 'moneybag' && t.t % 4 === 0) state.particles.push({ pos: { x: t.x, y: t.y }, vel: { x: 0, y: 0.3 }, life: 16, color: '#86EFAC', size: 2 });
    if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, t.x - 8, t.y - 8, 16, 16)) {
      if (t.kind === 'moneybag') { hurtPlayer(ctx, 9, 'm2:ct_moneybag_shot', { x: Math.sign(t.vx || 1) * 5, y: -4 }); burst(state, t.x, t.y, ['#86EFAC', '#4ADE80', '#FDE68A'], 14, 7); envSound(state, t.x, 'slam', 0.4, 8); }
      else { hurtPlayer(ctx, 8, 'm2:ct_stinkbomb_shot', { x: 0, y: -3 }); s.throws.push({ kind: 'cloud', x: t.x, y: p.pos.y + p.height, vx: 0, vy: 0, t: 0, from: null }); envSound(state, t.x, 'fart', 0.6, 0); }
      t.dead = true; continue;
    }
    const top = t.vy > 0 ? floorTopAt(state.blocks, t.x, t.y - t.vy - 2, 0) : null;
    if ((top !== null && t.y >= top) || wallAt(state, t.x, t.y) || t.t > 200) {
      t.dead = true;
      const fy = top ?? t.y;
      if (t.kind === 'moneybag') { burst(state, t.x, fy - 4, ['#86EFAC', '#4ADE80', '#FDE68A'], 14, 7); envSound(state, t.x, 'slam', 0.3, 10); s.throws.push({ kind: 'bills', x: t.x, y: fy, vx: 0, vy: 0, t: 0, from: null }); }
      else { envSound(state, t.x, 'fart', 0.6, -2); s.throws.push({ kind: 'cloud', x: t.x, y: fy, vx: 0, vy: 0, t: 0, from: null }); }
    }
  }
  s.throws = s.throws.filter(t => !t.dead);
};

// ---------------------------------------------------------------------------------------------------------------

/** Each frame, first thing (before he moves: the chandelier carries him). */
export const updateHazards = (ctx: FrameContext) => {
  updateChandelier(ctx.state);
  updateVacuum(ctx);
  updateBalls(ctx);
  updateGarden(ctx);
  updateThrows(ctx);
};
/** The wax: a slick along the East Room's floor (the engine's own slick: him and the cast both slide on it). */
export const layWax = (state: GameState) => {
  state.groundOil = [...(state.groundOil ?? []).filter(o => !(o as { wax?: boolean }).wax), { x1: X(WAX[0]), x2: X(WAX[1]), kind: 'slick', wax: true } as NonNullable<GameState['groundOil']>[number]];
};
export type { Ball };
