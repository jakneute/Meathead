// The park map's words: every attraction on it (where it sits in its land, its number on the brochure, its cheery
// one-liner and its height / thrill gag), the bits round the hub and the way in, and the KEY CAST MEMBERS: a sincere
// park-PR piece about each land's star (the brochure's cheer against who they really are; teased, never spoiled), and
// once he's dead, his obituary instead: two of them, one per death (the normal one, the weakness one: store.ts bossDeath).
// Which of the game's zones (hudThemes.tsx) are in which attraction: the YOU ARE HERE marker's rough spot.

import { LANDS } from '../hub/lands';

export interface Attraction {
  id: string;
  /** Its land (lands.ts id), or 'hub' for the plaza, America USA and the way in. */
  land: string;
  name: string;
  /** Where it is: in its land, u across (-0.5..0.5) and v out (0 the ring walk .. 1 the edge, past 1 outside the park);
   *  or on the paper itself (x, y) for the way in. */
  u?: number; v?: number; x?: number; y?: number;
  /** The game's zones in it (where he is, roughly). */
  zones: string[];
  blurb: string;
  /** The small print: height, thrill, the warning. */
  info: string;
  /** Its little landmark (landmarks.ts). */
  art: string;
  /** Not numbered, and named only up close (shops, food, the off-the-map bits). */
  minor?: boolean;
}

export const ATTRACTIONS: Attraction[] = [
  // ---- Jungle Land
  { id: 'jungle', land: 'adventure', name: 'JUNGLE TRAIL', u: -0.3, v: 0.2, zones: ['jungle'], art: 'jungleTrail',
    blurb: 'A REAL JUNGLE, IMPORTED ONE TREE AT A TIME. THE MONKEYS ARE WATCHING.', info: 'ANY HEIGHT · THRILL 1/5 · SIGN THE WAIVER' },
  { id: 'cruise', land: 'adventure', name: 'JUNGLE CRUISE', u: 0.05, v: 0.3, zones: ['queue', 'boat', 'underwater'], art: 'cruise',
    blurb: 'SAIL THE RIVERS OF THE WORLD WITH OUR WORLD-FAMOUS SKIPPER! SEE THE BACKSIDE OF WATER! THEN DOWN UNDER IT: THE AQUARIUM, OUR TANK OF REAL LIVE FISH (MOSTLY).', info: 'CURRENT WAIT: 185 MIN · PLEASE STAY IN THE BOAT' },
  { id: 'dino', land: 'adventure', name: 'PRE-HYSTERIC PARK', u: -0.25, v: 0.62, zones: ['dino'], art: 'dino',
    blurb: 'REAL ROBOT DINOSAURS IN FRIENDLY MODE. FEEDING: 2PM, 4PM, WHENEVER.', info: 'MUST BE TALLER THAN A SNACK · DO NOT LICK THE DINOSAUR' },
  // (the Jaguar Express is the ride inside the temple: one attraction, the user's)
  { id: 'temple', land: 'adventure', name: 'TEMPLE OF THE JAGUAR: JAGUAR EXPRESS', u: 0.2, v: 0.62, zones: ['temple', 'roof', 'cart'], art: 'temple',
    blurb: '1,000-YEAR-OLD RUINS, LOVINGLY CAST IN FIBERGLASS, AND A RUNAWAY MINE CART RIGHT THROUGH THEM! EVERY GUEST GETS A FRIENDLY TRACK.', info: 'MUST BE 42 IN. · THRILL 4/5 · DO NOT LICK THE RUINS' },
  { id: 'clearing', land: 'adventure', name: "SKIPPER'S CLEARING", u: -0.05, v: 0.9, zones: ['clearing'], art: 'clearing',
    blurb: 'MEET THE SKIPPER IN HIS NATURAL HABITAT. BRING A FRIEND. BRING SEVERAL.', info: 'GUIDED VISITS ONLY · NO GUIDE AVAILABLE' },
  { id: 'dinodogs', land: 'adventure', name: 'DINO DOGS', u: -0.05, v: 0.12, zones: [], art: 'food', minor: true,
    blurb: 'BRONTO DOG $9 · T-REX DOG $12.', info: 'FOOD' },

  // ---- Spooky Land
  { id: 'spookyTown', land: 'spooky', name: 'SPOOKY TOWN SQUARE', u: 0.05, v: 0.16, zones: ['spooky'], art: 'spookyTown',
    blurb: 'THE BAT-O-ROUND, SPINNING COFFIN CUPS AND THE LI\'L GHOST TRAIN! A CRYPT-O ATM!', info: 'RIDERS MUST BE THIS WICKED TO RIDE' },
  { id: 'castle', land: 'spooky', name: "DRACULA'S OTHER CASTLE", u: -0.1, v: 0.52, zones: ['castle', 'dungeon'], art: 'castle',
    blurb: 'A GHOST TOUR HOSTED LIVE BY THE COUNT HIMSELF. MIND THE CHAMBER OF THE DESCENDING CEILING!', info: 'DO NOT TOUCH THE PORTRAITS · THEY TOUCH BACK' },
  { id: 'tower', land: 'spooky', name: 'ELEVATOR TO HELL', u: 0.3, v: 0.62, zones: ['tower', 'hell'], art: 'clockTower',
    blurb: 'A THRILLING DROP IN THE OLD CLOCK TOWER. DROP TIME: ETERNITY.', info: 'MUST BE 40 IN. AND DAMNED · THRILL 5/5' },
  { id: 'ballroom', land: 'spooky', name: 'THE GRAND BALLROOM', u: -0.28, v: 0.84, zones: ['ballroom', 'control'], art: 'ballroom',
    blurb: 'DANCE THE NIGHT AWAY WITH DJ VLAD! CAPE CHECK $8.', info: 'FORMAL WEAR · FANGS OPTIONAL' },
  { id: 'hellShop', land: 'spooky', name: 'GIFT SHOP (B-LEVEL)', u: 0.2, v: 0.92, zones: ['giftshop'], art: 'shop', minor: true,
    blurb: 'ALL-YOU-CAN-EAT BUFFET. FREE SAMPLES. ABANDON ALL HOPE.', info: 'SHOP' },

  // ---- Future Land
  { id: 'futureSquare', land: 'space', name: 'TOMORROW SQUARE', u: -0.1, v: 0.14, zones: ['space', 'drag'], art: 'futureSquare',
    blurb: 'THE WORLD OF TOMORROW! (SINCE 1962). SPACE FOOD STICKS AND $14 ICE CREAM.', info: 'ANY HEIGHT · THE FUTURE IS STILL LOADING' },
  // (the Voyage to 2010 is the ride inside the giant atom: one attraction, the user's)
  { id: 'atom', land: 'space', name: 'THE ATOM: VOYAGE TO 2010', u: 0.28, v: 0.36, zones: ['atom', 'ride'], art: 'atom',
    blurb: 'INSIDE THE GIANT ATOM: RIDE PROGRESSCO\'S VOYAGE TO 2010! NO TRAFFIC! ALL EFFECTS SIMULATED.', info: 'THIS RIDE INSPECTED: 1990 · THRILL 3/5' },
  { id: 'needle', land: 'space', name: 'SPACE NEEDLE 2', u: 0.05, v: 0.62, zones: ['needle', 'orbit'], art: 'needle',
    blurb: 'AN ELEVATOR TO ACTUAL OUTER SPACE. GUESTS CALL IT "FINE."', info: 'MUST HOLD BREATH 6 HOURS · ASTRONAUT SUIT: DO NOT TOUCH' },
  { id: 'xenoscare', land: 'space', name: 'XENOSCARE', u: 0.3, v: 0.84, zones: ['crater', 'xenoscare'], art: 'xenoscare',
    blurb: 'THE SCARIEST HAUNTED HOUSE IN THE GALAXY! NOW NEXT TO A BRAND-NEW CRATER.', info: 'MAY CONTAIN LATEX · NOT FOR EXPECTANT MOTHERS' },
  { id: 'groove', land: 'space', name: 'GALACTIC GROOVE', u: -0.2, v: 0.86, zones: ['queen'], art: 'disco',
    blurb: 'THE SPACE DISCO! BOOGIE UNDER THE MIRROR BALL TILL 2 AM.', info: '21+ · NO MATING ON THE DANCE FLOOR' },

  // ---- Hollywood Land
  { id: 'blvd', land: 'hollywood', name: 'HAPPYWOOD BLVD', u: 0.0, v: 0.16, zones: ['hollywood'], art: 'blvd',
    blurb: 'WALK WITH THE STARS! PHOTOS WITH YOUR FAVORITES $20. YOUR NAME HERE $49.99.', info: 'ANY HEIGHT · WATCH FOR STUNT WIRES' },
  { id: 'thrones', land: 'hollywood', name: 'THRONES OF THE STARS', u: -0.3, v: 0.42, zones: ['coaster'], art: 'toiletCoaster',
    blurb: 'SIT WHERE THE STARS SAT! A STOP-AND-GO TOUR OF HISTORIC CELEBRITY TOILETS.', info: 'MUST BE POTTY TRAINED · THRILL 2/5 · DO NOT FLUSH' },
  { id: 'stage66', land: 'hollywood', name: 'SOUNDSTAGE 66', u: 0.28, v: 0.4, zones: ['warehouse'], art: 'soundstage',
    blurb: 'A CLOSED SET. NOTHING IS BEING FILMED HERE. ESPECIALLY NOT A SEQUEL.', info: 'NO PHOTOS · NO PHONES · NO SPOILERS' },
  { id: 'lot', land: 'hollywood', name: 'STUDIO BACKLOT', u: 0.0, v: 0.6, zones: ['lot'], art: 'backlot',
    blurb: 'THE MAGIC OF THE MOVIES, UP CLOSE! NOTHING FILMED HERE SINCE 1987.', info: 'EXIT THROUGH THE GIFT SHOP' },
  { id: 'disaster', land: 'hollywood', name: 'DISASTER: THE RIDE', u: -0.3, v: 0.8, zones: ['disaster', 'havoc'], art: 'disaster',
    blurb: 'FEEL THE FURY OF NATURE (MILDLY)! EARTHQUAKE! FLOOD! A BREEZE!', info: 'MAY CAUSE MILD WARMTH, A BREEZE, DAMPNESS · THRILL 2/5' },
  { id: 'stuntery', land: 'hollywood', name: "STEVE'S STUPENDOUS STUNTERY", u: 0.25, v: 0.86, zones: ['stunt'], art: 'stuntArena',
    blurb: 'THE CROWN JEWEL OF HOLLYWOOD LAND! CARS! RAMPS! FIRE! SHOWS HOURLY!', info: 'SPLASH ZONE: ROWS 1-40 · TESTED BY STEVE' },

  // ---- Foreign Lands
  { id: 'pavilions', land: 'foreign', name: 'THE WORLD PAVILIONS', u: 0.0, v: 0.42, zones: ['foreign', 'mexico', 'norway', 'china', 'germany', 'italy', 'japan', 'morocco', 'france', 'uk', 'canada'], art: 'lagoon',
    blurb: "TEN NATIONS, ONE LAGOON! EUROPE'S MEXICO, NORWAY (CAPITAL OF SWEDEN), ITALY (BIRTHPLACE OF THE TACO) AND MORE.", info: 'NO PASSPORT NEEDED · NO PASSPORT ALLOWED' },
  { id: 'heli', land: 'foreign', name: 'HELICOPTER RIDES ACROSS THE WORLD', u: -0.28, v: 0.86, zones: ['heli'], art: 'helipad',
    blurb: 'IN AMERICA, EVERYTHING IS BIGGER. EVEN OTHER PLACES. FLY THE WORLD WITH HARRY!', info: 'MUST BE 44 IN. · AIRSICK BAGS PROVIDED' },
  { id: 'americaPav', land: 'foreign', name: 'AMERICA PAVILION', u: 0.28, v: 0.88, zones: ['harry'], art: 'construction',
    blurb: 'COMING SOON: THE GREATEST NATION OF ALL, BIGGER THAN THE OTHERS.', info: 'HARD HATS ONLY · UNDER CONSTRUCTION SINCE 1999' },

  // ---- Wilderness Land
  { id: 'wilds', land: 'frontier', name: 'FRONTIER WILDS', u: -0.25, v: 0.2, zones: ['frontier'], art: 'wilds',
    blurb: 'AUTHENTIC AMERICAN WILDERNESS. THE BEARS ARE ANIMATRONIC. MOSTLY.', info: 'BEAR TRAPS ARE AUTHENTIC · DO NOT SWIM' },
  { id: 'railroad', land: 'frontier', name: 'LONESOME PINE RAILROAD', u: 0.1, v: 0.38, zones: ['train'], art: 'railroad',
    blurb: 'ALL ABOARD WITH TUCKER, OUR CHEERFUL CONDUCTOR! A ROLLICKING RIDE ROUND THE WEST.', info: 'TICKETS REQUIRED · NO EXCEPTIONS · EVER' },
  { id: 'gulch', land: 'frontier', name: 'SAWDUST GULCH', u: -0.15, v: 0.6, zones: ['gulch', 'saloon', 'mill'], art: 'gulch',
    blurb: 'GOLD! TIMBER! FUDGE! A REAL OLD WEST TOWN WITH A SALOON (SARSAPARILLA ONLY).', info: 'SHOWDOWNS AT HIGH NOON · AND WHENEVER' },
  { id: 'mine', land: 'frontier', name: 'THE OLD MINE', u: 0.3, v: 0.62, zones: ['mine'], art: 'mine',
    blurb: 'TOUR A REAL WORKING GOLD MINE. FREE CANARY WITH EVERY TOUR.', info: 'IF THE CANARY STOPS SINGING, SO DO YOU' },
  { id: 'timber', land: 'frontier', name: 'TIMBER TUMBLE', u: 0.0, v: 0.86, zones: ['logride', 'sewer', 'river'], art: 'logFlume',
    blurb: 'THE LONGEST LOG RIDE IN THE WEST! RIDE TIME: 11 MINUTES.', info: 'MUST BE 46 IN. · THRILL 3/5 · YOU WILL GET WET' },
  { id: 'woods', land: 'frontier', name: 'THE WOODS', u: 0.15, v: 1.12, zones: ['woods', 'dirtbike', 'tucker'], art: 'woods', minor: true,
    blurb: 'NOT PARK PROPERTY. HAPPY LAND IS NOT RESPONSIBLE PAST THE FENCE.', info: 'OFF THE MAP' },

  // ---- Fairy Land
  { id: 'hogsmeat', land: 'fantasy', name: 'HOGSMEAT VILLAGE', u: 0.05, v: 0.16, zones: ['fantasy'], art: 'village',
    blurb: 'WANDS & SONS, THE PRANCING PONY CAROUSEL, AND A $14 BUTTER BREW. PLATFORM 7 5/8 THIS WAY.', info: 'MIND THE MOVING STAIRCASES' },
  { id: 'wheel', land: 'fantasy', name: 'THE FAIRY WHEEL', u: -0.3, v: 0.42, zones: ['wheel'], art: 'wheel',
    blurb: 'SEE ALL OF FAIRY LAND FROM THE TOP! THE FIRST OF THE GREAT PIXIE\'S TRIALS.', info: 'NO STANDING IN THE CARTS · OR KILLING' },
  { id: 'glen', land: 'fantasy', name: 'THE ENCHANTED GLEN', u: 0.28, v: 0.42, zones: ['glen'], art: 'glen',
    blurb: 'A MAGICAL STROLL AMONG THE TALKING MUSHROOMS. CUPID FLIES DAILY!', info: 'THE MUSHROOMS ARE LISTENING' },
  { id: 'tragons', land: 'fantasy', name: 'TRUELLING TRAGONS', u: -0.05, v: 0.62, zones: ['tragons'], art: 'tragons',
    blurb: 'THREE DRAGONS! THREE TRACKS! FIRE, ICE AND LIGHTNING, ALL AT ONCE.', info: 'MUST BE 54 IN. · THRILL 5/5 · PICK A CAR. QUICKLY.' },
  { id: 'pixieCastle', land: 'fantasy', name: "THE GREAT PIXIE'S CASTLE", u: 0.15, v: 0.88, zones: ['keep', 'runway', 'broom', 'piper'], art: 'pixieCastle',
    blurb: 'HOME OF PIPER THE PIXIE! PRINCESS MAKEOVER BOUTIQUE INSIDE. BROOMSTICK FLIGHTS FROM THE RUNWAY.', info: 'MOAT DRAINED FOR CLEANING · NO REFUNDS ON BROOMS' },
  { id: 'butter', land: 'fantasy', name: 'BUTTER BREW', u: -0.3, v: 0.16, zones: [], art: 'food', minor: true,
    blurb: 'STILL $14.', info: 'FOOD' },

  // ---- Cartoon Land
  { id: 'silly', land: 'cartoon', name: 'SILLYVILLE SQUARE', u: -0.05, v: 0.16, zones: ['cartoon'], art: 'sillyville',
    blurb: 'THE WUMPLE-GO-ROUND, THE WISH-FISH SPINNER AND THE SNOOZLE CHOO! GENTLE FUN FOR LITTLE ONES.', info: 'NO GOOD RIDES · NO REFUNDS' },
  { id: 'studio', land: 'cartoon', name: 'HOW CARTOONS ARE MADE', u: 0.28, v: 0.38, zones: ['studio'], art: 'studio',
    blurb: 'LEARN THE MAGIC (EST. 1994)! IT TOOK ELEVEN OF AMERICA\'S FUNNIEST MEN SIX MONTHS TO INVENT THE WORD "WACKY."', info: 'ANY HEIGHT · RUNTIME: 3 HOURS' },
  { id: 'whitehouse', land: 'cartoon', name: 'THE WACKY WHITE HOUSE', u: -0.28, v: 0.42, zones: ['whitehouse'], art: 'whiteHouse',
    blurb: 'HELP CHELSEA AND SOCKS THE CAT SAVE THE WHITE HOUSE FROM THE MEAN MEN! INTERACTIVE!', info: 'SOME GUESTS MAY BECOME A CAT' },
  { id: 'bigkid', land: 'cartoon', name: 'THE BIG-KID ZONE', u: 0.05, v: 0.62, zones: ['bigkid'], art: 'bigKid',
    blurb: 'TOTALLY EXTREME! BUMPER BASH, HURL-A-WHIRL, MOTION MADNESS! ALL CRASH!', info: 'MUST BE 48 IN. AND RAD · THRILL 3/5' },
  { id: 'punchy', land: 'cartoon', name: 'PUNCHY & KICKY', u: -0.3, v: 0.8, zones: ['itchy'], art: 'punchy',
    blurb: 'THE CAT AND MOUSE THE WHOLE FAMILY LOVES! NOW 40% MORE KILLING!', info: 'FAMILY FRIENDLY · WATCH FOR ANVILS' },
  { id: 'amphi', land: 'cartoon', name: 'STUPID DAD LIVE!', u: 0.25, v: 0.86, zones: ['amphi'], art: 'amphi',
    blurb: 'THE UBX AMPHITHEATER! HONK AZORIA LIVE! SHOWS AT 11, 1, 3, 5 AND 7. BEER GARDEN OPEN.', info: 'NO OUTSIDE BEER · INSIDE BEER $12' },

  // ---- The hub, and the way in
  { id: 'hub', land: 'hub', name: 'THE HAPPY HUB', zones: ['hub'], art: 'hub', x: 450, y: 440,
    blurb: 'THE HEART OF THE PARK! EVERY LAND IS JUST A PORTAL AWAY.', info: 'LOST CHILDREN · LOST ADULTS · BOTH HERE' },
  { id: 'america', land: 'hub', name: 'AMERICA USA', zones: ['america'], art: 'none', x: 450, y: 690,
    blurb: 'NOW 20% MORE AMERICA! SHOP NEW ORLEANS-ISH, NASHVILLE-ISH, CHICAGO-ISH AND MORE. FREEDOM WALKING ONLY.', info: 'FREEDOM FRIES, TWO FOR $19.99' },
  { id: 'gate', land: 'hub', name: 'TICKETS + FRONT GATE', zones: ['ticket'], art: 'none', x: 450, y: 548,
    blurb: 'ONE DAY: $189. WAIT TIME FROM HERE: YES.', info: 'NO RE-ENTRY · NO REFUNDS · NO EXCEPTIONS' },
  { id: 'security', land: 'hub', name: 'SECURITY', zones: ['security'], art: 'none', x: 450, y: 836,
    blurb: 'THE FREEDOM-SCAN. ALL BAGS SUBJECT TO PATRIOTISM.', info: 'SMILE! YOU ARE ON CAMERA' },
  { id: 'garage', land: 'hub', name: 'PARKING GARAGE P1-P47', zones: ['garage'], art: 'none', x: 450, y: 884,
    blurb: 'REMEMBER WHERE YOU PARKED. WE WON\'T.', info: 'WATCH FOR PILLARS' },
  { id: 'staff', land: 'hub', name: 'STAFF ROOM', zones: ['staff'], art: 'none', x: 450, y: 46, minor: true,
    blurb: 'NOT ON MAP.', info: 'FUN IS MANDATORY' },
];

/** Its land's index in LANDS, or -1 for the hub's. */
export const landIndex = (id: string) => LANDS.findIndex(l => l.id === id);

/** The brochure's numbers: every land's attractions, minor ones not counted, 1 up across the park in ring order. */
export const NUMBERS: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let n = 1;
  for (const l of LANDS) for (const a of ATTRACTIONS) if (a.land === l.id && !a.minor) out[a.id] = n++;
  return out;
})();

/** An obituary (the cast panel's, once he's dead): the dates (joke years), the notice, the in-lieu-of-flowers line. */
export interface Obit { dates: string; text: string; flowers: string }
export interface CastMember { land: string; name: string; role: string; piece: string; foot?: string;
  /** Dead: the obituary for his normal death and for his weakness death (store.ts bossDeath). */
  obit: { normal: Obit; weakness: Obit } }

/** KEY CAST MEMBERS: the brochure's features on each land's star. */
export const CAST: CastMember[] = [
  { land: 'adventure', name: 'SAFARI ARTIE', role: 'SKIPPER, JUNGLE CRUISE',
    piece: 'NOBODY KNOWS THE RIVERS OF HAPPY LAND LIKE SAFARI ARTIE! ARTIE HAS GUIDED GUESTS PAST HIPPOS, HEADHUNTERS AND THE FAMOUS BACKSIDE OF WATER FOR ELEVEN YEARS, WITH A JOKE FOR EVERY BEND (ALL 412 OF THEM, IN ORDER). A BORN SHOWMAN, A WHIZ WITH A BLOWGUN AND A PROUD NATURALIST, ARTIE SAYS HE CAN CALL ANY ANIMAL IN THE JUNGLE. THE TOUR IS MANDATORY. PLEASE STAY IN THE BOAT. ARTIE TAKES IT PERSONALLY.',
    obit: {
      normal: { dates: "1968 - LAST TUESDAY, ABOUT 4 PM",
        text: "SAFARI ARTIE, 54, DIED DOING WHAT HE LOVED: WHISTLING AT A RHINO. THE RHINO LOVED IT BACK, HORN FIRST, ALL THE WAY ACROSS THE CLEARING AND INTO THE TEMPLE WALL. THEY WERE FOUND FOLDED TOGETHER AND COULD NOT BE SEPARATED WITHOUT A SAW. HE IS SURVIVED BY 411 JOKES. THE 412TH WAS HIM.",
        flowers: "IN LIEU OF FLOWERS, DO NOT WHISTLE AT THE RHINOS. THEY ARE STILL HORNY." },
      weakness: { dates: "1968 - LUNCHTIME",
        text: "SAFARI ARTIE, 54, WAS EATEN ALIVE BY SOMETHING THAT CAME OUT OF A GUN. A LIFELONG NATURALIST, HE ALWAYS WANTED TO BE PART OF THE FOOD CHAIN. NOBODY ASKED. WHAT'S LEFT (THE SOCKS, THE BOOTS, THE HEART BOXERS, MOST OF THE TEETH) WILL BE BURIED AT SEA OFF THE BACK OF THE BOAT. THE JAW IS STILL TELLING JOKES.",
        flowers: "IN LIEU OF FLOWERS, PLEASE DON'T FEED THE ANIMALS. THEY'VE EATEN." },
    } },
  { land: 'spooky', name: 'DONNIE DRACULA', role: "HOST, DRACULA'S OTHER CASTLE",
    piece: "YOU'LL HEAR HIM BEFORE YOU SEE HIM! THE VOICE OF THE COUNT HOSTS EVERY TOUR OF DRACULA'S OTHER CASTLE LIVE FROM HIS BOOTH, WHERE HE KEEPS AN EYE ON EVERY GUEST, EVERY MINUTE, ON EVERY CAMERA. DONNIE BRINGS A REAL HUNGER TO THE ROLE (AND TO THE BUFFET). HIS LOOK IS 100% AUTHENTIC: THE TAG ON THE WIG PROVES IT. ASK HIM ABOUT HIS CAPE! HE HAS FRIENDS IN LOW PLACES.",
    obit: {
      normal: { dates: "1488 (HE SAYS) - 2026 (HE SHAT)",
        text: "DONNIE DRACULA, WHO NEVER MET A BUFFET HE COULDN'T FINISH, FINALLY FINISHED. HE KEELED OVER BACKWARDS ON THE DANCE FLOOR, FULL OF GUESTS, AND LAY THERE A MOMENT. THEN IT ALL CAME OUT AT ONCE, SO HARD IT LAUNCHED HIM INTO THE CEILING, WHERE HE REMAINS, WEDGED IN UP TO THE GUT. HIS LEGS KICKED FOR A WHILE. HE IS SURVIVED BY HIS WIG, WHICH FELL. HIS SOUL WAS ALREADY SPOKEN FOR.",
        flowers: "IN LIEU OF FLOWERS, THE BALLROOM NEEDS A MOP, A LADDER, AND A NEW CEILING. NOBODY WANTS TO PULL." },
      weakness: { dates: "1488 (HE SAYS) - A SUNDAY, FITTINGLY",
        text: "DONNIE DRACULA WAS STRUCK DOWN BY JESUS. A LITTLE GIFT-SHOP JESUS, FIRED OUT OF A LAUNCHER, BUT TECHNICALLY JESUS. HE CAUGHT FIRE, CALLED SATAN, GOT HIS VOICEMAIL, AND BURNED DOWN TO A PILE ABOUT THE SIZE OF A CAT BOX. THE WIG MADE IT. SO DID JESUS. NOBODY FROM THE PARK WILL ATTEND THE SERVICE. IT'S IN HELL.",
        flowers: "IN LIEU OF FLOWERS, PLEASE DO NOT VACUUM THE BALLROOM." },
    } },
  { land: 'space', name: 'THE QUEEN (LEGALLY DISTINCT)', role: 'STAR OF XENOSCARE · A "KEY" CAST MEMBER*',
    piece: "FRESH FROM NO PARTICULAR MOVIE, THE QUEEN IS FUTURE LAND'S MOST ORIGINAL CREATION, WITH EXACTLY ONE MORE JAW THAN ANYBODY YOU'RE THINKING OF. A MARVEL OF 1990S ANIMATRONICS (FOAM, LATEX, ZIP TIES), SHE'S A DEVOTED MOTHER, A TIRELESS PERFORMER AND A SURPRISINGLY GOOD DANCER. HER FANS AT THE GALACTIC GROOVE WOULD DO ANYTHING FOR HER. AND SHE FOR THEM. ASK ABOUT HER NEW LESS FATAL MODE!",
    foot: '*NOT AFFILIATED WITH ANY MOTION PICTURE, ITS SEQUELS, OR ITS LAWYERS.',
    obit: {
      normal: { dates: "MODEL YEAR 1994 - RECALLED 2026",
        text: "THE QUEEN (LEGALLY DISTINCT) CAUGHT FIRE ON THE DANCE FLOOR OF THE GALACTIC GROOVE WHEN HER MOTOR OIL, WHICH THE PARK SWORE COULDN'T BURN, BURNED. UNDER HER SKIN WAS A STEEL SKELETON NOBODY KNEW ABOUT, AND IT WAS MUCH SCARIER. IT LUNGED AT A GUEST, TRIPPED OVER ITS OWN FEET AND FELL APART. HER HANDLERS FLED OUT THE BACK SHAKING THEIR FISTS.",
        flowers: "IN LIEU OF FLOWERS, SEND A FIRE EXTINGUISHER. ONE THAT WORKS." },
      weakness: { dates: "MODEL YEAR 1994 - SOME ASSEMBLY REQUIRED",
        text: "THE QUEEN (LEGALLY DISTINCT) WAS HIT WITH A CARTOON MALLET SO HARD SHE IS NOW IN EVERY PART OF THE DISCO AT ONCE. HER ARMS ARE BY THE BAR. HER TAIL IS IN THE DJ BOOTH. HER HEAD IS UNDER THE MIRROR BALL, STILL TALKING. CREWS HAVE RECOVERED MOST OF HER, AND A FEW BOLTS THAT AREN'T HERS. THE SHOW RESUMES WHEN SOMEBODY FINDS THE INSTRUCTIONS.",
        flowers: "IN LIEU OF FLOWERS, IF YOU FIND A LEG, TAKE IT TO GUEST SERVICES." },
    } },
  { land: 'hollywood', name: 'STUNTMAN STEVE', role: 'STAR, THE STUPENDOUS STUNTERY',
    piece: "A REAL HOLLYWOOD STUNTMAN, FROM A REAL HOLLYWOOD MOVIE (ABOUT TWO SECONDS OF ONE. THAT'S HIS ELBOW). STEVE IS THE CROWN JEWEL OF HOLLYWOOD LAND, AND HE'S PERSONALLY TESTED EVERY RIDE HERE: THAT'S WHY HIS FACE IS ON ALL THE FLIERS. CARS! RAMPS! FIRE! STEVE DIRECTS THE ACTION HIMSELF FROM A SAFE, PROFESSIONAL DISTANCE. THE NECK BRACE IS RHINESTONE. NOBODY UPSTAGES STEVE. NOBODY.",
    obit: {
      normal: { dates: "1959 - HIS LAST STUNT (2 SECONDS)",
        text: "STUNTMAN STEVE DIED PERFORMING THE STEVE SIDESTEP, A STUNT WHERE A CAR MISSES STEVE. IT DID NOT. IT THREW HIM ONTO HIS OWN RING OF FIRE, WHERE HE HUNG OVER THE TOP LIKE A WET TOWEL UNTIL HIS PANTS BURNED OFF, AND THEN HIS RHINESTONE UNDERPANTS. THEN HE FELL OFF IT HEADFIRST, BARE ASS TO THE SKY, AND MISSED THE CRASH MAT BY ONE FOOT. HIS NECK BRACE LANDED ON IT. THE CROWD WENT OOOH AND GAVE IT TWO STARS.",
        flowers: "IN LIEU OF FLOWERS, DON'T TRY THIS AT HOME. HE DID IT AT WORK." },
      weakness: { dates: "1959 - STRUCK 2026",
        text: "STUNTMAN STEVE WAS STRUCK BY LIGHTNING INDOORS, WHICH HE INSISTED WAS A STUNT. HIS YELLOW CONDUCTIVE SUIT AND RHINESTONE NECK BRACE DID THE REST. HE STOOD THERE BURNT BLACK GIVING THE THUMBS-UP UNTIL THE APPLAUSE STOPPED, THEN FELL OVER AND BECAME AN ASHTRAY. IT WAS THE LONGEST HE WAS EVER ON SCREEN.",
        flowers: "IN LIEU OF FLOWERS, SEND A STANDING OVATION. HE CAN'T." },
    } },
  { land: 'foreign', name: 'HELICOPTER HARRY', role: 'PILOT, HELICOPTER RIDES ACROSS THE WORLD',
    piece: "HARRY BELIEVES EVERY CULTURE IS BEAUTIFUL, AND HE'LL TELL YOU SO FOR THE WHOLE FLIGHT. A GENTLE SOUL IN SOCKS AND SANDALS, HARRY HAS FLOWN OUR GUESTS OVER THE WORLD'S GREATEST LANDMARKS (ALL OF THEM, BIGGER) FOR TWENTY YEARS WITHOUT ONCE RAISING HIS VOICE. HE'S A PACIFIST. HE SAYS. THE HELICOPTER IS HIS WHOLE LIFE, SO PLEASE KEEP YOUR SEATBELT ON AND YOUR HANDS OFF HARRY.",
    obit: {
      normal: { dates: "1966 (WOODSTOCK, HE SAYS) - 2026",
        text: "HELICOPTER HARRY, A GENTLE PACIFIST, LOST A FIGHT, LOST HIS TEMPER, AND EMPTIED AN M60 INTO THE SKY, SCREAMING AT IT. THEN HE STOOD THERE, OUT OF BREATH, AND LOOKED UP. EVERY BULLET CAME BACK DOWN. ON HIM. HE WAS IDENTIFIED BY HIS SANDALS. THE UNDERWEAR WAS TIE-DYE, AND ALSO FULL OF HOLES. THE STATUE OF LIBERTY TOOK IT VERY HARD AND SHOT HERSELF.",
        flowers: "IN LIEU OF FLOWERS, PLEASE DO NOT FIRE GUNS INTO THE AIR. IT ALL COMES DOWN." },
      weakness: { dates: "1966 - SET IN CONCRETE, 2026",
        text: "HELICOPTER HARRY, A PILOT WHO GOT AIRSICK, DIED OF COMPLICATIONS FROM AIRSICKNESS, MAINLY THE STATUE OF LIBERTY PUKING A CEMENT TRUCK ON HIM. HE WAS LAID TO REST WHERE HE LAY, FACE DOWN, WITH JUST THE SOCKS AND SANDALS STICKING OUT. THEY KICKED FOR A WHILE. THEN IT SET. HE IS NOW PART OF THE AMERICA PAVILION, AHEAD OF SCHEDULE.",
        flowers: "IN LIEU OF FLOWERS, PLEASE TAKE YOUR PILLS." },
    } },
  { land: 'frontier', name: 'TUCKER', role: 'CONDUCTOR, LONESOME PINE RAILROAD',
    piece: "TICKETS, PLEASE! TUCKER HAS PUNCHED EVERY TICKET ON THE LONESOME PINE RAILROAD SINCE THE LINE OPENED, AND HE HAS NEVER LET ONE GUEST RIDE FREE. NOT ONCE. NOT EVER. A JOLLY OLD-TIME RAILROAD MAN WITH A WAXED MUSTACHE AND A HEART OF GOLD (HE KEEPS THE GOLD IN A STRONGBOX), TUCKER KEEPS IMMACULATE BOOKS AND IS FAMOUSLY HARD TO KEEP DOWN. GUESTS SAY HE COULD SURVIVE ANYTHING. SO FAR, HE HAS.",
    obit: {
      normal: { dates: "1849 - 2026 (FOR REAL THIS TIME)",
        text: "TUCKER, CONDUCTOR, DIED AGAIN. AFTER HIS FIRST DEATH HE JUMPED UP AND YELLED \"AAHHH!\", WHICH A GRIZZLY BEAR BEHIND HIM TOOK AS AN INVITATION. HE IS SURVIVED BY MOST OF HIS PARTS, NOW SPREAD ACROSS THE WOODS. THE BEAR IS SURVIVED BY ONE OF HIS LEGS. HIS TICKET PUNCH HAS BEEN RECOVERED. NOBODY RIDES FREE.",
        flowers: "IN LIEU OF FLOWERS, HAVE YOUR TICKET READY. HE'LL KNOW." },
      weakness: { dates: "1849 - 2026 (BOTH HALVES)",
        text: "TUCKER WAS TORN EXACTLY IN HALF BY TWO MOUNTAIN LIONS, WHO EACH WALKED OFF INTO THE TREES WITH THEIR SHARE. HE HAD BEEN SPLIT BEFORE (BY A TREE, DOWN TO THE NOSE) BUT NEVER THIS EVENLY. ALL THAT REMAINS AT THE SCENE IS HIS CAP. SERVICES WILL BE HELD IN TWO PLACES. THERE IS NOBODY LEFT TO PUNCH TICKETS. EVERYBODY RIDES FREE.",
        flowers: "IN LIEU OF FLOWERS, DO NOT BLEED NEAR THE WOODS." },
    } },
  { land: 'fantasy', name: 'PIPER THE PIXIE', role: 'THE GREAT PIXIE, FAIRY LAND',
    piece: "YOU'LL HEAR HER SWEET VOICE ALL OVER FAIRY LAND, CHEERING ON BRAVE SUITORS THROUGH THE THREE MAGICAL TRIALS FOR HER HAND! PIPER RARELY LEAVES HER CHAMBERS (SHE'S VERY BUSY BEING ENCHANTING), BUT THOSE WHO REACH HER DOOR SAY SHE'S LARGER THAN LIFE. HER WINGS ARE REAL. HER TIARA IS REAL. HER LOVE OF WATCHING HANDSOME MEN FIGHT OVER HER IS VERY, VERY REAL. KNOCK FIRST. SHE MEANS IT.",
    obit: {
      normal: { dates: "ONCE UPON A TIME - THE TOP OF THE ARC",
        text: "PIPER THE PIXIE LEFT US THROUGH THE ROOF. WEDGED IN HER OWN FLOOR BY THE WAIST, SHE WAS POPPED OUT BY A BURST WATER MAIN LIKE A CHAMPAGNE CORK, SHITTING ALL THE WAY UP. SHE CAME DOWN HEAD FIRST IN THE OVERFLOW LOT, A MILE AWAY, WHERE SHE IS STILL STANDING UPSIDE DOWN. THE WINGS, IT TURNS OUT, WERE DECORATIVE.",
        flowers: "IN LIEU OF FLOWERS, PLEASE MOVE YOUR CAR. SHE'S IN SPACE C-14." },
      weakness: { dates: "ONCE UPON A TIME - SIZE ZERO",
        text: "PIPER THE PIXIE FINALLY LOST THE WEIGHT. TWO BULLET HOLES DID WHAT NO DIET COULD: SHE FLEW AROUND THE ROOM FARTING LIKE A LET-GO BALLOON, LANDED A SUPERMODEL FOR ONE GLORIOUS SECOND, THEN KEPT GOING. WHAT'S LEFT IS A GOWN, A TIARA AND A LITTLE PILE OF DUST. SHE NEVER LOOKED BETTER. THE FAT IS STILL ON THE WALLS.",
        flowers: "IN LIEU OF FLOWERS, SEND A DUSTPAN AND A PAINT SCRAPER." },
    } },
  { land: 'cartoon', name: 'STUPID DAD', role: "VOICED, NOW PLAYED LIVE, BY HONK AZORIA",
    piece: "HONK AZORIA IS STUPID DAD! HONK WAS THE VOICE OF THE CARTOON (UBX, 1995, EIGHT WHOLE EPISODES), AND NOW HE PLAYS HIM LIVE AND IN THE FLESH: A LIVE-ACTION RECREATION OF THE SHOW, ON A FULL-SIZE COPY OF THE COUCH, WITH THE FAMILY BROUGHT TO LIFE BY ANIMATRONICS. FINALLY, A FACE TO THE VOICE! NO MAKEUP NEEDED: THE BELLY, THE BEER AND THE NOSE ARE ALL HIS OWN. BOY! GET HIM ANOTHER BEER! PLEASE DON'T INTERRUPT THE SHOW. HE HATES MISSING THE GAME.",
    obit: {
      normal: { dates: "1951 - HALFTIME",
        text: "HONK AZORIA, THE VOICE OF TV'S CARTOON STUPID DAD, WHO PLAYED HIM LIVE IN THE FLESH FIVE SHOWS A DAY, DIED THE FIRST TIME IN 30 YEARS HE GOT HIS OWN BEER. HE YANKED ON THE FRIDGE AND IT CAME DOWN ON TOP OF HIM, FLAT, JUST HIS HEAD AND HANDS STICKING OUT THE END. THE LAUGH TRACK PLAYED. HE SHIT HIMSELF UNDER THERE. HIS FAMILY ARE ROBOTS AND DID NOT GET HIM ONE EITHER.",
        flowers: "IN LIEU OF FLOWERS, SEND BEER. HE CAN'T REACH IT, BUT IT'S THE THOUGHT." },
      weakness: { dates: "1951 - CANCELED",
        text: "HONK AZORIA, THE VOICE OF TV'S CARTOON STUPID DAD AND, LIVE ON STAGE, THE BODY, WAS HIT BY A STUNT CAR ON HIS OWN SET, RIGHT AFTER FIVE OTHERS GOT HIS WIFE, BOTH KIDS, GRAMPS AND THE COUCH. HE WENT EVERYWHERE. HIS GUT LANDED BY THE TV. HIS LEG WAS FOUND IN THE THIRD ROW, SLIPPER STILL ON. HIS HEAD CAME DOWN ON ITS NECK, FACING THE AUDIENCE, AND DID NOT SAY A WORD, A FIRST. THE STUNTMAN WALKED AWAY WITH A THUMBS-UP. THE SHOW IS CANCELED AGAIN, THIS TIME FOR GOOD.",
        flowers: "IN LIEU OF FLOWERS, SEND A MOP AND SEVERAL BAGS." },
    } },
];

/** The attraction a zone's in (where he is, roughly), if any. */
export const attractionOfZone = (zone: string | null | undefined): Attraction | null =>
  (zone ? ATTRACTIONS.find(a => a.zones.includes(zone)) : null) ?? null;
