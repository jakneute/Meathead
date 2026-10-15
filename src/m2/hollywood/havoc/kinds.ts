// The havoc's people (Meathead 2's own kinds): seeded (men and women, any skin, build, hair), every one of them as
// exposed to the disasters as he is (the lava, the flood, the tornado, the avalanches, what falls and what's thrown all
// get them too). Each alone first on the street, then mixed (layout.ts).
//
//   looter  a guest turned looter, arms full of the gift shop (a plush, a fanny pack, a shopping bag): keeps a few
//           strides off, raises the loot over their head (the tell) and lobs it (a snow globe, a REVENGERS mug, a
//           plush with a rock in it) in an arc at him.
//   crew    the park's STORM CREW in a yellow slicker, a backpack leaf blower against the end of the world: closes in,
//           revs it (the tell: the smoke, the whine), then blows: a long gust in front that shoves him back hard (into
//           the lava, into the tornado: that's the danger) and stings a little.
//   poppy   POPPY, the park's popcorn-bucket mascot (somebody in the foam bucket, their face in the hole), gone feral:
//           hops at him; crouches (the tell: the kernels popping off the top) and leaps, slamming down where he was
//           (CLAP of butter: anybody close gets it), then sits there dazed a moment (hit it then).

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { holdingOff, mid, safeAhead } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { hazardVictims, hazardHit, boxHits } from '../../hazardHit';
import { speak } from '../section';
import { tick, setState, dirTo, seedOf, womanOf, sees, byPants } from '../blvd/kinds';
import { outOf } from '../blvd/state';
import type { ByPants } from '../blvd/lines';
import { hvOf } from './state';
import { HURT, HAVOC_VOICES, LOOTER_BARK, CREW_BARK, POPPY_BARK } from './lines';
import { drawLooter, drawCrew, drawPoppy } from './kindArt';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

const can = (state: GameState) => state.player.health > 0 && !holdingOff(state) && !state.player.inCutscene && !state.player.carried;
const hits = (state: GameState) => { const p = state.player; return p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene; };
const voiceOf = (e: Enemy, m: string, f: string) => (womanOf(e) ? f : m);

/** A bark over its head (rare; never on another, or over the PA or the narrator): the outdoors' own barks, drawn by
 *  the havoc's drawFront. */
export const havocBark = (state: GameState, e: Enemy, voice: string, pool: ByPants, chance = 0.4) => {
  const o = outOf(state), hv = hvOf(state);
  if (o.pa || o.paBusy || hv.narr || state.frame - Math.max(o.barkAt, hv.barkAt) < 240 || Math.random() > chance) return;
  o.barkAt = state.frame; hv.barkAt = state.frame;
  speak(voice, pickLine(byPants(state, pool)), s => { if (s) o.barks.set(e, s); else o.barks.delete(e); }, false);
};

/** Strolling about its patch till it sees him. */
const stroll = (ctx: FrameContext, e: Enemy, range = 50, speed = 0.6) => {
  const home = e.homeX ?? e.pos.x;
  e.facing ??= -1;
  if (Math.abs(e.pos.x - home) > range || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
  e.vel.x = e.facing * speed;
};

// ---------------------------------------------------------------------------------------------------------------
// The looter: keeps off, lobs the loot

const looter = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  tick(e);
  e.leapCd = Math.max(0, (e.leapCd ?? 0) - 1);
  switch (e.aiState) {
    default:
      stroll(ctx, e, 60, 0.7);
      if (e.aiTimer > 20 && sees(state, e, 560, 240)) { setState(e, 'keep'); e.leapCd = 50 + (seedOf(e) % 40); havocBark(state, e, voiceOf(e, HAVOC_VOICES.looter, HAVOC_VOICES.looterf), LOOTER_BARK, 0.5); }
      break;
    case 'keep': {
      e.facing = dirTo(e, p.x);
      const ad = Math.abs(dx);
      const want = ad > 320 ? e.facing : ad < 170 ? -e.facing : 0;
      e.vel.x = want && safeAhead(ctx, e, want) ? want * 1.2 : 0;
      if (can(state) && (e.leapCd ?? 0) <= 0 && ad < 460 && Math.abs(dy) < 260) { setState(e, 'wind'); e.vel.x = 0; playSound('whoosh', 0.25, 10); }
      if (!sees(state, e, 900, 400)) setState(e, 'stroll');
      break;
    }
    case 'wind':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 26) {
        // (the lob: an arc that comes down about where he's going)
        const hv = hvOf(state), T = 44, sx = m.x + e.facing * 10, sy = e.pos.y + 6;
        const tx = p.x + pl.vel.x * 18, ty = pl.pos.y + pl.height - 30, g = 0.35;
        const kinds = ['globe', 'mug', 'plush'] as const;
        hv.lobs.push({ x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy - 0.5 * g * T * T) / T, kind: kinds[(seedOf(e) + e.aiTimer + state.frame) % 3], rot: 0, dead: false });
        playSound('whoosh', 0.5, 6);
        setState(e, 'toss');
      }
      break;
    case 'toss':
      e.vel.x = 0;
      if (e.aiTimer > 30) { setState(e, 'keep'); e.leapCd = 80 + (seedOf(e) % 50); }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The storm crew: the leaf blower, revved and let rip

export const BLOW_REACH = 250;
/** The blower's gust in front of it (world box), while it blows. */
export const blowCone = (e: Enemy) => {
  const nx = e.pos.x + e.width / 2 + e.facing! * 30, ny = e.pos.y + 40;
  return { x: e.facing! > 0 ? nx : nx - BLOW_REACH, y: ny - 44, w: BLOW_REACH, h: 84, nx, ny };
};
const stung = new WeakSet<Enemy>();
const crew = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  tick(e);
  e.leapCd = Math.max(0, (e.leapCd ?? 0) - 1);
  switch (e.aiState) {
    default:
      stroll(ctx, e);
      if (e.aiTimer > 20 && sees(state, e, 540, 200)) { setState(e, 'close'); e.leapCd = 40; havocBark(state, e, voiceOf(e, HAVOC_VOICES.crew, HAVOC_VOICES.crewf), CREW_BARK, 0.5); }
      break;
    case 'close': {
      e.facing = dirTo(e, p.x);
      const ad = Math.abs(dx);
      const want = ad > 200 ? e.facing : ad < 90 ? -e.facing : 0;
      e.vel.x = want && safeAhead(ctx, e, want) ? want * 1.1 : 0;
      if (can(state) && (e.leapCd ?? 0) <= 0 && ad < BLOW_REACH - 20 && Math.abs(dy) < 60) { setState(e, 'rev'); e.vel.x = 0; playSound('engine', 0.35, 8); }
      if (!sees(state, e, 800, 300)) setState(e, 'stroll');
      break;
    }
    case 'rev':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer % 6 === 0) state.particles.push({ pos: { x: m.x - e.facing * 14, y: e.pos.y + 20 }, vel: { x: -e.facing * 0.6, y: -1.2 }, life: 30, color: 'rgba(120, 113, 108, 0.6)', size: 5 });
      if (e.aiTimer % 8 === 0) playSound('engine', 0.2, 12);
      if (e.aiTimer > 32) { setState(e, 'blow'); playSound('whoosh', 0.9, -2); stung.delete(e); }
      break;
    case 'blow': {
      e.vel.x = 0;
      const cone = blowCone(e);
      if (state.frame % 2 === 0) for (let k = 0; k < 2; k++) state.particles.push({ pos: { x: cone.nx, y: cone.ny + (Math.random() - 0.5) * 20 }, vel: { x: e.facing! * (7 + Math.random() * 5), y: (Math.random() - 0.5) * 2 }, life: 24, color: k ? '#D6D3D1' : (Math.random() < 0.5 ? '#B45309' : '#A3E635'), size: 2 + Math.random() * 3 });
      if (e.aiTimer % 7 === 0) playSound('whoosh', 0.3, 10);
      const inIt = pl.pos.x < cone.x + cone.w && pl.pos.x + pl.width > cone.x && pl.pos.y < cone.y + cone.h && pl.pos.y + pl.height > cone.y;
      if (inIt && pl.health > 0 && !pl.carried && !pl.inCutscene) {
        pl.vel.x += e.facing! * 0.45;
        if (!stung.has(e) && pl.invincibilityTimer <= 0) { stung.add(e); hurtPlayer(ctx, 6, 'm2:hwh_blower', { x: e.facing! * 7, y: -3 }, 14); }
      }
      // (anybody else in the gust: shoved too)
      for (const o of hazardVictims(state)) if (o !== e && boxHits(o, cone.x, cone.y, cone.w, cone.h)) o.vel.x += e.facing! * 0.3;
      if (e.aiTimer > 54) { setState(e, 'close'); e.leapCd = 100; }
      break;
    }
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Poppy: hop, crouch, leap, slam, dazed

const POPPY_SLAM = 74;
const poppy = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  tick(e);
  e.leapCd = Math.max(0, (e.leapCd ?? 0) - 1);
  const grounded = e.vel.y === 0;
  switch (e.aiState) {
    default:
      stroll(ctx, e, 60, 0.8);
      if (e.aiTimer > 20 && sees(state, e, 560, 200)) { setState(e, 'hop'); havocBark(state, e, voiceOf(e, HAVOC_VOICES.poppy, HAVOC_VOICES.poppyf), POPPY_BARK, 0.6); }
      break;
    case 'hop':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 60 && safeAhead(ctx, e, e.facing) ? e.facing * 1.4 : 0;
      // (a little hop every so often, as it goes)
      if (grounded && e.aiTimer % 30 === 0) e.vel.y = -4;
      if (grounded && can(state) && (e.leapCd ?? 0) <= 0 && Math.abs(dx) < 300 && Math.abs(dy) < 120) { setState(e, 'crouch'); e.vel.x = 0; }
      if (!sees(state, e, 800, 300)) setState(e, 'stroll');
      break;
    case 'crouch':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer % 5 === 0) { playSound('click', 0.3, 14); state.particles.push({ pos: { x: m.x + (Math.random() - 0.5) * 30, y: e.pos.y }, vel: { x: (Math.random() - 0.5) * 3, y: -3 - Math.random() * 2 }, life: 30, color: '#FEF9C3', size: 4, grav: 0.3 }); }
      if (e.aiTimer > 30) {
        // (the leap: about where he is, not past a hazard's edge: it looks before it leaps)
        const lx = Math.max(-7, Math.min(7, dx / 38));
        e.vel.x = safeAhead(ctx, e, e.facing!, Math.abs(lx) * 38) ? lx : 0;
        e.vel.y = -11; playSound('jump', 0.7, -4);
        setState(e, 'leap');
      }
      break;
    case 'leap':
      if (e.aiTimer > 6 && grounded) {
        // (the slam: anybody close gets it, him and them)
        playSound('slam', 0.9, -6); playSound('clap', 0.6, -4); shakeScreen(state, 6, 3);
        for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: m.x, y: e.pos.y + e.height - 6 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 5 }, life: 36, color: k % 3 ? '#FEF9C3' : '#FACC15', size: 3 + Math.random() * 2, grav: 0.35 });
        if (Math.abs(dx) < POPPY_SLAM && Math.abs(dy) < 70 && hits(state)) hurtPlayer(ctx, 14, 'm2:hwh_poppy', { x: Math.sign(dx || 1) * 9, y: -7 }, 22);
        for (const o of hazardVictims(state)) if (o !== e && Math.abs(mid(o).x - m.x) < POPPY_SLAM && Math.abs(mid(o).y - m.y) < 70 && state.frame - (hvOf(state).hitAt.get(o) ?? -99) > 30) { hvOf(state).hitAt.set(o, state.frame); hazardHit(ctx, o, 30, m.x, 'BUTTERED!', { knock: 8 }); }
        e.vel.x = 0;
        setState(e, 'dazed');
      }
      break;
    case 'dazed':
      e.vel.x = 0;
      if (e.aiTimer > 48) { setState(e, 'hop'); e.leapCd = 70; e.homeX = e.pos.x; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------

const personGender = (e: Enemy) => (womanOf(e) ? 'f' : 'm') as 'm' | 'f';

registerM2Kind({
  kind: 'm2:hwh_looter', stats: { w: 38, h: 72, hp: 120, contact: 6, mass: 180 }, humanoid: true, gender: personGender, head: { x: 1, y: -66, r: 10 },
  ai: looter, draw: (c, e, f) => drawLooter(c, e, f, seedOf(e)),
});
registerM2Kind({
  kind: 'm2:hwh_crew', stats: { w: 40, h: 74, hp: 90, contact: 6, mass: 210 }, humanoid: true, gender: personGender, head: { x: 1, y: -68, r: 10 },
  ai: crew, draw: (c, e, f) => drawCrew(c, e, f, seedOf(e)),
});
registerM2Kind({
  kind: 'm2:hwh_poppy', stats: { w: 50, h: 82, hp: 160, contact: 8, mass: 240 }, humanoid: true, gender: personGender, head: { x: 1, y: -66, r: 10 },
  ai: poppy, draw: (c, e, f) => drawPoppy(c, e, f, seedOf(e)),
});
