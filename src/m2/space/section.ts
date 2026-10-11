// Space Land's sections: Adventure Land's Section (adventure/section.ts), with Space Land's ids, and the bits every
// Space section uses. Everything in adventure/section.ts (lay, solid, ledge, teleport, hands, meatheadSays, speak,
// saidOver, box, label...) works here as it is: import it from here or from there.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally, and must re-read it before editing.

import type { GameState } from '../../m1/game/core/state';
import type { Section, Adv } from '../adventure/section';
import type { GroundRun } from '../../m1/game/core/terrain';
import { sectionState as advSectionState, teleport, box, label, lay } from '../adventure/section';
import { SECTIONS, DOORS, prevOf, nextOf, type SpaceId } from './geometry';
import { drawTodSky } from '../timeOfDay';

export * from '../adventure/section';
export type { SpaceId } from './geometry';

type Ctx = CanvasRenderingContext2D;

/**
 * Free flight (the orbit's space shooter: Cuphead's plane levels): he moves freely in all four directions, faces
 * right only, and has only the ray gun, firing rapid. RESERVED for the shooter's owner (orbit/): the stage
 * (index.ts) only reads it and does the bookkeeping round it (no weapon switching, no specials while it's on: see
 * index.ts); the flying itself (no gravity, the movement, the facing, the rapid fire) is the orbit section's (and any
 * engine hook it needs). Extend this as it needs.
 */
export interface Flight {
  /** The ray gun fires rapid (space's dumb reason why: the orbit section's lines). */
  rapidFire?: boolean;
}

/** A section of Space Land: Adventure Land's Section, plus Space Land's own hooks. */
export interface SpaceSection extends Section<SpaceId> {
  /** Free flight here (and how), or null/left out: on foot. Read every frame. Controls pass through as always: the
   *  stage hands this section's update the player's raw controls, and what it returns is what the engine gets. */
  flight?: (state: GameState) => Flight | null;
}
/** Space Land's own state (state.stage): which section he's in, each section's own state by its id. */
export interface Space extends Adv<SpaceId> {
  /** Free flight this frame (the section's flight(), as the stage last read it), or null: on foot. */
  flight?: Flight | null;
}
export const getSpace = (state: GameState) => state.stage as Space | null;
/** A section's own state, made the first time it's asked for. */
/** Free flight this frame (the orbit's shooter), or null: on foot. For anything outside the section that needs to know. */
export const spaceFlight = (state: GameState): Flight | null => getSpace(state)?.flight ?? null;
export const spaceState = <T>(state: GameState, id: SpaceId, make: () => T): T => advSectionState<T, SpaceId>(state, id, make);

// ---------------------------------------------------------------------------------------------------------------
// The crude placeholder ways between sections (each section's owner swaps theirs for the real thing: the atom's
// doors, the train, the launch, the needle's lift, the crash)

/** A way on (or back): walk into its stretch (world x0..x1, his feet between yTop and yBot) and he's put at `to`. */
export interface Exit { x0: number; x1: number; yTop: number; yBot: number; to: { x: number; y: number } }
/** The crude first pass's way on, at the section's right end (feet at DOORS[id].end.y there), and its way back, at its
 *  left end (on the ground), to the next and last sections' DOORS. */
export const endExits = (id: SpaceId): Exit[] => {
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
export const endWalls = (state: GameState, id: SpaceId) => {
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
export const postSign = (c: Ctx, x: number, feetY: number, text: string, board = '#312E81', ink = '#E0E7FF', post = '#3F3F46') => {
  c.font = '8px "Press Start 2P"';
  const w = Math.max(60, c.measureText(text).width + 16), h = 22, top = feetY - 90;
  box(c, x - w / 2 + 6, top + h, 6, 90 - h, post);
  box(c, x + w / 2 - 12, top + h, 6, 90 - h, post);
  box(c, x - w / 2 - 2, top - 2, w + 4, h + 4, '#000000');
  box(c, x - w / 2, top, w, h, board);
  label(c, text, x, top + 15, ink, 8);
};
/** A sign on a wall (a plaque), its middle at (x, y). World space. */
export const wallSign = (c: Ctx, x: number, y: number, text: string, board = '#312E81', ink = '#E0E7FF') => {
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

// ---------------------------------------------------------------------------------------------------------------
// The skeleton's placeholders (each section's owner replaces theirs)

/** Screen space: a placeholder backdrop. Outdoors, a banded sky by the hour (timeOfDay.ts) over a far skyline of
 *  flat boxes; indoors (or out in space), a flat color with a band of `far` along the bottom. */
export const placeholderBackdrop = (c: Ctx, state: GameState, opts: { sky?: string[]; flat?: string; far: string; stars?: boolean }) => {
  const W = 800, H = 600;
  if (opts.sky) drawTodSky(c, 0, 0, W, H, opts.sky, { horizon: 430, sun: [620, 120], moon: [160, 90] });
  else { c.fillStyle = opts.flat ?? '#0B0B1E'; c.fillRect(0, 0, W, H); }
  if (opts.stars) for (let i = 0; i < 120; i++) { const sx = ((i * 137.5 - state.camera.x * 0.05) % W + W) % W, sy = (i * 71.3) % 420; box(c, sx, sy, 2, 2, i % 5 ? '#94A3B8' : '#F8FAFC'); }
  // (a far skyline: flat boxes, scrolling slow)
  const off = -((state.camera.x * 0.2) % 160);
  for (let x = off - 160, k = 0; x < W + 160; x += 160, k++) { const h = 60 + ((k * 37 + Math.floor(state.camera.x / 800)) % 5) * 22; box(c, x, 430 - h, 120, h + 170, opts.far); }
  return true;
};
