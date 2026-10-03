// How much of a hurt Meathead actually takes where he is: all of it, everywhere but the finale, where he's so pumped
// up that the alien's laser and the Secret Service's bullets barely leave a mark (some hits under 1% of his health).

import { FINALE_STAGE, FINALE_DAMAGE_TAKEN } from '../../constants';

export const hurtTaken = (stageId: string | null | undefined, damage: number) =>
  stageId === FINALE_STAGE ? damage * FINALE_DAMAGE_TAKEN : damage;
