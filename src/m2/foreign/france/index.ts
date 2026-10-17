// FRANCE: section 8 of Foreign Lands' streets (flows on from Morocco, into the UK: no walls, no doors). A PARIS STREET
// first: two cafes (their striped awnings to stand on, little tables, a rude smoker, snooty waiters flinging plates),
// the newspaper column (climb it), mimes (their invisible walls eat his shots till they break). Then THE CABARET: a
// stage with the CAN-CAN LINE kicking in unison on the beat, its marquee over it (the high way past them). Then THE
// ARC (an Arc de Triomphe-ish arch, "OURS IS BIGGER"; it was an Eiffel-ish tower base till the Eiffel became one of the
// helicopter's landmarks), climbed up its inside: the stair landings in its left pier to the gallery across the vault,
// the frieze ledge, the attic on top, the sculpture's plinth; the SERVICE LIFT in its right pier rides up to the attic
// and down again (the way back up, too). Then the bakery street (baguettes swung), the flower stall, the
// Mona Lisa print stand; then LE LOUVRE (louvre.ts, job 4b: the glass pyramid climbed over through its fountain show,
// the Seine's bookstalls, an apartment block over its mansard roof), to the border with the UK.
//
// The SNES pass: art.ts paints it all (still art stamped for the hour; the lift, the bulbs, the jets, the flags live).
// Checkpoints 70-79. Outdoors: the time of day's light.

import type { Light } from '../../../m1/game/render/lighting';
import type { GameState } from '../../../m1/game/core/state';
import type { ForeignSection } from '../section';
import { layOwn, solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { pavilionTalk } from '../pavilion';
import { playSound } from '../../../m1/game/platform/audio';
import { makeMover, moveMover, type Mover } from '../movers';
import { type Ctx, type View, viewIn, promenade, postBoard, hungBoard, swag, LOOKS, onScreen, FACADE_D } from '../kit';
import { TALK } from './lines';
import {
  type FrFront, BISTRO, OXBLOOD, drawFront, cafeAwning, bistroTable, morrisColumn, drawCurtain, drawStage, drawMarquee, drawArcArt, drawLiftShaft, drawLiftCar,
  drawFlowerStall, drawMonaStand, drawFrFlag,
} from './art';
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
/** The arch: its piers' footprints, the gallery across the vault, the attic, the plinth's top; the landings and ledges between (one-way). */
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
  { name: 'FRANCE: THE ARC', cp: 72, x: X(1520), y: GY },
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
// Drawing (the SNES pass: art.ts paints it; still art stamped for the hour, the lift, the bulbs, the flags live)

/** The Haussmann fronts (set back, braced): limestone over a painted shopfront, French windows, the zinc mansard. */
const FRONTS: FrFront[] = [
  { rx: 300, w: 300, h: 240, name: 'BOULANGERIE (BAKERY)', shop: 'bakery', paint: BISTRO },
  { rx: 780, w: 280, h: 250, name: 'FROMAGE (KRAFT SINGLES)', shop: 'cheese', paint: '#1E3A8A' },
  { rx: 2680, w: 300, h: 230, name: 'CROISSANTS (FROM A CAN)', shop: 'bakery', paint: OXBLOOD },
  { rx: 3060, w: 300, h: 240, name: 'PARFUM (BODY SPRAY)', shop: 'perfume', paint: '#5B2A6E' },
  { rx: 3380, w: 220, h: 220, name: 'BERETS (ONE SIZE)', shop: 'berets', paint: BISTRO },
];
const drawFronts = (c: Ctx, v: View) => {
  const on = FRONTS.filter(fr => onScreen(v, X(fr.rx) - 60, X(fr.rx + fr.w) + 60, FACADE_D));
  on.sort((p, q) => Math.abs(X(q.rx + q.w / 2) - v.eye.x) - Math.abs(X(p.rx + p.w / 2) - v.eye.x));
  for (const fr of on) drawFront(c, v, X(fr.rx), fr);
};

/** THE ARC (the Arc de Triomphe-ish, "OURS IS BIGGER"; it replaced an Eiffel-ish tower base, the Eiffel being one of
 *  the helicopter's landmarks): cream stone behind its ledges. Its two piers (the left one cut open: the stair landings
 *  inside it, what he climbs), the relief panels, the great vault between them with the stone gallery across it (the
 *  first deck), the frieze ledge over the vault, the cornice and the attic block on top (the second level), and the
 *  sculpture's plinth up from it (its step, its top), a tricolor flying over it. The service lift up the right pier. */
const drawTower = (c: Ctx, v: View, lift: Mover | null, f: number) => {
  if (!onScreen(v, X(LEG_L[0]) - 60, X(LEG_R[1]) + 60)) return;
  drawArcArt(c, v, X, Y, { legL: LEG_L, legR: LEG_R, deck: DECK, level2: LEVEL2, top: TOP, girders: GIRDERS }, f);
  // (the service lift's shaft up the right pier, its car)
  drawLiftShaft(c, X(LIFT.a), X(LIFT.a + LIFT.w), Y(LIFT.hi) - 60, lift ? lift.y : GY, f);
  if (lift) drawLiftCar(c, v, X(LIFT.a), LIFT.w, lift.y);
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
    // (the cafes: the awnings over, the tables and their chairs, the newspaper column)
    for (const [a, b, h, col] of AWNINGS) cafeAwning(c, v, X(a), X(b), Y(h), col);
    for (const [a, b, h] of TABLES) bistroTable(c, v, X(a), X(b), Y(h));
    morrisColumn(c, v, X(COLUMN.a), X(COLUMN.b), Y(COLUMN.h));
    // (the cabaret: its curtain, set back (drawn before the stage, so the stage they dance on is in front of it), the
    // stage, the marquee over it to stand on)
    if (onScreen(v, X(STAGE.a) - 40, X(STAGE.b) + 40)) {
      drawCurtain(c, v, X(STAGE.a), X(STAGE.b));
      drawStage(c, v, X(STAGE.a), X(STAGE.b), Y(STAGE.h), f);
      drawMarquee(c, v, X(MARQUEE.a), X(MARQUEE.b), Y(MARQUEE.h), Y(STAGE.h), f);
    }
    drawTower(c, v, fraOf(state).lift, f);
    // (the flower stall, the Mona Lisa stand)
    { const [a, b, h] = STALLS[0]; drawFlowerStall(c, v, X(a), X(b), Y(h)); }
    { const [a, b, h] = STALLS[1]; drawMonaStand(c, v, X(a), X(b), Y(h)); }
    // (string lights over the cafes)
    if (onScreen(v, X(300), X(1060))) { swag(c, X(300), Y(260), X(680), Y(260), 18, ['#FDE68A'], 'bulbs', 18); swag(c, X(740), Y(260), X(1060), Y(260), 18, ['#FDE68A'], 'bulbs', 18); }
    // (signs)
    if (onScreen(v, X(100), X(320))) postBoard(c, X(190), GY, ['FRANCE', 'OOH LA LA ZONE'], LOOKS.france(2), '#14532D');
    { const [a, b, h] = AWNINGS[0]; if (onScreen(v, X(a), X(b))) hungBoard(c, X((a + b) / 2), Y(h) + 50, Y(h) + 76, ['CAFE', 'NO SUBSTITUTIONS'], LOOKS.france(1), '#14532D'); }
    { const [a, b, h] = AWNINGS[1]; if (onScreen(v, X(a), X(b))) hungBoard(c, X((a + b) / 2), Y(h) + 50, Y(h) + 76, ['BISTRO', 'FRENCH FRIES (BELGIAN)'], LOOKS.france(1), '#7F1D1D'); }
    if (onScreen(v, X(STAGE.a) - 120, X(STAGE.a))) postBoard(c, X(STAGE.a) - 60, GY, ['LE CABARET', '(NOT THAT KIND)'], LOOKS.france(1), '#1C1917', undefined, 130);
    if (onScreen(v, X(1460), X(1600))) postBoard(c, X(1530), GY, ['ARC DE TRIOMPHE', 'ACTUAL SIZE*', '*BIGGER'], LOOKS.france(1), '#1C1917', undefined, 130);
    if (onScreen(v, X(LIFT.a), X(LIFT.a + LIFT.w))) hungBoard(c, X(LIFT.a + LIFT.w / 2), Y(LIFT.hi) - 60, Y(LIFT.hi) - 30, ['SERVICE LIFT', '(ASCENSEUR)'], LOOKS.france(1), '#1C1917');
    { const [a, b, h] = STALLS[1]; if (onScreen(v, X(a) - 60, X(b))) postBoard(c, X(a) - 50, GY, ['MONA LISA', 'COPY OF A COPY'], LOOKS.france(1), '#78350F', undefined, 110); void b; void h; }
    drawLouvreBack(c, v, state);
    if (onScreen(v, X(20), X(120))) drawFrFlag(c, X(40), f);
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
