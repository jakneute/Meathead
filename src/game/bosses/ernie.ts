// Ernie Earthquake: every so often he either jumps at Meathead and sends a
// boulder rolling along the floor, or heaves one high in an arc and then runs
// to the other side of the room. Every landing shakes the room, and he speeds
// up as he loses health.
// Weakness, the shotgun: blast him mid-jump or mid-run and he freezes solid,
// topples over and the ice shatters for heavy damage; then he scrambles on to
// where he was headed (untouchable while he does) and carries on.

import { Enemy, Projectile } from '../../types';
import { BOULDER_SPEED, ERNIE_STOMP_VIBRATION_DURATION, GRAVITY, ARENA_LEFT, ARENA_RIGHT } from '../../constants';
import type { FrameContext } from '../core/context';
import { BossDef, ARENA_MID, FLOOR_Y, dirTo, midX, enemyProjectile } from './shared';
import { playSound } from '../platform/audio';

const ATTACK_INTERVAL = 180;     // frames between attacks at full health...
const ATTACK_INTERVAL_RAMP = 70; // ...this many fewer at 0 HP
const ROLL_SPEED_RAMP = 2;       // extra rolling boulder speed at 0 HP
const HEAVE_WINDUP = 26;         // holding the boulder overhead...
const HEAVE_WINDUP_RAMP = 8;     // ...this many frames less at 0 HP
const PERCH_WINDUP = 24;         // stood up on the boulder before he jumps off it and sends it rolling...
const PERCH_WINDUP_RAMP = 8;     // ...this many frames less at 0 HP
const PERCH_CLIMB = 6;           // frames getting up onto it
const HEAVE_FLIGHT = 48;         // frames the heaved boulder takes to come down...
const HEAVE_FLIGHT_RAMP = 8;     // ...this many fewer at 0 HP (a flatter, quicker lob)
const JUMP_REACH_RAMP = 0.3;     // his jump at you carries this much further at 0 HP
const HEAVE_MAX_SPEED_X = 16;
/** How far out of the far corner the heaved boulder comes down (just clear of the wall). */
const HEAVE_CORNER_INSET = 12;
const RUN_SPEED = 4.5;
const RUN_SPEED_RAMP = 2.5;      // extra run speed at 0 HP
const RUN_REST = 60;             // rest after a run (shrinks with the ramp)
const KNOCKDOWN_FRAMES = 90;
const ICE_HIT_DAMAGE = 30;       // a plain shotgun hit (the shatter is where the damage is)
const FREEZE_FRAMES = 24;        // frozen solid before he topples
const SHATTER_DAMAGE = 120;
/** A boulder rolled along the floor at you (jump it), and one heaved up to come down on you. */
const ROLLED_BOULDER_DAMAGE = 20, HEAVED_BOULDER_DAMAGE = 26;
const SCRAMBLE_SPEED_MULT = 1.7;
const RESUME_FRAMES = 25;        // after scrambling, this long before his next attack
const LANDING_SHAKE = 30;
/** Meathead caught on his feet by a quake (stunned): a beat, then a boulder sent at him fast enough to get there before
 * he's got his legs back (no faster than this). Stunned is dangerous. */
const PUNISH_WINDUP = 8, PUNISH_MAX_SPEED = 22;
export const ERNIE_BOULDER_SIZE = 72;

/** Keeps a boulder's left edge inside the arena (spawning in a wall would shatter it). */
const insideArena = (x: number) => Math.max(ARENA_LEFT + 2, Math.min(ARENA_RIGHT - ERNIE_BOULDER_SIZE - 2, x));

/** 0 at full health, 1 at none: he gets faster as it drops. */
const pace = (boss: Enemy) => Math.max(0, Math.min(1, 1 - boss.health / boss.maxHealth));

const update = (ctx: FrameContext, boss: Enemy) => {
  punish(ctx, boss);
  switch (boss.bossState) {
    case 'frozen':
      // Held solid in the ice, then he topples over
      boss.vel.x = 0;
      boss.vel.y = 0;
      if (boss.stateTimer! <= 0) {
        boss.bossState = 'stunned_drop';
        boss.stateTimer = KNOCKDOWN_FRAMES;
        boss.vel.y = 4;
        boss.rotation = Math.PI / 2;
      }
      break;
    case 'stunned_drop':
      // Hits the floor: the ice shatters. Then he gets up and scrambles on.
      if (boss.isGroundedBoss && (boss.frozenTimer || 0) > 0) shatter(ctx, boss);
      if (boss.isGroundedBoss && boss.stateTimer! <= 0) {
        boss.rotation = 0;
        boss.bossState = 'running';
        boss.scrambling = true;
      }
      break;
    case 'attacking':
      // Boulder held overhead; then it goes up and he makes a run for it
      boss.vel.x = 0;
      if (boss.stateTimer! <= 0) heaveBoulder(ctx, boss);
      break;
    case 'perched': {
      // Stood up on the boulder (the tell for the jump): up onto it, a beat, then off it at you and it goes rolling
      boss.vel.x = 0; boss.vel.y = 0;
      const total = boss.perchFor ?? PERCH_WINDUP;
      const up = Math.min(1, (total - boss.stateTimer!) / PERCH_CLIMB);
      boss.pos.y = FLOOR_Y - boss.height - ERNIE_BOULDER_SIZE * up;
      if (boss.stateTimer! <= 0) jumpAndRoll(ctx, boss);
      break;
    }
    case 'running':
      runAcross(ctx, boss);
      break;
    default:
      if (boss.stateTimer! > 0 || !boss.isGroundedBoss) break;
      if (Math.random() < 0.5) {
        boss.bossState = 'perched';
        boss.stateTimer = boss.perchFor = Math.round(PERCH_WINDUP - pace(boss) * PERCH_WINDUP_RAMP);
        boss.facing = dirTo(boss, ctx.state.player);
        // (the scrape of him getting up onto it)
        playSound('crunch', 0.45, -4);
      }
      else { boss.bossState = 'attacking'; boss.stateTimer = Math.round(HEAVE_WINDUP - pace(boss) * HEAVE_WINDUP_RAMP); }
  }
};

/** The original attack: a big jump toward Meathead that sends a boulder rolling at him. */
const jumpAndRoll = (ctx: FrameContext, boss: Enemy) => {
  // (the push off: a heave and the air going past him)
  playSound('whoosh', 0.7, -4);
  boss.vel.y = -12;
  boss.vel.x = (ctx.state.player.pos.x - boss.pos.x) * 0.03 * (1 + pace(boss) * JUMP_REACH_RAMP);
  // (off the top of the boulder he's longer in the air than off the floor: the same distance over that longer time,
  // so he still comes down where he would have)
  const h = FLOOR_Y - boss.height - boss.pos.y;
  if (h > 1) {
    const g = GRAVITY * 0.5, v = 12;
    boss.vel.x *= (2 * v) / (v + Math.sqrt(v * v + 2 * g * h));
  }
  boss.bossState = 'idle';
  boss.perchFor = undefined;
  boss.stateTimer = Math.round(ATTACK_INTERVAL - pace(boss) * ATTACK_INTERVAL_RAMP);
  rollBoulder(ctx, boss, dirTo(boss, ctx.state.player), 'b-ernie-jump');
};

/**
 * Meathead stunned by one of his quakes (his landing, or the heaved boulder's): Ernie sees it, and a beat later sends a
 * boulder at him quick enough to get there while he's still shaking (unless Ernie's on ice, down, or scrambling).
 */
const punish = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  if (state.playerStunTimer <= 0) { boss.sawStun = false; boss.punishT = undefined; return; }
  const able = boss.bossState !== 'frozen' && boss.bossState !== 'stunned_drop' && !boss.scrambling && boss.isGroundedBoss;
  if (!boss.sawStun && able) { boss.sawStun = true; boss.punishT = PUNISH_WINDUP; playSound('crunch', 0.6, -6); }
  if (boss.punishT === undefined || --boss.punishT > 0) return;
  boss.punishT = undefined;
  if (!able) return;
  const p = state.player, dir = dirTo(boss, p);
  const dist = Math.abs(p.pos.x + p.width / 2 - midX(boss));
  const frames = Math.max(8, state.playerStunTimer - 4);
  const speed = Math.max(BOULDER_SPEED + 1 + pace(boss) * ROLL_SPEED_RAMP, Math.min(PUNISH_MAX_SPEED, dist / frames));
  boss.facing = dir;
  rollBoulder(ctx, boss, dir, 'b-ernie-punish', speed);
};

const rollBoulder = (ctx: FrameContext, boss: Enemy, dir: number, id: string, fast?: number) => {
  const speed = fast ?? BOULDER_SPEED + 1 + pace(boss) * ROLL_SPEED_RAMP;
  ctx.bossHelpers.addProjectile(enemyProjectile(`${id}-${Date.now()}`, insideArena(midX(boss) - ERNIE_BOULDER_SIZE / 2), FLOOR_Y - ERNIE_BOULDER_SIZE,
    dir * speed, 0, ERNIE_BOULDER_SIZE, ERNIE_BOULDER_SIZE, ROLLED_BOULDER_DAMAGE, { isBoulder: true }));
  // (the grind of it setting off along the floor)
  playSound('crunch', 0.7, -7);
};

/**
 * Lobs it high across the room to come down in the far bottom corner (wherever Meathead is: it doesn't track
 * him, so you read the arc and get out from under it), then it bounces and rolls on. And he runs for the far side.
 */
const heaveBoulder = (ctx: FrameContext, boss: Enemy) => {
  const size = ERNIE_BOULDER_SIZE;
  const x = insideArena(midX(boss) - size / 2), y = boss.pos.y - size + 10;
  const corner = midX(boss) < ARENA_MID ? ARENA_RIGHT - size / 2 - HEAVE_CORNER_INSET : ARENA_LEFT + size / 2 + HEAVE_CORNER_INSET;
  const vy = -0.5 * GRAVITY * (HEAVE_FLIGHT - pace(boss) * HEAVE_FLIGHT_RAMP);
  // (timed to when it actually reaches the floor, which is a little below where it leaves his hands)
  const drop = FLOOR_Y - (y + size);
  const land = (-vy + Math.sqrt(vy * vy + 2 * GRAVITY * drop)) / GRAVITY;
  const vx = Math.max(-HEAVE_MAX_SPEED_X, Math.min(HEAVE_MAX_SPEED_X, (corner - (x + size / 2)) / land));
  ctx.bossHelpers.addProjectile(enemyProjectile(`b-ernie-heave-${Date.now()}`, x, y, vx, vy, size, size, HEAVED_BOULDER_DAMAGE, { isBoulder: true, isHeaved: true }));
  ctx.bossHelpers.playGunSound('whoosh');
  boss.bossState = 'running';
  boss.slideTargetX = midX(boss) < ARENA_MID ? ARENA_RIGHT - boss.width - 30 : ARENA_LEFT + 30;
};

const runAcross = (ctx: FrameContext, boss: Enemy) => {
  const speed = (RUN_SPEED + pace(boss) * RUN_SPEED_RAMP) * (boss.scrambling ? SCRAMBLE_SPEED_MULT : 1);
  const dx = boss.slideTargetX! - boss.pos.x;
  // Scrambling back up after a shatter he can't be hurt (and flickers)
  if (boss.scrambling) boss.hitCooldown = Math.max(boss.hitCooldown || 0, 10);
  if (Math.abs(dx) <= speed) {
    boss.vel.x = 0;
    boss.bossState = 'idle';
    boss.stateTimer = boss.scrambling ? RESUME_FRAMES : Math.round(RUN_REST * (1 - pace(boss) * 0.4));
    boss.scrambling = false;
    return;
  }
  // The physics stops him every frame he's on the ground, so keep pushing
  boss.vel.x = Math.sign(dx) * speed;
  if (ctx.state.frame % 4 === 0) {
    ctx.state.particles.push({
      pos: { x: midX(boss) - Math.sign(dx) * 30, y: FLOOR_Y - 6 },
      vel: { x: -Math.sign(dx) * (1 + Math.random() * 2), y: -Math.random() * 2 },
      life: 22, color: Math.random() > 0.5 ? '#8D6E63' : '#A1887F', size: 5 + Math.random() * 6,
    });
  }
};

/**
 * A quake going through the room from (x) on the floor, so you see it and hear it coming at you, not just feel it:
 * a deep boom and a rumble rolling on after it (low, not shrill), a wave of dust racing out along the floor both
 * ways from it, a crack of light along the floor where it went down, and grit and pebbles shaken down off the ceiling
 * all over the room.
 */
export const ernieQuake = (ctx: FrameContext, x: number) => {
  const { state } = ctx;
  playSound('rumble', 0.85, -7);
  playSound('thud', 0.9, -9);
  // (and the hit itself, up where you can hear it on any speakers: the boom's mostly felt)
  playSound('slam', 0.9, -3);
  for (const dir of [-1, 1]) {
    for (let i = 0; i < 14; i++) {
      state.particles.push({ pos: { x: x + dir * i * 4, y: FLOOR_Y - 4 - Math.random() * 6 }, vel: { x: dir * (6 + Math.random() * 3), y: -0.4 - Math.random() * 1.2 }, life: 34 + Math.random() * 14, color: i % 3 === 0 ? 'rgba(214, 211, 209, 0.75)' : 'rgba(168, 162, 158, 0.65)', size: 7 + Math.random() * 9 });
    }
    // (the crack of light running out along the floor ahead of the dust)
    for (let i = 0; i < 6; i++) state.particles.push({ pos: { x, y: FLOOR_Y - 2 }, vel: { x: dir * (9 + i * 1.5), y: 0 }, life: 18 + i * 2, color: '#FDE68A', size: 3 });
  }
  // Grit and pebbles down off the ceiling, all over
  for (let i = 0; i < 16; i++) {
    state.particles.push({ pos: { x: ARENA_LEFT + 20 + Math.random() * (ARENA_RIGHT - ARENA_LEFT - 40), y: 104 + Math.random() * 10 }, vel: { x: (Math.random() - 0.5) * 0.6, y: 2 + Math.random() * 4 }, life: 70 + Math.random() * 40, color: i % 2 ? '#78716C' : '#A8A29E', size: 2 + Math.random() * 4 });
  }
};

/** Every landing shakes the room (and stuns you if you're on the ground). */
const onLand = (ctx: FrameContext, boss: Enemy, dirToPlayer: number, surface: 'block' | 'floor') => {
  ctx.bossHelpers.setScreenShake(LANDING_SHAKE);
  ctx.bossHelpers.setErnieVibration(ERNIE_STOMP_VIBRATION_DURATION);
  if (surface === 'floor') ernieQuake(ctx, midX(boss));
  // (Meathead on his feet for it: the quake's got him, and the boulder that follows is the one sent to punish him)
  if (surface === 'floor' && !ctx.state.player.isGrounded) rollBoulder(ctx, boss, dirToPlayer, 'b-ernie-land');
};

/**
 * Weakness: shotgun ice catching him mid-jump or mid-run freezes him solid.
 * He remembers where he was headed so he can scramble there afterwards.
 */
const freeze = (ctx: FrameContext, boss: Enemy, p?: Partial<Projectile>) => {
  if (!p?.isIce) return;
  const running = boss.bossState === 'running' && !boss.scrambling;
  const jumping = !boss.isGroundedBoss && boss.bossState !== 'stunned_drop' && boss.bossState !== 'frozen';
  if (!running && !jumping) return;
  if (jumping) {
    const dir = Math.abs(boss.vel.x) > 0.5 ? Math.sign(boss.vel.x) : (midX(boss) < ARENA_MID ? 1 : -1);
    boss.slideTargetX = dir > 0 ? ARENA_RIGHT - boss.width - 30 : ARENA_LEFT + 30;
  }
  boss.bossState = 'frozen';
  boss.stateTimer = FREEZE_FRAMES;
  boss.frozenTimer = 999; // encased until he shatters
  boss.vel.x = 0;
  boss.vel.y = 0;
  ctx.fx.spawnExplosion({ x: midX(boss), y: boss.pos.y + boss.height / 2 }, '#E0FFFF', 16, 0, 10);
  ctx.fx.playGunSound('crack');
};

/** He's hit the floor in his block of ice: it shatters, and so does a good chunk of his health. */
const shatter = (ctx: FrameContext, boss: Enemy) => {
  const { fx } = ctx;
  const at = { x: midX(boss), y: boss.pos.y + boss.height / 2 };
  boss.frozenTimer = 0;
  boss.health -= SHATTER_DAMAGE;
  boss.hitCooldown = 60;
  fx.spawnDamageNumber(boss.pos, SHATTER_DAMAGE, true);
  fx.spawnGlassShatter(at);
  fx.spawnExplosion(at, '#B3F0FF', 25, 0, 16);
  fx.spawnKillCallout(boss, 'shatter');
  fx.playGunSound('glass');
  ctx.bossHelpers.setScreenShake(15);
  if (boss.health <= 0) ctx.bossHelpers.killBoss(boss, 0, true, 'SHOTGUN');
};

export const ernie: BossDef = {
  id: 'Ernie Earthquake',
  // (bumping into him)
  contact: { damage: 10 },
  weakness: 'SHOTGUN',
  weaknessDamage: ICE_HIT_DAMAGE,
  spawn: { x: 7700 },
  update,
  // Floaty on the way up, heavy on the way down
  physics: { gravity: boss => (boss.bossState === 'perched' ? 0 : boss.isGroundedBoss ? 1 : 0.5), onLand },
  onWeaknessHit: freeze,
};
