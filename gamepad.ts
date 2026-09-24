// Utility to provide robust cross-browser, cross-device gamepad support

export const GP_BUTTONS = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  SELECT: 8,
  START: 9,
  LSTICK_CLICK: 10,
  RSTICK_CLICK: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
  GUIDE: 16,
};

// Ensure browser activates gamepad subsystem when gamepads are plugged in
if (typeof window !== 'undefined') {
  window.addEventListener('gamepadconnected', () => {});
  window.addEventListener('gamepaddisconnected', () => {});
}

export function getActiveGamepad(): Gamepad | null {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
  try {
    const rawGamepads = navigator.getGamepads();
    if (!rawGamepads) return null;

    const gamepads: Gamepad[] = [];
    for (let i = 0; i < rawGamepads.length; i++) {
      const gp = rawGamepads[i];
      // Include any gamepad object returned by browser (some browsers omit connected flag)
      if (gp && (gp.connected !== false)) {
        gamepads.push(gp);
      }
    }

    if (gamepads.length === 0) return null;

    // 1. Look for a gamepad with active user input (pressed button or tilted primary thumbstick)
    for (const gp of gamepads) {
      const hasButtonPressed = gp.buttons && gp.buttons.some(b => b && (b.pressed || (typeof b.value === 'number' && b.value > 0.35)));
      // Note: Only check axes[0] and axes[1] (primary left stick) for tilt.
      // Triggers (axes[2] or axes[5]) frequently rest at -1.0 or 1.0 on standard controllers and would cause false positives.
      const hasPrimaryStickTilted = gp.axes && (
        (typeof gp.axes[0] === 'number' && Math.abs(gp.axes[0]) > 0.25) ||
        (typeof gp.axes[1] === 'number' && Math.abs(gp.axes[1]) > 0.25)
      );
      if (hasButtonPressed || hasPrimaryStickTilted) {
        return gp;
      }
    }

    // 2. Default to the first available gamepad
    return gamepads[0];
  } catch (e) {
    return null;
  }
}

export function isButtonPressed(gp: Gamepad | null, buttonIndex: number): boolean {
  if (!gp || !gp.buttons) return false;
  const btn = gp.buttons[buttonIndex];
  if (!btn) return false;
  return btn.pressed || (typeof btn.value === 'number' && btn.value > 0.35);
}

export function getGamepadMovement(gp: Gamepad | null, deadzone = 0.2): {
  x: number;
  y: number;
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
} {
  if (!gp) {
    return { x: 0, y: 0, up: false, down: false, left: false, right: false };
  }

  let x = 0;
  let y = 0;

  // Left Analog stick (Axes 0 and 1)
  if (gp.axes && gp.axes.length >= 2) {
    const rawX = typeof gp.axes[0] === 'number' ? gp.axes[0] : 0;
    const rawY = typeof gp.axes[1] === 'number' ? gp.axes[1] : 0;
    if (Math.abs(rawX) > deadzone) x = rawX;
    if (Math.abs(rawY) > deadzone) y = rawY;
  }

  // Standard D-Pad buttons (Buttons 12, 13, 14, 15)
  let dpadUp = isButtonPressed(gp, GP_BUTTONS.DPAD_UP);
  let dpadDown = isButtonPressed(gp, GP_BUTTONS.DPAD_DOWN);
  let dpadLeft = isButtonPressed(gp, GP_BUTTONS.DPAD_LEFT);
  let dpadRight = isButtonPressed(gp, GP_BUTTONS.DPAD_RIGHT);

  // DirectInput POV Hat Switch fallback (often on axes[9])
  if (gp.axes && gp.axes.length > 9 && typeof gp.axes[9] === 'number') {
    const pov = gp.axes[9];
    // Values roughly: -1.0 = Up, -0.71 = Up-Right, -0.43 = Right, -0.14 = Down-Right,
    // 0.14 = Down, 0.43 = Down-Left, 0.71 = Left, 1.0 = Up-Left, > 1.0 = Neutral
    if (pov >= -1.05 && pov <= 1.05) {
      if (Math.abs(pov - (-1.0)) < 0.15 || Math.abs(pov - (-0.71)) < 0.15 || Math.abs(pov - 1.0) < 0.15) dpadUp = true;
      if (Math.abs(pov - 0.14) < 0.15 || Math.abs(pov - (-0.14)) < 0.15 || Math.abs(pov - 0.43) < 0.15) dpadDown = true;
      if (Math.abs(pov - 0.71) < 0.15 || Math.abs(pov - 0.43) < 0.15 || Math.abs(pov - 1.0) < 0.15) dpadLeft = true;
      if (Math.abs(pov - (-0.43)) < 0.15 || Math.abs(pov - (-0.71)) < 0.15 || Math.abs(pov - (-0.14)) < 0.15) dpadRight = true;
    }
  }

  if (dpadLeft) x = -1;
  if (dpadRight) x = 1;
  if (dpadUp) y = -1;
  if (dpadDown) y = 1;

  return {
    x,
    y,
    up: dpadUp || y < -0.35,
    down: dpadDown || y > 0.35,
    left: dpadLeft || x < -0.35,
    right: dpadRight || x > 0.35,
  };
}
