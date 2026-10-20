// The hub's geometry: where the roundabout is in the world, how far round a lap is, where each spot on it is; and its
// depth: the one eye everything's seen from (the cylinder's horizon), the rows back from the walk, the portals' size.

import { GROUND_Y } from '../../m1/constants';
import { HUB_SLOTS } from './lands';

export const HUB = { x0: -80000, slot: 540, radius: 440 } as const;
export const HUB_CIRC = HUB.slot * HUB_SLOTS;
export const slotX = (i: number) => HUB.x0 + (i + 0.5) * HUB.slot;
/** Where the stretch between spot i and the next one meets (the lamp post's there, the signpost on it). */
export const seamX = (i: number) => HUB.x0 + i * HUB.slot;

/** The horizon the roundabout's wall wraps round (the cylinder's): the one eye, everything back from the walk shrinks
 * toward it. */
export const HUB_HORIZON = 330;
/** How near something standing on the ground at y is (1 on the walk he's on, where his feet are; 0 at the horizon). */
export const depthAt = (y: number) => (y - HUB_HORIZON) / (GROUND_Y - HUB_HORIZON);
/** How big a guest is drawn with their feet at y (an ordinary person beside him: he's a big man). */
export const personScale = (y: number) => 0.84 * depthAt(y);

/** The rows back from the walk (the ground y their feet are on). */
export const ROW = {
  /** The lands' buildings stand along here. */
  back: 484,
  /** The promenade in front of them: the guests going along it, the parade. */
  mid0: 489, mid1: 497,
  /** The low fence or hedge along the back of the walk (gaps where the portals' paths come through). */
  fence: 514,
  /** The walk: guests going along behind him. */
  walk0: 522, walk1: 546,
} as const;

/** A portal: its foot (set back off the walk, up its path), its opening (half width, height), its frame, the swirl
 * round the outside of it. */
export const GATE = { base: 500, halfW: 27, h: 92, frame: 8, halo: 15 } as const;
/** The middle of a portal's opening (world y). */
export const GATE_MID = GATE.base - GATE.h * 0.5;
/** Its path: half its width where it meets the portal, and down at the walk's front edge. */
export const PATH = { far: 24, near: 34 } as const;
