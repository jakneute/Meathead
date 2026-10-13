// The astronaut suit (Player.spaceSuit; drawn by the engine's player renderer: white over him, the fishbowl helmet).
//
// It counts as a clean pair of pants: putting it on puts his gut back to clean (what he had on before is kept on the
// hook, `before`). He can shit it (the gut system as ever: drawn stained, he stinks) and blow it out (gut stage 3:
// naked, just the helmet left on him, and the helmet's enough to live through the vacuum). Taken off (takeOffSuit:
// the crash back to Earth), the helmet and the suit go, and his pants go back to how they were before it went on.
//
// Kept across deaths (state.stageMemo): once it's been taken, he starts again in it (clean: a death clears the gut).

import type { GameState } from '../../../m1/game/core/state';

export const SUIT_MEMO = 'm2:needle:suit';

/** Into the suit: his pants as they were kept on it, his gut clean now (the suit's a clean pair). */
export const putOnSuit = (state: GameState) => {
  const p = state.player, g = p.gut;
  p.spaceSuit = { before: g ? { ...g, debris: undefined, globs: undefined, stains: undefined, pile: undefined } : undefined };
  p.gut = undefined;
  state.stageMemo[SUIT_MEMO] = '1';
};
/** Out of the suit (the crash back to Earth): the helmet and the suit gone, his pants back to how they were before it
 *  went on (shat in it, blown out of it: none of that carries over). Not worn again after a death from here on. */
export const takeOffSuit = (state: GameState) => {
  const p = state.player, s = p.spaceSuit;
  delete state.stageMemo[SUIT_MEMO];
  if (!s) return;
  p.spaceSuit = undefined;
  p.gut = s.before ? { ...s.before } : undefined;
};
/** Has he got the helmet on (the suit, or what's left of it after a blowout)? That's enough for the vacuum. */
export const wearingHelmet = (state: GameState) => !!state.player.spaceSuit;
/** Back in it after a death, if he'd taken it (the section's build). */
export const reapplySuit = (state: GameState) => {
  if (state.stageMemo[SUIT_MEMO] && !state.player.spaceSuit) state.player.spaceSuit = {};
};
