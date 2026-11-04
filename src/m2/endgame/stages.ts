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
  /** Which of the water park's levels it belongs to (1 on). The owner's: "loaded saves take you to the very start of
   *  the stage you last reached": CONTINUE puts him at the first checkpoint of the first stage of this level
   *  (endgameLevelStart), whatever checkpoint the file was saved at. */
  level: number;
  /** The engine's stage name (App.tsx registers its layout under it). */
  stage: string;
  /** What the test cheat's list calls it. */
  name: string;
  /** The hour it's at (timeOfDay.ts: 10 on are the endgame's, through the night to sunrise). */
  hour: number;
  /** Where in it a run can start: the checkpoint skip's list, the save's. In order. */
  checkpoints: { name: string; cp: number }[];
}

/** What the file keeps of the endgame (save.ts, store.ts endgameAt): the stage he's got to and the checkpoint in it
 *  (in a session, where a death puts him back), and, for level 4 (Ned's boss rush, the only stage with partial
 *  progress kept: the owner's), which of the eight rematches are done. */
export interface EndgameRecord { stage: string; cp: number; rematches?: string[] }

/** The water park's name: the placeholder (the owner's still to name it). Every sign that says it reads it from here. */
export const WATER_PARK_NAME = 'HAPPY WATERS';

export const LOT_STAGE = 'M2 Water Park Lot';
/** The water park itself: level 1 (the entry plaza, the slides, the tubes, MOUNT EVEREST BUT BETTER), and on into
 *  level 2's start (the owner designs it): one continuous run (endgame/park1). */
export const PARK_STAGE = 'M2 Water Park';
/** Level 2's start, in PARK_STAGE: the splashdown at the foot of MOUNT EVEREST BUT BETTER's slide (endgame/park1/geo.ts
 *  CP.L2). Hour 11 from there (the kid's dead). */
export const L2_CP = 40;

export const ENDGAME_STAGES: EndgameStage[] = [
  // Level 1, its start: the lot just outside the water park, where Satan threw his truck
  { id: 'lot', level: 1, stage: LOT_STAGE, name: 'LEVEL 1: THE LOT', hour: 10, checkpoints: [{ name: 'THE WRECK', cp: 0 }, { name: 'THE GATE', cp: 1 }] },
  // Level 1, through the gate he kicks down: the entry plaza, the slides, the tubes, MOUNT EVEREST BUT BETTER, the summit
  // (endgame/park1/geo.ts CHECKPOINTS: these match it)
  { id: 'park1', level: 1, stage: PARK_STAGE, name: 'LEVEL 1: THE WATER PARK', hour: 10, checkpoints: [
    { name: 'THE GATE', cp: 0 }, { name: 'LIL SQUIRT', cp: 1 }, { name: 'THE TWISTER', cp: 2 }, { name: 'THE LAZY RIVER', cp: 3 },
    { name: 'THE KAMIKAZE', cp: 4 }, { name: 'THE BLACK HOLE', cp: 5 }, { name: 'THE SPLASHDOWN', cp: 6 }, { name: 'THE ABYSS', cp: 7 },
    { name: 'BASE CAMP', cp: 8 }, { name: 'CAMP 2', cp: 9 }, { name: 'CAMP 4', cp: 10 }, { name: 'THE HILLARY STEP', cp: 11 },
  ] },
  // Level 2 (the owner designs it): for now just its start, the splashdown where level 1's slide ends; the kid's dead,
  // the hour's on (11)
  { id: 'park2', level: 2, stage: PARK_STAGE, name: 'LEVEL 2: (STUB)', hour: 11, checkpoints: [{ name: 'THE SPLASHDOWN', cp: L2_CP }] },
];

export const endgameStage = (id: string) => ENDGAME_STAGES.find(s => s.id === id) ?? null;
export const endgameOfStage = (stage: string) => ENDGAME_STAGES.find(s => s.stage === stage) ?? null;
/** Where the endgame starts: the first stage, its first checkpoint. */
export const ENDGAME_START = { stage: ENDGAME_STAGES[0].id, cp: ENDGAME_STAGES[0].checkpoints[0].cp };
/** The very start of the level a stage belongs to: its first stage, that stage's first checkpoint (CONTINUE's place). */
export const endgameLevelStart = (id: string): { stage: string; cp: number } => {
  const st = endgameStage(id) ?? ENDGAME_STAGES[0], first = ENDGAME_STAGES.find(s => s.level === st.level) ?? st;
  return { stage: first.id, cp: first.checkpoints[0].cp };
};
/** The endgame stage (of those sharing an engine stage, as the park's levels do) a checkpoint of it is in. */
export const endgameAtCheckpoint = (stage: string, cp: number) => {
  const all = ENDGAME_STAGES.filter(s => s.stage === stage);
  return all.find(s => s.checkpoints.some(c => c.cp === cp)) ?? all[0] ?? null;
};
