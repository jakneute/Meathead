// What Fairy Land's lines are shaped like. Pure data and types ONLY: the lines.ts files import this, and tools/voices
// bundles them in node (nothing here may pull in the engine, the canvas or timeOfDay.ts).

/** PIPER THE PIXIE's voice (cast.json): sultry (the joke's the voice against the look of her, revealed at the end). */
export const PIPER_VOICE = 'm2.fantasy.piper';
/** ...and the same voice over the park's PA (the town's loudspeaker horns). */
export const PIPER_PA_VOICE = 'm2.fantasy.piper_pa';

/** Clean, shat, naked: a pool for each (him, or somebody reacting to the state of him). */
export interface ByPants { clean: string[]; shitty: string[]; nude: string[] }
export const allOf = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

/** What hurts him (by source), and the death screen when it's what killed him (28 characters at most). */
export type HurtTable = Record<string, { hurt: string[]; death: string[] }>;
