// Every line said in Wilderness Land, by voice (for tools/voices: extract.ts, m2pack.ts; and lines/consistency.ts's
// OWN set, so none of them gets weeded out). Each section's lines.ts exports its VOICE_LINES; a new file of lines gets
// added to this list.

import { VOICE_LINES as land } from './lines';
import { VOICE_LINES as wilds } from './wilds/lines';
import { VOICE_LINES as wildsFalls } from './wilds/fallsLines';
import { VOICE_LINES as train } from './train/lines';
import { VOICE_LINES as town } from './town/lines';
import { VOICE_LINES as logride } from './logride/lines';
import { VOICE_LINES as woods } from './woods/lines';
import { VOICE_LINES as dirtbike } from './dirtbike/lines';
import { VOICE_LINES as arena } from './arena/lines';

export const FRONTIER_VOICE_LINES: Record<string, string[]>[] = [land, wilds, wildsFalls, train, town, logride, woods, dirtbike, arena];
