// THE TUBE RIDES (THE BLACK HOLE, THE ABYSS): an inner tube down a long chute off a tall tower, high over a bottomless
// drop, the chute broken in places, aliens on hover discs riding along shooting at him.
//
// The owner's: "the tube ride should always 'stick' to meathead. you cannot lose it on any jump, floating or otherwise.
// it goes infinitely until you kill everything. you just gotta avoid the bottomless drops along the way", "it's kinda
// like an autorunner, this section. you cannot lose the tube, but you can fall on a misplaced jump", and "the tube ride
// should allow all actions like air grabs and other weapons if so desired. beatdowns and shakedowns are disabled. air
// grabs are risky high risk high reward moves. hopefully you don't land in the hole", then "charge moves disabled too,
// air grabs are not", then "disable all charge moves on the tube slides. just shooting or air grabs", and "the cape can
// still be used on the tube slide though".
//
// An autorunner: the chute carries him on at the ride's pace (a conveyor under him: the tube's stuck to his ass, drawn
// round him whatever he's doing; the Abyss's fast stretches: geo.ts tubeSpeedAt). On it he jumps, ducks, shoots (every
// gun, the switching, their own secondary fire) and air grabs (the alien and him come down together, where they come
// down: over a hole, down it); the cape's lift and float are his as anywhere (upgrades/gear.ts: in the air he's out of
// the seat). Nothing on B: no uppercut, dive kick, slide or shoulder charge, no beatdown or shakedown or their follow-ups
// (grab.ts setGroundGrabsOff). The chute's floor is a block kept under him at the chute's height (none over a gap: he
// drops). The gaps have to be jumped (a GAP sign before each, the chute's broken end striped); down one, he's gone into
// the dark, tube and all: the one way to die of the ride itself.
//
// The ride goes on till every alien of it's dead: the chute loops (from its loop's end he's carried back to its start,
// the same chute either side, everything round him carried with him: geo.ts course; never mid-grab), and once the last
// one's down the loop lets him go, on down into the splash pool: the tube's gone, he's in the water, on he swims.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block, Enemy, EnemyKind } from '../../../m1/types';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { setUi } from '../../store';
import { grabBusy, inPlay, setGroundGrabsOff } from '../../moves/grab';
import { TUBES, tubeSpeedAt, funnelSeat, type Tube } from './geo';
import { pathOf, surfaceAt, type Path } from './slides';
import { HOVER, QUEUED, fire, shotsOf, setRideAim } from './kinds';
import { steerShot, setTubeFoes } from '../../weapons/tubeRide';

/** His seat: his feet this far over the tube's bottom (down in its hole). */
const SEAT = 8;
/** His box sat up and ducked (from his feet up). */
export const SAT_H = 62, DUCK_H = 32;
/** A pipe's underside over the chute (sat up he's hit; ducked he's under it). */
export const PIPE_CLEAR = 44;
/** The GAP sign: this far before each gap (art.ts hangs it; long enough to read and get ready). */
export const GAP_WARN = 340;
/** A new alien: no sooner than this many frames after the last one. */
const SPAWN_GAP = 100;
/** The chute's floor under him: how wide. */
const FLOOR_W = 64;

export interface TubeRide {
  i: number; mode: 'off' | 'card' | 'ride' | 'fall' | 'funnel' | 'done';
  /** The tube (where it's drawn: round his hips, its bottom at his feet + SEAT). */
  x: number; y: number;
  /** The chute's height he last rode (the camera keeps to it, not his jumps). */
  rideY: number;
  camY: number; t: number;
  /** The aliens: sent so far, killed so far, who's riding along; frames till the next may come; the ride's cleared. */
  sent: number; killed: number; escort: Enemy[]; spawnIn: number; cleared: boolean;
  /** How far he's been carried back, all told (the backdrop's parallax keeps going on as if he hadn't: art.ts). */
  shift: number;
  /** Frames down the drop. */
  fallT: number;
  /** The chute's floor under him (a block of the stage's, moved with him). */
  floor: Block | null;
  /** Last frame he was over the chute and on it or up over it (not under it, not over a gap): coming down, or the
   *  chute climbing up into him, he's on it. */
  above: boolean;
  /** Up in the air on the ride: his rise and his jump's hold as the last frame left them (a hit in the air hurts him
   *  but doesn't spoil the jump); and how hurt he was then (a fresh hit: his hurt's gone up). */
  air: { vy: number; hold: number } | null; hurtWas: number;
  /** In the Abyss's funnel at the end (updateFunnel): frames in, the stage, the swing's turns so far (a whoosh each),
   *  where he was across it when he went for the hole, his fall out of the spout. */
  fun: { t: number; stage: 'swing' | 'sink' | 'gone' | 'drop'; k: number; turn: number; u0: number; vy: number } | null;
}
/** The funnel's frames: a swing across and back is 2 FUN_HALF; the top-down shot (funnel.ts drawFunnelShot, the
 *  owner's "a fun little mini cutscene of him spinning in the funnel using a mode 7 ish effect") from FUN_TOP for
 *  FUN_TOP_T; down the hole at FUN_SINK; the swings die away over FUN_DECAY. */
export const FUN_HALF = 46, FUN_TOP = 104, FUN_TOP_T = 240, FUN_SINK = 392, FUN_DECAY = 170;
/** The top-down shot's on, and how far into it (0..1), else null. */
export const funnelShot = (r: TubeRide) => (r.mode === 'funnel' && r.fun && r.fun.stage === 'swing' && r.fun.t >= FUN_TOP && r.fun.t < FUN_TOP + FUN_TOP_T ? (r.fun.t - FUN_TOP) / FUN_TOP_T : null);
const PATHS: Path[][][] = TUBES.map(t => t.laps.map(l => l.pieces.map(pathOf)));
/** How far the tube's squashed flat under him (looks only: Player.tubeSit, art.ts drawTubeRing): settled under his
 *  weight sat, flexing with the chute, slammed flat on a landing, sprung back round up in the air. */
let squash = 0;
const sitIn = (state: GameState, sat: boolean, landed: boolean) => {
  const p = state.player;
  if (landed) squash = 1;
  const want = sat ? 0.5 + Math.sin(state.frame * 0.13) * 0.12 : 0;
  squash += (want - squash) * (squash > want ? 0.12 : 0.25);
  p.tubeSit = { squash };
};
/** The lap each ride's on (the chute's middle differs lap to lap: geo.ts laps). */
const LAP = TUBES.map(() => 0);
export const tubeLapNo = (i: number) => LAP[i];
export const tubeLap = (i: number) => TUBES[i].laps[LAP[i]];
export const tubePaths = (i: number) => PATHS[i][LAP[i]];

export const newTube = (): TubeRide => ({ i: 0, mode: 'off', x: 0, y: 0, rideY: 0, camY: 0, t: 0, sent: 0, killed: 0, escort: [], spawnIn: 0, cleared: false, shift: 0, fallT: 0, floor: null, above: false, air: null, hurtWas: 0, fun: null });
export const tubeOn = (r: TubeRide) => r.mode === 'ride' || r.mode === 'card' || r.mode === 'fall' || r.mode === 'funnel';
/** Ducked down in it. */
export const tubeDucked = (state: GameState, _r: TubeRide) => !!state.player.isDucking;
/** His box riding: sat up or ducked (stood up in a move: his own). */
export const tubeBox = (state: GameState, r: TubeRide) => {
  const p = state.player, feet = p.pos.y + p.height;
  if (!p.logSeat) return { x: p.pos.x, y: p.pos.y, w: p.width, h: p.height };
  const h = tubeDucked(state, r) ? DUCK_H : SAT_H;
  return { x: r.x - 16, y: feet - h, w: 32, h };
};
/** The chute under world x on ride `i`: its height and slope, or null over a gap. */
const chuteAt = (i: number, x: number) => {
  for (const P of tubePaths(i)) { if (x < P.segs[0].x0 || x > P.segs[P.segs.length - 1].x1) continue; return surfaceAt(P, x); }
  return null;
};
/** Over a gap: the height of the chute's far side (the next piece's start). */
const nextStartY = (i: number, x: number) => { for (const P of tubePaths(i)) if (P.segs[0].x0 > x) return P.segs[0].y0; return Infinity; };
/** The aliens left to kill on the ride he's on (the HUD's count). */
export const tubeFoesLeft = (r: TubeRide) => (r.mode === 'ride' || r.mode === 'fall' ? Math.max(0, TUBES[r.i].foes - r.killed) : 0);

const floorOff = (state: GameState, r: TubeRide) => {
  if (r.floor) { const f = r.floor; state.blocks = state.blocks.filter(b => b !== f); r.floor = null; }
};
const floorAt = (state: GameState, r: TubeRide, cx: number, y: number) => {
  if (!r.floor) { r.floor = { x: 0, y: 0, w: FLOOR_W, h: 24, type: 'wall', hidden: true, tag: 'wp-tube-floor' } as Block; state.blocks.push(r.floor); }
  r.floor.x = cx - FLOOR_W / 2; r.floor.y = y; r.floor.w = FLOOR_W; r.floor.h = 24;
};

/** Onto a tube at the top of ride `i` (the card first, the first time). */
export const boardTube = (state: GameState, r: TubeRide, i: number, card: boolean) => {
  LAP[i] = 0;
  const p = state.player, at = PATHS[i][0][0].segs[0];
  Object.assign(r, { i, mode: card ? 'card' : 'ride', x: at.x0, y: at.y0, rideY: at.y0, camY: at.y0 - 400, t: 0, sent: 0, killed: 0, escort: [], spawnIn: 60, cleared: false, fallT: 0, above: true, air: null, hurtWas: 0, fun: null });
  // (the Abyss's aliens shoot down at him sooner)
  setRideAim(i === 0 ? 120 : 85);
  p.facing = 1;
  p.isCharging = false; p.isSliding = false; p.isDivekicking = false; p.isUppercutting = false;
  p.pos.x = at.x0 - p.width / 2; p.pos.y = at.y0 - SEAT - p.height; p.vel.x = 0; p.vel.y = 0;
  // (the card: sat still in it till it's closed)
  p.carried = card; p.logSeat = true; p.tubeSit = { squash: 0.5 }; squash = 0.5;
  setGroundGrabsOff(true);
  playSound('splash', 0.8, -2);
  setUi({ pauseControls: 'tube' });
};
export const unboardTube = (state: GameState, r: TubeRide) => {
  const p = state.player;
  p.carried = false; p.logSeat = false; p.spriteRot = 0; p.tubeSit = null;
  // (out of the funnel's cutscene, if he was in it)
  if (r.fun) { p.inCutscene = false; p.hidden = false; r.fun = null; }
  state.cameraOverride = null;
  floorOff(state, r);
  setGroundGrabsOff(false);
  setUi({ pauseControls: null });
  // (whoever was riding along with him peels off: gone, not killed)
  for (const e of r.escort) if (e.health > 0) state.enemies = state.enemies.filter(x => x !== e);
  r.escort = [];
};

/** The carry back round the loop: him, the camera, and everything near him (the aliens, the living and the dead, the
 *  shots, his bullets, the sparks and the blood, what's dropped) by `d`, so nothing on screen moves. */
const carry = (state: GameState, r: TubeRide, d: number) => {
  const from = r.x;
  r.x += d; r.shift -= d;
  state.player.pos.x += d;
  if (r.floor) r.floor.x += d;
  state.camera.x += d;
  if (state.cameraOverride) state.cameraOverride.x += d;
  const near = (x: number) => Math.abs(x - from) < 2400;
  const move = (list: { pos: { x: number } }[]) => { for (const o of list) if (near(o.pos.x)) o.pos.x += d; };
  move(state.enemies); move(state.projectiles); move(state.particles); move(state.pickups);
  move(state.enemyDeaths as unknown as { pos: { x: number } }[]);
  for (const e of state.enemies) if (e.homeX !== undefined && near(e.homeX)) e.homeX += d;
  for (const n of state.damageNumbers as unknown as { x?: number; pos?: { x: number } }[]) { if (n.pos && near(n.pos.x)) n.pos.x += d; else if (typeof n.x === 'number' && near(n.x)) n.x += d; }
  for (const s of shotsOf(state)) if (near(s.x)) s.x += d;
};

export interface TubeEvents { onEnd: () => void; onFall: () => void; onClear: () => void }

/** The splash into a ride's pool at its end (the owner's "make sure a big splash shows at the end": a wall of it up out
 *  of the pool, and the spray after); `big`: more of it, wider and higher (out of the funnel's spout, from up there). */
const poolSplash = (state: GameState, T: Tube, sx: number, big: number) => {
  playSound('splash', 1, -12); playSound('splash', 1, -4); playSound('thud', 0.7, -8); shakeScreen(state, 16 * big, 8 + 4 * (big - 1));
  for (let k = 0; k < 120 * big; k++) state.particles.push({ pos: { x: sx + (Math.random() - 0.5) * 120 * big, y: T.pool.surface - Math.random() * 6 }, vel: { x: (Math.random() - (big > 1 ? 0.5 : 0.35)) * 9 * big, y: -4 - Math.random() * 15 * big }, life: 50 + Math.random() * 30, color: k % 4 === 0 ? '#FFFFFF' : k % 3 ? '#E0F2FE' : '#7DD3FC', size: 3 + Math.random() * 6 });
  for (let k = 0; k < 30 * big; k++) state.particles.push({ pos: { x: sx + (Math.random() - 0.5) * 200 * big, y: T.pool.surface }, vel: { x: (Math.random() - 0.5) * 14 * big, y: -1 - Math.random() * 3 }, life: 34, color: '#BFE6FF', size: 2 + Math.random() * 3 });
};

const NONE: Controls = { left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false, charge: false };
/** A frame in the Abyss's funnel (no input: he's along for it, a cutscene: no HUD). Swung side to side up its walls (the
 *  wall's slope tips him; a whoosh at each turn), the swings dying away; the top-down shot cut in partway (funnel.ts,
 *  drawn over the world: the swings go on under it, so it cuts back to where they've got to); then to the middle and
 *  down the hole in its floor, gone a beat (in its neck), out of the spout and down into the pool: the big splash, out of
 *  the tube, swimming, as the rides end. Nothing can hurt him in here (every alien's dead before he's let in). */
const updateFunnel = (ctx: FrameContext, r: TubeRide, ev: TubeEvents): Controls => {
  const { state } = ctx, p = state.player, T = TUBES[r.i], F = T.funnel!, fu = r.fun!;
  fu.t++;
  p.inCutscene = true; p.facing = 1; p.vel.x = 0; p.pushbackTimer = 0;
  p.isCharging = false; p.isSliding = false; p.isDivekicking = false; p.isUppercutting = false; p.isDucking = false;
  // (the camera over to the funnel, framing it and the pool under it)
  const want = { x: F.cx - CANVAS_WIDTH / 2, y: F.rimY - 250 }, co = state.cameraOverride ?? want;
  state.cameraOverride = { x: co.x + (want.x - co.x) * 0.08, y: co.y + (want.y - co.y) * 0.08 };
  r.camY = state.cameraOverride.y;
  const seat = (u: number, down: number) => {
    const q = funnelSeat(F, u), y = q.y + down;
    p.carried = false; p.hidden = false;
    p.pos.x = q.x - p.width / 2; p.pos.y = y - SEAT - p.height; p.vel.y = 0; p.isGrounded = true;
    floorAt(state, r, q.x, y - SEAT);
    p.logSeat = true; p.spriteRot = q.a;
    sitIn(state, true, false);
    r.x = q.x; r.y = y;
    // (the water sheeting round the bowl, kicked up off the tube)
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: q.x + (Math.random() - 0.5) * 40, y: y - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 18, color: Math.random() < 0.5 ? '#E0F2FE' : '#7DD3FC', size: 2 + Math.random() * 2, grav: 0.2 });
  };
  if (fu.stage === 'swing') {
    // (in over the rim's left end, swinging across: as wide as the bowl at first, dying away)
    const A = Math.max(0.06, Math.exp(-fu.t / FUN_DECAY)), u = -A * Math.cos((fu.t * Math.PI) / FUN_HALF);
    const turn = Math.floor(fu.t / FUN_HALF);
    if (turn !== fu.turn) { fu.turn = turn; playSound('whoosh', 0.25 + 0.6 * A, -6 + Math.min(8, turn)); }
    seat(u, 0);
    if (fu.t >= FUN_SINK) { fu.stage = 'sink'; fu.k = 0; fu.u0 = u; }
  } else if (fu.stage === 'sink') {
    // (to the middle and down into the hole)
    fu.k++;
    const k = Math.min(1, fu.k / 16);
    seat(fu.u0 * (1 - k), k * k * 26);
    if (fu.k >= 16) {
      fu.stage = 'gone'; fu.k = 0;
      p.hidden = true; p.carried = true; floorOff(state, r);
      playSound('whoosh', 0.9, -12); playSound('splash', 0.5, 6);
      for (let k2 = 0; k2 < 24; k2++) state.particles.push({ pos: { x: F.cx + (Math.random() - 0.5) * 50, y: F.holeY }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 4 }, life: 26, color: k2 % 3 ? '#E0F2FE' : '#FFFFFF', size: 2 + Math.random() * 3, grav: 0.3 });
    }
  } else if (fu.stage === 'gone') {
    // (down the funnel's neck, out of sight)
    fu.k++;
    p.hidden = true; p.carried = true; p.vel.y = 0;
    if (fu.k >= 12) {
      fu.stage = 'drop'; fu.vy = 3;
      p.hidden = false; p.spriteRot = 0; p.isGrounded = false;
      p.pos.x = F.cx - p.width / 2; p.pos.y = F.spoutY - p.height + 6;
      playSound('splash', 0.6, 2);
      for (let k2 = 0; k2 < 30; k2++) state.particles.push({ pos: { x: F.cx + (Math.random() - 0.5) * 50, y: F.spoutY }, vel: { x: (Math.random() - 0.5) * 7, y: Math.random() * 3 }, life: 24, color: k2 % 3 ? '#BFE6FF' : '#FFFFFF', size: 2 + Math.random() * 4, grav: 0.35 });
    }
  } else {
    // (out of the spout, falling, tube and all, into the pool)
    p.carried = true; p.hidden = false; p.isGrounded = false; p.logSeat = true;
    fu.vy = Math.min(14, fu.vy + 0.6);
    p.pos.y += fu.vy;
    r.x = p.pos.x + p.width / 2; r.y = p.pos.y + p.height + SEAT;
    sitIn(state, false, false);
    if (p.pos.y + p.height >= T.pool.surface - 4) {
      const vy = fu.vy;
      r.mode = 'done';
      unboardTube(state, r);
      p.vel.x = 0; p.vel.y = Math.min(8, vy); p.isGrounded = false;
      poolSplash(state, T, F.cx, 1.6);
      ev.onEnd();
    }
  }
  setUi({ pauseControls: 'tube' });
  return NONE;
};

/** A frame of the ride (before the engine moves him). Returns what the engine's to have: everything of his but walking
 *  (the chute's pace is his), the charge moves, and (grab.ts, off for the ride) the beatdown and the shakedown. */
export const updateTube = (ctx: FrameContext, r: TubeRide, controls: Controls, ev: TubeEvents): Controls => {
  const { state } = ctx, p = state.player, T = TUBES[r.i];
  if (r.mode === 'off' || r.mode === 'done') return controls;
  if (p.health <= 0 && r.mode !== 'fall') { r.mode = 'off'; unboardTube(state, r); return controls; }
  if (r.mode === 'card') {
    p.carried = true; p.logSeat = true; p.isGrounded = true; p.vel.x = 0; p.vel.y = 0;
    sitIn(state, true, false);
    state.cameraOverride = { x: Math.max(0, r.x - 250), y: r.camY };
    return { left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false };
  }
  if (r.mode === 'funnel') return updateFunnel(ctx, r, ev);
  p.carried = false;
  r.t++;
  // (hit on the chute (a pipe, a bolt): hurt, but never knocked about by it: the chute's pace is all that carries him,
  // a jump goes as he jumped it, and on the chute he stays sat in it, his control his own (a bolt's knock, mid jump,
  // stopped his rise short of a gap's far side; one just before a gap bounced him up off the chute and out of reach of a
  // jump: deaths the holes didn't earn, with the Abyss's close). An air grab's own)
  if (r.mode === 'ride' && !grabBusy()) {
    p.vel.x = 0; p.pushbackTimer = 0;
    if ((p.hurtTimer ?? 0) > r.hurtWas) {
      if (r.air) { p.vel.y = r.air.vy; p.jumpHoldTimer = Math.max(0, r.air.hold - 1); }
      else if (p.jumpHoldTimer <= 0 && p.vel.y < 0) p.vel.y = 0;
    }
  }
  r.hurtWas = p.hurtTimer ?? 0;
  const feet = () => p.pos.y + p.height, mid = () => p.pos.x + p.width / 2;
  // ---- down the drop, tube and all: the camera holds, he goes down into the dark (the engine's fall death has him)
  if (r.mode === 'fall') {
    r.fallT++;
    floorOff(state, r);
    r.x = mid(); r.y = feet() + SEAT;
    p.logSeat = true; p.spriteRot = Math.min(1.2, r.fallT * 0.03);
    sitIn(state, false, false);
    state.cameraOverride = { x: state.cameraOverride?.x ?? Math.max(0, r.x - 250), y: r.camY };
    setUi({ pauseControls: 'tube' });
    return { ...controls, left: false, right: false, jump: false, special: false, charge: false, up: false, shoot: false };
  }
  // ---- the chute carries him on (whatever he's doing: it's the tube's pace, stuck to him)
  const wasX = mid();
  const pace = tubeSpeedAt(T, LAP[r.i], wasX);
  p.pos.x += pace;
  // ---- round the loop again (the aliens not all dead yet; never mid-grab): carried back to its start
  if (!r.cleared && mid() >= T.loop.a + T.loop.len && !grabBusy()) { carry(state, r, -T.loop.len); LAP[r.i] = (LAP[r.i] + 1) % T.laps.length; }
  const paths = tubePaths(r.i), lap = tubeLap(r.i);
  const crossedFrom = mid() < wasX ? wasX - T.loop.len : wasX;
  const cx = mid(), under = chuteAt(r.i, cx);
  // ---- the floor under him: at the chute's height, wherever he's over it and not under it (none over a gap)
  const moving = !!(p.isUppercutting || p.isDivekicking || grabBusy());
  const sy = under ? under.y - SEAT : 0;
  // (up in the air over the chute, the chute climbing faster than he comes down (its steep rises): it never goes up
  // through him, he's on it)
  if (under && r.above && !moving && feet() > sy && feet() < sy + 60) { p.pos.y = sy - p.height; if (p.vel.y > 0) p.vel.y = 0; }
  if (under && feet() <= sy + Math.max(6, p.vel.y + 2)) {
    // (sat in it, riding: kept right on the chute, up and down its swell)
    if (p.isGrounded && p.vel.y >= 0 && !moving) { p.pos.y = sy - p.height; p.vel.y = 0; }
    floorAt(state, r, cx, sy);
    r.rideY = under.y;
  } else floorOff(state, r);
  r.above = !!under && feet() <= sy + 1;
  // ---- gone: below where he could still come down on the chute (over a gap, the far side's start)
  const lowest = under ? under.y : Math.max(r.rideY, nextStartY(r.i, cx));
  if (!p.isGrounded && feet() > lowest + 40) {
    r.mode = 'fall'; r.fallT = 0;
    floorOff(state, r);
    playSound('whoosh', 0.9, -10);
    ev.onFall();
    return { ...controls, left: false, right: false, jump: false, special: false, charge: false, up: false, shoot: false };
  }
  // ---- the end: into the splash pool, out of the tube, into the water
  const last = paths[paths.length - 1], endX = last.segs[last.segs.length - 1].x1;
  if (cx >= endX - 2 && T.funnel) {
    // (the Abyss: into its funnel. The aliens are all dead (the loop only lets him go once they are))
    r.mode = 'funnel'; r.fun = { t: 0, stage: 'swing', k: 0, turn: 0, u0: -1, vy: 0 };
    p.tubeSit = { squash }; p.isGrounded = true;
    playSound('splash', 0.7, -4); playSound('whoosh', 0.8, -8);
    return updateFunnel(ctx, r, ev);
  }
  if (cx >= endX - 2) {
    r.mode = 'done';
    unboardTube(state, r);
    p.vel.x = 6; p.vel.y = -5; p.isGrounded = false;
    poolSplash(state, T, Math.min(T.pool.x2 - 60, cx + 80), 1);
    ev.onEnd();
    return controls;
  }
  // ---- sat in it on the chute (not in a move): the seat, turned with the chute; else his own pose, the tube round him
  // (the spellbook and the hammer take his pose over, as on land, and keep out of a seat's (weapons/seated.ts): with
  // one of those out he's stood up in the tube, so they work here as they do anywhere (the owner's "similar to how it
  // works on land"); the spellbook's reading holds him still, but the chute doesn't stop: time it between the holes)
  const poser = p.currentWeapon === 'SPELLBOOK' || p.currentWeapon === 'MALLET';
  const seated = p.isGrounded && !moving && !p.isCharging && !poser;
  p.logSeat = seated;
  p.spriteRot = seated && under ? under.a : 0;
  // (the look of him in it: sat in its hole whatever he's doing but an air grab (the grab draws him) or the spellbook or
  // the hammer (stood up in it, as on land))
  if (grabBusy() || poser) p.tubeSit = null; else sitIn(state, seated, seated && !!r.air);
  r.x = cx; r.y = feet() + SEAT;
  if (r.t % 7 === 0 && seated) playSound('splash', 0.1, 8 + Math.random() * 4);
  // ---- the low pipes over the chute: his head (or him, up in a jump) as one goes over
  for (const x of lap.pipes) {
    if (!(crossedFrom < x && cx >= x)) continue;
    const b = tubeBox(state, r), pipeY = (chuteAt(r.i, x)?.y ?? feet()) - PIPE_CLEAR;
    if (b.y < pipeY && b.y + b.h > pipeY - 26 && p.invincibilityTimer <= 0) { hurtPlayer(ctx, 14, 'm2:wp_pipe', { x: -2, y: 0 }, 14); playSound('clang', 0.9, -4); shakeScreen(state, 8, 4); }
  }
  // ---- the aliens: sent in one at a time, no more than the ride's most at once, till its count's all dead. One held in
  // a grab's still his; one gone without dying (it shouldn't) is sent again
  // (gone from the world, however: dead (a kill that blows one away needn't zero its health); the count always comes
  // down, the ride always ends)
  for (const e of r.escort) if (e.health <= 0 || e.isBlownAway || !inPlay(state, e)) r.killed++;
  r.escort = r.escort.filter(e => e.health > 0 && !e.isBlownAway && inPlay(state, e));
  // (the owner's: "make sure there is always an alien in front of you. the ones behind you are 'in queue' and won't
  // attack": the first of them (the Abyss: the first two) out in front fighting, the rest waiting behind him, harmless,
  // each moving up as one ahead dies)
  const front = r.i === 0 ? 1 : 2;
  r.escort.forEach((e, k) => { if (k < front) QUEUED.delete(e); else QUEUED.add(e); });
  // (who's out in front fighting, and the pace: the weapons' tube-only aim help seeks those, never the queue)
  setTubeFoes(pace, r.escort.filter(e => !QUEUED.has(e)));
  // ---- the shots: the crossbow's darts sent after the aliens out in front, up over him, down on the chute, ahead on a
  // rise or in a dip (aim help only, never more damage: tubeRide.ts). The ray gun goes straight where it's fired (the
  // owner's "remove the 'homing' elements of the ray gun during the tube slide parts")
  for (const q of state.projectiles) {
    if (q.owner !== 'player') continue;
    if (q.custom === 'CROSSBOW' && (q.customData as { kind?: string } | undefined)?.kind === 'dart') steerShot(state, q, 'dart');
  }
  if (!r.cleared && r.killed >= T.foes) { r.cleared = true; ev.onClear(); }
  r.spawnIn--;
  // (none ahead: the next one's straight in)
  if (!r.escort.length && r.spawnIn > 12) r.spawnIn = 12;
  if (!r.cleared && r.sent < T.foes && r.escort.length < T.most && r.spawnIn <= 0) {
    r.sent++; r.spawnIn = SPAWN_GAP;
    // (on screen from the start (enemies-always-visible): in ahead of him if there's nobody there, else at the back of
    // the queue, behind him)
    const ahead = r.escort.length < front;
    const e = makeKindEnemy(HOVER as EnemyKind, ahead ? state.camera.x + CANVAS_WIDTH - 90 : state.camera.x + 40, r.rideY - (ahead ? 250 : 300));
    if (!ahead) QUEUED.add(e);
    e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y; e.variant = r.sent * 5 + r.i; e.seen = true;
    state.enemies.push(e); r.escort.push(e);
    playSound('rayFizzle', 0.5, -6);
    for (let k = 0; k < 10; k++) state.particles.push({ pos: { x: e.pos.x + e.width / 2, y: e.pos.y + e.height - 6 }, vel: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 3 }, life: 20, color: k % 2 ? '#86EFAC' : '#F0ABFC', size: 2 + Math.random() * 2 });
  }
  // (each one riding along: now and then it drops down onto the chute ahead and fires back along it, low (jump it) or
  // at head height (duck it): the tell's where it holds, the coil glowing, and the height it's at; the bolt keeps that
  // height over the chute, up its rises and down its dips. The Abyss's do it more often (the owner's "gnarly"), one at a
  // time, the tell as long)
  const cycle = r.i === 0 ? 300 : 210, k0 = cycle - 140;
  const skimming = r.escort.some(e => (e.aiY ?? 0) > 0);
  for (const e of r.escort) {
    if (!state.enemies.includes(e) || QUEUED.has(e)) continue;
    e.aiX = (e.aiX ?? 0) + 1;
    const k = e.aiX % cycle;
    if (k === k0) { if (skimming && !e.aiY) e.aiX -= 70; else e.aiY = Math.random() < 0.5 ? 1 : 2; }
    if (k > k0 && k < k0 + 70 && e.aiY) {
      const low = e.aiY === 1, ex = cx + 300, ground = chuteAt(r.i, ex)?.y ?? r.rideY, off = low ? 14 : 50, ty = ground - off;
      e.pos.x += (ex - (e.pos.x + e.width / 2)) * 0.2 + pace;
      e.pos.y += (ty - (e.pos.y + e.height - 10)) * 0.2;
      e.aiState = 'skim'; e.aiTimer = 0;
      if (k === k0 + 54) { fire(state, { x: e.pos.x, y: ty, vx: -6.5, vy: 0, kind: 'bolt', src: 'm2:wp_bolt', dmg: 12, overChute: off }); playSound('rayFizzle', 0.5, low ? -2 : 4); }
    }
    if (k === k0 + 72) { e.aiY = 0; e.aiState = 'idle'; }
  }
  for (const s of shotsOf(state)) {
    if (s.overChute === undefined) continue;
    const c = chuteAt(r.i, s.x);
    if (c) s.y = c.y - s.overChute;
  }
  // ---- the camera (kept to the chute's height, not his jumps)
  const ty = r.rideY - 400;
  r.camY += (ty - r.camY) * 0.1;
  state.cameraOverride = { x: Math.max(0, cx - 250), y: r.camY };
  setUi({ pauseControls: 'tube' });
  r.air = p.isGrounded ? null : { vy: p.vel.y, hold: p.jumpHoldTimer };
  // ---- what's his: the jump, the duck, the guns (and the air grab, grab.ts's, off the buttons themselves); not walking
  // or turning (the owner's "you can only face right during the tube rides": whatever he does, he faces down the chute),
  // and nothing on B (the owner's "disable all charge moves on the tube slides. just shooting or air grabs": the
  // uppercut, the dive kick, the slide, the shoulder charge; grab.ts holds back a B it lets through late too)
  p.facing = 1;
  // (dev only: window.__wpAutoTube set, it jumps the gaps itself: the headless checks and the perf run ride it through)
  const auto = import.meta.env.DEV && !!(window as unknown as { __wpAutoTube?: boolean }).__wpAutoTube;
  const autoJump = auto && ((p.isGrounded || p.coyoteJumpTimer > 0) && p.vel.y >= 0 ? lap.gaps.some(([g1]) => g1 - cx > pace * 3 && g1 - cx < pace * 7) : p.vel.y < 0 || (!under && feet() < r.rideY + 12));
  const autoDuck = auto && !autoJump && p.isGrounded && lap.pipes.some(x => x - cx > -20 && x - cx < pace * 5);
  return { ...controls, left: false, right: false, jump: !!controls.jump || autoJump, down: !!controls.down || autoDuck, charge: false, special: false };
};
export type { Tube };
