// Drug Trade Dale: a delivery truck barrels through the arena, then he uses
// the shipment: a spray of cocaine, rolling meth barrels, or a speed-fuelled
// dash back and forth across the room.

import { Enemy, Projectile } from '../../types';
import {
  ARENA_RIGHT, BOSS_DOOR_X, STAGE_WIDTH, DALE_TRUCK_SPEED, DALE_SPEED_WINDUP, DALE_TRUCK_DAMAGE, DALE_PUSHBACK_VEL,
  METH_BARREL_DAMAGE, PLAYER_PUSHBACK_VEL_Y,
} from '../../constants';
import type { FrameContext } from '../context';
import { BossDef, hurtPlayer, enemyProjectile } from './shared';

const HOME_X = ARENA_RIGHT - 120;
const TRUCK = { startX: BOSS_DOOR_X - 600, endX: STAGE_WIDTH + 200, y: 400, w: 350, h: 150 };
const COCAINE_COUNT = 10;
const METH_COUNT = 5;
const DASH_BOUNCES = 8;
const DASH_SPEED = 25;

type Shipment = NonNullable<Enemy['shipmentType']>;
const SHIPMENTS: Shipment[] = ['cocaine', 'speed', 'meth'];

const update = (ctx: FrameContext, boss: Enemy) => {
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

  if (hits(player) && player.invincibilityTimer <= 0 && !cheats.invincible) {
    hurtPlayer(ctx, DALE_TRUCK_DAMAGE, 'truck', { x: DALE_PUSHBACK_VEL.x, y: PLAYER_PUSHBACK_VEL_Y });
  }
  state.projectiles.forEach((p: Projectile) => { if (p.isMethBarrel && p.health > 0 && hits(p)) p.health = -1; });

  if (boss.truckX! > TRUCK.endX) {
    boss.truckActive = false;
    boss.bossState = 'using_shipment';
    boss.shipmentType = SHIPMENTS[Math.floor(Math.random() * SHIPMENTS.length)];
    boss.shipmentCount = boss.shipmentType === 'cocaine' ? COCAINE_COUNT : (boss.shipmentType === 'meth' ? METH_COUNT : 1);
    // Speed gets a long, readable wind-up: he visibly shoots up before dashing
    boss.stateTimer = boss.shipmentType === 'speed' ? DALE_SPEED_WINDUP : 30;
  }
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

export const dale: BossDef = {
  id: 'Drug Trade Dale',
  weakness: 'SLUDGE',
  spawn: { x: HOME_X },
  // Everything on his stage hits harder; bumping into him mid-attack knocks you back further
  contact: { damage: 7.5, pushbackFrames: boss => (boss.bossState !== 'idle' ? 24 : undefined) },
  update,
};
