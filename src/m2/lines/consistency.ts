// What Meathead 2 can't have anybody say: lines from Meathead 1 that name its places, its bosses, its weather and its
// set pieces ("MIAMI'S FINEST", the cartel, the snow, the volcano). He's at Happy Land now; anything that says he's
// somewhere else, or after someone he's done with, is out. Used by the voice pack (tools/voices/m2pack.ts) and at
// startup (cleanLines.ts), so what's left to say and what's recorded match.

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

/** Does this line fit where he is (Happy Land)? */
export const fitsHappyLand = (text: string) => !OUT_OF_PLACE.test(text);
