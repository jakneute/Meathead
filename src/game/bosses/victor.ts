// Victor Volcano: jumps, lands, then opens magma vents on a wall and the floor.
// His weakness, the tsunami, turns the vents into steam (see systems/hazards.ts).

import { Enemy, Projectile, Rect, Volcano } from '../../types';
import { ARENA_LEFT, ARENA_RIGHT, BOSS_DOOR_X, STAGE_WIDTH, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y } from '../../constants';
import { VICTOR_LINES } from '../../dialogue';
import type { FrameContext } from '../context';
import { pickRandom, rectsOverlap, boundsOf } from '../utils';
import { BossDef, FLOOR_Y, midX, hurtPlayer, speakAsBoss } from './shared';
import { startVolcanoFinale } from '../volcanoFinale';

const VICTOR = 'Victor Volcano';
/** A corked vent holds for this long, then blows (long enough to cork the other two of a set). */
export const CORK_FUSE = 330;
const CORK_BLAST_RADIUS = 110;
const CORK_BLAST_DAMAGE = 25;

const TELEGRAPH_FRAMES = 60;
const ERUPTION_FRAMES = 180;
const REST_FRAMES = 40;
const VENT_MIN_GAP_FROM_VICTOR = 150;
const VENT_MIN_GAP = 100;

const update = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  const helpers = ctx.bossHelpers;
  switch (boss.bossState) {
    case 'attacking':
      // Vents erupting; rest once they've all gone quiet
      boss.vel.x = 0;
      if (state.bossVolcanoes.length === 0 && boss.stateTimer! <= 0) { boss.bossState = 'idle'; boss.stateTimer = REST_FRAMES; }
      break;
    case 'telegraphing':
      boss.vel.x = 0;
      // Counts the warnings down (the renderer builds them up as they near zero)
      state.bossVolcanoTelegraphs.forEach(t => { if (t.life > 0) t.life--; });
      if (boss.stateTimer! <= 0) {
        boss.bossState = 'attacking';
        boss.stateTimer = ERUPTION_FRAMES;
        state.bossVolcanoTelegraphs.forEach(t => helpers.addVolcano({ pos: t.pos, life: ERUPTION_FRAMES, type: t.type, setId: state.frame }));
        helpers.clearVolcanoTelegraphs();
      }
      break;
    case 'jumping':
      if (boss.isGroundedBoss) telegraphVents(ctx, boss);
      break;
    default:
      if (boss.stateTimer! <= 0) jump(ctx, boss);
  }
  if (boss.isGroundedBoss) boss.vel.x *= 0.95;
};

/** Just landed: mark a wall vent (alternating sides) and one or two floor vents. */
const telegraphVents = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  const helpers = ctx.bossHelpers;
  boss.bossState = 'telegraphing';
  boss.stateTimer = TELEGRAPH_FRAMES;
  helpers.clearVolcanoTelegraphs();

  const side = (state.victorWallSide + 1) % 2;
  helpers.setVictorWallSide(side);
  helpers.addVolcanoTelegraph({ pos: { x: side === 0 ? BOSS_DOOR_X : STAGE_WIDTH, y: 250 + Math.random() * 200 }, life: TELEGRAPH_FRAMES, type: 'wall' });

  // More floor vents below half health, kept away from Victor and each other
  const healthPct = (boss.health / boss.maxHealth) * 100;
  const count = healthPct > 50 ? 1 : 2;
  const placed: number[] = [];
  for (let i = 0; i < count; i++) {
    let x = 0;
    for (let attempt = 0; attempt < 20; attempt++) {
      x = BOSS_DOOR_X + 150 + Math.random() * 500;
      if (Math.abs(x - midX(boss)) > VENT_MIN_GAP_FROM_VICTOR && placed.every(p => Math.abs(x - p) >= VENT_MIN_GAP)) break;
    }
    placed.push(x);
    helpers.addVolcanoTelegraph({ pos: { x: Math.max(BOSS_DOOR_X + 50, Math.min(ARENA_RIGHT - 60, x)), y: FLOOR_Y }, life: TELEGRAPH_FRAMES, type: 'ground' });
  }
};

/** Jumps for a platform if there is one, otherwise toward Meathead. */
const jump = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  boss.vel.y = -20 - Math.random() * 5;
  const platforms = state.blocks.filter(b => b.type === 'platform' && b.x > BOSS_DOOR_X);
  if (platforms.length > 0) {
    const target = platforms[Math.floor(Math.random() * platforms.length)];
    boss.vel.x = (target.x + target.w / 2 - midX(boss)) * 0.04;
  } else {
    boss.vel.x = (state.player.pos.x < boss.pos.x ? -1 : 1) * 4 + (Math.random() - 0.5) * 2;
  }
  boss.bossState = 'jumping';
  boss.stateTimer = 60;
};

// ---------------------------------------------------------------------------
// Corking the vents with boulders
// ---------------------------------------------------------------------------

/** Where a vent's cone sits (what a boulder has to hit to jam it). */
const ventBox = (v: Volcano): Rect => {
  if (v.type === 'ground') return { x: v.pos.x - 42, y: FLOOR_Y - 56, w: 84, h: 56 };
  const left = v.pos.x < (ARENA_LEFT + ARENA_RIGHT) / 2;
  return { x: left ? ARENA_LEFT : ARENA_RIGHT - 64, y: v.pos.y - 44, w: 64, h: 88 };
};

/**
 * One of Meathead's boulders jamming into an erupting vent: it stops spitting
 * magma, but only until the pressure blows the cork. Mostly a waste of a
 * boulder (and Victor says so)... unless it's the whole set, with him half dead.
 */
export const tryCorkVent = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  const box = boundsOf(p);
  const vent = state.bossVolcanoes.find(v => !v.corked && rectsOverlap(box, ventBox(v)));
  if (!vent) return false;
  vent.corked = true;
  vent.fuse = CORK_FUSE;
  vent.life = Math.min(ERUPTION_FRAMES - 12, Math.max(vent.life, 60)); // frozen fully risen and hot
  ctx.fx.spawnRockShatter({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 });
  ctx.fx.playGunSound('gun');
  state.screenShakeTimer = Math.max(state.screenShakeTimer, 10);

  // The rest of its set keep erupting (building pressure) until this one blows
  const set = state.bossVolcanoes.filter(v => v.setId === vent.setId);
  for (const v of set) if (!v.corked) v.life = Math.max(v.life, CORK_FUSE);

  const boss = state.enemies.find(e => e.type === 'boss' && e.health > 0);
  const allCorked = set.length >= 3 && set.every(v => v.corked);
  if (boss && allCorked && boss.health <= boss.maxHealth / 2) {
    startVolcanoFinale(ctx);
    return true;
  }
  if (boss && (state.victorCorkTauntAt === undefined || state.frame - state.victorCorkTauntAt > 180)) {
    state.victorCorkTauntAt = state.frame;
    speakAsBoss(VICTOR, pickRandom(VICTOR_LINES.CORKED), ctx.bossHelpers);
  }
  return true;
};

/** A corked vent: no magma, just rumbling and smoke as the pressure builds, then the cork blows. Returns false once it's gone. */
export const updateCorkedVent = (ctx: FrameContext, v: Volcano): boolean => {
  const { state, fx } = ctx;
  v.fuse = (v.fuse || 0) - 1;
  const box = ventBox(v);
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const urgency = 1 - v.fuse / CORK_FUSE;
  if (state.frame % Math.max(2, Math.round(8 - urgency * 6)) === 0) {
    state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 30, y: cy - 10 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 - urgency * 2 }, life: 26, color: Math.random() > 0.5 ? '#5D4037' : '#8D6E63', size: 5 + Math.random() * 6 });
  }
  if (v.fuse > 0) return true;

  // The cork blows: a burst of rock and magma that hurts anyone close
  for (const c of ['#FF6D00', '#FFD600', '#5D4037']) fx.spawnExplosion({ x: cx, y: cy }, c, 18, 0, 16);
  fx.spawnRockShatter({ x: cx, y: cy });
  fx.playGunSound('tsunami');
  state.screenShakeTimer = 20;
  const { player } = state;
  const dx = player.pos.x + player.width / 2 - cx, dy = player.pos.y + player.height / 2 - cy;
  if (dx * dx + dy * dy < CORK_BLAST_RADIUS * CORK_BLAST_RADIUS && player.invincibilityTimer <= 0 && !ctx.cheats.invincible) {
    hurtPlayer(ctx, CORK_BLAST_DAMAGE, 'fire', { x: (dx < 0 ? -1 : 1) * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y });
  }
  return false;
};

export const victor: BossDef = {
  id: 'Victor Volcano',
  weakness: 'TSUNAMI',
  weaknessDamage: 150,
  spawn: { x: 7700 },
  update,
  // He stays 'jumping' when he lands so update() can open the vents
  physics: { landingEndsJump: false },
};
