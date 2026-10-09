// Killed by the soul sucker's gore spray (someone else's insides, hosed at them): not more gore, a pratfall. Marv on the
// ice in Home Alone 2: their feet fly out from under them the way they were facing, they come down flat on their back,
// and they go, sliding along the slick on their back, flailing, till they hit a wall, or somebody alive (who takes a
// knock for it by its weight and speed, and trips; and if that kills him, he's off on his own slide), or go off the
// edge of something (down stairs, they land and keep going; off a cliff, gone). Something in the air comes down to the
// floor first, flailing, and then goes. The dead don't hit the dead: they slide through each other.
// A body's taken out of the enemies when it starts (it's not one any more), and moved and drawn here.

import type { Enemy, Block } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { CANVAS_HEIGHT } from '../../m1/constants';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { playSound } from '../../m1/game/platform/audio';
import { getEnemyMass, pushEnemy } from '../../m1/game/combat/knockback';
import { kindFacing, isHumanoidKind } from '../../m1/game/render/enemies';
import { shakeScreen } from '../../m1/game/core/state';
import { drawEnemyAt } from '../moves/grab';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';

type Ctx = CanvasRenderingContext2D;
type Phase = 'fall' | 'slip' | 'slide' | 'drop' | 'rest';
interface Slider { e: Enemy; x: number; feet: number; vx: number; vy: number; dir: 1 | -1; t: number; phase: Phase; turn: number; lift: number; restT: number }

/** The slip (frames), how fast they go, how quickly the slick lets them slow, how long they lie there after. */
const SLIP = 16, SPEED = 10, FRICTION = 0.085, LIE = 900, MAX_BODIES = 24;
/** A bump into somebody alive: how hard (by the body's weight and speed), never more than this. */
const BUMP = 2.2, BUMP_MAX = 30;

let sliders: Slider[] = [];
export const stopGoreSlides = () => { sliders = []; };

const solid = (b: Block) => b.type !== 'pit' && b.type !== 'door';
/** The floor under x, at or below `from` (null: nothing; a drop to nowhere). */
const floorUnder = (state: GameState, x: number, from: number) => {
  let best: number | null = null;
  for (const b of state.blocks) if (solid(b) && x >= b.x && x <= b.x + b.w && b.y >= from - 6 && (best === null || b.y < best)) best = b.y;
  return best;
};
/** A wall in the way of a body lying at (x, feet), going `step` this frame. */
const wallAhead = (state: GameState, x: number, feet: number, step: number) => {
  const x0 = Math.min(x, x + step), x1 = Math.max(x, x + step);
  return state.blocks.some(b => solid(b) && !b.oneWay && b.x < x1 && b.x + b.w > x0 && b.y < feet - 8 && b.y + b.h > feet - 26);
};

/** Killed by the gore spray: off on a slide (true), or not (a boss, a mid-boss: theirs is their own business). */
export const startGoreSlide = (ctx: FrameContext, e: Enemy): boolean => {
  if (e.type === 'boss' || isMidBoss(e)) return false;
  const { state, fx } = ctx;
  // (the way it was facing when it went, whatever was shoving it about: a bump, a knock, it doesn't matter now)
  const dir = (kindFacing(e, state) >= 0 ? 1 : -1) as 1 | -1;
  e.health = Math.min(e.health, 0);
  playSound('squish', 0.9); playSound('splat', 0.5, 4);
  fx.spawnPickup(e.pos, false);
  fx.speakVulgarity(m2Kill('gore_kill'));
  fx.spawnKillCallout(e, grabCallout('gorespray'));
  const x = e.pos.x + e.width / 2, feet = e.pos.y + e.height;
  const floor = floorUnder(state, x, feet);
  const grounded = floor !== null && floor - feet < 4;
  e.pose = undefined; e.melee = undefined; e.vel = { x: 0, y: 0 };
  sliders.push({ e, x, feet, vx: 0, vy: 0, dir, t: 0, phase: grounded ? 'slip' : 'fall', turn: 0, lift: 0, restT: 0 });
  if (sliders.length > MAX_BODIES) sliders.shift();
  // (it's not one of them any more: a body, moved and drawn here)
  state.enemies = state.enemies.filter(o => o !== e);
  return true;
};

const speedOf = (e: Enemy) => SPEED * Math.max(0.7, Math.min(1.3, 200 / Math.max(60, getEnemyMass(e)) * 0.5 + 0.6));

/** A body sliding into somebody alive: a knock by its weight and speed, and he trips; killed by it, he's off too. */
const bump = (ctx: FrameContext, s: Slider, o: Enemy) => {
  const { state, fx } = ctx;
  const weight = Math.min(2.5, Math.max(0.4, getEnemyMass(s.e) / 200));
  const dmg = Math.max(4, Math.min(BUMP_MAX, Math.round(Math.abs(s.vx) * weight * BUMP)));
  o.health -= dmg;
  fx.spawnDamageNumber(o.pos, dmg);
  playSound('thud', 0.9); playSound('punch', 0.6, -4);
  state.damageNumbers.push({ id: `wipeout-${state.frame}-${Math.random()}`, text: 'WIPEOUT!', pos: { x: o.pos.x + o.width / 2, y: o.pos.y - 16 }, vel: { x: 0, y: -2 }, life: 60, maxLife: 60, isCritical: true, isCallout: true, color: '#F87171' });
  if (o.health <= 0) { startGoreSlide(ctx, o); return; }
  // (his feet taken out from under him: knocked over the way it was going, dazed a moment)
  pushEnemy(o, s.dir * 4, -5, 40);
};

const tickOne = (ctx: FrameContext, s: Slider): boolean => {
  const { state } = ctx;
  s.t++;
  const e = s.e;
  const bottom = state.camera.y + CANVAS_HEIGHT + 260;
  switch (s.phase) {
    case 'fall': {
      // (out of the air: down to the floor, tumbling, flailing all the way)
      s.vy = Math.min(16, s.vy + 0.6); s.feet += s.vy;
      s.turn = Math.min(1, s.turn + 0.05);
      const floor = floorUnder(state, s.x, s.feet - s.vy);
      if (floor !== null && s.feet >= floor) {
        s.feet = floor; s.vy = 0; s.phase = 'slide'; s.turn = 1; s.vx = s.dir * speedOf(e);
        playSound('thud', 1); shakeScreen(state, 4, 3);
      } else if (s.feet > bottom) return false;
      break;
    }
    case 'slip': {
      // (Marv: the feet go out from under him, up he goes, flat on his back)
      const k = s.t / SLIP;
      s.turn = Math.min(1, k * 1.15);
      s.lift = Math.sin(Math.min(1, k) * Math.PI) * 30;
      s.vx = s.dir * speedOf(e) * k;
      if (!wallAhead(state, s.x, s.feet, s.vx)) s.x += s.vx; else s.vx = 0;
      if (s.t >= SLIP) { s.phase = s.vx === 0 ? 'rest' : 'slide'; s.lift = 0; s.turn = 1; playSound('thud', 1, -4); shakeScreen(state, 5, 4); }
      break;
    }
    case 'slide':
    case 'drop': {
      if (s.phase === 'drop') {
        s.vy = Math.min(16, s.vy + 0.6); s.feet += s.vy;
        const floor = floorUnder(state, s.x, s.feet - s.vy);
        // (off the edge of something with a floor under it (a step, a ledge): down on it, and on it goes)
        if (floor !== null && s.feet >= floor) { s.feet = floor; s.vy = 0; s.phase = 'slide'; playSound('thud', 0.7, 2); }
        else if (s.feet > bottom) return false;
      }
      // Into a wall: stopped dead
      if (wallAhead(state, s.x + s.dir * 18, s.feet, s.vx)) { s.vx = 0; s.phase = 'rest'; playSound('thud', 1, -6); shakeScreen(state, 3, 2); break; }
      // Into somebody alive (or a boss: no harm to him, but it stops there)
      const reach = s.x + s.dir * 22;
      const hit = state.enemies.find(o => o.health > 0 && !o.isBlownAway && !o.innocent && reach + 6 > o.pos.x && reach - 6 < o.pos.x + o.width && s.feet > o.pos.y + 4 && s.feet - 30 < o.pos.y + o.height);
      if (hit) { if (hit.type !== 'boss' && !isMidBoss(hit)) bump(ctx, s, hit); s.vx = 0; s.phase = 'rest'; break; }
      s.x += s.vx;
      if (s.phase === 'slide') {
        s.vx -= s.dir * FRICTION;
        if (Math.sign(s.vx) !== s.dir || Math.abs(s.vx) < 0.4) { s.vx = 0; s.phase = 'rest'; break; }
        // (the edge of something: over it)
        const floor = floorUnder(state, s.x, s.feet);
        if (floor === null || floor > s.feet + 4) { s.phase = 'drop'; s.vy = 0; }
        else if (floor < s.feet) s.feet = floor;
        // (the slick it leaves, and the squeak of it)
        if (s.t % 3 === 0) state.particles.push({ pos: { x: s.x - s.dir * 20, y: s.feet - 2 }, vel: { x: s.vx * 0.1, y: -0.3 }, life: 40, color: s.t % 6 ? '#7F1D1D' : '#991B1B', size: 3 });
        if (s.t % 14 === 0) playSound('squish', 0.5, 4 + Math.random() * 4);
      }
      break;
    }
    case 'rest':
      if (++s.restT > LIE) return false;
      break;
  }
  // (flailing: the legs going as if running, faster the faster it goes; a twitch now and then after)
  e.vel.x = s.phase === 'rest' ? (s.restT < 50 && s.restT % 12 < 6 ? s.dir * 2 : 0) : s.dir * Math.max(2.5, Math.abs(s.vx)) * 1.5;
  return true;
};

export const tickGoreSlides = (ctx: FrameContext) => { if (sliders.length) sliders = sliders.filter(s => tickOne(ctx, s)); };

/** The bodies: on their backs, flailing (world space). */
export const drawGoreSlides = (c: Ctx, state: GameState) => {
  for (const s of sliders) {
    const e = s.e, k = s.turn, f = state.frame + s.t;
    const fade = s.phase === 'rest' && s.restT > LIE - 60 ? (LIE - s.restT) / 60 : 1;
    const flail = s.phase === 'rest' ? 0 : Math.sin(f * 0.9) * 0.14 + Math.sin(f * 1.7) * 0.06;
    c.save(); c.globalAlpha = fade;
    if (isHumanoidKind(e.kind)) {
      // (a person: flat on their back, feet first, the way it's going, face up, arms and legs going)
      drawEnemyAt(c, e, state, s.x + s.dir * e.height * 0.45 * k, s.feet - 5 * k - s.lift, -s.dir * (Math.PI / 2) * k + flail * k, s.dir);
    } else {
      // (an animal: rolled right over, legs in the air, kicking)
      drawEnemyAt(c, e, state, s.x + s.dir * 6 * k, s.feet - (e.height + 2) * k - s.lift, Math.PI * k + flail * k, s.dir);
    }
    c.restore();
  }
};
