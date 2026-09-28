// Victor's stage hazards:
//
//   lava:      the pools and the river. Step in it and you're sent flying with
//              a hot foot (it hurts a lot); it only kills you if that's the
//              last of your health. Anything else that ends up in it cooks.
//   vents:     cracks in the rock that smoke and glow, then erupt in a column of
//              fire (and spouts that come up out of the lava the same way).
//   bombs:     lumps of the volcano lobbed down out of the sky: a ring on the
//              ground where one's coming down, then a blast. Taught out ahead
//              of you on open ground, then they come at you.
//   jets:      nozzles in the shaft walls: a glow and a hiss, then a long jet
//              of flame straight across.
//   fire bars: a bar of fireballs spinning round a pivot in the shaft.
//   rafts:     slabs of rock drifting along the lava river; they carry you.
//
// Hazards hurt the enemies too (a skilled player can shove them into them).

import type { Block, Enemy } from '../../../types';
import type { FrameContext } from '../../context';
import type { GameState } from '../../state';
import { shakeScreen } from '../../state';
import { hurtPlayer } from '../../bosses/shared';
import { playSound } from '../../audio';
import { rectsOverlap, boundsOf, isOnScreen } from '../../utils';
import { COURSE, isLava } from './course';

export interface Bomb { x: number; ground: number; t: number }
export interface Raft { lane: number; block: Block; x: number; t: number }
export interface Hazards {
  bombs: Bomb[];
  bombTimers: number[];
  rafts: Raft[];
  /** What last hurt him here (for the death message), and when. */
  lastCause: string;
  lastCauseAt: number;
  /** When he last dipped a foot in the lava. */
  lavaAt: number;
}

export const BOMB_WARN = 70, BOMB_BLAST = 18, BOMB_RADIUS = 70;
const BOMB_DAMAGE = 18, BOMB_ENEMY_DAMAGE = 80;
export const VENT_WARN = 50, VENT_BURN = 60, VENT_HEIGHT = 230, VENT_HALF_WIDTH = 20;
const VENT_DAMAGE = 14;
export const JET_WARN = 40, JET_BURN = 55;
const JET_DAMAGE = 14;
const BAR_DAMAGE = 12;
const LAVA_DAMAGE = 22, LAVA_LAUNCH = 15;
/** How long a raft sits under the lava at the far end before it comes up again at the start. */
export const RAFT_UNDER = 60;

export const createHazards = (state: GameState): Hazards => {
  const rafts: Raft[] = [];
  COURSE.rafts.forEach((lane, li) => {
    const span = lane.x2 - lane.x1 - lane.w;
    for (let i = 0; i < lane.count; i++) {
      const x = lane.x1 + (span * i) / lane.count;
      const block: Block = { x, y: lane.y, w: lane.w, h: 16, type: 'platform', hidden: true, oneWay: true, tag: `raft-${li}-${i}` };
      rafts.push({ lane: li, block, x, t: 0 });
      state.blocks.push(block);
    }
  });
  return { bombs: [], bombTimers: COURSE.bombs.map(() => 80), rafts, lastCause: '', lastCauseAt: -999, lavaAt: -999 };
};

const hurt = (ctx: FrameContext, hz: Hazards, dmg: number, cause: string, kb: { x: number; y: number }) => {
  if (ctx.state.player.invincibilityTimer > 0) return;
  hz.lastCause = cause; hz.lastCauseAt = ctx.state.frame;
  hurtPlayer(ctx, dmg, cause, kb);
};

/** An enemy caught in a hazard: it takes the damage, and cooks if that's the end of it. */
const burnEnemy = (ctx: FrameContext, e: Enemy, dmg: number) => {
  e.health -= dmg;
  ctx.fx.spawnDamageNumber(e.pos, dmg, dmg >= 50);
  if (e.health <= 0) ctx.fx.killWithAnimation(e, 'charred', 'flamethrower_kill', 'cooked');
};

/** Enemies that can be caught (not the doorman, not a fish under the lava, only on screen). */
const catchable = (state: GameState, e: Enemy) =>
  e.health > 0 && !e.isBlownAway && e.type !== 'boss' && e.kind !== 'doorman' && e.kind !== 'magmafish' && isOnScreen(state.camera, e);

// ---------------------------------------------------------------------------

export const updateHazards = (ctx: FrameContext, hz: Hazards) => {
  updateRafts(ctx.state, hz);
  updateLava(ctx, hz);
  updateVents(ctx, hz);
  updateBombs(ctx, hz);
  updateJets(ctx, hz);
  updateBars(ctx, hz);
};

/** Where the lava's surface is under x (null if it's not lava there). */
export const lavaAt = (state: GameState, x: number) => {
  const r = state.groundRuns.find(g => isLava(g) && x > g.x1 && x < g.x2);
  return r ? r.y1 : null;
};

const updateLava = (ctx: FrameContext, hz: Hazards) => {
  const { state } = ctx;
  const p = state.player;
  const feet = p.pos.y + p.height, cx = p.pos.x + p.width / 2;
  const surface = lavaAt(state, cx);
  if (surface !== null && feet >= surface - 2 && state.deathTimer <= 0) {
    // HOT FOOT: straight back up out of it
    p.vel.y = -LAVA_LAUNCH;
    p.isGrounded = false;
    p.isCharging = false; p.isSliding = false;
    // (still flashing from a hit: it bounces you all the same, but it doesn't burn)
    if (p.invincibilityTimer <= 0) {
      hz.lavaAt = state.frame;
      hz.lastCause = 'lava'; hz.lastCauseAt = state.frame;
      hurtPlayer(ctx, LAVA_DAMAGE, 'lava', { x: p.vel.x * 0.5, y: -LAVA_LAUNCH });
      ctx.fx.spawnDamageNumber({ x: cx - 30, y: p.pos.y - 20 }, 'HOT FOOT!', true, '#F97316');
    }
    p.vel.y = -LAVA_LAUNCH;
    for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: cx, y: surface }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 6 }, life: 26, color: i % 2 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 4 });
    playSound('ignite');
  }
  // Anything else that ends up in it cooks (a fish is at home in it)
  for (const e of state.enemies) {
    if (e.kind === 'magmafish' || e.health <= 0 || e.isBlownAway || e.kind === 'doorman') continue;
    const s = lavaAt(state, e.pos.x + e.width / 2);
    if (s !== null && e.pos.y + e.height >= s - 2) {
      e.health = 0;
      ctx.fx.killWithAnimation(e, 'charred', 'flamethrower_kill', 'cooked');
    }
  }
};

/** Where a vent is in its cycle: smoking (the warning), erupting, or quiet. */
export const ventPhase = (v: { period: number; phase: number }, frame: number) => {
  const t = (frame + v.phase) % (v.period + VENT_WARN + VENT_BURN);
  return { warning: t >= v.period && t < v.period + VENT_WARN, burning: t >= v.period + VENT_WARN, t: t - v.period };
};

const updateVents = (ctx: FrameContext, hz: Hazards) => {
  const { state } = ctx;
  const p = state.player;
  for (const v of COURSE.vents) {
    const ph = ventPhase(v, state.frame);
    if (!ph.burning) continue;
    const col = { x: v.x - VENT_HALF_WIDTH, y: v.y - VENT_HEIGHT, w: VENT_HALF_WIDTH * 2, h: VENT_HEIGHT };
    if (ph.t === VENT_WARN && isOnScreen(state.camera, { pos: { x: col.x, y: col.y }, width: col.w, height: col.h })) playSound('flame');
    if (rectsOverlap(col, boundsOf(p))) hurt(ctx, hz, VENT_DAMAGE, v.lava ? 'lava_spout' : 'vent', { x: (p.pos.x + p.width / 2 < v.x ? -1 : 1) * 5, y: -12 });
    for (const e of state.enemies) if (catchable(state, e) && rectsOverlap(col, boundsOf(e)) && state.frame % 6 === 0) burnEnemy(ctx, e, 12);
  }
};

const updateBombs = (ctx: FrameContext, hz: Hazards) => {
  const { state, fx } = ctx;
  const p = state.player;
  const px = p.pos.x + p.width / 2;
  COURSE.bombs.forEach((z, i) => {
    if (px < z.x1 - 200 || px > z.x2) return;
    if (--hz.bombTimers[i] > 0) return;
    hz.bombTimers[i] = z.every + Math.floor(Math.random() * 50);
    // Aimed: where he's headed; the lesson ones land well out ahead of him. Either way, not on top of
    // one of Victor's own lot (a few tries at a clear spot, or it holds off)
    const clear = (x: number) => !state.enemies.some(e => e.health > 0 && !e.isBlownAway && e.kind !== 'magmafish' && Math.abs(e.pos.x + e.width / 2 - x) < BOMB_RADIUS + e.width / 2 + 30);
    for (let tries = 0; tries < 5; tries++) {
      const spread = tries * 70 * (tries % 2 ? 1 : -1);
      const x = (z.aimed ? px + p.vel.x * 25 + (Math.random() - 0.5) * 80 : px + 240 + Math.random() * 160) + spread;
      const ground = groundAt(state, x);
      if (ground === null || lavaAt(state, x) !== null || !clear(x)) continue;
      hz.bombs.push({ x, ground, t: 0 });
      break;
    }
  });
  hz.bombs = hz.bombs.filter(b => {
    b.t++;
    if (b.t === BOMB_WARN) {
      // Impact
      playSound('nuke');
      shakeScreen(state, 12, 6);
      fx.spawnExplosion({ x: b.x, y: b.ground - 10 }, '#F97316', 16, 0, 12);
      fx.spawnExplosion({ x: b.x, y: b.ground - 10 }, '#1C1917', 10, 0, 10);
      const blast = { x: b.x - BOMB_RADIUS, y: b.ground - BOMB_RADIUS * 1.4, w: BOMB_RADIUS * 2, h: BOMB_RADIUS * 1.4 };
      if (rectsOverlap(blast, boundsOf(p))) hurt(ctx, hz, BOMB_DAMAGE, 'lava_bomb', { x: (px < b.x ? -1 : 1) * 8, y: -9 });
      for (const e of state.enemies) if (catchable(state, e) && rectsOverlap(blast, boundsOf(e))) burnEnemy(ctx, e, BOMB_ENEMY_DAMAGE);
    }
    return b.t < BOMB_WARN + BOMB_BLAST;
  });
};

const groundAt = (state: GameState, x: number) => {
  let best: number | null = null;
  for (const r of state.groundRuns) if (x > r.x1 && x < r.x2) { const y = r.y1 + ((x - r.x1) / (r.x2 - r.x1)) * (r.y2 - r.y1); if (best === null || y < best) best = y; }
  return best;
};

export const jetPhase = (j: { period: number; phase: number }, frame: number) => {
  const t = (frame + j.phase) % (j.period + JET_WARN + JET_BURN);
  return { warning: t >= j.period && t < j.period + JET_WARN, burning: t >= j.period + JET_WARN, t: t - j.period };
};

const updateJets = (ctx: FrameContext, hz: Hazards) => {
  const { state } = ctx;
  const p = state.player;
  for (const j of COURSE.jets) {
    const ph = jetPhase(j, state.frame);
    if (!ph.burning) continue;
    const box = { x: j.dir > 0 ? j.x : j.x - j.len, y: j.y - 16, w: j.len, h: 32 };
    if (ph.t === JET_WARN && Math.abs(j.y - (p.pos.y + p.height / 2)) < 500) playSound('flame');
    if (rectsOverlap(box, boundsOf(p))) hurt(ctx, hz, JET_DAMAGE, 'flamejet', { x: j.dir * 7, y: -6 });
    for (const e of state.enemies) if (catchable(state, e) && rectsOverlap(box, boundsOf(e)) && state.frame % 6 === 0) burnEnemy(ctx, e, 12);
  }
};

/** The fireballs on a bar right now. */
export const barBalls = (b: { x: number; y: number; len: number; speed: number; phase: number }, frame: number) => {
  const a = frame * b.speed + b.phase;
  const out: { x: number; y: number }[] = [];
  for (let d = 0; d <= b.len; d += 22) out.push({ x: b.x + Math.cos(a) * d, y: b.y + Math.sin(a) * d });
  return out;
};

const updateBars = (ctx: FrameContext, hz: Hazards) => {
  const { state } = ctx;
  const pb = boundsOf(state.player);
  for (const b of COURSE.bars) {
    if (Math.abs(b.y - state.player.pos.y) > 400) continue;
    for (const f of barBalls(b, state.frame)) {
      if (rectsOverlap({ x: f.x - 9, y: f.y - 9, w: 18, h: 18 }, pb)) { hurt(ctx, hz, BAR_DAMAGE, 'firebar', { x: (state.player.pos.x + 22 < b.x ? -1 : 1) * 6, y: -7 }); break; }
    }
  }
};

/** The rafts drift downstream; standing on one, you go with it. At the far end it goes under and comes up again at the start. */
const updateRafts = (state: GameState, hz: Hazards) => {
  const p = state.player;
  for (const r of hz.rafts) {
    const lane = COURSE.rafts[r.lane];
    const b = r.block;
    const on = p.isGrounded && p.pos.x + p.width > b.x && p.pos.x < b.x + b.w && Math.abs(p.pos.y + p.height - b.y) < 3;
    if (r.t > 0) {
      // Under the lava, coming round again
      r.t++;
      if (r.t > RAFT_UNDER) { r.t = 0; r.x = lane.x1; }
      b.y = lane.y + 400;
      continue;
    }
    const dx = lane.speed;
    r.x += dx;
    // Sinking at the far end: down it goes (and anyone on it)
    const sink = Math.max(0, (r.x + lane.w - (lane.x2 - 10)) / 40);
    b.x = r.x;
    b.y = lane.y + sink * 26 + Math.sin(state.frame * 0.06 + r.lane * 2 + r.x * 0.01) * 2;
    if (on) { p.pos.x += dx; p.pos.y = b.y - p.height; }
    if (sink >= 1) r.t = 1;
  }
};

/** A death message for how he just died here, if a hazard did it. */
export const hazardDeathMessage = (state: GameState, hz: Hazards): string | undefined => {
  if (state.frame - hz.lastCauseAt > 20) return undefined;
  const pick = (l: string[]) => l[Math.floor(Math.random() * l.length)];
  switch (hz.lastCause) {
    case 'lava': return pick(['MELTED', 'HOT FOOT, COLD BODY', 'SOUP OF THE DAY: MEAT']);
    case 'lava_bomb': return pick(['HIT BY A LAVA BOMB', 'THE VOLCANO SPAT ON YOU']);
    case 'vent': case 'lava_spout': return pick(['FLAME BROILED', 'VENTED']);
    case 'flamejet': return pick(['FLAME BROILED', 'WELL DONE']);
    case 'firebar': return pick(['SPIT ROASTED', 'BAR-B-QUED']);
    default: return undefined;
  }
};
