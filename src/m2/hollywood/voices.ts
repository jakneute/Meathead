// Every line said in Hollywood Land, by voice (for tools/voices: extract.ts, m2pack.ts). Each section's lines.ts
// exports its VOICE_LINES; a new file of lines (a shared cast's, say: the impersonators, the PA's Steve plugs) gets
// added to this list.

import { VOICE_LINES as blvd } from './blvd/lines';
import { VOICE_LINES as coaster } from './coaster/lines';
import { VOICE_LINES as warehouse } from './warehouse/lines';
import { VOICE_LINES as lot } from './lot/lines';
import { VOICE_LINES as disaster } from './disaster/lines';
import { VOICE_LINES as havoc } from './havoc/lines';
import { VOICE_LINES as stunt } from './stunt/lines';

export const HOLLYWOOD_VOICE_LINES: Record<string, string[]>[] = [blvd, coaster, warehouse, lot, disaster, havoc, stunt];
