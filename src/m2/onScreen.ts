// The world's own sounds (machines, fires, rides, critters, hazards cycling) are heard by how far they are from the
// screen. The owner (2026-11-02): "when entering ben's lair in spooky land, i can hear the oven running. make sure
// environmental sounds don't initiate if they aren't on screen" — then: "just in general actually. if you are far
// enough away. this is an example". The old gates were horizontal distance only (`Math.abs(cx - x) < 900`), so a stove
// a floor down, or a room over, still rang. Now: full on screen, fading out over FADE px past the screen's edge (true
// 2D: a floor up or down is as far as a room over), silent beyond.
//
// The screen: the view as last drawn (state.view: a section's zoom taken in), else the camera's 800x600.
// Not for his own doings, things hitting him, scripted cues, PAs, warnings meant to come from off screen, or music.

import type { GameState } from '../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../m1/constants';
import { playSound } from '../m1/game/platform/audio';
import type { SoundType } from '../m1/types';

/** How far past the screen's edge a world sound fades out to nothing. */
export const FADE = 320;

/** How far (px) the box (world space) lies outside the screen: 0 when any of it's on screen. Cheap: a few compares. */
export const offScreenBy = (state: GameState, x: number, y: number, w = 0, h = 0): number => {
  const v = state.view;
  const vx = v ? v.x : state.camera.x, vy = v ? v.y : state.camera.y;
  const vw = v ? v.w : CANVAS_WIDTH, vh = v ? v.h : CANVAS_HEIGHT;
  const dx = x + w < vx ? vx - (x + w) : x > vx + vw ? x - (vx + vw) : 0;
  const dy = y + h < vy ? vy - (y + h) : y > vy + vh ? y - (vy + vh) : 0;
  return dx && dy ? Math.hypot(dx, dy) : dx + dy;
};

/** The box overlaps the screen (`margin` px of slack each side). */
export const onScreen = (state: GameState, x: number, y: number, w = 0, h = 0, margin = 0): boolean =>
  offScreenBy(state, x, y, w, h) <= margin;

/** 1 on screen, down to 0 at FADE px past the edge. */
export const heardAt = (state: GameState, x: number, y: number, w = 0, h = 0, fade = FADE): number => {
  const d = offScreenBy(state, x, y, w, h);
  return d <= 0 ? 1 : d >= fade ? 0 : 1 - d / fade;
};

/** The screen's middle height: for a thing with no height given (a flat stretch: only how far off to the side counts). */
export const midY = (state: GameState) => (state.view ? state.view.y + state.view.h / 2 : state.camera.y + CANVAS_HEIGHT / 2);

/** A sound from a thing in the world (its box; `y` left out: level with the screen): played at the volume its distance
 *  from the screen leaves; nothing when it's too far off. True if it played. */
export const worldSound = (state: GameState, type: SoundType, vol: number, pitch: number, x: number, y?: number, w = 0, h = 0): boolean => {
  const k = heardAt(state, x, y ?? midY(state), w, y === undefined ? 0 : h);
  if (k <= 0.02) return false;
  playSound(type, vol * k, pitch);
  return true;
};
