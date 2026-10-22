// ITALY: section 5 of Foreign Lands' streets (flows on from Germany, into Japan: no walls, no doors). Venice, more or
// less: the piazza first (the pizza tosser, a nonna, the pizza oven to stand on), then the GRAND CANAL (800 wide:
// its bridge is CLOSED FOR REPAIRS, two stubs that don't meet) and its GONDOLA ferrying across and back, a gondolier
// aboard swinging the pole. Then the PALACE (pink and white diamonds, balconies stacked up to its roof: the opera
// singer's high note up there, a small ammo on top), the SECOND CANAL (two gondolas in step: ride one, hop to the
// other), and THE CAMPANILE (a straight Venetian bell tower with a giant pizza on it; it was a leaning tower of pizza),
// climbed balcony by balcony (each further out than the one under it; a nonna and a small health at the top). The piazza again; then IL FORNO and THE ROOFTOPS (oven.ts, job 4b: the
// pizza-oven tunnel's burners and chimneys, the terracotta houses up the hill), to the border with Japan.
//
// The canals are water (he swims; climbs out by the steps at each end). The SNES pass: art.ts paints it all (still art
// stamped for the hour; the gondolas, the bell, the fires live); the canals' backs go down before the fronts, so the
// paving and railing behind each canal never paint over anything nearer. Checkpoints 40-49. Outdoors: the time of
// day's light.

import type { Light } from '../../../m1/game/render/lighting';
import type { GameState } from '../../../m1/game/core/state';
import type { ForeignSection } from '../section';
import { layOwn, solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { pavilionTalk } from '../pavilion';
import { makeMover, moveMover, type Mover } from '../movers';
import { exemptFromZones } from '../../hazardHit';
import { runsAround, poolSteps, poolAt, poolZones, drawPoolBack, drawPoolFront, type Pool } from '../water';
import {
  type Ctx, type View, viewIn, atDepth, promenade, box3Back, still, lip, board, postBoard, flagPole, LOOKS, onScreen, FACADE_D,
} from '../kit';
import { TALK } from './lines';
import './kinds';
import { OVEN_CHECKPOINTS, buildOven, updateOven, drawOvenBack, drawOvenFront, ovenLamps } from './oven';
import { type ItFront, drawFront, laundry, drawPalace as paintedPalace, balcony, drawStub, drawGondola, mooringPole, drawCampanile, paintOvenFront, ovenFire } from './art';

const { x0, x1 } = SECTIONS.italy;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from the section's start, heights up from the promenade). He jumps ~145 up, ~210 across.

const CANAL1: Pool = { key: 'canal1', a: X(1000), b: X(1800), surface: 30, bed: 180, col: '#0E7490', wall: '#A8A29E' };
const CANAL2: Pool = { key: 'canal2', a: X(2300), b: X(3100), surface: 30, bed: 180, col: '#0E7490', wall: '#A8A29E' };
const POOLS = [CANAL1, CANAL2];
const OVEN = { a: 700, b: 820, h: 110 } as const;
/** The bridge that doesn't meet: its two stubs (one-way). */
const STUBS: [number, number, number][] = [[940, 1160, 130], [1640, 1860, 130]];
/** The palace's balconies, loggia and roof (one-way). */
const PALACE: [number, number, number][] = [[1850, 2250, 150], [1900, 2200, 300], [1860, 2240, 450]];
/** The bell tower's floors (one-way balconies, each further right than the one under it). */
const TOWER: [number, number, number][] = [[3180, 3330, 120], [3200, 3350, 240], [3220, 3370, 360], [3240, 3390, 480], [3260, 3410, 600]];
/** The gondolas: width, where each one's left end runs between, its cycle (frames) and how long it waits at each end. */
const GONDOLAS = [
  { w: 220, l: 1010, r: 1570, cycle: 840, wait: 120 },
  { w: 200, l: 2310, r: 2560, cycle: 600, wait: 90 },
  { w: 200, l: 2680, r: 2890, cycle: 600, wait: 90 },
] as const;
/** The deck's top (under the promenade: he steps down onto it). */
const DECK = 8;

const ENEMIES: [string, number, number][] = [
  // the piazza: a nonna on the paving, the pizza tosser up on the oven (pies down at him; THE GRAND CANAL's
  // checkpoint's bank left clear)
  ['m2:fl_nonna', 560, 0], ['m2:fl_pizzaiolo', 760, OVEN.h],
  // the palace, one up each tier (off its checkpoint's spot): a nonna on the first, the opera singer on the second, the
  // pizza tosser on the roof
  ['m2:fl_nonna', 2225, 150], ['m2:fl_opera', 2050, 300], ['m2:fl_pizzaiolo', 2160, 450],
  // the campanile: the pizza tosser on a balcony on the way up (pies flat across the climb), the nonna at the top
  ['m2:fl_pizzaiolo', 3260, 480], ['m2:fl_nonna', 3330, 600], ['m2:fl_opera', 3560, 0], ['m2:fl_gondolier', 3880, 0],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[2050, 450, 'small_ammo'], [3340, 600, 'small_health']];

export const ITALY_CHECKPOINTS = [
  { name: 'ITALY', cp: 40, x: X(150), y: GY },
  { name: 'ITALY: THE GRAND CANAL', cp: 41, x: X(930), y: GY },
  { name: 'ITALY: THE PALACE', cp: 42, x: X(1860), y: GY },
  { name: 'ITALY: THE BELL TOWER', cp: 43, x: X(3140), y: GY },
  ...OVEN_CHECKPOINTS,
];

// ---------------------------------------------------------------------------------------------------------------
// The gondolas

// (the gondoliers ride them: the canals' keep-out isn't for them)
exemptFromZones('m2:fl_gondolier', 'it-canals');

interface Ita { boats: Mover[] }
const itaOf = (state: GameState) => foreignState<Ita>(state, 'italy', () => ({ boats: [] }));
const ease = (t: number) => t * t * (3 - 2 * t);
const boatX = (i: number, f: number) => {
  const g = GONDOLAS[i], half = g.cycle / 2, run = half - g.wait, t = f % g.cycle;
  const L = X(g.l), R = X(g.r);
  if (t < g.wait) return L;
  if (t < half) return L + (R - L) * ease((t - g.wait) / run);
  if (t < half + g.wait) return R;
  return R - (R - L) * ease((t - half - g.wait) / run);
};
const boatY = (i: number, f: number) => GY + DECK + Math.round(Math.sin(f * 0.06 + i * 2) * 2);

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The piazza's fronts (set back, braced): Venetian stucco in ochre, terracotta, rose and cream. */
const FRONTS: ItFront[] = [
  { rx: 300, w: 240, h: 200, col: '#E8A85C', name: 'GELATO (ICE CREAM)', goods: 'gelato' },
  { rx: 560, w: 220, h: 230, col: '#D4613E', name: 'MASKS (HALLOWEEN)', goods: 'masks' },
  { rx: 3480, w: 260, h: 210, col: '#F2E6CC', name: 'PASTA (FROM A BOX)', goods: 'pasta' },
  { rx: 3760, w: 220, h: 190, col: '#D98C7A', name: 'ESPRESSO (DRIP)', goods: 'cups' },
];
const drawFronts = (c: Ctx, v: View) => {
  const on = FRONTS.filter(fr => onScreen(v, X(fr.rx) - 60, X(fr.rx + fr.w) + 60, FACADE_D));
  on.sort((p, q) => Math.abs(X(q.rx + q.w / 2) - v.eye.x) - Math.abs(X(p.rx + p.w / 2) - v.eye.x));
  for (const fr of on) drawFront(c, v, X(fr.rx), fr);
  // (laundry strung across them, window to window, at their depth)
  if (onScreen(v, X(300), X(780), FACADE_D) || onScreen(v, X(3480), X(3980), FACADE_D)) atDepth(c, v.eye, FACADE_D, () => {
    laundry(c, X(318), Y(128), X(530), Y(128), 8, 1);
    laundry(c, X(548), Y(142), X(770), Y(142), 9, 4);
    laundry(c, X(3500), Y(132), X(3720), Y(132), 8, 7);
  });
};

/** The palace (Doge's-ish, set back) and the balconies stacked on its front. */
const drawPalace = (c: Ctx, v: View) => {
  if (!onScreen(v, X(1800), X(2300))) return;
  paintedPalace(c, v, X(1830));
  for (const [a, b, h] of PALACE) balcony(c, v, X(a), X(b), Y(h));
};

/** The broken bridge: two stone stubs arching out over the canal from each bank, not meeting, a barricade on each end. */
const drawBridge = (c: Ctx, v: View) => {
  if (!onScreen(v, X(900), X(1900))) return;
  for (const [a, b, h] of STUBS) drawStub(c, v, X(a), X(b), Y(h), a < 1300);
};

/** THE CAMPANILE (St Mark's-ish; it was a leaning tower of pizza till the Leaning Tower became one of the helicopter's
 *  landmarks): straight up, red brick between its pilasters, dimmed (scenery); its floors are balconies stepping out of
 *  it (each further right, as they were: "the balconies don't even line up"), each lit along its lip. The belfry over
 *  the top floor (white arches, the bell swinging), the green spire, a gold angel on it; a giant pizza nailed to its
 *  front (the pizza gag kept). */
const drawTower = (c: Ctx, v: View, f: number) => {
  if (!onScreen(v, X(3150), X(3460))) return;
  drawCampanile(c, v, X(3190), 200, Y(600), Y(300), f);
  for (const [a, b, h] of TOWER) balcony(c, v, X(a), X(b), Y(h));
};

/** The piazza's pizza oven (a block to stand on): its brick front stamped, the fire in its mouth live, the lit lip; the
 *  board bolted to its front. */
const drawPiazzaOven = (c: Ctx, v: View, f: number) => {
  const b = { x: X(OVEN.a), top: Y(OVEN.h), w: OVEN.b - OVEN.a, bottom: GY, col: '#A0482E', standable: true };
  if (!onScreen(v, b.x, b.x + b.w)) return;
  box3Back(c, v, b);
  still(c, `it-piazza-oven-${b.w}x${OVEN.h}`, b.x, b.top, -2, -1, b.w + 4, OVEN.h + 2, g => paintOvenFront(g, b.w, OVEN.h));
  ovenFire(c, X((OVEN.a + OVEN.b) / 2), GY - 18, 24, f);
  lip(c, b.x, b.top, b.w);
  board(c, X(760), Y(OVEN.h) + 24, ['PIZZA', 'DEEP DISH ONLY'], LOOKS.italy(1), '#7F1D1D');
};

export const italy: ForeignSection = {
  id: 'italy', x0, x1,
  checkpoints: ITALY_CHECKPOINTS,
  build: (state) => {
    layOwn(state, runsAround(x0, x1, POOLS));
    buildOven(state);
    for (const p of POOLS) poolSteps(state, p);
    solid(state, X(OVEN.a), Y(OVEN.h), OVEN.b - OVEN.a, OVEN.h, { hidden: true, tag: 'it-oven' });
    for (const [a, b, h] of [...STUBS, ...PALACE, ...TOWER]) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'it-ledge' });
    const it = itaOf(state);
    it.boats = GONDOLAS.map((g, i) => makeMover(state, boatX(i, state.frame), boatY(i, state.frame), g.w, 'it-gondola'));
    spawnCast(state, ENEMIES, X, Y);
    // (a gondolier aboard the first two, put on the deck wherever each is now)
    for (const m of it.boats.slice(0, 2)) spawnCast(state, [['m2:fl_gondolier', m.x - x0 + 100, 0]], X, () => m.y);
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `it-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, it = itaOf(state), f = state.frame;
    pavilionTalk(state, 'it', x0, GY, TALK);
    poolZones(state, 'it-canals', POOLS);
    updateOven(ctx);
    it.boats.forEach((m, i) => moveMover(state, m, boatX(i, f), boatY(i, f)));
    return controls;
  },
  waterBodyAt: (_state, x, y) => poolAt(POOLS, x, y),
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame;
    promenade(c, v, x0, CANAL1.a, '#E7DCC4', '#9C8C6A', [false, true]);
    promenade(c, v, CANAL1.b, CANAL2.a, '#E7DCC4', '#9C8C6A', [true, true]);
    promenade(c, v, CANAL2.b, x1, '#E7DCC4', '#9C8C6A', [true, false]);
    // (the canals' backs first (their far paving and railing are farther back than any front), then the fronts)
    for (const p of POOLS) drawPoolBack(c, v, p);
    drawFronts(c, v);
    drawPalace(c, v);
    drawBridge(c, v);
    drawPiazzaOven(c, v, f);
    // (the mooring poles, striped, up out of the water; the gondolas)
    for (const [px0, a, b] of [[1020, '#1E40AF', '#F8FAFC'], [1780, '#B91C1C', '#F8FAFC'], [2320, '#1E40AF', '#FDE68A'], [3080, '#B91C1C', '#F8FAFC']] as const) if (onScreen(v, X(px0) - 10, X(px0) + 10)) mooringPole(c, X(px0), GY - 90, GY + 30, a, b);
    const it = itaOf(state);
    it.boats.forEach((m, i) => drawGondola(c, v, m.x, m.y, GONDOLAS[i].w, f + i * 40));
    drawTower(c, v, f);
    // (signs)
    if (onScreen(v, X(100), X(320))) postBoard(c, X(200), GY, ['ITALY', 'BIRTHPLACE OF THE TACO'], LOOKS.italy(2), '#14532D');
    if (onScreen(v, X(900), X(1000))) postBoard(c, X(900), GY, ['PONTE CLOSED', 'FOR REPAIRS', 'TAKE A GONDOLA $40'], LOOKS.italy(1), '#1E3A8A', undefined, 120);
    if (onScreen(v, X(2240), X(2300))) postBoard(c, X(2270), GY, ['GRAND CANAL TWO', 'NO SWIMMING (EVER)'], LOOKS.italy(1), '#1E3A8A', undefined, 100);
    if (onScreen(v, X(3120), X(3180))) postBoard(c, X(3140), GY, ['THE CAMPANILE', 'OF PIZZA', 'NOW 100% UPRIGHT'], LOOKS.italy(1), '#7F1D1D', undefined, 110);
    drawOvenBack(c, v, state);
    if (onScreen(v, X(20), X(120))) flagPole(c, X(40), GY, 200, ['#009246', '#F8FAFC', '#CE2B37'], f, true);
  },
  drawFront: (c, state) => {
    const v = viewIn(state), f = state.frame;
    for (const p of POOLS) drawPoolFront(c, v, p, f);
    drawOvenFront(c, v, state);
  },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    if (onScreen(v, X(OVEN.a), X(OVEN.b))) out.push({ x: X(760), y: Y(OVEN.h) + 60, r: 120, a: 0.55, color: '#FB923C' });
    for (const rx of [1950, 2150]) if (onScreen(v, X(rx), X(rx))) out.push({ x: X(rx), y: Y(180), r: 130, a: 0.4, color: '#FDE68A' });
    out.push(...ovenLamps(v, state.frame));
    return out;
  },
};
