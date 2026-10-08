// Shields, as Meathead 2's weapons have them. Most of what he's got doesn't care: it goes over, round or through. What a
// shield does stop is a thing thrown or shot straight at its face: the ray gun's bolts (the engine's shield block), the souvenir
// launcher's junk and the crossbow's darts, coming
// at it from the side it's held to (dropped on him from above, they're over it and into him). The mallet's blows from
// in front (the swings, the tornado, the launch) land on the shield, not him: he's sent flying all the same, but takes
// nothing from the blow itself (only from whatever he hits on the way); its overhead blows (the smash down from the
// air, the pancake smash) come down over it and hurt. Somebody else's puke goes straight past it.

import type { Enemy } from '../../m1/types';
import type { GameState } from '../../m1/game/core/state';
import { shieldFacing } from '../../m1/game/enemies/kinds';
import { playSound } from '../../m1/game/platform/audio';

/** His shield's up. */
export const shielded = (e: Enemy) => e.enemyType === 'shield' && !!e.isShieldActive;

/** A thing flying at him (its box and how it's going): does his shield stop it? From in front, yes; from overhead, no. */
export const shieldStops = (e: Enemy, p: { pos: { x: number; y: number }; vel: { x: number; y: number }; width: number; height: number }) => {
  if (!shielded(e)) return false;
  const left = shieldFacing(e) < 0;
  const front = left ? p.vel.x > 0 && p.pos.x < e.pos.x + e.width / 2 : p.vel.x < 0 && p.pos.x + p.width > e.pos.x + e.width / 2;
  // (overhead: coming down onto him, from above his head a moment ago; not just dropping a little on its way at his chest)
  const overhead = p.vel.y > 1 && p.pos.y + p.height - p.vel.y * 2 <= e.pos.y + 10;
  return front && !overhead;
};

/** A blow from Meathead's side, going `dir`: is it his shield it lands on? (He's facing Meathead with it.) */
export const shieldTakesBlow = (e: Enemy, dir: number) => shielded(e) && shieldFacing(e) === -Math.sign(dir || 1);

/** The clang off it: sparks off the face of it. */
export const clang = (state: GameState, e: Enemy, y: number) => {
  const x = shieldFacing(e) < 0 ? e.pos.x : e.pos.x + e.width, out = shieldFacing(e);
  playSound('clang', 0.6, 4);
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x, y }, vel: { x: out * (1 + Math.random() * 3), y: (Math.random() - 0.7) * 4 }, life: 10, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 2 });
};
