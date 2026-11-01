// What the hidden upgrades have him say, by voice (recorded: tools/voices extract.ts and m2pack.ts read this table).

import { CRUSHED_VOICE_LINES } from './crushedLines';
import { BEN_VOICE_LINES } from './confucktious/lines';

/** The amulet's piss-off yell (amulet.ts): his own voice, through a canyon's echo (cast.json's m2.yell, fx 'echo'). */
export const YELL_LINE = 'FUCK OFF!';
/** Several tables by voice, merged (a voice in more than one gets all of its lines). */
const merge = (...ts: Record<string, string[]>[]) => {
  const out: Record<string, string[]> = {};
  for (const t of ts) for (const [v, l] of Object.entries(t)) (out[v] ??= []).push(...l);
  return out;
};
export const UPGRADE_VOICE_LINES: Record<string, string[]> = merge(
  { 'm2.yell': [YELL_LINE] },
  // (the hand armor's cheap shot: the bosses' crushed-nuts lines, and his: crushedLines.ts)
  CRUSHED_VOICE_LINES,
  // (CON-FUCK-TIOUS, the hidden armor's teacher, and Meathead at him: confucktious/lines.ts)
  BEN_VOICE_LINES,
);
