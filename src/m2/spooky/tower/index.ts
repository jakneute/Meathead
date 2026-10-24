// THE CLOCK TOWER: section 5 of Spooky Land, and the land's one real there-and-back: up the tower from its foot, and
// all the way back down it, past the foot, and under it.
//
// THE LOADING BAY. Up out of the dungeon into the ELEVATOR TO HELL's loading bay: HOW THE RIDE WORKS on the wall
// (board the car, up the clock tower, drop to hell, exit through the gift shop), the line in its switchbacks, a car
// loading at the platform and rolling off into the foot of the tower. The ride operator won't let him on (clean /
// shitty / naked) and calls security (out of the CAST MEMBERS ONLY door). So in through the tower's maintenance door.
//
// UP (layout.ts): floor by floor, a zigzag. On every floor a support beam, floor to ceiling, on the half he comes in on
// (LOAD-BEARING. DO NOT RAM): only his charge moves break it (shoulder charge, slide, uppercut, dive kick: not his
// guns), and he can't get by till it's out. Each one out, the tower sways worse (the world tilts and swings about:
// worldTilt, only the drawing; everything moves and lands upright), it groans and shakes, and from the third, bits of
// it come down on him. Taught one at a time, then mixed: the beam (floor 1), the igor's pitchfork and the cuckoos
// (2), the pendulum and the mummy (3), the bell ringer and a gear in the floor (4), the lot (5, 6); the car going up
// its shaft behind him. The main support's in the clock room: that one out, the car comes down so hard it goes
// through every net, the grate at the foot and the floor under that, into the real hell (a cutscene: the camera down
// after it), and every floor it passes sags, caves in or jams with wreckage (WRECK).
//
// DOWN: back down through what he climbed, wrecked. The shaft's open in places and jammed in others: down it where he
// can, out across the floors where it's jammed (one caved in to the floor under it; sagging floors to the gaps), the
// staff regrouped against him (DESCENT_FOES), the pendulums swinging wild, floor 2's down with its blade stuck in the
// floor. And the cars keep coming: the shaft's red DROP lamps flash (the tell) and one comes down past him, shedding
// shoes and purses on whoever's in the shaft. Down to the ground floor where he came in (the bay through the door),
// into the hole the car made: the ride's "hell" under the floor (the camera pulls out: the bay with its line still
// boarding, the tower's foot, the hole), down the chute under it into the real hell (DOORS.hell.start).
//
// Backtrackable: out the bay's left end to the hallway; back from hell, he's put on the tower's ground floor by the
// hole (DOORS.tower.end); everything stays wrecked.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import type { SpookySection } from '../section';
import { layOwn, solid, ledge, endWalls, teleport, hands, meatheadSays, saidOver, spookyState } from '../section';
import { DOORS, GY, SECTIONS } from '../geometry';
import { floorTopAt } from '../../../m1/game/core/terrain';
/** Down the DOWN shaft, he lands in hell's pit here (hell's agent: anywhere hell.x0+500..880 at its start's height). */
const HELL_SECOND_X = SECTIONS.hell.x0 + 820;
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { makeKindEnemy, kindDef } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { silenceAll, isTalking } from '../../../m1/game/platform/speech';
import { startFreefall, stepFreefall, drawFallDark } from '../freefall';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { talk, stepTalk, pick, type Talk } from '../../adventure/queue/talk';
import { updateLadders, drawLadders, type LadderDef } from '../../moves/ladders';
import { TK, updateThrown, drawThrown, thrown } from './kinds';
import { runHazards, drawDebris, storyOf, canHurt, cover, clearView, worksKill, type Debris } from './hazards';
import { newRide, runRide, lampOn, upCar, loadedCar, type Ride, type Car } from './ride';
import { drawTowerBackdrop, drawTowerBack } from './art';
import { useDoor } from '../dungeon/stairs';
import {
  x0, x1, ENTRY_DOOR_X, HOW_BOARD_X, ASK_X, BOOTH_X, STAFF_DOOR_X, BAY_TOP, TX0, TX1, U, WALL, SH0, SH1, SHM, SHX, SHU, SHD, CH0, CH1, DOOR_H, F, STORY, STORIES, SLAB, TOP, ROOF, B1,
  HELL_AT, LEDGES, SHELF, CHUTE_LEDGES, BEAMS, beamTop, WHOLE, WRECK, JAMS, pieceY, floorAt, CUCKOOS, FOES, DESCENT_FOES, SECURITY, PICKUPS, CAR_TOP,
  LIFT, liftY, ROTTEN, TORN_NET, LADDER_SPOTS, type TowerFoe, type FoeAt, type Piece,
} from './layout';
import {
  type Dressed, MEATHEAD_HOW, MEATHEAD_ASK, OPERATOR_REFUSE, MEATHEAD_REFUSED, OPERATOR_SECURITY, OPERATOR_SPIEL, OPERATOR_AFTER, OPERATOR_NEXT,
  RIDER_DROP, RIDER_REAL, RIDER_RISE, MEATHEAD_BEAM_SIGN, MEATHEAD_BEAM_BROKE, MEATHEAD_WOBBLE, MEATHEAD_MAIN, MEATHEAD_CRASH, MEATHEAD_JUMP,
  MEATHEAD_DOWN, MEATHEAD_LAMP, MEATHEAD_BASE, MEATHEAD_CHUTE,
} from './lines';

const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const OP = 'm2.hellop';

// ---------------------------------------------------------------------------------------------------------------
// Its state

interface Crash { t: number; phase: 'fall' | 'hold' | 'back'; hold: number }
interface Tower {
  talk: Talk; ride: Ride;
  beamHp: number[]; beamMove: number[];
  /** The car's gone through (everything's wrecked: the way down). */
  crashed: boolean;
  /** The nets across the shaft still up (by floor), each floor wrecked yet, the grate at the foot, the ride's hell's floor. */
  nets: boolean[]; wrecked: boolean[]; grate: boolean; b1: boolean;
  debris: Debris[];
  how: boolean; asked: boolean; securityOut: boolean; afterSaid: boolean; signSaid: boolean; mainSaid: boolean;
  downSaid: boolean; lampSaid: boolean; baseSaid: boolean; chuteSaid: boolean; jumped: boolean; leftTop: boolean;
  spielAt: number; wobbleAt: number; wobbleN: number;
  opSaid: string | null; riderSaid: string | null;
  /** The lurch (a spring: kicked by every beam hit). */
  sway: number; swayV: number;
  crash: Crash | null;
  /** The camera's ours: following him down the shaft. */
  fallCam: boolean;
  rumbleAt: number;
  inited?: boolean;
  /** The move he was last seen in (moveId). */
  lastMove?: number;
  /** Frames since it was built (since he started again). */
  age: number;
  /** How far the camera's pulled out (the bay seen from the hole), eased. */
  pull: number;
  /** Floor 5's rotten boards: 0 whole, >0 cracking (frames), <0 gone (frames till it's back). */
  rot: number[];
  /** The town's staff held unseeing behind a beam. */
  blinded: Set<Enemy>;
  /** Diving down a shaft into hell (the cinematic): which shaft's middle. */
  dive?: { x: number; vx: number };
  /** Where his feet last were on something (the lip he went over into the shaft from). */
  lip?: number;
  /** The car whose riders are saying something. */
  riderCar?: Car;
  /** He's seen a car go first thing in the tower (one sent up the shaft as he comes in). */
  firstCar?: boolean;
}
const towerOf = (state: GameState) => spookyState<Tower>(state, 'tower', () => ({
  talk: talk(), ride: newRide(), beamHp: BEAMS.map(b => b.hp), beamMove: BEAMS.map(() => -1),
  crashed: false, nets: Array(STORIES + 1).fill(true), wrecked: Array(STORIES + 1).fill(false), grate: true, b1: true, debris: [],
  how: false, asked: false, securityOut: false, afterSaid: false, signSaid: false, mainSaid: false,
  downSaid: false, lampSaid: false, baseSaid: false, chuteSaid: false, jumped: false, leftTop: false,
  spielAt: -99999, wobbleAt: 0, wobbleN: 0, opSaid: null, riderSaid: null, sway: 0, swayV: 0, crash: null, fallCam: false, rumbleAt: 0, age: 0, pull: 0, rot: ROTTEN.boards.map(() => 0), blinded: new Set(),
}));
const brokenOf = (t: Tower) => t.beamHp.filter(h => h <= 0).length;

/** What's been wrecked in the tower, kept through his deaths (the stage, and every section's state, is built anew on
 *  each): the beams he's broken, the rotten boards gone, the crash. Cleared only when he starts again from before the
 *  tower (a new run through it). */
const kept = { beams: BEAMS.map(() => false), rot: [false, false, false, false], crashed: false };
/** Beams already out, starting again from a checkpoint (they're in order up the tower: one per floor). */
const beamsBefore = (cp: number) => (cp >= 45 ? BEAMS.length : cp >= 44 ? 6 : cp >= 43 ? 4 : cp >= 42 ? 2 : 0);

// ---------------------------------------------------------------------------------------------------------------
// Checkpoints. The stage passes one when he's right of its x; up here they're by floor, so a checkpoint only counts on
// its own floor (and the way down's only once the car's gone through).

const CPS: SpookySection['checkpoints'] = [
  { name: 'THE LOADING BAY', cp: 40, x: x0 + 200, y: GY },
  { name: 'THE CLOCK TOWER', cp: 41, x: TX0 + 80, y: GY },
  // (left of the pendulum's sweep (U 225 on): not under the end of its swing)
  { name: 'THE PENDULUM', cp: 42, x: U(180), y: F(2) },
  { name: 'THE TOWER, FLOOR 5', cp: 43, x: U(220), y: F(4) },
  { name: 'THE CLOCK ROOM', cp: 44, x: U(205), y: TOP },
  { name: 'THE WAY DOWN', cp: 45, x: U(300), y: TOP },
  { name: 'HALFWAY DOWN', cp: 46, x: U(400), y: F(2) },
  { name: 'BACK AT THE BASE', cp: 47, x: U(1100), y: GY },
];
const where = { feet: Infinity, crashed: false, live: false };
const passable = (c: SpookySection['checkpoints'][number]) => where.feet <= c.y + 12 && where.feet > c.y - STORY + 40 && (c.cp < 45 || where.crashed);

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
const spawnAll = (state: GameState, list: FoeAt[], wrecked: boolean, base: number) =>
  list.forEach(([f, u, y, k], i) => spawn(state, f, U(u), y === 'floor' ? floorAt(k, u, wrecked) : y, base + i));
/** Ours (not the cuckoos): the way up's (0..), security (90..), the way down's (200..). */
const isFoe = (e: Enemy) => (e.variant ?? -1) < 50 || ((e.variant ?? 0) >= 90 && (e.variant ?? 0) < 100);

/** The ladders: before the crash, and after (the hatch's is gone with floor 6's sag; one hangs off floor 5's cave-in). */
const LADDERS_UP: LadderDef[] = LADDER_SPOTS.filter(l => l.after !== true).map(({ x, top, bottom, ledge }) => ({ x, top, bottom, ledge }));
const LADDERS_DOWN: LadderDef[] = LADDER_SPOTS.filter(l => l.after !== false).map(({ x, top, bottom, ledge }) => ({ x, top, bottom, ledge }));

const NET = (k: number) => `tw-net-${k}`;
const BEAM = (i: number) => `tw-beam-${i}`;
const WHOLE_TAG = (k: number) => `tw-whole-${k}`;

/** A stretch of floor into the world: flat, one block; sagging, a block every few px (he walks it either way). */
const layPiece = (state: GameState, k: number, p: Piece, tag: string) => {
  if (p[2] === p[3]) { solid(state, U(p[0]), F(k) + p[2], p[1] - p[0], SLAB, { tag, hidden: true }); return; }
  for (let u = p[0]; u < p[1]; u += 12) solid(state, U(u), pieceY(k, p, u + 6), Math.min(12, p[1] - u), SLAB, { tag, hidden: true });
};

const addPickups = (state: GameState, after: boolean) => {
  for (const [u, y, type, only] of PICKUPS) if (only === after) state.pickups.push({ id: `tower-${u}-${y}`, pos: { x: U(u) - 10, y: y - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
};

// ---------------------------------------------------------------------------------------------------------------
// The beams: his charge moves into one

const moving = (state: GameState) => {
  const p = state.player;
  return p.isCharging || p.isSliding || p.isUppercutting || !!p.isDivekicking;
};
const runBeams = (ctx: FrameContext, t: Tower) => {
  const { state } = ctx, p = state.player;
  const mid = p.moveId ?? 0;
  // (a move started since last frame: a charge started flush against a beam is over (the wall stops it) before we see it)
  const fresh = mid !== t.lastMove;
  t.lastMove = mid;
  if ((!moving(state) && !fresh) || p.inCutscene) return;
  BEAMS.forEach((b, i) => {
    if (t.beamHp[i] <= 0 || t.beamMove[i] === mid) return;
    const top = beamTop(b), bot = F(b.k);
    const hit = p.pos.x - 14 < b.x + b.w && p.pos.x + p.width + 14 > b.x && p.pos.y - 6 < bot && p.pos.y + p.height + 6 > top;
    if (!hit) return;
    // (a charge or a slide has to be at it, not away from it)
    const toward = (b.x + b.w / 2 > p.pos.x + p.width / 2 ? 1 : -1) === (p.chargeFace ?? p.facing);
    if (!p.isUppercutting && !p.isDivekicking && !toward) return;
    t.beamMove[i] = mid;
    t.beamHp[i]--;
    const dir = p.pos.x + p.width / 2 < b.x + b.w / 2 ? 1 : -1;
    playSound('crack', 1, -4); playSound('crunch', 0.8, -8);
    shakeScreen(state, 10, 6);
    t.swayV += dir * 0.005;
    const hy = Math.min(bot - 20, Math.max(top + 20, p.pos.y + p.height / 2));
    for (let j = 0; j < 14; j++) state.particles.push({ pos: { x: b.x + b.w / 2, y: hy + (Math.random() - 0.5) * 40 }, vel: { x: -dir * (1 + Math.random() * 4), y: -2 - Math.random() * 3 }, life: 30, color: b.look === 'wood' ? '#B45309' : '#94A3B8', size: 2 + Math.random() * 3, grav: 0.3, chunk: true });
    // (dust down off the ceiling with it)
    for (let j = 0; j < 10; j++) state.particles.push({ pos: { x: b.x - 60 + Math.random() * (b.w + 120), y: top + 2 }, vel: { x: 0, y: 1 + Math.random() }, life: 50, color: '#A8A29E', size: 2, grav: 0.05 });
    // (he bounces off it, the move spent)
    if (p.isCharging) { p.isCharging = false; p.isSliding = false; p.chargeTimer = 0; p.vel.x = -dir * 4; }
    if (p.isDivekicking) { p.isDivekicking = false; p.vel.y = -8; p.vel.x = -dir * 3; }
    if (t.beamHp[i] > 0) return;
    kept.beams[i] = true;
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
// The crash: the last beam out, the car comes down through everything into the real hell, and wrecks the tower

const startCrash = (state: GameState, t: Tower) => {
  const p = state.player;
  t.crash = { t: 0, phase: 'fall', hold: 0 };
  p.inCutscene = true; p.vel.x = 0;
  playSound('boom', 1, -10); playSound('crash', 1, -12);
  shakeScreen(state, 50, 12);
  t.swayV += 0.02;
  // (the cable goes: the car, wherever it is in the shaft; or (a white flash over it) the one waiting at the top)
  const r = t.ride;
  // (both shafts' cars go together, side by side from the top: the one creeping up, the one about to drop)
  let up = r.cars.find(c => c.phase === 'rise' || c.phase === 'top');
  let down = r.cars.find(c => c.phase === 'cross' || c.phase === 'hold' || (c.phase === 'drop' && !c.real));
  if (!up) { up = loadedCar(r, 'drop', SHU, CAR_TOP); r.cars.push(up); }
  if (!down) { down = loadedCar(r, 'drop', SHD, CAR_TOP); r.cars.push(down); }
  for (const [c, x] of [[up, SHU], [down, SHD]] as [Car, number][]) { c.phase = 'drop'; c.t = 0; c.real = true; c.crash = true; c.vy = 2; c.x = x; c.y = CAR_TOP; }
  r.held = false;
  for (const e of state.enemies) { e.puppet = true; e.pauseTimer = 2; }
};

/** Floor k, as the car goes through it: the net's gone, the floor sags or caves in, wreckage jams the shaft. */
const wreckFloor = (state: GameState, t: Tower, k: number, quiet = false) => {
  if (t.wrecked[k]) return;
  t.wrecked[k] = true; t.nets[k] = false;
  state.blocks = state.blocks.filter(b => !b.tag?.startsWith(NET(k)) && b.tag !== WHOLE_TAG(k) && !(k === ROTTEN.k && b.tag?.startsWith('tw-rot')));
  if (k === ROTTEN.k) t.rot.fill(0);
  for (const p of WRECK[k]) layPiece(state, k, p, `tw-wreck-${k}`);
  if (JAMS.includes(k)) solid(state, SH0, F(k), SH1 - SH0, SLAB, { tag: `tw-jam-${k}`, hidden: true });
  if (quiet) return;
  playSound('crack', 0.9, 4); playSound('crumble', 0.8);
  for (let j = 0; j < 26; j++) state.particles.push({ pos: { x: TX0 + Math.random() * (TX1 - TX0), y: F(k) + 10 }, vel: { x: (Math.random() - 0.5) * 6, y: Math.random() * 3 }, life: 60, color: j % 3 ? '#A8A29E' : '#D6D3D1', size: 2 + Math.random() * 2, grav: 0.15 });
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
/** Everything after: the floors wrecked, the hole open, the staff regrouped for the way down, its pickups. */
const afterCrash = (state: GameState, t: Tower, quiet: boolean) => {
  for (let k = 1; k <= STORIES; k++) wreckFloor(state, t, k, quiet);
  breakGrate(state, t, quiet); breakB1(state, t, quiet);
  // (the shelf out over the UP shaft goes with the rest: nothing between the top and hell)
  state.blocks = state.blocks.filter(b => !(b.x === SHELF[0] && b.y === SHELF[1]));
  t.crashed = true;
  // (a car being unloaded in the ride's hell as its floor goes: down the hole with the rest)
  for (const c of t.ride.cars) if (c.phase === 'unload' || c.phase === 'return') { c.phase = 'drop'; c.real = true; c.vy = 2; c.t = 0; if (!c.riders.length) c.riders = []; }
  // (the tower's own staff only: hell's and everybody else's further along are left be)
  state.enemies = state.enemies.filter(e => !(e.kind?.startsWith('m2:') && isFoe(e) && e.health > 0 && e.pos.x + e.width / 2 >= x0 && e.pos.x + e.width / 2 <= x1));
  spawnAll(state, DESCENT_FOES, true, 200);
  addPickups(state, true);
};

const endCrash = (state: GameState, t: Tower, skipped: boolean) => {
  const p = state.player;
  if (skipped) { silenceAll(); t.ride.cars = t.ride.cars.filter(c => !c.crash); }
  afterCrash(state, t, true);
  t.crash = null;
  p.inCutscene = false;
  state.cameraOverride = null;
  if (skipped) { state.camera.x = camX(p.pos.x + p.width / 2); state.camera.y = p.pos.y + p.height - 470; }
  for (const e of state.enemies) e.puppet = false;
  if (state.checkpoint < 45) state.checkpoint = 45;
  kept.crashed = true;
  t.talk.q.length = 0;
  meatheadSays(state, pick(MEATHEAD_CRASH));
};

/** How far he falls down the shaft, gone in his own way (walked off the lip or jumped), before it's out of his hands. */
const DIVE_AFTER = 130;
/** In he went, and he's committed: the fall's pose (his cannonball, whatever he hollers), and what he hollers if nobody's
 *  still talking (his line about the crash, say: it's dropped then, never said over it or late). */
const leap = (state: GameState, t: Tower) => {
  startFreefall(state.player, '', true);
  if (t.jumped) return;
  t.jumped = true;
  const saying = isTalking() || (state.playerVulgarityTimer > 0 && !!state.playerLastVulgarity);
  if (!saying) meatheadSays(state, pick(MEATHEAD_JUMP), true);
};

const camX = (x: number) => Math.max(TX0 - WALL, Math.min(TX1 + 60 - CANVAS_WIDTH, x - CANVAS_WIDTH / 2));

const runCrash = (ctx: FrameContext, t: Tower): Controls => {
  const { state } = ctx, p = state.player, cr = t.crash!;
  cr.t++;
  p.inCutscene = true;
  for (const e of state.enemies) { e.puppet = true; e.pauseTimer = 2; }
  if (cr.t > SKIP_AFTER) offerSkip();
  if (cr.t > SKIP_AFTER && takeSkip()) { endCrash(state, t, true); return hands(); }
  const car = t.ride.cars.find(c => c.crash);
  if (cr.phase === 'fall') {
    // (a beat on the lurch first, then down after it)
    if (car && cr.t > 24) state.cameraOverride = { x: camX(SHM), y: Math.min(car.y - 330, GY - 120) };
    if (cr.t === 30) t.talk.q.push({ voice: Math.random() < 0.5 ? 'm2.guest' : 'm2.guest2', text: pick(RIDER_REAL), set: s => { t.riderSaid = s; t.riderCar = car; } });
    if (!car || car.y > B1 + 200) { cr.phase = 'hold'; cr.hold = 0; }
  } else if (cr.phase === 'hold') {
    state.cameraOverride = { x: camX(SHM), y: GY - 120 };
    if (++cr.hold > 80) cr.phase = 'back';
  } else {
    // (back up past every floor it wrecked, to him)
    const ty = p.pos.y + p.height - 470;
    state.cameraOverride = { x: camX(p.pos.x + p.width / 2), y: ty };
    if (Math.abs(state.camera.y - ty) < 30) endCrash(state, t, false);
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Floor 3's counterweight (he rides it), floor 5's rotten boards (they go under him)

const runLift = (state: GameState) => {
  const b = state.blocks.find(k => k.tag === 'tw-lift');
  if (!b) return;
  const p = state.player, ny = liftY(state.frame), dy = ny - b.y;
  const on = p.isGrounded && Math.abs(p.pos.y + p.height - b.y) < 4 && p.pos.x + p.width > b.x && p.pos.x < b.x + b.w;
  b.y = ny;
  if (on) p.pos.y += dy;
  // (the chain ratcheting as it goes, when he's by it)
  if (state.frame % 12 === 0 && Math.abs(p.pos.y - ny) < 500 && Math.abs(p.pos.x - b.x) < 600) playSound('click', 0.15, -12);
};
const runRotten = (state: GameState, t: Tower) => {
  if (t.crashed) return;
  const p = state.player, feet = p.pos.y + p.height, y = F(ROTTEN.k);
  ROTTEN.boards.forEach(([a, b], i) => {
    const tag = `tw-rot-${i}`;
    // (gone: gone for good; the climb's still there by the shaft's net and the ledges over it)
    if (t.rot[i] < 0) return;
    const on = p.isGrounded && Math.abs(feet - y) < 3 && p.pos.x + p.width > U(a) + 4 && p.pos.x < U(b) - 4;
    if (t.rot[i] === 0 && on) { t.rot[i] = 1; playSound('crack', 0.6, 8); }
    else if (t.rot[i] > 0 && ++t.rot[i] > 28) {
      state.blocks = state.blocks.filter(k => k.tag !== tag);
      t.rot[i] = -1; kept.rot[i] = true;
      playSound('crack', 0.9, -2); playSound('crumble', 0.7);
      for (let j = 0; j < 12; j++) state.particles.push({ pos: { x: U(a) + Math.random() * (b - a), y: y + 6 }, vel: { x: (Math.random() - 0.5) * 3, y: 1 + Math.random() * 3 }, life: 50, color: j % 2 ? '#5B3A1A' : '#3F2812', size: 4 + Math.random() * 5, grav: 0.3, chunk: true });
    }
  });
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
// The way down: the cars still coming down the shaft (what comes off them hits whoever's in it), the lines

const inColumn = (state: GameState) => { const cx = state.player.pos.x + state.player.width / 2; return cx > SH0 - 8 && cx < SH1 + 8; };
/** In the shaft a car's in (the UP one or the DOWN one). */
const inCarColumn = (state: GameState, car: Car) => Math.abs(state.player.pos.x + state.player.width / 2 - car.x) < 84;
const runDescent = (ctx: FrameContext, t: Tower) => {
  const { state } = ctx, p = state.player, feet = p.pos.y + p.height;
  const k = storyOf(state);
  for (const car of t.ride.cars) runCarPast(ctx, t, car, k, feet);
  // The lines on the way down (below)
  descentLines(state, t, k, feet);
};
const runCarPast = (ctx: FrameContext, t: Tower, car: Car, k: number, feet: number) => {
  const { state } = ctx, p = state.player;
  // The tell: the lamps (art), the bell; and his line the first time
  if (car.real && !car.crash && car.phase === 'hold' && car.t === 1 && (k >= 0 || feet > GY)) {
    playSound('alarm', 0.35, 4); playSound('ding', 0.5, -6);
    if (!t.lampSaid && t.leftTop) { t.lampSaid = true; t.talk.q.push({ voice: 'meathead', text: pick(MEATHEAD_LAMP) }); }
  }
  // The car going by: what comes off it (a shoe, a purse, the lap bar), on him if he's in the shaft as it passes
  if (car && car.real && !car.crash && car.phase === 'drop') {
    const passing = car.y > p.pos.y && car.y - 150 < feet;
    if (passing && Math.abs(car.y - feet) < 40) playSound('whoosh', 0.8, -8);
    if (passing && !car.hit && inCarColumn(state, car) && canHurt(state)) {
      car.hit = true;
      const dir = p.pos.x + p.width / 2 < car.x ? -1 : 1;
      hurtPlayer(ctx, 10, 'tower_car', { x: dir * 8, y: -5 });
      playSound('thud', 0.9); playSound('crash', 0.5, 6);
      for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + 10 }, vel: { x: (Math.random() - 0.5) * 8, y: -3 - Math.random() * 3 }, life: 40, color: ['#7F1D1D', '#FBBF24', '#1D4ED8', '#F5F5F4'][i % 4], size: 3 + Math.random() * 3, grav: 0.3, chunk: true });
    }
  }
  // (and whoever's been knocked into the shaft as it goes by: run over by the ride)
  if (car && car.real && !car.crash && car.phase === 'drop') for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.type === 'boss' || e.kind?.endsWith('cuckoo')) continue;
    const ex = e.pos.x + e.width / 2;
    if (Math.abs(ex - car.x) < 80 && car.y > e.pos.y && car.y - 150 < e.pos.y + e.height) worksKill(ctx, e, car.x, 'NEXT!');
  }
};
const descentLines = (state: GameState, t: Tower, k: number, feet: number) => {
  const p = state.player;
  if (k >= 0 && k < STORIES) t.leftTop = true;
  if (!t.downSaid && k === 5 && p.isGrounded) { t.downSaid = true; t.talk.q.push({ voice: 'meathead', text: pick(MEATHEAD_DOWN) }); }
  if (!t.baseSaid && t.leftTop && k === 0 && p.isGrounded && p.pos.x + p.width / 2 > SH1) { t.baseSaid = true; t.talk.q.push({ voice: 'meathead', text: pick(MEATHEAD_BASE) }); }
  if (!t.chuteSaid && feet > B1 + 80) { t.chuteSaid = true; meatheadSays(state, pick(MEATHEAD_CHUTE), false); }
};

// The ride during the climb (safe: nets and the shaft's lattice keep him out of its way): its riders going up past
// him, nervous; coming down, screaming; the first car sent up the moment he's in, so he sees one go right away

const runRideClimb = (state: GameState, t: Tower) => {
  const p = state.player, k = storyOf(state);
  if (k < 0) return;
  if (!t.firstCar) {
    t.firstCar = true;
    // (one already on its way up, above where he can see from the foot: it'll drop a few seconds in)
    if (!upCar(t.ride)) t.ride.cars.push(loadedCar(t.ride, 'rise', SHU, Math.max(CAR_TOP + 100, F(Math.min(STORIES, k + 4)))));
  }
  for (const car of t.ride.cars) {
    if (car.phase !== 'rise' || car.saidUp || Math.abs(car.y - 60 - (p.pos.y + p.height / 2)) > 160) continue;
    car.saidUp = true;
    if (!t.talk.busy && !t.talk.q.length && Math.random() < 0.5) t.talk.q.push({ voice: Math.random() < 0.5 ? 'm2.guest' : 'm2.guest2', text: pick(RIDER_RISE), set: s => { t.riderSaid = s; t.riderCar = car; } });
  }
};

// ---------------------------------------------------------------------------------------------------------------

const AMP = [0, 0.005, 0.01, 0.016, 0.022, 0.028, 0.035, 0.045];
/** How much of the sway he's in (none out in the bay; it comes on through the tower's door, and goes under it). */
const inTower = (state: GameState) => {
  const p = state.player, feet = p.pos.y + p.height;
  const across = Math.max(0, Math.min(1, (p.pos.x + p.width / 2 - (TX0 - 300)) / 300));
  return across * Math.max(0, Math.min(1, 1 - (feet - GY - 60) / 200));
};

export const tower: SpookySection = {
  id: 'tower', x0, x1,
  get checkpoints() { return where.live ? CPS.filter(passable) : CPS; },
  build: (state) => {
    const t = towerOf(state);
    // (nothing passes a checkpoint on the first frame: where he is isn't known till the stage has put him there)
    where.live = true; where.feet = Infinity;
    thrown.length = 0;
    // Ground: the bay's floor and the tower's; under the tower's middle, the ride's "hell" (B1) and the chute under it
    layOwn(state, [
      { x1: x0 - 200, y1: GY, x2: CH0, y2: GY, surface: 'stone' },
      { x1: CH1, y1: GY, x2: x1 + 200, y2: GY, surface: 'wood' },
    ]);
    // (the ground line goes on over the hole under the tower's middle, for the engine's sake: with none under him
    // there, it took him for jumping a crevasse, on any floor up the middle, and nobody would start on him. No block:
    // the hole's still a hole)
    state.groundRuns.push({ x1: CH0, y1: GY, x2: CH1, y2: GY, surface: 'wood' });
    const n0 = state.blocks.length;
    endWalls(state, 'tower');
    // (the loading bay's ceiling, its underside where it's drawn, out to the tower's wall: indoors, no way out up)
    solid(state, x0 - 200, BAY_TOP - 60, TX0 - WALL - (x0 - 200), 70);
    solid(state, CH0, GY, SH0 - CH0, 30); solid(state, SH1, GY, CH1 - SH1, 30);
    solid(state, SH0, GY, SH1 - SH0, 30, { tag: 'tw-grate' });
    solid(state, CH0, B1, SH0 - CH0, 30); solid(state, SH1, B1, CH1 - SH1, 30);
    solid(state, SH0, B1, SH1 - SH0, 30, { tag: 'tw-b1' });
    for (const [x, y, w] of CHUTE_LEDGES) ledge(state, x, y, w);
    // The tower: its walls (the maintenance door at the foot of the left one), its roof, its floors, the nets
    solid(state, TX0 - WALL, ROOF - 200, WALL, GY - DOOR_H - (ROOF - 200));
    solid(state, TX1, ROOF - 200, WALL, GY - (ROOF - 200));
    solid(state, TX0, ROOF - 40, TX1 - TX0, 40);
    for (let k = 1; k <= STORIES; k++) {
      for (const p of WHOLE[k]) layPiece(state, k, p, WHOLE_TAG(k));
      solid(state, SH0, F(k), SHX - SH0, SLAB, { tag: `${NET(k)}-up` });
      if (k !== TORN_NET) solid(state, SHX, F(k), SH1 - SHX, SLAB, { tag: `${NET(k)}-down` });
    }
    t.nets[TORN_NET] = false;
    ROTTEN.boards.forEach(([a, b], i) => solid(state, U(a), F(ROTTEN.k), b - a, SLAB, { tag: `tw-rot-${i}` }));
    ledge(state, LIFT.x, liftY(state.frame), LIFT.w, { tag: 'tw-lift' });
    for (const [x, y, w] of LEDGES) ledge(state, x, y, w);
    BEAMS.forEach((b, i) => solid(state, b.x, beamTop(b), b.w, F(b.k) - beamTop(b), { tag: BEAM(i) }));
    for (let i = n0; i < state.blocks.length; i++) state.blocks[i].hidden = true;
    // Who's in it (the way up's; the way down's come after the crash)
    spawnAll(state, FOES, false, 0);
    CUCKOOS.forEach(([x, y], i) => {
      const e = makeKindEnemy(TK.cuckoo as EnemyKind, x, y);
      e.pos.x = x - e.width / 2; e.pos.y = y - 17 - e.height / 2; e.homeX = e.pos.x; e.homeY = e.pos.y; e.variant = 50 + i;
      state.enemies.push(e);
    });
    addPickups(state, false);
    t.age = 0;
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player;
    const t = towerOf(state);
    // (the ladders first: what he does on one is theirs)
    if (!t.crash) controls = updateLadders(ctx, t.crashed ? LADDERS_DOWN : LADDERS_UP, controls);
    const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    // (the first frame: as it was at the checkpoint he's starting from (the stage only says which once it's built). Past
    // a floor, its beam's out; on the way down, or back from hell, it's all wrecked)
    if (!t.inited) {
      t.inited = true;
      const cp = state.checkpoint;
      // (a new run through the tower: nothing's broken yet; otherwise, as he left it, and at least as a run would have
      // left it by this checkpoint)
      if (cp < 40) { kept.beams.fill(false); kept.rot.fill(false); kept.crashed = false; }
      const before = beamsBefore(cp);
      BEAMS.forEach((_, i) => { if (i < before || kept.beams[i]) { kept.beams[i] = true; t.beamHp[i] = 0; state.blocks = state.blocks.filter(b => b.tag !== BEAM(i)); } });
      ROTTEN.boards.forEach((_, i) => { if (kept.rot[i]) { t.rot[i] = -1; state.blocks = state.blocks.filter(b => b.tag !== `tw-rot-${i}`); } });
      if (cp >= 45 || kept.crashed) {
        kept.crashed = true; afterCrash(state, t, true); t.leftTop = cp >= 46;
      }
    }
    where.feet = feet; where.crashed = t.crashed; where.live = true;
    if (p.isGrounded || t.lip === undefined) t.lip = feet;
    t.age++;
    // (nobody else starts anything while he's going down: his holler's heard)
    if (!t.dive) stepTalk(state, t.talk);
    // (the sway's spring)
    t.swayV += -t.sway * 0.02; t.swayV *= 0.95; t.sway += t.swayV;
    // The ride runs whatever he's doing (held at the top for the clock room's drop, while that's to come)
    t.ride.held = (!t.crashed && !t.crash && brokenOf(t) >= BEAMS.length - 1) || !!t.dive;
    // (and after the crash, while he's up top to go down a shaft, and all the way down it: nothing in either)
    t.ride.clear = t.crashed && (!!t.dive || feet < TOP + 200);
    runRide(state, t.ride, t.crashed || !!t.crash, {
      loading: () => {
        if (cx < TX0 && !t.talk.busy && !t.talk.q.length && state.frame - t.spielAt > 2400 && t.asked) { t.spielAt = state.frame; opSays(t, pick(OPERATOR_SPIEL)); }
      },
      dropped: (car: Car) => {
        const nearCar = Math.abs(cx - car.x) < 900 && Math.abs(p.pos.y - car.y) < 700;
        if (nearCar && !car.crash && !t.talk.busy && !t.talk.q.length && Math.random() < 0.45) t.talk.q.push({ voice: Math.random() < 0.5 ? 'm2.guest' : 'm2.guest2', text: pick(car.real ? RIDER_REAL : RIDER_DROP), set: s => { t.riderSaid = s; t.riderCar = car; } });
        if (car.real && !car.crash && cx < TX0 && !t.talk.busy && !t.talk.q.length) opSays(t, pick(OPERATOR_NEXT));
      },
      passing: (car: Car, from: number, to: number) => {
        if (!car.crash) return;
        for (let k = 1; k <= STORIES; k++) if (from < F(k) && to >= F(k) - 10) wreckFloor(state, t, k);
        if (to >= GY - 10) breakGrate(state, t);
        if (to >= B1 - 10) breakB1(state, t);
      },
    });
    t.ride.cars = t.ride.cars.filter(c => !(c.crash && c.y > HELL_AT + 500));
    if (t.crash) return runCrash(ctx, t);
    // The way back to the dungeon: its door at the bay's left end (walked on into: through, out of its other side, the
    // door at the dungeon's far end: dungeon/stairs.ts)
    if (useDoor(state, ENTRY_DOOR_X + 10, GY, -1, () => { teleport(state, DOORS.dungeon.end.x, DOORS.dungeon.end.y); p.facing = -1; })) return controls;
    runBay(state, t);
    updateThrown(ctx);
    runLift(state);
    runRotten(state, t);
    // (just started again: a moment before anything's shaken loose over him)
    // (the beams still up: cover; the town's staff in here don't see him through them either: held, unnoticing)
    cover.length = 0;
    BEAMS.forEach((b, i) => { if (t.beamHp[i] > 0) cover.push({ x0: b.x, x1: b.x + b.w, y0: beamTop(b), y1: F(b.k) }); });
    for (const e of state.enemies) {
      if (!e.kind?.startsWith('m2:town_') || e.health <= 0 || e.isBlownAway) continue;
      const blind = !clearView(e.pos.x + e.width / 2, e.pos.y + 12, cx, p.pos.y + p.height / 2);
      if (blind) { e.puppet = true; e.pauseTimer = 2; e.vel.x = 0; t.blinded.add(e); }
      else if (t.blinded.has(e)) { e.puppet = false; t.blinded.delete(e); }
    }
    runHazards(ctx, t.debris, t.age > 240 ? brokenOf(t) : 0, t.crashed);
    runBeams(ctx, t);
    if (t.crash) return hands();
    if (t.crashed) runDescent(ctx, t);
    else runRideClimb(state, t);
    const k = storyOf(state);
    // What he says: at the first beam's plaque, at the main support, now and then as it gets worse
    if (!t.signSaid && k === 0 && Math.abs(cx - BEAMS[0].x) < 240 && t.beamHp[0] > 0) { t.signSaid = true; t.talk.q.push({ voice: 'meathead', text: MEATHEAD_BEAM_SIGN[0] }); }
    if (!t.mainSaid && k === STORIES && t.beamHp[BEAMS.length - 1] > 0) { t.mainSaid = true; t.talk.q.push({ voice: 'meathead', text: pick(MEATHEAD_MAIN) }); }
    const broken = brokenOf(t);
    if (broken >= 3 && !t.crashed && k >= 0 && state.frame - t.wobbleAt > 2700 && !t.talk.busy && !t.talk.q.length) {
      t.wobbleAt = state.frame;
      t.talk.q.push({ voice: 'meathead', text: MEATHEAD_WOBBLE[t.wobbleN++ % MEATHEAD_WOBBLE.length] });
    }
    // (the tower groaning now and then, worse the more beams are out)
    if (broken >= 2 && k >= 0 && state.frame - t.rumbleAt > 600 - broken * 50) { t.rumbleAt = state.frame; playSound('rumble', 0.25 + broken * 0.06); shakeScreen(state, 20 + broken * 4, 1 + broken * 0.6); }
    // Down the shaft (or the hole under the foot, or the chute), once it's open: the camera after him down it
    const chute = feet > GY + 20 && cx > CH0 && cx < CH1;
    const dropping = t.crashed && (inColumn(state) || chute) && !p.isGrounded && p.vel.y > 2;
    // (in his own way, over the lip: his to there. A way down past it, and nothing under him from here to hell: that's
    // the dive. His hands off it, straight down the middle of the shaft, nothing hurts him (cars held, the shafts kept
    // clear of them meanwhile), the camera after him past the floors, the foot and the bay)
    const lipFloor = F(Math.max(0, Math.min(STORIES, Math.floor((GY - (t.lip ?? feet) + 70) / STORY))));
    const committed = feet > Math.max(t.lip ?? feet, lipFloor) + DIVE_AFTER;
    if (dropping && !t.dive && committed && inColumn(state) && floorTopAt(state.blocks, cx, feet, 0) === null) {
      t.dive = { x: cx < SHX ? SHU : SHD, vx: p.vel.x };
      p.isCharging = false; p.isSliding = false; p.isDivekicking = false; p.isUppercutting = false;
      leap(state, t);
    }
    if (t.dive) {
      p.inCutscene = true; p.invincibilityTimer = Math.max(p.invincibilityTimer, 30);
      // (the cuckoos sat in their clocks stay in them as he goes by: nothing out across the shaft at him)
      for (const e of state.enemies) if (e.kind === TK.cuckoo && e.health > 0 && !['pop', 'dart', 'back'].includes(e.aiState ?? '')) { e.puppet = true; e.pauseTimer = 2; }
      // (eased over to the middle of the shaft, on from however he went in: a damped spring, no snap)
      const d = t.dive;
      d.vx += (d.x - cx) * 0.01; d.vx *= 0.86;
      p.vel.x = 0; p.pos.x += d.vx;
      t.ride.held = true;
    }
    // (the fall's pose: on round; down on something short of hell (off the pose), back on his feet)
    if (p.freefall) { if (p.isGrounded && p.freefall.t > 4 && !t.dive) p.freefall = undefined; else stepFreefall(p, null); }
    if (dropping) {
      // (into the hole under the foot off to the side of the shafts, the chute: his holler as he goes; down a shaft, the
      // dive's)
      if (!t.jumped && feet > GY + 20 && !inColumn(state)) { t.jumped = true; meatheadSays(state, pick(MEATHEAD_JUMP), true); }
      t.fallCam = true;
      state.cameraOverride = { x: camX(cx), y: p.pos.y - 260 };
    } else if (t.fallCam) { t.fallCam = false; state.cameraOverride = null; }
    // (the camera pulled out going through the foot of the tower: the bay there through the door, the line still boarding)
    const pullTo = t.crashed && feet > GY - 200 && feet < B1 + 300 && cx > CH0 - 100 && cx < CH1 + 100 ? 1 : 0;
    t.pull += (pullTo - t.pull) * 0.08;
    if (t.crashed && chute && feet > HELL_AT) {
      const vy = p.vel.y;
      // (out the bottom into hell's pit: down the UP shaft at its start, down the DOWN shaft a little along from it)
      const down = (t.dive?.x ?? cx) >= SHX;
      t.fallCam = false; state.cameraOverride = null; t.jumped = false; t.pull = 0; t.dive = undefined;
      p.inCutscene = false; p.invincibilityTimer = Math.max(p.invincibilityTimer, 150);
      // (the camera just where it was on him: it's all dark down here, both sides of the cut, so it's one long fall)
      const camDx = state.camera.x - p.pos.x, camDy = state.camera.y - p.pos.y;
      teleport(state, down ? HELL_SECOND_X : DOORS.hell.start.x, DOORS.hell.start.y);
      p.vel.y = Math.max(8, vy);
      state.camera.x = p.pos.x + camDx; state.camera.y = p.pos.y + camDy;
      // (the tower's people, left behind up there, off the screen all at once: not knocked out of the world for it)
      for (const e of state.enemies) if (e.pos.x > TX0 - 400 && e.pos.x < TX1 + 400) { e.seen = false; if (e.kind === TK.cuckoo) e.puppet = false; }
      return hands();
    }
    return t.dive ? hands() : controls;
  },
  cameraX: () => ({ min: x0, max: TX1 + 60 - CANVAS_WIDTH }),
  cameraRow: (state) => (inTower(state) > 0.5 ? 470 : undefined),
  zoom: (state) => {
    const t = towerOf(state), p = state.player;
    if (t.pull < 0.01 || t.crash) return null;
    const k = t.pull * t.pull * (3 - 2 * t.pull);
    // (pulled well out, him eased right of the middle: the bay off to the left, through the tower's foot)
    return { scale: 1 - 0.45 * k, x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2, shiftX: 150 * k };
  },
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
  drawBackdrop: (c, state) => { drawTowerBackdrop(c, state); return true; },
  drawBack: (c, state) => {
    const t = towerOf(state);
    drawTowerBack(c, state, { rot: t.rot, ride: t.ride, broken: brokenOf(t), beamHp: t.beamHp, crashed: t.crashed, nets: t.nets, grate: t.grate, b1: t.b1, opTalking: !!t.opSaid, lamp: lampOn(t.ride, t.crashed) });
    drawLadders(c, state, t.crashed ? LADDERS_DOWN : LADDERS_UP);
    // (the chute going on down into the dark, to hell: black by the bottom, where it cuts to hell's shaft)
    if (t.crashed) drawFallDark(c, state, HELL_AT - 820, HELL_AT - 430, TX0 - WALL - 600, TX1 + 600);
  },
  drawFront: (c, state) => {
    const t = towerOf(state);
    drawDebris(c, t.debris);
    drawThrown(c);
    if (t.opSaid) saidOver(c, t.opSaid, BOOTH_X, GY - 176, '#FCA5A5');
    const car = t.riderCar;
    if (t.riderSaid && car) saidOver(c, t.riderSaid, car.x, car.y - 140, '#FDE68A');
    // (the elevator wrecked at the top: a big arrow bobbing over the shaft, pointing down it (the user's): that's the way)
    if (t.crashed && !t.dive && state.player.pos.y + state.player.height < TOP + 120) downArrow(c, SHM, TOP - 150 + Math.round(Math.sin(state.frame * 0.12) * 8), state.frame);
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

/** A down arrow (world: its point at (x, y)): fat, yellow, inked, blinking brighter now and then. */
const downArrow = (c: CanvasRenderingContext2D, x: number, y: number, f: number) => {
  const lit = (f >> 4) % 2 === 0;
  const shape = () => { c.beginPath(); c.moveTo(x, y); c.lineTo(x - 30, y - 30); c.lineTo(x - 12, y - 30); c.lineTo(x - 12, y - 62); c.lineTo(x + 12, y - 62); c.lineTo(x + 12, y - 30); c.lineTo(x + 30, y - 30); c.closePath(); };
  c.save();
  c.fillStyle = 'rgba(0, 0, 0, 0.35)'; c.translate(3, 3); shape(); c.fill(); c.translate(-3, -3);
  shape(); c.fillStyle = lit ? '#FDE047' : '#EAB308'; c.fill();
  c.lineWidth = 3; c.strokeStyle = '#1C1917'; c.stroke();
  c.fillStyle = lit ? '#FEF9C3' : '#FDE68A'; c.fillRect(x - 8, y - 58, 5, 26);
  c.restore();
};
