// PIPER THE PIXIE's refight (LUST): hell's knockoff of her bedroom, Fairy Land's own boss fight run whole
// (fantasy/bedroom/fight.ts) at 999. The owner's: "piper seems to find her having to interact with meathead once more
// truly a sign she must be in hell. don't have anything really interesting with her, but i do generally want new lines
// spoken". The same fight (the slams, the wreck, the mains, the throws, the flintlock's holes); her lines swapped
// (park4/lines/fantasy.ts; fantasy/piperLines.ts asks for the swap, it picks her lines itself). Started at
// checkpoint 61 (the land's own retry: outside her kicked-in door, walk in and she's waiting).
//
// Stitched up the way she died: corked (the cork that went through her head plugged with a nicer one, a seam round her
// middle where the floor had her wedged) or popped (the flintlock's holes under black tire patches off a bike kit, the
// orange edge round each).
//
// The place: HELL'S PIXIE BEDROOM (park4/place/fantasy.ts), in through the room's own hooks.

import type { RefightDef } from '../defs';
import { fantasyLayout } from '../../../fantasy/index';
import * as A from '../../../fantasy/bedroom/lines';
import { bossDeath } from '../../../store';
import { inRefight } from '../hook';
import { ROOM_HOOKS } from '../../../fantasy/bedroom/room';
import { VIEW_HOOKS } from '../../../fantasy/bedroom/view';
import { fantasyPlace, FANTASY_HOOKS } from '../place/fantasy';
import { refightId, refightStage } from '../where';
import * as L from '../lines/fantasy';


// (her place: HELL'S PIXIE BEDROOM (park4/place/fantasy.ts), in through the room's own hooks: only while her refight's
// on)
const rfOn = () => inRefight('fantasy');
ROOM_HOOKS.key = () => (rfOn() ? FANTASY_HOOKS.key : null);
ROOM_HOOKS.wallOver = (g, a, b) => { if (rfOn()) FANTASY_HOOKS.wallOver(g, a, b); };
ROOM_HOOKS.trophies = () => (rfOn() ? FANTASY_HOOKS.trophies : null);
ROOM_HOOKS.after = (c, state) => { if (rfOn()) FANTASY_HOOKS.after(c, state); };
VIEW_HOOKS.view = (g, l, r, top, bot, hY) => { if (!rfOn()) return false; FANTASY_HOOKS.view(g, l, r, top, bot, hY); return true; };

export const fantasyRefight: RefightDef = {
  land: 'fantasy', id: refightId('fantasy'), stage: refightStage('fantasy'),
  boss: 'PIPER THE PIXIE', sin: 'LUST',
  inner: fantasyLayout, cp: 61,
  sign: { pic: 'castle', word: 'CASTLE', color: '#1D4ED8' },
  looks: ['normal', 'weakness'],
  lookNow: () => bossDeath('fantasy') ?? 'normal',
  lookName: l => (l === 'weakness' ? 'POPPED (WEAKNESS)' : 'CORKED'),
  swaps: () => [
    [A.PIPER_AGAIN, L.RF_PIPER_AGAIN], [A.PIPER_TAUNT, L.RF_PIPER_TAUNT], [A.PIPER_LEAP, L.RF_PIPER_LEAP], [A.PIPER_HURT, L.RF_PIPER_HURT],
    [A.PIPER_HOLE, L.RF_PIPER_HOLE], [A.PIPER_LOW, L.RF_PIPER_LOW], [A.PIPER_LAST, L.RF_PIPER_LAST], [A.PIPER_STUCK, L.RF_PIPER_STUCK],
    [A.PIPER_SUPERMODEL, L.RF_PIPER_SUPERMODEL], [A.PIPER_TOO_THIN, L.RF_PIPER_TOO_THIN],
    [A.ELEMENT_SHOUT.fire, L.RF_ELEMENT_FIRE], [A.ELEMENT_SHOUT.ice, L.RF_ELEMENT_ICE], [A.ELEMENT_SHOUT.shock, L.RF_ELEMENT_SHOCK],
    [A.PIPER_POP, L.RF_PIPER_POP], [A.PIPER_CRUMBLE, L.RF_PIPER_CRUMBLE],
  ],
  place: fantasyPlace,
  arena: () => null,
  stitches: look => look === 'weakness'
    // (popped: the holes the patches don't cover, crossed shut; a seam down her where she split)
    ? { thread: '#1A1A1A', patch: '#18181B', seams: [[0.5, 0.25, 0.48, 0.9]], holes: [[0.58, 0.36], [0.36, 0.56]] }
    // (corked: the floor had her to the waist: a seam right round her middle, staples where it pinched)
    : { thread: '#F5F5F4', patch: '#7C5A2E', seams: [[0.02, 0.6, 0.98, 0.62]], staples: [[0.25, 0.61], [0.75, 0.62]] },
};
