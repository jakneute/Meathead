// The cars as things to stand on, and Tucker cutting them loose. Each car's floor runs the length of it and halfway
// across the couplings either side (the plates meet: no falling between cars while they're coupled); a car he goes into
// has a roof over it (the ceiling inside, its top to stand on) and what's inside to climb (layout.ts fittings: racks,
// bunks, shelves, tables, crates, a hayloft); a car he only crosses has its load or its body to stand on (the logs, the
// ore, the tank, the boxcar's roof, the tender's coal); steps up the cars' ends get him onto the tall ones; the engine's
// cab is walled off (no way in: Tucker's in there). The bed under the train is the tracks: down there while it's moving,
// he's under the wheels.
//
// INSIDE IS INSIDE (the playtest: "enemies inside cars don't camp the doors and can only be killed when inside yourself
// and cannot be sniped from outside"): whoever's in a car he isn't in is out of the world (stashed: nothing reaches them,
// they reach nothing) and back where they were as he comes in; nothing flies through a car's walls either way (a shot
// fired in a car stays in it; one fired outside can't get in: his, theirs, the robbers').
//
// THE CUT (the user's: Tucker now and then uncouples the car he's on; dally and it derails, a silly violent death):
// a good way along a car that's marked for it, the tell (Tucker on the tube, the coupling ahead of him sparking and
// clanking, a red ! over it, the car shuddering), then the car and everything behind it drop back, slowing; a switch
// comes out from under the train behind it, its target flips red as the cut end reaches it (the points thrown under it)
// and the cut end goes off the line: the wheels jump the rails, it slews off down the near bank and goes over on its
// side (no explosion: the playtest). Still on it then: thrown off with it, dead (m2:fr_derail, its death screen).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { hazardKill } from '../../hazardHit';
import { ledge, solid, meatheadSays, byPants } from '../section';
import { GY } from '../geometry';
import { CARS, CAR_X, carRight, DECK, ROOF, CEIL, COUPLER, END, ENTERABLE, TOP, ENGINE, CHECKPOINTS, fittings } from './layout';
import { trainOf, type Train } from './state';
import { offOf, playerRoom, roomAt } from './where';
import { shiftBounds, riding, boarding } from './kinds';
import { tubeSay } from './tube';
import { inView } from './view';
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
      blocks.push(solid(state, x + END, ROOF, d.len - 2 * END, CEIL - ROOF, { hidden: true, tag: `tr-roof-${i}` }));
      if (d.kind === 'caboose') blocks.push(solid(state, x + d.len * 0.42, ROOF - 40, 84, 40, { hidden: true, tag: 'tr-cupola' }));
    } else if (d.kind === 'engine') {
      // (the cab's back: no way in, up to the sky; Tucker leans out over it)
      blocks.push(solid(state, x - 4, -4000, 16, 4000 + DECK, { hidden: true, tag: 'tr-cab' }));
    } else {
      const top = TOP[d.kind]!;
      blocks.push(solid(state, x + END, top, d.len - 2 * END, DECK - top, { hidden: true, tag: `tr-body-${i}` }));
      if (d.kind === 'tank') blocks.push(solid(state, x + d.len / 2 - 26, top - 18, 52, 18, { hidden: true, tag: 'tr-dome' }));
    }
    // (what's in it and on its ends to climb)
    for (const ft of fittings(i)) {
      if (ft.solid) blocks.push(solid(state, x + ft.x, DECK - ft.h, ft.w, ft.solid, { hidden: true, tag: `tr-fit-${i}` }));
      else blocks.push(ledge(state, x + ft.x, DECK - ft.h, ft.w, { hidden: true, tag: `tr-fit-${i}` }));
    }
    return { i, blocks, gone: false };
  });
};

export { offOf, carXNow, insideCar, playerRoom, roomAt, carAt } from './where';

// ---------------------------------------------------------------------------------------------------------------
// Inside is inside

/** The car each thing flying was fired in (-1: outside): it can't leave it, or get into another. */
const BORN = new WeakMap<object, number>();

/** Each frame: who's in a car he isn't in goes out of the world (and back as he comes in); nothing goes through walls. */
export const updateRooms = (ctx: FrameContext) => {
  const { state } = ctx, tr = trainOf(state);
  if (tr.phase === 'still') return;
  const pin = playerRoom(state, tr);
  // (out of the world: anybody in a car he isn't in)
  const keep: Enemy[] = [];
  for (const e of state.enemies) {
    if (e.health > 0 && !e.isBlownAway && e.type !== 'boss' && !riding(e) && !boarding(e)) {
      const r = roomAt(tr, e.pos.x + e.width / 2, e.pos.y + e.height - 2);
      if (r >= 0 && r !== pin) { tr.stash.push({ e, car: r }); continue; }
    }
    keep.push(e);
  }
  if (keep.length !== state.enemies.length) state.enemies = keep;
  // (...and back in it as he comes in, where they were)
  if (pin >= 0 && tr.stash.some(s => s.car === pin)) {
    for (const s of tr.stash) if (s.car === pin) { s.e.vel.x = 0; state.enemies.push(s.e); }
    tr.stash = tr.stash.filter(s => s.car !== pin);
  }
  // (nothing through the walls: what's fired in a car stays in it, what's fired outside stays out)
  let cut = false;
  for (const pj of state.projectiles) {
    const r = roomAt(tr, pj.pos.x + pj.width / 2, pj.pos.y + pj.height / 2);
    const born = BORN.get(pj);
    if (born === undefined) { BORN.set(pj, r); continue; }
    if (r !== born) { BORN.set(pj, -99); cut = true; }
  }
  if (cut) state.projectiles = state.projectiles.filter(pj => {
    if (BORN.get(pj) !== -99) return true;
    for (let n = 0; n < 3; n++) state.particles.push({ pos: { x: pj.pos.x + pj.width / 2, y: pj.pos.y + pj.height / 2 }, vel: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 }, life: 10, color: '#A8A29E', size: 2 });
    return false;
  });
  for (const s of tr.shots) {
    if (s.dead !== undefined || s.kind === 'cinder') continue;
    const r = roomAt(tr, s.x, s.y);
    if (s.room === undefined) s.room = r;
    else if (r !== s.room) s.dead = 0;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Moving the cut-off end

/** Stood on it? */
const onTop = (b: Block, x: number, w: number, feet: number, grounded: boolean) => grounded && Math.abs(feet - b.y) < 4 && x + w > b.x + 2 && x < b.x + b.w - 2;

/** Moves cars rear..k by dx, and whoever's stood on them (or out of the world in them), and what's lying on them. */
const shiftCars = (state: GameState, tr: Train, k: number, dx: number) => {
  const p = state.player, blocks: Block[] = [];
  for (let i = tr.rear; i <= k; i++) if (!tr.cars[i].gone) blocks.push(...tr.cars[i].blocks);
  if (!blocks.length) return;
  const x0 = Math.min(...blocks.map(b => b.x)), x1 = Math.max(...blocks.map(b => b.x + b.w));
  let him = false;
  const moved = new Set<Enemy>();
  for (const b of blocks) {
    if (!him && !p.carried && onTop(b, p.pos.x, p.width, p.pos.y + p.height, p.isGrounded)) him = true;
    for (const e of state.enemies) if (!moved.has(e) && e.enemyType !== 'flyer' && onTop(b, e.pos.x, e.width, e.pos.y + e.height, e.vel.y === 0)) moved.add(e);
  }
  for (const s of tr.stash) if (s.car <= k) moved.add(s.e);
  for (const b of blocks) b.x += dx;
  if (him) p.pos.x += dx;
  for (const e of moved) { e.pos.x += dx; if (e.homeX !== undefined) e.homeX += dx; shiftBounds(e, dx); }
  for (const q of state.pickups) if (q.pos.x > x0 && q.pos.x < x1 && q.pos.y < DECK + 10) q.pos.x += dx;
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const TELL_SPARKS = 4;
/** The switch comes out from under the train this far back of the cut end, once it's dropped back this far. */
const SW_LEAD = 240, SW_AFTER = -240;

/** The cut-off end's front truck (world x): what goes over the switch's points first. */
const frontTruck = (tr: Train, k: number) => carRight(k) + offOf(tr, k) - 70;

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
  // (the drift back: it's lost the engine, slowing; the world, and the switch, go by it slower and slower)
  cut.v -= 0.034 + Math.max(0, -cut.v) * 0.004;
  cut.off += cut.v;
  shiftCars(state, tr, cut.k, cut.v);
  if (cut.t % 8 === 0) for (let n = 0; n < 2; n++) state.particles.push({ pos: { x: cpx - 6, y: DECK + 2 }, vel: { x: -1 - Math.random() * 2, y: -Math.random() * 2 }, life: 16, color: '#FDE047', size: 2 });
  // (the switch: out from under the train in the gap behind it, coming back at the cut end with the ground)
  if (cut.sw === undefined && cut.off < SW_AFTER) cut.sw = cpx + SW_LEAD;
  if (cut.sw !== undefined) {
    cut.sw -= tr.v;
    const front = frontTruck(tr, cut.k);
    if (!cut.thrown && cut.sw - front < 150) { cut.thrown = true; playSound('clang', 1, -4); playSound('crack', 0.5, 6); }
    if (cut.sw <= front) derail(ctx, tr, cut.k);
  }
  // (it never just hangs about: well back, off it goes regardless)
  else if (cut.off < -1400) derail(ctx, tr, cut.k);
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

/** The cut-off end's gone off the line at the switch: sliding off the rails, over on its side down the near bank; him
 *  still on it, thrown off with it, dead; anybody on it, gone with it; anybody out of the world in it, quietly gone. */
const derail = (ctx: FrameContext, tr: Train, k: number) => {
  const { state } = ctx, p = state.player, cut = tr.cut!;
  const edge = carRight(k) + COUPLER / 2 + cut.off;
  const cx = p.pos.x + p.width / 2;
  // (the wrecks: every car near the screen slews off the rails, the front one first, and goes over)
  for (let i = tr.rear; i <= k; i++) {
    const x = CAR_X[i] + cut.off;
    if (!inView(state, x, x + CARS[i].len, 300)) continue;
    tr.wrecks.push({ x, y: 0, vx: cut.v, rot: 0, tip: 0, kind: CARS[i].kind, len: CARS[i].len, t: -(k - i) * 8, seed: i * 7 + 3 });
  }
  const onIt = cx < edge && p.health > 0 && !p.inCutscene && p.pos.y + p.height < GY - 4;
  playSound('crash', 1, -12); playSound('crunch', 1, -6); playSound('clang', 0.8, -14);
  shakeScreen(state, onIt ? 14 : 6, onIt ? 6 : 3);
  // (the wheels off the rails: sparks; the ballast thrown up; planks)
  for (let n = 0; n < 26; n++) {
    const sx = edge - 60 - Math.random() * 280, spark = n % 3 === 0;
    state.particles.push({ pos: { x: sx, y: GY - 12 - Math.random() * 20 }, vel: { x: (Math.random() - 0.7) * 6, y: -2 - Math.random() * 6 }, life: 24 + Math.random() * 30, color: spark ? '#FDE047' : n % 3 === 1 ? '#8A8278' : '#8A5A30', size: spark ? 2 : 3 + Math.random() * 2 });
  }
  // (whoever's on it: gone with it; whoever's out of the world in it: gone, never seen)
  for (const e of [...state.enemies]) {
    const ex = e.pos.x + e.width / 2;
    if (ex >= edge || e.type === 'boss' || riding(e) || boarding(e)) continue;
    if (e.health > 0 && e.seen) hazardKill(ctx, e, edge, 'DERAILED!', { fling: { x: -6, y: -8 } });
    else if (e.health > 0) state.enemies = state.enemies.filter(o => o !== e);
  }
  tr.stash = tr.stash.filter(s => s.car > k);
  for (let i = tr.rear; i <= k; i++) { tr.cars[i].gone = true; for (const b of tr.cars[i].blocks) b.y = AWAY; }
  state.pickups = state.pickups.filter(q => q.pos.x > edge || q.pos.y < ROOF - 200);
  tr.rear = k + 1;
  tr.cutsDone.add(k);
  tr.cut = null;
  if (onIt) {
    // (thrown off with it, ass over teakettle, down the bank into the wreck: the death screen's)
    p.invincibilityTimer = 0;
    p.vel.x = -6; p.vel.y = -12;
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
    if (e.health <= 0 || e.type === 'boss' || e.enemyType === 'flyer' || riding(e) || boarding(e)) continue;
    const ex = e.pos.x + e.width / 2;
    if (ex < x0 || ex > x1 || e.pos.y + e.height < GY - 3) continue;
    if (e.seen) hazardKill(ctx, e, ex + 40, 'RUN OVER!', { fling: { x: -12, y: -8 }, sound: 'splat' });
    else state.enemies = state.enemies.filter(o => o !== e);
  }
};
