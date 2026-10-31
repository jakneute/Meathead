// Numbers about Meathead himself that another game on this engine can change while it runs (Meathead 2's hidden
// upgrades: src/m2/upgrades). Meathead 1 never sets any of them: everything here reads as the constants it always had.

import { INITIAL_PLAYER_HEALTH, POWER_CELLS } from '../../constants';
import type { Enemy, Player } from '../../types';

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

/** His four moves, as the damage hooks name them. */
export type MeleeMove = 'charge' | 'slide' | 'uppercut' | 'divekick';
/** Which of them he's doing (null: none). */
export const meleeMoveOf = (p: Player): MeleeMove | null =>
  p.isUppercutting ? 'uppercut' : p.isDivekicking ? 'divekick' : p.isCharging ? (p.isSliding ? 'slide' : 'charge') : null;

/** A move of his landing on an enemy, after the engine's picked the number: what it really does (Meathead 1: as it is).
 *  Not asked for a one-hit kill on a pest. */
let meleeHook: ((e: Enemy, move: MeleeMove, damage: number) => number) | null = null;
export const setMeleeDamageHook = (fn: typeof meleeHook) => { meleeHook = fn; };
export const meleeDamage = (e: Enemy, p: Player, damage: number) => {
  const move = meleeHook ? meleeMoveOf(p) : null;
  return move && meleeHook ? meleeHook(e, move, damage) : damage;
};
