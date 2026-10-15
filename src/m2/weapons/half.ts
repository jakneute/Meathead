// HALF MEASURES: the special weapons' specials on a mid-boss that's opted in (M2Kind's `specialsHalf`: the Ensemble
// Cast, people in costumes, not real bosses). Every other boss and mid-boss keeps the rule (no instant kills, no status
// effects: just the mid-boss hit). An opted-in one gets the specials, at about half: a status at half its length or
// strength, an instant kill a heavy hit instead (HEAVY of its real health), and it's never gibbed (its own fight lays
// the body down). The two exceptions the user asked for: the flintlock's headshot takes the head off (one a shot), and
// the soul sucker pulls one in (one at a time).
// Its own fight hooks in (setHalfHooks): its real health (the engine's may be a stand-in), and how one dies of a
// headshot or of going into the soul sucker.

import type { Enemy } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import { isMidBoss } from '../../m1/game/combat/midBoss';

const KINDS = new Set<string>();
export interface HalfHooks {
  /** Its real most health (the engine's may be a stand-in that never runs out). */
  max?: (e: Enemy) => number;
  /** Dead of a special: 'headless' (the flintlock), 'gone' (into the soul sucker: no body left). */
  kill?: (ctx: FrameContext, e: Enemy, how: 'headless' | 'gone') => void;
}
const HOOKS = new Map<string, HalfHooks>();

export const registerHalfKind = (kind: string) => { KINDS.add(kind); };
export const setHalfHooks = (kind: string, h: HalfHooks) => { HOOKS.set(kind, h); };

/** Opted in: the specials work on it, at half. */
export const specialsHalf = (e: Enemy) => !!e.kind && KINDS.has(e.kind);
/** The specials kept off it: a boss's or a mid-boss's rule (one that isn't opted in). */
export const specialsOff = (e: Enemy) => isMidBoss(e) && !specialsHalf(e);
/** A status's length or strength on an opted-in one. */
export const HALF = 0.5;
/** What an instant kill does to an opted-in one instead: this share of its real health. */
export const HEAVY = 0.5;

export const realMax = (e: Enemy) => (e.kind ? HOOKS.get(e.kind)?.max?.(e) : undefined) ?? e.maxHealth;
/** An instant kill, made a heavy hit. */
export const heavyHit = (e: Enemy) => Math.round(realMax(e) * HEAVY);
/** Dead of a special its own fight has a death for (otherwise just its health run out). */
export const halfKill = (ctx: FrameContext, e: Enemy, how: 'headless' | 'gone') => {
  const k = e.kind ? HOOKS.get(e.kind)?.kill : undefined;
  if (k) k(ctx, e, how); else e.health = 0;
};
