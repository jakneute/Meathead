// THRONES OF THE STARS, laid out (x from the section's start, heights up from the ground line). The queue and the
// station on the ground; the three stops up on the structure, each a deck walled off at its ends by the coaster's
// pylons (he can't fall off, he can't walk on: the train's the only way between them); the rides between them (track.ts)
// through the air in the gaps.
//
//   0      The queue's way in (back to the boulevard, off the left end). WAIT FROM HERE: 4 HOURS. The switchbacks:
//          lanes of guests between low rails, up two ramps; he goes through them (shoving) and over the rails. Steve's
//          standee. The PA's Steve plug.
//   1600   THE STATION (up 210): two ride ops at the gate (the kind taught alone first), the train waiting (three
//          golden throne-toilets on wheels). Press up at the front seat. The station's end wall.
//   2700   RIDE 1 (the lift hill, the first drop, a loop, an immelmann and a dive loop back): ~15 s.
//   4300   STOP 1 (up 420): THE CHAIRMAN OF THE BOWEL (merely gross). Two waves. Catwalks, the plinth.
//   5600   RIDE 2 (off the deck, a heartline roll, a big loop, a top hat straight up and down, a double loop): ~17 s.
//   7300   STOP 2 (up 760): THE GODFATHER'S CLOG (worse). The track walker who didn't hear it coming. Three waves, a
//          stunt wire over the shrine between the high catwalks, a second staff door up on the right one.
//   8900   RIDE 3 (the second lift, the near-vertical drop, the INSANITY LOOPS: ten, each smaller): ~24 s.
//   12300  STOP 3 (up 1100): THE ROCK GOD'S TOUR BUS TOILET (a biohazard: its case vents fumes, and they hurt
//          anybody), at the far end by the booth. Three waves, out of two doors on the deck. The CONTROL BOOTH up on
//          its stilts at the right end (a wire up to its balcony, past the fumes), the sleeper, the lever (locked out
//          till the staff are dead): EXPERIMENTAL. Next ride: THE LAUNCH (off the bent end of the track, through the
//          air, into the warehouse's wall). He won't ride on NORMAL (pull the lever first).
//   (The station and the stops are dressed as a bathroom: a tiled set wall, stalls, urinals, sinks: art.ts.)
//
// Every stop has a SERVICE STAIRS door at its left end (locked while the staff are at him): down and out at the
// station. So the way back from the warehouse (DOORS.coaster.end: under the booth) is the stairs, or another launch.

import { SECTIONS, GY } from '../geometry';
export { GY };
import type { StuntWire } from '../section';
import type { HandLever } from '../lever';

export const x0 = SECTIONS.coaster.x0, x1 = SECTIONS.coaster.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;
/** His hands over his feet, hanging off a harness (wires.ts). */
export const HANDS = 80;

// ---------------------------------------------------------------------------------------------------------------
// The queue and the station

/** The queue's ground: [from, to, height at from, height at to] (ramps between the flats). */
export const QUEUE_GROUND: [number, number, number, number][] = [
  [-200, 700, 0, 0], [700, 1000, 0, 110], [1000, 1300, 110, 110], [1300, 1600, 110, 210], [1600, 2700, 210, 210],
];
/** The station's deck: its height, its ends; its end wall. */
export const STATION = { a: 1600, b: 2700, h: 210 } as const;
/** The queue's rails (low walls between the lanes: over them): [x, height of the ground there]. */
export const RAILS: [number, number][] = [[300, 0], [520, 0], [1080, 110], [1220, 110]];
export const RAIL_H = 34;
/** Who's in the queue (guests: shoved aside, outraged): [x, seed]. Ground under each from QUEUE_GROUND. */
export const GUESTS: [number, number][] = [
  [180, 11], [230, 52], [360, 73], [410, 19], [455, 88], [580, 31], [640, 64], [760, 7], [860, 95], [930, 42],
  [1040, 26], [1130, 58], [1170, 83], [1270, 14], [1380, 67], [1470, 39], [1540, 91], [1660, 22], [1710, 77],
];
/** Height of the queue's ground at rx. */
export const queueH = (rx: number) => {
  for (const [a, b, ha, hb] of QUEUE_GROUND) if (rx >= a && rx <= b) return ha + ((hb - ha) * (rx - a)) / (b - a);
  return 0;
};
/** The ride ops at the station's gate (the kind, alone first). */
export const GATE_OPS: number[] = [1900, 2120];
export const STEVE_STANDEE = 860;

// ---------------------------------------------------------------------------------------------------------------
// The train: three cars (front first), its front seat's where it's parked at each place

/** Front car to the next car's middle (px of track). */
export const CAR_GAP = 74;
export const CARS = 3;

export type Place = 'station' | 0 | 1 | 2;
/** The stops: the deck (its ends, its height), where the train's front seat parks, the shrine (the plinth's x and
 *  width, its height), the staff doors (deck; and up on a catwalk), the service stairs, the catwalks, the checkpoint. */
export interface Stop {
  a: number; b: number; h: number; park: number;
  shrine: { x: number; w: number; h: number };
  door: number; upper?: { x: number; h: number };
  /** A second staff door on the deck (where a stop without a catwalk door sends its 'upper' lot out). */
  door2?: number;
  stairs: number;
  ledges: [number, number, number][];
  cp: number; cpName: string;
}
export const STOPS: Stop[] = [
  {
    a: 4300, b: 5600, h: 420, park: 4560,
    shrine: { x: 5000, w: 110, h: 60 },
    door: 5500, stairs: 4380,
    ledges: [[4700, 120, 180], [5200, 120, 200], [4960, 240, 190]],
    cp: 12, cpName: 'STOP 1: THE CHAIRMAN OF THE BOWEL',
  },
  {
    a: 7300, b: 9000, h: 760, park: 7560,
    shrine: { x: 8240, w: 120, h: 60 },
    door: 8900, upper: { x: 8800, h: 250 }, stairs: 7380,
    // (the low catwalks up, the high ones either side of the shrine: the wire between them)
    ledges: [[7860, 120, 170], [8540, 120, 170], [7880, 250, 220], [8620, 250, 260]],
    cp: 13, cpName: "STOP 2: THE GODFATHER'S CLOG",
  },
  {
    // (the user: the staff couldn't get to him here, the case in their way and the catwalk door's lot stuck up on it.
    // The case is at the far end now, by the booth (past the fight, its fumes between him and the lever), and both
    // staff doors are on the deck on his side of it: the restroom's, and the janitor's closet)
    a: 12300, b: 14200, h: 1100, park: 12560,
    shrine: { x: 13560, w: 130, h: 120 },
    door: 13260, door2: 12960, stairs: 12380,
    ledges: [[12660, 130, 200], [12880, 250, 160], [13060, 130, 140], [13700, 130, 140]],
    cp: 14, cpName: 'STOP 3: THE CONTROL BOOTH',
  },
];
/** The control booth (stop 3): its balcony (one-way, up on stilts), the booth on it, the lever. */
export const BOOTH = { a: 13860, b: 14200, h: 1100 + 260, lever: 13930, cab: 14020 } as const;
/** The lever itself (../lever.ts): its pivot, the grip, its throws (NORMAL to EXPERIMENTAL), him square behind it. */
export const BOOTH_LEVER: HandLever = { x: X(BOOTH.lever), y: Y(BOOTH.h) - 12, len: 60, from: -0.6, to: 0.6, stand: 0 };
/** The biohazard's fumes (stop 3): how far either side of the case they reach, how often it vents. */
export const FUMES = { reach: 190, every: 330, tell: 60, vent: 90 } as const;

/** The stunt wires, in a steady order: stop 2's over the shrine, stop 3's up to the booth's balcony. */
export const WIRES: StuntWire[] = [
  { from: { x: X(8080), y: Y(760 + 250) - HANDS }, to: { x: X(8660), y: Y(760 + 250) }, rigY: Y(760 + 470) },
  { from: { x: X(13760), y: Y(1100 + 130) - HANDS }, to: { x: X(13980), y: Y(BOOTH.h) }, rigY: Y(BOOTH.h + 220) },
];

/** Who comes out at each stop: waves of [kind, door]. Escalating: ride ops first; the janitor; the docents and
 *  security; the lot. */
export type CoasterKind = 'm2:hwc_rideop' | 'm2:hwc_janitor' | 'm2:hwc_docent' | 'm2:hwc_guard';
const R: CoasterKind = 'm2:hwc_rideop', J: CoasterKind = 'm2:hwc_janitor', D: CoasterKind = 'm2:hwc_docent', G: CoasterKind = 'm2:hwc_guard';
export const WAVES: [CoasterKind, 'door' | 'upper'][][][] = [
  [
    [[R, 'door'], [R, 'door'], [R, 'door']],
    [[R, 'door'], [J, 'door'], [R, 'door']],
  ],
  [
    [[R, 'door'], [J, 'upper'], [R, 'door'], [J, 'door']],
    [[D, 'door'], [R, 'upper'], [D, 'door']],
    [[G, 'door'], [R, 'upper'], [J, 'upper'], [R, 'door']],
  ],
  [
    [[R, 'door'], [R, 'upper'], [D, 'door'], [J, 'upper'], [R, 'door']],
    [[G, 'door'], [J, 'upper'], [G, 'door'], [J, 'door']],
    [[D, 'door'], [R, 'upper'], [G, 'door'], [D, 'upper'], [R, 'door'], [R, 'door']],
  ],
];
/** Lying about up the catwalks (lean: small, each for going up there). */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [5300, 420 + 120, 'small_ammo'],
  [7940, 760 + 250, 'small_health'],
  [12960, 1100 + 250, 'small_ammo'], [13130, 1100 + 130, 'small_health'],
];

export const CHECKPOINTS = [
  { name: 'THRONES OF THE STARS', cp: 10, x: X(200), y: GY },
  { name: 'THE STATION', cp: 11, x: X(1680), y: Y(STATION.h) },
  ...STOPS.map(s => ({ name: s.cpName, cp: s.cp, x: X(s.park - 140), y: Y(s.h) })),
];

/** Where each ride starts and ends (the train's front seat, parked). */
export const parkAt = (pl: Place) => (pl === 'station' ? { x: X(2360), y: Y(STATION.h) } : { x: X(STOPS[pl].park), y: Y(STOPS[pl].h) });

/** Kept across his deaths (state.stageMemo): each stop's staff dead, the lever flipped, the launch gone. */
export const CLEARED_MEMO = (i: number) => `hollywood-coaster-stop${i}`;
export const LEVER_MEMO = 'hollywood-coaster-lever';
export { COASTER_LAUNCHED_MEMO as LAUNCHED_MEMO } from '../section';
/** Stop 2's track walker (the train came; he didn't hear it). */
export const WALKER_MEMO = 'hollywood-coaster-walker';
