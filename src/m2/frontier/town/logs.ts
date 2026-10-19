// The mill pond's ROLLING LOGS (the land's mechanic, the wilds' rules: wilds/logs.ts): stand on one and walking rolls it
// across the water; stop and it drifts to a stop (the pond's still); it thunks against the banks and the other logs.
// Escalated here:
//
//   THE BIRLER   a lumberjack on his own log (pond B): he rolls it at Meathead's and RAMS it (a jolt that bucks him
//                up off it, and a knock his way): get off it, outrun it, or knock him off his (he drowns: drown.ts).
//   THE JACK LADDER  at pond B's right end, the chain that hauls logs up out of the water onto the mill deck: a log
//                that gets to it goes up, with whoever's stood on it, and is tipped onto the deck (a new one floats
//                back at its home a while later).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { pickLine } from '../../../m1/game/platform/speech';
import { makeMover, moveMover, riding } from '../../foreign/movers';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import type { EnemyKind } from '../../../m1/types';
import { meatheadSays, byPants } from '../section';
import { drawLog } from '../wilds/logs';
import { box, INK, type Ctx } from '../kit';
import { hr, TIMBER, STEEL } from './paint';
import { onScreen } from './view';
import { townOf, type PondLog } from './state';
import { WATERS, LOGS, LADDER, X } from './layout';
import { LADDER_UP, BIRLER_SEEN } from './lines';

const R = 14, SINK = 2, PUSH = 3.2, ANSWER = 0.08, EASE = 0.03, BACK = 260;
const logTop = (L: PondLog) => WATERS[L.water].surface - (2 * R - SINK);
/** Up the jack ladder: its left end and top at k (0 at the water, 1 tipped onto the deck): up the chain (kept short of
 *  the mill's works), then over onto the deck. */
const UP = 0.8;
/** The chain's run (its foot at the water, its head at the deck's edge). */
const chain = () => {
  const W = WATERS.find(w => w.key === 'pondB')!;
  return { xa: W.b - 20, ya: W.surface + 30, xb: LADDER.foot + 185, yb: LADDER.topY };
};
/** The beam's half-thickness and the chain's dogs' height on it: the log rides on the dogs' tips (DOG up off the
 *  chain's line, square to it), its middle R further. */
const BEAM = 8, DOG = 13;
/** The chain's slope (radians: negative, up to the right). */
export const LADDER_ANGLE = (() => { const ch = chain(); return Math.atan2(ch.yb - ch.ya, ch.xb - ch.xa); })();
const smooth = (k: number) => { const q = Math.max(0, Math.min(1, k)); return q * q * (3 - 2 * q); };
/** Up the jack ladder at k: the log's middle and its tilt, continuous all the way (the playtest's: janky going up).
 *  Measured along the chain and square off it: it starts exactly where it floated (no snap), is lifted onto the dogs
 *  and tilted to the slope together, eased; climbs at a steady pace lying on the dogs' tips; then is laid flat and set
 *  down on the deck, eased in and out (no kink where the chain lets go). */
const ladderAt = (L: PondLog, k: number) => {
  const ch = chain(), ux = Math.cos(LADDER_ANGLE), uy = Math.sin(LADDER_ANGLE), nx = uy, ny = -ux, off = DOG + R;
  const len = Math.hypot(ch.xb - ch.xa, ch.yb - ch.ya);
  // (where it floated, along the chain and off it; where the chain lets go of it: its front end at the chain's head)
  const W = WATERS[L.water], sx = W.b - 2 - L.len / 2, sy = logTop(L) + R;
  const d0 = (sx - ch.xa) * ux + (sy - ch.ya) * uy, o0 = (sx - ch.xa) * nx + (sy - ch.ya) * ny, d1 = len - L.len / 2;
  const on = (d: number, o: number) => ({ x: ch.xa + ux * d + nx * o, y: ch.ya + uy * d + ny * o });
  if (k < UP) {
    const t = k / UP, lift = smooth(t / 0.14);
    // (eased off the water (no jerk from still), then steady up the chain)
    const go = t < 0.1 ? (t * t) / 0.2 : t - 0.05, d = d0 + (d1 - d0) * (go / 0.95);
    const p = on(d, o0 + (off - o0) * lift);
    return { cx: p.x, cy: p.y, tilt: LADDER_ANGLE * lift };
  }
  const t = (k - UP) / (1 - UP), e = smooth(t), top = on(d1, off), deckX = LADDER.top + L.len / 2, deckY = LADDER.topY - R;
  // (still moving up the slope as it leaves the chain: carried on along it a little, then onto the deck)
  const fx = top.x + ux * 30 * (1 - e) * t, fy = top.y + uy * 30 * (1 - e) * t;
  return { cx: fx + (deckX - fx) * e, cy: fy + (deckY - fy) * e, tilt: LADDER_ANGLE * (1 - e) };
};
/** The log he's riding up the ladder (latched: placed on it every frame; the rolling's off for the whole haul), and
 *  where he stands along it (from its middle, along its length). */
let ride: { L: PondLog; s: number } | null = null;
/** The top of a log lying at `at`, s along it from its middle. */
const topAt = (at: { cx: number; cy: number; tilt: number }, s: number) => {
  const c = Math.cos(at.tilt), sn = Math.sin(at.tilt);
  return { x: at.cx + s * c + R * sn, y: at.cy + s * sn - R * c };
};

export const buildLogs = (state: GameState) => {
  const tw = townOf(state);
  tw.logs = LOGS.map(([key, home, len, birls]) => {
    const wi = WATERS.findIndex(q => q.key === key), x = X(home);
    const L: PondLog = { water: wi, home: x, len, x, vx: 0, spin: 0, lean: 0, lastVx: 0, bumpCd: 0, m: makeMover(state, x, 0, len, `fr-town-log-${key}-${home}`), ladder: 0, gone: 0, birler: null };
    moveMover(state, L.m, x, logTop(L));
    if (birls) {
      const e = makeKindEnemy('m2:fr_birler' as EnemyKind, x + len / 2, logTop(L));
      e.homeX = e.pos.x; e.variant = 3; e.facing = -1;
      state.enemies.push(e);
      L.birler = e;
    }
    return L;
  });
};

const splash = (state: GameState, x: number, y: number, n = 8, big = 1) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 5 * big, y: -1.5 - Math.random() * 4 * big }, life: 22, color: i % 2 ? '#E0F2FE' : '#7DD3FC', size: 2 + Math.random() * 3 });
};

export const logUnder = (state: GameState): PondLog | null => townOf(state).logs.find(L => L.gone === 0 && riding(state, L.m)) ?? null;

/** A frame of the logs (before he moves): his walking into the one he's on, the birler's into his, the ladder. */
export const updateLogs = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, tw = townOf(state);
  const on = logUnder(state);
  let out = controls;
  for (const L of tw.logs) {
    const W = WATERS[L.water];
    // (gone up the ladder: a new one floats out at home a while later)
    if (L.gone > 0) {
      if (--L.gone === 0) { L.x = L.home; L.vx = 0; L.ladder = 0; moveMover(state, L.m, L.x, logTop(L)); splash(state, L.x + L.len / 2, W.surface, 10); }
      continue;
    }
    // (on the ladder: up it, then tipped onto the deck)
    if (L.ladder > 0) {
      const was = L.ladder;
      L.ladder = Math.min(1, L.ladder + 1 / LADDER.frames);
      // (carried up the chain lying along it: the rolling's off for the whole haul (no roll, no drift, no log-roll pose).
      // He rides it as solid footing: stood upright on its top wherever he is along it, walking a little if he likes
      // (kept on it), placed on it every frame so nothing fights the haul; a jump (or a knock) takes him off it.)
      const at = ladderAt(L, L.ladder);
      let mine = p.health > 0 && !p.inCutscene && p.isGrounded && p.vel.y >= 0 && (ride?.L === L || L === on);
      const fx = p.pos.x + p.width / 2, half = (L.len / 2) * Math.cos(at.tilt) - p.width / 2 + 4;
      if (mine) {
        if (ride?.L !== L) { const prev = ladderAt(L, was); ride = { L, s: fx - topAt(prev, 0).x }; }
        // (where his walking's put him along it: kept on it on the way up; set down on the deck, he can step off it)
        const r = ride!, prevTop = topAt(ladderAt(L, was), r.s), s = r.s + (fx - prevTop.x);
        if (was >= 1 && Math.abs(s) > (L.len + p.width) / 2 - 6) mine = false;
        else if (was >= 1) r.s = s;
        else { r.s = Math.max(-half, Math.min(half, s)); if (Math.abs(r.s) >= half) p.vel.x = 0; }
      }
      if (mine) {
        const r = ride!;
        const ft = topAt(at, r.s);
        moveMover(state, L.m, ft.x - L.len / 2, ft.y, false);
        p.pos.x = ft.x - p.width / 2; p.pos.y = ft.y - p.height; p.vel.y = 0; p.isGrounded = true;
      } else {
        if (ride?.L === L) ride = null;
        moveMover(state, L.m, at.cx - L.len / 2, at.cy - R);
      }
      if (state.frame % 12 === 0) playSound('clink', 0.4, -4);
      if (L.ladder >= 1) {
        if (was < 1) { playSound('thud', 0.8, -8); shakeScreen(state, 3, 2); }
        // (set down on the deck: it stays put under him till he steps off it (no drop out from under him), then it's
        // gone (a new one floats out back home a while later))
        if (!mine) { L.gone = BACK; moveMover(state, L.m, at.cx - L.len / 2, at.cy - R, true); if (ride?.L === L) ride = null; }
      }
      continue;
    }
    const rider = L === on && p.health > 0 && !p.inCutscene;
    // (who's driving it: him, or the birler on his own)
    let input = rider ? (controls.right ? 1 : 0) - (controls.left ? 1 : 0) : 0;
    const birler = L.birler && L.birler.health > 0 && L.birler.aiState !== 'off' ? L.birler : null;
    if (birler && !rider) {
      const mine = on && on.water === L.water ? on : null;
      const target = mine ? mine.x + (mine.x > L.x ? -L.len + 4 : mine.len - 4) : L.home;
      input = Math.abs(target - L.x) > 12 ? Math.sign(target - L.x) : 0;
      if (mine && !tw.said.birler) { tw.said.birler = true; meatheadSays(state, pickLine(byPants(state, BIRLER_SEEN)), false); }
    }
    const lo = W.a + 2, hi = W.b - 2 - L.len;
    const jammed = input !== 0 && ((input > 0 && L.x >= hi - 0.5) || (input < 0 && L.x <= lo + 0.5));
    const push = birler && !rider ? 2.4 : PUSH;
    if (input && !jammed) L.vx += (input * push - L.vx) * ANSWER;
    else L.vx += (0 - L.vx) * EASE;
    let nx = L.x + L.vx;
    L.bumpCd = Math.max(0, L.bumpCd - 1);
    // (pond B's right end is the jack ladder's foot: a log that gets there going right is taken up)
    if (W.key === 'pondB' && nx >= hi - 1 && L.vx > 0.5 && !birler) {
      L.ladder = 0.001; L.vx = 0;
      playSound('clang', 0.8, -6);
      if (rider && !tw.said.ladder) { tw.said.ladder = true; meatheadSays(state, pickLine(byPants(state, LADDER_UP)), false); }
      continue;
    }
    const bump = (at: number) => {
      if (Math.abs(L.vx) > 1.1 && L.bumpCd === 0) { playSound('thud', Math.min(1, Math.abs(L.vx) / 3), -6); splash(state, at, W.surface, 10); if (rider) { shakeScreen(state, 4, 2); L.lean = Math.sign(L.vx); } L.bumpCd = 20; }
      L.vx = 0;
    };
    if (nx < lo) { nx = lo; bump(lo); } else if (nx > hi) { nx = hi; bump(hi + L.len); }
    // (another log: they knock together; the birler's knocks hard)
    for (const O of tw.logs) {
      if (O === L || O.water !== L.water || O.gone > 0 || O.ladder > 0) continue;
      if (nx < O.x + O.len && nx + L.len > O.x) {
        const fromLeft = L.x < O.x;
        nx = fromLeft ? O.x - L.len : O.x + O.len;
        const rel = Math.abs(L.vx - O.vx);
        if (rel > 1.1 && L.bumpCd === 0) {
          playSound('thud', 0.8, -4); splash(state, fromLeft ? nx + L.len : nx, W.surface, 8); L.bumpCd = 20;
          // (rammed by the birler with him on the other log: up he goes, knocked his way)
          if (birler && O === on && p.health > 0) {
            p.vel.y = -6.5; p.isGrounded = false; O.lean = fromLeft ? 1 : -1;
            p.invincibilityTimer = 0;
            hurtPlayer(ctx, 6, 'm2:fr_birler', { x: (fromLeft ? 1 : -1) * 4, y: -6 });
            shakeScreen(state, 6, 3);
          }
        }
        const t = L.vx; L.vx = O.vx * 0.6; O.vx = t * (birler ? 1.1 : 0.6);
      }
    }
    L.spin += (nx - L.x) / R;
    const dv = L.vx - L.lastVx; L.lastVx = L.vx;
    L.lean = Math.max(-1, Math.min(1, L.lean * 0.9 + dv * 3 + (rider && Math.abs(L.vx) > 0.4 ? Math.sin(state.frame * 0.13) * 0.04 : 0)));
    L.x = nx;
    const bob = Math.sin(state.frame * 0.05 + L.water * 1.7 + L.home) * 1.2;
    moveMover(state, L.m, L.x, logTop(L) + bob);
    if (Math.abs(L.vx) > 1 && state.frame % 6 === 0 && onScreen(state, L.x, L.x + L.len)) splash(state, L.vx > 0 ? L.x : L.x + L.len, W.surface, 2, 0.5);
    if (rider) {
      p.logRoll = { spin: L.spin, lean: L.lean };
      if (input) p.facing = input > 0 ? 1 : -1;
      if (!jammed) out = { ...out, left: false, right: false };
    }
  }
  // (the log-roll pose only on a log in the water: never on the haul)
  if ((!on || on.ladder > 0 || ride) && p.logRoll) p.logRoll = undefined;
  if (ride && !tw.logs.includes(ride.L)) ride = null;
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the logs (the wilds' log), the jack ladder (a chain up a timber ramp, its cleats moving)

export const drawLogs = (c: Ctx, state: GameState) => {
  for (const L of townOf(state).logs) {
    if (L.gone > 0) continue;
    if (L.ladder > 0) {
      // (up the chain: drawn lying along it, about its middle)
      const at = ladderAt(L, L.ladder);
      if (!onScreen(state, at.cx - L.len, at.cx + L.len)) continue;
      c.save(); c.translate(at.cx, at.cy); c.rotate(at.tilt);
      drawLog(c, -L.len / 2, -R, L.len, L.spin);
      c.restore();
      continue;
    }
    if (!onScreen(state, L.x, L.x + L.len)) continue;
    drawLog(c, L.m.b.x, L.m.b.y, L.len, L.spin);
  }
};

export const drawLadder = (c: Ctx, state: GameState) => {
  const W = WATERS.find(w => w.key === 'pondB')!;
  if (!onScreen(state, W.b - 60, LADDER.top + 60)) return;
  const { xa, ya, xb, yb } = chain();
  const T = hr('timber', TIMBER), S = hr('steel', STEEL);
  // (the ramp: a trough of planks on trestle legs, X-braced, their feet in the water)
  for (let k = 0.15; k < 1; k += 0.28) {
    const lx = xa + (xb - xa) * k, ly = ya + (yb - ya) * k;
    box(c, lx - 4, ly, 8, ya - ly + 40, INK); box(c, lx - 3, ly, 6, ya - ly + 40, T[3]); box(c, lx - 3, ly, 2, ya - ly + 40, T[5]);
    if (k + 0.28 < 1) { const nx = xa + (xb - xa) * (k + 0.28), ny = ya + (yb - ya) * (k + 0.28); c.strokeStyle = T[2]; c.lineWidth = 3; c.beginPath(); c.moveTo(lx, ya + 30); c.lineTo(nx, ny + 10); c.stroke(); }
  }
  c.strokeStyle = INK; c.lineWidth = 16; c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.stroke();
  c.strokeStyle = T[3]; c.lineWidth = 12; c.stroke();
  c.strokeStyle = T[5]; c.lineWidth = 2; c.beginPath(); c.moveTo(xa, ya - 5); c.lineTo(xb, yb - 5); c.stroke();
  c.strokeStyle = T[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(xa, ya + 5); c.lineTo(xb, yb + 5); c.stroke();
  // (the chain along the beam's top and its dogs standing square off it, crawling up at the haul's own pace: the log
  // rides on the dogs' tips (ladderAt); the head sprocket)
  const len = Math.hypot(xb - xa, yb - ya), ux = (xb - xa) / len, uy = (yb - ya) / len, nx = uy, ny = -ux;
  const cx0 = xa + nx * (BEAM + 1), cy0 = ya + ny * (BEAM + 1), cx1 = xb + nx * (BEAM + 1), cy1 = yb + ny * (BEAM + 1);
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(cx0, cy0); c.lineTo(cx1, cy1); c.stroke();
  c.strokeStyle = S[3]; c.lineWidth = 2; c.stroke();
  const pace = (len - 60) / (LADDER.frames * UP), off = (state.frame * pace) % 30;
  for (let d = off % 10; d < len; d += 10) box(c, cx0 + ux * d - 1, cy0 + uy * d - 1, 3, 2, S[5]);
  for (let d = off; d < len - 4; d += 30) {
    c.save(); c.translate(cx0 + ux * d, cy0 + uy * d); c.rotate(LADDER_ANGLE);
    box(c, -4, -(DOG - BEAM) - 1, 8, DOG - BEAM + 2, INK); box(c, -3, -(DOG - BEAM), 6, DOG - BEAM, S[4]); box(c, -3, -(DOG - BEAM), 6, 1, S[6]); box(c, 1, -(DOG - BEAM), 2, DOG - BEAM, S[2]);
    c.restore();
  }
  c.fillStyle = INK; c.beginPath(); c.arc(cx1, cy1, 10, 0, Math.PI * 2); c.fill(); c.fillStyle = S[3]; c.beginPath(); c.arc(cx1, cy1, 8, 0, Math.PI * 2); c.fill();
  const sa = state.frame * pace / 8;
  for (let k = 0; k < 4; k++) box(c, cx1 + Math.cos(sa + k * Math.PI / 2) * 5 - 1, cy1 + Math.sin(sa + k * Math.PI / 2) * 5 - 1, 3, 3, S[1]);
  box(c, cx1 - 2, cy1 - 2, 4, 4, S[6]);
};
