// THE TUBE RIDES (THE BLACK HOLE, THE ABYSS): an inner tube down a long chute off a tall tower, high over a bottomless
// drop, the chute broken in places, aliens on hover discs riding along shooting at him.
//
// The owner's: "the tube ride should always 'stick' to meathead. you cannot lose it on any jump, floating or otherwise.
// it goes infinitely until you kill everything. you just gotta avoid the bottomless drops along the way", "it's kinda
// like an autorunner, this section. you cannot lose the tube, but you can fall on a misplaced jump", and "the tube ride
// should allow all actions like air grabs and other weapons if so desired. beatdowns and shakedowns are disabled. air
// grabs are risky high risk high reward moves. hopefully you don't land in the hole", then "charge moves disabled too,
// air grabs are not".
//
// An autorunner: the chute carries him on at the ride's steady pace (a conveyor under him: the tube's stuck to his ass,
// drawn round him whatever he's doing). He's himself on it: the engine's jump, duck, every gun and the switching, the
// uppercut, the dive kick, the air grab (the alien and him come down together, where they come down: over a hole, down
// it). Not the charge moves (the shoulder charge, the slide), the beatdown or the shakedown. The chute's floor is a
// block kept under him at the chute's height (none over a gap: he drops). The gaps have to be jumped (a GAP sign before
// each, the chute's broken end striped); down one, he's gone into the dark, tube and all: the one way to die of the ride
// itself.
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
import { TUBES, type Tube } from './geo';
import { pathOf, surfaceAt, type Path } from './slides';
import { HOVER, QUEUED, fire, shotsOf } from './kinds';

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
  i: number; mode: 'off' | 'card' | 'ride' | 'fall' | 'done';
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
}
const PATHS: Path[][] = TUBES.map(t => t.pieces.map(pathOf));
export const tubePaths = (i: number) => PATHS[i];

export const newTube = (): TubeRide => ({ i: 0, mode: 'off', x: 0, y: 0, rideY: 0, camY: 0, t: 0, sent: 0, killed: 0, escort: [], spawnIn: 0, cleared: false, shift: 0, fallT: 0, floor: null });
export const tubeOn = (r: TubeRide) => r.mode === 'ride' || r.mode === 'card' || r.mode === 'fall';
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
  for (const P of PATHS[i]) { if (x < P.segs[0].x0 || x > P.segs[P.segs.length - 1].x1) continue; return surfaceAt(P, x); }
  return null;
};
/** Over a gap: the height of the chute's far side (the next piece's start). */
const nextStartY = (i: number, x: number) => { for (const P of PATHS[i]) if (P.segs[0].x0 > x) return P.segs[0].y0; return Infinity; };
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
  const p = state.player, at = PATHS[i][0].segs[0];
  Object.assign(r, { i, mode: card ? 'card' : 'ride', x: at.x0, y: at.y0, rideY: at.y0, camY: at.y0 - 400, t: 0, sent: 0, killed: 0, escort: [], spawnIn: 60, cleared: false, fallT: 0 });
  p.facing = 1;
  p.isCharging = false; p.isSliding = false; p.isDivekicking = false; p.isUppercutting = false;
  p.pos.x = at.x0 - p.width / 2; p.pos.y = at.y0 - SEAT - p.height; p.vel.x = 0; p.vel.y = 0;
  // (the card: sat still in it till it's closed)
  p.carried = card; p.logSeat = true;
  setGroundGrabsOff(true);
  playSound('splash', 0.8, -2);
  setUi({ pauseControls: 'tube' });
};
export const unboardTube = (state: GameState, r: TubeRide) => {
  const p = state.player;
  p.carried = false; p.logSeat = false; p.spriteRot = 0;
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

/** A frame of the ride (before the engine moves him). Returns what the engine's to have: everything of his but walking
 *  (the chute's pace is his), the charge moves, and (grab.ts, off for the ride) the beatdown and the shakedown. */
export const updateTube = (ctx: FrameContext, r: TubeRide, controls: Controls, ev: TubeEvents): Controls => {
  const { state } = ctx, p = state.player, T = TUBES[r.i], paths = PATHS[r.i];
  if (r.mode === 'off' || r.mode === 'done') return controls;
  if (p.health <= 0 && r.mode !== 'fall') { r.mode = 'off'; unboardTube(state, r); return controls; }
  if (r.mode === 'card') {
    p.carried = true; p.logSeat = true; p.isGrounded = true; p.vel.x = 0; p.vel.y = 0;
    state.cameraOverride = { x: Math.max(0, r.x - 250), y: r.camY };
    return { left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false };
  }
  p.carried = false;
  r.t++;
  const feet = () => p.pos.y + p.height, mid = () => p.pos.x + p.width / 2;
  // ---- down the drop, tube and all: the camera holds, he goes down into the dark (the engine's fall death has him)
  if (r.mode === 'fall') {
    r.fallT++;
    floorOff(state, r);
    r.x = mid(); r.y = feet() + SEAT;
    p.logSeat = true; p.spriteRot = Math.min(1.2, r.fallT * 0.03);
    state.cameraOverride = { x: state.cameraOverride?.x ?? Math.max(0, r.x - 250), y: r.camY };
    setUi({ pauseControls: 'tube' });
    return { ...controls, left: false, right: false, jump: false, special: false, charge: false, up: false, shoot: false };
  }
  // ---- the chute carries him on (whatever he's doing: it's the tube's pace, stuck to him)
  const wasX = mid();
  p.pos.x += T.speed;
  // ---- round the loop again (the aliens not all dead yet; never mid-grab): carried back to its start
  if (!r.cleared && mid() >= T.loop.a + T.loop.len && !grabBusy()) carry(state, r, -T.loop.len);
  const crossedFrom = mid() < wasX ? wasX - T.loop.len : wasX;
  const cx = mid(), under = chuteAt(r.i, cx);
  // ---- the floor under him: at the chute's height, wherever he's over it and not under it (none over a gap)
  const moving = !!(p.isUppercutting || p.isDivekicking || grabBusy());
  const sy = under ? under.y - SEAT : 0;
  if (under && feet() <= sy + Math.max(6, p.vel.y + 2)) {
    // (sat in it, riding: kept right on the chute, up and down its swell)
    if (p.isGrounded && p.vel.y >= 0 && !moving) { p.pos.y = sy - p.height; p.vel.y = 0; }
    floorAt(state, r, cx, sy);
    r.rideY = under.y;
  } else floorOff(state, r);
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
  if (cx >= endX - 2) {
    r.mode = 'done';
    unboardTube(state, r);
    p.vel.x = 6; p.vel.y = -5; p.isGrounded = false;
    // (the owner's "make sure a big splash shows at the end": a wall of it up out of the pool, and the spray after)
    playSound('splash', 1, -12); playSound('splash', 1, -4); playSound('thud', 0.7, -8); shakeScreen(state, 16, 8);
    const sx = Math.min(T.pool.x2 - 60, cx + 80);
    for (let k = 0; k < 120; k++) state.particles.push({ pos: { x: sx + (Math.random() - 0.5) * 120, y: T.pool.surface - Math.random() * 6 }, vel: { x: (Math.random() - 0.35) * 9, y: -4 - Math.random() * 15 }, life: 50 + Math.random() * 30, color: k % 4 === 0 ? '#FFFFFF' : k % 3 ? '#E0F2FE' : '#7DD3FC', size: 3 + Math.random() * 6 });
    for (let k = 0; k < 30; k++) state.particles.push({ pos: { x: sx + (Math.random() - 0.5) * 200, y: T.pool.surface }, vel: { x: (Math.random() - 0.5) * 14, y: -1 - Math.random() * 3 }, life: 34, color: '#BFE6FF', size: 2 + Math.random() * 3 });
    ev.onEnd();
    return controls;
  }
  // ---- sat in it on the chute (not in a move): the seat, turned with the chute; else his own pose, the tube round him
  const seated = p.isGrounded && !moving && !p.isCharging;
  p.logSeat = seated;
  p.spriteRot = seated && under ? under.a : 0;
  r.x = cx; r.y = feet() + SEAT;
  if (r.t % 7 === 0 && seated) playSound('splash', 0.1, 8 + Math.random() * 4);
  // ---- the low pipes over the chute: his head (or him, up in a jump) as one goes over
  for (const x of T.pipes) {
    if (!(crossedFrom < x && cx >= x)) continue;
    const b = tubeBox(state, r), pipeY = (chuteAt(r.i, x)?.y ?? feet()) - PIPE_CLEAR;
    if (b.y < pipeY && b.y + b.h > pipeY - 26 && p.invincibilityTimer <= 0) { hurtPlayer(ctx, 14, 'm2:wp_pipe', { x: -2, y: 0 }, 14); playSound('clang', 0.9, -4); shakeScreen(state, 8, 4); }
  }
  // ---- the aliens: sent in one at a time, no more than the ride's most at once, till its count's all dead. One held in
  // a grab's still his; one gone without dying (it shouldn't) is sent again
  for (const e of r.escort) {
    if (e.health <= 0) r.killed++;
    else if (!inPlay(state, e)) r.sent--;
  }
  r.escort = r.escort.filter(e => e.health > 0 && inPlay(state, e));
  // (the owner's: "make sure there is always an alien in front of you. the ones behind you are 'in queue' and won't
  // attack": the first of them (the Abyss: the first two) out in front fighting, the rest waiting behind him, harmless,
  // each moving up as one ahead dies)
  const front = r.i === 0 ? 1 : 2;
  r.escort.forEach((e, k) => { if (k < front) QUEUED.delete(e); else QUEUED.add(e); });
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
  // at head height (duck it): the tell's where it holds, the coil glowing, and the height it's at)
  for (const e of r.escort) {
    if (!state.enemies.includes(e) || QUEUED.has(e)) continue;
    e.aiX = (e.aiX ?? 0) + 1;
    const k = e.aiX % 300;
    if (k === 160) { e.aiY = Math.random() < 0.5 ? 1 : 2; }
    if (k > 160 && k < 230 && e.aiY) {
      const low = e.aiY === 1, ty = r.rideY - (low ? 14 : 50);
      e.pos.x += ((cx + 300) - (e.pos.x + e.width / 2)) * 0.2 + T.speed;
      e.pos.y += (ty - (e.pos.y + e.height - 10)) * 0.2;
      e.aiState = 'skim'; e.aiTimer = 0;
      if (k === 214) { fire(state, { x: e.pos.x, y: ty, vx: -6.5, vy: 0, kind: 'bolt', src: 'm2:wp_bolt', dmg: 12 }); playSound('rayFizzle', 0.5, low ? -2 : 4); }
    }
    if (k === 232) { e.aiY = 0; e.aiState = 'idle'; }
  }
  // ---- the camera (kept to the chute's height, not his jumps)
  const ty = r.rideY - 400;
  r.camY += (ty - r.camY) * 0.1;
  state.cameraOverride = { x: Math.max(0, cx - 250), y: r.camY };
  setUi({ pauseControls: 'tube' });
  // ---- what's his: everything but walking (left / right only turn him), the charge moves (B on its own, B down on the
  // chute: the shoulder charge, the slide); the uppercut (up + B) and the dive kick (down + B up in the air) are his
  if (controls.left && !controls.right) p.facing = -1; else if (controls.right && !controls.left) p.facing = 1;
  const specialOk = !!controls.up || (!!controls.down && !p.isGrounded);
  // (dev only: window.__wpAutoTube set, it jumps the gaps itself: the headless checks and the perf run ride it through)
  const auto = import.meta.env.DEV && !!(window as unknown as { __wpAutoTube?: boolean }).__wpAutoTube;
  const autoJump = auto && (p.isGrounded ? T.gaps.some(([g1]) => g1 - cx > 0 && g1 - cx < T.speed * 3) : p.vel.y < 0);
  return { ...controls, left: false, right: false, jump: !!controls.jump || autoJump, charge: false, special: !!controls.special && specialOk };
};
export type { Tube };
