// Sawdust Gulch and the mines, laid out (x from the section's start, heights up from the ground line: Y(h) = GY - h;
// the mines go down: negative heights). The PARK's mining and logging town (false fronts, plywood, fake gold, guests,
// staff in costume), then down the Mother Lode Mine (a guided-tour attraction gone wrong) and up into the log ride's
// queue. Teach, then escalate. (The playtest: "the general size of everything should be larger here": the fronts, the
// doors, the saloon and the street much bigger, the props a bit; the camera pulled back to 0.8, see view.ts.)
//
//   0      END OF THE LINE (cp 20): the crash (crash.ts, a cutscene in from the train: the engine through the buffer
//          stop into the depot, the cars jackknifed, Tucker thrown out face first, paramedics carrying him into FIRST
//          AID), then its wreck for the visit (fires, steam, debris; gawking guests). The depot.
//   800    MAIN STREET (cp 21 at 2000): deputies (one alone first, then on the bank's balcony), the snake-oil wagon
//          (tonic bottles burst into a fume cloud), the water tower (a deputy up on its catwalk), the barbershop quartet
//          (SHAVE AND A HAIRCUT... TWO BITS!), the undertaker (measures him first) by his parlor (Tucker's empty coffin).
//   3800   THE SALOON (cp 22 at 3700): in through the batwing doors. Calm (cards, the piano, the can-can, the bar) till
//          he starts something: BRAWL! (the doors barred), everybody at everybody; the last man standing gets out the
//          back door (locked till then).
//   4900   THE ROOFTOPS: out the back into the alley; false-front roofs over alleys (crates back up), deputies up top.
//   5960   THE SHOWDOWN (cp 23 at 5920): the Wild West Show's street (the guests in the bleachers): gates shut, the
//          duel (DRAW!) with the sheriff on a clear street; shooting before the DRAW brings his posse.
//   7000   THE LIVERY AND THE SMITHY: farmhands with pitchforks (pointy), the hay loft, the blacksmith (hot horseshoes).
//   8300   THE MILL POND (cp 24 at 8250): a feller's TIMBER! alone on the bank first; pond A, a log alone (the land's
//          ROLLING LOGS, again); the island's feller drops his pine across the water at the log; pond B, the BIRLER on
//          his own log ramming; the JACK LADDER at its end hauls the log (and him) up to the mill deck.
//   9800   THE SAWMILL (cp 25 at 9840, up on the deck): belt one carries him (and the logs) right into the head saw;
//          over the saw onto belt two coming back at him with logs on it; a feller at the end.
//   10800  THE LUMBER YARD: fellers with hatchets; the mine's entrance (MOTHER LODE MINE: GUIDED TOURS).
//   11300  THE MOTHER LODE (cp 26 at 11050): down the shaft on timber landings into the dark (lanterns); a canary
//          singing; the first cave-in alone; miners (candle helmets: spiky) round a TNT crate; an ore chute.
//   11860  THE CART TRACK: runaway carts (warned, then on: jump them or hop up into the alcoves); a cave-in over the
//          rails; a TNT crate in the carts' way.
//   12230  THE TRESTLE (cp 27 at 12265): ride the cart over the chasm, duck the low beams, a prospector at the far end.
//   12670  THE GAS (cp 28 at 12680): the canary dead in its cage, FIREDAMP: a shot in it sets it off; a prospector.
//   13000  THE FLOODED SHAFT: a long swim under the rock, down under a low hump and up again (the playtest: longer, NO
//          air pockets: quick, it's comfortable; dawdle, he drowns).
//   14420  UP AND OUT: landings up the far shaft into the daylight (its mouth fenced, the ground beside it).
//   14690  TIMBER TUMBLE (cp 29 at 14760): the log ride's queue, sold as a LONG wait (switchbacks rows deep on real
//          ground, WAIT FROM HERE boards every so often, bored guests, the flume on its trestles behind), the station's
//          front; on into the log ride (its section).
//
// All of it goes both ways: the pond can be swum, the mill's deck walked back over the saw, the ride cart comes to
// whichever end he's at, the rubble clears, the doors and gates open once their fights are done.

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
  // (from well back of the section's start: the crash's wide shot sees the line coming in; the end wall's at 0)
  [-900, 8400, 0, 0],
  // (the mill pond: pond A's bed, the island, pond B's bed)
  [8400, 8800, -160, -160],
  [8800, 8900, 20, 20],
  [8900, 9600, -160, -160],
  [9600, 11300, 0, 0],
  // (down the shaft: the mine's floor, the trestle's chasm 12330..12670, the flooded shaft's bed, up the far shaft)
  [11300, 12330, FLOOR_H, FLOOR_H],
  [12670, 13000, FLOOR_H, FLOOR_H],
  [13000, 14420, -880, -880],
  [14420, 14690, FLOOR_H, FLOOR_H],
  [14690, 15900, 0, 0],
];

/** Ledges (one-way, to stand on): [from, to, height]. Balconies, the tower's catwalk, the saloon's stage, tables, stairs
 *  and balcony, the square's balconies, the hay loft, the mine's landings and alcoves. */
export const LEDGES: [number, number, number][] = [
  // (main street: the bank's balcony; the water tower's catwalk)
  [1560, 1800, 160],
  [2620, 2780, 190],
  // (the saloon: the stage, the card tables, the stairs up (from the back wall), the balcony with its rooms)
  [3850, 4060, 36],
  [4110, 4180, 40], [4620, 4690, 40],
  [4840, 4892, 50], [4780, 4840, 100], [4720, 4780, 150], [4260, 4720, 200],
  // (the square's balconies: the bank's, the jail's)
  [6000, 6180, 170], [6740, 6920, 170],
  // (the livery's hay loft)
  [7120, 7400, 170],
  // (the shaft down: timber landings)
  [11310, 11430, -90], [11480, 11600, -180], [11310, 11430, -270], [11480, 11600, -350],
  // (the cart track's alcoves)
  [11920, 12000, -330], [12100, 12180, -330],
  // (up the far shaft)
  [14430, 14550, -330], [14570, 14680, -240], [14430, 14550, -150], [14570, 14680, -60],
];

/** Solid blocks (walls with standable tops): [from, to, height of the top, height of the bottom (default 0)]. */
export const SOLIDS: [number, number, number, number?][] = [
  // (the snake-oil wagon's bed; the tower's crate)
  [2150, 2350, 80], [2560, 2620, 95],
  // (the saloon: the bar; its walls over the doors (the batwings at its front, the back door at its back); its roof)
  [4250, 4560, 52],
  [3792, 3808, 470, 120], [4892, 4908, 470, 120],
  [3790, 4910, 486, 470],
  // (the alley's crates; the rooftops: false-front stores side by side)
  // (the first crate stands off the saloon's back door, against the store: it blocked the way out, the playtest)
  [4965, 5000, 95], [5280, 5320, 95], [5580, 5620, 100],
  [5000, 5250, 190], [5330, 5560, 280], [5640, 5850, 200],
  // (the livery's hay bales)
  [7040, 7100, 70],
  // (the sawmill's works under its deck)
  [9800, 10780, 220],
  // (the mountain over the mine; the rock down into the flooded shaft, and the hump under it)
  [11600, 14420, 420, -210],
  [13120, 14300, -210, -560],
  [13520, 13860, -560, -740],
];

/** Cover in the showdown's posse fight (the trough behind the sheriff's mark: never in the duel's lane): shots stop in
 *  it. [from, to, height]. */
export const COVER: [number, number, number][] = [[6850, 6920, 30]];

/** Water: the mill ponds and the flooded shaft. Surface and bed as heights (Y). */
export interface Water { key: string; a: number; b: number; surface: number; bed: number; mine?: boolean }
export const WATERS: Water[] = [
  { key: 'pondA', a: X(8400), b: X(8800), surface: Y(-26), bed: Y(-160) },
  { key: 'pondB', a: X(8900), b: X(9600), surface: Y(-26), bed: Y(-160) },
  { key: 'sump', a: X(13000), b: X(14420), surface: FY + 16, bed: Y(-880), mine: true },
];

/** The rolling logs: [which water, its home (left end, x from the section's start), its length, the birler's]. */
export const LOGS: [string, number, number, boolean?][] = [
  ['pondA', 8410, 150],
  ['pondB', 8910, 150],
  ['pondB', 9250, 140, true],
];
/** The jack ladder: a log reaching pond B's right end goes up the chain onto the mill deck (and him with it). */
export const LADDER = { foot: X(9600), top: X(9810), topY: Y(220), frames: 170 } as const;

/** The sawmill's belts: [from, to, px a frame (+ right)]; the head saw between them; where logs come onto each. */
export const BELTS: [number, number, number][] = [[9810, 10220, 1.0], [10280, 10680, -1.6]];
export const SAW = { x: X(10250), y: Y(220), r: 38 } as const;
export const MILL_DECK = Y(220);

/** The prop pines the fellers drop (TIMBER!): [x of its foot, ground height, which way it falls, how long it is]. */
export const PINES: [number, number, -1 | 1, number][] = [[8330, 0, -1, 200], [8825, 20, -1, 210]];

/** Cave-ins: [x (its middle), half its width]. */
export const CAVEINS: [number, number][] = [[11660, 50], [12040, 60]];
/** Ore chutes in the ceiling: [x]. */
export const CHUTES: number[] = [11840];
/** The runaway carts' stretch (they come down it right to left), and the buffer at its foot. */
export const CART_RUN = { a: X(11860), b: X(12225) } as const;
/** The ride cart's track over the chasm (its left end's x at either end), and the low beams over it: [x, half wide]. */
export const RIDE = { a: X(12240), b: X(12600), w: 70 } as const;
export const BEAMS: [number, number][] = [[12325, 10], [12450, 10], [12560, 10]];
/** The beams come down solid to this far over the ride cart's floor (his feet in it), drawn and hit alike (the log
 *  ride's DUCK_LINE way): stood up, his head (70 over his feet) is well into it; ducked (55), well under it. */
export const BEAM_GAP = 63;
/** His head's top over his feet, stood up and ducked (as he's drawn). */
export const HEAD_UP = 71, HEAD_DUCKED = 55;
/** The trestle's chasm (under the ride cart's rails). */
export const CHASM = { a: X(12330), b: X(12670) } as const;
/** The firedamp pocket (the canary dead in its cage at its mouth). */
export const GAS = { a: X(12740), b: X(12930) } as const;
/** The canaries: [x, alive]. */
export const CANARIES: [number, boolean][] = [[11640, true], [12722, false]];
/** The mine's lanterns: [x, height]. */
export const LANTERNS: [number, number][] = [
  [11360, -40], [11550, -230], [11380, -320], [11700, -280], [11900, -280], [12120, -280], [12300, -280], [12690, -280],
  [12960, -280], [13060, -300], [14360, -300], [14490, -200], [14630, -100],
];

/** TNT crates (shoot or hit one: it goes up): [x, height]. */
export const CRATES: [number, number][] = [[11758, FLOOR_H], [12205, FLOOR_H]];

export type TownKind = 'deputy' | 'sheriff' | 'snakeoil' | 'barber' | 'bouncer' | 'dancer' | 'patron' | 'undertaker' | 'blacksmith' | 'farmhand' | 'feller' | 'birler' | 'miner' | 'prospector';
/** Who's where (outside the fights: the saloon's and the showdown's casts are theirs, scenes.ts): [kind, x, height of
 *  what it stands on, which pine it fells (PINES index)]. None in a hazard's path. */
export const CAST: [TownKind, number, number, number?][] = [
  // (main street)
  ['deputy', 1150, 0], ['deputy', 1450, 0], ['deputy', 1700, 160],
  ['snakeoil', 2250, 80],
  ['deputy', 2700, 190],
  ['barber', 3000, 0], ['barber', 3050, 0], ['barber', 3100, 0], ['barber', 3150, 0],
  ['undertaker', 3520, 0],
  // (the rooftops)
  ['deputy', 5450, 280], ['deputy', 5760, 200],
  // (the livery, the smithy)
  ['farmhand', 7300, 170], ['farmhand', 7520, 0], ['blacksmith', 7720, 0],
  // (the mill pond: the bank's feller, the island's)
  ['feller', 8365, 0, 0], ['feller', 8860, 20, 1],
  // (the mill's deck end; the lumber yard)
  ['feller', 10740, 220], ['feller', 10950, 0], ['feller', 11070, 0],
  // (the mine)
  ['miner', 11735, FLOOR_H], ['miner', 11780, FLOOR_H],
  ['miner', 11960, -330], ['miner', 12140, -330],
  ['prospector', 12715, FLOOR_H], ['prospector', 12955, FLOOR_H],
  ['miner', 14490, -330], ['miner', 14500, -150],
];

/** The saloon: its walls (the batwing doors in the front one, the back door, locked, in the back one), its roof. */
export const SALOON = { a: X(3800), b: X(4900), top: Y(470), doorTop: Y(120) } as const;
/** Who's in the saloon, calm till he starts something (then everybody at everybody): [kind, x, height]. The barkeep
 *  and the piano player are scenery (they duck and play on). */
export const SALOON_CAST: [TownKind, number, number][] = [
  ['bouncer', 3880, 0],
  ['dancer', 3920, 36], ['dancer', 4000, 36],
  ['patron', 4100, 0], ['patron', 4175, 0], ['patron', 4225, 0],
  ['patron', 4610, 0], ['patron', 4660, 0], ['patron', 4720, 0],
  ['patron', 4380, 200], ['patron', 4560, 200],
];
/** The showdown's street (the gates at its ends), the duel's marks (his, the sheriff's: nothing between them). */
export const SQUARE = { a: X(5960), b: X(6960), mine: X(6160), his: X(6760) } as const;
/** The sheriff's posse (shooting before the DRAW brings them): waves, the next when the last is down to one. */
export const POSSE: [TownKind, number, number][][] = [
  [['sheriff', 6800, 0], ['deputy', 6090, 170], ['deputy', 6830, 170]],
  [['sheriff', 6940, 0], ['deputy', 6010, 0], ['deputy', 6880, 170]],
];

/** The log ride's queue (the switchbacks), and the station's front at the section's end. */
export const QUEUE = { a: X(14750), b: X(15480) } as const;
export const STATION = { a: X(15480), b: X(15800) } as const;

/** What's lying about (lean: just these). */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [2335, 80, 'small_ammo'],
  [5360, 280, 'small_health'],
  [7380, 170, 'small_ammo'],
  [10720, 220, 'small_health'],
  [12180, -330, 'small_ammo'],
  [14630, -60, 'small_health'],
];

/** Signs: [x, the ground's height there, the words (the first line big), a warning (painted, not burned)]. Each is kept
 *  on its stretch of ground (art.ts: never out over an edge or into a wall). */
export const SIGNS: [number, number, string[], boolean?][] = [
  [880, 0, ['SAWDUST GULCH', 'POP. 40 (PAID STAFF)']],
  [1950, 0, ['WILD WEST SHOW 2PM', 'THE SHOWDOWN! BLEACHERS >']],
  [2850, 0, ['BARBERSHOP QUARTET', 'SHOWS HOURLY. NO SHAVES.']],
  [5870, 0, ['THE SHOWDOWN', 'STAY BEHIND THE ROPE'], true],
  [8100, 0, ['MILL POND', 'FELLING DEMO: STAND CLEAR'], true],
  [10800, 0, ['LUMBER YARD', 'HARD HATS (DECORATIVE)']],
  [11080, 0, ['MOTHER LODE MINE', 'GUIDED TOURS EVERY 20 MIN']],
  [11930, FLOOR_H, ['RUNAWAY CARTS', 'BRAKES LAST CHECKED 1879'], true],
  // (the gas pocket's two on its short floor between the trestle's chasm and the flooded shaft: three lines each so
  // both fit on it, neither hanging off its edge (art.ts keeps them on it))
  [12740, FLOOR_H, ['FIREDAMP', 'NO OPEN FLAMES.', 'NO GUNS.'], true],
  [12935, FLOOR_H, ['FLOODED', 'LONG SWIM.', 'NO AIR POCKETS.'], true],
  [14740, 0, ['TIMBER TUMBLE', 'THE LONG LOG RIDE. LINE STARTS HERE']],
];

export const CHECKPOINTS = [
  { name: 'END OF THE LINE', cp: 20, x: X(200), y: GY },
  { name: 'MAIN STREET', cp: 21, x: X(2000), y: GY },
  { name: 'THE SALOON', cp: 22, x: X(3700), y: GY },
  { name: 'THE SHOWDOWN', cp: 23, x: X(5920), y: GY },
  { name: 'THE MILL POND', cp: 24, x: X(8250), y: GY },
  { name: 'THE SAWMILL', cp: 25, x: X(9840), y: Y(220) },
  { name: 'THE MOTHER LODE', cp: 26, x: X(11050), y: GY },
  { name: 'THE TRESTLE', cp: 27, x: X(12265), y: FY },
  { name: 'THE CANARY', cp: 28, x: X(12680), y: FY },
  { name: 'TIMBER TUMBLE', cp: 29, x: X(14760), y: GY },
];

/** The mine's two shafts (open to the sky, down from the ground line to the mine's floor): [from, to]. */
export const SHAFTS: [number, number][] = [[11300, 11600], [14420, 14690]];

/** Is world (x, feet y) down in the mine? (the shafts and the tunnels, under the ground line) */
export const inMine = (x: number, y: number) => x > X(11300) && x < X(14690) && y > GY + 30;
/** Is world x inside the saloon? */
export const inSaloon = (x: number, y: number) => x > SALOON.a + 8 && x < SALOON.b - 8 && y > SALOON.top;
