// The castle, laid out: its rooms left to right (absurdly spacious, every one), what's in each to stand on, its
// set pieces (the chandeliers, the poltergeist bookcases, the stoves, the bed, the toy train), who's where, and the
// section's own state.

import { SECTIONS, GY } from '../geometry';
import type { RoomId } from './lines';
import type { StaffKind } from './staff';

export const { x0, x1 } = SECTIONS.castle;
const X = (dx: number) => x0 + dx;

/** The rooms: where each runs (world x), its plaque, its wallpaper. */
export const ROOMS: { id: RoomId; a: number; b: number; name: string; wall: string; trim: string }[] = [
  { id: 'foyer', a: X(0), b: X(1400), name: 'THE GRAND FOYER', wall: '#3B1A22', trim: '#6B2E3A' },
  { id: 'dining', a: X(1400), b: X(3300), name: 'THE DINING ROOM', wall: '#2E1A2E', trim: '#5B3260' },
  { id: 'study', a: X(3300), b: X(5100), name: 'THE STUDY', wall: '#1E2A22', trim: '#3D5A44' },
  { id: 'kitchen', a: X(5100), b: X(6900), name: 'THE KITCHEN', wall: '#3A3020', trim: '#6B5A38' },
  { id: 'bedroom', a: X(6900), b: X(8700), name: 'THE MASTER BEDROOM', wall: '#3A1424', trim: '#7A2E4A' },
  { id: 'nursery', a: X(8700), b: X(10300), name: 'THE NURSERY', wall: '#2A2A3E', trim: '#55557A' },
  { id: 'gallery', a: X(10300), b: X(12000), name: 'THE PORTRAIT GALLERY', wall: '#2A1A14', trim: '#5A3A2A' },
];
export const roomAt = (x: number) => ROOMS.find(r => x >= r.a && x < r.b) ?? null;
/** How high the rooms go (their ceilings: way up; it's that kind of castle). */
export const CEIL = GY - 820;

/** Things to stand on (jump-through, lit lips): [x, top y, w, look]. */
export type LedgeLook = 'stair' | 'balcony' | 'table' | 'shelf' | 'canopy' | 'toyshelf' | 'cauldron' | 'frame' | 'rack';
export const LEDGES: [number, number, number, LedgeLook][] = [
  // the foyer's grand stair up to its balcony
  [X(480), GY - 80, 120, 'stair'], [X(600), GY - 160, 120, 'stair'], [X(720), GY - 240, 520, 'balcony'],
  // the dining table, the whole length of the room
  [X(1700), GY - 72, 1200, 'table'],
  // the study's shelves and its reading balcony
  [X(3480), GY - 130, 170, 'shelf'], [X(3700), GY - 250, 170, 'shelf'], [X(3960), GY - 340, 520, 'balcony'], [X(4540), GY - 230, 170, 'shelf'], [X(4760), GY - 120, 170, 'shelf'],
  // the pot rack between the stoves (up off a stove top, between its flare-ups: a little health up there), the witch's
  // hearth (solid stone) with her cauldron on it
  [X(5700), GY - 210, 220, 'rack'],
  [X(6420), GY - 150, 230, 'cauldron'],
  // the bed's canopy (bounce up onto it)
  [X(7490), GY - 370, 620, 'canopy'],
  // the nursery's toy shelves
  [X(9000), GY - 160, 210, 'toyshelf'], [X(9560), GY - 220, 230, 'toyshelf'], [X(9980), GY - 140, 180, 'toyshelf'],
  // the gallery: the big frames' ledges
  [X(10900), GY - 170, 220, 'frame'], [X(11320), GY - 210, 240, 'frame'],
];

/** The stoves (solid counters, burners on top): x, w. Their top. */
export const STOVES: [number, number][] = [[X(5380), 280], [X(5980), 280]];
export const STOVE_TOP = GY - 82;
/** Each stove's burners: where across it (from its x), how wide. */
export const BURNERS = [[40, 70], [170, 70]] as const;
/** The burners: off, sputtering (the tell), then up in flames, round and round (frames). */
export const STOVE_CYCLE = 200, STOVE_TELL = 50, STOVE_FIRE = 70, FIRE_H = 140;
export const stovePhase = (t: number, i: number) => {
  const k = (t + i * 100) % STOVE_CYCLE;
  return k < STOVE_CYCLE - STOVE_TELL - STOVE_FIRE ? 'off' : k < STOVE_CYCLE - STOVE_FIRE ? 'tell' : 'fire';
};

/** The bed (a solid block; its top bounces him up). */
export const BED = { x: X(7500), w: 600, top: GY - 92 };
export const BOUNCE = 18.5;

/** The chandeliers over the dining table: where, how high they hang. */
export const CHANDELIERS = [X(1900), X(2300), X(2700)];
export const CHAND_Y = GY - 430, CHAND_W = 96, CHAND_TELL = 36;

/** The poltergeist bookcases (books fly off them at him): x, how high the books come out. */
export const BOOKCASES: [number, number][] = [[X(3560), GY - 60], [X(4960), GY - 100]];
export const BOOK_EVERY = 160, BOOK_TELL = 44;

/** The toy train: its track (x0..x1), how fast it goes. */
export const TRAIN = { a: X(8820), b: X(10220), w: 76, h: 34, speed: 6.2 };

/** The wardrobes (a bride in each), and where one hides under the bed. */
export const WARDROBES = [X(7330), X(8460)];

/** The horn speakers, up the walls (two to a room). */
export const HORNS: [number, number][] = ROOMS.flatMap(r => [[r.a + 170, GY - 380] as [number, number], [r.a + (r.b - r.a) * 0.55, GY - 380] as [number, number]]);

/** Who's where at the start: kind, x, feet y (a flyer: the height it hangs at). In teach-then-mix order. */
export const CAST: [StaffKind, number, number][] = [
  // the foyer: one skeleton (the shield, on its own)
  ['skeleton', X(1150), GY],
  // the dining room: the shields (one up on the table)
  ['skeleton', X(1640), GY], ['skeleton', X(2380), GY - 72], ['skeleton', X(3080), GY],
  // the study: the spiked helmets (the shelves over them tempting a dive kick)
  ['knight', X(3760), GY], ['knight', X(4380), GY], ['knight', X(4980), GY],
  // the kitchen: the forks (one on its own first), then the witch up on her cauldron lobbing
  ['igor', X(5260), GY], ['igor', X(5860), GY], ['witch', X(6540), GY - 150], ['igor', X(6300), GY],
  // the bedroom: the brides (out of the wardrobes and from under the bed: see index.ts), and a knight
  ['knight', X(8640), GY],
  // the nursery: the bat suits on their rigs, real bats out of the chimney, an igor
  ['batsuit', X(9250), GY - 250], ['batsuit', X(9950), GY - 280], ['bat', X(9620), GY - 330], ['bat', X(9700), GY - 300], ['bat', X(9780), GY - 340],
  ['igor', X(9820), GY],
  // the gallery: the mummy on his own; then all of it at once
  ['mummy', X(10760), GY],
  ['skeleton', X(11240), GY], ['witch', X(11440), GY - 210], ['mummy', X(11650), GY], ['bride', X(11880), GY], ['knight', X(11420), GY],
];

/** A little health and ammo on the way (lean: small ones only). */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  // (each up a side path: the foyer's balcony, the study's reading balcony, the kitchen's pot rack, the bed's canopy, the
  // nursery's high shelf, the gallery's big frame)
  [X(1190), GY - 240, 'small_ammo'], [X(4230), GY - 340, 'small_health'], [X(5810), GY - 210, 'small_health'], [X(7820), GY - 370, 'small_ammo'],
  [X(9690), GY - 220, 'small_health'], [X(11450), GY - 210, 'small_ammo'],
];

// ---------------------------------------------------------------------------------------------------------------
// Its state

export interface Chandelier { x: number; y: number; vy: number; state: 'hang' | 'tell' | 'fall' | 'down'; t: number }
export interface Book { x: number; y: number; vx: number; vy: number; rot: number; t: number; col: string }
export interface Castle {
  init: boolean;
  /** The rooms whose story's been told (or started). */
  told: Set<RoomId>;
  chand: Chandelier[];
  books: Book[];
  /** Each bookcase's count down to its next volley. */
  shelfT: number[];
  stoveT: number;
  train: { x: number; dir: 1 | -1; bell: number };
  /** Which wardrobe's brides are out, and the one under the bed. */
  wardrobe: boolean[]; underBed: boolean;
  /** Kills counted (for the PA's quips), and the frame he last quipped. */
  kills: number; quipAt: number;
  /** The castle's front door (it shut behind him on the way in: the PA's cue). */
  doorShut: number;
}
