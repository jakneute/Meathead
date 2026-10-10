// The rides hit the staff and the wildlife too, the same as him: whatever's in the way of a coffin cup, a carousel bat,
// the ghost train, the drop tower's ring coming down, the pony's back hooves or a rolling jack-o'-lantern gets it.
// Small things die outright; people are knocked flying (and done in, if it's enough), with a callout, gore and a
// flinging. Bosses and mid-bosses are left out.
//
// Nobody walks into one of their own accord (townDanger: the AIs check it); knocked or thrown in, that's another thing.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { isMidBoss } from '../../../m1/game/combat/midBoss';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { GY } from '../geometry';
import { X, Y, CUPS, CAROUSEL, TRAIN, DROP, PONY, MOAT } from './layout';

/** Where the rides are dangerous to stand (their footprints, low enough to hit a man): the AIs keep out. */
const ZONES: { x0: number; x1: number; y0: number; y1: number }[] = [
  { x0: X(CUPS.x) - CUPS.r - 50, x1: X(CUPS.x) + CUPS.r + 50, y0: Y(CUPS.cupH + 10), y1: GY },
  { x0: X(CAROUSEL.x) - CAROUSEL.r - 30, x1: X(CAROUSEL.x) + CAROUSEL.r + 30, y0: Y(130), y1: GY },
  { x0: X(TRAIN.a) - 10, x1: X(TRAIN.a) + TRAIN.len + 10, y0: Y(50), y1: GY },
  { x0: X(MOAT.a), x1: X(MOAT.b), y0: Y(50), y1: GY + 40 },
  { x0: X(TRAIN.b) - 10, x1: X(TRAIN.b) + TRAIN.len + 10, y0: Y(50), y1: GY },
  { x0: X(DROP.x) - DROP.w / 2 - 6, x1: X(DROP.x) + DROP.w / 2 + 6, y0: Y(DROP.hi + 16), y1: GY },
  { x0: X(PONY.x) - 95, x1: X(PONY.x) - 35, y0: Y(60), y1: GY },
];
/** Would it be in a ride's way at x (its left edge)? */
export const townDanger = (e: Enemy, x: number) => ZONES.some(z => x + e.width > z.x0 && x < z.x1 && e.pos.y < z.y1 && e.pos.y + e.height > z.y0);

/** Who the rides can hit: the living, not bosses, not in mid-flight already. */
export const rideVictims = (state: GameState) => state.enemies.filter(e => e.health > 0 && !e.isBlownAway && e.type !== 'boss' && !e.innocent && !isMidBoss(e));
/** Its box against a box. */
export const eIn = (e: Enemy, x: number, y: number, w: number, h: number) => e.pos.x + e.width > x && e.pos.x < x + w && e.pos.y + e.height > y + 4 && e.pos.y < y + h;

/** (each one gets hit once per pass, not every frame it's touching) */
const lastHit = new WeakMap<Enemy, number>();

/**
 * A ride hits one: `dmg` off (a small thing, under `critter` mass, just dies), knocked away from `fromX` (the lighter,
 * the further), the callout over it; done in, it's flung, with the gore, and the kill's his to enjoy.
 */
export const rideHit = (ctx: FrameContext, e: Enemy, dmg: number, fromX: number, call: string, opts: { kill?: boolean; up?: number } = {}) => {
  const { state, fx } = ctx;
  const last = lastHit.get(e);
  if (last !== undefined && state.frame - last < 30) return;
  lastHit.set(e, state.frame);
  const dir = e.pos.x + e.width / 2 < fromX ? -1 : 1;
  const mass = Math.max(4, (e.width * e.height) / 12);
  const small = e.width * e.height < 900;
  e.health -= opts.kill || small ? e.health : dmg;
  e.hitFlash = 10;
  fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 30 }, call, true, '#FDE047');
  if (e.health <= 0) {
    e.health = 0;
    fx.blowAwayEnemy(e, { x: dir * 11, y: -(opts.up ?? 10) }, 'charge_kill', dir, 1.6);
    playSound('crunch', 0.9, -3);
    shakeScreen(state, 6, 3);
    state.player.killSatisfactionTimer = 60;
    if (import.meta.env.DEV) (state as unknown as { townKill?: string }).townKill = `${call} ${state.frame}`;
    return;
  }
  // (knocked flying: further the lighter it is; dazed a moment)
  const k = Math.min(13, 1500 / mass);
  e.vel.x = dir * k; e.vel.y = -(opts.up ?? 6);
  e.pauseTimer = Math.max(e.pauseTimer ?? 0, 30);
  playSound('thud', 0.8, -2);
};
