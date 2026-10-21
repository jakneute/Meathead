// What's said among the big-kid rides (THE BIG-KID ZONE), by voice (cartoon/voices.ts gathers it; tools/voices records
// it). In the user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine (no line
// twice within 45 s). Meathead's lines and everybody reacting to him in clean / shitty / naked pools.
//
// The user's: "meathead still refuses to ride them because he is prejudiced against rides that don't have a track. he
// thinks those rides are for 'pussies'." Every ride gets its own lament, and TRACKLESS is the running sneer. STUPID
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
  clean: ['THE BIG-KID ZONE. FINALLY. WAIT. NONE OF THESE HAVE TRACKS.', 'BIG-KID RIDES. NOW WE TALK. OH. NO TRACKS.'],
  shitty: ['THE BIG-KID ZONE. I BROUGHT MY OWN THRILL. IT\'S IN MY PANTS.', 'BIGGER RIDES. NO TRACKS. MY ASS WANTS A TRACK.'],
  nude: ['THE BIG-KID ZONE. NAKED. GOOD LUCK, BIG KIDS.', 'NO TRACKS AND NO PANTS. ONE OF THOSE IS A CHOICE.'],
};
/** Back on a later visit. */
export const REVISIT: ByPants = {
  clean: ['THE PUSSY RIDES AGAIN.', 'BIG-KID ZONE. STILL NOT ONE TRACK.'],
  shitty: ['BACK WITH THE PUSSY RIDES. AND THE PANTS.', 'THE ZONE AGAIN. IT SMELLS LIKE ME NOW.'],
  nude: ['THE ZONE AGAIN. STILL NAKED. STILL NO TRACKS.', 'BACK. NAKED. THE COUCH CAN SEE ME.'],
};

/**
 * The running sneer: no track, no respect (the user's "pussies"). Said now and then when a ride lines up on him.
 */
export const TRACKLESS: ByPants = {
  clean: [
    "NO TRACK? THAT'S FOR PUSSIES.",
    "NO TRACK. IT'S A GO-KART FOR COWARDS.",
    'NO RAILS. NO RESPECT.',
    'A RIDE WITH NO TRACK IS A GUY DRIVING YOU AROUND.',
    'TRACKLESS RIDES ARE FOR PUSSIES AND GUYS WHO CRY AT MOVIES.',
    'IF IT CAN STEER, IT CAN STEER ITSELF UP ITS ASS.',
  ],
  shitty: [
    "NO TRACK? I'M NOT SHITTING MYSELF ON A PUSSY RIDE.",
    "I ALREADY SHAT MYSELF. NOT FOR THAT. THAT'S FOR PUSSIES.",
    'NO TRACK, NO THRILL. MY PANTS KNOW A REAL RIDE.',
  ],
  nude: [
    'NO TRACK? NO PANTS? ONE OF US HAS BALLS.',
    "I'M NAKED AND STILL TOO MUCH MAN FOR A TRACKLESS RIDE.",
    'TRACKLESS. MY DICK HAS MORE DIRECTION.',
  ],
};

/** Things he's got to say passing them (once each a visit). */
export const GAGS: Record<'posters' | 'graffiti' | 'couch' | 'broke' | 'shop' | 'doll' | 'slime' | 'tower' | 'bumper' | 'memorial' | 'whirl' | 'pod' | 'halfpipe' | 'billboard' | 'exit', ByPants> = {
  /** The first STUPID DAD poster: he's never heard of it. */
  posters: {
    clean: ['STUPID DAD. NEVER HEARD OF IT.', 'WHO THE HELL IS STUPID DAD?', "AMERICA'S NEW FAVORITE FAMILY. NEVER SEEN THEM."],
    shitty: ['STUPID DAD. HE LOOKS LIKE HE SHITS HIMSELF TOO.', 'STUPID DAD. NEVER HEARD OF HIM. HE SMELLS LIKE ME, I BET.'],
    nude: ['STUPID DAD. AT LEAST HE WEARS UNDERWEAR.', "WHO'S STUPID DAD? WHO CARES. I'M NAKED."],
  },
  /** The graffitied poster (a mustache, SUCKS). */
  graffiti: {
    clean: ['SOMEBODY WROTE SUCKS ON IT. A CRITIC.', 'THE ONE GUY WHO WATCHED IT DREW A MUSTACHE ON HIM.'],
    shitty: ["STUPID DAD SUCKS. SO DO MY PANTS. WE'RE EVEN.", 'SOMEBODY TAGGED HIM. IN BROWN. NOT ME. THIS TIME.'],
    nude: ['THEY DREW A DICK ON HIM. I BROUGHT MY OWN.', 'STUPID DAD SUCKS. AND I STAND HERE NAKED. WHO WINS?'],
  },
  /** The Cruisin' Couch, first seen roaming. */
  couch: {
    clean: ['A COUCH THAT DRIVES ITSELF. NO TRACK. PUSSY COUCH.', 'IT\'S A COUCH. WITH WHEELS. I HAVE THAT AT HOME.'],
    shitty: ["A DRIVING COUCH. I'D RUIN THE CUSHIONS.", "A COUCH RIDE. I'M NOT SITTING ON ANYTHING TODAY."],
    nude: ['A COUCH. MY BARE ASS ON VELOUR? NO.', 'NO TRACK AND NO SLIPCOVER. NOT TOUCHING IT.'],
  },
  /** The couch, parked dead on a later visit. */
  broke: {
    clean: ['THE COUCH DIED. GOOD.', 'OUT OF ORDER. THE COUCH GOT WHAT IT DESERVED.'],
    shitty: ['THE COUCH IS BROKEN. LIKE MY PANTS.', 'OUT OF ORDER. ME TOO, BUDDY.'],
    nude: ['DEAD COUCH. NOBODY SIT ON IT. ESPECIALLY ME.', 'OUT OF ORDER. NOW NOBODY GETS TO SIT NAKED ON IT.'],
  },
  /** The Stupid Dad gift shack (everything 90% off). */
  shop: {
    clean: ['A WHOLE STORE OF STUPID DAD SHIT. NINETY PERCENT OFF. STILL NO.', 'SOMEBODY ORDERED TEN THOUSAND BEER CAN HATS.'],
    shitty: ['A WHOLE STORE AND NOT ONE PAIR OF STUPID DAD PANTS.', 'NINETY PERCENT OFF. DO THEY SELL UNDERWEAR? NO? FUCK YOU.'],
    nude: ['NINETY PERCENT OFF AND NO STUPID DAD BOXERS. I WOULD BUY THOSE.', 'A WHOLE GIFT SHOP. NOT ONE PAIR OF PANTS.'],
  },
  /** The talking doll in the clearance bin, the first time it goes off. */
  doll: {
    clean: ['EVEN THE DOLL WANTS A BEER.', 'THE DOLL IS DRUNK. THE DOLL.'],
    shitty: ['THE DOLL WANTS A BEER. I WANT PANTS.', 'GET YOUR OWN BEER, DOLL. I GOT PROBLEMS.'],
    nude: ['THE DOLL WANTS A BEER. I WANT A TOWEL.', "SHUT UP, DOLL. YOU'RE WEARING MORE THAN ME."],
  },
  /** The glop pit (the big kids' ball pit: green slime). */
  slime: {
    clean: ['A PIT OF SNOT. THE BIG KIDS GET SNOT.', 'GLOP PIT. THEY RAN OUT OF BALLS.'],
    shitty: ["GREEN SLIME. AT LEAST IT'S NOT BROWN.", 'A SLIME PIT. NOBODY WOULD NOTICE ME IN THERE.'],
    nude: ["NAKED IN GREEN SLIME. I'D NEVER GET IT OUT OF MY CRACK.", "NOT IN THERE NAKED. IT'D GET IN EVERYTHING."],
  },
  /** On one of the zone's towers as it first leans. */
  tower: {
    clean: ['THE WOBBLY STACKS AGAIN. BIGGER.', 'TALLER STACK. SAME IDIOT STACKED IT.'],
    shitty: ["DON'T LEAN. DON'T SQUEEZE. DON'T LEAN.", 'IF THIS TIPS, EVERYBODY GETS A SHOWER.'],
    nude: ['NAKED ON A WOBBLY STACK. THE KIDS GET A SHOW.', 'IT LEANS. EVERYTHING ON ME SWINGS WITH IT.'],
  },
  /** Spaz & Stinky's Bumper Bash. */
  bumper: {
    clean: ["BUMPER CARS. THE RIDE FOR GUYS WHO CAN'T DRIVE.", 'NO TRACK. JUST CARS HITTING EACH OTHER. LIKE THE PARKING LOT.'],
    shitty: ['BUMPER CARS. ONE BUMP AND I SPRAY.', "THEY'D HOSE THE SEAT OUT AFTER ME."],
    nude: ['NAKED BUMPER CARS. MY NUTS WOULD BE THE BUMPER.', 'NO. THE LAP BAR GOES RIGHT ACROSS IT.'],
  },
  /** The memorial plaque for the show's dead cast. */
  memorial: {
    clean: ["THE WHOLE FAMILY'S DEAD. EXCEPT THE DAD. OF COURSE.", 'IN LOVING MEMORY. FIVE OF THEM. ONE SHOW. JESUS.'],
    shitty: ['SOMEBODY LEFT A BEER ON THEIR PLAQUE. THAT SEEMS WRONG.', 'A MEMORIAL. I SHOULD NOT BE STANDING HERE LIKE THIS.'],
    nude: ['THEY ALL DIED. AND HERE I AM. NAKED AT THEIR PLAQUE.', 'A MEMORIAL. HATS OFF. PANTS ALREADY OFF.'],
  },
  /** Giggles the Clown's Hurl-a-Whirl. */
  whirl: {
    clean: ['A SPINNING CLOWN WITH NO TRACK. FOR PUSSIES WHO LIKE CLOWNS.', 'IT WANDERS AROUND SPINNING. LIKE MY UNCLE AT A WEDDING.'],
    shitty: ['SPIN ME AND I PAINT THE CLOWN BROWN.', 'THAT THING WOULD MAKE A MILKSHAKE OUT OF MY PANTS.'],
    nude: ['SPINNING NAKED. EVERYTHING WOULD SLAP EVERYTHING.', 'NAKED IN A TEACUP. THE CLOWN WOULD SEE IT ALL.'],
  },
  /** Detective Drake's Motion Madness (the hopping simulator pod). */
  pod: {
    clean: ['A ROBOT EGG THAT HOPS. NO TRACK. NO DIGNITY.', 'A SIMULATOR. YOU SIT IN A BOX AND THEY SHAKE IT. PUSSY.'],
    shitty: ['SHAKE ME IN A BOX? THE BOX COMES OUT BROWN.', 'A SHAKE RIDE. MY PANTS ARE ALREADY A SHAKE.'],
    nude: ['SHAKE ME NAKED IN A BOX. THAT IS A PEEP SHOW.', 'ME, NAKED, IN A SWEATY POD. NO.'],
  },
  /** Rad Rat's Tubular Halfpipe. */
  halfpipe: {
    clean: ['A SKATEBOARD RIDE. IT GOES BACK. IT GOES FORTH. WOW.', 'NO TRACK. JUST A BIG BOARD AND A DREAM. PUSSY.'],
    shitty: ["BACK AND FORTH. MY PANTS ARE DOING THAT TOO.", "A SKATEBOARD RIDE. I'D LEAVE A SKID MARK."],
    nude: ['NAKED IN A HALFPIPE. ROAD RASH ON MY BALLS.', 'A GIANT SKATEBOARD. NAKED. NO PADS ANYWHERE.'],
  },
  /** The big STUPID DAD LIVE billboard at the end. */
  billboard: {
    clean: ['STUPID DAD. LIVE. IN PERSON. SOMEHOW STILL GOING.', 'SEE STUPID DAD LIVE. WHO WOULD.'],
    shitty: ["STUPID DAD LIVE. HE'D SMELL ME FROM THE STAGE.", 'A LIVE SHOW. I HOPE THE SEATS ARE PLASTIC.'],
    nude: ['STUPID DAD LIVE. HE BETTER NOT BE NAKED TOO.', 'A LIVE SHOW. FRONT ROW. NAKED. THEY WILL LOVE THAT.'],
  },
  /** On, into the extended universe. */
  exit: {
    clean: ['A STUPID DAD EXTENDED UNIVERSE. FOR A SHOW NOBODY WATCHED.', 'AN EXTENDED UNIVERSE. OF WHAT?'],
    shitty: ['THE STUPID DAD UNIVERSE. I BRING THE SMELL.', 'MORE STUPID DAD. MORE SHIT. I FIT IN.'],
    nude: ['THE STUPID DAD UNIVERSE. NOW WITH ME. NAKED.', 'AN EXTENDED UNIVERSE. AND MY EXTENDED... NEVER MIND.'],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The zone's cast (barks: rare, short)

/** The ride op (a bored teen in a headset, four twenty-five an hour), first sight of him. */
export const RIDEOP_BARK: ByPants = {
  clean: ["SIR. YOU CAN'T BE OUT HERE.", 'KEEP YOUR ARMS AND LEGS... WHATEVER. I DON\'T CARE.', 'I GET FOUR TWENTY-FIVE AN HOUR FOR THIS.'],
  shitty: ['DUDE. DID YOU... DUDE.', "I'M NOT CLEANING THAT. I CLEANED THE LAST ONE."],
  nude: ["OH MY GOD. PUT IT AWAY. I'M CALLING IT IN.", 'THERE IS A NAKED GUY IN THE ZONE. A NAKED GUY.'],
};
/** ...on the headset, setting a ride on him (the tell). */
export const RIDEOP_RADIO: ByPants = {
  clean: ['RIDE CONTROL. GUEST OFF THE PATH. RUN HIM OVER.', "BASE, I GOT ONE. SEND IT. I'LL SAY HE TRIPPED."],
  shitty: ['BASE, CODE BROWN. REPEAT, CODE BROWN. SEND THE RIDE.', 'HE CRAPPED HIMSELF. HIT HIM WITH THE RIDE. HOSE IT AFTER.'],
  nude: ['BASE, NAKED GUEST. SEND THE RIDE. AIM LOW.', 'CODE PINK. HE IS NAKED. RUN HIM DOWN.'],
};
/** Rad Rat, the skate punk mascot (in the costume head). */
export const SKATE_BARK: ByPants = {
  clean: ['RAD RAT SAYS EAT MY WHEELS!', 'COWABUN... NO. LEGAL SAID NO.', 'TOTALLY GNARLY, DUDE! DIE!'],
  shitty: ['DUDE, YOU BAILED IN YOUR PANTS!', 'GNARLY. LIKE, ACTUALLY GNARLY. GROSS.'],
  nude: ['NO PADS, NO HELMET, NO PANTS! RADICAL!', "DUDE. TUCK IT. YOU'LL CATCH IT ON THE GRIP TAPE."],
};
/** Gloppy, the gross-out show's slime monster (in the costume). */
export const GLOPPY_BARK: ByPants = {
  clean: ['GLOPPY WANTS A HUG!', "I'M GLOPPY! I'M GROSS! IT'S MY WHOLE THING!", "IT'S NOT SNOT. IT'S PROPRIETARY."],
  shitty: ['EW! EVEN GLOPPY THINKS YOU ARE GROSS!', "YOU OUT-GROSSED GLOPPY! I'M OUT OF A JOB!"],
  nude: ['GLOPPY SEES YOUR GLOPPY!', "PUT IT AWAY! I'M A CHILDREN'S CHARACTER!"],
};
/** THE FLEA (the big blue superhero; costumed): his pose before he leaps. */
export const FLEA_BARK: ByPants = {
  clean: ['SPATULA!', "EVIL NEVER SLEEPS! NEITHER DO I! I'M ON DIET PILLS!", 'BY THE POWER OF THE BIG BLUE FLEA!'],
  shitty: ['EVIL SMELLS LIKE THAT? NOBODY TOLD ME!', 'VILLAIN! YOUR PANTS HAVE BETRAYED YOU!'],
  nude: ['A NUDE VILLAIN! MY ONLY WEAKNESS!', "COVER YOUR SHAME, FIEND! I'M LOOKING RIGHT AT IT!"],
};
/** The churro vendor. */
export const CHURRO_BARK: ByPants = {
  clean: ['CHURROS! TWO FOR FIVE! OR ONE IN YOUR EYE!', 'CINNAMON SUGAR, BABY! GET OUT OF MY LINE!'],
  shitty: ['NO CHURRO FOR THE SHITTY GUY. HEALTH CODE.', "YOU'LL MAKE PEOPLE THINK IT WAS THE CHURROS."],
  nude: ['NO SHIRT, NO SHOES, NO PANTS, NO CHURRO.', "SIR, I SELL LONG THINGS WITH SUGAR ON. DON'T COMPARE."],
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
  'm2:ct_couch': { hurt: ['THE COUCH RAN ME OVER!', 'HIT BY FURNITURE! DRIVING FURNITURE!', 'A COUCH! IN THE NUTS!'], death: ['RUN OVER BY A COUCH', 'KILLED BY A LOVESEAT'] },
  'm2:ct_bumper': { hurt: ['BUMPER CAR! IN THE SHINS!', 'THAT ONE SPUN AND GOT ME!', 'BUMPED! BY A PUSSY RIDE!'], death: ['BUMPED OFF', 'DEAD BY BUMPER CAR'] },
  'm2:ct_whirl': { hurt: ['THE CLOWN RIDE CLOTHESLINED ME!', 'A SPINNING TEACUP! IN THE FACE!', 'HURLED! I GOT HURLED!'], death: ['HURLED BY A WHIRL', 'KILLED BY A CLOWN RIDE'] },
  'm2:ct_pod': { hurt: ['THE EGG LANDED ON ME!', 'SQUASHED BY A SIMULATOR!', 'IT HOPPED ON MY HEAD!'], death: ['SQUASHED BY A MOTION POD', 'FLATTENED BY A SIMULATOR'] },
  'm2:ct_board': { hurt: ['GIANT SKATEBOARD! MY ANKLES!', 'IT ROLLED RIGHT OVER ME!', 'RAN OVER BY THE HALFPIPE!'], death: ['RUN OVER BY A HALFPIPE', 'GROUND UP IN A HALFPIPE'] },
  'm2:ct_rideop': { hurt: ['THE RIDE KID HIT ME!', 'THE TRAFFIC WAND! MY EYE!', 'MINIMUM WAGE PUNCH!'], death: ['KILLED BY A RIDE OP', 'WANDED TO DEATH'] },
  'm2:ct_cone_shot': { hurt: ['A TRAFFIC CONE! TO THE HEAD!', 'HE THREW A CONE AT ME!', 'CONED!'], death: ['CONED TO DEATH', 'KILLED BY A TRAFFIC CONE'] },
  'm2:ct_skatepunk': { hurt: ['THE RAT RAN ME OVER!', 'SKATEBOARD! UP MY ASS!', 'RAD RAT! NOT RAD!'], death: ['RUN DOWN BY RAD RAT', 'SKATED OVER BY A RAT'] },
  'm2:ct_board_shot': { hurt: ['HE THREW HIS BOARD!', 'GRIP TAPE! ON MY SHINS!', 'A BOARD TO THE ANKLES!'], death: ['KILLED BY A SKATEBOARD', 'DECKED BY A RAT'] },
  'm2:ct_mohawk': { hurt: ["HIS MOHAWK! IT'S REAL SPIKES!", 'I STOMPED A MOHAWK! OW!', 'SPIKED! BY A RAT!'], death: ['IMPALED ON A MOHAWK', 'STOMPED A SPIKY RAT'] },
  'm2:ct_gloppy': { hurt: ['THE SNOT MONSTER HUGGED ME!', 'GLOPPY! GET OFF!', "IT'S WARM AND IT'S ON ME!"], death: ['HUGGED BY GLOPPY', 'DIED IN A SNOT HUG'] },
  'm2:ct_glop_shot': { hurt: ['SNOT! IN MY MOUTH!', 'HE HOCKED ON ME!', 'A LOOGIE THE SIZE OF A CAT!'], death: ['DROWNED IN A LOOGIE', 'HOCKED TO DEATH'] },
  'm2:ct_flea': { hurt: ['THE BLUE GUY FELL ON ME!', 'SUPERHERO PUNCH! FROM THE SKY!', 'SPATULA! OW!'], death: ['PUNCHED BY THE FLEA', 'DEFEATED BY JUSTICE'] },
  'm2:ct_churro': { hurt: ['THE CHURRO CART HIT ME!', 'RAMMED BY A SNACK CART!', 'CINNAMON! IN MY EYES!'], death: ['RUN OVER BY A CHURRO CART', 'KILLED FOR A CHURRO'] },
  'm2:ct_churro_shot': { hurt: ['A CHURRO! IN THE EAR!', 'HE THREW A CHURRO!', 'FRIED DOUGH TO THE FACE!'], death: ['CHURRO THROUGH THE HEAD', 'KILLED BY FRIED DOUGH'] },
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
    ...[ARRIVE, REVISIT, TRACKLESS, ...Object.values(GAGS)].flatMap(allOf),
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
