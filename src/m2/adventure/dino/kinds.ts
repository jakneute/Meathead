// The dino park's robot dinosaurs (Meathead 2's own kinds, all machines: scrap, sparks and oil, not gore; the
// crossbow has them barfing bolts, the spawner's litter chews them down to a steel endoskeleton). Friendly mode till
// the switch goes over (see the pebble cutscene in index.ts): eyes blue, standing about doing their bit for the kids,
// harmless. Hostile: eyes red, and:
//   raptor: prowls; sees him, runs him down, leaps up onto ledges after him, crouches and pounces.
//   trike:  stands its ground; sees him level with it, paws, and charges (it doesn't leap: get up out of its way).
//   ptero:  circles its patch of sky, folds and dives at him, climbs back.
//   rex:    the big one, the paddock's sub-boss: its own file (rex.ts).
// Crude on purpose (the first pass): boxes and polygons, panel seams, bolts.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { getAdv } from '../section';
import { HURT_RAPTOR, DEATH_RAPTOR, HURT_TRIKE, DEATH_TRIKE, HURT_HORNS, DEATH_HORNS, HURT_PTERO, DEATH_PTERO } from './lines';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

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

// ---------------------------------------------------------------------------------------------------------------
// Drawing (feet at the origin, facing right)

const poly = (c: Ctx, pts: number[], col: string) => {
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.5; c.stroke();
};
const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = INK; c.fillRect(x - 1, y - 1, w + 2, h + 2); c.fillStyle = col; c.fillRect(x, y, w, h); };
const bolts = (c: Ctx, pts: number[]) => { c.fillStyle = '#D4D4D8'; for (let i = 0; i < pts.length; i += 2) c.fillRect(pts[i] - 1, pts[i + 1] - 1, 2, 2); };
/** Its eye: red and glowing (hostile), blue (friendly). */
/** (set as each one's drawn: friendly mode, before the switch) */
let friendlyNow = false;
const eye = (c: Ctx, _e: Enemy, f: number, x: number, y: number, r: number) => {
  const friendly = friendlyNow;
  const glow = friendly ? 'rgba(96, 165, 250, 0.35)' : `rgba(239, 68, 68, ${0.35 + 0.15 * Math.sin(f * 0.3)})`;
  c.fillStyle = glow; c.beginPath(); c.arc(x, y, r * 2.2, 0, Math.PI * 2); c.fill();
  c.fillStyle = friendly ? '#60A5FA' : '#EF4444'; c.fillRect(Math.round(x - r), Math.round(y - r), Math.round(r * 2), Math.round(r * 2));
  c.fillStyle = friendly ? '#DBEAFE' : '#FECACA'; c.fillRect(Math.round(x - r / 2), Math.round(y - r / 2), Math.max(1, Math.round(r)), Math.max(1, Math.round(r)));
};
const stepOf = (e: Enemy, f: number, rate = 0.3) => (Math.abs(e.vel.x) > 0.4 ? Math.sin(f * rate * Math.min(2, Math.abs(e.vel.x) / 2)) : 0);
/** (friendly mode: a little animatronic bob and head-turn, doing its bit for the kids) */
const bobOf = (e: Enemy, f: number) => (friendlyNow ? Math.round(Math.sin(f * 0.08 + (e.homeX || 0)) * 2) : 0);

const RAPTOR = '#5B6E58', RAPTOR_LO = '#3F4F3D', RAPTOR_HI = '#7C8F78';
const drawRaptor = (c: Ctx, e: Enemy, f: number) => {
  const st = stepOf(e, f, 0.35), crouch = e.aiState === 'crouch' ? 6 : 0, bob = bobOf(e, f);
  const by = -40 + crouch + bob;
  // legs (far, then near): thigh, shin back, foot
  for (const [s, col] of [[-1, RAPTOR_LO], [1, RAPTOR]] as const) {
    const k = st * s * 7;
    poly(c, [-6 + k * 0.4, by + 10, 4 + k * 0.4, by + 10, 6 + k, -12, 0 + k, -12], col);
    poly(c, [0 + k, -14, 6 + k, -14, 3 + k, -2, -2 + k, -2], col);
    poly(c, [-3 + k, -4, 12 + k, -4, 13 + k, 0, -3 + k, 0], '#3F3F46');
    c.fillStyle = '#E4E4E7'; c.fillRect(12 + k, -6, 3, 2);
  }
  // tail
  poly(c, [-14, by + 2, -52, by - 2 + Math.sin(f * 0.1) * 3, -54, by + 1 + Math.sin(f * 0.1) * 3, -14, by + 14], RAPTOR_LO);
  // body
  poly(c, [-16, by, 14, by - 4, 20, by + 6, 10, by + 18, -14, by + 16], RAPTOR);
  c.fillStyle = RAPTOR_HI; c.fillRect(-12, by, 22, 2);
  c.strokeStyle = RAPTOR_LO; c.lineWidth = 1; c.beginPath(); c.moveTo(-2, by - 2); c.lineTo(-2, by + 16); c.stroke();
  bolts(c, [-10, by + 4, 6, by + 2, -10, by + 12, 6, by + 12]);
  // arm: a little claw
  poly(c, [12, by + 8, 20, by + 14, 18, by + 16, 10, by + 12], RAPTOR_LO);
  // neck and head (jaw open crouching/pouncing)
  const hx = 18, hy = by - 14 + (friendlyNow ? Math.round(Math.sin(f * 0.05) * 2) : 0);
  poly(c, [10, by + 2, 20, by - 6, 24, hy + 8, 16, by + 6], RAPTOR);
  const open = e.aiState === 'crouch' || e.aiState === 'pounce' ? 5 : 0;
  poly(c, [hx, hy, hx + 18, hy + 2, hx + 18, hy + 7, hx, hy + 9], RAPTOR);
  poly(c, [hx + 2, hy + 9, hx + 17, hy + 8 + open, hx + 16, hy + 11 + open, hx + 2, hy + 12], RAPTOR_LO);
  c.fillStyle = '#F4F4F5'; for (let i = 0; i < 4; i++) c.fillRect(hx + 5 + i * 3, hy + 7, 1, 2);
  eye(c, e, f, hx + 9, hy + 3, 1.6);
};

const TRIKE = '#6B6252', TRIKE_LO = '#4A4438', FRILL = '#8A7A5A';
const drawTrike = (c: Ctx, e: Enemy, f: number) => {
  const st = stepOf(e, f, 0.25), bob = bobOf(e, f);
  const by = -48 + bob;
  for (const [lx, s, col] of [[-26, 1, TRIKE_LO], [18, -1, TRIKE_LO], [-20, -1, TRIKE], [24, 1, TRIKE]] as const) {
    const k = st * s * 5;
    box(c, lx + k - 5, by + 26, 11, -by - 26, col);
    box(c, lx + k - 7, -5, 15, 5, '#3F3F46');
  }
  // tail, body (a barrel), plating
  poly(c, [-36, by + 10, -60, by + 22, -36, by + 26], TRIKE_LO);
  poly(c, [-40, by + 6, -30, by - 4, 22, by - 4, 34, by + 8, 32, by + 32, -38, by + 32], TRIKE);
  c.fillStyle = '#857B68'; c.fillRect(-30, by - 2, 50, 3);
  c.strokeStyle = TRIKE_LO; c.lineWidth = 1; for (const x of [-20, 0, 18]) { c.beginPath(); c.moveTo(x, by - 3); c.lineTo(x, by + 31); c.stroke(); }
  bolts(c, [-24, by + 4, -4, by + 4, 14, by + 4, -24, by + 26, -4, by + 26, 14, by + 26]);
  // frill, head, beak, three horns (head down charging)
  const down = e.aiState === 'charge' || e.aiState === 'paw' ? 6 : 0;
  poly(c, [30, by - 18 + down, 44, by - 22 + down, 46, by + 14 + down, 32, by + 16], FRILL);
  bolts(c, [36, by - 14 + down, 40, by + 4 + down]);
  poly(c, [36, by + 2 + down, 58, by + 6 + down, 62, by + 18 + down, 40, by + 24 + down], TRIKE);
  poly(c, [56, by + 10 + down, 66, by + 16 + down, 56, by + 20 + down], '#3F3F46');
  poly(c, [44, by + 2 + down, 64, by - 14 + down, 48, by + 4 + down], '#E7E5E4');
  poly(c, [50, by + 4 + down, 72, by - 6 + down, 54, by + 6 + down], '#E7E5E4');
  poly(c, [56, by + 10 + down, 64, by + 2 + down, 60, by + 12 + down], '#E7E5E4');
  eye(c, e, f, 48, by + 9 + down, 1.8);
};

const PTERO = '#64748B', PTERO_LO = '#475569', WING = '#94A3B8';
const drawPtero = (c: Ctx, e: Enemy, f: number) => {
  const diving = e.aiState === 'dive';
  const flap = diving ? -0.2 : Math.sin(f * 0.25 + (e.homeX || 0));
  const by = -16;
  // far wing, body, near wing
  poly(c, [-4, by, -20, by - 12 - flap * 14, -38, by - 4 - flap * 18, -10, by + 4], PTERO_LO);
  poly(c, [-16, by + 2, 10, by - 4, 18, by + 2, 6, by + 8, -14, by + 8], PTERO);
  bolts(c, [-8, by + 2, 4, by + 2]);
  poly(c, [2, by, 14, by - 14 - flap * 16, 34, by - 6 - flap * 22, 6, by + 6], WING);
  c.strokeStyle = PTERO_LO; c.lineWidth = 1; c.beginPath(); c.moveTo(2, by); c.lineTo(28, by - 6 - flap * 20); c.stroke();
  // head, crest, long beak
  poly(c, [14, by - 6, 22, by - 10, 26, by - 4, 18, by], PTERO);
  poly(c, [16, by - 8, 6, by - 16, 20, by - 10], PTERO_LO);
  poly(c, [24, by - 7, 44, by - 3, 24, by - 2], '#CBD5E1');
  eye(c, e, f, 20, by - 6, 1.4);
  // feet
  c.fillStyle = '#3F3F46'; c.fillRect(-6, by + 8, 2, 6); c.fillRect(-2, by + 8, 2, 6);
};

// ---------------------------------------------------------------------------------------------------------------

export const DINO_KINDS = { raptor: 'm2:raptor', trike: 'm2:trike', ptero: 'm2:ptero' } as const;

registerM2Kind({ kind: 'm2:raptor', stats: { w: 64, h: 50, hp: 140, contact: 12, mass: 170 }, ai: raptorAI, draw: (c, e, f, state) => { friendlyNow = !modeOf(state).hostile; drawRaptor(c, e, f); }, head: { x: 27, y: -50, r: 8 }, gender: 'n', robot: true, grab: 'body' });
registerM2Kind({ kind: 'm2:trike', stats: { w: 96, h: 56, hp: 260, contact: 14, mass: 700 }, ai: trikeAI, draw: (c, e, f, state) => { friendlyNow = !modeOf(state).hostile; drawTrike(c, e, f); }, head: { x: 50, y: -38, r: 10 }, gender: 'n', robot: true, grab: 'none', pointy: { source: 'm2:trike_horns', label: 'GORED!', damage: 14 } });
registerM2Kind({
  kind: 'm2:ptero', stats: { w: 70, h: 30, hp: 60, contact: 10, mass: 70, air: true }, ai: pteroAI, draw: (c, e, f, state) => { friendlyNow = !modeOf(state).hostile; drawPtero(c, e, f); }, head: { x: 22, y: -22, r: 6 }, gender: 'n', robot: true, grab: 'critter',
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }),
});

registerHurtLines('m2:trike_horns', HURT_HORNS, DEATH_HORNS);
registerHurtLines('m2:raptor', HURT_RAPTOR, DEATH_RAPTOR);
registerHurtLines('m2:trike', HURT_TRIKE, DEATH_TRIKE);
registerHurtLines('m2:ptero', HURT_PTERO, DEATH_PTERO);
