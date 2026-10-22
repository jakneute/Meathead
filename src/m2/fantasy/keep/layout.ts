// The castle's base and the runway, laid out (x from the section's start, heights up from the ground line: Y(h) = GY -
// h). The foot and the lower levels of THE GREAT PIXIE'S CASTLE (fiberglass stone, a theme park's), then out the postern
// onto the BROOM PORT. Teach, then escalate: each new thing alone first.
//
//   0      THE CASTLE GATE (cp 40): in off the ride's exit; a lone CASTLE GUARD (new: a halberd, pointy); Piper on the PA.
//   800    THE MOAT (drained: a long way down) and THE DRAWBRIDGE (new): on the clock, down for a while, up for a while
//          (a winch's tell first); ride it up and hop off onto the barbican's ledge for a pickup.
//   1260   THE GATEHOUSE (cp 41): a passage under the gatehouse (the inside veiled till he's in it), the gift shop along
//          it; THE MURDER HOLES (new): the ceiling glows and gurgles, then pours boiling butter brew; one alone, then a
//          pair with a guard between them; a LADY-IN-WAITING (new: her fan comes back like a boomerang).
//   2900   THE COURTYARD (cp 42): the PRINCESS MAKEOVER BOUTIQUE (the suitors who lived through the ride, getting their
//          makeovers: they have their say); a COURT JESTER (new: juggling pins, thrown) alone; a princess, a knight;
//          THE ROYAL ROSE GARDEN: thorny roses along the ground, toadstool planters across it, the last one a big
//          bounce up onto the ramparts (too tall to jump).
//   4600   THE RAMPARTS (cp 43): the wall walk, 300 up: a clerk casting along it; machicolations in the hoardings over
//          it pouring in a rolling wave; THE BREACH: two staircases in opposition across it, faster than the glen's, a
//          cauldron swinging across the far one (fall in and a toadstool at the bottom throws you back up); an owl.
//   6300   THE TOWER STAIRS (cp 44): the keep's tower, the hardest staircase work yet: a zigzag of three fast flights
//          (100 held, 45 swinging) up to its gallery, a cauldron swinging across the middle one, a murder hole pouring
//          over the landing between, thorns on the floor under the top one, a jester juggling down from the gallery.
//   7600   THE POSTERN (cp 45): down the tower's far side in steps; the last crowd in the postern yard; the gate out.
//   9000   THE BROOM PORT (cp 46): the runway out on the castle's side (runway.ts): the brooms, the suitors left, the
//          scene; up and away to the broomstick deathmatch.
//
// All of it goes both ways (free within the section): the drawbridge comes back down, the steps go back up the tower,
// the toadstools throw him back up out of the breach; dropping off the wall walk lands in the garden.

import { SECTIONS, GY } from '../geometry';
import { stairEnd, type StairDef } from '../stairs';

export const x0 = SECTIONS.keep.x0, x1 = SECTIONS.keep.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;
export { GY };

/** Where the runway starts (index.ts's HUD skin flips to 'runway' past this; the art goes outside). */
export const RUNWAY = 9000;

const STONE = '#9A8EB4', LIP = '#F6E7C0';
const st = (d: StairDef): StairDef => ({ stone: STONE, lip: LIP, ...d });

// ---------------------------------------------------------------------------------------------------------------
// The moat and its drawbridge (a StairDef run by stairs.ts, drawn as a bridge: hazards.ts)

export const MOAT = { a: 800, b: 1200 };
/** Pivots at the gatehouse's foot; down: level across the moat; up: up at 41 degrees (its end over the barbican). */
export const BRIDGE: StairDef = { px: X(MOAT.b), py: Y(0), len: MOAT.b - MOAT.a, docks: [Math.PI, Math.PI + 0.72], hold: 210, swing: 70, phase: 60 };
/** The barbican's ledge: only the drawbridge raised gets him up there (a pickup). */
export const BARBICAN = { a: 750, b: 880, h: 280 };

// ---------------------------------------------------------------------------------------------------------------
// The gatehouse: a passage under it, its ceiling 170 up

export const GATEHOUSE = { a: 1260, b: 2900, ceil: 170, roof: 340, shop: { a: 1460, b: 2600 } };

// ---------------------------------------------------------------------------------------------------------------
// The courtyard, the rose garden, the boutique

export const BOUTIQUE = { a: 3150, b: 3560, seats: [3260, 3355, 3450], trigger: 3120 };
export const WALL = { a: 4600, b: 7600, top: 300 };

// ---------------------------------------------------------------------------------------------------------------
// The breach in the wall walk: two staircases in opposition, a pillar between

export const BREACH = { a: 5300, b: 5800 };
export const PILLAR = { a: 5510, b: 5590 };
const SA = st({ px: X(BREACH.a), py: Y(WALL.top), len: PILLAR.a - BREACH.a, docks: [0, 0.62], hold: 120, swing: 50 });
const SB = st({ px: X(PILLAR.b), py: Y(WALL.top), len: BREACH.b - PILLAR.b, docks: [0.62, 0], hold: 120, swing: 50 });

// ---------------------------------------------------------------------------------------------------------------
// The tower stairs: a zigzag of three, landings between

const TOWER_T = { hold: 100, swing: 45 }, TL = 280;
const S1 = st({ px: X(6560), py: Y(WALL.top), len: TL, docks: [-0.6, -0.12], ...TOWER_T });
const s1End = stairEnd(S1, 0);
/** The landings: B (between the first and second flights), C (between the second and third), the gallery D. */
export const LAND_B = { a: Math.round(s1End.x - x0), b: Math.round(s1End.x - x0) + 80, h: Math.round(GY - s1End.y) };
const S2 = st({ px: X(LAND_B.a), py: Y(LAND_B.h), len: TL, docks: [Math.PI + 0.6, Math.PI - 0.25], ...TOWER_T, phase: 60 });
const s2End = stairEnd(S2, 0);
export const LAND_C = { a: Math.round(s2End.x - x0) - 120, b: Math.round(s2End.x - x0), h: Math.round(GY - s2End.y) };
const S3 = st({ px: X(LAND_C.b), py: Y(LAND_C.h), len: TL, docks: [-0.6, 0.3], ...TOWER_T, phase: 30 });
const s3End = stairEnd(S3, 0);
export const GALLERY = { a: Math.round(s3End.x - x0), b: 7540, h: Math.round(GY - s3End.y) };
/** The tower's right wall under the gallery (the floor doesn't go out that way). */
export const TOWER_WALL = { a: 7540, b: 7600 };

/** Every staircase (the drawbridge first: drawn as a bridge, not stairs). */
export const STAIRS: StairDef[] = [BRIDGE, SA, SB, S1, S2, S3];
export const BRIDGE_STAIR = 0;
export const TOWER_STAIRS = [3, 4, 5];

// ---------------------------------------------------------------------------------------------------------------
// Ground, walls, ledges

/** Ground: [from, to, height]. The moat's a gap (all the way down). */
export const GROUND: [number, number, number][] = [
  [-200, MOAT.a, 0],
  [MOAT.b, x1 - x0 + 200, 0],
];
/** Solids: [from, to, top height, bottom height (default the ground's)]. */
export const SOLIDS: [number, number, number, number?][] = [
  // (the gatehouse over the passage)
  [GATEHOUSE.a, GATEHOUSE.b, GATEHOUSE.roof, GATEHOUSE.ceil],
  // (the curtain wall under the wall walk, the breach out of it; the breach's pillar)
  [WALL.a, BREACH.a, WALL.top], [PILLAR.a, PILLAR.b, WALL.top], [BREACH.b, WALL.b, WALL.top],
  // (the tower's right wall, under its gallery)
  [TOWER_WALL.a, TOWER_WALL.b, 0, WALL.top],
];
// (the tower's right wall's top is the gallery's: fixed up here, as its height's worked out above)
SOLIDS[SOLIDS.length - 1][2] = GALLERY.h;
/** Ledges (one-way): [from, to, height]. */
export const LEDGES: [number, number, number][] = [
  [BARBICAN.a, BARBICAN.b, BARBICAN.h],
  [LAND_B.a, LAND_B.b, LAND_B.h],
  [LAND_C.a, LAND_C.b, LAND_C.h],
  [GALLERY.a, GALLERY.b, GALLERY.h],
  // (down the tower's far side in steps (and back up them))
  [7620, 7740, 644], [7780, 7900, 514], [7940, 8060, 384], [8100, 8220, 254], [8260, 8380, 124],
];

// ---------------------------------------------------------------------------------------------------------------
// The hazards

/** The murder holes: [x, the hole's height (the ceiling, a hoarding), the floor it pours onto, period, phase]. Each
 *  goes quiet, tells (TELL frames: glows, gurgles, drips), then pours (POUR frames). */
export const HOLES: [number, number, number, number, number][] = [
  // (the gatehouse: one alone, then a pair out of step)
  [1700, GATEHOUSE.ceil, 0, 210, 0],
  [2080, GATEHOUSE.ceil, 0, 180, 0], [2260, GATEHOUSE.ceil, 0, 180, 90],
  // (the ramparts' machicolations: a rolling wave)
  [4920, 480, WALL.top, 150, 0], [5030, 480, WALL.top, 150, 34], [5140, 480, WALL.top, 150, 68],
];
/** The tower's: over landing C, out of a hoarding up under the gallery (pushed in once C's height is known). */
HOLES.push([LAND_C.a + 40, LAND_C.h + 150, LAND_C.h, 180, 20]);
export const HOLE_TELL = 50, HOLE_POUR = 56, HOLE_HALF = 16;

/** The toadstool planters (springy caps 70 up, as the glen's): [x, how high he goes off it]. */
export const MUSHROOMS: [number, number][] = [
  [4170, 210], [4380, 210], [4540, 300],
  [5405, 300], [5695, 300],
];
export const CAP_H = 70, CAP_W = 110;
/** The rose beds (thorns): [from, to, the floor's height]. */
export const ROSES: [number, number, number][] = [[4100, 4600, 0], [6900, 7520, WALL.top]];
/** The swinging cauldrons: [pivot x, pivot height, chain, swing (radians either side), period, phase]. */
export const CAULDRONS: [number, number, number, number, number, number][] = [
  [5700, 520, 160, 0.9, 150, 0],
  [6700, 760, 150, 0.8, 140, 40],
];

// ---------------------------------------------------------------------------------------------------------------
// The cast, the pickups, the checkpoints

/** [kind, x, height of its feet]. Nobody of the cast stands in a hazard's way. */
// (the encounter pass: nobody newly inside a checkpoint's safe start (spawnSafe.ts, 360 either side). The gate's guard
// and the courtyard's princess out of it; the first wall-walk clerk between the machicolations' second and third
// holes (casting through the rolling wave; he can be knocked into a pour); past the breach the courtier right where
// the far staircase lands him, the clerk behind her (two throwing across the swinging flight); the wall's last guard
// and the yard's jester up on the steps down the tower's far side (below him coming down: the halberd chops up at a
// jump over, a dive kick's fine on him; pins coming up from the step under))
export const CAST: [string, number, number][] = [
  ['m2:fa_guard', 610, 0],
  ['m2:fa_guard', 2170, 0], ['m2:fa_courtier', 2680, 0],
  ['m2:fa_princess', 3400, 0], ['m2:fa_jester', 3820, 0], ['m2:fa_knight', 3990, 0], ['m2:fa_owl', 4300, 330],
  ['m2:fa_clerk', 5085, WALL.top], ['m2:fa_guard', 5235, WALL.top], ['m2:fa_owl', 5560, 470],
  ['m2:fa_courtier', 5890, WALL.top], ['m2:fa_clerk', 5960, WALL.top],
  ['m2:fa_owl', 6720, 640], ['m2:fa_jester', 7060, GALLERY.h], ['m2:fa_courtier', 7380, GALLERY.h],
  ['m2:fa_jester', 7840, 514], ['m2:fa_guard', 8000, 384],
  ['m2:fa_guard', 8560, 0], ['m2:fa_unicorn', 8820, 0], ['m2:fa_courtier', 8930, 0],
];
/** Pickups (lean): [x, height, type]. */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [BARBICAN.a + 50, BARBICAN.h, 'small_health'],
  [2450, 0, 'small_ammo'],
  [3620, 0, 'small_health'],
  [(PILLAR.a + PILLAR.b) / 2, WALL.top, 'small_ammo'],
  [GALLERY.a + 70, GALLERY.h, 'small_health'],
  [8440, 0, 'small_ammo'],
];
export const CHECKPOINTS = [
  { name: "THE GREAT PIXIE'S CASTLE", cp: 40, x: X(200), y: Y(0) },
  { name: 'THE GATEHOUSE', cp: 41, x: X(1340), y: Y(0) },
  { name: 'THE COURTYARD', cp: 42, x: X(3000), y: Y(0) },
  { name: 'THE RAMPARTS', cp: 43, x: X(4650), y: Y(WALL.top) },
  { name: 'THE TOWER STAIRS', cp: 44, x: X(6260), y: Y(WALL.top) },
  { name: 'THE POSTERN', cp: 45, x: X(8420), y: Y(0) },
  { name: 'THE BROOM PORT', cp: 46, x: X(9150), y: Y(0) },
];

/** Piper's PA horns (brass, on the walls): [x, the horn's height, the gag it's for]. She has her say passing each. */
export const PA_AT: [number, number, string][] = [[700, 210, 'gate'], [3080, 230, 'court'], [6300, 480, 'tower'], [8460, 220, 'postern']];
/** Once each, passing: [the gag, from x]. */
export const GAG_AT: [string, number][] = [['bridge', 560], ['shop', 1500], ['roses', 4020], ['walls', 4700], ['tower', 6330]];
/** Where he has a horny thought (once each, if nobody's talking). */
export const HORNY_AT = [3700, 7700];

// ---------------------------------------------------------------------------------------------------------------
// The runway (runway.ts)

export const DECK = { a: 9000, b: 11900 };
/** The scene: where it starts, where he stops, his broom's cradle (its top), the suitors' spots, the PA tower, where the
 *  camera's left edge goes. */
export const SCENE = { trigger: 9560, stop: 9842, cradle: { x: 9880, h: 40 }, spots: [10050, 10160, 10270, 10380, 10490, 10600], horn: { x: 9720, h: 270 }, cam: 9800 };
