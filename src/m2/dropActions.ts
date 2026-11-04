// Whatever Meathead had going with his buttons, called off (the owner, after the plunge: "when ending the minigame, he
// fired the spellbook of the damned ... be sure to clean that up, the input mechanisms for that" and "any action you
// may have initiated at the start of the minigame gets eaten if you start it").
//
// A minigame (minigamePause.ts: minigameTakeover, the session) calls it the moment it takes him over and again the
// moment it hands him back. Every weapon's own held state goes through here, and the player's:
//   - the spellbook's reading (its wind-up: the storm would come under the minigame), its rifts still to come, the
//     bulk-up's pose; the mana a called-off one took comes back
//   - the flintlock's bead (it fires on fire's release, and losing the buttons reads as a release)
//   - the mallet's swing / spin / wind-up / smash and its fire and secondary holds
//   - the soul sucker's pull, its bleed, its spray
//   - the engine's edges (fire, jump, special held last frame), the jump buffer, a charge move under way
// Not the things already out in the world (shots in flight, a bulk that's on, burning, the gore in the bag).
//
// A NEW WEAPON with a hold, a charge, a wind-up or a release-to-fire: give it a drop<Name>Held and call it below.

import type { GameState } from '../m1/game/core/state';
import { dropSpellbookHeld } from './weapons/spellbook';
import { dropFlintlockHeld } from './weapons/flintlock';
import { dropMalletHeld } from './weapons/mallet';
import { dropSoulSuckerHeld } from './weapons/soulSucker';

export const dropPlayerActions = (state: GameState) => {
  const p = state.player;
  dropSpellbookHeld(p);
  dropFlintlockHeld();
  dropMalletHeld(p);
  dropSoulSuckerHeld();
  p.shootHeldLastFrame = false; p.jumpHeldLastFrame = false; p.specialHeldLastFrame = false;
  p.jumpBufferTimer = 0;
  // (a charge move under way: stopped where he is, no lock left over)
  if (p.isCharging || p.isSliding || p.isUppercutting || p.isDivekicking) {
    p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false;
    p.chargeTimer = 0; p.uppercutTimer = 0; p.recoiling = false; p.slideRecoil = false; p.lockTimer = 0;
    p.powerLocked = false; p.flashKick = false;
  }
};
