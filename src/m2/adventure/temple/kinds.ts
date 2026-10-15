// The temple's people (Meathead 2's own kinds):
//   actor:     a cast member in the Temple of the Jaguar's warrior costume, with a spear (a real one). Walks at him,
//              draws it back (the tell), lunges with it.
//   stagehand: running one of the set's tricks (the catapult, the dart blower, the snake puppet); harmless, he just
//              cowers when Meathead comes at him. Dead, his trick stops (the section checks for him by `variant`).
// Men and women, every look, by seed.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { drawPerson, drawSpear, lookOf } from './people';
import { HURT_ACTOR, DEATH_ACTOR, HURT_SPEAR, DEATH_SPEAR } from './lines';

const mid = (o: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });
const seedOf = (e: Enemy) => Math.abs(Math.round(e.homeX || 0)) + (e.variant ?? 0) * 31;

const actorAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 80;
  const face = (dx < 0 ? -1 : 1) as 1 | -1;
  switch (e.aiState) {
    case 'idle':
    default:
      e.vel.x = 0;
      if (adx < 520 && Math.abs(p.y - m.y) < 160 && state.player.health > 0) { e.aiState = 'walk'; e.aiTimer = 0; }
      break;
    case 'walk':
      e.facing = face;
      e.vel.x = adx > 70 ? face * 1.9 : 0;
      if (adx < 100 && level) { e.aiState = 'windup'; e.aiTimer = 0; }
      break;
    case 'windup':
      e.vel.x = 0; e.facing = face;
      if (e.aiTimer > 20) { e.aiState = 'thrust'; e.aiTimer = 0; playSound('whoosh', 0.6, 2); }
      break;
    case 'thrust':
      e.vel.x = e.facing! * (e.aiTimer < 8 ? 6.5 : 0);
      if (e.aiTimer > 16) { e.aiState = 'recover'; e.aiTimer = 0; }
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 34) { e.aiState = 'walk'; e.aiTimer = 0; }
      break;
  }
  return false;
};

const stagehandAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  const p = mid(state.player), m = mid(e), home = (e.homeX ?? e.pos.x);
  e.harmless = true;
  const near = Math.abs(p.x - m.x) < 130 && Math.abs(p.y - m.y) < 120;
  e.aiState = near ? 'cower' : 'work';
  // (cowering: a step or two back from him, no further from his post than that)
  const away = p.x < m.x ? 1 : -1;
  e.vel.x = near && Math.abs(e.pos.x + away * 1.2 - home) < 50 ? away * 1.2 : 0;
  if (!near && Math.abs(e.pos.x - home) > 2) e.vel.x = Math.sign(home - e.pos.x) * 0.8;
  return false;
};

registerM2Kind({
  kind: 'm2:actor', stats: { w: 40, h: 66, hp: 170, contact: 10, mass: 210 }, ai: actorAI, humanoid: true,
  // (the spear out in front of them: don't shoulder charge one from the front)
  pointy: { source: 'm2:actor_spear', label: 'SKEWERED!' },
  gender: e => (lookOf(seedOf(e)).woman ? 'f' : 'm'),
  head: { x: 1, y: -66, r: 9 },
  draw: (c, e, f) => {
    const pose = e.aiState === 'thrust' ? 'thrust' : Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand';
    drawPerson(c, { seed: seedOf(e), outfit: 'warrior', f, pose, mood: 'angry' });
    const a = e.aiState === 'windup' ? -0.25 : 0;
    drawSpear(c, e.aiState === 'windup' ? 0 : e.aiState === 'thrust' ? 22 : 10, -46, a);
  },
});
registerM2Kind({
  kind: 'm2:stagehand', stats: { w: 36, h: 66, hp: 60, contact: 0, mass: 190 }, ai: stagehandAI, humanoid: true,
  make: b => ({ ...b, harmless: true }),
  gender: e => (lookOf(seedOf(e)).woman ? 'f' : 'm'),
  head: { x: 1, y: -66, r: 9 },
  draw: (c, e, f) => drawPerson(c, { seed: seedOf(e), outfit: 'stage', f, pose: e.aiState === 'cower' ? 'stand' : 'crank', mood: e.aiState === 'cower' ? 'scared' : 'bored' }),
});

registerHurtLines('m2:actor', HURT_ACTOR, DEATH_ACTOR);
registerHurtLines('m2:actor_spear', HURT_SPEAR, DEATH_SPEAR);
