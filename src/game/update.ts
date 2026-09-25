// Top-level game loop step: dispatches on game status and runs each gameplay system in order.

import { GameStatus, WeaponType } from '../types';
import {
  CANVAS_WIDTH, GRAVITY, BOSS_DOOR_X, DOOR_WIDTH, getStageWidth, DOOR_OPEN_SPEED, MAX_AMMO,
  AMMO_PICKUP_PCT, HEALTH_PICKUP_SMALL, HEALTH_PICKUP_LARGE, PLAYER_STUN_DURATION, PARTICLE_PALETTES,
} from '../constants';
import { BOSS_DIALOGUE } from '../dialogue';
import { FrameContext } from './context';
import { Controls } from './input';
import { respawn, getStartX } from './level';
import { resetPlayerCombatState, DEFAULT_SHAKE } from './state';
import { updateBarfStream, updateFlameSegments } from './weapons';
import { speak, claimLine, MEATHEAD_INTRO_VOICE } from './speech';
import { pickRandom, rectsOverlap, boundsOf } from './utils';
import { killPlayer, gateControls, tickPlayerTimers, updatePlayerActions, updatePlayerPhysics, getSpecialForm, interruptSpecialWithHurt } from './systems/player';
import { updateTsunami, updateSteamExplosions, updateVolcanoes, updateTommyArena } from './systems/hazards';
import { updateTaser, updateBurningProjectiles, updateEnemyStatusEffects } from './systems/statusEffects';
import { updateEnemy } from './systems/enemies';
import { updateProjectile, updateSpecialMovesVsBarrels } from './systems/projectiles';
import { updateOscarHazards } from './systems/oscar';

const INTRO_JUMP_START = 80;
const INTRO_JUMP_FRAMES = 60;

/**
 * Advances the simulation by one fixed 60fps tick.
 * Returns true when a full gameplay tick ran (the caller then syncs the HUD).
 */
export const stepGame = (ctx: FrameContext, status: GameStatus, controls: Controls): boolean => {
  const { state } = ctx;
  // A paused game is frozen solid: no timers, no animation
  if (status === GameStatus.PAUSED) return false;
  state.frame++;
  if (state.screenShakeTimer > 0 && --state.screenShakeTimer === 0) state.screenShakeMagnitude = DEFAULT_SHAKE;

  if (state.deathTimer > 0) { updateDeathScreen(ctx); return false; }
  if (state.bossExplosionTimer > 0) { updateBossExplosion(ctx); return false; }
  switch (status) {
    case GameStatus.PLAYING: return updatePlaying(ctx, controls);
    case GameStatus.LEVEL_INTRO: updateLevelIntro(ctx); return false;
    case GameStatus.BOSS_TRANSITION: updateBossTransition(ctx); return false;
    case GameStatus.BOSS_INTRO: state.arenaLocked = false; return false;
    default: return false;
  }
};

// ---------------------------------------------------------------------------
// Non-gameplay phases
// ---------------------------------------------------------------------------

const moveLooseParticles = (ctx: FrameContext) => {
  ctx.state.particles = ctx.state.particles.filter(p => {
    if (!p.isStuck) { p.pos.x += p.vel.x; p.pos.y += p.vel.y; p.life--; }
    return p.life > 0;
  });
};

/** Player is dead: let the gore settle, then respawn. */
const updateDeathScreen = (ctx: FrameContext) => {
  const { state } = ctx;
  state.deathTimer--;
  if (state.deathTimer === 0) respawn(state, ctx.stageId, ctx.cheats.skipToBoss);
  moveLooseParticles(ctx);
};

/** Weakness kill: the boss erupts in gore for a few seconds, which sticks to the terrain. */
const updateBossExplosion = (ctx: FrameContext) => {
  const { state, fx } = ctx;
  state.bossExplosionTimer--;
  state.screenShakeTimer = 5;
  if (state.frame % 3 === 0) {
    fx.spawnDeathShower(state.bossExplosionPos, (Math.random() - 0.5) * 4, 15.0, true, 180);
    fx.spawnExplosion(state.bossExplosionPos, pickRandom(PARTICLE_PALETTES.FIRE), 10, (Math.random() - 0.5) * 15, 60);
  }
  state.particles = state.particles.filter(p => {
    if (p.isStuck) return true;
    p.pos.x += p.vel.x;
    p.pos.y += p.vel.y;
    if (p.isBossGore) {
      p.vel.y += 0.35;
      for (const b of state.blocks) {
        if (b.type !== 'pit' && p.pos.x > b.x && p.pos.x < b.x + b.w && p.pos.y > b.y && p.pos.y < b.y + b.h) {
          p.vel.x = 0; p.vel.y = 0; p.isStuck = true;
          break;
        }
      }
    }
    if (!p.isStuck) p.life--;
    return p.life > 0;
  });
  if (state.bossExplosionTimer <= 0) {
    ctx.events.onBossDeath();
    state.victoryString = "V";
    state.postVictoryTimer = 0;
  }
};

/** Meathead crashes through a window into the stage, delivering the boss's intro quote. */
const updateLevelIntro = (ctx: FrameContext) => {
  const { state, stageId, cheats } = ctx;
  const { player } = state;
  state.introTimer++;
  const baseStartX = getStartX(cheats.skipToBoss);
  state.camera.x = baseStartX;
  player.facing = 1;

  const quotes = stageId ? BOSS_DIALOGUE.INTRO_QUOTES[stageId] : undefined;
  if (state.introTimer === 30 && !cheats.skipToBoss && quotes && claimLine(quotes[0])) {
    const quote = quotes[0];
    state.isMeatheadSpeaking = true;
    speak(quote, MEATHEAD_INTRO_VOICE, {
      onStart: () => { state.isMeatheadSpeaking = true; },
      onDone: () => { state.isMeatheadSpeaking = false; },
    });
    state.playerLastVulgarity = quote;
    state.playerVulgarityTimer = 180;
  }

  if (state.introTimer < INTRO_JUMP_START) {
    player.pos.x = baseStartX - 150;
  } else {
    if (state.introTimer === INTRO_JUMP_START) ctx.fx.spawnGlassShatter({ x: baseStartX, y: 450 });
    const t = Math.min(1.0, (state.introTimer - INTRO_JUMP_START) / INTRO_JUMP_FRAMES);
    const peakHeight = 250, groundY = 486, startY = 400;
    player.pos.x = baseStartX - 100 + (t * 250);
    player.pos.y = startY + (groundY - startY) * t - Math.sin(t * Math.PI) * peakHeight;
    if (state.introTimer >= INTRO_JUMP_START + INTRO_JUMP_FRAMES) {
      player.pos.y = groundY;
      player.pos.x = baseStartX + 150;
      player.vel = { x: 0, y: 0 };
      ctx.events.onIntroComplete();
    }
  }
  moveLooseParticles(ctx);
};

/** The boss door opens, the camera and player glide into the arena, and the door shuts behind them. */
const updateBossTransition = (ctx: FrameContext) => {
  const { state, stageId } = ctx;
  const { player } = state;
  const targetCameraX = BOSS_DOOR_X;
  const targetPlayerX = stageId === 'Toxic Tommy' ? targetCameraX + 45 : targetCameraX + 150;
  const targetPlayerY = stageId === 'Toxic Tommy' ? 480 - 64 : 486;
  const glideSpeed = 4;

  if (state.doorState === 'opening') {
    state.doorOpenAmount += DOOR_OPEN_SPEED;
    if (state.doorOpenAmount >= 150) { state.doorOpenAmount = 150; state.doorState = 'open'; }
  } else if (state.doorState === 'open') {
    if (state.camera.x < targetCameraX) state.camera.x = Math.min(targetCameraX, state.camera.x + glideSpeed);
    if (player.pos.x < targetPlayerX) player.pos.x = Math.min(targetPlayerX, player.pos.x + glideSpeed);
    if (state.camera.x >= targetCameraX && player.pos.x >= targetPlayerX) state.doorState = 'closing';
  } else if (state.doorState === 'closing') {
    state.doorOpenAmount -= DOOR_OPEN_SPEED;
    if (state.doorOpenAmount <= 0) {
      state.doorOpenAmount = 0;
      state.doorState = 'done';
      player.isCharging = false;
      player.isSliding = false;
      player.isUppercutting = false;
      player.isDivekicking = false;
      ctx.events.onBossEncounter();
    }
  }
  player.pos.y += (targetPlayerY - player.pos.y) * 0.1;
  player.vel = { x: 0, y: 0 };
  player.facing = 1;
  state.projectiles = [];
};

/** After the boss dies, spell out "VICTORY" one letter at a time, then report back. */
const updateVictorySequence = (ctx: FrameContext) => {
  const { state } = ctx;
  resetPlayerCombatState(state.player);
  state.playerStunTimer = 0;
  state.projectiles = [];
  moveLooseParticles(ctx);

  const fullStr = "VICTORY";
  if (state.victoryString.length >= fullStr.length) return;
  state.postVictoryTimer++;
  if (state.postVictoryTimer >= 30) {
    state.victoryString += fullStr[state.victoryString.length];
    state.postVictoryTimer = 0;
    if (state.victoryString.length === fullStr.length) setTimeout(() => ctx.events.onBossDefeated(ctx.stageId || ""), 2000);
  }
};

// ---------------------------------------------------------------------------
// Gameplay
// ---------------------------------------------------------------------------

const updatePlaying = (ctx: FrameContext, controls: Controls): boolean => {
  const { state } = ctx;
  const { player } = state;
  if (player.pos.x >= BOSS_DOOR_X && state.doorState === 'done') state.arenaLocked = true;
  if (state.victoryString) { updateVictorySequence(ctx); return false; }

  updateBarfStream(state);
  updateTsunami(ctx);
  updateSteamExplosions(ctx);

  // Meathead only animates during live gameplay (not intros, boss deaths or victory)
  state.playerAnimFrame++;
  const formBeforeHits = getSpecialForm(player);
  const healthBeforeHits = player.health;
  const input = gateControls(ctx, controls);
  tickPlayerTimers(ctx, input);
  updateTaser(ctx, input);

  state.totalPullForceX = 0;
  updateBurningProjectiles(ctx);
  updateEnemyStatusEffects(ctx);
  updateVolcanoes(ctx);
  updateOscarHazards(ctx);

  updatePlayerActions(ctx, input);
  updatePlayerPhysics(ctx, input);
  updateFlameSegments(ctx);
  updateTommyArena(ctx);
  if (state.ernieVibrationTimer > 0) {
    state.ernieVibrationTimer--;
    if (player.isGrounded && !ctx.cheats.invincible && state.playerStunTimer <= 0) state.playerStunTimer = PLAYER_STUN_DURATION;
  }

  const enemies = state.enemies;
  state.enemies = enemies.filter(e => updateEnemy(ctx, e, enemies));
  // Note: projectiles spawned while this filter runs (shrapnel, ice shards) are not kept.
  state.projectiles = state.projectiles.filter(p => updateProjectile(ctx, p));
  updateSpecialMovesVsBarrels(ctx);
  updatePickups(ctx);
  updateParticlesAndNumbers(ctx);
  updateCamera(ctx);

  // Hurt mid-special: cancel the move and play its recovery animation
  if (player.health < healthBeforeHits && player.health > 0) {
    const form = getSpecialForm(player) || formBeforeHits;
    if (form) interruptSpecialWithHurt(ctx, form);
  }
  if ((player.health <= 0 || player.pos.y > 1000) && state.deathTimer <= 0) killPlayer(ctx, "YOU DIED");
  if (player.isTasing && player.currentWeapon === 'TASER' && state.frame % 3 === 0) ctx.fx.playGunSound('taser');
  return true;
};

// ---------------------------------------------------------------------------
// Pickups, particles, camera
// ---------------------------------------------------------------------------

const updatePickups = (ctx: FrameContext) => {
  const { state } = ctx;
  const { player } = state;
  state.pickups = state.pickups.filter(p => {
    p.vel.y += GRAVITY;
    p.pos.x += p.vel.x;
    p.pos.y += p.vel.y;
    p.vel.x *= 0.9;
    p.life--;
    state.blocks.forEach(b => {
      if (b.type !== 'pit' && rectsOverlap(boundsOf(p), b)) { p.pos.y = b.y - p.height; p.vel.y = 0; }
    });

    if (!rectsOverlap(boundsOf(p), boundsOf(player))) return p.life > 0;
    if (p.type.includes('health')) {
      player.health = Math.min(player.maxHealth, player.health + (p.type === 'large_health' ? HEALTH_PICKUP_LARGE : HEALTH_PICKUP_SMALL));
    } else {
      // Ammo goes to the equipped weapon (the gun has infinite ammo, so it tops up the boulder)
      const target: WeaponType = player.currentWeapon === 'GUN' ? 'BOULDER' : player.currentWeapon;
      const pct = p.type === 'large_ammo' ? AMMO_PICKUP_PCT.LARGE : AMMO_PICKUP_PCT.SMALL;
      player.weaponAmmo[target] = Math.min(MAX_AMMO[target], player.weaponAmmo[target] + MAX_AMMO[target] * pct);
    }
    return false;
  });
};

const updateParticlesAndNumbers = (ctx: FrameContext) => {
  const { state } = ctx;
  state.particles = state.particles.filter(p => {
    if (!p.isStuck) {
      p.pos.x += p.vel.x;
      p.pos.y += p.vel.y;
      // Glass and fire fall and bounce on the floor
      if (p.isGlass || (p.color && PARTICLE_PALETTES.FIRE.includes(p.color))) {
        p.vel.y += 0.25;
        if (p.pos.y > 548) { p.pos.y = 548; p.vel.y = -p.vel.y * 0.3; p.vel.x *= 0.8; }
      }
      p.life--;
    }
    return p.life > 0;
  });
  state.damageNumbers = state.damageNumbers.filter(d => {
    d.pos.x += d.vel.x;
    d.pos.y += d.vel.y;
    if (d.isCallout) d.vel.y *= 0.92; // callouts float
    else d.vel.y += 0.15;
    d.life--;
    return d.life > 0;
  });
};

const updateCamera = (ctx: FrameContext) => {
  const { state, stageId } = ctx;
  const { player } = state;
  const followX = player.pos.x - CANVAS_WIDTH / 2 + player.width / 2;
  if (!state.arenaLocked && state.victoryString === "" && state.bossExplosionTimer <= 0) {
    // Camera follows the player but can't scroll past the closed boss door
    const maxX = state.doorState === 'closed' ? BOSS_DOOR_X + DOOR_WIDTH - CANVAS_WIDTH : getStageWidth(stageId) - CANVAS_WIDTH;
    state.camera.x = Math.max(0, Math.min(maxX, followX));
  } else if (state.arenaLocked && stageId === 'Oily Oscar') {
    // Oscar's arena is two screens wide, so the camera scrolls inside it
    state.camera.x = Math.max(BOSS_DOOR_X, Math.min(getStageWidth(stageId) - CANVAS_WIDTH, followX));
  }
  if (stageId === 'Toxic Tommy' && state.arenaLocked) {
    // Tommy's arena has no ceiling: follow high jumps
    const targetCamY = player.pos.y < 220 ? player.pos.y - 220 : 0;
    state.camera.y += (targetCamY - state.camera.y) * 0.15;
  } else {
    state.camera.y = 0;
  }
};
