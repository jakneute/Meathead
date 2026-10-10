// The clock tower's works, out to get him: the gears (on the walls, half sunk in a floor, one rolling along one), the
// pendulums (sharpened), and what the wobble shakes loose (bricks, bolts, a clock hand: the more beams down, the more
// of it). Each a hurt of its own, with its lines (lines.ts).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { registerHurtLines } from '../../kinds';
import { box } from '../section';
import { GEARS, PENDULUMS, TX0, TX1, F, STORY, SLAB, STORIES, ROOF, type GearDef, type PendDef } from './layout';
import { HURT_GEAR, DEATH_GEAR, HURT_PENDULUM, DEATH_PENDULUM, HURT_DEBRIS, DEATH_DEBRIS } from './lines';

type Ctx = CanvasRenderingContext2D;

registerHurtLines('tower_gear', HURT_GEAR, DEATH_GEAR);
registerHurtLines('tower_pendulum', HURT_PENDULUM, DEATH_PENDULUM);
registerHurtLines('tower_debris', HURT_DEBRIS, DEATH_DEBRIS);

const canHurt = (state: GameState) => state.player.health > 0 && state.player.invincibilityTimer <= 0 && !state.player.inCutscene;
/** His box against a circle. */
const touches = (state: GameState, cx: number, cy: number, r: number) => {
  const p = state.player;
  const nx = Math.max(p.pos.x, Math.min(cx, p.pos.x + p.width)), ny = Math.max(p.pos.y, Math.min(cy, p.pos.y + p.height));
  return (nx - cx) ** 2 + (ny - cy) ** 2 < r * r;
};

// ---------------------------------------------------------------------------------------------------------------
// Gears

/** Where a gear is now (a roller goes back and forth), and how far round it's turned. */
export const gearAt = (g: GearDef, frame: number) => {
  if (!g.roll) return { x: g.x, y: g.y, a: frame * g.spin };
  // (rolling: along and back, turning as it goes)
  const T = g.roll / 2.2, u = (frame % (T * 2)) / T, k = u < 1 ? u : 2 - u, x = g.x + k * g.roll;
  return { x, y: g.y, a: (x - g.x) / g.r };
};
const runGears = (ctx: FrameContext) => {
  const { state } = ctx;
  if (!canHurt(state)) return;
  const pcx = state.player.pos.x + state.player.width / 2;
  for (const g of GEARS) {
    const at = gearAt(g, state.frame);
    if (Math.abs(at.x - pcx) > 140 || !touches(state, at.x, at.y, g.r - 3)) continue;
    const away = pcx < at.x ? -1 : 1;
    hurtPlayer(ctx, 10, 'tower_gear', { x: away * 7, y: -6 });
    playSound('clang', 0.6, 4); playSound('crunch', 0.4, 6);
    return;
  }
};
export const drawGear = (c: Ctx, x: number, y: number, r: number, a: number, col = '#A16207', hub = '#57534E') => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(a);
  c.fillStyle = col;
  const n = Math.max(8, Math.round(r / 4));
  for (let i = 0; i < n; i++) { c.save(); c.rotate((i / n) * Math.PI * 2); c.fillRect(-4, -r, 8, 10); c.restore(); }
  c.beginPath(); c.arc(0, 0, r - 6, 0, Math.PI * 2); c.fill();
  c.fillStyle = hub; c.beginPath(); c.arc(0, 0, r * 0.35, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#1C1917'; c.fillRect(-r + 8, -2, (r - 8) * 2, 4); c.fillRect(-2, -r + 8, 4, (r - 8) * 2);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Pendulums

export const pendAt = (p: PendDef, frame: number) => {
  const a = p.amp * Math.sin(((frame / p.period) + p.phase) * Math.PI * 2);
  return { a, x: p.x + Math.sin(a) * p.len, y: p.y + Math.cos(a) * p.len };
};
const BLADE_R = 26;
const runPendulums = (ctx: FrameContext) => {
  const { state } = ctx;
  for (const p of PENDULUMS) {
    const b = pendAt(p, state.frame);
    // (the whoosh as it goes through the bottom of its swing, when he's near enough to hear it)
    const u = ((state.frame / p.period) + p.phase) % 0.5;
    if (u < 1 / p.period && Math.abs(b.x - state.player.pos.x) < 500 && Math.abs(b.y - state.player.pos.y) < 300) playSound('whoosh', 0.35, -6);
    if (canHurt(state) && touches(state, b.x, b.y, BLADE_R)) {
      hurtPlayer(ctx, 14, 'tower_pendulum', { x: (state.player.pos.x + state.player.width / 2 < b.x ? -1 : 1) * 8, y: -6 });
      playSound('crunch', 0.6, 2);
    }
  }
};
export const drawPendulum = (c: Ctx, p: PendDef, frame: number) => {
  const b = pendAt(p, frame);
  c.save(); c.translate(p.x, p.y); c.rotate(-b.a);
  box(c, -3, 0, 6, p.len - 10, '#78716C');
  box(c, -1, 0, 2, p.len - 10, '#A8A29E');
  // the blade: a big crescent (a half disc, the sharp edge down), a lit edge
  c.fillStyle = '#52525B'; c.beginPath(); c.arc(0, p.len - 14, 34, 0.15, Math.PI - 0.15); c.closePath(); c.fill();
  c.fillStyle = '#E4E4E7'; c.beginPath(); c.arc(0, p.len - 14, 34, 0.25, Math.PI - 0.25); c.arc(0, p.len - 14, 29, Math.PI - 0.25, 0.25, true); c.closePath(); c.fill();
  box(c, -6, p.len - 18, 12, 10, '#3F3F46');
  c.restore();
  // the pivot (its bracket on the ceiling)
  box(c, p.x - 10, p.y - 2, 20, 10, '#3F3F46');
};

// ---------------------------------------------------------------------------------------------------------------
// What the wobble shakes loose

export interface Debris { x: number; y: number; vy: number; tell: number; kind: number; rot: number; floor: number }
/** Which story (0..6) he's on (by his feet): -1 out of the tower. */
export const storyOf = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (cx < TX0 - 10 || cx > TX1 + 10) return -1;
  return Math.max(0, Math.min(STORIES, Math.floor((F(0) - feet + 40) / STORY)));
};
/** Each frame: shaken loose over him (the more beams down, the more often), the tell, the fall, the hit. */
const runDebris = (ctx: FrameContext, list: Debris[], broken: number) => {
  const { state } = ctx, p = state.player;
  const k = storyOf(state);
  const every = broken >= 3 ? Math.max(70, 330 - broken * 40) : 0;
  if (every && k >= 0 && !p.inCutscene && state.frame % every === 0 && list.length < 4) {
    const ceil = k < STORIES ? F(k + 1) + SLAB : ROOF;
    const x = Math.max(TX0 + 20, Math.min(TX1 - 20, p.pos.x + p.width / 2 + p.vel.x * 40 + (Math.random() - 0.5) * 160));
    list.push({ x, y: ceil + 4, vy: 0, tell: 40, kind: Math.floor(Math.random() * 3), rot: 0, floor: F(k) });
    playSound('crumble', 0.35, 6);
  }
  for (let i = list.length - 1; i >= 0; i--) {
    const d = list[i];
    if (d.tell > 0) {
      // (dust trickling down first: the tell)
      d.tell--;
      if (d.tell % 4 === 0) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 10, y: d.y }, vel: { x: 0, y: 1.5 }, life: 40, color: '#A8A29E', size: 2, grav: 0.05 });
      continue;
    }
    d.vy = Math.min(14, d.vy + 0.5); d.y += d.vy; d.rot += 0.2;
    if (canHurt(state) && d.x > p.pos.x - 10 && d.x < p.pos.x + p.width + 10 && d.y > p.pos.y && d.y < p.pos.y + p.height) {
      hurtPlayer(ctx, 7, 'tower_debris', { x: 0, y: -3 });
      playSound('thud', 0.7, 4);
      list.splice(i, 1); continue;
    }
    // (on a floor: smashed)
    const floor = state.blocks.find(b => !b.oneWay && d.x >= b.x && d.x <= b.x + b.w && d.y >= b.y && d.y <= b.y + 24);
    if (floor || d.y > d.floor + 20) {
      for (let j = 0; j < 8; j++) state.particles.push({ pos: { x: d.x, y: d.y }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 26, color: d.kind === 0 ? '#9A3412' : '#71717A', size: 2 + Math.random() * 3, grav: 0.3, chunk: true });
      playSound('crumble', 0.4, 4);
      list.splice(i, 1);
    }
  }
};
export const drawDebris = (c: Ctx, list: Debris[]) => {
  for (const d of list) {
    if (d.tell > 0) continue;
    c.save(); c.translate(Math.round(d.x), Math.round(d.y)); c.rotate(d.rot);
    if (d.kind === 0) { box(c, -9, -5, 18, 10, '#9A3412'); box(c, -9, -5, 18, 2, '#C2410C'); }
    else if (d.kind === 1) { box(c, -4, -8, 8, 16, '#52525B'); box(c, -7, -8, 14, 4, '#71717A'); }
    else { box(c, -2, -16, 4, 32, '#18181B'); box(c, -5, -18, 10, 6, '#18181B'); }
    c.restore();
  }
};

export const runHazards = (ctx: FrameContext, debris: Debris[], broken: number) => {
  runGears(ctx);
  runPendulums(ctx);
  runDebris(ctx, debris, broken);
};
