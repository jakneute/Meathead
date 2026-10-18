// The wilds' animals (Meathead 2's own kinds, registered when Wilderness Land is loaded; real animals the park stocked
// "for authenticity"):
//
//   doe        grazes; bolts away when he comes close (her white tail up); come up behind her and she kicks back
//   buck       paws the ground and snorts (the tell), then charges head down; a charge into his ANTLERS hurts (pointy)
//   wolf       roams; sees him, stalks in low (hackles up), crouches (a growl: the tell), lunges; they come in packs
//   cougar     crouched up on a ledge; sees him below or level, tail twitching (the tell), and pounces at where he is
//   beaver     in the water: swims to him (on his log or swimming), surfaces and slaps its tail or bites
//   rattler    in its hole: peeks out; near, it rears and RATTLES (the tell), then strikes out a good way
//   crow       circles its patch of sky, then swoops at him and climbs back
//   porcupine  waddles about; facing it up close, it turns its back and bristles; DIVE KICKING onto it hurts (spiky)
//   bison      grazes; sees him, paws and snorts (a long tell), then CHARGES a long way, plowing through anything in its
//              way (the other animals too); a charge into its horns hurts (pointy)
//   hive       a beehive hanging off a branch (shoot it down: the swarm, hazards.ts)
//
// The small ones (doe, wolf, beaver, rattler, crow, porcupine) go down to a charge, a slide or an uppercut. Every one
// has its hurt and death lines (lines.ts).

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { GRAVITY } from '../../../m1/constants';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { hazardHit, hazardVictims, boxHits } from '../../hazardHit';
import { HURT } from './lines';
import { WATERS } from './layout';
import { surfaceY } from './water';
import { drawDoe, drawBuck, drawWolf, drawCougar, drawBeaver, drawRattler, drawCrow, drawPorcupine, drawBison, drawHive } from './kindArt';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const alive = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const grounded = (e: Enemy) => e.vel.y === 0;
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return alive(state) && !holdingOff(state) && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};
/** Roam about home (a slow walk, turned back at its edge or at a drop). */
const roam = (ctx: FrameContext, e: Enemy, range: number, speed: number) => {
  const home = e.homeX ?? e.pos.x;
  e.facing ??= -1;
  if (Math.abs(e.pos.x - home) > range || !safeAhead(ctx, e, e.facing, 14)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
  e.vel.x = e.facing * speed;
};
/** A hit on him from close in front of it (a kick, a bite, a strike): the damage, its source, a knock. */
const strike = (ctx: FrameContext, e: Enemy, box: { x: number; y: number; w: number; h: number }, dmg: number, source: string, knock = 5) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0 || p.inCutscene) return false;
  if (p.pos.x < box.x + box.w && p.pos.x + p.width > box.x && p.pos.y < box.y + box.h && p.pos.y + p.height > box.y) {
    hurtPlayer(ctx, dmg, source, { x: (mid(p).x < mid(e).x ? -1 : 1) * knock, y: -4 });
    return true;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Deer

const doe = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const pm = mid(p), em = mid(e);
  switch (e.aiState) {
    default:
      // (grazing, a step now and then)
      e.aiState = 'graze';
      break;
    case 'graze':
      e.vel.x = Math.sin((e.aiTimer ?? 0) * 0.01 + (e.variant ?? 0)) > 0.85 ? (e.facing ?? 1) * 0.6 : 0;
      if (sees(state, e, 260, 120)) {
        // (behind her and close: the kick; else off she goes)
        const behind = dirTo(e, pm.x) !== e.facing;
        if (behind && Math.abs(pm.x - em.x) < 70) setState(e, 'kick');
        else { setState(e, 'bolt'); e.facing = -dirTo(e, pm.x) as 1 | -1; playSound('snort', 0.6, 8); }
      }
      break;
    case 'bolt':
      e.vel.x = e.facing! * 4.6;
      if (!safeAhead(ctx, e, e.facing!, 30)) { e.vel.x = 0; setState(e, 'kick'); e.facing = -dirTo(e, pm.x) as 1 | -1; break; }
      if (grounded(e) && e.aiTimer! % 22 === 0) e.vel.y = -4.2;
      if (e.aiTimer! > 70) { setState(e, 'graze'); e.homeX = e.pos.x; }
      break;
    case 'kick':
      // (her back to him, both hind legs out: a hit behind her)
      e.vel.x = 0;
      e.facing = -dirTo(e, pm.x) as 1 | -1;
      if (e.aiTimer === 10) { playSound('whoosh', 0.6, 6); strike(ctx, e, { x: e.facing! > 0 ? e.pos.x - 34 : e.pos.x + e.width, y: e.pos.y + 6, w: 34, h: e.height }, 10, 'm2:fr_doe', 7); }
      if (e.aiTimer! > 30) setState(e, sees(state, e, 120, 100) ? 'bolt' : 'graze');
      break;
  }
  return false;
};

const buck = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const pm = mid(p);
  switch (e.aiState) {
    default:
      roam(ctx, e, 80, 0.8);
      if (sees(state, e, 400, 110) && e.aiTimer! > 30) { setState(e, 'paw'); playSound('snort', 0.8, 0); }
      break;
    case 'paw':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 34) { setState(e, 'charge'); playSound('bellow', 0.6, 6); }
      break;
    case 'charge':
      if (!safeAhead(ctx, e, e.facing!, 30) || e.aiTimer! > 80) { setState(e, 'recover'); e.vel.x = 0; break; }
      e.vel.x = e.facing! * 6.4;
      if (strike(ctx, e, { x: e.pos.x, y: e.pos.y, w: e.width, h: e.height }, 16, 'm2:fr_buck', 9)) setState(e, 'recover');
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer! > 50) { setState(e, 'idle'); e.homeX = e.pos.x; e.aiTimer = 10; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Wolves (a pack: the first one to see him howls, and the rest come)

const wolf = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const pm = mid(p), em = mid(e);
  switch (e.aiState) {
    default:
      roam(ctx, e, 60, 0.9);
      if (sees(state, e, 440, 200)) {
        setState(e, 'stalk');
        // (the howl: the pack's all on him)
        if (!state.enemies.some(o => o !== e && o.kind === 'm2:fr_wolf' && o.aiState !== 'idle' && Math.abs(o.pos.x - e.pos.x) < 500)) playSound('bellow', 0.7, 14);
        for (const o of state.enemies) if (o !== e && o.kind === 'm2:fr_wolf' && o.aiState === 'idle' && o.health > 0 && Math.abs(o.pos.x - e.pos.x) < 400) setState(o, 'stalk');
      }
      break;
    case 'stalk': {
      // (in low, to a lunge's distance, a little circling)
      e.facing = dirTo(e, pm.x);
      const d = Math.abs(pm.x - em.x), want = 140 + ((e.variant ?? 0) % 3) * 30;
      e.vel.x = d > want + 20 ? e.facing * 2.6 : d < want - 30 ? -e.facing * 1.4 : Math.sin((e.aiTimer ?? 0) * 0.08) * 0.8;
      if (!safeAhead(ctx, e, Math.sign(e.vel.x) || e.facing, 20)) e.vel.x = 0;
      if (e.aiTimer! > 40 && Math.abs(d - want) < 40 && grounded(e)) { setState(e, 'crouch'); playSound('snort', 0.5, -4); }
      if (!sees(state, e, 700, 320)) setState(e, 'idle');
      break;
    }
    case 'crouch':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 16) {
        if (grounded(e) && safeAhead(ctx, e, e.facing, 40)) {
          const dx = pm.x - em.x;
          e.vel.x = Math.max(-8.5, Math.min(8.5, dx / 18)); e.vel.y = -5.5;
          setState(e, 'lunge');
        } else setState(e, 'stalk');
      }
      break;
    case 'lunge':
      if (e.aiTimer! > 3) strike(ctx, e, { x: e.pos.x, y: e.pos.y, w: e.width, h: e.height }, 10, 'm2:fr_wolf', 6);
      if (e.aiTimer! > 4 && grounded(e)) setState(e, 'recover');
      break;
    case 'recover':
      if (grounded(e)) e.vel.x *= 0.8;
      if (e.aiTimer! > 32) setState(e, 'stalk');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Cougar

const cougar = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const pm = mid(p), em = mid(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      e.facing = dirTo(e, pm.x);
      if (sees(state, e, 380, 360) && pm.y > em.y - 40 && e.aiTimer! > 30) { setState(e, 'crouch'); playSound('roar', 0.5, 8); }
      break;
    case 'crouch':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 30) {
        if (!grounded(e) || !sees(state, e, 460, 400)) { setState(e, 'idle'); break; }
        const dx = pm.x - em.x, dy = pm.y - (e.pos.y + e.height - 20);
        const t = Math.max(18, Math.min(40, Math.abs(dx) / 8));
        e.vel.x = Math.max(-10, Math.min(10, dx / t));
        e.vel.y = Math.max(-16, Math.min(-5, (dy - 0.5 * GRAVITY * t * t) / t));
        setState(e, 'pounce');
      }
      break;
    case 'pounce':
      strike(ctx, e, { x: e.pos.x, y: e.pos.y, w: e.width, h: e.height }, 16, 'm2:fr_cougar', 8);
      if (e.aiTimer! > 4 && grounded(e)) setState(e, 'recover');
      break;
    case 'recover':
      if (grounded(e)) e.vel.x *= 0.82;
      if (e.aiTimer! > 46) { setState(e, 'prowl'); e.homeX = e.pos.x; }
      break;
    case 'prowl':
      roam(ctx, e, 70, 1.2);
      if (e.aiTimer! > 30 && sees(state, e, 380, 300)) setState(e, 'crouch');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Beaver (in the water: moves itself, at the surface)

const beaver = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const em = mid(e), pm = mid(p);
  const W = WATERS.find(w => em.x > w.a - 4 && em.x < w.b + 4) ?? WATERS[0];
  const s = surfaceY(W);
  const near = alive(state) && Math.abs(pm.x - em.x) < 360 && pm.y > s - 160 && pm.x > W.a && pm.x < W.b;
  let vx = 0;
  switch (e.aiState) {
    default:
      vx = Math.sin(((e.aiTimer ?? 0) + (e.variant ?? 0) * 40) * 0.02) * 0.8;
      if (near) setState(e, 'swim');
      break;
    case 'swim': {
      e.facing = dirTo(e, pm.x);
      const d = Math.abs(pm.x - em.x);
      vx = d > 40 ? e.facing * 2.2 : 0;
      if (d < 56 && e.aiTimer! > 20) setState(e, p.swimming ? 'bite' : 'slap');
      if (!near) setState(e, 'idle');
      break;
    }
    case 'slap':
      if (e.aiTimer === 10) {
        playSound('splash', 0.7, 6);
        for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: em.x - e.facing! * 14, y: s }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 5 }, life: 24, color: '#BAE6FD', size: 3 });
        strike(ctx, e, { x: em.x - 50, y: s - 90, w: 100, h: 100 }, 8, 'm2:fr_beaver', 5);
      }
      if (e.aiTimer! > 40) setState(e, 'swim');
      break;
    case 'bite':
      e.facing = dirTo(e, pm.x);
      if (e.aiTimer === 8) strike(ctx, e, { x: em.x - 30, y: e.pos.y - 20, w: 60, h: e.height + 40 }, 8, 'm2:fr_beaver', 3);
      if (e.aiTimer! > 30) setState(e, 'swim');
      break;
  }
  const nx = Math.max(W.a + 4, Math.min(W.b - 4 - e.width, e.pos.x + vx + W.current * 0.2));
  e.vel.x = nx - e.pos.x; e.vel.y = 0;
  e.pos.x = nx;
  e.pos.y = s + 10 - e.height + Math.sin((state.frame + (e.variant ?? 0) * 30) * 0.08) * 1.5;
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Rattlesnake (stays at its hole)

const rattler = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const pm = mid(p), em = mid(e);
  e.vel.x = 0; e.vel.y = 0;
  e.facing = dirTo(e, pm.x);
  const d = Math.abs(pm.x - em.x);
  switch (e.aiState) {
    default:
      e.aiState = 'hide';
      break;
    case 'hide':
      if (alive(state) && d < 170 && Math.abs(pm.y - em.y) < 90 && e.aiTimer! > 30) { setState(e, 'rattle'); }
      break;
    case 'rattle':
      if (e.aiTimer! % 6 === 0) playSound('click', 0.35, 12 + (e.aiTimer! % 12 ? 2 : 0));
      if (e.aiTimer! > 36) { setState(e, 'strike'); playSound('whoosh', 0.5, 10); }
      if (d > 230) setState(e, 'hide');
      break;
    case 'strike':
      if (e.aiTimer! >= 4 && e.aiTimer! <= 12) strike(ctx, e, { x: e.facing! > 0 ? em.x : em.x - 58, y: e.pos.y - 26, w: 58, h: 40 }, 9, 'm2:fr_rattler', 4);
      if (e.aiTimer! > 22) setState(e, 'coil');
      break;
    case 'coil':
      if (e.aiTimer! > 40) setState(e, d < 170 ? 'rattle' : 'hide');
      break;
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Crow

const crow = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const hx = e.homeX ?? e.pos.x, hy = e.homeY ?? e.pos.y;
  const m = mid(e), pm = mid(p);
  switch (e.aiState) {
    default: {
      const t = (state.frame + hx) * 0.02;
      const tx = hx + Math.sin(t) * 140, ty = hy + Math.sin(t * 2) * 24;
      e.vel.x = (tx - e.pos.x) * 0.05; e.vel.y = (ty - e.pos.y) * 0.05;
      e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
      if (e.aiTimer! > 90 && sees(state, e, 360, 380)) {
        setState(e, 'swoop'); e.aiX = pm.x; e.aiY = pm.y;
        const d = Math.hypot(pm.x - m.x, pm.y - m.y) || 1;
        e.vel = { x: ((pm.x - m.x) / d) * 6.5, y: ((pm.y - m.y) / d) * 6.5 };
        e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
        playSound('chitter', 0.4, -6);
      }
      break;
    }
    case 'swoop':
      if (Math.hypot((e.aiX ?? m.x) - m.x, (e.aiY ?? m.y) - m.y) < 16 || e.aiTimer! > 60) setState(e, 'climb');
      break;
    case 'climb':
      e.vel.x *= 0.96; e.vel.y = Math.max(-4, e.vel.y - 0.4);
      if (e.pos.y <= hy || e.aiTimer! > 90) setState(e, 'idle');
      break;
  }
  const floor = floorTopAt(state.blocks, m.x, e.pos.y + e.height, 0);
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  if (floor !== null && e.pos.y + e.height > floor) { e.pos.y = floor - e.height; if (e.aiState === 'swoop') setState(e, 'climb'); }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Porcupine

const porcupine = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const pm = mid(p), em = mid(e);
  switch (e.aiState) {
    default:
      roam(ctx, e, 60, 0.5);
      if (sees(state, e, 110, 80)) { setState(e, 'bristle'); e.facing = -dirTo(e, pm.x) as 1 | -1; playSound('crack', 0.3, 10); }
      break;
    case 'bristle':
      // (its back to him, quills out: backing into him)
      e.facing = -dirTo(e, pm.x) as 1 | -1;
      e.vel.x = Math.abs(pm.x - em.x) > 30 ? -e.facing * 0.9 : 0;
      if (!safeAhead(ctx, e, -e.facing, 14)) e.vel.x = 0;
      if (e.aiTimer! > 30 && strike(ctx, e, { x: e.pos.x - 8, y: e.pos.y - 14, w: e.width + 16, h: e.height + 14 }, 8, 'm2:fr_porcupine', 5)) setState(e, 'idle');
      if (!sees(state, e, 180, 100)) setState(e, 'idle');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Bison (a long charge, plowing whatever's in its way)

const bison = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const pm = mid(p);
  switch (e.aiState) {
    default:
      roam(ctx, e, 50, 0.35);
      if (sees(state, e, 520, 140) && e.aiTimer! > 40) { setState(e, 'paw'); playSound('snort', 1, -10); }
      break;
    case 'paw':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 20 === 0) playSound('thud', 0.4, -12);
      if (e.aiTimer! > 56) { setState(e, 'charge'); playSound('bellow', 1, -12); shakeScreen(state, 4, 3); }
      break;
    case 'charge': {
      if (!safeAhead(ctx, e, e.facing!, 40) || e.aiTimer! > 120) { setState(e, 'skid'); break; }
      e.vel.x = e.facing! * 7;
      if (e.aiTimer! % 10 === 0) { playSound('thud', 0.5, -14); shakeScreen(state, 2, 2); }
      if (strike(ctx, e, { x: e.pos.x, y: e.pos.y, w: e.width, h: e.height }, 22, 'm2:fr_bison', 14)) { shakeScreen(state, 8, 4); }
      // (whatever's in its way: plowed)
      for (const o of hazardVictims(state)) if (o !== e && boxHits(o, e.pos.x + (e.facing! > 0 ? e.width - 10 : -10), e.pos.y, 20, e.height)) hazardHit(ctx, o, 50, mid(e).x, 'TRAMPLED!', { knock: 14 });
      break;
    }
    case 'skid':
      e.vel.x *= 0.88;
      if (e.aiTimer! > 60) { setState(e, 'idle'); e.homeX = e.pos.x; e.facing = -e.facing! as 1 | -1; e.aiTimer = 20; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The beehive (hangs where it's put, swaying; nothing else)

const hive = (_ctx: FrameContext, e: Enemy) => { e.vel.x = 0; e.vel.y = 0; return true; };

// ---------------------------------------------------------------------------------------------------------------

const flyer = (b: Enemy): Enemy => ({ ...b, enemyType: 'flyer', initialY: b.pos.y });

registerM2Kind({ kind: 'm2:fr_doe', stats: { w: 50, h: 46, hp: 26, contact: 6, mass: 38 }, ai: doe, draw: drawDoe, head: { x: 22, y: -48, r: 7 }, gender: 'n', grab: 'body' });
registerM2Kind({ kind: 'm2:fr_buck', stats: { w: 58, h: 54, hp: 70, contact: 10, mass: 90 }, ai: buck, draw: drawBuck, head: { x: 26, y: -56, r: 8 }, gender: 'n', grab: 'body', pointy: { source: 'm2:fr_antlers', label: 'ANTLERS!', damage: 14 } });
registerM2Kind({ kind: 'm2:fr_wolf', stats: { w: 50, h: 32, hp: 26, contact: 8, mass: 36 }, ai: wolf, draw: drawWolf, head: { x: 24, y: -26, r: 7 }, gender: 'n', grab: 'body', pathing: true });
registerM2Kind({ kind: 'm2:fr_cougar', stats: { w: 66, h: 34, hp: 80, contact: 14, mass: 70 }, ai: cougar, draw: drawCougar, head: { x: 30, y: -28, r: 8 }, gender: 'n', grab: 'body' });
registerM2Kind({ kind: 'm2:fr_beaver', stats: { w: 32, h: 26, hp: 14, contact: 6, mass: 20, air: true }, ai: beaver, make: flyer, draw: drawBeaver, head: { x: 12, y: -16, r: 6 }, gender: 'n', grab: 'critter', pathing: false });
registerM2Kind({ kind: 'm2:fr_rattler', stats: { w: 30, h: 22, hp: 12, contact: 6, mass: 4 }, ai: rattler, draw: drawRattler, head: { x: 8, y: -14, r: 5 }, gender: 'n', grab: 'critter', pathing: false });
registerM2Kind({ kind: 'm2:fr_crow', stats: { w: 26, h: 18, hp: 10, contact: 6, mass: 3, air: true }, ai: crow, make: flyer, draw: drawCrow, head: { x: 9, y: -12, r: 5 }, gender: 'n', grab: 'critter' });
registerM2Kind({ kind: 'm2:fr_porcupine', stats: { w: 36, h: 24, hp: 20, contact: 8, mass: 18 }, ai: porcupine, draw: drawPorcupine, head: { x: 13, y: -9, r: 5 }, gender: 'n', grab: 'critter', spiky: { source: 'm2:fr_quills', label: 'QUILLS!', damage: 12 } });
registerM2Kind({ kind: 'm2:fr_bison', stats: { w: 100, h: 68, hp: 220, contact: 16, mass: 600 }, ai: bison, draw: drawBison, head: { x: 42, y: -32, r: 12 }, gender: 'n', grab: 'none', pointy: { source: 'm2:fr_horns', label: 'HORNS!', damage: 18 } });
registerM2Kind({ kind: 'm2:fr_hive', stats: { w: 22, h: 30, hp: 4, contact: 0, mass: 2, air: true }, ai: hive, make: (b) => ({ ...flyer(b), harmless: true }), draw: drawHive, head: { x: 0, y: -15, r: 9 }, gender: 'n', grab: 'critter', fixture: true });