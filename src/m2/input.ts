// Meathead 2's own buttons, on top of the engine's controls: the grabs (Y + B, Y + X, A + B on a pad; on the keyboard
// and mouse, wherever the options screen has them: R, T and Q to start with) and the menu buttons for the map
// (confirm/back, swapped on a Switch pad like every menu).

import { getActiveGamepad, isButtonPressed, GP_BUTTONS, menuButtons } from '../m1/game/platform/gamepad';
import { padFamily } from '../m1/game/platform/device';

/** The park map's button (SELECT): on a PlayStation pad the touchpad's click too (the browser's button 17), the user's;
 *  SHARE / CREATE still works. */
export const mapButton = (gp: Gamepad | null) =>
  isButtonPressed(gp, GP_BUTTONS.SELECT) || (padFamily() === 'playstation' && isButtonPressed(gp, 17));
import { keysFor, type KeyAction } from '../m1/game/platform/keys';

/** Keys held (KeyboardEvent.code, lowercase) and mouse buttons ('mouse0' ...), as the key bindings name them. */
const held = new Set<string>();
let attached = false;
export const attachM2Keys = () => {
  if (attached || typeof window === 'undefined') return;
  attached = true;
  window.addEventListener('keydown', e => held.add(e.code.toLowerCase()));
  window.addEventListener('keyup', e => held.delete(e.code.toLowerCase()));
  window.addEventListener('mousedown', e => held.add(`mouse${e.button}`));
  window.addEventListener('mouseup', e => held.delete(`mouse${e.button}`));
  window.addEventListener('blur', () => held.clear());
};

export interface M2Buttons {
  /** The pad's face buttons, by position. */
  a: boolean; b: boolean; x: boolean; y: boolean;
  /** The keyboard's grab keys. */
  beatKey: boolean; shakeKey: boolean; airKey: boolean;
  /** Menus: confirm, back. */
  ok: boolean; back: boolean;
}
const NONE: M2Buttons = { a: false, b: false, x: false, y: false, beatKey: false, shakeKey: false, airKey: false, ok: false, back: false };

let now: M2Buttons = NONE, was: M2Buttons = NONE, polledAt = -1;

/** Any of an action's keys (or mouse buttons) held right now. */
export const boundHeld = (a: KeyAction) => keysFor(a).some(c => held.has(c));

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
    beatKey: boundHeld('beatdown'), shakeKey: boundHeld('shakedown'), airKey: boundHeld('airGrab'),
    ok: (!!menu && p(menu.ok)) || k('enter') || k('space'),
    back: (!!menu && p(menu.back)) || k('escape') || k('backspace'),
  };
};
export const btn = (b: keyof M2Buttons) => now[b];
/** A key held right now (by its code, lowercase: 'keyf'). */
export const keyHeld = (code: string) => held.has(code);
export const pressed = (b: keyof M2Buttons) => now[b] && !was[b];
