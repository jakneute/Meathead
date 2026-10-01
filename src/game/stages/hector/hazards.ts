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
//   the water: you swim in it; stay under too long and you drown (you've a
//              generous lungful), and lightning striking the water you're in
//              kills you outright.
//
// Hazards hurt the enemies too (lightning fries them, debris bowls them over,
// the live water cooks them).

import type { Block } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { lastHurtWas } from '../../core/deathCause';
import { shakeScreen } from '../../core/state';
import { hurtPlayer } from '../../bosses/shared';
import { SWIM_LEAP, PLAYER_GRAVITY, GROUND_Y } from '../../../constants';
import { playSound } from '../../platform/audio';
import { floorTopAt } from '../../core/terrain';
import { rectsOverlap, boundsOf, isOnScreen } from '../../core/utils';
import { COURSE } from './course';
import { killPlayer, skipDying } from '../../player/player';

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
  /** Air left (1 full, 0 drowning), and frames since he started drowning (0 = not). */
  o2: number;
  drownT: number;
  /** Where he went under for the last time. */
  drownAt: { x: number; y: number; surface: number } | null;
  /** Lightning's just hit the water: which stretch of it, and frames since. */
  zap: { x1: number; x2: number; surface: number; bottom: number; t: number } | null;
  splashAt: number;
  /** Frames he's been in the water in the storm (enough and the lightning finds him). */
  wetT: number;
  /** How red each body of water is (0 clear .. 1), from what the gators have been eating. */
  blood: Record<number, number>;
}

export const STRIKE_WARN = 55, STRIKE_FLASH = 10;
/** A bolt coming down on the water gives you this much longer to get out (it starts counting from below zero). */
const WATER_EXTRA_WARN = 50;
const STRIKE_DAMAGE = 16, STRIKE_ENEMY_DAMAGE = 90, STRIKE_HALF_WIDTH = 26;
const DEBRIS_WARN = 45, DEBRIS_DAMAGE = 10;
const SHOCK_DAMAGE = 8, SHOCK_WARN = 40;
export const AWNING_BOUNCE = 17.5;
/** Frames of air: a good 20 seconds under before he runs out; it comes back four times as fast. */
const O2_FRAMES = 1200, O2_REFILL = 4;
/** How long the drowning plays before it's over (he keeps floating there after). */
export const DROWN_FRAMES = 170;

export const createHazards = (state: GameState): Hazards => {
  const floatBlocks = COURSE.floats.map((f, i): Block => ({ x: f.x, y: f.y, w: f.w, h: 16, type: 'platform', hidden: true, oneWay: true, tag: `float-${i}` }));
  const awningBlocks = state.blocks.filter(b => b.tag?.startsWith('awning-'));
  state.blocks.push(...floatBlocks);
  return {
    strikes: [], strikeTimers: COURSE.strikes.map(() => 60), scorches: [],
    debris: [], debrisTimers: COURSE.debris.map(() => 40),
    floatBlocks, awningBlocks, awningWobble: awningBlocks.map(() => 0),
    lastCause: '', lastCauseAt: -999,
    water: waterZones(state),
    o2: 1, drownT: 0, drownAt: null, zap: null, splashAt: -999, wetT: 0, blood: {},
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
  updateDrowning(ctx, hz);
  if (hz.zap && ++hz.zap.t > 30) hz.zap = null;
  updateFloats(state, hz);
  updateAwnings(ctx, hz);
  if (stormy) {
    updateLightning(ctx, hz);
    updateDebris(ctx, hz);
  }
  updateShocks(ctx, hz);
  updateSwimming(ctx, hz);
  hz.scorches = hz.scorches.filter(s => ++s.t < 400);
  updateBloodyWater(state, hz);
};

/** How fast the water reddens round a gator's meal, and how slowly it clears (a good long while). */
const BLOOD_RISE = 0.015, BLOOD_CLEAR = 0.0006;

/** Wherever a gator's rolling somebody under, that whole body of water goes red, and takes its time clearing. */
const updateBloodyWater = (state: GameState, hz: Hazards) => {
  for (const k of Object.keys(hz.blood)) hz.blood[+k] = Math.max(0, hz.blood[+k] - BLOOD_CLEAR);
  for (const g of state.enemies) {
    if (g.kind !== 'gator' || g.aiState !== 'chomp') continue;
    const z = hz.water.find(w => g.pos.x + g.width / 2 > w.x1 && g.pos.x + g.width / 2 < w.x2);
    if (z) hz.blood[z.body] = Math.min(1, (hz.blood[z.body] || 0) + BLOOD_RISE);
  }
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
    // (one boing per landing: a shoulder charge holds him level, so without this it'd boing every frame he's over it)
    if (!on || hz.awningWobble[i] > 12) return;
    // Boing (and that's the end of any charge or slide: he's going up)
    player.isCharging = false; player.isSliding = false;
    player.vel.y = -AWNING_BOUNCE;
    player.isGrounded = false;
    player.squash = -0.6;
    hz.awningWobble[i] = 24;
    ctx.fx.playGunSound('jump');
    ctx.fx.spawnDamageNumber({ x: player.pos.x - 10, y: b.y - 20 }, 'BOING!', false, '#FDE047');
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
    // Aimed: where he's headed; the lesson ones land out ahead of him on open ground.
    // (While he's swimming they're not aimed at him: every so often one just hits the water somewhere near, and the water crackles first)
    const swimming = player.swimming && z.aimed;
    if (swimming) hz.strikeTimers[i] += z.every;
    const x = swimming ? px + (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 260)
      : z.aimed ? px + player.vel.x * 22 + (Math.random() - 0.5) * 60 : px + 260 + Math.random() * 140;
    // (over the water it comes down on the surface; and it only goes for the water when he's in it)
    const wet = waterAt(hz, x);
    if (wet && !player.swimming) return;
    // (and it tries not to come down on anybody else)
    if (state.enemies.some(e => e.health > 0 && !e.isBlownAway && !e.innocent && Math.abs(e.pos.x + e.width / 2 - x) < STRIKE_HALF_WIDTH + e.width / 2 + 30)) return;
    hz.strikes.push({ x, ground: wet ? wet.surface : groundAt(state, x), t: wet ? -WATER_EXTRA_WARN : 0 });
  });
  // In the water too long: one comes down on it (on the open water nearest him, if he's under a dock)
  const inWater = swimmingIn(hz, player);
  hz.wetT = inWater && hz.drownT <= 0 ? hz.wetT + 1 : 0;
  if (inWater && hz.wetT >= WET_LIMIT) {
    hz.wetT = 0;
    const open = hz.water.filter(z => z.body === inWater.body && !z.underDock);
    const near = open.sort((a, b) => Math.abs((a.x1 + a.x2) / 2 - px) - Math.abs((b.x1 + b.x2) / 2 - px))[0];
    if (near) {
      const x = Math.max(near.x1 + 30, Math.min(near.x2 - 30, px));
      hz.strikes.push({ x, ground: near.surface, t: -WATER_EXTRA_WARN });
    }
  }
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
      // Into the water: the whole body of water lights up (under the docks too), and anything swimming in it is cooked
      const wet = waterAt(hz, s.x);
      if (wet) {
        const all = bodyExtent(hz, wet.body);
        hz.zap = { ...all, t: 0 };
        if (swimmingIn(hz, player)?.body === wet.body && state.deathTimer <= 0 && hz.drownT <= 0) {
          hz.lastCause = 'zapped'; hz.lastCauseAt = state.frame;
          const lines = ['ELECTROCUTED IN THE WATER', 'NEVER SWIM IN A LIGHTNING STORM', 'SEAFOOD BOIL', 'SHOCKINGLY STUPID'];
          killPlayer(ctx, lines[Math.floor(Math.random() * lines.length)]);
        }
        // (the gators only get cooked along with him)
        if (swimmingIn(hz, player)?.body === wet.body) for (const e of state.enemies) {
          const ex = e.pos.x + e.width / 2;
          if (e.health <= 0 || e.isBlownAway || e.innocent || ex < all.x1 || ex > all.x2 || e.pos.y + e.height < all.surface + 4) continue;
          e.health = 0;
          fx.killWithAnimation(e, 'fried', 'taser_kill', 'fried');
        }
      }
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
      // Fried where they stand: sparks crawling over them, a jolt, the damage ticking up
      e.health -= 2;
      e.hitFlash = 2;
      if (state.frame % 3 === 0) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 10, color: Math.random() > 0.5 ? '#FDE047' : '#E0FFFF', size: 2 + Math.random() * 3 });
      if (state.frame % 12 === 0) { fx.spawnDamageNumber({ x: e.pos.x + e.width / 2, y: e.pos.y - 10 }, 24, false, '#FDE047'); e.pos.x += (Math.random() - 0.5) * 4; }
      if (e.health <= 0) fx.killWithAnimation(e, 'fried', 'taser_kill', 'fried');
    }
  });
};

/** Where the water is: the sea under the piers and docks and out past the marina, and the motel pool. */
export interface WaterZone {
  x1: number; x2: number; surface: number; bottom: number; leap: number;
  /** Stretches that run into each other (the gaps and the water under the docks between them) are one body of water. */
  body: number;
  /** Under a dock (you can swim there, but lightning comes down on the open water, not through the boards). */
  underDock?: boolean;
}
/** How deep the sea is under the docks. */
export const SEA_DEPTH = 230;

/** The body of water at (x, y), if any: every stretch that runs into it, as one (the sea's clean water; so's the pool). */
export const waterBodyAt = (state: GameState, x: number, y: number) => {
  const zones = waterZones(state);
  const z = zones.find(w => x > w.x1 && x < w.x2 && y > w.surface - 12 && y < w.bottom);
  if (!z) return null;
  const all = zones.filter(w => w.body === z.body);
  return { key: `sea-${z.body}`, x1: Math.min(...all.map(w => w.x1)), x2: Math.max(...all.map(w => w.x2)), surface: z.surface, bottom: z.bottom, kind: 'clean' as const };
};

export const waterZones = (state: GameState): WaterZone[] => {
  const zones: WaterZone[] = [];
  state.groundRuns.forEach((r, i) => {
    if (r.pitAfter === 'water') {
      const next = state.groundRuns[i + 1];
      zones.push({ x1: r.x2, x2: next && next.x1 > r.x2 ? next.x1 : COURSE.sea.x2, surface: COURSE.sea.y, bottom: COURSE.sea.y + SEA_DEPTH, leap: SWIM_LEAP, body: 0 });
    }
    if (r.surface === 'dock') {
      // The docks stand on pilings in the sea: the water carries on under them
      zones.push({ x1: r.x1, x2: r.x2, surface: COURSE.sea.y, bottom: COURSE.sea.y + SEA_DEPTH, leap: SWIM_LEAP, body: 0, underDock: true });
    } else if (r.surface === 'pool') {
      // (a shallow pool: just enough of a hop to get back up over the edge onto the lot)
      const rise = r.y1 - GROUND_Y + 30;
      zones.push({ x1: r.x1, x2: r.x2, surface: COURSE.sea.y, bottom: r.y1, leap: -Math.sqrt(2 * PLAYER_GRAVITY * rise) * 0.6, body: 0 });
    }
  });
  // Which ones run into each other
  zones.sort((a, b) => a.x1 - b.x1);
  zones.forEach((z, i) => { const prev = zones[i - 1]; z.body = prev && z.x1 <= prev.x2 + 1 && prev.surface === z.surface ? prev.body : i; });
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
  p.swimLeap = zone?.leap;
  // (just in: no bolt comes down on the water for a couple of seconds at least)
  if (p.swimming && !was) hz.strikeTimers = hz.strikeTimers.map(t => Math.max(t, 150));
  if (p.swimming && !was && p.vel.y > 3 && state.frame - hz.splashAt > 40) {
    // Splash (a real one: falling in, not bobbing at the surface)
    hz.splashAt = state.frame;
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: cx, y: zone!.surface }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 5 }, life: 26, color: i % 2 ? '#E0F2FE' : '#7DD3FC', size: 3 + Math.random() * 4 });
    ctx.fx.playGunSound('splash');
  }
  if (p.swimming && state.frame % 14 === 0) state.particles.push({ pos: { x: p.pos.x + p.width / 2 + p.facing * 8, y: p.pos.y + 10 }, vel: { x: 0, y: -1.2 }, life: 40, color: 'rgba(224, 242, 254, 0.8)', size: 3 });
  // Holding his breath while his head's under
  if (hz.drownT > 0 || state.deathTimer > 0) return;
  if (headUnder(p)) {
    hz.o2 = Math.max(0, hz.o2 - 1 / O2_FRAMES);
    if (hz.o2 < 0.25 && state.frame % 20 === 0) playSound('beep');
    if (hz.o2 <= 0) {
      // Out of air
      hz.drownT = 1;
      hz.drownAt = { x: p.pos.x, y: p.pos.y, surface: zone?.surface ?? COURSE.sea.y };
      p.hidden = true;
      p.vel = { x: 0, y: 0 };
      p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false;
    }
  } else hz.o2 = Math.min(1, hz.o2 + O2_REFILL / O2_FRAMES);
};

/** His head's under the water. */
export const headUnder = (p: GameState['player']) => !!p.swimming && p.pos.y + 6 > (p.swimSurfaceY ?? Infinity);

/** Drowning: he flails, blows out the last of his air, goes limp and floats up belly first. Then it's over. */
const updateDrowning = (ctx: FrameContext, hz: Hazards) => {
  const { state } = ctx;
  const p = state.player;
  if (hz.drownT <= 0) return;
  hz.drownT++;
  p.hidden = true;
  p.vel = { x: 0, y: 0 };
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  if (hz.drownAt) p.pos = { x: hz.drownAt.x, y: hz.drownAt.y };
  if (hz.drownT === 40) playSound('glug');
  const lines = ['FEEDING THE FISHES', 'SHOULD HAVE TAKEN SWIM LESSONS', 'FORGOT TO BREATHE', 'GLUB GLUB GLUB'];
  if (hz.drownT < DROWN_FRAMES && skipDying(ctx, hz.drownT, () => lines[Math.floor(Math.random() * lines.length)])) { hz.lastCause = 'drowned'; hz.lastCauseAt = state.frame; return; }
  if (hz.drownT === DROWN_FRAMES && state.deathTimer <= 0) {
    hz.lastCause = 'drowned'; hz.lastCauseAt = state.frame;
    killPlayer(ctx, lines[Math.floor(Math.random() * lines.length)], false);
  }
};

/** Where a bolt coming down at x hits the water (if it does: not through a dock). */
const waterAt = (hz: Hazards, x: number) => hz.water.find(z => !z.underDock && x > z.x1 && x < z.x2);

/** The whole body of water a stretch belongs to: its extent, top to bottom. */
export const bodyExtent = (hz: Hazards, body: number) => {
  const zs = hz.water.filter(z => z.body === body);
  return { x1: Math.min(...zs.map(z => z.x1)), x2: Math.max(...zs.map(z => z.x2)), surface: zs[0].surface, bottom: Math.max(...zs.map(z => z.bottom)) };
};

/** The stretch of water he's swimming in (if he is). */
const swimmingIn = (hz: Hazards, p: GameState['player']) => {
  if (!p.swimming) return undefined;
  const cx = p.pos.x + p.width / 2;
  return hz.water.find(z => cx > z.x1 && cx < z.x2);
};

/** Stay in the water in the storm this long and a bolt comes down on it (warned, as ever). */
const WET_LIMIT = 360;

/** A death message for how he just died here, if a hazard did it. */
export const hazardDeathMessage = (state: GameState, hz: Hazards): string | undefined => {
  if (!lastHurtWas(state, hz.lastCauseAt)) return undefined;
  const pick = (l: string[]) => l[Math.floor(Math.random() * l.length)];
  switch (hz.lastCause) {
    case 'lightning': return pick(['STRUCK BY LIGHTNING', 'EXTRA CRISPY', 'GOD HATES YOU SPECIFICALLY']);
    case 'debris': return pick(['KILLED BY A BEACH CHAIR', 'DEATH BY PATIO FURNITURE']);
    case 'shock': return pick(['ELECTROCUTED IN A PARKING LOT', 'SHOCKING.']);
    default: return undefined;
  }
};
