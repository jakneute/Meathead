// The town's enemies (Meathead 2's own kinds, registered when the town's loaded). Teach, then escalate: each comes in
// alone first (layout.ts), then they mix.
//
// The wildlife:
//   bat       flutters about its patch, then swoops at him and flaps back up. Of course there's bats.
//   crow      perched up on a lamp or a roof: caws (the tell), dives straight at him, goes back to its perch.
//   rat       scurries about, then rushes his ankles. Tiny: the slide does it.
//   cat       a mangy black cat: arches its back and hisses (the tell), then pounces.
// The park's staff, in cheap classic-monster costumes (mixed people under them: men and women, every skin, thin and
// heavy, by seed). Each a combat type:
//   ghost     a bedsheet with eyeholes (the basic grunt): shuffles at him, arms up under the sheet, BOO, a lunge.
//   wolfman   a rented fur suit (the rusher): howls (the tell), then runs him down flat out, and overshoots.
//   monster   a stitched-up flathead in platform boots (the bruiser): slow, heavy; both fists up, then down.
//   witch     on a broom (the flyer and thrower): keeps her distance up in the air, cackles, lobs a potion.
//   skeleton  a bone-print bodysuit behind a foam tombstone (the shield): shots off the front; charge it, or go round.
//             Drops it to throw a plastic bone.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { shakeScreen } from '../../../m1/game/core/state';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { townOf, type Lobbed } from './state';
import { HURT, RIDE_HURT } from './lines';
import { townDanger } from './rideHits';
import { rollPumpkin } from './rides';
import { X, STAIRS } from './layout';
import { drawBat, drawCrow, drawRat, drawCat, drawGhost, drawWolfman, drawMonster, drawWitch, drawSkeleton, drawPumpkinHead, drawPotion, drawBone } from './kindArt';

type Ctx = CanvasRenderingContext2D;

for (const [source, l] of Object.entries({ ...HURT, ...RIDE_HURT })) registerHurtLines(source, l.hurt, l.death);

/** Ground to step onto ahead, and not a ride's way (nobody walks into a ride of their own accord; already in one, they
 *  can walk out). */
const safe = (ctx: FrameContext, e: Enemy, dir: number, look = 8) =>
  safeAhead(ctx, e, dir, look) && !(townDanger(e, e.pos.x + dir * (look + 6)) && !townDanger(e, e.pos.x));
const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const alive = (state: GameState) => state.player.health > 0;
const grounded = (e: Enemy) => e.vel.y === 0;
/** Who's under the costume: the same person every time (the seed's where it was put down). */
export const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return alive(state) && !holdingOff(state) && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};

// ---------------------------------------------------------------------------------------------------------------
// What gets thrown: the witch's potions, the skeleton's bones (in the town's own state, till they hit something)

const LOB_G = 0.3;

/** Lobbed from (x, y) to come down on him, `t` frames on. */
const lobAt = (state: GameState, x: number, y: number, kind: Lobbed['kind'], t: number) => {
  const p = mid(state.player), tx = p.x + state.player.vel.x * t * 0.3;
  townOf(state).thrown.push({ x, y, vx: (tx - x) / t, vy: (p.y - y - 0.5 * LOB_G * t * t) / t, kind, t: 0 });
};

const DMG = { potion: 10, bone: 8 };
export const updateLobbed = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, T = townOf(state);
  T.thrown = T.thrown.filter(t => {
    t.t++; t.vy += LOB_G; t.x += t.vx; t.y += t.vy;
    const splat = () => {
      const cols = t.kind === 'potion' ? ['#84CC16', '#BEF264', '#4D7C0F'] : ['#F5F5F4', '#D6D3D1'];
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: t.x, y: t.y }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 22, color: cols[i % cols.length], size: 2 + Math.random() * 3 });
      if (t.kind === 'potion') playSound('splash', 0.4, 2);
    };
    if (p.health > 0 && t.x > p.pos.x + 2 && t.x < p.pos.x + p.width - 2 && t.y > p.pos.y && t.y < p.pos.y + p.height) {
      if (p.invincibilityTimer <= 0 && !p.noContactHurt) hurtPlayer(ctx, DMG[t.kind], `m2:town_${t.kind}`, { x: Math.sign(t.vx || 1) * 3, y: -4 }, 16);
      splat(); return false;
    }
    if (state.blocks.some(b => b.type !== 'pit' && !b.oneWay && t.x > b.x && t.x < b.x + b.w && t.y > b.y && t.y < b.y + b.h)) { splat(); return false; }
    return t.t < 300;
  });
};
export const drawLobbed = (c: Ctx, state: GameState) => {
  for (const t of townOf(state).thrown) {
    c.save(); c.translate(t.x, t.y); c.rotate(t.t * 0.25);
    if (t.kind === 'potion') drawPotion(c); else drawBone(c);
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Flying things: the floor stops them

const fly = (state: GameState, e: Enemy) => {
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  const m = mid(e), floor = floorTopAt(state.blocks, m.x, e.pos.y + e.height, 0);
  if (floor !== null && e.pos.y + e.height > floor) { e.pos.y = floor - e.height; return true; }
  return false;
};

const bat = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e);
  tick(e);
  const hx = e.homeX ?? e.pos.x, hy = e.homeY ?? e.pos.y;
  switch (e.aiState) {
    default: {
      // (erratic: a bat never goes straight)
      const t = (state.frame + hx) * 0.05;
      const tx = hx + Math.sin(t) * 60 + Math.sin(t * 3.1) * 20, ty = hy + Math.sin(t * 1.7) * 30;
      e.vel.x = (tx - e.pos.x) * 0.08; e.vel.y = (ty - e.pos.y) * 0.08;
      e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
      if (e.aiTimer > 70 && sees(state, e, 330, 320)) {
        setState(e, 'swoop'); e.aiX = p.x; e.aiY = p.y;
        const d = Math.hypot(p.x - m.x, p.y - m.y) || 1;
        e.vel = { x: ((p.x - m.x) / d) * 5.5, y: ((p.y - m.y) / d) * 5.5 };
        e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
      }
      break;
    }
    case 'swoop':
      if (Math.hypot((e.aiX ?? m.x) - m.x, (e.aiY ?? m.y) - m.y) < 14 || e.aiTimer > 55) setState(e, 'climb');
      break;
    case 'climb': {
      const dx = hx - e.pos.x, dy = hy - e.pos.y, d = Math.hypot(dx, dy) || 1;
      e.vel.x = (dx / d) * 3; e.vel.y = (dy / d) * 3 + Math.sin(e.aiTimer * 0.6) * 1.2;
      if (d < 20 || e.aiTimer > 120) setState(e, 'idle');
      break;
    }
  }
  if (fly(state, e) && e.aiState === 'swoop') setState(e, 'climb');
  return true;
};

const crow = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e);
  tick(e);
  const hx = e.homeX ?? e.pos.x, hy = e.homeY ?? e.pos.y;
  switch (e.aiState) {
    default:
      // (sat on its perch)
      e.vel.x = 0; e.vel.y = 0; e.pos.x = hx; e.pos.y = hy;
      e.facing = dirTo(e, p.x);
      if (e.aiTimer > 60 && sees(state, e, 380, 420) && p.y > m.y) { setState(e, 'caw'); playSound('whoosh', 0.3, 6); }
      break;
    case 'caw':
      e.facing = dirTo(e, p.x);
      if (e.aiTimer > 20) {
        const d = Math.hypot(p.x - m.x, p.y - m.y) || 1;
        e.vel = { x: ((p.x - m.x) / d) * 7, y: ((p.y - m.y) / d) * 7 };
        setState(e, 'dive');
      }
      break;
    case 'dive':
      // (straight on through where he was, and out the other side)
      if (e.aiTimer > 40) setState(e, 'back');
      break;
    case 'back': {
      const dx = hx - e.pos.x, dy = hy - e.pos.y, d = Math.hypot(dx, dy) || 1;
      e.vel.x = (dx / d) * 3.5; e.vel.y = (dy / d) * 3.5;
      e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
      if (d < 6 || e.aiTimer > 160) setState(e, 'idle');
      break;
    }
  }
  if (e.aiState !== 'idle' && fly(state, e) && e.aiState === 'dive') setState(e, 'back');
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Ground critters

const rat = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player);
  tick(e);
  switch (e.aiState) {
    default: {
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 50 || !safe(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      e.vel.x = e.facing * 1.6;
      if (e.aiTimer > 30 && sees(state, e, 280, 70)) { setState(e, 'rush'); e.facing = dirTo(e, p.x); }
      break;
    }
    case 'rush':
      if (!safe(ctx, e, e.facing!, 16)) { e.vel.x = 0; setState(e, 'recover'); break; }
      e.vel.x = e.facing! * 5;
      if (e.aiTimer > 36) setState(e, 'recover');
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 30) { setState(e, 'idle'); e.homeX = e.pos.x; }
      break;
  }
  return false;
};

const cat = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, pm = mid(p), em = mid(e);
  tick(e);
  switch (e.aiState) {
    default: {
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 70 || !safe(ctx, e, e.facing, 12)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      e.vel.x = e.facing * 0.8;
      if (e.aiTimer > 30 && sees(state, e, 320, 120)) setState(e, 'hiss');
      break;
    }
    case 'hiss':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer === 2) playSound('whoosh', 0.25, 8);
      if (e.aiTimer > 26) {
        if (!grounded(e)) { setState(e, 'idle'); break; }
        const dx = pm.x - em.x, t = Math.max(16, Math.min(30, Math.abs(dx) / 7));
        e.vel.x = Math.max(-8, Math.min(8, dx / t)); e.vel.y = -6.5;
        setState(e, 'pounce');
      }
      break;
    case 'pounce':
      if (e.aiTimer > 4 && grounded(e)) setState(e, 'recover');
      break;
    case 'recover':
      if (grounded(e)) e.vel.x *= 0.8;
      if (e.aiTimer > 45) { setState(e, 'idle'); e.homeX = e.pos.x; e.aiTimer = 10; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The staff, in costume

const ghost = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 160)) setState(e, 'shuffle');
      break;
    case 'shuffle':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 60 && safe(ctx, e, e.facing) ? e.facing * 1.1 : 0;
      if (Math.abs(dx) < 110 && Math.abs(p.y - m.y) < 70 && !holdingOff(state)) setState(e, 'boo');
      break;
    case 'boo':
      e.vel.x = 0;
      if (e.aiTimer > 22) { setState(e, 'lunge'); playSound('whoosh', 0.5, 1); }
      break;
    case 'lunge':
      e.vel.x = safe(ctx, e, e.facing!, 20) ? e.facing! * (e.aiTimer < 10 ? 5 : 0) : 0;
      if (e.aiTimer > 14) setState(e, 'recover');
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 40) setState(e, 'shuffle');
      break;
  }
  return false;
};

const wolfman = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e);
  tick(e);
  switch (e.aiState) {
    default: {
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 60 || !safe(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      e.vel.x = e.facing * 0.7;
      if (e.aiTimer > 20 && sees(state, e, 520, 110)) setState(e, 'howl');
      break;
    }
    case 'howl':
      // (head back, the tell: long enough to see it coming)
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer === 4) playSound('whoosh', 0.35, -4);
      if (e.aiTimer > 32) setState(e, 'rush');
      break;
    case 'rush': {
      // Flat out, past him and on (he can't stop on a dime in that suit)
      const ahead = safe(ctx, e, e.facing!, 40);
      e.vel.x = ahead ? e.facing! * 6.5 : 0;
      const past = (p.x - m.x) * e.facing! < -140;
      if (!ahead || past || e.aiTimer > 80) setState(e, 'skid');
      break;
    }
    case 'skid':
      e.vel.x *= 0.88;
      if (e.aiTimer > 34) { e.homeX = e.pos.x; setState(e, sees(state, e, 520, 110) ? 'howl' : 'idle'); }
      break;
  }
  return false;
};

const SMASH_REACH = 92, SMASH_DMG = 22;
const monster = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 600, 160)) setState(e, 'walk');
      break;
    case 'walk':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 70 && safe(ctx, e, e.facing) ? e.facing * 0.9 : 0;
      if (Math.abs(dx) < 120 && Math.abs(p.y - m.y) < 90 && !holdingOff(state)) setState(e, 'raise');
      break;
    case 'raise':
      // (both fists up over that flat head: the tell)
      e.vel.x = 0;
      if (e.aiTimer > 34) { setState(e, 'smash'); playSound('whoosh', 0.7, -6); }
      break;
    case 'smash':
      if (e.aiTimer === 6) {
        shakeScreen(state, 14, 6);
        for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: m.x + e.facing! * 60, y: e.pos.y + e.height }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 20, color: '#78716C', size: 3 });
        const inFront = dx * e.facing! > -10 && Math.abs(dx) < SMASH_REACH && Math.abs(p.y - m.y) < 70;
        if (inFront && pl.health > 0 && pl.invincibilityTimer <= 0) hurtPlayer(ctx, SMASH_DMG, 'm2:town_monster', { x: e.facing! * 7, y: -6 }, 20);
      }
      if (e.aiTimer > 14) setState(e, 'recover');
      break;
    case 'recover':
      if (e.aiTimer > 44) setState(e, 'walk');
      break;
  }
  return false;
};

const witch = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e);
  tick(e);
  const hy = e.homeY ?? e.pos.y;
  const awake = sees(state, e, 640, 700);
  // Up in the air, off to one side of him (the side she's on), bobbing on the broom
  const side = m.x < p.x ? -1 : 1;
  // (kept to her own patch of sky: she won't follow him down the street and camp him)
  const home = e.homeX ?? e.pos.x;
  const tx = awake ? Math.max(home - 260, Math.min(home + 260, p.x + side * 250 - e.width / 2)) : home;
  // (as high over him as she started over the ground: never lower than that)
  const ty = Math.min(hy, (awake ? p.y - 200 : hy)) + Math.sin((state.frame + seedOf(e)) * 0.05) * 14;
  e.vel.x = Math.max(-3, Math.min(3, (tx - e.pos.x) * 0.03));
  e.vel.y = Math.max(-3, Math.min(3, (ty - e.pos.y) * 0.04));
  e.facing = dirTo(e, p.x);
  switch (e.aiState) {
    default:
      if (awake && e.aiTimer > 120 && Math.abs(p.x - m.x) < 370) setState(e, 'cackle');
      break;
    case 'cackle':
      e.vel.x *= 0.3; e.vel.y *= 0.3;
      if (e.aiTimer === 18) lobAt(state, m.x + e.facing! * 14, m.y - 10, 'potion', Math.max(34, Math.min(60, Math.abs(p.x - m.x) / 5)));
      if (e.aiTimer > 30) { setState(e, 'idle'); e.aiTimer = -Math.floor(Math.random() * 30); }
      break;
  }
  fly(state, e);
  return true;
};

const skeleton = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x;
  tick(e);
  const awake = sees(state, e, 560, 160);
  // (the tombstone kept to him, whichever way he goes: except with it down, throwing)
  if (e.aiState !== 'throw') { e.facing = dirTo(e, p.x); e.isShieldActive = true; }
  switch (e.aiState) {
    default:
      e.vel.x = awake && Math.abs(dx) > 170 && safe(ctx, e, e.facing!) ? e.facing! * 0.8 : 0;
      if (awake) e.shootTimer++;
      if (e.shootTimer > 140) setState(e, 'throw');
      break;
    case 'throw':
      e.vel.x = 0; e.isShieldActive = false;
      if (e.aiTimer === 14) lobAt(state, m.x + e.facing! * 10, e.pos.y + 10, 'bone', Math.max(28, Math.min(50, Math.abs(dx) / 5.5)));
      if (e.aiTimer > 34) { e.shootTimer = Math.floor(Math.random() * 40); setState(e, 'idle'); }
      break;
  }
  return false;
};

/** The pumpkin-head at the top of the stairs (a thrower): heaves a jack-o'-lantern over his head (the tell) and rolls
 *  it down at him, as long as he's on the way up; up close, he shoves. Stop him and the pumpkins stop. */
const pumpkinhead = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e);
  tick(e);
  e.facing = dirTo(e, p.x);
  e.vel.x = 0;
  const below = alive(state) && p.x < m.x - 60 && p.x > X(STAIRS.a0 - 300) && !holdingOff(state);
  switch (e.aiState) {
    default:
      if (below && e.aiTimer > 120) setState(e, 'heave');
      break;
    case 'heave':
      if (e.aiTimer === 22) rollPumpkin(state, m.x - 30);
      if (e.aiTimer > 34) setState(e, 'idle');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------

const flyer = (b: Enemy): Enemy => ({ ...b, enemyType: 'flyer', initialY: b.pos.y });
const personGender = (e: Enemy) => (lookOf(seedOf(e)).woman ? 'f' : 'm') as 'm' | 'f';

registerM2Kind({ kind: 'm2:town_bat', stats: { w: 28, h: 18, hp: 14, contact: 7, mass: 3, air: true }, ai: bat, make: flyer, draw: (c, e, f) => drawBat(c, e, f), head: { x: 4, y: -10, r: 6 }, gender: 'n', grab: 'critter' });
registerM2Kind({ kind: 'm2:town_crow', stats: { w: 30, h: 22, hp: 14, contact: 8, mass: 3, air: true }, ai: crow, make: flyer, draw: (c, e, f) => drawCrow(c, e, f), head: { x: 9, y: -16, r: 5 }, gender: 'n', grab: 'critter' });
registerM2Kind({ kind: 'm2:town_rat', stats: { w: 30, h: 14, hp: 14, contact: 6, mass: 4 }, ai: rat, draw: (c, e, f) => drawRat(c, e, f), head: { x: 11, y: -8, r: 5 }, gender: 'n', grab: 'critter' });
registerM2Kind({ kind: 'm2:town_cat', stats: { w: 36, h: 24, hp: 14, contact: 9, mass: 6 }, ai: cat, draw: (c, e, f) => drawCat(c, e, f), head: { x: 13, y: -18, r: 6 }, gender: 'n', grab: 'critter' });
registerM2Kind({ kind: 'm2:town_ghost', stats: { w: 38, h: 64, hp: 90, contact: 8, mass: 180 }, ai: ghost, humanoid: true, gender: personGender, head: { x: 2, y: -54, r: 9 }, draw: (c, e, f) => drawGhost(c, e, f, seedOf(e)) });
registerM2Kind({ kind: 'm2:town_wolfman', stats: { w: 42, h: 74, hp: 160, contact: 14, mass: 220 }, ai: wolfman, humanoid: true, gender: personGender, head: { x: 4, y: -64, r: 10 }, draw: (c, e, f) => drawWolfman(c, e, f, seedOf(e)) });
registerM2Kind({ kind: 'm2:town_monster', stats: { w: 54, h: 94, hp: 340, contact: 12, mass: 420 }, ai: monster, humanoid: true, gender: personGender, head: { x: 2, y: -88, r: 11 }, draw: (c, e, f) => drawMonster(c, e, f, seedOf(e)) });
registerM2Kind({ kind: 'm2:town_witch', stats: { w: 44, h: 56, hp: 100, contact: 10, mass: 160, air: true }, ai: witch, make: flyer, humanoid: true, gender: personGender, head: { x: 4, y: -50, r: 9 }, draw: (c, e, f) => drawWitch(c, e, f, seedOf(e)) });
registerM2Kind({
  kind: 'm2:town_skeleton', stats: { w: 48, h: 68, hp: 160, contact: 9, mass: 260 }, ai: skeleton, humanoid: true, gender: personGender, head: { x: 2, y: -60, r: 9 },
  make: b => ({ ...b, enemyType: 'shield', isShieldActive: true, shootTimer: 60 }),
  draw: (c, e, f) => drawSkeleton(c, e, f, seedOf(e)),
});
registerM2Kind({ kind: 'm2:town_pumpkinhead', stats: { w: 46, h: 80, hp: 120, contact: 9, mass: 240 }, ai: pumpkinhead, humanoid: true, gender: personGender, head: { x: 0, y: -66, r: 14 }, draw: (c, e, f) => drawPumpkinHead(c, e, f, seedOf(e)) });
