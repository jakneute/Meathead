// Happy Land's lands, in the order their portals go round the hub (and round the map). Names are working titles.

export interface Land {
  id: string;
  name: string;
  /** What the map says about it. */
  blurb: string;
  /** Its colors: the portal's swirl (deep to bright), and the sign. */
  swirl: [string, string, string];
  sign: string;
  signText: string;
  /** Built yet (a stage to go to)? */
  open: boolean;
}

export const LANDS: Land[] = [
  { id: 'space', name: 'SPACE LAND', blurb: 'THE FUTURE, AS IMAGINED IN 1962. STILL LOADING.', swirl: ['#1E1B4B', '#4338CA', '#A5B4FC'], sign: '#312E81', signText: '#E0E7FF', open: false },
  { id: 'frontier', name: 'FRONTIER LAND', blurb: 'OLD AMERICA. LOG FLUMES. DYSENTERY (SIMULATED).', swirl: ['#431407', '#B45309', '#FCD34D'], sign: '#78350F', signText: '#FEF3C7', open: false },
  { id: 'spooky', name: 'SPOOKY LAND', blurb: 'A HAUNTED CASTLE. THE GHOSTS ARE UNIONIZED.', swirl: ['#1A0B2E', '#5B21B6', '#86EFAC'], sign: '#2E1065', signText: '#BBF7D0', open: true },
  { id: 'cartoon', name: 'CARTOON LAND', blurb: 'EVERYTHING IS SOFT. NOTHING CAN HURT YOU. PROBABLY.', swirl: ['#831843', '#EC4899', '#FDE68A'], sign: '#DB2777', signText: '#FFFBEB', open: false },
  { id: 'hollywood', name: 'HOLLYWOOD LAND', blurb: 'THE MAGIC OF THE MOVIES. MOSTLY PLYWOOD.', swirl: ['#111827', '#B91C1C', '#FDE047'], sign: '#18181B', signText: '#FACC15', open: false },
  { id: 'fantasy', name: 'FANTASY LAND', blurb: 'WIZARDS, CASTLES, A $14 BUTTER DRINK.', swirl: ['#0C1A2E', '#1D4ED8', '#FDE68A'], sign: '#3F2A14', signText: '#FDE68A', open: false },
  { id: 'adventure', name: 'ADVENTURE LAND', blurb: 'ANCIENT RUINS. HOSTILE WILDLIFE. SIGN THE WAIVER.', swirl: ['#1C1917', '#3F6212', '#FBBF24'], sign: '#57534E', signText: '#FDE68A', open: true },
  { id: 'foreign', name: 'FOREIGN LANDS', blurb: 'THE WHOLE WORLD, FIXED. NO PASSPORT NEEDED. NO PASSPORT ALLOWED.', swirl: ['#7F1D1D', '#1E40AF', '#F8FAFC'], sign: '#1E3A8A', signText: '#FEE2E2', open: false },
];

/** A spot round the hub: a land's portal, America USA's way in (where he came from: no going back), or the staff door. */
export type Spot = { kind: 'land'; land: number } | { kind: 'america' } | { kind: 'staff' };
/**
 * Round the hub, in order. America USA's narrow street comes in at the bottom of the map, between Cartoon Land and
 * Hollywood Land; the staff door (not on the map) is between Foreign Lands and Space Land.
 */
export const SPOTS: Spot[] = [
  { kind: 'land', land: 0 }, { kind: 'land', land: 1 }, { kind: 'land', land: 2 }, { kind: 'land', land: 3 },
  { kind: 'america' },
  { kind: 'land', land: 4 }, { kind: 'land', land: 5 }, { kind: 'land', land: 6 }, { kind: 'land', land: 7 },
  { kind: 'staff' },
];
export const HUB_SLOTS = SPOTS.length;
export const STAFF_SLOT = SPOTS.findIndex(s => s.kind === 'staff');
export const AMERICA_SLOT = SPOTS.findIndex(s => s.kind === 'america');
/** The land at a spot round the hub, if it's a land's. */
export const landAt = (slot: number | null): Land | null => {
  const s = slot === null ? undefined : SPOTS[slot];
  return s?.kind === 'land' ? LANDS[s.land] : null;
};
/** The map goes round the same way, without the staff door: nine sectors, America USA's at the bottom. */
const MAP_SPOTS = SPOTS.filter(s => s.kind !== 'staff');
export const MAP_SECTORS = MAP_SPOTS.length;
export const AMERICA_SECTOR = MAP_SPOTS.findIndex(s => s.kind === 'america');
export const landSector = (land: number) => MAP_SPOTS.findIndex(s => s.kind === 'land' && s.land === land);
