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
  { id: 'spooky', name: 'SPOOKY LAND', blurb: 'A HAUNTED CASTLE. THE GHOSTS ARE UNIONIZED.', swirl: ['#1A0B2E', '#5B21B6', '#86EFAC'], sign: '#2E1065', signText: '#BBF7D0', open: false },
  { id: 'cartoon', name: 'CARTOON LAND', blurb: 'EVERYTHING IS SOFT. NOTHING CAN HURT YOU. PROBABLY.', swirl: ['#831843', '#EC4899', '#FDE68A'], sign: '#DB2777', signText: '#FFFBEB', open: false },
  { id: 'hollywood', name: 'HOLLYWOOD LAND', blurb: 'THE MAGIC OF THE MOVIES. MOSTLY PLYWOOD.', swirl: ['#111827', '#B91C1C', '#FDE047'], sign: '#18181B', signText: '#FACC15', open: false },
  { id: 'fantasy', name: 'FANTASY LAND', blurb: 'WIZARDS, CASTLES, A $14 BUTTER DRINK.', swirl: ['#0C1A2E', '#1D4ED8', '#FDE68A'], sign: '#3F2A14', signText: '#FDE68A', open: false },
  { id: 'nature', name: 'NATURE LAND', blurb: 'REAL ANIMALS. DO NOT FEED. DO NOT BE FED.', swirl: ['#052E16', '#15803D', '#BEF264'], sign: '#14532D', signText: '#ECFCCB', open: false },
  { id: 'foreign', name: 'FOREIGN LANDS', blurb: 'THE WHOLE WORLD, FIXED. NO PASSPORT NEEDED. NO PASSPORT ALLOWED.', swirl: ['#7F1D1D', '#1E40AF', '#F8FAFC'], sign: '#1E3A8A', signText: '#FEE2E2', open: false },
];

/** The staff door between Foreign Lands and Space Land: the test pen, for trying the grabs out. */
export const STAFF_SLOT = LANDS.length;
/** Spots round the hub: the eight lands, and the staff door. */
export const HUB_SLOTS = LANDS.length + 1;
