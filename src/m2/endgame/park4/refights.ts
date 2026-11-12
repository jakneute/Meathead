// Ned's boss rush: the eight refights (park4/rf/<land>.ts each), and their stages (App.tsx registers them; the lot's
// portals go to them by land).

import type { StageLayout } from '../../../m1/game/stages/index';
import type { RefightDef } from './defs';
import { refightLayout } from './refight';
import './looks';
import { adventureRefight } from './rf/adventure';
import { spookyRefight } from './rf/spooky';
import { spaceRefight } from './rf/space';
import { hollywoodRefight } from './rf/hollywood';
import { foreignRefight } from './rf/foreign';
import { frontierRefight } from './rf/frontier';
import { fantasyRefight } from './rf/fantasy';
import { cartoonRefight } from './rf/cartoon';

export const REFIGHTS: Record<string, RefightDef> = {
  adventure: adventureRefight, spooky: spookyRefight, space: spaceRefight, hollywood: hollywoodRefight,
  foreign: foreignRefight, frontier: frontierRefight, fantasy: fantasyRefight, cartoon: cartoonRefight,
};
/** Every refight's engine stage and its layout (App.tsx: registerStageLayout each). */
export const REFIGHT_LAYOUTS: [string, StageLayout][] = Object.values(REFIGHTS).map(d => [d.stage, refightLayout(d)]);
// (dev: the contact sheets on the window: window.__wp4Sheet)
if (import.meta.env.DEV) void import('./sheet');
