import { getLastInputDevice, setLastInputDevice } from './input';
import { getActiveGamepad } from './gamepad';

// Keyboard-and-mouse or a controller: whichever was touched last (a key, a click, the wheel; any button or a push of
// a stick on the pad), kept up to date as it changes, for button prompts that show the one you'd actually press.
// One watcher for the whole page, however many prompts are up.

type Device = 'pad' | 'kbm';
let current: Device = getLastInputDevice() === 'gamepad' ? 'pad' : 'kbm';
const listeners = new Set<() => void>();
let started = false;

const set = (d: Device) => { if (d !== current) { current = d; listeners.forEach(l => l()); } };

const start = () => {
  if (started || typeof window === 'undefined') return;
  started = true;
  window.addEventListener('keydown', () => { setLastInputDevice('keyboard'); set('kbm'); }, true);
  window.addEventListener('mousedown', () => { setLastInputDevice('mouse'); set('kbm'); }, true);
  window.addEventListener('wheel', () => { setLastInputDevice('mouse'); set('kbm'); }, true);
  const poll = () => {
    const gp = getActiveGamepad();
    if (gp && (gp.buttons.some(b => b.pressed) || gp.axes.some(a => Math.abs(a) > 0.5))) { setLastInputDevice('gamepad'); set('pad'); }
    // (the game's own reading of the pad counts too)
    else if (getLastInputDevice() === 'gamepad') set('pad');
    requestAnimationFrame(poll);
  };
  requestAnimationFrame(poll);
};

export const subscribeDevice = (l: () => void) => { start(); listeners.add(l); return () => { listeners.delete(l); }; };

/** 'pad' if the controller was the last thing touched, 'kbm' if it was the keyboard or the mouse (outside React: the canvas prompts). */
export const inputDevice = (): Device => { start(); return current; };
export type { Device };
