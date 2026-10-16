// CHINA: section 3 of Foreign Lands' streets (flows on from Norway, into Germany: no walls, no doors), and the land's
// big climb: THE GREAT WALL (1:40 scale, they say; it's huge anyway). The lantern market on the promenade first (a kung
// fu kid, the pyrotechnics intern lobbing rockets), then the GATE TOWER, climbed inside floor by floor (its door's at
// the bottom; its top is where the wall starts, 480 up). Along the rampart and up its stepped ramparts to WATCHTOWER 1
// (walk through it; its roof has the intern and a small ammo), steeply down into a dip and steeply up again to
// WATCHTOWER 2 (its far wall's shut: up inside it and out over the top), then THE DRAGON DANCE on the long flat (six
// kids under one cloth), up the last stairs to the PAGODA at the summit (its roofs climbed: a small health on top, the
// whole park below), and down the far end of the wall by the repair scaffold (BUILT 1987), back to the promenade.
//
// The wall is the ground (runs: slopes drawn as stairs), so walkers get up and down it too. Crude (the first pass):
// readable boxes with full game feel. Checkpoints 20-29. Outdoors: the time of day's light.

import type { Light } from '../../../m1/game/render/lighting';
import type { GroundRun } from '../../../m1/game/core/terrain';
import type { EnemyKind } from '../../../m1/types';
import type { ForeignSection } from '../section';
import { layOwn, solid, ledge } from '../section';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { pavilionTalk } from '../pavilion';
import {
  type Ctx, type View, viewIn, box, mix, poly, at, promenade, boxes3, ledge3, setBack, wall, hole, postBoard, hungBoard, swag, lantern, flagPole,
  LOOKS, dimmed, hour, ramp6, onScreen, FACADE_D, INK, LIP, timeOfDay,
} from '../kit';
import { TALK } from './lines';
import { spawnDragon } from './kinds';

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
  [4620, 0, 5200, 0],
];
const RUNS: GroundRun[] = WALK.map(([a, h, b, h2, n]) => ({ x1: X(a), y1: Y(h), x2: X(b), y2: Y(h2), surface: 'hard', ...(n ? { steps: { n } } : {}) }));

/** The towers: their one-way floors inside [a, b, h], their solid walls [a, b, bottom h, top h]. */
const GATE = { a: 900, b: 1250, floors: [[940, 1100, 120], [1080, 1230, 240], [940, 1100, 360], [900, 1250, 480]], walls: [[900, 925, 130, 520]] } as const;
const TOWER1 = { a: 1980, b: 2220, base: 700, floors: [[2000, 2200, 830], [1980, 2220, 960]], walls: [] } as const;
const TOWER2 = { a: 3000, b: 3300, base: 700, floors: [[3020, 3180, 820], [3120, 3260, 940], [3000, 3300, 1040]], walls: [[3270, 3300, 700, 1000]] } as const;
/** The pagoda's roofs (one-way) at the summit. */
const PAGODA: [number, number, number][] = [[4330, 4590, 1250], [4370, 4550, 1370], [4410, 4510, 1480]];
/** The repair scaffold down the wall's end (one-way, zigzag). */
const SCAFFOLD: [number, number, number][] = [[4630, 4880, 980], [4900, 5150, 840], [4630, 4880, 700], [4900, 5150, 560], [4630, 4880, 420], [4900, 5150, 280], [4630, 4880, 140]];
/** The market's stalls (standable). */
const STALLS: [number, number, number][] = [[360, 520, 90], [560, 700, 120]];

const ENEMIES: [string, number, number][] = [
  ['m2:fl_kungfu', 760, 0], ['m2:fl_fireworks', 880, 0],
  ['m2:fl_kungfu', 1160, 240],
  ['m2:fl_kungfu', 1500, 480], ['m2:fl_fireworks', 2100, 960],
  ['m2:fl_kungfu', 2620, 440], ['m2:fl_kungfu', 3080, 820],
  ['m2:fl_fireworks', 4500, 1120], ['m2:fl_kungfu', 4450, 1250],
  ['m2:fl_kungfu', 5000, 0], ['m2:fl_fireworks', 5120, 0],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[2160, 960, 'small_ammo'], [4460, 1480, 'small_health']];

export const CHINA_CHECKPOINTS = [
  { name: 'CHINA', cp: 20, x: X(150), y: GY },
  { name: 'CHINA: THE GREAT WALL', cp: 21, x: X(1320), y: Y(480) },
  { name: 'CHINA: THE DRAGON DANCE', cp: 22, x: X(3340), y: Y(900) },
  { name: 'CHINA: THE PAGODA', cp: 23, x: X(4320), y: Y(1120) },
];

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const STONE = '#A8A08C', BRICK = '#8C8270', ROCK = '#5B6B3E', LACQUER = '#B91C1C';

/** The wall: its walk (the top going back, the far parapet's battlements set back: not somewhere to stand), its face
 *  in courses down to the mountain, stairs drawn as treads, every tread's lit lip. */
const drawWall = (c: Ctx, v: View) => {
  const S = ramp6(hour(STONE)), B = ramp6(hour(BRICK)), M = ramp6(hour(ROCK));
  for (const r of RUNS) {
    if (r.y1 === GY && r.y2 === GY) continue;
    if (!onScreen(v, r.x1, r.x2)) continue;
    // (the mountain under it, then the wall's face in courses)
    poly(c, [[r.x1, r.y1 + 150], [r.x2, r.y2 + 150], [r.x2, GY + 400], [r.x1, GY + 400]], M[2]);
    for (let k = 0; k < 6; k++) box(c, r.x1 + ((k * 97) % Math.max(1, r.x2 - r.x1)), Math.max(r.y1, r.y2) + 190 + k * 40, 30, 6, M[1]);
    poly(c, [[r.x1, r.y1], [r.x2, r.y2], [r.x2, r.y2 + 150], [r.x1, r.y1 + 150]], B[2]);
    for (let k = 14; k < 150; k += 14) { c.strokeStyle = B[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(r.x1, r.y1 + k); c.lineTo(r.x2, r.y2 + k); c.stroke(); }
    box(c, r.x1, Math.min(r.y1, r.y2) + 150, r.x2 - r.x1, 3, M[3]);
    // (the walk going back, and the far parapet: battlements, dimmed)
    const n = r.steps?.n ?? 1;
    for (let i = 0; i < n; i++) {
      const a = r.x1 + ((r.x2 - r.x1) * i) / n, b = r.x1 + ((r.x2 - r.x1) * (i + 1)) / n;
      const y = n === 1 ? r.y1 : r.y1 + ((r.y2 < r.y1 ? i + 1 : i) / n) * (r.y2 - r.y1);
      poly(c, [at(v.eye, a, y, 1), at(v.eye, b, y, 1), at(v.eye, b, y, 0.9), at(v.eye, a, y, 0.9)], S[4]);
      const [pa, py] = at(v.eye, a, y, 0.9), [pb] = at(v.eye, b, y, 0.9);
      box(c, pa, py - 26, pb - pa, 26, dimmed(STONE));
      for (let x = pa; x < pb - 6; x += 22) box(c, x, py - 36, 12, 10, dimmed(STONE));
      // (the tread's riser and its lit lip: somewhere to stand)
      if (n > 1) box(c, a, y, b - a, Math.abs(r.y2 - r.y1) / n + 2, S[2]);
      box(c, a, y, b - a, 3, LIP[2]); box(c, a, y, b - a, 1, LIP[3]);
    }
  }
};

/** A tower climbed inside (cut away: its back wall, its floors, its solid walls), its roof's battlements. */
const drawTower = (c: Ctx, v: View, T: { a: number; b: number; base?: number; floors: readonly (readonly number[])[]; walls: readonly (readonly number[])[] }, top: number) => {
  if (!onScreen(v, X(T.a), X(T.b))) return;
  const base = T.base ?? 0;
  // (the back wall inside, set back, dim, an arrow slit or two)
  const [ax, ay] = at(v.eye, X(T.a), Y(top), 0.94), [bx, by] = at(v.eye, X(T.b), Y(base), 0.94);
  box(c, ax, ay, bx - ax, by - ay, dimmed('#6B6455'));
  for (let y = ay + 20; y < by; y += 20) box(c, ax, y, bx - ax, 1, dimmed('#4A4538'));
  for (let k = 0; k < 3; k++) box(c, ax + (bx - ax) * (0.3 + k * 0.2), ay + 40 + k * 90, 6, 24, '#1C1014');
  // (the tower's corners: stopping short over its doorways, each side, so the way through reads open; a lintel)
  const P = ramp6(hour(BRICK)), door = base + 110;
  box(c, X(T.a) - 8, Y(top) - 20, 8, top - door + 20, P[2]); box(c, X(T.b), Y(top) - 20, 8, top - door + 20, P[1]);
  box(c, X(T.a) - 10, Y(door), 22, 6, P[3]); box(c, X(T.b) - 12, Y(door), 22, 6, P[3]);
  for (const [a, b, h] of T.floors) ledge3(c, v, X(a), Y(h), b - a, '#7C6A4E', h === top ? 16 : 10);
  for (const [a, b, lo, hi] of T.walls) boxes3(c, v, [{ x: X(a), top: Y(hi), w: b - a, bottom: Y(lo), col: BRICK, standable: true }]);
  // (the roof's battlements, behind its floor)
  for (let x = X(T.a); x < X(T.b) - 8; x += 26) { const [px, py] = at(v.eye, x, Y(top), 0.93); box(c, px, py - 22, 14, 22, dimmed(STONE)); }
};

/** The pagoda at the summit: red lacquer posts, its sweeping roofs (what he climbs: their ridges lit), a gold finial. */
const drawPagoda = (c: Ctx, v: View) => {
  if (!onScreen(v, X(4300), X(4620))) return;
  const R = ramp6(hour(LACQUER)), T = ramp6(hour('#14532D'));
  setBack(c, v, X(4360), 200, 0.96, () => { wall(c, 0, 200, 130, '#7F1D1D'); hole(c, 76, -90, 48, 90, true); });
  let lastH = 1120;
  for (const [a, b, h] of PAGODA) {
    // (the posts up to this roof)
    for (const px0 of [X(a) + 26, X(b) - 32]) { box(c, px0, Y(h), 6, h - lastH, INK); box(c, px0 + 1, Y(h), 4, h - lastH, R[3]); }
    // (the roof: green tiles sweeping out and up at the ends)
    poly(c, [[X(a), Y(h)], [X(b), Y(h)], [X(b) + 30, Y(h) + 26], [X(b) + 40, Y(h) + 14], [X(b) + 22, Y(h) + 34], [X(a) - 22, Y(h) + 34], [X(a) - 40, Y(h) + 14], [X(a) - 30, Y(h) + 26]], T[2]);
    for (let x = X(a) - 20; x < X(b) + 20; x += 8) box(c, x, Y(h) + 8, 2, 22, T[1]);
    ledge3(c, v, X(a), Y(h), b - a, '#166534', 8);
    lastH = h;
  }
  box(c, X(4458), Y(1480) - 40, 4, 40, '#CA8A04'); c.fillStyle = '#FCD34D'; c.beginPath(); c.arc(X(4460), Y(1480) - 44, 6, 0, Math.PI * 2); c.fill();
};

/** The repair scaffold down the wall's end: poles, planks (the planks are what he stands on). */
const drawScaffold = (c: Ctx, v: View) => {
  if (!onScreen(v, X(4600), X(5180))) return;
  const P = ramp6(hour('#9CA3AF'));
  for (const sx of [4632, 4876, 4902, 5146]) { box(c, X(sx) - 1, Y(1000), 5, 1000, INK); box(c, X(sx), Y(1000), 3, 1000, P[3]); }
  for (let h = 70; h < 1000; h += 140) { c.strokeStyle = P[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(X(4634), Y(h)); c.lineTo(X(4878), Y(h + 140)); c.moveTo(X(4904), Y(h + 140)); c.lineTo(X(5148), Y(h)); c.stroke(); }
  for (const [a, b, h] of SCAFFOLD) ledge3(c, v, X(a), Y(h), b - a, '#A16207', 8);
  // (the wall's end face, cut off raw: the bricks just stop)
  const B = ramp6(hour(BRICK));
  box(c, X(4600), Y(1120), 20, 1120, B[1]); for (let y = Y(1120); y < GY; y += 14) box(c, X(4600) + ((y / 14) % 2) * 6, y, 8, 7, B[2]);
};

/** The market (on the promenade): stucco-red fronts with green tile eaves, a paifang arch, the stalls. */
const drawMarket = (c: Ctx, v: View, f: number) => {
  for (const [rx, w, h] of [[300, 260, 170], [620, 240, 150]] as const) setBack(c, v, X(rx), w, FACADE_D, () => {
    wall(c, 0, w, h, '#991B1B');
    poly(c, [[-16, -h], [w + 16, -h], [w + 26, -h - 12], [w / 2, -h - 40], [-26, -h - 12]], dimmed('#166534'));
    hole(c, w / 2 - 20, -76, 40, 76, true); for (const wx of [20, w - 50]) hole(c, wx, -h + 34, 30, 30, true);
  });
  // (the paifang: two red posts, a green tiled top, the sign hung under it)
  if (onScreen(v, X(60), X(330))) {
    const R = ramp6(hour(LACQUER));
    for (const px0 of [X(70), X(310)]) { box(c, px0 - 1, Y(240), 16, 240, INK); box(c, px0, Y(240), 14, 240, R[3]); box(c, px0, Y(240), 3, 240, R[4]); }
    poly(c, [[X(40), Y(240)], [X(354), Y(240)], [X(370), Y(262)], [X(196), Y(290)], [X(24), Y(262)]], hour('#166534'));
    hungBoard(c, X(196), Y(236), Y(190), ['CHINA', 'A TASTE OF ASIA (JAPAN)'], LOOKS.china(2), LACQUER);
  }
  boxes3(c, v, STALLS.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: '#7C2D12', standable: true })));
  for (const [a, b, h] of STALLS) if (onScreen(v, X(a), X(b))) { for (let k = 0; k < 4; k++) box(c, X(a) + 10 + k * 36, Y(h) + 16, 24, 20, dimmed(['#DC2626', '#FCD34D', '#16A34A', '#F59E0B'][k])); }
  if (onScreen(v, X(360), X(700))) { swag(c, X(340), Y(200), X(720), Y(200), 22, ['#DC2626'], 'lanterns', 34); }
  void f;
};

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
    for (const [a, b, h] of SCAFFOLD) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'cn-scaffold' });
    spawnCast(state, ENEMIES, X, Y);
    spawnDragon(state, (x, y) => makeKindEnemy('m2:fl_dragon' as EnemyKind, x, y), X(3640), Y(900));
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `cn-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => { pavilionTalk(ctx.state, 'cn', x0, GY, TALK); return controls; },
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame;
    promenade(c, v, x0, X(1250), '#D6CBB4', '#8C7F68');
    promenade(c, v, X(4620), x1, '#D6CBB4', '#8C7F68');
    drawMarket(c, v, f);
    // (the gate tower's front: the solid bulk either side of where he goes in, its door)
    drawTower(c, v, GATE, 480);
    if (onScreen(v, X(860), X(940))) postBoard(c, X(800), GY, ['THE GREAT WALL', 'BUILT TO KEEP OUT', 'THE MONGOOSE'], LOOKS.china(1), LACQUER, undefined, 120);
    drawWall(c, v);
    drawTower(c, v, TOWER1, 960);
    drawTower(c, v, TOWER2, 1040);
    drawPagoda(c, v);
    drawScaffold(c, v);
    // (lanterns strung along the dragon's stretch, and up the summit stairs)
    for (let rx = 3300; rx < 4000; rx += 175) if (onScreen(v, X(rx), X(rx + 175))) swag(c, X(rx), Y(1030), X(rx + 175), Y(1030), 20, ['#DC2626'], 'lanterns', 35);
    for (const [rx, h] of [[1300, 480], [2560, 440], [2680, 440], [3020, 700], [4320, 1120], [4600, 1120]] as const) if (onScreen(v, X(rx) - 10, X(rx) + 10)) { box(c, X(rx) - 1, Y(h) - 70, 3, 70, INK); lantern(c, X(rx), Y(h) - 74, 8); }
    // (signs: held up, never anything over them)
    if (onScreen(v, X(1960), X(2240))) hungBoard(c, X(2100), Y(960) + 4, Y(960) + 40, ['WATCHTOWER', 'NO WATCHING'], LOOKS.china(1), LACQUER);
    if (onScreen(v, X(3320), X(3480))) postBoard(c, X(3400), Y(900), ['DRAGON DANCE', 'TODAY: ALL DAY'], LOOKS.china(1), LACQUER, undefined, 100);
    if (onScreen(v, X(4040), X(4200))) postBoard(c, X(4120), Y(1010), ['SUMMIT', 'GIFT SHOP CLOSED'], LOOKS.china(1), LACQUER, undefined, 90);
    if (onScreen(v, X(4900), X(5200))) postBoard(c, X(5040), GY, ['LEAVING CHINA', 'NEXT: GERMANY (EUROPE)'], LOOKS.china(1), LACQUER, undefined, 100);
    if (onScreen(v, X(4640), X(4880))) hungBoard(c, X(4760), Y(1120) + 10, Y(1120) + 60, ['UNDER REPAIR', 'SINCE 1987'], LOOKS.china(1), '#1C1917');
    if (onScreen(v, X(20), X(120))) flagPole(c, X(30), GY, 200, ['#DE2910', '#DE2910', '#DE2910'], f);
    void mix; void wall; void hole; void timeOfDay;
  },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    for (const [rx, h] of [[1300, 480], [2560, 440], [2680, 440], [3020, 700], [4320, 1120], [4600, 1120], [3400, 960], [3750, 960]] as const) if (onScreen(v, X(rx), X(rx))) out.push({ x: X(rx), y: Y(h) - 74, r: 120, a: 0.45, color: '#FCA5A5' });
    return out;
  },
};
