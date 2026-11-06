// Level 4's ids and numbers (pure data: endgame/stages.ts reads them too).

/** Level 4's endgame stage id (the lot: endgame/stages.ts), its engine stage's name, its hour. */
export const L4_ID = 'park4';
export const L4_STAGE = 'M2 Water Park Lot (Ned)';
/** The hour: level 3's boss down (10 at level 1, one on per water park boss: 13 here, 14 once Ned's dead). */
export const L4_HOUR = 13;
/** The lot's checkpoints: the portals (Ned's not turned up yet / is turning up as he arrives), Ned's fight (all eight
 *  done), after Ned (the last battle's stub). */
export const LOT_CP = 0, NED_CP = 1, AFTER_CP = 2;
/** Each refight's endgame stage id and engine stage name, by land. */
export const refightId = (land: string) => `rf-${land}`;
export const refightStage = (land: string) => `M2 Refight ${land}`;
/** The eight, in the hub's ring order (the lot's portals go round in it). */
export const REFIGHT_LANDS = ['hollywood', 'fantasy', 'adventure', 'foreign', 'space', 'frontier', 'spooky', 'cartoon'] as const;
