// People out for the day (the cast: ../../cast/people.ts), for standing in a line or behind glass: who's who by a
// seed, a woman's voice or a man's, drawn where they stand. Shared by the queue and the river's dinosaur tank.

import { CAST, type CastMember } from '../../cast/people';

const GUESTS = ['jenny', 'matt', 'bev', 'gus', 'anna', 'sid', 'lucille', 'ed', 'tiffanie', 'glenn', 'stella', 'larry', 'chuck', 'susan', 'gary', 'lilly', 'jj', 'charlotte'];
const WOMEN = new Set(['jenny', 'bev', 'anna', 'lucille', 'tiffanie', 'stella', 'susan', 'lilly', 'charlotte', 'billie', 'ruth']);

export interface Guest { who: CastMember; woman: boolean; voice: string; x: number; y: number; facing: 1 | -1; scale: number; seed: number; said: string | null }
export const guestAt = (i: number, x: number, y: number, facing: 1 | -1 = 1, scale = 1): Guest => {
  const id = GUESTS[(i * 7) % GUESTS.length];
  const who = CAST.find(m => m.id === id) ?? CAST[0];
  const woman = WOMEN.has(id);
  return { who, woman, voice: woman ? 'm2.guest' : 'm2.guest2', x, y, facing, scale, seed: i * 37, said: null };
};
/** `filter`: dimmed (behind a fence, behind glass), e.g. 'brightness(0.6)'. */
export const drawGuest = (c: CanvasRenderingContext2D, g: Guest, f: number, filter?: string) => {
  c.save();
  if (filter) c.filter = filter;
  c.translate(Math.round(g.x), Math.round(g.y));
  c.scale(g.scale * g.facing, g.scale);
  g.who.draw(c, f + g.seed, !!g.said);
  c.restore();
};
