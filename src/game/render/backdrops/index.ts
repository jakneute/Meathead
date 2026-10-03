// Stage backdrops: layered parallax scenery behind the level, plus weather in
// front of it. Each stage lists its layers back to front; live effects (aurora,
// eruptions, lightning, blackouts...) can sit between them.

import { G, LayerSpec, blitLayer } from './core';
import { STAGE_BACKDROPS } from './stages';

export interface View { camX: number; camY: number; frame: number; /** How much of the place is burning (0..1: a stage's own say, for its backdrop's fires). */ burn?: number }

/** A live (redrawn every frame) effect between layers, in screen space. */
export type Live = (ctx: G, view: View) => void;

export interface Backdrop {
  /** Back to front: tiled parallax layers and live effects. */
  layers: (LayerSpec | Live)[];
  /** Weather and haze drawn over the world (in screen space). */
  front?: Live;
}

/** Draws the stage's backdrop across the screen. Returns false if the stage has none. */
export const drawBackdrop = (ctx: G, stageId: string | null, camX: number, camY: number, frame: number, burn = 0): boolean => {
  const bd = stageId ? STAGE_BACKDROPS[stageId] : undefined;
  if (!bd) return false;
  const view = { camX, camY, frame, burn };
  for (const l of bd.layers) {
    if (typeof l === 'function') { ctx.save(); l(ctx, view); ctx.restore(); }
    else blitLayer(ctx, l, camX, camY, frame);
  }
  return true;
};

/** Weather and haze in front of the world. */
export const drawBackdropFront = (ctx: G, stageId: string | null, camX: number, camY: number, frame: number) => {
  const bd = stageId ? STAGE_BACKDROPS[stageId] : undefined;
  if (!bd?.front) return;
  ctx.save();
  bd.front(ctx, { camX, camY, frame });
  ctx.restore();
};

