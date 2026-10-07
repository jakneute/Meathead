// Meathead 2's own buttons, on top of the engine's controls: the grabs (Y + B, Y + X on a pad; R and T on the
// keyboard) and the menu buttons for the map (confirm/back, swapped on a Switch pad like every menu).

import { getActiveGamepad, isButtonPressed, GP_BUTTONS, menuButtons } from '../m1/game/platform/gamepad';

const held = new Set<string>();
let attached = false;
export const attachM2Keys = () => {
  if (attached || typeof window === 'undefined') return;
  attached = true;
  window.addEventListener('keydown', e => held.add(e.code.toLowerCase()));
  window.addEventListener('keyup', e => held.delete(e.code.toLowerCase()));
  window.addEventListener('blur', () => held.clear());
};

export interface M2Buttons {
  /** The pad's face buttons, by position. */
  a: boolean; b: boolean; x: boolean; y: boolean;
  /** The keyboard's grab keys. */
  beatKey: boolean; shakeKey: boolean;
  /** Menus: confirm, back. */
  ok: boolean; back: boolean;
}
const NONE: M2Buttons = { a: false, b: false, x: false, y: false, beatKey: false, shakeKey: false, ok: false, back: false };

let now: M2Buttons = NONE, was: M2Buttons = NONE, polledAt = -1;

/** Read once a frame (whoever asks first that frame reads them). */
export const pollM2 = (frame: number) => {
  if (frame === polledAt) return;
  polledAt = frame;
  was = now;
  const gp = getActiveGamepad();
  const p = (i: number) => !!gp && isButtonPressed(gp, i);
  const menu = gp ? menuButtons(gp) : null;
  const k = (c: string) => held.has(c);
  now = {
    a: p(GP_BUTTONS.A), b: p(GP_BUTTONS.B), x: p(GP_BUTTONS.X), y: p(GP_BUTTONS.Y),
    beatKey: k('keyr'), shakeKey: k('keyt'),
    ok: (!!menu && p(menu.ok)) || k('enter') || k('space'),
    back: (!!menu && p(menu.back)) || k('escape') || k('backspace'),
  };
};
export const btn = (b: keyof M2Buttons) => now[b];
export const pressed = (b: keyof M2Buttons) => now[b] && !was[b];
