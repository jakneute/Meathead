// The shooter, wave by wave, by how far the screen's scrolled (the camera's offset into the section). One curve, act by
// act, each of the gun's upgrades (gun.ts's LEVEL_AT) landing just before the waves that need it:
//   plain / rapid (0)     lessons: a few slow fighters that don't shoot back, a snake, slow rocks (shot, they break
//                         up), two that sit and shoot.
//   twin streams (2400)   lines of them, faster; mines with a snake through them (shoot the mine as they pass); the
//                         first kamikazes; a field of big rocks (they split).
//   spread (5000)         wide: walls of them top to bottom (a hole in each), two vees at once; junk that breaks up,
//                         gun pods and all; a fuel tank drifting by a pack of them (shoot it as it passes); a torn-off
//                         bit of Space Needle 2.
//   five streams (7600)   swarms: three snakes at once, fighters up from behind him (warned at the left edge first),
//                         the first cruiser; the gift shop's big sign drifting through with kamikazes behind it.
//   plasma (10400)        armor: cruisers (two at once), junk bristling with pods, Star Sled cars off the ride tumbling
//                         through, fuel tanks in a chain, walls that shoot back.
//   THE BEAM (13600)      everything, from everywhere: walls to mow down, then the ones the beam can't reach (behind
//                         him, sat over and under it), cruisers, mines, junk, the sign again, the last kamikaze rush;
//                         the refill; the saucer.
// Hazards pay to shoot: rocks and junk break into scrap that flies on into whoever's near (hazards.ts); mines and fuel
// tanks go off, taking the pack round them with them (and each other: chains); and ignored, all of it's in his way.
// ~18800 px of scroll (~3 minutes).
//
// Checkpoints (index.ts): 51 (4400), 52 (9500), 53 (14700), 54 at the saucer. Nothing comes on in the first few seconds
// after one, and nothing from behind him (he starts on the left).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { pickLine } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
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
type FOpts = { dx?: number; armed?: boolean; speed?: number; amp?: number; phase?: number; hold?: number; sit?: number; dir?: number; every?: number; loopX?: number; edge?: boolean };
/** A fighter on its path. `edge`: in from the screen's right edge in formation (not one by one out of the hatch). */
const fighter = (state: GameState, sy: number, path: Path, o: FOpts = {}) => {
  const p = { path, sy, armed: o.armed, speed: o.speed, amp: o.amp, phase: o.phase, hold: o.hold, sit: o.sit, dir: o.dir, every: o.every, loopX: o.loopX };
  if (path === 'behind') return spawn(state, K.fighter, state.camera.x - 70 - (o.dx ?? 0), CY + sy, p);
  if (o.edge) return spawn(state, K.fighter, R(state, o.dx ?? 0), CY + sy, p);
  return out(state, o.dx ?? 0, (x, y) => spawn(state, K.fighter, x, y ?? CY + sy, { ...p, ey: y ?? undefined }));
};
const kami = (state: GameState, sy: number, dx = 0, hold = 680) => out(state, dx, (x, y) => spawn(state, K.kamikaze, x, y ?? CY + sy, { hold }));
const mine = (state: GameState, sy: number, dx = 0) => spawn(state, K.mine, R(state, dx), CY + sy, { phase: Math.random() * 100 });
const cruiser = (state: GameState, sy: number, sx = 500, shots = 2, dx = 0) => spawn(state, K.cruiser, R(state, 120 + dx), CY + sy, { sy, sx, every: shots });
/** What it takes to break up each kind of junk (shot, beamed or blown up). */
const JUNK_HP = [380, 40, 220, 320, 150, 760];
/** A piece of junk drifting in (`what`: hazards.ts's addJunk), with gun pods on it (where on it: offsets from its middle,
 *  on its top or bottom edge). Shot enough, it breaks up, the pods with it. */
const junk = (state: GameState, sy: number, what: number, pods: number[], dx = 0, vx = -0.35, spin = 0) => {
  const j = addJunk(state, R(state, 120 + dx), CY + sy, what, vx, 0, spin, JUNK_HP[what]);
  const h = j.junk!.h;
  j.riders = pods.map((px, i) => spawn(state, K.turret, j.x + px, j.y, { on: j, dx: px, dy: i % 2 === 0 ? -h / 2 + 2 : h / 2 + 32 }));
  return j;
};
/** A fuel tank drifting in (shot, or run into: it goes off, and whoever's round it with it). */
const tank = (state: GameState, sy: number, dx = 0, vx = -0.3) => junk(state, sy, 1, [], dx, vx, (Math.random() - 0.5) * 0.01);
const rocks = (state: GameState, n: number, opts: { spread?: number; y0?: number; y1?: number; speed?: number; big?: boolean } = {}) => {
  for (let i = 0; i < n; i++) {
    const y = (opts.y0 ?? 60) + Math.random() * ((opts.y1 ?? 560) - (opts.y0 ?? 60));
    const r = opts.big && i % 3 === 0 ? 34 + Math.random() * 8 : 16 + Math.random() * 14;
    addRock(state, R(state, 60 + i * (opts.spread ?? 160) + Math.random() * 60), CY + y, r, -(opts.speed ?? 0.9) - Math.random() * 0.8, (Math.random() - 0.5) * 0.5);
  }
};
const line = (state: GameState, n: number, sy: number, path: Path, gap = 70, o: FOpts = {}) => {
  const list: (Enemy | undefined)[] = [];
  for (let i = 0; i < n; i++) list.push(fighter(state, sy, path, { ...o, dx: (o.dx ?? 0) + i * gap }));
  return list;
};
const vee = (state: GameState, sy: number, armed: boolean, dx = 0, speed = 2.2) => {
  const list: (Enemy | undefined)[] = [];
  for (const [x, y] of [[0, 0], [50, -55], [50, 55], [100, -110], [100, 110]]) list.push(fighter(state, sy + y, 'line', { dx: dx + x, armed, speed, every: 150, edge: true }));
  return list;
};
/** A wall of them top to bottom (`n` of them, in from the right together), the one at `hole` left out (the way through,
 *  if he can't shoot one). */
const wall = (state: GameState, n: number, hole: number, o: FOpts = {}) => {
  const list: (Enemy | undefined)[] = [];
  for (let i = 0; i < n; i++) if (i !== hole) list.push(fighter(state, 70 + (i * 480) / (n - 1), 'line', { speed: 2.2, every: 220, ...o, edge: true, phase: i * 0.7 }));
  return list;
};
/** Fighters up from behind him: the warning at the left edge first (a second), then them. */
const behind = (state: GameState, n: number, sy: number, gap = 80, o: FOpts = {}) => {
  const ob = orbitOf(state);
  ob.warns.push({ sy, t: WARN_T });
  playSound('alert', 0.6, 2);
  ob.pending.push({ at: state.frame + WARN_T - 10, go: () => { line(state, n, sy, 'behind', gap, { speed: 3.2, ...o }); } });
};
const WARN_T = 70;

/** Now and then one of a wave yells at him about Zorblax (how he's dressed in that suit, as they see it). */
const spot = (state: GameState, e?: Enemy) => {
  const o = orbitOf(state);
  if (!e || state.frame - o.lastBark < 420) return;
  const pool = isNude(state) ? PILOT_SPOT.nude : isShat(state) ? PILOT_SPOT.shitty : PILOT_SPOT.clean;
  bark(state, e, pickLine(pool), !!pilotOf(e)?.female);
};
const first = (l: (Enemy | undefined)[]) => l.find(e => e);

export interface Wave { at: number; go: (ctx: FrameContext) => void }

export const WAVES: Wave[] = [
  // --- The plain gun, then rapid (800): shoot them (they don't shoot back), the snake, the rocks (they break), dodge ---
  { at: 500, go: ({ state }) => { fighter(state, 220, 'line', { speed: 1.8 }); fighter(state, 360, 'line', { dx: 160, speed: 1.8 }); spot(state, fighter(state, 290, 'line', { dx: 320, speed: 1.8 })); } },
  { at: 1100, go: ({ state }) => { line(state, 5, 300, 'sine', 64, { amp: 100, speed: 2 }); } },
  { at: 1700, go: ({ state }) => { rocks(state, 5, { spread: 170, speed: 0.5 }); fighter(state, 150, 'line', { dx: 500, speed: 1.8 }); } },
  { at: 2100, go: ({ state }) => { const a = fighter(state, 160, 'swoop', { armed: true, hold: 600, every: 150 }); fighter(state, 440, 'swoop', { armed: true, hold: 640, dx: 80, every: 150 }); spot(state, a); } },

  // --- Twin streams (2400): lines, faster; mines with a snake through them; the first kamikazes; big rocks ---
  { at: 2550, go: ({ state }) => { line(state, 5, 170, 'line', 64, { speed: 2.8, edge: true }); line(state, 5, 430, 'line', 64, { speed: 2.8, armed: true, every: 190, edge: true, dx: 120 }); } },
  { at: 3100, go: ({ state }) => {
    for (const [y, dx] of [[210, 0], [390, 0], [300, 90], [160, 200], [440, 200]] as const) mine(state, y, dx);
    spot(state, first(line(state, 6, 300, 'sine', 60, { amp: 130, speed: 2.4, dx: 120 })));
  } },
  { at: 3650, go: ({ state }) => { kami(state, 300); kami(state, 150, 260, 700); kami(state, 450, 360, 640); rocks(state, 2, { spread: 300, y0: 80, y1: 520 }); } },
  { at: 4100, go: ({ state }) => { rocks(state, 8, { spread: 120, big: true, speed: 1.1 }); line(state, 3, 300, 'sine', 70, { amp: 160, dx: 600, speed: 2.2 }); } },
  // (checkpoint 51: 4400)
  { at: 4750, go: ({ state }) => { spot(state, first(vee(state, 300, true))); kami(state, 140, 400); kami(state, 460, 520, 720); } },

  // --- The spread (5000): walls top to bottom, two vees at once; junk that breaks up; a fuel tank by a pack of them ---
  { at: 5100, go: ({ state }) => { wall(state, 7, 2); wall(state, 7, 5, { dx: 240 }); } },
  { at: 5700, go: ({ state }) => {
    junk(state, 130, 0, [-45, 45], 0, -0.3);
    for (const [sy, hold] of [[230, 520], [370, 520], [230, 600], [370, 600]] as const) fighter(state, sy, 'swoop', { armed: true, hold, sit: 320, every: 200, edge: true });
    tank(state, 300, 100, -0.45);
  } },
  { at: 6300, go: ({ state }) => { spot(state, first(vee(state, 160, true, 0, 2.6))); vee(state, 440, true, 140, 2.6); rocks(state, 4, { spread: 200, y0: 260, y1: 340 }); } },
  { at: 6900, go: ({ state }) => {
    junk(state, 300, 3, [-50, 50], 0, -0.3, 0.002);
    line(state, 5, 300, 'sine', 64, { amp: 200, speed: 2.6, dx: 260, edge: true });
    line(state, 5, 300, 'sine', 64, { amp: 200, speed: 2.6, dx: 260, phase: Math.PI, edge: true });
  } },
  { at: 7350, go: ({ state }) => { tank(state, 160, 0); tank(state, 300, 40); tank(state, 440, 0); wall(state, 7, 3, { armed: true, dx: 160 }); } },

  // --- Five streams (7600): swarms; from behind him; the first cruiser; the gift shop's sign, kamikazes behind it ---
  { at: 7700, go: ({ state }) => {
    for (const [sy, ph, dx] of [[150, 0, 0], [300, 1.2, 160], [450, 2.4, 320]] as const) line(state, 5, sy, 'sine', 56, { amp: 70, phase: ph, speed: 2.6, dx, edge: true, armed: sy === 300, every: 200 });
  } },
  { at: 8250, go: ({ state }) => {
    spot(state, cruiser(state, 300, 540, 2));
    for (const [y, dx] of [[110, 100], [490, 100], [200, 300], [400, 300]] as const) mine(state, y, dx);
    kami(state, 140, 500, 640);
  } },
  { at: 8850, go: ({ state }) => { behind(state, 4, 160, 80, { armed: true, every: 170 }); line(state, 4, 440, 'sine', 64, { amp: 60, speed: 2.8, edge: true, dx: 80 }); } },
  { at: 9250, go: ({ state }) => {
    junk(state, 300, 5, [], 0, -0.28, 0.001);
    kami(state, 300, 360, 720); kami(state, 220, 520, 740); kami(state, 380, 680, 700);
    fighter(state, 90, 'swoop', { armed: true, hold: 560, every: 170, sit: 260, edge: true, dx: 100 });
    fighter(state, 520, 'swoop', { armed: true, hold: 560, every: 170, sit: 260, edge: true, dx: 100 });
  } },
  // (checkpoint 52: 9500)
  { at: 9800, go: ({ state }) => {
    junk(state, 140, 0, [-50, 50, 0]); junk(state, 470, 2, [0], 260, -0.3);
    line(state, 4, 110, 'loop', 70, { armed: true, every: 180, dx: 400, loopX: 470, dir: -1 });
    line(state, 4, 500, 'loop', 70, { armed: true, every: 180, dx: 400, loopX: 470, dir: 1 });
  } },
  { at: 10200, go: ({ state }) => { rocks(state, 10, { spread: 110, big: true, speed: 1.4 }); tank(state, 200, 200, -0.5); tank(state, 420, 420, -0.5); kami(state, 300, 300); } },

  // --- Plasma (10400): armor. Cruisers, junk bristling with pods, Star Sled cars, walls that shoot back ---
  { at: 10550, go: ({ state }) => {
    spot(state, cruiser(state, 300, 520, 3));
    fighter(state, 110, 'swoop', { armed: true, hold: 600, every: 130, sit: 300, edge: true });
    fighter(state, 500, 'swoop', { armed: true, hold: 600, every: 130, sit: 300, edge: true, dx: 60 });
  } },
  { at: 11100, go: ({ state }) => {
    for (const [sy, dx] of [[130, 0], [300, 220], [470, 440]] as const) junk(state, sy, 4, [], dx, -1.1, (Math.random() - 0.5) * 0.05);
    wall(state, 7, 4, { armed: true, dx: 700, speed: 2.4 });
  } },
  { at: 11700, go: ({ state }) => {
    spot(state, cruiser(state, 140, 560, 2)); cruiser(state, 460, 460, 2, 300);
    for (let i = 0; i < 6; i++) mine(state, 230 + (i % 2) * 140, 120 + i * 120);
  } },
  { at: 12300, go: ({ state }) => {
    junk(state, 140, 0, [-50, 50, 0]); junk(state, 470, 3, [-50, 50], 280, -0.3, -0.002);
    tank(state, 300, 120, -0.35); tank(state, 300, 360, -0.35);
    behind(state, 3, 300, 90, { armed: true, every: 160 });
  } },
  { at: 12900, go: ({ state }) => {
    rocks(state, 9, { spread: 120, big: true, speed: 1.6 });
    kami(state, 120, 200); kami(state, 480, 320, 720); kami(state, 300, 520, 640); kami(state, 200, 700, 700);
    line(state, 6, 300, 'sine', 60, { amp: 160, armed: true, every: 200, speed: 2.8, edge: true, dx: 300 });
  } },
  { at: 13300, go: ({ state }) => {
    wall(state, 8, 2, { armed: true, speed: 2.6 }); wall(state, 8, 6, { armed: true, speed: 2.6, dx: 260 });
    junk(state, 300, 4, [], 520, -1.2, 0.04);
  } },

  // --- THE BEAM (13600): everything, from everywhere. First something to mow down; then what the beam can't reach ---
  { at: 13750, go: ({ state }) => { for (const [w, hole] of [[0, 3], [1, 1], [2, 5]] as const) wall(state, 7, hole, { speed: 2.6, dx: w * 200 }); } },
  { at: 14250, go: ({ state }) => {
    behind(state, 4, 130, 80, { armed: true, every: 160 }); behind(state, 4, 470, 80, { armed: true, every: 160, dx: 40 });
    fighter(state, 80, 'swoop', { armed: true, hold: 520, every: 120, sit: 320, edge: true, dx: 200 });
    fighter(state, 530, 'swoop', { armed: true, hold: 600, every: 120, sit: 320, edge: true, dx: 260 });
  } },
  // (checkpoint 53: 14700)
  { at: 15050, go: ({ state }) => {
    spot(state, cruiser(state, 130, 560, 2)); cruiser(state, 470, 480, 2, 360);
    for (let i = 0; i < 8; i++) mine(state, 70 + ((i * 130) % 480), 100 + i * 90);
    kami(state, 300, 500, 700); kami(state, 300, 700, 640);
  } },
  { at: 15650, go: ({ state }) => {
    junk(state, 300, 5, [], 0, -0.3, -0.001);
    line(state, 4, 110, 'loop', 70, { armed: true, every: 160, dx: 300, loopX: 470, dir: -1 });
    line(state, 4, 500, 'loop', 70, { armed: true, every: 160, dx: 300, loopX: 470, dir: 1 });
    rocks(state, 6, { spread: 140, big: true, speed: 1.5, y0: 60, y1: 200 }); rocks(state, 6, { spread: 140, big: true, speed: 1.5, y0: 400, y1: 560 });
  } },
  { at: 16250, go: ({ state }) => {
    junk(state, 130, 0, [-50, 50, 0], 0, -0.3); junk(state, 480, 2, [0], 200, -0.35);
    tank(state, 230, 360); tank(state, 300, 420); tank(state, 370, 360);
    behind(state, 3, 300, 90, { armed: true, every: 150 });
    kami(state, 140, 500); kami(state, 460, 620, 720); kami(state, 300, 760, 640);
  } },
  { at: 16850, go: ({ state }) => {
    wall(state, 8, 1, { armed: true, speed: 2.8 }); wall(state, 8, 6, { armed: true, speed: 2.8, dx: 240 });
    cruiser(state, 300, 600, 2, 500);
    for (const [sy, dx] of [[130, 0], [470, 300]] as const) junk(state, sy, 4, [], 600 + dx, -1.2, 0.05);
  } },
  { at: 17450, go: ({ state }) => {
    spot(state, first(vee(state, 300, true, 0, 2.8))); vee(state, 140, true, 160, 2.8); vee(state, 460, true, 160, 2.8);
    line(state, 4, 110, 'loop', 70, { armed: true, every: 160, dx: 400, loopX: 470, dir: -1 });
    line(state, 4, 500, 'loop', 70, { armed: true, every: 160, dx: 400, loopX: 470, dir: 1 });
    behind(state, 3, 300, 90, { speed: 3.6 });
    for (const [y, dx] of [[60, 200], [540, 200], [60, 500], [540, 500]] as const) mine(state, y, dx);
  } },
  { at: 18050, go: ({ state }) => {
    for (let i = 0; i < 5; i++) kami(state, 100 + i * 100, i * 160, 640 + (i % 2) * 80);
    rocks(state, 8, { spread: 100, speed: 1.6 });
  } },
];

/** Waves as the screen gets to them (all of them before where it's started from, skipped); the warnings counting down. */
export const runWaves = (ctx: FrameContext) => {
  const o = orbitOf(ctx.state), off = o.scroll - X0;
  if (o.pending.length) { const now = o.pending.filter(q => q.at <= ctx.state.frame); o.pending = o.pending.filter(q => q.at > ctx.state.frame); for (const q of now) q.go(); }
  while (o.wave < WAVES.length && WAVES[o.wave].at <= off) WAVES[o.wave++].go(ctx);
  if (o.warns.length) { for (const w of o.warns) w.t--; o.warns = o.warns.filter(w => w.t > 0); }
};
/** Starting from a checkpoint: what's behind it is gone already. */
export const skipWavesTo = (state: GameState, off: number) => {
  const o = orbitOf(state);
  o.wave = 0;
  while (o.wave < WAVES.length && WAVES[o.wave].at < off) o.wave++;
};
