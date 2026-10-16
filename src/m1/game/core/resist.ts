// How much of a hurt Meathead actually takes where he is: all of it, everywhere but the finale, where he's so pumped
// up that the alien's laser and the Secret Service's bullets barely leave a mark (some hits under 1% of his health).

import { FINALE_STAGE, FINALE_DAMAGE_TAKEN } from '../../constants';

/** How hard everything hits him, overall, as the game playing has it (Meathead 2: setHurtScale; Meathead 1: as it is). */
let hurtScale = 1;
export const setHurtScale = (k: number) => { hurtScale = k; };
export const hurtTaken = (stageId: string | null | undefined, damage: number) =>
  (stageId === FINALE_STAGE ? damage * FINALE_DAMAGE_TAKEN : damage) * hurtScale;

/** In the finale he's got the grit to match: hurt, he doesn't get knocked back or knocked out of what he's doing (the
 * alien's laser, the Secret Service's bullets, fists and shields; everything). */
export const gritty = (stageId: string | null | undefined) => stageId === FINALE_STAGE || armored;

/** A shield shove is a set distance, and the shoved man can't hurt him by contact meanwhile (Meathead 2; Meathead 1's
 *  shove goes on only while the charge is held, as it always has). */
let setShove = false;
export const setShoveSetDistance = (on: boolean) => { setShove = on; };
export const shoveSetDistance = () => setShove;

/** Armor, fighting-game style, wherever he is (Meathead 2, through a grab): hurt, but not knocked about or out of it. */
let armored = false;
/** Who's giving it him (a grab, a weapon's windup): armored while any of them is, so one setting it off every frame
 *  never takes another's away. */
const holders = new Set<string>();
export const setArmor = (on: boolean, who = 'grab') => { if (on) holders.add(who); else holders.delete(who); armored = holders.size > 0; };
