// Every line said in Foreign Lands, by voice (for tools/voices: extract.ts, m2pack.ts). Each section's lines.ts
// exports its VOICE_LINES; a new file of lines gets added to this list.

import { VOICE_LINES as land } from './lines';
import { VOICE_LINES as mexico } from './mexico/lines';
import { VOICE_LINES as norway } from './norway/lines';
import { VOICE_LINES as china } from './china/lines';
import { VOICE_LINES as germany } from './germany/lines';
import { VOICE_LINES as italy } from './italy/lines';
import { VOICE_LINES as japan } from './japan/lines';
import { VOICE_LINES as morocco } from './morocco/lines';
import { VOICE_LINES as france } from './france/lines';
import { VOICE_LINES as uk } from './uk/lines';
import { VOICE_LINES as canada } from './canada/lines';
import { VOICE_LINES as theater } from './theater/lines';
import { VOICE_LINES as heli } from './heli/lines';
import { VOICE_LINES as harry } from './harry/lines';

export const FOREIGN_VOICE_LINES: Record<string, string[]>[] = [land, mexico, norway, china, germany, italy, japan, morocco, france, uk, canada, theater, heli, harry];
