// The enchanted glen, laid out (x from the section's start, heights up from the ground line: Y(h) = GY - h). The park's
// storybook forest walk (Fantasyland's dark-ride fairy tales made into a glade, parodied): giant toadstools, a briar
// patch, the storybook bridge (out), the witch's candy cottage, the dwarfs' mine, the unicorn meadow, the dragon's lair
// (fiberglass bones), and at its end the queue for TRUELLING TRAGONS. Teach, then escalate: each new thing alone first.
//
//   0      THE GLEN GATE (cp 20): in from the fairy wheel; a lone HUNTSMAN (new: his crossbow); Piper on the PA.
//   1500   TOADSTOOL HOLLOW: THE MUSHROOM TRAMPOLINES (new), taught alone: a mossy cliff too tall to jump, a toadstool
//          in front of it (land on its cap: up he goes); a GINGERBREAD MAN (new) past it.
//   2700   THE BRIAR PATCH: thorns along the ground (new: they hurt and throw him up); three toadstools across it; an
//          owl over it, a wand clerk at its end.
//   3900   THE STORYBOOK BRIDGE (cp 21): the bridge is out; across the misty gorge on TWO STAIRCASES SWINGING IN
//          OPPOSITION (one docks at the middle pillar as the other drops into the gorge); a CUPID ON WIRES (new) over
//          it; the troll waiting on the far bank.
//   5500   THE WITCH'S COTTAGE (cp 22): THE SWINGING CAULDRONS (new), taught alone over the path; the candy cottage (too
//          tall to jump), up its staircase with a cauldron swinging across the flight, another over its roof; the garden
//          after (gingerbread men, a cauldron off a gallows, a cupid).
//   7400   THE DWARF MINE (cp 23): a team of DWARFS (new: pickaxes, rocks, a candle on every hat); then the shaft: A
//          CHAIN OF FOUR faster staircases across it, pillar to pillar (an owl, a cupid, a dwarf throwing from the far
//          side).
//   9600   UNICORN MEADOW (cp 24): a UNICORN (new: it charges, horn first) alone; then a briar patch with toadstools
//          over it, a huntsman up a tree stand over that (bounce high enough and he's yours), a cupid, another unicorn.
//   11100  THE DRAGON'S LAIR (cp 25): the dragon mascot; a toadstool up to a ledge, and a staircase that RIDES him up
//          (it waits till he's on it, then swings) over a briar floor while a huntsman shoots down it from the top
//          landing and a cupid and an owl come at him; over the lair's back wall, down the far side.
//   13100  THE QUEUE (cp 26): a last crowd; the rival suitors in the queue (rivals.ts), taunting him, then in; Piper; the
//          ride's entrance (on to TRUELLING TRAGONS: its right end).
//
// All of it goes both ways (free within the section): the chasms' staircases go on swinging; the cottage and the lair's
// wall come back down their ledges and stairs; the cliff's a drop the other way.

import { SECTIONS, GY } from '../geometry';
import { stairEnd, type StairDef } from '../stairs';

export const x0 = SECTIONS.glen.x0, x1 = SECTIONS.glen.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;

const L = (a: number) => Math.PI - a; // (pointing left, down by a: down-left; with a < 0: up-left)
const STONE = '#8A9A7A', MOSS = '#E2F2B0';
const st = (d: StairDef): StairDef => ({ stone: STONE, lip: MOSS, ...d });

// ---------------------------------------------------------------------------------------------------------------
// The staircases

/** The storybook bridge's gorge: the two flights in opposition (each docks level when the other's down in the gorge). */
export const GAP1 = { a: 4300, b: 5100 };
export const PIL = { a: 4640, b: 4740 };
const SA = st({ px: X(GAP1.a), py: Y(0), len: PIL.a - GAP1.a, docks: [0, 0.62], hold: 150, swing: 60 });
const SB = st({ px: X(PIL.b), py: Y(0), len: GAP1.b - PIL.b, docks: [0.62, 0], hold: 150, swing: 60 });

/** The witch's cottage (too tall to jump: its candy roof's the way over), its staircase off the roof's left corner. */
export const COT = { a: 6300, b: 6660, top: 200 };
const SC = st({ px: X(COT.a), py: Y(COT.top), len: 380, docks: [L(Math.asin(COT.top / 380)), Math.PI], hold: 130, swing: 55, phase: 40 });

/** The mine shaft's chain of four (faster than the square's), pillar to pillar. */
const SHAFT = 8200, CHAIN = { hold: 110, swing: 50 }, SL = 280;
const up60 = -Math.asin(60 / SL);
const S1 = st({ px: X(SHAFT), py: Y(0), len: SL, docks: [up60, 0.55], ...CHAIN });
const P1 = { a: stairEnd(S1, 0).x - x0, w: 60, top: 60 };
const S2 = st({ px: X(P1.a + P1.w), py: Y(60), len: SL, docks: [0.5, up60], ...CHAIN, phase: 80 });
const P2 = { a: stairEnd(S2, 1).x - x0, w: 60, top: 120 };
const S3 = st({ px: X(P2.a + P2.w), py: Y(120), len: SL, docks: [-up60, -0.5], ...CHAIN, phase: 40 });
const P3 = { a: stairEnd(S3, 0).x - x0, w: 60, top: 60 };
const S4 = st({ px: X(P3.a + P3.w), py: Y(60), len: SL, docks: [0.6, -up60], ...CHAIN, phase: 120 });
export const GAP2 = { a: SHAFT, b: Math.round(stairEnd(S4, 1).x - x0) };
export { P1, P2, P3 };

/** The dragon's lair: the ledge up off the toadstool, the staircase that rides him up, the top landing, the back wall. */
export const L1 = { a: 11640, b: 11800, h: 170 };
const SR = st({ px: X(L1.b), py: Y(L1.h), len: 400, docks: [0, -0.72], hold: 200, swing: 70, ride: 30 });
export const TOP = { a: stairEnd(SR, 1).x - x0, b: 12300, h: Math.round(GY - stairEnd(SR, 1).y) };
export const LAIR_WALL = { a: 12300, b: 12360, top: TOP.h + 100 };

export const STAIRS: StairDef[] = [SA, SB, SC, S1, S2, S3, S4, SR];
/** Which are which (for his lines). */
export const RIDE_STAIR = 7;

// ---------------------------------------------------------------------------------------------------------------
// Ground, walls, ledges

/** Ground: [from, to, height]. Between runs: the two gorges (all the way down). */
export const GROUND: [number, number, number][] = [
  [-200, GAP1.a, 0],
  [GAP1.b, GAP2.a, 0],
  [GAP2.b, x1 - x0 + 200, 0],
];
/** The mossy cliff in toadstool hollow (too tall to jump: the toadstool's the way up). */
export const CLIFF = { a: 1900, b: 2300, top: 280 };
/** Solids (lit along their tops): [from, to, top height, bottom height (default the ground's; deep for the pillars)]. */
export const SOLIDS: [number, number, number, number?][] = [
  [CLIFF.a, CLIFF.b, CLIFF.top],
  [PIL.a, PIL.b, 0, -1600],
  [COT.a, COT.b, COT.top],
  [P1.a, P1.a + P1.w, P1.top, -1600], [P2.a, P2.a + P2.w, P2.top, -1600], [P3.a, P3.a + P3.w, P3.top, -1600],
  [LAIR_WALL.a, LAIR_WALL.b, LAIR_WALL.top],
];
/** The huntsman's tree stand over the meadow's briars (only a high bounce gets up there). */
export const STAND = { a: 10560, b: 10680, h: 300 };
/** Ledges (one-way): [from, to, height]. */
export const LEDGES: [number, number, number][] = [
  [STAND.a, STAND.b, STAND.h],
  [L1.a, L1.b, L1.h],
  [TOP.a, TOP.b, TOP.h],
  // (over the lair's back wall, and down the far side)
  [LAIR_WALL.b, LAIR_WALL.b + 200, LAIR_WALL.top],
  [12600, 12720, 400], [12760, 12880, 267], [12920, 13040, 134],
  // (the cottage's woodpile round the back: the way back up onto its roof from the garden)
  [6690, 6770, 105],
];

// ---------------------------------------------------------------------------------------------------------------
// The toadstools, the briars, the cauldrons

/** The mushroom trampolines: [x (the cap's middle), how high he goes off it (px over the cap)]. Caps 70 up (a hop onto
 *  one), 110 across. */
export const MUSHROOMS: [number, number][] = [
  [1760, 290], [2430, 290],
  [2900, 210], [3150, 210], [3400, 210],
  [10420, 210], [10660, 210],
  [11560, 210],
];
export const CAP_H = 70, CAP_W = 110;
/** The briar patches along the ground: [from, to]. */
export const BRIARS: [number, number][] = [[2780, 3600], [10340, 10860], [11810, 12290]];
/** The swinging cauldrons: [pivot x, pivot height, chain length, swing (radians either side), period (frames), phase]. */
export const CAULDRONS: [number, number, number, number, number, number][] = [
  [5800, 330, 250, 0.95, 160, 0],
  [6140, 330, 190, 0.9, 140, 50],
  [6500, 420, 170, 1.0, 170, 20],
  [7000, 330, 240, 1.0, 150, 90],
];

// ---------------------------------------------------------------------------------------------------------------
// The cast, the pickups, the checkpoints

/** [kind, x, height of its feet]. Nobody of the cast stands in a hazard's way. */
export const CAST: [string, number, number][] = [
  ['m2:fa_huntsman', 1150, 0],
  ['m2:fa_owl', 2100, 400], ['m2:fa_ginger', 2620, 0],
  // (the clerk at the briars' near edge (he stood inside THE STORYBOOK BRIDGE's reach): casting while the ginger
  // runs at him; up on the first toadstool, the ginger comes on into the thorns)
  ['m2:fa_owl', 3250, 320], ['m2:fa_clerk', 2700, 0],
  ['m2:fa_cupid', 4120, 230], ['m2:fa_troll', 5330, 0],
  // (the garden: a ginger up on the woodpile, leaping on him as he comes down off the roof; the last at the edge of
  // the gallows cauldron's swing (it was inside THE DWARF MINE's reach): a leap at him there goes up into its path)
  ['m2:fa_clerk', 6060, 0], ['m2:fa_ginger', 6230, 0], ['m2:fa_cupid', 6450, 400], ['m2:fa_ginger', 6730, 105], ['m2:fa_ginger', 6870, 0],
  // (the team in a row: the candles say no dive kicks, a charge into the first takes the line; out of the
  // checkpoint's reach)
  ['m2:fa_dwarf', 7800, 0], ['m2:fa_dwarf', 7880, 0], ['m2:fa_dwarf', 7960, 0],
  ['m2:fa_owl', 8700, 320], ['m2:fa_cupid', 9000, 300], ['m2:fa_dwarf', GAP2.b + 140, 0],
  // (the second unicorn (it stood inside THE DRAGON'S LAIR's reach) is down at the foot of the lair's far side: it
  // charges along under the steps as he comes down them (no shouldering the horn: drop a dive kick on it))
  ['m2:fa_unicorn', 10050, 0], ['m2:fa_huntsman', STAND.a + 70, STAND.h], ['m2:fa_cupid', 10500, 380],
  ['m2:fa_dragon', 11380, 0], ['m2:fa_unicorn', 12680, 0], ['m2:fa_owl', 11980, 300], ['m2:fa_cupid', 11900, 540], ['m2:fa_huntsman', TOP.b - 60, TOP.h],
  ['m2:fa_knight', 13330, 0], ['m2:fa_cupid', 13380, 250], ['m2:fa_ginger', 13460, 0], ['m2:fa_princess', 13560, 0],
];
/** Pickups (lean): [x, height, type]. */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [CLIFF.a + 220, CLIFF.top, 'small_health'],
  [(PIL.a + PIL.b) / 2, 0, 'small_ammo'],
  [COT.a + 200, COT.top, 'small_health'],
  [STAND.a + 30, STAND.h, 'small_health'],
  [TOP.a + 60, TOP.h, 'small_ammo'],
  [13250, 0, 'small_ammo'],
];
export const CHECKPOINTS = [
  { name: 'THE ENCHANTED GLEN', cp: 20, x: X(200), y: GY },
  { name: 'THE STORYBOOK BRIDGE', cp: 21, x: X(3960), y: GY },
  { name: "THE WITCH'S COTTAGE", cp: 22, x: X(5520), y: GY },
  { name: 'THE DWARF MINE', cp: 23, x: X(7420), y: GY },
  { name: 'UNICORN MEADOW', cp: 24, x: X(GAP2.b + 160), y: GY },
  { name: "THE DRAGON'S LAIR", cp: 25, x: X(11160), y: GY },
  { name: 'THE QUEUE', cp: 26, x: X(13160), y: GY },
];

/** Piper's PA horns (on toadstool posts): [x, the gag it's for]. She has her say passing each (once). */
export const PA_AT: [number, string][] = [[680, 'gate'], [5640, 'cottage'], [9800, 'meadow'], [11300, 'lair']];
/** The queue: the rivals' spots, where they're heard, the ride's door. */
export const QUEUE = { a: 13600, b: 13990, spots: [13690, 13790, 13880], trigger: 13380, door: 13940 };
/** Once each, passing: [the gag, from x]. */
export const GAG_AT: [string, number][] = [['hollow', 1560], ['briars', 2700], ['bridge', 4000], ['mine', 7460], ['unicorn', 9900], ['bones', 11300]];
/** Where he has a horny thought (once each, if nobody's talking). */
export const HORNY_AT = [3650, 8050];
