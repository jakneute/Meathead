// Real hell's own state (in Spooky Land's per-section state, made fresh with the stage each life).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import { spookyState } from '../section';
import type { Demon } from './demon';
import type { Finale } from './satan';

/** An imp's fireball, lobbed. */
export interface Fireball { x: number; y: number; vx: number; vy: number; life: number }
/** A rock that crumbles: its ledge, and how it's doing (shaking, gone: frames of it). */
export interface Crumble { b: Block; x: number; y: number; w: number; shake: number; gone: number }
/** A car coming down the shaft: where, how far it's fallen (its bottom), the warning before it drops. */
export interface Car { x: number; y: number; vy: number; warn: number }

export interface Hell {
  shots: Fireball[];
  crumbles: Crumble[];
  /** The shaft: frames till the next car, the one coming down, and how many more have piled up since he got here. */
  carIn: number; car: Car | null; piled: number[];
  /** Coming down the pit: falling hard (for the landing), landed already, said his bit about the lava, the car. */
  falling: boolean; landed: boolean; lavaSaid: boolean; carSaid: boolean;
  demon: Demon | null;
  fin: Finale | null;
}

export const hellOf = (state: GameState) => spookyState<Hell>(state, 'hell', () => ({
  shots: [], crumbles: [], carIn: 900, car: null, piled: [], falling: false, landed: false, lavaSaid: false, carSaid: false, demon: null, fin: null,
}));
