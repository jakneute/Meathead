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
import { onScreen } from './view';
import { townOf, type PondLog } from './state';
import { WATERS, LOGS, LADDER, X } from './layout';
import { LADDER_UP, BIRLER_SEEN } from './lines';

/** (he's been tilted with a log on the ladder: stood straight again once he's off it) */
let tilted = false;
const R = 14, SINK = 2, PUSH = 3.2, ANSWER = 0.08, EASE = 0.03, BACK = 260;
const logTop = (L: PondLog) => WATERS[L.water].surface - (2 * R - SINK);
/** Up the jack ladder: its left end and top at k (0 at the water, 1 tipped onto the deck): up the chain (kept short of
 *  the mill's works), then over onto the deck. */
const UP = 0.8;
/** The chain's run (its foot at the water, its head at the deck's edge): the log's middle rides R + 3 up off it. */
const chain = () => {
  const W = WATERS.find(w => w.key === 'pondB')!;
  return { xa: W.b - 20, ya: W.surface + 30, xb: LADDER.foot + 185, yb: LADDER.topY };
};
/** The chain's slope (radians: negative, up to the right). */
export const LADDER_ANGLE = (() => { const ch = chain(); return Math.atan2(ch.yb - ch.ya, ch.xb - ch.xa); })();
/** Up the jack ladder at k: the log's middle (on the chain, lying along it) and its tilt (eased in off the water,
 *  along the chain's slope all the way up, laid flat again as it's tipped onto the deck). */
const ladderAt = (L: PondLog, k: number) => {
  const ch = chain(), ux = Math.cos(LADDER_ANGLE), uy = Math.sin(LADDER_ANGLE), nx = uy, ny = -ux, off = R + 3;
  const len = Math.hypot(ch.xb - ch.xa, ch.yb - ch.ya);
  // (where it starts: floating at the chain's foot; where the chain lets go of it: its back end at the chain's head)
  const W = WATERS[L.water], sx = W.b - 2 - L.len / 2, sy = logTop(L) + R;
  const ex = ch.xa + ux * (len - L.len / 2) + nx * off, ey = ch.ya + uy * (len - L.len / 2) + ny * off;
  if (k < UP) {
    const t = k / UP, tilt = LADDER_ANGLE * Math.min(1, t / 0.12);
    return { cx: sx + (ex - sx) * t, cy: sy + (ey - sy) * t, tilt };
  }
  const t = (k - UP) / (1 - UP), deckX = LADDER.top + L.len / 2, deckY = LADDER.topY - R;
  return { cx: ex + (deckX - ex) * t, cy: ey + (deckY - ey) * t, tilt: LADDER_ANGLE * (1 - t) };
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
      L.ladder = Math.min(1, L.ladder + 1 / LADDER.frames);
      // (carried up the chain lying along it: no rolling; whoever's on it stands where its top is under him, tilted
      // with it)
      const at = ladderAt(L, L.ladder);
      moveMover(state, L.m, at.cx - L.len / 2, at.cy - R);
      if (L === on && p.health > 0) p.spriteRot = at.tilt;
      if (state.frame % 12 === 0) playSound('clink', 0.4, -4);
      if (L.ladder >= 1) { L.gone = BACK; moveMover(state, L.m, at.cx - L.len / 2, at.cy - R, true); playSound('thud', 0.8, -8); shakeScreen(state, 3, 2); }
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
  if ((!on || on.ladder > 0) && p.logRoll) p.logRoll = undefined;
  // (off the ladder's log (stepped off, or tipped onto the deck): stood up straight again)
  const up = !!on && on.ladder > 0 && p.health > 0;
  if (!up && tilted) p.spriteRot = 0;
  tilted = up;
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
  // (the ramp: timbers on trestle legs)
  for (let k = 0.15; k < 1; k += 0.28) { const lx = xa + (xb - xa) * k, ly = ya + (yb - ya) * k; box(c, lx - 3, ly, 6, ya - ly + 40, '#5A3A1E'); }
  c.strokeStyle = INK; c.lineWidth = 14; c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.stroke();
  c.strokeStyle = '#7A5230'; c.lineWidth = 10; c.stroke();
  // (the chain and its cleats, crawling up)
  const len = Math.hypot(xb - xa, yb - ya), ux = (xb - xa) / len, uy = (yb - ya) / len;
  c.strokeStyle = '#52525B'; c.lineWidth = 3; c.beginPath(); c.moveTo(xa, ya - 6); c.lineTo(xb, yb - 6); c.stroke();
  const off = (state.frame * 1.2) % 30;
  for (let d = off; d < len; d += 30) box(c, xa + ux * d - 3, ya + uy * d - 12, 6, 6, '#A1A1AA');
};
