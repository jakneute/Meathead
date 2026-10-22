// MEXICO: section 1 of Foreign Lands' streets (and the land's way in). Through FOREIGN LANDS' gate (the PA's welcome,
// his first words), onto the lagoon promenade: papel picado strung over it all, stucco fronts in hot pink, marigold and
// turquoise, the mesas and plywood saguaros far off. The cast come at him one at a time first (a mariachi; a sombrero
// thrower behind the taco cart: up on it to jump the rolling hats), then THE PYRAMID: stepped terraces climbed up and
// over (mariachis and hat throwers up the steps, the TEMPLE OF THE SUN (GIFT SHOP) on top, a small ammo on its roof),
// and under the terraces, inside it, the dusk-lit MERCADO plaza (string lights, stalls, a painted sunset: the blind
// pinata host and the luchador down there, a small health): over or through, either way. Then the cantina (a hat
// thrower up on its balcony) and the lot of them mixed; then LA QUEBRADA (cliff.ts, job 4b: the fiberglass cliff
// climbed, the cliff divers plunging into the dive pool), to the border with Norway.
//
// Crude (the first pass): readable boxes with full game feel. Checkpoints 0-9. Outdoors: the time of day's light.

import type { Light } from '../../../m1/game/render/lighting';
import type { ForeignSection } from '../section';
import { layOwn, solid, ledge, endWalls } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { pavilionTalk } from '../pavilion';
import { paSay, once, streetsOf } from '../state';
import { byPants } from '../cast';
import { pickLine } from '../../../m1/game/platform/speech';
import { meatheadSays } from '../section';
import { PA_WELCOME, ARRIVE } from '../lines';
import {
  type Ctx, type View, viewIn, at, promenade, boxes3, ledge3, postBoard, hungBoard, swag, flagPole, LOOKS, onScreen, FACADE_D,
} from '../kit';
import { drawGate, drawFront, drawPyramid, pillar, templeFace, drawCart, drawBalcony, pottedCactus, plazaLights, stallGlow, type MxFront } from './art';
import { TALK } from './lines';
import './kinds';
import { CLIFF_FROM, CLIFF_CHECKPOINTS, DIVE_POOL, cliffRuns, buildCliff, updateCliff, cliffWater, drawCliffBack, drawCliffFront, cliffLamps } from './cliff';

const { x0, x1 } = SECTIONS.mexico;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from the section's start, heights up from the promenade). He jumps ~145 up, ~210 across.

/** The pyramid: its terraces (one-way: the plaza's under them), its summit, the shrine on the summit. */
const PYR = { a: 1500, b: 3100 } as const;
const TERRACES: [number, number, number][] = [
  [1500, 1700, 100], [1650, 1850, 200], [1800, 2000, 300], [1950, 2650, 400], [2600, 2800, 300], [2750, 2950, 200], [2900, 3100, 100],
];
const SHRINE = { a: 2220, b: 2400, h: 520 } as const;
const CART = { a: 1050, b: 1230, h: 90 } as const;
const BALCONY = { a: 3500, b: 3720, h: 150 } as const;

const ENEMIES: [string, number, number][] = [
  // alone: a mariachi; a hat thrower past the taco cart
  ['m2:fl_mariachi', 880, 0], ['m2:fl_sombrero', 1380, 0],
  // up the pyramid: a mariachi on the third step, hat throwers and a mariachi on the summit, a hat thrower going down
  ['m2:fl_mariachi', 1900, 300], ['m2:fl_sombrero', 2060, 400], ['m2:fl_mariachi', 2560, 400], ['m2:fl_sombrero', 2860, 200],
  // in the plaza under it: the blind pinata host, the luchador
  ['m2:fl_pinata', 2000, 0], ['m2:fl_luchador', 2500, 0],
  // the cantina (past its checkpoint's reach): a hat thrower on the balcony and the luchador right under it (the hats
  // rolling at him while it lunges); out front the blind pinata host staggering about by a mariachi (its swings get the
  // mariachi too: let it, or lure it)
  ['m2:fl_sombrero', 3610, BALCONY.h], ['m2:fl_luchador', 3690, 0], ['m2:fl_pinata', 3880, 0], ['m2:fl_mariachi', 3960, 0],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[2310, SHRINE.h, 'small_ammo'], [2720, 0, 'small_health']];

export const MEXICO_CHECKPOINTS = [
  { name: 'FOREIGN LANDS', cp: 0, x: X(150), y: GY },
  { name: 'MEXICO: THE PYRAMID', cp: 1, x: X(1440), y: GY },
  { name: 'MEXICO: THE CANTINA', cp: 2, x: X(3200), y: GY },
  ...CLIFF_CHECKPOINTS,
];

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const PINK = '#EC4899', MARIGOLD = '#F59E0B', TURQ = '#14B8A6', STONE = '#B8A27A';
const PICADO = ['#EC4899', '#F59E0B', '#22C55E', '#3B82F6', '#A855F7', '#EF4444'];

/** The land's gate: two pylons hung with banners, the starred beam; its board hung off it, its flags. */
const drawLandGate = (c: Ctx, v: View, f: number) => {
  drawGate(c, v, X(-40));
  // (the board's own lettering, unscaled: hung off the arch, in front of it)
  if (onScreen(v, X(-40), X(520), 0.95)) {
    const [gx, gy] = at(v.eye, X(235), GY - 300, 0.95);
    hungBoard(c, gx, gy, gy + 46, ['FOREIGN LANDS', 'THE WHOLE WORLD, FIXED.'], LOOKS.land(2), '#B91C1C');
  }
  for (const [fx, cols, vert] of [[X(30), ['#16A34A', '#F8FAFC', '#DC2626'], true], [X(560), ['#F8FAFC', '#DC2626', '#F8FAFC', '#DC2626'], false]] as const) if (onScreen(v, fx - 20, fx + 60)) flagPole(c, fx, GY, 210, [...cols], f, vert);
};

/** The stucco fronts along the promenade (set back, dimmed, braced): pink, marigold, turquoise. */
const FRONTS: MxFront[] = [
  { rx: 620, w: 300, h: 190, col: PINK, name: 'TIENDA', sub: 'EVERYTHING $25' },
  { rx: 960, w: 260, h: 160, col: MARIGOLD, name: 'PANADERIA', sub: 'BREAD (MEXICAN)' },
  { rx: 3220, w: 260, h: 170, col: TURQ, name: 'FARMACIA', sub: 'NO PRESCRIPTION' },
  { rx: 3420, w: 360, h: 230, col: PINK, name: 'CANTINA', sub: 'NOW SERVING NACHOS' },
  { rx: 3820, w: 300, h: 180, col: MARIGOLD, name: 'ZAPATERIA', sub: 'SHOES (WE THINK)' },
];
const drawFronts = (c: Ctx, v: View) => {
  // (the farthest from his eye first: a nearer one's front over a farther one's bracing)
  const on = FRONTS.filter(fr => onScreen(v, X(fr.rx) - 60, X(fr.rx + fr.w) + 60, FACADE_D));
  on.sort((p, q) => Math.abs(X(q.rx + q.w / 2) - v.eye.x) - Math.abs(X(p.rx + p.w / 2) - v.eye.x));
  for (const fr of on) drawFront(c, v, X(fr.rx), fr);
};

export const mexico: ForeignSection = {
  id: 'mexico', x0, x1,
  checkpoints: MEXICO_CHECKPOINTS,
  build: (state) => {
    layOwn(state, [{ x1: x0 - 300, y1: GY, x2: X(CLIFF_FROM), y2: GY, surface: 'hard' }, ...cliffRuns()]);
    buildCliff(state);
    endWalls(state, 'mexico', { right: false });
    for (const [a, b, h] of TERRACES) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'mx-terrace' });
    solid(state, X(SHRINE.a), Y(SHRINE.h), SHRINE.b - SHRINE.a, SHRINE.h - 400, { hidden: true, tag: 'mx-shrine' });
    solid(state, X(CART.a), Y(CART.h), CART.b - CART.a, CART.h, { hidden: true, tag: 'mx-cart' });
    ledge(state, X(BALCONY.a), Y(BALCONY.h), BALCONY.b - BALCONY.a, { hidden: true, tag: 'mx-balcony' });
    spawnCast(state, ENEMIES, X, Y);
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `mx-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player;
    // (the land's welcome, at the gate, once; his first words after it)
    if (state.checkpoint === 0 && !p.inCutscene && p.health > 0 && p.pos.x - x0 < 500 && state.frame > 70) once(state, 'fl-welcome', () => {
      paSay(state, pickLine(byPants(state, PA_WELCOME)), () => { const o = streetsOf(state); o.saidAt = state.frame; meatheadSays(state, pickLine(ARRIVE), true); });
    });
    if (p.pos.x - x0 > 450 || state.checkpoint > 0) pavilionTalk(state, 'mx', x0, GY, TALK);
    updateCliff(ctx);
    return controls;
  },
  waterBodyAt: (_state, x, y) => cliffWater(x, y),
  drawFront: (c, state) => drawCliffFront(c, viewIn(state), state),
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame;
    // (the promenade first: what stands on it, set back, stands on it, not under it)
    promenade(c, v, x0 - 300, DIVE_POOL.a, '#E7D9BE', '#9C8462', [false, true]);
    promenade(c, v, DIVE_POOL.b, x1, '#E7D9BE', '#9C8462', [true, false]);
    drawLandGate(c, v, f);
    drawFronts(c, v);
    drawPyramid(c, v, X(PYR.a), PYR.b - PYR.a);
    // (the stalls' glow in the plaza after dark)
    for (let rx = PYR.a + 260; rx < PYR.b - 200; rx += 260) if (onScreen(v, X(rx), X(rx), 0.95)) { const [gx, gy] = at(v.eye, X(rx), Y(60), 0.95); stallGlow(c, gx, gy); }
    drawCliffBack(c, v, state);
    // (a cactus or two in pots by the fronts: scenery)
    for (const rx of [760, 1300, 3300]) if (onScreen(v, X(rx) - 20, X(rx + 40))) pottedCactus(c, X(rx));
    // (the pyramid's terraces, the stone pillars holding them, the temple; the taco cart)
    for (const [a, b, h] of TERRACES) if (onScreen(v, X(a), X(b))) { for (let x = X(a) + 20; x < X(b) - 10; x += 90) pillar(c, x, Y(h) + 18, GY); }
    boxes3(c, v, [
      { x: X(SHRINE.a), top: Y(SHRINE.h), w: SHRINE.b - SHRINE.a, bottom: Y(400), col: '#C9A86A', standable: true, look: 'stone' },
      { x: X(CART.a), top: Y(CART.h), w: CART.b - CART.a, bottom: GY - 26, col: '#2F8A4A', standable: true, look: 'plank' },
    ]);
    if (onScreen(v, X(SHRINE.a), X(SHRINE.b))) templeFace(c, X(SHRINE.a), Y(SHRINE.h), SHRINE.b - SHRINE.a, SHRINE.h - 400);
    for (const [a, b, h] of TERRACES) if (onScreen(v, X(a), X(b))) ledge3(c, v, X(a), Y(h), b - a, STONE, 18, 'stone');
    if (onScreen(v, X(BALCONY.a) - 20, X(BALCONY.b) + 20)) { drawBalcony(c, X(BALCONY.a), X(BALCONY.b), Y(BALCONY.h)); ledge3(c, v, X(BALCONY.a), Y(BALCONY.h), BALCONY.b - BALCONY.a, '#9A3412', 14, 'stone'); }
    if (onScreen(v, X(CART.a) - 20, X(CART.b) + 20)) { drawCart(c, X(CART.a), X(CART.b), Y(CART.h), f); hungBoard(c, X((CART.a + CART.b) / 2), Y(CART.h) - 68, Y(CART.h) - 40, ['TACOS:', 'AN ITALIAN TRADITION'], LOOKS.mexico(1), '#7C2D12'); }
    // (the temple's sign)
    if (onScreen(v, X(SHRINE.a), X(SHRINE.b))) postBoard(c, X((SHRINE.a + SHRINE.b) / 2), Y(400), ['TEMPLE OF THE SUN', '(GIFT SHOP)'], LOOKS.mexico(1), '#7C2D12', undefined, 160);
    // (papel picado, strung all along over the promenade; string lights through the plaza)
    for (let rx = 400; rx < 4300; rx += 360) if (onScreen(v, X(rx), X(rx + 360))) swag(c, X(rx), Y(250), X(rx + 360), Y(250), 26, PICADO, 'flags');
    plazaLights(c, v, X(PYR.a + 40), X(PYR.b - 200), Y(92), f);
    // (the signs: held up on posts, never with anything over them)
    if (onScreen(v, X(500), X(760))) postBoard(c, X(560), GY, ['MEXICO', "EUROPE'S MEXICO"], LOOKS.mexico(2), '#0F766E');
    if (onScreen(v, X(PYR.a - 200), X(PYR.a))) postBoard(c, X(PYR.a - 80), GY, ['MERCADO INSIDE', 'EVERYTHING $25'], LOOKS.mexico(1), '#7C2D12', undefined, 90);
    if (onScreen(v, X(3150), X(3350))) postBoard(c, X(3250), GY, ['SIESTA ZONE', 'NO NAPPING'], LOOKS.mexico(1), '#1E3A8A', undefined, 90);
  },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    for (let rx = PYR.a + 170; rx < PYR.b; rx += 260) if (onScreen(v, X(rx), X(rx))) out.push({ x: X(rx), y: Y(80), r: 150, a: 0.5, color: '#FDE68A' });
    out.push(...cliffLamps(v));
    return out;
  },
};

