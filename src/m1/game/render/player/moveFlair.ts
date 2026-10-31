// What another game's gear does to the LOOK of his four charge moves (Meathead 2's armor: an armored move's speed lines,
// afterimages, glow, sparks, rings, the dive kick's fire and the hit bursts in the piece's own colors; set in
// src/m2/upgrades/gear.ts). Meathead 1 never sets it: every move draws in the colors it always had.
// Colors only, picked per frame from a fixed set: nothing painted per pixel, nothing baked.

import type { MeleeMove } from '../../core/tuning';

export interface MoveFlair {
  /** Speed lines / streaks (alternating). */
  lines: readonly [string, string];
  /** The glow's stops, inside out (alpha in them). */
  glow: readonly [string, string, string];
  /** The afterimages' tint (a canvas filter). */
  ghost: string;
  /** Sparks (alternating). */
  sparks: readonly [string, string];
  /** The rings bursting off him: "r, g, b" (the alpha's added as they fade). */
  ring: string;
  /** Kicked-up dust: "r, g, b". */
  dust: string;
  /** Fire, cool to hot, six steps (the dive kick's): fireball.ts FIRE_RAMP's shape. */
  fire: readonly string[];
  /** A hit's burst (the engine's explosion colour). */
  burst: string;
}

let hook: ((move: MeleeMove) => MoveFlair | null) | null = null;
/** Another game's say on how an armored move looks (null: off). */
export const setMoveFlair = (fn: ((move: MeleeMove) => MoveFlair | null) | null) => { hook = fn; };
/** That move's own look right now, or null (as it always was). */
export const moveFlair = (move: MeleeMove): MoveFlair | null => (hook ? hook(move) : null);
