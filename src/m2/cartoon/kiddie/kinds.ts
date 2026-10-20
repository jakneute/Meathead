// Sillyville Square's cast (Meathead 2's own kinds, registered when Cartoon Land is loaded): the park's costumed
// performers (men and women, every skin, build and hair, seeded per enemy; any of them in any costume), who break
// character to yell at him (the cat stays in rhyme: it's in his contract). Each has its tell before it hits:
//
//   hatcat     the STRIPEYHAT CAT: a cat suit, a tall striped stovepipe hat, a bow tie, a closed umbrella held out
//              front like a foil (POINTY: shoulder charging into it from the front hurts him). Keeps his distance;
//              the hat lifted off by the brim (the tell), then flung: it boomerangs out and back (it hurts both ways);
//              bareheaded till it's back. Up close, an umbrella jab.
//   whatsit    WHATSIT ONE and WHATSIT TWO (always a pair, the number on the chest): red jumpsuits, blue fright wigs,
//              each flying a kite. The kite shakes on its string (the tell) and dives at him, then climbs back; on the
//              ground, a crouch and a wiggle (the tell) and a mad dash at him, then dizzy.
//   vendor     the BALLOON VENDOR: a striped vest, a boater, a bunch of balloons. Keeps well back; twists a balloon
//              dog (the squeak: the tell) and lets it go: it drifts after him and pops on him (shoot it first); up
//              close, a kick in the shin.
//   balloondog a balloon dog (a little flyer, 1 hp): bobs after him slowly; touching him, it pops (a hurt); it floats
//              off up into the sky when it's had its time (gone, not killed).
//   painter    the FACE PAINTER: a smock, a beret, a palette, a brush. The brush dipped (the tell), then three blobs
//              flicked in a fan; they splat where they land. Up close, a brush across the face.
//   mascot     CAPTAIN SPRINKLES, the sugar-crazed cupcake mascot: huge, a frosted head with a lit birthday candle on
//              top (SPIKY: dive kicking onto it hurts), the performer's wide eyes in the mouth hole. Vibrating with
//              sugar (the tell), then three bounding leaps at him (landing on him hurts; the street shakes), then
//              the sugar crash: slumped, done (his window).
//
// What they throw: hazards.ts (updateThrows). Their drawings: kindArt.ts.

import type { Enemy, EnemyKind } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid, makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine } from '../../../m1/game/platform/speech';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { registerM2Kind, registerHurtLines, registerKindCallouts } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { speak, byPants } from '../section';
import type { ByPants } from '../talk';
import { kiddieOf, type Throw } from './state';
import { HURT, KILL_CALLS, CAST_VOICES, CAT_BARK, CAT_HAT, WHATSIT_BARK, VENDOR_BARK, PAINTER_BARK, MASCOT_BARK, MASCOT_CRASH } from './lines';
import { drawHatCat, drawWhatsit, drawVendor, drawBalloonDog, drawPainter, drawMascot, DOG_COLORS } from './kindArt';

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
/** Keep `near`..`far` from him (closing in, backing off), facing him. */
const keepAt = (ctx: FrameContext, e: Enemy, near: number, far: number, speed: number) => {
  const pm = mid(ctx.state.player), dx = Math.abs(pm.x - mid(e).x);
  if (dx > far) walkTo(ctx, e, pm.x, speed, far - 20);
  else if (dx < near) backOff(ctx, e, pm.x, speed * 0.8);
  else e.vel.x = 0;
  e.facing = dirTo(e, pm.x);
};
/** A hit in front of it (or all round it: `round`): the damage, its source, a knock. */
const strike = (ctx: FrameContext, e: Enemy, reach: number, dmg: number, source: string, knock = 6, up = -4, round = false) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0 || p.inCutscene) return false;
  const x = round ? e.pos.x - reach : e.facing! > 0 ? e.pos.x + e.width - 6 : e.pos.x - reach + 6;
  const w = round ? e.width + reach * 2 : reach;
  if (p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < e.pos.y + e.height && p.pos.y + p.height > e.pos.y + 6) {
    hurtPlayer(ctx, dmg, source, { x: (mid(p).x < mid(e).x ? -1 : 1) * knock, y: up });
    return true;
  }
  return false;
};
const level = (state: GameState, e: Enemy, dy = 60) => Math.abs((state.player.pos.y + state.player.height) - (e.pos.y + e.height)) < dy;

/** A bark over its head (rare, one at a time). */
export const bark = (state: GameState, e: Enemy, vo: string, pool: ByPants | string[], chance = 0.4, force = false) => {
  const k = kiddieOf(state);
  if (!force && (state.frame - k.barkAt < 240 || Math.random() > chance)) return;
  k.barkAt = state.frame;
  speak(vo, pickLine(Array.isArray(pool) ? pool : byPants(state, pool)), s => { if (s) k.barks.set(e, s); else k.barks.delete(e); }, false);
};
/** Its first sight of him: a bark, maybe. */
const spotted = (state: GameState, e: Enemy, vo: string, pool: ByPants, chance = 0.45) => {
  const k = e as { spotted?: boolean };
  if (k.spotted) return;
  k.spotted = true;
  bark(state, e, vo, pool, chance);
};
const throwIt = (state: GameState, e: Enemy, t: Omit<Throw, 'from' | 't'>) => kiddieOf(state).throws.push({ ...t, from: e, t: 0 });
/** Lobbed from its hand to land on him (in `t` frames, under `g` gravity), `spread` px off. */
const lobAt = (state: GameState, e: Enemy, kind: Throw['kind'], t: number, g: number, dy = 20, spread = 0) => {
  const p = state.player, m = mid(e), tx = p.pos.x + p.width / 2 + p.vel.x * t * 0.4 + spread, ty = p.pos.y + p.height * 0.6;
  const hx = m.x + (e.facing ?? 1) * 14, hy = e.pos.y + dy;
  throwIt(state, e, { kind, x: hx, y: hy, vx: (tx - hx) / t, vy: (ty - hy - 0.5 * g * t * t) / t });
};

// ---------------------------------------------------------------------------------------------------------------
// The hat cat

const hatOut = (state: GameState, e: Enemy) => kiddieOf(state).throws.some(t => t.kind === 'hat' && t.from === e && !t.dead);
const hatcat = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.cat, CAST_VOICES.catf);
  // (bareheaded while his hat's out flying: kindArt.ts draws him so)
  (e as { hatless?: boolean }).hatless = hatOut(state, e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 260) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, CAT_BARK, 0.6); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 70 && level(state, e)) { setState(e, 'jabWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 150, 300, 1.4);
      if (e.aiTimer! > 80 && !hatOut(state, e) && Math.abs(pm.y - mid(e).y) < 160) { setState(e, 'hatWind'); e.vel.x = 0; playSound('whoosh', 0.3, 10); }
      break;
    case 'hatWind':
      // (the hat lifted off by its brim, held up, wound back: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 32) {
        throwIt(state, e, { kind: 'hat', x: mid(e).x + e.facing! * 16, y: e.pos.y + 10, vx: e.facing! * 7.5, vy: 0, dir: 1, tx: pm.y - 20 });
        bark(state, e, vo, CAT_HAT, 0.45); playSound('whirl', 0.5, 6);
        setState(e, 'after');
      }
      break;
    case 'after':
      if (e.aiTimer! > 30) setState(e, 'near');
      break;
    case 'jabWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 16) { if (strike(ctx, e, 50, 10, 'm2:ct_hatcat', 7)) playSound('punch', 0.7, 6); playSound('whoosh', 0.5, 4); setState(e, 'jab'); }
      break;
    case 'jab':
      if (e.aiTimer! > 24) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The Whatsits

const kiteOf = (state: GameState, e: Enemy) => kiddieOf(state).throws.find(t => t.kind === 'kite' && t.from === e && !t.dead);
const whatsit = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.whatsit, CAST_VOICES.whatsitf);
  // (its kite: always up there on its string while it's on its feet)
  if (!kiteOf(state, e)) throwIt(state, e, { kind: 'kite', x: mid(e).x - (e.facing ?? 1) * 40, y: e.pos.y - 150, vx: 0, vy: 0, phase: 'fly' });
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 600, 320) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, WHATSIT_BARK, 0.5); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      // (never still: bouncing on its toes, closing in and backing off)
      keepAt(ctx, e, 90, 240, 2.4);
      if (e.aiTimer! > 70 && dx < 300 && level(state, e, 80)) { setState(e, 'crouch'); e.vel.x = 0; playSound('boing', 0.3, 12); }
      // (the kite's dive: off its own clock, when he's out where it can get him)
      const k = kiteOf(state, e);
      if (k && k.phase === 'fly' && k.t > 150 && dx < 420) { k.phase = 'tell'; k.t = 0; bark(state, e, vo, WHATSIT_BARK, 0.25); }
      break;
    }
    case 'crouch':
      // (a crouch and a wiggle, the wig shaking: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 24) { setState(e, 'dash'); playSound('whoosh', 0.6, 8); }
      break;
    case 'dash':
      e.vel.x = e.facing! * 6.2;
      if (strike(ctx, e, 20, 11, 'm2:ct_whatsit', 9, -5)) { setState(e, 'dizzy'); e.vel.x = 0; playSound('thud', 0.8, 4); break; }
      if (e.aiTimer! > 40 || !safeAhead(ctx, e, e.facing!, 14)) { setState(e, 'dizzy'); e.vel.x = 0; }
      break;
    case 'dizzy':
      e.vel.x *= 0.8;
      if (e.aiTimer! > 44) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The balloon vendor, and the balloon dogs

const DOGS_EACH = 2;
const vendor = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.vendor, CAST_VOICES.vendorf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 600, 320) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, VENDOR_BARK, 0.5); }
      break;
    case 'near': {
      if (Math.abs(pm.x - mid(e).x) < 60 && level(state, e)) { setState(e, 'kickWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 220, 380, 1.2);
      const mine = state.enemies.filter(d => d.kind === 'm2:ct_balloondog' && d.health > 0 && (d as { owner?: Enemy }).owner === e).length;
      if (e.aiTimer! > 110 && mine < DOGS_EACH) { setState(e, 'twist'); e.vel.x = 0; }
      break;
    }
    case 'twist':
      // (twisting a balloon dog, squeak by squeak: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 10 === 0) playSound('boing', 0.25, 18 + (e.aiTimer! / 10) * 2);
      if (e.aiTimer! > 44) {
        const d = makeKindEnemy('m2:ct_balloondog' as EnemyKind, mid(e).x + e.facing! * 20, e.pos.y - 30);
        (d as { owner?: Enemy }).owner = e; d.variant = (state.frame >> 3) % 5; d.facing = e.facing; d.seen = true;
        state.enemies.push(d);
        bark(state, e, vo, VENDOR_BARK, 0.3);
        setState(e, 'after');
      }
      break;
    case 'after':
      if (e.aiTimer! > 30) setState(e, 'near');
      break;
    case 'kickWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { if (strike(ctx, e, 40, 9, 'm2:ct_vendor', 7, -5)) playSound('punch', 0.7, 2); setState(e, 'kick'); }
      break;
    case 'kick':
      if (e.aiTimer! > 22) setState(e, 'near');
      break;
  }
  return false;
};

const DOG_LIFE = 420;
const balloondog = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, pm = mid(p), m = mid(e);
  tick(e);
  // (its time's up: off up into the sky, and gone (not killed))
  if (e.aiTimer! > DOG_LIFE || e.aiState === 'away') {
    e.aiState = 'away'; e.vel.x *= 0.95; e.vel.y = Math.max(-2.5, e.vel.y - 0.06);
    e.pos.x += e.vel.x; e.pos.y += e.vel.y;
    if (e.pos.y < state.camera.y - 120 || e.pos.y < -2000) state.enemies = state.enemies.filter(o => o !== e);
    return true;
  }
  // (bobbing after him, slow)
  const tx = pm.x, ty = pm.y - 10 + Math.sin(state.frame * 0.06 + e.initialX) * 18;
  const dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy) || 1;
  e.vel.x += (dx / d) * 0.06; e.vel.y += (dy / d) * 0.05;
  const sp = Math.hypot(e.vel.x, e.vel.y), max = 1.5;
  if (sp > max) { e.vel.x *= max / sp; e.vel.y *= max / sp; }
  e.facing = (e.vel.x < 0 ? -1 : 1);
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  // (on him: it pops)
  if (p.health > 0 && !p.inCutscene && p.pos.x < e.pos.x + e.width && p.pos.x + p.width > e.pos.x && p.pos.y < e.pos.y + e.height && p.pos.y + p.height > e.pos.y) {
    if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 9, 'm2:ct_balloondog', { x: (pm.x < m.x ? -1 : 1) * 5, y: -4 });
    popDog(state, e);
  }
  return true;
};
/** A balloon dog pops (bits of rubber everywhere, a bang). */
export const popDog = (state: GameState, e: Enemy) => {
  const m = mid(e);
  playSound('boom', 0.5, 16); playSound('clap', 0.5, 8);
  const col = DOG_COLORS[(e.variant ?? 0) % DOG_COLORS.length];
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: m.x, y: m.y }, vel: { x: (Math.random() - 0.5) * 7, y: (Math.random() - 0.5) * 7 }, life: 22, color: i % 3 ? col : '#FFFFFF', size: 3 });
  state.enemies = state.enemies.filter(o => o !== e);
};

// ---------------------------------------------------------------------------------------------------------------
// The face painter

const painter = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.painter, CAST_VOICES.painterf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 300) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, PAINTER_BARK, 0.5); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 56 && level(state, e)) { setState(e, 'smearWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 150, 320, 1.4);
      if (e.aiTimer! > 75) { setState(e, 'dip'); e.vel.x = 0; playSound('splat', 0.3, 12); }
      break;
    case 'dip':
      // (the brush dipped in the palette, twirled, wound back: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 30) {
        for (const s of [-70, 0, 70]) lobAt(state, e, 'paint', 32 + Math.abs(s) / 10, 0.3, 18, s);
        playSound('whoosh', 0.5, 6); setState(e, 'after');
      }
      break;
    case 'after':
      if (e.aiTimer! > 26) setState(e, 'near');
      break;
    case 'smearWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { if (strike(ctx, e, 44, 9, 'm2:ct_painter', 6)) playSound('splat', 0.7, 4); setState(e, 'smear'); }
      break;
    case 'smear':
      if (e.aiTimer! > 24) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Captain Sprinkles

const mascot = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.mascot, CAST_VOICES.mascotf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 260) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, MASCOT_BARK, 0.75); }
      break;
    case 'near': {
      // (jittery: twitching forward in fits)
      walkTo(ctx, e, pm.x, (state.frame + e.initialX) % 30 < 18 ? 1.6 : 0.3, 120);
      const dx = Math.abs(pm.x - mid(e).x);
      if (e.aiTimer! > 50 && dx < 300 && Math.abs(pm.y - mid(e).y) < 160) { setState(e, 'rev'); e.vel.x = 0; e.aiX = 0; playSound('rumble', 0.4, 18); }
      break;
    }
    case 'rev':
      // (vibrating with sugar, sprinkles flying off: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 3 === 0) state.particles.push({ pos: { x: mid(e).x + (Math.random() - 0.5) * 50, y: e.pos.y + 20 + Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 20, color: ['#F472B6', '#FDE047', '#60A5FA', '#34D399'][e.aiTimer! % 4], size: 2 });
      if (e.aiTimer! > 36) leap(state, e);
      break;
    case 'leap': {
      if (strike(ctx, e, 4, 14, 'm2:ct_mascot', 8, -7, true)) playSound('squish', 0.9, -4);
      const under = floorTopAt(state.blocks, mid(e).x, e.pos.y + e.height - 4, 8);
      if (e.aiTimer! > 8 && e.vel.y >= 0 && under !== null && Math.abs(under - (e.pos.y + e.height)) < 6) {
        e.vel.x = 0; playSound('slam', 0.7, 4); shakeScreen(state, 5, 3);
        for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: mid(e).x + (Math.random() - 0.5) * 50, y: e.pos.y + e.height - 4 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 24, color: ['#F472B6', '#FDE047', '#FFFFFF'][i % 3], size: 3 });
        e.aiX = (e.aiX ?? 0) + 1;
        if (e.aiX >= 3) { setState(e, 'crash'); bark(state, e, vo, MASCOT_CRASH, 0.8, true); }
        else { setState(e, 'hop'); }
      } else if (e.aiTimer! > 90) setState(e, 'crash');
      break;
    }
    case 'hop':
      e.vel.x = 0;
      if (e.aiTimer! > 10) leap(state, e);
      break;
    case 'crash':
      // (the sugar crash: slumped, eyes rolling: his window)
      e.vel.x *= 0.7;
      if (e.aiTimer! > 100) { setState(e, 'near'); e.aiX = 0; }
      break;
  }
  return false;
};
/** One of the mascot's leaps at him (only where there's ground to land on: never into a ball pit). */
const leap = (state: GameState, e: Enemy) => {
  const pm = mid(state.player), m = mid(e);
  const dx = Math.max(-190, Math.min(190, pm.x - m.x)), land = m.x + dx;
  const under = floorTopAt(state.blocks, land, e.pos.y + e.height - 40, 120);
  if (under === null) { setState(e, 'crash'); return; }
  e.facing = dirTo(e, pm.x);
  e.vel.x = dx / 30; e.vel.y = -10;
  playSound('boing', 0.6, -6);
  setState(e, 'leap');
};

// ---------------------------------------------------------------------------------------------------------------

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
const person = (kind: `m2:ct_${string}`, stats: Reg['stats'], ai: (ctx: FrameContext, e: Enemy) => boolean, draw: (c: CanvasRenderingContext2D, e: Enemy, f: number, seed: number) => void, extra: Partial<Reg> = {}) =>
  registerM2Kind({ kind, stats, humanoid: true, gender, head: { x: 1, y: -66, r: 10 }, ai: leashed(ai), draw: (c, e, f) => draw(c, e, f, seedOf(e)), ...extra });

person('m2:ct_hatcat', { w: 38, h: 76, hp: 110, contact: 4, mass: 170 }, hatcat, drawHatCat, { pointy: { source: 'm2:ct_umbrella', label: 'UMBRELLAED!', damage: 13 } });
person('m2:ct_whatsit', { w: 34, h: 72, hp: 85, contact: 4, mass: 150 }, whatsit, drawWhatsit);
person('m2:ct_vendor', { w: 38, h: 74, hp: 90, contact: 4, mass: 170 }, vendor, drawVendor);
person('m2:ct_painter', { w: 36, h: 74, hp: 80, contact: 4, mass: 160 }, painter, drawPainter);
person('m2:ct_mascot', { w: 66, h: 106, hp: 380, contact: 8, mass: 440 }, mascot, drawMascot, { head: { x: 2, y: -84, r: 18 }, spiky: { source: 'm2:ct_candle', label: 'CANDLED!', damage: 14 }, grab: 'none' });
registerM2Kind({
  kind: 'm2:ct_balloondog', stats: { w: 30, h: 26, hp: 1, contact: 0, mass: 4, air: true }, ai: balloondog,
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }), draw: (c, e, f) => drawBalloonDog(c, e, f),
  // (not a machine: balloon dogs bleed (the drones do too: the joke's kept))
  head: { x: 10, y: -20, r: 7 }, gender: 'n', grab: 'critter',
});
