// Top-level game loop step: dispatches on game status and runs each gameplay system in order.

import { GameStatus, WeaponType } from '../../types';
import {
  CANVAS_WIDTH, GRAVITY, BOSS_DOOR_X, DOOR_WIDTH, ARENA_RIGHT, DOOR_OPEN_SPEED, MAX_AMMO,
  AMMO_PICKUP_PCT, HEALTH_PICKUP_SMALL, HEALTH_PICKUP_LARGE, PLAYER_STUN_DURATION, PARTICLE_PALETTES,
  SPOKEN_TEXT_HOLD, SPOKEN_TEXT_LINGER, CANVAS_HEIGHT,
} from '../../constants';
import { BOSS_DIALOGUE } from '../../content/dialogue';
import { FrameContext } from './context';
import { Controls } from '../platform/input';
import { respawn, getStartX } from './level';
import { updateSewerNuke } from '../scenes/sewerNuke';
import { updateEnemyDeaths } from '../enemies/deaths';
import { updateVolcanoFinale } from '../scenes/volcanoFinale';
import { calmPlayer, DEFAULT_SHAKE, shakeScreen } from './state';
import { playSound } from '../platform/audio';
import { LEVEL_INTRO_STYLE } from '../../constants';
import { updateBarfStream, updateFlameSegments } from '../combat/weapons';
import { say, isTalking, deathAnnouncing, stopDeathAnnouncer, MEATHEAD_INTRO_VOICE } from '../platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../platform/skip';
import { pickRandom, rectsOverlap, boundsOf } from './utils';
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
import { groundLineAt, floorTopAt } from './terrain';

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

const moveLooseParticles = (ctx: FrameContext) => {
  ctx.state.particles = ctx.state.particles.filter(p => {
    if (!p.isStuck) { p.pos.x += p.vel.x; p.pos.y += p.vel.y; p.life--; }
    return p.life > 0;
  });
};

/** The longest the death screen waits on the death announcer past its own time (frames). */
const DEATH_HOLD_MAX = 480;

/** Player is dead: let the gore settle, then respawn. Skipping it goes straight to the next try (and cuts the death announcer off). */
const updateDeathScreen = (ctx: FrameContext) => {
  const { state } = ctx;
  state.deathFrames++;
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
  const baseStartX = getStartX(cheats.skipToBoss, stageId);
  state.camera.x = baseStartX;
  player.facing = 1;

  const quotes = stageId ? BOSS_DIALOGUE.INTRO_QUOTES[stageId] : undefined;
  const sayLineNow = LEVEL_INTRO_STYLE === 'window' ? state.introTimer === 30 : !!state.introLandedAt && state.introTimer === state.introLandedAt + SKYFALL_LINE_AT;
  if (sayLineNow && !cheats.skipToBoss && quotes) {
    const quote = quotes[0];
    const said = say(quote, MEATHEAD_INTRO_VOICE, 'queue', {
      onShow: spoken => { state.playerLastVulgarity = quote; state.playerVulgarityTimer = spoken ? SPOKEN_TEXT_HOLD : 180; },
      onHide: () => { if (state.playerLastVulgarity === quote) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, SPOKEN_TEXT_LINGER); },
      onDone: () => { state.isMeatheadSpeaking = false; },
    });
    if (said) state.isMeatheadSpeaking = true;
  }

  if (LEVEL_INTRO_STYLE === 'skyfall') {
    skyfall(ctx, baseStartX + 150);
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
const skyfall = (ctx: FrameContext, x: number) => {
  const { state } = ctx;
  const { player } = state;
  player.pos.x = x;
  // The first ground on screen under him (not the ceiling some stages have above the top of the screen)
  const ground = floorTopAt(state.blocks, x + player.width / 2, state.camera.y, 0) ?? 550;
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

/** The boss door opens, the camera and player glide into the arena, and the door shuts behind them. */
const updateBossTransition = (ctx: FrameContext) => {
  const { state, stageId } = ctx;
  const { player } = state;
  const targetCameraX = BOSS_DOOR_X;
  const entry = getBossDef(stageId)?.arena?.entry ?? { x: 150, y: 486 };
  const targetPlayerX = targetCameraX + entry.x;
  const targetPlayerY = entry.y;
  const glideSpeed = 4;

  if (state.doorState === 'opening') {
    state.doorOpenAmount += DOOR_OPEN_SPEED;
    if (state.doorOpenAmount >= 150) { state.doorOpenAmount = 150; state.doorState = 'open'; }
  } else if (state.doorState === 'open') {
    if (state.camera.x < targetCameraX) state.camera.x = Math.min(targetCameraX, state.camera.x + glideSpeed);
    // (and level with the arena, if it was following him up or down)
    state.camera.y += (0 - state.camera.y) * 0.1;
    if (player.pos.x < targetPlayerX) player.pos.x = Math.min(targetPlayerX, player.pos.x + glideSpeed);
    if (state.camera.x >= targetCameraX && player.pos.x >= targetPlayerX) state.doorState = 'closing';
  } else if (state.doorState === 'closing') {
    state.doorOpenAmount -= DOOR_OPEN_SPEED;
    if (state.doorOpenAmount <= 0) {
      state.doorOpenAmount = 0;
      state.doorState = 'done';
      // The door's shut behind him: drop out of whatever pose he came in with, standing on the arena floor
      calmPlayer(player);
      player.pos.y = targetPlayerY;
      player.isGrounded = true;
      state.bossCheckpoint = true;
      ctx.events.onBossEncounter();
    }
  }
  // Like Mega Man: he's frozen mid-pose (mid-jump, crouched, mid-charge...) while the screen scrolls him through
  player.vel = { x: 0, y: 0 };
  player.facing = 1;
  state.projectiles = [];
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
    ctx.events.onBossDefeated(ctx.stageId || "", state.bossCorpse?.weapon);
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

const updatePlaying = (ctx: FrameContext, controls: Controls): boolean => {
  const { state } = ctx;
  const { player } = state;
  if (player.pos.x >= BOSS_DOOR_X && state.doorState === 'done') state.arenaLocked = true;
  if (state.victoryString) { updateVictorySequence(ctx); return false; }
  // A hand-built stage runs its hazards and set pieces (and can take over the controls for cutscenes)
  const layout = getStageLayout(ctx.stageId);
  if (layout && !state.arenaLocked) controls = layout.update(ctx, controls);

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
  updateCamera(ctx);

  // Hurt mid-special: cancel the move and play its recovery animation
  if (player.health < healthBeforeHits && player.health > 0) {
    const form = getSpecialForm(player) || formBeforeHits;
    if (form) interruptSpecialWithHurt(ctx, form);
  }
  // Fell out of the world (down a pit): relative to the camera, which doesn't follow falls
  if ((player.health <= 0 || player.pos.y > state.camera.y + 1000) && state.deathTimer <= 0) killPlayer(ctx, layout?.deathMessage?.(ctx) ?? "YOU DIED");
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

    if (!rectsOverlap(boundsOf(p), boundsOf(player))) return p.life > 0;
    playSound(p.type.includes('health') ? 'pickup' : 'reload');
    if (p.type.includes('health')) {
      player.health = Math.min(player.maxHealth, player.health + (p.type === 'large_health' ? HEALTH_PICKUP_LARGE : HEALTH_PICKUP_SMALL));
    } else {
      const target = ammoTarget(state);
      const pct = p.type === 'large_ammo' ? AMMO_PICKUP_PCT.LARGE : AMMO_PICKUP_PCT.SMALL;
      if (target) player.weaponAmmo[target] = Math.min(MAX_AMMO[target], player.weaponAmmo[target] + MAX_AMMO[target] * pct);
    }
    return false;
  });
};

const updateParticlesAndNumbers = (ctx: FrameContext) => {
  updateParticles(ctx);
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
const nextLanding = (blocks: FrameContext['state']['blocks'], player: FrameContext['state']['player']): number | null => {
  const dir = Math.abs(player.vel.x) > 0.5 ? Math.sign(player.vel.x) : player.facing;
  const feet = player.pos.y + player.height;
  const cx = player.pos.x + player.width / 2;
  let lowest: number | null = null;
  for (let d = 20; d <= CAMERA_LOOK_AHEAD; d += 20) {
    // (the topmost surface at that x that isn't way up over his head)
    const top = floorTopAt(blocks, cx + dir * d, feet - 60, 0);
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
    // Ground under him (null over a pit, where the camera doesn't follow him down)
    const below = floorTopAt(floors, player.pos.x + player.width / 2, feet, 0);
    if (player.swimming && !underwater) state.cameraRestY = (player.swimSurfaceY ?? feet) + 10 - row;
    else if (player.isGrounded) state.cameraRestY = feet - row;
    // Dropping toward lower ground: head down to meet it rather than waiting for him to land
    else if (player.vel.y > 0 && below !== null) state.cameraRestY = Math.max(state.cameraRestY, below - row);
    // And never so high that the next thing to stand on is out of sight below: the ground (or ledge) along the way
    // he's headed, stepping down or across a gap, is kept up off the bottom of the screen
    const landing = player.skiing || player.jetski || player.swimming ? null : nextLanding(floors, player);
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
