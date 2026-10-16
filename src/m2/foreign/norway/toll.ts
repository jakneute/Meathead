// NORWAY's far end (job 4b: the pavilions lengthened): THE TROLL TOLL BRIDGE. Past the stave church, two GIANT TROLLS
// (fiberglass, three stories) stand either side of the troll river, holding a plank bridge up on their heads. Climbed
// up the left troll (knee, shoulder, head), out onto the bridge: the TOLL GATE across it (shut: deck to crossbeam, a
// wall) and the TOLL GANG in front of it (shield vikings either end, a viking, the lutefisk lady at the booth), who
// want five dollars, or his life, mostly his life. Kill the lot and the gate goes up (TOLL PAID), and stays up (a
// fresh way into the land shuts it again). Or don't pay: down into the river under the bridge and swim it, where THE
// TROLL UNDER THE BRIDGE (an animatronic arm) sweeps across the water every few seconds (bubbles first: the tell),
// hitting whoever's in it (him: `m2:fl_troll_hand`; the cast, knocked in). Out on the far bank, up the right troll's
// knee and shoulder (the way back, too), down its far side; the drying racks, the last of the vikings, to China.

import type { Light } from '../../../m1/game/render/lighting';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import type { GroundRun } from '../../../m1/game/core/terrain';
import { solid, ledge, foreignState, landVisit } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { byPants } from '../cast';
import { gag } from '../state';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { runsAround, poolSteps, poolAt, poolZones, drawPoolBack, drawPoolFront, type Pool } from '../water';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, playerIn, type Shout } from '../setpiece';
import { type Ctx, type View, box, poly, boxes3, ledge3, setBack, wall, hole, postBoard, hungBoard, LOOKS, dimmed, hour, ramp6, onScreen, INK } from '../kit';
import { V, TOLL, PAID_GAG } from './lines';

const { x0, x1 } = SECTIONS.norway;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

/** Where the old Norway ended: this starts there. */
export const TOLL_FROM = 3800;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from Norway's start, heights up from the promenade). He jumps ~145 up, ~210 across.

/** The trolls: their bodies (solid: shoulders on top), their heads (solid: the bridge sits on them), their knees
 *  (one-way) outside and in. */
const TROLL_L = { body: [4120, 4300, 290], head: [4200, 4300, 420], knees: [[4020, 4120, 150], [4300, 4390, 150]] } as const;
const TROLL_R = { body: [5000, 5180, 290], head: [5000, 5100, 420], knees: [[5180, 5280, 150], [4910, 5000, 150]] } as const;
const DECK = { a: 4300, b: 5000, h: 420 } as const;
/** The toll gate across the deck (solid, deck to crossbeam), the booth beside it (set back on the deck). */
const GATE = { a: 4740, b: 4764, top: 660 } as const;
const BOOTH = { a: 4600, b: 4700 } as const;
export const RIVER: Pool = { key: 'trollriver', a: X(4400), b: X(4900), surface: 30, bed: 200, col: '#1E3A8A', wall: '#57534E' };
/** The troll under the bridge: a sweep every EVERY frames, WARN of bubbles at the end it comes from, RUN across. */
const EVERY = 270, WARN = 55, RUN = 55;
const RACKS: [number, number, number][] = [[5320, 5440, 110]];

const GANG: [string, number, number][] = [
  ['m2:fl_shieldviking', 4380, DECK.h], ['m2:fl_viking', 4500, DECK.h], ['m2:fl_lutefisk', 4610, DECK.h], ['m2:fl_shieldviking', 4700, DECK.h],
];
const ENEMIES: [string, number, number][] = [
  ['m2:fl_viking', 3900, 0], ['m2:fl_lutefisk', 4000, 0],
  ['m2:fl_viking', 4880, DECK.h],
  ['m2:fl_shieldviking', 5300, 0], ['m2:fl_viking', 5380, RACKS[0][2]], ['m2:fl_viking', 5500, 0],
];

export const TOLL_CHECKPOINTS = [
  { name: 'NORWAY: THE TROLL BRIDGE', cp: 13, x: X(3880), y: GY },
  { name: 'NORWAY: TOLL PAID', cp: 14, x: X(5320), y: GY },
];

export const tollRuns = (): GroundRun[] => runsAround(X(TOLL_FROM), x1, [RIVER]);

// ---------------------------------------------------------------------------------------------------------------
// The toll and the troll

/** The toll's paid this way into the land (outlives a death: the gate stays up, the gang stays dead). */
let paidVisit = -1;
const paid = () => paidVisit === landVisit();

interface Toll { gate: Block | null; gang: Enemy[]; said: Shout; demanded: boolean; lift: number; hit: Set<object>; n: number }
const tollOf = (state: GameState) => foreignState<Toll>(state, 'norway-toll' as 'norway', () => ({ gate: null, gang: [], said: newShout(), demanded: false, lift: 0, hit: new Set(), n: -1 }));

/** The arm: 'warn' (bubbles at its end), 'sweep' (its hand at world x), or under. It comes from alternate ends. */
const armAt = (f: number) => {
  const t = f % EVERY, n = Math.floor(f / EVERY), fromL = n % 2 === 0;
  const a = RIVER.a + 40, b = RIVER.b - 40;
  if (t < WARN) return { st: 'warn' as const, n, x: fromL ? a : b, k: t / WARN };
  if (t < WARN + RUN) { const u = (t - WARN) / RUN; return { st: 'sweep' as const, n, x: fromL ? a + (b - a) * u : b - (b - a) * u, k: Math.sin(u * Math.PI) }; }
  return { st: 'under' as const, n, x: 0, k: 0 };
};

export const buildToll = (state: GameState) => {
  const t = tollOf(state);
  poolSteps(state, RIVER);
  for (const T of [TROLL_L, TROLL_R]) {
    const [ba, bb, bh] = T.body, [ha, hb, hh] = T.head;
    solid(state, X(ba), Y(bh), bb - ba, bh, { hidden: true, tag: 'no-troll-body' });
    solid(state, X(ha), Y(hh), hb - ha, hh - bh, { hidden: true, tag: 'no-troll-head' });
    for (const [a, b, h] of T.knees) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'no-troll-knee' });
  }
  ledge(state, X(DECK.a), Y(DECK.h), DECK.b - DECK.a, { hidden: true, tag: 'no-tolldeck' });
  t.gate = paid() ? null : solid(state, X(GATE.a), Y(GATE.top), GATE.b - GATE.a, GATE.top - DECK.h, { hidden: true, tag: 'no-tollgate' });
  t.lift = paid() ? 1 : 0;
  for (const [a, b, h] of RACKS) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'no-rack' });
  const n = state.enemies.length;
  if (!paid()) spawnCast(state, GANG, X, Y);
  t.gang = state.enemies.slice(n);
  spawnCast(state, ENEMIES, X, Y);
  placePickups(state, 'no', X, Y, [[4230, TROLL_L.head[2], 'small_ammo'], [5100, TROLL_R.body[2], 'small_health']]);
};

export const updateToll = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, f = state.frame, t = tollOf(state);
  poolZones(state, 'no-trollriver', [RIVER]);
  const near = Math.abs(p.pos.x - (RIVER.a + RIVER.b) / 2) < 1100;
  // (up on the bridge: the gang's demand, once)
  if (!t.demanded && !paid() && playerIn(state, X(DECK.a), Y(DECK.h) - 140, 300, 150)) {
    const caller = t.gang.find(e => e.health > 0);
    if (caller) { t.demanded = true; shout(state, t.said, V.viking.m, byPants(state, TOLL), caller.pos.x + caller.width / 2, caller.pos.y - 18); }
  }
  // (the gang all dead: the gate goes up)
  if (!paid() && t.gang.length && t.gang.every(e => e.health <= 0 || e.isBlownAway)) {
    paidVisit = landVisit();
    playSound('clang', 0.8, -8); playSound('rumble', 0.6, 0); shakeScreen(state, 4, 3);
    gag(state, 'no-paid', PAID_GAG);
  }
  if (paid()) {
    t.lift = Math.min(1, t.lift + 1 / 70);
    if (t.gate && t.lift >= 1) { t.gate.y = -99999; t.gate = null; }
  }
  // (the troll under the bridge)
  const arm = armAt(f);
  if (arm.n !== t.n) { t.n = arm.n; t.hit.clear(); }
  if (arm.st === 'warn' && near && f % 12 === 0) playSound('glug', 0.4, -6);
  if (arm.st === 'sweep') {
    if (near && f % EVERY === WARN) { playSound('splash', 0.8, -10); playSound('roar', 0.5, -12); }
    const top = GY + RIVER.surface - 50;
    if (!t.hit.has(p) && hurtIn(ctx, arm.x - 45, top, 90, 120, 10, 'm2:fl_troll_hand', { x: (arm.n % 2 === 0 ? 1 : -1) * 10, y: -7 }, 24)) t.hit.add(p);
    hitCastIn(ctx, arm.x - 45, top, 90, 120, 34, arm.x - (arm.n % 2 === 0 ? 1 : -1) * 60, 'TROLLED!', '#86EFAC', t.hit);
  }
};

export const tollWater = (x: number, y: number) => poolAt([RIVER], x, y);

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const TROLL = '#6B7F5E';

/** A giant troll (its body and head solid; the knees ledges): lumpy, mossy, a huge nose, tiny eyes, its arms up to the
 *  deck, a loincloth. `flip`: facing left. */
const drawGiant = (c: Ctx, v: View, T: typeof TROLL_L | typeof TROLL_R, flip: boolean) => {
  const [ba, bb, bh] = T.body, [ha, hb, hh] = T.head;
  if (!onScreen(v, X(Math.min(ba, ...T.knees.map(k => k[0]))), X(Math.max(bb, ...T.knees.map(k => k[1]))))) return;
  const R = ramp6(hour(TROLL));
  boxes3(c, v, [
    { x: X(ba), top: Y(bh), w: bb - ba, bottom: GY, col: TROLL, standable: true },
    { x: X(ha), top: Y(hh), w: hb - ha, bottom: Y(bh), col: TROLL, standable: true },
  ]);
  // (the legs down to the ground, the loincloth, the belly)
  box(c, X(ba) + 20, Y(110), 50, 110, R[1]); box(c, X(bb) - 70, Y(110), 50, 110, R[1]);
  box(c, X(ba), Y(150), bb - ba, 40, hour('#78350F')); for (let k = 0; k < 6; k++) box(c, X(ba) + 8 + k * 28, Y(112), 18, 6, hour('#92400E'));
  // (the face on the head: the nose, the eyes, the tusks; moss for hair)
  const hx = (X(ha) + X(hb)) / 2;
  box(c, hx - 16 + (flip ? -10 : 10), Y(hh) + 40, 32, 46, R[4]); box(c, hx - 16 + (flip ? -10 : 10), Y(hh) + 40, 32, 3, R[5]);
  for (const ex of [hx - 26, hx + 18]) { box(c, ex, Y(hh) + 30, 8, 6, INK); box(c, ex + 2, Y(hh) + 31, 2, 2, '#FDE047'); }
  box(c, hx - 24, Y(hh) + 96, 6, 14, '#F5F5F4'); box(c, hx + 18, Y(hh) + 96, 6, 14, '#F5F5F4');
  for (let k = 0; k < 6; k++) box(c, X(ha) + 4 + k * 17, Y(hh) - 6 - (k % 2) * 4, 12, 7, dimmed('#3F6212'));
  // (the knees: lumps of leg sticking out, lit lips)
  for (const [a, b, h] of T.knees) { poly(c, [[X(a) + 8, Y(h) + 14], [X(b) - 8, Y(h) + 14], [X(b) - 20, Y(h) + 60], [X(a) + 20, Y(h) + 60]], R[2]); ledge3(c, v, X(a), Y(h), b - a, TROLL, 14); }
};

export const drawTollBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(TOLL_FROM), x1)) return;
  const t = tollOf(state), f = state.frame;
  drawPoolBack(c, v, RIVER);
  // (the drying racks' far fronts: stockfish on poles, dimmed)
  setBack(c, v, X(5250), 300, 0.9, () => { wall(c, 0, 300, 160, '#9F1239'); poly(c, [[-10, -160], [150, -260], [310, -160]], dimmed('#292524')); hole(c, 130, -72, 40, 72, true); });
  drawGiant(c, v, TROLL_L, false);
  drawGiant(c, v, TROLL_R, true);
  // (the bridge: planks on the trolls' heads, ropes for rails)
  if (onScreen(v, X(DECK.a), X(DECK.b))) {
    ledge3(c, v, X(DECK.a), Y(DECK.h), DECK.b - DECK.a, '#8B5E34', 16);
    for (let x = X(DECK.a); x < X(DECK.b); x += 26) box(c, x, Y(DECK.h) + 2, 1, 14, hour('#5C3A1A'));
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(X(DECK.a), Y(DECK.h) - 40);
    for (let x = X(DECK.a); x <= X(DECK.b); x += 70) c.quadraticCurveTo(x + 35, Y(DECK.h) - 26, x + 70, Y(DECK.h) - 40);
    c.stroke();
    // (the toll booth on the deck, set back a touch: a hut, its window, its sign)
    setBack(c, v, X(BOOTH.a), BOOTH.b - BOOTH.a, 0.96, () => { c.save(); c.translate(0, -DECK.h); wall(c, 0, BOOTH.b - BOOTH.a, 110, '#9F1239', '#F5F5F4'); hole(c, 20, -84, 60, 34, true); c.restore(); });
    hungBoard(c, X((BOOTH.a + BOOTH.b) / 2), Y(DECK.h + 130), Y(DECK.h + 150), paid() ? ['TOLL PAID', '(IN BLOOD)'] : ['TROLL TOLL', '$5 OR YOUR LIFE'], LOOKS.norway(1), '#3F6212');
    // (the gate: its frame, deck to crossbeam; the gate itself, down (a wall) or lifted)
    const P = ramp6(hour('#78350F')), lift = t.lift * 230;
    box(c, X(GATE.a) - 14, Y(GATE.top) - 16, 12, GATE.top - DECK.h + 16, P[2]); box(c, X(GATE.b) + 2, Y(GATE.top) - 16, 12, GATE.top - DECK.h + 16, P[1]);
    box(c, X(GATE.a) - 20, Y(GATE.top) - 22, GATE.b - GATE.a + 40, 12, P[3]);
    const gTop = Y(GATE.top) - lift, gH = GATE.top - DECK.h;
    box(c, X(GATE.a), gTop, GATE.b - GATE.a, gH, INK);
    for (let k = 0; k < gH; k += 30) box(c, X(GATE.a) + 2, gTop + k, GATE.b - GATE.a - 4, 15, k % 60 ? '#F5F5F4' : '#DC2626');
  }
  // (signs: held up, nothing over them)
  if (onScreen(v, X(3880), X(4000))) postBoard(c, X(3940), GY, ['TROLL BRIDGE', '(THE BIG ONE)', 'TOLL AHEAD'], LOOKS.norway(1), '#3F6212', undefined, 120);
  if (onScreen(v, X(5440), X(5600))) postBoard(c, X(5520), GY, ['LEAVING NORWAY', 'NEXT: CHINA (NOT JAPAN)'], LOOKS.norway(1), '#7F1D1D', undefined, 100);
  // (the drying racks: poles, stockfish hanging under the bar he stands on)
  for (const [a, b, h] of RACKS) if (onScreen(v, X(a), X(b))) { for (const px0 of [X(a) + 4, X(b) - 8]) box(c, px0, Y(h), 4, h, hour('#57534E')); for (let x = X(a) + 12; x < X(b) - 10; x += 14) box(c, x, Y(h) + 12, 6, 30, hour('#D6D3D1')); ledge3(c, v, X(a), Y(h), b - a, '#78716C', 8); }
  void f;
};

export const drawTollFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame, t = tollOf(state);
  if (onScreen(v, RIVER.a - 60, RIVER.b + 60)) {
    const arm = armAt(f);
    // (the arm: up out of the water, a big green hand, sweeping)
    if (arm.st === 'sweep') {
      const R = ramp6(hour(TROLL)), sy = GY + RIVER.surface, up = 70 * arm.k;
      box(c, arm.x - 18, sy - up, 36, up + 40, R[2]);
      box(c, arm.x - 40, sy - up - 40, 80, 46, INK); box(c, arm.x - 38, sy - up - 38, 76, 42, R[3]);
      for (let k = 0; k < 4; k++) box(c, arm.x - 36 + k * 19, sy - up - 60, 14, 24, R[3]);
      for (let k = 0; k < 4; k++) box(c, arm.x - 36 + k * 19, sy - up - 62, 14, 4, '#F5F5F4');
    }
    drawPoolFront(c, v, RIVER, f, x => (arm.st === 'sweep' ? 16 * arm.k * Math.exp(-(((x - arm.x) / 60) ** 2)) : 0));
    if (arm.st === 'warn') for (let k = 0; k < 6; k++) { const bx = arm.x + Math.sin(k * 2.1 + f * 0.2) * 30, by = GY + RIVER.surface - ((f * 2 + k * 9) % 26); box(c, bx, by, 5, 5, '#BFDBFE'); }
  }
  drawShout(c, t.said);
};

export const tollLamps = (v: View): Light[] => (onScreen(v, X(BOOTH.a), X(BOOTH.b)) ? [{ x: X(4650), y: Y(DECK.h + 70), r: 120, a: 0.45, color: '#FDE68A' }] : []);
