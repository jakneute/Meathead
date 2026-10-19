// The town square's cast (Meathead 2's own kinds, registered when Fairy Land is loaded): the park's cast members in
// costume (men and women, every skin, build and hair, seeded per enemy; the princess and the knight on anybody), who
// break character to yell at him; and one animal, in the air. Each has its tell before it hits:
//
//   clerk     WANDS & SONS' wand clerk: keeps back; the wand up, sparks gathering, the spell shouted (the tell), then a
//             sparkler bolt that arcs down at him; up close, a wand in the eye
//   princess  keeps her distance; a glass slipper wound up over her head (the tell) and lobbed (it smashes); up close, a
//             twirl and a slap
//   knight    foam plate, a foam lance couched out front (POINTY: shoulder charging into it from the front hurts him);
//             the lance lowered and a stamp (the tell), then he charges, and stands there winded after (his window)
//   bro       a broomball fan: whips a hard broomball (a wind-up: the tell) that bounces; up close a chest bump that
//             sends him flying
//   troll     a costumed troll, huge (the horned helmet is SPIKY: dive kicking onto it hurts); the foam club up over his
//             head (the tell), slammed down: a shockwave runs along the ground both ways (jump it); winded after
//   dragon    the dragon mascot (the performer's face in its mouth): rears back, smoke out of its nose (the tell), then
//             a short cone of flame (the pyro rig in the head) for a while; it has to cool down after
//   owl       a trained mail owl off the owl show: circles; a hoot (the tell) and it swoops at his head
//   keg       the butter brew cart's keg (a fixture): hit it and it bursts (hazards.ts)
//
// What they throw: hazards.ts (updateThrows). Their drawings: kindArt.ts.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine } from '../../../m1/game/platform/speech';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { registerM2Kind, registerHurtLines, registerKindCallouts } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { speak, byPants } from '../section';
import type { ByPants } from '../talk';
import { squareOf, type Throw } from './state';
import {
  HURT, KILL_CALLS, CAST_VOICES, CLERK_CAST, CLERK_SEEN, PRINCESS_BARK, KNIGHT_BARK, BRO_BARK, TROLL_BARK, DRAGON_BARK,
} from './lines';
import { drawClerk, drawPrincess, drawKnight, drawBro, drawTroll, drawDragon, drawOwl, drawKeg } from './kindArt';

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
export const isWoman = (e: Enemy) => lookOf(seedOf(e)).woman;
const gender = (e: Enemy) => (isWoman(e) ? 'f' : 'm') as 'm' | 'f';

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
/** Keep `near`..`far` from him (closing in, backing off), facing him. */
const keepAt = (ctx: FrameContext, e: Enemy, near: number, far: number, speed: number) => {
  const pm = mid(ctx.state.player), dx = Math.abs(pm.x - mid(e).x);
  if (dx > far) walkTo(ctx, e, pm.x, speed, far - 20);
  else if (dx < near) backOff(ctx, e, pm.x, speed * 0.8);
  else e.vel.x = 0;
  e.facing = dirTo(e, pm.x);
};
/** A hit in front of it: the damage, its source, a knock. */
const strike = (ctx: FrameContext, e: Enemy, reach: number, dmg: number, source: string, knock = 6, up = -4) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0 || p.inCutscene) return false;
  const x = e.facing! > 0 ? e.pos.x + e.width - 6 : e.pos.x - reach + 6;
  if (p.pos.x < x + reach && p.pos.x + p.width > x && p.pos.y < e.pos.y + e.height && p.pos.y + p.height > e.pos.y + 6) {
    hurtPlayer(ctx, dmg, source, { x: (mid(p).x < mid(e).x ? -1 : 1) * knock, y: up });
    return true;
  }
  return false;
};
const level = (state: GameState, e: Enemy, dy = 60) => Math.abs((state.player.pos.y + state.player.height) - (e.pos.y + e.height)) < dy;

/** A bark over its head (rare, one at a time). */
export const bark = (state: GameState, e: Enemy, voice: string, pool: ByPants, chance = 0.4, force = false) => {
  const sq = squareOf(state);
  if (!force && (state.frame - sq.barkAt < 240 || Math.random() > chance)) return;
  sq.barkAt = state.frame;
  speak(voice, pickLine(byPants(state, pool)), s => { if (s) sq.barks.set(e, s); else sq.barks.delete(e); }, false);
};
/** Its first sight of him: a bark, maybe. */
const spotted = (state: GameState, e: Enemy, voice: string, pool: ByPants, chance = 0.45) => {
  const k = e as { spotted?: boolean };
  if (k.spotted) return;
  k.spotted = true;
  bark(state, e, voice, pool, chance);
};
const voice = (e: Enemy, m: string, f: string) => (isWoman(e) ? f : m);

/** Something thrown (hazards.ts flies it). */
const throwIt = (state: GameState, e: Enemy, kind: Throw['kind'], vx: number, vy: number, dy = 30) => {
  const m = mid(e);
  squareOf(state).throws.push({ kind, x: m.x + (e.facing ?? 1) * 14, y: e.pos.y + dy, vx, vy, t: 0, from: e, bounces: 0 });
};
/** Lobbed from its hand to land on him (in `t` frames, under `g` gravity). */
const lobAt = (state: GameState, e: Enemy, kind: Throw['kind'], t: number, g: number, dy = 14) => {
  const p = state.player, m = mid(e), tx = p.pos.x + p.width / 2 + p.vel.x * t * 0.4, ty = p.pos.y + p.height * 0.5;
  const hx = m.x + (e.facing ?? 1) * 14, hy = e.pos.y + dy;
  throwIt(state, e, kind, (tx - hx) / t, (ty - hy - 0.5 * g * t * t) / t, dy);
};

// ---------------------------------------------------------------------------------------------------------------
// The wand clerk

const clerk = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.clerk, CAST_VOICES.clerkf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 300) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, CLERK_SEEN, 0.4); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 54 && level(state, e)) { setState(e, 'pokeWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 160, 340, 1.3);
      if (e.aiTimer! > 70) { setState(e, 'cast'); e.vel.x = 0; bark(state, e, vo, CLERK_CAST, 0.5); playSound('spell', 0.35, 8); }
      break;
    case 'cast':
      // (the wand up, the sparks gathering at its tip)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 4 === 0) state.particles.push({ pos: { x: mid(e).x + e.facing! * 18, y: e.pos.y + 6 }, vel: { x: (Math.random() - 0.5) * 2, y: -Math.random() * 1.5 }, life: 12, color: Math.random() < 0.5 ? '#FDE047' : '#F0ABFC', size: 2 });
      if (e.aiTimer! > 36) { lobAt(state, e, 'spark', 34, 0.22, 8); playSound('bolt', 0.4, 10); setState(e, 'after'); }
      break;
    case 'after':
      if (e.aiTimer! > 22) setState(e, 'near');
      break;
    case 'pokeWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { playSound('whoosh', 0.5, 8); strike(ctx, e, 42, 9, 'm2:fa_clerk', 5); setState(e, 'poke'); }
      break;
    case 'poke':
      if (e.aiTimer! > 22) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The princess

const princess = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.man, CAST_VOICES.woman);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 520, 220) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, PRINCESS_BARK, 0.45); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 56 && level(state, e)) { setState(e, 'twirl'); e.vel.x = 0; break; }
      keepAt(ctx, e, 130, 270, 1.5);
      if (e.aiTimer! > 80) { setState(e, 'wind'); e.vel.x = 0; }
      break;
    case 'wind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 28) { lobAt(state, e, 'slipper', 34, 0.32, 6); playSound('whoosh', 0.5, 4); setState(e, 'after'); }
      break;
    case 'after':
      if (e.aiTimer! > 20) setState(e, 'near');
      break;
    case 'twirl':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 16) { if (strike(ctx, e, 46, 10, 'm2:fa_princess', 6)) playSound('punch', 0.7, 6); setState(e, 'slap'); }
      break;
    case 'slap':
      if (e.aiTimer! > 24) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The knight

const knight = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.man, CAST_VOICES.woman);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 600, 200) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, KNIGHT_BARK, 0.45); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      if (dx > 300) walkTo(ctx, e, pm.x, 1.3, 280);
      else e.vel.x = 0;
      e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 40 && dx < 340 && level(state, e, 80)) { setState(e, 'lower'); e.vel.x = 0; playSound('clang', 0.4, -6); }
      break;
    }
    case 'lower':
      // (the lance lowered, a stamp of the foot: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! === 18) playSound('stomp', 0.5, -4);
      if (e.aiTimer! > 34) setState(e, 'charge');
      break;
    case 'charge':
      e.vel.x = e.facing! * 5.2;
      if (e.aiTimer! % 8 === 0) playSound('stomp', 0.3, 4);
      if (strike(ctx, e, 30, 14, 'm2:fa_knight', 9, -5)) { setState(e, 'winded'); e.vel.x = 0; break; }
      if (e.aiTimer! > 70 || !safeAhead(ctx, e, e.facing!, 14)) { setState(e, 'winded'); e.vel.x = 0; }
      break;
    case 'winded':
      e.vel.x *= 0.8;
      if (e.aiTimer! > 46) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The broomball bro

const bro = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.bro, CAST_VOICES.brof);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 320) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, BRO_BARK, 0.5); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 58 && level(state, e)) { setState(e, 'bumpWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 140, 300, 1.7);
      if (e.aiTimer! > 60) { setState(e, 'wind'); e.vel.x = 0; }
      break;
    case 'wind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 22) {
        // (whipped at him: fast, a little up, down at him if he's below)
        const dy = pm.y - (e.pos.y + 20), d = Math.max(60, Math.abs(pm.x - mid(e).x));
        throwIt(state, e, 'ball', e.facing! * 8, Math.max(-4, Math.min(5, (dy / d) * 8 - 2)), 20);
        playSound('whoosh', 0.6, 2); setState(e, 'after');
      }
      break;
    case 'after':
      if (e.aiTimer! > 18) setState(e, 'near');
      break;
    case 'bumpWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { if (strike(ctx, e, 44, 10, 'm2:fa_bro', 12, -6)) playSound('thud', 0.8, 0); setState(e, 'bump'); }
      break;
    case 'bump':
      if (e.aiTimer! > 26) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The troll

const troll = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.troll, CAST_VOICES.trollf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 520, 220) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, TROLL_BARK, 0.7); }
      break;
    case 'near':
      walkTo(ctx, e, pm.x, 0.9, 150);
      if (e.aiTimer! > 60 && Math.abs(pm.x - mid(e).x) < 260) { setState(e, 'raise'); e.vel.x = 0; playSound('roar', 0.35, -10); }
      break;
    case 'raise':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 40) {
        // (slammed down: a hit in front, the street shaking, a shockwave running off each way)
        playSound('slam', 1, -10); shakeScreen(state, 9, 4);
        strike(ctx, e, 64, 16, 'm2:fa_troll', 8, -5);
        const m = mid(e), feet = e.pos.y + e.height;
        for (const s of [-1, 1] as const) squareOf(state).throws.push({ kind: 'wave', x: m.x + s * 40, y: feet, vx: s * 5.5, vy: 0, t: 0, from: e, bounces: 0 });
        setState(e, 'winded');
      }
      break;
    case 'winded':
      e.vel.x = 0;
      if (e.aiTimer! > 56) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The dragon mascot

const dragon = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.dragon, CAST_VOICES.dragonf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 220) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, DRAGON_BARK, 0.7); }
      break;
    case 'near':
      walkTo(ctx, e, pm.x, 1.0, 110);
      if (e.aiTimer! > 50 && Math.abs(pm.x - mid(e).x) < 190 && level(state, e, 90)) { setState(e, 'rear'); e.vel.x = 0; }
      break;
    case 'rear':
      // (rearing back, smoke out of its nostrils: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 5 === 0) state.particles.push({ pos: { x: mid(e).x + e.facing! * 26, y: e.pos.y + 14 }, vel: { x: e.facing! * 0.5, y: -0.8 }, life: 24, color: '#A8A29E', size: 4 });
      if (e.aiTimer! > 40) { squareOf(state).throws.push({ kind: 'flame', x: 0, y: 0, vx: 0, vy: 0, t: 0, from: e, bounces: 0 }); playSound('flame', 0.7, -4); setState(e, 'breathe'); }
      break;
    case 'breathe':
      e.vel.x = 0;
      if (e.aiTimer! > 48) setState(e, 'cool');
      break;
    case 'cool':
      e.vel.x = 0;
      if (e.aiTimer! > 54) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The mail owl (circles its spot; a hoot, then a swoop at his head)

const owl = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const hx = e.homeX ?? e.pos.x, hy = e.homeY ?? e.pos.y;
  const m = mid(e), pm = mid(p);
  switch (e.aiState) {
    default: {
      const t = (state.frame + hx) * 0.025;
      const tx = hx + Math.sin(t) * 120, ty = hy + Math.sin(t * 2) * 20;
      e.vel.x = (tx - e.pos.x) * 0.05; e.vel.y = (ty - e.pos.y) * 0.05;
      e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
      if (e.aiTimer! > 90 && sees(state, e, 380, 420)) { setState(e, 'hoot'); playSound('twinkle', 0.3, -14); playSound('beep', 0.25, -20); }
      break;
    }
    case 'hoot':
      // (stops dead in the air, wings up, a hoot: the tell)
      e.vel.x *= 0.8; e.vel.y *= 0.8; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 26) {
        setState(e, 'swoop'); e.aiX = pm.x; e.aiY = pm.y - 10;
        const d = Math.hypot(pm.x - m.x, pm.y - 10 - m.y) || 1;
        e.vel = { x: ((pm.x - m.x) / d) * 6.5, y: ((pm.y - 10 - m.y) / d) * 6.5 };
      }
      break;
    case 'swoop':
      if (Math.hypot((e.aiX ?? m.x) - m.x, (e.aiY ?? m.y) - m.y) < 16 || e.aiTimer! > 60) setState(e, 'climb');
      break;
    case 'climb':
      e.vel.x *= 0.96; e.vel.y = Math.max(-4, e.vel.y - 0.4);
      if (e.pos.y <= hy || e.aiTimer! > 90) setState(e, 'idle');
      break;
  }
  const floor = floorTopAt(state.blocks, m.x, e.pos.y + e.height, 0);
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  if (floor !== null && e.pos.y + e.height > floor) { e.pos.y = floor - e.height; if (e.aiState === 'swoop') setState(e, 'climb'); }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------

const H = { x: 1, y: -68, r: 10 };
/** Out of aggro range: this far off, anybody after him gives up and goes back to standing about. */
const LEASH_X = 820, LEASH_Y = 440;
const leashed = (ai: (ctx: FrameContext, e: Enemy) => boolean) => (ctx: FrameContext, e: Enemy) => {
  if (e.aiState && e.aiState !== 'idle') {
    const p = mid(ctx.state.player), m = mid(e);
    if (Math.abs(p.x - m.x) > LEASH_X || Math.abs(p.y - m.y) > LEASH_Y) { setState(e, 'idle'); e.vel.x = 0; }
  }
  return ai(ctx, e);
};
type Reg = Parameters<typeof registerM2Kind>[0];
const person = (kind: `m2:fa_${string}`, stats: Reg['stats'], ai: (ctx: FrameContext, e: Enemy) => boolean, draw: (c: CanvasRenderingContext2D, e: Enemy, f: number, seed: number) => void, extra: Partial<Reg> = {}) =>
  registerM2Kind({ kind, stats, humanoid: true, gender, head: H, ai: leashed(ai), draw: (c, e, f) => draw(c, e, f, seedOf(e)), ...extra });

person('m2:fa_clerk', { w: 36, h: 76, hp: 90, contact: 4, mass: 160 }, clerk, drawClerk, { head: { x: 1, y: -66, r: 10 } });
person('m2:fa_princess', { w: 38, h: 74, hp: 95, contact: 4, mass: 160 }, princess, drawPrincess, { head: { x: 1, y: -66, r: 10 } });
person('m2:fa_knight', { w: 40, h: 76, hp: 160, contact: 5, mass: 230 }, knight, drawKnight, { head: { x: 1, y: -68, r: 11 }, pointy: { source: 'm2:fa_lance', label: 'LANCED!', damage: 14 } });
person('m2:fa_bro', { w: 40, h: 74, hp: 120, contact: 5, mass: 220 }, bro, drawBro, { head: { x: 1, y: -66, r: 10 } });
person('m2:fa_troll', { w: 64, h: 104, hp: 420, contact: 8, mass: 460 }, troll, drawTroll, { head: { x: 4, y: -90, r: 15 }, spiky: { source: 'm2:fa_horns', label: 'HORNED!', damage: 14 }, grab: 'none' });
person('m2:fa_dragon', { w: 58, h: 96, hp: 300, contact: 7, mass: 380 }, dragon, drawDragon, { head: { x: 12, y: -82, r: 14 }, grab: 'none' });
registerM2Kind({
  kind: 'm2:fa_owl', stats: { w: 30, h: 26, hp: 24, contact: 8, mass: 6, air: true }, ai: owl,
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }), draw: (c, e, f) => drawOwl(c, e, f),
  head: { x: 6, y: -20, r: 7 }, gender: 'n', grab: 'critter',
});
registerM2Kind({
  kind: 'm2:fa_keg', stats: { w: 30, h: 34, hp: 1, contact: 0, mass: 60 },
  // (it sits up on its cart: nothing moves it but a hit, and a hit's the end of it)
  ai: (_ctx, e) => { e.vel.x = 0; e.vel.y = 0; return true; },
  make: b => ({ ...b, harmless: true }),
  draw: (c, e) => drawKeg(c, e), robot: true, gender: 'n', grab: 'none', fixture: true, pathing: false,
});
