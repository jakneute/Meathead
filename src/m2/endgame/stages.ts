// The endgame's stages, in order (the owner's plan: the water park's levels, the refights, Satan at sunrise; only the
// first is started). Pure data, nothing drawn: the save (save.ts), CONTINUE (App.tsx) and the planned endgame test
// cheat read it (the memory's endgame-test-skip: out through America USA with the checkpoint skip on, LEFT / RIGHT a
// stage from this list, UP / DOWN one of its `checkpoints`, confirm to go there).
//
// Before them all: the prologue of the epilogue (the owner's name for it), every run: out of the hub through America
// USA, the way in walked backward to his truck (intro/walkOut.ts), the abduction in the garage and Satan's throw
// (endgame/abduction.ts). It isn't a stage of its own here: it's the way in.

import { L4_ID, L4_STAGE, L4_HOUR, LOT_CP as L4_LOT_CP, NED_CP as L4_NED_CP, AFTER_CP as L4_AFTER_CP, refightId, refightStage } from './park4/where';
import { FINALE_ID, FINALE_STAGE, FINALE_HOUR, FIN_CP_START, FIN_CP_MID } from './finale/where';

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
 *  CP.L2). Hour 11 from there (the kid's dead). Level 2's own checkpoints run on from it (endgame/park2/geo.ts CP2). */
export const L2_CP = 40;
/** Level 3's very start, in PARK_STAGE too: out of the goth son's grotto, past THE LAZY RIVER, at the MAINTENANCE door
 *  (endgame/park2/geo.ts CP2.L3). Hour 12 from there (the son's dead). */
export const L3_CP = 49;
/** Level 3 itself (THE MAINTENANCE TUNNELS, THE WAVE POOL: endgame/park3): its own engine stage, in through that door. */
export const TUNNEL_STAGE = 'M2 Water Park Tunnels';

/** Level 4 (endgame/park4/where.ts): the lot, and the refights (each land, its boss, his checkpoint in the land: the
 *  same numbers as park4/rf/<land>.ts's). */
export { L4_ID, L4_STAGE, L4_HOUR, LOT_CP as L4_LOT_CP, NED_CP as L4_NED_CP, AFTER_CP as L4_AFTER_CP } from './park4/where';
const REFIGHT_LIST: [string, string, number][] = [
  ['adventure', 'SAFARI ARTIE', 71], ['spooky', 'DONNIE DRACULA', 62], ['space', 'THE QUEEN', 74], ['hollywood', 'STUNTMAN STEVE', 60],
  ['foreign', 'HELICOPTER HARRY', 120], ['frontier', 'TUCKER', 61], ['fantasy', 'PIPER THE PIXIE', 61], ['cartoon', 'DAD GUY', 62],
];

export const ENDGAME_STAGES: EndgameStage[] = [
  // Level 1, its start: the lot just outside the water park, where Satan threw his truck
  { id: 'lot', level: 1, stage: LOT_STAGE, name: 'LEVEL 1: THE LOT', hour: 10, checkpoints: [{ name: 'THE WRECK', cp: 0 }, { name: 'THE GATE', cp: 1 }] },
  // Level 1, through the gate he kicks down: the entry plaza, the slides, the tubes, MOUNT EVEREST BUT BETTER, the summit
  // (endgame/park1/geo.ts CHECKPOINTS: these match it)
  { id: 'park1', level: 1, stage: PARK_STAGE, name: 'LEVEL 1: THE WATER PARK', hour: 10, checkpoints: [
    { name: 'THE GATE', cp: 0 }, { name: 'LIL SQUIRT', cp: 1 }, { name: 'THE TWISTER', cp: 2 }, { name: 'THE LAGOON', cp: 3 },
    { name: 'THE KAMIKAZE', cp: 4 }, { name: 'THE BLACK HOLE', cp: 5 }, { name: 'THE SPLASHDOWN', cp: 6 }, { name: 'THE ABYSS', cp: 7 },
    { name: 'BASE CAMP', cp: 8 }, { name: 'CAMP 2', cp: 9 }, { name: 'CAMP 4', cp: 10 }, { name: 'THE HILLARY STEP', cp: 11 },
  ] },
  // Level 2 (the owner's brief 2026-11-05): on from the splashdown where level 1's slide ends, through THE LAZY RIVER
  // (set on fire by Satan's goth son), to his grotto; the kid's dead, the hour's on (11). (endgame/park2/geo.ts CP2:
  // these match it)
  { id: 'park2', level: 2, stage: PARK_STAGE, name: 'LEVEL 2: THE LAZY RIVER', hour: 11, checkpoints: [
    { name: 'THE SPLASHDOWN', cp: L2_CP }, { name: 'THE LAZY RIVER', cp: 41 }, { name: 'THE BURNING CANOPY', cp: 42 }, { name: 'THE LOG JAM', cp: 43 },
    { name: 'THE SWIM-UP BAR', cp: 44 }, { name: 'THE TIKI TOWERS', cp: 45 }, { name: 'THE SOUP', cp: 46 }, { name: 'THE LAST BEND', cp: 47 },
    { name: 'THE GROTTO', cp: 48 },
  ] },
  // Level 3 (the owner's brief 2026-11-05): its very start, the MAINTENANCE door at the end of THE LAZY RIVER (a file's
  // CONTINUE comes back here); the son's dead, the hour's on (12)
  { id: 'park3', level: 3, stage: PARK_STAGE, name: 'LEVEL 3: THE MAINTENANCE DOOR', hour: 12, checkpoints: [{ name: 'THE DOOR', cp: L3_CP }] },
  // ...and in through it: THE MAINTENANCE TUNNELS, the flooded pipes, the pump room, the outflow to THE WAVE POOL and
  // GUPPLAX (endgame/park3/geo.ts CP3: these match it). Level 3's end goes on to level 4 (the lot: goTo(L4_ID)).
  { id: 'park3t', level: 3, stage: TUNNEL_STAGE, name: 'LEVEL 3: THE MAINTENANCE TUNNELS', hour: 12, checkpoints: [
    { name: 'THE SERVICE DOOR', cp: 0 }, { name: 'THE LOWER CORRIDOR', cp: 1 }, { name: 'THE PISS FILTER', cp: 2 }, { name: 'CHEMICAL STORAGE', cp: 3 },
    { name: 'THE GANGWAYS', cp: 4 }, { name: 'THE SHAFT', cp: 5 }, { name: 'THE FLOODED PIPES', cp: 6 }, { name: 'THE JUNCTIONS', cp: 7 },
    { name: 'THE PUMP ROOM (GUPPLAX)', cp: 8 },
  ] },
  // Level 4 (the owner's brief 2026-11-05): the lot outside, NED THE NECROMANCER's portals, the eight refights (each
  // its own stage: the land's own boss fight, through his portal, endgame/park4), then Ned. Hour 13 (level 3's boss
  // dead). The file keeps which refights are done (EndgameRecord.rematches): CONTINUE puts him in the lot, those
  // skipped. Level 3's end calls goTo(L4_ID) with setStartCheckpoint(L4_LOT_CP).
  { id: L4_ID, level: 4, stage: L4_STAGE, name: 'LEVEL 4: THE LOT (NED)', hour: L4_HOUR, checkpoints: [
    { name: 'THE PORTALS', cp: L4_LOT_CP }, { name: 'NED THE NECROMANCER', cp: L4_NED_CP }, { name: 'AFTER NED (THE LAST BATTLE STUB)', cp: L4_AFTER_CP },
  ] },
  ...REFIGHT_LIST.map(([land, boss, cp]) => ({ id: refightId(land), level: 4, stage: refightStage(land), name: `LEVEL 4: REFIGHT, ${boss}`, hour: L4_HOUR, checkpoints: [{ name: boss, cp }] })),
  // Level 5 (the owner's brief 2026-11-06): the kaiju finale. Giant Meathead against the embiggened widow and Satan,
  // left to right through the eight lands at sunrise (endgame/finale). One checkpoint in the fight: after the 4th land.
  { id: FINALE_ID, level: 5, stage: FINALE_STAGE, name: 'LEVEL 5: THE KAIJU FINALE', hour: FINALE_HOUR, checkpoints: [
    { name: 'THE START (AMERICA USA)', cp: FIN_CP_START }, { name: 'FUTURE LAND (4 OF 8 DOWN)', cp: FIN_CP_MID },
  ] },
];
export { FINALE_ID, FINALE_STAGE } from './finale/where';

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
