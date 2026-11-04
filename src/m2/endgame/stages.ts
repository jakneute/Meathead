// The endgame's stages, in order (the owner's plan: the water park's levels, the refights, Satan at sunrise; only the
// first is started). Pure data, nothing drawn: the save (save.ts), CONTINUE (App.tsx) and the planned endgame test
// cheat read it (the memory's endgame-test-skip: out through America USA with the checkpoint skip on, LEFT / RIGHT a
// stage from this list, UP / DOWN one of its `checkpoints`, confirm to go there).
//
// Before them all: the prologue of the epilogue (the owner's name for it), every run: out of the hub through America
// USA, the way in walked backward to his truck (intro/walkOut.ts), the abduction in the garage and Satan's throw
// (endgame/abduction.ts). It isn't a stage of its own here: it's the way in.

export interface EndgameStage {
  /** Its id: goTo(id), and what the save keeps (store.ts endgameAt). */
  id: string;
  /** The engine's stage name (App.tsx registers its layout under it). */
  stage: string;
  /** What the test cheat's list calls it. */
  name: string;
  /** The hour it's at (timeOfDay.ts: 10 on are the endgame's, through the night to sunrise). */
  hour: number;
  /** Where in it a run can start: the checkpoint skip's list, the save's. In order. */
  checkpoints: { name: string; cp: number }[];
}

export const LOT_STAGE = 'M2 Water Park Lot';

export const ENDGAME_STAGES: EndgameStage[] = [
  // Stage 1 (a stub for now: the owner fills it in): the lot just outside the water park, where Satan threw his truck
  { id: 'lot', stage: LOT_STAGE, name: 'STAGE 1: THE LOT', hour: 10, checkpoints: [{ name: 'THE WRECK', cp: 0 }, { name: 'THE GATE', cp: 1 }] },
];

export const endgameStage = (id: string) => ENDGAME_STAGES.find(s => s.id === id) ?? null;
export const endgameOfStage = (stage: string) => ENDGAME_STAGES.find(s => s.stage === stage) ?? null;
/** Where the endgame starts: the first stage, its first checkpoint. */
export const ENDGAME_START = { stage: ENDGAME_STAGES[0].id, cp: ENDGAME_STAGES[0].checkpoints[0].cp };
