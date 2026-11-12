// The water park, level 3 (THE MAINTENANCE TUNNELS, THE WAVE POOL): what's said (ALL CAPS, American spelling; clean /
// shitty / naked wherever it's his or said to him). Every line here is in PARK3_VOICE_LINES (endgame/lines.ts folds it
// into ENDGAME_VOICE_LINES, recorded by npm run voices).
//
// GUPPLAX: the wave pool's lifeguard, an alien (the aliens' turn): the alien widow's son, big brother to ZORZARBLAX (the
// kid on the summit, level 1's). Mom sent the little one first; Meathead killed him, and their dad before that (the
// owner's, 2026-11-11: every endgame boss is one of Satan's and the widow's kids, and the lines let the player know).
// A bloated, sweating, gill-flapping slob in a lifeguard's
// red trunks two sizes small, zinc on his nose, a whistle he never stops blowing. Erratic: giggles, screams, blows the
// whistle at nothing. He runs the deep end and calls everything he doesn't like a pussy. Armored in scrap off the pool (a drain
// grate breastplate, a stockpot helmet) and allergic to chlorine: a lifeguard who never shocks his pool. His grudge: Meathead killed
// his little brother on the mountain. Undignified to the end.

import type { ByPants } from '../park1/lines';
export type { ByPants };
const bp = (clean: string[], shitty: string[], nude: string[]): ByPants => ({ clean, shitty, nude });

export const GUP_VOICE = 'm2.wp.gupplax';
export const GUP_NAME = 'GUPPLAX';
/** The possessed staff talk in the aliens' voices (park1's possessed guests'). */
export const STAFF_VOICE = { m: 'm2.space.alien', f: 'm2.space.alienf' };

// ---------------------------------------------------------------------------------------------------------------
// Meathead, going

export const MH_DOOR3 = bp(["MAINTENANCE. NOBODY'S MAINTAINED SHIT IN HERE."], ['MAINTENANCE. SMELLS LIKE ME IN HERE.'], ["MAINTENANCE. AUTHORIZED PERSONNEL ONLY. I'M AUTHORIZED. I'M NAKED."]);
export const MH_IN = bp(
  ['THE STAFF ARE POSSESSED. HOW CAN YOU TELL?', 'GREEN EYES. SAME WORK ETHIC.'],
  ['EVEN THE JANITORS LOOK AT ME LIKE THAT.', 'POSSESSED JANITORS. THEY STILL WON\'T CLEAN ME UP.'],
  ['POSSESSED JANITORS. THEY DON\'T EVEN LOOK UP AT A NAKED GUY.', 'GREEN EYES. NO PANTS. WE MATCH. ALMOST.'],
);
export const MH_PISS = bp(
  ["EVERY KID'S PEE IN THE WHOLE PARK. IN ONE TANK.", "DON'T FALL IN THE PEE. DON'T FALL IN THE PEE."],
  ["A WHOLE TANK OF PEE. FOR ONCE I'M NOT THE WORST THING IN THE ROOM.", "IT SMELLS BETTER THAN ME. THAT'S THE SAD PART."],
  ["A TANK OF PEE AND I'M NAKED OVER IT. ONE SLIP.", "DON'T FALL IN. NOTHING TO HIDE BEHIND."],
);
export const MH_CHEM = bp(
  ['PRODUCT OF QUESTION MARKS. THAT GOES IN THE POOLS.', "THAT'S WHY THE POOL WATER'S PURPLE."],
  ["CHLORINE. SHOULD'VE BROUGHT SOME FOR MY PANTS.", 'THE DRUMS ARE LEAKING. SO AM I.'],
  ["CHLORINE GAS AND I'M NAKED. EVERYTHING'S EXPOSED.", 'BLEACH IN THE AIR. MY BALLS ARE GONNA BE BLOND.'],
);
export const MH_GANG = bp(
  ['STAIRS THAT MOVE. WHO BUILDS STAIRS THAT MOVE?', 'NO HANDRAIL. OF COURSE.'],
  ['MOVING STAIRS OVER SLUDGE. MY ASS IS CLENCHED. TOO LATE.', 'NO HANDRAIL. NO DIGNITY.'],
  ['MOVING STAIRS. EVERYTHING SWINGS. EVERYTHING.', 'NO HANDRAIL. NOTHING TO HOLD BUT MYSELF.'],
);
export const MH_SHAFT = bp(['STEAM VENTS. MOSTLY OFF. SURE.', 'DOWN WE GO.'], ['STEAM. MIGHT CLEAN ME UP.', 'DOWN WE GO. STINK FIRST.'], ['STEAM. ON MY BARE ASS.', 'DOWN WE GO. CAREFUL ON THE RUNGS.']);
export const MH_SWIM = bp(
  ["THE PIPES ARE FLOODED. NOBODY CALLED A PLUMBER. EVER.", 'HOLD YOUR BREATH, MEATHEAD.'],
  ['FLOODED PIPES. FINALLY A BATH.', 'HOLD YOUR BREATH. EVERYBODY ELSE IS.'],
  ['FLOODED PIPES. SKINNY DIPPING IN SEWAGE.', 'HOLD YOUR BREATH. SHRINKAGE.'],
);
export const MH_VALVE = bp(
  ['GREEN LIGHT, GO. RED LIGHT, DON\'T.', 'THE FLAP SWITCHES. WAIT FOR IT.'],
  ['GREEN, GO. RED, STAY. LIKE MY BOWELS.', 'THE FLAP SWITCHES. WAIT FOR IT. CLENCH.'],
  ['GREEN, GO. RED, STAY. EVERYTHING FLOATS.', 'THE FLAP SWITCHES. KEEP YOUR BITS AWAY FROM IT.'],
);
export const MH_PUSHED = bp(['THE CURRENT! IT SHOVED ME BACK!', 'BACK TO THE START! COME ON!'], ['THE CURRENT! IT WASHED ME BACK! NOT CLEAN, THOUGH!', 'BACK DOWN THE PIPE! AGAIN!'], ['THE CURRENT! IT TOOK ME BACK! NAKED!', 'BACK DOWN THE PIPE! EVERYTHING FLAPPING!']);
export const MH_PUMP = bp(
  ['WAVE POOL OUTFLOW. KEEP CLEAR. NOPE.', 'THE BIG REFILL. SOMETHING BIG IS DOWN THERE.'],
  ['WAVE POOL OUTFLOW. AT LEAST IT RINSES.', 'BIG REFILL. BIG STINK. BIG FIGHT.'],
  ['WAVE POOL OUTFLOW. GOING DOWN NAKED.', 'BIG REFILL. NOW INTO THE DRAIN. NAKED.'],
);
/** GUPPLAX in the tanks on the way (tease.ts): the glass he thumps and cracks; the close look in the pump room. */
export const MH_TEASE_THUMP = bp(
  ["SOMETHING'S IN THE TANK. SOMETHING BIG.", "THAT GLASS WASN'T BUILT FOR THAT."],
  ['SOMETHING HIT THE GLASS. I HIT MY PANTS.', 'THAT GLASS CRACKED. SO DID I. BACK THERE.'],
  ['SOMETHING HIT THE GLASS. EVERYTHING ON ME RAN AND HID.', "THAT GLASS CRACKED. AND I'VE GOT NOTHING ON."],
);
export const MH_TEASE_LOOK = bp(
  ['FOUR EYES. ALL OF THEM ON ME.', 'SAME UGLY AS THE KID ON THE MOUNTAIN. BIGGER.'],
  ['FOUR EYES. ALL OF THEM ON MY PANTS.', 'SAME FACE AS THE KID ON THE MOUNTAIN. FAMILY.'],
  ['FOUR EYES. ALL OF THEM ON MY JUNK.', 'SAME FACE AS THE KID ON THE MOUNTAIN. SAME STARE.'],
);
export const MH_AIR_LOW = ['AIR! I NEED AIR!', "MY LUNGS! THEY'RE EMPTY!", 'UP! GET UP!'];

// ---------------------------------------------------------------------------------------------------------------
// The possessed staff (janitors, technicians): barks (the aliens' voices)

export const STAFF_BARK = bp(
  ['NOT MY JOB. KILLING YOU IS. NOW.', 'THE HIVE SAYS MOP UP THE HUMAN.', "I'M ON BREAK. FOREVER. FOR THE HIVE.", 'CLOCK IN. CLOCK OUT. KILL THE BIG ONE.', "THE HIVE PAYS BETTER THAN THE PARK."],
  ['THE HIVE SAYS MOP UP THE SHITTY HUMAN.', "THAT'S NOT IN MY JOB DESCRIPTION. NEITHER IS THE SMELL.", 'CODE BROWN. CODE HIVE.', "I MOPPED UP WORSE. NOT MUCH WORSE."],
  ['THE HIVE SAYS MOP UP THE NAKED HUMAN.', "PUT IT AWAY. EVEN THE HIVE'S EMBARRASSED.", 'CODE NUDE. CODE HIVE.', "I'VE SEEN WORSE IN THE LOCKER ROOM."],
);

// ---------------------------------------------------------------------------------------------------------------
// GUPPLAX: the wave pool

/** The flush in: shot out through the grate (his line as he's spat into the pool). */
export const MH_FLUSHED = bp(['WHO FLUSHED?!'], ['WHO FLUSHED?! WAIT. THAT WAS ME.'], ['WHO FLUSHED?! IN THE NUDE!']);
/** The intro (the gross-up): who he is, the grudge. */
export const GUP_INTRO = bp(
  ["TWEEEET! NO RUNNING! NO DIVING! NO HUMANS! I'M GUPPLAX! YOU KILLED MY LITTLE BROTHER!"],
  ["TWEEEET! NO RUNNING! NO SHITTING IN THE POOL! I'M GUPPLAX! YOU KILLED MY LITTLE BROTHER!"],
  ["TWEEEET! NO RUNNING! NO SWIMMING NUDE! I'M GUPPLAX! YOU KILLED MY LITTLE BROTHER!"],
);
export const MH_GUP = bp(
  ['YOUR BROTHER HAD THREE ARMS AND NO CHIN.'],
  ["YOUR BROTHER HAD THREE ARMS. I'VE HAD WORSE DAYS. TODAY, ACTUALLY."],
  ['YOUR BROTHER HAD THREE ARMS AND STILL LESS GOING ON THAN ME.'],
);
export const GUP_INTRO2 = bp(
  ["AND MY DAD! MOM CRIED FOR A WEEK! ADULT SWIM! TWEEEET!"],
  ["AND MY DAD! MOM SAYS DROWN YOU, THEN DRAIN THE POOL! TWEEEET!"],
  ["AND MY DAD! MOM SAYS DROWN YOU AND DON'T LOOK DOWN! TWEEEET!"],
);
export const GUP_RETRY = bp(
  ['TWEEEET! BACK IN THE POOL! NO REFUNDS!', 'YOU AGAIN! ADULT SWIM!'],
  ['TWEEEET! THE STINKY ONE AGAIN! NO REFUNDS!', 'YOU AGAIN! NOW THE POOL NEEDS SHOCKING!'],
  ['TWEEEET! THE NAKED ONE AGAIN! NO REFUNDS!', 'YOU AGAIN! COVER UP!'],
);
/** In the shallow end: the owner's ("come back to the deep end, pussy"), and his variants. */
export const GUP_TAUNT = bp(
  ['COME BACK TO THE DEEP END, PUSSY!', 'THE SHALLOW END IS FOR BABIES! COME BACK, PUSSY!', 'WADING POOL! WADING POOL! COME BACK TO THE DEEP END, PUSSY!', "YOU CAN'T TOUCH BOTTOM OUT HERE! THAT'S THE POINT, PUSSY!", 'FLOATIES! GET THE PUSSY SOME FLOATIES!'],
  ['COME BACK TO THE DEEP END, PUSSY! THE SHIT CAN SWIM!', 'THE SHALLOW END IS FOR BABIES! AND YOU SMELL LIKE ONE! COME BACK, PUSSY!', 'COME BACK TO THE DEEP END, PUSSY! IT HIDES THE BROWN!', "WADING IN YOUR OWN SHIT! COME BACK TO THE DEEP END, PUSSY!", 'SWIM DIAPER! GET THE PUSSY A SWIM DIAPER!'],
  ['COME BACK TO THE DEEP END, PUSSY! IT HIDES THE SHRINKAGE!', 'THE SHALLOW END IS FOR BABIES! AND YOURS IS A BABY! COME BACK, PUSSY!', 'COME BACK TO THE DEEP END, PUSSY! NOBODY CAN SEE IT OUT HERE!', 'NAKED IN THE KIDDIE END! COME BACK TO THE DEEP END, PUSSY!', 'FLOATIES! THE NAKED PUSSY NEEDS FLOATIES!'],
);
/** The mutters (erratic: giggling, screaming, the whistle at nothing). */
export const GUP_PATTER = bp(
  ['TWEET! TWEET! TWEET! HEE HEE!', 'THIRTY MINUTES AFTER EATING! I ATE YOU! IN MY HEAD!', 'I SEE YOU! I SEE EVERYTHING! I HAVE FOUR EYES!', "NOBODY'S DROWNED ON MY WATCH! I WATCH THEM DO IT!", 'ADULT SWIM! ADULT SWIM! ADUUULT SWIIIIM!'],
  ['TWEET! TWEET! CODE BROWN! CODE BROWN! HEE HEE!', "THE POOL'S CLOSED! YOU MADE IT CLOSED!", 'I SEE A FLOATER! IT HAS A FACE!', 'THIRTY MINUTES AFTER EATING! THIRTY YEARS AFTER YOU!', 'SHOCK THE POOL! SHOCK IT! SHOCK HIM!'],
  ['TWEET! TWEET! NO NUDITY! NO NUDITY! HEE HEE!', 'I SEE IT! I SEE IT WITH ALL FOUR EYES!', "NAKED IN MY POOL! THE CHLORINE'S GONNA FIND YOUR CRACK!", 'THIRTY MINUTES AFTER EATING! YOU LOOK UNDERCOOKED!', 'TOWEL! SOMEBODY THROW HIM A TOWEL! A BIG ONE! NO, A SMALL ONE!'],
);
/** As he blows for a big wave. */
export const GUP_WAVE = bp(['WAVE TIME! TWEEEEEET!', 'SURF\'S UP, PUSSY!'], ['WAVE TIME! WASH THE SHIT OFF! TWEEEET!', 'SURF\'S UP, STINKY!'], ['WAVE TIME! TWEEEET! HOLD ONTO IT!', 'SURF\'S UP, NAKED!']);
export const GUP_HURT = bp(
  ['OW! FOUL! FOUL!', 'TWEET! THAT\'S A PENALTY!', 'NO HORSEPLAY!', 'I\'M TELLING THE MANAGER! I\'M THE MANAGER!'],
  ['OW! YOU GOT SHIT IN MY GILLS!', 'TWEET! PENALTY! HYGIENE PENALTY!', 'NO HORSEPLAY! NO POOPING!'],
  ['OW! NO NUDE HORSEPLAY!', 'TWEET! PENALTY! INDECENT EXPOSURE!', "IT TOUCHED ME! YOUR THING TOUCHED ME!"],
);
export const GUP_LOW = bp(
  ["I CAN'T SWIM! I NEVER COULD! MOM SAID IT DIDN'T MATTER!"],
  ["I CAN'T SWIM! NEVER COULD! TELL MOM THE POOL WAS BROWN!"],
  ["I CAN'T SWIM! NEVER COULD! DON'T TELL MOM A NAKED MAN DID THIS!"],
);
/** His last (it goes sideways: the whistle). */
export const GUP_DEATH = bp(["TWEE... TELL MOM I'M SORRY... WAIT UP, LITTLE BROTHER..."], ["TWEE... TELL MOM IT WAS THE SMELL... WAIT UP, LITTLE BROTHER..."], ["TWEE... DON'T TELL MOM WHAT I SAW... WAIT UP, LITTLE BROTHER..."]);
/** Meathead, blown up into the sky astride him (ride.ts): his one line, as they go. */
export const MH_LAUNCH = bp(['YEE-HAW!', 'GIDDY UP, FISH STICK!'], ['YEE-HAW! HOLD IT IN!', 'GIDDY UP! WE BOTH STINK!'], ['YEE-HAW! WIND IN MY EVERYTHING!', 'GIDDY UP! NOTHING BETWEEN US!']);
/** Grabbing at him (too big, too slimy). */
export const GRAB_GUP = ["HE'S TOO SLIPPERY. HE'S LIKE A WET HOT DOG.", "TOO BIG. TOO GREASY. TOO MANY NIPPLES.", "I'M NOT GRABBING THAT. IT'S MOIST."];


// ---------------------------------------------------------------------------------------------------------------
// The rebuild (the owner's, 2026-11-06): GUPPLAX armored and allergic to chlorine, the tanks in the dead body mazes,
// the surges, the flanks.

/** A hit clanking off his armor (now and then). */
export const GUP_ARMOR = bp(
  ['HA! ARMOR! I GOT IT AT THE DUMP!', 'BOUNCES RIGHT OFF! LIKE YOUR DAD!', "IT'S A DRAIN GRATE! IT'S TOUGHER THAN YOU!"],
  ['HA! ARMOR! AND A NOSE PLUG!', "BOUNCES RIGHT OFF! YOUR STINK DOESN'T!", "IT'S A DRAIN GRATE! I KNOW WHAT GOES DOWN IT! YOU!"],
  ['HA! ARMOR! ONE OF US IS DRESSED!', 'BOUNCES RIGHT OFF! LIKE EVERYTHING ON YOU!', "IT'S A DRAIN GRATE! IT COVERS MORE THAN YOU DO!"],
);
/** The first tank burst. */
export const GUP_CHLORINE1 = bp(
  ['IS THAT CHLORINE?! WHO PUT CHLORINE IN MY POOL?!'],
  ['IS THAT CHLORINE?! IN MY POOL?! THE SHIT WAS FINE! NOT THIS!'],
  ['IS THAT CHLORINE?! ON YOUR NAKED ASS?! IN MY POOL?!'],
);
/** Every burst after. */
export const GUP_CHLORINE = bp(
  ['AAH... AAAH... CHOO! MY GILLS!', "I'M ALLERGIC! I'M A LIFEGUARD AND I'M ALLERGIC!", 'STOP CLEANING MY POOL!', 'MY EYES! ALL FOUR!'],
  ['AAH... CHOO! CHLORINE AND SHIT! MY GILLS!', "I'M ALLERGIC! TO CHLORINE AND TO YOU!", 'STOP CLEANING MY POOL! CLEAN YOUR ASS!', 'MY EYES! ALL FOUR! AND MY NOSE!'],
  ["AAH... CHOO! IT'S ALL OVER ME! LIKE YOUR BALLS!", "I'M ALLERGIC! I'M SWELLING UP! STOP LOOKING AT ME LIKE THAT!", 'STOP CLEANING MY POOL! PUT ON PANTS!', 'MY EYES! ALL FOUR! ALL FOUR ON YOU!'],
);
/** The sneezes (in a cloud of it; the sitting duck). */
export const GUP_SNEEZE = bp(
  ['AAH-CHOO!', 'HUP... HUP... CHOO!', 'ACHOO! TWEET!'],
  ['AAH-CHOO! I INHALED YOU!', 'HUP... CHOO! CHLORINATED ASS!', 'ACHOO! CODE BROWN!'],
  ['AAH-CHOO! DON\'T LOOK!', 'HUP... CHOO! COVER IT UP!', 'ACHOO! INDECENT!'],
);
/** Coming in from behind. */
export const GUP_FLANK = bp(
  ['BEHIND YOU, PUSSY!', 'SURPRISE INSPECTION!', 'NO RUNNING! NO SWIMMING!'],
  ["BEHIND YOU! THAT'S NOT YOUR GOOD SIDE!", 'SURPRISE INSPECTION! YOU FAILED!', 'NO RUNNING! IT ALREADY RAN DOWN YOUR LEG!'],
  ['BEHIND YOU! OH GOD, I SAW IT!', 'SURPRISE INSPECTION! TOO MUCH TO INSPECT!', 'NO RUNNING! NOTHING SHOULD BOUNCE LIKE THAT!'],
);
/** Rammed head first into a pile. */
export const GUP_BONK = bp(
  ['OW! WHO PUT DEAD GUYS IN MY POOL?! OH. ME.', 'MY HEAD! RIGHT INTO A GRANDMA!', 'BONK! THE PILE MOVED!'],
  ['OW! THE DEAD GUYS SMELL BETTER THAN YOU!', 'MY HEAD! RIGHT INTO A SWIM DIAPER!', 'BONK! SOMEBODY SHIT IN THE PILE! YOU!'],
  ['OW! THE DEAD GUYS ARE WEARING MORE THAN YOU!', 'MY HEAD! RIGHT INTO A NAKED GRANDPA!', 'BONK! EVEN THE CORPSES ARE EMBARRASSED!'],
);
/** He's in one of the mazes (GUPPLAX can't fit). */
export const GUP_MAZE = bp(
  ['COME OUT OF MY DEAD GUYS!', "THAT'S MY PILE! NO SWIMMING IN THE PILE!", 'I CAN WAIT! I HAVE GILLS!'],
  ["COME OUT OF MY DEAD GUYS! YOU'RE MAKING THEM SMELL!", "THAT'S MY PILE! STOP ADDING TO IT!", "I CAN WAIT! THE SMELL CAN'T!"],
  ["COME OUT OF MY DEAD GUYS! STOP RUBBING ON THEM!", "THAT'S MY PILE! THEY DON'T WANT YOUR NAKED ASS EITHER!", 'I CAN WAIT! FIND SOME TRUNKS IN THERE!'],
);
/** He's near a tank (the first time). */
export const GUP_TANKWARN = bp(
  ["DON'T TOUCH THAT! IT'S NOT CHLORINE! IT'S SNACKS!", 'GET AWAY FROM THE YELLOW THING!'],
  ["DON'T TOUCH THAT! YOUR HANDS ARE DIRTY! THAT'S THE POINT, ISN'T IT!", 'GET AWAY FROM THE YELLOW THING! YOU HAVE YOUR OWN!'],
  ["DON'T TOUCH THAT! DON'T TOUCH ANYTHING!", 'GET AWAY FROM THE YELLOW THING! AND PUT THAT THING AWAY!'],
);
/** The last tank: the armor's off, he's swollen up. */
export const GUP_ALL = bp(
  ["I'M PUFFY! I'M SO PUFFY! MY ARMOR POPPED OFF!"],
  ["I'M PUFFY! MY ARMOR POPPED OFF! NOW I CAN SMELL YOU THROUGH MY SKIN!"],
  ["I'M PUFFY! MY ARMOR POPPED OFF! NOW WE'RE BOTH NAKED! I HATE IT!"],
);
/** The sitting duck's mutters. */
export const GUP_SLOW = bp(
  ["CAN'T... BREATHE... TWEET...", 'MOUTH TO MOUTH... SOMEBODY...', 'I NEED A BENADRYL... I NEED A HUNDRED...'],
  ["CAN'T BREATHE... YOUR FAULT TWICE...", 'MOUTH TO MOUTH... NOT YOU... NEVER YOU...', 'BENADRYL... AND A NOSE PLUG...'],
  ["CAN'T BREATHE... STOP POSING...", 'MOUTH TO MOUTH... PUT IT AWAY FIRST...', 'BENADRYL... AND A BLINDFOLD...'],
);
/** His last, swollen shut (every tank burst). */
export const GUP_DEATH_ALL = bp(
  ["MY THROAT'S CLOSING... TELL MOM... I'M ALLERGIC TO MY OWN JOB..."],
  ["MY THROAT'S CLOSING... TELL MOM... THE LAST THING I SMELLED WAS YOU..."],
  ["MY THROAT'S CLOSING... TELL MOM... THE LAST THING I SAW WAS THAT..."],
);

/** Out past the shallow end: how deep it gets. */
export const MH_DEEP = bp(
  ['TWELVE FEET MY ASS.', "THIS ISN'T A WAVE POOL. IT'S A TRENCH."],
  ['THIS POOL IS DEEPER THAN MY SHAME. ALMOST.', 'A TRENCH. WITH ME IN IT. AGAIN.'],
  ["THIS IS DEEP. EVERYTHING'S SHRINKING.", 'A TRENCH. AND IT GETS COLDER. GREAT.'],
);
/** The first hits clanking off. */
export const MH_ARMOR = bp(
  ["IT BOUNCES OFF. HE'S WEARING A DRAIN.", "HE'S ARMORED. A FISH IN ARMOR."],
  ["IT BOUNCES OFF. NOTHING BOUNCES OFF ME. IT STICKS.", "HE'S ARMORED. I'M JUST CRUSTED."],
  ["IT BOUNCES OFF. HE'S GOT ARMOR AND I'VE GOT NOTHING.", "HE'S ARMORED. I'M NOT EVEN DRESSED."],
);
/** Into a maze (each, the first time). */
export const MH_MAZE = bp(
  ['A PILE OF DEAD GUESTS. NOBODY READ THE SIGN.', 'A WHOLE MAZE OF DEAD PEOPLE. CLASSIC WATER PARK.', 'SWIMMING THROUGH CORPSES. SIX BUCKS A TUBE.'],
  ['DEAD GUYS. THEY STILL SMELL BETTER THAN ME.', 'A MAZE OF DEAD PEOPLE. FINALLY I FIT IN.', "CORPSES. AT LEAST THEY CAN'T SMELL ME."],
  ['NAKED IN A PILE OF DEAD GUYS. MOM WOULD BE PROUD.', "A MAZE OF CORPSES. DON'T BRUSH UP AGAINST ANYTHING.", "CORPSES. THEY'RE WEARING MORE THAN ME."],
);
/** A tank in sight (the first). */
export const MH_TANK_SEE = bp(
  ["A CHLORINE TANK. A LIFEGUARD WHO WON'T SHOCK HIS POOL. HMM.", 'CHLORINE. BUST IT. SEE WHAT HAPPENS.'],
  ['CHLORINE. I NEED IT MORE THAN THE POOL DOES.', 'A CHLORINE TANK. BUST IT. CLEAN SOMETHING.'],
  ["CHLORINE. THIS IS GONNA STING IN PLACES.", 'A CHLORINE TANK. BUST IT. KEEP YOUR BITS CLEAR.'],
);
/** A tank burst. */
export const MH_TANK = bp(
  ['TAKE YOUR MEDICINE!', 'SHOCK THE POOL!', 'CLEAN WATER! YOUR WORST NIGHTMARE!'],
  ['SHOCK THE POOL! I HELPED!', 'TAKE YOUR MEDICINE! I TOOK MINE IN MY PANTS!', 'CLEAN WATER! FOR ONCE!'],
  ['SHOCK THE POOL! OOH, IT STINGS!', 'TAKE YOUR MEDICINE! IT BURNS MY EVERYTHING!', 'CLEAN WATER! EVERY INCH OF ME!'],
);
/** The last one. */
export const MH_ALL = bp(
  ["HE'S A SITTING DUCK. A SWOLLEN GREEN DUCK."],
  ["HE'S A SITTING DUCK. I'M A SHITTING DUCK."],
  ["HE'S A SITTING DUCK. A NAKED MAN AND A DUCK. CLASSIC."],
);
/** A surge (the first, then now and then). */
export const MH_SURGE = bp(
  ['HERE COMES THE WAVE!', 'THE WAVE MACHINE! HOLD ON!'],
  ['HERE COMES THE WAVE! WASH ME!', "THE WAVE MACHINE! IT'S PUSHING ME AND MY LOAD!"],
  ["HERE COMES THE WAVE! EVERYTHING'S FLAPPING!", "THE WAVE MACHINE! IT'S GOING RIGHT UP MY ASS!"],
);

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here: the callouts, and the death screen (one line, short)

export const HURT3: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:wp3_piss': { hurt: ['PEE! I FELL IN THE PEE!', "IT'S WARM! WHY IS IT WARM?!", 'IN MY MOUTH! IT GOT IN MY MOUTH!'], death: ['DROWNED IN THE PISS FILTER', 'ONE WITH THE PARK'] },
  'm2:wp3_sludge': { hurt: ["IT'S EATING MY FEET!", 'CHEMICALS! HOT CHEMICALS!', 'MY SKIN! IT BURNS!'], death: ['DISSOLVED IN SLUDGE', 'PRODUCT OF ???'] },
  'm2:wp3_spurt': { hurt: ['THE PEE SPURTED UP AT ME!', 'A PEE GEYSER! IN MY EYES!', 'IT SQUIRTED ME!'], death: ['SPRAYED BY THE PISS FILTER', 'PEED ON TO DEATH'] },
  'm2:wp3_gas': { hurt: ['THE GAS! MY EYES!', 'CHLORINE! I CAN TASTE IT!', 'IT BURNS MY NOSE HAIRS!'], death: ['GASSED BY CHEAP CHLORINE', 'INHALED (TOO MUCH)'] },
  'm2:wp3_zap': { hurt: ['THE PUDDLE! IT ZAPPED ME!', 'WET FLOOR! LIVE WIRE!', 'MY TEETH ARE BUZZING!'], death: ['ELECTROCUTED IN A PUDDLE', 'SHOULD HAVE READ WET FLOOR'] },
  'm2:wp3_steam': { hurt: ['STEAM! MY FACE!', "IT'S COOKING ME!", 'MOSTLY OFF MY ASS!'], death: ['STEAMED LIKE A HOT DOG', 'MOSTLY OFF, MY ASS'] },
  'm2:wp3_fan': { hurt: ['THE FAN! IT CHOPPED ME!', 'BLADES! UNDERWATER BLADES!', 'GET AWAY FROM THE FAN!'], death: ['BLENDED BY A FAN', 'CHOPPED UNDERWATER'] },
  'm2:wp3_bleach': { hurt: ['BLEACH IN THE WATER! MY EYES!', "IT'S BLEACHING MY ASSHOLE!", 'THE WATER BURNS!'], death: ['BLEACHED TO DEATH', 'CLEANER THAN EVER'] },
  'm2:wp3_drown': { hurt: ['GLUB! GLUB!', 'NO AIR! NO AIR!', 'I SWALLOWED A PIPE!'], death: ['DROWNED IN A PIPE', 'DROWNED IN THE PLUMBING'] },
  'm2:wp3_janitor': { hurt: ['THE MOP! RIGHT IN THE FACE!', 'A POSSESSED JANITOR HIT ME!', 'GET YOUR MOP OFF ME!'], death: ['MOPPED UP', 'KILLED BY A JANITOR'] },
  'm2:wp3_bucket': { hurt: ['MOP WATER! IN MY MOUTH!', 'HE THREW THE BUCKET AT ME!', 'DIRTY WATER! DIRTIER THAN ME!'], death: ['DROWNED IN A MOP BUCKET', 'DONE IN BY DIRTY WATER'] },
  'm2:wp3_tech': { hurt: ['A WRENCH! TO THE HEAD!', 'THE TECH HIT ME!', 'HE ZAPPED ME WITH HIS PROD!'], death: ['FIXED BY A TECHNICIAN', 'WRENCHED'] },
  'm2:wp3_fuse': { hurt: ['A FUSE! IT BLEW UP ON ME!', 'SPARKS! IN MY HAIR!', 'HE THREW ELECTRICITY AT ME!'], death: ['BLOWN LIKE A FUSE', 'SHORTED OUT'] },
  'm2:wp3_grub': { hurt: ['SOMETHING FELL ON ME! IT BIT ME!', 'A GRUB! ON MY HEAD!', "IT'S SLIMY AND IT BITES!"], death: ['EATEN BY A GRUB', 'SLIMED TO DEATH'] },
  'm2:wp3_eel': { hurt: ['AN EEL! IT BIT ME!', 'SPACE EEL! IN THE PIPE!', 'GET OFF MY LEG!'], death: ['EATEN BY A SPACE EEL', 'EELED'] },
  'm2:wp3_gupwave': { hurt: ['THE WAVE! IT SLAMMED ME!', 'WIPEOUT!', 'TOO MUCH WAVE!'], death: ['WIPED OUT', 'DONE IN BY A WAVE'] },
  'm2:wp3_loogie': { hurt: ['HE SPAT ON ME!', 'ALIEN SNOT! IT BURNS!', 'A LOOGIE! A GREEN ONE!'], death: ['HOCKED TO DEATH', 'DIED IN A LOOGIE'] },
  'm2:wp3_slick': { hurt: ['THE SNOT SLICK! IT BURNS!', 'I SWAM INTO HIS SNOT!', 'GREEN WATER! GREEN WATER!'], death: ['SWAM IN ALIEN SNOT', 'DISSOLVED IN BOOGERS'] },
  'm2:wp3_flop': { hurt: ['BELLY FLOP! ON ME!', 'HE LANDED ON ME!', "HE'S SO HEAVY!"], death: ['BELLY FLOPPED ON', 'CRUSHED BY A LIFEGUARD'] },
  'm2:wp3_breach': { hurt: ['HE CAME UP UNDER ME!', 'HE BIT ME FROM BELOW!', 'JAWS! ALIEN JAWS!'], death: ['EATEN FROM BELOW', 'JAWSED'] },
  'm2:wp3_ram': { hurt: ['HE RAMMED ME!', 'FROM BEHIND! HE CAME FROM BEHIND!', 'HEADBUTT! AN ARMORED HEADBUTT!'], death: ['RAMMED FROM BEHIND', 'FLANKED BY A FISH'] },
  'm2:wp3_chomp': { hurt: ['HE BIT ME!', 'BUCK TEETH! IN MY ARM!', 'HE ATE A PIECE OF ME!'], death: ['EATEN BY A LIFEGUARD', 'CHEWED UP AND SPAT OUT'] },
  'm2:wp3_hand': { hurt: ['A DEAD GUY GRABBED ME!', "LET GO! YOU'RE DEAD!", 'THE CORPSE HAS ME!'], death: ['HELD DOWN BY THE DEAD', 'ONE OF THE PILE NOW'] },
  'm2:wp3_snag': { hurt: ['REBAR! IN MY SIDE!', 'A FISH HOOK! IN MY NIPPLE!', 'A BONE! I GOT STABBED BY A BONE!'], death: ['SNAGGED ON A DEAD GUY', 'HUNG UP ON THE PILE'] },
  'm2:wp3_pooldrown': { hurt: ['GLUB! GLUB!', 'NO AIR! NO AIR!', 'TOO DEEP! TOO DEEP!'], death: ['DROWNED IN THE DEEP END', 'DROWNED IN A WAVE POOL'] },
  'm2:wp3_gup': { hurt: ['HE BUMPED ME! WITH HIS GUT!', 'GET YOUR GUT OFF ME!', "HE'S SLIMY!"], death: ['KILLED BY A LIFEGUARD', 'GUTTED BY GUPPLAX'] },
};

// ---------------------------------------------------------------------------------------------------------------

const all = (...pools: (string | string[] | ByPants)[]) => pools.flatMap(p => (typeof p === 'string' ? [p] : Array.isArray(p) ? p : Object.values(p).flat()));
export const PARK3_VOICE_LINES: Record<string, string[]> = {
  meathead: all(MH_DOOR3, MH_IN, MH_PISS, MH_CHEM, MH_GANG, MH_SHAFT, MH_SWIM, MH_VALVE, MH_PUSHED, MH_PUMP, MH_TEASE_THUMP, MH_TEASE_LOOK, MH_AIR_LOW, MH_FLUSHED, MH_GUP, MH_LAUNCH, GRAB_GUP, MH_DEEP, MH_ARMOR, MH_MAZE, MH_TANK_SEE, MH_TANK, MH_ALL, MH_SURGE, ...Object.values(HURT3).map(h => h.hurt)),
  death: all(...Object.values(HURT3).map(h => h.death)),
  [GUP_VOICE]: all(GUP_INTRO, GUP_INTRO2, GUP_RETRY, GUP_TAUNT, GUP_PATTER, GUP_WAVE, GUP_HURT, GUP_LOW, GUP_DEATH, GUP_ARMOR, GUP_CHLORINE1, GUP_CHLORINE, GUP_SNEEZE, GUP_FLANK, GUP_BONK, GUP_MAZE, GUP_TANKWARN, GUP_ALL, GUP_SLOW, GUP_DEATH_ALL),
  [STAFF_VOICE.m]: all(STAFF_BARK), [STAFF_VOICE.f]: all(STAFF_BARK),
};
