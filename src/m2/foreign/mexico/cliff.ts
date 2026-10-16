// MEXICO's far end (job 4b: the pavilions lengthened): LA QUEBRADA, the park's CLIFF DIVERS (a fiberglass cliff by
// the lagoon). Past the cantina, a pinata host and a hat thrower on the promenade, then the cliff climbed: rock
// outcrops zigzagging up its left face (a hat thrower and a mariachi on them), its top (a luchador, a hat thrower, a
// small ammo), the DIVING BOARD off its right side over the DIVE POOL. The show never stops: every few seconds a
// cast diver on the platform up its pole (CAST ONLY) throws its arms up and shouts (the tell), then plunges straight
// down into the pool, onto whoever's under it (him on his way across, the cast knocked in: `m2:fl_cliff_diver`), the
// splash hitting whoever's swimming close. He can dive off the board himself (TEN. TEN. TEN.), swim across between
// dives, and climb out at the far end; the way back up is the outcrops on the cliff's right face, under the board.
// Then the last stretch to Norway: a tequila stand, the lot of the cast mixed.

import type { Light } from '../../../m1/game/render/lighting';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { GroundRun } from '../../../m1/game/core/terrain';
import { solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { byPants } from '../cast';
import { gag } from '../state';
import { playSound } from '../../../m1/game/platform/audio';
import { runsAround, poolSteps, poolAt, poolZones, drawPoolBack, drawPoolFront, type Pool } from '../water';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, type Shout } from '../setpiece';
import {
  type Ctx, type View, box, poly, boxes3, ledge3, setBack, postBoard, hungBoard, LOOKS, dimmed, hour, ramp6, onScreen, INK, LIP, rnd,
} from '../kit';
import { V, DIVER, DIVE_GAG } from './lines';

const { x0, x1 } = SECTIONS.mexico;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

/** Where the old Mexico ended (the cantina's stretch): this starts there. */
export const CLIFF_FROM = 4200;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from Mexico's start, heights up from the promenade). He jumps ~145 up, ~210 across.

/** The cliff (solid: its top's the walk), its left face's outcrops (one-way, up), its right face's (the way back up). */
const CLIFF = { a: 4820, b: 5100, h: 600 } as const;
const OUT_L: [number, number, number][] = [[4480, 4620, 130], [4640, 4780, 260], [4480, 4620, 390], [4640, 4800, 520]];
const OUT_R: [number, number, number][] = [[5120, 5240, 130], [5170, 5300, 260], [5120, 5240, 390], [5170, 5300, 520]];
/** The diving board (one-way) off the cliff's top, out over the pool. */
const BOARD = { a: 5100, b: 5480, h: 600 } as const;
export const DIVE_POOL: Pool = { key: 'quebrada', a: X(5340), b: X(5800), surface: 30, bed: 230, col: '#0E7490', wall: '#7C6A55' };
/** The divers' platform up its pole (CAST ONLY: out of his reach), where they plunge (x), and the show's beat. */
const PERCH = { a: 5560, b: 5650, h: 880 } as const;
const DX = 5600, EVERY = 330, WARN = 60, G = 0.6;
const STAND = { a: 5900, b: 6020, h: 90 } as const;

const ENEMIES: [string, number, number][] = [
  ['m2:fl_pinata', 4300, 0], ['m2:fl_sombrero', 4420, 0],
  ['m2:fl_sombrero', 4560, 390], ['m2:fl_mariachi', 4720, 520],
  ['m2:fl_luchador', 4900, CLIFF.h], ['m2:fl_sombrero', 5040, CLIFF.h],
  ['m2:fl_mariachi', 5200, 0],
  ['m2:fl_luchador', 5880, 0], ['m2:fl_sombrero', 5960, STAND.h], ['m2:fl_mariachi', 6060, 0], ['m2:fl_pinata', 6120, 0],
];

export const CLIFF_CHECKPOINTS = [
  { name: 'MEXICO: LA QUEBRADA', cp: 3, x: X(4260), y: GY },
  { name: 'MEXICO: THE DIVE POOL', cp: 4, x: X(5860), y: GY },
];

/** The ground from the old end on (the pool dug out of it). */
export const cliffRuns = (): GroundRun[] => runsAround(X(CLIFF_FROM), x1, [DIVE_POOL]);

// ---------------------------------------------------------------------------------------------------------------
// The show

interface Cliff { said: Shout; hit: Set<object>; n: number; highAt: number }
const cliffOf = (state: GameState) => foreignState<Cliff>(state, 'mexico', () => ({ said: newShout(), hit: new Set(), n: -1, highAt: -9999 }));

/** The diver now: on the perch (the tell), falling (its feet's height over GY), splashed, or gone under. */
const diverAt = (f: number) => {
  const t = f % EVERY, n = Math.floor(f / EVERY);
  if (t < WARN) return { st: 'tell' as const, n, h: PERCH.h, t };
  const u = t - WARN, h = PERCH.h - 0.5 * G * u * u;
  if (h > -DIVE_POOL.surface) return { st: 'fall' as const, n, h, t: u };
  const tFall = Math.sqrt((2 * (PERCH.h + DIVE_POOL.surface)) / G);
  const s = u - tFall;
  return s < 30 ? { st: 'splash' as const, n, h: -DIVE_POOL.surface, t: s } : { st: 'gone' as const, n, h: 0, t: s };
};

export const buildCliff = (state: GameState) => {
  poolSteps(state, DIVE_POOL);
  solid(state, X(CLIFF.a), Y(CLIFF.h), CLIFF.b - CLIFF.a, CLIFF.h, { hidden: true, tag: 'mx-cliff' });
  for (const [a, b, h] of [...OUT_L, ...OUT_R]) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'mx-outcrop' });
  ledge(state, X(BOARD.a), Y(BOARD.h), BOARD.b - BOARD.a, { hidden: true, tag: 'mx-board' });
  solid(state, X(STAND.a), Y(STAND.h), STAND.b - STAND.a, STAND.h, { hidden: true, tag: 'mx-tequila' });
  spawnCast(state, ENEMIES, X, Y);
  placePickups(state, 'mx', X, Y, [[4960, CLIFF.h, 'small_ammo'], [5230, 390, 'small_health']]);
};

export const updateCliff = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, f = state.frame, cl = cliffOf(state);
  poolZones(state, 'mx-quebrada', [DIVE_POOL]);
  const near = Math.abs(p.pos.x - X(DX)) < 1100;
  const d = diverAt(f);
  if (d.n !== cl.n) { cl.n = d.n; cl.hit.clear(); }
  // (the tell: arms up, the shout; the drop)
  if (d.st === 'tell' && d.t === 0 && near) { playSound('horn', 0.4, 16); shout(state, cl.said, d.n % 2 ? V.luchador.f : V.luchador.m, byPants(state, DIVER), X(DX), Y(PERCH.h) - 70, 0.6); }
  if (d.st === 'fall') {
    const top = Y(d.h) - 64;
    if (!cl.hit.has(p) && hurtIn(ctx, X(DX) - 16, top, 32, 64, 12, 'm2:fl_cliff_diver', { x: Math.sign(p.pos.x + p.width / 2 - X(DX)) * 8 || 8, y: 4 }, 26)) { cl.hit.add(p); playSound('thud', 0.8, -4); }
    hitCastIn(ctx, X(DX) - 16, top, 32, 64, 40, X(DX), 'DIVED ON!', '#67E8F9', cl.hit);
  }
  if (d.st === 'splash' && d.t === 0 && near) playSound('splash', 0.9, -6);
  if (d.st === 'splash' && d.t < 10) {
    const sy = GY + DIVE_POOL.surface - 30;
    if (!cl.hit.has(p) && hurtIn(ctx, X(DX) - 70, sy, 140, 70, 5, 'm2:fl_cliff_diver', { x: Math.sign(p.pos.x + p.width / 2 - X(DX)) * 7 || 7, y: -4 }, 20)) cl.hit.add(p);
    hitCastIn(ctx, X(DX) - 70, sy, 140, 70, 18, X(DX), 'SPLASHED!', '#67E8F9', cl.hit);
  }
  // (his own dive: off the board, into the pool)
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (cx > DIVE_POOL.a && cx < DIVE_POOL.b && GY - feet > 420) cl.highAt = f;
  if (cx > DIVE_POOL.a && cx < DIVE_POOL.b && feet > GY + DIVE_POOL.surface && f - cl.highAt < 80) gag(state, 'mx-dive', DIVE_GAG);
};

export const cliffWater = (x: number, y: number) => poolAt([DIVE_POOL], x, y);

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const ROCK = '#9A7B5A', ROCK_D = '#6E5640';

/** A cast diver: a speedo (or a swimsuit), arms up on the perch; head down, arms out in front, falling. */
const drawDiver = (c: Ctx, x: number, feetY: number, n: number, falling: boolean, f: number) => {
  const skin = ['#F1C9A5', '#C68642', '#8D5524', '#E0AC69', '#5C3A21'][n % 5], suit = n % 2 ? '#DB2777' : '#1D4ED8';
  if (!falling) {
    box(c, x - 7, feetY - 52, 14, 30, skin); box(c, x - 7, feetY - 30, 14, 8, suit); if (n % 2) box(c, x - 7, feetY - 48, 14, 10, suit);
    box(c, x - 6, feetY - 22, 5, 22, skin); box(c, x + 1, feetY - 22, 5, 22, skin);
    box(c, x - 6, feetY - 66, 12, 13, skin); box(c, x - 6, feetY - 68, 12, 4, n % 3 ? '#1C1917' : '#B45309');
    const up = Math.sin(f * 0.3) * 2;
    box(c, x - 12, feetY - 84 + up, 4, 32, skin); box(c, x + 8, feetY - 84 - up, 4, 32, skin);
    return;
  }
  // (upside down: feet at the top, head and joined hands at the bottom)
  const top = feetY - 64;
  box(c, x - 6, top, 5, 22, skin); box(c, x + 1, top, 5, 22, skin);
  box(c, x - 7, top + 22, 14, 8, suit); box(c, x - 7, top + 30, 14, 20, n % 2 ? suit : skin);
  box(c, x - 6, top + 50, 12, 12, skin); box(c, x - 3, top + 62, 6, 14, skin);
};

export const drawCliffBack = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame;
  if (!onScreen(v, X(4200), x1)) return;
  drawPoolBack(c, v, DIVE_POOL);
  // (the cliff's bulk behind the outcrops, set back: fiberglass rock, painted; the seams show)
  setBack(c, v, X(4440), 900, 0.95, () => {
    const R = ramp6(dimmed(ROCK_D));
    poly(c, [[0, 0], [60, -380], [180, -560], [380, -660], [560, -620], [760, -420], [880, -160], [900, 0]], R[2]);
    for (let k = 0; k < 14; k++) box(c, 40 + rnd(k + 300) * 800, -40 - rnd(k + 330) * 520, 40, 3, R[1]);
    for (let k = 0; k < 4; k++) box(c, 120 + k * 200, -600 + k * 40, 2, 560 - k * 40, R[3]);
  });
  // (the cliff: its face down to the ground (a wall: no way through), its top the walk)
  boxes3(c, v, [
    { x: X(CLIFF.a), top: Y(CLIFF.h), w: CLIFF.b - CLIFF.a, bottom: GY, col: ROCK, standable: true },
    { x: X(STAND.a), top: Y(STAND.h), w: STAND.b - STAND.a, bottom: GY, col: '#15803D', standable: true },
  ]);
  if (onScreen(v, X(CLIFF.a), X(CLIFF.b))) {
    const R = ramp6(hour(ROCK));
    for (let k = 0; k < 18; k++) { const rx = X(CLIFF.a) + 10 + rnd(k + 400) * (CLIFF.b - CLIFF.a - 50), ry = Y(CLIFF.h) + 30 + rnd(k + 420) * (CLIFF.h - 60); box(c, rx, ry, 30 + rnd(k) * 20, 4, R[1]); box(c, rx, ry - 2, 20, 2, R[3]); }
  }
  for (const [a, b, h] of [...OUT_L, ...OUT_R]) if (onScreen(v, X(a), X(b))) {
    const R = ramp6(hour(ROCK));
    poly(c, [[X(a) + 10, Y(h) + 14], [X(b) - 10, Y(h) + 14], [X(b) - 40, Y(h) + 50], [X(a) + 30, Y(h) + 44]], R[1]);
    ledge3(c, v, X(a), Y(h), b - a, ROCK, 14);
  }
  // (the board: a plank on brackets, its rail at the cliff end)
  if (onScreen(v, X(BOARD.a), X(BOARD.b))) {
    for (const bx of [BOARD.a + 20, BOARD.a + 120]) box(c, X(bx), Y(BOARD.h) + 10, 6, 50, hour('#57534E'));
    ledge3(c, v, X(BOARD.a), Y(BOARD.h), BOARD.b - BOARD.a, '#E2E8F0', 10);
    box(c, X(BOARD.a), Y(BOARD.h) - 30, 4, 30, INK); box(c, X(BOARD.a), Y(BOARD.h) - 30, 60, 3, INK);
  }
  // (the divers' pole and platform: out of reach, dimmed, no lip: not somewhere to stand)
  if (onScreen(v, X(PERCH.a), X(PERCH.b) + 40)) {
    const P = ramp6(dimmed('#9CA3AF'));
    box(c, X(5655), Y(PERCH.h), 8, PERCH.h + DIVE_POOL.bed, P[2]);
    box(c, X(PERCH.a), Y(PERCH.h), PERCH.b - PERCH.a + 8, 8, P[3]);
    for (let y = Y(PERCH.h) + 40; y < GY; y += 60) box(c, X(5650), y, 18, 3, P[1]);
    hungBoard(c, X(5700), Y(PERCH.h) + 30, Y(PERCH.h) + 70, ['CAST ONLY'], LOOKS.mexico(1), '#7F1D1D');
  }
  // (the tequila stand's awning bits)
  if (onScreen(v, X(STAND.a), X(STAND.b))) { for (let k = 0; k < 6; k++) box(c, X(STAND.a) - 6 + k * 22, Y(STAND.h) - 70, 22, 12, dimmed(k % 2 ? '#F8FAFC' : '#16A34A')); for (const px0 of [X(STAND.a) + 4, X(STAND.b) - 8]) box(c, px0, Y(STAND.h) - 58, 4, 58, dimmed('#78716C')); }
  // (the signs: held up, nothing over them)
  if (onScreen(v, X(4300), X(4500))) postBoard(c, X(4380), GY, ['LA QUEBRADA', 'CLIFF DIVERS', 'SHOWS EVERY 6 SECONDS'], LOOKS.mexico(1), '#0F766E', undefined, 120);
  if (onScreen(v, X(5300), X(5340))) postBoard(c, X(5300), GY, ['DIVE POOL', 'DEPTH: 6 FT', 'NO DIVING'], LOOKS.mexico(1), '#1E3A8A', undefined, 100);
  if (onScreen(v, X(STAND.a), X(STAND.b))) hungBoard(c, (X(STAND.a) + X(STAND.b)) / 2, Y(STAND.h) - 58, Y(STAND.h) - 30, ['TEQUILA', '(APPLE JUICE)'], LOOKS.mexico(1), '#7C2D12');
  if (onScreen(v, X(6050), X(6200))) postBoard(c, X(6120), GY, ['LEAVING MEXICO', 'NEXT: NORWAY'], LOOKS.mexico(1), '#7C2D12', undefined, 100);
  // (the diver up top on the platform in the tell)
  const d = diverAt(f);
  if (d.st === 'tell' && onScreen(v, X(PERCH.a), X(PERCH.b))) drawDiver(c, X(DX), Y(PERCH.h), d.n, false, f);
  void LIP;
};

export const drawCliffFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame;
  if (!onScreen(v, DIVE_POOL.a - 100, DIVE_POOL.b + 100)) return;
  const d = diverAt(f);
  if (d.st === 'fall') drawDiver(c, X(DX), Y(d.h), d.n, true, f);
  drawPoolFront(c, v, DIVE_POOL, f, x => (d.st === 'splash' ? Math.max(0, 22 - d.t) * Math.exp(-(((x - X(DX)) / 50) ** 2)) : 0));
  if (d.st === 'splash') for (let k = 0; k < 12; k++) { const a = Math.PI * (0.1 + 0.8 * rnd(k + d.n * 13)), r = d.t * (3 + rnd(k) * 3); box(c, X(DX) + Math.cos(a) * r * (k % 2 ? 1 : -1), GY + DIVE_POOL.surface - Math.sin(a) * r + d.t * d.t * 0.12, 4, 4, '#E0F2FE'); }
  drawShout(c, cliffOf(state).said);
};

export const cliffLamps = (v: View): Light[] => (onScreen(v, X(5300), X(5900)) ? [{ x: X(5600), y: Y(60), r: 180, a: 0.4, color: '#67E8F9' }] : []);

