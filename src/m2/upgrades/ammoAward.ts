// A MAX AMMO find picked up (the hidden exploration finds: SPEC.md, 5 in all, +10% ammo in every weapon each). One
// place for every land's: the find's kept for good in the save as one of the land's collectibles (store.ts
// markCollectibleFound: one id per find), the ammo find count goes up (state.ts setAmmoFinds: apply.ts raises every
// weapon's capacity and tops each up by the difference), the save's written there and then; and the YOU GOT card
// (AmmoGotCard.tsx, off ui.gotAmmo) with the explain screens' buffer: up AMMO_HOLD frames, then every button let go
// once, then a fresh press closes it (no mashing through it unread). The same shape as shardAward.ts / healthAward.ts.
//
// USE: if (awardAmmo(land, id)) card = openAmmoCard(); then every frame while it's up (the player held:
// p.inCutscene, no controls passed on): tickAmmoCard(card, state.frame) → true once it's closed. ammoWon(land, id):
// found before (don't put the pickup out again).

import { allFound, markCollectibleFound, setUi } from '../store';
import { saveProgress } from '../save';
import { ammoFinds, setAmmoFinds } from './state';
import { pollM2, btn, pressed } from '../input';
import { playSound } from '../../m1/game/platform/audio';

export const AMMO_HOLD = 90;

/** That find's been picked up on this save. */
export const ammoWon = (land: string, id: string) => !!allFound()[land]?.includes(id);

/** Gives it (once a save): false if it was found already. */
export const awardAmmo = (land: string, id: string): boolean => {
  if (ammoWon(land, id)) return false;
  markCollectibleFound(land, id);
  setAmmoFinds(ammoFinds() + 1);
  saveProgress();
  return true;
};

export interface AmmoCard { t: number; armed: boolean }
export const openAmmoCard = (): AmmoCard => {
  playSound('powerup', 0.8);
  setUi({ gotAmmo: { ready: false } });
  return { t: 0, armed: false };
};
export const closeAmmoCard = () => setUi({ gotAmmo: null });
/** A frame of it; true once a fresh press after the buffer has closed it. */
export const tickAmmoCard = (card: AmmoCard, frame: number): boolean => {
  pollM2(frame);
  card.t++;
  const held = btn('ok') || btn('back') || btn('a') || btn('b') || btn('x') || btn('y');
  if (!card.armed && card.t > AMMO_HOLD && !held) { card.armed = true; setUi({ gotAmmo: { ready: true } }); }
  if (card.armed && (pressed('ok') || pressed('back') || pressed('a') || pressed('b') || pressed('x') || pressed('y'))) { closeAmmoCard(); playSound('menuok', 0.6); return true; }
  return false;
};
