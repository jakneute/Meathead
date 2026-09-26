// Hand-built stage layouts. A stage with a layout owns its level (terrain,
// enemies, hazards, set pieces, checkpoints) instead of getting the generic
// repeating one from level.ts. The boss door and arena stay where they are for
// every stage (BOSS_DOOR_X), so a long layout extends to the left of x = 0.

import type { GameState } from '../state';
import type { FrameContext } from '../context';
import type { Controls } from '../input';
import { artieLayout } from './artie';

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
  /** World space, behind everything that moves (scenery, the tram, the cabin). */
  drawBack?: (ctx: CanvasRenderingContext2D, state: GameState) => void;
  /** World space, in front of everything (window frames, the avalanche). */
  drawFront?: (ctx: CanvasRenderingContext2D, state: GameState) => void;
  /** Screen space, over the world (timers, the mid-boss health bar). */
  drawHud?: (ctx: CanvasRenderingContext2D, state: GameState) => void;
}

const LAYOUTS: Record<string, StageLayout> = {
  'Artie Avalanche': artieLayout,
};

export const getStageLayout = (stageId: string | null): StageLayout | undefined => (stageId ? LAYOUTS[stageId] : undefined);

/** Left edge of a stage's world (0 unless a layout extends it). */
export const getStageLeft = (stageId: string | null) => getStageLayout(stageId)?.left ?? 0;
