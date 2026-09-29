// The tram up the mountain. The cabin is a real room of blocks that travels up
// the cable, carrying everything inside it along. Board it at the lower
// station and the doors shut; for the whole ride things smash in through the
// windows and drop through the roof hatch. Kill everything. At the top the exit
// only opens once the cabin's clear.

import type { Block, Enemy, EnemyKind } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { makeKindEnemy } from '../../enemies/kinds';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { COURSE, CP } from './course';
import { killPlayer } from '../../player/player';

export const CABIN_W = 560, CABIN_H = 220;
const WALL = 14;
/** How long the ride takes (frames). */
export const RIDE = 2160;
const CLOSE_FRAMES = 60;

/** Back windows (centre x, relative to the cabin). */
export const BACK_WINDOWS = [110, 280, 450];
export type Entry = 'left' | 'right' | 'back0' | 'back1' | 'back2' | 'roof';
export const WAVES: { t: number; spawns: [EnemyKind, Entry][] }[] = [
  { t: 150, spawns: [['wolverine', 'left'], ['wolverine', 'right']] },
  { t: 440, spawns: [['eagle', 'back1'], ['shooter', 'roof']] },
  { t: 780, spawns: [['goat', 'right'], ['charger', 'left']] },
  { t: 1120, spawns: [['eagle', 'back0'], ['wolverine', 'right']] },
  { t: 1460, spawns: [['shielder', 'roof'], ['shooter', 'back1']] },
  { t: 1800, spawns: [['charger', 'right'], ['eagle', 'back1']] },
];

/** How long before a wave you see it coming: shapes at the glass, thumps, the hatch rattling. */
export const WARN_FRAMES = 80;
/** Thumps on the cabin before a wave (frames before it). */
const THUMPS = [64, 40, 16];

/** The wave that's about to come in, and how far off it is (frames), while it's being telegraphed. */
export const incomingWave = (tram: Tram) => {
  if (tram.phase !== 'riding' || tram.wave >= WAVES.length) return null;
  const left = WAVES[tram.wave].t - tram.t;
  return left <= WARN_FRAMES ? { spawns: WAVES[tram.wave].spawns, left } : null;
};

export type TramPhase = 'docked' | 'closing' | 'riding' | 'arrived' | 'open' | 'done';

export interface Tram {
  phase: TramPhase;
  t: number;
  x: number;
  y: number;
  blocks: { floor: Block; roof: Block; left: Block; right: Block };
  /** Back windows smashed in so far, and the door windows (left, right). */
  broken: boolean[];
  doorBroken: [boolean, boolean];
  wave: number;
  /** Frames the roof hatch has been swinging open. */
  hatch: number;
}

const cabinBlocks = (x: number, y: number) => ({
  floor: { x, y, w: CABIN_W, h: 16, type: 'platform' as const, hidden: true, tag: 'tram', indoor: true },
  roof: { x, y: y - CABIN_H, w: CABIN_W, h: WALL, type: 'wall' as const, hidden: true, tag: 'tram' },
  left: { x, y: y - CABIN_H, w: WALL, h: CABIN_H, type: 'wall' as const, hidden: true, tag: 'tram' },
  right: { x: x + CABIN_W - WALL, y: y - CABIN_H, w: WALL, h: CABIN_H, type: 'wall' as const, hidden: true, tag: 'tram' },
});

export const createTram = (state: GameState, startedAt: number): Tram => {
  const atTop = startedAt >= CP.TOP;
  const x = atTop ? COURSE.tram.toX : COURSE.tram.x;
  const y = atTop ? COURSE.tram.toY : COURSE.tram.y;
  const blocks = cabinBlocks(x, y);
  // Docked at the bottom: open on the left to walk in. Parked at the top: open on the right.
  state.blocks.push(blocks.floor, blocks.roof, atTop ? blocks.left : blocks.right);
  return { phase: atTop ? 'done' : 'docked', t: 0, x, y, blocks, broken: BACK_WINDOWS.map(() => atTop), doorBroken: [atTop, atTop], wave: 0, hatch: 0 };
};

const inCabin = (tram: Tram, x: number, y: number, pad = 0) =>
  x > tram.x - pad && x < tram.x + CABIN_W + pad && y > tram.y - CABIN_H - 40 && y < tram.y + 10;

const addBlock = (state: GameState, b: Block) => { if (!state.blocks.includes(b)) state.blocks.push(b); };
const removeBlock = (state: GameState, b: Block) => { state.blocks = state.blocks.filter(x => x !== b); };

/** The lowest the cabin's floor ever is over x on its way up (fall below this and you've fallen off the tram). */
export const tramFloorLineAt = (x: number) => {
  const { x: x0, y: y0, toX, toY } = COURSE.tram;
  const left = Math.max(x0, Math.min(toX, x - CABIN_W));
  return y0 + ((left - x0) / (toX - x0)) * (toY - y0);
};

/** How far below the tram line counts as gone for good (measured from mid-cabin, so it's clear of anyone riding at either end). */
const FALL_KILL_MARGIN = 170;
const FELL_OFF_LINES = ['TOOK THE EXPRESS DOWN', 'LOST IN THE CLOUDS', "SHOULD'VE STAYED ON THE TRAM", 'GRAVITY: 1, MEATHEAD: 0'];

/** Off the tram and into the clouds: no walking it off, no fall to wait through. */
export const checkFellOffTram = (ctx: FrameContext) => {
  const { state } = ctx;
  const p = state.player;
  const px = p.pos.x + p.width / 2;
  if (state.deathTimer > 0 || px < COURSE.gorge.x1 || px > COURSE.gorge.x2) return;
  if (p.pos.y + p.height > tramFloorLineAt(px + CABIN_W / 2) + FALL_KILL_MARGIN) {
    killPlayer(ctx, FELL_OFF_LINES[Math.floor(Math.random() * FELL_OFF_LINES.length)]);
  }
};

/** Enemies inside the cabin that are still alive. */
export const cabinEnemies = (state: GameState, tram: Tram) =>
  state.enemies.filter(e => e.type !== 'boss' && e.health > 0 && !e.isBlownAway && inCabin(tram, e.pos.x + e.width / 2, e.pos.y + e.height / 2, 30));

export const updateTram = (ctx: FrameContext, tram: Tram) => {
  const { state } = ctx;
  const { player } = state;
  const pcx = player.pos.x + player.width / 2;
  tram.t++;
  const holdCamera = () => { state.cameraOverride = { x: tram.x + CABIN_W / 2 - 400, y: tram.y - 430 }; };

  switch (tram.phase) {
    case 'docked':
      // Walked in: the doors shut behind you
      if (pcx > tram.x + 60 && pcx < tram.x + CABIN_W - 40 && Math.abs(player.pos.y + player.height - tram.y) < 30) {
        tram.phase = 'closing'; tram.t = 0;
        addBlock(state, tram.blocks.left);
        // Anything that followed you in gets shoved out first
        pushOut(state, tram);
        playSound('horn');
      }
      break;
    case 'closing':
      holdCamera();
      if (tram.t >= CLOSE_FRAMES) { tram.phase = 'riding'; tram.t = 0; shakeScreen(state, 12, 5); }
      break;
    case 'riding': {
      holdCamera();
      const u = Math.min(1, tram.t / RIDE);
      const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      const nx = COURSE.tram.x + (COURSE.tram.toX - COURSE.tram.x) * e;
      const ny = COURSE.tram.y + (COURSE.tram.toY - COURSE.tram.y) * e;
      moveCabin(state, tram, nx - tram.x, ny - tram.y);
      // Passing a pylon: the cabin jolts
      if (tram.t % 540 === 270) shakeScreen(state, 14, 4);
      // Something's out there: thumping on the glass before it comes through
      const incoming = incomingWave(tram);
      if (incoming && THUMPS.includes(incoming.left)) {
        shakeScreen(state, 6, 2);
        playSound('gun');
        for (const [, entry] of incoming.spawns) {
          const at = entryPoint(tram, entry);
          for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: at.x + (Math.random() - 0.5) * 50, y: at.y + (Math.random() - 0.5) * 40 }, vel: { x: (Math.random() - 0.5) * 2, y: Math.random() * 1.5 }, life: 24, color: '#E0F2FE', size: 2 + Math.random() * 3 });
        }
      }
      while (tram.wave < WAVES.length && tram.t >= WAVES[tram.wave].t) {
        for (const [kind, entry] of WAVES[tram.wave].spawns) burstIn(ctx, tram, kind, entry);
        tram.wave++;
      }
      if (tram.t >= RIDE) { tram.phase = 'arrived'; tram.t = 0; shakeScreen(state, 16, 6); playSound('horn'); }
      break;
    }
    case 'arrived':
      holdCamera();
      // The exit won't open until the cabin's clear
      if (cabinEnemies(state, tram).length === 0 && tram.t > 40) {
        tram.phase = 'open'; tram.t = 0;
        removeBlock(state, tram.blocks.right);
      }
      break;
    case 'open':
      holdCamera();
      if (pcx > tram.x + CABIN_W + 20) {
        tram.phase = 'done';
        state.cameraOverride = null;
        state.checkpoint = Math.max(state.checkpoint, CP.TOP);
      }
      break;
  }
  if (tram.hatch > 0) tram.hatch--;
};

/** Moves the cabin and everything in it. */
const moveCabin = (state: GameState, tram: Tram, dx: number, dy: number) => {
  if (!dx && !dy) return;
  const inside = (x: number, y: number) => inCabin(tram, x, y, 6);
  for (const b of Object.values(tram.blocks)) { b.x += dx; b.y += dy; }
  const p = state.player;
  if (inside(p.pos.x + p.width / 2, p.pos.y + p.height / 2)) { p.pos.x += dx; p.pos.y += dy; }
  for (const e of state.enemies) {
    if (!inside(e.pos.x + e.width / 2, e.pos.y + e.height / 2)) continue;
    e.pos.x += dx; e.pos.y += dy;
    // Their idea of "home" rides along too
    if (e.homeX !== undefined) e.homeX += dx;
    if (e.homeY !== undefined) e.homeY += dy;
    if (e.initialY !== undefined) e.initialY += dy;
    e.initialX += dx;
    if (e.aiX !== undefined) e.aiX += dx;
    if (e.aiY !== undefined) e.aiY += dy;
  }
  for (const pr of state.projectiles) if (inside(pr.pos.x + pr.width / 2, pr.pos.y + pr.height / 2)) { pr.pos.x += dx; pr.pos.y += dy; }
  for (const pk of state.pickups) if (inside(pk.pos.x, pk.pos.y)) { pk.pos.x += dx; pk.pos.y += dy; }
  for (const pa of state.particles) if (inside(pa.pos.x, pa.pos.y)) { pa.pos.x += dx; pa.pos.y += dy; }
  for (const f of state.flameSegments) if (inside(f.x, f.y)) { f.x += dx; f.y += dy; }
  for (const d of state.damageNumbers) if (inside(d.pos.x, d.pos.y)) { d.pos.x += dx; d.pos.y += dy; }
  for (const d of state.enemyDeaths) if (inside(d.x + d.w / 2, d.y + d.h / 2)) { d.x += dx; d.y += dy; d.floorY += dy; }
  tram.x += dx;
  tram.y += dy;
};

/** Boarding: nothing else comes along for the ride uninvited (they come in later, through the windows). */
const pushOut = (state: GameState, tram: Tram) => {
  for (const e of state.enemies) {
    if (e.type === 'boss' || !inCabin(tram, e.pos.x + e.width / 2, e.pos.y + e.height / 2)) continue;
    e.pos.x = tram.x - e.width - 30;
  }
};

/** Where something comes in (world coords, roughly the middle of the opening). */
export const entryPoint = (tram: Tram, entry: Entry) => {
  if (entry === 'left') return { x: tram.x + 8, y: tram.y - 130 };
  if (entry === 'right') return { x: tram.x + CABIN_W - 8, y: tram.y - 130 };
  if (entry === 'roof') return { x: tram.x + CABIN_W / 2, y: tram.y - CABIN_H + 8 };
  return { x: tram.x + BACK_WINDOWS[Number(entry.slice(4))], y: tram.y - 120 };
};

/** Something smashes into the cabin. */
const burstIn = (ctx: FrameContext, tram: Tram, kind: EnemyKind, entry: Entry) => {
  const { state, fx } = ctx;
  const floor = tram.y;
  let x: number, y = floor;
  if (entry === 'left' || entry === 'right') {
    x = entry === 'left' ? tram.x + 44 : tram.x + CABIN_W - 44;
    tram.doorBroken[entry === 'left' ? 0 : 1] = true;
    fx.spawnGlassShatter({ x: entry === 'left' ? tram.x + 8 : tram.x + CABIN_W - 8, y: floor - 130 });
  } else if (entry === 'roof') {
    x = tram.x + CABIN_W / 2;
    y = floor - 120;
    tram.hatch = 40;
  } else {
    const i = Number(entry.slice(4));
    x = tram.x + BACK_WINDOWS[i];
    tram.broken[i] = true;
    fx.spawnGlassShatter({ x, y: floor - 120 });
  }
  const e: Enemy = makeKindEnemy(kind, x, kind === 'eagle' ? floor - 110 : y);
  // They come in already going
  if (entry === 'left' || entry === 'right') e.vel = { x: entry === 'left' ? 5 : -5, y: -6 };
  e.facing = (entry === 'right' ? -1 : 1) as 1 | -1;
  if (kind === 'wolverine') e.aiState = 'bristle';
  if (kind === 'goat') e.aiState = 'paw';
  e.homeX = e.pos.x; e.homeY = e.pos.y;
  ctx.fx.playGunSound('ice');
  state.enemies.push(e);
};
