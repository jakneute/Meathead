// What Meathead 2 can't have anybody say: lines from Meathead 1 that name its places, its bosses, its weather and its
// set pieces ("MIAMI'S FINEST", the cartel, the snow, the volcano). He's at Happy Land now; anything that says he's
// somewhere else, or after someone he's done with, is out. Used by the voice pack (tools/voices/m2pack.ts) and at
// startup (cleanLines.ts), so what's left to say and what's recorded match.

import { ADV_VOICE_LINES } from '../adventure/voices';

const OUT_OF_PLACE = new RegExp([
  // Meathead 1's places
  'MIAMI', 'FLORIDA', 'FLINT', 'NEW YORK', 'BROOKLYN', 'MANHATTAN', 'TEXAS', 'SAN FRAN', 'FRISCO', 'ALCATRAZ', 'ALASKA', 'HAWAII', 'HILO', 'VEGAS',
  'ALBUQUERQUE', 'GOLDEN GATE', 'WASHINGTON', 'WHITE HOUSE', 'OVAL OFFICE',
  // its bosses, and the President
  '\\bARTIE\\b', '\\bVICTOR\\b', '\\bERNIE\\b', '\\bHECTOR\\b', '\\bTOMMY\\b', '\\bBARRY\\b', '\\bOSCAR\\b', '\\bDALE\\b', 'PRESIDENT',
  // its weather, terrain and set pieces
  'VOLCAN', 'LAVA', 'MAGMA', 'AVALANCH', 'HURRICANE', 'TORNADO', 'QUAKE', 'SNOW', '\\bICE\\b', '\\bICED\\b', 'ICEBERG', 'ICICLE', 'BLIZZARD', 'FROST',
  'MOUNTAIN', 'MOOSE', '\\bSKI', 'PARKA', 'GLACIER', 'DESERT', 'CARTEL', 'SICARIO', 'SEWER', 'SLUDGE', 'TOXIC', '\\bOIL', 'BLACKOUT', 'JET SKI',
  'TOUR GROUP', 'RANGER STATION', 'FREEZE RAY', "CLUB'S", 'THIS CLUB', 'SEAFOOD', 'BEACH', '\\bSURF', 'HAZMAT', 'STORM',
].join('|'), 'i');

/**
 * Meathead 2's own lines always fit, whatever they name: they were written for where he is (Safari Artie's name is
 * Artie; Adventure Land has its storm drain, its fake volcano). It's only Meathead 1's that are weeded out.
 */
const OWN = new Set<string>(ADV_VOICE_LINES.flatMap(v => Object.values(v).flat()));

/** Does this line fit where he is (Happy Land)? */
export const fitsHappyLand = (text: string) => OWN.has(text) || !OUT_OF_PLACE.test(text);
