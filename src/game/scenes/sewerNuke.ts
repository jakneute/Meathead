// Easter egg: coat Toxic Tommy in crude oil, then hit him with the flamethrower.
// A sewer full of methane, an oil-soaked toxic waste monster and an open flame
// go up in a contained nuclear explosion that kills them both. It plays out as
// the death screen: the blast from inside the sewer, then from the street above,
// while the death message spells out what you just did. Then you refight him.

import { Enemy } from '../../types';
import type { FrameContext } from '../core/context';
import { cancelSpeech, say, MEATHEAD_VOICE } from '../platform/speech';

export const TOXIC_TOMMY = 'Toxic Tommy';

/** Frame timeline (counted from the moment he ignites). */
export const SEWER_NUKE = {
  FRAMES: 660,        // the whole death screen
  WHITEOUT: 110,      // inside view fades to white from here...
  OUTSIDE: 160,       // ...and cuts to the street above here
  ERUPT: 185,         // the fireball bursts out of the manhole
  TEXT: 270,          // the message starts spelling out
  TEXT_RATE: 2,       // frames per letter
};

export const SEWER_NUKE_MESSAGE =
  'YOU SET FIRE TO AN OIL-SOAKED TOXIC WASTE MONSTER IN A METHANE-FILLED SEWER.\nYOU BOTH DIED.';

/** How many frames into the blast we are. */
export const sewerNukeFrame = (deathTimer: number) => SEWER_NUKE.FRAMES - deathTimer;

export const detonateSewerNuke = (ctx: FrameContext, tommy: Enemy) => {
  const { state, fx } = ctx;
  state.sewerNuke = { x: tommy.pos.x + tommy.width / 2, y: tommy.pos.y + tommy.height / 2 };
  tommy.isOiled = false;
  tommy.health = 0; // vaporised (no weakness kill, no victory)
  state.player.health = 0;
  state.deathTimer = SEWER_NUKE.FRAMES;
  state.deathString = SEWER_NUKE_MESSAGE;
  state.damageNumbers = [];
  state.projectiles = [];
  state.flameSegments = [];
  state.screenShakeTimer = 60;
  state.screenShakeMagnitude = 14;
  cancelSpeech();
  say('OH SHI-', MEATHEAD_VOICE, 'urgent', { onShow: () => {}, onHide: () => {} });
  fx.playGunSound('nuke');
};

/** Runs during the death screen: the rumble and the second boom when it bursts out of the street. */
export const updateSewerNuke = (ctx: FrameContext) => {
  const { state, fx } = ctx;
  const t = sewerNukeFrame(state.deathTimer);
  if (t === SEWER_NUKE.ERUPT) {
    fx.playGunSound('nuke');
    state.screenShakeTimer = 90;
    state.screenShakeMagnitude = 10;
  }
  if (t === SEWER_NUKE.ERUPT + 40) fx.playGunSound('tsunami');
};
