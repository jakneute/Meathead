// Drug Trade Dale: a delivery truck barrels through the arena, then he uses
// the shipment: a spray of cocaine, rolling meth barrels, or a speed-fuelled
// dash back and forth across the room.
// Weakness, the sludge barfer: a direct hit leaves a puddle under him that
// slowly eats at him while he stands in it, Meathead's filth shield wrecks the
// truck outright, and a puddle in the truck's path blows its tires so it
// crashes into Dale himself. Either way, no shipment that round.

import { Enemy, Projectile } from '../../types';
import {
  ARENA_RIGHT, BOSS_DOOR_X, STAGE_WIDTH, DALE_TRUCK_SPEED, DALE_SPEED_WINDUP, DALE_TRUCK_DAMAGE, DALE_PUSHBACK_VEL,
  METH_BARREL_DAMAGE, PLAYER_PUSHBACK_VEL_Y, PARTICLE_PALETTES,
} from '../../constants';
import { DALE_LINES } from '../../dialogue';
import type { FrameContext } from '../context';
import { shakeScreen } from '../state';
import { pickRandom } from '../utils';
import { BossDef, FLOOR_Y, hurtPlayer, enemyProjectile, speakAsBoss } from './shared';

const HOME_X = ARENA_RIGHT - 120;
const TRUCK = { startX: BOSS_DOOR_X - 600, endX: STAGE_WIDTH + 200, y: 400, w: 350, h: 150 };
const COCAINE_COUNT = 10;
const METH_COUNT = 5;
const DASH_BOUNCES = 8;
const DASH_SPEED = 25;
const WRECKED_REST_FRAMES = 150;     // fuming after his truck gets wrecked
const SLUDGE_HIT_DAMAGE = 40;        // direct barfer hits (well under the usual weakness damage: the barfer's other tricks matter more)
const PUDDLE_FRAMES = 360;           // the puddle a direct hit leaves under him
const PUDDLE_TICK_FRAMES = 30;       // standing in sludge: a small hit this often...
const PUDDLE_TICK_DAMAGE = 2;        // ...of this much
const CRASH_DAMAGE = 150;            // his own truck, tires blown, plowing into him
const CRASH_REST_FRAMES = 180;

type Shipment = NonNullable<Enemy['shipmentType']>;
const SHIPMENTS: Shipment[] = ['cocaine', 'speed', 'meth'];

const update = (ctx: FrameContext, boss: Enemy) => {
  // Projectiles can't be added while projectiles are updating, so the puddle from a hit lands here
  if (boss.puddlePending) { boss.puddlePending = false; splashPuddle(ctx, boss); }
  switch (boss.bossState) {
    case 'idle':
      if (boss.stateTimer! <= 0) sendTruck(ctx, boss);
      break;
    case 'truck_incoming': driveTruck(ctx, boss); break;
    case 'using_shipment': useShipment(ctx, boss); break;
    case 'speed_dash': dash(ctx, boss); break;
  }
};

const sendTruck = (ctx: FrameContext, boss: Enemy) => {
  boss.bossState = 'truck_incoming';
  boss.stateTimer = 100;
  boss.truckX = TRUCK.startX;
  boss.truckActive = true;
  ctx.bossHelpers.playGunSound('horn');
};

/** The truck runs over anything in its path, then drops off a random shipment. */
const driveTruck = (ctx: FrameContext, boss: Enemy) => {
  const { state, cheats } = ctx;
  const { player } = state;
  boss.truckX! += DALE_TRUCK_SPEED;
  const truck = { x: boss.truckX!, y: TRUCK.y, w: TRUCK.w, h: TRUCK.h };
  const hits = (e: { pos: { x: number, y: number }, width: number, height: number }) =>
    e.pos.x < truck.x + truck.w && e.pos.x + e.width > truck.x && e.pos.y < truck.y + truck.h && e.pos.y + e.height > truck.y;

  // Driving over Meathead's sludge blows the tires out; it careens on into Dale
  if (!boss.truckCrashing) {
    const puddle = state.projectiles.find(p => p.owner === 'player' && p.isSludge && p.isLingering && (p.life || 0) > 0 &&
      p.pos.x < truck.x + truck.w && p.pos.x + p.width > truck.x);
    if (puddle) blowOutTires(ctx, boss, puddle);
  }

  if (hits(player)) {
    // The filth shield eats the truck like it eats bullets
    if (player.filthShieldTimer && player.filthShieldTimer > 0) { wreckTruck(ctx, boss); return; }
    const canHurt = player.invincibilityTimer <= 0 && !cheats.invincible;
    // Out of control and it catches you: it piles into you instead of Dale
    // (if you're still flashing from an earlier hit, it carries on past you)
    if (boss.truckCrashing && canHurt) { crashIntoPlayer(ctx, boss); return; }
    if (canHurt) {
      hurtPlayer(ctx, DALE_TRUCK_DAMAGE, 'truck', { x: DALE_PUSHBACK_VEL.x, y: PLAYER_PUSHBACK_VEL_Y });
    }
  }
  state.projectiles.forEach((p: Projectile) => { if (p.isMethBarrel && p.health > 0 && hits(p)) p.health = -1; });

  if (boss.truckCrashing) {
    // Rims grinding on the floor
    if (state.frame % 2 === 0) {
      for (const wx of [truck.x + 46, truck.x + truck.w - 40]) {
        ctx.fx.spawnExplosion({ x: wx, y: truck.y + truck.h - 4 }, '#FFD700', 3, -6, 5);
        ctx.fx.spawnExplosion({ x: wx, y: truck.y + truck.h - 10 }, '#6B7280', 2, -3, 3);
      }
    }
    if (truck.x + truck.w >= boss.pos.x + 20) { crashIntoDale(ctx, boss); return; }
  }

  if (boss.truckX! > TRUCK.endX) {
    boss.truckActive = false;
    boss.bossState = 'using_shipment';
    boss.shipmentType = SHIPMENTS[Math.floor(Math.random() * SHIPMENTS.length)];
    boss.shipmentCount = boss.shipmentType === 'cocaine' ? COCAINE_COUNT : (boss.shipmentType === 'meth' ? METH_COUNT : 1);
    // Speed gets a long, readable wind-up: he visibly shoots up before dashing
    boss.stateTimer = boss.shipmentType === 'speed' ? DALE_SPEED_WINDUP : 30;
  }
};

/** Meathead's filth shield took the hit: the truck blows up, the shipment's lost, the shield's used up. */
const wreckTruck = (ctx: FrameContext, boss: Enemy) => {
  const { state, fx } = ctx;
  const center = { x: boss.truckX! + TRUCK.w / 2, y: TRUCK.y + TRUCK.h / 2 };
  state.player.filthShieldTimer = 0;
  boss.truckActive = false;
  boss.truckCrashing = false;
  boss.bossState = 'idle';
  boss.stateTimer = WRECKED_REST_FRAMES;

  // Fireballs down its length, smoke, twisted metal, barf, and the cargo everywhere
  for (let i = 0; i < 5; i++) {
    const at = { x: boss.truckX! + 40 + i * 70, y: center.y + (Math.random() - 0.5) * 60 };
    fx.spawnExplosion(at, pickRandom(PARTICLE_PALETTES.FIRE), 14, 0, 16);
  }
  fx.spawnExplosion(center, '#212121', 30, 0, 14);
  fx.spawnExplosion(center, '#7F8C8D', 20, 0, 20);
  fx.spawnExplosion(center, '#7CFC00', 20, 0, 12);
  fx.spawnPowderExplosion(center, 30);
  fx.spawnMethExplosion({ x: center.x + 60, y: center.y }, 20);
  fx.playGunSound('tsunami');
  fx.playGunSound('barf');
  shakeScreen(state, 30, 14);

  // Kept on screen (the truck may still be half behind the door)
  fx.spawnKillCallout({ pos: { x: Math.max(center.x, state.camera.x + 220), y: TRUCK.y - 10 }, width: 0 }, 'truck');
  // One of them has something to say about it
  if (Math.random() < 0.5) fx.speakVulgarity('truck_wreck');
  else speakAsBoss('Drug Trade Dale', pickRandom(DALE_LINES.TRUCK_WRECKED), ctx.bossHelpers);
};

/** The truck rolled over a sludge puddle: tires pop, and it's out of control. */
const blowOutTires = (ctx: FrameContext, boss: Enemy, puddle: Projectile) => {
  const { state, fx } = ctx;
  boss.truckCrashing = true;
  puddle.life = 0;
  const at = { x: puddle.pos.x + puddle.width / 2, y: puddle.pos.y };
  fx.spawnExplosion(at, '#7CFC00', 25, 0, 14);
  fx.spawnExplosion(at, '#111111', 12, 0, 10); // shredded rubber
  fx.playGunSound('gun');
  fx.playGunSound('barf');
  shakeScreen(state, 12, 8);
  fx.spawnKillCallout({ pos: { x: Math.max(at.x, state.camera.x + 200), y: TRUCK.y - 10 }, width: 0 }, 'blowout');
};

/** The blown-out truck hit Meathead before it reached Dale: only Meathead gets hurt. */
const crashIntoPlayer = (ctx: FrameContext, boss: Enemy) => {
  const { state, fx } = ctx;
  const at = { x: boss.truckX! + TRUCK.w - 20, y: TRUCK.y + TRUCK.h / 2 };
  boss.truckActive = false;
  boss.truckCrashing = false;
  boss.bossState = 'idle';
  boss.stateTimer = WRECKED_REST_FRAMES;
  hurtPlayer(ctx, DALE_TRUCK_DAMAGE, 'truck', { x: DALE_PUSHBACK_VEL.x, y: PLAYER_PUSHBACK_VEL_Y });
  fx.spawnExplosion(at, pickRandom(PARTICLE_PALETTES.FIRE), 20, 0, 16);
  fx.spawnExplosion(at, '#212121', 20, 0, 12);
  fx.spawnPowderExplosion(at, 20);
  fx.playGunSound('tsunami');
  shakeScreen(state, 20, 12);
};

/** His own truck plows into him: heavy damage, the cargo's lost. */
const crashIntoDale = (ctx: FrameContext, boss: Enemy) => {
  const { state, fx } = ctx;
  const at = { x: boss.pos.x + boss.width / 2, y: boss.pos.y + boss.height / 2 };
  boss.truckActive = false;
  boss.truckCrashing = false;
  boss.health -= CRASH_DAMAGE;
  boss.hitCooldown = 60;
  fx.spawnDamageNumber(boss.pos, CRASH_DAMAGE, true);
  for (let i = 0; i < 4; i++) fx.spawnExplosion({ x: at.x - 60 + i * 30, y: at.y + (Math.random() - 0.5) * 50 }, pickRandom(PARTICLE_PALETTES.FIRE), 14, 0, 16);
  fx.spawnExplosion(at, '#212121', 30, 0, 14);
  fx.spawnExplosion(at, '#7F8C8D', 20, 0, 20);
  fx.spawnPowderExplosion(at, 30);
  fx.spawnDeathShower(at, 1, 1.5);
  fx.playGunSound('tsunami');
  shakeScreen(state, 40, 18);
  fx.spawnKillCallout({ pos: { x: at.x, y: boss.pos.y - 30 }, width: 0 }, 'crash');
  if (boss.health <= 0) { ctx.bossHelpers.killBoss(boss, 1, true, 'SLUDGE'); return; }
  boss.bossState = 'idle';
  boss.stateTimer = CRASH_REST_FRAMES;
  speakAsBoss('Drug Trade Dale', pickRandom(DALE_LINES.RUN_OVER), ctx.bossHelpers);
};

const useShipment = (ctx: FrameContext, boss: Enemy) => {
  const helpers = ctx.bossHelpers;
  // The needle goes in halfway through the speed wind-up
  if (boss.shipmentType === 'speed' && boss.stateTimer === Math.floor(DALE_SPEED_WINDUP * 0.55)) {
    helpers.playGunSound('dart');
    helpers.setScreenShake(6);
  }
  if (boss.stateTimer! > 0) return;

  if (boss.shipmentType === 'cocaine') {
    throwCocaine(ctx, boss);
    finishOne(boss, 20, 80);
  } else if (boss.shipmentType === 'meth') {
    helpers.addProjectile(enemyProjectile(`meth-${Date.now()}`, boss.pos.x, boss.pos.y, -4 - Math.random() * 3, -12, 40, 50,
      METH_BARREL_DAMAGE, { health: 100, maxHealth: 100, isMethBarrel: true, bounces: 15 }));
    finishOne(boss, 45, 100);
  } else {
    boss.bossState = 'speed_dash';
    boss.dashCount = DASH_BOUNCES;
    boss.vel.x = -DASH_SPEED;
    boss.stateTimer = 0;
    helpers.playGunSound('ice');
  }
};

/** One item used: wait `gap` frames for the next, or rest once the shipment's gone. */
const finishOne = (boss: Enemy, gap: number, rest: number) => {
  boss.shipmentCount!--;
  boss.stateTimer = gap;
  if (boss.shipmentCount! <= 0) { boss.bossState = 'idle'; boss.stateTimer = rest; }
};

/** Short lobs, mid arcs and long flat throws. */
const throwCocaine = (ctx: FrameContext, boss: Enemy) => {
  const roll = Math.random();
  let vx, vy;
  if (roll < 0.3) {
    vx = -2 - Math.random() * 3;
    vy = -18 - Math.random() * 6;
  } else if (roll < 0.75) {
    vx = -10 - Math.random() * 5;
    vy = -14 - Math.random() * 5;
  } else {
    vx = -20 - Math.random() * 8;
    vy = -8 - Math.random() * 4;
  }
  ctx.bossHelpers.addProjectile(enemyProjectile(`coke-${Date.now()}`, boss.pos.x, boss.pos.y + 20, vx, vy, 25, 25, 30, { isCocaine: true }));
};

/** Bounces wall to wall, then goes home. */
const dash = (ctx: FrameContext, boss: Enemy) => {
  boss.pos.x += boss.vel.x;
  if (boss.pos.x >= BOSS_DOOR_X + 20 && boss.pos.x + boss.width <= ARENA_RIGHT + 20) return;
  boss.vel.x *= -1;
  boss.dashCount!--;
  ctx.bossHelpers.setScreenShake(10);
  if (boss.dashCount! <= 0) {
    boss.pos.x = HOME_X;
    boss.vel.x = 0;
    boss.bossState = 'idle';
    boss.stateTimer = 150;
  }
};

/** A direct barf hit splashes a puddle at his feet (or tops up the one already there). */
const splashPuddle = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  const x = boss.pos.x - 25, w = boss.width + 50, h = 16;
  const mid = boss.pos.x + boss.width / 2;
  const existing = state.projectiles.find(p => p.owner === 'player' && p.isSludge && p.isLingering &&
    p.pos.x < mid && p.pos.x + p.width > mid);
  if (existing) { existing.life = Math.max(existing.life || 0, PUDDLE_FRAMES); return; }
  state.projectiles.push({
    id: `dale-puddle-${state.frame}`, pos: { x, y: FLOOR_Y - h }, vel: { x: 0, y: 0 }, width: w, height: h,
    health: 1, maxHealth: 1, type: 'projectile', damage: 0, owner: 'player', isSludge: true, isLingering: true, life: PUDDLE_FRAMES,
  });
};

/** Standing in sludge eats at him slowly (once per frame, however many puddles he's in). */
const soakInSludge = (ctx: FrameContext, boss: Enemy) => {
  const { state, fx } = ctx;
  if (boss.sludgeDotFrame === state.frame) return;
  boss.sludgeDotFrame = state.frame;
  if (state.frame % 5 === 0) {
    state.particles.push({ pos: { x: boss.pos.x + Math.random() * boss.width, y: FLOOR_Y - 8 }, vel: { x: 0, y: -1 - Math.random() * 2 }, life: 20, color: '#7CFC00', size: 3 + Math.random() * 4 });
  }
  boss.sludgeDotTimer = (boss.sludgeDotTimer || 0) + 1;
  if (boss.sludgeDotTimer < PUDDLE_TICK_FRAMES) return;
  boss.sludgeDotTimer = 0;
  boss.health -= PUDDLE_TICK_DAMAGE;
  fx.spawnDamageNumber(boss.pos, PUDDLE_TICK_DAMAGE, false, '#7CFC00');
  if (boss.health <= 0) ctx.bossHelpers.killBoss(boss, 0, true, 'SLUDGE');
};

export const dale: BossDef = {
  id: 'Drug Trade Dale',
  weakness: 'SLUDGE',
  weaknessDamage: SLUDGE_HIT_DAMAGE,
  spawn: { x: HOME_X },
  // Everything on his stage hits harder; bumping into him mid-attack knocks you back further
  contact: { damage: 7.5, pushbackFrames: boss => (boss.bossState !== 'idle' ? 24 : undefined) },
  update,
  onWeaknessHit: (_ctx, boss, p) => { if (p?.isSludge) boss.puddlePending = true; },
  onStandInSludge: soakInSludge,
};
