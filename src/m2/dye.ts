// Dyed (Meathead 2): a color over all of him for a while, fading back (Player.dyeColor / dyeTimer / dyeParts; the
// player's tint draws it everywhere). Shared by Foreign Lands' tannery vats (foreign/morocco) and Cartoon Land's ink
// (the studio's paint vat). Like paint: a second color mixes in (red and blue, purple); one of those two again, and
// it's just that one; a third color on top of two, and somehow it's all gone, he's himself again.

import type { Player } from '../m1/types';

/** How long a dye stays on him (15 s, its last 3 fading). */
export const DYE_FRAMES = 900;

/** Two dyes mixed like paint: each channel the geometric mean (blue and yellow, olive green; red and yellow, orange). */
export const mixDye = (a: string, b: string) => {
  const rgb = (h: string) => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const A = rgb(a), B = rgb(b);
  return '#' + A.map((v, i) => Math.round(Math.sqrt(v * B[i])).toString(16).padStart(2, '0')).join('');
};

/** Dips him in `col`: what it did ('dyed' fresh, 'mixed' a second color in, 'undyed' a third cancelled it all,
 *  'same' just topped it up / back to one of the two). */
export const dipDye = (p: Player, col: string): 'dyed' | 'mixed' | 'undyed' | 'same' => {
  const parts = p.dyeTimer && p.dyeTimer > 0 ? (p.dyeParts ?? []) : [];
  const set = (next: string[]) => { p.dyeParts = next; p.dyeColor = next.length === 2 ? mixDye(next[0], next[1]) : next[0]; p.dyeTimer = next.length ? DYE_FRAMES : 0; };
  if (parts.length === 2 && !parts.includes(col)) { set([]); return 'undyed'; }
  if (parts.length === 2) { set([col]); return 'same'; }
  if (parts.length === 1 && parts[0] !== col) { set([parts[0], col]); return 'mixed'; }
  set([col]);
  return parts.length ? 'same' : 'dyed';
};
