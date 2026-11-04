// Every minigame asks first (the owner: "all minigames before starting has a sub-menu to press A to accept and B to go
// back to ensure the player wants to try it"). A little box: the game's name, a line on it, ACCEPT and BACK on the
// real menu buttons (pad or keys, live: a Switch pad's confirm/back swapped like every menu; Enter / Esc on the keys),
// drawn by MinigameAsk.tsx off ui.minigameAsk.
//
// Like the explain screens (no mashing through), it takes no answer for ASK_HOLD frames and not till every button's
// been let go once; only then does a fresh press of confirm or back count.
//
// USE: const ask = openAsk('TEST YOUR PLUNGE?', 'PLUNGE THE CLOG...'); then every frame while it's up (the player held:
// p.inCutscene, no controls passed on) tickAsk(ask, state.frame) → 'wait' | 'accept' | 'back'. On an answer the box
// is taken down; closeAsk() takes it down any other way (a death, leaving).

import { pollM2, btn, pressed } from './input';
import { setUi } from './store';
import { playSound } from '../m1/game/platform/audio';
import { minigameTakeover } from './minigamePause';

export const ASK_HOLD = 40;
export interface Ask { title: string; text: string; t: number; armed: boolean }

export const openAsk = (title: string, text: string): Ask => {
  // (him taken over: whatever he had going called off, and his buttons held off as he's let go: minigamePause.ts)
  minigameTakeover();
  playSound('menuok', 0.5);
  setUi({ minigameAsk: { title, text, ready: false } });
  return { title, text, t: 0, armed: false };
};
export const closeAsk = () => setUi({ minigameAsk: null });

export const tickAsk = (ask: Ask, frame: number): 'wait' | 'accept' | 'back' => {
  pollM2(frame);
  ask.t++;
  const held = btn('ok') || btn('back') || btn('a') || btn('b') || btn('x') || btn('y');
  if (!ask.armed && ask.t > ASK_HOLD && !held) ask.armed = true;
  if (ask.armed && pressed('ok')) { closeAsk(); playSound('menuok', 0.7); return 'accept'; }
  if (ask.armed && pressed('back')) { closeAsk(); playSound('menuback', 0.7); return 'back'; }
  setUi({ minigameAsk: { title: ask.title, text: ask.text, ready: ask.armed } });
  return 'wait';
};
