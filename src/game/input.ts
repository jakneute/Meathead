import { getActiveGamepad, getGamepadMovement, isButtonPressed, GP_BUTTONS } from './gamepad';

/** What the player is asking for this frame, from keyboard, mouse and gamepad combined. */
export interface Controls {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  special: boolean;
  shoot: boolean;
}

export const NO_CONTROLS: Controls = { left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false };

/** Tracks held keys (by both `key` and `code`, lower-cased) and the mouse button. */
export class KeyboardMouseState {
  private keys: Record<string, boolean> = {};
  mouseDown = false;

  isDown = (...names: string[]) => names.some(n => this.keys[n]);

  attach(target: Window) {
    const onKeyDown = (e: KeyboardEvent) => { this.keys[e.key.toLowerCase()] = true; this.keys[e.code.toLowerCase()] = true; };
    const onKeyUp = (e: KeyboardEvent) => { this.keys[e.key.toLowerCase()] = false; this.keys[e.code.toLowerCase()] = false; };
    const onMouseDown = () => { this.mouseDown = true; };
    const onMouseUp = () => { this.mouseDown = false; };
    target.addEventListener('keydown', onKeyDown);
    target.addEventListener('keyup', onKeyUp);
    target.addEventListener('mousedown', onMouseDown);
    target.addEventListener('mouseup', onMouseUp);
    return () => {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
      target.removeEventListener('mousedown', onMouseDown);
      target.removeEventListener('mouseup', onMouseUp);
    };
  }
}

export const readControls = (kb: KeyboardMouseState): Controls => {
  const gp = getActiveGamepad();
  let padX = 0, padY = 0, padJump = false, padSpecial = false, padShoot = false;
  if (gp) {
    const move = getGamepadMovement(gp, 0.2);
    padX = move.x;
    padY = move.y;
    // D-pad up aims/uppercuts; only A jumps. LB/RB are reserved for weapon swapping (handled in App).
    padJump = isButtonPressed(gp, GP_BUTTONS.A);
    padShoot = isButtonPressed(gp, GP_BUTTONS.X) || isButtonPressed(gp, GP_BUTTONS.Y) || isButtonPressed(gp, GP_BUTTONS.RT);
    padSpecial = isButtonPressed(gp, GP_BUTTONS.B) || isButtonPressed(gp, GP_BUTTONS.LT);
  }

  const k = kb.isDown;
  // One-key specials for keyboard players: R uppercuts (up + special), G is down + special
  // (a dive kick in the air, a slide tackle on the ground)
  const uppercutKey = k('r', 'keyr');
  const diveKey = k('g', 'keyg');
  return {
    left: k('a', 'arrowleft', 'keya') || padX < -0.3,
    right: k('d', 'arrowright', 'keyd') || padX > 0.3,
    down: k('s', 'arrowdown', 'keys') || diveKey || padY > 0.3,
    up: k('w', 'arrowup', 'keyw') || uppercutKey || padY < -0.4,
    jump: k(' ', 'space', 'z', 'keyz', 'j', 'keyj') || padJump,
    special: k('shift', 'shiftleft', 'shiftright', 'c', 'keyc') || uppercutKey || diveKey || padSpecial,
    shoot: kb.mouseDown || padShoot || k('f', 'keyf', 'x', 'keyx', 'k', 'keyk'),
  };
};
