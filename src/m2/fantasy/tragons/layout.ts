// TRUELLING TRAGONS, laid out: where the station, the ride and the unload are in the world, the three tracks (their
// heights and their depths along the ride), the ride's script (what comes at him where, teach then escalate: holes,
// each train's obstacles, the loops and corkscrews, the set pieces), and the checkpoints.
//
// THE RIDE stands still in the world and the world goes by it (as the Wilderness train): the trains leave the load
// station rolling right till their rears reach RX (LOCK in), then stay put while `dist` (how far along the track the
// trains' rears are) goes up; anything on the track at track position `s` is drawn at wxOf(dist, s). The ride's ~50000
// px of track at 5-6.5 px a frame: about two and a half minutes. A survival ride (the user's): no suitors on it, no
// guns; hang on, hop, duck, jump, live.
//
// The lanes, top to bottom at the station: 0 LIGHTNING (yellow and purple), 1 FIRE (red and orange), 2 ICE (blue and
// white). Up (the mouse wheel up, RB) is the car above; down (wheel down, LB) the car below (whichever is, there).
//
// DEPTH (the user: "crazy depth and height changes like the toilet ride in hollywood land"): each track has a height
// and a depth along it (1 the play plane; under 1 away into the distance, over 1 in toward the viewer), eased between
// keys; track.ts adds the loops, corkscrews and the braid on top, and puts every point at its depth about the scene's
// one eye (the trains' middle). Big drops dive in at the camera; lift hills go away up into the haze; at the head-on
// near miss one dragon's far and one's near and they pass through each other's lines; obstacles only come where the
// tracks are at the play plane (so a jump's a jump).

import { SECTIONS, GY } from '../geometry';

export { GY };
export const { x0, x1 } = SECTIONS.tragons;

export type Lane = 0 | 1 | 2;
export const LANES: Lane[] = [0, 1, 2];
export const LANE_NAME = ['LIGHTNING', 'FIRE', 'ICE'] as const;
export const LANE_ID = ['bolt', 'fire', 'ice'] as const;
export type LaneId = (typeof LANE_ID)[number];
/** Each lane's colors: main, light, dark. */
export const LANE_COL: [string, string, string][] = [['#FACC15', '#FEF9C3', '#6D28D9'], ['#EA580C', '#FDBA74', '#991B1B'], ['#38BDF8', '#F0F9FF', '#1D4ED8']];

// ---------------------------------------------------------------------------------------------------------------
// The world

/** The load station's platform starts here; the trains' rears sit at S0X waiting. */
export const STATION_X = x0 + 420;
export const S0X = x0 + 1000;
/** Past this far along, the trains stay put (their rears at RX) and the world goes by. */
export const LOCK = 1500;
export const RX = S0X + LOCK;
/** A train: three cars, 100 apart. */
export const TL = 300, CAR = 100;
/** The platform's gate (shut till the ride goes): the station's right end. */
export const GATE_X = S0X + TL + 60;
/** Where the trains stop (their rears' s) at the unload; the unload's decks (one a lane, right of the dragons' heads)
 *  and the exit (on to the castle's base). */
export const END_S = 50000;
export const DECK_X0 = RX + TL + 4, DECK_X1 = RX + TL + 460;
export const EXIT_X = RX + TL + 1500;
export const AWAY = -99999;

/** World x of track position s, with the trains `dist` along. */
export const wxOf = (dist: number, s: number) => S0X + Math.min(dist, LOCK) + (s - dist);
/** The trains' rears' world x, `dist` along. */
export const rearX = (dist: number) => S0X + Math.min(dist, LOCK);

// ---------------------------------------------------------------------------------------------------------------
// The tracks: heights above the ground (lanes 0, 1, 2) and depths, keyed along the ride, smoothed between the keys.

const H_KEYS: [number, number, number, number][] = [
  [-2000, 380, 230, 70], [700, 380, 230, 70],
  // THE LIFT HILL: up and up, away into the haze
  [1800, 450, 300, 150], [3200, 700, 560, 420], [4700, 980, 840, 700], [5100, 1000, 860, 720],
  // THE FIRST DROP: all three straight down at the camera; pulled out level for the first loop
  [6500, 250, 140, 40], [7600, 520, 380, 240], [9700, 520, 380, 240],
  // THE GAUNTLET (at the play plane)
  [10400, 600, 440, 280], [12800, 640, 460, 280],
  // THE SECOND DROP, the double loop
  [13800, 760, 600, 460], [15000, 300, 190, 80], [15700, 520, 380, 240], [17200, 520, 380, 240],
  // THE HEAD-ON: LIGHTNING dives as FIRE climbs (one far, one near: through each other's lines), and back
  [17900, 820, 300, 160], [18900, 330, 420, 170], [19500, 300, 500, 200], [20200, 520, 380, 240],
  // THE CORKSCREW; ONLY ONE SAFE
  [22200, 520, 380, 240], [23000, 560, 400, 260],
  // THE MOUNTAIN: up into it, down inside it in the dark, out
  [23900, 660, 500, 360], [25200, 300, 180, 80], [26000, 520, 380, 240],
  // THE CHAIN (interlocking loops)
  [27800, 520, 380, 240],
  // THE GAUNTLET AGAIN, the hop and the loop straight after
  [28400, 600, 440, 280], [30200, 600, 440, 280], [30600, 540, 390, 240], [32600, 540, 390, 240],
  // THE SPLASHDOWN: up, and down into the lagoon
  [33200, 900, 760, 620], [34400, 70, 45, 25], [35000, 300, 300, 300],
  // THE TRIPLE HELIX (the braid winds them round one another: track.ts)
  [35800, 460, 380, 300], [38400, 460, 380, 300], [38900, 560, 400, 260],
  // ONLY ONE SAFE, the near miss, the double corkscrew
  [39600, 600, 420, 260], [40600, 420, 330, 240], [41200, 560, 400, 260], [43600, 560, 400, 260],
  // THE GRAND FINALE: three interlocked loops; one more hole; the brakes
  [44400, 520, 380, 240], [47400, 520, 380, 240], [48400, 480, 330, 180], [64000, 480, 330, 180],
];
const D_KEYS: [number, number, number, number][] = [
  [-2000, 1, 1, 1], [1400, 1, 1, 1], [4800, 0.78, 0.8, 0.82], [5200, 0.8, 0.82, 0.84], [6500, 1.32, 1.38, 1.3], [7600, 1, 1, 1],
  [12800, 1, 1, 1], [13800, 0.84, 0.85, 0.86], [15000, 1.3, 1.32, 1.3], [15800, 1, 1, 1],
  [17400, 1, 1, 1], [18500, 0.72, 1.36, 1], [19400, 0.82, 1.2, 1], [20200, 1, 1, 1],
  [23000, 1, 1, 1], [24000, 0.8, 0.8, 0.8], [25200, 1.3, 1.3, 1.3], [26000, 1, 1, 1],
  [32600, 1, 1, 1], [33200, 0.8, 0.8, 0.8], [34400, 1.3, 1.35, 1.4], [35400, 1, 1, 1],
  [40000, 1, 1, 1], [40600, 0.82, 1, 1.2], [41200, 1, 1, 1], [64000, 1, 1, 1],
];

const ease = (u: number) => u * u * (3 - 2 * u);
const keyed = (keys: [number, number, number, number][], lane: Lane, s: number) => {
  let i = 0;
  while (i < keys.length - 2 && keys[i + 1][0] <= s) i++;
  const a = keys[i], b = keys[i + 1];
  const u = Math.max(0, Math.min(1, (s - a[0]) / (b[0] - a[0])));
  return a[lane + 1] + (b[lane + 1] - a[lane + 1]) * ease(u);
};
/** A lane's height above the ground at track position s (before the loops: track.ts). */
export const laneH = (lane: Lane, s: number) => keyed(H_KEYS, lane, s);
/** A lane's roof (world y, the play plane's) at track position s (before the loops). */
export const laneY = (lane: Lane, s: number) => GY - laneH(lane, s);
/** A lane's depth at s (before the loops). */
export const laneD = (lane: Lane, s: number) => keyed(D_KEYS, lane, s);

// ---------------------------------------------------------------------------------------------------------------
// The ride's speed (px a frame) along it: slow for the teaching (the first hole, the first loop), up to speed, the
// brakes at the end.

export const V_TEACH = 5, V_RIDE = 6, V_LATE = 6.4;
export const speedAt = (dist: number) => {
  if (dist < 9600) return V_TEACH;
  if (dist > END_S - 1600) return Math.max(0.6, V_RIDE * Math.sqrt(Math.max(0, END_S - dist) / 1600));
  if (dist > 34000) return V_LATE;
  return V_RIDE;
};

// ---------------------------------------------------------------------------------------------------------------
// The set pieces on the track

/** The fake mountain the tracks dive through (track positions: its tunnel's mouths). */
export const TUNNEL = { a: 23700, b: 25500 };
/** The lagoon at the bottom of the splashdown (track positions), and the bottom (the spray). */
export const LAGOON = { a: 33700, b: 35200, splash: 34400 };
/** The big drops (where the spiel and he go for it): track positions at the top. */
export const DROPS = [5150, 13850, 33250];

// ---------------------------------------------------------------------------------------------------------------
// The script: what comes at him where (track positions). Holes in the track: `his` (the one he's on when it breaks),
// or all but one (`safe`: the one next to his, or the far one: two hops). Each train's obstacles come on every lane at
// once (FIRE a burning ring / a flame jet / the dragon tower's fireballs; ICE an icicle curtain / a frozen bar / the
// snow cannon; LIGHTNING an arc curtain / a live rail / the storm's strikes): the duck ones, the jump ones, the throws.
// THE LOOPS (the user's): a loop, a corkscrew, interlocking loops (two lanes' through each other), the triple helix
// (all three wound round one another), three interlocked: on `his` lane, `two` (his and one more), `all`, or `safe`
// (the lane the last ONLY ONE SAFE left whole: the hop, then the loop straight after). Locked in through it: HOLD down
// on the handlebars or he's flung off (ride.ts). Each warned (`warn` frames ahead): the lane's sign on its track, a
// countdown over the dragon going in, the card with the button, the spiel naming the track.

export type LoopKind = 'loop' | 'cork' | 'chain' | 'braid' | 'chain3';
export type Ev =
  | { k: 'gap'; at: number; len: number; warn: number }
  | { k: 'safe'; at: number; len: number; safe: 'next' | 'far'; warn: number }
  | { k: 'duck' | 'jump' | 'mover'; at: number }
  | { k: 'spin'; at: number; kind: LoopKind; on: 'his' | 'two' | 'all' | 'safe'; len: number; r: number; turns?: number; warn: number; teach?: boolean }
  | { k: 'breath'; at: number }
  | { k: 'say'; at: number; what: 'welcome' | 'rules' | 'piper' | 'near' | 'drop' | 'tunnel' | 'splash' | 'piperMid' | 'piperLate' };

export const SCRIPT: Ev[] = [
  // THE LIFT HILL: aboard and away; the spiel, the rules (hang on in the loops), Piper; the first hole alone, slow
  { k: 'say', at: 200, what: 'welcome' },
  { k: 'say', at: 1300, what: 'rules' },
  { k: 'say', at: 2300, what: 'piper' },
  { k: 'gap', at: 4200, len: 800, warn: 280 },
  // THE FIRST DROP; THE FIRST LOOP: his lane, alone, slow, a long warning and the card
  { k: 'say', at: 4900, what: 'drop' },
  { k: 'spin', at: 8100, kind: 'loop', on: 'his', len: 1005, r: 220, warn: 340, teach: true },
  // THE GAUNTLET: each train's own, the duck ones, the jump ones, what's thrown; a hole
  { k: 'duck', at: 10600 }, { k: 'jump', at: 11500 }, { k: 'mover', at: 12300 },
  { k: 'gap', at: 13300, len: 800, warn: 210 },
  // THE SECOND DROP and two lanes looping (his and another: hop to the third, or hang on)
  { k: 'say', at: 13700, what: 'drop' },
  { k: 'spin', at: 15900, kind: 'loop', on: 'two', len: 1005, r: 220, warn: 240 },
  // THE HEAD-ON: the dragons' heads breathe across at the near miss
  { k: 'say', at: 17700, what: 'near' },
  { k: 'breath', at: 18400 },
  // THE CORKSCREW (his); ONLY ONE SAFE
  { k: 'spin', at: 20300, kind: 'cork', on: 'his', len: 1400, r: 170, turns: 1, warn: 240 },
  { k: 'say', at: 21800, what: 'piperMid' },
  { k: 'safe', at: 22700, len: 900, safe: 'next', warn: 200 },
  // THE MOUNTAIN
  { k: 'say', at: 23300, what: 'tunnel' },
  // THE CHAIN: two lanes' loops through each other
  { k: 'spin', at: 26300, kind: 'chain', on: 'two', len: 1005, r: 220, warn: 240 },
  // THE GAUNTLET AGAIN; ONLY ONE SAFE, and the one that's left loops straight after the hop
  { k: 'jump', at: 28600 }, { k: 'mover', at: 29200 }, { k: 'duck', at: 29900 },
  { k: 'safe', at: 30700, len: 800, safe: 'next', warn: 190 },
  { k: 'spin', at: 31600, kind: 'loop', on: 'safe', len: 1005, r: 220, warn: 150 },
  // THE SPLASHDOWN
  { k: 'say', at: 33000, what: 'splash' },
  // THE TRIPLE HELIX: all three wound round one another (no way round it: hang on)
  { k: 'spin', at: 36000, kind: 'braid', on: 'all', len: 2400, r: 130, turns: 2, warn: 280 },
  // ONLY ONE SAFE (the far one), the near miss, the double corkscrew on two
  { k: 'safe', at: 39400, len: 800, safe: 'far', warn: 200 },
  { k: 'say', at: 40100, what: 'near' },
  { k: 'breath', at: 40500 },
  { k: 'spin', at: 41600, kind: 'cork', on: 'two', len: 1600, r: 150, turns: 2, warn: 230 },
  { k: 'duck', at: 44200 },
  // THE GRAND FINALE: three loops interlocked, all of them; Piper; what's thrown on the way in
  { k: 'say', at: 44000, what: 'piperLate' },
  { k: 'spin', at: 45400, kind: 'chain3', on: 'all', len: 1300, r: 250, warn: 280 },
  { k: 'mover', at: 48000 },
];

/** How far ahead of the trains' heads an obstacle's put on the track (off the right of the screen, pulled out). */
export const SPAWN_AHEAD = 1500;
/** When an event goes off (the trains `dist` along, going `v`). */
export const evDue = (ev: Ev, dist: number, v: number) => {
  if (ev.k === 'gap' || ev.k === 'safe' || ev.k === 'spin') return dist + TL >= ev.at - ev.warn * Math.max(v, 1);
  if (ev.k === 'duck' || ev.k === 'jump' || ev.k === 'mover') return dist + TL + SPAWN_AHEAD >= ev.at;
  return dist >= ev.at;
};

// ---------------------------------------------------------------------------------------------------------------
// Checkpoints (30-38): the station (walked past), the ride's (set by the ride as it passes them: back on a car, that
// far along, on the lane given; never inside a loop's warning), the unload (set as it pulls in).

export const RIDE_CPS: { cp: number; name: string; s: number; lane: Lane }[] = [
  { cp: 31, name: 'THE LIFT HILL', s: 1500, lane: 2 },
  { cp: 32, name: 'THE FIRST LOOP', s: 5700, lane: 1 },
  { cp: 33, name: 'THE GAUNTLET', s: 9600, lane: 1 },
  { cp: 34, name: 'THE HEAD-ON', s: 17100, lane: 2 },
  { cp: 35, name: 'THE MOUNTAIN', s: 23650, lane: 1 },
  { cp: 36, name: 'THE SPLASHDOWN', s: 32700, lane: 1 },
  { cp: 37, name: 'THE GRAND FINALE', s: 43300, lane: 1 },
];
export const UNLOAD_CP = 38;
export const CHECKPOINTS = [
  { name: 'TRUELLING TRAGONS', cp: 30, x: x0 + 200, y: GY },
  ...RIDE_CPS.map(c => ({ name: c.name, cp: c.cp, x: RX + 150, y: laneY(c.lane, c.s), manual: true })),
  { name: 'THE UNLOAD', cp: UNLOAD_CP, x: DECK_X1 + 200, y: GY, manual: true },
];
export const rideCp = (cp: number) => RIDE_CPS.find(c => c.cp === cp) ?? null;

/** The ride done (a revisit: no dragons, the ride's CLOSED; walk it along the ground). */
export const DONE_MEMO = 'fa-tragons-done';
/** The controls card shown (the first ride). */
export const TIPS_MEMO = 'fa-tragons-tips';
/** The loop card shown (the first loop got through). */
export const LOOP_MEMO = 'fa-tragons-loop';
