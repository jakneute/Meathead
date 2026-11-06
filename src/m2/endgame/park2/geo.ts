// The water park, level 2: THE LAZY RIVER, set on fire by Satan's goth son (the owner's brief, 2026-11-05). Where
// everything is (pure data, world space; GY the deck's top, the river's burning surface a little under it). It runs on
// from level 1's world (endgame/park1/geo.ts: the splashdown at the foot of MOUNT EVEREST BUT BETTER, the gate building
// at L2.wall): one continuous run. Read it left to right (each x here is from B, the gate building's far side):
//
//   THE MEETING     through the gate (its shutter's up now): the deck along the river's head, the tube rental. The son
//                   (MEHPHISTO) on the dock at its end, vaping: the cutscene (meet.ts), the river goes up, he slouches off.
//   THE VINES       the river's first stretch: jungle-themed, burning palms hung with vines over it. Taught with one, then
//                   two in a chain, a long swing, vines that catch fire once he's on them (and snap), fire jets up out of
//                   the river under them, a chain of quick-burning ones. (Jungle Land's vines, harder.)
//   THE LOGS        burning palm trunks floating on it: stand on one, walk, it rolls you along (Wilderness Land's rolling
//                   logs); it catches under him, smolders, flames and crumbles (stand on it too long and it's gone).
//                   Taught alone, then two to hop between, then three with imps diving and burning beams to duck.
//   THE TOWERS      the TIKI TOWERS: swaying stacks of pool floats on poles stood up out of the river (Cartoon Land's
//                   stack-towers): he lands, it leans his way, and it burns (from the foot, or from the top: shorter).
//   THE MIX         all three mixed (log to towers, vines to a log, towers and vines), enemies on every deck.
//   THE GROTTO      a big refill, then the son's hangout: the river's cave, his smoky lounge (the boss: boss.ts).
//   THE COAST       both brothers dead, twisted into a pool float: down the river's last stretch on them, a beer.
//   LEVEL 3         (a stub: the owner designs it) the landing at the river's end, a maintenance tunnel's door, shut.
//
// The river's surface (RIVER_Y) is on fire the whole way: touched, he's burned to death (it reads: flames over all of
// it, nothing swims in it). Bottomless? No: a death (a set-piece death, its own death screen), the body left in the
// flames. The checkpoints (CP2) match endgame/stages.ts's park2 and park3 lists.

import { GROUND_Y } from '../../../m1/constants';
import { L2_CP, L3_CP } from '../stages';
import { L2 } from '../park1/geo';

export const GY = GROUND_Y;
/** Where level 2's own x is measured from: just past the gate building (L2.wall: its arch). */
export const B = L2.wall + 200;
const X = (r: number) => B + r;
/** Where level 2 takes over from level 1 (world x): the deck past the splashdown's pool (him walking on out of it). */
export const L2_FROM = 37700;
/** The river's burning surface (feet below it: dead), and the floor of it (hidden: where a body comes to rest). */
export const RIVER_Y = GY + 34;
export const RIVER_BED = GY + 96;

// ---------------------------------------------------------------------------------------------------------------
// The checkpoints

export const CP2 = { start: L2_CP, river: 41, canopy: 42, logJam: 43, bar: 44, tiki: 45, soup: 46, bend: 47, grotto: 48, L3: L3_CP } as const;

// ---------------------------------------------------------------------------------------------------------------
// The decks (flat runs at GY); between them, the burning river

/** [x1, x2] runs of deck at GY (level 1's last run, up to the river's head, is its own: park1/geo.ts GROUND). */
export const DECKS: [number, number][] = [
  [X(1850), X(2150)], [X(2850), X(3200)], [X(4100), X(4500)], [X(5400), X(6400)], [X(7400), X(7700)], [X(8800), X(9300)],
  [X(10200), X(10600)], [X(12200), X(12600)], [X(14400), X(15200)],
  [X(15650), X(15950)], [X(16900), X(17300)], [X(18500), X(19700)], [X(20900), X(21300)],
  [X(23000), X(24200)], [X(26000), X(26400)],
  // (the last deck: the refill, the grotto's door; the grotto itself, its floor (its back opens onto the river's last
  // stretch, which he coasts down on the son's and his brother's bodies: boss.ts); the river's end, a landing, the
  // maintenance tunnel's door (level 3's stub))
  [X(28000), X(29870)], [X(31400), X(32300)],
];
/** How far each deck stands below GY (the owner, 2026-11-05: "throw in a bit more verticality in the lazy river level.
 *  Still flatter than other levels but diversify it, especially during the log parts"): raised walkways in the ruins
 *  and the canopy, the river stepping down through GATOR BAYOU's log jam (each log run a step lower, a burning cascade
 *  pouring out of a culvert at each step), back up to the swim-up bar, a raised quay in the cove, a step down into the
 *  oasis. Negative: higher. The meeting, the grotto and level 3's landing stay at GY. */
export const DECK_DY: number[] = [0, -40, 0, 0, -50, 0, 60, 120, 60, 60, 0, 0, -40, 40, 0, 0, 0];
/** The river's head: level 1's ground ends here (the dock's end), and the river starts. */
export const HEAD = X(1500);
/** The river: every gap between the decks (from the head on), with the decks either side's heights (dy) and its own
 *  water's (the lower deck's: the water's always under both). */
export interface Gap { a: number; b: number; dyL: number; dyR: number; water: number }
export const GAPS: Gap[] = (() => {
  const out: Gap[] = [];
  let a = HEAD, dyL = 0;
  DECKS.forEach(([x1, x2], i) => { const dyR = DECK_DY[i] ?? 0; if (x1 > a) out.push({ a, b: x1, dyL, dyR, water: Math.max(dyL, dyR) }); a = x2; dyL = dyR; });
  return out;
})();
export const RIVER: [number, number][] = GAPS.map(g => [g.a, g.b]);
export const inRiver = (x: number) => RIVER.some(([a, b]) => x > a && x < b);
export const gapAt = (x: number) => GAPS.find(g => x > g.a && x < g.b) ?? null;
/** The deck's height (dy) at x: on a deck its own; over the river, the higher of the two either side (for what's hung
 *  over it); short of the river (level 1's ground) and past it, 0. */
export const floorDy = (x: number) => { const i = DECKS.findIndex(([a, b]) => x >= a && x <= b); if (i >= 0) return DECK_DY[i] ?? 0; const g = gapAt(x); return g ? Math.min(g.dyL, g.dyR) : 0; };
/** The deck's top at x (GY on the flat). */
export const deckY = (x: number) => GY + floorDy(x);
/** The water's dy at x (its gap's; 0 elsewhere), and its burning surface. */
export const waterDy = (x: number) => gapAt(x)?.water ?? 0;
export const waterY = (x: number) => RIVER_Y + waterDy(x);
/** Where a vine hangs over its gap: between the two decks' heights. */
export const hangDy = (x: number) => { const g = gapAt(x); return g ? Math.round((g.dyL + g.dyR) / 2) : 0; };

// ---------------------------------------------------------------------------------------------------------------
// The vines (over the river): hung off the burnt beams of the old jungle pergola. Jungle Land's vines (VineDef), and
// a fuse: a vine with one catches fire once he's on it, the flame climbing up it from its tip, and snaps (drops him)
// when it gets to the top.

export interface Vine2 { x: number; y: number; len: number; fuse?: number }
const V = (r: number, len = 290, fuse?: number, h = 380): Vine2 => ({ x: X(r), y: GY - h + hangDy(X(r)), len, fuse });
export const VINES2: Vine2[] = [
  // (taught: one, over a short stretch)
  V(1680, 280),
  // (two in a chain)
  V(2330, 290), V(2660, 300),
  // (the long swing: longer ones, further apart)
  V(3400, 340, undefined, 420), V(3750, 350, undefined, 420),
  // (the first that burn: a fair fuse, a sign before them)
  V(4700, 290, 170), V(5010, 290, 170), V(5260, 280, 170),
  // (fire jets up out of the river between: plain, burning, plain)
  V(6590, 290), V(6890, 300, 140), V(7190, 290),
  // (a chain of quick-burning ones, imps about)
  V(7900, 290, 115), V(8190, 300, 115), V(8480, 290, 115),
  // (the towers' stretch: one between two towers)
  V(20190, 280, 130),
  // (the mix: a plain one, a burning one, then down onto a log)
  V(24390, 290), V(24690, 300, 130),
  // (the last bend: two quick ones between towers)
  V(26890, 290, 110), V(27170, 290, 100),
];

// ---------------------------------------------------------------------------------------------------------------
// The logs (floating on the river: Wilderness Land's rolling logs). Each its stretch of water to float in (a, b), where
// it's tied up waiting (home), how long, and its fuse (how long it takes him stood on it to burn it through).

export interface Log2 { a: number; b: number; home: number; len: number; fuse: number }
const LG = (a: number, b: number, home: number, fuse: number, len = 150): Log2 => ({ a: X(a), b: X(b), home: X(home), len, fuse });
export const LOGS2: Log2[] = [
  // (taught: one log, a long fuse)
  LG(9300, 10200, 9305, 480),
  // (two: hop from one to the next)
  LG(10600, 12200, 10605, 300), LG(10600, 12200, 11350, 300),
  // (three, imps diving, burning beams across to duck)
  LG(12600, 14400, 12605, 260), LG(12600, 14400, 13280, 260), LG(12600, 14400, 13900, 220),
  // (the mix: a log on to the towers)
  LG(21300, 22300, 21305, 300),
  // (the mix: a vine down onto a log, beams)
  LG(24800, 26000, 24815, 240),
];
/** The lazy river's current (px a frame, along: it's lazy). */
export const CURRENT = 0.45;
/** Burning beams across the river, low over the logs: duck under (standing, it hits him). World x of each. */
export const BEAMS: number[] = [X(13150), X(13660), X(25450)];
/** How high the beams' undersides are over a log's top (ducked he's under it). */
export const BEAM_GAP = 50;

// ---------------------------------------------------------------------------------------------------------------
// The TIKI TOWERS (Cartoon Land's swaying stack-towers: cartoon/sway.ts), rooted on rocks in the river. Each its foot
// (x), how tall, its fuse, and which way it burns ('base': from the foot up, the stack giving way; 'top': from the
// lid down: shorter, the lid itself on fire under him).

export interface Tower2 { x: number; h: number; fuse: number; burn: 'base' | 'top'; lean?: number }
const T = (r: number, fuse: number, burn: 'base' | 'top' = 'base', h = 120, lean?: number): Tower2 => ({ x: X(r), h, fuse, burn, lean });
export const TOWERS2: Tower2[] = [
  // (taught: one)
  T(15410, 360),
  // (three in a row)
  T(16160, 240), T(16410, 240), T(16660, 240),
  // (four, one burning from the top, hover aliens about)
  T(17510, 240), T(17760, 190, 'top'), T(18010, 230), T(18260, 220),
  // (towers with a vine between)
  T(19910, 220), T(20450, 210), T(20690, 200, 'top'),
  // (the mix: off the log onto two towers)
  T(22480, 220), T(22740, 170, 'top'),
  // (the last bend)
  T(26610, 170, 'top'), T(27460, 200), T(27730, 180, 'top'),
];

// ---------------------------------------------------------------------------------------------------------------
// The fire: jets up out of the river (a tell, the surface boiling, then a column of it), patches burning on the decks
// (debris on fire: always burning, walk round them or over)

/** [x, period, phase] (frames). */
export const JETS: [number, number, number][] = [
  [X(6740), 150, 0], [X(7040), 150, 75],
  [X(8040), 170, 40], [X(8330), 170, 120],
  [X(21900), 160, 0],
  [X(25150), 150, 60],
];
/** How tall a jet goes (up off the river's surface) and how long it's up (frames); the tell before it. */
export const JET_H = 330, JET_UP = 48, JET_TELL = 54;
/** Patches on the decks: [x, width]. */
export const PATCHES: [number, number][] = [
  [X(5760), 50], [X(14700), 46], [X(19100), 50], [X(23320), 54], [X(23700), 40],
];

// ---------------------------------------------------------------------------------------------------------------
// The grotto (the boss's) and level 3's stub

/** The grotto: its door (a plywood board in the cave's mouth; he walks up to it, it's kicked in), the arena (the whole
 *  screen: a fixed camera), the way out (the back of the cave, opened up after: on to level 3). */
export const GROTTO = { door: X(29180), L: X(29020), R: X(29820), out: X(29820) };
/** The river's last stretch, out the grotto's back: where the float goes in, where it fetches up (the landing). */
export const COAST = { from: X(29930), to: X(31280) };
/** Level 3's start (the stub; the owner's: "Stage 3 starts with a door that leads to a maintenance tunnel"): where he's
 *  put (the landing at the river's end), and the door (shut: the way on, later). */
export const L3 = { x: X(31560), wall: X(31980) };
/** The meeting: where it starts (walking past), where the son's stood (the dock's end). */
export const MEET = { trigger: X(700), sonX: X(1420), stopX: X(1060) };

// ---------------------------------------------------------------------------------------------------------------
// Where each checkpoint puts him (feet)

export const CP2_AT: Record<number, { x: number; y: number }> = {
  [CP2.start]: { x: L2.x, y: GY },
  [CP2.river]: { x: X(1150), y: deckY(X(1150)) },
  [CP2.canopy]: { x: X(5480), y: deckY(X(5480)) },
  [CP2.logJam]: { x: X(10300), y: deckY(X(10300)) },
  [CP2.bar]: { x: X(14480), y: deckY(X(14480)) },
  [CP2.tiki]: { x: X(18580), y: deckY(X(18580)) },
  [CP2.soup]: { x: X(20980), y: deckY(X(20980)) },
  [CP2.bend]: { x: X(26080), y: deckY(X(26080)) },
  [CP2.grotto]: { x: X(28140), y: deckY(X(28140)) },
  [CP2.L3]: { x: L3.x, y: GY },
};

// ---------------------------------------------------------------------------------------------------------------
// Who's where. [kind, x, feet y (GY: on a deck)]

export type Who2 = 'dguest' | 'aguest' | 'trooper' | 'hover' | 'imp' | 'burnout';
const H = (r: number) => GY - r;
export const CAST2: [Who2, number, number][] = [
  // (the vines: a burnout on the second deck; an imp over the long swing's landing)
  ['burnout', X(3060), GY], ['imp', X(4320), H(230)],
  // (the canopy's deck: the possessed, a burnout)
  ['dguest', X(5980), GY], ['aguest', X(6180), GY], ['burnout', X(6300), GY],
  // (the quick vines: imps)
  ['imp', X(8020), H(300)], ['imp', X(8380), H(260)],
  ['burnout', X(9150), GY],
  // (the logs: a trooper on the deck between, imps and a hover over the three-log run)
  ['trooper', X(12470), GY], ['imp', X(12560), H(240)],
  ['imp', X(13050), H(230)], ['hover', X(13450), H(260)], ['imp', X(13760), H(240)],
  // (the swim-up bar)
  ['dguest', X(14880), GY], ['burnout', X(15080), GY],
  // (the towers)
  ['imp', X(17100), H(240)], ['hover', X(17950), H(280)],
  ['dguest', X(19000), GY], ['burnout', X(19260), GY], ['aguest', X(19480), GY], ['imp', X(19600), H(260)],
  ['imp', X(20300), H(300)],
  // (the mix)
  ['imp', X(22100), H(250)],
  ['aguest', X(23180), GY], ['trooper', X(23950), GY], ['burnout', X(24100), GY], ['imp', X(23800), H(280)],
  ['imp', X(25300), H(230)], ['hover', X(25700), H(260)],
  ['imp', X(27000), H(280)],
  // (outside the grotto: his crew, waiting)
  ['burnout', X(28650), GY], ['burnout', X(28790), GY],
];
/** The pickups: small ones along the way (the endgame's lean drops), and the big refill before the grotto's door. */
export const PICKUPS2: [number, number, 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo'][] = [
  [X(2000), GY, 'small_health'], [X(5550), GY, 'small_ammo'], [X(9000), GY, 'small_health'], [X(12300), GY, 'small_ammo'],
  [X(14560), GY, 'small_health'], [X(17150), GY, 'small_ammo'], [X(18700), GY, 'small_health'], [X(21100), GY, 'small_ammo'],
  [X(23100), GY, 'small_health'], [X(26200), GY, 'small_ammo'],
  // (the grotto's door: the big health and ammo)
  [X(28480), GY, 'large_health'], [X(28560), GY, 'large_ammo'],
];

/** Signs: [x, the words, a second line]. Stood on the decks, clear of the edges. */
export const SIGNS2: [number, string, string][] = [
  [X(660), 'THE LAZY RIVER', 'FLOAT FOREVER'],
  [X(1250), 'NO TANNING OIL', 'IN THE RIVER'],
  [X(4210), 'VINES ARE HOT', 'DO NOT HANG AROUND'],
  [X(9050), 'LOG FLUME', 'LOGS MAY BE ON FIRE'],
  [X(15050), 'TIKI TOWERS', 'MAX 1 RIDER'],
  [X(28260), 'SKULL GROTTO', 'CLOSED. FOREVER.'],
];
