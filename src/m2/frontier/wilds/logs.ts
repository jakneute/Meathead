// ROLLING LOGS: Wilderness Land's new traversal mechanic (as Jungle Land's vines, Spooky Land's ladders, Hollywood
// Land's stunt wires). A log floats on the water; stand on it and it rolls under his feet: walking propels and steers it
// (left or right: his feet pedal, the log turns, it goes), and the current adds to it; stop walking and it drifts and
// slows to the current. It bumps into things: the banks, the island, another log, the log boom (a thunk, a jolt, a
// splash), and a beaver in its way (rammed). Over a submerged rock it bucks him up. When it's jammed against something
// the way he's walking, his walking walks him along it instead (onto the bank, to its end for a jump). Simple.
// A log on moving water waits tied up at the near (left) bank, where he arrives, till he's on it (the playtest: the
// current had it off at the far bank before he got there); come at it from the far side and it drifts down to him.
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
import { onScreen } from '../kit';
import { setUi } from '../../store';
import { type Ctx, box, checker, still, near, INK, NEEDLE } from './paint';
import { LOGS, WATERS, LOW_BRANCHES, BRANCH_GAP, X, Y, groundH } from './layout';
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
    const L: LogRun = { water: wi, len, x, vx: 0, spin: 0, lurch: 0, lurchCd: 0, lean: 0, lastVx: 0, bumpCd: 0, moored: WATERS[wi].current > 0, m: makeMover(state, x, 0, len, `fr-log-${key}`) };
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
    // (tied up at the near bank till he's on it, or he's over on the far side of it (it drifts down to him there))
    if (L.moored && (rider || p.pos.x + p.width / 2 > W.b)) {
      L.moored = false;
      if (rider) { playSound('crack', 0.5, 8); splash(state, L.x, surfaceY(W), 4, 0.6); }
    }
    const current = L.moored ? 0 : W.current;
    if (input && !jammed) L.vx += (input * PUSH + current - L.vx) * ANSWER;
    else L.vx += (current - L.vx) * EASE;
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
    // (a beaver or a trout at the surface in its way: rammed, if it's going at all)
    const front = L.vx > 0 ? nx + L.len : nx;
    if (Math.abs(L.vx) > 1.2) for (const e of state.enemies) {
      if ((e.kind !== 'm2:fr_beaver' && e.kind !== 'm2:fr_trout') || e.health <= 0 || e.isBlownAway || !e.seen) continue;
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
      // (the tip while he's on it, up on his feet: down and forward crouch-walks it (the user's))
      if (!p.isDucking) setUi({ logTip: true });
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

/** How far the low limb reaches out either side of a fallen tree's [from, to] (drawn and hit alike). */
const LIMB_OUT = 46;

/** The fallen trees across the water: standing up as he goes under one (or jumping into it), it clotheslines him off
 *  backward (into the water, likely); ducked, he's under it. */
export const updateBranches = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, w = wildsOf(state);
  w.branchCd = Math.max(0, w.branchCd - 1);
  if (w.branchCd > 0 || p.health <= 0 || p.inCutscene) return;
  for (const [a, b] of LOW_BRANCHES) {
    // (the limb drawn across it is wider than the trunk's line: it's the limb that hits)
    const bx0 = X(a) - LIMB_OUT, bx1 = X(b) + LIMB_OUT, bottom = GY - BRANCH_GAP;
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
// Drawing (peak SNES): a round trunk in steps, the bark's plates and grooves rolling round with it as it turns, the
// cut ends' rings

/** Bark (darkest first) and the cut wood (heart to sap). */
const BARK = ['#1C0E06', '#2E180C', '#462614', '#5E361E', '#7A4A2A', '#966038', '#B27C4E'];
const WOOD = ['#6A4220', '#8E6232', '#B08448', '#CCA262', '#E2C084', '#F2DCA8'];

export const drawLog = (c: Ctx, x: number, top: number, len: number, spin: number) => {
  const h = 2 * R;
  // (the trunk: inked; banded as a cylinder is lit from above: the highlight along its top, its body, the shade, its
  // dark belly; dithered between)
  box(c, x + 3, top - 1, len - 6, h + 2, INK);
  const bands: [number, number, string][] = [[0, 2, BARK[4]], [2, 3, BARK[5]], [5, 5, BARK[4]], [10, 8, BARK[3]], [18, 5, BARK[2]], [23, 5, BARK[1]]];
  for (const [y0, bh, col] of bands) box(c, x + 4, top + y0, len - 8, bh, col);
  checker(c, x + 4, top + 9, len - 8, 2, BARK[4], 0);
  checker(c, x + 4, top + 17, len - 8, 2, BARK[3], 1);
  box(c, x + 4, top + 3, len - 8, 1, BARK[6]);
  // (the bark's plates and grooves, running along it: they roll round over the top and down the front as it turns,
  // bunched toward the top and bottom edges like a cylinder's, gone round the back half the time)
  for (let k = 0; k < 7; k++) {
    const a = spin + (k / 7) * Math.PI * 2, front = Math.sin(a);
    if (front <= 0.05) continue;
    const gy = top + h / 2 - Math.cos(a) * (h / 2 - 2);
    const th = Math.max(1, Math.round(front * 2.5));
    const lit = Math.cos(a) > 0.3;
    for (let gx = x + 8 + ((k * 17) % 11); gx < x + len - 10; gx += 24) {
      const gw = 12 + ((k * 5 + gx) % 9);
      box(c, gx, gy - th / 2, gw, th, BARK[0]);
      if (lit) box(c, gx + 1, gy - th / 2 - 1, gw - 2, 1, BARK[6]);
    }
  }
  // (the turning knots: come round over the top and go under; a patch of moss on one)
  for (const [kx, ko, moss] of [[0.3, 1.1, false], [0.66, 3.9, true]] as const) {
    const ka = spin + ko, kv = Math.sin(ka);
    if (kv <= 0) continue;
    const kxp = x + len * kx, kyp = top + h / 2 - Math.cos(ka) * (h / 2 - 4) - 2;
    box(c, kxp - 1, kyp - 1, 8, 3 * kv + 3, INK); box(c, kxp, kyp, 6, 3 * kv + 1, BARK[1]); box(c, kxp + 1, kyp, 3, 1, BARK[5]);
    if (moss) { box(c, kxp + 10, kyp - 1, 10, 3 * kv + 2, '#3E6A28'); box(c, kxp + 10, kyp - 1, 7, 1, '#6E9A3A'); }
  }
  // (the ends: cut faces in rings, heart dark to sap pale, the bark round them; a check across each, turning with it)
  for (const ex of [x + 4, x + len - 4]) {
    const cy = top + h / 2;
    c.fillStyle = INK; c.beginPath(); c.ellipse(ex, cy, 7, R + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = BARK[2]; c.beginPath(); c.ellipse(ex, cy, 6, R, 0, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 4; i++) { const k = 1 - i * 0.24; c.fillStyle = WOOD[5 - i]; c.beginPath(); c.ellipse(ex, cy, 5 * k, (R - 2) * k, 0, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = WOOD[1]; c.beginPath(); c.ellipse(ex, cy, 1.4, 2, 0, 0, Math.PI * 2); c.fill();
    box(c, ex - 3, cy - R + 3, 2, 3, WOOD[5]);
    c.strokeStyle = WOOD[0]; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ex, cy); c.lineTo(ex + Math.sin(spin) * 4.5, cy - Math.cos(spin) * (R - 2)); c.stroke();
  }
};

export const drawLogs = (c: Ctx, state: GameState) => {
  for (const L of wildsOf(state).logs) {
    if (!onScreen(state, L.x - 60, L.x + L.len)) continue;
    // (tied up: a rope from its end to a stake in the near bank)
    if (L.moored) {
      // (a split stake driven in the bank, a rope off it in a twist, its knot round the log's end)
      const W = WATERS[L.water], sx = W.a - 18, g = groundH(sx), sy = g === null ? GY : Y(g);
      box(c, sx - 4, sy - 24, 8, 26, INK); box(c, sx - 3, sy - 23, 6, 24, BARK[4]); box(c, sx - 3, sy - 23, 2, 24, BARK[6]); box(c, sx + 1, sy - 23, 2, 24, BARK[2]);
      c.fillStyle = INK; c.beginPath(); c.moveTo(sx - 4, sy - 24); c.lineTo(sx, sy - 30); c.lineTo(sx + 4, sy - 24); c.closePath(); c.fill();
      const rope = () => { c.beginPath(); c.moveTo(sx, sy - 16); c.quadraticCurveTo((sx + L.x + 6) / 2, L.m.b.y + 12, L.x + 8, L.m.b.y + 10); };
      c.strokeStyle = INK; c.lineWidth = 4; rope(); c.stroke();
      c.strokeStyle = '#B8A06A'; c.lineWidth = 2; rope(); c.stroke();
      c.setLineDash([2, 3]); c.strokeStyle = '#EAD8A0'; c.lineWidth = 1; rope(); c.stroke(); c.setLineDash([]);
      box(c, sx - 4, sy - 18, 8, 4, '#8A7448'); box(c, sx - 4, sy - 18, 8, 1, '#D6C08A');
    }
    drawLog(c, L.x, L.m.b.y, L.len, L.spin);
    // (where it sits in the water: a ring of ripples along its waterline)
    const s = surfaceY(WATERS[L.water]);
    if (L.m.b.y + 2 * R > s - 2) for (let rx = L.x + 2; rx < L.x + L.len - 2; rx += 6) box(c, rx, s - 1 + ((rx + state.frame) >> 3) % 2, 4, 1, 'rgba(220, 240, 248, 0.7)');
  }
};

/** The log boom across the long river's end: a chain of short logs, orange floats, LOG BOOM on a board; the falls
 *  past it (white water pouring off the edge, the mist). And the fallen trees across the water (foliage down to the
 *  gap: impassable reads impassable). */
export const drawBoomAndBranches = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const W of WATERS) {
    if (!W.boom || !W.fallsTo || !onScreen(state, W.boom - 40, W.fallsTo + 40)) continue;
    const s = surfaceY(W), fw = W.fallsTo - W.boom - 2, fx0 = W.boom + 2;
    // (the drop behind the falls: dark, wet rock going down)
    box(c, fx0, s, fw, 600, '#0E1A24');
    for (let y = s + 20; y < s + 600; y += 34) box(c, fx0, y, fw, 2, '#1A2A36');
    // (the lip: the river going glassy and green as it curls over the edge)
    const FL = ['#1E5A6A', '#2E7A88', '#4A9AA6', '#7EC2C8', '#C8ECEE', '#FFFFFF'];
    for (let i = 0; i < fw; i += 4) { const curl = Math.round(Math.sin(f * 0.2 + i * 0.3) * 1.5); box(c, fx0 + i, s - 3 + curl, 4, 4, FL[2]); box(c, fx0 + i, s - 3 + curl, 4, 1, FL[4]); box(c, fx0 + i, s + 1 + curl, 4, 6, FL[1]); }
    // (the curtain going over: bands down it, streaks cycling down, white breaking out of it lower down)
    c.save(); c.beginPath(); c.rect(fx0, s + 4, fw, 600); c.clip();
    for (let k = 0; k < fw; k += 6) box(c, fx0 + k, s + 4, 6, 600, FL[(k / 6) % 2 ? 1 : 2]);
    for (let k = 0; k < 16; k++) {
      const sx = fx0 + 2 + (k * (fw - 6)) / 15, sp = 5 + (k % 3);
      for (let y = s + ((f * sp + k * 37) % 60) - 60; y < s + 600; y += 60) { box(c, sx, y, 2, 28, k % 2 ? FL[4] : FL[3]); box(c, sx, y + 28, 2, 6, FL[5]); }
    }
    for (let y = s + 60; y < s + 600; y += 22) for (let k = 0; k < fw; k += 8) if (((k + y + f * 3) >> 3) % 3 === 0) box(c, fx0 + k, y + ((f * 4) % 22), 6, 4, 'rgba(255, 255, 255, 0.7)');
    c.restore();
    // (mist rising out of it in stepped puffs)
    for (let i = 0; i < 8; i++) { const my = s + 120 - ((f * 0.6 + i * 30) % 160), mx = fx0 + fw / 2 + Math.sin(f * 0.03 + i * 1.7) * (fw * 0.6); c.globalAlpha = 0.22 * Math.min(1, (my - s + 40) / 80); c.fillStyle = '#F0F9FF'; c.beginPath(); c.arc(mx, my, 14 + (i % 3) * 6, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
    // (the boom: short logs end to end across the river's last stretch, chained, orange floats on them)
    const bx = W.boom - 10;
    box(c, bx - 1, s - 11, 16, 20, INK); box(c, bx, s - 10, 14, 18, BARK[3]); box(c, bx, s - 10, 14, 3, BARK[5]); box(c, bx, s + 4, 14, 4, BARK[1]);
    c.fillStyle = INK; c.beginPath(); c.ellipse(bx + 7, s - 14, 7, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#E2660E'; c.beginPath(); c.ellipse(bx + 7, s - 14, 6, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FB923C'; c.beginPath(); c.ellipse(bx + 5, s - 16, 3, 2.5, 0, 0, Math.PI * 2); c.fill();
    box(c, bx + 4, s - 18, 2, 1, '#FFE0C0'); box(c, bx + 2, s - 14, 10, 1, '#F8F4EC');
    for (let k = 0; k < 3; k++) box(c, bx - 6 - k * 4, s - 4 + (k % 2), 3, 2, '#71717A');
  }
  for (const [a, b] of LOW_BRANCHES) {
    const bx0 = X(a), bx1 = X(b);
    if (!onScreen(state, bx0 - 160, bx1 + 160)) continue;
    drawLowTree(c, bx0, bx1, GY - BRANCH_GAP, f);
  }
};

/**
 * A fallen tree across the water, to duck under (impassable reads impassable: the playtest's "more obvious"). Its
 * crown leans in from off the top of the screen, a solid wall of needles and boughs all the way down onto one great
 * low limb, thick as a man, lying flat across the water at ducking height: its underside is the gap's top, bark
 * scraped pale there, nothing at all under it but the open water. A park board nailed to the limb's face (DUCK! and a
 * down arrow, painted yellow and black), a fringe of needles under it that stops short of his ducked head.
 */
const drawLowTree = (c: Ctx, bx0: number, bx1: number, bottom: number, f: number) => {
  const L0 = bx0 - LIMB_OUT, L1 = bx1 + LIMB_OUT, limbTop = bottom - 34, w = L1 - L0;
  // (painted once for the hour, about the limb's left end; the needles' sway is live over it)
  still(c, `lowtree-${w}`, L0, limbTop, -140, -500, w + 240, 544, g => {
    const N = near(NEEDLE), B = near(BARK), Wd = near(WOOD);
    const lx0 = 0, lx1 = w, b0 = bx0 - L0, b1 = bx1 - L0;
    // (the trunk leaning in from off the top: bark in stepped ridges, lit down its left)
    const trunk = () => { g.moveTo(b0 - 76, -486); g.lineTo(b0 - 36, -486); g.lineTo(b1 + 22, 2); g.lineTo(b0 + 14, 2); g.closePath(); };
    g.fillStyle = INK; g.beginPath(); trunk(); g.fill();
    g.save(); g.beginPath(); trunk(); g.clip();
    for (let k = 0; k < 8; k++) { g.fillStyle = [B[4], B[5], B[4], B[3], B[3], B[2], B[2], B[1]][k]; g.beginPath(); g.moveTo(b0 - 76 + k * 5, -486); g.lineTo(b0 - 71 + k * 5, -486); g.lineTo(b0 + 19 + k * 5.5, 2); g.lineTo(b0 + 14 + k * 5.5, 2); g.closePath(); g.fill(); }
    g.restore();
    // (the wall of boughs down onto the limb: tiers of drooping needles, stepped (shade under, body, the lit upper
    // left, needle tufts along the edges), wider and lower as they come down)
    for (let y = -470; y < -26; y += 20) {
      const t = (y + 486) / 460, cx = b0 - 56 + t * (b1 - b0 + 60), hw = 46 + t * 52;
      const edge = (i: number) => y + 22 + Math.sin(i * 1.7 + y) * 2 + (i % 2) * 3;
      const shape = () => { g.moveTo(cx - hw * 0.4, y - 2); g.lineTo(cx + hw * 0.5, y); g.lineTo(cx + hw, y + 18); for (let i = 8; i >= 0; i--) g.lineTo(cx - hw + (i / 8) * hw * 2, edge(i)); g.closePath(); };
      g.save(); g.translate(0, 2); g.fillStyle = INK; g.beginPath(); shape(); g.fill(); g.restore();
      g.fillStyle = N[2]; g.beginPath(); shape(); g.fill();
      g.save(); g.beginPath(); shape(); g.clip();
      box(g, cx - hw, y + 12, hw * 2, 14, N[1]);
      box(g, cx - hw, y - 2, hw * 1.1, 8, N[4]); box(g, cx - hw, y - 2, hw * 0.6, 3, N[5]);
      checker(g, cx - hw, y + 6, hw * 1.4, 2, N[3], (y >> 1) % 2);
      for (let i = 0; i < hw / 4; i++) box(g, cx - hw + ((i * 37 + y) % (hw * 2)), y + 4 + ((i * 13) % 12), 2, 3, i % 3 ? N[3] : N[5]);
      g.restore();
      for (let i = 0; i <= 8; i += 2) box(g, cx - hw + (i / 8) * hw * 2 - 1, edge(i) - 1, 2, 3, N[1]);
    }
    // (the limb: thick as a man, flat across the water: inked, banded round, bark plates, broken twig stubs)
    box(g, lx0 - 2, -2, w + 4, 38, INK);
    const bands: [number, number, string][] = [[0, 3, B[5]], [3, 6, B[4]], [9, 10, B[3]], [19, 8, B[2]], [27, 7, B[1]]];
    for (const [y0, bh, col] of bands) box(g, lx0, y0, w, bh, col);
    box(g, lx0, 1, w, 1, B[6]); checker(g, lx0, 8, w, 2, B[4], 0); checker(g, lx0, 18, w, 2, B[3], 1);
    for (let x = 8; x < w - 8; x += 20) { box(g, x, 11 + (x % 3), 12, 2, B[0]); box(g, x + 1, 10 + (x % 3), 10, 1, B[5]); box(g, x + 6, 22 + (x % 4), 9, 2, B[0]); }
    for (const sx of [14, w - 22, w * 0.5]) { box(g, sx - 1, -13, 8, 14, INK); box(g, sx, -12, 6, 12, B[3]); box(g, sx, -12, 2, 12, B[5]); box(g, sx, -13, 6, 2, Wd[4]); }
    // (its cut end at each side: rings, heart to sap)
    for (const ex of [lx0, lx1]) {
      g.fillStyle = INK; g.beginPath(); g.ellipse(ex, 17, 9, 19, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = B[2]; g.beginPath(); g.ellipse(ex, 17, 8, 18, 0, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 4; i++) { const k = 1 - i * 0.24; g.fillStyle = Wd[5 - i]; g.beginPath(); g.ellipse(ex, 17, 6.5 * k, 16 * k, 0, 0, Math.PI * 2); g.fill(); }
    }
    // (its underside, the gap's top: scraped pale where heads have hit it; nothing under it but the open water)
    box(g, 6, 30, w - 12, 3, Wd[4]);
    for (let k = 0; k < 4; k++) box(g, b0 - 30 - L0 * 0 + k * 26, 31, 12, 2, Wd[5]);
  });
  // (a short fringe of needles under it, swaying: well clear of his ducked head)
  for (let x = L0 + 4; x < L1 - 4; x += 7) box(c, x + Math.round(Math.sin(f * 0.05 + x) * 0.8), bottom - 1, 3, 3 + ((x >> 3) % 2) * 2, '#1E4222');
  // (no DUCK! board on it (the user's: the player can tell))
};
