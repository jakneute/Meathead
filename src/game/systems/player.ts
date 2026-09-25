// Player input handling, movement, special moves and terrain collision.
// Movement and special moves mirror the GameMaker version's oPlayer step order:
// cooldowns -> special inputs -> special moves -> facing -> crouch -> X -> Y.

import { Enemy, WeaponType, Rect, Block, Player } from '../../types';
import {
  MAX_AMMO,
  PLAYER_MOVE_SPEED, PLAYER_ACCEL_BASE, PLAYER_FRICTION_BASE, PLAYER_AIR_FRICTION, CROUCH_SLIDE_FRICTION_MULT,
  ICE_FRICTION_MULTIPLIER, MIN_MOVE_SPEED, PLAYER_GRAVITY, PLAYER_TERMINAL_VELOCITY, PLAYER_JUMP_SPEED,
  JUMP_HOLD_FRAMES, COYOTE_AIR_FRAMES, COYOTE_JUMP_FRAMES, JUMP_BUFFER_FRAMES, LANDING_SHAKE_SPEED,
  CHARGE_SPEED, CHARGE_DURATION, SLIDE_SPEED, SLIDE_DURATION, COOLDOWN_CHARGE,
  UPPERCUT_SPEED, UPPERCUT_DURATION, COOLDOWN_UPPERCUT, DIVEKICK_SPEED, DIVEKICK_ANGLE,
  PLAYER_MASS, RECOIL_FRAMES, PLAYER_STUN_INVINCIBILITY, GML_SCALE, SPECIAL_HURT_FRAMES, ARENA_LEFT, ARENA_RIGHT,
} from '../../constants';
import { STAGES_SET_1 } from '../../stages';
import { FrameContext } from '../context';
import { GameState, shakeScreen } from '../state';
import { Controls } from '../input';
import { fireWeapon, updateFlamethrower } from '../weapons';
import { rectsOverlap, boundsOf } from '../utils';

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
}

export const DEATH_SCREEN_FRAMES = 180;
const ICE_STAGES = ['Artie Avalanche', 'Blackout Barry'];
const STEP_UP_HEIGHT = 6;

export const killPlayer = (ctx: FrameContext, message: string) => {
  const { state, fx } = ctx;
  state.deathTimer = DEATH_SCREEN_FRAMES;
  state.deathString = message;
  fx.spawnDeathShower(state.player.pos, state.player.facing, 3);
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
  const specialPressed = c.special && !player.specialHeldLastFrame;
  const shootPressed = c.shoot && !player.shootHeldLastFrame;
  player.jumpHeldLastFrame = c.jump;
  player.specialHeldLastFrame = c.special;
  player.shootHeldLastFrame = c.shoot;

  const canAct = state.playerStunTimer <= 0 && player.pushbackTimer <= 0;
  const locked = player.lockTimer > 0;
  const canSteer = canAct && (!locked || (player.recoiling && player.vel.y < 0));
  const act = canAct && !locked;
  const shoot = act && c.shoot;
  return {
    shoot,
    shootPressed: act && shootPressed,
    moveLeft: canSteer && c.left,
    moveRight: canSteer && c.right,
    moveUp: act && c.up,
    moveDown: canAct && c.down,
    jump: act && c.jump,
    jumpPressed: act && jumpPressed,
    special: canAct && c.special,
    // During the lock only down+special (divekick) gets through
    specialPressed: canAct && specialPressed && (!locked || c.down),
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
  if (player.lockTimer > 0) {
    player.lockTimer--;
    if (player.recoiling) player.vel.x += (0 - player.vel.x) * 0.1;
    if (player.lockTimer === 0 && !player.isDivekicking) player.recoiling = false;
  }
  if (player.hurtFormTimer && player.hurtFormTimer > 0 && --player.hurtFormTimer === 0) player.hurtForm = null;
  if (player.squash) player.squash = Math.abs(player.squash) < 0.02 ? 0 : player.squash * 0.8;
  if (player.chargeCooldown > 0) player.chargeCooldown--;
  if (player.uppercutCooldown > 0) player.uppercutCooldown--;
  if (player.filthShieldTimer && player.filthShieldTimer > 0) player.filthShieldTimer--;

  // Jump buffer: a press is remembered for a few frames
  if (input.jumpPressed) player.jumpBufferTimer = JUMP_BUFFER_FRAMES;
  else if (player.jumpBufferTimer > 0) player.jumpBufferTimer--;
};

/** Specials, facing, crouching, horizontal movement and firing. */
export const updatePlayerActions = (ctx: FrameContext, input: FrameInput) => {
  const { state, currentWeapon } = ctx;
  const { player } = state;

  startSpecialMoves(ctx, input);
  const movDir = player.isTasing ? 0 : (input.moveRight ? 1 : 0) - (input.moveLeft ? 1 : 0);
  runSpecialMoves(ctx, input);

  // The flamethrower stream locks your facing (GML lockTurning)
  if (movDir !== 0 && !player.isCharging && !player.isDivekicking && !player.isTasing && !player.isFlaming) player.facing = movDir as 1 | -1;
  updateCrouch(ctx, input);
  updateHorizontalVelocity(ctx, movDir);

  player.currentWeapon = currentWeapon;
  updateFlamethrower(ctx, input);
  if (input.shoot && player.shootCooldown <= 0 && hasAmmo(ctx, currentWeapon) && currentWeapon !== 'TASER' && currentWeapon !== 'FLAMETHROWER') {
    fireWeapon(ctx, input);
  }
};

const isPerformingSpecial = (ctx: FrameContext) => {
  const { player } = ctx.state;
  return player.isCharging || player.isUppercutting || !!player.isDivekicking;
};

/** Special move inputs (GML handleSpecialInputs). Charge, uppercut and divekick share one button. */
const startSpecialMoves = (ctx: FrameContext, input: FrameInput) => {
  const { state, cheats, fx } = ctx;
  const { player } = state;
  if (!input.specialPressed || player.isTasing || state.playerStunTimer > 0) return;
  const free = cheats.infinitePower;
  const locked = player.lockTimer > 0; // only divekicks are allowed during recoil

  // Shoulder charge, or a slide when crouching
  if (!locked && !input.moveUp && !player.isCharging && (free || (player.chargeCooldown === 0 && !player.chargeUsed))) {
    player.isSliding = player.isDucking;
    player.chargeTimer = player.isSliding ? SLIDE_DURATION : CHARGE_DURATION;
    player.isCharging = true;
    player.isUppercutting = false;
    player.isDivekicking = false;
    player.chargeFace = player.facing;
  }

  // Uppercut
  if (!locked && input.moveUp && !player.isDucking && !player.isUppercutting && (free || (player.uppercutCooldown === 0 && !player.uppercutUsed))) {
    player.isUppercutting = true;
    player.chargeFace = player.facing;
    player.isCharging = false;
    player.isSliding = false;
    player.isDivekicking = false;
    player.uppercutTimer = UPPERCUT_DURATION;
    player.uppercutHitIds = [];
  }

  // Divekick (air only; can be re-triggered mid-bounce to chain stomps)
  if (input.moveDown && !player.isDucking && !player.isGrounded && (!player.isDivekicking || player.recoiling)) {
    player.isDivekicking = true;
    player.chargeFace = player.facing;
    player.diveKickSpeedX = (DIVEKICK_SPEED / Math.tan(DIVEKICK_ANGLE * Math.PI / 180)) * player.chargeFace;
    player.isCharging = false;
    player.isSliding = false;
    player.isUppercutting = false;
    player.diveKickHitIds = [];
    fx.playGunSound();
  }
};

/** Per-frame behaviour of whichever special move is active (GML executeSpecialMoves). */
const runSpecialMoves = (ctx: FrameContext, input: FrameInput) => {
  const { state } = ctx;
  const { player } = state;

  if (player.isCharging) {
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
  player.isSliding = false;
  player.chargeCooldown = COOLDOWN_CHARGE;
  player.chargeUsed = true;
};

export const endUppercut = (ctx: FrameContext) => {
  const { player } = ctx.state;
  player.isUppercutting = false;
  player.uppercutCooldown = COOLDOWN_UPPERCUT;
  player.uppercutUsed = true;
};

const updateCrouch = (ctx: FrameContext, input: FrameInput) => {
  const { player } = ctx.state;
  if (!player.isGrounded || player.vel.y < 0) return;
  // Holding fire with the flamethrower keeps you standing (down aims the stream instead)
  const isFlamethrowing = ctx.currentWeapon === 'FLAMETHROWER' && input.shoot;
  player.isDucking = input.moveDown && player.lockTimer <= 0 && !player.isUppercutting && !player.isDivekicking && !player.isTasing
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

  const targetVel = movDir * PLAYER_MOVE_SPEED;
  const effectiveDir = player.isDucking ? 0 : movDir;
  // Tommy's floating boards aren't terrain blocks, so count being grounded in his arena as a floor too
  const onFloor = standingOnSolid(state) || (stageId === 'Toxic Tommy' && state.arenaLocked && player.isGrounded);
  const surfaceFriction = ICE_STAGES.includes(stageId || '') ? ICE_FRICTION_MULTIPLIER : 1.0;

  let friction = onFloor ? PLAYER_FRICTION_BASE * surfaceFriction : PLAYER_AIR_FRICTION;
  if (player.isDucking && player.isGrounded) friction *= CROUCH_SLIDE_FRICTION_MULT;
  // Sticky surfaces (multiplier > 1) also slow acceleration, like the GML version
  const accel = Math.min(0.5, Math.max(0.005, PLAYER_ACCEL_BASE / (surfaceFriction > 1 ? surfaceFriction * surfaceFriction : 1)));

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
  updateVerticalVelocity(ctx, input);
  if (state.playerStunTimer > 0) player.pos.y += (state.frame % 2 === 0 ? -2 : 2);

  moveHorizontally(ctx);
  moveVertically(ctx);
  pushOutOfSolids(state);

  if (player.pos.x < 50) player.pos.x = 50;
  // Safety net: nothing can push you out through the walls of a locked boss arena
  if (state.arenaLocked) player.pos.x = Math.max(ARENA_LEFT, Math.min(ARENA_RIGHT - player.width, player.pos.x));
  // Footstep dust while running
  if (player.isGrounded && !isPerformingSpecial(ctx) && Math.abs(player.vel.x) > PLAYER_MOVE_SPEED * 0.6 && state.playerAnimFrame % 11 === 0) {
    spawnDust(state, player.pos.x + player.width / 2 - Math.sign(player.vel.x) * 10, player.pos.y + player.height, 2, -Math.sign(player.vel.x));
  }
  if (state.arenaLocked && ctx.stageId !== 'Toxic Tommy' && player.pos.y < 100) { player.pos.y = 100; player.vel.y = 0; }
};

const updateVerticalVelocity = (ctx: FrameContext, input: FrameInput) => {
  const { player } = ctx.state;

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
    player.chargeUsed = false;
    player.uppercutUsed = false;
    player.isDivekicking = false;
    player.coyoteJumpTimer = COYOTE_JUMP_FRAMES;
  } else {
    player.coyoteJumpTimer--;
  }

  // Start a jump (buffered press + coyote time)
  if (player.jumpBufferTimer > 0 && player.coyoteJumpTimer > 0 && !player.isDucking && !player.isTasing) {
    player.jumpBufferTimer = 0;
    player.jumpHoldTimer = JUMP_HOLD_FRAMES;
    player.squash = -0.5; // stretch on take-off
    player.isGrounded = false;
    player.coyoteAirTimer = 0;
    player.coyoteJumpTimer = 0;
  }
  // Holding jump keeps rising at a constant speed; letting go cuts it short
  if (!input.jump) player.jumpHoldTimer = 0;
  if (player.jumpHoldTimer > 0) {
    player.vel.y = PLAYER_JUMP_SPEED;
    player.jumpHoldTimer--;
  }

  if (player.vel.y > PLAYER_TERMINAL_VELOCITY) player.vel.y = PLAYER_TERMINAL_VELOCITY;
};

const doorIsMoving = (state: GameState) =>
  state.doorState === 'opening' || state.doorState === 'open' || state.doorState === 'closing';

const isSolid = (state: GameState, b: Block) =>
  b.type !== 'pit' && !(b.type === 'door' && (doorIsMoving(state) || state.doorState === 'closed'));

const collidesWithSolid = (state: GameState, box: Rect) =>
  state.blocks.some(b => isSolid(state, b) && rectsOverlap(box, b));

const standingOnSolid = (state: GameState) =>
  collidesWithSolid(state, { ...boundsOf(state.player), y: state.player.pos.y + 1 });

/** Touching the closed boss door starts the boss transition (or clears unfinished stages). */
const checkBossDoor = (ctx: FrameContext) => {
  const { state, stageId, fx, events } = ctx;
  const { player } = state;
  if (state.doorState !== 'closed') return;
  const door = state.blocks.find(b => b.type === 'door');
  if (!door || !rectsOverlap(boundsOf(player), door)) return;

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
};

/** Move along x, stopping flush against walls. Hitting a wall ends a charge. */
const moveHorizontally = (ctx: FrameContext) => {
  const { state } = ctx;
  const { player } = state;
  const prevX = player.pos.x;
  // Hector's pull drags us directly instead of feeding our momentum
  player.pos.x += player.vel.x + state.totalPullForceX;
  checkBossDoor(ctx);

  for (const b of state.blocks) {
    if (!isSolid(state, b) || !rectsOverlap(boundsOf(player), b)) continue;
    // A lip only a few pixels above our feet (e.g. stepping from a bobbing board onto a ledge): step up
    const feet = player.pos.y + player.height;
    if (feet - b.y <= STEP_UP_HEIGHT && player.vel.y >= 0) {
      player.pos.y = b.y - player.height;
      continue;
    }
    // Only push back out the side we came from. If we were already overlapping
    // before this move, the vertical pass / de-clip settles it instead; snapping
    // to the far side here could teleport us through a wall.
    if (prevX + player.width <= b.x) player.pos.x = b.x - player.width;
    else if (prevX >= b.x + b.w) player.pos.x = b.x + b.w;
    else continue;
    if (player.isCharging) { player.isCharging = false; player.isSliding = false; }
    player.vel.x = 0;
  }
};

/** Move along y: land on floors, bonk ceilings, shake the camera on hard impacts. */
const moveVertically = (ctx: FrameContext) => {
  const { state } = ctx;
  const { player } = state;
  const impactSpeed = player.vel.y;
  player.pos.y += player.vel.y;

  for (const b of state.blocks) {
    if (!isSolid(state, b) || !rectsOverlap(boundsOf(player), b)) continue;

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
    if (!isSolid(state, b) || !rectsOverlap(boundsOf(player), b)) continue;
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
};

/** Bounce the player off harmlessly (e.g. hitting a boss before the arena locks). */
export const harmlessBounce = (ctx: FrameContext, e: Enemy, velX: number, velY: number) => {
  const { player } = ctx.state;
  const pushDir = player.pos.x + player.width / 2 < e.pos.x + e.width / 2 ? -1 : 1;
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
};

export const getContactHurtSource = (ctx: FrameContext, e: Enemy) =>
  e.type === 'boss' ? (ctx.stageId || 'boss') : (e.id.startsWith('rusher') ? 'rusher' : e.enemyType);
