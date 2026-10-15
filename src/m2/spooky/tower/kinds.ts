// The clock tower's enemies (Meathead 2's own kinds). Two lots:
//
// The park's staff in cheap monster-mash costumes (mixed people under them: men and women, every skin, thin and
// heavy, by seed), escalating the types the town and the castle taught:
//   igor     a hunchback in a burlap robe with a pitchfork (a real one): POINTY. Walks at him, draws it back (the
//            tell), jabs. Shoulder charge him from the front and you run onto it.
//   mummy    toilet paper, a lot of it, over a big guy (or gal): the TANK. Slow, takes a beating, arms up (the tell)
//            and a two-handed swipe.
//   bride    a vampire bride (veil, a dress gone gray, a bouquet of dead roses): the THROWER. Up on a ledge, keeps her
//            distance, lobs bouquets (thorns) that come down where he is.
//   (plus the town's wolfman, the rusher, and its stitched-up monster, the bruiser, in the mixes: town/kinds.ts)
// The clock's own:
//   cuckoo   the bird out of a cuckoo clock on the wall: pops out, darts at him, goes back in. A drone with a beak.
//   ringer   a clockwork bell-ringer, one of the clock's figures (a big wooden automaton): walks its beat, raises its
//            hammer (the tell: a long one), brings it down in front of it. A machine: scrap, not blood.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { moodOf, reaction, type Pose, type Mood } from '../costume';
import { drawIgorCostume, drawMummyCostume, drawBrideCostume, bouquet } from '../wardrobe';
import { drawCuckooArt, drawRingerArt } from '../critters';
import { inDanger, clearView } from './hazards';
import {
  HURT_IGOR, DEATH_IGOR, HURT_PITCHFORK, DEATH_PITCHFORK, HURT_MUMMY, DEATH_MUMMY, HURT_BRIDE, DEATH_BRIDE, HURT_BOUQUET, DEATH_BOUQUET,
  HURT_CUCKOO, DEATH_CUCKOO, HURT_RINGER, DEATH_RINGER, HURT_HAMMER, DEATH_HAMMER,
} from './lines';

type Ctx = CanvasRenderingContext2D;

export const TK = { igor: 'm2:tower_igor', mummy: 'm2:tower_mummy', bride: 'm2:tower_bride', cuckoo: 'm2:tower_cuckoo', ringer: 'm2:tower_ringer' } as const;

registerHurtLines(TK.igor, HURT_IGOR, DEATH_IGOR);
registerHurtLines('m2:tower_pitchfork', HURT_PITCHFORK, DEATH_PITCHFORK);
registerHurtLines(TK.mummy, HURT_MUMMY, DEATH_MUMMY);
registerHurtLines(TK.bride, HURT_BRIDE, DEATH_BRIDE);
registerHurtLines('m2:tower_bouquet', HURT_BOUQUET, DEATH_BOUQUET);
registerHurtLines(TK.cuckoo, HURT_CUCKOO, DEATH_CUCKOO);
registerHurtLines(TK.ringer, HURT_RINGER, DEATH_RINGER);
registerHurtLines('m2:tower_hammer', HURT_HAMMER, DEATH_HAMMER);

const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
/** He's about, on its floor (the tower's floors are 380 apart: nothing on the next one up or down comes for him). */
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return state.player.health > 0 && !holdingOff(state) && !state.player.inCutscene && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry
    // (not through a support beam: they're cover)
    && clearView(m.x, e.pos.y + 12, p.x, p.y);
};
const canHurt = (state: GameState) => state.player.health > 0 && state.player.invincibilityTimer <= 0 && !state.player.inCutscene;
/** Who's under the costume: the same person every time (where it was put down). */
export const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) * 7 + (e.variant ?? 0) * 31;

// ---------------------------------------------------------------------------------------------------------------
// What's thrown (the brides' bouquets): the section runs and draws them (updateThrown, drawThrown)

export interface Bouquet { x: number; y: number; vx: number; vy: number; t: number; rot: number }
export const thrown: Bouquet[] = [];
const LOB_G = 0.3;
export const updateThrown = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  for (let i = thrown.length - 1; i >= 0; i--) {
    const b = thrown[i];
    b.t++; b.vy += LOB_G; b.x += b.vx; b.y += b.vy; b.rot += 0.25;
    const hit = b.x > p.pos.x - 8 && b.x < p.pos.x + p.width + 8 && b.y > p.pos.y && b.y < p.pos.y + p.height;
    const ground = state.blocks.some(k => !k.oneWay && b.x >= k.x && b.x <= k.x + k.w && b.y >= k.y && b.y <= k.y + 20);
    if (hit && canHurt(state)) hurtPlayer(ctx, 9, 'm2:tower_bouquet', { x: Math.sign(b.vx) * 4, y: -3 });
    if (hit || ground || b.t > 240) {
      // (the petals everywhere)
      for (let j = 0; j < 10; j++) state.particles.push({ pos: { x: b.x, y: b.y }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 30, color: j % 2 ? '#4C0519' : '#3F6212', size: 2 + Math.random() * 2, grav: 0.15 });
      playSound('splat', 0.3, 8);
      thrown.splice(i, 1);
    }
  }
};
export const drawBouquet = (c: Ctx, x: number, y: number, rot: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(rot); bouquet(c); c.restore();
};
export const drawThrown = (c: Ctx) => { for (const b of thrown) drawBouquet(c, b.x, b.y, b.rot); };

// ---------------------------------------------------------------------------------------------------------------
// The AIs

const igorAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 120)) setState(e, 'walk');
      break;
    case 'walk':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 80 && safeAhead(ctx, e, e.facing) && !inDanger(e, e.pos.x + e.facing * 6) ? e.facing * 1.7 : 0;
      if (Math.abs(dx) < 110 && Math.abs(p.y - m.y) < 70) setState(e, 'windup');
      if (!sees(state, e, 800, 160)) setState(e, 'idle');
      break;
    case 'windup':
      // (the fork drawn back: the tell)
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 22) { setState(e, 'thrust'); playSound('whoosh', 0.6, 2); }
      break;
    case 'thrust':
      e.vel.x = e.aiTimer < 8 && safeAhead(ctx, e, e.facing!) && !inDanger(e, e.pos.x + e.facing! * 14) ? e.facing! * 6 : 0;
      if (e.aiTimer > 16) setState(e, 'recover');
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 36) setState(e, 'walk');
      break;
  }
  return false;
};

const MUMMY_REACH = 96;
const mummyAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 130)) setState(e, 'walk');
      break;
    case 'walk':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 70 && safeAhead(ctx, e, e.facing) && !inDanger(e, e.pos.x + e.facing * 6) ? e.facing * 0.75 : 0;
      if (Math.abs(dx) < 110 && Math.abs(p.y - m.y) < 80) setState(e, 'raise');
      break;
    case 'raise':
      // (both wrapped arms up, groaning: the tell)
      e.vel.x = 0;
      if (e.aiTimer === 2) playSound('bellow', 0.35, 6);
      if (e.aiTimer > 38) { setState(e, 'swipe'); playSound('whoosh', 0.8, -8); }
      break;
    case 'swipe':
      if (e.aiTimer === 5) {
        const inFront = dx * e.facing! > -10 && Math.abs(dx) < MUMMY_REACH && Math.abs(p.y - m.y) < 70;
        if (inFront && canHurt(state)) hurtPlayer(ctx, 16, TK.mummy, { x: e.facing! * 8, y: -5 }, 20);
      }
      if (e.aiTimer > 14) setState(e, 'recover');
      break;
    case 'recover':
      if (e.aiTimer > 46) setState(e, 'walk');
      break;
  }
  return false;
};

const brideAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x;
  tick(e);
  e.vel.x = 0;
  const awake = sees(state, e, 620, 420);
  if (awake) e.facing = dirTo(e, p.x);
  switch (e.aiState) {
    default:
      if (awake && e.aiTimer > 100 && Math.abs(dx) < 560) setState(e, 'windup');
      break;
    case 'windup':
      // (the bouquet up over her shoulder: the tell)
      if (e.aiTimer === 22) {
        const t = Math.max(34, Math.min(62, Math.abs(dx) / 5)), tx = p.x + state.player.vel.x * t * 0.3;
        const sx = m.x + e.facing! * 12, sy = e.pos.y + 14;
        thrown.push({ x: sx, y: sy, vx: (tx - sx) / t, vy: (p.y - sy - 0.5 * LOB_G * t * t) / t, t: 0, rot: 0 });
        playSound('whoosh', 0.45, 6);
      }
      if (e.aiTimer > 34) { setState(e, 'idle'); e.aiTimer = -Math.floor(Math.random() * 40); }
      break;
  }
  return false;
};

/** A cuckoo: sat in its clock's door (home), out at him, back in. */
const cuckooAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, p = mid(state.player), m = mid(e);
  tick(e);
  const hx = e.homeX ?? e.pos.x, hy = e.homeY ?? e.pos.y;
  switch (e.aiState) {
    default:
      // (in the door, bobbing; the clock about to go off: it pops out at him)
      e.pos.x += (hx - e.pos.x) * 0.3; e.pos.y = hy + Math.sin((state.frame + hx) * 0.2) * 1.5;
      e.facing = dirTo(e, p.x);
      if (e.aiTimer > 70 && sees(state, e, 360, 240)) { setState(e, 'pop'); playSound('ding', 0.45, 14); }
      return true;
    case 'pop': {
      // CUCKOO! (out on its spring, a beat, then at him)
      e.pos.x = hx + e.facing! * Math.min(1, e.aiTimer / 6) * 26;
      if (e.aiTimer > 16) {
        setState(e, 'dart');
        const len = Math.hypot(p.x - m.x, p.y - m.y) || 1;
        e.vel.x = ((p.x - m.x) / len) * 6.5; e.vel.y = ((p.y - m.y) / len) * 6.5;
        playSound('whoosh', 0.4, 10);
      }
      return true;
    }
    case 'dart':
      e.pos.x += e.vel.x; e.pos.y += e.vel.y;
      e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
      if (e.aiTimer > 46 || state.blocks.some(b => !b.oneWay && m.x > b.x && m.x < b.x + b.w && m.y > b.y && m.y < b.y + b.h)) setState(e, 'back');
      return true;
    case 'back': {
      const ddx = hx - e.pos.x, ddy = hy - e.pos.y, d = Math.hypot(ddx, ddy);
      e.facing = (ddx < 0 ? -1 : 1) as 1 | -1;
      if (d < 4) { e.pos.x = hx; e.pos.y = hy; setState(e, 'idle'); return true; }
      e.vel.x = (ddx / d) * 3.5; e.vel.y = (ddy / d) * 3.5;
      e.pos.x += e.vel.x; e.pos.y += e.vel.y;
      return true;
    }
  }
};

const RINGER_REACH = 120;
const ringerAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default: {
      // Its beat, back and forth (it doesn't chase: it's on a track, like the clock's figures)
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 150 || !safeAhead(ctx, e, e.facing) || inDanger(e, e.pos.x + e.facing * 8)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      if (inDanger(e, e.pos.x + e.facing * 8)) { e.vel.x = 0; break; }
      e.vel.x = e.facing * 0.8;
      if (state.frame % 40 === 0 && Math.abs(dx) < 700 && Math.abs(p.y - m.y) < 200) playSound('click', 0.2, -10);
      if (sees(state, e, 150, 90) && dx * e.facing > -30) setState(e, 'raise');
      else if (sees(state, e, 150, 90)) { e.facing = dirTo(e, p.x); setState(e, 'raise'); }
      break;
    }
    case 'raise':
      // (the hammer winds up over its head, ratcheting: the tell)
      e.vel.x = 0;
      if (e.aiTimer % 9 === 0) playSound('click', 0.4, -4);
      if (e.aiTimer > 46) { setState(e, 'strike'); playSound('whoosh', 0.9, -10); }
      break;
    case 'strike':
      if (e.aiTimer === 6) {
        shakeScreen(state, 12, 6);
        playSound('clang', 1, -12); playSound('ding', 0.6, -16);
        const hx = m.x + e.facing! * 70;
        for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: hx, y: e.pos.y + e.height }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 22, color: i % 2 ? '#A8A29E' : '#FDE68A', size: 3 });
        const inFront = dx * e.facing! > -20 && Math.abs(dx) < RINGER_REACH && Math.abs(p.y - m.y) < 80;
        if (inFront && canHurt(state)) hurtPlayer(ctx, 18, 'm2:tower_hammer', { x: e.facing! * 9, y: -7 }, 24);
      }
      if (e.aiTimer > 14) setState(e, 'recover');
      break;
    case 'recover':
      e.vel.x = 0;
      if (e.aiTimer > 44) setState(e, 'idle');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the costumes (wardrobe.ts, the same igor, mummy and bride as the castle's), the clock's figures (critters.ts)

const moving = (e: Enemy): Pose => (Math.abs(e.vel.x) > 0.2 ? 'walk' : 'stand');
/** Its pose and face: knocked about (held, flung, dazed, a body) if it is, otherwise what it's doing. */
const as = (e: Enemy, pose: Pose): { pose: Pose; md: Mood } => reaction(e) ?? { pose, md: moodOf(e) };
const drawIgor = (c: Ctx, e: Enemy, f: number) =>
  drawIgorCostume(c, { seed: seedOf(e), f, ...as(e, e.aiState === 'windup' ? 'tell' : e.aiState === 'thrust' ? 'strike' : moving(e)) }, 'farm');
const drawMummy = (c: Ctx, e: Enemy, f: number) =>
  drawMummyCostume(c, { seed: seedOf(e), f, ...as(e, e.aiState === 'raise' ? 'tell' : e.aiState === 'swipe' ? 'strike' : moving(e)) }, 1.14);
const drawBride = (c: Ctx, e: Enemy, f: number) =>
  drawBrideCostume(c, { seed: seedOf(e), f, ...as(e, e.aiState === 'windup' ? 'tell' : 'stand'), t: Math.min(1, (e.aiTimer || 0) / 26) }, 'toss');
const drawCuckoo = (c: Ctx, e: Enemy, f: number) => drawCuckooArt(c, e, f);
const drawRinger = (c: Ctx, e: Enemy, f: number) => drawRingerArt(c, e, f);

// ---------------------------------------------------------------------------------------------------------------

const personGender = (e: Enemy) => (lookOf(seedOf(e)).woman ? 'f' : 'm') as 'm' | 'f';

registerM2Kind({
  kind: TK.igor, stats: { w: 40, h: 60, hp: 170, contact: 10, mass: 200 }, ai: igorAI, humanoid: true, gender: personGender,
  pointy: { source: 'm2:tower_pitchfork', label: 'FORKED!' }, head: { x: 11, y: -52, r: 8 },
  draw: (c, e, f) => drawIgor(c, e, f),
});
registerM2Kind({
  kind: TK.mummy, stats: { w: 46, h: 84, hp: 340, contact: 13, mass: 430 }, ai: mummyAI, humanoid: true, gender: personGender,
  head: { x: 0, y: -74, r: 11 }, draw: (c, e, f) => drawMummy(c, e, f),
});
registerM2Kind({
  kind: TK.bride, stats: { w: 38, h: 70, hp: 120, contact: 8, mass: 170 }, ai: brideAI, humanoid: true, gender: personGender,
  // (she keeps to her ledge)
  pathing: false,
  head: { x: 0, y: -60, r: 8 }, draw: (c, e, f) => drawBride(c, e, f),
});
registerM2Kind({
  kind: TK.cuckoo, stats: { w: 26, h: 20, hp: 14, contact: 8, mass: 20, air: true }, ai: cuckooAI, gender: 'n', grab: 'critter', fixture: true,
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }),
  head: { x: 6, y: -14, r: 5 }, draw: (c, e, f) => drawCuckoo(c, e, f),
});
registerM2Kind({
  kind: TK.ringer, stats: { w: 50, h: 120, hp: 360, contact: 10, mass: 900 }, ai: ringerAI, robot: true, gender: 'n', grab: 'none',
  head: { x: 0, y: -104, r: 13 }, draw: (c, e, f) => drawRinger(c, e, f),
});
