// The stage's hazards hurt everybody, not just Meathead (the user: "same for any stage hazards really"). Shared by
// every section: who a hazard can hit (not the bosses, not the mid-bosses), the kill (flung, the gore, or the scrap:
// machines turn their own blood to scrap, see machineGore; a callout over it), the hit that isn't a kill (a big one
// knocked back, a chunk off), and the danger zones: where a hazard is (or is about to be) dangerous. Nobody walks into
// one on their own or starts out in one (the M2 kinds' AIs are checked against them: kinds.ts); knocked or thrown in,
// that's another matter.

import type { FrameContext } from '../m1/game/core/context';
import type { GameState } from '../m1/game/core/state';
import type { Enemy } from '../m1/types';
import { playSound } from '../m1/game/platform/audio';
import { isMidBoss } from '../m1/game/combat/midBoss';
import { getEnemyMass, pushEnemy } from '../m1/game/combat/knockback';

type SoundType = Parameters<typeof playSound>[0];

/** A hazard's box (world). `ground`: only a danger to what walks (a pit, lava: what flies goes over it). */
export interface Zone { x0: number; x1: number; y0: number; y1: number; ground?: boolean }

// ---------------------------------------------------------------------------------------------------------------
// Danger zones: each hazard's owner sets its own every frame it runs (gone a few frames after it stops: out of range)

const zones = new Map<string, { at: number; list: Zone[] }>();
/** This frame's danger zones for `owner` (replacing the last lot). */
export const setHazardZones = (state: GameState, owner: string, list: Zone[]) => { zones.set(owner, { at: state.frame, list }); };
/** Kinds an owner's zones don't keep out (it's theirs: the queen's kin walk through her pool). */
const exempt = new Map<string, Set<string>>();
export const exemptFromZones = (kind: string, owner: string) => { (exempt.get(kind) ?? exempt.set(kind, new Set()).get(kind)!).add(owner); };
const live = (state: GameState, e?: Enemy) => {
  const out: Zone[] = [];
  const flies = e?.enemyType === 'flyer';
  const free = e?.kind ? exempt.get(e.kind) : undefined;
  for (const [owner, z] of zones) if (Math.abs(state.frame - z.at) <= 3 && !free?.has(owner)) for (const q of z.list) if (!(flies && q.ground)) out.push(q);
  return out;
};
/** Every live zone (dev: the spawn check). */
export const hazardZones = (state: GameState) => live(state);
const overlaps = (z: Zone, x: number, y: number, w: number, h: number) => x + w > z.x0 && x < z.x1 && y + h > z.y0 && y < z.y1;
/** Would `e` at (x, y) be in a hazard's way? */
export const inHazard = (state: GameState, e: Enemy, x = e.pos.x, y = e.pos.y) => live(state, e).some(z => overlaps(z, x, y, e.width, e.height));

/**
 * Around each M2 kind's own AI (kinds.ts). Not on the screen yet and in a hazard's way (where it was put, or where it
 * came out): moved out of it, to the nearer side. After its AI: a step that would take it into one is cancelled, and
 * one that's in one (it got up in there) walks out. Only what it does itself: knocked back, flung or thrown, its AI
 * isn't running (the engine's knockback is), so in it goes.
 */
export const beforeAI = (state: GameState, e: Enemy) => {
  if (e.seen) return;
  const z = live(state, e).find(q => overlaps(q, e.pos.x, e.pos.y, e.width, e.height));
  if (!z) return;
  const cx = e.pos.x + e.width / 2;
  e.pos.x = cx - z.x0 < z.x1 - cx ? z.x0 - e.width - 4 : z.x1 + 4;
  if (e.homeX !== undefined) e.homeX = e.pos.x;
  if (import.meta.env?.DEV) console.warn(`[hazards] ${e.kind} started in a hazard's way: moved to ${Math.round(e.pos.x)}`);
};
export const afterAI = (state: GameState, e: Enemy, beforeX: number, beforeY: number, movedItself: boolean) => {
  if (e.health <= 0 || e.isBlownAway || e.type === 'boss') return;
  const zs = live(state, e);
  if (!zs.length) return;
  const inAt = (x: number, y: number) => zs.some(z => overlaps(z, x, y, e.width, e.height));
  const z = zs.find(q => overlaps(q, e.pos.x, e.pos.y, e.width, e.height));
  if (movedItself) {
    // (it moved itself: back where it was, if that step took it in; in one already (it came to it), edging out of it,
    // the nearest way: what flies, up or down too)
    if (z && inAt(beforeX, beforeY)) {
      const out = [[z.x0 - e.width - e.pos.x, 0], [z.x1 - e.pos.x, 0], ...(e.enemyType === 'flyer' ? [[0, z.y0 - e.height - e.pos.y], [0, z.y1 - e.pos.y]] : [])]
        .sort((a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]))[0];
      e.pos.x += Math.sign(out[0]) * 3; e.pos.y += Math.sign(out[1]) * 3;
    } else if (z) { e.pos.x = beforeX; e.pos.y = beforeY; e.vel.x = 0; }
    return;
  }
  if (z) {
    // (in one: out of it, the nearer way)
    const cx = e.pos.x + e.width / 2;
    e.vel.x = cx - z.x0 < z.x1 - cx ? -2.5 : 2.5;
    return;
  }
  // (the engine moves it by its velocity: a few strides ahead, would that be in one? stop short)
  if (!e.vel.x) return;
  const ahead = e.pos.x + e.vel.x * 6 + Math.sign(e.vel.x) * 4;
  if (inAt(ahead, e.pos.y)) e.vel.x = 0;
};

// ---------------------------------------------------------------------------------------------------------------
// Who, and what it does to them

/** Who a hazard can hit: the living, not already flung, been on the screen (see spared()); never a boss or a mid-boss (or an innocent: `innocents`). */
export const hazardVictims = (state: GameState, opts: { innocents?: boolean; flyers?: boolean; not?: (e: Enemy) => boolean } = {}) =>
  state.enemies.filter(e => e.health > 0 && !e.isBlownAway && !!e.seen && e.type !== 'boss' && !isMidBoss(e)
    && (opts.innocents || !e.innocent) && (opts.flyers !== false || e.enemyType !== 'flyer') && !opts.not?.(e));
/** Its box against a rectangle. */
export const boxHits = (e: Enemy, x: number, y: number, w: number, h: number) => e.pos.x < x + w && e.pos.x + e.width > x && e.pos.y < y + h && e.pos.y + e.height > y;
/** A little one (a bat, a frog, a monkey): any hazard's enough to kill it. */
export const isSmall = (e: Enemy) => getEnemyMass(e) <= 40;

/** Done in by a hazard: flung (away from `fromX`), the gore (scrap: machines), the callout, the crunch. */
export const hazardKill = (ctx: FrameContext, e: Enemy, fromX: number, call: string, opts: { color?: string; fling?: { x: number; y: number }; sound?: SoundType } = {}) => {
  const { state, fx } = ctx;
  const away = e.pos.x + e.width / 2 < fromX ? -1 : 1;
  e.health = 0;
  fx.blowAwayEnemy(e, opts.fling ?? { x: away * 10, y: -11 }, 'charge_kill', away, 1.6);
  if (!e.isBlownAway) return;
  fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 30 }, call, true, opts.color ?? '#FCA5A5');
  playSound(opts.sound ?? 'crunch', 0.9, -4);
  state.player.killSatisfactionTimer = 60;
  if (import.meta.env?.DEV) (state as unknown as { hazardKill?: string }).hazardKill = `${call} ${e.kind} ${state.frame}`;
};
/**
 * Hurt by a hazard but maybe not done in: `dmg` off it (a little one: dead outright), knocked away from `fromX` and
 * dazed; done in, as above. Returns whether it died.
 */
export const hazardHit = (ctx: FrameContext, e: Enemy, dmg: number, fromX: number, call: string, opts: { color?: string; knock?: number; kill?: boolean } = {}) => {
  // (small ones go in one; and a crusher (`kill`) kills anybody)
  if (isSmall(e) || opts.kill) dmg = Math.max(dmg, e.health);
  e.health -= dmg; e.hitFlash = 8;
  if (e.health <= 0) { hazardKill(ctx, e, fromX, call, opts); return true; }
  const away = e.pos.x + e.width / 2 < fromX ? -1 : 1;
  pushEnemy(e, away * (opts.knock ?? 9), -6, 24);
  ctx.fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 20 }, Math.round(dmg), false);
  playSound('punch', 0.6, -4);
  return false;
};

// (dev: the spawn check reads the live zones)
if (import.meta.env?.DEV && typeof window !== 'undefined') (window as unknown as { __hazardZones?: unknown }).__hazardZones = hazardZones;
