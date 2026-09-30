import { useSyncExternalStore } from 'react';
import { subscribeDevice, inputDevice, Device } from '../game/platform/device';

/** 'pad' if the controller was the last thing touched, 'kbm' if it was the keyboard or the mouse; re-renders on a switch. */
export const useInputDevice = (): Device => useSyncExternalStore(subscribeDevice, inputDevice, inputDevice);
