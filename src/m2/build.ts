/** Meathead 2's standard build (`--mode m2public`: release-m2/app/Meathead2.html): no cheat panel. The cheats build is `--mode m2`. */
export const M2_PUBLIC = import.meta.env.MODE === 'm2public';
/** The alpha's endings (the victory walk out through America USA, THE END?, the PA's tiers on it, the cheats build's
 *  title ALPHA ENDING row): kept in the code, switched off. The owner, 2026-11-04: "no more 'alpha endings', dummy those
 *  out (don't remove)". Out through America USA is the endgame's way in now (endgame/). */
export const ALPHA_ENDINGS = false as boolean;
