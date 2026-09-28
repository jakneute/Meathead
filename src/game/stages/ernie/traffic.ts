// Traffic on the bridge: people trying to get off it, in your lane, and not
// stopping for anyone. A horn and headlights at the edge of the screen first
// (most come up from behind you; now and then one comes the wrong way), then a
// minivan doing sixty. Get hit and you're flung down the road (maybe into a
// gap). Jump on the roof and it'll carry you, right up until it drives into a
// hole in the deck. Anything of Ernie's in the road is roadkill.

import type { Block } from '../../../types';
import type { FrameContext } from '../../core/context';
import { hurtPlayer } from '../../bosses/shared';
import { playSound } from '../../platform/audio';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { floorTopAt } from '../../core/terrain';
import { GROUND_Y, CANVAS_WIDTH } from '../../../constants';
import { COURSE } from './course';

export interface Car {
  /** Left end of the body, and where its wheels sit. */
  x: number; y: number;
  dir: 1 | -1;
  speed: number;
  vy: number;
  rot: number;
  color: string;
  /** Coming (only its horn and headlights at the edge of the view yet), driving, or going into a gap. */
  state: 'coming' | 'driving' | 'falling';
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
    else { c.vy += 0.6; c.y += c.vy; c.x += c.dir * c.speed * 0.4; c.rot += c.dir * 0.035; }
    c.roof.x = c.x; c.roof.y = c.y - CAR_H;
  }
  // Gone: off out of view, or down the hole
  tr.cars = tr.cars.filter(c => {
    const gone = (c.state === 'falling' && c.y > GROUND_Y + 700) || (c.state === 'driving' && (c.x > state.camera.x + CANVAS_WIDTH + 400 || c.x < state.camera.x - 400 - CAR_W));
    if (gone) state.blocks = state.blocks.filter(b => b !== c.roof);
    return !gone;
  });
};

const drive = (ctx: FrameContext, c: Car) => {
  const { state, fx } = ctx;
  const p = state.player;
  const dx = c.dir * c.speed;
  // Riding on the roof: it takes you with it
  const riding = p.isGrounded && p.pos.x + p.width > c.x && p.pos.x < c.x + CAR_W && Math.abs(p.pos.y + p.height - c.roof.y) < 3;
  c.x += dx;
  if (riding) p.pos.x += dx;
  // Nose out over a gap in the deck: in it goes
  const front = c.dir > 0 ? c.x + CAR_W - 18 : c.x + 18;
  if (floorTopAt(state.blocks.filter(b => b.tag !== 'car-roof'), front, c.y, 4) === null) {
    c.state = 'falling'; c.t = 0;
    state.blocks = state.blocks.filter(b => b !== c.roof);
    playSound('horn');
    return;
  }
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
