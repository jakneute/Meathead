// The film crew (Meathead 2's own kinds): the secret's out and it's his fault; every one of them on the set comes at
// him with whatever they had in their hands. Seeded people (men and women, any skin, build, hair). Each alone first,
// then mixed (layout.ts ENEMIES).
//
//   grip      a grip with a C-stand (the bruiser): walks him down; close, the stand up over its head (the tell), then
//             down on him.
//   boom      a boom operator (the reach): keeps a pole's length off; the boom up (the tell), then the mic swung down on
//             him out at the end of it. Up close it's useless: get in under it.
//   runner    a production assistant (a PA: headset, walkie, the coffee run): keeps off, the cup up (the tell), lobs it.
//   director  the director, with his megaphone: ACTION! (the megaphone up: the tell) and every one of his crew near him
//             speeds up a while; close, a whack with it. Kill him first.
//   craft     craft services (apron, hairnet): lobs the food off the table (a donut, a burrito, a slab of sheet cake).
//   mocap     a mocap stunt double in the dotted suit (the acrobat): quick; crouches (the tell) and flips at him.
//   stuntco   the stunt coordinator (the tough one): sets (the tell: GO!), then the diving tackle along the floor (jump
//             it); he's left lying there a moment after. Close, a punch.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { holdingOff, mid, safeAhead } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { speak } from '../section';
import { tick, setState, dirTo, seedOf, womanOf, sees, byPants } from '../blvd/kinds';
import type { ByPants } from '../blvd/lines';
import { whOf, type Shot } from './state';
import { HURT, CREW_VOICES as V, GRIP_BARK, BOOM_BARK, RUNNER_BARK, DIRECTOR_BARK, CRAFT_BARK, MOCAP_BARK, STUNTCO_BARK, ACTION } from './lines';
import { drawGrip, drawBoom, drawRunner, drawDirector, drawCraft, drawMocap, drawStuntco } from './kindArt';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

const can = (state: GameState) => state.player.health > 0 && !holdingOff(state) && !state.player.inCutscene && !state.player.carried;
export const hits = (state: GameState) => { const p = state.player; return p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && !p.carried; };
/** The director's ACTION! on it: quicker. */
const boost = (state: GameState, e: Enemy) => ((whOf(state).action.get(e) ?? -1) > state.frame ? 1.5 : 1);
/** Its cooldown, run down (faster under the director's ACTION!). */
const cool = (state: GameState, e: Enemy) => { e.leapCd = Math.max(0, (e.leapCd ?? 0) - boost(state, e)); };

/** A bark over its head (rare; never on top of another, or over the AD). */
export const crewBark = (state: GameState, e: Enemy, voice: string, pool: ByPants, chance = 0.4) => {
  const o = whOf(state);
  if (o.ad || o.adBusy || state.frame - o.barkAt < 200 || Math.random() > chance) return;
  o.barkAt = state.frame;
  speak(voice, pickLine(byPants(state, pool)), s => { if (s) o.barks.set(e, s); else o.barks.delete(e); }, false);
};
const vo = (e: Enemy, m: string, f: string) => (womanOf(e) ? f : m);

/** Walking at him (not off an edge), at `speed`; stopping `near` short. */
const toward = (ctx: FrameContext, e: Enemy, dx: number, speed: number, near = 40) => {
  e.facing = (dx < 0 ? -1 : 1) as 1 | -1;
  e.vel.x = Math.abs(dx) > near && safeAhead(ctx, e, e.facing) ? e.facing * speed : 0;
};
/** Keeping between `lo` and `hi` off him (back off if he's closer, come on if he's further). */
const keepOff = (ctx: FrameContext, e: Enemy, dx: number, lo: number, hi: number, speed: number) => {
  e.facing = (dx < 0 ? -1 : 1) as 1 | -1;
  const ad = Math.abs(dx), want = ad > hi ? e.facing : ad < lo ? -e.facing : 0;
  e.vel.x = want && safeAhead(ctx, e, want) ? want * speed : 0;
};
/** In front of it, within `reach`, about level. */
const inFront = (e: Enemy, px: number, py: number, reach: number, lo = -10, dy = 60) => {
  const m = mid(e), ahead = (px - m.x) * (e.facing ?? 1);
  return ahead > lo && ahead < reach && Math.abs(py - m.y) < dy;
};
/** Stood about till he's in sight; then on (a bark). */
const spot = (state: GameState, e: Enemy, voice: string, pool: ByPants, rx = 560, ry = 180) => {
  if (!sees(state, e, rx, ry)) { e.vel.x = 0; return false; }
  setState(e, 'approach'); e.leapCd = 30;
  crewBark(state, e, voice, pool, 0.5);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Thrown things (the coffee, the food; the cast's props and silly string go through here too)

const G = 0.3;
/** Throws something at (tx, ty): lobbed (an arc landing there in about `t` frames) or flat. */
export const throwShot = (state: GameState, from: Enemy, kind: Shot['kind'], look: number, tx: number, ty: number, lob: boolean, speed = 7) => {
  const x = from.pos.x + from.width / 2 + (from.facing ?? 1) * 16, y = from.pos.y + 20;
  if (lob) {
    const t = Math.max(22, Math.min(46, Math.abs(tx - x) / 7));
    whOf(state).shots.push({ x, y, vx: (tx - x) / t, vy: (ty - y - 0.5 * G * t * t) / t, t: 0, rot: 0, kind, look, lob, from });
  } else {
    const d = Math.hypot(tx - x, ty - y) || 1;
    whOf(state).shots.push({ x, y, vx: ((tx - x) / d) * speed, vy: ((ty - y) / d) * speed, t: 0, rot: 0, kind, look, lob, from });
  }
  playSound('whoosh', 0.4, kind === 'string' ? 14 : 4);
};
const SHOT_HURT: Record<Shot['kind'], { dmg: number; src: string; col: string[] }> = {
  coffee: { dmg: 7, src: 'm2:hww_coffee', col: ['#78350F', '#92400E', '#FEF3C7'] },
  food: { dmg: 6, src: 'm2:hww_food', col: ['#F9A8D4', '#FDE68A', '#FEF3C7'] },
  prop: { dmg: 6, src: 'm2:hww_prop', col: ['#A1A1AA', '#FDE047', '#DC2626'] },
  string: { dmg: 4, src: 'm2:hww_string', col: ['#F472B6', '#A3E635', '#F9A8D4'] },
};
/** Everything in the air: on him (hurt; silly string sticks him a moment), or splatted where it lands. */
export const updateShots = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, o = whOf(state);
  if (o.stuck > 0) { o.stuck--; if (o.stuck > 0 && p.isGrounded) p.vel.x *= 0.5; }
  const splat = (s: Shot, n: number) => { const h = SHOT_HURT[s.kind]; for (let i = 0; i < n; i++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 16 + Math.random() * 10, color: h.col[i % h.col.length], size: 2 + Math.random() * 3, grav: 0.3 }); };
  o.shots = o.shots.filter(s => {
    s.t++;
    if (s.lob) s.vy += G;
    s.x += s.vx; s.y += s.vy; s.rot += s.kind === 'prop' ? 0.35 : 0.15;
    if (p.health > 0 && s.x + 9 > p.pos.x && s.x - 9 < p.pos.x + p.width && s.y + 9 > p.pos.y && s.y - 9 < p.pos.y + p.height) {
      if (p.invincibilityTimer <= 0 && !p.inCutscene && !p.carried) {
        const h = SHOT_HURT[s.kind];
        hurtPlayer(ctx, h.dmg, h.src, { x: Math.sign(s.vx || 1) * 4, y: -3 }, 16);
        if (s.kind === 'string') { o.stuck = 60; state.playerStunTimer = Math.max(state.playerStunTimer, 24); ctx.fx.spawnDamageNumber({ x: p.pos.x, y: p.pos.y - 30 }, 'STUCK!', true, '#F9A8D4'); }
        playSound(s.kind === 'coffee' ? 'splash' : s.kind === 'prop' ? 'boing' : 'splat', 0.7, 4);
        splat(s, 10);
        return false;
      }
    }
    // (down on something: splatted, or (a prop) bounced off and clattered)
    if (s.vy > 0 && state.blocks.some(b => b.type !== 'pit' && s.x > b.x && s.x < b.x + b.w && s.y + 6 > b.y && s.y + 6 - s.vy <= b.y + 2)) {
      playSound(s.kind === 'prop' ? 'clink' : 'splat', 0.35, 6);
      splat(s, 6);
      return false;
    }
    return s.t < 220;
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The grip: the C-stand up, and down

const grip = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x, dy = p.y - m.y, b = boost(state, e);
  tick(e); cool(state, e);
  switch (e.aiState) {
    default: spot(state, e, vo(e, V.grip, V.gripf), GRIP_BARK); break;
    case 'approach':
      toward(ctx, e, dx, 1.0 * b, 50);
      if (can(state) && (e.leapCd ?? 0) <= 0 && Math.abs(dx) < 100 && Math.abs(dy) < 60) { setState(e, 'raise'); e.vel.x = 0; playSound('clink', 0.4, -4); }
      break;
    case 'raise':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 28 / b) { setState(e, 'slam'); playSound('whoosh', 0.7, -6); }
      break;
    case 'slam':
      e.vel.x = 0;
      if (e.aiTimer === 3) {
        if (inFront(e, p.x, p.y, 106) && hits(state)) { hurtPlayer(ctx, 13, 'm2:hww_grip', { x: e.facing! * 8, y: -7 }, 22); shakeScreen(state, 6, 3); }
        playSound('clang', 0.7, -6);
      }
      if (e.aiTimer > 12) setState(e, 'recover');
      break;
    case 'recover':
      if (e.aiTimer > 40 / b) { setState(e, 'approach'); e.leapCd = 40; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The boom op: a pole's length off; the mic swung down on him

export const BOOM_REACH = 230;
const boom = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x, dy = p.y - m.y, b = boost(state, e);
  tick(e); cool(state, e);
  switch (e.aiState) {
    default: spot(state, e, vo(e, V.boom, V.boomf), BOOM_BARK); break;
    case 'approach': {
      keepOff(ctx, e, dx, 130, 210, 1.2 * b);
      const ad = Math.abs(dx);
      if (can(state) && (e.leapCd ?? 0) <= 0 && ad > 70 && ad < BOOM_REACH && Math.abs(dy) < 130) { setState(e, 'raise'); e.vel.x = 0; }
      break;
    }
    case 'raise':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 30 / b) { setState(e, 'swing'); playSound('whoosh', 0.7, -2); }
      break;
    case 'swing':
      e.vel.x = 0;
      if (e.aiTimer === 6) {
        // (the mic, out at the end of the pole: it's the end that comes down, not the pole by its feet)
        if (inFront(e, p.x, p.y, BOOM_REACH + 20, 46, 110) && hits(state)) { hurtPlayer(ctx, 9, 'm2:hww_boom', { x: e.facing! * 5, y: -4 }, 18); playSound('thud', 0.8); }
      }
      if (e.aiTimer > 26) setState(e, 'recover');
      break;
    case 'recover':
      if (e.aiTimer > 36 / b) { setState(e, 'approach'); e.leapCd = 60; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The runner (a PA): the coffee, lobbed

const runner = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x, dy = p.y - m.y, b = boost(state, e);
  tick(e); cool(state, e);
  switch (e.aiState) {
    default: spot(state, e, vo(e, V.runner, V.runnerf), RUNNER_BARK); break;
    case 'approach':
      keepOff(ctx, e, dx, 140, 260, 1.8 * b);
      if (can(state) && (e.leapCd ?? 0) <= 0 && Math.abs(dx) < 340 && Math.abs(dy) < 180) { setState(e, 'aim'); e.vel.x = 0; }
      break;
    case 'aim':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 22 / b) { throwShot(state, e, 'coffee', 0, p.x + pl.vel.x * 10, pl.pos.y + 10, true); setState(e, 'thrown'); }
      break;
    case 'thrown':
      e.vel.x = 0;
      if (e.aiTimer > 30) { setState(e, 'approach'); e.leapCd = 90; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The director: ACTION! (his crew quicker), the megaphone up close

const ACTION_REACH = 620, ACTION_FOR = 300;
const director = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  tick(e); cool(state, e);
  e.shootTimer = Math.max(0, (e.shootTimer ?? 0) - 1);
  switch (e.aiState) {
    default: if (spot(state, e, vo(e, V.director, V.directorf), DIRECTOR_BARK)) e.shootTimer = 20; break;
    case 'approach':
      toward(ctx, e, dx, 0.8, 60);
      if (!can(state)) break;
      if ((e.shootTimer ?? 0) <= 0) { setState(e, 'action'); e.vel.x = 0; playSound('beep', 0.4, -4); }
      else if ((e.leapCd ?? 0) <= 0 && Math.abs(dx) < 70 && Math.abs(dy) < 60) { setState(e, 'whack'); e.vel.x = 0; }
      break;
    case 'action':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer === 30) {
        // ACTION!: everybody of his near him, quicker a while
        const o = whOf(state);
        for (const c of state.enemies) if (c !== e && c.health > 0 && c.kind?.startsWith('m2:hww_') && c.kind !== 'm2:hww_actor' && Math.abs(c.pos.x - e.pos.x) < ACTION_REACH) {
          o.action.set(c, state.frame + ACTION_FOR);
          ctx.fx.spawnDamageNumber({ x: c.pos.x, y: c.pos.y - 24 }, 'ACTION!', true, '#FDE047');
        }
        playSound('alert', 0.6, 2);
        if (!o.ad && !o.adBusy) speak(vo(e, V.director, V.directorf), pickLine(byPants(state, ACTION)), s => { if (s) o.barks.set(e, s); else o.barks.delete(e); }, false);
        e.shootTimer = 420;
      }
      if (e.aiTimer > 46) setState(e, 'approach');
      break;
    case 'whack':
      e.vel.x = 0;
      if (e.aiTimer === 18) { playSound('whoosh', 0.5, 2); if (inFront(e, p.x, p.y, 78) && hits(state)) { hurtPlayer(ctx, 8, 'm2:hww_director', { x: e.facing! * 6, y: -4 }, 18); playSound('clang', 0.6, 8); } }
      if (e.aiTimer > 40) { setState(e, 'approach'); e.leapCd = 60; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Craft services: the food, lobbed

const craft = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x, dy = p.y - m.y, b = boost(state, e);
  tick(e); cool(state, e);
  switch (e.aiState) {
    default: spot(state, e, vo(e, V.craft, V.craftf), CRAFT_BARK); break;
    case 'approach':
      keepOff(ctx, e, dx, 170, 300, 1.0 * b);
      if (can(state) && (e.leapCd ?? 0) <= 0 && Math.abs(dx) < 380 && Math.abs(dy) < 220) { setState(e, 'windup'); e.vel.x = 0; }
      break;
    case 'windup':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 26 / b) { throwShot(state, e, 'food', (seedOf(e) + state.frame) % 3, p.x + pl.vel.x * 8, pl.pos.y + 14, true); setState(e, 'thrown'); }
      break;
    case 'thrown':
      e.vel.x = 0;
      if (e.aiTimer > 30) { setState(e, 'approach'); e.leapCd = 80; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The mocap double: quick, the flip at him

const mocap = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x, dy = p.y - m.y, b = boost(state, e);
  tick(e); cool(state, e);
  switch (e.aiState) {
    default: spot(state, e, vo(e, V.mocap, V.mocapf), MOCAP_BARK); break;
    // (back down from a flip: a beat, then on)
    case 'flip': setState(e, 'recover'); e.vel.x = 0; break;
    case 'approach': {
      toward(ctx, e, dx, 2.0 * b, 36);
      const ad = Math.abs(dx);
      if (!can(state) || (e.leapCd ?? 0) > 0) break;
      if (ad < 52 && Math.abs(dy) < 60) { setState(e, 'kick'); e.vel.x = 0; }
      else if (ad > 120 && ad < 300 && dy > -170 && dy < 60) { setState(e, 'crouch'); e.vel.x = 0; }
      break;
    }
    case 'crouch':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 16 / b) {
        // (off the floor at him: the engine carries it through the air and down)
        setState(e, 'flip');
        e.vel.y = -9 + Math.min(0, dy) * 0.03; e.vel.x = Math.max(-7, Math.min(7, dx / 30));
        playSound('jump', 0.5, 6);
      }
      break;
    case 'kick':
      e.vel.x = 0;
      if (e.aiTimer === 10) { playSound('whoosh', 0.5, 10); if (inFront(e, p.x, p.y, 64) && hits(state)) hurtPlayer(ctx, 9, 'm2:hww_mocap', { x: e.facing! * 7, y: -5 }, 18); }
      if (e.aiTimer > 24) { setState(e, 'approach'); e.leapCd = 40; }
      break;
    case 'recover':
      e.vel.x = 0;
      if (e.aiTimer > 24 / b) { setState(e, 'approach'); e.leapCd = 60; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The stunt coordinator: set, the diving tackle, left lying there

const landed = new WeakSet<Enemy>();
const stuntco = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x, dy = p.y - m.y, b = boost(state, e);
  tick(e); cool(state, e);
  switch (e.aiState) {
    default: spot(state, e, vo(e, V.stuntco, V.stuntcof), STUNTCO_BARK); break;
    case 'approach': {
      toward(ctx, e, dx, 1.5 * b, 50);
      const ad = Math.abs(dx);
      if (!can(state) || (e.leapCd ?? 0) > 0) break;
      if (ad < 64 && Math.abs(dy) < 60) { setState(e, 'punch'); e.vel.x = 0; }
      else if (ad > 110 && ad < 330 && Math.abs(dy) < 50) { setState(e, 'set'); e.vel.x = 0; playSound('beep', 0.4, 10); }
      break;
    }
    case 'set':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 24 / b) { setState(e, 'tackle'); playSound('whoosh', 0.9, -4); landed.delete(e); }
      break;
    case 'tackle': {
      const ok = safeAhead(ctx, e, e.facing!, 30);
      e.vel.x = ok ? e.facing! * 9 : 0;
      if (!landed.has(e) && Math.abs(dx) < 46 && Math.abs(dy) < 50 && hits(state)) { landed.add(e); hurtPlayer(ctx, 12, 'm2:hww_stuntco', { x: e.facing! * 9, y: -6 }, 22); playSound('thud', 0.9); }
      if (!ok || e.aiTimer > 22) { setState(e, 'prone'); playSound('thud', 0.5, -6); }
      break;
    }
    case 'prone':
      e.vel.x *= 0.85;
      if (e.aiTimer > 46) { setState(e, 'approach'); e.leapCd = 70; }
      break;
    case 'punch':
      e.vel.x = 0;
      if (e.aiTimer === 14) { playSound('whoosh', 0.5, 4); if (inFront(e, p.x, p.y, 70) && hits(state)) { hurtPlayer(ctx, 9, 'm2:hww_stuntco', { x: e.facing! * 7, y: -5 }, 18); playSound('punch', 0.7); } }
      if (e.aiTimer > 32) { setState(e, 'approach'); e.leapCd = 40; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------

const personGender = (e: Enemy) => (womanOf(e) ? 'f' : 'm') as 'm' | 'f';
const H = (y: number) => ({ x: 1, y, r: 10 });

registerM2Kind({ kind: 'm2:hww_grip', stats: { w: 42, h: 76, hp: 160, contact: 7, mass: 270 }, humanoid: true, gender: personGender, head: H(-70), ai: grip, draw: (c, e, f) => drawGrip(c, e, f, seedOf(e)) });
registerM2Kind({ kind: 'm2:hww_boom', stats: { w: 36, h: 74, hp: 80, contact: 5, mass: 180 }, humanoid: true, gender: personGender, head: H(-68), ai: boom, draw: (c, e, f) => drawBoom(c, e, f, seedOf(e)) });
registerM2Kind({ kind: 'm2:hww_runner', stats: { w: 34, h: 72, hp: 50, contact: 5, mass: 160 }, humanoid: true, gender: personGender, head: H(-66), ai: runner, draw: (c, e, f) => drawRunner(c, e, f, seedOf(e)) });
registerM2Kind({ kind: 'm2:hww_director', stats: { w: 40, h: 74, hp: 130, contact: 5, mass: 210 }, humanoid: true, gender: personGender, head: H(-68), ai: director, draw: (c, e, f, s) => drawDirector(c, e, f, seedOf(e), (whOf(s).action.get(e) ?? -1) > s.frame) });
registerM2Kind({ kind: 'm2:hww_craft', stats: { w: 40, h: 72, hp: 70, contact: 5, mass: 200 }, humanoid: true, gender: personGender, head: H(-66), ai: craft, draw: (c, e, f) => drawCraft(c, e, f, seedOf(e)) });
registerM2Kind({ kind: 'm2:hww_mocap', stats: { w: 34, h: 72, hp: 60, contact: 7, mass: 160 }, humanoid: true, gender: personGender, head: H(-66), ai: mocap, draw: (c, e, f) => drawMocap(c, e, f, seedOf(e)) });
registerM2Kind({ kind: 'm2:hww_stuntco', stats: { w: 42, h: 76, hp: 150, contact: 7, mass: 250 }, humanoid: true, gender: personGender, head: H(-70), ai: stuntco, draw: (c, e, f) => drawStuntco(c, e, f, seedOf(e)) });

/** The crew sped up by the director's ACTION! (the "!" over them, drawn by index.ts). */
export const actionOn = (state: GameState, e: Enemy) => boost(state, e) > 1;
