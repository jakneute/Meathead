// Swimming and his air, in every body of water in the land (Norway's fjord and the troll river, Mexico's diving pool,
// Venice's canals, the koi pond, the Thames, Canada's ponds): the engine's swimming (the river's way, Adventure Land:
// SWIM_LEAP to jump out at the surface), and his air going while his head's under, back when it's out; out of it, he
// drowns a bit at a time (its hurt and death lines: 'm2:fl_drown', in Norway's table). The air over his head while it's
// not full: six bubbles, red and beeping when it's low.

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import type { WaterBody } from '../../m1/game/stages/index';
import { SWIM_LEAP } from '../../m1/constants';
import { hurtPlayer } from '../../m1/game/bosses/shared';
import { playSound } from '../../m1/game/platform/audio';
import { pickLine } from '../../m1/game/platform/speech';
import { meatheadSays } from './section';
import { MEATHEAD_AIR } from '../adventure/river/lines';

type Ctx = CanvasRenderingContext2D;
/** As the river's: a full breath lasts this many frames under; it comes back this much faster out; drowning's bite. */
const AIR_FRAMES = 1350, AIR_REFILL = 7.5, DROWN_EVERY = 45, DROWN_DAMAGE = 7;

interface Air { o2: number; drownT: number; lowSaid: boolean }
const AIRS = new WeakMap<object, Air>();
const airOf = (state: GameState): Air => {
  const k = state.stage as object;
  let a = AIRS.get(k);
  if (!a) { a = { o2: 1, drownT: 0, lowSaid: false }; AIRS.set(k, a); }
  return a;
};

/** A frame: in the water (the body at his middle), he swims; his air goes under, comes back out. */
export const updateSwimAir = (ctx: FrameContext, bodyAt: (x: number, y: number) => WaterBody | null) => {
  const { state } = ctx, p = state.player;
  if (!state.stage) return;
  const a = airOf(state);
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  const body = bodyAt(cx, cy);
  const was = p.swimming;
  p.swimming = !!body && body.kind !== 'muck' && cy > body.surface && !p.inCutscene && !p.carried;
  if (p.swimming && body) { p.swimSurfaceY = body.surface; p.swimLeap = SWIM_LEAP; }
  if (p.swimming && !was && p.vel.y > 3) { playSound('splash'); for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: cx, y: body!.surface }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 5 }, life: 26, color: i % 2 ? '#E0F2FE' : '#7DD3FC', size: 3 + Math.random() * 3 }); }
  if (state.deathTimer > 0 || p.health <= 0) return;
  const under = p.swimming && !!body && p.pos.y + 6 > body.surface;
  if (under && !ctx.cheats.invincible) {
    a.o2 = Math.max(0, a.o2 - 1 / AIR_FRAMES);
    if (a.o2 < 0.3 && !a.lowSaid) { a.lowSaid = true; meatheadSays(state, pickLine(MEATHEAD_AIR), false); }
    if (a.o2 < 0.25 && state.frame % 20 === 0) playSound('beep');
    if (state.frame % 14 === 0) state.particles.push({ pos: { x: cx + p.facing * 8, y: p.pos.y + 10 }, vel: { x: 0, y: -1.2 }, life: 40, color: 'rgba(224, 242, 254, 0.8)', size: 3 });
    if (a.o2 <= 0 && ++a.drownT >= DROWN_EVERY) {
      a.drownT = 0; p.invincibilityTimer = 0;
      hurtPlayer(ctx, DROWN_DAMAGE, 'm2:fl_drown');
    }
  } else {
    a.o2 = Math.min(1, a.o2 + AIR_REFILL / AIR_FRAMES);
    a.drownT = 0;
    if (a.o2 > 0.6) a.lowSaid = false;
  }
};

/** His air over his head while it isn't full. */
export const drawAir = (c: Ctx, state: GameState) => {
  if (!state.stage) return;
  const a = airOf(state), p = state.player;
  if (a.o2 >= 0.999 || p.health <= 0 || p.hidden) return;
  const n = 6, lit = Math.ceil(a.o2 * n), cx = p.pos.x + p.width / 2, y = p.pos.y - 18;
  for (let i = 0; i < n; i++) {
    const bx = cx - (n - 1) * 6 + i * 12;
    c.beginPath(); c.arc(bx, y, 4.5, 0, Math.PI * 2);
    if (i < lit) { c.fillStyle = a.o2 < 0.3 && state.frame % 20 < 10 ? '#F87171' : '#E0F2FE'; c.fill(); }
    c.strokeStyle = '#0C4A6E'; c.lineWidth = 1.5; c.stroke();
  }
};
