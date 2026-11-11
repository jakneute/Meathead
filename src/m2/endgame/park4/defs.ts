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

/** A refight's own place in hell (park4/place/<land>.ts each): not the land's arena under a red filter, its own
 *  light and its own sky; the near background's set pieces go in through the land's own back pass (hooks), at their
 *  own depth. */
export interface HellPlace {
  /** The light: how dark, the shadows' color, the grade over it all (each hell its own: they aren't all red). */
  light: { dark: number; shade: [number, number, number]; grade: string };
  /** The sky and the far vista (screen space, 800 x 600, painted once), over the land's own backdrop: `alpha` 1 hides
   *  the land's altogether. */
  sky?: { paint: (g: Ctx) => void; alpha: number };
  /** Cheap moving bits over the sky, each frame (screen space: embers, ash, a far thing going by). No pixel work. */
  skyLive?: (c: Ctx, state: GameState) => void;
}

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
  /** Ned's intro: his lines are park4/lines/ned.ts INTROS[land] (the Queen too: her sin is ROBOT). */
  /** (the first pass's: seams over his hit box. Not drawn any more: his body's stitched in his own art, park4/looks.ts) */
  stitches?: (look: string) => StitchLook | null;
  /** Its own place in hell (none: the first pass's red haze). */
  place?: HellPlace;
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
