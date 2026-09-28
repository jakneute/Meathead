// Hand-built stage layouts. A stage with a layout owns its level (terrain,
// enemies, hazards, set pieces, checkpoints) instead of getting the generic
// repeating one from level.ts. The boss door and arena stay where they are for
// every stage (BOSS_DOOR_X), so a long layout extends to the left of x = 0.

import type { GameState } from '../state';
import type { FrameContext } from '../context';
import type { Controls } from '../input';
import type { Enemy, Projectile } from '../../types';
import { artieLayout } from './artie';
import { hectorLayout } from './hector';

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
}

const LAYOUTS: Record<string, StageLayout> = {
  'Artie Avalanche': artieLayout,
  'Hector Hurricane': hectorLayout,
};

export const getStageLayout = (stageId: string | null): StageLayout | undefined => (stageId ? LAYOUTS[stageId] : undefined);

/** Left edge of a stage's world (0 unless a layout extends it). */
export const getStageLeft = (stageId: string | null) => getStageLayout(stageId)?.left ?? 0;
