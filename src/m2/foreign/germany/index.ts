// GERMANY: section 4 of Foreign Lands' streets (flows on from China, into Italy: no walls, no doors). The BIERGARTEN
// (long tables to stand on, the oompah band's bandstand and its roof, barmaids lobbing steins, a slap-dancer), the
// pretzel and sausage stands, then the CASTLE: its gate's shut (a portcullis, ground to battlements), so the way on is
// up the WORLD'S BIGGEST CUCKOO CLOCK on its wall: the clock's figures (a woodcutter, a dancing couple, a beer drinker,
// a goat...) come out on a schedule, round and round on its big wheel, a sixth of a turn at a time: ride them up to
// the battlements. Over the battlements, under the clock's door: on the hour (every few seconds) the CUCKOO bursts out
// and pecks whoever's under it (him, the cast). Down the far tower's balconies (the way back up, too), the beer tent,
// the border with Italy.
//
// Crude (the first pass): readable boxes with full game feel. Checkpoints 30-39. Outdoors: the time of day's light.

import type { Light } from '../../../m1/game/render/lighting';
import type { GameState } from '../../../m1/game/core/state';
import type { ForeignSection } from '../section';
import { layOwn, solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { pavilionTalk } from '../pavilion';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hazardVictims, hazardHit, boxHits, setHazardZones } from '../../hazardHit';
import { makeMover, moveMover, type Mover } from '../movers';
import {
  type Ctx, type View, viewIn, box, mix, poly, promenade, boxes3, ledge3, setBack, wall, hole, postBoard, hungBoard, swag, flagPole,
  LOOKS, dimmed, hour, ramp6, onScreen, FACADE_D, INK,
} from '../kit';
import { TALK } from './lines';
import './kinds';

const { x0, x1 } = SECTIONS.germany;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from the section's start, heights up from the promenade). He jumps ~145 up, ~210 across.

const TABLES: [number, number, number][] = [[520, 680, 50], [1060, 1220, 50], [3150, 3310, 50]];
const STAGE = { a: 760, b: 980, h: 90, roof: 260 } as const;
const STANDS: [number, number, number, string][] = [[1340, 1480, 100, '#B45309'], [1520, 1650, 130, '#991B1B']];
const KEGS = { a: 2020, b: 2100, h: 70 } as const;
/** The cuckoo clock's wheel of figures: its hub (rx, h), its radius, how many, each platform's width. */
const WHEEL = { cx: 2300, cy: 360, r: 220, n: 6, w: 90 } as const;
/** A sixth of a turn every STEP frames (TURN of them turning, the rest stopped). */
const STEP = 180, TURN = 60;
const BATTLE = { a: 1950, b: 2740, h: 640 } as const;
const GATE = { a: 2700, b: 2740, h: 600 } as const;
/** The far tower's balconies (one-way): down from the battlements, and the way back up. */
const BALCONIES: [number, number, number][] = [[2750, 2900, 140], [2760, 2900, 280], [2750, 2900, 420], [2760, 2900, 560]];
/** The cuckoo's door (rx), the box it pecks (over the battlements); its schedule. */
const CUCKOO = { x: 2300, a: 2228, b: 2372, every: 360, warn: 45, out: 40 } as const;

const ENEMIES: [string, number, number][] = [
  ['m2:fl_slapper', 420, 0], ['m2:fl_barmaid', 600, 50], ['m2:fl_tuba', 870, STAGE.h], ['m2:fl_slapper', 1000, 0],
  ['m2:fl_barmaid', 1140, 50], ['m2:fl_tuba', 1590, 130], ['m2:fl_slapper', 1820, 0],
  ['m2:fl_barmaid', 2460, BATTLE.h], ['m2:fl_tuba', 2610, BATTLE.h],
  ['m2:fl_slapper', 3000, 0], ['m2:fl_barmaid', 3230, 50], ['m2:fl_tuba', 3500, 0], ['m2:fl_slapper', 3660, 0],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[2660, BATTLE.h, 'small_ammo'], [1410, 100, 'small_health']];

export const GERMANY_CHECKPOINTS = [
  { name: 'GERMANY', cp: 30, x: X(150), y: GY },
  { name: 'GERMANY: THE CUCKOO CLOCK', cp: 31, x: X(1750), y: GY },
  { name: 'GERMANY: THE CASTLE', cp: 32, x: X(2960), y: GY },
];

// ---------------------------------------------------------------------------------------------------------------
// The wheel and the cuckoo

interface Ger { figs: Mover[] }
const gerOf = (state: GameState) => foreignState<Ger>(state, 'germany', () => ({ figs: [] }));
const ease = (t: number) => t * t * (3 - 2 * t);
/** The wheel's turn (radians) at frame f: a sixth of a turn each STEP, turning for TURN frames of it. */
const turnAt = (f: number) => { const k = Math.floor(f / STEP), t = f % STEP; return ((k + (t < TURN ? ease(t / TURN) : 1)) * Math.PI * 2) / WHEEL.n; };
/** Figure i's platform: its top's left end (world). */
const figAt = (f: number, i: number) => {
  const a = turnAt(f) + (i * Math.PI * 2) / WHEEL.n + Math.PI / 2;
  return { x: X(WHEEL.cx) + Math.cos(a) * WHEEL.r - WHEEL.w / 2, y: Y(WHEEL.cy) - Math.sin(a) * WHEEL.r };
};
/** The cuckoo: 0 in, 'warn' its door open, 'out' pecking (and how far out, 0..1). */
const cuckooAt = (f: number) => {
  const t = f % CUCKOO.every;
  if (t < CUCKOO.warn) return { st: 'warn' as const, k: 0 };
  if (t < CUCKOO.warn + CUCKOO.out) { const u = (t - CUCKOO.warn) / CUCKOO.out; return { st: 'out' as const, k: Math.min(1, u * 4, (1 - u) * 4) }; }
  return { st: 'in' as const, k: 0 };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const WOOD = '#7C4A1E', STONE = '#B8B2A6';
const FIGS = ['woodcutter', 'couple', 'drinker', 'goat', 'hunter', 'milkmaid'] as const;

/** A carved wooden figure stood at the back of its platform (scenery on the platform: he stands in front of it). */
const drawFigure = (c: Ctx, kind: typeof FIGS[number], x: number, y: number, f: number) => {
  const W = ramp6(hour(WOOD)), sway = Math.round(Math.sin(f * 0.08) * 2);
  const body = (bx: number, col: string, h = 40) => { box(c, bx - 7, y - h, 14, h - 10, INK); box(c, bx - 6, y - h + 1, 12, h - 12, hour(col)); box(c, bx - 6, y - 10, 4, 10, W[2]); box(c, bx + 2, y - 10, 4, 10, W[2]); box(c, bx - 5, y - h - 10, 10, 10, hour('#E8C7A0')); box(c, bx - 2, y - h - 6, 2, 2, INK); };
  switch (kind) {
    case 'woodcutter': body(x + 30, '#991B1B'); box(c, x + 40, y - 46 + sway, 3, 26, W[3]); box(c, x + 38, y - 50 + sway, 10, 6, '#CBD5E1'); box(c, x + 52, y - 12, 20, 12, W[3]); break;
    case 'couple': body(x + 26, '#15803D'); body(x + 46, '#B91C1C', 36); box(c, x + 30, y - 30 + sway, 14, 3, hour('#E8C7A0')); break;
    case 'drinker': body(x + 36, '#1E3A8A'); box(c, x + 44, y - 44 - sway, 8, 12, '#F59E0B'); box(c, x + 44, y - 44 - sway, 8, 3, '#FFFFFF'); break;
    case 'goat': box(c, x + 20, y - 30, 40, 18, hour('#F5F5F4')); box(c, x + 56, y - 40 - sway, 12, 12, hour('#F5F5F4')); box(c, x + 24, y - 12, 4, 12, W[2]); box(c, x + 50, y - 12, 4, 12, W[2]); box(c, x + 60, y - 46 - sway, 2, 6, INK); break;
    case 'hunter': body(x + 34, '#166534'); box(c, x + 40, y - 46, 26, 3, W[1]); box(c, x + 29, y - 62, 12, 4, '#166534'); break;
    case 'milkmaid': body(x + 36, '#1E40AF', 38); box(c, x + 48, y - 26 + sway, 10, 10, '#D6D3D1'); break;
  }
};

/** The castle (set back): stone walls, round towers with pointy blue roofs, the gate's arch, and the giant cuckoo
 *  clock hung on its wall (its carved house, its face, the pendulum, the pine-cone weights). */
const drawCastle = (c: Ctx, v: View, f: number) => {
  setBack(c, v, X(1720), 1180, 0.93, () => {
    wall(c, 0, 1180, 600, STONE);
    for (let y = -580; y < 0; y += 22) for (let x = ((y / 22) % 2) * 20; x < 1180; x += 40) box(c, x, y, 1, 22, dimmed('#8A8478'));
    for (const [tx, w, h] of [[-40, 120, 820], [1080, 140, 860]] as const) { wall(c, tx, w, h, STONE); poly(c, [[tx - 10, -h], [tx + w / 2, -h - 150], [tx + w + 10, -h]], dimmed('#1E40AF')); for (let k = 0; k < 3; k++) hole(c, tx + w / 2 - 8, -h + 60 + k * 160, 16, 30, true); }
  });
  // (the clock's house: in front of the wall, set back a touch less; the face over the battlements)
  setBack(c, v, X(2120), 360, 0.95, () => {
    const W = ramp6(dimmed(WOOD));
    box(c, 0, -980, 360, 340, W[2]);
    poly(c, [[-30, -980], [180, -1120], [390, -980]], W[1]); poly(c, [[-20, -982], [180, -1104], [380, -982]], W[2]);
    for (let k = 0; k < 10; k++) box(c, 10 + k * 34, -980, 20, 10, W[4]);
    // (the face: numbers that don't line up, hands at the wrong time)
    c.fillStyle = dimmed('#F5F0E0'); c.beginPath(); c.arc(180, -840, 92, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; box(c, 180 + Math.cos(a) * 78 - 3, -840 + Math.sin(a) * 78 - 3, 6, 6, INK); }
    const t = f * 0.002; c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(180, -840); c.lineTo(180 + Math.cos(t * 12) * 50, -840 + Math.sin(t * 12) * 50); c.moveTo(180, -840); c.lineTo(180 + Math.cos(t) * 74, -840 + Math.sin(t) * 74); c.stroke();
    // (the pendulum swinging, the weights on their chains)
    const sw = Math.sin(f * 0.05) * 0.35;
    c.strokeStyle = dimmed('#CA8A04'); c.lineWidth = 3; c.beginPath(); c.moveTo(180, -740); c.lineTo(180 + Math.sin(sw) * 160, -740 + Math.cos(sw) * 160); c.stroke();
    c.fillStyle = dimmed('#CA8A04'); c.beginPath(); c.arc(180 + Math.sin(sw) * 160, -740 + Math.cos(sw) * 160, 18, 0, Math.PI * 2); c.fill();
    for (const wx of [60, 300]) { box(c, wx, -740, 2, 120, dimmed('#71717A')); box(c, wx - 10, -620, 22, 44, dimmed('#5C3A1A')); }
  });
};

/** The wheel: its hub and spokes (thin, set back: not somewhere to stand), each figure's platform (standable) and its
 *  carved figure. */
const drawWheel = (c: Ctx, v: View, g: Ger, f: number) => {
  if (!onScreen(v, X(WHEEL.cx - WHEEL.r - 80), X(WHEEL.cx + WHEEL.r + 80))) return;
  const cx = X(WHEEL.cx), cy = Y(WHEEL.cy);
  c.strokeStyle = dimmed(WOOD); c.lineWidth = 4;
  c.beginPath(); c.arc(cx, cy, WHEEL.r, 0, Math.PI * 2); c.stroke();
  g.figs.forEach(m => { c.beginPath(); c.moveTo(cx, cy); c.lineTo(m.x + WHEEL.w / 2, m.y + 8); c.stroke(); });
  c.fillStyle = dimmed('#CA8A04'); c.beginPath(); c.arc(cx, cy, 26, 0, Math.PI * 2); c.fill();
  g.figs.forEach((m, i) => { drawFigure(c, FIGS[i % FIGS.length], m.x, m.y, f + i * 20); ledge3(c, v, m.x, m.y, WHEEL.w, '#A16207', 10); });
};

/** The cuckoo: its little door over the battlements, open in the warning, the bird out on its arm pecking. */
const drawCuckoo = (c: Ctx, v: View, f: number) => {
  if (!onScreen(v, X(CUCKOO.a), X(CUCKOO.b))) return;
  const ck = cuckooAt(f), dx = X(CUCKOO.x), dy = Y(BATTLE.h + 150);
  const W = ramp6(hour(WOOD));
  box(c, dx - 34, dy - 40, 68, 56, INK); box(c, dx - 32, dy - 38, 64, 52, W[1]);
  if (ck.st === 'in') { box(c, dx - 26, dy - 32, 52, 44, W[3]); box(c, dx + 18, dy - 12, 4, 4, '#CA8A04'); return; }
  box(c, dx - 26, dy - 32, 52, 44, '#1C1014');
  if (ck.st === 'warn') { box(c, dx - 26 - 10, dy - 32, 10, 44, W[3]); return; }
  // (the bird, out on its arm and down over the battlements, beak first)
  const by = dy - 10 + ck.k * 100;
  box(c, dx - 2, dy - 10, 4, ck.k * 100, W[2]);
  box(c, dx - 30, by - 22, 60, 40, INK); box(c, dx - 28, by - 20, 56, 36, hour('#92400E'));
  box(c, dx - 20, by - 14, 40, 6, hour('#FCD34D'));
  for (const ex of [dx - 14, dx + 6]) { box(c, ex, by - 18, 10, 10, '#FFFFFF'); box(c, ex + 3 + Math.round(Math.sin(f * 0.6) * 2), by - 15, 4, 4, INK); }
  poly(c, [[dx - 10, by + 14], [dx + 10, by + 14], [dx, by + 36]], hour('#F59E0B'));
};

const drawGarden = (c: Ctx, v: View, f: number) => {
  promenade(c, v, x0, x1, '#D6CBB4', '#8C7F68');
  // (the fronts: half-timbered, white plaster, dark beams, flower boxes)
  for (const [rx, w, h] of [[300, 240, 180], [1240, 300, 200], [2980, 260, 170], [3400, 280, 190]] as const) setBack(c, v, X(rx), w, FACADE_D, () => {
    wall(c, 0, w, h, '#F5F0E0');
    const B = dimmed('#3F2A14');
    box(c, 0, -h, w, 6, B); box(c, 0, -h / 2, w, 5, B); for (let x = 0; x <= w; x += 60) box(c, x - 3, -h, 6, h, B);
    for (let x = 0; x < w - 60; x += 60) { c.strokeStyle = B; c.lineWidth = 4; c.beginPath(); c.moveTo(x, -h / 2); c.lineTo(x + 60, -h); c.stroke(); }
    poly(c, [[-14, -h], [w / 2, -h - 80], [w + 14, -h]], dimmed('#7F1D1D'));
    hole(c, w / 2 - 20, -74, 40, 74, true);
    for (const wx of [24, w - 56]) { hole(c, wx, -h + 30, 32, 30, true); box(c, wx - 2, -h + 60, 36, 6, dimmed('#DC2626')); }
  });
  drawCastle(c, v, f);
  // (the tables: standable; benches either side (scenery), the bandstand, its posts, its roof)
  boxes3(c, v, [
    ...TABLES.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: '#92400E', standable: true })),
    { x: X(STAGE.a), top: Y(STAGE.h), w: STAGE.b - STAGE.a, bottom: GY, col: '#1E3A8A', standable: true },
    ...STANDS.map(([a, b, h, col]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col, standable: true })),
    { x: X(KEGS.a), top: Y(KEGS.h), w: KEGS.b - KEGS.a, bottom: GY, col: '#78350F', standable: true },
  ]);
  for (const [a, b] of TABLES) if (onScreen(v, X(a), X(b))) for (const bx of [X(a) - 26, X(b) + 6]) box(c, bx, GY - 24, 20, 6, dimmed('#78350F'));
  if (onScreen(v, X(STAGE.a), X(STAGE.b))) {
    for (const px0 of [X(STAGE.a) + 6, X(STAGE.b) - 12]) { box(c, px0 - 1, Y(STAGE.roof), 8, STAGE.roof - STAGE.h, INK); box(c, px0, Y(STAGE.roof), 6, STAGE.roof - STAGE.h, hour('#F5F5F4')); }
    poly(c, [[X(STAGE.a - 20), Y(STAGE.roof) + 16], [X(STAGE.b + 20), Y(STAGE.roof) + 16], [X(STAGE.b), Y(STAGE.roof)], [X(STAGE.a), Y(STAGE.roof)]], hour('#1E40AF'));
    for (let k = 0; k < 11; k++) box(c, X(STAGE.a - 20) + k * 24, Y(STAGE.roof) + 16, 12, 8, hour(k % 2 ? '#F8FAFC' : '#1E40AF'));
    ledge3(c, v, X(STAGE.a), Y(STAGE.roof), STAGE.b - STAGE.a, '#1E40AF', 6);
  }
  for (const [a, b, h, col] of STANDS) if (onScreen(v, X(a), X(b))) { for (let k = 0; k < 6; k++) box(c, X(a) - 4 + k * 25, Y(h) + 6, 22, 10, dimmed(k % 2 ? '#F8FAFC' : col)); }
  if (onScreen(v, X(1340), X(1480))) { c.strokeStyle = '#B45309'; c.lineWidth = 6; c.beginPath(); c.arc(X(1410), Y(100) - 50, 20, 0, Math.PI * 2); c.stroke(); }
  // (Bavarian blue-and-white bunting over the garden)
  for (let rx = 380; rx < 1300; rx += 300) if (onScreen(v, X(rx), X(rx + 300))) swag(c, X(rx), Y(230), X(rx + 300), Y(230), 22, ['#2563EB', '#F8FAFC'], 'flags');
  void mix;
};

export const germany: ForeignSection = {
  id: 'germany', x0, x1,
  checkpoints: GERMANY_CHECKPOINTS,
  build: (state) => {
    layOwn(state, [{ x1: x0, y1: GY, x2: x1, y2: GY, surface: 'hard' }]);
    for (const [a, b, h] of TABLES) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'de-table' });
    solid(state, X(STAGE.a), Y(STAGE.h), STAGE.b - STAGE.a, STAGE.h, { hidden: true, tag: 'de-stage' });
    ledge(state, X(STAGE.a), Y(STAGE.roof), STAGE.b - STAGE.a, { hidden: true, tag: 'de-roof' });
    for (const [a, b, h] of STANDS) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'de-stand' });
    solid(state, X(KEGS.a), Y(KEGS.h), KEGS.b - KEGS.a, KEGS.h, { hidden: true, tag: 'de-kegs' });
    ledge(state, X(BATTLE.a), Y(BATTLE.h), BATTLE.b - BATTLE.a, { hidden: true, tag: 'de-battlements' });
    solid(state, X(GATE.a), Y(GATE.h), GATE.b - GATE.a, GATE.h, { hidden: true, tag: 'de-portcullis' });
    for (const [a, b, h] of BALCONIES) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'de-balcony' });
    const g = gerOf(state);
    g.figs = Array.from({ length: WHEEL.n }, (_, i) => { const p = figAt(state.frame, i); return makeMover(state, p.x, p.y, WHEEL.w, 'de-figure'); });
    spawnCast(state, ENEMIES, X, Y);
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `de-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, g = gerOf(state), f = state.frame;
    pavilionTalk(state, 'de', x0, GY, TALK);
    // The wheel: a sixth of a turn at a time (a clunk as each turn starts)
    g.figs.forEach((m, i) => { const q = figAt(f, i); moveMover(state, m, q.x, q.y); });
    if (f % STEP === 0 && Math.abs(p.pos.x - X(WHEEL.cx)) < 900) playSound('clang', 0.4, -10);
    // The cuckoo: the door's click, then out and pecking; its box a danger zone (the cast keep out from the click on)
    const ck = cuckooAt(f), za = X(CUCKOO.a), zb = X(CUCKOO.b), zy = Y(BATTLE.h + 120);
    if (ck.st !== 'in') setHazardZones(state, 'de-cuckoo', [{ x0: za, x1: zb, y0: zy, y1: Y(BATTLE.h) + 4 }]);
    const near = Math.abs(p.pos.x - X(CUCKOO.x)) < 900;
    if (f % CUCKOO.every === 0 && near) playSound('click', 0.6, -6);
    if (f % CUCKOO.every === CUCKOO.warn && near) { playSound('horn', 0.5, 14); setTimeout(() => playSound('horn', 0.5, 10), 260); }
    if (ck.st === 'out' && ck.k > 0.7) {
      const by = Y(BATTLE.h + 150) - 10 + ck.k * 100, bx0 = X(CUCKOO.x) - 30, bw = 60, bh = 60;
      if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && p.pos.x < bx0 + bw && p.pos.x + p.width > bx0 && p.pos.y < by + 36 && p.pos.y + p.height > by - 22) {
        hurtPlayer(ctx, 10, 'm2:fl_cuckoo', { x: Math.sign(p.pos.x + p.width / 2 - X(CUCKOO.x)) * 9 || 9, y: -5 }, 22);
        shakeScreen(state, 5, 3);
      }
      for (const e of hazardVictims(state)) if (boxHits(e, bx0, by - 22, bw, bh)) hazardHit(ctx, e, 35, X(CUCKOO.x), "CUCKOO'D!", { color: '#FCD34D' });
    }
    return controls;
  },
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame;
    drawGarden(c, v, f);
    // (the battlements: the walk along the castle's top, its merlons behind; the portcullis, iron, ground to top)
    if (onScreen(v, X(BATTLE.a), X(BATTLE.b))) {
      for (let x = X(BATTLE.a); x < X(BATTLE.b); x += 40) box(c, x, Y(BATTLE.h) - 30, 22, 30, dimmed(STONE));
      ledge3(c, v, X(BATTLE.a), Y(BATTLE.h), BATTLE.b - BATTLE.a, STONE, 20);
    }
    if (onScreen(v, X(GATE.a) - 40, X(GATE.b) + 40)) {
      const S = ramp6(hour(STONE));
      box(c, X(GATE.a) - 30, Y(BATTLE.h) + 20, 30, BATTLE.h - 20, S[2]); box(c, X(GATE.b), Y(BATTLE.h) + 20, 20, BATTLE.h - 20, S[1]);
      box(c, X(GATE.a), Y(GATE.h), GATE.b - GATE.a, GATE.h, '#1C1014');
      for (let x = X(GATE.a) + 2; x < X(GATE.b); x += 9) box(c, x, Y(GATE.h), 4, GATE.h, '#3F3F46');
      for (let y = Y(GATE.h) + 6; y < GY; y += 26) box(c, X(GATE.a), y, GATE.b - GATE.a, 4, '#3F3F46');
      for (let x = X(GATE.a) + 2; x < X(GATE.b); x += 9) poly(c, [[x, GY - 4], [x + 4, GY - 4], [x + 2, GY]], '#71717A');
    }
    // (the far tower and its balconies)
    if (onScreen(v, X(2740), X(2920))) {
      setBack(c, v, X(2745), 170, 0.95, () => { wall(c, 0, 170, 640, STONE); poly(c, [[-10, -640], [85, -800], [180, -640]], dimmed('#1E40AF')); });
      for (const [a, b, h] of BALCONIES) { ledge3(c, v, X(a), Y(h), b - a, '#78716C', 10); for (let x = X(a) + 6; x < X(b); x += 16) box(c, x, Y(h) - 16, 2, 16, dimmed('#3F3F46')); }
    }
    drawWheel(c, v, gerOf(state), f);
    // (signs)
    if (onScreen(v, X(100), X(320))) postBoard(c, X(200), GY, ['GERMANY', 'OKTOBERFEST: ALL YEAR'], LOOKS.germany(2), '#1C1917');
    if (onScreen(v, X(400), X(500))) postBoard(c, X(450), GY, ['BIERGARTEN', 'NO OUTSIDE BIER'], LOOKS.germany(1), '#14532D', undefined, 90);
    if (onScreen(v, X(1340), X(1480))) hungBoard(c, X(1410), Y(100) - 6, Y(100) + 30, ['PRETZELS', 'GERMAN FRENCH FRIES'], LOOKS.germany(1), '#78350F');
    if (onScreen(v, X(1520), X(1650))) hungBoard(c, X(1585), Y(130) - 6, Y(130) + 30, ['WURST', 'THE WURST IN TOWN'], LOOKS.germany(1), '#7F1D1D');
    if (onScreen(v, X(1760), X(1960))) postBoard(c, X(1860), GY, ["WORLD'S BIGGEST", 'CUCKOO CLOCK', 'SWISS MADE'], LOOKS.germany(1), '#3F2A14', undefined, 130);
    if (onScreen(v, X(2560), X(2700))) postBoard(c, X(2620), GY, ['CASTLE CLOSED', 'USE THE CLOCK'], LOOKS.germany(1), '#7F1D1D', undefined, 80);
    if (onScreen(v, X(3560), X(3800))) postBoard(c, X(3680), GY, ['LEAVING GERMANY', 'AUF WIEDERSEHEN', '(GOODBYE IN DUTCH)'], LOOKS.germany(1), '#1C1917', undefined, 120);
    if (onScreen(v, X(20), X(120))) flagPole(c, X(40), GY, 200, ['#000000', '#DD0000', '#FFCE00'], f);
  },
  drawFront: (c, state) => { drawCuckoo(c, viewIn(state), state.frame); },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    if (onScreen(v, X(STAGE.a), X(STAGE.b))) out.push({ x: X(870), y: Y(200), r: 170, a: 0.5, color: '#FDE68A' });
    if (onScreen(v, X(2100), X(2500))) out.push({ x: X(2300), y: Y(860), r: 200, a: 0.4, color: '#FDE68A' });
    return out;
  },
};
