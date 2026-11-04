// MOUNT EVEREST BUT BETTER: the climb. The owner's: "you go up many many floors of scaffolding, forced to fight enemies
// on each level before you can climb up the next set of stairs."
//
// Floors stacked TOWER.FLOOR apart (geo.ts), the camera held on the floor he's on (the whole of it: everybody on it in
// view). Floor 0 is base camp (the ground; open). On each of floors 1-7, the moment he's up on it the stairs both ways
// are shut (locked in) and they come for him in two waves out of the floor's two staff doors at the back (each door
// rattles and flashes first: the tell; the one away from him). The last of them down: the way up opens (its gate
// swings up), and he walks into it: the stairs are outside the tower, a switchback (each floor's on alternate sides),
// and he's walked up them to the next floor. DOWN at the bottom of the stairs he came up takes him back down them.
// Floor 8 is THE HILLARY STEP (the big refill, the checkpoint: nobody there); its stairs go up to the summit's door.
//
// Checkpoints on floors 3 and 6 and the Hillary Step: back at one, every floor under it's cleared (the world as a run
// left it); the floor he's put on is fought again (its first wave waits till he's had a moment: safe-checkpoints).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind, Block } from '../../../m1/types';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { TOWER, FLOORS, floorY, exitSide, type Who } from './geo';
import { KIND_OF } from './kinds';

const { TL, TR, FLOOR, DECK, STAIR } = TOWER;
/** Each fight floor's waves (floors 1-7). */
const WAVES: Who[][][] = [
  [],
  [['dguest', 'aguest'], ['dguest', 'dguest']],
  [['gator', 'dguest'], ['aguest', 'gator', 'aguest']],
  [['trooper', 'dguest'], ['trooper', 'aguest', 'dguest']],
  [['yeti'], ['dguest', 'aguest', 'gator']],
  [['trooper', 'trooper', 'gator'], ['dguest', 'aguest', 'hover']],
  [['hover', 'dguest', 'aguest'], ['hover', 'trooper', 'yeti']],
  [['yeti', 'trooper', 'dguest'], ['aguest', 'aguest', 'hover', 'trooper']],
];
/** The fight floors. */
export const FIGHT_FLOORS = [1, 2, 3, 4, 5, 6, 7];
/** The staff doors at the back of each floor (world x): where they come out. */
export const DOORS_X = [TL + 150, TR - 150];
/** A door's tell (frames: rattling, its light going), and the gap between who comes out. */
const TELL = 44, GAP = 26;
/** Each floor's ledges to get up on ([x, height over the deck, w]: one-way, crates of fake snow, oxygen tank racks). */
export const FLOOR_LEDGES: [number, number, number][][] = Array.from({ length: FLOORS + 1 }, (_, k) => k === 0 || k >= 8 ? [] : k % 2
  ? [[TL + 230, 110, 130], [TR - 360, 110, 130], [TL + 360, 210, 100]]
  : [[TL + 120, 120, 110], [TR - 230, 120, 110], [TR - 460, 200, 120]]);

export interface Climb { k: number; up: boolean; pts: [number, number][]; s: number; len: number }
export interface Tower {
  cleared: boolean[];
  /** The floor locked in on (a fight on), or null. */
  locked: number | null;
  wave: number; spawnT: number;
  /** Who's still to come out this wave, and the doors' tells going. */
  queue: Who[]; tells: { x: number; t: number; who: Who }[];
  /** This floor's lot (still in the world). */
  cast: Enemy[];
  climb: Climb | null;
  /** Each exit gate's lift (0 shut .. 1 up), by floor. */
  gate: number[];
  downWas: boolean;
}
export const newTower = (clearedBelow: number): Tower => ({
  cleared: Array.from({ length: FLOORS + 1 }, (_, k) => k < clearedBelow || k === 0 || k >= 8),
  locked: null, wave: 0, spawnT: 0, queue: [], tells: [], cast: [], climb: null,
  gate: Array.from({ length: FLOORS + 1 }, (_, k) => (k < clearedBelow || k === 0 || k >= 8 ? 1 : 0)), downWas: true,
});

/** The floor his feet are on (or the nearest under them), inside the tower's span; null outside it. */
export const floorOf = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (cx < TL - STAIR - 40 || cx > TR + STAIR + 40) return null;
  if (feet > floorY(0) - FLOOR + 30 && cx > TL - 900) return 0;
  const k = Math.round((floorY(0) - feet) / FLOOR);
  return Math.max(0, Math.min(FLOORS, k));
};
/** The tower's blocks: the decks (floors 1-9), its walls (the left one leaves base camp's way in open), the ledges. */
export const buildTower = (state: GameState) => {
  for (let k = 1; k <= FLOORS; k++) state.blocks.push({ x: TL, y: floorY(k), w: TR - TL, h: DECK, type: 'wall', hidden: true, tag: `ev-deck-${k}` } as Block);
  state.blocks.push({ x: TL - 40, y: floorY(FLOORS) - 900, w: 40, h: floorY(1) + DECK - (floorY(FLOORS) - 900), type: 'wall', hidden: true, tag: 'ev-wall-l' } as Block);
  state.blocks.push({ x: TR, y: floorY(FLOORS) - 900, w: 40, h: floorY(0) + 40 - (floorY(FLOORS) - 900), type: 'wall', hidden: true, tag: 'ev-wall-r' } as Block);
  for (let k = 0; k <= FLOORS; k++) for (const [x, h, w] of FLOOR_LEDGES[k]) state.blocks.push({ x, y: floorY(k) - h, w, h: 16, type: 'platform', oneWay: true, hidden: true, tag: `ev-ledge-${k}` } as Block);
};

/** The stairs from floor k up to k+1 (a switchback outside the tower, on k's exit side): his feet's path. */
export const stairsOf = (k: number): [number, number][] => {
  const s = exitSide(k), edge = s > 0 ? TR : TL, y0 = floorY(k), y1 = floorY(k + 1);
  return [[edge - s * 20, y0], [edge + s * 10, y0], [edge + s * (STAIR - 20), y0 - FLOOR / 2], [edge + s * (STAIR - 20), y0 - FLOOR / 2], [edge + s * 10, y1], [edge - s * 80, y1]];
};
const lenOf = (pts: [number, number][]) => pts.slice(1).reduce((n, q, i) => n + Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]), 0);
const at = (pts: [number, number][], s: number) => {
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], l = Math.hypot(x1 - x0, y1 - y0);
    if (s <= l || i === pts.length - 1) { const k = l ? Math.min(1, s / l) : 1; return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, dx: x1 - x0 }; }
    s -= l;
  }
  return { x: pts[0][0], y: pts[0][1], dx: 0 };
};

const spawn = (state: GameState, tw: Tower, who: Who, x: number, k: number) => {
  const fy = floorY(k), air = who === 'hover' || who === 'pelican';
  const e = makeKindEnemy(KIND_OF[who] as EnemyKind, x, air ? fy - 200 : fy);
  e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y; e.variant = (k * 13 + tw.cast.length * 7) % 29; e.seen = true;
  e.facing = x < (TL + TR) / 2 ? 1 : -1;
  state.enemies.push(e); tw.cast.push(e);
  playSound('crash', 0.5, 4); shakeScreen(state, 4, 2);
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x, y: fy - 40 }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 3 }, life: 24, color: i % 2 ? '#E8F0FA' : '#A8A29E', size: 3 + Math.random() * 3 });
};

export interface TowerEvents { locked?: number; cleared?: number; arrived?: number }

/** A frame of the tower: the climb, the lock-in, the waves, the gates. Returns the controls (none while he's on the stairs). */
export const updateTower = (ctx: FrameContext, tw: Tower, controls: Controls, ev: TowerEvents): Controls => {
  const { state } = ctx, p = state.player;
  const downEdge = !!controls.down && !tw.downWas;
  tw.downWas = !!controls.down;
  for (let k = 0; k <= FLOORS; k++) tw.gate[k] += ((tw.cleared[k] && tw.locked !== k ? 1 : 0) - tw.gate[k]) * 0.12;
  // ---- on the stairs: walked up (or down) them, his own walk
  if (tw.climb) {
    const c = tw.climb;
    c.s += 3.4;
    const q = at(c.pts, c.up ? c.s : c.len - c.s);
    const ahead = at(c.pts, Math.min(c.len, c.up ? c.s + 4 : c.len - c.s - 4));
    p.pos.x = q.x - p.width / 2; p.pos.y = q.y - p.height;
    const dir = Math.sign(ahead.x - q.x) || p.facing;
    p.facing = dir > 0 ? 1 : -1; p.vel.x = dir * 3.4; p.vel.y = 0;
    if (state.frame % 9 === 0) playSound('click', 0.25, -10);
    if (c.s >= c.len) {
      tw.climb = null; p.carried = false; p.vel.x = 0; p.isGrounded = true;
      ev.arrived = c.up ? c.k + 1 : c.k;
    }
    return { left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false };
  }
  const k = floorOf(state);
  if (k === null || p.health <= 0 || p.inCutscene) return controls;
  const cx = p.pos.x + p.width / 2;
  const onDeck = p.isGrounded && Math.abs(p.pos.y + p.height - floorY(k)) < 4;
  // ---- up on a fight floor not cleared: locked in, and the waves
  if (tw.locked === null && FIGHT_FLOORS.includes(k) && !tw.cleared[k] && onDeck && cx > TL + 20 && cx < TR - 20) {
    tw.locked = k; tw.wave = 0; tw.spawnT = 70; tw.queue = [...WAVES[k][0]]; tw.tells = []; tw.cast = [];
    ev.locked = k;
    playSound('clang', 0.9, -8); playSound('clang', 0.7, -4);
  }
  if (tw.locked !== null) {
    const L = tw.locked;
    tw.cast = tw.cast.filter(e => e.health > 0 && !e.isBlownAway && state.enemies.includes(e));
    if (tw.spawnT > 0) tw.spawnT--;
    // (the next one out: a door's tell first, the door away from him)
    if (tw.spawnT === 0 && tw.queue.length) {
      const who = tw.queue.shift()!;
      const far = DOORS_X.slice().sort((a, b) => Math.abs(b - cx) - Math.abs(a - cx));
      const x = Math.abs(far[1] - cx) > 300 && tw.tells.length % 2 ? far[1] : far[0];
      tw.tells.push({ x, t: TELL, who });
      tw.spawnT = GAP;
      playSound('clang', 0.4, 6);
    }
    for (const t of tw.tells) { t.t--; if (t.t === 0) spawn(state, tw, t.who, t.x, L); if (t.t > 0 && t.t % 8 === 0) playSound('clang', 0.25, 10); }
    tw.tells = tw.tells.filter(t => t.t > 0);
    // (the wave's down: the next, or the floor's clear)
    if (!tw.queue.length && !tw.tells.length && !tw.cast.length && tw.spawnT === 0) {
      if (tw.wave + 1 < WAVES[L].length) { tw.wave++; tw.queue = [...WAVES[L][tw.wave]]; tw.spawnT = 60; }
      else { tw.cleared[L] = true; tw.locked = null; ev.cleared = L; playSound('powerup', 0.7, -2); playSound('clang', 0.8, -6); }
    }
    return controls;
  }
  // ---- the stairs: into the way up (its gate's up), or DOWN at the foot of the way he came up
  if (!onDeck) return controls;
  const side = exitSide(k), edge = side > 0 ? TR : TL;
  const atEdge = (s: number) => (s > 0 ? cx > TR - 40 : cx < TL + 40);
  if (k < FLOORS && tw.cleared[k] && atEdge(side) && (side > 0 ? controls.right : controls.left)) {
    const pts = stairsOf(k);
    tw.climb = { k, up: true, pts, s: 0, len: lenOf(pts) }; p.carried = true;
    void edge;
    return { left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false };
  }
  if (k > 0 && downEdge && atEdge(exitSide(k - 1))) {
    const pts = stairsOf(k - 1);
    tw.climb = { k: k - 1, up: false, pts, s: 0, len: lenOf(pts) }; p.carried = true;
    return { left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false };
  }
  return controls;
};
/** The camera on the floor he's on (its top), or on him on the stairs. */
export const towerCamY = (k: number) => floorY(k) - 560;
