// STUNT WIRES: Hollywood Land's new traversal mechanic (Adventure Land's vines, Spooky Land's ladders). Film-rig
// harness lines: a harness on a cable off a trolley that runs along an overhead track (a truss hung off the set's
// gantry by chains). Every section hands the stage its wires (section.ts's StuntWire, `wires()`); the stage gathers
// them each frame and this runs them (index.ts: after the section's own update) and draws them (index.ts: drawBack).
//
//   Grab:     jump into the harness (his hands near it in the air), or stood under it, press up.
//   Ride:     the rig reels him along the track toward the far end (the end it isn't parked at), the cable reeling in
//             or paying out between the two ends' heights; he swings under the trolley: its starts and stops throw the
//             swing, and left/right pumps it. He can shoot the whole way (left/right turns him).
//   Let go:   jump: flung off along the swing and the trolley's speed, with a kick up; down: dropped. At the end of
//             the track the rig brakes (the swing throws him forward) and lets him go, his feet about at `to`.
//   Knocked:  hurt on one, he's knocked off it.
//
// The rig parks at whichever end it last went to, so it takes him back the other way too (revisits); left alone a
// while with him nearer the other end, it runs back there empty. A `shuttle` rig (a camera dolly on its own loop)
// never parks: it runs back and forth by itself (grab it as it comes; it takes him the way it's going). An `off` one
// hangs slack, its light out, and can't be grabbed.
//
// Enemies don't ride them (yet); the harness doesn't hurt anybody.

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import type { Controls } from '../../m1/game/platform/input';
import { PLAYER_MOVE_SPEED } from '../../m1/constants';
import { rectsOverlap } from '../../m1/game/core/utils';
import { pickLine } from '../../m1/game/platform/speech';
import { playSound } from '../../m1/game/platform/audio';
import { setUi } from '../store';
import { meatheadSays, type StuntWire } from './section';
import { FIRST_WIRE, WIRE_WHOOP } from './blvd/lines';

type Ctx = CanvasRenderingContext2D;

/** His hands over his feet: the harness clip is this far over where his feet are. */
const HAND_DY = -16;
/** Where the camera keeps his feet while he's on one. */
export const WIRE_ROW = 470;
const REACH = 26, G = 0.55, PUMP = 0.14, MAX_TH = 1.15;
const ACCEL = 0.28, BRAKE = 0.42, SPEED = 6, RETURN = 4;

interface Run {
  /** How far the trolley is along its track (0 at `from`, 1 at `to`), and its speed (px a frame, + toward `to`). */
  u: number; v: number;
  /** The swing under it. */
  th: number; om: number;
  /** A shuttle's pause at an end (frames left). */
  wait: number;
  /** Frames since anybody rode it. */
  idle: number;
}
interface Hold {
  on: number; dir: 1 | -1;
  jumpLatch: boolean; upLatch: boolean; downLatch: boolean;
  /** The wire just let go of, and frames before it can take him again. */
  last: number; cd: number;
  hurtWas: number;
  /** Carried on by the swing he let go of. */
  fling: { vx: number; t: number } | null; lastX: number;
  rides: number;
}
interface Store { runs: Run[]; hold: Hold }
const STORES = new WeakMap<object, Store>();
const storeOf = (state: GameState): Store => {
  const k = state.stage as object;
  let s = STORES.get(k);
  if (!s) { s = { runs: [], hold: { on: -1, dir: 1, jumpLatch: false, upLatch: false, downLatch: false, last: -1, cd: 0, hurtWas: 0, fling: null, lastX: 0, rides: 0 } }; STORES.set(k, s); }
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
  const ax = w.from.x, ay = w.from.y, bx = w.to.x, by = w.to.y - feetToHand;
  const rigY = w.rigY ?? Math.min(ay, by) - 150;
  return { ax, ay, bx, by, rigY, dist: Math.max(1, Math.abs(bx - ax)) };
};
/** The trolley (on the track) and the cable's length, at u. */
const trolley = (g: Geo, u: number) => ({ x: g.ax + (g.bx - g.ax) * u, len: Math.max(30, (g.ay - g.rigY) + ((g.by - g.rigY) - (g.ay - g.rigY)) * u) });
const handAt = (g: Geo, r: Run) => { const t = trolley(g, r.u); return { x: t.x + Math.sin(r.th) * t.len, y: g.rigY + Math.cos(r.th) * t.len, tx: t.x, len: t.len }; };

const blocked = (state: GameState, hx: number, hy: number) => {
  const p = state.player, r = { x: hx - p.width / 2, y: hy - HAND_DY, w: p.width, h: p.height };
  return state.blocks.some(b => b.type !== 'pit' && !b.oneWay && rectsOverlap(r, b));
};
const place = (state: GameState, hx: number, hy: number) => { const p = state.player; p.pos.x = hx - p.width / 2; p.pos.y = hy - HAND_DY; };
const strip = (c: Controls): Controls => ({ ...c, left: false, right: false, up: false, down: false, jump: false, special: false, charge: false });

// ---------------------------------------------------------------------------------------------------------------

const grab = (state: GameState, s: Store, i: number, w: StuntWire, g: Geo, c: Controls) => {
  const p = state.player, h = s.hold, r = s.runs[i];
  h.on = i; h.fling = null;
  // (which way it takes him: a shuttle the way it's going; a parked one to the end it isn't at)
  h.dir = w.shuttle ? (r.v >= 0 ? (r.u >= 1 ? -1 : 1) : (r.u <= 0 ? 1 : -1)) : r.u < 0.5 ? 1 : -1;
  // (his momentum into the swing)
  const hand = handAt(g, r);
  r.om = Math.max(-0.07, Math.min(0.07, r.om + ((p.vel.x - r.v) * Math.cos(r.th) - p.vel.y * Math.sin(r.th)) / Math.max(90, hand.len) * 0.6));
  p.carried = true;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.isDucking = false;
  p.recoiling = false; p.lockTimer = 0; p.jumpHoldTimer = 0; p.powerLocked = false;
  h.jumpLatch = !!c.jump; h.upLatch = !!c.up; h.downLatch = !!c.down;
  h.hurtWas = p.hurtTimer ?? 0;
  h.rides++;
  playSound('whoosh', 0.5, 6);
  playSound('beep', 0.3, 10);
  if (h.rides === 1) meatheadSays(state, pickLine(FIRST_WIRE), false);
  else if (h.rides % 4 === 0 && Math.random() < 0.5) meatheadSays(state, pickLine(WIRE_WHOOP), false);
};

const letGo = (state: GameState, s: Store, c: Controls, how: 'jump' | 'drop' | 'end' | 'knocked') => {
  const p = state.player, h = s.hold, i = h.on, r = s.runs[i];
  const dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);
  p.carried = false; p.vine = undefined;
  h.on = -1; h.last = i; h.cd = how === 'end' ? 50 : 24;
  if (how === 'knocked') { h.fling = null; return; }
  const len = trolley(geoNow!, r.u).len;
  let vx = r.v + len * r.om * Math.cos(r.th);
  let vy = -len * r.om * Math.sin(r.th);
  if (how === 'jump') { vy = Math.max(-15, Math.min(vy, 0) - 8.5); vx += dir * 1.5; h.jumpLatch = true; }
  if (how === 'end') { vx = Math.max(-5, Math.min(5, vx)); vy = Math.min(vy, 0) * 0.5; }
  if (how === 'drop') { vy = Math.max(vy, 0); }
  p.vel.x = vx; p.vel.y = vy;
  h.fling = Math.abs(vx) > PLAYER_MOVE_SPEED ? { vx, t: 45 } : null;
  h.lastX = p.pos.x;
  r.idle = 0;
};
/** (the geometry of the wire being let go of: set by the update for letGo's sake) */
let geoNow: Geo | null = null;

/** Every wire's rig, and him on one (or taking hold of one, or carried on off one). Returns the controls the rest of
 *  the frame gets (none of his own movement while he's on one; the trigger still works). */
export const updateWires = (ctx: FrameContext, wires: StuntWire[], c: Controls): Controls => {
  const { state } = ctx, p = state.player, s = storeOf(state), h = s.hold;
  while (s.runs.length < wires.length) s.runs.push({ u: 0, v: 0, th: 0, om: 0, wait: 0, idle: 999 });
  if (!wires.length && h.on < 0) return c;
  const cx = p.pos.x + p.width / 2;
  if (h.cd > 0) h.cd--;
  if (h.jumpLatch && !c.jump) h.jumpLatch = false;
  if (h.upLatch && !c.up) h.upLatch = false;
  if (h.downLatch && !c.down) h.downLatch = false;
  const jumpIn = !!c.jump && !h.jumpLatch, upIn = !!c.up && !h.upLatch, downIn = !!c.down && !h.downLatch;

  // The rigs nobody's on: shuttles run their loops; parked ones swing still, and run back empty if he's gone the
  // other way and left it
  wires.forEach((w, i) => {
    if (i === h.on) return;
    const r = s.runs[i], g = geoOf(state, w);
    r.idle++;
    r.om += (-G / Math.max(90, trolley(g, r.u).len)) * Math.sin(r.th); r.om *= 0.97; r.th += r.om;
    if (w.off) { r.v = 0; return; }
    if (w.shuttle) {
      const sp = (w.speed ?? SPEED) * 0.7;
      if (r.wait > 0) { r.wait--; r.v = 0; return; }
      if (r.v === 0) r.v = r.u >= 1 ? -sp : sp;
      const v0 = r.v;
      r.u += r.v / g.dist;
      if (r.u >= 1) { r.u = 1; r.v = -sp; r.wait = 50; }
      else if (r.u <= 0) { r.u = 0; r.v = sp; r.wait = 50; }
      // (the swing thrown by its starts and stops)
      r.om -= ((r.v - v0) * 0.6) / Math.max(90, trolley(g, r.u).len);
      return;
    }
    // (parked; if he's well nearer the other end and it's been a while, back it goes, empty)
    const atA = r.u < 0.5, near = atA ? g.bx : g.ax, here = atA ? g.ax : g.bx;
    if (r.idle > 120 && Math.abs(cx - near) + 300 < Math.abs(cx - here) && Math.abs(cx - here) > 500) {
      r.u += (atA ? 1 : -1) * RETURN / g.dist; r.v = (atA ? 1 : -1) * RETURN;
      r.u = Math.max(0, Math.min(1, r.u));
    } else if (r.u > 0 && r.u < 1) {
      // (left mid-track (he let go): on to the end it was going to)
      const d = r.v >= 0 ? 1 : -1;
      r.u = Math.max(0, Math.min(1, r.u + d * RETURN / g.dist)); r.v = d * RETURN;
    } else r.v = 0;
  });

  // ---- Not on one
  if (h.on < 0) {
    if (h.fling) {
      const f = h.fling, dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);
      if (p.isGrounded || p.swimming || f.t-- <= 0 || Math.abs(p.pos.x - h.lastX) < 0.5 || (dir !== 0 && dir !== Math.sign(f.vx))) h.fling = null;
      else { if (Math.abs(p.vel.x) < Math.abs(f.vx)) p.vel.x = f.vx; f.vx *= 0.985; }
    }
    h.lastX = p.pos.x;
    if (p.health <= 0 || p.carried || p.swimming || p.airGrab || p.isDivekicking || p.isUppercutting || (p.pushbackTimer ?? 0) > 0 || p.skiing || p.inCutscene) return c;
    const hx = cx, hy = p.pos.y + HAND_DY;
    for (let i = 0; i < wires.length; i++) {
      const w = wires[i];
      if (w.off || (i === h.last && h.cd > 0)) continue;
      const g = geoOf(state, w), r = s.runs[i], hand = handAt(g, r);
      if (Math.abs(hand.x - hx) > 120) continue;
      if (!p.isGrounded) {
        if (c.down) continue;
        // (his hands near the harness: from the clip up the straps a little)
        const dx = hx - hand.x, dy = hy - hand.y;
        if (Math.abs(dx) < REACH && dy > -REACH - 14 && dy < REACH) { geoNow = g; grab(state, s, i, w, g, c); return strip(c); }
        continue;
      }
      // (stood under it: up takes hold, his hands up to it)
      if (Math.abs(hand.x - hx) < 32 && hand.y < p.pos.y + 20 && hand.y > p.pos.y - 70) {
        setUi({ upPrompt: 'GRAB THE WIRE' });
        if (upIn) {
          geoNow = g;
          if (blocked(state, hand.x, hand.y)) continue;
          grab(state, s, i, w, g, c); place(state, hand.x, hand.y);
          return strip(c);
        }
      }
    }
    return c;
  }

  // ---- On one
  const w = wires[h.on], r = s.runs[h.on];
  if (!w) { p.carried = false; p.vine = undefined; h.on = -1; return c; }
  const g = geoOf(state, w);
  geoNow = g;
  if (p.health <= 0 || state.deathTimer > 0 || (p.hurtTimer ?? 0) > h.hurtWas || w.off) { letGo(state, s, c, 'knocked'); return strip(c); }
  if (jumpIn) { letGo(state, s, c, 'jump'); return strip(c); }
  if (downIn) { letGo(state, s, c, 'drop'); h.downLatch = true; return strip(c); }
  const dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);
  if (dir) p.facing = dir as 1 | -1;
  r.idle = 0;
  // The trolley: up to speed, braking to stop at the end
  const top = w.speed ?? SPEED, d = h.dir;
  const left = (d > 0 ? 1 - r.u : r.u) * g.dist;
  const v0 = r.v;
  let sp = Math.abs(r.v) * (Math.sign(r.v) === d || r.v === 0 ? 1 : -1);
  if (sp < 0) sp = Math.min(0, sp + ACCEL * 2);
  else if ((sp * sp) / (2 * BRAKE) >= left) sp = Math.max(0.8, sp - BRAKE);
  else sp = Math.min(top, sp + ACCEL);
  r.v = sp * d;
  if (state.frame % 9 === 0) playSound('beep', 0.08, -10);
  const u0 = r.u;
  r.u = Math.max(0, Math.min(1, r.u + r.v / g.dist));
  // The swing: the trolley's pull (it lags behind, it's thrown forward when it brakes), his pump, gravity
  const L = Math.max(90, trolley(g, r.u).len);
  const acc = r.v - v0;
  r.om += (-G * Math.sin(r.th) - acc * 1.4 * Math.cos(r.th)) / L;
  if (dir) r.om += (dir * PUMP * Math.cos(r.th)) / L;
  r.om *= 0.993;
  const th0 = r.th;
  r.th += r.om;
  if (Math.abs(r.th) > MAX_TH) { r.th = Math.sign(r.th) * MAX_TH; r.om *= -0.2; }
  let hand = handAt(g, r);
  if (blocked(state, hand.x, hand.y)) {
    // (into a wall: the swing knocked back off it; if the rig itself would drag him through, it waits)
    r.th = th0; r.om = -r.om * 0.3; hand = handAt(g, r);
    if (blocked(state, hand.x, hand.y)) { r.u = u0; r.v = 0; hand = handAt(g, r); }
  }
  place(state, hand.x, hand.y);
  p.vel.x = r.v + hand.len * r.om * Math.cos(r.th); p.vel.y = -hand.len * r.om * Math.sin(r.th);
  p.isGrounded = false;
  p.vine = { mode: 'hang', th: r.th, om: r.om };
  state.cameraRestY = p.pos.y + p.height - WIRE_ROW;
  h.hurtWas = p.hurtTimer ?? 0;
  // At the end: braked, it lets him go
  if ((d > 0 && r.u >= 1) || (d < 0 && r.u <= 0)) { r.v = 0; letGo(state, s, c, 'end'); playSound('clang', 0.4, 4); }
  return strip(c);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world space, behind him: drawBack). Only what's on screen (by the rig's whole drawn span).

const TRUSS = '#3F3F46', TRUSS_LIT = '#71717A', CHAIN = '#52525B', CABLE = '#18181B';
const HARNESS = '#F59E0B', HARNESS_DK = '#B45309', STRAP = '#1F2937';

export const drawWires = (c: Ctx, state: GameState, wires: StuntWire[]) => {
  if (!wires.length) return;
  const s = storeOf(state), cam = state.camera.x, f = state.frame;
  wires.forEach((w, i) => {
    const g = geoOf(state, w), r = s.runs[i] ?? { u: 0, v: 0, th: 0, om: 0, wait: 0, idle: 0 };
    const lo = Math.min(g.ax, g.bx) - 40, hi = Math.max(g.ax, g.bx) + 40;
    if (hi < cam - 200 || lo > cam + 1000) return;
    const ridden = s.hold.on === i;
    // The track: a thin dark truss (rigging, not a ledge: no lit top), hung off chains going up out of sight
    const ty = g.rigY - 10;
    c.fillStyle = TRUSS; c.fillRect(Math.round(lo), Math.round(ty - 4), Math.round(hi - lo), 3); c.fillRect(Math.round(lo), Math.round(ty + 6), Math.round(hi - lo), 3);
    c.strokeStyle = TRUSS_LIT; c.lineWidth = 1; c.beginPath();
    for (let x = lo, k = 0; x < hi - 8; x += 12, k++) { c.moveTo(x, ty + (k % 2 ? -2 : 7)); c.lineTo(x + 12, ty + (k % 2 ? 7 : -2)); }
    c.stroke();
    c.strokeStyle = CHAIN; c.lineWidth = 2;
    for (const x of [lo + 10, hi - 10, ...(hi - lo > 700 ? [(lo + hi) / 2] : [])]) {
      c.beginPath(); c.moveTo(x, ty - 4); c.lineTo(x, ty - 700); c.stroke();
      for (let y = ty - 10; y > ty - 700; y -= 8) { c.fillStyle = CHAIN; c.fillRect(Math.round(x) - 2, Math.round(y), 4, 3); }
    }
    // (end stops: a block each end, a hazard-striped bumper)
    for (const x of [lo, hi - 8]) { c.fillStyle = '#18181B'; c.fillRect(Math.round(x), Math.round(ty - 8), 8, 20); c.fillStyle = '#FACC15'; c.fillRect(Math.round(x) + 2, Math.round(ty - 4), 4, 3); c.fillRect(Math.round(x) + 2, Math.round(ty + 4), 4, 3); }
    // The trolley: a yellow motor box on wheels, its light on when it's live (blinking as it runs), a drum of cable
    const hand = handAt(g, r);
    const tx = hand.tx;
    c.fillStyle = '#000'; c.fillRect(Math.round(tx - 15), Math.round(ty - 10), 30, 22);
    c.fillStyle = w.off ? '#78716C' : '#EAB308'; c.fillRect(Math.round(tx - 14), Math.round(ty - 9), 28, 20);
    c.fillStyle = w.off ? '#57534E' : '#A16207'; c.fillRect(Math.round(tx - 14), Math.round(ty + 6), 28, 5);
    c.fillStyle = '#27272A'; c.fillRect(Math.round(tx - 10), Math.round(ty - 14), 6, 6); c.fillRect(Math.round(tx + 4), Math.round(ty - 14), 6, 6);
    const lit = !w.off && (Math.abs(r.v) < 0.1 || f % 16 < 8);
    c.fillStyle = w.off ? '#3F3F46' : lit ? (Math.abs(r.v) > 0.1 ? '#EF4444' : '#4ADE80') : '#7F1D1D'; c.fillRect(Math.round(tx - 2), Math.round(ty - 6), 4, 4);
    // The cable and the harness (slack, off: a sagging loop, the harness hanging low)
    const hx = hand.x, hy = ridden ? state.player.pos.y + HAND_DY : hand.y;
    const hxx = ridden ? state.player.pos.x + state.player.width / 2 : hx;
    c.strokeStyle = CABLE; c.lineWidth = 2; c.beginPath(); c.moveTo(tx, ty + 11);
    if (w.off) c.quadraticCurveTo(tx + 26, hy + 40, hxx, hy + 30); else c.lineTo(hxx, hy);
    c.stroke();
    if (ridden) return;
    const by = w.off ? hy + 30 : hy;
    // (the harness: a clip, two shoulder straps down to a waist belt, leg loops; glowing a little when it's live)
    if (!w.off) {
      const pulse = 0.25 + 0.2 * Math.sin(f * 0.12 + i);
      c.fillStyle = `rgba(253, 224, 71, ${pulse})`; c.beginPath(); c.arc(hxx, by + 14, 20, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#A1A1AA'; c.fillRect(Math.round(hxx - 3), Math.round(by - 2), 6, 6);
    c.fillStyle = STRAP; c.fillRect(Math.round(hxx - 8), Math.round(by + 3), 3, 18); c.fillRect(Math.round(hxx + 5), Math.round(by + 3), 3, 18);
    c.fillStyle = w.off ? '#78716C' : HARNESS; c.fillRect(Math.round(hxx - 10), Math.round(by + 20), 20, 6);
    c.fillStyle = w.off ? '#57534E' : HARNESS_DK; c.fillRect(Math.round(hxx - 10), Math.round(by + 24), 20, 2);
    c.fillStyle = '#E5E7EB'; c.fillRect(Math.round(hxx - 2), Math.round(by + 21), 4, 4);
    c.strokeStyle = w.off ? '#57534E' : HARNESS; c.lineWidth = 3;
    c.beginPath(); c.arc(hxx - 5, by + 31, 5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(hxx + 5, by + 31, 5, 0, Math.PI * 2); c.stroke();
  });
};
