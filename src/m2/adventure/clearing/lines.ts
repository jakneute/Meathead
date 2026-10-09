// What's said in the clearing (and the fight with Safari Artie), by voice (recorded with the rest: tools/voices).
// Where somebody reacts to him, three ways: clean pants, shitty ones, naked.

export type Dressed = 'clean' | 'shitty' | 'nude';

/** Meathead, kicking the tree that's in his way. */
export const MEATHEAD_KICK = ['MOVE.', 'OUTTA MY WAY, TREE.', 'NATURE. ALWAYS IN THE WAY.'];
/** Safari Artie, found out up in his blind (in the dust off the roof: he got here first). */
export const ARTIE_FOUND: Record<Dressed, string[]> = {
  clean: ["...I WAS GONNA AMBUSH YOU. EMPLOYEE SHORTCUTS. YOU DON'T KNOW ABOUT THOSE.", "HOW'D I GET HERE FIRST? EMPLOYEE SHORTCUTS. NOW HOLD STILL."],
  shitty: ['...I WAS GONNA AMBUSH YOU. I COULD SMELL YOU COMING, BUT STILL.', "HOW'D I GET HERE FIRST? I FOLLOWED THE SMELL BACKWARDS."],
  nude: ['...I WAS GONNA AMBUSH YOU. THEN I SAW YOU COMING. ALL OF YOU.', "HOW'D I GET HERE FIRST? I DIDN'T STOP TO LOSE MY PANTS."],
};
/** Meathead, back at him. */
export const MEATHEAD_ARTIE = ['YOU KNOW YOUR BROTHER DIED LIKE THIS.', 'THIS IS GONNA BE THE BEST PART OF THE TOUR.', "LET'S GO, TOUR GUIDE."];

// ---- Safari Artie, in the fight (he never shuts up)

/** Down out of his blind, into the first bush. */
export const ARTIE_START = ['WELCOME TO THE INTERACTIVE PORTION OF THE TOUR!', 'PLEASE KEEP YOUR ARMS AND LEGS INSIDE THE BUSH AT ALL TIMES!', "LET'S PLAY A LITTLE GAME I LIKE TO CALL HIDE AND GUT!"];
/** The bush shuffle (the cups game). */
export const ARTIE_CUPS = [
  'KEEP YOUR EYE ON THE ARTIE!', 'WHICH BUSH? WHICH BUSH?', 'ROUND AND ROUND HE GOES!', 'THE HAND IS QUICKER THAN THE MEATHEAD!',
  'PICK A BUSH. ANY BUSH.', 'FOLLOW THE HAT! YOU CAN\'T SEE THE HAT!', 'I DO THIS FOR TIPS ON SLOW DAYS!',
];
/** The one bush left: hiding in it, trying (sheepishly) to get him over to it. */
export const ARTIE_LURE = [
  'PSST. OVER HERE. NOBODY IN THIS BUSH.', 'HEY. HEY, BUDDY. COME LOOK AT THIS BUSH.', "THERE'S, UH... FREE ICE CREAM IN HERE.",
  "THIS BUSH HAS AN EXTRA FAST PASS IN IT. I'M SERIOUS.", "I'M NOT IN HERE. COME CHECK.", '...CAW. CAW. I AM A BIRD.',
];
/** Out of the bush, and he's got him (gutting). */
export const ARTIE_GRAB = ['FIELD DRESSING!', 'HOLD STILL! THIS IS HOW WE CLEAN A CATCH!', "I'VE GUTTED BIGGER FISH THAN YOU! NOT MANY!"];
/** Out of the bush, and he's not near enough: the blowgun. */
export const ARTIE_DART = ['FROG POISON! THE FROG DIDN\'T NEED IT ANYMORE!', 'BLOWGUN! AUTHENTIC! I GOT IT AT THE GIFT SHOP!', 'FFFT! GOTCHA!'];
/** Shot out of his bush: knocked into the open, seeing stars. */
export const ARTIE_KNOCKED = ['OW! NO FAIR! YOU PICKED THE RIGHT BUSH!', 'THE BUSH WAS SUPPOSED TO PROTECT ME!', 'I SEE TOUCANS...', 'THAT WAS MY SPECIAL BUSH!'];
/** The mating whistle: here come the animals. */
export const ARTIE_WHISTLE = [
  'HERE, BIG FELLA! ARTIE\'S IN SEASON!', 'THIS WHISTLE MEANS "I\'M READY TO BREED." IN HIPPO.', 'COME TO DADDY, MY LOVELIES!',
  'THAT CALL WORKS ON ELEPHANTS. AND ONE GUY IN ACCOUNTING.', 'SOUND THE MATING CALL!',
];
/** An animal comes at him: out of its way. */
export const ARTIE_DODGE = ['OLE!', 'MISSED ME, BIG FELLA!', 'TWENTY YEARS OF TOURS! YOU LEARN TO JUMP!', 'NOT TODAY, SWEETHEART!'];
/** The spawner's things on him, enough of them: he's lost it. */
export const ARTIE_AGITATED = ["GET 'EM OFF! GET 'EM OFF!", "THEY'RE IN MY SHORTS! THEY'RE IN MY SHORTS!", "WHAT ARE THESE?! THEY'RE NOT IN THE BROCHURE!"];
/** Flattened: up a vine, and staying up it. */
export const ARTIE_PERCH = ["NOBODY TRAMPLES ARTIE TWICE!", "I'M STAYING UP HERE! I'VE GOT A VINE AND A DREAM!", "FINE! I'LL GIVE THE TOUR FROM UP HERE!", 'TREE HOUSE RULES! NO MEATHEADS!'];
/** His vine chewed through under his hands: down he comes. */
export const ARTIE_VINE_SNAP = ['THEY CHEWED THROUGH MY VINE!', 'THAT VINE WAS LOAD-BEARING!', 'WHO EATS A VINE?!'];
/** Too busy with them to get out of the way: an animal right through him. */
export const ARTIE_TRAMPLED = ['NOT MY HIPS!', 'BAD HIPPO! BAD!', "I'VE BEEN MATED WITH!"];
/** A bush eaten. */
export const ARTIE_BUSH = ['MY BUSH! THEY ATE MY BUSH!', 'THAT BUSH WAS LANDSCAPED!', 'DO YOU KNOW WHAT A BUSH COSTS IN THIS PARK?!'];
/** No bushes left. */
export const ARTIE_NO_BUSHES = ['FINE! NO MORE GAMES! STAMPEDE!', 'NO BUSHES, NO PROBLEM! EVERYBODY STAMPEDE!'];
/** Beaten (any old way): his last words, face down in the dirt. */
export const ARTIE_DIES = ['THIS CONCLUDES... THE TOUR...', 'PLEASE EXIT... THROUGH THE GIFT SHOP...'];
/** Beaten by his weakness: eaten alive. */
export const ARTIE_EATEN = ["THEY'RE EATING MY EVERYTHING!", 'NOT THE BUCK TEETH! THOSE ARE ORIGINAL!'];
/** ...still going, while they're at it (his arm off, his guts out). */
export const ARTIE_EATEN_MORE = ['MY ARM! THAT WAS MY TIPPING ARM!', "THOSE ARE MY GUTS! THEY'RE NOT A CHEW TOY!", "I'M GONNA NEED A BIGGER FIRST AID KIT!", "I CAN SEE MY OWN RIBS! THAT'S NOT IN THE BROCHURE!"];
/** ...and a skeleton, the jaw still going, till it all comes down. */
export const ARTIE_BONES = ["AND ON YOUR LEFT... WHAT'S LEFT OF ME...", 'THIS CONCLUDES... THE SKELETON TOUR...', "I'M NOT DEAD... I'M ON BREAK..."];

/** Meathead, after. */
export const MEATHEAD_WON = ['TOUR OVER.', 'FIVE STARS. WOULD NOT RECOMMEND.', 'TIP YOUR GUIDE.'];
/** ...after his little friends ate him. */
export const MEATHEAD_EATEN = ['BON APPETIT, BOYS.', 'CLEAN YOUR PLATES.', 'NO TIP.'];

// ---- What he says when each of Artie's things hurts him, and the death screen

export const HURT_KNIFE = ["HE'S GUTTING ME LIKE A FISH!", "THAT'S MY GOOD KIDNEY!", 'NOT THE ABS! NOT THE ABS!'];
export const DEATH_KNIFE = ['FIELD DRESSED', 'GUTTED LIKE A TROUT'];
export const HURT_BLOWDART = ['BLOW DART! IN MY NECK!', 'WHAT WAS ON THAT THING?!', 'OW! HE SPIT THAT AT ME!'];
export const DEATH_BLOWDART = ['KILLED BY A STRAW', 'DARTED'];
export const HURT_POISON = ["I DON'T FEEL SO GOOD...", 'MY GUTS ARE BURNING!', "OH NO. IT'S COMING UP."];
export const DEATH_POISON = ['PUKED TO DEATH', 'TOSSED HIS COOKIES. AND HIS LIFE.'];
export const HURT_RHINO = ['RHINO! RIGHT IN THE TAINT!', 'THAT HORN WENT PLACES!', 'WHO WHISTLES FOR A RHINO?!'];
export const DEATH_RHINO = ['HORNED', "RHINO'D"];
export const HURT_HIPPO = ["THAT HIPPO'S FASTER THAN IT LOOKS!", 'HIPPO BUTT! ALL OVER ME!', 'GET OFF ME, YOU FAT RIVER PIG!'];
export const DEATH_HIPPO = ['RUN DOWN BY A HIPPO', "HIPPO'D"];
export const HURT_ELEPHANT = ['THE WHOLE ELEPHANT! THE WHOLE THING!', 'STOMPED BY DUMBO!', 'PEANUTS! I GOT PEANUTS! NOT ME!'];
export const DEATH_ELEPHANT = ['STEPPED ON', 'FLATTENED BY AN ELEPHANT'];

const all = (r: Record<Dressed, string[]>) => [...r.clean, ...r.shitty, ...r.nude];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...MEATHEAD_KICK, ...MEATHEAD_ARTIE, ...MEATHEAD_WON, ...MEATHEAD_EATEN,
    ...HURT_KNIFE, ...HURT_BLOWDART, ...HURT_POISON, ...HURT_RHINO, ...HURT_HIPPO, ...HURT_ELEPHANT,
  ],
  death: [...DEATH_KNIFE, ...DEATH_BLOWDART, ...DEATH_POISON, ...DEATH_RHINO, ...DEATH_HIPPO, ...DEATH_ELEPHANT],
  'm2.safari': [
    ...all(ARTIE_FOUND), ...ARTIE_START, ...ARTIE_CUPS, ...ARTIE_LURE, ...ARTIE_GRAB, ...ARTIE_DART, ...ARTIE_KNOCKED, ...ARTIE_WHISTLE, ...ARTIE_DODGE,
    ...ARTIE_AGITATED, ...ARTIE_PERCH, ...ARTIE_VINE_SNAP, ...ARTIE_TRAMPLED, ...ARTIE_BUSH, ...ARTIE_NO_BUSHES, ...ARTIE_DIES,
    ...ARTIE_EATEN, ...ARTIE_EATEN_MORE, ...ARTIE_BONES,
  ],
};
