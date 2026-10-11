// Every line said in Space Land, by voice (for tools/voices: extract.ts, m2pack.ts). Each section's lines.ts exports
// its VOICE_LINES; a new file of lines (a shared cast's, say: the aliens) gets added to this list.

import { VOICE_LINES as square } from './square/lines';
import { VOICE_LINES as atom } from './atom/lines';
import { VOICE_LINES as ride } from './ride/lines';
import { VOICE_LINES as drag } from './drag/lines';
import { VOICE_LINES as needle } from './needle/lines';
import { VOICE_LINES as orbit } from './orbit/lines';
import { VOICE_LINES as crater } from './crater/lines';
import { VOICE_LINES as queen } from './queen/lines';

export const SPACE_VOICE_LINES: Record<string, string[]>[] = [square, atom, ride, drag, needle, orbit, crater, queen];
