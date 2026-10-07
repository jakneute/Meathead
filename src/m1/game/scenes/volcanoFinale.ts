// Easter egg: with Victor Volcano at half health or less, jam boulders into all
// three of his vents before any of them blows. The whole volcano goes up:
//   1. outside: the volcano rumbles, then erupts
//   2. back in the arena: Victor starts "OH NO... WHAT HAVE YOU DONE, YOU-" and
//      a wall of magma surges up from below, launching both of them skyward
//   3. outside again: their charred bodies come flying out of the crater at the
//      screen one at a time, Turtles in Time style, and smash into it: the
//      screen cracks, cracks some more, and the camera's knocked askew; then
//      the death message spells out what you did
// Then you respawn outside his door (the boss checkpoint) and refight him.

import type { FrameContext } from '../core/context';
import { cancelSpeech } from '../platform/speech';
import { speakAsBoss } from '../bosses/shared';
import { VICTOR_LINES } from '../../content/dialogue';
import { respawn } from '../core/level';
import { CANVAS_HEIGHT } from '../../constants';
import { playGlassShatterSound } from '../platform/audio';

export const VOLCANO_FINALE = {
  ERUPT: 100,         // outside: rumbling until here, then it blows
  INSIDE: 170,        // cut back to the arena
  WAVE: 265,          // the magma wave cuts Victor off
  OUTSIDE: 330,       // cut outside again: the launch
  /** Each charred body flies out of the crater at the screen for this long. */
  FLY: 75,
  TEXT: 500,          // the death message starts spelling out (once both have hit the screen)
  TEXT_RATE: 2,
  END: 900,
};

export const VOLCANO_FINALE_MESSAGE =
  'YOU CORKED ALL THREE VENTS OF AN ACTIVE VOLCANO. THE PRESSURE HAD TO GO SOMEWHERE.\nIT TOOK YOU BOTH WITH IT.';

export const startVolcanoFinale = (ctx: FrameContext) => {
  const { state } = ctx;
  state.volcanoFinale = { t: 0, waveY: CANVAS_HEIGHT + 60 };
  state.projectiles = [];
  state.damageNumbers = [];
  state.player.vel = { x: 0, y: 0 };
  cancelSpeech();
  ctx.fx.playGunSound('rumble');
};

export const updateVolcanoFinale = (ctx: FrameContext) => {
  const { state, fx } = ctx;
  const f = state.volcanoFinale!;
  f.t++;
  const t = f.t;
  state.screenShakeTimer = 2;
  state.screenShakeMagnitude = t < VOLCANO_FINALE.ERUPT ? 2 + (t / VOLCANO_FINALE.ERUPT) * 6 : 10;
  if (t === VOLCANO_FINALE.ERUPT) fx.playGunSound('nuke');

  if (t === VOLCANO_FINALE.INSIDE + 10) {
    // Up over his head straight away (the voice follows when it can; the wave cuts both off)
    state.bossLastVulgarity = VICTOR_LINES.DOOMED;
    state.bossVulgarityTimer = 999;
    speakAsBoss('Victor Volcano', VICTOR_LINES.DOOMED, ctx.bossHelpers, 'urgent');
  }
  if (t === VOLCANO_FINALE.WAVE) {
    // Cut off mid-sentence
    cancelSpeech();
    state.bossVulgarityTimer = 0;
    fx.playGunSound('nuke');
  }
  if (t >= VOLCANO_FINALE.WAVE && t < VOLCANO_FINALE.OUTSIDE) {
    // The magma surges up and launches them both
    f.waveY -= 16;
    const top = state.camera.y + f.waveY;
    for (const body of [state.player, ...state.enemies.filter(e => e.type === 'boss')]) {
      if (body.pos.y + body.height > top - 10) body.pos.y = top - 10 - body.height - (t - VOLCANO_FINALE.WAVE) * 2;
    }
  }
  if (t === VOLCANO_FINALE.OUTSIDE) fx.playGunSound('nuke');
  // Each body smashing into the screen: the glass cracks
  if (t === VOLCANO_FINALE.OUTSIDE + VOLCANO_FINALE.FLY || t === VOLCANO_FINALE.OUTSIDE + 2 * VOLCANO_FINALE.FLY) {
    playGlassShatterSound();
    fx.playGunSound('crash');
  }
  if (t >= VOLCANO_FINALE.END) respawn(state, ctx.stageId, ctx.cheats.skipToBoss);
};
