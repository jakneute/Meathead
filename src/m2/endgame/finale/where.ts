// The kaiju finale's ids and numbers (pure data: endgame/stages.ts reads them, nothing drawn or imported here).
//
// Level 5, after Ned (park4/lot.ts's AFTER_CP hands over to it): giant Meathead against the embiggened widow (Zarblax)
// and Satan, stomping left to right through all eight lands, at sunrise. Two checkpoints only (the owner's: "only one
// checkpoint in the fight: after 4 out of 8 have been cleared"): the very start (the opening cutscene, then AMERICA
// USA), and FOREIGN LANDS done (on into FUTURE LAND).

export const FINALE_ID = 'finale';
export const FINALE_STAGE = 'M2 Kaiju Finale';
/** Sunrise: Ned's dead (14, the dawn), the hour on once more (timeOfDay.ts's last key). */
export const FINALE_HOUR = 15;
/** The checkpoints: the start (the cutscene, AMERICA USA), and after the 4th land (the 8th section) is flattened. */
export const FIN_CP_START = 0, FIN_CP_MID = 1;
/** (the test picker only) Straight to Cartoon Land's end, both of them down (the finishers' phase). */
export const FIN_CP_DAZED = 2;
/** (the test picker's ENDING tab) Past the fight: the ending with that finisher's id set, by its place in FIN_ENDINGS. */
export const FIN_CP_ENDING = 100;
export const FIN_ENDINGS: [string, string][] = [
  ['GUN', 'RAY GUN'], ['SOUVENIR', 'SOUVENIR LAUNCHER'], ['SOUL_SUCKER', 'SOUL SUCKER'], ['FLINTLOCK', 'LASER-GUIDED FLINTLOCK'], ['SPELLBOOK', 'SPELLBOOK OF THE DAMNED'],
  ['STUNT_CAR', 'THE CLAPPING CLAPPERBOARD'], ['MALLET', 'MALLET OF PAIN'], ['SPAWNER', 'OTHERWORLDLY SPAWNER'], ['CROSSBOW', 'CROSSBOW OF PLAGUES'], ['TOWER', 'THE WATER TOWER'], ['NOTHING', 'DO NOTHING'],
];
