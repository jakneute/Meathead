// FRANCE's far end (job 4b: the pavilions lengthened): LE LOUVRE (GIFT SHOP), the glass pyramid. Past the bakery
// street, the museum's courtyard and its GLASS PYRAMID, stepped (each step a glass tier in a steel frame: he climbs it
// up and over; it's solid to the ground, no way round), the MONA LISA at its apex (a postcard of one, behind a rope).
// THE FOUNTAIN SHOW: nozzles in the pyramid's steps jet up one after another in a wave across it on a timer (the
// gurgle and a spurt first: the tell), knocking whoever's on them up and off (him: `m2:fl_fountain`; the cast too).
// Then the Seine's bookstalls, a Paris apartment block climbed up its balconies and over its mansard roof (down the
// other side: they climb back up), the can-can pair kicking on the beat, the last of the mimes, to the UK.

import type { Light } from '../../../m1/game/render/lighting';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast, byPants } from '../cast';
import { playSound } from '../../../m1/game/platform/audio';
import { setHazardZones } from '../../hazardHit';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, type Shout } from '../setpiece';
import { type Ctx, type View, box, poly, boxes3, ledge3, setBack, wall, hole, postBoard, LOOKS, dimmed, hour, onScreen, INK, mix } from '../kit';
import { V, FOUNTAIN } from './lines';

const { x0, x1 } = SECTIONS.france;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

/** Where the old France ended: this starts there. */
export const LOUVRE_FROM = 3600;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from France's start, heights up from the promenade). He jumps ~145 up, ~210 across.

/** The pyramid's tiers (solid, each on the one under it): [a, b, h]. */
const TIERS: [number, number, number][] = [[3950, 4650, 100], [4030, 4570, 200], [4110, 4490, 300], [4190, 4410, 400], [4260, 4340, 500]];
/** The fountain nozzles (rx) in its steps: a wave across them, one after the next, every PERIOD frames. */
const NOZZLES = [4000, 4150, 4300, 4450, 4600];
const PERIOD = 320, STAGGER = 45, WARN = 40, JET = 55, JET_H = 230, JW = 22;
/** The bookstalls (solid), the apartment block (solid), its balconies (one-way). */
const STALLS: [number, number, number][] = [[4740, 4840, 80], [4880, 4970, 80]];
const BLOCK = { a: 5020, b: 5220, h: 340 } as const;
const BALCONIES: [number, number, number][] = [[4950, 5020, 130], [4960, 5020, 240], [5220, 5290, 240], [5220, 5300, 120]];

const ENEMIES: [string, number, number][] = [
  ['m2:fl_mime', 3700, 0], ['m2:fl_waiter', 3800, 0],
  ['m2:fl_baguette', 4060, 200], ['m2:fl_mime', 4210, 400], ['m2:fl_smoker', 4300, 500], ['m2:fl_waiter', 4460, 300], ['m2:fl_baguette', 4610, 100],
  ['m2:fl_cancan', 4790, 80], ['m2:fl_cancan', 4920, 80],
  ['m2:fl_mime', 5120, BLOCK.h], ['m2:fl_waiter', 5320, 0], ['m2:fl_baguette', 5370, 0],
];

export const LOUVRE_CHECKPOINTS = [
  { name: 'FRANCE: THE LOUVRE (GIFT SHOP)', cp: 74, x: X(3660), y: GY },
  { name: 'FRANCE: THE SEINE', cp: 75, x: X(4700), y: GY },
];

/** The pyramid's top at rx (the highest tier over it), 0 off it. */
const tierAt = (rx: number) => TIERS.reduce((h, [a, b, th]) => (rx >= a && rx <= b ? Math.max(h, th) : h), 0);

/** Nozzle k now: 'warn' (gurgling), 'jet' (0..1 of its height), or off. */
const jetAt = (f: number, k: number) => {
  const t = (f - k * STAGGER + PERIOD * 10) % PERIOD;
  if (t < WARN) return { st: 'warn' as const, u: t / WARN };
  if (t < WARN + JET) { const u = (t - WARN) / JET; return { st: 'jet' as const, u: Math.min(1, u * 5, (1 - u) * 4) }; }
  return { st: 'off' as const, u: 0 };
};

interface Louvre { said: Shout; hit: Set<object>[] }
const louvreOf = (state: GameState) => foreignState<Louvre>(state, 'france-louvre' as 'france', () => ({ said: newShout(), hit: NOZZLES.map(() => new Set<object>()) }));

export const buildLouvre = (state: GameState) => {
  for (const [a, b, h] of TIERS) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'fr-pyramid' });
  for (const [a, b, h] of STALLS) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'fr-bookstall' });
  solid(state, X(BLOCK.a), Y(BLOCK.h), BLOCK.b - BLOCK.a, BLOCK.h, { hidden: true, tag: 'fr-block' });
  for (const [a, b, h] of BALCONIES) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'fr-balcony' });
  spawnCast(state, ENEMIES, X, Y);
  placePickups(state, 'fr', X, Y, [[4280, 500, 'small_health'], [5120, BLOCK.h, 'small_ammo']]);
};

export const updateLouvre = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, f = state.frame, lv = louvreOf(state);
  const near = p.pos.x > X(3700) && p.pos.x < X(4900);
  const zones: { x0: number; x1: number; y0: number; y1: number }[] = [];
  NOZZLES.forEach((rx, k) => {
    const j = jetAt(f, k), base = Y(tierAt(rx)), hit = lv.hit[k];
    if (j.st !== 'off') zones.push({ x0: X(rx) - JW - 10, x1: X(rx) + JW + 10, y0: base - JET_H, y1: base + 4 });
    if (j.st === 'warn') { hit.clear(); if (j.u === 0 && near) playSound('glug', 0.4, 4); }
    if (k === 0 && j.st === 'warn' && j.u === 0 && near) shout(state, lv.said, V.waiter.m, byPants(state, FOUNTAIN), X(4300), Y(500) - 90, 0.3);
    if (j.st !== 'jet') return;
    if (j.u > 0 && j.u < 0.25 && near && !hit.size) playSound('splash', 0.5, 8);
    const h = JET_H * j.u;
    if (!hit.has(p) && hurtIn(ctx, X(rx) - JW, base - h, JW * 2, h, 5, 'm2:fl_fountain', { x: Math.sign(p.pos.x + p.width / 2 - X(rx)) * 6 || 6, y: -15 }, 24)) hit.add(p);
    hitCastIn(ctx, X(rx) - JW, base - h, JW * 2, h, 26, X(rx), 'HOSED!', '#7DD3FC', hit);
  });
  setHazardZones(state, 'fr-fountains', zones);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const GLASS = '#93C5FD', STEEL = '#475569';

export const drawLouvreBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(LOUVRE_FROM), x1)) return;
  const f = state.frame;
  // (the palace wings behind the courtyard, set back: pale stone, mansards, rows of tall windows)
  setBack(c, v, X(3700), 1000, 0.9, () => {
    wall(c, 0, 1000, 300, '#E7E0CC');
    poly(c, [[-10, -300], [1010, -300], [990, -360], [10, -360]], dimmed('#475569'));
    for (let wx = 30; wx < 980; wx += 60) { hole(c, wx, -250, 24, 60, true); hole(c, wx, -130, 24, 70, true); }
  });
  // (the pyramid: glass tiers in steel frames, lit lips along each tier's top: somewhere to stand)
  if (onScreen(v, X(TIERS[0][0]), X(TIERS[0][1]))) {
    boxes3(c, v, TIERS.map(([a, b, h], i) => ({ x: X(a), top: Y(h), w: b - a, bottom: Y(i ? TIERS[i - 1][2] : 0), col: GLASS, standable: true })));
    for (const [a, b, h] of TIERS) {
      for (let x = X(a); x < X(b); x += 40) box(c, x, Y(h), 2, 100, hour(STEEL));
      c.strokeStyle = hour(STEEL); c.lineWidth = 1;
      for (let x = X(a); x < X(b) - 20; x += 40) { c.beginPath(); c.moveTo(x, Y(h)); c.lineTo(x + 40, Y(h) + 100); c.moveTo(x + 40, Y(h)); c.lineTo(x, Y(h) + 100); c.stroke(); }
      box(c, X(a) + 6, Y(h) + 8, 30, 4, mix(hour(GLASS), '#FFFFFF', 0.6));
    }
    // (the nozzles in the steps, and their gurgle)
    NOZZLES.forEach((rx, k) => { const base = Y(tierAt(rx)), j = jetAt(f, k); box(c, X(rx) - 8, base - 6, 16, 6, '#334155'); if (j.st === 'warn' && (f >> 2) % 2) box(c, X(rx) - 4, base - 16 - j.u * 10, 8, 10, '#BAE6FD'); });
    // (the Mona Lisa on the apex: a postcard on a stand, a rope)
    box(c, X(4290), Y(500) - 46, 20, 26, INK); box(c, X(4292), Y(500) - 44, 16, 22, hour('#A16207')); box(c, X(4297), Y(500) - 40, 6, 7, '#E8C7A0');
    box(c, X(4298), Y(500) - 20, 4, 20, '#71717A');
  }
  // (the bookstalls: green boxes with lids; the apartment block: cream stone, a mansard, wrought-iron balconies)
  boxes3(c, v, [
    ...STALLS.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: '#166534', standable: true })),
    { x: X(BLOCK.a), top: Y(BLOCK.h), w: BLOCK.b - BLOCK.a, bottom: GY, col: '#E7E0CC', standable: true },
  ]);
  if (onScreen(v, X(BLOCK.a), X(BLOCK.b))) {
    poly(c, [[X(BLOCK.a), Y(BLOCK.h) + 50], [X(BLOCK.b), Y(BLOCK.h) + 50], [X(BLOCK.b) - 14, Y(BLOCK.h)], [X(BLOCK.a) + 14, Y(BLOCK.h)]], hour('#475569'));
    box(c, X(BLOCK.a), Y(BLOCK.h), BLOCK.b - BLOCK.a, 3, '#FDE68A');
    for (let wy = Y(BLOCK.h) + 70; wy < GY - 40; wy += 90) for (let wx = X(BLOCK.a) + 24; wx < X(BLOCK.b) - 30; wx += 56) box(c, wx, wy, 22, 50, '#1C1014');
  }
  for (const [a, b, h] of BALCONIES) if (onScreen(v, X(a), X(b))) { ledge3(c, v, X(a), Y(h), b - a, '#1C1917', 8); for (let x = X(a) + 4; x < X(b); x += 9) box(c, x, Y(h) - 16, 2, 16, INK); box(c, X(a), Y(h) - 18, b - a, 2, INK); }
  // (signs: held up, nothing over them)
  if (onScreen(v, X(3780), X(3940))) postBoard(c, X(3860), GY, ['LE LOUVRE', '(GIFT SHOP)', 'MONA LISA: TOP', 'ACTUAL SIZE* *SMALLER'], LOOKS.france(1), '#14532D', undefined, 140);
  if (onScreen(v, X(4700), X(4740))) postBoard(c, X(4700), GY, ['LA SEINE', '(A PUDDLE)'], LOOKS.france(1), '#1E3A8A', undefined, 100);
  if (onScreen(v, X(5310), X(5470))) postBoard(c, X(5380), GY, ['LEAVING FRANCE', 'AU REVOIR (HELLO)'], LOOKS.france(1), '#14532D', undefined, 160);
};

export const drawLouvreFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame;
  if (onScreen(v, X(TIERS[0][0]), X(TIERS[0][1]))) NOZZLES.forEach((rx, k) => {
    const j = jetAt(f, k);
    if (j.st !== 'jet') return;
    const base = Y(tierAt(rx)), h = JET_H * j.u;
    c.globalAlpha = 0.8;
    box(c, X(rx) - JW, base - h, JW * 2, h, '#7DD3FC'); box(c, X(rx) - JW / 2, base - h, JW, h, '#E0F2FE');
    for (let k2 = 0; k2 < 6; k2++) box(c, X(rx) + Math.sin(f * 0.4 + k2 * 2) * (JW + 10), base - h + k2 * 6, 5, 5, '#E0F2FE');
    c.globalAlpha = 1;
  });
  drawShout(c, louvreOf(state).said);
};

export const louvreLamps = (v: View): Light[] => (onScreen(v, X(3950), X(4650)) ? [{ x: X(4300), y: Y(260), r: 260, a: 0.35, color: '#BFDBFE' }] : []);
