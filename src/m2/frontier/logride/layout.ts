// Timber Tumble, laid out (x from the section's start; heights up from the ground line: Y(h) = GY - h, so the sewer and
// the real river, under the park, are negative). One flume, left to right, the log following it (TRACK): the station,
// the ride proper (the park's fiberglass canyon, Beaver Creek, the lift hill, the Old Sawmill's shed, the big drop and
// its splash pool, the lumber camp), the break-out (a rail saw cuts the flume ahead of him: the log jumps it and goes
// down through a storm grate), the SEWER, the storm drain's culvert out of the bluff the park sits on, the REAL river
// (rocks, low branches, crows, a real waterfall), and the logging crew's sluice up into their woodchipper. Teach each
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
//   5480   THE BREAK: a rail saw cuts the flume ahead of him; the log jumps it, down through a storm grate.
//   5820   THE SEWER (cp 35 at 5900; cp 36 at 7100): LOW PIPES (duck), SEWAGE GUSHERS (brake or paddle), RATS on the
//          walkways (they leap at him), a loose saw rolling down the tunnel (jump).
//   8400   THE CULVERT: out of the bluff, through the park's busted fence (PARK PROPERTY ENDS), down into a real river.
//   8600   A REAL RIVER (cp 37 at 8700): ROCKS (jump as the log hits one), LOW BRANCHES (duck), crows; the rapids;
//          a real waterfall; (cp 38 at 10100) more of it.
//   10760  THE SLUICE: the logging crew's conveyor up into the WOODCHIPPER: jump at JUMP!, or mulch.
//   11160  THE CREW'S CLEARING: off the right end into the woods. A trail back to the park off its left end.

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
  [5560, 5680, -60, 10],      // the break: off the cut flume, up...
  [5680, 5840, 10, -560],     // ...and down through the storm grate into the sewer
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
  clearing: [11160, 11600],
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
  [5560, 6.5, false], [5840, 3.0, true], [8400, 7.5, false], [8640, 3.0, true], [9300, 3.6, true], [9860, 8, false],
  [9990, 3.2, true], [10760, 1.7, false],
];
export const speedAt = (rx: number) => { let s = SPEEDS[0]; for (const q of SPEEDS) if (rx >= q[0]) s = q; return s; };

/** The waterline at x (from the section's start), world y. */
export const waterY = (rx: number) => {
  for (const [a, b, ha, hb] of TRACK) if (rx >= a && rx <= b) return Y(ha + ((rx - a) / (b - a)) * (hb - ha));
  return rx < TRACK[0][0] ? Y(TRACK[0][2]) : Y(TRACK[TRACK.length - 1][3]);
};
/** How the flume leans at x (radians). */
export const slopeAt = (rx: number) => Math.atan2(waterY(rx + 12) - waterY(rx - 12), 24);

// ---------------------------------------------------------------------------------------------------------------
// The saws (Tucker engaged them: the ride's "buzzsaw effects", live). x from the section's start.

export type SawType = 'wall' | 'rise' | 'drop' | 'swing' | 'rail' | 'roll';
/**
 *   wall   on the flume wall, head high, spinning: duck under it
 *   rise   under the water; as the log comes it rises up out of it, knee high: jump it
 *   drop   up in the rafters; it drops on a beat, a shudder first, and goes back up: brake or paddle through the gap
 *   swing  on a pendulum under a gantry, sweeping through head high: duck it as it comes through
 *   rail   runs along a rail at the trough's edge, at him: jump it
 *   roll   (the sewer) a saw loose off its mount, rolling down the tunnel at him: jump it
 * `phase` sets a drop's or a swing's beat.
 */
export const SAWS: [SawType, number, number?][] = [
  // FIBERGLASS CANYON
  ['wall', 1250], ['wall', 1520], ['wall', 1700], ['wall', 1760],
  // BEAVER CREEK
  ['rise', 2000], ['rise', 2240], ['rise', 2380],
  // THE LIFT HILL
  ['swing', 2680, 0], ['swing', 2880, 60],
  // THE OLD SAWMILL
  ['drop', 3200, 0], ['drop', 3480, 0], ['drop', 3600, 70], ['drop', 3790, 30],
  // THE LUMBER CAMP
  ['drop', 4560, 40], ['rail', 4760], ['rail', 4960], ['wall', 5040], ['rail', 5130], ['swing', 5270, 20],
  // THE SEWER
  ['roll', 6980], ['roll', 7640], ['roll', 8150],
];
/** The big one that cuts the flume ahead of him (the break): where it comes across. */
export const CUTTER_X = 5530;

/** Shredded as the log comes by (the park's animatronic frontier, the saws through them): [x, what]. */
export type PropKind = 'beaver' | 'jack' | 'bear' | 'settler';
export const PROPS: [number, PropKind][] = [
  [1420, 'settler'], [1940, 'beaver'], [2120, 'beaver'], [2300, 'beaver'], [3340, 'jack'], [3700, 'jack'], [4700, 'bear'], [5160, 'settler'],
];

// ---------------------------------------------------------------------------------------------------------------
// The sewer's and the river's own

/** Low pipes across the sewer (duck). */
export const PIPES = [6060, 6720, 7280, 8240];
/** Sewage pouring out of a pipe in the sewer's roof on a beat (brake or paddle through): [x, phase]. */
export const GUSHERS: [number, number][] = [[6320, 0], [7180, 50], [7820, 0], [7900, 75]];
/** Rats on the walkways (they leap at the log): [x, height of the walkway]. None in a gusher's or a saw's way. */
export const RATS: [number, number][] = [[6540, -500], [6600, -500], [6800, -500], [7420, -500], [7470, -500], [8020, -500], [8070, -500], [8110, -500]];
/** The walkway along the sewer's back wall (the rats' ground): from, to, height. */
export const WALKWAYS: [number, number, number][] = [[6450, 6900, -500], [7350, 7560, -500], [7960, 8200, -500]];
/** Rocks in the river (the log hits it and bucks: be in the air as it does). */
export const ROCKS = [9100, 9560, 9720, 10320, 10560];
/** Low branches over the river (duck). Real trees. */
export const BRANCHES = [9320, 10160, 10460];
/** Crows over the river: [x, height]. */
export const CROWS: [number, number][] = [[9420, -760], [10380, -940]];

/** The woodchipper (its hopper's mouth at the top of the sluice) and the crew's clearing past it. */
export const CHIPPER = { x: X(11100), hopperY: Y(-930), ground: Y(-1000) } as const;
/** The jump: open from here along the conveyor (READY till then); the landing on the clearing. */
export const JUMP_FROM = 10860, READY_FROM = 10760, LAND_X = 11330;
/** The clearing (the crew's: their truck, the trail back to the park off its left end). */
export const CLEARING = { a: 11180, b: 11600 } as const;

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
