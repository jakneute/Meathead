// The castle's cast: park staff in cheap Monster Mash costumes (generic theme-park takes, nobody's trademark), a
// different person under every one (men and women, every skin, thin and heavy, by seed), each a different way to fight:
//   skeleton  SHIELD:  a skeleton bodysuit, a coffin lid for a shield; shots off the front of it bounce. Walks up and
//                      bashes with it, and the lid's down a moment after (the opening). Go round, over, or charge it.
//   knight    SPIKY:   tin-foil armor, a bucket helm with spikes welded on top (dive kick it and it's your feet), a
//                      sword that is not plastic. Slow, a big wind-up.
//   igor      POINTY:  a hunchback in a chef's hat with a roasting fork out in front (don't shoulder charge into it):
//                      the wind-up, the lunge.
//   witch     THROWER: green face paint, a pointy hat; keeps her distance and lobs potion bottles over.
//   bride     RUSHER:  a vampire bride (a nightgown, the hair, plastic fangs): hisses (the tell), then flat out at him.
//   batsuit   FLYER:   a rubber bat suit on a stunt rig (the wire up to a trolley on the ceiling): hangs, swoops.
//   mummy     TANK:    a big one, wrapped in toilet paper; slow, takes a beating, and hits like a truck.
//   bat       (wildlife: the real thing) flits about, swoops, bites.
// Feet at the origin, facing right.

import type { Enemy, EnemyKind } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { safeAhead, makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { BOTTLE_GRAVITY } from '../../../m1/constants';
import { lookOf } from '../../adventure/temple/people';
import { INK, moodOf, type Pose } from '../costume';
import { drawBatArt } from '../critters';
import { drawSkeletonCostume, drawKnightCostume, drawIgorCostume, drawWitchCostume, drawBrideCostume, drawBatsuitCostume, drawMummyCostume } from '../wardrobe';

type Ctx = CanvasRenderingContext2D;
import * as L from './lines';

export type Costume = 'skeleton' | 'knight' | 'igor' | 'witch' | 'bride' | 'batsuit' | 'mummy';
export const STAFF = {
  skeleton: 'm2:castle_skeleton', knight: 'm2:castle_knight', igor: 'm2:castle_igor', witch: 'm2:castle_witch', bride: 'm2:castle_bride',
  batsuit: 'm2:castle_batsuit', mummy: 'm2:castle_mummy', bat: 'm2:castle_bat',
} as const;

const mid = (o: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });
export const seedOf = (e: Enemy) => Math.abs(Math.round(e.homeX || 0)) + (e.variant ?? 0) * 31;
const live = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return live(state) && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};
/** His box (ducked or sliding: the low half of it). */
const pBox = (state: GameState) => {
  const p = state.player, low = p.isDucking || p.isSliding ? 28 : 0;
  return { x: p.pos.x, y: p.pos.y + low, w: p.width, h: p.height - low };
};
/** A swing out in front of it: `reach` past its middle, `top..bot` up from its feet. Hurts him if he's in it. */
const strike = (ctx: FrameContext, e: Enemy, reach: number, top: number, bot: number, dmg: number, source: string) => {
  const { state } = ctx, p = state.player;
  if (p.invincibilityTimer > 0 || !live(state)) return false;
  const cx = e.pos.x + e.width / 2, f = e.facing === -1 ? -1 : 1, feet = e.pos.y + e.height;
  const x0 = f > 0 ? cx : cx - reach, x1 = f > 0 ? cx + reach : cx, b = pBox(state);
  if (b.x < x1 && b.x + b.w > x0 && b.y < feet - bot && b.y + b.h > feet - top) { hurtPlayer(ctx, dmg, source, { x: f * 6, y: -5 }); return true; }
  return false;
};
const go = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
/** Walk at him, not off an edge. */
const walk = (ctx: FrameContext, e: Enemy, dir: number, speed: number) => { e.vel.x = safeAhead(ctx, e, dir, 10) ? dir * speed : 0; };

// ---------------------------------------------------------------------------------------------------------------
// Their AIs

const skeletonAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 70;
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; e.isShieldActive = true; if (sees(state, e, 560, 200)) go(e, 'walk'); break;
    case 'walk':
      e.isShieldActive = true; e.facing = dir as 1 | -1;
      if (adx > 64) walk(ctx, e, dir, 1.25); else e.vel.x = 0;
      if (adx < 96 && level && live(state)) go(e, 'wind');
      break;
    case 'wind': e.vel.x = 0; if (e.aiTimer > 24) { go(e, 'bash'); playSound('whoosh', 0.6, -2); } break;
    case 'bash':
      e.vel.x = e.aiTimer < 7 ? e.facing! * 5 : 0;
      if (e.aiTimer < 9) strike(ctx, e, 56, 66, 4, 12, e.kind!);
      if (e.aiTimer > 12) go(e, 'open');
      break;
    // (the lid down: the opening)
    case 'open': e.vel.x *= 0.8; e.isShieldActive = false; if (e.aiTimer > 46) go(e, 'walk'); break;
  }
  return false;
};

const knightAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 80;
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; if (sees(state, e, 520, 220)) go(e, 'walk'); break;
    case 'walk':
      e.facing = dir as 1 | -1;
      if (adx > 70) walk(ctx, e, dir, 1.0); else e.vel.x = 0;
      if (adx < 112 && level && live(state)) go(e, 'wind');
      break;
    case 'wind': e.vel.x = 0; if (e.aiTimer === 1) playSound('clang', 0.3, 6); if (e.aiTimer > 30) { go(e, 'swing'); playSound('whoosh', 0.8, -4); } break;
    case 'swing':
      e.vel.x = e.aiTimer < 5 ? e.facing! * 2.5 : 0;
      if (e.aiTimer < 10) strike(ctx, e, 82, 74, 0, 14, e.kind!);
      if (e.aiTimer > 14) go(e, 'recover');
      break;
    case 'recover': e.vel.x = 0; if (e.aiTimer > 42) go(e, 'walk'); break;
  }
  return false;
};

const igorAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 80;
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; if (sees(state, e, 520, 200)) go(e, 'walk'); break;
    case 'walk':
      e.facing = dir as 1 | -1;
      if (adx > 70) walk(ctx, e, dir, 1.7); else e.vel.x = 0;
      if (adx < 110 && level && live(state)) go(e, 'wind');
      break;
    case 'wind': e.vel.x = 0; if (e.aiTimer > 20) { go(e, 'thrust'); playSound('whoosh', 0.6, 2); } break;
    case 'thrust':
      e.vel.x = e.aiTimer < 8 ? e.facing! * 6.5 : 0;
      if (e.aiTimer < 12) strike(ctx, e, 66, 50, 30, 12, `${STAFF.igor}_fork`);
      if (e.aiTimer > 16) go(e, 'recover');
      break;
    case 'recover': e.vel.x *= 0.8; if (e.aiTimer > 34) go(e, 'walk'); break;
  }
  return false;
};

/** A potion bottle, lobbed: up and over, coming down where he's stood. */
const lob = (ctx: FrameContext, e: Enemy) => {
  const p = ctx.state.player;
  const x = e.pos.x + e.width / 2 + (e.facing ?? 1) * 10, y = e.pos.y + e.height - 62;
  const tx = p.pos.x + p.width / 2 + p.vel.x * 10, ty = p.pos.y + p.height / 2;
  const t = Math.max(26, Math.min(50, Math.abs(tx - x) / 7));
  const vx = (tx - x) / t, vy = (ty - y - 0.5 * BOTTLE_GRAVITY * t * t) / t;
  playSound('whoosh', 0.5, 5);
  ctx.state.projectiles.push({ id: `witch-${ctx.state.frame}-${Math.random()}`, pos: { x: x - 6, y: y - 8 }, vel: { x: vx, y: vy }, width: 12, height: 16, health: 1, maxHealth: 1, type: 'projectile', damage: 11, owner: 'enemy', shooterKind: e.kind ?? 'enemy', thrown: 'flask', rotation: 0 });
};
const witchAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx);
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; if (sees(state, e, 620, 320)) go(e, 'keep'); break;
    case 'keep':
      e.facing = dir as 1 | -1;
      // (her distance: back off if he's close, in a bit if he's far)
      if (adx < 230) walk(ctx, e, -dir, 1.5); else if (adx > 430) walk(ctx, e, dir, 1.2); else e.vel.x = 0;
      if (e.aiTimer > 80 && adx < 640 && live(state)) go(e, 'wind');
      break;
    case 'wind': e.vel.x = 0; e.facing = dir as 1 | -1; if (e.aiTimer > 22) { lob(ctx, e); go(e, 'keep'); e.aiTimer = Math.floor(Math.random() * 25); } break;
  }
  return false;
};

const brideAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 90;
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; if (sees(state, e, 600, 200)) go(e, 'hiss'); break;
    case 'hiss':
      e.vel.x = 0; e.facing = dir as 1 | -1;
      if (e.aiTimer === 2) playSound('snort', 0.7, 12);
      if (e.aiTimer > (e.aiX ? 16 : 26) && level && live(state)) { go(e, 'rush'); e.aiX = 1; }
      break;
    case 'rush': {
      e.vel.x = safeAhead(ctx, e, e.facing!, 20) ? e.facing! * 7.5 : 0;
      const passed = Math.sign(dx) !== e.facing && adx > 110;
      if (passed || e.vel.x === 0 || e.aiTimer > 90) go(e, 'skid');
      break;
    }
    case 'skid': e.vel.x *= 0.86; if (e.aiTimer > 30) go(e, 'hiss'); break;
  }
  return false;
};

const batsuitAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  const homeX = e.homeX ?? e.pos.x, homeY = e.homeY ?? e.pos.y;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const m = mid(e), p = mid(state.player);
  // (grabbed, or hit by a charge move, and lived: the wire's snapped. Down he comes, and he's a man in a bat suit on foot
  // from then on)
  if (snapped(e)) return grounded(state, e);
  switch (e.aiState) {
    default: {
      const t = (state.frame + homeX) * 0.02;
      const tx = homeX + Math.cos(t) * 120, ty = homeY + Math.sin(t * 2) * 16;
      e.vel.x = (tx - e.pos.x) * 0.05; e.vel.y = (ty - e.pos.y) * 0.05;
      e.facing = (p.x < m.x ? -1 : 1) as 1 | -1;
      if (e.aiTimer > 80 && Math.abs(p.x - m.x) < 360 && p.y > m.y + 40 && live(state)) {
        go(e, 'dive'); e.aiX = p.x; e.aiY = p.y;
        const len = Math.hypot(p.x - m.x, p.y - m.y) || 1;
        e.vel = { x: ((p.x - m.x) / len) * 7.5, y: ((p.y - m.y) / len) * 7.5 };
        e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
        playSound('whoosh', 0.6, 0);
      }
      break;
    }
    case 'dive':
      if (Math.hypot((e.aiX ?? m.x) - m.x, (e.aiY ?? m.y) - m.y) < 16 || m.y > (e.aiY ?? m.y) + 10 || e.aiTimer > 70) go(e, 'climb');
      break;
    case 'climb':
      e.vel.x *= 0.95; e.vel.y = Math.max(-4, e.vel.y - 0.45);
      if (e.pos.y <= homeY) go(e, 'idle');
      break;
  }
  const floor = floorTopAt(state.blocks, m.x, e.pos.y + e.height, 0);
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  if (floor !== null && e.pos.y + e.height > floor) { e.pos.y = floor - e.height; if (e.aiState === 'dive') go(e, 'climb'); }
  return true;
};

/** His wire's gone: he's been grabbed, or a charge move's landed on him (a shoulder charge, slide, uppercut, dive kick). */
const snapped = (e: Enemy) => !!e.wasGrabbed || e.hitByMove !== undefined;
/** The bat suit off his wire: falls, lands, then waddles at him flapping the rubber wings (it's all he's got). */
const grounded = (state: GameState, e: Enemy): boolean => {
  const m = mid(e), p = mid(state.player);
  if (e.aiState !== 'fall' && e.aiState !== 'walk') { e.enemyType = undefined; e.vel.x *= 0.3; go(e, 'fall'); }
  const floor = floorTopAt(state.blocks, m.x, e.pos.y + e.height, 0);
  const onFloor = floor !== null && e.pos.y + e.height >= floor - 1;
  if (!onFloor) { e.vel.y = Math.min(14, e.vel.y + 0.6); }
  else {
    if (e.aiState === 'fall') { go(e, 'walk'); playSound('thud', 0.6, -2); }
    e.vel.y = 0;
    const dx = p.x - m.x;
    e.facing = (dx < 0 ? -1 : 1) as 1 | -1;
    e.vel.x = live(state) && Math.abs(dx) > 20 ? Math.sign(dx) * 1.3 : 0;
  }
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  if (floor !== null && e.pos.y + e.height > floor) e.pos.y = floor - e.height;
  return true;
};

const mummyAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 90;
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; if (sees(state, e, 520, 220)) go(e, 'walk'); break;
    case 'walk':
      e.facing = dir as 1 | -1;
      if (adx > 70) walk(ctx, e, dir, 0.7); else e.vel.x = 0;
      if (adx < 116 && level && live(state)) go(e, 'wind');
      break;
    case 'wind': e.vel.x = 0; if (e.aiTimer === 1) playSound('snort', 0.6, -8); if (e.aiTimer > 40) { go(e, 'slam'); playSound('whoosh', 0.9, -8); } break;
    case 'slam':
      e.vel.x = e.aiTimer < 8 ? e.facing! * 3.5 : 0;
      if (e.aiTimer < 12) strike(ctx, e, 74, 80, 0, 20, e.kind!);
      if (e.aiTimer === 10) { playSound('thud', 0.8, -6); }
      if (e.aiTimer > 14) go(e, 'recover');
      break;
    case 'recover': e.vel.x = 0; if (e.aiTimer > 52) go(e, 'walk'); break;
  }
  return false;
};

const batAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  const homeX = e.homeX ?? e.pos.x, homeY = e.homeY ?? e.pos.y;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const m = mid(e), p = mid(state.player), seed = seedOf(e);
  if (e.aiState === 'swoop') {
    if (e.aiTimer > 40 || Math.hypot(p.x - m.x, p.y - m.y) < 10) go(e, 'back');
  } else if (e.aiState === 'back') {
    e.vel.x += ((homeX - e.pos.x) * 0.004 - e.vel.x * 0.05); e.vel.y += ((homeY - e.pos.y) * 0.004 - e.vel.y * 0.05);
    if (e.aiTimer > 70) go(e, 'idle');
  } else {
    // (flitting: a jittery figure-eight about where it roosts)
    const t = state.frame * 0.06 + seed;
    const tx = homeX + Math.sin(t) * 90 + Math.sin(t * 3.1) * 20, ty = homeY + Math.sin(t * 2) * 30 + Math.cos(t * 4.3) * 10;
    e.vel.x = (tx - e.pos.x) * 0.08; e.vel.y = (ty - e.pos.y) * 0.08;
    if (e.aiTimer > 60 + (seed % 40) && Math.hypot(p.x - m.x, p.y - m.y) < 300 && live(state)) {
      go(e, 'swoop');
      const len = Math.hypot(p.x - m.x, p.y - m.y) || 1;
      e.vel = { x: ((p.x - m.x) / len) * 6, y: ((p.y - m.y) / len) * 6 };
      playSound('chitter', 0.4, 8);
    }
  }
  e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
  const floor = floorTopAt(state.blocks, m.x, e.pos.y + e.height, 0);
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  if (floor !== null && e.pos.y + e.height > floor) { e.pos.y = floor - e.height; if (e.aiState === 'swoop') go(e, 'back'); }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing them: the costumes (wardrobe.ts) on the one person drawer (costume.ts), the same characters as the town's
// and the tower's

const poseOf = (e: Enemy): Pose => {
  const s = e.aiState;
  if (s === 'wind' || s === 'hiss') return 'tell';
  if (s === 'bash' || s === 'swing' || s === 'thrust' || s === 'slam' || s === 'rush' || s === 'dive') return 'strike';
  return Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand';
};
const wear = (e: Enemy, f: number, woman?: boolean) => ({ seed: seedOf(e), f, pose: poseOf(e), md: moodOf(e), woman });

/** The bat suit's rig: the wire up from his back to the trolley (off the top of the screen). */
const drawWire = (c: Ctx) => { c.fillStyle = INK; c.fillRect(-1.5, -900, 3, 848); c.fillStyle = '#A1A1AA'; c.fillRect(-0.5, -900, 1, 848); };

// ---------------------------------------------------------------------------------------------------------------
// Registered

const human = (e: Enemy, woman?: boolean) => (lookOf(seedOf(e), woman).woman ? 'f' : 'm');
const brideWoman = (e: Enemy) => seedOf(e) % 5 !== 0;

registerM2Kind({
  kind: STAFF.skeleton, stats: { w: 42, h: 68, hp: 150, contact: 8, mass: 230 }, ai: skeletonAI, humanoid: true,
  make: b => ({ ...b, enemyType: 'shield', isShieldActive: true }),
  gender: e => human(e), head: { x: 1, y: -67, r: 9 },
  draw: (c, e, f) => drawSkeletonCostume(c, wear(e, f), 'lid', e.isShieldActive !== false),
});
registerM2Kind({
  kind: STAFF.knight, stats: { w: 42, h: 70, hp: 210, contact: 9, mass: 300 }, ai: knightAI, humanoid: true,
  spiky: { source: `${STAFF.knight}_spikes`, label: 'SPIKED!' },
  gender: e => human(e), head: { x: 1, y: -67, r: 10 },
  draw: (c, e, f) => drawKnightCostume(c, wear(e, f)),
});
registerM2Kind({
  kind: STAFF.igor, stats: { w: 40, h: 62, hp: 120, contact: 9, mass: 200 }, ai: igorAI, humanoid: true,
  pointy: { source: `${STAFF.igor}_fork`, label: 'FORKED!' },
  gender: e => human(e), head: { x: 8, y: -61, r: 9 },
  draw: (c, e, f) => drawIgorCostume(c, wear(e, f), 'chef'),
});
registerM2Kind({
  kind: STAFF.witch, stats: { w: 38, h: 66, hp: 90, contact: 7, mass: 170 }, ai: witchAI, humanoid: true,
  gender: e => human(e), head: { x: 1, y: -67, r: 9 },
  draw: (c, e, f) => drawWitchCostume(c, wear(e, f)),
});
registerM2Kind({
  kind: STAFF.bride, stats: { w: 38, h: 66, hp: 100, contact: 12, mass: 170 }, ai: brideAI, humanoid: true,
  gender: e => human(e, brideWoman(e)), head: { x: 1, y: -67, r: 9 },
  // (rushing: leaning into it, arms out for his neck)
  draw: (c, e, f) => drawBrideCostume(c, wear(e, f, brideWoman(e)), 'rush'),
});
registerM2Kind({
  kind: STAFF.batsuit, stats: { w: 44, h: 66, hp: 80, contact: 10, mass: 160, air: true }, ai: batsuitAI, humanoid: true, grab: 'critter',
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }),
  gender: e => human(e), head: { x: 1, y: -67, r: 9 },
  // (the wire only while he's flying on it: not once it's snapped (grabbed, or a charge move), not as a corpse or flung)
  draw: (c, e, f) => {
    const onWire = !snapped(e) && e.health > 0 && (e.aiState === 'idle' || e.aiState === 'dive' || e.aiState === 'climb' || !e.aiState);
    if (onWire) drawWire(c);
    drawBatsuitCostume(c, { seed: seedOf(e), f, pose: e.aiState === 'dive' ? 'strike' : onWire ? 'fly' : 'walk', md: moodOf(e) });
  },
});
registerM2Kind({
  kind: STAFF.mummy, stats: { w: 50, h: 74, hp: 420, contact: 12, mass: 520 }, ai: mummyAI, humanoid: true, grab: 'body',
  gender: e => human(e), head: { x: 1, y: -67, r: 10 },
  draw: (c, e, f) => drawMummyCostume(c, wear(e, f), 1.1),
});
registerM2Kind({
  kind: STAFF.bat, stats: { w: 26, h: 18, hp: 20, contact: 6, mass: 15, air: true }, ai: batAI, gender: 'n', grab: 'critter',
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }),
  head: { x: 0, y: -10, r: 5 },
  draw: (c, e, f) => drawBatArt(c, e, f, 0.9),
});

registerHurtLines(STAFF.skeleton, L.HURT_SKELETON, L.DEATH_SKELETON);
registerHurtLines(STAFF.knight, L.HURT_KNIGHT, L.DEATH_KNIGHT);
registerHurtLines(`${STAFF.knight}_spikes`, L.HURT_KNIGHT_SPIKES, L.DEATH_KNIGHT_SPIKES);
registerHurtLines(STAFF.igor, L.HURT_IGOR, L.DEATH_IGOR);
registerHurtLines(`${STAFF.igor}_fork`, L.HURT_FORK, L.DEATH_FORK);
registerHurtLines(STAFF.witch, L.HURT_WITCH, L.DEATH_WITCH);
registerHurtLines(`${STAFF.witch}_shot`, L.HURT_FLASK, L.DEATH_FLASK);
registerHurtLines(STAFF.bride, L.HURT_BRIDE, L.DEATH_BRIDE);
registerHurtLines(STAFF.batsuit, L.HURT_BATSUIT, L.DEATH_BATSUIT);
registerHurtLines(STAFF.mummy, L.HURT_MUMMY, L.DEATH_MUMMY);
registerHurtLines(STAFF.bat, L.HURT_BAT, L.DEATH_BAT);

// ---------------------------------------------------------------------------------------------------------------
// Putting them in the world

export type StaffKind = keyof typeof STAFF;
/** One of them, its feet at (x, feetY) (a flyer: hung at that height), facing `facing`. */
export const spawnStaff = (state: GameState, kind: StaffKind, x: number, feetY: number, variant = 0, facing: 1 | -1 = -1): Enemy => {
  // (made by hand, like makeKindEnemy: the kind's own make)
  const e = makeStaff(STAFF[kind], x, feetY);
  e.homeX = x; e.homeY = e.pos.y; e.variant = variant; e.facing = facing; e.aiState = 'idle'; e.aiTimer = 0;
  state.enemies.push(e);
  return e;
};
const makeStaff = (kind: string, x: number, feetY: number) => makeKindEnemy(kind as EnemyKind, x, feetY);
