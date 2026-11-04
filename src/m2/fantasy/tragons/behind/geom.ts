// TRUELLING TRAGONS from behind (the owner's redo: "a perspective adjusted rework of the existing minigame", like the
// grind rails in Sonic games): the three tracks side by side in one plane going away to the horizon, him on the rear
// car of his dragon, the camera behind and over him. This file is the shape of it all: where each track is at a track
// position s (its sideways place, its height, the ride's curves and hills, a track veering off for a moment and back,
// a roll through a loop), the camera, the projection, and the script (what comes at him where: teach, then escalate).
//
// Track positions are the classic ride's (layout.ts: the same stretch, the same length, the same checkpoints, the same
// mountain and lagoon), so the music, the checkpoints and the PA all land where they always did.
//
// WORLD (for the ride from behind): x sideways (+ right), y up from the park's lawn, s along the ride. THE LANES left
// to right: 0 LIGHTNING, 1 FIRE, 2 ICE (the classic ride's top to bottom). LB (and the previous / next weapon keys the
// way they're bound to LB) hops him a track left, RB a track right.
//
// A LOOP from behind is a roll (the owner's brief: the view rolls round): the track winds round a line over it, the
// dragon rolled right over with it. On his own track the camera rolls with his car (the whole view drawn turned: the
// park overhead at the top of it); on another track, that dragon's seen corkscrewing beside him. THE UNISON loops (all
// three at once) roll the three round one line over the middle track, like one rigid frame.

import { END_S, TUNNEL, LAGOON, laneH, stretch, type Lane } from '../layout';
import { CANVAS_WIDTH } from '../../../../m1/constants';

// ---------------------------------------------------------------------------------------------------------------
// Sizes

/** The track drawn in steps this long; this many steps ahead (the draw distance). */
export const SEG = 40, DRAW_N = 96;
export const DRAW = SEG * DRAW_N;
/** The projection's focal length; the camera this far behind his car and this far over it; the horizon's screen row
 *  (level). */
export const FOCAL = 360, CAM_BACK = 300, CAM_UP = 150, HORIZON = 292;
/** His car's scale on screen. */
export const NEAR_K = FOCAL / CAM_BACK;
/** The lanes this far apart; each track this wide each side of its middle. */
export const LANE_W = 176, TRACK_HW = 36;
/** A car: this long along the track; the train's three; his the rear one, its middle this far on from `dist`. */
export const CAR_L = 100, REAR = 50;
/** The train's nose: this far on from `dist` (the classic TL). */
export const NOSE = 300;
/** A roll's line: this far over the track (his chest, about: the heartline). */
export const ROLL_R = 66;
/** The farthest sideways he can hop (a track veered off further than this is out of reach). */
export const HOP_REACH = 320;

const sm = (u: number) => { const k = Math.max(0, Math.min(1, u)); return k * k * (3 - 2 * k); };

// ---------------------------------------------------------------------------------------------------------------
// The ride's curves (the whole frame of three bending left and right: sideways world x), its hills (the classic ride's
// middle track's heights: the lift hill, the drops, the mountain, the splashdown), the veers.

/** The whole ride's sideways bend at s (every lane the same). Straight on the lift and the drops; winding between. */
export const curveX = (s: number) => {
  const calm = s < stretch(5200) ? 0.15 : 1;
  return calm * (420 * Math.sin(s / 2900) + 260 * Math.sin(s / 1370 + 1.3));
};
/** The bend's curvature at s (for the bank). */
export const curveK = (s: number) => (curveX(s + 60) - 2 * curveX(s) + curveX(s - 60)) / 3600;

/** A track veering off for a moment and back (the owner's): which lane, from s (old units), how long, how far
 *  sideways (out from the others) and up. */
interface Veer { lane: Lane; a: number; len: number; dx: number; dy: number }
const VEERS: Veer[] = ([
  // (the gauntlet: LIGHTNING swings out wide and back; ICE dips and rises)
  { lane: 0, a: 11600, len: 1300, dx: -420, dy: 60 },
  { lane: 2, a: 12400, len: 1000, dx: 120, dy: -70 },
  // (THE HEAD-ON: the outside tracks swing out and come back in at the middle, close)
  { lane: 0, a: 17400, len: 1700, dx: -380, dy: 120 },
  { lane: 2, a: 17600, len: 1600, dx: 380, dy: -40 },
  // (after the mountain: FIRE climbs away over the others and back)
  { lane: 1, a: 26900, len: 900, dx: 0, dy: 170 },
  // (the gauntlet again: ICE out wide)
  { lane: 2, a: 29300, len: 1100, dx: 460, dy: 40 },
  // (after the helix: LIGHTNING out and back)
  { lane: 0, a: 40600, len: 1200, dx: -440, dy: -60 },
  { lane: 2, a: 43300, len: 900, dx: 300, dy: 90 },
] as Veer[]).map(v => ({ ...v, a: stretch(v.a), len: Math.round(v.len * 1.5) }));

const veerAt = (lane: Lane, s: number, o: { dx: number; dy: number }) => {
  o.dx = 0; o.dy = 0;
  for (const v of VEERS) {
    if (v.lane !== lane || s <= v.a || s >= v.a + v.len) continue;
    const u = (s - v.a) / v.len, k = sm(u * 3) * sm((1 - u) * 3);
    o.dx += v.dx * k; o.dy += v.dy * k;
  }
  return o;
};
const VO = { dx: 0, dy: 0 };

/** A lane's track at s before any roll: sideways x, height y. */
export const laneBase = (lane: Lane, s: number, o: { x: number; y: number }) => {
  veerAt(lane, s, VO);
  o.x = curveX(s) + (lane - 1) * LANE_W + VO.dx;
  o.y = laneH(1, s) + VO.dy;
  return o;
};

// ---------------------------------------------------------------------------------------------------------------
// Rolls (the loops)

/** A roll on some lanes: from s0 for len, turns, which way, round its own line or the middle track's (the unison). */
export interface Roll {
  lanes: Lane[]; s0: number; len: number; turns: number; dir: 1 | -1; shared: boolean;
  /** The script's event it came of; its warning (frames); the teaching one; what it's called on the card. */
  ev: number; w: number; teach: boolean; kind: string;
}

/** The roll's angle u of the way through (eased in and out: never a kink). */
const rollAng = (r: Roll, u: number) => r.dir * Math.PI * 2 * r.turns * (u - Math.sin(Math.PI * 2 * u) / (Math.PI * 2));

/** The roll on lane at s (or null). */
export const rollOn = (rolls: Roll[], lane: Lane, s: number) => {
  for (const r of rolls) if (s > r.s0 && s < r.s0 + r.len && r.lanes.includes(lane)) return r;
  return null;
};

/** A point of track: sideways x, height y, rolled phi (radians, counterclockwise as seen from behind). */
export interface TP { x: number; y: number; phi: number }
const B = { x: 0, y: 0 }, M = { x: 0, y: 0 };
/** Where lane's track is at s (rolls and all), into o. */
export const trackAt = (rolls: Roll[], lane: Lane, s: number, o: TP): TP => {
  laneBase(lane, s, B);
  o.x = B.x; o.y = B.y; o.phi = 0;
  const r = rollOn(rolls, lane, s);
  if (r) {
    const phi = rollAng(r, (s - r.s0) / r.len);
    let ax = B.x, ay = B.y + ROLL_R;
    if (r.shared) { laneBase(1, s, M); ax = M.x; ay = M.y + ROLL_R; }
    const dx = B.x - ax, dy = B.y - ay, c = Math.cos(phi), sn = Math.sin(phi);
    o.x = ax + dx * c - dy * sn; o.y = ay + dx * sn + dy * c; o.phi = phi;
  }
  return o;
};

// ---------------------------------------------------------------------------------------------------------------
// The camera and the projection

export interface Cam {
  /** Where it is (world), how it's turned (canvas radians: the roll of his car undone, and the bank), its horizon's
   *  screen row (pitched up and down with the hills). */
  x: number; y: number; s: number; ang: number; hy: number;
}
/** A projected point: screen x, y and its scale. */
export interface SP { x: number; y: number; k: number }
/** World (x, y, s) on screen (before the view's turned), or false behind the camera. */
export const project = (cam: Cam, x: number, y: number, s: number, o: SP): boolean => {
  const z = s - cam.s;
  if (z < 24) return false;
  const k = FOCAL / z;
  o.x = CANVAS_WIDTH / 2 + (x - cam.x) * k; o.y = cam.hy - (y - cam.y) * k; o.k = k;
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Where things are along the ride

export const inTunnel = (s: number) => s > TUNNEL.a && s < TUNNEL.b;
export const inLagoon = (s: number) => s > LAGOON.a && s < LAGOON.b;
export { END_S, TUNNEL, LAGOON };

// ---------------------------------------------------------------------------------------------------------------
// The script (old track positions, stretched like the classic ride's). Teach, then escalate: the first hole on the
// lift (a hop); the ICE track's icicles (duck), the FIRE track's burning stretch and its rings (jump), the LIGHTNING
// dragon going live (hop off); then the first loop, all three at once (no way round it: learn to hang on); then mixes;
// FIRE and ICE looping with LIGHTNING the way out (it only loops in the unison ones), and LIGHTNING going live right
// after; the head-on with the tracks swinging out; the mountain (the cave: rings and icicles in the dark, a hole); the
// interlocked loops; the gauntlet again; the splashdown; the triple helix (unison); ONLY ONE SAFE; the double roll;
// the finale (three rolls, one after another, all of them) and one last hole.
//
//   fire  the FIRE track's burning stretch from `at`, `len` long, its rings (jump through) every `gap`
//   ice   the ICE track's gantries from `at`: one a `gap`, by the pattern (i icicles: duck; b a frozen bar: jump)
//   zap   the LIGHTNING dragon goes live: the tell, then live (hop off it)
//   gap   the track broken ahead on his lane (hop off it); safe: all but one ('next' to his, or the 'far' one)
//   spin  a roll: on 'his' track (FIRE or ICE: on LIGHTNING it goes on the other two), FIRE and ICE ('two'), all three
//         ('all', round the middle), the one ONLY ONE SAFE left ('safe'); its kind, length, turns, warning

export type BvEv =
  | { k: 'fire'; at: number; len: number; gap: number }
  | { k: 'ice'; at: number; pat: string; gap: number }
  | { k: 'zap'; at: number }
  | { k: 'gap'; at: number; len: number; warn: number }
  | { k: 'safe'; at: number; len: number; safe: 'next' | 'far'; warn: number }
  | { k: 'spin'; at: number; kind: 'loop' | 'cork' | 'chain' | 'braid' | 'chain3'; on: 'his' | 'two' | 'all' | 'safe'; len: number; turns?: number; warn: number; teach?: boolean }
  | { k: 'say'; at: number; what: 'welcome' | 'rules' | 'piper' | 'near' | 'drop' | 'tunnel' | 'splash' | 'piperMid' | 'piperLate' };

const L = (n: number) => Math.round(n * 1.5);
export const BV_SCRIPT: BvEv[] = ([
  // THE LIFT HILL: aboard and up; the spiel, the rules, Piper; the icicles (duck), then the first hole (hop)
  { k: 'say', at: 200, what: 'welcome' },
  { k: 'say', at: 1300, what: 'rules' },
  { k: 'ice', at: 2100, pat: 'iii', gap: 520 },
  { k: 'say', at: 2300, what: 'piper' },
  { k: 'fire', at: 2900, len: L(700), gap: 560 },
  { k: 'gap', at: 4300, len: L(700), warn: 300 },
  // THE FIRST DROP; THE FIRST LOOP: all three together, slow, a long warning and the card
  { k: 'say', at: 4900, what: 'drop' },
  { k: 'spin', at: 7900, kind: 'loop', on: 'all', len: L(1100), warn: 330, teach: true },
  // THE GAUNTLET: the lightning dragon live (the first), the rings and the icicles and bars together, a hole
  { k: 'zap', at: 9800 },
  { k: 'fire', at: 10200, len: L(1300), gap: 520 },
  { k: 'ice', at: 10300, pat: 'ibibi', gap: 560 },
  { k: 'zap', at: 11800 },
  { k: 'gap', at: 13300, len: L(800), warn: 220 },
  // THE SECOND DROP; FIRE and ICE loop (LIGHTNING the way out), and LIGHTNING goes live right after (hop back)
  { k: 'say', at: 13700, what: 'drop' },
  { k: 'spin', at: 15700, kind: 'loop', on: 'two', len: L(1000), warn: 260 },
  { k: 'zap', at: 16200 },
  // THE HEAD-ON: the outside tracks swing out and back; rings, icicles, live
  { k: 'say', at: 17700, what: 'near' },
  { k: 'fire', at: 17700, len: L(1500), gap: 470 },
  { k: 'ice', at: 17800, pat: 'iibib', gap: 500 },
  { k: 'zap', at: 19000 },
  // THE CORKSCREW (his, rolled the other way); ONLY ONE SAFE
  { k: 'spin', at: 20300, kind: 'cork', on: 'his', len: L(1000), warn: 240 },
  { k: 'say', at: 21800, what: 'piperMid' },
  { k: 'safe', at: 22500, len: L(800), safe: 'next', warn: 210 },
  // THE MOUNTAIN: in the dark: rings, icicles, live, a hole
  { k: 'say', at: 23300, what: 'tunnel' },
  { k: 'fire', at: 24050, len: L(800), gap: 470 },
  { k: 'ice', at: 24100, pat: 'ibi', gap: 480 },
  { k: 'zap', at: 24100 },
  { k: 'gap', at: 25000, len: L(700), warn: 200 },
  // THE CHAIN: FIRE and ICE, one roll after the other
  { k: 'spin', at: 26300, kind: 'chain', on: 'two', len: L(1000), warn: 240 },
  // THE GAUNTLET AGAIN; ONLY ONE SAFE, and the one that's left rolls straight after the hop
  { k: 'fire', at: 27900, len: L(1300), gap: 440 },
  { k: 'ice', at: 27900, pat: 'bibib', gap: 470 },
  { k: 'zap', at: 28500 },
  { k: 'zap', at: 29800 },
  { k: 'safe', at: 30700, len: L(800), safe: 'next', warn: 200 },
  { k: 'spin', at: 31600, kind: 'loop', on: 'safe', len: L(1000), warn: 150 },
  // THE SPLASHDOWN
  { k: 'say', at: 32700, what: 'splash' },
  // THE TRIPLE HELIX: all three wound round one line, two turns (no way round it: hang on)
  { k: 'spin', at: 35900, kind: 'braid', on: 'all', len: L(1900), turns: 2, warn: 280 },
  // (out of it: rings, bars, then ONLY ONE SAFE (the far one), live, the double roll on FIRE and ICE)
  { k: 'fire', at: 38600, len: L(700), gap: 420 },
  { k: 'ice', at: 38650, pat: 'bb', gap: 420 },
  { k: 'safe', at: 39500, len: L(800), safe: 'far', warn: 220 },
  { k: 'zap', at: 40600 },
  { k: 'say', at: 40800, what: 'near' },
  { k: 'spin', at: 41600, kind: 'cork', on: 'two', len: L(1500), turns: 2, warn: 240 },
  { k: 'ice', at: 43500, pat: 'iibi', gap: 420 },
  { k: 'fire', at: 43500, len: L(600), gap: 420 },
  // THE GRAND FINALE: Piper; three rolls one after another, all of them; live; one more hole; the brakes
  { k: 'say', at: 44000, what: 'piperLate' },
  { k: 'spin', at: 45400, kind: 'chain3', on: 'all', len: L(900), warn: 280 },
  { k: 'zap', at: 47300 },
  { k: 'fire', at: 47400, len: L(500), gap: 400 },
  { k: 'gap', at: 48000, len: L(700), warn: 200 },
] as BvEv[]).map(ev => ({ ...ev, at: stretch(ev.at) }));

/** How far ahead an obstacle's put on the track (just past the draw distance). */
export const SPAWN_AHEAD = DRAW + 200;
/** When an event goes off (the trains `dist` along, going `v`): the warned ones their warning ahead of the nose; the
 *  obstacles as they come into view; the rest as the trains get there. */
export const bvDue = (ev: BvEv, dist: number, v: number) => {
  if (ev.k === 'gap' || ev.k === 'safe' || ev.k === 'spin') return dist + NOSE >= ev.at - ev.warn * Math.max(v, 1);
  if (ev.k === 'fire' || ev.k === 'ice') return dist + SPAWN_AHEAD >= ev.at;
  return dist >= ev.at;
};
/** The end of what an event puts on the track (for a checkpoint start: what's still to come). */
export const bvEnd = (ev: BvEv) =>
  ev.k === 'fire' || ev.k === 'gap' || ev.k === 'safe' || ev.k === 'spin' ? ev.at + ev.len + (ev.k === 'spin' && ev.kind === 'chain3' ? 600 : ev.k === 'spin' && ev.kind === 'chain' ? ev.len / 2 : 0)
    : ev.k === 'ice' ? ev.at + ev.pat.length * ev.gap : ev.at;

/** The LIGHTNING dragon going live: the tell, then live (frames). */
export const ZAP_TELL = 100, ZAP_LIVE = 140;
