// THE UK's far end (job 4b: the pavilions lengthened): BIG BENJAMIN, the clock tower (Big Ben-ish), climbed INSIDE.
// Its far wall's shut to the ground (EXIT: THE CLOCK FACE), so in at its door and up: floors zigzagging up the shaft,
// THE PENDULUM swinging through the lower floors (its bob takes whoever it meets: `m2:fl_pendulum`; the cast too),
// gears turning on the walls, up to THE BELFRY, where the bell's hammer winds back (the whirr and the clicks: the tell)
// and BONGS on the hour (every few seconds), a ring of sound going out that hits whoever it reaches up there (him:
// `m2:fl_bong`; the cast too). Out through the clock face onto its ledge (900 up: the whole land below), down the
// outside of the tower by the stone ledges (they climb back up, and in through the face: revisits), then the terraced
// street, the last of the guards, to the border with Canada.

import type { Light } from '../../../m1/game/render/lighting';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast, byPants } from '../cast';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hazardVictims, hazardHit } from '../../hazardHit';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, type Shout } from '../setpiece';
import { type Ctx, type View, box, poly, at, boxes3, ledge3, setBack, wall, hole, postBoard, LOOKS, dimmed, hour, ramp6, onScreen, INK } from '../kit';
import { V, BONG } from './lines';

const { x0, x1 } = SECTIONS.uk;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

/** Where the old UK ended: this starts there. */
export const TOWER_FROM = 3600;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from the UK's start, heights up from the promenade). He jumps ~145 up, ~210 across.

const TOWER = { a: 3900, b: 4300, top: 1120 } as const;
/** Its walls (solid [a, b, from h, to h]): the near one over its door, the far one shut to the ground up to the face. */
const T_WALLS: [number, number, number, number][] = [[3900, 3920, 140, 1120], [4280, 4300, 0, 820], [4280, 4300, 990, 1120]];
/** Its floors (one-way), zigzag up; the belfry's floor; the clock face's ledge outside; the stone ledges down outside. */
const FLOORS: [number, number, number][] = [
  [3920, 4060, 130], [4140, 4280, 260], [3920, 4060, 390], [4140, 4280, 520], [3920, 4060, 650], [4140, 4280, 780], [3920, 4280, 900],
];
const FACE: [number, number, number] = [4280, 4400, 820];
const OUTSIDE: [number, number, number][] = [[4320, 4420, 690], [4300, 4400, 560], [4320, 4420, 430], [4300, 4400, 300], [4320, 4420, 170]];
/** The pendulum: its pivot (rx, h), length, swing (radians), speed; its bob. */
const PEND = { x: 4100, h: 720, len: 470, amp: 0.34, w: 0.045, bw: 64, bh: 54 } as const;
/** The bell: where, its beat (WIND of the hammer going back, then the BONG's ring out to RING_R over RING_T frames). */
const BELL = { x: 4100, h: 1030 } as const;
const EVERY = 380, WIND = 70, RING_T = 28, RING_R = 330;
const HOUSES: [number, number, number][] = [[4620, 4720, 120], [5000, 5060, 120]];

const ENEMIES: [string, number, number][] = [
  ['m2:fl_bobby', 3700, 0], ['m2:fl_hooligan', 3800, 0],
  ['m2:fl_bobby', 3990, 390], ['m2:fl_tealady', 4200, 520], ['m2:fl_guard', 4000, 650], ['m2:fl_hooligan', 4220, 780],
  ['m2:fl_bobby', 4060, 900],
  ['m2:fl_guard', 4560, 0], ['m2:fl_hooligan', 4670, 120], ['m2:fl_tealady', 4850, 0], ['m2:fl_bobby', 5030, 120], ['m2:fl_guard', 5200, 0], ['m2:fl_hooligan', 5300, 0],
];

export const TOWER_CHECKPOINTS = [
  { name: 'THE UK: BIG BENJAMIN', cp: 84, x: X(3830), y: GY },
  { name: 'THE UK: THE CLOCK FACE', cp: 85, x: X(4500), y: GY },
];

// ---------------------------------------------------------------------------------------------------------------
// The pendulum and the bell

const pendAt = (f: number) => {
  const a = Math.sin(f * PEND.w) * PEND.amp;
  return { a, x: X(PEND.x) + Math.sin(a) * PEND.len, y: Y(PEND.h) + Math.cos(a) * PEND.len };
};
const bellAt = (f: number) => {
  const t = f % EVERY, n = Math.floor(f / EVERY);
  if (t < WIND) return { st: 'wind' as const, n, t };
  if (t < WIND + RING_T) return { st: 'ring' as const, n, t: t - WIND, r: ((t - WIND) / RING_T) * RING_R };
  return { st: 'still' as const, n, t };
};

interface Big { said: Shout; pendHit: Map<object, number>; ringHit: Set<object>; n: number }
const bigOf = (state: GameState) => foreignState<Big>(state, 'uk-tower' as 'uk', () => ({ said: newShout(), pendHit: new Map(), ringHit: new Set(), n: -1 }));

export const buildTower = (state: GameState) => {
  for (const [a, b, lo, hi] of T_WALLS) solid(state, X(a), Y(hi), b - a, hi - lo, { hidden: true, tag: 'uk-tower-wall' });
  for (const [a, b, h] of [...FLOORS, FACE, ...OUTSIDE]) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'uk-tower-floor' });
  for (const [a, b, h] of HOUSES) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'uk-booth2' });
  spawnCast(state, ENEMIES, X, Y);
  placePickups(state, 'uk', X, Y, [[4340, FACE[2], 'small_ammo'], [3990, 650, 'small_health']]);
};

export const updateTower = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, f = state.frame, b = bigOf(state);
  const inside = p.pos.x > X(3700) && p.pos.x < X(4600);
  // (the pendulum: its bob hits whoever it meets, once a swing)
  const pd = pendAt(f), bx = pd.x - PEND.bw / 2, by = pd.y - PEND.bh / 2, dir = Math.cos(f * PEND.w) >= 0 ? 1 : -1;
  if (inside && Math.abs(pd.a) < 0.02) playSound('whoosh', 0.3, -12);
  if ((b.pendHit.get(p) ?? -999) < f - 50 && hurtIn(ctx, bx, by, PEND.bw, PEND.bh, 10, 'm2:fl_pendulum', { x: dir * 11, y: -6 }, 26)) { b.pendHit.set(p, f); playSound('clang', 0.8, -6); }
  for (const e of hazardVictims(state)) {
    if ((b.pendHit.get(e) ?? -999) > f - 50 || !(e.pos.x < bx + PEND.bw && e.pos.x + e.width > bx && e.pos.y < by + PEND.bh && e.pos.y + e.height > by)) continue;
    b.pendHit.set(e, f); hazardHit(ctx, e, 34, pd.x - dir * 60, 'TICK TOCK!', { color: '#FCD34D' });
  }
  // (the bell: the hammer's wind, the BONG and its ring)
  const bl = bellAt(f);
  if (bl.n !== b.n) { b.n = bl.n; b.ringHit.clear(); }
  if (bl.st === 'wind' && inside && bl.t % 14 === 0) playSound('click', 0.5, -4);
  if (bl.st === 'wind' && bl.t === 0 && inside) shout(state, b.said, V.bobby.m, byPants(state, BONG), X(BELL.x), Y(BELL.h) - 60, 0.35);
  if (bl.st !== 'ring') return;
  if (bl.t === 0 && inside) { playSound('clang', 1, -20); playSound('boom', 0.5, -14); shakeScreen(state, 6, 6); }
  const cx = X(BELL.x), cy = Y(BELL.h), pcx = p.pos.x + p.width / 2, pcy = p.pos.y + p.height / 2;
  if (!b.ringHit.has(p) && Math.abs(Math.hypot(pcx - cx, pcy - cy) - bl.r) < 34) {
    if (hurtIn(ctx, p.pos.x, p.pos.y, p.width, p.height, 7, 'm2:fl_bong', { x: Math.sign(pcx - cx) * 9 || 9, y: -5 }, 24)) b.ringHit.add(p);
  }
  const band = 34;
  for (const e of hazardVictims(state)) {
    const ex = e.pos.x + e.width / 2, ey = e.pos.y + e.height / 2;
    if (b.ringHit.has(e) || Math.abs(Math.hypot(ex - cx, ey - cy) - bl.r) > band) continue;
    b.ringHit.add(e); hazardHit(ctx, e, 24, cx, 'BONG!', { color: '#FDE68A' });
  }
  void hitCastIn;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const STONE = '#C8B98E', GOLD = '#CA8A04';

export const drawTowerBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(TOWER_FROM), x1)) return;
  const f = state.frame;
  // (the parliament-ish front behind, set back: gothic stone, pointy windows)
  setBack(c, v, X(3620), 260, 0.9, () => { wall(c, 0, 260, 220, STONE); for (let wx = 20; wx < 240; wx += 50) { hole(c, wx, -170, 22, 60, true); poly(c, [[wx, -170], [wx + 11, -186], [wx + 22, -170]], dimmed('#1C1014')); } });
  // (the terraced street after: brick, white doors, chimney pots)
  for (const rx of [4500, 4780, 5060]) setBack(c, v, X(rx), 260, 0.88, () => { wall(c, 0, 260, 200, '#9F3B2E', '#E7E5E4'); hole(c, 30, -80, 36, 80, true); for (const wx of [110, 180]) hole(c, wx, -150, 40, 50, true); for (const cx2 of [40, 200]) box(c, cx2, -232, 24, 30, dimmed('#7C2D12')); });
  if (!onScreen(v, X(TOWER.a) - 40, X(4440))) { drawStreetBits(c, v); return; }
  // (inside: the shaft's back wall, set back, the gears turning on it)
  const [ax, ay] = at(v.eye, X(TOWER.a), Y(TOWER.top), 0.94), [bx, by] = at(v.eye, X(TOWER.b), GY, 0.94);
  box(c, ax, ay, bx - ax, by - ay, dimmed('#6B6250'));
  for (let y = ay + 24; y < by; y += 24) box(c, ax, y, bx - ax, 1, dimmed('#4A4538'));
  for (const [gx, gh, r] of [[3990, 320, 40], [4210, 600, 54], [4000, 840, 34]] as const) {
    const [px, py] = at(v.eye, X(gx), Y(gh), 0.94), rot = f * 0.02 * (gx > 4100 ? -1 : 1);
    c.fillStyle = dimmed(GOLD); c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 10; k++) { const a = rot + (k / 10) * Math.PI * 2; box(c, px + Math.cos(a) * r - 4, py + Math.sin(a) * r - 4, 8, 8, dimmed(GOLD)); }
    c.fillStyle = dimmed('#3F3F46'); c.beginPath(); c.arc(px, py, r * 0.3, 0, Math.PI * 2); c.fill();
  }
  // (the tower's stone: the walls (the near one stops over the door; the far one's down to the ground), the spire)
  boxes3(c, v, T_WALLS.map(([a, b, lo, hi]) => ({ x: X(a), top: Y(hi), w: b - a, bottom: Y(lo), col: STONE, standable: true })));
  const S = ramp6(hour(STONE));
  poly(c, [[X(TOWER.a) - 20, Y(TOWER.top)], [X(TOWER.b) + 20, Y(TOWER.top)], [X((TOWER.a + TOWER.b) / 2), Y(TOWER.top + 260)]], S[1]);
  box(c, X(TOWER.a) - 20, Y(TOWER.top) - 6, TOWER.b - TOWER.a + 40, 12, S[3]);
  // (the clock face, on the far wall's outside over its ledge: the hole he goes through, its numbers, the hands)
  const fx = X(4300), fy = Y(890);
  c.fillStyle = INK; c.beginPath(); c.arc(fx, fy, 78, -Math.PI / 2, Math.PI / 2); c.fill();
  c.fillStyle = hour('#F5F0E0'); c.beginPath(); c.arc(fx, fy, 74, -Math.PI / 2, Math.PI / 2); c.fill();
  for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k / 5) * Math.PI; box(c, fx + Math.cos(a) * 62 - 3, fy + Math.sin(a) * 62 - 3, 6, 6, INK); }
  box(c, fx, Y(990), 8, 170, '#0B0B0F');
  // (the floors, the face's ledge, the stone ledges down the outside)
  for (const [a, b, h] of FLOORS) ledge3(c, v, X(a), Y(h), b - a, '#78716C', h === 900 ? 16 : 10);
  ledge3(c, v, X(FACE[0]), Y(FACE[2]), FACE[1] - FACE[0], STONE, 14);
  for (const [a, b, h] of OUTSIDE) ledge3(c, v, X(a), Y(h), b - a, STONE, 12);
  // (the bell up in the belfry, its hammer winding back)
  const bl = bellAt(f), wind = bl.st === 'wind' ? bl.t / WIND : 0, swing = bl.st === 'ring' ? Math.sin(bl.t * 0.6) * 0.12 : 0;
  c.save(); c.translate(X(BELL.x), Y(BELL.h) - 50); c.rotate(swing);
  poly(c, [[-26, 0], [26, 0], [44, 80], [-44, 80]], hour('#A16207')); box(c, -44, 78, 88, 8, hour('#713F12')); box(c, -6, -8, 12, 10, INK);
  c.restore();
  c.save(); c.translate(X(BELL.x) + 60, Y(BELL.h) + 20); c.rotate(-0.2 - wind * 0.9); box(c, -2, -40, 4, 40, INK); box(c, -8, -50, 16, 12, '#3F3F46'); c.restore();
  drawStreetBits(c, v);
};

/** The signs and the phone booth on the terraced street. */
const drawStreetBits = (c: Ctx, v: View) => {
  boxes3(c, v, HOUSES.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: '#B91C1C', standable: true })));
  for (const [a, b, h] of HOUSES) if (onScreen(v, X(a), X(b))) { for (let y = Y(h) + 16; y < GY - 10; y += 20) box(c, X(a) + 6, y, b - a - 12, 14, '#E0F2FE'); }
  if (onScreen(v, X(3700), X(3860))) postBoard(c, X(3780), GY, ['BIG BENJAMIN', 'EXIT: THE CLOCK FACE', 'NO LIFT'], LOOKS.uk(1), '#991B1B', undefined, 140);
  if (onScreen(v, X(5250), X(5420))) postBoard(c, X(5330), GY, ['LEAVING THE UK', 'CHEERIO (HELLO)'], LOOKS.uk(1), '#991B1B', undefined, 100);
};

export const drawTowerFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame;
  if (onScreen(v, X(TOWER.a), X(TOWER.b))) {
    // (the pendulum: its rod down from the pivot, the brass bob)
    const pd = pendAt(f);
    c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(X(PEND.x), Y(PEND.h)); c.lineTo(pd.x, pd.y); c.stroke();
    c.strokeStyle = hour(GOLD); c.lineWidth = 3; c.beginPath(); c.moveTo(X(PEND.x), Y(PEND.h)); c.lineTo(pd.x, pd.y); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(pd.x, pd.y, PEND.bh / 2 + 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = hour(GOLD); c.beginPath(); c.arc(pd.x, pd.y, PEND.bh / 2, 0, Math.PI * 2); c.fill();
    box(c, pd.x - 8, pd.y - 12, 10, 6, '#FEF08A');
    // (the BONG's ring going out)
    const bl = bellAt(f);
    if (bl.st === 'ring') { c.globalAlpha = 1 - bl.t / RING_T; c.strokeStyle = '#FDE68A'; c.lineWidth = 6; c.beginPath(); c.arc(X(BELL.x), Y(BELL.h), bl.r, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1; }
  }
  drawShout(c, bigOf(state).said);
};

export const towerLamps = (v: View, f: number): Light[] => {
  if (!onScreen(v, X(TOWER.a), X(TOWER.b))) return [];
  const bl = bellAt(f);
  return [{ x: X(4300), y: Y(890), r: 150, a: 0.5, color: '#FEF3C7' }, ...(bl.st === 'ring' ? [{ x: X(BELL.x), y: Y(BELL.h), r: 200 + bl.r * 0.3, a: 0.4, color: '#FDE68A' }] : [])];
};
