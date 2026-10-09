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

/** Armor, fighting-game style, wherever he is (Meathead 2, through a grab): hurt, but not knocked about or out of it. */
let armored = false;
export const setArmor = (on: boolean) => { armored = on; };
