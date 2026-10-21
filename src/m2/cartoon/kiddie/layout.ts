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

/** [kind, x, height of its feet, variant (the Whatsits' number)]. */
export const CAST: [string, number, number, number?][] = [
  ['m2:ct_hatcat', 1050, 0],
  ['m2:ct_painter', 2350, 0],
  ['m2:ct_whatsit', 3330, 0, 1], ['m2:ct_whatsit', 3420, 0, 2],
  ['m2:ct_painter', 4460, 0], ['m2:ct_hatcat', 4640, 0],
  ['m2:ct_vendor', 4880, 0],
  ['m2:ct_mascot', 6260, 0],
  ['m2:ct_whatsit', 8080, 0, 1], ['m2:ct_whatsit', 8170, 0, 2], ['m2:ct_vendor', 8320, 0],
  ['m2:ct_hatcat', 8440, 0], ['m2:ct_painter', 9830, 110],
  ['m2:ct_vendor', 10400, HATTERY.h],
  ['m2:ct_painter', 12670, 140], ['m2:ct_mascot', 12960, 0], ['m2:ct_hatcat', 13160, 0],
  ['m2:ct_whatsit', 13330, 0, 1], ['m2:ct_whatsit', 13410, 0, 2], ['m2:ct_vendor', 13520, 0],
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
