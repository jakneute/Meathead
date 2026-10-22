// THE UNITED KINGDOM: section 9 of Foreign Lands' streets (flows on from France, into Canada: no walls, no doors). FOG
// rolling over all of it (the fog machine's: thin, it never hides who's there). The palace gate first: sentry boxes
// (their roofs to stand on) and ROYAL GUARDS who don't move, don't react, don't hurt to bump into... till they're hurt.
// Then the London street: red phone booths, a bus stop, and the DOUBLE-DECKER BUS running its route up and down the
// street (it reverses back, beeping): its front runs over whoever's in the way (him, the cast: the bus stop's shelter
// and the booths are out of its lane), and its roof is a ride (a hooligan up top, pints). Then THE PUB, climbed over
// (the phone booth up onto its roof, barrels down the far side), and TOWER BRIDGE (ish) over the Thames (ish): its
// two halves lift on a schedule (the bell first) and drop whoever's on them in the river; the towers' stairs up to the
// high walkway across (the dry way, whenever). The tea shop, a last guard; then THE WORLD'S TALLEST PHONE BOX
// (clocktower.ts, job 4b: climbed inside past the swinging handset and the ringing phone, out through the smashed glass
// panes at the top and down), to Canada.
//
// The SNES pass: art.ts paints it (the terraces and their shops, the palace gate, the sentry boxes, the phone boxes, the
// bus and its stop, the pub, the barrels, the tea cart, Tower Bridge, the fog, the flag). Checkpoints 80-89. Outdoors:
// the time of day's light.

import type { Light } from '../../../m1/game/render/lighting';
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
import { type Ctx, type View, viewIn, promenade, postBoard, hungBoard, LOOKS, onScreen, FACADE_D } from '../kit';
import {
  type UkFront, drawTerrace, drawGate, streetLamp, drawSentry, drawBooth, drawShelter, drawBus, drawPub, drawBarrels, drawTeaCart,
  drawChain, drawBascule, drawBridgeTower, drawWalkway, drawLanding, drawFog, drawJack,
} from './art';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { TALK } from './lines';
import { TOWER_CHECKPOINTS, buildTower, updateTower, drawTowerBack, drawTowerFront, towerLamps } from './clocktower';
import './kinds';

const { x0, x1 } = SECTIONS.uk;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from the section's start, heights up from the promenade). He jumps ~145 up, ~210 across.

const SENTRY: [number, number, number][] = [[150, 210, 160], [380, 440, 160]];
const BOOTHS: [number, number, number][] = [[500, 550, 120], [1960, 2010, 120]];
const SHELTER = { a: 570, b: 650, h: 100 } as const;
/** The bus: its length, where its left end runs between, its roof, its waits and runs (frames). */
const BUS = { w: 300, l: 680, r: 1600, roof: 150, wait: 150, run: 320 } as const;
const PUB = { a: 2050, b: 2300, h: 170 } as const;
const BARRELS = { a: 2310, b: 2360, h: 90 } as const;
const THAMES: Pool = { key: 'thames', a: X(2440), b: X(3000), surface: 30, bed: 180, col: '#475569', wall: '#57534E' };
/** The bridge: its towers (solid from `lo` up: walk under), the high walkway, the stairs up and down, its two halves. */
const TOWERS: [number, number][] = [[2380, 2440], [3000, 3060]];
const TOWER_LO = 110, TOWER_HI = 420;
const STAIRS: [number, number, number][] = [[2330, 2380, 210], [2270, 2330, 320], [3060, 3130, 300], [3120, 3190, 180]];
const HALF = 280;
/** The halves' schedule: down, lifting, up, lowering (frames); how far up (radians). */
const B_DOWN = 380, B_MOVE = 60, B_UP = 200, B_MAX = 1.05;
const CART = { a: 3250, b: 3330, h: 80 } as const;

const ENEMIES: [string, number, number][] = [
  ['m2:fl_guard', 250, 0], ['m2:fl_guard', 470, 0],
  // a bobby out on the bus's street (lure him into the bus's way: it runs over the cast too); past THE PUB's checkpoint's
  // reach, a hooligan on the pub roof's far edge and one on the barrels (pints down at him on the way over)
  ['m2:fl_bobby', 1250, 0], ['m2:fl_hooligan', 2295, PUB.h], ['m2:fl_hooligan', 2335, BARRELS.h],
  ['m2:fl_bobby', 2700, TOWER_HI], ['m2:fl_tealady', 3150, 180],
  ['m2:fl_bobby', 3200, 0], ['m2:fl_tealady', 3290, CART.h], ['m2:fl_hooligan', 3420, 0], ['m2:fl_guard', 3540, 0],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[2720, TOWER_HI, 'small_ammo'], [2410, TOWER_HI, 'small_health']];

export const UK_CHECKPOINTS = [
  { name: 'THE UNITED KINGDOM', cp: 80, x: X(100), y: GY },
  { name: 'THE UK: THE BUS STOP', cp: 81, x: X(600), y: GY },
  { name: 'THE UK: THE PUB', cp: 82, x: X(1930), y: GY },
  { name: 'THE UK: THE BRIDGE', cp: 83, x: X(2410), y: GY },
  ...TOWER_CHECKPOINTS,
];

// ---------------------------------------------------------------------------------------------------------------
// The bus and the bridge

interface Brit { bus: Mover | null; halves: Mover[] }
const britOf = (state: GameState) => foreignState<Brit>(state, 'uk', () => ({ bus: null, halves: [] }));
const ease = (t: number) => t * t * (3 - 2 * t);
/** The bus's left end at frame f, and which way it's going (0 stopped). */
const busAt = (f: number) => {
  const { wait, run } = BUS, cyc = (wait + run) * 2, t = f % cyc, L = X(BUS.l), R = X(BUS.r);
  if (t < wait) return { x: L, dir: 0 };
  if (t < wait + run) return { x: L + (R - L) * ease((t - wait) / run), dir: 1 };
  if (t < wait * 2 + run) return { x: R, dir: 0 };
  return { x: R - (R - L) * ease((t - wait * 2 - run) / run), dir: -1 };
};
/** How far up the bridge's halves are (0 down .. 1 up) at frame f. */
const liftK = (f: number) => {
  const t = f % (B_DOWN + B_UP + B_MOVE * 2);
  if (t < B_DOWN) return 0;
  if (t < B_DOWN + B_MOVE) return ease((t - B_DOWN) / B_MOVE);
  if (t < B_DOWN + B_MOVE + B_UP) return 1;
  return 1 - ease((t - B_DOWN - B_MOVE - B_UP) / B_MOVE);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (the SNES pass: art.ts paints it all; here's only where)

/** The terraces (set back, braced): brick, London stock and white stucco; shops in two. */
const FRONTS: UkFront[] = [
  { rx: 560, w: 260, h: 200, kind: 'brick', shop: { name: 'FISH & CHIPS (FRIES)', goods: 'chips', paint: '#1E3A8A' } },
  { rx: 900, w: 300, h: 230, kind: 'stucco', door: '#111827' },
  { rx: 1260, w: 280, h: 210, kind: 'stock', shop: { name: 'BISCUITS (COOKIES)', goods: 'biscuits', paint: '#7F1D1D' } },
  { rx: 1600, w: 300, h: 220, kind: 'stucco', shop: { name: 'TEA (SWEET, ICED)', goods: 'tea', paint: '#14532D' } },
  { rx: 3120, w: 340, h: 190, kind: 'stucco', shop: { name: 'CHEMIST (DRUGSTORE)', goods: 'chemist', paint: '#1F3A5A' } },
];
const drawFronts = (c: Ctx, v: View) => {
  const on = FRONTS.filter(fr => onScreen(v, X(fr.rx) - 60, X(fr.rx + fr.w) + 60, FACADE_D));
  on.sort((p, q) => Math.abs(X(q.rx + q.w / 2) - v.eye.x) - Math.abs(X(p.rx + p.w / 2) - v.eye.x));
  for (const fr of on) drawTerrace(c, v, X(fr.rx), fr);
};

/** The bridge: the bascules (lifting about their hinges), the towers (their tops set back, the arches under them), the
 *  chains down to the banks, the high walkway, the stairs' landings. */
const drawBridge = (c: Ctx, v: View, f: number) => {
  if (!onScreen(v, X(2240), X(3220))) return;
  const k = liftK(f), ang = k * B_MAX;
  drawChain(c, v, X(2380), Y(TOWER_HI - 20), X(2330), Y(200), X(2270), GY - 30);
  drawChain(c, v, X(3060), Y(TOWER_HI - 20), X(3110), Y(200), X(3170), GY - 30);
  drawBascule(c, THAMES.a, 1, ang, HALF, k === 0);
  drawBascule(c, THAMES.b, -1, ang, HALF, k === 0);
  for (const [a, b] of TOWERS) drawBridgeTower(c, v, X(a), X(b), Y(TOWER_HI), Y(TOWER_LO));
  drawWalkway(c, v, X(TOWERS[0][1]), X(TOWERS[1][0]), Y(TOWER_HI));
  for (const [a, b, h] of STAIRS) drawLanding(c, v, X(a), X(b), Y(h));
};

export const uk: ForeignSection = {
  id: 'uk', x0, x1,
  checkpoints: UK_CHECKPOINTS,
  build: (state) => {
    layOwn(state, runsAround(x0, x1, [THAMES]));
    buildTower(state);
    poolSteps(state, THAMES);
    for (const [a, b, h] of [...SENTRY, ...BOOTHS, [PUB.a, PUB.b, PUB.h] as [number, number, number], [BARRELS.a, BARRELS.b, BARRELS.h] as [number, number, number], [CART.a, CART.b, CART.h] as [number, number, number]]) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'uk-solid' });
    ledge(state, X(SHELTER.a), Y(SHELTER.h), SHELTER.b - SHELTER.a, { hidden: true, tag: 'uk-shelter' });
    for (const [a, b] of TOWERS) solid(state, X(a), Y(TOWER_HI), b - a, TOWER_HI - TOWER_LO, { hidden: true, tag: 'uk-tower' });
    ledge(state, X(TOWERS[0][1]), Y(TOWER_HI), X(TOWERS[1][0]) - X(TOWERS[0][1]), { hidden: true, tag: 'uk-walkway' });
    for (const [a, b, h] of STAIRS) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'uk-stair' });
    const br = britOf(state), f = state.frame, b0 = busAt(f), up = liftK(f) > 0.02;
    br.bus = makeMover(state, b0.x, Y(BUS.roof), BUS.w, 'uk-bus');
    br.halves = [makeMover(state, THAMES.a, GY, HALF, 'uk-bridge'), makeMover(state, THAMES.b - HALF, GY, HALF, 'uk-bridge')];
    if (up) for (const m of br.halves) moveMover(state, m, m.x, GY, true);
    spawnCast(state, ENEMIES, X, Y);
    // (a hooligan on the bus's top deck, wherever it is now)
    spawnCast(state, [['m2:fl_hooligan', b0.x - x0 + 150, 0]], X, () => Y(BUS.roof));
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `uk-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, f = state.frame, br = britOf(state);
    pavilionTalk(state, 'uk', x0, GY, TALK);
    updateTower(ctx);
    poolZones(state, 'uk-thames', [THAMES]);
    // The bus: along its route; its front runs over whoever's in the lane (not him up on its roof)
    const b = busAt(f), near = heard(state, b.x);
    if (br.bus) moveMover(state, br.bus, b.x, Y(BUS.roof));
    const cyc = (BUS.wait + BUS.run) * 2, t = f % cyc;
    if (near && (t === BUS.wait || t === BUS.wait * 2 + BUS.run)) playSound('truckhorn', 0.5, 0);
    if (near && b.dir < 0 && f % 20 === 0) playSound('beep', 0.35, 16);
    if (near && b.dir !== 0 && f % 30 === 0) playSound('engine', 0.3, -6);
    if (b.dir !== 0) {
      const fx = b.dir > 0 ? b.x + BUS.w : b.x, zx = fx - 30, zw = 60, zy = Y(BUS.roof) + 6;
      setHazardZones(state, 'uk-bus', [{ x0: b.x - 60, x1: b.x + BUS.w + 60, y0: Y(BUS.roof), y1: GY }]);
      if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && p.pos.x < zx + zw && p.pos.x + p.width > zx && p.pos.y + p.height > zy && p.pos.y < GY) {
        hurtPlayer(ctx, 14, 'm2:fl_bus', { x: b.dir * 14, y: -8 }, 30);
        playSound('slam', 0.9, -6);
      }
      for (const e of hazardVictims(state)) if (boxHits(e, zx, zy, zw, GY - zy)) hazardHit(ctx, e, 60, fx - b.dir * 20, 'RUN OVER!', { color: '#DC2626' });
    }
    // The bridge: the bell, then the halves lift (whoever's on them goes in the river), down again
    const k = liftK(f), bt = f % (B_DOWN + B_UP + B_MOVE * 2), nearB = Math.abs(p.pos.x - (THAMES.a + THAMES.b) / 2) < 900;
    if (nearB && (bt === B_DOWN - 50 || bt === B_DOWN - 30 || bt === B_DOWN - 10)) playSound('ding', 0.6, -8);
    for (const m of br.halves) moveMover(state, m, m.x, GY, k > 0.02);
    return controls;
  },
  waterBodyAt: (_state, x, y) => poolAt([THAMES], x, y),
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame, br = britOf(state);
    promenade(c, v, x0, THAMES.a, '#CBD5E1', '#64748B', [false, true]);
    promenade(c, v, THAMES.b, x1, '#CBD5E1', '#64748B', [true, false]);
    // (the Thames's back first (its far paving and railing are farther back than any front), then the fronts)
    drawPoolBack(c, v, THAMES);
    drawFronts(c, v);
    drawGate(c, v, X(60));
    for (const rx of [900, 1400, 3200]) if (onScreen(v, X(rx) - 20, X(rx) + 20, 0.97)) streetLamp(c, v, X(rx));
    for (const [a, b, h] of SENTRY) drawSentry(c, v, X(a), X(b), Y(h));
    for (const [a, b, h] of BOOTHS) drawBooth(c, v, X(a), X(b), Y(h));
    drawShelter(c, v, X(SHELTER.a), X(SHELTER.b), Y(SHELTER.h));
    if (br.bus) drawBus(c, v, br.bus.x, br.bus.y, f, busAt(f).dir);
    drawPub(c, v, X(PUB.a), X(PUB.b), Y(PUB.h));
    drawBarrels(c, v, X(BARRELS.a), X(BARRELS.b), Y(BARRELS.h));
    drawTeaCart(c, v, X(CART.a), X(CART.b), Y(CART.h), ['YE OLDE TEA', 'EST. 2009']);
    drawBridge(c, v, f);
    // (signs)
    if (onScreen(v, X(200), X(420))) postBoard(c, X(310), GY, ['UNITED KINGDOM', 'ENGLAND / BRITAIN / LONDON', '(SAME PLACE)'], LOOKS.uk(1), '#991B1B', undefined, 140);
    if (onScreen(v, X(SHELTER.a), X(SHELTER.b))) hungBoard(c, X(610), Y(SHELTER.h), Y(SHELTER.h) + 24, ['BUS STOP', 'MIND THE GAP'], LOOKS.uk(1), '#991B1B');
    if (onScreen(v, X(2360), X(2440))) postBoard(c, X(2400), GY, ['TOWER BRIDGE', '(LONDON BRIDGE)', '(SAME BRIDGE)'], LOOKS.uk(1), '#1E3A8A', undefined, 150);
    drawTowerBack(c, v, state);
    if (onScreen(v, X(-60), X(60))) drawJack(c, X(20), GY, 200, f);
  },
  drawFront: (c, state) => {
    const v = viewIn(state), f = state.frame;
    drawPoolFront(c, v, THAMES, f);
    drawFog(c, Math.max(x0, v.cam.x - 40), Math.min(x1, v.cam.x + CANVAS_WIDTH + 40), x0, x1, f);
    drawTowerFront(c, viewIn(state), state);
  },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    if (onScreen(v, X(PUB.a), X(PUB.b))) out.push({ x: X((PUB.a + PUB.b) / 2), y: Y(80), r: 180, a: 0.45, color: '#FDE68A' });
    for (const [a, b, h] of BOOTHS) if (onScreen(v, X(a), X(b))) out.push({ x: X((a + b) / 2), y: Y(h / 2), r: 80, a: 0.35, color: '#FEF3C7' });
    for (const rx of [900, 1400, 3200]) if (onScreen(v, X(rx), X(rx))) out.push({ x: X(rx), y: Y(170), r: 120, a: 0.35, color: '#FDE68A' });
    out.push(...towerLamps(v, state.frame));
    return out;
  },
};
