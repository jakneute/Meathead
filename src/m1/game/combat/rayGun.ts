// Meathead 2's standard gun: a ray gun he's put together out of the alien's leftovers. It works exactly like the
// pistol (same rate, same damage), but it shoots pink bolts and what it kills it vaporizes, the way the alien's beam did
// the Secret Service. Off unless a game turns it on (Meathead 2 does, at startup); Meathead's pistol is the pistol.

import type { VulgarityType } from '../../types';

let on = false, killLine: VulgarityType = 'gun_kill';
/** `kill`: what Meathead says over a ray gun kill (the gun's own lines, if the game has them; the pistol's otherwise). */
export const setRayGun = (yes: boolean, kill: VulgarityType = 'gun_kill') => { on = yes; killLine = kill; };
/** Is the pistol a ray gun in this game? */
export const rayGun = () => on;
export const rayKillLine = () => killLine;
