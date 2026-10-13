// The shooter, wave by wave, by how far the screen's scrolled (the camera's offset into the section). Teach, then
// escalate: a few fighters that don't shoot back, then ones that do, then rocks to get round; kamikazes, junk with
// guns on it, mines; then the cruisers' beams, fighters up from behind him, and all of it at once; a breather, the
// refill, the saucer. ~18800 px of scroll (~3 minutes).
//
// Checkpoints (index.ts): 51 after the lessons, 52 and 53 in the thick of it, 54 at the saucer.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { pickLine } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { spawn, pilotOf, K, type Path } from './kinds';
import { addRock, addJunk, bark } from './hazards';
import { PILOT_SPOT } from './lines';
import { orbitOf } from './state';
import { hatch, spewed } from './ufo';
import { CY, X0 } from './geo';

/** Just off the right of the screen (world x), `dx` further. */
const R = (state: GameState, dx = 0) => state.camera.x + 860 + dx;

/** Out of the saucer's hatch, if it's about (one after another, as far apart as `dx` says), or in from the right. */
const out = (state: GameState, dx: number, make: (x: number, y: number | null) => Enemy): Enemy | undefined => {
  const h = hatch(state);
  if (!h) return make(R(state, dx), null);
  const o = orbitOf(state);
  const go = () => { const e = make(h.x, h.y); spewed(state); return e; };
  if (dx <= 0) return go();
  o.pending.push({ at: state.frame + Math.round(dx / 2.4), go: () => { const g = hatch(state); if (g) { h.x = g.x; h.y = g.y; } go(); } });
  return undefined;
};
const fighter = (state: GameState, sy: number, path: Path, o: { dx?: number; armed?: boolean; speed?: number; amp?: number; phase?: number; hold?: number; sit?: number; dir?: number; every?: number; loopX?: number } = {}) => {
  const p = { path, sy, armed: o.armed, speed: o.speed, amp: o.amp, phase: o.phase, hold: o.hold, sit: o.sit, dir: o.dir, every: o.every, loopX: o.loopX };
  if (path === 'behind') return spawn(state, K.fighter, state.camera.x - 70 - (o.dx ?? 0), CY + sy, p);
  return out(state, o.dx ?? 0, (x, y) => spawn(state, K.fighter, x, y ?? CY + sy, { ...p, ey: y ?? undefined }));
};
const kami = (state: GameState, sy: number, dx = 0, hold = 680) => out(state, dx, (x, y) => spawn(state, K.kamikaze, x, y ?? CY + sy, { hold }));
const mine = (state: GameState, sy: number, dx = 0) => spawn(state, K.mine, R(state, dx), CY + sy, { phase: Math.random() * 100 });
const cruiser = (state: GameState, sy: number, sx = 500, shots = 2, dx = 0) => spawn(state, K.cruiser, R(state, 120 + dx), CY + sy, { sy, sx, every: shots });
/** A piece of junk, drifting in, with gun pods on it (where on it: offsets from its middle, on its top or bottom edge). */
const junk = (state: GameState, sy: number, what: number, pods: number[], dx = 0, vx = -0.35) => {
  const j = addJunk(state, R(state, 120 + dx), CY + sy, what, vx, 0, 0);
  const h = j.junk!.h;
  pods.forEach((px, i) => spawn(state, K.turret, j.x + px, j.y, { on: j, dx: px, dy: i % 2 === 0 ? -h / 2 + 2 : h / 2 + 32 }));
  return j;
};
const rocks = (state: GameState, n: number, opts: { spread?: number; y0?: number; y1?: number; speed?: number; big?: boolean } = {}) => {
  for (let i = 0; i < n; i++) {
    const y = (opts.y0 ?? 60) + Math.random() * ((opts.y1 ?? 560) - (opts.y0 ?? 60));
    const r = opts.big && i % 3 === 0 ? 34 + Math.random() * 8 : 16 + Math.random() * 14;
    addRock(state, R(state, 60 + i * (opts.spread ?? 160) + Math.random() * 60), CY + y, r, -(opts.speed ?? 0.9) - Math.random() * 0.8, (Math.random() - 0.5) * 0.5);
  }
};
const line = (state: GameState, n: number, sy: number, path: Path, gap = 70, o: Parameters<typeof fighter>[3] = {}) => {
  const list: (Enemy | undefined)[] = [];
  for (let i = 0; i < n; i++) list.push(fighter(state, sy, path, { ...o, dx: (o.dx ?? 0) + i * gap }));
  return list;
};
const vee = (state: GameState, sy: number, armed: boolean, dx = 0) => {
  const list: (Enemy | undefined)[] = [];
  for (const [x, y] of [[0, 0], [50, -55], [50, 55], [100, -110], [100, 110]]) list.push(fighter(state, sy + y, 'line', { dx: dx + x, armed, speed: 2.2, every: 150 }));
  return list;
};

/** Now and then one of a wave yells at him about Zorblax (how he's dressed in that suit, as they see it). */
const spot = (state: GameState, e?: Enemy) => {
  const o = orbitOf(state);
  if (!e || state.frame - o.lastBark < 420) return;
  const pool = isNude(state) ? PILOT_SPOT.nude : isShat(state) ? PILOT_SPOT.shitty : PILOT_SPOT.clean;
  bark(state, e, pickLine(pool), !!pilotOf(e)?.female);
};

export interface Wave { at: number; go: (ctx: FrameContext) => void }

export const WAVES: Wave[] = [
  // --- Lessons: shoot them (they don't shoot back), then dodge them, then get round the rocks ---
  { at: 500, go: ({ state }) => { fighter(state, 220, 'line'); fighter(state, 360, 'line', { dx: 160 }); spot(state, fighter(state, 290, 'line', { dx: 320 })); } },
  { at: 1250, go: ({ state }) => { line(state, 5, 300, 'sine', 64, { amp: 110 }); } },
  { at: 2000, go: ({ state }) => { const a = fighter(state, 160, 'swoop', { armed: true, hold: 600, every: 110 }); fighter(state, 440, 'swoop', { armed: true, hold: 640, dx: 80, every: 110 }); spot(state, a); } },
  { at: 2800, go: ({ state }) => { rocks(state, 7, { spread: 150 }); } },
  { at: 3700, go: ({ state }) => { spot(state, vee(state, 300, true)[0]); } },
  // --- Kamikazes, junk with guns on it, mines ---
  { at: 4700, go: ({ state }) => { kami(state, 300); } },
  { at: 5250, go: ({ state }) => { kami(state, 150); kami(state, 450, 160, 720); fighter(state, 300, 'sine', { amp: 60, dx: 300 }); } },
  { at: 5900, go: ({ state }) => { junk(state, 180, 0, [-40, 40]); rocks(state, 4, { spread: 260, y0: 330, y1: 560 }); } },
  { at: 6600, go: ({ state }) => { junk(state, 430, 1, [0, -20], 0, -0.25); line(state, 4, 150, 'line', 80, { armed: true, every: 170 }); } },
  { at: 7300, go: ({ state }) => { for (const [y, dx] of [[90, 0], [210, 60], [330, 0], [450, 60], [560, 0]] as const) mine(state, y, dx); line(state, 4, 270, 'sine', 70, { amp: 40, dx: 400 }); } },
  { at: 8000, go: ({ state }) => { for (const [y, dx] of [[150, 0], [400, 120], [270, 260], [520, 380], [90, 420]] as const) mine(state, y, dx); kami(state, 300, 300); } },
  { at: 8700, go: ({ state }) => { spot(state, vee(state, 200, true)[0]); kami(state, 470, 260, 700); rocks(state, 3, { spread: 200, y0: 380 }); } },
  // --- The beams; fighters up from behind him ---
  { at: 9800, go: ({ state }) => { const c = cruiser(state, 300, 500, 2); spot(state, c); } },
  { at: 10900, go: ({ state }) => { line(state, 4, 120, 'behind', 70, { speed: 3.4, armed: true, every: 140 }); } },
  { at: 11500, go: ({ state }) => { for (let i = 0; i < 8; i++) mine(state, 70 + ((i * 130) % 500), i * 90); line(state, 5, 300, 'sine', 70, { amp: 150, armed: true, every: 200, dx: 200 }); } },
  { at: 12400, go: ({ state }) => { junk(state, 140, 0, [-50, 50]); junk(state, 470, 2, [0], 280, -0.3); kami(state, 320, 500); } },
  { at: 13200, go: ({ state }) => { const c = cruiser(state, 150, 520, 2); spot(state, c); fighter(state, 450, 'swoop', { armed: true, hold: 520, every: 90, sit: 260 }); } },
  { at: 14000, go: ({ state }) => { line(state, 3, 480, 'behind', 80, { speed: 3.6, armed: true, every: 130 }); rocks(state, 6, { spread: 140, big: true, speed: 1.4 }); } },
  // --- All of it ---
  { at: 15000, go: ({ state }) => { cruiser(state, 130, 540, 2); cruiser(state, 470, 470, 2, 400); for (let i = 0; i < 4; i++) mine(state, 300 + (i % 2 ? 60 : -60), 200 + i * 160); } },
  { at: 16200, go: ({ state }) => { junk(state, 300, 0, [-50, 50, 0], 0, -0.2); rocks(state, 8, { spread: 120, big: true, speed: 1.5 }); kami(state, 120, 400); kami(state, 500, 700, 720); } },
  { at: 17100, go: ({ state }) => {
    spot(state, vee(state, 300, true)[0]);
    line(state, 4, 110, 'loop', 70, { armed: true, every: 160, dx: 300, loopX: 470, dir: -1 });
    line(state, 4, 500, 'loop', 70, { armed: true, every: 160, dx: 300, loopX: 470, dir: 1 });
    line(state, 3, 300, 'behind', 80, { speed: 3.4, dx: 120 });
  } },
  { at: 17700, go: ({ state }) => { kami(state, 200); kami(state, 400, 120, 720); kami(state, 300, 260, 640); } },
];

/** Waves as the screen gets to them (all of them before where it's started from, skipped). */
export const runWaves = (ctx: FrameContext) => {
  const o = orbitOf(ctx.state), off = o.scroll - X0;
  if (o.pending.length) { const now = o.pending.filter(q => q.at <= ctx.state.frame); o.pending = o.pending.filter(q => q.at > ctx.state.frame); for (const q of now) q.go(); }
  while (o.wave < WAVES.length && WAVES[o.wave].at <= off) WAVES[o.wave++].go(ctx);
};
/** Starting from a checkpoint: what's behind it is gone already. */
export const skipWavesTo = (state: GameState, off: number) => {
  const o = orbitOf(state);
  o.wave = 0;
  while (o.wave < WAVES.length && WAVES[o.wave].at < off) o.wave++;
};
