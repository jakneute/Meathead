// The dino park's robot dinosaurs (Meathead 2's own kinds, all machines: scrap, sparks and oil, not gore; the
// crossbow has them barfing bolts, the spawner's litter chews them down to a steel endoskeleton). Friendly mode till
// the switch goes over (see the pebble cutscene in index.ts): eyes blue, standing about doing their bit for the kids,
// harmless. Hostile: eyes red, and:
//   raptor: prowls; sees him, runs him down, leaps up onto ledges after him, crouches and pounces.
//   trike:  stands its ground; sees him level with it, paws, and charges (it doesn't leap: get up out of its way).
//   ptero:  circles its patch of sky, folds and dives at him, climbs back.
//   rex:    the big one, the paddock's sub-boss: its own file (rex.ts).
// The look: art/robots.ts.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { getAdv } from '../section';
import { drawRaptorBot, drawTrikeBot, drawPteroBot } from './art/robots';
import { HURT_RAPTOR, DEATH_RAPTOR, HURT_TRIKE, DEATH_TRIKE, HURT_HORNS, DEATH_HORNS, HURT_PTERO, DEATH_PTERO } from './lines';


/** What the dino park's own state says about the robots: hostile yet? a cutscene holding them? */
export interface DinoMode { hostile: boolean; held: boolean }
const modeOf = (state: GameState): DinoMode => {
  const d = (getAdv(state)?.s as { dino?: DinoMode } | undefined)?.dino;
  return { hostile: d?.hostile ?? true, held: d?.held ?? false };
};

const mid = (o: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry && state.player.health > 0;
};
const toward = (state: GameState, e: Enemy) => ((mid(state.player).x < mid(e).x ? -1 : 1) as 1 | -1);

/**
 * Friendly mode, or held for a cutscene: true (the AI's done for this frame). Leaving friendly mode (or the hold), it's
 * itself again: no longer harmless.
 */
const calm = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  const m = modeOf(state);
  if (!m.hostile || m.held) {
    if (e.aiState !== 'friendly' && e.aiState !== 'held') e.aiTimer = 0;
    e.aiState = m.hostile ? 'held' : 'friendly';
    e.harmless = true; e.vel.x = 0;
    if (m.hostile) e.facing = toward(state, e);
    return true;
  }
  if (e.aiState === 'friendly' || e.aiState === 'held') { e.aiState = 'idle'; e.aiTimer = 0; e.harmless = false; }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The AIs

/** A rock face (or a wall) right in front of it, low enough to leap up onto. */
const faceAhead = (state: GameState, e: Enemy, dir: number) => {
  const feet = e.pos.y + e.height, x = dir > 0 ? e.pos.x + e.width : e.pos.x;
  return state.blocks.some(b => !b.oneWay && (b.type === 'wall' || b.type === 'ground' || b.type === 'platform')
    && b.y < feet - 26 && b.y > feet - 240 && (dir > 0 ? b.x >= x - 2 && b.x < x + 16 : b.x + b.w <= x + 2 && b.x + b.w > x - 16));
};

const raptorAI = (ctx: FrameContext, e: Enemy): boolean => {
  if (calm(ctx, e)) return false;
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx);
  const grounded = e.vel.y === 0;
  switch (e.aiState) {
    case 'idle':
    default: {
      const home = e.homeX ?? e.pos.x;
      if (e.facing === undefined) e.facing = -1;
      if (Math.abs(e.pos.x - home) > 80) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      if (faceAhead(state, e, e.facing)) e.facing = (-e.facing) as 1 | -1;
      e.vel.x = e.facing * 1.1;
      if (sees(state, e, 520, 280)) { e.aiState = 'stalk'; e.aiTimer = 0; playSound('snort', 0.6, 8); }
      break;
    }
    case 'stalk':
      e.facing = toward(state, e);
      e.vel.x = adx > 30 ? e.facing * 3.8 : 0;
      // (him up on a ledge: up after him)
      if (grounded && p.y < m.y - 60 && adx < 230 && e.aiTimer > 24) { e.vel.y = -13.5; e.vel.x = e.facing * 4.2; e.aiTimer = 0; playSound('jump', 0.4, 6); }
      else if (grounded && adx < 170 && Math.abs(p.y - m.y) < 70) { e.aiState = 'crouch'; e.aiTimer = 0; }
      // (a rock face in the way: up onto it)
      else if (grounded && adx > 40 && faceAhead(state, e, e.facing) && e.aiTimer > 10) { e.vel.y = -13.5; e.vel.x = e.facing * 3.2; e.aiTimer = 0; playSound('jump', 0.4, 6); }
      if (!sees(state, e, 800, 420)) { e.aiState = 'idle'; e.aiTimer = 0; e.homeX = e.pos.x; }
      break;
    case 'crouch':
      e.vel.x = 0; e.facing = toward(state, e);
      if (e.aiTimer > 14) { e.aiState = 'pounce'; e.aiTimer = 0; e.vel.x = e.facing * 9.5; e.vel.y = -6.5; playSound('snort', 0.8, 4); }
      break;
    case 'pounce':
      if (grounded && e.aiTimer > 4) { e.aiState = 'recover'; e.aiTimer = 0; }
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 34) { e.aiState = 'stalk'; e.aiTimer = 0; }
      break;
  }
  return false;
};

const trikeAI = (ctx: FrameContext, e: Enemy): boolean => {
  if (calm(ctx, e)) return false;
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), adx = Math.abs(p.x - m.x);
  switch (e.aiState) {
    case 'idle':
    default:
      e.vel.x = 0; e.facing = toward(state, e);
      if (sees(state, e, 520, 90)) { e.aiState = 'paw'; e.aiTimer = 0; playSound('bellow', 0.5, 6); }
      break;
    case 'paw':
      e.vel.x = 0; e.facing = toward(state, e);
      if (e.aiTimer > 32) { e.aiState = 'charge'; e.aiTimer = 0; }
      break;
    case 'charge': {
      e.vel.x = e.facing! * 7.2;
      // (an edge ahead: it digs in rather than go over)
      const top = floorTopAt(state.blocks, m.x + e.facing! * (e.width / 2 + 20), e.pos.y + e.height, 30);
      const passed = Math.sign(p.x - m.x) !== e.facing && adx > 150;
      if (top === null || passed || e.aiTimer > 100) { e.aiState = 'skid'; e.aiTimer = 0; }
      if (e.aiTimer % 12 === 0 && Math.abs(m.x - (state.camera.x + CANVAS_WIDTH / 2)) < 500) shakeScreen(state, 3, 2);
      break;
    }
    case 'skid':
      e.vel.x *= 0.85;
      if (e.aiTimer > 40) { e.aiState = 'idle'; e.aiTimer = 0; }
      break;
  }
  return false;
};

const pteroAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  const homeX = e.homeX ?? e.pos.x, homeY = e.homeY ?? e.pos.y;
  if (calm(ctx, e)) { e.pos.y = homeY + Math.sin(state.frame * 0.05 + homeX) * 6; return true; }
  e.aiTimer = (e.aiTimer || 0) + 1;
  const m = mid(e), p = mid(state.player);
  switch (e.aiState) {
    case 'idle':
    default: {
      const t = (state.frame + homeX) * 0.018;
      const tx = homeX + Math.cos(t) * 140, ty = homeY + Math.sin(t * 2) * 20;
      e.vel.x = (tx - e.pos.x) * 0.06; e.vel.y = (ty - e.pos.y) * 0.06;
      e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
      if (e.aiTimer > 70 && Math.abs(p.x - m.x) < 380 && p.y > m.y + 40 && state.player.health > 0) {
        e.aiState = 'dive'; e.aiTimer = 0; e.aiX = p.x; e.aiY = p.y;
        const len = Math.hypot(p.x - m.x, p.y - m.y) || 1;
        e.vel = { x: ((p.x - m.x) / len) * 8.5, y: ((p.y - m.y) / len) * 8.5 };
        e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
        playSound('whoosh', 0.5, 4);
      }
      break;
    }
    case 'dive':
      if (Math.hypot((e.aiX ?? m.x) - m.x, (e.aiY ?? m.y) - m.y) < 14 || m.y > (e.aiY ?? m.y) + 10 || e.aiTimer > 70) { e.aiState = 'climb'; e.aiTimer = 0; }
      break;
    case 'climb':
      e.vel.x *= 0.95; e.vel.y = Math.max(-4.5, e.vel.y - 0.5);
      if (e.pos.y <= homeY) { e.aiState = 'idle'; e.aiTimer = 0; }
      break;
  }
  const floor = floorTopAt(state.blocks, m.x, e.pos.y + e.height, 0);
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  if (floor !== null && e.pos.y + e.height > floor) { e.pos.y = floor - e.height; if (e.aiState === 'dive') { e.aiState = 'climb'; e.aiTimer = 0; } }
  return true;
};

// Drawing: art/robots.ts (feet at the origin, facing right; stamped a frame at a time)

// ---------------------------------------------------------------------------------------------------------------

export const DINO_KINDS = { raptor: 'm2:raptor', trike: 'm2:trike', ptero: 'm2:ptero' } as const;

registerM2Kind({ kind: 'm2:raptor', stats: { w: 64, h: 50, hp: 140, contact: 12, mass: 170 }, ai: raptorAI, draw: (c, e, f, state) => drawRaptorBot(c, e, f, { friendly: !modeOf(state).hostile }), head: { x: 27, y: -50, r: 8 }, gender: 'n', robot: true, grab: 'body' });
registerM2Kind({ kind: 'm2:trike', stats: { w: 96, h: 56, hp: 260, contact: 14, mass: 700 }, ai: trikeAI, draw: (c, e, f, state) => drawTrikeBot(c, e, f, { friendly: !modeOf(state).hostile }), head: { x: 50, y: -38, r: 10 }, gender: 'n', robot: true, grab: 'none', pointy: { source: 'm2:trike_horns', label: 'GORED!', damage: 14 } });
registerM2Kind({
  kind: 'm2:ptero', stats: { w: 70, h: 30, hp: 60, contact: 10, mass: 70, air: true }, ai: pteroAI, draw: (c, e, f, state) => drawPteroBot(c, e, f, { friendly: !modeOf(state).hostile }), head: { x: 22, y: -22, r: 6 }, gender: 'n', robot: true, grab: 'critter',
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }),
});

registerHurtLines('m2:trike_horns', HURT_HORNS, DEATH_HORNS);
registerHurtLines('m2:raptor', HURT_RAPTOR, DEATH_RAPTOR);
registerHurtLines('m2:trike', HURT_TRIKE, DEATH_TRIKE);
registerHurtLines('m2:ptero', HURT_PTERO, DEATH_PTERO);
