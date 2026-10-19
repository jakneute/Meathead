// The frontier wilds, laid out (x from the section's start, heights up from the ground line: Y(h) = GY - h). The PARK's
// version of the wilderness (fiberglass boulders with their bolts showing, painted mountain flats, park signs), stocked
// with real animals "for authenticity". Teach, then escalate (each hazard alone and safe first):
//
//   0      THE TRAILHEAD (cp 0): the gate sign; a doe grazing; the first bear trap alone on the flat (its sign); the
//          first pine dropping a cone.
//   1400   THE ROCKY RISE: fiberglass ledges up over a big fake boulder; a crow; a trap on a ledge (jump it); the first
//          loose edge (safe drop under it); ledges down the far side (the way back up).
//   2700   THE POND: the first rolling log, alone on still water (its sign); falling in is just a swim.
//   4500   WOLF WOODS (cp 1): two wolves with a trap in their path (watch one step in); a beehive over a pack (shoot it
//          down on them); a pine.
//   6200   THE CREEK: two pools either side of a rock island, a log in each (tied up at the near bank till he's on
//          it); the first leeches (their sign: under the water they latch on; stay on the log); the first trout alone
//          (it leaps the log: duck); the first fallen tree to duck under, alone; a beaver; a crow.
//   7800   THE BLUFFS: ledges up the bluff, a cougar on top; a ravine with a chain of loose ledges over it (they come
//          back: the way back's the same).
//   9300   SNAKE FLATS (cp 2): a rattlesnake hole alone, then two with a trap between; a porcupine (no dive kicks).
//   10400  THE RAPIDS: current; two channels and a rock island; submerged rocks buck the log; a fallen tree to duck under
//          on the log; beavers, trout; leeches (swimming it is a bad idea).
//   13100  BISON MEADOW (cp 3): a bison; a buck; up the hill against the log pile's rolling logs.
//   15200  THE LONG RIVER: one log, a long gentle river: wolves and a cougar on the overhangs over it, a hive hanging off
//          one, a crow, a fallen tree to duck; the boom's snapped: what's left of it a snag short of the falls (a
//          drifting log hangs up on it); ride on over it and the current has the log, it goes over the falls: jump
//          off to the far cliff (or go with it).
//   17800  THE LAST MILE (cp 4): a wolf pack and traps; the gauntlet (traps under, ledges over, crows); the tracks.
//   19300  THE STATION (cp 5): Tucker, his train, the scene (station.ts).
//
// All of it goes both ways (he'll be back through here): the logs drift downstream and wait at the far bank (ride them
// back against the current), the loose ledges come back, the ledges down the far sides of the climbs go back up.

import { SECTIONS, GY } from '../geometry';

export const x0 = SECTIONS.wilds.x0, x1 = SECTIONS.wilds.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;

/** Ground: [from, to, height at from, height at to] (between runs: pits, all the way down; or water, below). */
export const GROUND: [number, number, number, number][] = [
  [-200, 3000, 0, 0],
  // (the pond: its bed, under the water)
  [3000, 3900, -160, -160],
  [3900, 6300, 0, 0],
  [6300, 6900, -160, -160],
  [6900, 7050, 20, 20],
  [7050, 7700, -160, -160],
  [7700, 8160, 0, 0],
  [8160, 8500, 300, 300],
  // (the ravine: 8500..9100, all the way down)
  [9100, 9180, 260, 260],
  [9180, 9400, 260, 0],
  [9400, 10500, 0, 0],
  // (the rapids: two channels and the rock island between)
  [10500, 11650, -160, -160],
  [11650, 11800, 20, 20],
  [11800, 12900, -160, -160],
  [12900, 14200, 0, 0],
  // (the hill, the log pile's plateau, down to the river)
  [14200, 15000, 0, 260],
  [15000, 15250, 260, 260],
  [15250, 15450, 260, 0],
  [15450, 15500, 0, 0],
  [15500, 17480, -160, -160],
  // (the falls: 17480..17580, the drop)
  [17580, 17900, 40, 40],
  [17900, 18000, 40, 0],
  [18000, 19440, 0, 0],
  // (the steps up onto the station's platform, and the platform)
  [19440, 19520, 0, 40],
  [19520, 21200, 40, 40],
];

/** Ledges (one-way, to stand on): [from, to, height]. Fiberglass rock shelves, the bluff's steps, the gauntlet's. */
export const LEDGES: [number, number, number][] = [
  // (the rocky rise up to the boulder, and down its far side)
  [1450, 1600, 110], [1680, 1820, 220], [1900, 2080, 330],
  [2530, 2620, 215], [2650, 2760, 105],
  // (a stump to stand on in wolf woods)
  [5320, 5440, 120],
  // (up the bluff)
  [7880, 8000, 120], [8030, 8140, 220],
  // (snake flats: a shelf over the second pair)
  [9960, 10120, 140],
  // (the meadow's rock, by the bison)
  [13350, 13480, 130],
  // (the long river's overhangs: shelves of fake rock out over the water)
  [15950, 16250, 200], [16700, 16960, 220],
  // (the last mile's gauntlet: ledges over the traps)
  [18780, 18940, 120], [19020, 19180, 150], [19260, 19380, 110],
];
/** Loose ledges (crumble a moment after he stands on them, come back later): [from, to, height]. */
export const LOOSE: [number, number, number][] = [
  [2420, 2510, 330],
  [8560, 8660, 290], [8740, 8840, 280], [8920, 9020, 290],
];
/** Solid fake boulders (walls with a standable top): [from, to, height of the top]. */
export const BOULDERS: [number, number, number][] = [
  [2100, 2420, 330],
];

/** Water: the pond, the creek's two pools, the rapids' two channels, the long river. Its surface sits a bit under the
 *  banks (`surface` px under GY); the bed is GY+160. `current` px a frame (+ downstream, to the right); `rocks`:
 *  submerged rocks that buck a log going over them; `lip`: the falls' edge (past it, the drop, to `fallsTo`, the far
 *  cliff); `snag`: the log boom's snapped last length, lying low across the river short of the lip: a log drifting
 *  down hangs up on it (and waits there); driven at it, a log rides up over it, the current has it, and it goes over
 *  the falls (logs.ts). */
export interface Water { key: string; a: number; b: number; surface: number; current: number; rapids?: boolean; rocks?: number[]; lip?: number; snag?: number; fallsTo?: number }
export const WATERS: Water[] = [
  { key: 'pond', a: X(3000), b: X(3900), surface: 26, current: 0 },
  { key: 'creek1', a: X(6300), b: X(6900), surface: 26, current: 0.2 },
  { key: 'creek2', a: X(7050), b: X(7700), surface: 26, current: 0.2 },
  { key: 'rapids1', a: X(10500), b: X(11650), surface: 26, current: 1.3, rapids: true, rocks: [X(10950), X(11320)] },
  { key: 'rapids2', a: X(11800), b: X(12900), surface: 26, current: 1.3, rapids: true, rocks: [X(12150), X(12620)] },
  { key: 'river', a: X(15500), b: X(17480), surface: 26, current: 0.55, lip: X(17470), snag: X(17460), fallsTo: X(17580) },
];
export const BED = 160;

/** The rolling logs: [which water, its home (left end, x from the section's start), its length]. */
export const LOGS: [string, number, number][] = [
  ['pond', 3015, 150],
  ['creek1', 6310, 140], ['creek2', 7060, 140],
  ['rapids1', 10510, 150], ['rapids2', 11810, 150],
  ['river', 15515, 170],
];

/** Fallen trees across the water to duck under on the log (impassable down to the gap): [x from, x to]. The creek's
 *  is the first, alone (the trout's elsewhere); then the rapids', then the long river's. */
export const LOW_BRANCHES: [number, number][] = [
  [7320, 7380],
  [12360, 12420],
  [17020, 17080],
];
/** How high the gap under a fallen tree is (px over his feet on the log): ducked, his head's under it with room. */
export const BRANCH_GAP = 54;

/** The waters with leeches in them (leeches.ts): every log crossing but the pond (the log's teach, where falling in
 *  is just a swim). */
export const LEECH_WATERS = new Set(['creek1', 'creek2', 'rapids1', 'rapids2', 'river']);

/** Bear traps: [x, height of the ground it's on]. */
export const TRAPS: [number, number][] = [
  [640, 0],
  [1990, 330],
  [5000, 0],
  [10040, 0],
  [14000, 0],
  [18330, 0], [18630, 0],
  [18870, 0], [18960, 0], [19090, 0], [19170, 0],
];
/** Pines that drop a cone on him as he passes under: [x, the height of the cone up the tree, the ground's height]. */
export const PINES: [number, number, number][] = [
  [1200, 230, 0],
  [6050, 240, 0],
  [9700, 220, 0],
  [13000, 240, 0],
  [18150, 230, 0],
];
/** Rattlesnake holes: [x]. (The rattler in each: ANIMALS.) */
export const SNAKE_HOLES: number[] = [9620, 9900, 10180, 18050];
/** Beehives: [x, height it hangs at] (the hive's own kind, in ANIMALS; drawn hanging off what's over it). */
export const HIVES: [number, number][] = [[5720, 230], [16100, 160]];
/** The log pile atop the hill (x), and the stretch its logs roll down (from the pile to the hill's foot). */
export const LOG_PILE = { x: 15080, foot: 14220, top: 15020, every: 150 } as const;

export type AnimalKind = 'm2:fr_doe' | 'm2:fr_buck' | 'm2:fr_wolf' | 'm2:fr_cougar' | 'm2:fr_beaver' | 'm2:fr_rattler' | 'm2:fr_crow' | 'm2:fr_porcupine' | 'm2:fr_bison' | 'm2:fr_hive' | 'm2:fr_trout' | 'm2:fr_hawk' | 'm2:fr_goose';
/** Who lives where: [kind, x, height of what it stands on (a crow, a hawk, a hive: where it flies or hangs; a beaver:
 *  in which water, its height ignored)]. None on a trap or in a hazard's path. The air's mixed in with the ground all
 *  the way (the user's: walking right holding fire passed too much): hawks stooping from above, geese coming at his
 *  back, the crows round behind him, while the ground's animals come at him from ahead. Each taught alone first: the
 *  hawk at the trailhead, the goose past the pond. */
export const ANIMALS: [AnimalKind, number, number][] = [
  // (the trailhead: the first hawk, alone (a doe grazing past it))
  ['m2:fr_hawk', 760, 400],
  ['m2:fr_doe', 1020, 0],
  // (the rocky rise)
  ['m2:fr_crow', 2250, 470],
  ['m2:fr_doe', 2900, 0],
  // (off the pond: the first goose, alone, grazing where he steps off the log)
  ['m2:fr_goose', 4020, 0],
  // (wolf woods: the pair with the trap in their way; the pack under the hive; a hawk over the lot)
  ['m2:fr_wolf', 5180, 0], ['m2:fr_wolf', 5260, 0],
  ['m2:fr_hawk', 5450, 420],
  ['m2:fr_wolf', 5650, 0], ['m2:fr_wolf', 5800, 0],
  ['m2:fr_hive', 5720, 230],
  ['m2:fr_doe', 6150, 0],
  // (the creek: a goose at the bank, at his back as he takes the log; the first trout alone in the first pool
  // (taught: it leaps the log); the second pool's beaver and trout)
  ['m2:fr_goose', 6250, 0],
  ['m2:fr_trout', 6640, 0],
  ['m2:fr_beaver', 7480, 0],
  ['m2:fr_trout', 7580, 0],
  ['m2:fr_crow', 7250, 360],
  // (the bluffs: a hawk over the climb, the cougar up top)
  ['m2:fr_hawk', 8250, 560],
  ['m2:fr_cougar', 8380, 300],
  ['m2:fr_crow', 8800, 470],
  // (snake flats: a goose behind, a hawk over the holes)
  ['m2:fr_goose', 9420, 0],
  ['m2:fr_rattler', 9620, 0], ['m2:fr_rattler', 9900, 0], ['m2:fr_rattler', 10180, 0],
  ['m2:fr_hawk', 9900, 420],
  ['m2:fr_porcupine', 10330, 0],
  // (the rapids)
  ['m2:fr_crow', 11000, 380],
  ['m2:fr_beaver', 11200, 0],
  ['m2:fr_beaver', 12050, 0], ['m2:fr_beaver', 12720, 0],
  ['m2:fr_trout', 11040, 0], ['m2:fr_trout', 12260, 0],
  ['m2:fr_crow', 12200, 380],
  // (bison meadow: geese either side of the porcupine, a hawk over the bison)
  ['m2:fr_goose', 13120, 0],
  ['m2:fr_buck', 13250, 0],
  ['m2:fr_hawk', 13450, 450],
  ['m2:fr_bison', 13800, 0],
  ['m2:fr_porcupine', 13560, 0],
  ['m2:fr_goose', 13640, 0],
  // (the log pile: a hawk over the hill)
  ['m2:fr_hawk', 14800, 600],
  // (the long river: a goose on the bank at his back as he takes the log; a hawk over the water; the overhangs'
  // wolves and cougar, the hive, crows)
  ['m2:fr_goose', 15472, 0],
  ['m2:fr_hawk', 15800, 420],
  ['m2:fr_wolf', 16020, 200], ['m2:fr_wolf', 16180, 200],
  ['m2:fr_hive', 16100, 160],
  ['m2:fr_cougar', 16830, 220],
  ['m2:fr_crow', 16500, 380], ['m2:fr_crow', 17200, 400],
  ['m2:fr_beaver', 15900, 0], ['m2:fr_beaver', 16900, 0],
  ['m2:fr_trout', 16060, 0], ['m2:fr_trout', 16780, 0], ['m2:fr_trout', 17160, 0],
  // (the last mile: a goose on the cliff behind him, a hawk over the wolves)
  ['m2:fr_goose', 17980, 40],
  ['m2:fr_rattler', 18050, 0],
  ['m2:fr_wolf', 18450, 0], ['m2:fr_wolf', 18530, 0], ['m2:fr_wolf', 18720, 0],
  ['m2:fr_hawk', 18600, 420],
  ['m2:fr_buck', 18250, 0],
  ['m2:fr_crow', 19000, 330], ['m2:fr_crow', 19250, 360],
];

/** What's lying about (lean: just these). */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [2300, 330, 'small_health'],
  [8300, 300, 'small_ammo'],
  [11720, 20, 'small_health'],
  [15120, 260, 'small_ammo'],
  [19100, 150, 'small_health'],
];

/** Signs: [x, the ground's height there, the words (the first line big), a warning (painted, not burned)]. Each is kept
 *  on its stretch of ground (art.ts); one with no ground under it stands in the water. */
export const SIGNS: [number, number, string[], boolean?][] = [
  [260, 0, ['WILDERNESS LAND', 'THE FRONTIER, AS GOD', 'AND THE PARK INTENDED']],
  [500, 0, ['BEAR TRAPS', 'AUTHENTIC. STEP AROUND.'], true],
  [1340, 0, ['SCENIC ROCKS', '100% FIBERGLASS']],
  [2820, 0, ['LOG ROLLING', 'WALK TO ROLL. STOP TO DRIFT.']],
  [4650, 0, ['WOLF WOODS', 'DO NOT HOWL BACK']],
  [6200, 0, ['CREEK CROSSING', 'LEECHES. RIDE THE LOG.'], true],
  [7760, 0, ['THE BLUFFS', 'EDGES MAY BE LOOSE'], true],
  [9460, 0, ['RATTLESNAKES', 'REAL ONES. SORRY.'], true],
  [10380, 0, ['RAPIDS', 'LEECHES. DO NOT SWIM.'], true],
  [13180, 0, ['BISON MEADOW', 'DO NOT RIDE THE BISON']],
  [14120, 0, ['LOG PILE', 'LOGS MAY ROLL'], true],
  // (planted in the river past the bank: the bank's too short for it, and it hung off both ends)
  [15600, 0, ['LONG RIVER', 'GET OFF BEFORE THE FALLS'], true],
  [17700, 40, ['WELL DONE', 'NOT EVERYBODY GETS OFF']],
  [18900, 0, ['STATION', '1/4 MILE >']],
];

/** The station (station.ts): the platform's deck, the gate where Tucker stands, the depot, the train's spot. */
export const STATION = {
  /** The plank platform (the ground's run at its height: GROUND), its steps up at the left. */
  deck: { a: X(19520), b: X(21000), h: 40 },
  /** The gate onto it (Tucker stands at it; the wall while he's blocking it is just past him). */
  gate: X(19760),
  depot: X(19600),
  tower: X(20720),
  /** The train (behind the platform, facing right): the engine's front, its cab's middle, the caboose's back end. */
  engineFront: X(20594), cab: X(20410), caboose: X(19900),
  /** Where the camera sits for the scene's second half (the gate to the cab in one view). */
  camX: X(19660),
} as const;

export const CHECKPOINTS = [
  { name: 'THE TRAILHEAD', cp: 0, x: X(150), y: GY },
  { name: 'WOLF WOODS', cp: 1, x: X(4500), y: GY },
  { name: 'SNAKE FLATS', cp: 2, x: X(9300), y: GY },
  { name: 'BISON MEADOW', cp: 3, x: X(13100), y: GY },
  { name: 'THE LAST MILE', cp: 4, x: X(17800), y: Y(40) },
  { name: 'THE STATION', cp: 5, x: X(19350), y: GY },
];

/** The ground's height at world x (the runs', linear between their ends), or null over a pit. */
export const groundH = (wx: number): number | null => {
  const rx = wx - x0;
  for (const [a, b, h1, h2] of GROUND) if (rx >= a && rx <= b) return h1 + ((rx - a) / Math.max(1, b - a)) * (h2 - h1);
  return null;
};
