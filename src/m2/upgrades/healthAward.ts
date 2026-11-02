// A MAX HEALTH find picked up (the hidden exploration finds: SPEC.md, 5 in all, +10 max health each). One place for
// every land's: the find's kept for good in the save as one of the land's collectibles (store.ts markCollectibleFound:
// one id per find), the health find count goes up (state.ts setHealthFinds: apply.ts raises his max and tops him up by
// the difference), the save's written there and then; and the YOU GOT card (HealthGotCard.tsx, off ui.gotHealth) with
// the explain screens' buffer: up HEALTH_HOLD frames, then every button let go once, then a fresh press closes it (no
// mashing through it unread). The same shape as shardAward.ts.
//
// USE: if (awardHealth(land, id)) card = openHealthCard(); then every frame while it's up (the player held:
// p.inCutscene, no controls passed on): tickHealthCard(card, state.frame) → true once it's closed. healthWon(land, id):
// found before (don't put the pickup out again).

import { allFound, markCollectibleFound, setUi } from '../store';
import { saveProgress } from '../save';
import { healthFinds, setHealthFinds } from './state';
import { pollM2, btn, pressed } from '../input';
import { playSound } from '../../m1/game/platform/audio';

export const HEALTH_HOLD = 90;

/** That find's been picked up on this save. */
export const healthWon = (land: string, id: string) => !!allFound()[land]?.includes(id);

/** Gives it (once a save): false if it was found already. */
export const awardHealth = (land: string, id: string): boolean => {
  if (healthWon(land, id)) return false;
  markCollectibleFound(land, id);
  setHealthFinds(healthFinds() + 1);
  saveProgress();
  return true;
};

export interface HealthCard { t: number; armed: boolean }
export const openHealthCard = (): HealthCard => {
  playSound('powerup', 0.8);
  setUi({ gotHealth: { ready: false } });
  return { t: 0, armed: false };
};
export const closeHealthCard = () => setUi({ gotHealth: null });
/** A frame of it; true once a fresh press after the buffer has closed it. */
export const tickHealthCard = (card: HealthCard, frame: number): boolean => {
  pollM2(frame);
  card.t++;
  const held = btn('ok') || btn('back') || btn('a') || btn('b') || btn('x') || btn('y');
  if (!card.armed && card.t > HEALTH_HOLD && !held) { card.armed = true; setUi({ gotHealth: { ready: true } }); }
  if (card.armed && (pressed('ok') || pressed('back') || pressed('a') || pressed('b') || pressed('x') || pressed('y'))) { closeHealthCard(); playSound('menuok', 0.6); return true; }
  return false;
};
