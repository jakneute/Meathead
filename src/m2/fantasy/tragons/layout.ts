// TRUELLING TRAGONS, laid out: where the station, the ride and the unload are in the world, the three tracks (their
// heights along the ride), the ride's script (what comes at him where, teach then escalate), and the checkpoints.
//
// THE RIDE stands still in the world and the world goes by it (as the Wilderness train): the trains leave the load
// station rolling right till their rears reach RX (LOCK in), then stay put while `dist` (how far along the track the
// trains' rears are) goes up; anything on the track at track position `s` is drawn at wxOf(dist, s). The ride's ~46500
// px of track at ~6 px a frame: a little over two minutes.
//
// The lanes, top to bottom (never crossing: the user's "not too tangly"; they spread apart and close in to near
// misses): 0 LIGHTNING (yellow and purple, up in the storm), 1 FIRE (red and orange), 2 ICE (blue and white, down low).
// Up (the mouse wheel up, RB) is the car above; down (wheel down, LB) the car below.

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
export const END_S = 46500;
export const DECK_X0 = RX + TL + 4, DECK_X1 = RX + TL + 460;
export const EXIT_X = RX + TL + 1500;
export const AWAY = -99999;

/** World x of track position s, with the trains `dist` along. */
export const wxOf = (dist: number, s: number) => S0X + Math.min(dist, LOCK) + (s - dist);
/** The trains' rears' world x, `dist` along. */
export const rearX = (dist: number) => S0X + Math.min(dist, LOCK);

// ---------------------------------------------------------------------------------------------------------------
// The tracks: the cars' roofs' heights above the ground along the ride (smoothed between the keys), top to bottom.
// Spread wide (the camera pulls out), closing in to near misses (140 apart: the camera pushes in).

const KEYS: [number, number, number, number][] = [
  [-2000, 380, 230, 70], [700, 380, 230, 70],
  [2600, 540, 370, 200], [4600, 600, 410, 220], [6600, 540, 360, 200],
  [8600, 700, 440, 180], [10600, 600, 440, 280], [12600, 720, 480, 220], [14600, 560, 400, 240],
  [16400, 520, 380, 240], [17200, 520, 380, 240], [18800, 700, 430, 200], [20600, 600, 400, 220],
  [22600, 740, 480, 200], [24600, 640, 460, 300], [26600, 700, 440, 220], [28600, 560, 400, 250],
  [30600, 740, 500, 240], [32600, 600, 440, 280], [34600, 700, 480, 240], [36600, 580, 420, 260],
  [38600, 740, 500, 220], [40600, 520, 380, 240], [41600, 520, 380, 240], [43200, 700, 460, 220],
  [44800, 600, 420, 240], [46200, 480, 330, 180], [60000, 480, 330, 180],
];
/** The near misses (the lanes closed right in): the ride's spiel and his line the first time. */
export const NEAR_MISS = [16400, 40600];

const ease = (u: number) => u * u * (3 - 2 * u);
/** A lane's roof's height above the ground at track position s. */
export const laneH = (lane: Lane, s: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1][0] <= s) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const u = Math.max(0, Math.min(1, (s - a[0]) / (b[0] - a[0])));
  return a[lane + 1] + (b[lane + 1] - a[lane + 1]) * ease(u);
};
/** A lane's roof (world y) at track position s. */
export const laneY = (lane: Lane, s: number) => GY - laneH(lane, s);
/** A train's roof (world y), its rear `dist` along (a train's level along its length: it's taken at its middle). */
export const trainY = (lane: Lane, dist: number) => laneY(lane, dist + TL / 2);

// ---------------------------------------------------------------------------------------------------------------
// The ride's speed (px a frame) along it: slow for the first holes (the teaching), up to speed, the brakes at the end.

export const V_TEACH = 5, V_RIDE = 6, V_LATE = 6.5;
export const speedAt = (dist: number) => {
  if (dist < 7000) return V_TEACH;
  if (dist > END_S - 1600) return Math.max(0.6, V_RIDE * Math.sqrt(Math.max(0, END_S - dist) / 1600));
  if (dist > 34000) return V_LATE;
  return V_RIDE;
};

// ---------------------------------------------------------------------------------------------------------------
// The script: what comes at him where (track positions). Obstacles come on every lane at once (each train its own:
// FIRE a burning ring / a flame jet / the dragon tower's fireballs; ICE an icicle curtain / a frozen bar / the snow
// cannon; LIGHTNING an arc curtain / a live rail / the storm's strikes), so whichever car he's on, he meets one of each:
// the duck ones first, then the jump ones, then what's thrown at him. Holes in the track: `his` (the one he's on when
// it breaks), `other` (one he isn't on), or all but one (`safe`: the one next to his, or the far one: two hops).

export type Ev =
  | { k: 'gap'; at: number; len: number; lane: 'his' | 'other'; warn: number; spare?: 'hank' }
  | { k: 'safe'; at: number; len: number; safe: 'next' | 'far'; warn: number }
  | { k: 'duck' | 'jump' | 'mover'; at: number }
  | { k: 'wake'; at: number; who: 'blake' | 'rafael' }
  | { k: 'say'; at: number; what: 'welcome' | 'rules' | 'piper' | 'near' };

export const SCRIPT: Ev[] = [
  // THE LIFT HILL: aboard and away; the spiel, the rules, Piper; the first hole alone, slow, a long warning; another
  { k: 'say', at: 200, what: 'welcome' },
  { k: 'say', at: 1400, what: 'rules' },
  { k: 'say', at: 2600, what: 'piper' },
  { k: 'gap', at: 5200, len: 900, lane: 'his', warn: 270 },
  { k: 'gap', at: 7600, len: 800, lane: 'his', warn: 210 },
  // THE GAUNTLET: each train's own, the duck ones, the jump ones, what's thrown; a hole among them
  { k: 'duck', at: 9000 }, { k: 'duck', at: 10200 },
  { k: 'jump', at: 11500 }, { k: 'jump', at: 12500 },
  { k: 'mover', at: 13800 },
  { k: 'gap', at: 15600, len: 800, lane: 'his', warn: 170 },
  // BLAKE: up out of his seat at the near miss; he throws, he comes over
  { k: 'say', at: 16000, what: 'near' },
  { k: 'wake', at: 16200, who: 'blake' },
  { k: 'duck', at: 18400 }, { k: 'jump', at: 19800 },
  { k: 'gap', at: 21600, len: 800, lane: 'his', warn: 160 },
  // ONLY ONE SAFE: the track out on two of them at once; the one next to his, then (from an edge) the far one
  { k: 'safe', at: 24000, len: 900, safe: 'next', warn: 190 },
  { k: 'mover', at: 25400 }, { k: 'duck', at: 26300 },
  { k: 'safe', at: 28000, len: 900, safe: 'far', warn: 210 },
  // RAFAEL: up and at him; it all at once now
  { k: 'wake', at: 28800, who: 'rafael' },
  { k: 'jump', at: 30200 }, { k: 'gap', at: 31800, len: 700, lane: 'his', warn: 150 },
  { k: 'mover', at: 32800 }, { k: 'safe', at: 34400, len: 800, safe: 'next', warn: 160 },
  // HANK: on the spare dragon that comes in after this one
  { k: 'gap', at: 35600, len: 700, lane: 'other', warn: 150, spare: 'hank' },
  { k: 'duck', at: 37000 }, { k: 'jump', at: 37400 },
  { k: 'safe', at: 38800, len: 800, safe: 'far', warn: 170 },
  { k: 'mover', at: 39800 },
  // THE TRIPLE NEAR MISS, and the last of it: one safe, then another, a hole on his, the duck and the jump
  { k: 'say', at: 40300, what: 'near' },
  { k: 'safe', at: 42000, len: 800, safe: 'far', warn: 160 },
  { k: 'safe', at: 43300, len: 700, safe: 'next', warn: 140 },
  { k: 'duck', at: 44300 }, { k: 'jump', at: 44900 },
];

/** How far ahead of the trains' heads an obstacle's put on the track (off the right of the screen, pulled out). */
export const SPAWN_AHEAD = 1500;
/** When an event goes off (the trains `dist` along, going `v`). */
export const evDue = (ev: Ev, dist: number, v: number) => {
  if (ev.k === 'gap' || ev.k === 'safe') return dist + TL >= ev.at - ev.warn * Math.max(v, 1);
  if (ev.k === 'duck' || ev.k === 'jump' || ev.k === 'mover') return dist + TL + SPAWN_AHEAD >= ev.at;
  return dist >= ev.at;
};

// ---------------------------------------------------------------------------------------------------------------
// Checkpoints (30-38): the station (walked past), the ride's (set by the ride as it passes them: back on a car, that
// far along, on the lane given), the unload (set as it pulls in).

export const RIDE_CPS: { cp: number; name: string; s: number; lane: Lane }[] = [
  { cp: 31, name: 'THE LIFT HILL', s: 1500, lane: 2 },
  { cp: 32, name: 'THE GAUNTLET', s: 8000, lane: 1 },
  { cp: 33, name: 'BLAKE', s: 16000, lane: 2 },
  { cp: 34, name: 'ONLY ONE SAFE', s: 22400, lane: 1 },
  { cp: 35, name: 'RAFAEL', s: 28700, lane: 2 },
  { cp: 36, name: 'HANK', s: 35000, lane: 1 },
  { cp: 37, name: 'THE TRIPLE NEAR MISS', s: 40100, lane: 1 },
];
export const UNLOAD_CP = 38;
export const CHECKPOINTS = [
  { name: 'TRUELLING TRAGONS', cp: 30, x: x0 + 200, y: GY },
  ...RIDE_CPS.map(c => ({ name: c.name, cp: c.cp, x: RX + 150, y: trainY(c.lane, c.s), manual: true })),
  { name: 'THE UNLOAD', cp: UNLOAD_CP, x: DECK_X1 + 200, y: GY, manual: true },
];
export const rideCp = (cp: number) => RIDE_CPS.find(c => c.cp === cp) ?? null;

/** The ride done (a revisit: no dragons, the ride's CLOSED; walk it along the ground). */
export const DONE_MEMO = 'fa-tragons-done';
/** The controls card shown (the first ride). */
export const TIPS_MEMO = 'fa-tragons-tips';
