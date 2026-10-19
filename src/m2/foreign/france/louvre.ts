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
import { heard } from '../../bossQuiet';
import { setHazardZones } from '../../hazardHit';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, type Shout } from '../setpiece';
import { type Ctx, type View, postBoard, LOOKS, onScreen } from '../kit';
import { drawPalace, drawPyramidArt, nozzle, jet, monaPostcard, puddle, bookstall, apartmentBlock, ironBalcony } from './art';
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
    if (j.st === 'warn') { hit.clear(); if (j.u === 0 && near && heard(state, X(rx))) playSound('glug', 0.4, 4); }
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

export const drawLouvreBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(LOUVRE_FROM), x1)) return;
  const f = state.frame;
  // (the palace wings behind the courtyard, set back: limestone, the arcade, the pediments, the mansard and pavilion)
  drawPalace(c, v, X(3700), 1000, 300);
  // (the pyramid: glass tiers in their steel lattice, the gift shop dim inside, lit lips along each tier's top)
  if (onScreen(v, X(TIERS[0][0]), X(TIERS[0][1]))) {
    drawPyramidArt(c, v, TIERS.map(([a, b, h], i) => ({ a: X(a), b: X(b), top: Y(h), bottom: Y(i ? TIERS[i - 1][2] : 0) })));
    // (the nozzles in the steps, and their gurgle)
    NOZZLES.forEach((rx, k) => { const j = jetAt(f, k); nozzle(c, X(rx), Y(tierAt(rx)), j.st === 'warn' ? j.u : -1, f); });
    // (the Mona Lisa on the apex: a postcard on its easel, behind a velvet rope)
    monaPostcard(c, v, X(4300), Y(500));
  }
  // (the Seine (a puddle), the bookstalls, the apartment block and its balconies)
  puddle(c, v, X(4655), X(4735), f);
  STALLS.forEach(([a, b, h], i) => bookstall(c, v, X(a), X(b), Y(h), i * 3));
  apartmentBlock(c, v, X(BLOCK.a), X(BLOCK.b), Y(BLOCK.h));
  for (const [a, b, h] of BALCONIES) ironBalcony(c, v, X(a), X(b), Y(h));
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
    jet(c, X(rx), Y(tierAt(rx)), JET_H * j.u, JW, f);
  });
  drawShout(c, louvreOf(state).said);
};

export const louvreLamps = (v: View): Light[] => (onScreen(v, X(3950), X(4650)) ? [{ x: X(4300), y: Y(260), r: 260, a: 0.35, color: '#BFDBFE' }] : []);
