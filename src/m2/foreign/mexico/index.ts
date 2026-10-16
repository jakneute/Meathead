// MEXICO: section 1 of Foreign Lands' streets (and the land's way in). Through FOREIGN LANDS' gate (the PA's welcome,
// his first words), onto the lagoon promenade: papel picado strung over it all, stucco fronts in hot pink, marigold and
// turquoise, the fake volcano smoking far off. The cast come at him one at a time first (a mariachi; a sombrero
// thrower behind the taco cart: up on it to jump the rolling hats), then THE PYRAMID: stepped terraces climbed up and
// over (mariachis and hat throwers up the steps, the TEMPLE OF THE SUN (GIFT SHOP) on top, a small ammo on its roof),
// and under the terraces, inside it, the dusk-lit MERCADO plaza (string lights, stalls, a painted sunset: the blind
// pinata host and the luchador down there, a small health): over or through, either way. Then the cantina (a hat
// thrower up on its balcony) and the lot of them mixed, to the border with Norway.
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
  type Ctx, type View, viewIn, box, mix, poly, at, promenade, boxes3, ledge3, setBack, wall, hole, postBoard, hungBoard, swag, flagPole,
  LOOKS, dimmed, hour, ramp6, slab, timeOfDay, onScreen, FACADE_D, INK, rnd,
} from '../kit';
import { TALK } from './lines';
import './kinds';

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
  // the cantina: a hat thrower on the balcony; the lot of them out front
  ['m2:fl_sombrero', 3610, BALCONY.h], ['m2:fl_luchador', 3400, 0], ['m2:fl_mariachi', 3850, 0], ['m2:fl_pinata', 4000, 0],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[2310, SHRINE.h, 'small_ammo'], [2720, 0, 'small_health']];

export const MEXICO_CHECKPOINTS = [
  { name: 'FOREIGN LANDS', cp: 0, x: X(150), y: GY },
  { name: 'MEXICO: THE PYRAMID', cp: 1, x: X(1440), y: GY },
  { name: 'MEXICO: THE CANTINA', cp: 2, x: X(3200), y: GY },
];

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const PINK = '#EC4899', MARIGOLD = '#F59E0B', TURQ = '#14B8A6', STONE = '#B8A27A', STONE_D = '#8C7A58';
const PICADO = ['#EC4899', '#F59E0B', '#22C55E', '#3B82F6', '#A855F7', '#EF4444'];

/** The land's gate: two pylons stacked with every flag going, the arch's board across the top. */
const drawGate = (c: Ctx, v: View, f: number) => {
  setBack(c, v, X(-40), 560, 0.95, () => {
    for (const px0 of [40, 440]) { wall(c, px0, 70, 300, '#E5E7EB', '#1E3A8A'); for (let k = 0; k < 5; k++) box(c, px0 + 8, -280 + k * 52, 54, 6, dimmed(['#DC2626', '#F8FAFC', '#1E40AF'][k % 3])); }
    box(c, 40, -330, 470, 40, dimmed('#1E3A8A')); box(c, 40, -330, 470, 3, dimmed('#93C5FD'));
    for (let k = 0; k < 12; k++) box(c, 52 + k * 38, -322, 6, 6, '#F8FAFC');
  });
  // (the board's own lettering, unscaled: hung off the arch, in front of it)
  const [gx, gy] = at(v.eye, X(235), GY - 300, 0.95);
  hungBoard(c, gx, gy, gy + 46, ['FOREIGN LANDS', 'THE WHOLE WORLD, FIXED.'], LOOKS.land(2), '#B91C1C');
  for (const [fx, cols, vert] of [[X(30), ['#16A34A', '#F8FAFC', '#DC2626'], true], [X(560), ['#F8FAFC', '#DC2626', '#F8FAFC', '#DC2626'], false]] as const) flagPole(c, fx, GY, 210, [...cols], f, vert);
};

/** The stucco fronts along the promenade (set back, dimmed): pink, marigold, turquoise; tile roofs; dark doorways. */
const FRONTS: [number, number, number, string][] = [[620, 300, 190, PINK], [960, 260, 160, MARIGOLD], [3220, 260, 170, TURQ], [3420, 360, 230, PINK], [3820, 300, 180, MARIGOLD]];
const drawFronts = (c: Ctx, v: View) => {
  for (const [rx, w, h, col] of FRONTS) setBack(c, v, X(rx), w, FACADE_D, () => {
    wall(c, 0, w, h, col);
    for (let k = 0; k < Math.floor(w / 26); k++) { box(c, k * 26 - 2, -h - 8, 24, 8, dimmed('#B45309')); box(c, k * 26 - 2, -h - 8, 24, 2, dimmed('#F59E0B')); }
    hole(c, w / 2 - 22, -80, 44, 80, true);
    for (const wx of [20, w - 50]) hole(c, wx, -h + 40, 30, 34, true);
  });
};

/** The pyramid, set back: its stepped stone mass (behind the terraces he climbs), the plaza's great arch at its foot
 *  (inside: the painted dusk, the string lights, the stalls). */
const drawPyramid = (c: Ctx, v: View) => {
  const W = PYR.b - PYR.a;
  setBack(c, v, X(PYR.a), W, 0.95, () => {
    const tod = timeOfDay();
    for (let k = 0; k < 5; k++) {
      const inset = k * 110, h0 = k * 100;
      slab(c, inset, -h0 - 100, W - inset * 2, 100, ramp6(dimmed(k % 2 ? STONE : STONE_D)), false);
      box(c, inset, -h0 - 100, W - inset * 2, 2, dimmed('#E7D8B0'));
      for (let x = inset + 30; x < W - inset - 30; x += 60) box(c, x, -h0 - 70, 30, 6, dimmed('#6B5B3E'));
    }
    // (the plaza inside: the painted dusk sky in bands, the stars, the stalls under it)
    const ia = 120, ib = W - 120, top = -330;
    const dusk = ['#1E1B4B', '#3B1E5A', '#6B2A6A', '#B4436A', '#E2725B', '#F4A259'];
    dusk.forEach((col, k) => box(c, ia, top + k * 40, ib - ia, 41, mix(col, '#000000', 0.12)));
    for (let k = 0; k < 30; k++) box(c, ia + rnd(k) * (ib - ia), top + rnd(k + 50) * 90, 2, 2, '#FEF3C7');
    for (let k = 0; k < 6; k++) {
      const sx = ia + 40 + k * ((ib - ia - 120) / 5);
      box(c, sx, -70, 100, 70, dimmed('#7C4A2A')); box(c, sx - 6, -96, 112, 26, dimmed(PICADO[k % PICADO.length])); for (let s = 0; s < 7; s++) box(c, sx - 6 + s * 16, -96, 8, 26, dimmed('#FFF7ED'));
      box(c, sx + 10, -60, 80, 8, dimmed('#FDE68A'));
    }
    void tod;
  });
};

/** The taco cart (stand on it): a box with a striped awning on poles, its sign hung off the awning. */
const drawCartBits = (c: Ctx) => {
  const a = X(CART.a), b = X(CART.b);
  for (const px0 of [a + 6, b - 10]) box(c, px0, Y(CART.h) - 70, 4, 70, dimmed('#78716C'));
  for (let k = 0; k < 9; k++) box(c, a - 10 + k * 22, Y(CART.h) - 82, 22, 14, dimmed(k % 2 ? '#F8FAFC' : '#16A34A'));
  hungBoard(c, (a + b) / 2, Y(CART.h) - 68, Y(CART.h) - 40, ['TACOS:', 'AN ITALIAN TRADITION'], LOOKS.mexico(1), '#7C2D12');
  // (the wheels)
  for (const wx of [a + 30, b - 30]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, GY - 12, 13, 0, Math.PI * 2); c.fill(); c.fillStyle = '#A8A29E'; c.beginPath(); c.arc(wx, GY - 12, 6, 0, Math.PI * 2); c.fill(); }
};

/** The cantina's balcony (stand on it): its iron rail, its brackets. */
const drawBalconyBits = (c: Ctx) => {
  const a = X(BALCONY.a), b = X(BALCONY.b), y = Y(BALCONY.h);
  for (let x = a + 8; x < b; x += 30) { box(c, x, y + 16, 5, 30, dimmed('#44403C')); }
  box(c, a, y - 26, b - a, 3, dimmed('#1C1917')); for (let x = a; x < b; x += 12) box(c, x, y - 26, 2, 26, dimmed('#1C1917'));
};

export const mexico: ForeignSection = {
  id: 'mexico', x0, x1,
  checkpoints: MEXICO_CHECKPOINTS,
  build: (state) => {
    layOwn(state, [{ x1: x0 - 300, y1: GY, x2: x1, y2: GY, surface: 'hard' }]);
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
    return controls;
  },
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame;
    // (the promenade first: what stands on it, set back, stands on it, not under it)
    promenade(c, v, x0 - 300, x1, '#E7D9BE', '#9C8462');
    drawGate(c, v, f);
    drawFronts(c, v);
    drawPyramid(c, v);
    // (the pyramid's terraces, the posts holding them, the shrine; the taco cart)
    for (const [a, b, h] of TERRACES) if (onScreen(v, X(a), X(b))) { for (let x = X(a) + 20; x < X(b) - 10; x += 90) box(c, x, Y(h) + 16, 10, h - 16, hour(STONE_D)); }
    boxes3(c, v, [
      { x: X(SHRINE.a), top: Y(SHRINE.h), w: SHRINE.b - SHRINE.a, bottom: Y(400), col: '#C9A86A', standable: true },
      { x: X(CART.a), top: Y(CART.h), w: CART.b - CART.a, bottom: GY - 26, col: '#B45309', standable: true },
    ]);
    for (const [a, b, h] of TERRACES) if (onScreen(v, X(a), X(b))) ledge3(c, v, X(a), Y(h), b - a, STONE, 18);
    ledge3(c, v, X(BALCONY.a), Y(BALCONY.h), BALCONY.b - BALCONY.a, '#9A3412', 14);
    drawCartBits(c); drawBalconyBits(c);
    // (the shrine's doorway and its sign; the plaza's sign over its arch)
    if (onScreen(v, X(SHRINE.a), X(SHRINE.b))) { box(c, X(SHRINE.a) + 70, Y(SHRINE.h) + 50, 40, 70, '#1C1014'); postBoard(c, X((SHRINE.a + SHRINE.b) / 2), Y(400), ['TEMPLE OF THE SUN', '(GIFT SHOP)'], LOOKS.mexico(1), '#7C2D12', undefined, 160); }
    // (papel picado, strung all along over the promenade; string lights through the plaza)
    for (let rx = 400; rx < 4200; rx += 360) if (onScreen(v, X(rx), X(rx + 360))) swag(c, X(rx), Y(250), X(rx + 360), Y(250), 26, PICADO, 'flags');
    for (let rx = PYR.a + 40; rx < PYR.b - 200; rx += 260) if (onScreen(v, X(rx), X(rx + 260))) swag(c, X(rx), Y(92), X(rx + 260), Y(92), 14, ['#FDE68A'], 'bulbs', 14);
    // (the signs: held up on posts, never with anything over them)
    if (onScreen(v, X(500), X(760))) postBoard(c, X(560), GY, ['MEXICO', "EUROPE'S MEXICO"], LOOKS.mexico(2), '#0F766E');
    if (onScreen(v, X(PYR.a - 200), X(PYR.a))) postBoard(c, X(PYR.a - 80), GY, ['MERCADO INSIDE', 'EVERYTHING $25'], LOOKS.mexico(1), '#7C2D12', undefined, 90);
    if (onScreen(v, X(3150), X(3350))) postBoard(c, X(3250), GY, ['SIESTA ZONE', 'NO NAPPING'], LOOKS.mexico(1), '#1E3A8A', undefined, 90);
    if (onScreen(v, X(4000), X(4200))) postBoard(c, X(4100), GY, ['LEAVING MEXICO', 'NEXT: NORWAY'], LOOKS.mexico(1), '#7C2D12', undefined, 100);
    // (a cactus or two in pots by the fronts: scenery)
    for (const rx of [760, 1300, 3300]) if (onScreen(v, X(rx), X(rx + 40))) { const R = ramp6(dimmed('#15803D')); box(c, X(rx), GY - 70, 14, 60, R[3]); box(c, X(rx) - 10, GY - 50, 10, 6, R[3]); box(c, X(rx) - 10, GY - 62, 6, 12, R[3]); box(c, X(rx) - 6, GY - 12, 26, 12, dimmed('#B45309')); }
    void poly;
  },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    for (let rx = PYR.a + 170; rx < PYR.b; rx += 260) if (onScreen(v, X(rx), X(rx))) out.push({ x: X(rx), y: Y(80), r: 150, a: 0.5, color: '#FDE68A' });
    return out;
  },
};

