// THE TUBE RIDES (THE BLACK HOLE, THE ABYSS): an inner tube down a long chute over the drained DEEP END, the chute
// broken in places (the tube jumps each gap off a lip), aliens on hover discs riding along shooting at him.
//
// The owner's: "meathead 'locks in' on the tubes so you will have to jump negligently to fall off". He's locked on:
// nothing knocks him off (a shot, a pipe, the tube's jumps: they hurt, that's all) and the tube's always under him. The
// one way off is a careless jump: up in the air off the tube when it reaches a lip, it jumps the gap without him and
// he goes down into the deep end. Every lip's run-up is painted red with NO JUMPING on it (art.ts); over a gap,
// in the tube's own jump, a hop's safe (he comes back down into it).
//
// The controls (the controls card, the first time on; the pause menu's card the whole ride): RIGHT leans on (faster),
// LEFT leans back (slower), JUMP hops (the shots skimming the chute low), DOWN ducks (the shots at head height, the low
// pipes), and he can shoot (no specials: he's sat in a tube).
//
// Into the splash pool at the end: the tube's gone, he's in the water, on he swims.

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
import { pathOf, pointAt, surfaceAt, type Path } from './slides';
import { HOVER, fireBolt, fire } from './kinds';

/** His seat over the chute's surface (feet: down in the tube's hole), the hop, the duck. */
const SEAT = 8, HOP_V = 9.4, HOP_G = 0.5, HOP_G_HELD = 0.36;
/** His box sat up and ducked (from his feet up). */
export const SAT_H = 62, DUCK_H = 32;
/** The tube's own fall over a gap; how much the lean does to its pace. */
const TG = 0.45, LEAN_ON = 1.25, LEAN_BACK = 0.72;
/** A pipe's underside over the chute (sat up he's hit; ducked he's under it). */
export const PIPE_CLEAR = 44;
/** The lips' NO JUMPING run-up (px of chute before each lip). */
export const NO_JUMP = 150;
/** Hover aliens: one comes in every this much chute, at most this many at once. */
const HOVER_EVERY = 820, HOVER_MAX = [2, 3];

export interface TubeRide {
  i: number; mode: 'off' | 'card' | 'ride' | 'lost' | 'done';
  piece: number; s: number; v: number;
  /** The tube: where it is (its bottom, on the chute), its speed, in the air over a gap. */
  x: number; y: number; vx: number; vy: number; air: boolean;
  /** Him: how far up out of it in a hop, and its speed up. */
  up: number; hopV: number; jumpWas: boolean;
  camY: number; t: number;
  /** The pipes passed (each hits once), the hover aliens sent so far, and who's riding along. */
  pipes: Set<number>; sent: number; escort: Enemy[];
  /** The lost tube, flying on without him. */
  lostAt: number;
}
const PATHS: Path[][] = TUBES.map(t => t.pieces.map(pathOf));
export const tubePaths = (i: number) => PATHS[i];

export const newTube = (): TubeRide => ({ i: 0, mode: 'off', piece: 0, s: 0, v: 0, x: 0, y: 0, vx: 0, vy: 0, air: false, up: 0, hopV: 0, jumpWas: true, camY: 0, t: 0, pipes: new Set(), sent: 0, escort: [], lostAt: 0 });
export const tubeOn = (r: TubeRide) => r.mode === 'ride' || r.mode === 'card';
/** Ducked down in it (not mid-hop). */
export const tubeDucked = (state: GameState, r: TubeRide) => !!state.player.isDucking && r.up <= 0;
/** His box riding: sat up or ducked, his hop in it. */
export const tubeBox = (state: GameState, r: TubeRide) => {
  const feet = r.y - SEAT - r.up, h = tubeDucked(state, r) ? DUCK_H : SAT_H;
  return { x: r.x - 16, y: feet - h, w: 32, h };
};

/** Onto a tube at the top of ride `i` (the card first, the first time). */
export const boardTube = (state: GameState, r: TubeRide, i: number, card: boolean) => {
  const T = TUBES[i], p = state.player, P = PATHS[i][0];
  const at = pointAt(P, 0);
  Object.assign(r, { i, mode: card ? 'card' : 'ride', piece: 0, s: 0, v: T.speed * 0.5, x: at.x, y: at.y, vx: 0, vy: 0, air: false, up: 0, hopV: 0, jumpWas: true, camY: at.y - 420, t: 0, pipes: new Set(), sent: 0, escort: [], lostAt: 0 });
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
  p.pos.x = r.x - p.width / 2; p.pos.y = r.y - SEAT - r.up - p.height;
  p.vel.x = r.air ? r.vx : r.v; p.vel.y = 0;
};

/** A frame of the ride. Returns what the engine's to have (his left and right are the lean; jump's the hop). */
export const updateTube = (ctx: FrameContext, r: TubeRide, controls: Controls, onEnd: () => void, onLost: () => void): Controls => {
  const { state } = ctx, p = state.player, T = TUBES[r.i], paths = PATHS[r.i];
  if (r.mode === 'off' || r.mode === 'done') return controls;
  if (r.mode === 'lost') {
    // (the tube going on without him over the gap; him: the engine's, falling)
    r.vy += TG; r.x += r.vx; r.y += r.vy; r.lostAt++;
    return controls;
  }
  if (p.health <= 0) { r.mode = 'off'; unboardTube(state, r); return controls; }
  if (r.mode === 'card') { place(state, r); p.isGrounded = true; state.cameraOverride = { x: Math.max(0, r.x - 260), y: r.camY }; return { left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false }; }
  r.t++;
  const P = paths[r.piece];
  const lean = controls.right ? LEAN_ON : controls.left ? LEAN_BACK : 1;
  const wasX = r.x;
  if (r.air) {
    r.vy += TG; r.x += r.vx; r.y += r.vy;
    const next = paths[r.piece + 1];
    const at = next ? surfaceAt(next, r.x) : null;
    if (at && r.y >= at.y) {
      r.piece++; r.air = false; r.s = at.s; r.y = at.y; r.v = r.vx;
      playSound('splash', 0.8, -6); playSound('thud', 0.5, -4); shakeScreen(state, 6, 3);
      for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: r.x, y: r.y - 4 }, vel: { x: (Math.random() - 0.3) * 6, y: -2 - Math.random() * 4 }, life: 26, color: k % 2 ? '#E0F2FE' : '#93C5FD', size: 2 + Math.random() * 3 });
    }
    // (a tube that somehow misses: it's gone; so's he)
    if (r.y > 2000) { r.mode = 'lost'; onLost(); return controls; }
  } else {
    const here = pointAt(P, r.s);
    const target = T.speed * lean;
    r.v += (target - r.v) * 0.06 + 0.25 * Math.sin(here.a);
    r.v = Math.max(T.speed * 0.6, Math.min(T.speed * 1.5, r.v));
    r.s += r.v;
    const now = pointAt(P, Math.min(r.s, P.len));
    r.x = now.x; r.y = now.y;
    p.spriteRot = r.up > 0 ? 0 : now.a;
    if (r.s >= P.len) {
      if (r.piece === paths.length - 1) {
        // (into the splash pool: out of the tube, into the water)
        r.mode = 'done';
        unboardTube(state, r);
        p.pos.x = r.x - p.width / 2; p.pos.y = r.y - p.height - 4; p.vel.x = 6; p.vel.y = -5; p.isGrounded = false;
        playSound('splash', 1, -10); playSound('splash', 0.9, -2); shakeScreen(state, 10, 5);
        for (let k = 0; k < 40; k++) state.particles.push({ pos: { x: r.x + 30, y: T.pool.surface }, vel: { x: (Math.random() - 0.2) * 8, y: -3 - Math.random() * 9 }, life: 40, color: k % 3 ? '#E0F2FE' : '#7DD3FC', size: 2 + Math.random() * 4 });
        onEnd();
        return controls;
      }
      // (off the lip: the tube jumps the gap, landing on the far side's start whatever its pace)
      const lip = pointAt(P, P.len), nx = paths[r.piece + 1].segs[0];
      r.vx = Math.max(6, r.v * Math.cos(lip.a));
      const t = (nx.x0 + 30 - lip.x) / r.vx;
      r.vy = (nx.y0 - lip.y - 0.5 * TG * t * t) / t;
      r.air = true; r.x = lip.x; r.y = lip.y;
      playSound('whoosh', 0.8, -4);
      // (up out of it as it went: the careless jump. It goes on without him)
      if (r.up > 0) {
        r.mode = 'lost';
        unboardTube(state, r);
        p.vel.x = r.vx * 0.45; p.vel.y = -r.hopV * 0.5; p.isGrounded = false;
        onLost();
        return controls;
      }
    }
  }
  // ---- him: the hop up out of it and back down into it (the tube always under him: he's locked on)
  const jumpNow = !!controls.jump;
  if (jumpNow && !r.jumpWas && r.up <= 0) { r.hopV = HOP_V; r.up = 0.01; playSound('jump', 0.7); playSound('splash', 0.3, 6); }
  r.jumpWas = jumpNow;
  if (r.up > 0) {
    r.hopV -= jumpNow && r.hopV > 0 ? HOP_G_HELD : HOP_G;
    r.up += r.hopV;
    if (r.up <= 0) { r.up = 0; r.hopV = 0; playSound('land', 0.5); playSound('splash', 0.35, 2); }
  }
  // ---- the low pipes over the chute: sat up (or up in a hop) as one goes over, it's his head
  for (const x of T.pipes) {
    if (r.pipes.has(x) || wasX >= x || r.x < x) continue;
    r.pipes.add(x);
    if (!tubeDucked(state, r) && p.invincibilityTimer <= 0) { hurtPlayer(ctx, 14, 'm2:wp_pipe', { x: -2, y: 0 }, 14); playSound('clang', 0.9, -4); shakeScreen(state, 8, 4); }
  }
  // ---- the hover aliens: sent in from ahead as he goes
  const far = r.x - paths[0].segs[0].x0;
  r.escort = r.escort.filter(e => e.health > 0 && state.enemies.includes(e));
  if (far > 500 + r.sent * HOVER_EVERY && r.escort.length < HOVER_MAX[r.i] && r.x < paths[paths.length - 1].segs[0].x0 + 200) {
    r.sent++;
    const e = makeKindEnemy(HOVER as EnemyKind, r.x + CANVAS_WIDTH * 0.8, r.y - 260);
    e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y; e.variant = r.sent * 5 + r.i; e.seen = true;
    state.enemies.push(e); r.escort.push(e);
  }
  // (each one riding along: now and then it drops down onto the chute ahead and fires back along it, low (hop it) or
  // at head height (duck it): the tell's where it holds, the coil glowing, and the height it's at)
  for (const e of r.escort) {
    e.aiX = (e.aiX ?? 0) + 1;
    const k = e.aiX % 300;
    if (k === 160) { e.aiY = Math.random() < 0.5 ? 1 : 2; }
    if (k > 160 && k < 230 && e.aiY) {
      const low = e.aiY === 1, ty = r.y - SEAT - (low ? 14 : 50);
      // (out ahead of him at the bolt's height, hovering there)
      e.pos.x += ((r.x + 300) - (e.pos.x + e.width / 2)) * 0.2 + r.v;
      e.pos.y += (ty - (e.pos.y + e.height - 10) ) * 0.2;
      e.aiState = 'skim'; e.aiTimer = 0;
      if (k === 214) { fire(state, { x: e.pos.x, y: ty, vx: -6.5, vy: 0, kind: 'bolt', src: 'm2:wp_bolt', dmg: 12 }); playSound('rayFizzle', 0.5, low ? -2 : 4); }
    }
    if (k === 232) { e.aiY = 0; e.aiState = 'idle'; }
  }
  void fireBolt;
  // ---- where he is, the camera
  place(state, r);
  p.isGrounded = r.up <= 0; p.logSeat = r.up <= 0; p.facing = 1;
  const ty = r.y - 400;
  r.camY += (ty - r.camY) * 0.15;
  state.cameraOverride = { x: Math.max(0, r.x - 250), y: r.camY };
  setUi({ noSwitch: true, pauseControls: 'tube' });
  // (left and right are the lean, jump's the hop; down's his duck; he can shoot)
  return { ...controls, left: false, right: false, jump: false, special: false, charge: false, up: false };
};

/** The lips' NO JUMPING stretches of ride `i` (world x ranges: the last NO_JUMP px of each piece but the last). */
export const noJumpZones = (i: number): [number, number][] => PATHS[i].slice(0, -1).map(P => { const a = pointAt(P, P.len - NO_JUMP), b = pointAt(P, P.len); return [a.x, b.x]; });
export type { Tube };
