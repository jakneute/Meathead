// Disaster: The Ride's staff (Meathead 2's own kinds): seeded people in the ride's uniforms (men and women, any skin,
// build, hair), after the line cutter. Each alone first in the queue and the pre-show, then all of them in the theater.
//
//   usher   a theater usher (the red vest, the bow tie, the pillbox cap) with a queue stanchion (the brass post, the
//           velvet rope hanging off it): marches at him; close, hoists it overhead (the tell) and swings it, a wide arc
//           in front of them. Heavy, slow.
//   tech    an effects tech (black CREW tee, a headset) with a fog canister (the CO2 blaster for the wildfire and the
//           blizzard): keeps a few strides off, shakes the can (the tell: the hiss), then sprays a cone of freezing fog
//           that hurts and shoves him back.
//   twisty  TWISTY, the ride's mascot: somebody in a gray foam tornado costume, their face in the hole. Spins up (the
//           tell: turning in place, faster), then whirls at him, bowling over anyone in the way (staff too), and is
//           dizzy after (staggering: hit it then).

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { holdingOff, mid, safeAhead } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { hazardVictims, hazardHit, boxHits } from '../../hazardHit';
import { speak } from '../section';
import { tick, setState, dirTo, seedOf, womanOf, sees, byPants } from '../blvd/kinds';
import type { ByPants } from '../blvd/lines';
import { dzOf } from './state';
import { HURT, STAFF_VOICES, USHER_BARK, TECH_BARK, TWISTY_BARK } from './lines';
import { drawUsher, drawTech, drawTwisty } from './kindArt';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

const can = (state: GameState) => state.player.health > 0 && !holdingOff(state) && !state.player.inCutscene && !state.player.carried;
const hits = (state: GameState) => { const p = state.player; return p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && !p.carried; };
const voiceOf = (e: Enemy, m: string, f: string) => (womanOf(e) ? f : m);

/** A bark over its head (rare; never on another, or over the PA or the narrator). */
export const staffBark = (state: GameState, e: Enemy, voice: string, pool: ByPants, chance = 0.4) => {
  const o = dzOf(state);
  if (o.pa || o.paBusy || o.narr || state.frame - o.barkAt < 220 || Math.random() > chance) return;
  o.barkAt = state.frame;
  speak(voice, pickLine(byPants(state, pool)), s => { if (s) o.barks.set(e, s); else o.barks.delete(e); }, false);
};
const landed = new WeakSet<Enemy>();

/** Strolling about its patch till it sees him. */
const stroll = (ctx: FrameContext, e: Enemy, range = 50, speed = 0.5) => {
  const home = e.homeX ?? e.pos.x;
  e.facing ??= -1;
  if (Math.abs(e.pos.x - home) > range || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
  e.vel.x = e.facing * speed;
};

// ---------------------------------------------------------------------------------------------------------------
// The usher: the stanchion, hoisted and swung

export const STANCHION_REACH = 104;
const usher = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  tick(e);
  e.leapCd = Math.max(0, (e.leapCd ?? 0) - 1);
  switch (e.aiState) {
    default:
      stroll(ctx, e);
      if (e.aiTimer > 20 && sees(state, e, 520, 150)) { setState(e, 'march'); staffBark(state, e, voiceOf(e, STAFF_VOICES.usher, STAFF_VOICES.usherf), USHER_BARK, 0.5); }
      break;
    case 'march':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 70 && safeAhead(ctx, e, e.facing) ? e.facing * 1.15 : 0;
      if (can(state) && (e.leapCd ?? 0) <= 0 && Math.abs(dx) < STANCHION_REACH - 10 && Math.abs(dy) < 70) { setState(e, 'hoist'); e.vel.x = 0; playSound('clink', 0.4, -4); }
      if (!sees(state, e, 800, 300)) setState(e, 'stroll');
      break;
    case 'hoist':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 28) { setState(e, 'swing'); playSound('whoosh', 0.7, -6); }
      break;
    case 'swing':
      e.vel.x = 0;
      if (e.aiTimer === 6 && dx * e.facing! > -24 && Math.abs(dx) < STANCHION_REACH && Math.abs(dy) < 70 && hits(state)) {
        hurtPlayer(ctx, 13, 'm2:hwd_usher', { x: e.facing! * 9, y: -6 }, 20); playSound('clang', 0.7, 2);
      }
      if (e.aiTimer > 40) { setState(e, 'march'); e.leapCd = 40; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The tech: the fog canister, shaken and sprayed

export const FOG_REACH = 190;
/** The spray's cone in front of it (world box), while it sprays. */
export const fogCone = (e: Enemy) => {
  const nx = e.pos.x + e.width / 2 + e.facing! * 22, ny = e.pos.y + 34;
  return { x: e.facing! > 0 ? nx : nx - FOG_REACH, y: ny - 46, w: FOG_REACH, h: 92, nx, ny };
};
const tech = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  tick(e);
  e.leapCd = Math.max(0, (e.leapCd ?? 0) - 1);
  switch (e.aiState) {
    default:
      stroll(ctx, e);
      if (e.aiTimer > 20 && sees(state, e, 540, 200)) { setState(e, 'keep'); e.leapCd = 40; staffBark(state, e, voiceOf(e, STAFF_VOICES.tech, STAFF_VOICES.techf), TECH_BARK, 0.5); }
      break;
    case 'keep': {
      e.facing = dirTo(e, p.x);
      const ad = Math.abs(dx);
      const want = ad > 220 ? e.facing : ad < 110 ? -e.facing : 0;
      e.vel.x = want && safeAhead(ctx, e, want) ? want * 1.0 : 0;
      if (can(state) && (e.leapCd ?? 0) <= 0 && ad < FOG_REACH && Math.abs(dy) < 60) { setState(e, 'shake'); e.vel.x = 0; playSound('click', 0.4, 8); }
      if (!sees(state, e, 800, 300)) setState(e, 'stroll');
      break;
    }
    case 'shake':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer % 6 === 0) playSound('click', 0.25, 12);
      if (e.aiTimer > 30) { setState(e, 'spray'); playSound('whoosh', 0.8, 10); landed.delete(e); }
      break;
    case 'spray': {
      e.vel.x = 0;
      const cone = fogCone(e);
      if (state.frame % 2 === 0) for (let k = 0; k < 2; k++) state.particles.push({ pos: { x: cone.nx, y: cone.ny }, vel: { x: e.facing! * (4 + Math.random() * 4), y: (Math.random() - 0.5) * 2.4 }, life: 26, color: k ? '#E0F2FE' : '#F8FAFC', size: 4 + Math.random() * 5 });
      const inIt = pl.pos.x < cone.x + cone.w && pl.pos.x + pl.width > cone.x && pl.pos.y < cone.y + cone.h && pl.pos.y + pl.height > cone.y;
      if (inIt && pl.health > 0 && !pl.carried && !pl.inCutscene) {
        pl.vel.x += e.facing! * 0.45;
        if (!landed.has(e) && pl.invincibilityTimer <= 0) { landed.add(e); hurtPlayer(ctx, 8, 'm2:hwd_fog', { x: e.facing! * 6, y: -3 }, 18); }
      }
      if (e.aiTimer > 36) { setState(e, 'keep'); e.leapCd = 90; }
      break;
    }
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Twisty: spin up, whirl, dizzy

const twisty = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  tick(e);
  e.leapCd = Math.max(0, (e.leapCd ?? 0) - 1);
  switch (e.aiState) {
    default:
      stroll(ctx, e, 60, 0.7);
      if (e.aiTimer > 20 && sees(state, e, 560, 140)) { setState(e, 'waddle'); staffBark(state, e, voiceOf(e, STAFF_VOICES.twisty, STAFF_VOICES.twistyf), TWISTY_BARK, 0.6); }
      break;
    case 'waddle':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 60 && safeAhead(ctx, e, e.facing) ? e.facing * 0.9 : 0;
      if (can(state) && (e.leapCd ?? 0) <= 0 && Math.abs(dx) < 360 && Math.abs(dy) < 60) { setState(e, 'windup'); e.vel.x = 0; }
      if (!sees(state, e, 800, 300)) setState(e, 'stroll');
      break;
    case 'windup':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer % Math.max(3, 12 - (e.aiTimer >> 3)) === 0) playSound('whoosh', 0.25, 6 + (e.aiTimer >> 3));
      if (e.aiTimer > 40) { setState(e, 'spin'); landed.delete(e); playSound('whoosh', 0.9, 2); }
      break;
    case 'spin': {
      const ok = safeAhead(ctx, e, e.facing!, 40);
      e.vel.x = ok ? e.facing! * 5.5 : 0;
      if (e.aiTimer % 7 === 0) playSound('whoosh', 0.35, 8);
      if (!landed.has(e) && Math.abs(dx) < 46 && Math.abs(dy) < 60 && hits(state)) { landed.add(e); hurtPlayer(ctx, 12, 'm2:hwd_twisty', { x: e.facing! * 10, y: -7 }, 20); playSound('thud', 0.8); }
      // (anybody else in the way: bowled over)
      for (const o of hazardVictims(state)) if (o !== e && boxHits(o, e.pos.x - 6, e.pos.y + 10, e.width + 12, e.height - 10) && (o.hazardHitAt ?? -99) < state.frame - 30) {
        o.hazardHitAt = state.frame; hazardHit(ctx, o, 30, m.x, 'TWISTED!', { knock: 11 });
      }
      if (!ok || e.aiTimer > 70 || (dx * e.facing! < -140)) setState(e, 'dizzy');
      break;
    }
    case 'dizzy':
      // (staggering about, its head going round)
      e.vel.x = Math.sin(e.aiTimer * 0.2) * 0.8;
      if (!safeAhead(ctx, e, (e.vel.x < 0 ? -1 : 1) as 1 | -1)) e.vel.x = 0;
      if (e.aiTimer > 80) { e.homeX = e.pos.x; setState(e, 'waddle'); e.leapCd = 50; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------

const personGender = (e: Enemy) => (womanOf(e) ? 'f' : 'm') as 'm' | 'f';

registerM2Kind({
  kind: 'm2:hwd_usher', stats: { w: 40, h: 74, hp: 130, contact: 6, mass: 220 }, humanoid: true, gender: personGender, head: { x: 1, y: -68, r: 10 },
  ai: usher, draw: (c, e, f) => drawUsher(c, e, f, seedOf(e)),
});
registerM2Kind({
  kind: 'm2:hwd_tech', stats: { w: 36, h: 72, hp: 80, contact: 5, mass: 170 }, humanoid: true, gender: personGender, head: { x: 1, y: -66, r: 10 },
  ai: tech, draw: (c, e, f) => drawTech(c, e, f, seedOf(e)),
});
registerM2Kind({
  kind: 'm2:hwd_twisty', stats: { w: 50, h: 80, hp: 120, contact: 7, mass: 230 }, humanoid: true, gender: personGender, head: { x: 1, y: -66, r: 10 },
  ai: twisty, draw: (c, e, f) => drawTwisty(c, e, f, seedOf(e)),
});
