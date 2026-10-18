// The cars as things to stand on, and Tucker cutting them loose. Each car's floor runs the length of it and halfway
// across the couplings either side (the plates meet: no falling between cars while they're coupled); a car he goes into
// has a roof over it (the ceiling inside, its top to stand on); a car he only crosses has its load or its body to stand
// on (the logs, the ore, the tank, the boxcar's roof, the tender's coal); the engine's cab is walled off (no way in:
// Tucker's in there). The bed under the train is the tracks: down there while it's moving, he's under the wheels.
//
// THE CUT (the user's: Tucker now and then uncouples the car he's on; dally and it derails, a silly violent death):
// a good way along a car that's marked for it, the tell (Tucker on the tube, the coupling ahead of him sparking and
// clanking, a red ! over it, the car shuddering), then the car and everything behind it drop back, faster and faster;
// a few lengths back it derails, tumbling off the line. Still on it then: dead (m2:fr_derail, its death screen).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { hazardKill } from '../../hazardHit';
import { ledge, solid, meatheadSays, byPants } from '../section';
import { GY } from '../geometry';
import { CARS, CAR_X, carRight, DECK, ROOF, CEIL, COUPLER, END, ENTERABLE, TOP, ENGINE, CHECKPOINTS } from './layout';
import { trainOf, type Train } from './state';
import { tubeSay } from './tube';
import { TUBE_UNCOUPLE, TUBE_MISSED, TRAIN_GAGS } from './lines';

const AWAY = -99999;

/** Which cars are still on, back at this checkpoint: a car cut loose before it (the cut's ahead of the checkpoint's
 *  car) stays gone. */
export const rearFor = (cpX: number) => {
  let rear = 0;
  CARS.forEach((d, i) => { if (d.cut && i + 1 < CARS.length && cpX > CAR_X[i + 1]) rear = Math.max(rear, i + 1); });
  return rear;
};
export const rearForCheckpoint = (cp: number) => rearFor(CHECKPOINTS.find(c => c.cp === cp)?.x ?? 0);

/** The cars' blocks, from the rearmost still on. */
export const buildCars = (state: GameState, tr: Train) => {
  tr.cars = CARS.map((d, i) => {
    const x = CAR_X[i], blocks: Block[] = [];
    if (i < tr.rear) return { i, blocks, gone: true };
    blocks.push(ledge(state, x - COUPLER / 2, DECK, d.len + COUPLER, { hidden: true, noDropThrough: true, tag: `tr-floor-${i}` }));
    if (ENTERABLE.includes(d.kind)) {
      blocks.push(solid(state, x + END - 6, ROOF, d.len - 2 * END + 12, CEIL - ROOF, { hidden: true, tag: `tr-roof-${i}` }));
      if (d.kind === 'caboose') blocks.push(solid(state, x + d.len * 0.42, ROOF - 30, 64, 30, { hidden: true, tag: 'tr-cupola' }));
      for (const cx of d.crates ?? []) blocks.push(solid(state, x + cx, DECK - 40, 40, 40, { hidden: true, tag: `tr-crate-${i}` }));
    } else if (d.kind === 'engine') {
      // (the cab's back: no way in, up to the sky; Tucker leans out over it)
      blocks.push(solid(state, x - 4, -4000, 16, 4000 + DECK, { hidden: true, tag: 'tr-cab' }));
    } else {
      const top = TOP[d.kind]!;
      blocks.push(solid(state, x + END, top, d.len - 2 * END, DECK - top, { hidden: true, tag: `tr-body-${i}` }));
      if (d.kind === 'tank') blocks.push(solid(state, x + d.len / 2 - 20, top - 14, 40, 14, { hidden: true, tag: 'tr-dome' }));
    }
    return { i, blocks, gone: false };
  });
};

/** How far car i's dropped back (the cut's drift, if it's in the cut-off end). */
export const offOf = (tr: Train, i: number) => (tr.cut && tr.cut.phase === 'drift' && i <= tr.cut.k ? tr.cut.off : 0);
/** Car i's left end now. */
export const carXNow = (tr: Train, i: number) => CAR_X[i] + offOf(tr, i);

/** Is he inside car i (on its floor, under its roof)? */
export const insideCar = (state: GameState, tr: Train, i: number) => {
  const d = CARS[i];
  if (!ENTERABLE.includes(d.kind) || tr.cars[i]?.gone) return false;
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height, x = carXNow(tr, i);
  return cx > x + END - 2 && cx < x + d.len - END + 2 && feet > CEIL + 6 && feet < DECK + 12;
};
/** The car he's on or in (by his middle), or -1. */
export const carAt = (tr: Train, x: number) => {
  for (let i = tr.rear; i < CARS.length; i++) { const a = carXNow(tr, i) - COUPLER / 2; if (x >= a && x < a + CARS[i].len + COUPLER) return i; }
  return -1;
};

// ---------------------------------------------------------------------------------------------------------------
// Moving the cut-off end

/** Stood on it? */
const onTop = (b: Block, x: number, w: number, feet: number, grounded: boolean) => grounded && Math.abs(feet - b.y) < 4 && x + w > b.x + 2 && x < b.x + b.w - 2;

/** Moves cars rear..k by dx, and whoever's stood on them, and what's lying on their floors. */
const shiftCars = (state: GameState, tr: Train, k: number, dx: number) => {
  const p = state.player, blocks: Block[] = [];
  for (let i = tr.rear; i <= k; i++) if (!tr.cars[i].gone) blocks.push(...tr.cars[i].blocks);
  if (!blocks.length) return;
  const x0 = blocks[0].x, x1 = Math.max(...blocks.map(b => b.x + b.w));
  let him = false;
  const moved = new Set<Enemy>();
  for (const b of blocks) {
    if (!him && !p.carried && onTop(b, p.pos.x, p.width, p.pos.y + p.height, p.isGrounded)) him = true;
    for (const e of state.enemies) if (!moved.has(e) && e.enemyType !== 'flyer' && onTop(b, e.pos.x, e.width, e.pos.y + e.height, e.vel.y === 0)) moved.add(e);
  }
  for (const b of blocks) b.x += dx;
  if (him) p.pos.x += dx;
  for (const e of moved) { e.pos.x += dx; if (e.homeX !== undefined) e.homeX += dx; }
  for (const q of state.pickups) if (q.pos.x > x0 && q.pos.x < x1 && Math.abs(q.pos.y + q.height - DECK) < 30) q.pos.x += dx;
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const TELL_SPARKS = 4;

export const updateCut = (ctx: FrameContext) => {
  const { state } = ctx, tr = trainOf(state), p = state.player;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  tr.shudder = 0;
  if (!tr.cut) {
    if (tr.phase !== 'ride' || p.health <= 0 || p.inCutscene) return;
    // (far enough along a car that's marked for it, on it or in it: Tucker cuts it loose)
    for (let i = tr.rear; i < CARS.length - 1; i++) {
      const d = CARS[i];
      if (!d.cut || tr.cutsDone.has(i)) continue;
      if (cx > CAR_X[i] + d.len * d.cut.at && cx < carRight(i) + 6 && feet < DECK + 6) { startCut(state, tr, i, d.cut.tell); break; }
    }
    return;
  }
  const cut = tr.cut;
  cut.t++;
  const cpx = carRight(cut.k) + COUPLER / 2 + (cut.phase === 'drift' ? cut.off : 0);
  if (cut.phase === 'tell') {
    // (the coupling sparking and clanking, the car shuddering)
    tr.shudder = Math.sin(cut.t * 1.7) * Math.min(2, cut.t / 30);
    if (cut.t % 18 === 0) playSound('clang', 0.7, cut.t % 36 ? 6 : -2);
    if (cut.t % 3 === 0) for (let n = 0; n < TELL_SPARKS; n++) state.particles.push({ pos: { x: cpx + (Math.random() - 0.5) * 8, y: DECK + 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 14 + Math.random() * 10, color: n % 2 ? '#FDE047' : '#FB923C', size: 2 });
    if (cut.t >= cut.tell) {
      cut.phase = 'drift'; cut.t = 0; cut.v = 0;
      playSound('crack', 1, -6); playSound('clang', 1, -10); shakeScreen(state, 5, 3);
    }
    return;
  }
  // (the drift back: slow, then faster and faster)
  cut.v -= 0.034 + Math.max(0, -cut.v) * 0.004;
  cut.off += cut.v;
  shiftCars(state, tr, cut.k, cut.v);
  if (cut.t % 8 === 0) for (let n = 0; n < 2; n++) state.particles.push({ pos: { x: cpx - 6, y: DECK + 2 }, vel: { x: -1 - Math.random() * 2, y: -Math.random() * 2 }, life: 16, color: '#FDE047', size: 2 });
  if (cut.off < -560) derail(ctx, tr, cut.k);
};

const startCut = (state: GameState, tr: Train, k: number, tell: number) => {
  tr.cut = { k, phase: 'tell', t: 0, tell, v: 0, off: 0 };
  tr.ledgerT = 0;
  playSound('clang', 1, 0);
  tubeSay(state, TUBE_UNCOUPLE, undefined, false);
};

/** Cut the tender loose (left too long at the engine). */
export const cutTender = (state: GameState, tell: number) => {
  const tr = trainOf(state);
  if (tr.cut) return;
  tr.cut = { k: ENGINE - 1, phase: 'tell', t: 0, tell, v: 0, off: 0 };
  playSound('clang', 1, 0);
};
/** Called off (he shot Tucker in the middle of it): what's dropped back stays where it's got to. */
export const cancelCut = (state: GameState) => {
  const tr = trainOf(state);
  tr.cut = null;
};

/** The cut-off end's gone off the line: tumbling away; him still on it, dead; anybody on it, gone. */
const derail = (ctx: FrameContext, tr: Train, k: number) => {
  const { state } = ctx, p = state.player, cut = tr.cut!;
  const edge = carRight(k) + COUPLER / 2 + cut.off;
  const cx = p.pos.x + p.width / 2;
  // (the wrecks: the cars near the screen, flipping off the line)
  for (let i = tr.rear; i <= k; i++) {
    const x = CAR_X[i] + cut.off;
    if (x + CARS[i].len < state.camera.x - 200 || x > state.camera.x + CANVAS_WIDTH + 200) continue;
    tr.wrecks.push({ x, y: DECK, vx: -4 - Math.random() * 3, vy: -6 - (k - i) * 1.5 - Math.random() * 3, rot: 0, vr: -0.03 - Math.random() * 0.05, kind: CARS[i].kind, len: CARS[i].len, t: 0 });
  }
  const onIt = cx < edge && p.health > 0 && !p.inCutscene;
  playSound('crash', 1, -8); playSound('boom', 0.8, -14);
  shakeScreen(state, onIt ? 16 : 8, onIt ? 7 : 4);
  for (let n = 0; n < 30; n++) state.particles.push({ pos: { x: edge - 80 - Math.random() * 200, y: DECK - Math.random() * 100 }, vel: { x: -2 - Math.random() * 6, y: -3 - Math.random() * 7 }, life: 40 + Math.random() * 30, color: n % 3 ? '#8A5A30' : '#3F3F46', size: 3 + Math.random() * 3 });
  // (whoever's on it: gone with it)
  for (const e of [...state.enemies]) {
    const ex = e.pos.x + e.width / 2;
    if (ex >= edge || e.type === 'boss') continue;
    if (e.health > 0 && e.seen) hazardKill(ctx, e, edge, 'DERAILED!', { fling: { x: -9, y: -12 } });
    else if (e.health > 0) state.enemies = state.enemies.filter(o => o !== e);
  }
  for (let i = tr.rear; i <= k; i++) { tr.cars[i].gone = true; for (const b of tr.cars[i].blocks) b.y = AWAY; }
  state.pickups = state.pickups.filter(q => q.pos.x > edge || q.pos.y < DECK - 200);
  tr.rear = k + 1;
  tr.cutsDone.add(k);
  tr.cut = null;
  if (onIt) {
    // (flung off with it, ass over teakettle, into the wreck: the death screen's)
    p.invincibilityTimer = 0;
    p.vel.x = -7; p.vel.y = -15;
    for (let n = 0; n < 24; n++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + 20 }, vel: { x: (Math.random() - 0.7) * 9, y: -Math.random() * 9 }, life: 50, color: n % 2 ? '#B91C1C' : '#7F1D1D', size: 3 + Math.random() * 3 });
    playSound('screams', 0.8, 0); playSound('splat', 1, -4);
    hurtPlayer(ctx, 9999, 'm2:fr_derail');
    return;
  }
  tubeSay(state, TUBE_MISSED);
  if (!tr.said.cut) { tr.said.cut = true; meatheadSays(state, pickLine(byPants(state, TRAIN_GAGS.cut))); }
};

/** The tracks under the train: down on them while it's moving, he's under the wheels (and so is anybody else). */
export const updateTracks = (ctx: FrameContext, x0: number, x1: number) => {
  const { state } = ctx, tr = trainOf(state), p = state.player;
  if (tr.phase !== 'ride') return;
  const cx = p.pos.x + p.width / 2;
  if (p.health > 0 && !p.inCutscene && cx > x0 && cx < x1 && p.pos.y + p.height >= GY - 3 && p.vel.y >= 0) {
    p.invincibilityTimer = 0;
    for (let n = 0; n < 30; n++) state.particles.push({ pos: { x: cx, y: GY - 10 }, vel: { x: -3 - Math.random() * 8, y: -Math.random() * 6 }, life: 40, color: n % 2 ? '#B91C1C' : '#7F1D1D', size: 3 + Math.random() * 4 });
    playSound('splat', 1, -6); playSound('crunch', 1, -8);
    hurtPlayer(ctx, 9999, 'm2:fr_tracks');
  }
  for (const e of [...state.enemies]) {
    if (e.health <= 0 || e.type === 'boss' || e.enemyType === 'flyer') continue;
    const ex = e.pos.x + e.width / 2;
    if (ex < x0 || ex > x1 || e.pos.y + e.height < GY - 3) continue;
    if (e.seen) hazardKill(ctx, e, ex + 40, 'RUN OVER!', { fling: { x: -12, y: -8 }, sound: 'splat' });
    else state.enemies = state.enemies.filter(o => o !== e);
  }
};
