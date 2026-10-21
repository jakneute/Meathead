// A set piece that only allows the one weapon (the orbit's ray gun, the star sled's space blaster out of it, the
// duel's): every one of them goes through these, so they all behave the same. Forced, it's in his hands from then on;
// released (or the stage reset under it: a death, a door, a hub trip), the app gives him back whatever he had out
// before it (App.tsx followLock), or the ray gun if that's gone.

import type { GameState } from '../m1/game/core/state';
import type { WeaponType } from '../m1/types';

export const forceWeapon = (state: GameState, w: WeaponType) => { state.lockWeapon = w; state.player.currentWeapon = w; };
export const releaseWeapon = (state: GameState) => { state.lockWeapon = undefined; };
