// ITALY: section 5 of Foreign Lands' streets (flows on from Germany, into Japan: no walls, no doors). Venice, more or
// less: the piazza first (the pizza tosser, a nonna, the pizza oven to stand on), then the GRAND CANAL (800 wide:
// its bridge is CLOSED FOR REPAIRS, two stubs that don't meet) and its GONDOLA ferrying across and back, a gondolier
// aboard swinging the pole. Then the PALACE (pink and white diamonds, balconies stacked up to its roof: the opera
// singer's high note up there, a small ammo on top), the SECOND CANAL (two gondolas in step: ride one, hop to the
// other), and THE CAMPANILE (a straight Venetian bell tower with a giant pizza on it; it was a leaning tower of pizza),
// climbed balcony by balcony (each further out than the one under it; a nonna and a small health at the top). The piazza again; then IL FORNO and THE ROOFTOPS (oven.ts, job 4b: the
// pizza-oven tunnel's burners and chimneys, the terracotta houses up the hill), to the border with Japan.
//
// The canals are water (he swims; climbs out by the steps at each end). Crude (the first pass): readable boxes with
// full game feel. Checkpoints 40-49. Outdoors: the time of day's light.

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
  type Ctx, type View, viewIn, box, mix, poly, at, promenade, boxes3, ledge3, setBack, wall, hole, postBoard, hungBoard, swag, flagPole,
  LOOKS, dimmed, hour, ramp6, onScreen, FACADE_D, LIP,
} from '../kit';
import { TALK } from './lines';
import './kinds';
import { OVEN_CHECKPOINTS, buildOven, updateOven, drawOvenBack, drawOvenFront, ovenLamps } from './oven';

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
  ['m2:fl_pizzaiolo', 600, 0], ['m2:fl_nonna', 880, 0],
  ['m2:fl_pizzaiolo', 1940, 0], ['m2:fl_opera', 2050, 300], ['m2:fl_nonna', 2200, 150],
  ['m2:fl_nonna', 3330, 600], ['m2:fl_opera', 3560, 0], ['m2:fl_pizzaiolo', 3750, 0], ['m2:fl_gondolier', 3880, 0],
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

const PINK = '#F9A8D4', CREAM = '#F5F0E0', TERRA = '#C2410C', OCHRE = '#D97706';

/** A gondola: a long black hull curling up at both ends, the steel prow, a red cushion; its deck lit (standable). */
const drawGondola = (c: Ctx, v: View, sx: number, y: number, w: number, f: number) => {
  if (!onScreen(v, sx - 40, sx + w + 40)) return;
  const R = ramp6(hour('#1C1917')), tilt = Math.sin(f * 0.06) * 2;
  poly(c, [at(v.eye, sx, y, 1), at(v.eye, sx + w, y, 1), at(v.eye, sx + w, y, 0.95), at(v.eye, sx, y, 0.95)], R[4]);
  poly(c, [[sx - 26, y - 22 + tilt], [sx, y], [sx + w, y], [sx + w + 30, y - 30 - tilt], [sx + w - 10, y + 26], [sx + 14, y + 26]], R[2]);
  box(c, sx + 8, y + 4, w - 16, 2, R[4]);
  // (the steel prow, the curl at the stern)
  poly(c, [[sx + w + 26, y - 28 - tilt], [sx + w + 40, y - 34 - tilt], [sx + w + 36, y - 22 - tilt], [sx + w + 44, y - 24 - tilt], [sx + w + 30, y - 12 - tilt]], hour('#D6D3D1'));
  box(c, sx + w / 2 - 20, y - 8, 40, 8, hour('#B91C1C')); box(c, sx + w / 2 - 20, y - 8, 40, 2, hour('#F87171'));
  box(c, sx, y, w, 3, LIP[2]); box(c, sx, y, w, 1, LIP[3]);
};

/** The piazza's fronts: ochre, terracotta and cream, green shutters, laundry strung between. */
const drawFronts = (c: Ctx, v: View) => {
  for (const [rx, w, h, col] of [[300, 240, 200, OCHRE], [560, 220, 230, TERRA], [3480, 260, 210, CREAM], [3760, 220, 190, OCHRE]] as const) setBack(c, v, X(rx), w, FACADE_D, () => {
    wall(c, 0, w, h, col, '#78350F');
    hole(c, w / 2 - 20, -80, 40, 80, true);
    for (let k = 0; k < 3; k++) for (let r = 0; r < 2; r++) { const wx = 20 + k * ((w - 60) / 2), wy = -h + 30 + r * 60; hole(c, wx, wy, 22, 32, true); box(c, wx - 8, wy, 7, 32, dimmed('#15803D')); box(c, wx + 23, wy, 7, 32, dimmed('#15803D')); }
  });
};

/** The palace (Doge's-ish): pink and white diamonds on top, white arcades under, the balconies stacked on its front. */
const drawPalace = (c: Ctx, v: View) => {
  if (!onScreen(v, X(1800), X(2300))) return;
  setBack(c, v, X(1830), 440, 0.95, () => {
    wall(c, 0, 440, 470, CREAM);
    for (let y = -460; y < -170; y += 20) for (let x = ((y / 20) % 2) * 14; x < 440; x += 28) poly(c, [[x, y + 10], [x + 14, y], [x + 28, y + 10], [x + 14, y + 20]], dimmed(PINK));
    for (let k = 0; k < 6; k++) { const ax = 16 + k * 70; box(c, ax, -150, 50, 150, '#1C1014'); c.fillStyle = '#1C1014'; c.beginPath(); c.arc(ax + 25, -150, 25, Math.PI, 0); c.fill(); }
    for (let k = 0; k < 4; k++) hole(c, 40 + k * 110, -400, 36, 60, true);
  });
  for (const [a, b, h] of PALACE) { ledge3(c, v, X(a), Y(h), b - a, '#E7E5E4', 12); for (let x = X(a) + 6; x < X(b); x += 14) { box(c, x, Y(h) - 18, 4, 18, hour('#F5F5F4')); } box(c, X(a), Y(h) - 20, b - a, 3, hour('#F5F5F4')); }
};

/** The broken bridge: two stone stubs arching out over the canal from each bank, not meeting, a barrier on each end. */
const drawBridge = (c: Ctx, v: View) => {
  if (!onScreen(v, X(900), X(1900))) return;
  const S = ramp6(hour('#D6D3D1'));
  for (const [a, b, h] of STUBS) {
    const toWater = a < 1300;
    poly(c, [[X(a), Y(h) + 16], [X(b), Y(h) + 16], [X(b), Y(h) + 40], toWater ? [X(a) + 60, GY + 30] : [X(a) + 40, Y(h) + 40], toWater ? [X(a), GY] : [X(b) - 60, GY + 30]], S[2]);
    ledge3(c, v, X(a), Y(h), b - a, '#D6D3D1', 16);
    // (the barrier at the broken end, striped)
    const ex = toWater ? X(b) - 8 : X(a) + 2;
    for (let k = 0; k < 4; k++) box(c, ex, Y(h) - 40 + k * 10, 6, 10, k % 2 ? '#F8FAFC' : '#DC2626');
  }
};

/** THE CAMPANILE (St Mark's-ish; it was a leaning tower of pizza till the Leaning Tower became one of the helicopter's
 *  landmarks): straight up, red brick in tall recessed panels, set back; its floors are balconies stepping out of it
 *  (each further right, as they were: "the balconies don't even line up"), each lit along its lip. The belfry over the
 *  top floor (white arches, the bell swinging), the green pyramid spire, a gold angel on it; a giant pizza nailed to its
 *  front (the pizza gag kept). */
const drawTower = (c: Ctx, v: View, f: number) => {
  if (!onScreen(v, X(3150), X(3460))) return;
  const B = ramp6(hour('#B4532A')), a0 = X(3190), w = 200, top = Y(600);
  // (the shaft, its recessed panels)
  box(c, a0, top, w, GY - top, dimmed(B[2]));
  box(c, a0, top, 12, GY - top, dimmed(B[3])); box(c, a0 + w - 12, top, 12, GY - top, dimmed(B[1]));
  for (let k = 0; k < 4; k++) box(c, a0 + 22 + k * 44, top + 30, 26, GY - top - 60, dimmed(B[1]));
  box(c, a0 - 6, GY - 26, w + 12, 26, dimmed('#D6D3D1'));
  // (the giant pizza on its front: a disc, the crust, the pepperoni)
  const px = a0 + w / 2, py = Y(300);
  c.fillStyle = dimmed('#B45309'); c.beginPath(); c.arc(px, py, 56, 0, Math.PI * 2); c.fill();
  c.fillStyle = dimmed('#FBBF24'); c.beginPath(); c.arc(px, py, 47, 0, Math.PI * 2); c.fill();
  for (const [dx, dy] of [[-20, -18], [16, -24], [24, 10], [-6, 22], [-28, 12], [4, -2]] as const) { c.fillStyle = dimmed('#B91C1C'); c.beginPath(); c.arc(px + dx, py + dy, 7, 0, Math.PI * 2); c.fill(); }
  // (the balconies: the floors, stepping out, their railings)
  for (const [a, b, h] of TOWER) { box(c, X(a), Y(h) + 12, b - a, 10, hour('#D6D3D1')); for (let x = X(a) + 6; x < X(b); x += 14) box(c, x, Y(h) - 18, 3, 18, hour('#F5F5F4')); box(c, X(a), Y(h) - 20, b - a, 3, hour('#F5F5F4')); ledge3(c, v, X(a), Y(h), b - a, '#E7E5E4', 12); }
  // (the belfry: white arches over the top floor, the bell swinging in the middle one)
  const bf = top - 90;
  box(c, a0 - 4, bf, w + 8, 90, dimmed('#F5F0E0'));
  for (let k = 0; k < 4; k++) { const ax = a0 + 14 + k * 46; box(c, ax, bf + 26, 30, 64, '#1C1014'); c.fillStyle = '#1C1014'; c.beginPath(); c.arc(ax + 15, bf + 26, 15, Math.PI, 0); c.fill(); }
  const sw = Math.sin(f * 0.04) * 0.3;
  c.save(); c.translate(a0 + w / 2, bf + 20); c.rotate(sw); poly(c, [[-12, 0], [12, 0], [16, 22], [-16, 22]], hour('#CA8A04')); c.restore();
  box(c, a0 - 10, bf - 8, w + 20, 10, dimmed('#E7E5E4'));
  // (the spire, the angel)
  poly(c, [[a0 + 10, bf - 8], [a0 + w / 2, bf - 190], [a0 + w - 10, bf - 8]], dimmed('#4D7C5A'));
  poly(c, [[a0 + w / 2, bf - 190], [a0 + w / 2 + 40, bf - 8], [a0 + w - 10, bf - 8]], dimmed('#36503F'));
  box(c, a0 + w / 2 - 4, bf - 214, 8, 24, hour('#EAB308')); poly(c, [[a0 + w / 2 - 4, bf - 206], [a0 + w / 2 - 18, bf - 220], [a0 + w / 2 - 4, bf - 200]], hour('#FDE68A'));
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
    promenade(c, v, x0, CANAL1.a, '#E7DCC4', '#9C8C6A');
    promenade(c, v, CANAL1.b, CANAL2.a, '#E7DCC4', '#9C8C6A');
    promenade(c, v, CANAL2.b, x1, '#E7DCC4', '#9C8C6A');
    drawFronts(c, v);
    for (const p of POOLS) drawPoolBack(c, v, p);
    drawPalace(c, v);
    drawBridge(c, v);
    // (the pizza oven: a brick dome on a block, its mouth glowing; stand on it)
    boxes3(c, v, [{ x: X(OVEN.a), top: Y(OVEN.h), w: OVEN.b - OVEN.a, bottom: GY, col: '#9A3412', standable: true }]);
    if (onScreen(v, X(OVEN.a), X(OVEN.b))) { c.fillStyle = hour('#7C2D12'); c.beginPath(); c.arc(X(760), Y(OVEN.h) + 40, 40, Math.PI, 0); c.fill(); box(c, X(744), Y(OVEN.h) + 52, 32, 26, '#F97316'); box(c, X(748), Y(OVEN.h) + 58, 24, 20, '#FDE047'); }
    // (the gondolas, mooring poles striped)
    const it = itaOf(state);
    it.boats.forEach((m, i) => drawGondola(c, v, m.x, m.y, GONDOLAS[i].w, f + i * 40));
    for (const px0 of [1020, 1780, 2320, 3080]) if (onScreen(v, X(px0), X(px0))) for (let k = 0; k < 8; k++) box(c, X(px0) - 3, GY - 120 + k * 15 + 30, 6, 15, k % 2 ? '#F8FAFC' : '#1E40AF');
    drawTower(c, v, f);
    // (laundry strung across the piazza)
    for (let rx = 320; rx < 900; rx += 290) if (onScreen(v, X(rx), X(rx + 290))) swag(c, X(rx), Y(240), X(rx + 290), Y(240), 18, ['#F8FAFC', '#FECACA', '#BFDBFE', '#FDE68A'], 'flags', 30);
    // (signs)
    if (onScreen(v, X(100), X(320))) postBoard(c, X(200), GY, ['ITALY', 'BIRTHPLACE OF THE TACO'], LOOKS.italy(2), '#14532D');
    if (onScreen(v, X(OVEN.a), X(OVEN.b))) hungBoard(c, X(760), Y(OVEN.h) - 4, Y(OVEN.h) + 26, ['PIZZA', 'DEEP DISH ONLY'], LOOKS.italy(1), '#7F1D1D');
    if (onScreen(v, X(900), X(1000))) postBoard(c, X(900), GY, ['PONTE CLOSED', 'FOR REPAIRS', 'TAKE A GONDOLA $40'], LOOKS.italy(1), '#1E3A8A', undefined, 120);
    if (onScreen(v, X(2240), X(2300))) postBoard(c, X(2270), GY, ['GRAND CANAL TWO', 'NO SWIMMING (EVER)'], LOOKS.italy(1), '#1E3A8A', undefined, 100);
    if (onScreen(v, X(3120), X(3180))) postBoard(c, X(3140), GY, ['THE CAMPANILE', 'OF PIZZA', 'NOW 100% UPRIGHT'], LOOKS.italy(1), '#7F1D1D', undefined, 110);
    drawOvenBack(c, v, state);
    if (onScreen(v, X(20), X(120))) flagPole(c, X(40), GY, 200, ['#009246', '#F8FAFC', '#CE2B37'], f, true);
    void mix; void wall; void hole;
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
