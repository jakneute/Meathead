// Toxic Tommy: stalks under the sludge pool, bursts up through a floating
// board, then sweeps a stream of vomit across the boards before diving back
// down. Crude oil (the oil rocket) clogs him up and stuns him.
// The boards themselves are updated in systems/hazards.ts (updateTommyArena).

import { Block, Enemy, TommyBoard } from '../../types';
import {
  ARENA_LEFT, ARENA_RIGHT, BOSS_DOOR_X, GRAVITY, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y, TOMMY_PUKE_PUSHBACK_DURATION,
  TOMMY_SWIM_SPEED, TOMMY_SWIM_SPEED_RAMP, TOMMY_CHASE_FRAMES, TOMMY_CHASE_RAMP, TOMMY_TELEGRAPH_FRAMES, TOMMY_TELEGRAPH_RAMP,
} from '../../constants';
import type { FrameContext } from '../context';
import type { GameState } from '../state';
import { BossDef, ARENA_MID, midX, hurtPlayer, speakAsBoss, enemyProjectile } from './shared';

const TOMMY = 'Toxic Tommy';
const SLUDGE_Y = 510;          // default sludge surface
const SUBMERGED_DEPTH = 15;    // how far under the surface he swims
const SWIM_MIN_X = ARENA_LEFT + 25;
const SWIM_MAX_X = ARENA_RIGHT - 25;
const BOARD_Y = 480;
const DEFAULT_EMERGE_Y = 405;
const EMERGE_DAMAGE = 15;
const PUKE_FRAMES = 230;
const PUKE_DAMAGE = 9;
const VULNERABLE_FRAMES = 110;
const OIL_STUN_FRAMES = 75;
const OILED_SLUDGE_FRAMES = 240;

/** His two vomit sweeps: in toward himself, or out away from him. */
const PUKES = {
  puke_closing_in: { from: 420, to: 115, projectileDamage: 24 },
  puke_going_outward: { from: 80, to: 440, projectileDamage: 18 },
} as const;

/** Tommy can't be hurt while he's under (or at) the sludge surface. */
export const isTommyShielded = (boss: Enemy, state: GameState): boolean =>
  boss.bossState === 'submerged_chase' ||
  boss.bossState === 'telegraph_emerge' ||
  boss.bossState === 'dive_in_sludge' ||
  boss.pos.y >= state.tommySludgeY - 30;

const update = (ctx: FrameContext, boss: Enemy) => {
  const sludgeY = ctx.state.tommySludgeY || SLUDGE_Y;
  if (!boss.bossState || boss.bossState === 'idle') {
    boss.bossState = 'submerged_chase';
    boss.stateTimer = chaseFrames(boss);
    boss.pos.y = sludgeY + SUBMERGED_DEPTH;
    boss.pos.x = ARENA_MID;
    boss.targetedBoardIndex = undefined;
  }
  // His timers run at double speed (the shared boss update ticks them too)
  boss.stateTimer = (boss.stateTimer || 0) - 1;

  switch (boss.bossState) {
    case 'submerged_chase': stalk(ctx, boss, sludgeY); break;
    case 'telegraph_emerge': shakeBoard(ctx, boss, sludgeY); break;
    case 'emerge_shatter': burstUp(ctx, boss); break;
    case 'puke_closing_in':
    case 'puke_going_outward': puke(ctx, boss, sludgeY, PUKES[boss.bossState]); break;
    case 'weakness_stunned':
      standAtSurface(boss);
      boss.vel.x = 0;
      boss.pukeSweepProgress = 0;
      if (ctx.state.frame % 5 === 0) {
        ctx.bossHelpers.spawnExplosion({ x: boss.pos.x + Math.random() * boss.width, y: boss.pos.y + Math.random() * boss.height }, '#111111', 3, 0, 4);
      }
      if (boss.stateTimer <= 0) diveUnder(ctx, boss, sludgeY, 45, '#111111');
      break;
    case 'vulnerable_idle':
      standAtSurface(boss);
      if (boss.stateTimer <= 0) diveUnder(ctx, boss, sludgeY, 40, '#27AE60');
      break;
    case 'dive_in_sludge':
      boss.pos.y += boss.vel.y;
      boss.vel.y += GRAVITY * 0.7;
      if (boss.pos.y >= sludgeY + SUBMERGED_DEPTH || boss.stateTimer <= 0) {
        boss.bossState = 'submerged_chase';
        boss.stateTimer = chaseFrames(boss);
        boss.targetedBoardIndex = undefined;
        ctx.bossHelpers.spawnExplosion({ x: boss.pos.x + boss.width / 2, y: sludgeY }, '#2ECC71', 20, 0, 10);
      }
      break;
  }
};

/** 0 at full health, 1 at none: he gets faster and less patient as it drops. */
const missingHp = (boss: Enemy) => Math.max(0, Math.min(1, 1 - boss.health / (boss.maxHealth || 250)));

/** How long he stalks before surfacing, with some randomness. */
const chaseFrames = (boss: Enemy) => {
  const base = TOMMY_CHASE_FRAMES - missingHp(boss) * TOMMY_CHASE_RAMP;
  const variation = (Math.random() - 0.5) * 40;
  return Math.max(35, Math.round(base + variation));
};

const standAtSurface = (boss: Enemy) => {
  boss.pos.y = boss.emergeY || DEFAULT_EMERGE_Y;
  boss.vel.y = 0;
};

const diveUnder = (ctx: FrameContext, boss: Enemy, sludgeY: number, frames: number, splashColor: string) => {
  boss.bossState = 'dive_in_sludge';
  boss.stateTimer = frames;
  boss.vel.y = 5;
  ctx.bossHelpers.playGunSound('barf');
  ctx.bossHelpers.spawnExplosion({ x: boss.pos.x + boss.width / 2, y: sludgeY }, splashColor, 30, 0, 12);
};

/** Swims under a board (usually one near Meathead) and surfaces there when his timer runs out. */
const stalk = (ctx: FrameContext, boss: Enemy, sludgeY: number) => {
  const { state } = ctx;
  const { player } = state;
  boss.pos.y = sludgeY + SUBMERGED_DEPTH;
  const activeBoards = state.tommyBoards.filter(b => b.status === 'active');

  let target = state.tommyBoards.find(b => b.index === boss.targetedBoardIndex && b.status === 'active');
  if (!target && activeBoards.length > 0) {
    if (Math.random() < 0.7) {
      // A board near Meathead, with some jitter so it's not always the same one
      const jitteredDist = (b: TommyBoard) => Math.abs(b.x + b.w / 2 - midX(player)) + (Math.random() - 0.5) * 120;
      target = [...activeBoards].sort((a, b) => jitteredDist(a) - jitteredDist(b))[0];
    } else {
      target = activeBoards[Math.floor(Math.random() * activeBoards.length)];
    }
    boss.targetedBoardIndex = target.index;
  }

  const destX = target ? target.x + target.w / 2 - boss.width / 2 : midX(player) - boss.width / 2;
  const speed = TOMMY_SWIM_SPEED + missingHp(boss) * TOMMY_SWIM_SPEED_RAMP;
  boss.vel.x = Math.max(-speed, Math.min(speed, (destX - boss.pos.x) * 0.14));
  boss.pos.x = Math.max(SWIM_MIN_X, Math.min(SWIM_MAX_X - boss.width, boss.pos.x + boss.vel.x));
  if (state.frame % 4 === 0) {
    ctx.bossHelpers.spawnExplosion({ x: boss.pos.x + boss.width / 2 + (Math.random() - 0.5) * 40, y: sludgeY }, '#27AE60', 3, 0, 4);
  }

  const underTarget = target ? Math.abs(target.x + target.w / 2 - midX(boss)) < 24 : true;
  if (boss.stateTimer! <= 0 && underTarget) {
    const board = target || activeBoards[0];
    if (board) startEmerging(boss, board, telegraphFrames(boss, (Math.random() - 0.5) * 14));
    else boss.stateTimer = 30;
  } else if (boss.stateTimer! <= -60 && activeBoards.length > 0) {
    // Taking too long to reach it: use the nearest board instead
    const nearest = activeBoards.sort((a, b) => Math.abs(a.x + a.w / 2 - midX(boss)) - Math.abs(b.x + b.w / 2 - midX(boss)))[0];
    startEmerging(boss, nearest, telegraphFrames(boss, -7));
  }
};

const telegraphFrames = (boss: Enemy, variation: number) =>
  Math.max(30, Math.round(TOMMY_TELEGRAPH_FRAMES - missingHp(boss) * TOMMY_TELEGRAPH_RAMP + variation));

const startEmerging = (boss: Enemy, board: TommyBoard, frames: number) => {
  boss.targetedBoardIndex = board.index;
  board.telegraphTimer = frames;
  boss.bossState = 'telegraph_emerge';
  boss.stateTimer = frames;
  boss.pos.x = board.x + board.w / 2 - boss.width / 2;
};

/** The board shakes and bubbles, then he smashes up through it. */
const shakeBoard = (ctx: FrameContext, boss: Enemy, sludgeY: number) => {
  const { state, cheats } = ctx;
  const { player } = state;
  const helpers = ctx.bossHelpers;
  boss.pos.y = sludgeY + SUBMERGED_DEPTH;
  const board = state.tommyBoards.find(b => b.index === boss.targetedBoardIndex);
  if (board) {
    board.shakeX = (Math.random() - 0.5) * 8;
    board.telegraphTimer = (board.telegraphTimer || 0) - 1;
    if (state.frame % 5 === 0) helpers.spawnExplosion({ x: board.x + Math.random() * board.w, y: board.y }, '#ADFF2F', 3, 0, 5);
  }
  if (boss.stateTimer! > 0) return;

  if (board) {
    board.status = 'shattering';
    board.shatterTimer = 45;
    board.shakeX = 0;
    board.telegraphTimer = 0;
    helpers.spawnExplosion({ x: board.x + board.w / 2, y: board.y }, '#27AE60', 30, 0, 14);
    helpers.spawnExplosion({ x: board.x + board.w / 2, y: board.y }, '#8B4513', 25, 0, 12);
    helpers.playGunSound('barf');
    helpers.setScreenShake(25);

    // Standing on it: heavy damage and a violent launch
    const onBoard = player.pos.x + player.width > board.x && player.pos.x < board.x + board.w &&
      Math.abs(player.pos.y + player.height - board.y) < 25;
    if (onBoard && (player.invincibilityTimer || 0) <= 0 && !cheats.invincible) {
      const knockX = player.pos.x < board.x + board.w / 2 ? -PLAYER_PUSHBACK_VEL_X : PLAYER_PUSHBACK_VEL_X;
      hurtPlayer(ctx, EMERGE_DAMAGE, TOMMY, { x: knockX, y: PLAYER_PUSHBACK_VEL_Y });
    }
  }
  boss.bossState = 'emerge_shatter';
  boss.vel.y = -10;
  boss.stateTimer = 45;
  boss.emergeY = (board ? board.baseY : BOARD_Y) - boss.height + 5;
};

/** Erupts out of the pool (hurting anyone in the way), then picks his next vomit sweep. */
const burstUp = (ctx: FrameContext, boss: Enemy) => {
  const { state, cheats } = ctx;
  const { player } = state;
  boss.pos.y += boss.vel.y;
  boss.vel.y += GRAVITY * 0.7;
  if (boss.pos.y >= (boss.emergeY || DEFAULT_EMERGE_Y)) standAtSurface(boss);

  const playerMidY = player.pos.y + player.height / 2, bossMidY = boss.pos.y + boss.height / 2;
  const overlaps = Math.abs(midX(player) - midX(boss)) < (player.width + boss.width) / 2 &&
    Math.abs(playerMidY - bossMidY) < (player.height + boss.height) / 2;
  if (overlaps && (player.invincibilityTimer || 0) <= 0 && !cheats.invincible) {
    ctx.bossHelpers.spawnExplosion({ x: midX(player), y: playerMidY }, '#2ECC71', 18, 0, 10);
    ctx.bossHelpers.setScreenShake(20);
    const knockX = midX(player) < midX(boss) ? -PLAYER_PUSHBACK_VEL_X : PLAYER_PUSHBACK_VEL_X;
    hurtPlayer(ctx, EMERGE_DAMAGE, TOMMY, { x: knockX, y: PLAYER_PUSHBACK_VEL_Y });
  }

  if (boss.stateTimer! > 0) return;
  // Alternates between the two sweeps, locked toward where Meathead is now (so you can dodge behind him)
  const next = boss.pukeType === 'closing_in' ? 'puke_going_outward' : 'puke_closing_in';
  boss.pukeType = next === 'puke_closing_in' ? 'closing_in' : 'going_outward';
  boss.bossState = next;
  boss.stateTimer = PUKE_FRAMES;
  boss.pukeSweepProgress = 0;
  boss.pukeDir = midX(player) < midX(boss) ? -1 : 1;
};

/**
 * Sprays vomit that splashes along the boards, sweeping between two distances.
 * Safe spots: behind him, or high in the air (an uppercut slices through it).
 */
const puke = (ctx: FrameContext, boss: Enemy, sludgeY: number, sweep: typeof PUKES[keyof typeof PUKES]) => {
  const { state, cheats } = ctx;
  const { player } = state;
  standAtSurface(boss);
  const dir = boss.pukeDir || (midX(player) < midX(boss) ? -1 : 1);
  boss.pukeDir = dir;
  const progress = Math.max(0, Math.min(1, 1.0 - boss.stateTimer! / PUKE_FRAMES));
  boss.pukeSweepProgress = progress;
  const splashX = midX(boss) + dir * (sweep.from + progress * (sweep.to - sweep.from));
  const splashY = sludgeY - 15;

  if (state.frame % 4 === 0) {
    const helpers = ctx.bossHelpers;
    helpers.playGunSound('barf');
    const mouthX = boss.pos.x + (dir > 0 ? boss.width * 0.78 : boss.width * 0.22);
    const mouthY = boss.pos.y + 25;
    helpers.spawnExplosion({ x: splashX, y: splashY }, '#ADFF2F', 3, dir * 1.5, 4);
    helpers.spawnExplosion({ x: splashX, y: splashY }, '#27AE60', 3, 0, 3);
    helpers.addProjectile(enemyProjectile(`tommy-puke-${Date.now()}-${Math.random()}`, mouthX, mouthY, (splashX - mouthX) / 18, -4,
      14, 14, sweep.projectileDamage, { isSludge: true, life: 18 }));
  }

  const isBehind = dir > 0 ? midX(player) < midX(boss) : midX(player) > midX(boss);
  const isAbove = player.isUppercutting || player.pos.y + player.height <= splashY - 35;
  const inSplash = Math.abs(midX(player) - splashX) < 32 && player.pos.y + player.height > splashY - 50;
  if (!isBehind && !isAbove && inSplash && (player.invincibilityTimer || 0) <= 0 && !cheats.invincible) {
    hurtPlayer(ctx, PUKE_DAMAGE, 'sludge', { x: dir * 7, y: -4 }, TOMMY_PUKE_PUSHBACK_DURATION);
    ctx.bossHelpers.spawnExplosion({ x: midX(player), y: player.pos.y + player.height / 2 }, '#27AE60', 8, 0, 6);
  }

  if (boss.stateTimer! <= 0) {
    boss.bossState = 'vulnerable_idle';
    boss.stateTimer = VULNERABLE_FRAMES;
  }
};

/** Weakness: crude oil clogs him up, pops him out of the sludge and stuns him. */
const stunWithOil = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  boss.bossState = 'weakness_stunned';
  boss.stateTimer = OIL_STUN_FRAMES;
  boss.pukeSweepProgress = 0;
  if (boss.pos.y >= state.tommySludgeY - 30) {
    boss.pos.y = BOARD_Y - boss.height + 5;
    boss.vel.y = -8;
  }
  boss.isOiled = true;
  boss.oiledTimer = Math.max(boss.oiledTimer || 0, OILED_SLUDGE_FRAMES);
  state.tommySludgeOiledTimer = OILED_SLUDGE_FRAMES;
  ctx.fx.spawnExplosion({ x: midX(boss), y: Math.min(boss.pos.y + 20, state.tommySludgeY) }, '#111111', 25, 0, 10);
  speakAsBoss(TOMMY, "BLAARGH! CRUDE OIL?! I CAN'T CHUNDER!", ctx.bossHelpers);
};

/** A safe catwalk just inside the door, then eight boards floating across the pool. */
const buildArena = (state: GameState, blocks: Block[]) => {
  blocks.push({ x: BOSS_DOOR_X, y: BOARD_Y, w: 90, h: 70, type: 'ground' });
  const count = 8, w = 68;
  const startX = BOSS_DOOR_X + 105, endX = ARENA_RIGHT - 25;
  const spacing = (endX - startX - w) / (count - 1);
  state.tommyBoards = Array.from({ length: count }, (_, i) => ({
    index: i, x: startX + i * spacing, baseY: BOARD_Y, y: BOARD_Y, w, h: 18,
    status: 'active' as const, shatterTimer: 0, riseProgress: 1, shakeX: 0, telegraphTimer: 0,
  }));
};

export const tommy: BossDef = {
  id: TOMMY,
  weakness: 'OIL_ROCKET',
  spawn: { x: ARENA_RIGHT - 120, y: SLUDGE_Y + SUBMERGED_DEPTH, state: 'submerged_chase', timer: 120 },
  arena: { openTop: true, floorless: true, entry: { x: 45, y: BOARD_Y - 64 }, build: buildArena },
  update,
  shield: { isUp: isTommyShielded, color: '#27AE60', sound: 'barf' },
  onWeaknessHit: stunWithOil,
};
