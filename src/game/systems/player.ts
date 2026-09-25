// Player input handling, movement, special moves and terrain collision.

import { Enemy, WeaponType, Rect } from '../../types';
import {
  GRAVITY, PLAYER_SPEED, PLAYER_JUMP_FORCE, JUMP_PREP_FRAMES, CHARGE_SPEED, CHARGE_DURATION,
  UPPERCUT_FORCE, UPPERCUT_AIR_SPEED, UPPERCUT_AIR_ACCEL, DIVEKICK_SPEED_X, DIVEKICK_SPEED_Y,
  SPECIAL_CHARGE_REGEN_FRAMES, MAX_SPECIAL_CHARGES, MAX_AMMO, FRICTION_DEFAULT, FRICTION_ICE_STAGE,
  FRICTION_ICE_STOP, PLAYER_PUSHBACK_DURATION, FLAMETHROWER_SPEED_MULT,
} from '../../constants';
import { STAGES_SET_1 } from '../../stages';
import { FrameContext } from '../context';
import { Controls } from '../input';
import { fireWeapon } from '../weapons';
import { rectsOverlap, boundsOf } from '../utils';

export interface FrameInput {
  shoot: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  moveUp: boolean;
  moveDown: boolean;
  jump: boolean;
  special: boolean;
  isFiringFlamethrower: boolean;
}

export const DEATH_SCREEN_FRAMES = 180;
const ICE_STAGES = ['Artie Avalanche', 'Blackout Barry'];

export const killPlayer = (ctx: FrameContext, message: string) => {
  const { state, fx } = ctx;
  state.deathTimer = DEATH_SCREEN_FRAMES;
  state.deathString = message;
  fx.spawnDeathShower(state.player.pos, state.player.facing, 3);
  fx.speakVulgarity('death');
};

export const gateControls = (ctx: FrameContext, c: Controls): FrameInput => {
  const { state, currentWeapon } = ctx;
  const canAct = state.playerStunTimer <= 0 && state.player.pushbackTimer <= 0;
  const shoot = canAct && c.shoot;
  return {
    shoot,
    moveLeft: canAct && c.left,
    moveRight: canAct && c.right,
    moveUp: canAct && c.up,
    moveDown: canAct && c.down,
    jump: canAct && c.jump,
    special: canAct && c.special,
    isFiringFlamethrower: currentWeapon === 'FLAMETHROWER' && shoot && hasAmmo(ctx, 'FLAMETHROWER'),
  };
};

export const hasAmmo = (ctx: FrameContext, weapon: WeaponType) => {
  if (ctx.cheats.infiniteAmmo || weapon === 'GUN') return true;
  const ammo = ctx.state.player.weaponAmmo;
  return ((ammo && ammo[weapon] !== undefined ? ammo[weapon] : (MAX_AMMO[weapon] || 0)) >= 1);
};

export const tickPlayerTimers = (ctx: FrameContext, input: FrameInput) => {
  const { state } = ctx;
  const { player } = state;
  if (state.playerStunTimer > 0) state.playerStunTimer--;
  if (state.playerVulgarityTimer > 0 && --state.playerVulgarityTimer <= 0) state.playerLastVulgarity = "";
  if (state.bossVulgarityTimer > 0 && --state.bossVulgarityTimer <= 0) state.bossLastVulgarity = "";
  if (state.voiceLineCooldown > 0) state.voiceLineCooldown--;
  if (state.hurtVoiceCooldown > 0) state.hurtVoiceCooldown--;
  if (player.invincibilityTimer > 0) player.invincibilityTimer--;
  if (player.hurtTimer && player.hurtTimer > 0) player.hurtTimer--;
  if (player.smugTimer && player.smugTimer > 0) player.smugTimer--;
  if (player.killSatisfactionTimer > 0) player.killSatisfactionTimer--;
  if (player.bossKillSatisfactionTimer > 0) player.bossKillSatisfactionTimer--;
  if (player.pushbackTimer > 0) {
    player.pushbackTimer--;
    player.vel.x *= 0.9;
  } else if (!player.smugTimer || player.smugTimer <= 0) {
    player.isHarmlessPushback = false;
  }
  if (player.specialCharges < MAX_SPECIAL_CHARGES) {
    player.specialChargeTimer++;
    if (player.specialChargeTimer >= SPECIAL_CHARGE_REGEN_FRAMES) { player.specialCharges++; player.specialChargeTimer = 0; }
  }
  if (player.filthShieldTimer && player.filthShieldTimer > 0) player.filthShieldTimer--;
  if (!input.jump) player.jumpInputReleased = true;
  if (!input.special) player.chargeInputReleased = true;
};

/** Ducking, jumping, walking, special moves (charge / uppercut / divekick) and firing. */
export const updatePlayerActions = (ctx: FrameContext, input: FrameInput) => {
  const { state, stageId, currentWeapon, cheats, fx } = ctx;
  const { player } = state;
  const { moveLeft, moveRight, moveUp, moveDown, isFiringFlamethrower } = input;
  const busy = player.isCharging || player.isUppercutting || player.isDivekicking;
  const onIce = ICE_STAGES.includes(stageId || '');

  if (!isFiringFlamethrower) player.flameTimer = 0;
  player.isDucking = moveDown && player.isGrounded && !busy && !isFiringFlamethrower && !player.isTasing;

  // A jump has a couple of wind-up frames before lift-off; nothing else happens meanwhile
  if (player.jumpPrepTimer > 0) {
    player.jumpPrepTimer--;
    if (player.jumpPrepTimer === 0) { player.vel.y = PLAYER_JUMP_FORCE; player.isGrounded = false; }
    return;
  }

  const canStartMove = player.pushbackTimer <= 0 && state.playerStunTimer <= 0 && !player.isTasing;
  if (input.jump && player.isGrounded && player.jumpInputReleased && !player.isCharging && !player.isDivekicking && canStartMove) {
    player.jumpPrepTimer = JUMP_PREP_FRAMES;
    player.jumpInputReleased = false;
  }

  if (!busy && canStartMove) {
    const speedLimit = isFiringFlamethrower ? PLAYER_SPEED * FLAMETHROWER_SPEED_MULT : PLAYER_SPEED;
    if (!player.isDucking) {
      const accel = onIce ? 0.55 : 1.5;
      if (moveLeft) {
        player.facing = -1;
        if (player.isGrounded || Math.abs(player.vel.x) <= speedLimit) player.vel.x = Math.max(-speedLimit, player.vel.x - accel);
      } else if (moveRight) {
        player.facing = 1;
        if (player.isGrounded || Math.abs(player.vel.x) <= speedLimit) player.vel.x = Math.min(speedLimit, player.vel.x + accel);
      } else if (player.isGrounded) {
        if (onIce) {
          player.vel.x *= FRICTION_ICE_STAGE;
          if (Math.abs(player.vel.x) < 0.1) player.vel.x = 0;
        } else {
          player.vel.x = 0;
        }
      }
    } else if (player.isGrounded) {
      if (moveLeft) player.facing = -1;
      else if (moveRight) player.facing = 1;
      if (onIce) player.vel.x *= FRICTION_ICE_STOP; else player.vel.x = 0;
    }
    if (!player.isGrounded && Math.abs(player.vel.x) <= speedLimit) player.vel.x *= FRICTION_DEFAULT;
  } else if (player.isCharging) {
    player.chargeDuration--;
    player.vel.x = player.facing * CHARGE_SPEED;
    if (player.chargeDuration <= 0) {
      player.isCharging = false;
      if (player.isGrounded) player.vel.x = player.facing * PLAYER_SPEED;
    }
  } else if (player.isUppercutting) {
    player.chargeDuration--;
    if (moveLeft) player.vel.x = Math.max(-UPPERCUT_AIR_SPEED, player.vel.x - UPPERCUT_AIR_ACCEL);
    else if (moveRight) player.vel.x = Math.min(UPPERCUT_AIR_SPEED, player.vel.x + UPPERCUT_AIR_ACCEL);
    else player.vel.x *= 0.95;
    if (player.chargeDuration <= 0) player.isUppercutting = false;
  } else if (player.isDivekicking) {
    player.vel.x = player.facing * DIVEKICK_SPEED_X;
    player.vel.y = DIVEKICK_SPEED_Y;
    if (state.frame % 2 === 0) {
      state.particles.push({
        pos: { x: player.pos.x + player.width / 2, y: player.pos.y + player.height / 2 },
        vel: { x: -player.facing * (Math.random() * 3 + 2), y: -(Math.random() * 4 + 2) },
        life: 15,
        color: Math.random() > 0.5 ? '#FF4500' : '#FFD700',
        size: 4 + Math.random() * 4
      });
    }
  }

  if (state.totalPullForceX !== 0) player.vel.x += state.totalPullForceX;

  const canSpecial = input.special && player.chargeInputReleased && !player.isCharging && !player.isUppercutting && !player.isDivekicking
    && !player.isDucking && (player.specialCharges > 0 || cheats.infinitePower) && !isFiringFlamethrower
    && state.playerStunTimer <= 0 && !player.isTasing;
  if (canSpecial) {
    player.chargeInputReleased = false;
    if (!cheats.infinitePower) player.specialCharges--;
    if (moveUp) {
      // Uppercut
      player.chargeDuration = CHARGE_DURATION;
      player.isUppercutting = true;
      player.vel.y = UPPERCUT_FORCE;
      player.isGrounded = false;
      player.vel.x = player.vel.x * 0.5;
    } else if (moveDown && !player.isGrounded) {
      // Divekick (air only)
      player.isDivekicking = true;
      player.vel.x = player.facing * DIVEKICK_SPEED_X;
      player.vel.y = DIVEKICK_SPEED_Y;
      fx.playGunSound();
    } else {
      // Shoulder charge
      player.chargeDuration = CHARGE_DURATION;
      player.isCharging = true;
      player.vel.x = player.facing * CHARGE_SPEED;
    }
  }

  player.currentWeapon = currentWeapon;
  if (input.shoot && player.shootCooldown <= 0 && hasAmmo(ctx, currentWeapon) && currentWeapon !== 'TASER') {
    fireWeapon(ctx, moveUp, moveDown);
  }
};

/** Gravity, integration, and collision against terrain (including touching the boss door). */
export const updatePlayerPhysics = (ctx: FrameContext, input: FrameInput) => {
  const { state, stageId, fx, events } = ctx;
  const { player } = state;

  if (player.shootCooldown > 0) player.shootCooldown--;
  if (!player.isDivekicking) player.vel.y += GRAVITY;
  // Releasing jump early cuts the jump short
  if (!input.jump && player.vel.y < 0 && !player.isGrounded && !player.isCharging && !player.isUppercutting && !player.isDivekicking) player.vel.y *= 0.5;
  if (state.playerStunTimer > 0) player.pos.y += (state.frame % 2 === 0 ? -2 : 2);
  player.pos.x += player.vel.x;
  player.pos.y += player.vel.y;
  if (player.pos.x < 50) player.pos.x = 50;
  if (state.arenaLocked && stageId !== 'Toxic Tommy' && player.pos.y < 100) { player.pos.y = 100; player.vel.y = 0; }

  player.isGrounded = false;
  const doorIsMoving = state.doorState === 'opening' || state.doorState === 'open' || state.doorState === 'closing';

  state.blocks.forEach(block => {
    if (block.type === 'door' && doorIsMoving) return;
    if (!rectsOverlap(boundsOf(player), block)) return;

    if (block.type === 'door' && state.doorState === 'closed') {
      // Set 1 stages without a finished boss fight are cleared just by reaching the door
      const isSet1 = STAGES_SET_1.some(s => s.id === stageId);
      if (isSet1 && stageId !== 'Drug Trade Dale' && stageId !== 'Blackout Barry' && stageId !== 'Toxic Tommy') {
        events.onBossDefeated(stageId || "");
        return;
      }
      state.doorState = 'opening';
      player.vel.x = 0;
      player.vel.y = 0;
      state.projectiles = [];
      state.enemies.forEach(e => {
        if (e.type !== 'boss' && e.health > 0) {
          e.health = 0;
          fx.spawnDeathShower(e.pos, 0, 1);
          fx.spawnPickup(e.pos);
        }
      });
      events.onBossTransition();
      return;
    }
    if (block.type === 'pit') return;

    const overlapX = Math.min(player.pos.x + player.width - block.x, block.x + block.w - player.pos.x);
    const overlapY = Math.min(player.pos.y + player.height - block.y, block.y + block.h - player.pos.y);
    if (overlapX < overlapY) {
      // Side hit
      player.pos.x = (player.pos.x + player.width / 2 < block.x + block.w / 2) ? block.x - player.width : block.x + block.w;
      player.vel.x = 0;
      player.isCharging = false;
      player.isDivekicking = false;
    } else if (player.pos.y + player.height / 2 < block.y + block.h / 2) {
      // Landed on top
      player.pos.y = block.y - player.height;
      player.isGrounded = true;
      player.vel.y = 0;
      if (player.isDivekicking) {
        player.isDivekicking = false;
        player.vel.x = 0;
        for (let i = 0; i < 12; i++) {
          state.particles.push({
            pos: { x: player.pos.x + player.width / 2, y: player.pos.y + player.height },
            vel: { x: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 8 + 4), y: -Math.random() * 3 },
            life: 20,
            color: '#B0BEC5',
            size: 4 + Math.random() * 5
          });
        }
        fx.playGunSound();
      }
      const speedLimit = input.isFiringFlamethrower ? PLAYER_SPEED * FLAMETHROWER_SPEED_MULT : PLAYER_SPEED;
      if (Math.abs(player.vel.x) > speedLimit) player.vel.x = Math.sign(player.vel.x) * speedLimit;
    } else {
      // Bonked head
      player.pos.y = block.y + block.h;
      player.vel.y = 0;
      player.isDivekicking = false;
    }
  });
};

/** Player hitbox while charging / uppercutting / divekicking. */
export const getAttackHitbox = (ctx: FrameContext): Rect => {
  const { player } = ctx.state;
  const box = boundsOf(player);
  if (player.isCharging) { box.w += 10; box.h -= 10; }
  else if (player.isUppercutting) { box.w = player.width - 15; box.h = player.height + 40; box.y = player.pos.y - 30; box.x = player.pos.x + 7.5; }
  else if (player.isDivekicking) { box.w = player.width + 20; box.h = player.height + 25; box.x = player.pos.x + (player.facing === 1 ? 0 : -20); box.y = player.pos.y + 10; }
  return box;
};

/** Bounce the player off harmlessly (e.g. hitting a boss before the arena locks). */
export const harmlessBounce = (ctx: FrameContext, e: Enemy, velX: number, velY: number) => {
  const { player } = ctx.state;
  const pushDir = player.pos.x + player.width / 2 < e.pos.x + e.width / 2 ? -1 : 1;
  player.vel = { x: pushDir * velX, y: velY };
  player.pushbackTimer = PLAYER_PUSHBACK_DURATION;
  player.isHarmlessPushback = true;
  player.smugTimer = 40;
  player.hurtTimer = 0;
};

export const getContactHurtSource = (ctx: FrameContext, e: Enemy) =>
  e.type === 'boss' ? (ctx.stageId || 'boss') : (e.id.startsWith('rusher') ? 'rusher' : e.enemyType);
