// The leeches (the user's: "the water sections for the logs should have leeches that slow you down, slowly drain health
// and disables charging when underwater. it goes away when you surface. that's the incentive to use the logs"). In
// every log crossing but the pond (layout.ts LEECH_WATERS), while his head's under the water (the same line his air
// goes by: frontier/air.ts), leeches latch on, one after another, more the longer he stays down: they show, dark and
// wriggling, on him; each one slows his swimming a bit more; they drain him a little at a time (m2:fr_leech, its own
// hurt lines and death screens: lines.ts), faster the more there are; and while any are on him there's no lunge (the
// special, swimming). The moment his head's out of the water (up for air, onto a log, out on a bank) they all drop off
// him, shaken off in a spray. They're not enemies: nothing to kill, no kill callouts.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { hurtTaken } from '../../../m1/game/core/resist';
import type { Ctx } from '../kit';
import { LEECH_WATERS } from './layout';
import { waterOf, surfaceY } from './water';
import { wildsOf } from './state';

export const LEECH_SOURCE = 'm2:fr_leech';
/** Frames under before the first latches on, then between the rest; how many at most. */
const FIRST = 45, EVERY = 75, MAX = 8;
/** The drain: damage a tick (before M2's softer hits), and the frames between ticks (fewer, the more are on him). */
const DRAIN = 2, drainEvery = (n: number) => Math.max(30, 90 - 8 * n);
/** Each one on him takes this much off his swimming (a frame's speed, compounding into the engine's ease). */
const DRAG = 0.012, STROKE_DRAG = 0.003;

/** Where each sits on him: [across from his middle (fractions of his width, + his front), down from his top]. */
const SPOTS: [number, number][] = [
  [-0.3, 0.4], [0.28, 0.55], [-0.1, 0.68], [0.32, 0.78], [-0.28, 0.88], [0.06, 0.32], [0.36, 0.42], [-0.36, 0.6],
];

const spotAt = (state: GameState, i: number) => {
  const p = state.player, [fx, fy] = SPOTS[i % SPOTS.length];
  return { x: p.pos.x + p.width / 2 + fx * p.width * p.facing, y: p.pos.y + fy * p.height };
};

/** His head under leech water (not the pond). */
const underLeeches = (state: GameState) => {
  const p = state.player;
  if (!p.swimming) return false;
  const w = waterOf(p.pos.x + p.width / 2);
  return !!w && LEECH_WATERS.has(w.key) && p.pos.y + 6 > surfaceY(w);
};

/** Leeches on him (any): no lunge. */
export const leeched = (state: GameState) => wildsOf(state).leech.n > 0;

/** A frame: latching on under, draining, the drag, and dropping off at the surface. His controls back without the
 *  special while any are on him. */
export const updateLeeches = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, L = wildsOf(state).leech;
  // (the ones he's shaken off: flying, then into the water or the dirt)
  L.off = L.off.filter(o => {
    o.t++; o.vy += 0.35; o.x += o.vx; o.y += o.vy; o.a += o.vx * 0.15;
    const w = waterOf(o.x);
    if (w && o.vy > 0 && o.y > surfaceY(w)) { state.particles.push({ pos: { x: o.x, y: surfaceY(w) }, vel: { x: 0, y: -1.5 }, life: 12, color: '#E0F2FE', size: 2 }); return false; }
    return o.t < 50;
  });
  L.sayCd = Math.max(0, L.sayCd - 1);
  if (p.health <= 0 || state.deathTimer > 0 || p.inCutscene) return controls;
  if (!underLeeches(state)) {
    L.under = 0;
    if (L.n > 0) {
      // (surfaced: they all drop off, shaken off him in a spray)
      for (let i = 0; i < L.n; i++) {
        const s = spotAt(state, i), out = Math.sign(s.x - (p.pos.x + p.width / 2)) || (i % 2 ? 1 : -1);
        L.off.push({ x: s.x, y: s.y, vx: out * (1.5 + Math.random() * 2.5), vy: -2.5 - Math.random() * 3, t: 0, a: Math.random() * 6 });
      }
      for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2 + (Math.random() - 0.5) * p.width, y: p.pos.y + Math.random() * p.height * 0.6 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 18, color: i % 2 ? '#E0F2FE' : '#7DD3FC', size: 2 });
      playSound('squish', 0.6, 4); playSound('whoosh', 0.3, 10);
      p.squash = 0.25;
      L.n = 0; L.drainT = 0;
    }
    return controls;
  }
  // (under: they find him, one after another)
  L.under++;
  if (L.n < MAX && L.under >= (L.n === 0 ? FIRST : L.latchT)) {
    L.n++; L.latchT = L.under + EVERY;
    playSound('squish', 0.35, 10);
    // (the first on, or a while since he last said anything about it: he does)
    if (L.sayCd === 0 && ctx.fx.speakVulgarity('hurt', LEECH_SOURCE)) L.sayCd = 300;
  }
  if (L.n > 0) {
    // (the drain: a little at a time, faster with more of them)
    if (++L.drainT >= drainEvery(L.n)) {
      L.drainT = 0;
      if (!ctx.cheats.invincible && !p.untouchable) p.health -= hurtTaken(ctx.stageId, DRAIN);
      state.lastHurt = { source: LEECH_SOURCE, at: state.frame };
      const s = spotAt(state, Math.floor(Math.random() * L.n));
      for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 1.2, y: -0.4 - Math.random() * 0.6 }, life: 22, color: '#991B1B', size: 2 });
    }
    // (the drag: slower through the water, slower strokes up)
    p.vel.x *= 1 - DRAG * L.n;
    if (p.vel.y < 0) p.vel.y *= 1 - STROKE_DRAG * L.n;
    // (no lunge with them on him: a lunge going is over)
    if (controls.special) return { ...controls, special: false };
  }
  return controls;
};

/** One leech: a dark slug, banded, its sucker end darker, wriggling. */
const drawLeech = (c: Ctx, x: number, y: number, a: number, wr: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  const len = 6 + wr;
  c.fillStyle = '#0C0A09'; c.beginPath(); c.ellipse(0, 0, len + 1, 3.4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#292524'; c.beginPath(); c.ellipse(0, 0, len, 2.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#57532A'; c.fillRect(-len + 2, -1.5, len * 1.4, 1);
  c.fillStyle = '#44403C'; for (let k = -len + 3; k < len - 1; k += 3) c.fillRect(k, -2, 1, 4);
  c.fillStyle = '#7F1D1D'; c.beginPath(); c.arc(len - 0.5, 0, 1.6, 0, Math.PI * 2); c.fill();
  c.restore();
};

/** The leeches on him (hanging off him, wriggling), and the ones flying off. */
export const drawLeeches = (c: Ctx, state: GameState) => {
  const L = wildsOf(state).leech, f = state.frame;
  for (let i = 0; i < L.n; i++) {
    const s = spotAt(state, i), wr = Math.sin(f * 0.18 + i * 1.7) * 1.5;
    // (hanging off him, the tail end swaying down and away)
    drawLeech(c, s.x, s.y, Math.PI / 2 + (i % 2 ? 0.5 : -0.5) * state.player.facing + Math.sin(f * 0.09 + i) * 0.25, wr);
  }
  for (const o of L.off) { c.globalAlpha = Math.min(1, (50 - o.t) / 10); drawLeech(c, o.x, o.y, o.a, 0); c.globalAlpha = 1; }
};
