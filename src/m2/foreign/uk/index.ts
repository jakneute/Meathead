// THE UNITED KINGDOM: section 9 of Foreign Lands' streets (flows on from France, into Canada: no walls, no doors). FOG
// rolling over all of it (the fog machine's: thin, it never hides who's there). The palace gate first: sentry boxes
// (their roofs to stand on) and ROYAL GUARDS who don't move, don't react, don't hurt to bump into... till they're hurt.
// Then the London street: red phone booths, a bus stop, and the DOUBLE-DECKER BUS running its route up and down the
// street (it reverses back, beeping): its front runs over whoever's in the way (him, the cast: the bus stop's shelter
// and the booths are out of its lane), and its roof is a ride (a hooligan up top, pints). Then THE PUB, climbed over
// (the phone booth up onto its roof, barrels down the far side), and TOWER BRIDGE (ish) over the Thames (ish): its
// two halves lift on a schedule (the bell first) and drop whoever's on them in the river; the towers' stairs up to the
// high walkway across (the dry way, whenever). The tea shop, a last guard; then BIG BENJAMIN (clocktower.ts, job 4b:
// the clock tower climbed inside past the pendulum and the bell, out through the clock face and down), to Canada.
//
// Crude (the first pass): readable boxes with full game feel. Checkpoints 80-89. Outdoors: the time of day's light.

import type { Light } from '../../../m1/game/render/lighting';
import type { GameState } from '../../../m1/game/core/state';
import type { ForeignSection } from '../section';
import { layOwn, solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { pavilionTalk } from '../pavilion';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { hazardVictims, hazardHit, boxHits, setHazardZones } from '../../hazardHit';
import { makeMover, moveMover, type Mover } from '../movers';
import { runsAround, poolSteps, poolAt, poolZones, drawPoolBack, drawPoolFront, type Pool } from '../water';
import {
  type Ctx, type View, viewIn, box, mix, poly, promenade, boxes3, ledge3, setBack, wall, hole, postBoard, hungBoard,
  LOOKS, dimmed, hour, ramp6, onScreen, FACADE_D, INK, LIP, timeOfDay,
} from '../kit';
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
  ['m2:fl_bobby', 1985, 120], ['m2:fl_hooligan', 2090, PUB.h], ['m2:fl_hooligan', 2240, PUB.h],
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
// Drawing

const BRICK = '#7C2D12', STONE = '#A8A29E', RED = '#DC2626', BRIDGEBLUE = '#60A5FA';

/** The terraces: brick and white stucco, black doors, sash windows, chimney pots. */
const drawFronts = (c: Ctx, v: View) => {
  for (const [rx, w, h, col] of [[560, 260, 200, BRICK], [900, 300, 230, '#F5F5F4'], [1260, 280, 210, BRICK], [1600, 300, 220, '#E7E5E4'], [3120, 340, 190, '#F5F5F4']] as const) setBack(c, v, X(rx), w, FACADE_D, () => {
    wall(c, 0, w, h, col, '#57534E');
    for (let k = 0; k < Math.floor(w / 60); k++) { hole(c, 18 + k * 60, -h + 28, 26, 40, true); box(c, 18 + k * 60, -h + 46, 26, 2, dimmed('#F5F5F4')); hole(c, 18 + k * 60, -h + 92, 26, 40, true); }
    box(c, w / 2 - 16, -70, 32, 70, dimmed('#111827')); box(c, w / 2 - 2, -44, 4, 4, dimmed('#CA8A04'));
    for (const cx of [30, w - 50]) { box(c, cx, -h - 30, 20, 30, dimmed(BRICK)); box(c, cx + 3, -h - 38, 5, 8, dimmed('#C2410C')); box(c, cx + 12, -h - 38, 5, 8, dimmed('#C2410C')); }
  });
};

/** A red phone booth (solid, its roof standable): the crown on top, the little panes, TELEPHONE. */
const drawBooth = (c: Ctx, v: View, a: number, b: number, h: number) => {
  if (!onScreen(v, X(a), X(b))) return;
  boxes3(c, v, [{ x: X(a), top: Y(h), w: b - a, bottom: GY, col: RED, standable: true }]);
  box(c, X(a) + 4, Y(h) + 6, b - a - 8, 8, '#1C1917'); box(c, X(a) + 10, Y(h) + 9, b - a - 20, 2, '#F8FAFC');
  for (let r = 0; r < 6; r++) for (let k = 0; k < 3; k++) box(c, X(a) + 8 + k * 12, Y(h) + 20 + r * 14, 9, 11, timeOfDay().lamps > 0.3 ? '#FEF3C7' : '#BFDBFE');
};

/** The bus: red, two decks of windows, the destination blind, the wheels turning; its roof's lip lit (a ride). */
const drawBus = (c: Ctx, v: View, m: Mover, f: number, dir: number) => {
  const x = m.x, w = BUS.w, top = m.y;
  if (!onScreen(v, x - 20, x + w + 20)) return;
  const R = ramp6(hour(RED));
  box(c, x - 1, top - 1, w + 2, GY - 10 - top + 2, INK);
  box(c, x, top, w, GY - 10 - top, R[3]); box(c, x, top, w, 4, R[4]); box(c, x, top + 70, w, 6, R[2]);
  for (let k = 0; k < 7; k++) { box(c, x + 12 + k * 40, top + 14, 32, 34, '#1E293B'); box(c, x + 12 + k * 40, top + 84, 32, 30, '#1E293B'); box(c, x + 14 + k * 40, top + 16, 10, 4, '#64748B'); }
  // (the driver's end (right), the blind, the platform at the back)
  box(c, x + w - 30, top + 84, 26, 44, '#0F172A'); box(c, x + w - 34, top + 2, 30, 10, '#111827');
  box(c, x + 6, top + 84, 22, GY - 10 - top - 84, '#7F1D1D');
  for (const wx of [x + 50, x + w - 60]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, GY - 10, 16, 0, Math.PI * 2); c.fill(); c.fillStyle = '#9CA3AF'; c.beginPath(); c.arc(wx, GY - 10, 7, 0, Math.PI * 2); c.fill(); const a = (x / 16) % (Math.PI * 2); box(c, wx + Math.cos(a) * 5 - 1, GY - 10 + Math.sin(a) * 5 - 1, 3, 3, INK); }
  box(c, x + w - 4, top + 120, 6, 8, dir !== 0 || (f >> 4) % 2 ? '#FDE68A' : '#FEF3C7');
  if (dir < 0 && (f >> 3) % 2) box(c, x - 4, top + 120, 6, 8, '#F8FAFC');
  box(c, x, top, w, 3, LIP[2]); box(c, x, top, w, 1, LIP[3]);
};

/** The bridge: its gothic towers (stone, blue trim, spires), the high walkway's blue lattice (its lip lit), the chains
 *  down to the banks, the two halves (lifting about their hinges). */
const drawBridge = (c: Ctx, v: View, f: number) => {
  if (!onScreen(v, X(2260), X(3200))) return;
  const S = ramp6(hour(STONE)), k = liftK(f), ang = k * B_MAX;
  // (the halves: each a slab turning about its hinge at its tower)
  for (const [hx, s] of [[THAMES.a, 1], [THAMES.b, -1]] as const) {
    c.save(); c.translate(hx, GY); c.rotate(-s * ang);
    const x = s > 0 ? 0 : -HALF;
    box(c, x - 1, -1, HALF + 2, 18, INK); box(c, x, 0, HALF, 16, hour('#78716C')); box(c, x, 12, HALF, 4, hour('#57534E'));
    for (let px0 = x + 10; px0 < x + HALF; px0 += 20) box(c, px0, -14, 2, 14, hour(BRIDGEBLUE));
    box(c, x, -16, HALF, 2, hour(BRIDGEBLUE));
    if (k === 0) { box(c, x, 0, HALF, 3, LIP[2]); box(c, x, 0, HALF, 1, LIP[3]); }
    c.restore();
  }
  // (the chains, sagging from the tower tops down to the banks)
  c.strokeStyle = hour(BRIDGEBLUE); c.lineWidth = 3;
  c.beginPath(); c.moveTo(X(2380), Y(TOWER_HI - 20)); c.quadraticCurveTo(X(2330), Y(200), X(2270), GY - 30); c.stroke();
  c.beginPath(); c.moveTo(X(3060), Y(TOWER_HI - 20)); c.quadraticCurveTo(X(3110), Y(200), X(3170), GY - 30); c.stroke();
  // (the towers: solid over their arches; the spires and turrets over the top, set back off it)
  for (const [a, b] of TOWERS) {
    setBack(c, v, X(a) - 10, b - a + 20, 0.96, () => {
      const w = b - a + 20;
      for (const tx of [0, w - 14]) { box(c, tx, -TOWER_HI - 70, 14, 70, dimmed(STONE)); poly(c, [[tx - 2, -TOWER_HI - 70], [tx + 7, -TOWER_HI - 100], [tx + 16, -TOWER_HI - 70]], dimmed('#334155')); }
      poly(c, [[10, -TOWER_HI], [w / 2, -TOWER_HI - 120], [w - 10, -TOWER_HI]], dimmed('#334155'));
    });
    boxes3(c, v, [{ x: X(a), top: Y(TOWER_HI), w: b - a, bottom: Y(TOWER_LO), col: STONE, standable: true }]);
    for (let y = Y(TOWER_HI) + 30; y < Y(TOWER_LO) - 30; y += 80) { box(c, X(a) + (b - a) / 2 - 6, y, 12, 30, '#1C1014'); c.fillStyle = '#1C1014'; c.beginPath(); c.arc(X(a) + (b - a) / 2, y, 6, Math.PI, 0); c.fill(); }
    // (the arch under it: the way through)
    c.fillStyle = S[1]; c.beginPath(); c.arc(X((a + b) / 2), Y(TOWER_LO), (b - a) / 2, Math.PI, 0); c.fill();
    box(c, X(a), Y(TOWER_LO), 6, TOWER_LO, S[2]); box(c, X(b) - 6, Y(TOWER_LO), 6, TOWER_LO, S[1]);
  }
  // (the high walkway: blue lattice, its deck to stand on)
  for (let x = X(TOWERS[0][1]); x < X(TOWERS[1][0]); x += 28) { c.strokeStyle = hour(BRIDGEBLUE); c.lineWidth = 2; c.beginPath(); c.moveTo(x, Y(TOWER_HI) + 4); c.lineTo(x + 28, Y(TOWER_HI) + 40); c.moveTo(x + 28, Y(TOWER_HI) + 4); c.lineTo(x, Y(TOWER_HI) + 40); c.stroke(); }
  box(c, X(TOWERS[0][1]), Y(TOWER_HI) + 40, X(TOWERS[1][0]) - X(TOWERS[0][1]), 4, hour(BRIDGEBLUE));
  ledge3(c, v, X(TOWERS[0][1]), Y(TOWER_HI), X(TOWERS[1][0]) - X(TOWERS[0][1]), BRIDGEBLUE, 8);
  for (const [a, b, h] of STAIRS) ledge3(c, v, X(a), Y(h), b - a, STONE, 10);
};

/** The fog: thin banks rolling through, low and higher up (never thick enough to hide anybody). */
const drawFog = (c: Ctx, v: View, f: number) => {
  const a = Math.max(x0, v.cam.x - 40), b = Math.min(x1, v.cam.x + CANVAS_WIDTH + 40);
  if (b <= a) return;
  for (let band = 0; band < 3; band++) {
    const y = GY - 40 - band * 150, hgt = 70 + band * 20;
    for (let x = Math.floor(a / 40) * 40; x < b; x += 40) {
      const k = 0.5 + 0.5 * Math.sin((x + f * (0.6 + band * 0.25)) * 0.006 + band * 2);
      // (thinner at the ends of the pavilion: it rolls in and out at the borders)
      const edge = Math.min(1, (x - x0) / 400, (x1 - x) / 400);
      c.globalAlpha = Math.max(0, 0.16 * k * edge);
      c.fillStyle = '#E2E8F0'; c.fillRect(x, y - hgt / 2 + Math.sin(x * 0.01 + f * 0.01) * 10, 40, hgt);
    }
  }
  c.globalAlpha = 1;
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
    const b = busAt(f), near = Math.abs(p.pos.x - b.x) < 900;
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
    promenade(c, v, x0, THAMES.a, '#CBD5E1', '#64748B');
    promenade(c, v, THAMES.b, x1, '#CBD5E1', '#64748B');
    drawFronts(c, v);
    // (the palace gate behind the guards: railings and a gold crest, set back)
    setBack(c, v, X(60), 460, 0.9, () => {
      wall(c, 0, 460, 60, '#E7E5E4');
      for (let x = 8; x < 460; x += 14) { box(c, x, -200, 3, 140, dimmed('#111827')); box(c, x - 1, -204, 5, 5, dimmed('#CA8A04')); }
      box(c, 0, -150, 460, 4, dimmed('#111827'));
      c.fillStyle = dimmed('#CA8A04'); c.beginPath(); c.arc(230, -220, 26, 0, Math.PI * 2); c.fill();
    });
    // (the sentry boxes: little pointed huts, red and black)
    boxes3(c, v, SENTRY.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: '#F5F5F4', standable: true })));
    for (const [a, b, h] of SENTRY) if (onScreen(v, X(a), X(b))) { box(c, X(a) + 10, Y(h) + 30, b - a - 20, h - 30, '#1C1014'); box(c, X(a), Y(h) + 10, b - a, 8, hour(RED)); }
    for (const [a, b, h] of BOOTHS) drawBooth(c, v, a, b, h);
    // (the bus stop: its shelter's roof (a ledge), its posts, the stop's sign)
    if (onScreen(v, X(SHELTER.a), X(SHELTER.b))) { for (const px0 of [X(SHELTER.a) + 4, X(SHELTER.b) - 8]) box(c, px0, Y(SHELTER.h), 4, SHELTER.h, hour('#1C1917')); ledge3(c, v, X(SHELTER.a), Y(SHELTER.h), SHELTER.b - SHELTER.a, '#1C1917', 6); }
    drawPoolBack(c, v, THAMES);
    if (br.bus) drawBus(c, v, br.bus, f, busAt(f).dir);
    // (the pub: dark green, gold letters' board, its windows glowing, the hanging sign; climbed over)
    if (onScreen(v, X(PUB.a), X(PUB.b))) {
      boxes3(c, v, [{ x: X(PUB.a), top: Y(PUB.h), w: PUB.b - PUB.a, bottom: GY, col: '#14532D', standable: true }]);
      for (let k = 0; k < 3; k++) box(c, X(PUB.a) + 20 + k * 80, Y(PUB.h) + 60, 54, 60, timeOfDay().lamps > 0.3 ? '#FDE68A' : '#334155');
      box(c, X(PUB.a) + 10, Y(PUB.h) + 14, PUB.b - PUB.a - 20, 30, '#0F172A');
    }
    boxes3(c, v, [{ x: X(BARRELS.a), top: Y(BARRELS.h), w: BARRELS.b - BARRELS.a, bottom: GY, col: '#78350F', standable: true }, { x: X(CART.a), top: Y(CART.h), w: CART.b - CART.a, bottom: GY, col: '#F5F5F4', standable: true }]);
    drawBridge(c, v, f);
    // (signs)
    if (onScreen(v, X(200), X(420))) postBoard(c, X(310), GY, ['UNITED KINGDOM', 'ENGLAND / BRITAIN / LONDON', '(SAME PLACE)'], LOOKS.uk(1), '#991B1B', undefined, 140);
    if (onScreen(v, X(SHELTER.a), X(SHELTER.b))) hungBoard(c, X(610), Y(SHELTER.h), Y(SHELTER.h) + 24, ['BUS STOP', 'MIND THE GAP'], LOOKS.uk(1), '#991B1B');
    if (onScreen(v, X(PUB.a), X(PUB.b))) { hungBoard(c, X((PUB.a + PUB.b) / 2), Y(PUB.h) + 14, Y(PUB.h) + 30, ["THE QUEEN'S HEAD", '(AND SHOULDERS)'], LOOKS.uk(1), '#0F172A'); }
    if (onScreen(v, X(2360), X(2440))) postBoard(c, X(2400), GY, ['TOWER BRIDGE', '(LONDON BRIDGE)', '(SAME BRIDGE)'], LOOKS.uk(1), '#1E3A8A', undefined, 150);
    if (onScreen(v, X(CART.a), X(CART.b))) hungBoard(c, X((CART.a + CART.b) / 2), Y(CART.h) - 4, Y(CART.h) - 40, ['YE OLDE TEA', 'EST. 2009'], LOOKS.uk(1), '#7F1D1D');
    drawTowerBack(c, v, state);
    if (onScreen(v, X(-60), X(60))) {
      const fx = X(20); box(c, fx - 2, GY - 200, 4, 200, hour('#9CA3AF'));
      for (let i = 0; i < 48; i += 4) { const w8 = Math.sin(f * 0.08 + i * 0.12) * 2; box(c, fx + 2 + i, GY - 198 + w8, 4, 30, hour('#012169')); box(c, fx + 2 + i, GY - 186 + w8, 4, 6, hour('#F8FAFC')); box(c, fx + 2 + i, GY - 185 + w8, 4, 4, hour('#C8102E')); if (i >= 20 && i < 28) { box(c, fx + 2 + i, GY - 198 + w8, 4, 30, hour('#F8FAFC')); box(c, fx + 3 + i, GY - 198 + w8, 2, 30, hour('#C8102E')); } }
    }
    void mix; void wall; void hole;
  },
  drawFront: (c, state) => {
    const v = viewIn(state), f = state.frame;
    drawPoolFront(c, v, THAMES, f);
    drawFog(c, v, f);
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
