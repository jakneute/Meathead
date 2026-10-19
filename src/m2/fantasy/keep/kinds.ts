// The castle's new cast (Meathead 2's own kinds, registered when Fairy Land is loaded): the Great Pixie's household,
// cast members in costume (men and women, every skin, build and hair, seeded per enemy), each with its tell before it
// hits. The town square's and the glen's turn up here too (knights, princesses, clerks, owls, a unicorn).
//
//   guard     a castle guard: a pink-and-gold tabard over mail, a kettle helmet, a HALBERD (POINTY: shoulder charging
//             into its spike hurts him): keeps a halberd's length off; the halberd lowered level, a stamp and a HALT
//             (the tell), then a lunge; winded after (his window). Jumped over: the halberd up over his head and
//             chopped up at him
//   jester    a court jester in motley, a belled hat, juggling three pins all the time: keeps back; the juggle speeds up,
//             a HEY NONNY (the tell), then all three pins thrown in a spread at him; up close, a bonk with the pig's
//             bladder on a stick and a cartwheel away
//   courtier  a lady-in-waiting (the costume department's only got the gown and the cone hat: men wear it too), a
//             folding fan: keeps back; fans herself hard (the tell), then throws the fan, flat, out and back to her hand
//             like a boomerang (it hits on the way back too); she can't throw again till it's back; up close, a slap
//
// What they throw: hazards.ts. Their drawings: kindArt.ts.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { registerM2Kind, registerHurtLines, registerKindCallouts } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { speak, byPants } from '../section';
import type { ByPants } from '../talk';
import { keepOf, type KThrow } from './state';
import { HURT, KILL_CALLS, KEEP_VOICES, GUARD_BARK, JESTER_BARK, COURTIER_BARK } from './lines';
import { drawGuard, drawJester, drawCourtier } from './kindArt';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);
for (const [kind, calls] of Object.entries(KILL_CALLS)) registerKindCallouts(kind, calls);

const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return state.player.health > 0 && !state.player.inCutscene && !holdingOff(state) && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};
/** Who's in there: the same person every time (where they were put down). */
export const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
const isWoman = (e: Enemy) => lookOf(seedOf(e)).woman;
const gender = (e: Enemy) => (isWoman(e) ? 'f' : 'm') as 'm' | 'f';
const voice = (e: Enemy, m: string, f: string) => (isWoman(e) ? f : m);

const walkTo = (ctx: FrameContext, e: Enemy, x: number, speed: number, stop = 50) => {
  const d = x - mid(e).x;
  e.facing = (d < 0 ? -1 : 1);
  if (Math.abs(d) < stop || !safeAhead(ctx, e, e.facing, 12)) { e.vel.x = 0; return; }
  e.vel.x = e.facing * speed;
};
const backOff = (ctx: FrameContext, e: Enemy, x: number, speed: number) => {
  const away = (x < mid(e).x ? 1 : -1);
  e.facing = -away as 1 | -1;
  e.vel.x = safeAhead(ctx, e, away, 12) ? away * speed : 0;
};
const keepAt = (ctx: FrameContext, e: Enemy, near: number, far: number, speed: number) => {
  const pm = mid(ctx.state.player), dx = Math.abs(pm.x - mid(e).x);
  if (dx > far) walkTo(ctx, e, pm.x, speed, far - 20);
  else if (dx < near) backOff(ctx, e, pm.x, speed * 0.8);
  else e.vel.x = 0;
  e.facing = dirTo(e, pm.x);
};
/** A hit in a box off its front (`up`: raised that far off its feet): the damage, its source, a knock. */
const strike = (ctx: FrameContext, e: Enemy, reach: number, dmg: number, source: string, knock = 6, lift = 0, kickUp = -4) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0 || p.inCutscene) return false;
  const x = e.facing! > 0 ? e.pos.x + e.width - 10 : e.pos.x - reach + 10;
  const top = e.pos.y - lift, bot = e.pos.y + e.height - lift;
  if (p.pos.x < x + reach && p.pos.x + p.width > x && p.pos.y < bot && p.pos.y + p.height > top + 6) {
    hurtPlayer(ctx, dmg, source, { x: (mid(p).x < mid(e).x ? -1 : 1) * knock, y: kickUp });
    return true;
  }
  return false;
};
const level = (state: GameState, e: Enemy, dy = 60) => Math.abs((state.player.pos.y + state.player.height) - (e.pos.y + e.height)) < dy;

/** A bark over its head (rare, one at a time). */
const bark = (state: GameState, e: Enemy, vo: string, pool: ByPants, chance = 0.4) => {
  const k = keepOf(state);
  if (state.frame - k.barkAt < 240 || Math.random() > chance) return;
  k.barkAt = state.frame;
  speak(vo, pickLine(byPants(state, pool)), s => { if (s) k.barks.set(e, s); else k.barks.delete(e); }, false);
};
const spotted = (state: GameState, e: Enemy, vo: string, pool: ByPants, chance = 0.45) => {
  const k = e as { spotted?: boolean };
  if (k.spotted) return;
  k.spotted = true;
  bark(state, e, vo, pool, chance);
};
const push = (state: GameState, t: Omit<KThrow, 't'>) => keepOf(state).throws.push({ ...t, t: 0 });

// ---------------------------------------------------------------------------------------------------------------
// The guard

const guard = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, pm = mid(p);
  tick(e);
  const vo = voice(e, KEEP_VOICES.guard, KEEP_VOICES.guardf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 600, 260) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, GUARD_BARK, 0.5); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      // (jumped over him: the halberd up and chopped at him)
      if (dx < 70 && p.pos.y + p.height < e.pos.y + 16 && p.pos.y + p.height > e.pos.y - 130) { setState(e, 'chopWind'); e.vel.x = 0; playSound('clink', 0.4, 4); break; }
      keepAt(ctx, e, 70, 130, 1.5);
      if (e.aiTimer! > 30 && dx < 150 && level(state, e)) { setState(e, 'level'); e.vel.x = 0; playSound('stomp', 0.5, -4); if (Math.random() < 0.3) bark(state, e, vo, GUARD_BARK, 1); }
      break;
    }
    case 'level':
      // (the halberd lowered level at him, a stamp: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 30) { setState(e, 'thrust'); playSound('whoosh', 0.6, 2); }
      break;
    case 'thrust':
      e.vel.x = safeAhead(ctx, e, e.facing!, 14) ? e.facing! * 4.5 : 0;
      if (strike(ctx, e, 74, 13, 'm2:fa_guard', 8)) { playSound('gunhit', 0.7, -2); setState(e, 'recover'); e.vel.x = 0; break; }
      if (e.aiTimer! > 12) { setState(e, 'recover'); e.vel.x = 0; }
      break;
    case 'recover':
      // (the halberd's head on the floor, getting it back up: his window)
      e.vel.x *= 0.7;
      if (e.aiTimer! > 40) setState(e, 'near');
      break;
    case 'chopWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 16) {
        if (strike(ctx, e, 60, 12, 'm2:fa_guard', 6, 70, -6)) playSound('gunhit', 0.7, 0); else playSound('whoosh', 0.5, 6);
        setState(e, 'recover');
      }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The jester

const jester = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, pm = mid(p);
  tick(e);
  const vo = voice(e, KEEP_VOICES.jester, KEEP_VOICES.jesterf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 620, 360) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, JESTER_BARK, 0.5); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      if (dx < 58 && level(state, e)) { setState(e, 'bonkWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 170, 340, 1.6);
      if (e.aiTimer! > 70 && dx < 460) { setState(e, 'juggle'); e.vel.x = 0; playSound('whirl', 0.4, 8); bark(state, e, vo, JESTER_BARK, 0.35); }
      break;
    }
    case 'juggle':
      // (faster and faster, the pins going higher: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 34) {
        // (all three thrown in a spread: short, at him, long)
        const hx = mid(e).x + e.facing! * 12, hy = e.pos.y + 10;
        [-50, 0, 50].forEach((off, i) => {
          const t = 26 + i * 6, g = 0.3, tx = pm.x + off * e.facing! + p.vel.x * t * 0.3, ty = p.pos.y + p.height * 0.5;
          push(state, { kind: 'pin', x: hx, y: hy - i * 4, vx: (tx - hx) / t, vy: (ty - hy - 0.5 * g * t * t) / t, from: e, dir: e.facing! });
        });
        playSound('whoosh', 0.6, 8);
        setState(e, 'after');
      }
      break;
    case 'after':
      e.vel.x = 0;
      if (e.aiTimer! > 46) setState(e, 'near');
      break;
    case 'bonkWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 12) { if (strike(ctx, e, 46, 9, 'm2:fa_jester', 9, 0, -5)) playSound('bonk', 0.8, 0); else playSound('whoosh', 0.4, 10); setState(e, 'flip'); }
      break;
    case 'flip':
      // (a cartwheel away)
      e.vel.x = safeAhead(ctx, e, -e.facing! as 1 | -1, 14) ? -e.facing! * 4 : 0;
      if (e.aiTimer! > 26) { e.vel.x = 0; setState(e, 'near'); }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The lady-in-waiting

type Courtier = Enemy & { fanOut?: boolean };
const courtier = (ctx: FrameContext, e: Courtier) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, KEEP_VOICES.courtier, KEEP_VOICES.courtierf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 600, 280) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, COURTIER_BARK, 0.5); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      if (dx < 52 && level(state, e)) { setState(e, 'slapWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 190, 360, 1.3);
      if (!e.fanOut && e.aiTimer! > 60 && dx < 440 && level(state, e, 120)) { setState(e, 'flutter'); e.vel.x = 0; playSound('whirl', 0.35, 14); bark(state, e, vo, COURTIER_BARK, 0.35); }
      break;
    }
    case 'flutter':
      // (fanning herself hard: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 30) {
        const hx = mid(e).x + e.facing! * 16, hy = e.pos.y + 30;
        const ty = state.player.pos.y + state.player.height * 0.45;
        push(state, { kind: 'fan', x: hx, y: hy, vx: e.facing! * 7.2, vy: Math.max(-1.2, Math.min(1.2, (ty - hy) / 40)), from: e, dir: e.facing! });
        e.fanOut = true;
        playSound('whoosh', 0.6, 10);
        setState(e, 'wait');
      }
      break;
    case 'wait':
      // (her hand out for it coming back)
      e.vel.x = 0;
      if (!e.fanOut || e.aiTimer! > 160) { e.fanOut = false; setState(e, 'near'); }
      break;
    case 'slapWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { if (strike(ctx, e, 44, 8, 'm2:fa_courtier', 7)) playSound('clap', 0.8, 4); setState(e, 'after'); }
      break;
    case 'after':
      if (e.aiTimer! > 30) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------

/** Out of aggro range: this far off, anybody after him gives up and goes back to standing about. */
const LEASH_X = 820, LEASH_Y = 460;
const leashed = (ai: (ctx: FrameContext, e: Enemy) => boolean) => (ctx: FrameContext, e: Enemy) => {
  if (e.aiState && e.aiState !== 'idle') {
    const p = mid(ctx.state.player), m = mid(e);
    if (Math.abs(p.x - m.x) > LEASH_X || Math.abs(p.y - m.y) > LEASH_Y) { if (e.aiState !== 'wait') setState(e, 'idle'); e.vel.x = 0; }
  }
  return ai(ctx, e);
};
type Reg = Parameters<typeof registerM2Kind>[0];
const person = (kind: `m2:fa_${string}`, stats: Reg['stats'], ai: (ctx: FrameContext, e: Enemy) => boolean, draw: (c: CanvasRenderingContext2D, e: Enemy, f: number, seed: number) => void, extra: Partial<Reg> = {}) =>
  registerM2Kind({ kind, stats, humanoid: true, gender, head: { x: 1, y: -66, r: 10 }, ai: leashed(ai), draw: (c, e, f) => draw(c, e, f, seedOf(e)), ...extra });

person('m2:fa_guard', { w: 38, h: 76, hp: 130, contact: 4, mass: 220 }, guard, drawGuard, { pointy: { source: 'm2:fa_halberd', label: 'SKEWERED!', damage: 16 } });
person('m2:fa_jester', { w: 36, h: 70, hp: 90, contact: 4, mass: 150 }, jester, drawJester);
person('m2:fa_courtier', { w: 36, h: 74, hp: 90, contact: 3, mass: 140 }, courtier, drawCourtier);
