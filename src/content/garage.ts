// Meathead's garage: where he goes between jobs, wherever that is (nobody's been able to pin it down). Every boss he
// clears, he takes something home: one of three things from each of them, one per difficulty he's cleared that boss
// on (normal, hard, very hard: see game/garage/store.ts). The more he's done, the fuller the garage.

/** The stage select's name for it (it sits alongside the targets). */
export const GARAGE_ID = "MEATHEAD'S GARAGE";

/** Where a souvenir goes in the garage: hung on the pegboard, up on a shelf, or on the floor. */
export type SouvenirSpot = 'wall' | 'shelf' | 'floor';

export interface Souvenir {
  id: string;
  boss: string;
  name: string;
  /** What Meathead's got to say about it (on the tag). */
  note: string;
  spot: SouvenirSpot;
}

export const SOUVENIRS: Souvenir[] = [
  // Artie Avalanche
  { id: 'antler', boss: 'Artie Avalanche', spot: 'wall', name: 'MOOSE ANTLER', note: "HE HAD A NAME. I DIDN'T ASK WHAT IT WAS. GREAT FOR HANGING TOWELS." },
  { id: 'moonboots', boss: 'Artie Avalanche', spot: 'shelf', name: "ARTIE'S MOON BOOTS", note: 'HE WORE THEM INDOORS. I WEAR THEM TO LEG DAY. RESPECT.' },
  { id: 'snowglobe', boss: 'Artie Avalanche', spot: 'shelf', name: 'SNOW GLOBE', note: "A LITTLE MOUNTAIN IN A LITTLE BALL. SHAKE IT AND IT DOES AN AVALANCHE. JUST LIKE THE REAL ONE." },
  // Victor Volcano
  { id: 'viprope', boss: 'Victor Volcano', spot: 'floor', name: 'CLUB CALDERA VIP ROPE', note: "NOW I DECIDE WHO GETS INTO THE GARAGE. NOBODY. NOBODY GETS IN." },
  { id: 'lavalamp', boss: 'Victor Volcano', spot: 'shelf', name: 'LAVA LAMP', note: "THE ONLY LAVA IN HAWAII THAT DIDN'T TRY TO KILL ME." },
  { id: 'neon', boss: 'Victor Volcano', spot: 'wall', name: 'CLUB CALDERA SIGN', note: 'MOOD LIGHTING. FOR THE SQUAT RACK.' },
  // Ernie Earthquake
  { id: 'mug', boss: 'Ernie Earthquake', spot: 'shelf', name: 'ALCATRAZ GIFT SHOP MUG', note: 'FOUND THE GIFT SHOP. IT WAS UNDER THE PRISON. I PAID FOR THIS ONE.' },
  { id: 'seismo', boss: 'Ernie Earthquake', spot: 'wall', name: 'SEISMOGRAPH READOUT', note: 'THE BIG SPIKE IS WHERE I LANDED. FRAMED IT.' },
  { id: 'bell', boss: 'Ernie Earthquake', spot: 'shelf', name: 'CABLE CAR BELL', note: 'RING IT AFTER A PR. HAVE NOT STOPPED RINGING IT.' },
  // Hector Hurricane
  { id: 'flamingo', boss: 'Hector Hurricane', spot: 'floor', name: 'LAWN FLAMINGO', note: 'PULLED OUT OF A COAST GUARDSMAN\'S ASS. HE WAS HEAD FIRST IN THE DIRT OUTSIDE A DAYCARE AT THE TIME. KEPT IT.' },
  { id: 'clicker', boss: 'Hector Hurricane', spot: 'shelf', name: "HECTOR'S WEATHER CLICKER", note: "CHANGES THE FORECAST. PRESSED IT. STILL SUNNY IN HERE. SUNNY FOREVER." },
  { id: 'daycare', boss: 'Hector Hurricane', spot: 'wall', name: 'LITTLE SUNSHINE DAYCARE SIGN', note: "THE KIDS SAID I COULD HAVE IT. THE GROWN-UPS DIDN'T SAY ANYTHING." },
  // Toxic Tommy
  { id: 'flintjar', boss: 'Toxic Tommy', spot: 'shelf', name: 'JAR OF FLINT WATER', note: "DON'T DRINK IT. IT GLOWS AT NIGHT. NIGHT LIGHT." },
  { id: 'hazmat', boss: 'Toxic Tommy', spot: 'wall', name: 'HAZMAT HOOD', note: 'SEEN SOME THINGS THROUGH THIS VISOR. FACES. IN THE MUCK.' },
  { id: 'horn', boss: 'Toxic Tommy', spot: 'shelf', name: "TAYVON'S BIKE HORN", note: "TAYVON WANTS IT BACK. TAYVON CAN COME GET IT." },
  // Blackout Barry
  { id: 'hardhat', boss: 'Blackout Barry', spot: 'shelf', name: 'CON ED HARD HAT', note: 'NEVER WORE A HELMET IN MY LIFE. STILL HAVEN\'T. IT\'S A BOWL NOW.' },
  { id: 'toaster', boss: 'Blackout Barry', spot: 'shelf', name: 'THE TOASTER', note: 'THROWN OUT OF A WINDOW AT ME. CAUGHT IT WITH MY FACE. MAKES GREAT TOAST.' },
  { id: 'breaker', boss: 'Blackout Barry', spot: 'wall', name: 'THE MANHATTAN BREAKER', note: 'THE BIG SWITCH OFF THE POWER ROOM WALL. SAYS MANHATTAN ON IT. IT SAYS OFF. IT STAYS OFF.' },
  // Oily Oscar
  { id: 'derrick', boss: 'Oily Oscar', spot: 'floor', name: 'OIL DERRICK (DESK MODEL)', note: 'STILL PUMPS. STILL LEAKS. THE FLOOR IS RUINED.' },
  { id: 'clock', boss: 'Oily Oscar', spot: 'wall', name: 'BREAK ROOM CLOCK', note: 'FROM THE UNION BREAK ROOM. STILL KEEPS TIME. STILL FEELS LIKE FIVE MINUTES LEFT.' },
  { id: 'chain', boss: 'Oily Oscar', spot: 'wall', name: "DIRTY DAN'S CHAIN", note: 'NOBODY TOUCHES HER BUT DIRTY DAN. DIRTY DAN IS NOT HERE.' },
  // Drug Trade Dale
  { id: 'goldgun', boss: 'Drug Trade Dale', spot: 'wall', name: "CHUCO'S GOLD PISTOL", note: 'TACKY. MOUNTED IT ANYWAY. IT KEEPS TELLING ME TO LOOK AT ITS EYES.' },
  { id: 'badge', boss: 'Drug Trade Dale', spot: 'wall', name: "SHERIFF DAN'S BADGE", note: 'COSTUME BADGE. TEN BUCKS AN HOUR. HE RAN. THE SWORD DIDN\'T MISS, AND THE CAB DIDN\'T EITHER. I\'M THE SHERIFF NOW.' },
  { id: 'lizard', boss: 'Drug Trade Dale', spot: 'floor', name: "RIGGS'S LIZARD", note: "RIGGS SAID IT'D HAVE TO FEND FOR ITSELF. IT'S FENDING FINE. IT EATS CRICKETS. TWICE A DAY. HE HAS MY WORD." },
];

/** The garage on the map and in the files: nobody knows where it is, or what it is. The analysts tried. */
export const GARAGE_DOSSIER = {
  realName: 'UNCONFIRMED. POSSIBLY "THE GARAGE." POSSIBLY "GARAGE."',
  age: 'UNKNOWN (THE BUILDING). OLDER THAN THE ASSET\'S LAST PHYSICAL.',
  occupation: 'Structure. Probably a garage. May be a gym. May be a gym inside a garage. One analyst insists it is a car.',
  threat: 'NONE (TO US). EXTREME (TO THE SUSPENSION OF ANY VEHICLE PARKED INSIDE)',
  location: 'Every satellite pass puts it somewhere else. Twice it came up in the middle of Lake Michigan. Once in Nebraska and Kansas at the same time. The asset gets there fine. The asset has never once been followed there, because every agent assigned to follow him has been outrun on foot.',
  whatItIs: 'Thermal imaging shows one very large heat source moving slowly between two points, which we assess to be a squat rack and a refrigerator. The refrigerator is on a separate circuit. The circuit is protein.',
  contents: 'Grows after every operation. Items recovered from the targets have been observed going in and not coming out: a moose antler, a lamp, what appears to be the main breaker for the island of Manhattan, set to OFF. We have asked the asset to return evidence. The asset said "WHAT EVIDENCE."',
  recommendation: 'Leave it alone. Nobody knows what he does in there. Everybody would like to keep it that way.',
  handler: 'Asset refers to it as "the garage" and "home" and, once, "the temple." He does not own a car. He has never mentioned a car. There is no car.',
};

/** What the map says about it. */
export const GARAGE_MAP = {
  place: 'LOCATION UNKNOWN',
  coords: "??°??'N ???°??'W",
  brief: 'SIGNAL KEEPS MOVING. PROBABLY A GARAGE.',
  region: 'CONUS (PROBABLY)',
};
