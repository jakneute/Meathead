// Sillyville Square, laid out (x from the section's start, heights up from the ground line: Y(h) = GY - h). A kiddie
// area built like a picture book (Seuss Landing, parodied): curvy candy-striped buildings with no straight lines,
// puff-ball trees, kiddie rides that are moving hazards (they hurt him and the cast alike), bottomless ball pits, and
// the land's new mechanic, the SWAYING STACK-TOWERS (cartoon/sway.ts). Teach, then escalate: each thing alone and
// safe first. Every bit of it goes both ways (he'll be back through here): every tower chain has a way back.
//
//   0      THE GATE (cp 0): the land's sign, SILLYVILLE SQUARE; the YOU MUST BE THIS SHORT TO RIDE stick; a lone hat cat.
//   1300   THE FIRST TOWER, alone and safe: up off a toadstool onto its lid; stand on its right and it leans over to the
//          SWEET-TOOTH SHOPPE's roof (too tall to jump; a pickup up there); steps down its far side.
//   2400   THE FIRST BALL PIT (BOTTOMLESS, LAST KID FOUND 1997): a face painter on the near bank; a tower on each bank
//          leaning out over it (the near one there, the far one back).
//   3100   THE WUMPLE-GO-ROUND (cp 1): the Whatsits; the kiddie carousel's made-up beasts going round (the front half
//          of the turn hits), a tower up to its canopy (a pickup) to go over them instead; a painter and a cat past it.
//   4800   THE WISH-FISH SPINNER: a balloon vendor (balloon dogs drifting over); the fish going round and up and down;
//          a tower past it that leans back into the fish's way (or on to the ONE-SCOOP SHOPPE's balcony: a pickup);
//          the sugar-crazed mascot.
//   6400   THE BOTTOMLESS BALL PIT (cp 2): a chain of three towers across it, a gumdrop ledge to the far bank; the
//          Whatsits' kites over it from the far bank; a vendor.
//   8250   THE SNOOZLE CHOO (cp 3): the kiddie train out of its tunnel at him along the ground (jump it); a cat; a
//          painter on a step over the track; a tower up to the hat shop's roof (the trolley's station).
//   10000  THE SKY-HIGH TROLLEY (cp 4): along the trolley's track over a ball pit, the trolley coming up behind him (the
//          bell first): up onto a tower's lid over it till it's by (lean too far and it's in the trolley's way); a
//          vendor on the station's roof; down off the far end.
//   12400  THE STUDIO DOOR (cp 5): the mascot and a mixed crowd; LEARN THE MAGIC OF HOW CARTOONS ARE MADE (EST. 1994):
//          its front door's the way on.

import { SECTIONS, GY } from '../geometry';
import type { TowerDef } from '../sway';

export const x0 = SECTIONS.kiddie.x0, x1 = SECTIONS.kiddie.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// Ground, the ball pits, solids, ledges

/** The ball pits (no ground: fall in and he's spat back out, hurt): [from, to]. */
export const PITS: [number, number][] = [[2700, 2960], [6700, 7900], [10520, 12000]];
/** Ground: [from, to] at the ground line (between: the pits). */
export const GROUND: [number, number][] = [[-200, 2700], [2960, 6700], [7900, 10520], [12000, 14200]];

/** The SWEET-TOOTH SHOPPE (the first tower's lesson: too tall to jump, its roof the way on). */
export const SHOP = { a: 1760, b: 2140, h: 250 };
/** The HAT-HAT HATTERY (the trolley's station: its roof, the way onto the track; the trolley comes out of its wall). */
export const HATTERY = { a: 10150, b: 10500, h: 260 };
/** Solid things (walls with a standable top, lit along it): [from, to, top height]. */
export const SOLIDS: [number, number, number][] = [[SHOP.a, SHOP.b, SHOP.h], [HATTERY.a, HATTERY.b, HATTERY.h]];

/** The rides. */
export const CAROUSEL = { cx: 3990, r: 270, deck: 20, canopy: 250 };
export const SPINNER = { cx: 5450, r: 240, lo: 40, hi: 230 };
export const TRAIN = { a: 8500, b: 9750 };
export const TROLLEY = { a: 10500, b: 12100, h: 200 };
/** The ONE-SCOOP SHOPPE's balcony (the spinner's tower leans over to it). */
export const BALCONY = { a: 6000, b: 6140, h: 230 };
/** The big pit's gumdrop ledge (on its stalk out of the balls). */
export const GUMDROP = { a: 7700, b: 7840, h: 150 };

/** The toadstools (the steps up: spotted caps on fat stalks): [from, to, height]. */
export const TOADS: [number, number, number][] = [
  // (the first tower's; the shop's far step down)
  [1340, 1430, 100], [2160, 2260, 125],
  // (the first pit's: up onto the near tower, and the far one (the way back))
  [2480, 2560, 90], [3150, 3230, 90],
  // (up the carousel's tower)
  [3380, 3460, 120],
  // (up the spinner's tower)
  [5750, 5830, 120],
  // (the big pit's near and far banks)
  [6560, 6690, 100], [7900, 8000, 75],
  // (over the train track's end, up onto the hattery's tower)
  [9790, 9870, 110],
  // (back up onto the trolley track's far end)
  [12080, 12220, 100],
];
/** The studio square's balcony (a painter's). */
export const END_BALCONY = { a: 12600, b: 12740, h: 140 };
/** Ledges (one-way, to stand on): [from, to, height]. */
export const LEDGES: [number, number, number][] = [
  ...TOADS,
  // (the carousel: its deck, its canopy)
  [CAROUSEL.cx - CAROUSEL.r - 20, CAROUSEL.cx + CAROUSEL.r + 20, CAROUSEL.deck], [CAROUSEL.cx - CAROUSEL.r - 30, CAROUSEL.cx + CAROUSEL.r + 30, CAROUSEL.canopy],
  [BALCONY.a, BALCONY.b, BALCONY.h], [GUMDROP.a, GUMDROP.b, GUMDROP.h],
  [TROLLEY.a, TROLLEY.b, TROLLEY.h],
  // (the beam's last bit, on into the end station's doorway)
  [TROLLEY.b, TROLLEY.b + 14, TROLLEY.h],
  [END_BALCONY.a, END_BALCONY.b, END_BALCONY.h],
];

// ---------------------------------------------------------------------------------------------------------------
// The towers (world coordinates)

const T = (rx: number, h: number, extra: Partial<TowerDef> = {}): TowerDef => ({ x: X(rx), y: GY, h, ...extra });
export const TOWERS: TowerDef[] = [
  // (the first: alone, safe, over the street)
  T(1520, 200, { tiers: ['#F472B6', '#FFF7E8', '#F472B6', '#FFF7E8', '#FDE047'] }),
  // (the first pit's: out over it, and back)
  T(2600, 200), T(3060, 200, { tiers: ['#60A5FA', '#FDE047', '#60A5FA', '#FDE047'] }),
  // (up to the carousel's canopy)
  T(3540, 230, { tiers: ['#C084FC', '#FB923C', '#C084FC', '#FB923C', '#FFF7E8'] }),
  // (by the spinner: leans back into the fish, or over to the balcony)
  T(5880, 230, { lean: 0.55, tiers: ['#34D399', '#F472B6', '#34D399', '#F472B6', '#FDE047'] }),
  // (the big pit's chain)
  T(6800, 200), T(7150, 220, { tiers: ['#FB923C', '#FFF7E8', '#FB923C', '#FFF7E8', '#60A5FA'] }), T(7500, 200, { tiers: ['#C084FC', '#34D399', '#C084FC', '#34D399'] }),
  // (up to the hattery's roof)
  T(9940, 220, { tiers: ['#F472B6', '#60A5FA', '#F472B6', '#60A5FA', '#FFF7E8'] }),
  // (the trolley's: lids over its track)
  T(10900, 300), T(11400, 300, { tiers: ['#FDE047', '#C084FC', '#FDE047', '#C084FC', '#FDE047', '#C084FC'] }), T(11850, 300, { tiers: ['#34D399', '#FB923C', '#34D399', '#FB923C', '#34D399'] }),
];
/** Which towers stand in a ball pit (their foot's drawn rising out of the balls). */
export const IN_PIT = new Set([5, 6, 7, 9, 10, 11]);

// ---------------------------------------------------------------------------------------------------------------
// The cast, the pickups, the checkpoints

/** [kind, x, height of its feet, variant (the Whatsits' number)]. Encounter pass (cartoon-spec.md, 2026-10-21): nobody
 *  within a checkpoint's safe reach (spawnSafe.ts SAFE_X), heights and pairs so no stretch is walk-right-and-fire. */
export const CAST: [string, number, number, number?][] = [
  // (the gate: a cat alone on the flat, taught; then another up on the shoppe's roof, waiting where the first tower
  // leans him over: the umbrella's pointy, so no charging in: shoot him or knock him off the roof)
  ['m2:ct_hatcat', 1050, 0], ['m2:ct_hatcat', 1990, SHOP.h],
  ['m2:ct_painter', 2350, 0],
  // (the Wumple-Go-Round: a painter up on the canopy flicking blobs down at him among the beasts (the tower's way up
  // meets her: shove her off into them); past it the Whatsits' pair, kites diving from above and a dash along the
  // ground at once; the cat at the spinner's edge, hats flying in while the fish go round)
  ['m2:ct_painter', 4110, CAROUSEL.canopy],
  ['m2:ct_whatsit', 4480, 0, 1], ['m2:ct_whatsit', 4570, 0, 2],
  ['m2:ct_hatcat', 4980, 0],
  // (past the spinner: the vendor on the tower's step (balloon dogs from up there; shove him off into the fish) and
  // the mascot under him leaping at him as he comes out of the fish (leaps into them if he hangs back); the candle's
  // spiky: no dive kick)
  ['m2:ct_vendor', 5790, 120], ['m2:ct_mascot', 5990, 0],
  // (the big pit: the Whatsits on the gumdrop, kites diving at him on the swaying lids; land on it and one shove or
  // charge sends both into the balls)
  ['m2:ct_whatsit', 7735, GUMDROP.h, 1], ['m2:ct_whatsit', 7805, GUMDROP.h, 2],
  // (the hattery's roof, its far end: balloon dogs drifting out over the trolley's pit after him on the lids)
  ['m2:ct_vendor', 10460, HATTERY.h],
  // (the studio square, out of the door checkpoint's reach: a painter, the mascot, then the Whatsits lined up in front
  // of the cat (charge the pair and they chain; charge the cat and the umbrella gets him), the vendor back by the door)
  ['m2:ct_painter', 12850, 0], ['m2:ct_mascot', 13020, 0],
  ['m2:ct_whatsit', 13220, 0, 1], ['m2:ct_whatsit', 13290, 0, 2], ['m2:ct_hatcat', 13420, 0], ['m2:ct_vendor', 13600, 0],
];
/** Pickups (lean): [x, height, type]. */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [2060, SHOP.h, 'small_health'],
  [CAROUSEL.cx, CAROUSEL.canopy, 'small_ammo'],
  [BALCONY.a + 90, BALCONY.h, 'small_health'],
  [GUMDROP.a + 70, GUMDROP.h, 'small_ammo'],
  [HATTERY.a + 140, HATTERY.h, 'small_health'],
  [12500, 0, 'small_ammo'],
];
export const CHECKPOINTS = [
  { name: 'SILLYVILLE SQUARE', cp: 0, x: X(200), y: GY },
  { name: 'THE WUMPLE-GO-ROUND', cp: 1, x: X(3100), y: GY },
  { name: 'THE BOTTOMLESS BALL PIT', cp: 2, x: X(6420), y: GY },
  { name: 'THE SNOOZLE CHOO', cp: 3, x: X(8250), y: GY },
  { name: 'THE SKY-HIGH TROLLEY', cp: 4, x: X(10030), y: GY },
  { name: 'THE STUDIO DOOR', cp: 5, x: X(12400), y: GY },
];

/** The studio's front: its facade, its door (walk in: on to the studio). */
export const STUDIO = { a: 13280, b: 14000, door: 13840 };

/** Once each, passing: [the gag, from x]. */
export const GAG_AT: [string, number][] = [['height', 760], ['pit', 2420], ['carousel', 3480], ['fish', 4960], ['train', 8460], ['trolley', 10060], ['door', 13560]];

/** The signs: [x, feet height, lines, board, tall]. */
export const SIGNS: [number, number, string[], string?, number?][] = [
  [520, 0, ['CARTOON LAND', 'SILLYVILLE SQUARE', 'RIDES FOR THE LITTLE ONES'], '#7C3AED', 150],
  [2400, 0, ['BOTTOMLESS BALL PIT', 'LAST KID FOUND: 1997'], '#BE123C', 130],
  [6470, 0, ['BOTTOMLESS BALL PIT', 'PLEASE DO NOT FEED THE PIT'], '#BE123C', 130],
  [12300, 0, ['THIS WAY TO THE MAGIC', 'OF HOW CARTOONS ARE MADE >'], '#0EA5E9', 120],
];
