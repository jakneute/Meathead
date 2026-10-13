// THE LANDING: the end of the ride's ram. He and the sled in front (STAR SLED 6, ride/sled.ts) and its two riders come
// flying out of the giant atom and down onto the main drag. The sled's a wreck; its riders hit the street first and go
// along it a long way: a grotesque smear. He comes down on top of what's left of them, gets up: he's fine. A
// cutscene (no HUD from frame one, skippable all-or-nothing), then his. Once it's been, it's been: the smear and the
// wreck stay (state.stageMemo), and starting again from the drag's checkpoints it's all there.
//
// HANDOFF (the ride's owner): call launchOntoDrag(state) at the moment of the ram, instead of teleporting him; or just
// teleport him to DOORS.drag.start, and the drag starts the landing itself the first time he turns up there.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { lookOf } from '../../adventure/temple/people';
import { bodyOf, legs, torso, arm, headShape, faceOn, hairTop, hairBack, flailHands } from '../../spooky/costume';
import { teleport, hands, meatheadSays } from '../section';
import { DOORS, GY } from '../geometry';
import { drawSled, FRONT_SLED } from '../ride/sled';
import { X, SMEAR, WRECK_X } from './layout';
import { LANDED } from './lines';
import { still, INK } from '../square/paint';
import { box } from '../section';

type Ctx = CanvasRenderingContext2D;
export const LANDED_MEMO = 'm2:space:drag-landed';
const LAUNCH_MEMO = 'm2:space:drag-launch';

interface Body { x: number; y: number; vx: number; vy: number; rot: number; vr: number; down: boolean; seed: number; stop: number }
interface Landing { t: number; px: number; py: number; pvx: number; pvy: number; landedAt: number; said: boolean; done: boolean; car: Body; riders: Body[]; smearTo: number }
const LANDINGS = new WeakMap<object, Landing>();
export const landingOf = (state: GameState) => LANDINGS.get(state.stage as object) ?? null;
export const hasLanded = (state: GameState) => !!state.stageMemo[LANDED_MEMO];

/** The ride's ram: him (and the sled in front) on out of the atom and down onto the drag. */
export const launchOntoDrag = (state: GameState) => {
  state.stageMemo[LAUNCH_MEMO] = '1';
  teleport(state, DOORS.drag.start.x, DOORS.drag.start.y);
};
/** Should it start now? (his first time here: launched, or just put at the drag's start) */
export const landingDue = (state: GameState, justArrived: boolean) => {
  if (hasLanded(state) || landingOf(state)) return false;
  if (state.stageMemo[LAUNCH_MEMO]) return true;
  const p = state.player;
  return justArrived && Math.abs(p.pos.x + p.width / 2 - DOORS.drag.start.x) < 40;
};

const G = 0.55;
export const startLanding = (state: GameState) => {
  delete state.stageMemo[LAUNCH_MEMO];
  const L: Landing = {
    t: 0, px: X(20), py: GY - 430, pvx: 10.5, pvy: -3, landedAt: -1, said: false, done: false,
    car: { x: X(80), y: GY - 470, vx: 12, vy: -4, rot: 0, vr: 0.09, down: false, seed: 0, stop: X(WRECK_X) },
    riders: [
      { x: X(60), y: GY - 520, vx: 11.5, vy: -3, rot: 0, vr: 0.21, down: false, seed: 4021, stop: X(SMEAR.b - 60) },
      { x: X(30), y: GY - 500, vx: 11, vy: -2, rot: 1, vr: -0.17, down: false, seed: 7733, stop: X(SMEAR.b) },
    ],
    smearTo: X(SMEAR.a),
  };
  LANDINGS.set(state.stage as object, L);
  state.player.inCutscene = true;
  playSound('screams', 0.6, 0);
};

const finish = (state: GameState, L: Landing, skipped: boolean) => {
  const p = state.player;
  if (skipped) { silenceAll(); teleport(state, X(SMEAR.b - 80), GY); p.isGrounded = true; }
  L.done = true; L.smearTo = X(SMEAR.b);
  state.stageMemo[LANDED_MEMO] = '1';
  p.inCutscene = false;
  LANDINGS.delete(state.stage as object);
};

/** A frame of it (while it's on): the controls are its. */
export const runLanding = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, p = state.player, L = landingOf(state);
  if (!L) return null;
  L.t++;
  p.inCutscene = true;
  if (L.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { finish(state, L, true); return hands(); } }
  // The sled and its riders: flying, then down and along the street
  const fall = (b: Body, onDown: () => void) => {
    if (!b.down) {
      b.vy += G; b.x += b.vx; b.y += b.vy; b.rot += b.vr;
      if (b.y >= GY) { b.y = GY; b.down = true; onDown(); }
    } else if (b.x < b.stop) { b.vx = Math.max(1.5, b.vx * 0.97); b.x = Math.min(b.stop, b.x + b.vx); b.rot += (Math.round(b.rot / Math.PI) * Math.PI - b.rot) * 0.2; }
  };
  fall(L.car, () => { playSound('crash', 1); playSound('glass', 0.6); shakeScreen(state, 14, 6); });
  for (const r of L.riders) {
    fall(r, () => { playSound('splat', 1); playSound('crunch', 0.9, -4); shakeScreen(state, 8, 4); });
    if (r.down && r.x < r.stop) {
      L.smearTo = Math.max(L.smearTo, r.x);
      for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: r.x, y: GY - 6 }, vel: { x: r.vx * 0.4 + (Math.random() - 0.5) * 3, y: -Math.random() * 4 }, life: 26, color: ['#991B1B', '#7F1D1D', '#DC2626'][i % 3], size: 2 + Math.random() * 3 });
    }
  }
  // Him: on his own arc, down onto the pile
  if (L.landedAt < 0) {
    L.pvy += G; L.px += L.pvx; L.py += L.pvy;
    if (L.py >= GY) { L.py = GY; L.landedAt = L.t; playSound('land', 1); playSound('thud', 0.8, -6); shakeScreen(state, 10, 4); p.squash = 1; }
    p.pos.x = L.px - p.width / 2; p.pos.y = L.py - p.height; p.vel.x = 0; p.vel.y = 0; p.facing = 1;
  }
  // (up, a look round; then his say; then on)
  if (L.landedAt >= 0 && !L.said && L.t - L.landedAt > 40) {
    L.said = true;
    meatheadSays(state, pickLine(LANDED), true, () => { if (!L.done) finish(state, L, false); });
  }
  if (L.landedAt >= 0 && L.t - L.landedAt > 400 && !L.done) finish(state, L, false);
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** One of the riders, tumbling (live: turned): a guest in a T-shirt and shorts, flailing. Feet at the origin. */
const rider = (c: Ctx, b: Body, f: number) => {
  const B = bodyOf(b.seed, 'thrown', f >> 2), Lk = lookOf(b.seed);
  c.save(); c.translate(b.x, b.y - 36); c.rotate(b.rot); c.translate(0, 36);
  hairBack(c, B);
  legs(c, B, { col: '#1E3A8A', shoe: 'sneaker', shoeCol: '#F5F5F4', bareBelow: true });
  const fl = flailHands(B, f >> 2)!;
  arm(c, B, -1, fl[0][0], fl[0][1], { sleeve: Lk.shirt, hand: Lk.skin, len: 0.4 });
  torso(c, B, Lk.shirt);
  headShape(c, B, Lk.skin);
  faceOn(c, B, { skin: Lk.skin, eyes: 'wide', mouth: 'o', md: 'ok' });
  hairTop(c, B);
  arm(c, B, 1, fl[1][0], fl[1][1], { sleeve: Lk.shirt, hand: Lk.skin, len: 0.4 });
  c.restore();
};

/**
 * The smear, from SMEAR.a to `to` (world): a long streak of what used to be two people along the street, clots and
 * ribbons, bits of them and theirs strewn down it (a sneaker, the fanny pack, a souvenir cup, some teeth, the shreds of
 * a FUTURELAND T-shirt), a heap at the end. Painted once, whole; revealed as far as it's got.
 */
const paintSmear = (g: Ctx, w: number) => {
  const y = 0;
  for (let x = 0; x < w; x += 4) {
    const k = x / w, th = 6 + Math.sin(x * 0.07) * 3 + k * 10;
    box(g, x, y - th + 3, 4, th, x % 12 < 4 ? '#7F1D1D' : '#991B1B');
    if (x % 28 === 0) box(g, x + 2, y - th - 2, 6, 4, '#450A0A');
    if (x % 20 === 8) box(g, x, y - 1, 10, 3, '#B91C1C');
  }
  // (spatter up the curb, and either side)
  for (let i = 0; i < 40; i++) { const x = (i * 97) % w, yy = -((i * 37) % 26) - 4; box(g, x, yy, 2 + (i % 3), 2, i % 2 ? '#991B1B' : '#7F1D1D'); }
  // (the heap at the end)
  g.fillStyle = INK; g.beginPath(); g.ellipse(w - 30, y - 8, 36, 14, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#7F1D1D'; g.beginPath(); g.ellipse(w - 30, y - 7, 33, 12, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#B91C1C'; g.beginPath(); g.ellipse(w - 38, y - 12, 14, 6, 0, Math.PI, 0); g.fill();
  // (the bits)
  box(g, 60, y - 10, 14, 6, INK); box(g, 61, y - 9, 12, 4, '#F5F5F4'); box(g, 61, y - 6, 12, 1, '#9CA3AF');
  box(g, 120, y - 12, 16, 9, INK); box(g, 121, y - 11, 14, 7, '#7C3AED'); box(g, 126, y - 9, 4, 3, '#D4D4D8');
  box(g, 175, y - 18, 10, 14, INK); box(g, 176, y - 17, 8, 12, '#F8FAFC'); box(g, 176, y - 13, 8, 3, '#DC2626'); box(g, 179, y - 21, 2, 6, '#F472B6');
  for (let k = 0; k < 4; k++) box(g, 210 + k * 5, y - 6 - (k % 2), 3, 3, '#FEF9C3');
  box(g, 240, y - 9, 22, 5, '#14B8A6'); box(g, 246, y - 8, 10, 2, '#F8FAFC');
};

export const drawLanding = (c: Ctx, state: GameState) => {
  const L = landingOf(state), landed = hasLanded(state);
  if (!L && !landed) return;
  const a = X(SMEAR.a), b = X(SMEAR.b), to = L ? L.smearTo : b;
  if (to > a && b > state.camera.x - 100 && a < state.camera.x + CANVAS_WIDTH + 100) {
    c.save(); c.beginPath(); c.rect(a - 10, GY - 80, to - a + 50, 90); c.clip();
    still(c, 'spc-smear', a, GY, -10, -40, b - a + 40, 44, g => paintSmear(g, b - a));
    c.restore();
  }
  // The sled: in flight, turning; or the wreck, on its side, crumpled (stamped)
  if (L && !L.car.down) drawSled(c, L.car.x, L.car.y, state.frame, FRONT_SLED, false, L.car.rot);
  else if (X(WRECK_X) > state.camera.x - 200 && X(WRECK_X) < state.camera.x + CANVAS_WIDTH + 200) {
    const wx = L ? L.car.x : X(WRECK_X);
    c.save(); c.translate(wx, GY + 6); c.rotate(0.18); drawSled(c, 0, 0, 0, FRONT_SLED, false, 0); c.restore();
    // (the crumple, the smoke)
    box(c, wx + 50, GY - 34, 30, 24, '#3F3F46');
    for (let i = 0; i < 3; i++) { const u = ((state.frame * 0.7 + i * 50) % 150) / 150; c.fillStyle = `rgba(82, 82, 91, ${0.45 * (1 - u)})`; c.beginPath(); c.arc(wx + 60 + Math.sin(state.frame * 0.04 + i) * 8, GY - 40 - u * 120, 8 + u * 20, 0, Math.PI * 2); c.fill(); }
  }
  if (L) for (const r of L.riders) if (!r.down) rider(c, r, state.frame);
};

export const drawLandingHud = (c: Ctx, state: GameState) => {
  const L = landingOf(state);
  if (L && L.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
