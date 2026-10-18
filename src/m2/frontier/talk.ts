// What Wilderness Land's lines are shaped like. Pure data and types ONLY: the lines.ts files import this, and
// tools/voices bundles them in node (nothing here may pull in the engine, the canvas or timeOfDay.ts).

/** Tucker the train conductor's voice (cast.json). */
export const TUCKER_VOICE = 'm2.frontier.tucker';

/** Clean, shat, naked: a pool for each (him, or somebody reacting to the state of him). */
export interface ByPants { clean: string[]; shitty: string[]; nude: string[] }
export const allOf = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

/** What hurts him (by source), and the death screen when it's what killed him. */
export type HurtTable = Record<string, { hurt: string[]; death: string[] }>;
