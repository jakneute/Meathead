// Getting to him (the user: "enemies are bad at approaching Meathead when an obstacle is in the way... make them try
// to JUMP up and get a VANTAGE point"). Meathead 2's ground walkers, after their own AI's had its say each frame
// (kinds.ts runs this on the walkers: the people, unless a kind says otherwise with `pathing`):
//
//   in the way   something it can't just step up (a planter, a crate, a ledge's face) between it and him: it hops up
//                onto it (or over it); too close under it to clear it, a step back first for a run at it; too tall to
//                get up, it stands there facing him (no grinding against the wall).
//   him above    him stood up on something near: it hops up after him, onto whatever gets it nearest his level.
//   him below    stopped at the edge of what it's on, him down below that way: it goes on off the edge after him.
//
// Only while it's going after him under its own steam (in whatever state it was in when it last walked his way: an
// attack's lunge, a pose, running off with his stuff, none of that), only once it's been seen, never while he's
// jumping a gap (the engine's holding off), never in a cutscene. Every hop's flown out first the way the engine will fly
// it: nothing hit on the way, no pit, nothing coming down in a hazard (hazardHit.ts: nobody walks into one).

import type { Block, Enemy } from '../m1/types';
import type { FrameContext } from '../m1/game/core/context';
import type { GameState } from '../m1/game/core/state';
import { GRAVITY } from '../m1/constants';
import { floorTopAt } from '../m1/game/core/terrain';
import { holdingOff, safeAhead } from '../m1/game/enemies/kinds';
import { playSound } from '../m1/game/platform/audio';
import { inHazard } from './hazardHit';

/** The engine's pull on an airborne enemy, and what the air takes off its speed across each frame (enemies.ts). */
const G = GRAVITY * 0.75, AIR = 0.97;
/** A step it just walks up (the engine's); how high up a hop gets its feet, at most; how far down it'll go after him. */
const STEP = 26, MAX_RISE = 170, MAX_DROP = 360;
/** Faster than this it's lunging or charging, not walking: left to it. */
const WALKING = 5;

interface Mem {
  /** When it last walked his way, at what speed, and in what state of its AI. */
  chaseAt: number; speed: number; chaseState?: string;
  /** No new try before this frame. */
  nextTry: number;
  /** Backing off for a run at something, till this frame, this way. */
  backUntil: number; backDir: number;
  /** Going on off an edge after him, till this frame, this way, this fast. */
  dropUntil: number; dropDir: number; dropSpeed: number; dropFeet: number;
  /** Runs at the same thing that didn't come to a hop (it gives up on it after a few), and till when it's given up. */
  fails: number; giveUpUntil: number;
}
const mems = new WeakMap<Enemy, Mem>();
const memOf = (e: Enemy) => {
  let m = mems.get(e);
  if (!m) mems.set(e, (m = { chaseAt: -1e9, speed: 2, nextTry: 0, backUntil: 0, backDir: 1, dropUntil: 0, dropDir: 1, dropSpeed: 2, dropFeet: 0, fails: 0, giveUpUntil: 0 }));
  return m;
};

/** Something solid it can't pass through (or stand inside): not a jump-through ledge, not a pit, not a door (the
 *  engine walks enemies through those). */
const hard = (b: Block) => !b.oneWay && b.type !== 'pit' && b.type !== 'door';

/** The nearest face (of something it can't step up) its way within `reach` of its leading edge: how far off, and the
 *  top of the stack it's the front of. */
const faceAhead = (state: GameState, e: Enemy, dir: number, reach: number) => {
  const feet = e.pos.y + e.height, lead = dir > 0 ? e.pos.x + e.width : e.pos.x;
  let best: { gap: number; b: Block } | null = null;
  for (const b of state.blocks) {
    if (!hard(b)) continue;
    if (b.y >= feet - STEP || b.y + b.h <= e.pos.y + 4) continue;
    const gap = dir > 0 ? b.x - lead : lead - (b.x + b.w);
    if (gap < -3 || gap > reach) continue;
    if (!best || gap < best.gap) best = { gap: Math.max(0, gap), b };
  }
  if (!best) return null;
  // (the top of it: anything stacked on it at its front counts too)
  const fx = dir > 0 ? best.b.x + 6 : best.b.x + best.b.w - 6;
  let top = best.b.y;
  for (let i = 0; i < 6; i++) {
    const on = state.blocks.find(o => hard(o) && fx > o.x && fx < o.x + o.w && o.y < top && o.y + o.h >= top - 2);
    if (!on) break;
    top = on.y;
  }
  return { gap: best.gap, top };
};

/**
 * Flown the way the engine would fly it: from its box at (x, y), off at (vx, vy) (its feet already off the floor:
 * `airborne`; or its launch frame first, a step along the ground). Where it comes down (its feet, its middle), or null:
 * something solid in the way, a ceiling, down a pit, too far down, or down in a hazard.
 */
const fly = (state: GameState, e: Enemy, x: number, y: number, vx: number, vy: number, airborne = false) => {
  const w = e.width, h = e.height, from = y + h;
  const lo = Math.min(x, x + vx * 120) - 300, hi = Math.max(x, x + vx * 120) + w + 300;
  const blocks = state.blocks.filter(b => b.x < hi && b.x + b.w > lo);
  let s = vx, v = vy;
  if (!airborne) x += s;
  for (let t = 0; t < 150; t++) {
    const top = floorTopAt(blocks, x + w / 2, y + h, STEP);
    x += s; y += v;
    if (top !== null && y >= top - h) {
      y = top - h;
      if (inHazard(state, e, x, y)) return null;
      return { feet: top, cx: x + w / 2, x };
    }
    // (into the side of something, or up into the underside of it)
    for (const b of blocks) if (hard(b) && x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y + 16) return null;
    v += G; s *= AIR;
    if (y + h > from + MAX_DROP) return null;
  }
  return null;
};

/** A hop's speeds to come down `dx` across, `rise` up from where it is, getting `over` above that on the way. */
const arc = (dx: number, rise: number, over: number) => {
  const up = Math.max(0, rise) + over;
  const vy = Math.sqrt(2 * G * up);
  const t = Math.max(8, vy / G + Math.sqrt(Math.max(0, 2 * (up - rise)) / G));
  const vx = (dx * (1 - AIR)) / (1 - Math.pow(AIR, t));
  return { vx: Math.max(-6.5, Math.min(6.5, vx)), vy };
};

const hop = (e: Enemy, m: Mem, frame: number, vx: number, vy: number) => {
  e.vel.y = -vy; e.vel.x = vx;
  if (Math.abs(vx) > 0.2) e.facing = (vx < 0 ? -1 : 1);
  m.nextTry = frame + 40; m.fails = 0;
  playSound('jump', 0.35, -2);
};

/** Up onto (or over) the thing in its way: the first hop that gets it up there clean. */
const hopUpOnto = (state: GameState, e: Enemy, dir: number, face: { gap: number; top: number }, speed: number) => {
  const feet = e.pos.y + e.height, rise = feet - face.top;
  for (const over of [30, 60, 95]) {
    if (rise + over > MAX_RISE + 45) break;
    for (const across of [face.gap + e.width / 2 + 24, face.gap + e.width / 2 + 60, face.gap + e.width + 110]) {
      const h = arc(dir * across, rise, over);
      if (Math.abs(h.vx) < Math.min(1.2, speed)) continue;
      const r = fly(state, e, e.pos.x, e.pos.y, h.vx, h.vy);
      // (up on it, or over it and down the far side: either way past the face)
      if (r && (r.feet <= feet - STEP || (dir > 0 ? r.x > e.pos.x + face.gap + 8 : r.x < e.pos.x - face.gap - 8))) return h;
    }
  }
  return null;
};

/** Him up on something: the hop that gets it nearest his level, near him (null: nothing it can get up onto). */
const hopUpToward = (state: GameState, e: Enemy, pcx: number, pf: number) => {
  const feet = e.pos.y + e.height, cx = e.pos.x + e.width / 2;
  const tops = state.blocks.filter(b => b.type !== 'pit' && b.type !== 'door' && b.y <= feet - 40 && b.y >= feet - MAX_RISE && b.y >= pf - 30
    && b.w >= e.width * 0.8 && b.x < Math.max(cx, pcx) + 260 && b.x + b.w > Math.min(cx, pcx) - 260)
    .sort((a, b) => Math.abs(a.y - pf) - Math.abs(b.y - pf) || Math.abs(a.x + a.w / 2 - pcx) - Math.abs(b.x + b.w / 2 - pcx))
    .slice(0, 5);
  for (const b of tops) {
    // (nothing stood on top of it: somewhere it'd be stood)
    const lx = Math.max(b.x + e.width / 2 + 4, Math.min(b.x + b.w - e.width / 2 - 4, pcx));
    const dx = lx - cx;
    if (Math.abs(dx) > 300) continue;
    for (const over of [36, 70]) {
      const h = arc(dx, feet - b.y, over);
      const r = fly(state, e, e.pos.x, e.pos.y, h.vx, h.vy);
      if (r && r.feet <= feet - 30) return h;
    }
  }
  return null;
};

/** At the edge of what it's on, him down below that way: does going on off it, at `speed`, come down somewhere it can
 *  stand (not a pit, not a hazard, not miles down)? */
const dropsOk = (state: GameState, e: Enemy, dir: number, speed: number, pf: number) => {
  const feet = e.pos.y + e.height;
  // (the edge: where the floor under its middle falls away)
  for (let d = 2; d <= 70; d += 4) {
    const cx = e.pos.x + e.width / 2 + dir * d, top = floorTopAt(state.blocks, cx, feet, STEP);
    if (top !== null && top <= feet + 16) continue;
    const r = fly(state, e, cx - e.width / 2, e.pos.y, dir * speed, 0, true);
    return !!r && r.feet > feet + 16 && r.feet <= pf + 50;
  }
  return false;
};

/**
 * After a walker's own AI each frame (it didn't move itself): getting to him when something's in the way. Its AI's
 * set where it wants to go (vel.x); this may hop it, back it off, stop it, or walk it on off an edge.
 */
export const pathAfterAI = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, f = state.frame;
  if (e.vel.y !== 0 || e.health <= 0 || e.isBlownAway || !e.seen || e.type === 'boss' || e.enemyType === 'flyer' || e.innocent || e.harmless) return;
  if ((e.pauseTimer ?? 0) > 0 || (e.frozenTimer ?? 0) > 0) return;
  const m = memOf(e);
  const cx = e.pos.x + e.width / 2, feet = e.pos.y + e.height;
  const pcx = p.pos.x + p.width / 2, pf = p.pos.y + p.height, dx = pcx - cx, pdir = (Math.sign(dx) || 1) as 1 | -1;
  const off = p.health <= 0 || p.inCutscene || holdingOff(state);
  // (walking his way: what it's after him in, and how fast it goes)
  const walking = e.vel.x !== 0 && Math.sign(e.vel.x) === pdir && Math.abs(e.vel.x) > 0.3 && Math.abs(e.vel.x) <= WALKING;
  if (walking) { m.chaseAt = f; m.chaseState = e.aiState; m.speed = Math.abs(e.vel.x); }
  const chasing = !off && m.chaseState === e.aiState && f - m.chaseAt < 240;
  if (!chasing) { m.backUntil = 0; m.dropUntil = 0; return; }
  // A step back, for a run at it
  if (m.backUntil > f) {
    e.vel.x = safeAhead(ctx, e, m.backDir) ? m.backDir * Math.max(1.4, m.speed * 0.8) : 0;
    return;
  }
  // On off the edge after him
  // (only off the one edge it looked over: down, that's that)
  if (m.dropUntil > f && Math.abs(feet - m.dropFeet) < 2) { if (pf > feet + 16) e.vel.x = m.dropDir * m.dropSpeed; return; }
  m.dropUntil = 0;
  const speed = Math.max(1.6, Math.min(4, m.speed));

  // Something in the way, on its way to him
  if (walking && f >= m.giveUpUntil) {
    // (not one past him: he's this side of it)
    const face = faceAhead(state, e, pdir, Math.min(14 + Math.abs(e.vel.x) * 12, Math.abs(dx) - e.width / 2));
    if (face) {
      const rise = feet - face.top;
      if (rise > MAX_RISE) { if (face.gap < 4) e.vel.x = 0; return; }
      if (f < m.nextTry) { if (face.gap < 4) e.vel.x = 0; return; }
      const h = hopUpOnto(state, e, pdir, face, speed);
      if (h) { hop(e, m, f, h.vx, h.vy); return; }
      // (too close under it to clear it: back off for a run at it; a few goes at it and no hop, it gives up a while)
      if (face.gap < 46) {
        if (++m.fails > 3) { m.fails = 0; m.giveUpUntil = f + 180; e.vel.x = 0; return; }
        m.backUntil = f + 16; m.backDir = -pdir; m.nextTry = f + 16;
        e.vel.x = -pdir * Math.max(1.4, m.speed * 0.8);
      }
      return;
    }
  } else if (walking && f < m.giveUpUntil && faceAhead(state, e, pdir, 4)) { e.vel.x = 0; return; }

  if (f < m.nextTry) return;
  // Him up on something near: up there after him
  if (pf < feet - 50 && p.isGrounded && Math.abs(dx) < 320) {
    const h = hopUpToward(state, e, pcx, pf);
    if (h) { hop(e, m, f, h.vx, h.vy); return; }
    m.nextTry = f + 20;
    return;
  }
  // Him down below, it stopped at the edge of what it's on: on off it after him
  if (pf > feet + 40 && Math.abs(dx) > 24 && Math.abs(dx) < 520 && !safeAhead(ctx, e, pdir, 10)) {
    if (dropsOk(state, e, pdir, speed, pf)) {
      m.dropUntil = f + 40; m.dropDir = pdir; m.dropSpeed = speed; m.dropFeet = feet;
      e.vel.x = pdir * speed; e.facing = pdir;
    } else m.nextTry = f + 30;
  }
};
