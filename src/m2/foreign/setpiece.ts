// The bits the pavilions' job-4b set pieces share (the cliff divers, the toll bridge, the keg ramp, the oven tunnel,
// the bullet train, the stampede, the pyramid's fountains, the clock tower, the thin ice...): a hazard's box hurting
// him and the cast (hazards hurt enemies too), a prop's shout (a diver, a conductor, a ref: a cast voice, one voice at
// a time, never over the PA or a bark), placed pickups (lean: a couple per stretch).

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { hurtPlayer } from '../../m1/game/bosses/shared';
import { pickLine } from '../../m1/game/platform/speech';
import { hazardVictims, hazardHit, boxHits } from '../hazardHit';
import { speak, saidOver, type Said } from './section';
import { streetsOf } from './state';

type Ctx = CanvasRenderingContext2D;

/** Him in the box (and hurtable): hurt by `src`, knocked. True if he was hit. */
export const hurtIn = (ctx: FrameContext, x: number, y: number, w: number, h: number, dmg: number, src: string, knock = { x: 0, y: -6 }, frames = 22) => {
  const p = ctx.state.player;
  if (p.health <= 0 || p.invincibilityTimer > 0 || p.inCutscene || p.carried) return false;
  if (p.pos.x >= x + w || p.pos.x + p.width <= x || p.pos.y >= y + h || p.pos.y + p.height <= y) return false;
  hurtPlayer(ctx, dmg, src, knock, frames);
  return true;
};

/** The cast in the box (each once while `hit` holds them): hurt, or done in, by the hazard (a callout over them). */
export const hitCastIn = (ctx: FrameContext, x: number, y: number, w: number, h: number, dmg: number, fromX: number, call: string, color: string, hit?: Set<object>, kill = false) => {
  for (const e of hazardVictims(ctx.state)) {
    if (hit?.has(e) || !boxHits(e, x, y, w, h)) continue;
    hit?.add(e);
    hazardHit(ctx, e, dmg, fromX, call, { color, kill });
  }
};

/** Him in the box (no hurt: just where he is)? */
export const playerIn = (state: GameState, x: number, y: number, w: number, h: number) => {
  const p = state.player;
  return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y;
};

/** A prop's shout, over it (kept in the section's own state: it outlives nothing, like a bark). */
export interface Shout { said: Said | null; x: number; y: number }
export const newShout = (): Shout => ({ said: null, x: 0, y: 0 });
/** Says one of `pool` in `voice` over (x, y): rare (the barks' spacing), never over the PA, a bark or itself. */
export const shout = (state: GameState, sh: Shout, voice: string, pool: string[], x: number, y: number, chance = 1) => {
  const o = streetsOf(state);
  if (sh.said || o.pa || o.paBusy || state.frame - o.barkAt < 200 || Math.random() > chance) return;
  o.barkAt = state.frame; sh.x = x; sh.y = y;
  speak(voice, pickLine(pool), s => { sh.said = s; }, false);
};
export const drawShout = (c: Ctx, sh: Shout) => { if (sh.said) saidOver(c, sh.said.text, sh.x, sh.y, '#BFDBFE', 220); };

/** Placed pickups (lean: a small health or a small ammo up a climb). */
export const placePickups = (state: GameState, key: string, X: (rx: number) => number, Y: (h: number) => number, list: [number, number, 'small_health' | 'small_ammo'][]) => {
  for (const [rx, h, type] of list) state.pickups.push({ id: `${key}-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
};
