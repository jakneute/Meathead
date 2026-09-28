import { Rect } from '../types';

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
export const isOnScreen = (camera: { x: number; y: number }, r: { pos: { x: number; y: number }; width: number; height: number }, margin = 10) =>
  r.pos.x + r.width > camera.x - margin && r.pos.x < camera.x + 800 + margin && r.pos.y + r.height > camera.y - margin && r.pos.y < camera.y + 600 + margin;
