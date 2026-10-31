// What the hidden upgrades have him say, by voice (recorded: tools/voices extract.ts and m2pack.ts read this table).

/** The amulet's piss-off yell (amulet.ts): his own voice, through a canyon's echo (cast.json's m2.yell, fx 'echo'). */
export const YELL_LINE = 'FUCK OFF!';
export const UPGRADE_VOICE_LINES: Record<string, string[]> = {
  'm2.yell': [YELL_LINE],
};
