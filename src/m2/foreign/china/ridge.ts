// CHINA's far end (job 4b: the pavilions lengthened, the Great Wall's stretch made even bigger): past the summit
// pagoda the wall doesn't stop. Down steep stairs into a saddle (THE B-TEAM DRAGON: four kids under a cloth meant for
// six), then up the SECOND RIDGE, the steepest stairs on the wall, under fire: the park's FIREWORKS BATTERY up on the
// ridge's flat lobs a volley of mortar shells down the wall on a timer (the marks on the stone and the hiss first: the
// tell; each burst hurts whoever's in it, him (`m2:fl_mortar`) and the cast) for as long as its intern's alive to
// light it. Then THE BEACON TOWER, the highest point in the land (1700 up), climbed inside floor by floor (its far wall
// shut: out over its roof), the ridge's last flat, and the wall's raw end: the REPAIR SCAFFOLD all the way down
// (zigzag planks; they climb back up), the promenade, the border with Germany.

import type { Light } from '../../../m1/game/render/lighting';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast, byPants } from '../cast';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { streetsOf } from '../state';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, type Shout } from '../setpiece';
import { type Ctx, type View, boxes3, postBoard, hungBoard, LOOKS, onScreen, rnd } from '../kit';
import { batteryTubes, batterySmoke, shellMark, shell, drawScaffoldArt, drawRawEnd } from './art';
import { V, BATTERY } from './lines';

const { x0 } = SECTIONS.china;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from China's start, heights up from the promenade). He jumps ~145 up, ~210 across.

/** The wall's walk on from the pagoda (index.ts's WALK takes these): [a, h, b, h2, steps]. */
export const RIDGE_WALK: [number, number, number, number, number?][] = [
  [4620, 1120, 4900, 860, 10], [4900, 860, 5250, 860],
  [5250, 860, 5650, 1260, 14], [5650, 1260, 6500, 1260],
  [6500, 0, 7600, 0],
];
/** The beacon tower (climbed inside: index.ts draws it with the others). */
export const BEACON = { a: 6000, b: 6260, base: 1260, floors: [[6020, 6160, 1380], [6120, 6240, 1500], [6020, 6160, 1610], [6000, 6260, 1720]], walls: [[6230, 6260, 1260, 1680]] } as const;
export const BEACON_TOP = 1720;
/** The repair scaffold down the wall's raw end (one-way, zigzag). */
export const SCAFFOLD: [number, number, number][] = [
  [6510, 6760, 1120], [6780, 7030, 980], [6510, 6760, 840], [6780, 7030, 700], [6510, 6760, 560], [6780, 7030, 420], [6510, 6760, 280], [6780, 7030, 140],
];
export const WALL_END = 6500;
/** The battery: its rack (solid, on the ridge's flat), its volleys. */
const RACK = { a: 5820, b: 5920, h: 1310 } as const;
const EVERY = 280, WARN = 70, FLY = 50, BURST = 16, R = 70;
/** Each volley's three marks (rx along the wall), cycling; the middle one goes where he's stood, if he's in range. */
const TARGETS: [number, number, number][] = [[4960, 5130, 5330], [5040, 5220, 5450], [5110, 5300, 5560], [4990, 5390, 5610]];

const ENEMIES: [string, number, number][] = [
  // the dip, under the battery's shells, with the dragon (the shells get the cast too: lure them under the marks)
  ['m2:fl_kungfu', 5200, 860],
  ['m2:fl_kungfu', 5480, 1090],
  // up the beacon tower, floor by floor (the BEACON TOWER checkpoint's flat left clear)
  ['m2:fl_kungfu', 6100, 1380], ['m2:fl_kungfu', 6190, 1500], ['m2:fl_fireworks', 6140, BEACON_TOP],
  ['m2:fl_kungfu', 6380, 1260], ['m2:fl_fireworks', 6440, 1260],
  // down the repair scaffold: the intern on a low-middle lift (rockets up at him coming down), a kung fu kid on the
  // one under the top (the kick across the gap at him on the zigzag); one more at the bottom, past THE SCAFFOLD's
  // checkpoint's reach
  ['m2:fl_fireworks', 6620, 560], ['m2:fl_kungfu', 6900, 700], ['m2:fl_kungfu', 7450, 0],
];
const OPERATOR: [string, number, number][] = [['m2:fl_fireworks', 5760, 1260]];

export const RIDGE_CHECKPOINTS = [
  // (up on the pagoda's flat, looking down on the ridge: down in the dip it sat on the second dragon)
  { name: 'CHINA: THE SECOND RIDGE', cp: 24, x: X(4600), y: Y(1120) },
  { name: 'CHINA: THE BEACON TOWER', cp: 25, x: X(5700), y: Y(1260) },
  { name: 'CHINA: THE SCAFFOLD', cp: 26, x: X(7080), y: GY },
];

/** The wall's height at rx (its walk; stairs as a slope: near enough for where a shell lands). */
const wallAt = (rx: number) => {
  for (const [a, h, b, h2] of RIDGE_WALK) if (rx >= a && rx <= b) return h + ((rx - a) / (b - a)) * (h2 - h);
  return 0;
};

// ---------------------------------------------------------------------------------------------------------------
// The battery

interface Ridge { said: Shout; op: Enemy | null; marks: number[]; n: number; hit: Set<object> }
const ridgeOf = (state: GameState) => foreignState<Ridge>(state, 'china-ridge' as 'china', () => ({ said: newShout(), op: null, marks: [], n: -1, hit: new Set() }));
const firing = (r: Ridge) => !!r.op && r.op.health > 0 && !r.op.isBlownAway;

export const buildRidge = (state: GameState) => {
  const r = ridgeOf(state);
  solid(state, X(RACK.a), Y(RACK.h), RACK.b - RACK.a, RACK.h - 1260, { hidden: true, tag: 'cn-battery' });
  for (const [a, b, h] of BEACON.floors) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'cn-floor' });
  for (const [a, b, lo, hi] of BEACON.walls) solid(state, X(a), Y(hi), b - a, hi - lo, { hidden: true, tag: 'cn-towerwall' });
  for (const [a, b, h] of SCAFFOLD) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'cn-scaffold' });
  const n = state.enemies.length;
  spawnCast(state, OPERATOR, X, Y);
  r.op = state.enemies[n] ?? null;
  spawnCast(state, ENEMIES, X, Y);
  placePickups(state, 'cn', X, Y, [[6130, BEACON_TOP, 'small_health'], [4920, 860, 'small_ammo']]);
};

export const updateRidge = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, f = state.frame, r = ridgeOf(state);
  const t = f % EVERY, n = Math.floor(f / EVERY);
  const prx = p.pos.x + p.width / 2 - x0;
  const near = prx > 4500 && prx < 6300;
  if (n !== r.n) {
    r.n = n; r.hit.clear();
    r.marks = [];
    if (firing(r) && near) {
      const tg = [...TARGETS[n % TARGETS.length]];
      if (prx > 4920 && prx < 5640) tg[1] = Math.round(prx);
      r.marks = tg;
      playSound('whoosh', 0.4, -16);
      shout(state, r.said, V.fireworks.m, byPants(state, BATTERY), X((RACK.a + RACK.b) / 2), Y(RACK.h) - 30, 0.35);
    }
  }
  if (!r.marks.length) return;
  if (t === WARN) { playSound('boom', 0.5, 10); shakeScreen(state, 2, 2); }
  if (t >= WARN + FLY && t < WARN + FLY + BURST) {
    if (t === WARN + FLY) { playSound('boom', 0.8, -2); shakeScreen(state, 4, 4); for (const m of r.marks) streetsOf(state).bursts.push({ x: X(m), y: Y(wallAt(m)) - 30, at: f, r: R, col: ['#F87171', '#FDE047', '#60A5FA'][n % 3] }); }
    for (const m of r.marks) {
      const bx = X(m) - R, by = Y(wallAt(m)) - 110;
      if (!r.hit.has(p) && hurtIn(ctx, bx, by, R * 2, 120, 11, 'm2:fl_mortar', { x: Math.sign(p.pos.x + p.width / 2 - X(m)) * 8 || 8, y: -8 }, 24)) r.hit.add(p);
      hitCastIn(ctx, bx, by, R * 2, 120, 40, X(m), 'SHELLED!', '#FDE047', r.hit);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The battery: its timber rack (standable), the cardboard mortars on it, the fuse lit while a volley's coming, smoke
 *  out of the tubes after one; where they'll land marked on the stone; the signs. */
export const drawRidgeBack = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame, r = ridgeOf(state), t = f % EVERY;
  if (onScreen(v, X(RACK.a), X(RACK.b))) {
    boxes3(c, v, [{ x: X(RACK.a), top: Y(RACK.h), w: RACK.b - RACK.a, bottom: Y(1260), col: '#7F1D1D', standable: true, look: 'plank' }]);
    batteryTubes(c, X(RACK.a), Y(RACK.h), !!r.marks.length && t < WARN, f);
    if (r.marks.length && t > WARN && t < WARN + 40) for (let k = 0; k < 6; k++) batterySmoke(c, X(RACK.a) + 25 + rnd(k + t) * 60, Y(RACK.h) - 36 - (t - WARN) * 2 - k * 6, 5 + k * 0.6 + (t - WARN) * 0.08);
    postBoard(c, X(RACK.a - 80), Y(1260), ['FIREWORKS', 'SHOW: HOURLY', '(EVERY 5 SEC)'], LOOKS.china(1), '#7F1D1D', undefined, 110);
  }
  // (the marks on the stone: where they'll land)
  if (r.marks.length && t < WARN + FLY) for (const m of r.marks) {
    const mx = X(m), my = Y(wallAt(m));
    if (onScreen(v, mx - R, mx + R)) shellMark(c, mx, my, R, f);
  }
  // (the signs)
  if (onScreen(v, X(4910), X(5070))) postBoard(c, X(4990), Y(860), ['THE SECOND RIDGE', '(THE FIRST ONE', 'WAS PRACTICE)'], LOOKS.china(1), '#991B1B', undefined, 110);
  if (onScreen(v, X(BEACON.a), X(BEACON.b))) hungBoard(c, X((BEACON.a + BEACON.b) / 2), Y(BEACON_TOP) + 4, Y(BEACON_TOP) + 40, ['BEACON TOWER', 'HIGHEST POINT IN OHIO'], LOOKS.china(1), '#991B1B');
  if (onScreen(v, X(7300), X(7600))) postBoard(c, X(7440), GY, ['LEAVING CHINA', 'NEXT: GERMANY (EUROPE)'], LOOKS.china(1), '#991B1B', undefined, 100);
  if (onScreen(v, X(6510), X(6760))) hungBoard(c, X(6640), Y(1260) + 10, Y(1260) + 60, ['UNDER REPAIR', 'SINCE 1987'], LOOKS.china(1), '#1C1917');
};

/** The shells in the air (from the rack to their marks), drawn over everything. */
export const drawRidgeFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame, r = ridgeOf(state), t = f % EVERY;
  if (r.marks.length && t >= WARN && t < WARN + FLY && onScreen(v, X(4800), X(6000))) {
    const u = (t - WARN) / FLY, sx = X((RACK.a + RACK.b) / 2), sy = Y(RACK.h) - 30;
    for (const m of r.marks) {
      const tx = X(m), ty = Y(wallAt(m)) - 10;
      const x = sx + (tx - sx) * u, y = sy + (ty - sy) * u - Math.sin(u * Math.PI) * 360;
      shell(c, x, y, f);
    }
  }
  drawShout(c, r.said);
};

/** The scaffold (poles, couplers, braces, the planks he stands on) and the wall's raw end, cut off. */
export const drawScaffold = (c: Ctx, v: View) => {
  if (!onScreen(v, X(WALL_END - 40), X(7060))) return;
  drawRawEnd(c, X(WALL_END - 30), 30, Y(1260));
  drawScaffoldArt(c, v, X, Y, SCAFFOLD, [6512, 6756, 6782, 7026], 1260, [6514, 6758, 6784, 7028]);
};

export const ridgeLamps = (v: View): Light[] => {
  const out: Light[] = [];
  for (const [rx, h] of [[4912, 860], [5238, 860], [5660, 1260], [6300, 1260], [6480, 1260]] as const) if (onScreen(v, X(rx), X(rx))) out.push({ x: X(rx), y: Y(h) - 74, r: 120, a: 0.45, color: '#FCA5A5' });
  return out;
};
/** Where the lanterns on posts go along the new stretch (index.ts draws them with the others). */
export const RIDGE_LANTERNS: [number, number][] = [[4912, 860], [5238, 860], [5660, 1260], [6300, 1260], [6480, 1260]];
