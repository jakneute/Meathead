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
