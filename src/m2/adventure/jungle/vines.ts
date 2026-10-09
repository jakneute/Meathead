// Vines: to swing on and to climb (the jungle's own move; the engine just leaves him be while he's on one:
// player.carried).
//
//   Two kinds. A swinging vine hangs free off a branch, a pendulum: jump into it and he takes hold (whatever he was
//   doing), his momentum swinging it; left/right pumps the swing; up/down climbs (shorter swings faster); jump lets go,
//   flung off along the swing with a kick upward. A climbing vine's a liana run up a tree or a cliff, held fast at the
//   bottom: it doesn't swing; up/down climbs it, and climbing up past the top of one that runs up onto a ledge puts him
//   up on the ledge (stood at the top, down takes hold of it again, to go back down).
//
//   Charge + up: the aggressive ascent, up it in a rush, hitting whatever's in the way like an uppercut; charge +
//   down: the aggressive descent, down it in a rush, like a dive kick (a power cell each). He stays on it: each stops at
//   the end of the vine (holding the way it went doesn't carry him off the end of it, over a pit, till it's let go).
//   Charge on a climbing vine: the ascent too. Charge (or charge + left/right) on a swinging vine: the push, a shoulder
//   charge into the swing (a power cell, like any charge), the swing driven hard that way, anything in his way hit like
//   a charge hits it. Charging never takes him off a vine: jumping off does, or getting hit.
//
//   He can shoot the whole time he's on one (left/right turns him). Hurt on one, he's knocked off it.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Rect } from '../../../m1/types';
import { PLAYER_MOVE_SPEED } from '../../../m1/constants';
import { rectsOverlap } from '../../../m1/game/core/utils';
import { meatheadSays } from '../section';
import { playSound } from '../../../m1/game/platform/audio';
import { jungleOf, type Hold, type VineRun } from './state';
import { FIRST_VINE } from './lines';

type Ctx = CanvasRenderingContext2D;

export interface VineDef {
  /** Where it hangs from (world). */
  x: number; y: number;
  len: number;
  kind: 'swing' | 'climb';
  /** A climbing vine that runs up onto a ledge: where he's stood when he climbs off the top of it. */
  top?: { x: number; y: number };
}

/** (gravity on a swing, the pump, the push, the cap on how high it goes) */
const G = 0.55, PUMP = 0.16, PUSH = 4.2, MAX_TH = 1.3;
const CLIMB = 2.6, ZIP_UP = 10, ZIP_DOWN = 12;
/** How long a swing it is, for its pace: right up by the branch it's no shorter than this (a pendulum that short
 *  would whip back and forth; and climbing up it, what it kept compounded into a wobble). */
const swingLen = (s: number) => Math.max(s, 120);
/** Not right up against the branch: his hands this far down it at the highest. */
const MIN_S = 18;
/** How close his hands have to come to a vine to take hold of it. */
const REACH = 22;
/** Stood at the top of one: how long down has to be held to take hold of it again. */
const DOWN_HOLD = 14;
/** Where his hand is on him: up over his head (he hangs one-handed, the gun in the other). */
const HAND_DY = -16;
/** Where the camera keeps his feet, on a vine. */
export const VINE_ROW = 470;

const atS = (d: VineDef, th: number, s: number) => ({ x: d.x + Math.sin(th) * s, y: d.y + Math.cos(th) * s });
const lowest = (d: VineDef) => (d.kind === 'climb' ? d.len - (64 - HAND_DY) : d.len);

const boxAt = (state: GameState, hx: number, hy: number): Rect => {
  const p = state.player;
  return { x: hx - p.width / 2, y: hy - HAND_DY, w: p.width, h: p.height };
};
const blocked = (state: GameState, r: Rect) =>
  state.blocks.some(b => b.type !== 'pit' && !b.oneWay && rectsOverlap(r, b));

const place = (state: GameState, hx: number, hy: number) => {
  const p = state.player;
  p.pos.x = hx - p.width / 2; p.pos.y = hy - HAND_DY;
};

/** Takes hold of vine i, `s` down it (his momentum into its swing). */
const grab = (state: GameState, defs: VineDef[], h: Hold, i: number, s: number, c: Controls) => {
  const p = state.player, d = defs[i], v = jungleOf(state).vines[i];
  h.on = i; h.s = Math.max(MIN_S, Math.min(lowest(d), s)); h.zip = 0; h.fling = null;
  if (d.kind === 'swing') v.om = Math.max(-0.08, Math.min(0.08, v.om + ((p.vel.x * Math.cos(v.th) - p.vel.y * Math.sin(v.th)) / h.s) * 0.8));
  p.carried = true;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.isDucking = false;
  p.recoiling = false; p.lockTimer = 0; p.jumpHoldTimer = 0; p.powerLocked = false;
  h.jumpLatch = !!c.jump; h.specialLatch = !!(c.special || c.charge);
  h.hurtWas = p.hurtTimer ?? 0;
  const j = jungleOf(state);
  if (!j.said.vine) { j.said.vine = true; meatheadSays(state, FIRST_VINE[Math.floor(Math.random() * FIRST_VINE.length)], false); }
};

/** Lets go: `jump` a jump off it (a kick upward, and the way he's holding), otherwise just dropping off it. */
const letGo = (state: GameState, defs: VineDef[], h: Hold, c: Controls, jump: boolean, knocked = false) => {
  const p = state.player, i = h.on, d = defs[i], v = jungleOf(state).vines[i];
  const dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);
  p.carried = false; p.vine = undefined;
  if (h.aggro) { p.isUppercutting = false; p.isDivekicking = false; }
  h.aggro = false; h.held = 0;
  h.on = -1; h.last = i; h.cd = 40; h.anyCd = 8; h.zip = 0;
  if (knocked) { h.fling = null; return; }
  let vx = d.kind === 'swing' ? h.s * v.om * Math.cos(v.th) : 0;
  let vy = d.kind === 'swing' ? -h.s * v.om * Math.sin(v.th) : 0;
  if (jump) {
    vy = Math.max(-16, Math.min(vy, 0) - 8.5);
    vx += dir * (d.kind === 'climb' ? PLAYER_MOVE_SPEED : 1.5);
    h.jumpLatch = true;
  }
  p.vel.x = vx; p.vel.y = vy;
  h.fling = Math.abs(vx) > PLAYER_MOVE_SPEED ? { vx, t: 45 } : null;
  h.lastX = p.pos.x;
  if (p.isCharging) { p.isCharging = false; p.isSliding = false; }
  p.powerLocked = false;
};

/** Climbed right to the top of one: whatever he could stand on up by his hands (a branch, a ledge, the top of a
 *  cliff), and where on it he'd be stood, nudged in onto it off the edge. */
const ledgeNear = (state: GameState, hand: { x: number; y: number }): { x: number; y: number } | undefined => {
  const p = state.player, w = p.width;
  let best: { x: number; y: number } | undefined, bestD = Infinity;
  for (const b of state.blocks) {
    if (b.type === 'pit' || b.w < w + 8) continue;
    // (its top up round his hands: from a bit over them to his chest)
    if (b.y < hand.y - 70 || b.y > hand.y + 30) continue;
    if (hand.x < b.x - 48 || hand.x > b.x + b.w + 48) continue;
    const x = Math.max(b.x + w / 2 + 6, Math.min(b.x + b.w - w / 2 - 6, hand.x));
    const r = { x: x - w / 2, y: b.y - p.height - 1, w, h: p.height };
    if (blocked(state, r)) continue;
    const dd = Math.abs(x - hand.x) + Math.abs(b.y - hand.y);
    if (dd < bestD) { bestD = dd; best = { x, y: b.y }; }
  }
  return best;
};

/** Every vine's swing, and him on his (or taking hold of one, or carried on by the swing he let go of). */
export const updateVines = (ctx: FrameContext, defs: VineDef[], c: Controls): Controls => {
  const { state } = ctx, p = state.player, j = jungleOf(state), h = j.hold;
  while (j.vines.length < defs.length) j.vines.push({ th: 0, om: 0 });
  const held = h.on;
  // The free ones swing themselves still (only the ones near enough to matter)
  const cx = p.pos.x + p.width / 2;
  defs.forEach((d, i) => {
    if (i === held || d.kind !== 'swing' || Math.abs(d.x - cx) > 1400) return;
    const v = j.vines[i];
    v.om += (-G / d.len) * Math.sin(v.th); v.om *= 0.985; v.th += v.om;
  });
  if (h.cd > 0) h.cd--;
  if (h.anyCd > 0) h.anyCd--;
  // (the buttons he took hold or let go with: held off till they're let go of)
  if (h.jumpLatch && !c.jump) h.jumpLatch = false;
  if (h.specialLatch && !(c.special || c.charge)) h.specialLatch = false;
  const jumpIn = !!c.jump && !h.jumpLatch, specialIn = !!(c.special || c.charge) && !h.specialLatch;
  const dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);

  // ---- Dead, or knocked off it
  if (h.on >= 0 && (p.health <= 0 || state.deathTimer > 0)) { letGo(state, defs, h, c, false, true); return c; }
  if (h.on >= 0 && (p.hurtTimer ?? 0) > h.hurtWas) { letGo(state, defs, h, c, false, true); return { ...c, jump: false, special: false, charge: false }; }

  // ---- Not on one: carried on by the swing he let go of, or taking hold of one
  if (h.on < 0) {
    if (h.fling) {
      const f = h.fling;
      if (p.isGrounded || p.swimming || f.t-- <= 0 || Math.abs(p.pos.x - h.lastX) < 0.5 || (dir !== 0 && dir !== Math.sign(f.vx))) h.fling = null;
      else { if (Math.abs(p.vel.x) < Math.abs(f.vx)) p.vel.x = f.vx; f.vx *= 0.985; }
    }
    h.lastX = p.pos.x;
    const out: Controls = { ...c, jump: c.jump && !h.jumpLatch, special: c.special && !h.specialLatch, charge: c.charge && !h.specialLatch };
    if (p.health <= 0 || p.swimming || p.isDivekicking || p.isUppercutting || (p.pushbackTimer ?? 0) > 0 || p.skiing) return out;
    const hx = cx, hy = p.pos.y + HAND_DY;
    // (down, stood still: held a moment, it's going back down a vine; and not with the down he climbed off one with)
    if (!c.down) h.downLatch = false;
    h.downT = c.down && !h.downLatch && !dir && p.isGrounded ? h.downT + 1 : 0;
    for (let i = 0; i < defs.length; i++) {
      const d = defs[i];
      if (Math.abs(d.x - hx) > d.len + 60 || (i === h.last && h.cd > 0) || h.anyCd > 0) continue;
      const v = j.vines[i], end = atS(d, v.th, d.len);
      // In the air: hands near enough the vine, he's got it
      if (!p.isGrounded) {
        // (dropping on purpose: not caught by one going by)
        if (c.down) continue;
        const ex = end.x - d.x, ey = end.y - d.y, len2 = ex * ex + ey * ey;
        const t = Math.max(0, Math.min(1, ((hx - d.x) * ex + (hy - d.y) * ey) / len2));
        const px = d.x + ex * t, py = d.y + ey * t;
        if (t * d.len >= MIN_S - 4 && Math.hypot(hx - px, hy - py) < REACH) { grab(state, defs, h, i, t * d.len, c); return hands(c); }
        continue;
      }
      // Stood under one (up: up it), or stood at the top of one that comes up onto his ledge (down: down it)
      if (c.up && Math.abs(end.x - hx) < 26 && end.y > hy - 40 && hy > d.y + MIN_S) { grab(state, defs, h, i, Math.min(hy - d.y, lowest(d)), c); return hands(c); }
      if (h.downT >= DOWN_HOLD && d.top && Math.abs(d.top.x - hx) < 28 && Math.abs(p.pos.y + p.height - d.top.y) < 4) {
        h.on = i; h.s = MIN_S;
        const a = atS(d, 0, MIN_S);
        if (blocked(state, boxAt(state, a.x, a.y))) { h.on = -1; continue; }
        grab(state, defs, h, i, MIN_S, c); place(state, a.x, a.y); return hands(c);
      }
    }
    return out;
  }

  // ---- On one
  const d = defs[h.on], v = j.vines[h.on];
  p.powerLocked = false;
  if (dir) p.facing = dir as 1 | -1;
  // (pushing: the shoulder charge, the engine's own; held while the button is)
  const pushing = p.isCharging;
  let special = false;
  if (specialIn && !h.specialLatch && !pushing && h.zip === 0) {
    h.specialLatch = true;
    const can = ctx.cheats.infinitePower || p.power >= 1;
    if (((c.up !== c.down) || (d.kind === 'climb' && !dir)) && can) {
      // Up (or, on a climbing vine, charge alone): the aggressive ascent, up it in a rush, hitting whatever's in the way
      // like an uppercut; down: the aggressive descent, like a dive kick. A power cell. He stays on it: it stops at
      // the top, or the bottom (no going off the end of it over a pit)
      h.zip = c.down ? 1 : -1; h.aggro = true;
      if (!ctx.cheats.infinitePower) p.power -= 1;
      p.moveId = (p.moveId || 0) + 1; p.uppercutHitIds = []; p.diveKickHitIds = [];
      playSound('whoosh', 1, h.zip < 0 ? 3 : -4);
    } else if (d.kind === 'swing' && can && !c.up && !c.down) {
      // The push (a swinging vine only): the way he's holding, or the way he's swinging (or facing, at the top of it)
      const pd = dir || (Math.abs(v.om) > 0.004 ? Math.sign(v.om) : p.facing);
      p.facing = pd as 1 | -1;
      v.om += (pd * PUSH) / swingLen(h.s);
      special = true;
    }
  }
  if (pushing) special = !!(c.special || c.charge);

  // Jump: off it
  if (jumpIn) { letGo(state, defs, h, c, true); return { ...c, left: false, right: false, up: false, down: false, jump: false, special: false, charge: false }; }

  // Climbing (or zipping)
  const s0 = h.s;
  // (the way a zip went, still held after it: that end of the vine's the end of it, till it's let go)
  if (h.held === -1 && !c.up) h.held = 0;
  if (h.held === 1 && !c.down) h.held = 0;
  if (h.zip === -1) h.s -= ZIP_UP;
  else if (h.zip === 1) h.s += ZIP_DOWN;
  else if (c.up && !c.down) h.s -= CLIMB;
  else if (c.down && !c.up) {
    // (down at the bottom: off it; not straight off the end of a zip down, though)
    if (h.s >= lowest(d) - 0.5) { if (h.held === 1) { h.s = lowest(d); } else { letGo(state, defs, h, c, false); h.specialLatch = !!(c.special || c.charge); return hands(c); } }
    h.s += CLIMB;
  }
  if (h.s <= MIN_S) {
    h.s = MIN_S;
    // (up off the top, onto the ledge it goes up to)
    const top = ((h.zip === -1 && !h.aggro) || (c.up && h.zip === 0 && h.held !== -1)) ? d.top ?? ledgeNear(state, atS(d, v.th, h.s)) : undefined;
    if (top) {
      letGo(state, defs, h, c, false, true);
      p.pos.x = top.x - p.width / 2; p.pos.y = top.y - p.height - 1; p.vel.x = 0; p.vel.y = 0;
      h.jumpLatch = !!c.jump; h.specialLatch = !!(c.special || c.charge); h.downLatch = !!c.down; h.downT = 0;
      return hands(c);
    }
    if (h.zip === -1) { if (h.aggro) h.held = -1; h.zip = 0; }
  }
  if (h.s >= lowest(d)) { h.s = lowest(d); if (h.zip === 1) { if (h.aggro) h.held = 1; h.zip = 0; } }
  // (an aggressive zip: hitting like an uppercut going up, a dive kick coming down, till it's over)
  if (h.zip === 0) h.aggro = false;
  p.isUppercutting = h.aggro && h.zip === -1; p.isDivekicking = h.aggro && h.zip === 1;
  if (p.isUppercutting) p.uppercutTimer = 2;
  // (shorter, it swings faster: what it had kept, more or less)
  if (d.kind === 'swing' && h.s !== s0) v.om *= Math.min(1.25, Math.max(0.8, swingLen(s0) / swingLen(h.s)));

  // The swing
  const th0 = v.th;
  if (d.kind === 'swing') {
    const L = swingLen(h.s);
    let a = (-G / L) * Math.sin(v.th);
    if (dir && !pushing) a += (dir * PUMP * Math.cos(v.th)) / L;
    v.om += a; v.om *= dir ? 0.999 : 0.996;
    v.th += v.om;
    if (Math.abs(v.th) > MAX_TH) { v.th = Math.sign(v.th) * MAX_TH; v.om = 0; }
  } else { v.th = 0; v.om = 0; }
  let hand = atS(d, v.th, h.s);
  // (into a wall, or the ground: back off it)
  if (blocked(state, boxAt(state, hand.x, hand.y))) {
    v.th = th0; v.om = -v.om * 0.3; h.s = s0; h.zip = 0;
    hand = atS(d, v.th, h.s);
  }
  place(state, hand.x, hand.y);
  // (for his pose: which way he's going)
  p.vel.x = h.s * v.om * Math.cos(v.th); p.vel.y = d.kind === 'swing' ? -h.s * v.om * Math.sin(v.th) : (h.zip || (c.up ? -1 : c.down ? 1 : 0)) * 2;
  p.isGrounded = false;
  // (his pose on it)
  p.vine = {
    mode: pushing ? 'push' : h.zip === -1 ? 'zipUp' : h.zip === 1 ? 'zipDown' : h.s !== s0 ? 'climb' : 'hang',
    th: d.kind === 'swing' ? v.th : 0, om: d.kind === 'swing' ? v.om : 0,
  };
  state.cameraRestY = p.pos.y + p.height - VINE_ROW;
  h.hurtWas = p.hurtTimer ?? 0;
  return { ...c, left: false, right: false, up: false, down: false, jump: false, special, charge: special && !!c.charge };
};

/** Nobody touching anything but the trigger. */
const hands = (c: Controls): Controls => ({ ...c, left: false, right: false, up: false, down: false, jump: false, special: false, charge: false });

export const onVine = (state: GameState) => jungleOf(state).hold.on >= 0;

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude first pass)

/**
 * Where a vine runs this frame, as points from where it hangs to its tip. A climbing vine's held fast, straight up the
 * tree. A swinging one bends with the swing: what's below his hand (or all of it, with nobody on it) trails behind the
 * way it's going, flexing as it goes; above his hand, it's pulled taut but bows a little. Its tip curls up into a
 * tendril (the way it's trailing, or its own way, hanging still).
 */
const vinePoints = (d: VineDef, v: VineRun, held: number | null, f: number, seed: number): { x: number; y: number }[] => {
  const pts: { x: number; y: number }[] = [];
  if (d.kind === 'climb') { const e = atS(d, 0, d.len); for (let k = 0; k <= 8; k++) pts.push({ x: d.x + (e.x - d.x) * k / 8 + Math.sin(k * 1.7 + seed) * 1.5, y: d.y + (e.y - d.y) * k / 8 }); return pts; }
  const STEP = 6, om = v.om;
  let x = d.x, y = d.y, u = 0;
  pts.push({ x, y });
  // (above his hand: taut from the branch to it, bowed out behind the swing)
  if (held !== null) {
    const hand = atS(d, v.th, held);
    const nx = Math.cos(v.th), ny = -Math.sin(v.th), bow = Math.max(-14, Math.min(14, -om * 160));
    const n = Math.max(2, Math.round(held / STEP));
    for (let k = 1; k <= n; k++) { const t = k / n, b = 4 * t * (1 - t) * bow; pts.push({ x: d.x + (hand.x - d.x) * t + nx * b, y: d.y + (hand.y - d.y) * t + ny * b }); }
    x = hand.x; y = hand.y; u = held;
  }
  // (the rest of it: hanging off there, trailing the swing, flexing; the tip curling)
  const rest = d.len - u, CURL = Math.min(46, rest * 0.4);
  const side = Math.abs(om) > 0.006 ? -Math.sign(om) : (seed % 2 ? 1 : -1);
  let a = v.th;
  for (let w = STEP; w <= rest + 0.01; w += STEP) {
    const k = w / Math.max(1, rest);
    // (lagging further behind the swing the further down; a lazy flex either way along it)
    a = v.th - om * 26 * k * (0.6 + k) + Math.sin(f * 0.05 + seed + w * 0.035) * 0.07 * k;
    // (the tip: curled round, tighter toward the end)
    const into = w - (rest - CURL);
    if (into > 0) a += side * (into / CURL) ** 1.5 * 6;
    x += Math.sin(a) * STEP; y += Math.cos(a) * STEP;
    pts.push({ x, y });
  }
  return pts;
};

/** A vine: a twisted green rope with leaves, from the branch it hangs off (a stub of branch, dark: not a ledge). */
export const drawVines = (c: Ctx, state: GameState, defs: VineDef[]) => {
  const j = jungleOf(state), vx0 = state.camera.x - 300, vx1 = state.camera.x + 1100;
  defs.forEach((d, i) => {
    if (d.x < vx0 || d.x > vx1) return;
    const v = j.vines[i] ?? { th: 0, om: 0 };
    const pts = vinePoints(d, v, j.hold.on === i ? j.hold.s : null, state.frame, i * 7 + 3);
    // the branch stub it hangs off
    if (!d.top) { c.fillStyle = '#2E1F12'; c.fillRect(d.x - 22, d.y - 7, 44, 9); c.fillStyle = '#1F3A16'; c.beginPath(); c.ellipse(d.x, d.y - 10, 30, 10, 0, 0, Math.PI * 2); c.fill(); }
    // the rope (thinning toward the tip), its light side
    const line = (col: string, w0: number, w1: number, dx: number) => {
      c.strokeStyle = col; c.lineCap = 'round';
      for (let k = 1; k < pts.length; k++) {
        c.lineWidth = w0 + (w1 - w0) * (k / pts.length);
        c.beginPath(); c.moveTo(pts[k - 1].x + dx, pts[k - 1].y); c.lineTo(pts[k].x + dx, pts[k].y); c.stroke();
      }
    };
    line('#3F6212', 6, d.kind === 'swing' ? 2.5 : 6, 0);
    line('#84CC16', 2, d.kind === 'swing' ? 1 : 2, -1);
    // leaves along it, turned with it
    c.fillStyle = '#4D7C0F';
    for (let k = 5; k < pts.length - (d.kind === 'swing' ? 5 : 0); k += 8) {
      const p0 = pts[k - 1], p1 = pts[k], ang = Math.atan2(p1.y - p0.y, p1.x - p0.x), side = (k / 8) % 2 ? 1 : -1;
      c.beginPath(); c.ellipse(p1.x + Math.cos(ang + side * Math.PI / 2) * 6, p1.y + Math.sin(ang + side * Math.PI / 2) * 6, 6, 3, ang + side * 0.6, 0, Math.PI * 2); c.fill();
    }
    // (a climbing vine's rooted: a tuft at the foot of it)
    const end = pts[pts.length - 1];
    if (d.kind === 'climb') { c.fillStyle = '#365314'; c.beginPath(); c.ellipse(end.x, end.y, 12, 5, 0, 0, Math.PI * 2); c.fill(); }
  });
};
