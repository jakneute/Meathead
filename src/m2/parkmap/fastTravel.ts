// Fast travel (the user's): back at the portal of a land he's already cleared, the YOU ARE GOING HERE card lets him
// pick where in it to go: its way in, or the start of one of its major sections (about one a park-map attraction, and
// the boss's door: outside it, the boss-door rule's spot). Far fewer than the checkpoints (that's the cheats build's
// checkpoint skip, a different thing). The card's map puts YOU ARE GOING HERE on the stop's attraction as the pick
// changes; the land's built at that stop's checkpoint (store.ts setStartCheckpoint), the world as a clear left it
// (every land's own revisit and checkpoint world-state handling; spawnSafe.ts keeps the spot clear).
// Not cleared: none of this; the card's as it was.

import { isLandCleared } from '../store';

export interface Stop {
  /** On the card's list. */
  name: string;
  /** Its park-map attraction (data.ts id): where YOU ARE GOING HERE goes, and whose blurb's shown. */
  attraction: string;
  /** The checkpoint it starts at; null: the land's own way in (through the portal as ever). */
  cp: number | null;
}

/** Each land's stops, in the order he'd get to them. */
export const FAST_TRAVEL: Record<string, Stop[]> = {
  adventure: [
    { name: 'JUNGLE TRAIL', attraction: 'jungle', cp: null },
    { name: 'JUNGLE CRUISE', attraction: 'cruise', cp: 10 },
    { name: 'PRE-HYSTERIC PARK', attraction: 'dino', cp: 30 },
    { name: 'TEMPLE OF THE JAGUAR', attraction: 'temple', cp: 40 },
    { name: 'THE JAGUAR EXPRESS', attraction: 'temple', cp: 50 },
    { name: "SKIPPER'S CLEARING", attraction: 'clearing', cp: 71 },
  ],
  spooky: [
    { name: 'SPOOKY TOWN SQUARE', attraction: 'spookyTown', cp: null },
    { name: "DRACULA'S OTHER CASTLE", attraction: 'castle', cp: 10 },
    { name: 'ELEVATOR TO HELL', attraction: 'tower', cp: 40 },
    { name: 'HELL (ACTUAL)', attraction: 'tower', cp: 50 },
    { name: 'THE GRAND BALLROOM', attraction: 'ballroom', cp: 62 },
  ],
  space: [
    { name: 'TOMORROW SQUARE', attraction: 'futureSquare', cp: null },
    { name: 'THE ATOM', attraction: 'atom', cp: 10 },
    { name: 'VOYAGE TO 2010', attraction: 'atom', cp: 20 },
    { name: 'SPACE NEEDLE 2', attraction: 'needle', cp: 40 },
    { name: 'XENOSCARE', attraction: 'xenoscare', cp: 60 },
    { name: 'GALACTIC GROOVE', attraction: 'groove', cp: 74 },
  ],
  hollywood: [
    { name: 'HAPPYWOOD BLVD', attraction: 'blvd', cp: null },
    { name: 'THRONES OF THE STARS', attraction: 'thrones', cp: 10 },
    { name: 'SOUNDSTAGE 66', attraction: 'stage66', cp: 20 },
    { name: 'STUDIO BACKLOT', attraction: 'lot', cp: 30 },
    { name: 'DISASTER: THE RIDE', attraction: 'disaster', cp: 40 },
    { name: 'REAL DISASTERS', attraction: 'disaster', cp: 50 },
    { name: "STEVE'S STUNTERY", attraction: 'stuntery', cp: 60 },
  ],
  foreign: [
    { name: 'MEXICO', attraction: 'pavilions', cp: null },
    { name: 'CHINA', attraction: 'pavilions', cp: 20 },
    { name: 'ITALY', attraction: 'pavilions', cp: 40 },
    { name: 'MOROCCO', attraction: 'pavilions', cp: 60 },
    { name: 'THE UNITED KINGDOM', attraction: 'pavilions', cp: 80 },
    { name: 'HELICOPTER RIDES', attraction: 'heli', cp: 110 },
    { name: 'AMERICA PAVILION', attraction: 'americaPav', cp: 120 },
  ],
  frontier: [
    { name: 'FRONTIER WILDS', attraction: 'wilds', cp: null },
    { name: 'LONESOME PINE RAILROAD', attraction: 'railroad', cp: 10 },
    { name: 'SAWDUST GULCH', attraction: 'gulch', cp: 20 },
    { name: 'THE OLD MINE', attraction: 'mine', cp: 26 },
    { name: 'TIMBER TUMBLE', attraction: 'timber', cp: 30 },
    { name: 'THE WOODS', attraction: 'woods', cp: 40 },
    { name: 'DEEP IN THE WOODS', attraction: 'woods', cp: 60 },
  ],
  fantasy: [
    { name: 'HOGSMEAT VILLAGE', attraction: 'hogsmeat', cp: null },
    { name: 'THE FAIRY WHEEL', attraction: 'wheel', cp: 10 },
    { name: 'THE ENCHANTED GLEN', attraction: 'glen', cp: 20 },
    { name: 'TRUELLING TRAGONS', attraction: 'tragons', cp: 30 },
    { name: "THE GREAT PIXIE'S CASTLE", attraction: 'pixieCastle', cp: 40 },
    { name: 'BROOMSTICK FLIGHTS', attraction: 'pixieCastle', cp: 50 },
    { name: "PIPER'S CHAMBERS", attraction: 'pixieCastle', cp: 61 },
  ],
  cartoon: [
    { name: 'SILLYVILLE SQUARE', attraction: 'silly', cp: null },
    { name: 'HOW CARTOONS ARE MADE', attraction: 'studio', cp: 10 },
    { name: 'THE WACKY WHITE HOUSE', attraction: 'whitehouse', cp: 20 },
    { name: 'THE WEST WING', attraction: 'whitehouse', cp: 30 },
    { name: 'THE BIG-KID ZONE', attraction: 'bigkid', cp: 40 },
    { name: 'PUNCHY & KICKY', attraction: 'punchy', cp: 50 },
    { name: 'DAD MAN LIVE!', attraction: 'amphi', cp: 62 },
  ],
};

/** The stops for a land, if he's cleared it (else null: the card's as it always was). */
export const fastTravelStops = (land: string | undefined | null): Stop[] | null =>
  land && isLandCleared(land) ? FAST_TRAVEL[land] ?? null : null;

// ---- the pick, while the card's up: the hub moves it (up / down), the card shows it (and a click on a row picks it;
// a click on the picked one goes)
let sel = 0, goAsked = false;
const listeners = new Set<() => void>();
const tell = () => listeners.forEach(l => l());
export const fastTravelPick = () => sel;
export const setFastTravelPick = (i: number) => { if (sel !== i) { sel = i; tell(); } };
export const subscribeFastTravel = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
/** A click on the picked stop: go (the hub takes it as a confirm, once). */
export const askFastTravelGo = () => { goAsked = true; };
export const takeFastTravelGo = () => { const g = goAsked; goAsked = false; return g; };
