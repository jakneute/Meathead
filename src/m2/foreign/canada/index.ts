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
// The SNES pass: art.ts paints it (the cabin, the log piles, the stumps, the carved poles, the pines, the logs, the falls
// and the cliff, the flume, the rink, the ranger station, the flag). Checkpoints 90-99. Outdoors: the time of day's light.

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
import { heard } from '../../bossQuiet';
import { hazardVictims, hazardHit, boxHits, setHazardZones } from '../../hazardHit';
import { makeMover, moveMover, type Mover } from '../movers';
import { runsAround, poolSteps, poolAt, poolZones, drawPoolBack, drawPoolFront, type Pool } from '../water';
import { type Ctx, type View, viewIn, atDepth, promenade, setBack, postBoard, board, post, lip, LOOKS, hour, ramp6, onScreen } from '../kit';
import {
  drawPine, drawCabin, drawRanger, drawLogPile, drawStump, drawPole, drawLog, drawRockFace, drawCliffArt, drawFalls, rockLedge, paintFlume, fallingLog,
  drawRinkIce, drawNets, drawBoards, drawMapleFlag,
} from './art';
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
  // (the camp's way in by CANADA's checkpoint clear) a hockey player on the high pile, a lumberjack on the first carved
  // pole, a hockey player on the tallest
  ['m2:fl_hockey', 580, 140], ['m2:fl_lumberjack', 730, 160], ['m2:fl_hockey', 870, 240],
  // the pond's far bank: a lumberjack right at the edge where the logs come in (chop off the log; shove him in), the
  // moose behind; a lumberjack out on a ledge across the falls (the flume's logs come down on the cast too)
  ['m2:fl_lumberjack', 1640, 0], ['m2:fl_moose', 1720, 0], ['m2:fl_lumberjack', 2010, 390],
  ['m2:fl_hockey', 2240, 520],
  // the rink, past THE RINK's checkpoint's reach: the Mountie and two hockey players at the far boards (the pucks off
  // the boards), the moose past them
  ['m2:fl_mountie', 2720, TOP], ['m2:fl_hockey', 2770, TOP], ['m2:fl_hockey', 2820, TOP], ['m2:fl_moose', 2910, TOP],
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
// Drawing (the SNES pass: art.ts paints it all; here's only where)

/** The rink: the ice and the back boards behind it, then the flume over the clifftop (set back), then the nets and the
 *  near boards. */
const drawRinkAndFlume = (c: Ctx, v: View, f: number) => {
  const a = X(BOARDS[0][1]), b = X(BOARDS[1][0]);
  drawRinkIce(c, v, a, b, Y(TOP));
  if (onScreen(v, X(FALLS.a) - 60, X(TRAIL_A) + 60)) {
    const fl = flumeAt(f), w = TRAIL_A - FALLS.a;
    setBack(c, v, X(FALLS.a), w, 0.95, () => paintFlume(c, w, -TOP - 50, CLIFF - FALLS.a, fl.st === 'slide' ? (w - 140) * (1 - fl.k) : null, f));
    if (fl.st === 'fall') fallingLog(c, X((FALLS.a + FALLS.b) / 2), fl.y + 15, f);
  }
  drawNets(c, v, a, b, Y(TOP));
  for (const [p, q] of BOARDS) drawBoards(c, v, X(p), X(q), Y(TOP + BOARD_H), Y(TOP));
  // (the rink's board, up on two posts off the top of the glass at the back)
  if (onScreen(v, X(2560), X(2740), 0.88)) atDepth(c, v.eye, 0.88, () => {
    const y = Y(TOP) - 77, P = ramp6(hour('#94A3B8'));
    for (const px0 of [X(2650) - 70, X(2650) + 70]) post(c, px0, y - 30, y, 3, P);
    board(c, X(2650), y - 44, ['THE RINK', 'NO FIGHTING (EXCEPT HOCKEY)'], LOOKS.canada(1), '#1E3A8A');
  });
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
    const fl = flumeAt(f), near = heard(state, X(FALLS.a));
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
    promenade(c, v, x0, POND.a, '#D6CBB4', '#8C7F68', [false, true]);
    promenade(c, v, POND.b, PLUNGE.a, '#D6CBB4', '#8C7F68', [true, true]);
    promenade(c, v, PLUNGE.b, X(CLIFF), '#D6CBB4', '#8C7F68', [true, false]);
    promenade(c, v, X(TRAIL_B), ICE_POND.a, '#D6CBB4', '#8C7F68', [false, true]);
    promenade(c, v, ICE_POND.b, X(4560), '#D6CBB4', '#8C7F68', [true, false]);
    promenade(c, v, X(5360), x1, '#D6CBB4', '#8C7F68');
    // (the pools' backs first (their far paving and railing are farther back than anything set back), then the rest)
    drawPoolBack(c, v, POND);
    drawPoolBack(c, v, PLUNGE);
    // (pines behind, the cabin, the ranger station)
    for (const rx of [80, 300, 660, 1060, 1700, 3420, 3560]) drawPine(c, v, X(rx), 220 + (rx % 3) * 30, rx);
    drawCabin(c, v, X(200), 280, 150);
    drawRanger(c, v, X(3420), 160, 140);
    // (the camp: log piles, stumps (an axe left in one), the poles)
    for (const [a, b, h] of LOGPILES) drawLogPile(c, v, X(a), X(b), Y(h));
    STUMPS.forEach(([a, b, h], i) => drawStump(c, v, X(a), X(b), Y(h), i === 1));
    POLES.forEach(([a, b, h], i) => drawPole(c, v, X(a), X(b), Y(h), i));
    // (the pond's logs)
    cn.logs.forEach((m, i) => { if (onScreen(v, m.x - 10, m.x + LOGS[i].w + 10)) { drawLog(c, m.x, m.y, LOGS[i].w); lip(c, m.x, m.y, LOGS[i].w); } });
    // (the falls: the rock face behind the climb, the cliff and the trail, the water, the ledges; the clifftop: the rink
    // and the flume)
    if (onScreen(v, X(1940) - 40, X(CLIFF) + 40, 0.94)) drawRockFace(c, v, X(1940), CLIFF - 1940, TOP + 40, FALLS.a - 1940, FALLS.b - 1940);
    drawCliffArt(c, v, X(CLIFF), X(TRAIL_A), X(TRAIL_B), Y(TOP), 15);
    if (onScreen(v, X(FALLS.a) - 40, X(FALLS.b) + 40)) drawFalls(c, X(FALLS.a), X(FALLS.b), Y(TOP) - 10, GY + PLUNGE.surface, f);
    for (const [a, b, h] of CLIMB) rockLedge(c, v, X(a), X(b), Y(h));
    drawRinkAndFlume(c, v, f);
    // (signs)
    if (onScreen(v, X(100), X(320))) postBoard(c, X(200), GY, ['CANADA', "AMERICA'S HAT", 'SORRY FOR THE INCONVENIENCE'], LOOKS.canada(1), '#7F1D1D', undefined, 130);
    if (onScreen(v, X(640), X(700))) postBoard(c, X(660), GY, ['CARVED POLES', '(PLYWOOD)', 'MADE IN OHIO'], LOOKS.canada(1), '#3F2A1C', undefined, 200);
    if (onScreen(v, X(1040), X(1100))) postBoard(c, X(1060), GY, ['LOG POND', 'LOGS: DO NOT RIDE'], LOOKS.canada(1), '#3F2A1C', undefined, 100);
    if (onScreen(v, X(1840), X(1950))) postBoard(c, X(1890), GY, ['THE FALLS', 'REAL WATER*', '*RECYCLED'], LOOKS.canada(1), '#14532D', undefined, 130);
    if (onScreen(v, X(CLIFF), X(2430))) postBoard(c, X(2370), Y(TOP), ['MAPLE LOG FLUME', 'CLOSED', '(THE LOGS GOT OUT)'], LOOKS.canada(1), '#7F1D1D', undefined, 130);
    if (onScreen(v, X(TRAIL_A), X(TRAIL_A + 120))) postBoard(c, X(TRAIL_A + 30), Y(TOP), ['THE TRAIL', '1,000 STAIRS', '(15)'], LOOKS.canada(1), '#3F2A1C', undefined, 120);
    if (onScreen(v, X(3400), X(3600))) postBoard(c, X(3500), GY, ['RANGER STATION', 'BACK IN 5 MINUTES (1998)'], LOOKS.canada(1), '#14532D', undefined, 150);
    if (onScreen(v, X(20), X(120))) drawMapleFlag(c, X(40), f);
    drawPondBack(c, v, state);
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
