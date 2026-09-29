// Player input handling, movement, special moves and terrain collision.
// Movement and special moves mirror the GameMaker version's oPlayer step order:
// cooldowns -> special inputs -> special moves -> facing -> crouch -> X -> Y.

import { Enemy, WeaponType, Rect, Block, Player } from '../../types';
import {
  MAX_AMMO,
  PLAYER_MOVE_SPEED, PLAYER_ACCEL_BASE, PLAYER_FRICTION_BASE, PLAYER_AIR_FRICTION, CROUCH_SLIDE_FRICTION_MULT,
  ICE_FRICTION_MULTIPLIER, MIN_MOVE_SPEED, PLAYER_GRAVITY, PLAYER_TERMINAL_VELOCITY, PLAYER_JUMP_SPEED,
  JUMP_HOLD_FRAMES, COYOTE_AIR_FRAMES, COYOTE_JUMP_FRAMES, JUMP_BUFFER_FRAMES, LANDING_SHAKE_SPEED,
  CHARGE_SPEED, CHARGE_DURATION, SLIDE_SPEED, SLIDE_DURATION, POWER_CELLS, POWER_CELL_RECHARGE,
  UPPERCUT_SPEED, UPPERCUT_DURATION, DIVEKICK_SPEED, DIVEKICK_ANGLE,
  PLAYER_MASS, RECOIL_FRAMES, PLAYER_STUN_INVINCIBILITY, GML_SCALE, SPECIAL_HURT_FRAMES, ARENA_LEFT,
  OSCAR_OIL_SPEED_MULT, OSCAR_OIL_JUMP_MULT, SKI_JUMP_SPEED_MULT, SKI_JUMP_HOLD_MULT,
  SWIM_GRAVITY_MULT, SWIM_MAX_SINK, SWIM_STROKE, SWIM_LEAP, SWIM_SPEED_MULT, LEDGE_DROP_FRAMES,
} from '../../constants';
import { FrameContext } from '../core/context';
import { GameState, shakeScreen } from '../core/state';
import { Controls } from '../platform/input';
import { fireWeapon, updateFlamethrower } from '../combat/weapons';
import { rectsOverlap, boundsOf } from '../core/utils';
import { standingIndoors, groundLineAt } from '../core/terrain';
import { isChargerKind } from '../enemies/kinds';
import { BOSS_DIALOGUE } from '../../content/dialogue';
import { isStandingInOil } from '../bosses/oscar';
import { getBossDef, getArenaRight } from '../bosses/registry';
import { getStageLeft } from '../stages';

export interface FrameInput {
  shoot: boolean;
  shootPressed: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  moveUp: boolean;
  moveDown: boolean;
  jump: boolean;
  jumpPressed: boolean;
  special: boolean;
  specialPressed: boolean;
  /** It was Shift: a plain shoulder charge, whatever direction's held. */
  chargeOnly: boolean;
}

export const DEATH_SCREEN_FRAMES = 180;
/** The lunge through the water: how fast, and for how long at most (held). */
const SWIM_DASH_SPEED = 9, SWIM_DASH_FRAMES = 22;
const ANGRY_FRAMES = 50;
const STEP_UP_HEIGHT = 6;      // any lip this small is stepped over, even in the air
const STAIR_HEIGHT = 26;       // walking on the ground, he climbs steps up to this tall

export const killPlayer = (ctx: FrameContext, message: string, gore = true) => {
  const { state, fx } = ctx;
  state.deathTimer = DEATH_SCREEN_FRAMES;
  state.deathString = message;
  if (gore) fx.spawnDeathShower(state.player.pos, state.player.facing, 3);
  fx.speakVulgarity('death');
};

/**
 * Turns raw controls into this frame's input. Being hurt or stunned blocks
 * everything; the recoil lock (GML lockControls) blocks everything except
 * divekicks (so stomps can chain) and steering while bouncing upward.
 */
export const gateControls = (ctx: FrameContext, c: Controls): FrameInput => {
  const { state } = ctx;
  const { player } = state;
  const jumpPressed = c.jump && !player.jumpHeldLastFrame;
  const specialHeld = c.special || !!c.charge;
  const specialPressed = specialHeld && !player.specialHeldLastFrame;
  const shootPressed = c.shoot && !player.shootHeldLastFrame;
  player.jumpHeldLastFrame = c.jump;
  player.specialHeldLastFrame = specialHeld;
  player.shootHeldLastFrame = c.shoot;

  const canAct = state.playerStunTimer <= 0 && player.pushbackTimer <= 0;
  const locked = player.lockTimer > 0;
  const canSteer = canAct && (!locked || (player.recoiling && player.vel.y < 0));
  const act = canAct && !locked;
  // (the one exception: with that giant machine gun in his hands, getting hit doesn't stop him firing)
  const grit = ctx.currentWeapon === 'LMG' && !locked;
  const shoot = (act || grit) && c.shoot;
  return {
    shoot,
    shootPressed: (act || grit) && shootPressed,
    moveLeft: canSteer && c.left,
    moveRight: canSteer && c.right,
    moveUp: act && c.up,
    moveDown: canAct && c.down,
    jump: act && c.jump,
    jumpPressed: act && jumpPressed,
    special: canAct && specialHeld,
    // During the lock only down+special (divekick) gets through
    specialPressed: canAct && specialPressed && (!locked || (c.down && !c.charge)),
    chargeOnly: !!c.charge && !c.special,
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
  if (state.bossReactionCooldown > 0) state.bossReactionCooldown--;
  if (state.hurtVoiceCooldown > 0) state.hurtVoiceCooldown--;
  if (player.invincibilityTimer > 0) player.invincibilityTimer--;
  if (player.throwTimer && player.throwTimer > 0) player.throwTimer--;
  if (player.hurtTimer && player.hurtTimer > 0) player.hurtTimer--;
  if (player.smugTimer && player.smugTimer > 0) player.smugTimer--;
  if (player.angryTimer && player.angryTimer > 0) player.angryTimer--;
  if (player.killSatisfactionTimer > 0) player.killSatisfactionTimer--;
  if (player.bossKillSatisfactionTimer > 0) player.bossKillSatisfactionTimer--;
  if (player.pushbackTimer > 0) {
    player.pushbackTimer--;
    player.vel.x *= 0.9;
  } else if (!player.smugTimer || player.smugTimer <= 0) {
    player.isHarmlessPushback = false;
  }
  if (player.lockTimer > 0) {
    player.lockTimer--;
    if (player.recoiling) player.vel.x += (0 - player.vel.x) * 0.1;
    if (player.lockTimer === 0 && !player.isDivekicking) player.recoiling = false;
    if (player.lockTimer === 0) player.slideRecoil = false;
  }
  if (player.hurtFormTimer && player.hurtFormTimer > 0 && --player.hurtFormTimer === 0) player.hurtForm = null;
  if (player.squash) player.squash = Math.abs(player.squash) < 0.02 ? 0 : player.squash * 0.8;
  // Spent power refills cell by cell, on the ground or through ordinary jumps. Not mid-move, and not
  // after a power move in the air until he's touched down again.
  // (in the water counts as touching down: it comes back swimming)
  if (player.swimming) player.powerLocked = false;
  if (player.power < POWER_CELLS && !player.isCharging && !player.isUppercutting && !player.powerLocked) {
    player.power = Math.min(POWER_CELLS, player.power + 1 / POWER_CELL_RECHARGE);
  }
  if (player.filthShieldTimer && player.filthShieldTimer > 0) player.filthShieldTimer--;
  if (player.taserOverloadTimer && player.taserOverloadTimer > 0) player.taserOverloadTimer--;

  // Jump buffer: a press is remembered for a few frames
  if (input.jumpPressed) player.jumpBufferTimer = JUMP_BUFFER_FRAMES;
  else if (player.jumpBufferTimer > 0) player.jumpBufferTimer--;
};

/** Specials, facing, crouching, horizontal movement and firing. */
export const updatePlayerActions = (ctx: FrameContext, input: FrameInput) => {
  const { state, currentWeapon } = ctx;
  const { player } = state;

  startSpecialMoves(ctx, input);
  player.steer = input.moveUp ? -1 : input.moveDown ? 1 : 0;
  const movDir = player.isTasing ? 0 : (input.moveRight ? 1 : 0) - (input.moveLeft ? 1 : 0);
  runSpecialMoves(ctx, input);

  // The flamethrower stream locks your facing (GML lockTurning)
  if (movDir !== 0 && !player.isCharging && !player.isDivekicking && !player.isTasing && !player.isFlaming) player.facing = movDir as 1 | -1;
  updateCrouch(ctx, input);
  updateHorizontalVelocity(ctx, movDir);

  player.currentWeapon = currentWeapon;
  // Mid shoulder charge, uppercut or divekick his hands are busy: no shooting (a slide tackle's fine, gun out front)
  if (armsBusy(player)) input = { ...input, shoot: false, shootPressed: false };
  updateFlamethrower(ctx, input);
  if (input.shoot && player.shootCooldown <= 0 && hasAmmo(ctx, currentWeapon) && currentWeapon !== 'TASER' && currentWeapon !== 'FLAMETHROWER') {
    fireWeapon(ctx, input);
  }
};

/** Mid shoulder charge, uppercut or divekick: he can't fire (a slide tackle's the exception). */
export const armsBusy = (player: Player) => (player.isCharging && !player.isSliding) || player.isUppercutting || !!player.isDivekicking;

const isPerformingSpecial = (ctx: FrameContext) => {
  const { player } = ctx.state;
  return player.isCharging || player.isUppercutting || !!player.isDivekicking;
};

/** Which of a stage's ground oil he's stood in, if any (on the ground itself: not a ledge over it). */
export const oilUnderfoot = (state: GameState): 'slick' | 'tar' | null => {
  const zones = state.groundOil;
  const p = state.player;
  if (!zones || !zones.length || !p.isGrounded) return null;
  const cx = p.pos.x + p.width / 2;
  const z = zones.find(o => cx > o.x1 && cx < o.x2);
  if (!z) return null;
  const g = groundLineAt(state.groundRuns, cx);
  return Math.abs(p.pos.y + p.height - g) <= 6 ? z.kind : null;
};

/** Special move inputs (GML handleSpecialInputs). Charge, uppercut and divekick share one button. */
const startSpecialMoves = (ctx: FrameContext, input: FrameInput) => {
  const { state, cheats, fx } = ctx;
  const { player } = state;
  if (!input.specialPressed || player.isTasing || state.playerStunTimer > 0 || (player.skiing && !player.jetski)) return;
  // (on the jet ski every move goes forward, whichever way he's turned to shoot)
  if (player.jetski) player.facing = 1;
  // In the water it's a lunge: forward, up, or down (down + special's the same whether he's floating or stood on the
  // bottom: no slide, no dive kick)
  if (player.swimming && !player.skiing) {
    if (player.isCharging || !(cheats.infinitePower || player.power >= 1)) return;
    if (!cheats.infinitePower) player.power -= 1;
    player.swimDash = input.moveUp ? { x: 0, y: -1 } : input.moveDown ? { x: 0, y: 1 } : { x: player.facing, y: 0 };
    player.isCharging = true; player.isSliding = false; player.isUppercutting = false; player.isDivekicking = false; player.isDucking = false;
    player.chargeTimer = SWIM_DASH_FRAMES;
    player.chargeFace = player.facing;
    player.moveId = (player.moveId || 0) + 1;
    fx.playGunSound();
    return;
  }
  const free = cheats.infinitePower;
  const locked = player.lockTimer > 0; // only divekicks are allowed during recoil

  // What the button does depends on the state he's in when it's pressed: down + special in the
  // air is always a dive kick (even mid-slide off a ledge), so it never starts a charge up there
  // (Shift is only ever the shoulder charge)
  const only = input.chargeOnly;
  const airDive = input.moveDown && !player.isGrounded && !only;

  // Shoulder charge, or a slide when crouching (or pressing down with it) on the ground
  if (!locked && (!input.moveUp || only) && !airDive && !player.isCharging && (free || player.power >= 1)) {
    if (!free) player.power -= 1;
    player.isSliding = !only && player.isGrounded && (player.isDucking || input.moveDown) && !player.jetski;
    player.chargeTimer = player.isSliding ? SLIDE_DURATION : CHARGE_DURATION;
    player.isCharging = true;
    player.isUppercutting = false;
    player.isDivekicking = false;
    player.chargeFace = player.facing;
    player.moveId = (player.moveId || 0) + 1;
  }

  // Uppercut (springs straight out of a crouch once down is let go, or overridden by the E hotkey)
  if (!only && !locked && input.moveUp && (!player.isDucking || !input.moveDown) && !player.isUppercutting && (free || player.power >= 1)) {
    if (!free) player.power -= 1;
    player.isUppercutting = true;
    player.chargeFace = player.facing;
    player.isCharging = false;
    player.isSliding = false;
    player.isDivekicking = false;
    player.uppercutTimer = UPPERCUT_DURATION;
    player.uppercutHitIds = [];
    player.moveId = (player.moveId || 0) + 1;
  }

  // Divekick (air only; can be re-triggered mid-bounce to chain stomps)
  if (airDive && (!player.isDivekicking || player.recoiling)) {
    player.isDivekicking = true;
    player.chargeFace = player.facing;
    player.diveKickSpeedX = (DIVEKICK_SPEED / Math.tan(DIVEKICK_ANGLE * Math.PI / 180)) * player.chargeFace;
    player.isCharging = false;
    player.isSliding = false;
    player.isUppercutting = false;
    player.diveKickHitIds = [];
    player.moveId = (player.moveId || 0) + 1;
    fx.playGunSound();
  }
};

/** Per-frame behaviour of whichever special move is active (GML executeSpecialMoves). */
const runSpecialMoves = (ctx: FrameContext, input: FrameInput) => {
  const { state } = ctx;
  const { player } = state;

  if (!player.isCharging && player.swimDash) player.swimDash = undefined;
  // A lunge through the water: fast, straight, the way he went (out of the water and it carries him on up and out)
  if (player.isCharging && player.swimDash) {
    player.facing = player.chargeFace;
    if (player.swimming) {
      player.vel.x = player.swimDash.x * SWIM_DASH_SPEED;
      player.vel.y = player.swimDash.y * SWIM_DASH_SPEED;
      if (state.frame % 2 === 0) state.particles.push({ pos: { x: player.pos.x + player.width / 2 - player.swimDash.x * 16, y: player.pos.y + player.height / 2 - player.swimDash.y * 20 }, vel: { x: -player.swimDash.x * 2, y: -player.swimDash.y * 2 - 0.5 }, life: 20, color: 'rgba(224, 242, 254, 0.8)', size: 3 + Math.random() * 3 });
    }
    player.chargeTimer--;
    if (player.chargeTimer <= 0 || !input.special || !player.swimming) endCharge(ctx);
  } else if (player.isCharging) {
    player.facing = player.chargeFace;
    player.vel.x = player.chargeFace * (player.isSliding ? SLIDE_SPEED : CHARGE_SPEED);
    player.chargeTimer--;
    // Charging ignores gravity in the air
    if (!player.isGrounded) player.vel.y = 0;
    // Slides kick up a dust trail
    if (player.isSliding && player.isGrounded && state.frame % 2 === 0) {
      state.particles.push({
        pos: { x: player.pos.x + player.width / 2 - player.chargeFace * 10, y: player.pos.y + player.height - 4 },
        vel: { x: -player.chargeFace * (1 + Math.random() * 2), y: -Math.random() * 2 },
        life: 18,
        color: Math.random() > 0.5 ? '#A8A29E' : '#D6D3D1',
        size: 4 + Math.random() * 5,
      });
    }
    // Hold the button to keep charging, up to the full duration
    if (player.chargeTimer <= 0 || !input.special) endCharge(ctx);
  }

  if (player.isUppercutting) {
    player.vel.y = -UPPERCUT_SPEED;
    player.uppercutTimer--;
    if (player.uppercutTimer <= 0) {
      endUppercut(ctx);
      player.vel.y = 0;
    }
  }

  if (player.isDivekicking) {
    if (!player.recoiling) {
      player.vel.x = player.diveKickSpeedX;
      player.vel.y = DIVEKICK_SPEED;
      player.facing = player.chargeFace;
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
    // Stop if we'd hit a wall sideways
    if (collidesWithSolid(state, { ...boundsOf(player), x: player.pos.x + player.vel.x })) player.isDivekicking = false;
  }
};

export const endCharge = (ctx: FrameContext) => {
  const { player } = ctx.state;
  player.isCharging = false;
  player.swimDash = undefined;
  player.isSliding = false;
  if (!player.isGrounded) player.powerLocked = true;
};

export const endUppercut = (ctx: FrameContext) => {
  const { player } = ctx.state;
  player.isUppercutting = false;
  if (!player.isGrounded) player.powerLocked = true;
};

const updateCrouch = (ctx: FrameContext, input: FrameInput) => {
  const { player } = ctx.state;
  if (!player.isGrounded || player.vel.y < 0) return;
  // Holding fire with the flamethrower keeps you standing (down aims the stream instead)
  const isFlamethrowing = ctx.currentWeapon === 'FLAMETHROWER' && input.shoot;
  // Bouncing back off an enemy mid-slide keeps him down, until down is let go
  if (!input.moveDown) player.slideRecoil = false;
  const lockAllowsCrouch = player.lockTimer <= 0 || !!player.slideRecoil;
  // (sat on a jet ski there's no ducking: down's only for the dive)
  player.isDucking = input.moveDown && !player.jetski && lockAllowsCrouch && !player.isUppercutting && !player.isDivekicking && !player.isTasing
    && !isFlamethrowing && (!player.isCharging || player.isSliding);
};

/**
 * Walking with momentum (GML handleMovementX): lerp toward the target speed,
 * brake harder when reversing, and slide to a stop using the surface's friction.
 */
const updateHorizontalVelocity = (ctx: FrameContext, movDir: number) => {
  const { state, stageId } = ctx;
  const { player } = state;
  if (isPerformingSpecial(ctx) || player.lockTimer > 0 || player.pushbackTimer > 0) return;
  // On skis: the slope (and the stage) sets the pace
  if (player.skiing) { player.vel.x = player.skiSpeed ?? 0; player.facing = player.jetski && movDir < 0 ? -1 : 1; return; }

  // Oily Oscar's oil: slow, slippery going (a shoulder charge gets you out)
  const inOil = isStandingInOil(state);
  // (and out in his oil field: a slick you slide about on, tar that holds your feet)
  const fieldOil = oilUnderfoot(state);
  const targetVel = movDir * PLAYER_MOVE_SPEED * (inOil || fieldOil === 'tar' ? OSCAR_OIL_SPEED_MULT : 1);
  const effectiveDir = player.isDucking ? 0 : movDir;
  const bossDef = getBossDef(stageId);
  // A floorless arena's platforms (Tommy's floating boards) aren't terrain blocks, so being grounded there counts as a floor too
  const onFloor = standingOnSolid(state) || (!!bossDef?.arena?.floorless && state.arenaLocked && player.isGrounded);
  // (an icy stage is only icy outdoors: the tram cabin's floor is normal footing)
  const surfaceFriction = bossDef?.slipperyFloor && !standingIndoors(state.blocks, boundsOf(player)) ? ICE_FRICTION_MULTIPLIER : 1.0;

  let friction = onFloor ? PLAYER_FRICTION_BASE * surfaceFriction : PLAYER_AIR_FRICTION;
  // (in the water: slower going)
  if (player.swimming) { player.vel.x = player.vel.x * 0.9 + targetVel * SWIM_SPEED_MULT * 0.1; return; }
  if (player.isDucking && player.isGrounded) friction *= CROUCH_SLIDE_FRICTION_MULT;
  // Sticky surfaces (multiplier > 1) also slow acceleration, like the GML version
  let accel = Math.min(0.5, Math.max(0.005, PLAYER_ACCEL_BASE / (surfaceFriction > 1 ? surfaceFriction * surfaceFriction : 1)));
  if (inOil) { friction = 0.03; accel = 0.04; }
  // (on a slick there's no stopping, or starting, in a hurry; tar stops you dead and lets you go at a crawl)
  if (fieldOil === 'slick') { friction = 0.008; accel = 0.025; }
  else if (fieldOil === 'tar') { friction = 0.3; accel = 0.05; }

  const lerpTo = (target: number, t: number) => { player.vel.x += (target - player.vel.x) * t; };
  if (effectiveDir !== 0) {
    const reversing = Math.sign(effectiveDir) !== Math.sign(player.vel.x) && Math.abs(player.vel.x) > 0.5 * GML_SCALE;
    if (reversing) lerpTo(0, friction);
    else lerpTo(targetVel, accel);
  } else {
    lerpTo(0, friction);
  }
  if (Math.abs(player.vel.x) < MIN_MOVE_SPEED) player.vel.x = 0;
};

/** Gravity, jumping, integration and terrain collision (GML handleMovementY + collisions). */
export const updatePlayerPhysics = (ctx: FrameContext, input: FrameInput) => {
  const { state } = ctx;
  const { player } = state;

  if (player.shootCooldown > 0) player.shootCooldown--;
  const wasGrounded = player.isGrounded;
  updateVerticalVelocity(ctx, input);
  if (state.playerStunTimer > 0) player.pos.y += (state.frame % 2 === 0 ? -2 : 2);

  moveHorizontally(ctx);
  moveVertically(ctx);
  if (wasGrounded) stickToGround(ctx);
  pushOutOfSolids(state);

  const left = getStageLeft(ctx.stageId);
  if (player.pos.x < left + 50) player.pos.x = left + 50;
  // Safety net: nothing can push you out through the walls of a locked boss arena
  if (state.arenaLocked) player.pos.x = Math.max(ARENA_LEFT, Math.min(getArenaRight(ctx.stageId) - player.width, player.pos.x));
  // Footstep dust while running
  if (player.isGrounded && !isPerformingSpecial(ctx) && Math.abs(player.vel.x) > PLAYER_MOVE_SPEED * 0.6 && state.playerAnimFrame % 11 === 0) {
    spawnDust(state, player.pos.x + player.width / 2 - Math.sign(player.vel.x) * 10, player.pos.y + player.height, 2, -Math.sign(player.vel.x));
  }
  if (state.arenaLocked && !getBossDef(ctx.stageId)?.arena?.openTop && player.pos.y < 100) { player.pos.y = 100; player.vel.y = 0; }
};

/**
 * In the water: he sinks slowly, jump is a stroke upward (at the surface it's a
 * leap clean out, enough to get back up onto a dock).
 */
const swim = (player: Player) => {
  player.isGrounded = false; // (landing on the bottom sets it again)
  player.vel.y = Math.min(SWIM_MAX_SINK, player.vel.y + PLAYER_GRAVITY * SWIM_GRAVITY_MULT);
  player.jumpHoldTimer = 0;
  player.coyoteJumpTimer = 0;
  if (player.jumpBufferTimer > 0) {
    player.jumpBufferTimer = 0;
    const atSurface = player.pos.y < (player.swimSurfaceY ?? 0) + 24;
    player.vel.y = atSurface ? player.swimLeap ?? SWIM_LEAP : Math.min(player.vel.y, SWIM_STROKE);
    player.isGrounded = false;
    player.squash = -0.3;
  }
};

const updateVerticalVelocity = (ctx: FrameContext, input: FrameInput) => {
  const { player } = ctx.state;
  // (a lunge through the water sets its own pace: no sinking while it lasts)
  if (player.swimming && player.isCharging && player.swimDash) return;
  if (player.swimming) { swim(player); return; }

  // Coyote hang time: right after leaving the ground, gravity waits a few frames
  if (player.coyoteAirTimer > 0) {
    player.coyoteAirTimer--;
  } else {
    player.vel.y += PLAYER_GRAVITY;
    // A divekick stomp-bounce ends once the short bounce lock is over
    if (player.isDivekicking && player.recoiling && player.vel.y < 0 && player.lockTimer <= 1) {
      player.isDivekicking = false;
      player.recoiling = false;
    }
    player.isGrounded = false;
  }

  if (player.isGrounded) {
    player.powerLocked = false;
    player.isDivekicking = false;
    player.coyoteJumpTimer = COYOTE_JUMP_FRAMES;
  } else {
    player.coyoteJumpTimer--;
  }

  // Down + jump on a jump-through ledge (and nothing solid under him): drop down through it
  if ((player.dropThroughT || 0) > 0) player.dropThroughT!--;
  if (player.jumpBufferTimer > 0 && player.isGrounded && (player.isDucking || input.moveDown) && !player.isTasing && onJumpThroughOnly(ctx.state)) {
    player.jumpBufferTimer = 0;
    player.dropThroughT = DROP_THROUGH_FRAMES;
    player.dropThroughY = player.pos.y + player.height;
    player.pos.y += 2;
    player.vel.y = Math.max(player.vel.y, 2);
    player.isGrounded = false;
    player.coyoteJumpTimer = 0;
    player.coyoteAirTimer = 0;
    player.ledgeDrop = LEDGE_DROP_FRAMES;
    // (a puff off the ledge he went through)
    for (let i = 0; i < 8; i++) ctx.state.particles.push({ pos: { x: player.pos.x + player.width / 2 + (Math.random() - 0.5) * 30, y: player.dropThroughY! }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 1.5 }, life: 18, color: i % 2 ? '#D6D3D1' : '#A8A29E', size: 3 + Math.random() * 3 });
  } else if ((player.ledgeDrop || 0) > 0) {
    // The drop's pose ends when he lands, shoots, gets hit or goes into a move
    player.ledgeDrop!--;
    if (player.isGrounded || player.swimming || input.shoot || player.isCharging || player.isUppercutting || player.isDivekicking || player.hurtFormTimer) player.ledgeDrop = 0;
  }
  // Start a jump (buffered press + coyote time)
  if (player.jumpBufferTimer > 0 && player.coyoteJumpTimer > 0 && !player.isDucking && !player.isTasing) {
    player.jumpBufferTimer = 0;
    // Oil underfoot: your feet slip and you barely get off the ground
    player.jumpHoldTimer = isStandingInOil(ctx.state) || oilUnderfoot(ctx.state) === 'tar' ? Math.round(JUMP_HOLD_FRAMES * OSCAR_OIL_JUMP_MULT) : JUMP_HOLD_FRAMES;
    if (player.skiing) player.jumpHoldTimer = Math.round(JUMP_HOLD_FRAMES * SKI_JUMP_HOLD_MULT);
    player.squash = -0.5; // stretch on take-off
    player.isGrounded = false;
    player.coyoteAirTimer = 0;
    player.coyoteJumpTimer = 0;
  }
  // Holding jump keeps rising at a constant speed; letting go cuts it short
  if (!input.jump) player.jumpHoldTimer = 0;
  if (player.jumpHoldTimer > 0) {
    player.vel.y = PLAYER_JUMP_SPEED * (player.skiing ? SKI_JUMP_SPEED_MULT : 1);
    player.jumpHoldTimer--;
  }

  if (player.vel.y > PLAYER_TERMINAL_VELOCITY) player.vel.y = PLAYER_TERMINAL_VELOCITY;
};

const doorIsMoving = (state: GameState) =>
  state.doorState === 'opening' || state.doorState === 'open' || state.doorState === 'closing';

const isSolid = (state: GameState, b: Block) =>
  b.type !== 'pit' && !(b.type === 'door' && (doorIsMoving(state) || state.doorState === 'closed'));

/** (jump-through ledges don't count: only their tops are solid, and only from above) */
const collidesWithSolid = (state: GameState, box: Rect) =>
  state.blocks.some(b => isSolid(state, b) && !b.oneWay && rectsOverlap(box, b));

const standingOnSolid = (state: GameState) => {
  const p = state.player;
  if (collidesWithSolid(state, { ...boundsOf(p), y: p.pos.y + 1 })) return true;
  const feet = p.pos.y + p.height;
  return state.blocks.some(b => b.oneWay && isSolid(state, b) && !droppingThrough(p, b) && p.pos.x + p.width > b.x && p.pos.x < b.x + b.w && Math.abs(feet - b.y) <= 1);
};

/** How long a drop through a jump-through ledge lets him pass through it. */
const DROP_THROUGH_FRAMES = 14;
/** Dropping down through this ledge right now (the one he was stood on). */
const droppingThrough = (p: Player, b: Block) => (p.dropThroughT || 0) > 0 && b.oneWay === true && Math.abs(b.y - (p.dropThroughY ?? -1e9)) <= 2;
/** Stood on a jump-through ledge, with nothing solid under him (so there's somewhere to drop to). */
const onJumpThroughOnly = (state: GameState) => {
  const p = state.player;
  if (collidesWithSolid(state, { ...boundsOf(p), y: p.pos.y + 1 })) return false;
  const feet = p.pos.y + p.height;
  return state.blocks.some(b => b.oneWay && isSolid(state, b) && p.pos.x + p.width > b.x && p.pos.x < b.x + b.w && Math.abs(feet - b.y) <= 1);
};

/** Touching the closed boss door starts the boss transition. */
const checkBossDoor = (ctx: FrameContext) => {
  const { state, fx, events } = ctx;
  const { player } = state;
  if (state.doorState !== 'closed') return;
  const door = state.blocks.find(b => b.type === 'door');
  if (!door || !rectsOverlap(boundsOf(player), door)) return;

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
};

/** Move along x, stopping flush against walls. Hitting a wall ends a charge. */
const moveHorizontally = (ctx: FrameContext) => {
  const { state } = ctx;
  const { player } = state;
  const prevX = player.pos.x;
  // On the ground (isGrounded flickers off for a frame between landings, so check the floor too)
  const onGround = player.isGrounded || standingOnSolid(state);
  // Hector's pull drags us directly instead of feeding our momentum
  player.pos.x += player.vel.x + state.totalPullForceX + (state.windPushX || 0);
  state.windPushX = 0;
  checkBossDoor(ctx);

  for (const b of state.blocks) {
    if (!isSolid(state, b) || b.oneWay || !rectsOverlap(boundsOf(player), b)) continue;
    // A step or lip just above our feet: walk up onto it (stairs on the ground, tiny lips in the air)
    const feet = player.pos.y + player.height;
    if (feet - b.y <= (onGround ? STAIR_HEIGHT : STEP_UP_HEIGHT) && player.vel.y >= 0) {
      player.pos.y = b.y - player.height;
      continue;
    }
    // Only push back out the side we came from. If we were already overlapping
    // before this move, the vertical pass / de-clip settles it instead; snapping
    // to the far side here could teleport us through a wall.
    if (prevX + player.width <= b.x) player.pos.x = b.x - player.width;
    else if (prevX >= b.x + b.w) player.pos.x = b.x + b.w;
    else continue;
    if (player.isCharging) endCharge(ctx);
    player.vel.x = 0;
  }
};

/** Move along y: land on floors, bonk ceilings, shake the camera on hard impacts. */
const moveVertically = (ctx: FrameContext) => {
  const { state } = ctx;
  const { player } = state;
  const impactSpeed = player.vel.y;
  const prevFeet = player.pos.y + player.height;
  player.pos.y += player.vel.y;

  for (const b of state.blocks) {
    if (!isSolid(state, b) || !rectsOverlap(boundsOf(player), b)) continue;
    // A jump-through ledge only catches you coming down onto its top (and not the one you're dropping through)
    if (b.oneWay && (impactSpeed < 0 || prevFeet > b.y + 8 || droppingThrough(player, b))) continue;

    if (impactSpeed >= 0) {
      player.pos.y = b.y - player.height;
      if (!player.isGrounded) landPlayer(ctx, impactSpeed);
    } else if (impactSpeed < 0) {
      player.pos.y = b.y + b.h;
      // Bonk: a ceiling ends an uppercut and a held jump
      if (player.isUppercutting) endUppercut(ctx);
      player.isDivekicking = false;
      player.jumpHoldTimer = 0;
    }
    if (Math.abs(impactSpeed) >= LANDING_SHAKE_SPEED) shakeHard(state, impactSpeed);
    player.vel.y = 0;
  }
};

/** Downhill, the ground drops away a few pixels at a time: stay on it instead of skipping down it in little hops. */
const GROUND_STICK = 18;
const stickToGround = (ctx: FrameContext) => {
  const { state } = ctx;
  const { player } = state;
  if (standingOnSolid(state)) return; // (already on something)
  if (player.vel.y < 0 || player.jumpHoldTimer > 0 || player.isUppercutting || player.isDivekicking) return;
  const feet = player.pos.y + player.height;
  let top = Infinity;
  for (const b of state.blocks) {
    if (!isSolid(state, b) || b.x >= player.pos.x + player.width || b.x + b.w <= player.pos.x) continue;
    if (b.y >= feet && b.y - feet <= GROUND_STICK && b.y < top) top = b.y;
  }
  if (top === Infinity) return;
  player.pos.y = top - player.height;
  player.vel.y = 0;
  landPlayer(ctx, 0);
};

/** GML trigger_screen_shake: heavier, faster impacts shake harder (capped). */
const shakeHard = (state: GameState, velocity: number) => {
  const gmlForce = Math.min(10, (PLAYER_MASS * Math.abs(velocity / GML_SCALE)) / 1000);
  shakeScreen(state, 10, gmlForce * GML_SCALE);
};

/** A few puffs of dust along the floor, drifting in direction `dir`. */
const spawnDust = (state: GameState, x: number, y: number, count: number, dir: number) => {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      pos: { x: x + (Math.random() - 0.5) * 10, y: y - 2 - Math.random() * 4 },
      vel: { x: dir * (1 + Math.random() * 3), y: -Math.random() * 1.5 },
      life: 14 + Math.random() * 10,
      color: Math.random() > 0.5 ? '#A8A29E' : '#D6D3D1',
      size: 3 + Math.random() * 4,
    });
  }
};

/** Which special move the player is in the middle of, if any. */
export const getSpecialForm = (p: Player): Player['hurtForm'] =>
  p.isSliding ? 'slide' : p.isCharging ? 'charge' : p.isUppercutting ? 'uppercut' : p.isDivekicking ? 'divekick' : null;

/** Taking a hit cancels the special move and plays that move's hurt/recovery animation. */
export const interruptSpecialWithHurt = (ctx: FrameContext, form: NonNullable<Player['hurtForm']>) => {
  const { player } = ctx.state;
  if (player.isCharging) endCharge(ctx);
  if (player.isUppercutting) endUppercut(ctx);
  player.isSliding = false;
  player.isDivekicking = false;
  player.recoiling = false;
  player.hurtForm = form;
  player.hurtFormTimer = SPECIAL_HURT_FRAMES;
};

/** Called when the player touches down on any floor (terrain or Tommy's boards). */
export const landPlayer = (ctx: FrameContext, impactSpeed: number = 0) => {
  const { state, fx } = ctx;
  const { player } = state;
  player.isGrounded = true;
  player.coyoteAirTimer = COYOTE_AIR_FRAMES;

  // Squash and kick up dust in proportion to how hard we landed
  const impact = Math.min(1, impactSpeed / PLAYER_TERMINAL_VELOCITY);
  if (impact > 0.3) {
    player.squash = impact * 0.9;
    spawnDust(state, player.pos.x + player.width / 2, player.pos.y + player.height, Math.round(impact * 10), 1);
    spawnDust(state, player.pos.x + player.width / 2, player.pos.y + player.height, Math.round(impact * 10), -1);
  }
  if (!player.isDivekicking) return;

  player.isDivekicking = false;
  player.recoiling = false;
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
};

/** Fail-safe (GML "universal de-clipping"): if we still overlap terrain, pop out the shortest way. */
const pushOutOfSolids = (state: GameState) => {
  const { player } = state;
  for (const b of state.blocks) {
    if (!isSolid(state, b) || b.oneWay || !rectsOverlap(boundsOf(player), b)) continue;
    const pushUp = player.pos.y + player.height - b.y;
    const pushDown = b.y + b.h - player.pos.y;
    const pushLeft = player.pos.x + player.width - b.x;
    const pushRight = b.x + b.w - player.pos.x;
    const min = Math.min(pushUp, pushDown, pushLeft, pushRight);
    if (min === pushUp) player.pos.y -= pushUp;
    else if (min === pushDown) player.pos.y += pushDown;
    else if (min === pushLeft) player.pos.x -= pushLeft;
    else player.pos.x += pushRight;
  }
};

/**
 * The player's attack hitbox: their body swept along this frame's velocity
 * (plus 2px), so fast charges can't tunnel through thin enemies.
 */
export const getAttackHitbox = (ctx: FrameContext): Rect => {
  const { player } = ctx.state;
  const x1 = Math.min(player.pos.x, player.pos.x + player.vel.x);
  const y1 = Math.min(player.pos.y, player.pos.y + player.vel.y);
  const x2 = Math.max(player.pos.x, player.pos.x + player.vel.x) + player.width;
  const y2 = Math.max(player.pos.y, player.pos.y + player.vel.y) + player.height;
  return { x: x1 - 2, y: y1 - 2, w: x2 - x1 + 4, h: y2 - y1 + 4 };
};

/**
 * Bounce off an enemy that survived a charge/uppercut (GML oHurtbox recoil):
 * the heavier the enemy, the harder you're thrown back. Controls lock briefly.
 */
export const recoilOff = (ctx: FrameContext, enemyMass: number) => {
  const { player } = ctx.state;
  if ((player.isCharging || player.isUppercutting) && !player.isGrounded) player.powerLocked = true; // cut short in the air
  const wasSliding = player.isSliding;
  // A charge that didn't finish them off: grim determination
  if (player.isCharging) player.angryTimer = ANGRY_FRAMES;
  const ratio = enemyMass / PLAYER_MASS;
  player.vel.x = -player.vel.x * ratio;
  player.vel.y = -player.vel.y * ratio;
  player.lockTimer = RECOIL_FRAMES;
  player.recoiling = true;
  player.isCharging = false;
  player.isSliding = false;
  player.isUppercutting = false;
  player.invincibilityTimer = Math.max(player.invincibilityTimer, PLAYER_STUN_INVINCIBILITY);
  player.isHarmlessPushback = true;
  player.smugTimer = 35;
  player.hurtTimer = 0;
  stayCrouchedIfSliding(player, wasSliding);
};

/** A slide that bounces off something stays low: he skids back still crouched. */
const stayCrouchedIfSliding = (player: Player, wasSliding: boolean) => {
  player.slideRecoil = wasSliding;
  if (!wasSliding) return;
  player.isDucking = true;
  player.vel.y = 0;
};

/** Bounce the player off harmlessly (e.g. hitting a boss before the arena locks). */
export const harmlessBounce = (ctx: FrameContext, e: Enemy, velX: number, velY: number) => {
  const { player } = ctx.state;
  if ((player.isCharging || player.isUppercutting) && !player.isGrounded) player.powerLocked = true; // cut short in the air
  const pushDir = player.pos.x + player.width / 2 < e.pos.x + e.width / 2 ? -1 : 1;
  const wasSliding = player.isSliding;
  player.vel = { x: pushDir * velX, y: velY };
  player.lockTimer = RECOIL_FRAMES;
  player.recoiling = true;
  player.isCharging = false;
  player.isSliding = false;
  player.isUppercutting = false;
  player.isDivekicking = false;
  player.isHarmlessPushback = true;
  player.smugTimer = 40;
  player.hurtTimer = 0;
  stayCrouchedIfSliding(player, wasSliding);
};

export const getContactHurtSource = (ctx: FrameContext, e: Enemy) =>
  e.type === 'boss' ? (ctx.stageId || 'boss')
    // (a themed enemy with its own lines: bitten by a gator, clobbered by a pelican...)
    : e.kind && BOSS_DIALOGUE.SPECIFIC_HAZARD_HURT[e.kind] ? e.kind
    : (e.id.startsWith('rusher') || isChargerKind(e.kind) ? 'rusher' : e.enemyType);
