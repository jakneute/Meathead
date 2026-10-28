// A power move asked for without the power for it: counted, so a HUD can blink its power cells red for it (Meathead 2's
// does; Meathead 1's doesn't look).

let n = 0;
export const notePowerShort = () => { n++; };
/** Goes up by one each time it happens. */
export const powerShort = () => n;
