// The West Wing's hazards (a kids' show's, a step on from part one's: still no anvils or dynamite, they're the
// cat-and-mouse knockoff's), each hurting the mean men as well as him (none of them idles in one: hazard zones), each
// with a readable rhythm:
//
//   THE FILING CABINETS   too tall to jump; their drawers slide out of both faces on a rhythm, one above the next: a
//                         staircase while they're out (each a ledge), gone when they slam shut (off he drops). One
//                         sliding out into him shoves him off, hurt.
//   THE JELLY MOLD        a big green wobbling mold on the floor: land on it and it throws him high (up to the pot rack).
//   THE RANGE             a step up across the kitchen, four burners on top: each ring glows and ticks (the tell), then
//                         a column of fire; they go in turn.
//   THE GLOBE             on its stand in the Map Room; past it, it wobbles (the tell), drops off and rolls after him,
//                         faster and faster, flattening whoever's in the way; it smashes on the map cabinet's step and
//                         splits in two (and stays split: GLOBE_MEMO).
//   THE LASERS            the Situation Room's beams, floor to ceiling, blinking on and off (they flicker first); and
//                         one across the room going up and down (over it low, under it high).
//
// After the screen's down (the real stage) none of it runs: the drawers stand out as steps (plywood boxes on the stage),
// the burners and lasers are dead props, the globe a split fiberglass ball.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { hazardHit, hazardVictims, setHazardZones, boxHits } from '../../hazardHit';
import { envSound } from '../../bossQuiet';
import { GY } from '../geometry';
import { wh2Of, GLOBE_MEMO, type Drawer } from './state';
import {
  CABINETS, DRAWER_W, DRAWER_D, JELLO, RANGE, BURNERS, BURNER_PERIOD, GLOBE, MAP_STEP, BLINKERS, BLINK_PERIOD, SWEEP, CEIL, X, Y,
} from './layout';

const alive = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const overlaps = (state: GameState, x: number, y: number, w: number, h: number) => { const p = state.player; return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y; };
const away = (state: GameState, x: number) => (state.player.pos.x + state.player.width / 2 < x ? -1 : 1);
const castHit = (ctx: FrameContext, e: Enemy, dmg: number, fromX: number, call: string, gap = 50, knock = 9) => {
  const s = wh2Of(ctx.state), at = s.hazHit.get(e) ?? -999;
  if (ctx.state.frame - at < gap) return;
  s.hazHit.set(e, ctx.state.frame);
  hazardHit(ctx, e, dmg, fromX, call, { knock });
};

// ---------------------------------------------------------------------------------------------------------------
// The filing cabinets

/** How far out drawer k of a cabinet is at frame f (0 shut .. 1 out). */
export const drawerOut = (ci: number, k: number, f: number) => {
  const C = CABINETS[ci], t = (((f + C.phase * C.period) % C.period) + C.period) % C.period;
  const SLIDE = 10, open = (C.drawers.length - 1 - k) * C.ripple, shut = C.out + k * C.ripple;
  if (t < open) return 0;
  if (t < shut) return Math.min(1, (t - open) / SLIDE);
  return Math.max(0, 1 - (t - shut) / SLIDE);
};
/** The drawers' ledges (both faces of each cabinet). */
export const makeDrawers = (state: GameState) => {
  const s = wh2Of(state);
  s.drawers = [];
  CABINETS.forEach((C, ci) => C.drawers.forEach((h, k) => {
    for (const side of [-1, 1] as const) {
      const b: Block = { x: -1e7, y: Y(h), w: DRAWER_W, h: 16, type: 'platform', oneWay: true, hidden: true, tag: `ct-wh2-drawer-${ci}-${k}-${side}` } as Block;
      state.blocks.push(b);
      s.drawers.push({ cab: ci, k, side, b, out: 0, was: 0 });
    }
  }));
};
const drawerBox = (d: Drawer, out: number) => {
  const C = CABINETS[d.cab], w = DRAWER_W * out;
  return { x: d.side < 0 ? X(C.a) - w : X(C.b), w, top: Y(C.drawers[d.k]) };
};
const updateDrawers = (ctx: FrameContext, real: boolean) => {
  const { state } = ctx, s = wh2Of(state), p = state.player;
  const zones: { x0: number; x1: number; y0: number; y1: number; ground?: boolean }[] = [];
  for (const d of s.drawers) {
    // (the real stage: the drawers are plywood steps, out for good)
    const out = real ? 1 : drawerOut(d.cab, d.k, state.frame);
    d.was = d.out; d.out = out;
    const B = drawerBox(d, out);
    // (a ledge only while it's well out: shut, it's gone and off he drops)
    if (out > 0.6) { d.b.x = B.x; d.b.w = Math.max(8, B.w); d.b.y = B.top; } else d.b.x = -1e7;
    if (real) continue;
    if (out > d.was && d.was === 0) envSound(state, B.x, 'clang', 0.3, 8 - d.k * 2);
    if (out < d.was && out === 0) envSound(state, B.x, 'slam', 0.25, 10);
    zones.push({ x0: d.side < 0 ? X(CABINETS[d.cab].a) - DRAWER_W - 30 : X(CABINETS[d.cab].b), x1: d.side < 0 ? X(CABINETS[d.cab].a) : X(CABINETS[d.cab].b) + DRAWER_W + 30, y0: B.top, y1: B.top + DRAWER_D, ground: false });
    // (sliding out into him: shoved off, hurt)
    if (out > d.was && alive(state) && p.invincibilityTimer <= 0 && overlaps(state, B.x, B.top + 2, B.w, DRAWER_D - 2) && p.pos.y + p.height > B.top + 6) {
      hurtPlayer(ctx, 8, 'm2:ct_drawer', { x: d.side * 8, y: -5 });
      playSound('slam', 0.7, 2);
    }
    for (const e of hazardVictims(state)) if (out > d.was && boxHits(e, B.x, B.top + 2, B.w, DRAWER_D - 2)) castHit(ctx, e, 30, d.side < 0 ? X(CABINETS[d.cab].a) : X(CABINETS[d.cab].b), 'FILED!');
  }
  setHazardZones(state, 'ct-wh2-drawers', zones);
};

// ---------------------------------------------------------------------------------------------------------------
// The jelly mold

const JELLO_BOUNCE = 17;
export const jelloWobble = { t: 0 };
const updateJello = (state: GameState) => {
  const p = state.player;
  if (jelloWobble.t > 0) jelloWobble.t--;
  if (!p.isGrounded || p.vel.y < 0) return false;
  const feet = p.pos.y + p.height, cx = p.pos.x + p.width / 2;
  if (Math.abs(feet - Y(JELLO.h)) > 3 || cx < X(JELLO.a) || cx > X(JELLO.b)) return false;
  p.vel.y = -JELLO_BOUNCE; p.isGrounded = false;
  p.coyoteAirTimer = 0; p.coyoteJumpTimer = 0; p.jumpHoldTimer = 0;
  p.pos.y -= 2; p.squash = -1;
  playSound('boing', 0.9, -4); playSound('squish', 0.5, 6);
  jelloWobble.t = 40;
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The range

/** How a burner's going at frame f: 'off', 'tell' (the ring glowing, ticking), 'fire'; and how far into it. */
export const burnerAt = (k: number, f: number) => {
  const t = (((f / BURNER_PERIOD) - k * 0.22) % 1 + 1) % 1;
  if (t < 0.2) return { st: 'tell' as const, k: t / 0.2 };
  if (t < 0.52) return { st: 'fire' as const, k: (t - 0.2) / 0.32 };
  return { st: 'off' as const, k: 0 };
};
export const FIRE_H = 100, FIRE_W = 46;
const updateRange = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, top = Y(RANGE.h);
  setHazardZones(state, 'ct-wh2-range', [{ x0: X(RANGE.a), x1: X(RANGE.b), y0: top - FIRE_H, y1: top + 2, ground: true }]);
  BURNERS.forEach((rx, k) => {
    const x = X(rx), b = burnerAt(k, state.frame);
    if (b.st === 'tell' && state.frame % 9 === 0) envSound(state, x, 'click', 0.25, 12);
    if (b.st !== 'fire') return;
    if (state.frame % 10 === 0) envSound(state, x, 'flame', 0.18, 2);
    const h = FIRE_H * Math.min(1, b.k * 6);
    if (state.frame % 2 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 20, y: top - h }, vel: { x: (Math.random() - 0.5) * 1.5, y: -1.5 - Math.random() * 2 }, life: 18, color: Math.random() < 0.5 ? '#FDBA74' : '#FDE047', size: 2 + Math.random() * 2 });
    if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, x - FIRE_W / 2 + 4, top - h, FIRE_W - 8, h)) {
      hurtPlayer(ctx, 10, 'm2:ct_burner', { x: away(state, x) * 5, y: -9 });
      playSound('ignite', 0.6, 4);
    }
    for (const e of hazardVictims(state)) if (boxHits(e, x - FIRE_W / 2, top - h, FIRE_W, h)) castHit(ctx, e, 40, x, 'COOKED!', 50, 7);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The globe

const GLOBE_FLOOR = GY;
export const globeHome = () => ({ x: X(GLOBE.stand), y: Y(GLOBE.standH) - GLOBE.r });
const splitGlobe = (state: GameState, x: number) => {
  const g = wh2Of(state).globe;
  g.st = 'split'; g.vx = 0;
  g.halves = [{ x: x - 18, rock: -0.6, v: 0 }, { x: x + 22, rock: 0.7, v: 0 }];
  state.stageMemo[GLOBE_MEMO] = '1';
  playSound('crash', 1, -6); playSound('glass', 0.6, -4); envSound(state, x, 'boom', 0.4, 6);
  for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: x + 30, y: GY - GLOBE.r }, vel: { x: (Math.random() - 0.6) * 7, y: -2 - Math.random() * 5 }, life: 40, color: ['#3B82F6', '#22C55E', '#FDE68A', '#F8FAFC'][i % 4], size: 2.5 + Math.random() * 2.5, grav: 0.25 } as typeof state.particles[number]);
};
/** Each frame: the globe on its stand (or the halves, broken: GLOBE_MEMO), set off by him passing, after him. Returns
 *  true the frame it's set off (the section says its lines). */
const updateGlobe = (ctx: FrameContext, real: boolean) => {
  const { state } = ctx, g = wh2Of(state).globe, p = state.player, cx = p.pos.x + p.width / 2;
  let started = false;
  if (g.x === 0) {
    const h = globeHome(); g.x = h.x; g.y = h.y;
    if (state.stageMemo[GLOBE_MEMO] || real) { g.st = 'split'; g.halves = [{ x: X(MAP_STEP.a) - GLOBE.r - 18, rock: 0, v: 0 }, { x: X(MAP_STEP.a) - GLOBE.r + 22, rock: 0, v: 0 }]; }
  }
  if (g.st === 'split') {
    for (const h of g.halves) { h.v += -h.rock * 0.02; h.v *= 0.96; h.rock += h.v; }
    return false;
  }
  if (real) return false;
  g.t++;
  if (g.st === 'stand') {
    if (alive(state) && cx > X(GLOBE.trigger) && cx < X(MAP_STEP.a) && Math.abs(p.pos.y + p.height - GY) < 120) { g.st = 'tell'; g.t = 0; envSound(state, g.x, 'rumble', 0.6, -6); started = true; }
    return started;
  }
  if (g.st === 'tell') {
    // (wobbling on the stand, creaking: the tell)
    if (g.t % 6 === 0) envSound(state, g.x, 'clink', 0.3, (g.t % 12) ? -2 : 2);
    if (g.t > 34) { g.st = 'roll'; g.t = 0; g.vx = 1.2; g.vy = -2; playSound('thud', 0.8, -10); }
    return false;
  }
  // Rolling: off the stand, bouncing down, after him faster and faster
  g.vx = Math.min(GLOBE.max, g.vx + 0.045);
  g.vy += 0.6; g.x += g.vx; g.y += g.vy;
  if (g.y > GLOBE_FLOOR - GLOBE.r) { if (g.vy > 3) { envSound(state, g.x, 'slam', 0.5, -8); shake(state); } g.y = GLOBE_FLOOR - GLOBE.r; g.vy = g.vy > 3 ? -g.vy * 0.35 : 0; }
  g.spin += g.vx / GLOBE.r;
  if (g.t % 18 === 0) envSound(state, g.x, 'rumble', 0.35, -4);
  setHazardZones(state, 'ct-wh2-globe', [{ x0: g.x - GLOBE.r - 40, x1: g.x + GLOBE.r + 120, y0: g.y - GLOBE.r, y1: GY + 2, ground: true }]);
  // (it gets him: flattened, flung on ahead of it)
  const gx = g.x - GLOBE.r + 8, gy = g.y - GLOBE.r + 8, gw = GLOBE.r * 2 - 16;
  if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, gx, gy, gw, gw)) {
    hurtPlayer(ctx, 14, 'm2:ct_globe', { x: 9, y: -9 });
    playSound('thud', 1, -10);
  }
  for (const e of hazardVictims(state)) if (boxHits(e, gx, gy, gw, gw)) castHit(ctx, e, 999, g.x - 40, 'FLATTENED!', 40, 12);
  // (into the map cabinet's step: smashed in two)
  if (g.x + GLOBE.r >= X(MAP_STEP.a)) splitGlobe(state, X(MAP_STEP.a) - GLOBE.r);
  return false;
};
const shake = (state: GameState) => shakeScreen(state, 6, 4);

// ---------------------------------------------------------------------------------------------------------------
// The lasers

/** A blinking beam's state at frame f: 'off', 'tell' (flickering, thin), 'on'. */
export const blinkAt = (phase: number, f: number) => {
  const t = (((f / BLINK_PERIOD) + phase) % 1 + 1) % 1;
  if (t < 0.18) return 'tell' as const;
  if (t < 0.6) return 'on' as const;
  return 'off' as const;
};
/** The sweeping beam's height (up from the floor) at frame f. */
export const sweepAt = (f: number) => SWEEP.lo + (SWEEP.hi - SWEEP.lo) * (0.5 + 0.5 * Math.cos((f / SWEEP.period) * Math.PI * 2));
const updateLasers = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  setHazardZones(state, 'ct-wh2-lasers', [
    ...BLINKERS.map(([x]) => ({ x0: X(x) - 22, x1: X(x) + 22, y0: Y(CEIL), y1: GY + 2, ground: true })),
    { x0: X(SWEEP.a), x1: X(SWEEP.b), y0: Y(SWEEP.hi + 10), y1: GY + 2, ground: true },
  ]);
  for (const [rx, ph] of BLINKERS) {
    const x = X(rx), st = blinkAt(ph, state.frame);
    if (st === 'tell' && state.frame % 7 === 0) envSound(state, x, 'beep', 0.18, 20);
    if (st !== 'on') continue;
    if (state.frame % 20 === 0) envSound(state, x, 'raygun', 0.08, 18);
    if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, x - 3, Y(CEIL), 6, CEIL)) { hurtPlayer(ctx, 10, 'm2:ct_laser', { x: away(state, x) * 7, y: -6 }); playSound('taser', 0.6, 6); }
    for (const e of hazardVictims(state)) if (boxHits(e, x - 3, Y(CEIL), 6, CEIL)) castHit(ctx, e, 50, x, 'LASERED!', 40, 8);
  }
  const h = sweepAt(state.frame), y = Y(h), a = X(SWEEP.a), b = X(SWEEP.b);
  if (state.frame % 24 === 0) envSound(state, (a + b) / 2, 'raygun', 0.07, 12);
  if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, a, y - 3, b - a, 6)) { hurtPlayer(ctx, 10, 'm2:ct_laser', { x: 0, y: -8 }); playSound('taser', 0.6, 4); }
  for (const e of hazardVictims(state)) if (boxHits(e, a, y - 3, b - a, 6)) castHit(ctx, e, 50, mid(e), 'LASERED!', 40, 6);
};
const mid = (e: Enemy) => e.pos.x + e.width / 2;

// ---------------------------------------------------------------------------------------------------------------

/** Each frame, first thing (before he moves). `real`: the screen's down (nothing runs; the drawers stand out). Returns
 *  what the section wants to know this frame. */
export const updateHazards2 = (ctx: FrameContext, real: boolean) => {
  updateDrawers(ctx, real);
  const bounced = updateJello(ctx.state);
  if (real) { updateGlobe(ctx, true); return { bounced, globe: false }; }
  updateRange(ctx);
  const globe = updateGlobe(ctx, false);
  updateLasers(ctx);
  return { bounced, globe };
};
export { DRAWER_D };
