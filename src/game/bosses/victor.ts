// Victor Volcano: jumps, lands, then opens magma vents on a wall and the floor.
// His weakness, the tsunami, turns the vents into steam (see systems/hazards.ts).

import { Enemy } from '../../types';
import { ARENA_RIGHT, BOSS_DOOR_X, STAGE_WIDTH } from '../../constants';
import type { FrameContext } from '../context';
import { BossDef, FLOOR_Y, midX } from './shared';

const TELEGRAPH_FRAMES = 60;
const ERUPTION_FRAMES = 180;
const REST_FRAMES = 40;
const VENT_MIN_GAP_FROM_VICTOR = 150;
const VENT_MIN_GAP = 100;

const update = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  const helpers = ctx.bossHelpers;
  switch (boss.bossState) {
    case 'attacking':
      // Vents erupting; rest once they've all gone quiet
      boss.vel.x = 0;
      if (state.bossVolcanoes.length === 0 && boss.stateTimer! <= 0) { boss.bossState = 'idle'; boss.stateTimer = REST_FRAMES; }
      break;
    case 'telegraphing':
      boss.vel.x = 0;
      if (boss.stateTimer! <= 0) {
        boss.bossState = 'attacking';
        boss.stateTimer = ERUPTION_FRAMES;
        state.bossVolcanoTelegraphs.forEach(t => helpers.addVolcano({ pos: t.pos, life: ERUPTION_FRAMES, type: t.type }));
        helpers.clearVolcanoTelegraphs();
      }
      break;
    case 'jumping':
      if (boss.isGroundedBoss) telegraphVents(ctx, boss);
      break;
    default:
      if (boss.stateTimer! <= 0) jump(ctx, boss);
  }
  if (boss.isGroundedBoss) boss.vel.x *= 0.95;
};

/** Just landed: mark a wall vent (alternating sides) and one or two floor vents. */
const telegraphVents = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  const helpers = ctx.bossHelpers;
  boss.bossState = 'telegraphing';
  boss.stateTimer = TELEGRAPH_FRAMES;
  helpers.clearVolcanoTelegraphs();

  const side = (state.victorWallSide + 1) % 2;
  helpers.setVictorWallSide(side);
  helpers.addVolcanoTelegraph({ pos: { x: side === 0 ? BOSS_DOOR_X : STAGE_WIDTH, y: 250 + Math.random() * 200 }, life: TELEGRAPH_FRAMES, type: 'wall' });

  // More floor vents below half health, kept away from Victor and each other
  const healthPct = (boss.health / boss.maxHealth) * 100;
  const count = healthPct > 50 ? 1 : 2;
  const placed: number[] = [];
  for (let i = 0; i < count; i++) {
    let x = 0;
    for (let attempt = 0; attempt < 20; attempt++) {
      x = BOSS_DOOR_X + 150 + Math.random() * 500;
      if (Math.abs(x - midX(boss)) > VENT_MIN_GAP_FROM_VICTOR && placed.every(p => Math.abs(x - p) >= VENT_MIN_GAP)) break;
    }
    placed.push(x);
    helpers.addVolcanoTelegraph({ pos: { x: Math.max(BOSS_DOOR_X + 50, Math.min(ARENA_RIGHT - 60, x)), y: FLOOR_Y }, life: TELEGRAPH_FRAMES, type: 'ground' });
  }
};

/** Jumps for a platform if there is one, otherwise toward Meathead. */
const jump = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  boss.vel.y = -20 - Math.random() * 5;
  const platforms = state.blocks.filter(b => b.type === 'platform' && b.x > BOSS_DOOR_X);
  if (platforms.length > 0) {
    const target = platforms[Math.floor(Math.random() * platforms.length)];
    boss.vel.x = (target.x + target.w / 2 - midX(boss)) * 0.04;
  } else {
    boss.vel.x = (state.player.pos.x < boss.pos.x ? -1 : 1) * 4 + (Math.random() - 0.5) * 2;
  }
  boss.bossState = 'jumping';
  boss.stateTimer = 60;
};

export const victor: BossDef = {
  id: 'Victor Volcano',
  weakness: 'TSUNAMI',
  weaknessDamage: 150,
  spawn: { x: 7700 },
  update,
  // He stays 'jumping' when he lands so update() can open the vents
  physics: { landingEndsJump: false },
};
