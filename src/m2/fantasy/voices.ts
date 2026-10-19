// Every line said in Fairy Land, by voice (for tools/voices: extract.ts, m2pack.ts; and lines/consistency.ts's OWN set,
// so none of them gets weeded out). Each section's lines.ts exports its VOICE_LINES; a new file of lines gets added to
// this list.

import { VOICE_LINES as land } from './lines';
import { VOICE_LINES as square } from './square/lines';
import { VOICE_LINES as wheel } from './wheel/lines';
import { VOICE_LINES as glen } from './glen/lines';
import { VOICE_LINES as tragons } from './tragons/lines';
import { VOICE_LINES as keep } from './keep/lines';
import { VOICE_LINES as broom } from './broom/lines';
import { VOICE_LINES as bedroom } from './bedroom/lines';

export const FANTASY_VOICE_LINES: Record<string, string[]>[] = [land, square, wheel, glen, tragons, keep, broom, bedroom];
