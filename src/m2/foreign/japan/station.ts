// JAPAN's far end (job 4b: the pavilions lengthened): THE BULLET TRAIN. Past the sumo ring and the manga stand, the
// line runs through two fiberglass Mt. Fuji hills (climbed up and over: stepped, snow-capped), and between them the
// track lies across the whole station floor. The HAPPY LAND SHINKANSEN (it never stops here) comes out of the left
// tunnel and through to the right one every several seconds: the crossing bells, the lights and the tunnel's shutter
// rolling up first (the tell); on the track as it goes through, he's hit hard and thrown (`m2:fl_bullet_train`); the
// cast on the track die (they wait for it; knocked on, that's that). Out of its way: the signal gantries at each end
// and the platform walkway in the middle (all higher than the train's roof), the station roof over the walkway, the
// departure board over that (a small ammo). Ninjas blink onto the walkways with him, a sumo stomps him off them. Over
// the right-hand Fuji and on to Morocco.

import type { Light } from '../../../m1/game/render/lighting';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast, byPants } from '../cast';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { setHazardZones } from '../../hazardHit';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, type Shout } from '../setpiece';
import { type Ctx, type View, box, poly, boxes3, ledge3, postBoard, hungBoard, LOOKS, dimmed, hour, ramp6, onScreen, INK, rnd } from '../kit';
import { V, STATION } from './lines';

const { x0, x1 } = SECTIONS.japan;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

/** Where the old Japan ended: this starts there. */
export const STATION_FROM = 3600;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from Japan's start, heights up from the promenade). He jumps ~145 up, ~210 across.

/** The two Fujis (solid steps: [a, b, h]) and the track between them. */
const FUJI_L: [number, number, number][] = [[3700, 3800, 120], [3800, 3880, 240], [3880, 3960, 340]];
const FUJI_R: [number, number, number][] = [[4960, 5040, 340], [5040, 5120, 240], [5120, 5200, 120]];
const LANE = { a: 3960, b: 4960 } as const;
/** Out of the train's way (one-way, higher than its roof): the gantries, the walkway, the station roof, the board. */
const REFUGES: [number, number, number][] = [[4040, 4140, 140], [4300, 4620, 140], [4800, 4900, 140], [4360, 4560, 280], [4420, 4500, 410]];
/** The train: its roof, its length, its speed; one every EVERY frames, WARN of bells first. */
const TRAIN = { h: 110, len: 1500, v: 30 } as const;
const EVERY = 430, WARN = 105;

const ENEMIES: [string, number, number][] = [
  ['m2:fl_ninja', 3640, 0], ['m2:fl_cosplay', 3840, 240],
  ['m2:fl_ninja', 4090, 140], ['m2:fl_sumo', 4420, 140], ['m2:fl_samurai', 4560, 140], ['m2:fl_ninja', 4460, 280],
  ['m2:fl_ninja', 4850, 140], ['m2:fl_cosplay', 5000, 340],
  ['m2:fl_samurai', 5260, 0], ['m2:fl_sumo', 5330, 0],
];

export const STATION_CHECKPOINTS = [
  { name: 'JAPAN: THE BULLET TRAIN', cp: 54, x: X(3640), y: GY },
  { name: 'JAPAN: THE OTHER FUJI', cp: 55, x: X(5240), y: GY },
];

// ---------------------------------------------------------------------------------------------------------------
// The train

/** The train now: 'warn' (bells), 'pass' (its nose at world x), or gone. */
const trainAt = (f: number) => {
  const t = f % EVERY, n = Math.floor(f / EVERY);
  if (t < WARN) return { st: 'warn' as const, n, nose: X(LANE.a), t };
  const nose = X(LANE.a) + (t - WARN) * TRAIN.v;
  if (nose - TRAIN.len < X(LANE.b)) return { st: 'pass' as const, n, nose, t: t - WARN };
  return { st: 'gone' as const, n, nose: 0, t: 0 };
};

interface Station { said: Shout; hit: Set<object>; n: number }
const stationOf = (state: GameState) => foreignState<Station>(state, 'japan-station' as 'japan', () => ({ said: newShout(), hit: new Set(), n: -1 }));

export const buildStation = (state: GameState) => {
  for (const [a, b, h] of [...FUJI_L, ...FUJI_R]) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'jp-fuji' });
  for (const [a, b, h] of REFUGES) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'jp-refuge' });
  spawnCast(state, ENEMIES, X, Y);
  placePickups(state, 'jp', X, Y, [[4460, 410, 'small_ammo'], [4090, 140, 'small_health']]);
};

export const updateStation = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, f = state.frame, s = stationOf(state);
  const near = p.pos.x > X(3400) && p.pos.x < X(5400);
  const tr = trainAt(f);
  if (tr.n !== s.n) { s.n = tr.n; s.hit.clear(); }
  if (tr.st !== 'gone') setHazardZones(state, 'jp-train', [{ x0: X(LANE.a), x1: X(LANE.b), y0: Y(TRAIN.h), y1: GY + 4, ground: true }]);
  if (tr.st === 'warn' && near && tr.t % 20 === 0) playSound('ding', 0.45, tr.t % 40 ? 4 : 0);
  if (tr.st === 'warn' && tr.t === 0 && near) shout(state, s.said, V.cosplay.f, byPants(state, STATION), X(4460), Y(410) - 70, 0.4);
  if (tr.st !== 'pass') return;
  if (tr.t === 0 && near) { playSound('truckhorn', 0.9, 14); playSound('rumble', 0.9, -4); }
  if (near && tr.t % 6 === 0) shakeScreen(state, 3, 2);
  const a = Math.max(X(LANE.a), tr.nose - TRAIN.len), b = Math.min(X(LANE.b), tr.nose);
  if (b <= a) return;
  if (!s.hit.has(p) && hurtIn(ctx, a, Y(TRAIN.h), b - a, TRAIN.h, 18, 'm2:fl_bullet_train', { x: 16, y: -12 }, 40)) { s.hit.add(p); playSound('crash', 0.9, -2); shakeScreen(state, 8, 6); }
  hitCastIn(ctx, a, Y(TRAIN.h), b - a, TRAIN.h, 999, a - 200, 'SHINKANSEN!', '#F8FAFC', s.hit, true);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const SNOW = '#F8FAFC', FUJI = '#64748B';

/** A Fuji: stepped fiberglass, a snowcap, the tunnel's portal at its foot on the track side (its shutter rolls up for
 *  the train: otherwise shut; there's no going in either way, it's solid). */
const drawFuji = (c: Ctx, v: View, steps: [number, number, number][], portalX: number, side: 1 | -1, open: number) => {
  if (!onScreen(v, X(Math.min(...steps.map(s => s[0]))), X(Math.max(...steps.map(s => s[1]))))) return;
  boxes3(c, v, steps.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: FUJI, standable: true })));
  for (const [a, b, h] of steps) { box(c, X(a), Y(h), b - a, 14, hour(SNOW)); for (let k = 0; k < 4; k++) box(c, X(a) + 8 + k * ((b - a - 16) / 4), Y(h) + 14, 8, 8 + (k % 2) * 8, hour(SNOW)); }
  // (the portal: a concrete arch, its shutter)
  const px = X(portalX) + (side > 0 ? -84 : 0), R = ramp6(hour('#A8A29E'));
  box(c, px - 6, Y(TRAIN.h + 24), 90, TRAIN.h + 24, R[3]);
  box(c, px, Y(TRAIN.h + 10), 78, TRAIN.h + 10, '#0B0B0F');
  const sh = (TRAIN.h + 10) * (1 - open);
  box(c, px, Y(TRAIN.h + 10), 78, sh, R[1]); for (let y = Y(TRAIN.h + 10) + 6; y < Y(TRAIN.h + 10) + sh; y += 8) box(c, px, y, 78, 1, R[0]);
  for (let k = 0; k < 6; k++) poly(c, [[px + k * 14, Y(TRAIN.h + 24)], [px + k * 14 + 8, Y(TRAIN.h + 24)], [px + k * 14, Y(TRAIN.h + 16)]], k % 2 ? '#FACC15' : INK);
};

/** The train: a long white nose, the blue stripe, windows streaking by (clipped to the track between the portals). */
const drawTrain = (c: Ctx, nose: number, f: number) => {
  c.save(); c.beginPath(); c.rect(X(LANE.a) - 84, Y(TRAIN.h + 20), X(LANE.b) - X(LANE.a) + 168, TRAIN.h + 40); c.clip();
  const tail = nose - TRAIN.len, top = Y(TRAIN.h);
  box(c, tail, top + 6, TRAIN.len - 160, TRAIN.h - 10, INK); box(c, tail, top + 8, TRAIN.len - 160, TRAIN.h - 14, '#F1F5F9');
  poly(c, [[nose - 160, top + 6], [nose - 40, top + 40], [nose, GY - 16], [nose - 160, GY - 4]], '#F1F5F9');
  box(c, tail, GY - 40, TRAIN.len - 60, 12, '#1D4ED8'); box(c, tail, GY - 26, TRAIN.len - 20, 4, '#1D4ED8');
  for (let x = tail + 20; x < nose - 200; x += 46) box(c, x, top + 24, 30, 18, (((x - tail) / 46) | 0) % 9 === (f >> 2) % 9 ? '#E0F2FE' : '#0F172A');
  box(c, nose - 130, top + 28, 60, 14, '#0F172A');
  for (let k = 0; k < 8; k++) box(c, tail + rnd(k + f) * TRAIN.len, top + rnd(k * 3 + f) * TRAIN.h, 40, 2, '#FFFFFF');
  c.restore();
};

export const drawStationBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(STATION_FROM), x1)) return;
  const f = state.frame, tr = trainAt(f);
  // (the track: ballast, sleepers, the two rails, the yellow line that isn't there)
  if (onScreen(v, X(LANE.a), X(LANE.b))) {
    box(c, X(LANE.a), GY - 6, LANE.b - LANE.a, 6, hour('#57534E'));
    for (let x = X(LANE.a); x < X(LANE.b); x += 24) box(c, x, GY - 8, 12, 4, hour('#78350F'));
    box(c, X(LANE.a), GY - 12, LANE.b - LANE.a, 3, '#A1A1AA'); box(c, X(LANE.a), GY - 4, LANE.b - LANE.a, 2, '#71717A');
  }
  // (the gantries' posts and lights, the walkway's legs, the station roof's posts, the departure board)
  const warn = tr.st === 'warn' && (f >> 3) % 2 === 0;
  for (const [a, b, h] of REFUGES) {
    if (!onScreen(v, X(a), X(b))) continue;
    const below = h === 140 ? 0 : h === 280 ? 140 : 280;
    for (const px0 of [X(a) + 6, X(b) - 12]) box(c, px0, Y(h) + 10, 6, h - below - 10, hour('#475569'));
    if (h === 410) { box(c, X(a) - 30, Y(h) + 12, b - a + 60, 40, '#0F172A'); for (let k = 0; k < 3; k++) box(c, X(a) - 24 + k * 50, Y(h) + 20, 40, 8, (f >> 5) % 3 === k ? '#FB923C' : '#F59E0B'); }
    ledge3(c, v, X(a), Y(h), b - a, h === 140 && b - a < 200 ? '#FACC15' : '#94A3B8', 12);
    if (h === 140 && b - a < 200) { box(c, X(a) + (b - a) / 2 - 10, Y(h) - 34, 20, 26, INK); box(c, X(a) + (b - a) / 2 - 7, Y(h) - 31, 14, 9, warn ? '#EF4444' : '#450A0A'); box(c, X(a) + (b - a) / 2 - 7, Y(h) - 20, 14, 9, !warn && tr.st === 'warn' ? '#EF4444' : '#450A0A'); }
  }
  // (the Fujis)
  const open = tr.st === 'warn' ? Math.min(1, Math.max(0, (tr.t - WARN + 40) / 30)) : tr.st === 'pass' ? 1 : 0;
  drawFuji(c, v, FUJI_L, LANE.a, 1, open);
  drawFuji(c, v, FUJI_R, LANE.b, -1, open);
  // (the signs: held up, nothing over them)
  if (onScreen(v, X(3620), X(3700))) postBoard(c, X(3650), GY, ['SHINKANSEN', 'BULLET TRAIN', '(DOES NOT STOP)'], LOOKS.japan(1), '#F8FAFC', undefined, 150);
  if (onScreen(v, X(4300), X(4620))) hungBoard(c, X(4460), Y(280) + 12, Y(280) + 46, ['PLEASE STAND BEHIND', 'THE YELLOW LINE'], LOOKS.japan(1), '#F8FAFC');
  if (onScreen(v, X(5260), X(5400))) postBoard(c, X(5330), GY, ['LEAVING JAPAN', 'SAYONARA (THANK YOU)'], LOOKS.japan(1), '#F8FAFC', undefined, 100);
  void dimmed;
};

export const drawStationFront = (c: Ctx, v: View, state: GameState) => {
  const tr = trainAt(state.frame);
  if (tr.st === 'pass' && onScreen(v, X(LANE.a), X(LANE.b))) drawTrain(c, tr.nose, state.frame);
  drawShout(c, stationOf(state).said);
};

export const stationLamps = (v: View, f: number): Light[] => {
  const tr = trainAt(f);
  if (!onScreen(v, X(LANE.a), X(LANE.b)) || tr.st !== 'warn' || (f >> 3) % 2) return [];
  return [{ x: X(4090), y: Y(170), r: 110, a: 0.6, color: '#EF4444' }, { x: X(4850), y: Y(170), r: 110, a: 0.6, color: '#EF4444' }];
};
