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
import { type Ctx, type View, type Look, box, poly, at, boxes3, ledge3, setBack, wall, hole, postBoard, LOOKS, dimmed, hour, ramp6, onScreen, INK, signText, rnd, mix } from '../kit';
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
  ['m2:fl_bobby', 3700, 0], ['m2:fl_hooligan', 3800, 0],
  ['m2:fl_bobby', 3990, 390], ['m2:fl_tealady', 4200, 520], ['m2:fl_guard', 4000, 650], ['m2:fl_hooligan', 4220, 780],
  ['m2:fl_bobby', 4060, 900],
  ['m2:fl_guard', 4560, 0], ['m2:fl_hooligan', 4670, 120], ['m2:fl_tealady', 4850, 0], ['m2:fl_bobby', 5030, 120], ['m2:fl_guard', 5200, 0], ['m2:fl_hooligan', 5300, 0],
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
// Drawing

const STONE = '#C8B98E', RED = '#C8102E', BAKELITE = '#18181B';
/** The little enamel plates inside (INSERT 10P): red on white. */
const PLATE: Look = { sx: 1, sy: 2, fill: '#B91C1C', gap: 1 };
/** The crown sign's lettering: black on lit white, bold. */
const CROWN: Look = { sx: 2, sy: 3, fill: '#111827', bold: true, gap: 1 };

/** A coiled cord from (ax, ay) to (bx, by). */
const coil = (c: Ctx, ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, n = Math.round(len / 7);
  for (const [w, col] of [[5, INK], [2, '#3F3F46']] as const) {
    c.strokeStyle = col; c.lineWidth = w; c.beginPath();
    for (let k = 0; k <= n * 4; k++) { const s = k / (n * 4), o = Math.sin(s * n * Math.PI * 2) * 5; const x = ax + dx * s + nx * o, y = ay + dy * s + ny * o; if (k) c.lineTo(x, y); else c.moveTo(x, y); }
    c.stroke();
  }
};

/** The back wall's bits (on the wall, set back): a coin box with its INSERT 10P plate. */
const coinBox = (c: Ctx, v: View, rx: number, h: number) => {
  const [px, py] = at(v.eye, X(rx), Y(h), 0.94);
  box(c, px - 19, py - 1, 38, 52, INK); box(c, px - 18, py, 36, 50, dimmed('#71717A')); box(c, px - 18, py, 36, 3, dimmed('#A1A1AA'));
  box(c, px - 8, py + 8, 16, 3, INK); box(c, px - 10, py + 30, 20, 12, dimmed('#3F3F46')); box(c, px - 6, py + 34, 12, 4, INK);
  box(c, px - 34, py - 26, 68, 20, INK); box(c, px - 33, py - 25, 66, 18, dimmed('#F8FAFC'));
  signText(c, 'INSERT 10P', px, py - 11, PLATE);
};
/** A stack of phone books on a little shelf. */
const phoneBooks = (c: Ctx, v: View, rx: number, h: number, n: number) => {
  const [px, py] = at(v.eye, X(rx), Y(h), 0.94);
  box(c, px - 26, py, 52, 5, dimmed('#44403C'));
  for (let k = 0; k < n; k++) {
    const w = 40 - (k % 2) * 4, y = py - (k + 1) * 9, col = k % 3 === 1 ? '#E7E5E4' : '#FACC15';
    box(c, px - w / 2 - 1, y - 1, w + 2, 10, INK); box(c, px - w / 2, y, w, 8, dimmed(col)); box(c, px - w / 2, y + 3, w, 1, dimmed('#A16207'));
  }
};
/** Calling cards taped up round (rx, h). */
const cards = (c: Ctx, v: View, rx: number, h: number, seed: number) => {
  for (let k = 0; k < 6; k++) {
    const [px, py] = at(v.eye, X(rx + (rnd(seed + k) - 0.5) * 70), Y(h + (rnd(seed + k + 9) - 0.5) * 60), 0.94);
    const col = ['#F472B6', '#FDE68A', '#F8FAFC', '#A78BFA', '#FCA5A5'][Math.floor(rnd(seed + k * 3) * 5)];
    box(c, px - 8, py - 6, 16, 11, INK); box(c, px - 7, py - 5, 14, 9, dimmed(col)); box(c, px - 5, py - 2, 8, 1, dimmed('#52525B')); box(c, px - 5, py + 1, 10, 1, dimmed('#52525B'));
    box(c, px - 3, py - 7, 6, 3, mix(dimmed('#F5F5F4'), '#FFFFFF', 0.2));
  }
};

export const drawTowerBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(TOWER_FROM), x1)) return;
  const f = state.frame;
  // (the parliament-ish front behind, set back: gothic stone, pointy windows)
  setBack(c, v, X(3620), 260, 0.9, () => { wall(c, 0, 260, 220, STONE); for (let wx = 20; wx < 240; wx += 50) { hole(c, wx, -170, 22, 60, true); poly(c, [[wx, -170], [wx + 11, -186], [wx + 22, -170]], dimmed('#1C1014')); } });
  // (the terraced street after: brick, white doors, chimney pots)
  for (const rx of [4500, 4780, 5060]) setBack(c, v, X(rx), 260, 0.88, () => { wall(c, 0, 260, 200, '#9F3B2E', '#E7E5E4'); hole(c, 30, -80, 36, 80, true); for (const wx of [110, 180]) hole(c, wx, -150, 40, 50, true); for (const cx2 of [40, 200]) box(c, cx2, -232, 24, 30, dimmed('#7C2D12')); });
  if (!onScreen(v, X(TOWER.a) - 40, X(4440))) { drawStreetBits(c, v); return; }
  // (inside: the box's back, set back: red frame, the little panes of its glazing up the whole height)
  const [ax, ay] = at(v.eye, X(TOWER.a), Y(TOWER.top), 0.94), [bx, by] = at(v.eye, X(TOWER.b), GY, 0.94);
  box(c, ax, ay, bx - ax, by - ay, dimmed('#7F1D1D'));
  const gx0 = ax + 34, gx1 = bx - 34, cw = (gx1 - gx0) / 3;
  for (let y = ay + 40; y < by - 60; y += 52) for (let k = 0; k < 3; k++) {
    box(c, gx0 + k * cw + 5, y, cw - 10, 44, dimmed('#1E293B'));
    box(c, gx0 + k * cw + 5, y, cw - 10, 3, dimmed('#475569'));
  }
  // (what's on it: coin boxes and their plates, phone books, calling cards taped up everywhere)
  coinBox(c, v, 3990, 760); coinBox(c, v, 4225, 600);
  phoneBooks(c, v, 3955, 445, 4); phoneBooks(c, v, 4245, 300, 3); phoneBooks(c, v, 4215, 840, 5);
  cards(c, v, 3975, 200, 11); cards(c, v, 4220, 380, 23); cards(c, v, 3965, 560, 37); cards(c, v, 4235, 700, 51); cards(c, v, 4000, 990, 67);
  // (the phone's cord, down from the phone to the pulley on the wall: behind the top floor)
  coil(c, X(PHONE.x), Y(PHONE.h) + 40, X(HANDSET.x), Y(HANDSET.h));
  // (the box's red walls (the near one stops over the door; the far one's down to the ground), the crown sign, the roof)
  boxes3(c, v, T_WALLS.map(([a, b, lo, hi]) => ({ x: X(a), top: Y(hi), w: b - a, bottom: Y(lo), col: RED, standable: true })));
  const R = ramp6(hour(RED)), mid = X((TOWER.a + TOWER.b) / 2);
  box(c, X(TOWER.a) - 20, Y(TOWER.top) - 46, TOWER.b - TOWER.a + 40, 46, R[2]);
  box(c, X(TOWER.a) - 8, Y(TOWER.top) - 40, TOWER.b - TOWER.a + 16, 32, INK);
  box(c, X(TOWER.a) - 6, Y(TOWER.top) - 38, TOWER.b - TOWER.a + 12, 28, '#F8FAFC');
  signText(c, 'TELEPHONE', mid, Y(TOWER.top) - 15, CROWN);
  box(c, X(TOWER.a) - 26, Y(TOWER.top) - 56, TOWER.b - TOWER.a + 52, 10, R[3]); box(c, X(TOWER.a) - 26, Y(TOWER.top) - 56, TOWER.b - TOWER.a + 52, 2, R[4]);
  // (the domed roof, stepped, and the crown on it)
  for (let k = 0; k < 6; k++) { const w = (TOWER.b - TOWER.a + 40) * Math.cos((k / 6) * Math.PI / 2), h = 22; box(c, mid - w / 2, Y(TOWER.top) - 56 - (k + 1) * h, w, h, R[k % 2 ? 2 : 3]); box(c, mid - w / 2, Y(TOWER.top) - 56 - (k + 1) * h, w, 2, R[4]); }
  const ky = Y(TOWER.top) - 56 - 6 * 22;
  poly(c, [[mid - 30, ky], [mid - 30, ky - 30], [mid - 15, ky - 16], [mid, ky - 36], [mid + 15, ky - 16], [mid + 30, ky - 30], [mid + 30, ky]], hour('#CA8A04'));
  box(c, mid - 30, ky - 4, 60, 4, hour('#FDE68A'));
  // (the smashed panes in the far wall: the way out, glass still in the frame's corners)
  const gy0 = Y(990), gy1 = Y(820), wx = X(4280);
  box(c, wx, gy0, 20, 6, R[1]); box(c, wx, gy1 - 6, 20, 6, R[1]); box(c, wx + 7, gy0, 6, 18, R[2]); box(c, wx + 7, gy1 - 18, 6, 18, R[2]);
  c.globalAlpha = 0.75;
  for (const [sx, sy, d] of [[wx + 1, gy0 + 6, 1], [wx + 13, gy0 + 6, 1], [wx + 1, gy1 - 6, -1], [wx + 13, gy1 - 6, -1]] as const) {
    poly(c, [[sx, sy], [sx + 6, sy], [sx + 2, sy + d * 26]], '#BAE6FD');
    poly(c, [[sx + 3, sy], [sx + 6, sy], [sx + 5, sy + d * 14]], '#E0F2FE');
  }
  c.globalAlpha = 1;
  // (the floors, the sill outside the panes, the red moldings down the outside)
  for (const [a, b, h] of FLOORS) ledge3(c, v, X(a), Y(h), b - a, '#78716C', h === 900 ? 16 : 10);
  ledge3(c, v, X(FACE[0]), Y(FACE[2]), FACE[1] - FACE[0], RED, 14);
  for (const [a, b, h] of OUTSIDE) ledge3(c, v, X(a), Y(h), b - a, RED, 12);
  // (broken glass on the sill)
  for (let k = 0; k < 5; k++) box(c, X(4310 + k * 17), Y(FACE[2]) - 2, 4, 2, '#BAE6FD');
  // (the phone on the wall up top: rattling, then ringing)
  const bl = phoneAt(f), wind = bl.st === 'wind' ? bl.t / WIND : 0;
  const jig = bl.st === 'ring' ? (bl.t % 2 ? 4 : -4) : bl.st === 'wind' ? (bl.t % 4 < 2 ? 1 : -1) * Math.round(wind * 3) : 0;
  const px = X(PHONE.x) + jig, py = Y(PHONE.h);
  box(c, X(PHONE.x) - 64, py - 50, 128, 100, dimmed('#3F3F46'));
  for (const s of [-1, 1]) {
    c.fillStyle = INK; c.beginPath(); c.arc(px + s * 26, py - 42, 19, Math.PI, 0); c.fill();
    c.fillStyle = hour('#D4D4D8'); c.beginPath(); c.arc(px + s * 26, py - 42, 17, Math.PI, 0); c.fill();
    box(c, px + s * 26 - 6, py - 54, 4, 4, '#FAFAFA');
  }
  const clap = bl.st === 'ring' ? (bl.t % 2 ? 14 : -14) : jig * 3;
  box(c, px - 2, py - 52, 4, 14, INK); box(c, px + clap * 0.5 - 4, py - 58, 8, 8, INK);
  box(c, px - 46, py - 41, 92, 82, INK); box(c, px - 45, py - 40, 90, 80, BAKELITE); box(c, px - 45, py - 40, 90, 4, '#3F3F46');
  c.fillStyle = INK; c.beginPath(); c.arc(px, py, 25, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#E7E5E4'; c.beginPath(); c.arc(px, py, 23, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 10; k++) { const a = -2.2 + (k / 10) * Math.PI * 1.6; c.fillStyle = INK; c.beginPath(); c.arc(px + Math.cos(a) * 15, py + Math.sin(a) * 15, 4, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = BAKELITE; c.beginPath(); c.arc(px, py, 7, 0, Math.PI * 2); c.fill();
  // (the empty cradle: it's off the hook)
  box(c, px + 38, py - 50, 5, 12, INK); box(c, px + 52, py - 50, 5, 12, INK); box(c, px + 36, py - 40, 24, 6, BAKELITE);
  drawStreetBits(c, v);
};

/** The signs and the phone booth on the terraced street. */
const drawStreetBits = (c: Ctx, v: View) => {
  boxes3(c, v, HOUSES.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: '#B91C1C', standable: true })));
  for (const [a, b, h] of HOUSES) if (onScreen(v, X(a), X(b))) { for (let y = Y(h) + 16; y < GY - 10; y += 20) box(c, X(a) + 6, y, b - a - 12, 14, '#E0F2FE'); }
  if (onScreen(v, X(3700), X(3860))) postBoard(c, X(3780), GY, ["THE WORLD'S TALLEST", 'TELEPHONE BOX', 'EXIT: OUT THE TOP', 'NO LIFT'], LOOKS.uk(1), '#991B1B', undefined, 140);
  if (onScreen(v, X(5250), X(5420))) postBoard(c, X(5330), GY, ['LEAVING THE UK', 'CHEERIO (HELLO)'], LOOKS.uk(1), '#991B1B', undefined, 100);
};

export const drawTowerFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame;
  if (onScreen(v, X(TOWER.a), X(TOWER.b))) {
    // (the pulley on the wall, the coiled cord down from it, the handset on the end, swinging)
    const pd = handsetAt(f), hx = X(HANDSET.x), hy = Y(HANDSET.h);
    c.fillStyle = INK; c.beginPath(); c.arc(hx, hy, 11, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#A1A1AA'; c.beginPath(); c.arc(hx, hy, 9, 0, Math.PI * 2); c.fill();
    box(c, hx - 2, hy - 2, 4, 4, INK);
    coil(c, hx, hy, pd.x, pd.y - 10);
    c.save(); c.translate(pd.x, pd.y); c.rotate(-pd.a);
    // (the handle along the top, the ear and the mouth cups hanging off its ends)
    box(c, -33, -15, 66, 15, INK); box(c, -32, -14, 64, 13, BAKELITE); box(c, -30, -13, 50, 3, '#52525B');
    for (const s of [-1, 1]) {
      box(c, s * 22 - 12, -3, 24, 26, INK); box(c, s * 22 - 11, -2, 22, 24, BAKELITE);
      box(c, s * 22 - 9, 18, 18, 4, '#3F3F46'); box(c, s * 22 - 6, 19, 3, 2, INK); box(c, s * 22 + 2, 19, 3, 2, INK);
      box(c, s * 22 - 9, 0, 3, 14, '#52525B');
    }
    c.restore();
    // (the RING going out)
    const bl = phoneAt(f);
    if (bl.st === 'ring') {
      c.globalAlpha = 1 - bl.t / RING_T; c.strokeStyle = '#FDE68A'; c.lineWidth = 6; c.beginPath(); c.arc(X(PHONE.x), Y(PHONE.h), bl.r, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = '#FEF9C3'; c.lineWidth = 2; c.beginPath(); c.arc(X(PHONE.x), Y(PHONE.h), Math.max(1, bl.r - 14), 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
    }
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
