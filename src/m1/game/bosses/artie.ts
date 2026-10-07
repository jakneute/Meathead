// Artie Avalanche: hops around on low gravity, lobs big ice blocks, and
// when the flamethrower gets him, panics: on fire, arms going, he leaps for the
// ceiling and across the room, and once more when he lands, before he gets a grip.
// Every jump shakes icicles loose from the ceiling (more as he gets hurt), and
// they drop one after another. Burning him brings them down early, but the
// flamethrower can melt them too.

import { Enemy, Icicle, Rect } from '../../types';
import { ARENA_LEFT, ARENA_RIGHT, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y } from '../../constants';
import type { FrameContext } from '../core/context';
import { BossDef, ARENA_MID, BOSS_WALL_GAP, CEILING_Y, FLOOR_Y, enemyProjectile, hurtPlayer, midX } from './shared';
import { playSound } from '../platform/audio';

const ICE_BLOCK_SIZE = 60;
// The block is aimed at Meathead when it's thrown and flies straight: slow off the hand,
// speeding up to a bit faster than he runs
export const ICE_BLOCK_START_SPEED = 3.5;
export const ICE_BLOCK_MAX_SPEED = 5.0;
export const ICE_BLOCK_ACCEL = 0.03;
export const ICE_BLOCK_LIFE = 270;       // then it shatters on its own
/** Frames after the throw when it can't hit walls (so a throw right under the ceiling still flies). */
export const ICE_BLOCK_GRACE = 14;
const SHOT_COOLDOWN = 60;
const STUCK_FRAMES = 175;       // standing still this long forces a new move
const MUST_MOVE_FRAMES = 120;   // past this he won't pick the ice block
const MIN_THROW_DISTANCE = 230; // any closer and a throw couldn't be dodged: he'd rather jump or charge
/** Before a throw he hefts the block overhead (it freezes together, then flashes just before it flies). */
export const THROW_WINDUP = 34;
const AIR_THROW_WINDUP = 20;

const ICICLES_AT_FULL_HP = 1;   // per jump; ramps up as he loses health...
const ICICLES_AT_ZERO_HP = 4;   // ...to this many
const MAX_ICICLES = 6;          // on the ceiling / in the air at once
const ICICLE_WARNING = 45;      // frames the first one hangs before dropping
const ICICLE_STAGGER = 18;      // then one after another
const ICICLE_RUSHED = 8;        // burned: they come down almost at once...
const ICICLE_RUSHED_STAGGER = 5;
const ICICLE_MIN_GAP = 70;
const ICICLE_WIDTH = 24;
const ICICLE_GRAVITY = 0.55;
const ICICLE_MAX_SPEED = 14;
const ICICLE_DAMAGE = 10;
/** A block of ice to the face: big and telegraphed, but he's the first boss. */
const ICE_BLOCK_DAMAGE = 20;

// ---------------------------------------------------------------------------
// The vault warming up (looks only: nothing in the fight changes)
// ---------------------------------------------------------------------------

/** His specimen tubes, along the back wall (centers): the mammoth, the penguin, the lobbyist, reviewer #2. */
export const ARTIE_TUBE_X = [ARENA_LEFT + 100, ARENA_LEFT + 190, ARENA_RIGHT - 190, ARENA_RIGHT - 100];
/** How hot it has to get for each to give, and the order they go in (the lobbyist first, reviewer #2 holding out). */
export const TUBE_BREAK_AT = [0.7, 0.5, 0.3, 0.9];
/** Each time he's set alight, every frame he's on fire, and every frame the flamethrower's going in here. */
const HEAT_PER_BURN = 0.1, HEAT_BURNING = 0.0006, HEAT_FLAME = 0.0009;

/** Fire in the vault warms it, for good: the frost goes, the readout climbs, and the tubes give one by one. */
const warmVault = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx, v = state.artieVault;
  const burning = boss.bossState === 'panicking' || !!boss.isOnFire;
  const flaming = !!state.player.isFlaming && state.player.pos.x > ARENA_LEFT - 40;
  v.heat = Math.min(1, v.heat + (burning ? HEAT_BURNING : 0) + (flaming ? HEAT_FLAME : 0));
  TUBE_BREAK_AT.forEach((at, i) => {
    if (v.broke[i] >= 0 || v.heat < at) return;
    v.broke[i] = state.frame;
    // The glass goes: shards everywhere, the coolant out across the floor in a cloud of it
    const x = ARTIE_TUBE_X[i], y = FLOOR_Y - 110;
    ctx.fx.spawnExplosion({ x, y }, '#CFEFFF', 22, 0, 9, true);
    for (let k = 0; k < 26; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 50, y: y + Math.random() * 80 }, vel: { x: (Math.random() - 0.5) * 7, y: -Math.random() * 4 }, life: 30 + Math.random() * 20, color: k % 3 ? '#1E6E9E' : '#7FB8DC', size: 3 + Math.random() * 3, grav: 0.35 });
    for (let k = 0; k < 8; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 60, y: FLOOR_Y - 20 }, vel: { x: (Math.random() - 0.5) * 1.2, y: -0.8 - Math.random() }, life: 50, color: 'rgba(220, 240, 255, 0.45)', size: 12 + Math.random() * 10 });
    playSound('glass'); playSound('splash', 0.7); playSound('crack', 0.6, -3);
  });
};

const update = (ctx: FrameContext, boss: Enemy) => {
  updateIcicles(ctx);
  warmVault(ctx, boss);
  if (boss.bossState === 'panicking') { panic(ctx, boss); return; }
  if (boss.shootTimer > 0) boss.shootTimer--;
  if (boss.isGroundedBoss && Math.abs(boss.vel.x) < 0.5) boss.sideTimer = (boss.sideTimer || 0) + 1;
  else boss.sideTimer = 0;

  // Winding up a throw: the block forms over his head, then he hurls it
  if (boss.throwWindup && boss.throwWindup > 0) {
    windUpThrow(ctx, boss);
    return;
  }

  if ((boss.stateTimer! <= 0 || (boss.sideTimer || 0) > STUCK_FRAMES) && boss.isGroundedBoss) chooseMove(ctx, boss);

  // Sometimes throws a block at the top of a jump (hanging there a moment to heft it)
  if (boss.bossState === 'jumping' && !boss.isGroundedBoss && boss.shootTimer <= 0) {
    if (Math.abs(boss.vel.y) < 2 && boss.stateTimer! > 20 && Math.random() < 0.08 && Math.abs(midX(ctx.state.player) - midX(boss)) > MIN_THROW_DISTANCE) {
      boss.throwWindup = AIR_THROW_WINDUP;
      boss.shootTimer = SHOT_COOLDOWN;
    }
  }
  if (boss.isGroundedBoss) boss.vel.x *= 0.95;
};

/** Jump toward Meathead, throw an ice block, or charge. */
const chooseMove = (ctx: FrameContext, boss: Enemy) => {
  const { player } = ctx.state;
  const r = Math.random();
  const mustMove = (boss.sideTimer || 0) > MUST_MOVE_FRAMES;
  // (just come out of a panic: no big moon-boot leap straight after, or it reads as the burn doing it)
  const shaken = ctx.state.frame < (boss.calmAt ?? 0);
  if (!shaken && (r < 0.35 || (mustMove && r < 0.6))) {
    boss.vel.y = -13 - Math.random() * 3;
    boss.vel.x = (player.pos.x < boss.pos.x ? -1 : 1) * (4 + Math.random() * 2);
    boss.stateTimer = 70;
    boss.bossState = 'jumping';
    boss.sideTimer = 0;
    shakeIciclesLoose(ctx, boss, false);
  } else if (r < 0.70 && boss.shootTimer <= 0 && !mustMove && Math.abs(midX(player) - midX(boss)) > MIN_THROW_DISTANCE) {
    boss.throwWindup = THROW_WINDUP;
    boss.vel.x = 0;
    boss.shootTimer = SHOT_COOLDOWN + THROW_WINDUP;
    boss.stateTimer = 80 + THROW_WINDUP;
    boss.bossState = 'attacking';
  } else {
    // Squares up to you. (This used to set a charge speed, but the shared boss physics stops a grounded boss
    // every frame, so all it ever did was twitch him a few pixels sideways; he just holds his ground instead.)
    boss.stateTimer = 65;
    boss.bossState = 'attacking';
    boss.sideTimer = 0;
  }
};

/** Hefting the block: frost swirls in, he hangs in the air if he's mid-jump, then lets it fly. */
const windUpThrow = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  boss.throwWindup!--;
  boss.vel.x *= 0.8;
  if (!boss.isGroundedBoss) boss.vel.y = Math.min(boss.vel.y, 0) * 0.5; // hangs at the top of his jump
  if (state.frame % 2 === 0) {
    // Frost swirling in to form the block
    const a = Math.random() * Math.PI * 2;
    const cx = boss.pos.x + boss.width / 2, cy = boss.pos.y - 32;
    state.particles.push({ pos: { x: cx + Math.cos(a) * 60, y: cy + Math.sin(a) * 40 }, vel: { x: -Math.cos(a) * 4, y: -Math.sin(a) * 3 }, life: 14, color: Math.random() > 0.5 ? '#E0F7FF' : '#7DD3FC', size: 3 + Math.random() * 3 });
  }
  if (boss.throwWindup! > 0) return;
  throwIceBlock(ctx, boss, boss.isGroundedBoss ? 'ice-big' : 'ice-big-air');
  ctx.fx.playGunSound('whoosh');
  if (!boss.isGroundedBoss) boss.stateTimer = 50;
};

/** Lets the block fly from over his head, aimed straight at where Meathead is right now (no tracking after that). */
const throwIceBlock = (ctx: FrameContext, boss: Enemy, id: string) => {
  const { player } = ctx.state;
  const dir = player.pos.x < boss.pos.x + boss.width / 2 ? -1 : 1;
  const x = dir === 1 ? boss.pos.x + boss.width + 5 : boss.pos.x - ICE_BLOCK_SIZE - 5;
  // Never starts inside the ceiling, however high he jumped
  const y = Math.max(CEILING_Y + 2, boss.pos.y - 64);
  const dx = player.pos.x + player.width / 2 - (x + ICE_BLOCK_SIZE / 2);
  const dy = player.pos.y + player.height / 2 - (y + ICE_BLOCK_SIZE / 2);
  const len = Math.hypot(dx, dy) || 1;
  ctx.bossHelpers.addProjectile(enemyProjectile(`${id}-${Date.now()}`, x, y, (dx / len) * ICE_BLOCK_START_SPEED, (dy / len) * ICE_BLOCK_START_SPEED,
    ICE_BLOCK_SIZE, ICE_BLOCK_SIZE, ICE_BLOCK_DAMAGE, { isIce: true, life: ICE_BLOCK_LIFE }));
  // (a grunt of a heave and the block whistling off)
  ctx.bossHelpers.playGunSound('whoosh');
  playSound('clink', 0.5, -4);
};

/** How many big leaps he makes, panicking, before he gets a grip (the first across the room, the next anywhere). */
const PANIC_LEAPS = 2;

/**
 * Weakness: the flamethrower sets him alight and he panics: frantic little hops all over (making for the far side of
 * the room, mostly), arms going, on fire, for as long as he can't be hit again. The first jolt brings the icicles down
 * early.
 */
const startPanic = (ctx: FrameContext, boss: Enemy) => {
  ctx.state.artieVault.heat = Math.min(1, ctx.state.artieVault.heat + HEAT_PER_BURN);
  boss.slideTargetX = boss.pos.x < ARENA_MID - 40 ? ARENA_RIGHT - boss.width - BOSS_WALL_GAP - 20 : ARENA_LEFT + BOSS_WALL_GAP + 20;
  boss.bossState = 'panicking';
  boss.panicLeaps = PANIC_LEAPS - 1;
  boss.throwWindup = 0;
  // (up for the ceiling and across the room, the way he always went when he's burned)
  boss.vel.y = -22; boss.vel.x = (boss.slideTargetX - boss.pos.x) / 50;
  boss.facing = boss.vel.x < 0 ? -1 : 1;
  shakeIciclesLoose(ctx, boss, true);
  playSound('ignite', 0.8);
  ctx.state.damageNumbers.push({ id: `pain-${ctx.state.frame}`, text: 'MELTING!', pos: { x: midX(boss), y: boss.pos.y - 40 }, vel: { x: 0, y: -3 }, life: 70, maxLife: 70, isCritical: true, isCallout: true, color: '#FB923C' });
};

const panic = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  // (down, and straight back up again, for the ceiling, whichever way: still on fire)
  if (boss.isGroundedBoss && boss.vel.y >= 0 && (boss.panicLeaps ?? 0) > 0) {
    boss.panicLeaps!--;
    boss.vel.y = -19 - Math.random() * 3;
    const target = ARENA_LEFT + BOSS_WALL_GAP + 20 + Math.random() * (ARENA_RIGHT - ARENA_LEFT - boss.width - 2 * BOSS_WALL_GAP - 40);
    boss.vel.x = (target - boss.pos.x) / 55;
    boss.facing = boss.vel.x < 0 ? -1 : 1;
    playSound('ignite', 0.7);
  }
  // He's on fire: flames off him, smoke, and what's melting off him dripping
  const cx = boss.pos.x + boss.width / 2;
  for (let k = 0; k < 2; k++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * boss.width * 0.8, y: boss.pos.y + Math.random() * boss.height * 0.6 }, vel: { x: (Math.random() - 0.5) * 1.5, y: -2 - Math.random() * 2.5 }, life: 14 + Math.random() * 8, color: ['#FF4500', '#FF8C00', '#FFA500', '#FFD700'][Math.floor(Math.random() * 4)], size: 5 + Math.random() * 6 });
  if (state.frame % 3 === 0) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 30, y: boss.pos.y - 10 }, vel: { x: (Math.random() - 0.5) * 0.8, y: -1.5 }, life: 30, color: 'rgba(120, 120, 130, 0.6)', size: 8 + Math.random() * 6 });
  if (state.frame % 4 === 0) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * boss.width * 0.6, y: boss.pos.y + boss.height * 0.7 }, vel: { x: 0, y: 2 }, life: 20, color: '#BAE6FD', size: 3 });
  if (state.frame % 6 === 0) playSound('ignite', 0.35);
  // (out of breath, out of fire: back to it once he's landed)
  if ((boss.panicLeaps ?? 0) <= 0 && boss.isGroundedBoss && boss.vel.y >= 0) { boss.bossState = 'idle'; boss.stateTimer = 20; boss.calmAt = state.frame + 90; }
};

// ---------------------------------------------------------------------------
// Icicles
// ---------------------------------------------------------------------------

/**
 * A jump shakes a row of icicles loose: more the more he's hurt, the first one
 * over Meathead's head. `rushed` (he's been burned) drops them, and any still
 * hanging, almost at once.
 */
const shakeIciclesLoose = (ctx: FrameContext, boss: Enemy, rushed: boolean) => {
  const { state } = ctx;
  const missing = Math.max(0, Math.min(1, 1 - boss.health / boss.maxHealth));
  const count = Math.round(ICICLES_AT_FULL_HP + (ICICLES_AT_ZERO_HP - ICICLES_AT_FULL_HP) * missing);
  const minX = ARENA_LEFT + 30, maxX = ARENA_RIGHT - 30;

  if (rushed) {
    state.icicles.filter(i => i.fallIn > 0).forEach((i, k) => { i.fallIn = Math.min(i.fallIn, ICICLE_RUSHED + k * ICICLE_RUSHED_STAGGER); });
  }
  const hanging = state.icicles.length;
  for (let n = 0; n < count && hanging + n < MAX_ICICLES; n++) {
    let x = Math.max(minX, Math.min(maxX, state.player.pos.x + state.player.width / 2));
    if (n > 0) {
      for (let attempt = 0; attempt < 12; attempt++) {
        x = minX + Math.random() * (maxX - minX);
        if (state.icicles.every(i => Math.abs(i.x - x) >= ICICLE_MIN_GAP)) break;
      }
    }
    const delay = rushed ? ICICLE_RUSHED + n * ICICLE_RUSHED_STAGGER : ICICLE_WARNING + n * ICICLE_STAGGER;
    state.icicles.push({ x, y: CEILING_Y, length: 52 + Math.random() * 18, vy: 0, fallIn: delay, age: 0 });
  }
};

export const icicleBounds = (i: Icicle): Rect => ({ x: i.x - ICICLE_WIDTH / 2, y: i.y, w: ICICLE_WIDTH, h: i.length });

/** Hanging icicles count down and drop; falling ones hurt Meathead or shatter on the floor. */
const updateIcicles = (ctx: FrameContext) => {
  const { state, fx } = ctx;
  const { player } = state;
  const hurtbox = { x: player.pos.x, y: player.pos.y + (player.isDucking ? 28 : 0), w: player.width, h: player.height - (player.isDucking ? 28 : 0) };
  const shatter = (i: Icicle) => {
    fx.spawnExplosion({ x: i.x, y: i.y + i.length }, '#E0FFFF', 10, 0, 8);
    fx.spawnExplosion({ x: i.x, y: i.y + i.length }, '#FFFFFF', 6, 0, 5);
    fx.playGunSound('crack');
  };
  state.icicles = state.icicles.filter(i => {
    i.age++;
    if (i.fallIn > 0) {
      if (--i.fallIn === 0) i.fallIn = -1;
      return true;
    }
    i.vy = Math.min(ICICLE_MAX_SPEED, i.vy + ICICLE_GRAVITY);
    i.y += i.vy;
    const b = icicleBounds(i);
    if (b.x < hurtbox.x + hurtbox.w && b.x + b.w > hurtbox.x && b.y < hurtbox.y + hurtbox.h && b.y + b.h > hurtbox.y) {
      if (player.invincibilityTimer <= 0) {
        // (point first onto the top of his head, not his side: if it kills him, it goes right through him and stays)
        const onHead = b.y + b.h - i.vy <= hurtbox.y + 12 && Math.abs(player.pos.x + player.width / 2 - i.x) < player.width / 2 - 2;
        hurtPlayer(ctx, ICICLE_DAMAGE, 'ice', { x: (player.pos.x + player.width / 2 < i.x ? -1 : 1) * PLAYER_PUSHBACK_VEL_X * 0.6, y: PLAYER_PUSHBACK_VEL_Y });
        if (onHead && player.health <= 0) { state.impaleAt = { frame: state.frame, how: 'icicle', x: i.x }; return false; }
      }
      shatter(i);
      return false;
    }
    if (i.y + i.length >= FLOOR_Y) { shatter(i); return false; }
    return true;
  });
};

/** The flamethrower melts an icicle (hanging or falling). */
export const meltIcicle = (ctx: FrameContext, index: number) => {
  const i = ctx.state.icicles[index];
  ctx.state.icicles.splice(index, 1);
  ctx.fx.spawnSteamExplosionParticles({ x: i.x, y: i.y + i.length / 2 }, 10);
  ctx.fx.spawnExplosion({ x: i.x, y: i.y + i.length }, '#7FDBFF', 5, 0, 3);
  ctx.fx.playGunSound('ignite');
};

export const artie: BossDef = {
  id: 'Artie Avalanche',
  // (bumping into him)
  contact: { damage: 8 },
  weakness: 'FLAMETHROWER',
  spawn: { x: 7700 },
  slipperyFloor: true,
  update,
  physics: { gravity: () => 0.5 },
  onWeaknessHit: startPanic,
};
