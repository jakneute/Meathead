// The hub's geometry: where the roundabout is in the world, how far round a lap is, where each spot on it is.

import { HUB_SLOTS } from './lands';

export const HUB = { x0: -80000, slot: 640, radius: 440 } as const;
export const HUB_CIRC = HUB.slot * HUB_SLOTS;
export const slotX = (i: number) => HUB.x0 + (i + 0.5) * HUB.slot;
