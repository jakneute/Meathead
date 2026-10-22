// THE UK's far end (job 4b: the pavilions lengthened; reskinned 2026-10-16, Spooky Land already has the clock tower):
// THE WORLD'S TALLEST PHONE BOX, a giant red British telephone box climbed up INSIDE. Its far wall's shut to the ground
// (EXIT: OUT THE TOP), so in at its door and up: floors zigzagging up the shaft, THE HANDSET off the hook, swinging on
// its coiled cord through the lower floors (it takes whoever it meets: `m2:fl_handset`; the cast too), coin boxes,
// phone books, INSERT 10P signs and taped-up calling cards on the walls, up to the top floor, where the giant phone on
// the wall rattles (the clicks: the tell) and RINGS every few seconds, a ring of sound going out that hits whoever it
// reaches up there (him: `m2:fl_ring`; the cast too; he may answer it). Out through the box's smashed glass panes onto
// the sill (900 up: the whole land below; the TELEPHONE crown sign over it), down the outside of the box by its
// moldings (they climb back up, and in through the panes: revisits), then the terraced street, the last of the guards,
// to the border with Canada. (The layout, the collision and the hazards' timings and hit areas are the clock tower's,
// untouched.)

import type { Light } from '../../../m1/game/render/lighting';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast, byPants } from '../cast';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hazardVictims, hazardHit } from '../../hazardHit';
import { gag } from '../state';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, type Shout } from '../setpiece';
import { type Ctx, type View, box, postBoard, LOOKS, hour, ramp6, onScreen, INK, facade, FACADE_D } from '../kit';
import { type UkFront, drawHall, drawTerrace, paintBoxBack, coil, drawBoxWall, drawBoxCrown, drawSmashedPanes, drawBoxFloor, drawMolding, drawWallPhone, drawHandset, drawRing, drawBooth } from './art';
import { V, RINGING, ANSWER } from './lines';

const { x0, x1 } = SECTIONS.uk;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

/** Where the old UK ended: this starts there. */
export const TOWER_FROM = 3600;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from the UK's start, heights up from the promenade). He jumps ~145 up, ~210 across.

const TOWER = { a: 3900, b: 4300, top: 1120 } as const;
/** Its walls (solid [a, b, from h, to h]): the near one over its door, the far one shut to the ground up to the panes. */
const T_WALLS: [number, number, number, number][] = [[3900, 3920, 140, 1120], [4280, 4300, 0, 820], [4280, 4300, 990, 1120]];
/** Its floors (one-way), zigzag up; the top floor; the sill outside the smashed panes; the moldings down outside. */
const FLOORS: [number, number, number][] = [
  [3920, 4060, 130], [4140, 4280, 260], [3920, 4060, 390], [4140, 4280, 520], [3920, 4060, 650], [4140, 4280, 780], [3920, 4280, 900],
];
const FACE: [number, number, number] = [4280, 4400, 820];
const OUTSIDE: [number, number, number][] = [[4320, 4420, 690], [4300, 4400, 560], [4320, 4420, 430], [4300, 4400, 300], [4320, 4420, 170]];
/** The handset: where its cord hangs from (rx, h: a pulley on the back wall), the cord's length, swing (radians),
 *  speed; the handset's hit area. */
const HANDSET = { x: 4100, h: 720, len: 470, amp: 0.34, w: 0.045, bw: 64, bh: 54 } as const;
/** The phone on the wall up top: where, its beat (WIND of it rattling, then the RING going out to RING_R over RING_T
 *  frames). */
const PHONE = { x: 4100, h: 1030 } as const;
const EVERY = 380, WIND = 70, RING_T = 28, RING_R = 330;
const HOUSES: [number, number, number][] = [[4620, 4720, 120], [5000, 5060, 120]];

const ENEMIES: [string, number, number][] = [
  // (the door by THE TALLEST PHONE BOX's checkpoint clear) a bobby inside on the ground floor; up the shaft, a floor at
  // a time
  ['m2:fl_bobby', 4200, 0],
  ['m2:fl_bobby', 3990, 390], ['m2:fl_tealady', 4200, 520], ['m2:fl_guard', 4000, 650], ['m2:fl_hooligan', 4220, 780],
  ['m2:fl_bobby', 4060, 900],
  // a hooligan on a molding down the outside (pints at him on the way down)
  ['m2:fl_hooligan', 4370, 560],
  // the street (past OUT THE TOP's checkpoint's reach; its guard stands there harmless): the tea lady and a bobby, a
  // hooligan up on the far house's step, the last guard, a hooligan
  ['m2:fl_guard', 4560, 0], ['m2:fl_tealady', 4870, 0], ['m2:fl_bobby', 4930, 0], ['m2:fl_hooligan', 5030, 120], ['m2:fl_guard', 5200, 0], ['m2:fl_hooligan', 5300, 0],
];

export const TOWER_CHECKPOINTS = [
  { name: 'THE UK: THE TALLEST PHONE BOX', cp: 84, x: X(3830), y: GY },
  { name: 'THE UK: OUT THE TOP', cp: 85, x: X(4500), y: GY },
];

// ---------------------------------------------------------------------------------------------------------------
// The handset and the ring

const handsetAt = (f: number) => {
  const a = Math.sin(f * HANDSET.w) * HANDSET.amp;
  return { a, x: X(HANDSET.x) + Math.sin(a) * HANDSET.len, y: Y(HANDSET.h) + Math.cos(a) * HANDSET.len };
};
const phoneAt = (f: number) => {
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
  // (the handset: it hits whoever it meets, once a swing)
  const pd = handsetAt(f), bx = pd.x - HANDSET.bw / 2, by = pd.y - HANDSET.bh / 2, dir = Math.cos(f * HANDSET.w) >= 0 ? 1 : -1;
  if (inside && Math.abs(pd.a) < 0.02) playSound('whoosh', 0.3, -12);
  if ((b.pendHit.get(p) ?? -999) < f - 50 && hurtIn(ctx, bx, by, HANDSET.bw, HANDSET.bh, 10, 'm2:fl_handset', { x: dir * 11, y: -6 }, 26)) { b.pendHit.set(p, f); playSound('bonk', 0.8, -4); }
  for (const e of hazardVictims(state)) {
    if ((b.pendHit.get(e) ?? -999) > f - 50 || !(e.pos.x < bx + HANDSET.bw && e.pos.x + e.width > bx && e.pos.y < by + HANDSET.bh && e.pos.y + e.height > by)) continue;
    b.pendHit.set(e, f); hazardHit(ctx, e, 34, pd.x - dir * 60, 'HOLD, PLEASE!', { color: '#FCA5A5' });
  }
  // (the phone: the rattle, the RING and its wave)
  const bl = phoneAt(f);
  if (bl.n !== b.n) { b.n = bl.n; b.ringHit.clear(); }
  if (bl.st === 'wind' && inside && bl.t % 14 === 0) playSound('click', 0.5, -4);
  if (bl.st === 'wind' && bl.t === 0 && inside) shout(state, b.said, V.bobby.m, byPants(state, RINGING), X(PHONE.x), Y(PHONE.h) - 60, 0.35);
  if (bl.st !== 'ring') return;
  if (bl.t === 0 && inside) {
    playSound('boom', 0.5, -14); shakeScreen(state, 6, 6);
    // (he answers it, if he's up top and it isn't on top of somebody else)
    if (p.pos.y + p.height < Y(500)) gag(state, 'uk-answer', ANSWER);
  }
  if (bl.t % 4 === 0 && inside) playSound('ding', 0.9, 6 + (bl.t % 8 === 0 ? 0 : 2));
  const cx = X(PHONE.x), cy = Y(PHONE.h), pcx = p.pos.x + p.width / 2, pcy = p.pos.y + p.height / 2;
  if (!b.ringHit.has(p) && Math.abs(Math.hypot(pcx - cx, pcy - cy) - bl.r) < 34) {
    if (hurtIn(ctx, p.pos.x, p.pos.y, p.width, p.height, 7, 'm2:fl_ring', { x: Math.sign(pcx - cx) * 9 || 9, y: -5 }, 24)) b.ringHit.add(p);
  }
  const band = 34;
  for (const e of hazardVictims(state)) {
    const ex = e.pos.x + e.width / 2, ey = e.pos.y + e.height / 2;
    if (b.ringHit.has(e) || Math.abs(Math.hypot(ex - cx, ey - cy) - bl.r) > band) continue;
    b.ringHit.add(e); hazardHit(ctx, e, 24, cx, 'BRRRING!', { color: '#FDE68A' });
  }
  void hitCastIn;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (the SNES pass: art.ts paints it; here's only where)

/** What's on the box's back wall (rx, h): the coin boxes, the phone books (and how many), the calling cards (a seed). */
const BITS = {
  coins: [[3990, 760], [4225, 600]] as [number, number][],
  books: [[3955, 445, 4], [4245, 300, 3], [4215, 840, 5]] as [number, number, number][],
  cards: [[3975, 200, 11], [4220, 380, 23], [3965, 560, 37], [4235, 700, 51], [4000, 990, 67]] as [number, number, number][],
};
/** The terraced street past the box (set back, braced). */
const STREET: UkFront[] = [
  { rx: 4500, w: 260, h: 200, kind: 'brick', door: '#7F1D1D' },
  { rx: 4780, w: 260, h: 200, kind: 'stock', shop: { name: 'OFF LICENCE (LIQUOR)', goods: 'offlicence', paint: '#3F1D4A' } },
  { rx: 5060, w: 260, h: 200, kind: 'brick', door: '#1E3A8A' },
];

export const drawTowerBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(TOWER_FROM), x1)) return;
  const f = state.frame;
  // (a Victorian gothic hall behind, set back: no clock, no tower)
  drawHall(c, v, X(3620), 260, 220);
  // (the terraced street after)
  const on = STREET.filter(fr => onScreen(v, X(fr.rx) - 60, X(fr.rx + fr.w) + 60, FACADE_D));
  on.sort((p, q) => Math.abs(X(q.rx + q.w / 2) - v.eye.x) - Math.abs(X(p.rx + p.w / 2) - v.eye.x));
  for (const fr of on) drawTerrace(c, v, X(fr.rx), fr);
  if (!onScreen(v, X(TOWER.a) - 40, X(4440))) { drawStreetBits(c, v); return; }
  // (inside: the box's back, set back: its glazing bars, the panes and the sky through them, what's taped up on it)
  const bits = {
    coins: BITS.coins.map(([rx, h]) => [rx - TOWER.a, h] as [number, number]),
    books: BITS.books.map(([rx, h, n]) => [rx - TOWER.a, h, n] as [number, number, number]),
    cards: BITS.cards.map(([rx, h, sd]) => [rx - TOWER.a, h, sd] as [number, number, number]),
  };
  facade(c, v, 'uk-boxback', X(TOWER.a), TOWER.b - TOWER.a, TOWER.top, g => paintBoxBack(g, TOWER.b - TOWER.a, TOWER.top, bits), 0.94, 0, 0, false);
  // (the phone's cord, down from the phone to the pulley on the wall: behind the top floor)
  coil(c, X(PHONE.x), Y(PHONE.h) + 40, X(HANDSET.x), Y(HANDSET.h));
  // (the box's red walls (the near one stops over the door; the far one's down to the ground), the crown over it all)
  T_WALLS.forEach(([a, b, lo, hi]) => drawBoxWall(c, v, X(a), X(b), Y(hi), Y(lo), false));
  drawBoxCrown(c, v, X(TOWER.a), X(TOWER.b), Y(TOWER.top));
  // (the smashed panes in the far wall: the way out)
  drawSmashedPanes(c, X(4280), Y(990), Y(820));
  // (the floors, the sill outside the panes, the red moldings down the outside)
  for (const [a, b, h] of FLOORS) drawBoxFloor(c, v, X(a), X(b), Y(h), h === 900 ? 16 : 10, h === 900 ? 0 : a === 3920 ? -1 : 1);
  drawMolding(c, v, X(FACE[0]), X(FACE[1]), Y(FACE[2]), 14);
  for (const [a, b, h] of OUTSIDE) drawMolding(c, v, X(a), X(b), Y(h), 12);
  // (broken glass on the sill)
  for (let k = 0; k < 5; k++) { box(c, X(4310 + k * 17) - 1, Y(FACE[2]) - 3, 6, 3, INK); box(c, X(4310 + k * 17), Y(FACE[2]) - 2, 4, 2, k % 2 ? '#BAE6FD' : '#E0F2FE'); }
  // (the phone on the wall up top: rattling, then ringing)
  const bl = phoneAt(f), wind = bl.st === 'wind' ? bl.t / WIND : 0;
  const jig = bl.st === 'ring' ? (bl.t % 2 ? 4 : -4) : bl.st === 'wind' ? (bl.t % 4 < 2 ? 1 : -1) * Math.round(wind * 3) : 0;
  const clap = bl.st === 'ring' ? (bl.t % 2 ? 14 : -14) : jig * 3;
  drawWallPhone(c, X(PHONE.x), Y(PHONE.h), jig, clap);
  drawStreetBits(c, v);
};

/** The signs and the phone boxes on the terraced street. */
const drawStreetBits = (c: Ctx, v: View) => {
  for (const [a, b, h] of HOUSES) drawBooth(c, v, X(a), X(b), Y(h));
  if (onScreen(v, X(3700), X(3860))) postBoard(c, X(3780), GY, ["THE WORLD'S TALLEST", 'TELEPHONE BOX', 'EXIT: OUT THE TOP', 'NO LIFT'], LOOKS.uk(1), '#991B1B', undefined, 140);
  if (onScreen(v, X(5250), X(5420))) postBoard(c, X(5330), GY, ['LEAVING THE UK', 'CHEERIO (HELLO)'], LOOKS.uk(1), '#991B1B', undefined, 100);
};

export const drawTowerFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame;
  if (onScreen(v, X(TOWER.a), X(TOWER.b))) {
    // (the pulley on the wall, the coiled cord down from it, the handset on the end, swinging)
    const pd = handsetAt(f), hx = X(HANDSET.x), hy = Y(HANDSET.h), M = ramp6(hour('#A1A1AA'));
    c.fillStyle = INK; c.beginPath(); c.arc(hx, hy, 12, 0, Math.PI * 2); c.fill();
    c.fillStyle = M[2]; c.beginPath(); c.arc(hx, hy, 11, 0, Math.PI * 2); c.fill();
    c.fillStyle = M[4]; c.beginPath(); c.arc(hx - 2, hy - 2, 7, Math.PI, Math.PI * 1.6); c.lineTo(hx, hy); c.fill();
    box(c, hx - 3, hy - 3, 6, 6, INK); box(c, hx - 2, hy - 2, 2, 2, M[5]);
    coil(c, hx, hy, pd.x, pd.y - 10);
    c.save(); c.translate(pd.x, pd.y); c.rotate(-pd.a); drawHandset(c); c.restore();
    // (the RING going out)
    const bl = phoneAt(f);
    if (bl.st === 'ring') drawRing(c, X(PHONE.x), Y(PHONE.h), bl.r, bl.t / RING_T);
  }
  drawShout(c, bigOf(state).said);
};

export const towerLamps = (v: View, f: number): Light[] => {
  if (!onScreen(v, X(TOWER.a), X(TOWER.b))) return [];
  const bl = phoneAt(f);
  return [
    { x: X((TOWER.a + TOWER.b) / 2), y: Y(TOWER.top) - 24, r: 190, a: 0.5, color: '#F8FAFC' },
    { x: X(4300), y: Y(905), r: 120, a: 0.3, color: '#E0F2FE' },
    ...(bl.st === 'ring' ? [{ x: X(PHONE.x), y: Y(PHONE.h), r: 200 + bl.r * 0.3, a: 0.4, color: '#FDE68A' }] : []),
  ];
};
