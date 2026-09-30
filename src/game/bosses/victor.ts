// Victor Volcano: jumps, lands, then opens magma vents on a wall and the floor. Between times he barfs fire: a stream
// out of his mouth right across the arena, wall to wall, that swings round after you, slowly: get round the other
// side of him (over him) and it has to come all the way round to find you again.
// His weakness, the tsunami, turns the vents into steam (see bosses/hazards.ts).

import { Enemy, Projectile, Rect, Volcano } from '../../types';
import { ARENA_LEFT, ARENA_RIGHT, BOSS_DOOR_X, STAGE_WIDTH, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y } from '../../constants';
import { VICTOR_LINES } from '../../content/dialogue';
import type { FrameContext } from '../core/context';
import { pickRandom, rectsOverlap, boundsOf } from '../core/utils';
import { BossDef, FLOOR_Y, midX, hurtPlayer, speakAsBoss } from './shared';
import { startVolcanoFinale } from '../scenes/volcanoFinale';

const VICTOR = 'Victor Volcano';
/** A corked vent holds for this long, then blows (long enough to cork the other two of a set). */
export const CORK_FUSE = 330;
const CORK_BLAST_RADIUS = 180;
const CORK_BLAST_DAMAGE = 35;   // corking is a trap, not a strategy: standing near one when it blows really hurts

const TELEGRAPH_FRAMES = 60;
const ERUPTION_FRAMES = 180;
const REST_FRAMES = 40;
const VENT_MIN_GAP_FROM_VICTOR = 150;
const VENT_MIN_GAP = 100;

/**
 * The fire barf: how often he goes for it instead of a jump (when it's ready); the gurgling wind-up (no fire yet); how
 * long the stream goes for; how far it reaches (right across the arena: it stops at the walls and the floor); how fast
 * it swings round after you (radians a frame: slow, so getting round the other side of him buys you a while); what it
 * does; and how long before he can do it again.
 */
/** How far from either wall he has to be to barf (backed up against one, there's no getting round behind him). */
const BARF_WALL_CLEARANCE = 170;
const BARF_CHANCE = 0.5, BARF_WINDUP = 45, BARF_FRAMES = 220, BARF_REACH = 900, BARF_TURN = 0.0085, BARF_DAMAGE = 12, BARF_COOLDOWN = 300;
/** How wide the stream is: at his mouth, and how much it spreads over its length. */
export const BARF_WIDTH = { base: 10, spread: 30 };
/** Where his mouth is (the stream comes out of it). */
export const victorMouth = (e: Enemy) => ({ x: e.pos.x + e.width * 0.5, y: e.pos.y + e.height * 0.33 });

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
    case 'barfing':
      barf(ctx, boss);
      break;
    default: {
      // Rested: the barf (when it's ready, about half the time), or up for the next jump and the vents
      if (boss.stateTimer! > 0) break;
      const clear = boss.pos.x - ARENA_LEFT > BARF_WALL_CLEARANCE && ARENA_RIGHT - (boss.pos.x + boss.width) > BARF_WALL_CLEARANCE;
      if (boss.isGroundedBoss && clear && state.frame >= (boss.barfReadyAt ?? 0) && Math.random() < BARF_CHANCE) startBarf(ctx, boss);
      else jump(ctx, boss);
    }
  }
  if (boss.isGroundedBoss) boss.vel.x *= 0.95;
};

const BARF_LINES = ["FEEL THE HEAT, MEATHEAD!", "NOWHERE TO RUN, BRO!", "LAST CALL! IT'S ON FIRE!", "EVERYBODY OUT OF MY CLUB!"];

const startBarf = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  boss.bossState = 'barfing';
  boss.barfT = 0; boss.barfLen = 0;
  const m = victorMouth(boss), p = state.player;
  boss.barfAngle = Math.atan2(p.pos.y + p.height / 2 - m.y, midX(p) - m.x);
  boss.vel.x = 0;
  if (Math.random() < 0.6) speakAsBoss(VICTOR, pickRandom(BARF_LINES), ctx.bossHelpers, 'casual');
};

/** The barf: a gurgle, then the stream, swinging round after him slowly; it hurts to be in it. */
const barf = (ctx: FrameContext, boss: Enemy) => {
  const { state, fx } = ctx;
  const p = state.player;
  boss.vel.x = 0;
  boss.barfT = (boss.barfT ?? 0) + 1;
  const t = boss.barfT, m = victorMouth(boss);
  // (the tidal wave coming through him puts it out: a hiss of steam, and he's done)
  const doused = state.tsunamiActive && Math.abs(state.tsunamiX - midX(boss)) < 120;
  if (t > BARF_WINDUP + BARF_FRAMES || doused) {
    if (doused) for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: m.x, y: m.y }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 40, color: '#E5E7EB', size: 6 + Math.random() * 6 });
    boss.bossState = 'idle'; boss.stateTimer = REST_FRAMES; boss.barfT = undefined; boss.barfLen = 0;
    boss.barfReadyAt = state.frame + BARF_COOLDOWN;
    return;
  }
  if (t < BARF_WINDUP) {
    // Gurgling: embers out of his mouth, the sound of it coming up
    if (t % 4 === 0) state.particles.push({ pos: { x: m.x, y: m.y }, vel: { x: (Math.random() - 0.5) * 2, y: -Math.random() * 2 }, life: 16, color: Math.random() < 0.5 ? '#FF6D00' : '#FFD600', size: 2 + Math.random() * 3 });
    if (t === 1) fx.playGunSound('ignite');
    return;
  }
  // Swinging round after him, slowly
  const want = Math.atan2(p.pos.y + p.height / 2 - m.y, midX(p) - m.x);
  let d = want - (boss.barfAngle ?? 0);
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  boss.barfAngle = (boss.barfAngle ?? 0) + Math.max(-BARF_TURN, Math.min(BARF_TURN, d));
  // (it runs out to full reach, and back in at the end)
  const s = t - BARF_WINDUP;
  // (out across the room fast, stopping at a wall or the floor, and back in at the end)
  const a0 = boss.barfAngle!, cx = Math.cos(a0), cy = Math.sin(a0);
  const toWall = cx > 0.01 ? (ARENA_RIGHT - m.x) / cx : cx < -0.01 ? (ARENA_LEFT - m.x) / cx : Infinity;
  const toFloor = cy > 0.01 ? (FLOOR_Y - m.y) / cy : Infinity;
  const reach = Math.min(BARF_REACH, toWall, toFloor);
  boss.barfLen = reach * Math.min(1, s / 24, (BARF_FRAMES - s) / 16);
  if (s % 6 === 0) fx.playGunSound('flame');
  // In it: it burns
  const a = boss.barfAngle!, len = boss.barfLen;
  const ux = Math.cos(a), uy = Math.sin(a);
  const pts = [{ x: midX(p), y: p.pos.y + 8 }, { x: midX(p), y: p.pos.y + p.height / 2 }, { x: midX(p), y: p.pos.y + p.height - 8 }];
  const hit = pts.some(q => {
    const along = (q.x - m.x) * ux + (q.y - m.y) * uy;
    if (along < 0 || along > len) return false;
    const off = Math.abs((q.x - m.x) * -uy + (q.y - m.y) * ux);
    return off < (BARF_WIDTH.base + BARF_WIDTH.spread * (along / BARF_REACH)) * 0.8 + p.width / 2;
  });
  if (hit && p.invincibilityTimer <= 0 && state.deathTimer <= 0) {
    hurtPlayer(ctx, BARF_DAMAGE, 'victor_barf', { x: (midX(p) < midX(boss) ? -1 : 1) * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y });
    p.sootTimer = Math.max(p.sootTimer ?? 0, 90); // (and he's blacked with it for a moment)
  }
  // (and it lights the room: a few sparks off it for the glow)
  if (s % 2 === 0) state.particles.push({ pos: { x: m.x + ux * len * Math.random(), y: m.y + uy * len * Math.random() }, vel: { x: ux * 2, y: uy * 2 - 1 }, life: 12, color: '#FFB300', size: 3 });
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

/** How far a vent's cone stands out of its floor or wall. */
const CONE_HEIGHT = 50;

/** The crater at the tip of a vent's cone, where its magma comes out (walls vents point out into the room). */
export const ventTip = (v: Volcano) => {
  if (v.type === 'ground') return { x: v.pos.x, y: FLOOR_Y - CONE_HEIGHT };
  const left = v.pos.x < (ARENA_LEFT + ARENA_RIGHT) / 2;
  return { x: left ? ARENA_LEFT + CONE_HEIGHT : ARENA_RIGHT - CONE_HEIGHT, y: v.pos.y };
};

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
  // Sealed: it's harmless until it blows (the blob it was just spitting fizzles in the crater)
  const tip = ventTip(vent);
  // (marked spent rather than filtered out: this runs while the projectiles are updating)
  for (const m of state.projectiles) if (m.id.startsWith('magma-') && Math.hypot(m.pos.x + 7 - tip.x, m.pos.y + 7 - tip.y) < 70) m.life = 0;
  vent.life = Math.min(ERUPTION_FRAMES - 12, Math.max(vent.life, 60)); // frozen hot...
  vent.age = Math.max(vent.age || 0, 12);                             // ...and fully risen
  ctx.fx.spawnRockShatter({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 });
  ctx.fx.playGunSound('crack');
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
  fx.playGunSound('boom');
  state.screenShakeTimer = 20;
  const { player } = state;
  const dx = player.pos.x + player.width / 2 - cx, dy = player.pos.y + player.height / 2 - cy;
  if (dx * dx + dy * dy < CORK_BLAST_RADIUS * CORK_BLAST_RADIUS && player.invincibilityTimer <= 0) {
    hurtPlayer(ctx, CORK_BLAST_DAMAGE, 'cork_blast', { x: (dx < 0 ? -1 : 1) * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y });
  }
  return false;
};

export const victor: BossDef = {
  id: 'Victor Volcano',
  // (bumping into him)
  contact: { damage: 8 },
  weakness: 'TSUNAMI',
  weaknessDamage: 150,
  spawn: { x: 7700 },
  update,
  // He stays 'jumping' when he lands so update() can open the vents
  physics: { landingEndsJump: false },
};
