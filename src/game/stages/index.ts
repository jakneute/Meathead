// Hand-built stage layouts. A stage with a layout owns its level (terrain,
// enemies, hazards, set pieces, checkpoints) instead of getting the generic
// repeating one from core/level.ts. The boss door and arena stay where they are for
// every stage (BOSS_DOOR_X), so a long layout extends to the left of x = 0.

import type { GameState } from '../core/state';
import type { FrameContext } from '../core/context';
import type { Controls } from '../platform/input';
import type { Enemy, Projectile } from '../../types';
import type { SceneLight } from '../render/lighting';
import { artieLayout } from './artie';
import { hectorLayout } from './hector';
import { victorLayout } from './victor';
import { ernieLayout } from './ernie';
import { daleLayout } from './dale';
import { barryLayout } from './barry';

export interface StageLayout {
  /** Left edge of the stage's world. */
  left: number;
  /** Where the stage starts (the intro crash lands a little right of this). */
  startX: number;
  /** The camera follows Meathead up and down (the stage isn't one flat floor). */
  verticalCamera: boolean;
  /**
   * Builds everything left of the boss door into `state`: terrain blocks (the
   * base walls, door and arena are already there), ground profile, enemies and
   * hazards. Returns where Meathead starts for `state.checkpoint`, if not the stage start.
   */
  build: (state: GameState, skipToBoss: boolean) => { x: number; y: number } | void;
  /**
   * Runs the stage's set pieces and hazards once per gameplay frame, before
   * Meathead moves. May replace the controls (cutscenes, the ski run).
   */
  update: (ctx: FrameContext, controls: Controls) => Controls;
  /**
   * A stage's own special enemy (a mid-boss) updates, gets hit and is drawn by
   * the stage instead of the generic enemy code. Return undefined for anything
   * that isn't one of yours.
   */
  updateSpecialEnemy?: (ctx: FrameContext, e: Enemy) => boolean | undefined;
  /** A player projectile hit it: return true if you handled it (the projectile's used up). */
  hitSpecialEnemy?: (ctx: FrameContext, e: Enemy, p: Projectile) => boolean | 'miss' | undefined;
  drawSpecialEnemy?: (ctx: CanvasRenderingContext2D, e: Enemy, state: GameState) => boolean;
  /** A special death message for how he died here (the avalanche), if any. */
  deathMessage?: (ctx: FrameContext) => string | undefined;
  /** World space, behind everything that moves (scenery, the tram, the cabin). */
  drawBack?: (ctx: CanvasRenderingContext2D, state: GameState) => void;
  /** World space, over the terrain but behind everything that moves (hazards, props). */
  drawMid?: (ctx: CanvasRenderingContext2D, state: GameState) => void;
  /** World space, in front of everything (window frames, the avalanche). */
  drawFront?: (ctx: CanvasRenderingContext2D, state: GameState) => void;
  /** Screen space, over the world (timers, the mid-boss health bar). */
  drawHud?: (ctx: CanvasRenderingContext2D, state: GameState) => void;
  /** Screen space: the stage draws its own sky and scenery (weather that changes as you go). Return false for the usual backdrop. */
  drawBackdrop?: (ctx: CanvasRenderingContext2D, state: GameState) => boolean;
  /** Screen space: the stage's own weather over the world. Return false for the usual. */
  drawBackdropFront?: (ctx: CanvasRenderingContext2D, state: GameState) => boolean;
  /** The world's wrapped round a rotating cylinder of this radius right now (the storm climb), or null. */
  cylinder?: (state: GameState) => { radius: number } | null;
  /**
   * Drawn over the wrapped cylinder, flat (things out in the air round it, not on its surface).
   * `around(x)` gives a world x's angle round the cylinder from the middle of the view (0 dead ahead, ±PI/2 the edges, beyond that round the back).
   */
  drawOverCylinder?: (ctx: CanvasRenderingContext2D, state: GameState, radius: number, around: (worldX: number) => number) => void;
  /** Push the camera in: by `scale`, about the world point (x, y) (which stays put on screen). Null for no zoom. */
  /** How it's lit where the camera is: how dark, what color the dark is, its lights (render/lighting.ts). Null: as drawn. */
  lighting?: (state: GameState) => SceneLight | null;
  zoom?: (state: GameState) => { scale: number; x: number; y: number; shiftX?: number; shiftY?: number } | null;
  /** Where you start when you go straight to the boss (or die to him), if not the usual spot just outside his door. */
  bossStartX?: number;
  /** Where on screen his feet sit when he's standing (default 550 of 600): higher to see more of what's below him. */
  cameraRow?: (state: GameState) => number | undefined;
  /** How quickly the vertical camera settles (default 0.2 a frame): lower is gentler, for a climb of lots of little ledges. */
  cameraEaseY?: (state: GameState) => number | undefined;
}

const LAYOUTS: Record<string, StageLayout> = {
  'Artie Avalanche': artieLayout,
  'Hector Hurricane': hectorLayout,
  'Victor Volcano': victorLayout,
  'Ernie Earthquake': ernieLayout,
  'Drug Trade Dale': daleLayout,
  'Blackout Barry': barryLayout,
};

export const getStageLayout = (stageId: string | null): StageLayout | undefined => (stageId ? LAYOUTS[stageId] : undefined);

/** Left edge of a stage's world (0 unless a layout extends it). */
export const getStageLeft = (stageId: string | null) => getStageLayout(stageId)?.left ?? 0;
