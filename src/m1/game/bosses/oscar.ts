// Oily Oscar: his AI, rockets, oil slicks and fire, the flicked cigarette,
// and how the taser beats him (hold him until it bursts, or zap the cigarette).

import { TaseCam, updateTaseCam } from '../stages/oscar/taseCam';
import { Enemy, Projectile, OilCell, Rect, Player } from '../../types';
import {
  ARENA_LEFT, OSCAR_ARENA_RIGHT, TASER_RANGE, TASER_OVERLOAD_FRAMES, ENEMY_HIT_COOLDOWN,
  PLAYER_PUSHBACK_VEL_X, PARTICLE_PALETTES,
  OSCAR_IDLE_FRAMES, OSCAR_IDLE_RAMP, OSCAR_SLIDE_SPEED, OSCAR_PREFERRED_DISTANCE, OSCAR_LOCK_FRAMES,
  OSCAR_MAX_AIM_FRAMES, OSCAR_ROCKET_SPEED, OSCAR_SPLASH_RADIUS, OSCAR_SPLASH_DAMAGE, OSCAR_OIL_RADIUS,
  OSCAR_OIL_CELL, OSCAR_OIL_FRAMES, OSCAR_FLICK_WINDUP, OSCAR_CIGARETTE_FLIGHT, OSCAR_CIGARETTE_GRAVITY,
  OSCAR_FIRE_FRAMES, OSCAR_FIRE_SPREAD_DELAY, OSCAR_FIRE_DAMAGE, OSCAR_TASER_HOLD_FRAMES,
  OSCAR_TASER_RELEASE_GRACE, OSCAR_BURST_DAMAGE, OSCAR_CIGARETTE_ZAP_FRAMES, OSCAR_CIGARETTE_COMBO_DAMAGE, OSCAR_CIGARETTE_COMBO_REACH,
  OSCAR_ASH_FACE_FRAMES, OSCAR_FIRE_WARNING,
} from '../../constants';
import { OSCAR_LINES } from '../../content/dialogue';
import type { FrameContext } from '../core/context';
import { GameState, shakeScreen } from '../core/state';
import { pickRandom, rectsOverlap, boundsOf } from '../core/utils';
import { BossDef, BOSS_WALL_GAP, FLOOR_Y, CEILING_Y, speakAsBoss, hurtPlayer as hurtMeathead, midX } from './shared';
import { say, isTalking, MEATHEAD_VOICE } from '../platform/speech';
import { tsunamiCovers, douseFire } from './hazards';

const OSCAR = 'Oily Oscar';
const ARENA_RIGHT = OSCAR_ARENA_RIGHT; // his room is double-wide
const LAUNCHER_LENGTH = 44;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const findOscar = (state: GameState) => state.enemies.find(e => e.type === 'boss' && e.health > 0);

// ---------------------------------------------------------------------------
// Geometry shared with the renderer
// ---------------------------------------------------------------------------

/** His shoulder-mounted launcher: pivot, aim angle and muzzle, in world space. */
export const getOscarLauncher = (boss: Enemy) => {
  const facing = boss.oscarFacing || -1;
  // Up on his shoulder on the side he's facing, clear of his face
  const pivotX = midX(boss) + facing * boss.width * 0.45;
  const pivotY = boss.pos.y + boss.height * 0.26;
  const aimX = boss.aimX ?? pivotX + facing * 200;
  const aimY = boss.aimY ?? pivotY + 40;
  const angle = Math.atan2(aimY - pivotY, aimX - pivotX);
  return {
    pivotX, pivotY, angle,
    muzzleX: pivotX + Math.cos(angle) * LAUNCHER_LENGTH,
    muzzleY: pivotY + Math.sin(angle) * LAUNCHER_LENGTH,
  };
};

/** Where the cigarette sits in his respirator. */
export const getOscarMouth = (boss: Enemy) => ({
  x: midX(boss) + (boss.oscarFacing || -1) * boss.width * 0.11,
  y: boss.pos.y + boss.height * 0.31,
});

/** How big a burning strip's flames are right now (0..1): they flare up, then die down. */
export const flameStrength = (cell: OilCell) =>
  cell.burn <= 0 ? 0 : Math.min(1, (OSCAR_FIRE_FRAMES - cell.burn) / 12, cell.burn / 40);

/** The area a burning strip's flames cover (they lick away from the surface). */
const flameRect = (c: OilCell): Rect => {
  switch (c.surface) {
    case 'floor': return { x: c.x, y: FLOOR_Y - 40, w: c.w, h: 40 };
    case 'ceiling': return { x: c.x, y: CEILING_Y, w: c.w, h: 36 };
    case 'left': return { x: ARENA_LEFT, y: c.y, w: 32, h: c.h };
    case 'right': return { x: ARENA_RIGHT - 32, y: c.y, w: 32, h: c.h };
  }
};

const playerHurtbox = (player: Player): Rect => {
  const box = boundsOf(player);
  if (player.isDucking || player.isSliding) { box.y += 28; box.h -= 28; }
  return box;
};

/** True while Meathead is standing on an oiled patch of floor. */
export const isStandingInOil = (state: GameState): boolean => {
  const { player } = state;
  if (!player.isGrounded || state.oilCells.length === 0) return false;
  const feet = player.pos.y + player.height;
  if (Math.abs(feet - FLOOR_Y) > 2) return false;
  const left = player.pos.x + 8, right = player.pos.x + player.width - 8;
  return state.oilCells.some(c => c.surface === 'floor' && c.x < right && c.x + c.w > left);
};

// ---------------------------------------------------------------------------
// AI
// ---------------------------------------------------------------------------

/** Runs after the shared boss update (which ticks stateTimer and health callouts). */
export const updateOscar = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  const { player } = state;
  if (boss.fireproofFlash && boss.fireproofFlash > 0) boss.fireproofFlash--;

  // (the camera, pulling back to take in whatever the taser's holding off the screen)
  const rt = state.stage as { taseCam?: TaseCam } | null;
  if (rt?.taseCam) updateTaseCam(state, rt.taseCam);
  // His cigarette hanging in the air in the taser's beam: he stops dead and stares at it, baffled
  const cigHeld = state.projectiles.some(p => p.isCigarette && p.health > 0 && state.frame - (p.zapAt ?? -9) <= 1);
  if (cigHeld !== !!boss.baffled) { boss.baffled = cigHeld; boss.faceMood = cigHeld ? 'baffled' : undefined; }
  if (cigHeld) { boss.vel.x = 0; boss.stateTimer = (boss.stateTimer || 0) + 1; return; }

  // He glides around on his own grease
  boss.pos.x += boss.vel.x;
  boss.vel.x *= 0.9;
  if (Math.abs(boss.vel.x) < 0.05) boss.vel.x = 0;
  boss.pos.x = clamp(boss.pos.x, ARENA_LEFT + BOSS_WALL_GAP, ARENA_RIGHT - boss.width - BOSS_WALL_GAP);
  boss.pos.y = FLOOR_Y - boss.height;
  if (!boss.oscarFacing) boss.oscarFacing = -1;

  const held = !!boss.taserHeldThisFrame;
  boss.taserHeldThisFrame = false;
  salesTalk(ctx, boss);
  // Letting go drains the burst meter
  if (boss.bossState !== 'taser_held' && boss.taserHold) boss.taserHold = Math.max(0, boss.taserHold - 3);

  switch (boss.bossState) {
    case 'taser_held':
      boss.vel.x = 0;
      boss.isTased = held;
      if (held) boss.taserGrace = 0;
      else if ((boss.taserGrace = (boss.taserGrace || 0) + 1) > OSCAR_TASER_RELEASE_GRACE) {
        boss.isTased = false;
        startIdle(boss, 45);
      }
      break;

    case 'ash_face':
      boss.vel.x = 0;
      if (state.frame % 6 === 0) {
        state.particles.push({ pos: { x: boss.pos.x + 20 + Math.random() * 40, y: boss.pos.y + 10 }, vel: { x: (Math.random() - 0.5) * 1.5, y: -1 - Math.random() * 1.5 }, life: 40, color: Math.random() > 0.5 ? '#616161' : '#9E9E9E', size: 3 + Math.random() * 4 });
      }
      if (boss.stateTimer! <= 0) startIdle(boss, 50);
      break;

    case 'aiming':
      faceTarget(boss, midX(player));
      updateAim(ctx, boss);
      break;

    case 'shooting':
      // Waits for his rocket to land, then goes for the cigarette
      if (boss.stateTimer! <= 0 && !state.projectiles.some(p => p.isOscarRocket)) {
        if (boss.impactX !== undefined && boss.hasCigarette) {
          boss.bossState = 'flicking';
          boss.stateTimer = OSCAR_FLICK_WINDUP;
          faceTarget(boss, boss.impactX);
        } else {
          startIdle(boss, idleFrames(boss));
        }
      }
      break;

    case 'flicking':
      if (boss.stateTimer! <= 0) {
        flickCigarette(ctx, boss);
        startIdle(boss, idleFrames(boss) + 20);
      }
      break;

    default:
      updateIdle(ctx, boss);
  }
};

/** How long between his offers (frames): the first soon after it starts, then each a while after the asset's answer to the last (he never shuts up). */
const FIRST_PITCH = 200, PITCH_GAP = 300, PITCH_GAP_RANGE = 180;
/** Frames of quiet after his pitch before Meathead answers. */
const REPLY_BREATH = 10;

/**
 * Talking the whole time: whatever's been done to his field, there's a sale in it; one pitch after another (the
 * asset doesn't understand a word of it). Once he's under half, it's the other way: anything, any money, to make him
 * go away (turned down, every time). Never while he's being zapped or choking on his ash, and never over anyone else.
 */
const salesTalk = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  if (!state.arenaLocked || boss.health <= 0) return;
  if (boss.pitchAt === undefined) boss.pitchAt = state.frame + FIRST_PITCH;
  // (Meathead's answer: once Oscar's done, and a breath)
  if (boss.pitchReply) {
    if (isTalking()) { boss.pitchQuiet = 0; return; }
    if ((boss.pitchQuiet = (boss.pitchQuiet ?? 0) + 1) < REPLY_BREATH) return;
    meatheadSays(state, boss.pitchReply);
    boss.pitchReply = undefined;
    // (the next one a while after that)
    boss.pitchAt = state.frame + PITCH_GAP + Math.round(Math.random() * PITCH_GAP_RANGE);
    return;
  }
  if (state.frame < boss.pitchAt || isTalking() || boss.bossState === 'taser_held' || boss.bossState === 'ash_face') return;
  boss.pitchAt = state.frame + PITCH_GAP + Math.round(Math.random() * PITCH_GAP_RANGE);
  let pitch: string, reply: string;
  // (he's walked in having shit himself: the whole conversation's about that)
  const shat = state.player.gut?.stage === 2;
  const [PITCH, PITCH_BACK, BRIBE, BRIBE_BACK] = shat
    ? [OSCAR_LINES.SHAT_PITCH, OSCAR_LINES.SHAT_PITCH_BACK, OSCAR_LINES.SHAT_BRIBE, OSCAR_LINES.SHAT_BRIBE_BACK]
    : [OSCAR_LINES.PITCH, OSCAR_LINES.PITCH_BACK, OSCAR_LINES.BRIBE, OSCAR_LINES.BRIBE_BACK];
  if (boss.health < boss.maxHealth / 2) {
    // (once he's offered everything he's got, that's it: he's got nothing left to offer)
    const i = boss.bribeN ?? 0;
    if (i >= BRIBE.length) return;
    boss.bribeN = i + 1;
    pitch = BRIBE[i]; reply = BRIBE_BACK[i];
  } else {
    const i = (boss.pitchN ?? 0) % PITCH.length;
    boss.pitchN = (boss.pitchN ?? 0) + 1;
    pitch = PITCH[i]; reply = PITCH_BACK[i];
  }
  speakAsBoss(OSCAR, pitch, ctx.bossHelpers);
  boss.pitchReply = reply; boss.pitchQuiet = 0;
};

/** Meathead's answer, over his head (after Oscar's done). */
const meatheadSays = (state: GameState, text: string) => {
  const shown = say(text, MEATHEAD_VOICE, 'queue', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 180; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; },
  });
  if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 160; }
};

const idleFrames = (boss: Enemy) =>
  Math.round(OSCAR_IDLE_FRAMES - Math.max(0, 1 - boss.health / boss.maxHealth) * OSCAR_IDLE_RAMP);

const startIdle = (boss: Enemy, frames: number) => {
  boss.bossState = 'idle';
  boss.stateTimer = frames;
  boss.lockProgress = 0;
  boss.aimFrames = 0;
  boss.fireWarning = 0;
};

const faceTarget = (boss: Enemy, x: number) => {
  if (Math.abs(x - midX(boss)) > 6) boss.oscarFacing = x < midX(boss) ? -1 : 1;
};

/** Slide to a comfortable shooting distance, relight the cigarette, then start aiming. */
const updateIdle = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  const { player } = state;
  const playerX = midX(player);
  faceTarget(boss, playerX);

  // Keep his distance on whichever side he's on (cornered = stay by the wall)
  const side = midX(boss) < playerX ? -1 : 1;
  const targetMid = clamp(playerX + side * OSCAR_PREFERRED_DISTANCE, ARENA_LEFT + 60, ARENA_RIGHT - 60);
  boss.slideTargetX = targetMid - boss.width / 2;
  const dx = boss.slideTargetX - boss.pos.x;
  if (Math.abs(dx) > 12) {
    boss.vel.x = clamp(boss.vel.x + Math.sign(dx) * 0.6, -OSCAR_SLIDE_SPEED, OSCAR_SLIDE_SPEED);
    if (state.frame % 3 === 0) {
      state.particles.push({ pos: { x: boss.pos.x + Math.random() * boss.width, y: FLOOR_Y - 3 }, vel: { x: -boss.vel.x * 0.3, y: -Math.random() }, life: 20, color: pickRandom(PARTICLE_PALETTES.OIL), size: 3 + Math.random() * 3 });
    }
  }

  // Launcher rests pointing ahead
  const L = getOscarLauncher(boss);
  const restX = L.pivotX + boss.oscarFacing! * 200, restY = L.pivotY + 50;
  boss.aimX = (boss.aimX ?? restX) + (restX - (boss.aimX ?? restX)) * 0.15;
  boss.aimY = (boss.aimY ?? restY) + (restY - (boss.aimY ?? restY)) * 0.15;

  // Sparks up a fresh smoke
  if (!boss.hasCigarette && boss.stateTimer! <= 30) {
    boss.hasCigarette = true;
    const m = getOscarMouth(boss);
    ctx.fx.spawnExplosion(m, '#FFD54F', 5, 0, 3);
  }

  if (boss.stateTimer! <= 0) {
    boss.bossState = 'aiming';
    boss.lockProgress = 0;
    boss.aimFrames = 0;
    boss.oscarAimMode = boss.oscarAimMode === 'tracked' ? 'floor' : 'tracked';
    // The laser sweeps in from the floor between them
    boss.aimX = midX(boss) + (playerX - midX(boss)) * 0.4;
    boss.aimY = FLOOR_Y;
  }
};

/**
 * He alternates between two ways of aiming, so jumping around can't trick him
 * into wasting shots on the ceiling:
 * - tracked: the laser follows Meathead wherever he is, up into the air too
 * - floor: the laser stays on the floor and only follows his x
 * Either way it locks on once it's on him, blinks, and fires: that's the moment to move.
 */
const updateAim = (ctx: FrameContext, boss: Enemy) => {
  const { player } = ctx.state;
  // Locked on: the laser freezes where it is and blinks, then he fires. That's the moment to move.
  if (boss.fireWarning && boss.fireWarning > 0) {
    if (--boss.fireWarning === 0) fireRocket(ctx, boss);
    return;
  }
  boss.aimFrames = (boss.aimFrames || 0) + 1;
  const targetX = midX(player);
  // Tracked: his feet on the ground, his body in the air. Floor: the floor under him.
  const targetY = boss.oscarAimMode === 'floor' ? FLOOR_Y
    : player.isGrounded ? player.pos.y + player.height : player.pos.y + player.height / 2;
  boss.aimX = boss.aimX! + (targetX - boss.aimX!) * 0.3;
  boss.aimY = boss.aimY! + (targetY - boss.aimY!) * 0.3;

  const onTarget = Math.hypot(targetX - boss.aimX, targetY - boss.aimY) < 30;
  if (onTarget) boss.lockProgress = Math.min(1, (boss.lockProgress || 0) + 1 / OSCAR_LOCK_FRAMES);

  if (boss.lockProgress! >= 1 || boss.aimFrames >= OSCAR_MAX_AIM_FRAMES) {
    boss.lockProgress = 1;
    boss.fireWarning = OSCAR_FIRE_WARNING;
  }
};

const fireRocket = (ctx: FrameContext, boss: Enemy) => {
  const { state, fx } = ctx;
  const L = getOscarLauncher(boss);
  const dx = boss.aimX! - L.muzzleX, dy = boss.aimY! - L.muzzleY;
  const d = Math.hypot(dx, dy) || 1;
  state.projectiles.push({
    id: `oscar-rocket-${state.frame}`,
    pos: { x: L.muzzleX - 12, y: L.muzzleY - 6 },
    vel: { x: (dx / d) * OSCAR_ROCKET_SPEED, y: (dy / d) * OSCAR_ROCKET_SPEED },
    width: 24, height: 12, health: 1, maxHealth: 1,
    type: 'projectile', damage: 0, owner: 'enemy', isOscarRocket: true, life: 150,
  });
  fx.playGunSound('oil');
  fx.spawnExplosion({ x: L.muzzleX, y: L.muzzleY }, '#9E9E9E', 8, -Math.cos(L.angle) * 2, 4);
  shakeScreen(state, 6, 4);
  boss.vel.x = -(boss.oscarFacing || -1) * 2.5; // recoil
  boss.bossState = 'shooting';
  boss.stateTimer = 12;
  boss.fireWarning = 0;
  boss.impactX = undefined;
  boss.impactY = undefined;
};

/** He flicks the cigarette from his mouth in an arc onto where his rocket hit. */
const flickCigarette = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  if (boss.impactX === undefined || boss.impactY === undefined || !boss.hasCigarette) return;
  const m = getOscarMouth(boss);
  const T = OSCAR_CIGARETTE_FLIGHT;
  state.projectiles.push({
    id: `oscar-cig-${state.frame}`,
    pos: { x: m.x - 10, y: m.y - 6 },
    vel: { x: (boss.impactX - m.x) / T, y: (boss.impactY - m.y) / T - 0.5 * OSCAR_CIGARETTE_GRAVITY * T },
    width: 20, height: 12, health: 1, maxHealth: 1,
    type: 'projectile', damage: 0, owner: 'enemy', isCigarette: true, life: T + 40, zapFrames: 0,
  });
  boss.hasCigarette = false;
  // (flicked: a little flick of a whoosh)
  ctx.fx.playGunSound('whoosh', 0.4, 6);
};

// ---------------------------------------------------------------------------
// Rocket, oil and fire
// ---------------------------------------------------------------------------

/** Oscar's rocket flies straight until it hits a surface or Meathead. */
export const updateOscarRocket = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  p.pos.x += p.vel.x;
  p.pos.y += p.vel.y;
  p.life = (p.life ?? 0) - 1;
  if (state.frame % 2 === 0) {
    state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, vel: { x: -p.vel.x * 0.1 + (Math.random() - 0.5), y: -p.vel.y * 0.1 + (Math.random() - 0.5) }, life: 25, color: Math.random() > 0.3 ? '#616161' : '#FF8C00', size: 5 + Math.random() * 5 });
  }
  const box = boundsOf(p);
  const hitSurface = state.blocks.some(b => b.type !== 'pit' && rectsOverlap(box, b));
  const hitPlayer = rectsOverlap(box, playerHurtbox(state.player));
  if (hitSurface || hitPlayer || p.life <= 0) {
    explodeOscarRocket(ctx, { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 });
    return false;
  }
  return true;
};

const explodeOscarRocket = (ctx: FrameContext, at: { x: number, y: number }) => {
  const { state, fx } = ctx;
  const { player } = state;
  const pos = { x: clamp(at.x, ARENA_LEFT, ARENA_RIGHT), y: clamp(at.y, CEILING_Y, FLOOR_Y) };
  fx.spawnOilSplatter(pos);
  fx.spawnExplosion(pos, '#FF8C00', 16, 0, 10);
  fx.spawnExplosion(pos, '#212121', 14, 0, 8);
  fx.playGunSound('ignite');
  shakeScreen(state, 14, 8);

  // Splash damage (measured to the nearest point of Meathead's body)
  const hb = playerHurtbox(player);
  const nx = clamp(pos.x, hb.x, hb.x + hb.w), ny = clamp(pos.y, hb.y, hb.y + hb.h);
  if (Math.hypot(nx - pos.x, ny - pos.y) < OSCAR_SPLASH_RADIUS && player.invincibilityTimer <= 0) {
    const dir = midX(player) < pos.x ? -1 : 1;
    hurtMeathead(ctx, OSCAR_SPLASH_DAMAGE, 'oil', { x: dir * PLAYER_PUSHBACK_VEL_X * 1.4, y: -8 });
  }

  coatWithOil(state, pos);
  const boss = findOscar(state);
  if (boss) { boss.impactX = pos.x; boss.impactY = pos.y; }
};

/** Oils every floor, ceiling and wall strip within reach of the blast. */
const coatWithOil = (state: GameState, pos: { x: number, y: number }) => {
  const R = OSCAR_OIL_RADIUS, C = OSCAR_OIL_CELL;
  const reach = (d: number) => Math.abs(d) < R ? Math.sqrt(R * R - d * d) : -1;
  const maxCol = Math.floor((ARENA_RIGHT - ARENA_LEFT) / C) - 1;
  const maxRow = Math.ceil((FLOOR_Y - CEILING_Y) / C) - 1;

  const coatRow = (surface: 'floor' | 'ceiling', surfaceY: number) => {
    const half = reach(pos.y - surfaceY);
    if (half < 0) return;
    const i0 = Math.max(0, Math.floor((pos.x - half - ARENA_LEFT) / C));
    const i1 = Math.min(maxCol, Math.floor((pos.x + half - ARENA_LEFT) / C));
    for (let i = i0; i <= i1; i++) {
      addOil(state, surface, i, { x: ARENA_LEFT + i * C, y: surface === 'floor' ? FLOOR_Y - 4 : CEILING_Y, w: C, h: 4 });
    }
  };
  const coatWall = (surface: 'left' | 'right', wallX: number) => {
    const half = reach(pos.x - wallX);
    if (half < 0) return;
    const j0 = Math.max(0, Math.floor((pos.y - half - CEILING_Y) / C));
    const j1 = Math.min(maxRow, Math.floor((pos.y + half - CEILING_Y) / C));
    for (let j = j0; j <= j1; j++) {
      const y = CEILING_Y + j * C;
      addOil(state, surface, j, { x: surface === 'left' ? wallX : wallX - 4, y, w: 4, h: Math.min(C, FLOOR_Y - y) });
    }
  };
  coatRow('floor', FLOOR_Y);
  coatRow('ceiling', CEILING_Y);
  coatWall('left', ARENA_LEFT);
  coatWall('right', ARENA_RIGHT);
};

const addOil = (state: GameState, surface: OilCell['surface'], index: number, r: Rect) => {
  const existing = state.oilCells.find(c => c.surface === surface && c.index === index);
  if (existing) {
    if (existing.burn <= 0) existing.life = OSCAR_OIL_FRAMES;
    return;
  }
  const cell: OilCell = { surface, index, ...r, life: OSCAR_OIL_FRAMES, burn: 0, igniteIn: -1 };
  // Fresh oil next to a fire catches too
  if (state.oilCells.some(c => c.burn > 0 && areNeighbours(c, cell))) cell.igniteIn = OSCAR_FIRE_SPREAD_DELAY;
  state.oilCells.push(cell);
};

/** Strips touching each other (including round the corners where walls meet floor/ceiling). */
const areNeighbours = (a: OilCell, b: OilCell) =>
  a !== b && rectsOverlap({ x: a.x - 3, y: a.y - 3, w: a.w + 6, h: a.h + 6 }, b);

const ignite = (state: GameState, cell: OilCell) => {
  if (cell.burn > 0) return;
  cell.burn = OSCAR_FIRE_FRAMES;
  cell.igniteIn = -1;
  for (const other of state.oilCells) {
    if (other.burn <= 0 && other.igniteIn < 0 && areNeighbours(cell, other)) other.igniteIn = OSCAR_FIRE_SPREAD_DELAY;
  }
};

/**
 * His fireproof suit: the flamethrower does nothing but make him laugh at you.
 * It's made obvious: the suit shimmers silver where the fire hits, the flames
 * splash back off it as sparks, and "IMMUNE!" pops up instead of damage.
 */
const shrugOffFlames = (ctx: FrameContext, boss: Enemy) => {
  const { state, fx } = ctx;
  const { player } = state;
  boss.fireproofFlash = 8;
  const back = midX(player) < midX(boss) ? -1 : 1;
  const hitX = back < 0 ? boss.pos.x : boss.pos.x + boss.width;
  if (state.frame % 2 === 0) {
    // Fire splashing straight back off the suit...
    for (let i = 0; i < 3; i++) {
      state.particles.push({ pos: { x: hitX, y: boss.pos.y + 15 + Math.random() * boss.height * 0.6 }, vel: { x: back * (3 + Math.random() * 4), y: (Math.random() - 0.5) * 5 - 1 }, life: 14, color: Math.random() > 0.5 ? '#FFD54F' : '#FF8A65', size: 3 + Math.random() * 3 });
    }
    // ...and rolling off it as harmless grey smoke
    state.particles.push({ pos: { x: boss.pos.x + Math.random() * boss.width, y: boss.pos.y + Math.random() * boss.height * 0.8 }, vel: { x: (Math.random() - 0.5) * 2, y: -1.5 - Math.random() * 2 }, life: 24, color: Math.random() > 0.5 ? '#9E9E9E' : '#CFD8DC', size: 5 + Math.random() * 5 });
  }
  // One "IMMUNE!" at a time (every flame segment touching him calls this each frame)
  if (state.frame - (boss.immunePopFrame ?? -999) >= 50) {
    boss.immunePopFrame = state.frame;
    fx.spawnDamageNumber({ x: midX(boss), y: boss.pos.y - 10 }, 'IMMUNE!', true, '#CFD8DC');
  }
  if (state.oscarFireproofTauntAt === undefined || state.frame - state.oscarFireproofTauntAt > 240) {
    state.oscarFireproofTauntAt = state.frame;
    speakAsBoss(OSCAR, pickRandom(OSCAR_LINES.FIREPROOF), ctx.bossHelpers);
  }
};

/**
 * Meathead's flamethrower touching the oil sets it off, same as the cigarette:
 * he's just lit Oscar's trap for him (and Oscar lets him know it).
 */
export const igniteOilWithFlame = (ctx: FrameContext, flame: Rect) => {
  const { state, fx } = ctx;
  const cell = state.oilCells.find(c => c.burn <= 0 && c.igniteIn < 0 && rectsOverlap(flame, c));
  if (!cell) return;
  ignite(state, cell);
  fx.playGunSound('ignite');
  fx.spawnExplosion({ x: cell.x + cell.w / 2, y: cell.y + cell.h / 2 }, '#FF8C00', 14, 0, 8);
  const boss = findOscar(state);
  if (boss && (state.oscarPlayerIgnitedAt === undefined || state.frame - state.oscarPlayerIgnitedAt > 240)) {
    state.oscarPlayerIgnitedAt = state.frame;
    speakAsBoss(OSCAR, pickRandom(OSCAR_LINES.PLAYER_IGNITED), ctx.bossHelpers);
  }
};

/** Oil dries up, fire spreads strip by strip, burns for a few seconds, then the oil is gone. */
export const updateOscarHazards = (ctx: FrameContext) => {
  const { state, fx } = ctx;
  const { player } = state;
  if (state.oilCells.length === 0) return;

  // The wave over a burning strip puts it out (the oil's still there: it'll go up again if it's lit again), and the fire
  // that was creeping along to the ones it covers doesn't get there
  if (state.tsunamiActive) for (const c of state.oilCells) {
    if ((c.burn <= 0 && c.igniteIn < 0) || !tsunamiCovers(state, flameRect(c))) continue;
    if (c.burn > 0) douseFire(ctx, c.x, c.surface === 'ceiling' ? c.y + 30 : c.y + c.h, Math.max(c.w, 20));
    c.burn = 0; c.igniteIn = -1; c.life = Math.max(c.life, 60);
  }
  for (const c of state.oilCells) {
    if (c.igniteIn > 0 && --c.igniteIn === 0) ignite(state, c);
  }
  let hurtBy: OilCell | null = null;
  const hb = playerHurtbox(player);
  for (const c of state.oilCells) {
    if (c.burn > 0) {
      c.burn--;
      if (c.burn === 0) c.life = 0; // burnt off
      const strength = flameStrength(c);
      if (strength > 0.3 && Math.random() < 0.25) spawnFlame(state, c);
      if (strength > 0.5 && !hurtBy && rectsOverlap(flameRect(c), hb)) hurtBy = c;
    } else {
      c.life--;
    }
  }
  state.oilCells = state.oilCells.filter(c => c.life > 0 || c.burn > 0);

  if (hurtBy && player.invincibilityTimer <= 0) {
    const dir = midX(player) < hurtBy.x + hurtBy.w / 2 ? -1 : 1;
    hurtMeathead(ctx, OSCAR_FIRE_DAMAGE, 'fire', { x: dir * PLAYER_PUSHBACK_VEL_X, y: -9 });
    fx.spawnExplosion({ x: midX(player), y: player.pos.y + player.height }, '#FF4500', 8, 0, 6);
  }
};

const spawnFlame = (state: GameState, c: OilCell) => {
  const out = c.surface === 'floor' ? { x: 0, y: -1 } : c.surface === 'ceiling' ? { x: 0, y: 1 } : c.surface === 'left' ? { x: 1, y: 0 } : { x: -1, y: 0 };
  state.particles.push({
    pos: { x: c.x + Math.random() * c.w, y: c.y + Math.random() * c.h },
    vel: { x: out.x * (1 + Math.random() * 2) + (Math.random() - 0.5), y: out.y * (1 + Math.random() * 2) - 0.8 },
    life: 16 + Math.random() * 10, color: Math.random() > 0.5 ? '#616161' : '#424242', size: 4 + Math.random() * 4,
  });
};

// ---------------------------------------------------------------------------
// The cigarette
// ---------------------------------------------------------------------------

/** The flicked cigarette arcs through the air; if it lands on oil, the oil goes up. */
export const updateCigarette = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  // Caught in the taser beam: it hangs there crackling, building up. Let go before it goes, and it carries on where it
  // was going (and the build-up's gone with it)
  if (state.frame - (p.zapAt ?? -9) <= 1) {
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, vel: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 }, life: 10, color: Math.random() < 0.5 ? '#00E5FF' : '#FFB300', size: 2 + Math.random() * 2 });
    return true;
  }
  p.isTased = false; p.zapFrames = 0;
  p.vel.y += OSCAR_CIGARETTE_GRAVITY;
  p.pos.x += p.vel.x;
  p.pos.y += p.vel.y;
  p.life = (p.life ?? 0) - 1;
  // Smoke and a trail of embers so you can follow it through the air
  if (state.frame % 2 === 0) {
    state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y }, vel: { x: (Math.random() - 0.5) * 0.6, y: -0.8 }, life: 30, color: '#BDBDBD', size: 4 + Math.random() * 4 });
  }
  state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, vel: { x: -p.vel.x * 0.2 + (Math.random() - 0.5), y: -p.vel.y * 0.2 + (Math.random() - 0.5) }, life: 14, color: Math.random() > 0.5 ? '#FF5722' : '#FFB300', size: 2 + Math.random() * 3 });
  const box = boundsOf(p);
  if (p.life <= 0 || state.blocks.some(b => b.type !== 'pit' && rectsOverlap(box, b))) {
    landCigarette(ctx, { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 });
    return false;
  }
  return true;
};

const landCigarette = (ctx: FrameContext, at: { x: number, y: number }) => {
  const { state, fx } = ctx;
  let nearest: OilCell | null = null, best = 40;
  for (const c of state.oilCells) {
    const d = Math.hypot(at.x - clamp(at.x, c.x, c.x + c.w), at.y - clamp(at.y, c.y, c.y + c.h));
    if (d < best) { best = d; nearest = c; }
  }
  if (!nearest) {
    fx.spawnExplosion(at, '#9E9E9E', 6, 0, 3);
    return;
  }
  ignite(state, nearest);
  fx.playGunSound('ignite');
  fx.spawnExplosion(at, '#FF8C00', 14, 0, 8);
  const boss = findOscar(state);
  // (every time he does it, a little more of the showroom goes: see drawOscarRuin)
  if (boss) boss.blazes = (boss.blazes ?? 0) + 1;
  if (boss && Math.random() < 0.35) speakAsBoss(OSCAR, pickRandom(OSCAR_LINES.IGNITE), ctx.bossHelpers, 'casual');
};

/** The nearest flicked cigarette in taser range. The taser goes for it over anything else. */
export const findFlyingCigarette = (state: GameState): Projectile | undefined => {
  const { player } = state;
  const px = midX(player), py = player.pos.y + player.height / 2;
  return state.projectiles.find(p => p.isCigarette && p.health > 0 &&
    Math.hypot(p.pos.x + p.width / 2 - px, p.pos.y + p.height / 2 - py) <= TASER_RANGE);
};

// ---------------------------------------------------------------------------
// The taser (his weakness)
// ---------------------------------------------------------------------------

/**
 * The taser doesn't hurt Oscar directly: it holds him still. Hold him long
 * enough and it bursts for big damage, then overloads.
 */
export const holdOscarWithTaser = (ctx: FrameContext, boss: Enemy) => {
  if (boss.bossState === 'ash_face') {
    if (ctx.state.frame % 4 === 0) ctx.fx.spawnExplosion({ x: midX(boss), y: boss.pos.y + 20 }, '#00E5FF', 2, 0, 3);
    return;
  }
  if (boss.bossState !== 'taser_held') {
    boss.bossState = 'taser_held';
    boss.taserGrace = 0;
    boss.lockProgress = 0;
    boss.fireWarning = 0;
    boss.vel.x = 0;
    if (Math.random() < 0.5) speakAsBoss(OSCAR, pickRandom(OSCAR_LINES.HELD), ctx.bossHelpers, 'casual');
  }
  boss.taserHeldThisFrame = true;
  boss.isTased = true;
  boss.taserHold = (boss.taserHold || 0) + 1;
  if (boss.taserHold >= OSCAR_TASER_HOLD_FRAMES) burstOscar(ctx, boss);
};

const burstOscar = (ctx: FrameContext, boss: Enemy) => {
  const { state, fx } = ctx;
  const { player } = state;
  const center = { x: midX(boss), y: boss.pos.y + boss.height / 2 };
  boss.taserHold = 0;
  boss.isTased = false;
  boss.health -= OSCAR_BURST_DAMAGE;
  boss.hitCooldown = ENEMY_HIT_COOLDOWN;
  fx.spawnDamageNumber(boss.pos, OSCAR_BURST_DAMAGE, true);
  spawnCallout(state, { x: center.x, y: boss.pos.y - 50 }, 'ZZZAP!', '#00E5FF');
  for (const color of PARTICLE_PALETTES.SPARKS) fx.spawnExplosion(center, color, 10, 0, 16);
  fx.playGunSound('taser');
  shakeScreen(state, 20, 10);
  overloadTaser(ctx);
  if (boss.health <= 0) { ctx.bossHelpers.killBoss(boss, player.facing, true, 'TASER'); return; }
  boss.vel.x = (midX(boss) < midX(player) ? -1 : 1) * 11;
  startIdle(boss, 70);
  speakAsBoss(OSCAR, pickRandom(OSCAR_LINES.BURST), ctx.bossHelpers);
};

/** Tasing the cigarette mid-flick blows it up in his face. */
export const zapCigarette = (ctx: FrameContext, cig: Projectile) => {
  const { state, fx } = ctx;
  const { player } = state;
  cig.isTased = true;
  cig.zapAt = state.frame;
  cig.zapFrames = (cig.zapFrames || 0) + 1;
  // (crackling louder, glowing hotter, the closer it gets)
  if (cig.zapFrames % Math.max(3, 12 - Math.floor(cig.zapFrames / 6)) === 0) fx.playGunSound('taser');
  if (cig.zapFrames < OSCAR_CIGARETTE_ZAP_FRAMES) return;

  cig.health = 0;
  const at = { x: cig.pos.x + cig.width / 2, y: cig.pos.y + cig.height / 2 };
  // (a bigger burst than it was, the size of what it reaches)
  fx.spawnExplosion(at, '#FF4500', 40, 0, 18);
  fx.spawnExplosion(at, '#FFD700', 26, 0, 13);
  fx.playGunSound('boom');
  shakeScreen(state, 25, 12);

  const boss = findOscar(state);
  if (!boss) return;
  const face = { x: midX(boss), y: boss.pos.y + 20 };
  // (it has to go off in his face: halfway across the room, it's just a cigarette going off, and whatever oil's under it;
  // and the taser's none the worse for it: it only overloads on the one that gets him)
  if (Math.hypot(at.x - face.x, at.y - face.y) > OSCAR_CIGARETTE_COMBO_REACH) { landCigarette(ctx, at); return; }
  overloadTaser(ctx);
  fx.spawnExplosion(face, '#212121', 25, 0, 12);
  fx.spawnExplosion(face, '#FF8C00', 15, 0, 10);
  boss.health -= OSCAR_CIGARETTE_COMBO_DAMAGE;
  boss.hitCooldown = ENEMY_HIT_COOLDOWN;
  fx.spawnDamageNumber(boss.pos, OSCAR_CIGARETTE_COMBO_DAMAGE, true);
  spawnCallout(state, { x: face.x, y: boss.pos.y - 50 }, 'SMOKED!', '#FF8C00');
  if (boss.health <= 0) { ctx.bossHelpers.killBoss(boss, player.facing, true, 'TASER'); return; }
  boss.bossState = 'ash_face';
  boss.stateTimer = OSCAR_ASH_FACE_FRAMES;
  boss.vel.x = 0;
  boss.taserHold = 0;
  boss.isTased = false;
  boss.hasCigarette = false;
  speakAsBoss(OSCAR, pickRandom(OSCAR_LINES.ASH), ctx.bossHelpers);
};

/** After a burst the taser needs a few seconds to cool down. */
const overloadTaser = (ctx: FrameContext) => {
  const { state, fx } = ctx;
  const { player } = state;
  player.taserOverloadTimer = TASER_OVERLOAD_FRAMES;
  player.isTasing = false;
  player.taserTargetId = null;
  player.taserTimer = 0;
  fx.spawnDamageNumber({ x: midX(player), y: player.pos.y - 30 }, 'TASER OVERLOADED!', false, '#00E5FF');
  fx.spawnExplosion({ x: player.pos.x + (player.facing === 1 ? player.width : 0), y: player.pos.y + 25 }, '#00E5FF', 12, 0, 8);
};

/** A big floating callout (same style as the kill callouts). */
const spawnCallout = (state: GameState, pos: { x: number, y: number }, text: string, color: string) => {
  state.damageNumbers.push({
    id: `callout-${state.frame}-${Math.random()}`,
    text, pos: { ...pos }, vel: { x: 0, y: -3 },
    life: 75, maxLife: 75, isCritical: true, isCallout: true, color,
  });
};

export const oscar: BossDef = {
  id: OSCAR,
  // (bumping into him)
  contact: { damage: 8 },
  weakness: 'TASER',
  // Starts where he's visible from the door, like the other bosses
  spawn: { x: ARENA_LEFT + 600, fields: { hasCigarette: true } },
  arena: { right: OSCAR_ARENA_RIGHT },
  update: updateOscar,
  // (greased head to toe: go into him with anything and you shoot off him, no chaining dive kicks off that head)
  slick: { x: 17, y: 9, frames: 30 },
  onTaser: holdOscarWithTaser,
  onFlamed: shrugOffFlames,
};
