// FRANCE: section 8 of Foreign Lands' streets (flows on from Morocco, into the UK: no walls, no doors). A PARIS STREET
// first: two cafes (their striped awnings to stand on, little tables, a rude smoker, snooty waiters flinging plates),
// the newspaper column (climb it), mimes (their invisible walls eat his shots till they break). Then THE CABARET: a
// stage with the CAN-CAN LINE kicking in unison on the beat, its marquee over it (the high way past them). Then THE
// EIFFEL-ISH TOWER (the base of one: "OURS IS BIGGER"), climbed: up the girders in its left leg to the first deck,
// along it over the arch, girders to the second level, and the top; the ELEVATOR in its right leg rides up to the
// second level and down again (the way back up, too). Then the bakery street (baguettes swung), the flower stall, the
// Mona Lisa print stand; then LE LOUVRE (louvre.ts, job 4b: the glass pyramid climbed over through its fountain show,
// the Seine's bookstalls, an apartment block over its mansard roof), to the border with the UK.
//
// Crude (the first pass): readable boxes with full game feel. Checkpoints 70-79. Outdoors: the time of day's light.

import type { Light } from '../../../m1/game/render/lighting';
import type { GameState } from '../../../m1/game/core/state';
import type { ForeignSection } from '../section';
import { layOwn, solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { pavilionTalk } from '../pavilion';
import { playSound } from '../../../m1/game/platform/audio';
import { makeMover, moveMover, type Mover } from '../movers';
import {
  type Ctx, type View, viewIn, box, mix, poly, at, promenade, boxes3, ledge3, setBack, wall, hole, postBoard, hungBoard, swag,
  LOOKS, dimmed, hour, ramp6, onScreen, FACADE_D, INK, timeOfDay,
} from '../kit';
import { TALK } from './lines';
import { updateMimeWalls, drawMimeWalls } from './kinds';
import { LOUVRE_CHECKPOINTS, buildLouvre, updateLouvre, drawLouvreBack, drawLouvreFront, louvreLamps } from './louvre';

const { x0, x1 } = SECTIONS.france;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from the section's start, heights up from the promenade). He jumps ~145 up, ~210 across.

/** The cafes' awnings (one-way), their tables (solid), the newspaper column (solid). */
const AWNINGS: [number, number, number, string][] = [[340, 560, 150, '#B91C1C'], [820, 1020, 160, '#15803D']];
const TABLES: [number, number, number][] = [[380, 430, 50], [470, 520, 50], [860, 910, 50], [950, 1000, 50]];
const COLUMN = { a: 680, b: 740, h: 180 } as const;
/** The cabaret's stage (solid) and its marquee over it (one-way). */
const STAGE = { a: 1150, b: 1450, h: 70 } as const;
const MARQUEE = { a: 1180, b: 1420, h: 200 } as const;
/** The tower: its legs' footprints, the first deck, the second level, the top; the girders between (one-way). */
const LEG_L: [number, number] = [1600, 1760], LEG_R: [number, number] = [2440, 2600];
const DECK: [number, number, number] = [1600, 2440, 360];
const LEVEL2: [number, number, number] = [1900, 2300, 620];
const TOP: [number, number, number] = [2060, 2140, 820];
const GIRDERS: [number, number, number][] = [[1620, 1720, 120], [1660, 1760, 240], [1880, 1990, 490], [2000, 2090, 720]];
/** The elevator: its car's width, its x, the bottom and top it runs between, its timing. */
const LIFT = { a: 2460, w: 100, lo: 0, hi: 620, wait: 120, run: 180 } as const;
/** The street beyond: the flower stall, the Mona Lisa stand (solid). */
const STALLS: [number, number, number, string][] = [[2800, 2900, 90, '#15803D'], [3150, 3250, 120, '#78350F']];

const ENEMIES: [string, number, number][] = [
  ['m2:fl_waiter', 620, 0], ['m2:fl_smoker', 710, COLUMN.h], ['m2:fl_waiter', 920, 160], ['m2:fl_mime', 1060, 0], ['m2:fl_baguette', 1110, 0],
  ['m2:fl_cancan', 1200, STAGE.h], ['m2:fl_cancan', 1260, STAGE.h], ['m2:fl_cancan', 1320, STAGE.h], ['m2:fl_cancan', 1380, STAGE.h],
  ['m2:fl_mime', 1540, 0], ['m2:fl_baguette', 1700, 240], ['m2:fl_mime', 2000, 360], ['m2:fl_waiter', 2250, 360], ['m2:fl_smoker', 2100, 620],
  ['m2:fl_baguette', 2700, 0], ['m2:fl_mime', 2980, 0], ['m2:fl_smoker', 3100, 0], ['m2:fl_baguette', 3380, 0],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[2100, 820, 'small_health'], [1300, MARQUEE.h, 'small_ammo']];

export const FRANCE_CHECKPOINTS = [
  { name: 'FRANCE', cp: 70, x: X(150), y: GY },
  { name: 'FRANCE: THE CABARET', cp: 71, x: X(1080), y: GY },
  { name: 'FRANCE: THE TOWER', cp: 72, x: X(1520), y: GY },
  { name: 'FRANCE: THE BAKERY', cp: 73, x: X(2680), y: GY },
  ...LOUVRE_CHECKPOINTS,
];

// ---------------------------------------------------------------------------------------------------------------
// The elevator

interface Fra { lift: Mover | null }
const fraOf = (state: GameState) => foreignState<Fra>(state, 'france', () => ({ lift: null }));
const ease = (t: number) => t * t * (3 - 2 * t);
/** The car's height at frame f: waits at the bottom, up, waits at the top, down. */
const liftH = (f: number) => {
  const { lo, hi, wait, run } = LIFT, cyc = (wait + run) * 2, t = f % cyc;
  if (t < wait) return lo;
  if (t < wait + run) return lo + (hi - lo) * ease((t - wait) / run);
  if (t < wait * 2 + run) return hi;
  return hi - (hi - lo) * ease((t - wait * 2 - run) / run);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const IRON = '#6B5B4B', CREAM = '#EDE4D3', SLATE = '#475569';

/** The Haussmann-ish fronts: cream stone, wrought-iron balconies, gray mansard roofs with little windows. */
const drawFronts = (c: Ctx, v: View) => {
  for (const [rx, w, h] of [[300, 300, 240], [780, 280, 250], [2680, 300, 230], [3060, 300, 240], [3380, 220, 220]] as const) setBack(c, v, X(rx), w, FACADE_D, () => {
    wall(c, 0, w, h, CREAM);
    poly(c, [[-6, -h], [w + 6, -h], [w - 14, -h - 50], [14, -h - 50]], dimmed(SLATE));
    for (let k = 0; k < Math.floor(w / 70); k++) { hole(c, 26 + k * 70, -h - 40, 18, 24, true); hole(c, 20 + k * 70, -h + 30, 26, 44, true); box(c, 16 + k * 70, -h + 74, 34, 3, dimmed('#1C1917')); for (let j = 0; j < 5; j++) box(c, 18 + k * 70 + j * 7, -h + 64, 1, 10, dimmed('#1C1917')); }
    hole(c, w / 2 - 22, -80, 44, 80, true);
  });
};

/** A cafe's awning: striped, sloped, its front lip lit (somewhere to stand); its tables and chairs. */
const drawCafe = (c: Ctx, v: View, a: number, b: number, h: number, col: string) => {
  if (!onScreen(v, X(a) - 20, X(b) + 20)) return;
  for (let x = X(a), k = 0; x < X(b); x += 20, k++) poly(c, [[x, Y(h)], [x + 20, Y(h)], [x + 20, Y(h) + 40], [x, Y(h) + 40]], hour(k % 2 ? '#F8FAFC' : col));
  for (let x = X(a); x < X(b); x += 20) poly(c, [[x, Y(h) + 40], [x + 20, Y(h) + 40], [x + 10, Y(h) + 50]], hour(col));
  ledge3(c, v, X(a), Y(h), b - a, col, 6);
};

/** The tower: lattice legs (crossed girders, set back a touch: the girders inside are what he stands on), the arch
 *  between them, the decks with their railings, the spire going on up out of the top. */
const lattice = (c: Ctx, ax: number, ay: number, bx: number, by: number, w: number, col: string) => {
  c.strokeStyle = col; c.lineWidth = 3;
  c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.moveTo(ax + w, ay); c.lineTo(bx + w, by); c.stroke();
  c.lineWidth = 1.5; c.beginPath();
  const n = Math.max(2, Math.round(Math.abs(by - ay) / 30));
  for (let k = 0; k < n; k++) { const t0 = k / n, t1 = (k + 1) / n; const x0_ = ax + (bx - ax) * t0, y0_ = ay + (by - ay) * t0, x1_ = ax + (bx - ax) * t1, y1_ = ay + (by - ay) * t1; c.moveTo(x0_, y0_); c.lineTo(x1_ + w, y1_); c.moveTo(x0_ + w, y0_); c.lineTo(x1_, y1_); }
  c.stroke();
};
const drawTower = (c: Ctx, v: View, lift: Mover | null) => {
  if (!onScreen(v, X(LEG_L[0]) - 60, X(LEG_R[1]) + 60)) return;
  const I = dimmed(IRON), J = hour(IRON);
  // (the legs, sloping in toward the first deck; the arch between them)
  lattice(c, X(LEG_L[0]), GY, X(LEG_L[0]) + 60, Y(DECK[2]), LEG_L[1] - LEG_L[0], I);
  lattice(c, X(LEG_R[0]) - 60, Y(DECK[2]), X(LEG_R[0]), GY, LEG_R[1] - LEG_R[0], I);
  c.strokeStyle = J; c.lineWidth = 6; c.beginPath(); c.ellipse(X((LEG_L[1] + LEG_R[0]) / 2), GY, (LEG_R[0] - LEG_L[1]) / 2 + 40, 250, 0, Math.PI, 0); c.stroke();
  // (up from the first deck to the second, and the spire over the top)
  lattice(c, X(1880), Y(DECK[2]), X(1920), Y(LEVEL2[2]), 360, I);
  lattice(c, X(2010), Y(LEVEL2[2]), X(2050), Y(TOP[2]), 100, I);
  poly(c, [[X(2085), Y(TOP[2])], [X(2115), Y(TOP[2])], [X(2102), Y(TOP[2]) - 140], [X(2098), Y(TOP[2]) - 140]], I);
  // (the elevator's shaft: two rails up the right leg, the car)
  for (const rx of [LIFT.a - 4, LIFT.a + LIFT.w]) box(c, X(rx), Y(LIFT.hi) - 60, 4, LIFT.hi + 60, J);
  box(c, X(LIFT.a) - 10, Y(LIFT.hi) - 70, LIFT.w + 24, 10, J);
  if (lift) {
    const ly = lift.y;
    box(c, X(LIFT.a) + LIFT.w / 2 - 1, Y(LIFT.hi) - 60, 2, Math.max(0, ly - Y(LIFT.hi) - 10), '#1C1917');
    box(c, X(LIFT.a), ly - 70, LIFT.w, 70, INK); box(c, X(LIFT.a) + 2, ly - 68, LIFT.w - 4, 66, hour('#B45309'));
    box(c, X(LIFT.a) + 8, ly - 60, LIFT.w - 16, 34, timeOfDay().lamps > 0.3 ? '#FDE68A' : '#1C1014');
    for (let k = 1; k < 4; k++) box(c, X(LIFT.a) + 8 + k * ((LIFT.w - 16) / 4), ly - 60, 1, 34, hour('#78350F'));
    ledge3(c, v, X(LIFT.a), ly, LIFT.w, '#B45309', 8);
  }
  // (the decks and the girders: somewhere to stand, the railings behind)
  for (const [a, b, h] of [DECK, LEVEL2, TOP]) { for (let x = X(a) + 6; x < X(b); x += 16) box(c, x, Y(h) - 18, 2, 18, dimmed('#1C1917')); box(c, X(a), Y(h) - 20, b - a, 2, dimmed('#1C1917')); ledge3(c, v, X(a), Y(h), b - a, IRON, h === DECK[2] ? 20 : 14); }
  for (const [a, b, h] of GIRDERS) ledge3(c, v, X(a), Y(h), b - a, IRON, 8);
};

export const france: ForeignSection = {
  id: 'france', x0, x1,
  checkpoints: FRANCE_CHECKPOINTS,
  build: (state) => {
    layOwn(state, [{ x1: x0, y1: GY, x2: x1, y2: GY, surface: 'hard' }]);
    buildLouvre(state);
    for (const [a, b, h] of AWNINGS) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'fr-awning' });
    for (const [a, b, h] of [...TABLES, [COLUMN.a, COLUMN.b, COLUMN.h] as [number, number, number], [STAGE.a, STAGE.b, STAGE.h] as [number, number, number], ...STALLS.map(([a, b, h]) => [a, b, h] as [number, number, number])]) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'fr-solid' });
    for (const [a, b, h] of [[MARQUEE.a, MARQUEE.b, MARQUEE.h] as [number, number, number], DECK, LEVEL2, TOP, ...GIRDERS]) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'fr-ledge' });
    fraOf(state).lift = makeMover(state, X(LIFT.a), Y(liftH(state.frame)), LIFT.w, 'fr-lift');
    spawnCast(state, ENEMIES, X, Y);
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `fr-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, f = state.frame, fr = fraOf(state), p = state.player;
    pavilionTalk(state, 'fr', x0, GY, TALK);
    updateLouvre(ctx);
    updateMimeWalls(ctx);
    if (fr.lift) moveMover(state, fr.lift, X(LIFT.a), Y(liftH(f)));
    const cyc = (LIFT.wait + LIFT.run) * 2, t = f % cyc;
    if ((t === LIFT.wait || t === LIFT.wait * 2 + LIFT.run) && Math.abs(p.pos.x - X(LIFT.a)) < 700) playSound('ding', 0.5, 4);
    return controls;
  },
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame;
    promenade(c, v, x0, x1, '#D9D2C2', '#857B68');
    drawFronts(c, v);
    // (the cafes: awnings over, tables and chairs, the column with its posters)
    for (const [a, b, h, col] of AWNINGS) drawCafe(c, v, a, b, h, col);
    // (the cabaret's curtain, set back: drawn before the stage, so the stage they dance on is in front of it)
    if (onScreen(v, X(STAGE.a), X(STAGE.b))) setBack(c, v, X(STAGE.a), STAGE.b - STAGE.a, 0.93, () => { wall(c, 0, STAGE.b - STAGE.a, 300, '#7F1D1D'); for (let x = 10; x < STAGE.b - STAGE.a; x += 24) box(c, x, -300, 6, 300, dimmed('#991B1B')); });
    boxes3(c, v, [
      ...TABLES.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: '#1C1917', standable: true })),
      { x: X(COLUMN.a), top: Y(COLUMN.h), w: COLUMN.b - COLUMN.a, bottom: GY, col: '#14532D', standable: true },
      { x: X(STAGE.a), top: Y(STAGE.h), w: STAGE.b - STAGE.a, bottom: GY, col: '#7F1D1D', standable: true },
      ...STALLS.map(([a, b, h, col]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col, standable: true })),
    ]);
    for (const [a, b, h] of TABLES) if (onScreen(v, X(a), X(b))) { box(c, X(a) + 18, Y(h) + 6, 14, h - 6, hour('#57534E')); box(c, X(a) + 20, Y(h) - 10, 6, 8, '#FDE68A'); }
    if (onScreen(v, X(COLUMN.a), X(COLUMN.b))) { for (let k = 0; k < 3; k++) box(c, X(COLUMN.a) + 6, Y(COLUMN.h) + 20 + k * 44, COLUMN.b - COLUMN.a - 12, 36, hour(['#FDE68A', '#FCA5A5', '#BFDBFE'][k])); poly(c, [[X(COLUMN.a) - 6, Y(COLUMN.h)], [X(COLUMN.b) + 6, Y(COLUMN.h)], [X((COLUMN.a + COLUMN.b) / 2), Y(COLUMN.h) - 18]], hour('#14532D')); }
    // (the cabaret: the marquee's bulbs, the marquee to stand on)
    if (onScreen(v, X(STAGE.a), X(STAGE.b))) {
      for (const px0 of [X(MARQUEE.a) + 4, X(MARQUEE.b) - 8]) box(c, px0, Y(MARQUEE.h), 4, MARQUEE.h - STAGE.h, hour('#CA8A04'));
      box(c, X(MARQUEE.a), Y(MARQUEE.h), MARQUEE.b - MARQUEE.a, 34, hour('#1C1917'));
      for (let x = X(MARQUEE.a) + 6; x < X(MARQUEE.b); x += 12) box(c, x, Y(MARQUEE.h) + 28, 4, 4, (x + (f >> 3) * 12) % 24 < 12 ? '#FDE047' : '#78350F');
      ledge3(c, v, X(MARQUEE.a), Y(MARQUEE.h), MARQUEE.b - MARQUEE.a, '#CA8A04', 6);
    }
    drawTower(c, v, fraOf(state).lift);
    // (flowers on the stall, the Mona Lisa print)
    { const [a, b, h] = STALLS[0]; if (onScreen(v, X(a), X(b))) for (let k = 0; k < 6; k++) box(c, X(a) + 8 + k * 15, Y(h) - 10, 8, 10, hour(['#F472B6', '#FDE047', '#F87171', '#A78BFA', '#FB923C', '#F8FAFC'][k])); }
    { const [a, b, h] = STALLS[1]; if (onScreen(v, X(a), X(b))) { box(c, X(a) + 30, Y(h) + 12, 40, 52, '#78350F'); box(c, X(a) + 33, Y(h) + 15, 34, 46, hour('#65A30D')); c.fillStyle = hour('#D6A15E'); c.beginPath(); c.ellipse(X(a) + 50, Y(h) + 32, 8, 10, 0, 0, Math.PI * 2); c.fill(); box(c, X(a) + 40, Y(h) + 42, 20, 18, hour('#3F2A1C')); } }
    // (string lights over the cafes)
    if (onScreen(v, X(300), X(1060))) { swag(c, X(300), Y(260), X(680), Y(260), 18, ['#FDE68A'], 'bulbs', 18); swag(c, X(740), Y(260), X(1060), Y(260), 18, ['#FDE68A'], 'bulbs', 18); }
    // (signs)
    if (onScreen(v, X(100), X(320))) postBoard(c, X(190), GY, ['FRANCE', 'OOH LA LA ZONE'], LOOKS.france(2), '#14532D');
    { const [a, b, h] = AWNINGS[0]; if (onScreen(v, X(a), X(b))) hungBoard(c, X((a + b) / 2), Y(h) + 50, Y(h) + 76, ['CAFE', 'NO SUBSTITUTIONS'], LOOKS.france(1), '#14532D'); }
    { const [a, b, h] = AWNINGS[1]; if (onScreen(v, X(a), X(b))) hungBoard(c, X((a + b) / 2), Y(h) + 50, Y(h) + 76, ['BISTRO', 'FRENCH FRIES (BELGIAN)'], LOOKS.france(1), '#7F1D1D'); }
    if (onScreen(v, X(STAGE.a) - 120, X(STAGE.a))) postBoard(c, X(STAGE.a) - 60, GY, ['LE CABARET', '(NOT THAT KIND)'], LOOKS.france(1), '#1C1917', undefined, 130);
    if (onScreen(v, X(1460), X(1600))) postBoard(c, X(1530), GY, ['EIFFEL TOWER', 'ACTUAL SIZE*', '*BIGGER'], LOOKS.france(1), '#1C1917', undefined, 130);
    if (onScreen(v, X(LIFT.a), X(LIFT.a + LIFT.w))) hungBoard(c, X(LIFT.a + LIFT.w / 2), Y(LIFT.hi) - 60, Y(LIFT.hi) - 30, ['ASCENSEUR', '(ELEVATOR)'], LOOKS.france(1), '#1C1917');
    { const [a, b, h] = STALLS[1]; if (onScreen(v, X(a) - 60, X(b))) postBoard(c, X(a) - 50, GY, ['MONA LISA', 'COPY OF A COPY'], LOOKS.france(1), '#78350F', undefined, 110); void b; void h; }
    drawLouvreBack(c, v, state);
    if (onScreen(v, X(20), X(120))) {
      const fx = X(40); box(c, fx - 2, GY - 200, 4, 200, hour('#9CA3AF'));
      for (let i = 0; i < 48; i += 4) box(c, fx + 2 + i, GY - 198 + Math.sin(f * 0.08 + i * 0.12) * 2, 4, 30, hour(i < 16 ? '#002395' : i < 32 ? '#F8FAFC' : '#ED2939'));
    }
    void mix; void at; void ramp6;
  },
  drawFront: (c, state) => { drawMimeWalls(c, state); drawLouvreFront(c, viewIn(state), state); },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    for (const rx of [490, 880]) if (onScreen(v, X(rx), X(rx))) out.push({ x: X(rx), y: Y(240), r: 160, a: 0.4, color: '#FDE68A' });
    if (onScreen(v, X(STAGE.a), X(STAGE.b))) out.push({ x: X(1300), y: Y(200), r: 200, a: 0.5, color: '#FCA5A5' });
    if (onScreen(v, X(LIFT.a), X(LIFT.a + LIFT.w))) { const l = fraOf(state).lift; if (l) out.push({ x: X(LIFT.a + LIFT.w / 2), y: l.y - 40, r: 90, a: 0.45, color: '#FDE68A' }); }
    out.push(...louvreLamps(v));
    return out;
  },
};
