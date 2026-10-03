import { Rect } from '../../types';
import { FINALE_STAGE } from '../../constants';

export const pickRandom = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

export const rectsOverlap = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** Bounding box of anything with a position and size. */
export const boundsOf = (e: { pos: { x: number, y: number }, width: number, height: number }): Rect =>
  ({ x: e.pos.x, y: e.pos.y, w: e.width, h: e.height });

export const centerOf = (e: { pos: { x: number, y: number }, width: number, height: number }) =>
  ({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 });

/**
 * Is any of this on screen (the camera's view, give or take `margin`)? Stray bullets
 * and hazards only hurt things you can see: nothing dies off screen where you'd never know.
 */
export const isOnScreen = (camera: { x: number; y: number; w?: number; h?: number }, r: { pos: { x: number; y: number }; width: number; height: number }, margin = 10) =>
  r.pos.x + r.width > camera.x - margin && r.pos.x < camera.x + (camera.w ?? 800) + margin && r.pos.y + r.height > camera.y - margin && r.pos.y < camera.y + (camera.h ?? 600) + margin;

/**
 * What of the world counts as on the screen, for the game's rules (what a stray shot can hit, what's knocked out of
 * bounds): the camera's 800x600, or, in the finale (the press room, the view pulled right back to take in all of it),
 * all of what's drawn.
 */
export const screenRect = (state: { camera: { x: number; y: number }; view?: { x: number; y: number; w: number; h: number }; stageId: string | null }) =>
  state.stageId === FINALE_STAGE && state.view ? state.view : { x: state.camera.x, y: state.camera.y, w: 800, h: 600 };
