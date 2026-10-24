// Getting to him (the user: "enemies are bad at approaching Meathead when an obstacle is in the way... make them try
// to JUMP up and get a VANTAGE point"). Meathead 2's ground walkers, after their own AI's had its say each frame
// (kinds.ts runs this on the walkers: the people, unless a kind says otherwise with `pathing`):
//
//   in the way   something it can't just step up (a planter, a crate, a ledge's face) between it and him: it hops up
//                onto it (or over it) from a run-up suited to its height (too close under it, it backs off to there
//                first); too tall to get up (over MAX_RISE), it stands there facing him (no grinding against the wall).
//   him above    him stood up on something near (a ledge, a catwalk, a crate): it hops up after him, onto whatever gets
//                it nearest his level; no hop from where it stands, it walks to one that works (under a jump-through
//                ledge, or a run-up off the end of a solid one) and goes from there.
//   him below    stopped at the edge of what it's on, him down below that way: it goes on off the edge after him.
//   wedged       dropped middle first into a slot narrower than it (the engine stands it on what's under its middle)
//                and stuck there in the solids either side: a moment of that, chasing or not, and it hops up out onto
//                the lower of them (the user's: "address narrow gaps like this so enemies can't get stuck there").
//
// Only while it's going after him under its own steam (in whatever state it was in when it last walked his way: an
// attack's lunge, a pose, running off with his stuff, none of that), only once it's been seen, never while he's
// jumping a gap (the engine's holding off), never in a cutscene. Every hop's flown out first the way the engine will fly
// it (enemies.ts: its gravity, its air drag, the snap up onto a top within a step of its feet, slamIntoWalls' side test
// on the walls, the ceilings): nothing hit on the way, no pit, nothing coming down in a hazard (hazardHit.ts: nobody
// walks into one).

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
const STEP = 26, MAX_RISE = 260, MAX_DROP = 360;
/** Faster than this it's lunging or charging, not walking: left to it. */
const WALKING = 5;
/** How far back from a face it wants to be for a run at it, for a face this high (the higher, the further back: it has
 *  to be up past the top before it gets there). */
const runUp = (rise: number) => 24 + rise * 0.3;

interface Mem {
  /** When it last walked his way, at what speed, and in what state of its AI. */
  chaseAt: number; speed: number; chaseState?: string;
  /** No new try before this frame. */
  nextTry: number;
  /** Backing off for a run at something, till this frame, this way. */
  backUntil: number; backDir: number;
  /** Going on off an edge after him, till this frame, this way, this fast. */
  dropUntil: number; dropDir: number; dropSpeed: number; dropFeet: number;
  /** Walking to where a hop up after him goes from (him above), till this frame. */
  goUntil: number; goX: number; arrivedAt: number;
  /** Runs at the same thing that didn't come to a hop (it gives up on it after a few), and till when it's given up. */
  fails: number; giveUpUntil: number;
  /** Its own few frames' offset on retries (so a crowd doesn't all think on the one frame). */
  jitter: number;
  /** Since when it's been wedged in a slot (0: it isn't). */
  wedgedAt: number;
}
const mems = new WeakMap<Enemy, Mem>();
const memOf = (e: Enemy) => {
  let m = mems.get(e);
  if (!m) {
    let j = 0;
    for (let i = 0; i < e.id.length; i++) j = (j * 31 + e.id.charCodeAt(i)) % 997;
    mems.set(e, (m = { chaseAt: -1e9, speed: 2, nextTry: 0, backUntil: 0, backDir: 1, dropUntil: 0, dropDir: 1, dropSpeed: 2, dropFeet: 0, goUntil: 0, goX: 0, arrivedAt: -1e9, fails: 0, giveUpUntil: 0, jitter: j % 9, wedgedAt: 0 }));
  }
  return m;
};

/** Something solid it can't pass through (or stand inside): not a jump-through ledge, not a pit, not a door (the
 *  engine walks enemies through those). */
const hard = (b: Block) => !b.oneWay && b.type !== 'pit' && b.type !== 'door';
/** Something it can stand on. */
const standable = (b: Block) => b.type !== 'pit' && b.type !== 'door';
/** How far up a face its feet can be and still not catch it going past (slamIntoWalls: 8 on a wall; stopAgainstGround:
 *  16 on the ground's and a platform's face), plus how fast it's coming down. */
const sideGive = (b: Block, vy: number) => (b.type === 'wall' ? 8 : 16) + Math.max(0, vy);

/** The blocks between x0 and x1 (and a margin). */
const near = (state: GameState, x0: number, x1: number) => {
  const lo = Math.min(x0, x1) - 60, hi = Math.max(x0, x1) + 60;
  return state.blocks.filter(b => b.x < hi && b.x + b.w > lo);
};

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

/** Wedged: stood (its middle over a floor) with its sides into something solid more than a step up, not just up
 *  against a face (the engine never walks one into a face: only a drop into a slot narrower than it does this). The
 *  lowest such thing it's into, its top within a hop, or null. */
const WEDGED_FOR = 40;
const wedgedIn = (state: GameState, e: Enemy) => {
  const feet = e.pos.y + e.height, x0 = e.pos.x, x1 = x0 + e.width, cx = (x0 + x1) / 2;
  let low: Block | null = null;
  for (const b of near(state, x0, x1)) {
    if (!hard(b) || b.y >= feet - STEP || b.y + b.h <= e.pos.y + 4) continue;
    if (x1 <= b.x + 4 || x0 >= b.x + b.w - 4) continue;
    // (its middle in it: not a slot (set into a hole in the rock, say): left be)
    if (cx > b.x && cx < b.x + b.w) return null;
    // (no room on top of it (a door's wall shut under the wall over the doorway): not a way out)
    if (state.blocks.some(o => o !== b && hard(o) && o.x < b.x + b.w && o.x + o.w > b.x && o.y < b.y && o.y + o.h > b.y - e.height)) continue;
    if (!low || b.y > low.y) low = b;
  }
  return low && feet - low.y <= MAX_RISE ? low : null;
};

/**
 * Flown the way the engine would fly it: from its box at (x, y), off at (vx, vy) (its feet already off the floor:
 * `airborne`; or its launch frame first, a step along the ground). Where it comes down (its feet, its middle), or null:
 * something solid in the way (caught on a face, a head into an underside), down a pit, too far down, or down in a hazard.
 */
const fly = (state: GameState, e: Enemy, x: number, y: number, vx: number, vy: number, airborne = false) => {
  const w = e.width, h = e.height, from = y + h;
  const blocks = near(state, Math.min(x, x + vx * 34), Math.max(x, x + vx * 34) + w);
  const solid = blocks.filter(hard);
  // (its box at (bx, by) into something solid: a face it's not up past the top of, or an underside)
  const caught = (bx: number, by: number, give: (b: Block) => number) => {
    const feet = by + h;
    for (const b of solid) if (bx < b.x + b.w && bx + w > b.x && by < b.y + b.h && feet > b.y + give(b)) return true;
    return false;
  };
  let s = vx, v = vy;
  // (the launch frame's step along the ground: a face more than a step up in the way stops it dead)
  if (!airborne) { x += s; if (caught(x, y, () => STEP)) return null; }
  for (let t = 0; t < 160; t++) {
    const top = floorTopAt(blocks, x + w / 2, y + h, STEP);
    x += s; y += v;
    if (top !== null && y >= top - h) {
      y = top - h;
      if (inHazard(state, e, x, y)) return null;
      return { feet: top, cx: x + w / 2, x };
    }
    v += G;
    if (caught(x, y, b => sideGive(b, v))) return null;
    s *= AIR;
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
  m.nextTry = frame + 30; m.fails = 0; m.goUntil = 0; m.backUntil = 0;
  playSound('jump', 0.35, -2);
};

/** Up onto (or over) the thing in its way: the first hop that gets it up there clean. */
const hopUpOnto = (state: GameState, e: Enemy, dir: number, face: { gap: number; top: number }, speed: number) => {
  const feet = e.pos.y + e.height, rise = feet - face.top;
  for (const over of [30, 60, 95, 140]) {
    if (rise + over > MAX_RISE + 60) break;
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

/** Its feet at x (its middle) if it walks there along what it's on from where it is: no drop off anything, no face
 *  more than a step up, not stood in a hazard there (null: it can't). */
const walkTo = (state: GameState, e: Enemy, blocks: Block[], cx: number, x: number, feet: number) => {
  const dir = Math.sign(x - cx), w = e.width, h = e.height;
  let f = feet;
  for (let d = 0; d < Math.abs(x - cx) + 12; d += 12) {
    const ax = cx + dir * Math.min(Math.abs(x - cx), d) + dir * (w / 2);
    const top = floorTopAt(blocks, ax - dir * (w / 2), f, STEP);
    if (top === null || top - f > 30) return null;
    f = top;
    // (its leading edge into something more than a step up)
    if (blocks.some(b => hard(b) && ax > b.x && ax < b.x + b.w && b.y < f - STEP && b.y + b.h > f - h + 4)) return null;
  }
  if (inHazard(state, e, x - w / 2, f - h)) return null;
  return f;
};

/**
 * Him up on something: the hop that gets it nearest his level, near him, and where it goes from (its middle's x: where
 * it is, or somewhere along what it's on it can walk to). Null: nothing it can get up onto.
 */
const hopUpToward = (state: GameState, e: Enemy, pcx: number, pf: number) => {
  const feet = e.pos.y + e.height, cx = e.pos.x + e.width / 2, w = e.width, h = e.height;
  const tops = state.blocks.filter(b => standable(b) && b.y <= feet - 40 && b.y >= feet - MAX_RISE && b.y >= pf - 30
    && b.w >= w * 0.8 && b.x < Math.max(cx, pcx) + 300 && b.x + b.w > Math.min(cx, pcx) - 300)
    .sort((a, b) => Math.abs(a.y - pf) - Math.abs(b.y - pf) || Math.abs(a.x + a.w / 2 - pcx) - Math.abs(b.x + b.w / 2 - pcx))
    .slice(0, 3);
  if (!tops.length) return null;
  const around = near(state, Math.min(cx, pcx) - 400, Math.max(cx, pcx) + 400);
  for (const b of tops) {
    // (where on it: as near him as it'll fit; or just on, its end nearest where it goes from)
    const onIt = (x: number) => Math.max(b.x + w / 2 + 4, Math.min(b.x + b.w - w / 2 - 4, x));
    const lx = onIt(pcx);
    const run = runUp(feet - b.y);
    // (from: here; under it, a ledge it jumps up through; a run-up off either end of it)
    const spots = [cx, b.x - run - w / 2, b.x + b.w + run + w / 2];
    if (b.oneWay) spots.push(Math.max(b.x + w / 2, Math.min(b.x + b.w - w / 2, cx)));
    spots.sort((p, q) => Math.abs(p - cx) - Math.abs(q - cx));
    for (const sx of spots) {
      if (Math.abs(sx - cx) > 360) continue;
      const here = Math.abs(sx - cx) < 1;
      const sf = here ? feet : walkTo(state, e, around, cx, sx, feet);
      if (sf === null) continue;
      const end = onIt(sx + Math.sign(lx - sx) * (w / 2 + 16));
      for (const to of Math.abs(end - lx) > 20 ? [lx, end] : [lx]) {
        if (Math.abs(to - sx) > 300) continue;
        for (const over of [36, 75, 120]) {
          if (sf - b.y + over > MAX_RISE + 60) break;
          const a = arc(to - sx, sf - b.y, over);
          const r = fly(state, e, sx - w / 2, sf - h, a.vx, a.vy);
          if (r && r.feet <= sf - 30) return { sx: here ? cx : sx, vx: a.vx, vy: a.vy };
        }
      }
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
 * set where it wants to go (vel.x); this may hop it, back it off, walk it somewhere to hop from, stop it, or walk it
 * on off an edge.
 */
export const pathAfterAI = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, f = state.frame;
  if (e.vel.y !== 0 || e.health <= 0 || e.isBlownAway || !e.seen || e.type === 'boss' || e.enemyType === 'flyer' || e.innocent || e.harmless) return;
  if ((e.pauseTimer ?? 0) > 0 || (e.frozenTimer ?? 0) > 0) return;
  const m = memOf(e);
  const cx = e.pos.x + e.width / 2, feet = e.pos.y + e.height;
  // Wedged in a slot a moment: up out onto the lower side (its middle well onto it)
  const wedge = wedgedIn(state, e);
  if (!wedge) m.wedgedAt = 0;
  else if (!m.wedgedAt) m.wedgedAt = f;
  else if (f - m.wedgedAt > WEDGED_FOR) {
    const dir = wedge.x + wedge.w / 2 > cx ? 1 : -1, inset = Math.min(wedge.w / 2, e.width / 2 + 6);
    const a = arc((dir > 0 ? wedge.x + inset : wedge.x + wedge.w - inset) - cx, feet - wedge.y, 24);
    m.wedgedAt = 0;
    hop(e, m, f, a.vx, a.vy);
    return;
  }
  const pcx = p.pos.x + p.width / 2, pf = p.pos.y + p.height, dx = pcx - cx, pdir = (Math.sign(dx) || 1) as 1 | -1;
  const off = p.health <= 0 || p.inCutscene || holdingOff(state);
  // (walking his way: what it's after him in, and how fast it goes)
  const walking = e.vel.x !== 0 && Math.sign(e.vel.x) === pdir && Math.abs(e.vel.x) > 0.3 && Math.abs(e.vel.x) <= WALKING;
  if (walking) { m.chaseAt = f; m.chaseState = e.aiState; m.speed = Math.abs(e.vel.x); }
  // (stood still, still in the state it went after him in (pulled up at an edge, under him up on a ledge, its AI
  // stopping short of him under it): still after him, however long; no going off the boil stood at the edge of a
  // safe drop, or on its way to somewhere to hop up after him from)
  else if ((e.vel.x === 0 || m.goUntil > f) && m.chaseState === e.aiState && f - m.chaseAt < 240) m.chaseAt = f;
  const chasing = !off && m.chaseState === e.aiState && f - m.chaseAt < 240;
  if (!chasing) { m.backUntil = 0; m.dropUntil = 0; m.goUntil = 0; return; }
  const speed = Math.max(1.6, Math.min(4, m.speed));
  // A step back, for a run at it
  if (m.backUntil > f) {
    e.vel.x = safeAhead(ctx, e, m.backDir) ? m.backDir * Math.max(1.6, m.speed) : 0;
    if (e.vel.x === 0) m.backUntil = 0;
    return;
  }
  // On off the edge after him
  // (only off the one edge it looked over: down, that's that)
  if (m.dropUntil > f && Math.abs(feet - m.dropFeet) < 2) { if (pf > feet + 16) e.vel.x = m.dropDir * m.dropSpeed; return; }
  m.dropUntil = 0;
  // On its way to where it hops up after him from
  if (m.goUntil > f) {
    if (pf >= feet - 40) m.goUntil = 0;
    else {
      const d = m.goX - cx;
      if (Math.abs(d) > 0.5) {
        const dir = Math.sign(d);
        e.vel.x = safeAhead(ctx, e, dir) ? dir * Math.min(speed, Math.abs(d)) : 0;
        if (e.vel.x !== 0) { e.facing = dir as 1 | -1; return; }
      }
      // (there, or can't get on there: a look from where it is)
      e.vel.x = 0; m.goUntil = 0; m.arrivedAt = f; m.nextTry = Math.min(m.nextTry, f);
    }
  }

  // Something in the way, on its way to him
  if (walking && f >= m.giveUpUntil) {
    // (not one past him: he's this side of it)
    const face = faceAhead(state, e, pdir, Math.min(150, Math.abs(dx) - e.width / 2));
    if (face) {
      const rise = feet - face.top, run = runUp(rise);
      if (rise > MAX_RISE) { if (face.gap < 4) e.vel.x = 0; return; }
      // (still coming up to it: on it comes)
      if (face.gap > run + 24) return;
      if (f < m.nextTry) { if (face.gap < 4) e.vel.x = 0; return; }
      const h = hopUpOnto(state, e, pdir, face, speed);
      if (h) { hop(e, m, f, h.vx, h.vy); return; }
      // (no hop from here: a few goes at it and it gives up a while)
      if (++m.fails > 4) { m.fails = 0; m.giveUpUntil = f + 150 + m.jitter * 4; e.vel.x = 0; return; }
      // (too close under it to clear it: back off to a run-up's length from it; further off, on in a little and again)
      if (face.gap < run) {
        const back = Math.max(1.6, m.speed);
        m.backUntil = f + Math.ceil((run - face.gap) / back) + 2; m.backDir = -pdir; m.nextTry = m.backUntil;
        e.vel.x = safeAhead(ctx, e, -pdir) ? -pdir * back : 0;
      } else m.nextTry = f + 6;
      return;
    }
  } else if (walking && f < m.giveUpUntil && faceAhead(state, e, pdir, 4)) { e.vel.x = 0; return; }

  if (f < m.nextTry) return;
  // Him up on something near: up there after him (from here, or from somewhere it walks to first)
  if (pf < feet - 40 && p.isGrounded && Math.abs(dx) < 360) {
    const h = hopUpToward(state, e, pcx, pf);
    if (h && Math.abs(h.sx - cx) < 1) { hop(e, m, f, h.vx, h.vy); return; }
    // (just got where it was going, and no hop from there after all: a while, and a fresh look)
    if (h && f - m.arrivedAt > 2) {
      m.goX = h.sx; m.goUntil = f + 150;
      const dir = Math.sign(h.sx - cx);
      if (safeAhead(ctx, e, dir)) { e.vel.x = dir * Math.min(speed, Math.abs(h.sx - cx)); e.facing = dir as 1 | -1; }
      else m.goUntil = 0;
      return;
    }
    m.nextTry = f + 20 + m.jitter;
    return;
  }
  // Him down below, it stopped at the edge of what it's on: on off it after him
  if (pf > feet + 40 && Math.abs(dx) > 24 && Math.abs(dx) < 520 && !safeAhead(ctx, e, pdir, 10)) {
    if (dropsOk(state, e, pdir, speed, pf)) {
      m.dropUntil = f + 40; m.dropDir = pdir; m.dropSpeed = speed; m.dropFeet = feet;
      e.vel.x = pdir * speed; e.facing = pdir;
    } else m.nextTry = f + 30 + m.jitter;
  }
};
