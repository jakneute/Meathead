// Real hell's wildlife (Meathead 2's own kinds; no costumed park staff down here, it's the real thing):
//   imp:   a thrower. Small, red, hops about; sees him, keeps its distance and lobs fireballs at him in an arc (the ball
//          glows in its fist first: the tell).
//   hound: a rusher. A black dog with its mane on fire: prowls; sees him, runs him down, crouches and pounces.
//   bat:   a flyer. A bat with burning wings: circles its patch of air, folds and dives at him, climbs back.
//   goat:  a pointy bruiser. A big horned hell goat: plods at him; level with him, it lowers its horns, paws and
//          charges a short way. Horns out front: shoulder charging it head-on runs him onto them.
// Taught one at a time along the way (see layout.ts), then mixed. Anything (not flying) that ends up in the lava cooks.
// Crude first-pass art (boxes): drawn at the origin (feet), facing right; the engine turns them.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { GY } from '../geometry';
import { box } from '../section';
import { POOLS } from './layout';
import { hellOf } from './state';
import {
  HURT_IMP, DEATH_IMP, HURT_IMP_FIRE, DEATH_IMP_FIRE, HURT_HOUND, DEATH_HOUND, HURT_BAT, DEATH_BAT, HURT_GOAT, DEATH_GOAT,
  HURT_HORNS, DEATH_HORNS,
} from './lines';

type Ctx = CanvasRenderingContext2D;
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
// Drawing (crude: boxes; the engine's turned it to face the way it's going)

const glowEye = (c: Ctx, x: number, y: number, f: number) => { box(c, x, y, 3, 3, f % 30 < 2 ? '#7F1D1D' : '#FDE047'); };
const flames = (c: Ctx, x: number, y: number, w: number, h: number, f: number, seed = 0) => {
  for (let i = 0; i < w; i += 5) {
    const t = Math.sin(f * 0.5 + i * 0.9 + seed) * 0.5 + 0.5, fh = h * (0.5 + t * 0.6);
    box(c, x + i, y - fh, 5, fh, i % 10 ? '#F97316' : '#EF4444');
    box(c, x + i + 1, y - fh * 0.55, 3, fh * 0.55, '#FDE047');
  }
};

const drawImp = (c: Ctx, e: Enemy, f: number) => {
  const hop = grounded(e) ? 0 : -2, wind = e.aiState === 'wind';
  // (tail, legs, body, wings, head and horns)
  box(c, -16, -14 + hop, 8, 3, '#991B1B'); box(c, -19, -18 + hop, 4, 5, '#7F1D1D');
  box(c, -7, -10, 5, 10, '#991B1B'); box(c, 3, -10, 5, 10, '#991B1B');
  box(c, -9, -28 + hop, 18, 19, '#DC2626'); box(c, -9, -28 + hop, 18, 3, '#F87171');
  const flap = Math.floor(f / 5) % 2 ? 4 : 0;
  box(c, -17, -32 + hop + flap, 9, 8, '#450A0A'); box(c, 8, -32 + hop + flap, 9, 8, '#450A0A');
  box(c, -8, -40 + hop, 16, 13, '#DC2626'); box(c, -8, -40 + hop, 16, 2, '#F87171');
  box(c, -8, -45 + hop, 3, 5, '#FEF3C7'); box(c, 5, -45 + hop, 3, 5, '#FEF3C7');
  glowEye(c, 2, -36 + hop, f); box(c, 1, -30 + hop, 7, 2, '#450A0A');
  // (the fireball in its fist, growing: the tell)
  if (wind) {
    const r = 3 + Math.min(1, (e.aiTimer || 0) / 26) * 5;
    c.fillStyle = 'rgba(249, 115, 22, 0.4)'; c.beginPath(); c.arc(10, -42 + hop, r + 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FDE047'; c.beginPath(); c.arc(10, -42 + hop, r, 0, Math.PI * 2); c.fill();
    box(c, 6, -36 + hop, 5, 10, '#DC2626');
  } else box(c, 8, -24 + hop, 7, 4, '#DC2626');
};

const drawHound = (c: Ctx, e: Enemy, f: number) => {
  const run = Math.abs(e.vel.x) > 0.5, st = run ? Math.sin(f * 0.5) * 6 : 0, crouch = e.aiState === 'crouch' ? 6 : 0;
  // (legs, body, the burning mane and tail, the head, the jaws)
  box(c, -24 + st, -16, 6, 16, '#18181B'); box(c, -14 - st, -16, 6, 16, '#27272A');
  box(c, 12 - st, -16, 6, 16, '#18181B'); box(c, 20 + st, -16, 6, 16, '#27272A');
  box(c, -28, -36 + crouch, 56, 22, '#1C1917'); box(c, -28, -36 + crouch, 56, 3, '#44403C');
  for (let i = 0; i < 6; i++) box(c, -22 + i * 8, -26 + crouch, 3, 6, '#57534E');
  flames(c, -10, -34 + crouch, 32, 16, f);
  flames(c, -36, -28 + crouch, 10, 12, f, 3);
  box(c, 22, -44 + crouch, 20, 18, '#1C1917'); box(c, 38, -38 + crouch, 10, 8, '#1C1917');
  box(c, 24, -50 + crouch, 5, 7, '#0C0A09');
  glowEye(c, 32, -40 + crouch, f);
  const open = e.aiState === 'pounce' || e.aiState === 'crouch' ? 5 : 1;
  box(c, 38, -30 + crouch, 10, open, '#7F1D1D');
  box(c, 39, -30 + crouch, 2, 2, '#FFFFFF'); box(c, 44, -30 + crouch, 2, 2, '#FFFFFF');
};

const drawBat = (c: Ctx, e: Enemy, f: number) => {
  const up = e.aiState === 'tell' ? -12 : e.aiState === 'dive' ? 8 : (Math.floor(f / 4) % 2 ? -8 : 6);
  // (the wings: burning, wide, bright against the dark)
  for (const s of [-1, 1]) {
    c.fillStyle = '#7F1D1D';
    c.beginPath(); c.moveTo(s * 6, -16); c.lineTo(s * 30, -18 + up); c.lineTo(s * 24, -8 + up * 0.5); c.lineTo(s * 14, -10); c.closePath(); c.fill();
    c.fillStyle = '#EA580C';
    c.beginPath(); c.moveTo(s * 10, -15); c.lineTo(s * 28, -17 + up); c.lineTo(s * 20, -11 + up * 0.5); c.closePath(); c.fill();
    box(c, s * 30 - 3, -22 + up, 6, 5, f % 6 < 3 ? '#FDE047' : '#F97316');
    box(c, s * 24 - 2, -12 + up * 0.5, 4, 4, f % 6 < 3 ? '#F97316' : '#FDE047');
  }
  box(c, -7, -21, 14, 14, '#1C1917');
  box(c, -6, -26, 4, 5, '#1C1917'); box(c, 2, -26, 4, 5, '#1C1917');
  glowEye(c, 1, -18, f); box(c, 0, -11, 6, 2, '#FFFFFF');
};

const drawGoat = (c: Ctx, e: Enemy, f: number) => {
  const walk = Math.abs(e.vel.x) > 0.3 ? Math.sin(f * (e.aiState === 'charge' ? 0.6 : 0.25)) * 5 : 0;
  const low = e.aiState === 'paw' || e.aiState === 'charge' ? 10 : 0;
  for (const [x, s] of [[-26, 1], [-14, -1], [14, 1], [24, -1]] as const) { box(c, x + walk * s, -22, 7, 22, '#3B0F0F'); box(c, x + walk * s, -4, 7, 4, '#0C0A09'); }
  box(c, -32, -54, 64, 34, '#5B1A12'); box(c, -32, -54, 64, 4, '#7C2D12');
  box(c, -36, -50, 6, 18, '#3B0F0F');
  // (the head down for the charge, the horns out front: the pointy end)
  const hy = -64 + low;
  box(c, 22, hy, 22, 22, '#5B1A12'); box(c, 38, hy + 12, 12, 10, '#3B0F0F');
  box(c, 26, hy + 22, 8, 8, '#292524');
  c.fillStyle = '#E7E5E4';
  c.beginPath(); c.moveTo(26, hy + 2); c.lineTo(62, hy - 4 + low * 0.8); c.lineTo(30, hy + 9); c.closePath(); c.fill();
  c.fillStyle = '#A8A29E';
  c.beginPath(); c.moveTo(30, hy + 8); c.lineTo(58, hy + 6 + low * 0.6); c.lineTo(32, hy + 14); c.closePath(); c.fill();
  glowEye(c, 34, hy + 6, f);
};

// ---------------------------------------------------------------------------------------------------------------

registerM2Kind({ kind: 'm2:imp', stats: { w: 26, h: 42, hp: 45, contact: 8, mass: 60 }, ai: impAI, draw: drawImp, head: { x: 0, y: -34, r: 8 }, gender: 'n', grab: 'critter' });
registerM2Kind({ kind: 'm2:hellhound', stats: { w: 60, h: 44, hp: 100, contact: 12, mass: 150 }, ai: houndAI, draw: drawHound, head: { x: 32, y: -36, r: 9 }, gender: 'n', grab: 'body' });
registerM2Kind({
  kind: 'm2:firebat', stats: { w: 34, h: 22, hp: 30, contact: 9, mass: 30, air: true }, ai: batAI, draw: drawBat, head: { x: 0, y: -12, r: 6 }, gender: 'n', grab: 'critter',
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }),
});
registerM2Kind({
  kind: 'm2:hellgoat', stats: { w: 68, h: 64, hp: 220, contact: 14, mass: 420 }, ai: goatAI, draw: drawGoat, head: { x: 32, y: -54, r: 10 }, gender: 'n', grab: 'none',
  pointy: { source: 'm2:hellgoat_horns', label: 'HORNED!', damage: 16 },
});

registerHurtLines('m2:imp', HURT_IMP, DEATH_IMP);
registerHurtLines(IMP_FIRE, HURT_IMP_FIRE, DEATH_IMP_FIRE);
registerDeathKind(IMP_FIRE, 'burnt');
registerHurtLines('m2:hellhound', HURT_HOUND, DEATH_HOUND);
registerHurtLines('m2:firebat', HURT_BAT, DEATH_BAT);
registerHurtLines('m2:hellgoat', HURT_GOAT, DEATH_GOAT);
registerHurtLines('m2:hellgoat_horns', HURT_HORNS, DEATH_HORNS);
