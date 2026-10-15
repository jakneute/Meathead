// The fight's state (fight.ts runs it, cars.ts runs the cars in it, art.ts draws it).

import type { Enemy, Block } from '../../../m1/types';
import type { CarColor } from './carArt';

export type CarMode =
  // a red car: out of its door, along the floor at him, the drift (or a swing round him), on and out
  | 'enter' | 'run' | 'drift' | 'orbit' | 'recover' | 'exit'
  // a blue car: along the back lane to its ramp, up it, through the hoop, down (on him, or a skid)
  | 'approach' | 'climb' | 'air' | 'skid'
  // a tow car: Steve on a rope behind it
  | 'tow'
  // the end of one: into a wall, burning, frozen solid, gone; and his (bulked up: picked up and thrown)
  | 'crash' | 'wreck' | 'frozen' | 'held' | 'thrown' | 'gone';

export interface Car {
  id: number; color: CarColor; e: Enemy; roof: Block;
  /** Its middle on the floor, the bottom of its wheels, its depth; how it's moving. */
  x: number; y: number; z: number; vx: number; vy: number;
  /** Its nose (radians in the floor's plane), its nose up or down in the air. */
  yaw: number; pitch: number;
  /** Which way it's going along the floor; how fast; frames in this mode. */
  dir: 1 | -1; speed: number; mode: CarMode; t: number;
  /** What it'll do when it gets to him (a red one: the drift into him, or a swing round him); the drift's tail-out
   *  side (and a swing's: in front of him first, or behind); a swing round him: the middle of it, how far round. */
  plan: 'drift' | 'orbit' | 'none'; swing: 1 | -1; ox: number; ang: number;
  /** A blue car's ramp (its index); in the air: frames gone, frames it'll take, the depth it left from. */
  ramp: number; airT: number; airTotal: number; z0: number;
  /** He's on its roof; it's had him already this pass. */
  rider: boolean; hit: boolean;
  crumple: number; ice: number; burnt: number; wheel: number; fade: number;
  /** Steve's last stunt (the death): it hits nobody else. */
  scripted?: boolean;
}

/** A moving ramp in the back lane (its lip's x, which way it jumps), and its hoop on the truss over the jump's top. */
export interface Ramp {
  x: number; dir: 1 | -1;
  /** A blue car's on its way to it (no other gets it). */
  lockT: number;
  /** Where it's creeping to now, how fast (they never stop moving: every jump goes off somewhere else). */
  to: number; v: number;
}

export interface Skid { x: number; z: number }
