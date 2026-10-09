// Every line said in Adventure Land, by voice (for tools/voices: extract.ts, m2pack.ts).

import { VOICE_LINES as jungle } from './jungle/lines';
import { VOICE_LINES as queue } from './queue/lines';
import { VOICE_LINES as river } from './river/lines';
import { VOICE_LINES as dino } from './dino/lines';
import { VOICE_LINES as temple } from './temple/lines';
import { VOICE_LINES as cart } from './cart/lines';
import { VOICE_LINES as roof } from './roof/lines';
import { VOICE_LINES as clearing } from './clearing/lines';
import { VOICE_LINES as guides } from './guides';

export const ADV_VOICE_LINES: Record<string, string[]>[] = [jungle, queue, river, dino, temple, cart, roof, clearing, guides];
