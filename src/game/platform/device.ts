import { getLastInputDevice, setLastInputDevice } from './input';
import { getActiveGamepad } from './gamepad';

// Keyboard-and-mouse or a controller: whichever was touched last (a key, a click, the wheel; any button or a push of
// a stick on the pad), kept up to date as it changes, for button prompts that show the one you'd actually press.
// One watcher for the whole page, however many prompts are up.

type Device = 'pad' | 'kbm';
/** What kind of controller it is (going by what it calls itself): its buttons are labelled differently. */
export type PadFamily = 'xbox' | 'playstation' | 'switch';
let current: Device = getLastInputDevice() === 'gamepad' ? 'pad' : 'kbm';
let family: PadFamily = 'xbox';
/** (what the prompts look at: the device and, for a controller, which kind, as one value that changes when either does) */
let snapshot = current === 'pad' ? `pad:${family}` : 'kbm';

/** A controller's kind from its id: Sony's (054c; DualShock, DualSense), Nintendo's (057e; Pro Controller, Joy-Con), else Xbox-style. */
export const familyOf = (id: string): PadFamily => {
  const s = id.toLowerCase();
  if (s.includes('054c') || s.includes('dualshock') || s.includes('dualsense') || s.includes('playstation') || s.includes('ps4') || s.includes('ps5')) return 'playstation';
  if (s.includes('057e') || s.includes('pro controller') || s.includes('joy-con') || s.includes('nintendo') || s.includes('switch')) return 'switch';
  return 'xbox';
};
const listeners = new Set<() => void>();
let started = false;

const set = (d: Device) => {
  current = d;
  const next = current === 'pad' ? `pad:${family}` : 'kbm';
  if (next !== snapshot) { snapshot = next; listeners.forEach(l => l()); }
};

const start = () => {
  if (started || typeof window === 'undefined') return;
  started = true;
  window.addEventListener('keydown', () => { setLastInputDevice('keyboard'); set('kbm'); }, true);
  window.addEventListener('mousedown', () => { setLastInputDevice('mouse'); set('kbm'); }, true);
  window.addEventListener('wheel', () => { setLastInputDevice('mouse'); set('kbm'); }, true);
  const poll = () => {
    const gp = getActiveGamepad();
    if (gp) family = familyOf(gp.id);
    if (gp && (gp.buttons.some(b => b.pressed) || gp.axes.some(a => Math.abs(a) > 0.5))) { setLastInputDevice('gamepad'); set('pad'); }
    // (the game's own reading of the pad counts too)
    else if (getLastInputDevice() === 'gamepad') set('pad');
    else set(current);
    requestAnimationFrame(poll);
  };
  requestAnimationFrame(poll);
};

export const subscribeDevice = (l: () => void) => { start(); listeners.add(l); return () => { listeners.delete(l); }; };

/** 'pad' if the controller was the last thing touched, 'kbm' if it was the keyboard or the mouse (outside React: the canvas prompts). */
export const inputDevice = (): Device => { start(); return current; };
/** The kind of controller in use (Xbox-style if there isn't one). */
export const padFamily = (): PadFamily => { start(); return family; };
/** 'kbm', or 'pad:xbox' / 'pad:playstation' / 'pad:switch' (for React: one value for both). */
export const deviceSnapshot = () => { start(); return snapshot; };
export type { Device };
