// Thrones of the Stars' staff (Meathead 2's own kinds): they pile out of the staff doors at every stop to kill the
// line cutter. Seeded people in the ride's uniforms (men and women, any skin, build, hair). Escalating per stop
// (layout.ts WAVES): the ride ops first, then the janitors, then the docents and security.
//
//   rideop   a ride operator (the purple THRONES polo, khaki shorts, a visor, a whistle): the rusher. Comes on fast;
//            close, blows the whistle (the tell) and body-checks him across the platform.
//   janitor  a janitor in coveralls and yellow rubber gloves, a plunger (the lobber): keeps a few strides off, winds
//            the plunger back (the tell) and lobs it; it sticks to his face (stunned, plungered). Too close, a whack.
//   docent   a toilet docent (tweed, a bow tie, glasses, white gloves) with a brass pointer (the fencer): "AHEM", the
//            pointer up (the tell), a lunge. The pointer's out in front: charging into it hurts (pointy).
//   guard    throne security (black jacket, a flashlight and a baton; heavy): shines the flashlight in his eyes (the
//            tell: the beam), he's dazzled, then it rushes in with the baton.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { holdingOff, mid, safeAhead } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { speak } from '../section';
import { tick, setState, dirTo, seedOf, womanOf, sees, byPants } from '../blvd/kinds';
import type { ByPants } from '../blvd/lines';
import { coasterOf } from './state';
import { HURT, STAFF_VOICES, RIDEOP_BARK, JANITOR_BARK, DOCENT_BARK, GUARD_BARK } from './lines';
import { drawRideop, drawJanitor, drawDocent, drawGuard } from './kindArt';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

/** Can it go for him right now? */
const can = (state: GameState) => state.player.health > 0 && !holdingOff(state) && !state.player.inCutscene && !state.player.carried;
const hits = (state: GameState) => { const p = state.player; return p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && !p.carried; };

/** A bark over its head (rare; never on another, or over the PA). */
export const staffBark = (state: GameState, e: Enemy, voice: string, pool: ByPants, chance = 0.35) => {
  const o = coasterOf(state);
  if (o.ride.on || o.pa || o.paBusy || state.frame - o.barkAt < 200 || Math.random() > chance) return;
  o.barkAt = state.frame;
  speak(voice, pickLine(byPants(state, pool)), s => { if (s) o.barks.set(e, s); else o.barks.delete(e); }, false);
};
const voiceOf = (e: Enemy, m: string, f: string) => (womanOf(e) ? f : m);
/** Its lunge has landed (once a lunge). */
const landed = new WeakSet<Enemy>();

/** Walking at him (not off the edge, not into a wall), at `speed`; stopping `near` short. */
const toward = (ctx: FrameContext, e: Enemy, dx: number, speed: number, near = 40) => {
  e.facing = (dx < 0 ? -1 : 1) as 1 | -1;
  e.vel.x = Math.abs(dx) > near && safeAhead(ctx, e, e.facing) ? e.facing * speed : 0;
};

// ---------------------------------------------------------------------------------------------------------------
// The ride op: whistle, body check

const rideop = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  tick(e);
  e.leapCd = Math.max(0, (e.leapCd ?? 0) - 1);
  switch (e.aiState) {
    default:
      // (stood about till he's in sight: the station's gate; the stops' staff come out going for him)
      if (!sees(state, e, 560, 160)) { e.vel.x = 0; break; }
      setState(e, 'approach');
      staffBark(state, e, voiceOf(e, STAFF_VOICES.rideop, STAFF_VOICES.rideopf), RIDEOP_BARK, 0.5);
      break;
    case 'approach':
      toward(ctx, e, dx, 1.9, 30);
      if (can(state) && (e.leapCd ?? 0) <= 0 && Math.abs(dx) < 130 && Math.abs(dy) < 60) { setState(e, 'whistle'); e.vel.x = 0; playSound('beep', 0.45, 16); }
      break;
    case 'whistle':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer % 6 === 0) playSound('beep', 0.3, 18);
      if (e.aiTimer > 22) { setState(e, 'shove'); playSound('whoosh', 0.6, 4); }
      break;
    case 'shove': {
      const ok = safeAhead(ctx, e, e.facing!, 30);
      e.vel.x = ok ? e.facing! * 8.5 : 0;
      if (!landed.has(e) && Math.abs(dx) < 40 && Math.abs(dy) < 60 && hits(state)) { landed.add(e); hurtPlayer(ctx, 10, 'm2:hwc_rideop', { x: e.facing! * 9, y: -6 }, 20); playSound('thud', 0.8); }
      if (!ok || e.aiTimer > 14) { setState(e, 'recover'); landed.delete(e); }
      break;
    }
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 30) { setState(e, 'approach'); e.leapCd = 50; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The janitor: the plunger, lobbed (or a whack up close)

const throwPlunger = (state: GameState, e: Enemy, tx: number, ty: number) => {
  const x = e.pos.x + e.width / 2 + e.facing! * 14, y = e.pos.y + 14, t = 34;
  coasterOf(state).plungers.push({ x, y, vx: (tx - x) / t, vy: (ty - y - 0.5 * 0.3 * t * t) / t, t: 0, stuck: 0, rot: 0 });
  playSound('whoosh', 0.45, 2);
};
const janitor = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  tick(e);
  e.leapCd = Math.max(0, (e.leapCd ?? 0) - 1);
  switch (e.aiState) {
    default:
      // (stood about till he's in sight: the station's gate; the stops' staff come out going for him)
      if (!sees(state, e, 560, 160)) { e.vel.x = 0; break; }
      setState(e, 'approach'); e.leapCd = 40;
      staffBark(state, e, voiceOf(e, STAFF_VOICES.janitor, STAFF_VOICES.janitorf), JANITOR_BARK, 0.5);
      break;
    case 'approach': {
      e.facing = dirTo(e, p.x);
      const ad = Math.abs(dx);
      // (a few strides off: closer if he's far, back off a bit if he's close (not right up against him: a whack then))
      const want = ad > 330 ? e.facing : ad < 150 && ad > 80 ? -e.facing : 0;
      e.vel.x = want && safeAhead(ctx, e, want) ? want * 1.1 : 0;
      if (!can(state) || (e.leapCd ?? 0) > 0) break;
      if (ad < 80 && Math.abs(dy) < 60) { setState(e, 'raise'); e.vel.x = 0; }
      else if (ad > 120 && ad < 420 && Math.abs(dy) < 200) { setState(e, 'windup'); e.vel.x = 0; playSound('click', 0.3, -6); }
      break;
    }
    case 'windup':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 26) { throwPlunger(state, e, p.x, pl.pos.y + 8); setState(e, 'thrown'); }
      break;
    case 'thrown':
      e.vel.x = 0;
      if (e.aiTimer > 40) { setState(e, 'approach'); e.leapCd = 70; }
      break;
    case 'raise':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer === 18) {
        playSound('whoosh', 0.5, 0);
        if ((p.x - m.x) * e.facing! > -10 && Math.abs(dx) < 78 && Math.abs(dy) < 60 && hits(state)) { hurtPlayer(ctx, 12, 'm2:hwc_janitor', { x: e.facing! * 7, y: -5 }, 18); playSound('slam', 0.6); }
      }
      if (e.aiTimer > 40) { setState(e, 'approach'); e.leapCd = 50; }
      break;
  }
  return false;
};

/** The plungers in the air (and stuck where they landed): on his face, he's stunned a moment. */
export const updatePlungers = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, o = coasterOf(state);
  if (o.faceStuck > 0) o.faceStuck--;
  o.plungers = o.plungers.filter(s => {
    s.t++;
    if (s.stuck > 0) return --s.stuck > 0;
    s.vy += 0.3; s.x += s.vx; s.y += s.vy; s.rot += 0.25;
    if (p.health > 0 && s.x + 9 > p.pos.x && s.x - 9 < p.pos.x + p.width && s.y + 9 > p.pos.y && s.y - 9 < p.pos.y + p.height) {
      if (p.invincibilityTimer <= 0 && !p.inCutscene && !p.carried) {
        hurtPlayer(ctx, 8, 'm2:hwc_plunger', { x: Math.sign(s.vx || 1) * 3, y: -2 }, 16);
        state.playerStunTimer = Math.max(state.playerStunTimer, 40);
        o.faceStuck = 46;
        playSound('squish', 0.8); playSound('glug', 0.4, 6);
        return false;
      }
    }
    // (down on the floor (or a ledge): stuck there upright, a while)
    if (s.vy > 0 && state.blocks.some(b => b.type !== 'pit' && s.x > b.x && s.x < b.x + b.w && s.y + 10 > b.y && s.y + 10 - s.vy <= b.y + 2)) {
      const b = state.blocks.find(q => q.type !== 'pit' && s.x > q.x && s.x < q.x + q.w && s.y + 10 > q.y && s.y + 10 - s.vy <= q.y + 2)!;
      s.y = b.y - 10; s.vx = 0; s.vy = 0; s.stuck = 120; s.rot = 0;
      playSound('squish', 0.3, -4);
      return true;
    }
    return s.t < 200;
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The docent: AHEM, the pointer up, the lunge

const docent = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  tick(e);
  e.leapCd = Math.max(0, (e.leapCd ?? 0) - 1);
  switch (e.aiState) {
    default:
      // (stood about till he's in sight: the station's gate; the stops' staff come out going for him)
      if (!sees(state, e, 560, 160)) { e.vel.x = 0; break; }
      setState(e, 'approach');
      staffBark(state, e, voiceOf(e, STAFF_VOICES.docent, STAFF_VOICES.docentf), DOCENT_BARK, 0.55);
      break;
    case 'approach':
      toward(ctx, e, dx, 1.3, 60);
      if (can(state) && (e.leapCd ?? 0) <= 0 && Math.abs(dx) < 160 && Math.abs(dy) < 60) { setState(e, 'ahem'); e.vel.x = 0; playSound('click', 0.4, 10); }
      break;
    case 'ahem':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 26) { setState(e, 'lunge'); playSound('whoosh', 0.7, 10); }
      break;
    case 'lunge': {
      const ok = safeAhead(ctx, e, e.facing!, 30);
      e.vel.x = ok ? e.facing! * 9.5 : 0;
      // (the pointer's reach: well out in front of it)
      if (!landed.has(e) && (p.x - m.x) * e.facing! > 0 && Math.abs(dx) < 62 && Math.abs(dy) < 50 && hits(state)) { landed.add(e); hurtPlayer(ctx, 12, 'm2:hwc_docent', { x: e.facing! * 7, y: -4 }, 18); playSound('clink', 0.8); }
      if (!ok || e.aiTimer > 12) { setState(e, 'recover'); landed.delete(e); }
      break;
    }
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 40) { setState(e, 'approach'); e.leapCd = 60; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Security: the flashlight in his eyes, the rush, the baton

export const BEAM = 300;
const guard = (ctx: FrameContext, e: Enemy) => {
  const { state, fx } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  tick(e);
  e.leapCd = Math.max(0, (e.leapCd ?? 0) - 1);
  switch (e.aiState) {
    default:
      // (stood about till he's in sight: the station's gate; the stops' staff come out going for him)
      if (!sees(state, e, 560, 160)) { e.vel.x = 0; break; }
      setState(e, 'approach'); e.leapCd = 30;
      staffBark(state, e, voiceOf(e, STAFF_VOICES.guard, STAFF_VOICES.guardf), GUARD_BARK, 0.6);
      break;
    case 'approach': {
      toward(ctx, e, dx, 1.0, 50);
      if (!can(state) || (e.leapCd ?? 0) > 0) break;
      if (Math.abs(dx) < 64 && Math.abs(dy) < 60) { setState(e, 'swing'); e.vel.x = 0; }
      else if (Math.abs(dx) > 110 && Math.abs(dx) < BEAM && Math.abs(dy) < 80) { setState(e, 'aim'); e.vel.x = 0; playSound('click', 0.6, -2); }
      break;
    }
    case 'aim':
      // (the beam on him: the tell; at the end of it, if he's still in it, he's dazzled)
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 34) {
        if ((p.x - m.x) * e.facing! > 0 && Math.abs(dx) < BEAM && Math.abs(dy) < 70 && hits(state)) {
          state.playerStunTimer = Math.max(state.playerStunTimer, 36);
          fx.spawnDamageNumber({ x: state.player.pos.x, y: state.player.pos.y - 30 }, 'DAZZLED!', true, '#FEF9C3');
          playSound('ding', 0.5, 10);
        }
        setState(e, 'rush');
      }
      break;
    case 'rush':
      toward(ctx, e, dx, 2.7, 30);
      if (Math.abs(dx) < 60 && Math.abs(dy) < 60) { setState(e, 'swing'); e.vel.x = 0; }
      else if (e.aiTimer > 60) { setState(e, 'approach'); e.leapCd = 60; }
      break;
    case 'swing':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer === 16) {
        playSound('whoosh', 0.6, -4);
        if ((p.x - m.x) * e.facing! > -10 && Math.abs(dx) < 74 && Math.abs(dy) < 60 && hits(state)) { hurtPlayer(ctx, 14, 'm2:hwc_guard', { x: e.facing! * 8, y: -6 }, 20); playSound('punch', 0.9, -6); }
      }
      if (e.aiTimer > 40) { setState(e, 'approach'); e.leapCd = 110; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------

const personGender = (e: Enemy) => (womanOf(e) ? 'f' : 'm') as 'm' | 'f';
// (the stops' own helpStaff (index.ts) hops them over the plinths and off the catwalks: pathing: false)

registerM2Kind({
  kind: 'm2:hwc_rideop', stats: { w: 36, h: 72, hp: 140, contact: 5, mass: 170 }, humanoid: true, pathing: false, gender: personGender, head: { x: 1, y: -66, r: 10 },
  ai: rideop, draw: (c, e, f) => drawRideop(c, e, f, seedOf(e)),
});
registerM2Kind({
  kind: 'm2:hwc_janitor', stats: { w: 40, h: 74, hp: 120, contact: 5, mass: 210 }, humanoid: true, pathing: false, gender: personGender, head: { x: 1, y: -68, r: 10 },
  ai: janitor, draw: (c, e, f) => drawJanitor(c, e, f, seedOf(e)),
});
registerM2Kind({
  kind: 'm2:hwc_docent', stats: { w: 36, h: 74, hp: 150, contact: 5, mass: 170 }, humanoid: true, pathing: false, gender: personGender, head: { x: 1, y: -68, r: 10 },
  pointy: { source: 'm2:hwc_pointer', label: 'SKEWERED!', damage: 12 },
  ai: docent, draw: (c, e, f) => drawDocent(c, e, f, seedOf(e)),
});
registerM2Kind({
  kind: 'm2:hwc_guard', stats: { w: 44, h: 78, hp: 160, contact: 6, mass: 280 }, humanoid: true, pathing: false, gender: personGender, head: { x: 1, y: -72, r: 10 },
  ai: guard, draw: (c, e, f) => drawGuard(c, e, f, seedOf(e)),
});
