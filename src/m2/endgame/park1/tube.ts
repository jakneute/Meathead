// THE TUBE RIDES (THE BLACK HOLE, THE ABYSS): an inner tube down a long chute off a tall tower, high over a bottomless
// drop, the chute broken in places, aliens on hover discs riding along shooting at him.
//
// The owner's: "the tube ride should always 'stick' to meathead. you cannot lose it on any jump, floating or otherwise.
// it goes infinitely until you kill everything. you just gotta avoid the bottomless drops along the way", and "it's
// kinda like an autorunner, this section. you cannot lose the tube, but you can fall on a misplaced jump".
//
// An autorunner: the tube carries him on at the ride's steady pace. JUMP jumps him and the tube together (it's stuck to
// him: there's no way out of it); the chute's gaps have to be jumped (a GAP sign before each, the chute's broken end
// striped); miss one, or jump short, and he goes down into the dark with it: the one way to die of the ride itself. DOWN
// ducks (the shots at head height, the low pipes); he can shoot (no specials: he's sat in a tube).
//
// The ride goes on till every alien of it's dead: the chute loops (from its loop's end he's carried back to its start,
// the same chute either side, everything round him carried with him: geo.ts course), and once the last one's down the
// loop lets him go, on down into the splash pool: the tube's gone, he's in the water, on he swims.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { setUi } from '../../store';
import { TUBES, type Tube } from './geo';
import { pathOf, surfaceAt, type Path } from './slides';
import { HOVER, fire, shotsOf } from './kinds';

/** His seat over the chute's surface (feet: down in the tube's hole); the jump (tube and all): up, the fall, held. */
const SEAT = 8, JUMP_V = 9.4, JUMP_G = 0.5, JUMP_G_HELD = 0.36;
/** Off a piece's end without jumping: a few frames he can still jump (the edge's grace). */
const COYOTE = 6;
/** His box sat up and ducked (from his feet up). */
export const SAT_H = 62, DUCK_H = 32;
/** A pipe's underside over the chute (sat up he's hit; ducked he's under it). */
export const PIPE_CLEAR = 44;
/** The GAP sign: this far before each gap (art.ts hangs it; long enough to read and get ready). */
export const GAP_WARN = 340;
/** A new alien: no sooner than this many frames after the last one. */
const SPAWN_GAP = 100;

export interface TubeRide {
  i: number; mode: 'off' | 'card' | 'ride' | 'fall' | 'done';
  /** The tube: where it is (its bottom), its fall, off the chute (a jump, or off an end), the edge's grace. */
  x: number; y: number; vy: number; air: boolean; coyote: number;
  /** The chute's height he last rode (the camera keeps to it, not his jumps). */
  rideY: number;
  jumpWas: boolean; camY: number; t: number;
  /** The aliens: sent so far, killed so far, who's riding along; frames till the next may come; the ride's cleared. */
  sent: number; killed: number; escort: Enemy[]; spawnIn: number; cleared: boolean;
  /** How far he's been carried back, all told (the backdrop's parallax keeps going on as if he hadn't: art.ts). */
  shift: number;
  /** Frames down the drop. */
  fallT: number;
}
const PATHS: Path[][] = TUBES.map(t => t.pieces.map(pathOf));
export const tubePaths = (i: number) => PATHS[i];

export const newTube = (): TubeRide => ({ i: 0, mode: 'off', x: 0, y: 0, vy: 0, air: false, coyote: 0, rideY: 0, jumpWas: true, camY: 0, t: 0, sent: 0, killed: 0, escort: [], spawnIn: 0, cleared: false, shift: 0, fallT: 0 });
export const tubeOn = (r: TubeRide) => r.mode === 'ride' || r.mode === 'card' || r.mode === 'fall';
/** Ducked down in it. */
export const tubeDucked = (state: GameState, _r: TubeRide) => !!state.player.isDucking;
/** His box riding: sat up or ducked. */
export const tubeBox = (state: GameState, r: TubeRide) => {
  const feet = r.y - SEAT, h = tubeDucked(state, r) ? DUCK_H : SAT_H;
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

/** Onto a tube at the top of ride `i` (the card first, the first time). */
export const boardTube = (state: GameState, r: TubeRide, i: number, card: boolean) => {
  const T = TUBES[i], p = state.player, at = PATHS[i][0].segs[0];
  Object.assign(r, { i, mode: card ? 'card' : 'ride', x: at.x0, y: at.y0, vy: 0, air: false, coyote: 0, rideY: at.y0, jumpWas: true, camY: at.y0 - 400, t: 0, sent: 0, killed: 0, escort: [], spawnIn: 60, cleared: false, fallT: 0 });
  void T;
  p.carried = true; p.logSeat = true; p.noSpecials = true; p.facing = 1;
  p.isCharging = false; p.isSliding = false; p.isDivekicking = false; p.isUppercutting = false;
  place(state, r);
  playSound('splash', 0.8, -2);
  setUi({ noSwitch: true, pauseControls: 'tube' });
};
export const unboardTube = (state: GameState, r: TubeRide) => {
  const p = state.player;
  p.carried = false; p.logSeat = false; p.noSpecials = false; p.spriteRot = 0;
  state.cameraOverride = null;
  setUi({ noSwitch: false, pauseControls: null });
  // (whoever was riding along with him peels off: gone, not killed)
  for (const e of r.escort) if (e.health > 0) state.enemies = state.enemies.filter(x => x !== e);
  r.escort = [];
};
const place = (state: GameState, r: TubeRide) => {
  const p = state.player;
  p.pos.x = r.x - p.width / 2; p.pos.y = r.y - SEAT - p.height;
  p.vel.x = TUBES[r.i].speed; p.vel.y = r.air ? r.vy : 0;
};

/** The carry back round the loop: him, the camera, and everything near him (the aliens, the living and the dead, the
 *  shots, his bullets, the sparks and the blood, what's dropped) by `d`, so nothing on screen moves. */
const carry = (state: GameState, r: TubeRide, d: number) => {
  r.x += d; r.shift -= d;
  state.camera.x += d;
  if (state.cameraOverride) state.cameraOverride.x += d;
  const near = (x: number) => Math.abs(x - (r.x - d)) < 2400;
  const move = (list: { pos: { x: number } }[]) => { for (const o of list) if (near(o.pos.x)) o.pos.x += d; };
  move(state.enemies); move(state.projectiles); move(state.particles); move(state.pickups);
  move(state.enemyDeaths as unknown as { pos: { x: number } }[]);
  for (const e of state.enemies) if (e.homeX !== undefined && near(e.homeX - d)) e.homeX += d;
  for (const n of state.damageNumbers as unknown as { x?: number; pos?: { x: number } }[]) { if (n.pos && near(n.pos.x)) n.pos.x += d; else if (typeof n.x === 'number' && near(n.x)) n.x += d; }
  for (const s of shotsOf(state)) if (near(s.x)) s.x += d;
};

export interface TubeEvents { onEnd: () => void; onFall: () => void; onClear: () => void }

/** A frame of the ride. Returns what the engine's to have (left and right do nothing: it's the tube's pace; jump's the
 *  tube's jump). */
export const updateTube = (ctx: FrameContext, r: TubeRide, controls: Controls, ev: TubeEvents): Controls => {
  const { state } = ctx, p = state.player, T = TUBES[r.i], paths = PATHS[r.i];
  if (r.mode === 'off' || r.mode === 'done') return controls;
  if (p.health <= 0) { r.mode = 'off'; unboardTube(state, r); return controls; }
  if (r.mode === 'card') { place(state, r); p.isGrounded = true; state.cameraOverride = { x: Math.max(0, r.x - 250), y: r.camY }; return { left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false }; }
  r.t++;
  // ---- down the drop, tube and all: the camera holds, he goes down into the dark (the engine's fall death has him)
  if (r.mode === 'fall') {
    r.fallT++;
    r.vy = Math.min(18, r.vy + JUMP_G);
    r.y += r.vy; r.x += T.speed * 0.4;
    place(state, r);
    p.isGrounded = false; p.logSeat = true; p.spriteRot = Math.min(1.2, r.fallT * 0.03);
    state.cameraOverride = { x: Math.max(0, r.x - 250 - T.speed * 0.4 * r.fallT * 0.5), y: r.camY };
    setUi({ noSwitch: true, pauseControls: 'tube' });
    return { ...controls, left: false, right: false, jump: false, special: false, charge: false, up: false, shoot: false };
  }
  const wasX = r.x, wasY = r.y;
  r.x += T.speed;
  // ---- round the loop again (the aliens not all dead yet): carried back to its start, the same chute either side
  if (!r.cleared && r.x >= T.loop.a + T.loop.len) carry(state, r, -T.loop.len);
  const crossedFrom = r.x < wasX ? wasX - T.loop.len : wasX;
  const under = chuteAt(r.i, r.x);
  // ---- the jump (tube and all): on the chute, or just off an end (the edge's grace)
  // (dev only: window.__wpAutoTube set, it jumps the gaps itself: the headless checks and the perf run ride it through)
  const auto = import.meta.env.DEV && !!(window as unknown as { __wpAutoTube?: boolean }).__wpAutoTube;
  const autoJump = auto && !r.air && T.gaps.some(([g1]) => g1 - r.x > 0 && g1 - r.x < T.speed * 3);
  const jumpNow = !!controls.jump || autoJump || (auto && r.air && r.vy < 0), jumpEdge = jumpNow && !r.jumpWas;
  r.jumpWas = jumpNow;
  if (!r.air && !under) { r.air = true; r.vy = 0; r.coyote = COYOTE; }
  if (jumpEdge && (!r.air || r.coyote > 0)) {
    r.air = true; r.vy = -JUMP_V; r.coyote = 0;
    playSound('jump', 0.7); playSound('splash', 0.4, 4);
  }
  if (r.air) {
    r.coyote = Math.max(0, r.coyote - 1);
    r.vy += jumpNow && r.vy < 0 ? JUMP_G_HELD : JUMP_G;
    r.y += r.vy;
    if (under && r.vy > 0) {
      if (r.y >= under.y && wasY <= under.y + 8) {
        // (down onto the chute: a splash, a thud)
        r.air = false; r.y = under.y; r.vy = 0;
        playSound('splash', 0.7, -4); playSound('thud', 0.4, -2); shakeScreen(state, 4, 2);
        for (let k = 0; k < 12; k++) state.particles.push({ pos: { x: r.x, y: r.y - 4 }, vel: { x: (Math.random() - 0.3) * 6, y: -2 - Math.random() * 4 }, life: 24, color: k % 2 ? '#E0F2FE' : '#93C5FD', size: 2 + Math.random() * 3 });
      } else if (r.y > under.y + 8 && !chuteAt(r.i, crossedFrom)) {
        // (short: into the far side's broken end. Down its face he goes)
        r.x = crossedFrom;
      }
    }
    // (below where he could still come down on the chute (the far side's start, over a gap): gone. The drop has him)
    const floor = under ? under.y : Math.max(r.rideY, nextStartY(r.i, r.x));
    if (r.air && r.y > floor + 40) {
      r.mode = 'fall'; r.fallT = 0;
      playSound('whoosh', 0.9, -10);
      ev.onFall();
      place(state, r);
      return { ...controls, left: false, right: false, jump: false, special: false, charge: false, up: false, shoot: false };
    }
  }
  if (!r.air && under) { r.y = under.y; r.rideY = under.y; }
  p.spriteRot = r.air || !under ? 0 : under.a;
  if (r.t % 7 === 0 && !r.air) playSound('splash', 0.1, 8 + Math.random() * 4);
  // ---- the end: into the splash pool, out of the tube, into the water
  const last = paths[paths.length - 1], endX = last.segs[last.segs.length - 1].x1;
  if (r.x >= endX - 2 && !r.air) {
    r.mode = 'done';
    unboardTube(state, r);
    p.pos.x = r.x - p.width / 2; p.pos.y = r.y - p.height - 4; p.vel.x = 6; p.vel.y = -5; p.isGrounded = false;
    playSound('splash', 1, -10); playSound('splash', 0.9, -2); shakeScreen(state, 10, 5);
    for (let k = 0; k < 40; k++) state.particles.push({ pos: { x: r.x + 30, y: T.pool.surface }, vel: { x: (Math.random() - 0.2) * 8, y: -3 - Math.random() * 9 }, life: 40, color: k % 3 ? '#E0F2FE' : '#7DD3FC', size: 2 + Math.random() * 4 });
    ev.onEnd();
    return controls;
  }
  // ---- the low pipes over the chute: sat up (or up in a jump) as one goes over, it's his head
  for (const x of T.pipes) {
    if (!(crossedFrom < x && r.x >= x)) continue;
    const top = r.y - SEAT - (tubeDucked(state, r) ? DUCK_H : SAT_H), pipeY = (chuteAt(r.i, x)?.y ?? r.y) - PIPE_CLEAR;
    if (top < pipeY && r.y - SEAT > pipeY - 26 && p.invincibilityTimer <= 0) { hurtPlayer(ctx, 14, 'm2:wp_pipe', { x: -2, y: 0 }, 14); playSound('clang', 0.9, -4); shakeScreen(state, 8, 4); }
  }
  // ---- the aliens: sent in one at a time, no more than the ride's most at once, till its count's all dead
  for (const e of r.escort) if (e.health <= 0 || !state.enemies.includes(e)) { if (e.health <= 0) r.killed++; }
  r.escort = r.escort.filter(e => e.health > 0 && state.enemies.includes(e));
  if (!r.cleared && r.killed >= T.foes) { r.cleared = true; ev.onClear(); }
  r.spawnIn--;
  if (!r.cleared && r.sent < T.foes && r.escort.length < T.most && r.spawnIn <= 0) {
    r.sent++; r.spawnIn = SPAWN_GAP;
    // (in from the right, on screen from the start: enemies-always-visible)
    const e = makeKindEnemy(HOVER as EnemyKind, state.camera.x + CANVAS_WIDTH - 90, r.rideY - 250);
    e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y; e.variant = r.sent * 5 + r.i; e.seen = true;
    state.enemies.push(e); r.escort.push(e);
    playSound('rayFizzle', 0.5, -6);
    for (let k = 0; k < 10; k++) state.particles.push({ pos: { x: e.pos.x + e.width / 2, y: e.pos.y + e.height - 6 }, vel: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 3 }, life: 20, color: k % 2 ? '#86EFAC' : '#F0ABFC', size: 2 + Math.random() * 2 });
  }
  // (each one riding along: now and then it drops down onto the chute ahead and fires back along it, low (jump it) or
  // at head height (duck it): the tell's where it holds, the coil glowing, and the height it's at)
  for (const e of r.escort) {
    e.aiX = (e.aiX ?? 0) + 1;
    const k = e.aiX % 300;
    if (k === 160) { e.aiY = Math.random() < 0.5 ? 1 : 2; }
    if (k > 160 && k < 230 && e.aiY) {
      const low = e.aiY === 1, ty = r.rideY - SEAT - (low ? 14 : 50);
      // (out ahead of him at the bolt's height, hovering there)
      e.pos.x += ((r.x + 300) - (e.pos.x + e.width / 2)) * 0.2 + T.speed;
      e.pos.y += (ty - (e.pos.y + e.height - 10)) * 0.2;
      e.aiState = 'skim'; e.aiTimer = 0;
      if (k === 214) { fire(state, { x: e.pos.x, y: ty, vx: -6.5, vy: 0, kind: 'bolt', src: 'm2:wp_bolt', dmg: 12 }); playSound('rayFizzle', 0.5, low ? -2 : 4); }
    }
    if (k === 232) { e.aiY = 0; e.aiState = 'idle'; }
  }
  // ---- where he is, the camera (kept to the chute's height, not his jumps)
  place(state, r);
  p.isGrounded = !r.air; p.logSeat = true; p.facing = 1;
  const ty = r.rideY - 400;
  r.camY += (ty - r.camY) * 0.1;
  state.cameraOverride = { x: Math.max(0, r.x - 250), y: r.camY };
  setUi({ noSwitch: true, pauseControls: 'tube' });
  // (left and right do nothing (the tube's pace), jump's the tube's; down's his duck; he can shoot)
  return { ...controls, left: false, right: false, jump: false, special: false, charge: false, up: false };
};
export type { Tube };
