// Timber Tumble, laid out (x from the section's start; heights up from the ground line: Y(h) = GY - h, so the sewer and
// the real river, under the park, are negative). One flume, left to right, the log following it (TRACK): the station,
// the ride proper (the park's fiberglass canyon, Beaver Creek, the lift hill, the Old Sawmill's shed, the big drop and
// its splash pool, the lumber camp), the break-out (a giant saw slams into the ground ahead of him and opens a fault
// line: the ride breaks apart and the log falls through into the sewer), the SEWER, the storm drain's culvert out of the
// bluff the park sits on, the REAL river
// (rocks, low branches, a real waterfall), and the logging crew's sluice up into their woodchipper. Teach each
// saw alone and safe first, then two, then mixed:
//
//   0      THE STATION (cp 30): the platform, the booth (the operator; Tucker bursts in), the waiting log. In: the scene.
//   1000   FIBERGLASS CANYON (cp 31 at 1000): WALL SAWS (head high: duck), one alone, then two, then a pair.
//   1800   BEAVER CREEK: RISING SAWS (up out of the water as the log comes: jump), the animatronic beavers shredded.
//   2500   THE LIFT HILL (cp 32 at 2480): chain up, slow; SWINGING SAWS on gantries (duck as one comes through).
//   3000   THE OLD SAWMILL (cp 33 at 3020): a shed; DROPPING SAWS out of its rafters (brake or paddle through the gap);
//          the animatronic lumberjacks shredded.
//   3900   THE BIG DROP: down out of the shed into the splash pool, the ride photo's flash.
//   4250   THE LUMBER CAMP (cp 34 at 4300): RAIL SAWS (along the trough's edge at him: jump), then all of them mixed.
//   5420   THE BREAK: the giant cutter slams into the ground at 5720; a fault line cracks open along the ground, the
//          flume over it breaks apart, and the log drops through the chasm (5700-5840) into the sewer: a big splash.
//   5840   THE SEWER (cp 35 at 5900; cp 36 at 7060): LOW PIPES (a bundle of pipes down from the vault: duck), BUSTED
//          PIPE sections lying across the channel (jump), SEWAGE GUSHERS (brake, paddle or hop). No saws down here,
//          and no critters on the ride at all: only its obstacles hurt him (the user's).
//   8400   THE CULVERT: out of the bluff, through the park's busted fence (PARK PROPERTY ENDS), down into a real river
//          (a big splash).
//   8600   A REAL RIVER (cp 37 at 8700): ROCKS (jump as the log hits one), LOW LIMBS (duck); the rapids;
//          a real waterfall (a big splash at its foot); (cp 38 at 10080) more of it.
//   10760  THE SLUICE: the logging crew's conveyor up into the WOODCHIPPER: jump at JUMP!, or mulch.
//   11160  THE CREW'S CLEARING: the crew (chainsaws: they're sore about it; throw one in the chipper); off the right end
//          into the woods. A trail back to the park off its left end.

import { SECTIONS, GY } from '../geometry';

export const x0 = SECTIONS.logride.x0, x1 = SECTIONS.logride.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;

/** The flume: runs of water the log rides, [from, to, height at from, height at to] (from the section's start). Its
 *  surface is the log's waterline. */
export const TRACK: [number, number, number, number][] = [
  [560, 2500, -14, -14],
  [2500, 3000, -14, 300],     // the lift hill
  [3000, 3900, 300, 300],     // the Old Sawmill's shed
  [3900, 4250, 300, -60],     // the big drop
  [4250, 5560, -60, -60],     // the splash pool, the lumber camp
  [5560, 5700, -60, -60],     // the break: on to the fault line...
  [5700, 5840, -60, -560],    // ...and down through the chasm into the sewer
  [5840, 8400, -560, -580],   // the sewer
  [8400, 8640, -580, -900],   // out of the culvert, down into the river
  [8640, 9860, -900, -900],   // a real river
  [9860, 9990, -900, -1080],  // the waterfall
  [9990, 10760, -1080, -1080],
  [10760, 11060, -1080, -930], // the sluice's conveyor, up into the chipper's hopper
];
export const START = 660, END = 11060;
/** Where the log waits at the station (its middle), the platform's end, the ground at the station. */
export const LOAD_X = 660, PLATFORM_END = 560;

/** Where the land is (for the camera, the lighting, the drawing): from, to. */
export const ZONES = {
  station: [-200, 900], canyon: [900, 1800], creek: [1800, 2500], lift: [2500, 3000], mill: [3000, 3900], drop: [3900, 4250],
  camp: [4250, 5560], brk: [5560, 5840], sewer: [5840, 8400], culvert: [8400, 8640], river: [8640, 10760], sluice: [10760, 11160],
  clearing: [11160, 11900],
} as const;
export type ZoneId = keyof typeof ZONES;
export const zoneAt = (rx: number): ZoneId => {
  for (const k of Object.keys(ZONES) as ZoneId[]) { const [a, b] = ZONES[k]; if (rx >= a && rx < b) return k; }
  return rx < 0 ? 'station' : 'clearing';
};
export const inSewer = (rx: number) => rx >= 5700 && rx < 8440;
export const indoorsAt = (rx: number) => rx < 900 || (rx >= 3000 && rx < 3900);
export const realAt = (rx: number) => rx >= 8400;

/** The log's speed along each stretch (px a frame, before his brake or paddle): [from, speed, can he brake/paddle]. */
export const SPEEDS: [number, number, boolean][] = [
  [560, 1.6, false], [900, 2.6, true], [2500, 1.4, false], [3000, 2.6, true], [3900, 8, false], [4260, 3.0, true],
  [5560, 3.0, false], [5700, 4.6, false], [5840, 3.0, true], [8400, 7.5, false], [8640, 3.0, true], [9300, 3.6, true], [9860, 8, false],
  [9990, 3.2, true], [10760, 1.7, false],
];
export const speedAt = (rx: number) => { let s = SPEEDS[0]; for (const q of SPEEDS) if (rx >= q[0]) s = q; return s; };
/** The foot of every drop (where the log goes down a slope or falls, onto the flat): [x, how big its splash is]. The
 *  log crossing one sets off the big wave (ride.ts bigSplash): the big drop, the fall into the sewer, the culvert's
 *  spillway into the river, the waterfall. (Found by crossing the foot, not by the slope changing: the slope's sampled
 *  24 px wide, and at the log's speed down a drop it skipped right over the change most of the time.) */
export const DROPS: [number, number][] = [[4250, 1.15], [5840, 1.1], [8640, 1], [9990, 1.2]];

/** The waterline at x (from the section's start), world y. */
export const waterY = (rx: number) => {
  for (const [a, b, ha, hb] of TRACK) if (rx >= a && rx <= b) return Y(ha + ((rx - a) / (b - a)) * (hb - ha));
  return rx < TRACK[0][0] ? Y(TRACK[0][2]) : Y(TRACK[TRACK.length - 1][3]);
};
/** How the flume leans at x (radians). */
export const slopeAt = (rx: number) => Math.atan2(waterY(rx + 12) - waterY(rx - 12), 24);

// ---------------------------------------------------------------------------------------------------------------
// The saws (Tucker engaged them: the ride's "buzzsaw effects", live). x from the section's start.

export type SawType = 'wall' | 'rise' | 'drop' | 'swing' | 'rail';
/**
 *   wall   on a bulkhead down to head height, spinning: duck under it
 *   rise   under the water; as the log comes it rises up out of it, knee high: jump it
 *   drop   up in the rafters; it drops on a beat, a shudder first, and goes back up: brake, paddle or hop through the gap
 *   swing  on a pendulum under a gantry, sweeping through head high: duck it as it comes through
 *   rail   runs along a rail at the trough's edge, at him: jump it
 * `phase` sets a drop's or a swing's beat. (No saws in the sewer: the user's.)
 */
/** How far over the waterline every duck-under's underside is (its lowest tooth, pipe or bough): his ducked head (down
 *  in the log) is well under it, his sat-up head well over it (ride.ts). */
export const DUCK_LINE = 44;
export const SAWS: [SawType, number, number?][] = [
  // FIBERGLASS CANYON (all ducks)
  ['wall', 1250], ['wall', 1520], ['wall', 1720], ['wall', 1780],
  // BEAVER CREEK (all jumps, each with room)
  ['rise', 2000], ['rise', 2220], ['rise', 2420],
  // THE LIFT HILL (on the chain: the swings' saws never come lower than the duck line over the water under them, the
  // slope and all: hold duck and they go over; sat up, they get him)
  ['swing', 2680, 0], ['swing', 2880, 60],
  // THE OLD SAWMILL (brake or paddle through the gaps)
  ['drop', 3200, 0], ['drop', 3480, 0], ['drop', 3600, 70], ['drop', 3790, 30],
  // THE LUMBER CAMP: one of each, ~250-340 apart. (A rail saw meets the log about 260 short of its x, at the ride's
  // pace: this one around 4620.) Then the drop (pace yourself), the wall (duck), the swing (keep ducking).
  ['rail', 4880], ['drop', 4960, 40], ['wall', 5200], ['swing', 5340, 20],
];
/** The giant saw that slams into the ground ahead of him (the break): where it comes down; when (the log this far on);
 *  the chasm the fault line opens (the log falls through it). */
export const CUTTER_X = 5720, CUTTER_FROM = 5420, CHASM = { a: 5690, b: 5850 } as const;

/** Shredded as the log comes by (the park's animatronic frontier, the saws through them): [x, what]. */
export type PropKind = 'beaver' | 'jack' | 'bear' | 'settler';
export const PROPS: [number, PropKind][] = [
  [1420, 'settler'], [1940, 'beaver'], [2120, 'beaver'], [2300, 'beaver'], [3340, 'jack'], [3700, 'jack'], [4700, 'bear'], [5160, 'settler'],
];

// ---------------------------------------------------------------------------------------------------------------
// The sewer's and the river's own

/** Low pipes across the sewer (a bundle of them down from the vault to head height: duck). */
// (the sewer's beats, ~300 apart, never a duck straight into a jump: pipe 6100, junk 6400, gusher 6700, pipe 7000,
// junk 7300, the gusher pair 7560/7660, pipe 7950, junk 8200; each lit by its own work lamp, its warning sprayed on)
export const PIPES = [6100, 7000, 7950];
/** Busted pipe sections lying across the sewer's channel, half sunk (the log hits one and bucks: be in the air). */
export const JUNK = [6400, 7300, 8200];
/** Sewage pouring out of a pipe in the sewer's roof on a beat (brake or paddle through): [x, phase]. */
export const GUSHERS: [number, number][] = [[6700, 0], [7560, 0], [7660, 80]];
/** The walkway along the sewer's back wall (scenery: dimmed, not his): from, to, height. */
export const WALKWAYS: [number, number, number][] = [[6450, 6900, -500], [7350, 7560, -500], [7960, 8200, -500]];
/** Rocks in the river (the log hits it and bucks: be in the air as it does). */
export const ROCKS = [9100, 9580, 9740, 10460];
/** Low limbs over the river (duck). Real trees. (Each at least ~240 from the nearest rock.) */
export const BRANCHES = [9340, 10180];
/** The crew's hand-painted warnings on the river's far bank: [x, words]. */

/** The woodchipper (its hopper's mouth at the top of the sluice) and the crew's clearing past it. */
export const CHIPPER = { x: X(11100), hopperY: Y(-930), ground: Y(-1000) } as const;
/** The jump: open from here along the conveyor (READY till then); the landing on the clearing. */
export const JUMP_FROM = 10860, READY_FROM = 10760, LAND_X = 11330;
/** The clearing (the crew's: their truck, the trail back to the park off its left end). */
export const CLEARING = { a: 11180, b: 11900 } as const;
/** The logging crew on the clearing (they yell JUMP!, then they're sore about it: chainsaws). */
export const CREW = [11460, 11580];

/** The station's booth (the operator's; Tucker shows up in it), and the saw over its console. */
export const BOOTH = { a: 330, b: 520, floor: 0, top: 140 } as const;

/** Checkpoints: where each starts the log (x from the section's start: a respawn's put back in a log there). */
export const RIDE_CPS: { cp: number; name: string; rx: number }[] = [
  { cp: 31, name: 'FIBERGLASS CANYON', rx: 1000 },
  { cp: 32, name: 'THE LIFT HILL', rx: 2480 },
  { cp: 33, name: 'THE OLD SAWMILL', rx: 3020 },
  { cp: 34, name: 'THE LUMBER CAMP', rx: 4300 },
  { cp: 35, name: 'THE SEWER', rx: 5900 },
  { cp: 36, name: 'THE DEEP SEWER', rx: 7060 },
  { cp: 37, name: 'A REAL RIVER', rx: 8700 },
  { cp: 38, name: 'THE RAPIDS', rx: 10080 },
];

/** Signs: [x, the ground's height there, words, painted (a warning) or burned]. */
export const SIGNS: [number, number, string[], boolean?][] = [
  [100, 0, ['TIMBER TUMBLE', 'YOU WILL GET WET']],
  [1060, -14, ['LOW CLEARANCE', 'KEEP HEADS DOWN'], true],
  [1880, -14, ['BEAVER CREEK', 'WATCH THE WATER'], true],
  [3080, 300, ['<< BRAKE   PADDLE >>', 'PICK YOUR GAP'], true],
  [4380, -60, ['LUMBER CAMP', 'MIND THE RAILS'], true],
];
