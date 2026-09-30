import { useSyncExternalStore } from 'react';
import { subscribeDevice, deviceSnapshot, Device, PadFamily } from '../game/platform/device';

/** 'pad' if the controller was the last thing touched, 'kbm' if it was the keyboard or the mouse; re-renders on a switch. */
export const useInputDevice = (): Device => (useSyncExternalStore(subscribeDevice, deviceSnapshot, deviceSnapshot) === 'kbm' ? 'kbm' : 'pad');
/** The kind of controller (for its button labels): Xbox-style, PlayStation or Switch. */
export const usePadFamily = (): PadFamily => {
  const s = useSyncExternalStore(subscribeDevice, deviceSnapshot, deviceSnapshot);
  return s.startsWith('pad:') ? (s.slice(4) as PadFamily) : 'xbox';
};
