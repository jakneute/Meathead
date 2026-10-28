// The Iron Pit, Meathead 2's opening stage (gym/index.ts runs it): his gym, Meathead 1's, the length of it laid out to
// teach, a room at a time, the G-men in each running from him, something in each to pulverize them with:
//
//   start     his squat rack, the hand truck of protein by the door they came in through. Move.
//   shoot     two of them out in the open lugging boxes; two more cowering behind a stack of protein tubs (shoot the
//             stack and it comes down on them).
//   charge    a human wall, arms linked; past it, two huddled against the dumbbell rack (charge one into it and the
//             rack comes down on the lot).
//   slide     a run of ductwork down off the ceiling to knee height: three G-men crawl in under it. Slide under. The
//             kettlebell rack before it: slide into it and they go rolling down under the duct like bowling balls.
//   uppercut  two up on the tall storage shelves, out of reach; the cable machine with one hiding behind its stack
//             (uppercut it: the weights go up the rods, and come down).
//   divekick  up the plyo boxes to the mezzanine, and on off its end onto the renovation's scaffold, four G-men
//             huddled under it and a plywood partition past it up to the ceiling: the only way on is a dive kick down
//             through its boards, and it all comes down on them (the user's: a forced dive kick). The bench past it
//             (dive kick its bar end: the plates go flying).
//   mix       a bit of everything.
//   ring      Meathead 1's ring: the two padded trainers, the grabs.
//   exit      the door out, EXIT over it, the arrow pointing on. Shut till the ring's done.
//
// His souvenirs from Meathead 1 are scattered the length of it (the easter egg: one here, a couple there).

import { GROUND_Y } from '../../../m1/constants';
import type { Room } from './lines';

export const GYM_STAGE = 'M2 Iron Pit';
export const X0 = -90000;
export const Y = GROUND_Y;
/** The ceiling's underside (clear of the HUD's bars), and the end walls. */
export const CEIL_Y = 70;
export const LEFT = X0 - 40, RIGHT = X0 + 6000;
export const START_X = X0 + 330;
const R = (x: number) => X0 + x;

export type Obstacle = 'tubs' | 'rack' | 'kbells' | 'cable' | 'bench';
export interface ObstacleSpot { kind: Obstacle; x: number }
export type Role = 'carry' | 'cower' | 'link' | 'crawl' | 'huddle' | 'perch' | 'hide';
/** `from`: where he drops in, if not where he ends up (he runs there: under the scaffold, from past it). */
export interface Spawn { room: Room; role: Role; x: number; y?: number; from?: number }
export interface Ledge { x: number; y: number; w: number; look: 'shelf' | 'step' }

/** Where each room starts (its lesson comes up as he gets there), and where it ends. */
export const ROOMS: Record<Room, [number, number]> = {
  shoot: [R(560), R(1320)], charge: [R(1320), R(2080)], slide: [R(2080), R(2780)], uppercut: [R(2780), R(3480)],
  divekick: [R(3480), R(4300)], mix: [R(4300), R(4920)],
};
export const ROOM_ORDER: Room[] = ['shoot', 'charge', 'slide', 'uppercut', 'divekick', 'mix'];

/** The squat rack he was in, the hand truck, the door in from outside (the far left). */
export const SQUAT_X = R(260), TRUCK_X = R(130), FRONT_DOOR_X = R(30);

/** The duct down off the ceiling (to knee height): only a slide tackle gets him under it (index.ts duct). */
export const DUCT = { x1: R(2330), x2: R(2560), bottom: Y - 48 };

/** The mezzanine (up the plyo boxes), and its edge. */
export const MEZZ_Y = Y - 200;
export const MEZZ = { x1: R(3600), x2: R(3820) };
/** The scaffold off the mezzanine's end: its deck (stood on, broken only by a dive kick), the plywood partition hung
 *  off the ceiling down to it at its far end (wallX..x2: the way on's down through it, not over). */
export const SCAF = { x1: MEZZ.x2, x2: R(4060), wallX: R(4000), deck: Y - 140 };

export const LEDGES: Ledge[] = [
  { x: R(2880), y: Y - 120, w: 130, look: 'shelf' },
  { x: R(3110), y: Y - 150, w: 130, look: 'shelf' },
  { x: R(3500), y: Y - 100, w: 100, look: 'step' },
  { x: R(4560), y: Y - 120, w: 130, look: 'shelf' },
];

export const OBSTACLES: ObstacleSpot[] = [
  { kind: 'tubs', x: R(1060) },
  { kind: 'rack', x: R(1930) },
  { kind: 'kbells', x: R(2210) },
  { kind: 'cable', x: R(3360) },
  { kind: 'bench', x: R(4180) },
  { kind: 'tubs', x: R(4420) },
  { kind: 'rack', x: R(4800) },
];

export const SPAWNS: Spawn[] = [
  { room: 'shoot', role: 'carry', x: R(720) }, { room: 'shoot', role: 'carry', x: R(860) },
  { room: 'shoot', role: 'cower', x: R(1120) }, { room: 'shoot', role: 'cower', x: R(1160) },
  { room: 'charge', role: 'link', x: R(1560) }, { room: 'charge', role: 'link', x: R(1600) }, { room: 'charge', role: 'link', x: R(1640) }, { room: 'charge', role: 'link', x: R(1680) },
  { room: 'charge', role: 'huddle', x: R(1860) }, { room: 'charge', role: 'huddle', x: R(1890) },
  // (they come down out past the duct and crawl in under it)
  { room: 'slide', role: 'crawl', x: R(2600) }, { room: 'slide', role: 'crawl', x: R(2650) }, { room: 'slide', role: 'crawl', x: R(2700) },
  { room: 'uppercut', role: 'perch', x: R(2945), y: Y - 120 }, { room: 'uppercut', role: 'perch', x: R(3175), y: Y - 150 },
  { room: 'uppercut', role: 'hide', x: R(3405) },
  // (down past the scaffold, and in under it)
  { room: 'divekick', role: 'huddle', x: R(3870), from: R(4090) }, { room: 'divekick', role: 'huddle', x: R(3905), from: R(4090) },
  { room: 'divekick', role: 'huddle', x: R(3940), from: R(4090) }, { room: 'divekick', role: 'huddle', x: R(3975), from: R(4090) },
  { room: 'divekick', role: 'huddle', x: R(4250) },
  { room: 'mix', role: 'carry', x: R(4350) }, { room: 'mix', role: 'cower', x: R(4470) }, { room: 'mix', role: 'perch', x: R(4625), y: Y - 120 }, { room: 'mix', role: 'huddle', x: R(4760) },
];

/** The ring: its mat (a step up), the posts, the two trainers' spots; the exit door past it. */
export const RING = { x1: R(5000), x2: R(5640), mat: Y - 34 };
export const PAD_X = R(5260), JET_X = R(5440), JET_Y = Y - 34 - 150;
export const EXIT_X = R(5870);
/** Walking up to here (once the ring's done) ends the stage. */
export const EXIT_AT = R(5830);

/**
 * Meathead 1's souvenirs (every one of them: m1 content/garage.ts), scattered the length of the gym where they'd end
 * up: hung on the walls, on the little shelves and the window sills, by the lockers, on the floor in corners, by the
 * ring. (x, y: the anchor, as the garage draws them: a hung one's middle, a standing one's bottom.)
 */
export const SOUVENIR_SPOTS: { id: string; x: number; y: number; s?: number }[] = [
  // (the start: over his rack, by the door, the TV shelf)
  { id: 'antler', x: R(250), y: 300 }, { id: 'lizard', x: R(60), y: Y }, { id: 'mug', x: R(470), y: 342 },
  // (the free weights: the neon over the mirror, a shelf of bits)
  { id: 'neon', x: R(700), y: 296 }, { id: 'snowglobe', x: R(940), y: 342 },
  // (the cardio floor's wall, the floor by the rack)
  { id: 'seismo', x: R(1460), y: 300 }, { id: 'viprope', x: R(1780), y: Y }, { id: 'lavalamp', x: R(1700), y: 342 },
  // (the slide run: up high over the duct, by the fountain)
  { id: 'daycare', x: R(2180), y: 290 }, { id: 'flamingo', x: R(2700), y: Y },
  // (under the shelves)
  { id: 'hazmat', x: R(2840), y: 300 }, { id: 'clicker', x: R(3050), y: 342 }, { id: 'breaker', x: R(3280), y: 290 },
  // (the mezzanine: on its rail's wall, under it)
  { id: 'clock', x: R(3700), y: 250 }, { id: 'horn', x: R(3540), y: 342 }, { id: 'flintjar', x: R(4250), y: 342 },
  // (the mix room)
  { id: 'chain', x: R(4300), y: 300 }, { id: 'toaster', x: R(4500), y: 342 }, { id: 'derrick', x: R(4700), y: Y },
  // (by the ring: the bell for the rounds, his boots and the hard hat on the stool, the gold gun and the badge over it)
  { id: 'bell', x: R(4950), y: 342 }, { id: 'moonboots', x: R(5720), y: Y }, { id: 'hardhat', x: R(5110), y: 342 },
  { id: 'goldgun', x: R(5200), y: 296 }, { id: 'badge', x: R(5460), y: 300 },
];
/** The little wall shelves the shelf souvenirs sit on (x, y: its top, w). */
export const WALL_SHELVES = SOUVENIR_SPOTS.filter(s => s.y === 342).map(s => ({ x: s.x - 36, y: 342, w: 72 }));
