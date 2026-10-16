// CANADA: section 10 of Foreign Lands' streets, the last pavilion (flows on from the UK, on to the helipad: no walls, no
// doors). Everybody here says SORRY as they hit him. THE LUMBER CAMP first: log piles to climb, the cabin, the CARVED
// POLES (plywood: a moose, a beaver, a hockey player, a Mountie; MADE IN OHIO) to hop along. THE LOG POND: logs
// floating, bobbing and drifting (ride them across, or swim). Then THE FALLS: the Rockies' cliff, its waterfall a
// pumped pipe, and the climb up beside it on the rock ledges, zigzagging back and forth ACROSS the falls; the log flume
// ride runs along the clifftop and its logs go over the falls (they slide along the trough first: the tell), down the
// falls onto whoever's crossing (him, the cast). On top: THE RINK (boards each end: the pucks ricochet off them),
// hockey players, a moose, a Mountie on a stick horse; then down THE TRAIL's thousand stairs (they climb back up, too),
// the ranger station; then THE FROZEN POND and THE TOBOGGAN HILL (pond.ts, job 4b: the thin ice giving way under
// whoever stands on it, the sugar shack on the hill), on to HELICOPTER RIDES ACROSS THE WORLD's helipad.
//
// Crude (the first pass): readable boxes with full game feel. Checkpoints 90-99. Outdoors: the time of day's light.

import type { Light } from '../../../m1/game/render/lighting';
import type { GroundRun } from '../../../m1/game/core/terrain';
import type { GameState } from '../../../m1/game/core/state';
import type { ForeignSection } from '../section';
import { layOwn, solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { pavilionTalk } from '../pavilion';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { hazardVictims, hazardHit, boxHits, setHazardZones } from '../../hazardHit';
import { makeMover, moveMover, type Mover } from '../movers';
import { runsAround, poolSteps, poolAt, poolZones, drawPoolBack, drawPoolFront, type Pool } from '../water';
import {
  type Ctx, type View, viewIn, box, mix, poly, at, promenade, boxes3, ledge3, setBack, wall, hole, postBoard, hungBoard,
  LOOKS, dimmed, hour, ramp6, onScreen, FACADE_D, INK, LIP,
} from '../kit';
import { TALK } from './lines';
import './kinds';
import { POND_FROM, POND_CHECKPOINTS, ICE_POND, pondRuns, buildPond, updatePond, pondWater, drawPondBack, drawPondFront, pondLamps } from './pond';

const { x0, x1 } = SECTIONS.canada;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from the section's start, heights up from the promenade). He jumps ~145 up, ~210 across.

const LOGPILES: [number, number, number][] = [[380, 520, 90], [540, 620, 140]];
/** The carved poles (solid, narrow), each a stack of faces. */
const POLES: [number, number, number][] = [[700, 760, 160], [840, 900, 240], [980, 1040, 170]];
/** Stumps (solid): in the gaps between the poles and after them (ways back up out of a gap, and up from the far side). */
const STUMPS: [number, number, number][] = [[775, 825, 70], [915, 965, 70], [1050, 1090, 80]];
const POND: Pool = { key: 'logpond', a: X(1100), b: X(1600), surface: 30, bed: 170, col: '#1E3A8A', wall: '#57534E' };
/** The floating logs: where each drifts about, how far, its length. */
const LOGS = [{ base: 1140, amp: 25, w: 130 }, { base: 1300, amp: 25, w: 130 }, { base: 1440, amp: 20, w: 130 }] as const;
const PLUNGE: Pool = { key: 'plunge', a: X(1950), b: X(2250), surface: 30, bed: 200, col: '#0E7490', wall: '#57534E' };
/** The falls: the column of water the flume's logs come down. */
const FALLS = { a: 2070, b: 2150 } as const;
/** The climb: rock ledges either side of the falls (one-way). */
const CLIMB: [number, number, number][] = [[1960, 2060, 130], [2160, 2290, 260], [1960, 2060, 390], [2160, 2290, 520], [1960, 2060, 650], [2160, 2290, 780]];
const TOP = 900;
const CLIFF = 2300, TRAIL_A = 2950, TRAIL_B = 3400;
/** The rink on the clifftop: its boards (solid, low). */
const BOARDS: [number, number][] = [[2430, 2450], [2850, 2870]];
const BOARD_H = 40;
/** The flume's logs: one every LOG_EVERY frames, sliding along the trough LOG_SLIDE frames (the tell), then the drop. */
const LOG_EVERY = 210, LOG_SLIDE = 90, LOG_G = 0.7;

const ENEMIES: [string, number, number][] = [
  // (none stood down in the narrow gap between the log piles and the poles: up on the high pile instead)
  ['m2:fl_lumberjack', 450, 90], ['m2:fl_hockey', 580, 140], ['m2:fl_hockey', 870, 240], ['m2:fl_lumberjack', 1070, 80],
  ['m2:fl_moose', 1720, 0], ['m2:fl_lumberjack', 1880, 0],
  ['m2:fl_hockey', 2240, 520],
  ['m2:fl_mountie', 2380, TOP], ['m2:fl_hockey', 2560, TOP], ['m2:fl_hockey', 2760, TOP], ['m2:fl_moose', 2910, TOP],
  ['m2:fl_lumberjack', 3150, 520], ['m2:fl_mountie', 3470, 0], ['m2:fl_moose', 3540, 0],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[2225, 780, 'small_health'], [2650, TOP, 'small_ammo']];

export const CANADA_CHECKPOINTS = [
  { name: 'CANADA', cp: 90, x: X(150), y: GY },
  { name: 'CANADA: THE LOG POND', cp: 91, x: X(1065), y: GY },
  { name: 'CANADA: THE FALLS', cp: 92, x: X(1900), y: GY },
  { name: 'CANADA: THE RINK', cp: 93, x: X(2340), y: Y(TOP) },
  ...POND_CHECKPOINTS,
];

const RUNS: GroundRun[] = [
  ...runsAround(x0, X(CLIFF), [POND, PLUNGE]),
  { x1: X(CLIFF), y1: Y(TOP), x2: X(TRAIL_A), y2: Y(TOP), surface: 'hard' },
  { x1: X(TRAIL_A), y1: Y(TOP), x2: X(TRAIL_B), y2: GY, surface: 'hard', steps: { n: 15 } },
  { x1: X(TRAIL_B), y1: GY, x2: X(POND_FROM), y2: GY, surface: 'hard' },
  ...pondRuns(),
];

// ---------------------------------------------------------------------------------------------------------------
// The logs: the pond's floating ones, the flume's falling ones

interface Can { logs: Mover[] }
const canOf = (state: GameState) => foreignState<Can>(state, 'canada', () => ({ logs: [] }));
const logX = (i: number, f: number) => X(LOGS[i].base) + Math.sin(f * 0.012 + i * 2.1) * LOGS[i].amp;
const logY = (i: number, f: number) => GY + 18 + Math.round(Math.sin(f * 0.05 + i * 1.7) * 3);
/** The flume's log at frame f: sliding along the trough (k 0..1), or falling (its top y), or gone. */
const flumeAt = (f: number) => {
  const t = f % LOG_EVERY;
  if (t < LOG_SLIDE) return { st: 'slide' as const, k: t / LOG_SLIDE, y: 0 };
  const y = Y(TOP) + 0.5 * LOG_G * (t - LOG_SLIDE) ** 2;
  return y < GY + PLUNGE.surface ? { st: 'fall' as const, k: 1, y } : { st: 'gone' as const, k: 1, y };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const ROCK = '#57534E', PINE = '#14532D', WOOD = '#92400E', LOGC = '#A16207';

/** A log seen side-on: a long brown cylinder, its cut end's rings. */
const drawLog = (c: Ctx, x: number, y: number, w: number, h = 22) => {
  box(c, x - 1, y - 1, w + 2, h + 2, INK); box(c, x, y, w, h, hour(LOGC)); box(c, x, y + 2, w, 3, hour('#CA8A04')); box(c, x, y + h - 5, w, 3, hour('#78350F'));
  for (let k = 1; k < 5; k++) box(c, x + k * (w / 5), y + 6 + (k % 2) * 6, 10, 1, hour('#78350F'));
  c.fillStyle = hour('#FDE68A'); c.beginPath(); c.ellipse(x + w, y + h / 2, 5, h / 2, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = hour('#A16207'); c.lineWidth = 1; c.beginPath(); c.ellipse(x + w, y + h / 2, 2.5, h / 4, 0, 0, Math.PI * 2); c.stroke();
};

/** A pine: a dark trunk, stacked triangles (set back). */
const pine = (c: Ctx, x: number, h: number) => { box(c, x - 4, -h * 0.25, 8, h * 0.25, dimmed('#3F2A1C')); for (let k = 0; k < 3; k++) poly(c, [[x - 30 + k * 6, -h * 0.2 - k * h * 0.22], [x + 30 - k * 6, -h * 0.2 - k * h * 0.22], [x, -h * 0.55 - k * h * 0.2]], dimmed(PINE)); };

/** The cliff (the clifftop's ground, the trail's stairs down): rock under it all, pines on top, the lit lips. */
const drawCliff = (c: Ctx, v: View) => {
  if (!onScreen(v, X(CLIFF) - 300, X(TRAIL_B))) return;
  const R = ramp6(hour(ROCK));
  // (the rock face behind the climb, set back: the falls come down it)
  setBack(c, v, X(1940), CLIFF - 1940, 0.94, () => {
    const w = CLIFF - 1940;
    box(c, 0, -TOP - 40, w, TOP + 40, dimmed(ROCK));
    for (let k = 0; k < 14; k++) box(c, (k * 53) % (w - 30), -((k * 131) % TOP) - 30, 30, 6, dimmed('#44403C'));
  });
  // (the clifftop's mass and the trail's)
  poly(c, [[X(CLIFF), Y(TOP)], [X(TRAIL_A), Y(TOP)], [X(TRAIL_B), GY], [X(TRAIL_B), GY + 400], [X(CLIFF), GY + 400]], R[2]);
  for (let k = 0; k < 18; k++) box(c, X(CLIFF) + ((k * 89) % (TRAIL_A - CLIFF)), Y(TOP) + 40 + ((k * 61) % (TOP - 60)), 40, 6, R[1]);
  box(c, X(CLIFF), Y(TOP), 6, TOP, R[3]);
  // (the clifftop's top going back, its lip)
  poly(c, [at(v.eye, X(CLIFF), Y(TOP), 1), at(v.eye, X(TRAIL_A), Y(TOP), 1), at(v.eye, X(TRAIL_A), Y(TOP), 0.9), at(v.eye, X(CLIFF), Y(TOP), 0.9)], hour('#E0F2FE'));
  box(c, X(CLIFF), Y(TOP), TRAIL_A - CLIFF, 3, LIP[2]); box(c, X(CLIFF), Y(TOP), TRAIL_A - CLIFF, 1, LIP[3]);
  // (the trail's treads)
  const n = 15;
  for (let i = 0; i < n; i++) {
    const a = X(TRAIL_A) + ((TRAIL_B - TRAIL_A) * i) / n, b = X(TRAIL_A) + ((TRAIL_B - TRAIL_A) * (i + 1)) / n, y = Y(TOP) + ((i + 1) / n) * TOP;
    box(c, a, y, b - a, TOP / n + 2, hour('#78716C')); box(c, a, y, b - a, 3, LIP[2]); box(c, a, y, b - a, 1, LIP[3]);
    if (i % 3 === 0) box(c, a + 4, y - 26, 3, 26, hour(WOOD));
  }
};

/** The falls: the pipe at the top (painted rock, badly), the water down the column, the foam at the bottom. */
const drawFalls = (c: Ctx, v: View, f: number) => {
  if (!onScreen(v, X(FALLS.a) - 40, X(FALLS.b) + 40)) return;
  const top = Y(TOP) - 10, bot = GY + PLUNGE.surface;
  box(c, X(FALLS.a) - 10, top - 30, FALLS.b - FALLS.a + 20, 26, hour('#6B7280')); box(c, X(FALLS.a) - 10, top - 30, FALLS.b - FALLS.a + 20, 4, hour('#9CA3AF'));
  c.globalAlpha = 0.7;
  for (let x = X(FALLS.a); x < X(FALLS.b); x += 6) { const off = ((f * 6 + x * 7) % 40); box(c, x, top, 6, bot - top, hour(x % 12 ? '#7DD3FC' : '#BAE6FD')); box(c, x + 1, top + off, 2, 18, '#F0F9FF'); }
  c.globalAlpha = 1;
  for (let k = 0; k < 6; k++) { c.fillStyle = '#F0F9FF'; c.beginPath(); c.arc(X(FALLS.a) + 10 + k * 13, bot - 4 + Math.sin(f * 0.3 + k) * 3, 8, 0, Math.PI * 2); c.fill(); }
};

/** The log flume: its trough on stilts along the clifftop and out over the falls (set back: not somewhere to stand),
 *  a log sliding along it (the tell), the log falling down the falls. */
const drawFlume = (c: Ctx, v: View, f: number) => {
  if (!onScreen(v, X(FALLS.a) - 60, X(TRAIL_A) + 60)) return;
  const fl = flumeAt(f);
  setBack(c, v, X(FALLS.a), TRAIL_A - FALLS.a, 0.95, () => {
    const w = TRAIL_A - FALLS.a, ty = -TOP - 50;
    for (let x = 30; x < w; x += 90) box(c, x, ty, 6, x < CLIFF - FALLS.a ? 50 + 10 : 50, dimmed(WOOD));
    box(c, 0, ty - 20, w, 22, dimmed('#78350F')); box(c, 0, ty - 20, w, 3, dimmed('#A16207'));
    if (fl.st === 'slide') { const lx = (w - 140) * (1 - fl.k); drawLog(c, lx, ty - 34, 130, 20); }
  });
  if (fl.st === 'fall') { c.save(); c.translate(X((FALLS.a + FALLS.b) / 2), fl.y + 15); c.rotate(1.3 + Math.sin(f * 0.2) * 0.2); drawLog(c, -40, -11, 80); c.restore(); }
};

/** The rink: the ice going back (pale), the boards (solid, standable lips), the blue and red lines, the nets. */
const drawRink = (c: Ctx, v: View) => {
  if (!onScreen(v, X(BOARDS[0][0]), X(BOARDS[1][1]))) return;
  const a = X(BOARDS[0][1]), b = X(BOARDS[1][0]);
  poly(c, [at(v.eye, a, Y(TOP), 1), at(v.eye, b, Y(TOP), 1), at(v.eye, b, Y(TOP), 0.88), at(v.eye, a, Y(TOP), 0.88)], hour('#F0F9FF'));
  for (const [lx, col] of [[0.33, '#2563EB'], [0.5, '#DC2626'], [0.67, '#2563EB']] as const) { const x = a + (b - a) * lx; poly(c, [at(v.eye, x - 3, Y(TOP), 1), at(v.eye, x + 3, Y(TOP), 1), at(v.eye, x + 3, Y(TOP), 0.88), at(v.eye, x - 3, Y(TOP), 0.88)], hour(col)); }
  // (the back boards and the glass, set back)
  const [ba, by] = at(v.eye, a, Y(TOP), 0.88), [bb] = at(v.eye, b, Y(TOP), 0.88);
  box(c, ba, by - 30, bb - ba, 30, dimmed('#F8FAFC')); box(c, ba, by - 30, bb - ba, 4, dimmed('#FDE047')); box(c, ba, by - 70, bb - ba, 40, 'rgba(224,242,254,0.25)');
  for (const nx of [a + 30, b - 60]) { box(c, nx, Y(TOP) - 26, 30, 26, '#DC2626'); box(c, nx + 3, Y(TOP) - 23, 24, 23, 'rgba(255,255,255,0.4)'); }
  boxes3(c, v, BOARDS.map(([p, q]) => ({ x: X(p), top: Y(TOP + BOARD_H), w: q - p, bottom: Y(TOP), col: '#F8FAFC', standable: true })));
};

/** A carved pole: plywood, painted faces stacked (a moose, a beaver, a hockey mask, a Mountie hat), wings on top. */
const drawPole = (c: Ctx, v: View, a: number, b: number, h: number, i: number) => {
  if (!onScreen(v, X(a) - 30, X(b) + 30)) return;
  boxes3(c, v, [{ x: X(a), top: Y(h), w: b - a, bottom: GY, col: '#B45309', standable: true }]);
  const faces = ['#78350F', '#7C2D12', '#F8FAFC', '#B91C1C'];
  for (let k = 0; k < Math.floor(h / 50); k++) {
    const fy = Y(h) + 10 + k * 50, col = faces[(k + i) % faces.length];
    box(c, X(a) + 6, fy, b - a - 12, 40, hour(col));
    box(c, X(a) + 14, fy + 10, 8, 8, '#F8FAFC'); box(c, X(b) - 22, fy + 10, 8, 8, '#F8FAFC'); box(c, X(a) + 16, fy + 12, 4, 4, INK); box(c, X(b) - 20, fy + 12, 4, 4, INK);
    box(c, X(a) + 18, fy + 26, b - a - 36, 6, INK);
  }
  // (the "wings": two flat boards bolted on the top, set back)
  for (const s of [-1, 1]) poly(c, [[X((a + b) / 2) + s * 6, Y(h) + 20], [X((a + b) / 2) + s * 46, Y(h) + 6], [X((a + b) / 2) + s * 40, Y(h) + 26]], dimmed('#1D4ED8'));
};

export const canada: ForeignSection = {
  id: 'canada', x0, x1,
  checkpoints: CANADA_CHECKPOINTS,
  build: (state) => {
    layOwn(state, RUNS);
    buildPond(state);
    poolSteps(state, POND); poolSteps(state, PLUNGE);
    for (const [a, b, h] of [...LOGPILES, ...POLES, ...STUMPS]) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'ca-solid' });
    for (const [a, b, h] of CLIMB) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'ca-ledge' });
    for (const [a, b] of BOARDS) solid(state, X(a), Y(TOP + BOARD_H), b - a, BOARD_H, { hidden: true, tag: 'ca-boards' });
    const cn = canOf(state), f = state.frame;
    cn.logs = LOGS.map((l, i) => makeMover(state, logX(i, f), logY(i, f), l.w, 'ca-log'));
    spawnCast(state, ENEMIES, X, Y);
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `ca-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, f = state.frame, cn = canOf(state);
    pavilionTalk(state, 'ca', x0, GY, TALK);
    updatePond(ctx);
    poolZones(state, 'ca-water', [POND, PLUNGE]);
    cn.logs.forEach((m, i) => moveMover(state, m, logX(i, f), logY(i, f)));
    // The flume's logs: a creak as one starts along the trough, then down the falls onto whoever's crossing
    const fl = flumeAt(f), near = Math.abs(p.pos.x - X(FALLS.a)) < 900;
    if (near && f % LOG_EVERY === 0) playSound('rumble', 0.4, 6);
    if (near && f % LOG_EVERY === LOG_SLIDE) playSound('whoosh', 0.7, -10);
    setHazardZones(state, 'ca-falls', [{ x0: X(FALLS.a), x1: X(FALLS.b), y0: Y(TOP), y1: GY + PLUNGE.surface }]);
    if (fl.st === 'fall') {
      const bx = X(FALLS.a) - 6, bw = FALLS.b - FALLS.a + 12, by = fl.y - 25, bh = 80;
      if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && p.pos.x < bx + bw && p.pos.x + p.width > bx && p.pos.y < by + bh && p.pos.y + p.height > by) {
        const side = Math.sign(p.pos.x + p.width / 2 - X((FALLS.a + FALLS.b) / 2)) || 1;
        hurtPlayer(ctx, 13, 'm2:fl_flume_log', { x: side * 9, y: 2 }, 26);
        playSound('slam', 0.9, -8);
      }
      for (const e of hazardVictims(state)) if (boxHits(e, bx, by, bw, bh)) hazardHit(ctx, e, 50, X((FALLS.a + FALLS.b) / 2), 'LOGGED!', { color: '#A16207' });
      if (fl.y + 0.5 * LOG_G * 4 >= GY + PLUNGE.surface - 8 && near) playSound('splash', 0.8, -8);
    }
    return controls;
  },
  waterBodyAt: (_state, x, y) => poolAt([POND, PLUNGE], x, y) ?? pondWater(x, y),
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame, cn = canOf(state);
    promenade(c, v, x0, POND.a, '#D6CBB4', '#8C7F68');
    promenade(c, v, POND.b, PLUNGE.a, '#D6CBB4', '#8C7F68');
    promenade(c, v, PLUNGE.b, X(CLIFF), '#D6CBB4', '#8C7F68');
    promenade(c, v, X(TRAIL_B), ICE_POND.a, '#D6CBB4', '#8C7F68');
    promenade(c, v, ICE_POND.b, X(4560), '#D6CBB4', '#8C7F68');
    promenade(c, v, X(5360), x1, '#D6CBB4', '#8C7F68');
    // (pines behind, the cabin, the ranger station)
    for (const rx of [80, 300, 660, 1060, 1700, 3420, 3560]) setBack(c, v, X(rx) - 40, 80, 0.9, () => pine(c, 40, 220 + (rx % 3) * 30));
    setBack(c, v, X(200), 280, FACADE_D, () => {
      wall(c, 0, 280, 150, '#78350F');
      for (let y = -150; y < 0; y += 15) box(c, 0, y, 280, 3, dimmed('#5B3A1E'));
      poly(c, [[-16, -150], [140, -230], [296, -150]], dimmed('#3F2A1C'));
      hole(c, 120, -76, 40, 76, true); hole(c, 30, -110, 40, 34, true); hole(c, 210, -110, 40, 34, true);
    });
    setBack(c, v, X(3420), 160, FACADE_D, () => { wall(c, 0, 160, 140, '#14532D'); poly(c, [[-10, -140], [80, -200], [170, -140]], dimmed('#7F1D1D')); hole(c, 60, -72, 40, 72, true); });
    // (the camp: log piles (standable), the poles)
    boxes3(c, v, LOGPILES.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: LOGC, standable: true })));
    for (const [a, b, h] of LOGPILES) if (onScreen(v, X(a), X(b))) for (let y = Y(h) + 8; y < GY - 8; y += 24) for (let x = X(a) + 6; x < X(b) - 16; x += 26) { c.fillStyle = hour('#FDE68A'); c.beginPath(); c.arc(x + 10, y + 10, 10, 0, Math.PI * 2); c.fill(); c.strokeStyle = hour('#A16207'); c.lineWidth = 1; c.beginPath(); c.arc(x + 10, y + 10, 5, 0, Math.PI * 2); c.stroke(); }
    boxes3(c, v, STUMPS.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: '#78350F', standable: true })));
    for (const [a, b, h] of STUMPS) if (onScreen(v, X(a), X(b))) { c.fillStyle = hour('#FDE68A'); c.beginPath(); c.ellipse(X((a + b) / 2), Y(h) + 4, (b - a) / 2 - 4, 3, 0, 0, Math.PI * 2); c.fill(); }
    POLES.forEach(([a, b, h], i) => drawPole(c, v, a, b, h, i));
    // (the pond, its logs)
    drawPoolBack(c, v, POND);
    cn.logs.forEach((m, i) => { if (onScreen(v, m.x, m.x + LOGS[i].w)) { drawLog(c, m.x, m.y, LOGS[i].w); box(c, m.x, m.y, LOGS[i].w, 2, LIP[2]); } });
    // (the falls, the climb, the clifftop)
    drawPoolBack(c, v, PLUNGE);
    drawCliff(c, v);
    drawFalls(c, v, f);
    for (const [a, b, h] of CLIMB) if (onScreen(v, X(a), X(b))) { poly(c, [[X(a), Y(h) + 14], [X(b), Y(h) + 14], [X(b) - 16, Y(h) + 40], [X(a) + 20, Y(h) + 34]], hour('#44403C')); ledge3(c, v, X(a), Y(h), b - a, '#78716C', 14); }
    drawFlume(c, v, f);
    drawRink(c, v);
    // (signs)
    if (onScreen(v, X(100), X(320))) postBoard(c, X(200), GY, ['CANADA', "AMERICA'S HAT", 'SORRY FOR THE INCONVENIENCE'], LOOKS.canada(1), '#7F1D1D', undefined, 130);
    if (onScreen(v, X(640), X(700))) postBoard(c, X(660), GY, ['CARVED POLES', '(PLYWOOD)', 'MADE IN OHIO'], LOOKS.canada(1), '#3F2A1C', undefined, 200);
    if (onScreen(v, X(1040), X(1100))) postBoard(c, X(1060), GY, ['LOG POND', 'LOGS: DO NOT RIDE'], LOOKS.canada(1), '#3F2A1C', undefined, 100);
    if (onScreen(v, X(1840), X(1950))) postBoard(c, X(1890), GY, ['THE FALLS', 'REAL WATER*', '*RECYCLED'], LOOKS.canada(1), '#14532D', undefined, 130);
    if (onScreen(v, X(CLIFF), X(2430))) postBoard(c, X(2370), Y(TOP), ['MAPLE LOG FLUME', 'CLOSED', '(THE LOGS GOT OUT)'], LOOKS.canada(1), '#7F1D1D', undefined, 130);
    if (onScreen(v, X(2600), X(2700))) hungBoard(c, X(2650), Y(TOP) - 130, Y(TOP) - 104, ['THE RINK', 'NO FIGHTING (EXCEPT HOCKEY)'], LOOKS.canada(1), '#1E3A8A');
    if (onScreen(v, X(TRAIL_A), X(TRAIL_A + 120))) postBoard(c, X(TRAIL_A + 30), Y(TOP), ['THE TRAIL', '1,000 STAIRS', '(15)'], LOOKS.canada(1), '#3F2A1C', undefined, 120);
    if (onScreen(v, X(3420), X(3580))) hungBoard(c, X(3500), GY - 150, GY - 124, ['RANGER STATION', 'BACK IN 5 MINUTES (1998)'], LOOKS.canada(1), '#14532D');
    if (onScreen(v, X(20), X(120))) {
      const fx = X(40); box(c, fx - 2, GY - 200, 4, 200, hour('#9CA3AF'));
      for (let i = 0; i < 48; i += 4) box(c, fx + 2 + i, GY - 198 + Math.sin(f * 0.08 + i * 0.12) * 2, 4, 30, hour(i < 12 || i >= 36 ? '#D52B1E' : '#F8FAFC'));
      poly(c, [[fx + 26, GY - 194], [fx + 33, GY - 182], [fx + 30, GY - 176], [fx + 22, GY - 176], [fx + 19, GY - 182]], hour('#D52B1E'));
    }
    drawPondBack(c, v, state);
    void mix; void wall; void hole;
  },
  drawFront: (c, state) => {
    const v = viewIn(state), f = state.frame;
    drawPoolFront(c, v, POND, f);
    drawPoolFront(c, v, PLUNGE, f);
    drawPondFront(c, v, state);
  },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    if (onScreen(v, X(200), X(480))) out.push({ x: X(340), y: Y(60), r: 140, a: 0.4, color: '#FDBA74' });
    if (onScreen(v, X(3420), X(3580))) out.push({ x: X(3500), y: Y(60), r: 120, a: 0.4, color: '#FDE68A' });
    if (onScreen(v, X(2430), X(2870))) out.push({ x: X(2650), y: Y(TOP + 120), r: 260, a: 0.35, color: '#E0F2FE' });
    out.push(...pondLamps(v));
    return out;
  },
};
