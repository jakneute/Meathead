// Sawdust Gulch and the mines, laid out (x from the section's start, heights up from the ground line: Y(h) = GY - h;
// the mines go down: negative heights). The PARK's mining and logging town (false fronts, plywood, fake gold, guests,
// staff in costume), then down the Mother Lode Mine (a guided-tour attraction gone wrong) and up into the log ride's
// queue. Teach, then escalate:
//
//   0      END OF THE LINE (cp 20): the smashed buffer stop, the engine nosed into it steaming (the visit of the crash),
//          gawking guests; a covered stretcher carried off to FIRST AID (Tucker: never seen). The depot.
//   500    MAIN STREET (cp 21 at 1300): deputies (one alone first, then on a balcony), the snake-oil wagon (tonic bottles
//          burst into a fume cloud: alone first), the water tower (a deputy up on its catwalk), the barbershop quartet
//          (SHAVE AND A HAIRCUT... TWO BITS!), the undertaker (measures him first) by his parlor (the empty coffin with
//          Tucker's name on it).
//   2500   THE SALOON (cp 22 at 2440): in through the swinging doors; the brawl (the doors barred, the camera on the
//          room): a bouncer and can-can dancers, then more down off the balcony; then out the upstairs window.
//   3300   THE ROOFTOPS: false-front roofs over alleys (crates to climb back out), deputies up top.
//   3900   THE SHOWDOWN (cp 23 at 3920): the Wild West Show's street (the guests in the bleachers): gates shut, the
//          sheriff calls DRAW, deputies on the balconies, then two more; a trough and barrels for cover (they stop shots).
//   4700   THE LIVERY AND THE SMITHY: farmhands with pitchforks (pointy), the hay loft, the blacksmith (hot horseshoes).
//   5300   THE MILL POND (cp 24 at 5250): a feller's TIMBER! alone on the bank first; pond A, a log alone (the land's
//          ROLLING LOGS, again); the island's feller drops his pine across the water at the log; pond B, the BIRLER on his
//          own log ramming; the JACK LADDER at its end hauls the log (and him) up to the mill deck.
//   6800   THE SAWMILL (cp 25 at 6840, up on the deck): belt one carries him (and the logs) right into the head saw (a log
//          goes in first: watch); over the saw onto belt two coming back at him with logs on it; a feller at the end.
//   7800   THE LUMBER YARD: fellers with hatchets; the mine's entrance (MOTHER LODE MINE: GUIDED TOURS).
//   8300   THE MOTHER LODE (cp 26 at 8050): down the shaft on timber landings into the dark (lanterns); a canary singing;
//          the first cave-in alone; miners (candle helmets: spiky) round a TNT crate; an ore chute.
//   8860   THE CART TRACK: runaway carts (warned, then on: jump them or hop up into the alcoves); a cave-in over the
//          rails; a TNT crate in the carts' way.
//   9230   THE TRESTLE (cp 27 at 9260): ride the cart over the chasm, duck the low beams (the first over solid ground),
//          a prospector at the far end lobbing dynamite at the cart.
//   9670   THE GAS (cp 28 at 9680): the canary dead in its cage, FIREDAMP: a shot in it sets it off; a prospector past it.
//   10000  THE FLOODED SHAFT: dive under the rock (the land's swimming, its air).
//   10330  UP AND OUT: landings up the shaft into the daylight.
//   10600  TIMBER TUMBLE (cp 29 at 10660): the log ride's queue (90 MIN FROM HERE), the station's front; on into the
//          log ride (its section).
//
// All of it goes both ways: the pond can be swum, the mill's deck walked back over the saw, the ride cart comes to
// whichever end he's at, the rubble clears, the gates open once their fights are done.

import { SECTIONS, GY } from '../geometry';

export const x0 = SECTIONS.town.x0, x1 = SECTIONS.town.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;

/** The mine's floor (feet), and its tunnel's ceiling. */
export const FLOOR_H = -420;
export const FY = Y(FLOOR_H);
export const CEIL_Y = FY - 210;

/** Ground: [from, to, height at from, height at to] (between runs: pits, all the way down; or water, below). */
export const GROUND: [number, number, number, number][] = [
  [-200, 5400, 0, 0],
  // (the mill pond: pond A's bed, the island, pond B's bed)
  [5400, 5800, -160, -160],
  [5800, 5900, 20, 20],
  [5900, 6600, -160, -160],
  [6600, 8300, 0, 0],
  // (down the shaft: the mine's floor, the trestle's chasm 9330..9670, the flooded sump's bed, up the far shaft)
  [8300, 9330, FLOOR_H, FLOOR_H],
  [9670, 10000, FLOOR_H, FLOOR_H],
  [10000, 10330, -720, -720],
  [10330, 10600, FLOOR_H, FLOOR_H],
  [10600, 11200, 0, 0],
];

/** Ledges (one-way, to stand on): [from, to, height]. Balconies, the tower's catwalk, the saloon's stairs and balcony,
 *  the alleys' crates, the square's balconies, the hay loft, the mine's landings and alcoves. */
export const LEDGES: [number, number, number][] = [
  // (main street's balconies)
  [700, 860, 120], [1050, 1250, 120], [2180, 2330, 120],
  // (the water tower's catwalk)
  [1850, 1970, 150],
  // (the saloon: the stage, the stairs up, the balcony along the back to the window)
  [2560, 2700, 30],
  [2900, 2960, 40], [2960, 3020, 80], [3020, 3080, 120], [3080, 3290, 160],
  // (the alleys' crates)
  [3490, 3530, 80], [3710, 3750, 85],
  // (the square's balconies: the bank's, the jail's)
  [4120, 4260, 120], [4540, 4680, 120],
  // (the livery's hay loft)
  [4780, 4940, 130],
  // (the shaft down: timber landings)
  [8310, 8430, -90], [8480, 8600, -180], [8310, 8430, -270], [8480, 8600, -350],
  // (the cart track's alcoves)
  [8920, 9000, -330], [9100, 9180, -330],
  // (up the far shaft)
  [10340, 10460, -330], [10480, 10590, -240], [10340, 10460, -150], [10480, 10590, -60],
];

/** Solid blocks (walls with standable tops): [from, to, height of the top, height of the bottom (default 0)]. */
export const SOLIDS: [number, number, number, number?][] = [
  // (the snake-oil wagon's bed; the tower's crate)
  [1480, 1620, 64], [1790, 1840, 70],
  // (the saloon: the bar; its walls (the door below the left one, the window in the right one); its roof)
  [2760, 2880, 44],
  [2492, 2508, 330, 110],
  [3290, 3300, 330, 250], [3290, 3300, 160, 0],
  [2500, 3300, 346, 330],
  // (the rooftops: false-front stores side by side)
  [3300, 3480, 160], [3540, 3700, 200], [3760, 3880, 150],
  // (the livery's hay bales)
  [4740, 4780, 40],
  // (the sawmill's works under its deck)
  [6800, 7780, 220],
  // (the mountain over the mine; the rock dipping under the flooded shaft's water)
  [8600, 10330, 420, -210],
  [10100, 10230, -210, -520],
];

/** Cover in the showdown (the trough, the barrels): shots stop in them. [from, to, height]. */
export const COVER: [number, number, number][] = [[4280, 4350, 30], [4440, 4470, 40]];

/** Water: the mill ponds and the flooded sump. Surface and bed as heights (Y). */
export interface Water { key: string; a: number; b: number; surface: number; bed: number; mine?: boolean }
export const WATERS: Water[] = [
  { key: 'pondA', a: X(5400), b: X(5800), surface: Y(-26), bed: Y(-160) },
  { key: 'pondB', a: X(5900), b: X(6600), surface: Y(-26), bed: Y(-160) },
  { key: 'sump', a: X(10000), b: X(10330), surface: FY + 16, bed: Y(-720), mine: true },
];

/** The rolling logs: [which water, its home (left end, x from the section's start), its length, the birler's]. */
export const LOGS: [string, number, number, boolean?][] = [
  ['pondA', 5410, 150],
  ['pondB', 5910, 150],
  ['pondB', 6250, 140, true],
];
/** The jack ladder: a log reaching pond B's right end goes up the chain onto the mill deck (and him with it). */
export const LADDER = { foot: X(6600), top: X(6810), topY: Y(220), frames: 170 } as const;

/** The sawmill's belts: [from, to, px a frame (+ right)]; the head saw between them; where logs come onto each. */
export const BELTS: [number, number, number][] = [[6810, 7220, 1.0], [7280, 7680, -1.6]];
export const SAW = { x: X(7250), y: Y(220), r: 38 } as const;
export const MILL_DECK = Y(220);

/** The prop pines the fellers drop (TIMBER!): [x of its foot, ground height, which way it falls, how long it is]. */
export const PINES: [number, number, -1 | 1, number][] = [[5330, 0, -1, 160], [5825, 20, -1, 170]];

/** Cave-ins: [x (its middle), half its width]. */
export const CAVEINS: [number, number][] = [[8660, 50], [9040, 60]];
/** Ore chutes in the ceiling: [x]. */
export const CHUTES: number[] = [8840];
/** The runaway carts' stretch (they come down it right to left), and the buffer at its foot. */
export const CART_RUN = { a: X(8860), b: X(9225) } as const;
/** The ride cart's track over the chasm (its left end's x at either end), and the low beams over it: [x, half wide]. */
export const RIDE = { a: X(9240), b: X(9600), w: 70 } as const;
export const BEAMS: [number, number][] = [[9325, 10], [9450, 10], [9560, 10]];
/** The firedamp pocket (the canary dead in its cage at its mouth). */
export const GAS = { a: X(9740), b: X(9930) } as const;
/** The canaries: [x, alive]. */
export const CANARIES: [number, boolean][] = [[8640, true], [9722, false]];
/** The mine's lanterns: [x, height]. */
export const LANTERNS: [number, number][] = [
  [8360, -40], [8550, -230], [8380, -320], [8700, -280], [8900, -280], [9120, -280], [9300, -280], [9690, -280], [9960, -280], [10050, -280], [10300, -280], [10400, -200], [10540, -100],
];

/** TNT crates (shoot or hit one: it goes up): [x, height]. */
export const CRATES: [number, number][] = [[8758, FLOOR_H], [9205, FLOOR_H]];

export type TownKind = 'deputy' | 'sheriff' | 'snakeoil' | 'barber' | 'bouncer' | 'dancer' | 'undertaker' | 'blacksmith' | 'farmhand' | 'feller' | 'birler' | 'miner' | 'prospector';
/** Who's where (outside the fights: the saloon's and the showdown's casts are theirs, scenes.ts): [kind, x, height of
 *  what it stands on, which pine it fells (PINES index)]. None in a hazard's path. */
export const CAST: [TownKind, number, number, number?][] = [
  // (main street)
  ['deputy', 820, 0], ['deputy', 1010, 0], ['deputy', 1150, 120],
  ['snakeoil', 1550, 64],
  ['deputy', 1910, 150],
  ['barber', 2110, 0], ['barber', 2150, 0], ['barber', 2190, 0], ['barber', 2230, 0],
  ['undertaker', 2400, 0],
  // (the rooftops)
  ['deputy', 3620, 200], ['deputy', 3820, 150],
  // (the livery, the smithy)
  ['farmhand', 4860, 130], ['farmhand', 4990, 0], ['blacksmith', 5060, 0],
  // (the mill pond: the bank's feller, the island's)
  ['feller', 5365, 0, 0], ['feller', 5860, 20, 1],
  // (the mill's deck end; the lumber yard)
  ['feller', 7740, 220], ['feller', 7950, 0], ['feller', 8070, 0],
  // (the mine)
  ['miner', 8735, FLOOR_H], ['miner', 8780, FLOOR_H],
  ['miner', 8960, -330], ['miner', 9140, -330],
  ['prospector', 9715, FLOOR_H], ['prospector', 9965, FLOOR_H],
  ['miner', 10400, -330], ['miner', 10410, -150],
];

/** The saloon's brawl (wave 1 where they stand; wave 2 down off the balcony): [kind, x, height]. */
export const SALOON = { a: X(2500), b: X(3300), door: X(2500), window: { x: X(3290), y0: Y(250), y1: Y(160) } } as const;
export const BRAWL: [TownKind, number, number][][] = [
  [['bouncer', 2580, 0], ['dancer', 2610, 30], ['dancer', 2670, 30]],
  [['dancer', 3160, 160], ['dancer', 3240, 160], ['bouncer', 2960, 0]],
];
/** The showdown's street (the gates at its ends), its waves. */
export const SQUARE = { a: X(3900), b: X(4700) } as const;
export const SHOWDOWN: [TownKind, number, number][][] = [
  [['sheriff', 4600, 0], ['deputy', 4190, 120], ['deputy', 4610, 120]],
  [['deputy', 3970, 0], ['deputy', 4630, 0]],
];

/** What's lying about (lean: just these). */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [1620, 64, 'small_ammo'],
  [3600, 200, 'small_health'],
  [4900, 130, 'small_ammo'],
  [7720, 220, 'small_health'],
  [9180, -330, 'small_ammo'],
  [10540, -60, 'small_health'],
];

/** Signs: [x, the ground's height there, the words (the first line big), a warning (painted, not burned)]. */
export const SIGNS: [number, number, string[], boolean?][] = [
  [330, 0, ['SAWDUST GULCH', 'POP. 40 (PAID STAFF)']],
  [1380, 0, ['WILD WEST SHOW 2PM', 'THE SHOWDOWN! BLEACHERS >']],
  [2010, 0, ['BARBERSHOP QUARTET', 'SHOWS HOURLY. NO SHAVES.']],
  [3990, 0, ['THE SHOWDOWN', 'STAY BEHIND THE ROPE'], true],
  [5100, 0, ['MILL POND', 'FELLING DEMO: STAND CLEAR'], true],
  [7800, 0, ['LUMBER YARD', 'HARD HATS (DECORATIVE)']],
  [8080, 0, ['MOTHER LODE MINE', 'GUIDED TOURS EVERY 20 MIN']],
  [8930, FLOOR_H, ['RUNAWAY CARTS', 'JUMP OR GET UP HIGH'], true],
  [9250, FLOOR_H, ['LOW BEAMS', 'DUCK ON THE CART'], true],
  [9690, FLOOR_H, ['FIREDAMP', 'NO OPEN FLAMES. NO GUNS.'], true],
  [10640, 0, ['TIMBER TUMBLE', 'LOG RIDE. WAIT: 90 MIN']],
];

export const CHECKPOINTS = [
  { name: 'END OF THE LINE', cp: 20, x: X(200), y: GY },
  { name: 'MAIN STREET', cp: 21, x: X(1300), y: GY },
  { name: 'THE SALOON', cp: 22, x: X(2440), y: GY },
  { name: 'THE SHOWDOWN', cp: 23, x: X(3920), y: GY },
  { name: 'THE MILL POND', cp: 24, x: X(5250), y: GY },
  { name: 'THE SAWMILL', cp: 25, x: X(6840), y: Y(220) },
  { name: 'THE MOTHER LODE', cp: 26, x: X(8050), y: GY },
  { name: 'THE TRESTLE', cp: 27, x: X(9265), y: FY },
  { name: 'THE CANARY', cp: 28, x: X(9680), y: FY },
  { name: 'TIMBER TUMBLE', cp: 29, x: X(10660), y: GY },
];

/** Is world (x, feet y) down in the mine? (the shafts and the tunnels, under the ground line) */
export const inMine = (x: number, y: number) => x > X(8300) && x < X(10600) && y > GY + 30;
/** Is world x inside the saloon? */
export const inSaloon = (x: number, y: number) => x > SALOON.a + 8 && x < SALOON.b - 10 && y > Y(330);
