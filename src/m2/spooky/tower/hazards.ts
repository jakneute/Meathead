// The clock tower's works, out to get him: the gears (on the walls, one half sunk in a floor), the pendulums
// (sharpened: up over his head at the ends of the swing, not at the bottom), and what the wobble shakes loose (bricks,
// bolts, a clock hand: the more beams down, the more of it; dust trickling and its shadow on the floor first). After
// the crash: the pendulums swing wild (further, faster), floor 2's is down (its blade stuck in the floor). Each a hurt
// of its own, with its lines (lines.ts).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { registerHurtLines } from '../../kinds';
import { isMidBoss } from '../../../m1/game/combat/midBoss';
import type { Enemy } from '../../../m1/types';
import { box } from '../section';
import { setHazardZones } from '../../hazardHit';
import { GEARS, PENDULUMS, TX0, TX1, F, U, STORY, SLAB, STORIES, ROOF, BLADE_U, type GearDef, type PendDef } from './layout';
import { HURT_GEAR, DEATH_GEAR, HURT_PENDULUM, DEATH_PENDULUM, HURT_DEBRIS, DEATH_DEBRIS, HURT_CAR, DEATH_CAR } from './lines';

type Ctx = CanvasRenderingContext2D;
const INK = '#0C0A09';

registerHurtLines('tower_gear', HURT_GEAR, DEATH_GEAR);
registerHurtLines('tower_pendulum', HURT_PENDULUM, DEATH_PENDULUM);
registerHurtLines('tower_debris', HURT_DEBRIS, DEATH_DEBRIS);
registerHurtLines('tower_car', HURT_CAR, DEATH_CAR);

export const canHurt = (state: GameState) => state.player.health > 0 && state.player.invincibilityTimer <= 0 && !state.player.inCutscene;
/** His box against a circle. */
const touches = (state: GameState, cx: number, cy: number, r: number) => {
  const p = state.player;
  const nx = Math.max(p.pos.x, Math.min(cx, p.pos.x + p.width)), ny = Math.max(p.pos.y, Math.min(cy, p.pos.y + p.height));
  return (nx - cx) ** 2 + (ny - cy) ** 2 < r * r;
};

// ---------------------------------------------------------------------------------------------------------------
// The works hurt the staff too (knocked into them: they don't walk in on their own, see dangerZones)

/** The beams still standing (index.ts keeps it up to date): cover. Nobody sees him through one. */
export const cover: { x0: number; x1: number; y0: number; y1: number }[] = [];
/** Can a point (an enemy's eyes) see another (him)? Not through a standing beam. */
export const clearView = (ax: number, ay: number, bx: number, by: number) => {
  for (const c of cover) {
    if (Math.max(ax, bx) < c.x0 || Math.min(ax, bx) > c.x1) continue;
    // (where the line between them is, across the beam)
    const mx = Math.max(c.x0, Math.min(c.x1, (ax + bx) / 2)), k = bx === ax ? 0.5 : (mx - ax) / (bx - ax);
    const y = ay + (by - ay) * Math.max(0, Math.min(1, k));
    if (y > c.y0 && y < c.y1) return false;
  }
  return true;
};
/** Where the blades are dangerous (their whole sweep, low enough to hit a man), this frame: the staff's AIs keep out. */
export const dangerZones: { x0: number; x1: number; y0: number; y1: number }[] = [];
/** Would walking to x put it in a blade's way? */
export const inDanger = (e: Enemy, x: number) => dangerZones.some(z => x + e.width > z.x0 && x < z.x1 && e.pos.y < z.y1 && e.pos.y + e.height > z.y0);
const victims = (state: GameState) => state.enemies.filter(e => e.health > 0 && !e.isBlownAway && e.type !== 'boss' && !e.innocent && !isMidBoss(e) && !e.kind?.endsWith('cuckoo'));
const eTouches = (e: Enemy, cx: number, cy: number, r: number) => {
  const nx = Math.max(e.pos.x, Math.min(cx, e.pos.x + e.width)), ny = Math.max(e.pos.y, Math.min(cy, e.pos.y + e.height));
  return (nx - cx) ** 2 + (ny - cy) ** 2 < r * r;
};
/** One of the staff (or the clock's own) done in by the works: flung, the gore (or the scrap: machines), the callout. */
export const worksKill = (ctx: FrameContext, e: Enemy, fromX: number, call: string) => {
  const { state, fx } = ctx;
  const away = e.pos.x + e.width / 2 < fromX ? -1 : 1;
  e.health = 0;
  fx.blowAwayEnemy(e, { x: away * 10, y: -11 }, 'charge_kill', away, 1.6);
  fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 30 }, call, true, '#FCA5A5');
  playSound('crunch', 0.9, -4);
  state.player.killSatisfactionTimer = 60;
  if (import.meta.env.DEV) (state as unknown as { towerKill?: string }).towerKill = `${call} ${state.frame}`;
};
/** Hurt by the works but not done in (a brick on the head): a chunk off, a flash; done in, as above. */
export const worksHit = (ctx: FrameContext, e: Enemy, dmg: number, fromX: number, call: string) => {
  e.health -= dmg; e.hitFlash = 8;
  if (e.health <= 0) worksKill(ctx, e, fromX, call);
};

// ---------------------------------------------------------------------------------------------------------------
// Gears

/** Where a gear is now (a roller goes back and forth), and how far round it's turned. */
export const gearAt = (g: GearDef, frame: number) => {
  if (!g.roll) return { x: g.x, y: g.y, a: frame * g.spin };
  const T = g.roll / 2.2, u = (frame % (T * 2)) / T, k = u < 1 ? u : 2 - u, x = g.x + k * g.roll;
  return { x, y: g.y, a: (x - g.x) / g.r };
};
export const gearsNow = (crashed: boolean) => GEARS.filter(g => !(crashed && g.wholeOnly));
const runGears = (ctx: FrameContext, crashed: boolean) => {
  const { state } = ctx;
  // (anybody knocked into one: ground up; and they keep clear of them)
  const vs = victims(state);
  for (const g of gearsNow(crashed)) {
    const at = gearAt(g, state.frame), reach = g.roll ? g.roll : 0;
    dangerZones.push({ x0: g.x - g.r, x1: g.x + reach + g.r, y0: g.y - g.r, y1: g.y + g.r });
    for (const e of vs) if (Math.abs(e.pos.x - at.x) < 140 && eTouches(e, at.x, at.y, g.r - 3)) worksHit(ctx, e, 60, at.x, 'GROUND UP!');
  }
  if (!canHurt(state)) return;
  const pcx = state.player.pos.x + state.player.width / 2;
  for (const g of gearsNow(crashed)) {
    const at = gearAt(g, state.frame);
    if (Math.abs(at.x - pcx) > 140 || !touches(state, at.x, at.y, g.r - 3)) continue;
    const away = pcx < at.x ? -1 : 1;
    hurtPlayer(ctx, 10, 'tower_gear', { x: away * 7, y: -6 });
    playSound('clang', 0.6, 4); playSound('crunch', 0.4, 6);
    for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: pcx, y: at.y }, vel: { x: away * (2 + Math.random() * 3), y: -2 - Math.random() * 3 }, life: 20, color: '#FDE68A', size: 2 });
    return;
  }
};
/** A gear: the teeth (outlined), the rim, the spokes, the hub. */
export const drawGear = (c: Ctx, x: number, y: number, r: number, a: number, col = '#A16207', hub = '#57534E') => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(a);
  const n = Math.max(8, Math.round(r / 4));
  c.fillStyle = INK;
  for (let i = 0; i < n; i++) { c.save(); c.rotate((i / n) * Math.PI * 2); c.fillRect(-5, -r - 1, 10, 12); c.restore(); }
  c.beginPath(); c.arc(0, 0, r - 5, 0, Math.PI * 2); c.fill();
  c.fillStyle = col;
  for (let i = 0; i < n; i++) { c.save(); c.rotate((i / n) * Math.PI * 2); c.fillRect(-4, -r, 8, 10); c.restore(); }
  c.beginPath(); c.arc(0, 0, r - 6, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#1C1917'; c.beginPath(); c.arc(0, 0, r - 13, 0, Math.PI * 2); c.fill();
  c.fillStyle = col;
  for (let i = 0; i < 4; i++) { c.save(); c.rotate((i / 4) * Math.PI * 2); c.fillRect(-3, -r + 10, 6, r - 10); c.restore(); }
  c.fillStyle = hub; c.beginPath(); c.arc(0, 0, r * 0.3, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FDE68A'; c.fillRect(-r + 7, -2, 5, 3);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Pendulums

/** Swinging now (after the crash: wild, further and faster); null: it's down. */
export const pendAt = (p: PendDef, frame: number, crashed: boolean) => {
  if (crashed && p.snaps) return null;
  // (tied back up to the ceiling, out of the way, till the crash shakes it loose)
  if (!crashed && p.wildOnly) return { a: -1.2, x: p.x + Math.sin(-1.2) * p.len, y: p.y + Math.cos(-1.2) * p.len, period: p.period, amp: 0, still: true };
  const amp = crashed ? Math.min(1.05, p.amp * 1.7) : p.amp, period = crashed ? p.period * 0.8 : p.period;
  const a = amp * Math.sin(((frame / period) + p.phase) * Math.PI * 2);
  return { a, x: p.x + Math.sin(a) * p.len, y: p.y + Math.cos(a) * p.len, period, amp };
};
const BLADE_R = 26;
const runPendulums = (ctx: FrameContext, crashed: boolean) => {
  const { state } = ctx, pl = state.player, pcx = pl.pos.x + pl.width / 2;
  dangerZones.length = 0;
  const vs = victims(state);
  for (const p of PENDULUMS) {
    const b = pendAt(p, state.frame, crashed);
    if (!b || 'still' in b) continue;
    // (its sweep, as far down as it comes: the staff keep out of it)
    const reach = Math.sin(b.amp) * p.len + BLADE_R;
    dangerZones.push({ x0: p.x - reach, x1: p.x + reach, y0: p.y + Math.cos(b.amp) * p.len - BLADE_R, y1: p.y + p.len + BLADE_R });
    // (anybody knocked into it: chopped)
    for (const e of vs) if (Math.abs(e.pos.x - b.x) < 120 && eTouches(e, b.x, b.y, BLADE_R)) worksKill(ctx, e, b.x, 'CHOPPED!');
    // (the whoosh as it comes through the bottom of its swing, when he's near enough to hear it: and the creak at the top)
    const ph = ((state.frame / b.period) + p.phase) % 0.5;
    const near = Math.abs(b.x - pcx) < 600 && Math.abs(b.y - pl.pos.y) < 300;
    if (near && ph < 1 / b.period) playSound('whoosh', 0.4, -6);
    if (near && Math.abs(ph - 0.25) < 0.5 / b.period) playSound('click', 0.2, -10);
    if (canHurt(state) && touches(state, b.x, b.y, BLADE_R)) {
      hurtPlayer(ctx, 14, 'tower_pendulum', { x: (pcx < b.x ? -1 : 1) * 8, y: -6 });
      playSound('crunch', 0.6, 2);
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: b.x, y: b.y }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 4 }, life: 22, color: i % 2 ? '#B91C1C' : '#E4E4E7', size: 2 });
    }
  }
  // (floor 2's, down: its blade stuck up out of the floor)
  if (crashed) {
    const bx = U(BLADE_U), by = F(2);
    dangerZones.push({ x0: bx - 24, x1: bx + 24, y0: by - 40, y1: by });
    for (const e of vs) if (e.pos.x < bx + 22 && e.pos.x + e.width > bx - 22 && e.pos.y + e.height > by - 30 && e.pos.y < by) worksKill(ctx, e, bx, 'SKEWERED!');
  }
  if (crashed && canHurt(state)) {
    const bx = U(BLADE_U), by = F(2);
    if (pl.pos.x < bx + 22 && pl.pos.x + pl.width > bx - 22 && pl.pos.y + pl.height > by - 30 && pl.pos.y < by) {
      hurtPlayer(ctx, 12, 'tower_pendulum', { x: (pcx < bx ? -1 : 1) * 7, y: -7 });
      playSound('crunch', 0.6, 2);
    }
  }
};
const drawBlade = (c: Ctx, cy: number) => {
  // a big crescent, the sharp edge down; inked, a lit edge
  c.fillStyle = INK; c.beginPath(); c.arc(0, cy, 37, 0.1, Math.PI - 0.1); c.closePath(); c.fill();
  c.fillStyle = '#52525B'; c.beginPath(); c.arc(0, cy, 34, 0.15, Math.PI - 0.15); c.closePath(); c.fill();
  c.fillStyle = '#E4E4E7'; c.beginPath(); c.arc(0, cy, 34, 0.25, Math.PI - 0.25); c.arc(0, cy, 28, Math.PI - 0.25, 0.25, true); c.closePath(); c.fill();
  box(c, -7, cy - 6, 14, 12, '#3F3F46'); box(c, -7, cy - 6, 14, 2, '#71717A');
};
export const drawPendulum = (c: Ctx, p: PendDef, frame: number, crashed: boolean) => {
  // the pivot (its bracket on the ceiling)
  box(c, p.x - 14, p.y - 2, 28, 12, INK); box(c, p.x - 12, p.y, 24, 8, '#57534E');
  const b = pendAt(p, frame, crashed);
  if (!b) {
    // (snapped: a stub of rod off the bracket; the rest down in the floor, the blade stuck up out of it)
    box(c, p.x - 3, p.y + 8, 6, 40, '#78716C');
    c.save(); c.translate(U(BLADE_U), F(2) + 10); c.rotate(Math.PI + 0.25);
    drawBlade(c, 0);
    box(c, -3, 30, 6, 130, '#78716C');
    c.restore();
    return;
  }
  if ('still' in b) { box(c, b.x - 2, p.y, 4, b.y - p.y - 20, '#52525B'); for (let y = p.y; y < b.y - 20; y += 10) box(c, b.x - 3, y, 6, 4, '#71717A'); }
  // (a smear behind the blade at speed)
  const prev = pendAt(p, frame - 3, crashed)!;
  if (!('still' in b)) c.globalAlpha = 0.18; else c.globalAlpha = 0; c.fillStyle = '#E4E4E7'; c.beginPath(); c.arc(prev.x, prev.y, 30, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  c.save(); c.translate(p.x, p.y); c.rotate(-b.a);
  box(c, -4, 0, 8, p.len - 10, INK); box(c, -3, 0, 6, p.len - 10, '#78716C'); box(c, -1, 0, 2, p.len - 10, '#A8A29E');
  drawBlade(c, p.len - 14);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// What the wobble shakes loose

export interface Debris { x: number; y: number; vy: number; tell: number; kind: number; rot: number; floor: number }
/** Which story (0..6) he's on (by his feet): -1 out of the tower (or under it). */
export const storyOf = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (cx < TX0 - 10 || cx > TX1 + 10 || feet > F(0) + 40) return -1;
  return Math.max(0, Math.min(STORIES, Math.floor((F(0) - feet + 70) / STORY)));
};
const TELL = 44;
/** Each frame: shaken loose over him (the more beams down, the more often), the tell, the fall, the hit. */
const runDebris = (ctx: FrameContext, list: Debris[], broken: number) => {
  const { state } = ctx, p = state.player;
  const k = storyOf(state);
  const every = broken >= 3 ? Math.max(80, 330 - broken * 36) : 0;
  if (every && k >= 0 && !p.inCutscene && state.frame % every === 0 && list.length < 3) {
    const ceil = k < STORIES ? F(k + 1) + SLAB : ROOF;
    const x = Math.max(TX0 + 20, Math.min(TX1 - 20, p.pos.x + p.width / 2 + p.vel.x * 30 + (Math.random() - 0.5) * 200));
    const floor = floorTopAt(state.blocks, x, ceil + 30, 0) ?? F(k);
    list.push({ x, y: ceil + 4, vy: 0, tell: TELL, kind: Math.floor(Math.random() * 3), rot: 0, floor });
    playSound('crumble', 0.35, 6);
  }
  for (let i = list.length - 1; i >= 0; i--) {
    const d = list[i];
    if (d.tell > 0) {
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
    const hitE = victims(state).find(e => d.x > e.pos.x - 6 && d.x < e.pos.x + e.width + 6 && d.y > e.pos.y && d.y < e.pos.y + e.height);
    if (hitE) {
      worksHit(ctx, hitE, 45, d.x, 'BRAINED!');
      playSound('thud', 0.7, 4);
      list.splice(i, 1); continue;
    }
    if (d.y >= d.floor) {
      for (let j = 0; j < 8; j++) state.particles.push({ pos: { x: d.x, y: d.floor - 2 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 26, color: d.kind === 0 ? '#9A3412' : '#71717A', size: 2 + Math.random() * 3, grav: 0.3, chunk: true });
      playSound('crumble', 0.4, 4);
      list.splice(i, 1);
    }
  }
};
export const drawDebris = (c: Ctx, list: Debris[]) => {
  for (const d of list) {
    // (its shadow on the floor, growing as it comes)
    const k = d.tell > 0 ? 1 - d.tell / TELL : 1;
    c.fillStyle = `rgba(0,0,0,${0.25 + 0.3 * k})`; c.beginPath(); c.ellipse(d.x, d.floor - 1, 6 + 10 * k, 3 + 1.5 * k, 0, 0, Math.PI * 2); c.fill();
    if (d.tell > 0) { box(c, d.x - 8, d.y - 4, 16, 3, INK); continue; }
    c.save(); c.translate(Math.round(d.x), Math.round(d.y)); c.rotate(d.rot);
    if (d.kind === 0) { box(c, -10, -6, 20, 12, INK); box(c, -9, -5, 18, 10, '#9A3412'); box(c, -9, -5, 18, 2, '#C2410C'); }
    else if (d.kind === 1) { box(c, -5, -9, 10, 18, INK); box(c, -4, -8, 8, 16, '#52525B'); box(c, -7, -8, 14, 4, '#71717A'); }
    else { box(c, -2, -16, 4, 32, INK); box(c, -5, -18, 10, 6, INK); box(c, -1, -14, 2, 26, '#CA8A04'); }
    c.restore();
  }
};

export const runHazards = (ctx: FrameContext, debris: Debris[], broken: number, crashed: boolean) => {
  runPendulums(ctx, crashed);
  runGears(ctx, crashed);
  runDebris(ctx, debris, broken);
  setHazardZones(ctx.state, 'tower', dangerZones);
};
