// Top-level game loop step: dispatches on game status and runs each gameplay system in order.

import { isMidBoss } from '../combat/midBoss';
import { updateGut, isShat } from '../player/gut';
import { GameStatus, WeaponType } from '../../types';
import {
  CANVAS_WIDTH, GRAVITY, BOSS_DOOR_X, DOOR_WIDTH, ARENA_RIGHT, KICK_POSE_FRAMES, MAX_AMMO,
  AMMO_PICKUP_PCT, HEALTH_PICKUP_SMALL, HEALTH_PICKUP_LARGE, PLAYER_STUN_DURATION, PARTICLE_PALETTES,
  SPOKEN_TEXT_HOLD, SPOKEN_TEXT_LINGER, CANVAS_HEIGHT, GROUND_Y,
} from '../../constants';
import { BOSS_DIALOGUE, CHECKPOINT_CALLOUTS } from '../../content/dialogue';
import { FrameContext } from './context';
import { Controls } from '../platform/input';
import { respawn, getStartX } from './level';
import { updateSewerNuke } from '../scenes/sewerNuke';
import { updateEnemyDeaths } from '../enemies/deaths';
import { updateVolcanoFinale } from '../scenes/volcanoFinale';
import { calmPlayer, DEFAULT_SHAKE, shakeScreen, BOSS_FALL, STAIN_FRAMES, SMEAR_FRAMES, BLAST_FRAMES } from './state';
import { playSound } from '../platform/audio';
import { LEVEL_INTRO_STYLE } from '../../constants';
import { updateBarfStream, updateFlameSegments } from '../combat/weapons';
import { updateBlood } from '../player/blood';
import { say, isTalking, deathAnnouncing, stopDeathAnnouncer, announceDeath, silenceAll, MEATHEAD_INTRO_VOICE } from '../platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../platform/skip';
import { pickRandom, rectsOverlap, boundsOf, isOnScreen } from './utils';
import { deathByCause, deathFallback } from './deathCause';
import { killPlayer, DEATH_SCREEN_FRAMES, gateControls, tickPlayerTimers, updatePlayerActions, updatePlayerPhysics, getSpecialForm, interruptSpecialWithHurt } from '../player/player';
import { updateTsunami, updateSteamExplosions, updateVolcanoes, updateTommyArena } from '../bosses/hazards';
import { updateTaser, updateBurningProjectiles, updateEnemyStatusEffects } from '../combat/statusEffects';
import { updateEnemy, separateEnemies } from '../enemies/enemies';
import { updateGapGrace } from '../enemies/kinds';
import { updateProjectile, updateSpecialMovesVsBarrels } from '../combat/projectiles';
import { updateOscarHazards } from '../bosses/oscar';
import { isGoreColor } from './effects';
import { updateVictoryPee, peeFinished } from '../scenes/victoryPee';
import { getBossDef, getArenaRight, getStageWidth } from '../bosses/registry';
import { getStageLayout } from '../stages';
import { groundLineAt, floorTopAt, runYAt } from './terrain';

const INTRO_JUMP_START = 80;
const INTRO_JUMP_FRAMES = 60;

/** Skyfall: where he starts above the top of the screen, how fast he's already going, and how he falls. */
const SKYFALL_START_ABOVE = 700, SKYFALL_START_SPEED = 12, SKYFALL_GRAVITY = 0.9, SKYFALL_MAX_SPEED = 30;
/** Skyfall: frames crouched in the landing, when he says his line, and when you get control. */
const SKYFALL_CROUCH = 24, SKYFALL_LINE_AT = 14, SKYFALL_DONE_AT = 72;

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
  if (state.volcanoFinale) { updateVolcanoFinale(ctx); return false; }
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

/** The fire-meets-oil blasts, playing out. */
const tickBlasts = (state: FrameContext['state']) => {
  if (!state.blasts?.length) return;
  for (const b of state.blasts) b.t++;
  state.blasts = state.blasts.filter(b => b.t < BLAST_FRAMES);
};

const moveLooseParticles = (ctx: FrameContext) => {
  tickBlasts(ctx.state);
  ctx.state.particles = ctx.state.particles.filter(p => {
    if (!p.isStuck) { p.pos.x += p.vel.x; p.pos.y += p.vel.y; p.life--; }
    return p.life > 0;
  });
};

/** The longest the death screen waits on the death announcer past its own time (frames). */
const DEATH_HOLD_MAX = 480;

/** Player is dead: let the gore settle, then respawn. Skipping it goes straight to the next try (and cuts the death announcer off). */
/** A held death: the burst gets going for a few frames, then it all stops dead, a still, before the death screen. */
const FREEZE_BURST = 7, FREEZE_HOLD = 55;

const updateDeathScreen = (ctx: FrameContext) => {
  const { state } = ctx;
  if (state.deathFreeze !== undefined) {
    state.deathFreeze++;
    if (state.deathFreeze <= FREEZE_BURST) moveLooseParticles(ctx);
    if (state.deathFreeze < FREEZE_BURST + FREEZE_HOLD) return;
    state.deathFreeze = undefined;
  }
  state.deathFrames++;
  // A stage's own death scene plays out first; then the message goes up, and is read out
  const scene = state.deathScene;
  if (scene && scene.t < scene.len) {
    scene.t++;
    getStageLayout(ctx.stageId)?.deathSceneTick?.(ctx, scene.t);
    if (scene.t === scene.len) announceDeath(state.deathString);
    if (state.deathFrames > SKIP_AFTER) offerSkip();
    if (takeSkip()) { stopDeathAnnouncer(); silenceAll(); state.deathTimer = 0; state.deathScene = undefined; respawn(state, ctx.stageId, ctx.cheats.skipToBoss); }
    moveLooseParticles(ctx);
    return;
  }
  if (state.player.headless) {
    state.player.headless++;
    // (shot in mid-air: what's left of him comes down onto whatever's under him first)
    const p = state.player, feet = p.pos.y + p.height;
    const floor = floorTopAt(state.blocks, p.pos.x + p.width / 2, feet, 0);
    if (floor !== null && feet < floor - 0.5) { p.vel.y = Math.min(16, p.vel.y + 0.8); p.pos.y = Math.min(floor - p.height, p.pos.y + p.vel.y); p.isGrounded = false; }
    else if (floor !== null) { p.pos.y = floor - p.height; p.vel.y = 0; p.isGrounded = true; }
  }
  if (state.deathFrames > SKIP_AFTER) offerSkip();
  if (takeSkip()) { stopDeathAnnouncer(); state.deathTimer = 0; respawn(state, ctx.stageId, ctx.cheats.skipToBoss); return; }
  // (sat out, it waits for the death announcer to finish)
  if (state.deathTimer === 1 && deathAnnouncing() && state.deathFrames < DEATH_SCREEN_FRAMES + DEATH_HOLD_MAX) { moveLooseParticles(ctx); return; }
  state.deathTimer--;
  if (state.sewerNuke) updateSewerNuke(ctx);
  if (state.deathTimer === 0) { stopDeathAnnouncer(); respawn(state, ctx.stageId, ctx.cheats.skipToBoss); }
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
  // (started at a checkpoint: the drop's there, and the camera with it)
  const at = state.introAt;
  const baseStartX = at ? at.x - 150 : getStartX(cheats.skipToBoss, stageId);
  state.camera.x = at ? Math.max(state.cameraMinX, at.x - 250) : baseStartX;
  if (at) state.camera.y = state.cameraRestY;
  player.facing = 1;
  // (already there: on his feet where he starts, and away)
  if (getStageLayout(stageId)?.startsStanding) {
    player.pos.x = baseStartX + 150;
    player.pos.y = (at?.y ?? GROUND_Y) - player.height;
    player.vel = { x: 0, y: 0 };
    player.isGrounded = true;
    ctx.events.onIntroComplete();
    return;
  }
  // (started at a checkpoint: he drops out of the sky there, same as at the start)

  const quotes = stageId ? BOSS_DIALOGUE.INTRO_QUOTES[stageId] : undefined;
  const sayLineNow = LEVEL_INTRO_STYLE === 'window' ? state.introTimer === 30 : !!state.introLandedAt && state.introTimer === state.introLandedAt + SKYFALL_LINE_AT;
  if (sayLineNow && !cheats.skipToBoss && !at && quotes) {
    const quote = quotes[0];
    const said = say(quote, MEATHEAD_INTRO_VOICE, 'queue', {
      onShow: spoken => { state.playerLastVulgarity = quote; state.playerVulgarityTimer = spoken ? SPOKEN_TEXT_HOLD : 180; },
      onHide: () => { if (state.playerLastVulgarity === quote) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, SPOKEN_TEXT_LINGER); },
      onDone: () => { state.isMeatheadSpeaking = false; },
    });
    if (said) state.isMeatheadSpeaking = true;
  }

  if (LEVEL_INTRO_STYLE === 'skyfall') {
    skyfall(ctx, baseStartX + 150, at?.y ?? (cheats.skipToBoss ? getStageLayout(stageId)?.bossStartY : undefined));
  } else if (state.introTimer < INTRO_JUMP_START) {
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

/** He plummets out of the sky onto the start of the stage, craters the snow (or dirt), and gets up swinging. */
const skyfall = (ctx: FrameContext, x: number, floor?: number) => {
  const { state } = ctx;
  const { player } = state;
  player.pos.x = x;
  // The first ground on screen under him (not the ceiling some stages have above the top of the screen); at a
  // checkpoint, the floor the checkpoint's on (indoors, he comes down through whatever's over it)
  const ground = floor ?? floorTopAt(state.blocks, x + player.width / 2, state.camera.y, 0) ?? 550;
  if (state.introTimer === 1) {
    player.pos.y = state.camera.y - SKYFALL_START_ABOVE;
    player.vel = { x: 0, y: SKYFALL_START_SPEED };
    state.introLandedAt = 0;
  }
  if (!state.introLandedAt) {
    // Falling: faster and faster, wind streaking past him
    player.vel.y = Math.min(SKYFALL_MAX_SPEED, player.vel.y + SKYFALL_GRAVITY);
    player.pos.y += player.vel.y;
    player.isGrounded = false;
    if (state.frame % 2 === 0) state.particles.push({ pos: { x: x + Math.random() * player.width, y: player.pos.y - 10 }, vel: { x: 0, y: -player.vel.y * 0.35 }, life: 10, color: 'rgba(255,255,255,0.7)', size: 2 + Math.random() * 2 });
    if (player.pos.y + player.height >= ground) {
      // Impact
      player.pos.y = ground - player.height;
      player.vel = { x: 0, y: 0 };
      player.isGrounded = true;
      player.squash = 1;
      state.introLandedAt = state.introTimer;
      shakeScreen(state, 24, 10);
      playSound('slam');
      const cx = x + player.width / 2;
      // (snow on the icy stages, dirt and rock everywhere else)
      const debris = getBossDef(ctx.stageId)?.slipperyFloor ? PARTICLE_PALETTES.POWDER : PARTICLE_PALETTES.ROCK;
      for (let i = 0; i < 36; i++) {
        const dir = i % 2 ? 1 : -1;
        state.particles.push({ pos: { x: cx + dir * Math.random() * 20, y: ground - 4 }, vel: { x: dir * (2 + Math.random() * 9), y: -Math.random() * 7 }, life: 30 + Math.random() * 25, color: debris[i % debris.length], size: 4 + Math.random() * 8 });
      }
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 60, y: ground - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -8 - Math.random() * 6 }, life: 40, color: '#78716C', size: 3 + Math.random() * 3 });
    }
  } else {
    // Superhero landing: crouched in the crater, then up
    const since = state.introTimer - state.introLandedAt;
    player.isDucking = since < SKYFALL_CROUCH;
    if (since >= SKYFALL_DONE_AT) {
      player.isDucking = false;
      state.introLandedAt = undefined;
      ctx.events.onIntroComplete();
    }
  }
};

/** The boss door: he walks up to it and kicks it in, it comes down flat into the room, and he walks in over it (no going back). */

/** In, the door shut, on his feet: the boss fight's on (its intro). */
const arriveInArena = (ctx: FrameContext) => {
  const { state } = ctx;
  state.doorState = 'done';
  state.player.isGrounded = true;
  state.bossCheckpoint = true;
  ctx.events.onBossEncounter(isShat(state));
};

/** The boss door going in: how long he winds up once he's in place, how long it takes to come down, the beat after. */
const KICK_WINDUP = 14, KICK_LANDS = 9, DOOR_FALL = 16, DOOR_SETTLE = 22;

const updateBossTransition = (ctx: FrameContext) => {
  const { state, stageId, fx } = ctx;
  const { player } = state;
  const targetCameraX = BOSS_DOOR_X;
  const entry = getBossDef(stageId)?.arena?.entry ?? { x: 150, y: 486 };
  const targetPlayerX = targetCameraX + entry.x;
  const targetPlayerY = entry.y;
  const glideSpeed = 4;
  let step = 0;
  player.facing = 1;
  state.projectiles = [];
  if ((player.kickPose || 0) > 0) player.kickPose!--;

  if (state.doorState === 'opening') {
    // Up to the door, a beat, and the boot: it comes off its hinges and down flat into the room
    const k = (state.doorKick ??= { t: 0 });
    k.t++;
    if (k.t === 1) calmPlayer(player);
    if (k.hitAt === undefined) {
      const spot = BOSS_DOOR_X - player.width - 16;
      const dx = spot - player.pos.x;
      if (Math.abs(dx) > 1.5) { step = Math.sign(dx) * Math.min(3, Math.abs(dx)); player.pos.x += step; }
      else if (k.readyAt === undefined) k.readyAt = k.t;
      // (the leg comes up and drives out: the boot meets the door when it's all the way out)
      else if (k.kickAt === undefined && k.t - k.readyAt >= KICK_WINDUP) { k.kickAt = k.t; player.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.6, -4); }
      else if (k.kickAt !== undefined && k.t - k.kickAt >= KICK_LANDS) {
        k.hitAt = k.t;
        fx.playGunSound('punch');
        playSound('crash', 0.9, -4);
        shakeScreen(state, 14, 7);
        // (the hinges and the bolts going, and whatever's on the door)
        for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: BOSS_DOOR_X + 4, y: 410 + Math.random() * 130 }, vel: { x: 2 + Math.random() * 6, y: -2 - Math.random() * 5 }, life: 30 + Math.random() * 20, color: i % 3 === 0 ? '#E5E7EB' : i % 3 === 1 ? '#71717A' : '#A8A29E', size: 2 + Math.random() * 4 });
      }
    } else {
      const u = k.t - k.hitAt;
      state.doorOpenAmount = Math.min(150, (u / DOOR_FALL) * 150);
      // (the view starts on into the room as it goes over, so you see it come down)
      if (state.camera.x < targetCameraX) state.camera.x = Math.min(targetCameraX, state.camera.x + glideSpeed);
      if (u === DOOR_FALL) {
        // Down flat on the floor: the slam, and the dust coming up off it
        playSound('slam'); playSound('thud', 0.8, -6);
        shakeScreen(state, 20, 10);
        for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: BOSS_DOOR_X + 40 + Math.random() * 150, y: GROUND_Y - 4 }, vel: { x: (Math.random() - 0.3) * 4, y: -1 - Math.random() * 3 }, life: 40 + Math.random() * 30, color: i % 2 ? 'rgba(168, 162, 158, 0.7)' : 'rgba(120, 113, 108, 0.6)', size: 6 + Math.random() * 8 });
      }
      if (u >= DOOR_FALL + DOOR_SETTLE) state.doorState = 'open';
    }
  } else if (state.doorState === 'open') {
    // In over it: the screen scrolling with him as he walks in
    if (state.camera.x < targetCameraX) state.camera.x = Math.min(targetCameraX, state.camera.x + glideSpeed);
    // (and level with the arena, if it was following him up or down)
    state.camera.y += (0 - state.camera.y) * 0.1;
    if (player.pos.x < targetPlayerX) { step = Math.min(glideSpeed, targetPlayerX - player.pos.x); player.pos.x += step; }
    // (onto wherever the arena has him stand: a board over the sludge, say)
    player.pos.y += (targetPlayerY - player.pos.y) * 0.2;
    if (state.camera.x >= targetCameraX && player.pos.x >= targetPlayerX) {
      calmPlayer(player);
      player.pos.y = targetPlayerY;
      player.isGrounded = true;
      player.vel = { x: 0, y: 0 };
      arriveInArena(ctx);
      return;
    }
  }
  // On his feet the whole way: the walk cycle going while he walks (up to the door, and in), still for the kick
  player.isGrounded = true;
  player.vel = { x: step, y: 0 };
  if (step !== 0) state.playerAnimFrame++;
};

/** After the boss dies, spell out "VICTORY" one letter at a time, then report back. */
/** Frames the finished VICTORY stays up before the weapon screen (plain kills). */
const VICTORY_HOLD = 120;
/** After a weakness kill: a beat after he zips up, and a cap in case he never gets there. */
const AFTER_PEE_HOLD = 30;
const MAX_WEAKNESS_HOLD = 600;
/** Whoever's talking gets to finish (and a beat after), up to this long past when it'd otherwise have gone. */
const TALK_BEAT = 30, MAX_TALK_WAIT = 900;

const updateVictorySequence = (ctx: FrameContext) => {
  const { state } = ctx;
  calmPlayer(state.player);
  // (killed him with a move of his own: held in it, the still of the kill; not after a weakness kill, he's off to the corpse)
  if (!state.bossCorpse && state.killPose) Object.assign(state.player, state.killPose);
  // (a boss going over, not his weakness: he hits the floor)
  const fb = state.bossFallen;
  if (fb) {
    const up = fb.e.pos.y + fb.e.height < fb.floor - 4 ? BOSS_FALL.DROP : 0;
    if (state.frame - fb.frame0 === up + BOSS_FALL.OVER) { shakeScreen(state, 16, 8); playSound('thud'); }
  }
  state.playerStunTimer = 0;
  state.projectiles = [];
  state.damageNumbers = [];
  if (state.bossCorpse) {
    // Weakness kill: the gore keeps dripping while he goes and pisses on the corpse
    dripStuckGore(state);
    updateParticles(ctx);
    updateVictoryPee(ctx);
  } else {
    moveLooseParticles(ctx);
  }

  const fullStr = "VICTORY";
  state.postVictoryTimer++;
  if (state.victoryString.length < fullStr.length) {
    if (state.postVictoryTimer >= 30) {
      state.victoryString += fullStr[state.victoryString.length];
      state.postVictoryTimer = 0;
    }
    return;
  }
  // Spelled out: hold, then freeze on the weapon screen (after the whiz, on a weakness kill)
  const done = state.bossCorpse
    ? (peeFinished(state.player.peeTimer) && state.postVictoryTimer >= AFTER_PEE_HOLD) || state.postVictoryTimer >= MAX_WEAKNESS_HOLD
    : state.postVictoryTimer >= VICTORY_HOLD;
  // (and nobody's still talking: let them finish, then a beat)
  state.victoryQuiet = isTalking() ? 0 : state.victoryQuiet + 1;
  const quiet = state.victoryQuiet >= TALK_BEAT || state.postVictoryTimer >= (state.bossCorpse ? MAX_WEAKNESS_HOLD : VICTORY_HOLD) + MAX_TALK_WAIT;
  if (done && quiet && !state.victoryReported) {
    state.victoryReported = true;
    ctx.events.onBossDefeated(ctx.stageId || "", state.bossCorpse?.weapon, isShat(state));
  }
};

/** Blood stuck to the walls and ceiling keeps letting go in drops. */
const dripStuckGore = (state: FrameContext['state']) => {
  if (state.frame % 2 !== 0) return;
  const stuck = state.particles.filter(p => p.isStuck && p.isBossGore);
  for (let k = 0; k < Math.min(3, stuck.length); k++) {
    const src = stuck[Math.floor(Math.random() * stuck.length)];
    state.particles.push({
      pos: { x: src.pos.x + src.size / 2, y: src.pos.y + src.size },
      vel: { x: 0, y: 0.3 + Math.random() * 0.5 },
      life: 120, color: src.color, size: 2 + Math.random() * 3,
    });
  }
};

// ---------------------------------------------------------------------------
// Gameplay
// ---------------------------------------------------------------------------

/**
 * A little cutscene in a stage (Meathead's not in control: a speech, a theft, a ride): everything that's out to get
 * him holds off till it's over. The regular enemies stop where they are and don't shoot (birds included), what they'd
 * already fired fizzles as it starts, and nothing touches him meanwhile. (Mid-bosses and bosses run their own scenes.)
 */
const holdOffForCutscene = (ctx: FrameContext) => {
  const { state } = ctx;
  const p = state.player;
  const on = !!p.inCutscene && state.deathTimer <= 0;
  if (on && !state.cutsceneHold) state.projectiles = state.projectiles.filter(pj => pj.owner !== 'enemy' || pj.visualOnly);
  state.cutsceneHold = on;
  if (!on) return;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  for (const e of state.enemies) {
    if (e.type === 'boss' || isMidBoss(e) || e.health <= 0 || e.isBlownAway) continue;
    e.pauseTimer = Math.max(e.pauseTimer || 0, 2);
    e.vel = { x: 0, y: 0 };
    e.shootTimer = Math.max(e.shootTimer || 0, 30);
  }
};

/** How many slicks can be on the water at once, and how long one lasts (frames). */
const MAX_STAINS = 24;

/**
 * Sludge or an oil rocket going into clean water fouls it: a slick spreads out on the surface where it went in, and
 * fades after a while. (Flint's water can't get any worse.) The sludge sinks where it goes in.
 */
const stainWater = (ctx: FrameContext) => {
  const { state, stageId } = ctx;
  const waterAt = getStageLayout(stageId)?.waterBodyAt;
  if (!waterAt) return;
  for (const p of state.projectiles) {
    if (p.stainedWater || p.owner !== 'player' || p.health <= 0 || !(p.isSludge || p.isOilRocket)) continue;
    const x = p.pos.x + p.width / 2, y = p.pos.y + p.height / 2;
    const body = waterAt(state, x, y);
    if (!body || body.kind !== 'clean' || y < body.surface) continue;
    p.stainedWater = true;
    const stains = (state.waterStains ??= []);
    // (going in close to one that's still fresh just adds to it)
    const near = stains.find(s => s.kind === (p.isSludge ? 'sludge' : 'oil') && Math.abs(s.x - x) < 40 && state.frame - s.at < STAIN_FRAMES / 2);
    if (near) near.at = Math.max(near.at, state.frame - 60);
    else stains.push({ x, surface: body.surface, x1: body.x1, x2: body.x2, kind: p.isSludge ? 'sludge' : 'oil', at: state.frame });
    if (stains.length > MAX_STAINS) stains.shift();
    if (p.isSludge) p.health = 0;
  }
  if (state.waterStains?.length) state.waterStains = state.waterStains.filter(s => state.frame - s.at < STAIN_FRAMES);
  if (state.groundSmears?.length) state.groundSmears = state.groundSmears.filter(s => state.frame - s.at < SMEAR_FRAMES);
};

/** The checkpoint banner: off for now (it was going up at the wrong times; the checkpoints need looking at first). */
const CHECKPOINT_BANNER = false;

/** A new checkpoint reached: the banner goes up (nothing's said). Where the stage starts (or restarts) isn't shown. */
const callCheckpoint = (ctx: FrameContext) => {
  const { state } = ctx;
  if (state.checkpointCalled === undefined) { state.checkpointCalled = state.checkpoint; return; }
  if (state.checkpoint <= state.checkpointCalled) return;
  state.checkpointCalled = state.checkpoint;
  const text = pickRandom(CHECKPOINT_CALLOUTS);
  if (CHECKPOINT_BANNER) state.checkpointBanner = { text, at: state.frame };
};

const updatePlaying = (ctx: FrameContext, controls: Controls): boolean => {
  const { state } = ctx;
  const { player } = state;
  if (player.pos.x >= BOSS_DOOR_X && state.doorState === 'done') state.arenaLocked = true;
  if (state.victoryString) { updateVictorySequence(ctx); return false; }
  // A hand-built stage runs its hazards and set pieces (and can take over the controls for cutscenes)
  const layout = getStageLayout(ctx.stageId);
  if (layout && !state.arenaLocked) controls = layout.update(ctx, controls);
  callCheckpoint(ctx);
  holdOffForCutscene(ctx);

  updateBarfStream(state);
  updateTsunami(ctx);
  updateSteamExplosions(ctx);
  stainWater(ctx);

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
  updateGut(ctx, input);
  updateFlameSegments(ctx);
  updateTommyArena(ctx);
  if (state.ernieVibrationTimer > 0) {
    state.ernieVibrationTimer--;
    if (player.isGrounded && !ctx.cheats.invincible && state.playerStunTimer <= 0) state.playerStunTimer = PLAYER_STUN_DURATION;
  }

  const enemies = state.enemies;
  updateGapGrace(state);
  state.enemies = enemies.filter(e => updateEnemy(ctx, e, enemies));
  separateEnemies(state);
  // Note: projectiles spawned while this filter runs (shrapnel, ice shards) are not kept.
  // Projectiles spawned while these update (ice shards, splashes) are appended to the same
  // array but skipped by filter(): keep them, so they start moving next frame
  const current = state.projectiles;
  const count = current.length;
  const kept = current.filter(p => updateProjectile(ctx, p));
  if (state.projectiles === current) state.projectiles = kept.concat(current.slice(count));
  updateSpecialMovesVsBarrels(ctx);
  updatePickups(ctx);
  updateParticlesAndNumbers(ctx);
  updateBlood(ctx);
  updateCamera(ctx);

  // Hurt mid-special: cancel the move and play its recovery animation
  if (player.health < healthBeforeHits && player.health > 0) {
    const form = getSpecialForm(player) || formBeforeHits;
    if (form) interruptSpecialWithHurt(ctx, form);
  }
  // Fell out of the world (down a pit): relative to the camera, which doesn't follow falls
  if ((player.health <= 0 || player.pos.y > state.camera.y + 1000) && state.deathTimer <= 0) {
    // (the stage's own say first, then what got him, then the fall or the boss; plain YOU DIED only if nothing's known)
    const fell = player.health > 0;
    killPlayer(ctx, layout?.deathMessage?.(ctx) ?? (fell ? undefined : deathByCause(state)) ?? deathFallback(state, ctx.stageId, fell) ?? "YOU DIED");
  }
  if (player.isTasing && player.currentWeapon === 'TASER' && state.frame % 3 === 0) ctx.fx.playGunSound('taser');
  return true;
};

// ---------------------------------------------------------------------------
// Pickups, particles, camera
// ---------------------------------------------------------------------------

/**
 * Where an ammo pickup goes: the weapon in his hands if it's a special weapon that isn't full; otherwise (the gun
 * never runs out, or the one he's holding is topped off) whichever of the special weapons he's got is lowest, as a
 * share of its full load. Nothing, if they're all full.
 */
const ammoTarget = (state: FrameContext['state']): WeaponType | null => {
  const { player } = state;
  const ammo = player.weaponAmmo;
  const held = player.currentWeapon;
  if (held !== 'GUN' && (ammo[held] ?? 0) < MAX_AMMO[held]) return held;
  const owned = (state.availableWeapons ?? (Object.keys(MAX_AMMO) as WeaponType[])).filter(w => w !== 'GUN' && MAX_AMMO[w] > 0);
  let best: WeaponType | null = null, lowest = 1;
  for (const w of owned) {
    const share = (ammo[w] ?? 0) / MAX_AMMO[w];
    if (share < lowest) { lowest = share; best = w; }
  }
  return best;
};

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
    // Down in lava: it melts (a hiss, a flare, a puff of smoke, gone)
    const cx = p.pos.x + p.width / 2, lava = state.groundRuns.find(r => r.surface === 'lava' && cx > r.x1 && cx < r.x2);
    if (lava && p.pos.y + p.height >= runYAt(lava, cx) - 4) {
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: cx, y: p.pos.y + p.height }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 20 + Math.random() * 20, color: i % 3 ? '#F97316' : '#FDE047', size: 2 + Math.random() * 4 });
      for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 12, y: p.pos.y + p.height - 6 }, vel: { x: (Math.random() - 0.5) * 0.6, y: -0.8 - Math.random() }, life: 40, color: 'rgba(60, 50, 50, 0.6)', size: 6 + Math.random() * 6 });
      if (isOnScreen(state.camera, p)) playSound('ignite', 0.5, 6);
      return false;
    }

    if (!rectsOverlap(boundsOf(p), boundsOf(player))) return p.life > 0;
    playSound(p.type.includes('health') ? 'pickup' : 'reload');
    if (p.type.includes('health')) {
      player.health = Math.min(player.maxHealth, player.health + (p.type === 'large_health' ? HEALTH_PICKUP_LARGE : HEALTH_PICKUP_SMALL));
    } else {
      const target = p.weapon && MAX_AMMO[p.weapon] > 0 ? p.weapon : ammoTarget(state);
      const pct = p.type === 'large_ammo' ? AMMO_PICKUP_PCT.LARGE : AMMO_PICKUP_PCT.SMALL;
      if (target) player.weaponAmmo[target] = Math.min(MAX_AMMO[target], player.weaponAmmo[target] + MAX_AMMO[target] * pct);
    }
    return false;
  });
};

const updateParticlesAndNumbers = (ctx: FrameContext) => {
  updateParticles(ctx);
  tickBlasts(ctx.state);
  updateEnemyDeaths(ctx.state);
  updateDamageNumbers(ctx);
};

const updateParticles = (ctx: FrameContext) => {
  const { state, stageId } = ctx;
  // Tommy's arena floor is a sludge pool: blood just sinks into it
  const bloodSplatsOnFloor = !(state.arenaLocked && getBossDef(stageId)?.arena?.floorless);
  state.particles = state.particles.filter(p => {
    if (p.isSplat) {
      p.life--;
      return p.life > 0;
    }
    if (!p.isStuck) {
      p.pos.x += p.vel.x;
      p.pos.y += p.vel.y;
      // Blood arcs down and splats on the floor
      if (!p.isBossGore && isGoreColor(p.color)) {
        p.vel.y += 0.35;
        p.vel.x *= 0.99;
        const floor = groundLineAt(state.groundRuns, p.pos.x);
        if (bloodSplatsOnFloor && p.pos.y + p.size >= floor && p.pos.y + p.size < floor + 30) {
          p.isSplat = true;
          p.pos.y = floor - 2 - p.size / 2; // centred on the floor line
          p.vel = { x: 0, y: 0 };
          p.life = Math.max(p.life, 150 + Math.random() * 90);
          return true;
        }
      }
      // Glass and fire fall and bounce on the floor
      if (p.isGlass || (p.color && PARTICLE_PALETTES.FIRE.includes(p.color))) {
        p.vel.y += 0.25;
        const floor = groundLineAt(state.groundRuns, p.pos.x) - 2;
        if (p.pos.y > floor && p.pos.y < floor + 30) { p.pos.y = floor; p.vel.y = -p.vel.y * 0.3; p.vel.x *= 0.8; }
      }
      p.life--;
    }
    return p.life > 0;
  });
};

const updateDamageNumbers = (ctx: FrameContext) => {
  const { state } = ctx;
  state.damageNumbers = state.damageNumbers.filter(d => {
    d.pos.x += d.vel.x;
    d.pos.y += d.vel.y;
    if (d.isCallout) d.vel.y *= 0.92; // callouts float
    else d.vel.y += 0.15;
    d.life--;
    return d.life > 0;
  });
};

/** Where the camera rests vertically: the ground he's standing on sits this far down the screen. */
const CAMERA_GROUND_ROW = 550;
/** On skis he sits higher up the screen, so you can see down the mountain ahead of him. */
const CAMERA_SKI_ROW = 420;
/** On skis the ground (under him and just ahead) is always at least this far up from the bottom of the screen. */
const CAMERA_SKI_GROUND_MARGIN = 44;
/** Past this far up the screen, the camera rises with him. */
const CAMERA_TOP_MARGIN = 150;
/** He's never let any closer than this to the top of the screen, or (with ground under him) his feet to the bottom. */
const CAMERA_HARD_TOP = 70;
const CAMERA_HARD_BOTTOM = 36;
/** How quickly the camera eases toward where it wants to be. */
const CAMERA_EASE_Y = 0.2;
/** Looking ahead for somewhere to land: how far along, how far down it'll go looking, and how far up off the bottom of the screen it's kept. */
const CAMERA_LOOK_AHEAD = 380, CAMERA_LOOK_DOWN = 320, CAMERA_LANDING_MARGIN = 70;

/**
 * The lowest thing to stand on along the way he's going (or facing), within reach below him: the ground after a step
 * down, the far side of a gap, the next ledge down. Null if there's nothing lower than where he is.
 */
const nextLanding = (blocks: FrameContext['state']['blocks'], player: FrameContext['state']['player'], surfaceAt: (x: number, top: number | null) => number | null): number | null => {
  const dir = Math.abs(player.vel.x) > 0.5 ? Math.sign(player.vel.x) : player.facing;
  const feet = player.pos.y + player.height;
  const cx = player.pos.x + player.width / 2;
  let lowest: number | null = null;
  for (let d = 20; d <= CAMERA_LOOK_AHEAD; d += 20) {
    // (the topmost surface at that x that isn't way up over his head)
    const top = surfaceAt(cx + dir * d, floorTopAt(blocks, cx + dir * d, feet - 60, 0));
    if (top === null || top > feet + CAMERA_LOOK_DOWN || top <= feet + 4) continue;
    if (lowest === null || top > lowest) lowest = top;
  }
  return lowest;
};

const updateCamera = (ctx: FrameContext) => {
  const { state, stageId } = ctx;
  const { player } = state;
  const followX = player.pos.x - CANVAS_WIDTH / 2 + player.width / 2 + (state.cameraLeadX || 0);
  // Hills and heights: the camera settles on the ground he last stood on, and climbs with big jumps.
  // It doesn't follow falls (so a pit is a pit), and it's back at 0 by the flat ground at the boss door.
  const layout = getStageLayout(stageId);
  if (state.cameraOverride) {
    // A set piece has the camera
    state.camera.x += (state.cameraOverride.x - state.camera.x) * 0.15;
    state.camera.y += (state.cameraOverride.y - state.camera.y) * 0.15;
    if (Math.abs(state.cameraOverride.x - state.camera.x) < 0.5) state.camera.x = state.cameraOverride.x;
    if (Math.abs(state.cameraOverride.y - state.camera.y) < 0.5) state.camera.y = state.cameraOverride.y;
    return;
  }
  if (layout?.verticalCamera && !state.arenaLocked && state.victoryString === "" && state.doorState !== 'done') {
    const row = player.skiing ? CAMERA_SKI_ROW : (layout.cameraRow?.(state) ?? CAMERA_GROUND_ROW);
    const feet = player.pos.y + player.height;
    // (the bottom of the sea only counts once he's under: bobbing at the surface, or falling in, it stays up top)
    const underwater = !!player.swimming && player.pos.y > (player.swimSurfaceY ?? Infinity);
    const floors = underwater ? state.blocks : state.blocks.filter(b => b.tag !== 'seabed');
    // (the bottom of a pool of water isn't what he's coming down on: its surface is. Looking ahead to the bottom of a
    // flooded hole, the camera would lurch down to it and back up again past it)
    const waterAt = layout.waterBodyAt;
    const surfaceAt = (x: number, top: number | null) => {
      if (top === null || underwater || !waterAt) return top;
      const w = waterAt(state, x, top - 2);
      return w ? Math.min(top, w.surface) : top;
    };
    // Ground under him (null over a pit, where the camera doesn't follow him down)
    const below = surfaceAt(player.pos.x + player.width / 2, floorTopAt(floors, player.pos.x + player.width / 2, feet, 0));
    if (player.swimming && !underwater) state.cameraRestY = (player.swimSurfaceY ?? feet) + 10 - row;
    else if (player.isGrounded) state.cameraRestY = feet - row;
    // Dropping toward lower ground: head down to meet it rather than waiting for him to land
    else if (player.vel.y > 0 && below !== null) state.cameraRestY = Math.max(state.cameraRestY, below - row);
    // And never so high that the next thing to stand on is out of sight below: the ground (or ledge) along the way
    // he's headed, stepping down or across a gap, is kept up off the bottom of the screen
    const landing = player.skiing || player.jetski || player.swimming ? null : nextLanding(floors, player, surfaceAt);
    const rest = landing === null ? state.cameraRestY : Math.max(state.cameraRestY, landing - (CANVAS_HEIGHT - CAMERA_LANDING_MARGIN));
    const target = Math.min(rest, player.pos.y - CAMERA_TOP_MARGIN);
    state.camera.y += (target - state.camera.y) * (layout.cameraEaseY?.(state) ?? CAMERA_EASE_Y);
    if (Math.abs(target - state.camera.y) < 0.5) state.camera.y = target;
    // The easing never gets to leave him behind: he stays on screen however fast he's going
    state.camera.y = Math.min(state.camera.y, player.pos.y - CAMERA_HARD_TOP);
    if (below !== null) state.camera.y = Math.max(state.camera.y, feet - (CANVAS_HEIGHT - CAMERA_HARD_BOTTOM));
    if (player.skiing) {
      // On skis the snow never leaves the bottom of the screen, however big the jump (it's what's coming at you)
      const px = player.pos.x + player.width / 2;
      const ground = [px, px + 160, px + 320].map(x => groundLineAt(state.groundRuns, x)).filter(y => y !== Infinity);
      if (ground.length) state.camera.y = Math.max(state.camera.y, Math.max(...ground) - (CANVAS_HEIGHT - CAMERA_SKI_GROUND_MARGIN));
    }
  }
  if (!state.arenaLocked && state.victoryString === "" && state.bossExplosionTimer <= 0) {
    // Camera follows the player but can't scroll past the closed boss door (nor on the frame it starts opening: the
    // glide in takes it from there)
    const maxX = state.cameraMaxX ?? (state.doorState === 'closed' || state.doorState === 'opening' ? BOSS_DOOR_X + DOOR_WIDTH - CANVAS_WIDTH : getStageWidth(stageId) - CANVAS_WIDTH);
    state.camera.x = Math.max(state.cameraMinX, Math.min(maxX, followX));
  } else if (state.arenaLocked && getArenaRight(stageId) > ARENA_RIGHT) {
    // A wider-than-usual arena (Oscar's) scrolls with you
    state.camera.x = Math.max(BOSS_DOOR_X, Math.min(getStageWidth(stageId) - CANVAS_WIDTH, followX));
  }
  if (state.arenaLocked && getBossDef(stageId)?.arena?.openTop) {
    // No ceiling (Tommy's arena): follow high jumps
    const targetCamY = player.pos.y < 220 ? player.pos.y - 220 : 0;
    state.camera.y += (targetCamY - state.camera.y) * 0.15;
  } else if (!layout?.verticalCamera || state.arenaLocked || state.doorState === 'done') {
    state.camera.y = 0;
  }
};
