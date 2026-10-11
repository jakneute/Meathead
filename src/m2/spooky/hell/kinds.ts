// Real hell's wildlife (Meathead 2's own kinds; no costumed park staff down here, it's the real thing):
//   imp:   a thrower. Small, red, hops about; sees him, keeps its distance and lobs fireballs at him in an arc (the ball
//          glows in its fist first: the tell).
//   hound: a rusher. A black dog with its mane on fire: prowls; sees him, runs him down, crouches and pounces.
//   bat:   a flyer. A bat with burning wings: circles its patch of air, folds and dives at him, climbs back.
//   goat:  a pointy bruiser. A big horned hell goat: plods at him; level with him, it lowers its horns, paws and
//          charges a short way. Horns out front: shoulder charging it head-on runs him onto them.
// Taught one at a time along the way (see layout.ts), then mixed. Anything (not flying) that ends up in the lava cooks.
// Drawn (creatures.ts) at the origin (feet), facing right; the engine turns them.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { GY } from '../geometry';
import { drawImpArt, drawHoundArt, drawBatArt, drawGoatArt } from './creatures';
import { POOLS } from './layout';
import { hellOf } from './state';
import {
  HURT_IMP, DEATH_IMP, HURT_IMP_FIRE, DEATH_IMP_FIRE, HURT_HOUND, DEATH_HOUND, HURT_BAT, DEATH_BAT, HURT_GOAT, DEATH_GOAT,
  HURT_HORNS, DEATH_HORNS,
} from './lines';

export const HELL_KINDS = { imp: 'm2:imp', hound: 'm2:hellhound', bat: 'm2:firebat', goat: 'm2:hellgoat' } as const;
export const IMP_FIRE = 'm2:imp_fire';

const mid = (o: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry && state.player.health > 0 && !state.player.inCutscene;
};
const toward = (state: GameState, e: Enemy) => ((mid(state.player).x < mid(e).x ? -1 : 1) as 1 | -1);
/** Is x over lava? */
export const overLava = (x: number) => POOLS.some(([a, b]) => x > a && x < b);
/** Nothing safe to stand on just ahead (lava, or a drop): it stops there. */
const unsafeAhead = (state: GameState, e: Enemy, dir: number) => {
  const ax = mid(e).x + dir * (e.width / 2 + 14);
  const top = floorTopAt(state.blocks, ax, e.pos.y + e.height, 30);
  return top === null || (overLava(ax) && top >= GY);
};
const grounded = (e: Enemy) => Math.abs(e.vel.y) < 0.01;

// ---------------------------------------------------------------------------------------------------------------
// The AIs

const impAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx);
  switch (e.aiState) {
    case 'idle':
    default:
      e.vel.x = 0;
      if (grounded(e) && e.aiTimer % 50 === 0) e.vel.y = -4.5;
      if (sees(state, e, 560, 300)) { e.aiState = 'aim'; e.aiTimer = Math.floor(Math.random() * 30); playSound('snort', 0.4, 14); }
      break;
    case 'aim': {
      e.facing = toward(state, e);
      // (too close: it backs off, if there's somewhere to back off to)
      const back = -e.facing;
      e.vel.x = adx < 150 && !unsafeAhead(state, e, back) ? back * 1.8 : 0;
      if (grounded(e) && e.aiTimer % 40 === 20) e.vel.y = -3;
      if (e.aiTimer > 80 && grounded(e)) { e.aiState = 'wind'; e.aiTimer = 0; }
      if (!sees(state, e, 820, 420)) { e.aiState = 'idle'; e.aiTimer = 0; }
      break;
    }
    case 'wind':
      e.vel.x = 0; e.facing = toward(state, e);
      if (e.aiTimer > 26) {
        // (lobbed to come down on him, about 40 frames out)
        const T = 42, sx = m.x + e.facing * 10, sy = e.pos.y + 6;
        const vx = Math.max(-8, Math.min(8, (p.x - sx) / T)), vy = Math.max(-11, (p.y - sy) / T - 0.125 * T);
        hellOf(state).shots.push({ x: sx, y: sy, vx, vy, life: 200 });
        playSound('ignite', 0.5, 8);
        e.aiState = 'aim'; e.aiTimer = Math.floor(Math.random() * 25);
      }
      break;
  }
  return false;
};

const houndAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), adx = Math.abs(p.x - m.x);
  switch (e.aiState) {
    case 'idle':
    default: {
      const home = e.homeX ?? e.pos.x;
      if (e.facing === undefined) e.facing = -1;
      if (Math.abs(e.pos.x - home) > 70 || unsafeAhead(state, e, e.facing)) e.facing = (-e.facing) as 1 | -1;
      e.vel.x = e.facing * 1;
      if (sees(state, e, 500, 200)) { e.aiState = 'run'; e.aiTimer = 0; playSound('snort', 0.7, 2); }
      break;
    }
    case 'run':
      e.facing = toward(state, e);
      e.vel.x = adx > 30 && !unsafeAhead(state, e, e.facing) ? e.facing * 4.2 : 0;
      if (grounded(e) && adx < 160 && Math.abs(p.y - m.y) < 80 && e.aiTimer > 20) { e.aiState = 'crouch'; e.aiTimer = 0; }
      // (him up on a rock: up after him)
      else if (grounded(e) && p.y < m.y - 60 && adx < 200 && e.aiTimer > 30) { e.vel.y = -12; e.vel.x = e.facing * 3.6; e.aiTimer = 0; }
      if (!sees(state, e, 800, 400)) { e.aiState = 'idle'; e.aiTimer = 0; e.homeX = e.pos.x; }
      break;
    case 'crouch':
      e.vel.x = 0; e.facing = toward(state, e);
      if (e.aiTimer > 16) { e.aiState = 'pounce'; e.aiTimer = 0; e.vel.x = e.facing * 9; e.vel.y = -6.5; playSound('snort', 0.9, -2); }
      break;
    case 'pounce':
      if (grounded(e) && e.aiTimer > 4) { e.aiState = 'recover'; e.aiTimer = 0; }
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 36) { e.aiState = 'run'; e.aiTimer = 0; }
      break;
  }
  return false;
};

const batAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  const homeX = e.homeX ?? e.pos.x, homeY = e.homeY ?? e.pos.y;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const m = mid(e), p = mid(state.player);
  switch (e.aiState) {
    case 'idle':
    default: {
      const t = (state.frame + homeX) * 0.025;
      const tx = homeX + Math.cos(t) * 110, ty = homeY + Math.sin(t * 2.3) * 24;
      e.vel.x = (tx - e.pos.x) * 0.07; e.vel.y = (ty - e.pos.y) * 0.07;
      e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
      if (e.aiTimer > 80 && Math.abs(p.x - m.x) < 340 && p.y > m.y + 30 && sees(state, e, 400, 500)) {
        // (a shriek and a beat hung there, wings up: the tell)
        e.aiState = 'tell'; e.aiTimer = 0; playSound('snort', 0.5, 16);
      }
      break;
    }
    case 'tell':
      e.vel.x *= 0.8; e.vel.y *= 0.8;
      if (e.aiTimer > 14) {
        e.aiState = 'dive'; e.aiTimer = 0; e.aiX = p.x; e.aiY = p.y;
        const len = Math.hypot(p.x - m.x, p.y - m.y) || 1;
        e.vel = { x: ((p.x - m.x) / len) * 7.5, y: ((p.y - m.y) / len) * 7.5 };
        e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
        playSound('whoosh', 0.5, 6);
      }
      break;
    case 'dive':
      if (Math.hypot((e.aiX ?? m.x) - m.x, (e.aiY ?? m.y) - m.y) < 14 || m.y > (e.aiY ?? m.y) + 10 || e.aiTimer > 70) { e.aiState = 'climb'; e.aiTimer = 0; }
      break;
    case 'climb':
      e.vel.x *= 0.95; e.vel.y = Math.max(-4, e.vel.y - 0.5);
      if (e.pos.y <= homeY) { e.aiState = 'idle'; e.aiTimer = 0; }
      break;
  }
  const floor = floorTopAt(state.blocks, m.x, e.pos.y + e.height, 0);
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  if (floor !== null && e.pos.y + e.height > floor) { e.pos.y = floor - e.height; if (e.aiState === 'dive') { e.aiState = 'climb'; e.aiTimer = 0; } }
  return true;
};

const goatAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), adx = Math.abs(p.x - m.x), level = Math.abs(p.y - m.y) < 70;
  switch (e.aiState) {
    case 'idle':
    default:
      e.facing = toward(state, e);
      e.vel.x = sees(state, e, 600, 160) && adx > 60 && !unsafeAhead(state, e, e.facing) ? e.facing * 0.9 : 0;
      if (sees(state, e, 380, 70) && level && e.aiTimer > 40) { e.aiState = 'paw'; e.aiTimer = 0; playSound('bellow', 0.6, 4); }
      break;
    case 'paw':
      e.vel.x = 0; e.facing = toward(state, e);
      if (e.aiTimer % 10 === 0) state.particles.push({ pos: { x: m.x - e.facing * 20, y: e.pos.y + e.height - 2 }, vel: { x: -e.facing * 2, y: -1.5 }, life: 20, color: '#78350F', size: 5, grav: 0.15 });
      if (e.aiTimer > 36) { e.aiState = 'charge'; e.aiTimer = 0; }
      break;
    case 'charge':
      e.vel.x = e.facing! * 6.4;
      if (unsafeAhead(state, e, e.facing!) || e.aiTimer > 55) { e.aiState = 'skid'; e.aiTimer = 0; }
      if (e.aiTimer % 10 === 0 && Math.abs(m.x - state.player.pos.x) < 600) shakeScreen(state, 2, 2);
      break;
    case 'skid':
      e.vel.x *= 0.82;
      if (e.aiTimer > 44) { e.aiState = 'idle'; e.aiTimer = 0; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawn in creatures.ts (the jungle animals' finish: stamped frames, stepped ramps, ink)

registerM2Kind({ kind: 'm2:imp', stats: { w: 26, h: 42, hp: 45, contact: 8, mass: 60 }, ai: impAI, draw: drawImpArt, head: { x: 0, y: -34, r: 8 }, gender: 'n', grab: 'critter' });
registerM2Kind({ kind: 'm2:hellhound', stats: { w: 60, h: 44, hp: 100, contact: 12, mass: 150 }, ai: houndAI, draw: drawHoundArt, head: { x: 32, y: -36, r: 9 }, gender: 'n', grab: 'body' });
registerM2Kind({
  kind: 'm2:firebat', stats: { w: 34, h: 22, hp: 30, contact: 9, mass: 30, air: true }, ai: batAI, draw: drawBatArt, head: { x: 0, y: -12, r: 6 }, gender: 'n', grab: 'critter',
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }),
});
registerM2Kind({
  kind: 'm2:hellgoat', stats: { w: 68, h: 64, hp: 220, contact: 14, mass: 420 }, ai: goatAI, draw: drawGoatArt, head: { x: 32, y: -54, r: 10 }, gender: 'n', grab: 'none',
  pointy: { source: 'm2:hellgoat_horns', label: 'HORNED!', damage: 16 },
});

registerHurtLines('m2:imp', HURT_IMP, DEATH_IMP);
registerHurtLines(IMP_FIRE, HURT_IMP_FIRE, DEATH_IMP_FIRE);
registerDeathKind(IMP_FIRE, 'burnt');
registerHurtLines('m2:hellhound', HURT_HOUND, DEATH_HOUND);
registerHurtLines('m2:firebat', HURT_BAT, DEATH_BAT);
registerHurtLines('m2:hellgoat', HURT_GOAT, DEATH_GOAT);
registerHurtLines('m2:hellgoat_horns', HURT_HORNS, DEATH_HORNS);
