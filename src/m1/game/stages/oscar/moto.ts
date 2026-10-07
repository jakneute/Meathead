// On a biker's chopper: the jet ski's rules on dry land (carried along; right's
// faster, left eases off and turns him round to shoot back; the special's a
// wheelie that rams, up + special leaps, down + special in the air drives him
// down on whatever's under him). Dirty Dan's machine gun, and nothing else. The stage draws the bike under him.

import type { GameState } from '../../core/state';

/** Speeds on the bike: cruising, opened up, easing off. */
export const MOTO_BASE = 8, MOTO_FAST = 11, MOTO_SLOW = 5.5;
/** How far ahead of him the camera looks (not far: plenty's coming from behind). */
export const MOTO_LEAD = 90;

export const mountMoto = (state: GameState, speed = MOTO_BASE) => {
  const p = state.player;
  p.skiing = true; p.jetski = true; p.moto = true; p.skiSpeed = speed;
  // (with Dirty Dan's machine gun: nothing else till it's over)
  p.currentWeapon = 'LMG';
  state.lockWeapon = 'LMG';
  state.cameraLeadX = MOTO_LEAD;
};

export const dismountMoto = (state: GameState) => {
  const p = state.player;
  p.skiing = false; p.jetski = false; p.moto = false; p.skiSpeed = 0;
  p.isCharging = false; p.isUppercutting = false; p.isDivekicking = false;
  state.lockWeapon = undefined;
  state.cameraLeadX = 0;
};
