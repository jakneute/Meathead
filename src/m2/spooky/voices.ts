// Every line said in Spooky Land, by voice (for tools/voices: extract.ts, m2pack.ts). Each section's lines.ts exports
// its VOICE_LINES; a new file of lines (a shared cast's, say) gets added to this list.

import { VOICE_LINES as town } from './town/lines';
import { VOICE_LINES as castle } from './castle/lines';
import { VOICE_LINES as dungeon } from './dungeon/lines';
import { VOICE_LINES as tower } from './tower/lines';
import { VOICE_LINES as hell } from './hell/lines';
import { VOICE_LINES as control } from './control/lines';
import { VOICE_LINES as ballroom } from './ballroom/lines';

export const SPOOKY_VOICE_LINES: Record<string, string[]>[] = [town, castle, dungeon, tower, hell, control, ballroom];
