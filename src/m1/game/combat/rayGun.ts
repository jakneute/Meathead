// Meathead 2's standard gun: a ray gun he's put together out of the alien's leftovers. It works exactly like the
// pistol (same rate, same damage), but it shoots pink bolts and what it kills it vaporizes, the way the alien's beam did
// the Secret Service. Off unless a game turns it on (Meathead 2 does, at startup); Meathead's pistol is the pistol.

let on = false;
export const setRayGun = (yes: boolean) => { on = yes; };
/** Is the pistol a ray gun in this game? */
export const rayGun = () => on;
