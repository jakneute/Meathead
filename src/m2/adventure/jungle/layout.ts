// The jungle, laid out (x from the section's start, heights up from the ground line). Teach, then escalate:
//
//   0      the way in: a vine up a tree to a lookout (climbing, and climbing off the top), a pit with one vine over it
//          (swinging), the first monkey up a tree, frogs.
//   1900   CHECKPOINT. The monkey grove: the ground way (chimps, frogs, monkeys pelting down from above) or up a vine into the
//          canopy (a run of branches and a vine between them, monkeys up there with him, some health).
//   3350   CHECKPOINT. The ravine: three vines across it (and a rock to rest on), macaws coming at him on them; a gap
//          that wants a good swing (pump it, or push it).
//   5150   CHECKPOINT. The cliff: one long vine up it (the quick climb), a boa hung off it halfway, a monkey up top. The
//          overlook along the top (a jaguar), and (6750: CHECKPOINT) the gorge off the end of it: two long vines down
//          and across.
//   7950   CHECKPOINT. Jaguar country: on the ground (a jaguar, a frog, a chimp, and a jaguar up on a branch over the
//          way, pouncing down) or up in the canopy again (vines between branches, a boa over one with a monkey on it,
//          that jaguar on the next one; ammo at the end).
//   9650   CHECKPOINT (by the LAST VINES sign).
//   9800   The last ravine, three vines, macaws, monkeys pelting from the far side; a jaguar waiting on the far bank
//          (it pounces at him on the vine: over the ravine, so hang back and let it jump), chimps; the Jungle Cruise
//          sign.
//
// All of it goes both ways (he'll be back through here later): every vine's in reach from either side, the cliff's
// vine goes down as well as up, and the gorge can be swung back across.

import { SECTIONS, GY } from '../geometry';
import type { VineDef } from './vines';

const X = (rx: number) => SECTIONS.jungle.x0 + rx;
const Y = (h: number) => GY - h;

/** Ground: [from, to, height]. Between them, pits (all the way down). */
export const GROUND: [number, number, number][] = [
  [-200, 860, 0],
  [1180, 3500, 0],
  [4050, 4130, 60],
  [4450, 5300, 0],
  [5300, 7000, 460],
  [7780, 9800, 0],
  [10700, 12000, 0],
];

/** Branches to stand on (one-way): [from, to, height]. */
export const BRANCHES: [number, number, number][] = [
  [440, 640, 250],
  [1440, 1580, 170],
  [1980, 2250, 260], [2380, 2560, 280], [2700, 2900, 300], [3050, 3300, 260],
  [7840, 8100, 280], [8400, 8600, 300], [8900, 9150, 300], [9450, 9700, 280],
  [10760, 10900, 230],
  [11250, 11380, 180],
];

const swing = (rx: number, h: number, len: number): VineDef => ({ x: X(rx), y: Y(h), len, kind: 'swing' });
const climb = (rx: number, h: number, topX: number): VineDef => ({ x: X(rx), y: Y(h), len: h, kind: 'climb', top: { x: X(topX), y: Y(h) } });

export const VINES: VineDef[] = [
  climb(450, 250, 490),
  swing(1020, 340, 270),
  climb(2000, 260, 2040),
  swing(2630, 520, 170),
  swing(3650, 420, 290), swing(3930, 440, 330), swing(4300, 430, 310),
  climb(5265, 460, 5330),
  swing(7200, 700, 420), swing(7600, 640, 470),
  climb(7860, 280, 7900),
  swing(8250, 560, 200), swing(8750, 580, 220), swing(9300, 560, 200),
  swing(9960, 460, 320), swing(10250, 480, 350), swing(10540, 460, 320),
];

export type AnimalKind = 'm2:monkey' | 'm2:chimp' | 'm2:jaguar' | 'm2:boa' | 'm2:macaw' | 'm2:frog';
/** Who lives where: [kind, x, height of what it's stood on (or, for the boa, the branch it hangs off; a macaw, where it flies)]. */
// (nobody within the safe start's reach of a checkpoint (spawnSafe.ts SAFE_X, 360): none waiting on the spot)
export const ANIMALS: [AnimalKind, number, number][] = [
  ['m2:frog', 1350, 0], ['m2:monkey', 1510, 170], ['m2:frog', 1490, 0],
  ['m2:monkey', 2470, 280], ['m2:chimp', 2650, 0], ['m2:monkey', 2850, 300], ['m2:frog', 2950, 0], ['m2:monkey', 3200, 260], ['m2:chimp', 2980, 0],
  ['m2:macaw', 3800, 380], ['m2:macaw', 4250, 400],
  ['m2:frog', 4700, 0], ['m2:frog', 4760, 0],
  ['m2:boa', 5205, 420], ['m2:monkey', 5420, 460], ['m2:frog', 5980, 460], ['m2:jaguar', 6100, 460],
  ['m2:macaw', 7450, 560],
  // jaguar country: on the ground a jaguar, a frog, a chimp; up in the canopy the boa over a monkey's branch, and a
  // jaguar on the next branch (over the ground way: it pounces down at him there; meets him head on up there)
  ['m2:jaguar', 8350, 0], ['m2:frog', 8450, 0], ['m2:boa', 8500, 500], ['m2:monkey', 8560, 300], ['m2:chimp', 8850, 0], ['m2:jaguar', 9020, 300],
  // the last ravine: macaws on the vines; a jaguar waiting on the far bank (it pounces at him out on the vines: into
  // the ravine, if he hangs back for it), monkeys pelting from the far side, a frog, a chimp
  ['m2:macaw', 10100, 420], ['m2:macaw', 10450, 400],
  ['m2:jaguar', 10820, 0], ['m2:monkey', 10830, 230], ['m2:frog', 10950, 0], ['m2:monkey', 11310, 180], ['m2:chimp', 11480, 0],
];

/** What's lying about up the side routes (lean: just these). */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [2800, 300, 'small_health'],
  [9600, 280, 'small_ammo'],
];

/** What a sign's made like: the park's carved wood, its bamboo gate, a safety sign, a brown scenic one, a road sign,
 *  the way out. */
export type SignStyle = 'gate' | 'wood' | 'monkey' | 'warn' | 'scenic' | 'jaguar' | 'legal' | 'exit';
/** Signs: [x, height of what it stands on, the words, a second line, what it's like]. */
export const SIGNS: [number, number, string, string, SignStyle][] = [
  [260, 0, 'JUNGLE LAND', 'A REAL JUNGLE!', 'gate'],
  [760, 0, 'MIND THE GAP', 'GRAB A VINE', 'wood'],
  [1280, 0, 'DO NOT FEED THE MONKEYS', 'THEY ARE FED', 'monkey'],
  [3420, 0, 'DANGER: RAVINE', 'VINES ARE NOT A RIDE', 'warn'],
  [5130, 0, 'SCENIC OVERLOOK', 'THAT WAY (UP)', 'scenic'],
  [6880, 460, 'SCENIC OVERLOOK', 'NO RAILING. ENJOY!', 'scenic'],
  [7980, 0, 'JAGUAR CROSSING', 'DO NOT PET', 'jaguar'],
  [9720, 0, 'LAST VINES', 'HAPPY LAND IS NOT LIABLE', 'legal'],
  [11640, 0, 'JUNGLE CRUISE', 'THIS WAY >', 'exit'],
];

/** The branches the boas hang off (stubs: dark, not to stand on). */
export const BOA_BRANCHES = ANIMALS.filter(a => a[0] === 'm2:boa').map(a => ({ x: X(a[1]), y: Y(a[2]) }));

// (nothing in the jungle changes for good: the animals are back each go, so a checkpoint here is just where he stands)
export const CHECKPOINTS = [
  { name: 'THE JUNGLE', cp: 0, x: X(150), y: GY },
  // (at the foot of the grove's vine: the ground way or up into the canopy, his pick)
  { name: 'THE MONKEY GROVE', cp: 1, x: X(1900), y: GY },
  { name: 'THE RAVINE', cp: 2, x: X(3350), y: GY },
  { name: 'THE CLIFF', cp: 3, x: X(5150), y: GY },
  // (up on the overlook, short of its end: the gorge's two long vines ahead)
  { name: 'THE GORGE', cp: 4, x: X(6750), y: Y(460) },
  { name: 'JAGUAR COUNTRY', cp: 5, x: X(7950), y: GY },
  // (by the LAST VINES sign, on the ground before the last ravine)
  { name: 'THE LAST VINES', cp: 6, x: X(9650), y: GY },
];

export { X, Y };
