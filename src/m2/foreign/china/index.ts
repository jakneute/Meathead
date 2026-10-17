// CHINA: section 3 of Foreign Lands' streets (flows on from Norway, into Germany: no walls, no doors), and the land's
// big climb: THE GREAT WALL (1:40 scale, they say; it's huge anyway). The lantern market on the promenade first (a kung
// fu kid, the pyrotechnics intern lobbing rockets), then the GATE TOWER, climbed inside floor by floor (its door's at
// the bottom; its top is where the wall starts, 480 up). Along the rampart and up its stepped ramparts to WATCHTOWER 1
// (walk through it; its roof has the intern and a small ammo), steeply down into a dip and steeply up again to
// WATCHTOWER 2 (its far wall's shut: up inside it and out over the top), then THE DRAGON DANCE on the long flat (six
// kids under one cloth), up the last stairs to the PAGODA at the summit (its roofs climbed: a small health on top, the
// whole park below); then (ridge.ts, job 4b) on down into a saddle and up the SECOND RIDGE under the fireworks
// battery's shelling, THE BEACON TOWER (the highest point in the land), and down the wall's raw end by the repair
// scaffold (BUILT 1987), back to the promenade.
//
// The wall is the ground (runs: slopes drawn as stairs), so walkers get up and down it too. The SNES pass: art.ts
// paints it all (the layout here untouched). Checkpoints 20-29. Outdoors: the time of day's light.

import type { Light } from '../../../m1/game/render/lighting';
import type { GroundRun } from '../../../m1/game/core/terrain';
import type { EnemyKind } from '../../../m1/types';
import type { ForeignSection } from '../section';
import { layOwn, solid, ledge } from '../section';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { pavilionTalk } from '../pavilion';
import { type Ctx, type View, viewIn, at, promenade, postBoard, hungBoard, swag, flagPole, LOOKS, onScreen, FACADE_D } from '../kit';
import { drawWall, drawTower, drawPagoda, drawShop, drawPaifang, drawStalls, lanternPost, flagStars, LACQUER, type CnFront } from './art';
import { TALK } from './lines';
import { spawnDragon } from './kinds';
import { RIDGE_WALK, BEACON, BEACON_TOP, WALL_END, RIDGE_CHECKPOINTS, RIDGE_LANTERNS, buildRidge, updateRidge, drawRidgeBack, drawRidgeFront, drawScaffold, ridgeLamps } from './ridge';

const { x0, x1 } = SECTIONS.china;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from the section's start, heights up from the promenade). He jumps ~145 up, ~210 across.

/** The ground: the promenade, the wall's walk along the ridge (slopes are stairs), the promenade again. [a, h, b, h2, steps] */
const WALK: [number, number, number, number, number?][] = [
  [0, 0, 1250, 0],
  [1250, 480, 1650, 480], [1650, 480, 1950, 700, 11], [1950, 700, 2250, 700],
  [2250, 700, 2550, 440, 13], [2550, 440, 2700, 440], [2700, 440, 3000, 700, 13], [3000, 700, 3300, 700],
  [3300, 900, 4000, 900], [4000, 900, 4300, 1120, 11], [4300, 1120, 4620, 1120],
  ...RIDGE_WALK,
];
const RUNS: GroundRun[] = WALK.map(([a, h, b, h2, n]) => ({ x1: X(a), y1: Y(h), x2: X(b), y2: Y(h2), surface: 'hard', ...(n ? { steps: { n } } : {}) }));

/** The towers: their one-way floors inside [a, b, h], their solid walls [a, b, bottom h, top h]. */
const GATE = { a: 900, b: 1250, floors: [[940, 1100, 120], [1080, 1230, 240], [940, 1100, 360], [900, 1250, 480]], walls: [[900, 925, 130, 520]] } as const;
const TOWER1 = { a: 1980, b: 2220, base: 700, floors: [[2000, 2200, 830], [1980, 2220, 960]], walls: [] } as const;
const TOWER2 = { a: 3000, b: 3300, base: 700, floors: [[3020, 3180, 820], [3120, 3260, 940], [3000, 3300, 1040]], walls: [[3270, 3300, 700, 1000]] } as const;
/** The pagoda's roofs (one-way) at the summit. */
const PAGODA: [number, number, number][] = [[4330, 4590, 1250], [4370, 4550, 1370], [4410, 4510, 1480]];
/** The market's stalls (standable). */
const STALLS: [number, number, number][] = [[360, 520, 90], [560, 700, 120]];

const ENEMIES: [string, number, number][] = [
  ['m2:fl_kungfu', 760, 0], ['m2:fl_fireworks', 880, 0],
  ['m2:fl_kungfu', 1160, 240],
  ['m2:fl_kungfu', 1500, 480], ['m2:fl_fireworks', 2100, 960],
  ['m2:fl_kungfu', 2620, 440], ['m2:fl_kungfu', 3080, 820],
  ['m2:fl_fireworks', 4500, 1120], ['m2:fl_kungfu', 4450, 1250],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[2160, 960, 'small_ammo'], [4460, 1480, 'small_health']];

export const CHINA_CHECKPOINTS = [
  { name: 'CHINA', cp: 20, x: X(150), y: GY },
  { name: 'CHINA: THE GREAT WALL', cp: 21, x: X(1320), y: Y(480) },
  { name: 'CHINA: THE DRAGON DANCE', cp: 22, x: X(3340), y: Y(900) },
  { name: 'CHINA: THE PAGODA', cp: 23, x: X(4320), y: Y(1120) },
  ...RIDGE_CHECKPOINTS,
];

// ---------------------------------------------------------------------------------------------------------------
// Drawing (art.ts paints it all)

/** The market's fronts (set back, braced): lacquer, moon doors, glazed roofs, their boards. */
const SHOPS: CnFront[] = [
  { rx: 300, w: 260, h: 170, name: 'FORTUNE COOKIES', sub: '(FROM CALIFORNIA)' },
  { rx: 620, w: 240, h: 150, name: 'TEA HOUSE', sub: '(ICED. SWEET.)' },
];
/** The market (on the promenade): the fronts, the paifang and its board, the stalls and their goods, lanterns over. */
const drawMarket = (c: Ctx, v: View) => {
  const on = SHOPS.filter(fr => onScreen(v, X(fr.rx) - 60, X(fr.rx + fr.w) + 60, FACADE_D));
  on.sort((p, q) => Math.abs(X(q.rx + q.w / 2) - v.eye.x) - Math.abs(X(p.rx + p.w / 2) - v.eye.x));
  for (const fr of on) drawShop(c, v, X(fr.rx), fr);
  // (the paifang, set back a touch; its board hung off its lintel, in front of it)
  if (onScreen(v, X(-10), X(400), 0.96)) {
    drawPaifang(c, v, X(40));
    const [gx, gy] = at(v.eye, X(196), Y(228), 0.96);
    hungBoard(c, gx, gy, gy + 38, ['CHINA', 'A TASTE OF ASIA (JAPAN)'], LOOKS.china(2), LACQUER);
  }
  drawStalls(c, v, STALLS.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: '#7C2D12', standable: true, look: 'plank' as const })));
  if (onScreen(v, X(360), X(700))) { swag(c, X(340), Y(200), X(720), Y(200), 22, ['#DC2626'], 'lanterns', 34); }
};
/** The lanterns on posts along the wall (index.ts's lamps sit on them). */
const POSTS: [number, number][] = [[1300, 480], [2560, 440], [2680, 440], [3020, 700], [4320, 1120], [4600, 1120], ...RIDGE_LANTERNS];

export const china: ForeignSection = {
  id: 'china', x0, x1,
  checkpoints: CHINA_CHECKPOINTS,
  build: (state) => {
    layOwn(state, RUNS);
    for (const [a, b, h] of STALLS) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'cn-stall' });
    for (const T of [GATE, TOWER1, TOWER2]) {
      for (const [a, b, h] of T.floors) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'cn-floor' });
      for (const [a, b, lo, hi] of T.walls) solid(state, X(a), Y(hi), b - a, hi - lo, { hidden: true, tag: 'cn-towerwall' });
    }
    for (const [a, b, h] of PAGODA) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'cn-pagoda' });
    spawnCast(state, ENEMIES, X, Y);
    spawnDragon(state, (x, y) => makeKindEnemy('m2:fl_dragon' as EnemyKind, x, y), X(3640), Y(900));
    // (the B team: four kids under a cloth for six, in the saddle past the pagoda)
    spawnDragon(state, (x, y) => makeKindEnemy('m2:fl_dragon' as EnemyKind, x, y), X(5060), Y(860), 4);
    buildRidge(state);
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `cn-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => { pavilionTalk(ctx.state, 'cn', x0, GY, TALK); updateRidge(ctx); return controls; },
  drawFront: (c, state) => drawRidgeFront(c, viewIn(state), state),
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame;
    promenade(c, v, x0, X(1250), '#D6CBB4', '#8C7F68');
    promenade(c, v, X(WALL_END), x1, '#D6CBB4', '#8C7F68');
    drawMarket(c, v);
    // (the gate tower: climbed inside, its door at the bottom)
    drawTower(c, v, GATE, 480, X, Y);
    if (onScreen(v, X(860), X(940))) postBoard(c, X(800), GY, ['THE GREAT WALL', 'BUILT TO KEEP OUT', 'THE MONGOOSE'], LOOKS.china(1), LACQUER, undefined, 120);
    drawWall(c, v, RUNS);
    drawTower(c, v, TOWER1, 960, X, Y);
    drawTower(c, v, TOWER2, 1040, X, Y);
    drawTower(c, v, BEACON, BEACON_TOP, X, Y);
    drawPagoda(c, v, X, Y, PAGODA, 1120, [4460, 1480]);
    drawScaffold(c, v);
    drawRidgeBack(c, v, state);
    // (lanterns strung along the dragon's stretch, and on posts up the summit stairs)
    for (let rx = 3300; rx < 4000; rx += 175) if (onScreen(v, X(rx), X(rx + 175))) swag(c, X(rx), Y(1030), X(rx + 175), Y(1030), 20, ['#DC2626'], 'lanterns', 35);
    for (const [rx, h] of POSTS) if (onScreen(v, X(rx) - 10, X(rx) + 10)) lanternPost(c, X(rx), Y(h));
    // (signs: held up, never anything over them)
    if (onScreen(v, X(1960), X(2240))) hungBoard(c, X(2100), Y(960) + 4, Y(960) + 40, ['WATCHTOWER', 'NO WATCHING'], LOOKS.china(1), LACQUER);
    if (onScreen(v, X(3320), X(3480))) postBoard(c, X(3400), Y(900), ['DRAGON DANCE', 'TODAY: ALL DAY'], LOOKS.china(1), LACQUER, undefined, 100);
    if (onScreen(v, X(4040), X(4200))) postBoard(c, X(4120), Y(1010), ['SUMMIT', 'GIFT SHOP CLOSED'], LOOKS.china(1), LACQUER, undefined, 90);
    if (onScreen(v, X(20), X(120))) { flagPole(c, X(30), GY, 200, ['#DE2910', '#DE2910', '#DE2910'], f); flagStars(c, X(30), GY, 200, f); }
  },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    for (const [rx, h] of [[1300, 480], [2560, 440], [2680, 440], [3020, 700], [4320, 1120], [4600, 1120], [3400, 960], [3750, 960]] as const) if (onScreen(v, X(rx), X(rx))) out.push({ x: X(rx), y: Y(h) - 74, r: 120, a: 0.45, color: '#FCA5A5' });
    out.push(...ridgeLamps(v));
    return out;
  },
};
