// The town square, laid out (x from the section's start, heights up from the ground line: Y(h) = GY - h). HOGSMEAT
// VILLAGE (the Wizarding World's crooked, snow-heaped shopfronts) into the storybook square (Fantasyland's carousel, its
// gingerbread lane), parodied. Teach, then escalate: each thing alone and safe first.
//
//   0      THE STATION (cp 0): the FAIRY LAND EXPRESS at PLATFORM 7 5/8 (its brick pillar: a wall, and a step up); the
//          land's sign; a lone wand clerk.
//   1300   HOGSMEAT HIGH STREET: the first roof shedding its snow, alone over the cobbles; the BUTTER BREW cart and its
//          keg among a knight and a clerk up on a balcony (hit the keg: the foam's on them); a roof shedding snow by a
//          princess's beat.
//   3200   WANDS & SONS: THE FIRST STAIRCASE, alone and safe: it hangs off the shop's roof down to the street, swings up
//          level to a ledge (a pickup on it) and back down; ride it up to the roof, the way on (the shop's front is too
//          tall to jump). Off the far end of the roof: a bro waiting below, an owl.
//   4800   THE SQUARE (cp 1): the PRANCING PONY CAROUSEL, its canopy only up a staircase that swings between the canopy
//          and the carousel's deck, a clerk casting down from the canopy; a bro and a princess on the cobbles; an owl.
//   6400   THE GORGE (cp 2): the bottomless wishing gorge (clouds painted a long way down): a chain of staircases across
//          it by two stone columns: the first dips down into the gorge and back, the second swings up and away (a
//          ledge up there with a pickup) and back, the third swings between the far bank's street and a gingerbread
//          porch roof (a clerk on it); an owl over the gorge.
//   8600   GINGERBREAD LANE (cp 3): snow off the gingerbread roofs, the troll by his little bridge, a knight, a bro, the
//          dragon mascot; a porch to get up on; an owl.
//   10600  THE GRAND STAIRCASE (cp 4): a tower of staircases: one swings between the ground and a pier, one between the
//          pier and a high landing (or down to the ground), and the last swings away mid-climb once he's on it (run!);
//          clerks on the pier and the top landing, a bro throwing down, an owl in the shaft, a knight below. Out along
//          the beam over the top, over the tower's wall, down the far side's ledges.
//   13200  THE BANDSTAND (cp 5): a last mixed crowd (a dragon, a princess, a bro, a knight, a clerk up on a balcony);
//          the loudspeaker on its lamp post by the bandstand, the suitors round it; the scene (speaker.ts).
//
// All of it goes both ways (he'll be back through here: the staircases go on swinging; the tower's descent ledges go
// back up the way they came down; the gorge's chain works from the far side).

import { SECTIONS, GY } from '../geometry';
import { stairEnd, type StairDef } from '../stairs';

export const x0 = SECTIONS.square.x0, x1 = SECTIONS.square.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;

const L = (a: number) => Math.PI - a; // (pointing left, down by a: down-left; with a < 0: up-left)

// ---------------------------------------------------------------------------------------------------------------
// The staircases (world coordinates). Their free ends' docks decide where the landings go (below).

/** The first (WANDS & SONS): hangs off the shop roof's left corner, down to the street; swings up level, left, to the
 *  ledge with the pickup; back. */
const SHOP_ROOF = 260, SHOP = { a: 3700, b: 4100 };
const S1: StairDef = { px: X(SHOP.a), py: Y(SHOP_ROOF), len: 380, docks: [L(Math.asin(SHOP_ROOF / 380)), Math.PI], hold: 210, swing: 80 };
/** The carousel's: off the cobbles up to its canopy, and down level onto its deck. */
const CANOPY = 240, DECK = 24, CAROUSEL = { a: 5380, b: 5820 };
const S2: StairDef = { px: X(5060), py: Y(0), len: 400, docks: [-Math.asin(CANOPY / 400), -Math.asin(DECK / 400)], hold: 190, swing: 70, phase: 60 };
/** The gorge's chain. */
const GORGE = { a: 6700, b: 7930 };
const S3: StairDef = { px: X(GORGE.a), py: Y(0), len: 395, docks: [-Math.asin(100 / 395), 0.5], hold: 170, swing: 80, phase: 0 };
const C1 = { a: stairEnd(S3, 0).x - x0, top: 100 };
const S4: StairDef = { px: X(C1.a + 88), py: Y(100), len: 330, docks: [-Math.asin(80 / 330), -0.75], hold: 160, swing: 75, phase: 130 };
const C2 = { a: stairEnd(S4, 0).x - x0, top: 180 };
const S5: StairDef = { px: X(C2.a + 80), py: Y(180), len: 400, docks: [Math.asin(180 / 400), 0], hold: 180, swing: 80, phase: 60 };
const FAR_BANK = stairEnd(S5, 0).x - x0;
const PORCH = { a: stairEnd(S5, 1).x - x0, b: stairEnd(S5, 1).x - x0 + 220, h: 180 };
const REWARD = stairEnd(S4, 1);
/** The Grand Staircase. */
export const TOWER = { a: 11000, b: 12300, top: 640 };
const LA = { a: 11000, b: 11180, h: 200 };
const S6: StairDef = { px: X(LA.b), py: Y(LA.h), len: 380, docks: [Math.asin(200 / 380), 0], hold: 170, swing: 75, phase: 40 };
const PIER = { a: stairEnd(S6, 1).x - x0, b: stairEnd(S6, 1).x - x0 + 200, h: 200 };
const S7: StairDef = { px: X(PIER.b), py: Y(PIER.h), len: 400, docks: [-Math.asin(200 / 400), Math.asin(200 / 400)], hold: 180, swing: 80, phase: 110 };
const RB = { a: stairEnd(S7, 0).x - x0, b: TOWER.b, h: 400 };
const S8: StairDef = { px: X(RB.a), py: Y(RB.h), len: 400, docks: [L(-Math.asin(160 / 400)), L(0.35)], hold: 150, swing: 60, ride: 40 };
const TL = { a: stairEnd(S8, 0).x - x0 - 200, b: stairEnd(S8, 0).x - x0, h: 560 };

export const STAIRS: StairDef[] = [S1, S2, S3, S4, S5, S6, S7, S8];
/** Which staircase is the first (the teaching one: his line the first time he's on any). */
export const FIRST_STAIR = 0;

// ---------------------------------------------------------------------------------------------------------------
// Ground, ledges, walls

/** Ground: [from, to, height]. Between runs: the gorge (all the way down: clouds painted at the bottom). */
export const GROUND: [number, number, number][] = [
  [-200, GORGE.a, 0],
  [FAR_BANK, x1 - x0 + 200, 0],
];
export { GORGE, FAR_BANK };
/** Solid things (walls with a standable top, lit along it): [from, to, top height, bottom height (default the ground's,
 *  deep below for the gorge's columns)]. */
export const SOLIDS: [number, number, number, number?][] = [
  // (the PLATFORM 7 5/8 pillar: a brick wall, a step up)
  [700, 760, 90],
  // (WANDS & SONS: the shop, too tall to jump; its roof the way on)
  [SHOP.a, SHOP.b, SHOP_ROOF],
  // (the gorge's two stone columns, from way down)
  [C1.a, C1.a + 88, C1.top, -1600], [C2.a, C2.a + 80, C2.top, -1600],
  // (the tower's far wall: the way out's over the top)
  [TOWER.b, TOWER.b + 60, 600],
  // (the bandstand's floor: a step up)
  [14450, 14820, 24],
];
export const PILLAR = { a: 700, b: 760, h: 90 };
export { SHOP, SHOP_ROOF, CAROUSEL, CANOPY, DECK, C1, C2, PORCH, LA, PIER, RB, TL };
/** Ledges (one-way, to stand on): [from, to, height]. */
export const LEDGES: [number, number, number][] = [
  // (the high street: a balcony over the butter brew cart, the clerk's)
  [2080, 2220, 120],
  // (the first staircase's swing-up ledge, with its pickup)
  [stairEnd(S1, 1).x - x0 - 150, stairEnd(S1, 1).x - x0, SHOP_ROOF],
  // (the carousel: its deck and its canopy)
  [CAROUSEL.a, CAROUSEL.b, DECK], [CAROUSEL.a - 20, CAROUSEL.b + 20, CANOPY],
  // (the gorge: the reward ledge up where the second staircase swings to; the gingerbread porch roof)
  [REWARD.x - x0 - 90, REWARD.x - x0 + 6, REWARD.y < GY ? GY - REWARD.y : 0],
  [PORCH.a, PORCH.b, PORCH.h],
  // (gingerbread lane: a porch to get up on)
  [9200, 9350, 130],
  // (the tower: the left landing, the pier, the high right landing, the top landing, the beam out over the wall)
  [LA.a, LA.b, LA.h], [PIER.a, PIER.b, PIER.h], [RB.a, RB.b, RB.h], [TL.a, TL.b, TL.h],
  [TL.b + 60, TOWER.b + 260, TOWER.top],
  // (the descent down the far side)
  [12600, 12740, 500], [12780, 12920, 370], [12960, 13100, 240], [13140, 13280, 110],
  // (the bandstand: a balcony over the street, a clerk's)
  [13900, 14060, 140],
];

// ---------------------------------------------------------------------------------------------------------------
// The cast, the hazards, the pickups, the checkpoints

/** [kind, x, height of its feet]. */
export const CAST: [string, number, number][] = [
  ['m2:fa_clerk', 1100, 0],
  ['m2:fa_clerk', 2150, 120], ['m2:fa_knight', 2620, 0], ['m2:fa_princess', 2840, 0],
  ['m2:fa_bro', 4320, 0], ['m2:fa_owl', 4620, 300],
  ['m2:fa_clerk', 5680, CANOPY], ['m2:fa_bro', 6020, 0], ['m2:fa_princess', 6250, 0], ['m2:fa_owl', 5900, 330],
  ['m2:fa_owl', 7300, 380], ['m2:fa_clerk', PORCH.a + 150, PORCH.h], ['m2:fa_knight', 8350, 0],
  ['m2:fa_troll', 9480, 0], ['m2:fa_knight', 9720, 0], ['m2:fa_bro', 10010, 0], ['m2:fa_dragon', 10220, 0], ['m2:fa_owl', 9600, 270],
  ['m2:fa_knight', 11320, 0], ['m2:fa_clerk', PIER.a + 120, PIER.h], ['m2:fa_bro', RB.a + 120, RB.h], ['m2:fa_owl', 11900, 440], ['m2:fa_clerk', TL.a + 60, TL.h],
  ['m2:fa_dragon', 13520, 0], ['m2:fa_princess', 13680, 0], ['m2:fa_bro', 13820, 0], ['m2:fa_clerk', 13990, 140], ['m2:fa_knight', 14020, 0],
];
/** The snow off the roofs: [x (the slab's middle), the eave's height, its cycle's phase]. Nobody of the cast stands under one. */
export const SNOW: [number, number, number][] = [[1760, 160, 0], [2960, 150, 90], [9160, 140, 40], [9910, 150, 150]];
/** The butter brew cart (its keg at x). */
export const CART = 2360;
/** Pickups (lean): [x, height, type]. */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [stairEnd(S1, 1).x - x0 - 80, SHOP_ROOF, 'small_health'],
  [CAROUSEL.b - 60, CANOPY, 'small_ammo'],
  [REWARD.x - x0 - 40, GY - REWARD.y, 'small_health'],
  [LA.a + 60, LA.h, 'small_ammo'],
  [TL.a + 150, TL.h, 'small_health'],
  [13380, 0, 'small_ammo'],
];
export const CHECKPOINTS = [
  { name: 'THE STATION', cp: 0, x: X(200), y: GY },
  { name: 'THE SQUARE', cp: 1, x: X(4900), y: GY },
  { name: 'THE GORGE', cp: 2, x: X(6480), y: GY },
  { name: 'GINGERBREAD LANE', cp: 3, x: X(8700), y: GY },
  { name: 'THE GRAND STAIRCASE', cp: 4, x: X(10700), y: GY },
  { name: 'THE BANDSTAND', cp: 5, x: X(13300), y: GY },
];

/** The bandstand and the loudspeaker: the lamp post's x, where the scene starts, where he's walked to for it. */
export const SPEAKER = { post: 14360, hornH: 210, trigger: 14120, stop: 14250, stand: { a: 14450, b: 14820 } };
/** The suitors round the bandstand (x, feet height, facing). */
export const SUITOR_SPOTS: [number, number, 1 | -1][] = [[14520, 24, -1], [14650, 24, -1], [14770, 24, -1]];

/** Once each, passing: [the gag, from x]. */
export const GAG_AT: [string, number][] = [['butter', 2200], ['carousel', 5200], ['gorge', 6520], ['troll', 9100], ['tower', 10760]];
