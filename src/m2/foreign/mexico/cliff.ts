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
  type Ctx, type View, box, poly, mix, hash, checker, boxes3, ledge3, facade, still, rockFace, postBoard, hungBoard, LOOKS, dimmed, hour, ramp6, onScreen, INK, rnd,
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

/** A cast diver (a college kid in a swim cap, seeded: a woman in a one-piece or a guy in trunks, every skin, the name
 *  tag pinned to the suit): arms up on the perch, bouncing; head down, arms out in front, falling. In steps, inked. */
const drawDiver = (c: Ctx, x: number, feetY: number, n: number, falling: boolean, f: number) => {
  const skin = ['#F1C9A5', '#C68642', '#8D5524', '#E0AC69', '#5C3A21', '#FFDBAC'][n % 6], woman = n % 2 === 1;
  const suit = ['#DB2777', '#1D4ED8', '#F59E0B', '#16A34A', '#7C3AED'][(n >> 1) % 5], cap = ['#F8FAFC', '#DC2626', '#FDE047', '#1E3A8A'][n % 4];
  const S = ramp6(skin), U = ramp6(suit), Cp = ramp6(cap);
  const part = (px: number, py: number, w: number, h: number, R: string[]) => { box(c, px - 1, py - 1, w + 2, h + 2, INK); box(c, px, py, w, h, R[3]); box(c, px, py, Math.max(1, w * 0.3), h, R[4]); box(c, px + w - Math.max(1, w * 0.3), py, Math.max(1, w * 0.3), h, R[2]); };
  if (!falling) {
    const up = Math.round(Math.sin(f * 0.3) * 2);
    // (arms up over the head: the tell)
    part(x - 12, feetY - 86 + up, 4, 32, S); part(x + 8, feetY - 86 - up, 4, 32, S);
    // (legs, the body, the suit (a one-piece, or trunks), the tag)
    part(x - 6, feetY - 22, 5, 22, S); part(x + 1, feetY - 22, 5, 22, S);
    part(x - 7, feetY - 52, 14, 30, S);
    if (woman) part(x - 7, feetY - 50, 14, 28, U); else part(x - 7, feetY - 30, 14, 9, U);
    box(c, x + 1, feetY - (woman ? 44 : 27), 5, 3, '#FFFFFF'); box(c, x + 1, feetY - (woman ? 44 : 27), 5, 1, '#DC2626');
    // (the head in its swim cap, goggles up on it)
    part(x - 6, feetY - 66, 12, 13, S); box(c, x + 2, feetY - 61, 2, 2, INK); box(c, x - 1, feetY - 56, 5, 1, mix(skin, INK, 0.5));
    part(x - 7, feetY - 70, 14, 7, Cp); box(c, x - 6, feetY - 66, 12, 2, '#38BDF8'); box(c, x - 5, feetY - 66, 3, 1, '#E0F2FE');
    return;
  }
  // (upside down: feet at the top, head and joined hands at the bottom, a streak of air past it)
  const top = feetY - 64;
  part(x - 6, top, 5, 22, S); part(x + 1, top, 5, 22, S);
  part(x - 7, top + 22, 14, 28, S);
  if (woman) part(x - 7, top + 22, 14, 26, U); else part(x - 7, top + 22, 14, 9, U);
  part(x - 6, top + 50, 12, 12, S); part(x - 7, top + 55, 14, 7, Cp);
  part(x - 3, top + 62, 6, 14, S);
  for (let k = 0; k < 3; k++) box(c, x - 14 + k * 12, top - 6 - ((f * 3 + k * 9) % 20), 1, 8, 'rgba(255,255,255,0.6)');
};

/** The cliff's bulk behind the outcrops (set back, stamped for the hour): fiberglass rock, strata painted on, the
 *  panels' seams and their bolts showing, a scrub of fake agave in the cracks. */
const paintBulk = (g: Ctx) => {
  const R = ramp6(dimmed(ROCK_D));
  const shape: [number, number][] = [[0, 0], [60, -380], [180, -560], [380, -660], [560, -620], [760, -420], [880, -160], [900, 0]];
  poly(g, shape.map(([x, y]) => [x + (x < 450 ? -2 : 2), y - 2] as [number, number]), INK);
  poly(g, shape, R[2]);
  g.save(); g.beginPath(); shape.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  rockFace(g, 0, -680, 900, 680, R, 4440);
  // (lit up its left shoulder, in shade down its right)
  poly(g, [[0, 0], [60, -380], [180, -560], [380, -660], [300, -560], [160, -380], [80, 0]], R[3]);
  checker(g, 80, -600, 4, 600, R[3], 0);
  poly(g, [[560, -620], [760, -420], [880, -160], [900, 0], [760, 0], [680, -300]], R[1]);
  // (the fiberglass panels' seams, bolted)
  for (let k = 0; k < 4; k++) { const sx = 120 + k * 200; box(g, sx, -640 + k * 40, 2, 640 - k * 40, R[0]); for (let y = -600 + k * 40; y < 0; y += 50) { box(g, sx - 3, y, 2, 2, R[4]); box(g, sx + 3, y + 4, 2, 2, R[4]); } }
  for (let k = 0; k < 3; k++) { const sy = -480 + k * 160; box(g, 0, sy, 900, 2, R[0]); }
  // (fake agaves stuck in its cracks)
  for (let k = 0; k < 10; k++) {
    const ax = 60 + hash(k * 3.7) * 760, ay = -60 - hash(k * 1.9) * 480, A = ramp6(dimmed('#5E8A5A'));
    for (let s = -3; s <= 3; s++) poly(g, [[ax - 2, ay], [ax + s * 4, ay - 14 + Math.abs(s) * 2], [ax + 2, ay]], A[Math.abs(s) % 2 ? 2 : 3]);
  }
  g.restore();
};

export const drawCliffBack = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame;
  if (!onScreen(v, X(4200), x1)) return;
  drawPoolBack(c, v, DIVE_POOL);
  // (the cliff's bulk behind the outcrops, set back, stamped for the hour)
  facade(c, v, 'mx-cliffbulk', X(4440), 900, 660, paintBulk, 0.95, 30, 10, false);
  // (the cliff: its face down to the ground (a wall: no way through), its top the walk)
  boxes3(c, v, [
    { x: X(CLIFF.a), top: Y(CLIFF.h), w: CLIFF.b - CLIFF.a, bottom: GY, col: ROCK, standable: true, look: 'rock' },
    { x: X(STAND.a), top: Y(STAND.h), w: STAND.b - STAND.a, bottom: GY, col: '#15803D', standable: true, look: 'plank' },
  ]);
  for (const [a, b, h] of [...OUT_L, ...OUT_R]) if (onScreen(v, X(a), X(b))) {
    // (the outcrop's lump under its ledge: rock in steps, lit along its top, shaded under)
    const R = ramp6(hour(ROCK));
    poly(c, [[X(a) + 8, Y(h) + 13], [X(b) - 8, Y(h) + 13], [X(b) - 38, Y(h) + 52], [X(a) + 28, Y(h) + 46]], INK);
    poly(c, [[X(a) + 10, Y(h) + 14], [X(b) - 10, Y(h) + 14], [X(b) - 40, Y(h) + 50], [X(a) + 30, Y(h) + 44]], R[2]);
    poly(c, [[X(a) + 10, Y(h) + 14], [X(a) + 40, Y(h) + 14], [X(a) + 44, Y(h) + 40], [X(a) + 30, Y(h) + 44]], R[3]);
    poly(c, [[X(b) - 30, Y(h) + 14], [X(b) - 10, Y(h) + 14], [X(b) - 40, Y(h) + 50], [X(b) - 48, Y(h) + 40]], R[1]);
    for (let k = 0; k < 4; k++) box(c, X(a) + 30 + k * ((b - a - 60) / 4), Y(h) + 24 + (k % 2) * 8, 10, 2, R[1]);
    ledge3(c, v, X(a), Y(h), b - a, ROCK, 14, 'rock');
  }
  // (the board: a fiberglass plank on steel brackets (white, a red stripe, its sandpaper tread), the pipe rail at its
  // root)
  if (onScreen(v, X(BOARD.a), X(BOARD.b))) {
    const M = ramp6(hour('#57534E'));
    for (const bx of [BOARD.a + 20, BOARD.a + 120]) { box(c, X(bx) - 1, Y(BOARD.h) + 9, 8, 52, INK); box(c, X(bx), Y(BOARD.h) + 10, 6, 50, M[3]); box(c, X(bx), Y(BOARD.h) + 10, 2, 50, M[5]); poly(c, [[X(bx) + 6, Y(BOARD.h) + 12], [X(bx) + 30, Y(BOARD.h) + 12], [X(bx) + 6, Y(BOARD.h) + 34]], M[2]); }
    ledge3(c, v, X(BOARD.a), Y(BOARD.h), BOARD.b - BOARD.a, '#E2E8F0', 10);
    box(c, X(BOARD.a), Y(BOARD.h) + 5, BOARD.b - BOARD.a, 2, hour('#DC2626'));
    const I = ramp6(hour('#94A3B8'));
    box(c, X(BOARD.a) - 1, Y(BOARD.h) - 31, 6, 31, INK); box(c, X(BOARD.a), Y(BOARD.h) - 30, 4, 30, I[3]); box(c, X(BOARD.a), Y(BOARD.h) - 30, 1, 30, I[5]);
    box(c, X(BOARD.a) - 1, Y(BOARD.h) - 31, 62, 5, INK); box(c, X(BOARD.a), Y(BOARD.h) - 30, 60, 3, I[3]); box(c, X(BOARD.a), Y(BOARD.h) - 30, 60, 1, I[5]);
    poly(c, [[X(BOARD.a) + 56, Y(BOARD.h) - 30], [X(BOARD.a) + 64, Y(BOARD.h) - 20], [X(BOARD.a) + 64, Y(BOARD.h)], [X(BOARD.a) + 60, Y(BOARD.h)], [X(BOARD.a) + 60, Y(BOARD.h) - 19], [X(BOARD.a) + 54, Y(BOARD.h) - 27]], I[2]);
  }
  // (the divers' pole and platform: a steel lattice mast out of the pool, out of reach, dimmed, no lip: not somewhere to
  // stand)
  if (onScreen(v, X(PERCH.a), X(PERCH.b) + 40)) {
    const P = ramp6(dimmed('#9CA3AF')), mx = X(5655), mt = Y(PERCH.h), mb = GY + DIVE_POOL.bed;
    still(c, 'fl-mx-perch', mx, mt, -110, -4, 140, mb - mt + 6, g => {
      const h = mb - mt;
      box(g, -1, 0, 3, h, INK); box(g, 9, 0, 3, h, INK); box(g, 0, 0, 1, h, P[4]); box(g, 10, 0, 1, h, P[2]);
      g.strokeStyle = P[2]; g.lineWidth = 1; g.beginPath(); for (let y = 10; y < h; y += 22) { g.moveTo(0, y); g.lineTo(10, y + 11); g.moveTo(10, y + 11); g.lineTo(0, y + 22); } g.stroke();
      for (let y = 40; y < h; y += 60) { box(g, -6, y, 22, 3, INK); box(g, -5, y, 20, 2, P[3]); }
      // (the platform: grating, a canvas skirt, no lip)
      const pa = PERCH.a - 5655, pw = PERCH.b - PERCH.a + 8;
      box(g, pa - 1, -1, pw + 2, 10, INK); box(g, pa, 0, pw, 8, P[2]); for (let x = pa + 2; x < pa + pw; x += 4) box(g, x, 1, 1, 6, P[1]);
      box(g, pa, 8, pw, 14, dimmed('#7F1D1D')); for (let x = pa; x < pa + pw; x += 10) box(g, x, 8, 5, 14, dimmed('#991B1B'));
    });
    hungBoard(c, X(5700), Y(PERCH.h) + 30, Y(PERCH.h) + 70, ['CAST ONLY'], LOOKS.mexico(1), '#7F1D1D');
  }
  // (the tequila stand's awning (scalloped stripes on poles) and the bottles behind its counter)
  if (onScreen(v, X(STAND.a) - 20, X(STAND.b) + 20)) {
    const a = X(STAND.a), w = STAND.b - STAND.a;
    still(c, `fl-mx-tequila-${w}`, a, Y(STAND.h), -14, -76, w + 28, 80, g => {
      const Gn = ramp6(dimmed('#16A34A')), Wt = ramp6(dimmed('#F8FAFC')), P = ramp6(dimmed('#78716C'));
      for (const px0 of [4, w - 8]) { box(g, px0 - 1, -58, 6, 58, INK); box(g, px0, -58, 4, 58, P[3]); box(g, px0, -58, 1, 58, P[5]); }
      box(g, -7, -71, w + 14, 14, INK);
      for (let k = 0; k < Math.ceil((w + 12) / 22); k++) { const R = k % 2 ? Wt : Gn; box(g, -6 + k * 22, -70, 22, 12, R[3]); box(g, -6 + k * 22, -70, 22, 2, R[4]); g.fillStyle = INK; g.beginPath(); g.arc(-6 + k * 22 + 11, -58, 11, 0, Math.PI); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.arc(-6 + k * 22 + 11, -58, 10, 0, Math.PI); g.fill(); }
    });
  }
  // (the signs: held up, nothing over them)
  if (onScreen(v, X(4300), X(4500))) postBoard(c, X(4380), GY, ['LA QUEBRADA', 'CLIFF DIVERS', 'SHOWS EVERY 6 SECONDS'], LOOKS.mexico(1), '#0F766E', undefined, 120);
  if (onScreen(v, X(5300), X(5340))) postBoard(c, X(5300), GY, ['DIVE POOL', 'DEPTH: 6 FT', 'NO DIVING'], LOOKS.mexico(1), '#1E3A8A', undefined, 100);
  if (onScreen(v, X(STAND.a), X(STAND.b))) hungBoard(c, (X(STAND.a) + X(STAND.b)) / 2, Y(STAND.h) - 58, Y(STAND.h) - 30, ['TEQUILA', '(APPLE JUICE)'], LOOKS.mexico(1), '#7C2D12');
  if (onScreen(v, X(6050), X(6200))) postBoard(c, X(6120), GY, ['LEAVING MEXICO', 'NEXT: NORWAY'], LOOKS.mexico(1), '#7C2D12', undefined, 100);
  // (the diver up top on the platform in the tell)
  const d = diverAt(f);
  if (d.st === 'tell' && onScreen(v, X(PERCH.a), X(PERCH.b))) drawDiver(c, X(DX), Y(PERCH.h), d.n, false, f);
  void rnd;
};

export const drawCliffFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame;
  if (!onScreen(v, DIVE_POOL.a - 100, DIVE_POOL.b + 100)) return;
  const d = diverAt(f);
  if (d.st === 'fall') drawDiver(c, X(DX), Y(d.h), d.n, true, f);
  drawPoolFront(c, v, DIVE_POOL, f, x => (d.st === 'splash' ? Math.max(0, 22 - d.t) * Math.exp(-(((x - X(DX)) / 50) ** 2)) : 0));
  if (d.st === 'splash') {
    // (the splash: a crown of water up round where it went in, stepped, then its droplets flung out and falling)
    const sy = GY + DIVE_POOL.surface, up = Math.max(0, 40 - d.t * 1.6);
    if (up > 0) for (let k = -3; k <= 3; k++) { const hh = up * (1 - Math.abs(k) / 4), sx = X(DX) + k * 7; box(c, sx - 3, sy - hh - 1, 7, hh + 1, '#0E7490'); box(c, sx - 2, sy - hh, 5, hh, k % 2 ? '#BAE6FD' : '#E0F2FE'); box(c, sx - 2, sy - hh, 2, 2, '#FFFFFF'); }
    for (let k = 0; k < 14; k++) {
      const a = Math.PI * (0.1 + 0.8 * rnd(k + d.n * 13)), r = d.t * (3 + rnd(k) * 3), px = Math.round(X(DX) + Math.cos(a) * r * (k % 2 ? 1 : -1)), py = Math.round(sy - Math.sin(a) * r + d.t * d.t * 0.12);
      box(c, px - 1, py - 1, 5, 5, '#0E7490'); box(c, px, py, 3, 3, '#BAE6FD'); box(c, px, py, 1, 1, '#FFFFFF');
    }
  }
  drawShout(c, cliffOf(state).said);
};

export const cliffLamps = (v: View): Light[] => (onScreen(v, X(5300), X(5900)) ? [{ x: X(5600), y: Y(60), r: 180, a: 0.4, color: '#67E8F9' }] : []);

