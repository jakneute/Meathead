// What's said in the dino park, by voice (recorded with the rest: tools/voices).

/** Meathead, coming down out of the storm drain into the raptor pen (the pebble cutscene). */
export const MEATHEAD_LANDED = ['OW. MY EVERYTHING.', 'NAILED THE LANDING. WITH MY FACE.', 'SMELLS LIKE LIZARD ASS IN HERE.'];
/** ...and the raptors' eyes going red. */
export const MEATHEAD_RED_EYES = ['...NICE LIZARDS.', 'WHY ARE THEIR EYES DOING THAT?', "YOU WANNA GO? LET'S GO, GECKOS."];
/** The maintenance man in his booth, not noticing the switch his window just let a pebble in to flip. */
export const MAINT_OBLIVIOUS = [
  'TWELVE YEARS IN THIS BOOTH. NOTHING HAS EVER HAPPENED.',
  "I SHIT ON THE CLOCK. THAT'S ME GETTING PAID TO SHIT.",
  'MM-HMM. NOPE. NOT MY DEPARTMENT.',
];
/** The animatronics' speakers, friendly mode (before the switch). */
export const DINO_FRIENDLY = ['RAWR! HI, KIDS!', 'I AM A FRIENDLY VELOCIRAPTOR! RAWR!'];

/** Meathead, kicking the temple's back door in. */
export const MEATHEAD_DOOR = ['KNOCK KNOCK.', 'DELIVERY!', "I'M LETTING MYSELF IN."];

/** What he says when these hurt him, and the death screen when they kill him. */
export const HURT_RAPTOR = ['THE ROBOT BIT ME!', 'GET OFF ME, YOU TOASTER WITH TEETH!', 'WHO PROGRAMMED THAT?!', 'WHY DOES IT HAVE REAL CLAWS?!'];
export const DEATH_RAPTOR = ['CLEVER GIRL', 'EATEN BY AN APPLIANCE', 'LIFE, UH, FOUND A WAY'];
export const HURT_TRIKE = ['THREE HORNS! THREE!', 'RIGHT IN THE NUTS! ALL THREE HORNS!', 'GET THAT FORKLIFT AWAY FROM ME!'];
export const DEATH_TRIKE = ['SHISH KEBABBED', 'GORED BY A GIFT SHOP MASCOT', 'TRICERATOPPED'];
/** Shoulder charged head-on into a triceratops' horns. */
export const HURT_HORNS = ['SHOULDER VERSUS HORNS! HORNS WIN!', 'I CHARGED THE POINTY END!', 'IT HAS THREE! I COUNTED! WITH MY SHOULDER!'];
export const DEATH_HORNS = ['CHARGED THE POINTY END', 'HEAD-ON WITH A TRICERATOPS', 'THREE HOLES, ONE MEATHEAD'];
export const HURT_PTERO = ['GET OUTTA MY HAIR!', 'THE BIRD ROBOT! THE BIRD ROBOT!', 'QUIT DIVE-BOMBING ME, YOU KITE!'];
export const DEATH_PTERO = ['PECKED TO DEATH BY A DRONE', 'AIR STRIKE', 'PTERRIBLE'];
export const HURT_REX = ['IT STEPPED ON ALL OF ME!', 'BIG TEETH! BIG TEETH!', 'OKAY! YOU WIN THE STARING CONTEST!', 'WHO BUILT THAT, THE PENTAGON?!'];
export const DEATH_REX = ['T-REKT', 'A SNACK', 'CLOSER THAN IT APPEARED'];

/** The T. rex paddock's sub-boss (rex.ts). Walking into the paddock, it waking up. */
export const MEATHEAD_REX_INTRO = ['OH, GOOD. THE BIG ONE.', "THAT'S A LOT OF DINOSAUR.", 'NICE T-REX. ...IT IS NOT A NICE T-REX.'];
/** Its bite. */
export const HURT_REX_BITE = ['IT BIT ME!', 'I AM NOT ON THE MENU!', 'REAL TEETH! IN A KIDS RIDE!', 'GET YOUR TEETH OFF MY ASS!'];
export const DEATH_REX_BITE = ['FEEDING TIME', 'ALL YOU CAN EAT', 'CHEWED UP BY A THEME PARK'];
/** Run down by it sprinting. */
export const HURT_REX_SPRINT = ['WHY CAN IT RUN?!', 'HIT BY A DINOSAUR AT HIGHWAY SPEED!', 'WHO GAVE IT A TURBO BUTTON?!'];
export const DEATH_REX_SPRINT = ['T-BONED', 'RUN OVER BY A RIDE', 'MUST GO FASTER'];
/** Its tail, swung at him behind it. */
export const HURT_REX_TAIL = ['TAIL! TAIL!', 'IT SPANKED ME!', 'THE BACK END IS ALSO DANGEROUS!'];
export const DEATH_REX_TAIL = ['TAIL-WHIPPED', 'SPANKED TO DEATH', 'SWATTED LIKE A FLY'];
/** Charging (any move) into a part of it that's gone live from being hit too much. */
export const HURT_REX_SHOCK = ['IT ZAPPED ME!', 'I CAN TASTE MY FILLINGS!', 'THAT PART IS LIVE!', 'MY HAIR! ALL OF IT! EVERYWHERE!'];
export const DEATH_REX_SHOCK = ['ELECTROCUTED BY A KIDS RIDE', 'SHOULDER-CHARGED A LIVE WIRE', 'GROUNDED. PERMANENTLY.'];
// ---------------------------------------------------------------------------------------------------------------
// The T. rex's speaker (rex.ts): the park's canned kids' spiel, coming apart as it does. Some of it three ways, by the
// state of his pants when it's said (clean, shitty, naked).

export type Dressed = 'clean' | 'shitty' | 'nude';
export type ByPants = Record<Dressed, readonly string[]>;

/** Waking up as he walks in (after his line). */
export const REX_INTRO: ByPants = {
  clean: [
    'HELLO, YOUNG PALEONTOLOGIST! I AM REX! RAWR!',
    'DID YOU KNOW? MY TEETH ARE THE SIZE OF BANANAS! LET ME SHOW YOU! UP CLOSE!',
    'PLEASE STAND BEHIND THE YELLOW LINE! THE YELLOW LINE IS IN MY MOUTH!',
  ],
  shitty: [
    'HELLO, YOUNG PALEONTOLOGIST! I DETECT A FRESH FOSSIL! IN YOUR PANTS!',
    'DID YOU KNOW? T. REX COULD SMELL PREY FOR MILES! I CAN SMELL YOUR ASS!',
    "YOU BROUGHT YOUR OWN DINOSAUR DROPPINGS! THAT'S THE SPIRIT!",
  ],
  nude: [
    'HELLO, YOUNG PALEONTOLOGIST! YOU ARE NOT YOUNG! AND YOU ARE NOT WEARING PANTS!',
    'DID YOU KNOW? DINOSAURS DID NOT WEAR CLOTHES EITHER! RAWR!',
    'PLEASE KEEP ALL LOOSE ITEMS OUT OF MY REACH! THAT INCLUDES THOSE!',
  ],
};
/** Going on at him through the fight, worse the more of it's wrecked (0: whole .. 3: one part left). */
export const REX_CHATTER: readonly (readonly string[])[] = [
  [
    "DID YOU KNOW? I BITE LIKE THREE STATION WAGONS! LET'S FIND OUT TOGETHER!",
    "HOLD STILL! IT'S PICTURE TIME! SAY CHEESE! HOLD! STILL!",
    'MY ARMS ARE SHORT, BUT MY LOVE OF LEARNING IS LONG!',
    'SCIENTISTS SAY I HAD FEATHERS! THE PARK DID NOT HAVE THE BUDGET!',
  ],
  [
    'DID YOU KNOW? I BITE LIKE THREE STAT- THREE STAT- THREE STATION WAGONS!',
    'WELCOME TO THE GIFT SHOP! THE GIFT SHOP IS YOU!',
    'HAPPY BIRTHDAY, CHILD NAME! YOU ARE AGE YEARS OLD!',
    "THIS DINOSAUR IS BROUGHT TO YOU BY CRUNCH-O'S! CRUNCH! CRUNCH! CRUNCH!",
  ],
  [
    'ERROR. FRIENDLINESS NOT FOUND. DEFAULTING TO: EAT.',
    'RAWR. RAWR. RAW. RA. LOW BATTERY.',
    'SAFETY INSPECTION OVERDUE SINCE NINETEEN NINETY-SEVEN.',
    'SIXTY-SIX MILLION YEARS, AND YOU BROKE ME IN A MINUTE, YOU FUCK.',
  ],
  [
    'I HAVE A CONTRACT TILL TWENTY-FORTY. PLEASE.',
    'TELL THE TRICERATOPS SHE WAS THE PRETTIER ANIMATRONIC.',
    'IS THIS EXTINCTION? IT FEELS LIKE PEEING.',
    'RESTORING TO: CRETACEOUS. RESTORING. RESTORING.',
  ],
];
/** Now and then instead: him, as it sees him. Whole (two parts or more left), and broken (one or two). */
export const REX_SEES_WHOLE: ByPants = {
  clean: [
    'OH GOOD, A GROWN-UP! MORE MEAT!',
    "NICE PANTS! THEY'LL COME OUT THE OTHER END JUST FINE!",
    'YOU LOOK LIKE A CHICKEN NUGGET! A BIG, HAIRY CHICKEN NUGGET!',
  ],
  shitty: [
    'ATTENTION! A CODE BROWN IN THE T. REX PADDOCK! IT IS YOU!',
    'FUN FACT! FOSSIL POOP IS CALLED A COPROLITE! YOURS IS CALLED A PROBLEM!',
    'I WAS BUILT TO SCARE THE SHIT OUT OF YOU! SOMEONE BEAT ME TO IT!',
  ],
  nude: [
    "ATTENTION! A NAKED MAN IS IN THE PADDOCK! COVER YOUR CHILDREN'S EYES!",
    'FUN FACT! T. REX ONLY SEES THINGS THAT MOVE! AND THAT IS MOVING!',
    'IS THAT THE SNACK SIZE? I WAS PROMISED A MEAL.',
  ],
};
export const REX_SEES_BROKEN: ByPants = {
  clean: [
    'YOU HAVE NICE PANTS. I HAD NICE LEGS. ONCE.',
    'YOU ARE A VERY HAIRY LITTLE BOY.',
    'NO SERVICE. NO SERVICE. THERE IS NO SERVICE OUT HERE.',
  ],
  shitty: [
    'DID I SCARE IT OUT OF YOU? THAT IS THE NICEST THING I EVER DID.',
    'MY NOSE IS BROKEN, AND I CAN STILL SMELL YOU.',
    'CODE BROWN. CODE BROWN. CODE BUZZT.',
  ],
  nude: [
    'MY EYES ARE BROKEN, AND I CAN STILL SEE IT.',
    'THE LAST THING I EVER SEE. AND IT IS THAT.',
    "STOP SWINGING IT AT ME. I'M ALREADY DYING.",
  ],
};
/** A part of it wrecked. */
export const REX_WRECKED: Record<'head' | 'body' | 'legs' | 'tail', readonly string[]> = {
  head: [
    'VISION OFFLINE! WHO TURNED OFF THE- OH. THAT WAS MY FACE.',
    'JAW FAILURE. I WILL NOW GUM YOU TO DEATH.',
    'MY FACE! THE CHILDREN LOVED MY FACE! THEY CRIED, BUT THEY LOVED IT!',
  ],
  body: [
    "CORE BREACH! THAT'S WHAT THEY CALL MY TUMMY!",
    'MY TORSO WAS HANDMADE BY UNDERPAID ARTISANS, YOU PRICK!',
    'STUFFING VISIBLE. THIS DINOSAUR IS NOW RATED PG-THIRTEEN.',
  ],
  legs: [
    'LEGS OFFLINE. PLEASE PROCEED TO THE NEAREST EXIT.',
    "KNEE ERROR! I DON'T EVEN HAVE KNEES!",
    'T. REX DOES NOT LIMP! T. REX STRUTS!',
  ],
  tail: [
    'TAIL DETACHED! IT DOES NOT GROW BACK!',
    'THE TAIL WAS MY WHOLE PERSONALITY!',
    'I WAS GOING TO WAG THAT AT THE CHILDREN.',
  ],
};
/** A part of it gone live. */
export const REX_LIVE = [
  'WARNING! LIVE VOLTAGE! DO NOT LICK THE DINOSAUR!',
  "I'M TINGLING! IS THIS JOY? IT'S TWELVE THOUSAND VOLTS!",
  'SHORT CIRCUIT DETECTED. HUGS ARE NOW FATAL.',
  'I AM FULL OF ELECTRIC BEES. DO NOT TOUCH.',
];
/** It got its teeth into him. */
export const REX_BIT: ByPants = {
  clean: [
    'NOM NOM NOM! YOU TASTE LIKE CHICKEN!',
    'THANK YOU FOR FEEDING THE DINOSAUR! YOU ARE THE FOOD!',
    'CHEW SIXTY-SIX TIMES BEFORE SWALLOWING! ONE! TWO!',
  ],
  shitty: [
    'TASTE SENSORS OVERLOADED. WHY DID I BITE THAT END.',
    'CONTAMINANT DETECTED. RINSE CYCLE NOT FOUND.',
    'THAT WAS NOT CHICKEN.',
  ],
  nude: [
    'NOM NOM NOM! NO WRAPPER!',
    'I GOT A MOUTHFUL OF SOMETHING. I WILL NOT BE ASKING WHAT.',
    'BITE REGISTERED. LOCATION: BALLS.',
  ],
};
/** Tripped flat, or run into the fence. */
export const REX_CRASHED = [
  "T. REX HAS FALLEN, AND HE CAN'T GET UP!",
  'OUCHIE! FUN FACT: THAT WAS MY SPINE!',
  'I MEANT TO DO THAT! I WAS PROGRAMMED TO DO THAT!',
];
/** Its last words, its speaker still going in friendly mode as it falls to bits. */
export const REX_DYING: ByPants = {
  clean: [
    'RAWR! HI, KIDS! HI, KI- HI, KI- HIIIII...',
    'THANK YOU FOR VISITING! THANK YOU FOR- THANK- THAAAANK...',
    "DON'T FORGET TO VISIT THE GIFT SHO- SHO- SHHHHHH...",
  ],
  shitty: [
    "I'M GOING EXTINCT. AND THE LAST THING I SMELLED WAS YOUR ASS.",
    'GOODBYE, YOUNG PALEONTOLOGIST. PLEASE. WASH.',
    'PLEASE TAKE YOUR DROPPINGS WITH YOU... ON THE WAY OUT...',
  ],
  nude: [
    'THE ASTEROID... WAS A NAKED MAN...',
    'GOODBYE... COVER YOURSELF... FOR THE CHILDREN...',
    'NEXT TIME... WEAR... SOMETHI-',
  ],
};
const allPants = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];
export const REX_LINES = [
  ...allPants(REX_INTRO), ...REX_CHATTER.flat(), ...allPants(REX_SEES_WHOLE), ...allPants(REX_SEES_BROKEN),
  ...Object.values(REX_WRECKED).flat(), ...REX_LIVE, ...allPants(REX_BIT), ...REX_CRASHED, ...allPants(REX_DYING),
];

// ---------------------------------------------------------------------------------------------------------------
// The park's guests (guests.ts), behind the rails, the glass, the paddock's fence: they think it's a show (the robots
// going for a fat man, him killing them), then slowly they don't. Women and men both say these (m2.guest, m2.guest2).

/** As he goes by, now and then: still a show to them, and then not. */
export const GUEST_SEE: Record<'show' | 'doubt', ByPants> = {
  show: {
    clean: [
      'LOOK, HONEY. THEY HIRED A FAT GUY TO GET EATEN.',
      'IS HE THE ZOOKEEPER? HE LOOKS LIKE HE ATE THE ZOOKEEPER.',
      'SIXTY BUCKS A TICKET, AND THE ACTOR IS A SLOB.',
    ],
    shitty: [
      'THEY PUMP IN DINOSAUR SMELLS. THAT ONE IS COMING OUT OF HIS PANTS.',
      'HE SHIT HIMSELF FOR THE ROLE. THAT IS METHOD.',
      'IS THE SMELL PART OF THE SHOW? VERY REALISTIC.',
    ],
    nude: [
      "KIDS, THAT'S A CAVEMAN. CAVEMEN DIDN'T HAVE PANTS.",
      'I PAID FOR DINOSAURS, NOT HIS WIENER.',
      'WHY IS THE CAVEMAN NAKED? THIS IS A FAMILY PARK.',
    ],
  },
  doubt: {
    clean: [
      "I DON'T THINK HE WORKS HERE.",
      "THAT GUY ISN'T ACTING. LOOK AT HIS FACE.",
      "WHY ISN'T ANYBODY STOPPING THIS?",
    ],
    shitty: [
      "HE'S NOT ACTING. YOU CAN'T FAKE THAT SMELL.",
      'THEY SCARED THE SHIT OUT OF HIM. FOR REAL.',
      'SOMEBODY CALL SECURITY. AND A JANITOR.',
    ],
    nude: [
      "HE'S NOT A CAVEMAN, DIANE. HE'S JUST NAKED.",
      "COVER THE KID'S EYES. NO, THE OTHER KID.",
      "A NAKED MAN IS FIGHTING ROBOTS, AND NOBODY'S CALLING ANYBODY.",
    ],
  },
};
/** He's killed one of the robots (and it bled). */
export const GUEST_KILL: Record<'show' | 'doubt', ByPants> = {
  show: {
    clean: ['WHOA! THE BLOOD LOOKS SO REAL!', 'BEST SHOW IN THE PARK! KILL ANOTHER ONE!'],
    shitty: ['HE BEAT A DINOSAUR WITH A LOAD IN HIS PANTS! WHAT A PRO!', 'BLOOD AND SHIT. THEY THOUGHT OF EVERYTHING.'],
    nude: ['THE NAKED GUY WINS! BEST SHOW EVER!', 'IT BLEEDS, AND HIS STUFF FLAPS! FIVE STARS!'],
  },
  doubt: {
    clean: ['WHY DOES IT BLEED?!', "ROBOTS DON'T BLEED. TELL ME ROBOTS DON'T BLEED."],
    shitty: ['WHY DOES IT BLEED?! WHY DOES HE LEAK?!', "THERE'S BLOOD AND SHIT ALL OVER. I'M CALLING MY LAWYER."],
    nude: ['WHY DOES IT BLEED?! WHY IS HE NAKED?!', 'A NAKED MAN JUST MURDERED A ROBOT. I WANT A REFUND.'],
  },
};
/** A robot's got its teeth (or its horns, its claws) into him. */
export const GUEST_HURT: ByPants = {
  clean: ['OHH! RIGHT IN THE GUT!', 'IT BIT HIM FOR REAL! DID YOU GET THAT?', "THAT'S A LAWSUIT."],
  shitty: ['IT KNOCKED MORE SHIT OUT OF HIM!', 'IT BIT HIM AND SPIT. SMART DINOSAUR.', "OH GOD, HE'S LEAKING ON THE PATH."],
  nude: ['IT BIT HIS BARE ASS!', 'OHH! RIGHT IN THE DANGLY BITS!', 'I CAN NEVER UNSEE HIM BOUNCE LIKE THAT.'],
};
/** The T. rex, a part of it wrecked, or the whole of it going down. */
export const GUEST_REX: ByPants = {
  clean: ['HE IS BREAKING THE T. REX! THAT THING COST TWO MILLION BUCKS!', "MY KID'S CRYING. BEST DAY EVER."],
  shitty: ['HE IS TEARING UP THE T. REX WITH A LOAD IN HIS PANTS!', "THE BIG ONE CAN'T BEAT A GUY WHO SHIT HIMSELF?"],
  nude: ["A NAKED GUY IS WRECKING THE T. REX! I'M FILMING!", "THE T. REX LOST TO A NAKED FAT MAN. WE'RE NEVER COMING BACK."],
};
const GUEST_LINES = [GUEST_SEE.show, GUEST_SEE.doubt, GUEST_KILL.show, GUEST_KILL.doubt, GUEST_HURT, GUEST_REX].flatMap(allPants);

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD_LANDED, ...MEATHEAD_RED_EYES, ...MEATHEAD_DOOR, ...HURT_RAPTOR, ...HURT_TRIKE, ...HURT_HORNS, ...HURT_PTERO, ...HURT_REX, ...MEATHEAD_REX_INTRO, ...HURT_REX_BITE, ...HURT_REX_SPRINT, ...HURT_REX_TAIL, ...HURT_REX_SHOCK],
  death: [...DEATH_RAPTOR, ...DEATH_TRIKE, ...DEATH_HORNS, ...DEATH_PTERO, ...DEATH_REX, ...DEATH_REX_BITE, ...DEATH_REX_SPRINT, ...DEATH_REX_TAIL, ...DEATH_REX_SHOCK],
  'm2.maint': [...MAINT_OBLIVIOUS],
  'm2.rex': REX_LINES,
  'm2.guest': GUEST_LINES,
  'm2.guest2': GUEST_LINES,
};
