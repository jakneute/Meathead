// NORWAY's far end (job 4b: the pavilions lengthened): THE TROLL TOLL BRIDGE. Past the stave church, two GIANT TROLLS
// (fiberglass, three stories) stand either side of the troll river, holding a plank bridge up on their heads. Climbed
// up the left troll (knee, shoulder, head), out onto the bridge: the TOLL GATE across it (shut: deck to crossbeam, a
// wall) and the TOLL GANG in front of it (shield vikings either end, a viking, the lutefisk lady at the booth), who
// want five dollars, or his life, mostly his life. Kill the lot and the gate goes up (TOLL PAID), and stays up (a
// fresh way into the land shuts it again). Or don't pay: down into the river under the bridge and swim it, where THE
// TROLL UNDER THE BRIDGE (an animatronic arm) sweeps across the water every few seconds (bubbles first: the tell),
// hitting whoever's in it (him: `m2:fl_troll_hand`; the cast, knocked in). Out on the far bank, up the right troll's
// knee and shoulder (the way back, too), down its far side (a shield viking on its shoulder); the drying racks, to China.

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
import { heardSpan } from '../../bossQuiet';
import { shakeScreen } from '../../../m1/game/core/state';
import { runsAround, poolSteps, poolAt, poolZones, drawPoolBack, drawPoolFront, type Pool } from '../water';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, playerIn, type Shout } from '../setpiece';
import { type Ctx, type View, box, poly, boxes3, ledge3, ledgeFront, postBoard, hungBoard, LOOKS, hour, ramp6, onScreen, INK } from '../kit';
import { drawGiant, drawDeck, drawHut, drawTollGate, drawRack, drawBoathouse, drawTrollHand } from './art';
import { V, TOLL, PAID_GAG } from './lines';

const { x0, x1 } = SECTIONS.norway;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

/** Where the old Norway ended: this starts there. */
export const TOLL_FROM = 3800;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from Norway's start, heights up from the promenade). He jumps ~145 up, ~210 across.

/** The trolls: their bodies (solid: shoulders on top), their heads (solid: the bridge sits on them), their knees
 *  (one-way) outside and in, and their elbows under the bridge (one-way: the inner knee, the elbow, the deck, a held
 *  jump each; the way up out from under the bridge, which had none: the owner's doorman stands down there). */
const TROLL_L = { body: [4120, 4300, 290], head: [4200, 4300, 420], knees: [[4020, 4120, 150], [4300, 4390, 150]], elbows: [[4300, 4366, 285]], crotch: 110 } as const;
/** The left troll's plug: the rock between its legs (a wall, the street's side shut) till the Halls of Valhalla come
 *  up, when it goes up into it on the same hydraulics (the owner: "blocks on both sides can rise. why not"), and he
 *  walks in under the bridge from that end too, along the halls' dock (valhalla.ts) to their door. */
let plugLift = 0;
/** valhalla.ts: how far up the halls are (0..1); the plug goes with them. */
export const liftPlug = (k: number) => { plugLift = k; };
/** The right troll straddles the walk under the bridge: solid only from its loincloth up (`crotch`), its legs set back
 *  either side (the owner, 2026-11-02: "just walk to the left of the troll... otherwise you cannot really get under the
 *  bridge. not sure why there's an obstacle under there": its body was a wall down to the ground, and a big toe step in
 *  front of it). From the street he walks straight in under it, onto the bank, past the doorman (valhalla.ts), to the
 *  halls' dock. Its inner knee a hop up off the bank (no toe now), the elbow, the deck: the way up from under it still. */
const TROLL_R = { body: [5000, 5180, 290], head: [5000, 5100, 420], knees: [[5180, 5280, 150], [4910, 5000, 138]], elbows: [[4934, 5000, 278]], crotch: 110 } as const;
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
  // (nobody by THE TROLL BRIDGE's checkpoint) the sampler lady up on the left troll's shoulder, lobbing down on him on
  // its knee
  ['m2:fl_lutefisk', 4160, TROLL_L.body[2]],
  // past the gate on the deck, two vikings (the second was on the right troll's inner knee, boxed in under the bridge:
  // the owner, "there is an enemy npc stuck inside the bridge area... be sure to move/remove him")
  ['m2:fl_viking', 4880, DECK.h], ['m2:fl_viking', 4960, DECK.h],
  // a shield wall of one on the right troll's shoulder: the way down off the bridge and the way up out of the river
  // both cross it (TOLL PAID's stretch by its checkpoint left quiet)
  ['m2:fl_shieldviking', 5140, TROLL_R.body[2]],
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
/** The toll's paid this way into the land (valhalla.ts: the doorman's there once he's been past it). */
export const tollPaid = paid;
/** The troll's sweep stops short of this (world x) from the right: the Halls of Valhalla's dock, once it's up. */
let armStop: number | null = null;
export const stopArmAt = (x: number | null) => { armStop = x; };

interface Toll { gate: Block | null; plug: Block | null; gang: Enemy[]; said: Shout; demanded: boolean; lift: number; hit: Set<object>; n: number }
const tollOf = (state: GameState) => foreignState<Toll>(state, 'norway-toll' as 'norway', () => ({ gate: null, plug: null, gang: [], said: newShout(), demanded: false, lift: 0, hit: new Set(), n: -1 }));

/** The arm: 'warn' (bubbles at its end), 'sweep' (its hand at world x), or under. It comes from alternate ends. */
const armAt = (f: number) => {
  const t = f % EVERY, n = Math.floor(f / EVERY), fromL = n % 2 === 0;
  const a = RIVER.a + 40, b = armStop ?? RIVER.b - 40;
  // (the halls' dock over the whole river: the troll's retired)
  if (b <= a) return { st: 'under' as const, n, x: 0, k: 0 };
  if (t < WARN) return { st: 'warn' as const, n, x: fromL ? a : b, k: t / WARN };
  if (t < WARN + RUN) { const u = (t - WARN) / RUN; return { st: 'sweep' as const, n, x: fromL ? a + (b - a) * u : b - (b - a) * u, k: Math.sin(u * Math.PI) }; }
  return { st: 'under' as const, n, x: 0, k: 0 };
};

export const buildToll = (state: GameState) => {
  const t = tollOf(state);
  poolSteps(state, RIVER);
  for (const T of [TROLL_L, TROLL_R]) {
    const [ba, bb, bh] = T.body, [ha, hb, hh] = T.head;
    solid(state, X(ba), Y(bh), bb - ba, bh - T.crotch, { hidden: true, tag: 'no-troll-body' });
    solid(state, X(ha), Y(hh), hb - ha, hh - bh, { hidden: true, tag: 'no-troll-head' });
    for (const [a, b, h] of [...T.knees, ...T.elbows]) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'no-troll-knee' });
  }
  t.plug = plugLift >= 1 ? null : solid(state, X(TROLL_L.body[0]), Y(TROLL_L.crotch), TROLL_L.body[1] - TROLL_L.body[0], TROLL_L.crotch, { hidden: true, tag: 'no-troll-plug' });
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
  const near = heardSpan(state, RIVER.a, RIVER.b);
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
  // (the left troll's plug going up into it with the halls: dust off its foot, a grind; gone once it's up)
  if (t.plug) {
    const u = Math.round(plugLift * TROLL_L.crotch);
    t.plug.h = Math.max(1, TROLL_L.crotch - u);
    if (plugLift > 0 && plugLift < 1 && f % 3 === 0) state.particles.push({ pos: { x: X(TROLL_L.body[0]) + Math.random() * (TROLL_L.body[1] - TROLL_L.body[0]), y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 34, color: Math.random() < 0.5 ? 'rgba(168,162,158,0.8)' : 'rgba(120,113,108,0.8)', size: 4 + Math.random() * 4 });
    if (plugLift > 0 && plugLift < 1 && f % 30 === 0 && heardSpan(state, X(TROLL_L.body[0]), X(TROLL_L.body[1]))) playSound('rumble', 0.4, -2);
    if (plugLift >= 1) { t.plug.y = -99999; t.plug = null; }
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

/** A giant troll (its body and head solid; the knees ledges): its rock boxes, then its features (giants in art.ts), its
 *  knees: lumps of leg sticking out, rock, lit lips. `flip`: facing left. */
const drawGiantTroll = (c: Ctx, v: View, T: typeof TROLL_L | typeof TROLL_R, flip: boolean) => {
  const [ba, bb, bh] = T.body, [ha, hb, hh] = T.head;
  if (!onScreen(v, X(Math.min(ba, ...T.knees.map(k => k[0]))) - 40, X(Math.max(bb, ...T.knees.map(k => k[1]))) + 40)) return;
  const R = ramp6(hour(TROLL));
  boxes3(c, v, [
    { x: X(ba), top: Y(bh), w: bb - ba, bottom: Y(T.crotch), col: TROLL, standable: true, look: 'rock' },
    { x: X(ha), top: Y(hh), w: hb - ha, bottom: Y(bh), col: TROLL, standable: true, look: 'rock' },
  ]);
  drawGiant(c, T.body, T.head, X, Y, flip, DECK.h, T.crotch > 0);
  // (the left troll's plug: rock between its legs, a wall, going up into it as the halls rise; clipped at its loincloth)
  if (T === TROLL_L && plugLift < 1) {
    const u = Math.round(plugLift * T.crotch);
    c.save(); c.beginPath(); c.rect(X(ba) - 40, Y(T.crotch), bb - ba + 80, T.crotch + 4); c.clip();
    boxes3(c, v, [{ x: X(ba), top: Y(T.crotch) - u, w: bb - ba, bottom: GY - u, col: TROLL, standable: false, look: 'rock' }]);
    // (its hydraulic seam: a dark line across it, a lighter one under: it's a door, painted rock)
    box(c, X(ba) + 4, Y(T.crotch / 2) - u, bb - ba - 8, 2, INK); box(c, X(ba) + 4, Y(T.crotch / 2) - u + 2, bb - ba - 8, 1, R[3]);
    c.restore();
  }
  for (const [a, b, h] of T.knees) {
    // (a straddler's knees are shallow lumps: the walk goes under them, the doorman stands under the inner one)
    const d = T === TROLL_R ? 26 : 62, d2 = d - 2;
    poly(c, [[X(a) + 6, Y(h) + 13], [X(b) - 6, Y(h) + 13], [X(b) - 18, Y(h) + d], [X(a) + 18, Y(h) + d]], INK);
    poly(c, [[X(a) + 8, Y(h) + 14], [X(b) - 8, Y(h) + 14], [X(b) - 20, Y(h) + d2], [X(a) + 20, Y(h) + d2]], R[2]);
    poly(c, [[X(a) + 8, Y(h) + 14], [X(a) + 30, Y(h) + 14], [X(a) + 34, Y(h) + d2 - 10], [X(a) + 20, Y(h) + d2]], R[3]);
    for (let k = 0; k < 3; k++) box(c, X(a) + 24 + k * ((b - a - 48) / 2), Y(h) + 17 + (k % 2) * 4, 10, 2, R[1]);
    ledge3(c, v, X(a), Y(h), b - a, TROLL, 14, 'rock');
  }
  // (the elbows under the bridge: the forearm's stump up into the deck's underside, the elbow's knob a shallow lump (the
  // doorman stands on the bank under the right troll's inner knee, by its elbow), a lit lip)
  for (const [a, b, h] of T.elbows) {
    const fa = flip ? X(b) - 26 : X(a) + 4;
    box(c, fa - 1, Y(DECK.h) + 15, 24, Y(h) - Y(DECK.h) - 13, INK); box(c, fa, Y(DECK.h) + 16, 22, Y(h) - Y(DECK.h) - 14, R[2]);
    box(c, fa, Y(DECK.h) + 16, 5, Y(h) - Y(DECK.h) - 14, R[3]); box(c, fa + 18, Y(DECK.h) + 16, 4, Y(h) - Y(DECK.h) - 14, R[1]);
    poly(c, [[X(a) + 4, Y(h) + 13], [X(b) - 4, Y(h) + 13], [X(b) - 12, Y(h) + 26], [X(a) + 12, Y(h) + 26]], INK);
    poly(c, [[X(a) + 6, Y(h) + 14], [X(b) - 6, Y(h) + 14], [X(b) - 13, Y(h) + 24], [X(a) + 13, Y(h) + 24]], R[2]);
    box(c, X(a) + 14, Y(h) + 18, b - a - 28, 2, R[1]);
    ledge3(c, v, X(a), Y(h), b - a, TROLL, 14, 'rock');
  }
  void hb; void ha; void hh; void bh; void bb;
};

export const drawTollBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(TOLL_FROM), x1)) return;
  const t = tollOf(state), f = state.frame;
  drawPoolBack(c, v, RIVER);
  // (the boathouse behind the drying racks, set back)
  drawBoathouse(c, v, X(5250));
  drawGiantTroll(c, v, TROLL_L, false);
  drawGiantTroll(c, v, TROLL_R, true);
  // (the bridge: planks on the trolls' heads, posts and rope rails)
  if (onScreen(v, X(DECK.a), X(DECK.b))) {
    // (the toll hut on the deck, set back a touch: planked, its window, its sod roof, the cash box; its sign)
    ledge3(c, v, X(DECK.a), Y(DECK.h), DECK.b - DECK.a, '#8B5E34', 16, 'plank');
    drawHut(c, v, X(BOOTH.a), BOOTH.b - BOOTH.a, Y(DECK.h));
    // (looking up at it, the hut's foot comes down past the deck's edge: the edge back over it)
    if (v.eye.y > Y(DECK.h)) ledgeFront(c, X(DECK.a), Y(DECK.h), DECK.b - DECK.a, '#8B5E34', 16, 'plank');
    drawDeck(c, X(DECK.a), X(DECK.b), Y(DECK.h));
    hungBoard(c, X((BOOTH.a + BOOTH.b) / 2), Y(DECK.h + 130), Y(DECK.h + 150), paid() ? ['TOLL PAID', '(IN BLOOD)'] : ['TROLL TOLL', '$5 OR YOUR LIFE'], LOOKS.norway(1), '#3F6212');
    // (the gate: its frame, deck to crossbeam; the gate itself, down (a wall) or lifted)
    drawTollGate(c, X(GATE.a), X(GATE.b), Y(GATE.top), Y(DECK.h), t.lift * 230);
  }
  // (signs: held up, nothing over them)
  if (onScreen(v, X(3880), X(4000))) postBoard(c, X(3940), GY, ['TROLL BRIDGE', '(THE BIG ONE)', 'TOLL AHEAD'], LOOKS.norway(1), '#3F6212', undefined, 120);
  if (onScreen(v, X(5440), X(5600))) postBoard(c, X(5520), GY, ['LEAVING NORWAY', 'NEXT: CHINA (NOT JAPAN)'], LOOKS.norway(1), '#7F1D1D', undefined, 100);
  // (the drying racks: poles, stockfish hanging under the bar he stands on)
  for (const [a, b, h] of RACKS) if (onScreen(v, X(a), X(b))) { drawRack(c, X(a), X(b), Y(h), GY); ledge3(c, v, X(a), Y(h), b - a, '#78716C', 8, 'plank'); }
  void f;
};

export const drawTollFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame, t = tollOf(state);
  if (onScreen(v, RIVER.a - 60, RIVER.b + 60)) {
    const arm = armAt(f);
    // (the arm: up out of the water, a big green hand, sweeping)
    if (arm.st === 'sweep') drawTrollHand(c, arm.x, GY + RIVER.surface, arm.k, f);
    drawPoolFront(c, v, RIVER, f, x => (arm.st === 'sweep' ? 16 * arm.k * Math.exp(-(((x - arm.x) / 60) ** 2)) : 0));
    // (the tell: bubbles boiling up where it'll come from, ringed, popping at the top)
    if (arm.st === 'warn') for (let k = 0; k < 8; k++) {
      const bx = Math.round(arm.x + Math.sin(k * 2.1 + f * 0.2) * 30), by = Math.round(GY + RIVER.surface - ((f * 2 + k * 9) % 30)), r = 2 + (k % 3);
      c.fillStyle = INK; c.beginPath(); c.arc(bx, by, r + 1, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#93C5FD'; c.beginPath(); c.arc(bx, by, r, 0, Math.PI * 2); c.fill();
      box(c, bx - r + 1, by - r + 1, 1, 1, '#FFFFFF');
    }
  }
  drawShout(c, t.said);
};

export const tollLamps = (v: View): Light[] => (onScreen(v, X(BOOTH.a), X(BOOTH.b)) ? [{ x: X(4650), y: Y(DECK.h + 70), r: 120, a: 0.45, color: '#FDE68A' }] : []);
