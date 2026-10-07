// The finale's Secret Service. The men on foot come in through the press room's side doors and get into position
// (their 'enter'), then do the usual three jobs: the agent stands and fires his service pistol, the rusher runs
// Meathead down and tackles, the man behind the ballistic shield turns it to him and drops it to fire round it. The
// jetpack men come in through the side windows and hang in the air off to one side of him, firing down at him.
// When it's all gone wrong (every one of Meathead's guns is empty and it's just him and the alien) they all pull out:
// 'flee' (out the doors, off out the windows), and they're gone.

import { Enemy } from '../../../types';
import { ENEMY_BULLET_DAMAGE } from '../../../constants';
import type { FrameContext } from '../../core/context';
import { mid } from './index';
import { ROOM_L, ROOM_R, ROOM_TOP, WINDOW_TOP, WINDOW_BOTTOM, doorOutside } from '../../stages/finale/geometry';

const WALK_IN = 3.2, FLEE_RUN = 7.5;
const JET_SPEED = 3.4, JET_FLEE = 6.5;
/** How long between a jetpack man's shots (frames, give or take), and how fast they go. */
const JET_FIRE = 120, JET_SHOT_SPEED = 7;

/** He's in position: the job he came in to do (the usual logic takes it from here). */
const takePosition = (e: Enemy) => {
  e.aiState = 'idle';
  e.vel.x = 0;
  if (e.kind === 'agent') { e.behavior = 'shoot'; e.shootTimer = Math.floor(Math.random() * 40); }
  else if (e.kind === 'agentrush') { e.behavior = 'patrol'; e.pauseTimer = 0; }
  else if (e.kind === 'agentshield') { e.behavior = 'shoot'; e.isShieldActive = true; e.shootTimer = Math.floor(Math.random() * 30); }
};

/** A round from a jetpack man's pistol, down at where Meathead is. */
const jetShot = (ctx: FrameContext, e: Enemy) => {
  const p = ctx.state.player, dir = e.facing ?? 1;
  const x = e.pos.x + e.width / 2 + dir * 18, y = e.pos.y + e.height - 30;
  const tx = p.pos.x + p.width / 2, ty = p.pos.y + p.height * 0.45;
  const len = Math.hypot(tx - x, ty - y) || 1;
  ctx.state.projectiles.push({
    id: `ja-${ctx.state.frame}-${Math.random()}`, pos: { x: x - 4, y: y - 4 }, vel: { x: (tx - x) / len * JET_SHOT_SPEED, y: (ty - y) / len * JET_SHOT_SPEED },
    width: 8, height: 8, health: 1, maxHealth: 1, type: 'projectile', damage: ENEMY_BULLET_DAMAGE, owner: 'enemy', shooterKind: 'jetagent', shot: 'slug',
  });
  ctx.fx.playGunSound('egun', 1, -3);
  for (let i = 0; i < 4; i++) ctx.state.particles.push({ pos: { x, y }, vel: { x: dir * (1 + Math.random() * 2), y: (Math.random() - 0.5) * 1.5 }, life: 6, color: '#FEF08A', size: 2 + Math.random() * 3 });
};

/** The jetpack's flame and smoke (the trail behind it as it goes). */
const jetTrail = (ctx: FrameContext, e: Enemy, hard: boolean) => {
  const { state } = ctx;
  if (state.frame % (hard ? 1 : 3) !== 0) return;
  const back = -(e.facing ?? 1);
  const x = e.pos.x + e.width / 2 + back * 10, y = e.pos.y + e.height - 22;
  state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 4, y }, vel: { x: (Math.random() - 0.5) * 0.8, y: 2 + Math.random() * 2 }, life: 8 + Math.random() * 6, color: Math.random() < 0.5 ? '#FDBA74' : '#FDE047', size: 3 + Math.random() * 3 });
  if (state.frame % 6 === 0) state.particles.push({ pos: { x, y: y + 8 }, vel: { x: (Math.random() - 0.5) * 0.6, y: 0.8 + Math.random() }, life: 26, color: 'rgba(120, 113, 108, 0.45)', size: 6 + Math.random() * 5 });
};

/** Runs one of them. Returns true for the jetpack men (who move themselves), false for the men on foot. */
export const runFinaleKindAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  const p = state.player;
  e.aiTimer = (e.aiTimer || 0) + 1;
  if (e.kind === 'jetagent') return jetpack(ctx, e);
  switch (e.aiState) {
    case 'enter': {
      // In through the door to where he's taking up position (aiX)
      const dx = (e.aiX ?? e.pos.x) - e.pos.x;
      e.facing = dx < 0 ? -1 : 1;
      e.vel.x = Math.sign(dx) * Math.min(WALK_IN, Math.abs(dx));
      if (Math.abs(dx) < 4) { takePosition(e); e.facing = mid(p).x < mid(e).x ? -1 : 1; }
      return false;
    }
    case 'flee': {
      // Pulling out: flat out for the nearest door, arms going, never mind him
      const out = doorOutside(e.aiX! < 0 ? -1 : 1, e.width);
      const dx = out - e.pos.x;
      e.facing = dx < 0 ? -1 : 1;
      e.vel.x = Math.sign(dx) * FLEE_RUN;
      if (Math.abs(dx) <= FLEE_RUN) e.aiState = 'gone';
      return false;
    }
    default:
      e.vel.x = 0;
      return false;
  }
};

const jetpack = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  const p = state.player;
  const m = mid(e), pm = mid(p);
  const side: -1 | 1 = (e.homeX ?? 0) < (ROOM_L + ROOM_R) / 2 ? -1 : 1;
  let tx: number, ty: number, speed = JET_SPEED;
  if (e.aiState === 'flee') {
    // Off out the window he came in by, full throttle
    tx = side < 0 ? ROOM_L - 80 : ROOM_R + 80; ty = (WINDOW_TOP + WINDOW_BOTTOM) / 2;
    speed = JET_FLEE;
    if (Math.abs(m.x - tx) < 30) { e.aiState = 'gone'; return true; }
  } else {
    // Hung off to his side of Meathead, a bit above him, bobbing on the jet; turned to him
    const off = 180 + ((e.variant ?? 0) % 3) * 50;
    tx = Math.max(ROOM_L + 40, Math.min(ROOM_R - 40, pm.x + side * off));
    ty = Math.max(ROOM_TOP + 60, Math.min(330, pm.y - 170 - ((e.variant ?? 0) % 2) * 50)) + Math.sin((state.frame + (e.variant ?? 0) * 40) * 0.06) * 10;
    if (e.aiState === 'enter' && Math.hypot(tx - m.x, ty - m.y) < 40) { e.aiState = 'hover'; e.shootTimer = 40 + Math.floor(Math.random() * 60); }
    e.facing = pm.x < m.x ? -1 : 1;
    if (e.aiState === 'hover' && ++e.shootTimer >= JET_FIRE && p.health > 0) { e.shootTimer = Math.floor(Math.random() * 30); jetShot(ctx, e); }
  }
  const dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy) || 1;
  const want = Math.min(speed, d * 0.08 + 0.4);
  e.vel.x += (dx / d * want - e.vel.x) * 0.12;
  e.vel.y += (dy / d * want - e.vel.y) * 0.12;
  if (e.aiState === 'flee') e.facing = e.vel.x < 0 ? -1 : 1;
  e.pos.x += e.vel.x;
  e.pos.y += e.vel.y;
  // (he never goes through the ceiling; fleeing, he goes out through the wall's window)
  if (e.pos.y < ROOM_TOP + 4) { e.pos.y = ROOM_TOP + 4; e.vel.y = Math.max(0, e.vel.y); }
  if (e.aiState !== 'flee' && e.aiState !== 'enter') e.pos.x = Math.max(ROOM_L + 4, Math.min(ROOM_R - e.width - 4, e.pos.x));
  jetTrail(ctx, e, e.aiState === 'flee' || Math.abs(e.vel.y) > 2);
  return true;
};
