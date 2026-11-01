// CON-FUCK-TIOUS saying something, in his voice (cast.json's m2.ben): `t.said` holds his words while they're said (draw
// them over his head; null when he's done: text only while it's spoken). Queued behind whoever's talking (no talk-over).

import { speak, type Said } from '../../adventure/section';
import { BEN_VOICE } from './lines';

export interface BenTalk { said: Said | null }
export const benSays = (t: BenTalk, text: string, after?: () => void) => speak(BEN_VOICE, text, s => { t.said = s; }, true, after);
