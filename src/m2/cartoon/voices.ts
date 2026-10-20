// Every line said in Cartoon Land, by voice (for tools/voices: extract.ts, m2pack.ts; and lines/consistency.ts's OWN set,
// so none of them gets weeded out). Each section's lines.ts exports its VOICE_LINES; a new file of lines gets added to
// this list.

import { VOICE_LINES as land } from './lines';
import { VOICE_LINES as kiddie } from './kiddie/lines';
import { VOICE_LINES as studio } from './studio/lines';
import { VOICE_LINES as whitehouse1 } from './whitehouse1/lines';
import { VOICE_LINES as whitehouse2 } from './whitehouse2/lines';
import { VOICE_LINES as bigkid } from './bigkid/lines';
import { VOICE_LINES as itchy } from './itchy/lines';
import { VOICE_LINES as amphi } from './amphi/lines';

export const CARTOON_VOICE_LINES: Record<string, string[]>[] = [land, kiddie, studio, whitehouse1, whitehouse2, bigkid, itchy, amphi];
