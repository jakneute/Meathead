// The studio's staff (Meathead 2's own kinds, registered when Cartoon Land is loaded): the people who work the tour,
// on the clock and sick of it (men and women, every skin, build and hair, seeded per enemy). Each has its tell before
// it hits:
//
//   guide   the TOUR GUIDE: a red blazer, a name tag, a headset, the tour's flag up on its pole (POINTY: the pole's
//           tip, leveled at him when she's close: charging into it hurts). Walks backward, keeping her distance; a
//           souvenir plate raised back over her shoulder (the tell), then flung flat, spinning, straight at him (it
//           smashes); up close, the flag pole pulled back (the tell) and jabbed.
//   intern  the INTERN: a loosened tie, a lanyard, a cardboard tray of four coffees for Dave. The tray wobbling (the
//           tell), then a cup lobbed at him (it scalds; it leaves a steaming puddle, harmless). Out of coffee, he
//           just runs at him and shoves (a wind up: the tell).
//   exec    the PITCH EXEC: a big-shouldered suit, slicked hair, a binder, a laser pointer. Keeps well back; the red dot
//           comes out and crawls up him toward his eyes (the tell), stops, blinks (the beep), and if his head's still
//           there it gets him in the eye. Up close, the binder (a wind up).
//   pencil  PENCIL PETE, the studio's mascot: a giant yellow number two pencil, sharpened on top (SPIKY: dive kick
//           onto the point and it's in him), the performer's face in a hole in the foam. Rocking, winding up, shavings
//           curling off (the tell), then a corkscrew spin across the floor at him; then dizzy (his window). Up close,
//           a hip check.
//   guard   STUDIO SECURITY: big, slow, a peaked cap, a radio, a heavy flashlight. The whistle (the tell: cheeks out,
//           a blast) and a bull rush at him, then winded, hands on his knees (his window); up close, the flashlight
//           up over his head (the tell) and down.
//
// What they throw: props.ts (updateThrows). The exec's dot: here (each exec's own). Their drawings: kindArt.ts.

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
import { studioOf, type Throw } from './state';
import {
  HURT, KILL_CALLS, STAFF_VOICES, GUIDE_BARK, GUIDE_PLATE, INTERN_BARK, INTERN_THROW, EXEC_BARK, EXEC_ZAP, PENCIL_BARK,
  PENCIL_SPIN, GUARD_BARK, GUARD_WHISTLE,
} from './lines';
import { drawGuide, drawIntern, drawExec, drawPencil, drawGuard } from './kindArt';

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
  const s = studioOf(state);
  if (!force && (state.frame - s.barkAt < 240 || Math.random() > chance)) return;
  s.barkAt = state.frame;
  speak(vo, pickLine(Array.isArray(pool) ? pool : byPants(state, pool)), x => { if (x) s.barks.set(e, x); else s.barks.delete(e); }, false);
};
const spotted = (state: GameState, e: Enemy, vo: string, pool: ByPants, chance = 0.45) => {
  const k = e as { spotted?: boolean };
  if (k.spotted) return;
  k.spotted = true;
  bark(state, e, vo, pool, chance);
};
const throwIt = (state: GameState, e: Enemy, t: Omit<Throw, 'from' | 't'>) => studioOf(state).throws.push({ ...t, from: e, t: 0 });

// ---------------------------------------------------------------------------------------------------------------
// The tour guide

const plateOut = (state: GameState, e: Enemy) => studioOf(state).throws.some(t => t.kind === 'plate' && t.from === e && !t.dead);
const guide = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, STAFF_VOICES.guide, STAFF_VOICES.guidef);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 260) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, GUIDE_BARK, 0.6); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 82 && level(state, e)) { setState(e, 'pokeWind'); e.vel.x = 0; break; }
      // (walking backward ahead of him, the way they do)
      keepAt(ctx, e, 170, 310, 1.5);
      if (e.aiTimer! > 95 && !plateOut(state, e) && Math.abs(pm.y - mid(e).y) < 140) { setState(e, 'plateWind'); e.vel.x = 0; }
      break;
    case 'plateWind':
      // (the plate up and back over her shoulder: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 28) {
        const hy = e.pos.y + 26, ty = state.player.pos.y + state.player.height * 0.4;
        throwIt(state, e, { kind: 'plate', x: mid(e).x + e.facing! * 18, y: hy, vx: e.facing! * 6.4, vy: Math.max(-1.2, Math.min(1.2, (ty - hy) / 60)) });
        bark(state, e, vo, GUIDE_PLATE, 0.35); playSound('whoosh', 0.5, 10);
        setState(e, 'after');
      }
      break;
    case 'after':
      if (e.aiTimer! > 30) setState(e, 'near');
      break;
    case 'pokeWind':
      // (the flag pole drawn back, leveled at him: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 18) { if (strike(ctx, e, 74, 10, 'm2:ct_guide', 8)) playSound('punch', 0.7, 6); playSound('whoosh', 0.5, 4); setState(e, 'poke'); }
      break;
    case 'poke':
      if (e.aiTimer! > 24) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The intern

const CUPS = 4;
const intern = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player), k = e as { cups?: number };
  tick(e);
  k.cups ??= CUPS;
  const vo = voice(e, STAFF_VOICES.intern, STAFF_VOICES.internf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 540, 260) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, INTERN_BARK, 0.6); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 60 && level(state, e)) { setState(e, 'shoveWind'); e.vel.x = 0; break; }
      if (k.cups! > 0) {
        // (jittery: never quite still)
        keepAt(ctx, e, 140, 280, 1.9);
        if (e.aiTimer! > 70 && Math.abs(pm.y - mid(e).y) < 200) { setState(e, 'wobble'); e.vel.x = 0; }
      } else walkTo(ctx, e, pm.x, 2.6, 40);
      break;
    case 'wobble': {
      // (the tray wobbling, a cup picked off it: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 26) {
        const p = state.player, t = 30, g = 0.3, tx = p.pos.x + p.width / 2 + p.vel.x * t * 0.4, ty = p.pos.y + p.height * 0.5;
        const hx = mid(e).x + e.facing! * 12, hy = e.pos.y + 24;
        throwIt(state, e, { kind: 'coffee', x: hx, y: hy, vx: (tx - hx) / t, vy: (ty - hy - 0.5 * g * t * t) / t });
        k.cups!--;
        bark(state, e, vo, INTERN_THROW, 0.3); playSound('whoosh', 0.4, 12);
        setState(e, 'after');
      }
      break;
    }
    case 'after':
      if (e.aiTimer! > 24) setState(e, 'near');
      break;
    case 'shoveWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 12) { if (strike(ctx, e, 40, 8, 'm2:ct_intern', 8, -4)) playSound('punch', 0.6, 8); setState(e, 'shove'); }
      break;
    case 'shove':
      if (e.aiTimer! > 22) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The pitch exec (and the dot)

/** An exec's laser dot: where it is, crawling or locked. */
export interface Dot { x: number; y: number; lock: number }
export const dotOf = (e: Enemy) => (e as { dot?: Dot | null }).dot ?? null;
const setDot = (e: Enemy, d: Dot | null) => { (e as { dot?: Dot | null }).dot = d; };
/** His eyes (where the dot's going). */
const eyes = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2 + state.player.facing * 4, y: state.player.pos.y + 12 });
const exec = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, STAFF_VOICES.exec, STAFF_VOICES.execf);
  if (e.aiState !== 'aim' && e.aiState !== 'lock') setDot(e, null);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 620, 300) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, EXEC_BARK, 0.6); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 62 && level(state, e)) { setState(e, 'swatWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 240, 440, 1.3);
      if (e.aiTimer! > 110 && Math.abs(pm.x - mid(e).x) < 620 && Math.abs(pm.y - mid(e).y) < 320) {
        setState(e, 'aim'); e.vel.x = 0;
        // (the dot starts at the floor in front of him and crawls up)
        setDot(e, { x: pm.x - dirTo(e, pm.x) * 80, y: state.player.pos.y + state.player.height, lock: 0 });
        playSound('click', 0.4, 10);
      }
      break;
    case 'aim': {
      // (the dot crawling up him to his eyes: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      const d = dotOf(e)!, to = eyes(state), dx = to.x - d.x, dy = to.y - d.y, dist = Math.hypot(dx, dy) || 1, sp = Math.min(dist, 5.2);
      d.x += (dx / dist) * sp; d.y += (dy / dist) * sp;
      if (e.aiTimer! === 1) bark(state, e, vo, EXEC_ZAP, 0.3);
      if (e.aiTimer! > 54) { setState(e, 'lock'); playSound('beep', 0.4, 14); }
      break;
    }
    case 'lock': {
      // (stopped, blinking, a beep: move now)
      e.vel.x = 0;
      const d = dotOf(e)!;
      if (e.aiTimer! % 6 === 0) playSound('beep', 0.25, 20);
      if (e.aiTimer! > 18) {
        const p = state.player, hx = p.pos.x, hy = p.pos.y;
        if (p.health > 0 && !p.inCutscene && p.invincibilityTimer <= 0 && d.x > hx - 4 && d.x < hx + p.width + 4 && d.y > hy - 6 && d.y < hy + 34) {
          hurtPlayer(ctx, 10, 'm2:ct_laser_shot', { x: dirTo(e, pm.x) * 4, y: -3 });
          for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: d.x, y: d.y }, vel: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 }, life: 14, color: '#FF3B3B', size: 2 });
        }
        setState(e, 'after');
      }
      break;
    }
    case 'after':
      if (e.aiTimer! > 40) setState(e, 'near');
      break;
    case 'swatWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { if (strike(ctx, e, 44, 9, 'm2:ct_exec', 7)) playSound('slam', 0.5, 12); playSound('whoosh', 0.4, 6); setState(e, 'swat'); }
      break;
    case 'swat':
      if (e.aiTimer! > 24) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Pencil Pete

const pencil = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, STAFF_VOICES.pencil, STAFF_VOICES.pencilf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 260) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, PENCIL_BARK, 0.7); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      if (dx < 64 && level(state, e)) { setState(e, 'bumpWind'); e.vel.x = 0; break; }
      // (waddling: the costume's wide at the bottom)
      walkTo(ctx, e, pm.x, (state.frame + e.initialX) % 40 < 26 ? 1.2 : 0.4, 110);
      if (e.aiTimer! > 60 && dx < 330 && level(state, e, 90)) { setState(e, 'wind'); e.vel.x = 0; playSound('grind', 0.3, 10); }
      break;
    }
    case 'wind':
      // (rocking, winding up, shavings curling off the point: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 4 === 0) state.particles.push({ pos: { x: mid(e).x + (Math.random() - 0.5) * 10, y: e.pos.y + 6 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 24, color: e.aiTimer! % 8 ? '#D6A86A' : '#F2C94C', size: 3 });
      if (e.aiTimer! > 36) { setState(e, 'spin'); bark(state, e, vo, PENCIL_SPIN, 0.4); playSound('whirl', 0.7, 2); }
      break;
    case 'spin':
      e.vel.x = e.facing! * 6.4;
      if (e.aiTimer! % 3 === 0) state.particles.push({ pos: { x: mid(e).x - e.facing! * 16, y: e.pos.y + 20 + Math.random() * 60 }, vel: { x: -e.facing! * 2, y: -1 }, life: 20, color: ['#D6A86A', '#F2C94C', '#3F3F46'][e.aiTimer! % 3], size: 3 });
      if (e.aiTimer! % 10 === 0) playSound('whirl', 0.3, 6);
      if (strike(ctx, e, 6, 12, 'm2:ct_pencil', 10, -6, true)) { setState(e, 'dizzy'); e.vel.x = 0; playSound('thud', 0.8, 0); break; }
      if (e.aiTimer! > 52 || !safeAhead(ctx, e, e.facing!, 16)) { setState(e, 'dizzy'); e.vel.x = 0; }
      break;
    case 'dizzy':
      e.vel.x *= 0.8;
      if (e.aiTimer! > 70) setState(e, 'near');
      break;
    case 'bumpWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 16) { if (strike(ctx, e, 30, 10, 'm2:ct_pencil', 9, -5)) playSound('thud', 0.7, 4); setState(e, 'bump'); }
      break;
    case 'bump':
      if (e.aiTimer! > 26) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Studio security

const guard = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, STAFF_VOICES.guard, STAFF_VOICES.guardf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 260) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, GUARD_BARK, 0.65); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      if (dx < 66 && level(state, e)) { setState(e, 'raise'); e.vel.x = 0; break; }
      walkTo(ctx, e, pm.x, 1.0, 60);
      if (e.aiTimer! > 90 && dx > 140 && dx < 430 && level(state, e, 70)) { setState(e, 'whistle'); e.vel.x = 0; }
      break;
    }
    case 'whistle':
      // (the whistle in, cheeks out, a blast: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! === 8) { playSound('alert', 0.45, 18); bark(state, e, vo, GUARD_WHISTLE, 0.5); }
      if (e.aiTimer! > 32) { setState(e, 'rush'); playSound('whoosh', 0.6, -4); }
      break;
    case 'rush':
      e.vel.x = e.facing! * 5.2;
      if (e.aiTimer! % 10 === 0) playSound('stomp', 0.3, 0);
      if (strike(ctx, e, 18, 13, 'm2:ct_guard', 11, -6)) { setState(e, 'winded'); e.vel.x = 0; playSound('slam', 0.8, -2); break; }
      if (e.aiTimer! > 46 || !safeAhead(ctx, e, e.facing!, 16)) { setState(e, 'winded'); e.vel.x = 0; }
      break;
    case 'winded':
      // (hands on his knees, wheezing: his window)
      e.vel.x *= 0.75;
      if (e.aiTimer! > 80) setState(e, 'near');
      break;
    case 'raise':
      // (the flashlight up over his head: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 22) { if (strike(ctx, e, 50, 13, 'm2:ct_guard', 7, -5)) playSound('bonk', 0.7, -2); playSound('whoosh', 0.5, 0); setState(e, 'bonk'); }
      break;
    case 'bonk':
      if (e.aiTimer! > 28) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------

/** Out of aggro range: this far off, anybody after him gives up and goes back to standing about. */
const LEASH_X = 820, LEASH_Y = 440;
const leashed = (ai: (ctx: FrameContext, e: Enemy) => boolean) => (ctx: FrameContext, e: Enemy) => {
  if (e.aiState && e.aiState !== 'idle') {
    const p = mid(ctx.state.player), m = mid(e);
    if (Math.abs(p.x - m.x) > LEASH_X || Math.abs(p.y - m.y) > LEASH_Y) { setState(e, 'idle'); e.vel.x = 0; setDot(e, null); }
  }
  return ai(ctx, e);
};
type Reg = Parameters<typeof registerM2Kind>[0];
const person = (kind: `m2:ct_${string}`, stats: Reg['stats'], ai: (ctx: FrameContext, e: Enemy) => boolean, draw: (c: CanvasRenderingContext2D, e: Enemy, f: number, seed: number) => void, extra: Partial<Reg> = {}) =>
  registerM2Kind({ kind, stats, humanoid: true, gender, head: { x: 1, y: -66, r: 10 }, ai: leashed(ai), draw: (c, e, f) => draw(c, e, f, seedOf(e)), ...extra });

person('m2:ct_guide', { w: 36, h: 74, hp: 85, contact: 4, mass: 160 }, guide, drawGuide, { pointy: { source: 'm2:ct_flagpole', label: 'FLAGGED!', damage: 12 } });
person('m2:ct_intern', { w: 34, h: 72, hp: 60, contact: 4, mass: 150 }, intern, drawIntern);
person('m2:ct_exec', { w: 38, h: 76, hp: 95, contact: 4, mass: 175 }, exec, drawExec);
person('m2:ct_pencil', { w: 46, h: 112, hp: 240, contact: 6, mass: 300 }, pencil, drawPencil, { head: { x: 3, y: -78, r: 12 }, spiky: { source: 'm2:ct_pencil_point', label: 'LEADED!', damage: 14 } });
person('m2:ct_guard', { w: 44, h: 80, hp: 230, contact: 6, mass: 320 }, guard, drawGuard);
