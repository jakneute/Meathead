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
/** One of them, drawn where they stand. */
export const drawGuest = (c: CanvasRenderingContext2D, g: Guest, f: number) => {
  c.save();
  c.translate(Math.round(g.x), Math.round(g.y));
  c.scale(g.scale * g.facing, g.scale);
  g.who.draw(c, f + g.seed, !!g.said);
  c.restore();
};

/**
 * A crowd of them dimmed (behind a fence, behind glass): `dim` how dark (0..1), `tint` what with. All drawn onto one
 * layer and darkened together, then put down in one go (a canvas filter per person is ruinously slow).
 */
let layer: HTMLCanvasElement | null = null;
export const drawGuestsDimmed = (c: CanvasRenderingContext2D, gs: Guest[], f: number, dim: number, tint = '0, 0, 0') => {
  if (!gs.length) return;
  const W = c.canvas.width, H = c.canvas.height;
  layer ??= document.createElement('canvas');
  if (layer.width !== W || layer.height !== H) { layer.width = W; layer.height = H; }
  const l = layer.getContext('2d')!;
  l.setTransform(1, 0, 0, 1, 0, 0); l.clearRect(0, 0, W, H);
  l.imageSmoothingEnabled = c.imageSmoothingEnabled;
  l.setTransform(c.getTransform());
  for (const g of gs) drawGuest(l, g, f);
  l.setTransform(1, 0, 0, 1, 0, 0);
  l.globalCompositeOperation = 'source-atop'; l.fillStyle = `rgba(${tint}, ${dim})`; l.fillRect(0, 0, W, H); l.globalCompositeOperation = 'source-over';
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(layer, 0, 0); c.restore();
};
