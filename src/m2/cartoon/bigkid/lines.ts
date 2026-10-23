// What's said among the big-kid rides (THE BIG-KID ZONE), by voice (cartoon/voices.ts gathers it; tools/voices records
// it). In the user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine (no line
// twice within 45 s). Meathead's lines and everybody reacting to him in clean / shitty / naked pools.
//
// The user's: "meathead still refuses to ride them because he is prejudiced against rides that don't have a track. he
// thinks those rides are for 'pussies'." And (the user, later): he's above them "because 'they don't go high'". Every
// ride gets its own lament, and LOWRIDE is the running sneer. STUPID
// DAD (a failed mid-90s show, its posters everywhere): he's never heard of it. Never anything about his age (it stays
// ambiguous). Pure data.

import { allOf, type ByPants, type HurtTable } from '../talk';

/** The zone's cast's voices (cast.json): a man's and a woman's each; the costume heads muffle theirs. The talking
 *  Stupid Dad doll (a pull-string recording of the show's star). */
export const CAST_VOICES = {
  rideop: 'm2.cartoon.rideop', rideopf: 'm2.cartoon.rideopf',
  skate: 'm2.cartoon.skate', skatef: 'm2.cartoon.skatef',
  gloppy: 'm2.cartoon.gloppy', gloppyf: 'm2.cartoon.gloppyf',
  flea: 'm2.cartoon.flea', fleaf: 'm2.cartoon.fleaf',
  churro: 'm2.cartoon.churro', churrof: 'm2.cartoon.churrof',
  doll: 'm2.cartoon.daddoll',
} as const;

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Out the White House's stage door, into the zone. */
export const ARRIVE: ByPants = {
  clean: ['THE BIG-KID ZONE. FINALLY. WAIT. NONE OF THESE LEAVE THE GROUND.', 'BIG-KID RIDES. NOW WE TALK. OH. THEY GO TWO FEET UP. FUCK.'],
  shitty: ['THE BIG-KID ZONE. I BROUGHT MY OWN THRILL. IT\'S IN MY PANTS.', 'BIG-KID RIDES. NOT ONE OF THEM TALLER THAN MY SMELL.'],
  nude: ["THE BIG-KID ZONE. NAKED. SECURITY'S GONNA EARN THEIR FOUR TWENTY-FIVE.", 'NONE OF THESE GO HIGHER THAN MY NUTS. AND MY NUTS HANG LOW.'],
};
/** Back on a later visit. */
export const REVISIT: ByPants = {
  clean: ['THE PUSSY RIDES AGAIN.', 'BIG-KID ZONE. STILL NOTHING OVER FOUR FEET.'],
  shitty: ['BACK WITH THE PUSSY RIDES. AND THE PANTS.', 'THE ZONE AGAIN. IT SMELLS LIKE CHURROS AND MY ASS.'],
  nude: ['THE ZONE AGAIN. STILL NAKED. STILL ALL ANKLE-HIGH.', 'BACK. NAKED. EVEN THE COUCH LOOKS EMBARRASSED.'],
};

/**
 * The running sneer: they don't go high, so no respect (the user's "pussies"). Said now and then when a ride lines up
 * on him.
 */
export const LOWRIDE: ByPants = {
  clean: [
    "IT DOESN'T EVEN GO UP. THAT'S FOR PUSSIES.",
    'A BIG-KID RIDE. FOUR FEET UP. MY BARSTOOL GOES HIGHER.',
    "YOU CAN'T EVEN FALL OFF IT. WHAT'S THE POINT?",
    "IF I CAN SEE OVER IT, IT'S NOT A RIDE.",
    'NO DROP. NO HILL. NO BALLS.',
    'I PISS HIGHER THAN THAT THING GOES.',
  ],
  shitty: [
    "IT DOESN'T GO HIGH. I'M NOT SHITTING MYSELF ON A PUSSY RIDE.",
    "I ALREADY SHAT MYSELF. NOT FOR THAT. THAT'S FOR PUSSIES.",
    'NO DROP, NO THRILL. MY PANTS ONLY SHIT FROM UP HIGH.',
  ],
  nude: [
    "IT DOESN'T GO UP. NOTHING ON ME DOES EITHER. IT'S COLD.",
    "I'M NAKED AND STILL TOO MUCH MAN FOR A RIDE THAT LOW.",
    'THAT RIDE TOPS OUT AT MY BALLS.',
  ],
};

/** Things he's got to say passing them (once each a visit). */
export const GAGS: Record<'posters' | 'graffiti' | 'couch' | 'broke' | 'shop' | 'doll' | 'slime' | 'tower' | 'bumper' | 'memorial' | 'whirl' | 'pod' | 'halfpipe' | 'billboard' | 'exit', ByPants> = {
  /** The first DAD MAN poster: he's never heard of it. */
  posters: {
    clean: ['DAD MAN. NEVER HEARD OF IT.', 'WHO THE HELL IS DAD MAN? WHY IS HE ON EVERY WALL?', "AMERICA'S NEW FAVORITE FAMILY. NEVER SEEN THEM."],
    shitty: ['DAD MAN. HE LOOKS LIKE HE SHITS HIMSELF IN A RECLINER.', 'DAD MAN. NEVER HEARD OF HIM. HE SMELLS LIKE ME, I BET.'],
    nude: ['DAD MAN. AT LEAST HE WEARS UNDERWEAR.', "WHO'S DAD MAN? HE'S GOT MORE CLOTHES THAN ME. AND A BEER."],
  },
  /** The graffitied poster (a mustache, SUCKS). */
  graffiti: {
    clean: ['SOMEBODY WROTE SUCKS ON IT. FINALLY, A REVIEW.', 'THE ONE GUY WHO WATCHED IT DREW A MUSTACHE ON HIM.'],
    shitty: ["DAD MAN SUCKS. SO DO MY PANTS. WE'RE EVEN.", 'SOMEBODY TAGGED HIM. IN BROWN. NOT ME. PROBABLY.'],
    nude: ['THEY DREW A DICK ON HIM. I BROUGHT MY OWN.', 'DAD MAN SUCKS. TAKE IT FROM A NAKED GUY.'],
  },
  /** The Cruisin' Couch, first seen roaming. */
  couch: {
    clean: ['A COUCH THAT DRIVES ITSELF. A FOOT OFF THE GROUND. PUSSY COUCH.', 'A COUCH WITH WHEELS. MY UNCLE GOT A DUI ON ONE OF THOSE.'],
    shitty: ["A DRIVING COUCH. I'D RUIN THE CUSHIONS.", "A DRIVING COUCH. I'D SIT IN IT AND LEAVE A STAIN THE SHAPE OF OHIO."],
    nude: ['A COUCH. MY BARE ASS ON VELOUR? NO.', 'COUCH HEIGHT. NO SLIPCOVER. A HUNDRED OTHER ASSES.'],
  },
  /** The couch, parked dead on a later visit. */
  broke: {
    clean: ['THE COUCH DIED. GOOD.', 'OUT OF ORDER. SOMEBODY JIZZED ON IT TOO MUCH.'],
    shitty: ['THE COUCH IS BROKEN. LIKE MY PANTS.', 'OUT OF ORDER. SAME, BUDDY. SAME.'],
    nude: ['DEAD COUCH. NOBODY SIT ON IT. ESPECIALLY ME.', 'OUT OF ORDER. THERE GOES MY NAKED COUCH DREAM.'],
  },
  /** The Stupid Dad gift shack (everything 90% off). */
  shop: {
    clean: ['A WHOLE STORE OF DAD MAN SHIT. NINETY PERCENT OFF. STILL NO.', 'SOMEBODY ORDERED TEN THOUSAND BEER CAN HATS. SOMEBODY GOT FIRED.'],
    shitty: ['A WHOLE STORE AND NOT ONE PAIR OF DAD MAN PANTS.', 'NINETY PERCENT OFF. DO THEY SELL UNDERWEAR? NO? FUCK YOU.'],
    nude: ['NINETY PERCENT OFF AND NO DAD MAN BOXERS. I WOULD BUY THOSE.', 'A WHOLE GIFT SHOP. KEYCHAINS. MUGS. NOT ONE PAIR OF PANTS.'],
  },
  /** The talking doll in the clearance bin, the first time it goes off. */
  doll: {
    clean: ['EVEN THE DOLL WANTS A BEER.', 'THE DOLL IS DRUNK. A FUCKING DOLL.'],
    shitty: ['THE DOLL WANTS A BEER. I WANT PANTS.', 'GET YOUR OWN BEER, DOLL. I GOT A LOAD TO CARRY.'],
    nude: ["THE DOLL WANTS A BEER. I WANT UNDERWEAR. WE'RE BOTH SAD.", "SHUT UP, DOLL. YOU'RE WEARING MORE THAN ME."],
  },
  /** The glop pit (the big kids' ball pit: green slime). */
  slime: {
    clean: ['A PIT OF SNOT. THE BIG KIDS GET SNOT.', 'GLOP PIT. SMELLS LIKE A SNEEZE AND FEET.'],
    shitty: ["GREEN SLIME. AT LEAST IT'S NOT BROWN.", "A SLIME PIT. IT'D HIDE THE SMELL. NOT THE CHUNKS."],
    nude: ["NAKED IN GREEN SLIME. I'D NEVER GET IT OUT OF MY CRACK.", "NOT IN THERE NAKED. IT'D GET IN MY PEEHOLE."],
  },
  /** On one of the zone's towers as it first leans. */
  tower: {
    clean: ['THE WOBBLY STACKS AGAIN. BIGGER.', 'TALLER STACK. SAME DRUNK STACKED IT.'],
    shitty: ["DON'T LEAN. DON'T SQUEEZE. DON'T LEAN.", 'IF THIS TIPS, EVERYBODY BELOW GETS A BROWN SHOWER.'],
    nude: ["NAKED ON A WOBBLY STACK. IF I FALL, I'M LANDING BALLS FIRST.", 'IT LEANS. EVERYTHING ON ME SWINGS WITH IT.'],
  },
  /** Spaz & Stinky's Bumper Bash. */
  bumper: {
    clean: ["BUMPER CARS. THE RIDE FOR GUYS WHO CAN'T DRIVE.", "THEY DON'T EVEN LEAVE THE FLOOR. THAT'S A WALMART PARKING LOT."],
    shitty: ['BUMPER CARS. ONE BUMP AND I SPRAY.', "THEY'D HAVE TO BURN THE SEAT AFTER ME."],
    nude: ['NAKED BUMPER CARS. MY NUTS WOULD BE THE BUMPER.', 'NO. THE BUMPER HITS AND MY BALLS HIT THE STEERING WHEEL.'],
  },
  /** The memorial plaque for the show's dead cast. */
  memorial: {
    clean: ["THE WHOLE FAMILY'S DEAD. EXCEPT THE DAD. OF COURSE.", 'IN LOVING MEMORY. FIVE OF THEM. ONE SHOW. WAS IT CURSED?'],
    shitty: ['SOMEBODY LEFT A BEER ON THEIR PLAQUE. THAT SEEMS WRONG.', 'A MEMORIAL. AND I SHIT MYSELF AT IT. RESPECTFULLY.'],
    nude: ['THEY ALL DIED. AND HERE I AM. NAKED AT THEIR PLAQUE.', 'A MEMORIAL. HATS OFF. PANTS ALREADY OFF.'],
  },
  /** Giggles the Clown's Hurl-a-Whirl. */
  whirl: {
    clean: ['A SPINNING CLOWN THREE FEET UP. FOR PUSSIES WHO LIKE CLOWNS.', 'IT WANDERS AROUND SPINNING. LIKE MY UNCLE ON AMBIEN.'],
    shitty: ['SPIN ME AND I PAINT THE CLOWN BROWN.', 'THAT THING WOULD TURN MY PANTS INTO A SHAKE. A BROWN SHAKE.'],
    nude: ['SPINNING NAKED. EVERYTHING WOULD SLAP EVERYTHING.', 'NAKED IN A TEACUP. MY BALLS WOULD HIT THE RIM.'],
  },
  /** Detective Drake's Motion Madness (the hopping simulator pod). */
  pod: {
    clean: ['A ROBOT EGG THAT HOPS SIX INCHES. NO DIGNITY.', "A SIMULATOR. YOU SIT IN A DARK BOX AND THEY SHAKE IT. THAT'S A VAN."],
    shitty: ['SHAKE ME IN A BOX? THE BOX COMES OUT BROWN.', 'A SHAKE RIDE. MY PANTS ARE ALREADY A SMOOTHIE.'],
    nude: ['SHAKE ME NAKED IN A BOX. THAT IS A PEEP SHOW.', 'ME, NAKED, IN A POD SOMEBODY PUKED IN AT NOON. NO.'],
  },
  /** Rad Rat's Tubular Halfpipe. */
  halfpipe: {
    clean: ["A SKATEBOARD RIDE. IT GOES BACK. IT GOES FORTH. I'M ASLEEP.", 'IT GOES HALFWAY UP AND QUITS. LIKE MY DICK ON TEQUILA.'],
    shitty: ['BACK AND FORTH. MY LOAD IS DOING THAT TOO.', "A SKATEBOARD RIDE. I'D LEAVE A SKID MARK."],
    nude: ['NAKED IN A HALFPIPE. ROAD RASH ON MY BALLS.', 'A GIANT SKATEBOARD. NAKED. GRIP TAPE ON MY TAINT.'],
  },
  /** The big DAD MAN LIVE billboard at the end. */
  billboard: {
    clean: ['DAD MAN. LIVE. IN PERSON. SOMEHOW STILL GOING.', 'SEE DAD MAN LIVE. WHO THE FUCK WOULD.', "THE GUY WHO DID THE CARTOON DAD'S VOICE. NOW HE PLAYS HIM. WHY?"],
    shitty: ["DAD MAN LIVE. HE'D SMELL ME FROM THE STAGE.", 'A LIVE SHOW. HOPE THE SEATS ARE PLASTIC. AND HOSEABLE.', "THE CARTOON DAD'S VOICE GUY. IN THE FLESH. ME TOO. IN THE SHIT."],
    nude: ['DAD MAN LIVE. HE BETTER NOT BE NAKED TOO.', "A LIVE SHOW. I'LL SIT FRONT ROW. HE'LL GET A SHOW TOO.", "THE CARTOON DAD'S VOICE GUY. IN THE FLESH. ME TOO. ALL OF IT."],
  },
  /** On, into the extended universe. */
  exit: {
    clean: ['A DAD MAN EXTENDED UNIVERSE. FOR A SHOW NOBODY WATCHED.', 'AN EXTENDED UNIVERSE. OF A SHOW THAT GOT CANCELED AFTER SIX WEEKS.'],
    shitty: ['THE DAD MAN UNIVERSE. I BRING THE SMELL.', 'MORE DAD MAN. MORE SHIT. FINALLY, A PLACE I FIT.'],
    nude: ['THE DAD MAN UNIVERSE. NOW WITH ME. NAKED.', "AN EXTENDED UNIVERSE. MY UNIVERSE IS NOT EXTENDED. IT'S COLD."],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The zone's cast (barks: rare, short)

/** The ride op (a bored teen in a headset, four twenty-five an hour), first sight of him. */
export const RIDEOP_BARK: ByPants = {
  clean: ["SIR. YOU CAN'T BE OUT HERE.", "KEEP YOUR ARMS AND LEGS... WHATEVER. LOSE THEM. I DON'T CARE.", 'I GET FOUR TWENTY-FIVE AN HOUR FOR THIS.'],
  shitty: ['DUDE. DID YOU... DUDE.', "I'M NOT CLEANING THAT. I'M ON MY THIRD SHART THIS SHIFT."],
  nude: ["OH MY GOD. PUT IT AWAY. I'M CALLING IT IN.", 'THERE IS A NAKED GUY IN THE ZONE. A NAKED GUY.'],
};
/** ...on the headset, setting a ride on him (the tell). */
export const RIDEOP_RADIO: ByPants = {
  clean: ['RIDE CONTROL. GUEST OFF THE PATH. RUN THE FAT FUCK OVER.', "BASE, I GOT ONE. SEND IT. I'LL SAY HE TRIPPED."],
  shitty: ['BASE, CODE BROWN. REPEAT, CODE BROWN. SEND THE RIDE.', "HE CRAPPED HIMSELF. HIT HIM. I'LL FILE IT AS A SPILL."],
  nude: ['BASE, NAKED GUEST. SEND THE RIDE. AIM LOW.', 'CODE PINK. HE IS NAKED. RUN HIM DOWN.'],
};
/** Rad Rat, the skate punk mascot (in the costume head). */
export const SKATE_BARK: ByPants = {
  clean: ['RAD RAT SAYS EAT MY WHEELS!', 'COWABUN... NO. LEGAL SAID NO. FUCK LEGAL.', 'TOTALLY GNARLY, DUDE! DIE!'],
  shitty: ['DUDE, YOU BAILED IN YOUR PANTS!', 'GNARLY. LIKE, ACTUALLY GNARLY. I CAN TASTE IT IN MY HEAD.'],
  nude: ["NO PADS, NO HELMET, NO PANTS! THAT'S NOT RADICAL, THAT'S SAD!", "DUDE. TUCK IT. YOU'LL CATCH IT ON THE GRIP TAPE."],
};
/** Gloppy, the gross-out show's slime monster (in the costume). */
export const GLOPPY_BARK: ByPants = {
  clean: ['GLOPPY WANTS A HUG!', "I'M GLOPPY! I'M GROSS! IT'S MY WHOLE THING!", "IT'S NOT SNOT. IT'S PROPRIETARY. IT'S MOSTLY SNOT."],
  shitty: ['EW! EVEN GLOPPY THINKS YOU ARE GROSS!', 'YOU OUT-GROSSED GLOPPY! I HAVE A FAMILY!'],
  nude: ['GLOPPY SEES YOUR GLOPPY!', "PUT IT AWAY! I'M A CHILDREN'S CHARACTER!"],
};
/** THE FLEA (the big blue superhero; costumed): his pose before he leaps. */
export const FLEA_BARK: ByPants = {
  clean: ['SPATULA!', "EVIL NEVER SLEEPS! NEITHER DO I! I'M ON DIET PILLS!", 'BY THE POWER OF THE BIG BLUE FLEA! AND SUDAFED!'],
  shitty: ['EVIL SMELLS LIKE THAT? NOBODY TOLD ME!', 'VILLAIN! YOUR PANTS HAVE BETRAYED YOU! AND YOUR ASS!'],
  nude: ['A NUDE VILLAIN! THE NUDE MENACE STRIKES AGAIN!', "COVER YOUR SHAME, FIEND! I'M LOOKING RIGHT AT IT!"],
};
/** The churro vendor. */
export const CHURRO_BARK: ByPants = {
  clean: ['CHURROS! TWO FOR FIVE! OR ONE IN YOUR EYE!', 'CINNAMON SUGAR, BABY! GET OUT OF MY LINE, FAT ASS!'],
  shitty: ['NO CHURRO FOR THE SHITTY GUY. HEALTH CODE.', 'GET AWAY! PEOPLE WILL THINK IT WAS THE CHURROS!'],
  nude: ['NO SHIRT, NO SHOES, NO PANTS, NO CHURRO, NO WAY.', "SIR, I SELL LONG THINGS WITH SUGAR ON. DON'T COMPARE."],
};
/** The talking Stupid Dad doll in the clearance bin (pull-string; a recording of the show's star). The battery's
 *  going on the last one. */
export const DOLL_LINES = [
  'BOY! GET ME A BEER!',
  "NOT NOW, BOY. THE GAME'S ON.",
  "I'M NOT STUPID. I'M DAD.",
  "WHERE'S MY BEER? BOY!",
  "YOUR MOTHER'S GONNA HEAR ABOUT THIS.",
  'BOOOY... BEEEER...',
];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here, and the death screens (28 characters at most)

export const HURT: HurtTable = {
  'm2:ct_couch': { hurt: ['THE COUCH RAN ME OVER!', 'THE COUCH! IT SMELLS LIKE DORITOS AND SPERM!', 'A COUCH! IN THE NUTS!'], death: ['RUN OVER BY A COUCH', 'KILLED BY A LOVESEAT'] },
  'm2:ct_bumper': { hurt: ['BUMPER CAR! IN THE SHINS!', 'A BUMPER CAR! IN THE BALLS!', 'BUMPED! BY A PUSSY RIDE!'], death: ['BUMPED OFF', 'DEAD BY BUMPER CAR'] },
  'm2:ct_whirl': { hurt: ['THE CLOWN RIDE CLOTHESLINED ME!', 'A CLOWN SPUN INTO MY FACE!', 'HURLED! I GOT HURLED!'], death: ['HURLED BY A WHIRL', 'KILLED BY A CLOWN RIDE'] },
  'm2:ct_pod': { hurt: ['THE EGG LANDED ON ME!', 'SQUASHED BY A SIMULATOR!', 'A FAKE EGG! ON MY FUCKING HEAD!'], death: ['SQUASHED BY A MOTION POD', 'FLATTENED BY A SIMULATOR'] },
  'm2:ct_board': { hurt: ['GIANT SKATEBOARD! MY ANKLES!', 'IT ROLLED OVER MY DICK!', 'RAN OVER BY THE HALFPIPE!'], death: ['RUN OVER BY A HALFPIPE', 'GROUND UP IN A HALFPIPE'] },
  'm2:ct_rideop': { hurt: ['THE RIDE KID HIT ME!', 'THE TRAFFIC WAND! MY EYE!', 'PUNCHED BY A FOUR TWENTY-FIVE AN HOUR FIST!'], death: ['KILLED BY A RIDE OP', 'WANDED TO DEATH'] },
  'm2:ct_cone_shot': { hurt: ['A TRAFFIC CONE! TO THE HEAD!', 'A TRAFFIC CONE! IN MY ASS!', 'CONED!'], death: ['CONED TO DEATH', 'KILLED BY A TRAFFIC CONE'] },
  'm2:ct_skatepunk': { hurt: ['THE RAT RAN ME OVER!', 'SKATEBOARD! UP MY ASS!', 'THE RAT! HE OLLIED ON MY FACE!'], death: ['RUN DOWN BY RAD RAT', 'SKATED OVER BY A RAT'] },
  'm2:ct_board_shot': { hurt: ['HE THREW HIS BOARD!', 'GRIP TAPE! ON MY SHINS!', 'GRIP TAPE! ON MY NUTS!'], death: ['KILLED BY A SKATEBOARD', 'DECKED BY A RAT'] },
  'm2:ct_mohawk': { hurt: ["HIS MOHAWK! IT'S REAL SPIKES!", 'I STOMPED A MOHAWK! OW!', 'A RAT MOHAWK IN MY FOOT! I NEED A TETANUS SHOT!'], death: ['IMPALED ON A MOHAWK', 'STOMPED A SPIKY RAT'] },
  'm2:ct_gloppy': { hurt: ['THE SNOT MONSTER HUGGED ME!', 'GLOPPY! GET OFF!', "IT'S WARM AND WET AND IT'S ON ME!"], death: ['HUGGED BY GLOPPY', 'DIED IN A SNOT HUG'] },
  'm2:ct_glop_shot': { hurt: ['SNOT! IN MY MOUTH!', 'HE HOCKED A LOOGIE IN MY MOUTH!', 'A LOOGIE THE SIZE OF A CAT!'], death: ['DROWNED IN A LOOGIE', 'HOCKED TO DEATH'] },
  'm2:ct_flea': { hurt: ['THE BLUE GUY FELL ON ME!', 'SUPERHERO PUNCH! FROM THE SKY!', 'HE HIT ME WITH JUSTICE!'], death: ['PUNCHED BY THE FLEA', 'DEFEATED BY JUSTICE'] },
  'm2:ct_churro': { hurt: ['THE CHURRO CART HIT ME!', 'A SNACK CART UP MY ASS!', 'CINNAMON! IN MY EYES!'], death: ['RUN OVER BY A CHURRO CART', 'KILLED FOR A CHURRO'] },
  'm2:ct_churro_shot': { hurt: ['A CHURRO! IN THE EAR!', 'A CHURRO! THE OTHER HOLE!', 'FRIED DOUGH TO THE FACE!'], death: ['CHURRO THROUGH THE HEAD', 'KILLED BY FRIED DOUGH'] },
};

// ---------------------------------------------------------------------------------------------------------------
// The announcer's kill callouts, by kind

export const KILL_CALLS: Record<string, Record<string, string[]>> = {
  'm2:ct_rideop': { charge: ['CLOCKED OUT!', 'OFF THE CLOCK!'], uppercut: ['SHIFT OVER!'], divekick: ['OFF THE PATH!'] },
  'm2:ct_skatepunk': { charge: ['BAILED!', 'WIPEOUT!'], uppercut: ['SICK AIR!'], divekick: ['CURBED!'] },
  'm2:ct_gloppy': { charge: ['GLOPPED!'], uppercut: ['SNOT ROCKET!'], divekick: ['SQUISHED!'] },
  'm2:ct_flea': { charge: ['FLEA-FLICKED!'], uppercut: ['UP UP AND GONE!'], divekick: ['DE-FLEA-TED!'] },
  'm2:ct_churro': { charge: ["CHURRO'D!"], uppercut: ['CINNAMON TOSSED!'], divekick: ['DEEP FRIED!'] },
};

const pools = (b: ByPants) => allOf(b);
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...[ARRIVE, REVISIT, LOWRIDE, ...Object.values(GAGS)].flatMap(allOf),
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS).flatMap(k => Object.values(k).flat()))],
  [CAST_VOICES.rideop]: [RIDEOP_BARK, RIDEOP_RADIO].flatMap(pools), [CAST_VOICES.rideopf]: [RIDEOP_BARK, RIDEOP_RADIO].flatMap(pools),
  [CAST_VOICES.skate]: pools(SKATE_BARK), [CAST_VOICES.skatef]: pools(SKATE_BARK),
  [CAST_VOICES.gloppy]: pools(GLOPPY_BARK), [CAST_VOICES.gloppyf]: pools(GLOPPY_BARK),
  [CAST_VOICES.flea]: pools(FLEA_BARK), [CAST_VOICES.fleaf]: pools(FLEA_BARK),
  [CAST_VOICES.churro]: pools(CHURRO_BARK), [CAST_VOICES.churrof]: pools(CHURRO_BARK),
  [CAST_VOICES.doll]: DOLL_LINES,
};
