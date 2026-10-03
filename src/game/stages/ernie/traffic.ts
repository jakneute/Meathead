// Traffic on the bridge: people trying to get off it, in your lane, and not
// stopping for anyone. A horn and headlights at the edge of the screen first
// (most come up from behind you; now and then one comes the wrong way), then a
// minivan doing sixty. Get hit and you're flung down the road (maybe into a
// gap). Jump on the roof and it'll carry you. A hole in the deck doesn't stop
// it the first time: it launches off the lip, flies the gap, slams down on the
// far side (sparks, a hubcap off) and keeps on going. The second hole it comes
// to, its luck's run out: over the lip nose first and down it goes. Run into
// him, though, and that's it for the car: it goes up in a ball of fire, bits
// of it everywhere. Anything of Ernie's in the road is roadkill.

import type { Block } from '../../../types';
import type { FrameContext } from '../../core/context';
import { hurtPlayer } from '../../bosses/shared';
import { playSound } from '../../platform/audio';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { floorTopAt } from '../../core/terrain';
import { GROUND_Y, CANVAS_WIDTH } from '../../../constants';
import { shakeScreen } from '../../core/state';
import { COURSE } from './course';

export interface Car {
  /** Left end of the body, and where its wheels sit. */
  x: number; y: number;
  dir: 1 | -1;
  speed: number;
  vy: number;
  rot: number;
  color: string;
  /**
   * Coming (only its horn and headlights at the edge of the view yet), driving, launched off the lip of a gap (flying
   * over it after you: it lands in a ball of fire and goes up, nothing left of it), or going down a gap.
   */
  state: 'coming' | 'driving' | 'launched' | 'falling';
  t: number;
  /** Gaps it's jumped (it gets the one). */
  hops: number;
  /** You can stand on the roof. */
  roof: Block;
}
export interface Traffic { cars: Car[]; timer: number }

/** A minivan's size: about as tall as he is. (It's drawn from a 100 x 46 design, scaled up to this.) */
export const CAR_W = 140, CAR_H = 64;
/** How long the horn and headlights warn you before it's in view. */
export const CAR_WARN = 75;
const CAR_DAMAGE = 14, CAR_FLING_X = 11, CAR_FLING_Y = -9;
const COLORS = ['#2563EB', '#DC2626', '#F8FAFC', '#16A34A', '#FACC15', '#9333EA', '#F97316', '#0EA5E9'];

export const createTraffic = (): Traffic => ({ cars: [], timer: 150 });

/** Where the cars run: the bridge from a little way out to a little way short of the far end. */
const inTraffic = (x: number) => x > COURSE.bridge.x1 + 150 && x < COURSE.bridge.exit - 250;

export const updateTraffic = (ctx: FrameContext, tr: Traffic) => {
  const { state } = ctx;
  const p = state.player;
  const px = p.pos.x + p.width / 2;
  // (one every few seconds, and two about at once at most: never two on their way in from the same side together)
  const coming = tr.cars.filter(c => c.state === 'coming');
  if (inTraffic(px) && tr.cars.length < 2 && --tr.timer <= 0) {
    tr.timer = 200 + Math.floor(Math.random() * 160);
    let dir: 1 | -1 = Math.random() < 0.72 ? 1 : -1;
    if (coming.some(c => c.dir === dir)) dir = dir > 0 ? -1 : 1;
    const x = dir > 0 ? state.camera.x - CAR_W - 30 : state.camera.x + CANVAS_WIDTH + 30;
    const roof: Block = { x, y: GROUND_Y - CAR_H, w: CAR_W, h: 10, type: 'platform', hidden: true, oneWay: true, tag: 'car-roof' };
    tr.cars.push({ x, y: GROUND_Y, dir, speed: 7 + Math.random(), vy: 0, rot: 0, color: COLORS[Math.floor(Math.random() * COLORS.length)], state: 'coming', t: 0, hops: 0, roof });
    playSound('horn');
  }
  for (const c of tr.cars) {
    c.t++;
    if (c.state === 'coming') {
      // Keeping pace with the edge of the view till it comes out of it
      c.x = c.dir > 0 ? state.camera.x - CAR_W - 30 : state.camera.x + CANVAS_WIDTH + 30;
      if (c.t === Math.floor(CAR_WARN / 2)) playSound('horn');
      if (c.t >= CAR_WARN) { c.state = 'driving'; c.t = 0; state.blocks.push(c.roof); }
      continue;
    }
    if (c.state === 'driving') drive(ctx, c);
    else if (c.state === 'launched') flying(ctx, c);
    else { c.vy += 0.6; c.y += c.vy; c.x += c.dir * c.speed * 0.4; c.rot += c.dir * 0.035; }
    c.roof.x = c.x; c.roof.y = c.y - CAR_H;
  }
  // Gone: off out of view, or down the hole
  tr.cars = tr.cars.filter(c => {
    const gone = (c.state === 'falling' && c.y > GROUND_Y + 700) || (c.state !== 'coming' && c.state !== 'falling' && (c.x > state.camera.x + CANVAS_WIDTH + 400 || c.x < state.camera.x - 400 - CAR_W));
    if (gone) state.blocks = state.blocks.filter(b => b !== c.roof);
    return !gone;
  });
};

const drive = (ctx: FrameContext, c: Car) => {
  const { state } = ctx;
  const p = state.player;
  const dx = c.dir * c.speed;
  // Riding on the roof: it takes you with it
  const riding = p.isGrounded && p.pos.x + p.width > c.x && p.pos.x < c.x + CAR_W && Math.abs(p.pos.y + p.height - c.roof.y) < 3;
  c.x += dx;
  if (riding) p.pos.x += dx;
  // Nose out over a gap in the deck: the first one, it doesn't stop, it launches off the lip and flies it; the second,
  // it's out of luck (over the lip nose first, and down)
  const front = c.dir > 0 ? c.x + CAR_W - 18 : c.x + 18;
  if (floorTopAt(deck(state), front, c.y, 4) === null) {
    if (c.hops >= 1) {
      c.state = 'falling'; c.vy = 1; c.t = 0;
      state.blocks = state.blocks.filter(b => b !== c.roof);
      if (riding) { p.vel.x = c.dir * c.speed * 0.6; p.isGrounded = false; }
      playSound('horn');
      return;
    }
    c.hops++;
    c.state = 'launched'; c.t = 0;
    c.vy = -9;
    c.speed *= 1.15;
    playSound('horn'); playSound('engine', 1, 5);
    return;
  }
  hitThings(ctx, c);
};

/** The deck under it (not a car roof). */
const deck = (state: FrameContext['state']) => state.blocks.filter(b => b.tag !== 'car-roof');

/** In the air over the gap, nose up then down: it comes down on the far side (a fireball) or short of it (down the hole). */
const flying = (ctx: FrameContext, c: Car) => {
  const { state } = ctx;
  const p = state.player;
  const riding = p.isGrounded && p.pos.x + p.width > c.x && p.pos.x < c.x + CAR_W && Math.abs(p.pos.y + p.height - c.roof.y) < 3;
  c.vy += 0.55; c.y += c.vy;
  c.x += c.dir * c.speed;
  if (riding) { p.pos.x += c.dir * c.speed; p.pos.y += c.vy; }
  c.rot = Math.max(-0.35, Math.min(0.35, c.vy * 0.03)) * c.dir;
  hitThings(ctx, c);
  if (c.vy <= 0) return;
  // Down: onto deck, or not
  const mid = c.x + CAR_W / 2;
  const top = floorTopAt(deck(state), mid, c.y - 10, 30);
  if (top !== null && c.y >= top) { c.y = top; slamDown(ctx, c); return; }
  if (c.y > GROUND_Y + 20) { c.state = 'falling'; state.blocks = state.blocks.filter(b => b !== c.roof); }
};

/** Down on the far side, hard: the suspension bottoms out, sparks off the sills, a hubcap off and rolling, and it drives on. */
const slamDown = (ctx: FrameContext, c: Car) => {
  const { state, fx } = ctx;
  if (hitThings(ctx, c)) return;
  c.vy = 0; c.rot = 0; c.state = 'driving'; c.t = 0;
  c.speed /= 1.15;
  playSound('crash', 0.7); playSound('thud');
  shakeScreen(state, 12, 5);
  const under = { x: c.x + CAR_W / 2, y: c.y - 4 };
  fx.spawnExplosion(under, '#FDE047', 14, -c.dir * 6, 10);
  fx.spawnExplosion(under, '#9CA3AF', 8, -c.dir * 3, 8);
  // (the hubcap, off and rolling away)
  state.particles.push({ pos: { x: c.x + (c.dir > 0 ? 30 : CAR_W - 30), y: c.y - 10 }, vel: { x: c.dir * 5, y: -6 }, life: 70, color: '#D1D5DB', size: 8 });
};

/** Into him: it goes up in a ball of fire, all of it (whoever's on the roof thrown off), bits of it everywhere, nothing left. */
const explode = (ctx: FrameContext, c: Car) => {
  const { state, fx } = ctx;
  const p = state.player;
  const onRoof = p.pos.x + p.width > c.x && p.pos.x < c.x + CAR_W && Math.abs(p.pos.y + p.height - c.roof.y) < 12;
  state.blocks = state.blocks.filter(b => b !== c.roof);
  if (onRoof) { p.vel.y = -12; p.vel.x = c.dir * 6; p.isGrounded = false; playSound('boing', 0.8); }
  const cx = c.x + CAR_W / 2, cy = c.y - CAR_H / 2;
  playSound('boom'); playSound('crash');
  shakeScreen(state, 25, 9);
  fx.spawnExplosion({ x: cx, y: cy }, '#F97316', 30, 0, 18);
  fx.spawnExplosion({ x: cx, y: cy }, '#FDE047', 18, 0, 12);
  fx.spawnExplosion({ x: cx, y: cy }, '#1C1917', 18, 0, 14);
  fx.spawnExplosion({ x: cx, y: cy }, '#F97316', 24, c.dir * 4, 22);
  // Bits of it everywhere: panels in its color, glass, the wheels
  for (let i = 0; i < 34; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * CAR_W, y: cy }, vel: { x: c.dir * 3 + (Math.random() - 0.5) * 16, y: -4 - Math.random() * 11 }, life: 50 + Math.random() * 40, color: i % 4 === 0 ? '#9CA3AF' : i % 4 === 1 ? '#BFDBFE' : c.color, size: 4 + Math.random() * 7 });
  for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: cx + (i - 1.5) * 24, y: cy + 10 }, vel: { x: c.dir * 2 + (i - 1.5) * 3, y: -7 - Math.random() * 6 }, life: 80, color: '#111827', size: 12 });
  // ...and it's gone
  c.state = 'falling'; c.y = GROUND_Y + 10000; c.vy = 0;
};

/** Whatever's in the way of it: him (unless he's up on the roof: it goes up, hitting him), and anything of Ernie's in the road.
 * True if that was the end of it. */
const hitThings = (ctx: FrameContext, c: Car): boolean => {
  const { state, fx } = ctx;
  const p = state.player;
  const body = { x: c.x, y: c.y - CAR_H, w: CAR_W, h: CAR_H };
  // Hit him (unless he's up on the roof)
  const pb = boundsOf(p);
  const onTop = p.pos.y + p.height <= c.roof.y + 6 && p.vel.y >= -0.5;
  if (!onTop && rectsOverlap(body, pb) && p.invincibilityTimer <= 0 && state.deathTimer <= 0 && !p.inCutscene) {
    hurtPlayer(ctx, CAR_DAMAGE, 'traffic', { x: c.dir * CAR_FLING_X, y: CAR_FLING_Y });
    fx.spawnDamageNumber({ x: p.pos.x - 30, y: p.pos.y - 40 }, ['HIT AND RUN!', 'ROADKILL!', 'JAYWALKER!'][Math.floor(Math.random() * 3)], true, '#F97316');
    playSound('horn');
    explode(ctx, c);
    return true;
  }
  // Anything of Ernie's in the road
  for (const e of state.enemies) {
    if (e.type === 'boss' || e.health <= 0 || e.isBlownAway || e.kind === 'drone' || e.kind === 'seagull') continue;
    if (!rectsOverlap(body, boundsOf(e))) continue;
    e.health = 0;
    e.isBlownAway = true;
    e.vel = { x: c.dir * 16, y: -10 };
    fx.spawnDeathShower(e.pos, c.dir, 1.8);
    fx.spawnKillCallout(e, 'flattened');
    fx.spawnPickup(e.pos);
  }
  return false;
};

/** The honking ones not in view yet (for the warning at the edge of the screen). */
export const carsComing = (tr: Traffic) => tr.cars.filter(c => c.state === 'coming');
