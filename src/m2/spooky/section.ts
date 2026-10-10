// Spooky Land's sections: Adventure Land's Section (adventure/section.ts), with Spooky Land's ids, and the bits every
// Spooky section uses. Everything in adventure/section.ts (lay, solid, ledge, teleport, hands, meatheadSays, speak,
// saidOver, box, label...) works here as it is: import it from here or from there.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally, and must re-read it before editing.

import type { GameState } from '../../m1/game/core/state';
import type { Section, Adv } from '../adventure/section';
import type { GroundRun } from '../../m1/game/core/terrain';
import { sectionState as advSectionState, teleport, box, label, lay } from '../adventure/section';
import { SECTIONS, DOORS, prevOf, nextOf, type SpookyId } from './geometry';

export * from '../adventure/section';
export type { SpookyId } from './geometry';

type Ctx = CanvasRenderingContext2D;

/** A section of Spooky Land. */
export type SpookySection = Section<SpookyId>;
/** Spooky Land's own state (state.stage): which section he's in, each section's own state by its id. */
export type Spooky = Adv<SpookyId>;
export const getSpooky = (state: GameState) => state.stage as Spooky | null;
/** A section's own state, made the first time it's asked for. */
export const spookyState = <T>(state: GameState, id: SpookyId, make: () => T): T => advSectionState<T, SpookyId>(state, id, make);

// ---------------------------------------------------------------------------------------------------------------
// The crude placeholder ways between sections (each section's owner swaps theirs for the real thing: a door, the
// stairs, the drop, the geyser)

/** A way on (or back): walk into its stretch (world x0..x1, his feet between yTop and yBot) and he's put at `to`. */
export interface Exit { x0: number; x1: number; yTop: number; yBot: number; to: { x: number; y: number } }
/** The crude first pass's way on, at the section's right end (feet at DOORS[id].end.y there), and its way back, at its
 *  left end (on the ground), to the next and last sections' DOORS. */
export const endExits = (id: SpookyId): Exit[] => {
  const { x0, x1 } = SECTIONS[id], prev = prevOf(id), next = nextOf(id), out: Exit[] = [];
  if (next) out.push({ x0: x1 - 60, x1, yTop: DOORS[id].end.y - 40, yBot: DOORS[id].end.y + 2, to: DOORS[next].start });
  if (prev) out.push({ x0, x1: x0 + 60, yTop: DOORS[id].start.y - 40, yBot: DOORS[id].start.y + 2, to: DOORS[prev].end });
  return out;
};
/** Ground the section draws itself (laid as usual, its blocks hidden from the engine's own drawing). */
export const layOwn = (state: GameState, runs: GroundRun[]) => {
  const n = state.blocks.length;
  lay(state, runs);
  for (let i = n; i < state.blocks.length; i++) state.blocks[i].hidden = true;
};
/** Walls at the section's two ends (no walking off either of them), from far up to well under the ground. */
export const endWalls = (state: GameState, id: SpookyId) => {
  const { x0, x1 } = SECTIONS[id];
  state.blocks.push({ x: x0 - 40, y: -6000, w: 40, h: 8000, type: 'wall', hidden: true, tag: `${id}-start` });
  state.blocks.push({ x: x1, y: -6000, w: 40, h: 8000, type: 'wall', hidden: true, tag: `${id}-end` });
};
/** Through any exit he's in; true if he went through one. */
export const runExits = (state: GameState, exits: Exit[]) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  for (const e of exits) if (cx >= e.x0 && cx <= e.x1 && feet >= e.yTop && feet <= e.yBot) { teleport(state, e.to.x, e.to.y); return true; }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing, crude (Atari-2600 boxes; the real look comes in the final pass)

/** A sign on a post (or two): the board with its words on it, standing on the ground at (x, feetY). World space. */
export const postSign = (c: Ctx, x: number, feetY: number, text: string, board = '#2E1065', ink = '#BBF7D0', post = '#3F3F46') => {
  c.font = '8px "Press Start 2P"';
  const w = Math.max(60, c.measureText(text).width + 16), h = 22, top = feetY - 90;
  box(c, x - w / 2 + 6, top + h, 6, 90 - h, post);
  box(c, x + w / 2 - 12, top + h, 6, 90 - h, post);
  box(c, x - w / 2 - 2, top - 2, w + 4, h + 4, '#000000');
  box(c, x - w / 2, top, w, h, board);
  label(c, text, x, top + 15, ink, 8);
};
/** A sign on a wall (a plaque), its middle at (x, y). World space. */
export const wallSign = (c: Ctx, x: number, y: number, text: string, board = '#2E1065', ink = '#BBF7D0') => {
  c.font = '8px "Press Start 2P"';
  const w = Math.max(60, c.measureText(text).width + 16), h = 22;
  box(c, x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, '#000000');
  box(c, x - w / 2, y - h / 2, w, h, board);
  label(c, text, x, y + 4, ink, 8);
};
/** A doorway (crude), its feet at (x, feetY), with what it is over it. World space. */
export const doorway = (c: Ctx, x: number, feetY: number, text: string, frame = '#57534E', dark = '#09090B') => {
  box(c, x - 40, feetY - 140, 80, 140, frame);
  box(c, x - 30, feetY - 130, 60, 130, dark);
  wallSign(c, x, feetY - 160, text);
};
/** The flat crude ground of a run (a fill down from its top, the lit top lip on it: standable reads standable). */
export const groundBox = (c: Ctx, x0: number, x1: number, y: number, fill: string, lip: string) => {
  box(c, x0, y, x1 - x0, 400, fill);
  box(c, x0, y, x1 - x0, 4, lip);
};
/** A one-way ledge, crude: its body and its lit top lip. */
export const ledgeBox = (c: Ctx, x: number, y: number, w: number, fill: string, lip: string) => {
  box(c, x, y, w, 16, fill);
  box(c, x, y, w, 3, lip);
};
