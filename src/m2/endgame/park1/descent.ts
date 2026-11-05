// THE DESCENT (the owner's: "when the fight is over, meathead goes down the ridiculous water slide, with green alien
// blood recoloring the water on his way down. when he hits the bottom and the big splash occurs, do the 'victory'
// callout after meathead says something funny about riding the alien kid down the waterslide").
//
// No input, no HUD (a set piece, short, not skippable). The kid's flopped belly-down in the slide's mouth: Meathead
// walks up (his line), hops on his back, and they go: all the way down MOUNT EVEREST BUT BETTER's slide (geo.ts
// DESCENT), a thousand feet, faster and faster, the kid's green coming out of him into the water behind them, the
// chute's water going green the whole way down. The splash pool at the bottom: the big splash (it throws him out onto
// the deck), the pool gone green, the kid floating in it. His line; VICTORY; control's his again, on he walks.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { meatheadSays } from '../../adventure/section';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone, VICTORY_FRAMES } from '../../victory';
import { DESCENT, POOLS, GY } from './geo';
import { pathOf, pointAt } from './slides';
import { paintKidCorpse } from './kidArt';
import { DESC_WATER } from './art';
import { MOUTH_AT } from './boss';
import { byPants } from './kinds';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const P = pathOf(DESCENT);
/** How far over the chute's line he's sat (on the kid's back): low enough that the chute's near wall (art.ts DESC_LIFT)
 *  is over his feet and the kid's belly, the way the tube rides' near half is over his legs. */
const SEAT = 12;
const POOL = POOLS[3];
/** Where the splash throws him: the deck past the pool. */
const OUT_X = POOL.x2 + 110;

export interface Descent {
  step: 'walk' | 'hop' | 'ride' | 'splash' | 'thrown' | 'line' | 'victory' | 'done';
  t: number; s: number; v: number;
  /** The kid: where he is (world), his turn. */
  kx: number; ky: number; ka: number;
  victory: Victory | null; said: boolean;
  /** His line on the way down's been said (the VICTORY waits for it: never over it). */
  lineDone: boolean;
  /** The VICTORY's been started (once). */
  shown: boolean;
  /** How far down the water's green (along the path), the pool's green (0..1). */
  green: number; pool: number;
  from: { x: number; y: number };
}
export const startDescent = (): Descent => ({ step: 'walk', t: 0, s: 0, v: 3, kx: MOUTH_AT.x, ky: MOUTH_AT.y, ka: 0, victory: null, said: false, lineDone: false, shown: false, green: 0, pool: 0, from: { x: 0, y: 0 } });
const hands = (): Controls => ({ left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false });

/** A frame of it. `onDone`: control back. */
export const updateDescent = (ctx: FrameContext, d: Descent, onSplash: () => void): Controls => {
  const { state } = ctx, p = state.player;
  d.t++;
  p.inCutscene = true; p.untouchable = true;
  const cx = p.pos.x + p.width / 2;
  switch (d.step) {
    case 'walk':
      // (up to the kid in the mouth; his line on the way)
      if (!d.said) { d.said = true; meatheadSays(state, pickLine(byPants(state, L.MH_RIDE)), true); }
      p.facing = 1;
      if (cx < MOUTH_AT.x - 70) p.vel.x = 2.4; else { p.vel.x = 0; if (d.t > 50) { d.step = 'hop'; d.t = 0; d.from = { x: cx, y: p.pos.y + p.height }; playSound('jump', 0.8); } }
      if (d.t > 400) { d.step = 'hop'; d.t = 0; d.from = { x: cx, y: p.pos.y + p.height }; }
      return hands();
    case 'hop': {
      // (up onto the kid's back: a hop, sat down on him)
      const k = Math.min(1, d.t / 24), seat = pointAt(P, 0);
      const x = d.from.x + (seat.x - 6 - d.from.x) * k, y = d.from.y + (seat.y - SEAT - d.from.y) * k - Math.sin(k * Math.PI) * 50;
      p.carried = true; p.pos.x = x - p.width / 2; p.pos.y = y - p.height; p.vel.x = 0; p.vel.y = 0;
      if (k >= 1) {
        d.step = 'ride'; d.t = 0; p.logSeat = true; playSound('splat', 0.8, -4); playSound('splash', 0.9, -6);
        // (the owner's: the funny line about riding the kid down, said up top as they go (it waits its turn behind the
        // one at the mouth); the VICTORY after it, timed to the bottom)
        meatheadSays(state, pickLine(byPants(state, L.MH_SPLASH)), true, () => { d.lineDone = true; });
      }
      return hands();
    }
    case 'ride': {
      const here = pointAt(P, d.s);
      d.v = Math.min(23, d.v + 0.4 * Math.max(0.15, Math.sin(here.a)) + 0.03);
      d.s += d.v;
      const at = pointAt(P, Math.min(d.s, P.len));
      d.kx = at.x; d.ky = at.y; d.ka = at.a;
      d.green = d.s;
      // (him on the kid's back: sat, turned with the slide; down in it, the chute's near wall over his hips (art.ts))
      const nx = -Math.sin(at.a), ny = Math.cos(at.a);
      p.carried = true; p.logSeat = true; p.facing = 1; p.spriteRot = at.a;
      p.pos.x = at.x - nx * SEAT - p.width / 2; p.pos.y = at.y - ny * SEAT - p.height + 6; p.vel.x = d.v; p.vel.y = 0;
      // (the kid's green out of him into the water behind, the spray off them)
      if (d.t % 2 === 0) state.particles.push({ pos: { x: at.x - 40, y: at.y - 4 }, vel: { x: -1 - Math.random() * 3, y: -1 - Math.random() * 3 }, life: 26, color: Math.random() < 0.6 ? '#3FA34D' : '#A8E03A', size: 2 + Math.random() * 3 });
      if (d.t % 3 === 0) state.particles.push({ pos: { x: at.x + 50, y: at.y - 6 }, vel: { x: 2 + Math.random() * 3, y: -2 - Math.random() * 3 }, life: 20, color: '#E0F2FE', size: 2 + Math.random() * 2 });
      if (d.t % 5 === 0) playSound('splash', 0.25, 6 + Math.random() * 4);
      if (d.t % 40 === 0) playSound('whoosh', 0.6, -4 + d.v * 0.3);
      state.cameraOverride = { x: at.x - 330, y: at.y - 340 };
      // (the owner's: "The victory animation for stage one should trigger during the slide. Time it so it ends when
      // meathead hits the bottom of the slide": started once his line's done and the frames left to the bottom are the
      // VICTORY's (or at once, if the line ran long))
      if (!d.shown && d.lineDone && framesLeft(d) <= VICTORY_FRAMES) { d.victory = startVictory(); d.shown = true; }
      if (d.victory) tickVictory(state, d.victory);
      if (d.s >= P.len) {
        // (the bottom: the big splash, it throws him out onto the deck)
        d.step = 'splash'; d.t = 0;
        playSound('splash', 1, -14); playSound('splash', 1, -6); playSound('crash', 0.7, -16); playSound('thud', 1, -12);
        shakeScreen(state, 20, 12);
        for (let i = 0; i < 120; i++) state.particles.push({ pos: { x: at.x + 40 + (Math.random() - 0.3) * 100, y: POOL.surface }, vel: { x: (Math.random() - 0.3) * 9, y: -4 - Math.random() * 14 }, life: 60 + Math.random() * 30, color: i % 3 === 0 ? '#3FA34D' : i % 3 === 1 ? '#86EFAC' : '#E0F2FE', size: 2 + Math.random() * 5 });
        d.from = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height };
        d.kx = (POOL.x1 + POOL.x2) / 2; d.ky = POOL.surface + 6; d.ka = 0;
        onSplash();
      }
      return hands();
    }
    case 'splash':
    case 'thrown': {
      // (thrown out of the pool onto the deck, head over heels)
      d.step = 'thrown';
      const T = 54, k = Math.min(1, d.t / T);
      d.pool = Math.min(1, d.pool + 0.02);
      const x = d.from.x + (OUT_X - d.from.x) * k, y = d.from.y + (GY - d.from.y) * k - Math.sin(k * Math.PI) * 220;
      p.carried = true; p.logSeat = false; p.spriteRot = 0;
      p.pos.x = x - p.width / 2; p.pos.y = y - p.height;
      if (!p.freefall) p.freefall = { style: 'flail', t: 0, rot: 0, land: 0 };
      p.freefall.t++; p.freefall.rot = k * Math.PI * 4;
      if (d.victory) { tickVictory(state, d.victory); if (victoryDone(d.victory)) d.victory = null; }
      state.cameraOverride = { x: x - 400, y: Math.min(y, GY) - 420 };
      if (k >= 1) {
        p.freefall = undefined; p.carried = false; p.facing = -1; p.pos.y = GY - p.height; p.isGrounded = true;
        playSound('land', 1, -4); playSound('thud', 0.9, -8); shakeScreen(state, 8, 4);
        d.step = 'line'; d.t = 0; d.said = false;
      }
      return hands();
    }
    // (landed on the deck: a beat (the VICTORY's tail, if it's still going), then he's his again)
    case 'line':
    case 'victory':
      d.pool = Math.min(1, d.pool + 0.02);
      state.cameraOverride = { x: OUT_X - 420, y: GY - 560 };
      // (no VICTORY yet (the line ran on past the bottom): now, here)
      if (!d.victory && !d.said && (d.lineDone || d.t > 400)) { d.said = true; if (!victoryWasShown(d)) { d.victory = startVictory(); d.shown = true; } }
      if (d.victory) { tickVictory(state, d.victory); if (victoryDone(d.victory)) d.victory = null; }
      if (!d.victory && d.t > 30 && (d.said || d.lineDone)) d.step = 'done';
      return hands();
    case 'done':
      return hands();
  }
};
export const descentDone = (d: Descent) => d.step === 'done';
/** Frames to the bottom from here, at the ride's own pace (its speed's law, run on ahead). */
const framesLeft = (d: Descent) => {
  let s = d.s, v = d.v, n = 0;
  while (s < P.len && n < 3000) { const here = pointAt(P, s); v = Math.min(23, v + 0.4 * Math.max(0.15, Math.sin(here.a)) + 0.03); s += v; n++; }
  return n;
};
/** The VICTORY's been up already (during the ride). */
const victoryWasShown = (d: Descent) => d.shown;
export const descentRiding = (d: Descent) => d.step === 'hop' || d.step === 'ride';

// (the kid's corpse, baked the once, drawn turned with the slide (the stamp cache won't take a turned one))
let corpse: HTMLCanvasElement | null = null;
const corpseImg = () => {
  if (corpse || typeof document === 'undefined') return corpse;
  const S = 2, cv = document.createElement('canvas');
  cv.width = 240 * S; cv.height = 74 * S;
  const g = cv.getContext('2d')!;
  g.scale(S, S); g.translate(130, 60);
  paintKidCorpse(g);
  corpse = cv;
  return cv;
};
/** World space: the kid (in the mouth, on the way down, floating in the pool). */
export const drawDescentKid = (c: Ctx, d: Descent | null, inMouth: boolean) => {
  const img = corpseImg();
  if (!img) return;
  const x = d ? d.kx : MOUTH_AT.x, y = d ? d.ky : MOUTH_AT.y, a = d ? d.ka : 0;
  if (!d && !inMouth) return;
  c.save(); c.translate(x, y); c.rotate(a);
  c.drawImage(img, -130, -60, 240, 74);
  c.restore();
};
/** The water gone green behind him: the chute's water from the top down to `green` along it (world space); `all`: the
 *  kid's dead and the ride's over, the whole chute's green. */
export const drawGreenWater = (c: Ctx, state: GameState, d: Descent | null, all = false) => {
  const green = d ? d.green : all ? P.len : 0;
  if (green <= 0) return;
  const L0 = state.camera.x - 100, R0 = state.camera.x + 900;
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = '#1E5A26'; c.lineWidth = 9;
  c.beginPath();
  let on = false;
  for (const g of P.segs) {
    if (g.at > green) break;
    if (Math.max(g.x0, g.x1) < L0 || Math.min(g.x0, g.x1) > R0) { on = false; continue; }
    const k = Math.min(1, (green - g.at) / g.len);
    if (!on) { c.moveTo(g.x0, g.y0 + DESC_WATER); on = true; }
    c.lineTo(g.x0 + (g.x1 - g.x0) * k, g.y0 + (g.y1 - g.y0) * k + DESC_WATER);
  }
  c.stroke();
  // (in its steps, as the water's painted (art.ts descBack): the deep of it, the run, the lit line along its top, the
  // froth; the strokes moved, not the path: one path, a few strokes)
  c.save(); c.translate(0, -1); c.strokeStyle = '#2E8A3A'; c.lineWidth = 6; c.stroke(); c.restore();
  c.save(); c.translate(0, -3); c.strokeStyle = '#A8E03A'; c.lineWidth = 2; c.stroke(); c.restore();
  c.save(); c.translate(0, -4); c.strokeStyle = 'rgba(236, 252, 203, 0.9)'; c.lineWidth = 1; c.setLineDash([3, 9]); c.stroke(); c.setLineDash([]); c.restore();
  c.lineCap = 'butt';
};
export const drawDescentHud = (c: Ctx, d: Descent | null) => { if (d?.victory) drawVictory(c, d.victory); };
export const DESCENT_PATH = P;
