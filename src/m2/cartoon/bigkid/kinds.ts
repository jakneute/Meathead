// The big-kid zone's cast (Meathead 2's own kinds, registered when Cartoon Land is loaded): the zone's staff and its
// costumed characters (men and women, every skin, build and hair, seeded per enemy; any of them in any costume). Each
// has its tell before it hits:
//
//   rideop     the RIDE OP: a bored teen in the zone's teal polo, a headset, a lanyard, an orange traffic wand. Hand to
//              the headset (the tell: "RIDE CONTROL, RUN HIM OVER"): the nearest ride comes straight for him. No ride
//              near: a traffic cone lifted overhead (the tell) and lobbed. Up close, a jab with the wand.
//   skatepunk  RAD RAT, the skate punk mascot: a rat costume head (sunglasses, a backwards cap, a purple mohawk of real
//              spikes: SPIKY, dive kicking onto it hurts), baggy shorts, a board. Close: a crouch on the board (the
//              tell), then a rush at him, then a bail (his window). Far: the board stomped up into his hand (the tell)
//              and flung skidding along the ground at him; he goes and gets it back.
//   gloppy     GLOPPY, the gross-out show's slime monster: a big green lumpy costume, eye stalks, drool, the performer's
//              face in the mouth. Cheeks puffed, a gurgle (the tell), then a loogie lobbed: it leaves a sticky puddle
//              (he wades through at half speed). Up close, a belly bump. Too big to grab.
//   flea       THE FLEA, the big blue superhero: muscle suit, antennae, cowl. Fists on hips, chest out ("SPATULA!"),
//              then a leap; at the top he hangs a beat, fist down (the tell), then dives fist first at where he was,
//              and sticks head first in the ground, legs kicking (his window).
//   churro     the CHURRO VENDOR: an apron, a paper hat, the striped cart. Shaking a churro in the sugar bag (the
//              tell), then one thrown flat (two, every other time). Close: leaning on the cart's handle, the wheels
//              squeaking (the tell), then the cart rammed at him; winded after.
//
// What they throw: rides.ts (updateThrows). Their drawings: kindArt.ts.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickFreshLine } from '../../../m1/game/platform/speech';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { registerM2Kind, registerHurtLines, registerKindCallouts } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { speak, byPants } from '../section';
import type { ByPants } from '../talk';
import { bigkidOf, type Throw } from './state';
import { sicRide } from './rides';
import { HURT, KILL_CALLS, CAST_VOICES, RIDEOP_BARK, RIDEOP_RADIO, SKATE_BARK, GLOPPY_BARK, FLEA_BARK, CHURRO_BARK } from './lines';
import { drawRideOp, drawSkatePunk, drawGloppy, drawFlea, drawChurro } from './kindArt';

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
/** A hit in front of it (`ahead` px further out: a cart), or all round it (`round`). */
const strike = (ctx: FrameContext, e: Enemy, reach: number, dmg: number, source: string, knock = 6, up = -4, round = false, ahead = 0) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0 || p.inCutscene) return false;
  const x = round ? e.pos.x - reach : e.facing! > 0 ? e.pos.x + e.width - 6 + ahead : e.pos.x - reach + 6 - ahead;
  const w = round ? e.width + reach * 2 : reach;
  if (p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < e.pos.y + e.height && p.pos.y + p.height > e.pos.y + 6) {
    hurtPlayer(ctx, dmg, source, { x: (mid(p).x < mid(e).x ? -1 : 1) * knock, y: up });
    return true;
  }
  return false;
};
const level = (state: GameState, e: Enemy, dy = 60) => Math.abs((state.player.pos.y + state.player.height) - (e.pos.y + e.height)) < dy;

/** A bark over its head (rare, one at a time; never over anybody else's words; never a line said in the last 45 s:
 *  nothing fresh, nothing said). */
export const bark = (state: GameState, e: Enemy, vo: string, pool: ByPants | string[], chance = 0.4, force = false) => {
  const k = bigkidOf(state);
  if (!force && (state.frame - k.barkAt < 240 || Math.random() > chance)) return;
  const line = pickFreshLine(Array.isArray(pool) ? pool : byPants(state, pool));
  if (!line) return;
  k.barkAt = state.frame;
  speak(vo, line, s => { if (s) k.barks.set(e, s); else k.barks.delete(e); }, false);
};
const spotted = (state: GameState, e: Enemy, vo: string, pool: ByPants, chance = 0.45) => {
  const k = e as { spotted?: boolean };
  if (k.spotted) return;
  k.spotted = true;
  bark(state, e, vo, pool, chance);
};
const throwIt = (state: GameState, e: Enemy, t: Omit<Throw, 'from' | 't'>) => bigkidOf(state).throws.push({ ...t, from: e, t: 0 });
/** Lobbed from its hand to land on him (in `t` frames, under `g` gravity). */
const lobAt = (state: GameState, e: Enemy, kind: Throw['kind'], t: number, g: number, dy = 20) => {
  const p = state.player, m = mid(e), tx = p.pos.x + p.width / 2 + p.vel.x * t * 0.4, ty = p.pos.y + p.height * 0.6;
  const hx = m.x + (e.facing ?? 1) * 14, hy = e.pos.y + dy;
  throwIt(state, e, { kind, x: hx, y: hy, vx: (tx - hx) / t, vy: (ty - hy - 0.5 * g * t * t) / t });
};

// ---------------------------------------------------------------------------------------------------------------
// The ride op

const rideop = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.rideop, CAST_VOICES.rideopf), me = e as { radioAt?: number };
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 260) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, RIDEOP_BARK, 0.6); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 60 && level(state, e)) { setState(e, 'wandWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 160, 320, 1.3);
      if (e.aiTimer! > 110 && Math.abs(pm.y - mid(e).y) < 200) {
        // (a ride near enough to set on him, and he hasn't just: on the headset; else a cone)
        if (state.frame - (me.radioAt ?? -9999) > 480 && sicRide(state, true)) { setState(e, 'radio'); bark(state, e, vo, RIDEOP_RADIO, 1, true); }
        else { setState(e, 'coneWind'); playSound('whoosh', 0.25, 12); }
        e.vel.x = 0;
      }
      break;
    case 'radio':
      // (hand to the headset, mouth going: the tell; then the ride's on him)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 12 === 0) playSound('beep', 0.2, 20);
      if (e.aiTimer! > 46) { sicRide(state); me.radioAt = state.frame; setState(e, 'after'); }
      break;
    case 'coneWind':
      // (a cone hoisted overhead: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 30) { lobAt(state, e, 'cone', 36, 0.35, -10); playSound('whoosh', 0.5, 2); setState(e, 'after'); }
      break;
    case 'after':
      if (e.aiTimer! > 34) setState(e, 'near');
      break;
    case 'wandWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { if (strike(ctx, e, 46, 9, 'm2:ct_rideop', 7)) playSound('punch', 0.7, 8); playSound('whoosh', 0.45, 6); setState(e, 'wand'); }
      break;
    case 'wand':
      if (e.aiTimer! > 24) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Rad Rat, the skate punk

type Skater = Enemy & { boardless?: boolean };
const boardOf = (state: GameState, e: Enemy) => bigkidOf(state).throws.find(t => t.kind === 'board' && t.from === e && !t.dead);
const skatepunk = (ctx: FrameContext, e: Skater) => {
  const { state } = ctx, pm = mid(state.player), m = mid(e);
  tick(e);
  const vo = voice(e, CAST_VOICES.skate, CAST_VOICES.skatef);
  // (his board's gone (fell in the glop, or lost): he's got a spare in his backpack, after a while)
  if (e.boardless && !boardOf(state, e) && e.aiTimer! > 200) e.boardless = false;
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 600, 280) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, SKATE_BARK, 0.6); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - m.x);
      if (e.boardless) {
        // (off after his board: picked up when he's on it, once it's stopped)
        const b = boardOf(state, e);
        if (b && b.down) { walkTo(ctx, e, b.x, 2.2, 8); if (Math.abs(b.x - m.x) < 16 && Math.abs(b.y - (e.pos.y + e.height)) < 30) { b.dead = true; e.boardless = false; playSound('clink', 0.4, 6); e.aiTimer = 40; } }
        else e.vel.x = 0;
        break;
      }
      keepAt(ctx, e, 170, 360, 2.1);
      if (e.aiTimer! > 70 && level(state, e, 90)) {
        if (dx < 330) { setState(e, 'crouch'); e.vel.x = 0; playSound('whoosh', 0.3, 14); }
        else { setState(e, 'pop'); e.vel.x = 0; playSound('clink', 0.35, 4); }
      }
      break;
    }
    case 'crouch':
      // (down low on the board, pushing off: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 26) { setState(e, 'rush'); playSound('whirl', 0.5, 6); }
      break;
    case 'rush':
      e.vel.x = e.facing! * 7;
      if (e.aiTimer! % 6 === 0) playSound('whirl', 0.15, 16);
      if (strike(ctx, e, 18, 11, 'm2:ct_skatepunk', 9, -6)) { setState(e, 'bail'); e.vel.x = 0; playSound('thud', 0.8, 4); break; }
      if (e.aiTimer! > 48 || !safeAhead(ctx, e, e.facing!, 16)) { setState(e, 'bail'); e.vel.x = 0; playSound('crash', 0.35, 10); }
      break;
    case 'bail':
      // (ate it: on his ass, the board rolling off a bit: his window)
      e.vel.x *= 0.8;
      if (e.aiTimer! > 54) setState(e, 'near');
      break;
    case 'pop':
      // (the board stomped up into his hand, cocked back: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 30) {
        throwIt(state, e, { kind: 'board', x: m.x + e.facing! * 20, y: e.pos.y + e.height, vx: e.facing! * 8.5, vy: 0 });
        e.boardless = true; bark(state, e, vo, SKATE_BARK, 0.3); playSound('whoosh', 0.6, 4);
        setState(e, 'after');
      }
      break;
    case 'after':
      e.vel.x = 0;
      if (e.aiTimer! > 30) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Gloppy

const gloppy = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.gloppy, CAST_VOICES.gloppyf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 620, 340) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, GLOPPY_BARK, 0.7); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 70 && level(state, e)) { setState(e, 'bumpWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 150, 320, 0.9);
      if (e.aiTimer! > 90) { setState(e, 'hock'); e.vel.x = 0; }
      break;
    case 'hock':
      // (cheeks puffed, a long gurgle: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! === 1 || e.aiTimer! === 20) playSound('glug', 0.5, -6 + e.aiTimer! / 4);
      if (e.aiTimer! > 40) { lobAt(state, e, 'glop', 34, 0.3, 14); playSound('splat', 0.45, 10); bark(state, e, vo, GLOPPY_BARK, 0.2); setState(e, 'after'); }
      break;
    case 'after':
      if (e.aiTimer! > 34) setState(e, 'near');
      break;
    case 'bumpWind':
      // (leaning back, belly out: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 18) { if (strike(ctx, e, 30, 10, 'm2:ct_gloppy', 9, -5)) playSound('squish', 0.8, -4); setState(e, 'bump'); }
      break;
    case 'bump':
      if (e.aiTimer! > 28) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The Flea

type Flea = Enemy & { tx?: number; ty?: number };
const flea = (ctx: FrameContext, e: Flea) => {
  const { state } = ctx, pm = mid(state.player), m = mid(e);
  tick(e);
  const vo = voice(e, CAST_VOICES.flea, CAST_VOICES.fleaf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 640, 360) && e.aiTimer! > 20) setState(e, 'near');
      return false;
    case 'near':
      keepAt(ctx, e, 200, 380, 1.6);
      if (e.aiTimer! > 80 && Math.abs(pm.x - m.x) < 440 && Math.abs(pm.y - m.y) < 300 && e.vel.y === 0) { setState(e, 'pose'); e.vel.x = 0; bark(state, e, vo, FLEA_BARK, 0.55); }
      return false;
    case 'pose':
      // (fists on hips, chest out, cape (there's no cape) in the wind: the wind-up)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 34) { setState(e, 'leap'); e.vel.y = -13; e.vel.x = Math.max(-4, Math.min(4, (pm.x - m.x) / 40)); playSound('jump', 0.6, -4); playSound('whoosh', 0.5, 0); }
      return false;
    case 'leap':
      // (up (the engine's gravity), till the top)
      if (e.vel.y >= -0.5 && e.aiTimer! > 6) { setState(e, 'hang'); e.vel.x = 0; e.vel.y = 0; }
      return false;
    case 'hang':
      // (at the top, hanging there a beat, fist pointed down at him: the tell)
      e.vel.x = 0; e.vel.y = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! === 2) playSound('alert', 0.35, 10);
      if (e.aiTimer! > 22) { setState(e, 'dive'); e.tx = pm.x; e.ty = state.player.pos.y + state.player.height; playSound('whoosh', 0.7, -6); }
      return true;
    case 'dive': {
      // (fist first at where he was: straight through, till the ground stops him)
      const dx = (e.tx ?? m.x) - m.x, dy = (e.ty ?? m.y) + 40 - (e.pos.y + e.height), d = Math.hypot(dx, dy) || 1;
      const sp = 9.5, vx = d > 20 ? (dx / d) * sp : 0, vy = d > 20 ? Math.max(4, (dy / d) * sp) : sp;
      e.vel.x = vx; e.vel.y = vy; e.pos.x += vx; e.pos.y += vy;
      if (strike(ctx, e, 6, 12, 'm2:ct_flea', 8, -7, true)) playSound('punch', 0.9, -6);
      const feet = e.pos.y + e.height, top = floorTopAt(state.blocks, mid(e).x, feet - vy - 2, Math.max(12, vy + 4));
      if (top !== null && feet >= top) {
        e.pos.y = top - e.height; e.vel.x = 0; e.vel.y = 0; setState(e, 'stuck');
        playSound('slam', 0.7, 2); playSound('thud', 0.6, -8);
        for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: mid(e).x + (Math.random() - 0.5) * 30, y: top - 2 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 24, color: '#A8A29E', size: 4 });
        return false;
      }
      if (e.aiTimer! > 80) { setState(e, 'near'); return false; }
      return true;
    }
    case 'stuck':
      // (head first in the street, legs kicking: his window)
      e.vel.x = 0;
      if (e.aiTimer! > 72) { setState(e, 'near'); playSound('crack', 0.35, 10); }
      return false;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The churro vendor

const CART = 52;
const churro = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, CAST_VOICES.churro, CAST_VOICES.churrof);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 580, 280) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, CHURRO_BARK, 0.55); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      keepAt(ctx, e, 190, 340, 1.1);
      if (e.aiTimer! > 70 && dx < 230 && level(state, e)) { setState(e, 'pushWind'); e.vel.x = 0; break; }
      if (e.aiTimer! > 100) { setState(e, 'sugar'); e.vel.x = 0; e.aiX = (e.aiX ?? 0) + 1; }
      break;
    }
    case 'sugar':
      // (a churro shaken in the sugar bag: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 6 === 0) playSound('clink', 0.15, 20);
      if (e.aiTimer! > 32) { throwChurro(state, e); playSound('whoosh', 0.5, 8); setState(e, (e.aiX ?? 0) % 2 ? 'throw2' : 'after'); }
      break;
    case 'throw2':
      e.vel.x = 0;
      if (e.aiTimer! > 14) { throwChurro(state, e); playSound('whoosh', 0.5, 10); setState(e, 'after'); }
      break;
    case 'after':
      if (e.aiTimer! > 30) setState(e, 'near');
      break;
    case 'pushWind':
      // (leaning on the cart's handle, the wheels squeaking: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 8 === 0) playSound('click', 0.3, 16);
      if (e.aiTimer! > 26) { setState(e, 'ram'); bark(state, e, vo, CHURRO_BARK, 0.3); }
      break;
    case 'ram':
      e.vel.x = e.facing! * 5.2;
      if (strike(ctx, e, CART, 11, 'm2:ct_churro', 9, -6)) { playSound('crash', 0.6, 6); setState(e, 'winded'); e.vel.x = 0; break; }
      if (e.aiTimer! > 44 || !safeAhead(ctx, e, e.facing!, CART + 8)) { setState(e, 'winded'); e.vel.x = 0; playSound('clang', 0.3, 8); }
      break;
    case 'winded':
      // (bent over the handle, puffing: his window)
      e.vel.x *= 0.7;
      if (e.aiTimer! > 50) setState(e, 'near');
      break;
  }
  return false;
};
const throwChurro = (state: GameState, e: Enemy) => {
  const m = mid(e), pm = mid(state.player), t = Math.max(14, Math.abs(pm.x - m.x) / 8.5);
  const hx = m.x + e.facing! * 12, hy = e.pos.y + 22, vy = (pm.y - hy - 0.5 * 0.12 * t * t) / t;
  throwIt(state, e, { kind: 'churro', x: hx, y: hy, vx: e.facing! * 8.5, vy: Math.max(-4, Math.min(2, vy)) });
};

// ---------------------------------------------------------------------------------------------------------------

/** Out of aggro range: this far off, anybody after him gives up and goes back to standing about. */
const LEASH_X = 840, LEASH_Y = 460;
const leashed = (ai: (ctx: FrameContext, e: Enemy) => boolean) => (ctx: FrameContext, e: Enemy) => {
  // (never mid-move: the Flea up in the air finishes his dive)
  if (e.aiState && e.aiState !== 'idle' && !['leap', 'hang', 'dive'].includes(e.aiState)) {
    const p = mid(ctx.state.player), m = mid(e);
    if (Math.abs(p.x - m.x) > LEASH_X || Math.abs(p.y - m.y) > LEASH_Y) { setState(e, 'idle'); e.vel.x = 0; }
  }
  return ai(ctx, e);
};
type Reg = Parameters<typeof registerM2Kind>[0];
const person = (kind: `m2:ct_${string}`, stats: Reg['stats'], ai: (ctx: FrameContext, e: Enemy) => boolean, draw: (c: CanvasRenderingContext2D, e: Enemy, f: number, seed: number) => void, extra: Partial<Reg> = {}) =>
  registerM2Kind({ kind, stats, humanoid: true, gender, head: { x: 1, y: -66, r: 10 }, ai: leashed(ai), draw: (c, e, f) => draw(c, e, f, seedOf(e)), ...extra });

person('m2:ct_rideop', { w: 36, h: 74, hp: 90, contact: 4, mass: 160 }, rideop, drawRideOp);
person('m2:ct_skatepunk', { w: 38, h: 80, hp: 105, contact: 4, mass: 170 }, skatepunk, drawSkatePunk, { head: { x: 2, y: -70, r: 13 }, spiky: { source: 'm2:ct_mohawk', label: 'MOHAWKED!', damage: 13 } });
person('m2:ct_gloppy', { w: 56, h: 98, hp: 240, contact: 6, mass: 330 }, gloppy, drawGloppy, { head: { x: 2, y: -80, r: 18 }, grab: 'none' });
person('m2:ct_flea', { w: 40, h: 82, hp: 140, contact: 4, mass: 220 }, flea, drawFlea, { pathing: false });
person('m2:ct_churro', { w: 38, h: 74, hp: 100, contact: 4, mass: 180 }, churro, drawChurro);
