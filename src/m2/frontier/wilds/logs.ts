// ROLLING LOGS: Wilderness Land's new traversal mechanic (as Jungle Land's vines, Spooky Land's ladders, Hollywood
// Land's stunt wires). A log floats on the water; stand on it and it rolls under his feet: walking propels and steers it
// (left or right: his feet pedal, the log turns, it goes), and the current adds to it; stop walking and it drifts and
// slows to the current. It bumps into things: the banks, the island, another log, the log boom (a thunk, a jolt, a
// splash), and a beaver in its way (rammed). Over a submerged rock it bucks him up. When it's jammed against something
// the way he's walking, his walking walks him along it instead (onto the bank, to its end for a jump). Simple.
//
// Also here, what goes with the logs: the fallen trees across the water to duck under (standing, they clothesline him
// off), and the falls past the long river's log boom (in the drop, he's dead: a set-piece death, its own death screen).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeMover, moveMover, riding } from '../../foreign/movers';
import { hazardHit } from '../../hazardHit';
import { GY } from '../geometry';
import { box, mix, onScreen, INK, type Ctx } from '../kit';
import { LOGS, WATERS, LOW_BRANCHES, X } from './layout';
import { surfaceY } from './water';
import { wildsOf, type LogRun } from './state';

/** The log's radius; how far it sits down in the water; his push (px a frame at full pedal); how quick it answers him
 *  and how quick it eases back to the current. */
const R = 14, SINK = 2, PUSH = 3.2, ANSWER = 0.08, EASE = 0.03;
const logTop = (L: LogRun) => surfaceY(WATERS[L.water]) - (2 * R - SINK) - L.lurch;

export const buildLogs = (state: GameState) => {
  const w = wildsOf(state);
  w.logs = LOGS.map(([key, home, len]) => {
    const wi = WATERS.findIndex(q => q.key === key), x = X(home);
    const L: LogRun = { water: wi, len, x, vx: 0, spin: 0, lurch: 0, lurchCd: 0, lean: 0, lastVx: 0, bumpCd: 0, m: makeMover(state, x, 0, len, `fr-log-${key}`) };
    moveMover(state, L.m, x, logTop(L));
    return L;
  });
};

/** Is he stood on a log? (Which one, or null.) */
export const logUnder = (state: GameState): LogRun | null => wildsOf(state).logs.find(L => riding(state, L.m)) ?? null;

const splash = (state: GameState, x: number, y: number, n = 8, big = 1) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 5 * big, y: -1.5 - Math.random() * 4 * big }, life: 22, color: i % 2 ? '#E0F2FE' : '#7DD3FC', size: 2 + Math.random() * 3 });
};

/**
 * A frame of the logs (before he moves): each one pushed by him (if he's on it and walking), by the current, bumping,
 * bucking; him carried with it. Returns the controls he walks with (his left/right go into the log, not his legs,
 * unless it's jammed that way).
 */
export const updateLogs = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, wl = wildsOf(state);
  const on = logUnder(state);
  let out = controls;
  for (const L of wl.logs) {
    const W = WATERS[L.water];
    const rider = L === on && p.health > 0 && !p.inCutscene;
    const input = rider ? (controls.right ? 1 : 0) - (controls.left ? 1 : 0) : 0;
    // (how far it can go: the banks, the boom)
    const lo = W.a + 2, hi = (W.boom ?? W.b) - 2 - L.len;
    const jammed = input !== 0 && ((input > 0 && L.x >= hi - 0.5) || (input < 0 && L.x <= lo + 0.5));
    if (input && !jammed) L.vx += (input * PUSH + W.current - L.vx) * ANSWER;
    else L.vx += (W.current - L.vx) * EASE;
    let nx = L.x + L.vx;
    // (the ends: a thunk, a jolt, a splash; it stops dead there)
    L.bumpCd = Math.max(0, L.bumpCd - 1);
    const bump = (at: number) => {
      if (Math.abs(L.vx) > 1.1 && L.bumpCd === 0) {
        playSound('thud', Math.min(1, Math.abs(L.vx) / 3), -6); splash(state, at, surfaceY(W), 10);
        if (rider) { shakeScreen(state, 4, 2); L.lean = Math.sign(L.vx) * 1; }
        L.bumpCd = 20;
      }
      L.vx = 0;
    };
    if (nx < lo) { nx = lo; bump(lo); } else if (nx > hi) { nx = hi; bump(hi + L.len); }
    // (another log in the same water: they knock together, and pass on what they had)
    for (const O of wl.logs) {
      if (O === L || O.water !== L.water) continue;
      if (nx < O.x + O.len && nx + L.len > O.x) {
        const fromLeft = L.x < O.x;
        nx = fromLeft ? O.x - L.len : O.x + O.len;
        if (Math.abs(L.vx - O.vx) > 1.1 && L.bumpCd === 0) { playSound('thud', 0.7, -4); splash(state, fromLeft ? nx + L.len : nx, surfaceY(W), 6); L.bumpCd = 20; }
        const t = L.vx; L.vx = O.vx * 0.6; O.vx = t * 0.6;
      }
    }
    // (a beaver in its way: rammed, if it's going at all)
    const front = L.vx > 0 ? nx + L.len : nx;
    if (Math.abs(L.vx) > 1.2) for (const e of state.enemies) {
      if (e.kind !== 'm2:fr_beaver' || e.health <= 0 || e.isBlownAway || !e.seen) continue;
      const ex = e.pos.x + e.width / 2;
      if (Math.abs(ex - front) < 16 && e.pos.y + e.height > logTop(L) && e.pos.y < logTop(L) + 2 * R) { hazardHit(ctx, e, 30, front - Math.sign(L.vx) * 40, 'RAMMED!'); splash(state, ex, surfaceY(W), 10); }
    }
    // (over a submerged rock: it bucks; whoever's on it goes up)
    L.lurchCd = Math.max(0, L.lurchCd - 1);
    for (const r of W.rocks ?? []) {
      // (its middle going over the rock this frame)
      const was = L.x + L.len / 2 - r, now = nx + L.len / 2 - r;
      if (L.lurchCd === 0 && Math.abs(L.vx) > 0.6 && was * now <= 0) {
        L.lurch = 12; L.lurchCd = 50;
        playSound('thud', 0.8, -8); splash(state, r, surfaceY(W), 12, 1.3);
        if (rider) { p.vel.y = -6.5; p.isGrounded = false; L.lean = (Math.random() < 0.5 ? -1 : 1); }
      }
    }
    L.lurch *= 0.82;
    L.spin += (nx - L.x) / R;
    // (his wobble: off a change of speed, a sway while it's going, easing out)
    const dv = L.vx - L.lastVx; L.lastVx = L.vx;
    L.lean = Math.max(-1, Math.min(1, L.lean * 0.9 + dv * 3 + (rider && Math.abs(L.vx) > 0.4 ? Math.sin(state.frame * 0.13) * 0.04 : 0)));
    L.x = nx;
    const bob = Math.sin(state.frame * 0.05 + L.water * 1.7) * 1.2;
    moveMover(state, L.m, L.x, logTop(L) + bob);
    // (a wake off it, going)
    if (Math.abs(L.vx) > 1 && state.frame % 6 === 0 && onScreen(state, L.x, L.x + L.len)) splash(state, L.vx > 0 ? L.x : L.x + L.len, surfaceY(W), 2, 0.5);
    if (rider) {
      p.logRoll = { spin: L.spin, lean: L.lean };
      if (input) p.facing = input > 0 ? 1 : -1;
      // (his left and right go into the log; jammed that way, they walk him along it)
      if (!jammed) out = { ...out, left: false, right: false };
    }
  }
  if (!on && p.logRoll) p.logRoll = undefined;
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// The falls (past the long river's log boom) and the fallen trees across the water

/** In the drop past the boom (or dragged under the boom swimming): over the falls. Dead. */
export const updateFalls = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  if (p.health <= 0 || p.inCutscene) return;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  for (const W of WATERS) {
    if (!W.boom || !W.fallsTo) continue;
    const over = (cx > W.boom + 4 && cx < W.fallsTo && feet > GY + 8) || (p.swimming && cx > W.boom - 4 && cx < W.fallsTo);
    if (over) {
      p.invincibilityTimer = 0;
      playSound('splash', 1, -6); playSound('screams', 0.6, 2);
      hurtPlayer(ctx, 9999, 'm2:fr_falls');
    }
  }
};

/** The fallen trees across the water: standing up as he goes under one (or jumping into it), it clotheslines him off
 *  backward (into the water, likely); ducked, he's under it. */
export const updateBranches = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, w = wildsOf(state);
  w.branchCd = Math.max(0, w.branchCd - 1);
  if (w.branchCd > 0 || p.health <= 0 || p.inCutscene) return;
  for (const [a, b] of LOW_BRANCHES) {
    const bx0 = X(a), bx1 = X(b), bottom = GY - 40;
    const overlap = p.pos.x + p.width - 8 > bx0 && p.pos.x + 8 < bx1 && p.pos.y < bottom;
    if (overlap && !(p.isDucking && p.isGrounded)) {
      w.branchCd = 40;
      const dir = p.vel.x > 0.3 || p.facing > 0 ? -1 : 1;
      hurtPlayer(ctx, 10, 'm2:fr_branch', { x: dir * 5, y: -4 });
      p.pos.x = dir < 0 ? bx0 - p.width - 2 : bx1 + 2;
      playSound('crack', 0.8, -4);
      for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: (bx0 + bx1) / 2, y: bottom - 10 }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 3 }, life: 30, color: i % 2 ? '#2F6A2A' : '#4A8A3A', size: 3 });
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude: a round-ended trunk, bark grooves that run round with it as it turns, the tree rings at its ends)

const BARK = ['#B07A48', '#8A5A32', '#6A4224', '#4A2C16'];

export const drawLog = (c: Ctx, x: number, top: number, len: number, spin: number) => {
  const h = 2 * R;
  // (the trunk: an outline, the base, a lit band along its top, a shade along its belly)
  box(c, x + 2, top - 1, len - 4, h + 2, INK);
  box(c, x + 3, top, len - 6, h, BARK[1]);
  box(c, x + 3, top + 2, len - 6, 4, BARK[0]);
  box(c, x + 3, top + h - 7, len - 6, 5, BARK[2]);
  box(c, x + 3, top + h - 2, len - 6, 2, BARK[3]);
  // (the bark's grooves: running round as it turns, squashed toward the top and bottom like a cylinder's)
  const step = 13, off = ((spin * R) % step + step) % step;
  for (let gx = x + 6 + off; gx < x + len - 8; gx += step) {
    for (let k = 0; k < 5; k++) {
      const a = (k / 4) * Math.PI, gy = top + h / 2 - Math.cos(a) * (h / 2 - 3);
      box(c, gx + Math.sin(spin + k) * 1.5, gy, 4, 2, mix(BARK[3], BARK[2], 0.4));
    }
  }
  // (the turning knot: comes round over the top and goes under)
  const ka = spin % (Math.PI * 2), kv = Math.cos(ka);
  if (kv > 0) box(c, x + len * 0.62, top + h / 2 - Math.sin(ka) * (h / 2 - 4) - 2, 6, 4 * kv + 1, BARK[3]);
  // (the ends: cut faces, the rings, the bark round them)
  for (const ex of [x + 4, x + len - 4]) {
    c.fillStyle = INK; c.beginPath(); c.ellipse(ex, top + h / 2, 6, R + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#E8C890'; c.beginPath(); c.ellipse(ex, top + h / 2, 5, R - 1, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#B08A50'; c.lineWidth = 1;
    for (const rr of [0.35, 0.65]) { c.beginPath(); c.ellipse(ex, top + h / 2, 5 * rr, (R - 1) * rr, 0, 0, Math.PI * 2); c.stroke(); }
    box(c, ex - 1, top + h / 2 - 1, 2, 2, '#8A6A40');
  }
};

export const drawLogs = (c: Ctx, state: GameState) => {
  for (const L of wildsOf(state).logs) {
    if (!onScreen(state, L.x, L.x + L.len)) continue;
    drawLog(c, L.x, L.m.b.y, L.len, L.spin);
  }
};

/** The log boom across the long river's end: a chain of short logs, orange floats, LOG BOOM on a board; the falls
 *  past it (white water pouring off the edge, the mist). And the fallen trees across the water (foliage down to the
 *  gap: impassable reads impassable). */
export const drawBoomAndBranches = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const W of WATERS) {
    if (!W.boom || !W.fallsTo || !onScreen(state, W.boom - 40, W.fallsTo + 40)) continue;
    const s = surfaceY(W);
    // (the falls: the river's edge, the water going over in white streaks, mist)
    box(c, W.boom + 2, s, W.fallsTo - W.boom - 2, 600, '#1A2A3A');
    for (let k = 0; k < 9; k++) { const fx = W.boom + 6 + k * ((W.fallsTo - W.boom - 12) / 8); for (let y = s + ((f * 6 + k * 23) % 40) - 40; y < s + 600; y += 40) box(c, fx, y, 4, 24, k % 2 ? '#E8F4FA' : '#A8D0E8'); }
    for (let i = 0; i < 6; i++) { c.globalAlpha = 0.25; c.fillStyle = '#F0F9FF'; c.beginPath(); c.arc(W.boom + 20 + i * 14, s + 60 + Math.sin(f * 0.05 + i) * 8, 16, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
    // (the boom: short logs chained, floats)
    box(c, W.boom - 8, s - 10, 12, 18, INK); box(c, W.boom - 7, s - 9, 10, 16, BARK[1]);
    box(c, W.boom - 6, s - 16, 8, 8, '#F97316'); box(c, W.boom - 6, s - 16, 8, 2, '#FDBA74');
    // (its board on a post at the cliff: LOG BOOM)
  }
  for (const [a, b] of LOW_BRANCHES) {
    const bx0 = X(a), bx1 = X(b);
    if (!onScreen(state, bx0 - 120, bx1 + 120)) continue;
    const bottom = GY - 40;
    // (the trunk, leaning in from off the top, and its foliage down to the gap: a solid mass of needles and branches)
    c.fillStyle = INK; c.beginPath(); c.moveTo(bx0 - 70, bottom - 420); c.lineTo(bx0 - 40, bottom - 420); c.lineTo(bx1 + 10, bottom - 30); c.lineTo(bx0 - 20, bottom - 30); c.closePath(); c.fill();
    c.fillStyle = BARK[2]; c.beginPath(); c.moveTo(bx0 - 66, bottom - 420); c.lineTo(bx0 - 44, bottom - 420); c.lineTo(bx1 + 4, bottom - 34); c.lineTo(bx0 - 16, bottom - 34); c.closePath(); c.fill();
    for (let y = bottom - 380; y < bottom; y += 18) {
      const t = (y - (bottom - 420)) / 420, cx = bx0 - 55 + t * (bx1 - bx0 + 60);
      const w = 50 + t * 40;
      box(c, cx - w / 2 - 1, y - 1, w + 2, 22, INK);
      box(c, cx - w / 2, y, w, 20, t > 0.5 ? '#2F5A2A' : '#24482A');
      box(c, cx - w / 2, y, w, 4, '#4A7A3A');
      for (let k = 0; k < 4; k++) box(c, cx - w / 2 + 4 + k * (w / 4), y + 18, 3, 6, '#24482A');
    }
    // (its lowest boughs: right down to the gap's top, jagged needles)
    box(c, bx0 - 30, bottom - 22, bx1 - bx0 + 60, 22, '#2F5A2A');
    for (let k = 0; k < (bx1 - bx0 + 60) / 6; k++) box(c, bx0 - 30 + k * 6, bottom - 2, 3, 4 + (k % 3) * 2, '#24482A');
  }
};
