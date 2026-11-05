// Fast travel (the user's): back at the portal of a land he's already cleared, the YOU ARE GOING HERE card lets him
// pick where in it to go: its way in, or the start of one of its major sections (about one a park-map attraction, and
// the boss's door: outside it, the boss-door rule's spot). Far fewer than the checkpoints (that's the cheats build's
// checkpoint skip, a different thing). The card's map puts YOU ARE GOING HERE on the stop's attraction as the pick
// changes; the land's built at that stop's checkpoint (store.ts setStartCheckpoint), the world as a clear left it
// (every land's own revisit and checkpoint world-state handling; spawnSafe.ts keeps the spot clear).
// Not cleared: none of this; the card's as it was.

import { isLandCleared, LAND_FINDS, allFound, type FindKind } from '../store';
import { benGave } from '../upgrades/state';

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
    { name: 'DAD GUY LIVE!', attraction: 'amphi', cp: 62 },
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
/** A right-click over the land's card: back out of it (the hub takes it as a back, once). */
let backAsked = false;
export const askCardBack = () => { backAsked = true; };
export const takeCardBack = () => { const b = backAsked; backAsked = false; return b; };

// ---- the missed finds (the owner's: "when fast traveling on a completed land, highlight any checkpoint that comes
// BEFORE any pickups you missed, even if it is further than the one AFTER. show it highlight along with a hint on how to
// obtain it. some may have more than one."): each of a land's three hidden finds (store.ts LAND_FINDS; 'armor': the
// piece CON-FUCK-TIOUS gives there) under the last stop he passes on the way to it, so it's still ahead of him from
// there (a stop past it, however close, doesn't count: Area 51's store is a walk back from the needle's lobby, but it's
// flagged at the ride before). The card marks a stop with one still missing and shows how to get it.

export interface FindHint {
  /** A LAND_FINDS id, or 'armor' (the land's piece, benGave). */
  find: string;
  /** The stop (its name in FAST_TRAVEL) it's flagged under. */
  stop: string;
  /** How to get it (ALL CAPS, short: it's on the card). */
  hint: string;
}

export const FIND_HINTS: Record<string, FindHint[]> = {
  adventure: [
    { find: 'health-falls', stop: 'JUNGLE TRAIL', hint: 'AT THE GORGE, CLIMB DOWN THE FIRST LONG VINE AND JUMP LEFT INTO THE CAVE. SWING YOUR ASS THROUGH TO BEHIND THE FALLS.' },
    { find: 'armor', stop: 'JUNGLE CRUISE', hint: 'UNDER THE RIVER, CLIMB THE SHAFT OVER THE THIRD AIR POCKET. CHARGE HIS DUMMY, KEEP HOLDING, TAP GRAB, PUNT THE HEAD.' },
    { find: 'shard-hack', stop: 'PRE-HYSTERIC PARK', hint: 'PAST THE T. REX, BEFORE THE TEMPLE: CLIMB THE TALL FAKE TREE. HACK THE PANEL ON TOP.' },
  ],
  spooky: [
    { find: 'shard-mash', stop: 'SPOOKY TOWN SQUARE', hint: 'THE KID AT THE GRAND ARCADE WANTS SOME MONSTER MASH. BEAT HIS ASS, BEST OF THREE.' },
    { find: 'armor', stop: "DRACULA'S OTHER CASTLE", hint: 'LIBRARY, TOP LEFT: UP THE OLD SHELVES, WALK THROUGH THE DRAFTY FAKE BOOKS. SNUFF HIS THREE CANDLES IN THE CAPE.' },
    { find: 'health-tower', stop: 'ELEVATOR TO HELL', hint: 'AFTER THE CRASH UP TOP, DON\'T GO DOWN THE SHAFT. JUMP ACROSS IT, CLIMB THE LADDER AND TRUSS, WALK THE CATWALK RIGHT.' },
  ],
  space: [
    { find: 'ammo-ladder', stop: 'THE ATOM', hint: 'GET UP ON THE AIRLOCKS\' ROOF BY THE METEOR RIG. CLIMB THE LONG-ASS LADDER ON ITS LEFT END.' },
    { find: 'shard-lockpick', stop: 'VOYAGE TO 2010', hint: 'WALK PAST SPACE NEEDLE 2\'S DOORS TO THE AREA 51 STORE. GRAB THE PAPERCLIP, PICK THE LOCK. RAMMING IT DOES SHIT.' },
    { find: 'armor', stop: 'XENOSCARE', hint: 'IN HER BASEMENT, FOLLOW THE GREEN FLOOR LIGHTS LEFT, DOWN THE HATCH. UPPERCUT HIS ALIEN, KEEP HOLDING, TAP GRAB.' },
  ],
  hollywood: [
    { find: 'shard-plunge', stop: 'THRONES OF THE STARS', hint: 'STOP 2\'S TOILET IS CLOGGED. KILL THE STAFF, PLUNGE IT, WIN TEST YOUR PLUNGE.' },
    { find: 'armor', stop: 'STUDIO BACKLOT', hint: 'PAST THE FLASH FLOOD, RIDE THE WIRES UP THE WATER TOWER. FLASH KICK HIS THREE CURTAINS IN HALF.' },
    { find: 'ammo-flood', stop: 'REAL DISASTERS', hint: 'IN THE FLOOD CLIMB\'S SECOND SHAFT, RIDE THE CRANE WIRE LEFT. GRAB IT AND RACE THE WATER BACK.' },
  ],
  foreign: [
    { find: 'armor', stop: 'MEXICO', hint: 'IN NORWAY, PAST THE TOLL: KILL ALL 19 NORWEGIANS, TALK TO THE TROLL DOORMAN UNDER THE BRIDGE. HEADBUTT THE KEG 3 TIMES.' },
    { find: 'ammo-shinkansen', stop: 'ITALY', hint: 'AT JAPAN\'S BULLET TRAIN, DUCK IN THE LEFT TUNNEL WHEN ITS GATE OPENS. GRAB IT AND GET OUT BEFORE THE TRAIN.' },
    { find: 'health-thames', stop: 'THE UNITED KINGDOM', hint: 'CROSS TOWER BRIDGE, THEN COME BACK AND SINK TO THE RIVER BOTTOM UNDER ITS MIDDLE.' },
  ],
  frontier: [
    { find: 'ammo-train', stop: 'LONESOME PINE RAILROAD', hint: 'BEAT ON THE CIRCUS LION\'S CAGE TILL IT BREAKS. THE LION GETS OUT. GRAB THE AMMO.' },
    { find: 'shard-gallery', stop: 'SAWDUST GULCH', hint: 'PLAY DOOLEY\'S SHOOTIN\' GALLERY BY THE SALOON. ZAP HIS WHOLE SET, THEN SHOOT DOOLEY.' },
    { find: 'armor', stop: 'THE OLD MINE', hint: 'FLOODED SHAFT, FAR END: SWIM DOWN THE ASSAY OFFICE HOLE, THROUGH THE MAZE. DIVE KICK HIS SCARECROW, KEEP HOLDING, TAP GRAB.' },
  ],
  fantasy: [
    { find: 'ammo-crypt', stop: 'HOGSMEAT VILLAGE', hint: 'IN THE GRAND STAIRCASE HALL, RIDE THE TRAPDOOR STAIRS DOWN INTO THE CRYPT. DODGE THE AXES ALL THE WAY DOWN.' },
    { find: 'armor', stop: 'THE ENCHANTED GLEN', hint: 'RIDE THE DWARF MINE\'S LAST STAIRS DOWN TO THE LIGHT IN THE WALL. LET HIS KNIGHTS BOP YOU. DON\'T HIT BACK.' },
    { find: 'health-keep', stop: "THE GREAT PIXIE'S CASTLE", hint: 'OFF THE BALCONY AT THE TOP OF THE TOWER STAIRS, UPPERCUT UP THE SWINGING STAIRS, TOP LEFT.' },
  ],
  cartoon: [
    { find: 'armor', stop: 'SILLYVILLE SQUARE', hint: 'RIDE THE SKY-HIGH TROLLEY. DROP IN THE LIT HOLE IN THE BALL PIT. GRAB HIS SHAKER TILL IT WORKS.' },
    { find: 'health-giftshop', stop: 'THE WACKY WHITE HOUSE', hint: 'DOWN ON THE ROSE GARDEN LAWN, FOLLOW THE GIFT SHOP ARROW BACK LEFT. HOP THE LEANING TOWERS DOWN THERE.' },
    { find: 'shard-bumper', stop: 'THE BIG-KID ZONE', hint: 'TAKE THE CARNY\'S BUMPER BASH BY THE RINK. KILL EVERY CAR BEFORE TIME\'S UP. BOOST INTO THEM.' },
  ],
};

const FIND_LABEL: Record<FindKind | 'armor', string> = {
  health: 'MAX HEALTH', ammo: 'MAX AMMO', shard: 'CHARGE SHARD', armor: "CON-FUCK-TIOUS'S ARMOR",
};

/** What's still missing from a stop (a cleared land's: the finds flagged under it he hasn't got), each with what it is. */
export const missedAt = (land: string, stop: Stop): { label: string; hint: string }[] => {
  const d = LAND_FINDS[land];
  if (!d) return [];
  const got = allFound()[land] ?? [];
  return (FIND_HINTS[land] ?? []).filter(h => h.stop === stop.name && (h.find === 'armor' ? !benGave(d.piece) : !got.includes(h.find)))
    .map(h => ({ label: FIND_LABEL[h.find === 'armor' ? 'armor' : d.finds.find(([id]) => id === h.find)?.[1] ?? 'health'], hint: h.hint }));
};
