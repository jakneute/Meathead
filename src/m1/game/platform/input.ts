import { getActiveGamepad, getGamepadMovement, isButtonPressed, GP_BUTTONS } from './gamepad';
import { keysFor, type KeyAction } from './keys';

/** What the player is asking for this frame, from keyboard, mouse and gamepad combined. */
export interface Controls {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  special: boolean;
  shoot: boolean;
  /** Y on the pad, F on the keyboard: secondary fire, for the weapons that have one (see SECONDARY in player.ts). */
  secondary?: boolean;
  /** Shift on the keyboard: the shoulder charge and nothing else (no slide, uppercut or dive kick, whatever direction's held). */
  charge?: boolean;
}

/** What the player last touched: for button prompts (a gamepad's B, or the mouse's right button). */
export type InputDevice = 'keyboard' | 'mouse' | 'gamepad';
let lastDevice: InputDevice = 'keyboard';
export const getLastInputDevice = () => lastDevice;
export const setLastInputDevice = (d: InputDevice) => { lastDevice = d; };

export const NO_CONTROLS: Controls = { left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false };

/** Tracks held keys (by both `key` and `code`, lower-cased) and the mouse buttons. */
export class KeyboardMouseState {
  private keys: Record<string, boolean> = {};
  /** Left button: fire. */
  mouseDown = false;
  /** Right button: special. */
  rightMouseDown = false;

  /** When each key (by code) was last pressed, to tell which of two held keys came last. */
  private pressedAt: Record<string, number> = {};
  private pressCount = 0;

  isDown = (...names: string[]) => names.some(n => this.keys[n]);
  lastPressed = (code: string) => this.pressedAt[code] || 0;

  attach(target: Window) {
    const onKeyDown = (e: KeyboardEvent) => {
      lastDevice = 'keyboard';
      if (!e.repeat) this.pressedAt[e.code.toLowerCase()] = ++this.pressCount;
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code.toLowerCase()] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => { this.keys[e.key.toLowerCase()] = false; this.keys[e.code.toLowerCase()] = false; };
    // (the mouse's buttons are held like keys too, 'mouse0' to 'mouse4', for whatever they've been bound to)
    const setButton = (e: MouseEvent, down: boolean) => {
      if (e.button === 0) this.mouseDown = down;
      else if (e.button === 2) this.rightMouseDown = down;
      this.keys[`mouse${e.button}`] = down;
      if (down) this.pressedAt[`mouse${e.button}`] = ++this.pressCount;
    };
    const onMouseDown = (e: MouseEvent) => { lastDevice = 'mouse'; setButton(e, true); };
    // (the side buttons are game buttons, not the browser's back and forward)
    const onMouseUp = (e: MouseEvent) => { setButton(e, false); if (e.button === 3 || e.button === 4) e.preventDefault(); };
    // Right click is a game button, not the browser's menu
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    // Buttons released outside the window (or while alt-tabbed) would otherwise stay held
    const onBlur = () => { this.keys = {}; this.mouseDown = false; this.rightMouseDown = false; };
    target.addEventListener('keydown', onKeyDown);
    target.addEventListener('keyup', onKeyUp);
    target.addEventListener('mousedown', onMouseDown);
    target.addEventListener('mouseup', onMouseUp);
    target.addEventListener('contextmenu', onContextMenu);
    target.addEventListener('blur', onBlur);
    return () => {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
      target.removeEventListener('mousedown', onMouseDown);
      target.removeEventListener('mouseup', onMouseUp);
      target.removeEventListener('contextmenu', onContextMenu);
      target.removeEventListener('blur', onBlur);
    };
  }
}

/** Meathead 2 fires with the left mouse button alone: it sets this to [] (null: firing is wherever it's been bound). */
let fireKeys: string[] | null = null;
export const setFireKeys = (keys: string[]) => { fireKeys = keys; };

export const readControls = (kb: KeyboardMouseState): Controls => {
  const gp = getActiveGamepad();
  let padX = 0, padY = 0, padJump = false, padSpecial = false, padShoot = false, padFlame = false;
  if (gp) {
    const move = getGamepadMovement(gp, 0.2);
    padX = move.x;
    padY = move.y;
    // D-pad up aims/uppercuts; only A jumps. LB/RB are reserved for weapon swapping (handled in App).
    padJump = isButtonPressed(gp, GP_BUTTONS.A);
    padShoot = isButtonPressed(gp, GP_BUTTONS.X) || isButtonPressed(gp, GP_BUTTONS.RT);
    padFlame = isButtonPressed(gp, GP_BUTTONS.Y);
    padSpecial = isButtonPressed(gp, GP_BUTTONS.B) || isButtonPressed(gp, GP_BUTTONS.LT);
    if (padJump || padShoot || padFlame || padSpecial || Math.abs(padX) > 0.5 || Math.abs(padY) > 0.5) lastDevice = 'gamepad';
  }

  // (the keyboard's keys for each, wherever the options screen has put them: see keys.ts)
  const k = (a: KeyAction) => kb.isDown(...keysFor(a));
  // One-key specials for keyboard players: the uppercut key (E) is up + special, the slide / dive kick key (C) is
  // down + special (a dive kick in the air, a slide tackle on the ground). They're hotkeys: they override whatever
  // up/down is held, so up + C still slides and down + E still uppercuts. With both held, the one pressed last wins.
  let uppercutKey = k('uppercut');
  let diveKey = k('downSpecial');
  if (uppercutKey && diveKey) {
    const last = (a: KeyAction) => Math.max(0, ...keysFor(a).map(c => kb.lastPressed(c)));
    if (last('uppercut') > last('downSpecial')) diveKey = false;
    else uppercutKey = false;
  }
  const heldDown = k('down') || padY > 0.3;
  const heldUp = k('up') || padY < -0.4;
  return {
    left: k('left') || padX < -0.3,
    right: k('right') || padX > 0.3,
    down: diveKey || (heldDown && !uppercutKey),
    up: uppercutKey || (heldUp && !diveKey),
    jump: k('jump') || padJump,
    special: uppercutKey || diveKey || k('special') || padSpecial,
    charge: k('charge'),
    shoot: padShoot || (fireKeys ? kb.mouseDown || kb.isDown(...fireKeys) : k('fire')),
    secondary: padFlame || k('secondary'),
  };
};

const ACTION_BUTTONS = ['jump', 'special', 'shoot', 'flame'] as const;

/**
 * Menu and gameplay inputs are independent: a button that was already down when
 * gameplay (re)starts (B still held from backing out of the pause menu, A from
 * confirming the boss intro) is ignored until it's let go and pressed again.
 * Directions aren't gated, so holding a direction through a pause keeps walking.
 */
export class HeldButtonGate {
  private blocked = new Set<typeof ACTION_BUTTONS[number]>();

  /** Starts ignoring every action button that's held right now. */
  block(c: Controls) {
    for (const k of ACTION_BUTTONS) if (c[k]) this.blocked.add(k);
  }

  apply(c: Controls): Controls {
    if (this.blocked.size === 0) return c;
    const out = { ...c };
    for (const k of [...this.blocked]) {
      if (c[k]) out[k] = false;
      else this.blocked.delete(k);
    }
    return out;
  }
}
