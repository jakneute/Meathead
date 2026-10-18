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
import { box, mix, onScreen, INK, type Ctx } from '../kit';
import { signText } from '../../signLetters';
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
  // (the bark's long grooves, running along it: they roll round over the top and down the front as it turns, bunched
  // up toward the top and bottom edges like a cylinder's, gone round the back half the time)
  for (let k = 0; k < 6; k++) {
    const a = spin + (k / 6) * Math.PI * 2, front = Math.sin(a);
    if (front <= 0.05) continue;
    const gy = top + h / 2 - Math.cos(a) * (h / 2 - 2);
    const th = Math.max(1, Math.round(front * 2.5));
    for (let gx = x + 8 + ((k * 17) % 11); gx < x + len - 10; gx += 26) box(c, gx, gy - th / 2, 14 + ((k * 5) % 7), th, mix(BARK[3], BARK[2], 0.35));
  }
  // (the turning knots: come round over the top and go under)
  for (const [kx, ko] of [[0.3, 1.1], [0.66, 3.9]] as const) {
    const ka = spin + ko, kv = Math.sin(ka);
    if (kv > 0) box(c, x + len * kx, top + h / 2 - Math.cos(ka) * (h / 2 - 4) - 2, 6, 3 * kv + 1, BARK[3]);
  }
  // (the ends: cut faces, the rings, the bark round them; a crack across each, turning with it)
  for (const ex of [x + 4, x + len - 4]) {
    const cy = top + h / 2;
    c.fillStyle = INK; c.beginPath(); c.ellipse(ex, cy, 6, R + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#E8C890'; c.beginPath(); c.ellipse(ex, cy, 5, R - 1, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#B08A50'; c.lineWidth = 1;
    for (const rr of [0.35, 0.65]) { c.beginPath(); c.ellipse(ex, cy, 5 * rr, (R - 1) * rr, 0, 0, Math.PI * 2); c.stroke(); }
    c.strokeStyle = '#6A4A28'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(ex, cy); c.lineTo(ex + Math.sin(spin) * 4.5, cy - Math.cos(spin) * (R - 2)); c.stroke();
    box(c, ex - 1, cy - 1, 2, 2, '#8A6A40');
  }
};

export const drawLogs = (c: Ctx, state: GameState) => {
  for (const L of wildsOf(state).logs) {
    if (!onScreen(state, L.x - 60, L.x + L.len)) continue;
    // (tied up: a rope from its end to a stake in the near bank)
    if (L.moored) {
      const W = WATERS[L.water], sx = W.a - 18, g = groundH(sx), sy = g === null ? GY : Y(g);
      box(c, sx - 3, sy - 22, 6, 24, INK); box(c, sx - 2, sy - 21, 4, 22, BARK[1]);
      c.strokeStyle = '#D6C08A'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, sy - 16); c.quadraticCurveTo((sx + L.x + 6) / 2, L.m.b.y + 10, L.x + 8, L.m.b.y + 10); c.stroke();
    }
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
  const L0 = bx0 - LIMB_OUT, L1 = bx1 + LIMB_OUT, limbTop = bottom - 34;
  // (the crown, leaning in: the trunk off the top and the wall of boughs down onto the limb)
  c.fillStyle = INK; c.beginPath(); c.moveTo(bx0 - 120, bottom - 520); c.lineTo(bx0 - 80, bottom - 520); c.lineTo(bx1 + 20, limbTop); c.lineTo(bx0 - 30, limbTop); c.closePath(); c.fill();
  c.fillStyle = BARK[2]; c.beginPath(); c.moveTo(bx0 - 116, bottom - 520); c.lineTo(bx0 - 84, bottom - 520); c.lineTo(bx1 + 14, limbTop); c.lineTo(bx0 - 26, limbTop); c.closePath(); c.fill();
  for (let y = bottom - 500; y < limbTop - 4; y += 18) {
    const t = (y - (bottom - 520)) / (520 - 34), cx = bx0 - 100 + t * (bx1 - bx0 + 104);
    const w = 70 + t * 70;
    box(c, cx - w / 2 - 1, y - 1, w + 2, 24, INK);
    box(c, cx - w / 2, y, w, 22, t > 0.5 ? '#2F5A2A' : '#24482A');
    box(c, cx - w / 2, y, w, 4, '#4A7A3A');
    for (let k = 0; k < 5; k++) box(c, cx - w / 2 + 4 + k * (w / 5), y + 20, 3, 6, '#24482A');
  }
  // (the limb: a thick log of a bough flat across the water, its bark, the stubs of broken twigs on top)
  box(c, L0 - 2, limbTop - 2, L1 - L0 + 4, 38, INK);
  box(c, L0, limbTop, L1 - L0, 34, BARK[1]);
  box(c, L0, limbTop + 3, L1 - L0, 5, BARK[0]);
  box(c, L0, limbTop + 24, L1 - L0, 6, BARK[2]);
  for (let x = L0 + 8; x < L1 - 8; x += 22) box(c, x, limbTop + 12 + (x % 3), 10, 2, BARK[3]);
  for (const sx of [L0 + 14, L1 - 22]) { box(c, sx, limbTop - 12, 6, 12, INK); box(c, sx + 1, limbTop - 11, 4, 11, BARK[2]); }
  // (its cut end at each side: the rings)
  for (const ex of [L0, L1]) { c.fillStyle = INK; c.beginPath(); c.ellipse(ex, limbTop + 17, 8, 18, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#C8A070'; c.beginPath(); c.ellipse(ex, limbTop + 17, 6, 16, 0, 0, Math.PI * 2); c.fill(); }
  // (its underside, the gap's top: scraped pale where heads have hit it)
  box(c, L0 + 6, bottom - 4, L1 - L0 - 12, 3, '#E8C890');
  for (let k = 0; k < 4; k++) box(c, bx0 - 30 + k * 26, bottom - 3, 12, 2, '#FFF1D0');
  // (a fringe of needles under it, short: well clear of his ducked head)
  for (let x = L0 + 4; x < L1 - 4; x += 7) box(c, x, bottom - 1, 3, 3 + ((x >> 3) % 2) * 2, '#24482A');
  // (the board nailed to the limb's face: DUCK! and a down arrow; it swings a hair)
  const sx = (bx0 + bx1) / 2, sw = Math.sin(f * 0.05) * 0.6;
  box(c, sx - 31 + sw, limbTop + 3, 62, 28, INK);
  box(c, sx - 29 + sw, limbTop + 5, 58, 24, '#FACC15');
  for (let k = 0; k < 7; k++) box(c, sx - 29 + k * 9 + sw, limbTop + 5, 4, 3, '#1C1917');
  signText(c, 'DUCK!', sx - 8 + sw, limbTop + 25, { sx: 1, sy: 2, fill: '#1C1917' });
  c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(sx + 16 + sw, limbTop + 12); c.lineTo(sx + 26 + sw, limbTop + 12); c.lineTo(sx + 26 + sw, limbTop + 18); c.lineTo(sx + 30 + sw, limbTop + 18); c.lineTo(sx + 21 + sw, limbTop + 27); c.lineTo(sx + 12 + sw, limbTop + 18); c.lineTo(sx + 16 + sw, limbTop + 18); c.closePath(); c.fill();
  box(c, sx - 27 + sw, limbTop + 7, 2, 2, '#52525B'); box(c, sx + 25 + sw, limbTop + 7, 2, 2, '#52525B');
};
