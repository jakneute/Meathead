// Numbers about Meathead himself that another game on this engine can change while it runs (Meathead 2's hidden
// upgrades: src/m2/upgrades). Meathead 1 never sets any of them: everything here reads as the constants it always had.

import { INITIAL_PLAYER_HEALTH, POWER_CELLS } from '../../constants';
import type { Enemy, Player, Projectile } from '../../types';
import type { FrameContext } from './context';
import { buffs } from './buffs';

/** His full health (Meathead 1: INITIAL_PLAYER_HEALTH, always). */
let maxHealthOf: (() => number) | null = null;
export const setPlayerMaxHealth = (fn: (() => number) | null) => { maxHealthOf = fn; };
export const playerMaxHealth = () => maxHealthOf?.() ?? INITIAL_PLAYER_HEALTH;

/** How many power cells he has (Meathead 1: POWER_CELLS, always). */
let cellsOf: (() => number) | null = null;
export const setPowerCells = (fn: (() => number) | null) => { cellsOf = fn; };
export const powerCells = () => cellsOf?.() ?? POWER_CELLS;

/** A dive-kick stomp off an enemy gives a power cell back (Meathead 1: yes; Meathead 2: no, the dive kick's just free). */
let stompRefunds = true;
export const setStompRefund = (on: boolean) => { stompRefunds = on; };
export const stompRefund = () => stompRefunds;

/** Power cells held from refilling while this is true (Meathead 1: never; the engine already holds them through a
 *  charge, a slide and an uppercut). Meathead 2's: through a dive kick and the flash kick too. */
let powerHold: ((p: Player) => boolean) | null = null;
export const setPowerHold = (fn: typeof powerHold) => { powerHold = fn; };
export const powerHeld = (p: Player) => !!powerHold?.(p);

/** His four moves, as the damage hooks name them. */
export type MeleeMove = 'charge' | 'slide' | 'uppercut' | 'divekick';
/** Which of them he's doing (null: none). */
export const meleeMoveOf = (p: Player): MeleeMove | null =>
  // (Meathead 2's flash kick, out of a slide, is the slide's piece's move: it counts as the slide)
  p.flashKick ? 'slide' : p.isUppercutting ? 'uppercut' : p.isDivekicking ? 'divekick' : p.isCharging ? (p.isSliding ? 'slide' : 'charge') : null;

/** A move of his landing on an enemy, after the engine's picked the number: what it really does (Meathead 1: as it is).
 *  Not asked for a one-hit kill on a pest. */
let meleeHook: ((e: Enemy, move: MeleeMove, damage: number) => number) | null = null;
export const setMeleeDamageHook = (fn: typeof meleeHook) => { meleeHook = fn; };
export const meleeDamage = (e: Enemy, p: Player, damage: number) => {
  const move = meleeHook ? meleeMoveOf(p) : null;
  return move && meleeHook ? meleeHook(e, move, damage) : damage;
};

/**
 * What another game's gear changes about his moves and his legs (Meathead 2's armor and cape: src/m2/upgrades/apply.ts).
 * Meathead 1 never sets any of it: every answer here is the one it always had (times 1, nothing proof against anything).
 */
export interface MoveMods {
  /** His walking speed, times (on top of buffs.speed: the two multiply). */
  walk: () => number;
  /** A held jump's rising frames, times (on his own legs: not skis, not oil). */
  jumpHold: () => number;
  /** In the air on his own legs, falling, jump held: the fastest he falls (null: he just falls). */
  floatFall: (p: Player) => number | null;
  /** How far a move goes (its duration, or the dive kick's reach across), times. */
  reach: (move: MeleeMove) => number;
  /** This dive kick lands on a spiked top as on any other (KindDef.spiky; spike hazards). */
  spikeProof: (p: Player) => boolean;
  /** This shoulder charge goes through what's pointed at it as through anyone (KindDef.pointy). */
  pointProof: (p: Player) => boolean;
  /** This slide trips a regular enemy it doesn't kill and carries on through it (no bounce off). */
  slideThrough: (p: Player) => boolean;
  /** This uppercut lands on what's otherwise shut to it (a boss's shield). */
  uppercutPierces: (p: Player) => boolean;
  /** An enemy's shot that's reached him, before it hurts: true if his gear stops it (it's spent, he isn't hurt). */
  stopsShot: (ctx: FrameContext, shot: Projectile) => boolean;
  /** A trip off a slide (slideThrough): how long the enemy's down. */
  tripFrames: number;
}
const MOVE_MODS_NONE: MoveMods = {
  walk: () => 1, jumpHold: () => 1, floatFall: () => null, reach: () => 1,
  spikeProof: () => false, pointProof: () => false, slideThrough: () => false, uppercutPierces: () => false,
  stopsShot: () => false, tripFrames: 0,
};
let moveMods: MoveMods = MOVE_MODS_NONE;
export const setMoveMods = (m: Partial<MoveMods> | null) => { moveMods = m ? { ...MOVE_MODS_NONE, ...m } : MOVE_MODS_NONE; };
export const mods = () => moveMods;
/** How much faster than his plain walk he goes, all told: whatever's pumping him up (buffs.speed) times his gear's. */
export const walkSpeedK = () => buffs.speed * moveMods.walk();
