// Traffic on the bridge: people trying to get off it, in your lane, and not
// stopping for anyone. A horn and headlights at the edge of the screen first
// (most come up from behind you; now and then one comes the wrong way), then a
// minivan doing sixty. Get hit and you're flung down the road (maybe into a
// gap). Jump on the roof and it'll carry you. A hole in the deck doesn't stop
// it: it launches off the lip and comes flying over after you, lands in a
// ball of fire and goes tumbling down the road, burning (or, short of the far
// side, down the hole). Anything of Ernie's in the road is roadkill.

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
   * over it after you), crashed (landed in a fireball, tumbling down the road, then a burning wreck), or going down a gap.
   */
  state: 'coming' | 'driving' | 'launched' | 'crashed' | 'falling';
  t: number;
  /** You can stand on the roof. */
  roof: Block;
}
export interface Traffic { cars: Car[]; timer: number }

export const CAR_W = 100, CAR_H = 46;
/** How long the horn and headlights warn you before it's in view. */
export const CAR_WARN = 75;
const CAR_DAMAGE = 14, CAR_FLING_X = 11, CAR_FLING_Y = -9;
const COLORS = ['#2563EB', '#DC2626', '#F8FAFC', '#16A34A', '#FACC15', '#9333EA', '#F97316', '#0EA5E9'];

export const createTraffic = (): Traffic => ({ cars: [], timer: 360 });

/** Where the cars run: the bridge from a little way out to a little way short of the far end. */
const inTraffic = (x: number) => x > COURSE.bridge.x1 + 150 && x < COURSE.bridge.exit - 250;

export const updateTraffic = (ctx: FrameContext, tr: Traffic) => {
  const { state } = ctx;
  const p = state.player;
  const px = p.pos.x + p.width / 2;
  if (inTraffic(px) && tr.cars.length === 0 && --tr.timer <= 0) {
    tr.timer = 480 + Math.floor(Math.random() * 240);
    const dir: 1 | -1 = Math.random() < 0.72 ? 1 : -1;
    const x = dir > 0 ? state.camera.x - CAR_W - 30 : state.camera.x + CANVAS_WIDTH + 30;
    const roof: Block = { x, y: GROUND_Y - CAR_H, w: CAR_W, h: 10, type: 'platform', hidden: true, oneWay: true, tag: 'car-roof' };
    tr.cars.push({ x, y: GROUND_Y, dir, speed: 7 + Math.random(), vy: 0, rot: 0, color: COLORS[Math.floor(Math.random() * COLORS.length)], state: 'coming', t: 0, roof });
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
    else if (c.state === 'crashed') tumbling(ctx, c);
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
  // Nose out over a gap in the deck: it doesn't stop, it launches off the lip and comes flying over after you
  const front = c.dir > 0 ? c.x + CAR_W - 18 : c.x + 18;
  if (floorTopAt(deck(state), front, c.y, 4) === null) {
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
  if (top !== null && c.y >= top) { c.y = top; crash(ctx, c); return; }
  if (c.y > GROUND_Y + 20) { c.state = 'falling'; state.blocks = state.blocks.filter(b => b !== c.roof); }
};

/** Comes down in a ball of fire: whoever's on the roof is thrown off, and it goes tumbling on down the road. */
const crash = (ctx: FrameContext, c: Car) => {
  const { state, fx } = ctx;
  const p = state.player;
  c.state = 'crashed'; c.t = 0; c.vy = 0;
  const onRoof = p.pos.x + p.width > c.x && p.pos.x < c.x + CAR_W && Math.abs(p.pos.y + p.height - c.roof.y) < 12;
  state.blocks = state.blocks.filter(b => b !== c.roof);
  if (onRoof) { p.vel.y = -12; p.vel.x = c.dir * 6; p.isGrounded = false; }
  const cx = c.x + CAR_W / 2, cy = c.y - CAR_H / 2;
  playSound('boom'); playSound('crash');
  shakeScreen(state, 25, 9);
  fx.spawnExplosion({ x: cx, y: cy }, '#F97316', 30, 0, 18);
  fx.spawnExplosion({ x: cx, y: cy }, '#FDE047', 18, 0, 12);
  fx.spawnExplosion({ x: cx, y: cy }, '#1C1917', 18, 0, 14);
  for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: cx, y: cy }, vel: { x: (Math.random() - 0.5) * 12, y: -3 - Math.random() * 8 }, life: 40 + Math.random() * 30, color: i % 3 ? c.color : '#9CA3AF', size: 3 + Math.random() * 5 });
};

/** Rolling over and over on down the road on fire, slowing, then a burning wreck (or over the edge of the next gap). */
const tumbling = (ctx: FrameContext, c: Car) => {
  const { state } = ctx;
  c.speed *= 0.95;
  c.x += c.dir * c.speed;
  c.rot += c.dir * c.speed * 0.02;
  if (c.speed > 1.5) hitThings(ctx, c);
  if (state.frame % 3 === 0) state.particles.push({ pos: { x: c.x + CAR_W * Math.random(), y: c.y - CAR_H * Math.random() }, vel: { x: (Math.random() - 0.5), y: -1.5 - Math.random() * 2 }, life: 30, color: Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 4 + Math.random() * 5 });
  if (state.frame % 5 === 0) state.particles.push({ pos: { x: c.x + CAR_W / 2, y: c.y - CAR_H }, vel: { x: (Math.random() - 0.5) * 0.6, y: -1 - Math.random() }, life: 60, color: 'rgba(40, 36, 34, 0.6)', size: 8 + Math.random() * 8 });
  // (tumbling on over the lip of another gap: down it goes)
  if (floorTopAt(deck(state), c.x + CAR_W / 2, c.y, 4) === null) { c.state = 'falling'; c.vy = 0; }
};

/** Whatever's in the way of it: him (unless he's up on the roof), and anything of Ernie's in the road. */
const hitThings = (ctx: FrameContext, c: Car) => {
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
};

/** The honking ones not in view yet (for the warning at the edge of the screen). */
export const carsComing = (tr: Traffic) => tr.cars.filter(c => c.state === 'coming');
