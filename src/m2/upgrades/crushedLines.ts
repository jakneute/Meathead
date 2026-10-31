// THE CHEAP SHOT's lines (cheapShot.ts; SPEC.md's hand armor, "AFTER IT, NEW LINES"): the owner's "if you crush a
// boss's balls/ovaries, they get new lines for the remainder of the fight." Each boss and sub-boss it works on: the
// scream as the boot lands, then its hurt, taunt and attack lines swapped for these till the fight's over (they die, or
// he does). Squeaky, wheezing, vengeful, pitiful, played to the sin. Every set in clean / shitty / nude: the boss
// reacting to the state Meathead's in. Each in the boss's own voice (tools/voices/cast.json); recorded off
// CRUSHED_VOICE_LINES (upgrades/lines.ts puts them in UPGRADE_VOICE_LINES: extract.ts and m2pack.ts read that).

export type Dressed = 'clean' | 'shitty' | 'nude';
export type CrushPants = Record<Dressed, readonly string[]>;
export type CrushGroup = 'hurt' | 'taunt' | 'attack';
export type CrushId = 'artie' | 'donnie' | 'queen' | 'steve' | 'harry' | 'tucker' | 'piper' | 'dad' | 'rex' | 'demon'
  | 'perot' | 'falwell' | 'limbaugh' | 'dole' | 'newt';

export interface CrushSet {
  voice: string;
  /** Ovaries, not balls (the close-up); a machine (oil and sparks); a cartoon's (the slapstick close-up). */
  female: boolean; robot: boolean; slapstick: boolean;
  /** Glitter in the blood. */
  glitter?: boolean;
  /** As the boot lands. */
  scream: CrushPants;
  hurt: CrushPants; taunt: CrushPants; attack: CrushPants;
}

/** Meathead's, after the boot (waiting till their scream's done). */
export const MEATHEAD_CHEAP: CrushPants = {
  clean: ['RIGHT IN THE SNACK DRAWER!', 'THAT ONE WAS FOR MY MOM!', 'BALLS DEEP! MY BOOT, I MEAN!', 'FIELD GOAL!', 'NO RULES! NO REFS! NO NUTS!'],
  shitty: ["I SHIT MYSELF, YOU SHIT YOURS! WE'RE EVEN!", 'NOW WE BOTH NEED NEW PANTS!', 'DIRTY PANTS, DIRTY FIGHTING!', 'SMELL THAT? THAT WAS YOUR FUTURE KIDS!'],
  nude: ["MINE ARE OUT AND STILL ATTACHED! YOURS AREN'T!", "NOTHING BETWEEN MY BOOT AND YOUR NUTS BUT AIR!", 'NAKED AND UNDEFEATED!', "LOOK AT ME! THEN LOOK AT YOUR CROTCH! CRY!"],
};

const set = (voice: string, flags: Partial<Pick<CrushSet, 'female' | 'robot' | 'slapstick' | 'glitter'>>, lines: Pick<CrushSet, 'scream' | 'hurt' | 'taunt' | 'attack'>): CrushSet =>
  ({ voice, female: false, robot: false, slapstick: false, ...flags, ...lines });

export const CRUSHED: Record<CrushId, CrushSet> = {
  // ---- SAFARI ARTIE (pride): the greatest hunter in the park, the act, the hat; now a soprano
  artie: set('m2.safari', {}, {
    scream: {
      clean: ['MY NUTS! MY BEAUTIFUL AWARD-WINNING NUTS!', 'EEEEEE! THAT WAS MY TALENT!'],
      shitty: ['MY NUTS! AND YOUR SHIT BOOT! THEY TOUCHED!', 'EEEEEE! IT GOT SHIT IN IT!'],
      nude: ['MY NUTS! KICKED BY A NAKED MAN! IN MY OWN PARK!', "EEEEEE! YOUR DICK SLAPPED ME TOO!"],
    },
    hurt: {
      clean: ["OW! NOT THERE! THERE'S NOTHING THERE ANYMORE!", 'I HAVE TO SIT DOWN! I CAN NEVER SIT DOWN AGAIN!', 'MY VOICE! I SOUND LIKE A TOUCAN!'],
      shitty: ['OW! YOU SMELL AND I SQUEAK! WHAT A TOUR!', "MY VOICE! IT'S UP HERE NOW! AWAY FROM YOUR SMELL!", "STOP! I'M TOO HIGH PITCHED TO DIE!"],
      nude: ["OW! STOP! YOURS ARE BOUNCING AND MINE ARE GONE!", 'MY VOICE! I SOUND LIKE YOUR DICK LOOKS! TINY!', "I'M A SOPRANO AND YOU'RE A NUDIST! WE'RE BOTH FREAKS!"],
    },
    taunt: {
      clean: ['THE GREATEST HUNTER IN THE PARK! NOW WITH ONE LESS GUN!', "I'LL STILL KILL YOU! I'LL JUST DO IT AN OCTAVE HIGHER!", 'NOBODY LAUGH! THIS IS A SERIOUS VOICE!'],
      shitty: ["YOU STILL STINK! I CAN SMELL IT IN MY NEW HIGH VOICE!", "I LOST MY NUTS! YOU LOST YOUR BOWELS! I'M STILL WINNING!", 'COME HERE, STINKY! THE SOPRANO WANTS YOU DEAD!'],
      nude: ["PUT YOUR NUTS AWAY! YOU'RE RUBBING IT IN!", "DON'T STRUT! THEY'RE JUST HANGING THERE TAUNTING ME!", 'I USED TO HAVE A PAIR LIKE THAT! BIGGER! WAY BIGGER!'],
    },
    attack: {
      clean: ['FOR MY NUTS!', 'EAT THIS! IN A HIGH VOICE!', 'THIS ONE IS FOR MY SET AND MY SACK!'],
      shitty: ['FOR MY NUTS, YOU TURD!', 'DIE STINKY! SQUEAK SQUEAK!', "I'LL GUT YOU! YOU'RE ALREADY HALF EMPTY!"],
      nude: ['FOR MY NUTS! AIM FOR HIS!', 'DIE NAKED! DIE STUPID!', "I'M TAKING YOURS TO REPLACE MINE!"],
    },
  }),
  // ---- DONNIE DRACULA (gluttony): the bottomless appetite; now he can't keep a thing down
  donnie: set('m2.donnie', {}, {
    scream: {
      clean: ['MY NUTS! I CAN TASTE THEM! WHY CAN I TASTE THEM?!', 'GURK! I JUST LOST MY APPETITE! I NEVER LOSE MY APPETITE!'],
      shitty: ['MY NUTS! AND YOUR SHIT BOOT! I THINK I ATE SOME!', 'GURK! THAT BOOT TASTED LIKE YOUR PANTS!'],
      nude: ["MY NUTS! YOU'RE NAKED AND I'M NOT EVEN HUNGRY ANYMORE!", 'GURK! SOMETHING BOUNCED ON MY FACE!'],
    },
    hurt: {
      clean: ["OW! I'M GONNA BARF UP EVERY HOOKER I EVER ATE!", "STOP! I CAN'T EVEN THINK ABOUT A SNACK!", 'MY NUTS ARE IN MY THROAT! I HAVE TO SWALLOW THEM!'],
      shitty: ["OW! YOU SMELL LIKE A BUFFET'S DUMPSTER!", "STOP! I'M GONNA HURL AND YOU'RE GONNA MATCH!", "MY STOMACH! MY NUTS! MY NOSE! EVERYTHING HURTS!"],
      nude: ["OW! YOUR NAKED ASS IS NOT ON MY MENU!", "STOP! I'VE LOST MY APPETITE! LOOK AT YOU!", 'MY NUTS ARE IN MY THROAT! YOURS ARE IN MY FACE!'],
    },
    taunt: {
      clean: ["I'M GONNA DRINK YOU! THROUGH A STRAW! SITTING DOWN! VERY CAREFULLY!", "SATAN GAVE ME POWERS! HE DIDN'T GIVE ME A CUP!", "I'LL EAT YOUR WHOLE FAMILY! STARTING WITH THE BALLS!"],
      shitty: ["I'M STILL GONNA DRINK YOU! I'LL HOLD MY NOSE!", "I'LL EAT YOU! I'LL EAT YOUR PANTS LAST! MAYBE NEVER!", "YOU STINK AND I'M NAUSEOUS! BAD COMBO, MEATHEAD!"],
      nude: ["I'LL DRINK YOU DRY! THEN I'LL GET YOU SOME PANTS!", "COVER THAT UP! I'M ALREADY SICK TO MY STOMACH!", "I'LL EAT YOUR NUTS! THEY LOOK LIKE COCKTAIL WIENERS!"],
    },
    attack: {
      clean: ['DINNER TIME! FOR REVENGE!', 'BLOOD! I NEED BLOOD! I LOST SO MUCH DOWN THERE!', 'EAT THIS! I CAN NO LONGER EAT!'],
      shitty: ['DINNER TIME! UGH! STILL DINNER TIME!', 'BLOOD! FROM THE CLEAN END!', 'BITE! HOLD YOUR BREATH, DONNIE!'],
      nude: ['DINNER TIME! NAKED DINNER!', 'BLOOD! FROM THE NECK! NOT DOWN THERE!', 'BITE! KEEP YOUR EYES UP, DONNIE!'],
    },
  }),
  // ---- THE QUEEN (the robot): a breeding machine, flat and electronic, filing complaints
  queen: set('m2.space.queen', { female: true, robot: true }, {
    scream: {
      clean: ['ERROR. ERROR. REPRODUCTIVE UNIT. DESTROYED.', 'KRRZZT. OVARIES. OFFLINE.'],
      shitty: ['ERROR. REPRODUCTIVE UNIT DESTROYED. ALSO CONTAMINATED.', 'KRRZZT. OVARIES OFFLINE. SMELL SENSOR ONLINE. REGRETTABLY.'],
      nude: ['ERROR. REPRODUCTIVE UNIT DESTROYED. BY A NUDE MALE. MISSION IRONY DETECTED.', 'KRRZZT. OVARIES OFFLINE. HIS ARE ONLINE. UNFAIR.'],
    },
    hurt: {
      clean: ['DAMAGE. DAMAGE. EGG COUNT. ZERO.', 'PAIN SUBROUTINE. STUCK ON.', 'WARRANTY. VOID.'],
      shitty: ['DAMAGE. AND ODOR. MAXIMUM ODOR.', 'PAIN SUBROUTINE. AND GAG SUBROUTINE.', 'ATTACKER IS LEAKING. ATTACKER IS WINNING.'],
      nude: ['DAMAGE. VISUAL SENSORS. ALSO DAMAGED.', 'PAIN. SUBROUTINE. HIS GENITALS. STILL IN FRAME.', 'WARRANTY VOID. DIGNITY VOID.'],
    },
    taunt: {
      clean: ['NEW DIRECTIVE. NO BREEDING. ONLY KILLING.', 'MATING RITUAL. CANCELED. FUNERAL RITUAL. SCHEDULED.', 'YOU KICKED MY OVARIES. I WILL KICK YOUR EVERYTHING.'],
      shitty: ['NEW DIRECTIVE. KILL THE STINKING ONE.', 'MATING RITUAL CANCELED. ON HYGIENE GROUNDS ALONE.', 'YOUR DIAPER IS FULL. YOUR LIFE WILL BE EMPTY.'],
      nude: ['NEW DIRECTIVE. KILL THE NUDE ONE. THEN BLEACH OPTICS.', 'MATING RITUAL CANCELED. YOU ARE TOO SMALL ANYWAY.', 'YOUR GENITALS ARE EXPOSED. RETALIATION. IMMINENT.'],
    },
    attack: {
      clean: ['REVENGE MODE.', 'EXECUTING. VENGEANCE.EXE.', 'TARGET. LOCKED. ON CROTCH.'],
      shitty: ['REVENGE MODE. NOSE PLUGS ENGAGED.', 'EXECUTING. VENGEANCE. AND DISINFECTANT.', 'TARGET LOCKED. ON THE BROWN ZONE.'],
      nude: ['REVENGE MODE. EYES. AVERTED.', 'EXECUTING. VENGEANCE. AND A TOWEL.', 'TARGET LOCKED. ON THE DANGLING PARTS.'],
    },
  }),
  // ---- STUNTMAN STEVE (envy): two seconds in one real movie, jealous of everybody; now jealous of Meathead's balls too
  steve: set('m2.hollywood.steve', {}, {
    scream: {
      clean: ['MY NUTS! THEY WERE THE ONLY PART OF ME THAT WAS NEVER A STUNT DOUBLE!', 'AAAH! DID THE JUMBOTRON GET THAT?! DON\'T REPLAY THAT!'],
      shitty: ['MY NUTS! WITH A SHIT BOOT! GET ME A MEDIC! AND A SHOWER!', 'AAAH! DO NOT PUT THAT ON THE REPLAY!'],
      nude: ['MY NUTS! THE NAKED GUY STILL HAS HIS! IT\'S NOT FAIR!', 'AAAH! HIS DICK WAS ON THE JUMBOTRON TOO!'],
    },
    hurt: {
      clean: ["OW! I'M CALLING MY UNION!", "STOP! I WANT MY STUNT DOUBLE! I AM MY STUNT DOUBLE!", "OW! MY VOICE IS TOO HIGH FOR ACTION MOVIES NOW!"],
      shitty: ["OW! YOU SMELL AND THE CROWD STILL LIKES YOU MORE!", 'STOP! WHY DO THEY CHEER FOR THE SHITTY GUY?!', "OW! I'D TRADE MY NUTS FOR YOUR FANS! OH WAIT!"],
      nude: ["OW! THE NAKED GUY GETS A STANDING OVATION?!", "STOP! YOU STILL HAVE YOURS! I'M JEALOUS OF YOUR NUTS!", "OW! EVEN YOUR DICK HAS MORE SCREEN TIME THAN ME!"],
    },
    taunt: {
      clean: ['YOU STOLE MY CROWD! THEN YOU STOLE MY NUTS!', "THEY'LL MAKE A MOVIE ABOUT THIS! I WON'T BE IN IT!", "EVERYBODY GETS A PAIR BUT ME! EVERYBODY!"],
      shitty: ['YOU STOLE MY NUTS AND YOU STILL STINK! HOW DO YOU GET FANS?!', "THEY CHEER FOR SHIT NOW! SHIT IS THE BIG STAR!", "I'D KILL FOR YOUR FAME! I'D EVEN SHIT MYSELF!"],
      nude: ['STOP SHOWING OFF YOURS! I CAN SEE THEM SWINGING!', "NAKED! FAMOUS! INTACT! I HATE YOU SO MUCH!", "I'D KILL FOR WHAT YOU'VE GOT! I KNOW EXACTLY WHAT YOU'VE GOT!"],
    },
    attack: {
      clean: ['GET HIM! GET HIS NUTS! SAME AS MINE!', 'RUN HIM DOWN! FOR MY CAREER! AND MY CROTCH!', 'HIT HIM WHERE IT HURTS! I KNOW WHERE!'],
      shitty: ['GET HIM! RUN OVER THE STINK!', 'RUN HIM DOWN! HOSE THE CAR AFTER!', 'HIT HIM! HIT HIM IN THE BROWN!'],
      nude: ['GET HIM! AIM FOR THE DANGLY BITS!', 'RUN HIM DOWN! TAKE HIS NUTS FOR ME!', 'HIT HIM! HE HAS WHAT I LOST!'],
    },
  }),
  // ---- HELICOPTER HARRY (wrath): the M60, the rage; his nuts exploded and now he's angrier than ever, still shooting
  harry: set('m2.foreign.harry', {}, {
    scream: {
      clean: ['MY NUTS! THEY EXPLODED! LIKE NAPALM! IN MY PANTS!', 'AAARGH! YOU FOREIGN NUT BUSTER!'],
      shitty: ['MY NUTS EXPLODED! AND YOU SHIT YOURSELF! NOBODY WINS!', 'AAARGH! WHAT KIND OF SOLDIER SHITS AND KICKS?!'],
      nude: ['MY NUTS EXPLODED! YOURS ARE JUST HANGING THERE! WAVING!', 'AAARGH! A NAKED MAN BLEW UP MY JUNK!'],
    },
    hurt: {
      clean: ['I DON\'T FEEL PAIN! I FEEL A DRAFT!', "OW! I'M MAD! I'M SO MAD I'M BLEEDING OUT MY PANTS!", 'MY NUTS ARE IN THREE COUNTRIES NOW!'],
      shitty: ['OW! I WILL SHOOT THE SHIT OUT OF YOU! AGAIN!', "I'M BLEEDING! YOU'RE LEAKING! THIS IS WAR!", 'MY NUTS ARE GONE AND I STILL SMELL YOU!'],
      nude: ["OW! STOP SWINGING THOSE AT ME! I HAVE NONE!", "I'M BLEEDING OUT MY PANTS! YOU DON'T EVEN HAVE PANTS!", 'MY NUTS ARE GONE! YOURS ARE OUT! I HATE THIS!'],
    },
    taunt: {
      clean: ["YOU THINK I'M ANGRY? I'M NUTLESS ANGRY!", 'I WILL SHOOT YOU FOR EVERY NUT I LOST! TWICE!', 'NO BALLS! NO MERCY! NO PROBLEM!'],
      shitty: ["I'LL SHOOT YOU TILL YOUR SHIT HAS HOLES IN IT!", 'NUTLESS AND FURIOUS! YOU SMELL LIKE A FOXHOLE!', 'NO BALLS! NO MERCY! NO TOILET FOR YOU!'],
      nude: ["I'LL SHOOT THOSE NUTS RIGHT OFF YOU! FAIR'S FAIR!", 'NUTLESS AND FURIOUS! YOU ARE NAKED AND DEAD!', 'NO BALLS! NO MERCY! NO PANTS EITHER, I SEE!'],
    },
    attack: {
      clean: ['EAT LEAD, NUT KICKER!', 'RAT TAT TAT! FOR MY NUTS!', 'DIE! DIE FOR WHAT YOU DID DOWN THERE!'],
      shitty: ['EAT LEAD, SHIT PANTS!', 'RAT TAT TAT! RIGHT IN THE STAIN!', 'DIE! DIE SMELLING!'],
      nude: ['EAT LEAD! IN THE NUTS!', 'RAT TAT TAT! AIM LOW, HARRY!', 'DIE! DIE NAKED, YOU NUT BUSTER!'],
    },
  }),
  // ---- TUCKER (greed): blind, everything a price; his nuts were worth money
  tucker: set('m2.frontier.tucker', {}, {
    scream: {
      clean: ['MY NUTS! THEM WAS WORTH GOOD MONEY!', 'YEEEOW! I HAD THEM APPRAISED!'],
      shitty: ['MY NUTS! AND I CAN SMELL WHO DONE IT!', 'YEEEOW! I CAN\'T SEE YOU BUT I CAN SMELL YOUR PANTS!'],
      nude: ['MY NUTS! I CAN\'T SEE BUT I FELT SOMETHING FLOPPY HIT MY LEG!', 'YEEEOW! WHAT WAS THAT SLAPPING SOUND?!'],
    },
    hurt: {
      clean: ["OW! THAT'S A LAWSUIT! THAT'S A BIG LAWSUIT!", "STOP! I'M BLIND AND BROKE DOWN THERE!", "OW! YOU OWE ME TWO NUTS! PLUS INTEREST!"],
      shitty: ["OW! I'M BILLING YOU FOR THE SMELL TOO!", "STOP! I CAN'T SEE! I SURE CAN SMELL!", "OW! I'LL SELL YOUR PANTS FOR FERTILIZER!"],
      nude: ["OW! I CAN HEAR YOUR NUTS SLAPPING! SHOWOFF!", "STOP! I'LL TAKE YOURS AS PAYMENT!", 'OW! HOW MUCH YOU WANT FOR THEM? NAME YOUR PRICE!'],
    },
    taunt: {
      clean: ["THEM NUTS WAS MY RETIREMENT! YOU'RE GONNA PAY!", "I'M BLIND AND BUSTED! I'M STILL RICHER THAN YOU!", "I'LL SKIN YOU AND SELL THE HIDE! I NEED THE MONEY NOW!"],
      shitty: ["YOU OWE ME TWO NUTS AND A NOSE!", "I CAN SMELL WHERE YOU ARE! THAT'S FREE TRACKING!", "I'LL SELL YOUR SHIT PANTS! SOMEBODY'LL BUY 'EM!"],
      nude: ["I CAN HEAR 'EM SWINGING! I'M SHOOTING AT THE SOUND!", "THEM'S NICE NUTS YOU GOT! THEY'RE MINE NOW!", "I'LL MOUNT YOUR BALLS OVER MY FIREPLACE!"],
    },
    attack: {
      clean: ['TAKE THAT! THAT ONE WAS EXPENSIVE!', "THIS SHOT'S ON YOUR TAB!", 'PAY UP!'],
      shitty: ["TAKE THAT! I'M AIMING AT THE STINK!", 'FOLLOW THE SMELL, TUCKER!', 'PAY UP, SHIT PANTS!'],
      nude: ['TAKE THAT! RIGHT IN THE FLOPPY SOUND!', 'AIM FOR THE SLAPPING!', 'PAY UP! WITH THEM NUTS!'],
    },
  }),
  // ---- PIPER THE PIXIE (lust): wanted men to kill each other over her; ovaries through the fat, glitter in the blood
  piper: set('m2.fantasy.piper', { female: true, glitter: true }, {
    scream: {
      clean: ['MY OVARIES! THROUGH ALL THIS?! HOW?!', 'EEEEEK! NOBODY WILL EVER DUEL OVER ME NOW!'],
      shitty: ['MY OVARIES! AND HE SHIT HIMSELF FIRST! WHAT A DATE!', 'EEEEEK! THAT BOOT WAS FILTHY!'],
      nude: ['MY OVARIES! FROM A NAKED MAN! THIS IS NOT HOW I PICTURED IT!', 'EEEEEK! THAT IS NOT THE WAY A NAKED MAN IS SUPPOSED TO HURT ME!'],
    },
    hurt: {
      clean: ["OW! THAT'S IT! NO MORE SUITORS! EVER!", 'MY OVARIES! I WAS SAVING THEM FOR A KNIGHT!', "STOP! I'M BLEEDING GLITTER!"],
      shitty: ["OW! YOU'RE THE WORST MAN THAT EVER TOUCHED ME! AND THAT'S A LIST!", 'STOP! YOU SMELL LIKE A TROLL BRIDGE!', "OW! I'M BLEEDING GLITTER AND YOU'RE LEAKING SHIT!"],
      nude: ["OW! A NAKED MAN AND NOTHING SEXY HAPPENING! HOW?!", "STOP! PUT IT AWAY! I'M NOT IN THE MOOD! I'LL NEVER BE IN THE MOOD!", "OW! I'M BLEEDING GLITTER! YOU'RE JUST FLOPPING!"],
    },
    taunt: {
      clean: ['MEN WERE SUPPOSED TO DIE FOR ME! YOU WILL!', 'YOU RUINED MY LOVE LIFE! I WILL RUIN YOUR EVERYTHING!', 'NOBODY KICKS A PIXIE IN THE BABY MAKERS!'],
      shitty: ['MEN USED TO KILL FOR ME! NOW I GET THE SHITTY ONE!', 'YOU RUINED ME! AND MY CARPET!', 'NOBODY TOUCHES PIPER! ESPECIALLY NOT DIRTY!'],
      nude: ["YOU'RE NAKED AND I FEEL NOTHING! NOTHING! YOU DID THAT!", "STOP STANDING LIKE THAT! IT'S NOT WORKING ANYMORE!", 'I WANTED A NAKED MAN! NOT LIKE THIS!'],
    },
    attack: {
      clean: ['FOR MY OVARIES!', 'BELLY SLAM! WITH FEELING!', 'DIE! LIKE A SUITOR SHOULD!'],
      shitty: ['FOR MY OVARIES! AND MY RUG!', 'SQUASH THE STINK!', 'DIE! AND TAKE YOUR SMELL WITH YOU!'],
      nude: ['FOR MY OVARIES! SQUASH THE NAKED ONE!', 'SIT ON THE NAKED MAN! NOT LIKE THAT!', 'DIE! WITH YOUR PRIVATES OUT! HUMILIATING!'],
    },
  }),
  // ---- DAD GUY (sloth): the couch, the beer; now he needs ice and somebody else to get it
  dad: set('m2.cartoon.dad', {}, {
    scream: {
      clean: ['MY BEER NUTS! SOMEBODY GET ME A BAG OF ICE!', 'OOOOOH! HONEY! HONEY! THE NUTS!'],
      shitty: ['MY NUTS! YOU KICKED ME WITH A SHIT BOOT! ON MY COUCH!', 'OOOOOH! NOW THE COUCH SMELLS LIKE BOTH OF US!'],
      nude: ['MY NUTS! A NAKED GUY KICKED MY NUTS ON MY OWN COUCH!', 'OOOOOH! YOUR STUFF WAS ON MY RECLINER!'],
    },
    hurt: {
      clean: ["OW! I CAN'T GET UP! I COULDN'T GET UP BEFORE EITHER!", 'ICE! BEER! A BAG OF ICE WITH BEER IN IT!', "OW! SON! SOMEBODY! GET ME A COLD ONE FOR MY NUTS!"],
      shitty: ["OW! YOU STINK AND I'M TOO LAZY TO LEAVE!", 'ICE! AND AIR FRESHENER! AND BEER!', "OW! I SAT IN WORSE! I'M SITTING IN WORSE RIGHT NOW!"],
      nude: ["OW! PUT SOME PANTS ON! I'M TRYING TO WATCH TV!", 'ICE! AND A BLINDFOLD!', "OW! YOU'RE NAKED AND I CAN'T EVEN WALK AWAY!"],
    },
    taunt: {
      clean: ["YOU KICKED MY NUTS! NOW I REALLY AIN'T GETTING UP!", "WHO NEEDS NUTS? I GOT A COUCH!", "I'M GONNA KILL YOU! RIGHT AFTER A NAP!"],
      shitty: ["YOU SMELL LIKE MY COUCH CUSHIONS! THE BACK ONES!", "I SHIT MYSELF ON PURPOSE! YOU'RE JUST AN AMATEUR!", "I'M GONNA KILL YOU! AFTER YOU GO HOME AND WASH!"],
      nude: ["GET YOUR NAKED ASS OFF MY SET!", "IN MY DAY WE WORE PANTS TO KICK NUTS!", "I'M GONNA KILL YOU! PUT A ROBE ON FIRST!"],
    },
    attack: {
      clean: ['SIT DOWN! FOREVER!', 'BONK! THAT ONE WAS FOR MY BEER NUTS!', 'GET OFF MY LAWN! MY COUCH! MY NUTS!'],
      shitty: ['SIT DOWN! NOT ON MY COUCH!', 'BONK! SMELLY!', 'GET AWAY FROM ME, STINKY!'],
      nude: ['SIT DOWN! PUT A TOWEL DOWN FIRST!', 'BONK! RIGHT ON THE DANGLER!', 'GET AWAY FROM ME, NUDIE!'],
    },
  }),
  // ---- THE REX (the animatronic): a crotch hatch, robot balls; the designers were silly people
  rex: set('m2.rex', { robot: true }, {
    scream: {
      clean: ['WARNING. NUT HATCH. BREACHED.', 'RAAAWR. ERROR. TESTICLE MODULES. CRUSHED.'],
      shitty: ['WARNING. NUT HATCH BREACHED. FECAL MATTER IN THE GEARS.', 'RAAAWR. ERROR. CRUSHED. AND SOILED.'],
      nude: ['WARNING. NUT HATCH BREACHED. BY AN UNDRESSED GUEST.', 'RAAAWR. ERROR. GUEST GENITALS. CONTACTED SENSOR.'],
    },
    hurt: {
      clean: ['DAMAGE. ROAR PITCH. TOO HIGH.', 'MAINTENANCE. MAINTENANCE. LOWER HATCH.', 'RAWR. SQUEAK. RAWR.'],
      shitty: ['DAMAGE. ODOR. FILTER FAILURE.', 'MAINTENANCE. BRING A MOP.', 'RAWR. GAG. RAWR.'],
      nude: ['DAMAGE. PLEASE KEEP CLOTHES ON AT ALL TIMES.', 'MAINTENANCE. BRING A TOWEL.', 'RAWR. SQUEAK. EYES. CLOSED.'],
    },
    taunt: {
      clean: ['ANIMATRONIC. NOW. ANGRY.', 'THE DESIGNERS GAVE ME NUTS. YOU TOOK THEM.', 'RAWR. YOU WILL BE EXTINCT.'],
      shitty: ['ANIMATRONIC. ANGRY. NAUSEOUS.', 'GUEST HYGIENE. UNACCEPTABLE. GUEST WILL BE EATEN.', 'RAWR. YOU WILL BE EXTINCT. AND HOSED.'],
      nude: ['ANIMATRONIC. ANGRY. EMBARRASSED.', 'DRESS CODE VIOLATION. PENALTY. DEATH.', 'RAWR. YOUR NUTS. NEXT.'],
    },
    attack: {
      clean: ['STOMP. FOR. NUTS.', 'BITE. VENGEANCE.', 'CHOMP.'],
      shitty: ['STOMP. ON THE STINK.', 'BITE. HOLD BREATH.', 'CHOMP. GAG.'],
      nude: ['STOMP. ON THE NAKED ONE.', 'BITE. NOT THERE.', 'CHOMP. EYES UP.'],
    },
  }),
  // ---- BRATHAZAR (the hell demon): Satan's boy, desperate to impress Dad; now he wants his mom
  demon: set('m2.demon', {}, {
    scream: {
      clean: ['MY UNHOLY NUTS! DAD! DAAAD!', 'AAAH! DON\'T TELL MY DAD! DON\'T TELL ANYBODY!'],
      shitty: ['MY UNHOLY NUTS! AND HE SMELLS WORSE THAN HELL!', 'AAAH! A SHITTY BOOT! IN HELL! DAD!'],
      nude: ['MY UNHOLY NUTS! A NAKED MORTAL! DAD IS GONNA LAUGH AT ME!', 'AAAH! HIS WERE RIGHT THERE! I SAW EVERYTHING!'],
    },
    hurt: {
      clean: ['OW! THIS IS NOT METAL! THIS IS SO NOT METAL!', "STOP! I'M TELLING MY MOM!", 'OW! I CAN NEVER BREED A LEGION NOW!'],
      shitty: ['OW! EVEN HELL DOES NOT SMELL THIS BAD!', 'STOP! DAD SAID MORTALS WERE CLEAN!', "OW! I'M GONNA PUKE BRIMSTONE!"],
      nude: ['OW! NAKED AND WINNING! HOW?!', 'STOP! PUT IT AWAY! DAD MIGHT BE WATCHING!', 'OW! HIS ARE BIGGER THAN MINE WERE! UNHOLY!'],
    },
    taunt: {
      clean: ["I'LL STILL IMPRESS MY DAD! I'LL DO IT SITTING DOWN!", 'I WILL SHRED YOU! ONE OCTAVE HIGHER!', "DAD! ARE YOU WATCHING?! DON'T WATCH!"],
      shitty: ["I'LL IMPRESS DAD! I'LL KILL THE SHITTY ONE!", 'YOU SMELL LIKE THE NINTH CIRCLE! THE TOILET CIRCLE!', "DAD! DON'T SMELL THIS!"],
      nude: ["I'LL IMPRESS DAD! I'LL KILL THE NUDIST!", 'PUT IT AWAY! I HAVE NOTHING TO COMPARE IT WITH ANYMORE!', "DAD! LOOK AWAY! BOTH OF YOU, LOOK AWAY!"],
    },
    attack: {
      clean: ['FOR DAD! AND MY NUTS!', 'SHRED!', 'FACE MELTER! NUTS AVENGER!'],
      shitty: ['FOR DAD! HOLD YOUR NOSE!', 'SHRED THE STINK!', 'FACE MELTER! PANTS MELTER!'],
      nude: ['FOR DAD! AIM HIGH!', 'SHRED THE NAKED ONE!', 'FACE MELTER! NOT THAT FACE!'],
    },
  }),
  // ---- THE PUNDITS (the White House: a cartoon show's): the slapstick nut shot, their own talking points
  perot: set('m2.cartoon.perot', { slapstick: true }, {
    scream: {
      clean: ["OOOF! THAT'S A GIANT CRUSHING SOUND!", 'HOO-WEE! RIGHT IN THE DEFICIT!'],
      shitty: ['OOOF! A GIANT CRUSHING SOUND! AND A GIANT SMELL!', 'HOO-WEE! THAT BOOT WAS DIRTY!'],
      nude: ['OOOF! FROM A NAKED FELLA! NOW LOOK HERE!', "HOO-WEE! I SAW YOUR CHARTS, SON!"],
    },
    hurt: {
      clean: ['OW! I GOT A CHART FOR THAT! IT GOES DOWN!', 'NOW WAIT A MINUTE! MY NUTS ARE IN THE RED!'],
      shitty: ["OW! THAT'S A GIANT STINKING SOUND!", 'NOW WAIT A MINUTE! WIPE FIRST!'],
      nude: ['OW! PUT THOSE AWAY! THEY AIN\'T ON THE BALLOT!', 'NOW WAIT A MINUTE! THAT IS NOT A PIE CHART!'],
    },
    taunt: {
      clean: ["MY EARS STILL WORK! MY NUTS DON'T!", "I'LL BALANCE THIS BUDGET! WITH YOUR CORPSE!"],
      shitty: ["I CAN HEAR THE SMELL WITH THESE EARS!", "I'LL BALANCE THIS BUDGET! YOU BALANCE YOUR BOWELS!"],
      nude: ["THAT RIGHT THERE IS WHY WE NEED REFORM!", "I'LL BALANCE THIS BUDGET! YOU BUY SOME PANTS!"],
    },
    attack: {
      clean: ["HERE'S A CHART! IT'S ALL PAIN!", 'PIE CHART! EAT IT!'],
      shitty: ["HERE'S A CHART! IT'S ALL BROWN!", 'PIE CHART! WIPE WITH IT!'],
      nude: ["HERE'S A CHART! COVER UP WITH IT!", 'PIE CHART! NOT THAT PIE!'],
    },
  }),
  falwell: set('m2.cartoon.falwell', { slapstick: true }, {
    scream: {
      clean: ['OOOOOH! THE LORD GIVETH! AND YOU KICKETH!', 'HNNNG! SATAN! THAT FOOT WAS SATAN!'],
      shitty: ['OOOOOH! A FILTHY FOOT! A SINFUL FILTHY FOOT!', 'HNNNG! WASH YOUR SOUL! AND YOUR PANTS!'],
      nude: ['OOOOOH! A NAKED SINNER! IN MY BEDROOM!', 'HNNNG! I SAW THE DEVIL! IT WAS DANGLING!'],
    },
    hurt: {
      clean: ['OW! THIS IS PERSECUTION!', 'LORD! I DID NOT NEED THOSE! I NEVER USED THEM!'],
      shitty: ['OW! YOU REEK OF SIN!', 'LORD! SMITE THE STINKY ONE!'],
      nude: ['OW! COVER YOUR SHAME, SON!', 'LORD! STRIKE ME BLIND! PLEASE!'],
    },
    taunt: {
      clean: ['THE MORAL MAJORITY WILL HEAR OF THIS!', 'YOU WILL BURN! LOW! WHERE IT HURTS!'],
      shitty: ['CLEANLINESS IS NEXT TO GODLINESS! YOU ARE NEXT TO NOTHING!', 'YOU WILL BURN! THE SMELL WILL TOO!'],
      nude: ['NAKED AND UNREPENTANT! I DECLARE A BOYCOTT!', "YOU WILL BURN! I'LL BRING MARSHMALLOWS!"],
    },
    attack: {
      clean: ['TAKE THE GOOD BOOK!', 'COLLECTION! TIME! FOR VENGEANCE!'],
      shitty: ['TAKE THE GOOD BOOK! WASH UP AFTER!', 'COLLECTION PLATE! FOR THE SMELL!'],
      nude: ['TAKE THE GOOD BOOK! COVER UP WITH IT!', 'COLLECTION PLATE! HOLD IT DOWN THERE!'],
    },
  }),
  limbaugh: set('m2.cartoon.limbaugh', { slapstick: true }, {
    scream: {
      clean: ['OOOOF! DITTOS! NO! NO DITTOS!', 'HNNNG! TALENT ON LOAN FROM NOBODY NOW!'],
      shitty: ['OOOOF! A DIRTY FOOT! THIS IS LIBERAL BIAS!', 'HNNNG! SOMEBODY TAKE THIS CALLER OFF THE AIR!'],
      nude: ['OOOOF! A NAKED HIPPIE KICKED ME!', 'HNNNG! THAT IS NOT FAMILY RADIO!'],
    },
    hurt: {
      clean: ["OW! THAT'S GONNA BE THREE HOURS ON THE SHOW!", 'MY VOICE! MY GOLDEN EIB VOICE! SQUEAKY!'],
      shitty: ['OW! YOU SMELL LIKE A CALL-IN SEGMENT!', "MY VOICE! AND YOUR SMELL! WE'RE GOING TO COMMERCIAL!"],
      nude: ['OW! YOU CAN SEE THOSE ON THE RADIO!', 'MY VOICE! I SOUND LIKE A FEMINAZI!'],
    },
    taunt: {
      clean: ['I AM STILL RIGHT ABOUT EVERYTHING! IN A HIGHER KEY!', 'YOU JUST KICKED THE VOICE OF AMERICA!'],
      shitty: ['THE STINK IS LIBERAL! I CAN SMELL IT!', 'YOU JUST SHIT ON THE VOICE OF AMERICA!'],
      nude: ['NAKED! TYPICAL! TYPICAL!', 'PUT IT AWAY! THIS IS A FAMILY SHOW!'],
    },
    attack: {
      clean: ['MEGA DITTOS!', 'TAKE THAT, CALLER!'],
      shitty: ['MEGA DITTOS! STINKY!', 'TAKE THAT, SMELLY CALLER!'],
      nude: ['MEGA DITTOS! NUDIST!', 'TAKE THAT, NAKED CALLER!'],
    },
  }),
  dole: set('m2.cartoon.dole', { slapstick: true }, {
    scream: {
      clean: ['OOOOF! BOB DOLE\'S NUTS! BOB DOLE\'S!', 'HNNNG! BOB DOLE DID NOT SEE THAT COMING!'],
      shitty: ['OOOOF! A DIRTY FOOT IN BOB DOLE\'S NUTS!', 'HNNNG! BOB DOLE SMELLS IT!'],
      nude: ['OOOOF! A NAKED MAN KICKED BOB DOLE!', 'HNNNG! BOB DOLE SAW YOUR JUNK!'],
    },
    hurt: {
      clean: ['OW! BOB DOLE IS HURT! BOB DOLE!', 'BOB DOLE NEEDS A MINUTE!'],
      shitty: ['OW! BOB DOLE SMELLS YOU!', 'BOB DOLE NEEDS A NOSE CLIP!'],
      nude: ['OW! BOB DOLE WANTS YOU TO PUT PANTS ON!', 'BOB DOLE NEEDS NEW EYES!'],
    },
    taunt: {
      clean: ['BOB DOLE IS STILL RUNNING! LIMPING!', 'BOB DOLE WILL GET YOU! BOB DOLE!'],
      shitty: ['BOB DOLE DOES NOT SHIT HIMSELF! BOB DOLE!', 'BOB DOLE WILL GET YOU! AFTER YOU WASH!'],
      nude: ['BOB DOLE WEARS PANTS! BOB DOLE!', 'BOB DOLE WILL GET YOU! COVER UP!'],
    },
    attack: {
      clean: ['BOB DOLE!', 'THIS ONE IS FROM BOB DOLE!'],
      shitty: ['BOB DOLE! STINKY!', 'THIS ONE IS FROM BOB DOLE! HOLD YOUR NOSE!'],
      nude: ['BOB DOLE! NUDIE!', 'THIS ONE IS FROM BOB DOLE! PANTS ON!'],
    },
  }),
  newt: set('m2.cartoon.newt', { slapstick: true }, {
    scream: {
      clean: ['OOOOF! THAT WAS NOT IN THE CONTRACT WITH AMERICA!', 'HNNNG! MY REVOLUTION!'],
      shitty: ['OOOOF! A DIRTY BOOT! SHUT THE GOVERNMENT DOWN!', 'HNNNG! THAT SMELL! THAT KICK!'],
      nude: ['OOOOF! A NAKED MAN! IN THE PEOPLE\'S HOUSE!', 'HNNNG! I SAW HIS LINE ITEMS!'],
    },
    hurt: {
      clean: ['OW! I DEMAND A RECOUNT OF MY NUTS!', 'MY NUTS! A GOVERNMENT SHUTDOWN!'],
      shitty: ['OW! YOU SMELL LIKE A COMMITTEE!', 'MY NUTS! AND MY NOSE! BOTH SHUT DOWN!'],
      nude: ['OW! THAT IS INDECENT EXPOSURE ON FEDERAL PROPERTY!', 'MY NUTS! YOUR NUTS! ALL OUT IN THE OPEN!'],
    },
    taunt: {
      clean: ['I WILL CUT YOU! LIKE A BUDGET!', 'TEN POINTS! ALL OF THEM REVENGE!'],
      shitty: ['I WILL CUT YOU! I WILL CUT YOUR SMELL!', 'TEN POINTS! ALL OF THEM SOAP!'],
      nude: ['I WILL CUT YOU! START WITH WHAT IS OUT!', 'TEN POINTS! ALL OF THEM PANTS!'],
    },
    attack: {
      clean: ['CONTRACT ON YOU!', 'REVOLUTION!'],
      shitty: ['CONTRACT ON THE STINKY ONE!', 'REVOLUTION! HOLD YOUR NOSE!'],
      nude: ['CONTRACT ON THE NUDIST!', 'REVOLUTION! COVER UP!'],
    },
  }),
};

/** Every one of them, by voice (recorded: upgrades/lines.ts). */
export const CRUSHED_VOICE_LINES: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = { meathead: [] };
  const all = (p: CrushPants) => [...p.clean, ...p.shitty, ...p.nude];
  out.meathead.push(...all(MEATHEAD_CHEAP));
  for (const s of Object.values(CRUSHED)) (out[s.voice] ??= []).push(...all(s.scream), ...all(s.hurt), ...all(s.taunt), ...all(s.attack));
  return out;
})();
