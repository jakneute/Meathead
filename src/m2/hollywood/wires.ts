// STUNT WIRES: Hollywood Land's new traversal mechanic (Adventure Land's vines, Spooky Land's ladders). Film-rig
// harness lines: a harness on a cable off a trolley that runs along an overhead track (a truss hung off the set's
// gantry by chains). Every section hands the stage its wires (section.ts's StuntWire, `wires()`); the stage gathers
// them each frame and this runs them (index.ts: after the section's own update) and draws them (index.ts: drawBack).
//
//   Grab:     jump into the harness, or walk up to it (no button: he just takes hold).
//   Ride:     the trolley runs along its track the way he's facing (left/right turns him, and it, and pumps the
//             swing); at either end of the track it stops and he hangs there. Up reels the cable in (shorter, higher),
//             down pays it out (longer, lower). He can shoot the whole way.
//   Charge:   the charge button (any charge: up/down with it are nothing special up here) thrusts him forward the way
//             he's facing: a shoulder charge into the swing (a power cell, like any charge), the trolley and the swing
//             driven hard that way; whoever he hits on the way is hurt and shoved off (the engine's own charge does it).
//   Swoop:    charge at the end of the track, facing on past it, with room above him: he's launched off the end of
//             the line, up a good way (up onto something high).
//   Let go:   ONLY by jumping (flung off along the swing and the trolley's speed, with a kick up), or knocked off by
//             getting hurt. Nothing else takes him off (no dropping, no letting go at the end).
//   Hoist:    the trolley dragging him into something solid (a planter, a crate) reels the cable in to lift him over
//             it; if it can't, it waits.
//
// Left alone, a rig runs on to the end it was going to, and then (with him stood nearer the other end a while) back
// there empty: it's never left out of his reach. A `shuttle` rig (a camera dolly on its own loop) runs back and forth
// by itself while nobody's on it (grab it as it comes). An `off` one hangs slack, its light out, and can't be grabbed.
//
// Enemies don't ride them (yet); the harness doesn't hurt anybody.

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import type { Controls } from '../../m1/game/platform/input';
import { PLAYER_MOVE_SPEED } from '../../m1/constants';
import { rectsOverlap } from '../../m1/game/core/utils';
import { pickLine } from '../../m1/game/platform/speech';
import { playSound } from '../../m1/game/platform/audio';
import { meatheadSays, type StuntWire } from './section';
import { FIRST_WIRE, WIRE_WHOOP } from './blvd/lines';

type Ctx = CanvasRenderingContext2D;

/** His hands over his feet: the harness clip is this far over where his feet are. */
const HAND_DY = -16;
/** Where the camera keeps his feet while he's on one. */
export const WIRE_ROW = 470;
const REACH = 26, G = 0.55, PUMP = 0.14, MAX_TH = 1.15;
const ACCEL = 0.28, BRAKE = 0.42, SPEED = 6, RETURN = 4;
/** Reeling in / paying out (px a frame); the shortest the cable gets; how much further than its own it pays out. */
const REEL = 3, MIN_LEN = 40, MAX_EXT = 240;
/** The thrust: the trolley's kick (px a frame), how long it can run over its top speed, the swing's shove. */
const THRUST = 5.5, BOOST = 40, PUSH = 4.2;
/** The swoop off the end: how hard up, how hard on. */
const SWOOP_UP = 19.5, SWOOP_ON = 6;
/** Walking up to one: how close his hands come to it; how far off he has to have been since letting go of it. */
const WALK_REACH = 18, AWAY = 130;

interface Run {
  /** How far the trolley is along its track (0 at `from`, 1 at `to`), and its speed (px a frame, + toward `to`). */
  u: number; v: number;
  /** The swing under it. */
  th: number; om: number;
  /** The cable reeled in (-) or paid out (+) from its own length there. */
  ext: number;
  /** A shuttle's pause at an end (frames left). */
  wait: number;
  /** Frames since anybody rode it. */
  idle: number;
}
interface Hold {
  on: number;
  jumpLatch: boolean; specialLatch: boolean;
  /** The wire just let go of, and frames before it can take him again. */
  last: number; cd: number;
  /** Since letting go of `last`, he's been well away from it (walking back up to it takes hold again). */
  away: boolean;
  hurtWas: number;
  /** Frames left of a thrust's push past the trolley's top speed. */
  boost: number;
  /** He was rebounding off somebody last frame. */
  recoiled: boolean;
  /** Carried on by the swing he let go of. */
  fling: { vx: number; t: number } | null; lastX: number;
  rides: number;
}
interface Store { runs: Run[]; hold: Hold }
const STORES = new WeakMap<object, Store>();
const storeOf = (state: GameState): Store => {
  const k = state.stage as object;
  let s = STORES.get(k);
  if (!s) { s = { runs: [], hold: { on: -1, jumpLatch: false, specialLatch: false, last: -1, cd: 0, away: true, hurtWas: 0, boost: 0, recoiled: false, fling: null, lastX: 0, rides: 0 } }; STORES.set(k, s); }
  return s;
};

/** Is he on a wire? */
export const onWire = (state: GameState) => !!state.stage && storeOf(state).hold.on >= 0;
/** How many times he's ridden one this life (the sections' lines). */
export const wireRides = (state: GameState) => (state.stage ? storeOf(state).hold.rides : 0);

// ---------------------------------------------------------------------------------------------------------------
// The geometry of one

interface Geo { ax: number; ay: number; bx: number; by: number; rigY: number; dist: number }
const geoOf = (state: GameState, w: StuntWire): Geo => {
  const p = state.player, feetToHand = p.height - HAND_DY;
  const ax = w.from.x, ay = w.from.y, bx = w.to.x, by = w.to.y - feetToHand - 2;
  const rigY = w.rigY ?? Math.min(ay, by) - 150;
  return { ax, ay, bx, by, rigY, dist: Math.max(1, Math.abs(bx - ax)) };
};
/** The cable's own length at u (between the two ends' heights). */
const baseLen = (g: Geo, u: number) => (g.ay - g.rigY) + ((g.by - g.rigY) - (g.ay - g.rigY)) * u;
/** The trolley (on the track) and the cable's length, at u, reeled in or out by ext. */
const trolley = (g: Geo, u: number, ext = 0) => ({ x: g.ax + (g.bx - g.ax) * u, len: Math.max(MIN_LEN, baseLen(g, u) + ext) });
const handAt = (g: Geo, r: Run) => { const t = trolley(g, r.u, r.ext); return { x: t.x + Math.sin(r.th) * t.len, y: g.rigY + Math.cos(r.th) * t.len, tx: t.x, len: t.len }; };
/** Clamp a run's reel to what the cable can do there. */
const clampExt = (g: Geo, r: Run) => { r.ext = Math.max(MIN_LEN - baseLen(g, r.u), Math.min(MAX_EXT, r.ext)); };

const blocked = (state: GameState, hx: number, hy: number) => {
  const p = state.player, r = { x: hx - p.width / 2, y: hy - HAND_DY, w: p.width, h: p.height };
  return state.blocks.some(b => b.type !== 'pit' && !b.oneWay && rectsOverlap(r, b));
};
const place = (state: GameState, hx: number, hy: number) => { const p = state.player; p.pos.x = hx - p.width / 2; p.pos.y = hy - HAND_DY; };
const strip = (c: Controls): Controls => ({ ...c, left: false, right: false, up: false, down: false, jump: false, special: false, charge: false });

// ---------------------------------------------------------------------------------------------------------------

const grab = (state: GameState, s: Store, i: number, g: Geo, c: Controls) => {
  const p = state.player, h = s.hold, r = s.runs[i];
  h.on = i; h.fling = null; h.boost = 0;
  // (his momentum into the swing)
  const hand = handAt(g, r);
  r.om = Math.max(-0.07, Math.min(0.07, r.om + ((p.vel.x - r.v) * Math.cos(r.th) - p.vel.y * Math.sin(r.th)) / Math.max(90, hand.len) * 0.6));
  p.carried = true;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.isDucking = false;
  p.recoiling = false; p.lockTimer = 0; p.jumpHoldTimer = 0; p.powerLocked = false;
  h.jumpLatch = !!c.jump; h.specialLatch = !!(c.special || c.charge);
  h.hurtWas = p.hurtTimer ?? 0;
  h.rides++;
  playSound('whoosh', 0.5, 6);
  playSound('beep', 0.3, 10);
  if (h.rides === 1) meatheadSays(state, pickLine(FIRST_WIRE), false);
  else if (h.rides % 4 === 0 && Math.random() < 0.5) meatheadSays(state, pickLine(WIRE_WHOOP), false);
};

const letGo = (state: GameState, s: Store, c: Controls, g: Geo, how: 'jump' | 'swoop' | 'knocked') => {
  const p = state.player, h = s.hold, i = h.on, r = s.runs[i];
  const dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);
  p.carried = false; p.vine = undefined;
  h.on = -1; h.last = i; h.cd = how === 'swoop' ? 45 : 24; h.away = false; h.boost = 0;
  r.idle = 0;
  if (how === 'knocked') { h.fling = null; return; }
  const len = trolley(g, r.u, r.ext).len;
  let vx = r.v + len * r.om * Math.cos(r.th);
  let vy = -len * r.om * Math.sin(r.th);
  if (how === 'jump') { vy = Math.max(-15, Math.min(vy, 0) - 8.5); vx += dir * 1.5; h.jumpLatch = true; }
  if (how === 'swoop') {
    // (launched up off the end of the line, on the way he's facing)
    vy = -SWOOP_UP; vx = p.facing * Math.max(SWOOP_ON, Math.abs(vx) * 0.5);
    p.isCharging = false; p.isSliding = false;
    h.specialLatch = true;
    r.v = 0;
  }
  p.vel.x = vx; p.vel.y = vy;
  h.fling = Math.abs(vx) > PLAYER_MOVE_SPEED * (how === 'swoop' ? 0.9 : 1) ? { vx, t: how === 'swoop' ? 60 : 45 } : null;
  h.lastX = p.pos.x;
};

/** Room over him (and a little on the way he's going) for a swoop up off the end: nothing solid in it. */
const roomAbove = (state: GameState, dir: number) => {
  const p = state.player, r = { x: p.pos.x + Math.min(0, dir * 50) - 6, y: p.pos.y - 230, w: p.width + 62, h: 228 };
  return !state.blocks.some(b => b.type !== 'pit' && !b.oneWay && rectsOverlap(r, b));
};

/** Every wire's rig, and him on one (or taking hold of one, or carried on off one). Returns the controls the rest of
 *  the frame gets (none of his own movement while he's on one; the trigger still works, and a charge goes through to
 *  the engine as a shoulder charge, which does the hitting). */
export const updateWires = (ctx: FrameContext, wires: StuntWire[], c: Controls): Controls => {
  const { state } = ctx, p = state.player, s = storeOf(state), h = s.hold;
  while (s.runs.length < wires.length) s.runs.push({ u: 0, v: 0, th: 0, om: 0, ext: 0, wait: 0, idle: 999 });
  if (!wires.length && h.on < 0) return c;
  const cx = p.pos.x + p.width / 2;
  if (h.cd > 0) h.cd--;
  if (h.jumpLatch && !c.jump) h.jumpLatch = false;
  if (h.specialLatch && !(c.special || c.charge)) h.specialLatch = false;
  const jumpIn = !!c.jump && !h.jumpLatch, specialIn = !!(c.special || c.charge) && !h.specialLatch;

  // The rigs nobody's on: shuttles run their loops; parked ones swing still, and run back empty if he's gone the
  // other way and left it; a cable he reeled in or paid out goes back to its own length
  wires.forEach((w, i) => {
    if (i === h.on) return;
    const r = s.runs[i], g = geoOf(state, w);
    r.idle++;
    if (r.ext !== 0) r.ext = Math.abs(r.ext) <= 2 ? 0 : r.ext - Math.sign(r.ext) * 2;
    r.om += (-G / Math.max(90, trolley(g, r.u, r.ext).len)) * Math.sin(r.th); r.om *= 0.97; r.th += r.om;
    if (w.off) { r.v = 0; return; }
    if (w.shuttle) {
      const sp = (w.speed ?? SPEED) * 0.7;
      if (r.wait > 0) { r.wait--; r.v = 0; return; }
      if (r.v === 0) r.v = r.u >= 1 ? -sp : r.u <= 0 ? sp : (r.u < 0.5 ? -sp : sp);
      const v0 = r.v;
      r.v = Math.sign(r.v) * sp;
      r.u += r.v / g.dist;
      if (r.u >= 1) { r.u = 1; r.v = -sp; r.wait = 50; }
      else if (r.u <= 0) { r.u = 0; r.v = sp; r.wait = 50; }
      // (the swing thrown by its starts and stops)
      r.om -= ((r.v - v0) * 0.6) / Math.max(90, trolley(g, r.u, r.ext).len);
      return;
    }
    // (moving with nobody on it (let go of mid-run, or running back): on to the end it's going to)
    if (r.v !== 0) {
      const d = Math.sign(r.v);
      r.u = Math.max(0, Math.min(1, r.u + (d * RETURN) / g.dist)); r.v = d * RETURN;
      if (r.u <= 0 || r.u >= 1) r.v = 0;
      return;
    }
    // (stopped short of an end (he jumped off it there as it stopped): on to the nearer end)
    if (r.u > 0 && r.u < 1 && r.idle > 30) { r.v = (r.u < 0.5 ? -1 : 1) * RETURN; return; }
    // (parked: if he's stood nearer the other end a while, back it goes, empty: it's never left out of his reach)
    const atA = r.u < 0.5, near = atA ? g.bx : g.ax, here = atA ? g.ax : g.bx;
    if (r.idle > 90 && p.isGrounded && Math.abs(cx - near) + 40 < Math.abs(cx - here)) r.v = (atA ? 1 : -1) * RETURN;
  });

  // ---- Not on one
  if (h.on < 0) {
    if (h.fling) {
      const f = h.fling, dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);
      if (p.isGrounded || p.swimming || f.t-- <= 0 || Math.abs(p.pos.x - h.lastX) < 0.5 || (dir !== 0 && dir !== Math.sign(f.vx))) h.fling = null;
      else { if (Math.abs(p.vel.x) < Math.abs(f.vx)) p.vel.x = f.vx; f.vx *= 0.985; }
    }
    h.lastX = p.pos.x;
    // (the one he let go of: walking back up to it only counts once he's been away from it)
    if (!h.away && h.last >= 0 && wires[h.last] && s.runs[h.last]) {
      const hand = handAt(geoOf(state, wires[h.last]), s.runs[h.last]);
      if (Math.abs(hand.x - cx) > AWAY || Math.abs(hand.y - (p.pos.y + HAND_DY)) > AWAY * 1.5) h.away = true;
    }
    const out: Controls = { ...c, jump: c.jump && !h.jumpLatch, special: c.special && !h.specialLatch, charge: c.charge && !h.specialLatch };
    if (p.health <= 0 || p.carried || p.swimming || p.airGrab || p.isDivekicking || p.isUppercutting || (p.pushbackTimer ?? 0) > 0 || p.skiing || p.inCutscene) return out;
    const hx = cx, hy = p.pos.y + HAND_DY;
    for (let i = 0; i < wires.length; i++) {
      const w = wires[i];
      if (w.off || (i === h.last && h.cd > 0)) continue;
      const g = geoOf(state, w), r = s.runs[i], hand = handAt(g, r);
      if (Math.abs(hand.x - hx) > 120) continue;
      if (!p.isGrounded) {
        // (his hands near the harness: from the clip up the straps a little)
        const dx = hx - hand.x, dy = hy - hand.y;
        if (Math.abs(dx) < REACH && dy > -REACH - 14 && dy < REACH) { grab(state, s, i, g, c); return strip(c); }
        continue;
      }
      // (walking up to it, stood still where it hangs at his hands: he takes hold of it, his hands up to it)
      if (i === h.last && !h.away) continue;
      if (r.v === 0 && Math.abs(p.vel.x) > 0.2 && Math.abs(hand.x - hx) < WALK_REACH && hand.y < p.pos.y + 20 && hand.y > p.pos.y - 70) {
        if (blocked(state, hand.x, hand.y)) continue;
        grab(state, s, i, g, c); place(state, hand.x, hand.y);
        return strip(c);
      }
    }
    return out;
  }

  // ---- On one
  const w = wires[h.on], r = s.runs[h.on];
  if (!w) { p.carried = false; p.vine = undefined; h.on = -1; return c; }
  const g = geoOf(state, w);
  // (knocked off: hurt by anything; dead; the rig cut)
  if (p.health <= 0 || state.deathTimer > 0 || (p.hurtTimer ?? 0) > h.hurtWas || w.off) { letGo(state, s, c, g, 'knocked'); return strip(c); }
  p.dropVine = false; p.powerLocked = false;
  // (his charge bounced off somebody it didn't finish: the trolley's knocked back off them a way, the swing with it)
  if (p.recoiling && !h.recoiled) { r.v = -r.v * 0.45; r.om = -r.om * 0.5; h.boost = 0; }
  h.recoiled = !!p.recoiling;
  if (p.recoiling && p.lockTimer <= 0) p.recoiling = false;
  if (jumpIn) { letGo(state, s, c, g, 'jump'); return strip(c); }
  const dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);
  if (dir && !p.isCharging) p.facing = dir as 1 | -1;
  r.idle = 0;
  const d = p.facing;
  // How far to the end of the track the way he's facing
  const left = (d > 0 ? 1 - r.u : r.u) * g.dist;
  // The charge: off the end of the line (the swoop), or a thrust forward. Either's a power cell.
  let charge = false;
  if (specialIn && !p.isCharging && state.playerStunTimer <= 0 && p.lockTimer <= 0 && (ctx.cheats.infinitePower || p.power >= 1)) {
    h.specialLatch = true;
    if (left < 6 && roomAbove(state, d)) {
      if (!ctx.cheats.infinitePower) p.power -= 1;
      letGo(state, s, c, g, 'swoop');
      playSound('whoosh', 1, 4); playSound('clang', 0.4, 6);
      if (Math.random() < 0.35) meatheadSays(state, pickLine(WIRE_WHOOP), false);
      return strip(c);
    }
    // (the engine starts the shoulder charge itself, and takes the cell: the charge through to it)
    charge = true;
    h.boost = BOOST;
    if (left > 4) r.v += d * THRUST;
    r.om += (d * PUSH) / Math.max(90, trolley(g, r.u, r.ext).len);
    playSound('whoosh', 0.6, 8);
  }
  // (a charge under way: held through to the engine while the button is)
  if (p.isCharging) charge = !!(c.special || c.charge);
  if (h.boost > 0) h.boost--;

  // Reeling: up in, down out
  const ext0 = r.ext;
  if (c.up && !c.down) r.ext -= REEL;
  else if (c.down && !c.up) r.ext += REEL;
  clampExt(g, r);
  if (state.frame % 9 === 0 && r.ext !== ext0) playSound('beep', 0.05, -14);

  // The trolley: up to speed the way he's facing, braking to stop at the end of the track (and there it waits)
  const top = w.speed ?? SPEED, cap = top + (h.boost > 0 ? THRUST * (h.boost / BOOST) : 0);
  const v0 = r.v;
  let sp = r.v * d;
  if (sp < 0) sp = Math.min(0, sp + ACCEL * 2);
  else if ((sp * sp) / (2 * BRAKE) >= left) sp = Math.max(Math.min(0.8, left), sp - BRAKE);
  else if (sp > cap) sp = Math.max(cap, sp - 0.2);
  else sp = Math.min(cap, sp + ACCEL);
  if (left <= 0.5 && sp > 0) sp = 0;
  r.v = sp * d;
  if (Math.abs(r.v) > 0.1 && state.frame % 9 === 0) playSound('beep', 0.08, -10);
  const u0 = r.u, L0 = Math.max(90, trolley(g, u0, ext0).len);
  r.u = Math.max(0, Math.min(1, r.u + r.v / g.dist));
  if ((r.u <= 0 && r.v < 0) || (r.u >= 1 && r.v > 0)) r.v = 0;
  // The swing: the trolley's pull (it lags behind, it's thrown forward when it brakes; not the thrust's own kick),
  // his pump, gravity; shorter, it swings faster
  const L = Math.max(90, trolley(g, r.u, r.ext).len);
  if (L !== L0) r.om *= Math.min(1.25, Math.max(0.8, L0 / L));
  const acc = h.boost > BOOST - 2 ? 0 : r.v - v0;
  r.om += (-G * Math.sin(r.th) - acc * 1.4 * Math.cos(r.th)) / L;
  if (dir && !p.isCharging) r.om += (dir * PUMP * Math.cos(r.th)) / L;
  r.om *= 0.993;
  const th0 = r.th;
  r.th += r.om;
  if (Math.abs(r.th) > MAX_TH) { r.th = Math.sign(r.th) * MAX_TH; r.om *= -0.2; }
  let hand = handAt(g, r);
  if (blocked(state, hand.x, hand.y)) {
    // (paid out into something: no further)
    if (r.ext > ext0) { r.ext = ext0; hand = handAt(g, r); }
  }
  if (blocked(state, hand.x, hand.y)) {
    // (the swing into a wall: knocked back off it)
    r.th = th0; r.om = -r.om * 0.3; hand = handAt(g, r);
    if (blocked(state, hand.x, hand.y)) {
      // (the rig dragging him into something: it waits, and hoists him (reels him in) to get him up over it)
      r.u = u0; r.v = 0; hand = handAt(g, r);
      const was = r.ext;
      r.ext -= 6; clampExt(g, r);
      if (blocked(state, handAt(g, r).x, handAt(g, r).y)) r.ext = was;
      hand = handAt(g, r);
    }
  }
  place(state, hand.x, hand.y);
  if (!p.isCharging) { p.vel.x = r.v + hand.len * r.om * Math.cos(r.th); p.vel.y = -hand.len * r.om * Math.sin(r.th); }
  p.isGrounded = false;
  p.vine = { mode: p.isCharging ? 'push' : 'hang', th: r.th, om: r.om };
  state.cameraRestY = p.pos.y + p.height - WIRE_ROW;
  h.hurtWas = p.hurtTimer ?? 0;
  const o = strip(c);
  return charge ? { ...o, special: true, charge: !!c.charge } : o;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world space, behind him: drawBack). Only what's on screen (by the rig's whole drawn span). Peak SNES: the
// truss in steel steps, inked (rigging, not a ledge: no lit top), the trolley a stepped yellow box, the harness's
// webbing and buckles.

const INK = '#1C1014';
const STEELR = ['#1A1C22', '#2C3038', '#444A54', '#626A76', '#8890A0', '#B4BCC8'];
const YEL = ['#5A3A04', '#8A5E08', '#C08A10', '#EAB516', '#FAD43A', '#FFF08A'];
const OFF = ['#2A2622', '#3E3832', '#57534E', '#78716C', '#A8A29E', '#C8C2BC'];
const STRAP = '#1F2937';
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

export const drawWires = (c: Ctx, state: GameState, wires: StuntWire[]) => {
  if (!wires.length) return;
  const s = storeOf(state), cam = state.camera.x, f = state.frame;
  wires.forEach((w, i) => {
    const g = geoOf(state, w), r = s.runs[i] ?? { u: 0, v: 0, th: 0, om: 0, ext: 0, wait: 0, idle: 0 };
    const lo = Math.min(g.ax, g.bx) - 40, hi = Math.max(g.ax, g.bx) + 40;
    if (hi < cam - 200 || lo > cam + 1000) return;
    const ridden = s.hold.on === i, S = STEELR, Y = w.off ? OFF : YEL;
    // The track: a box truss (two chords, diagonals between), hung off chains going up out of sight
    const ty = g.rigY - 10, a = Math.max(lo, cam - 60), b = Math.min(hi, cam + 860);
    for (const cy of [ty - 5, ty + 5]) { px(c, a, cy - 1, b - a, 5, INK); px(c, a, cy, b - a, 3, S[3]); px(c, a, cy, b - a, 1, S[5]); px(c, a, cy + 2, b - a, 1, S[1]); }
    c.lineWidth = 1;
    c.strokeStyle = S[2]; c.beginPath();
    for (let x = Math.floor((a - lo) / 12) * 12 + lo, k = Math.floor((a - lo) / 12); x < b - 8; x += 12, k++) { c.moveTo(x, ty + (k % 2 ? -2 : 6)); c.lineTo(x + 12, ty + (k % 2 ? 6 : -2)); }
    c.stroke();
    for (let x = Math.ceil((a - lo) / 48) * 48 + lo; x < b; x += 48) { px(c, x - 1, ty - 4, 3, 12, INK); px(c, x, ty - 4, 1, 12, S[4]); }
    for (const x of [lo + 10, hi - 10, ...(hi - lo > 700 ? [(lo + hi) / 2] : [])]) {
      if (x < cam - 40 || x > cam + 840) continue;
      for (let y = ty - 10; y > ty - 700; y -= 6) { px(c, x - 2, y, 4, 4, INK); px(c, x - 1, y + 1, 2, 2, (y / 6) % 2 ? S[4] : S[2]); }
    }
    // (end stops: a block each end, hazard-striped bumpers)
    for (const x of [lo, hi - 10]) { px(c, x - 1, ty - 11, 12, 24, INK); px(c, x, ty - 10, 10, 22, '#2A2A30'); for (let k = 0; k < 4; k++) px(c, x + 1, ty - 8 + k * 5, 8, 2, k % 2 ? '#1A1418' : '#FACC15'); }
    // The trolley: a yellow motor box on its wheels, stepped, its light (green parked, red blinking running), a drum
    const hand = handAt(g, r);
    const tx = hand.tx;
    px(c, tx - 16, ty - 11, 32, 24, INK);
    px(c, tx - 15, ty - 10, 30, 22, Y[3]); px(c, tx - 15, ty - 10, 30, 2, Y[5]); px(c, tx - 15, ty - 10, 3, 22, Y[4]); px(c, tx + 11, ty - 10, 4, 22, Y[2]);
    px(c, tx - 15, ty + 6, 30, 6, Y[1]); px(c, tx - 15, ty + 6, 30, 1, Y[2]);
    for (let k = 0; k < 3; k++) px(c, tx - 11 + k * 4, ty - 6, 2, 8, Y[2]);
    for (const wx of [tx - 8, tx + 6]) { px(c, wx - 4, ty - 16, 8, 8, INK); px(c, wx - 3, ty - 15, 6, 6, S[2]); px(c, wx - 2, ty - 14, 2, 2, S[5]); }
    const live = !w.off && (Math.abs(r.v) < 0.1 || f % 16 < 8);
    px(c, tx + 1, ty - 7, 6, 6, INK); px(c, tx + 2, ty - 6, 4, 4, w.off ? '#3F3F46' : live ? (Math.abs(r.v) > 0.1 ? '#EF4444' : '#4ADE80') : '#7F1D1D'); if (live && !w.off) px(c, tx + 2, ty - 6, 1, 1, '#FFFFFF');
    // (the drum: turning while the cable's reeled in or out)
    if (!w.off && ridden) { px(c, tx - 6, ty - 1, 8, 6, INK); px(c, tx - 5, ty, 6, 4, '#3A3A40'); px(c, tx - 4 + ((f >> 2) % 2) * 3, ty + 1, 2, 2, '#C8CCD4'); }
    // The cable and the harness (slack, off: a sagging loop, the harness hanging low)
    const hx = hand.x, hy = ridden ? state.player.pos.y + HAND_DY : hand.y;
    const hxx = ridden ? state.player.pos.x + state.player.width / 2 : hx;
    const cable = () => { c.beginPath(); c.moveTo(tx, ty + 11); if (w.off) c.quadraticCurveTo(tx + 26, hy + 40, hxx, hy + 30); else c.lineTo(hxx, hy); c.stroke(); };
    c.strokeStyle = INK; c.lineWidth = 3; cable();
    c.strokeStyle = '#6A6E78'; c.lineWidth = 1; cable();
    if (ridden) return;
    const by = w.off ? hy + 30 : hy;
    // (the harness: a carabiner, two shoulder straps down to a waist belt and its buckle, leg loops; glowing a little,
    // stepped, when it's live)
    if (!w.off) {
      const pulse = 0.18 + 0.14 * Math.sin(f * 0.12 + i);
      for (let k = 3; k >= 1; k--) { c.fillStyle = `rgba(253, 224, 71, ${(pulse * (4 - k) / 3).toFixed(3)})`; c.beginPath(); c.arc(hxx, by + 14, 8 + k * 5, 0, Math.PI * 2); c.fill(); }
    }
    px(c, hxx - 4, by - 3, 8, 8, INK); px(c, hxx - 3, by - 2, 6, 6, '#A1A1AA'); px(c, hxx - 3, by - 2, 2, 2, '#E5E7EB'); px(c, hxx - 1, by, 2, 2, INK);
    for (const sx of [hxx - 9, hxx + 4]) { px(c, sx - 1, by + 3, 7, 19, INK); px(c, sx, by + 3, 5, 18, STRAP); px(c, sx, by + 3, 1, 18, '#4B5563'); }
    px(c, hxx - 11, by + 19, 22, 9, INK); px(c, hxx - 10, by + 20, 20, 7, Y[3]); px(c, hxx - 10, by + 20, 20, 2, Y[5]); px(c, hxx - 10, by + 25, 20, 2, Y[1]);
    px(c, hxx - 3, by + 20, 6, 6, INK); px(c, hxx - 2, by + 21, 4, 4, '#E5E7EB'); px(c, hxx - 1, by + 22, 2, 2, '#9CA3AF');
    for (const lx of [hxx - 5, hxx + 5]) {
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.arc(lx, by + 32, 5, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = Y[3]; c.lineWidth = 3; c.beginPath(); c.arc(lx, by + 32, 5, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = Y[5]; c.lineWidth = 1; c.beginPath(); c.arc(lx, by + 32, 5, Math.PI, Math.PI * 1.6); c.stroke();
    }
  });
};
