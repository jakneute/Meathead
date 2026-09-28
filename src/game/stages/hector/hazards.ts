// The storm's hazards on Hector's stage:
//
//   lightning: a ring flickers on the ground (and the clouds over it churn) for
//              a second, then the bolt comes down on it. Taught out on the open
//              sand landing well ahead of you, then it starts aiming.
//   debris:    beach chairs, umbrellas, trash cans blown in from the right; an
//              arrow at the edge of the screen shows the height it's coming at.
//              Jump the low ones, duck the high ones, or shoot them apart.
//   shock:     flooded ground a downed power line keeps electrifying: it
//              buzzes and sparks for a moment before it goes live.
//   awnings:   land on one and it bounces you way up (so does a trampoline in
//              the storm tower).
//   floats:    docks bobbing on the swell; they carry you up and down.
//   the sea:   fall in the water and it's over.
//
// Hazards hurt the enemies too (lightning fries them, debris bowls them over,
// the live water cooks them).

import type { Block, Enemy } from '../../../types';
import type { FrameContext } from '../../context';
import type { GameState } from '../../state';
import { shakeScreen } from '../../state';
import { hurtPlayer } from '../../bosses/shared';
import { playSound } from '../../audio';
import { floorTopAt } from '../../terrain';
import { rectsOverlap, boundsOf, isOnScreen } from '../../utils';
import { COURSE } from './course';

export interface Strike { x: number; ground: number; t: number }
export interface Debris { x: number; y: number; vx: number; rot: number; look: 'chair' | 'umbrella' | 'trashcan' | 'cooler'; size: number; warn: number }
export interface Hazards {
  strikes: Strike[];
  strikeTimers: number[];
  /** Scorch marks where it hit. */
  scorches: { x: number; y: number; t: number }[];
  debris: Debris[];
  debrisTimers: number[];
  floatBlocks: Block[];
  awningBlocks: Block[];
  /** Frames each awning's still wobbling after a bounce. */
  awningWobble: number[];
  /** What last hurt him here (for the death message), and when. */
  lastCause: string;
  lastCauseAt: number;
  water: WaterZone[];
}

export const STRIKE_WARN = 55, STRIKE_FLASH = 10;
const STRIKE_DAMAGE = 16, STRIKE_ENEMY_DAMAGE = 90, STRIKE_HALF_WIDTH = 26;
const DEBRIS_WARN = 45, DEBRIS_DAMAGE = 10;
const SHOCK_DAMAGE = 8, SHOCK_WARN = 40;
export const AWNING_BOUNCE = 17.5;

export const createHazards = (state: GameState): Hazards => {
  const floatBlocks = COURSE.floats.map((f, i): Block => ({ x: f.x, y: f.y, w: f.w, h: 16, type: 'platform', hidden: true, tag: `float-${i}` }));
  const awningBlocks = state.blocks.filter(b => b.tag?.startsWith('awning-'));
  state.blocks.push(...floatBlocks);
  return {
    strikes: [], strikeTimers: COURSE.strikes.map(() => 60), scorches: [],
    debris: [], debrisTimers: COURSE.debris.map(() => 40),
    floatBlocks, awningBlocks, awningWobble: awningBlocks.map(() => 0),
    lastCause: '', lastCauseAt: -999,
    water: waterZones(state),
  };
};

const hurt = (ctx: FrameContext, hz: Hazards, dmg: number, cause: string, kb: { x: number; y: number }) => {
  if (ctx.state.player.invincibilityTimer > 0) return;
  hz.lastCause = cause; hz.lastCauseAt = ctx.state.frame;
  hurtPlayer(ctx, dmg, cause, kb);
};

/** Is the shock zone live right now (or about to be)? */
export const shockPhase = (z: { on: number; off: number; phase: number }, frame: number) => {
  const t = (frame + z.phase) % (z.on + z.off);
  return { live: t < z.on, warning: t >= z.on + z.off - SHOCK_WARN };
};

export const updateHazards = (ctx: FrameContext, hz: Hazards, stormy: boolean) => {
  const { state } = ctx;
  updateFloats(state, hz);
  updateAwnings(ctx, hz);
  if (stormy) {
    updateLightning(ctx, hz);
    updateDebris(ctx, hz);
  }
  updateShocks(ctx, hz);
  updateSwimming(ctx, hz);
  hz.scorches = hz.scorches.filter(s => ++s.t < 400);
};

// ---------------------------------------------------------------------------

const updateFloats = (state: GameState, hz: Hazards) => {
  const { player } = state;
  COURSE.floats.forEach((f, i) => {
    const b = hz.floatBlocks[i];
    const y = f.y + Math.sin(((state.frame + f.phase) / f.period) * Math.PI * 2) * f.amp;
    const dy = y - b.y;
    // Standing on it: ride it up and down
    const on = player.isGrounded && player.pos.x + player.width > b.x && player.pos.x < b.x + b.w && Math.abs(player.pos.y + player.height - b.y) < 3;
    b.y = y;
    if (on) player.pos.y += dy;
    for (const e of state.enemies) if (e.pos.x + e.width > b.x && e.pos.x < b.x + b.w && Math.abs(e.pos.y + e.height - (b.y - dy)) < 3) e.pos.y += dy;
  });
};

const updateAwnings = (ctx: FrameContext, hz: Hazards) => {
  const { player } = ctx.state;
  hz.awningBlocks.forEach((b, i) => {
    if (hz.awningWobble[i] > 0) hz.awningWobble[i]--;
    const on = player.vel.y >= 0 && player.pos.x + player.width > b.x && player.pos.x < b.x + b.w && Math.abs(player.pos.y + player.height - b.y) < 4;
    if (!on) return;
    // Boing
    player.vel.y = -AWNING_BOUNCE;
    player.isGrounded = false;
    player.squash = -0.6;
    hz.awningWobble[i] = 24;
    ctx.fx.playGunSound('oil');
  });
};

// ---------------------------------------------------------------------------

const groundAt = (state: GameState, x: number) => floorTopAt(state.blocks, x, state.camera.y - 200, 0) ?? 550;

const updateLightning = (ctx: FrameContext, hz: Hazards) => {
  const { state, fx } = ctx;
  const { player } = state;
  const px = player.pos.x + player.width / 2;
  COURSE.strikes.forEach((z, i) => {
    if (px < z.x1 - 200 || px > z.x2) return;
    if (--hz.strikeTimers[i] > 0) return;
    hz.strikeTimers[i] = z.every + Math.floor(Math.random() * 40);
    // Aimed: where he's headed; the lesson ones land out ahead of him on open ground
    const x = z.aimed ? px + player.vel.x * 22 + (Math.random() - 0.5) * 60 : px + 260 + Math.random() * 140;
    hz.strikes.push({ x, ground: groundAt(state, x), t: 0 });
  });
  hz.strikes = hz.strikes.filter(s => {
    s.t++;
    if (s.t === STRIKE_WARN) {
      // The bolt
      playSound('thunder');
      shakeScreen(state, 10, 6);
      hz.scorches.push({ x: s.x, y: s.ground, t: 0 });
      for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: s.x, y: s.ground - 4 }, vel: { x: (Math.random() - 0.5) * 10, y: -Math.random() * 8 }, life: 20 + Math.random() * 15, color: i % 2 ? '#FDE047' : '#F8FAFC', size: 2 + Math.random() * 4 });
      const col = { x: s.x - STRIKE_HALF_WIDTH, y: s.ground - 900, w: STRIKE_HALF_WIDTH * 2, h: 900 };
      if (rectsOverlap(col, boundsOf(player))) hurt(ctx, hz, STRIKE_DAMAGE, 'lightning', { x: (player.pos.x + player.width / 2 < s.x ? -1 : 1) * 6, y: -8 });
      for (const e of state.enemies) {
        if (e.health <= 0 || e.isBlownAway || e.type === 'boss' || e.kind === 'eye' || e.innocent || !isOnScreen(state.camera, e) || !rectsOverlap(col, boundsOf(e))) continue;
        e.health -= STRIKE_ENEMY_DAMAGE;
        fx.spawnDamageNumber(e.pos, STRIKE_ENEMY_DAMAGE, true);
        if (e.health <= 0) fx.killWithAnimation(e, 'fried', 'taser_kill', 'fried');
      }
    }
    return s.t < STRIKE_WARN + STRIKE_FLASH;
  });
};

// ---------------------------------------------------------------------------

const DEBRIS_LOOKS: Debris['look'][] = ['chair', 'umbrella', 'trashcan', 'cooler'];

const updateDebris = (ctx: FrameContext, hz: Hazards) => {
  const { state, fx } = ctx;
  const { player } = state;
  const px = player.pos.x + player.width / 2;
  COURSE.debris.forEach((z, i) => {
    if (px < z.x1 || px > z.x2) return;
    if (--hz.debrisTimers[i] > 0) return;
    hz.debrisTimers[i] = z.every + Math.floor(Math.random() * 50);
    const h = z.heights[Math.floor(Math.random() * z.heights.length)];
    const look = h > 40 ? 'umbrella' : DEBRIS_LOOKS[Math.floor(Math.random() * DEBRIS_LOOKS.length)];
    const size = look === 'umbrella' ? 40 : 30;
    // It shows up as a warning at the right edge first, at the height it'll come through
    const ground = groundAt(state, px);
    hz.debris.push({ x: state.camera.x + 800 + 60, y: ground - h - size / 2, vx: -(9 + Math.random() * 2), rot: 0, look, size, warn: DEBRIS_WARN });
  });
  hz.debris = hz.debris.filter(d => {
    if (d.warn > 0) { d.warn--; d.x = state.camera.x + 800 + 60; return true; }
    d.x += d.vx;
    d.rot += d.vx * 0.04;
    const box = { x: d.x - d.size / 2, y: d.y - d.size / 2, w: d.size, h: d.size };
    // Shot apart
    const shot = state.projectiles.find(p => p.owner === 'player' && rectsOverlap(boundsOf(p), box));
    if (shot) { if (!shot.isTsunami && !shot.isBoulder) shot.health = 0; smash(state, d); return false; }
    if (rectsOverlap(box, boundsOf(player)) && !(player.isDucking && d.y + d.size / 2 < player.pos.y + 30)) {
      hurt(ctx, hz, DEBRIS_DAMAGE, 'debris', { x: -8, y: -5 });
      smash(state, d);
      return false;
    }
    // It bowls over whoever's in its way
    for (const e of state.enemies) {
      if (e.health <= 0 || e.isBlownAway || e.type === 'boss' || e.kind === 'eye' || e.innocent || !isOnScreen(state.camera, e) || !rectsOverlap(box, boundsOf(e))) continue;
      e.health -= 45; fx.spawnDamageNumber(e.pos, 45);
      if (e.health <= 0) { fx.blowAwayEnemy(e, { x: -12, y: -8 }, 'charge_kill'); fx.spawnKillCallout(e, 'crush'); }
      else { e.vel.x = -8; e.pauseTimer = 25; }
      smash(state, d);
      return false;
    }
    return d.x > state.camera.x - 200;
  });
};

const smash = (state: GameState, d: Debris) => {
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: d.x, y: d.y }, vel: { x: (Math.random() - 0.5) * 8 + d.vx * 0.3, y: -Math.random() * 6 }, life: 25, color: ['#F8FAFC', '#F43F5E', '#94A3B8', '#FACC15'][i % 4], size: 3 + Math.random() * 4 });
};

// ---------------------------------------------------------------------------

const updateShocks = (ctx: FrameContext, hz: Hazards) => {
  const { state, fx } = ctx;
  const { player } = state;
  COURSE.shocks.forEach(z => {
    const { live } = shockPhase(z, state.frame);
    if (!live) return;
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: z.x1 + Math.random() * (z.x2 - z.x1), y: z.y - 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -2 - Math.random() * 3 }, life: 10, color: Math.random() > 0.5 ? '#FDE047' : '#E0FFFF', size: 2 + Math.random() * 2 });
    const feet = player.pos.y + player.height;
    const cx = player.pos.x + player.width / 2;
    if (player.isGrounded && cx > z.x1 && cx < z.x2 && Math.abs(feet - z.y) < 4) hurt(ctx, hz, SHOCK_DAMAGE, 'shock', { x: 0, y: -9 });
    for (const e of state.enemies) {
      if (e.health <= 0 || e.isBlownAway || e.type === 'boss' || e.kind === 'eye' || e.innocent || e.enemyType === 'flyer' || !isOnScreen(state.camera, e)) continue;
      const ex = e.pos.x + e.width / 2;
      if (ex < z.x1 || ex > z.x2 || Math.abs(e.pos.y + e.height - z.y) > 4) continue;
      e.health -= 2;
      if (e.health <= 0) fx.killWithAnimation(e, 'fried', 'taser_kill', 'fried');
    }
  });
};

/** Where the water is: the sea under the piers and docks and out past the marina, and the motel pool. */
export interface WaterZone { x1: number; x2: number; surface: number; bottom: number }
/** How deep the sea is under the docks. */
export const SEA_DEPTH = 230;

export const waterZones = (state: GameState): WaterZone[] => {
  const zones: WaterZone[] = [];
  state.groundRuns.forEach((r, i) => {
    if (r.pitAfter === 'water') {
      const next = state.groundRuns[i + 1];
      zones.push({ x1: r.x2, x2: next && next.x1 > r.x2 ? next.x1 : COURSE.sea.x2, surface: COURSE.sea.y, bottom: COURSE.sea.y + SEA_DEPTH });
    } else if (r.surface === 'pool') zones.push({ x1: r.x1, x2: r.x2, surface: COURSE.sea.y, bottom: r.y1 });
  });
  return zones;
};

/** In the water: he swims (and bubbles). */
const updateSwimming = (ctx: FrameContext, hz: Hazards) => {
  const { state } = ctx;
  const p = state.player;
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  const zone = hz.water.find(z => cx > z.x1 && cx < z.x2 && cy > z.surface);
  const was = p.swimming;
  p.swimming = !!zone && !p.skiing && !p.inCutscene;
  p.swimSurfaceY = zone?.surface;
  if (p.swimming && !was) {
    // Splash
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: cx, y: zone!.surface }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 5 }, life: 26, color: i % 2 ? '#E0F2FE' : '#7DD3FC', size: 3 + Math.random() * 4 });
    ctx.fx.playGunSound('tsunami');
  }
  if (p.swimming && state.frame % 14 === 0) state.particles.push({ pos: { x: p.pos.x + p.width / 2 + p.facing * 8, y: p.pos.y + 10 }, vel: { x: 0, y: -1.2 }, life: 40, color: 'rgba(224, 242, 254, 0.8)', size: 3 });
};

/** A death message for how he just died here, if a hazard did it. */
export const hazardDeathMessage = (state: GameState, hz: Hazards): string | undefined => {
  if (state.frame - hz.lastCauseAt > 20) return undefined;
  const pick = (l: string[]) => l[Math.floor(Math.random() * l.length)];
  switch (hz.lastCause) {
    case 'lightning': return pick(['STRUCK BY LIGHTNING', 'EXTRA CRISPY', 'GOD HATES YOU SPECIFICALLY']);
    case 'debris': return pick(['KILLED BY A BEACH CHAIR', 'DEATH BY PATIO FURNITURE']);
    case 'shock': return pick(['ELECTROCUTED IN A PARKING LOT', 'SHOCKING.']);
    default: return undefined;
  }
};

export const enemiesIn = (state: GameState, x1: number, x2: number): Enemy[] => state.enemies.filter(e => e.pos.x + e.width > x1 && e.pos.x < x2);
