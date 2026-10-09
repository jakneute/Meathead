// Safari Artie's junior guides (Adventure Land's own, out by the clearing): khaki, a whistle, a walking stick, and a
// pith helmet with spikes welded on top. Dive kick one and he lands on the spikes: they're the dive kick's counter, the
// way the cast members' spears are the shoulder charge's. They walk at him, wind up, and swing the stick.
// Men and women, every look, by seed.

import type { Enemy } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import { registerM2Kind, registerHurtLines } from '../kinds';
import { playSound } from '../../m1/game/platform/audio';
import { drawPerson, lookOf } from './temple/people';

/** What he says when a guide's stick gets him, and when he comes down on a spiked helmet; their death screens. */
export const HURT_GUIDE = ['HE HIT ME WITH A HIKING STICK!', 'QUIT WHACKING ME, SCOUT!', 'IS THAT IN THE TOUR?!'];
export const DEATH_GUIDE = ['WALKING-STICKED TO DEATH', 'GUIDED TO THE AFTERLIFE', 'TOUR OVER'];
export const HURT_HAT_SPIKES = ['SPIKES! ON THE HAT! WHO PUTS SPIKES ON A HAT?!', 'I STOMPED A PINCUSHION!', 'MY FEET! MY EVERYTHING!', 'NOTE TO SELF: DO NOT JUMP ON THE POINTY HAT.'];
export const DEATH_HAT_SPIKES = ['STOMPED A SPIKED HAT', 'IMPALED FROM BELOW', 'HAT TRICK'];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...HURT_GUIDE, ...HURT_HAT_SPIKES],
  death: [...DEATH_GUIDE, ...DEATH_HAT_SPIKES],
};

const mid = (o: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });
const seedOf = (e: Enemy) => Math.abs(Math.round(e.homeX || 0)) * 7 + (e.variant ?? 0) * 31 + 11;

const guideAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 80;
  const face = (dx < 0 ? -1 : 1) as 1 | -1;
  switch (e.aiState) {
    case 'idle':
    default:
      e.vel.x = 0;
      if (adx < 500 && Math.abs(p.y - m.y) < 160 && state.player.health > 0) { e.aiState = 'walk'; e.aiTimer = 0; playSound('beep', 0.4, 8); }
      break;
    case 'walk':
      e.facing = face;
      e.vel.x = adx > 60 ? face * 2.1 : 0;
      if (adx < 90 && level) { e.aiState = 'windup'; e.aiTimer = 0; }
      break;
    case 'windup':
      e.vel.x = 0; e.facing = face;
      if (e.aiTimer > 18) { e.aiState = 'swing'; e.aiTimer = 0; playSound('whoosh', 0.6, 0); }
      break;
    case 'swing':
      e.vel.x = e.facing! * (e.aiTimer < 7 ? 5.5 : 0);
      if (e.aiTimer > 14) { e.aiState = 'recover'; e.aiTimer = 0; }
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 30) { e.aiState = 'walk'; e.aiTimer = 0; }
      break;
  }
  return false;
};

/** The walking stick, held out the way he's facing (raised back in the windup, swung through in the swing). */
const drawStick = (c: CanvasRenderingContext2D, e: Enemy) => {
  const a = e.aiState === 'windup' ? -1.9 : e.aiState === 'swing' ? 0.1 : -0.5;
  c.save(); c.translate(14, -42); c.rotate(a);
  c.fillStyle = '#1C1917'; c.fillRect(-2, -2, 34, 5);
  c.fillStyle = '#7C2D12'; c.fillRect(-1, -1, 32, 3);
  c.restore();
};

registerM2Kind({
  kind: 'm2:guide', stats: { w: 38, h: 66, hp: 90, contact: 10, mass: 200 }, ai: guideAI, humanoid: true, grab: 'body',
  // (the spikes on his helmet: don't dive kick him)
  spiky: { source: 'm2:guide_spikes', label: 'SPIKED!' },
  gender: e => (lookOf(seedOf(e)).woman ? 'f' : 'm'),
  head: { x: 1, y: -64, r: 9 },
  draw: (c, e, f) => {
    const pose = e.aiState === 'swing' ? 'thrust' : Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand';
    drawPerson(c, { seed: seedOf(e), outfit: 'guide', f, pose, mood: 'angry' });
    drawStick(c, e);
  },
});
registerHurtLines('m2:guide', HURT_GUIDE, DEATH_GUIDE);
registerHurtLines('m2:guide_spikes', HURT_HAT_SPIKES, DEATH_HAT_SPIKES);

export const GUIDE_KIND = 'm2:guide';
