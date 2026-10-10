// THE CLOCK TOWER: section 5 of Spooky Land. Out of the red-mist hallway into the ELEVATOR TO HELL's loading bay.
// HOW THE RIDE WORKS is on the wall (board the car, up the clock tower, drop to hell, exit through the gift shop), the
// line's in its switchbacks, a car loads at the platform and rolls off into the foot of the tower. The ride operator
// won't let him on (clean / shitty / naked, every way he is), and calls security (out of the CAST MEMBERS ONLY door).
// So in through the tower's maintenance door, and up the inside of it, floor by floor (layout.ts): the clock's works
// out to get him (hazards.ts: gears, pendulums, cuckoo clocks; what the wobble shakes loose), the park's staff in their
// monster-mash costumes and the clock's own bell-ringers (kinds.ts), the car going up its shaft behind him (ride.ts).
// A support beam on every floor, floor to ceiling, LOAD-BEARING. DO NOT RAM: charged into (any of his charge moves;
// not his guns) they break, and the tower wobbles worse for each one (the world sways about: worldTilt; only the
// drawing, everything still moves and lands upright). The main support's in the clock room at the top: that one out,
// the car comes down so hard it goes through the floor into the real hell (a cutscene: the camera down after it, the
// nets snapping, the grate and the floor under it smashed through). Then he's free to jump down the shaft after it,
// the long fall, out the bottom into the hell section (DOORS.hell.start). The cars keep coming, and keep going down
// for good, every one of them, from then on (revisits too). Nobody cares.
//
// Backtrackable: out the bay's left end to the hallway; back from hell, he's put by the hole on the tower's ground
// floor (DOORS.tower.end); the beams stay out, the floors' shaft crossings are jumps once the nets are gone.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import type { SpookySection } from '../section';
import { layOwn, solid, ledge, endWalls, runExits, teleport, hands, meatheadSays, saidOver, spookyState } from '../section';
import { DOORS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { makeKindEnemy, kindDef } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { talk, stepTalk, pick, type Talk } from '../../adventure/queue/talk';
import { TK, updateThrown, drawThrown, thrown } from './kinds';
import { runHazards, drawDebris, storyOf, type Debris } from './hazards';
import { newRide, runRide, type Ride, type Car } from './ride';
import { drawTowerBackdrop, drawTowerBack } from './art';
import {
  x0, x1, HOW_BOARD_X, ASK_X, BOOTH_X, STAFF_DOOR_X, TX0, TX1, WALL, SH0, SH1, SHM, DOOR_H, F, STORY, STORIES, SLAB, TOP, ROOF, B1, HELL_AT,
  LEDGES, BEAMS, beamTop, slabRuns, CUCKOOS, FOES, SECURITY, CAR_TOP, type TowerFoe,
} from './layout';
import {
  type Dressed, MEATHEAD_HOW, MEATHEAD_ASK, OPERATOR_REFUSE, MEATHEAD_REFUSED, OPERATOR_SECURITY, OPERATOR_SPIEL, OPERATOR_AFTER, OPERATOR_NEXT,
  RIDER_DROP, RIDER_REAL, MEATHEAD_BEAM_SIGN, MEATHEAD_BEAM_BROKE, MEATHEAD_WOBBLE, MEATHEAD_MAIN, MEATHEAD_CRASH, MEATHEAD_JUMP,
} from './lines';

const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const OP = 'm2.hellop';

// ---------------------------------------------------------------------------------------------------------------
// Its state

interface Crash { t: number; phase: 'fall' | 'hold' | 'back'; hold: number }
interface Tower {
  talk: Talk; ride: Ride;
  beamHp: number[]; beamMove: number[];
  crashed: boolean; nets: boolean[]; grate: boolean; b1: boolean;
  debris: Debris[];
  how: boolean; asked: boolean; securityOut: boolean; afterSaid: boolean; signSaid: boolean; mainSaid: boolean; jumped: boolean;
  spielAt: number; wobbleAt: number; wobbleN: number;
  opSaid: string | null; riderSaid: string | null;
  /** The lurch (a spring: kicked by every beam hit). */
  sway: number; swayV: number;
  crash: Crash | null;
  /** The camera's ours: following him down the shaft. */
  fallCam: boolean;
  rumbleAt: number;
  inited?: boolean;
  /** Frames since it was built (since he started again). */
  age?: number;
}
const towerOf = (state: GameState) => spookyState<Tower>(state, 'tower', () => ({
  talk: talk(), ride: newRide(), beamHp: BEAMS.map(b => b.hp), beamMove: BEAMS.map(() => -1),
  crashed: false, nets: Array(STORIES + 1).fill(true), grate: true, b1: true, debris: [],
  how: false, asked: false, securityOut: false, afterSaid: false, signSaid: false, mainSaid: false, jumped: false,
  spielAt: -99999, wobbleAt: 0, wobbleN: 0, opSaid: null, riderSaid: null, sway: 0, swayV: 0, crash: null, fallCam: false, rumbleAt: 0,
}));
const brokenOf = (t: Tower) => t.beamHp.filter(h => h <= 0).length;

/** Beams already out, starting again from a checkpoint (they're in order up the tower: one per floor). */
const beamsBefore = (cp: number) => (cp >= 45 ? BEAMS.length : cp >= 44 ? 6 : cp >= 43 ? 4 : cp >= 42 ? 2 : 0);

// ---------------------------------------------------------------------------------------------------------------
// Checkpoints. The stage passes one when he's right of its x; up here they're by floor, so a checkpoint only counts on
// its own floor (and the drop's only once the car's gone through).

const CPS: SpookySection['checkpoints'] = [
  { name: 'THE LOADING BAY', cp: 40, x: x0 + 200, y: GY },
  { name: 'THE CLOCK TOWER', cp: 41, x: TX0 + 80, y: GY },
  { name: 'THE PENDULUM', cp: 42, x: TX0 + 175, y: F(2) },
  { name: 'THE TOWER, FLOOR 5', cp: 43, x: TX0 + 190, y: F(4) },
  { name: 'THE CLOCK ROOM', cp: 44, x: TX0 + 200, y: TOP },
  { name: 'THE DROP', cp: 45, x: SH0 - 130, y: TOP },
];
const where = { feet: Infinity, crashed: false, live: false };
const passable = (c: SpookySection['checkpoints'][number]) => where.feet <= c.y + 12 && where.feet > c.y - STORY + 40 && (c.cp !== 45 || where.crashed);

// ---------------------------------------------------------------------------------------------------------------
// Building it

const FOE_KIND: Record<TowerFoe, string> = { igor: TK.igor, mummy: TK.mummy, bride: TK.bride, ringer: TK.ringer, wolfman: 'm2:town_wolfman', monster: 'm2:town_monster' };
/** (the town's wolfman and monster, in the mix: if the town's not got them, an igor and a mummy in their place) */
const kindFor = (f: TowerFoe) => {
  const k = FOE_KIND[f];
  if (kindDef(k as EnemyKind)) return k;
  return f === 'wolfman' ? TK.igor : f === 'monster' ? TK.mummy : k;
};
const spawn = (state: GameState, f: TowerFoe, x: number, floor: number, i: number) => {
  const e: Enemy = makeKindEnemy(kindFor(f) as EnemyKind, x, floor);
  e.variant = i; e.facing = -1;
  // (a bride takes her time over the first throw: never one already in the air at him as he starts again)
  if (f === 'bride') e.aiTimer = -150;
  state.enemies.push(e);
  return e;
};

const NET = (k: number) => `tw-net-${k}`;
const BEAM = (i: number) => `tw-beam-${i}`;

// ---------------------------------------------------------------------------------------------------------------
// The beams: his charge moves into one

const moving = (state: GameState) => {
  const p = state.player;
  return p.isCharging || p.isSliding || p.isUppercutting || !!p.isDivekicking;
};
const runBeams = (ctx: FrameContext, t: Tower) => {
  const { state } = ctx, p = state.player;
  if (!moving(state) || p.inCutscene) return;
  const mid = p.moveId ?? 0;
  BEAMS.forEach((b, i) => {
    if (t.beamHp[i] <= 0 || t.beamMove[i] === mid) return;
    const top = beamTop(b), bot = F(b.k);
    const hit = p.pos.x - 14 < b.x + b.w && p.pos.x + p.width + 14 > b.x && p.pos.y - 6 < bot && p.pos.y + p.height + 6 > top;
    if (!hit) return;
    t.beamMove[i] = mid;
    t.beamHp[i]--;
    const dir = p.pos.x + p.width / 2 < b.x + b.w / 2 ? 1 : -1;
    playSound('crack', 1, -4); playSound('crunch', 0.8, -8);
    shakeScreen(state, 10, 6);
    t.swayV += dir * 0.005;
    const hy = Math.min(bot - 20, Math.max(top + 20, p.pos.y + p.height / 2));
    for (let j = 0; j < 14; j++) state.particles.push({ pos: { x: b.x + b.w / 2, y: hy + (Math.random() - 0.5) * 40 }, vel: { x: -dir * (1 + Math.random() * 4), y: -2 - Math.random() * 3 }, life: 30, color: b.look === 'wood' ? '#B45309' : '#94A3B8', size: 2 + Math.random() * 3, grav: 0.3, chunk: true });
    // (he bounces off it, the move spent)
    if (p.isCharging) { p.isCharging = false; p.isSliding = false; p.chargeTimer = 0; p.vel.x = -dir * 4; }
    if (p.isDivekicking) { p.isDivekicking = false; p.vel.y = -8; p.vel.x = -dir * 3; }
    if (t.beamHp[i] > 0) return;
    // Out: the block's gone, the tower lurches
    state.blocks = state.blocks.filter(k => k.tag !== BEAM(i));
    playSound('crash', 1, -6); playSound('rumble', 0.8);
    shakeScreen(state, 30, 9);
    t.swayV += dir * 0.012;
    for (let j = 0; j < 30; j++) state.particles.push({ pos: { x: b.x + Math.random() * b.w, y: top + Math.random() * (bot - top) }, vel: { x: (Math.random() - 0.5) * 8, y: -3 - Math.random() * 4 }, life: 40, color: b.look === 'wood' ? '#92400E' : '#64748B', size: 3 + Math.random() * 4, grav: 0.3, chunk: true });
    if (i === BEAMS.length - 1) { startCrash(state, t); return; }
    t.talk.q.push({ voice: 'meathead', text: pick(MEATHEAD_BEAM_BROKE[Math.min(i, MEATHEAD_BEAM_BROKE.length - 1)]) });
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The crash: the last beam out, the car comes down through everything into the real hell

const startCrash = (state: GameState, t: Tower) => {
  const p = state.player;
  t.crash = { t: 0, phase: 'fall', hold: 0 };
  p.inCutscene = true; p.vel.x = 0;
  playSound('boom', 1, -10); playSound('crash', 1, -12);
  shakeScreen(state, 50, 12);
  t.swayV += 0.02;
  // (the cable goes: the car, wherever it is in the shaft; or (a white flash over it) the one waiting at the top)
  const r = t.ride;
  if (!r.car || (r.car.phase !== 'rise' && r.car.phase !== 'hold' && r.car.phase !== 'drop')) {
    const old = r.car;
    r.car = { phase: 'drop', t: 0, x: SHM, y: CAR_TOP, vy: 0, riders: old?.riders ?? [0, 1, 2, 3].map(i => ({ seed: 9100 + i * 53, woman: i % 2 === 0, boardAt: 0 })), real: true, crash: true };
  }
  const c = r.car;
  c.phase = 'drop'; c.t = 0; c.real = true; c.crash = true; c.vy = Math.max(c.vy, 2); c.x = SHM;
  r.held = false;
  for (const e of state.enemies) { e.puppet = true; e.pauseTimer = 2; }
};

/** Everything the car smashes on its way down (also what a skip puts right in one go). */
const breakNet = (state: GameState, t: Tower, k: number, quiet = false) => {
  if (!t.nets[k]) return;
  t.nets[k] = false;
  state.blocks = state.blocks.filter(b => b.tag !== NET(k));
  if (quiet) return;
  playSound('crack', 0.8, 6);
  for (let j = 0; j < 12; j++) state.particles.push({ pos: { x: SH0 + Math.random() * (SH1 - SH0), y: F(k) }, vel: { x: (Math.random() - 0.5) * 6, y: Math.random() * 4 }, life: 50, color: '#D6D3D1', size: 2, grav: 0.2 });
};
const breakGrate = (state: GameState, t: Tower, quiet = false) => {
  if (!t.grate) return;
  t.grate = false;
  state.blocks = state.blocks.filter(b => b.tag !== 'tw-grate');
  if (quiet) return;
  playSound('crash', 1, -8); shakeScreen(state, 20, 10);
  for (let j = 0; j < 24; j++) state.particles.push({ pos: { x: SH0 + Math.random() * (SH1 - SH0), y: GY }, vel: { x: (Math.random() - 0.5) * 10, y: -4 - Math.random() * 6 }, life: 50, color: j % 2 ? '#3F3F46' : '#A1A1AA', size: 3 + Math.random() * 4, grav: 0.35, chunk: true });
};
const breakB1 = (state: GameState, t: Tower, quiet = false) => {
  if (!t.b1) return;
  t.b1 = false;
  state.blocks = state.blocks.filter(b => b.tag !== 'tw-b1');
  if (quiet) return;
  playSound('boom', 1, -14); shakeScreen(state, 30, 12);
  for (let j = 0; j < 40; j++) state.particles.push({ pos: { x: SH0 + Math.random() * (SH1 - SH0), y: B1 }, vel: { x: (Math.random() - 0.5) * 12, y: -6 - Math.random() * 8 }, life: 60, color: j % 3 ? '#F97316' : '#3F0D0D', size: 3 + Math.random() * 5, grav: 0.35, chunk: j % 3 === 0 });
};
const smashAll = (state: GameState, t: Tower) => { for (let k = 1; k <= STORIES; k++) breakNet(state, t, k); breakGrate(state, t); breakB1(state, t); };

const endCrash = (state: GameState, t: Tower, skipped: boolean) => {
  const p = state.player;
  if (skipped) { silenceAll(); smashAll(state, t); if (t.ride.car?.crash) { t.ride.car = null; t.ride.next = 240; } }
  t.crash = null; t.crashed = true;
  p.inCutscene = false;
  state.cameraOverride = null;
  if (skipped) { state.camera.x = Math.max(TX0, Math.min(TX1 + 60 - CANVAS_WIDTH, p.pos.x + p.width / 2 - CANVAS_WIDTH / 2)); state.camera.y = p.pos.y + p.height - 470; }
  for (const e of state.enemies) e.puppet = false;
  if (state.checkpoint < 45) state.checkpoint = 45;
  t.talk.q.length = 0;
  meatheadSays(state, pick(MEATHEAD_CRASH));
};

const camX = (x: number) => Math.max(TX0, Math.min(TX1 + 60 - CANVAS_WIDTH, x - CANVAS_WIDTH / 2));

const runCrash = (ctx: FrameContext, t: Tower): Controls => {
  const { state } = ctx, p = state.player, cr = t.crash!;
  cr.t++;
  p.inCutscene = true;
  for (const e of state.enemies) { e.puppet = true; e.pauseTimer = 2; }
  if (cr.t > SKIP_AFTER) offerSkip();
  if (cr.t > SKIP_AFTER && takeSkip()) { endCrash(state, t, true); return hands(); }
  const car = t.ride.car;
  if (cr.phase === 'fall') {
    // (a beat on the lurch first, then down after it)
    if (car && cr.t > 24) state.cameraOverride = { x: camX(SHM), y: Math.min(car.y - 330, GY - 120) };
    if (cr.t === 30) t.talk.q.push({ voice: Math.random() < 0.5 ? 'm2.guest' : 'm2.guest2', text: pick(RIDER_REAL), set: s => { t.riderSaid = s; } });
    if (!car || car.y > B1 + 200) { cr.phase = 'hold'; cr.hold = 0; }
  } else if (cr.phase === 'hold') {
    state.cameraOverride = { x: camX(SHM), y: GY - 120 };
    if (++cr.hold > 80) cr.phase = 'back';
  } else {
    const ty = p.pos.y + p.height - 470;
    state.cameraOverride = { x: camX(p.pos.x + p.width / 2), y: ty };
    if (Math.abs(state.camera.y - ty) < 30) endCrash(state, t, false);
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// The loading bay's talk

const opSays = (t: Tower, text: string, then?: () => void) => t.talk.q.push({ voice: OP, text, set: s => { t.opSaid = s; }, then });

const runBay = (state: GameState, t: Tower) => {
  const p = state.player, cx = p.pos.x + p.width / 2, d = dressed(state);
  const before = state.checkpoint < 41 && !t.crashed;
  if (cx > TX0) return;
  if (before && !t.how && Math.abs(cx - HOW_BOARD_X) < 180) { t.how = true; for (const s of MEATHEAD_HOW) t.talk.q.push({ voice: 'meathead', text: s }); }
  if (before && !t.asked && cx > ASK_X) {
    t.asked = true;
    t.talk.q.push({ voice: 'meathead', text: pick(MEATHEAD_ASK) });
    opSays(t, pick(OPERATOR_REFUSE[d]));
    t.talk.q.push({ voice: 'meathead', text: pick(MEATHEAD_REFUSED) });
    opSays(t, pick(OPERATOR_SECURITY[d]), () => {
      if (t.securityOut || state.checkpoint >= 41) return;
      t.securityOut = true;
      playSound('slam', 0.8);
      // (out the door and straight at him: the igor walking, the wolfman howling and running)
      SECURITY.forEach((f, i) => { const e = spawn(state, f, STAFF_DOOR_X - i * 50, GY, 90 + i); e.facing = -1; e.aiState = f === 'igor' ? 'walk' : 'howl'; e.aiTimer = -i * 40; });
    });
  }
  if (t.crashed && !t.afterSaid && Math.abs(cx - BOOTH_X) < 160 && !t.talk.busy && !t.talk.q.length) { t.afterSaid = true; opSays(t, pick(OPERATOR_AFTER[d])); }
};

// ---------------------------------------------------------------------------------------------------------------

const AMP = [0, 0.005, 0.01, 0.016, 0.022, 0.028, 0.035, 0.045];
/** How much of the sway he's in (none out in the bay; it comes on through the tower's door). */
const inTower = (state: GameState) => Math.max(0, Math.min(1, (state.player.pos.x + state.player.width / 2 - (TX0 - 300)) / 300));

export const tower: SpookySection = {
  id: 'tower', x0, x1,
  get checkpoints() { return where.live ? CPS.filter(passable) : CPS; },
  build: (state) => {
    towerOf(state);
    // (nothing passes a checkpoint on the first frame: where he is isn't known till the stage has put him there)
    where.live = true; where.feet = Infinity;
    thrown.length = 0;
    // Ground: the bay's floor and the tower's, the shaft's hole between (the grate over it, the ride's hell's floor under it)
    layOwn(state, [
      { x1: x0 - 200, y1: GY, x2: SH0, y2: GY, surface: 'stone' },
      { x1: SH1, y1: GY, x2: x1 + 200, y2: GY, surface: 'wood' },
    ]);
    const n0 = state.blocks.length;
    endWalls(state, 'tower');
    solid(state, SH0, GY, SH1 - SH0, 40, { tag: 'tw-grate' });
    solid(state, SH0, B1, SH1 - SH0, 40, { tag: 'tw-b1' });
    // The tower: its walls (the maintenance door at the foot of the left one), its roof, its floors, the nets
    solid(state, TX0 - WALL, ROOF - 200, WALL, GY - DOOR_H - (ROOF - 200));
    solid(state, TX1, ROOF - 200, WALL, GY - (ROOF - 200));
    solid(state, TX0, ROOF - 40, TX1 - TX0, 40);
    for (let k = 1; k <= STORIES; k++) {
      for (const [a, b] of slabRuns(k)) solid(state, a, F(k), b - a, SLAB);
      solid(state, SH0, F(k), SH1 - SH0, SLAB, { tag: NET(k) });
    }
    for (const [x, y, w] of LEDGES) ledge(state, x, y, w);
    BEAMS.forEach((b, i) => solid(state, b.x, beamTop(b), b.w, F(b.k) - beamTop(b), { tag: BEAM(i) }));
    for (let i = n0; i < state.blocks.length; i++) state.blocks[i].hidden = true;
    // Who's in it
    FOES.forEach(([f, x, floor], i) => spawn(state, f, x, floor, i));
    CUCKOOS.forEach(([x, y], i) => {
      const e = makeKindEnemy(TK.cuckoo as EnemyKind, x, y);
      e.pos.x = x - e.width / 2; e.pos.y = y - 17 - e.height / 2; e.homeX = e.pos.x; e.homeY = e.pos.y; e.variant = 50 + i;
      state.enemies.push(e);
    });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player;
    const t = towerOf(state);
    const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    // (the first frame: as it was at the checkpoint he's starting from (the stage only says which once it's built). Past
    // a floor, its beam's out; past the drop, or back from hell, it's all been smashed)
    if (!t.inited) {
      t.inited = true;
      const before = beamsBefore(state.checkpoint);
      BEAMS.forEach((_, i) => { if (i < before) { t.beamHp[i] = 0; state.blocks = state.blocks.filter(b => b.tag !== BEAM(i)); } });
      if (state.checkpoint >= 45) { t.crashed = true; t.nets.fill(true); t.grate = true; t.b1 = true; for (let k = 1; k <= STORIES; k++) breakNet(state, t, k, true); breakGrate(state, t, true); breakB1(state, t, true); }
    }
    where.feet = feet; where.crashed = t.crashed; where.live = true;
    stepTalk(state, t.talk);
    // (the sway's spring)
    t.swayV += -t.sway * 0.02; t.swayV *= 0.95; t.sway += t.swayV;
    // The ride runs whatever he's doing (held at the top for the clock room's drop, while that's to come)
    t.ride.held = !t.crashed && !t.crash && brokenOf(t) >= BEAMS.length - 1;
    runRide(state, t.ride, t.crashed || !!t.crash, {
      loading: () => {
        if (cx < TX0 && !t.talk.busy && !t.talk.q.length && state.frame - t.spielAt > 1500 && t.asked) { t.spielAt = state.frame; opSays(t, pick(OPERATOR_SPIEL)); }
      },
      dropped: (car: Car) => {
        const nearCar = Math.abs(cx - car.x) < 900 && Math.abs(p.pos.y - car.y) < 700;
        if (nearCar && !car.crash && !t.talk.busy && !t.talk.q.length && Math.random() < 0.6) t.talk.q.push({ voice: Math.random() < 0.5 ? 'm2.guest' : 'm2.guest2', text: pick(car.real ? RIDER_REAL : RIDER_DROP), set: s => { t.riderSaid = s; } });
        if (car.real && !car.crash && cx < TX0 && !t.talk.busy && !t.talk.q.length) opSays(t, pick(OPERATOR_NEXT));
      },
      passing: (car: Car, from: number, to: number) => {
        if (!car.crash) return;
        for (let k = 1; k <= STORIES; k++) if (from < F(k) && to >= F(k) - 10) breakNet(state, t, k);
        if (to >= GY - 10) breakGrate(state, t);
        if (to >= B1 - 10) breakB1(state, t);
      },
    });
    if (t.ride.car?.crash && t.ride.car.y > HELL_AT + 500) { t.ride.car = null; t.ride.next = 240; }
    if (t.crash) return runCrash(ctx, t);
    // The way back to the hallway
    runExits(state, [{ x0: x0 - 40, x1: x0 + 60, yTop: GY - 40, yBot: GY + 2, to: DOORS.mist.end }]);
    runBay(state, t);
    updateThrown(ctx);
    // (just started again: a moment before anything's shaken loose over him)
    t.age = (t.age ?? 0) + 1;
    runHazards(ctx, t.debris, t.age > 240 ? brokenOf(t) : 0);
    runBeams(ctx, t);
    if (t.crash) return hands();
    const k = storyOf(state);
    // What he says: at the first beam's plaque, at the main support, now and then as it gets worse
    if (!t.signSaid && k === 0 && Math.abs(cx - BEAMS[0].x) < 240 && t.beamHp[0] > 0) { t.signSaid = true; t.talk.q.push({ voice: 'meathead', text: MEATHEAD_BEAM_SIGN[0] }); }
    if (!t.mainSaid && k === STORIES && t.beamHp[BEAMS.length - 1] > 0) { t.mainSaid = true; t.talk.q.push({ voice: 'meathead', text: pick(MEATHEAD_MAIN) }); }
    const broken = brokenOf(t);
    if (broken >= 3 && !t.crashed && k >= 0 && state.frame - t.wobbleAt > 1800 && !t.talk.busy && !t.talk.q.length) {
      t.wobbleAt = state.frame;
      t.talk.q.push({ voice: 'meathead', text: MEATHEAD_WOBBLE[t.wobbleN++ % MEATHEAD_WOBBLE.length] });
    }
    // (the tower groaning now and then, worse the more beams are out)
    if (broken >= 2 && k >= 0 && state.frame - t.rumbleAt > 600 - broken * 50) { t.rumbleAt = state.frame; playSound('rumble', 0.25 + broken * 0.06); shakeScreen(state, 20 + broken * 4, 1 + broken * 0.6); }
    // Down the shaft, once it's open: the camera after him all the way, and out the bottom into the real hell
    const inShaft = !t.grate && cx > SH0 - 4 && cx < SH1 + 4;
    if (inShaft && !p.isGrounded && p.vel.y > 2) {
      if (!t.jumped && feet < GY - 300) { t.jumped = true; meatheadSays(state, pick(MEATHEAD_JUMP), false); }
      t.fallCam = true;
      state.cameraOverride = { x: camX(cx), y: p.pos.y - 260 };
    } else if (t.fallCam && (p.isGrounded || !inShaft)) { t.fallCam = false; state.cameraOverride = null; }
    if (inShaft && feet > HELL_AT) {
      const vy = p.vel.y;
      t.fallCam = false; state.cameraOverride = null; t.jumped = false;
      teleport(state, DOORS.hell.start.x, DOORS.hell.start.y);
      p.vel.y = Math.max(8, vy);
      return controls;
    }
    return controls;
  },
  cameraX: () => ({ min: x0, max: TX1 + 60 - CANVAS_WIDTH }),
  cameraRow: (state) => (inTower(state) > 0.5 ? 470 : undefined),
  worldTilt: (state) => {
    const t = towerOf(state), r = inTower(state);
    if (r <= 0) return null;
    const n = Math.min(AMP.length - 1, brokenOf(t)), A = AMP[n], f = state.frame;
    const slow = A * Math.sin((f / 200) * Math.PI * 2), fast = n >= 4 ? A * 0.3 * Math.sin((f / 67) * Math.PI * 2 + 1) : 0;
    const angle = r * (slow + fast + t.sway);
    if (Math.abs(angle) < 0.0005) return null;
    // (about a point under the middle of the screen: it sways as well as tips)
    return { x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 + 260, angle };
  },
  drawBackdrop: (c) => { drawTowerBackdrop(c); return true; },
  drawBack: (c, state) => {
    const t = towerOf(state);
    drawTowerBack(c, state, { ride: t.ride, broken: brokenOf(t), beamHp: t.beamHp, crashed: t.crashed, nets: t.nets, grate: t.grate, b1: t.b1, opTalking: !!t.opSaid });
  },
  drawFront: (c, state) => {
    const t = towerOf(state);
    drawDebris(c, t.debris);
    drawThrown(c);
    if (t.opSaid) saidOver(c, t.opSaid, BOOTH_X, GY - 176, '#FCA5A5');
    const car = t.ride.car;
    if (t.riderSaid && car) saidOver(c, t.riderSaid, car.x, car.y - 140, '#FDE68A');
  },
  drawHud: (c, state) => {
    const t = towerOf(state), cr = t.crash;
    if (!cr) return;
    // (the white of the lurch, the letterbox)
    if (cr.t < 14) { c.fillStyle = `rgba(255,255,255,${1 - cr.t / 14})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    const bar = Math.min(44, cr.t * 3);
    c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
    if (cr.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  },
};
