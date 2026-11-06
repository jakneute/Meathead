// What a refight is (one per land boss: park4/rf/<land>.ts fills one in; refights.ts lists them). The wrapper that
// runs it (refight.ts) is the same for all eight: the land's own stage, started at its boss's checkpoint, through
// Ned's portal into a knockoff of the arena in hell (the hell's tint, its props, the sin's), the boss stitched up the
// way he died, his lines swapped for the refight's, Ned's intro first.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { StageLayout } from '../../../m1/game/stages/index';
import type { RefightLand } from './hook';
import type { StitchLook } from './hell';

type Ctx = CanvasRenderingContext2D;
/** A line pool: one list, or one each way (clean, shitty pants, naked). */
export type Pool = readonly string[] | { readonly clean: readonly string[]; readonly shitty: readonly string[]; readonly nude: readonly string[] };

/** The sins (the owner's: the 8 bosses are the 7 deadly sins plus a robot). */
export type Sin = 'PRIDE' | 'GLUTTONY' | 'ENVY' | 'WRATH' | 'GREED' | 'LUST' | 'SLOTH' | 'ROBOT';

/** The lot's pylon sign for its portal (theme-park lot style: a picture and a word). */
export type SignPic = 'dinosaur' | 'bat' | 'rocket' | 'star' | 'statue' | 'train' | 'castle' | 'anvil';

export interface RefightDef {
  land: RefightLand;
  /** Its endgame stage id (endgame/stages.ts), and its engine stage's name (App.tsx registers it). */
  id: string; stage: string;
  /** Who: as Ned's card and the cheats' picker name him. */
  boss: string;
  sin: Sin;
  /** The land's own stage layout (run whole, started at `cp`). */
  inner: StageLayout;
  /** The boss's checkpoint in the land (where the refight starts: the retry path, outside his door). */
  cp: number;
  /** The lot's pylon: its picture, its word, its color. */
  sign: { pic: SignPic; word: string; color: string };
  /** The looks there are (the cheats build's picker), and the one this file's kill gives him. */
  looks: string[];
  lookNow: () => string;
  /** Harry's only: the statue's two (the cheats build picks it too), and this file's. */
  statueNow?: () => 'shot' | 'fell';
  /** What each look's called on the picker. */
  lookName: (look: string) => string;
  /** Ned's intro: his lines are park4/lines/ned.ts INTROS[land] (none for the Queen: Ned's in her booth instead). */
  /** The stitches over him, by look (hell.ts drawStitches; null: none, his own art does it). */
  stitches: (look: string) => StitchLook | null;
  /** The land's line pools swapped for the refight's: [the land's ByPants or list, the refight's]. */
  swaps: () => [Pool, Pool][];
  /** The arena in the world (the hell's props go along its back, at its floor). */
  arena: (state: GameState) => { l: number; r: number; floor: number } | null;
  /** Where the boss is drawn just now (his feet, how tall, facing), for the stitches over him; null: not about. */
  bossAt?: (state: GameState) => { x: number; feet: number; w: number; h: number; face: number } | null;
  /** Its own extras: drawn behind the actors (after the land's back), in front, and its own business each frame. */
  drawBack?: (c: Ctx, state: GameState) => void;
  drawFront?: (c: Ctx, state: GameState) => void;
  drawHud?: (c: Ctx, state: GameState) => void;
  update?: (ctx: FrameContext) => void;
  /** Built (the land's built under it: its own touches after). `fresh`: in through the portal (not a respawn). */
  build?: (state: GameState, fresh: boolean) => void;
}
